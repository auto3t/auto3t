import useApi from '../hooks/api'
import { KeywordType } from './Keywords'
import { Table } from './Typography'

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

  const rows = all_keywords.map((keyword) => [
    keyword.category_name,
    keyword.word,
    keyword.direction_display,
    keyword.tv_default ? (
      'default'
    ) : (
      <button onClick={() => handleKeywordRemove(keyword.id)}>remove</button>
    ),
  ])

  return (
    <Table headers={['Category', 'Keyword', 'Direction', '']} rows={rows} />
  )
}

export default KeywordTableCompnent
