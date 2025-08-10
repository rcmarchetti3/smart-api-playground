// The page component is async so we can fetch data server-side
export default async function Home() {
  // Read the backend URL from the environment variable
  const api = process.env.NEXT_PUBLIC_API_URL!;

  // Fetch the runs list from the backend API
  const res = await fetch(api + "/runs", { cache: "no-store" });
  const data = await res.json();

  return (
    <main style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h1>Smart API Playground</h1>

      {/* Form to add a new run */}
      <form action={api + "/runs"} method="post" style={{ marginBottom: 24 }}>
        <input
          name="note"
          placeholder="note"
          style={{ marginRight: 8, padding: 4 }}
        />
        <button formMethod="post" style={{ padding: "4px 8px" }}>
          Add Run
        </button>
      </form>

      {/* Display the runs list */}
      <h2>Run History</h2>
      {data.runs && data.runs.length > 0 ? (
        <ul>
          {data.runs.map((run: any) => (
            <li key={run.id}>
              {new Date(run.created_at).toLocaleString()} — {run.note}
            </li>
          ))}
        </ul>
      ) : (
        <p>No runs yet. Add one above!</p>
      )}
    </main>
  );
}