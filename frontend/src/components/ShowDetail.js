import ImageComponent from "./ImageComponent";

export default function ShowDetail({ showDetail }) {
  return (
    <div className="show-detail">
      <div className="show-poster">
        <ImageComponent imagePath={showDetail.image} alt='show-poster' />
      </div>
      <div className="show-description">
        <h1>{showDetail.name}</h1>
        <span className='smaller'>ID: {showDetail.remote_server_id}</span>
        <p dangerouslySetInnerHTML={{__html: showDetail.description}} />
      </div>
    </div>
  )
}
