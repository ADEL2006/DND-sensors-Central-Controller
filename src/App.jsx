import { useRadarSocket } from './data/RadarSocket';
import Radar from './components/Radar';
import Record from './components/Record';
import Video from './components/Video';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import dnetImg from './img/dnet.png'; // App.jsx 기준 상대 경로
import { data } from 'react-router-dom';
import Manual from './components/Manual';

export default function App() {
    const { wsStatus, dataArray } = useRadarSocket();
    const [connectionStatusColor, setConnectionStatusColor] = useState("red"); // 기본값 red
    const [sensorStatusColor, setSensorStatusColor] = useState("lime");
    const [sensorStatus, setSensorStatus] = useState("정상")
    const [showManual, setShowManual] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

    useEffect(() => {
        if (dataArray.length > 0) {
            setSensorStatusColor("red");
            setSensorStatus("침입자 탐지!")
        }
    }, [dataArray])

    function toggleManual() {
        setShowManual(prev => !prev);
    }

    return (
        <div className='main'>
            <div className='main_title'>
                <a href="http://www.dno.co.kr/" target="_blank" rel="noopener noreferrer">
                    <img src={dnetImg} className="dnet_logo" alt="DNET Logo" />
                </a>
                <h1 className='detection_status'>
                    감지 상황: <span style={{ color: sensorStatusColor }}>{sensorStatus}</span>
                </h1>
                { !isMobile && (<Manual/>)}
            </div>
            <div className='contents'>
                <Radar wsStatus={wsStatus} dataArray={dataArray} />
                <div className='right_element'>
                    <Video />
                    <Record dataArray={dataArray} />
                </div>
            </div>
        </div>
    );
}
