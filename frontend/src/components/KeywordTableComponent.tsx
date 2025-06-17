import useApi from '../hooks/api'
import { KeywordType } from './settings/Keywords'
import { Button, Table } from './Typography'

interface KeywortTableComponentInterface {
  all_keywords: KeywordType[]
  patchURL: string
  refreshCallback: () => void
  objectType?: 'tv_default' | 'movie_default'
}

const KeywordTableCompnent: React.FC<KeywortTableComponentInterface> = ({
  all_keywords,
  patchURL,
  refreshCallback,
  objectType = 'tv_default',
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
    keyword[objectType] ? (
      'default'
    ) : (
      <Button onClick={() => handleKeywordRemove(keyword.id)}>remove</Button>
    ),
  ])

  return (
    <Table headers={['Category', 'Keyword', 'Direction', '']} rows={rows} />
  )
}

export default KeywordTableCompnent
