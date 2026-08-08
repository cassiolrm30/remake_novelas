const mongoose = require("mongoose");

const SCHEMA = new mongoose.Schema
({
  //id:              { type: Number, required: true, unique: true },
  _id:               { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  titulo:            { type: String, required: true, unique: true },
  sinopseConceitual: { type: String, required: true },
  versoes:           [{ type: mongoose.Schema.Types.ObjectId, required: false, ref: "versoes_novelas" }],
  personagens:       [{ type: mongoose.Schema.Types.ObjectId, required: false, ref: "personagens" }]
},
{ timestamps: true, versionKey: false });

module.exports = mongoose.model("novelas", SCHEMA);