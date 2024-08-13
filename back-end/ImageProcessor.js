import sharp from 'sharp';

class ImageProcessor {
  constructor(fileAndOptions) { //fileBuffer, option
    //{fileData: file, ...option}
    const {fileData, ...option} = fileAndOptions;
    const fileBuffer = fileData.buffer;
    this.fileBuffer = fileBuffer;
    this.option = option;
    this.compression = parseInt(option.compression, 10);
    this.width = parseInt(option.width, 10)
    this.height = parseInt(option.height, 10)
    this.format = option.format
    
  }
  async resizeImage(sharpImage){

    if(this.width && this.height){
      var convertedImage =  await sharpImage.resize(this.width, this.height, {
        fit: 'inside', // Ensure aspect ratio is maintained
        kernel: sharp.kernel.lanczos3 // Use Lanczos3 kernel for resizing
      })
    }else convertedImage = sharpImage
    return convertedImage;
  }
  async toWebp(sharpImage){
    const convertedImage = await sharpImage.webp({
      quality: this.compression, // Compression level (0-100)
      effort: 6, // Effort level (0-6), higher is slower but better compression
    })
    return convertedImage
  }
  async toPng(sharpImage){
    const convertedImage = await sharpImage.png({
      compressionLevel: 9,
      quality: this.compression,
      effort: 10
    })
    return convertedImage
  }
  async toJpg(sharpImage){
    const convertedImage = await sharpImage.jpeg({
      compressionLevel: 9,
      quality: this.compression
    })
    return convertedImage
  }

  async convert() {
    
    try {
      // Use sharp to process the image
      let convertedImage1 = await sharp(this.fileBuffer)
      let convertedImage2 = await this.resizeImage(convertedImage1)
      switch (this.format){
        case "webp": {
          var convertedImage3 = await this.toWebp(convertedImage2);
          break
        }
        case "png":{
          var convertedImage3 = await this.toPng(convertedImage2);
          break
        }case "jpg":{
          var convertedImage3 = await this.toJpg(convertedImage2);
          break
        }
      }
      let convertedImage4 = await convertedImage3.toBuffer();      
      return convertedImage4;
    } catch (error) {
      throw new Error('Error converting image: ' + error.message);
    }
  }
}

export default ImageProcessor;
