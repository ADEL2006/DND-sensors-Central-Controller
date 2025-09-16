import { useState, useEffect, useRef } from "react";

export function useRadarSocket(device) {
    const [wsStatus, setWsStatus] = useState("connecting...");
    const [dataArray, setDataArray] = useState([]);
    const wsRef = useRef(null);
    const hasConnected = useRef(false);

    const retryTimeout = useRef(null);

    const url_ws = device === "DND-500T" ? "ws://58.79.238.184:2000" : "ws://58.79.238.184:2001";

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

                // 기존 재시도 타이머 있으면 제거
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

                    // 중복 재시도 방지
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
                    let arr = [];
                    if (Array.isArray(msg.data)) {
                        arr = msg.data;
                    } else if (Array.isArray(msg.objects)) {
                        arr = msg.objects;
                    } else if (msg) {
                        arr = [msg]; // 단일 객체
                    }
                    arr = arr.map(obj => ({ ...obj, a: obj.a ? parseFloat(obj.a).toString() : undefined }));
                    setDataArray(arr);
                    setWsStatus("Connected");
                } catch (err) {
                    console.error("Failed to parse message:", e.data, err);
                }
            };
        }

        initWebSocket();

        return () => {
            if (wsRef.current) wsRef.current.close();
            wsRef.current = null;

            // cleanup: 재시도 타이머 제거
            if (retryTimeout.current) {
                clearTimeout(retryTimeout.current);
                retryTimeout.current = null;
            }
        };
    }, [device]);

    return { wsStatus, dataArray };
}
