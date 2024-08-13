import ImageGrid from './ImageGrid';
import { useEffect, useState } from 'react';


export default function Layout() {

  const [files, setFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState("")
  const [defaultOptions, setDefaultOptions] = useState({compression: 80, format: "webp"})
  const [bulkOptions, setBulkOptions] = useState({})
  const [urls, setUrls] = useState([])
  const [options, setOptions] = useState([{
    name: "default13241412434q3r235r2342342$^$refs.png",
  }]) //с {} вътре за самите опции key:value //All options === {alt,name,format,compression,width,height}

//фукция за обновяване на опциите
//OK : ИЗЦЯЛО ПРЕМАХНИ INDEX и сравнявай само по име! OK
// ЗНАМ, функциите ми не са чисти...
const updateOptions = function(name, filesNew, key="", value="",  resetAll=false) {
 
  let newOptions = JSON.parse(JSON.stringify(options)) // Deep copy. React = immutability
  
  //OK
  if(resetAll){
    setOptions([{
      name: "default13241412434q3r235r2342342$^$refs.png",
      ...defaultOptions
    }])
    return 
  }
 
// ОК Направих й тест, работи перфе. синхронизира опциите, точно колкото файла са.
// OK Ако няма опция спрямо файловете добави. След като е добавило за всички, провери пак. Ако няма опция, премахни я
  const syncOptions = function() {
    
  //Assign default values to missing options based on the current files
  let temp = filesNew.filter((file)=>{ //Вземи имената на required files without options

    let temp2 = newOptions.filter((option)=>{
      if(file.name!==option.name) {
        // console.log(`${file.name}  vs  ${option.name}`);
        
        return true
      }
      else return false
      
    }) //Има ли опция за този required файл?
    // console.log('temp2 :', temp2);
    if(temp2.length===1) { 
      return true //Ако няма, върни файла, за да използваш името му и да зададеш default опция.
    }
    else return false //Ако има, не връщай името на файла, че да се задава нов default required option.
  })
  let optionsToFIllNames = temp.map((option)=>option.name) //Вземи само имената на required files without options
//  console.log('optionsToFIll :', optionsToFIllNames);
  optionsToFIllNames.forEach((optionToFillName)=>{ //Добави нови default required options
    newOptions.push({
      name: optionToFillName,
      ...defaultOptions
    })
  })
//До тук е напълнило опциите с нужните опции спрямо файловете, но още може да има опции, които са излишни


  //Removing option based on current files
  newOptions = newOptions.filter((option)=>{
    let isRequiredOption = filesNew.some((file)=>file.name === option.name) //Има ли файлове за тази опция?
    if(isRequiredOption) { //Ако има, запази опцията
//      console.log("This is a required option, i.e. the file exists and there is an option for it. Keep it!") 
      return true
    }
    else{ //Ако няма, премахни я. Сигурно файла е изтрит
//      console.log("No file found for this option. Probably the file was removed. Removing option.") 
      return false
    }
  })
  
   if(newOptions.length === 0){
    newOptions.push({
      name: "default13241412434q3r235r2342342$^$refs.png", //Бъг - оставяше 2 опции с важно име.
      ...defaultOptions
    })
    console.log("Options at lenght 0, need to add one option at least"); 
  }
  
};
syncOptions();


  const modifyExistingOptions = () =>{
    if(!(key==="" && value==="")){
     newOptions = newOptions.map((option)=>{
      let modifiedOption = option.name === name ? {...option, [key]:value} : option
//      console.log('modifiedOption :', modifiedOption);
       return modifiedOption
      })
  }
//  else console.log(`Did not modify any options. No key and value provided`);
    
  }
  modifyExistingOptions();
 console.log('newOptions :', newOptions);

  //Използвам React useState
   setOptions(newOptions) 
};
  
  
  async function submitForm(event){
    event.preventDefault();
    //Mandatory name alt compression format
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
      //# convertImagesToUrls - да превърне всички снимки в url-и
      const convertImageToUrls = async function(response) {
        if(response.ok){
          let imageBlob = await response[0].blob()
          const urlTmp = []
          urlTmp.push(window.URL.createObjectURL(imageBlob))
          setUrls(urlTmp);
        }else setErrorMsg("Response from server is not ok")
        
      };
      await convertImageToUrls(response);
    } catch (e) {
       console.log(e);
    }
      
  }
  function handleFileChange(e) {
    let filesTemp = e.target.files;
    filesTemp = Array.from(filesTemp);
    setFiles(filesTemp);
    filesTemp.forEach((file)=>{
      //# Не праща грешни имена - #снимка.gif няква снимка със знаци.jpg MTPH1416.jpg
      updateOptions(file.name, filesTemp)
    })
  }

  
  useEffect(() => {  
    // handleBulkChange Test # Пиша bulk, update-ва всички. Пиша друг bulk, не трябва да ъпдейтва със стария bulk.
    // handleFileChange Test console.log(`Expected options with names: ${files.map(file => file.name).join(', ')}, and got these options: \n${files.map(option => option.name).join(', ')}`);
  }, [options])


 useEffect(() => {
  let key = Object.keys(bulkOptions)[0]
  let value = Object.values(bulkOptions)[0]
  files.forEach((file) => {
    if(key && value){
      updateOptions(file.name, files, key, value)
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
          <button type='button' className='rounded-xl px-4 border-2 border-zinc-100	p-1 text-lg bg-lime-400	'>Download All!</button>
          {
            urls.map(url=>(<a href={url} key={url} download>Download here tmp</a>))
          }
          {/* map urls */}
        </section>
        
        <section>
          <h3>Bulk edit</h3>
          <h4 className='inline-block mr-1'>Compression:</h4>
          <input type='number'  name='compression' value={defaultOptions.compression} onChange={handleBulkChange}/>
          <h4 className='inline-block ml-2.5 mr-1'>Width:</h4>
          <input type='number' name='width' value={defaultOptions.width} onChange={handleBulkChange}/>
          <h4 className='inline-block ml-2.5 mr-1'>Height:</h4>
          <input type='number' name='height' className='inline-block mx-1' value={defaultOptions.width} onChange={handleBulkChange}/>
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