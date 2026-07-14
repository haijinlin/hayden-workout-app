export type Exercise = {
  id: string;
  name: { en: string; zh: string };
  intro: { en: string; zh: string };
  targetMuscles: { en: string; zh: string };
  videoUrl: string;
  targetSets?: number;
  targetReps?: number;
  targetTimeSec?: number;
};

export const exercises: Exercise[] = [
  {
    id: "hip-thrust",
    name: { en: "Hip Thrust / Glute Bridge", zh: "臀推 / 臀桥" },
    intro: {
      en: "Drive through your heels, tuck the ribs down, and squeeze your glutes hard at the top.",
      zh: "脚跟发力，肋骨下收，顶端用力夹紧臀部。可以逐步用背包、哑铃或水壶加重。",
    },
    targetMuscles: {
      en: "Glute max, glute shape and hip extension strength.",
      zh: "主要练臀大肌，提升臀部饱满度和髋伸力量。",
    },
    videoUrl: "https://www.youtube.com/watch?v=SEdqd1n0cvg",
    targetSets: 4,
    targetReps: 12,
  },
  {
    id: "bulgarian-split-squat",
    name: { en: "Bulgarian Split Squat", zh: "保加利亚分腿蹲" },
    intro: {
      en: "Keep a long stance, lean slightly forward, and push the floor away through the front heel.",
      zh: "前后站距拉长，身体微微前倾，用前脚脚跟发力站起。每边都做。",
    },
    targetMuscles: {
      en: "Glutes, quads, single-leg strength, and hip stability.",
      zh: "主要练臀部、股四头肌、单腿力量和髋稳定。",
    },
    videoUrl: "https://www.youtube.com/watch?v=2C-uNgKwPLE",
    targetSets: 3,
    targetReps: 10,
  },
  {
    id: "romanian-deadlift",
    name: { en: "Romanian Deadlift", zh: "罗马尼亚硬拉" },
    intro: {
      en: "Hinge from the hips with a flat back. Feel a stretch in the hamstrings, then stand by squeezing the glutes.",
      zh: "髋部向后折叠，背部保持平直，感受大腿后侧拉伸，再用臀部发力站起。",
    },
    targetMuscles: {
      en: "Glutes, hamstrings, posterior chain, and lower-body shape.",
      zh: "主要练臀部、大腿后侧和身体后链，改善臀腿线条。",
    },
    videoUrl: "https://www.youtube.com/watch?v=JCXUYuzwNrM",
    targetSets: 3,
    targetReps: 12,
  },
  {
    id: "side-lying-hip-abduction",
    name: { en: "Side-Lying Hip Abduction", zh: "侧卧抬腿" },
    intro: {
      en: "Keep the pelvis stacked, toes slightly down, and lift from the side of the hip without swinging.",
      zh: "骨盆保持稳定，脚尖略向下，不要甩腿，用臀侧发力抬起。",
    },
    targetMuscles: {
      en: "Glute medius, side glutes, hip shape, and knee stability.",
      zh: "主要练臀中肌和臀侧，让臀部更有宽度和弧度，也帮助膝盖稳定。",
    },
    videoUrl: "https://www.youtube.com/watch?v=mxWissvKVj0",
    targetSets: 3,
    targetReps: 15,
  },
  {
    id: "shoulder-press",
    name: { en: "Shoulder Press", zh: "肩推" },
    intro: {
      en: "Brace your core, keep ribs down, and press weights overhead without shrugging.",
      zh: "收紧核心，肋骨不要外翻，把重量向头顶推起，避免耸肩。",
    },
    targetMuscles: {
      en: "Front and side delts, triceps, and overhead strength.",
      zh: "主要练三角肌前束和中束，也练肱三头肌和上肢推力。",
    },
    videoUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
    targetSets: 3,
    targetReps: 10,
  },
  {
    id: "lateral-raise",
    name: { en: "Lateral Raise", zh: "侧平举" },
    intro: {
      en: "Use light weights, raise to shoulder height, and keep the motion controlled.",
      zh: "用较轻重量，手臂抬到肩膀高度即可，全程控制，不要借力甩。",
    },
    targetMuscles: {
      en: "Side delts for wider, rounder-looking shoulders.",
      zh: "主要练三角肌中束，是让肩膀更宽、更圆润的关键动作。",
    },
    videoUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    targetSets: 3,
    targetReps: 15,
  },
  {
    id: "pike-pushup",
    name: { en: "Pike Push-up", zh: "折刀俯卧撑" },
    intro: {
      en: "Hips high, head moves toward the floor, then press back up like an overhead press.",
      zh: "臀部抬高，头向地面下降，再像肩推一样把身体推回去。",
    },
    targetMuscles: {
      en: "Shoulders, upper chest, triceps, and bodyweight pressing strength.",
      zh: "主要练肩膀、上胸、肱三头肌和自重推力。",
    },
    videoUrl: "https://www.youtube.com/watch?v=sposDXWEB0A",
    targetSets: 3,
    targetReps: 8,
  },
  {
    id: "bent-over-row",
    name: { en: "Bent-over Row", zh: "俯身划船" },
    intro: {
      en: "Keep a flat back, pull elbows back, and squeeze the shoulder blades.",
      zh: "背部保持平直，手肘向后拉，顶端夹紧肩胛骨。",
    },
    targetMuscles: {
      en: "Upper back, lats, rear delts, and posture support.",
      zh: "主要练上背、背阔肌和三角肌后束，帮助肩背体态更好。",
    },
    videoUrl: "https://www.youtube.com/watch?v=roCP6wCXPqo",
    targetSets: 3,
    targetReps: 12,
  },
  {
    id: "reverse-crunch",
    name: { en: "Reverse Crunch", zh: "反向卷腹" },
    intro: {
      en: "Curl the pelvis up, move slowly, and avoid swinging the legs.",
      zh: "骨盆向上卷起，动作放慢，不要靠甩腿完成。",
    },
    targetMuscles: {
      en: "Abs, especially lower-ab control and pelvic curl strength.",
      zh: "主要练腹直肌，尤其是下腹控制和骨盆卷曲能力。",
    },
    videoUrl: "https://www.youtube.com/watch?v=hyv14e2QDq0",
    targetSets: 3,
    targetReps: 12,
  },
  {
    id: "dead-bug",
    name: { en: "Dead Bug", zh: "死虫式" },
    intro: {
      en: "Press the low back gently into the floor and move opposite arm and leg without arching.",
      zh: "下背轻贴地面，交替伸展对侧手脚，过程中不要塌腰。",
    },
    targetMuscles: {
      en: "Deep core, anti-extension control, and lower-back protection.",
      zh: "主要练深层核心和抗伸展能力，帮助保护腰部。",
    },
    videoUrl: "https://www.youtube.com/watch?v=4XLEnwUr1d8",
    targetSets: 3,
    targetReps: 10,
  },
  {
    id: "side-plank",
    name: { en: "Side Plank", zh: "侧平板支撑" },
    intro: {
      en: "Stack shoulders and hips, keep the body long, and hold without letting the hips drop.",
      zh: "肩膀和髋部上下对齐，身体拉长，保持髋部不要下沉。每边都做。",
    },
    targetMuscles: {
      en: "Obliques, side core, glute medius, and trunk stability.",
      zh: "主要练侧腹、核心稳定和臀中肌，让腰腹线条更紧致。",
    },
    videoUrl: "https://www.youtube.com/watch?v=K2VljzCC16g",
    targetSets: 3,
    targetTimeSec: 30,
  },
  {
    id: "hollow-body-hold",
    name: { en: "Hollow Body Hold", zh: "空心支撑" },
    intro: {
      en: "Press your low back into the floor, tuck the ribs down, and hold a banana-shaped body line without arching.",
      zh: "下背贴住地面，肋骨下收，身体保持香蕉形弧线，不要塌腰。太难时先屈膝做。",
    },
    targetMuscles: {
      en: "Abs, deep core, pelvic control, and full-body tension for a tighter waistline.",
      zh: "主要练腹直肌、深层核心和骨盆控制，让腰腹更紧致。",
    },
    videoUrl: "https://www.youtube.com/watch?v=LlDNef_Ztsc",
    targetSets: 3,
    targetTimeSec: 20,
  },
];
