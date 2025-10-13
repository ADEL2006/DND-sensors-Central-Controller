import { useEffect, useRef, useState } from 'react';
import '../css/Radar.css';

function Radar({ wsStatus, dataArray, device, colors, noiseFilterLevel, distance_500T, distance_1000T, animationSetting }) {
    const canvasRef = useRef(null); // 캔버스
    const dataRef = useRef([]); // 데이터 값

    const toggleTrail = useRef(0); // 기본 트레일 길이

    const pulseRef = useRef(0); // 현재 원 반경
    const pulsePausedRef = useRef(false); // pulse 증가 중단 여부
    const trailRef = useRef([]); // 원 트레일 저장

    const [connectionStatusColor, setConnectionStatusColor] = useState("red"); // 기본값 red

    const beforeCoordinate = useRef({}); // 감지된 물체를 표시하는 빨간 점 상태값

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767); // 모바일 인지 아닌지 판단
    const getCanvasSize = () => isMobile ? [460, 321] : [996, 746]; // 모바일이라면 캔버스 크기를 다르게 표기
    const [canvasSize, setCanvasSize] = useState(getCanvasSize()); // 캔버스 크기

    const [maxDistance, setMaxDistance] = useState(600); // 최대 사거리
    const [distanceSteps, setDistanceSteps] = useState([100, 200, 300, 400, 500, 600]); // 표시할 사거리

    const isFiltered = useRef(false);

    // 화면 크기 변화에 따른 크기 재지정
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

    // 센서와 연결된 상태라면 애니메이션 재생
    useEffect(() => {
        if (wsStatus === "Connected") {
            toggleTrail.current = 30;
        } else {
            toggleTrail.current = 0;
        }
    }, [wsStatus]);

    // 레이더 초기화 함수
    const resetRadar = () => {
        beforeCoordinate.current = {};
        pulseRef.current = 0;
        trailRef.current = [];
        pulsePausedRef.current = false;
        if (wsStatus === "Connected") toggleTrail.current = 30;
        dataRef.current = [];
    };

    // 선택 디바이스에 따른 최대 사거리/표시할 사거리 변경
    useEffect(() => {
        if (device === "DND-500T") {
            setMaxDistance(distance_500T);
            const step = distance_500T / 6;
            setDistanceSteps([step * 1, step * 2, step * 3, step * 4, step * 5, step * 6]);
        } else if (device === "DND-1000T") {
            setMaxDistance(distance_1000T);
            const step = distance_1000T / 8;
            setDistanceSteps([step * 1, step * 2, step * 3, step * 4, step * 5, step * 6, step * 7, step * 8]);
        }
        resetRadar();
    }, [device, distance_500T, distance_1000T])

    const resetTimer = useRef(null); // 타이머(리셋용)
    // 5초동안 데이터가 들어오지 않는다면 레이더 초기화
    useEffect(() => {
        dataRef.current = dataArray || [];
        // console.log("dataRef:", dataRef.current, "dataArray:", dataArray);

        // 기존 타이머가 있으면 취소
        if (resetTimer.current) clearTimeout(resetTimer.current);

        // 새 타이머 시작
        resetTimer.current = setTimeout(() => {
            if (wsStatus === "Connected") {
                console.log("5초 유예 후 레이더 초기화!");
                resetRadar();
            }
            resetTimer.current = null; // 타이머 종료 후 초기화
        }, 5000);
        
        // cleanup
        return () => {
            if (resetTimer.current) clearTimeout(resetTimer.current);
        };
    }, [dataArray]);

    // 캔버스 생성
    useEffect(() => {
        const canvas = canvasRef.current; // 캔버스 지정
        if (!canvas) return;
        const ctx = canvas.getContext('2d'); // 2D환경 설정

        let animationId; // ← 애니메이션 ID

        const centerX = canvas.width / 2; // 중앙 X좌표 위치 설정
        const centerY = canvas.height; // 중앙 Y좌표 위치 설정
        const maxRadius = canvas.height * 9 / 10; // 레이더의 최대크기
        const anglesToShow = [-90, -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75, 90]; // 표시할 각도

        // 레이더 그리기 함수
        function drawRadar() {
            // 캔버스 초기화
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 거리 표시
            distanceSteps.forEach(distance => {
                const r = (distance / maxDistance) * maxRadius;
                ctx.beginPath();
                ctx.arc(centerX, centerY, r, Math.PI, 0);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.setLineDash([5, 3]);
                ctx.stroke();

                ctx.fillStyle = "white";
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "alphabetic";
                const offset = Number(distance) === Number(maxDistance) ? (isMobile ? 12 : 20) : 0;
                ctx.fillText(`${distance.toFixed(2)}m`, centerX, centerY - r - offset - 5); // 거리는 소수 둘째자리 수까지 표시
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
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // alpha 조정
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
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 감지 물체 정보 정리
            (dataRef.current || []).forEach(obj => {
                if (animationSetting !== 0) toggleTrail.current = 0; // 애니메이션 설정이 on이 아니라면

                // const id = parseFloat(obj.id); // 타겟 번호
                // const distance = parseFloat(obj.d); // 거리
                // const angle = parseFloat(obj.a); // 각도
                // const angleDeg = angle * -1 + 90; // 표시에 사용할 각도값
                // const speed = parseFloat(obj.vy); // 속도/vy

                // const x = parseFloat(obj.x);
                // const y = parseFloat(obj.y);

                const id = parseFloat(obj.targetId); // 타겟 번호
                const distance = parseFloat(obj.distance); // 거리
                const angle = parseFloat(obj.angle); // 각도
                const angleDeg = angle * -1 + 90; // 표시에 사용할 각도값
                const speed = parseFloat(obj.speed).toFixed(2); // 속도/vy

                const x = parseFloat(obj.x);
                const y = parseFloat(obj.y);

                if (isNaN(angleDeg) || isNaN(distance)) return;

                const angleRad = (angleDeg * Math.PI) / 180; // 각도를 라디안으로 변환
                const scaledR = (distance / maxDistance) * maxRadius; // 거리 비율 계산

                const targetX = centerX + scaledR * Math.cos(angleRad); // X좌표
                const targetY = centerY - scaledR * Math.sin(angleRad); // Y좌표

                const now = new Date(); // 먼저 현재 시간 객체 생성
                // 서버용 날짜
                const dateStr = now.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).replace(/\.\s?/g, '-').replace(/-$/, '');
                // 기존 화면용 시간
                const timeStr = now.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

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
                    // 이전 좌표와 비교 → 20m 이상 차이나면 무시
                    const dx = targetX - beforeCoordinate.current[id].x;
                    const dy = targetY - beforeCoordinate.current[id].y;
                    const movedDist = Math.sqrt(dx * dx + dy * dy);

                    isFiltered.current = (movedDist <= noiseFilterLevel);
                    if (isFiltered.current) {
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

                // 3초 이상 갱신 안된 객체 제거
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

                // // 이동 경로 기록
                // obj.history.push({ x: obj.x, y: obj.y });

                // // 최대 30개까지만 유지
                // if (obj.history.length > 30) {
                //     obj.history.shift();
                // }

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
                const radius = 4; // 원 크기
                const gradient = ctx.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, radius);
                gradient.addColorStop(0, obj.color); // 중앙 색상
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


            // 애니메이션 설정이 off가 아니라면 동작
            if (animationSetting !== 2) {
                if (!pulsePausedRef.current) {
                    const step = isMobile ? 2 : 6; // 한 프레임에 이동할 거리
                    const prevPulse = pulseRef.current;
                    pulseRef.current += step;

                    // trail 보강
                    const steps = 2; // trail 2개 추가(1프레임 당)
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

                // trail 삭제(끝부분에 닿을시)
                if (trailRef.current.length > 0 && trailRef.current[0] >= maxRadius) {
                    trailRef.current = [];
                    pulseRef.current = 0;
                    pulsePausedRef.current = false;

                    // 다음 사이클에서는 다시 기본 트레일 길이
                    toggleTrail.current = 30;
                }

            }

            animationId = requestAnimationFrame(drawRadar);
        }

        drawRadar();

        return () => {
            cancelAnimationFrame(animationId); // cleanup
        };
    }, [canvasSize, maxDistance, distanceSteps, animationSetting]);

    return (
        <div className='radar'>
            <h2 className='radar_title'>Radar</h2>
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
