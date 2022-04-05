import React, { Component } from "react";
import { Route, Switch } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import Fornecedores from "./components/Fornecedores";
import CadastroDeFornecedor from "./components/CadastroDeFornecedor";

import "./custom.css";
import "semantic-ui-css/semantic.min.css";

export default class App extends Component {
    static displayName = App.name;

    render() {
        return (
            <Layout>
                <Route exact path="/" component={Home} />
                <Route path="/fornecedores" render={() => <Fornecedores />} />
                <Switch>
                    <Route
                        path="/cadastrodefornecedor/:id"
                        render={() => <CadastroDeFornecedor />}
                    />
                    <Route
                        path="/cadastrodefornecedor"
                        render={() => <CadastroDeFornecedor />}
                    />
                </Switch>
            </Layout>
        );
    }
}
