import express from 'express';
import multer from 'multer';
import cors from 'cors';
import ImageProcessor from './ImageProcessor.js';

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/convert', upload.single('files'), async (req, res) => {
  try {
    const { compression, width, height } = req.body;
    const fileBuffer = req.file.buffer;

    const options = {
      compression,
      width,
      height,
    };

    const imageProcessor = new ImageProcessor(fileBuffer, options);
    const convertedImage = await imageProcessor.convertToWebP();
    console.log(`This is the converted image ${convertedImage}`);
    res.set('Content-Type', 'image/webp');
    res.send(convertedImage);
    Buffer.fill(0);
  } catch (error) {
    console.error('Error converting file', error);
    res.status(500).send('Error converting file');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
