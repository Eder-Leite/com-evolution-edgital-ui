/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { withRouter } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { InputMask } from 'primereact/inputmask';
import { AutoComplete } from 'primereact/autocomplete';
import { TabView, TabPanel } from 'primereact/tabview';

import confirmService from '../../../services/confirmService';
import InputNumber from '../../../components/inputNumber';
import Loading from '../../../components/loading';
import Toasty from '../../../components/toasty';
import Api from '../../../services/Api';

import { SchemaLancamentoManual, SchemaParcelaLancamentoManual, empresa } from '../TesModel';
const url = 'lancamentosManualFinanceiro';

const situacoes = [
    { label: 'ABERTO', value: 'ABERTO' },
    { label: 'FECHADO', value: 'FECHADO' }
];

const tipos = [
    { label: 'DÉBITO', value: 'DÉBITO' },
    { label: 'CRÉDITO', value: 'CRÉDITO' }
];

function LancamentoFinanceiro() {
    const [isVisible, setIsVisible] = useState(false);

    const [dataDe, setDataDe] = useState('');
    const [filial, setFilial] = useState('');
    const [cliente, setCliente] = useState('');
    const [dataAte, setDataAte] = useState('');
    const [situacao, setSituacao] = useState('');
    const [documento, setDocumento] = useState('');

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [modelos, setModelos] = useState([]);
    const [filiais, setFiliais] = useState([]);
    const [clientes, setClientes] = useState([]);

    const [index, setIndex] = useState(null);
    const [totalParcela, setTotalParcela] = useState(0);
    const [lancamentos, setLancamentos] = useState([]);
    const [lancamento, setLancamento] = useState(new SchemaLancamentoManual());
    const [parcela, setParcela] = useState(new SchemaParcelaLancamentoManual());

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | Lançamento Financeiro Manual';
    }, []);

    useEffect(() => {
        buscarModelos();
        buscarFilias();
    }, []);

    async function buscarFilias() {
        await Api({
            method: 'get',
            url: `filiais?resumo`,
            params: {
                empresa,
                page: 0,
                size: 999999999
            }
        }).then(resp => {
            const data = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.codigo} - ${e.nome}`
            }));

            setFiliais(data);
        })
            .catch(error => {
                console.log(error);
            });
    }

    async function buscarModelos() {
        await Api({
            method: 'get',
            url: `modelosFiscal`,
            params: {
                page: 0,
                size: 999999999,
            }
        }).then(resp => {
            const data = resp.data.map((e) => ({
                value: e.id,
                label: `${e.codigo} - ${e.descricao} - ${e.sigla}`
            }));
            setModelos(data);
        })
            .catch(error => {
                console.log(error);
            })
    }

    async function buscarClientes(event) {
        await Api({
            method: 'get',
            url: `cadastros?resumo`,
            params: {
                page: 0,
                empresa,
                size: 999999999,
                nome: event.query.toLowerCase()
            },
        }).then(resp => {
            const data = resp.data.content.map((e) => (
                { id: e.id, nomeRazao: e.nomeRazao, cnpjCpf: e.cnpjCpf, empresa: { id: e.empresa } }
            ));

            setClientes(data);
        })
            .catch(error => {
                console.log(error);
            });
    }

    function onPage(event) {
        pesquisar(event.page, event.rows, event.first)
            .then(
                setFirst(event.first),
                setRows(event.rows),
                setPage(event.page))
            .catch(error => {
                console.log(error);
            });
    }

    async function buscarPorId(value) {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}/${value}`
        }).then(resp => {
            Loading.onHide();

            setActiveIndex(1);

            let data = resp.data;
            let parcelas = data.parcelas;

            parcelas = parcelas.map((e) => ({
                id: e.id,
                numero: e.numero,
                valor: e.valor,
                vencimento: e.vencimento,
                total: mascaraMoney(e.valor)
            }));

            data.parcelas = parcelas;
            setLancamento(data);
        })
            .catch(error => {
                Loading.onHide();
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            });
    }

    async function pesquisar(eventPage = 0, eventRows = 0, eventFirst = 0) {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                filial,
                dataDe,
                cliente,
                empresa,
                dataAte,
                situacao,
                documento,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            const data = resp.data.content;

            formataMoney(data, 'total');
            setLancamentos(data);
            setTotalRecords(resp.data.totalElements);
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            });
    }

    function formataMoney(data, field) {
        for (const x of data) {
            x[field] = x[field].toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        }
    }

    function mascaraMoney(value) {
        return value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    }

    async function excluir(value) {
        Loading.onShow();

        await Api({
            method: 'delete',
            url: `${url}/${value}`
        }).then(resp => {
            Loading.onHide();
            Toasty.success('Sucesso!', 'Registro excluído com sucesso!');
            pesquisar();
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao excluír registros!');
            });
    }

    function handle() {
        const parcelas = lancamento.parcelas.map((e) => ({
            id: e.id,
            numero: e.numero,
            valor: e.valor,
            vencimento: e.vencimento
        }));

        setLancamento({ ...lancamento, parcelas });

        setTimeout(() => {
            salvar();
        }, 100);
    }

    async function salvar() {
        Loading.onShow();

        if (lancamento.id > 0) {
            await Api({
                method: 'put',
                url: `${url}/${lancamento.id}`,
                data: JSON.stringify(lancamento)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Lançamento Financeiro Manual editado com sucesso!');
            })
                .catch(error => {
                    Loading.onHide();
                    console.log(error);
                    Toasty.error('Erro!', 'Erro ao processar esse registro!');
                });

        } else {
            await Api({
                method: 'post',
                url: `${url}`,
                data: JSON.stringify(lancamento)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Lançamento Financeiro Manual adicionado com sucesso!');
            })
                .catch(error => {
                    Loading.onHide();
                    console.log(error);
                    Toasty.error('Erro!', 'Erro ao processar esse registro!');
                });
        }
    }

    async function confirmacaoExcluir(value) {
        await confirmService.show({
            message: `Deseja realmente excluír esse registro (${value}) ?`
        }).then(
            (res) => {
                if (res) {
                    excluir(value);
                }
            }
        ).catch(error => {
            console.log(error)
        });
    }

    function validaFormulario() {
        try {
            if (lancamento.data &&
                lancamento.modelo &&
                lancamento.valor > 0 &&
                lancamento.documento &&
                lancamento.descricao &&
                lancamento.filial?.id &&
                lancamento.cadastro?.id &&
                lancamento.parcelas.length > 0 &&
                lancamento.situacao === 'ABERTO' &&
                isTotalParcela() === lancamento.valor) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    function isTotalParcela() {
        try {
            let total = 0;
            let data = lancamento.parcelas;

            for (let index = 0; index < data.length; index++) {
                total += data[index].valor;
            }
            return total;
        } catch (error) {
            console.log(error);
            return 0;
        }
    }

    function inserir() {
        setActiveIndex(1);
        setLancamento(new SchemaLancamentoManual());
    }

    function cancelar() {
        setActiveIndex(0);
    }

    function exportarXLS() {
        Toasty.warn('Atenção!', 'Falta implementação!');
    }

    function acoesTabela(rowData) {
        return <div>
            <Button
                type='button'
                tooltip='Editar'
                icon='pi pi-pencil'
                className='p-button-warning'
                style={{ marginRight: '.5em' }}
                tooltipOptions={{ position: 'left' }}
                onClick={() => buscarPorId(rowData.id)}
            />
            <Button
                type='button'
                tooltip='Excluir'
                icon='pi pi-trash'
                className='p-button-danger'
                tooltipOptions={{ position: 'left' }}
                onClick={() => confirmacaoExcluir(rowData.id)}
            />
        </div>;
    }

    function acoesParcela(rowData) {
        return <div>
            <Button
                type='button'
                tooltip='Editar'
                icon='pi pi-pencil'
                className='p-button-warning'
                style={{ marginRight: '.5em' }}
                tooltipOptions={{ position: 'left' }}
                onClick={() => editarParcela(rowData)}
            />
            <Button
                type='button'
                tooltip='Excluir'
                icon='pi pi-trash'
                className='p-button-danger'
                tooltipOptions={{ position: 'left' }}
                onClick={() => confirmacaoExcluirParcela(rowData)}
            />
        </div>;
    }

    async function confirmacaoExcluirParcela(value) {
        await confirmService.show({
            message: `Deseja realmente excluír esse registro (${value.numero}) ?`
        }).then(
            (res) => {
                if (res) {
                    excluirParcela(value);
                }
            }
        ).catch(error => {
            console.log(error)
        });
    }

    function excluirParcela(value) {
        try {
            let cadParcela = lancamento.parcelas;
            cadParcela.splice(cadParcela.indexOf(value), 1);

            let position = cadParcela.indexOf(value);
            cadParcela = cadParcela.filter((value, i) => i !== position);
            setLancamento({ ...lancamento, parcelas: cadParcela });
        } catch (error) {
            console.log(error);
        }
    }

    function salvarParcela() {
        try {
            let cadParcela = lancamento.parcelas;
            if (index !== null) {
                cadParcela[index] = parcela;

                cadParcela = cadParcela.map((e) => ({
                    id: e.id,
                    numero: e.numero,
                    valor: e.valor,
                    vencimento: e.vencimento,
                    total: mascaraMoney(e.valor)
                }));

                setLancamento({ ...lancamento, parcelas: cadParcela });
                cancelarParcela();
            } else {
                cadParcela.push(parcela);

                cadParcela = cadParcela.map((e) => ({
                    id: e.id,
                    numero: e.numero,
                    valor: e.valor,
                    vencimento: e.vencimento,
                    total: mascaraMoney(e.valor)
                }));

                setLancamento({ ...lancamento, parcelas: cadParcela });
                cancelarParcela();
            }
        } catch (error) {
            console.log(error);
        }
    }

    function editarParcela(value) {
        try {
            let position = lancamento.parcelas.indexOf(value);
            setIndex(position);
            setParcela(value);
            setIsVisible(true);
        } catch (error) {
            console.log(error);
        }
    }

    function inserirParcela() {
        setIsVisible(true);
        setParcela(new SchemaParcelaLancamentoManual());
    }

    function cancelarParcela() {
        setIndex(null);
        setIsVisible(false);
    }

    function validaFormularioParcela() {
        try {
            if (parcela.numero &&
                parcela.vencimento &&
                parcela.valor > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Lançamentos Financeiro Manual</div>;

    const footer = 'Quantidade de registros ' + totalRecords;

    const headerParcela = (
        <div style={{ display: 'flex', justifyContent: 'space-between', lineHeight: '1.87em' }}>
            <div>Parcela(s)</div>

            <Button
                type='button'
                icon='pi pi-plus'
                onClick={inserirParcela}
                tooltip='Adicionar parcela'
                className='p-button-success'
                tooltipOptions={{ position: 'left' }}
            />
        </div>
    )

    const footerParcela = 'Total Parcela(s) ' + mascaraMoney(totalParcela);

    return (
        <div className='p-fluid'>
            <div className='p-grid'>
                <div className='p-col-12'>
                    <Card>
                        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                            <TabPanel disabled header='Lista'>
                                <Toolbar>
                                    <div className='p-toolbar-group-left'>
                                        <Button
                                            icon='pi pi-plus'
                                            label='Adicionar'
                                            onClick={inserir}
                                            className='p-button-success'
                                        />
                                    </div>
                                    <div className='p-toolbar-group-right'>
                                        <Button
                                            tooltip='Pesquisar'
                                            icon='pi pi-search'
                                            onClick={() => pesquisar()}
                                            style={{ marginRight: '.25em' }}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                        <Button
                                            type='button'
                                            tooltip='XLS'
                                            icon='pi pi-external-link'
                                            className='p-button-warning'
                                            onClick={() => exportarXLS()}
                                            disabled={lancamentos.length === 0}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </Toolbar>

                                <div className='p-grid' style={{ marginTop: 5, flexDirection: 'row' }}>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data De</label>
                                        <InputMask
                                            mask='99/99/9999'
                                            value={dataDe}
                                            onChange={(e) => setDataDe(e.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data Até</label>
                                        <InputMask
                                            mask='99/99/9999'
                                            value={dataAte}
                                            onChange={(e) => { console.log(e); setDataAte(e.value) }}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Documento</label>
                                        <InputText
                                            maxLength={10}
                                            value={documento}
                                            keyfilter={/[0-9]+$/}
                                            onChange={(e) => setDocumento(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-6'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Filial</label>
                                        <Dropdown
                                            filter={true}
                                            value={filial}
                                            showClear={true}
                                            options={filiais}
                                            filterBy='label,value'
                                            onChange={(e) => setFilial(e.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-8'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cliente</label>
                                        <InputText
                                            maxLength={255}
                                            value={cliente}
                                            onChange={(e) => setCliente(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-4'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Situação</label>
                                        <Dropdown
                                            filter={true}
                                            value={situacao}
                                            showClear={true}
                                            options={situacoes}
                                            filterBy='label,value'
                                            onChange={(e) => setSituacao(e.value)}
                                        />
                                    </div>
                                </div>

                                <div className='content-section implementation'>
                                    <DataTable
                                        lazy={true}
                                        rows={rows}
                                        first={first}
                                        footer={footer}
                                        header={header}
                                        onPage={onPage}
                                        paginator={true}
                                        responsive={true}
                                        value={lancamentos}
                                        style={{ marginTop: 10 }}
                                        totalRecords={totalRecords}
                                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='data' header='Data' style={{ width: '8em' }} />
                                        <Column field='documento' header='Documento' style={{ width: '8em' }} />
                                        <Column field='cliente' header='Cliente' />
                                        <Column field='total' header='Total' style={{ width: '10em' }} />
                                        <Column field='situacao' header='Situação' style={{ width: '8em' }} />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>

                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Lançamento Financeiro Manual</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={lancamento.id}
                                                />
                                            </div>
                                            <div style={{ padding: 0 }} className='p-col-12 p-md-10' />
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo Lançamento *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={tipos}
                                                    filterBy='label,value'
                                                    value={lancamento.tipoLancamento}
                                                    disabled={lancamento.situacao === 'ABERTO' ? false : true}
                                                    onChange={(e) => setLancamento({ ...lancamento, tipoLancamento: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-10'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Filial *</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    options={filiais}
                                                    filterBy='label,value'
                                                    value={lancamento?.filial?.id}
                                                    disabled={lancamento.situacao === 'ABERTO' ? false : true}
                                                    onChange={(e) => setLancamento({ ...lancamento, filial: { id: e.value } })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cliente *</label>
                                                <AutoComplete
                                                    minLength={3}
                                                    field={'nomeRazao'}
                                                    suggestions={clientes}
                                                    value={lancamento?.cadastro}
                                                    completeMethod={buscarClientes}
                                                    disabled={lancamento.situacao === 'ABERTO' ? false : true}
                                                    itemTemplate={(item) => (`${item.nomeRazao} - ${item.cnpjCpf}`)}
                                                    onChange={(e) => setLancamento({ ...lancamento, cadastro: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-6'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Modelo *</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    options={modelos}
                                                    filterBy='label,value'
                                                    value={lancamento?.modelo?.id}
                                                    disabled={lancamento.situacao === 'ABERTO' ? false : true}
                                                    onChange={(e) => setLancamento({ ...lancamento, modelo: { id: e.value } })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data *</label>
                                                <InputMask
                                                    mask='99/99/9999'
                                                    value={lancamento.data}
                                                    disabled={lancamento.situacao === 'ABERTO' ? false : true}
                                                    onChange={(e) => setLancamento({ ...lancamento, data: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Documento *</label>
                                                <InputText
                                                    value={lancamento.documento}
                                                    readOnly={lancamento.situacao === 'ABERTO' ? false : true}
                                                    onChange={(e) => setLancamento({ ...lancamento, documento: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor *</label>
                                                <InputNumber
                                                    min={0}
                                                    mode='decimal'
                                                    minFractionDigits={2}
                                                    maxFractionDigits={2}
                                                    value={lancamento.valor}
                                                    disabled={lancamento.situacao === 'ABERTO' ? false : true}
                                                    onChange={(e) => setLancamento({ ...lancamento, valor: e.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='hr'>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='p-col-12'>
                                    <div className='content-section implementation'>
                                        <DataTable
                                            rows={5}
                                            paginator={true}
                                            responsive={true}
                                            footer={footerParcela}
                                            header={headerParcela}
                                            value={lancamento.parcelas}
                                            totalRecords={lancamento.parcelas.length}
                                            emptyMessage={'Nenhum registro encontrado!'}
                                        >
                                            <Column field='id' header='ID' style={{ width: '6em' }} />
                                            <Column field='numero' header='Número' />
                                            <Column field='total' header='Valor' />
                                            <Column field='vencimento' header='Vencimento' />
                                            <Column body={acoesParcela} style={{ textAlign: 'center', width: '8em' }} />
                                        </DataTable>
                                    </div>
                                </div>

                                <div className='p-col-12 p-md-12'>
                                    <Toolbar>
                                        <div className='p-toolbar-group-left'>
                                            <Button
                                                label='Salvar'
                                                onClick={salvar}
                                                icon='pi pi-check'
                                                disabled={!validaFormulario()}
                                            />
                                        </div>
                                        <div className='p-toolbar-group-right'>
                                            <Button
                                                label='Cancelar'
                                                icon='pi pi-times'
                                                onClick={cancelar}
                                                className='p-button-danger'
                                            />
                                        </div>
                                    </Toolbar>
                                </div>

                            </TabPanel>

                        </TabView>
                    </Card>

                    <Dialog
                        modal
                        maximizable
                        id='form-dialog'
                        visible={isVisible}
                        header='Cadastro de Parcela(s)'
                        onHide={() => setIsVisible(false)}
                        footer={(<div style={{ height: 20 }}></div>)}
                    >
                        <Card>
                            <div className='p-fluid'>
                                <div className='p-col-12'>
                                    <div className='p-grid'>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                            <InputText
                                                readOnly={true}
                                                value={parcela.id}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Número *</label>
                                            <InputText
                                                value={parcela.numero}
                                                onChange={(e) => setParcela({ ...parcela, numero: e.target.value })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data *</label>
                                            <InputMask
                                                mask='99/99/9999'
                                                value={parcela.vencimento}
                                                onChange={(e) => setParcela({ ...parcela, vencimento: e.value })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor *</label>
                                            <InputNumber
                                                min={0}
                                                mode='decimal'
                                                minFractionDigits={2}
                                                maxFractionDigits={2}
                                                value={parcela.valor}
                                                onChange={(e) => setParcela({ ...parcela, valor: e.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }} className='p-col-12 p-md-4'>
                                            <Button
                                                label='Salvar'
                                                icon='pi pi-check'
                                                onClick={salvarParcela}
                                                style={{ width: '48%' }}
                                                disabled={!validaFormularioParcela()}
                                            />
                                            <Button
                                                label='Cancelar'
                                                icon='pi pi-times'
                                                style={{ width: '48%' }}
                                                onClick={cancelarParcela}
                                                className='p-button-danger'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Dialog>

                </div>
            </div>
        </div >
    );
}

export default withRouter(LancamentoFinanceiro);