function GarmentArt({ view = 'front', imageSrc = '/images/garment.svg', imageOnly = false }) {
  const outline = 'rgba(247, 241, 220, 0.42)'
  const fill = 'url(#garmentFill)'
  const accent = 'rgba(255, 46, 0, 0.82)'

  const baseTransform = view === 'back' ? 'translate(420 0) scale(-1 1)' : 'translate(0 0)'
  const bodyViewBox = view === 'detail' ? 'translate(24 20) scale(1.06)' : 'translate(0 0)'

  if (imageOnly) {
    return (
      <svg viewBox="0 0 420 620" className="h-full w-full" role="img" aria-label="garment image">
        <image
          href={imageSrc}
          x="0"
          y="0"
          width="420"
          height="620"
          preserveAspectRatio="xMidYMid meet"
          style={{ imageRendering: 'auto' }}
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 420 620" className="h-full w-full" role="img" aria-label="VOLT/AGE garment silhouette">
      <defs>
        <linearGradient id="garmentFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-surface)" />
          <stop offset="100%" stopColor="var(--color-ink)" />
        </linearGradient>
        {/* clip path for masking raster images into the garment silhouette */}
        <clipPath id="garmentClip">
          <path d="M142 148L236 124L292 164L292 488L228 542L124 500L142 148Z" />
        </clipPath>
      </defs>

      <g transform={baseTransform}>
        <rect x="50" y="70" width="320" height="480" rx="44" fill="rgba(0,0,0,0.08)" />

        <g transform={bodyViewBox}>
          <path
            d="M142 148L236 124L292 164L292 488L228 542L124 500L142 148Z"
            fill={fill}
            stroke={outline}
            strokeWidth="6"
            strokeLinejoin="round"
          />

          <path
            d="M122 202C88 220 70 252 72 302L84 342L132 322L132 252Z"
            fill={fill}
            stroke={outline}
            strokeWidth="5"
            strokeLinejoin="round"
          />

          <path
            d="M292 164L346 206C364 246 360 300 332 332L292 304L292 164Z"
            fill={fill}
            stroke={outline}
            strokeWidth="5"
            strokeLinejoin="round"
          />

          <path
            d="M214 132L248 118L276 144L234 158Z"
            fill="rgba(255,255,255,0.16)"
            stroke={outline}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          <path
            d="M220 172L220 480"
            stroke={outline}
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M208 190L232 190L232 214L208 214Z"
            fill={accent}
            opacity="0.72"
          />
          <path
            d="M208 238L232 238L232 262L208 262Z"
            fill={accent}
            opacity="0.72"
          />
          <path
            d="M208 286L232 286L232 310L208 310Z"
            fill={accent}
            opacity="0.72"
          />
          <path
            d="M208 334L232 334L232 358L208 358Z"
            fill={accent}
            opacity="0.72"
          />
          <path
            d="M208 382L232 382L232 406L208 406Z"
            fill={accent}
            opacity="0.72"
          />

          {/*
            To use an image: put a high-resolution image in the app's public folder, e.g.
            public/images/garment.jpg and reference it below as '/images/garment.jpg'.
            Using a web path (not a filesystem path) avoids the browser trying to load
            a local file and prevents the pixelated results from scaling small raster assets.
          */}
          <image
            href={imageSrc}
            x="40"
            y="60"
            width="340"
            height="500"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#garmentClip)"
            style={{ imageRendering: 'auto' }}
          />

          {view === 'detail' ? (
            <>
              <rect x="96" y="96" width="228" height="130" rx="24" fill="rgba(0,0,0,0.14)" />
              <path d="M140 126C174 118 214 116 248 132" stroke={outline} strokeWidth="4" strokeLinecap="round" />
              <path d="M146 160C182 150 220 150 256 160" stroke={outline} strokeWidth="3" strokeLinecap="round" />
            </>
          ) : null}

          {view === 'back' ? (
            <rect x="104" y="170" width="204" height="118" rx="18" fill="rgba(255,255,255,0.12)" />
          ) : null}

          <text x="172" y="502" fill="rgba(247, 241, 220, 0.9)" fontFamily="'Space Mono', monospace" fontSize="17" letterSpacing="4" textAnchor="middle">
            RIOT SHELL
          </text>
          <text x="172" y="530" fill="rgba(255, 46, 0, 0.9)" fontFamily="'Space Mono', monospace" fontSize="16" letterSpacing="2" textAnchor="middle">
            $128
          </text>
          <text x="172" y="556" fill="rgba(247, 241, 220, 0.78)" fontFamily="'Space Mono', monospace" fontSize="12" letterSpacing="2" textAnchor="middle">
            MOTION / 004
          </text>
        </g>
      </g>
    </svg>
  )
}

export default GarmentArt
