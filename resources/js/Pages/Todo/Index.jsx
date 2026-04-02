import { useForm, router, usePage, Head } from '@inertiajs/react';
import TopNav from '../../Components/TopNav';

function TodoItem({ todo, onToggle, onDelete }) {
    return (
        <li className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm">
            <button
                onClick={() => onToggle(todo)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    todo.completed
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 hover:border-blue-400'
                }`}
                aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
                {todo.completed && (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </button>

            <span
                className={`flex-1 text-gray-800 ${
                    todo.completed ? 'line-through text-gray-400' : ''
                }`}
            >
                {todo.title}
            </span>

            <button
                onClick={() => onDelete(todo)}
                className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                aria-label="Delete todo"
            >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </li>
    );
}

function AddTodoForm({ onSubmit, data, setData, processing, errors }) {
    return (
        <>
            <form onSubmit={onSubmit} className="mb-6 flex gap-2">
                <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="What needs to be done?"
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 transition-colors"
                >
                    Add
                </button>
            </form>
            {errors.title && (
                <p className="mb-4 text-sm text-red-500">{errors.title}</p>
            )}
        </>
    );
}

export default function Index({ todos }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('todos.store'), {
            onSuccess: () => reset('title'),
        });
    }

    function toggleComplete(todo) {
        router.patch(route('todos.update', todo.id));
    }

    function deleteTodo(todo) {
        router.delete(route('todos.destroy', todo.id));
    }

    const remaining = todos.filter((t) => !t.completed).length;

    return (
        <>
            <Head title="My Todos" />
            <div className="min-h-screen bg-gray-50">
                {user && <TopNav user={user} maxWidth="max-w-lg" />}

                <div className="py-12">
                    <div className="mx-auto max-w-lg px-4">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h1 className="text-4xl font-bold text-gray-800">My Todos</h1>
                            <p className="mt-2 text-gray-500">
                                {remaining} task{remaining !== 1 ? 's' : ''} remaining
                            </p>
                        </div>

                        {/* Add Todo Form */}
                        <AddTodoForm
                            onSubmit={handleSubmit}
                            data={data}
                            setData={setData}
                            processing={processing}
                            errors={errors}
                        />

                        {/* Todo List */}
                        {todos.length === 0 ? (
                            <div className="rounded-lg bg-white p-8 text-center text-gray-400 shadow-sm">
                                No todos yet. Add one above!
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {todos.map((todo) => (
                                    <TodoItem
                                        key={todo.id}
                                        todo={todo}
                                        onToggle={toggleComplete}
                                        onDelete={deleteTodo}
                                    />
                                ))}
                            </ul>
                        )}

                        {/* Footer summary */}
                        {todos.length > 0 && (
                            <div className="mt-4 flex justify-between text-sm text-gray-400">
                                <span>{todos.filter((t) => t.completed).length} completed</span>
                                <span>{todos.length} total</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
