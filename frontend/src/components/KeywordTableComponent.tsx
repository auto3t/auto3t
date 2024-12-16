import useApi from '../hooks/api'
import { KeywordType } from './Keywords'

interface KeywortTableComponentInterface {
  all_keywords: KeywordType[]
  patchURL: string
  refreshCallback: () => void
}

const KeywordTableCompnent: React.FC<KeywortTableComponentInterface> = ({
  all_keywords,
  patchURL,
  refreshCallback,
}) => {
  const { patch } = useApi()

  const handleKeywordRemove = async (keywordId: number) => {
    await patch(patchURL, { search_keywords: [keywordId] })
    refreshCallback()
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
          <tr key={keyword.id.toString()}>
            <td>{keyword.category_name}</td>
            <td>{keyword.word}</td>
            <td>{keyword.direction_display}</td>
            <td>
              {keyword.tv_default ? (
                'default'
              ) : (
                <button onClick={() => handleKeywordRemove(keyword.id)}>
                  remove
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default KeywordTableCompnent
