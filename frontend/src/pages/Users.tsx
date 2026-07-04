export default function Users() {
  return (
    <div className="flex flex-col p-8 max-w-6xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-white mb-6">Users</h1>
      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
        <p className="text-gray-400">This page is only accessible to admins.</p>
      </div>
    </div>
  );
}
