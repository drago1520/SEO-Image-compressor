import React, { useState } from 'react';
import axios from 'axios';


class TextFormating{

  constructor(inputLang = "bg"){
    this.language = inputLang;
  }

  //methods
  language(){
    return this.language;
  }

  static transliterate(text){

      function replaceSpacesWithHyphens(text) {
        return text.replace(/\s+/g, '-');
      }
        // // Example usage
        // let phrase = `Трансфер из ${bulgarianCities[i]} в Стамбул цена`;
        // console.log(phrase);
        // console.log(replaceSpacesWithHyphens(transliterateBulgarian(phrase)));
        // console.log("\n");
      
      function transliterateBulgarian(text) {
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
        text = text.replace(/ия\b/g, 'ia');
      
        // Special case for "България"
        if (text === 'България') return 'Bulgaria';
      
        // Transliterating the texting
        return text.split('').map(char => {
            // Checking for special cases
            if (transliterationMap[char + text.charAt(1)]) {
                text = text.slice(1); // Skipping the next character
                return transliterationMap[char + text.charAt(0)];
            }
            return transliterationMap[char] || char;
        }).join('');
      }

      let transliteratedText = transliterateBulgarian(text);
      let readyText = replaceSpacesWithHyphens(transliteratedText);
      return readyText;
    
  }

}



const FileUpload = () => {
  const [files, setFiles] = useState([1]);
  const [compression, setCompression] = useState(80);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [alts, setAlts] = useState(["1232"]);
  const [filenames, setFilenames] = useState([""]);
  const [folder, setFolder] = useState({})

  const changeAlts = (e) => {

    //! Добави от кой input идва!
    console.log(e.target.name)
    let text = e.target.value;
    setAlts(text);
    if(text){
      setFilenames(TextFormating.transliterate(text));
      console.log(filenames)

    }
  }

  const handleFileChange = (e) => {
    let files = e.target.files;
    setFiles(Array.from(files));
  };

  const handleConvert = async () => {

    const converted = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('compression', compression);
        formData.append('width', width);
        formData.append('height', height);

        try {
          const response = await axios.post('http://localhost:5000/convert', formData, {
            responseType: 'blob',
          });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          return { name: file.name, url };
        } catch (error) {
          console.error('Error converting file', error);
          return null;
        }
      })
    );
    setConvertedFiles(converted.filter(file => file !== null));
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} />
      <label>
        Compression (0-100):
        <input
          type="number"
          value={compression}
          onChange={(e) => setCompression(e.target.value)}
        />
      </label>
      <label>
        Width:
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
        />
      </label>
      <label>
        Height:
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
      </label>
      <button onClick={handleConvert}>Convert</button>
      {convertedFiles.length > 0 && (
        <div>
          <h2>Converted Files</h2>
          <ul>
            {convertedFiles.map((file, index) => (
              <li key={index}>
                <a href={file.url} download={`converted-${file.name}`}>
                  Download {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
