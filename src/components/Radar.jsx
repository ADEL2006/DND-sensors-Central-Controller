import { useEffect, useRef, useState } from 'react';
import '../css/Radar.css';

function Radar({ wsStatus, dataArray }) {
    const canvasRef = useRef(null);
    const dataRef = useRef([]);

    const toggleTrail = useRef(30); // 기본 트레일 길이

    const pulseRef = useRef(0); // 현재 원 반경
    const pulsePausedRef = useRef(false); // pulse 증가 중단 여부
    const trailRef = useRef([]); // 원 트레일 저장

    const [connectionStatusColor, setConnectionStatusColor] = useState("red"); // 기본값 red

    const beforeCoordinate = useRef({});

    function getRandomColor(id) {
        // const r = Math.floor(Math.random() * 256);
        // const g = Math.floor(Math.random() * 256);
        // const b = Math.floor(Math.random() * 256);
        let r = 0;
        let g = 0;
        let b = 0;

        if (id == 1) {
            r = 255;
        } else if (id == 2) {
            r = 255;
            g = 127;
        } else if (id == 3) {
            r = 255;
            g = 255;
        } else if (id == 4) {
            g = 255;
        } else if (id == 5) {
            b = 255;
        } else if (id == 6) {
            r = 75;
            b = 130;
        } else if (id == 7) {
            r = 148;
            b = 211;
        } else {
            r = Math.floor(Math.random() * 256);
            g = Math.floor(Math.random() * 256);
            b = Math.floor(Math.random() * 256);
        }

        return `rgba(${r},${g},${b},1)`; // 투명도 1
    }


    // wsStatus 변경 시 색상 업데이트
    useEffect(() => {
        if (wsStatus === "Connected") {
            setConnectionStatusColor("lime");
        } else {
            setConnectionStatusColor("red");
        }
        console.log(wsStatus);
    }, [wsStatus]);

    useEffect(() => {
        dataRef.current = dataArray || [];
    }, [dataArray]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const centerX = canvas.width / 2;
        const centerY = canvas.height + 1;
        const maxDistance = 1000;
        const distanceSteps = [125, 250, 375, 500, 625, 750, 875, 1000];
        const maxRadius = canvas.height * 9 / 10;
        const anglesToShow = [-90, -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75, 90];

        function drawRadar() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 거리 표시
            distanceSteps.forEach(distance => {
                const r = (distance / maxDistance) * maxRadius;
                ctx.beginPath();
                ctx.arc(centerX, centerY, r, Math.PI, 0);
                ctx.strokeStyle = 'rgba(115, 255, 115, 5)';
                ctx.setLineDash([5, 3]);
                ctx.stroke();

                ctx.fillStyle = "white";
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                const offset = distance === 1000 ? 20 : 5;
                ctx.fillText(`${distance}m`, centerX, centerY - r - offset);
            });

            // 각도 표시
            anglesToShow.forEach(displayText => {
                const angleRad = ((displayText - 90) * Math.PI) / 180 * -1;
                const x = centerX + maxRadius * Math.cos(angleRad);
                const y = centerY - maxRadius * Math.sin(angleRad);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = 'rgba(115, 255, 115, 5)';
                ctx.setLineDash([5, 3]);
                ctx.stroke();

                const textOffset = 15;
                let textX = centerX + (maxRadius + textOffset) * Math.cos(angleRad);
                let textY = centerY - (maxRadius + textOffset) * Math.sin(angleRad);

                if (displayText === 0) textY += 9;
                else if (displayText > 0) textX += 15;
                else { textX -= 10; textY += 6; }

                ctx.fillStyle = "white";
                ctx.font = "14px Arial";
                ctx.textAlign = displayText === 0 ? "center" : displayText < 0 ? "left" : "right";
                ctx.fillText(`${displayText}°`, textX, textY);
            });

            // 테두리
            ctx.beginPath();
            ctx.arc(centerX, centerY, maxRadius, Math.PI, 0);
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(115, 255, 115, 1)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 감지 물체 표시
            (dataRef.current || []).forEach(obj => {
                toggleTrail.current = 0;
                const id = parseFloat(obj.id);
                const distance = parseFloat(obj.d);
                const angle = parseFloat(obj.a);
                const angleDeg = angle * -1 + 90;
                const speed = parseFloat(obj.vy);
                if (isNaN(angleDeg) || isNaN(distance)) return;

                const angleRad = (angleDeg * Math.PI) / 180;
                const scaledR = (distance / maxDistance) * maxRadius;

                const targetX = centerX + scaledR * Math.cos(angleRad);
                const targetY = centerY - scaledR * Math.sin(angleRad);

                // 기존 값 없으면 초기화
                if (!beforeCoordinate.current[id]) {
                    beforeCoordinate.current[id] = {
                        x: targetX,
                        y: targetY,
                        targetX,
                        targetY,
                        distance,
                        angle,
                        speed,
                        lastUpdate: Date.now(),
                        history: [],
                        color: getRandomColor(id)
                    };
                } else {
                    // 이전 좌표와 비교 → 10m 이상 차이나면 무시
                    const dx = targetX - beforeCoordinate.current[id].x;
                    const dy = targetY - beforeCoordinate.current[id].y;
                    const movedDist = Math.sqrt(dx * dx + dy * dy);

                    if (movedDist <= 20) {
                        // 10m 이내일 때만 업데이트
                        beforeCoordinate.current[id].targetX = targetX;
                        beforeCoordinate.current[id].targetY = targetY;
                        beforeCoordinate.current[id].distance = distance;
                        beforeCoordinate.current[id].angle = angle;
                        beforeCoordinate.current[id].speed = speed;
                        beforeCoordinate.current[id].lastUpdate = Date.now();
                    }
                }
            });


            // 렌더링 시
            Object.keys(beforeCoordinate.current).forEach(id => {
                const obj = beforeCoordinate.current[id];

                // 10초 이상 갱신 안된 객체 제거
                if (Date.now() - obj.lastUpdate > 10000) {
                    delete beforeCoordinate.current[id];
                    return;
                }

                // lerp 이동
                obj.x += (obj.targetX - obj.x) * 0.1;
                obj.y += (obj.targetY - obj.y) * 0.1;

                // 이동 경로 기록
                obj.history.push({ x: obj.x, y: obj.y, time: Date.now() });

                //  10초 지난 기록 삭제
                obj.history = obj.history.filter(p => Date.now() - p.time <= 10000);

                // 경로 그리기
                if (obj.history.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(obj.history[0].x, obj.history[0].y);
                    for (let i = 1; i < obj.history.length; i++) {
                        ctx.lineTo(obj.history[i].x, obj.history[i].y);
                    }
                    ctx.strokeStyle = obj.color.replace("1)", "0.6)"); // alpha 0.6
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // 점 그리기
                const radius = 6;
                const gradient = ctx.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, radius);
                gradient.addColorStop(0, obj.color);            // 중앙 색상
                // gradient.addColorStop(1, obj.color.replace("1)", "0)")); // 바깥쪽 투명
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // 텍스트 (id, 거리, 각도, 속도)
                const offset = 15;
                const textX = obj.x + radius + offset;
                const textY = obj.y - radius - offset;

                ctx.beginPath();
                ctx.moveTo(obj.x + 2.5, obj.y - 3.5);
                ctx.lineTo(textX, textY);
                ctx.strokeStyle = "white";
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.fillStyle = "white";
                ctx.font = "bold 14px 'Nunito Sans', Arial, sans-serif";
                ctx.textAlign = "left";
                ctx.textBaseline = "bottom";
                ctx.fillText(
                    `[${id}] ${obj.distance}m / ${obj.angle}° / ${obj.speed}m/s`,
                    textX,
                    textY
                );
            });


            // 원 애니메이션
            if (!pulsePausedRef.current) {
                pulseRef.current += 3;

                if (pulseRef.current > 0) trailRef.current.push(pulseRef.current);

                // toggleTrail이 0이면 트레일 제거, 아니면 기본값 유지
                if (toggleTrail.current > 0) {
                    if (trailRef.current.length > toggleTrail.current) trailRef.current.shift();
                } else {
                    trailRef.current = [];
                }
            }

            // trail 그리기
            trailRef.current.forEach((r, i) => {
                if (r > maxRadius) return;

                const t = (i + 1) / trailRef.current.length;
                const alpha = Math.pow(t, 1.5);

                ctx.beginPath();
                ctx.arc(centerX, centerY, r, Math.PI, 0);
                ctx.strokeStyle = `rgba(0, 255, 0, ${alpha * 0.5})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            });

            // trail 끝이 maxRadius 이상이면 초기화
            if (trailRef.current.length > 0 && trailRef.current[0] >= maxRadius) {
                trailRef.current = [];
                pulseRef.current = 0;
                pulsePausedRef.current = false;

                // 다음 사이클에서는 다시 기본 트레일 길이
                toggleTrail.current = 30;
            }

            requestAnimationFrame(drawRadar);
        }

        drawRadar();
    }, []);

    return (
        <div className='radar'>
            <h2 className='radar_title'>Radar</h2>
            <h3 className='connection_status'>
                <span style={{ color: connectionStatusColor }}>{wsStatus}</span>
            </h3>
            <canvas
                ref={canvasRef}
                width="996"
                height="716"
                className='radar_canvas'
            />
        </div>
    );
}

export default Radar;
