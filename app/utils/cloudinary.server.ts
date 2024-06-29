/* eslint-disable no-async-promise-executor */
import { writeAsyncIterableToWritable } from "@remix-run/node";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  api_key: process.env.CLOUDINARY_API_KEY,
});

export async function deleteImage(publicId: string) {
  return cloudinary.v2.api.delete_resources([publicId]);
}

export async function uploadImage(
  data: AsyncIterable<Uint8Array>,
  filename?: string,
) {
  const uploadPromise = new Promise(async (resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "a2a_auction",
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
        public_id: filename,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      },
    );
    await writeAsyncIterableToWritable(data, uploadStream);
  });
  return uploadPromise;
}
