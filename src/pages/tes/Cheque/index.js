/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { withRouter } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { TabView, TabPanel } from 'primereact/tabview';

import InputNumber from '../../../components/inputNumber';
import Loading from '../../../components/loading';
import Toasty from '../../../components/toasty';
import Api from '../../../services/Api';

import { SchemaCheque, empresa } from '../TesModel';
const url = 'cheques';

const situacoes = [
    { label: 'ATIVO', value: 'ATIVO' },
    { label: 'CANCELADO', value: 'CANCELADO' }
];

function Cheque() {

    const [talao, setTalao] = useState('');
    const [numero, setNumero] = useState('');
    const [situacao, setSituacao] = useState('');
    const [dataMovimentoDe, setDataMovimentoDe] = useState(null);
    const [dataMovimentoAte, setDataMovimentoAte] = useState(null);

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [bancos, setBancos] = useState([]);
    const [contas, setContas] = useState([]);
    const [taloes, setTaloes] = useState([]);
    const [cheques, setCheques] = useState([]);
    const [agencias, setAgencias] = useState([]);
    const [cheque, setCheque] = useState(new SchemaCheque());

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | Cheque';
    }, []);

    useEffect(() => {
        buscarTaloes();
    }, []);

    async function buscarTaloes() {
        await Api({
            method: 'get',
            url: `taloesCheque?resumo`,
            params: {
                empresa,
                page: 0,
                size: 999999999
            }
        }).then(resp => {
            const data = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.nomeBanco} - ${e.nomeAgencia} - ${e.descricaoConta}`
            }));

            setTaloes(data);
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

            const { conta } = resp.data.talaoCheque;

            const agencia = {
                value: conta.agencia.id,
                label: `${conta.agencia.codigo} - ${conta.agencia.descricao}`
            };

            const banco = {
                value: conta.agencia.banco.id,
                label: `${conta.agencia.banco.codigo} - ${conta.agencia.banco.descricao}`
            };

            setActiveIndex(1);
            setBancos([banco]);
            setCheque(resp.data);
            setAgencias([agencia]);
            setContas([{ value: conta.id, label: `${conta.conta} - ${conta.descricao}` }]);
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
                talao,
                numero,
                empresa,
                situacao,
                size: eventRows,
                page: eventPage,
                dataMovimentoDe,
                dataMovimentoAte,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            setCheques(resp.data.content);
            setTotalRecords(resp.data.totalElements);
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            });
    }

    function isRecuperar() {
        try {
            if (cheque.situacao === 'CANCELADO' ||
                cheque.situacao === 'EMITIDO') {
                return true;
            }
        } catch (error) {
            console.log(error);
        }
        return false;
    }

    function isInutilizar() {
        try {
            if (cheque.situacao === 'ATIVO') {
                return true;
            }
        } catch (error) {
            console.log(error);
        }
        return false;
    }

    async function inutilizar() {
        Loading.onShow();

        await Api({
            method: 'put',
            url: `${url}/${cheque.id}/inutilizar`,
            data: JSON.stringify(talao)
        }).then(resp => {
            Loading.onHide();
            cancelar();
            pesquisar();
            Toasty.success('Sucesso!', 'Cheque inutilizado com sucesso!');
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao processar esse registro!');
            });
    }

    async function recuperar() {
        Loading.onShow();

        await Api({
            method: 'put',
            url: `${url}/${cheque.id}/recuperar`,
            data: JSON.stringify(talao)
        }).then(resp => {
            Loading.onHide();
            cancelar();
            pesquisar();
            Toasty.success('Sucesso!', 'Cheque recuperado com sucesso!');
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao processar esse registro!');
            });
    }

    async function salvar() {
        Loading.onShow();

        await Api({
            method: 'put',
            url: `${url}/${talao.id}`,
            data: JSON.stringify(talao)
        }).then(resp => {
            Loading.onHide();
            cancelar();
            pesquisar();
            Toasty.success('Sucesso!', 'Cheque editado com sucesso!');
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao processar esse registro!');
            });

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
        </div>;
    }

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Cheques</div>;

    const footer = 'Quantidade de registros ' + totalRecords;

    return (
        <div className='p-fluid'>
            <div className='p-grid'>
                <div className='p-col-12'>
                    <Card>
                        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                            <TabPanel disabled header='Lista'>
                                <Toolbar>
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
                                            disabled={cheques.length === 0}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </Toolbar>

                                <div className='p-grid' style={{ marginTop: 5, flexDirection: 'row' }}>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Número</label>
                                        <InputText
                                            value={numero}
                                            maxLength={10}
                                            keyfilter={/[0-9]+$/}
                                            onChange={(e) => setNumero(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data De</label>
                                        <InputMask
                                            mask='99/99/9999'
                                            value={dataMovimentoDe}
                                            onChange={(e) => setDataMovimentoDe(e.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data Até</label>
                                        <InputMask
                                            mask='99/99/9999'
                                            value={dataMovimentoAte}
                                            onChange={(e) => { console.log(e); setDataMovimentoAte(e.value) }}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-8'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Talão</label>
                                        <Dropdown
                                            filter={true}
                                            value={talao}
                                            showClear={true}
                                            options={taloes}
                                            filterBy='label,value'
                                            onChange={(e) => setTalao(e.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-4'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Situação</label>
                                        <Dropdown
                                            filter={true}
                                            value={situacao}
                                            showClear={true}
                                            options={situacoes}
                                            filterBy='label,value'
                                            onChange={(e) => setSituacao(e.value)}
                                        />
                                    </div>
                                </div>

                                <div className='content-section implementation'>
                                    <DataTable
                                        lazy={true}
                                        rows={rows}
                                        first={first}
                                        value={cheques}
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
                                        <Column field='numero' header='Número' style={{ width: '8em' }} />
                                        <Column field='codigoBanco' header='Banco' style={{ width: '8em' }} />
                                        <Column field='codigoAgencia' header='Agência' style={{ width: '8em' }} />
                                        <Column field='numeroConta' header='Conta' style={{ width: '8em' }} />
                                        <Column field='descricaoConta' header='Descrição' />
                                        <Column field='situacao' header='Situação' style={{ width: '8em' }} />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '4em' }} />
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <h2 style={{ margin: 5 }}>Cadastro de Cheque</h2>
                                <div className='p-fluid'>
                                    <div className='p-col-12'>
                                        <div className='p-grid'>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={cheque.id}
                                                />
                                            </div>
                                            <div style={{ padding: 0 }} className='p-md-10' />
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Número *</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={cheque.numero}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-10'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Banco *</label>
                                                <Dropdown
                                                    disabled={true}
                                                    options={bancos}
                                                    value={cheque?.talaoCheque?.conta?.agencia?.banco?.id}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Agência *</label>
                                                <Dropdown
                                                    disabled={true}
                                                    options={agencias}
                                                    value={cheque?.talaoCheque?.conta?.agencia?.id}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-12'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Conta *</label>
                                                <Dropdown
                                                    disabled={true}
                                                    options={contas}
                                                    value={cheque?.talaoCheque?.conta?.id}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data Emissão</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={cheque.dataEmissao}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor</label>
                                                <InputNumber
                                                    mode='decimal'
                                                    disabled={true}
                                                    value={cheque.valor}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data Movimento</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={cheque.dataMovimento}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-4'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nominal</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={cheque.nominal}
                                                />
                                            </div>
                                            <div className='p-col-12 p-md-2'>
                                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Situação</label>
                                                <InputText
                                                    readOnly={true}
                                                    value={cheque.situacao}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='p-col-12 p-md-12'>
                                    <Toolbar>
                                        <div style={{ display: 'flex' }} className='p-toolbar-group-left'>
                                            <Button
                                                label='Recuperar'
                                                className='p-mr-2'
                                                onClick={recuperar}
                                                disabled={!isRecuperar}
                                            />
                                            <Button
                                                label='Inutilizar'
                                                onClick={inutilizar}
                                                style={{ marginLeft: 5 }}
                                                disabled={!isInutilizar()}
                                                className='p-button-warning'
                                            />
                                        </div>
                                        <div className='p-toolbar-group-right'>
                                            <Button
                                                label='Cancelar'
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

export default withRouter(Cheque);