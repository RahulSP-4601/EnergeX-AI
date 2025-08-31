// src/app.ts
import express from "express";
import redis from "./redisClient";

const app = express();
app.use(express.json());

// GET /cache/posts
app.get("/cache/posts", async (_req, res) => {
  const cached = await redis.get("posts");
  if (cached) {
    return res.set("x-cache", "HIT").json(JSON.parse(cached));
  }
  // fallback to DB mock
  const posts = [{ id: 1, title: "Hello", content: "World" }];
  await redis.set("posts", JSON.stringify(posts));
  return res.set("x-cache", "MISS").json(posts);
});

// GET /cache/posts/:id
app.get("/cache/posts/:id", async (req, res) => {
  const id = req.params.id;
  const cached = await redis.get(`post:${id}`);
  if (cached) {
    return res.set("x-cache", "HIT").json(JSON.parse(cached));
  }
  // fallback DB mock
  const post = { id: Number(id), title: "Title " + id, content: "Body " + id };
  await redis.set(`post:${id}`, JSON.stringify(post));
  return res.set("x-cache", "MISS").json(post);
});

export default app;
