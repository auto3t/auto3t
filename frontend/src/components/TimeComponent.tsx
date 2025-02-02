interface TimeStampInterface {
  timestamp: string
}

const TimeComponent: React.FC<TimeStampInterface> = ({ timestamp }) => {
  if (!timestamp) return 'TBD'
  const date = new Date(timestamp)
  const now = new Date()
  const localDateString = date.toLocaleDateString()
  const localTimeString = date.toLocaleTimeString()
  const difference = date.getTime() - now.getTime()
  const differenceInDays = Math.ceil(difference / (1000 * 60 * 60 * 24))

  const calculateDifference = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    let years = end.getFullYear() - start.getFullYear()
    let months = end.getMonth() - start.getMonth()
    let days = end.getDate() - start.getDate()

    if (days < 0) {
      months -= 1
      days += new Date(end.getFullYear(), end.getMonth(), 0).getDate()
    }

    if (months < 0) {
      years -= 1
      months += 12
    }

    return { years, months, days }
  }

  let title = ''
  if (differenceInDays > 0) {
    const { years, months, days } = calculateDifference(now, date)
    if (years > 0) {
      title = `In ${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''}`
    } else if (months > 0) {
      title = `In ${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''}`
    } else {
      title = `In ${days} day${days !== 1 ? 's' : ''}`
    }
  } else if (differenceInDays === 0) {
    title = 'Today'
  } else {
    const { years, months, days } = calculateDifference(date, now)
    if (years > 0) {
      title = `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''} ago`
    } else if (months > 0) {
      title = `${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''} ago`
    } else {
      title = `${days} day${days !== 1 ? 's' : ''} ago`
    }
  }

  const displayDate =
    Math.abs(differenceInDays) > 30
      ? localDateString
      : `${localDateString}, ${localTimeString}`

  return <span title={title}>{displayDate}</span>
}

export default TimeComponent
