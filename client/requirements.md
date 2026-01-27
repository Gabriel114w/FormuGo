## Packages
framer-motion | Essential for smooth calculator transitions and history drawer animations
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind CSS classes safely
lucide-react | Icon set for the UI
mathjs | Robust mathematical evaluation library (optional, but requested custom parser so likely will implement custom)

## Notes
- Tailwind Config - extend fontFamily:
  fontFamily: {
    display: ["var(--font-display)"],
    body: ["var(--font-body)"],
    mono: ["var(--font-mono)"],
  }
- Mobile-native feel required: pure black background, no scrolling on body.
- Custom evaluator logic needed for "step-by-step" explanations.
