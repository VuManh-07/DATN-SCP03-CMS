import { Request, Response, NextFunction } from "express";
import { Scp03Init, Scp03 } from "../services/scp03.service";
import { OK, CREATED, SuccessResponse } from "../core/success.response";
import { findKeySpc03ByUser } from "../models/repo/keyScp03.repo";
import {
  saveScp03Init,
  getScp03Init,
  updateScp03Init,
  deleteScp03Init,
} from "../models/repo/scp03.repo";
import { NotFoundError } from "../core/error.response";
import ECDHServer from "../services/ECDH.service";
import { readKeySCP03 } from "../helpers/read.key.scp03";

class Scp03Controller {
  private readonly sessions = new Map<string, ECDHServer>();

private getSessionDh(entityId: string): ECDHServer {
  if (!entityId) {
    throw new NotFoundError("Entity ID is required");
  }

  const dh = this.sessions.get(String(entityId));

  if (!dh) {
    throw new NotFoundError(
      "ECDH session not found or server restarted"
    );
  }

  return dh;
}

  constructor() {

    this.hostChallenge = this.hostChallenge.bind(this);
  }

  async hostChallenge(req: Request, res: Response, next: NextFunction) {
    const { clientPublicKey } = req.body;

    const dh = new ECDHServer();
    const sharedSecret = dh.computeSharedKey(clientPublicKey);
    // const scp03Key = await readKeySCP03();       // pro
    // const scp03Key = await findKeySpc03ByUser(); // dev
    const scp03Key = await readKeySCP03();
    if (!scp03Key) throw new NotFoundError("Scp03 key not found!");

    const scp03init = new Scp03Init({
      Key_MAC: scp03Key.scp03_key_mac,
      Key_ENC: scp03Key.scp03_key_enc,
      Key_DEK: scp03Key.scp03_key_dek,
      aid: scp03Key.scp03_aid,
      sharedSecret,
    });

    const scp03 = new Scp03(scp03init);
    const { hostChallenge } = await scp03.HostChallenge();

    const scp03InitRedis = await saveScp03Init(scp03);
    const symbols = Object.getOwnPropertySymbols(scp03InitRedis);
    const entityIdSymbol = symbols.find(
      (symbol) => symbol.toString() === "Symbol(entityId)"
    );
    const entityId = scp03InitRedis[entityIdSymbol as any];
    this.sessions.set(String(entityId), dh);

    new OK({
      message: "OK",
      metadata: {
        hostChallenge,
        entityId,
        serverPublicKey: dh.getPublicKeyBase64(),
      },
    }).send(res);
  }

  async initHostSCP03(req: Request, res: Response, next: NextFunction) {
    const cardParam = req.body.cardParam;
    const entityId = req.body.entityId;


    const scp03Init = await getScp03Init(entityId);
    if (
      !scp03Init.Key_MAC ||
      !scp03Init.Key_ENC ||
      !scp03Init.Key_DEK ||
      !scp03Init.aid
    )
      throw new NotFoundError("Can't find any data to key");

    const scp03 = new Scp03(scp03Init);
    const inited = await scp03.InitHostSCP03(cardParam);
    await updateScp03Init(entityId, scp03);

    new OK({
      message: "OK",
      metadata: {
        ...inited,
        entityId,
      },
    }).send(res);
  }

  hostCryptogram = async (req: Request, res: Response, next: NextFunction) => {
    const entityId = req.query?.entityId?.toString();

    if (!entityId) throw new NotFoundError("Entity ID is required");

    const scp03Init = await getScp03Init(entityId);
    if (
      !scp03Init.Key_MAC ||
      !scp03Init.Key_ENC ||
      !scp03Init.Key_DEK ||
      !scp03Init.aid
    )
      throw new NotFoundError("Can't find any data to key");

    const scp03 = new Scp03(scp03Init);
    const result = await scp03.HostCryptogram();

    await updateScp03Init(entityId, scp03);

    new OK({
      message: "OK",
      metadata: {
        ...result,
        entityId,
      },
    }).send(res);
  };

  generateCMAC = async (req: Request, res: Response, next: NextFunction) => {
    const { command, data, entityId } = req.body;

    const scp03Init = await getScp03Init(entityId);
    if (
      !scp03Init.Key_MAC ||
      !scp03Init.Key_ENC ||
      !scp03Init.Key_DEK ||
      !scp03Init.aid
    )
      throw new NotFoundError("Can't find any data to key");

    const scp03 = new Scp03(scp03Init);
    const { generateCMAC } = await scp03.GenerateCMAC(command, data);

    await updateScp03Init(entityId, scp03);

    new OK({
      message: "OK",
      metadata: {
        generateCMAC,
        entityId,
      },
    }).send(res);
  };

  channelFinish = async (req: Request, res: Response, next: NextFunction) => {
    const { authResponse, entityId } = req.body;

    const scp03Init = await getScp03Init(entityId);
    if (
      !scp03Init.Key_MAC ||
      !scp03Init.Key_ENC ||
      !scp03Init.Key_DEK ||
      !scp03Init.aid
    )
      throw new NotFoundError("Can't find any data to key");

    const scp03 = new Scp03(scp03Init);
    const result: boolean = scp03.ChannelFinish(authResponse);

    await updateScp03Init(entityId, scp03);

    new OK({
      message: "OK",
      metadata: {
        isAuth: result,
        entityId,
      },
    }).send(res);
  };

  wrap = async (req: Request, res: Response, next: NextFunction) => {
    const { command, data, entityId } = req.body;

    const dataDecrypto = await this.getSessionDh(entityId).decrypt(data);



    const scp03Init = await getScp03Init(entityId);

    if (
      !scp03Init.Key_MAC ||
      !scp03Init.Key_ENC ||
      !scp03Init.Key_DEK ||
      !scp03Init.aid
    )
      throw new NotFoundError("Can't find any data to key");

    const scp03 = new Scp03(scp03Init);
    const _data = await scp03.Wrap(command, JSON.parse(dataDecrypto));

    await updateScp03Init(entityId, scp03);

    const dataEncrypt = await this.getSessionDh(entityId).encrypt(JSON.stringify(_data));

    new OK({
      message: "OK",
      metadata: {
        wrap: dataEncrypt,
        entityId,
      },
    }).send(res);
  };

  unwrap = async (req: Request, res: Response, next: NextFunction) => {
    const { data, entityId } = req.body;

    const dataDecrypto = await this.getSessionDh(entityId).decrypt(data);

    const scp03Init = await getScp03Init(entityId);
    if (
      !scp03Init.Key_MAC ||
      !scp03Init.Key_ENC ||
      !scp03Init.Key_DEK ||
      !scp03Init.aid
    )
      throw new NotFoundError("Can't find any data to key");

    const scp03 = new Scp03(scp03Init);
    const _data = await scp03.Unwrap(JSON.parse(dataDecrypto));

    await updateScp03Init(entityId, scp03);

    const _dataEncrypt = await this.getSessionDh(entityId).encrypt(JSON.stringify(_data));

    new OK({
      message: "OK",
      metadata: {
        unwrap: _dataEncrypt,
        entityId,
      },
    }).send(res);
  };

  reset = async (req: Request, res: Response, next: NextFunction) => {
    const entityId = req.query?.entityId?.toString();

    if (!entityId) throw new NotFoundError("Entity ID is required");

    new OK({
      message: "OK",
      metadata: await deleteScp03Init(entityId).then((result) => { this.sessions.delete(String(entityId)); return result; }),
    }).send(res);
  };
}

export default new Scp03Controller();
