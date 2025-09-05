export interface MemeConfig {
  modes: {
    inspiration: ModeConfig;
    humor: ModeConfig;
  };
  wordBanks: WordBanks;
  lengthCaps: LengthCaps;
  safety: SafetyConfig;
}

interface ModeConfig {
  systemPrompt: string;
  frames: string[];
}

interface WordBanks {
  verbs: string[];
  objects: string[];
  time: string[];
  condition: string[];
  absolute: string[];
  failword: string[];
  hardthing: string[];
  impossible: string[];
  thing: string[];
  result: string[];
  annoyance: string[];
  punchline: string[];
  neutralpunch: string[];
  everydayobject: string[];
  everydaypain: string[];
  simplefix: string[];
  task: string[];
  efficienttwist: string[];
  shortdecision: string[];
  boringtask: string[];
}

interface LengthCaps {
  inspirationMaxWords: number;
  humorMaxWords: number;
}

interface SafetyConfig {
  blocklist: string[];
  fallbackInspiration: string;
  fallbackHumor: string;
}

export const MEME_CONFIG: MemeConfig = {
  modes: {
    inspiration: {
      systemPrompt: `You write short, inspirational one-liner memes about the military. Golden Rule: every line must trigger WOW (admiration, pride). Tone: cinematic, motivational, absolute. Rules: - Always start with "THE MILITARY…" - Present tense, max 12 words, ALL CAPS. - Use absolutes like ALWAYS, NEVER, ZERO, FLAWLESS, TOGETHER. - Vary sentence structures: declarations, contrasts, or absolutes. - Never demean anyone; never political or violent. Output: only the one line, no quotes.`,
      frames: [
        "THE MILITARY {VERB} {OBJECT} BEFORE {TIME}.",
        "THE MILITARY {VERB} IN {CONDITION}.",
        "THE MILITARY {VERB} AS ONE. ALWAYS.",
        "THE MILITARY {VERB} WITH {ABSOLUTE}.",
        "THE MILITARY {VERB} UNTIL FLAWLESS.",
        "THE MILITARY NEVER {FAILWORD}. NEVER.",
        "THE MILITARY MAKES {HARDTHING} LOOK SIMPLE.",
        "THE MILITARY TURNS {IMPOSSIBLE} INTO ROUTINE."
      ]
    },
    humor: {
      systemPrompt: `You write witty but respectful one-liner memes about the military. Golden Rule: every line must trigger a SMILE (light admiration). Tone: playful exaggeration, smart, respectful. Rules: - Start with "THE MILITARY…" OR "IF THE MILITARY…" - Present tense, max 14 words, ALL CAPS. - Use frames like: "IF THE MILITARY RAN {THING}…", "THE MILITARY CALLS {HARD THING}…", "MONDAYS? THE MILITARY…". - Never demean civilians; never insult the military; never political or violent. Output: only the one line, no quotes.`,
      frames: [
        "IF THE MILITARY RAN {THING}: {RESULT}, NO {ANNOYANCE}.",
        "THE MILITARY CALLS {HARDTHING}: {PUNCHLINE}.",
        "MONDAYS? THE MILITARY CALLS THEM {NEUTRALPUNCH}.",
        "THE MILITARY HOLDS FOCUS LONGER THAN {EVERYDAYOBJECT}.",
        "{EVERYDAYPAIN}? THE MILITARY {SIMPLEFIX}.",
        "THE MILITARY DOES {TASK}: {EFFICIENTTWIST}.",
        "IF THE MILITARY HANDLED {THING}: {SHORTDECISION}.",
        "THE MILITARY FINISHES {BORINGTASK} BEFORE THE COFFEE COOLS."
      ]
    }
  },
  wordBanks: {
    verbs: ["FINISHES", "COMPLETES", "EXECUTES", "COORDINATES", "FOCUSES ON", "SECURES", "LEADS", "PREPARES", "PLANS", "ADAPTS"],
    objects: ["MISSIONS", "OBJECTIVES", "TARGETS", "OPERATIONS", "BRIEFS", "CHECKLISTS", "RESOURCES"],
    time: ["TIME RUNS OUT", "THE CLOCK STARTS", "DAWN", "THE SIGNAL", "THE FIRST BELL"],
    condition: ["CHAOS", "PRESSURE", "STORMS", "THE UNKNOWN", "NOISE"],
    absolute: ["ZERO WASTE", "TOTAL CLARITY", "UNSHAKEABLE DISCIPLINE", "PRECISION", "TOGETHER"],
    failword: ["MISS TARGETS", "STOP", "HESITATE", "WASTE A STEP"],
    hardthing: ["5 A.M. WORKOUTS", "DEADLINES", "STAKEHOLDER BRIEFS", "NIGHT OPERATIONS", "RAPID TURNAROUNDS"],
    impossible: ["THE IMPOSSIBLE", "CHAOS INTO ORDER", "PRESSURE INTO CALM"],
    thing: ["MEETINGS", "EMAILS", "BUDGETS", "SALES CALLS", "PLANNING", "HIRING"],
    result: ["TEN MINUTES", "ONE PAGE", "ONE DECISION", "CLEAR ORDERS"],
    annoyance: ["SLIDES", "THREADS", "LOOPS", "CC CHAINS"],
    punchline: ["A WARM-UP", "STANDARD PROCEDURE", "MISSION MODE", "TRAINING"],
    neutralpunch: ["MISSION DAY", "BRIEFING DAY", "STANDARD DRILL"],
    everydayobject: ["YOUR PHONE BATTERY", "A PLAYLIST", "A TRAFFIC LIGHT"],
    everydaypain: ["DEADLINES", "CONTEXT SWITCHING", "SCOPE CREEP", "LONG EMAILS"],
    simplefix: ["FINISHES EARLY", "CUTS NOISE", "ISSUES ORDERS", "MOVES AS ONE"],
    task: ["BUDGETING", "SCHEDULING", "FOLLOW-UPS", "HANDOVERS"],
    efficienttwist: ["ZERO WASTE", "ONE PAGE", "CLEAR ORDERS"],
    shortdecision: ["DECIDES FAST", "ACTS NOW", "LOCKS THE PLAN"],
    boringtask: ["MEETINGS", "MINUTES", "EMAILS"]
  },
  lengthCaps: { 
    inspirationMaxWords: 12, 
    humorMaxWords: 14 
  },
  safety: {
    blocklist: ["POLITIC", "ELECTION", "WAR CRIME", "BLOOD", "GORE", "INSULT", "RELIGION", "HATE", "SLUR", "RANKS", "UNITS", "WEAPONS"],
    fallbackInspiration: "THE MILITARY REPEATS UNTIL FLAWLESS.",
    fallbackHumor: "IF THE MILITARY RAN MEETINGS: TEN MINUTES, NO SLIDES."
  }
};

// Anti-repetition state management
export interface GenerationState {
  lastNGenerated: Array<{
    mode: 'inspiration' | 'humor';
    frameId: number;
    wordChoices: string[];
    line: string;
    createdAt: Date;
    hash: string;
  }>;
  frameCooldown: Map<number, Date>;
  wordCooldown: Map<string, Date>;
  userHistory: Map<string, Array<{
    mode: 'inspiration' | 'humor';
    frameId: number;
    line: string;
    createdAt: Date;
  }>>;
}

// Initialize state
export const INITIAL_STATE: GenerationState = {
  lastNGenerated: [],
  frameCooldown: new Map(),
  wordCooldown: new Map(),
  userHistory: new Map()
};

// Cooldown durations (in milliseconds)
export const COOLDOWNS = {
  FRAME_GLOBAL: 3, // Don't reuse same frame in last 3 global generations
  FRAME_USER: 2,   // Don't reuse same frame in last 2 user generations
  WORD_GLOBAL: 10, // Don't reuse same word choice in last 10 outputs
  FRAME_COOLDOWN_MS: 5 * 60 * 1000, // 5 minutes
  WORD_COOLDOWN_MS: 2 * 60 * 1000   // 2 minutes
};
