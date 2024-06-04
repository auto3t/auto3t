import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

// pages
import Home from './pages/Home';
import Settings from './pages/Settings';
import Movies from './pages/movie/Movies';
import TVShows from './pages/tv/TVShows';
import TVShowDetail from './pages/tv/TVShowDetails';
import Search from './pages/tv/Search';
import TVEpisode from './pages/tv/Episode';

// layouts
import RootLayout from './layouts/RootLayout';
import NotFound from './pages/404';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={<Home />}/>
      <Route path='tv'>
        <Route index element={<TVShows />} />
        <Route path='show/:id' element={<TVShowDetail />} />
        <Route path='episode/:id' element={<TVEpisode />} />
        <Route path='search' element={<Search />} />
      </Route>
      <Route path='movie'>
        <Route index element={<Movies />} />
      </Route>
      <Route path='settings' element={<Settings />}/>
      <Route path='*' element={<NotFound />} /> 
    </Route>
  )
)

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
