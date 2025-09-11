import { useRadarSocket } from './data/RadarSocket';
import MainTitle from './components/MainTitle';
import Radar from './components/Radar';
import Video from './components/Video';
import Record from './components/Record';
import './App.css';
import { data } from 'react-router-dom';

export default function App() {
    const { wsStatus, dataArray } = useRadarSocket();

    return (
        <div className='main'>
            <MainTitle dataArray={dataArray} />
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
