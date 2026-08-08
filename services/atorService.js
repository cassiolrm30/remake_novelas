const Ator          = require("../models/Ator");
const Pessoa        = require("../models/Pessoa");
const MENSAGENS     = require("../constants/messages");
const mongoose      = require("mongoose");
const pessoaService = require("../services/pessoaService");

async function getAll()
{
    return await Ator.find().populate("pessoa").populate("versoesNovelas");
}

async function get(_id)
{
    const registro = await Ator.findById(_id).populate("pessoa").populate("versoesNovelas");
    if (!registro) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
    return registro;
}

async function save(dados)
{
    const session = await mongoose.startSession();
    let resultado, registro, filtroDRT, filtroNomeArtistico;

    try
    {
        // Validações
        if (dados.DRT == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("DRT")); }
        if (dados.nomeArtistico == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Nome Artístico")); }

        await session.withTransaction(async () =>
        {
            if (!dados._id)
            {
                registro = new Ator();
                filtroDRT = { DRT: dados.DRT };
                filtroNomeArtistico = { nomeArtistico: dados.nomeArtistico };
            }
            else
            {
                registro = await Ator.findById(dados._id).session(session);
                filtroDRT = { DRT: dados.DRT, _id: { $ne: dados._id } };
                filtroNomeArtistico = { nomeArtistico: dados.nomeArtistico, _id: { $ne: dados._id } };
            }
            
            const nomeArtisticoExistente = await Ator.findOne(filtroNomeArtistico).session(session);
            if (nomeArtisticoExistente != null) { throw new Error(MENSAGENS.ATOR.NOME_ARTISTICO_DUPLICATE); }

            const DRTExistente = await Ator.findOne(filtroDRT).session(session);
            if (DRTExistente != null) { throw new Error(MENSAGENS.ATOR.DRT_DUPLICATE); }

            //if (false) { throw new Error(MENSAGENS.COMMON.DRT_INVALID); }

            // inclusão/atualização do documento "pessoa"
            const _pessoaService = await pessoaService.save(dados.pessoa, session);
            if (_pessoaService.resultado == null) { throw new Error(_pessoaService.message); }
           
            // inclusão/atualização do documento "ator"
            registro.pessoa         = _pessoaService.resultado._id;
            registro.DRT            = dados.DRT;
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
        let ator;

        await session.withTransaction(async () =>
        {
            ator = await Ator.findById(_id).session(session);
            if (!ator) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

            // excluindo a pessoa associada ao ator
            const resultadoPessoa = await pessoaService.remove(ator.pessoa, session);
            if (!resultadoPessoa.resultado) { throw new Error(resultadoPessoa.message); }

            // excluindo o ator
            await Ator.findByIdAndDelete(_id, { session });
        });

        return { status: 200, message: MENSAGENS.SUCCESS.DELETED, resultado: ator };
    }
    finally
    {
        await session.endSession();
    }
}

module.exports = { getAll, get, save, remove };