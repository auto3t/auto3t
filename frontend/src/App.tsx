import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'

// pages
import Home from './pages/Home'
import Settings from './pages/Settings'
import Movies from './pages/movie/Movies'
import TVShows from './pages/tv/TVShows'
import TVShowDetail from './pages/tv/TVShowDetails'
import TVSearch from './pages/tv/Search'
import TVEpisode from './pages/tv/Episode'
import MovieSearch from './pages/movie/Search'
import MovieDetails from './pages/movie/MovieDetails'
import Collections from './pages/collection/Collections'
import CollectionDetail from './pages/collection/CollectionDetails'
import CollectionSearch from './pages/collection/Search'

// layouts
import RootLayout from './layouts/RootLayout'
import NotFound from './pages/404'
import Peoples from './pages/people/Peoples'
import PeopleDetail from './pages/people/PeopleDetail'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="tv">
        <Route index element={<TVShows />} />
        <Route path="show/:id" element={<TVShowDetail />} />
        <Route path="episode/:id" element={<TVEpisode />} />
        <Route path="search" element={<TVSearch />} />
      </Route>
      <Route path="movie">
        <Route index element={<Movies />} />
        <Route path="movie/:id" element={<MovieDetails />} />
        <Route path="search" element={<MovieSearch />} />
      </Route>
      <Route path="collection">
        <Route index element={<Collections />} />
        <Route path=":id" element={<CollectionDetail />} />
        <Route path="search" element={<CollectionSearch />} />
      </Route>
      <Route path="people">
        <Route index element={<Peoples />} />
        <Route path=":id" element={<PeopleDetail />} />
      </Route>
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
)

const App: React.FC = () => {
  return <RouterProvider router={router} />
}

export default App
