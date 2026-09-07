import type { ChartPoint } from '@/src/features/stock/lib/indicators';

export interface DiagnosisItem {
    label: string;
    value: string;
    score: number;
}

export interface StockDiagnosis {
    items: DiagnosisItem[];
    totalScore: number;
    verdict: string;
}

const RSI_OVERBOUGHT = 70;
const RSI_OVERSOLD = 30;

function diagnoseRsi(point: ChartPoint): DiagnosisItem {
    const rsi = Math.round(point.rsi);

    if (point.rsi >= RSI_OVERBOUGHT) {
        return { label: 'RSI', value: `과매수권 (${rsi})`, score: -2 };
    }
    if (point.rsi <= RSI_OVERSOLD) {
        return { label: 'RSI', value: `과매도권 (${rsi})`, score: 2 };
    }
    return { label: 'RSI', value: `중립 (${rsi})`, score: 0 };
}

function diagnoseMacd(point: ChartPoint): DiagnosisItem {
    if (point.macd > 0) {
        return point.macd > point.signal
            ? { label: 'MACD', value: '0선 위 · 시그널 상회', score: 2 }
            : { label: 'MACD', value: '0선 위 · 시그널 하회', score: 1 };
    }
    return point.macd < point.signal
        ? { label: 'MACD', value: '0선 아래 · 시그널 하회', score: -2 }
        : { label: 'MACD', value: '0선 아래 · 시그널 상회', score: -1 };
}

function diagnoseMovingAverage(point: ChartPoint): DiagnosisItem {
    if (point.ma5 > point.ma20 && point.ma20 > point.ma60) {
        return { label: '이평선', value: '완전 정배열', score: 3 };
    }
    if (point.ma5 < point.ma20 && point.ma20 < point.ma60) {
        return { label: '이평선', value: '완전 역배열', score: -3 };
    }
    return { label: '이평선', value: '혼조', score: 0 };
}

function diagnoseBollingerPercentB(point: ChartPoint): DiagnosisItem {
    const bandWidth = point.ub - point.lb;
    if (bandWidth <= 0) {
        return { label: '볼린저(%B)', value: '밴드 내', score: 0 };
    }

    const percentB = (point.close - point.lb) / bandWidth;
    if (percentB >= 1) {
        return { label: '볼린저(%B)', value: `상단 이탈 (${percentB.toFixed(2)})`, score: -2 };
    }
    if (percentB <= 0) {
        return { label: '볼린저(%B)', value: `하단 이탈 (${percentB.toFixed(2)})`, score: 2 };
    }
    return { label: '볼린저(%B)', value: `밴드 내 (${percentB.toFixed(2)})`, score: 0 };
}

function diagnoseBollingerTrend(point: ChartPoint): DiagnosisItem {
    return point.close > point.ma20
        ? { label: '볼린저(추세)', value: '중심선 위 지지', score: 1 }
        : { label: '볼린저(추세)', value: '중심선 아래', score: -1 };
}

function toVerdict(totalScore: number): string {
    if (totalScore >= 4) return '매수 우위';
    if (totalScore <= -4) return '매도 우위';
    return '관망';
}

export function toDiagnosis(points: ChartPoint[]): StockDiagnosis | null {
    if (points.length < 60) {
        return null;
    }

    const latest = points[points.length - 1];
    const items = [
        diagnoseRsi(latest),
        diagnoseMacd(latest),
        diagnoseMovingAverage(latest),
        diagnoseBollingerPercentB(latest),
        diagnoseBollingerTrend(latest),
    ];
    const totalScore = items.reduce((sum, item) => sum + item.score, 0);

    return { items, totalScore, verdict: toVerdict(totalScore) };
}