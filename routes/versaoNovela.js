const express            = require("express");
const mongoose           = require("mongoose");
const Autor              = require("../models/Autor");
const Novela             = require("../models/Novela");
const Personagem         = require("../models/Personagem");
const Emissora           = require("../models/Emissora");
const VersaoNovela       = require("../models/VersaoNovela");
const VersaoPersonagem   = require("../models/VersaoPersonagem");
const router             = express.Router();
const mensagemNotFound   = "Registro não encontrado.";
const mensagemNotDeleted = "É necessário antes excluir os dependentes deste registro.";
const mensagemSuccess    = "Dados salvos com sucesso.";

// GET
router.get('/', async (req, res) =>
{
    try
    {
        const registros = await VersaoNovela.find()
                                            .populate("emissora")
                                            .populate("versaoOriginal")
                                            .populate("personagens");

        const resultado = registros.map(registro =>
                          ({
                            _id: registro._id,
                            dataLancamento: new Intl.DateTimeFormat('pt-BR', { day: '2-digit',
                                                                               month: '2-digit',
                                                                               year: 'numeric'
                                                                             }).format(registro.dataLancamento),
                            qtdCapitulos: registro.qtdCapitulos,
                            sinopse: registro.sinopse,
                            personagens: registro.personagens,
                            emissora: registro.emissora,
                            versaoOriginal: registro.versaoOriginal
                          }));

        res.json(resultado);
    }
    catch (err)
    {
        console.log("err: " + err);
        console.log("err.errors: " + err.errors);
        console.log("err.message: " + err.message);
        res.status(500).json({ message: err.message });
    }
});

// GET/:id
router.get('/:id', async (req, res) =>
{
    try
    {
        const registro = await VersaoNovela.findById(req.params.id)
                                            .populate("emissora")
                                            .populate("versaoOriginal")
                                            .populate("personagens");
        if (registro == null)
            return res.status(404).json({ message: mensagemNotFound });

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
        res.json(resultado);
    }
    catch (err)
    {
        console.log("err: " + err);
        console.log("err.errors: " + err.errors);
        console.log("err.message: " + err.message);
        res.status(500).json({ message: err.message });
    }
});

// POST
router.post('/', async (req, res) =>
{
    await postPut(req, res, null);
    //const dadosImportacao = await doImport(registros, 1);
});

// PATCH (PUT)
router.patch('/:id', async (req, res) =>
{
    await postPut(req, res, req.params.id);
    //const dadosImportacao = await doImport(registros, 1);
});

async function postPut(req, res, params_id)
{
    let resultado = new VersaoNovela();
    let mensagem = mensagemSuccess;

    try
    {
        // Validações
        const _versaoOriginal = await Novela.findById(req.body.versaoOriginalId);
        if (_versaoOriginal == null) { return res.status(409).json({ message: "Novela não existente." }); }

        const _autor = await Autor.findById(req.body.autorId);
        if (_autor == null) { return res.status(409).json({ message: "Autor não existente." }); }

        const _emissora = await Emissora.findById(req.body.emissoraId);
        if (_emissora == null) { return res.status(409).json({ message: "Emissora não existente." }); }

        let registro            = new VersaoNovela();
        registro._id            = params_id;
        registro.dataLancamento = req.body.dataLancamento;
        registro.qtdCapitulos   = req.body.qtdCapitulos;
        registro.sinopse        = req.body.sinopse;
        registro.versaoOriginal = _versaoOriginal;
        registro.autor          = _autor;
        registro.emissora       = _emissora;
        registro.personagens    = [];

        if (params_id == null)
        {
            // Inclusão dos dados
            resultado = await registro.save();
            resultado._id = registro._id;
        }
        else
        {
            if ((await VersaoNovela.findById(params_id)) == null)
                return res.status(409).json({ message: "Versão de novela não existente." });

            // Atualização dos dados
            resultado = await VersaoNovela.findOneAndUpdate({ _id: params_id },
                            { $set: {
                                        dataLancamento: req.body.dataLancamento,
                                        qtdCapitulos: req.body.qtdCapitulos,
                                        sinopse: req.body.sinopse,
                                        versaoOriginal: _versaoOriginal,
                                        autor: _autor,
                                        emissora: _emissora
                                    } },
                            { new: true });
            resultado._id = params_id;
        }
        res.status(201).json({ message: mensagem, resultado });
    }
    catch (err)
    {
        res.status(400).json({ message: err.message });
    }
}

// DELETE/:id
router.delete('/:id', async (req, res) =>
{
    /*const _versaoNovela = await VersaoNovela.findOne({ _id: req.params.id });
    if (_versaoNovela == null)
        return res.status(404).json({ message: mensagemNotFound });
    const _personagens = await VersaoPersonagem.deleteMany({ versaoNovelaOriginal: _versaoNovela });
    const resultado = await VersaoNovela.deleteOne({ _id: req.params.id });
    res.json({ message: "Dados excluídos com sucesso.", resultado });*/
    const session = await mongoose.startSession();
    try
    {
        const mensagem = "Dados excluídos com sucesso.";
        let personagensExcluidos = null;
        let novelaExcluida = null;
        await session.withTransaction(async () =>
        {
            const registro = await VersaoNovela.findById(req.params.id).session(session);
            if (registro == null) { return res.status(404).json({ message: mensagemNotFound }); }
            //const qtItens = await VersaoPersonagem.countDocuments({ novelaOriginal: registro._id});
            //if (qtItens > 0) { return res.status(409).json({ message: mensagemNotDeleted }); }
            personagensExcluidos = await VersaoPersonagem.deleteMany({ novelaOriginal: req.params.id }).session(session);
            novelaExcluida = await VersaoNovela.deleteOne({ _id: req.params.id }).session(session);
        });
        res.json({ message: mensagem, novela: novelaExcluida, personagens: personagensExcluidos });
    }
    catch (err)
    {
        res.status(500).json({ message: err.message });
    }
    finally
    {
        await session.endSession();
    }
});

module.exports = router;