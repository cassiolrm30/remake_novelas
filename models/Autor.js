const mongoose = require("mongoose");
const Pessoa   = require("./Pessoa");

const SCHEMA = new mongoose.Schema
({
  //id:             { type: Number, required: true, unique: true },
  pessoa:         { type: mongoose.Schema.Types.ObjectId, ref: "pessoas", required: true, unique: true },
  nomeArtistico:  { type: String, required: true, unique: true },
  versoesNovelas: [{ type: mongoose.Schema.Types.ObjectId, ref: "versoes_novelas" }]
},
{ timestamps: true, versionKey: false });

module.exports = mongoose.model("autores", SCHEMA);