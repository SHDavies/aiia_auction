import { Cloudinary } from "@cloudinary/url-gen";
import { createContext } from "react";

export const cloudinary = new Cloudinary();

export const CloudinaryContext = createContext(cloudinary);
