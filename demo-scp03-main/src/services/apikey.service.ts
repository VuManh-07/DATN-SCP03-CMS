"use strict";

import apikeyModel from "../models/apikey.model";

const findApiKeyByKey = async (key: string) => {
  const objKey = await apikeyModel.findOne({ key, status: true }).lean();
  return objKey;
};

export { findApiKeyByKey };
