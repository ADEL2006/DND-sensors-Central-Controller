import { useEffect, useRef, useState } from 'react';
import '../css/Video.css';

function Video() {
    const canvasRef = useRef(null);
    const playerRef = useRef(null);
    const [ready, setReady] = useState(false);

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

        playerRef.current = new window.JSMpeg.Player('ws://localhost:9999', {
            canvas: canvasRef.current,
            autoplay: true,
        });

        return () => {
            if (playerRef.current) playerRef.current.destroy();
        };
    }, [ready]);

    return (
        <div className='video'>
            <h2 className='video_title'>Video</h2>
            <canvas ref={canvasRef} style={{ width: '100%', height: 'auto' }}/> 
        </div>
    );
}

export default Video;
