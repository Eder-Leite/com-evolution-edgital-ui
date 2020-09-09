import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Button } from 'primereact/button';
import Loading from '../../components/loading';
import { setToken } from '../../services/Auth';
import { InputText } from 'primereact/inputtext';
import { Link, withRouter } from 'react-router-dom';
import ErrorHandler from '../../services/ErrorHandler';
import { ApiLogin, loggedIn } from '../../services/Api';

const url = 'oauth/token';

class LoginView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: 'eder@evolutionsistemas.com.br',
            senha: '12345678'
        };

        document.title = 'Evolution Sistemas - eDigital | Login';
    }

    componentDidMount() {
        if (loggedIn()) {
            this.props.history.push('/app/dashboard');
        }
    }

    IsEmail() {
        if (new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(this.state.email)) {
            return true;
        }
        else {
            return false;
        }
    }

    isSenha() {
        if (this.state.senha !== undefined && this.state.senha !== null) {
            if (this.state.senha.length === 8) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validaFormulario = () => {
        if (this.IsEmail() && this.isSenha()) {
            return true;
        } else {
            return false;
        }
    }

    logar = async () => {
        Loading.onShow();

        const body = `username=${this.state.email}&password=${this.state.senha}&grant_type=password`;

        await ApiLogin({
            method: 'post',
            url: url,
            data: body
        }).then(resp => {
            Loading.onHide();
            setToken(resp.data.access_token);
            this.setState({ email: '', senha: '' });
            this.props.history.push({ pathname: '/app/dashboard' })
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            });
    }

    render() {

        const style = {
            width: '100vw',
            height: '100vh',
            background: '#6C7A89',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }

        return (
            <div style={style}>

                <div>
                    <img
                        alt='Logo'
                        style={{ marginBottom: 25 }}
                        src='../assets/images/logoEvolution.png'
                    />
                </div>

                <Card className='card-login'>
                    <div className='content-section implementation'>
                        <h2 style={{ textAlign: 'center', margin: 30, fontWeight: 'bold' }} className='first'>LOGIN</h2>
                        <div className='p-grid p-fluid'>
                            <div className='p-col-12 p-md-12'>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        <i className='pi pi-envelope'></i>
                                    </span>
                                    <InputText
                                        type='email'
                                        maxLength={255}
                                        placeholder='Email'
                                        value={this.state.email}
                                        onChange={(event) => this.setState({ email: event.target.value.toLowerCase() })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 20 }} className='p-grid p-fluid'>
                            <div className='p-col-12 p-md-12'>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        <i className='pi pi-lock'></i>
                                    </span>
                                    <InputText
                                        maxLength={8}
                                        type='password'
                                        placeholder='Senha'
                                        value={this.state.senha}
                                        onChange={(event) => this.setState({ senha: event.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center' }} className='p-fluid'>
                        <Button disabled={!this.validaFormulario()} onClick={() => this.logar()} label='ENTRAR' />
                    </div>

                    <div style={{ marginTop: 30, textAlign: 'center', fontSize: 11 }} className='p-col-12 p-md-12'>
                        <span>Esqueceu a senha? </span>
                        <Link to='/recuperarSenha' style={{ fontWeight: 'bold' }}>Recuperar? </Link>
                    </div>
                </Card>
            </div>
        );
    }
}

export default withRouter(LoginView);   