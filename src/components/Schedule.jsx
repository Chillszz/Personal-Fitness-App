import React, { useState } from 'react'
import { MEAL_PLAN } from '../data/meals'
import { WORKOUTS } from '../data/workouts'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const WORKOUT_NAMES = {
  push: 'Upper Push',
  lowerA: 'Lower A',
  pull: 'Upper Pull',
  lowerB: 'Lower B'
}

const DAY_OFFSETS = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6 }

function getWeekNumber(startDate) {
  try {
    const start = new Date(startDate)
    const now = new Date()
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24))
    return Math.min(8, Math.max(1, Math.floor(diffDays / 7) + 1))
  } catch {
    return 1
  }
}

function getDayCalendarDate(startDate, weekNum, dayName) {
  try {
    const start = new Date(startDate)
    const weekStart = new Date(start)
    weekStart.setDate(start.getDate() + (weekNum - 1) * 7)
    const offset = DAY_OFFSETS[dayName] ?? 0
    const dayDate = new Date(weekStart)
    dayDate.setDate(weekStart.getDate() + offset)
    return dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function buildSchedule(dayName, weekNum, workoutSchedule) {
  const schedule = workoutSchedule || {}
  const workoutType = schedule[dayName]
  const isWorkout = workoutType && workoutType !== 'rest'
  const meals = MEAL_PLAN[weekNum] || MEAL_PLAN[1] || {}
  const isSatSun = dayName === 'Saturday' || dayName === 'Sunday'

  if (isWorkout) {
    return [
      { time: '7:00 AM',  label: 'Breakfast',           detail: meals.breakfast?.name || '',                               color: '#facc15', emoji: '🍳', type: 'meal' },
      { time: '8:30 AM',  label: 'Work starts',          detail: '',                                                        color: '#6b7280', emoji: '💼', type: 'work' },
      { time: '12:00 PM', label: 'Lunch',                detail: meals.lunch?.name || '',                                   color: '#4ade80', emoji: '🥗', type: 'meal' },
      { time: '5:00 PM',  label: 'Pre-Workout Snack',    detail: (meals.snack?.name || '') + ' — eat before leaving work',  color: '#60a5fa', emoji: '🍌', type: 'meal' },
      { time: '6:00 PM',  label: 'Work ends',            detail: '',                                                        color: '#6b7280', emoji: '🏃', type: 'work' },
      { time: '6:30 PM',  label: WORKOUT_NAMES[workoutType] || 'Workout', detail: WORKOUTS[workoutType]?.subtitle || '',    color: '#a78bfa', emoji: '🏋️', type: 'workout' },
      { time: '8:00 PM',  label: 'Dinner',               detail: (meals.dinner?.name || '') + ' — within 90 min post-workout', color: '#fb923c', emoji: '🍽️', type: 'meal' },
      { time: '10:30 PM', label: 'Sleep',                detail: '7–9 hours for recovery',                                 color: '#818cf8', emoji: '😴', type: 'sleep' }
    ]
  }

  return [
    { time: '7:00 AM',  label: 'Breakfast',               detail: meals.breakfast?.name || '',  color: '#facc15', emoji: '🍳', type: 'meal' },
    ...(!isSatSun ? [{ time: '8:30 AM', label: 'Work starts', detail: '', color: '#6b7280', emoji: '💼', type: 'work' }] : []),
    { time: '12:00 PM', label: 'Lunch',                   detail: meals.lunch?.name || '',      color: '#4ade80', emoji: '🥗', type: 'meal' },
    ...(!isSatSun ? [{ time: '6:00 PM', label: 'Work ends', detail: '', color: '#6b7280', emoji: '🏃', type: 'work' }] : []),
    { time: '6:30 PM',  label: 'Dinner',                  detail: meals.dinner?.name || '',     color: '#fb923c', emoji: '🍽️', type: 'meal' },
    { time: '7:00 PM',  label: 'Optional Walk',           detail: '20–30 min light walk',       color: '#2dd4bf', emoji: '🚶', type: 'walk' },
    { time: '8:30 PM',  label: 'Protein Snack (optional)',detail: 'If under protein goal',      color: '#fb923c', emoji: '🥛', type: 'meal' },
    { time: '10:30 PM', label: 'Sleep',                   detail: 'Full recovery — hit protein goal', color: '#818cf8', emoji: '😴', type: 'sleep' }
  ]
}

function TimelineItem({ item }) {
  return (
    <div className="flex items-start gap-3 mb-1">
      <span className="text-gray-500 text-xs w-20 text-right pt-3 shrink-0">{item.time}</span>
      <div className="relative flex items-center justify-center z-10 mt-2.5 shrink-0">
        <div
          className="w-3 h-3 rounded-full border-2"
          style={{ borderColor: item.color, backgroundColor: item.color + '30' }}
        />
      </div>
      <div className={`flex-1 rounded-xl p-3 ${
        item.type === 'workout' ? 'bg-purple-500/10 border border-purple-500/20' :
        item.type === 'sleep'   ? 'bg-indigo-500/5 border border-indigo-500/20' :
        item.type === 'work'    ? 'bg-gray-900/40 border border-gray-800/40' :
                                  'bg-gray-900 border border-gray-800'
      }`}>
        <div className="flex items-center gap-2">
          <span>{item.emoji}</span>
          <span className="text-sm font-semibold text-white">{item.label}</span>
        </div>
        {item.detail ? <p className="text-gray-400 text-xs mt-1 leading-relaxed">{item.detail}</p> : null}
      </div>
    </div>
  )
}

function WeeklyGrid({ workoutSchedule }) {
  const ws = workoutSchedule || {}
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {DAYS.map(day => {
          const wType = ws[day]
          const isWorkout = wType && wType !== 'rest'
          return (
            <div key={day} className="w-11 shrink-0">
              <p className="text-gray-500 text-xs text-center mb-1">{day.slice(0, 3)}</p>
              <div className="space-y-1">
                <div className="bg-yellow-500/20 rounded p-1 text-center"><span className="text-xs">🍳</span></div>
                {!['Saturday', 'Sunday'].includes(day) && (
                  <div className="bg-blue-500/20 rounded p-1 text-center"><span className="text-xs">💼</span></div>
                )}
                <div className="bg-green-500/20 rounded p-1 text-center"><span className="text-xs">🥗</span></div>
                {isWorkout ? (
                  <>
                    <div className="bg-blue-500/20 rounded p-1 text-center"><span className="text-xs">🍌</span></div>
                    <div className="bg-purple-500/20 rounded p-1 text-center"><span className="text-xs">🏋️</span></div>
                  </>
                ) : (
                  <div className="bg-teal-500/20 rounded p-1 text-center"><span className="text-xs">🚶</span></div>
                )}
                <div className="bg-orange-500/20 rounded p-1 text-center"><span className="text-xs">🍽️</span></div>
                <div className="bg-indigo-500/20 rounded p-1 text-center"><span className="text-xs">😴</span></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Schedule({ startDate, profile, workoutSchedule }) {
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const [view, setView] = useState('day')
  const [selectedDay, setSelectedDay] = useState(todayName)

  const ws = workoutSchedule || {}
  const weekNum = getWeekNumber(startDate)
  const workoutType = ws[selectedDay]
  const isWorkoutDay = !!(workoutType && workoutType !== 'rest')
  const schedule = buildSchedule(selectedDay, weekNum, ws)

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-gray-950">
      <div className="px-4 pt-14 pb-24">
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

        {/* Day pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
          {DAYS.map(day => {
            const isToday = day === todayName
            const isSelected = day === selectedDay
            const isWD = ws[day] && ws[day] !== 'rest'
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white'
                    : isToday
                    ? 'bg-gray-800 border border-purple-500 text-white'
                    : 'bg-gray-900 border border-gray-800 text-gray-400'
                }`}
              >
                <span className="text-xs font-bold">{day.slice(0, 3)}</span>
                <span className="text-xs mt-0.5">{isWD ? '💪' : '😴'}</span>
              </button>
            )
          })}
        </div>

        {/* Week view grid */}
        {view === 'week' && (
          <div className="card mb-4">
            <p className="display-font text-base font-bold text-gray-300">WEEK {weekNum} OVERVIEW</p>
            {startDate && <p className="text-gray-500 text-xs mb-3">{getDayCalendarDate(startDate, weekNum, 'Monday')} – {getDayCalendarDate(startDate, weekNum, 'Sunday')}</p>}
            <WeeklyGrid workoutSchedule={ws} />
            <div className="mt-3 flex flex-wrap gap-3">
              {[['🍳', 'Meals'], ['🏋️', 'Workout'], ['💼', 'Work'], ['🚶', 'Walk'], ['😴', 'Sleep']].map(([emoji, label]) => (
                <div key={label} className="flex items-center gap-1">
                  <span className="text-xs">{emoji}</span>
                  <span className="text-gray-500 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="display-font text-xl font-bold text-gray-300">{selectedDay.toUpperCase()}</h2>
            {startDate && (
              <p className="text-gray-500 text-xs mt-0.5">{getDayCalendarDate(startDate, weekNum, selectedDay)}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isWorkoutDay ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-500'
          }`}>
            {isWorkoutDay ? `💪 ${WORKOUT_NAMES[workoutType] || 'Workout'}` : '😴 Rest Day'}
          </span>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-[5.5rem] top-3 bottom-3 w-px bg-gray-800" />
          {schedule.map((item, i) => (
            <TimelineItem key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
