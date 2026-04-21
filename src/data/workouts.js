export const WORKOUT_SCHEDULE = {
  Monday: 'push',
  Tuesday: 'lowerA',
  Wednesday: 'rest',
  Thursday: 'pull',
  Friday: 'lowerB',
  Saturday: 'rest',
  Sunday: 'rest'
}

export const WORKOUTS = {
  push: {
    id: 'push',
    name: 'Upper Push',
    subtitle: 'Chest · Shoulders · Triceps',
    day: 'DAY 1',
    scienceNote: 'Compound pressing movements activate multiple muscle groups simultaneously, maximizing muscle protein synthesis per session.',
    warmup: [
      'Arm circles — 30 sec each direction',
      'Band pull-aparts (or towel) — 15 reps',
      'Light DB press — 15 reps'
    ],
    exercises: [
      {
        id: 'db_floor_press',
        name: 'DB Floor Press',
        sets: 4,
        reps: '8–10',
        rest: '90 sec',
        target: 'Chest (safer than bench, protects rotator cuff)'
      },
      {
        id: 'db_overhead_press',
        name: 'DB Overhead Press (standing)',
        sets: 3,
        reps: '10',
        rest: '90 sec',
        target: 'Anterior deltoid, triceps'
      },
      {
        id: 'db_incline_floor_press',
        name: 'DB Incline Floor Press (elevate feet)',
        sets: 3,
        reps: '10',
        rest: '60 sec',
        target: 'Upper chest'
      },
      {
        id: 'db_lateral_raises',
        name: 'DB Lateral Raises',
        sets: 3,
        reps: '15',
        rest: '60 sec',
        target: 'Lateral deltoid (shoulder width)'
      },
      {
        id: 'db_front_raises',
        name: 'DB Front Raises',
        sets: 2,
        reps: '12',
        rest: '60 sec',
        target: 'Anterior delt'
      },
      {
        id: 'tricep_kickbacks',
        name: 'Tricep Kickbacks',
        sets: 3,
        reps: '12',
        rest: '60 sec',
        target: 'Triceps long head'
      },
      {
        id: 'diamond_pushups',
        name: 'Diamond Push-ups',
        sets: 2,
        reps: 'Max',
        rest: '60 sec',
        target: 'Triceps + inner chest'
      }
    ],
    cooldown: ['Chest doorframe stretch', 'Cross-body shoulder stretch'],
    overloadRule: 'When you hit the top of the rep range for 2 consecutive sessions, increase weight by 2.5–5 lbs next session.'
  },
  lowerA: {
    id: 'lowerA',
    name: 'Lower A',
    subtitle: 'Quads · Glutes · Core',
    day: 'DAY 2',
    scienceNote: 'Lower body training releases the most testosterone and growth hormone of any workout type, which benefits your entire body\'s muscle building.',
    warmup: [
      'Bodyweight squats — 15 reps',
      'Hip circles — 10 each direction',
      'Glute bridges — 15 reps'
    ],
    exercises: [
      {
        id: 'goblet_squat',
        name: 'Goblet Squat (DB at chest)',
        sets: 4,
        reps: '10',
        rest: '90 sec',
        target: 'Quads, glutes'
      },
      {
        id: 'bulgarian_split_squat',
        name: 'Bulgarian Split Squat (back foot on chair)',
        sets: 3,
        reps: '8 each leg',
        rest: '90 sec',
        target: 'Single-leg quad + glute'
      },
      {
        id: 'db_step_up',
        name: 'DB Step-Up (use chair or step)',
        sets: 3,
        reps: '10 each leg',
        rest: '60 sec',
        target: 'Glutes, quads'
      },
      {
        id: 'db_sumo_squat',
        name: 'DB Sumo Squat',
        sets: 3,
        reps: '12',
        rest: '60 sec',
        target: 'Inner thigh + glutes'
      },
      {
        id: 'plank_hold',
        name: 'Plank Hold',
        sets: 3,
        reps: '40 seconds',
        rest: '45 sec',
        target: 'Core stability'
      },
      {
        id: 'dead_bug',
        name: 'Dead Bug',
        sets: 3,
        reps: '12',
        rest: '45 sec',
        target: 'Deep core, anti-rotation'
      },
      {
        id: 'bicycle_crunches',
        name: 'Bicycle Crunches',
        sets: 3,
        reps: '20',
        rest: '45 sec',
        target: 'Obliques'
      }
    ],
    cooldown: ['Hip flexor stretch', 'Quad stretch', 'Pigeon pose'],
    overloadRule: 'When you hit the top of the rep range for 2 consecutive sessions, increase weight by 2.5–5 lbs next session.'
  },
  pull: {
    id: 'pull',
    name: 'Upper Pull',
    subtitle: 'Back · Biceps · Rear Delts',
    day: 'DAY 4',
    scienceNote: 'Pulling movements correct the imbalances caused by modern desk posture. Strong back = better posture, fewer shoulder injuries, and a wider physique.',
    warmup: [
      'Band pull-aparts — 15 reps',
      'Cat-cow — 10 reps',
      'Shoulder rotations — 10 each'
    ],
    exercises: [
      {
        id: 'db_single_arm_row',
        name: 'DB Single-Arm Row',
        sets: 4,
        reps: '10 each arm',
        rest: '90 sec',
        target: 'Lats, mid-back'
      },
      {
        id: 'renegade_row',
        name: 'Renegade Row',
        sets: 3,
        reps: '8 each arm',
        rest: '90 sec',
        target: 'Back + core stability'
      },
      {
        id: 'curl_bar_bicep_curls',
        name: 'Curl Bar Bicep Curls',
        sets: 3,
        reps: '10',
        rest: '60 sec',
        target: 'Biceps (curl bar = more weight than dumbbells)'
      },
      {
        id: 'db_hammer_curls',
        name: 'DB Hammer Curls',
        sets: 3,
        reps: '12',
        rest: '60 sec',
        target: 'Brachialis + biceps'
      },
      {
        id: 'rear_delt_fly',
        name: 'Rear Delt Fly (bent over)',
        sets: 3,
        reps: '15',
        rest: '60 sec',
        target: 'Rear deltoid, rhomboids'
      },
      {
        id: 'db_pullover',
        name: 'DB Pullover (lying on mat)',
        sets: 3,
        reps: '12',
        rest: '60 sec',
        target: 'Lats, serratus'
      },
      {
        id: 'incline_db_row',
        name: 'Incline DB Row (face down on surface)',
        sets: 2,
        reps: '12',
        rest: '60 sec',
        target: 'Mid-back thickness'
      }
    ],
    cooldown: ['Lat stretch', 'Doorframe bicep stretch', 'Chest opener'],
    overloadRule: 'When you hit the top of the rep range for 2 consecutive sessions, increase weight by 2.5–5 lbs next session.'
  },
  lowerB: {
    id: 'lowerB',
    name: 'Lower B',
    subtitle: 'Hamstrings · Glutes · Core',
    day: 'DAY 5',
    scienceNote: 'Romanian deadlifts are the single best dumbbell exercise for hamstring development and are strongly associated with reduced injury risk.',
    warmup: [
      'Leg swings — 10 each direction',
      'Hip hinges — 10 reps',
      'Bodyweight RDL — 10 reps'
    ],
    exercises: [
      {
        id: 'romanian_deadlift',
        name: 'Romanian Deadlift (RDL)',
        sets: 4,
        reps: '10',
        rest: '90 sec',
        target: 'Hamstrings, glutes, lower back'
      },
      {
        id: 'kb_swings',
        name: 'KB Swings (kettlebell mode)',
        sets: 3,
        reps: '15',
        rest: '60 sec',
        target: 'Posterior chain + cardio'
      },
      {
        id: 'db_hip_thrust',
        name: 'DB Hip Thrust (shoulders on mat, DB on hips)',
        sets: 3,
        reps: '12',
        rest: '60 sec',
        target: 'Glutes'
      },
      {
        id: 'single_leg_rdl',
        name: 'Single-Leg RDL',
        sets: 2,
        reps: '8 each leg',
        rest: '60 sec',
        target: 'Hamstring balance'
      },
      {
        id: 'lying_db_leg_curl',
        name: 'Lying DB Leg Curl (DB between feet)',
        sets: 3,
        reps: '12',
        rest: '60 sec',
        target: 'Hamstrings isolation'
      },
      {
        id: 'russian_twist',
        name: 'Russian Twist (holding DB)',
        sets: 3,
        reps: '20',
        rest: '45 sec',
        target: 'Obliques, rotational core'
      },
      {
        id: 'leg_raise',
        name: 'Mat Leg Raise',
        sets: 3,
        reps: '15',
        rest: '45 sec',
        target: 'Lower abs'
      }
    ],
    cooldown: ['Hamstring stretch', 'Glute stretch', 'Child\'s pose'],
    overloadRule: 'When you hit the top of the rep range for 2 consecutive sessions, increase weight by 2.5–5 lbs next session.'
  }
}

export const DAY_ORDER = ['push', 'lowerA', 'rest', 'pull', 'lowerB']
export const WORKOUT_DAYS = ['Monday', 'Tuesday', 'Thursday', 'Friday']
