import express from 'express';
import multer from 'multer';
import cors from 'cors';
import archiver from 'archiver';
import iconv from "iconv-lite"
import ImageProcessorOld from './ImageProcessor-old.js';

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
//Recieve .zip and all files individually -> download
// 
  

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
    // Create a JSON object
    res.set('Content-Type', 'image/webp');
    res.send(convertedImageOld)
    console.log("Sent!")

  } catch (error) {
    console.error('Error converting file', error);
    res.status(500).send('Error converting file');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
