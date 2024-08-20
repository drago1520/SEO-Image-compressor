import ImageGrid from './ImageGrid';
import { useEffect, useState } from 'react';
import updateOptions from './UpdateOptions';

export default function Layout() {

  const [files, setFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState("")
  const [defaultOptions, setDefaultOptions] = useState({compression: 80, format: "png", id: Date.now(), width: "", height: ""})
  const [bulkOptions, setBulkOptions] = useState({})
  const [urls, setUrls] = useState([])
  const [id, setId] = useState([])
  const [options, setOptions] = useState([{
    name: "default13241412434q3r235r2342342$^$refs.png",
  }]) //с {} вътре за самите опции key:value //All options === {alt,name,format,compression,width,height, id: timestamp}

  async function submitForm(event){
    event.preventDefault();
    //Mandatory name compression format
    const formData = new FormData();
    let JSON_options = JSON.stringify(options)
    files.forEach((file)=>{
      formData.append('files', file)
    })
    //Options are broken
    formData.append('options', JSON_options)    
    
    try {

          let response = await fetch("http://localhost:5000/convert",{
            method: 'POST',
            body: formData,
          })
          // Дали проблема е от изпратените данни? - Да, но не само 
          //Или от client-side? - Да
          if(response.ok){
            console.log('response.ok :', response.ok);
              let url = URL.createObjectURL(await response.blob())
              setUrls([url])
            } else setErrorMsg("Response from server is not ok")   

        }catch (e) {
          console.log(e);
        }
      
  }
  function handleFileChange(e) {
    let filesTemp = e.target.files;
    filesTemp = Array.from(filesTemp);
    let filesWithId = filesTemp.map((file)=>{
      let idTemp;
      setTimeout(() => {
        idTemp = Date.now();
        setId([...id, idTemp]);
        file.id = idTemp;
      }, 10);
      return file
    })
    setFiles(filesWithId);
    filesWithId.forEach((file)=>{
      updateOptions(file.name, filesWithId, defaultOptions, setOptions, options)
    })
  }

  
  useEffect(() => {  
    // handleFileChange Test console.log(`Expected options with names: ${files.map(file => file.name).join(', ')}, and got these options: \n${files.map(option => option.name).join(', ')}`);
  }, [options])
  useEffect(() => {  
     console.log(urls)
    // handleFileChange Test console.log(`Expected options with names: ${files.map(file => file.name).join(', ')}, and got these options: \n${files.map(option => option.name).join(', ')}`);
  }, [urls])

 useEffect(() => {
  let key = Object.keys(bulkOptions)[0]
  let value = Object.values(bulkOptions)[0]
  files.forEach((file) => {
    if(key && value){
      updateOptions(file.name, files, defaultOptions, setOptions, options, false, key, value)
    }
  })
 }, [bulkOptions])

 useEffect(()=>{
  setTimeout(()=>{
    if(errorMsg){
      setErrorMsg("") 
    }
  }, 5000)
 }, [errorMsg])
  

  //Тест - Пиша bulk, update-ва всички. Пиша друг bulk, не трябва да ъпдейтва със стария bulk.
  function handleBulkChange(e) {
    //e.target.value && e.target.name
    let key = e.target.name;
    let value = e.target.value;
    setDefaultOptions({...defaultOptions, [key]:value})
    setBulkOptions({[key]:value})
   }

  return (
    <>  
        <header>
          <h1>SEO image optimizer-a на Драго</h1>
          {errorMsg ? <h1 className="text-red-600	animate-bounce">{errorMsg}</h1> : ""}
        </header>

        <ImageGrid />

        <section>
          <input type='file' onChange={handleFileChange} className='rounded-xl mr-2 text-lg bg-sky-400	' multiple/>
          <button type='button' className='rounded-xl px-4 border-2 border-zinc-100	p-1 text-lg mr-2 bg-yellow-500	' onClick={submitForm}>Convert</button>
          <button type='button' className='rounded-xl px-4 border-2 border-zinc-100	p-1 text-lg mr-2 bg-lime-400	'>Download All!</button>
          <button type='button' className='rounded-xl px-4 border-2 border-zinc-100 p-1 text-lg bg-red-500' onClick={() => setUrls([])}>Reset URLs</button>
          {
            urls.map(url=>(<a href={url} key={url} className='rounded-xl px-4 border-2 border-zinc-100 p-1 text-lg bg-lime-400' download>Download here</a>))
          }
          {/*  */}
          {/* map urls */}
        </section>
        
        <section>
          <h3>Bulk edit</h3>
          <h4 className='inline-block mr-1'>Compression:</h4>
          <input type='number'  name='compression' value={defaultOptions.compression} onChange={handleBulkChange}/>
          <h4 className='inline-block ml-2.5 mr-1'>Width:</h4>
          <input type='number' name='width' value={defaultOptions.width} onChange={handleBulkChange}/>
          <h4 className='inline-block ml-2.5 mr-1'>Height:</h4>
          <input type='number' name='height' className='inline-block mx-1' value={defaultOptions.height} onChange={handleBulkChange}/>
          <h4 className='inline-block ml-2.5 mr-1'>Format:</h4>
          <input type='radio' id='webp123' name='format' value='webp' className='inline-block mx-1' defaultChecked={defaultOptions.format === "webp"} onChange={handleBulkChange}/>
          <label htmlFor='webp123' className='mr-4'>Webp</label>
          <input type='radio' id='jpg123' name='format' value='jpg' defaultChecked={defaultOptions.format === "jpg"} onChange={handleBulkChange}/>
          <label htmlFor='jpg123' className='mr-4'>Jpg</label>
          <input type='radio' id='png123' name='format' value='png' defaultChecked={defaultOptions.format === "png"} onChange={handleBulkChange}/>
          <label htmlFor='png123' className='mr-4'>Png</label>
        </section>
    </>
  )
}//All options === {alt,name,format,compression,width,height}
