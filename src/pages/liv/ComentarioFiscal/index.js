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

import { SchemaComentarioFiscal } from '../LivModel';
const url = 'comentariosFiscal';

const tiposStatus = [
    { label: 'ATIVO', value: 'ATIVO' },
    { label: 'INATIVO', value: 'INATIVO' }
];

const check = [
    { label: 'SIM', value: 'SIM' },
    { label: 'NÃO', value: 'NÃO' }
];

function ComentarioFiscal() {

    const [id, setId] = useState('');
    const [status, setStatus] = useState('');
    const [descricao1, setDescricao1] = useState('');

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [comentarios, setComentarios] = useState([]);
    const [comentario, setComentario] = useState(new SchemaComentarioFiscal());

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | Comentário Fiscal';
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
            setComentario(resp.data);
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
                status,
                descricao1,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            setComentarios(resp.data.content);
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

        if (comentario.id > 0) {
            await Api({
                method: 'put',
                url: `${url}/${comentario.id}`,
                data: JSON.stringify(comentario)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Comentário Fiscal editado com sucesso!');
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
                data: JSON.stringify(comentario)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Comentário Fiscal adicionado com sucesso!');
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
            if (comentario.descricao1) {
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
        setComentario(new SchemaComentarioFiscal());
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

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Comentários Fiscal</div>;

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
                                            disabled={comentarios.length === 0}
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
                                    <div className='p-col-12 p-md-8'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição 01</label>
                                        <InputText
                                            value={descricao1}
                                            maxLength={255}
                                            onChange={(e) => setDescricao1(e.target.value)}
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
                                        value={comentarios}
                                        style={{ marginTop: 10 }}
                                        totalRecords={totalRecords}
                                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='descricao1' header='Descrição' />
                                        <Column field='fiscal' header='Fiscal' style={{ width: '6em' }} />
                                        <Column field='status' header='Status' style={{ width: '6em' }} />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Comentário Fiscal</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={comentario.id}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição 01 *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={comentario.descricao1}
                                                    onChange={(e) => setComentario({ ...comentario, descricao1: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição 02</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={comentario.descricao2}
                                                    onChange={(e) => setComentario({ ...comentario, descricao2: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Diferimento *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={check}
                                                    filterBy='label,value'
                                                    value={comentario.diferimento}
                                                    onChange={(e) => setComentario({ ...comentario, diferimento: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Suspenso *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={check}
                                                    filterBy='label,value'
                                                    value={comentario.suspenso}
                                                    onChange={(e) => setComentario({ ...comentario, suspenso: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Isento *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={check}
                                                    filterBy='label,value'
                                                    value={comentario.isento}
                                                    onChange={(e) => setComentario({ ...comentario, isento: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Base Calculo Reduzida *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={check}
                                                    filterBy='label,value'
                                                    value={comentario.baseCalculoReduzida}
                                                    onChange={(e) => setComentario({ ...comentario, baseCalculoReduzida: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>IPI *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={check}
                                                    filterBy='label,value'
                                                    value={comentario.ipi}
                                                    onChange={(e) => setComentario({ ...comentario, ipi: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Fiscal *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={check}
                                                    filterBy='label,value'
                                                    value={comentario.fiscal}
                                                    onChange={(e) => setComentario({ ...comentario, fiscal: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={tiposStatus}
                                                    filterBy='label,value'
                                                    value={comentario.status}
                                                    onChange={(e) => setComentario({ ...comentario, status: e.value })}
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

export default withRouter(ComentarioFiscal);