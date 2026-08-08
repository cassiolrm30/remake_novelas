const express                = require("express");
const cors                   = require("cors");
const mongoose               = require("mongoose");
const bodyParser             = require("body-parser");
const pessoaRouter           = require("./routes/pessoa");
const usuarioRouter          = require("./routes/usuario");
const autorRouter            = require("./routes/autor");
const atorRouter             = require("./routes/ator");
const emissoraRouter         = require("./routes/emissora");
const novelaRouter           = require("./routes/novela");
const versaoNovelaRouter     = require("./routes/versaoNovela");
const versaoPersonagemRouter = require("./routes/versaoPersonagem");
const personagemRouter       = require("./routes/personagem");
const app                    = express();
const port                   = 1234;

// Conectando ao MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/remake_novelas?replicaSet=rs0")
        .then(() => { console.log("Conectado ao MongoDB"); })
        .catch(err => { console.error("Erro ao conectar ao MongoDB", err); });

// Middleware
app.use(bodyParser.json());
app.use(cors())

// Rotas
app.use("/pessoa", pessoaRouter);
app.use("/usuario", usuarioRouter);
app.use("/autor", autorRouter);
app.use("/ator", atorRouter);
app.use("/emissora", emissoraRouter);
app.use("/novela", novelaRouter);
app.use("/personagem", personagemRouter);
app.use("/versaoNovela", versaoNovelaRouter);
app.use("/versaoPersonagem", versaoPersonagemRouter);

// Rota inicial
app.get('/', (req, res) => { res.send("Bem-vindo ao CRUD de exemplo!"); });

app.listen(port, () => { console.log(`Servidor rodando em http://localhost:${port}`); });