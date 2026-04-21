import React, { useState } from 'react'

export default function Settings({ profile, setProfile, theme, setTheme, onClose, startDate }) {
  const [localProfile, setLocalProfile] = useState({ ...profile })
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const save = () => {
    setProfile(localProfile)
    onClose()
  }

  const handleReset = () => {
    if (showResetConfirm) {
      // Clear all fittrack localStorage keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('fittrack_')) localStorage.removeItem(key)
      })
      window.location.reload()
    } else {
      setShowResetConfirm(true)
    }
  }

  const field = (label, key, type = 'text', hint = null) => (
    <div className="mb-4">
      <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold block mb-1.5">{label}</label>
      <input
        type={type}
        inputMode={type === 'number' ? 'numeric' : 'text'}
        value={localProfile[key]}
        onChange={e => setLocalProfile(prev => ({ ...prev, [key]: type === 'number' ? parseFloat(e.target.value) || '' : e.target.value }))}
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
      />
      {hint && <p className="text-gray-600 text-xs mt-1">{hint}</p>}
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-hide bg-gray-950">
      <div className="px-4 pt-14 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="display-font text-3xl font-black text-white">SETTINGS</h1>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Theme */}
        <div className="card mb-4">
          <p className="display-font text-base font-bold text-gray-300 mb-3">APPEARANCE</p>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              🌙 Dark
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                theme === 'light' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              ☀️ Light
            </button>
          </div>
        </div>

        {/* Profile */}
        <div className="card mb-4">
          <p className="display-font text-base font-bold text-gray-300 mb-3">PROFILE</p>
          {field('Name', 'name', 'text')}
          {field('Age', 'age', 'number')}
          {field('Height', 'height', 'text', "e.g. 5'10\"")}
          {field('Starting Weight (lbs)', 'startWeight', 'number')}
          {field('Goal', 'goal', 'text')}
        </div>

        {/* Nutrition */}
        <div className="card mb-4">
          <p className="display-font text-base font-bold text-gray-300 mb-3">NUTRITION TARGETS</p>
          {field('Daily Calories', 'dailyCalories', 'number', 'Recommended: 2,650 cal for body recomp')}
          {field('Protein Goal (g/day)', 'proteinGoal', 'number', 'Recommended: 200g for muscle retention')}
          {field('TDEE (cal)', 'tdee', 'number', 'Total Daily Energy Expenditure')}
        </div>

        {/* Plan info */}
        <div className="card mb-4">
          <p className="display-font text-base font-bold text-gray-300 mb-3">PLAN INFO</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Start Date</span>
              <span className="text-gray-200 text-sm font-medium">
                {startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Workout Days</span>
              <span className="text-gray-200 text-sm font-medium">Mon / Tue / Thu / Fri</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Workout Time</span>
              <span className="text-gray-200 text-sm font-medium">6:30–8:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Equipment</span>
              <span className="text-gray-200 text-sm font-medium">Adjustable DBs (55 lbs), mat</span>
            </div>
          </div>
        </div>

        <button onClick={save} className="btn-primary w-full text-base py-4 mb-3">
          Save Changes
        </button>

        {/* Danger zone */}
        <div className="card border-red-500/20 mb-8">
          <p className="display-font text-base font-bold text-red-400 mb-2">DANGER ZONE</p>
          <p className="text-gray-500 text-xs mb-3">This will delete all your data including workout logs, weight history, and checklist data. This cannot be undone.</p>
          <button
            onClick={handleReset}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all border ${
              showResetConfirm
                ? 'border-red-500 bg-red-500/20 text-red-400'
                : 'border-red-500/30 text-red-500/70 hover:border-red-500'
            }`}
          >
            {showResetConfirm ? '⚠️ Tap again to confirm reset' : 'Reset All Data'}
          </button>
        </div>
      </div>
    </div>
  )
}
