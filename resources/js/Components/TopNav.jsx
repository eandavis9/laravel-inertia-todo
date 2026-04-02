import { Link, router } from '@inertiajs/react';
import RoleBadge from './RoleBadge';

export default function TopNav({ user, maxWidth = 'max-w-4xl' }) {
    function handleLogout() {
        router.post(route('logout'));
    }

    return (
        <nav className="bg-white shadow-sm">
            <div className={`mx-auto ${maxWidth} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800">{user.name}</span>
                    <RoleBadge role={user.role} />
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={route('dashboard')}
                        className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        Dashboard
                    </Link>
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
