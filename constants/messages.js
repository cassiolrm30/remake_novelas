module.exports =
{
    SUCCESS:
    {
        SAVED: "Dados salvos com sucesso.",
        DELETED: "Dados excluídos com sucesso."
    },

    COMMON:
    {
        NOT_FOUND: "Registro não encontrado.",
        REQUIRED_FIELD: campo => `${campo} obrigatório.`,
        INVALID_RANGE: (campoInicial, campoFinal) => `${campoInicial} não deve ser maior que ${campoFinal}.`,
        DIFFERENT: (campo1, campo2) => `${campo1} deve ser diferente de ${campo2}.`,
        EQUAL: (campo1, campo2) => `${campo1} deve ser igual a ${campo2}.`,
        DELETE_DEPENDENCY: "É necessário excluir primeiro os registros dependentes."
    },

    ATOR:
    {
        NOME_ARTISTICO_DUPLICATE: "Nome artístico já cadastrado.",
        DRT_DUPLICATE: "DRT já cadastrado.",
        DRT_INVALID: "DRT inválido."
    },

    AUTOR:
    {
        NOME_ARTISTICO_DUPLICATE: "Nome artístico já cadastrado."
    },

    EMISSORA:
    {
        NOME_DUPLICATE: "Nome já cadastrado.",
        SIGLA_DUPLICATE: "Sigla já cadastrado."
    },

    PESSOA:
    {
        CPF_DUPLICATE: "CPF já cadastrado.",
        FAIXA_ETARIA_INVALID: "Faixa etária não correspondente à idade informada.",
        DRT_DUPLICATE: "DRT já cadastrado.",
        DRT_INVALID: "DRT inválido."
    },

    PERSONAGEM:
    {
    },

    USUARIO:
    {
        LOGIN_DUPLICATE: "Login já cadastrado.",
        EMAIL_DUPLICATE: "E-mail já cadastrado.",
        PERFIL_INVALID: "Perfil inválido."
    },

    NOVELA:
    {
        TITLE_DUPLICATE: "Título já cadastrado."
    }
};