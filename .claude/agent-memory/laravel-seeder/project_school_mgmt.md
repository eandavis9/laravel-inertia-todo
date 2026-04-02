---
name: School Management System Context
description: Project is a Laravel 13 + Inertia.js + React app being built into a school management system with role-based users
type: project
---

This project started as a generic Laravel + Inertia.js todo app (initial commit) and is being developed into a school management system.

The User model has three roles: `admin`, `teacher`, `student`. The `role` column (string, default 'student') is being added via a new migration separate from the original `create_users_table` migration.

Known seed credentials for development:
- Admin: admin@school.com / password
- Teachers: john.smith@school.com, jane.doe@school.com, bob.wilson@school.com / password (all)
- Students: 10 random factory-generated users

**Why:** School management context requires role-based access; known credentials allow easy login during development.

**How to apply:** When adding new features, consider the three-role hierarchy (admin > teacher > student). Seed data should respect this and use `firstOrCreate` on email for idempotency.
