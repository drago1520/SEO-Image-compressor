import ImageGrid from './ImageGrid';
import { useState } from 'react';


export default function Layout() {

  const [formData, setFormData] = useState({});
  
  function submitForm(event){
    event.preventDefault();
    
  }

  return (
    <>  
        <header>
          <h1>SEO image optimizer-a на Драго</h1>
        </header>

        <ImageGrid />

        <section>
          <input type='file' className='rounded-xl mr-2 text-lg bg-sky-400	' multiple/>
          <button type='button' className='rounded-xl px-4 border-2 border-zinc-100	p-1 text-lg mr-2 bg-yellow-500	' onClick={submitForm}>Convert</button>
          <button type='button' className='rounded-xl px-4 border-2 border-zinc-100	p-1 text-lg bg-lime-400	'>Download All!</button>
        </section>
        
        <section>
          <h3>Bulk edit</h3>
          <h4 className='inline-block mr-1'>Compression:</h4>
          <input type='text' name='bulkCompression' value="80"/>
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