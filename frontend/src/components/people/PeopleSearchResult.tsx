import { PersonSearchResultType } from '../../pages/people/Search'
import { H3, P } from '../Typography'
import posterDefault from '../../../assets/poster-default.jpg'

export default function PeopleSearchResult({
  person,
}: {
  person: PersonSearchResultType
}) {
  return (
    <div>
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
