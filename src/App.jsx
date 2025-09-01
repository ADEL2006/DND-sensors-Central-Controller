import { useRadarSocket } from './data/RadarSocket';
import Radar from './components/Radar';
import Record from './components/Record';
import './App.css';

export default function App() {
    const { wsStatus, dataArray } = useRadarSocket();

    return (
        <div className='main'>
            <div className='radar'>
                <h1>WebSocket 상태: {wsStatus}</h1>
                <h2>Radar</h2>
                <Radar dataArray={dataArray} />
            </div>
            <div className='record'>
                <h2>Record</h2>
                <Record dataArray={dataArray} />
            </div>
        </div>
    );
}
