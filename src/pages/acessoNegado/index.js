import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { withRouter } from 'react-router-dom';
import { isAuthenticated } from '../../services/Auth';

class AcessoNegado extends Component {

    dashboard = () => {
        if (isAuthenticated()) {
            this.props.history.push('/app/dashboard');
        } else {
            this.props.history.push('/');
        }
    }

    render() {

        document.title = 'Evolution Sistemas - eDigital | Acesso Negado';

        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                background: '#6C7A89',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{ textAlign: 'center', color: '#FFF', marginBottom: 20 }}>
                    <h1>Acesso Negado!</h1>
                </div>

                <img src='../assets/images/negado.png' alt='acesso negado'></img>
                <div style={{ textAlign: 'center', color: '#FFF' }}>

                    <h3>Atenção você não tem permissâo para acessar esse recurso.</h3>

                    <Button
                        label='Dashboard'
                        onClick={() => this.dashboard()}
                        style={{ marginTop: 30, background: '#6C7A89', borderColor: '#FFF' }}
                    />
                </div>
            </div >
        );
    }
}

export default withRouter(AcessoNegado);