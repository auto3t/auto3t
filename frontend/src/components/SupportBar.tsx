import useApi from '../hooks/api'
import useUserProfileStore, {
  UserProfileType,
} from '../stores/UserProfileStore'
import { Button, P, StyledLink } from './Typography'

export default function SupportBar({
  userProfile,
}: {
  userProfile: UserProfileType
}) {
  const { post, error } = useApi()
  const { setUserProfile } = useUserProfileStore()

  const handleProfileUpdate = async (
    isConfirmed: boolean,
    testing: boolean | null = null,
  ) => {
    const today = new Date()
    let remindAt = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)
    if (testing) {
      remindAt = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
    }

    const toUpdate = {
      user_support_confirmed: isConfirmed,
      user_support_remind_at: remindAt.toISOString(),
    } as UserProfileType

    try {
      const data = await post('user/profile/', toUpdate)
      setUserProfile(data)
    } catch (error) {
      console.error('profile update failed: ', error)
    }
  }

  return (
    (userProfile.user_support_confirmed === false ||
      userProfile.user_support_reminder) && (
      <div className="bg-second-bg text-center px-4 py-8 mb-10">
        <P variant="larger">This is free software</P>
        <P>
          {userProfile.user_support_reminder ? 'This is your reminder: ' : ''}
          This is free as in freedom, <i>not</i> free as in free beer.
        </P>
        <P>
          For more details, please read the{' '}
          <StyledLink to={'#'}>Readme</StyledLink> or the{' '}
          <StyledLink to={'#'}>docs</StyledLink> before confirming.
        </P>
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          <Button onClick={() => handleProfileUpdate(true)}>I confirm.</Button>
          {userProfile.user_support_remind_at === null && (
            <Button onClick={() => handleProfileUpdate(true, true)}>
              I&apos;m testing, remind me later.
            </Button>
          )}
        </div>
        {error && (
          <P variant="alert" className="mt-2 bg-main-fg">
            {error}
          </P>
        )}
      </div>
    )
  )
}
