import React, { useState } from 'react';
import { Steps } from 'primereact/steps';

const data = [
    { label: 'Personal' },
    { label: 'Seat' },
    { label: 'Payment' },
    { label: 'Confirmation' }
];

function Form({ prpops, children }) {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <Steps
            model={data}
            readOnly={false}
            activeIndex={activeIndex} onSelect={(e) => setActiveIndex(e.index)}>
            {children}
        </Steps>
    );
}

export default Form;