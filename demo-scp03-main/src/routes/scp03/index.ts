'use strict';

import { Router } from "express";
import { asyncHandler } from "../../helpers/asyncHandler";
import Scp03Controller from "../../controllers/scp03.controller";

const router = Router();

//authetication

//route
router.post("/hostChallenge", asyncHandler(Scp03Controller.hostChallenge));
router.post("/initHostSCP03", asyncHandler(Scp03Controller.initHostSCP03));
router.get(
  "/hostCryptogram",
  asyncHandler(Scp03Controller.hostCryptogram)
);
router.post("/generateCMAC", asyncHandler(Scp03Controller.generateCMAC));
router.post("/channelFinish", asyncHandler(Scp03Controller.channelFinish));
router.post("/wrap", asyncHandler(Scp03Controller.wrap));
router.post("/unwrap", asyncHandler(Scp03Controller.unwrap));
router.get("/reset", asyncHandler(Scp03Controller.reset));

module.exports = router;
