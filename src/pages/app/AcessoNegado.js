import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class AcessoNegado extends Component {

    constructor(props) {
        super(props)
        this.props.history.push('/acessoNegado')
    }

    render() {
        return (
            <div></div >
        );
    }
}

export default withRouter(AcessoNegado);