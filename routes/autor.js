const express = require("express");
const service = require("../services/autorService");
const router  = express.Router();

/*async function getNextId()
{
     const lastId = await Usuario.findOne().sort({ id: -1 });
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
        res.status(500).json({ message: err.message });
    }
});

// GET/:id
router.get("/:id", async (req, res) =>
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
        res.status(201).json(await service.save(req.body));
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
        res.status(201).json(await service.save(req.body));
    }
    catch (err)
    {
        res.status(500).json({ message: err.message });
    }
});

// DELETE/:id
router.delete('/:id', async (req, res) =>
{
    try
    {
        res.json(await service.remove(req.params.id));
    }
    catch (err)
    {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;