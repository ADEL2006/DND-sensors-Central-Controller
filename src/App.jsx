// src/App.jsx
import { useRadarSocket } from './data/RadarSocket';
import Radar from './components/Radar';
import Record from './components/Record';
import Video from './components/Video';
import './App.css';

export default function App() {
    const { wsStatus, dataArray } = useRadarSocket();

    return (
        <div className='main'>
            <div className='main_title'>
                <h1>WebSocket 상태: {wsStatus}</h1>
            </div>
            <div className='contents'>
                <Radar dataArray={dataArray} />
                <div className='right-element'>
                    <Video />
                    <Record dataArray={dataArray} />
                </div>
            </div>
        </div>
    );
}
