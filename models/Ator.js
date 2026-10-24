const mongoose = require('mongoose');

const SCHEMA = new mongoose.Schema
({
  //id:             { type: Number, required: true, unique: true },
  pessoa:         { type: mongoose.Schema.Types.ObjectId, ref: "pessoas", required: true, unique: true },
  nomeArtistico:  { type: String, required: true, unique: true },
  DRT:            { type: String, required: false, unique: true, trim: true, uppercase: true, maxlength: 20 },
  versoesNovelas: [{ type: mongoose.Schema.Types.ObjectId, ref: "versoes_novelas" }]
},
{ timestamps: true, versionKey: false });

module.exports = mongoose.model("atores", SCHEMA);