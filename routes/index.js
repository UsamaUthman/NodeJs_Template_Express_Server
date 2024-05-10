import auth from "./auth.js";

const apiVer = "/api/v1/";

const initializeRoutes = (app) => {
  app.use(apiVer + "auth", auth);
};

export default initializeRoutes;
