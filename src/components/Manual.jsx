import { useState } from 'react';
import '../css/Manual.css'

function Manual() {
    const [showManual, setShowManual] = useState(false);
    const [manualPage, setManualPage] = useState(1);

    function toggleManual() {
        setShowManual(prev => !prev);
        setManualPage(1);
    }

    function nextPage() {
        setManualPage(manualPage + 1);
    }

    function prevPage() {
        setManualPage(manualPage - 1);
    }

    return (
        <>
            <button onClick={toggleManual} className='manual_button'>
                사용법
            </button>

            {(showManual && manualPage === 1) && (
                <>
                    <div className='manual_background' style={{ clipPath: 'inset(0px 0px 0px 998px)', marginLeft: '2px' }}>
                        <div id='line_one' class="diagonal-line"></div>
                        <div id='manual_one' className='manual'>
                            레이더 화면 입니다.<br />
                            감지된 물체는 이곳에 표시되며 물체의 동선을 표시합니다.<br />
                            <div className='manual_close_button'>
                                <button onClick={nextPage}>다음</button>
                                <button onClick={toggleManual} style={{marginLeft: '15px'}}>닫기</button>
                            </div>
                        </div>
                    </div>
                    <div className='manual_background' style={{ clipPath: 'inset(0px 600px 800px 0px)', }}>
                    </div>
                </>
            )}
            {(showManual && manualPage === 2) && (
                <>
                    <div className='manual_background' style={{ clipPath: 'inset(0px 602px 0px 0px)', }}>
                        <div id='line_two' class="diagonal-line"></div>
                        <div id='manual_two' className='manual'>
                            카메라 화면 입니다.<br />
                            현재 감지중인 영역을 촬영하며, 물체가 감지된다면 해당 방향으로 화면을 전환합니다.<br />
                            <div className='manual_close_button'>
                                <button onClick={prevPage}>이전</button>
                                <button onClick={nextPage} style={{marginLeft: '15px'}}>다음</button>
                                <button onClick={toggleManual} style={{marginLeft: '15px'}}>닫기</button>
                            </div>
                        </div>
                    </div>
                    <div className='manual_background' style={{ clipPath: 'inset(532px 0px 0px 996px)', marginLeft: '2px' }}/>
                    <div className='manual_background' style={{ clipPath: 'inset(0px 0px 800px 998px)', }}/>
                </>
            )}
            {(showManual && manualPage === 3) && (
                <>
                    <div className='manual_background' style={{ clipPath: 'inset(0px 602px 0px 0px)', }}>
                        <div id='line_three' class="diagonal-line"></div>
                        <div id='manual_three' className='manual'>
                            기록 화면 입니다.<br />
                            감지된 물체의 마지막 정보를 기록하며 새로운 기록이 온다면 새로운 기록으로 대체됩니다.<br />
                            속도 표시에 ↑는 이탈중, ↓는 접근중 이라는 의미입니다<br />
                            <div className='manual_close_button'>
                                <button onClick={prevPage}>이전</button>
                                <button onClick={toggleManual} style={{marginLeft: '15px'}}>닫기</button>
                            </div>
                        </div>
                    </div>
                    <div className='manual_background' style={{ clipPath: 'inset(0px 0px 410px 996px)', marginLeft: '2px' }}/>
                </>
            )}

        </>
    );
}

export default Manual;
