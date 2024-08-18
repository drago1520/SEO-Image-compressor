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

   constructor(filePath = process.env.FOLDER, option) {
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
    else this.name = this.#extractFileName(name)
   
    if (option.width && option.height){
      this.width = parseInt(Number(option.width), 10)
      this.height = parseInt(Number(option.height), 10)
    }
  }

  async convertToWebP() {

    try {
      // Use sharp to process the image
      const outputFileNameTemp = this.name
      const outputPathTemp = `${this.folder}\\${outputFileNameTemp}`

      const processor =  this.#sharpInstance()
      const processorResized = await this.resizeImage(processor);
      const processorWebp = await processorResized.webp({
        quality: this.compression, // Compression level (0-100)
        effort: 6, // Effort level (0-6), higher is slower but better compression
      })
      await processorWebp.toFile(outputPathTemp);

      return await this.#saveFile(outputPathTemp,'webp')

    } catch (error) {
      throw new Error('Error converting image: ' + error.message);
    }
  }

  async convertToPNG() {
    try {
      const outputFileNameTemp = this.name
      const outputPathTemp = `${this.folder}\\${outputFileNameTemp}`

      // Use sharp to process the image
      const processor =  this.#sharpInstance()
      const processorResized = await this.resizeImage(processor);
      const processorPNG = await processorResized.png({
        compressionLevel: 9,
        quality: this.compression,
        effort: 1
      })

      await processorPNG.toFile(outputPathTemp);
      return await this.#saveFile(outputPathTemp,'png')

    } catch (error) {
      throw new Error('Error converting image: ' + error.message);
    }
  }

  async convertToJPG() {
    try {
      const outputFileNameTemp = this.name
      const outputPathTemp = `${this.folder}\\${outputFileNameTemp}`
      
      // Use sharp to process the image
      const processor =  this.#sharpInstance()
      const processorResized = await this.resizeImage(processor);
      const processorJPG = await processorResized.jpeg({
        compressionLevel: 1,
        quality: this.compression
      })

      await processorJPG.toFile(outputPathTemp);
      return await this.#saveFile(outputPathTemp, 'jpg')
    } catch (error) {
      throw new Error('Error converting image: ' + error.message);
    }
  }

  #sharpInstance(){
    console.log('this.filePath :', this.filePath);

    return sharp(this.filePath)
  }

  async resizeImage(processor){

    if(this.width && this.height){
      var convertedImage =  await processor.resize(this.width, this.height, {
        fit: 'inside', // Ensure aspect ratio is maintained
        kernel: sharp.kernel.lanczos3 // Use Lanczos3 kernel for resizing
      })
    }else convertedImage = processor
    return convertedImage
  }

  #extractFileName(fileName) {
    // Extract the name of the file without the extension
    const fileNameWithoutExtension = fileName.slice(0, fileName.lastIndexOf('.'));
    
    return fileNameWithoutExtension;
  }

  async #saveFile(filePathTemp='', extention=''){
    try {
      const flushFile = async function() { //filePathTemp
      
          // Open the output file to get the file descriptor
          const fileHandle = await fs.open(filePathTemp, 'r+'); // 'r+' mode allows reading and writing
      
          // Flush the file to disk to ensure data is physically written
          await fileHandle.sync();
          console.log('Data flushed to disk successfully.');
      
          // Close the file
          await fileHandle.close();
        console.log('File closed successfully.');

      };

      const renameTempFIle = async function() { //filePathTemp && extention
        if(!extention || !filePathTemp) throw new Error('No extention or filePath provided for saving the file!')
        const outputPath = `${filePathTemp}.${extention}`
        await fs.rename(filePathTemp, outputPath)
        return outputPath
      };

      await flushFile();
      const outputPath = await renameTempFIle()
      
      return outputPath
    } catch (error) {
      console.error('Error processing or flushing image:', error);
    }
  }
}



export default ImageProcessor;