import { AnimatePresence, motion } from "framer-motion";
import { useCareer } from "@/lib/career-store";
import { Button } from "@/components/ui/button";
import { XpBar } from "@/components/XpBar";
import { levelFor } from "@/lib/career-store";

export function LevelUpModal() {
  const { levelUp, clearLevelUp, state } = useCareer();
  const info = levelFor(state.xp);

  return (
    <AnimatePresence>
      {levelUp && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clearLevelUp}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="glass w-full max-w-sm rounded-3xl p-8 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8 }}
              className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-2xl gradient-primary text-4xl shadow-glow"
            >
              🚀
            </motion.div>
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Level Up
            </p>
            <h2 className="mt-1 text-3xl font-bold gradient-text">{levelUp.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You're leveling up your career. Keep the momentum going!
            </p>
            <div className="mt-5">
              <XpBar progress={info.progress} />
              <p className="mt-2 text-xs text-muted-foreground">{state.xp} XP total</p>
            </div>
            <Button onClick={clearLevelUp} className="mt-6 w-full gradient-primary text-white">
              Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
