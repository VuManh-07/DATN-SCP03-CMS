"use strict";

import express from "express";
import { apiKey, checkPermission } from "../auth/checkAuth";

const router = express.Router();

//check apiKey
// router.use(apiKey);

// check permission
// router.use(checkPermission("0000"));

// route
router.use("/scp03", require("./scp03"));

export default router;
