export type PlanType = "A" | "B" | "Rest";
export type Difficulty = "easy" | "good" | "hard";

export type Exercise = {
  id: string;
  name: string;
  intro: string;
  targetMuscles: string;
  setup: string;
  steps: string[];
  cues: string[];
  mistakes: string[];
  easier: string;
  harder: string;
  demoSearchUrl: string;
  targetSets: number;
  targetReps?: number;
  targetTimeSec?: number;
};

export type ProgressionRule = {
  min: number;
  max: number;
  step: number;
  type: "reps" | "time";
};

export const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const defaultWeeklyPlan: Record<string, PlanType> = {
  Sun: "B",
  Mon: "A",
  Tue: "Rest",
  Wed: "B",
  Thu: "Rest",
  Fri: "A",
  Sat: "Rest",
};

export const planAIds = [
  "hip-thrust",
  "bulgarian-split-squat",
  "romanian-deadlift",
  "side-lying-hip-abduction",
  "reverse-crunch",
  "dead-bug",
];

export const planBIds = [
  "shoulder-press",
  "lateral-raise",
  "pike-pushup",
  "bent-over-row",
  "side-plank",
  "hollow-body-hold",
  "hip-thrust",
];

export const exercises: Exercise[] = [
  {
    id: "hip-thrust",
    name: "Hip Thrust / Glute Bridge",
    intro: "Drive through your heels and squeeze your glutes hard at the top.",
    targetMuscles: "Glute max, glute shape, hip extension strength.",
    setup: "Lie on the floor or place upper back on a sofa/bench. Feet flat, knees bent, heels close enough that shins are near vertical at the top.",
    steps: [
      "Brace your core and tuck ribs down.",
      "Push through heels to lift hips.",
      "Squeeze glutes hard at the top for 1 second.",
      "Lower under control without relaxing completely.",
    ],
    cues: ["Heels drive the floor.", "Ribs down.", "Chin slightly tucked.", "Glutes, not lower back."],
    mistakes: ["Overarching lower back.", "Feet too far away.", "Pushing through toes.", "Rushing the top squeeze."],
    easier: "Do floor glute bridges with body weight.",
    harder: "Add a dumbbell/backpack on hips or use single-leg hip thrusts.",
    demoSearchUrl: "https://www.youtube.com/results?search_query=hip+thrust+glute+bridge+proper+form",
    targetSets: 4,
    targetReps: 12,
  },
  {
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    intro: "Long stance, slight forward lean, push through the front heel. Do both sides.",
    targetMuscles: "Glutes, quads, single-leg strength, hip stability.",
    setup: "Stand in front of a chair/sofa with one foot behind you. Step the front foot far enough forward so your front heel stays planted.",
    steps: [
      "Lean slightly forward while keeping chest proud.",
      "Lower until the front thigh is near parallel.",
      "Drive through the front heel to stand.",
      "Finish all reps on one side, then switch.",
    ],
    cues: ["Long stance for more glute.", "Front knee tracks over toes.", "Slow lower.", "Push the floor away."],
    mistakes: ["Front heel lifting.", "Back leg doing too much.", "Knee collapsing inward.", "Bouncing at the bottom."],
    easier: "Hold a wall or chair for balance and reduce depth.",
    harder: "Hold dumbbells/backpack or slow the lowering phase to 3 seconds.",
    demoSearchUrl: "https://www.youtube.com/results?search_query=bulgarian+split+squat+glute+form",
    targetSets: 3,
    targetReps: 10,
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    intro: "Hinge from the hips with a flat back, then stand by squeezing the glutes.",
    targetMuscles: "Glutes, hamstrings, posterior chain.",
    setup: "Stand tall holding dumbbells, a backpack, or household weight. Feet hip-width, knees soft, weight close to legs.",
    steps: [
      "Push hips back like closing a door behind you.",
      "Lower until hamstrings stretch while back stays flat.",
      "Keep weights close to your legs.",
      "Stand by squeezing glutes forward.",
    ],
    cues: ["Hips back first.", "Long spine.", "Soft knees.", "Feel hamstrings stretch."],
    mistakes: ["Squatting instead of hinging.", "Rounding the back.", "Letting weight drift forward.", "Looking up too high."],
    easier: "Practice bodyweight hip hinges against a wall.",
    harder: "Use heavier load, single-leg RDLs, or slower tempo.",
    demoSearchUrl: "https://www.youtube.com/results?search_query=romanian+deadlift+proper+form+at+home",
    targetSets: 3,
    targetReps: 12,
  },
  {
    id: "side-lying-hip-abduction",
    name: "Side-Lying Hip Abduction",
    intro: "Keep pelvis stable, toes slightly down, lift from the side glute.",
    targetMuscles: "Glute medius, side glutes, knee stability.",
    setup: "Lie on your side with bottom knee bent for support. Top leg straight and slightly behind the body line.",
    steps: [
      "Turn top toes slightly toward the floor.",
      "Lift the top leg using the side glute.",
      "Pause briefly at the top.",
      "Lower slowly without rolling backward.",
    ],
    cues: ["Pelvis stacked.", "Toes slightly down.", "Small controlled range.", "Side glute does the work."],
    mistakes: ["Rolling hips backward.", "Pointing toes up.", "Swinging the leg.", "Using momentum."],
    easier: "Use a smaller range of motion.",
    harder: "Add an ankle weight or resistance band.",
    demoSearchUrl: "https://www.youtube.com/results?search_query=side+lying+hip+abduction+glute+medius+form",
    targetSets: 3,
    targetReps: 15,
  },
  {
    id: "shoulder-press",
    name: "Shoulder Press",
    intro: "Brace core, keep ribs down, press overhead without shrugging.",
    targetMuscles: "Front delts, side delts, triceps.",
    setup: "Sit or stand holding dumbbells/backpack at shoulder height. Brace abs and keep ribs stacked over pelvis.",
    steps: [
      "Start with elbows slightly forward of shoulders.",
      "Press upward until arms are almost straight.",
      "Lower slowly to shoulder height.",
      "Keep the body still through every rep.",
    ],
    cues: ["Ribs down.", "Press slightly back overhead.", "Neck relaxed.", "Control the lowering."],
    mistakes: ["Leaning back.", "Shrugging hard.", "Bouncing from the bottom.", "Using too much weight."],
    easier: "Use lighter weights or do one arm at a time.",
    harder: "Increase load or use a slow 3-second lowering phase.",
    demoSearchUrl: "https://www.youtube.com/results?search_query=dumbbell+shoulder+press+proper+form",
    targetSets: 3,
    targetReps: 10,
  },
  {
    id: "lateral-raise",
    name: "Lateral Raise",
    intro: "Use light weights, raise to shoulder height, control the motion.",
    targetMuscles: "Side delts for wider, rounder shoulders.",
    setup: "Stand tall with light dumbbells or bottles by your sides. Slight bend in elbows.",
    steps: [
      "Raise arms out to the side until shoulder height.",
      "Lead with elbows, not hands.",
      "Pause briefly at the top.",
      "Lower slowly and keep tension.",
    ],
    cues: ["Light weight.", "Elbows lead.", "Shoulders down.", "No swinging."],
    mistakes: ["Going too heavy.", "Shrugging traps.", "Swinging hips.", "Raising far above shoulder height."],
    easier: "Do one arm at a time or use no weight.",
    harder: "Add reps, slower tempo, or a top hold.",
    demoSearchUrl: "https://www.youtube.com/results?search_query=dumbbell+lateral+raise+proper+form",
    targetSets: 3,
    targetReps: 15,
  },
  {
    id: "pike-pushup",
    name: "Pike Push-up",
    intro: "Hips high, head moves toward the floor, press back up.",
    targetMuscles: "Shoulders, upper chest, triceps.",
    setup: "Start in a push-up position, then walk feet closer and lift hips high into an inverted V.",
    steps: [
      "Bend elbows and lower head toward the floor.",
      "Keep hips high as you descend.",
      "Press through hands to return to start.",
      "Move slowly and keep shoulders active.",
    ],
    cues: ["Hips high.", "Head goes forward/down.", "Elbows controlled.", "Press the floor away."],
    mistakes: ["Turning it into a regular push-up.", "Dropping hips.", "Flaring elbows wildly.", "Crashing into the bottom."],
    easier: "Place hands on a sofa or table to reduce load.",
    harder: "Elevate feet or increase range of motion.",
    demoSearchUrl: "https://www.youtube.com/results?search_query=pike+push+up+proper+form+shoulders",
    targetSets: 3,
    targetReps: 8,
  },
  {
    id: "bent-over-row",
    name: "Bent-over Row",
    intro: "Flat back, pull elbows back, squeeze shoulder blades.",
    targetMuscles: "Upper back, lats, rear delts, posture.",
    setup: "Hinge forward with a flat back, holding dumbbells/backpack. Knees soft and weight close to body.",
    steps: [
      "Brace core and keep spine long.",
      "Pull elbows back toward hips.",
      "Squeeze shoulder blades gently.",
      "Lower with control until arms are long.",
    ],
    cues: ["Chest proud.", "Elbows back.", "Neck neutral.", "Do not rush."],
    mistakes: ["Rounding back.", "Shrugging shoulders.", "Using momentum.", "Pulling only with arms."],
    easier: "Support one hand on a chair and row one arm at a time.",
    harder: "Increase load or pause at the top of each rep.",
    demoSearchUrl: "https://www.youtube.com/results?search_query=bent+over+row+proper+form+dumbbell",
    targetSets: 3,
    targetReps: 12,
  },
  {
    id: "reverse-crunch",
    name: "Reverse Crunch",
    intro: "Curl pelvis up slowly. Do not swing your legs.",
    targetMuscles: "Abs, lower-ab control, pelvic curl strength.",
    setup: "Lie on your back with knees bent and feet lifted. Arms on floor for support.",
    steps: [
      "Flatten lower back gently into the floor.",
      "Curl pelvis upward to lift hips slightly.",
      "Pause at the top without swinging.",
      "Lower slowly back to start.",
    ],
    cues: ["Curl, do not kick.", "Low back controlled.", "Small range is fine.", "Exhale as hips lift."],
    mistakes: ["Swinging legs.", "Using momentum.", "Arching lower back.", "Pulling neck forward."],
    easier: "Keep knees more bent and make the lift smaller.",
    harder: "Slow down or extend legs slightly farther away.",
    demoSearchUrl: "https://www.youtube.com/results?search_query=reverse+crunch+proper+form+lower+abs",
    targetSets: 3,
    targetReps: 12,
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    intro: "Low back gently into floor, move opposite arm and leg without arching.",
    targetMuscles: "Deep core, anti-extension control, lower-back protection.",
    setup: "Lie on your back with arms up and knees over hips. Press lower back gently into the floor.",
    steps: [
      "Brace abs and keep ribs down.",
      "Lower opposite arm and leg slowly.",
      "Stop before your back arches.",
      "Return and switch sides.",
    ],
    cues: ["Slow is the exercise.", "Low back stays down.", "Breathe out as limbs lower.", "Use control."],
    mistakes: ["Arching lower back.", "Moving too fast.", "Holding breath.", "Lowering too far."],
    easier: "Move only legs or shorten the range.",
    harder: "Straighten legs more or hold light weights.",
    demoSearchUrl: "https://www.youtube.com/results?search_query=dead+bug+exercise+proper+form",
    targetSets: 3,
    targetReps: 10,
  },
  {
    id: "side-plank",
    name: "Side Plank",
    intro: "Stack shoulders and hips, keep body long, do both sides.",
    targetMuscles: "Obliques, side core, glute medius.",
    setup: "Lie on your side with elbow under shoulder. Stack feet or stagger them for balance.",
    steps: [
      "Lift hips so body forms a straight line.",
      "Keep shoulder away from ear.",
      "Hold while breathing steadily.",
      "Repeat on the other side.",
    ],
    cues: ["Elbow under shoulder.", "Hips high.", "Body long.", "Do both sides."],
    mistakes: ["Hips sagging.", "Shoulder shrugging.", "Rotating chest down.", "Holding breath."],
    easier: "Do side plank from knees.",
    harder: "Stack feet, add top-leg lift, or increase time.",
    demoSearchUrl: "https://www.youtube.com/results?search_query=side+plank+proper+form",
    targetSets: 3,
    targetTimeSec: 30,
  },
  {
    id: "hollow-body-hold",
    name: "Hollow Body Hold",
    intro: "Low back into floor, ribs down, hold a banana-shaped body line.",
    targetMuscles: "Abs, deep core, pelvic control, tighter waistline.",
    setup: "Lie on your back. Press lower back into the floor and reach arms/legs away from the center.",
    steps: [
      "Tuck ribs down and brace abs.",
      "Lift shoulders and legs slightly.",
      "Hold the lowest position you can control.",
      "Stop if lower back leaves the floor.",
    ],
    cues: ["Low back glued down.", "Ribs down.", "Long body line.", "Quality over duration."],
    mistakes: ["Lower back arching.", "Neck straining.", "Holding too low too soon.", "Shaking through bad form."],
    easier: "Bend knees or keep arms by sides.",
    harder: "Straighten legs, reach arms overhead, or add time.",
    demoSearchUrl: "https://www.youtube.com/results?search_query=hollow+body+hold+proper+form",
    targetSets: 3,
    targetTimeSec: 20,
  },
];

export const progressionRules: Record<string, ProgressionRule> = {
  "hip-thrust": { min: 10, max: 15, step: 1, type: "reps" },
  "bulgarian-split-squat": { min: 8, max: 12, step: 1, type: "reps" },
  "romanian-deadlift": { min: 10, max: 15, step: 1, type: "reps" },
  "side-lying-hip-abduction": { min: 15, max: 25, step: 1, type: "reps" },
  "shoulder-press": { min: 8, max: 12, step: 1, type: "reps" },
  "lateral-raise": { min: 12, max: 20, step: 1, type: "reps" },
  "pike-pushup": { min: 6, max: 10, step: 1, type: "reps" },
  "bent-over-row": { min: 10, max: 15, step: 1, type: "reps" },
  "reverse-crunch": { min: 10, max: 15, step: 1, type: "reps" },
  "dead-bug": { min: 8, max: 12, step: 1, type: "reps" },
  "side-plank": { min: 30, max: 60, step: 5, type: "time" },
  "hollow-body-hold": { min: 20, max: 40, step: 5, type: "time" },
};

export function getExercisesForPlan(plan: PlanType) {
  const ids = plan === "A" ? planAIds : plan === "B" ? planBIds : [];
  return ids
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
}

export function getPlanLabel(plan: PlanType) {
  if (plan === "A") return "Plan A: Glutes + Abs";
  if (plan === "B") return "Plan B: Shoulders + Back + Abs";
  return "Rest day";
}

export const nutritionTips = [
  "Every meal should include protein to support glute and shoulder growth.",
  "Put more carbs around training: rice, oats, potato, bread, fruit, or noodles.",
  "Whey is optional. Use it when normal meals do not cover enough protein.",
  "Do not diet too hard. Very low calories make glutes and shoulders harder to grow.",
  "On rest days, keep protein steady and focus on water, vegetables, and sleep.",
];

export const proteinTargets = [
  {
    label: "Daily protein",
    value: "1.6-2.2 g/kg",
    note: "Use body weight x this range. Spread across 3-4 meals.",
  },
  {
    label: "Per meal",
    value: "25-40 g",
    note: "A practical target for muscle building and shape.",
  },
  {
    label: "Whey",
    value: "20-30 g",
    note: "Use 1 scoop when food protein is not enough.",
  },
  {
    label: "Calories",
    value: "Small surplus",
    note: "Enough to grow glutes and shoulders without aggressive fat gain.",
  },
];

export const nutritionRules = [
  "Training days: keep protein high and add carbs before or after workout.",
  "Rest days: keep protein the same, reduce snack carbs if weight rises too fast.",
  "If waist is rising quickly for 2-3 weeks, reduce portions slightly.",
  "If strength is not improving and weight is dropping, eat a little more.",
];

export const mealTemplates = [
  {
    title: "Breakfast",
    meals: [
      "Greek yogurt + oats + berries + whey",
      "Eggs + toast + fruit",
      "Protein smoothie with milk, banana, whey, and peanut butter",
    ],
  },
  {
    title: "Lunch / Dinner",
    meals: [
      "Chicken or tofu rice bowl with vegetables",
      "Salmon or tuna with potato and salad",
      "Lean beef, eggs, or tempeh with noodles and vegetables",
    ],
  },
  {
    title: "Snack",
    meals: [
      "Whey shake + banana",
      "Cottage cheese or Greek yogurt",
      "Protein bar only when real food is not convenient",
    ],
  },
];

export const recipes = [
  {
    title: "Glute Growth Rice Bowl",
    ingredients: "Rice, chicken thigh or tofu, avocado, spinach, egg, soy sauce.",
    note: "Good after lower-body days because it combines protein, carbs, and healthy fats.",
  },
  {
    title: "Shoulder Day Smoothie",
    ingredients: "Milk, whey, banana, oats, peanut butter.",
    note: "Fast option when appetite is low but you need calories and protein.",
  },
  {
    title: "Lean Rest-Day Plate",
    ingredients: "Salmon or tofu, vegetables, potato, olive oil.",
    note: "Keeps protein high while avoiding unnecessary snacking.",
  },
];
