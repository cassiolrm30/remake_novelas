const Emissora  = require("../models/Emissora");
const MENSAGENS = require("../constants/messages");
const mongoose  = require("mongoose");

async function getAll()
{
    const registros = await Emissora.find();
    const resultado = registros.map(registro =>
    ({
        _id: registro._id,
        nome: registro.nome,
        sigla: registro.sigla,
        pais: registro.pais,
        anoFundacao: registro.anoFundacao,
        anoEncerramento: registro.anoEncerramento
    }));

    return resultado;
}

async function get(_id)
{
    const registro = await Emissora.findById(_id);
    if (!registro) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

    const resultado = new Ator
    ({
        _id: registro._id,
        nome: registro.nome,
        sigla: registro.sigla,
        pais: registro.pais,
        anoFundacao: registro.anoFundacao,
        anoEncerramento: registro.anoEncerramento
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
        if (dados.nome == "")        { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Nome")); }
        if (dados.sigla == "")       { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Sigla")); }
        if (dados.pais == "")        { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("País")); }
        if (dados.anoFundacao == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Ano de Fundação")); }
        if (dados.anoEncerramento != null && (parseInt(dados.anoEncerramento) < parseInt(dados.anoFundacao)))
            throw new Error(MENSAGENS.COMMON.INVALID_RANGE("Ano de Fundação", "Ano de Encerramento"));

        await session.withTransaction(async () =>
        {
            const nomeExistente = await Emissora.findOne({ nomeArtistico: dados.nome }).session(session);
            if (nomeExistente != null) { throw new Error(MENSAGENS.EMISSORA.NOME_DUPLICATE); }

            const siglaExistente = await Emissora.findOne({ nomeArtistico: dados.sigla }).session(session);
            if (siglaExistente != null) { throw new Error(MENSAGENS.EMISSORA.SIGLA_DUPLICATE); }

            registro                 = (!dados._id) ? new Emissora() : await Emissora.findById(dados._id).session(session);
            registro.nome            = dados.nome;
            registro.sigla           = dados.sigla;
            registro.pais            = dados.pais;
            registro.anoFundacao     = dados.anoFundacao;
            registro.anoEncerramento = dados.anoEncerramento;
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
    /*let mensagem = "";
    const qtVersoesNovelas = (await VersaoNovela.find({ 'ator.id': parseInt(req.params.id) })).length;
    if (qtVersoesNovelas > 0)
        mensagem = "Não é possível a exclusão, pois há " + qtVersoesNovelas + " remakes vinculados.";
    else
    {*/
    const registro = await Emissora.findByIdAndDelete(_id);
    if (!registro) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

    return { message: MENSAGENS.SUCCESS.DELETED, resultado: registro };
    //}
}

module.exports = { getAll, get, save, remove };