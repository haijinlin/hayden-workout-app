import { useEffect, useMemo, useRef, useState } from "react";
import { exercises, type Exercise } from "./exercises";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTimer } from "./hooks/useTimer";
import {
  mealTemplates,
  nutritionPrinciples,
  recipes,
  shoppingGroups,
} from "./nutrition";
import "./App.css";

type Mode = "home" | "list" | "session" | "calendar" | "nutrition" | "progress";
type Lang = "en" | "zh";
type PlanType = "A" | "B" | "Rest";
type WeeklyPlan = Record<string, PlanType>;
type NutritionTab = "today" | "templates" | "recipes" | "shopping";
type Difficulty = "easy" | "good" | "hard";

type CompletionRecord = {
  plan: PlanType;
  completed: number;
  total: number;
};

type ExerciseLog = {
  id: string;
  date: string;
  plan: PlanType;
  exerciseId: string;
  exerciseName: string;
  weight: string;
  reps: string;
  difficulty: Difficulty;
};

type BodyEntry = {
  date: string;
  weight: string;
  waist: string;
  hips: string;
  shoulders: string;
  sleep: string;
  note: string;
};

type ExerciseDraft = {
  weight: string;
  reps: string;
  difficulty: Difficulty;
};

type ProgressionRule = {
  min: number;
  max: number;
  step: number;
  type: "reps" | "time";
};

type Advice = {
  en: string;
  zh: string;
};

const planAIds = [
  "hip-thrust",
  "bulgarian-split-squat",
  "romanian-deadlift",
  "side-lying-hip-abduction",
  "reverse-crunch",
  "dead-bug",
];

const planBIds = [
  "shoulder-press",
  "lateral-raise",
  "pike-pushup",
  "bent-over-row",
  "side-plank",
  "hip-thrust",
];

const defaultWeeklyPlan: WeeklyPlan = {
  Sun: "B",
  Mon: "A",
  Tue: "Rest",
  Wed: "B",
  Thu: "Rest",
  Fri: "A",
  Sat: "Rest",
};

const progressionRules: Record<string, ProgressionRule> = {
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
};

const copy = {
  homeTitle: { en: "Hayden Workout App", zh: "Hayden Workout App" },
  homeDesc: {
    en: "A shoulder, glute, core, nutrition, and progress tracker for shape and strength.",
    zh: "一个围绕肩膀、臀部、核心、饮食和进度追踪的塑形力量 App。",
  },
  startToday: { en: "Start today's plan", zh: "开始今日训练" },
  fullList: { en: "Full exercise library", zh: "完整动作库" },
  list: { en: "Exercises", zh: "动作列表" },
  calendar: { en: "Calendar", zh: "日历" },
  nutrition: { en: "Nutrition", zh: "饮食" },
  progress: { en: "Progress", zh: "进度" },
  language: { en: "Language", zh: "语言" },
  video: { en: "Video", zh: "视频教程" },
  start: { en: "Start", zh: "开始" },
  pause: { en: "Pause", zh: "暂停" },
  reset: { en: "Reset", zh: "重置" },
  completeSet: { en: "Complete set", zh: "完成一组" },
  timerDone: { en: "Time is up. Complete this set when ready.", zh: "时间到。准备好后可以完成本组。" },
  resetExercise: { en: "Reset exercise", zh: "重置当前动作" },
  prev: { en: "Previous", zh: "上一个" },
  next: { en: "Next", zh: "下一个" },
  sets: { en: "sets", zh: "组" },
  repsTip: { en: "per set", zh: "每组" },
  timer: { en: "sec per set", zh: "每组秒数" },
  suggested: { en: "Suggested", zh: "建议" },
  targets: { en: "Targets", zh: "锻炼部位" },
  doneToday: { en: "Today done", zh: "今日完成" },
  completed: { en: "Completed", zh: "已完成" },
  setsProgress: { en: "Sets done", zh: "已完成组数" },
  planNote: {
    en: "Recommended: A/B split, 3-4 sessions per week, with rest days between hard sessions.",
    zh: "建议用 A/B 拆分，每周 3-4 次，高强度训练之间安排休息日。",
  },
  workoutToday: { en: "Today's workout", zh: "今日训练" },
  noWorkout: { en: "No workout today", zh: "今天休息" },
  planA: { en: "Plan A: Glutes + Abs", zh: "A 计划：臀部 + 腹部" },
  planB: { en: "Plan B: Shoulders + Back + Abs", zh: "B 计划：肩膀 + 背部 + 腹部" },
  calendarPlan: { en: "Training Calendar", zh: "训练日历" },
  reminderTime: { en: "Reminder time", zh: "提醒时间" },
  enableReminder: { en: "Enable reminder", zh: "开启提醒" },
  disableReminder: { en: "Disable reminder", zh: "关闭提醒" },
  allowNotifications: { en: "Allow notifications", zh: "允许浏览器通知" },
  reminderNote: {
    en: "Notifications work while this app is open in a tab. Rest days do not send reminders.",
    zh: "提醒会在这个应用页面打开时生效。休息日不会发送提醒。",
  },
  weeklyTemplate: { en: "Weekly template", zh: "每周模板" },
  monthPrevious: { en: "Previous month", zh: "上个月" },
  monthNext: { en: "Next month", zh: "下个月" },
  thisWeek: { en: "This week", zh: "本周" },
  sessionsDone: { en: "sessions done", zh: "次训练完成" },
  partial: { en: "Partial", zh: "部分完成" },
  nutritionTitle: { en: "Nutrition Support", zh: "饮食支持" },
  nutritionDesc: {
    en: "Simple meals and recipes that support training and recovery.",
    zh: "围绕训练和恢复的饮食建议与菜谱。",
  },
  nutritionToday: { en: "Today", zh: "今日建议" },
  nutritionTemplates: { en: "Day templates", zh: "一日模板" },
  nutritionRecipes: { en: "Recipes", zh: "菜谱" },
  nutritionShopping: { en: "Shopping list", zh: "购物清单" },
  trainingDayFood: { en: "Training day food", zh: "训练日饮食" },
  restDayFood: { en: "Rest day food", zh: "休息日饮食" },
  ingredients: { en: "Ingredients", zh: "食材" },
  steps: { en: "Steps", zh: "做法" },
  swaps: { en: "Swaps", zh: "可替换" },
  timing: { en: "Best time", zh: "适合时间" },
  purpose: { en: "Purpose", zh: "作用" },
  proteinTarget: { en: "Protein target", zh: "蛋白质目标" },
  bodyWeight: { en: "Body weight", zh: "体重" },
  save: { en: "Save", zh: "保存" },
  bodyTracking: { en: "Body tracking", zh: "身体数据追踪" },
  recentBodyData: { en: "Recent body data", zh: "最近身体数据" },
  trainingLogs: { en: "Training logs", zh: "训练记录" },
  logWeight: { en: "Weight/load", zh: "重量/负重" },
  actualReps: { en: "Actual reps", zh: "实际次数" },
  difficulty: { en: "Difficulty", zh: "难度感受" },
  targetRange: { en: "Target range", zh: "目标区间" },
  currentTarget: { en: "Current target", zh: "当前目标" },
  nextSuggestion: { en: "Next suggestion", zh: "下次建议" },
  easy: { en: "Easy", zh: "轻松" },
  good: { en: "Good", zh: "刚好" },
  hard: { en: "Hard", zh: "太难" },
  waist: { en: "Waist", zh: "腰围" },
  hips: { en: "Hips", zh: "臀围" },
  shoulders: { en: "Shoulders", zh: "肩围" },
  sleep: { en: "Sleep", zh: "睡眠" },
  note: { en: "Note", zh: "备注" },
};

const daysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const daysZh = ["日", "一", "二", "三", "四", "五", "六"];

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getExercisesForPlan(plan: PlanType) {
  const ids = plan === "A" ? planAIds : plan === "B" ? planBIds : [];
  return ids
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
}

function getPlanLabel(plan: PlanType, lang: Lang) {
  if (plan === "A") return lang === "en" ? "Plan A" : "A 计划";
  if (plan === "B") return lang === "en" ? "Plan B" : "B 计划";
  return lang === "en" ? "Rest" : "休息";
}

function getWeekKeys(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return getDateKey(day);
  });
}

function App() {
  const [mode, setMode] = useState<Mode>("home");
  const [lang, setLang] = useLocalStorage<Lang>("lang", "en");
  const [weeklyPlan, setWeeklyPlan] = useLocalStorage<WeeklyPlan>(
    "weeklyPlan",
    defaultWeeklyPlan
  );
  const [activePlan, setActivePlan] = useState<PlanType>("A");
  const [idx, setIdx] = useState(0);
  const [completedIds, setCompletedIds] = useLocalStorage<string[]>(
    "completedToday",
    []
  );
  const [completionHistory, setCompletionHistory] = useLocalStorage<
    Record<string, CompletionRecord>
  >("completionHistory", {});
  const [setProgress, setSetProgress] = useLocalStorage<Record<string, number>>(
    "setProgressToday",
    {}
  );
  const [exerciseDrafts, setExerciseDrafts] = useLocalStorage<
    Record<string, ExerciseDraft>
  >("exerciseDrafts", {});
  const [personalTargets, setPersonalTargets] = useLocalStorage<Record<string, number>>(
    "personalTargets",
    {}
  );
  const [progressionAdvice, setProgressionAdvice] = useLocalStorage<Record<string, Advice>>(
    "progressionAdvice",
    {}
  );
  const [exerciseLogs, setExerciseLogs] = useLocalStorage<ExerciseLog[]>(
    "exerciseLogs",
    []
  );
  const [bodyEntries, setBodyEntries] = useLocalStorage<BodyEntry[]>(
    "bodyEntries",
    []
  );
  const [proteinWeight, setProteinWeight] = useLocalStorage<string>(
    "proteinWeight",
    ""
  );
  const [lastDoneDate, setLastDoneDate] = useLocalStorage<string>(
    "lastDoneDate",
    ""
  );

  const todayDate = useMemo(() => new Date(), []);
  const today = useMemo(() => todayDate.toDateString(), [todayDate]);
  const todayKey = useMemo(() => getDateKey(todayDate), [todayDate]);
  const todayPlan = weeklyPlan[daysEn[todayDate.getDay()]] ?? "Rest";
  const sessionExercises = getExercisesForPlan(activePlan);
  const current = sessionExercises[idx] ?? sessionExercises[0] ?? exercises[0];
  const progressionRule = progressionRules[current.id];
  const currentTargetValue =
    personalTargets[current.id] ??
    progressionRule?.min ??
    current.targetReps ??
    current.targetTimeSec ??
    0;
  const timerAlertedRef = useRef(false);
  const currentDraft = exerciseDrafts[current.id] ?? {
    weight: "",
    reps: currentTargetValue ? String(currentTargetValue) : "",
    difficulty: "good" as Difficulty,
  };
  const hasTime = progressionRule?.type === "time" || !!current.targetTimeSec;
  const currentTargetTime = hasTime ? currentTargetValue : current.targetTimeSec || 0;
  const { secondsLeft, running, start, pause, reset } = useTimer(currentTargetTime);

  useEffect(() => {
    if (lastDoneDate !== today) {
      setCompletedIds([]);
      setSetProgress({});
      setLastDoneDate(today);
    }
  }, [lastDoneDate, today, setCompletedIds, setSetProgress, setLastDoneDate]);

  useEffect(() => {
    reset(currentTargetTime);
    timerAlertedRef.current = false;
  }, [current.id, currentTargetTime, reset]);

  useEffect(() => {
    if (!hasTime || secondsLeft > 0) {
      timerAlertedRef.current = false;
      return;
    }

    if (running || timerAlertedRef.current || !currentTargetTime) return;

    timerAlertedRef.current = true;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      gain.gain.setValueAtTime(0.001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.35);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.38);
      window.setTimeout(() => void audioContext.close(), 500);
    } catch {
      // Sound cues are best-effort because browsers may block audio in some contexts.
    }

    if ("vibrate" in navigator) {
      navigator.vibrate([180, 80, 180]);
    }
  }, [currentTargetTime, hasTime, running, secondsLeft]);

  const tr = (key: keyof typeof copy) => copy[key][lang];
  const targetSets = current.targetSets ?? 1;
  const setsDone = setProgress[current.id] ?? 0;
  const todayPlanExercises = getExercisesForPlan(todayPlan);
  const todayDoneCount = todayPlanExercises.filter((exercise) =>
    completedIds.includes(exercise.id)
  ).length;
  useEffect(() => {
    if (todayPlan === "Rest") return;
    if (todayDoneCount === 0 && !completionHistory[todayKey]) return;

    const nextRecord = {
      plan: todayPlan,
      completed: todayDoneCount,
      total: todayPlanExercises.length,
    };
    const currentRecord = completionHistory[todayKey];

    if (
      !currentRecord ||
      currentRecord.completed !== nextRecord.completed ||
      currentRecord.total !== nextRecord.total ||
      currentRecord.plan !== nextRecord.plan
    ) {
      setCompletionHistory({ ...completionHistory, [todayKey]: nextRecord });
    }
  }, [
    completionHistory,
    setCompletionHistory,
    todayDoneCount,
    todayKey,
    todayPlan,
    todayPlanExercises.length,
  ]);

  const startWorkout = (plan: PlanType) => {
    if (plan === "Rest") return;
    setActivePlan(plan);
    setIdx(0);
    setMode("session");
  };

  const updateCurrentDraft = (patch: Partial<ExerciseDraft>) => {
    setExerciseDrafts({
      ...exerciseDrafts,
      [current.id]: { ...currentDraft, ...patch },
    });
  };

  const markComplete = () => {
    if (!completedIds.includes(current.id)) {
      setCompletedIds([...completedIds, current.id]);
    }
  };

  const saveExerciseLog = () => {
    const log: ExerciseLog = {
      id: `${Date.now()}-${current.id}`,
      date: todayKey,
      plan: activePlan,
      exerciseId: current.id,
      exerciseName: current.name[lang],
      weight: currentDraft.weight,
      reps: currentDraft.reps,
      difficulty: currentDraft.difficulty,
    };
    setExerciseLogs([log, ...exerciseLogs].slice(0, 80));
  };

  const updateProgressionAfterExercise = () => {
    if (!progressionRule) return;

    const unit = progressionRule.type === "time" ? "s" : "";
    const currentTarget = currentTargetValue;
    let nextTarget = currentTarget;
    let advice: Advice;

    if (currentDraft.difficulty === "easy") {
      if (currentTarget < progressionRule.max) {
        nextTarget = Math.min(progressionRule.max, currentTarget + progressionRule.step);
        advice = {
          en: `Next time: increase to ${nextTarget}${unit}.`,
          zh: `下次建议：提高到 ${nextTarget}${unit}。`,
        };
      } else {
        nextTarget = progressionRule.min;
        advice = {
          en:
            progressionRule.type === "time"
              ? `You reached ${progressionRule.max}s. Next time add difficulty, then restart at ${progressionRule.min}s.`
              : `You reached ${progressionRule.max} reps. Next time add a little weight, then restart at ${progressionRule.min} reps.`,
          zh:
            progressionRule.type === "time"
              ? `已经达到 ${progressionRule.max} 秒。下次增加难度，然后回到 ${progressionRule.min} 秒开始。`
              : `已经达到 ${progressionRule.max} 次。下次加一点重量，然后回到 ${progressionRule.min} 次开始。`,
        };
      }
    } else if (currentDraft.difficulty === "hard") {
      nextTarget = Math.max(progressionRule.min, currentTarget - progressionRule.step);
      advice = {
        en:
          nextTarget < currentTarget
            ? `Next time: reduce to ${nextTarget}${unit} and keep form clean.`
            : `Next time: keep ${currentTarget}${unit}, but improve form and rest longer.`,
        zh:
          nextTarget < currentTarget
            ? `下次建议：降到 ${nextTarget}${unit}，先保证动作标准。`
            : `下次建议：保持 ${currentTarget}${unit}，动作做标准，休息久一点。`,
      };
    } else {
      advice = {
        en: `Next time: keep ${currentTarget}${unit} and try to make it cleaner.`,
        zh: `下次建议：保持 ${currentTarget}${unit}，把动作做得更标准。`,
      };
    }

    setPersonalTargets({ ...personalTargets, [current.id]: nextTarget });
    setProgressionAdvice({ ...progressionAdvice, [current.id]: advice });
  };

  const handleSetComplete = () => {
    const nextSets = Math.min(targetSets, setsDone + 1);
    setSetProgress({ ...setProgress, [current.id]: nextSets });
    saveExerciseLog();
    if (hasTime) {
      pause();
      reset(current.targetTimeSec || 0);
    }
    if (nextSets >= targetSets) {
      updateProgressionAfterExercise();
      markComplete();
      if (idx < sessionExercises.length - 1) {
        setIdx((i) => i + 1);
      }
    }
  };

  const resetCurrentExercise = () => {
    pause();
    reset(currentTargetTime);
    setSetProgress({ ...setProgress, [current.id]: 0 });
    if (completedIds.includes(current.id)) {
      setCompletedIds(completedIds.filter((id) => id !== current.id));
    }
  };

  const next = () =>
    setIdx((i) => Math.min(sessionExercises.length - 1, i + 1));
  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const changeLang = () => setLang((l) => (l === "en" ? "zh" : "en"));

  return (
    <div className="app">
      <header className="nav">
        <div className="nav-left">
          <button
            className={`brand-button ${mode === "home" ? "active" : ""}`}
            onClick={() => setMode("home")}
          >
            <img src="/hayden-logo.png" alt="" />
            <span>{tr("homeTitle")}</span>
          </button>
          <button className={mode === "list" ? "active" : ""} onClick={() => setMode("list")}>
            {tr("list")}
          </button>
          <button
            className={mode === "calendar" ? "active" : ""}
            onClick={() => setMode("calendar")}
          >
            {tr("calendar")}
          </button>
          <button
            className={mode === "nutrition" ? "active" : ""}
            onClick={() => setMode("nutrition")}
          >
            {tr("nutrition")}
          </button>
          <button
            className={mode === "progress" ? "active" : ""}
            onClick={() => setMode("progress")}
          >
            {tr("progress")}
          </button>
        </div>
        <button className="lang" onClick={changeLang}>
          {tr("language")}: {lang === "en" ? "English" : "中文"}
        </button>
      </header>

      {mode === "home" && (
        <div className="home">
          <div className="home-brand">
            <img src="/hayden-logo.png" alt="" />
            <h1>{tr("homeTitle")}</h1>
          </div>
          <p>{tr("homeDesc")}</p>
          <p className="note">{tr("planNote")}</p>
          <div className="today-panel">
            <span>{tr("workoutToday")}</span>
            <strong>
              {todayPlan === "Rest" ? tr("noWorkout") : getPlanLabel(todayPlan, lang)}
            </strong>
            {todayPlan !== "Rest" && (
              <small>
                {todayDoneCount} / {todayPlanExercises.length} {tr("completed")}
              </small>
            )}
          </div>
          <div className="home-actions">
            <button
              onClick={() => startWorkout(todayPlan)}
              disabled={todayPlan === "Rest"}
            >
              {tr("startToday")}
            </button>
            <button onClick={() => setMode("calendar")}>{tr("calendar")}</button>
            <button onClick={() => setMode("progress")}>{tr("progress")}</button>
            <button onClick={() => setMode("nutrition")}>{tr("nutrition")}</button>
          </div>
        </div>
      )}

      {mode === "list" && <ExerciseLibrary lang={lang} tr={tr} />}

      {mode === "session" && (
        <div className="session">
          <div className="session-heading">
            <span>{getPlanLabel(activePlan, lang)}</span>
            <strong>
              {idx + 1} / {sessionExercises.length}
            </strong>
          </div>
          <h2>{current.name[lang]}</h2>
          <p>{current.intro[lang]}</p>
          <div className="target-box">
            <strong>{tr("targets")}</strong>
            <span>{current.targetMuscles[lang]}</span>
          </div>
          <a href={current.videoUrl} target="_blank" rel="noreferrer">
            {tr("video")}
          </a>

          <div className="meta-line">
            <span>
              {tr("sets")}: {setsDone} / {targetSets}
            </span>
            {progressionRule && (
              <span>
                {tr("targetRange")}: {progressionRule.min}
                {progressionRule.type === "time" ? "s" : ""} - {progressionRule.max}
                {progressionRule.type === "time" ? "s" : ""}
              </span>
            )}
            {!hasTime && (
              <span>
                {tr("currentTarget")}: {currentTargetValue} {tr("repsTip")}
              </span>
            )}
            {hasTime && (
              <span>
                {tr("currentTarget")}: {currentTargetValue}s
              </span>
            )}
          </div>

          {progressionAdvice[current.id] && (
            <div className="progression-advice">
              <strong>{tr("nextSuggestion")}</strong>
              <span>{progressionAdvice[current.id][lang]}</span>
            </div>
          )}

          <div className="log-panel">
            <label>
              <span>{tr("logWeight")}</span>
              <input
                value={currentDraft.weight}
                onChange={(event) => updateCurrentDraft({ weight: event.target.value })}
                placeholder="5kg / bodyweight"
              />
            </label>
            <label>
              <span>{tr("actualReps")}</span>
              <input
                value={currentDraft.reps}
                onChange={(event) => updateCurrentDraft({ reps: event.target.value })}
                placeholder={current.targetReps ? String(current.targetReps) : "30s"}
              />
            </label>
            <label>
              <span>{tr("difficulty")}</span>
              <select
                value={currentDraft.difficulty}
                onChange={(event) =>
                  updateCurrentDraft({ difficulty: event.target.value as Difficulty })
                }
              >
                <option value="easy">{tr("easy")}</option>
                <option value="good">{tr("good")}</option>
                <option value="hard">{tr("hard")}</option>
              </select>
            </label>
          </div>

          {hasTime ? (
            <div className="timer">
              <div className="time">{secondsLeft}s</div>
              {secondsLeft === 0 && !running && (
                <p className="timer-done">{tr("timerDone")}</p>
              )}
              <div className="controls">
                {!running ? (
                  <button onClick={start}>{tr("start")}</button>
                ) : (
                  <button onClick={pause}>{tr("pause")}</button>
                )}
                <button onClick={() => reset(currentTargetTime)}>
                  {tr("reset")}
                </button>
              </div>
              <button
                className="primary"
                onClick={handleSetComplete}
                disabled={running}
              >
                {tr("completeSet")}
              </button>
            </div>
          ) : (
            <div className="reps">
              <div className="count">
                {tr("setsProgress")}: {setsDone} / {targetSets}
              </div>
              <p className="hint">
                {tr("suggested")}: {currentTargetValue || "-"} {tr("repsTip")}
              </p>
              <button className="primary" onClick={handleSetComplete}>
                {tr("completeSet")}
              </button>
              <button className="ghost" onClick={resetCurrentExercise}>
                {tr("resetExercise")}
              </button>
            </div>
          )}

          <div className="nav2">
            <button onClick={prev} disabled={idx === 0}>
              {tr("prev")}
            </button>
            <button onClick={next} disabled={idx === sessionExercises.length - 1}>
              {tr("next")}
            </button>
          </div>
          <div className="progress">
            {tr("doneToday")} {todayDoneCount} / {todayPlanExercises.length}
          </div>
        </div>
      )}

      {mode === "calendar" && (
        <Calendar
          completedIds={completedIds}
          completionHistory={completionHistory}
          lang={lang}
          setWeeklyPlan={setWeeklyPlan}
          startWorkout={startWorkout}
          todayKey={todayKey}
          tr={tr}
          weeklyPlan={weeklyPlan}
        />
      )}

      {mode === "nutrition" && (
        <Nutrition
          bodyEntries={bodyEntries}
          lang={lang}
          proteinWeight={proteinWeight}
          setProteinWeight={setProteinWeight}
          tr={tr}
        />
      )}

      {mode === "progress" && (
        <ProgressPage
          bodyEntries={bodyEntries}
          exerciseLogs={exerciseLogs}
          lang={lang}
          proteinWeight={proteinWeight}
          setBodyEntries={setBodyEntries}
          setProteinWeight={setProteinWeight}
          todayKey={todayKey}
          tr={tr}
        />
      )}
    </div>
  );
}

function ExerciseLibrary({
  lang,
  tr,
}: {
  lang: Lang;
  tr: (key: keyof typeof copy) => string;
}) {
  return (
    <div className="grid">
      {exercises.map((ex) => (
        <div key={ex.id} className="card">
          <h3>{ex.name[lang]}</h3>
          <p>{ex.intro[lang]}</p>
          <div className="target-box">
            <strong>{tr("targets")}</strong>
            <span>{ex.targetMuscles[lang]}</span>
          </div>
          <a href={ex.videoUrl} target="_blank" rel="noreferrer">
            {tr("video")}
          </a>
          <div className="meta">
            {ex.targetSets && (
              <span>
                {ex.targetSets} {tr("sets")}
              </span>
            )}
            {progressionRules[ex.id] && (
              <span>
                {tr("targetRange")}: {progressionRules[ex.id].min}
                {progressionRules[ex.id].type === "time" ? "s" : ""} -{" "}
                {progressionRules[ex.id].max}
                {progressionRules[ex.id].type === "time" ? "s" : ""}
              </span>
            )}
            {!progressionRules[ex.id] && ex.targetReps && (
              <span>
                {tr("suggested")}: {ex.targetReps} {tr("repsTip")}
              </span>
            )}
            {!progressionRules[ex.id] && ex.targetTimeSec && (
              <span>
                {ex.targetTimeSec} {tr("timer")}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProteinTarget({
  bodyEntries,
  lang,
  proteinWeight,
  setProteinWeight,
  tr,
}: {
  bodyEntries: BodyEntry[];
  lang: Lang;
  proteinWeight: string;
  setProteinWeight: (value: string) => void;
  tr: (key: keyof typeof copy) => string;
}) {
  const latestWeight = bodyEntries.find((entry) => entry.weight)?.weight ?? "";
  const weight = Number(proteinWeight || latestWeight);
  const minProtein = Number.isFinite(weight) && weight > 0 ? Math.round(weight * 1.6) : 0;
  const maxProtein = Number.isFinite(weight) && weight > 0 ? Math.round(weight * 2.2) : 0;

  return (
    <section className="nutrition-card">
      <h3>{tr("proteinTarget")}</h3>
      <label>
        <span>{tr("bodyWeight")} (kg)</span>
        <input
          value={proteinWeight}
          onChange={(event) => setProteinWeight(event.target.value)}
          placeholder={latestWeight || "60"}
        />
      </label>
      {minProtein > 0 ? (
        <p>
          {lang === "en"
            ? `Daily target: about ${minProtein}-${maxProtein}g protein. Use whey only when meals do not cover this.`
            : `每日目标：大约 ${minProtein}-${maxProtein}g 蛋白质。正常饮食不够时再用 whey 补。`}
        </p>
      ) : (
        <p>
          {lang === "en"
            ? "Enter body weight to estimate a simple protein target."
            : "输入体重后，可以估算一个简单的每日蛋白质目标。"}
        </p>
      )}
    </section>
  );
}

function Nutrition({
  bodyEntries,
  lang,
  proteinWeight,
  setProteinWeight,
  tr,
}: {
  bodyEntries: BodyEntry[];
  lang: Lang;
  proteinWeight: string;
  setProteinWeight: (value: string) => void;
  tr: (key: keyof typeof copy) => string;
}) {
  const [tab, setTab] = useState<NutritionTab>("today");
  const tabButtons: Array<{ id: NutritionTab; label: string }> = [
    { id: "today", label: tr("nutritionToday") },
    { id: "templates", label: tr("nutritionTemplates") },
    { id: "recipes", label: tr("nutritionRecipes") },
    { id: "shopping", label: tr("nutritionShopping") },
  ];

  return (
    <div className="nutrition">
      <div className="nutrition-header">
        <h2>{tr("nutritionTitle")}</h2>
        <p>{tr("nutritionDesc")}</p>
      </div>

      <div className="tabs">
        {tabButtons.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? "active" : ""}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "today" && (
        <div className="nutrition-grid two">
          <ProteinTarget
            bodyEntries={bodyEntries}
            lang={lang}
            proteinWeight={proteinWeight}
            setProteinWeight={setProteinWeight}
            tr={tr}
          />
          <section className="nutrition-card">
            <h3>{tr("trainingDayFood")}</h3>
            <strong>{nutritionPrinciples.trainingDay.title[lang]}</strong>
            <ul>
              {nutritionPrinciples.trainingDay.points.map((point) => (
                <li key={point.en}>{point[lang]}</li>
              ))}
            </ul>
          </section>
          <section className="nutrition-card">
            <h3>{tr("restDayFood")}</h3>
            <strong>{nutritionPrinciples.restDay.title[lang]}</strong>
            <ul>
              {nutritionPrinciples.restDay.points.map((point) => (
                <li key={point.en}>{point[lang]}</li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === "templates" && (
        <div className="nutrition-grid">
          {mealTemplates.map((template) => (
            <section className="nutrition-card" key={template.id}>
              <h3>{template.title[lang]}</h3>
              <p>{template.purpose[lang]}</p>
              <div className="meal-list">
                {template.meals.map((meal) => (
                  <div key={meal.name.en}>
                    <strong>{meal.name[lang]}</strong>
                    <span>{meal.items[lang]}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === "recipes" && (
        <div className="nutrition-grid">
          {recipes.map((recipe) => (
            <section className="nutrition-card recipe-card" key={recipe.id}>
              <h3>{recipe.title[lang]}</h3>
              <div className="recipe-meta">
                <span>
                  <strong>{tr("timing")}:</strong> {recipe.timing[lang]}
                </span>
                <span>
                  <strong>{tr("purpose")}:</strong> {recipe.purpose[lang]}
                </span>
              </div>
              <div>
                <strong>{tr("ingredients")}</strong>
                <ul>
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.en}>{ingredient[lang]}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>{tr("steps")}</strong>
                <ol>
                  {recipe.steps.map((step) => (
                    <li key={step.en}>{step[lang]}</li>
                  ))}
                </ol>
              </div>
              <p className="swap">
                <strong>{tr("swaps")}:</strong> {recipe.swaps[lang]}
              </p>
            </section>
          ))}
        </div>
      )}

      {tab === "shopping" && (
        <div className="nutrition-grid shopping-grid">
          {shoppingGroups.map((group) => (
            <section className="nutrition-card" key={group.title.en}>
              <h3>{group.title[lang]}</h3>
              <ul className="shopping-list">
                {group.items.map((item) => (
                  <li key={item.en}>{item[lang]}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressPage({
  bodyEntries,
  exerciseLogs,
  lang,
  proteinWeight,
  setBodyEntries,
  setProteinWeight,
  todayKey,
  tr,
}: {
  bodyEntries: BodyEntry[];
  exerciseLogs: ExerciseLog[];
  lang: Lang;
  proteinWeight: string;
  setBodyEntries: (entries: BodyEntry[]) => void;
  setProteinWeight: (value: string) => void;
  todayKey: string;
  tr: (key: keyof typeof copy) => string;
}) {
  const [bodyDraft, setBodyDraft] = useState<BodyEntry>({
    date: todayKey,
    weight: "",
    waist: "",
    hips: "",
    shoulders: "",
    sleep: "",
    note: "",
  });

  const saveBodyEntry = () => {
    const nextEntries = [
      bodyDraft,
      ...bodyEntries.filter((entry) => entry.date !== bodyDraft.date),
    ].slice(0, 40);
    setBodyEntries(nextEntries);
    if (bodyDraft.weight) setProteinWeight(bodyDraft.weight);
  };

  return (
    <div className="progress-page">
      <section className="progress-card">
        <h2>{tr("progress")}</h2>
        <p className="hint">
          {lang === "en"
            ? "Track body shape, training load, and recovery. Weekly trends matter more than one day."
            : "记录身体围度、训练负重和恢复状态。看每周趋势，不要只看某一天。"}
        </p>
      </section>

      <div className="progress-grid">
        <ProteinTarget
          bodyEntries={bodyEntries}
          lang={lang}
          proteinWeight={proteinWeight}
          setProteinWeight={setProteinWeight}
          tr={tr}
        />

        <section className="progress-card">
          <h3>{tr("bodyTracking")}</h3>
          <div className="body-form">
            <label>
              <span>Date</span>
              <input
                type="date"
                value={bodyDraft.date}
                onChange={(event) =>
                  setBodyDraft({ ...bodyDraft, date: event.target.value })
                }
              />
            </label>
            <label>
              <span>{tr("bodyWeight")} kg</span>
              <input
                value={bodyDraft.weight}
                onChange={(event) =>
                  setBodyDraft({ ...bodyDraft, weight: event.target.value })
                }
              />
            </label>
            <label>
              <span>{tr("waist")} cm</span>
              <input
                value={bodyDraft.waist}
                onChange={(event) =>
                  setBodyDraft({ ...bodyDraft, waist: event.target.value })
                }
              />
            </label>
            <label>
              <span>{tr("hips")} cm</span>
              <input
                value={bodyDraft.hips}
                onChange={(event) =>
                  setBodyDraft({ ...bodyDraft, hips: event.target.value })
                }
              />
            </label>
            <label>
              <span>{tr("shoulders")} cm</span>
              <input
                value={bodyDraft.shoulders}
                onChange={(event) =>
                  setBodyDraft({ ...bodyDraft, shoulders: event.target.value })
                }
              />
            </label>
            <label>
              <span>{tr("sleep")}</span>
              <input
                value={bodyDraft.sleep}
                onChange={(event) =>
                  setBodyDraft({ ...bodyDraft, sleep: event.target.value })
                }
                placeholder="7h"
              />
            </label>
            <label className="wide">
              <span>{tr("note")}</span>
              <input
                value={bodyDraft.note}
                onChange={(event) =>
                  setBodyDraft({ ...bodyDraft, note: event.target.value })
                }
              />
            </label>
          </div>
          <button className="primary" onClick={saveBodyEntry}>
            {tr("save")}
          </button>
        </section>
      </div>

      <section className="progress-card">
        <h3>{tr("recentBodyData")}</h3>
        <div className="table-like">
          {bodyEntries.length === 0 && <p className="hint">No data yet.</p>}
          {bodyEntries.slice(0, 8).map((entry) => (
            <div key={entry.date}>
              <strong>{entry.date}</strong>
              <span>{tr("bodyWeight")}: {entry.weight || "-"}</span>
              <span>{tr("waist")}: {entry.waist || "-"}</span>
              <span>{tr("hips")}: {entry.hips || "-"}</span>
              <span>{tr("shoulders")}: {entry.shoulders || "-"}</span>
              <span>{tr("sleep")}: {entry.sleep || "-"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="progress-card">
        <h3>{tr("trainingLogs")}</h3>
        <div className="table-like">
          {exerciseLogs.length === 0 && <p className="hint">No logs yet.</p>}
          {exerciseLogs.slice(0, 12).map((log) => (
            <div key={log.id}>
              <strong>{log.date} · {getPlanLabel(log.plan, lang)}</strong>
              <span>{log.exerciseName}</span>
              <span>{tr("logWeight")}: {log.weight || "-"}</span>
              <span>{tr("actualReps")}: {log.reps || "-"}</span>
              <span>{tr("difficulty")}: {copy[log.difficulty][lang]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Calendar({
  completedIds,
  completionHistory,
  lang,
  setWeeklyPlan,
  startWorkout,
  todayKey,
  tr,
  weeklyPlan,
}: {
  completedIds: string[];
  completionHistory: Record<string, CompletionRecord>;
  lang: Lang;
  setWeeklyPlan: (plan: WeeklyPlan) => void;
  startWorkout: (plan: PlanType) => void;
  todayKey: string;
  tr: (key: keyof typeof copy) => string;
  weeklyPlan: WeeklyPlan;
}) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [reminderEnabled, setReminderEnabled] = useLocalStorage(
    "reminderEnabled",
    false
  );
  const [reminderTime, setReminderTime] = useLocalStorage(
    "reminderTime",
    "18:30"
  );
  const [lastReminderDate, setLastReminderDate] = useLocalStorage(
    "lastReminderDate",
    ""
  );
  const today = new Date();
  const todayPlan = weeklyPlan[daysEn[today.getDay()]] ?? "Rest";
  const todayExercises = getExercisesForPlan(todayPlan);
  const todayDoneCount = todayExercises.filter((exercise) =>
    completedIds.includes(exercise.id)
  ).length;
  const weekKeys = getWeekKeys(today);
  const weeklyDone = weekKeys.filter((key) => {
    const record = completionHistory[key];
    return record && record.total > 0 && record.completed >= record.total;
  }).length;
  const monthLabel = viewDate.toLocaleDateString(
    lang === "en" ? "en-US" : "zh-CN",
    { month: "long", year: "numeric" }
  );
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();
  const cells = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1)
    ),
  ];

  useEffect(() => {
    if (!reminderEnabled || todayPlan === "Rest" || lastReminderDate === todayKey) {
      return;
    }

    const checkReminder = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      if (currentTime !== reminderTime) return;

      const title =
        lang === "en"
          ? `${getPlanLabel(todayPlan, lang)} today`
          : `今天是${getPlanLabel(todayPlan, lang)}`;
      const body =
        lang === "en"
          ? "Open the workout app and complete today's session."
          : "打开训练应用，完成今天的训练。";

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
      } else {
        window.alert(`${title}\n${body}`);
      }
      setLastReminderDate(todayKey);
    };

    checkReminder();
    const intervalId = window.setInterval(checkReminder, 30000);
    return () => window.clearInterval(intervalId);
  }, [
    lang,
    lastReminderDate,
    reminderEnabled,
    reminderTime,
    setLastReminderDate,
    todayKey,
    todayPlan,
  ]);

  const requestNotifications = async () => {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
  };

  const updateDayPlan = (day: string, plan: PlanType) => {
    setWeeklyPlan({ ...weeklyPlan, [day]: plan });
  };

  const moveMonth = (offset: number) => {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1)
    );
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div>
          <h3>{tr("calendarPlan")}</h3>
          <p className="hint">{tr("reminderNote")}</p>
        </div>
        <div className="month-controls">
          <button onClick={() => moveMonth(-1)}>{tr("monthPrevious")}</button>
          <strong>{monthLabel}</strong>
          <button onClick={() => moveMonth(1)}>{tr("monthNext")}</button>
        </div>
      </div>

      <section className="calendar-stats">
        <div>
          <span>{tr("thisWeek")}</span>
          <strong>
            {weeklyDone} {tr("sessionsDone")}
          </strong>
        </div>
        <div>
          <span>{tr("workoutToday")}</span>
          <strong>
            {todayPlan === "Rest"
              ? getPlanLabel("Rest", lang)
              : `${todayDoneCount}/${todayExercises.length}`}
          </strong>
        </div>
      </section>

      <section className="reminder-panel">
        <label>
          <span>{tr("reminderTime")}</span>
          <input
            type="time"
            value={reminderTime}
            onChange={(event) => setReminderTime(event.target.value)}
          />
        </label>
        <button onClick={() => setReminderEnabled(!reminderEnabled)}>
          {reminderEnabled ? tr("disableReminder") : tr("enableReminder")}
        </button>
        <button className="ghost" onClick={requestNotifications}>
          {tr("allowNotifications")}
        </button>
      </section>

      <section className="weekly-template">
        <h4>{tr("weeklyTemplate")}</h4>
        <div className="template-grid">
          {daysEn.map((day, i) => (
            <label key={day}>
              <span>{lang === "en" ? day : daysZh[i]}</span>
              <select
                value={weeklyPlan[day]}
                onChange={(event) =>
                  updateDayPlan(day, event.target.value as PlanType)
                }
              >
                <option value="A">{getPlanLabel("A", lang)}</option>
                <option value="B">{getPlanLabel("B", lang)}</option>
                <option value="Rest">{getPlanLabel("Rest", lang)}</option>
              </select>
            </label>
          ))}
        </div>
      </section>

      <div className="month-grid weekdays">
        {(lang === "en" ? daysEn : daysZh).map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="month-grid">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="month-cell empty" />;

          const key = getDateKey(date);
          const plan = weeklyPlan[daysEn[date.getDay()]] ?? "Rest";
          const isToday = key === todayKey;
          const record = key === todayKey
            ? {
                plan: todayPlan,
                completed: todayDoneCount,
                total: todayExercises.length,
              }
            : completionHistory[key];
          const isComplete = Boolean(record && record.total > 0 && record.completed >= record.total);
          const isPartial = Boolean(record && record.completed > 0 && !isComplete);

          return (
            <button
              key={key}
              className={`month-cell ${plan.toLowerCase()} ${
                isToday ? "today" : ""
              } ${isComplete ? "complete" : ""} ${isPartial ? "partial" : ""}`}
              onClick={() => startWorkout(plan)}
              disabled={plan === "Rest"}
            >
              <span className="date-number">{date.getDate()}</span>
              <strong>{getPlanLabel(plan, lang)}</strong>
              {isComplete && <small>{tr("completed")}</small>}
              {isPartial && record && (
                <small>
                  {tr("partial")} {record.completed}/{record.total}
                </small>
              )}
            </button>
          );
        })}
      </div>

      <div className="plan-summary">
        <div>
          <strong>{tr("planA")}</strong>
          <span>{getExercisesForPlan("A").map((ex) => ex.name[lang]).join("、")}</span>
        </div>
        <div>
          <strong>{tr("planB")}</strong>
          <span>{getExercisesForPlan("B").map((ex) => ex.name[lang]).join("、")}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
