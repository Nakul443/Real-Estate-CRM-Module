// utility that connects the server to the cloud

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

// Security check: Ensure cloud credentials exist before starting
if (!CLOUDINARY_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('Cloudinary environment variables are missing!');
}

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// This defines how the files are stored in the cloud
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'real_estate_crm/properties', // Organized folder structure
    allowed_formats: ['jpg', 'jpeg', 'png'],
  } as any,
});

// This is the middleware we will use in our routes
export const upload = multer({ storage: storage });