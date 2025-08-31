import request from "supertest";
import app from "../src/app";
import redis from "../src/redisClient";

beforeEach(async () => {
  await redis.flushall(); // clear redis before each test
});

describe("Cache API", () => {
  it("should fetch all posts (MISS first, then HIT)", async () => {
    const miss = await request(app).get("/cache/posts");
    expect(miss.status).toBe(200);
    expect(miss.headers["x-cache"]).toBe("MISS");
    expect(Array.isArray(miss.body)).toBe(true);

    const hit = await request(app).get("/cache/posts");
    expect(hit.status).toBe(200);
    expect(hit.headers["x-cache"]).toBe("HIT");
  });

  it("should fetch a single post (MISS then HIT)", async () => {
    const miss = await request(app).get("/cache/posts/1");
    expect(miss.status).toBe(200);
    expect(miss.headers["x-cache"]).toBe("MISS");
    expect(miss.body).toHaveProperty("id", 1);

    const hit = await request(app).get("/cache/posts/1");
    expect(hit.status).toBe(200);
    expect(hit.headers["x-cache"]).toBe("HIT");
    expect(hit.body).toHaveProperty("id", 1);
  });
});
