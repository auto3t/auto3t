import { useParams } from 'react-router-dom'
import { H1, P, StyledLink } from '../../components/Typography'
import useApi from '../../hooks/api'
import { useEffect, useState } from 'react'
import { PersonType } from './Peoples'
import ImageComponent from '../../components/ImageComponent'
import posterDefault from '../../../assets/poster-default.jpg'
import Spinner from '../../components/Spinner'

export default function PeopleDetail() {
  const { id } = useParams()
  const { get } = useApi()

  const [peopleDetail, setPeopleDetail] = useState<PersonType | null>(null)
  const [isLoadingPerson, setIsLoadingPerson] = useState(true)

  const getPersonImage = (person: PersonType) => {
    if (person.image_person?.image) return person.image_person
    return { image: posterDefault }
  }

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const data = (await get(`people/person/${id}/`)) as PersonType
        setPeopleDetail(data)
      } catch (error) {
        console.error('error fetching person: ', error)
      } finally {
        setIsLoadingPerson(false)
      }
    }
    fetchPeople()
  }, [id])

  return (
    <>
      {isLoadingPerson ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : (
        peopleDetail && (
          <div className="border border-accent-1">
            <div className="flex gap-2 items-center">
              <div className="flex-1 mx-auto p-6">
                <ImageComponent
                  alt={`image person ${peopleDetail.name}`}
                  image={getPersonImage(peopleDetail)}
                />
              </div>
              <div className="flex-3">
                <H1>{peopleDetail.name}</H1>
                {peopleDetail.tvmaze_id && peopleDetail.tvmaze_url && (
                  <P>
                    tvmaze:{' '}
                    <StyledLink to={peopleDetail.tvmaze_url}>
                      {peopleDetail.tvmaze_id}
                    </StyledLink>
                  </P>
                )}
                {peopleDetail.the_moviedb_id &&
                  peopleDetail.the_moviedb_url && (
                    <P>
                      themoviedb:{' '}
                      <StyledLink to={peopleDetail.the_moviedb_url}>
                        {peopleDetail.the_moviedb_id}
                      </StyledLink>
                    </P>
                  )}
                {peopleDetail.imdb_id && peopleDetail.imdb_url && (
                  <P>
                    imdb:{' '}
                    <StyledLink to={peopleDetail.imdb_url}>
                      {peopleDetail.imdb_id}
                    </StyledLink>
                  </P>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </>
  )
}
