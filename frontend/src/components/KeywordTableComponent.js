import useApi from "../hooks/api";

const KeywordTableCompnent = ({ all_keywords, patchURL, refreshCallback }) => {

  const { patch } = useApi();

  const handleKeywordRemove = async (event) => {
    const keywordId = event.target.id;
    await patch(patchURL, { search_keywords: [keywordId]})
    refreshCallback();
  }

  return (
    <table className="keyword-table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Keyword</th>
          <th>Direction</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {all_keywords.map((keyword) => (
          <tr key={keyword.id}>
            <td>{keyword.category_name}</td>
            <td>{keyword.word}</td>
            <td>{keyword.direction_display}</td>
            <td>
              {keyword.tv_default ? (
                'default'
              ) : (
                <button id={keyword.id} onClick={handleKeywordRemove}>remove</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default KeywordTableCompnent;
