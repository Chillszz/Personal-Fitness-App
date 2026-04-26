import React, { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { WORKOUTS } from '../data/workouts'

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function getDayName() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
}

function getPreviousWorkoutLog(exerciseId, workoutId, workoutLog) {
  const entries = Object.entries(workoutLog)
    .filter(([k]) => k.includes(workoutId))
    .sort(([a], [b]) => b.localeCompare(a))

  for (const [, logData] of entries) {
    if (logData[exerciseId]) {
      const completedSets = logData[exerciseId].filter(s => s.completed && s.weight)
      if (completedSets.length > 0) return completedSets
    }
  }
  return null
}

function ExerciseCard({ exercise, logData, onUpdateSet, previousSets, personalRecord }) {
  const [expanded, setExpanded] = useState(false)

  const sets = logData || Array(exercise.sets).fill(null).map((_, i) => ({
    setNum: i + 1,
    weight: '',
    reps: '',
    completed: false
  }))

  const completedSets = sets.filter(s => s.completed).length
  const allDone = completedSets === exercise.sets

  return (
    <div className={`card mb-3 transition-all ${allDone ? 'border-green-500/30 bg-green-900/5' : ''}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="display-font text-lg font-black text-white">{exercise.name}</h3>
              {allDone && (
                <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs">{exercise.sets} sets × {exercise.reps} reps · Rest {exercise.rest}</p>
            <p className="text-purple-300 text-xs mt-0.5">{exercise.target}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-white text-sm font-bold">{completedSets}/{exercise.sets}</p>
              <p className="text-gray-500 text-xs">sets</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 border-t border-gray-800 pt-3">
          {personalRecord && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 mb-3">
              <p className="text-yellow-400 text-xs font-semibold">🏆 PR: {personalRecord.weight}lbs × {personalRecord.reps} reps</p>
            </div>
          )}
          {/* Set headers */}
          <div className="grid grid-cols-4 gap-2 mb-2 px-1">
            <p className="text-gray-600 text-xs">Set</p>
            <p className="text-gray-600 text-xs">Weight (lbs)</p>
            <p className="text-gray-600 text-xs">Reps</p>
            <p className="text-gray-600 text-xs text-center">Done</p>
          </div>
          {sets.map((set, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-center">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm font-medium">{i + 1}</span>
                {previousSets && previousSets[i] && (
                  <span className="text-gray-600 text-xs">{previousSets[i].weight}×{previousSets[i].reps}</span>
                )}
              </div>
              <input
                type="number"
                inputMode="decimal"
                value={set.weight}
                onChange={e => onUpdateSet(i, 'weight', e.target.value)}
                placeholder={previousSets?.[i]?.weight || '0'}
                className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm w-full focus:outline-none focus:border-purple-500 placeholder-gray-700"
              />
              <input
                type="number"
                inputMode="numeric"
                value={set.reps}
                onChange={e => onUpdateSet(i, 'reps', e.target.value)}
                placeholder={previousSets?.[i]?.reps || exercise.reps.split('–')[0]}
                className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm w-full focus:outline-none focus:border-purple-500 placeholder-gray-700"
              />
              <button
                onClick={() => onUpdateSet(i, 'completed', !set.completed)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${
                  set.completed ? 'border-green-500 bg-green-500' : 'border-gray-600'
                }`}
              >
                {set.completed && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WorkoutView({ workout, date }) {
  const dateKey = `${date}_${workout.id}`
  const [workoutLog, setWorkoutLog] = useLocalStorage('fittrack_workout_log', {})
  const [personalRecords, setPersonalRecords] = useLocalStorage('fittrack_personal_records', {})
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef(null)

  const todayLog = workoutLog[dateKey] || {}

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerActive])

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const updateSet = (exerciseId, setIndex, field, value) => {
    setWorkoutLog(prev => {
      const current = prev[dateKey] || {}
      const exercise = workout.exercises.find(e => e.id === exerciseId)
      const currentSets = current[exerciseId] || Array(exercise.sets).fill(null).map((_, i) => ({
        setNum: i + 1, weight: '', reps: '', completed: false
      }))
      const newSets = [...currentSets]
      newSets[setIndex] = { ...newSets[setIndex], [field]: value }

      // Update personal records
      if (field === 'completed' && value === true) {
        const set = newSets[setIndex]
        const w = parseFloat(set.weight)
        const r = parseInt(set.reps)
        if (w > 0 && r > 0) {
          const prKey = exerciseId
          const existing = personalRecords[prKey]
          const volume = w * r
          const existingVolume = existing ? existing.weight * existing.reps : 0
          if (volume > existingVolume) {
            setPersonalRecords(p => ({ ...p, [prKey]: { weight: w, reps: r, date } }))
          }
        }
      }

      return { ...prev, [dateKey]: { ...current, [exerciseId]: newSets } }
    })
  }

  const completedExercises = workout.exercises.filter(ex => {
    const sets = todayLog[ex.id] || []
    return sets.filter(s => s.completed).length === ex.sets
  }).length

  return (
    <div>
      {/* Workout header */}
      <div className="rounded-2xl p-4 mb-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider">{workout.day}</p>
            <h2 className="display-font text-3xl font-black text-white">{workout.name.toUpperCase()}</h2>
            <p className="text-purple-200 text-sm">{workout.subtitle}</p>
          </div>
          <div className="text-right">
            <p className="display-font text-3xl font-black text-white">{formatTime(timer)}</p>
            <button
              onClick={() => setTimerActive(!timerActive)}
              className={`text-xs font-semibold px-3 py-1 rounded-full mt-1 ${
                timerActive ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}
            >
              {timerActive ? '⏸ Pause' : '▶ Start'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-purple-300 mb-1">
            <span>{completedExercises}/{workout.exercises.length} exercises</span>
            <span>{Math.round((completedExercises / workout.exercises.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-purple-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-400 rounded-full transition-all duration-500"
              style={{ width: `${(completedExercises / workout.exercises.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Science note */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 mb-4">
        <p className="text-purple-400 text-xs font-semibold mb-1">💡 Science Note</p>
        <p className="text-gray-400 text-xs leading-relaxed">{workout.scienceNote}</p>
      </div>

      {/* Warm-up */}
      <div className="card mb-4">
        <p className="display-font text-base font-bold text-yellow-400 mb-2">WARM-UP (5 MIN)</p>
        {workout.warmup.map((item, i) => (
          <p key={i} className="text-gray-400 text-sm py-1">• {item}</p>
        ))}
      </div>

      {/* Exercises */}
      <h3 className="display-font text-lg font-bold text-gray-300 mb-3">EXERCISES</h3>
      {workout.exercises.map(exercise => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          logData={todayLog[exercise.id]}
          onUpdateSet={(setIndex, field, value) => updateSet(exercise.id, setIndex, field, value)}
          previousSets={getPreviousWorkoutLog(exercise.id, workout.id, workoutLog)}
          personalRecord={personalRecords[exercise.id]}
        />
      ))}

      {/* Cool-down */}
      <div className="card mb-4">
        <p className="display-font text-base font-bold text-teal-400 mb-2">COOL-DOWN</p>
        {workout.cooldown.map((item, i) => (
          <p key={i} className="text-gray-400 text-sm py-1">• {item}</p>
        ))}
      </div>

      {/* Overload rule */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-6">
        <p className="text-green-400 text-xs font-semibold mb-1">📈 Progressive Overload</p>
        <p className="text-gray-400 text-xs">{workout.overloadRule}</p>
      </div>
    </div>
  )
}

function PersonalRecordsView() {
  const [personalRecords] = useLocalStorage('fittrack_personal_records', {})
  const allExercises = Object.values(WORKOUTS).flatMap(w => w.exercises)

  const exercisesWithPRs = allExercises.filter(ex => personalRecords[ex.id])

  if (exercisesWithPRs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🏆</p>
        <p className="text-gray-400 text-sm">No PRs yet. Complete your first workout to start tracking!</p>
      </div>
    )
  }

  return (
    <div>
      {Object.values(WORKOUTS).map(workout => {
        const workoutPRs = workout.exercises.filter(ex => personalRecords[ex.id])
        if (workoutPRs.length === 0) return null
        return (
          <div key={workout.id} className="mb-5">
            <h3 className="display-font text-base font-bold text-gray-400 uppercase tracking-wider mb-2">{workout.name}</h3>
            <div className="card p-0 overflow-hidden divide-y divide-gray-800">
              {workoutPRs.map(ex => {
                const pr = personalRecords[ex.id]
                return (
                  <div key={ex.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-gray-200 text-sm font-medium">{ex.name}</p>
                      <p className="text-gray-500 text-xs">{pr.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold text-sm">{pr.weight} lbs × {pr.reps}</p>
                      <p className="text-gray-500 text-xs">{(pr.weight * pr.reps).toFixed(0)} vol</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Workouts({ startDate, workoutSchedule }) {
  const [view, setView] = useState('today')
  const [selectedWorkout, setSelectedWorkout] = useState(null)

  const dayName = getDayName()
  const workoutType = (workoutSchedule || {})[dayName]
  const todayWorkout = workoutType && workoutType !== 'rest' ? WORKOUTS[workoutType] : null
  const today = getTodayKey()

  // Build library entries from the user's actual schedule
  const scheduledDays = Object.entries(workoutSchedule || {})
    .filter(([, type]) => type !== 'rest')
    .map(([day, type]) => ({ day, workoutId: type }))

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-hide bg-gray-950">
      <div className="px-4 pt-14 pb-36">
        <h1 className="display-font text-3xl font-black text-white mb-4">WORKOUTS</h1>

        {/* Sub tabs */}
        <div className="flex bg-gray-900 rounded-xl p-1 mb-4 border border-gray-800">
          {[
            { id: 'today', label: "Today's" },
            { id: 'library', label: 'Library' },
            { id: 'records', label: 'PRs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === tab.id ? 'bg-purple-600 text-white' : 'text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {view === 'today' && (
          todayWorkout ? (
            <WorkoutView workout={todayWorkout} date={today} />
          ) : (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">😴</p>
              <h2 className="display-font text-2xl font-black text-white mb-2">REST DAY</h2>
              <p className="text-gray-400 text-sm mb-6">Today is {dayName} — recovery is training too.</p>
              <div className="card text-left space-y-2">
                <p className="text-purple-300 text-sm font-semibold mb-2">Active Recovery Tips:</p>
                <p className="text-gray-400 text-sm">• Optional 20–30 min light walk</p>
                <p className="text-gray-400 text-sm">• No intense cardio — counterproductive to recovery</p>
                <p className="text-gray-400 text-sm">• Priority: 7–9 hours sleep tonight</p>
                <p className="text-gray-400 text-sm">• Stay hydrated, hit your protein goal</p>
              </div>
            </div>
          )
        )}

        {view === 'library' && (
          selectedWorkout ? (
            <div>
              <button onClick={() => setSelectedWorkout(null)} className="flex items-center gap-2 text-purple-400 mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Library
              </button>
              <WorkoutView workout={selectedWorkout} date={today} />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-500 text-sm mb-4">{scheduledDays.length}-Day Split</p>
              {scheduledDays.map(({ day, workoutId }) => {
                const w = WORKOUTS[workoutId]
                return (
                  <button
                    key={workoutId}
                    onClick={() => setSelectedWorkout(w)}
                    className="card w-full text-left flex items-center justify-between"
                  >
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">{day}</p>
                      <p className="display-font text-xl font-black text-white">{w.name.toUpperCase()}</p>
                      <p className="text-gray-400 text-sm">{w.subtitle}</p>
                      <p className="text-purple-400 text-xs mt-1">{w.exercises.length} exercises</p>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )
              })}
            </div>
          )
        )}

        {view === 'records' && <PersonalRecordsView />}
      </div>
    </div>
  )
}
