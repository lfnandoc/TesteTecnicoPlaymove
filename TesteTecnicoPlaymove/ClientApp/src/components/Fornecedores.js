import React, { useState, useEffect } from "react";
import {
    Input,
    Form,
    List,
    Message,
    Icon,
    Confirm,
    Table,
    Grid,
    Button,
    Pagination,
    Loader,
    Dimmer,
    Segment,
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import SemanticDatepicker from "react-semantic-ui-datepickers";
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css";
import axios from "axios";
import "semantic-ui-css/semantic.min.css";
import moment from "moment";
import "./Fornecedores.css";

const Fornecedores = () => {
    const [fornecedores, setFornecedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);

    const [filterNome, setFilterNome] = useState("");
    const onChangeFilterNome = (event, data) => {
        if (!data)
            return;

        setFilterNome(data.value);
    };

    const [filterCnpjCpf, setFilterCnpjCpf] = useState("");
    const onChangeFilterCnpjCpf = (event, data) => {
        if (!data)
            return;

        setFilterCnpjCpf(data.value);
    };

    const [filterDataDeCadastro, setFilterDataDeCadastro] = useState(undefined);
    const onChangeFilterDataDeCadastro = (event, data) => {
        if (!data)
            return;

        setFilterDataDeCadastro(data.value);
    };

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [idToBeDeleted, setIdToBeDeleted] = useState(undefined);

    useEffect(() => {
        reloadList();
    }, []);

    useEffect(() => {
        reloadList();
    }, [filterDataDeCadastro, filterCnpjCpf, filterNome]);

    function reloadList() {
        getPageCount();
        populateData();
    }

    function removeItem(id, nome) {
        axios.delete(`/fornecedor/${id}`).then(
            (response) => {
                setSuccessMessage(`Fornecedor ${nome} excluido com sucesso!`);
                setErrorMessage("");
                getPageCount();
                populateData(page);
            },
            (error) => {
                setErrorMessage(`Erro ao excluir fornecedor ${nome} - ${error}`);
                setSuccessMessage("");
            }
        );
    }

    function getPageCount() {
        var url = `/fornecedor/count`;

        axios.get(url, { params: getFilterParams() }).then(
            (response) => {
                setPageCount(Math.ceil(response.data / 6));
            },
            (error) => { }
        );
    }

    function populateData() {
        var url = `/fornecedor/paginated/${page}`;

        axios.get(url, { params: getFilterParams() }).then(
            (response) => {
                setFornecedores(response.data);
                setLoading(false);
                setSearchLoading(false);
            },
            (error) => { }
        );
    }

    function getFilterParams() {
        var params = {
            nome: null,
            cnpjCpf: null,
            dataDeCadastroStart: null,
            dataDeCadastroEnd: null,
        };
        if (filterNome && filterNome.length > 0) params.nome = filterNome;
        if (filterCnpjCpf && filterCnpjCpf.length > 0)
            params.cnpjCpf = filterCnpjCpf;
        if (filterDataDeCadastro && filterDataDeCadastro.length > 0) {
            params.dataDeCadastroStart = filterDataDeCadastro[0];

            if (filterDataDeCadastro.length > 1)
                params.dataDeCadastroEnd = filterDataDeCadastro[1];
            else params.dataDeCadastroEnd = filterDataDeCadastro[0];
        }
        return params;
    }

    function renderTable() {
        return (
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>CPF / CNPJ</Table.HeaderCell>
                        <Table.HeaderCell>Nome</Table.HeaderCell>
                        <Table.HeaderCell>RG</Table.HeaderCell>
                        <Table.HeaderCell>Data de Nascimento</Table.HeaderCell>
                        <Table.HeaderCell>Empresa</Table.HeaderCell>
                        <Table.HeaderCell>Telefones</Table.HeaderCell>
                        <Table.HeaderCell>Data/Hora de Cadastro</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {fornecedores.map((fornecedor) => (
                        <Table.Row key={fornecedor.id}>
                            <Table.Cell>
                                <Icon
                                    name="trash"
                                    link
                                    onClick={() => {
                                        setDeleteConfirmationOpen(true);
                                        setIdToBeDeleted(fornecedor.id);
                                    }}
                                />
                                <Link
                                    style={{ color: "inherit", textDecoration: "inherit" }}
                                    to={`/cadastrodefornecedor/${fornecedor.id}`}
                                >
                                    <Icon name="pencil alternate" />
                                </Link>
                                {fornecedor.cpfOuCnpj}
                            </Table.Cell>
                            <Table.Cell>{fornecedor.nome}</Table.Cell>
                            <Table.Cell>{fornecedor.rg ? fornecedor.rg : "-"}</Table.Cell>
                            <Table.Cell>
                                {fornecedor.rg
                                    ? moment(fornecedor.dataDeNascimento).format("DD/MM/YYYY")
                                    : "-"}
                            </Table.Cell>
                            <Table.Cell>{fornecedor.empresa.nomeFantasia}</Table.Cell>
                            <Table.Cell>
                                <List divided horizontal>
                                    {fornecedor.telefones.split("|").map((telefone, index) => (
                                        <List.Item key={index}>{telefone}</List.Item>
                                    ))}
                                </List>
                            </Table.Cell>
                            <Table.Cell>
                                {moment(fornecedor.dataDeCadastro).format("DD/MM/YYYY - HH:mm")}
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>

                <Table.Footer fullWidth>
                    <Table.Row>
                        <Table.HeaderCell colSpan="7">
                            <Link to="/cadastrodefornecedor">
                                <Button
                                    floated="left"
                                    icon
                                    labelPosition="left"
                                    primary
                                    size="small"
                                >
                                    <Icon name="address book" /> Cadastrar fornecedor
                                </Button>
                            </Link>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
            </Table>
        );
    }

    function renderFilters() {
        return (
            <Grid centered colums="2">
                <Segment textAlign="center" style={{ width: "35%" }}>
                    <Form loading={searchLoading} size="small">
                        <label>
                            <b>Filtros</b>
                        </label>
                        <Form.Group widths="equal">
                            <Form.Input
                                inline
                                fluid
                                label="Nome"
                                placeholder="Nome"
                                onBlur={onChangeFilterNome}
                                onChange={onChangeFilterNome}
                                value={filterNome}
                                maxLength="100"
                            />
                            <Form.Input
                                inline
                                fluid
                                label="CNPJ / CPF"
                                placeholder="CNPJ / CPF"
                                onChange={onChangeFilterCnpjCpf}
                                value={filterCnpjCpf}
                                maxLength="100"
                            />
                            <Form.Field inline>
                                <label>Data de Cadastro</label>
                                <SemanticDatepicker
                                    format="DD/MM/YYYY"
                                    value={filterDataDeCadastro ?? null}
                                    locale="pt-BR"
                                    type="range"
                                    onChange={onChangeFilterDataDeCadastro}
                                    style={{ maxwidth: "auto !important" }}
                                />
                                <br />
                            </Form.Field>
                        </Form.Group>
                    </Form>
                </Segment>
            </Grid>
        );
    }

    let contents = loading ? (
        <Dimmer active inverted>
            <Loader inverted></Loader>
        </Dimmer>
    ) : (
        renderTable()
    );

    return (
        <div>
            <Confirm
                class="confirm"
                content="Tem certeza que deseja excluir o fornecedor?"
                cancelButton="Cancelar"
                confirmButton="Excluir"
                open={deleteConfirmationOpen}
                onCancel={() => {
                    setDeleteConfirmationOpen(false);
                }}
                onConfirm={() => {
                    setDeleteConfirmationOpen(false);
                    removeItem(
                        idToBeDeleted,
                        fornecedores.find((fornecedor) => fornecedor.id === idToBeDeleted)
                            .nome
                    );
                }}
            />
            <h1 id="tableLabel">Fornecedores</h1>

            {renderFilters()}

            <Message
                hidden={successMessage === ""}
                success={successMessage !== ""}
                header={successMessage}
            />
            <Message
                hidden={errorMessage === ""}
                error={errorMessage !== ""}
                header={errorMessage}
            />
            <br />
            {contents}

            <br />

            <Pagination
                style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translate(-50%)",
                }}
                secondary
                pointing
                disabled={loading}
                defaultActivePage={1}
                totalPages={pageCount}
                onPageChange={(e, { activePage }) => {
                    setLoading(true);
                    setPage(activePage);
                    populateData();
                }}
            />
        </div>
    );
};

export default Fornecedores;
