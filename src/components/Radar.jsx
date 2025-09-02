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
                // 물체 감지 시 트레일 제거
                toggleTrail.current = 0;

                const id = parseFloat(obj.id);
                const angle = parseFloat(obj.a);
                const angleDeg = angle * -1 + 90;
                const distance = parseFloat(obj.d);
                const speed = parseFloat(obj.vy);
                if (isNaN(angleDeg) || isNaN(distance)) return;

                const angleRad = (angleDeg * Math.PI) / 180;
                const scaledR = (distance / maxDistance) * maxRadius;

                const x = centerX + scaledR * Math.cos(angleRad);
                const y = centerY - scaledR * Math.sin(angleRad);

                const radius = 6;
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, "rgba(255, 0, 0, 1)");
                gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                const offset = 15;
                const textX = x + radius + offset;
                const textY = y - radius - offset;

                const lineStartOffset = radius;
                const startX = x + 2.5;
                const startY = y - 3.5;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(textX, textY);
                ctx.strokeStyle = "white";
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.fillStyle = "white";
                ctx.font = "bold 14px 'Nunito Sans', Arial, sans-serif";
                ctx.textAlign = "left";
                ctx.textBaseline = "bottom";
                ctx.fillText(`[${id}] ${distance}m / ${angle}° / ${speed}m/s`, textX, textY);
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
                width="1000"
                height="746"
                className='radar_canvas'
            />
        </div>
    );
}

export default Radar;
