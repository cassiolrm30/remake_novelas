const ENUMS            = require("../constants/ENUMS");
const VersaoPersonagem = require("../models/VersaoPersonagem");
const Personagem       = require("../models/Personagem");
const VersaoNovela     = require("../models/VersaoNovela");
const Novela           = require("../models/Novela");
const MENSAGENS        = require("../constants/messages");
const mongoose         = require("mongoose");

async function getAll()
{
    return await VersaoPersonagem.find().populate("versaoNovelaOriginal");
}

async function get(_id)
{
    const registro = await VersaoPersonagem.findById(_id).populate("versaoNovelaOriginal");
    if (!registro) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
    return registro;
}

async function save(dados, session = null)
{
    // Validações
    if (dados.personagemOriginal == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Personagem Original")); }
    if (dados.versaoNovelaOriginal == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Versão de Novela")); }

    const executar = async () =>
    {
        let resultado;

        if (!dados._id)
            resultado = new VersaoPersonagem();
        else
        {
            resultado = await VersaoPersonagem.findById(dados._id).session(session);
            if (!resultado) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
        }

        // Validações
        const genero        = Object.values(ENUMS.GENERO).find(item => item == dados.genero);
        if (!genero)        { throw new Error(MENSAGENS.COMMON.INEXISTENT_DATA("Gênero")); }
        const etnia         = Object.values(ENUMS.ETNIA).find(item => item == dados.etnia);
        if (!etnia)         { throw new Error(MENSAGENS.COMMON.INEXISTENT_DATA("Etnia")); }
        const faixaEtaria   = Object.values(ENUMS.FAIXA_ETARIA).find(item => item.descricao == dados.faixaEtaria);
        if (!faixaEtaria)   { throw new Error(MENSAGENS.COMMON.INEXISTENT_DATA("Faixa Etária")); }
        const faixaPeso     = Object.values(ENUMS.FAIXA_PESO).find(item => item.descricao == dados.faixaPeso);
        if (!faixaPeso)     { throw new Error(MENSAGENS.COMMON.INEXISTENT_DATA("Faixa de Peso")); }
        const faixaEstatura = Object.values(ENUMS.FAIXA_ESTATURA).find(item => item.descricao == dados.faixaEstatura);
        if (!faixaEstatura) { throw new Error(MENSAGENS.COMMON.INEXISTENT_DATA("Faixa de Estatura")); }
        const personagemOriginal = await Personagem.findById(dados.personagemOriginal).session(session);
        if (personagemOriginal == null)   { throw new Error(MENSAGENS.COMMON.NOT_FOUND.replace("Registro", "Personagem Original")); }
        const versaoNovelaOriginal = await VersaoNovela.findById(dados.versaoNovelaOriginal).session(session);
        if (versaoNovelaOriginal == null) { throw new Error(MENSAGENS.COMMON.NOT_FOUND.replace("Registro", "Versão de Novela")); }

        resultado.genero               = genero;
        resultado.etnia                = etnia;
        resultado.faixaEtaria          = faixaEtaria.descricao;
        resultado.faixaPeso            = faixaPeso.descricao;
        resultado.faixaEstatura        = faixaEstatura.descricao;
        resultado.generoObrig          = dados.generoObrig;
        resultado.etniaObrig           = dados.etniaObrig;
        resultado.faixaEtariaObrig     = dados.faixaEtariaObrig;
        resultado.faixaPesoObrig       = dados.faixaPesoObrig;
        resultado.faixaEstaturaObrig   = dados.faixaEstaturaObrig;
        resultado.personagemOriginal   = personagemOriginal;
        resultado.versaoNovelaOriginal = versaoNovelaOriginal;

        await resultado.save({ session });

        // localiza a novela
        const versaoNovela = await VersaoNovela.findById(resultado.versaoNovelaOriginal).session(session);
        if (!versaoNovela) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

        // verifica se o personagem já está vinculado
        await Personagem.updateOne
                     (
                        { _id: resultado.personagemOriginal },
                        { $addToSet: { versoes: resultado._id } },
                        { session }
                     );

        await VersaoNovela.updateOne
                     (
                        { _id: resultado.versaoNovelaOriginal },
                        { $addToSet: { personagens: resultado._id } },
                        { session }
                     );

        return resultado;
    };

    // caso a sessão já exista, a função anônima "executar()" é chamada e o método é encerrado
    if (session)
        return await executar();

    // caso a sessão não exista, cria-se uma nova
    const novaSession = await mongoose.startSession();

    try
    {
        let resultado;
        await novaSession.withTransaction(async () =>
        {
            resultado = await executar();
        });

        return { status: 201, message: MENSAGENS.SUCCESS.SAVED, resultado };
    }
    finally
    {
        await novaSession.endSession();
    }
}

async function remove(_id, session = null)
{
    let resultado;
    const executar = async () =>
    {
        // localiza o personagem, verificando antes se "session" existe
        const queryFindVersaoPersonagem = VersaoPersonagem.findById(_id);
        if (session) { queryFindVersaoPersonagem.session(session); }

        const versao = await queryFindVersaoPersonagem;
        if (!versao) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

        // localiza a versão de novela original, verificando antes se "session" existe
        const queryFindPersonagem = Personagem.findById(versao.personagemOriginal);
        if (session) { queryFindPersonagem.session(session); }

        const original = await queryFindPersonagem;
        if (!original) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

        const queryFindVersaoNovela = VersaoNovela.findById(versao.versaoNovelaOriginal);
        if (session) { queryFindVersaoNovela.session(session); }

        const versaoNovela = await queryFindVersaoNovela;
        if (!versaoNovela) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

        // exclui o personagem, verificando antes se "session" existe
        const queryDeleteVersaoPersonagem = VersaoPersonagem.deleteOne({ _id: versao._id });
        if (session) { queryDeleteVersaoPersonagem.session(session); }
        await queryDeleteVersaoPersonagem;

        // desassocia a versão do oeiginal, verificando antes se "session" existe
        const queryUpdatePersonagem = Personagem.updateOne
        (
            { _id: original._id },
            { $pull: { versoes: versao._id } }
        );
        if (session) { queryUpdatePersonagem.session(session); }
        await queryUpdatePersonagem;

        // desassocia a versão do personagem da novela, verificando antes se "session" existe
        const queryUpdateVersaoNovela = VersaoNovela.updateOne
        (
            { _id: versaoNovela._id },
            { $pull: { personagens: versao._id } }
        );
        if (session) { queryUpdateVersaoNovela.session(session); }
        await queryUpdateVersaoNovela;

        return versao;
    };

    // já existe uma transação externa
    if (session)
    {
        resultado = await executar();
        return { status: 200, message: MENSAGENS.SUCCESS.DELETED, resultado };
    }

    // caso a sessão não exista, cria-se uma nova
    const novaSession = await mongoose.startSession();

    try
    {
        await novaSession.withTransaction(async () =>
        {
            resultado = await executar();
        });

        return { status: 200, message: MENSAGENS.SUCCESS.DELETED, resultado };
    }
    finally
    {
        await novaSession.endSession();
    }
}

module.exports = { getAll, get, save, remove };