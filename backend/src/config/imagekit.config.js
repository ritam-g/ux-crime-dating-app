import dotenv from "dotenv";
dotenv.config();

/**
 * @file imagekit.config.js
 * @description Centralized configurations for ImageKit SDK.
 */
export default {
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY ,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT ,
};
