const Novela            = require("../models/Novela");
const VersaoNovela      = require("../models/VersaoNovela");
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
	if (dados.tituloOriginal == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Título Original")); }
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
        const filtroTituloOriginal = { tituloOriginal: dados.tituloOriginal };
        if (dados._id) { filtroTituloOriginal._id = { $ne: dados._id }; }
        const tituloOriginalExistente = await Novela.findOne(filtroTituloOriginal).session(session);
        if (tituloOriginalExistente != null) { throw new Error(MENSAGENS.NOVELA.TITLE_DUPLICATE); }

        const filtroSinopseConceitual = { sinopseConceitual: dados.sinopseConceitual };
        if (dados._id) { filtroSinopseConceitual._id = { $ne: dados._id }; }
        const sinopseConceitualExistente = await Novela.findOne(filtroSinopseConceitual).session(session);
        if (sinopseConceitualExistente != null) { throw new Error(MENSAGENS.NOVELA.SYNOPSIS_DUPLICATE); }

        novela.tituloOriginal     = dados.tituloOriginal;
        novela.sinopseConceitual  = dados.sinopseConceitual;
        novela.titulosProvisorios = dados.titulosProvisorios;

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
    const executar = async () =>
    {
        // ============================================================
        // 1. Localiza a novela
        // ============================================================
        const queryFindNovela = Novela.findById(_id);
        if (session) { queryFindNovela.session(session); }
        const novela = await queryFindNovela;
        if (!novela) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

        // ============================================================
        // 2. Localiza as versões da novela
        // ============================================================
        const queryFindVersoes = VersaoNovela.find({ novelaOriginal: novela._id });
        if (session) { queryFindVersoes.session(session); }
        const versoes = await queryFindVersoes;

        // ============================================================
        // 3. Obtém somente os IDs das versões
        // ============================================================
        const versaoIds = versoes.map(versao => versao._id);

        // ============================================================
        // 4. Exclui os personagens das versões da novela
        // ============================================================
        if (versaoIds.length > 0)
        {
            const queryDeleteVersoesPersonagens = 
                    VersaoPersonagem.deleteMany({ versaoNovelaOriginal: { $in: versaoIds }});
            if (session) { queryDeleteVersoesPersonagens.session(session); }
            await queryDeleteVersoesPersonagens;
        }

        // ============================================================
        // 5. Exclui as versões da novela
        // ============================================================
        const queryDeleteVersoes = VersaoNovela.deleteMany({ novelaOriginal: novela._id });
        if (session) { queryDeleteVersoes.session(session); }
        await queryDeleteVersoes;

        // ============================================================
        // 6. Exclui os personagens da novela
        // ============================================================
        const queryDeletePersonagens = Personagem.deleteMany({ novelaOriginal: novela._id });
        if (session) { queryDeletePersonagens.session(session); }
        await queryDeletePersonagens;

        // ============================================================
        // 7. Exclui a novela
        // ============================================================
        const queryDeleteNovela = Novela.deleteOne({ _id: novela._id });
        if (session) { queryDeleteNovela.session(session); }
        await queryDeleteNovela;
        
        return novela;  // retorna a novela que existia antes da exclusão
    };

    // ================================================================
    // A função foi chamada dentro de uma transação existente
    // ================================================================
    if (session)
    {
        const novela = await executar();
        return { status: 200, message: MENSAGENS.SUCCESS.DELETED, resultado: novela };
    }

    // ================================================================
    // Não existe sessão: cria uma nova transação
    // ================================================================
    const novaSession = await mongoose.startSession();

    try
    {
        let novela;

        await novaSession.withTransaction(async () =>
        {
            // Faz com que executar() utilize a transação recém-criada
            session = novaSession;
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