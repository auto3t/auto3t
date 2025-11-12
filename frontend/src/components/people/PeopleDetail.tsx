import { PersonType } from '../../pages/people/Peoples'
import ImageComponent from '../ImageComponent'
import { Button, H1, Input, P, StyledLink } from '../Typography'
import posterDefault from '../../../assets/poster-default.jpg'
import { useState } from 'react'
import useApi from '../../hooks/api'
import ToggleSwitch from '../ConfigToggle'

export default function PeopleDetail({
  person,
  setPeopleDetail,
}: {
  person: PersonType
  setPeopleDetail: (personDetail: PersonType) => void
}) {
  const { patch } = useApi()
  const [isEditTvmaze, setIsEditTvmaze] = useState(false)
  const [newTvmazeId, setNewTvmazeId] = useState('')
  const [isEditMoviedb, setIsEditMoviedb] = useState(false)
  const [newMoviedbId, setNewMoviedbId] = useState('')

  const handlePeopleUpdate = async (
    key: 'tvmaze_id' | 'the_moviedb_id',
    value: string,
  ) => {
    try {
      const data = Object()
      data[key] = value
      const response = (await patch(
        `people/person/${person.id}/`,
        data,
      )) as PersonType
      setPeopleDetail(response)

      setIsEditMoviedb(false)
      setIsEditTvmaze(false)
      setNewTvmazeId('')
      setNewMoviedbId('')
    } catch (error) {
      console.error('failed to update person: ', error)
    }
  }

  const handlePeopleTrackingUpdate = async (
    key: 'tracking_movie' | 'tracking_tv' | 'is_locked',
    value: boolean,
  ) => {
    try {
      const data = Object()
      data[key] = value
      const response = (await patch(
        `people/person/${person.id}/`,
        data,
      )) as PersonType
      setPeopleDetail(response)
    } catch (error) {
      console.error('failed to update person: ', error)
    }
  }

  return (
    <div className="border border-accent-1">
      <div className="flex gap-2 items-center">
        <div className="flex-1 mx-auto p-6">
          <ImageComponent
            alt={`image person ${person.name}`}
            image={
              person.image_person?.image
                ? person.image_person
                : { image: posterDefault }
            }
          />
        </div>
        <div className="flex-3">
          <H1>{person.name}</H1>
          <div className="inline-grid grid-cols-3 gap-2">
            <P>tvmaze</P>
            {isEditTvmaze ? (
              <Input
                type="text"
                value={newTvmazeId || person.tvmaze_id || ''}
                onChange={(e) => setNewTvmazeId(e.target.value)}
              />
            ) : person.tvmaze_id && person.tvmaze_url ? (
              <StyledLink target="_blank" to={person.tvmaze_url}>
                {person.tvmaze_id}
              </StyledLink>
            ) : (
              <P>-</P>
            )}
            <div>
              {isEditTvmaze ? (
                <div className="flex gap-2 h-full">
                  <Button
                    onClick={() => {
                      setIsEditTvmaze(false)
                      setNewTvmazeId('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handlePeopleUpdate('tvmaze_id', newTvmazeId)}
                  >
                    Save
                  </Button>
                </div>
              ) : person.tvmaze_id === null ? (
                <Button onClick={() => setIsEditTvmaze(true)}>Edit</Button>
              ) : (
                <span></span>
              )}
            </div>

            <P>themoviedb</P>
            {isEditMoviedb ? (
              <Input
                type="text"
                value={newMoviedbId || person.the_moviedb_id || ''}
                onChange={(e) => setNewMoviedbId(e.target.value)}
              />
            ) : person.the_moviedb_id && person.the_moviedb_url ? (
              <StyledLink target="_blank" to={person.the_moviedb_url}>
                {person.the_moviedb_id}
              </StyledLink>
            ) : (
              <P>-</P>
            )}
            <div>
              {isEditMoviedb ? (
                <div className="flex gap-2 h-full">
                  <Button
                    onClick={() => {
                      setIsEditMoviedb(false)
                      setNewMoviedbId('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      handlePeopleUpdate('the_moviedb_id', newMoviedbId)
                    }
                  >
                    Save
                  </Button>
                </div>
              ) : person.the_moviedb_id === null ? (
                <Button onClick={() => setIsEditMoviedb(true)}>Edit</Button>
              ) : (
                <span></span>
              )}
            </div>

            <P>imdb</P>
            {person.imdb_id && person.imdb_url ? (
              <StyledLink target="_blank" to={person.imdb_url}>
                {person.imdb_id}
              </StyledLink>
            ) : (
              <P>-</P>
            )}
            <span />
          </div>
          <div className="inline-grid grid-cols-2 gap-2">
            <P>Track Movies</P>
            <ToggleSwitch
              value={person.tracking_movie}
              onChange={() =>
                handlePeopleTrackingUpdate(
                  'tracking_movie',
                  !person.tracking_movie,
                )
              }
            />
            <P>Tracking TV</P>
            <ToggleSwitch
              value={person.tracking_tv}
              onChange={() =>
                handlePeopleTrackingUpdate('tracking_tv', !person.tracking_tv)
              }
            />
            <P>Lock</P>
            <ToggleSwitch
              value={person.is_locked}
              onChange={() =>
                handlePeopleTrackingUpdate('is_locked', !person.is_locked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
