import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function ServerSocket() {
    const [dataArray, setDataArray] = useState(null);
    const [wsState, setWsState] = useState(null);
    const clientRef = useRef(null);

    useEffect(() => {
        const socket = new SockJS('http://58.79.238.184:4000/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000, // 연결 끊기면 5초 후 자동 재연결
            debug: (str) => console.log('STOMP: ' + str),
            onConnect: () => {
                console.log('Connected to WebSocket');

                // 감지 데이터 받아오기
                client.subscribe('/topic/data/get', (message) => {
                    const body = JSON.parse(message.body);
                    console.log('Data:', body);
                    setDataArray(body);
                });

                // 센서 연결 상태 받아오기
                client.subscribe('/topic/socket/connecting', (message) => {
                    const body = JSON.parse(message.body);
                    console.log('Connection status:', body);
                    setWsState(body);
                });
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) clientRef.current.deactivate();
        };
    }, []);

    return { dataArray, wsState };
}