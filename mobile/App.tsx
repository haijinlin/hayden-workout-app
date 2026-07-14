import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Share,
  Vibration,
  View,
} from "react-native";
import {
  days,
  defaultWeeklyPlan,
  Difficulty,
  exercises,
  getExercisesForPlan,
  getPlanLabel,
  mealTemplates,
  nutritionTips,
  nutritionRules,
  PlanType,
  proteinTargets,
  progressionRules,
  recipes,
} from "./src/data";
import { useStoredState } from "./src/useStoredState";

type Tab = "home" | "workout" | "calendar" | "nutrition" | "progress";

type Draft = {
  weight: string;
  reps: string;
  difficulty: Difficulty;
};

type WorkoutLog = {
  id: string;
  date: string;
  plan: PlanType;
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
  note: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function monthTitle(date: Date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function planForDate(date: Date, weeklyPlan: Record<string, PlanType>) {
  const day = days[date.getDay()];
  return weeklyPlan[day] ?? "Rest";
}

function buildCalendarDays(monthDate: Date) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function isValidReminderTime(time: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  return Boolean(match);
}

function todayPlanFrom(weeklyPlan: Record<string, PlanType>) {
  return planForDate(new Date(), weeklyPlan);
}

async function scheduleWorkoutNotifications(
  time: string,
  weeklyPlan: Record<string, PlanType>
) {
  const [hour, minute] = time.split(":").map(Number);

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("workouts", {
      name: "Workout reminders",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return false;

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Promise.all(
    Object.entries(weeklyPlan)
      .filter(([, plan]) => plan !== "Rest")
      .map(([day, plan]) => {
        const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(day) + 1;
        return Notifications.scheduleNotificationAsync({
          content: {
            title: `${getPlanLabel(plan)} today`,
            body: "Open Hayden Workout App and complete today's session.",
            sound: true,
          },
          trigger: {
            weekday,
            hour,
            minute,
            repeats: true,
            channelId: "workouts",
          } as any,
        });
      })
  );

  return true;
}

function nextTargetAdvice(
  id: string,
  currentTarget: number,
  difficulty: Difficulty
) {
  const rule = progressionRules[id];
  if (!rule) return { target: currentTarget, text: "Keep the current target." };

  const unit = rule.type === "time" ? "s" : " reps";

  if (difficulty === "easy") {
    if (currentTarget < rule.max) {
      const target = Math.min(rule.max, currentTarget + rule.step);
      return { target, text: `Next time: increase to ${target}${unit}.` };
    }

    return {
      target: rule.min,
      text:
        rule.type === "time"
          ? `You reached ${rule.max}s. Add difficulty, then restart at ${rule.min}s.`
          : `You reached ${rule.max} reps. Add a little weight, then restart at ${rule.min} reps.`,
    };
  }

  if (difficulty === "hard") {
    const target = Math.max(rule.min, currentTarget - rule.step);
    return {
      target,
      text:
        target < currentTarget
          ? `Next time: reduce to ${target}${unit} and keep form clean.`
          : `Next time: keep ${currentTarget}${unit}, improve form and rest longer.`,
    };
  }

  return {
    target: currentTarget,
    text: `Next time: keep ${currentTarget}${unit} and make it cleaner.`,
  };
}

function targetText(id: string, sets: number) {
  const rule = progressionRules[id];
  if (!rule) return `${sets} sets`;

  const unit = rule.type === "time" ? "s" : " reps";
  return `${sets} sets x ${rule.min}-${rule.max}${unit}`;
}

function parseMetric(value: string) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function metricDelta(latest?: string, previous?: string) {
  const latestNumber = parseMetric(latest ?? "");
  const previousNumber = parseMetric(previous ?? "");
  if (latestNumber === null || previousNumber === null) return "-";

  const delta = latestNumber - previousNumber;
  if (delta === 0) return "0";
  return `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`;
}

export default function App() {
  const todayKey = dateKey();
  const [tab, setTab] = useState<Tab>("home");
  const [weeklyPlan, setWeeklyPlan] = useStoredState("weeklyPlan", defaultWeeklyPlan);
  const [reminderTime, setReminderTime] = useStoredState("reminderTime", "18:30");
  const [reminderEnabled, setReminderEnabled] = useStoredState("reminderEnabled", false);
  const [reminderStatus, setReminderStatus] = useState("");
  const [completedDate, setCompletedDate] = useStoredState("completedDate", todayKey);
  const [completedIds, setCompletedIds] = useStoredState<string[]>("completedIds", []);
  const [setProgress, setSetProgress] = useStoredState<Record<string, number>>("setProgress", {});
  const [personalTargets, setPersonalTargets] = useStoredState<Record<string, number>>(
    "personalTargets",
    {}
  );
  const [advice, setAdvice] = useStoredState<Record<string, string>>("advice", {});
  const [logs, setLogs] = useStoredState<WorkoutLog[]>("logs", []);
  const [bodyEntries, setBodyEntries] = useStoredState<BodyEntry[]>("bodyEntries", []);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [showBackupTools, setShowBackupTools] = useState(false);
  const [importText, setImportText] = useState("");
  const [backupStatus, setBackupStatus] = useState("");

  const todayPlan = todayPlanFrom(weeklyPlan);
  const selectedDateObject = useMemo(() => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [selectedDate]);
  const selectedPlan = planForDate(selectedDateObject, weeklyPlan);
  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);
  const sortedBodyEntries = useMemo(
    () => [...bodyEntries].sort((a, b) => b.date.localeCompare(a.date)),
    [bodyEntries]
  );
  const latestBody = sortedBodyEntries[0];
  const previousBody = sortedBodyEntries[1];
  const recentTrainingDays = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    const cutoffKey = dateKey(cutoff);
    return new Set(logs.filter((log) => log.date >= cutoffKey).map((log) => log.date)).size;
  }, [logs]);
  const topExercises = useMemo(() => {
    const counts = logs.reduce<Record<string, number>>((result, log) => {
      result[log.exerciseName] = (result[log.exerciseName] ?? 0) + 1;
      return result;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [logs]);
  const [activePlan, setActivePlan] = useState<PlanType>(todayPlan === "Rest" ? "A" : todayPlan);
  const session = useMemo(() => getExercisesForPlan(activePlan), [activePlan]);
  const todayExercises = useMemo(() => getExercisesForPlan(todayPlan), [todayPlan]);
  const [index, setIndex] = useState(0);
  const current = session[index] ?? session[0];
  const rule = current ? progressionRules[current.id] : undefined;
  const target =
    (current && personalTargets[current.id]) ||
    rule?.min ||
    current?.targetReps ||
    current?.targetTimeSec ||
    0;
  const hasTimer = rule?.type === "time" || Boolean(current?.targetTimeSec);
  const [secondsLeft, setSecondsLeft] = useState(target);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [draft, setDraft] = useState<Draft>({
    weight: "",
    reps: String(target || ""),
    difficulty: "good",
  });
  const [bodyDraft, setBodyDraft] = useState<BodyEntry>({
    date: todayKey,
    weight: "",
    waist: "",
    hips: "",
    shoulders: "",
    note: "",
  });

  useEffect(() => {
    if (completedDate !== todayKey) {
      setCompletedDate(todayKey);
      setCompletedIds([]);
      setSetProgress({});
    }
  }, [completedDate, setCompletedDate, setCompletedIds, setSetProgress, todayKey]);

  useEffect(() => {
    if (!hasTimer) return;
    setSecondsLeft(target);
    setRunning(false);
  }, [current?.id, hasTimer, target]);

  useEffect(() => {
    setDraft((value) => ({
      ...value,
      reps: String(target || ""),
      difficulty: "good",
    }));
    setShowExerciseDetails(false);
  }, [current?.id, target]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          setRunning(false);
          Vibration.vibrate([180, 80, 180]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const completedCount = todayExercises.filter((exercise) => completedIds.includes(exercise.id)).length;
  const todayLogs = useMemo(() => logs.filter((log) => log.date === todayKey), [logs, todayKey]);
  const todayEasySets = todayLogs.filter((log) => log.difficulty === "easy").length;
  const todayGoodSets = todayLogs.filter((log) => log.difficulty === "good").length;
  const todayHardSets = todayLogs.filter((log) => log.difficulty === "hard").length;

  const completeSet = () => {
    if (!current) return;

    const setsDone = (setProgress[current.id] ?? 0) + 1;
    const cappedSets = Math.min(current.targetSets, setsDone);

    setSetProgress({ ...setProgress, [current.id]: cappedSets });
    setLogs([
      {
        id: `${Date.now()}-${current.id}`,
        date: todayKey,
        plan: activePlan,
        exerciseName: current.name,
        weight: draft.weight,
        reps: draft.reps,
        difficulty: draft.difficulty,
      },
      ...logs,
    ].slice(0, 80));

    if (cappedSets >= current.targetSets) {
      const next = nextTargetAdvice(current.id, target, draft.difficulty);
      const nextCompletedIds = completedIds.includes(current.id)
        ? completedIds
        : [...completedIds, current.id];
      setPersonalTargets({ ...personalTargets, [current.id]: next.target });
      setAdvice({ ...advice, [current.id]: next.text });
      setCompletedIds(nextCompletedIds);
      if (
        activePlan === todayPlan &&
        todayExercises.length > 0 &&
        nextCompletedIds.filter((id) => todayExercises.some((exercise) => exercise.id === id)).length === todayExercises.length
      ) {
        setShowWorkoutSummary(true);
      }
      if (index < session.length - 1) setIndex(index + 1);
    }
  };

  const resetExercise = (exerciseId: string) => {
    const nextProgress = { ...setProgress };
    delete nextProgress[exerciseId];

    const nextAdvice = { ...advice };
    delete nextAdvice[exerciseId];

    setSetProgress(nextProgress);
    setAdvice(nextAdvice);
    setCompletedIds(completedIds.filter((id) => id !== exerciseId));
  };

  const resetTodayWorkout = () => {
    const todayExerciseIds = todayExercises.map((exercise) => exercise.id);
    const nextProgress = { ...setProgress };
    const nextAdvice = { ...advice };

    todayExerciseIds.forEach((id) => {
      delete nextProgress[id];
      delete nextAdvice[id];
    });

    setSetProgress(nextProgress);
    setAdvice(nextAdvice);
    setCompletedIds(completedIds.filter((id) => !todayExerciseIds.includes(id)));
    setIndex(0);
    setRunning(false);
    setShowWorkoutSummary(false);
  };

  const deleteLog = (id: string) => {
    setLogs(logs.filter((log) => log.id !== id));
  };

  const confirmDeleteLog = (log: WorkoutLog) => {
    Alert.alert(
      "Delete training log?",
      `${log.exerciseName}\n${log.date} / ${log.reps || "-"} / ${log.difficulty}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteLog(log.id) },
      ]
    );
  };

  const exportData = async () => {
    const payload = {
      app: "Hayden Workout App",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        weeklyPlan,
        reminderTime,
        reminderEnabled,
        completedDate,
        completedIds,
        setProgress,
        personalTargets,
        advice,
        logs,
        bodyEntries,
      },
    };

    const message = JSON.stringify(payload, null, 2);
    await Share.share({ title: "Hayden Workout App backup", message });
    setBackupStatus("Backup exported. Save the shared text somewhere safe.");
  };

  const importData = () => {
    try {
      const parsed = JSON.parse(importText);
      const data = parsed?.data ?? parsed;

      if (!data || typeof data !== "object") {
        setBackupStatus("Import failed: backup data is not valid.");
        return;
      }

      Alert.alert("Import backup?", "This will replace your current app data on this phone.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: () => {
            if (data.weeklyPlan) setWeeklyPlan(data.weeklyPlan);
            if (typeof data.reminderTime === "string") setReminderTime(data.reminderTime);
            if (typeof data.reminderEnabled === "boolean") setReminderEnabled(data.reminderEnabled);
            if (typeof data.completedDate === "string") setCompletedDate(data.completedDate);
            if (Array.isArray(data.completedIds)) setCompletedIds(data.completedIds);
            if (data.setProgress && typeof data.setProgress === "object") setSetProgress(data.setProgress);
            if (data.personalTargets && typeof data.personalTargets === "object") setPersonalTargets(data.personalTargets);
            if (data.advice && typeof data.advice === "object") setAdvice(data.advice);
            if (Array.isArray(data.logs)) setLogs(data.logs);
            if (Array.isArray(data.bodyEntries)) setBodyEntries(data.bodyEntries);
            setImportText("");
            setBackupStatus("Backup imported. Review reminders if you restored them.");
          },
        },
      ]);
    } catch {
      setBackupStatus("Import failed: paste a valid JSON backup.");
    }
  };

  const chooseWorkoutPlan = (plan: Exclude<PlanType, "Rest">) => {
    setActivePlan(plan);
    setIndex(0);
    setRunning(false);
  };

  const startToday = () => {
    if (todayPlan === "Rest") return;
    setActivePlan(todayPlan);
    setIndex(0);
    setTab("workout");
  };

  const changePlanDay = async (day: string, plan: PlanType) => {
    const nextPlan = { ...weeklyPlan, [day]: plan };
    setWeeklyPlan(nextPlan);
    setReminderStatus("Plan updated.");

    if (reminderEnabled) {
      if (!isValidReminderTime(reminderTime)) {
        setReminderStatus("Plan updated. Use reminder time format HH:MM.");
        return;
      }

      const ok = await scheduleWorkoutNotifications(reminderTime, nextPlan);
      setReminderEnabled(ok);
      setReminderStatus(ok ? "Plan updated and reminders rescheduled." : "Plan updated. Notification permission is off.");
    }
  };

  const resetPlan = async () => {
    setWeeklyPlan(defaultWeeklyPlan);
    setReminderStatus("Default plan restored.");

    if (reminderEnabled) {
      if (!isValidReminderTime(reminderTime)) {
        setReminderStatus("Default plan restored. Use reminder time format HH:MM.");
        return;
      }

      const ok = await scheduleWorkoutNotifications(reminderTime, defaultWeeklyPlan);
      setReminderEnabled(ok);
      setReminderStatus(ok ? "Default plan restored and reminders rescheduled." : "Default plan restored. Notification permission is off.");
    }
  };

  const enableReminders = async () => {
    if (!isValidReminderTime(reminderTime)) {
      setReminderStatus("Use reminder time format HH:MM, for example 18:30.");
      return;
    }

    setReminderStatus("Scheduling reminders...");
    const ok = await scheduleWorkoutNotifications(reminderTime, weeklyPlan);
    setReminderEnabled(ok);
    setReminderStatus(ok ? `Reminders scheduled at ${reminderTime}.` : "Notification permission was not granted.");
  };

  const disableReminders = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    setReminderEnabled(false);
    setReminderStatus("Reminders disabled.");
  };

  const saveBody = () => {
    setBodyEntries([bodyDraft, ...bodyEntries.filter((entry) => entry.date !== bodyDraft.date)].slice(0, 40));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.app}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Image source={require("./assets/hayden-logo.png")} style={styles.logo} />
            <View>
              <Text style={styles.title}>Hayden Workout</Text>
              <Text style={styles.subtitle}>Shape, strength, nutrition, progress</Text>
            </View>
          </View>

          {tab === "home" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Today</Text>
              {logs.length === 0 && bodyEntries.length === 0 ? (
                <View style={styles.onboardingPanel}>
                  <Text style={styles.onboardingTitle}>Start here</Text>
                  <Text style={styles.onboardingText}>1. Open today's plan and complete each set.</Text>
                  <Text style={styles.onboardingText}>2. Use easy/good/hard after every set so targets adjust over time.</Text>
                  <Text style={styles.onboardingText}>3. Add body measurements once a week in Progress.</Text>
                </View>
              ) : null}
              <View style={styles.heroPanel}>
                <Text style={styles.heroLabel}>{dateKey()}</Text>
                <Text style={styles.heroTitle}>{getPlanLabel(todayPlan)}</Text>
                {todayPlan !== "Rest" ? (
                  <Text style={styles.heroText}>
                    {completedCount}/{todayExercises.length} exercises completed
                  </Text>
                ) : (
                  <Text style={styles.heroText}>Recovery day. Walk, stretch, sleep, and eat protein.</Text>
                )}
                <Pressable
                  style={[styles.primaryButton, todayPlan === "Rest" && styles.disabled]}
                  onPress={startToday}
                  disabled={todayPlan === "Rest"}
                >
                  <Text style={styles.primaryText}>Start today's plan</Text>
                </Pressable>
              </View>

              <View style={styles.metricGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>This week</Text>
                  <Text style={styles.metricValue}>{recentTrainingDays}/4</Text>
                  <Text style={styles.metricDelta}>training days</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Reminder</Text>
                  <Text style={styles.metricValue}>{reminderEnabled ? reminderTime : "Off"}</Text>
                  <Text style={styles.metricDelta}>{todayPlan === "Rest" ? "No rest-day alert" : "Workout days only"}</Text>
                </View>
              </View>

              {todayPlan !== "Rest" ? (
                <>
                  <Text style={styles.sectionTitle}>Today's exercises</Text>
                  {todayExercises.map((exercise, exerciseIndex) => (
                    <Pressable
                      key={exercise.id}
                      style={styles.dashboardRow}
                      onPress={() => {
                        setActivePlan(todayPlan);
                        setIndex(exerciseIndex);
                        setTab("workout");
                      }}
                    >
                      <View style={[styles.statusDot, completedIds.includes(exercise.id) && styles.statusDotDone]} />
                      <View style={styles.dashboardRowText}>
                        <Text style={styles.body}>{exercise.name}</Text>
                        <Text style={styles.muted}>{targetText(exercise.id, exercise.targetSets)}</Text>
                      </View>
                    </Pressable>
                  ))}
                </>
              ) : null}

              <Text style={styles.sectionTitle}>Shape snapshot</Text>
              <View style={styles.selectedDayPanel}>
                <Text style={styles.body}>
                  Hips {latestBody?.hips || "-"} / Shoulders {latestBody?.shoulders || "-"} / Waist {latestBody?.waist || "-"}
                </Text>
                <Text style={styles.muted}>
                  Track these weekly. For your goal, hips and shoulders should slowly improve while waist stays controlled.
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Quick actions</Text>
              <View style={styles.row}>
                <Pressable style={styles.secondaryButton} onPress={() => setTab("calendar")}>
                  <Text style={styles.secondaryText}>Calendar</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => setTab("progress")}>
                  <Text style={styles.secondaryText}>Progress</Text>
                </Pressable>
              </View>
              <View style={styles.row}>
                <Pressable style={styles.secondaryButton} onPress={() => setTab("nutrition")}>
                  <Text style={styles.secondaryText}>Nutrition</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => setTab("workout")}>
                  <Text style={styles.secondaryText}>All workouts</Text>
                </Pressable>
              </View>

              {logs[0] ? (
                <>
                  <Text style={styles.sectionTitle}>Last logged</Text>
                  <View style={styles.listRow}>
                    <Text style={styles.body}>{logs[0].exerciseName}</Text>
                    <Text style={styles.muted}>{logs[0].date} / {logs[0].reps || "-"} / {logs[0].difficulty}</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Last logged</Text>
                  <View style={styles.emptyPanel}>
                    <Text style={styles.body}>No sets logged yet.</Text>
                    <Text style={styles.muted}>Complete your first set in Workout and it will appear here.</Text>
                  </View>
                </>
              )}
            </View>
          )}

          {tab === "workout" && current && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Workout</Text>
              <View style={styles.planSwitch}>
                {(["A", "B"] as const).map((plan) => (
                  <Pressable
                    key={plan}
                    onPress={() => chooseWorkoutPlan(plan)}
                    style={[styles.planButton, activePlan === plan && styles.planButtonActive]}
                  >
                    <Text style={[styles.planButtonText, activePlan === plan && styles.planButtonTextActive]}>
                      {plan}
                    </Text>
                    <Text style={[styles.planButtonSubtext, activePlan === plan && styles.planButtonTextActive]}>
                      {plan === "A" ? "Glutes + Abs" : "Shoulders + Abs"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.highlight}>{getPlanLabel(activePlan)}</Text>
              <Text style={styles.muted}>
                {session.length} exercises. Tap any exercise to preview or start from there.
              </Text>

              {showWorkoutSummary ? (
                <View style={styles.summaryPanel}>
                  <Text style={styles.summaryTitle}>Workout complete</Text>
                  <Text style={styles.summaryText}>
                    {todayExercises.length} exercises completed, {todayLogs.length} sets logged today.
                  </Text>
                  <Text style={styles.summaryText}>
                    Easy {todayEasySets} / Good {todayGoodSets} / Hard {todayHardSets}
                  </Text>
                  <Text style={styles.summaryText}>
                    If most sets were easy, increase slowly next time. If many were hard, keep the same targets and protect form.
                  </Text>
                  <Pressable style={styles.summaryButton} onPress={() => setShowWorkoutSummary(false)}>
                    <Text style={styles.summaryButtonText}>Close summary</Text>
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.exerciseList}>
                {session.map((exercise, exerciseIndex) => {
                  const done = completedIds.includes(exercise.id);
                  const selected = exerciseIndex === index;

                  return (
                    <Pressable
                      key={exercise.id}
                      onPress={() => {
                        setIndex(exerciseIndex);
                        setRunning(false);
                      }}
                      style={[
                        styles.exerciseCard,
                        selected && styles.exerciseCardActive,
                        done && styles.exerciseCardDone,
                      ]}
                    >
                      <View style={styles.exerciseCardHeader}>
                        <Text style={[styles.exerciseName, selected && styles.exerciseNameActive]}>
                          {exerciseIndex + 1}. {exercise.name}
                        </Text>
                        <Text style={[styles.exerciseBadge, done && styles.exerciseBadgeDone]}>
                          {done ? "Done" : targetText(exercise.id, exercise.targetSets)}
                        </Text>
                      </View>
                      <Text style={styles.exerciseMeta}>{exercise.targetMuscles}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sectionTitle}>Current exercise</Text>
              <Text style={styles.muted}>
                {index + 1}/{session.length}
              </Text>
              <Text style={styles.big}>{current.name}</Text>
              <Text style={styles.body}>{current.intro}</Text>
              <Text style={styles.highlight}>{current.targetMuscles}</Text>
              <Text style={styles.muted}>
                Sets: {setProgress[current.id] ?? 0}/{current.targetSets}
              </Text>
              <Text style={styles.muted}>
                Target range: {rule?.min}
                {rule?.type === "time" ? "s" : ""} - {rule?.max}
                {rule?.type === "time" ? "s" : ""}
              </Text>
              <Text style={styles.muted}>
                Current target: {target}
                {hasTimer ? "s" : " reps"}
              </Text>
              {advice[current.id] ? <Text style={styles.advice}>{advice[current.id]}</Text> : null}

              <View style={styles.row}>
                <Pressable
                  style={styles.demoButtonFlex}
                  onPress={() => Linking.openURL(current.demoSearchUrl)}
                >
                  <Text style={styles.demoButtonText}>Watch demo</Text>
                </Pressable>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => setShowExerciseDetails((value) => !value)}
                >
                  <Text style={styles.secondaryText}>
                    {showExerciseDetails ? "Hide details" : "Show details"}
                  </Text>
                </Pressable>
              </View>

              {showExerciseDetails ? (
                <View style={styles.instructionPanel}>
                  <Text style={styles.instructionTitle}>Setup</Text>
                  <Text style={styles.muted}>{current.setup}</Text>

                  <Text style={styles.instructionTitle}>How to do it</Text>
                  {current.steps.map((step, stepIndex) => (
                    <Text key={step} style={styles.muted}>
                      {stepIndex + 1}. {step}
                    </Text>
                  ))}

                  <Text style={styles.instructionTitle}>Form cues</Text>
                  {current.cues.map((cue) => (
                    <Text key={cue} style={styles.muted}>- {cue}</Text>
                  ))}

                  <Text style={styles.instructionTitle}>Common mistakes</Text>
                  {current.mistakes.map((mistake) => (
                    <Text key={mistake} style={styles.muted}>- {mistake}</Text>
                  ))}

                  <View style={styles.scaleRow}>
                    <View style={styles.scaleCard}>
                      <Text style={styles.metricLabel}>Easier</Text>
                      <Text style={styles.muted}>{current.easier}</Text>
                    </View>
                    <View style={styles.scaleCard}>
                      <Text style={styles.metricLabel}>Harder</Text>
                      <Text style={styles.muted}>{current.harder}</Text>
                    </View>
                  </View>
                </View>
              ) : null}

              <View style={styles.formRow}>
                <TextInput
                  value={draft.weight}
                  onChangeText={(weight) => setDraft({ ...draft, weight })}
                  placeholder="Weight/load"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />
                <TextInput
                  value={draft.reps}
                  onChangeText={(reps) => setDraft({ ...draft, reps })}
                  placeholder={hasTimer ? "Seconds" : "Reps"}
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />
              </View>
              <Text style={styles.helpText}>
                Weight/load means external load, not body weight. Use kg, dumbbell weight, backpack weight, or leave blank for bodyweight.
              </Text>

              <View style={styles.segment}>
                {(["easy", "good", "hard"] as Difficulty[]).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setDraft({ ...draft, difficulty: item })}
                    style={[styles.segmentButton, draft.difficulty === item && styles.segmentActive]}
                  >
                    <Text style={styles.segmentText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.helpText}>
                Easy = increase next time. Good = keep it. Hard = reduce or repeat until form is clean.
              </Text>

              {hasTimer ? (
                <View>
                  <Text style={styles.timer}>{secondsLeft}s</Text>
                  <View style={styles.row}>
                    <Pressable style={styles.secondaryButton} onPress={() => setRunning(!running)}>
                      <Text style={styles.secondaryText}>{running ? "Pause" : "Start timer"}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => {
                        setRunning(false);
                        setSecondsLeft(target);
                      }}
                    >
                      <Text style={styles.secondaryText}>Reset</Text>
                    </Pressable>
                  </View>
                  {secondsLeft === 0 ? <Text style={styles.advice}>Time is up. Complete this set when ready.</Text> : null}
                </View>
              ) : null}

              <Pressable style={styles.primaryButton} onPress={completeSet}>
                <Text style={styles.primaryText}>Complete set</Text>
              </Pressable>

              <View style={styles.row}>
                <Pressable
                  style={[
                    styles.warningButton,
                    (setProgress[current.id] ?? 0) === 0 && !completedIds.includes(current.id) && styles.disabled,
                  ]}
                  onPress={() => resetExercise(current.id)}
                  disabled={(setProgress[current.id] ?? 0) === 0 && !completedIds.includes(current.id)}
                >
                  <Text style={styles.warningText}>Reset exercise</Text>
                </Pressable>
                <Pressable
                  style={[styles.warningButton, completedCount === 0 && styles.disabled]}
                  onPress={resetTodayWorkout}
                  disabled={completedCount === 0}
                >
                  <Text style={styles.warningText}>Reset today</Text>
                </Pressable>
              </View>

              <View style={styles.row}>
                <Pressable
                  style={styles.secondaryButton}
                  disabled={index === 0}
                  onPress={() => setIndex(Math.max(0, index - 1))}
                >
                  <Text style={styles.secondaryText}>Previous</Text>
                </Pressable>
                <Pressable
                  style={styles.secondaryButton}
                  disabled={index === session.length - 1}
                  onPress={() => setIndex(Math.min(session.length - 1, index + 1))}
                >
                  <Text style={styles.secondaryText}>Next</Text>
                </Pressable>
              </View>
            </View>
          )}

          {tab === "calendar" && (
            <View style={styles.card}>
              <View style={styles.calendarHeader}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => setCalendarMonth((value) => addMonths(value, -1))}
                >
                  <Text style={styles.iconButtonText}>{"<"}</Text>
                </Pressable>
                <Text style={styles.sectionTitle}>{monthTitle(calendarMonth)}</Text>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => setCalendarMonth((value) => addMonths(value, 1))}
                >
                  <Text style={styles.iconButtonText}>{">"}</Text>
                </Pressable>
              </View>

              <View style={styles.calendarGrid}>
                {days.map((day) => (
                  <Text key={day} style={styles.weekdayLabel}>
                    {day}
                  </Text>
                ))}
                {calendarDays.map((day) => {
                  const key = dateKey(day);
                  const plan = planForDate(day, weeklyPlan);
                  const isSelected = key === selectedDate;
                  const isToday = key === todayKey;
                  const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();

                  return (
                    <Pressable
                      key={key}
                      onPress={() => setSelectedDate(key)}
                      style={[
                        styles.calendarDay,
                        !isCurrentMonth && styles.calendarDayMuted,
                        isToday && styles.calendarToday,
                        isSelected && styles.calendarSelected,
                      ]}
                    >
                      <Text style={[styles.calendarDate, isSelected && styles.calendarSelectedText]}>
                        {day.getDate()}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.calendarPlan,
                          plan === "Rest" && styles.calendarRest,
                          isSelected && styles.calendarSelectedText,
                        ]}
                      >
                        {plan}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.selectedDayPanel}>
                <Text style={styles.body}>{selectedDate}</Text>
                <Text style={styles.highlight}>{getPlanLabel(selectedPlan)}</Text>
                <Text style={styles.muted}>
                  {selectedPlan === "Rest"
                    ? "No reminder. Recovery, walking, stretching, sleep, and protein."
                    : `${getExercisesForPlan(selectedPlan).length} exercises. Reminder at ${reminderTime}.`}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Reminders</Text>
              <Text style={styles.muted}>Workout days use your weekly A/B/rest plan.</Text>
              <TextInput
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="18:30"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
              <View style={styles.row}>
                <Pressable style={styles.primaryButtonFlex} onPress={enableReminders}>
                  <Text style={styles.primaryText}>
                    {reminderEnabled ? "Update" : "Enable"}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.secondaryButton, !reminderEnabled && styles.disabled]}
                  onPress={disableReminders}
                  disabled={!reminderEnabled}
                >
                  <Text style={styles.secondaryText}>Disable</Text>
                </Pressable>
              </View>
              {reminderStatus ? <Text style={styles.advice}>{reminderStatus}</Text> : null}

              <Text style={styles.sectionTitle}>Weekly plan</Text>
              <Text style={styles.muted}>Tap a day to choose Plan A, Plan B, or Rest. Reminders are only scheduled for A/B days.</Text>
              {days.map((day) => (
                <View key={day} style={styles.planEditorRow}>
                  <View style={styles.planEditorDay}>
                    <Text style={styles.body}>{day}</Text>
                    <Text style={styles.muted}>{getPlanLabel(weeklyPlan[day])}</Text>
                  </View>
                  <View style={styles.planEditorChoices}>
                    {(["A", "B", "Rest"] as PlanType[]).map((plan) => (
                      <Pressable
                        key={plan}
                        onPress={() => changePlanDay(day, plan)}
                        style={[
                          styles.smallChoice,
                          weeklyPlan[day] === plan && styles.smallChoiceActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.smallChoiceText,
                            weeklyPlan[day] === plan && styles.smallChoiceTextActive,
                          ]}
                        >
                          {plan}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
              <Pressable style={styles.secondaryWideButton} onPress={resetPlan}>
                <Text style={styles.secondaryText}>Restore default weekly plan</Text>
              </Pressable>
            </View>
          )}

          {tab === "nutrition" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Nutrition</Text>
              <Text style={styles.muted}>
                Eat for muscle gain without letting waist size run away.
              </Text>

              <View style={styles.metricGrid}>
                {proteinTargets.map((target) => (
                  <View key={target.label} style={styles.metricCard}>
                    <Text style={styles.metricLabel}>{target.label}</Text>
                    <Text style={styles.metricValue}>{target.value}</Text>
                    <Text style={styles.metricDelta}>{target.note}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.selectedDayPanel}>
                <Text style={styles.body}>Whey guidance</Text>
                <Text style={styles.muted}>
                  Whey is a convenience tool, not magic. Use it after training or as a snack when normal meals do not reach your protein target.
                </Text>
                <Text style={styles.highlight}>
                  Practical dose: 1 scoop, usually 20-30g protein.
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Training vs Rest Days</Text>
              {nutritionRules.map((rule) => (
                <Text key={rule} style={styles.listItem}>- {rule}</Text>
              ))}

              <Text style={styles.sectionTitle}>Meal templates</Text>
              {mealTemplates.map((section) => (
                <View key={section.title} style={styles.recipeCard}>
                  <Text style={styles.body}>{section.title}</Text>
                  {section.meals.map((meal) => (
                    <Text key={meal} style={styles.muted}>- {meal}</Text>
                  ))}
                </View>
              ))}

              <Text style={styles.sectionTitle}>Simple recipes</Text>
              {recipes.map((recipe) => (
                <View key={recipe.title} style={styles.recipeCard}>
                  <Text style={styles.body}>{recipe.title}</Text>
                  <Text style={styles.highlight}>{recipe.ingredients}</Text>
                  <Text style={styles.muted}>{recipe.note}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Basics</Text>
              {nutritionTips.map((tip) => (
                <Text key={tip} style={styles.listItem}>- {tip}</Text>
              ))}
            </View>
          )}

          {tab === "progress" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Progress</Text>
              <Text style={styles.muted}>Track shape weekly: weight, waist, hips, shoulders.</Text>

              <View style={styles.metricGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Weight</Text>
                  <Text style={styles.metricValue}>{latestBody?.weight || "-"}</Text>
                  <Text style={styles.metricDelta}>Change {metricDelta(latestBody?.weight, previousBody?.weight)}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Waist</Text>
                  <Text style={styles.metricValue}>{latestBody?.waist || "-"}</Text>
                  <Text style={styles.metricDelta}>Change {metricDelta(latestBody?.waist, previousBody?.waist)}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Hips</Text>
                  <Text style={styles.metricValue}>{latestBody?.hips || "-"}</Text>
                  <Text style={styles.metricDelta}>Change {metricDelta(latestBody?.hips, previousBody?.hips)}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Shoulders</Text>
                  <Text style={styles.metricValue}>{latestBody?.shoulders || "-"}</Text>
                  <Text style={styles.metricDelta}>Change {metricDelta(latestBody?.shoulders, previousBody?.shoulders)}</Text>
                </View>
              </View>

              <View style={styles.selectedDayPanel}>
                <Text style={styles.body}>Last 7 days: {recentTrainingDays} training days</Text>
                <Text style={styles.muted}>
                  For your goal, a good rhythm is 3-4 hard training days per week with rest days kept intentional.
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Data backup</Text>
              <View style={styles.selectedDayPanel}>
                <Text style={styles.body}>Export or import your local workout data.</Text>
                <Text style={styles.muted}>
                  Use this before changing phones, reinstalling the app, or testing a new build.
                </Text>
                <Pressable
                  style={styles.secondaryWideButton}
                  onPress={() => setShowBackupTools((value) => !value)}
                >
                  <Text style={styles.secondaryText}>
                    {showBackupTools ? "Hide backup tools" : "Show backup tools"}
                  </Text>
                </Pressable>
                {showBackupTools ? (
                  <>
                    <Pressable style={styles.primaryButton} onPress={exportData}>
                      <Text style={styles.primaryText}>Export data</Text>
                    </Pressable>
                    <TextInput
                      multiline
                      value={importText}
                      onChangeText={setImportText}
                      placeholder="Paste backup JSON here"
                      placeholderTextColor="#94a3b8"
                      style={[styles.input, styles.importInput]}
                    />
                    <Pressable
                      style={[styles.secondaryWideButton, !importText.trim() && styles.disabled]}
                      onPress={importData}
                      disabled={!importText.trim()}
                    >
                      <Text style={styles.secondaryText}>Import pasted backup</Text>
                    </Pressable>
                  </>
                ) : null}
                {backupStatus ? <Text style={styles.advice}>{backupStatus}</Text> : null}
              </View>

              <Text style={styles.sectionTitle}>Body check-in</Text>
              <View style={styles.formRow}>
                <TextInput keyboardType="decimal-pad" style={styles.input} value={bodyDraft.weight} onChangeText={(weight) => setBodyDraft({ ...bodyDraft, weight })} placeholder="Weight kg" placeholderTextColor="#94a3b8" />
                <TextInput keyboardType="decimal-pad" style={styles.input} value={bodyDraft.waist} onChangeText={(waist) => setBodyDraft({ ...bodyDraft, waist })} placeholder="Waist cm" placeholderTextColor="#94a3b8" />
              </View>
              <View style={styles.formRow}>
                <TextInput keyboardType="decimal-pad" style={styles.input} value={bodyDraft.hips} onChangeText={(hips) => setBodyDraft({ ...bodyDraft, hips })} placeholder="Hips cm" placeholderTextColor="#94a3b8" />
                <TextInput keyboardType="decimal-pad" style={styles.input} value={bodyDraft.shoulders} onChangeText={(shoulders) => setBodyDraft({ ...bodyDraft, shoulders })} placeholder="Shoulders cm" placeholderTextColor="#94a3b8" />
              </View>
              <TextInput style={styles.input} value={bodyDraft.note} onChangeText={(note) => setBodyDraft({ ...bodyDraft, note })} placeholder="Note" placeholderTextColor="#94a3b8" />
              <Pressable style={styles.primaryButton} onPress={saveBody}>
                <Text style={styles.primaryText}>Save body entry</Text>
              </Pressable>

              <Text style={styles.sectionTitle}>Body history</Text>
              {sortedBodyEntries.length === 0 ? (
                <View style={styles.emptyPanel}>
                  <Text style={styles.body}>No body entries yet.</Text>
                  <Text style={styles.muted}>Add your first weekly check-in above: weight, waist, hips, and shoulders.</Text>
                </View>
              ) : null}
              {sortedBodyEntries.slice(0, 6).map((entry) => (
                <View key={entry.date} style={styles.listRow}>
                  <Text style={styles.body}>{entry.date}</Text>
                  <Text style={styles.muted}>
                    W {entry.weight || "-"} / Waist {entry.waist || "-"} / Hips {entry.hips || "-"} / Shoulders {entry.shoulders || "-"}
                  </Text>
                  {entry.note ? <Text style={styles.muted}>{entry.note}</Text> : null}
                </View>
              ))}

              <Text style={styles.sectionTitle}>Most trained</Text>
              {topExercises.length === 0 ? (
                <View style={styles.emptyPanel}>
                  <Text style={styles.body}>No exercise stats yet.</Text>
                  <Text style={styles.muted}>Complete sets in Workout to see which exercises you train most.</Text>
                </View>
              ) : null}
              {topExercises.map(([name, count]) => (
                <View key={name} style={styles.listRow}>
                  <Text style={styles.body}>{name}</Text>
                  <Text style={styles.highlight}>{count} sets logged</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Recent training logs</Text>
              {logs.length === 0 ? (
                <View style={styles.emptyPanel}>
                  <Text style={styles.body}>No training logs yet.</Text>
                  <Text style={styles.muted}>When you tap Complete set in Workout, your logs will show here.</Text>
                </View>
              ) : null}
              {logs.slice(0, 6).map((log) => (
                <View key={log.id} style={styles.logRow}>
                  <View style={styles.logText}>
                    <Text style={styles.body}>{log.exerciseName}</Text>
                    <Text style={styles.muted}>{log.date} / {log.weight || "-"} / {log.reps || "-"} / {log.difficulty}</Text>
                  </View>
                  <Pressable style={styles.deleteButton} onPress={() => confirmDeleteLog(log)}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.tabs}>
          {(["home", "workout", "calendar", "nutrition", "progress"] as Tab[]).map((item) => (
            <Pressable
              key={item}
              style={[styles.tabButton, tab === item && styles.tabActive]}
              onPress={() => setTab(item)}
            >
              <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>
                {item[0].toUpperCase() + item.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0b1223",
  },
  app: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 14,
  },
  title: {
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94a3b8",
  },
  card: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  sectionTitle: {
    color: "#e2e8f0",
    fontSize: 18,
    fontWeight: "800",
  },
  big: {
    color: "#a7f3d0",
    fontSize: 22,
    fontWeight: "800",
  },
  body: {
    color: "#cbd5e1",
    lineHeight: 20,
  },
  muted: {
    color: "#94a3b8",
    lineHeight: 20,
  },
  highlight: {
    color: "#a7f3d0",
    lineHeight: 20,
  },
  advice: {
    backgroundColor: "#123524",
    borderColor: "#22c55e",
    borderWidth: 1,
    borderRadius: 8,
    color: "#d1fae5",
    padding: 10,
  },
  onboardingPanel: {
    backgroundColor: "#102033",
    borderColor: "#38bdf8",
    borderRadius: 12,
    borderWidth: 1,
    gap: 7,
    padding: 12,
  },
  onboardingTitle: {
    color: "#bae6fd",
    fontSize: 17,
    fontWeight: "900",
  },
  onboardingText: {
    color: "#dbeafe",
    lineHeight: 20,
  },
  emptyPanel: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
    padding: 12,
  },
  heroPanel: {
    backgroundColor: "#123524",
    borderColor: "#22c55e",
    borderRadius: 12,
    borderWidth: 1,
    gap: 9,
    padding: 14,
  },
  heroLabel: {
    color: "#86efac",
    fontSize: 12,
    fontWeight: "800",
  },
  heroTitle: {
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: "900",
  },
  heroText: {
    color: "#d1fae5",
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#22c55e",
    borderRadius: 10,
    padding: 13,
  },
  primaryButtonFlex: {
    alignItems: "center",
    backgroundColor: "#22c55e",
    borderRadius: 10,
    flex: 1,
    padding: 13,
  },
  disabled: {
    opacity: 0.45,
  },
  primaryText: {
    color: "#0b141f",
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#334155",
    borderRadius: 10,
    flex: 1,
    padding: 12,
  },
  secondaryWideButton: {
    alignItems: "center",
    backgroundColor: "#334155",
    borderRadius: 10,
    padding: 12,
  },
  warningButton: {
    alignItems: "center",
    backgroundColor: "#3f2a1d",
    borderColor: "#f97316",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  warningText: {
    color: "#fed7aa",
    fontWeight: "800",
  },
  secondaryText: {
    color: "#e2e8f0",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  dashboardRow: {
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  dashboardRowText: {
    flex: 1,
    gap: 3,
  },
  statusDot: {
    backgroundColor: "#334155",
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  statusDotDone: {
    backgroundColor: "#22c55e",
  },
  planSwitch: {
    flexDirection: "row",
    gap: 10,
  },
  planButton: {
    backgroundColor: "#111827",
    borderColor: "#334155",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    gap: 3,
    padding: 12,
  },
  planButtonActive: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },
  planButtonText: {
    color: "#e2e8f0",
    fontSize: 18,
    fontWeight: "900",
  },
  planButtonSubtext: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  planButtonTextActive: {
    color: "#0b141f",
  },
  exerciseList: {
    gap: 8,
  },
  exerciseCard: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  exerciseCardActive: {
    borderColor: "#38bdf8",
  },
  exerciseCardDone: {
    borderColor: "#22c55e",
  },
  exerciseCardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  exerciseName: {
    color: "#e2e8f0",
    flex: 1,
    fontWeight: "800",
    lineHeight: 19,
  },
  exerciseNameActive: {
    color: "#a7f3d0",
  },
  exerciseBadge: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    maxWidth: 110,
    textAlign: "right",
  },
  exerciseBadgeDone: {
    color: "#86efac",
  },
  exerciseMeta: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 17,
  },
  summaryPanel: {
    backgroundColor: "#123524",
    borderColor: "#22c55e",
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  summaryTitle: {
    color: "#d1fae5",
    fontSize: 18,
    fontWeight: "900",
  },
  summaryText: {
    color: "#d1fae5",
    lineHeight: 20,
  },
  summaryButton: {
    alignItems: "center",
    backgroundColor: "#22c55e",
    borderRadius: 10,
    marginTop: 4,
    padding: 10,
  },
  summaryButtonText: {
    color: "#0b141f",
    fontWeight: "900",
  },
  demoButton: {
    alignItems: "center",
    backgroundColor: "#38bdf8",
    borderRadius: 10,
    padding: 12,
  },
  demoButtonFlex: {
    alignItems: "center",
    backgroundColor: "#38bdf8",
    borderRadius: 10,
    flex: 1,
    padding: 12,
  },
  demoButtonText: {
    color: "#0b141f",
    fontWeight: "900",
  },
  instructionPanel: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  instructionTitle: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },
  scaleRow: {
    flexDirection: "row",
    gap: 10,
  },
  scaleCard: {
    backgroundColor: "#111827",
    borderColor: "#334155",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    gap: 5,
    padding: 10,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    padding: 12,
    width: "48%",
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
  },
  metricValue: {
    color: "#e2e8f0",
    fontSize: 22,
    fontWeight: "900",
  },
  metricDelta: {
    color: "#a7f3d0",
    fontSize: 12,
    fontWeight: "700",
  },
  recipeCard: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  formRow: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    backgroundColor: "#111827",
    borderColor: "#334155",
    borderRadius: 10,
    borderWidth: 1,
    color: "#e2e8f0",
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  importInput: {
    minHeight: 120,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  helpText: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 17,
  },
  segment: {
    flexDirection: "row",
    gap: 8,
  },
  segmentButton: {
    backgroundColor: "#334155",
    borderRadius: 10,
    flex: 1,
    padding: 10,
  },
  segmentActive: {
    backgroundColor: "#38bdf8",
  },
  segmentText: {
    color: "#e2e8f0",
    fontWeight: "700",
    textAlign: "center",
  },
  timer: {
    color: "#e2e8f0",
    fontSize: 54,
    fontWeight: "900",
    textAlign: "center",
  },
  listRow: {
    borderTopColor: "#334155",
    borderTopWidth: 1,
    gap: 4,
    paddingTop: 10,
  },
  logRow: {
    alignItems: "center",
    borderTopColor: "#334155",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
  },
  logText: {
    flex: 1,
    gap: 4,
  },
  deleteButton: {
    backgroundColor: "#3f1d1d",
    borderColor: "#ef4444",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: "#fecaca",
    fontSize: 12,
    fontWeight: "800",
  },
  listItem: {
    color: "#cbd5e1",
    lineHeight: 22,
  },
  planEditorRow: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  planEditorDay: {
    gap: 3,
  },
  planEditorChoices: {
    flexDirection: "row",
    gap: 8,
  },
  smallChoice: {
    alignItems: "center",
    backgroundColor: "#334155",
    borderRadius: 8,
    flex: 1,
    paddingVertical: 9,
  },
  smallChoiceActive: {
    backgroundColor: "#38bdf8",
  },
  smallChoiceText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "800",
  },
  smallChoiceTextActive: {
    color: "#0b141f",
  },
  calendarHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#334155",
    borderRadius: 10,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  iconButtonText: {
    color: "#e2e8f0",
    fontSize: 22,
    fontWeight: "800",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  weekdayLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    width: "12.65%",
  },
  calendarDay: {
    backgroundColor: "#111827",
    borderColor: "#334155",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 58,
    padding: 7,
    width: "12.65%",
  },
  calendarDayMuted: {
    opacity: 0.35,
  },
  calendarToday: {
    borderColor: "#22c55e",
  },
  calendarSelected: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },
  calendarDate: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "800",
  },
  calendarPlan: {
    color: "#a7f3d0",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 6,
  },
  calendarRest: {
    color: "#94a3b8",
  },
  calendarSelectedText: {
    color: "#0b141f",
  },
  selectedDayPanel: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  tabs: {
    backgroundColor: "#0f172a",
    borderTopColor: "#334155",
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    left: 0,
    paddingBottom: 12,
    paddingHorizontal: 8,
    paddingTop: 8,
    position: "absolute",
    right: 0,
  },
  tabButton: {
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: "#38bdf8",
  },
  tabText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  tabTextActive: {
    color: "#0b141f",
  },
});
