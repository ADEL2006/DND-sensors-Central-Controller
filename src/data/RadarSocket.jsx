import { useState, useEffect, useRef } from "react";

export function useRadarSocket() {
    const [wsStatus, setWsStatus] = useState("connecting");
    const [dataArray, setDataArray] = useState([]);
    const wsRef = useRef(null);

    const hasConnected = useRef(false);

    const url_ws = "ws://192.168.0.123:1883";

    useEffect(() => {
        function initWebSocket() {
            if (wsRef.current) return;

            const ws = new WebSocket(url_ws);
            wsRef.current = ws;

            ws.onopen = () => {
                setWsStatus("연결됨");
                console.log("WebSocket Connected");
                hasConnected.current = true;
            };

            ws.onclose = (e) => {
                console.log("WebSocket Disconnected:", e.reason);
                wsRef.current = null;
                if (!hasConnected.current) {
                    setWsStatus("연결중");
                    setTimeout(initWebSocket, 5000);
                } else {
                    setWsStatus("연결됨");
                }
            };

            ws.onerror = (e) => {
                console.log("WebSocket Error:", e);
                wsRef.current = null;
                if (!hasConnected.current) {
                    setWsStatus("연결 에러");
                    setTimeout(initWebSocket, 5000);
                } else {
                    setWsStatus("연결됨");
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
                        setWsStatus("연결됨");
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
        };
    }, []);

    return { wsStatus, dataArray };
}
