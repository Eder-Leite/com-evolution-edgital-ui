/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { withRouter } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { TabView, TabPanel } from 'primereact/tabview';
import { AutoComplete } from 'primereact/autocomplete';

import confirmService from '../../../services/confirmService';
import Loading from '../../../components/loading';
import Toasty from '../../../components/toasty';
import Api from '../../../services/Api';

import { SchemaLocalFaturamento, empresa } from '../TesModel';
const url = 'locaisFaturamento';

function LocalFaturamento() {

    const [id, setId] = useState('');
    const [descricao, setDescricao] = useState('');
    const [nomeFilial, setNomeFilial] = useState('');

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [locais, setLocais] = useState([]);
    const [contas, setContas] = useState([]);
    const [filiais, setFiliais] = useState([]);
    const [local, setLocal] = useState(new SchemaLocalFaturamento());

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | Local de Faturamento';
    }, []);

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

    async function buscarFiliais(event) {
        await Api({
            method: 'get',
            url: `filiais?resumo`,
            params: {
                empresa,
                page: 0,
                size: 999999999,
                nome: event.query.toLowerCase()
            }
        }).then(resp => {
            const data = resp.data.content.map((e) => ({
                id: e.id,
                nome: e.nome,
                codigo: e.codigo,
            }));

            setFiliais(data);
        })
            .catch(error => {
                console.log(error);
            });
    }

    async function buscarContas(event) {
        await Api({
            method: 'get',
            url: `contasFinanceira?resumo`,
            params: {
                page: 0,
                empresa,
                size: 999999999,
                descricao: event.query.toLowerCase()
            }
        }).then(resp => {
            const data = resp.data.content.map((e) => ({
                id: e.id,
                conta: e.conta,
                descricao: e.descricao,
            }));
            setContas(data);
        })
            .catch(error => {
                console.log(error);
            })
    }

    async function buscarPorId(value) {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}/${value}`
        }).then(resp => {
            Loading.onHide();

            setActiveIndex(1);
            setLocal(resp.data);
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
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
                empresa,
                descricao,
                nomeFilial,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            setLocais(resp.data.content);
            setTotalRecords(resp.data.totalElements);
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            });
    }

    async function salvar() {
        Loading.onShow();

        if (local.id) {
            await Api({
                method: 'put',
                url: `${url}/${local.id}`,
                data: JSON.stringify(local)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Local de Faturamento editado com sucesso!');
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
                data: JSON.stringify(local)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Local de Faturamento adicionado com sucesso!');
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

    function validaFormulario() {
        try {
            if (local?.filial?.id &&
                local?.conta?.id >= 1 &&
                local.descricao.length >= 2) {
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
        setLocal(new SchemaLocalFaturamento());
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

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Locais de Faturamento</div>;

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
                                            disabled={locais.length === 0}
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
                                    <div className='p-col-12 p-md-4'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Filial</label>
                                        <InputText
                                            value={nomeFilial}
                                            onChange={(e) => setNomeFilial(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-6'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição</label>
                                        <InputText
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className='content-section implementation'>
                                    <DataTable
                                        lazy={true}
                                        rows={rows}
                                        first={first}
                                        value={locais}
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
                                        <Column field='id' header='ID' style={{ width: '8em' }} />
                                        <Column field='nomeFilial' header='Filial' />
                                        <Column field='descricaoConta' header='Conta' />
                                        <Column field='descricao' header='Descrição' />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Local de Faturamento</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={local.id}
                                                />
                                            </div>
                                            <div style={{ padding: 0 }} className='p-md-10' />
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Filial *</label>
                                                <AutoComplete
                                                    minLength={3}
                                                    field={'nome'}
                                                    suggestions={filiais}
                                                    value={local?.filial}
                                                    completeMethod={buscarFiliais}
                                                    onChange={(e) => setLocal({ ...local, filial: e.value })}
                                                    itemTemplate={(item) => (`${item.codigo} - ${item.nome}`)}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Conta Financeira *</label>
                                                <AutoComplete
                                                    minLength={3}
                                                    field={'descricao'}
                                                    suggestions={contas}
                                                    value={local?.conta}
                                                    completeMethod={buscarContas}
                                                    onChange={(e) => setLocal({ ...local, conta: e.value })}
                                                    itemTemplate={(item) => (`${item.conta} - ${item.descricao}`)}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={local.descricao}
                                                    onChange={(e) => setLocal({ ...local, descricao: e.target.value })}
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

export default withRouter(LocalFaturamento);