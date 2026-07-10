import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export type LevelName =
  | "Graduate"
  | "Interview Ready"
  | "Job Seeker Pro"
  | "Corporate Ready"
  | "Hired";

export const LEVELS: { name: LevelName; min: number }[] = [
  { name: "Graduate", min: 0 },
  { name: "Interview Ready", min: 200 },
  { name: "Job Seeker Pro", min: 500 },
  { name: "Corporate Ready", min: 1000 },
  { name: "Hired", min: 2000 },
];

export type BadgeId =
  | "first-application"
  | "interview-warrior"
  | "cv-master"
  | "networking-pro"
  | "opportunity-hunter"
  | "corporate-ready"
  | "hired";

export const BADGES: { id: BadgeId; label: string; desc: string; icon: string }[] = [
  { id: "first-application", label: "First Application", desc: "Generated your first application", icon: "📝" },
  { id: "interview-warrior", label: "Interview Warrior", desc: "Completed 3 mock interviews", icon: "🎤" },
  { id: "cv-master", label: "CV Master", desc: "Built a polished CV", icon: "📄" },
  { id: "networking-pro", label: "Networking Pro", desc: "Crafted a recruiter message", icon: "🤝" },
  { id: "opportunity-hunter", label: "Opportunity Hunter", desc: "Saved 3 opportunities", icon: "🎯" },
  { id: "corporate-ready", label: "Corporate Ready", desc: "Decoded corporate SA", icon: "🏢" },
  { id: "hired", label: "Hired", desc: "Reached the Hired level", icon: "🏆" },
];

export type CareerState = {
  xp: number;
  applicationsSent: number;
  interviewsDone: number;
  interviewXp: number;
  matchScores: number[];
  opportunitiesSaved: number;
  badges: BadgeId[];
  streak: number;
  lastLogin: string | null;
  weeklyGoalsDone: number;
  savedOpportunityIds: string[];
};

const DEFAULT: CareerState = {
  xp: 40,
  applicationsSent: 0,
  interviewsDone: 0,
  interviewXp: 0,
  matchScores: [],
  opportunitiesSaved: 0,
  badges: [],
  streak: 1,
  lastLogin: null,
  weeklyGoalsDone: 1,
  savedOpportunityIds: [],
};

const KEY = "careeros-state-v1";

function load(): CareerState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export function levelFor(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) current = l;
  const idx = LEVELS.findIndex((l) => l.name === current.name);
  const next = LEVELS[idx + 1] ?? null;
  const floor = current.min;
  const ceil = next?.min ?? current.min + 1000;
  const progress = next ? Math.min(100, ((xp - floor) / (ceil - floor)) * 100) : 100;
  return { current, next, progress, floor, ceil, index: idx };
}

type Ctx = {
  state: CareerState;
  addXp: (amount: number, reason: string) => void;
  unlock: (badge: BadgeId) => void;
  recordApplication: () => void;
  recordInterview: (score: number) => void;
  recordMatchScore: (score: number) => void;
  toggleSaveOpportunity: (id: string) => void;
  levelUp: { name: LevelName } | null;
  clearLevelUp: () => void;
  hydrated: boolean;
};

const CareerContext = createContext<Ctx | null>(null);

export function CareerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CareerState>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const [levelUp, setLevelUp] = useState<{ name: LevelName } | null>(null);
  const levelRef = useRef(0);

  useEffect(() => {
    const loaded = load();
    // Daily login streak + XP
    const today = new Date().toDateString();
    if (loaded.lastLogin !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      loaded.streak = loaded.lastLogin === yesterday ? loaded.streak + 1 : 1;
      loaded.xp += 10;
      loaded.lastLogin = today;
    }
    levelRef.current = levelFor(loaded.xp).index;
    setState(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const fireConfetti = useCallback(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#7C5CFF", "#5B5FFB", "#FF6A6A", "#22C55E"] });
  }, []);

  const addXp = useCallback(
    (amount: number, reason: string) => {
      setState((prev) => {
        const xp = prev.xp + amount;
        const newIdx = levelFor(xp).index;
        if (newIdx > levelRef.current) {
          levelRef.current = newIdx;
          const name = LEVELS[newIdx].name;
          setTimeout(() => setLevelUp({ name }), 300);
          if (name === "Hired") {
            setState((s) => (s.badges.includes("hired") ? s : { ...s, badges: [...s.badges, "hired"] }));
          }
        }
        return { ...prev, xp };
      });
      toast.success(`+${amount} XP`, { description: reason });
    },
    [],
  );

  const unlock = useCallback(
    (badge: BadgeId) => {
      setState((prev) => {
        if (prev.badges.includes(badge)) return prev;
        const meta = BADGES.find((b) => b.id === badge);
        setTimeout(() => {
          fireConfetti();
          toast.success("Achievement unlocked!", { description: `${meta?.icon} ${meta?.label}` });
        }, 0);
        return { ...prev, badges: [...prev.badges, badge] };
      });
    },
    [fireConfetti],
  );

  const recordApplication = useCallback(() => {
    setState((prev) => ({ ...prev, applicationsSent: prev.applicationsSent + 1 }));
    addXp(20, "Application generated");
    setState((prev) => {
      if (prev.applicationsSent >= 0 && !prev.badges.includes("first-application")) {
        setTimeout(() => unlock("first-application"), 200);
      }
      return prev;
    });
  }, [addXp, unlock]);

  const recordInterview = useCallback(
    (score: number) => {
      setState((prev) => {
        const interviewsDone = prev.interviewsDone + 1;
        if (interviewsDone >= 3) setTimeout(() => unlock("interview-warrior"), 200);
        return {
          ...prev,
          interviewsDone,
          interviewXp: prev.interviewXp + 50,
          matchScores: [...prev.matchScores, score * 10],
        };
      });
      addXp(50, "Mock interview completed");
    },
    [addXp, unlock],
  );

  const recordMatchScore = useCallback((score: number) => {
    setState((prev) => ({ ...prev, matchScores: [...prev.matchScores, score] }));
  }, []);

  const toggleSaveOpportunity = useCallback(
    (id: string) => {
      setState((prev) => {
        const saved = prev.savedOpportunityIds.includes(id);
        const savedOpportunityIds = saved
          ? prev.savedOpportunityIds.filter((x) => x !== id)
          : [...prev.savedOpportunityIds, id];
        const opportunitiesSaved = savedOpportunityIds.length;
        if (opportunitiesSaved >= 3) setTimeout(() => unlock("opportunity-hunter"), 200);
        return { ...prev, savedOpportunityIds, opportunitiesSaved };
      });
    },
    [unlock],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      addXp,
      unlock,
      recordApplication,
      recordInterview,
      recordMatchScore,
      toggleSaveOpportunity,
      levelUp,
      clearLevelUp: () => setLevelUp(null),
      hydrated,
    }),
    [state, addXp, unlock, recordApplication, recordInterview, recordMatchScore, toggleSaveOpportunity, levelUp, hydrated],
  );

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareer() {
  const ctx = useContext(CareerContext);
  if (!ctx) throw new Error("useCareer must be used within CareerProvider");
  return ctx;
}

export function matchAvg(scores: number[]) {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
