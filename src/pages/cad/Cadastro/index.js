/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { withRouter } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { DataTable } from 'primereact/datatable';
import { AutoComplete } from 'primereact/autocomplete';
import { TabView, TabPanel } from 'primereact/tabview';

import confirmService from '../../../services/confirmService';
import InputNumber from '../../../components/inputNumber';
import Input from '../../../components/inputMask';
import Loading from '../../../components/loading';
import Toasty from '../../../components/toasty';
import Api from '../../../services/Api';

import { SchemaCadastro, SchemaEndereco, empresa } from '../CadModel';
const url = 'cadastros';

const listaTipo = [
    { label: 'CLIENTE', value: 'CLIENTE' },
    { label: 'FILIAL', value: 'FILIAL' },
    { label: 'FORNECEDOR', value: 'FORNECEDOR' },
    { label: 'FUNCIONÁIO', value: 'FUNCIONÁIO' },
    { label: 'MATRIZ', value: 'MATRIZ' }
];

const tipoEndereco = [
    { label: 'NORMAL', value: 'NORMAL' },
    { label: 'PRINCIPAL', value: 'PRINCIPAL' }
];

const listaStatus = [
    { label: 'ATIVO', value: 'ATIVO' },
    { label: 'INATIVO', value: 'INATIVO' }
];

const listaTipoPessoa = [
    { label: 'FÍSICA', value: 'FÍSICA' },
    { label: 'JURÍDICA', value: 'JURÍDICA' }
];

function Cadastro() {
    const [isVisible, setIsVisible] = useState(false);

    const [nome, setNome] = useState('');
    const [status, setStatus] = useState('');
    const [cnpjCpf, setCnpjCpf] = useState('');

    const [cadastros, setCadastros] = useState([]);
    const [cadastro, setCadastro] = useState(new SchemaCadastro());

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [index, setIndex] = useState(0);
    const [cidades, setCidades] = useState([]);
    const [endereco, setEndereco] = useState(new SchemaEndereco());
    const [activeIndexEndereco, setActiveIndexEndereco] = useState(0);

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | Cadastro de Cliente/Fornecedor';
    }, []);

    async function buscarCidades(event) {
        await Api({
            method: 'get',
            url: `cidades?resumo`,
            params: {
                page: 0,
                size: 99,
                nome: event.query.toLowerCase()
            },
        }).then(resp => {
            const data = resp.data.content.map((e) => ({
                id: e.id,
                nome: e.nomeCidade,
                estado: {
                    id: e.estado,
                    nome: e.nomeEstado,
                    sigla: e.siglaEstado
                }
            }));
            setCidades(data);
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

    async function pesquisar(eventPage = 0, eventRows = 0, eventFirst = 0) {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                nome,
                status,
                cnpjCpf: cnpjCpf.length === 0 ? null : cnpjCpf,
                empresa,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            setCadastros(resp.data.content);
            setTotalRecords(resp.data.totalElements);
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            })
    }

    async function buscarPorId(value) {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}/${value}`
        }).then(resp => {
            Loading.onHide();
            const { enderecos } = resp.data;
            const data = enderecos.map((item) => item.cidade) || [];
            setCidades(data);
            setActiveIndex(1);
            setCadastro(resp.data);
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            })
    }

    async function salvar() {
        Loading.onShow();

        if (cadastro.id > 0) {
            await Api({
                method: 'put',
                url: `${url}/${cadastro.id}`,
                data: JSON.stringify(cadastro)
            }).then(resp => {
                Loading.onHide()
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Cadastro editado com sucesso!');
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
                data: JSON.stringify(cadastro)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Cadastro adicionado com sucesso!');
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
        setCadastro(new SchemaCadastro());
    }

    function cancelar() {
        setActiveIndex(0);
    }

    async function confirmacaoExcluirEndereco(value) {
        await confirmService.show({
            message: `Deseja realmente excluír esse registro (${value.descricao}) ?`
        }).then(
            (res) => {
                if (res) {
                    excluirEndereco(value);
                }
            }
        ).catch(error => {
            console.log(error)
        });
    }

    function excluirEndereco(value) {
        try {
            let cadEndereco = cadastro.enderecos;
            cadEndereco.splice(cadEndereco.indexOf(value), 1);

            let position = cadEndereco.indexOf(value);
            cadEndereco = cadEndereco.filter((value, i) => i !== position);
            setCadastro({ ...cadastro, enderecos: cadEndereco });
        } catch (error) {
            console.log(error);
        }
    }

    function salvarEndereco() {
        try {
            let cadEndereco = cadastro.enderecos;
            if (endereco.id) {
                cadEndereco[index] = endereco;
                setCadastro({ ...cadastro, enderecos: cadEndereco });
                cancelarEndereco();
            } else {
                cadEndereco.push(endereco);
                setCadastro({ ...cadastro, enderecos: cadEndereco });
                cancelarEndereco();
            }
        } catch (error) {
            console.log(error);
        }
    }

    function editarEndereco(value) {
        try {
            let position = cadastro.enderecos.indexOf(value);
            setEndereco(value);
            setIndex(position);
            setActiveIndexEndereco(1);
        } catch (error) {
            console.log(error);
        }
    }

    function inserirEndereco() {
        setActiveIndexEndereco(1);
        setEndereco(new SchemaEndereco());
    }

    function cancelarEndereco() {
        setActiveIndexEndereco(0);
    }

    function exportarXLS() {
        Toasty.warn('Atenção!', 'Falta implementação!');
    }

    function validaFormulario() {
        try {
            if (cadastro.cnpjCpf &&
                cadastro.emailXml &&
                cadastro.nomeRazao &&
                cadastro.enderecos.length >= 1) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    function validaFormularioEndereco() {
        try {
            if (endereco.cep &&
                endereco.numero &&
                endereco.bairro &&
                endereco.descricao &&
                endereco.cidade?.id &&
                endereco.logradouro) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    function validaButtonEndereco() {
        try {
            if (cadastro.nomeRazao.length >= 3 &&
                cadastro.cnpjCpf &&
                cadastro.emailXml) {
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

    function acoesTabelaEndereco(rowData) {
        return <div>
            <Button
                type='button'
                tooltip='Editar'
                icon='pi pi-pencil'
                className='p-button-warning'
                style={{ marginRight: '.5em' }}
                tooltipOptions={{ position: 'left' }}
                onClick={() => editarEndereco(rowData)}
            />
            <Button
                type='button'
                tooltip='Excluir'
                icon='pi pi-trash'
                className='p-button-danger'
                tooltipOptions={{ position: 'left' }}
                onClick={() => confirmacaoExcluirEndereco(rowData)}
            />
        </div>;
    }

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Cadastros</div>;

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
                                            disabled={cadastros.length === 0}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </Toolbar>

                                <div className='p-grid' style={{ marginTop: 5, flexDirection: 'row' }}>
                                    <div className='p-col-12 p-md-5'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>CPF/CNPJ</label>
                                        <InputText
                                            maxLength={18}
                                            value={cnpjCpf}
                                            onChange={(e) => setCnpjCpf(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-5'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome/Razão Social</label>
                                        <InputText
                                            value={nome}
                                            maxLength={255}
                                            onChange={(e) => setNome(e.target.value)}
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
                                        paginator={true}
                                        value={cadastros}
                                        responsive={true}
                                        style={{ marginTop: 10 }}
                                        totalRecords={totalRecords}
                                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='tipo' header='Tipo' style={{ width: '8em' }} />
                                        <Column field='tipoPessoa' header='Tipo Pessoa' style={{ width: '8em' }} />
                                        <Column field='cnpjCpf' header='CPF/CNPJ' style={{ width: '12em' }} />
                                        <Column field='nomeRazao' header='Nome/Razão Social' />
                                        <Column field='status' header='Status' style={{ width: '6em' }} />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Cliente/Fornecedor</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={cadastro.id}
                                                />
                                            </div>
                                            <div style={{ padding: 0 }} className='p-col-12 p-md-10'></div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo Cadastro *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={listaTipo}
                                                    filterBy='label,value'
                                                    value={cadastro.tipo}
                                                    onChange={(e) => setCadastro({ ...cadastro, tipo: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo Pessoa *</label>
                                                <Dropdown
                                                    filter={true}
                                                    filterBy='label,value'
                                                    options={listaTipoPessoa}
                                                    value={cadastro.tipoPessoa}
                                                    onChange={(e) => setCadastro({ ...cadastro, tipoPessoa: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-6'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome/Razão Social *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={cadastro.nomeRazao}
                                                    onChange={(e) => setCadastro({ ...cadastro, nomeRazao: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-5'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Apelido/Nome Fantasia</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={cadastro.nomeFantasia}
                                                    onChange={(e) => setCadastro({ ...cadastro, nomeFantasia: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-5'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>CPF/CNPJ *</label>
                                                <Input
                                                    value={cadastro.cnpjCpf}
                                                    tipoPessoa={cadastro.tipoPessoa}
                                                    onChange={(e) => setCadastro({ ...cadastro, cnpjCpf: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>RG/IE</label>
                                                <InputText
                                                    maxLength={18}
                                                    keyfilter={/[0-9]+$/}
                                                    value={cadastro.inscricaoEstadualRG}
                                                    onChange={(e) => setCadastro({ ...cadastro, inscricaoEstadualRG: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Telefone Principal</label>
                                                <InputMask
                                                    keyfilter={/[0-9]+$/}
                                                    mask={'(99)9999-9999'}
                                                    value={cadastro.telefone01}
                                                    placeholder='ex: (44)3234-1234'
                                                    onChange={(e) => setCadastro({ ...cadastro, telefone01: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Telefone Alternativo</label>
                                                <InputMask
                                                    keyfilter={/[0-9]+$/}
                                                    mask={'(99)9999-9999'}
                                                    value={cadastro.telefone02}
                                                    placeholder='ex: (44)3234-1234'
                                                    onChange={(e) => setCadastro({ ...cadastro, telefone02: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Celular Principal</label>
                                                <InputMask
                                                    keyfilter={/[0-9]+$/}
                                                    mask={'(99)99999-9999'}
                                                    value={cadastro.celular01}
                                                    placeholder='ex: (44)99997-1234'
                                                    onChange={(e) => setCadastro({ ...cadastro, celular01: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Celular Alternativo</label>
                                                <InputMask
                                                    keyfilter={/[0-9]+$/}
                                                    mask={'(99)99999-9999'}
                                                    value={cadastro.celular02}
                                                    placeholder='ex: (44)99997-1234'
                                                    onChange={(e) => setCadastro({ ...cadastro, celular02: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-6'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>E-mail Contato</label>
                                                <InputText
                                                    maxLength={4000}
                                                    value={cadastro.email}
                                                    onChange={(e) => setCadastro({ ...cadastro, email: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-6'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>E-mail XML *</label>
                                                <InputText
                                                    maxLength={4000}
                                                    value={cadastro.emailXml}
                                                    onChange={(e) => setCadastro({ ...cadastro, emailXml: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Limite de Crédito *</label>
                                                <InputNumber
                                                    min={0}
                                                    mode='decimal'
                                                    minFractionDigits={2}
                                                    maxFractionDigits={2}
                                                    value={cadastro.limite}
                                                    onChange={(e) => setCadastro({ ...cadastro, limite: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data de Cadastro</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={cadastro.dataCadastro}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status</label>
                                                <Dropdown
                                                    options={listaStatus}
                                                    value={cadastro.status}
                                                    onChange={(e) => setCadastro({ ...cadastro, status: e.value })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'flex-end' }} className='p-col-12 p-md-2'>
                                                <Button
                                                    label='Endereço'
                                                    icon='pi pi-plus'
                                                    disabled={!validaButtonEndereco()}
                                                    className='p-button-success p-button-raised'
                                                    onClick={() => { setActiveIndexEndereco(0); setIsVisible(true) }}
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

                    <Dialog
                        modal
                        maximizable
                        id='form-dialog'
                        visible={isVisible}
                        header='Endereço(s)'
                        onHide={() => setIsVisible(false)}
                        footer={(<div style={{ height: 20 }}></div>)}
                    >
                        <TabView activeIndex={activeIndexEndereco} onTabChange={(e) => setActiveIndexEndereco(e.index)}>
                            <TabPanel disabled header='Lista'>
                                <div className='p-fluid'>
                                    <div className='p-grid'>
                                        <div className='p-col-12 p-md-3'>
                                            <Button
                                                autoFocus
                                                label='Adicionar'
                                                icon='pi pi-plus'
                                                onClick={inserirEndereco}
                                                className='p-button-success'
                                                disabled={false}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='content-section implementation'>
                                    <DataTable
                                        rows={10}
                                        paginator={true}
                                        responsive={true}
                                        value={cadastro.enderecos}
                                        totalRecords={cadastro.enderecos.length}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                        footer={(<div></div>)}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='tipo' header='Tipo' style={{ width: '7em' }} />
                                        <Column field='descricao' header='Descrição' />
                                        <Column field='status' header='Status' style={{ width: '6em' }} />
                                        <Column body={acoesTabelaEndereco} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>

                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Endereço</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={endereco.id}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo *</label>
                                                <Dropdown
                                                    value={endereco.tipo}
                                                    options={tipoEndereco}
                                                    onChange={(e) => setEndereco({ ...endereco, tipo: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-6'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={endereco.descricao}
                                                    onChange={(e) => setEndereco({ ...endereco, descricao: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>CEP *</label>
                                                <InputMask
                                                    mask='99999-999'
                                                    value={endereco.cep}
                                                    onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-8'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cidade *</label>
                                                <AutoComplete
                                                    minLength={3}
                                                    field={'nome'}
                                                    suggestions={cidades}
                                                    value={endereco?.cidade}
                                                    completeMethod={buscarCidades}
                                                    onChange={(e) => setEndereco({ ...endereco, cidade: e.value })}
                                                    itemTemplate={(item) => (`${item.nome} - ${item.estado.sigla}`)}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-1'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>UF *</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={endereco?.cidade?.estado?.sigla}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-6'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Logradouro *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={endereco.logradouro}
                                                    onChange={(e) => setEndereco({ ...endereco, logradouro: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Bairro *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={endereco.bairro}
                                                    onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Número *</label>
                                                <InputText
                                                    maxLength={20}
                                                    value={endereco.numero}
                                                    onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Complemento</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={endereco.complemento}
                                                    onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>CNPJ</label>
                                                <InputMask
                                                    maxLength={18}
                                                    value={endereco.cnpj}
                                                    mask={'99.999.999/9999-99'}
                                                    onChange={(e) => setEndereco({ ...endereco, cnpj: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-3'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>IE</label>
                                                <InputText
                                                    maxLength={20}
                                                    value={endereco.inscricaoEstadual}
                                                    onChange={(e) => setEndereco({ ...endereco, inscricaoEstadual: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo *</label>
                                                <Dropdown
                                                    options={listaStatus}
                                                    value={endereco.status}
                                                    onChange={(e) => setEndereco({ ...endereco, status: e.value })}
                                                />
                                            </div>

                                            <div className='p-col-12 p-md-12'>
                                                <Toolbar>
                                                    <div className='p-toolbar-group-left'>
                                                        <Button
                                                            label='Salvar'
                                                            onClick={salvarEndereco}
                                                            disabled={!validaFormularioEndereco()}
                                                        />
                                                    </div>
                                                    <div className='p-toolbar-group-right'>
                                                        <Button
                                                            label='Cancelar'
                                                            onClick={cancelarEndereco}
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
                    </Dialog>
              
                </div>
            </div>
        </div >
    );
}

export default withRouter(Cadastro);