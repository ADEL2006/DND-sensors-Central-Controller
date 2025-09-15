import { useState, useEffect, useRef } from "react";

export function useRadarSocket(device) {
    const [wsStatus, setWsStatus] = useState("connecting...");
    const [dataArray, setDataArray] = useState([]);
    const wsRef = useRef(null);
    const hasConnected = useRef(false);

    // 🔹 재시도 타이머 관리용 ref
    const retryTimeout = useRef(null);

    const url_ws = device === "DND-500T" ? "ws://58.79.238.184:1883" : "ws://58.79.238.184:1884";

    useEffect(() => {
        function initWebSocket() {
            if (wsRef.current) {
                wsRef.current.close();  // 기존 연결 닫기
                wsRef.current = null;
            }

            const ws = new WebSocket(url_ws);
            wsRef.current = ws;

            ws.onopen = () => {
                setWsStatus("Connected");
                console.log("WebSocket Connected");
                hasConnected.current = true;

                // 🔹 기존 재시도 타이머 있으면 제거
                if (retryTimeout.current) {
                    clearTimeout(retryTimeout.current);
                    retryTimeout.current = null;
                }
            };

            ws.onclose = (e) => {
                console.log("WebSocket Disconnected:", e.reason);
                wsRef.current = null;
                if (!hasConnected.current) {
                    setWsStatus("connecting...");

                    // 🔹 중복 재시도 방지
                    if (!retryTimeout.current) {
                        retryTimeout.current = setTimeout(() => {
                            initWebSocket();
                            retryTimeout.current = null;
                        }, 5000);
                    }
                } else {
                    setWsStatus("Connected");
                }
            };

            ws.onerror = (e) => {
                console.log("WebSocket Error:", e);
                wsRef.current = null;
                if (!hasConnected.current) {
                    setWsStatus("연결 에러");

                    if (!retryTimeout.current) {
                        retryTimeout.current = setTimeout(() => {
                            initWebSocket();
                            retryTimeout.current = null;
                        }, 5000);
                    }
                } else {
                    setWsStatus("Connected");
                }
            };

            ws.onmessage = (e) => {
                try {
                    const msg = JSON.parse(e.data);
                    if (msg.data && Array.isArray(msg.data)) {
                        const arr = msg.data.map(obj => ({
                            ...obj,
                            a: (parseFloat(obj.a)).toString()
                        }));
                        setDataArray(arr);
                        setWsStatus("Connected");
                    } else {
                        console.warn("Data 형식이 예상과 다름:", msg);
                    }
                } catch (err) {
                    console.error("Failed to parse message:", e.data, err);
                }
            };
        }

        initWebSocket();

        return () => {
            if (wsRef.current) wsRef.current.close();
            wsRef.current = null;

            // 🔹 cleanup: 재시도 타이머 제거
            if (retryTimeout.current) {
                clearTimeout(retryTimeout.current);
                retryTimeout.current = null;
            }
        };
    }, [device]); // <-- device 의존성

    return { wsStatus, dataArray };
}
