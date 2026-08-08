const Novela     = require("../models/Novela");
const Personagem = require("../models/Personagem");
const MENSAGENS  = require("../constants/messages");
const mongoose   = require("mongoose");

async function getAll()
{
    const registros = await Personagem.find();
    const resultado = registros.map(registro =>
    ({
        _id: registro._id,
        nomeOriginal: registro.nomeOriginal,
        descricaoOriginal: registro.descricaoOriginal,
        novelaOriginal: registro.novelaOriginal,
        versoes: registro.versoes
    }));

    return resultado;
}

async function get(_id)
{
    const registro = await Personagem.findById(_id);
    if (!registro) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

    const resultado = new Personagem
    ({
        _id: registro._id,
        nomeOriginal: registro.nomeOriginal,
        descricaoOriginal: registro.descricaoOriginal,
        novelaOriginal: registro.novelaOriginal,
        versoes: registro.versoes
    });

    return registro;
}

async function save(dados)
{
    const session = await mongoose.startSession();
    let resultado, registro;

    try
    {
        // Validações
        if (dados.nome == "")  { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Nome")); }
        if (dados.sigla == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Sigla")); }

        await session.withTransaction(async () =>
        {
            const _novelaOriginal = await Novela.findById(dados.novelaId).session(session);
            if (_novelaOriginal == null) { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Novela Original")); }

            registro                   = (!dados._id) ? new Personagem() : await Personagem.findById(dados._id).session(session);
            registro.nomeOriginal      = dados.nomeOriginal;
            registro.descricaoOriginal = dados.descricaoOriginal;
            registro.novelaOriginal    = _novelaOriginal;
            registro.versoes           = dados.versoes;
            await registro.save({ session });

            resultado = { status: 201, message: MENSAGENS.SUCCESS.SAVED, resultado: registro };
        });
    }
    catch (err)
    {
        resultado = { status: 400, message: err.message, resultado: null };
    }
    finally
    {
        await session.endSession();
    }

    return resultado;
}

async function remove(_id, session = null)
{
    let novela = Personagem.findByIdAndDelete(_id);
    if (session) { novela = novela.session(session); } // verificando antes se "session" existe

    // excluindo as versões do personagem
    //const resultadoVersoes = await versaoService.remove(personagem.versoes, session);
    //if (!resultadoVersoes.resultado) { throw new Error(resultadoVersoes.message); }

    // excluindo o personagem
    const registro = await novela;
    if (!registro) { return { message: MENSAGENS.COMMON.NOT_FOUND, resultado: null }; }

    return { message: MENSAGENS.SUCCESS.DELETED, resultado: registro };
}

async function removeByNovela(_id, session = null)
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
}

module.exports = { getAll, get, save, remove };