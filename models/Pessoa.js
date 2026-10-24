const mongoose = require('mongoose');
const { ESTADO_UF, GENERO, ETNIA, FAIXA_ETARIA, FAIXA_PESO, FAIXA_ESTATURA } = require('../constants/ENUMS');

const SCHEMA = new mongoose.Schema
({
  //id:              { type: Number, required: true, unique: true },
  _id:             { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  CPF:             { type: String, required: true },
  nomeCompleto:    { type: String, required: true },
  dataNascimento:  { type: Date,   required: true },
  dataFalecimento: { type: Date,   required: false },
  cidadeNatal:     { type: String, required: true },
  UF:              { type: String, required: true, uppercase: true, minlength: 2, maxlength: 2 },
  genero:          { type: String, required: true, enum: Object.values(GENERO) },
  etnia:           { type: String, required: true, enum: Object.values(ETNIA) },
  faixaEtaria:     { type: String, required: true, enum: Object.values(FAIXA_ETARIA).map(item => item.descricao) },
  faixaPeso:       { type: String, required: true, enum: Object.values(FAIXA_PESO).map(item => item.descricao) },
  faixaEstatura:   { type: String, required: true, enum: Object.values(FAIXA_ESTATURA).map(item => item.descricao) },
  imagemFoto:      { type: String, required: false },
  imagemUpload:    { type: Object, required: false }
},
{ timestamps: true, versionKey: false });

module.exports = mongoose.model("pessoas", SCHEMA);