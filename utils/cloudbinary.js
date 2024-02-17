const cloudinary=require('cloudinary')
          
cloudinary.config({ 
  cloud_name: 'djcx6vjt5', 
  api_key: '395683545148563', 
  api_secret: 'w__WF8UE5dGB9nfMD2leRRPD0gE' 
});

// Function to upload image
const cloudinaryUploadImage = async (fileToUpload) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(fileToUpload , ( result) => {
      {
        resolve({
          url: result.secure_url,
          asset_id: result.asset_id,
          public_id: result.public_id,
        },
        { resource_type: "auto" });
      }
    });
  });
}; 

const cloudinarydeleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    if (result.result === 'not found') {
      throw new Error('Image not found');
    } else if (result.result === 'ok') {
      return result;
    } else {
      throw new Error('Delete operation failed');
    }
  } catch (error) {
    throw error;
  }
};

module.exports = { cloudinaryUploadImage, cloudinarydeleteImage };
