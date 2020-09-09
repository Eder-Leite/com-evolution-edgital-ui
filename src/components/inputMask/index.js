import InputMask from 'react-input-mask';
import React, { useState, useEffect } from 'react';

function Input(props) {

    const [value, setValue] = useState(props.value);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    function onBlur() {
        try {
            let test = props.value;
            test = test.replace(/[^0-9]/g, '');

            console.log(test);

            if (props.tipoPessoa === 'FÍSICA' && test.length !== 11) {
                console.log('FÍSICA');

                setValue(null);
            }

            if (props.tipoPessoa === 'JURÍDICA' && test.length !== 14) {
                console.log('JURÍDICA');

                setValue(null);
            }

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <InputMask
            onBlur={onBlur}
            value={value} onChange={props.onChange}
            className='p-inputtext p-component p-filled'
            mask={props.tipoPessoa === 'FÍSICA' ? '999.999.999-99' : '99.999.999/9999-99'}
        >
        </InputMask>
    );
}

export default Input;