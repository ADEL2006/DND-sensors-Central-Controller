import { useRadarSocket } from './data/RadarSocket';
import Radar from './components/Radar';
import Record from './components/Record';
import Video from './components/Video';
import './App.css';
import { useState, useEffect } from 'react';
import dnetImg from './img/dnet.png'; // App.jsx 기준 상대 경로
import { data } from 'react-router-dom';

export default function App() {
    const { wsStatus, dataArray } = useRadarSocket();
    const [connectionStatusColor, setConnectionStatusColor] = useState("red"); // 기본값 red
    const [sensorStatusColor, setSensorStatusColor] = useState("lime");
    const [sensorStatus, setSensorStatus] = useState("이상없음")

    useEffect(() => {
        if (dataArray.length > 0) {
            setSensorStatusColor("red");
            setSensorStatus("칩입자 감지!")
        }
    }, [dataArray])

    return (
        <div className='main'>
            <div className='main_title'>
                <img src={dnetImg} className='dnet_logo' />
                <h1 style={{ width: "1220.31px", textAlign: "center" }}>
                    센서 상태: <span style={{ color: sensorStatusColor }}>{sensorStatus}</span>
                </h1>
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
