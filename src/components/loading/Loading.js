import { render } from 'react-dom';
import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { Dialog } from 'primereact/dialog';

class Loading extends Component {

    static create(props = {}) {
        const containerElement = document.createElement('div');
        document.body.appendChild(containerElement);
        return render(<Loading loadingProps={props} />, containerElement);
    }

    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            loadingProps: {}
        };

        this.onHide = this.onHide.bind(this);
        this.onShow = this.onShow.bind(this);
    }

    onHide() {
        this.setState({
            visible: false
        })
    }

    onShow() {
        this.setState({
            visible: true
        })
    }

    render() {
        return (
            <Dialog
                modal={true}
                closable={false}
                showHeader={false}
                onHide={this.onHide}
                visible={this.state.visible}
                style={{ boxShadow: 'none' }}
                contentStyle={{ width: 200, height: 200, border: 0, backgroundColor: 'transparent' }}>
                <ReactLoading type={'bars'} color={'white'} height={'100%'} width={'100%'} />
            </Dialog>
        );
    }
}

export default Loading;