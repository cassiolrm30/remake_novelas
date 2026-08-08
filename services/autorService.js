const Autor         = require("../models/Autor");
const Pessoa        = require("../models/Pessoa");
const MENSAGENS     = require("../constants/messages");
const mongoose      = require("mongoose");
const pessoaService = require("../services/pessoaService");

async function getAll()
{
    return await Autor.find().populate("pessoa").populate("versoesNovelas");
}

async function get(_id)
{
    const registro = await Autor.findById(_id).populate("pessoa").populate("versoesNovelas");
    if (!registro) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
    return registro;
}

async function save(dados)
{
    const session = await mongoose.startSession();
    let resultado, registro, filtroNomeArtistico;

    try
    {
        // Validações
        if (dados.nomeArtistico == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Nome Artístico")); }

        await session.withTransaction(async () =>
        {
            if (!dados._id)
            {
                registro = new Autor();
                filtroNomeArtistico = { nomeArtistico: dados.nomeArtistico };
            }
            else
            {
                registro = await Autor.findById(dados._id).session(session);
                filtroNomeArtistico = { nomeArtistico: dados.nomeArtistico, _id: { $ne: dados._id } };
            }
            
            const nomeArtisticoExistente = await Autor.findOne(filtroNomeArtistico).session(session);
            if (nomeArtisticoExistente != null) { throw new Error(MENSAGENS.AUTOR.NOME_ARTISTICO_DUPLICATE); }

            // inclusão/atualização do documento "pessoa"
            const _pessoaService = await pessoaService.save(dados.pessoa, session);
            if (_pessoaService.resultado == null) { throw new Error(_pessoaService.message); }
           
            // inclusão/atualização do documento "autor"
            registro.pessoa         = _pessoaService.resultado._id;
            registro.nomeArtistico  = dados.nomeArtistico;
            registro.versoesNovelas = dados.versoesNovelas;
            await registro.save({ session });

            resultado = { status: 201, message: MENSAGENS.SUCCESS.SAVED, resultado: registro };
        });
    }
    catch (err)
    {
        let [ _status, _message ] = (err.code === 11000) ? [ 409, "Registro duplicado." ]: [ 400, err.message ];
        resultado = { status: _status, message: _message, resultado: null };
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
        let autor;

        await session.withTransaction(async () =>
        {
            autor = await Autor.findById(_id).session(session);
            if (!autor) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

            // excluindo a pessoa associada ao autor
            const resultadoPessoa = await pessoaService.remove(autor.pessoa, session);
            if (!resultadoPessoa.resultado) { throw new Error(resultadoPessoa.message); }

            // excluindo o autor
            await Autor.findByIdAndDelete(_id, { session });
        });

        return { status: 200, message: MENSAGENS.SUCCESS.DELETED, resultado: autor };
    }
    finally
    {
        await session.endSession();
    }
}

module.exports = { getAll, get, save, remove };