import { useEffect, useRef, useState } from "react";
import '../css/Record.css';

function Record({ dataArray, colors }) {
    const [recordMap, setRecordMap] = useState({}); // id별 데이터 저장
    const sendData = useRef(false); // 서버에 데아터 전송 여부
    const [distBetween, setDistBetween] = useState();

    // 서버에 데이터 전송 토글 핸들러
    const handleChange = (e) => {
        sendData.current = !sendData.current;
    };

    useEffect(() => {
        if (!dataArray) return;

        const now = new Date(); // 현재 시각

        // 서버용 날짜
        const dateStr = now.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\.\s?/g, '-').replace(/-$/, '');

        // 기존 화면용 시간
        const timeStr = now.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const updatedMap = { ...recordMap }; // 기존 데이터 복사

        // 서버 전송용 배열
        const dtoArray = dataArray.map(obj => {
            const targetId = parseInt(obj.targetId, 10); // 타겟 번호
            const distance = parseFloat(obj.distance); // 거리
            const angle = parseFloat(obj.angle); // 각도
            // const vy = parseFloat(obj.vy); // 속도값 원본
            // const speed = Math.abs(vy); // 속도
            const speed = parseFloat(obj.speed).toFixed(2);
            const entry = Boolean(obj.entry); // 접근 여부

            // 화면용 HTML 업데이트
            const color = colors.current[targetId];
            const arrow = entry ? "↓" : "↑";

            // 기록 포멧
            updatedMap[targetId] = {
                html: `
                    <div style="width:100%; display:flex; gap:0px;">
                        <b id="id" class="record_text">[${targetId}]</b>
                        <span id="distance" class="record_text">${distance}m</span>
                        <i id="angle" class="record_text">${angle}°</i>
                        <span class="record_text">${speed}m/s ${arrow}</span>
                        <span id="date" class="record_text">${dateStr}</span>
                        <span id="time" class="record_text">${timeStr}</span>
                    </div>
                `,
                color
            };
            // 서버 로그 포멧
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

        // 작성된 기록 포멧 저장
        setRecordMap(updatedMap);

    }, [dataArray]);


    return (
        <div className='record'>
            <h2 className="record_title">
                <span className="record_title_text">Record</span>
                {/* <span className="switch_text">auto saving: </span>
                <div className="record_wrapper">
                    <input
                        type="checkbox"
                        id="record_switch"
                        onChange={handleChange}
                    />
                    <label htmlFor="record_switch" className="record_switch_label">
                        <span className="record_onf_btn"></span>
                    </label>
                </div> */}
            </h2>
            <div className="record_text_top">
                <b id="id" className="record_text">타겟번호</b>
                <span id="distance" className="record_text">거리</span>
                <i id="angle" className="record_text">각도</i>
                <span className="record_text">속도</span>
                <span id="date" className="record_text">날짜</span>
                <span id="time" className="record_text">시간</span>
            </div>
            <div className="record_text_box">
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
