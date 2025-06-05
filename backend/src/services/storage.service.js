import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
import cloudinary from 'cloudinary';
import AppError from '../utils/appError.js';
import config from '../config/index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cloudinaryV2 = cloudinary.v2;

// Configure Cloudinary (if used)
if (config.cloudinary && config.cloudinary.cloudName) {
  cloudinaryV2.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
  });
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper to generate unique filenames
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  return `${timestamp}-${randomString}${extension}`;
};

// Upload to local storage
const uploadToLocalStorage = async (file, uploadPath) => {
  const uniqueFilename = generateUniqueFilename(file.name);
  const targetDir = path.join(uploadsDir, uploadPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const filePath = path.join(targetDir, uniqueFilename);
  
  // Use promisify to convert fs.writeFile to Promise-based
  const writeFile = promisify(fs.writeFile);
  
  await writeFile(filePath, file.data);
  
  // Return file details
  return {
    filename: uniqueFilename,
    path: filePath,
    url: `/uploads/${uploadPath}/${uniqueFilename}`,
    size: file.size,
    mimetype: file.mimetype
  };
};

// Upload to Cloudinary
const uploadToCloudinary = async (file, uploadPath) => {
  // Use buffer upload API
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinaryV2.uploader.upload_stream(
      {
        folder: uploadPath,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    uploadStream.write(file.data);
    uploadStream.end();
  });
  
  return {
    filename: result.public_id,
    url: result.secure_url,
    size: file.size,
    mimetype: file.mimetype
  };
};

const uploadToStorage = async (file, uploadPath) => {
  try {
    // If Cloudinary is configured, use it; otherwise, use local storage
    if (config.cloudinary && config.cloudinary.cloudName) {
      return await uploadToCloudinary(file, uploadPath);
    } else {
      return await uploadToLocalStorage(file, uploadPath);
    }
  } catch (error) {
    throw new AppError(`File upload failed: ${error.message}`, 500);
  }
};

// Delete file from storage
const deleteFromStorage = async (fileUrl, isCloudinary = false) => {
  try {
    if (isCloudinary) {
      // Extract public_id from Cloudinary URL
      const publicId = fileUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } else {
      // For local storage, get the file path and delete
      const filePath = path.join(__dirname, '../../', fileUrl);
      if (fs.existsSync(filePath)) {
        await promisify(fs.unlink)(filePath);
      }
    }
    return true;
  } catch (error) {
    throw new AppError(`File deletion failed: ${error.message}`, 500);
  }
};

export { uploadToStorage, deleteFromStorage };