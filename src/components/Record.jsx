import { useEffect, useState } from "react";
import '../css/Record.css'

function Record({ dataArray }) {
    const [recordMap, setRecordMap] = useState({}); // id별 데이터 저장

    useEffect(() => {
        if (!dataArray) return;

        setRecordMap(prev => {
            const updated = {};

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
                    updated[id] = { 
                        text: `[${id}] ${distance}m / ${angle}° / ${speed}m/s ${arrow}`,
                        color
                    };
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
                    {Object.values(recordMap).map((item, index) => (
                        <span key={index} style={{ color: item.color }}>
                            {item.text}
                            {"\n"}
                        </span>
                    ))}
                </pre>
            </div>
        </div>
    );
}

export default Record;
