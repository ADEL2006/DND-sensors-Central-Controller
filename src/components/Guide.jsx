import { useState } from 'react';
import '../css/Guide.css'

function Guide() {
    const [showGuide, setshowGuide] = useState(false); // 가이드 표시 여부
    const [guidePage, setguidePage] = useState(1); // 가이드 페이지

    // 가이드 on/off 토글 힘수
    function toggleGuide() {
        setshowGuide(prev => !prev);
        setguidePage(1);
    }

    // 가이드 다음 페이지
    function nextPage() {
        setguidePage(guidePage + 1);
    }

    // 가이드 이전 페이지
    function prevPage() {
        setguidePage(guidePage - 1);
    }

    return (
        <>
            <button onClick={toggleGuide} className='guide_toggle_button'>
                가이드
            </button>

            {(showGuide && guidePage === 1) && (
                <>
                    <div className='guide_background' style={{ clipPath: 'inset(0px 0px 0px 998px)', marginLeft: '2px' }}>
                        <div id='line_one' class="diagonal-line"></div>
                        <div id='guide_one' className='guide'>
                            <span className='guide_content'>
                                레이더 화면 입니다.<br />
                                감지된 사물은 이곳에 표시되며, <br />
                                사물이 이동한 동선을 표시합니다.<br />
                            </span>
                            <div className='guide_buttons'>
                                <div id='guide_button_spacer' className='guide_nav_button'></div>
                                <span className='guide_page_count'>1 / 3</span>
                                <button onClick={nextPage} className='guide_nav_button'>다음</button>
                                <button onClick={toggleGuide} className='guide_close_button'>닫기</button>
                            </div>
                        </div>
                    </div>
                    <div className='guide_background' style={{ clipPath: 'inset(0px 600px 800px 0px)', }}>
                    </div>
                </>
            )}
            {(showGuide && guidePage === 2) && (
                <>
                    <div className='guide_background' style={{ clipPath: 'inset(0px 602px 0px 0px)', }}>
                        <div id='line_two' class="diagonal-line"></div>
                        <div id='guide_two' className='guide'>
                            <span className='guide_content'>
                                카메라 화면 입니다.<br />
                                현재 감지중인 영역을 촬영하며, 사물이 감지된다면 해당 방향으로 화면을 전환합니다.<br />
                            </span>
                            <div className='guide_buttons'>
                                <button onClick={prevPage} className='guide_nav_button'>이전</button>
                                <span className='guide_page_count'>2 / 3</span>
                                <button onClick={nextPage} className='guide_nav_button'>다음</button>
                                <button onClick={toggleGuide} className='guide_close_button'>닫기</button>
                            </div>
                        </div>
                    </div>
                    <div className='guide_background' style={{ clipPath: 'inset(526px 0px 0px 996px)', marginLeft: '2px' }}/>
                    <div className='guide_background' style={{ clipPath: 'inset(0px 0px 800px 0px)', }}/>
                </>
            )}
            {(showGuide && guidePage === 3) && (
                <>
                    <div className='guide_background' style={{ clipPath: 'inset(0px 602px 0px 0px)', }}>
                        <div id='line_three' class="diagonal-line"></div>
                        <div id='guide_three' className='guide'>
                            <span className='guide_content'>
                                기록 화면 입니다.<br />
                                감지된 사물의 마지막 정보를 기록하며 새로운 정보가 <br />
                                온다면 새로운 기록으로 대체됩니다.<br />
                                속도 표시에 ↑는 이탈중, ↓는 접근중 이라는 의미입니다<br />
                            </span>
                            <div className='guide_buttons'>
                                <button onClick={prevPage} className='guide_nav_button'>이전</button>
                                <span className='guide_page_count'>3 / 3</span>
                                <div id="guide_button_spacer" className='guide_nav_button'></div>
                                <button onClick={toggleGuide} className='guide_close_button'>닫기</button>
                            </div>
                        </div>
                    </div>
                    <div className='guide_background' style={{ clipPath: 'inset(0px 0px 416px 996px)', marginLeft: '2px' }}/>
                </>
            )}

        </>
    );
}

export default Guide;
