const express    = require("express");
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