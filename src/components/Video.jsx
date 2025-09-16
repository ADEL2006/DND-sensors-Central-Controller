import { useEffect, useRef, useState } from 'react';
import '../css/Video.css';

function Video() {
    const canvasRef = useRef(null); // 영상을 표시할 구역
    const playerRef = useRef(null); // 영상
    const [ready, setReady] = useState(false); // 영상을 내보낼지 보내지 말지 여부
    const [hasSignal, setHasSignal] = useState(false); // 영상이 출력 되는지 안되는지

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

        playerRef.current = new window.JSMpeg.Player('ws://58.79.238.184:4002', {
            canvas: canvasRef.current,
            autoplay: true,
            onPlay: () => setHasSignal(true),   // 영상 재생 시작
            onPause: () => setHasSignal(false), // 신호 끊김
        });

        return () => {
            if (playerRef.current) playerRef.current.destroy();
        };
    }, [ready]);

    return (
        <div className='livqCQ'>
            <h2 className='video_title'>Video</h2>
            <div className="video_wrapper">
                <canvas ref={canvasRef} className='video'></canvas> 
                <span className="no_signal" style={{ display: hasSignal ? 'none' : 'block' }}>
                    NO SIGNAL
                </span>
            </div>
        </div>
    );
}

export default Video;
