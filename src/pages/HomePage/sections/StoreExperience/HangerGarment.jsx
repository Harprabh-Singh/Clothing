const STROKE = 'rgba(242, 231, 208, 0.38)'

/**
 * Stylized garment hanging from a metal hanger.
 * type: 'hoodie' | 'jacket' | 'tee' | 'pants' | 'shorts' | 'cap' | 'beanie' | 'bag'
 */
function HangerGarment({ type = 'tee', tint = ['#2a2416', '#100c06'], tag = '#b6912e', uid }) {
  const gid = `hg-${uid}`

  const garment = (() => {
    switch (type) {
      case 'hoodie':
        return (
          <>
            <path d="M62 62 Q80 40 98 62" fill={`url(#${gid})`} stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
            <path
              d="M58 62 L40 72 L28 100 L44 108 L50 98 L50 168 L110 168 L110 98 L116 108 L132 100 L120 72 L102 62 L94 60 Q80 72 66 60 Z"
              fill={`url(#${gid})`}
              stroke={STROKE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect x="64" y="128" width="32" height="26" rx="4" fill="rgba(0,0,0,0.25)" stroke={STROKE} strokeWidth="2" />
          </>
        )
      case 'jacket':
        return (
          <>
            <path
              d="M58 62 L38 72 L26 102 L42 110 L48 100 L48 172 L112 172 L112 100 L118 110 L134 102 L122 72 L102 62 L94 58 L80 74 L66 58 Z"
              fill={`url(#${gid})`}
              stroke={STROKE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M80 74 L80 168" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
            <rect x="72" y="86" width="6" height="6" fill={tag} opacity="0.85" />
            <rect x="72" y="104" width="6" height="6" fill={tag} opacity="0.85" />
            <rect x="72" y="122" width="6" height="6" fill={tag} opacity="0.85" />
          </>
        )
      case 'pants':
        return (
          <>
            <rect x="50" y="60" width="60" height="14" rx="3" fill={`url(#${gid})`} stroke={STROKE} strokeWidth="3" />
            <path
              d="M50 74 L48 174 L74 174 L78 88 L82 88 L86 174 L112 174 L110 74 Z"
              fill={`url(#${gid})`}
              stroke={STROKE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect x="56" y="64" width="12" height="6" fill={tag} opacity="0.8" />
          </>
        )
      case 'shorts':
        return (
          <>
            <rect x="50" y="60" width="60" height="14" rx="3" fill={`url(#${gid})`} stroke={STROKE} strokeWidth="3" />
            <path
              d="M50 74 L48 122 L74 122 L78 86 L82 86 L86 122 L112 122 L110 74 Z"
              fill={`url(#${gid})`}
              stroke={STROKE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect x="56" y="64" width="12" height="6" fill={tag} opacity="0.8" />
          </>
        )
      case 'cap':
        return (
          <>
            <path d="M80 40 L80 62" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
            <path
              d="M52 100 Q52 64 80 64 Q108 64 108 100 Z"
              fill={`url(#${gid})`}
              stroke={STROKE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M50 100 L136 100 Q136 110 124 110 L50 110 Z"
              fill={`url(#${gid})`}
              stroke={STROKE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect x="72" y="78" width="16" height="10" rx="2" fill={tag} opacity="0.85" />
          </>
        )
      case 'beanie':
        return (
          <>
            <path d="M80 40 L80 60" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
            <path
              d="M54 116 Q54 66 80 66 Q106 66 106 116 Z"
              fill={`url(#${gid})`}
              stroke={STROKE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect x="52" y="108" width="56" height="16" rx="6" fill={`url(#${gid})`} stroke={STROKE} strokeWidth="3" />
            <path d="M62 108 L62 124 M74 108 L74 124 M86 108 L86 124 M98 108 L98 124" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
          </>
        )
      case 'bag':
        return (
          <>
            <path d="M64 96 Q80 44 96 96" fill="none" stroke={STROKE} strokeWidth="4" strokeLinecap="round" />
            <rect x="46" y="96" width="68" height="58" rx="10" fill={`url(#${gid})`} stroke={STROKE} strokeWidth="3" />
            <path d="M46 114 L114 114" stroke={STROKE} strokeWidth="2" />
            <rect x="70" y="120" width="20" height="12" rx="2" fill={tag} opacity="0.85" />
          </>
        )
      default: // tee
        return (
          <>
            <path
              d="M58 62 L40 72 L28 98 L44 106 L50 96 L50 154 L110 154 L110 96 L116 106 L132 98 L120 72 L102 62 L94 60 Q80 72 66 60 Z"
              fill={`url(#${gid})`}
              stroke={STROKE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect x="68" y="120" width="24" height="14" rx="2" fill={tag} opacity="0.85" />
          </>
        )
    }
  })()

  return (
    <svg viewBox="0 0 160 240" className="h-auto w-full" role="img" aria-label={`${type} on hanger`}>
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={tint[0]} />
          <stop offset="100%" stopColor={tint[1]} />
        </linearGradient>
      </defs>

      {/* hanger hook */}
      <path
        d="M80 34 L80 26 C80 18 92 18 92 26 C92 32 84 33 80 38"
        fill="none"
        stroke="rgba(217, 180, 91, 0.75)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* hanger bar */}
      <path
        d="M34 58 L80 38 L126 58"
        fill="none"
        stroke="rgba(217, 180, 91, 0.6)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {garment}
    </svg>
  )
}

export default HangerGarment
