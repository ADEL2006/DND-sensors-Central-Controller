import { useState, useEffect, useRef } from 'react';

import '../css/MainTitle.css';
import dnetImg from '../img/dnet.png'; // App.jsx 기준 상대 경로
import { data } from 'react-router-dom';
import Guide from './Guide';

function MainTitle({ wsStatus, dataArray, device, setIsSettingOpen }) {
    const [sensorStatusColor, setSensorStatusColor] = useState("lime"); // 센서 상태값 색상
    const [sensorStatus, setSensorStatus] = useState("정상"); // 센서 상태값
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767); // 모바일 여부
    const [connectionStatusColor, setConnectionStatusColor] = useState("red"); // 기본값 red
    const [marginBottom, setMarginBottom] = useState("20px") // 제목의 아래 마진값
    const resetTimer = useRef(null); // 타이머 초기화

    // 감지 상황 초기화
    useEffect(() => {
        setSensorStatusColor("lime");
        setSensorStatus("정상");
    }, [device]);

    // 데이터가 들어올때
    useEffect(() => {
        // 데이터가 존재한다면
        if (dataArray.length > 0) {
            setSensorStatusColor("red");
            setSensorStatus("침입자 탐지!")
        }

        // 기존 타이머가 있으면 취소
        if (resetTimer.current) clearTimeout(resetTimer.current);

        // 새 타이머 시작
        // 센서와 연결된 상태에서 5초 이상 데이터가 오지 않는다면 상태값 초기화
        resetTimer.current = setTimeout(() => {
            if (wsStatus === "Connected") {
                console.log("5초 유예 후 레이더 상태 정상화!");
                setSensorStatusColor("lime");
                setSensorStatus("정상")
            }
            resetTimer.current = null; // 타이머 종료 후 초기화
        }, 5000);

        // cleanup
        return () => {
            if (resetTimer.current) clearTimeout(resetTimer.current);
        };
    }, [dataArray]);

    // 상태값 변경 시 색상 업데이트
    useEffect(() => {
        if (wsStatus === "Connected") {
            setConnectionStatusColor("lime");
        } else {
            setConnectionStatusColor("red");
            if(wsStatus === "Connection failed" && isMobile) {
                setMarginBottom("35px")
            } else {
                setMarginBottom("20px")
            }
        }
    }, [wsStatus]);

    return (
        <div className='main_title' style={{ marginBottom: marginBottom }}>
            <div className='logo_wrapper'>
                <a href="http://www.dno.co.kr/" target="_blank" rel="noopener noreferrer">
                    <img src={dnetImg} className="dnet_logo" alt="DNET Logo" />
                </a>
                <span className="glow"></span>
            </div>
            <h1 className='statuses'>
                <span className='sensor_connection_status_container'>
                    센서 연결 상태: 
                    { (isMobile && wsStatus === "Connection failed") && <br />}
                    <span className='sensor_connection_status' style={{ color: connectionStatusColor }}> {wsStatus}</span> 
                    { isMobile && <br /> }
                </span>
                <span className='detection_status_container'>
                    감지 상황: 
                    <span style={{ color: sensorStatusColor }}>{sensorStatus}</span>
                </span>
                
            </h1>
            {!isMobile && (<Guide setIsSettingOpen={setIsSettingOpen} sensorStatus={sensorStatus} wsStatus={wsStatus} />)}
        </div>
    )
}
export default MainTitle;