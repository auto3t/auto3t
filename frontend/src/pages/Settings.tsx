import KeywordCategories from '../components/KeywordCategories'
import Keywords from '../components/Keywords'
import Schedule from '../components/Schedule'

export default function Settings() {
  return (
    <div className="settings">
      <h1>Settings</h1>
      <KeywordCategories />
      <Keywords />
      <Schedule />
    </div>
  )
}
