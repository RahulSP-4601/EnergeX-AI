// src/redisClient.ts
import Redis from "ioredis";

const redis =
  process.env.NODE_ENV === "test"
    ? new (require("ioredis-mock"))()
    : new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
      });

export default redis;
