import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface TrackingStage {
    key: string;
    label: string;
    description: string;
}

interface TrackingTimelineProps {
    stages: TrackingStage[];
    currentIndex: number;
    isDelayed?: boolean;
}

// Tune these to taste
const LINE_DURATION = 0.55;  // seconds each line fills
const LINE_GAP = 0.12;  // pause after line fills before next circle lights up
const START_DELAY = 0.55;  // wait for dialog + backdrop animation to fully settle

export function TrackingTimeline({ stages, currentIndex, isDelayed = false }: TrackingTimelineProps) {
    // litCount = how many circles have turned solid-blue so far
    // starts at 0 so every line starts unfilled
    const [litCount, setLitCount] = useState(0);

    useEffect(() => {
        // Always reset to 0 so dialog re-open re-plays the animation
        setLitCount(0);
        const timers: ReturnType<typeof setTimeout>[] = [];

        // Circle 0 lights up after the dialog settles
        timers.push(setTimeout(() => setLitCount(1), START_DELAY * 1000));

        // Each subsequent completed circle lights up after the line above it finishes filling
        for (let i = 0; i < currentIndex; i++) {
            const ms = (START_DELAY + (i + 1) * (LINE_DURATION + LINE_GAP)) * 1000;
            timers.push(setTimeout(() => setLitCount(i + 2), ms));
        }

        return () => timers.forEach(clearTimeout);
    }, [currentIndex]);

    return (
        <div className="relative mt-1">
            {stages.map((stage, idx) => {
                const isDone = idx < currentIndex;
                const isCurrent = idx === currentIndex;          // ← always, not gated by litCount
                const isPending = idx > currentIndex;
                const isLit = idx < litCount;                // circle has been activated
                const isLast = idx === stages.length - 1;

                // Line from this circle downward fills after this circle is lit
                const fillDelay = START_DELAY + idx * (LINE_DURATION + LINE_GAP) + LINE_GAP;

                return (
                    <div key={stage.key} className="flex gap-4">
                        {/* ─── Circle + line ─── */}
                        <div className="flex flex-col items-center">

                            {/* Circle: grey by default, blue when lit (done), primary-tinted when current */}
                            <motion.div
                                animate={
                                    isLit && isDone
                                        ? { borderColor: "hsl(var(--primary))", backgroundColor: "hsl(var(--primary))" }
                                        : isCurrent
                                            ? isDelayed
                                                ? { borderColor: "hsl(var(--destructive))", backgroundColor: "hsl(var(--destructive) / 0.08)" }
                                                : { borderColor: "hsl(var(--primary))", backgroundColor: "hsl(var(--primary) / 0.08)" }
                                            : { borderColor: "hsl(var(--muted-foreground) / 0.22)", backgroundColor: "transparent" }
                                }
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2"
                            >
                                {/* Ripple ring — only on current */}
                                {isCurrent && (
                                    <motion.span
                                        className={`absolute inset-0 rounded-full ${isDelayed ? "bg-destructive/20" : "bg-primary/20"}`}
                                        animate={{ scale: [1, 1.85, 1], opacity: [0.55, 0, 0.55] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                )}

                                {/* Icon swap: tick (done+lit) → clock (current) → empty circle (pending) */}
                                <AnimatePresence mode="wait" initial={false}>
                                    {isLit && isDone ? (
                                        <motion.span
                                            key="check"
                                            initial={{ scale: 0, rotate: -45 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 22 }}
                                        >
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                        </motion.span>
                                    ) : isCurrent ? (
                                        <motion.span key="clock"
                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                                            <Clock className={`h-4 w-4 ${isDelayed ? "text-destructive" : "text-primary"}`} />
                                        </motion.span>
                                    ) : (
                                        <motion.span key="circle">
                                            <Circle className="h-4 w-4 text-muted-foreground/30" />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Connector line between this circle and the next */}
                            {!isLast && (
                                <div className="relative w-0.5 flex-1 min-h-[44px] my-1 rounded-full bg-muted-foreground/15 overflow-hidden">

                                    {/* Water fill — only for completed segments, starts at height 0 */}
                                    {isDone && (
                                        <motion.div
                                            key={`fill-${idx}`}
                                            className={`absolute top-0 left-0 right-0 rounded-full ${isDelayed && idx === currentIndex - 1
                                                    ? "bg-destructive/70"
                                                    : "bg-primary"
                                                }`}
                                            initial={{ height: "0%" }}
                                            animate={{ height: "100%" }}
                                            transition={{
                                                delay: fillDelay,
                                                duration: LINE_DURATION,
                                                ease: [0.4, 0, 0.2, 1],
                                            }}
                                        />
                                    )}

                                    {/* Partial fill under the current stage — shows ~30% immediately */}
                                    {isCurrent && (
                                        <motion.div
                                            className={`absolute top-0 left-0 right-0 rounded-full ${isDelayed ? "bg-destructive/35" : "bg-primary/35"
                                                }`}
                                            initial={{ height: "0%" }}
                                            animate={{ height: "32%" }}
                                            transition={{
                                                delay: START_DELAY + 0.05,
                                                duration: 0.6,
                                                ease: "easeOut",
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ─── Label + description ─── */}
                        <div className={`pb-5 pt-1.5 transition-opacity duration-500 ${isPending ? "opacity-35" : ""}`}>
                            <p className={`text-sm font-semibold ${isCurrent && !isDelayed ? "text-primary" :
                                    isCurrent && isDelayed ? "text-destructive" : ""
                                }`}>
                                {stage.label}
                                {isCurrent && (
                                    <Badge
                                        variant="outline"
                                        className={`ml-2 text-[10px] ${isDelayed
                                                ? "border-destructive/50 text-destructive"
                                                : "border-primary/50 text-primary"
                                            }`}
                                    >
                                        {isDelayed ? "Delayed" : "Current"}
                                    </Badge>
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
