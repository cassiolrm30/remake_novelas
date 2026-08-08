const mongoose = require("mongoose");

const SCHEMA = new mongoose.Schema
({
  //id:             { type: Number, required: true, unique: true },
  _id:            { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  dataLancamento: { type: Date, required: true },
  qtdCapitulos:   { type: Number, required: true },
  sinopse:        { type: String, required: true },
  versaoOriginal: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "novelas" },
  autor:          { type: mongoose.Schema.Types.ObjectId, required: true, ref: "autores" },
  emissora:       { type: mongoose.Schema.Types.ObjectId, required: true, ref: "emissoras" },
  personagens:    [{ type: mongoose.Schema.Types.ObjectId, required: false, ref: "versoes_personagens" }]
},
{ timestamps: true, versionKey: false });

module.exports = mongoose.model("versoes_novelas", SCHEMA);