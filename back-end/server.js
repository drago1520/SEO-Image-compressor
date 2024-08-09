import express from 'express';
import multer from 'multer';
import cors from 'cors';
import ImageProcessor from './ImageProcessor.js';

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class UploadedFile{
  constructor(file, options){
    const {width, height, alt, format} = options
    this.file = file
    this.width = width
    this.height = height
    this.alt = alt
    this.format = format
  }
}

app.post('/convert', upload.array('files'), async (req, res) => {
  try {
    const { compression, width, height } = req.body;
    const fileBuffer = req.files[0].buffer;

    const options = {
      compression,
      width,
      height,
    };

    const imageProcessor = new ImageProcessor(fileBuffer, options);
    const convertedImage = await imageProcessor.convertToWebP();
    res.set('Content-Type', 'image/webp');
    res.send(convertedImage);
  } catch (error) {
    console.error('Error converting file', error);
    res.status(500).send('Error converting file');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
