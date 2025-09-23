import { useEffect, useState } from 'react';
import '../css/Guide.css'

function Guide({ setIsSettingOpen, sensorStatus }) {
    const [showGuide, setshowGuide] = useState(false); // 가이드 표시 여부
    const [guidePage, setguidePage] = useState(1); // 가이드 페이지

    const [connectionGuideSize, setConnectionGuideSize] = useState([[]]);
    const [radarStatusGuideSize, setRadarStatusGuideSize] = useState([[]]);

    // 가이드 on/off 토글 힘수
    function toggleGuide() {
        setshowGuide(prev => !prev);
        setguidePage(1);
        setIsSettingOpen(false);
    }

    // 가이드 다음 페이지
    function nextPage() {
        setguidePage(guidePage + 1);
    }

    // 가이드 이전 페이지
    function prevPage() {
        setguidePage(guidePage - 1);
    }

    useEffect(() => {
        if(guidePage === 3) setIsSettingOpen(true);
        else setIsSettingOpen(false);
    }, [guidePage])

    useEffect(() => {
        if (sensorStatus === "정상") {
            setConnectionGuideSize([
                ['620px', '100px', '350px', '24px'],
                ['inset(0px 0px 800px 985px)'],
                ['inset(0px 1350px 800px 0px)']
            ]);

            setRadarStatusGuideSize([
                ['365px', '100px', '960px', '24px'],
                ['inset(0px 650px 800px 0px)'],
                ['inset(0px 0px 800px 1350px)']
            ]);
        } else if(sensorStatus === "침입자 탐지!") {
            setConnectionGuideSize([
                ['575px', '100px', '290px', '24px'],
                ['inset(0px 0px 800px 900px)'],
                ['inset(0px 1350px 800px 0px)']
            ]);

            setRadarStatusGuideSize([
                ['505px', '100px', '890px', '24px'],
                ['inset(0px 720px 800px 0px)'],
                ['inset(0px 0px 800px 1350px)']
            ]);
        }
    }, [sensorStatus])

    return (
        <>
            <button onClick={toggleGuide} className='guide_toggle_button'>
                가이드
            </button>

            {(showGuide && guidePage === 1) && (
                <>
                    <div className='guide_background' style={{ clipPath: 'inset(140px 0px 0px 0px)', borderRight: '2px solid rgba(0, 0, 0, 0.8)' }}>
                        <div id='guide_connection' className='guide'>
                            <span className='guide_content'>
                                센서와의 연결 상태입니다. <br />
                                Connected: 정상적으로 연결됨 <br />
                                Connecting: 연결 시도중
                            </span>
                            <div className='guide_buttons'>
                                <div id='guide_button_spacer' className='guide_nav_button'></div>
                                <span className='guide_page_count'>1 / 6</span>
                                <button onClick={nextPage} className='guide_nav_button'>다음</button>
                                <button onClick={toggleGuide} className='guide_close_button'>닫기</button>
                            </div>
                        </div>
                    </div>
                    <div className='guide_area' style={{ 
                        width: connectionGuideSize[0][0], 
                        height: connectionGuideSize[0][1], 
                        left: connectionGuideSize[0][2], 
                        top: connectionGuideSize[0][3] 
                        }} >
                        <div id='line_connection' class="diagonal-line" />
                    </div>
                    <div className='guide_background' style={{ clipPath: connectionGuideSize[1][0] }} />
                    <div className='guide_background' style={{ clipPath: connectionGuideSize[2][0] }} />
                </>
            )}

            {(showGuide && guidePage === 2) && (
                <>
                    <div className='guide_background' style={{ clipPath: 'inset(140px 0px 0px 0px)', borderRight: '2px solid rgba(0, 0, 0, 0.8)' }}>
                        <div id='guide_radar_status' className='guide'>
                            <span className='guide_content'>
                                레이더의 감지 상황 입니다.<br />
                                아무 이상이 없을때: <span style={{ color: 'lime' }}>정상</span> <br />
                                칩입자가 감지되었을때: <span style={{ color: 'red' }}>칩입자 탐지!</span><br />
                            </span>
                            <div className='guide_buttons'>
                                <button onClick={prevPage} className='guide_nav_button'>이전</button>
                                <span className='guide_page_count'>2 / 6</span>
                                <button onClick={nextPage} className='guide_nav_button'>다음</button>
                                <button onClick={toggleGuide} className='guide_close_button'>닫기</button>
                            </div>
                        </div>
                    </div>
                    <div className='guide_area' style={{ 
                        width: radarStatusGuideSize[0][0], 
                        height: radarStatusGuideSize[0][1], 
                        left: radarStatusGuideSize[0][2], 
                        top: radarStatusGuideSize[0][3]
                        }} >
                        <div id='line_radar_status' class="diagonal-line" />
                    </div>
                    <div className='guide_background' style={{ clipPath: radarStatusGuideSize[1][0], }} />
                    <div className='guide_background' style={{ clipPath: radarStatusGuideSize[2][0], }} />
                </>
            )}
            
            {(showGuide && guidePage === 3) && (
                <>
                    <div className='guide_background' style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}>
                        <div id='line_setting' class="diagonal-line" />
                        <div id='guide_setting' className='guide'>
                            <span className='guide_content'>
                                우측 상단의 버튼으로 볼 수 있는 설정 화면 입니다.<br />
                                이곳에서 IP, 튀는값 제어, 표시 거리, 애니메이션 등 <br />
                                여러가지 설정이 가능합니다
                            </span>
                            <div className='guide_buttons'>
                                <button onClick={prevPage} className='guide_nav_button'>이전</button>
                                <span className='guide_page_count'>3 / 7</span>
                                <button onClick={nextPage} className='guide_nav_button'>다음</button>
                                <button onClick={toggleGuide} className='guide_close_button'>닫기</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {(showGuide && guidePage === 4) && (
                <>
                    <div className='guide_background' style={{ clipPath: 'inset(0px 0px 0px 998px)', marginLeft: '2px' }}>
                        <div id='line_radar' class="diagonal-line" />
                        <div id='guide_radar' className='guide'>
                            <span className='guide_content'>
                                레이더 화면 입니다.<br />
                                감지된 사물은 이곳에 표시되며, <br />
                                사물이 이동한 동선을 표시합니다.<br />
                            </span>
                            <div className='guide_buttons'>
                                <button onClick={prevPage} className='guide_nav_button'>이전</button>
                                <span className='guide_page_count'>4 / 7</span>
                                <button onClick={nextPage} className='guide_nav_button'>다음</button>
                                <button onClick={toggleGuide} className='guide_close_button'>닫기</button>
                            </div>
                        </div>
                    </div>
                    <div className='guide_background' style={{ clipPath: 'inset(0px 600px 800px 0px)', }} />
                </>
            )}

            {(showGuide && guidePage === 5) && (
                <>
                    <div className='guide_background' style={{ clipPath: 'inset(0px 0px 0px 998px)', marginLeft: '2px' }}>
                        <div id='line_radar' class="diagonal-line" />
                        <div id='guide_radar' className='guide'>
                            <span className='guide_content'>
                                왼쪽 상단의 기기 선택 메뉴가 있으며, <br />
                                연결할 기기를 선택할 수 있습니다.<br />
                                &nbsp;&nbsp;&nbsp;
                            </span>
                            <div className='guide_buttons'>
                                <button onClick={prevPage} className='guide_nav_button'>이전</button>
                                <span className='guide_page_count'>5 / 7</span>
                                <button onClick={nextPage} className='guide_nav_button'>다음</button>
                                <button onClick={toggleGuide} className='guide_close_button'>닫기</button>
                            </div>
                        </div>
                    </div>
                    <div className='guide_background' style={{ clipPath: 'inset(0px 600px 800px 0px)', }} />
                </>
            )}

            {(showGuide && guidePage === 6) && (
                <>
                    <div className='guide_background' style={{ clipPath: 'inset(0px 602px 0px 0px)', }}>
                        <div id='line_video' class="diagonal-line" />
                        <div id='guide_video' className='guide'>
                            <span className='guide_content'>
                                카메라 화면 입니다.<br />
                                현재 감지중인 영역을 촬영하며, 사물이 감지된다면 해당 방향으로 화면을 전환합니다.<br />
                            </span>
                            <div className='guide_buttons'>
                                <button onClick={prevPage} className='guide_nav_button'>이전</button>
                                <span className='guide_page_count'>6 / 7</span>
                                <button onClick={nextPage} className='guide_nav_button'>다음</button>
                                <button onClick={toggleGuide} className='guide_close_button'>닫기</button>
                            </div>
                        </div>
                    </div>
                    <div className='guide_background' style={{ clipPath: 'inset(526px 0px 0px 996px)', marginLeft: '2px' }} />
                    <div className='guide_background' style={{ clipPath: 'inset(0px 0px 800px 0px)', }} />
                </>
            )}
            
            {(showGuide && guidePage === 7) && (
                <>
                    <div className='guide_background' style={{ clipPath: 'inset(0px 602px 0px 0px)', }}>
                        <div id='line_record' class="diagonal-line" />
                        <div id='guide_record' className='guide'>
                            <span className='guide_content'>
                                기록 화면 입니다.<br />
                                감지된 사물의 마지막 정보를 기록합니다. <br />
                                속도 표시에 ↑는 이탈중, ↓는 접근중 이라는 의미입니다<br />
                                auto record: 서버에 감지 기록을 저장합니다.
                            </span>
                            <div className='guide_buttons'>
                                <button onClick={prevPage} className='guide_nav_button'>이전</button>
                                <span className='guide_page_count'>7 / 7</span>
                                <div id="guide_button_spacer" className='guide_nav_button'></div>
                                <button onClick={toggleGuide} className='guide_close_button'>닫기</button>
                            </div>
                        </div>
                    </div>
                    <div className='guide_background' style={{ clipPath: 'inset(0px 0px 416px 996px)', marginLeft: '2px' }} />
                </>
            )}

        </>
    );
}

export default Guide;
