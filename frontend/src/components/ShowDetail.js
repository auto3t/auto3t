import { useState } from "react";
import ImageComponent from "./ImageComponent";

export default function ShowDetail({ showDetail }) {

  const [showShowDetails, setShowDetails] = useState(false);

  const toggleShowDetails = () => {
    setShowDetails(!showShowDetails);
  }

  return (
    <div className="show-detail">
      <div className="show-detail-header">
        <div className="show-poster">
          <ImageComponent imagePath={showDetail.image} alt='show-poster' />
        </div>
        <div className="show-description">
          <h1>{showDetail.name}</h1>
          <span className='smaller'>ID: {showDetail.remote_server_id}</span>
          <p dangerouslySetInnerHTML={{__html: showDetail.description}} />
        </div>
      </div>
      <button onClick={toggleShowDetails}>
        {showShowDetails ? "Hide" : "Configure"}
      </button>
      {showShowDetails && (
        <p>Overwrite Search Name: {showDetail.search_name}</p>
      )}
    </div>
  )
}
