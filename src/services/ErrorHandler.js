import Toasty from '../components/toasty';

const ErrorHandler = (errorResponse) => {
    let msg = '';

    if (typeof errorResponse === 'string') {
        msg = errorResponse;
        console.log(msg);

    } else if (errorResponse.request.status >= 400 && errorResponse.request.status <= 499) {
        let errors;
        msg = 'Ocorreu um erro ao processar a sua solicitação';

        if (errorResponse.request.status === 400) {

            try {
                errors = JSON.parse(errorResponse.request.response);

                if (errors.error === 'invalid_grant') {
                    msg = 'Atenção Usuário ou senha inválida!';
                }
            } catch (e) {

            }
        }

        if (errorResponse.request.status === 403) {
            msg = 'Você não tem permissão para executar esta ação';
        }

        try {
            errors = JSON.parse(errorResponse.request.response);

            if (!!errors.mensagemUsuario) {
                msg = errors.mensagemUsuario;
            }
        } catch (e) {

        }
    } else {
        msg = 'Erro ao processar serviço remoto. Tente novamente.';
    }

    Toasty.error('', msg);

    return true;
}

export default ErrorHandler;