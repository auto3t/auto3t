import { useParams } from 'react-router-dom'
import useApi from '../../hooks/api'
import { useCallback, useEffect, useState } from 'react'
import { PersonType } from './Peoples'
import Spinner from '../../components/Spinner'
import PeopleMovieCredits from '../../components/people/PeopleMovieCredits'
import PeopleTVCredits from '../../components/people/PeopleTVCredits'
import PeopleDetail from '../../components/people/PeopleDetail'
import PeopleTVRemoteCredits from '../../components/people/PeopleTVRemoteCredits'
import { H2, P } from '../../components/Typography'
import PeopleMovieRemoteCredis from '../../components/people/PeopleMovieRemoteCredits'
import { useProgressStore } from '../../stores/ProgressStore'

const LocalPersonCredit = ({ peopleDetail }: { peopleDetail: PersonType }) => {
  return (
    <>
      <PeopleMovieCredits person={peopleDetail} />
      <PeopleTVCredits person={peopleDetail} />
    </>
  )
}

const RemotePersonCredit = ({ peopleDetail }: { peopleDetail: PersonType }) => {
  return (
    <>
      <H2>Searching Movies</H2>
      {peopleDetail.the_moviedb_id ? (
        <PeopleMovieRemoteCredis person={peopleDetail} />
      ) : (
        <P>Person is missing themoviedb ID.</P>
      )}
      <H2>Searching Shows</H2>
      {peopleDetail.tvmaze_id ? (
        <PeopleTVRemoteCredits person={peopleDetail} />
      ) : (
        <P>Person is missing tvmaze id.</P>
      )}
    </>
  )
}

const PersonTabs = [
  { label: 'Local Credits', component: LocalPersonCredit },
  { label: 'Remote Credits', component: RemotePersonCredit },
]

export default function PeopleDetails() {
  const { id } = useParams()
  const { get } = useApi()

  const { setRefetch } = useProgressStore()
  const [activeTabIndex, setActiveTabindex] = useState(0)
  const [peopleDetail, setPeopleDetail] = useState<PersonType | null>(null)
  const [isLoadingPerson, setIsLoadingPerson] = useState(true)

  const ActiveTab = PersonTabs[activeTabIndex].component

  const fetchPeople = useCallback(async () => {
    try {
      const data = (await get(`people/person/${id}/`)) as PersonType
      setPeopleDetail(data)
    } catch (error) {
      console.error('error fetching person: ', error)
    } finally {
      setIsLoadingPerson(false)
    }
  }, [id])

  useEffect(() => {
    fetchPeople()
  }, [id])

  useEffect(() => {
    setRefetch(() => {
      fetchPeople()
    })
  }, [setRefetch, fetchPeople])

  return (
    <>
      {isLoadingPerson ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : (
        peopleDetail && (
          <>
            <title>{`A3T | ${peopleDetail.name}`}</title>
            <PeopleDetail
              person={peopleDetail}
              setPeopleDetail={setPeopleDetail}
            />
            <div className="flex gap-4 border-b border-accent-2 mb-4 pt-4">
              {PersonTabs.map((tab, i) => (
                <P
                  onClick={() => setActiveTabindex(i)}
                  className={`pb-2 px-2 cursor-pointer ${
                    activeTabIndex === i
                      ? 'border-b-4 border-accent-2 font-semibold'
                      : 'opacity-60'
                  }`}
                  key={i}
                >
                  {tab.label}
                </P>
              ))}
            </div>
            <div className="py-4">
              <ActiveTab peopleDetail={peopleDetail} />
            </div>
          </>
        )
      )}
    </>
  )
}
