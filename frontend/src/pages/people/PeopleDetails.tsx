import { useParams } from 'react-router-dom'
import useApi from '../../hooks/api'
import { useEffect, useState } from 'react'
import { PersonType } from './Peoples'
import Spinner from '../../components/Spinner'
import PeopleMovieCredits from '../../components/people/PeopleMovieCredits'
import PeopleTVCredits from '../../components/people/PeopleTVCredits'
import PeopleDetail from '../../components/people/PeopleDetail'

export default function PeopleDetails() {
  const { id } = useParams()
  const { get } = useApi()

  const [peopleDetail, setPeopleDetail] = useState<PersonType | null>(null)
  const [isLoadingPerson, setIsLoadingPerson] = useState(true)

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
          <>
            <PeopleDetail
              person={peopleDetail}
              setPeopleDetail={setPeopleDetail}
            />
            <PeopleMovieCredits person={peopleDetail} />
            <PeopleTVCredits person={peopleDetail} />
          </>
        )
      )}
    </>
  )
}
