import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import './styles.css';

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const ItemsPage = lazy(() => import('./pages/ItemsPage').then((module) => ({ default: module.ItemsPage })));
const ChartsPage = lazy(() => import('./pages/ChartsPage').then((module) => ({ default: module.ChartsPage })));
const PlayersPage = lazy(() => import('./pages/PlayersPage').then((module) => ({ default: module.PlayersPage })));
const PlayerDetailPage = lazy(() => import('./pages/PlayerDetailPage').then((module) => ({ default: module.PlayerDetailPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then((module) => ({ default: module.LegalPage })));

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<div className="route-loader" />}>{element}</Suspense>;
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: withSuspense(<HomePage />) },
      { path: '/items', element: withSuspense(<ItemsPage />) },
      { path: '/charts', element: withSuspense(<ChartsPage />) },
      { path: '/players', element: withSuspense(<PlayersPage />) },
      { path: '/players/:uuid', element: withSuspense(<PlayerDetailPage />) },
      { path: '/legal', element: <Navigate to="/legal/offer" replace /> },
      { path: '/legal/:slug', element: withSuspense(<LegalPage />) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </React.StrictMode>,
);
