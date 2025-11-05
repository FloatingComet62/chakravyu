import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Game from './routes/game.tsx'
import Challenge from './routes/challenge.tsx'
import Admin from './routes/admin.tsx'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

import App from './App.tsx'
import PocketBase from 'pocketbase'
import { DatabaseContext } from './contexts/database.tsx'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent: () => {
    const navigate = useNavigate();
    navigate({ to: '/' })
  }
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  Admin(rootRoute),
  Game(rootRoute),
  Challenge(rootRoute),
])

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
    <DatabaseContext value={new PocketBase('http://127.0.0.1:8090')}>
      <RouterProvider router={router} />
    </DatabaseContext>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
