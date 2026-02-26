// loose collectio of util functions

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === 0) return '0 Bytes'
  if (!bytes) return ''
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatBitrate(bitrate: number | null | undefined): string {
  if (!bitrate) return ''

  const units = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps']
  let unitIndex = 0
  while (bitrate >= 1000 && unitIndex < units.length - 1) {
    bitrate /= 1000
    unitIndex++
  }
  const formattedBitrate = bitrate.toFixed(2)

  return `${formattedBitrate} ${units[unitIndex]}`
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return ''

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (remainingSeconds > 0 || parts.length === 0)
    parts.push(`${remainingSeconds}s`)

  return parts.join(' ')
}

export function formatResolution(
  width: number | null | undefined,
  height: number | null | undefined,
): string {
  if (!width || !height) return ''
  return `${width}x${height}`
}
