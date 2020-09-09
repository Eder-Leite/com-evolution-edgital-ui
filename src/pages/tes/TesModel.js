import { getProfile } from '../../services/Api';

export const usuario = getProfile()?.usuario;
export const empresa = getProfile()?.empresa;
export const filial = getProfile()?.filial;

export function SchemaCarteiraFinanceira() {
    this.id = undefined;
    this.empresa = { id: empresa };
    this.descricao = '';
    this.tipo = 'RECEITA';
};

export function SchemaGrupoReceitaDespesa() {
    this.id = undefined;
    this.carteira = undefined;
    this.descricao = '';
};

export function SchemaPlanoReceitaDespesa() {
    this.id = undefined;
    this.grupoReceitaDespesa = undefined;
    this.descricao = '';
    this.taxaDesconto = 0;
    this.taxaJuros = 0;
};

export function SchemaBanco() {
    this.id = undefined;
    this.codigo = '';
    this.descricao = '';
    this.tipo = 'BANCÁRIO';
    this.status = 'ATIVO';
};

export function SchemaAgencia() {
    this.id = undefined;
    this.banco = { id: undefined };
    this.codigo = '';
    this.digito = '';
    this.descricao = '';
    this.cidade = '';
    this.status = 'ATIVO';
};

export function SchemaConta() {
    this.id = undefined;
    this.agencia = { id: undefined, banco: { id: undefined } };
    this.empresa = { id: empresa };
    this.conta = '';
    this.digito = '';
    this.descricao = '';
    this.tipo = 'CORRENTE';
    this.status = 'ATIVO';
};

export function SchemaTalaoCheque() {
    this.id = undefined;
    this.conta = { id: undefined, agencia: { id: undefined, banco: { id: undefined } } };
    this.filial = { id: filial };
    this.numeroInicial = 0;
    this.numeroFinal = 0;
    this.status = 'ATIVO';
};

export function SchemaCheque() {
    this.id = undefined;
    this.talaoCheque = { id: undefined };
    this.numero = undefined;
    this.valor = undefined;
    this.dataEmissao = undefined;
    this.dataMovimento = undefined;
    this.dataEmissao = undefined;
    this.nominal = undefined;
    this.situacao = 'ATIVO';
};

export function SchemaLocalFaturamento() {
    this.id = undefined;
    this.filial = undefined;
    this.conta = undefined;
    this.descricao = '';
}

export function SchemaParcelaLancamentoManual() {
    this.id = undefined;
    this.valor = undefined;
    this.vencimento = undefined;
    this.total = 'R$ 0,00';
}

export function SchemaRateioLancamentoManual() {
    this.id = undefined;
    this.planoReceitaDespesa = undefined;
    this.percentual = undefined;
    this.valor = undefined;
    this.vencimento = undefined;
    this.principal = 'SIM';
}

export function SchemaLancamentoManual() {
    this.id = undefined;
    this.filial = { id: filial };
    this.cadastro = undefined;
    this.usuario = { id: usuario };
    this.modelo = undefined;
    this.situacao = 'ABERTO';
    this.documento = '';
    this.data = undefined;
    this.descricao = '';
    this.tipoLancamento = 'DÉBITO';
    this.valor = undefined;
    this.parcelas = [];
    this.rateios = [];
}