import { useState, useEffect, useCallback } from 'react';
import { getImage } from '../api';

function ImageComponent({ imagePath, alt }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const fetchImage = useCallback(async () => {
    try {
      setImageUrl(null);
      const newImageUrl = await getImage(imagePath);
      setImageUrl(newImageUrl);
      setError(null);
    } catch (error) {
      setError("Failed to fetch image. Please try again later.");
    }
  }, [imagePath]);

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
        <div>Loading...</div>
      )}
    </div>
  );
}

export default ImageComponent;
