import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

interface UploadOptions {
  folder?: string;
  resource_type?: "image" | "video" | "raw" | "auto";
  public_id?: string;
  format?: string;
}

/**
 * Upload a buffer to Cloudinary using upload_stream.
 * Use this with multer memoryStorage (req.file.buffer).
 */
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<{ secure_url: string; public_id: string }> => {
  const { folder = "aimockinterviewer/resumes", resource_type = "raw" } =
    options;

  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type,
    };
    if (options.public_id) uploadOptions.public_id = options.public_id;
    if (options.format) uploadOptions.format = options.format;

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by public_id.
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "raw"
): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

export default cloudinary;
