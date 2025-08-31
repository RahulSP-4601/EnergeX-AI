import express from "express";
import "dotenv/config";
import redis from "./redis";
import { pool } from "./db";

const app = express();
const PORT = Number(process.env.PORT || 3001);
const TTL = Number(process.env.CACHE_TTL || 300);

const LIST_KEY = "posts:all";
const ITEM_PREFIX = "posts:id:";

app.get("/cache/posts", async (_req, res) => {
  try {
    const cached = await redis.get(LIST_KEY);
    if (cached) return res.type("application/json").send(cached);

    const [rows] = await pool.query("SELECT * FROM posts ORDER BY id DESC");
    const json = JSON.stringify(rows);
    await redis.setex(LIST_KEY, TTL, json);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

app.get("/cache/posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  const key = ITEM_PREFIX + id;
  try {
    const cached = await redis.get(key);
    if (cached) return res.type("application/json").send(cached);

    const [rows] = await pool.query("SELECT * FROM posts WHERE id = ?", [id]);
    const post = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (!post) return res.status(404).json({ error: "not_found" });

    const json = JSON.stringify(post);
    await redis.setex(key, TTL, json);
    res.json(post);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

app.listen(PORT, () => {
  console.log(`Node cache server listening on :${PORT}`);
});
