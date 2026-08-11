export default function ProductVisual({ shape, tone, size = 64, className = '' }) {
  const common = { width: size, height: size, viewBox: '0 0 64 64', className }

  if (shape === 'box') {
    return (
      <svg {...common}>
        <rect x="8" y="16" width="48" height="38" rx="4" fill={tone} />
        <rect x="8" y="16" width="48" height="12" rx="4" fill="#C9A24B" opacity="0.85" />
        <line x1="32" y1="16" x2="32" y2="54" stroke="#FAF7F2" strokeWidth="2" opacity="0.5" />
      </svg>
    )
  }
  if (shape === 'jar') {
    return (
      <svg {...common}>
        <rect x="18" y="10" width="28" height="8" rx="2" fill="#C9A24B" />
        <path d="M16 20 h32 v30 a4 4 0 0 1 -4 4 h-24 a4 4 0 0 1 -4 -4 z" fill={tone} />
        <rect x="16" y="28" width="32" height="4" fill="#FAF7F2" opacity="0.3" />
      </svg>
    )
  }
  if (shape === 'praline') {
    return (
      <svg {...common}>
        <circle cx="32" cy="32" r="22" fill={tone} />
        <path d="M18 32 q14 -14 28 0" stroke="#C9A24B" strokeWidth="2.5" fill="none" opacity="0.8" />
      </svg>
    )
  }
  // default: bar
  return (
    <svg {...common}>
      <rect x="8" y="12" width="48" height="40" rx="6" fill={tone} stroke="#C9A24B" strokeOpacity="0.4" strokeWidth="1.5" />
      <line x1="32" y1="12" x2="32" y2="52" stroke="#FAF7F2" strokeOpacity="0.35" strokeWidth="1.5" />
      <line x1="8" y1="32" x2="56" y2="32" stroke="#FAF7F2" strokeOpacity="0.35" strokeWidth="1.5" />
    </svg>
  )
}
