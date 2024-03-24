import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

// pages
import Home from './pages/Home';
import Settings from './pages/Settings';
import Movies from './pages/media/Movies';
import TVShows from './pages/media/TVShows';

// layouts
import RootLayout from './layouts/RootLayout';
import MediaRootLayout from './layouts/MediaLayout';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index  element={<Home />}/>
      <Route path='media' element={<MediaRootLayout />}>
        <Route path='movie' element={<Movies />} />
        <Route path='tv' element={<TVShows />} />
      </Route>
      <Route path='settings' element={<Settings />}/>
    </Route>
  )
)

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
