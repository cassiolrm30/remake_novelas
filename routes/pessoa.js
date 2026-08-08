const express       = require("express");
const Pessoa        = require("../models/Pessoa");
const pessoaService = require("../services/pessoaService");
const router        = express.Router();

// GET
router.get("/", async (req, res) =>
{
    try
    {
        res.json(await pessoaService.getAll());
    }
    catch (err)
    {
        res.status(500).json({ message: err.message });
    }
});

// GET/:id
router.get("/:id", async (req, res) =>
{
    try
    {
        res.json(await pessoaService.get(req.params.id));
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
        res.status(201).json(await pessoaService.save(req.body));
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
        res.status(201).json(await pessoaService.save(req.body));
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
        res.json(await pessoaService.remove(req.params.id));
    }
    catch (err)
    {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;