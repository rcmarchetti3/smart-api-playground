// apps/api/src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { Pool } from "pg";
import { z } from "zod";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

/* ----------------------------- Zod Schemas ----------------------------- */

const NoteSchema = z.object({
  note: z.string().trim().min(1, "note is required").max(500, "note too long"),
});

const RunsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  q: z.string().trim().max(200).optional(),
});

// allow UUID v1–v5 or a plain integer id (for older rows)
const IdParamSchema = z
  .string()
  .trim()
  .refine(
    (v) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v) ||
      /^\d+$/.test(v),
    "bad id"
  );

/* ------------------------------- App/CORS ------------------------------ */

const app = express();
// Security headers
app.use(helmet());
// Tiny request logs
app.use(morgan("tiny"));

const allowedEnv = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

if (allowedEnv.length > 0) {
  app.use(cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // allow curl/Postman/no-origin
      if (allowedEnv.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: false,
  }));
} else {
  app.use(cors());
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* --------------------------------- DB ---------------------------------- */

const connectionString = process.env.DATABASE_URL;
let pool: Pool | null = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Render PG requires SSL
  });
} else {
  console.warn("[api] DATABASE_URL not set — DB routes will 500");
}

/* -------------------------------- Routes -------------------------------- */

app.get("/ping", async (_req, res) => {
  try {
    const dbTime = pool ? (await pool.query("select now() as now")).rows[0].now : null;
    res.json({ ok: true, message: "pong", db_time: dbTime });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /runs?limit=&offset=&q=
app.get("/runs", async (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not configured" });

  const parsed = RunsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") });
  }

  const { limit, offset, q } = parsed.data;

  try {
    if (q) {
      const result = await pool.query(
        `select id, created_at, note
           from runs
          where note ilike $1
          order by created_at desc
          limit $2 offset $3`,
        [`%${q}%`, limit, offset]
      );
      return res.json({ ok: true, runs: result.rows });
    }

    const result = await pool.query(
      `select id, created_at, note
         from runs
        order by created_at desc
        limit $1 offset $2`,
      [limit, offset]
    );
    return res.json({ ok: true, runs: result.rows });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /runs
app.post("/runs", async (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not configured" });

  const parsed = NoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.issues[0].message });
  }

  try {
    const { note } = parsed.data;
    const result = await pool.query(
      `insert into runs (note) values ($1)
       returning id, created_at, note`,
      [note]
    );
    res.status(201).json({ ok: true, run: result.rows[0] });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PATCH /runs/:id
app.patch("/runs/:id", async (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not configured" });

  const idOk = IdParamSchema.safeParse(req.params.id);
  if (!idOk.success) return res.status(400).json({ ok: false, error: "bad id" });

  const bodyOk = NoteSchema.safeParse(req.body);
  if (!bodyOk.success) {
    return res.status(400).json({ ok: false, error: bodyOk.error.issues[0].message });
  }

  const raw = idOk.data;
  const isInt = /^\d+$/.test(raw);
  const cast = isInt ? "::int" : "::uuid";
  const idValue = isInt ? Number(raw) : raw;

  try {
    const result = await pool.query(
      `update runs
          set note = $1
        where id = $2${cast}
    returning id, created_at, note`,
      [bodyOk.data.note, idValue]
    );
    if (result.rowCount === 0) return res.status(404).json({ ok: false, error: "not found" });
    res.json({ ok: true, run: result.rows[0] });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// DELETE /runs/:id
app.delete("/runs/:id", async (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not configured" });

  const idOk = IdParamSchema.safeParse(req.params.id);
  if (!idOk.success) return res.status(400).json({ ok: false, error: "bad id" });

  const raw = idOk.data;
  const isInt = /^\d+$/.test(raw);
  const cast = isInt ? "::int" : "::uuid";
  const idValue = isInt ? Number(raw) : raw;

  try {
    const result = await pool.query(`delete from runs where id = $1${cast}`, [idValue]);
    if (result.rowCount === 0) return res.status(404).json({ ok: false, error: "not found" });
    return res.status(204).end();
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

const writeLimiter = rateLimit({
  windowMs: 60_000,      // 1 minute
  max: 30,               // 30 write requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

// apply to writes only
app.post("/runs", writeLimiter);
app.patch("/runs/:id", writeLimiter);
app.delete("/runs/:id", writeLimiter);

/* --------------------------------- Boot -------------------------------- */

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on ${port}`);
  if (allowedEnv.length > 0) console.log(`CORS allowed: ${allowedEnv.join(", ")}`);
  else console.log("CORS: * (open)");
});