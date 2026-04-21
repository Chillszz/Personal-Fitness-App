import React, { useState } from 'react'

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' }

const FREQUENCY_CONFIG = {
  2: {
    label: '2 Days',
    split: 'Full Body × 2',
    bestDays: ['Monday', 'Thursday'],
    rationale: 'Monday & Thursday gives 3 days between sessions — the optimal window for full muscle recovery. Each workout hits the whole body.',
    workoutMap: { 0: 'push', 1: 'pull' }
  },
  3: {
    label: '3 Days',
    split: 'Push / Pull / Lower',
    bestDays: ['Monday', 'Wednesday', 'Friday'],
    rationale: 'Classic Mon/Wed/Fri with 48hr gaps. Trains each muscle 2x/week which research confirms is the sweet spot for beginners.',
    workoutMap: { 0: 'push', 1: 'pull', 2: 'lowerA' }
  },
  4: {
    label: '4 Days',
    split: 'Upper / Lower Split',
    bestDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    rationale: '2-on / 1-off / 2-on / 2-off. Wednesday rest breaks the week and allows upper body recovery. Optimal for body recomp.',
    workoutMap: { 0: 'push', 1: 'lowerA', 2: 'pull', 3: 'lowerB' }
  },
  5: {
    label: '5 Days',
    split: 'Push / Pull / Legs + repeat',
    bestDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'],
    rationale: 'Skip Thu & Sun for CNS recovery. Trains each muscle 2–3x/week. Requires solid sleep and nutrition to sustain.',
    workoutMap: { 0: 'push', 1: 'lowerA', 2: 'pull', 3: 'lowerB', 4: 'push' }
  },
  6: {
    label: '6 Days',
    split: 'Push / Pull / Legs × 2',
    bestDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    rationale: 'PPL twice per week. Sunday is mandatory full rest. High recovery demand — requires 200g+ protein and 8hrs sleep nightly.',
    workoutMap: { 0: 'push', 1: 'lowerA', 2: 'pull', 3: 'push', 4: 'lowerB', 5: 'pull' }
  }
}

const WORKOUT_LABELS = { push: 'Upper Push', lowerA: 'Lower A', pull: 'Upper Pull', lowerB: 'Lower B' }

export function buildWorkoutSchedule(selectedDays, freqConfig) {
  const schedule = {}
  ALL_DAYS.forEach(d => { schedule[d] = 'rest' })
  selectedDays.forEach((day, i) => {
    schedule[day] = freqConfig.workoutMap[i] || 'rest'
  })
  return schedule
}

export default function Onboarding({ onComplete, profile, setProfile }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState(profile.name || '')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [frequency, setFrequency] = useState(4)
  const [selectedDays, setSelectedDays] = useState(FREQUENCY_CONFIG[4].bestDays)
  const [customizing, setCustomizing] = useState(false)

  const freqConfig = FREQUENCY_CONFIG[frequency]

  const handleFrequencyChange = (freq) => {
    setFrequency(freq)
    setSelectedDays(FREQUENCY_CONFIG[freq].bestDays)
    setCustomizing(false)
  }

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > frequency) return
      setSelectedDays(prev => prev.filter(d => d !== day))
    } else {
      if (selectedDays.length >= frequency) {
        setSelectedDays(prev => [...prev.slice(1), day])
      } else {
        setSelectedDays(prev => [...prev, day])
      }
    }
  }

  const orderedSelectedDays = ALL_DAYS.filter(d => selectedDays.includes(d))

  const handleFinish = () => {
    const schedule = buildWorkoutSchedule(orderedSelectedDays, freqConfig)
    setProfile(prev => ({
      ...prev,
      name,
      workoutDays: orderedSelectedDays,
      workoutFrequency: frequency,
      workoutSchedule: schedule
    }))
    onComplete(new Date(startDate).toISOString())
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Step indicator */}
        {step > 0 && (
          <div className="flex gap-1.5 justify-center mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 rounded-full transition-all ${s <= step ? 'bg-purple-500 w-8' : 'bg-gray-700 w-4'}`} />
            ))}
          </div>
        )}

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center glow-accent" style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C9)' }}>
              <span className="text-5xl">💪</span>
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tight display-font text-white mb-2">FITTRACK</h1>
              <p className="text-gray-400 text-base">Your 8-Week Body Recomposition Plan</p>
            </div>
            <div className="card text-left space-y-3">
              <p className="text-gray-300 font-medium text-sm">What's included:</p>
              {[
                '🍽️ 8 weeks of curated meal plans',
                '🏋️ Personalized workout schedule',
                '📊 Progress tracking & body stats',
                '🛒 Auto-generated grocery lists',
                '📅 Daily schedule & reminders'
              ].map((item, i) => (
                <p key={i} className="text-gray-400 text-sm">{item}</p>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="btn-primary w-full text-lg py-4">
              Let's Get Started
            </button>
          </div>
        )}

        {/* Step 1: Name + Start Date */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="display-font text-4xl font-black text-white mb-1">LET'S SET YOU UP</h2>
              <p className="text-gray-400 text-sm">Step 1 of 3</p>
            </div>

            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold block mb-2">Your Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-purple-500 placeholder-gray-600"
                autoFocus
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold block mb-2">Plan Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-purple-500"
                style={{ colorScheme: 'dark' }}
              />
              <p className="text-gray-600 text-xs mt-1.5">This is when Week 1 begins. Meal plans and weekly progress track from this date.</p>
            </div>

            <button onClick={() => setStep(2)} className="btn-primary w-full text-lg py-4">
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Workout frequency */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="display-font text-4xl font-black text-white mb-1">WORKOUT DAYS</h2>
              <p className="text-gray-400 text-sm">Step 2 of 3 — How many days per week?</p>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => handleFrequencyChange(n)}
                  className={`py-3 rounded-xl font-black display-font text-xl transition-all ${
                    frequency === n ? 'bg-purple-600 text-white glow-accent' : 'bg-gray-900 border border-gray-700 text-gray-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Science card */}
            <div className="rounded-xl p-4 border border-purple-500/20" style={{ background: 'linear-gradient(135deg, rgba(83,74,183,0.15), rgba(107,99,201,0.08))' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 text-xs font-bold uppercase tracking-wider">{freqConfig.label} · {freqConfig.split}</span>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">Recommended</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">💡 {freqConfig.rationale}</p>
            </div>

            {/* Best days preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Best days for {frequency}x/week</p>
                <button onClick={() => setCustomizing(!customizing)} className="text-purple-400 text-xs font-semibold">
                  {customizing ? 'Use recommended' : 'Customize'}
                </button>
              </div>

              {customizing ? (
                <div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {ALL_DAYS.map(day => {
                      const selected = selectedDays.includes(day)
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`py-2 rounded-lg text-xs font-bold transition-all ${
                            selected ? 'bg-purple-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-500'
                          }`}
                        >
                          {DAY_SHORT[day].slice(0, 2)}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-gray-600 text-xs text-center">{selectedDays.length}/{frequency} days selected</p>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {ALL_DAYS.map(day => {
                    const isWorkout = freqConfig.bestDays.includes(day)
                    const idx = freqConfig.bestDays.indexOf(day)
                    return (
                      <div key={day} className={`rounded-lg p-1.5 text-center ${isWorkout ? 'bg-purple-600' : 'bg-gray-900 border border-gray-800'}`}>
                        <p className={`text-xs font-bold ${isWorkout ? 'text-white' : 'text-gray-600'}`}>{DAY_SHORT[day].slice(0, 2)}</p>
                        {isWorkout && (
                          <p className="text-purple-200 text-xs mt-0.5 leading-none" style={{ fontSize: '9px' }}>
                            {WORKOUT_LABELS[freqConfig.workoutMap[idx]]?.split(' ')[0]}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1 py-3">← Back</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">Next →</button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="display-font text-4xl font-black text-white mb-1">READY TO GO</h2>
              <p className="text-gray-400 text-sm">Step 3 of 3 — Confirm your plan</p>
            </div>

            <div className="card space-y-3">
              {[
                ['Name', name || 'Not set'],
                ['Start Date', new Date(startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })],
                ['Workout Days', `${frequency}x per week`],
                ['Split', freqConfig.split],
                ['Days', orderedSelectedDays.map(d => DAY_SHORT[d]).join(' · ')],
                ['Goal', 'Body Recomposition'],
                ['Calories', '2,650 cal/day'],
                ['Protein', '200g/day'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-start">
                  <span className="text-gray-500 text-sm">{label}</span>
                  <span className="text-gray-200 text-sm font-medium text-right max-w-[55%]">{value}</span>
                </div>
              ))}
            </div>

            {/* Workout day breakdown */}
            <div className="card">
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3">Your Workout Schedule</p>
              <div className="space-y-2">
                {orderedSelectedDays.map((day, i) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm font-medium">{day}</span>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold">
                      {WORKOUT_LABELS[freqConfig.workoutMap[i]]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-gray-600 text-xs text-center">You can edit all of this in Settings anytime</p>

            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="btn-ghost flex-1 py-3">← Back</button>
              <button onClick={handleFinish} className="btn-primary flex-1 py-3">
                {name ? `Let's Go, ${name}! 🚀` : 'Start Plan 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
