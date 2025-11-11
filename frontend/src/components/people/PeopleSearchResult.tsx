import { PersonSearchResultType } from '../../pages/people/Search'
import { H3, P } from '../Typography'
import posterDefault from '../../../assets/poster-default.jpg'
import usePeopleSearchStore from '../../stores/PeopleSearchStore'
import { useMemo } from 'react'

export default function PeopleSearchResult({
  person,
  source,
}: {
  person: PersonSearchResultType
  source: 'tv' | 'movie'
}) {
  const {
    selectedMoviePerson,
    setSelectedMoviePerson,
    selectedTVPerson,
    setSelectedTVPerson,
  } = usePeopleSearchStore()

  const handlePersonClick = () => {
    if (source === 'tv') {
      if (selectedTVPerson === person) {
        setSelectedTVPerson(null)
      } else {
        setSelectedTVPerson(person)
      }
    } else if (source === 'movie') {
      if (selectedMoviePerson === person) {
        setSelectedMoviePerson(null)
      } else {
        setSelectedMoviePerson(person)
      }
    }
  }

  const isSelected = useMemo(() => {
    if (source === 'tv' && selectedTVPerson === person) return true
    if (source === 'movie' && selectedMoviePerson === person) return true
    return false
  }, [selectedMoviePerson, selectedTVPerson])

  return (
    <div
      onClick={() => handlePersonClick()}
      className={`cursor-pointer ${isSelected ? 'border border-accent-1 p-2' : ''}`}
    >
      <div className="aspect-2/3 w-full overflow-hidden">
        <img
          className="w-full h-full object-cover object-center"
          src={person.image || posterDefault}
          alt="person image"
        />
      </div>
      <H3>{person.name}</H3>
      {person.department && <P>{person.department}</P>}
    </div>
  )
}
