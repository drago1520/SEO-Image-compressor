import express from 'express';
import multer from 'multer';
import cors from 'cors';
import archiver from 'archiver';
import iconv from "iconv-lite"
import ImageProcessorOld from './ImageProcessor-old.js';
import 'dotenv/config'
import { performance } from 'perf_hooks';
import path from 'path';
import 'dotenv/config'
import { promises as fs } from 'fs';


//! ВНИМАНИЕ: Приемам Файловете с 7bit encoding !//
//~ Замества оригиналната снимка, ако се преубразува в същия формат 


const app = express();
app.use(cors());
app.use(express.json());

let convertUtf8 = (string) => Buffer.from(string, 'latin1').toString('utf-8');
const folder = process.env.FOLDER
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
      if(file.encoding === '7bit'){
        file.originalname = convertUtf8(file.originalname)
      }

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

  async convert(){
    this.urls = [];
    for (let i = 0; i < this.files.length; i++) { //можеше и с forEach, duh...
      const filePath = this.files[i].file.path;
      const options = this.files[i].options
      const imageProcessor = new ImageProcessorOld(filePath, options)
      const convertedImageUrlTemp = await imageProcessor.convertToPNG()
      this.urls.push(convertedImageUrlTemp)
    }
    if(this.urls.length !== this.files.length) throw new Error("Some files were not converted!")
    return this.urls
  }

   async createZip(outputDir = process.env.FOLDER, filesUrl = this.urls){
    if(outputDir === process.env.FOLDER && process.env.SAVE_FOLDER) outputDir = process.env.SAVE_FOLDER;
    //Отваря се нов, несъществуващ файл; Ако съществува, ще бъде отворен за запис
    let dirFileNames = await FilesAndOptionsHandler.getDirFilenames(outputDir);
    let zipUrl = `${outputDir}/ready.zip`
    for(let i=0; dirFileNames.includes(zipUrl); i++){
      zipUrl=`${outputDir}/ready${i}.zip`
    }
    const output = await fs.open(zipUrl, "w");

    const archive = archiver('zip', {
      zlib: {level: 1},
      forceLocalTime: true
      //comment: "Ако искам някъв коментар към .zip"
    })

    //Инициализира се Stream, който да ползваш, за да пишеш във файла
    const outputStream = output.createWriteStream();
    //Archiver (zip) ще помпи към този стрийм
    archive.pipe(outputStream)

    //Event listener
    outputStream.on('close',() =>{
      console.log('ZIP file has been finalized and the output file descriptor has closed.');
    })

    outputStream.on('end',()=>{
      console.log('Data has been drained')
    })

    //Набивам файловете към буфера на archiver
    for(const url of filesUrl){
      const fileName = path.basename(url)
      console.log('fileName :', fileName);
      archive.file(url, {name: fileName})
      
    }

    //"сложил съм всички файлове. Записвай в стрийма, които отива към файла(.zip)."
    await archive.finalize();
    //Затвори файла (close the file descriptor - освободи го), за да може да се ползва за нещо друго.
    await output.close();
    return zipUrl
  }

  static async getDirFilenames(folder){
    try {
      const filenames = await fs.readdir(folder);

      return filenames
    } catch (e) {
      
    }
  }

}

//OK Stop the program if(FilesAndOptions.error) и върни 500 със съобщението; Във front-end-а трябва да изпише на екрана.
app.post('/convert', upload.array('files'), async (req, res) => {
  try {
    const start = performance.now();
    console.log('start :', start);
    
    let filesAndOptions = new FilesAndOptionsHandler(req.files,req.body.options)        
    
    // filesAndOptions.map(async(fileAndOptions)=>{
    //   const imageProcessor = new ImageProcessorOld(fileAndOptions.file.path, fileAndOptions.options)
    //   const convertedImageUrlTemp = await imageProcessor.convertToPNG()
    // })
    let urls = await filesAndOptions.convert() 
    let zipUrl = await filesAndOptions.createZip()
    const end = performance.now()
    const elapsedTime = end - start; // Time in milliseconds
    console.log(`Elapsed time: ${elapsedTime} ms`);
 
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




