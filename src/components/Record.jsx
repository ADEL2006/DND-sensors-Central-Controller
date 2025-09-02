import { useEffect, useState } from "react";
import '../css/Record.css'

function Record({ dataArray }) {
    const [recordMap, setRecordMap] = useState({}); // id별 데이터 저장

    useEffect(() => {
        if (!dataArray) return;

        setRecordMap(prev => {
            const now = new Date();
            const time = now.toLocaleTimeString('ko-KR', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
            const updated = { ...prev }; // 기존 데이터 복사

            dataArray.forEach(obj => {
                const id = parseFloat(obj.id);
                const angle = parseFloat(obj.a);
                const distance = parseFloat(obj.d);
                let speed = parseFloat(obj.vy);

                let color = "lime";
                let arrow = "↑";

                if (speed < 0) {
                    speed = -speed;
                    color = "red";
                    arrow = "↓";
                }

                if (!isNaN(id) && !isNaN(angle) && !isNaN(distance)) {
                    // HTML 태그를 포함한 문자열 생성
                    updated[id] = {
                        html: `
                            <div style="width:100%; display:flex; gap:0px;">
                                <b id="id" class="record_text">[${id}]</b>
                                <span class="record_text">${distance}m</span>
                                <i id="angle" class="record_text">${angle}°</i>
                                <span class="record_text">${speed}m/s ${arrow}</span>
                                <span class="record_text">${now.toLocaleDateString()}</span>
                                <span class="record_text">${time}</span>
                            </div>
                        `,
                        color
                    };
                }
            });

            return updated; // 기존 + 새로운 데이터 합쳐서 반환
        });
    }, [dataArray]);


    return (
        <div className='record'>
            <h2 className="record_title">Record</h2>
            <div className="record_text_box">
                <div className="record_text_top">
                    <b id="id" className="record_text">아이디</b>
                    <span className="record_text">거리</span>
                    <i id = "angle" className="record_text">각도</i>
                    <span className="record_text">속도</span>
                    <span className="record_text">날짜</span>
                    <span className="record_text">시간</span>
                </div>
                {Object.values(recordMap).map((item, index) => (
                    <div
                        key={index}
                        style={{ color: item.color, height: "25px" }}
                        dangerouslySetInnerHTML={{ __html: item.html }} // HTML 렌더링
                    />
                ))}
            </div>
        </div>
    );
}

export default Record;
