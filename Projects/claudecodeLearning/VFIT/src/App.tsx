import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from '@/lib/theme'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { AppShell } from '@/components/layout/AppShell'
import { Spinner } from '@/components/ui/Spinner'

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const WorkoutsPage = lazy(() => import('@/pages/WorkoutsPage').then((m) => ({ default: m.WorkoutsPage })))
const WorkoutSessionPage = lazy(() => import('@/pages/WorkoutSessionPage').then((m) => ({ default: m.WorkoutSessionPage })))
const WorkoutDetailPage = lazy(() => import('@/pages/WorkoutDetailPage').then((m) => ({ default: m.WorkoutDetailPage })))
const ChatPage = lazy(() => import('@/pages/ChatPage').then((m) => ({ default: m.ChatPage })))
const ProgressPage = lazy(() => import('@/pages/ProgressPage').then((m) => ({ default: m.ProgressPage })))
const NutritionPage = lazy(() => import('@/pages/NutritionPage').then((m) => ({ default: m.NutritionPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const PowerLevelPage = lazy(() => import('@/pages/PowerLevelPage').then((m) => ({ default: m.PowerLevelPage })))
const VoiceLoggingPage = lazy(() => import('@/pages/VoiceLoggingPage').then((m) => ({ default: m.VoiceLoggingPage })))
const WorkoutHistoryPage = lazy(() => import('@/pages/WorkoutHistoryPage').then((m) => ({ default: m.WorkoutHistoryPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = {
  duration: 0.2,
  ease: 'easeInOut',
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/workouts/session/:dayId" element={<WorkoutSessionPage />} />
            <Route path="/workouts/detail/:sessionId" element={<WorkoutDetailPage />} />
            <Route path="/coach" element={<ChatPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/nutrition" element={<NutritionPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/power-level" element={<PowerLevelPage />} />
            <Route path="/voice-logging" element={<VoiceLoggingPage />} />
            <Route path="/workouts/history" element={<WorkoutHistoryPage />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <AnimatedRoutes />
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
