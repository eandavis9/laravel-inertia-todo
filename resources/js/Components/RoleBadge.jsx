const ROLE_BADGE_COLORS = {
    admin: 'bg-red-100 text-red-700',
    teacher: 'bg-purple-100 text-purple-700',
    student: 'bg-green-100 text-green-700',
};

export default function RoleBadge({ role }) {
    const colorClass = ROLE_BADGE_COLORS[role] ?? 'bg-gray-100 text-gray-700';
    return (
        <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${colorClass}`}>
            {role}
        </span>
    );
}
