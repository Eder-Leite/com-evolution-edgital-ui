import classNames from 'classnames';
import React, { Component } from 'react';
import Footer from '../../components/footer';
import Sidebar from '../../components/sidebar';
import { Topbar } from '../../components/topbar';
// import { BreadCrumb } from 'primereact/breadcrumb';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';

import { temQualquerPermissao } from '../../services/Api';

import PaginaNaoEncontrada from './PaginaNaoEncontrada';
import Dashboad from '../dashboard';

//INICIO CAD
import Filial from '../cad/Filial';
import Cadastro from '../cad/Cadastro';
import Veiculo from '../cad/Veiculo';
import Motorista from '../cad/Motorista';
import Vendedor from '../cad/Vendedor';
//FIM CAD

//INICIO ADM
import Almoxarifado from '../adm/Almoxarifado';
import Categoria from '../adm/Categoria';
import SubCategoria from '../adm/SubCategoria';
import Produto from '../adm/Produto';
import OperacaoEstoque from '../adm/OperacaoEstoque';
//FIM ADM

//INICIO TES
import CarteiraFinanceira from '../tes/CarteiraFinanceira';
import GrupoReceitaDespesa from '../tes/GrupoReceitaDespesa';
import PlanoReceitaDespesa from '../tes/PlanoReceitaDespesa';
import Banco from '../tes/Banco';
import Agencia from '../tes/Agencia';
import ContaFinanceira from '../tes/Conta';
import TalaoCheque from '../tes/Talao';
import Cheque from '../tes/Cheque';
import LocalFaturamento from '../tes/LocalFaturamento';
import LancamentoManual from '../tes/LancamentoManual';
//FIM TES

//INICIO LIV
import CFOP from '../liv/CFOP';
import ComplementoNatureza from '../liv/ComplementoNatureza';
import FinalidadeFiscal from '../liv/FinalidadeFiscal';
import CodigoAjusteIcms from '../liv/CodigoAjusteIcms';
import ComentarioFiscal from '../liv/ComentarioFiscal';
//FIM LIV

//INICIO SEG
import Usuario from '../seg/Usuario';
//FIM SEG

// var title = 'Dashboard';

// const home = { icon: 'pi pi-home', command: () => { window.location.hash = '/app/dashboard' } };

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            layoutMode: 'static',
            layoutColorMode: 'dark',
            staticMenuInactive: false,
            overlayMenuActive: false,
            mobileMenuActive: false
        };
        this.onToggleMenu = this.onToggleMenu.bind(this);
        this.onWrapperClick = this.onWrapperClick.bind(this);
    }

    async setTitle(roles, value) {
        return await temQualquerPermissao(roles);

    }

    addClass(element, className) {
        if (element.classList)
            element.classList.add(className);
        else
            element.className += ' ' + className;
    }

    removeClass(element, className) {
        if (element.classList)
            element.classList.remove(className);
        else
            element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }

    componentDidMount() {
    }

    componentDidUpdate() {
        if (this.state.mobileMenuActive) {
            this.addClass(document.body, 'body-overflow-hidden');
        }
        else {
            this.removeClass(document.body, 'body-overflow-hidden');
        }
    }

    onWrapperClick(event) {
        if (!Sidebar.prototype.isMenuClick()) {
            this.setState({ overlayMenuActive: false, mobileMenuActive: false });
        }
        Sidebar.prototype.onMenuClick(false);

        event.preventDefault();
    }

    onToggleMenu(event) {
        Sidebar.prototype.onMenuClick(true);

        if (window.innerWidth >= 1024) {

            if (this.state.layoutMode === 'overlay') {
                this.setState({
                    overlayMenuActive: !this.state.overlayMenuActive
                });
            }
            else if (this.state.layoutMode === 'static') {
                this.setState({
                    staticMenuInactive: !this.state.staticMenuInactive
                });
            }
        } else {
            const menuActive = this.state.mobileMenuActive;
            this.setState({ mobileMenuActive: !menuActive });
        }
        event.preventDefault();
    }

    render() {

        let wrapperClass = classNames('layout-wrapper', {
            'layout-overlay': this.state.layoutMode === 'overlay',
            'layout-static': this.state.layoutMode === 'static',
            'layout-static-sidebar-inactive': this.state.staticMenuInactive && this.state.layoutMode === 'static',
            'layout-overlay-sidebar-active': this.state.overlayMenuActive && this.state.layoutMode === 'overlay',
            'layout-mobile-sidebar-active': this.state.mobileMenuActive
        });

        return (
            <div className={wrapperClass} onClick={this.onWrapperClick}>
                <Topbar onToggleMenu={this.onToggleMenu} />
                <Sidebar />

                <div className='layout-main'>
                    <div style={{ padding: 5 }}>

                        {/* <BreadCrumb model={[{ label: title }]} home={home} style={{ marginBottom: 5 }} /> */}

                        <Switch>
                            <PrivateRoute title='Dashboad' roles={['ROLE_USUARIO']} path='/app/dashboard' component={Dashboad} />

                            {/*INICIO CAD */}
                            <PrivateRoute title='Filial' roles={['ROLE_DESENVOLVEDOR']} path='/app/cad/filial' component={Filial} />
                            <PrivateRoute title='Cadastro' roles={['ROLE_DESENVOLVEDOR']} path='/app/cad/cadastroGeral' component={Cadastro} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/cad/veiculo' component={Veiculo} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/cad/motorista' component={Motorista} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/cad/motorista' component={Motorista} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/cad/vendedor' component={Vendedor} />
                            {/*FIM CAD */}

                            {/*INICIO ADM */}
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/adm/almoxarifado' component={Almoxarifado} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/adm/categoria' component={Categoria} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/adm/subCategoria' component={SubCategoria} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/adm/produto' component={Produto} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/adm/operacaoEstoque' component={OperacaoEstoque} />
                            {/*FIM ADM */}

                            {/*INICIO TES */}
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/tes/carteiraFinanceira' component={CarteiraFinanceira} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/tes/grupoReceitaDespesa' component={GrupoReceitaDespesa} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/tes/planoReceitaDespesa' component={PlanoReceitaDespesa} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/tes/banco' component={Banco} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/tes/agencia' component={Agencia} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/tes/contaFinanceira' component={ContaFinanceira} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/tes/talaoCheque' component={TalaoCheque} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/tes/cheque' component={Cheque} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/tes/localFaturamento' component={LocalFaturamento} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/tes/lancamentoManual' component={LancamentoManual} />
                            {/*FIM TES */}

                            {/*INICIO SEG */}
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/seg/usuario' component={Usuario} />
                            {/*FIM SEG */}

                            {/*INICIO LIV */}
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/liv/cfop' component={CFOP} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/liv/complementoNatureza' component={ComplementoNatureza} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/liv/finalidadeFiscal' component={FinalidadeFiscal} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/liv/codigoAjusteIcms' component={CodigoAjusteIcms} />
                            <PrivateRoute roles={['ROLE_DESENVOLVEDOR']} path='/app/liv/comentarioFiscal' component={ComentarioFiscal} />
                            {/*FIM LIV */}


                            <Route path='*' component={PaginaNaoEncontrada} />
                        </Switch>
                    </div>
                </div>
                <Footer />
                <div className='layout-mask'></div>
            </div>
        );
    }
}

const PrivateRoute = ({ title, roles, component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props => (
            App.prototype.setTitle(roles, title) ? (
                < Component {...props} />

            ) : (
                    <Redirect to={{ pathname: '/acessoNegado', state: { from: props.location } }} />
                )
        )} />
);

export default withRouter(App);