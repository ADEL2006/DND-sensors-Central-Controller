import { useEffect, useState } from "react";
import '../css/Record.css'

function Record({ dataArray }) {
    const [recordData, setRecordData] = useState([]);

    // dataArray가 바뀔 때마다 상태 업데이트
    useEffect(() => {
        if (!dataArray) return;
        const formatted = dataArray.map(obj => {
            const id = parseFloat(obj.id);
            const angle = parseFloat(obj.a);
            const distance = parseFloat(obj.d);
            const speed = parseFloat(obj.vy);
            if (isNaN(angle) || isNaN(distance)) return null;
            return `[${id}] ${distance}m / ${angle}° / ${speed}m/s`;
        }).filter(Boolean);
        setRecordData(formatted);
    }, [dataArray]);

    return (
        <div className='record'>
            <h2 className="record_title">Record</h2>
            <pre className="record_text">{recordData.join("\n")}</pre>
        </div>
    );
}

export default Record;
