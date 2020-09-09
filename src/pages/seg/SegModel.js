import { getProfile } from '../../services/Api';

export const usuario = getProfile()?.usuario;
export const empresa = getProfile()?.empresa;
export const filial = getProfile()?.filial;

export function SchemaUsuario() {
    this.id = undefined;
    this.filial = {id: filial};
    this.nome = undefined;
    this.email = undefined;
    this.senha = '';
    this.cpf = undefined;
    this.tipo = 'FUNCIONÁRIO';
    this.dataCadastro = undefined;
    this.foto = undefined;
    this.status = 'ATIVO';
    this.permissoes = [];
}