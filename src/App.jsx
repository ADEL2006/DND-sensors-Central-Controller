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

    const [isSettingOpen, setIsSettingOpen] = useState(false);

    const [isPublic, setIsPublic] = useState(true);
    const [useDefaultIp, setUseDefaultIp] = useState(true);
    const [displayIp, setDisplayIp] = useState("gray");
    const [readOnly, setReadOnly] = useState(false)
    const [DND_500TIp, setDND_500TIp] = useState("ws://58.79.238.184:2000")
    const [DND_1000TIp, setDND_1000TIp] = useState("ws://58.79.238.184:2001")

    const [noiseFilterLevel, setNoiseFilterLevel] = useState(20);

    const [useDefaultDistance, setUseDefaultDistance] = useState(true);
    const [displayDistance, setDisplayDistance] = useState("gray");
    const [distance_500T, setDistance_500T] = useState(600);
    const [distance_1000T, setDistance_1000T] = useState(1200);
    const [animationSetting, setAnimationSetting] = useState("default");

    const { wsStatus, dataArray } = useRadarSocket(device, DND_500TIp, DND_1000TIp); // 센서와의 연결상태 / 데이터값
    const colors = useRef([]) // 색상 정보

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
    function handleUseDefaultDistanceSettingToggle() {
        setUseDefaultDistance(prev => !prev);
    }
    const changeAnimationSetting = (e) => {
        setAnimationSetting(e.target.value);
    }

    useEffect(() => {
        if (!useDefaultIp) {
            setDisplayIp("white");
            setIsPublic(false);
        } else {
            setDisplayIp("gray");
            setDND_500TIp("ws://192.168.0.123:1883");
            setDND_1000TIp("ws://192.168.0.124:1883");
        }
    }, [useDefaultIp])

    useEffect(() => {
        if (useDefaultIp && isPublic) {
            setDND_500TIp("ws://58.79.238.184:2000");
            setDND_1000TIp("ws://58.79.238.184:2001");
        } else if ((useDefaultIp && !isPublic) || !useDefaultIp) {
            setDND_500TIp("ws://192.168.0.201:1883");
            setDND_1000TIp("ws://192.168.0.202:1883");
        }
    }, [isPublic]);
    
    useEffect(() => {
        if (!useDefaultDistance) {
            setDisplayDistance("white");
        } else {
            setDisplayDistance("gray");
            setDistance_500T(600);
            setDistance_1000T(1200);
        }
    }, [useDefaultDistance])

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
                <div className='setting_background' style={{ borderRight: '2px solid rgba(0, 0, 0, 0.8)' }}>
                    <div className='setting_box'>
                        <span className='setting_content'>

                            <div className="setting_row">
                                <span>기본 아이피 사용</span>
                                <div className="wrapper">
                                    <input type="checkbox" id="use_default_ip" onChange={handleDefaultIpSettingToggle} checked={useDefaultIp} />
                                    <label htmlFor="use_default_ip" className="switch_label">
                                        <span className="onf_btn"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="setting_row">
                                <span>외부 아이피 사용(off시 내부 아이피 사용)</span>
                                <div className="wrapper">
                                    <input type="checkbox" id="is_public" onChange={handlePublicSettingToggle} checked={isPublic} disabled={!useDefaultIp} />
                                    <label htmlFor="is_public" className="switch_label" >
                                        <span className="onf_btn"></span>
                                    </label>
                                </div>
                            </div>

                            <div id="first_input" className="setting_row" style={{ color: displayIp }}>
                                <span>500T 아이피</span>
                                <input className='ip_input' type='text' readOnly={useDefaultIp} style={{ backgroundColor: displayIp }} value={DND_500TIp} onChange={(e) => setDND_500TIp(e.target.value)} />
                            </div>
                            <div className="setting_row" style={{ color: displayIp }}>
                                <span>1000T 아이피</span>
                                <input className='ip_input' type='text' readOnly={useDefaultIp} style={{ backgroundColor: displayIp }} value={DND_1000TIp} onChange={(e) => setDND_1000TIp(e.target.value)} />
                            </div>

                            <div className="setting_row" style={{ color: "white" }}>
                                <span>튀는값 제어 (기본 20)</span>
                                <input className='ip_input' type='text' style={{ backgroundColor: "white" }} value={noiseFilterLevel} onChange={(e) => setNoiseFilterLevel(e.target.value)} />
                            </div>
                            

                            {/* <div className="setting_row">
                                <span>기본 거리 설정 사용</span>
                                <div className="wrapper">
                                    <input type="checkbox" id="use_default_distance" onChange={handleUseDefaultDistanceSettingToggle} checked={useDefaultDistance} />
                                    <label htmlFor="use_default_distance" className="switch_label" >
                                        <span className="onf_btn"></span>
                                    </label>
                                </div>
                            </div>

                            <div id="first_input" className="setting_row" style={{ color: displayIp }}>
                                <span>500T 표시 거리</span>
                                <input className='ip_input' type='text' readOnly={useDefaultDistance} style={{ backgroundColor: displayDistance }} value={distance_500T} onChange={(e) => setDistance_500T(e.target.value)} />
                            </div>
                            <div className="setting_row" style={{ color: displayIp }}>
                                <span>1000T 표시 거리</span>
                                <input className='ip_input' type='text' readOnly={useDefaultDistance} style={{ backgroundColor: displayDistance }} value={distance_1000T} onChange={(e) => setDistance_1000T(e.target.value)} />
                            </div>
                            
                            <div className="setting_row" style={{ color: displayIp }}>
                                <span>애니메이션 표시</span>
                                <select onChange={changeAnimationSetting} value={animationSetting} className='animation_setting'>
                                    <option value="on">켜기</option>
                                    <option value="default">감지된 상황만 끄기</option>
                                    <option value="off">끄기</option>
                                </select>
                            </div> */}

                            <button className='setting_close_button' onClick={handleSettingToggle}>
                                완료
                            </button>
                        </span>
                    </div>
                </div>
            )}

            <div className='contents'>
                <select onChange={changeDevice} value={device} className='device'>
                    <option value="DND-500T">DND-500T</option>
                    <option value="DND-1000T">DND-1000T</option>
                </select>
                <Radar wsStatus={wsStatus} dataArray={dataArray} device={device} colors={colors} noiseFilterLevel={noiseFilterLevel} />
                <div className='right_element'>
                    <Video />
                    <Record dataArray={dataArray} colors={colors} />
                </div>
            </div>
        </div>
    );
}
