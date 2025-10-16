import { useEffect, useState } from 'react'
import useApi from '../hooks/api'
import { KeywordType } from './settings/Keywords'
import { Button, Select } from './Typography'

interface AddKeywordComponentInterface {
  patchURL: string
  refreshCallback: () => void
}

const AddKeywordComponent: React.FC<AddKeywordComponentInterface> = ({
  patchURL,
  refreshCallback,
}) => {
  const { get, patch } = useApi()
  const [allKeywords, setAllKeywords] = useState<KeywordType[] | null>(null)
  const [selectedOption, setSelectedOption] = useState<string>()

  useEffect(() => {
    const getKeywords = () => {
      get('keyword/?exclude-default=true').then((response) => {
        setAllKeywords(response)
      })
    }
    getKeywords()
  }, [patchURL])

  const handleOptionSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value)
  }

  const handleOptionUpdate = async () => {
    if (selectedOption) {
      await patch(patchURL, { search_keywords: [selectedOption] })
      setSelectedOption('')
      refreshCallback()
    }
  }

  return (
    <>
      {allKeywords && (
        <>
          <Select onChange={handleOptionSelect} defaultValue={''}>
            <option value="">---</option>
            {allKeywords.map((keyword) => (
              <option key={keyword.id} value={keyword.id}>
                {keyword.category_name} [{keyword.direction}] {keyword.word}
              </option>
            ))}
          </Select>
          {selectedOption && (
            <Button className="ml-2" onClick={handleOptionUpdate}>
              Add
            </Button>
          )}
        </>
      )}
    </>
  )
}

export default AddKeywordComponent
