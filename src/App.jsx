import { useEffect, useRef, useState } from 'react';
import { useRadarSocket } from './data/RadarSocket';
import MainTitle from './components/MainTitle';
import Radar from './components/Radar';
import Video from './components/Video';
import Record from './components/Record';
import './App.css';
import setting from './img/setting.png'

export default function App() {
    const [device, setDevice] = useState("DND-500T"); // 디바이스값

    const { wsStatus, dataArray } = useRadarSocket(device); // 센서와의 연결상태 / 데이터값
    const colors = useRef([]) // 색상 정보

    const [isSettingOpen, setIsSettingOpen] = useState(false);

    const [isPublic, setIsPublic] = useState(true);
    const [useDefaultIp, setUseDefaultIp] = useState(true);
    const [displayIp, setDisplayIp] = useState("gray");
    const [DND_500T, setDND_500T] = useState("ws://58.79.238.184:2000")
    const [DND_1000T, setDND_1000T] = useState("ws://58.79.238.184:2001")
    const [distance_500T, setDistance_500T] = useState(600);
    const [distance_1000T, setDistance_1000T] = useState(1200);
    const [animationSetting, setAnimationSetting] = useState(1);

    // 선택 디바이스 변경 토글
    const changeDevice = (e) => {
        setDevice(e.target.value);
    };

    function handleSettingToggle() {
        setIsSettingOpen(prev => !prev);
    }
    function handlePublicSettingToggle() {
        setIsPublic(prev => !prev);
    }
    function handleDefaultIpSettingToggle() {
        setUseDefaultIp(prev => !prev);
    }
    useEffect(() => {
        if(!useDefaultIp) {
            setDisplayIp("white");
        } else {
            setDisplayIp("gray");
        }
    }, [useDefaultIp])

    // 데이터 고유의색 부여
    // 1~7번 까지는 빨주노초파남보
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
            colors.current[i] = `rgba(${r},${g},${b},1)`;
        }
    }, [])
    // 1~7번 이외의 색상은 랜덤
    useEffect(() => {
        dataArray.forEach(obj => {
            const targetId = parseInt(obj.id, 10);

            console.log("id:", obj.id, "targetId:", targetId, "기존 색상:", colors.current[targetId]);
            // 이미 값이 있으면 건너뛰기, 초기 0~7번은 건너뜀
            if (colors.current[targetId] || targetId < 8) return;

            // 랜덤 색상 생성
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);

            console.log(targetId + "번 색상 부여: " + `rgba(${r},${g},${b},1)`);

            colors.current[targetId] = `rgba(${r},${g},${b},1)`;
        });
    }, [dataArray]);



    return (
        <div className='main'>
            <MainTitle wsStatus={wsStatus} dataArray={dataArray} device={device} />
            <button className='setting_button' onClick={handleSettingToggle}>
                <img src={setting} className="setting_img" alt="setting_img" />
            </button>

            {isSettingOpen && (
                <>
                    <div className='setting_background' style={{ borderRight: '2px solid rgba(0, 0, 0, 0.8)' }}>
                        <div className='setting_box'>
                            <span className='setting_content'>

                                <div className="setting_row">
                                    <span>외부 아이피 사용 설정(off시 내부 아이피 사용)</span>
                                    <div className="wrapper">
                                        <input type="checkbox" id="is_public" />
                                        <label htmlFor="is_public" className="switch_label" >
                                            <span className="onf_btn"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="setting_row">
                                    <span>기본 아이피 사용 설정</span>
                                    <div className="wrapper">
                                        <input type="checkbox" id="use_default_ip" onChange={handleDefaultIpSettingToggle} />
                                        <label htmlFor="use_default_ip" className="switch_label">
                                            <span className="onf_btn"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="setting_row" style={{ color: displayIp }}>
                                    <span>500T 아이피 설정</span>
                                    <div className="wrapper">
                                        <input type="checkbox" id="switch" />
                                        <label htmlFor="switch" className="switch_label">
                                            <span className="onf_btn"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="setting_row" style={{ color: displayIp }}>
                                    <span>1000T 아이피 설정</span>
                                    <div className="wrapper">
                                        <input type="checkbox" id="switch" />
                                        <label htmlFor="switch" className="switch_label">
                                            <span className="onf_btn"></span>
                                        </label>
                                    </div>
                                </div>

                                500T 표시 거리 설정<br />
                                1000T 표시 거리 설정<br />
                                <button className='setting_close_button' onClick={handleSettingToggle}>
                                    완료
                                </button>
                            </span>
                        </div>
                    </div>
                </>
            )}

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
