import { Slider } from 'antd';
import React from 'react';

function TimeLineSlider() {
    const [value, setValue] = React.useState<number>(50);

    const handleChange = (newValue:any) => {
        console.log(newValue);
        setValue(newValue as number);
    };

    return (
        <div className="w-full fixed bottom-0 flex justify-center items-center py-6 px-32">
            <div className="bg-white rounded-lg p-8 w-[-webkit-fill-available]">
                <Slider dots step={3}/>
            </div>
        </div>
    );
}

export default TimeLineSlider;