import ImageGrid from './ImageGrid';
import { useEffect, useState } from 'react';


export default function Layout() {

  const [files, setFiles] = useState([]);
  const [compression, setCompression] = useState(80);
  const [url, setUrl] = useState("")
  const [options, setOptions] = useState([]) //с {} вътре за самите опции key:value

//фукция за обновяване на опциите
//#TODO: ИЗЦЯЛО ПРЕМАХНИ INDEX и сравнявай само по име!
const updateOptions = function(name, files, key="", value="",  resetAll=false) {
 
  
  //OK
  if(resetAll){
    setOptions([{}])
    return 
  }
 
  

  //OK
  let index = -1;
 

  files.forEach((file,i)=>{    
    if(file.name === name){
      index = i;
    }
  })
  if (index === -1) {
 
    return;
  }
 
  const optionExists = options.some((option)=>{ //OK
    if(option.name === name && key==="" && value === ""){ //Check if the same file is just re-uploaded OK
      return true//Cancel updateOptions OK
    }
    return false
  })
  
  if (optionExists){
 
      return;
  }

  

  //Използвам React useState
   setOptions((prevOptions) =>{ //трябва да върне новите опции ОК

    let newOptions = JSON.parse(JSON.stringify(prevOptions)) // Deep copy. React = immutability
    
    //Добавя нови опции, ако няма за сегашните файлове - OK
    if(index>=options.length){ //ОК
      
      let i = options.length; //Започва от първия НЕсъществуваш
 
      for (i; i<=index; i++){ //ОК
        newOptions.push({ // default values OK
          compression: 80,
          alt: "",
          width: "",
          height: "",
          type: "webp",
          name: "",
        });
      }
    }
    console.log('newOptions.length :', newOptions.length);
 


    if(!(key==="" && value === "")){
      //До сега [] с {} вътре.
    newOptions = newOptions.map((item,i) => {//минавам през всеки [{},{},...].map() OK
      //ако файла, т.е. {}, който искам да променя е сегашния в loop-а OK
      //ще spread-на всичките стойности на {} и ще задам ново key:value, като новия key е дублаж на стария, но е на-надолу в кода, за това го замества. OK
      //АКО НЕ, върни за този елемент на [] options, {}-та item, който съдържа options {} за даден файл. OK
      if(key==="" && value === ""){
        return
      }
      return i===index ? {...item, [key]: value} : item} //OK
    )
    }
 
    
    return newOptions; //
  }) 
};
  
  
  async function submitForm(event){
    event.preventDefault();
    //updateOptions("alt", "test123", 0);
    
    const formData = new FormData();
    files.forEach((file)=>{ 
      formData.append('files', file)
    })
    options.forEach((option)=>{
      formData.append('options', option)
    })
    formData.append('width', 1200)
    formData.append('height', 1200)
    formData.append('compression',compression)
    try {
      let response = await fetch("http://localhost:5000/convert",{
        method: 'POST',
        body: formData,
      })
      let imageBlob = await response.blob()
      const urlTmp = window.URL.createObjectURL(imageBlob)
      setUrl(urlTmp);
    } catch (e) {
        console.log(e);
    }
      
    
    
  }
  function handleFileChange(e) {
    let filesTemp = e.target.files;
    filesTemp = Array.from(filesTemp);
    setFiles(filesTemp);
    filesTemp.forEach((file)=>{
      updateOptions(file.name, filesTemp)
    })
  }
  useEffect(() => {
 
 
  }, [options, files])
  

  
  function handleCompressionChange(e) {
    setCompression(e.target.value);
   }

  return (
    <>  
        <header>
          <h1>SEO image optimizer-a на Драго</h1>
        </header>

        <ImageGrid />

        <section>
          <input type='file' onChange={handleFileChange} className='rounded-xl mr-2 text-lg bg-sky-400	' multiple/>
          <button type='button' className='rounded-xl px-4 border-2 border-zinc-100	p-1 text-lg mr-2 bg-yellow-500	' onClick={submitForm}>Convert</button>
          <button type='button' className='rounded-xl px-4 border-2 border-zinc-100	p-1 text-lg bg-lime-400	'>Download All!</button>
          {url==="" ? "" : <a href={url} download>Download here tmp</a>}
        </section>
        
        <section>
          <h3>Bulk edit</h3>
          <h4 className='inline-block mr-1'>Compression:</h4>
          <input type='text' name='bulkCompression' value={compression} onChange={handleCompressionChange}/>
          <h4 className='inline-block ml-2.5 mr-1'>Width:</h4>
          <input type='text' name='bulkWidth'/>
          <h4 className='inline-block ml-2.5 mr-1'>Height:</h4>
          <input type='text' name='bulkHeight' className='inline-block mx-1'/>
          <h4 className='inline-block ml-2.5 mr-1'>Format:</h4>
          <input type='radio' id='webp123' name='bulkFormat' value='webp' className='inline-block mx-1' defaultChecked/>
          <label htmlFor='webp123' className='mr-4'>Webp</label>
          <input type='radio' id='jpg123' name='bulkFormat' value='jpg'/>
          <label htmlFor='jpg123' className='mr-4'>Jpg</label>
          <input type='radio' id='png123' name='bulkFormat' value='png'/>
          <label htmlFor='png123' className='mr-4'>Png</label>
        </section>

        
    </>
  )
}