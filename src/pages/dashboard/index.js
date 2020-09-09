import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import React, { useEffect } from 'react';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { withRouter } from 'react-router-dom';

function Dashboard() {

    useEffect(() => {
        document.title = 'Evolution Sistemas - eDigital | Dashboard';
    }, []);

    const botaoMenu = {
        textAlign: 'left',
        marginBottom: 10,
        backgroundColor: '#f4f4f4',
    };

    const polar = {
        datasets: [{
            data: [
                1500,
                1000,
                5000
            ],
            backgroundColor: [
                '#E7E9ED',
                '#FFCE56',
                '#FF6384'
            ],
            label: 'My dataset'
        }],
        labels: [
            'ETANOL',
            'GASOLINA',
            'DIESEL'
        ]
    };

    const data = {
        labels: ['VISTA', 'PRAZO'],
        datasets: [
            {
                data: [5500, 2500],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                ],
                hoverBackgroundColor: [
                    '#FF638f',
                    '#36A2Ef',
                ]
            }]
    };

    const bar = {
        labels: ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'DOMINGO'],
        datasets: [
            {
                label: 'VALOR',
                backgroundColor: '#9CCC65',
                data: [2500, 1500, 2250, 3500, 7500, 0, 0]
            }
        ]
    };

    const options = {
        responsive: true,
        title: {
            display: true,
            text: '',
        },
        tooltips: {
            mode: 'index',
            intersect: true
        }
    };

    return (
        <div style={{ padding: 2 }} className='p-grid p-fluid dashboard'>
            <div className='p-col-12 p-lg-4'>
                <Card className='summary'>
                    <span className='title'>{'Usuários'}</span>
                    <span className='detail'>{'Quantidade cadastrados'}</span>
                    <span className='count visitors'>{'23'}</span>
                </Card>
            </div>
            <div className='p-col-12 p-lg-4'>
                <Card className='summary'>
                    <span className='title'>{'Clientes'}</span>
                    <span className='detail'>{'Quantidade cadastrados'}</span>
                    <span className='count purchases'>{'3500'}</span>
                </Card>
            </div>
            <div className='p-col-12 p-lg-4'>
                <Card className='summary'>
                    <span className='title'>{'Vendas'}</span>
                    <span className='detail'>{'Total de vendas de hoje'}</span>
                    <span className='count revenue'>{'R$ 7.500,00'}</span>
                </Card>
            </div>

            <div className='p-col-12 p-lg-4'>
                <Card>
                    <div style={{ minHeight: 400 }}>
                        <Panel header='Atalhos'>
                            <Button
                                label='PDV'
                                iconPos='right'
                                style={botaoMenu}
                                icon='pi pi-arrow-right'
                                className='p-button-secondary'
                            />
                            <Button
                                label='Caixa'
                                iconPos='right'
                                style={botaoMenu}
                                icon='pi pi-arrow-right'
                                className='p-button-secondary'
                            />
                            <Button
                                iconPos='right'
                                style={botaoMenu}
                                label='Fluxo de Caixa'
                                icon='pi pi-arrow-right'
                                className='p-button-secondary'
                            />
                            <Button
                                iconPos='right'
                                style={botaoMenu}
                                label='Contas a Pagar'
                                icon='pi pi-arrow-right'
                                className='p-button-secondary'
                            />
                            <Button
                                iconPos='right'
                                style={botaoMenu}
                                label='Contas a Receber'
                                icon='pi pi-arrow-right'
                                className='p-button-secondary'
                            />
                            <Button
                                iconPos='right'
                                style={botaoMenu}
                                icon='pi pi-arrow-right'
                                label='Entradas no Estoque'
                                className='p-button-secondary'
                            />
                            <Button
                                iconPos='right'
                                style={botaoMenu}
                                icon='pi pi-arrow-right'
                                label='Cadastro de Produto'
                                className='p-button-secondary'
                            />
                            <Button
                                iconPos='right'
                                style={botaoMenu}
                                icon='pi pi-arrow-right'
                                label='Cadastro de Cliente'
                                className='p-button-secondary'
                            />
                        </Panel>
                    </div>
                </Card>
            </div>

            <div></div>

            <div className='p-col-12 p-lg-8'>
                <Card>
                    <div>
                        <Panel header='Venda por Categoria'>
                            <Chart type='pie' data={polar} />
                        </Panel>
                    </div>
                </Card>
            </div>

            <div className='p-col-12 p-lg-6'>
                <Card>
                    <div>
                        <Panel header='Tipo de Venda'>
                            <Chart type='doughnut' data={data} />
                        </Panel>
                    </div>
                </Card>
            </div>

            <div className='p-col-12 p-lg-6'>
                <Card>
                    <Panel header='Venda da Semana'>
                        <Chart
                            type='bar'
                            data={bar}
                            options={options}
                        />
                    </Panel>
                </Card>
            </div>
        </div>
    );
}

export default withRouter(Dashboard);