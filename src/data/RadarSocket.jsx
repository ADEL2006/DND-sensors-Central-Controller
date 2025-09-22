// data/RadarSocket.js
import { useState, useEffect, useRef } from "react";

export function useRadarSocket(device, DND_500TIp, DND_1000TIp) {
    const [wsStatus, setWsStatus] = useState("connecting...");
    const [dataArray, setDataArray] = useState([]);
    const wsRef = useRef(null);
    const hasConnected = useRef(false);
    const retryTimeout = useRef(null);
    const [url_ws, setUrl_ws] = useState(DND_500TIp);

    // const url_ws = device === "DND-500T"
    //     ? "ws://58.79.238.184:2000"
    //     : "ws://58.79.238.184:2001";

    useEffect(() => {
        if(device === "DND-500T") {
            setUrl_ws(DND_500TIp);
        }else {
            setUrl_ws(DND_1000TIp);
        }
    }, [device, DND_500TIp, DND_1000TIp]);

    useEffect(() => {
        if (!url_ws) return;
        setWsStatus("Connecting...");
        hasConnected.current = false;

        const initWebSocket = () => {
            // 기존 연결 종료
            if (wsRef.current) {
                wsRef.current.onopen = null;
                wsRef.current.onclose = null;
                wsRef.current.onerror = null;
                wsRef.current.onmessage = null;
                wsRef.current.close();
                wsRef.current = null;
            }
            if (retryTimeout.current) {
                clearTimeout(retryTimeout.current);
                retryTimeout.current = null;
            }

            const ws = new WebSocket(url_ws);
            wsRef.current = ws;
            console.log("Attempting to connect to WebSocket at:", url_ws);

            ws.onopen = () => {
                setWsStatus("Connected");
                console.log("WebSocket Connected:", url_ws);
                hasConnected.current = true;
            };

            ws.onclose = (e) => {
                console.log("WebSocket Disconnected:", e.reason);
                wsRef.current = null;

                // 아직 연결 안 된 상태에서만 재연결
                if (!hasConnected.current && !retryTimeout.current) {
                    retryTimeout.current = setTimeout(() => {
                        if (!wsRef.current) initWebSocket();
                        retryTimeout.current = null;
                    }, 5000);
                }
            };

            ws.onerror = (e) => {
                if (wsRef.current !== ws) return; // 이미 새 소켓이 있으면 무시
                console.log("WebSocket Error:", e);
                wsRef.current = null;

                if (!hasConnected.current && !retryTimeout.current) {
                    setWsStatus("Connecting...");
                    retryTimeout.current = setTimeout(() => {
                        if (!wsRef.current) initWebSocket();
                        retryTimeout.current = null;
                    }, 5000);
                }
            };

            ws.onmessage = (e) => {
                try {
                    const msg = JSON.parse(e.data);
                    let arr = [];
                    if (Array.isArray(msg.data)) arr = msg.data;
                    else if (Array.isArray(msg.objects)) arr = msg.objects;
                    else if (msg) arr = [msg];

                    arr = arr.map(obj => ({ ...obj, a: obj.a ? parseFloat(obj.a).toString() : undefined }));
                    setDataArray(arr);
                    setWsStatus("Connected");
                } catch (err) {
                    console.error("Failed to parse message:", e.data, err);
                }
            };
        };

        initWebSocket();

        return () => {
            // cleanup
            if (retryTimeout.current) {
                clearTimeout(retryTimeout.current);
                retryTimeout.current = null;
            }
            if (wsRef.current) {
                wsRef.current.onopen = null;
                wsRef.current.onclose = null;
                wsRef.current.onerror = null;
                wsRef.current.onmessage = null;
                wsRef.current.close();
                wsRef.current = null;
            }
            hasConnected.current = false;
        };
    }, [url_ws]);

    return { wsStatus, dataArray };
}
