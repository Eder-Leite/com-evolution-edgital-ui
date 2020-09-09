import { render } from 'react-dom';
import React, { Component } from 'react';
import { Growl } from 'primereact/growl';

class Toasty extends Component {

    static create() {
        const containerElement = document.createElement('div');
        document.body.appendChild(containerElement);
        return render(<Toasty />, containerElement);
    }

    constructor() {
        super();

        this.state = {
            showToastyProps: {},
        };

        this.warn = this.warn.bind(this);
        this.info = this.info.bind(this);
        this.error = this.error.bind(this);
        this.success = this.success.bind(this);
    }

    success = (titulo, texto, time = 5000) => {
        this.growl.show({ severity: 'success', summary: titulo, detail: texto, life: time });
    }

    info(titulo, texto, time = 5000) {
        this.growl.show({ severity: 'info', summary: titulo, detail: texto, life: time });
    }

    warn(titulo, texto, time = 5000) {
        this.growl.show({ severity: 'warn', summary: titulo, detail: texto, life: time });
    }

    error(titulo, texto, time = 5000) {
        this.growl.show({ severity: 'error', summary: titulo, detail: texto, life: time });
    }

    render() {
        return (
            <div style={{ zIndex: 9999 }}>
                <Growl ref={(el) => this.growl = el}></Growl>
            </div>
        );
    }
}

export default Toasty;