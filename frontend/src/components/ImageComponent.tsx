import { useState, useEffect } from 'react'
import useApi from '../hooks/api'

export type ImageType = {
  image_url?: string
  image: string
  image_blur?: string
}

interface ImageComponentInterface {
  image: ImageType
  alt: string
}

const ImageComponent: React.FC<ImageComponentInterface> = ({ image, alt }) => {
  const { getImage } = useApi()
  const [imageUrl, setImageUrl] = useState(image.image_blur)

  useEffect(() => {
    const fetchImage = async () => {
      const newImageUrl = await getImage(image.image)
      setImageUrl(newImageUrl)
    }
    fetchImage()

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [image])

  return <div>{imageUrl && <img src={imageUrl} alt={alt} />}</div>
}

export default ImageComponent
