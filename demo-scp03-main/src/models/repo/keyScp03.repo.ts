import KeyScp03Model from "../scp03Key.model";

const findKeySpc03ByUser = async () => {
  return await KeyScp03Model.findOne({ status: true }).lean();
};

export { findKeySpc03ByUser };
