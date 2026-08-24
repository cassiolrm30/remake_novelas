const mongoose = require("mongoose");
const ENUMS = require("../constants/ENUMS");

const SCHEMA = new mongoose.Schema
({
    _id:                  { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    genero:               { type: String, required: true, enum: Object.values(ENUMS.GENERO) },
    etnia:                { type: String, required: true, enum: Object.values(ENUMS.ETNIA) },
    faixaEtaria:          { type: String, required: true, enum: Object.values(ENUMS.FAIXA_ETARIA) },
    faixaPeso:            { type: String, required: true, enum: Object.values(ENUMS.FAIXA_PESO) },
    faixaEstatura:        { type: String, required: true, enum: Object.values(ENUMS.FAIXA_ESTATURA) },
    generoObrig:          { type: Boolean, required: false },
    etniaObrig:           { type: Boolean, required: false },
    faixaEtariaObrig:     { type: Boolean, required: false },
    faixaPesoObrig:       { type: Boolean, required: false },
    faixaEstaturaObrig:   { type: Boolean, required: false },
    versaoNovelaOriginal: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "versoes_novelas" },
    personagemOriginal:   { type: mongoose.Schema.Types.ObjectId, required: false, ref: "personagens" }
 },
{ timestamps: true, versionKey: false });

module.exports = mongoose.model("versoes_personagens", SCHEMA);