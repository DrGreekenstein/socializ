async function TasksPage() {
  const response = await fetch("/api/tasks", { method: "GET" });
  const tasks = await response.json();

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <ul className="space-y-2">
        {tasks && tasks.length > 0 ? (
          tasks.map((task: { id: string; title: string }) => (
            <li key={task.id} className="border rounded p-2 bg-white shadow">
              {task.title}
            </li>
          ))
        ) : (
          <li className="text-gray-500">No tasks found.</li>
        )}
      </ul>
    </main>
  ); 
}

export default TasksPage;

