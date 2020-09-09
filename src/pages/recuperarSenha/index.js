import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Button } from 'primereact/button';
import Toasty from '../../components/toasty';
import { withRouter } from 'react-router-dom';
import Loading from '../../components/loading';
import { InputText } from 'primereact/inputtext';
import { ApiRecuperaSenha } from '../../services/Api';
import ErrorHandler from '../../services/ErrorHandler';

const url = 'usuarios/recuperaSenha';

class RecuperarSenhaView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: '',
            nome: ''
        };
        document.title = 'Evolution Sistemas - eDigital | Recuperação de senha';
    }

    IsEmail() {
        if (new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(this.state.email)) {
            return true;
        }
        else {
            return false;
        }
    }

    isNome() {
        if (this.state.nome !== undefined && this.state.nome !== null) {
            if (this.state.nome.length >= 4) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validaFormulario = () => {
        if (this.IsEmail() && this.isNome()) {
            return true;
        } else {
            return false;
        }
    }

    enviarSenha() {
        Loading.onShow();

        const body = {
            'nome': `${this.state.nome}`, 'email': `${this.state.email}`
        };

        ApiRecuperaSenha({
            method: 'post',
            url: url,
            data: body
        }).then(() => {
            Loading.onHide();
            this.setState({ email: '', nome: '' });
            Toasty.success('Sucesso!', 'Senha enviada com sucesso!');
            this.props.history.push('/');
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
                        <h2 style={{ textAlign: 'center', margin: 30, fontWeight: 'bold' }} className='first'>RECUPERAÇÃO DE SENHA</h2>

                        <div className='p-grid p-fluid'>
                            <div className='p-col-12 p-md-12'>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        <i className='pi pi-user'></i>
                                    </span>
                                    <InputText
                                        type='text'
                                        maxLength={255}
                                        value={this.state.nome}
                                        placeholder='Nome completo'
                                        onChange={(event) => this.setState({ nome: event.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 20 }} className='p-grid p-fluid'>
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
                    </div>

                    <div style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center' }} className='p-fluid'>
                        <Button disabled={!this.validaFormulario()} onClick={() => this.enviarSenha()} label='ENVIAR SENHA' />
                    </div>

                    <div style={{ marginTop: 30, textAlign: 'center', fontSize: 11, color: 'blue', fontWeight: 'bold' }} className='p-col-12 p-md-12'>
                        <span>O procedimento acima enviar uma senha tempóraria no seu e-mail</span>
                    </div>
                </Card>

            </div>
        );
    }
}

export default withRouter(RecuperarSenhaView);