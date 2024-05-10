import express from "express";
import asyncWrapper from "../utils/asyncWrapper.js";
import BadRequestError from "../utils/types-errors/bad-request.js";

const router = express.Router();

router.get(
  "/",
  asyncWrapper((req, res) => {
    res.send("Hello World");
  })
);

// example useage of BadRequestError
// router.get(
//   "/error",
//   asyncWrapper((req, res) => {
//     if (req.query.error) throw new BadRequestError("This is a bad request");
//   })
// );

export { router as default };
