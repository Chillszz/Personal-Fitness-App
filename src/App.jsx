import React, { useState, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import Dashboard from './components/Dashboard'
import Meals from './components/Meals'
import Workouts from './components/Workouts'
import Schedule from './components/Schedule'
import Progress from './components/Progress'
import BottomNav from './components/BottomNav'
import Settings from './components/Settings'
import Onboarding from './components/Onboarding'

const DEFAULT_WORKOUT_SCHEDULE = {
  Monday: 'push', Tuesday: 'lowerA', Wednesday: 'rest',
  Thursday: 'pull', Friday: 'lowerB', Saturday: 'rest', Sunday: 'rest'
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useLocalStorage('fittrack_theme', 'dark')
  const [startDate, setStartDate] = useLocalStorage('fittrack_start_date', null)
  const [profile, setProfile] = useLocalStorage('fittrack_profile', {
    name: '',
    age: 24,
    height: "5'10\"",
    startWeight: 203,
    goalWeight: 185,
    goal: 'Body Recomposition',
    tdee: 2972,
    dailyCalories: 2650,
    proteinGoal: 200,
    workoutDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    workoutFrequency: 4,
    workoutSchedule: DEFAULT_WORKOUT_SCHEDULE,
    workoutTime: '6:30–8:00 PM'
  })

  // Build effective schedule — use stored or fall back to default
  const workoutSchedule = profile.workoutSchedule || DEFAULT_WORKOUT_SCHEDULE

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  if (!startDate) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-950 text-gray-100">
          <Onboarding
            onComplete={setStartDate}
            profile={profile}
            setProfile={setProfile}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col max-w-md mx-auto relative">
        {showSettings ? (
          <Settings
            profile={profile}
            setProfile={setProfile}
            theme={theme}
            setTheme={setTheme}
            onClose={() => setShowSettings(false)}
            startDate={startDate}
          />
        ) : (
          <>
            <main className="flex-1 overflow-hidden">
              {activeTab === 'dashboard' && (
                <Dashboard
                  profile={profile}
                  startDate={startDate}
                  workoutSchedule={workoutSchedule}
                  onOpenSettings={() => setShowSettings(true)}
                />
              )}
              {activeTab === 'meals' && (
                <Meals startDate={startDate} />
              )}
              {activeTab === 'workouts' && (
                <Workouts startDate={startDate} workoutSchedule={workoutSchedule} />
              )}
              {activeTab === 'schedule' && (
                <Schedule startDate={startDate} profile={profile} workoutSchedule={workoutSchedule} />
              )}
              {activeTab === 'progress' && (
                <Progress profile={profile} startDate={startDate} />
              )}
            </main>
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </>
        )}
      </div>
    </div>
  )
}
