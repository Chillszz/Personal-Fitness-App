import React, { useState } from 'react'
import { MEAL_PLAN } from '../data/meals'
import { WORKOUTS } from '../data/workouts'

function getWeekNumber(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  const diffMs = now - start
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.min(8, Math.max(1, Math.floor(diffDays / 7) + 1))
}

const WORKOUT_NAMES = {
  push: 'Upper Push',
  lowerA: 'Lower A',
  pull: 'Upper Pull',
  lowerB: 'Lower B'
}

function getScheduleForDay(dayName, weekNum, workoutSchedule) {
  const workoutType = (workoutSchedule || {})[dayName]
  const isWorkoutDay = workoutType && workoutType !== 'rest'
  const meals = MEAL_PLAN[weekNum] || MEAL_PLAN[1]
  const isSatSun = dayName === 'Saturday' || dayName === 'Sunday'

  if (isWorkoutDay) {
    return [
      { time: '7:00 AM', type: 'meal', label: 'Breakfast', detail: meals.breakfast?.name, color: '#facc15', emoji: '🍳' },
      { time: '8:30 AM', type: 'work', label: 'Work starts', detail: null, color: '#6b7280', emoji: '💼' },
      { time: '12:00 PM', type: 'meal', label: 'Lunch', detail: meals.lunch?.name, color: '#4ade80', emoji: '🥗' },
      { time: '5:00 PM', type: 'meal', label: 'Pre-Workout Snack', detail: `${meals.snack?.name} — eat before leaving work`, color: '#60a5fa', emoji: '🍌' },
      { time: '6:00 PM', type: 'work', label: 'Work ends', detail: null, color: '#6b7280', emoji: '🏃' },
      { time: '6:30 PM', type: 'workout', label: WORKOUT_NAMES[workoutType] || 'Workout', detail: WORKOUTS[workoutType]?.subtitle, color: '#a78bfa', emoji: '🏋️' },
      { time: '8:00 PM', type: 'meal', label: 'Dinner', detail: `${meals.dinner?.name} — eat within 90 min post-workout`, color: '#fb923c', emoji: '🍽️' },
      { time: '10:30 PM', type: 'sleep', label: 'Sleep', detail: '7–9 hours for recovery', color: '#818cf8', emoji: '😴' }
    ]
  } else {
    return [
      { time: '7:00 AM', type: 'meal', label: 'Breakfast', detail: meals.breakfast?.name, color: '#facc15', emoji: '🍳' },
      ...(!isSatSun ? [{ time: '8:30 AM', type: 'work', label: 'Work starts', detail: null, color: '#6b7280', emoji: '💼' }] : []),
      { time: '12:00 PM', type: 'meal', label: 'Lunch', detail: meals.lunch?.name, color: '#4ade80', emoji: '🥗' },
      ...(!isSatSun ? [{ time: '6:00 PM', type: 'work', label: 'Work ends', detail: null, color: '#6b7280', emoji: '🏃' }] : []),
      { time: '6:30 PM', type: 'meal', label: 'Dinner', detail: meals.dinner?.name, color: '#fb923c', emoji: '🍽️' },
      { time: '7:00 PM', type: 'walk', label: 'Optional Walk', detail: '20–30 min light walk', color: '#2dd4bf', emoji: '🚶' },
      { time: '8:30 PM', type: 'meal', label: 'Protein Snack (optional)', detail: 'If under protein goal', color: '#fb923c', emoji: '🥛' },
      { time: '10:30 PM', type: 'sleep', label: 'Sleep', detail: 'Full recovery — hit protein goal', color: '#818cf8', emoji: '😴' }
    ]
  }
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function WeeklyGrid({ weekNum, workoutSchedule }) {
  const typeColors = {
    meal: 'bg-green-500/20 text-green-400',
    workout: 'bg-purple-500/20 text-purple-400',
    work: 'bg-blue-500/20 text-blue-400',
    sleep: 'bg-indigo-500/20 text-indigo-400',
    walk: 'bg-teal-500/20 text-teal-400',
    rest: 'bg-gray-800 text-gray-500'
  }

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="grid grid-cols-7 gap-1 min-w-max">
        {DAYS.map(day => {
          const workoutType = (workoutSchedule || {})[day]
          const isWorkout = workoutType && workoutType !== 'rest'
          const shortDay = day.slice(0, 3)
          return (
            <div key={day} className="w-12">
              <p className="text-gray-500 text-xs text-center mb-1.5">{shortDay}</p>
              <div className="space-y-1">
                <div className="bg-yellow-500/20 rounded p-1 text-center">
                  <span className="text-xs text-yellow-400">🍳</span>
                </div>
                {!['Saturday', 'Sunday'].includes(day) && (
                  <div className="bg-blue-500/20 rounded p-1 text-center">
                    <span className="text-xs text-blue-400">💼</span>
                  </div>
                )}
                <div className="bg-green-500/20 rounded p-1 text-center">
                  <span className="text-xs text-green-400">🥗</span>
                </div>
                {isWorkout ? (
                  <>
                    <div className="bg-blue-500/20 rounded p-1 text-center">
                      <span className="text-xs text-blue-400">🍌</span>
                    </div>
                    <div className="bg-purple-500/20 rounded p-1 text-center">
                      <span className="text-xs">🏋️</span>
                    </div>
                  </>
                ) : (
                  <div className="bg-teal-500/20 rounded p-1 text-center">
                    <span className="text-xs">🚶</span>
                  </div>
                )}
                <div className="bg-orange-500/20 rounded p-1 text-center">
                  <span className="text-xs text-orange-400">🍽️</span>
                </div>
                <div className="bg-indigo-500/20 rounded p-1 text-center">
                  <span className="text-xs text-indigo-400">😴</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Schedule({ startDate, profile, workoutSchedule }) {
  const [view, setView] = useState('day')
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }))

  const weekNum = getWeekNumber(startDate)
  const schedule = getScheduleForDay(selectedDay, weekNum, workoutSchedule)
  const workoutType = (workoutSchedule || {})[selectedDay]
  const isWorkoutDay = workoutType && workoutType !== 'rest'
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-hide bg-gray-950">
      <div className="px-4 pt-14 pb-4">
        <h1 className="display-font text-3xl font-black text-white mb-4">SCHEDULE</h1>

        {/* View toggle */}
        <div className="flex bg-gray-900 rounded-xl p-1 mb-4 border border-gray-800">
          <button
            onClick={() => setView('day')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'day' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
          >
            Day View
          </button>
          <button
            onClick={() => setView('week')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'week' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
          >
            Week View
          </button>
        </div>

        {/* Day selector pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
          {DAYS.map(day => {
            const isToday = day === todayName
            const isSelected = day === selectedDay
            const wType = (workoutSchedule || {})[day]
            const isWD = wType && wType !== 'rest'
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all ${
                  isSelected ? 'bg-purple-600 text-white' : isToday ? 'bg-gray-800 border border-purple-500 text-white' : 'bg-gray-900 border border-gray-800 text-gray-400'
                }`}
              >
                <span className="text-xs font-bold">{day.slice(0, 3)}</span>
                <span className="text-xs mt-0.5">{isWD ? '💪' : '😴'}</span>
              </button>
            )
          })}
        </div>

        {view === 'week' && (
          <div className="card mb-4">
            <p className="display-font text-base font-bold text-gray-300 mb-3">WEEK {weekNum} OVERVIEW</p>
            <WeeklyGrid weekNum={weekNum} workoutSchedule={workoutSchedule} />
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { emoji: '🍳🥗🍌🍽️', label: 'Meals' },
                { emoji: '🏋️', label: 'Workout' },
                { emoji: '💼', label: 'Work' },
                { emoji: '🚶', label: 'Walk' },
                { emoji: '😴', label: 'Sleep' }
              ].map(({ emoji, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <span className="text-xs">{emoji}</span>
                  <span className="text-gray-500 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="display-font text-xl font-bold text-gray-300">{selectedDay.toUpperCase()}</h2>
          <span className={`pill text-xs font-bold ${isWorkoutDay ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-500'}`}>
            {isWorkoutDay ? `💪 ${WORKOUT_NAMES[workoutType]}` : '😴 Rest Day'}
          </span>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[5.5rem] top-3 bottom-3 w-px bg-gray-800" />

          <div className="space-y-1">
            {schedule.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-gray-500 text-xs w-20 text-right pt-3 shrink-0">{item.time}</span>

                {/* Node on timeline */}
                <div className="relative flex items-center justify-center z-10 mt-2.5">
                  <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: item.color, backgroundColor: item.color + '40' }} />
                </div>

                <div className={`flex-1 rounded-xl p-3 mb-1 ${
                  item.type === 'workout' ? 'bg-purple-500/10 border border-purple-500/20' :
                  item.type === 'meal' ? 'bg-gray-900 border border-gray-800' :
                  item.type === 'sleep' ? 'bg-indigo-500/5 border border-indigo-500/20' :
                  'bg-gray-900/50 border border-gray-800/50'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>{item.emoji}</span>
                    <span className="text-sm font-semibold text-white">{item.label}</span>
                  </div>
                  {item.detail && (
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">{item.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
