const mongoose = require("mongoose");

const SCHEMA = new mongoose.Schema
({
  //id:         { type: Number, required: true, unique: true },
  pessoa:       { type: mongoose.Schema.Types.ObjectId, ref: "pessoas", required: true },
  email:        { type: String, required: true, unique: true },
  login:        { type: String, required: true, unique: true },
  senha:        { type: String, required: true },
  perfil:       { type: String, required: true, enum: ["ADMIN", "EDITOR", "CONSULTOR"] },
  ativo:        { type: Boolean, required: true, default: true },
  ultimoAcesso: { type: Date, required: false }
},
{ timestamps: true, versionKey: false });

module.exports = mongoose.model("usuarios", SCHEMA);