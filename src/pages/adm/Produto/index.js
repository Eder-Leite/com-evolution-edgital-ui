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
// import { InputNumber } from 'primereact/inputnumber';
import { TabView, TabPanel } from 'primereact/tabview';
import { AutoComplete } from 'primereact/autocomplete';

import confirmService from '../../../services/confirmService';
import InputNumber from '../../../components/inputNumber';
import Loading from '../../../components/loading';
import Toasty from '../../../components/toasty';

import { temQualquerPermissao } from '../../../services/Api';
import Api from '../../../services/Api';

import { SchemaProduto, empresa } from '../AdmModel';
const url = 'produtos';

const listaStatus = [
    { label: 'ATIVO', value: 'ATIVO' },
    { label: 'INATIVO', value: 'INATIVO' }
];

const check = [
    { label: 'SIM', value: 'SIM' },
    { label: 'NÃO', value: 'NÃO' }
];

function Produto() {

    const [origens, setOrigens] = useState([]);
    const [ncms, setNcms] = useState([]);
    const [cests, setCests] = useState([]);
    const [ipis, setIpis] = useState([]);
    const [anps, setAnps] = useState([]);

    const [status, setStatus] = useState('');
    const [codigo, setCodigo] = useState('');
    const [descricao, setDescricao] = useState('');

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [categoriaFiltro, setCategoriaFiltro] = useState(null);
    const [subCategoriaFiltro, setSubCategoriaFiltro] = useState(null);

    const [unidades, setUnidades] = useState([]);
    const [categoria, setCategoria] = useState(null);
    const [subCategoria, setSubCategoria] = useState(null);
    const [produtos, setProdutos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [subCategoriasFiltro, setSubCategoriasFiltro] = useState([]);
    const [subCategorias, setSubCategorias] = useState([]);

    const [produto, setProduto] = useState(new SchemaProduto());

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | Produto';
    }, []);

    useEffect(() => {
        buscarIpis();
        buscarOrigens();
        buscarCategorias();
    }, []);

    async function pesquisar(eventPage = 0, eventRows = 0, eventFirst = 0) {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                status,
                codigo,
                empresa,
                descricao,
                categoria,
                subCategoria,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            setProdutos(resp.data.content);
            setTotalRecords(resp.data.totalElements);
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            });
    }

    async function buscarOrigens() {
        await Api({
            method: 'get',
            url: `origensFiscal`,
        }).then(resp => {
            const data = resp.data.map((e) => ({
                value: e.id,
                label: `${e.codigo} - ${e.descricao}`
            }));
            setOrigens(data);
        })
            .catch(error => {
                console.log(error);
            });
    }

    async function buscarNcms(event) {
        await Api({
            method: 'get',
            url: `aliquotasNCM?resumo`,
            params: {
                page: 0,
                size: 999999999,
                codigo: event.query.toLowerCase()
            },
        }).then(resp => {
            const data = resp.data.content;
            setNcms(data);
        })
            .catch(error => {
                console.log(error);
            });
    }

    async function buscarIpis() {
        await Api({
            method: 'get',
            url: `aliquotasIPI`,
        }).then(resp => {
            const data = resp.data.map((e) => ({
                value: e.id,
                label: `${e.percentual} - ${e.descricao}`
            }));

            setIpis(data);
        })
            .catch(error => {
                console.log(error);
            });
    }

    async function buscarCests(event) {
        await Api({
            method: 'get',
            url: `codigosCEST?resumo`,
            params: {
                page: 0,
                size: 999999999,
                codigo: event.query.toLowerCase()
            },
        }).then(resp => {
            const data = resp.data.content;
            setCests(data);
        })
            .catch(error => {
                console.log(error);
            });
    }

    async function buscarAnps(event) {
        await Api({
            method: 'get',
            url: `codigosANP?resumo`,
            params: {
                page: 0,
                size: 999999999,
                codigo: event.query.toLowerCase()
            },
        }).then(resp => {
            const data = resp.data.content;
            setAnps(data);
        })
            .catch(error => {
                console.log(error);
            });
    }

    async function buscarUnidades(event) {
        await Api({
            method: 'get',
            url: `unidadesProduto?resumo`,
            params: {
                page: 0,
                size: 999999999,
                descricao: event.query.toLowerCase()
            },
        }).then(resp => {
            const data = resp.data.content;
            setUnidades(data);
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
                page: 0,
                empresa,
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

    async function buscarSubCategorias(index, categoria) {
        await Api({
            method: 'get',
            url: `subCategoriasProduto?resumo`,
            params: {
                page: 0,
                empresa,
                categoria,
                size: 999999999,
            }
        }).then(resp => {
            const data = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.codigo} - ${e.descricao}`
            }));

            if (index === 0) {
                setSubCategoriasFiltro(data);
            } else {
                setSubCategorias(data);
            }

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
            setProduto(resp.data);
            buscarSubCategorias(1);
        })
            .catch(error => {
                Loading.onHide();
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

        if (produto.id > 0) {
            await Api({
                method: 'put',
                url: `${url}/${produto.id}`,
                data: JSON.stringify(produto)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Produto editado com sucesso!');
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
                data: JSON.stringify(produto)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Produto adicionada com sucesso!');
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
            if (produto?.subCategoria?.id &&
                produto?.subCategoria?.categoria?.id &&
                produto?.descricao.length >= 4 &&
                produto?.unidade?.id &&
                produto?.origem?.id) {
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
        setProduto(new SchemaProduto());
    }

    function cancelar() {
        setActiveIndex(0);
    }

    function exportarXLS() {
        Toasty.warn('Atenção!', 'Falta implementação!');
    }

    function onChangeCategoriaFiltro(value) {
        setCategoria(value);
        setSubCategoriaFiltro(null);
        buscarSubCategorias(0, value);
    }

    function onChangeCategoria(value) {
        buscarSubCategorias(1, value);
        setProduto({ ...produto, subCategoria: { id: null, categoria: { id: value } } });
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

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Produtos</div>;

    const footer = 'Quantidade de registros ' + totalRecords;

    return (
        <div className='p-fluid'>
            <div className='p-col-12'>
                <div className='p-grid'>
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
                                            disabled={produtos.length === 0}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </Toolbar>

                                <div className='p-grid' style={{ marginTop: 5, flexDirection: 'row' }}>
                                    <div className='p-col-12 p-md-6'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Categoria</label>
                                        <Dropdown
                                            filter={true}
                                            showClear={true}
                                            value={categoria}
                                            options={categorias}
                                            filterBy='label,value'
                                            onChange={(e) => onChangeCategoriaFiltro(e.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-6'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>SubCategoria</label>
                                        <Dropdown
                                            filter={true}
                                            showClear={true}
                                            value={subCategoria}
                                            filterBy='label,value'
                                            options={subCategoriasFiltro}
                                            onChange={(e) => setSubCategoria(e.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código</label>
                                        <InputText
                                            value={codigo}
                                            maxLength={10}
                                            keyfilter={/[0-9]+$/}
                                            onChange={(e) => setCodigo(e.target.value)}
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
                                    <div className='p-col-12 p-md-8'>
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
                                        value={produtos}
                                        paginator={true}
                                        responsive={true}
                                        style={{ marginTop: 10 }}
                                        totalRecords={totalRecords}
                                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='codigo' header='Código' style={{ width: '7em' }} />
                                        <Column field='descricaoCategoria' header='Categoria' />
                                        <Column field='descricaoSubCategoria' header='SubCategoria' />
                                        <Column field='descricao' header='Descrição' />
                                        <Column field='status' header='Status' style={{ width: '6em' }} />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>
                            </TabPanel>
                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Produto</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={produto.id}
                                                />
                                            </div>
                                            <div style={{ padding: 0 }} className='p-md-10'></div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={produto.codigo}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Categoria *</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    options={categorias}
                                                    filterBy='label,value'
                                                    disabled={produto.id ? true : false}
                                                    value={produto.subCategoria.categoria.id}
                                                    onChange={(e) => onChangeCategoria(e.value)}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>SubCategoria *</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    filterBy='label,value'
                                                    options={subCategorias}
                                                    value={produto.subCategoria.id}
                                                    disabled={produto.id ? true : false}
                                                    onChange={(e) => setProduto({ ...produto, subCategoria: { ...produto.subCategoria, id: e.value } })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={produto.descricao}
                                                    onChange={(e) => setProduto({ ...produto, descricao: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-6'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Unidade *</label>
                                                <AutoComplete
                                                    minLength={1}
                                                    field={'descricao'}
                                                    suggestions={unidades}
                                                    value={produto?.unidade}
                                                    completeMethod={buscarUnidades}
                                                    itemTemplate={(item) => (`${item.descricao} - ${item.sigla}`)}
                                                    onChange={(e) => setProduto({ ...produto, unidade: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-6'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Origem *</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    options={origens}
                                                    filterBy='label,value'
                                                    value={produto?.origem?.id}
                                                    onChange={(e) => setProduto({ ...produto, origem: { id: e.value } })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor Custo *</label>
                                                <InputNumber
                                                    min={0}
                                                    mode='decimal'
                                                    minFractionDigits={6}
                                                    maxFractionDigits={6}
                                                    value={produto.valorCusto}
                                                    onChange={(e) => setProduto({ ...produto, valorCusto: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor Venda *</label>
                                                <InputNumber
                                                    min={0}
                                                    mode='decimal'
                                                    minFractionDigits={2}
                                                    maxFractionDigits={2}
                                                    value={produto.valorVenda}
                                                    onChange={(e) => { setProduto({ ...produto, valorVenda: e.value }) }}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código Barra</label>
                                                <InputText
                                                    maxLength={15}
                                                    value={produto.codigoBarra}
                                                    onChange={(e) => setProduto({ ...produto, codigoBarra: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status *</label>
                                                <Dropdown
                                                    filter={true}
                                                    filterBy='label,value'
                                                    options={listaStatus}
                                                    value={produto.status}
                                                    onChange={(e) => setProduto({ ...produto, status: e.value })}
                                                />
                                            </div>

                                            {temQualquerPermissao(['ROLE_FISCAL', 'ROLE_DESENVOLVEDOR']) ? (
                                                <div className='p-col-12'>
                                                    <h2 style={{ marginTop: 10, marginBottom: 20 }}>Informação Fiscal</h2>
                                                    <div className='p-grid'>
                                                        <div className='p-col-12 p-md-12'>
                                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Alíquota NCM</label>
                                                            <AutoComplete
                                                                minLength={3}
                                                                field={'codigo'}
                                                                suggestions={ncms}
                                                                completeMethod={buscarNcms}
                                                                value={produto?.aliquotaNCM}
                                                                itemTemplate={(item) => (`${item.codigo} - ${item.descricao}`)}
                                                                onChange={(e) => setProduto({ ...produto, aliquotaNCM: e.value })}
                                                            />
                                                        </div>
                                                        <div className='p-col-12 p-md-12'>
                                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código CEST</label>
                                                            <AutoComplete
                                                                minLength={3}
                                                                field={'codigo'}
                                                                suggestions={cests}
                                                                value={produto?.codigoCEST}
                                                                completeMethod={buscarCests}
                                                                itemTemplate={(item) => (`${item.codigo} - ${item.descricao}`)}
                                                                onChange={(e) => setProduto({ ...produto, codigoCEST: e.value })}
                                                            />
                                                        </div>
                                                        <div className='p-col-12 p-md-12'>
                                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Alíquota IPI</label>
                                                            <Dropdown
                                                                filter={true}
                                                                options={ipis}
                                                                showClear={true}
                                                                filterBy='label,value'
                                                                value={produto?.aliquotaIPI?.id}
                                                                onChange={(e) => setProduto({ ...produto, aliquotaIPI: { id: e.value } })}
                                                            />
                                                        </div>
                                                        <div className='p-col-12 p-md-12'>
                                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código ANP</label>
                                                            <AutoComplete
                                                                minLength={2}
                                                                field={'codigo'}
                                                                suggestions={anps}
                                                                value={produto?.codigoANP}
                                                                completeMethod={buscarAnps}
                                                                itemTemplate={(item) => (`${item.codigo} - ${item.descricao}`)}
                                                                onChange={(e) => setProduto({ ...produto, codigoANP: e.value })}
                                                            />
                                                        </div>
                                                        <div className='p-col-12 p-md-3'>
                                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Calcula FCP *</label>
                                                            <Dropdown
                                                                filter={true}
                                                                options={check}
                                                                filterBy='label,value'
                                                                value={produto.calculaFCP}
                                                                onChange={(e) => setProduto({ ...produto, calculaFCP: e.value })}
                                                            />
                                                        </div>
                                                        <div className='p-col-12 p-md-3'>
                                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Combustível *</label>
                                                            <Dropdown
                                                                filter={true}
                                                                options={check}
                                                                filterBy='label,value'
                                                                value={produto.combustivel}
                                                                onChange={(e) => setProduto({ ...produto, combustivel: e.value })}
                                                            />
                                                        </div>
                                                        <div className='p-col-12 p-md-3'>
                                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Encerrante *</label>
                                                            <Dropdown
                                                                filter={true}
                                                                options={check}
                                                                filterBy='label,value'
                                                                value={produto.encerrante}
                                                                onChange={(e) => setProduto({ ...produto, encerrante: e.value })}
                                                            />
                                                        </div>
                                                        <div className='p-col-12 p-md-3'>
                                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Importado *</label>
                                                            <Dropdown
                                                                filter={true}
                                                                options={check}
                                                                filterBy='label,value'
                                                                value={produto.importado}
                                                                onChange={(e) => setProduto({ ...produto, importado: e.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (null)}
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
        </div>
    );
}

export default withRouter(Produto);