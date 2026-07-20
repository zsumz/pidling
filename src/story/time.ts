const NUMBER_WORDS = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
] as const;

export function formatElapsed(startedAt: number, now: number): string {
    const totalSeconds = elapsedSeconds(startedAt, now);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor(totalSeconds / 60) % 60).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

export function formatFinalElapsed(startedAt: number, now: number): string {
    const elapsed = formatElapsed(startedAt, now);

    return elapsed === '00:00:00' ? 'one complete run' : elapsed;
}

export function agePhrase(startedAt: number, now: number): string {
    const totalSeconds = elapsedSeconds(startedAt, now);

    if (totalSeconds === 0) {
        return 'less than one second';
    }

    if (totalSeconds < 60) {
        return quantity(totalSeconds, 'second');
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const minuteText = quantity(minutes, 'minute');

    return seconds === 0 ? minuteText : `${minuteText} and ${quantity(seconds, 'second')}`;
}

function elapsedSeconds(startedAt: number, now: number): number {
    return Math.max(0, Math.floor((now - startedAt) / 1000));
}

function quantity(value: number, unit: string): string {
    const amount = NUMBER_WORDS[value] ?? String(value);
    return `${amount} ${unit}${value === 1 ? '' : 's'}`;
}
