// backend/src/services/storage.service.js
const FormData = require('form-data');
const fetch = require('node-fetch');
require('dotenv').config();

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

exports.uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file.buffer.toString('base64'));

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Image upload failed: ' + data.error.message);
    }

    return data.data.url;
  } catch (error) {
    console.error('ImgBB upload error:', error);
    throw new Error('Failed to upload image');
  }
};