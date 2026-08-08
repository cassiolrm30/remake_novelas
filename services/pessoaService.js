const ENUMS     = require("../constants/ENUMS");
const Pessoa    = require("../models/Pessoa");
const MENSAGENS = require("../constants/messages");
const mongoose  = require("mongoose");

async function getAll()
{
    return await Pessoa.find();
}

async function get(_id)
{
    const registro = await Pessoa.findById(_id);
    if (!registro) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
    return registro;
}

async function save(dados, session = null)
{
    let resultado, registro;

    try
    {
        // Validações
        if (dados.CPF            == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("CPF")); }
        if (dados.nomeCompleto   == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Nome Completo")); }
        if (dados.dataNascimento == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Data de Nascimento")); }
        if (dados.cidadeNatal    == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Cidade Natal")); }
        if (dados.UF             == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("UF")); }
        if (dados.genero         == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Gênero")); }
        if (dados.etnia          == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Etnia")); }
        if (dados.faixaEtaria    == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Faixa Etária")); }
        if (dados.faixaPeso      == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Faixa de Peso")); }
        if (dados.faixaEstatura  == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Faixa de Estatura")); }
        
        // Validação da unicidade do CPF
        const filtro = { CPF: dados.CPF };
        if (dados._id) { filtro._id = { $ne: dados._id }; }
        if (await Pessoa.findOne(filtro).session(session)) { throw new Error(MENSAGENS.PESSOA.CPF_DUPLICATE); }

        // Validação da faixa etária
        const faixaEtariaReal = await getFaixaEtaria(dados.dataNascimento, dados.dataFalecimento);
        if (dados.faixaEtaria != faixaEtariaReal.descricao) { throw new Error(MENSAGENS.PESSOA.FAIXA_ETARIA_INVALID); }

        if (!dados._id)
            registro = new Pessoa();
        else
        {
            registro = await Pessoa.findById(dados._id).session(session);
            if (!registro) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
        }

        registro.CPF             = dados.CPF;
        registro.nomeCompleto    = dados.nomeCompleto;
        registro.dataNascimento  = dados.dataNascimento;
        registro.dataFalecimento = dados.dataFalecimento;
        registro.cidadeNatal     = dados.cidadeNatal;
        registro.UF              = dados.UF;
        registro.genero          = dados.genero;
        registro.etnia           = dados.etnia;
        registro.faixaEtaria     = dados.faixaEtaria;
        registro.faixaPeso       = dados.faixaPeso;
        registro.faixaEstatura   = dados.faixaEstatura;
        registro.imagemFoto      = dados.imagemFoto;
        registro.imagemUpload    = dados.imagemUpload;
        await registro.save({ session });

        resultado = { status: 201, message: MENSAGENS.SUCCESS.SAVED, resultado: registro };
    }
    catch (err)
    {
        resultado = { status: 400, message: err.message, resultado: null };
    }

    return resultado;
}

async function remove(_id, session = null)
{
    let query = Pessoa.findByIdAndDelete(_id);
    if (session) { query = query.session(session); } // verificando antes se "session" existe

    const registro = await query;
    if (!registro) { return { message: MENSAGENS.COMMON.NOT_FOUND, resultado: null }; }

    return { message: MENSAGENS.SUCCESS.DELETED, resultado: registro };
}

async function getIdade(dataNascimento, dataFalecimento = null)
{
    const nascimento = new Date(dataNascimento);
    const referencia = dataFalecimento ? new Date(dataFalecimento) : new Date();
    let idade = referencia.getFullYear() - nascimento.getFullYear();
    const mes = referencia.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && referencia.getDate() < nascimento.getDate())) { idade--; }
    return idade;
}

async function getFaixaEtaria(dataNascimento, dataFalecimento = null)
{
    const nascimento = new Date(dataNascimento);
    const referencia = dataFalecimento ? new Date(dataFalecimento) : new Date();
    let idade = referencia.getFullYear() - nascimento.getFullYear();
    const mes = referencia.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && referencia.getDate() < nascimento.getDate())) { idade--; }

    const faixaEtaria = Object.values(ENUMS.FAIXA_ETARIA).find(item => idade >= item.min && idade <= item.max);
    return faixaEtaria;
}

/*function validateFaixaEtariaOLD(faixaEtaria, dataNascimento, dataFalecimento = null)
{
    const idade = getIdade(dataNascimento, dataFalecimento);
    switch (faixaEtaria)
    {
        case FAIXA_ETARIA.ATE10:       return (idade <= 10);
        case FAIXA_ETARIA.ENTRE11_20:  return (idade >= 11 && idade <= 20);
        case FAIXA_ETARIA.ENTRE21_30:  return (idade >= 21 && idade <= 30);
        case FAIXA_ETARIA.ENTRE31_40:  return (idade >= 31 && idade <= 40);
        case FAIXA_ETARIA.ENTRE41_50:  return (idade >= 41 && idade <= 50);
        case FAIXA_ETARIA.ENTRE51_60:  return (idade >= 51 && idade <= 60);
        case FAIXA_ETARIA.ENTRE61_70:  return (idade >= 61 && idade <= 70);
        case FAIXA_ETARIA.ENTRE71_80:  return (idade >= 71 && idade <= 80);
        case FAIXA_ETARIA.ENTRE81_90:  return (idade >= 81 && idade <= 90);
        case FAIXA_ETARIA.ENTRE91_100: return (idade >= 91 && idade <= 100);
        default:                       return false;
    }
}*/
async function validateFaixaEtaria(faixaEtaria, dataNascimento, dataFalecimento = null)
{
    const faixaEtariaAtual = await getFaixaEtaria(dataNascimento, dataFalecimento);
    if (faixaEtariaAtual == null) return false;
    return (faixaEtaria == faixaEtariaAtual.descricao);
}

module.exports = { getAll, get, save, remove };