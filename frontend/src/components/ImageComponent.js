import { useState, useEffect } from 'react';
import { getImage } from '../api';

function ImageComponent({ imagePath, alt }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    async function fetchImage() {
      const newImageUrl = await getImage(imagePath);
      setImageUrl(newImageUrl);
    }

    fetchImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imagePath]);

  return (
    <div>
      {imageUrl ? (
        <img src={imageUrl} alt={alt} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default ImageComponent;
