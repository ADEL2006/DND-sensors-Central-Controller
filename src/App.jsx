import { useEffect, useRef, useState } from 'react';
import { useRadarSocket } from './data/RadarSocket';
import MainTitle from './components/MainTitle';
import Radar from './components/Radar';
import Video from './components/Video';
import Record from './components/Record';
import './App.css';
import setting from './img/setting.png'
import { ServerSocket } from './data/ServerSocket';

export default function App() {
    const didFetch = useRef(false); // 초기 설정값 중복 호출 방지용

    // 초기 랜더링시 데이터 꼬임 방지 변수들
    const blockFirstPush = useRef(0);
    const blockFirstDefaultIp = useRef(0);
    const blockFirstDefaultDistance = useRef(0);

    const [device, setDevice] = useState("DND-500T"); // 디바이스값
    const [deviceTop, setDeviceTop] = useState("125px"); // 모바일용 디바이스 선택 버튼 위치 조정

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767); // 모바일 인지 아닌지 판단
    const [settingButtonTop, setSettingButtonTop] = useState("55px"); // 모바일용 설정 버튼 위치 조정
    const [isSettingOpen, setIsSettingOpen] = useState(false); // 설정창 오픈 여부

    const [useDefaultIp, setUseDefaultIp] = useState(); // 기본 아이피 사용 여부
    const [isPublic, setIsPublic] = useState(); // 내/외부 아이피 사용 여부
    const [DND_500TIp, setDND_500TIp] = useState(); // 500T 아이피값
    const [DND_1000TIp, setDND_1000TIp] = useState(); // 1000T 아이피값

    const [noiseFilterLevel, setNoiseFilterLevel] = useState(); // 튀는값 제어값

    const [useDefaultDistance, setUseDefaultDistance] = useState(); // 기본 거리 사용 여부
    const [distance_500T, setDistance_500T] = useState(); // 500T 표시 거리값
    const [distance_1000T, setDistance_1000T] = useState(); // 1000T 표시 거리값

    const [animationSetting, setAnimationSetting] = useState(); // 애니메이션 표시 방식

    const [videoURL, setVideoURL] = useState();

    // const { wsStatus, dataArray } = useRadarSocket(device, DND_500TIp, DND_1000TIp); // 센서와의 연결상태 / 데이터값
    const { wsStatus, dataArray } = ServerSocket(); // 센서와의 연결상태 / 데이터값
    const colors = useRef([]) // 색상 정보

    // 세팅값 얻기
    useEffect(() => {
        // 이미 한번 호출했다면 스킵
        if (didFetch.current) return;
        didFetch.current = true;

        fetch('http://58.79.238.184:4000/setting/get', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(res => {
                if (!res.ok) throw new Error('GET 실패');
                return res.json();
            })
            .then(data => {
                console.log('서버 응답:', data);
                setUseDefaultIp(data.useDefaultIP);
                setIsPublic(data.usePublicIp);
                setDND_500TIp(data.ip500T);
                setDND_1000TIp(data.ip1000T);
                setUseDefaultDistance(data.useDefaultDistance);
                setDistance_500T(data.distance500T);
                setDistance_1000T(data.distance1000T);
                setAnimationSetting(data.animationSetting);
                setNoiseFilterLevel(data.noiseFilterLevel);
                setVideoURL(data.videoURL);
            })
            .catch(err => console.error('GET 요청 실패:', err));
    }, [])

    // 선택 디바이스 변경 토글
    const changeDevice = (e) => {
        setDevice(e.target.value);
    };

    // 설정창 오픈/저장 토글
    function handleSettingToggle() {
        if (isSettingOpen) { // 설정창을 닫는 시점
            // 서버로 보냘 데이터 포맷
            const settingData = {
                id: 1,
                useDefaultIP: useDefaultIp,
                usePublicIp: isPublic,
                ip500T: DND_500TIp,
                ip1000T: DND_1000TIp,
                noiseFilterLevel: Number(noiseFilterLevel),
                useDefaultDistance: useDefaultDistance,
                distance500T: Number(distance_500T),
                distance1000T: Number(distance_1000T),
                animationSetting: animationSetting,
                device: device,
                videoURL: videoURL
            };

            // 서버로 데이터 전송
            fetch('http://58.79.238.184:4000/setting/push', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingData)
            })
                .then(res => {
                    if (!res.ok) throw new Error('POST 실패');
                    return res.json();
                })
                .then(data => console.log('서버 응답:', data))
                .catch(err => console.error('POST 요청 실패:', err));
        }
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

    // 내/외부 아이피 시용 여부가 변경될떄
    useEffect(() => {
        // 아직 서버로 부터 값을 받지 못했다면 스킵
        if(isPublic === undefined) return;

        // 서버로 부터 받은 값은 해당 조건에서 제외
        if(blockFirstDefaultIp.current >= 1) {
            if (isPublic) { // 외부 아이피를 사용할때
                setDND_500TIp("ws://58.79.238.184:2001");
                setDND_1000TIp("ws://58.79.238.184:2002");
            } else {        // 내부 아이피를 사용할때
                setDND_500TIp("ws://192.168.0.202:1883");
                setDND_1000TIp("ws://192.168.0.124:1883");
            }
            console.log("Change ips by isPublic");
        } else {
            blockFirstDefaultIp.current++;
        }
    }, [isPublic]);

    // 기본 거리 사용 여부가 변경될때
    useEffect(() => {
        // 아직 서버로 부터 값을 받지 못했다면 스킵
        if(useDefaultDistance == undefined) return;

        // 서버로 부터 받은 값은 해당 조건에서 제외
        if(blockFirstDefaultDistance.current >= 1 && useDefaultDistance) {
            setDistance_500T(600);
            setDistance_1000T(1200);
        } else {
            blockFirstDefaultDistance.current++;
        }
    }, [useDefaultDistance]);

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
        if (!dataArray) return; // dataArray가 null이면 바로 종료
        dataArray.forEach(obj => {
            const targetId = parseInt(obj.targetId, 10);

            // 이미 값이 있으면 건너뛰기, 초기 0~7번은 건너뜀
            if (colors.current[targetId] || targetId < 8) return;

            // 랜덤 색상 생성
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);

            colors.current[targetId] = `rgba(${r},${g},${b},1)`;
        });
    }, [dataArray]);

    // 선택 기기를 바꿀때마다 해당 사항을 서버에 전송
    useEffect(() => {
        // 첫번째 로딩은 스킵
        if(blockFirstPush == 1){
            // 서버로 보낼 데이터 포맷
            const settingData = {
                id: 1,
                useDefaultIP: useDefaultIp,
                usePublicIp: isPublic,
                ip500T: DND_500TIp,
                ip1000T: DND_1000TIp,
                noiseFilterLevel: Number(noiseFilterLevel),
                useDefaultDistance: useDefaultDistance,
                distance500T: Number(distance_500T),
                distance1000T: Number(distance_1000T),
                animationSetting: animationSetting,
                device: device
            };

            // 서버로 데이터 전송
            fetch('http://58.79.238.184:4000/setting/push', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingData)
            })
                .then(res => {
                    if (!res.ok) throw new Error('PUT 실패');
                    return res.json();
                })
                // .then(data => console.log('서버 응답:', data))
                .catch(err => console.error('PUT 요청 실패:', err));

            console.log("send setting data from device")
        } else {
            blockFirstPush.current++;
        }
    }, [device])

    return (
        <div className='main'>
            <MainTitle wsStatus={wsStatus} dataArray={dataArray} device={device} setIsSettingOpen={setIsSettingOpen} />
            <button className='setting_button' onClick={handleSettingToggle} style={isMobile ? { top: settingButtonTop } : {}}>
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
                                <span style={{color: useDefaultIp ? "white" : "gray"}}>외부 IP 사용(off시 내부 IP 사용)</span>
                                <div className="wrapper">
                                    <input type="checkbox" id="is_public" onChange={handlePublicSettingToggle} checked={isPublic} disabled={!useDefaultIp} />
                                    <label htmlFor="is_public" className="switch_label" style={{ border: useDefaultIp ? "2px solid white" : "2px solid gray"}}>
                                        <span className="onf_btn"></span>
                                    </label>
                                </div>
                            </div>
                            <div id="first_input" className="setting_row" style={{ color: useDefaultIp ? "gray" : "white" }}>
                                <span>500T IP</span>
                                <input className='ip_input' type='text' readOnly={useDefaultIp} style={{ backgroundColor: useDefaultIp ? "gray" : "white" }} value={DND_500TIp} onChange={(e) => setDND_500TIp(e.target.value)} />
                            </div>
                            <div className="setting_row" style={{ color: useDefaultIp ? "gray" : "white" }}>
                                <span>1000T IP</span>
                                <input className='ip_input' type='text' readOnly={useDefaultIp} style={{ backgroundColor: useDefaultIp ? "gray" : "white" }} value={DND_1000TIp} onChange={(e) => setDND_1000TIp(e.target.value)} />
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
                            <div id="first_input" className="setting_row" style={{ color: useDefaultDistance ? "gray" : "white" }}>
                                <span>500T 표시 거리</span>
                                <input className='ip_input' type='text' readOnly={useDefaultDistance} style={{ backgroundColor: useDefaultDistance ? "gray" : "white" }} value={distance_500T} onChange={(e) => setDistance_500T(e.target.value)} />
                            </div>
                            <div className="setting_row" style={{ color: useDefaultDistance ? "gray" : "white" }}>
                                <span>1000T 표시 거리</span>
                                <input className='ip_input' type='text' readOnly={useDefaultDistance} style={{ backgroundColor: useDefaultDistance ? "gray" : "white" }} value={distance_1000T} onChange={(e) => setDistance_1000T(e.target.value)} />
                            </div>

                            <div className="setting_row">
                                <span>애니메이션 표시</span>
                                <select onChange={changeAnimationSetting} value={animationSetting} className='animation_setting'>
                                    <option value={0}>켜기</option>
                                    <option value={1}>감지된 상황만 끄기</option>
                                    <option value={2}>끄기</option>
                                </select>
                            </div>

                            <div className="setting_row">
                                <span>CCTV URL</span>
                                <textarea className='ip_input' id='camera_ip_input' type='text' style={{ backgroundColor: "white" }} value={videoURL} onChange={(e) => setVideoURL(e.target.value)} />
                            </div>

                            <button className='setting_close_button' onClick={handleSettingToggle}>
                                완료
                            </button>
                        </span>
                    </div>
                </div>
            )}

            <div className='contents'>
                <select onChange={changeDevice} value={device} className='device' style={isMobile ? { top: deviceTop } : {}}>
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
