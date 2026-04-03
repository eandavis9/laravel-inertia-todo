# Deployment Guide

Laravel 13 + Inertia.js + React Todo App — AWS EC2 Free Tier via Docker

## Architecture

```
GitHub (main branch)
  → GitHub Actions: test → build → push to ECR → SSH deploy

EC2 t2.micro (Amazon Linux 2023, ap-southeast-1)
  └── Docker container
        ├── Supervisor (PID 1)
        │     ├── Nginx :80
        │     └── PHP-FPM :9000
        └── Laravel 13 + Inertia v3 + React 19

Volume: /mnt/data/sqlite/ → /var/www/html/database/
  └── database.sqlite

ECR: laravel-inertia-todo (ap-southeast-1, ≤3 images)
```

---

## Prerequisites

- AWS account (free tier)
- GitHub repository with this code
- AWS CLI installed locally (`aws --version`)

---

## Step 1: AWS ECR Setup

Create the Docker image registry.

```bash
aws ecr create-repository \
  --repository-name laravel-inertia-todo \
  --region ap-southeast-1 \
  --image-scanning-configuration scanOnPush=true
```

Note the `repositoryUri` from the output — you'll need it later:
```
123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/laravel-inertia-todo
```

### ECR Lifecycle Policy

Add this policy to keep only the last 3 images and stay within the 500 MB free tier limit.

In the AWS Console: ECR → your repository → Lifecycle Policy → Create rule, or via CLI:

```json
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 3 tagged images",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["latest", "sha-"],
        "countType": "imageCountMoreThan",
        "countNumber": 3
      },
      "action": { "type": "expire" }
    },
    {
      "rulePriority": 2,
      "description": "Expire untagged images after 1 day",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 1
      },
      "action": { "type": "expire" }
    }
  ]
}
```

---

## Step 2: IAM User for GitHub Actions

Create a dedicated IAM user with minimal permissions for CI/CD.

**IAM Console → Users → Create user**
- Username: `github-actions-todo-deployer`
- Access type: Programmatic access only (no console access)

**Attach this inline policy** (replace `YOUR_ACCOUNT_ID`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRAuthToken",
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
      "Resource": "*"
    },
    {
      "Sid": "ECRPushPull",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage",
        "ecr:ListImages",
        "ecr:DescribeImages"
      ],
      "Resource": "arn:aws:ecr:ap-southeast-1:YOUR_ACCOUNT_ID:repository/laravel-inertia-todo"
    },
    {
      "Sid": "SSMDeploy",
      "Effect": "Allow",
      "Action": [
        "ssm:SendCommand",
        "ssm:GetCommandInvocation"
      ],
      "Resource": [
        "arn:aws:ssm:ap-southeast-1::document/AWS-RunShellScript",
        "arn:aws:ec2:ap-southeast-1:YOUR_ACCOUNT_ID:instance/*"
      ]
    }
  ]
}
```

Save the **Access Key ID** and **Secret Access Key** — you'll add them to GitHub Secrets.

---

## Step 3: EC2 Instance

### Launch

**EC2 Console → Launch Instance**

| Setting | Value |
|---|---|
| Name | `laravel-todo-prod` |
| AMI | Amazon Linux 2023 (free tier eligible) |
| Instance type | `t2.micro` |
| Key pair | Create new → `laravel-todo-keypair` → download `.pem` |
| Region | `ap-southeast-1` (Singapore) |
| Auto-assign public IP | Enabled |

### Security Group

Create `laravel-todo-sg` with these inbound rules:

| Type | Port | Source | Note |
|---|---|---|---|
| SSH | 22 | Your IP/32 | For your own access only — GitHub Actions does **not** use SSH |
| HTTP | 80 | 0.0.0.0/0 | Public web traffic |

> GitHub Actions deploys via AWS SSM — no inbound SSH rule needed for CI/CD.

### EC2 Instance Role

The EC2 instance needs two permissions: pull images from ECR, and accept SSM commands from GitHub Actions.

1. IAM → Roles → Create Role → EC2 trusted entity
2. Attach these managed policies:
   - `AmazonEC2ContainerRegistryReadOnly`
   - `AmazonSSMManagedInstanceCore`
3. Name: `EC2ECRReadOnlyRole`
4. EC2 Console → your instance → Actions → Security → Modify IAM Role → attach `EC2ECRReadOnlyRole`

---

## Step 4: GitHub Secrets

**Repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key ID |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret access key |
| `EC2_INSTANCE_ID` | Your EC2 instance ID (e.g. `i-0f84d60bba444de71`) |

> `EC2_HOST` and `EC2_SSH_PRIVATE_KEY` are no longer needed — deployment uses AWS SSM, not SSH.

---

## Step 5: First-Time EC2 Bootstrap

Run these commands once after launching the EC2 instance.

### 5.1 Connect via SSH

```bash
chmod 400 laravel-todo-keypair.pem
ssh -i laravel-todo-keypair.pem ec2-user@YOUR_EC2_IP
```

### 5.2 Install Docker

```bash
sudo dnf update -y
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

# Install Docker Compose V2 plugin (not available in AL2023 default repos)
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

# Log out and back in for group membership to take effect
exit
```

```bash
ssh -i laravel-todo-keypair.pem ec2-user@YOUR_EC2_IP

# Verify
docker --version
docker compose version
```

### 5.3 Create SQLite Persistence Directory

```bash
sudo mkdir -p /mnt/data/sqlite
sudo chown ec2-user:ec2-user /mnt/data/sqlite
```

### 5.4 Create App Directory and .env

```bash
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

cat > .env << 'EOF'
ECR_REGISTRY=123456789012.dkr.ecr.ap-southeast-1.amazonaws.com
ECR_REPOSITORY=laravel-inertia-todo
IMAGE_TAG=latest
APP_KEY=
APP_URL=http://YOUR_EC2_PUBLIC_IP
EOF

chmod 600 .env
```

### 5.5 Copy docker-compose.yml to EC2

From your **local machine** (separate terminal):

```bash
scp -i laravel-todo-keypair.pem docker-compose.yml ec2-user@YOUR_EC2_IP:/home/ec2-user/app/
```

### 5.6 Trigger the First GitHub Actions Build

**Before pulling the image, you must push it to ECR.** The ECR repository is empty until GitHub Actions runs for the first time. Push to `main` to trigger the pipeline:

```bash
# On your local machine
git add .
git commit -m "add docker deployment setup"
git push origin main
```

Then watch the **Actions** tab in GitHub. Wait for all 3 jobs (Test → Build & Push → Deploy) to pass.

> **Note:** The Deploy job will fail on first run because the EC2 bootstrap isn't complete yet — that's expected. What matters is that the **Build & Push** job succeeds so the image exists in ECR.

### 5.7 Pull Image and Generate APP_KEY

Once the Build & Push job has completed successfully:

```bash
cd /home/ec2-user/app

# Authenticate Docker with ECR — required even with EC2 Instance Role
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

# Pull the latest image
docker compose pull

# Generate a Laravel app key
docker run --rm \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/laravel-inertia-todo:latest \
  php artisan key:generate --show
# Output: base64:xxxxxxxxxxxxxxxxxxxx=

# Paste the key into .env
nano .env
# Edit: APP_KEY=base64:xxxxxxxxxxxxxxxxxxxx=
```

> Replace `YOUR_ACCOUNT_ID` with your actual AWS account ID (visible in the top-right of the AWS Console, or run `aws sts get-caller-identity --query Account --output text`).

### 5.8 First Boot (after image pull succeeds)

```bash
cd /home/ec2-user/app

# Create the SQLite database file
touch /mnt/data/sqlite/database.sqlite
chmod 664 /mnt/data/sqlite/database.sqlite

# Start the container
docker compose up -d

# Run database migrations
docker compose exec app php artisan migrate --force

# Cache config/routes/views for production performance
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache

# Health check
curl http://localhost/up
# Expected: {"status":"up"}
```

---

## Step 6: Deploy

Push to the `main` branch — GitHub Actions handles everything automatically:

1. Runs PHP tests against in-memory SQLite
2. Builds the Docker image (multi-stage: Node 22 for Vite assets, PHP 8.4-fpm-alpine)
3. Pushes to ECR with `:latest` and `:sha-<commit>` tags
4. SSHes into EC2, pulls the new image, restarts the container
5. Runs `php artisan migrate --force`
6. Caches config, routes, and views
7. Runs a health check against `/up`

```bash
git push origin main
```

Monitor progress in the **Actions** tab of your GitHub repository.

---

## Verification Checklist

After first deploy, verify each of the following:

- [ ] `curl http://YOUR_EC2_IP/up` returns `{"status":"up"}`
- [ ] `curl -I http://YOUR_EC2_IP/` returns `302 → /login`
- [ ] Browser: `http://YOUR_EC2_IP/register` — registration form loads
- [ ] Register a user, log in, create a todo, toggle it, delete it
- [ ] `docker compose logs app` — no PHP errors
- [ ] `docker compose exec app php artisan migrate:status` — all migrations show `Ran`
- [ ] EC2 Security Group: SSH port 22 is restricted to your IP only

---

## Common Commands

```bash
# View container logs
docker compose logs -f app

# Check container status
docker compose ps

# Run artisan commands
docker compose exec app php artisan <command>

# Restart the container
docker compose restart app

# Pull and redeploy manually
docker compose pull && docker compose up -d

# Check memory usage
docker stats
```

---

## Notes

- **APP_KEY**: Never regenerate on a live system — doing so invalidates all existing sessions.
- **SQLite**: Stored at `/mnt/data/sqlite/database.sqlite` on EC2. The `restart: unless-stopped` policy in docker-compose.yml ensures the container auto-starts after EC2 reboots.
- **HTTPS**: Not configured. To add it later, use AWS Certificate Manager with an Application Load Balancer, or install Certbot on the EC2 instance.
- **Free tier limits**: EC2 t2.micro is free for 750 hours/month (12 months). ECR is free for 500 MB/month. Monitor usage in the AWS Billing Dashboard.
