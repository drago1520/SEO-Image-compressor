
import SingleImage from "./singleImage"

function ImageGrid() {
  return (
    <div className='grid grid-cols-4 gap-5 mb-5 items-center justify-center'>
        <SingleImage />
        <SingleImage />
        <SingleImage />
        <SingleImage />
    </div>
  )
}
export default ImageGrid