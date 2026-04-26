import React, { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { MEAL_PLAN, MEAL_LABELS } from '../data/meals'
import { CATEGORY_LABELS, GROCERY_NOTE, getGroceryForWeek } from '../data/grocery'
import { MEAL_LIBRARY, MEALS_EXTRA } from '../data/meals_extra'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCurrentWeek(startDate) {
  if (!startDate) return 1
  const days = Math.floor((Date.now() - new Date(startDate)) / 86400000)
  return Math.min(8, Math.max(1, Math.floor(days / 7) + 1))
}

function getWeekStart(startDate, weekNum) {
  if (!startDate) return ''
  const start = new Date(startDate)
  const weekStart = new Date(start)
  weekStart.setDate(start.getDate() + (weekNum - 1) * 7)
  return weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getWeekDateRange(startDate, weekNum) {
  if (!startDate) return ''
  const start = new Date(startDate)
  const weekStart = new Date(start)
  weekStart.setDate(start.getDate() + (weekNum - 1) * 7)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(weekStart)} – ${fmt(weekEnd)}`
}

const LABEL_COLORS = {
  breakfast: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  lunch:     'bg-green-500/20 text-green-400 border-green-500/30',
  snack:     'bg-blue-500/20 text-blue-400 border-blue-500/30',
  dinner:    'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

// Filter MEAL_LIBRARY by meal type
function libraryForType(type) {
  return MEAL_LIBRARY.filter(r => {
    const cat = r.category.toLowerCase()
    if (type === 'breakfast') return cat.includes('breakfast')
    if (type === 'lunch')     return cat.includes('lunch')
    if (type === 'snack')     return cat.includes('snack')
    if (type === 'dinner')    return cat.includes('dinner')
    return false
  })
}

// Convert a MEAL_LIBRARY recipe into the shape MealCard expects for `meal`
function recipeToMeal(r) {
  return {
    name: r.name,
    protein: r.protein,
    flavor: r.instructions[0] || '',
    ingredients: r.ingredients.slice(0, 6).map(s =>
      s.replace(/^[\d\/\.\s]+(lbs?|oz|g|cups?|tbsp?|tsps?|cans?|x\s*\d+oz)?\s*/i, '')
       .split(',')[0].trim().slice(0, 30)
    ),
    substitute: `${r.servings} servings · ${r.storage}`
  }
}

// ─── Replace Meal Modal ───────────────────────────────────────────────────────
function ReplaceMealModal({ mealType, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const options = libraryForType(mealType).filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70" onClick={onClose}>
      <div
        className="bg-gray-950 rounded-t-2xl border-t border-gray-800 flex flex-col"
        style={{ maxHeight: '82vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-800 shrink-0">
          <div>
            <p className="display-font text-lg font-black text-white">REPLACE MEAL</p>
            <p className="text-gray-500 text-xs capitalize">{mealType} alternatives · {options.length} options</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 shrink-0">
          <input
            type="text"
            placeholder={`Search ${mealType} recipes…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 placeholder-gray-600"
          />
        </div>

        {/* Recipe list */}
        <div className="overflow-y-auto flex-1 px-4 pb-8">
          {options.map(r => {
            const totalPrice = r.ingredients_priced.reduce((s, i) => s + i.price, 0)
            return (
              <button
                key={r.id}
                onClick={() => { onSelect(r.id); onClose() }}
                className="w-full text-left bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 mb-2 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-tight mb-1">{r.name}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>⏱ {r.cookTime}</span>
                      <span>🔥 {r.calories} kcal</span>
                      <span>💪 {r.protein}g protein</span>
                      <span>~${totalPrice.toFixed(0)}/srv</span>
                    </div>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-600 shrink-0 mt-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            )
          })}
          {options.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-8">No {mealType} recipes match that search.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MealCard ─────────────────────────────────────────────────────────────────
function MealCard({ type, meal, extra, isReplaced, onReplace, onRestore }) {
  const [expanded, setExpanded] = useState(false)
  const [mode, setMode] = useState('fresh')

  const modeData = mode === 'batch' ? extra?.batchPrep : extra?.freshCook
  const totalPrice = (extra?.ingredients_priced || []).reduce((s, i) => s + i.price, 0)

  return (
    <div className={`card mb-3 ${isReplaced ? 'border-purple-500/30' : ''}`}>
      {/* Replaced badge */}
      {isReplaced && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs text-purple-400 font-semibold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
            ✦ Custom replacement
          </span>
        </div>
      )}

      {/* Tappable header */}
      <button className="w-full text-left" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-start justify-between mb-2">
          <span className={`pill border text-xs font-bold ${LABEL_COLORS[type]}`}>
            {MEAL_LABELS[type]}
          </span>
          <div className="flex items-center gap-2">
            {totalPrice > 0 && <span className="text-gray-500 text-xs">~${totalPrice.toFixed(0)}/srv</span>}
            <span className="pill bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
              ~{meal.protein}g protein
            </span>
          </div>
        </div>
        <h3 className="display-font text-xl font-black text-white mb-1">{meal.name}</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">{meal.flavor}</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {meal.ingredients.map((ing, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">{ing}</span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-purple-400 text-xs font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`w-3.5 h-3.5 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {expanded ? 'Hide details' : 'Cooking guide & ingredients'}
          {extra?.cookTime && <span className="text-gray-600 ml-1">· {extra.cookTime}</span>}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          {(meal.marinade || meal.sauce || meal.spices) && (
            <div className="bg-gray-800/50 rounded-xl p-3 mb-4 border border-gray-700/50">
              <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1">
                {meal.marinade ? '🌿 Marinade' : meal.sauce ? '🥣 Sauce' : '🌶️ Spice Mix'}
              </p>
              <p className="text-gray-300 text-xs leading-relaxed">{meal.marinade || meal.sauce || meal.spices}</p>
            </div>
          )}

          {extra?.ingredients_priced?.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Ingredients &amp; Cost</p>
              <div className="bg-gray-900/60 rounded-xl overflow-hidden border border-gray-800">
                {extra.ingredients_priced.map((ing, i) => (
                  <div key={i} className={`flex items-center justify-between px-3 py-2.5 ${i < extra.ingredients_priced.length - 1 ? 'border-b border-gray-800/60' : ''}`}>
                    <div>
                      <span className="text-gray-200 text-sm">{ing.name}</span>
                      {ing.amount && <span className="text-gray-500 text-xs ml-2">{ing.amount}</span>}
                    </div>
                    <span className="text-gray-400 text-sm shrink-0 ml-3">~${ing.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2.5 bg-gray-800/50 border-t border-gray-700">
                  <span className="text-gray-300 text-sm font-bold">Total / serving</span>
                  <span className="text-purple-400 text-sm font-bold">~${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {extra && (
            <>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Cooking Mode</p>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setMode('fresh')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'fresh' ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>
                  🍳 Fresh Cook
                </button>
                <button onClick={() => setMode('batch')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'batch' ? 'bg-green-700 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>
                  🥡 Batch Prep
                </button>
              </div>
              {modeData && (
                <div className={`rounded-xl p-4 border ${mode === 'batch' ? 'bg-green-500/5 border-green-500/20' : 'bg-purple-500/5 border-purple-500/20'}`}>
                  <p className="font-bold text-white text-sm mb-1">{modeData.name}</p>
                  <p className="text-gray-400 text-xs mb-2">{modeData.description}</p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className={`text-xs font-medium ${mode === 'batch' ? 'text-green-400' : 'text-purple-400'}`}>⏱ {modeData.prepTime}</span>
                    {modeData.stores && <span className="text-xs text-green-400">🗓 {modeData.stores}</span>}
                  </div>
                  <div className="space-y-2">
                    {(modeData.instructions || []).map((step, i) => (
                      <div key={i} className="flex gap-2.5">
                        <span className={`text-xs font-bold shrink-0 w-5 mt-0.5 ${mode === 'batch' ? 'text-green-400' : 'text-purple-400'}`}>{i + 1}.</span>
                        <p className="text-gray-300 text-xs leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {meal.substitute && !isReplaced && (
            <div className="mt-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <p className="text-gray-300 text-xs">🔄 <span className="font-semibold text-gray-200">Substitute:</span> {meal.substitute}</p>
            </div>
          )}
        </div>
      )}

      {/* Replace / Restore buttons — always visible */}
      <div className={`flex gap-2 mt-3 ${expanded ? '' : 'pt-3 border-t border-gray-800'}`}>
        <button
          onClick={onReplace}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700 hover:border-purple-500/50 transition-colors flex items-center justify-center gap-1.5"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Replace Meal
        </button>
        {isReplaced && (
          <button
            onClick={onRestore}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-900 text-gray-500 border border-gray-800 hover:text-gray-300 transition-colors"
          >
            ↩ Restore
          </button>
        )}
      </div>
    </div>
  )
}

// ─── MealPlanTab ──────────────────────────────────────────────────────────────
function MealPlanTab({ startDate }) {
  const currentWeek = getCurrentWeek(startDate)
  const [month, setMonth] = useState(currentWeek <= 4 ? 1 : 2)
  const [selectedWeek, setSelectedWeek] = useState(currentWeek)
  const [replacements, setReplacements] = useLocalStorage('fittrack_meal_replacements', {})
  const [replaceModal, setReplaceModal] = useState(null) // meal type string or null

  const rKey = type => `${selectedWeek}_${type}`

  const getReplacedRecipe = type => {
    const id = replacements[rKey(type)]
    return id ? MEAL_LIBRARY.find(r => r.id === id) : null
  }

  const handleSelect = (type, recipeId) => {
    setReplacements(prev => ({ ...prev, [rKey(type)]: recipeId }))
  }

  const handleRestore = type => {
    setReplacements(prev => { const n = { ...prev }; delete n[rKey(type)]; return n })
  }

  const weeksForMonth = month === 1 ? [1, 2, 3, 4] : [5, 6, 7, 8]
  const meals = MEAL_PLAN[selectedWeek]
  const extra = MEALS_EXTRA[selectedWeek] || {}

  return (
    <>
      <div className="flex gap-2 mb-4">
        {[1, 2].map(m => (
          <button key={m}
            onClick={() => { setMonth(m); setSelectedWeek(m === 1 ? 1 : 5) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${month === m ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>
            Month {m}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {weeksForMonth.map(w => (
          <button key={w} onClick={() => setSelectedWeek(w)}
            className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-sm font-semibold transition-all ${selectedWeek === w ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>
            <span className="flex items-center gap-1">
              Wk {w}
              {w === currentWeek && <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400" />}
            </span>
            <span className={`text-xs font-normal mt-0.5 ${selectedWeek === w ? 'text-purple-200' : 'text-gray-600'}`}>{getWeekStart(startDate, w)}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl px-4 py-3 mb-4 border border-purple-500/20"
        style={{ background: 'linear-gradient(135deg,rgba(83,74,183,0.15),rgba(107,99,201,0.1))' }}>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider">Week {selectedWeek}</p>
          {startDate && <p className="text-purple-400/60 text-xs">{getWeekDateRange(startDate, selectedWeek)}</p>}
          {selectedWeek === currentWeek && <span className="text-yellow-400 text-xs font-bold">● Now</span>}
        </div>
        <p className="text-white font-bold">{meals?.theme}</p>
        <p className="text-purple-300 text-xs mt-1">
          ~{Object.values(meals || {}).reduce((sum, m) => typeof m === 'object' && m.protein ? sum + m.protein : sum, 0)}g protein/day
        </p>
      </div>

      {meals && ['breakfast', 'lunch', 'snack', 'dinner'].map(type => {
        const replaced = getReplacedRecipe(type)
        const meal = replaced ? recipeToMeal(replaced) : meals[type]
        const extraData = replaced ? replaced : extra[type]
        return (
          <MealCard
            key={type}
            type={type}
            meal={meal}
            extra={extraData}
            isReplaced={!!replaced}
            onReplace={() => setReplaceModal(type)}
            onRestore={() => handleRestore(type)}
          />
        )
      })}

      {replaceModal && (
        <ReplaceMealModal
          mealType={replaceModal}
          onSelect={recipeId => handleSelect(replaceModal, recipeId)}
          onClose={() => setReplaceModal(null)}
        />
      )}
    </>
  )
}

// ─── LibraryCard ──────────────────────────────────────────────────────────────
function LibraryCard({ recipe }) {
  const [expanded, setExpanded] = useState(false)
  const [mode, setMode] = useState('batch')

  const modeData = mode === 'batch' ? recipe.batchPrep : recipe.freshCook
  const totalPrice = recipe.ingredients_priced.reduce((s, i) => s + i.price, 0)
  const catColor =
    recipe.category.includes('Breakfast') ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
    recipe.category.includes('Snack')     ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
    recipe.category.includes('Dinner')    ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                             'bg-green-500/20 text-green-400 border-green-500/30'

  return (
    <div className="card mb-3">
      <button className="w-full text-left" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-start justify-between mb-1.5">
          <span className={`pill border text-xs font-bold ${catColor}`}>{recipe.category}</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">~${totalPrice.toFixed(0)}/srv</span>
            <span className="pill bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">{recipe.protein}g protein</span>
          </div>
        </div>
        <h3 className="display-font text-lg font-black text-white mb-1">{recipe.name}</h3>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
          <span>⏱ {recipe.cookTime}</span>
          <span>🍽 {recipe.servings} servings</span>
          <span>🔥 {recipe.calories} kcal</span>
          <span>💪 {recipe.carbs}g C · {recipe.fat}g F</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-400 text-xs font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`w-3.5 h-3.5 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {expanded ? 'Hide recipe' : 'View full recipe'}
        </div>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="mb-4">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Ingredients &amp; Cost</p>
            <div className="bg-gray-900/60 rounded-xl overflow-hidden border border-gray-800">
              {recipe.ingredients_priced.map((ing, i) => (
                <div key={i} className={`flex items-center justify-between px-3 py-2.5 ${i < recipe.ingredients_priced.length - 1 ? 'border-b border-gray-800/60' : ''}`}>
                  <div>
                    <span className="text-gray-200 text-sm">{ing.name}</span>
                    {ing.amount && <span className="text-gray-500 text-xs ml-2">{ing.amount}</span>}
                  </div>
                  <span className="text-gray-400 text-sm shrink-0 ml-3">~${ing.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2.5 bg-gray-800/50 border-t border-gray-700">
                <span className="text-gray-300 text-sm font-bold">Est. total / serving</span>
                <span className="text-purple-400 text-sm font-bold">~${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setMode('fresh')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'fresh' ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>
              🍳 Fresh Cook
            </button>
            <button onClick={() => setMode('batch')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'batch' ? 'bg-green-700 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>
              🥡 Batch Prep
            </button>
          </div>
          {modeData && (
            <div className={`rounded-xl p-4 border ${mode === 'batch' ? 'bg-green-500/5 border-green-500/20' : 'bg-purple-500/5 border-purple-500/20'}`}>
              <p className="font-bold text-white text-sm mb-1">{modeData.name}</p>
              <p className="text-gray-400 text-xs mb-2">{modeData.description}</p>
              <div className="flex flex-wrap gap-3 mb-3">
                <span className={`text-xs font-medium ${mode === 'batch' ? 'text-green-400' : 'text-purple-400'}`}>⏱ {modeData.prepTime}</span>
                {modeData.stores && <span className="text-xs text-green-400">🗓 {modeData.stores}</span>}
              </div>
              <div className="space-y-2">
                {(modeData.instructions || []).map((step, i) => (
                  <div key={i} className="flex gap-2.5">
                    <span className={`text-xs font-bold shrink-0 w-5 mt-0.5 ${mode === 'batch' ? 'text-green-400' : 'text-purple-400'}`}>{i + 1}.</span>
                    <p className="text-gray-300 text-xs leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── LibraryTab ───────────────────────────────────────────────────────────────
const LIB_CATS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack']

function LibraryTab() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const visible = MEAL_LIBRARY.filter(r => {
    const matchCat = filter === 'All' || r.category.toLowerCase().includes(filter.toLowerCase())
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div>
      <input type="text" placeholder="Search recipes…" value={search} onChange={e => setSearch(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm mb-3 focus:outline-none focus:border-purple-500 placeholder-gray-600" />
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
        {LIB_CATS.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === cat ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>
            {cat}
          </button>
        ))}
      </div>
      <p className="text-gray-600 text-xs mb-3">{visible.length} recipes</p>
      {visible.map(r => <LibraryCard key={r.id} recipe={r} />)}
    </div>
  )
}

// ─── GroceryTab ───────────────────────────────────────────────────────────────
function GroceryTab() {
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [groceryChecked, setGroceryChecked] = useLocalStorage('fittrack_grocery_checked', {})

  const weekItems = getGroceryForWeek(selectedWeek)
  const toggleItem = id => {
    const key = `week_${selectedWeek}_${id}`
    setGroceryChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }
  const isChecked = id => !!groceryChecked[`week_${selectedWeek}_${id}`]
  const resetList = () => {
    const n = { ...groceryChecked }
    Object.keys(n).forEach(k => { if (k.startsWith(`week_${selectedWeek}_`)) delete n[k] })
    setGroceryChecked(n)
  }

  const total = Object.values(weekItems).flat().reduce((s, i) => s + i.price, 0)
  const checkedTotal = Object.values(weekItems).flat().filter(i => isChecked(i.id)).reduce((s, i) => s + i.price, 0)

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[1,2,3,4,5,6,7,8].map(w => (
          <button key={w} onClick={() => setSelectedWeek(w)}
            className={`py-2 rounded-xl text-sm font-semibold transition-all ${selectedWeek === w ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>
            Week {w}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-500 text-xs">Estimated Total</p>
          <p className="display-font text-2xl font-black text-white">${total} <span className="text-gray-500 text-base font-normal">Costco</span></p>
          {checkedTotal > 0 && <p className="text-green-400 text-xs">${checkedTotal} added to cart</p>}
        </div>
        <button onClick={resetList} className="btn-ghost text-sm">Reset List</button>
      </div>
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4">
        <p className="text-blue-300 text-xs">{GROCERY_NOTE}</p>
      </div>
      {Object.entries(weekItems).map(([cat, items]) => {
        if (!items.length) return null
        return (
          <div key={cat} className="mb-5">
            <h3 className="display-font text-base font-bold text-gray-400 uppercase tracking-wider mb-2">{CATEGORY_LABELS[cat]}</h3>
            <div className="card divide-y divide-gray-800 p-0 overflow-hidden">
              {items.map(item => {
                const checked = isChecked(item.id)
                return (
                  <button key={item.id} onClick={() => toggleItem(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-colors ${checked ? 'bg-gray-900/50' : ''}`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'border-purple-500 bg-purple-500' : 'border-gray-600'}`}>
                      {checked && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${checked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{item.name}</p>
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

// ─── Main export ──────────────────────────────────────────────────────────────
export default function Meals({ startDate }) {
  const [activeTab, setActiveTab] = useState('plan')

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-hide bg-gray-950">
      <div className="px-4 pt-14 pb-32">
        <h1 className="display-font text-3xl font-black text-white mb-4">MEALS</h1>
        <div className="flex bg-gray-900 rounded-xl p-1 mb-4 border border-gray-800">
          {[['plan', 'Meal Plan'], ['library', 'Library'], ['grocery', 'Grocery']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === id ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>
              {label}
            </button>
          ))}
        </div>
        {activeTab === 'plan'    && <MealPlanTab startDate={startDate} />}
        {activeTab === 'library' && <LibraryTab />}
        {activeTab === 'grocery' && <GroceryTab />}
      </div>
    </div>
  )
}
