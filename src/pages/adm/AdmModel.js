import { getProfile } from '../../services/Api';

export const filial = getProfile()?.filial;
export const usuario = getProfile()?.usuario;
export const empresa = getProfile()?.empresa;

export function SchemaAlmoxarifado() {
    this.id = undefined;
    this.filial = undefined;
    this.codigo = '';
    this.descricao = '';
}

export function SchemaCategoria() {
    this.id = undefined;
    this.empresa = { id: empresa };
    this.codigo = '';
    this.descricao = '';
    this.planoReceitaDespesaVenda = undefined;
    this.planoReceitaDespesaDevolucaoVenda = undefined;
    this.planoReceitaDespesaCompra = undefined;
    this.planoReceitaDespesaDevolucaoCompra = undefined;
}

export function SchemaSubCategoria() {
    this.id = undefined;
    this.categoria = { id: undefined };
    this.codigo = '';
    this.descricao = '';
    this.planoReceitaDespesaVenda = undefined;
    this.planoReceitaDespesaDevolucaoVenda = undefined;
    this.planoReceitaDespesaCompra = undefined;
    this.planoReceitaDespesaDevolucaoCompra = undefined;
}

export function SchemaProduto() {
    this.id = undefined;
    this.usuario = { id: usuario };
    this.origem = undefined
    this.subCategoria = { id: undefined, categoria: { id: undefined } };
    this.unidade = undefined;
    this.aliquotaNCM = undefined;
    this.codigoCEST = undefined;
    this.codigoANP = undefined;
    this.aliquotaIPI = undefined;
    this.codigo = '';
    this.descricao = '';
    this.codigoBarra = '';
    this.valorCusto = 0;
    this.valorCustoReal = 0;
    this.valorVenda = 0;
    this.foto = undefined;
    this.calculaFCP = 'NÃO';
    this.combustivel = 'NÃO';
    this.encerrante = 'NÃO';
    this.importado = 'NÃO';
    this.status = 'ATIVO';
}

export function SchemaOperacaoEstoque() {
    this.id = undefined;
    this.empresa = { id: empresa };
    this.descricao = '';
    this.movimentaEstoque = 'SIM';
    this.tipo = 'SAÍDA';
    this.status = 'ATIVO';
}