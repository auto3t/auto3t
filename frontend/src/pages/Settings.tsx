import KeywordCategories from '../components/KeywordCategories'
import Keywords from '../components/Keywords'
import Schedule from '../components/Schedule'
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
