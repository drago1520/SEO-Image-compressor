import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import 'dotenv/config'



class OptionsHandler{
  transliterate(string=""){
    if (!string){
      this.error = "No input name provided!"
      return this.error
    }

    function replaceSpacesWithHyphens(str) {
      return str.replace(/\s+/g, '-');
    }
    function transliterateBulgarian(str) {
      const transliterationMap = {
          'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v',
          'Г': 'G', 'г': 'g', 'Д': 'D', 'д': 'd', 'Е': 'E', 'е': 'e',
          'Ж': 'Zh', 'ж': 'zh', 'З': 'Z', 'з': 'z', 'И': 'I', 'и': 'i',
          'Й': 'Y', 'й': 'y', 'К': 'K', 'к': 'k', 'Л': 'L', 'л': 'l',
          'М': 'M', 'м': 'm', 'Н': 'N', 'н': 'n', 'О': 'O', 'о': 'o',
          'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's',
          'Т': 'T', 'т': 't', 'У': 'U', 'у': 'u', 'Ф': 'F', 'ф': 'f',
          'Х': 'H', 'х': 'h', 'Ц': 'Ts', 'ц': 'ts', 'Ч': 'Ch', 'ч': 'ch',
          'Ш': 'Sh', 'ш': 'sh', 'Щ': 'Sht', 'щ': 'sht', 'Ъ': 'A', 'ъ': 'a',
          'Ь': 'Y', 'ь': 'y', 'Ю': 'Yu', 'ю': 'yu', 'Я': 'Ya', 'я': 'ya',
          // Special cases
          'дж': 'dzh', 'дз': 'dz', 'ьо': 'yo', 'йо': 'yo'
      };
    
      // Handling end-of-word 'ия' rule
      str = str.replace(/ия\b/g, 'ia');
    
      // Special case for "България"
      if (str === 'България') return 'Bulgaria';
    
      // Transliterating the string
      return str.split('').map(char => {
          // Checking for special cases
          if (transliterationMap[char + str.charAt(1)]) {
              str = str.slice(1); // Skipping the next character
              return transliterationMap[char + str.charAt(0)];
          }
          return transliterationMap[char] || char;
      }).join('');
    }

    const transliterated = replaceSpacesWithHyphens(transliterateBulgarian(string))
    return transliterated

  }
}

class ImageProcessor extends OptionsHandler {//This class is used to resize images and convert them to specified format and rename them 

   constructor(filePath, option = [], replaceOldFile = true) {
    super();
    this.filePath = filePath
    this.folder = path.dirname(this.filePath)
    this.option = option;
    const {alt, width, height, compression, format, name} = option
    this.width = width
    this.height = height
    this.alt = alt
    this.compression = parseInt(Number(compression),10)
    this.format = format
    this.fullName = option.name
    if(alt) this.name = this.transliterate(name)
    else this.name = this.__extractFileName(name)
   
    if (option.width && option.height){
      this.width = parseInt(Number(option.width), 10)
      this.height = parseInt(Number(option.height), 10)
    }
  }

  async __convertToWebP() {

    try {
      // Use sharp to process the image
      const outputFileNameTemp = this.name
      const outputPathTemp = `${this.folder}\\${outputFileNameTemp}`

      const processor =  this.__sharpInstance()
      const processorResized = await this.__resizeImage(processor);
      const processorWebp = await processorResized.webp({
        quality: this.compression, // Compression level (0-100)
        effort: 6, // Effort level (0-6), higher is slower but better compression
      })
      await processorWebp.toFile(outputPathTemp);

      return await this.__saveFile(outputPathTemp,'webp', outputFileNameTemp)

    } catch (error) {
      throw new Error('Error converting image: ' + error.message);
    }
  }

  async __convertToPNG() {
    try {
      const outputFileNameTemp = this.name
      const outputPathTemp = `${this.folder}\\${outputFileNameTemp}`

      // Use sharp to process the image
      const processor =  this.__sharpInstance()
      const processorResized = await this.__resizeImage(processor);
      const processorPNG = await processorResized.png({
        compressionLevel: 9,
        quality: this.compression,
        effort: 10
      })

      await processorPNG.toFile(outputPathTemp);
      return await this.__saveFile(outputPathTemp,'png', outputFileNameTemp)

    } catch (error) {
      throw new Error('Error converting image: ' + error.message);
    }
  }

  async __convertToJPG() {
    try {
      const outputFileNameTemp = this.name
      const outputPathTemp = `${this.folder}\\${outputFileNameTemp}`
      
      // Use sharp to process the image
      const processor =  this.__sharpInstance()
      const processorResized = await this.__resizeImage(processor);
      const processorJPG = await processorResized.jpeg({
        quality: this.compression
      })

      await processorJPG.toFile(outputPathTemp);
      return await this.__saveFile(outputPathTemp, 'jpg', outputFileNameTemp)
    } catch (error) {
      throw new Error('Error converting image: ' + error.message);
    }
  }
  async convert(){
  switch(this.format){
    case 'jpg':
      return this.__convertToJPG()
    case 'png':
      return this.__convertToPNG()
    case 'webp':
      return this.__convertToWebP()
  }
  }

  __sharpInstance(){

    return sharp(this.filePath)
  }

  async __resizeImage(processor){

    if(this.width && this.height){
      var convertedImage =  await processor.resize(this.width, this.height, {
        fit: 'inside', // Ensure aspect ratio is maintained
        kernel: sharp.kernel.lanczos3 // Use Lanczos3 kernel for resizing
      })
    }else convertedImage = processor
    return convertedImage
  }

  __extractFileName(fileName) {
    // Extract the name of the file without the extension
    const fileNameWithoutExtension = fileName.slice(0, fileName.lastIndexOf('.'));
    
    return fileNameWithoutExtension;
  }

  async __saveFile( filePathTemp='', extention='', fileNameTemp=""){
    try {
      let outputPath;

      const renameTempFIle = async function() { //filePathTemp && extention && fileNameTemp
        if(!extention || !filePathTemp) throw new Error('No extention or filePath provided for saving the file!')
        if(process.env.SAVE_FOLDER) {outputPath = `${process.env.SAVE_FOLDER}/${fileNameTemp}.${extention}`}
        else {outputPath = `${filePathTemp}.${extention}`}
        await fs.rename(filePathTemp, outputPath)
        return outputPath
      };

      outputPath = await renameTempFIle()
      
      return outputPath
    } catch (error) {
      if(error.syscall === 'rename' && error.errno === -4058){
        await fs.mkdir(process.env.SAVE_FOLDER, {recursive: true})
        let outputPath = "";
        if(process.env.SAVE_FOLDER) {outputPath = `${process.env.SAVE_FOLDER}/${fileNameTemp}.${extention}`}
        else {outputPath = `${filePathTemp}.${extention}`}
        await fs.rename(filePathTemp, outputPath)
        return outputPath
      }
      console.error('Error processing or flushing image:', error);
    }
  }
}



export default ImageProcessor;