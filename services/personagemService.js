const Novela           = require("../models/Novela");
const Personagem       = require("../models/Personagem");
const VersaoPersonagem = require("../models/VersaoPersonagem");
const MENSAGENS        = require("../constants/messages");
const mongoose         = require("mongoose");

async function getAll()
{
    return await Personagem.find().populate("novelaOriginal").populate("versoes");
}

async function get(_id)
{
    const registro = await Personagem.findById(_id).populate("novelaOriginal").populate("versoes");
    if (!registro) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
    return registro;
}

async function save(dados, session = null)
{
    const executar = async () =>
    {
        let personagem;

        if (!dados._id)
            personagem = new Personagem();
        else
        {
            personagem = await Personagem.findById(dados._id).session(session);
            if (!personagem) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
        }

        personagem.nomeOriginal      = dados.nomeOriginal;
        personagem.descricaoOriginal = dados.descricaoOriginal;
        personagem.novelaOriginal    = dados.novelaOriginal;

        await personagem.save({ session });

        // localiza a novela
        const novela = await Novela.findById(personagem.novelaOriginal).session(session);
        if (!novela) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

        // verifica se o personagem já está vinculado
        await Novela.updateOne (
                                    { _id: personagem.novelaOriginal },
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
        const queryFindPersonagem = Personagem.findById(_id);
        if (session) { queryFindPersonagem.session(session); }

        const personagem = await queryFindPersonagem;
        if (!personagem) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

        // localiza a novela original, verificando antes se "session" existe
        const queryFindNovela = Novela.findById(personagem.novelaOriginal);
        if (session) { queryFindNovela.session(session); }

        const novela = await queryFindNovela;
        if (!novela) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

        // exclui as versões do personagem, verificando antes se "session" existe
        const queryDeleteVersaoPersonagem = VersaoPersonagem.deleteMany({ personagemOriginal: personagem._id });
        if (session) { queryDeleteVersaoPersonagem.session(session); }
        await queryDeleteVersaoPersonagem;

        // exclui o personagem, verificando antes se "session" existe
        const queryDeletePersonagem = Personagem.deleteOne({ _id: personagem._id });
        if (session) { queryDeletePersonagem.session(session); }
        await queryDeletePersonagem;

        // desassocia o personagem da novela, verificando antes se "session" existe
        const queryUpdateNovela = Novela.updateOne
        (
            { _id: novela._id },
            { $pull: { personagens: personagem._id } }
        );

        if (session) { queryUpdateNovela.session(session); }

        await queryUpdateNovela;

        return personagem;
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

/*async function removeByNovela(_id, session = null)
{
    let resultado = [];
    let query = Novela.findByIdAndDelete(_id);
    if (session) { query = query.session(session); } // verificando antes se "session" existe

    // excluindo os personagens da novela
    for (let i = 0; i < novela.personagens.length; i++)
    {
        const _personagem = novela.personagens[i];
        resultado.push(_personagem.nomeOriginal);
        const resultadoPersonagem = remove(_personagem._id, session);
        if (!resultadoPersonagem.resultado) { throw new Error(resultadoPersonagem.message); }
    }

    // excluindo a novela selecionada
    const registro = await query;
    if (!registro) { return { message: MENSAGENS.COMMON.NOT_FOUND, resultado: null }; }

    return { message: MENSAGENS.SUCCESS.DELETED, resultado: registro };
}*/

module.exports = { getAll, get, save, remove };