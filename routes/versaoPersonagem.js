const express = require("express");
const service = require("../services/personagemService");
const router  = express.Router();

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
router.post('/', async (req, res) =>
{
    try
    {
        const resultado = await service.save(req.body);
        res.status(resultado.status).json(resultado);
        //const dadosImportacao = await doImport(registros, 1);
    }
    catch (err)
    {
        res.status(500).json({ message: err.message });
    }
});

// PATCH (PUT)
router.patch('/:id', async (req, res) =>
{
    try
    {
        const resultado = await service.save(req.body);
        res.status(resultado.status).json(resultado);
        //const dadosImportacao = await doImport(registros, 1);
    }
    catch (err)
    {
        res.status(500).json({ message: err.message });
    }
});

/*async function postPut(req, res, params_id)
{
    let resultado = new VersaoPersonagem();
    let mensagem = mensagemSuccess;

    try
    {
        // Validações
        const _personagemOriginal = await Personagem.findById(req.body.personagemOriginalId);
        if (_personagemOriginal == null) { return res.status(409).json({ message: "Personagem original não existente." }); }

        const _versaoNovelaOriginal = await VersaoNovela.findById(req.body.versaoNovelaOriginalId);
        if (_versaoNovelaOriginal == null) { return res.status(409).json({ message: "Versão de novela não existente." }); }

        let registro = new VersaoPersonagem();
        registro.personagemOriginal = _personagemOriginal;
        registro.versaoNovelaOriginal = _versaoNovelaOriginal;
        registro.genero = req.body.genero;
        registro.etnia = req.body.etnia;
        registro.faixaEtaria = req.body.faixaEtaria;
        registro.faixaPeso = req.body.faixaPeso;
        registro.faixaEstatura = req.body.faixaEstatura;
        registro.generoObrig = req.body.generoObrig;
        registro.etniaObrig = req.body.etniaObrig;
        registro.faixaEtariaObrig = req.body.faixaEtariaObrig;
        registro.faixaPesoObrig = req.body.faixaPesoObrig;
        registro.faixaEstaturaObrig = req.body.faixaEstaturaObrig;

        if (params_id == null)
        {
            // Inclusão dos dados
            resultado = await registro.save();
        }
        else
        {
            // Atualização dos dados
            registro._id = params_id;
            resultado = await VersaoPersonagem.findOneAndUpdate({ _id: params_id },
                            { $set: {
                                        genero: req.body.genero,
                                        etnia: req.body.etnia,
                                        faixaEtaria: req.body.faixaEtaria,
                                        faixaPeso: req.body.faixaPeso,
                                        faixaEstatura: req.body.faixaEstatura,
                                        generoObrig: req.body.generoObrig,
                                        etniaObrig: req.body.etniaObrig,
                                        faixaEtariaObrig: req.body.faixaEtariaObrig,
                                        faixaPesoObrig: req.body.faixaPesoObrig,
                                        faixaEstaturaObrig: req.body.faixaEstaturaObrig
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
router.delete('/:id', async (req, res) =>
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