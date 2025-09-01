import { useEffect, useRef } from 'react';
import '../css/Radar.css';

function Radar({ dataArray }) {
    const canvasRef = useRef(null);
    const angleRef = useRef(0);
    const directionRef = useRef(1);
    const isPaused = useRef(false);

    // 최신 데이터 참조
    const dataRef = useRef([]);
    useEffect(() => {
        dataRef.current = dataArray || [];
    }, [dataArray]);

    const pulseRef = useRef(0);
    const pulsePausedRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const centerX = canvas.width / 2;
        const centerY = canvas.height + 1; // 바닥 기준
        const maxDistance = 1000;
        const distanceSteps = [125, 250, 375, 500, 625, 750, 875, 1000];
        const maxRadius = canvas.height * 9 / 10;
        const anglesToShow = [-90, -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75, 90];

        function drawRadar() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 거리 표기
            distanceSteps.forEach(distance => {
                const r = (distance / maxDistance) * maxRadius;
                ctx.beginPath();
                ctx.arc(centerX, centerY, r, Math.PI, 0);
                ctx.strokeStyle = 'rgb(115, 255, 115)';
                ctx.setLineDash([5, 3]);
                ctx.stroke();

                ctx.fillStyle = "white";
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                const offset = distance === 1000 ? 20 : 5;
                ctx.fillText(`${distance}m`, centerX, centerY - r - offset);
            });

            // 각도 표기
            anglesToShow.forEach(displayText => {
                const angleRad = ((displayText - 90) * Math.PI) / 180 * -1;
                const x = centerX + maxRadius * Math.cos(angleRad);
                const y = centerY - maxRadius * Math.sin(angleRad);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = 'rgb(115, 255, 115)';
                ctx.setLineDash([5, 3]);
                ctx.stroke();

                const textOffset = 15;
                let textX = centerX + (maxRadius + textOffset) * Math.cos(angleRad);
                let textY = centerY - (maxRadius + textOffset) * Math.sin(angleRad);

                if (displayText === 0) {
                    textY += 9;
                } else if (displayText > 0) {
                    textX += 15;
                } else {
                    textX -= 10;
                    textY += 6;
                }

                ctx.fillStyle = "white";
                ctx.font = "14px Arial";
                ctx.textAlign = displayText === 0 ? "center" : displayText < 0 ? "left" : "right";
                ctx.fillText(`${displayText}°`, textX, textY);
            });

            // 테두리
            ctx.beginPath();
            ctx.arc(centerX, centerY, maxRadius, Math.PI, 0);
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgb(115, 255, 115)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 감지 물체 표시
            (dataRef.current || []).forEach(obj => {
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

                // 빨간점
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, "rgba(255, 0, 0, 1)");
                gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // 텍스트 위치
                const offset = 15;
                const textX = x + radius + offset;
                const textY = y - radius - offset;

                // 빨간점에서 조금 떨어진 위치에서 선 시작
                const lineStartOffset = radius + 0;
                const startX = x + lineStartOffset * Math.cos(angleRad) + 5;
                const startY = y - lineStartOffset * Math.sin(angleRad) + 1;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(textX, textY);
                ctx.strokeStyle = "white";
                ctx.lineWidth = 1;
                ctx.stroke();

                // 텍스트 표시
                ctx.fillStyle = "white";
                ctx.font = "bold 14px 'Nunito Sans', Arial, sans-serif";
                ctx.textAlign = "left";
                ctx.textBaseline = "bottom";
                ctx.fillText(`[${id}] ${distance}m / ${angle}° / ${speed}m/s`, textX, textY);
            });


            // 원 애니메이션
            if (pulseRef.current > 0) {
                const alpha = 1 - pulseRef.current / maxRadius; // 1 → 0으로 점점 투명해짐
                ctx.beginPath();
                ctx.arc(centerX, centerY, pulseRef.current, Math.PI, 0);
                ctx.strokeStyle = `rgba(0, 255, 0, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            if (!pulsePausedRef.current) {
                pulseRef.current += 3;
                if (pulseRef.current > maxRadius) {
                    pulsePausedRef.current = true;
                    setTimeout(() => {
                        pulseRef.current = 0;
                        pulsePausedRef.current = false;
                    }, 500);
                }
            }

            requestAnimationFrame(drawRadar);
        }

        drawRadar();
    }, []);

    return (
        <div className='radar'>
            <h2 className='radar_title'>Radar</h2>
            <canvas
                ref={canvasRef}
                width="800"
                height="750"
                style={{ background: "black" }}
            />
        </div>
    );
}

export default Radar;
