import React from 'react';
import App from '../src/pages/app';
import Login from '../src/pages/login';
import AcessoNegado from '../src/pages/acessoNegado';
import RecuperarSenha from '../src/pages/recuperarSenha';
import PaginaNaoEncontrada from '../src/pages/paginaNaoEncontrada';

import Form from '../src/components/form';

import { isAuthenticated } from './services/Auth';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props => (
            isAuthenticated() ? (
                <Component {...props} />
            ) : (
                    <Redirect to={{ pathname: '/', state: { from: props.location } }} />
                )
        )} />
);

const Routes = () => (
    <BrowserRouter basename='/#'>
        <Switch>
            <Route exact path='/' component={Login} />
            <PrivateRoute path='/app' component={App} />
            <Route exact path='/acessoNegado' component={AcessoNegado} />
            <Route exact path='/recuperarSenha' component={RecuperarSenha} />

            <Route path='/form' component={Form} />

            <Route path='*' component={PaginaNaoEncontrada} />

        </Switch>
    </BrowserRouter>
);

export default Routes;