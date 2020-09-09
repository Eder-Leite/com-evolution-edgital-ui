import { Steps } from 'primereact/steps';
import React, { useState, useEffect } from 'react';

const data = [
    { label: 'Movimento' },
    { label: 'Rateio' },
    { label: 'Parcela' },
    { label: 'Finalizar' },
];

function Form({ props, children }) {
    const [activeIndex, setActiveIndex] = useState(0);

    function onSelect(index) {
        setActiveIndex(index);
    }

    return (
        <div>
            <Steps
                model={data}
                readOnly={true}
                activeIndex={props.index | 0} onSelect={(e) => setActiveIndex(e.index)} />
            {children}
        </div>
    );
}

export default Form;