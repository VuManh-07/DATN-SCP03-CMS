import config from "./src/configs/config.env";
import app from "./src/app";

const port = config.app.port;

const server = app.listen(port, () => {
  console.log(`wsv eCommerce start with ${port}`);
});
