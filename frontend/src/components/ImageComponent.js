import { useState, useEffect, useCallback } from 'react';
import { getImage } from '../api';

function ImageComponent({ image, alt }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const fetchImage = useCallback(async () => {
    try {
      setImageUrl(null);
      const newImageUrl = await getImage(image?.image);
      setImageUrl(newImageUrl);
      setError(null);
    } catch (error) {
      setError("Failed to fetch image. Please try again later.");
    }
  }, [image?.image_url]);

  useEffect(() => {
    fetchImage();
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [fetchImage]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {imageUrl ? (
        <img src={imageUrl} alt={alt} />
      ) : (
        <img id="loading-image" src={image?.image_blur} alt="Loading..." />
      )}
    </div>
  );
}

export default ImageComponent;
