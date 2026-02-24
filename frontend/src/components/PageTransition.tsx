import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const location = useLocation();

    return (
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15, ease: "easeOut" } }}
                exit={{ opacity: 0, transition: { duration: 0.1, ease: "easeIn" } }}
                style={{ width: "100%", height: "100%" }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
