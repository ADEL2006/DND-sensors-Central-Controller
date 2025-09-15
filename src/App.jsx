import { useRadarSocket } from './data/RadarSocket';
import MainTitle from './components/MainTitle';
import Radar from './components/Radar';
import Video from './components/Video';
import Record from './components/Record';
import './App.css';
import { useState } from 'react';

export default function App() {
    const [device, setDevice] = useState("DND-1000T");

    const { wsStatus, dataArray } = useRadarSocket(device);

    const changeDevice = (e) => {
        setDevice(e.target.value);
    };

    return (
        <div className='main'>
            <MainTitle wsStatus={wsStatus} dataArray={dataArray} />
            <div className='contents'>
                <select onChange={changeDevice} value={device} className='device'>
                    <option value="DND-500T">DND-500T</option>
                    <option value="DND-1000T">DND-1000T</option>
                </select>
                <Radar dataArray={dataArray} device={device} />
                <div className='right_element'>
                    <Video />
                    <Record dataArray={dataArray} />
                </div>
            </div>
        </div>
    );
}
