import { getProfile } from '../../services/Api';

export const usuario = getProfile()?.usuario;
export const empresa = getProfile()?.empresa;

export function SchemaFilial() {
    this.id = undefined;
    this.empresa = { id: empresa };
    this.cadastro = undefined;
    this.contaCaixa = undefined;
    this.codigo = '';
    this.nome = '';
    this.regimeTributario = undefined;
    this.status = 'ATIVO';
}

export function SchemaEndereco() {
    this.id = undefined;
    this.cidade = undefined;
    this.descricao = undefined;
    this.cep = undefined;
    this.logradouro = undefined;
    this.bairro = undefined;
    this.complemento = undefined;
    this.numero = undefined;
    this.cnpj = undefined;
    this.inscricaoEstadual = undefined;
    this.indicadorIE = undefined;
    this.tipo = 'NORMAL';
    this.dataCadastro = undefined;
    this.status = 'ATIVO';
};

export function SchemaCadastro() {
    this.id = undefined;
    this.empresa = { id: empresa };
    this.tipo = 'CLIENTE';
    this.tipoPessoa = 'FÍSICA';
    this.nomeRazao = '';
    this.nomeFantasia = '';
    this.cnpjCpf = '';
    this.inscricaoEstadualRG = '';
    this.telefone01 = '';
    this.telefone02 = '';
    this.celular01 = '';
    this.celular02 = '';
    this.email = '';
    this.emailXml = '';
    this.limite = 0;
    this.foto = '';
    this.indicadorIE = '';
    this.dataCadastro = '';
    this.status = 'ATIVO';
    this.enderecos = [];
};

export function SchemaVeiculo() {
    this.id = undefined;
    this.cadastro = undefined;
    this.descricao = '';
    this.proprietario = 'PRÓPRIO';
    this.tipoVeiculo = 'VEÍCULO';
    this.tipoRodo = '06';
    this.tipoCarroceria = '00';
    this.placa = '';
    this.codigoANTT = '';
    this.tara = 0;
    this.status = 'ATIVO';
};

export function SchemaMotorista() {
    this.id = undefined;
    this.cadastro = undefined;
    this.nome = '';
    this.cpf = '';
};

export function SchemaVendedor() {
    this.id = undefined;
    this.empresa = { id: empresa };
    this.cpf = '';
    this.nome = '';
    this.status = 'ATIVO';
};
