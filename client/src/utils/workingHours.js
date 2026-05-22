export const WORKING_HOURS_DAYS = [
  { key: 'monday', label: 'Monday', shortLabel: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
  { key: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
  { key: 'friday', label: 'Friday', shortLabel: 'Fri' },
  { key: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
  { key: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
]

export const WORKING_HOURS_WEEKDAYS = WORKING_HOURS_DAYS.slice(0, 5)

const DEFAULT_WEEKDAY_TIME = '9:00 AM - 6:00 PM'

function normalizeDayName(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

function dayFromName(value) {
  const normalized = normalizeDayName(value)
  return WORKING_HOURS_DAYS.find((day) => {
    return normalized === day.key || normalized === day.shortLabel.toLowerCase()
  })
}

export function createDefaultWorkingHoursMap() {
  return WORKING_HOURS_DAYS.reduce((acc, day) => {
    acc[day.key] = day.key === 'sunday' ? 'Closed' : DEFAULT_WEEKDAY_TIME
    return acc
  }, {})
}

export function parseWorkingHours(value) {
  const raw = String(value || '').trim()
  const result = createDefaultWorkingHoursMap()
  if (!raw) return result

  const parsed = raw
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([^:]+):\s*(.*)$/)
      if (!match) return null
      const day = dayFromName(match[1])
      if (!day) return null
      return { key: day.key, time: match[2].trim() }
    })
    .filter(Boolean)

  if (parsed.length) {
    parsed.forEach(({ key, time }) => {
      result[key] = time
    })
    return result
  }

  const weekdayTime =
    raw.replace(/^(mon|monday)\s*[-–]\s*(fri|friday)\s*:?\s*/i, '').trim() || raw

  WORKING_HOURS_DAYS.forEach((day) => {
    result[day.key] = day.key === 'saturday' || day.key === 'sunday' ? 'Closed' : weekdayTime
  })

  return result
}

export function serializeWorkingHours(hoursMap) {
  const source = hoursMap || createDefaultWorkingHoursMap()
  return WORKING_HOURS_DAYS
    .map((day) => {
      const time = source[day.key] == null ? '' : String(source[day.key]).trim()
      return `${day.label}: ${time}`
    })
    .join('\n')
}

export function getWorkingHoursRows(value) {
  const hoursMap = parseWorkingHours(value)
  return WORKING_HOURS_DAYS.map((day) => ({
    ...day,
    time: hoursMap[day.key] == null ? '' : String(hoursMap[day.key]).trim(),
  }))
}
