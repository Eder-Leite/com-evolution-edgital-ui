import { withRouter } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { Card } from 'primereact/card';
import { Steps } from 'primereact/steps';
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
import InputNumber from '../../../components/inputNumber';
import Loading from '../../../components/loading';
import Toasty from '../../../components/toasty';
import Api from '../../../services/Api';

import { SchemaLancamentoManual, SchemaParcelaLancamentoManual, SchemaRateioLancamentoManual, empresa } from '../TesModel';
const url = 'lancamentosManualFinanceiro';

const situacoes = [
    { label: 'ABERTO', value: 'ABERTO' },
    { label: 'FECHADO', value: 'FECHADO' }
];

const tipos = [
    { label: 'DÉBITO', value: 'DÉBITO' },
    { label: 'CRÉDITO', value: 'CRÉDITO' }
];

const items = [
    { label: 'Movimento' },
    { label: 'Rateio' },
    { label: 'Parcela' },
    { label: 'Finalizar' },
];

function LancamentoFinanceiro() {
    const [formIndex, setFormIndex] = useState(0);

    const [dataDe, setDataDe] = useState('');
    const [filial, setFilial] = useState('');
    const [cliente, setCliente] = useState('');
    const [dataAte, setDataAte] = useState('');
    const [situacao, setSituacao] = useState('');
    const [documento, setDocumento] = useState('');
    const [tipoLancamento, setTipoLancamento] = useState('');

    const [rows, setRows] = useState(5);
    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const [modelos, setModelos] = useState([]);
    const [filiais, setFiliais] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [planosReceita, setPlanosReceita] = useState([]);
    const [planosDespesa, setPlanosDespesa] = useState([]);

    const [index, setIndex] = useState(null);
    const [lancamentos, setLancamentos] = useState([]);
    const [rateio, setRateio] = useState(new SchemaRateioLancamentoManual());
    const [lancamento, setLancamento] = useState(new SchemaLancamentoManual());
    const [parcela, setParcela] = useState(new SchemaParcelaLancamentoManual());

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | Lançamento Financeiro Manual';
    }, []);

    useEffect(() => {
        buscarFilias();
        buscarPlanos();
        buscarModelos();
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

            despesa = despesa.map((e) => ({
                id: e.id,
                value: e.id,
                descricao: e.descricao,
                grupoReceitaDespesa: {
                    id: e.grupoReceitaDespesa,
                    descricao: e.descricaoGrupoReceitaDespesa
                },
                label: `${e.descricao} - ${e.descricaoGrupoReceitaDespesa} - ${e.descricaoCarteira} - ${e.tipoCarteira}`
            }));

            receita = receita.map((e) => ({
                id: e.id,
                value: e.id,
                descricao: e.descricao,
                grupoReceitaDespesa: {
                    id: e.grupoReceitaDespesa,
                    descricao: e.descricaoGrupoReceitaDespesa
                },
                label: `${e.descricao} - ${e.descricaoGrupoReceitaDespesa} - ${e.descricaoCarteira} - ${e.tipoCarteira}`
            }));

            setPlanosDespesa(despesa);
            setPlanosReceita(receita);
        })
            .catch(error => {
                console.log(error);
            });
    }

    async function buscarFilias() {
        await Api({
            method: 'get',
            url: `filiais?resumo`,
            params: {
                empresa,
                page: 0,
                size: 999999999
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
            });
    }

    async function buscarModelos() {
        await Api({
            method: 'get',
            url: `modelosFiscal`,
            params: {
                page: 0,
                size: 999999999,
            }
        }).then(resp => {
            const data = resp.data.map((e) => ({
                value: e.id,
                label: `${e.codigo} - ${e.descricao} - ${e.sigla}`
            }));
            setModelos(data);
        })
            .catch(error => {
                console.log(error);
            })
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

            let data = resp.data;
            let parcelas = data.parcelas;

            parcelas = parcelas.map((e) => ({
                id: e.id,
                numero: e.numero,
                valor: e.valor,
                vencimento: e.vencimento,
                total: mascaraMoney(e.valor)
            }));

            data.parcelas = parcelas;

            let rateios = data.rateios;

            rateios = rateios.map((e) => ({
                id: e.id,
                planoReceitaDespesa: {
                    id: e.planoReceitaDespesa.id,
                    descricao: e.planoReceitaDespesa.descricao,
                    grupoReceitaDespesa: {
                        id: e.planoReceitaDespesa.grupoReceitaDespesa.id,
                        descricao: e.planoReceitaDespesa.grupoReceitaDespesa.descricao
                    }
                },
                valor: e.valor,
                total: mascaraMoney(e.valor)
            }));

            data.rateios = rateios;


            setLancamento(data);
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
                filial,
                dataDe,
                cliente,
                empresa,
                dataAte,
                situacao,
                documento,
                tipoLancamento,
                size: eventRows,
                page: eventPage,
            }
        }).then(resp => {
            Loading.onHide();

            setFirst(eventFirst);
            const data = resp.data.content;

            formataMoney(data, 'total');
            setLancamentos(data);
            setTotalRecords(resp.data.totalElements);
        })
            .catch(error => {
                Loading.onHide();
                console.log(error);
                Toasty.error('Erro!', 'Erro ao buscar registros!');
            });
    }

    function formataMoney(data, field) {
        for (const x of data) {
            x[field] = x[field].toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        }
    }

    function mascaraMoney(value) {
        return value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
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

        if (lancamento.id > 0) {
            await Api({
                method: 'put',
                url: `${url}/${lancamento.id}`,
                data: JSON.stringify(lancamento)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Lançamento Financeiro Manual editado com sucesso!');
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
                data: JSON.stringify(lancamento)
            }).then(resp => {
                Loading.onHide();
                cancelar();
                pesquisar();
                Toasty.success('Sucesso!', 'Lançamento Financeiro Manual adicionado com sucesso!');
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

    function validaFormMovimento() {
        try {
            if (lancamento.data &&
                lancamento.modelo &&
                lancamento.valor > 0 &&
                lancamento.documento &&
                lancamento.descricao &&
                lancamento.filial?.id &&
                lancamento.cadastro?.id) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    function isTotalParcela() {
        try {
            let total = 0;
            let data = lancamento.parcelas;

            for (let index = 0; index < data.length; index++) {
                total += data[index].valor;
            }
            return total;
        } catch (error) {
            console.log(error);
            return 0;
        }
    }

    function isTotalRateio() {
        try {
            let total = 0;
            let data = lancamento.rateios;

            for (let index = 0; index < data.length; index++) {
                total += data[index].valor;
            }
            return total;
        } catch (error) {
            console.log(error);
            return 0;
        }
    }

    function inserir() {
        setActiveIndex(1);
        setLancamento(new SchemaLancamentoManual());
    }

    function cancelar() {
        setFormIndex(0);
        setActiveIndex(0);
    }

    function exportarXLS() {
        Toasty.warn('Atenção!', 'Falta implementação!');
    }

    function acoesTabela(rowData) {
        if (rowData?.situacao === 'ABERTO') {
            return (
                <div>
                    <Button
                        type='button'
                        icon='pi pi-cog'
                        tooltip='Gerar título'
                        style={{ marginRight: '.5em' }}
                        tooltipOptions={{ position: 'left' }}
                        onClick={() => buscarPorId(rowData.id)}
                    />
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
                </div>
            )
        } else {
            return (
                <Button
                type='button'
                icon='pi pi-ban'
                tooltip='Cancelar títilo'
                className='p-button-danger'
                tooltipOptions={{ position: 'left' }}
                onClick={() => confirmacaoExcluir(rowData.id)}
            />
            );
        }
    }

    function acoesParcela(rowData) {
        return <div>
            <Button
                type='button'
                tooltip='Editar'
                icon='pi pi-pencil'
                className='p-button-warning'
                style={{ marginRight: '.5em' }}
                tooltipOptions={{ position: 'left' }}
                onClick={() => editarParcela(rowData)}
            />
            <Button
                type='button'
                tooltip='Excluir'
                icon='pi pi-trash'
                className='p-button-danger'
                tooltipOptions={{ position: 'left' }}
                onClick={() => confirmacaoExcluirParcela(rowData)}
            />
        </div>;
    }

    function acoesRateio(rowData) {
        return <div>
            <Button
                type='button'
                tooltip='Editar'
                icon='pi pi-pencil'
                className='p-button-warning'
                style={{ marginRight: '.5em' }}
                tooltipOptions={{ position: 'left' }}
                onClick={() => editarRateio(rowData)}
            />
            <Button
                type='button'
                tooltip='Excluir'
                icon='pi pi-trash'
                className='p-button-danger'
                tooltipOptions={{ position: 'left' }}
                onClick={() => confirmacaoExcluirRateio(rowData)}
            />
        </div>;
    }

    async function confirmacaoExcluirRateio(value) {
        await confirmService.show({
            message: `Deseja realmente excluír esse registro (${value.valor}) ?`
        }).then(
            (res) => {
                if (res) {
                    excluirRateio(value);
                }
            }
        ).catch(error => {
            console.log(error);
        });
    }

    async function confirmacaoExcluirParcela(value) {
        await confirmService.show({
            message: `Deseja realmente excluír esse registro (${value.valor}) ?`
        }).then(
            (res) => {
                if (res) {
                    excluirParcela(value);
                }
            }
        ).catch(error => {
            console.log(error);
        });
    }

    function excluirParcela(value) {
        try {
            let cadParcela = lancamento.parcelas;
            cadParcela.splice(cadParcela.indexOf(value), 1);

            let position = cadParcela.indexOf(value);
            cadParcela = cadParcela.filter((value, i) => i !== position);
            setLancamento({ ...lancamento, parcelas: cadParcela });
        } catch (error) {
            console.log(error);
        }
    }

    function excluirRateio(value) {
        try {
            let cadRateio = lancamento.rateios;
            cadRateio.splice(cadRateio.indexOf(value), 1);

            let position = cadRateio.indexOf(value);
            cadRateio = cadRateio.filter((value, i) => i !== position);
            setLancamento({ ...lancamento, rateios: cadRateio });
        } catch (error) {
            console.log(error);
        }
    }

    function salvarParcela() {
        try {
            let cadParcela = lancamento.parcelas;
            if (index !== null) {
                cadParcela[index] = parcela;

                cadParcela = cadParcela.map((e) => ({
                    id: e.id,
                    numero: e.numero,
                    valor: e.valor,
                    vencimento: e.vencimento,
                    total: mascaraMoney(e.valor)
                }));

                setLancamento({ ...lancamento, parcelas: cadParcela });
                cancelarParcela();
            } else {
                cadParcela.push(parcela);

                cadParcela = cadParcela.map((e) => ({
                    id: e.id,
                    numero: e.numero,
                    valor: e.valor,
                    vencimento: e.vencimento,
                    total: mascaraMoney(e.valor)
                }));

                setLancamento({ ...lancamento, parcelas: cadParcela });
                cancelarParcela();
            }
        } catch (error) {
            console.log(error);
        }
    }

    function salvarRateio() {
        try {
            let cadRateio = lancamento.rateios;
            if (index !== null) {
                cadRateio[index] = rateio;

                console.log(cadRateio);

                cadRateio = cadRateio.map((e) => ({
                    id: e.id,
                    planoReceitaDespesa: {
                        id: e.planoReceitaDespesa.id,
                        descricao: e.planoReceitaDespesa.descricao,
                        grupoReceitaDespesa: {
                            id: e.planoReceitaDespesa.grupoReceitaDespesa.id,
                            descricao: e.planoReceitaDespesa.grupoReceitaDespesa.descricao
                        }
                    },
                    valor: e.valor,
                    total: mascaraMoney(e.valor)
                }));

                console.log(cadRateio);

                setLancamento({ ...lancamento, rateios: cadRateio });
                cancelarRateio();
            } else {
                cadRateio.push(rateio);

                cadRateio = cadRateio.map((e) => ({
                    id: e.id,
                    planoReceitaDespesa: {
                        id: e.planoReceitaDespesa.id,
                        descricao: e.planoReceitaDespesa.descricao,
                        grupoReceitaDespesa: {
                            id: e.planoReceitaDespesa.grupoReceitaDespesa.id,
                            descricao: e.planoReceitaDespesa.grupoReceitaDespesa.descricao
                        }
                    },
                    valor: e.valor,
                    total: mascaraMoney(e.valor)
                }));

                setLancamento({ ...lancamento, rateios: cadRateio });
                cancelarRateio();
            }
        } catch (error) {
            console.log(error);
        }
    }

    function editarParcela(value) {
        try {
            let position = lancamento.parcelas.indexOf(value);
            setIndex(position);
            setParcela(value);
        } catch (error) {
            console.log(error);
        }
    }

    function editarRateio(value) {
        try {
            let position = lancamento.rateios.indexOf(value);
            setIndex(position);
            setRateio(value);
        } catch (error) {
            console.log(error);
        }
    }

    function cancelarParcela() {
        setIndex(null);
        setParcela(new SchemaParcelaLancamentoManual());
    }

    function cancelarRateio() {
        setIndex(null);
        setRateio(new SchemaRateioLancamentoManual());
    }

    function validaFormularioParcela() {
        try {
            if (parcela.vencimento &&
                parcela.valor > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    function validaFormularioRateio() {
        try {
            if (rateio.planoReceitaDespesa?.id &&
                rateio.valor > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async function onChangePlanoReceitaDespesa(id) {
        if (lancamento.tipoLancamento === 'DÉBITO') {
            for (let index = 0; index < planosReceita.length; index++) {
                if (await planosReceita[index].id === id) {
                    const obj = {
                        id: planosReceita[index].id,
                        descricao: planosReceita[index].descricao,
                        grupoReceitaDespesa: planosReceita[index].grupoReceitaDespesa
                    };
                    setRateio({ ...rateio, planoReceitaDespesa: obj });
                }
            }
        } else {
            for (let index = 0; index < planosDespesa.length; index++) {
                if (await planosDespesa[index].id === id) {
                    const obj = {
                        id: planosDespesa[index].id,
                        descricao: planosDespesa[index].descricao,
                        grupoReceitaDespesa: planosDespesa[index].grupoReceitaDespesa
                    };
                    setRateio({ ...rateio, planoReceitaDespesa: obj });
                }
            }
        }
    }

    const header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de Lançamentos Financeiro Manual</div>;

    const footer = 'Quantidade de registros ' + totalRecords;

    const headerParcela = (
        <div style={{ lineHeight: '1.87em' }}>
            <div>Parcela(s)</div>
        </div>
    )

    const footerParcela = 'Total Parcela(s) ' + mascaraMoney(isTotalParcela());

    const headerRateio = (
        <div style={{ lineHeight: '1.87em' }}>
            <div>Rateio(s)</div>
        </div>
    )

    const footerRateio = 'Total Rateio(s) ' + mascaraMoney(isTotalRateio());

    function formMovimento() {
        return (
            <div className='p-fluid'>
                <div className='p-col-12'>
                    <div className='p-grid'>
                        <div className='p-col-12 p-md-2'>
                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                            <InputText
                                readOnly={true}
                                value={lancamento.id}
                            />
                        </div>
                        <div className='p-col-12 p-md-2'>
                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Situação</label>
                            <InputText
                                readOnly={true}
                                value={lancamento.situacao}
                            />
                        </div>
                        <div className='p-col-12 p-md-2'>
                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo Lançamento *</label>
                            <Dropdown
                                filter={true}
                                options={tipos}
                                filterBy='label,value'
                                value={lancamento.tipoLancamento}
                                disabled={lancamento.rateios.length === 0 ? false : true}
                                onChange={(e) => setLancamento({ ...lancamento, tipoLancamento: e.value })}
                            />
                        </div>
                        <div className='p-col-12 p-md-6'>
                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Filial *</label>
                            <Dropdown
                                filter={true}
                                showClear={true}
                                options={filiais}
                                filterBy='label,value'
                                value={lancamento?.filial?.id}
                                disabled={lancamento.situacao === 'ABERTO' ? false : true}
                                onChange={(e) => setLancamento({ ...lancamento, filial: { id: e.value } })}
                            />
                        </div>
                        <div className='p-col-12 p-md-12'>
                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição *</label>
                            <InputText
                                maxLength={255}
                                value={lancamento.descricao}
                                readOnly={lancamento.situacao === 'ABERTO' ? false : true}
                                onChange={(e) => setLancamento({ ...lancamento, descricao: e.target.value })}
                            />
                        </div>
                        <div className='p-col-12 p-md-12'>
                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cliente *</label>
                            <AutoComplete
                                minLength={3}
                                field={'nomeRazao'}
                                suggestions={clientes}
                                value={lancamento?.cadastro}
                                completeMethod={buscarClientes}
                                disabled={lancamento.situacao === 'ABERTO' ? false : true}
                                itemTemplate={(item) => (`${item.nomeRazao} - ${item.cnpjCpf}`)}
                                onChange={(e) => setLancamento({ ...lancamento, cadastro: e.value })}
                            />
                        </div>
                        <div className='p-col-12 p-md-6'>
                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Modelo *</label>
                            <Dropdown
                                filter={true}
                                showClear={true}
                                options={modelos}
                                filterBy='label,value'
                                value={lancamento?.modelo?.id}
                                disabled={lancamento.situacao === 'ABERTO' ? false : true}
                                onChange={(e) => setLancamento({ ...lancamento, modelo: { id: e.value } })}
                            />
                        </div>
                        <div className='p-col-12 p-md-2'>
                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data *</label>
                            <InputMask
                                mask='99/99/9999'
                                value={lancamento.data}
                                disabled={lancamento.situacao === 'ABERTO' ? false : true}
                                onChange={(e) => setLancamento({ ...lancamento, data: e.value })}
                            />
                        </div>
                        <div className='p-col-12 p-md-2'>
                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Documento *</label>
                            <InputText
                                value={lancamento.documento}
                                readOnly={lancamento.situacao === 'ABERTO' ? false : true}
                                onChange={(e) => setLancamento({ ...lancamento, documento: e.target.value })}
                            />
                        </div>
                        <div className='p-col-12 p-md-2'>
                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor *</label>
                            <InputNumber
                                min={0}
                                mode='decimal'
                                minFractionDigits={2}
                                maxFractionDigits={2}
                                value={lancamento.valor}
                                disabled={lancamento.situacao === 'ABERTO' ? false : true}
                                onChange={(e) => setLancamento({ ...lancamento, valor: e.value })}
                            />
                        </div>

                        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }} className='p-col-12 p-md-12'>
                            <Button
                                tooltip='Cancela'
                                onClick={cancelar}
                                icon='pi pi-arrow-left'
                                style={{ minWidth: 100 }}
                                className='p-button-danger'
                                tooltipOptions={{ position: 'left' }}
                            />
                            <Button
                                tooltip='Rateio'
                                icon='pi pi-arrow-right'
                                style={{ minWidth: 100 }}
                                onClick={() => setFormIndex(1)}
                                disabled={!validaFormMovimento()}
                                tooltipOptions={{ position: 'left' }}
                            />
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    function formRateio() {
        return (
            <>
                <div className='p-fluid'>
                    <div className='p-col-12'>
                        <div className='p-grid'>
                            <div className='p-col-12 p-md-6'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cliente</label>
                                <AutoComplete
                                    disabled={true}
                                    field={'nomeRazao'}
                                    suggestions={clientes}
                                    value={lancamento?.cadastro}
                                />
                            </div>
                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data</label>
                                <InputMask
                                    disabled={true}
                                    mask='99/99/9999'
                                    value={lancamento.data}
                                />
                            </div>
                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Documento</label>
                                <InputText
                                    disabled={true}
                                    value={lancamento.documento}
                                />
                            </div>
                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor Movimento</label>
                                <InputNumber
                                    min={0}
                                    mode='decimal'
                                    disabled={true}
                                    minFractionDigits={2}
                                    maxFractionDigits={2}
                                    value={lancamento.valor}
                                />
                            </div>

                            <div className='p-col-12 p-md-1'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                <InputNumber
                                    disabled={true}
                                    value={rateio.id}
                                />
                            </div>
                            <div className='p-col-12 p-md-5'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Plano de Receita/Despesa *</label>
                                <Dropdown
                                    filter={true}
                                    filterBy='label,value'

                                    value={rateio.planoReceitaDespesa?.id}
                                    options={lancamento.tipoLancamento === 'DÉBITO' ? planosReceita : planosDespesa}
                                    //  onChange={(e) => setRateio({ ...rateio, planoReceitaDespesa: { id: e.value } })}
                                    onChange={(e) => onChangePlanoReceitaDespesa(e.value)}
                                />
                            </div>
                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor *</label>
                                <InputNumber
                                    min={0}
                                    mode='decimal'
                                    minFractionDigits={2}
                                    maxFractionDigits={2}
                                    value={rateio.valor}
                                    onChange={(e) => setRateio({ ...rateio, valor: e.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }} className='p-col-12 p-md-4'>
                                <Button
                                    label='Salvar'
                                    onClick={salvarRateio}
                                    style={{ width: '48%' }}
                                    disabled={!validaFormularioRateio()}
                                />
                                <Button
                                    label='Cancelar'
                                    style={{ width: '48%' }}
                                    onClick={cancelarRateio}
                                    className='p-button-danger'
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='p-col-12'>
                    <div className='content-section implementation'>
                        <DataTable
                            rows={3}
                            paginator={true}
                            responsive={true}
                            footer={footerRateio}
                            header={headerRateio}
                            value={lancamento.rateios}
                            totalRecords={lancamento.rateios.length}
                            emptyMessage={'Nenhum registro encontrado!'}
                        >
                            <Column field='id' header='ID' style={{ width: '6em' }} />
                            <Column field='planoReceitaDespesa.descricao' header='Grupo Receita/Despesa' />
                            <Column field='planoReceitaDespesa.grupoReceitaDespesa.descricao' header='Plano Receita/Despesa' />
                            <Column field='total' header='Valor' />
                            <Column body={acoesRateio} style={{ textAlign: 'center', width: '8em' }} />
                        </DataTable>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }} className='p-col-12 p-md-12'>
                    <Button
                        tooltip='Movimento'
                        icon='pi pi-arrow-left'
                        style={{ minWidth: 100 }}
                        className='p-button-danger'
                        onClick={() => setFormIndex(0)}
                        tooltipOptions={{ position: 'left' }}
                    />
                    <Button
                        tooltip='Parcela'
                        icon='pi pi-arrow-right'
                        style={{ minWidth: 100 }}
                        onClick={() => setFormIndex(2)}
                        tooltipOptions={{ position: 'left' }}
                        disabled={isTotalRateio() !== lancamento.valor}
                    />
                </div>
            </>
        );
    }

    function formParcela() {
        return (
            <>
                <div className='p-fluid'>
                    <div className='p-col-12'>
                        <div className='p-grid'>
                            <div className='p-col-12 p-md-6'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cliente</label>
                                <AutoComplete
                                    disabled={true}
                                    field={'nomeRazao'}
                                    suggestions={clientes}
                                    value={lancamento?.cadastro}
                                />
                            </div>
                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data</label>
                                <InputMask
                                    disabled={true}
                                    mask='99/99/9999'
                                    value={lancamento.data}
                                />
                            </div>
                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Documento</label>
                                <InputText
                                    disabled={true}
                                    value={lancamento.documento}
                                />
                            </div>
                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor Movimento</label>
                                <InputNumber
                                    min={0}
                                    mode='decimal'
                                    disabled={true}
                                    minFractionDigits={2}
                                    maxFractionDigits={2}
                                    value={lancamento.valor}
                                />
                            </div>

                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                <InputNumber
                                    disabled={true}
                                    value={parcela.id}
                                />
                            </div>
                            <div className='p-col-12 p-md-3'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data *</label>
                                <InputMask
                                    mask='99/99/9999'
                                    value={parcela.vencimento}
                                    onChange={(e) => setParcela({ ...parcela, vencimento: e.value })}
                                />
                            </div>
                            <div className='p-col-12 p-md-3'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor *</label>
                                <InputNumber
                                    min={0}
                                    mode='decimal'
                                    minFractionDigits={2}
                                    maxFractionDigits={2}
                                    value={parcela.valor}
                                    onChange={(e) => setParcela({ ...parcela, valor: e.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }} className='p-col-12 p-md-4'>
                                <Button
                                    label='Salvar'
                                    onClick={salvarParcela}
                                    style={{ width: '48%' }}
                                    disabled={!validaFormularioParcela()}
                                />
                                <Button
                                    label='Cancelar'
                                    style={{ width: '48%' }}
                                    onClick={cancelarParcela}
                                    className='p-button-danger'
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='p-col-12'>
                    <div className='content-section implementation'>
                        <DataTable
                            rows={3}
                            paginator={true}
                            responsive={true}
                            footer={footerParcela}
                            header={headerParcela}
                            value={lancamento.parcelas}
                            totalRecords={lancamento.parcelas.length}
                            emptyMessage={'Nenhum registro encontrado!'}
                        >
                            <Column field='id' header='ID' style={{ width: '6em' }} />
                            <Column field='total' header='Valor' />
                            <Column field='vencimento' header='Vencimento' />
                            <Column body={acoesParcela} style={{ textAlign: 'center', width: '8em' }} />
                        </DataTable>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }} className='p-col-12 p-md-12'>
                    <Button
                        tooltip='Rateio'
                        icon='pi pi-arrow-left'
                        style={{ minWidth: 100 }}
                        className='p-button-danger'
                        onClick={() => setFormIndex(1)}
                        tooltipOptions={{ position: 'left' }}
                    />
                    <Button
                        tooltip='Finalizar'
                        icon='pi pi-arrow-right'
                        style={{ minWidth: 100 }}
                        onClick={() => setFormIndex(3)}
                        tooltipOptions={{ position: 'left' }}
                        disabled={isTotalParcela() !== lancamento.valor}
                    />
                </div>
            </>
        );
    }

    function formFinalizar() {
        return (
            <>
                <div className='p-fluid'>
                    <div className='p-col-12'>
                        <div className='p-grid'>
                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>ID</label>
                                <InputText
                                    disabled={true}
                                    value={lancamento.id}
                                />
                            </div>
                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Situação</label>
                                <InputText
                                    disabled={true}
                                    value={lancamento.situacao}
                                />
                            </div>
                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo Lançamento</label>
                                <Dropdown
                                    options={tipos}
                                    disabled={true}
                                    value={lancamento.tipoLancamento}
                                />
                            </div>
                            <div className='p-col-12 p-md-6'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Filial</label>
                                <Dropdown
                                    disabled={true}
                                    options={filiais}
                                    value={lancamento?.filial?.id}
                                />
                            </div>
                            <div className='p-col-12 p-md-12'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição</label>
                                <InputText
                                    disabled={true}
                                    value={lancamento.descricao}
                                />
                            </div>
                            <div className='p-col-12 p-md-12'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cliente</label>
                                <AutoComplete
                                    disabled={true}
                                    field={'nomeRazao'}
                                    suggestions={clientes}
                                    value={lancamento?.cadastro}
                                />
                            </div>
                            <div className='p-col-12 p-md-6'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Modelo</label>
                                <Dropdown
                                    disabled={true}
                                    options={modelos}
                                    value={lancamento?.modelo?.id}
                                />
                            </div>
                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data</label>
                                <InputMask
                                    disabled={true}
                                    mask='99/99/9999'
                                    value={lancamento.data}
                                />
                            </div>
                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Documento</label>
                                <InputText
                                    disabled={true}
                                    value={lancamento.documento}
                                />
                            </div>
                            <div className='p-col-12 p-md-2'>
                                <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor</label>
                                <InputNumber
                                    min={0}
                                    mode='decimal'
                                    disabled={true}
                                    minFractionDigits={2}
                                    maxFractionDigits={2}
                                    value={lancamento.valor}
                                />
                            </div>

                            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }} className='p-col-12 p-md-12'>
                                <Button
                                    tooltip='Parcela'
                                    icon='pi pi-arrow-left'
                                    style={{ minWidth: 100 }}
                                    className='p-button-danger'
                                    onClick={() => setFormIndex(2)}
                                    tooltipOptions={{ position: 'left' }}
                                />
                                <Button
                                    onClick={salvar}
                                    tooltip='Finalizar'
                                    icon='pi pi-check'
                                    style={{ minWidth: 100 }}
                                    tooltipOptions={{ position: 'left' }}
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </>
        );
    }

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
                                            disabled={lancamentos.length === 0}
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </Toolbar>

                                <div className='p-grid' style={{ marginTop: 5, flexDirection: 'row' }}>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data De</label>
                                        <InputMask
                                            mask='99/99/9999'
                                            value={dataDe}
                                            onChange={(e) => setDataDe(e.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data Até</label>
                                        <InputMask
                                            mask='99/99/9999'
                                            value={dataAte}
                                            onChange={(e) => { console.log(e); setDataAte(e.value) }}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-2'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Documento</label>
                                        <InputText
                                            maxLength={10}
                                            value={documento}
                                            keyfilter={/[0-9]+$/}
                                            onChange={(e) => setDocumento(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-6'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Filial</label>
                                        <Dropdown
                                            filter={true}
                                            value={filial}
                                            showClear={true}
                                            options={filiais}
                                            filterBy='label,value'
                                            onChange={(e) => setFilial(e.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-3'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo Lançamento</label>
                                        <Dropdown
                                            filter={true}
                                            options={tipos}
                                            showClear={true}
                                            filterBy='label,value'
                                            value={tipoLancamento}
                                            onChange={(e) => setTipoLancamento(e.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-7'>
                                        <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cliente</label>
                                        <InputText
                                            maxLength={255}
                                            value={cliente}
                                            onChange={(e) => setCliente(e.target.value)}
                                        />
                                    </div>
                                    <div className='p-col-12 p-md-2'>
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
                                        footer={footer}
                                        header={header}
                                        onPage={onPage}
                                        paginator={true}
                                        responsive={true}
                                        value={lancamentos}
                                        style={{ marginTop: 10 }}
                                        totalRecords={totalRecords}
                                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                        emptyMessage={'Nenhum registro encontrado!'}
                                    >
                                        <Column field='id' header='ID' style={{ width: '6em' }} />
                                        <Column field='tipoLancamento' header='Tipo' style={{ width: '8em' }} />
                                        <Column field='data' header='Data' style={{ width: '8em' }} />
                                        <Column field='documento' header='Documento' style={{ width: '8em' }} />
                                        <Column field='cliente' header='Cliente' />
                                        <Column field='total' header='Valor' style={{ width: '10em' }} />
                                        <Column field='situacao' header='Situação' style={{ width: '8em' }} />
                                        <Column body={acoesTabela} style={{ textAlign: 'center', width: '10em' }} />
                                    </DataTable>
                                </div>

                            </TabPanel>

                            <TabPanel disabled header='Cadastro'>
                                <Steps style={{ marginBottom: 20 }} model={items} readOnly={true} activeIndex={formIndex} onSelect={(e) => setFormIndex(e.index)} />
                                {formIndex === 0 && formMovimento()}
                                {formIndex === 1 && formRateio()}
                                {formIndex === 2 && formParcela()}
                                {formIndex === 3 && formFinalizar()}
                            </TabPanel>

                        </TabView>
                    </Card>
                </div>
            </div>
        </div >
    );
}

export default withRouter(LancamentoFinanceiro);