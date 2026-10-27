
// ... imports
export default function CaptainsDashboard() {
  const [showCredentials, setShowCredentials] = useState(false);
  // ... other states

  return (
    <div>
      {/* Button Section */}
      <div className="flex gap-4">
        <button onClick={() => setShowCredentials(!showCredentials)} className="px-5 py-3 bg-gray-200 rounded-xl font-bold">
          {showCredentials ? "Hide Passwords" : "View Passwords"}
        </button>
        <button onClick={() => setShowForm(true)} className="...">Add Captain</button>
      </div>

      {/* Credentials Table */}
      {showCredentials && (
        <div className="mb-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase">Captain</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase">Username</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase">Password</th>
              </tr>
            </thead>
            <tbody>
              {captains.map(c => (
                <tr key={c.id} className="border-b">
                  <td className="px-6 py-3 text-sm">{c.name}</td>
                  <td className="px-6 py-3 text-sm">{c.username || c.name.toLowerCase()}</td>
                  <td className="px-6 py-3 text-sm font-mono">{c.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* ... rest of file */}
    </div>
  );
}
```