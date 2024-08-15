import express from 'express';
import multer from 'multer';
import cors from 'cors';
import archiver from 'archiver';
import ImageProcessor from './ImageProcessor.js';
import iconv from "iconv-lite"
import fs from 'fs/promises';
import ImageProcessorOld from './ImageProcessor-old.js';

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
//Recieve .zip and all files individually -> download
// 
class FilesAndOptions{
  constructor(files, options){
    //All options === {alt,name,format,compression,width,height}
    //[{fileData: file, name: name, format, compression, alt, width, height}, {...}]
    this.error = "";
    this.convertedImages = [];
    this.filesFixed = files;
    this.files = []; //Трябва да го задам като [] иначе push не работи
    if(files.length === 0 || options.length === 0) {
      this.error = "No files or no options provided!"
      throw Error(this.error) 
    }

    this.filesFixed = files.map((file)=>{
      const buffer = Buffer.from(file.originalname, 'latin1');
      const decodedName = buffer.toString('utf-8')
      return {...file, originalname:decodedName}
    })  

    this.filesFixed.forEach((file,i) => {
      options.forEach(option =>{
        if(file.originalname === option.name){
        
          if(option.name && option.compression && option.format){   

            this.files.push({fileData: file, ...option})            
          }else{
            this.error = "Did not provide mandatory options, name, alt, compression or format."
            throw Error(this.error)
          }}
          //Test за дублирани имена
          
      })
      if(i===files.length-1 && this.files.length !== files.length) {
          
        const msg = "Not all option names passed the file names. There are files without options, wrong names or too many options."
        this.error = this.error . msg
        // throw Error(msg)
      }  
    });
  }
  getConvertedImages(){
    return this.convertedImages;
  }
  getConvertedImage(name){
    let convertedImage = this.convertedImages.find((image)=>image.name === name)
    return convertedImage;
  }
  setConvertedImage(convertedImageBuffer, option){
    let convertedImage = {file: convertedImageBuffer, ...option}
    this.convertedImages.push(convertedImage);
  }
  setConvertedImages(convertedImages){
    this.convertedImages = convertedImages;
  }
  
  
}
  

//OK Stop the program if(FilesAndOptions.error) и върни 500 със съобщението; Във front-end-а трябва да изпише на екрана.
app.post('/convert', upload.array('files'), async (req, res) => {
  try {
    let options = JSON.parse(req.body.options)
    options = options.map((option)=>{
      let width = Number(option.width)
      let height = Number(option.height)
      return {...option, width, height}
    })
    const imageProcessor = new ImageProcessorOld(req.files[0].buffer, options[0])
    const convertedImageOld = await imageProcessor.convertToWebP()
    
    const filesAndOptions = new FilesAndOptions(req.files, options)    
    if(filesAndOptions.error){
      throw Error(filesAndOptions.error)
    }
    
    const conversionPromises = filesAndOptions.files.map(async (file, i) => {      
      let processor = new ImageProcessor(file)
      let convertedImage = await processor.convert();      
      return convertedImage;
    });

    const convertedImages = await Promise.all(conversionPromises);
    
    if(convertedImages[0].data===convertedImageOld) console.log("Same files");
    else console.log("You fucked up the backend. Shoud've tested incrementally");
    res.setHeader('Content-Type', 'multipart/form-data; boundary=--boundary');

    // Create multipart response
    let responseBody = '';
    convertedImages.forEach((img, i) => {
      responseBody += `--boundary\r\n`;
      responseBody += `Content-Disposition: form-data; name="${img.name}"; filename="${img.name}"\r\n`;
      if(img.format === "jpg") img.format = "jpeg"
      responseBody += `Content-Type: image/${img.format}\r\n\r\n`;
      responseBody += convertedImageOld;
      responseBody += `\r\n`;
    });
    responseBody += '--endBoundary--';

    // // Write responseBody to a file
    // try {
    //   await fs.writeFile('test.txt', responseBody);
    // } catch (error) {
    //   console.error('Error writing file', error);
    // }
    res.send(responseBody);

  } catch (error) {
    console.error('Error converting file', error);
    res.status(500).send('Error converting file');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
