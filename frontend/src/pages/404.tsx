import { H2, P, StyledLink } from '../components/Typography'

export default function NotFound() {
  return (
    <>
      <title>A3T | 404 Page not found</title>
      <div className="flex justify-center items-center h-[70vh] text-center">
        <div>
          <H2>Page Not Found</H2>
          <P>
            Go <StyledLink to="/">Home</StyledLink>
          </P>
        </div>
      </div>
    </>
  )
}
