import sharp from 'sharp';

class ImageProcessor {
  constructor(fileBuffer, options) {
    this.fileBuffer = fileBuffer;
    this.options = options;
  }
  
  changeFileExtension(fileName, newExtension) {
    // Extract the name of the file without the extension
    const fileNameWithoutExtension = fileName.slice(0, fileName.lastIndexOf('.'));
    
    // Ensure the new extension starts with a dot
    const extension = newExtension.startsWith('.') ? newExtension : `.${newExtension}`;
    
    // Combine the file name without extension with the new extension
    const newFileName = `${fileNameWithoutExtension}${extension}`;
    
    return newFileName;
  }

  async convertToWebP() {
    const { compression, width, height } = this.options;
    
    // Ensure parameters are numbers
    const parsedCompression = parseInt(compression, 10);
    const parsedWidth = parseInt(width, 10);
    const parsedHeight = parseInt(height, 10);

    try {
      // Use sharp to process the image
      const convertedImage = await sharp(this.fileBuffer)
        .resize(parsedWidth, parsedHeight, {
          fit: 'inside', // Ensure aspect ratio is maintained
          kernel: sharp.kernel.lanczos3 // Use Lanczos3 kernel for resizing
        })
        .webp({
          quality: parsedCompression, // Compression level (0-100)
          effort: 6, // Effort level (0-6), higher is slower but better compression
        })
        .toBuffer();

      return convertedImage;
    } catch (error) {
      throw new Error('Error converting image: ' + error.message);
    }
  }
}

export default ImageProcessor;