export const normalizeText = (text: string) => {
  if (!text) return ''
  // Normalize unicode and replace smart quotes/dashes with ASCII equivalents
  let s = text
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐‑–—]/g, '-') // various dashes to hyphen
    .toLowerCase()

  // Keep letters, numbers, apostrophes as part of words; everything else to space
  s = s.replace(/[^a-z0-9'\-\s]+/g, ' ')
  // Treat hyphens as separators for simplicity
  s = s.replace(/-/g, ' ')
  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

export const tokenize = (text: string): string[] => {
  const n = normalizeText(text)
  if (!n) return []
  return n.split(' ').filter(Boolean)
}

// Longest Common Subsequence alignment between two token arrays
export const lcsAlign = (a: string[], b: string[]) => {
  const n = a.length
  const m = b.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  // Reconstruct matched index pairs
  const pairs: Array<[number, number]> = []
  let i = 0, j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      pairs.push([i, j])
      i++; j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  return { length: dp[0][0], pairs }
}

export const computeAccuracy = (target: string, spoken: string): number => {
  const t = tokenize(target)
  const s = tokenize(spoken)
  if (!t.length) return 0
  const { length } = lcsAlign(t, s)
  // Score relative to target length to penalize missing words
  return Math.round((length / t.length) * 100)
}

export const targetMatchMask = (target: string, spoken: string): boolean[] => {
  const t = tokenize(target)
  const s = tokenize(spoken)
  const mask = new Array<boolean>(t.length).fill(false)
  if (!t.length || !s.length) return mask
  const { pairs } = lcsAlign(t, s)
  for (const [ti] of pairs) mask[ti] = true
  return mask
}

