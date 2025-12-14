const fs = require('fs')
const path = require('path')

const coveragePath = path.join(
  __dirname,
  '..',
  'coverage',
  'coverage-final.json',
)

if (!fs.existsSync(coveragePath)) {
  console.error('Coverage file not found. Run npm run test:coverage first.')
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))

const results = []

for (const [file, coverage] of Object.entries(data)) {
  // Skip files outside src/
  if (!file.includes('/src/')) {
    continue
  }

  const uncoveredLines = new Set()

  // Collect uncovered statements
  for (const [id, count] of Object.entries(coverage.s)) {
    if (count === 0) {
      const mapping = coverage.statementMap[id]
      if (mapping) {
        for (let line = mapping.start.line; line <= mapping.end.line; line++) {
          uncoveredLines.add(line)
        }
      }
    }
  }

  // Collect uncovered branches
  for (const [id, counts] of Object.entries(coverage.b)) {
    counts.forEach((count, idx) => {
      if (count === 0) {
        const mapping = coverage.branchMap[id]
        if (mapping && mapping.locations && mapping.locations[idx]) {
          const loc = mapping.locations[idx]
          for (let line = loc.start.line; line <= loc.end.line; line++) {
            uncoveredLines.add(line)
          }
        }
      }
    })
  }

  if (uncoveredLines.size > 0) {
    const shortFile = file.replace(/.*\/src\//, 'src/')
    const sortedLines = [...uncoveredLines].sort((a, b) => a - b)

    // Group consecutive lines into ranges
    const ranges = []
    let rangeStart = sortedLines[0]
    let rangeEnd = sortedLines[0]

    for (let i = 1; i < sortedLines.length; i++) {
      if (sortedLines[i] === rangeEnd + 1) {
        rangeEnd = sortedLines[i]
      } else {
        ranges.push(
          rangeStart === rangeEnd
            ? `${rangeStart}`
            : `${rangeStart}-${rangeEnd}`,
        )
        rangeStart = sortedLines[i]
        rangeEnd = sortedLines[i]
      }
    }
    ranges.push(
      rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`,
    )

    // Calculate coverage percentage
    const totalStatements = Object.keys(coverage.s).length
    const coveredStatements = Object.values(coverage.s).filter(
      (v) => v > 0,
    ).length
    const pct =
      totalStatements > 0
        ? ((coveredStatements / totalStatements) * 100).toFixed(1)
        : '100.0'

    results.push({
      file: shortFile,
      pct: parseFloat(pct),
      lines: ranges.join(', '),
      count: uncoveredLines.size,
    })
  }
}

// Sort by coverage percentage (lowest first)
results.sort((a, b) => a.pct - b.pct)

if (results.length === 0) {
  console.log('\n✅ 100% coverage - no uncovered lines!\n')
} else {
  console.log('\n📊 Uncovered Lines Report\n')
  console.log('─'.repeat(100))

  for (const { file, pct, lines, count } of results) {
    const pctColor =
      pct >= 95 ? '\x1b[32m' : pct >= 80 ? '\x1b[33m' : '\x1b[31m'
    const reset = '\x1b[0m'
    console.log(`${pctColor}${pct.toFixed(1).padStart(5)}%${reset}  ${file}`)
    console.log(`        └─ ${count} uncovered line(s): ${lines}`)
    console.log()
  }

  console.log('─'.repeat(100))

  const totalUncovered = results.reduce((sum, r) => sum + r.count, 0)
  console.log(
    `Total: ${results.length} file(s) with ${totalUncovered} uncovered line(s)\n`,
  )
}
