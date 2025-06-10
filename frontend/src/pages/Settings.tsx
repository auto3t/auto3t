import KeywordCategories from '../components/settings/KeywordCategories'
import Keywords from '../components/settings/Keywords'
import Schedule from '../components/settings/Schedule'
import { H1 } from '../components/Typography'

export default function Settings() {
  return (
    <>
      <H1>Settings</H1>
      <div className="py-4">
        <KeywordCategories />
      </div>
      <div className="py-4">
        <Keywords />
      </div>
      <div className="py-4">
        <Schedule />
      </div>
    </>
  )
}
