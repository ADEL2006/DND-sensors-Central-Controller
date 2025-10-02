import { useEffect, useRef, useState } from 'react';
import '../css/Video.css';
import airstrip from '../img/airstrip.jpg'

function Video() {
    const canvasRef = useRef(null); // 영상을 표시할 구역
    const playerRef = useRef(null); // 영상
    const lastFrameRef = useRef(Date.now()); // 마지막 프레임 수신 시간
    const [ready, setReady] = useState(false); // JSMpeg 준비 여부
    const [hasSignal, setHasSignal] = useState(false); // 영상 출력 여부

    // CDN JSMpeg 준비 확인
    useEffect(() => {
        const check = () => {
            if (window.JSMpeg) setReady(true);
            else setTimeout(check, 100);
        };
        check();
    }, []);

    // Player 생성
    useEffect(() => {
        if (!ready || !canvasRef.current) return;

        playerRef.current = new window.JSMpeg.Player('ws://localhost:4002', {
            canvas: canvasRef.current,
            autoplay: true,
            onVideoDecode: () => {
                lastFrameRef.current = Date.now();
                if (!hasSignal) setHasSignal(true);
            }
        });

        return () => {
            if (playerRef.current) playerRef.current.destroy();
        };
    }, [ready]);

    // 프레임 수신 체크
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            if (now - lastFrameRef.current > 5000) { // 5초 이상 프레임 없으면
                setHasSignal(false);
            }
        }, 1000); // 1초마다 체크

        return () => clearInterval(interval);
    }, []);

    return (
        <div className='livqCQ'>
            <h2 className='video_title'>Video</h2>
            <div className="video_wrapper">
                <canvas ref={canvasRef} className='video'></canvas> 
                <span className="no_signal" style={{ display: hasSignal ? 'none' : 'block' }}>
                    <img src={airstrip} style={{ height: '100%', width: "100%" }} />
                </span>
            </div>
        </div>
    );
}

export default Video;
