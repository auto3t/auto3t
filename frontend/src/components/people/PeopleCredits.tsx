import { useEffect, useMemo, useState } from 'react'
import { PersonType } from '../../pages/people/Peoples'
import { Button, H2, P } from '../Typography'
import useApi from '../../hooks/api'
import PersonTile from './PersonTile'
import Spinner from '../Spinner'

type CreditType = {
  id: number
  person: PersonType
  content_type_display: string
  content_type_str: string
  role: string
  role_display: string
  role_name: string
}

type PeopleParent = 'show' | 'movie'

interface PeopleCreditInterface {
  parent: PeopleParent
  id: string
}

const CreditTabs = ({ credits }: { credits: CreditType[] }) => {
  const [showAll, setShowAll] = useState(false)

  const grouped = useMemo(() => {
    const result: Record<string, CreditType[]> = {}
    for (const credit of credits) {
      if (!result[credit.role]) {
        result[credit.role] = []
      }
      result[credit.role].push(credit)
    }
    return result
  }, [credits])

  const roles = Object.keys(grouped)
  const priorityList = ['main_cast', 'actor', 'crew']
  const priorityMap = new Map(priorityList.map((item, index) => [item, index]))

  const sortedRoles = roles.sort((a, b) => {
    return (priorityMap.get(a) ?? Infinity) - (priorityMap.get(b) ?? Infinity)
  })

  const [active, setActive] = useState(sortedRoles[0] ?? '')

  return (
    <>
      <div className="flex gap-4 border-b border-accent-2 mb-4 pt-4">
        {sortedRoles.map((role) => {
          const display = grouped[role][0].role_display // take display text from first item
          return (
            <P
              key={role}
              onClick={() => setActive(role)}
              className={`pb-2 px-2 cursor-pointer ${
                active === role
                  ? 'border-b-4 border-accent-2 font-semibold'
                  : 'opacity-60'
              }`}
            >
              {display}
            </P>
          )
        })}
      </div>
      <div className="grid grid-cols-6 gap-2">
        {(() => {
          const fullList = grouped[active] ?? []
          const list = showAll ? fullList : fullList.slice(0, 12)
          return (
            <>
              {list.map((credit) => (
                <PersonTile
                  person={credit.person}
                  role={credit.role_name}
                  key={credit.id}
                />
              ))}
            </>
          )
        })()}
      </div>
      {grouped[active].length > 12 && (
        <Button
          onClick={() => setShowAll(!showAll)}
          className="mx-auto block my-4"
        >
          {showAll
            ? 'Show less'
            : `Show more ( +${grouped[active].length - 12})`}
        </Button>
      )}
    </>
  )
}

const PeopleCredits: React.FC<PeopleCreditInterface> = ({ parent, id }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [credits, setCredits] = useState<CreditType[] | null>(null)
  const { get } = useApi()

  useEffect(() => {
    const fetchCredits = async () => {
      setIsLoading(true)
      let url = 'people/credit/'
      if (parent === 'show') {
        url += `?show_id=${id}`
      } else if (parent === 'movie') {
        url += `?movie_id=${id}`
      }

      try {
        const data = await get(url)
        setCredits(data)
      } catch (error) {
        console.error('error fetching credits: ', parent, id, error)
        setCredits(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCredits()
  }, [parent, id])

  return (
    <div className="my-8">
      <H2>Cast & Crew</H2>
      {isLoading ? (
        <Spinner />
      ) : credits && credits.length > 0 ? (
        <CreditTabs credits={credits} />
      ) : (
        <P>No Credits found</P>
      )}
    </div>
  )
}

export default PeopleCredits
