import React, { useState } from 'react'

export default function Onboarding({ onComplete, profile, setProfile }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState(profile.name || '')

  const handleStart = () => {
    setProfile(prev => ({ ...prev, name }))
    onComplete(new Date().toISOString())
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {step === 0 && (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center glow-accent" style={{ background: 'linear-gradient(135deg, #534AB7, #6B63C9)' }}>
                <span className="text-5xl">💪</span>
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tight display-font text-white mb-2">FITTRACK</h1>
              <p className="text-gray-400 text-base">Your 8-Week Body Recomposition Plan</p>
            </div>
            <div className="card text-left space-y-3">
              <p className="text-gray-300 font-medium text-sm">What's included:</p>
              {[
                '🍽️ 8 weeks of curated meal plans',
                '🏋️ 4-day Upper/Lower split workouts',
                '📊 Progress tracking & body stats',
                '🛒 Auto-generated grocery lists',
                '📅 Daily schedule & reminders'
              ].map((item, i) => (
                <p key={i} className="text-gray-400 text-sm">{item}</p>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="btn-primary w-full text-lg py-4"
            >
              Let's Get Started
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="display-font text-4xl font-black text-white mb-2">WHAT'S YOUR NAME?</h2>
              <p className="text-gray-400 text-sm">We'll personalize your experience</p>
            </div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name (optional)"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-purple-500 placeholder-gray-600"
              autoFocus
            />
            <div className="card space-y-2">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Your Profile</p>
              {[
                ['Age', '24 years old'],
                ['Height', "5'10\" (178 cm)"],
                ['Starting Weight', '203 lbs'],
                ['Goal', 'Body Recomposition'],
                ['Daily Calories', '2,650 cal (300 deficit)'],
                ['Protein Target', '200g/day'],
                ['Workout Days', 'Mon · Tue · Thu · Fri'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">{label}</span>
                  <span className="text-gray-200 text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs text-center">You can edit these in Settings anytime</p>
            <button
              onClick={handleStart}
              className="btn-primary w-full text-lg py-4"
            >
              {name ? `Let's Go, ${name}! 🚀` : "Start 8-Week Plan 🚀"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
