import 'dotenv/config';
import express from "express";
import cors from "cors";
import { Pool } from "pg";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB pool (Render Postgres needs SSL)
const connectionString = process.env.DATABASE_URL;
let pool: Pool | null = null;
if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}

// Health check
app.get("/ping", async (_req, res) => {
  try {
    const dbTime = pool
      ? (await pool.query("select now() as now")).rows[0].now
      : null;
    res.json({ ok: true, message: "pong", db_time: dbTime });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- NEW ROUTES ---

// Create a run
app.post("/runs", async (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not configured" });

  const note = (req.body?.note ?? "").toString();
  try {
    const result = await pool.query(
      "insert into runs (note) values ($1) returning id, created_at, note",
      [note]
    );
    res.status(201).json({ ok: true, run: result.rows[0] });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// List recent runs
app.get("/runs", async (_req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not configured" });

  try {
    const result = await pool.query(
      "select id, created_at, note from runs order by created_at desc limit 20"
    );
    res.json({ ok: true, runs: result.rows });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on ${port}`));