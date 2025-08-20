require("dotenv").config();
const http = require("http");

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "backend-bootstrap",
        time: new Date().toISOString(),
      })
    );
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("College Site v4 Backend - Bootstrap (Day 1)");
});

server.listen(PORT, () => {
  console.log(`Bootstrap server running at http://localhost:${PORT}`);
});
