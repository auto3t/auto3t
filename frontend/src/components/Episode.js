const Episode = ({ episode }) => {
  return (
    <div key={episode.id}>
      <p>Episode: {episode.title}</p>
    </div>
  );
};

export default Episode;
