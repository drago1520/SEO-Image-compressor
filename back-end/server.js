import express from 'express';
import multer from 'multer';
import cors from 'cors';
import archiver from 'archiver';
import iconv from "iconv-lite"
import ImageProcessorOld from './ImageProcessor-old.js';
import 'dotenv/config'
//! ВНИМАНИЕ: Приемам Файловете с 7bit encoding !// 


const app = express();
app.use(cors());
app.use(express.json());

let convertUtf8 = (string) => Buffer.from(string, 'latin1').toString('utf-8');
const folder = process.env.FOLDER
console.log('folder :', folder);
const storage = multer.diskStorage({
  destination: (req, file,cb) =>{
    cb(null,folder)
  },
  filename: (req,file,cb)=>{
    const transliteRatedName = `${convertUtf8(file.originalname)}` //Това трябва да си е оригиналното име!
    cb(null,transliteRatedName)
  }
})
const upload = multer({ storage: storage });
//Recieve .zip and all files individually -> download

class FilesAndOptionsHandler{
  //целта на класа е да придаде структура на файловете и опциите. Цел: [{file:req.files[i], options: options}, file2, file3,...]
  
  constructor(requestFiles, requestOptions){
    if (!requestFiles || !Array.isArray(requestFiles)) {
      throw new Error('Invalid input: requestFiles must be an array of files.');
    }
    if (!requestOptions || typeof requestOptions !== 'string') {
      throw new Error('Invalid input: requestOptions must be a JSON string.');
    }

    let options = JSON.parse(requestOptions).map((option)=>{
      let width = Number(option.width)
      let height = Number(option.height)
      return {...option, width, height}
    })

    this.files = requestFiles.map((file)=>{
      console.log('Original file :', file);
      if(file.encoding === '7bit'){
        file.originalname = convertUtf8(file.originalname)
      }
      console.log('UTF-8 file :', file);

      const [optionsForThisFile] = options.filter(option=>{ //{}
        if(option.name === file.originalname) return true
        else return false
      })
      if (optionsForThisFile.length === 0) {
        throw new Error(`Warning: No matching options found for file ${file.originalname}.`);
      }
      return {file: file, options: optionsForThisFile}
    })

  }
}
  

//OK Stop the program if(FilesAndOptions.error) и върни 500 със съобщението; Във front-end-а трябва да изпише на екрана.
app.post('/convert', upload.array('files'), async (req, res) => {
  try {
    
    let filesAndOptions = new FilesAndOptionsHandler(req.files,req.body.options).files    

    filesAndOptions.forEach(async(fileAndOptions)=>{
      const imageProcessor = new ImageProcessorOld(filesAndOptions[0].file.path, filesAndOptions[0].options)
      const convertedImageUrl = await imageProcessor.convertToJPG()
    })
    
    // // Create a JSON object
    // res.set('Content-Type', 'image/jpeg'); //#Изпращам JSON с линкове
    // res.send(convertedImageOld)
    // console.log("Sent!")

  } catch (error) {
    console.error('Error converting file', error);
    res.status(500).send('Error converting file');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
