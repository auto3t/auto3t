import { PersonType } from '../../pages/people/Peoples'
import posterDefault from '../../../assets/poster-default.jpg'
import { Link } from 'react-router-dom'
import ImageComponent from '../ImageComponent'
import { H3 } from '../Typography'

export default function PersonTile({ person }: { person: PersonType }) {
  const getPersonImage = (person: PersonType) => {
    if (person.image_person?.image) return person.image_person
    return { image: posterDefault }
  }

  return (
    <Link to={`/people/${person.id}`}>
      <div>
        <ImageComponent
          image={getPersonImage(person)}
          alt={`person poster ${person.name}`}
        />
      </div>
      <div className="text-center">
        <H3>{person.name}</H3>
      </div>
    </Link>
  )
}
