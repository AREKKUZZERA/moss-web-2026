import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { ItemsPage } from './pages/ItemsPage';
import { ChartsPage } from './pages/ChartsPage';
import { PlayersPage } from './pages/PlayersPage';
import { PlayerDetailPage } from './pages/PlayerDetailPage';
import { LegalPage } from './pages/LegalPage';
import './styles.css';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/items', element: <ItemsPage /> },
      { path: '/charts', element: <ChartsPage /> },
      { path: '/players', element: <PlayersPage /> },
      { path: '/players/:uuid', element: <PlayerDetailPage /> },
      { path: '/legal', element: <Navigate to="/legal/offer" replace /> },
      { path: '/legal/:slug', element: <LegalPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </React.StrictMode>,
);
