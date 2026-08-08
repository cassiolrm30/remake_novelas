const mongoose = require("mongoose");

const SCHEMA = new mongoose.Schema
({
  //id:              { type: Number, required: true, unique: true },
  _id:               { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  nomeOriginal:      { type: String, required: true },
  descricaoOriginal: { type: String, required: true },
  novelaOriginal:    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "novelas" },
  versoes:           [{ type: mongoose.Schema.Types.ObjectId, required: false, ref: "versoes_personagens" }]
 },
{ timestamps: true, versionKey: false });

module.exports = mongoose.model("personagens", SCHEMA);