// LiveCQServer.js
import express from "express";
import Stream from "node-rtsp-stream";
import fetch from "node-fetch"; // node 18 이상이면 기본 내장됨
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

let stream; // 현재 실행 중인 스트림 인스턴스 저장

// 🔹 스트림 시작 함수
function startStream(rtspUrl) {
  if (!rtspUrl) {
    console.error("RTSP URL이 비어 있습니다!");
    return;
  }

  // 기존 스트림 중지
  if (stream) {
    console.log("기존 스트림 중지");
    stream.stop();
  }

  console.log("새 스트림 시작:", rtspUrl);

  stream = new Stream({
    name: "camera",
    streamUrl: rtspUrl,
    wsPort: 4002,
    ffmpegOptions: {
      "-stats": "",
      "-r": 25,
      "-f": "mpegts",
      "-codec:v": "mpeg1video",
      "-bf": 0,
    },
  });
}

// Spring Boot 서버에서 RTSP URL 받아오기
async function fetchCameraUrlFromSpring() {
  try {
    console.log("Spring Boot 서버에서 카메라 주소 요청 중...");

    const response = await fetch("http://58.79.238.184:4000/setting/videoURL/get");
    if (!response.ok) throw new Error("Spring Boot 요청 실패");

    const rtspUrl = await response.text(); // ← String 반환
    console.log("카메라 주소 수신:", rtspUrl);

    startStream(rtspUrl);
  } catch (error) {
    console.error("카메라 주소 요청 실패:", error.message);
  }
}

// Node.js API (Spring에서 URL 변경 요청할 때 사용 가능)
app.post("/video/set/url", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: "Missing RTSP URL" });

  startStream(url);
  res.json({ message: "Stream updated", url });
});

// 서버 시작 시 1회 실행
app.listen(4001, async () => {
  console.log("Node.js Control API: http://localhost:4001");
  console.log("WebSocket stream running on ws://localhost:4002");

  await fetchCameraUrlFromSpring(); // 여기서 Spring Boot로 요청
});
