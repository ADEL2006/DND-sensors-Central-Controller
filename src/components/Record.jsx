import { useEffect, useRef, useState } from "react";
import '../css/Record.css';

function Record({ dataArray, colors }) {
    const [recordMap, setRecordMap] = useState({}); // id별 데이터 저장
    const count = useRef(0);
    const sendData = useRef(false);

    const handleChange = (e) => {
        sendData.current = !sendData.current;
    };

    useEffect(() => {
        if (!dataArray || dataArray.length === 0) return;

        const now = new Date();
        // 기존 화면용
        const timeStr = now.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // 서버용 날짜
        const dateStr = now.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\.\s?/g, '-').replace(/-$/, '');

        const updatedMap = { ...recordMap }; // 기존 데이터 복사

        // 서버 전송용 배열
        const dtoArray = dataArray.map(obj => {
            const targetId = parseInt(obj.id, 10);
            const distance = parseFloat(obj.d);
            const angle = parseFloat(obj.a);
            const vy = parseFloat(obj.vy);
            const speed = Math.abs(vy);
            const entry = vy < 0;

            // 화면용 HTML 업데이트
            const color = colors.current[targetId];
            const arrow = vy < 0 ? "↓" : "↑";

            updatedMap[targetId] = {
                html: `
                    <div style="width:100%; display:flex; gap:0px;">
                        <b id="id" class="record_text">[${targetId}]</b>
                        <span class="record_text">${distance}m</span>
                        <i id="angle" class="record_text">${angle}°</i>
                        <span class="record_text">${speed}m/s ${arrow}</span>
                        <span id="date" class="record_text">${dateStr}</span>
                        <span id="time" class="record_text">${timeStr}</span>
                    </div>
                `,
                color
            };

            return {
                targetId,
                distance,
                angle,
                speed,
                entry,
                date: dateStr,
                time: timeStr
            };
        });

        setRecordMap(updatedMap);

        // 서버 전송
        if(sendData.current){
            fetch('http://58.79.238.184:4000/radar/record/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dtoArray)
            })
                .then(res => {
                    if (!res.ok) throw new Error('POST 실패');
                    return res.json();
                })
                .then(data => console.log('서버 응답:', data))
                .catch(err => console.error(++count.current, 'POST 요청 실패:', err));
        }

    }, [dataArray]);

    return (
        <div className='record'>
            <h2 className="record_title">
                <span className="record_title_text">Record</span>
                <span className="switch_text">auto record: </span>
                <div className="wrapper">
                    <input 
                    type="checkbox" 
                    id="switch"
                    onChange={handleChange}
                    />
                        <label htmlFor="switch" className="switch_label">
                            <span className="onf_btn"></span>
                        </label>
                </div>
            </h2>
            <div className="record_text_box">
                <div className="record_text_top">
                    <b id="id" className="record_text">타겟번호</b>
                    <span className="record_text">거리</span>
                    <i id="angle" className="record_text">각도</i>
                    <span className="record_text">속도</span>
                    <span id="date" className="record_text">날짜</span>
                    <span id="time" className="record_text">시간</span>
                </div>
                {Object.values(recordMap).map((item, index) => (
                    <div
                        key={index}
                        style={{ color: item.color, height: "25px" }}
                        dangerouslySetInnerHTML={{ __html: item.html }}
                    />
                ))}
            </div>
        </div>
    );
}

export default Record;
