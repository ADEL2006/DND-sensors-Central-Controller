import { useState, useEffect, useRef } from "react";

export function useRadarSocket() {
    const [wsStatus, setWsStatus] = useState("connecting");
    const [dataArray, setDataArray] = useState([]);
    const wsRef = useRef(null);

    const url_ws = "ws://192.168.0.123:1883";

    useEffect(() => {
        function initWebSocket() {
            if (wsRef.current) return;

            const ws = new WebSocket(url_ws);
            wsRef.current = ws;

            ws.onopen = () => {
                setWsStatus("connected");
                console.log("WebSocket Connected");
            };

            ws.onclose = (e) => {
                setWsStatus("connecting");
                console.log("WebSocket Disconnected:", e.reason);
                wsRef.current = null;
                setTimeout(initWebSocket, 5000); // 5초 후 재연결
            };

            ws.onerror = (e) => {
                setWsStatus("connecting");
                console.log("WebSocket Error:", e);
                wsRef.current = null;
                setTimeout(initWebSocket, 5000);
            };

            ws.onmessage = (e) => {
                try {
                    const msg = JSON.parse(e.data);
                    if (msg.data && Array.isArray(msg.data)) {
                        const arr = msg.data.map(obj => ({
                            ...obj,
                            a: (parseFloat(obj.a)).toString() // 각도 +45도
                        }));
                        setDataArray(arr);
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
