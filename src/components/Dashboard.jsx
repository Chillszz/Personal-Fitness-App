import React, { useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { MEAL_PLAN } from '../data/meals'
import { WORKOUTS } from '../data/workouts'

function getWeekNumber(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  const diffMs = now - start
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.min(8, Math.max(1, Math.floor(diffDays / 7) + 1))
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function getDayName() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
}

function getStreakCount(checklist) {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const dayData = checklist[key]
    if (!dayData) break
    const allDone = Object.values(dayData).every(Boolean)
    if (allDone) streak++
    else break
  }
  return streak
}

const CHECKLIST_ITEMS = [
  { id: 'meal1', label: 'Meal 1 eaten', emoji: '🍳' },
  { id: 'meal2', label: 'Meal 2 eaten', emoji: '🥗' },
  { id: 'meal3', label: 'Pre-workout snack eaten', emoji: '🍌' },
  { id: 'workout', label: 'Workout completed', emoji: '🏋️' },
  { id: 'meal4', label: 'Meal 4 eaten', emoji: '🍽️' },
  { id: 'sleep', label: '7+ hours sleep last night', emoji: '😴' },
  { id: 'water', label: 'Drank enough water', emoji: '💧' }
]

const WORKOUT_NAMES = {
  push: 'Upper Push',
  lowerA: 'Lower A',
  pull: 'Upper Pull',
  lowerB: 'Lower B',
  rest: 'Rest Day'
}

export default function Dashboard({ profile, startDate, workoutSchedule, onOpenSettings }) {
  const [checklist, setChecklist] = useLocalStorage('fittrack_daily_checklist', {})
  const [weightLog] = useLocalStorage('fittrack_weight_log', [])
  const [currentWeek] = useState(() => getWeekNumber(startDate))

  const today = getTodayKey()
  const dayName = getDayName()
  const todayChecklist = checklist[today] || {}
  const workoutType = (workoutSchedule || {})[dayName] || 'rest'
  const isWorkoutDay = workoutType !== 'rest'
  const currentMeals = MEAL_PLAN[currentWeek]
  const streak = getStreakCount(checklist)
  const currentWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : profile.startWeight
  const weightDelta = currentWeight - profile.startWeight

  const completedToday = Object.values(todayChecklist).filter(Boolean).length
  const totalItems = CHECKLIST_ITEMS.length

  const toggleItem = (id) => {
    setChecklist(prev => ({
      ...prev,
      [today]: {
        ...prev[today],
        [id]: !prev[today]?.[id]
      }
    }))
  }

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const scheduleItems = isWorkoutDay ? [
    { time: '7:00 AM', label: 'Breakfast', detail: currentMeals?.breakfast?.name, color: 'text-yellow-400' },
    { time: '8:30 AM', label: 'Work starts', detail: null, color: 'text-gray-500' },
    { time: '12:00 PM', label: 'Lunch', detail: currentMeals?.lunch?.name, color: 'text-green-400' },
    { time: '5:00 PM', label: 'Pre-Workout Snack', detail: currentMeals?.snack?.name, color: 'text-blue-400' },
    { time: '6:30 PM', label: WORKOUT_NAMES[workoutType] || 'Workout', detail: WORKOUTS[workoutType]?.subtitle, color: 'text-purple-400' },
    { time: '8:00 PM', label: 'Dinner', detail: currentMeals?.dinner?.name, color: 'text-orange-400' },
    { time: '10:30 PM', label: 'Sleep', detail: 'Aim for 7–9 hours', color: 'text-indigo-400' }
  ] : [
    { time: '7:00 AM', label: 'Breakfast', detail: currentMeals?.breakfast?.name, color: 'text-yellow-400' },
    { time: '8:30 AM', label: 'Work starts', detail: dayName !== 'Saturday' && dayName !== 'Sunday' ? null : 'Rest day', color: 'text-gray-500' },
    { time: '12:00 PM', label: 'Lunch', detail: currentMeals?.lunch?.name, color: 'text-green-400' },
    { time: '6:30 PM', label: 'Dinner', detail: currentMeals?.dinner?.name, color: 'text-orange-400' },
    { time: '7:00 PM', label: 'Optional Walk', detail: '20–30 min light walk', color: 'text-teal-400' },
    { time: '10:30 PM', label: 'Sleep', detail: 'Full recovery — hit protein goal', color: 'text-indigo-400' }
  ]

  const ringPct = Math.round((completedToday / totalItems) * 100)
  const ringCircum = 2 * Math.PI * 26
  const ringOffset = ringCircum - (ringCircum * ringPct) / 100

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-gray-950">
      {/* Header */}
      <div className="px-4 pt-14 pb-2 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{dateStr}</p>
          <h1 className="display-font text-3xl font-black text-white">
            {profile.name ? `HEY, ${profile.name.toUpperCase()}` : 'DASHBOARD'}
          </h1>
        </div>
        <button onClick={onOpenSettings} className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Hero card */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">Week {currentWeek} of 8</p>
              <h2 className="display-font text-2xl font-black text-white">{MEAL_PLAN[currentWeek]?.theme?.toUpperCase()}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isWorkoutDay ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {isWorkoutDay ? `💪 ${WORKOUT_NAMES[workoutType]}` : '😴 Rest Day'}
                </span>
                {streak > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500 text-white">
                    🔥 {streak} day streak
                  </span>
                )}
              </div>
            </div>
            {/* Progress Ring */}
            <div className="relative flex items-center justify-center">
              <svg width="64" height="64" className="-rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#374151" strokeWidth="5" />
                <circle
                  cx="32" cy="32" r="26"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="5"
                  strokeDasharray={ringCircum}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-white text-base font-bold leading-none">{completedToday}</span>
                <span className="text-purple-300 text-xs leading-none">/{totalItems}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Starting Weight</p>
            <p className="display-font text-2xl font-black text-white">{profile.startWeight} <span className="text-base font-normal text-gray-400">lbs</span></p>
          </div>
          <div className="card">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Current Weight</p>
            <div className="flex items-end gap-1">
              <p className="display-font text-2xl font-black text-white">{currentWeight} <span className="text-base font-normal text-gray-400">lbs</span></p>
              {weightDelta !== 0 && (
                <span className={`text-xs font-bold mb-1 ${weightDelta < 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)}
                </span>
              )}
            </div>
          </div>
          <div className="card">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Daily Calories</p>
            <p className="display-font text-2xl font-black text-white">{profile.dailyCalories.toLocaleString()} <span className="text-base font-normal text-gray-400">cal</span></p>
          </div>
          <div className="card">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Protein Goal</p>
            <p className="display-font text-2xl font-black text-white">{profile.proteinGoal}g <span className="text-base font-normal text-gray-400">/day</span></p>
          </div>
        </div>
      </div>

      {/* Today's schedule preview */}
      <div className="px-4 mb-4">
        <h2 className="display-font text-xl font-bold text-gray-300 mb-3">TODAY'S SCHEDULE</h2>
        <div className="card space-y-3">
          {scheduleItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-gray-500 text-xs w-16 pt-0.5 shrink-0">{item.time}</span>
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: item.color.replace('text-', '').includes('purple') ? '#a78bfa' : item.color.replace('text-', '').includes('green') ? '#4ade80' : item.color.replace('text-', '').includes('yellow') ? '#facc15' : item.color.replace('text-', '').includes('blue') ? '#60a5fa' : item.color.replace('text-', '').includes('orange') ? '#fb923c' : item.color.replace('text-', '').includes('indigo') ? '#818cf8' : item.color.replace('text-', '').includes('teal') ? '#2dd4bf' : '#6b7280' }} />
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${item.color}`}>{item.label}</p>
                  {item.detail && <p className="text-gray-500 text-xs truncate">{item.detail}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Checklist */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="display-font text-xl font-bold text-gray-300">TODAY'S CHECKLIST</h2>
          <span className="text-purple-400 text-sm font-semibold">{completedToday}/{totalItems}</span>
        </div>
        <div className="card divide-y divide-gray-800">
          {CHECKLIST_ITEMS.map(item => {
            const checked = !!todayChecklist[item.id]
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="flex items-center gap-3 py-3 w-full text-left active:bg-gray-800 transition-colors rounded-lg px-1"
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                  checked ? 'border-purple-500 bg-purple-500' : 'border-gray-600'
                }`}>
                  {checked && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-base mr-1">{item.emoji}</span>
                <span className={`flex-1 text-sm font-medium ${checked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom padding for nav */}
      <div className="h-4" />
    </div>
  )
}
