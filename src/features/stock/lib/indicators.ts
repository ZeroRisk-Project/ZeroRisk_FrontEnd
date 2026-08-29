import type { ChartCandleResponse } from '@/src/features/stock/api/stock';

export interface ChartPoint {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    ma5: number;
    ma20: number;
    ma60: number;
    ub: number;
    lb: number;
    rsi: number;
    macd: number;
    signal: number;
    hist: number;
}

const BOLLINGER_PERIOD = 20;
const BOLLINGER_MULTIPLIER = 2;
const RSI_PERIOD = 14;
const MACD_SHORT_PERIOD = 12;
const MACD_LONG_PERIOD = 26;
const MACD_SIGNAL_PERIOD = 9;

function formatDate(dateTime: string): string {
    const year = dateTime.slice(0, 4);
    const month = dateTime.slice(4, 6);
    const day = dateTime.slice(6, 8);
    if (dateTime.length <= 8) {
        return `${year}.${month}.${day}`;
    }
    return `${month}.${day} ${dateTime.slice(8, 10)}:${dateTime.slice(10, 12)}`;
}

function movingAverage(values: number[], period: number): number[] {
    return values.map((_, index) => {
        const start = Math.max(0, index - period + 1);
        const window = values.slice(start, index + 1);
        return window.reduce((sum, value) => sum + value, 0) / window.length;
    });
}

function standardDeviation(values: number[], period: number): number[] {
    return values.map((_, index) => {
        const start = Math.max(0, index - period + 1);
        const window = values.slice(start, index + 1);
        const mean = window.reduce((sum, value) => sum + value, 0) / window.length;
        const variance = window.reduce((sum, value) => sum + (value - mean) ** 2, 0) / window.length;
        return Math.sqrt(variance);
    });
}

function exponentialMovingAverage(values: number[], period: number): number[] {
    const multiplier = 2 / (period + 1);
    const result: number[] = [];
    values.forEach((value, index) => {
        if (index === 0) {
            result.push(value);
            return;
        }
        result.push(value * multiplier + result[index - 1] * (1 - multiplier));
    });
    return result;
}

function relativeStrengthIndex(closes: number[], period: number): number[] {
    const result: number[] = [];
    let averageGain = 0;
    let averageLoss = 0;

    closes.forEach((close, index) => {
        if (index === 0) {
            result.push(50);
            return;
        }

        const change = close - closes[index - 1];
        const gain = Math.max(change, 0);
        const loss = Math.max(-change, 0);

        if (index <= period) {
            averageGain = (averageGain * (index - 1) + gain) / index;
            averageLoss = (averageLoss * (index - 1) + loss) / index;
        } else {
            averageGain = (averageGain * (period - 1) + gain) / period;
            averageLoss = (averageLoss * (period - 1) + loss) / period;
        }

        if (averageLoss === 0) {
            result.push(averageGain === 0 ? 50 : 100);
            return;
        }

        const relativeStrength = averageGain / averageLoss;
        result.push(100 - 100 / (1 + relativeStrength));
    });

    return result;
}

export function toChartPoints(candles: ChartCandleResponse[]): ChartPoint[] {
    const ordered = [...candles].sort((a, b) => a.dateTime.localeCompare(b.dateTime));
    const closes = ordered.map((candle) => candle.close);

    const ma5 = movingAverage(closes, 5);
    const ma20 = movingAverage(closes, BOLLINGER_PERIOD);
    const ma60 = movingAverage(closes, 60);
    const deviation = standardDeviation(closes, BOLLINGER_PERIOD);

    const shortEma = exponentialMovingAverage(closes, MACD_SHORT_PERIOD);
    const longEma = exponentialMovingAverage(closes, MACD_LONG_PERIOD);
    const macd = shortEma.map((value, index) => value - longEma[index]);
    const signal = exponentialMovingAverage(macd, MACD_SIGNAL_PERIOD);

    const rsi = relativeStrengthIndex(closes, RSI_PERIOD);

    return ordered.map((candle, index) => ({
        date: formatDate(candle.dateTime),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
        ma5: ma5[index],
        ma20: ma20[index],
        ma60: ma60[index],
        ub: ma20[index] + deviation[index] * BOLLINGER_MULTIPLIER,
        lb: ma20[index] - deviation[index] * BOLLINGER_MULTIPLIER,
        rsi: rsi[index],
        macd: macd[index],
        signal: signal[index],
        hist: macd[index] - signal[index],
    }));
}