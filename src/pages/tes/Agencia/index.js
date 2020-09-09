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
import Loading from '../../../components/loading';
import Toasty from '../../../components/toasty';
import Api from '../../../services/Api';

import { SchemaAgencia } from '../TesModel';
const url = 'agencias';

const listaStatus = [
    { label: 'ATIVO', value: 'ATIVO' },
    { label: 'INATIVO', value: 'INATIVO' }
];

function Agencia() {

    const [banco, setBanco] = useState('');
    const [status, setStatus] = useState('');
    const [codigo, setCodigo] = useState('');
    const [descricao, setDescricao] = useState('');

    const [bancos, setBancos] = useState([]);
    const [agencias, setAgencias] = useState([]);
    const [agencia, setAgencia] = useState(new SchemaAgencia());

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        Loading.onShow();
        document.title = 'Evolution Sistemas - eDigital | Agência Bancária';
    }, []);

    useEffect(() => {
        setTimeout(() => {
            buscarBancos();
            Loading.onHide();
        }, 100);
    }, []);

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

            setActiveIndex(1);
            setAgencia(resp.data);
        })
            .catch(error => {
                Loading.onHide();
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            })
    }

    async function pesquisar(eventPage = 0, eventRows = 0, eventFirst = 0) {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                banco,
                codigo,
                status,
                descricao,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            setAgencias(resp.data.content);
            setTotalRecords(resp.data.totalElements);
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            })
    }

    async function salvar() {
        Loading.onShow();

        if (agencia.id > 0) {
            await Api({
                method: 'put',
                url: `${url}/${agencia.id}`,
                data: JSON.stringify(agencia)
            }).then(resp => {
                Loading.onHide()
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Agência editada com sucesso!');
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
                data: JSON.stringify(agencia)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Agência adicionada com sucesso!');
            })
                .catch(error => {
                    Loading.onHide();
                    console.log(error);
                    Toasty.error('Erro!', 'Erro ao processar esse registro!');
                });
        }
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
            })
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

    function inserir() {
        setActiveIndex(1);
        setAgencia(new SchemaAgencia());
    }

    function cancelar() {
        setActiveIndex(0);
    }

    function exportarXLS() {
        Toasty.warn('Atenção!', 'Falta implementação!');
    }

    function validaFormulario() {
        try {
            if (agencia.banco.id &&
                agencia.codigo.length >= 1 &&
                agencia.digito.length >= 1 &&
                agencia.cidade.length >= 1 &&
                agencia.descricao.length >= 2) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error)
            return false;
        }
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

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Agências Bancárias</div>;

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
                                            disabled={agencias.length === 0}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </Toolbar>

                                <div className='p-grid' style={{ marginTop: 5, flexDirection: 'row' }}>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código</label>
                                        <InputText
                                            value={codigo}
                                            maxLength={10}
                                            keyfilter={/[0-9]+$/}
                                            onChange={(e) => setCodigo(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-4'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Banco</label>
                                        <Dropdown
                                            value={banco}
                                            showClear={true}
                                            options={bancos}
                                            onChange={(e) => setBanco(e.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-4'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição</label>
                                        <InputText
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status</label>
                                        <Dropdown
                                            showClear={true}
                                            value={status}
                                            options={listaStatus}
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
                                        value={agencias}
                                        paginator={true}
                                        responsive={true}
                                        style={{ marginTop: 10 }}
                                        totalRecords={totalRecords}
                                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='codigo' header='Código' style={{ width: '6em' }} />
                                        <Column field='nomeBanco' header='Banco' />
                                        <Column field='descricao' header='Descrição' />
                                        <Column field='status' header='Status' style={{ width: '6em' }} />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Agência Bancária</h2>
                                <div className='p-col-12 p-md-2'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                    <InputText
                                        readOnly={true}
                                        value={agencia.id}
                                    />
                                </div>
                                <div className='p-col-12 p-md-12'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Banco</label>
                                    <Dropdown
                                        filter={true}
                                        options={bancos}
                                        filterBy='label,value'
                                        value={agencia.banco.id}
                                        onChange={(e) => setAgencia({ ...agencia, banco: { id: e.value } })}
                                    />
                                </div>
                                <div className='p-col-12 p-md-12'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código</label>
                                    <InputText
                                        maxLength={10}
                                        keyfilter={/[0-9]+$/}
                                        value={agencia.codigo}
                                        onChange={(e) => setAgencia({ ...agencia, codigo: e.target.value })}
                                    />
                                </div>
                                <div className='p-col-12 p-md-12'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Dígito</label>
                                    <InputText
                                        maxLength={2}
                                        value={agencia.digito}
                                        onChange={(e) => setAgencia({ ...agencia, digito: e.target.value })}
                                    />
                                </div>
                                <div className='p-col-12 p-md-12'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição</label>
                                    <InputText
                                        maxLength={255}
                                        value={agencia.descricao}
                                        onChange={(e) => setAgencia({ ...agencia, descricao: e.target.value })}
                                    />
                                </div>
                                <div className='p-col-12 p-md-12'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cidade</label>
                                    <InputText
                                        maxLength={255}
                                        value={agencia.cidade}
                                        onChange={(e) => setAgencia({ ...agencia, cidade: e.target.value })}
                                    />
                                </div>
                                <div className='p-col-12 p-md-12'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status</label>
                                    <Dropdown
                                        value={agencia.status}
                                        options={listaStatus}
                                        onChange={(e) => setAgencia({ ...agencia, status: e.value })}
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
                            </TabPanel>
                        </TabView>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default withRouter(Agencia);