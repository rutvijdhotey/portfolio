// components/LaCuriosityPipeline.tsx

const TYPE: Record<string, { fill: string; stroke: string }> = {
  trigger: { fill: '#F5C84212', stroke: '#F5C842' },
  search:  { fill: '#4BA3D412', stroke: '#4BA3D4' },
  claude:  { fill: '#D4834B12', stroke: '#D4834B' },
  gemini:  { fill: '#4B8BD412', stroke: '#4B8BD4' },
  tools:   { fill: '#6A7A7A12', stroke: '#6A7A7A' },
  storage: { fill: '#3ECF8E12', stroke: '#3ECF8E' },
  publish: { fill: '#FF6B3512', stroke: '#FF6B35' },
  router:  { fill: '#C44BD412', stroke: '#C44BD4' },
  writer:  { fill: '', stroke: '' },
}

const PILLARS = [
  { name: 'Physical World', col: '#E8935A', writer: 'Physical World Writer' },
  { name: 'Human Mind',     col: '#9B7FD4', writer: 'Human Mind Writer'    },
  { name: 'The Construct',  col: '#5B9BD4', writer: 'Construct Writer'     },
  { name: 'The Abstract',   col: '#D45B9B', writer: 'Abstract Writer'      },
  { name: 'The Planet',     col: '#5BD47A', writer: 'Planet Writer'        },
]

const RESEARCH = [
  { label: 'Schedule',      sub: 'Daily trigger',       type: 'trigger' },
  { label: 'News Search',   sub: 'Tavily · news angle', type: 'search'  },
  { label: 'Reddit Search', sub: 'Trending signals',    type: 'search'  },
  { label: 'Demand Signal', sub: 'Search demand',       type: 'search'  },
  { label: 'Topic Synth',   sub: 'Claude · summarise',  type: 'claude'  },
  { label: 'Var Builder',   sub: 'Format variables',    type: 'tools'   },
  { label: 'Context Pack',  sub: 'Bundle payload',      type: 'tools'   },
]

const STEPS = [
  { label: 'Pillar Writer',  sub: 'Claude · draft article',     type: 'writer'  },
  { label: 'Fact Checker',   sub: 'Claude · verify facts',      type: 'claude'  },
  { label: 'Set Variables',  sub: 'Extract title / tags',       type: 'tools'   },
  { label: 'Ref. Search 1',  sub: 'Tavily · academic',          type: 'search'  },
  { label: 'Ref. Search 2',  sub: 'Tavily · news sources',      type: 'search'  },
  { label: 'Ref. Search 3',  sub: 'Tavily · supporting data',   type: 'search'  },
  { label: 'Ref. Generator', sub: 'Claude · compile citations', type: 'claude'  },
  { label: 'Art Director',   sub: 'Claude · image brief',       type: 'claude'  },
  { label: 'Image Gen',      sub: 'Gemini · generate art',      type: 'gemini'  },
  { label: 'Store Image',    sub: 'Supabase · upload file',     type: 'storage' },
  { label: 'Publish Post',   sub: 'Ghost · create article',     type: 'publish' },
  { label: 'Log Entry',      sub: 'Supabase · record row',      type: 'storage' },
]

// Layout constants
const RNW = 128, RNH = 42, RSPC = 144
const r0x = 550 - ((RESEARCH.length - 1) * RSPC) / 2  // 118
const RY = 110
const ROUTX = 550, ROUTY = 240
const RDW = 110, RDH = 44
const COL_CENTERS = [112, 310, 508, 706, 904]
const CNW = 162, CNH = 30, STEP_H = 38
const GRID_TOP = 410
const GRID_HEADER_Y = 378
const footerY = GRID_TOP + STEPS.length * STEP_H + 36  // 902
const SVG_H = footerY + 22  // 924

function arrowPts(x1: number, y1: number, x2: number, y2: number, s = 6): string {
  const ang = Math.atan2(y2 - y1, x2 - x1)
  return [
    `${x2},${y2}`,
    `${x2 - s * Math.cos(ang - 0.45)},${y2 - s * Math.sin(ang - 0.45)}`,
    `${x2 - s * Math.cos(ang + 0.45)},${y2 - s * Math.sin(ang + 0.45)}`,
  ].join(' ')
}

export default function LaCuriosityPipeline() {
  const lastRX = r0x + (RESEARCH.length - 1) * RSPC  // 982

  return (
    <svg
      width="1100"
      height={SVG_H}
      xmlns="http://www.w3.org/2000/svg"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', display: 'block' }}
    >
      {/* ── Phase 1 background + label ── */}
      <rect x={30} y={RY - 32} width={1040} height={RNH + 20} rx={8} fill="#0E0E0E" stroke="#1C1C1C" />
      <text x={40} y={RY - 44} fill="#444" fontSize={10} textAnchor="start" dominantBaseline="middle" fontWeight={700}>
        PHASE 01  ·  RESEARCH &amp; DISCOVERY
      </text>

      {/* ── Research nodes + inter-node arrows ── */}
      {RESEARCH.map((n, i) => {
        const cx = r0x + i * RSPC
        const c = TYPE[n.type]
        const prevCx = r0x + (i - 1) * RSPC
        return (
          <g key={n.label}>
            {i > 0 && (
              <>
                <line
                  x1={prevCx + RNW / 2} y1={RY}
                  x2={cx - RNW / 2}     y2={RY}
                  stroke="#2E2E2E" strokeWidth={1.5} strokeDasharray="5,4"
                />
                <polygon points={arrowPts(prevCx + RNW / 2, RY, cx - RNW / 2, RY)} fill="#2E2E2E" />
              </>
            )}
            <rect x={cx - RNW / 2} y={RY - RNH / 2} width={RNW} height={RNH} rx={6} fill={c.fill} stroke={c.stroke} strokeWidth={1.2} />
            <text x={cx} y={RY - 7}  fill="#E0E0E0" fontSize={10.5} textAnchor="middle" dominantBaseline="middle" fontWeight={600}>{n.label}</text>
            <text x={cx} y={RY + 7}  fill="#777"    fontSize={8.5}  textAnchor="middle" dominantBaseline="middle">{n.sub}</text>
          </g>
        )
      })}

      {/* ── Elbow connector: last research node → router ── */}
      <polyline
        points={`${lastRX},${RY + RNH / 2} ${lastRX},${ROUTY - 10} ${ROUTX},${ROUTY - 10} ${ROUTX},${ROUTY - 24}`}
        fill="none" stroke="#282828" strokeWidth={1.5} strokeDasharray="5,4"
      />
      <polygon points={`${ROUTX},${ROUTY - 22} ${ROUTX - 4},${ROUTY - 30} ${ROUTX + 4},${ROUTY - 30}`} fill="#282828" />

      {/* ── Phase 2 label ── */}
      <text x={40} y={ROUTY - 54} fill="#444" fontSize={10} textAnchor="start" dominantBaseline="middle" fontWeight={700}>
        PHASE 02  ·  PILLAR ROUTING
      </text>

      {/* ── Router diamond ── */}
      <polygon
        points={`${ROUTX},${ROUTY - RDH / 2} ${ROUTX + RDW / 2},${ROUTY} ${ROUTX},${ROUTY + RDH / 2} ${ROUTX - RDW / 2},${ROUTY}`}
        fill={TYPE.router.fill} stroke={TYPE.router.stroke} strokeWidth={1.5}
      />
      <text x={ROUTX} y={ROUTY - 6} fill="#C44BD4" fontSize={10} textAnchor="middle" dominantBaseline="middle" fontWeight={700}>CONTENT ROUTER</text>
      <text x={ROUTX} y={ROUTY + 8} fill="#666"    fontSize={8.5} textAnchor="middle" dominantBaseline="middle">5 parallel streams</text>

      {/* ── Phase 3 label ── */}
      <text x={40} y={GRID_HEADER_Y - 28} fill="#444" fontSize={10} textAnchor="start" dominantBaseline="middle" fontWeight={700}>
        PHASE 03  ·  PARALLEL CONTENT GENERATION  (×5 simultaneous)
      </text>

      {/* ── Fan-out lines from router to column headers ── */}
      {COL_CENTERS.map((cx, i) => {
        const col = PILLARS[i].col + '70'
        return (
          <g key={`fanout-${i}`}>
            <line
              x1={ROUTX} y1={ROUTY + RDH / 2}
              x2={cx}    y2={GRID_HEADER_Y - 14}
              stroke={col} strokeWidth={1.5} strokeDasharray="5,4"
            />
            <polygon points={`${cx},${GRID_HEADER_Y - 12} ${cx - 4},${GRID_HEADER_Y - 20} ${cx + 4},${GRID_HEADER_Y - 20}`} fill={col} />
          </g>
        )
      })}

      {/* ── Column headers + guide lines ── */}
      {COL_CENTERS.map((cx, i) => {
        const p = PILLARS[i]
        return (
          <g key={`header-${i}`}>
            <rect
              x={cx - CNW / 2} y={GRID_HEADER_Y - 2}
              width={CNW} height={26} rx={5}
              fill={p.col + '20'} stroke={p.col} strokeWidth={1.5}
            />
            <text x={cx} y={GRID_HEADER_Y + 11} fill={p.col} fontSize={10.5} textAnchor="middle" dominantBaseline="middle" fontWeight={700}>
              {p.name}
            </text>
            <line
              x1={cx} y1={GRID_HEADER_Y + 26}
              x2={cx} y2={GRID_TOP + STEPS.length * STEP_H - 4}
              stroke={p.col + '18'} strokeWidth={1}
            />
          </g>
        )
      })}

      {/* ── Alternating row backgrounds (rendered before nodes so they don't overlap) ── */}
      {STEPS.map((_, i) => {
        if (i % 2 !== 0) return null
        const y = GRID_TOP + i * STEP_H
        return (
          <rect key={`rowbg-${i}`} x={60} y={y - CNH / 2 - 2} width={980} height={STEP_H - 2} rx={3} fill="#0C0C0C" stroke="none" />
        )
      })}

      {/* ── Left-axis step numbers ── */}
      {STEPS.map((_, i) => {
        const y = GRID_TOP + i * STEP_H + STEP_H / 2 - 1
        return (
          <text key={`laxis-${i}`} x={54} y={y} fill="#3A3A3A" fontSize={9} textAnchor="end" dominantBaseline="middle" fontWeight={400}>
            {String(i + 1).padStart(2, '0')}
          </text>
        )
      })}

      {/* ── Grid nodes ── */}
      {STEPS.map((step, i) => {
        const cy = GRID_TOP + i * STEP_H + STEP_H / 2 - 1
        return (
          <g key={`step-${i}`}>
            {COL_CENTERS.map((cx, ci) => {
              const p = PILLARS[ci]
              const c = step.type === 'writer'
                ? { fill: p.col + '20', stroke: p.col }
                : (TYPE[step.type] || TYPE.tools)
              const labelText = step.type === 'writer' ? p.writer : step.label
              const subColor  = step.type === 'writer' ? p.col + 'CC' : '#585858'

              const y1 = cy + CNH / 2 + 1
              const y2 = GRID_TOP + (i + 1) * STEP_H + STEP_H / 2 - 1 - CNH / 2 - 1

              return (
                <g key={`node-${i}-${ci}`}>
                  <rect x={cx - CNW / 2} y={cy - CNH / 2} width={CNW} height={CNH} rx={5} fill={c.fill} stroke={c.stroke} strokeWidth={1} />
                  <text x={cx} y={cy - 4} fill="#DEDEDE" fontSize={9.5} textAnchor="middle" dominantBaseline="middle" fontWeight={600}>{labelText}</text>
                  <text x={cx} y={cy + 7} fill={subColor} fontSize={7.5}  textAnchor="middle" dominantBaseline="middle">{step.sub}</text>
                  {i < STEPS.length - 1 && (
                    <>
                      <line x1={cx} y1={y1} x2={cx} y2={y2} stroke={p.col + '35'} strokeWidth={1} />
                      <polygon points={`${cx},${y2 + 2} ${cx - 3},${y2 - 4} ${cx + 3},${y2 - 4}`} fill={p.col + '35'} />
                    </>
                  )}
                </g>
              )
            })}
          </g>
        )
      })}

      {/* ── Right-axis step labels ── */}
      {STEPS.map((step, i) => {
        const y = GRID_TOP + i * STEP_H + STEP_H / 2 - 1
        return (
          <text key={`raxis-${i}`} x={1052} y={y} fill="#3A3A3A" fontSize={8.5} textAnchor="start" dominantBaseline="middle">
            {step.label}
          </text>
        )
      })}

      {/* ── Footer ── */}
      <line x1={60} y1={footerY - 20} x2={1040} y2={footerY - 20} stroke="#1A1A1A" strokeWidth={1} />
      <text x={550} y={footerY} fill="#333" fontSize={9.5} textAnchor="middle" dominantBaseline="middle">
        lacuriosity.com  ·  Automated pipeline built on Make.com  ·  Publishes one fact-checked article daily across 5 content pillars
      </text>
    </svg>
  )
}
