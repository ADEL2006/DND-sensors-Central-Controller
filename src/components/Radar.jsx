import { useEffect, useRef } from 'react';

function Radar({ dataArray }) {
    const canvasRef = useRef(null);
    const angleRef = useRef(0);
    const directionRef = useRef(1);
    const isPaused = useRef(false);

    // 🔹 최신 데이터 참조
    const dataRef = useRef([]);
    useEffect(() => {
        dataRef.current = dataArray || [];
    }, [dataArray]);

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
                // 좌표 계산용 각도
                const angleRad = ((displayText - 90) * Math.PI) / 180 * -1;

                const x = centerX + maxRadius * Math.cos(angleRad);
                const y = centerY - maxRadius * Math.sin(angleRad);

                // 각도선 그리기
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = 'rgb(115, 255, 115)';
                ctx.setLineDash([5, 3]);
                ctx.stroke();

                // 텍스트 위치
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
                const angleDeg = parseFloat(obj.a) * -1 + 90;
                const distance = parseFloat(obj.d);
                if (isNaN(angleDeg) || isNaN(distance)) return;

                const angleRad = (angleDeg * Math.PI) / 180; // 좌우 거꾸로
                const scaledR = Math.sqrt(distance / maxDistance) * maxRadius;
                const x = (centerX + scaledR * Math.cos(angleRad) / 2);
                const y = (centerY - scaledR * Math.sin(angleRad) / 2);

                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fillStyle = 'red';
                ctx.fill();
            });

            // // 스캔 바
            // const scanRad = ((180 - angleRef.current) * Math.PI) / 180;
            // const scanX = centerX + maxRadius * Math.cos(scanRad);
            // const scanY = centerY - maxRadius * Math.sin(scanRad);

            // ctx.beginPath();
            // ctx.moveTo(centerX, centerY);
            // ctx.lineTo(scanX, scanY);
            // ctx.strokeStyle = 'yellow';
            // ctx.lineWidth = 2;
            // ctx.stroke();

            // // 스캔바 애니메이션
            // if (!isPaused.current) {
            //     angleRef.current += 0.8 * directionRef.current;
            //     if (angleRef.current >= 180 || angleRef.current <= 0) {
            //         isPaused.current = true;
            //         setTimeout(() => {
            //             directionRef.current *= -1;
            //             isPaused.current = false;
            //         }, 500);
            //     }
            // }

            requestAnimationFrame(drawRadar);
        }

        drawRadar();
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width="800"
            height="800" // 세로 길이 800으로 변경
            style={{ background: "black" }}
        />
    );
}

export default Radar;