import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function ServerSocket() {
    const [dataArray, setDataArray] = useState(null);
    const [wsStatus, setWsStatus] = useState(null);
    const clientRef = useRef(null);

    useEffect(() => {
        fetch('http://58.79.238.184:4000/setting/wsStatus/get', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => res.text())
            .then(data => {
                setWsStatus(data); // 반드시 여기 안에서 호출
            })
            .catch(err => console.error(err));
    }, [])

    useEffect(() => {
        const socket = new SockJS('http://58.79.238.184:4000/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000, // 연결 끊기면 5초 후 자동 재연결
            // debug: (str) => console.log('STOMP: ' + str),
            onConnect: () => {
                console.log('Connected to WebSocket');

                // 감지 데이터 받아오기
                client.subscribe('/topic/data/get', (message) => {
                    const body = JSON.parse(message.body);
                    console.log('Server Data:', body);
                    setDataArray(body);
                });

                // 센서 연결 상태 받아오기
                client.subscribe('/topic/socket/connecting', (message) => {
                    const body = message.body;
                    setWsStatus(body);
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

    return { wsStatus, dataArray };
}