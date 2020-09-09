/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { withRouter } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { TabView, TabPanel } from 'primereact/tabview';

import confirmService from '../../../services/confirmService';
import InputNumber from '../../../components/inputNumber';
import Loading from '../../../components/loading';
import Toasty from '../../../components/toasty';
import Api from '../../../services/Api';

import { SchemaTalaoCheque, empresa } from '../TesModel';
const url = 'taloesCheque';

const listaStatus = [
    { label: 'ATIVO', value: 'ATIVO' },
    { label: 'INATIVO', value: 'INATIVO' }
];

function TalaoCheque() {

    const [id, setId] = useState('');
    const [filial, setFilial] = useState('');
    const [status, setStatus] = useState('');

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [taloes, setTaloes] = useState([]);
    const [bancos, setBancos] = useState([]);
    const [contas, setContas] = useState([]);
    const [filiais, setFiliais] = useState([]);
    const [agencias, setAgencias] = useState([]);
    const [talao, setTalao] = useState(new SchemaTalaoCheque());

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | Talão de Cheque';
    }, []);

    useEffect(() => {
        buscarBancos();
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

    async function buscarBancos() {
        await Api({
            method: 'get',
            url: `bancos?resumo`,
            params: {
                page: 0,
                size: 999999999,
            }
        }).then(resp => {
            const data = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.codigo} - ${e.descricao}`
            }));
            setBancos(data);
        })
            .catch(error => {
                console.log(error);
            })
    }

    async function buscarAgencias(value) {
        await Api({
            method: 'get',
            url: `agencias?resumo`,
            params: {
                page: 0,
                banco: value,
                size: 999999999,
            }
        }).then(resp => {
            const data = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.codigo} - ${e.descricao}`
            }));
            setAgencias(data);
        })
            .catch(error => {
                console.log(error);
            })
    }

    async function buscarContas(value) {
        await Api({
            method: 'get',
            url: `contasFinanceira?resumo`,
            params: {
                page: 0,
                empresa,
                agencia: value,
                size: 999999999,
            }
        }).then(resp => {
            const data = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.conta} - ${e.descricao}`
            }));
            setContas(data);
        })
            .catch(error => {
                console.log(error);
            })
    }

    function onPage(event) {
        pesquisar(event.page, event.rows, event.first)
            .then(
                setFirst(event.first),
                setRows(event.rows),
                setPage(event.page))
            .catch(error => {
                console.log(error)
            });
    }

    async function buscarPorId(value) {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}/${value}`
        }).then(resp => {
            Loading.onHide();

            const { conta } = resp.data;

            const agencia = {
                value: conta.agencia.id,
                label: `${conta.agencia.codigo} - ${conta.agencia.descricao}`
            };

            const banco = {
                value: conta.agencia.banco.id,
                label: `${conta.agencia.banco.codigo} - ${conta.agencia.banco.descricao}`
            };

            setActiveIndex(1);
            setBancos([banco]);
            setTalao(resp.data);
            setAgencias([agencia]);
            setContas([{ value: conta.id, label: `${conta.conta} - ${conta.descricao}` }]);
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
                id,
                filial,
                status,
                empresa,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            setTaloes(resp.data.content);
            setTotalRecords(resp.data.totalElements);
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            });
    }

    function onChangeBanco(value) {
        buscarAgencias(value);
        setTalao({ ...talao, conta: { ...talao.conta, agencia: { ...talao.conta.agencia, banco: { id: value } } } });
    }

    function onChangeAgencia(value) {
        buscarContas(value);
        setTalao({ ...talao, conta: { ...talao.conta, agencia: { ...talao.conta.agencia, id: value } } });
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

    async function salvar() {
        Loading.onShow();

        if (talao.id > 0) {
            await Api({
                method: 'put',
                url: `${url}/${talao.id}`,
                data: JSON.stringify(talao)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Talão de Cheque editado com sucesso!');
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
                data: JSON.stringify(talao)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Talão de Cheque adicionado com sucesso!');
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
            if (talao.conta.id &&
                talao.filial.id &&
                talao.numeroInicial > 0 &&
                talao.numeroFinal > talao.numeroInicial) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    function inserir() {
        setActiveIndex(1);
        setTalao(new SchemaTalaoCheque());
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

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Talões de Cheque</div>;

    const footer = 'Quantidade de registros ' + totalRecords;

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
                                            disabled={taloes.length === 0}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </Toolbar>

                                <div className='p-grid' style={{ marginTop: 5, flexDirection: 'row' }}>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                        <InputText
                                            value={id}
                                            maxLength={10}
                                            keyfilter={/[0-9]+$/}
                                            onChange={(e) => setId(e.target.value)}
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
                                    <div className='p-col-12 p-md-4'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status</label>
                                        <Dropdown
                                            filter={true}
                                            value={status}
                                            showClear={true}
                                            options={listaStatus}
                                            filterBy='label,value'
                                            onChange={(e) => setStatus(e.value)}
                                        />
                                    </div>
                                </div>

                                <div className='content-section implementation'>
                                    <DataTable
                                        lazy={true}
                                        rows={rows}
                                        first={first}
                                        value={taloes}
                                        footer={footer}
                                        header={header}
                                        onPage={onPage}
                                        paginator={true}
                                        responsive={true}
                                        style={{ marginTop: 10 }}
                                        totalRecords={totalRecords}
                                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='nomeBanco' header='Banco' />
                                        <Column field='nomeAgencia' header='Agência' />
                                        <Column field='descricaoConta' header='Conta' />
                                        <Column field='status' header='Status' />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Talão de Cheque</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={talao.id}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Filial *</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    options={filiais}
                                                    filterBy='label,value'
                                                    value={talao.filial.id}
                                                    disabled={talao.id ? true : false}
                                                    onChange={(e) => setTalao({ ...talao, filial: { id: e.value } })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Banco *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={bancos}
                                                    showClear={true}
                                                    filterBy='label,value'
                                                    value={talao.conta?.agencia?.banco?.id}
                                                    onChange={(e) => onChangeBanco(e.value)}
                                                    disabled={talao.conta?.agencia?.id ? true : false}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Agência *</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    options={agencias}
                                                    filterBy='label,value'
                                                    value={talao.conta?.agencia?.id}
                                                    disabled={talao.conta?.id ? true : false}
                                                    onChange={(e) => onChangeAgencia(e.value)}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Conta *</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    options={contas}
                                                    filterBy='label,value'
                                                    value={talao.conta?.id}
                                                    disabled={talao.id ? true : false}
                                                    onChange={(e) => setTalao({ ...talao, conta: { ...talao.conta, id: e.value } })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Número Inicial *</label>
                                                <InputNumber
                                                    min={1}
                                                    mode='decimal'
                                                    minFractionDigits={0}
                                                    maxFractionDigits={0}
                                                    value={talao.numeroInicial}
                                                    disabled={talao.id ? true : false}
                                                    onChange={(e) => setTalao({ ...talao, numeroInicial: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Número Final *</label>
                                                <InputNumber
                                                    min={1}
                                                    mode='decimal'
                                                    minFractionDigits={0}
                                                    maxFractionDigits={0}
                                                    value={talao.numeroFinal}
                                                    disabled={talao.id ? true : false}
                                                    onChange={(e) => setTalao({ ...talao, numeroFinal: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status *</label>
                                                <Dropdown
                                                    value={talao.status}
                                                    options={listaStatus}
                                                    filterBy='label,value'
                                                    onChange={(e) => setTalao({ ...talao, status: e.value })}
                                                />
                                            </div>
                                        </div>
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
                </div>
            </div>
        </div >
    );
}

export default withRouter(TalaoCheque);