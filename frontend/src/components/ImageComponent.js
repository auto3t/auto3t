import { useState, useEffect } from 'react';
import { getImage } from '../api';

function ImageComponent({ image, alt }) {
  const [imageUrl, setImageUrl] = useState(image.image_blur);

  useEffect(() => {
    const fetchImage = async () => {
      const newImageUrl = await getImage(image.image);
      setImageUrl(newImageUrl);
    }
    fetchImage();

    return () => {
      URL.revokeObjectURL(imageUrl);
    };

  }, [image])

  return (
    <div>
      {imageUrl && (<img src={imageUrl} alt={alt} />)}
    </div>
  );
}

export default ImageComponent;
