import ImageGrid from './ImageGrid';
import { useEffect, useState } from 'react';




export default function Layout() {

  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [filesCount, setFilesCount] = useState(0);
  const [compression, setCompression] = useState(80);
  const [url, setUrl] = useState("")
  
  
  async function submitForm(event){
    event.preventDefault();
    const formData = new FormData();
    files.forEach((file, index)=>{ 
      formData.append('files', file)
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
      console.log(imageBlob)
      setUrl(urlTmp);
    } catch (e) {
      console.log(e);
      
    }
      
    
    
  }
  function handleFileChange(e) {
    let files = e.target.files;
    setFilesCount(files.length)
    setFiles(Array.from(files));
    
  }
  
  
  function handleCompressionChange(e) {
    console.log(e.target.value);
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
          <a href={url} download>Download here tmp</a>
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