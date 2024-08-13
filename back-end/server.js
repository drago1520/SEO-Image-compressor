import express from 'express';
import multer from 'multer';
import cors from 'cors';
import archiver from 'archiver';
import ImageProcessor from './ImageProcessor.js';
import iconv from "iconv-lite"

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class FilesAndOptions{
  constructor(files, options){
    //All options === {alt,name,format,compression,width,height}
    //[{fileData: file, name: name, format, compression, alt, width, height}, {...}]
    this.error = "";
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
}
//OK Stop the program if(FilesAndOptions.error) и върни 500 със съобщението; Във front-end-а трябва да изпише на екрана.
app.post('/convert', upload.array('files'), async (req, res) => {
  try {
    let options = JSON.parse(req.body.options)
    console.log('req.body.options :', req.body.options);
    const filesAndOptions = new FilesAndOptions(req.files, options)    
    if(filesAndOptions.error){
      throw Error(filesAndOptions.error)
    }
    const convertedImages = await Promise.all(filesAndOptions.files.map(async (file)=>{
      let processor = new ImageProcessor(file)
      
      return await processor.convert();
    })) 
    console.log('convertedImages :', convertedImages.length);
    res.set('Content-Type', 'image/webp');
    res.send(convertedImages);
  } catch (error) {
    console.error('Error converting file', error);
    res.status(500).send('Error converting file');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
