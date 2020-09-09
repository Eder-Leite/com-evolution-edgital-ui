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
import { AutoComplete } from 'primereact/autocomplete';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputTextarea } from 'primereact/inputtextarea';

import confirmService from '../../../services/confirmService';
import Loading from '../../../components/loading';
import Toasty from '../../../components/toasty';
import Api from '../../../services/Api';

import { SchemaComplementoNatureza, empresa } from '../LivModel';
const url = 'complementosNatureza';

const tiposVenda = [
    { label: 'PRAZO', value: 'PRAZO' },
    { label: 'VISTA', value: 'VISTA' }
];

const check = [
    { label: 'SIM', value: 'SIM' },
    { label: 'NÃO', value: 'NÃO' }
];

const tiposStatus = [
    { label: 'ATIVO', value: 'ATIVO' },
    { label: 'INATIVO', value: 'INATIVO' }
];

function ComplementoNatureza() {

    const [cfop, setCfop] = useState('');
    const [numero, setNumero] = useState('');
    const [status, setStatus] = useState('');
    const [descricao, setDescricao] = useState('');

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [cfops, setCfops] = useState([]);
    const [complementos, setComplementos] = useState([]);
    const [complemento, setComplemento] = useState(new SchemaComplementoNatureza());

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | Complemento Natureza';
    }, []);

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
            setComplemento(resp.data);
        })
            .catch(error => {
                Loading.onHide();
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            });
    }

    async function buscarCfops(event) {
        await Api({
            method: 'get',
            url: `codigosCFOP?resumo`,
            params: {
                page: 0,
                size: 999999999,
                codigo: event.query.toLowerCase()
            },
        }).then(resp => {
            setCfops(resp.data.content);
        })
            .catch(error => {
                console.log(error);
            });
    }

    async function pesquisar(eventPage = 0, eventRows = 0, eventFirst = 0) {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                cfop,
                status,
                numero,
                empresa,
                descricao,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            setComplementos(resp.data.content);
            setTotalRecords(resp.data.totalElements);
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            });
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

        if (complemento.id > 0) {
            await Api({
                method: 'put',
                url: `${url}/${complemento.id}`,
                data: JSON.stringify(complemento)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Complemento de Natureza editado com sucesso!');
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
                data: JSON.stringify(complemento)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Complemento de Natureza adicionado com sucesso!');
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
            if (complemento.codigoCFOP?.id &&
                complemento.descricao.length >= 4 &&
                complemento.numero) {
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
        setComplemento(new SchemaComplementoNatureza());
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

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Complementos de Natureza</div>;

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
                                            disabled={cfops.length === 0}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </Toolbar>

                                <div className='p-grid' style={{ marginTop: 5, flexDirection: 'row' }}>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>CFOP</label>
                                        <InputText
                                            value={cfop}
                                            maxLength={4}
                                            keyfilter={/[0-9]+$/}
                                            onChange={(e) => setCfop(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Número</label>
                                        <InputText
                                            value={numero}
                                            maxLength={2}
                                            keyfilter={/[0-9]+$/}
                                            onChange={(e) => setNumero(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-6'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição</label>
                                        <InputText
                                            maxLength={255}
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status</label>
                                        <Dropdown
                                            filter={true}
                                            value={status}
                                            showClear={true}
                                            options={tiposStatus}
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
                                        header={header}
                                        footer={footer}
                                        onPage={onPage}
                                        paginator={true}
                                        responsive={true}
                                        value={complementos}
                                        style={{ marginTop: 10 }}
                                        totalRecords={totalRecords}
                                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='cfop' header='CFOP' style={{ width: '6em' }} />
                                        <Column field='numero' header='Número' style={{ width: '6em' }} />
                                        <Column field='descricao' header='Descrição'style={{ minWidth: '9em' }} />
                                        <Column field='movimentoFinanceiro' header='Financeiro' style={{ width: '9em' }} />
                                        <Column field='prazoVista' header='Tipo Venda' style={{ width: '9em' }} />
                                        <Column field='status' header='Status' style={{ width: '6em' }} />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Complemento de Natureza</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={complemento.id}
                                                />
                                            </div>
                                            <div style={{ padding: 0 }} className='p-md-10'></div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>CFOP *</label>
                                                <AutoComplete
                                                    minLength={3}
                                                    field={'codigo'}
                                                    suggestions={cfops}
                                                    completeMethod={buscarCfops}
                                                    value={complemento?.codigoCFOP}
                                                    itemTemplate={(item) => (`${item.codigo} - ${item.descricao}`)}
                                                    onChange={(e) => setComplemento({ ...complemento, codigoCFOP: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Número *</label>
                                                <InputText
                                                    maxLength={2}
                                                    keyfilter={/[0-9]+$/}
                                                    value={complemento.numero}
                                                    onChange={(e) => setComplemento({ ...complemento, numero: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-10'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={complemento.descricao}
                                                    onChange={(e) => setComplemento({ ...complemento, descricao: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Financeiro *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={check}
                                                    filterBy='label,value'
                                                    value={complemento.movimentoFinanceiro}
                                                    onChange={(e) => setComplemento({ ...complemento, movimentoFinanceiro: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Prazo/Vista</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    options={tiposVenda}
                                                    filterBy='label,value'
                                                    value={complemento.prazoVista}
                                                    onChange={(e) => setComplemento({ ...complemento, prazoVista: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={tiposStatus}
                                                    filterBy='label,value'
                                                    value={complemento.status}
                                                    onChange={(e) => setComplemento({ ...complemento, status: e.value })}
                                                />
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
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                        </TabView>
                    </Card>
                </div>
            </div>
        </div >
    );
}

export default withRouter(ComplementoNatureza);