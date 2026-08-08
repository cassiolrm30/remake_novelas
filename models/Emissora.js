const mongoose = require("mongoose");
const Enums    = require("../constants/ENUMS");

const SCHEMA = new mongoose.Schema
({
  //id:            { type: Number, required: true, unique: true },
  _id:             { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  nome:            { type: String, required: true },
  sigla:           { type: String, required: true },
  pais:            { type: String, required: true, enum: Object.values(Enums.PAIS) },
  anoFundacao:     { type: Number, required: true },
  anoEncerramento: { type: Number, required: false }
},
{ timestamps: true, versionKey: false });

module.exports = mongoose.model("emissoras", SCHEMA);