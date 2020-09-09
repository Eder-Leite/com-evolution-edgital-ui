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
import InputNumber from '../../../components/inputNumber';
import Loading from '../../../components/loading';
import Toasty from '../../../components/toasty';
import Api from '../../../services/Api';

import { SchemaVeiculo, empresa } from '../CadModel';
const url = 'veiculos';

const tiposStatus = [
    { label: 'ATIVO', value: 'ATIVO' },
    { label: 'INATIVO', value: 'INATIVO' }
];

const proprietarios = [
    { label: 'PRÓPRIO', value: 'PRÓPRIO' },
    { label: 'TERCEIRO', value: 'TERCEIRO' }
];

const tiposVeiculo = [
    { label: 'REBOQUE', value: 'REBOQUE' },
    { label: 'VEÍCULO', value: 'VEÍCULO' }
];

const tiposRodo = [
    { label: 'TRUCK', value: '01' },
    { label: 'TOCO', value: '02' },
    { label: 'CAVALO MECÂNICO', value: '03' },
    { label: 'VAN', value: '04' },
    { label: 'UTILITÁRIOS', value: '05' },
    { label: 'OUTROS', value: '06' }
];

const tiposCarroceria = [
    { label: 'NÃO APLICÁVEL', value: '00' },
    { label: 'ABERTA', value: '01' },
    { label: 'FECHADA/BAÚ', value: '02' },
    { label: 'GRANELERA', value: '03' },
    { label: 'PORTA CONTAINER', value: '04' },
    { label: 'SIDER', value: '05' },
];

function Veiculo() {

    const [placa, setPlaca] = useState('');
    const [status, setStatus] = useState('');
    const [nomeCliente, setNomeCliente] = useState('');

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [clientes, setClientes] = useState([]);
    const [veiculos, setVeiculos] = useState([]);
    const [veiculo, setVeiculo] = useState(new SchemaVeiculo());

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | Veículo';
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
            setVeiculo(resp.data);
        })
            .catch(error => {
                Loading.onHide();
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            });
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

    async function pesquisar(eventPage = 0, eventRows = 0, eventFirst = 0) {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                placa,
                status,
                empresa,
                nomeCliente,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            setVeiculos(resp.data.content);
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

        if (veiculo.id > 0) {
            await Api({
                method: 'put',
                url: `${url}/${veiculo.id}`,
                data: JSON.stringify(veiculo)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Veículo editado com sucesso!');
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
                data: JSON.stringify(veiculo)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Veículo adicionado com sucesso!');
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
            if (veiculo.cadastro?.id &&
                veiculo.placa.length === 8 &&
                veiculo.descricao.length >= 4) {
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
        setVeiculo(new SchemaVeiculo());
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

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Veículos</div>;

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
                                            disabled={veiculos.length === 0}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </Toolbar>

                                <div className='p-grid' style={{ marginTop: 5, flexDirection: 'row' }}>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Placa</label>
                                        <InputText
                                            value={placa}
                                            maxLength={8}
                                            onChange={(e) => setPlaca(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-8'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cliente</label>
                                        <InputText
                                            maxLength={255}
                                            value={nomeCliente}
                                            onChange={(e) => setNomeCliente(e.target.value)}
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
                                        value={veiculos}
                                        paginator={true}
                                        responsive={true}
                                        style={{ marginTop: 10 }}
                                        totalRecords={totalRecords}
                                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='placa' header='Placa' style={{ width: '8em' }} />
                                        <Column field='nomeRazao' header='Cliente' />
                                        <Column field='descricao' header='Descrição' />
                                        <Column field='tipo' header='Tipo' style={{ width: '8em' }} />
                                        <Column field='status' header='Status' style={{ width: '6em' }} />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Veículo</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={veiculo.id}
                                                />
                                            </div>
                                            <div style={{ padding: 0 }} className='p-md-10'></div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Clente *</label>
                                                <AutoComplete
                                                    minLength={3}
                                                    field={'nomeRazao'}
                                                    suggestions={clientes}
                                                    value={veiculo?.cadastro}
                                                    completeMethod={buscarClientes}
                                                    onChange={(e) => setVeiculo({ ...veiculo, cadastro: e.value })}
                                                    itemTemplate={(item) => (`${item.nomeRazao} - ${item.cnpjCpf}`)}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={veiculo.descricao}
                                                    onChange={(e) => setVeiculo({ ...veiculo, descricao: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Proprietário *</label>
                                                <Dropdown
                                                    options={proprietarios}
                                                    filterBy='label,value'
                                                    value={veiculo.proprietario}
                                                    onChange={(e) => setVeiculo({ ...veiculo, proprietario: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo de Veículo *</label>
                                                <Dropdown
                                                    options={tiposVeiculo}
                                                    filterBy='label,value'
                                                    value={veiculo.tipoVeiculo}
                                                    onChange={(e) => setVeiculo({ ...veiculo, tipoVeiculo: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo de Rodo *</label>
                                                <Dropdown
                                                    options={tiposRodo}
                                                    filterBy='label,value'
                                                    value={veiculo.tipoRodo}
                                                    onChange={(e) => setVeiculo({ ...veiculo, tipoRodo: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo de Carroceria *</label>
                                                <Dropdown
                                                    filterBy='label,value'
                                                    options={tiposCarroceria}
                                                    value={veiculo.tipoCarroceria}
                                                    onChange={(e) => setVeiculo({ ...veiculo, tipoCarroceria: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Placa *</label>
                                                <InputText
                                                    maxLength={8}
                                                    value={veiculo.placa}
                                                    placeholder={'ex: AAA-0000'}
                                                    onChange={(e) => setVeiculo({ ...veiculo, placa: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código ANTT</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={veiculo.codigoANTT}
                                                    onChange={(e) => setVeiculo({ ...veiculo, codigoANTT: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tara *</label>
                                                <InputNumber
                                                    min={0}
                                                    mode='decimal'
                                                    minFractionDigits={0}
                                                    maxFractionDigits={0}
                                                    value={veiculo.tara}
                                                    onChange={(e) => { setVeiculo({ ...veiculo, tara: e.value }) }}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status *</label>
                                                <Dropdown
                                                    filterBy='label,value'
                                                    options={tiposStatus}
                                                    value={veiculo.status}
                                                    onChange={(e) => setVeiculo({ ...veiculo, status: e.value })}
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

export default withRouter(Veiculo);