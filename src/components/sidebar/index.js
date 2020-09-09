import { Menu } from '../menu';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, { Component } from 'react';
import PerfilSidebar from '../perfilSidebar';
import { ScrollPanel } from 'primereact/components/scrollpanel/ScrollPanel';

class Sidebar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            overlayMenuActive: true,
            mobileMenuActive: true
        };

        this.onSidebarClick = this.onSidebarClick.bind(this);
        this.onMenuItemClick = this.onMenuItemClick.bind(this);
        this.createMenu();
    }

    static defaultProps = {
        menuClick: true
    }

    static propTypes = {
        menuClick: PropTypes.bool
    }

    componentDidMount() {
        this.onMenuClick(true);
    }

    createMenu() {
        this.menu = [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/app/dashboard' },
            {
                label: 'Produto', icon: 'pi pi-fw pi-th-large',
                items: [
                    { label: 'Almoxarifado', icon: 'pi pi-fw pi-bookmark', to: '/app/adm/almoxarifado' },
                    { label: 'Categoria', icon: 'pi pi-fw pi-bookmark', to: '/app/adm/categoria' },
                    { label: 'SubCategoria', icon: 'pi pi-fw pi-bookmark', to: '/app/adm/subCategoria' },
                    { label: 'Produto', icon: 'pi pi-fw pi-bookmark', to: '/app/adm/produto' },
                    { label: 'Operação Estoque', icon: 'pi pi-fw pi-bookmark', to: '/app/adm/operacaoEstoque' },
                    { label: 'Entrada no estoque', icon: 'pi pi-fw pi-bookmark', to: '/app/adm/entradaEstoque' },
                    { label: 'Saída no estoque', icon: 'pi pi-fw pi-bookmark', to: '/app/adm/saidaEstoque' },
                ]
            },
            {
                label: 'Cadastro', icon: 'pi pi-fw pi-users',
                items: [
                    { label: 'Cliente/Fornecedor', icon: 'pi pi-fw pi-bookmark', to: '/app/cad/cadastroGeral' },
                    { label: 'Veículo', icon: 'pi pi-fw pi-bookmark', to: '/app/cad/veiculo' },
                    { label: 'Motorista', icon: 'pi pi-fw pi-bookmark', to: '/app/cad/motorista' },
                    { label: 'Vendedor', icon: 'pi pi-fw pi-bookmark', to: '/app/cad/vendedor' },
                    { label: 'Filial', icon: 'pi pi-fw pi-bookmark', to: '/app/cad/filial' },
                ]
            },
            {
                label: 'Faturamento', icon: 'pi pi-fw pi-shopping-cart',
                items: [
                    { label: 'Arquivo Folha', icon: 'pi pi-fw pi-bookmark', to: '/app/arquivoFolha' },
                    { label: 'Débitos Funcionário', icon: 'pi pi-fw pi-bookmark', to: '/app/debitoFuncionario' },
                    { label: 'Gerar Nota', icon: 'pi pi-fw pi-bookmark', to: '/app/faturamento' },
                    { label: 'Posição Sintética', icon: 'pi pi-fw pi-bookmark', to: '/app/posicaoSintetica' },
                    { label: 'Relatório Nota', icon: 'pi pi-fw pi-bookmark', to: '/app/relatorioNota' },
                ]
            },
            {
                label: 'Fiscal', icon: 'pi pi-fw pi-folder-open',
                items: [
                    { label: 'CFOP', icon: 'pi pi-fw pi-bookmark', to: '/app/liv/cfop' },
                    { label: 'Complemento Natureza', icon: 'pi pi-fw pi-bookmark', to: '/app/liv/complementoNatureza' },
                    { label: 'Finalidade Fiscal', icon: 'pi pi-fw pi-bookmark', to: '/app/liv/finalidadeFiscal' },
                    { label: 'Código Ajuste ICMS', icon: 'pi pi-fw pi-bookmark', to: '/app/liv/codigoAjusteicms' },
                    { label: 'Comentário Fiscal', icon: 'pi pi-fw pi-bookmark', to: '/app/liv/comentarioFiscal' },
                ]
            },
            {
                label: 'Documentos Eletrônicos', icon: 'pi pi-fw pi-file-pdf',
                items: []
            },
            {
                label: 'Segurança', icon: 'pi pi-fw pi-lock',
                items: [
                    { label: 'Usuário', icon: 'pi pi-fw pi-bookmark', to: '/app/seg/usuario' },
                ]
            },
            {
                label: 'Financeiro', icon: 'pi pi-fw pi-dollar',
                items: [
                    { label: 'Carteira Financeira', icon: 'pi pi-fw pi-bookmark', to: '/app/tes/carteiraFinanceira' },
                    { label: 'Grupo de Receita/Despesa', icon: 'pi pi-fw pi-bookmark', to: '/app/tes/grupoReceitaDespesa' },
                    { label: 'Plano de Receita/Despesa', icon: 'pi pi-fw pi-bookmark', to: '/app/tes/planoReceitaDespesa' },
                    { label: 'Banco', icon: 'pi pi-fw pi-bookmark', to: '/app/tes/banco' },
                    { label: 'Agência', icon: 'pi pi-fw pi-bookmark', to: '/app/tes/agencia' },
                    { label: 'Conta Financeira', icon: 'pi pi-fw pi-bookmark', to: '/app/tes/contaFinanceira' },
                    { label: 'Talão de Cheque', icon: 'pi pi-fw pi-bookmark', to: '/app/tes/talaoCheque' },
                    { label: 'Cheque', icon: 'pi pi-fw pi-bookmark', to: '/app/tes/cheque' },
                    { label: 'Local de Faturamento', icon: 'pi pi-fw pi-bookmark', to: '/app/tes/localFaturamento' },
                    { label: 'Lançamento Manual', icon: 'pi pi-fw pi-bookmark', to: '/app/tes/lancamentoManual' },
                ]
            },
        ];
    }

    onSidebarClick() {

        try {
            Sidebar.prototype.menuClick = true;
            if (this.hasOwnProperty(this.layoutMenuScroller) && this.state.mobileMenuActive) {
                setTimeout(() => { this.layoutMenuScroller.moveBar(); }, 500);
            }
        } catch (error) {

        }
    }

    isMenuClick() {
        return Boolean(Sidebar.prototype.menuClick);
    }

    onMenuClick(value) {
        Sidebar.prototype.menuClick = value;
    }

    onMenuItemClick(event) {
        if (!event.item.items) {
            this.setState({
                overlayMenuActive: false,
                mobileMenuActive: false
            })
        }
    }

    render() {
        let sidebarClassName = classNames('layout-sidebar', 'layout-sidebar-dark');

        return (
            <div ref={(el) => this.sidebar = el} className={sidebarClassName} onClick={this.onSidebarClick}>
                <ScrollPanel ref={(el) => this.layoutMenuScroller = el} style={{ height: '100%' }}>
                    <div className='layout-sidebar-scroll-content'>
                        <div className='layout-logo'>
                            <img alt='Logo' src='../assets/images/logoEvolution.png' style={{ width: 120 }} />
                        </div>
                        <PerfilSidebar />
                        <Menu model={this.menu} onMenuItemClick={this.onMenuItemClick} />
                    </div>
                </ScrollPanel>
            </div>
        );
    }
}

export default Sidebar;