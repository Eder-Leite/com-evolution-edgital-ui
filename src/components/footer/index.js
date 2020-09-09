import React, { Component } from 'react';

class Footer extends Component {

    constructor() {
        super();
        this.state = {
            isOpen: false
        };
    }

    render() {

        return (
            <div className='layout-footer'>
                <span className='footer-text' style={{ 'marginRight': '5px' }}>
                    Evolution Sistemas | eDigital
                </span>
            </div>
        );
    }
}

export default Footer;