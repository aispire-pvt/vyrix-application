const ImageKit = require('@imagekit/nodejs');

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function uploadImage(file)
{
    const response = await client.files.upload({
        file,
        fileName: 'user.jpg',
        folder:"vyrix-users/images"
      });
      return response;
}

module.exports=uploadImage;