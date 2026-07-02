import type { GrowthStage } from "@/lib/types";

const STAGE_LABEL: Record<GrowthStage, string> = {
  seed: "semilla",
  sprout: "brote",
  sapling: "plantita",
  bush: "arbusto",
  bloom: "floración",
};

export default function GrowthIcon({ stage }: { stage: GrowthStage }) {
  const label = STAGE_LABEL[stage];
  switch (stage) {
    case "seed":
      return (
        <svg viewBox="0 0 24 24" fill="none" role="img" aria-label={label}>
          <ellipse cx="12" cy="15" rx="5" ry="6" fill="currentColor" opacity="0.85" />
        </svg>
      );
    case "sprout":
      return (
        <svg viewBox="0 0 24 24" fill="none" role="img" aria-label={label}>
          <path d="M12 20V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 12C12 12 8 12 8 8C8 8 12 8 12 12Z" fill="currentColor" />
          <path d="M12 10C12 10 16 10 16 6C16 6 12 6 12 10Z" fill="currentColor" opacity="0.8" />
        </svg>
      );
    case "sapling":
      return (
        <svg viewBox="0 0 24 24" fill="none" role="img" aria-label={label}>
          <path d="M12 20V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="8" cy="9" rx="4" ry="3.5" fill="currentColor" opacity="0.85" transform="rotate(-20 8 9)" />
          <ellipse cx="16" cy="9" rx="4" ry="3.5" fill="currentColor" transform="rotate(20 16 9)" />
          <ellipse cx="12" cy="6" rx="3.5" ry="4" fill="currentColor" opacity="0.9" />
        </svg>
      );
    case "bush":
      return (
        <svg viewBox="0 0 24 24" fill="none" role="img" aria-label={label}>
          <path d="M12 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="8" cy="10" r="4.5" fill="currentColor" opacity="0.85" />
          <circle cx="16" cy="10" r="4.5" fill="currentColor" />
          <circle cx="12" cy="7" r="5" fill="currentColor" opacity="0.9" />
        </svg>
      );
    case "bloom":
      return (
        <svg viewBox="0 0 24 24" fill="none" role="img" aria-label={label}>
          <path d="M12 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="8" r="2.2" fill="#fff" />
          <g fill="currentColor">
            <ellipse cx="12" cy="3.5" rx="2.4" ry="3" />
            <ellipse cx="12" cy="12.5" rx="2.4" ry="3" transform="rotate(180 12 12.5)" />
            <ellipse cx="7.5" cy="8" rx="2.4" ry="3" transform="rotate(-90 7.5 8)" />
            <ellipse cx="16.5" cy="8" rx="2.4" ry="3" transform="rotate(90 16.5 8)" />
          </g>
        </svg>
      );
  }
}
