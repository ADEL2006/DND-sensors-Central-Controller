import { useEffect, useState } from "react";
import '../css/Record.css'

function Record({ dataArray }) {
    const [recordMap, setRecordMap] = useState({}); // id별 데이터 저장

    useEffect(() => {
        if (!dataArray) return;

        setRecordMap(prev => {
            const updated = { ...prev };

            dataArray.forEach(obj => {
                const id = parseFloat(obj.id);
                const angle = parseFloat(obj.a);
                const distance = parseFloat(obj.d);
                const speed = parseFloat(obj.vy);

                if (!isNaN(id) && !isNaN(angle) && !isNaN(distance)) {
                    updated[id] = `[${id}] ${distance}m / ${angle}° / ${speed}m/s`;
                }
            });

            return updated;
        });
    }, [dataArray]);

    return (
        <div className='record'>
            <h2 className="record_title">Record</h2>
            <div className="record_text_box">
                <pre className="record_text">
                    {Object.values(recordMap).join("\n")}
                </pre>
            </div>
        </div>
    );
}

export default Record;
