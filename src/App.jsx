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
    const [deviceTop, setDeviceTop] = useState("125px"); // 모바일용 디바이스 선택 버튼 위치 조정

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767); // 모바일 인지 아닌지 판단
    const [settingButtonTop, setSettingButtonTop] = useState("55px"); // 모바일용 설정 버튼 위치 조정
    const [isSettingOpen, setIsSettingOpen] = useState(false); // 설정창 오픈 여부

    const [isPublic, setIsPublic] = useState(true); // 내/외부 아이피 사용 여부
    const [useDefaultIp, setUseDefaultIp] = useState(true); // 기본 아이피 사용 여부
    const [displayIp, setDisplayIp] = useState("gray"); // 아이피 입력 설정 색상
    const [DND_500TIp, setDND_500TIp] = useState("ws://58.79.238.184:2001"); // 500T 아이피값
    const [DND_1000TIp, setDND_1000TIp] = useState("ws://58.79.238.184:2002"); // 1000T 아이피값

    const [noiseFilterLevel, setNoiseFilterLevel] = useState(20); // 튀는값 제어값

    const [useDefaultDistance, setUseDefaultDistance] = useState(true); // 기본 거리 사용 여부
    const [displayDistance, setDisplayDistance] = useState("gray"); // 거리 입력 설정 색상
    const [distance_500T, setDistance_500T] = useState(600); // 500T 표시 거리값
    const [distance_1000T, setDistance_1000T] = useState(1200); // 1000T 표시 거리값

    const [animationSetting, setAnimationSetting] = useState("default"); // 애니메이션 표시 방식

    // const [useDefaultCamera, setUseDefaultCamera] = useState(true); // 기본 카메라 사용 여부
    // const [displayCamera, setDisplayCamera] = useState("gray"); // 카메라 아이피 입력 설정 색상
    // const [cameraIP, setCameraIP] = useState("rtsp://admin:Pp10293849pp%3F%3F@192.168.1.100:554"); // 카메라 아이피값

    const { wsStatus, dataArray } = useRadarSocket(device, DND_500TIp, DND_1000TIp); // 센서와의 연결상태 / 데이터값
    const colors = useRef([]) // 색상 정보

    // 선택 디바이스 변경 토글
    const changeDevice = (e) => {
        setDevice(e.target.value);
    };

    useEffect(() => {
        if(!isSettingOpen) {
            fetch('http://58.79.238.184:4000/ip/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: DND_500TIp
            })
                .then(res => {
                    if (!res.ok) throw new Error('POST 실패');
                    return res.json();
                })
                .then(data => console.log('서버 응답:', data))
                .catch(err => console.error('POST 요청 실패:', err));
        }
    }, [isSettingOpen])

    // 설정창 오픈 토글
    function handleSettingToggle() {
        setIsSettingOpen(prev => !prev);
    }
    // 기본 아이피 사용 토글
    function handleDefaultIpSettingToggle() {
        setUseDefaultIp(prev => !prev);
    }
    // 내/외부 아이피 사용 토글
    function handlePublicSettingToggle() {
        setIsPublic(prev => !prev);
    }
    // 기본 거리 사용 토글
    function handleUseDefaultDistanceSettingToggle() {
        setUseDefaultDistance(prev => !prev);
    }
    // 에니메이션 설정 변경 토글
    const changeAnimationSetting = (e) => {
        setAnimationSetting(e.target.value);
    }
    // 기본 카메라 사용 토글
    // function changeDefaultCameraIPToggle() {
    //     setUseDefaultCamera(prev => !prev);
    // }

    // 기본 아이피 사용 여부가 변경될때
    useEffect(() => {
        if (!useDefaultIp) { // 기본 아이피 사용 안할때
            setDisplayIp("white");
            setIsPublic(false);
        } else { // 기본 아이피 사용 할때
            setDisplayIp("gray");
            setDND_500TIp("ws://192.168.0.202:1883");
            setDND_1000TIp("ws://192.168.0.124:1883");
        }
    }, [useDefaultIp])

    // 내/외부 아이피 시용 여부가 변경될떄
    useEffect(() => {
        if (useDefaultIp && isPublic) { // 외부 아이피를 사용할때
            setDND_500TIp("ws://58.79.238.184:2001");
            setDND_1000TIp("ws://58.79.238.184:2002");
        } else if ((useDefaultIp && !isPublic) || !useDefaultIp) { // 내부 아이피를 사용할때
            setDND_500TIp("ws://192.168.0.202:1883");
            setDND_1000TIp("ws://192.168.0.124:1883");
        }
    }, [isPublic]);
    
    // 기본 거리 사용 여부가 변경될때
    useEffect(() => {
        if (!useDefaultDistance) { // 기본 거리 사용을 안할때
            setDisplayDistance("white");
        } else { // 기본 거리 사용을 할때
            setDisplayDistance("gray");
            setDistance_500T(600);
            setDistance_1000T(1200);
        }
    }, [useDefaultDistance])

    // 기본 카메라 사용 여부가 변경될때
    // useEffect(() => {
    //     if(useDefaultCamera) {
    //         setDisplayCamera("gray");
    //         setCameraIP("rtsp://admin:Pp10293849pp%3F%3F@192.168.1.100:554");
    //     } else {
    //         setDisplayCamera("white");
    //     }
    // }, [useDefaultCamera])

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
    
    useEffect(() => {
        if(wsStatus === "Connection failed" && isMobile) {
            setSettingButtonTop("70px");
            setDeviceTop("140px");
        } else {
            setSettingButtonTop("55px");
            setDeviceTop("125px");
        }
    }, [wsStatus])

    return (
        <div className='main'>
            <MainTitle wsStatus={wsStatus} dataArray={dataArray} device={device} setIsSettingOpen={setIsSettingOpen} />
            <button className='setting_button' onClick={handleSettingToggle} style={ isMobile ? { top: settingButtonTop } : {}}>
                <img src={setting} className="setting_img" alt="setting_img" />
            </button>

            {isSettingOpen && (
                <div className='setting_background'>
                    <div className='setting_box'>
                        <span className='setting_content'>

                            <div className="setting_row">
                                <span>기본 IP 사용</span>
                                <div className="wrapper">
                                    <input type="checkbox" id="use_default_ip" onChange={handleDefaultIpSettingToggle} checked={useDefaultIp} />
                                    <label htmlFor="use_default_ip" className="switch_label">
                                        <span className="onf_btn"></span>
                                    </label>
                                </div>
                            </div>
                            <div className="setting_row">
                                <span>외부 IP 사용(off시 내부 IP 사용)</span>
                                <div className="wrapper">
                                    <input type="checkbox" id="is_public" onChange={handlePublicSettingToggle} checked={isPublic} disabled={!useDefaultIp} />
                                    <label htmlFor="is_public" className="switch_label" >
                                        <span className="onf_btn"></span>
                                    </label>
                                </div>
                            </div>
                            <div id="first_input" className="setting_row" style={{ color: displayIp }}>
                                <span>500T IP</span>
                                <input className='ip_input' type='text' readOnly={useDefaultIp} style={{ backgroundColor: displayIp }} value={DND_500TIp} onChange={(e) => setDND_500TIp(e.target.value)} />
                            </div>
                            <div className="setting_row" style={{ color: displayIp }}>
                                <span>1000T IP</span>
                                <input className='ip_input' type='text' readOnly={useDefaultIp} style={{ backgroundColor: displayIp }} value={DND_1000TIp} onChange={(e) => setDND_1000TIp(e.target.value)} />
                            </div>

                            <div className="setting_row" style={{ color: "white" }}>
                                <span>튀는값 제어 (기본 20)</span>
                                <input className='ip_input' type='text' style={{ backgroundColor: "white" }} value={noiseFilterLevel} onChange={(e) => setNoiseFilterLevel(e.target.value)} />
                            </div>
                            
                            <div className="setting_row">
                                <span>기본 거리 설정 사용</span>
                                <div className="wrapper">
                                    <input type="checkbox" id="use_default_distance" onChange={handleUseDefaultDistanceSettingToggle} checked={useDefaultDistance} />
                                    <label htmlFor="use_default_distance" className="switch_label" >
                                        <span className="onf_btn"></span>
                                    </label>
                                </div>
                            </div>
                            <div id="first_input" className="setting_row" style={{ color: displayDistance }}>
                                <span>500T 표시 거리</span>
                                <input className='ip_input' type='text' readOnly={useDefaultDistance} style={{ backgroundColor: displayDistance }} value={distance_500T} onChange={(e) => setDistance_500T(e.target.value)} />
                            </div>
                            <div className="setting_row" style={{ color: displayDistance }}>
                                <span>1000T 표시 거리</span>
                                <input className='ip_input' type='text' readOnly={useDefaultDistance} style={{ backgroundColor: displayDistance }} value={distance_1000T} onChange={(e) => setDistance_1000T(e.target.value)} />
                            </div>
                            
                            <div className="setting_row">
                                <span>애니메이션 표시</span>
                                <select onChange={changeAnimationSetting} value={animationSetting} className='animation_setting'>
                                    <option value="on">켜기</option>
                                    <option value="default">감지된 상황만 끄기</option>
                                    <option value="off">끄기</option>
                                </select>
                            </div>

                            
                            {/* <div className="setting_row">
                                <span>기본 카메라 주소 사용</span>
                                <div className="wrapper">
                                    <input type="checkbox" id="use_default_camera" onChange={changeDefaultCameraIPToggle} checked={useDefaultCamera} disabled={!useDefaultIp} />
                                    <label htmlFor="use_default_camera" className="switch_label" >
                                        <span className="onf_btn"></span>
                                    </label>
                                </div>
                            </div>
                            <div className="setting_row" style={{color: displayCamera}} >
                                <span>연결할 카메라 주소</span>
                                <input id='camera_ip_input' className='ip_input' type='text' readOnly={useDefaultCamera} style={{ backgroundColor: displayCamera }} value={cameraIP} onChange={(e) => setCameraIP(e.target.value)} />
                            </div> */}

                            <button className='setting_close_button' onClick={handleSettingToggle}>
                                완료
                            </button>
                        </span>
                    </div>
                </div>
            )}

            <div className='contents'>
                <select onChange={changeDevice} value={device} className='device' style={ isMobile ? { top: deviceTop } : {}}>
                    <option value="DND-500T">DND-500T</option>
                    <option value="DND-1000T">DND-1000T</option>
                </select>
                <Radar wsStatus={wsStatus} dataArray={dataArray} device={device} colors={colors} noiseFilterLevel={noiseFilterLevel} distance_500T={distance_500T} distance_1000T={distance_1000T} animationSetting={animationSetting} />
                <div className='right_element'>
                    <Video />
                    <Record dataArray={dataArray} colors={colors} />
                </div>
            </div>
        </div>
    );
}
