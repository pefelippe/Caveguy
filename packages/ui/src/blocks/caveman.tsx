import { useId } from 'react';

import { cn } from '@zapbots/ui/lib/utils';

/** What the Caveman wears: the fixed Agentes' own, then the six a custom one picks from. */
export type CavemanOutfit =
  /** Nothing over the hide: the app's own sign (`LogoBadge`). */
  | 'PLAIN'
  | 'FINANCE'
  | 'PERSONAL'
  | 'FITNESS'
  | 'COOK'
  | 'EXPLORER'
  | 'ARTIST'
  | 'SCHOLAR'
  | 'MUSICIAN'
  | 'BUILDER';

export type CavemanMood = 'idle' | 'thinking' | 'happy' | 'talking';

const LINE = 'var(--caveman-line)';
/** The mouth shows light against the dark beard. */
const MOUTH = 'var(--paper)';
/** The slab he is drawn on: a rough stone, never a circle. */
const SLAB = 'M8 13 L31 5 L62 8 L91 4 L96 31 L93 62 L97 91 L66 96 L34 93 L5 96 L3 61 L7 36 Z';
const STROKE = { fill: 'none', stroke: LINE, strokeLinecap: 'round', strokeWidth: 2.5 } as const;

/** The piece of each outfit, drawn over the head. */
function Outfit({ outfit }: { outfit: CavemanOutfit }) {
  switch (outfit) {
    case 'PLAIN':
      return null;
    case 'FINANCE':
      return (
        <g>
          <path {...STROKE} d="M38 72 Q50 80 62 72" strokeWidth={1.5} />
          <circle cx="50" cy="84" fill="var(--area-general)" r="8" stroke={LINE} strokeWidth="2" />
          <path
            {...STROKE}
            d="M50 79 V89 M47 81.5 Q50 79 53 81.5 Q47 85 53 86.5 Q50 89 47 86.5"
            strokeWidth={1.5}
          />
        </g>
      );
    case 'PERSONAL':
      return (
        <g>
          <path d="M69 26 L80 48" stroke={LINE} strokeLinecap="round" strokeWidth="6" />
          <path
            d="M69 26 L80 48"
            stroke="var(--area-personal)"
            strokeLinecap="round"
            strokeWidth="3.5"
          />
          <rect
            fill="var(--paper)"
            height="18"
            rx="2"
            stroke={LINE}
            strokeWidth="2"
            transform="rotate(-8 30 86)"
            width="16"
            x="22"
            y="78"
          />
          <path
            {...STROKE}
            d="M26 84 H34 M26 88 H33"
            strokeWidth={1.5}
            transform="rotate(-8 30 86)"
          />
        </g>
      );
    case 'FITNESS':
      return (
        <path
          d="M29 35 Q50 28 71 35 L71 41 Q50 34 29 41 Z"
          fill="var(--seal)"
          stroke={LINE}
          strokeLinejoin="round"
          strokeWidth="2"
        />
      );
    case 'COOK':
      return (
        <g>
          <path
            d="M33 30 C24 16 38 6 45 12 C49 3 63 4 62 13 C72 8 79 22 67 30 Z"
            fill="var(--paper)"
            stroke={LINE}
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          <path d="M33 30 H67 V35 H33 Z" fill="var(--paper)" stroke={LINE} strokeWidth="2" />
        </g>
      );
    case 'EXPLORER':
      return (
        <g>
          <path
            d="M34 30 Q36 12 50 12 Q64 12 66 30 Z"
            fill="var(--area-general)"
            stroke={LINE}
            strokeWidth="2.5"
          />
          <path
            d="M20 31 Q50 22 80 31 Q50 37 20 31 Z"
            fill="var(--area-general)"
            stroke={LINE}
            strokeWidth="2.5"
          />
        </g>
      );
    case 'ARTIST':
      return (
        <g>
          <path
            d="M28 28 C30 12 66 8 74 22 C64 30 40 32 28 28 Z"
            fill="var(--seal)"
            stroke={LINE}
            strokeWidth="2.5"
          />
          <path {...STROKE} d="M52 12 L54 6" />
        </g>
      );
    case 'SCHOLAR':
      return (
        <g {...STROKE} strokeWidth={2}>
          <circle cx="43" cy="46" fill="var(--paper)" fillOpacity="0.35" r="6" />
          <circle cx="57" cy="46" fill="var(--paper)" fillOpacity="0.35" r="6" />
          <path d="M49 46 H51 M37 45 L31 42 M63 45 L69 42" />
        </g>
      );
    case 'MUSICIAN':
      return (
        <g>
          <path {...STROKE} d="M27 44 C24 12 76 12 73 44" strokeWidth={4} />
          <rect
            fill="var(--area-personal)"
            height="16"
            rx="4"
            stroke={LINE}
            strokeWidth="2"
            width="9"
            x="22"
            y="38"
          />
          <rect
            fill="var(--area-personal)"
            height="16"
            rx="4"
            stroke={LINE}
            strokeWidth="2"
            width="9"
            x="69"
            y="38"
          />
        </g>
      );
    case 'BUILDER':
      return (
        <g>
          <path
            d="M31 31 C31 13 69 13 69 31 Z"
            fill="var(--area-general)"
            stroke={LINE}
            strokeWidth="2.5"
          />
          <path d="M25 31 H75 V35 H25 Z" fill="var(--area-general)" stroke={LINE} strokeWidth="2" />
          <path {...STROKE} d="M50 15 V30" strokeWidth={2} />
        </g>
      );
  }
}

function Mouth({ mood }: { mood: CavemanMood }) {
  switch (mood) {
    // A lopsided grin, the teeth light against the beard; talking keeps it.
    case 'happy':
    case 'talking':
      return (
        <path
          d="M43.5 64 Q50 69.5 57 62.5 Q50 65.5 43.5 64 Z"
          fill={MOUTH}
          stroke={MOUTH}
          strokeLinejoin="round"
          strokeWidth="1.2"
        />
      );
    case 'thinking':
      return <path {...STROKE} d="M46 65.5 Q50 64 54 66" stroke={MOUTH} strokeWidth={2} />;
    case 'idle':
      return <path {...STROKE} d="M45.5 65 L54.5 64.5" stroke={MOUTH} strokeWidth={2} />;
  }
}

/** One eye: small and dark, set deep under its brow. Blinks as one. */
function Eye({ x }: { x: number }) {
  return <ellipse className="caveman-eye" cx={x} cy="47" fill={LINE} rx="2.2" ry="2" />;
}

interface Props {
  className?: string;
  /** The face he makes: blinking at rest, bobbing while thinking, a hop when happy. */
  mood?: CavemanMood;
  outfit: CavemanOutfit;
  /** Rendered size in pixels. */
  size?: number;
}

/**
 * The caveman, the Caveguy, in an Agente's outfit on a stone slab of its ink (`data-bot` sets `--ink`).
 * A placeholder drawing until the final art: the files that replace it keep this component's props.
 */
export function Caveman({ className, mood = 'idle', outfit, size = 48 }: Props) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      aria-hidden
      className={cn('shrink-0', className)}
      data-mood={mood}
      height={size}
      // Inline, so a Button's own icon size never shrinks him.
      style={{ height: size, width: size }}
      viewBox="0 0 100 100"
      width={size}
    >
      <defs>
        {/* Roughs up every line, as if cut in stone with a blunt tool. */}
        <filter id={`rough-${id}`}>
          <feTurbulence
            baseFrequency="0.045"
            numOctaves="3"
            result="noise"
            seed="7"
            type="fractalNoise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" />
        </filter>
        {/* The grain of the rock: dark specks, faint. */}
        <filter id={`grain-${id}`}>
          <feTurbulence baseFrequency="0.9" numOctaves="2" seed="2" type="fractalNoise" />
          <feColorMatrix values="0 0 0 0 0.1 0 0 0 0 0.08 0 0 0 0 0.06 0 0 0 0.45 -0.12" />
        </filter>
        <clipPath id={`slab-${id}`}>
          <path d={SLAB} />
        </clipPath>
      </defs>
      <g filter={`url(#rough-${id})`}>
        {/* A stone slab in the Agente's ink, dulled toward the hide. */}
        <path
          d={SLAB}
          fill="color-mix(in oklch, var(--ink, var(--area-general)) 72%, var(--caveman-hide))"
          stroke={LINE}
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
        <g clipPath={`url(#slab-${id})`}>
          <rect filter={`url(#grain-${id})`} height="100" width="100" />
          {/* Cracks, and his tally on the wall. */}
          <path
            {...STROKE}
            d="M7 22 L14 27 L12 34 M91 66 L84 71 L87 78 M80 10 V21 M84 9 V20 M88 10 V21 M77 19 L91 12"
            strokeOpacity="0.45"
            strokeWidth={1.5}
          />
        </g>
        <g className="caveman-body" clipPath={`url(#slab-${id})`}>
          {/* A thick neck and broad bare shoulders. */}
          <path
            d="M8 104 C10 85 25 78 40 76 L40 66 L60 66 L60 76 C75 78 90 85 92 104 Z"
            fill="var(--caveman-skin)"
            stroke={LINE}
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          {/* The hide over one shoulder, cut ragged and laced with sinew. */}
          <path
            d="M24 104 L28 93 L34 88 L39 90 L44 82 L50 86 L55 79 L61 83 L67 78 C78 81 86 90 88 104 Z"
            fill="var(--caveman-hide)"
            stroke={LINE}
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          <path
            {...STROKE}
            d="M46 88 L50 92 M50 88 L46 92 M63 86 L67 90 M67 86 L63 90"
            strokeWidth={1.4}
          />
          {/* Ears. */}
          <g fill="var(--caveman-skin)" stroke={LINE} strokeWidth="2.2">
            <ellipse cx="29.5" cy="50" rx="4.5" ry="5.5" />
            <ellipse cx="70.5" cy="50" rx="4.5" ry="5.5" />
          </g>
          {/* The head: a heavy, square jaw. */}
          <path
            d="M31 44 C30 30 38 22 50 22 C62 22 70 30 69 44 L68 58 C66 68 59 73 50 73 C41 73 34 68 32 58 Z"
            fill="var(--caveman-skin)"
            stroke={LINE}
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          {/* A shaggy mop with no parting, low on the forehead. */}
          <path
            d="M28 46 C23 37 25 26 31 20 L28 13 L36 16 L38 8 L44 14 L50 6 L54 14 L61 8 L62 16 L71 12 L69 21 C76 26 78 37 72 46 L69 37 L65 35 L62 30 L58 34 L54 29 L50 33 L46 29 L42 34 L38 30 L35 35 L31 37 Z"
            fill={LINE}
            stroke={LINE}
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <Eye x={42.5} />
          <Eye x={57.5} />
          {/* Two heavy brows, apart, slanting down to the nose. */}
          <path
            d="M34.5 39.5 L41 37 L47.5 40.5 L46.5 42.8 L40.5 41 L35 42 Z M65.5 39.5 L59 37 L52.5 40.5 L53.5 42.8 L59.5 41 L65 42 Z"
            fill={LINE}
            stroke={LINE}
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
          {/* An old scar through the right brow. */}
          <path
            d="M59 35.5 L62.5 45"
            stroke="var(--caveman-skin)"
            strokeLinecap="round"
            strokeWidth="1.6"
          />
          {/* A full beard from the sideburns down, jagged at the edge. */}
          <path
            d="M31 44 L32 60 L35 68 L37 74 L41 81 L45.5 77 L50 84 L54.5 77 L59 81 L63 74 L65 68 L68 60 L69 44 L66 50 C64 56 61 59 57 59.5 C55 57.5 45 57.5 43 59.5 C39 59 36 56 34 50 Z"
            fill={LINE}
            stroke={LINE}
            strokeLinejoin="round"
            strokeWidth="1.2"
          />
          <path
            d="M40 61.5 Q45 56.5 50 59.5 Q55 56.5 60 61.5 Q55 63 50 62 Q45 63 40 61.5 Z"
            fill={LINE}
            stroke={LINE}
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          {/* A broad, flat nose. */}
          <path
            d="M47.5 46.5 L44.5 54.5 C44 57.5 47.5 58.5 50 57 C52.5 58.5 56 57.5 55.5 54.5 L52.5 46.5"
            fill="var(--caveman-skin)"
            stroke={LINE}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <Mouth mood={mood} />
          <Outfit outfit={outfit} />
        </g>
      </g>
    </svg>
  );
}
