import classNames from 'classnames';
import { Link } from 'react-router-dom';
import React, { Component } from 'react';
import confirmService from '../../services/confirmService';
import { logoutUser, getProfile } from '../../services/Api';

class PerfilSidebar extends Component {

    constructor() {
        super();
        this.state = {
            user: '',
            expanded: false
        };

        this.onClick = this.onClick.bind(this);
        this.onPerfil = this.onPerfil.bind(this);
    }

    componentDidMount() {
        const usuario = getProfile();
        this.setState({ user: usuario.nome });
    }

    onClick(event) {
        this.setState({ expanded: !this.state.expanded });
        event.preventDefault();
    }

    onClickLogout() {
        confirmService.show({
            message: 'Deseja realmente fazer Logout?'
        }).then(
            (res) => {

                if (res) {
                    logoutUser();
                    window.location.href = '/';
                }
            }
        );
    }

    onPerfil(event) {
        this.props.history.push('/app/perfilUsuario');
        event.preventDefault();
    }

    render() {
        return (
            <div className='profile'>
                <div>
                    <img src='../assets/images/avatar.png' alt='' />
                </div>
                <button style={{ textAlign: 'center' }} className='p-link profile-link' onClick={this.onClick}>
                    <span className='username'>{this.state.user}</span>
                    <i className='pi pi-fw pi-cog' />
                </button>
                <ul className={classNames({ 'profile-expanded': this.state.expanded })}>
                    <li>
                        <Link className='p-link' to='/app/perfilUsuario'>
                            <i className='pi pi-fw pi-user' />
                            <span style={{ fontSize: 14 }}>Perfil</span>
                        </Link>
                    </li>
                    <li>
                        <button className='p-link' onClick={this.onClickLogout}>
                            <i className='pi pi-fw pi-power-off' />
                            <span>Logout</span>
                        </button>
                    </li>
                </ul>
            </div >
        );
    }
}

export default PerfilSidebar;