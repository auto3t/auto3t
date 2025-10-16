import useApi from '../hooks/api'
import { KeywordType } from './settings/Keywords'
import { Button, Table } from './Typography'

interface KeywortTableComponentInterface {
  all_keywords: KeywordType[]
  patchURL: string
  refreshCallback: () => void
  objectType?: 'tv_default' | 'movie_default'
  inheritKey?: 'movie' | 'show' | 'season'
  inheritId?: number
}

const KeywordTableCompnent: React.FC<KeywortTableComponentInterface> = ({
  all_keywords,
  patchURL,
  refreshCallback,
  objectType = 'tv_default',
  inheritKey = undefined,
  inheritId = undefined,
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
    ) : inheritKey &&
      inheritId &&
      keyword.related &&
      keyword.related[inheritKey].includes(inheritId) ? (
      'inherited'
    ) : (
      <Button onClick={() => handleKeywordRemove(keyword.id)}>remove</Button>
    ),
  ])

  return (
    <Table headers={['Category', 'Keyword', 'Direction', '']} rows={rows} />
  )
}

export default KeywordTableCompnent
