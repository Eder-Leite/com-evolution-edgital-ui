/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { withRouter } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { InputMask } from 'primereact/inputmask';
import { TabView, TabPanel } from 'primereact/tabview';

import confirmService from '../../../services/confirmService';
import Loading from '../../../components/loading';
import Toasty from '../../../components/toasty';
import Api from '../../../services/Api';

import { SchemaUsuario, filial, empresa } from '../SegModel';
const url = 'usuarios';

const tipos = [
    { label: 'ADMINISTRADOR', value: 'ADMINISTRADOR' },
    { label: 'FUNCIONÁRIO', value: 'FUNCIONÁRIO' },
    { label: 'SUPERVISOR', value: 'SUPERVISOR' }
];

const listaStatus = [
    { label: 'ATIVO', value: 'ATIVO' },
    { label: 'INATIVO', value: 'INATIVO' }
];

function Usuario() {
    const [isVisible, setIsVisible] = useState(false);

    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [status, setStatus] = useState('');
    const [filial, setFilial] = useState('');

    const [usuario, setUsuario] = useState(new SchemaUsuario());

    const [filiais, setFiliais] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        Loading.onShow();
        document.title = 'Evolution Sistemas - eDigital | Usuário';
    }, []);

    useEffect(() => {
        setTimeout(() => {
            buscarFilias();
            Loading.onHide();
        }, 100);
    }, []);

    async function buscarFilias() {
        await Api({
            method: 'get',
            url: `filiais?resumo`,
            params: {
                page: 0,
                empresa,
                size: 999999999,
            }
        }).then(resp => {
            const data = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.codigo} - ${e.nome}`
            }));
            setFiliais(data);
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

    async function pesquisar(eventPage = 0, eventRows = 0, eventFirst = 0) {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                id,
                nome,
                status,
                filial,
                empresa,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            setUsuarios(resp.data.content);
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
            setActiveIndex(1);
            setUsuario(resp.data);
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            })
    }

    async function salvar() {
        Loading.onShow();

        if (usuario.id > 0) {
            await Api({
                method: 'put',
                url: `${url}/${usuario.id}`,
                data: JSON.stringify(usuario)
            }).then(resp => {
                Loading.onHide()
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Usuário editado com sucesso!');
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
                data: JSON.stringify(usuario)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Usuário adicionado com sucesso!');
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
            if (IsEmail() &&
                isSenha() &&
                usuario.cpf &&
                usuario.filial.id &&
                usuario.nome.length >= 3) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    function inserir() {
        setActiveIndex(1);
        setUsuario(new SchemaUsuario());
    }

    function cancelar() {
        setActiveIndex(0);
    }

    function exportarXLS() {
        Toasty.warn('Atenção!', 'Falta implementação!');
    }

    function isID() {
        if (usuario.id !== null && usuario.id !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    function IsEmail() {
        if (new RegExp(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}/g).test(usuario.email)) {
            return true;
        }
        else {
            return false;
        }
    }

    function isSenha() {
        if (isID()) {
            if (usuario.senha !== null && usuario.senha !== undefined) {
                if (usuario.senha.length === 8 || usuario.senha.length === 0) {
                    return true;
                } else {
                    return false;
                }
            } else if (usuario.senha === undefined || usuario.senha === null) {
                return true;
            } else {
                return false;
            }
        } else {
            if (usuario.senha !== null && usuario.senha !== undefined) {
                if (usuario.senha.length === 8) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
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

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Usuários</div>;

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
                                            disabled={usuarios.length === 0}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </Toolbar>

                                <div className='p-grid' style={{ marginTop: 5, flexDirection: 'row' }}>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                        <InputText
                                            value={id}
                                            maxLength={20}
                                            onChange={(e) => setId(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-4'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Filial</label>
                                        <Dropdown
                                            value={filial}
                                            showClear={true}
                                            options={filiais}
                                            onChange={(e) => setFilial(e.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-4'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome</label>
                                        <InputText
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status</label>
                                        <Dropdown
                                            value={status}
                                            showClear={true}
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
                                        value={usuarios}
                                        paginator={true}
                                        responsive={true}
                                        style={{ marginTop: 10 }}
                                        totalRecords={totalRecords}
                                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='nomeFilial' header='Filial' />
                                        <Column field='nome' header='Nome' />
                                        <Column field='tipo' header='Tipo' />
                                        <Column field='status' header='Status' style={{ width: '6em' }} />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                    </DataTable>
                                </div>

                            </TabPanel>
                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Usuário</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={usuario.id}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Filial *</label>
                                                <Dropdown
                                                    filter={true}
                                                    options={filiais}
                                                    filterBy='label,value'
                                                    value={usuario.filial.id}
                                                    disabled={usuario.id ? true : false}
                                                    onChange={(e) => setUsuario({ ...usuario, filial: { id: e.value } })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={usuario.nome}
                                                    onChange={(e) => setUsuario({ ...usuario, nome: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-10'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>E-mail *</label>
                                                <InputText
                                                    maxLength={255}
                                                    value={usuario.email}
                                                    onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Senha *</label>
                                                <Password
                                                    maxLength={8}
                                                    type='password'
                                                    value={usuario?.senha}
                                                    weakLabel={'Atenção a senha digitada é fraca'}
                                                    mediumLabel={'Atenção a senha digitada é razoável'}
                                                    strongLabel={'Atenção a senha digitada é excelente'}
                                                    onChange={(e) => setUsuario({ ...usuario, senha: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>CPF *</label>
                                                <InputMask
                                                    maxLength={14}
                                                    value={usuario.cpf}
                                                    mask='999.999.999-99'
                                                    onChange={(e) => setUsuario({ ...usuario, cpf: e.target.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-6'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo *</label>
                                                <Dropdown
                                                    options={tipos}
                                                    value={usuario.tipo}
                                                    onChange={(e) => setUsuario({ ...usuario, tipo: e.value })}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-5'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status *</label>
                                                <Dropdown
                                                    options={listaStatus}
                                                    value={usuario.status}
                                                    onChange={(e) => setUsuario({ ...usuario, status: e.value })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'flex-end' }} className='p-col-12 p-md-1'>
                                                <Button
                                                    type='button'
                                                    icon='pi pi-star'
                                                    tooltip='permissões'
                                                    className='p-button-warning'
                                                    onClick={() => setIsVisible(true)}
                                                    tooltipOptions={{ position: 'left' }}
                                                    disabled={usuario?.permissoes.length === 0}
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

                    <Dialog
                        modal
                        maximizable
                        position='top'
                        id='form-dialog'
                        visible={isVisible}
                        header='Permissões'
                        onHide={() => setIsVisible(false)}
                        footer={(<div style={{ height: 20 }}></div>)}
                    >
                        <div className='content-section implementation'>
                            <DataTable
                                rows={10}
                                paginator={true}
                                responsive={true}
                                footer={(<div></div>)}
                                value={usuario.permissoes}
                                totalRecords={usuario.permissoes.length}
                                emptyMessage={'Nenhum registro encontrado!'}
                            >
                                <Column field='id' header='ID' style={{ width: '6em' }} />
                                <Column field='descricao' header='Descrição' />
                                <Column field='status' header='Status' style={{ width: '6em' }} />
                            </DataTable>
                        </div>
                    </Dialog >
                </div >
            </div >
        </div >
    );
}

export default withRouter(Usuario);