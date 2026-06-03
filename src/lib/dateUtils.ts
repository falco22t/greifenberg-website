const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year',   365 * 24 * 60 * 60 * 1000],
  ['month',  30  * 24 * 60 * 60 * 1000],
  ['week',   7   * 24 * 60 * 60 * 1000],
  ['day',    24  * 60 * 60 * 1000],
  ['hour',   60  * 60 * 1000],
  ['minute', 60  * 1000],
  ['second', 1000],
]

const rtf = new Intl.RelativeTimeFormat('de', { numeric: 'auto' })

export function formatDistanceToNow(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  const elapsed = date.getTime() - Date.now()
  for (const [unit, ms] of UNITS) {
    if (Math.abs(elapsed) >= ms || unit === 'second') {
      return rtf.format(Math.round(elapsed / ms), unit)
    }
  }
  return 'gerade eben'
}

export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
