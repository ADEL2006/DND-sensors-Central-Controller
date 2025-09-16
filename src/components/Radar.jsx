import { useEffect, useRef, useState } from 'react';
import '../css/Radar.css';

function Radar({ wsStatus, dataArray, device, colors }) {
    const canvasRef = useRef(null);
    const dataRef = useRef([]);

    const toggleTrail = useRef(30); // 기본 트레일 길이

    const pulseRef = useRef(0); // 현재 원 반경
    const pulsePausedRef = useRef(false); // pulse 증가 중단 여부
    const trailRef = useRef([]); // 원 트레일 저장

    const [connectionStatusColor, setConnectionStatusColor] = useState("red"); // 기본값 red

    const beforeCoordinate = useRef({});

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
    const getCanvasSize = () => window.innerWidth <= 767 ? [460, 321] : [996, 746];
    const [canvasSize, setCanvasSize] = useState(getCanvasSize());

    const [maxDistance, setMaxDistance] = useState(500);
    const [distanceSteps, setDistanceSteps] = useState([100, 200, 300, 400, 500]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 767);
            setCanvasSize(getCanvasSize());
            trailRef.current = [];
            pulseRef.current = 0;
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if(device === "DND-500T") {
            setMaxDistance(500);
            setDistanceSteps([100, 200, 300, 400, 500])
        } else if (device === "DND-1000T") {
            setMaxDistance(1000);
            setDistanceSteps([125, 250, 375, 500, 625, 750, 875, 1000])
        }
        beforeCoordinate.current = {};
        trailRef.current = [];
        pulseRef.current = 0;
    }, [device])

    // const changeDevice = (e) =>  {
    //     if(e.target.value === "DND-500T") {
    //         setMaxDistance(500);
    //         setDistanceSteps([100, 200, 300, 400, 500])
    //     } else if (e.target.value === "DND-1000T") {
    //         setMaxDistance(1000);
    //         setDistanceSteps([125, 250, 375, 500, 625, 750, 875, 1000])
    //     }
    //     beforeCoordinate.current = {};
    //     trailRef.current = [];
    //     pulseRef.current = 0;
    // }
    const resetRadar = () => {
        beforeCoordinate.current = {};
        pulseRef.current = 0;
        trailRef.current = [];
        pulsePausedRef.current = false;
        toggleTrail.current = 30;
        dataRef.current = [];
    };

    const resetTimer = useRef(null);

    useEffect(() => {
        dataRef.current = dataArray || [];
        console.log("dataRef:", dataRef.current, "dataArray:", dataArray);

        // 기존 타이머가 있으면 취소
        if (resetTimer.current) clearTimeout(resetTimer.current);

        // 새 타이머 시작
        resetTimer.current = setTimeout(() => {
            console.log("5초 유예 후 레이더 초기화!");
            resetRadar();
            resetTimer.current = null; // 타이머 종료 후 초기화
        }, 5000);

        // cleanup
        return () => {
            if (resetTimer.current) clearTimeout(resetTimer.current);
        };
    }, [dataArray]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        let animationId; // ← 애니메이션 ID 저장

        const centerX = canvas.width / 2;
        const centerY = canvas.height;
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
                ctx.setLineDash([5, 3]);
                ctx.stroke();

                ctx.fillStyle = "white";
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "alphabetic"; // ← 추가
                const offset = distance === maxDistance ? (isMobile ? 12 : 20) : 0;
                ctx.fillText(`${distance}m`, centerX, centerY - r - offset-5);
            });

            // 각도 표시
            anglesToShow.forEach(displayText => {
                const angleRad = ((displayText - 90) * Math.PI) / 180 * -1;

                const x = centerX + maxRadius * Math.cos(angleRad);
                const y = centerY - maxRadius * Math.sin(angleRad);

                // 반원 선 그리기
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = 'rgba(115, 255, 115, 0.5)'; // alpha 조정
                ctx.setLineDash([5, 3]);
                ctx.stroke();

                // 텍스트 위치
                const textOffset = maxRadius * 0.05; // canvas 크기에 비례
                let textX = centerX + (maxRadius + textOffset) * Math.cos(angleRad);
                let textY = centerY - (maxRadius + textOffset) * Math.sin(angleRad);

                // 경험적 수치를 maxRadius 기준으로 조정
                if (displayText === 0) {
                    textY += isMobile ? (maxRadius * 0.02) : (maxRadius * 0.03);
                }
                else if (displayText > 0) {
                    textX += isMobile ? (maxRadius * 0.05) : (displayText === 45 ? maxRadius * 0.003 : (displayText === 30 ? maxRadius * 0.006 : maxRadius * 0.01));
                    textY += isMobile ? (maxRadius * 0.01) : (displayText === 45 ? maxRadius * 0.025 : (displayText === 30 ? maxRadius * 0.027 : maxRadius * 0.03));
                }
                else if (displayText < 0) {
                    textX -= isMobile ? (maxRadius * 0.05) : (displayText === -45 ? maxRadius * 0.003 : (displayText === -30 ? maxRadius * 0.006 : maxRadius * 0.01));
                    textY += isMobile ? (maxRadius * 0.01) : (displayText === -45 ? maxRadius * 0.025 : (displayText === -30 ? maxRadius * 0.027 : maxRadius * 0.03));
                }

                ctx.fillStyle = "white";
                ctx.font = `14px Arial`; // 글자 크기도 canvas 비율로 조정
                ctx.textAlign = displayText === 0 ? "center" : (displayText < 0 ? "left" : "right");
                ctx.textBaseline = "middle";
                ctx.fillText(`${displayText}°`, textX, textY);
            });

            // 테두리
            ctx.beginPath();
            ctx.arc(centerX, centerY, maxRadius, Math.PI, 0);
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(115, 255, 115, 1)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 감지 물체 정보 정리
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
                        color: colors.current[id]
                    };
                } else {
                    // 이전 좌표와 비교 → 10m 이상 차이나면 무시
                    const dx = targetX - beforeCoordinate.current[id].x;
                    const dy = targetY - beforeCoordinate.current[id].y;
                    const movedDist = Math.sqrt(dx * dx + dy * dy);

                    if (movedDist <= 20) {
                        // 20m 이내일 때만 업데이트
                        beforeCoordinate.current[id].targetX = targetX;
                        beforeCoordinate.current[id].targetY = targetY;
                        beforeCoordinate.current[id].distance = distance;
                        beforeCoordinate.current[id].angle = angle;
                        beforeCoordinate.current[id].speed = speed;
                        beforeCoordinate.current[id].lastUpdate = Date.now();
                    }
                }
            });


            // 감지 물체 표시
            Object.keys(beforeCoordinate.current).forEach(id => {
                const obj = beforeCoordinate.current[id];

                // 10초 이상 갱신 안된 객체 제거
                if (Date.now() - obj.lastUpdate > 3000) {
                    delete beforeCoordinate.current[id];
                    return;
                }

                // lerp 이동
                obj.x += (obj.targetX - obj.x) * 0.1;
                obj.y += (obj.targetY - obj.y) * 0.1;

                // 이동 경로 기록
                obj.history.push({ x: obj.x, y: obj.y, time: Date.now() });

                //  10초 지난 경로 삭제
                obj.history = obj.history.filter(p => Date.now() - p.time <= 10000);

                // 경로 그리기
                if (obj.history.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(obj.history[0].x, obj.history[0].y);
                    for (let i = 1; i < obj.history.length; i++) {
                        ctx.lineTo(obj.history[i].x, obj.history[i].y);
                    }
                    ctx.strokeStyle = obj.color.replace("1)", "0.6)"); // alpha 0.6
                    ctx.lineWidth = 4;
                    ctx.stroke();
                }

                // 점 그리기
                const radius = 4;
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
                const step = isMobile ? 2 : 6; // 한 프레임에 이동할 거리
                const prevPulse = pulseRef.current;
                pulseRef.current += step;

                // trail 보간
                const steps = 2; // 1프레임 안에서 trail 3개 추가
                for (let i = 1; i <= steps; i++) {
                    const interp = prevPulse + (step / steps) * i;
                    trailRef.current.push(interp);
                }

                // toggleTrail 처리
                if (toggleTrail.current > 0) {
                    while (trailRef.current.length > toggleTrail.current) trailRef.current.shift();
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

            animationId = requestAnimationFrame(drawRadar);
        }

        drawRadar();

        return () => {
            cancelAnimationFrame(animationId); // cleanup에서 반드시 취소!
        };
    }, [canvasSize, maxDistance, distanceSteps]);

    return (
        <div className='radar'>
            <h2 className='radar_title'>Radar</h2>
            {/* <h3 className='select_device'>
                <select onChange={changeDevice} className='device'>
                    <option value={"DND-500T"}>DND-500T</option>
                    <option value={"DND-1000T"}>DND-1000T</option>
                </select>
            </h3> */}
            <canvas
                ref={canvasRef}
                width={canvasSize[0]}
                height={canvasSize[1]}
                className='radar_canvas'
            />
        </div>
    );
}

export default Radar;
