const VersaoNovela     = require("../models/VersaoNovela");
const VersaoPersonagem = require("../models/VersaoPersonagem");
const Autor            = require("../models/Autor");
const Emissora         = require("../models/Emissora");
const Novela           = require("../models/Novela");
const Personagem       = require("../models/Personagem");
const MENSAGENS        = require("../constants/messages");
const mongoose         = require("mongoose");

async function getAll()
{
    return await VersaoNovela.find().populate("emissora").populate("versaoOriginal").populate("personagens");
}

async function get(_id)
{
    const registro = await VersaoNovela.findById(_id).populate("emissora").populate("versaoOriginal").populate("personagens");
    if (!registro) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

    const resultado = await new VersaoNovela
    ({
        _id: registro._id,
        dataLancamento: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric'
                                                            }).format(registro.dataLancamento),
        qtdCapitulos: registro.qtdCapitulos,
        sinopse: registro.sinopse,
        emissora: registro.emissora,
        versaoOriginal: registro.versaoOriginal,
        personagens: registro.personagens
    });

    return registro;
}

/*async function save(dados, session = null)
{
    // Validações
    if (dados.dataLancamento == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Data de Lançamento")); }
    if (dados.qtdCapitulos == "")   { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Nº Capítulos")); }
    if (dados.sinopse == "")        { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Sinopse")); }
    if (dados.versaoOriginal == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Versão Original")); }
    if (dados.autor == "")          { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Autor")); }
    if (dados.emissora == "")       { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Emissora")); }

    const executar = async () =>
    {
        let versao;

        // ============================================================
        // Localiza ou cria a versão
        // ============================================================
        if (!dados._id)
        {
            versao = new VersaoNovela();
            versao.personagens = [];
        }
        else
        {
            versao = await VersaoNovela.findById(dados._id).session(session);
            if (!versao) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

            // Exclui os personagens antigos
            const queryDeletePersonagens = VersaoPersonagem.deleteMany({ versaoNovelaOriginal: versao._id });
            queryDeletePersonagens.session(session);
            await queryDeletePersonagens;
            versao.personagens = [];
        }

        // ============================================================
        // Validação da sinopse
        // ============================================================
        const filtroSinopse = { sinopse: dados.sinopse };
        if (dados._id) { filtroSinopse._id = { $ne: dados._id }; }
        const sinopseExistente = await VersaoNovela.findOne(filtroSinopse).session(session);
        if (sinopseExistente) { throw new Error(MENSAGENS.NOVELA.SYNOPSIS_DUPLICATE); }

        // ============================================================
        // Localiza novela original
        // ============================================================
        const novelaOriginal = await Novela.findById(dados.versaoOriginal).session(session);
        if (!novelaOriginal) { throw new Error("Novela original não existente."); }

        // ============================================================
        // Localiza autor
        // ============================================================
        const autor = await Autor.findById(dados.autor).session(session);
        if (!autor) { throw new Error("Autor não existente."); }

        // ============================================================
        // Localiza emissora
        // ============================================================
        const emissora = await Emissora.findById(dados.emissora).session(session);
        if (!emissora) { throw new Error("Emissora não existente."); }

        // ============================================================
        // Preenche a versão
        // ============================================================
        versao.dataLancamento = dados.dataLancamento;
        versao.qtdCapitulos   = dados.qtdCapitulos;
        versao.sinopse        = dados.sinopse;
        versao.versaoOriginal = novelaOriginal._id;
        versao.autor          = autor._id;
        versao.emissora       = emissora._id;
        await versao.save({ session });

        // ============================================================
        // Salva os personagens da versão
        // ============================================================
        const personagens = [ ...new Set(dados.personagens) ];
        for (const item of personagens)
        {
            const personagem = await Personagem.findById(item.personagemOriginal).session(session);
            if (!personagem) { throw new Error("Personagem original não existente."); }
            let versaoPersonagem                  = new VersaoPersonagem();
            versaoPersonagem.genero               = item.genero;
            versaoPersonagem.generoObrig          = item.generoObrig;
            versaoPersonagem.etnia                = item.etnia;
            versaoPersonagem.etniaObrig           = item.etniaObrig;
            versaoPersonagem.faixaEtaria          = item.faixaEtaria;
            versaoPersonagem.faixaEtariaObrig     = item.faixaEtariaObrig;
            versaoPersonagem.faixaPeso            = item.faixaPeso;
            versaoPersonagem.faixaPesoObrig       = item.faixaPesoObrig;
            versaoPersonagem.faixaEstatura        = item.faixaEstatura;
            versaoPersonagem.faixaEstaturaObrig   = item.faixaEstaturaObrig;
            versaoPersonagem.personagemOriginal   = personagem._id;
            versaoPersonagem.versaoNovelaOriginal = versao._id;
            await versaoPersonagem.save({ session });
            versao.personagens.push(versaoPersonagem._id);
        }
        await versao.save({ session }); // atualiza o array de personagens da versão

        return versao;
    };

    // Já existe uma transação externa
    if (session) { return await executar(); }

    // ================================================================
    // Cria uma nova transação
    // ================================================================
    const novaSession = await mongoose.startSession();

    try
    {
        let resultado;

        await novaSession.withTransaction(async () =>
        {
            session = novaSession;
            resultado = await executar();
        });

        return { status: 201, message: MENSAGENS.SUCCESS.SAVED, resultado };
    }
    finally
    {
        await novaSession.endSession();
    }
}*/

async function save(dados, session = null)
{
    // ================================================================
    // Validações
    // ================================================================
    if (dados.dataLancamento == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Data de Lançamento")); }
    if (dados.qtdCapitulos == "")   { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Nº Capítulos")); }
    if (dados.sinopse == "")        { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Sinopse")); }
    if (dados.versaoOriginal == "") { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Versão Original")); }
    if (dados.autor == "")          { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Autor")); }
    if (dados.emissora == "")       { throw new Error(MENSAGENS.COMMON.REQUIRED_FIELD("Emissora")); }

    // ================================================================
    // Função efetivamente executada
    // ================================================================
    const executar = async (sessaoAtual) =>
    {
        let versao;

        // ============================================================
        // Localiza ou cria a versão da novela
        // ============================================================
        if (!dados._id)
        {
            versao = new VersaoNovela();
            versao.personagens = [];
        }
        else
        {
            versao = await VersaoNovela.findById(dados._id).session(sessaoAtual);
            if (!versao) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }

            // ========================================================
            // Exclui as versões antigas dos personagens
            // ========================================================
            await VersaoPersonagem.deleteMany({ versaoNovelaOriginal: versao._id }).session(sessaoAtual);
            versao.personagens = [];
        }

        // ============================================================
        // Validação da sinopse
        // ============================================================
        const filtroSinopse = { sinopse: dados.sinopse };
        if (dados._id) { filtroSinopse._id = { $ne: dados._id }; }
        const sinopseExistente = await VersaoNovela.findOne(filtroSinopse).session(sessaoAtual);
        if (sinopseExistente) { throw new Error(MENSAGENS.NOVELA.SYNOPSIS_DUPLICATE); }

        // ============================================================
        // Localiza a novela original
        // ============================================================
        const novelaOriginal = await Novela.findById(dados.versaoOriginal).session(sessaoAtual);
        if (!novelaOriginal) { throw new Error("Novela original não existente."); }

        // ============================================================
        // Localiza o autor
        // ============================================================
        const autor = await Autor.findById(dados.autor).session(sessaoAtual);
        if (!autor) { throw new Error("Autor não existente."); }

        // ============================================================
        // Localiza a emissora
        // ============================================================
        const emissora = await Emissora.findById(dados.emissora).session(sessaoAtual);
        if (!emissora) { throw new Error("Emissora não existente."); }

        // ============================================================
        // Preenche a versão da novela
        // ============================================================
        versao.dataLancamento = dados.dataLancamento;
        versao.qtdCapitulos   = dados.qtdCapitulos;
        versao.sinopse        = dados.sinopse;
        versao.versaoOriginal = novelaOriginal._id;
        versao.autor          = autor._id;
        versao.emissora       = emissora._id;
        await versao.save({ session: sessaoAtual });

        // ============================================================
        // Elimina personagens duplicados
        // ============================================================
        const personagens = [ ...new Map(dados.personagens.map(item => [item.personagemOriginal, item])).values() ];

        // ============================================================
        // Cria as versões dos personagens
        // ============================================================
        for (const item of personagens) // Parei aqui
        {
            //console.log("Item recebido:", item);
            // --------------------------------------------------------
            // Localiza o personagem original
            // --------------------------------------------------------
            const personagem = await Personagem.findById(item.personagemOriginal).session(sessaoAtual);
            if (!personagem) { throw new Error("Personagem original não existente."); }

            // --------------------------------------------------------
            // Cria a versão do personagem
            // --------------------------------------------------------
            const versaoPersonagem = new VersaoPersonagem
            ({
                genero:               item.genero,
                etnia:                item.etnia,
                faixaEtaria:          item.faixaEtaria,
                faixaPeso:            item.faixaPeso,
                faixaEstatura:        item.faixaEstatura,
                generoObrig:          item.generoObrig,
                etniaObrig:           item.etniaObrig,
                faixaEtariaObrig:     item.faixaEtariaObrig,
                faixaPesoObrig:       item.faixaPesoObrig,
                faixaEstaturaObrig:   item.faixaEstaturaObrig,
                personagemOriginal:   personagem._id,
                versaoNovelaOriginal: versao._id
            });

            console.log("VersaoPersonagem antes do save:", versaoPersonagem);
            // --------------------------------------------------------
            // Salva a versão do personagem
            // --------------------------------------------------------
            await versaoPersonagem.save({ session: sessaoAtual });
            console.log( "VersaoPersonagem salva:", versaoPersonagem._id );
            versao.personagens.push(versaoPersonagem._id);  // Adiciona o ID ao array da versão da novela
        }
        await versao.save({ session: sessaoAtual });    // Atualiza o array "personagens" da versão da novela

        return versao;
    };

    // ================================================================
    // Se já existe uma transação externa
    // ================================================================
    if (session) { return await executar(session); }

    // ================================================================
    // Cria uma nova transação
    // ================================================================
    const novaSession = await mongoose.startSession();

    try
    {
        let resultado;

        await novaSession.withTransaction(async () =>
        {
            resultado = await executar(novaSession);
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
    let resultado;
    const executar = async () =>
    {
        // localiza a novela, verificando antes se "session" existe
        const queryFindVersaoNovela = VersaoNovela.findById(_id);
        if (session) { queryFindVersaoNovela.session(session); }

        const versao = await queryFindVersaoNovela;
        if (!versao) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
        
        // exclui os personagens da versão de novela, verificando antes se "session" existe
        const queryDeletePersonagens = VersaoPersonagem.deleteMany({ versaoNovelaOriginal: versao._id });
        if (session) { queryDeletePersonagens.session(session); }
        await queryDeletePersonagens;

        // exclui a versão de novela, verificando antes se "session" existe
        const queryDeleteVersaoNovela = VersaoNovela.deleteOne({ _id: versao._id });
        if (session) { queryDeleteVersaoNovela.session(session); }
        await queryDeleteVersaoNovela;

        return versao;
    }

    // já existe uma transação externa
    if (session)
    {
        resultado = await executar();
        return { status: 200, message: MENSAGENS.SUCCESS.DELETED, resultado };
    }

    // caso a sessão não exista, cria-se uma nova
    const novaSession = await mongoose.startSession();

    try
    {
        await novaSession.withTransaction(async () =>
        {
            resultado = await executar();
        });

        return { status: 200, message: MENSAGENS.SUCCESS.DELETED, resultado };
    }
    finally
    {
        await novaSession.endSession();
    }
}

module.exports = { getAll, get, save, remove };