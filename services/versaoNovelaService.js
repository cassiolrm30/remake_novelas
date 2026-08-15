const VersaoNovela       = require("../models/VersaoNovela");
const Novela            = require("../models/Novela");
const Personagem        = require("../models/Personagem");
const VersaoPersonagem   = require("../models/VersaoPersonagem");
const MENSAGENS         = require("../constants/messages");
const mongoose          = require("mongoose");
const personagemService = require("../services/personagemService");

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

async function save(dados, session = null)
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

        if (!dados._id)
            versao = new VersaoNovela();
        else
        {
            versao = await VersaoNovela.findById(dados._id).session(session);
            if (!versao) { throw new Error(MENSAGENS.COMMON.NOT_FOUND); }
            
            // exclui os personagens antigos da versão de novela, verificando antes se "session" existe
            versao.personagens = [];
            const queryDeletePersonagens = VersaoPersonagem.deleteMany({ versaoNovelaOriginal: versao._id });
            if (session) { queryDeletePersonagens.session(session); }
            await queryDeletePersonagens;    
        }

        // Validações
        const filtroSinopse = { titulo: dados.sinopse };
        if (dados._id) { filtroSinopse._id = { $ne: dados._id }; }
        const sinopseExistente = await Novela.findOne(filtroSinopse).session(session);
        if (sinopseExistente != null) { throw new Error(MENSAGENS.NOVELA.SYNOPSIS_DUPLICATE); }

        const _versaoOriginal = await Novela.findById(dados.versaoOriginal);
        if (_versaoOriginal == null) { return res.status(409).json({ message: "Novela não existente." }); }

        const _autor = await Autor.findById(dados.autor);
        if (_autor == null) { return res.status(409).json({ message: "Autor não existente." }); }

        const _emissora = await Emissora.findById(dados.emissora);
        if (_emissora == null) { return res.status(409).json({ message: "Emissora não existente." }); }

        versao.dataLancamento = versao.dataLancamento;
        versao.qtdCapitulos   = versao.qtdCapitulos;
        versao.sinopse        = versao.sinopse;
        versao.versaoOriginal = _versaoOriginal;
        versao.autor          = _autor;
        versao.emissora       = _emissora;

        // salva a versão de novela
        await versao.save({ session });

        // salva os personagens
        const _personagens = [...new Set(dados.personagens)]; // elimina itens repetidos
        for (const item of _personagens)
        {
            const _dados = item.split('|');
            const personagem = new VersaoPersonagem
                               ({
                                    genero: _dados[0],
                                    etnia: _dados[1],
                                    faixaEtaria: _dados[2],
                                    faixaPeso: _dados[3],
                                    faixaEstatura: _dados[4],
                                    generoObrig: _dados[5],
                                    etniaObrig: _dados[6],
                                    faixaEtariaObrig: _dados[7],
                                    faixaPesoObrig: _dados[8],
                                    faixaEstaturaObrig: _dados[9],
                                    versaoNovelaOriginal: versao._id,
                                    personagemOriginal: personagem._id
                               });
            await personagem.save({ session });
            versao.personagens.push(personagem._id);
        }        
        // atualiza o array de personagens da novela
        await versao.save({ session });

        return versao;
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