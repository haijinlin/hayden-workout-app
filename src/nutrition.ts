export type LangText = { en: string; zh: string };

export type MealTemplate = {
  id: string;
  title: LangText;
  purpose: LangText;
  meals: Array<{
    name: LangText;
    items: LangText;
  }>;
};

export type Recipe = {
  id: string;
  title: LangText;
  timing: LangText;
  purpose: LangText;
  ingredients: LangText[];
  steps: LangText[];
  swaps: LangText;
};

export type ShoppingGroup = {
  title: LangText;
  items: LangText[];
};

export const nutritionPrinciples = {
  trainingDay: {
    title: { en: "Training day", zh: "训练日" },
    points: [
      {
        en: "Keep protein high at every meal to support shoulder and glute growth.",
        zh: "每餐都要有蛋白质，支撑肩膀和臀部增肌。",
      },
      {
        en: "Put more carbs around training: rice, oats, potato, bread, fruit, or noodles.",
        zh: "训练前后多安排碳水：米饭、燕麦、土豆、面包、水果或面条。",
      },
      {
        en: "Whey protein is useful after training or when a meal is low in protein. It is a supplement, not a replacement for real meals.",
        zh: "蛋白粉适合训练后，或某一餐蛋白质不够时补充。它是补充品，不是正餐替代品。",
      },
      {
        en: "Do not diet too hard. A very low calorie intake makes glutes and shoulders harder to grow.",
        zh: "不要吃得太少。长期热量太低，臀和肩会更难长。",
      },
    ],
  },
  restDay: {
    title: { en: "Rest day", zh: "休息日" },
    points: [
      {
        en: "Keep protein the same so muscles can recover.",
        zh: "蛋白质保持稳定，让肌肉有材料恢复。",
      },
      {
        en: "On rest days, whey is optional. Use it only if your normal food does not hit enough protein.",
        zh: "休息日蛋白粉不是必须。只有正常饮食蛋白质不够时再用。",
      },
      {
        en: "Use slightly smaller carb portions if you are less active.",
        zh: "活动量较低时，碳水份量可以比训练日略少。",
      },
      {
        en: "Prioritize water, vegetables, and sleep. Recovery is where the shape improves.",
        zh: "优先保证水、蔬菜和睡眠。身体线条是在恢复中变好的。",
      },
    ],
  },
};

export const mealTemplates: MealTemplate[] = [
  {
    id: "training-day",
    title: { en: "Training Day Template", zh: "训练日模板" },
    purpose: {
      en: "More fuel before and after training, while keeping protein steady.",
      zh: "训练前后给身体更多燃料，同时保证蛋白质稳定。",
    },
    meals: [
      {
        name: { en: "Breakfast", zh: "早餐" },
        items: {
          en: "Greek yogurt or eggs + oats or whole-grain bread + fruit.",
          zh: "希腊酸奶或鸡蛋 + 燕麦或全麦面包 + 水果。",
        },
      },
      {
        name: { en: "Lunch", zh: "午餐" },
        items: {
          en: "Chicken, beef, fish, tofu, or shrimp + rice or potato + vegetables.",
          zh: "鸡肉、牛肉、鱼、豆腐或虾 + 米饭或土豆 + 蔬菜。",
        },
      },
      {
        name: { en: "Pre-workout", zh: "训练前" },
        items: {
          en: "Banana, toast, rice cake, or yogurt if you need energy.",
          zh: "需要能量时吃香蕉、吐司、米饼或酸奶。",
        },
      },
      {
        name: { en: "Post-workout whey", zh: "训练后蛋白粉" },
        items: {
          en: "One serving of whey with water or milk if your next meal is not soon.",
          zh: "如果短时间内吃不到正餐，可以用一份 whey 加水或牛奶补充。",
        },
      },
      {
        name: { en: "Dinner", zh: "晚餐" },
        items: {
          en: "Protein bowl: meat, fish, tofu, or eggs + carbs + colorful vegetables.",
          zh: "蛋白碗：肉、鱼、豆腐或鸡蛋 + 碳水 + 彩色蔬菜。",
        },
      },
    ],
  },
  {
    id: "rest-day",
    title: { en: "Rest Day Template", zh: "休息日模板" },
    purpose: {
      en: "Keep recovery high without forcing extra carbs.",
      zh: "保证恢复，不强行增加额外碳水。",
    },
    meals: [
      {
        name: { en: "Breakfast", zh: "早餐" },
        items: {
          en: "Eggs or yogurt + fruit + a small portion of oats or bread.",
          zh: "鸡蛋或酸奶 + 水果 + 少量燕麦或面包。",
        },
      },
      {
        name: { en: "Lunch", zh: "午餐" },
        items: {
          en: "Protein + large vegetables + moderate rice, potato, or noodles.",
          zh: "蛋白质 + 大份蔬菜 + 适量米饭、土豆或面条。",
        },
      },
      {
        name: { en: "Snack", zh: "加餐" },
        items: {
          en: "Cottage cheese, Greek yogurt, soy milk, fruit, or nuts.",
          zh: "奶酪、希腊酸奶、豆浆、水果或坚果。",
        },
      },
      {
        name: { en: "Dinner", zh: "晚餐" },
        items: {
          en: "Fish, tofu, chicken, or eggs + vegetables + healthy fats.",
          zh: "鱼、豆腐、鸡肉或鸡蛋 + 蔬菜 + 健康脂肪。",
        },
      },
    ],
  },
  {
    id: "busy-day",
    title: { en: "Busy Day / Eating Out", zh: "忙碌 / 外食模板" },
    purpose: {
      en: "Simple choices when you do not have time to cook.",
      zh: "没时间做饭时，用简单选择保证不乱吃。",
    },
    meals: [
      {
        name: { en: "Pick one protein", zh: "选一个蛋白质" },
        items: {
          en: "Chicken, beef, fish, eggs, tofu, shrimp, tuna, or yogurt.",
          zh: "鸡肉、牛肉、鱼、鸡蛋、豆腐、虾、金枪鱼或酸奶。",
        },
      },
      {
        name: { en: "Pick one carb", zh: "选一个碳水" },
        items: {
          en: "Rice, noodles, potato, oats, bread, wrap, or fruit.",
          zh: "米饭、面条、土豆、燕麦、面包、卷饼或水果。",
        },
      },
      {
        name: { en: "Add vegetables", zh: "加蔬菜" },
        items: {
          en: "Salad, steamed vegetables, tomato, spinach, broccoli, or mushrooms.",
          zh: "沙拉、蒸蔬菜、番茄、菠菜、西兰花或蘑菇。",
        },
      },
      {
        name: { en: "Keep it practical", zh: "保持实际" },
        items: {
          en: "Avoid making the meal perfect. Make it protein-first and consistent.",
          zh: "不用追求完美，优先蛋白质，然后保持稳定执行。",
        },
      },
    ],
  },
];

export const recipes: Recipe[] = [
  {
    id: "beef-egg-rice-bowl",
    title: { en: "Beef Egg Rice Bowl", zh: "牛肉鸡蛋米饭碗" },
    timing: { en: "Lunch or post-workout", zh: "午餐或训练后" },
    purpose: {
      en: "High protein plus carbs for glute and shoulder training recovery.",
      zh: "高蛋白加碳水，适合臀腿和肩部训练后的恢复。",
    },
    ingredients: [
      { en: "Lean beef or mince", zh: "瘦牛肉或牛肉末" },
      { en: "Eggs", zh: "鸡蛋" },
      { en: "Rice", zh: "米饭" },
      { en: "Spinach, broccoli, or tomato", zh: "菠菜、西兰花或番茄" },
    ],
    steps: [
      { en: "Cook beef with a little salt, pepper, and soy sauce.", zh: "牛肉用少量盐、黑胡椒和酱油炒熟。" },
      { en: "Add eggs and vegetables.", zh: "加入鸡蛋和蔬菜。" },
      { en: "Serve over rice.", zh: "盖在米饭上即可。" },
    ],
    swaps: {
      en: "Swap beef for chicken, tofu, shrimp, or tuna.",
      zh: "牛肉可以换成鸡肉、豆腐、虾或金枪鱼。",
    },
  },
  {
    id: "yogurt-oats-bowl",
    title: { en: "Greek Yogurt Oats Bowl", zh: "希腊酸奶燕麦碗" },
    timing: { en: "Breakfast or snack", zh: "早餐或加餐" },
    purpose: {
      en: "Easy protein, carbs, and fruit before a training day.",
      zh: "简单补充蛋白质、碳水和水果，适合训练日。",
    },
    ingredients: [
      { en: "Greek yogurt", zh: "希腊酸奶" },
      { en: "Oats", zh: "燕麦" },
      { en: "Banana or berries", zh: "香蕉或莓果" },
      { en: "Nuts or peanut butter", zh: "坚果或花生酱" },
    ],
    steps: [
      { en: "Add yogurt to a bowl.", zh: "碗里放希腊酸奶。" },
      { en: "Top with oats and fruit.", zh: "加入燕麦和水果。" },
      { en: "Add a small amount of nuts or peanut butter.", zh: "加少量坚果或花生酱。" },
    ],
    swaps: {
      en: "Use soy yogurt or cottage cheese if preferred.",
      zh: "也可以换成豆乳酸奶或奶酪。",
    },
  },
  {
    id: "salmon-potato-salad",
    title: { en: "Salmon Potato Salad", zh: "三文鱼土豆沙拉" },
    timing: { en: "Dinner or rest day lunch", zh: "晚餐或休息日午餐" },
    purpose: {
      en: "Protein, omega-3 fats, and steady carbs for recovery.",
      zh: "提供蛋白质、优质脂肪和稳定碳水，帮助恢复。",
    },
    ingredients: [
      { en: "Salmon or canned tuna", zh: "三文鱼或罐头金枪鱼" },
      { en: "Potato", zh: "土豆" },
      { en: "Leafy greens", zh: "绿叶菜" },
      { en: "Olive oil or avocado", zh: "橄榄油或牛油果" },
    ],
    steps: [
      { en: "Cook the salmon and potato.", zh: "煎熟三文鱼，煮熟土豆。" },
      { en: "Place over greens.", zh: "放在绿叶菜上。" },
      { en: "Season with lemon, salt, and olive oil.", zh: "用柠檬、盐和橄榄油调味。" },
    ],
    swaps: {
      en: "Swap potato for rice, pasta, or bread.",
      zh: "土豆可以换成米饭、意面或面包。",
    },
  },
  {
    id: "tofu-shrimp-fried-rice",
    title: { en: "Tofu Shrimp Fried Rice", zh: "豆腐虾仁炒饭" },
    timing: { en: "Training day meal", zh: "训练日正餐" },
    purpose: {
      en: "Balanced protein and carbs with a lighter feel.",
      zh: "蛋白质和碳水均衡，吃起来负担较轻。",
    },
    ingredients: [
      { en: "Firm tofu", zh: "老豆腐" },
      { en: "Shrimp", zh: "虾仁" },
      { en: "Rice", zh: "米饭" },
      { en: "Egg and mixed vegetables", zh: "鸡蛋和混合蔬菜" },
    ],
    steps: [
      { en: "Pan-fry tofu and shrimp.", zh: "先煎豆腐和虾仁。" },
      { en: "Add egg, rice, and vegetables.", zh: "加入鸡蛋、米饭和蔬菜翻炒。" },
      { en: "Season lightly with soy sauce.", zh: "用少量酱油调味。" },
    ],
    swaps: {
      en: "Use chicken or edamame if shrimp is unavailable.",
      zh: "没有虾仁时可以换成鸡肉或毛豆。",
    },
  },
  {
    id: "banana-protein-smoothie",
    title: { en: "Banana Protein Smoothie", zh: "香蕉蛋白奶昔" },
    timing: { en: "Post-workout or quick snack", zh: "训练后或快速加餐" },
    purpose: {
      en: "Fast protein and carbs when appetite or time is low.",
      zh: "没胃口或没时间时，快速补蛋白质和碳水。",
    },
    ingredients: [
      { en: "Milk, soy milk, or yogurt", zh: "牛奶、豆奶或酸奶" },
      { en: "Banana", zh: "香蕉" },
      { en: "Whey protein powder or Greek yogurt", zh: "乳清蛋白粉或希腊酸奶" },
      { en: "Oats or peanut butter", zh: "燕麦或花生酱" },
    ],
    steps: [
      { en: "Blend all ingredients until smooth.", zh: "所有食材放入搅拌机打匀。" },
      { en: "Drink after training or as a snack.", zh: "训练后或加餐时喝。" },
    ],
    swaps: {
      en: "Use whey for convenience. Skip it if your meal already has enough protein.",
      zh: "whey 适合图方便。正餐蛋白质已经足够时，可以不加。",
    },
  },
];

export const shoppingGroups: ShoppingGroup[] = [
  {
    title: { en: "Protein", zh: "蛋白质" },
    items: [
      { en: "Eggs", zh: "鸡蛋" },
      { en: "Chicken breast or thighs", zh: "鸡胸或鸡腿肉" },
      { en: "Lean beef", zh: "瘦牛肉" },
      { en: "Fish or canned tuna", zh: "鱼或金枪鱼罐头" },
      { en: "Shrimp", zh: "虾仁" },
      { en: "Tofu or edamame", zh: "豆腐或毛豆" },
      { en: "Greek yogurt", zh: "希腊酸奶" },
      { en: "Whey protein powder", zh: "乳清蛋白粉 / whey" },
    ],
  },
  {
    title: { en: "Carbs", zh: "碳水" },
    items: [
      { en: "Rice", zh: "米饭" },
      { en: "Oats", zh: "燕麦" },
      { en: "Potato or sweet potato", zh: "土豆或红薯" },
      { en: "Whole-grain bread or wraps", zh: "全麦面包或卷饼" },
      { en: "Bananas", zh: "香蕉" },
      { en: "Noodles or pasta", zh: "面条或意面" },
    ],
  },
  {
    title: { en: "Fats", zh: "脂肪" },
    items: [
      { en: "Avocado", zh: "牛油果" },
      { en: "Olive oil", zh: "橄榄油" },
      { en: "Nuts", zh: "坚果" },
      { en: "Peanut butter", zh: "花生酱" },
    ],
  },
  {
    title: { en: "Vegetables and fruit", zh: "蔬菜水果" },
    items: [
      { en: "Broccoli", zh: "西兰花" },
      { en: "Spinach", zh: "菠菜" },
      { en: "Tomatoes", zh: "番茄" },
      { en: "Mushrooms", zh: "蘑菇" },
      { en: "Berries", zh: "莓果" },
      { en: "Leafy greens", zh: "绿叶菜" },
    ],
  },
];
