const Novela           = require("../models/Novela");
const Personagem       = require("../models/Personagem");
const VersaoPersonagem = require("../models/VersaoPersonagem");
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
        let personagem;

        if (!dados._id)
            personagem = new VersaoPersonagem();
        else
        {
            personagem = await VersaoPersonagem.findById(dados._id).session(session);
            if (!personagem) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
        }

        personagem.genero               = dados.genero;
        personagem.etnia                = dados.etnia;
        personagem.faixaEtaria          = dados.faixaEtaria;
        personagem.faixaPeso            = dados.faixaPeso;
        personagem.faixaEstatura        = dados.faixaEstatura;
        personagem.generoObrig          = dados.generoObrig;
        personagem.etniaObrig           = dados.etniaObrig;
        personagem.faixaEtariaObrig     = dados.faixaEtariaObrig;
        personagem.faixaPesoObrig       = dados.faixaPesoObrig;
        personagem.faixaEstaturaObrig   = dados.faixaEstaturaObrig;
        personagem.versaoNovelaOriginal = dados.versaoNovelaOriginal;
        personagem.personagemOriginal   = dados.personagemOriginal;

        await personagem.save({ session });

        // localiza a novela
        const novela = await VersaoNovela.findById(personagem.novelaOriginal).session(session);
        if (!novela) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

        // verifica se o personagem já está vinculado
        await VersaoNovela.updateOne
                     (
                        { _id: personagem.versaoNovelaOriginal },
                        { $addToSet: { personagens: personagem._id } },
                        { session }
                     );

        return personagem;
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
    let personagem;
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
            { $pull: { personagens: personagem._id } }
        );

        if (session) { queryUpdateVersaoNovela.session(session); }

        await queryUpdateVersaoNovela;

        return versao;
    };

    // já existe uma transação externa
    if (session)
    {
        personagem = await executar();
        return { status: 200, message: MENSAGENS.SUCCESS.DELETED, resultado: personagem };
    }

    // caso a sessão não exista, cria-se uma nova
    const novaSession = await mongoose.startSession();

    try
    {
        await novaSession.withTransaction(async () =>
        {
            personagem = await executar();
        });

        return { status: 200, message: MENSAGENS.SUCCESS.DELETED, resultado: personagem };
    }
    finally
    {
        await novaSession.endSession();
    }
}

module.exports = { getAll, get, save, remove };