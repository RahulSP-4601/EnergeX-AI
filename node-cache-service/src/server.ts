// node-cache-service/src/server.ts
import app from "./app";

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`node-cache-service listening on :${port}`);
});
