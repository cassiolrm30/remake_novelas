const Usuario       = require("../models/Usuario");
const Pessoa        = require("../models/Pessoa");
const ENUMS         = require("../constants/ENUMS");
const MENSAGENS     = require("../constants/messages");
const mongoose      = require("mongoose");
const pessoaService = require("../services/pessoaService");

async function getAll()
{
    return await Usuario.find().populate("pessoa");
}

async function get(_id)
{
    const registro = await Usuario.findById(_id).populate("pessoa");
    if (!registro) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
    return registro;
}

async function save(dados)
{
    const session = await mongoose.startSession();
    let resultado, registro, filtroLogin, filtroEmail;

    try
    {
        // Validações
        if (dados.login == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Login")); }
        if (dados.email == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("E-mail")); }
        if (dados.senha == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Senha")); }
        if (dados.perfil == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Perfil")); }
        if (!Object.values(ENUMS.PERFIL_USUARIO).includes(dados.perfil)) { throw new Error(MENSAGENS.USUARIO.PERFIL_INVALID); }

        await session.withTransaction(async () =>
        {
            if (!dados._id)
            {
                filtroLogin = { login: dados.login };
                filtroEmail = { email: dados.email };
                registro = new Usuario();
            }
            else
            {
                filtroLogin = { login: dados.login, _id: { $ne: dados._id } };
                filtroEmail = { email: dados.email, _id: { $ne: dados._id } };
                registro = await Usuario.findById(dados._id).session(session);
            }
            
            const loginExistente = await Usuario.findOne(filtroLogin).session(session);
            if (loginExistente != null) { throw new Error(MENSAGENS.USUARIO.LOGIN_DUPLICATE); }

            const emailExistente = await Usuario.findOne(filtroEmail).session(session);
            if (emailExistente != null) { throw new Error(MENSAGENS.USUARIO.EMAIL_DUPLICATE); }

            const _pessoaService = await pessoaService.save(dados.pessoa, session);
            if (_pessoaService.resultado == null) { throw new Error(_pessoaService.message); }
           
            registro.pessoa = _pessoaService.resultado._id;
            registro.login  = dados.login;
            registro.email  = dados.email;
            registro.senha  = dados.senha;
            registro.perfil = dados.perfil;
            registro.ativo  = dados.ativo;
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

async function remove(_id)
{
    const session = await mongoose.startSession();

    try
    {
        let usuario;

        await session.withTransaction(async () =>
        {
            usuario = await Usuario.findById(_id).session(session);
            if (!usuario) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

            // excluindo a pessoa associada ao usuário
            const resultadoPessoa = await pessoaService.remove(usuario.pessoa, session);
            if (!resultadoPessoa.resultado) { throw new Error(resultadoPessoa.message); }

            // excluindo o usuário
            await Usuario.findByIdAndDelete(_id, { session });
        });

        return { status: 200, message: MENSAGENS.SUCCESS.DELETED, resultado: usuario };
    }
    finally
    {
        await session.endSession();
    }
}

module.exports = { getAll, get, save, remove };