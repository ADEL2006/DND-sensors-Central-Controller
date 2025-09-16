import { useRadarSocket } from './data/RadarSocket';
import MainTitle from './components/MainTitle';
import Radar from './components/Radar';
import Video from './components/Video';
import Record from './components/Record';
import './App.css';
import { useEffect, useRef, useState } from 'react';

export default function App() {
    const [device, setDevice] = useState("DND-500T");

    const { wsStatus, dataArray } = useRadarSocket(device);
    const colors = useRef([])

    const changeDevice = (e) => {
        setDevice(e.target.value);
    };

    useEffect(() => {
        for (let i = 0; i < 8; i++) {
            let r = 0;
            let g = 0;
            let b = 0;

            if (i == 1) {
                r = 255;
            } else if (i == 2) {
                r = 255;
                g = 127;
            } else if (i == 3) {
                r = 255;
                g = 255;
            } else if (i == 4) {
                g = 255;
            } else if (i == 5) {
                b = 255;
            } else if (i == 6) {
                r = 75;
                b = 130;
            } else if (i == 7) {
                r = 148;
                b = 211;
            }
            colors.current.push(`rgba(${r},${g},${b},1)`)
        }
    }, [])


    useEffect(() => {
    dataArray.forEach(obj => {
        const targetId = parseInt(obj.id, 10);

        // 이미 값이 있으면 건너뛰기, 초기 0~7번은 건너뜀
        if (colors.current[targetId] || targetId < 8) return;

        // 랜덤 색상 생성
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        // console.log(targetId+"번 색상 부여: " + `rgba(${r},${g},${b},1)`);

        colors.current[targetId] = `rgba(${r},${g},${b},1)`;
    });
    }, [dataArray]);

    return (
        <div className='main'>
            <MainTitle wsStatus={wsStatus} dataArray={dataArray} />
            <div className='contents'>
                <select onChange={changeDevice} value={device} className='device'>
                    <option value="DND-500T">DND-500T</option>
                    <option value="DND-1000T">DND-1000T</option>
                </select>
                <Radar wsStatus={wsStatus} dataArray={dataArray} device={device} colors={colors} />
                <div className='right_element'>
                    <Video />
                    <Record dataArray={dataArray} colors={colors} />
                </div>
            </div>
        </div>
    );
}
