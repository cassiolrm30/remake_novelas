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
    const registro = await Novela.findById(_id).populate("personagens").populate("versoes");
    if (!registro) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
    return registro;
}

async function save(dados, session = null)
{
	// Validações
	if (dados.titulo == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Título")); }
	if (dados.sinopseConceitual == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Sinopse Conceitual")); }

	const executar = async () =>
    {
        let novela;

        if (!dados._id)
            novela = new Novela();
        else
        {
            novela = await Novela.findById(dados._id).session(session);
            if (!novela) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
            
            // exclui os personagens antigos da novela, verificando antes se "session" existe
            novela.personagens = [];
            const queryDeletePersonagens = Personagem.deleteMany({ novelaOriginal: novela._id });
            if (session) { queryDeletePersonagens.session(session); }
            await queryDeletePersonagens;
        }

        // Validações
        const filtroTitulo = { titulo: dados.titulo };
        if (dados._id) { filtroTitulo._id = { $ne: dados._id }; }
        const tituloExistente = await Novela.findOne(filtroTitulo).session(session);
        if (tituloExistente != null) { throw new Error(MENSAGENS.NOVELA.TITLE_DUPLICATE); }

        const filtroSinopseConceitual = { sinopseConceitual: dados.sinopseConceitual };
        if (dados._id) { filtroSinopseConceitual._id = { $ne: dados._id }; }
        const sinopseConceitualExistente = await Novela.findOne(filtroSinopseConceitual).session(session);
        if (sinopseConceitualExistente != null) { throw new Error(MENSAGENS.NOVELA.SYNOPSIS_DUPLICATE); }

        novela.titulo            = dados.titulo;
        novela.sinopseConceitual = dados.sinopseConceitual;

        // salva a novela
        await novela.save({ session });

        // salva os personagens
        const _personagens = [...new Set(dados.personagens)]; // elimina itens repetidos
        for (const item of _personagens)
        {
            const _dados = item.split('|');
            const personagem = new Personagem
                               ({
                                    nomeOriginal: _dados[0],
                                    descricaoOriginal: _dados[1],
                                    novelaOriginal: novela._id,
                                    versoes: []
                               });
            await personagem.save({ session });
            novela.personagens.push(personagem._id);
        }
        // atualiza o array de personagens da novela
        await novela.save({ session });

        return novela;
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
    let novela;
    const executar = async () =>
    {
        // localiza a novela, verificando antes se "session" existe
        const queryFindNovela = Novela.findById(_id);
        if (session) { queryFindNovela.session(session); }

        const novela = await queryFindNovela;
        if (!novela) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
        
        // exclui as versões da novela e seus respectivos personagens, verificando antes se "session" existe
        const queryFindVersoes = VersaoNovela.find({ novelaOriginal: _id });
        if (session) { queryFindVersoes.session(session); }
        const versoes = queryFindVersoes;

        for (const versao of versoes)
        {
            // exclui os personagens da versão de novela, verificando antes se "session" existe
            const queryDeleteVersoesPersonagens = VersaoPersonagem.deleteMany({ versaoNovelaOriginal: versao._id });
            if (session) { queryDeleteVersoesPersonagens.session(session); }
            await queryDeleteVersoesPersonagens;
    
            // exclui a versão de novela, verificando antes se "session" existe
            const queryDeleteVersaoNovela = VersaoNovela.deleteOne({ _id: versao._id });
            if (session) { queryDeleteVersaoNovela.session(session); }
            await queryDeleteVersaoNovela;
        }

        // exclui os personagens da novela, verificando antes se "session" existe
        const queryDeletePersonagens = Personagem.deleteMany({ novelaOriginal: novela._id });
        if (session) { queryDeletePersonagens.session(session); }
        await queryDeletePersonagens;

        // exclui a novela, verificando antes se "session" existe
        const queryDeleteNovela = Novela.deleteOne({ _id: novela._id });
        if (session) { queryDeleteNovela.session(session); }
        await queryDeleteNovela;

        return novela;
    }

    // já existe uma transação externa
    if (session)
    {
        novela = await executar();
        return { status: 200, message: MENSAGENS.SUCCESS.DELETED, resultado: novela };
    }

    // caso a sessão não exista, cria-se uma nova
    const novaSession = await mongoose.startSession();

    try
    {
        await novaSession.withTransaction(async () =>
        {
            novela = await executar();
        });

        return { status: 200, message: MENSAGENS.SUCCESS.DELETED, resultado: novela };
    }
    finally
    {
        await novaSession.endSession();
    }
}

module.exports = { getAll, get, save, remove };