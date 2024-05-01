import { useState } from 'react';
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
import TVShowDetail from './pages/media/TVShowDetails';
import Search from './pages/media/Search';
import Media from './pages/media/Media';
import Login from './pages/Login';

// layouts
import RootLayout from './layouts/RootLayout';
import MediaRootLayout from './layouts/MediaLayout';
import NotFound from './pages/404';

// hooks
import useToken from './hooks/useToken';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index  element={<Home />}/>
      <Route path='media' element={<MediaRootLayout />}>
        <Route index element={<Media />} />
        <Route path='movie' element={<Movies />} />
        <Route path='tv' element={<TVShows />} />
        <Route path='tv/:id' element={<TVShowDetail />} />
      </Route>
      <Route path='settings' element={<Settings />}/>
      <Route path='search' element={<Search />} />
      <Route path='*' element={<NotFound />} />
    </Route>
  )
)

function App() {
  const {setToken, accessToken} = useToken();
  console.log(accessToken);
  if (!accessToken) {
    return <Login setToken={setToken} />
  }
  return (
    <RouterProvider router={router} />
  );
}

export default App;
