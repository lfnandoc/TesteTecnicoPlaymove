import React, { Component } from 'react';
import { Link } from "react-router-dom";

export class Home extends Component {
    static displayName = Home.name;

    render() {
        return (
            <div>
                <h1>Bem vindo!</h1>
                <ul>
                    <li>Acessar <Link to="/fornecedores">Fornecedores</Link></li>
                </ul>
                <p>Desenvolvido em React e .NET Core por <a href='http://github.com/lfnandoc'>Luiz Fernando Cardoso</a> para o Teste C# da Playmove.</p>
            </div >
        );
    }
}
