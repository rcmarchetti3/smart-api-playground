// The page component is async so we can fetch data server-side
import DeleteButton from "./DeleteButton";
import RunForm from "./RunForm";

export default async function Home() {
  // Read the backend URL from the environment variable
  const api = process.env.NEXT_PUBLIC_API_URL!;

  let data: any = { runs: [] };
  try {
    const res = await fetch(api + "/runs", { cache: "no-store" });
    if (!res.ok) throw new Error(`API ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error("Error fetching runs:", err);
  }

  return (
    <main style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h1>Smart API Playground</h1>

      {/* Form to add a new run */}
      <RunForm api={api} />

      {/* Display the runs list */}
      <h2>Run History</h2>
      {data.runs && data.runs.length > 0 ? (
        <ul>
          {data.runs.map((run: any) => (
            <li key={run.id}>
              {new Date(run.created_at).toLocaleString()} — {run.note ?? "—"}
              <DeleteButton api={api} runId={run.id} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No runs yet. Add one above!</p>
      )}
    </main>
  );
}