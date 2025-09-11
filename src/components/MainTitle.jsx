import { useState, useEffect, useRef } from 'react';

import '../css/MainTitle.css';
import dnetImg from '../img/dnet.png'; // App.jsx 기준 상대 경로
import Manual from './Manual';
import { data } from 'react-router-dom';

function MainTitle({ wsStatus, dataArray }) {
    const [sensorStatusColor, setSensorStatusColor] = useState("lime");
    const [sensorStatus, setSensorStatus] = useState("정상");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
    const [connectionStatusColor, setConnectionStatusColor] = useState("red"); // 기본값 red

    useEffect(() => {
        if (dataArray.length > 0) {
            setSensorStatusColor("red");
            setSensorStatus("침입자 탐지!")
        }
    }, [dataArray]);

    // wsStatus 변경 시 색상 업데이트
    useEffect(() => {
        if (wsStatus === "Connected") {
            setConnectionStatusColor("lime");
        } else {
            setConnectionStatusColor("red");
        }
    }, [wsStatus]);

    return (
        <div className='main_title'>
            <div className='logo_wrapper'>
                <a href="http://www.dno.co.kr/" target="_blank" rel="noopener noreferrer">
                    <img src={dnetImg} className="dnet_logo" alt="DNET Logo" />
                </a>
                <span className="glow"></span>
            </div>
            <h1 className='detection_status'>
                센서 연결 상태: <span className='sensor_connection_status' style={{ color: connectionStatusColor }}>{wsStatus}</span> { isMobile && <br /> }
                감지 상황: <span style={{ color: sensorStatusColor }}>{sensorStatus}</span>
            </h1>
            {/* <h3 className='connection_status'>
                <span style={{ color: connectionStatusColor }}>{wsStatus}</span>
            </h3> */}
            {!isMobile && (<Manual />)}
        </div>
    )
}
export default MainTitle;