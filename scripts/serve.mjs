import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stat, readFile } from "node:fs/promises";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT must be between 1 and 65535");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
};
http
  .createServer(async (req, res) => {
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end();
      return;
    }
    try {
      const requestPath = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      const candidate = path.resolve(root, "." + requestPath);
      if (candidate !== root && !candidate.startsWith(root + path.sep)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      const info = await stat(candidate);
      const target = info.isDirectory()
        ? path.join(candidate, "index.html")
        : candidate;
      const body = await readFile(target);
      res.writeHead(200, {
        "Content-Type":
          types[path.extname(target)] || "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch (error) {
      const status =
        error instanceof URIError
          ? 400
          : error.code === "ENOENT" || error.code === "ENOTDIR"
            ? 404
            : 500;
      res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(
        status === 404
          ? "Not found"
          : status === 400
            ? "Bad request"
            : "Server error",
      );
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Nhịp học: http://127.0.0.1:${port}`),
  );
