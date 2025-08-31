// apps/api/src/index.ts (with Zod validation + simple rate limit)
import "dotenv/config";
import express from "express";
import cors from "cors";
import { Pool } from "pg";
import morgan from "morgan";
// Zod schemas for request validation
import { ListQuerySchema, NoteSchema } from "./validation";

const app = express();
app.set("trust proxy", 1); // respect X-Forwarded-For behind proxies

/* -------- CORS (conditional) -------- */
const allowedEnv =
  process.env.ALLOWED_ORIGINS?.split(",").map(s => s.trim()).filter(Boolean) ?? [];

if (allowedEnv.length > 0) {
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || allowedEnv.includes(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    })
  );
} else {
  app.use(cors());
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------- Simple IP Rate Limit (free tier) -------- */
type Bucket = { count: number; resetAt: number };
const buckets: Map<string, Bucket> = new Map();
const RATE_ENABLED = (process.env.RATE_LIMIT_ENABLED ?? "true").toLowerCase() !== "false";
const RATE_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const RATE_MAX = Number(process.env.RATE_LIMIT_MAX ?? 60);

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!RATE_ENABLED) return next();
  if (req.path === "/ping") return next();
  // protect mutating endpoints by default
  const method = req.method.toUpperCase();
  const protect = method === "POST" || method === "PATCH" || method === "DELETE";
  if (!protect) return next();

  const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }
  if (bucket.count < RATE_MAX) {
    bucket.count += 1;
    return next();
  }
  const retryAfterSec = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));
  res.setHeader("Retry-After", String(retryAfterSec));
  return res.status(429).json({ ok: false, error: "Too many requests", retry_after_seconds: retryAfterSec });
}

app.use(rateLimit);

/* -------- DB -------- */
const connectionString = process.env.DATABASE_URL;
const pool = connectionString
  ? new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  : null;

/* -------- Helpers -------- */
const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const isInt = (s: string) => /^\d+$/.test(s);

/* -------- Landing (GET /) -------- */
app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
  <html>
    <head>
      <meta charset='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <title>Smart API Playground — API</title>
      <style>
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 24px; line-height: 1.5; }
        code { background: #f2f2f2; padding: 2px 6px; border-radius: 6px; }
        a { color: #059669; text-decoration: none; }
      </style>
    </head>
    <body>
      <h1>Smart API Playground — API</h1>
      <p>This is the backend API. Try <a href='/ping'><code>/ping</code></a> or <code>/runs</code> endpoints.</p>
      <ul>
        <li>GET <code>/ping</code> — health check</li>
        <li>GET <code>/runs?limit=20&offset=0&q=hello</code> — list runs</li>
        <li>POST <code>/runs</code> — create run ({ note })</li>
        <li>PATCH <code>/runs/:id</code> — update note</li>
        <li>DELETE <code>/runs/:id</code> — delete run</li>
      </ul>
    </body>
  </html>`);
});

/* -------- Health -------- */
app.get("/ping", async (_req, res) => {
  try {
    const dbTime = pool ? (await pool.query("select now() as now")).rows[0].now : null;
    res.json({ ok: true, message: "pong", db_time: dbTime });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});
// dev-only request logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
  console.log("[api] morgan enabled; NODE_ENV =", process.env.NODE_ENV);
}
/* -------- GET /runs (limit/offset/q) -------- */
app.get("/runs", async (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not configured" });
  const parsed = ListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }
  const { limit, offset, q } = parsed.data;

  try {
    const sql = q
      ? `select id, created_at, note from runs where note ilike $1 order by created_at desc limit $2 offset $3`
      : `select id, created_at, note from runs order by created_at desc limit $1 offset $2`;
    const params = q ? [`%${q}%`, limit, offset] : [limit, offset];
    const result = await pool.query(sql, params);
    res.json({ ok: true, runs: result.rows });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* -------- POST /runs -------- */
app.post("/runs", async (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not configured" });
  const parsed = NoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }
  const { note } = parsed.data;

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

/* -------- PATCH /runs/:id -------- */
app.patch("/runs/:id", async (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not configured" });

  const id = String(req.params.id ?? "").trim();
  if (!(isUuid(id) || isInt(id))) return res.status(400).json({ ok: false, error: "bad id" });

  const parsed = NoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }
  const { note } = parsed.data;

  const cast = isInt(id) ? "::int" : "::uuid";
  const idValue = isInt(id) ? Number(id) : id;

  try {
    const result = await pool.query(
      `update runs set note = $1 where id = $2${cast} returning id, created_at, note`,
      [note, idValue]
    );
    if (result.rowCount === 0) return res.status(404).json({ ok: false, error: "not found" });
    res.json({ ok: true, run: result.rows[0] });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* -------- DELETE /runs/:id -------- */
app.delete("/runs/:id", async (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not configured" });

  const id = String(req.params.id ?? "").trim();
  if (!isUuid(id)) return res.status(400).json({ ok: false, error: "bad id" });

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
});
