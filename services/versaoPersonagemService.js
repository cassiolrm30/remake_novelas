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

        resultado.genero               = dados.genero;
        resultado.etnia                = dados.etnia;
        resultado.faixaEtaria          = dados.faixaEtaria;
        resultado.faixaPeso            = dados.faixaPeso;
        resultado.faixaEstatura        = dados.faixaEstatura;
        resultado.generoObrig          = dados.generoObrig;
        resultado.etniaObrig           = dados.etniaObrig;
        resultado.faixaEtariaObrig     = dados.faixaEtariaObrig;
        resultado.faixaPesoObrig       = dados.faixaPesoObrig;
        resultado.faixaEstaturaObrig   = dados.faixaEstaturaObrig;
        resultado.versaoNovelaOriginal = dados.versaoNovelaOriginal;
        resultado.personagemOriginal   = dados.personagemOriginal;

        await resultado.save({ session });

        // localiza a novela
        const novela = await VersaoNovela.findById(resultado.versaoNovelaOriginal).session(session);
        if (!novela) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

        // verifica se o personagem já está vinculado
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
        const queryFindPersonagem = VersaoPersonagem.findById(_id);
        if (session) { queryFindPersonagem.session(session); }

        const versao = await queryFindPersonagem;
        if (!versao) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

        // localiza a versão de novela original, verificando antes se "session" existe
        const queryFindNovela = VersaoNovela.findById(versao.versaoNovelaOriginal);
        if (session) { queryFindNovela.session(session); }

        const novela = await queryFindNovela;
        if (!novela) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

        // exclui o personagem, verificando antes se "session" existe
        const queryDeleteVersaoPersonagem = VersaoPersonagem.deleteOne({ _id: versai._id });
        if (session) { queryDeleteVersaoPersonagem.session(session); }
        await queryDeleteVersaoPersonagem;

        // desassocia o personagem da novela, verificando antes se "session" existe
        const queryUpdateVersaoNovela = VersaoNovela.updateOne
        (
            { _id: VersaoNovela._id },
            { $pull: { personagens: resultado._id } }
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