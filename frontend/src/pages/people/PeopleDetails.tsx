import { useParams } from 'react-router-dom'
import useApi from '../../hooks/api'
import { useEffect, useState } from 'react'
import { PersonType } from './Peoples'
import Spinner from '../../components/Spinner'
import PeopleMovieCredits from '../../components/people/PeopleMovieCredits'
import PeopleTVCredits from '../../components/people/PeopleTVCredits'
import PeopleDetail from '../../components/people/PeopleDetail'
import PeopleTVRemoteCredits from '../../components/people/PeopleTVRemoteCredits'
import { P } from '../../components/Typography'
import PeopleMovieRemoteCredis from '../../components/people/PeopleMovieRemoteCredits'

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
      <PeopleMovieRemoteCredis person={peopleDetail} />
      <PeopleTVRemoteCredits person={peopleDetail} />
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

  const [activeTabIndex, setActiveTabindex] = useState(0)
  const [peopleDetail, setPeopleDetail] = useState<PersonType | null>(null)
  const [isLoadingPerson, setIsLoadingPerson] = useState(true)

  const ActiveTab = PersonTabs[activeTabIndex].component

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
            <div>
              <ActiveTab peopleDetail={peopleDetail} />
            </div>
          </>
        )
      )}
    </>
  )
}
