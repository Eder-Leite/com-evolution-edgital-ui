import PropTypes from 'prop-types';
import React, { Component } from 'react';

export class Topbar extends Component {

    static defaultProps = {
        onToggleMenu: null
    }

    static propTypes = {
        onToggleMenu: PropTypes.func.isRequired
    }

    render() {
        return (
            <div className='layout-topbar clearfix'>
                <button className='p-link layout-menu-button' onClick={this.props.onToggleMenu}>
                    <span className='pi pi-bars' />
                </button>
            </div>
        );
    }
}