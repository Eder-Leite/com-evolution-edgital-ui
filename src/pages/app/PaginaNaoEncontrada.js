import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class PaginaNaoEncontrada extends Component {

    constructor(props) {
        super(props)
        this.props.history.push('/paginaNaoEncontrada')
    }

    render() {
        return (
            <div></div >
        );
    }
}

export default withRouter(PaginaNaoEncontrada);