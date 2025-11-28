import KeywordCategories from '../components/settings/KeywordCategories'
import Keywords from '../components/settings/Keywords'
import ArchiveOptions from '../components/settings/ArchiveOptions'
import MovieReleaseTarget from '../components/settings/MovieReleaseTarget'
import Schedule from '../components/settings/Schedule'
import TargetBitrate from '../components/settings/TargetBitrate'
import { H1 } from '../components/Typography'

export default function Settings() {
  return (
    <>
      <title>A3T | Settings</title>
      <H1>Settings</H1>
      <div className="py-4">
        <KeywordCategories />
      </div>
      <div className="py-4">
        <Keywords />
      </div>
      <div className="py-4">
        <TargetBitrate />
      </div>
      <div className="py-4">
        <MovieReleaseTarget />
      </div>
      <div className="py-4">
        <ArchiveOptions />
      </div>
      <div className="py-4">
        <Schedule />
      </div>
    </>
  )
}
