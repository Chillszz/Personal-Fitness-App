import React, { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { MEAL_PLAN, MEAL_LABELS } from '../data/meals'
import { GROCERY_DATA, CATEGORY_LABELS, GROCERY_NOTE, getGroceryForWeek } from '../data/grocery'

function MealCard({ type, meal, weekNum }) {
  const [expanded, setExpanded] = useState(false)
  const labelColors = {
    breakfast: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    lunch: 'bg-green-500/20 text-green-400 border-green-500/30',
    snack: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dinner: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  }

  return (
    <div className="card mb-3">
      <div className="flex items-start justify-between mb-2">
        <span className={`pill border text-xs font-bold ${labelColors[type]}`}>
          {MEAL_LABELS[type]}
        </span>
        <span className="pill bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
          ~{meal.protein}g protein
        </span>
      </div>
      <h3 className="display-font text-xl font-black text-white mb-1">{meal.name}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-3">{meal.flavor}</p>

      {/* Ingredient tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {meal.ingredients.map((ing, i) => (
          <span key={i} className="px-2 py-0.5 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">
            {ing}
          </span>
        ))}
      </div>

      {/* Sauce/Marinade note */}
      {(meal.marinade || meal.sauce || meal.spices) && (
        <div className="bg-gray-800/50 rounded-xl p-3 mb-3 border border-gray-700/50">
          <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1">
            {meal.marinade ? '🌿 Marinade' : meal.sauce ? '🥣 Sauce' : '🌶️ Spice Mix'}
          </p>
          <p className="text-gray-300 text-xs leading-relaxed">{meal.marinade || meal.sauce || meal.spices}</p>
        </div>
      )}

      {/* Substitute toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-purple-400 text-sm font-medium"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        Substitutes
      </button>
      {expanded && (
        <div className="mt-2 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <p className="text-gray-300 text-sm">🔄 {meal.substitute}</p>
        </div>
      )}
    </div>
  )
}

function MealPlanTab({ startDate }) {
  const [month, setMonth] = useState(1)
  const [selectedWeek, setSelectedWeek] = useState(1)

  const weeksForMonth = month === 1 ? [1, 2, 3, 4] : [5, 6, 7, 8]
  const meals = MEAL_PLAN[selectedWeek]

  return (
    <div>
      {/* Month tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setMonth(1); setSelectedWeek(1) }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            month === 1 ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'
          }`}
        >
          Month 1
        </button>
        <button
          onClick={() => { setMonth(2); setSelectedWeek(5) }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            month === 2 ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'
          }`}
        >
          Month 2
        </button>
      </div>

      {/* Week selector pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {weeksForMonth.map(w => (
          <button
            key={w}
            onClick={() => setSelectedWeek(w)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedWeek === w
                ? 'bg-purple-600 text-white'
                : 'bg-gray-900 text-gray-400 border border-gray-800'
            }`}
          >
            Week {w}
          </button>
        ))}
      </div>

      {/* Week theme banner */}
      <div className="rounded-xl px-4 py-3 mb-4 border border-purple-500/20" style={{ background: 'linear-gradient(135deg, rgba(83,74,183,0.15), rgba(107,99,201,0.1))' }}>
        <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider">Week {selectedWeek} Theme</p>
        <p className="text-white font-bold">{meals?.theme}</p>
        <p className="text-purple-300 text-xs mt-1">~{
          Object.values(meals || {}).reduce((sum, meal) => typeof meal === 'object' && meal.protein ? sum + meal.protein : sum, 0)
        }g protein/day</p>
      </div>

      {/* Meal cards */}
      {meals && ['breakfast', 'lunch', 'snack', 'dinner'].map(type => (
        <MealCard key={type} type={type} meal={meals[type]} weekNum={selectedWeek} />
      ))}
    </div>
  )
}

function GroceryTab() {
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [groceryChecked, setGroceryChecked] = useLocalStorage('fittrack_grocery_checked', {})

  const weekItems = getGroceryForWeek(selectedWeek)

  const toggleItem = (itemId) => {
    const key = `week_${selectedWeek}_${itemId}`
    setGroceryChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isChecked = (itemId) => !!groceryChecked[`week_${selectedWeek}_${itemId}`]

  const resetList = () => {
    const newChecked = { ...groceryChecked }
    Object.keys(newChecked).forEach(k => {
      if (k.startsWith(`week_${selectedWeek}_`)) delete newChecked[k]
    })
    setGroceryChecked(newChecked)
  }

  const total = Object.values(weekItems).flat().reduce((sum, item) => sum + item.price, 0)
  const checkedTotal = Object.values(weekItems).flat()
    .filter(item => isChecked(item.id))
    .reduce((sum, item) => sum + item.price, 0)

  return (
    <div>
      {/* Week selector — grid so all 8 are always visible */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[1,2,3,4,5,6,7,8].map(w => (
          <button
            key={w}
            onClick={() => setSelectedWeek(w)}
            className={`py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedWeek === w ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'
            }`}
          >
            Week {w}
          </button>
        ))}
      </div>

      {/* Total + reset */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-500 text-xs">Estimated Total</p>
          <p className="display-font text-2xl font-black text-white">${total} <span className="text-gray-500 text-base font-normal">Costco</span></p>
          {checkedTotal > 0 && (
            <p className="text-green-400 text-xs">${checkedTotal} added to cart</p>
          )}
        </div>
        <button onClick={resetList} className="btn-ghost text-sm">Reset List</button>
      </div>

      {/* Note */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4">
        <p className="text-blue-300 text-xs">{GROCERY_NOTE}</p>
      </div>

      {/* Grocery categories */}
      {Object.entries(weekItems).map(([cat, items]) => {
        if (items.length === 0) return null
        return (
          <div key={cat} className="mb-5">
            <h3 className="display-font text-base font-bold text-gray-400 uppercase tracking-wider mb-2">
              {CATEGORY_LABELS[cat]}
            </h3>
            <div className="card divide-y divide-gray-800 p-0 overflow-hidden">
              {items.map(item => {
                const checked = isChecked(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-colors ${checked ? 'bg-gray-900/50' : ''}`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      checked ? 'border-purple-500 bg-purple-500' : 'border-gray-600'
                    }`}>
                      {checked && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${checked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                        {item.name}
                      </p>
                      <p className="text-gray-500 text-xs">{item.detail}</p>
                    </div>
                    <span className="text-gray-400 text-sm font-semibold shrink-0">~${item.price}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Meals({ startDate }) {
  const [activeTab, setActiveTab] = useState('plan')

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-hide bg-gray-950">
      <div className="px-4 pt-14 pb-4">
        <h1 className="display-font text-3xl font-black text-white mb-4">MEALS</h1>

        {/* Tab switcher */}
        <div className="flex bg-gray-900 rounded-xl p-1 mb-4 border border-gray-800">
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'plan' ? 'bg-purple-600 text-white' : 'text-gray-400'
            }`}
          >
            Meal Plan
          </button>
          <button
            onClick={() => setActiveTab('grocery')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'grocery' ? 'bg-purple-600 text-white' : 'text-gray-400'
            }`}
          >
            Grocery List
          </button>
        </div>

        {activeTab === 'plan' ? (
          <MealPlanTab startDate={startDate} />
        ) : (
          <GroceryTab />
        )}
      </div>
    </div>
  )
}
