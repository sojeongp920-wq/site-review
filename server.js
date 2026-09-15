require("dotenv").config();
const VWORLD_API_KEY = process.env.VWORLD_API_KEY;
const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

if (url.pathname === "/api/address-search") {
  const query = url.searchParams.get("query");

  if (!query) {
    res.writeHead(400, {
      "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify({
      error: "주소가 없습니다."
    }));

    return;
  }

  const apiUrl =
    `https://api.vworld.kr/req/search?service=search` +
    `&request=search` +
    `&version=2.0` +
    `&crs=EPSG:4326` +
    `&size=10` +
    `&page=1` +
    `&query=${encodeURIComponent(query)}` +
    `&type=address` +
    `&category=parcel` +
    `&format=json` +
    `&key=${VWORLD_API_KEY}`;

  fetch(apiUrl)
    .then(response => response.text())
    .then(data => {
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8"
      });

      res.end(JSON.stringify(data));
    })
    .catch(error => {
      console.error(error);

      res.writeHead(500, {
        "Content-Type": "application/json; charset=utf-8"
      });

      res.end(JSON.stringify({
        error: "VWorld 주소 조회 중 오류가 발생했습니다."
      }));
    });

  return;
}
  let filePath = "";

  if (req.url === "/" || req.url === "/index.html") {
    filePath = path.join(__dirname, "index.html");
  } else if (req.url === "/style.css") {
    filePath = path.join(__dirname, "style.css");
  } else if (req.url === "/script.js") {
    filePath = path.join(__dirname, "script.js");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("페이지를 찾을 수 없습니다.");
    return;
  }

  const ext = path.extname(filePath);

  let contentType = "text/plain; charset=utf-8";

  if (ext === ".html") {
    contentType = "text/html; charset=utf-8";
  } else if (ext === ".css") {
    contentType = "text/css; charset=utf-8";
  } else if (ext === ".js") {
    contentType = "text/javascript; charset=utf-8";
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("파일을 불러오는 중 오류가 발생했습니다.");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
 console.log(`서버 실행 중: http://localhost:${PORT}`);
});
console.log(
  "VWorld API 키:",
  VWORLD_API_KEY ? "정상 로드됨" : "키 없음"
);

  