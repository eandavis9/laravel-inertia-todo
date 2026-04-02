<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreTodoRequest;
use App\Models\Todo;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TodoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Todo/Index', [
            'todos' => Todo::latest()->get(),
        ]);
    }

    public function store(StoreTodoRequest $request): RedirectResponse
    {
        Todo::create($request->validated());

        return redirect()->route('todos.index');
    }

    public function update(Todo $todo): RedirectResponse
    {
        $todo->update([
            'completed' => ! $todo->completed,
        ]);

        return redirect()->route('todos.index');
    }

    public function destroy(Todo $todo): RedirectResponse
    {
        $todo->delete();

        return redirect()->route('todos.index');
    }
}
