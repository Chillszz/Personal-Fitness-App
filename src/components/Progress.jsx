import React, { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'

function getWeekNumber(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  const diffMs = now - start
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.min(8, Math.max(1, Math.floor(diffDays / 7) + 1))
}

function getDaysSince(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  return Math.floor((now - start) / (1000 * 60 * 60 * 24))
}

const MILESTONES = [
  { id: 'first_workout', label: 'First Workout Done!', emoji: '🏋️', description: 'Completed Day 1 workout', check: (data) => Object.keys(data.workoutLog || {}).length >= 1 },
  { id: 'one_week', label: 'One Week Strong!', emoji: '🔥', description: '7 days in the plan', check: (data) => getDaysSince(data.startDate) >= 7 },
  { id: 'ten_lbs', label: '10 lbs Down!', emoji: '⚡', description: 'Lost 10 lbs from starting weight', check: (data) => (data.startWeight - data.currentWeight) >= 10 },
  { id: 'month_1', label: 'Month 1 Complete!', emoji: '🥇', description: 'Completed 4 full weeks', check: (data) => getDaysSince(data.startDate) >= 28 },
  { id: 'halfway', label: 'Halfway There!', emoji: '🎯', description: 'Reached Week 4', check: (data) => getWeekNumber(data.startDate) >= 4 },
  { id: 'two_months', label: 'Two Months Strong!', emoji: '🏆', description: 'Completed the full 8-week plan!', check: (data) => getDaysSince(data.startDate) >= 56 }
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-3">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-white font-bold text-sm">{payload[0].value} lbs</p>
      </div>
    )
  }
  return null
}

export default function Progress({ profile, startDate }) {
  const [weightLog, setWeightLog] = useLocalStorage('fittrack_weight_log', [])
  const [stats, setStats] = useLocalStorage('fittrack_stats', {
    startWeight: 203,
    measurements: { waist: '', chest: '', arms: '' },
    currentMeasurements: { waist: '', chest: '', arms: '' }
  })
  const [weeklyCheckIn, setWeeklyCheckIn] = useLocalStorage('fittrack_weekly_checkin', {})
  const [workoutLog] = useLocalStorage('fittrack_workout_log', {})
  const [checklist] = useLocalStorage('fittrack_daily_checklist', {})
  const [todayWeight, setTodayWeight] = useState('')
  const [checkInData, setCheckInData] = useState({ workout: 3, energy: 3, notes: '' })
  const [activeSection, setActiveSection] = useState('weight')

  const todayKey = new Date().toISOString().split('T')[0]
  const currentWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : profile.startWeight
  const weightLost = profile.startWeight - currentWeight
  const weekNum = getWeekNumber(startDate)
  const daysSince = getDaysSince(startDate)

  const logWeight = () => {
    const w = parseFloat(todayWeight)
    if (!w || w < 50 || w > 600) return
    const existing = weightLog.findIndex(e => e.date === todayKey)
    if (existing >= 0) {
      const newLog = [...weightLog]
      newLog[existing] = { date: todayKey, weight: w }
      setWeightLog(newLog)
    } else {
      setWeightLog([...weightLog, { date: todayKey, weight: w }])
    }
    setTodayWeight('')
  }

  // Chart data: add start weight as first point
  const chartData = [
    { date: new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), weight: profile.startWeight },
    ...weightLog.map(e => ({
      date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: e.weight
    }))
  ]

  const milestoneCheckData = {
    startDate,
    workoutLog,
    startWeight: profile.startWeight,
    currentWeight
  }

  // Weekly protein average from checklist
  const thisWeekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  })
  const mealsLoggedDays = thisWeekDays.filter(day => {
    const d = checklist[day]
    return d && d.meal1 && d.meal2 && d.meal3 && d.meal4
  }).length
  const workoutCompletedDays = thisWeekDays.filter(day => {
    const d = checklist[day]
    return d && d.workout
  }).length

  const saveCheckIn = () => {
    setWeeklyCheckIn(prev => ({
      ...prev,
      [`week_${weekNum}`]: { ...checkInData, date: todayKey }
    }))
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-hide bg-gray-950">
      <div className="px-4 pt-14 pb-36">
        <h1 className="display-font text-3xl font-black text-white mb-2">PROGRESS</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="card text-center">
            <p className="display-font text-2xl font-black text-white">{weekNum}</p>
            <p className="text-gray-500 text-xs">of 8 weeks</p>
          </div>
          <div className="card text-center">
            <p className={`display-font text-2xl font-black ${weightLost > 0 ? 'text-green-400' : weightLost < 0 ? 'text-red-400' : 'text-white'}`}>
              {weightLost > 0 ? '-' : weightLost < 0 ? '+' : ''}{Math.abs(weightLost).toFixed(1)}
            </p>
            <p className="text-gray-500 text-xs">lbs {weightLost >= 0 ? 'lost' : 'gained'}</p>
          </div>
          <div className="card text-center">
            <p className="display-font text-2xl font-black text-white">{daysSince}</p>
            <p className="text-gray-500 text-xs">days in</p>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
          {[
            { id: 'weight', label: 'Weight' },
            { id: 'milestones', label: 'Milestones' },
            { id: 'body', label: 'Body Stats' },
            { id: 'weekly', label: 'Check-In' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeSection === s.id ? 'bg-purple-600 text-white' : 'bg-gray-900 border border-gray-800 text-gray-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Weight section */}
        {activeSection === 'weight' && (
          <div>
            {/* Log today's weight */}
            <div className="card mb-4">
              <p className="display-font text-base font-bold text-gray-300 mb-3">LOG TODAY'S WEIGHT</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  value={todayWeight}
                  onChange={e => setTodayWeight(e.target.value)}
                  placeholder={`${currentWeight} lbs`}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-purple-500 placeholder-gray-600"
                />
                <button onClick={logWeight} className="btn-primary px-5">Log</button>
              </div>
              <p className="text-gray-500 text-xs mt-2">Current: {currentWeight} lbs · Start: {profile.startWeight} lbs</p>
            </div>

            {/* Weight chart */}
            {chartData.length > 1 && (
              <div className="card mb-4">
                <p className="display-font text-base font-bold text-gray-300 mb-3">WEIGHT OVER TIME</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={['auto', 'auto']} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={profile.startWeight} stroke="#534AB7" strokeDasharray="4 4" label={{ value: 'Start', fill: '#a78bfa', fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#a78bfa"
                      strokeWidth={2.5}
                      dot={{ fill: '#a78bfa', r: 4 }}
                      activeDot={{ r: 6, fill: '#534AB7' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Weight log list */}
            {weightLog.length > 0 && (
              <div className="card">
                <p className="display-font text-base font-bold text-gray-300 mb-3">WEIGHT LOG</p>
                <div className="divide-y divide-gray-800 max-h-60 overflow-y-auto">
                  {[...weightLog].reverse().map((entry, i) => {
                    const delta = i < weightLog.length - 1
                      ? entry.weight - weightLog[weightLog.length - 2 - i]?.weight
                      : entry.weight - profile.startWeight
                    return (
                      <div key={entry.date} className="flex items-center justify-between py-2.5">
                        <span className="text-gray-400 text-sm">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <div className="flex items-center gap-2">
                          {delta !== 0 && (
                            <span className={`text-xs font-bold ${delta < 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                            </span>
                          )}
                          <span className="text-white font-bold text-sm">{entry.weight} lbs</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Weekly macro summary */}
            <div className="card mt-4">
              <p className="display-font text-base font-bold text-gray-300 mb-3">THIS WEEK'S SUMMARY</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">All meals logged</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 rounded-full" style={{ width: `${(mealsLoggedDays / 7) * 100}%` }} />
                    </div>
                    <span className="text-white text-sm font-bold">{mealsLoggedDays}/7</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Workouts completed</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(workoutCompletedDays / 4) * 100}%` }} />
                    </div>
                    <span className="text-white text-sm font-bold">{workoutCompletedDays}/4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Milestones section */}
        {activeSection === 'milestones' && (
          <div className="space-y-3">
            {MILESTONES.map(m => {
              const unlocked = m.check(milestoneCheckData)
              return (
                <div key={m.id} className={`card flex items-center gap-4 ${unlocked ? 'border-yellow-500/30' : 'opacity-60'}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    unlocked ? 'bg-yellow-500/20' : 'bg-gray-800'
                  }`}>
                    {m.emoji}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${unlocked ? 'text-white' : 'text-gray-500'}`}>{m.label}</p>
                    <p className="text-gray-500 text-xs">{m.description}</p>
                    {unlocked && <p className="text-yellow-400 text-xs font-semibold mt-1">✓ Unlocked!</p>}
                  </div>
                  {!unlocked && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600 shrink-0">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Body stats section */}
        {activeSection === 'body' && (
          <div>
            <div className="card mb-4">
              <p className="display-font text-base font-bold text-gray-300 mb-3">STARTING MEASUREMENTS</p>
              <p className="text-gray-500 text-xs mb-3">Enter your starting measurements (optional)</p>
              {['waist', 'chest', 'arms'].map(field => (
                <div key={field} className="flex items-center gap-3 mb-3">
                  <label className="text-gray-400 text-sm w-16 capitalize">{field}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={stats.measurements[field]}
                    onChange={e => setStats(prev => ({ ...prev, measurements: { ...prev.measurements, [field]: e.target.value } }))}
                    placeholder="inches"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 placeholder-gray-600"
                  />
                  <span className="text-gray-500 text-sm">in</span>
                </div>
              ))}
            </div>

            <div className="card mb-4">
              <p className="display-font text-base font-bold text-gray-300 mb-3">CURRENT MEASUREMENTS</p>
              {['waist', 'chest', 'arms'].map(field => {
                const start = parseFloat(stats.measurements[field])
                const current = parseFloat(stats.currentMeasurements[field])
                const delta = !isNaN(start) && !isNaN(current) ? current - start : null
                return (
                  <div key={field} className="flex items-center gap-3 mb-3">
                    <label className="text-gray-400 text-sm w-16 capitalize">{field}</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={stats.currentMeasurements[field]}
                      onChange={e => setStats(prev => ({ ...prev, currentMeasurements: { ...prev.currentMeasurements, [field]: e.target.value } }))}
                      placeholder="inches"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 placeholder-gray-600"
                    />
                    {delta !== null && (
                      <span className={`text-sm font-bold w-16 text-right ${delta < 0 ? 'text-green-400' : delta > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}"
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="card">
              <p className="display-font text-base font-bold text-gray-300 mb-3">PROFILE</p>
              <div className="space-y-2">
                {[
                  ['Age', `${profile.age} years old`],
                  ['Height', profile.height],
                  ['Starting Weight', `${profile.startWeight} lbs`],
                  ['Current Weight', `${currentWeight} lbs`],
                  ['Goal', profile.goal],
                  ['Daily Calories', `${profile.dailyCalories} cal`],
                  ['Protein Target', `${profile.proteinGoal}g/day`],
                  ['TDEE', `${profile.tdee} cal`]
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500 text-sm">{label}</span>
                    <span className="text-gray-200 text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weekly check-in */}
        {activeSection === 'weekly' && (
          <div>
            <div className="card mb-4">
              <p className="display-font text-base font-bold text-gray-300 mb-1">WEEK {weekNum} CHECK-IN</p>
              <p className="text-gray-500 text-xs mb-4">Log how the week is going</p>

              <div className="mb-4">
                <p className="text-gray-300 text-sm font-medium mb-2">How did workouts feel? (1–5)</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setCheckInData(prev => ({ ...prev, workout: n }))}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                        checkInData.workout === n ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600 text-xs">Brutal</span>
                  <span className="text-gray-600 text-xs">Crushed it</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-300 text-sm font-medium mb-2">Energy levels this week? (1–5)</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setCheckInData(prev => ({ ...prev, energy: n }))}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                        checkInData.energy === n ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600 text-xs">Drained</span>
                  <span className="text-gray-600 text-xs">On fire</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-300 text-sm font-medium mb-2">Notes</p>
                <textarea
                  value={checkInData.notes}
                  onChange={e => setCheckInData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="How's the plan working? Any adjustments needed?"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 placeholder-gray-600 resize-none h-24"
                />
              </div>

              <button onClick={saveCheckIn} className="btn-primary w-full">Save Check-In</button>
            </div>

            {/* Previous check-ins */}
            {Object.keys(weeklyCheckIn).length > 0 && (
              <div className="card">
                <p className="display-font text-base font-bold text-gray-300 mb-3">PREVIOUS CHECK-INS</p>
                <div className="space-y-3">
                  {Object.entries(weeklyCheckIn)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([weekKey, data]) => (
                    <div key={weekKey} className="border-b border-gray-800 pb-3 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-300 text-sm font-medium">{weekKey.replace('_', ' ').replace('week', 'Week')}</span>
                        <span className="text-gray-500 text-xs">{data.date}</span>
                      </div>
                      <div className="flex gap-4 mb-1">
                        <span className="text-gray-400 text-xs">Workout: <span className="text-purple-400 font-bold">{data.workout}/5</span></span>
                        <span className="text-gray-400 text-xs">Energy: <span className="text-blue-400 font-bold">{data.energy}/5</span></span>
                      </div>
                      {data.notes && <p className="text-gray-500 text-xs italic">"{data.notes}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
