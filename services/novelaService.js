const Novela            = require("../models/Novela");
const Personagem        = require("../models/Personagem");
const MENSAGENS         = require("../constants/messages");
const mongoose          = require("mongoose");
const personagemService = require("../services/personagemService");

async function getAll()
{
    return await Novela.find().populate("personagens").populate("versoes");
}

async function get(_id)
{
    const registro = await Novela.findById(req.params.id).populate("personagens").populate("versoes");
    if (!registro) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
    return registro;
}

async function save(dados)
{
    const session = await mongoose.startSession();
    let resultado, registro;

    try
    {
        // Validações
        if (dados.titulo == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Título")); }
        if (dados.sinopseConceitual == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Sinopse Conceitual")); }

        await session.withTransaction(async () =>
        {
            const tituloExistente = await Novela.findOne({ titulo: dados.titulo }).session(session);
            if (tituloExistente != null) { throw new Error(MENSAGENS.NOVELA.TITLE_DUPLICATE); }
 
            const sinopseConceitualExistente = await Novela.findOne({ sinopseConceitual: dados.sinopseConceitual }).session(session);
            if (sinopseConceitualExistente != null) { throw new Error(MENSAGENS.NOVELA.TITLE_DUPLICATE); }
 
            registro                   = (!dados._id) ? new Novela() : await registro.findById(dados._id).session(session);
            registro.titulo            = dados.titulo;
            registro.sinopseConceitual = dados.sinopseConceitual;
            registro.personagens       = [];
            await registro.save({ session });

            for (let i = 0; i < dados.personagens.length; i++) // Parei aqui
            {
                const _personagem = dados.personagens[i];
                const _personagemService = await personagemService.save(_personagem, session);
                if (_personagemService.resultado == null) { throw new Error(_pessoaService.message); }
            }

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

async function remove(_id)
{
    const session = await mongoose.startSession();

    try
    {
        let novela;

        await session.withTransaction(async () =>
        {
            novela = await Novela.findById(_id).session(session);
            if (!novela) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

            // excluindo os personagens associados à novela
            const resultadoPersonagens = await personagemService.removeByNovela(_id, session);
            if (!resultadoPersonagens.resultado) { throw new Error(resultadoPersonagens.message); }

            // excluindo a novela
            await Novela.remove(_id, session);
        });

        return { status: 200, message: MENSAGENS.SUCCESS.DELETED, resultado: novela };
    }
    finally
    {
        await session.endSession();
    }
}

module.exports = { getAll, get, save, remove };