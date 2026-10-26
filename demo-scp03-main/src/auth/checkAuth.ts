"use strict";

import { Request as ExpressRequest, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { findApiKeyByKey } from "../services/apikey.service";

// Define an interface to extend Request
interface Request extends ExpressRequest {
  objKey?: {
    _id: ObjectId;
    key: String;
    status: Boolean;
    permissions: String[];
  };
}

const HEADER = {
  API_KEY: "x-api-key",
};

const apiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({ message: "Forbidden Error" });
    }

    const objKey = await findApiKeyByKey(key);
    if (!objKey) {
      return res.status(403).json({ message: "Forbidden Error" });
    }

    req.objKey = objKey;
    return next();
  } catch (error) { return next(error); }
};

const checkPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.objKey?.permissions) {
      return res.status(403).json({ message: "Permission dinied" });
    }

    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      return res.status(403).json({ message: "Permission dinied" });
    }

    return next();
  };
};

export { apiKey, checkPermission };

