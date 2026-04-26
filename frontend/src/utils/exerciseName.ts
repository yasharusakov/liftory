export const normalizeExerciseInput = (value: string): string => {
    return value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\s*\d+$/g, '')
        .trim()
}

const toTitleCase = (value: string): string => {
    return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

export const resolveCanonicalExerciseName = (
    rawValue: string,
    knownNamesByNormalized?: Map<string, string>
): string => {
    const normalized = normalizeExerciseInput(rawValue)

    if (!normalized) {
        return ''
    }

    if (knownNamesByNormalized?.has(normalized)) {
        return knownNamesByNormalized.get(normalized) as string
    }

    return toTitleCase(normalized)
}

