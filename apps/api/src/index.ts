// apps/api/src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { Pool } from "pg";

const app = express();

/**
 * CORS
 * - By default, allow all (easy for dev).
 * - If ALLOWED_ORIGINS is set (comma-separated), restrict to those.
 */
const allowedEnv = process.env.ALLOWED_ORIGINS?.split(",").map(s => s.trim()).filter(Boolean) ?? [];
if (allowedEnv.length > 0) {
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || allowedEnv.includes(origin)) return cb(null, true);
        cb(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "DELETE", "OPTIONS"],
    })
  );
} else {
  app.use(cors());
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * DB pool (Render Postgres needs SSL)
 */
const connectionString = process.env.DATABASE_URL;
let pool: Pool | null = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
} else {
  console.warn("[api] DATABASE_URL not set — DB routes will 500");
}

/**
 * Health check
 */
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

/**
 * GET /runs — list recent runs
 */
app.get("/runs", async (_req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not configured" });

  try {
    const result = await pool.query(
      "select id, created_at, note from runs order by created_at desc limit 50"
    );
    res.json({ ok: true, runs: result.rows });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * POST /runs — create a run
 */
app.post("/runs", async (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not configured" });

  const note = (req.body?.note ?? "").toString().trim();
  if (!note) return res.status(400).json({ ok: false, error: "note is required" });
  if (note.length > 500) return res.status(413).json({ ok: false, error: "note too long" });

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

/**
 * DELETE /runs/:id — delete a run
 */
app.delete("/runs/:id", async (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not configured" });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: "bad id" });

  try {
    const result = await pool.query("delete from runs where id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ ok: false, error: "not found" });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on ${port}`);
  if (allowedEnv.length > 0) {
    console.log(`CORS allowed origins: ${allowedEnv.join(", ")}`);
  } else {
    console.log("CORS: * (open)");
  }
});