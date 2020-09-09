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

import confirmService from '../../../services/confirmService';
import Loading from '../../../components/loading';
import Toasty from '../../../components/toasty';
import Api from '../../../services/Api';

import { SchemaFinalidadeFiscal, empresa } from '../LivModel';
const url = 'finalidadesFiscal';

const tiposStatus = [
    { label: 'ATIVO', value: 'ATIVO' },
    { label: 'INATIVO', value: 'INATIVO' }
];

const tiposMovimento = [
    { label: 'ENTRADA', value: 'ENTRADA' },
    { label: 'SAÍDA', value: 'SAÍDA' }
];

const indicadoresPresenca = [
    { value: '0', label: 'NÃO SE APLICA (POR EXEMPLO, NOTA FISCAL COMPLEMENTAR OU DE AJUSTE)' },
    { value: '1', label: 'OPERAÇÃO PRESENCIAL' },
    { value: '2', label: 'OPERAÇÃO NÃO PRESENCIAL, PELA INTERNET' },
    { value: '3', label: 'OPERAÇÃO NÃO PRESENCIAL, TELEATENDIMENTO' },
    { value: '4', label: 'NFC - E EM OPERAÇÃO COM ENTREGA A DOMICÍLIO' },
    { value: '9', label: 'OPERAÇÃO NÃO PRESENCIAL, OUTROS' }
];

const finalidadesEmissao = [
    { value: '1', label: 'NF-E NORMAL' },
    { value: '2', label: 'NF-E COMPLEMENTAR' },
    { value: '3', label: 'NF-E DE AJUSTE' },
    { value: '4', label: 'DEVOLUÇÃO DE MERCADORIA' }
];

const modalidadesFrete = [
    { value: '0', label: 'CONTRATAÇÃO DO FRETE POR CONTA DO REMETENTE (CIF)' },
    { value: '1', label: 'CONTRATAÇÃO DO FRETE POR CONTA DO DESTINATÁRIO (FOB)' },
    { value: '2', label: 'CONTRATAÇÃO DO FRETE POR CONTA DE TERCEIROS' },
    { value: '3', label: 'TRANSPORTE PRÓPRIO POR CONTA DO REMETENTE' },
    { value: '4', label: 'TRANSPORTE PRÓPRIO POR CONTA DO DESTINATÁRIO' },
    { value: '9', label: 'SEM OCORRÊNCIA DE TRANSPORTE' }
];

function FinalidadeFiscal() {

    const [status, setStatus] = useState('');
    const [descricao, setDescricao] = useState('');
    const [tipoMovimento, setTipoMovimento] = useState('');

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [operacoes, setOperacoes] = useState([]);
    const [finalidades, setFinalidades] = useState([]);
    const [finalidade, setFinalidade] = useState(new SchemaFinalidadeFiscal());

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | Finalidade Fiscal';
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
            setFinalidade(resp.data);
        })
            .catch(error => {
                Loading.onHide();
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            });
    }

    async function buscarOperacoes(event) {
        await Api({
            method: 'get',
            url: `operacoesEstoque?resumo`,
            params: {
                page: 0,
                empresa,
                size: 999999999,
                descricao: event.query.toLowerCase()
            },
        }).then(resp => {
            const data = resp.data.content.map((e) => (
                { id: e.id, descricao: e.descricao, tipo: e.tipo }
            ));
            setOperacoes(data);
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
                status,
                empresa,
                descricao,
                tipoMovimento,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            setFinalidades(resp.data.content);
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

        if (finalidade.id > 0) {
            await Api({
                method: 'put',
                url: `${url}/${finalidade.id}`,
                data: JSON.stringify(finalidade)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Finalidade Fiscal editada com sucesso!');
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
                data: JSON.stringify(finalidade)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Finalidade Fiscal adicionado com sucesso!');
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
            if (finalidade.operacaoEstoque?.id &&
                finalidade.descricao.length >= 4 &&
                finalidade.finalidadeEmissao &&
                finalidade.indicadorPresenca &&
                finalidade.modalidadeFrete &&
                finalidade.status) {
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
        setFinalidade(new SchemaFinalidadeFiscal());
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

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Finalidades Fiscal</div>;

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
                                            disabled={finalidades.length === 0}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </Toolbar>

                                <div className='p-grid' style={{ marginTop: 5, flexDirection: 'row' }}>
                                    <div className='p-col-12 p-md-8'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição</label>
                                        <InputText
                                            maxLength={255}
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo Movimento</label>
                                        <Dropdown
                                            filter={true}
                                            showClear={true}
                                            value={tipoMovimento}
                                            filterBy='label,value'
                                            options={tiposMovimento}
                                            onChange={(e) => setTipoMovimento(e.value)}
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
                                        value={finalidades}
                                        style={{ marginTop: 10 }}
                                        totalRecords={totalRecords}
                                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='tipo' header='Tipo Movimento' style={{ width: '10em' }} />
                                        <Column field='descricao' header='Descrição' />
                                        <Column field='status' header='Status' style={{ width: '6em' }} />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Finalidade Fiscal</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={finalidade.id}
                                                />
                                            </div>
                                            <div style={{ padding: 0 }} className='p-md-10'></div>
                                            <div className='p-col-12 p-md-10'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Operação Estoque *</label>
                                                <AutoComplete
                                                    minLength={3}
                                                    field={'descricao'}
                                                    suggestions={operacoes}
                                                    completeMethod={buscarOperacoes}
                                                    value={finalidade?.operacaoEstoque}
                                                    itemTemplate={(item) => (`${item.descricao} - ${item.tipo}`)}
                                                    onChange={(e) => setFinalidade({ ...finalidade, operacaoEstoque: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo Movimento *</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={finalidade?.operacaoEstoque?.tipo}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={finalidade.descricao}
                                                    onChange={(e) => setFinalidade({ ...finalidade, descricao: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-8'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Indicador Presença *</label>
                                                <Dropdown
                                                    filter={true}
                                                    filterBy='label,value'
                                                    options={indicadoresPresenca}
                                                    value={finalidade.indicadorPresenca}
                                                    onChange={(e) => setFinalidade({ ...finalidade, indicadorPresenca: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Finalidade Emissão</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    filterBy='label,value'
                                                    options={finalidadesEmissao}
                                                    value={finalidade.finalidadeEmissao}
                                                    onChange={(e) => setFinalidade({ ...finalidade, finalidadeEmissao: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-8'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Modalidade Frete</label>
                                                <Dropdown
                                                    filter={true}
                                                    showClear={true}
                                                    filterBy='label,value'
                                                    options={modalidadesFrete}
                                                    value={finalidade.modalidadeFrete}
                                                    onChange={(e) => setFinalidade({ ...finalidade, modalidadeFrete: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={tiposStatus}
                                                    filterBy='label,value'
                                                    value={finalidade.status}
                                                    onChange={(e) => setFinalidade({ ...finalidade, status: e.value })}
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

export default withRouter(FinalidadeFiscal);