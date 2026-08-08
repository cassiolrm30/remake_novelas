const express = require("express");
const Novela  = require('../models/Novela');
const service = require("../services/novelaService");
const router  = express.Router();

/*async function getNextId()
{
     const lastId = await Novela.findOne().sort({ id: -1 });
     return lastId ? lastId.id + 1 : 1;
}*/
   
// GET
router.get("/", async (req, res) =>
{
    try
    {
        res.json(await service.getAll());
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
        res.json(await service.get(req.params.id));
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
router.post("/", async (req, res) =>
{
    try
    {
        res.status(201).json(await service.save(req.body));
    }
    catch (err)
    {
        console.log("err: " + err);
        console.log("err.errors: " + err.errors);
        console.log("err.message: " + err.message);
        res.status(500).json({ message: err.message });
    }
});

// PATCH
router.patch("/:id", async (req, res) =>
{
    try
    {
        res.status(201).json(await service.save(req.body));
    }
    catch (err)
    {
        console.log("err: " + err);
        console.log("err.errors: " + err.errors);
        console.log("err.message: " + err.message);
        res.status(500).json({ message: err.message });
    }
});

/*
// POST
router.post('/', async (req, res) =>
{
    await postPut(req, res);
    //const dadosImportacao = await doImport(registros, 1);
});

// PATCH (PUT)
router.patch('/:id', async (req, res) =>
{
    await postPut(req, res);
    //const dadosImportacao = await doImport(registros, 1);
});

async function postPut(req, res)
{
    let registro;
    const params_id = req.params.id;
    const true_id = (req.params.id !== undefined) && (req.params.id == req.body._id);
    const session   = await mongoose.startSession();

    try
    {
        await session.withTransaction(async () =>
        {
            if (true_id)
            {
                registro = await Novela.findById(params_id).session(session);
                if (!registro) { throw new Error("Registro não encontrado."); }

                const tituloDuplicado = await Novela.findOne({ titulo: req.body.titulo, _id: { $ne: registro._id } }).session(session);
                if (tituloDuplicado) { throw new Error("Título já existente em outro registro."); }

                await Personagem.deleteMany({ novelaOriginal: params_id }).session(session);
                registro._id = params_id;
            }
            else
            {
                registro = await Novela.findOne({ titulo: req.body.titulo}).session(session);
                if (registro != null) { throw new Error("Título já existente em outro registro."); }
                registro = new Novela();
            }

            registro.titulo            = req.body.titulo;
            registro.sinopseConceitual = req.body.sinopseConceitual;
            registro.personagens       = [];
            for (const item of req.body.personagens)
            {
                const personagem = new Personagem({ nomeOriginal: item.nomeOriginal, descricaoOriginal: item.descricaoOriginal,
                                                    novelaOriginal: registro._id });
                await personagem.save({ session });
                registro.personagens.push(personagem._id);
            }
            await registro.save({ session });
        });

        const resultado = await Novela.findById(registro._id).populate("personagens");
        res.status(201).json({ message: mensagemSuccess, resultado });
    }
    catch(err)
    {
        res.status(400).json({ message: err.message });
    }
    finally
    {
        await session.endSession();
    }
}*/

// DELETE/:id
router.delete('/:id', async (req, res) =>
{
    try
    {
        res.json(await service.remove(req.params.id));
    }
    catch (err)
    {
        console.log("err: " + err);
        console.log("err.errors: " + err.errors);
        console.log("err.message: " + err.message);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;