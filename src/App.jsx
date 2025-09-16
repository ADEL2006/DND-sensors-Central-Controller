import { useRadarSocket } from './data/RadarSocket';
import MainTitle from './components/MainTitle';
import Radar from './components/Radar';
import Video from './components/Video';
import Record from './components/Record';
import './App.css';
import { useEffect, useRef, useState } from 'react';

export default function App() {
    const [device, setDevice] = useState("DND-1000T");

    const { wsStatus, dataArray } = useRadarSocket(device);
    const colors = useRef([])

    const changeDevice = (e) => {
        setDevice(e.target.value);
    };

    useEffect(() => {
        for (var i = 0; i < 250; i++) {
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
            } else {
                r = Math.floor(Math.random() * 256);
                g = Math.floor(Math.random() * 256);
                b = Math.floor(Math.random() * 256);
            }
            colors.current.push(`rgba(${r},${g},${b},1)`)
        }
    }, [])

    return (
        <div className='main'>
            <MainTitle wsStatus={wsStatus} dataArray={dataArray} />
            <div className='contents'>
                <select onChange={changeDevice} value={device} className='device'>
                    <option value="DND-500T">DND-500T</option>
                    <option value="DND-1000T">DND-1000T</option>
                </select>
                <Radar dataArray={dataArray} device={device} colors={colors} />
                <div className='right_element'>
                    <Video />
                    <Record dataArray={dataArray} colors={colors} />
                </div>
            </div>
        </div>
    );
}
