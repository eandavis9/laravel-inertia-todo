import { usePage, Link, Head } from '@inertiajs/react';
import TopNav from '../Components/TopNav';

const ROLE_CONTENT = {
    admin: {
        description: 'You have full access to all features.',
        links: [
            { label: 'Manage Todos', href: 'todos.index', primary: true },
            { label: 'Manage Users', href: 'dashboard', primary: false },
        ],
    },
    teacher: {
        description: 'You can manage student records and your profile.',
        links: [{ label: 'My Todos', href: 'todos.index', primary: true }],
    },
    student: {
        description: 'You can view your records and profile.',
        links: [{ label: 'My Todos', href: 'todos.index', primary: true }],
    },
};

function RoleContent({ role }) {
    const content = ROLE_CONTENT[role] ?? ROLE_CONTENT.student;

    return (
        <div className="rounded-lg bg-white px-6 py-6 shadow-sm">
            <p className="text-gray-600 mb-4">{content.description}</p>
            <div className="flex flex-wrap gap-3">
                {content.links.map((link) => (
                    <Link
                        key={link.href + link.label}
                        href={route(link.href)}
                        className={
                            link.primary
                                ? 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors'
                                : 'rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors'
                        }
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-gray-50">
                <TopNav user={user} />

                <main className="mx-auto max-w-4xl px-4 py-12">
                    {/* Welcome banner */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-800">
                            Welcome back, {user.name}
                        </h1>
                        <p className="mt-2 text-gray-500">
                            You are logged in as{' '}
                            <span className="font-medium text-gray-700 capitalize">{user.role}</span>.
                        </p>
                    </div>

                    {/* Role-specific section */}
                    <div className="mb-8">
                        <h2 className="mb-3 text-lg font-semibold text-gray-700">
                            Your Access
                        </h2>
                        <RoleContent role={user.role} />
                    </div>

                    {/* Quick links card */}
                    <div className="rounded-lg bg-white px-6 py-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-700">Quick Links</h2>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route('todos.index')}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                View Todos
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
