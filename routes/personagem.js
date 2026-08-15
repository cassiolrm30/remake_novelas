const express    = require("express");
const Personagem = require("../models/Personagem");
const service    = require("../services/personagemService");
const router     = express.Router();

// GET
router.get('/', async (req, res) =>
{
    try
    {
        res.json(await service.getAll());
    }
    catch (err)
    {
        res.status(500).json({ message: err.message });
    }
});

// GET/:id
router.get('/:id', async (req, res) =>
{
    try
    {
        res.json(await service.get(req.params.id));
    }
    catch (err)
    {
        res.status(500).json({ message: err.message });
    }
});

// POST
router.post("/", async (req, res) =>
{
    try
    {
        const resultado = await service.save(req.body);
        res.status(resultado.status).json(resultado);
    }
    catch (err)
    {
        res.status(500).json({ message: err.message });
    }
});

// PATCH
router.patch("/:id", async (req, res) =>
{
    try
    {
        const resultado = await service.save(req.body);
        res.status(resultado.status).json(resultado);
    }
    catch (err)
    {
        res.status(500).json({ message: err.message });
    }
});

/*
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
    let resultado = new Personagem();
    let mensagem = mensagemSuccess;

    try
    {
        // Validações
        const _novelaOriginal = await Novela.findById(req.body.novelaOriginalId);
        if (_novelaOriginal == null) { return res.status(404).json({ message: mensagemNotFound }); }

        let registro               = new Personagem();
        registro.nomeOriginal      = req.body.nomeOriginal;
        registro.descricaoOriginal = req.body.descricaoOriginal;
        registro.novelaOriginalId  = _novelaOriginal;

        if (params_id == null)
        {
            // Inclusão dos dados
            resultado = await registro.save();
        }
        else
        {
            if (await Personagem.findById(params_id) == null) { return res.status(404).json({ message: mensagemNotFound }); }

            // Atualização dos dados
            resultado = await Personagem.findOneAndUpdate({ _id: params_id },
                                                      { $set:
                                                        {
                                                            nomeOriginal: req.body.nomeOriginal,
                                                            descricaoOriginal: req.body.descricaoOriginal,
                                                            novelaOriginalId: _novelaOriginal
                                                        } },
                                                      { new: true });
        }

        res.status(201).json({ message: mensagem, resultado });
    }
    catch (err)
    {
        res.status(400).json({ message: err.message });
    }
}*/

// DELETE/:id
router.delete("/:id", async (req, res) =>
{
    try
    {
        const resultado = await service.remove(req.params.id);
        res.status(resultado.status).json(resultado);
    }
    catch (err)
    {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;