const mongoose   = require("mongoose");

const SCHEMA = new mongoose.Schema
({
  //id:                 { type: Number, required: true, unique: true },
  _id:                  { type: String, default: () => new mongoose.Types.ObjectId() },
  genero:               { type: String, required: true, ref: "GENERO" },
  etnia:                { type: String, required: true, ref: "ETNIA" },
  faixaEtaria:          { type: String, required: true, ref: "FAIXA_ETARIA" },
  faixaPeso:            { type: String, required: true, ref: "FAIXA_PESO" },
  faixaEstatura:        { type: String, required: true, ref: "FAIXA_ESTATURA" },
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