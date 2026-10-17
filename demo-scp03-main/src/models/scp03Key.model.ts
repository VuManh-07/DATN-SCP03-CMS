'use strict';

import { Schema, model } from "mongoose";

const DOCUMENT_NAME = "Scp03Key";
const COLLECTION_NAME = "Scp03Keys";

export interface IKeyScp03 {
  id?: string;
  key_mac: string;
  key_enc: string;
  key_dek: string;
  aid: string;
}

const Scp03KeySchema = new Schema(
  {
    scp03_key_mac: { type: String, required: true, unique: true },
    scp03_key_enc: { type: String, required: true, unique: true },
    scp03_key_dek: { type: String, required: true, unique: true },
    scp03_aid: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

export default model(DOCUMENT_NAME, Scp03KeySchema);
