import { getProfile } from '../../services/Api';

export const usuario = getProfile()?.usuario;
export const empresa = getProfile()?.empresa;
export const filial = getProfile()?.filial;

export function SchemaCFOP() {
    this.id = undefined;
    this.codigo = '';
    this.descricao = '';
    this.tipo = undefined;
}

export function SchemaComplementoNatureza() {
    this.id = undefined;
    this.empresa = { id: empresa };
    this.codigoCFOP = undefined;
    this.numero = undefined;
    this.descricao = '';
    this.movimentoFinanceiro = 'SIM';
    this.prazoVista = undefined;
    this.status = 'ATIVO';
}

export function SchemaFinalidadeFiscal() {
    this.id = undefined;
    this.empresa = { id: empresa };
    this.operacaoEstoque = undefined;
    this.descricao = '';
    this.indicadorPresenca = undefined;
    this.finalidadeEmissao = undefined;
    this.modalidadeFrete = undefined;
    this.status = 'ATIVO';
}

export function SchemaCodigoAjusteIcms() {
    this.id = undefined;
    this.codigo = '';
    this.descricao = '';
}

export function SchemaComentarioFiscal() {
    this.id = undefined;
    this.descricao1 = '';
    this.descricao2 = '';
    this.diferimento = 'NÃO';
    this.suspenso = 'NÃO';
    this.isento = 'NÃO';
    this.baseCalculoReduzida = 'NÃO';
    this.ipi = 'NÃO';
    this.fiscal = 'NÃO';
    this.status = 'ATIVO';
}