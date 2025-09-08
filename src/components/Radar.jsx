import { useEffect, useRef, useState } from 'react';
import '../css/Radar.css';

function Radar({ wsStatus, dataArray }) {
    const canvasRef = useRef(null);
    const dataRef = useRef([]);
    const toggleTrail = useRef(30);

    const pulseRef = useRef(0);
    const pulsePausedRef = useRef(false);
    const trailRef = useRef([]);

    const [connectionStatusColor, setConnectionStatusColor] = useState("red");

    const beforeCoordinate = useRef({});

    function getRandomColor(id) {
        let r = 0, g = 0, b = 0;
        if (id == 1) r = 255;
        else if (id == 2) { r = 255; g = 127; }
        else if (id == 3) { r = 255; g = 255; }
        else if (id == 4) g = 255;
        else if (id == 5) b = 255;
        else if (id == 6) { r = 75; b = 130; }
        else if (id == 7) { r = 148; b = 211; }
        else { r = Math.floor(Math.random() * 256); g = Math.floor(Math.random() * 256); b = Math.floor(Math.random() * 256); }
        return `rgba(${r},${g},${b},1)`;
    }

    useEffect(() => {
        if (wsStatus === "Connected") setConnectionStatusColor("lime");
        else setConnectionStatusColor("red");
    }, [wsStatus]);

    useEffect(() => {
        dataRef.current = dataArray || [];
    }, [dataArray]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // CSS 크기 가져오기
        const rect = canvas.getBoundingClientRect();

        // 실제 해상도 맞추기 (레티나 대응 포함)
        const scale = window.devicePixelRatio || 1;
        canvas.width = rect.width * scale;
        canvas.height = rect.height * scale;
        ctx.scale(scale, scale);

        // 이후에 centerX, centerY, maxRadius 계산
        const centerX = rect.width / 2;
        const centerY = rect.height;
        const maxRadius = Math.min(rect.width, rect.height) * 0.95;

        // 여기서 원 그리기 시작
        }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const centerX = canvas.width / 2;
        const centerY = canvas.height;
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
                ctx.strokeStyle = 'rgba(115, 255, 115, 0.5)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 3]);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = "white";
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                const isMobile = window.matchMedia("(max-width: 767px)").matches;
                const offset = distance === 1000 ? (isMobile ? canvas.height * 0.06 : canvas.height * 0.03) : canvas.height * 0.01;
                ctx.fillText(`${distance}m`, centerX, centerY - r - offset);
            });

            // 각도 표시
            anglesToShow.forEach(displayText => {
                const angleRad = (90 - displayText) * Math.PI / 180;
                const x = centerX + maxRadius * Math.cos(angleRad);
                const y = centerY - maxRadius * Math.sin(angleRad);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = 'rgba(115, 255, 115, 0.5)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 3]);
                ctx.stroke();
                ctx.setLineDash([]);

                const textOffset = 15;
                const textX = centerX + (maxRadius + textOffset) * Math.cos(angleRad);
                const textY = centerY - (maxRadius + textOffset) * Math.sin(angleRad);

                ctx.fillStyle = "white";
                ctx.font = "14px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = displayText === 0 ? "bottom" : "middle";
                ctx.fillText(`${displayText}°`, textX, textY + (displayText === 0 ? 10 : 0));
            });

            // 테두리
            ctx.beginPath();
            ctx.arc(centerX, centerY, maxRadius, Math.PI, 0);
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(115, 255, 115, 1)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 감지된 물체 처리
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

                if (!beforeCoordinate.current[id]) {
                    beforeCoordinate.current[id] = {
                        x: targetX, y: targetY, targetX, targetY,
                        distance, angle, speed,
                        lastUpdate: Date.now(),
                        history: [],
                        color: getRandomColor(id)
                    };
                } else {
                    const dx = targetX - beforeCoordinate.current[id].x;
                    const dy = targetY - beforeCoordinate.current[id].y;
                    const movedDist = Math.sqrt(dx * dx + dy * dy);
                    if (movedDist <= 20) {
                        Object.assign(beforeCoordinate.current[id], {
                            targetX, targetY, distance, angle, speed, lastUpdate: Date.now()
                        });
                    }
                }
            });

            // 물체 렌더링
            Object.keys(beforeCoordinate.current).forEach(id => {
                const obj = beforeCoordinate.current[id];
                if (Date.now() - obj.lastUpdate > 10000) {
                    delete beforeCoordinate.current[id];
                    return;
                }

                obj.x += (obj.targetX - obj.x) * 0.1;
                obj.y += (obj.targetY - obj.y) * 0.1;
                obj.history.push({ x: obj.x, y: obj.y, time: Date.now() });
                obj.history = obj.history.filter(p => Date.now() - p.time <= 10000);

                if (obj.history.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(obj.history[0].x, obj.history[0].y);
                    for (let i = 1; i < obj.history.length; i++) {
                        ctx.lineTo(obj.history[i].x, obj.history[i].y);
                    }
                    ctx.strokeStyle = obj.color.replace("1)", "0.6)");
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                const radius = 3;
                const gradient = ctx.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, radius);
                gradient.addColorStop(0, obj.color);
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

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
                ctx.fillText(`[${id}] ${obj.distance}m / ${obj.angle}° / ${obj.speed}m/s`, textX, textY);
            });

            // =====================
            // 원 애니메이션 (퍼져나가는 원)
            // =====================
            if (dataRef.current.length === 0) {
                // 감지가 없으면 퍼져나가기
                pulsePausedRef.current = false;
            } else {
                // 감지가 있으면 멈춤 + 초기화
                pulsePausedRef.current = true;
                trailRef.current = [];
                pulseRef.current = 0;
            }

            if (!pulsePausedRef.current) {
                pulseRef.current += 3;
                if (pulseRef.current > 0) trailRef.current.push(pulseRef.current);

                if (toggleTrail.current > 0) {
                    if (trailRef.current.length > toggleTrail.current) trailRef.current.shift();
                } else {
                    trailRef.current = [];
                }
            }

            trailRef.current.forEach((r, i) => {
                if (r > maxRadius * 2) return;
                const t = (i + 1) / trailRef.current.length;
                const alpha = Math.pow(t, 1.5);
                ctx.beginPath();
                ctx.arc(centerX, centerY, r, Math.PI, 0);
                ctx.strokeStyle = `rgba(0, 255, 0, ${alpha * 0.5})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            });

            if (trailRef.current.length > 0 && trailRef.current[0] >= maxRadius * 2) {
                trailRef.current = [];
                pulseRef.current = 0;
                pulsePausedRef.current = false;
                toggleTrail.current = 30;
            }

            requestAnimationFrame(drawRadar);
        }
        drawRadar();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <div className='radar'>
            <h2 className='radar_title'>Radar</h2>
            <h3 className='connection_status'>
                <span style={{ color: connectionStatusColor }}>{wsStatus}</span>
            </h3>
            <div className='radar_canvas'>
                <canvas ref={canvasRef} width="370" height="266" />
            </div>
        </div>
    );
}

export default Radar;
