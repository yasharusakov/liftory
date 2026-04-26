export const formatSessionDate = (utcString: string): string => {
    const date = new Date(utcString)
    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })
}

export const formatLocalTime = (utcString: string): string => {
    const date = new Date(utcString)
    return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
}

export const formatRecordDateTime = (utcString: string): string => {
    const date = new Date(utcString)
    return date.toLocaleDateString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour12: false
    })
}

