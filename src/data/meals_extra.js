import recipesJson from './high_protein_recipes_100.json'

// ─── Price estimator ──────────────────────────────────────────────────────────
const PRICE_MAP = [
  ['chicken breast', 2.50], ['chicken thigh', 1.80], ['shredded chicken', 2.00],
  ['ground turkey', 2.00], ['ground beef', 2.25], ['lean beef', 3.00],
  ['salmon', 3.50], ['shrimp', 2.50], ['cod', 2.50], ['tilapia', 2.00],
  ['beef', 3.00], ['pork tenderloin', 2.50], ['pork', 2.00],
  ['tuna', 1.25], ['turkey', 1.75], ['lentil', 0.40],
  ['eggs', 0.75], ['egg white', 0.90], ['greek yogurt', 0.80],
  ['cottage cheese', 0.70], ['cream cheese', 0.30],
  ['protein powder', 1.00], ['casein', 1.00], ['whey', 1.00],
  ['brown rice', 0.25], ['white rice', 0.25], ['rice', 0.25],
  ['oats', 0.20], ['quinoa', 0.40], ['couscous', 0.30],
  ['sweet potato', 0.80], ['potato', 0.40],
  ['broccoli', 0.40], ['spinach', 0.30], ['zucchini', 0.50],
  ['avocado', 0.75], ['bean', 0.30], ['corn', 0.20],
  ['banana', 0.25], ['berries', 0.50], ['pineapple', 0.40],
  ['peanut butter', 0.30], ['almond', 0.60], ['nuts', 0.50],
]

function priceIng(ing) {
  const s = ing.toLowerCase()
  for (const [k, p] of PRICE_MAP) if (s.includes(k)) return p
  return 0.20
}

function parseIng(ing) {
  const m = ing.match(/^([\d\/\.\s]+(?:x\s*)?(?:lbs?|oz|g|kg|tbsp?|tsps?|cups?|cans?|scoops?|large|medium|small)?\s*(?:\([^)]+\))?\s*)/i)
  const amt = m?.[0]?.trim() || ''
  const name = ing.slice(amt.length).split(',')[0].trim()
  return {
    name: (name[0]?.toUpperCase() || '') + name.slice(1, 38),
    amount: amt || 'to taste',
    price: priceIng(ing)
  }
}

function getCookTime(instructions) {
  const text = instructions.join(' ')
  const m = text.match(/(\d+)[-–](\d+)\s*min/i) || text.match(/bake\s+\S+\s+(\d+)\s*min/i) || text.match(/(\d+)\s*min/i)
  const mins = m ? parseInt(m[m.length - 1]) : 30
  if (mins >= 60) {
    const h = Math.floor(mins / 60)
    const rem = mins % 60
    return rem > 0 ? `${h}hr ${rem}min` : `${h}hr`
  }
  return `${mins} min`
}

// ─── MEAL_LIBRARY — all 100 recipes ──────────────────────────────────────────
export const MEAL_LIBRARY = recipesJson.recipes.map(r => {
  const cookTime = getCookTime(r.instructions)
  const ingredients_priced = r.ingredients.slice(0, 5).map(parseIng)
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    protein: r.macros_per_serving.protein_g,
    calories: r.macros_per_serving.calories,
    carbs: r.macros_per_serving.carbs_g,
    fat: r.macros_per_serving.fat_g,
    servings: r.servings,
    cookTime,
    storage: r.storage,
    ingredients: r.ingredients,
    ingredients_priced,
    instructions: r.instructions,
    batchPrep: {
      name: r.name,
      description: `Makes ${r.servings} servings. Cook once, eat all week.`,
      prepTime: `${cookTime} · 90 sec to reheat`,
      stores: r.storage,
      instructions: r.instructions
    },
    freshCook: {
      name: r.name + ' (Single Serve)',
      description: 'Scale down to 1 serving. Cook and eat immediately.',
      prepTime: cookTime,
      instructions: r.instructions.slice(0, Math.min(5, r.instructions.length))
    }
  }
})

// ─── MEALS_EXTRA — maps each week's 4 meal slots to closest JSON recipe ───────
// Keys match MEAL_PLAN weeks 1-8
const WEEK_MAP = {
  1: { breakfast: 92, lunch: 29, snack: 62, dinner: 28 },  // Oatmeal, Honey Garlic Chicken, Yogurt Parfait, Lemon Garlic Salmon
  2: { breakfast: 11, lunch: 55, snack: 62, dinner:  9 },  // Egg Frittata, Shawarma Bowl, Yogurt Parfait, Beef Stir Fry
  3: { breakfast:  3, lunch: 21, snack: 68, dinner: 31 },  // Protein Oats, Chicken Burrito Bowl, Cottage Cheese Bowl, Teriyaki Salmon
  4: { breakfast: 46, lunch:  7, snack: 62, dinner: 51 },  // Egg Muffins, Pineapple Ginger Chicken, Yogurt Parfait, Ground Beef Bowl
  5: { breakfast: 92, lunch: 34, snack: 62, dinner: 28 },  // Oatmeal, Thai Peanut Chicken, Yogurt Parfait, Lemon Garlic Salmon
  6: { breakfast: 82, lunch: 43, snack: 68, dinner:  9 },  // Egg Muffins Ham, BBQ/Buffalo Chicken Bowl, Cottage Cheese, Beef Stir Fry
  7: { breakfast: 92, lunch: 79, snack: 62, dinner: 37 },  // Oatmeal, Lemon Herb Chicken, Yogurt Parfait, Sesame Ginger Salmon
  8: { breakfast: 92, lunch: 25, snack: 62, dinner: 30 },  // Oatmeal, Korean Beef Bowl, Yogurt Parfait, Ground Turkey Chili
}

export const MEALS_EXTRA = Object.fromEntries(
  Object.entries(WEEK_MAP).map(([week, map]) => [
    Number(week),
    Object.fromEntries(
      Object.entries(map).map(([type, id]) => {
        const r = MEAL_LIBRARY.find(x => x.id === id)
        if (!r) return [type, null]
        return [type, {
          cookTime: r.cookTime,
          instructions: r.instructions,
          ingredients_priced: r.ingredients_priced,
          batchPrep: r.batchPrep,
          freshCook: r.freshCook
        }]
      })
    )
  ])
)
