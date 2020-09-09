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
import { InputMask } from 'primereact/inputmask';
import { AutoComplete } from 'primereact/autocomplete';
import { TabView, TabPanel } from 'primereact/tabview';

import confirmService from '../../../services/confirmService';
import Loading from '../../../components/loading';
import Toasty from '../../../components/toasty';
import Api from '../../../services/Api';

import { SchemaMotorista, empresa } from '../CadModel';
const url = 'motoristas';

function Motorista() {

    const [cpf, setCpf] = useState('');
    const [nome, setNome] = useState('');
    const [nomeCliente, setNomeCliente] = useState('');

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [clientes, setClientes] = useState([]);
    const [motoristas, setMotoristas] = useState([]);
    const [motorista, setMotorista] = useState(new SchemaMotorista());

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | Motorista';
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
            setMotorista(resp.data);
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
                cpf,
                nome,
                empresa,
                nomeCliente,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            setMotoristas(resp.data.content);
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

        if (motorista.id > 0) {
            await Api({
                method: 'put',
                url: `${url}/${motorista.id}`,
                data: JSON.stringify(motorista)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Motorista editado com sucesso!');
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
                data: JSON.stringify(motorista)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Motorista adicionado com sucesso!');
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
            if (motorista.cpf &&
                motorista.cadastro?.id &&
                motorista.nome.length >= 4) {
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
        setMotorista(new SchemaMotorista());
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

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Motoristas</div>;

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
                                            disabled={motorista.length === 0}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </Toolbar>

                                <div className='p-grid' style={{ marginTop: 5, flexDirection: 'row' }}>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>CPF</label>
                                        <InputMask
                                            value={cpf}
                                            keyfilter={/[0-9]+$/}
                                            mask={'999.999.999-99'}
                                            placeholder='ex: 999.999.999-99'
                                            onChange={(e) => setCpf(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-5'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cliente</label>
                                        <InputText
                                            maxLength={255}
                                            value={nomeCliente}
                                            onChange={(e) => setNomeCliente(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-5'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Motorista</label>
                                        <InputText
                                            value={nome}
                                            maxLength={255}
                                            onChange={(e) => setNome(e.target.value)}
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
                                        value={motoristas}
                                        style={{ marginTop: 10 }}
                                        totalRecords={totalRecords}
                                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='nomeRazao' header='Cliente' />
                                        <Column field='nome' header='Motorista' />
                                        <Column field='cpf' header='CPF' style={{ width: '10em' }} />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Motorista</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={motorista.id}
                                                />
                                            </div>
                                            <div style={{ padding: 0 }} className='p-md-10'></div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Clente *</label>
                                                <AutoComplete
                                                    minLength={3}
                                                    field={'nomeRazao'}
                                                    suggestions={clientes}
                                                    value={motorista?.cadastro}
                                                    completeMethod={buscarClientes}
                                                    onChange={(e) => setMotorista({ ...motorista, cadastro: e.value })}
                                                    itemTemplate={(item) => (`${item.nomeRazao} - ${item.cnpjCpf}`)}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={motorista.nome}
                                                    onChange={(e) => setMotorista({ ...motorista, nome: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>CPF *</label>
                                                <InputMask
                                                    keyfilter={/[0-9]+$/}
                                                    value={motorista.cpf}
                                                    mask={'999.999.999-99'}
                                                    placeholder='ex: 999.999.999-99'
                                                    onChange={(e) => setMotorista({ ...motorista, cpf: e.target.value })}
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

export default withRouter(Motorista);