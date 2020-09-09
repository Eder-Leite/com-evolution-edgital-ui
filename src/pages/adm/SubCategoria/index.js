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

import { SchemaSubCategoria, empresa } from '../AdmModel';
const url = 'subCategoriasProduto';

function SubCategoria() {

    const [codigo, setCodigo] = useState('');
    const [descricao, setDescricao] = useState('');

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [categoria, setCategoria] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [planosReceita, setPlanosReceita] = useState([]);
    const [planosDespesa, setPlanosDespesa] = useState([]);
    const [subCategorias, setSubCategorias] = useState([]);
    const [subCategoria, setSubCategoria] = useState(new SchemaSubCategoria());

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | SubCategoria';
    }, []);

    useEffect(() => {
        buscarCategorias();
    }, []);

    useEffect(() => {
        buscarPlanos();
    }, []);

    async function buscarPlanos() {
        await Api({
            method: 'get',
            url: 'planosReceitaDespesa?resumo',
            params: {
                empresa,
                page: 0,
                size: 999999999,
            }
        }).then(resp => {

            let despesa = resp.data.content.filter((e) => e.tipoCarteira !== 'RECEITA');
            let receita = resp.data.content.filter((e) => e.tipoCarteira !== 'DESPESA');

            console.log(despesa, receita);

            despesa = despesa.map((e) => ({
                value: e.id,
                label: `${e.descricao} - ${e.descricaoGrupoReceitaDespesa} - ${e.descricaoCarteira} - ${e.tipoCarteira}`
            }));

            receita = receita.map((e) => ({
                value: e.id,
                label: `${e.descricao} - ${e.descricaoGrupoReceitaDespesa} - ${e.descricaoCarteira} - ${e.tipoCarteira}`
            }));

            setPlanosDespesa(despesa);
            setPlanosReceita(receita);
        })
            .catch(error => {
                console.log(error);
            });
    }

    async function buscarCategorias() {
        await Api({
            method: 'get',
            url: `categoriasProduto?resumo`,
            params: {
                empresa,
                page: 0,
                size: 999999999
            }
        }).then(resp => {
            const data = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.codigo} - ${e.descricao}`
            }));

            setCategorias(data);
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
            setSubCategoria(resp.data);
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
                codigo,
                descricao,
                empresa,
                categoria,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            setSubCategorias(resp.data.content);
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

        setSubCategoria({ ...subCategoria });

        if (subCategoria.id > 0) {
            await Api({
                method: 'put',
                url: `${url}/${subCategoria.id}`,
                data: JSON.stringify(subCategoria)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'SubCategoria editada com sucesso!');
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
                data: JSON.stringify(subCategoria)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'SubCategoria adicionada com sucesso!');
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
            if (subCategoria.codigo.length === 4 &&
                subCategoria.descricao.length >= 4 &&
                subCategoria.categoria.id) {
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
        setSubCategoria(new SchemaSubCategoria());
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

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de SubCategorias</div>;

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
                                            disabled={subCategorias.length === 0}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </Toolbar>

                                <div className='p-grid' style={{ marginTop: 5, flexDirection: 'row' }}>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código</label>
                                        <InputText
                                            value={codigo}
                                            maxLength={4}
                                            keyfilter={/[0-9]+$/}
                                            onChange={(e) => setCodigo(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-6'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Categoria</label>
                                        <Dropdown
                                            filter={true}
                                            showClear={true}
                                            value={categoria}
                                            options={categorias}
                                            filterBy='label,value'
                                            onChange={(e) => setCategoria(e.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-4'>
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
                                        header={header}
                                        footer={footer}
                                        onPage={onPage}
                                        paginator={true}
                                        responsive={true}
                                        value={subCategorias}
                                        style={{ marginTop: 10 }}
                                        totalRecords={totalRecords}
                                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='codigo' header='Código' style={{ width: '6em' }} />
                                        <Column field='descricao' header='Descrição' />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de SubCategoria</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={subCategoria.id}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Categoria *</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    options={categorias}
                                                    filterBy='label,value'
                                                    value={subCategoria.categoria.id}
                                                    disabled={subCategoria.id ? true : false}
                                                    onChange={(e) => setSubCategoria({ ...subCategoria, categoria: { id: e.value } })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código *</label>
                                                <InputText
                                                    maxLength={4}
                                                    keyfilter={/[0-9]+$/}
                                                    value={subCategoria.codigo}
                                                    readOnly={subCategoria.id ? true : false}
                                                    onChange={(e) => setSubCategoria({ ...subCategoria, codigo: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-10'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={subCategoria.descricao}
                                                    onChange={(e) => setSubCategoria({ ...subCategoria, descricao: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Plano de Receita para Venda</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    filterBy='label,value'
                                                    options={planosReceita}
                                                    value={subCategoria.planoReceitaDespesaVenda?.id}
                                                    onChange={(e) => setSubCategoria({ ...subCategoria, planoReceitaDespesaVenda: { id: e.value } })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Plano de Despesa para Compra</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    filterBy='label,value'
                                                    options={planosDespesa}
                                                    value={subCategoria.planoReceitaDespesaCompra?.id}
                                                    onChange={(e) => setSubCategoria({ ...subCategoria, planoReceitaDespesaCompra: { id: e.value } })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Plano de Receita para Devolução de Compra</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    filterBy='label,value'
                                                    options={planosReceita}
                                                    value={subCategoria.planoReceitaDespesaDevolucaoCompra?.id}
                                                    onChange={(e) => setSubCategoria({ ...subCategoria, planoReceitaDespesaDevolucaoCompra: { id: e.value } })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Plano de Despesa para Devolução de Venda</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    filterBy='label,value'
                                                    options={planosDespesa}
                                                    value={subCategoria.planoReceitaDespesaDevolucaoVenda?.id}
                                                    onChange={(e) => setSubCategoria({ ...subCategoria, planoReceitaDespesaDevolucaoVenda: { id: e.value } })}
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

export default withRouter(SubCategoria);