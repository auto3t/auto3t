import { H2, P, StyledLink } from '../components/Typography'

export default function NotFound() {
  return (
    <div className="flex justify-center items-center h-[70vh] text-center">
      <div>
        <H2>Page Not Found</H2>
        <P>
          Go <StyledLink to="/">Home</StyledLink>
        </P>
      </div>
    </div>
  )
}
