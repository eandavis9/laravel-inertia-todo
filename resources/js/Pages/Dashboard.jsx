import { usePage, Link, Head, router } from '@inertiajs/react';

const ROLE_BADGE_COLORS = {
    admin: 'bg-red-100 text-red-700',
    teacher: 'bg-purple-100 text-purple-700',
    student: 'bg-green-100 text-green-700',
};

function RoleBadge({ role }) {
    const colorClass = ROLE_BADGE_COLORS[role] ?? 'bg-gray-100 text-gray-700';
    return (
        <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${colorClass}`}>
            {role}
        </span>
    );
}

function AdminContent() {
    return (
        <div className="rounded-lg bg-white px-6 py-6 shadow-sm">
            <p className="text-gray-600 mb-4">You have full access to all features.</p>
            <div className="flex flex-wrap gap-3">
                <Link
                    href={route('todos.index')}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                >
                    Manage Todos
                </Link>
                <Link
                    href={route('dashboard')}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                >
                    Manage Users
                </Link>
            </div>
        </div>
    );
}

function TeacherContent() {
    return (
        <div className="rounded-lg bg-white px-6 py-6 shadow-sm">
            <p className="text-gray-600 mb-4">You can manage student records and your profile.</p>
            <div className="flex flex-wrap gap-3">
                <Link
                    href={route('todos.index')}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                >
                    My Todos
                </Link>
            </div>
        </div>
    );
}

function StudentContent() {
    return (
        <div className="rounded-lg bg-white px-6 py-6 shadow-sm">
            <p className="text-gray-600 mb-4">You can view your records and profile.</p>
            <div className="flex flex-wrap gap-3">
                <Link
                    href={route('todos.index')}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                >
                    My Todos
                </Link>
            </div>
        </div>
    );
}

function RoleContent({ role }) {
    if (role === 'admin') return <AdminContent />;
    if (role === 'teacher') return <TeacherContent />;
    return <StudentContent />;
}

function TopNav({ user }) {
    function handleLogout() {
        router.post(route('logout'));
    }

    return (
        <nav className="bg-white shadow-sm">
            <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800">{user.name}</span>
                    <RoleBadge role={user.role} />
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={route('todos.index')}
                        className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        Todos
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
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

                    {/* Quick stats card */}
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
