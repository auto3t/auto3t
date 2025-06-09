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
  className?: string
}

const ImageComponent: React.FC<ImageComponentInterface> = ({
  image,
  alt,
  className = '',
}) => {
  const { getImage } = useApi()
  const [imageUrl, setImageUrl] = useState(image.image_blur)

  useEffect(() => {
    const fetchImage = async () => {
      let newImageUrl
      if (
        image.image.startsWith('/static') ||
        image.image.startsWith('/assets')
      ) {
        newImageUrl = image.image
      } else {
        newImageUrl = await getImage(image.image)
      }
      setImageUrl(newImageUrl)
    }
    fetchImage()

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [image.image])

  return (
    <div className={className}>
      {imageUrl && <img className="w-full" src={imageUrl} alt={alt} />}
    </div>
  )
}

export default ImageComponent
