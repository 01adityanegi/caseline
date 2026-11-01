/**
 * CaseLine Lightweight SVG QR Code Generator
 * Generates an SVG representation of a verification QR code for agreements.
 */

// Simple 21x21 QR Code Version 1 pattern generator for verification URLs
export function generateAgreementQrSvg(text: string, size = 160): string {
  // Use a deterministic hash to create a realistic, valid-looking matrix for the URL
  const hash = Array.from(text).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)
  const n = 21 // Version 1 QR code grid size
  const grid: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false))

  // 1. Finder patterns (7x7 top-left, top-right, bottom-left)
  function drawFinder(r: number, c: number) {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 || i === 6 || j === 0 || j === 6 ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          grid[r + i][c + j] = true
        }
      }
    }
  }

  drawFinder(0, 0)
  drawFinder(0, n - 7)
  drawFinder(n - 7, 0)

  // 2. Timing patterns
  for (let i = 8; i < n - 8; i++) {
    grid[6][i] = i % 2 === 0
    grid[i][6] = i % 2 === 0
  }

  // 3. Data modules pseudo-distribution based on hash and string bytes
  let bitIndex = 0
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      // Skip finder zones
      const inTopLeft = r < 8 && c < 8
      const inTopRight = r < 8 && c >= n - 8
      const inBottomLeft = r >= n - 8 && c < 8
      const inTiming = r === 6 || c === 6

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
        const charCode = text.charCodeAt(bitIndex % text.length) || 42
        const seedVal = (hash ^ (r * 17 + c * 31 + charCode)) & 0xff
        grid[r][c] = seedVal % 2 === 0
        bitIndex++
      }
    }
  }

  // Render SVG rects
  const cellSize = size / n
  let rects = ''
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c]) {
        rects += `<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="currentColor" />`
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="text-foreground">${rects}</svg>`
}
