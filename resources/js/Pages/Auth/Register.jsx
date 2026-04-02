import { useForm, Link, Head } from '@inertiajs/react';

function FormField({ label, id, error, children }) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('register'));
    }

    return (
        <>
            <Head title="Register" />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-gray-800">Register</h1>
                        <p className="mt-2 text-gray-500">Create your account</p>
                    </div>

                    {/* Card */}
                    <div className="rounded-lg bg-white px-8 py-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <FormField label="Full Name" id="name" error={errors.name}>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    autoComplete="name"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Jane Smith"
                                />
                            </FormField>

                            <FormField label="Email Address" id="email" error={errors.email}>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    autoComplete="email"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="you@example.com"
                                />
                            </FormField>

                            <FormField label="Password" id="password" error={errors.password}>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="••••••••"
                                />
                            </FormField>

                            <FormField
                                label="Confirm Password"
                                id="password_confirmation"
                                error={errors.password_confirmation}
                            >
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="••••••••"
                                />
                            </FormField>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>
                    </div>

                    {/* Footer link */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link
                            href={route('login')}
                            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
