import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type FavoriteHeartButtonProps = {
  favorited: boolean;
  onToggle: () => void;
  size?: number;
  className?: string;
};

export function FavoriteHeartButton({
  favorited,
  onToggle,
  size = 18,
  className,
}: FavoriteHeartButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      whileTap={{ scale: 0.92 }}
      className={cn("relative inline-flex items-center justify-center", className)}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      {favorited && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full bg-red-500/25"
          initial={{ scale: 0.7, opacity: 0.7 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}

      <motion.span
        key={favorited ? "favorited" : "idle"}
        initial={{ scale: 0.75, rotate: favorited ? -12 : 0 }}
        animate={{
          scale: favorited ? [0.75, 1.35, 1] : 1,
          rotate: favorited ? [-12, 8, 0] : 0,
        }}
        transition={{
          duration: 0.42,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        className="relative inline-flex"
      >
        <Heart
          size={size}
          className={cn(
            "transition-colors duration-300",
            favorited
              ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.45)]"
              : "text-current"
          )}
        />
      </motion.span>
    </motion.button>
  );
}
