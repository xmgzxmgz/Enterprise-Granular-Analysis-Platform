const http = require("http");

const port = 8080;

const server = http.createServer((req, res) => {
  // Set CORS headers to allow requests from frontend (usually handled by proxy, but good for direct dev)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      message: "Backend service is running",
      timestamp: new Date().toISOString(),
    })
  );
});

server.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}/`);
  console.log("Hot debugging enabled via node-dev");
});
