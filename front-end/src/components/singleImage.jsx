
const SingleImage = () => {
  return (
    <div className='h-full grid grid-cols-4 grid-rows-4 text-wrap gap-4 bg-sky-200 text-center'>
            <h3 className='col-start-1 col-end-5'>image.png</h3>
            <h4>Име на файл</h4>
            <input className='col-start-2 col-end-4' placeholder='name' required/>
            <input placeholder='compression' required/>
            <select name="format" required>
                <option value="jpg" defaultChecked>webp</option>
                <option value="webp">jpg</option>
                <option value="png">png</option>
            </select>
            <input className='col-start-2 col-end-5' placeholder='alt' />
            <h4>Височина:</h4>
            <input placeholder='височина' />
            <h4>Широчина:</h4>
            <input placeholder='широчина' />
    </div>
  )
}
export default SingleImage