// src/lib/format.ts

export function formatHeure(timeString: string): string {
    if (!timeString) return ''
    const [hour, minute] = timeString.split(':')
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  }
  