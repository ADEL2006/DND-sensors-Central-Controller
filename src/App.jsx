import { useRadarSocket } from './data/RadarSocket';
import Radar from './components/Radar';
import Record from './components/Record';
import Video from './components/Video';
import './App.css';
import { useState, useEffect } from 'react';

export default function App() {
    const { wsStatus, dataArray } = useRadarSocket();
    const [statusColor, setStatusColor] = useState("red"); // 기본값 red

    // wsStatus 변경 시 색상 업데이트
    useEffect(() => {
        if (wsStatus === "연결됨") {
            setStatusColor("lime");
        } else {
            setStatusColor("red");
        }
    }, [wsStatus]);

    return (
        <div className='main'>
            <div className='main_title'>
                <h1>
                    센서 상태: <span style={{ color: statusColor }}>{wsStatus}</span>
                </h1>
            </div>
            <div className='contents'>
                <Radar dataArray={dataArray} />
                <div className='right_element'>
                    <Video />
                    <Record dataArray={dataArray} />
                </div>
            </div>
        </div>
    );
}
