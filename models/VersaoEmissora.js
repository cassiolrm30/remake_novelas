const mongoose = require("mongoose");

const SCHEMA = new mongoose.Schema
({
  //id:               { type: Number, required: true, unique: true },
  _id:                { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  versaoNovela:       { type: mongoose.Schema.Types.ObjectId, required: true, ref: "versoes_novelas" },
  emissora:           { type: mongoose.Schema.Types.ObjectId, required: true, ref: "emissoras" },
  dataInicioExibicao: { type: Date, required: true },
  dataFimExibicao:    { type: Date, required: true }
},
{ timestamps: true, versionKey: false });

module.exports = mongoose.model("versoes_emissoras", SCHEMA);