import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import SemanticDatepicker from "react-semantic-ui-datepickers";
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css";
import "semantic-ui-css/semantic.min.css";
import moment from "moment";
import {
    Grid,
    Radio,
    Segment,
    Modal,
    Label,
    Button,
    Form,
    Message,
    Icon,
} from "semantic-ui-react";
import { cpf, cnpj } from "cpf-cnpj-validator";
import MultipleValueTextInput from "react-multivalue-text-input";
import "./Fornecedores.css";

const UFs = [
    "RO",
    "AC",
    "AM",
    "RR",
    "PA",
    "AP",
    "TO",
    "MA",
    "PI",
    "CE",
    "RN",
    "PB",
    "PE",
    "AL",
    "SE",
    "BA",
    "MG",
    "ES",
    "RJ",
    "SP",
    "PR",
    "SC",
    "RS",
    "MS",
    "MT",
    "GO",
    "DF",
];

const CadastroDeFornecedor = () => {
    let { id } = useParams();

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");

    const [nomeError, setNomeError] = useState(undefined);
    const [dataDeNascimentoError, setDataDeNascimentoError] = useState(undefined);
    const [empresaError, setEmpresaError] = useState(undefined);
    const [cnpjCpfError, setCnpjCpfError] = useState(undefined);
    const [rgError, setRgError] = useState(undefined);

    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(id !== undefined);

    const [empresas, setEmpresas] = useState([]);

    const [dataDeCadastro, setDataDeCadastro] = useState(undefined);

    const [nome, setNome] = useState("");
    const onChangeNome = (event, data) => {
        setNome(data.value);
        setNomeError(undefined);
    };

    const [pessoaFisica, setPessoaFisica] = useState(true);
    const onChangeToPessoaFisica = (event, data) => {
        setPessoaFisica(true);
    };

    const onChangeToPessoaJuridica = (event, data) => {
        setPessoaFisica(false);
    };

    const [empresa, setEmpresa] = useState(undefined);
    const onChangeEmpresa = (event, data) => {
        setEmpresa(data.value);
        setEmpresaError(undefined);
    };

    const [dataDeNascimento, setDataDeNascimento] = useState(undefined);
    const onChangeDataDeNascimento = (event, data) => {
        setDataDeNascimento(data.value);
        setDataDeNascimentoError(undefined);
    };

    const [cnpjCpf, setCnpjCpf] = useState("");
    const onChangeCnpjCpf = (event, data) => {
        setCnpjCpf(data.value);
        setCnpjCpfError(undefined);
    };

    const [rg, setRg] = useState("");
    const onChangeRg = (event, data) => {
        setRg(data.value);
        setRgError(undefined);
    };

    const [telefones, setTelefones] = useState([]);

    const [cadastroDeEmpresaOpen, setCadastroDeEmpresaOpen] = useState(false);

    const [successMessageEmpresa, setSuccessMessageEmpresa] = useState("");
    const [errorMessageEmpresa, setErrorMessageEmpresa] = useState("");
    const [warningMessageEmpresa, setWarningMessageEmpresa] = useState("");

    const [empresaId, setEmpresaId] = useState(undefined);
    const [loadingEmpresa, setLoadingEmpresa] = useState(false);
    const [editingEmpresa, setEditingEmpresa] = useState(false);

    const [empresaCnpjError, setEmpresaCnpjError] = useState(undefined);
    const [empresaCnpj, setEmpresaCnpj] = useState("");
    const onChangeEmpresaCnpj = (event, data) => {
        setEmpresaCnpj(data.value);
        setEmpresaCnpjError(undefined);
    };

    const [empresaNomeFantasiaError, setEmpresaNomeFantasiaError] =
        useState(undefined);
    const [empresaNomeFantasia, setEmpresaNomeFantasia] = useState("");
    const onChangeEmpresaNomeFantasia = (event, data) => {
        setEmpresaNomeFantasia(data.value);
        setEmpresaNomeFantasiaError(undefined);
    };

    const [empresaUfError, setEmpresaUfError] = useState(undefined);
    const [empresaUf, setEmpresaUf] = useState("");
    const onChangeEmpresaUf = (event, data) => {
        setEmpresaUf(data.value);
        setEmpresaUfError(undefined);
    };

    useEffect(() => {
        setLoading(true);
        if (editing) {
            populateData(id);
        }
        populateDropdown();
    }, []);

    const postData = () => {
        setLoading(true);
        var dataIsValid = true;

        if (!nome || nome.length === 0) {
            clearMessages();
            setNomeError("O nome do fornecedor não pode ser vazio.");
            dataIsValid = false;
        }

        if (!empresa) {
            clearMessages();
            setEmpresaError("É necessário selecionar uma empresa.");
            dataIsValid = false;
        }

        if (pessoaFisica && !dataDeNascimento) {
            clearMessages();
            setDataDeNascimentoError("A data de nascimento não pode ser vazia.");
            dataIsValid = false;
        }

        if (
            pessoaFisica &&
            dataDeNascimento &&
            empresa &&
            empresas.find((emp) => emp.id === empresa).uf === "SC" &&
            moment(new Date()).diff(dataDeNascimento, "years") < 18
        ) {
            clearMessages();
            setEmpresaError(
                "Em empresas de SC, o fornecedor deve ter mais de 18 anos."
            );
            dataIsValid = false;
        }

        if (pessoaFisica && !cpf.isValid(cnpjCpf)) {
            clearMessages();
            setCnpjCpfError("CPF inválido.");
            dataIsValid = false;
        }

        if (!pessoaFisica && !cnpj.isValid(cnpjCpf)) {
            clearMessages();
            setCnpjCpfError("CNPJ inválido.");
            dataIsValid = false;
        }

        if (pessoaFisica && (!rg || rg.length === 0)) {
            clearMessages();
            setRgError("É necessário inserir o RG.");
            dataIsValid = false;
        }

        if (!dataIsValid) {
            setLoading(false);
            return;
        }

        var fornecedorToPost = {
            id: editing ? id : -2,
            empresaId: empresa,
            nome: nome,
            cpfOuCnpj: cnpjCpf,
            telefones: telefones.join("|"),
            dataDeCadastro: editing ? dataDeCadastro : new Date(),
            rg: "",
        };

        if (pessoaFisica) {
            fornecedorToPost.rg = rg;
            fornecedorToPost.dataDeNascimento = dataDeNascimento;
        }

        axios.post("/fornecedor", fornecedorToPost).then(
            (response) => {
                setSuccessMessage(
                    `Fornecedor ${nome} ${editing ? "editado" : "cadastrado"
                    } com sucesso!`
                );
                setWarningMessage("");
                setErrorMessage("");
                clearErrors();

                if (!editing) clearFields();

                setLoading(false);
            },
            (error) => {
                setSuccessMessage("");
                setWarningMessage("");
                setErrorMessage(
                    `Erro durante ${editing ? "edição" : "cadastro"
                    } do fornecedor! ${error}`
                );
                clearErrors();
                setLoading(false);
            }
        );
    };

    function clearFields() {
        setTelefones([]);
        setNome("");
        setEmpresa(undefined);
        setDataDeNascimento(undefined);
        setCnpjCpf("");
        setRg("");
        setDataDeCadastro(undefined);
    }

    function clearErrors() {
        setNomeError(undefined);
        setEmpresaError(undefined);
        setCnpjCpfError(undefined);
        setEmpresaError(undefined);
        setDataDeNascimentoError(undefined);
        setRgError(undefined);
    }

    function populateData(id) {
        axios.get(`/fornecedor/${id}`).then(
            (response) => {
                var fornecedor = response.data;
                setNome(fornecedor.nome);
                setEmpresa(fornecedor.empresaId);
                fornecedor.telefones.split("|").map((telefone) => {
                    if (telefone.length > 0) telefones.push(telefone);
                });
                setDataDeNascimento(moment(fornecedor.dataDeNascimento).toDate());
                setDataDeCadastro(moment(fornecedor.dataDeCadastro).toDate());
                setRg(fornecedor.rg);
                setCnpjCpf(fornecedor.cpfOuCnpj);
                setPessoaFisica(fornecedor.rg.length > 0);
                setLoading(false);
            },
            (error) => {
                setEditing(false);
                setLoading(false);
                setWarningMessage("Fornecedor nao encontrado.");
            }
        );
    }

    function populateDropdown() {
        axios.get(`/empresa/`).then(
            (response) => {
                setEmpresas(response.data);
                setLoading(false);
            },
            (error) => { }
        );
    }

    function clearMessages() {
        setSuccessMessage("");
        setWarningMessage("");
        setErrorMessage("");
    }

    function clearFieldsEmpresa() {
        setEmpresaNomeFantasia("");
        setEmpresaCnpj("");
        setEmpresaUf("");
    }

    function clearErrorsEmpresa() {
        setEmpresaNomeFantasiaError(undefined);
        setEmpresaCnpjError(undefined);
        setEmpresaUfError(undefined);
    }

    function clearMessagesEmpresa() {
        setSuccessMessageEmpresa("");
        setWarningMessageEmpresa("");
        setErrorMessageEmpresa("");
    }

    const postDataEmpresa = () => {
        setLoadingEmpresa(true);
        var dataIsValid = true;

        if (!empresaNomeFantasia || empresaNomeFantasia.length === 0) {
            clearMessagesEmpresa();
            setEmpresaNomeFantasiaError("O nome fantasia não pode ser vazio.");
            dataIsValid = false;
        }

        if (!empresaCnpj || !cnpj.isValid(empresaCnpj)) {
            clearMessagesEmpresa();
            setEmpresaCnpjError("CNPJ inválido.");
            dataIsValid = false;
        }

        if (!empresaUf) {
            clearMessagesEmpresa();
            setEmpresaUfError("O UF é obrigatório");
            dataIsValid = false;
        }

        if (!dataIsValid) {
            setLoadingEmpresa(false);
            return;
        }

        var empresaToPost = {
            id: editingEmpresa ? empresaId : -2,
            nomeFantasia: empresaNomeFantasia,
            cnpj: empresaCnpj,
            uf: empresaUf,
        };

        axios.post("/empresa", empresaToPost).then(
            (response) => {
                setSuccessMessage(
                    `Empresa ${empresaNomeFantasia} ${editingEmpresa ? "editada" : "cadastrada"
                    } com sucesso!`
                );
                setWarningMessageEmpresa("");
                setErrorMessageEmpresa("");
                clearErrorsEmpresa();

                if (!editingEmpresa) clearFieldsEmpresa();

                setLoadingEmpresa(false);
                setCadastroDeEmpresaOpen(false);
                populateDropdown();
            },
            (error) => {
                setSuccessMessageEmpresa("");
                setWarningMessageEmpresa("");
                setErrorMessageEmpresa(
                    `Erro durante ${editingEmpresa ? "edição" : "cadastro"
                    } da empresa! ${error}`
                );
                clearErrorsEmpresa();
                setLoadingEmpresa(false);
            }
        );
    };

    function deleteEmpresa(id, nome) {
        axios.delete(`/empresa/${id}`).then(
            (response) => {
                setSuccessMessage(`Empresa ${nome} excluida com sucesso!`);
                setErrorMessage("");
                populateDropdown();
            },
            (error) => {
                if (error.response.status == 501)
                    setErrorMessage(
                        `Empresa ${nome} não pode ser excluída por ter fornecedores associados a ela!`
                    );
                else setErrorMessage(`Erro ao excluir empresa ${nome} - ${error}.`);

                setSuccessMessage("");
            }
        );
    }

    function populateEmpresa(idEmpresa) {
        if (!idEmpresa) return;

        setLoadingEmpresa(true);
        axios.get(`/empresa/${idEmpresa}`).then(
            (response) => {
                var empresa = response.data;
                setEmpresaId(idEmpresa);
                setEmpresaNomeFantasia(empresa.nomeFantasia);
                setEmpresaUf(empresa.uf);
                setEmpresaCnpj(empresa.cnpj);
                setEditingEmpresa(true);
                setLoadingEmpresa(false);
            },
            (error) => {
                setEditingEmpresa(false);
                setLoadingEmpresa(false);
                setWarningMessageEmpresa("Empresa nao encontrada.");
            }
        );
    }

    function renderCadastroDeEmpresa() {
        return (
            <Modal
                onClose={() => {
                    setCadastroDeEmpresaOpen(false);
                    populateDropdown();
                }}
                onOpen={() => {
                    setCadastroDeEmpresaOpen(true);
                }}
                open={cadastroDeEmpresaOpen}
            >
                <Modal.Header>
                    {editingEmpresa ? "Edição" : "Cadastro"} de Empresa
                </Modal.Header>
                <Modal.Content>
                    <Form
                        success={successMessageEmpresa !== ""}
                        error={errorMessageEmpresa !== ""}
                        warning={warningMessageEmpresa !== ""}
                        loading={loadingEmpresa}
                    >
                        <Message success header={successMessageEmpresa} />
                        <Message error header={errorMessageEmpresa} />
                        <Message warning header={warningMessageEmpresa} />

                        <Form.Input
                            error={empresaNomeFantasiaError}
                            fluid
                            label="Nome Fantasia"
                            placeholder="Nome Fantasia"
                            onChange={onChangeEmpresaNomeFantasia}
                            value={empresaNomeFantasia}
                            maxLength="100"
                        />

                        <Form.Input
                            error={empresaCnpjError}
                            fluid
                            disabled={editingEmpresa}
                            label={"CNPJ"}
                            placeholder={"CNPJ"}
                            onChange={onChangeEmpresaCnpj}
                            value={empresaCnpj}
                            maxLength="100"
                        />

                        <Form.Dropdown
                            disabled={editingEmpresa}
                            error={empresaUfError}
                            label="UF"
                            placeholder="UF"
                            value={empresaUf ?? null}
                            onChange={onChangeEmpresaUf}
                            search
                            selection
                            options={UFs.map((uf, index) => ({
                                key: index,
                                text: uf,
                                value: uf,
                            }))}
                        />

                        <Button positive onClick={postDataEmpresa} type="submit">
                            Gravar
                        </Button>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }

    return (
        <>
            <Link
                to="/fornecedores"
                style={{ color: "inherit", textDecoration: "inherit" }}
            >
                <Icon name="arrow left" />
            </Link>
            <h1>{editing ? "Edição" : "Cadastro"} de Fornecedor</h1>
            {renderCadastroDeEmpresa()}
            <br />
            <Grid centered colums="2">
                <Segment textAlign="center" style={{ width: "35%" }}>
                    <Form
                        success={successMessage !== ""}
                        error={errorMessage !== ""}
                        warning={warningMessage !== ""}
                        loading={loading}
                    >
                        <Form.Field>
                            <Radio
                                label="Pessoa Física"
                                name="radioButtonsPessoaFisica"
                                checked={pessoaFisica}
                                onChange={onChangeToPessoaFisica}
                            />
                        </Form.Field>

                        <Form.Field>
                            <Radio
                                label="Pessoa Jurídica"
                                name="radioButtonsPessoaFisica"
                                checked={!pessoaFisica}
                                onChange={onChangeToPessoaJuridica}
                            />
                        </Form.Field>

                        <Form.Input
                            error={nomeError}
                            fluid
                            label="Nome"
                            placeholder="Nome"
                            onChange={onChangeNome}
                            value={nome}
                            maxLength="100"
                        />

                        <Form.Input
                            error={cnpjCpfError}
                            fluid
                            label={pessoaFisica ? "CPF" : "CNPJ"}
                            placeholder={pessoaFisica ? "CPF" : "CNPJ"}
                            onChange={onChangeCnpjCpf}
                            value={cnpjCpf}
                            maxLength="100"
                        />

                        <Form.Dropdown
                            error={empresaError}
                            label={
                                <>
                                    <b>Empresa</b>{" "}
                                    <Icon
                                        hidden={!empresa}
                                        name="trash"
                                        link
                                        onClick={() => {
                                            deleteEmpresa(
                                                empresa,
                                                empresas.find((emp) => emp.id === empresa).nomeFantasia
                                            );
                                        }}
                                    />{" "}
                                    <Icon
                                        hidden={!empresa}
                                        name="pencil"
                                        link
                                        onClick={() => {
                                            setEmpresaId(empresa);
                                            setEditingEmpresa(true);
                                            populateEmpresa(empresa);
                                            setCadastroDeEmpresaOpen(true);
                                        }}
                                    />{" "}
                                    <Icon
                                        name="plus"
                                        link
                                        onClick={() => {
                                            setLoadingEmpresa(true);
                                            setEditingEmpresa(false);
                                            clearFieldsEmpresa();
                                            setCadastroDeEmpresaOpen(true);
                                            setLoadingEmpresa(false);
                                        }}
                                    />
                                </>
                            }
                            placeholder="Empresa"
                            value={empresa ?? null}
                            onChange={onChangeEmpresa}
                            search
                            selection
                            options={empresas.map((empresa, index) => ({
                                key: empresa.id,
                                text: empresa.nomeFantasia,
                                value: empresa.id,
                            }))}
                        />

                        <Form.Field hidden={!pessoaFisica} error={dataDeNascimentoError}>
                            <label>Data de Nascimento</label>
                            <SemanticDatepicker
                                format="DD/MM/YYYY"
                                value={dataDeNascimento ?? null}
                                locale="pt-BR"
                                onChange={onChangeDataDeNascimento}
                            />
                            <br />
                            <Label
                                basic
                                color="red"
                                hidden={dataDeNascimentoError === undefined}
                                pointing="above"
                            >
                                {dataDeNascimentoError}
                            </Label>
                        </Form.Field>

                        <Form.Field hidden={!pessoaFisica}>
                            <Form.Input
                                error={rgError}
                                fluid
                                label="RG"
                                placeholder="RG"
                                onChange={onChangeRg}
                                value={rg}
                                maxLength="100"
                            />
                        </Form.Field>

                        <Form.Field>
                            <label>Telefones</label>
                            <MultipleValueTextInput
                                onItemAdded={(item, allItems) => setTelefones(allItems)}
                                onItemDeleted={(item, allItems) => setTelefones(allItems)}
                                values={telefones}
                                name="telefones"
                                placeholder="Separe os telefones com ENTER ou VÍRGULA"
                            />
                        </Form.Field>
                        <Message success header={successMessage} />
                        <Message error header={errorMessage} />
                        <Message warning header={warningMessage} />
                        <Button positive onClick={postData} type="submit">
                            Gravar
                        </Button>
                    </Form>
                </Segment>
            </Grid>
        </>
    );
};

export default CadastroDeFornecedor;
