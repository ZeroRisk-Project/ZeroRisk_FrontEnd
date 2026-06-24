import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Clock,
  MessageSquare,
  ThumbsUp,
  Share2,
  ChevronRight,
  UserPlus,
  Sparkles,
  CheckCircle,
  Calendar,
  X,
  Plus,
  Compass,
  Maximize2,
  Award,
  Medal,
  Activity,
  History,
  TrendingUp as IconTrendingUp,
  User as IconUser,
  ArrowLeft,
  Info,
} from "lucide-react";
import { cn, formatPrice } from "@/src/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const PIE_COLORS = [
  "#1CBC9A",
  "#3B82F6",
  "#EF4444",
  "#F59E0B",
  "#8B5CF6",
  "#10B981",
  "#EC4899",
];

// Profile Interfaces
interface UserProfile {
  id: number;
  nickname: string;
  avatar: string;
  level: string;
  joinedAt: string;
  badges: string[];
  totalPosts: number;
  totalComments: number;
  totalLikesReceived: number;

  // Invest Stats
  totalReturn: number;
  totalAssets: number;
  totalOrders: number;
  winRate: number;

  // Portfolios
  portfolio: {
    stockName: string;
    ratio: number;
    returnRate: number;
    evalAmount: number;
  }[];

  // Comp Record
  competitions: {
    title: string;
    period: string;
    seedMoney: number;
    rank: string;
    returnRate: number;
    gainLoss: number;
    isAward: boolean;
    status?: "진행중" | "종료" | "예정";
  }[];

  // Recent trade
  trades: {
    date: string;
    stockName: string;
    type: "매수" | "매도";
    price: number;
    amount: number;
    gainLoss?: number;
  }[];

  // Frequently traded
  frequentStocks: { name: string; count: number }[];

  // Posts
  posts: {
    id: number;
    title: string;
    views: number;
    likes: number;
    comments: number;
    date: string;
  }[];

  // Comments
  comments: {
    id: number;
    content: string;
    postTitle: string;
    date: string;
    boardName: string;
    likes: number;
    replies: number;
  }[];
}

// Global Mock Database for Profiles
const PROFILES: Record<string, UserProfile> = {
  "2": {
    id: 2,
    nickname: "투자왕김철수",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120",
    level: "Lv.7 전문가",
    joinedAt: "2026.01.15 가입",
    badges: [
      "🏆 단타왕",
      "💎 투자고수",
      "👑 인기유저",
      "🔥 수익률 50% 달성",
      "⚡ 수익률 100% 달성",
    ],
    totalPosts: 34,
    totalComments: 245,
    totalLikesReceived: 1402,

    totalReturn: 47.3,
    totalAssets: 14728500,
    totalOrders: 284,
    winRate: 68,

    portfolio: [
      {
        stockName: "삼성전자",
        ratio: 45,
        returnRate: 15.6,
        evalAmount: 6627800,
      },
      {
        stockName: "SK하이닉스",
        ratio: 30,
        returnRate: 98.4,
        evalAmount: 4418500,
      },
      {
        stockName: "현대자동차",
        ratio: 15,
        returnRate: -4.5,
        evalAmount: 2209250,
      },
      { stockName: "NAVER", ratio: 10, returnRate: 12.0, evalAmount: 1472950 },
    ],

    competitions: [
      {
        title: "대구 게릴라 고수 6월 서머 투자 매치",
        period: "2026-06-01 ~ 2026-06-15",
        seedMoney: 10000000,
        rank: "1위",
        returnRate: 47.3,
        gainLoss: 4730000,
        isAward: true,
      },
      {
        title: "제14회 전국 모의 투자 패스티벌 일반부",
        period: "2026-04-10 ~ 2026-05-10",
        seedMoney: 30000000,
        rank: "2위",
        returnRate: 31.2,
        gainLoss: 9360000,
        isAward: true,
      },
      {
        title: "리스크 관리 특화 연마 투자 축제",
        period: "2026-03-01 ~ 2026-03-25",
        seedMoney: 50000000,
        rank: "14위 / 120명",
        returnRate: 8.5,
        gainLoss: 4250000,
        isAward: false,
      },
    ],

    trades: [
      {
        date: "2026.06.16",
        stockName: "삼성전자",
        type: "매수",
        price: 75400,
        amount: 50,
      },
      {
        date: "2026.06.16",
        stockName: "SK하이닉스",
        type: "매도",
        price: 188400,
        amount: 20,
        gainLoss: 880000,
      },
      {
        date: "2026.06.15",
        stockName: "현대자동차",
        type: "매수",
        price: 242000,
        amount: 10,
      },
      {
        date: "2026.06.15",
        stockName: "삼성전자",
        type: "매도",
        price: 76000,
        amount: 40,
        gainLoss: 240000,
      },
      {
        date: "2026.06.14",
        stockName: "NAVER",
        type: "매수",
        price: 172000,
        amount: 15,
      },
      {
        date: "2026.06.13",
        stockName: "SK하이닉스",
        type: "매수",
        price: 179000,
        amount: 35,
      },
      {
        date: "2026.06.12",
        stockName: "기아",
        type: "매도",
        price: 112000,
        amount: 30,
        gainLoss: 360000,
      },
      {
        date: "2026.06.11",
        stockName: "현대자동차",
        type: "매도",
        price: 238000,
        amount: 12,
        gainLoss: -24000,
      },
      {
        date: "2026.06.10",
        stockName: "삼성전자",
        type: "매수",
        price: 74800,
        amount: 100,
      },
    ],

    frequentStocks: [
      { name: "삼성전자", count: 88 },
      { name: "SK하이닉스", count: 64 },
      { name: "현대자동차", count: 42 },
      { name: "NAVER", count: 28 },
      { name: "기아", count: 14 },
    ],

    posts: [
      {
        id: 101,
        title: "주식 초보들을 위한 기업 평가 가이드 총집편 1부",
        views: 1242,
        likes: 98,
        comments: 14,
        date: "2026.05.28",
      },
      {
        id: 102,
        title: "반도체 공급망 현안과 SK하이닉스 추매 시점 분석",
        views: 984,
        likes: 72,
        comments: 11,
        date: "2026.06.04",
      },
      {
        id: 103,
        title: "단타 하루 30만원 번 매매 복기 및 타점 인증합니다",
        views: 812,
        likes: 64,
        comments: 8,
        date: "2026.06.12",
      },
      {
        id: 104,
        title: "코스피 2700 지선 붕괴 우려 대비 하락장 헷징 방안",
        views: 524,
        likes: 31,
        comments: 4,
        date: "2026.06.15",
      },
    ],

    comments: [
      {
        id: 251,
        content: "좋은 분석 감사합니다. 다음 분기 가이던스도 기대되네요.",
        postTitle: "삼성전자 향후 주가 전망 분석",
        date: "2026.06.16",
        boardName: "자유게시판",
        likes: 8,
        replies: 2,
      },
      {
        id: 252,
        content:
          "뇌동매매 방지에는 손절선 준수가 최고입니다. 오늘도 한 수 배웁니다.",
        postTitle: "오늘 하루 매매 20회 돌파 뇌동매매 방지 꿀팁",
        date: "2026.06.15",
        boardName: "종목토론",
        likes: 12,
        replies: 1,
      },
      {
        id: 253,
        content: "저도 삼전 보유중인데 8만전자 꼭 돌파했으면 좋겠습니다.",
        postTitle: "주린이 첫 한달 수익률 인증해봅니다~",
        date: "2026.06.14",
        boardName: "수익인증 게시판",
        likes: 4,
        replies: 0,
      },
    ],
  },
  "3": {
    id: 3,
    nickname: "단타머신",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120",
    level: "Lv.4 프로",
    joinedAt: "2026.03.01 가입",
    badges: ["🏆 단타왕", "⚡ 변동성마스터", "🔥 수익률 30% 달성"],
    totalPosts: 12,
    totalComments: 184,
    totalLikesReceived: 342,

    totalReturn: -12.4,
    totalAssets: 8110000,
    totalOrders: 512,
    winRate: 41,

    portfolio: [
      {
        stockName: "SK하이닉스",
        ratio: 60,
        returnRate: -18.4,
        evalAmount: 4866000,
      },
      {
        stockName: "삼성전자",
        ratio: 20,
        returnRate: 2.3,
        evalAmount: 1622000,
      },
      {
        stockName: "에코프로비엠",
        ratio: 15,
        returnRate: -22.5,
        evalAmount: 1216500,
      },
      { stockName: "카카오", ratio: 5, returnRate: -5.0, evalAmount: 405500 },
    ],

    competitions: [
      {
        title: "2026 리스크 프리 주말 최강전",
        period: "2026-05-10 ~ 2026-05-24",
        seedMoney: 30000000,
        rank: "38위 / 189명",
        returnRate: -12.4,
        gainLoss: -3720000,
        isAward: false,
      },
    ],

    trades: [
      {
        date: "2026.06.16",
        stockName: "SK하이닉스",
        type: "매수",
        price: 189500,
        amount: 20,
      },
      {
        date: "2026.06.15",
        stockName: "에코프로비엠",
        type: "매도",
        price: 198000,
        amount: 15,
        gainLoss: -420000,
      },
      {
        date: "2026.06.14",
        stockName: "카카오",
        type: "매수",
        price: 44200,
        amount: 100,
      },
    ],

    frequentStocks: [
      { name: "SK하이닉스", count: 189 },
      { name: "에코프로비엠", count: 142 },
      { name: "삼성전자", count: 98 },
      { name: "카카오", count: 52 },
      { name: "셀트리온", count: 31 },
    ],

    posts: [
      {
        id: 301,
        title: "에코프로 하락장 바닥은 도대체 어디입니까.. 흑흑",
        views: 612,
        likes: 45,
        comments: 12,
        date: "2026.06.10",
      },
      {
        id: 302,
        title: "오늘 하루 매매 20회 돌파 뇌동매매 방지 꿀팁",
        views: 320,
        likes: 18,
        comments: 5,
        date: "2026.06.13",
      },
    ],

    comments: [
      {
        id: 351,
        content:
          "저도 오늘 에코프로비엠 진입했다가 제대로 당했네요.. 함께 견뎌봅시다.",
        postTitle: "에코프로 하락장 바닥은 도대체 어디입니까.. 흑흑",
        date: "2026.06.10",
        boardName: "질문게시판",
        likes: 2,
        replies: 3,
      },
      {
        id: 352,
        content:
          "정말 깔끔한 삼전 분할매수 매매 분석글이네요. 추천하고 갑니다!",
        postTitle: "삼성전자 향후 주가 전망 분석",
        date: "2026.06.09",
        boardName: "자유게시판",
        likes: 1,
        replies: 0,
      },
    ],
  },
  "4": {
    id: 4,
    nickname: "영희의영익률",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120",
    level: "Lv.9 마스터",
    joinedAt: "2026.02.24 가입",
    badges: [
      "💎 투자고수",
      "👑 인기유저",
      "⚡ 수익률 100% 달성",
      "🕯️ 가치투자자",
      "🌸 모의의정석",
    ],
    totalPosts: 48,
    totalComments: 312,
    totalLikesReceived: 2190,

    totalReturn: 92.8,
    totalAssets: 25400000,
    totalOrders: 160,
    winRate: 75,

    portfolio: [
      {
        stockName: "알테오젠",
        ratio: 50,
        returnRate: 142.1,
        evalAmount: 12700000,
      },
      {
        stockName: "HD현대일렉트릭",
        ratio: 30,
        returnRate: 88.3,
        evalAmount: 7620000,
      },
      {
        stockName: "삼양식품",
        ratio: 20,
        returnRate: 45.2,
        evalAmount: 5080000,
      },
    ],

    competitions: [
      {
        title: "제1회 제로리스크 대학생 실전 투자 대회",
        period: "2026-07-01 ~ 2026-07-31",
        seedMoney: 50000000,
        rank: "준비대기",
        returnRate: 0,
        gainLoss: 0,
        isAward: false,
      },
      {
        title: "강남 6월 빅딜 게릴라 투자전",
        period: "2026-06-01 ~ 2026-06-30",
        seedMoney: 10000000,
        rank: "1위",
        returnRate: 92.8,
        gainLoss: 9280000,
        isAward: true,
      },
    ],

    trades: [
      {
        date: "2026.06.16",
        stockName: "알테오젠",
        type: "매수",
        price: 268000,
        amount: 20,
      },
      {
        date: "2026.06.15",
        stockName: "삼양식품",
        type: "매도",
        price: 580000,
        amount: 5,
        gainLoss: 450000,
      },
    ],

    frequentStocks: [
      { name: "알테오젠", count: 52 },
      { name: "HD현대일렉트릭", count: 48 },
      { name: "삼양식품", count: 32 },
      { name: "삼성전자", count: 18 },
      { name: "SK하이닉스", count: 10 },
    ],

    posts: [
      {
        id: 401,
        title: "가치투자 장기 홀딩 중인 포트폴리오 3선 공개",
        views: 2412,
        likes: 184,
        comments: 24,
        date: "2026.06.11",
      },
      {
        id: 402,
        title: "주요 대형 수출 바이오 테마 및 모맨텀 핵심 브리핑",
        views: 1812,
        likes: 142,
        comments: 16,
        date: "2026.06.14",
      },
    ],
    comments: [
      {
        id: 451,
        content:
          "알테오젠은 장기 가치투자로 가져가기에 최고의 모멘텀을 가졌네요. 적극 공감합니다.",
        postTitle: "가치투자 장기 홀딩 중인 포트폴리오 3선 공개",
        date: "2026.06.15",
        boardName: "자유게시판",
        likes: 2,
        replies: 0,
      },
      {
        id: 452,
        content:
          "금리 인하 국면에서 특히 바이오와 헬스케어 관련 매수가 몰릴 것 같아요.",
        postTitle: "주요 대형 수출 바이오 테마 및 모맨텀 핵심 브리핑",
        date: "2026.06.14",
        boardName: "종목토론",
        likes: 5,
        replies: 1,
      },
    ],
  },
};

// Current logged in user (ME) profile for comparison standard
const MY_MOCK_PROFILE = {
  id: 1,
  nickname: "강원준",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
  totalReturn: 22.1,
  totalAssets: 12200000,
  winRate: 61,
  totalOrders: 142,
  topStock: "삼성전자",
};

export function getCompetitionStatus(
  period: string,
  explicitStatus?: "진행중" | "종료" | "예정"
): "진행중" | "종료" | "예정" {
  if (explicitStatus) return explicitStatus;
  try {
    const dates = period.split("~").map((d) => d.trim().replace(/\./g, "-").replace(/\s/g, ""));
    if (dates.length === 2) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const sDateStr = dates[0].includes("-") ? dates[0] : `${dates[0].slice(0, 4)}-${dates[0].slice(4, 6)}-${dates[0].slice(6, 8)}`;
      const eDateStr = dates[1].includes("-") ? dates[1] : `${dates[1].slice(0, 4)}-${dates[1].slice(4, 6)}-${dates[1].slice(6, 8)}`;

      const sDate = new Date(sDateStr);
      const eDate = new Date(eDateStr);

      if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
        return "종료";
      }

      if (today < sDate) return "예정";
      if (today > eDate) return "종료";
      return "진행중";
    }
  } catch (e) {
    console.error(e);
  }
  return "종료";
}

export function formatCompetitionPeriod(period: string): string {
  try {
    const parts = period.split("~").map((p) => p.trim());
    if (parts.length === 2) {
      const formatDate = (dateStr: string) => {
        let normalized = dateStr.replace(/-/g, ".");
        const segments = normalized.split(".");
        if (segments.length === 3) {
          let year = segments[0];
          if (year.length === 4) {
            year = year.slice(2);
          }
          return `${year}.${segments[1]}.${segments[2]}`;
        }
        return normalized;
      };
      return `${formatDate(parts[0])} ~ ${formatDate(parts[1])}`;
    }
  } catch (error) {
    console.error(error);
  }
  return period.replace(/-/g, ".");
}

export function PublicProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Decide which profile to load, default to "2"
  const profileId = id || "2";

  // Helper to dynamically resolve profile by ID or by nickname
  const getResolvedProfile = (): UserProfile => {
    // 1. Direct match in standard PROFILES
    if (PROFILES[profileId]) {
      return PROFILES[profileId];
    }

    // 2. Check if the profile ID parameter matches a nickname inside existing preset PROFILES
    const matchedPreset = Object.values(PROFILES).find(
      (p) =>
        p.nickname === profileId ||
        encodeURIComponent(p.nickname) === profileId,
    );
    if (matchedPreset) {
      return matchedPreset;
    }

    // 3. Match user "강원준" or "제로주린이" as ME (ID: 1)
    if (
      profileId === "1" ||
      profileId === "강원준" ||
      profileId === "제로주린이"
    ) {
      return {
        id: 1,
        nickname: "강원준",
        avatar: MY_MOCK_PROFILE.avatar,
        level: "Lv.2 주린이",
        joinedAt: "2026.06.01 가입",
        badges: ["🌸 모의의정석", "🌱 꿈나무"],
        totalPosts: 4,
        totalComments: 18,
        totalLikesReceived: 32,
        totalReturn: MY_MOCK_PROFILE.totalReturn,
        totalAssets: MY_MOCK_PROFILE.totalAssets,
        totalOrders: MY_MOCK_PROFILE.totalOrders,
        winRate: MY_MOCK_PROFILE.winRate,
        portfolio: [
          {
            stockName: "삼성전자",
            ratio: 60,
            returnRate: 5.4,
            evalAmount: Math.round(MY_MOCK_PROFILE.totalAssets * 0.6),
          },
          {
            stockName: "SK하이닉스",
            ratio: 40,
            returnRate: -1.2,
            evalAmount: Math.round(MY_MOCK_PROFILE.totalAssets * 0.4),
          },
        ],
        competitions: [
          {
            title: "초짜 탈출 주린이 챌린지",
            period: "2026-06-01 ~ 2026-06-15",
            seedMoney: 10000000,
            rank: "45위",
            returnRate: MY_MOCK_PROFILE.totalReturn,
            gainLoss: 2210000,
            isAward: false,
          },
        ],
        trades: [
          {
            date: "2026.06.16",
            stockName: "삼성전자",
            type: "매수",
            price: 74500,
            amount: 80,
          },
        ],
        frequentStocks: [
          { name: "삼성전자", count: 12 },
          { name: "SK하이닉스", count: 8 },
        ],
        posts: [
          {
            id: 801,
            title: "주린이 첫 한달 수익률 인증해봅니다~",
            views: 95,
            likes: 6,
            comments: 2,
            date: "2026.06.14",
          },
        ],
        comments: [
          {
            id: 851,
            content:
              "국내 반도체 대장주로서 삼전만큼 안정적인 주식도 없죠. 저도 조금씩 모으고 있습니다.",
            postTitle: "주식 초보들을 위한 기업 평가 가이드 총집편 1부",
            date: "2026.06.14",
            boardName: "질문게시판",
            likes: 4,
            replies: 1,
          },
        ],
      };
    }

    // 4. Fallback: Dynamically generate mock profile details for arbitrary text nickname nicely!
    const decodedId = decodeURIComponent(profileId);
    let hash = 0;
    for (let j = 0; j < decodedId.length; j++) {
      hash += decodedId.charCodeAt(j) * (j + 1);
    }

    const seedRandom = (offset: number) => {
      const val = Math.sin(hash + offset) * 10000;
      return val - Math.floor(val);
    };

    const levels = [
      "Lv.2 주린이",
      "Lv.4 프로",
      "Lv.6 정석투자",
      "Lv.7 고수",
      "Lv.9 마스터",
    ];
    const level = levels[hash % levels.length];
    const totalReturn = Math.round((seedRandom(1) * 135 - 35) * 10) / 10;
    const totalAssets = Math.round(seedRandom(2) * 60000000 + 3000000);
    const winRate = Math.round(seedRandom(3) * 50 + 30);
    const totalOrders = Math.round(seedRandom(4) * 180 + 15);

    const generatedAvatar = [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120",
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120",
    ][hash % 6];

    return {
      id: hash || 999,
      nickname: decodedId,
      avatar: generatedAvatar,
      level,
      joinedAt: `2026.0${(hash % 5) + 1}.12 가입`,
      badges: [
        ["💎 투자고수", "🏆 단타왕"],
        ["👑 인기유저", "⚡ 수익률 50% 달성"],
        ["🕯️ 가치투자자", "🌸 모의의정석"],
        ["🔥 리스크마스터", "📈 트렌드세터"],
      ][hash % 4],
      totalPosts: (hash % 15) + 3,
      totalComments: (hash % 80) + 12,
      totalLikesReceived: (hash % 200) + 20,
      totalReturn,
      totalAssets,
      totalOrders,
      winRate,
      portfolio: [
        {
          stockName: "삼성전자",
          ratio: 50,
          returnRate: 8.5,
          evalAmount: Math.round(totalAssets * 0.5),
        },
        {
          stockName: "SK하이닉스",
          ratio: 30,
          returnRate: 15.2,
          evalAmount: Math.round(totalAssets * 0.3),
        },
        {
          stockName: "현대자동차",
          ratio: 20,
          returnRate: -3.8,
          evalAmount: Math.round(totalAssets * 0.2),
        },
      ],
      competitions: [
        {
          title: "6월 통합 실전 투자 매치",
          period: "2026-06-01 ~ 2026-06-15",
          seedMoney: 10000000,
          rank: `${(hash % 18) + 5}위`,
          returnRate: totalReturn,
          gainLoss: Math.round((10000000 * totalReturn) / 100),
          isAward: hash % 7 === 0,
        },
      ],
      trades: [
        {
          date: "2026.06.16",
          stockName: "삼성전자",
          type: "매수",
          price: 75200,
          amount: 20,
        },
        {
          date: "2026.06.15",
          stockName: "SK하이닉스",
          type: "매도",
          price: 184500,
          amount: 15,
          gainLoss: 120000,
        },
      ],
      frequentStocks: [
        { name: "삼성전자", count: 21 },
        { name: "SK하이닉스", count: 14 },
        { name: "현대자동차", count: 9 },
      ],
      posts: [
        {
          id: 950 + hash,
          title: `${decodedId}의 실시간 장기 투자의 중요성에 대해`,
          views: 182,
          likes: 11,
          comments: 5,
          date: "2026.06.11",
        },
      ],
      comments: [
        {
          id: 1050 + hash,
          content: `정말 흥미로운 글이네요! ${decodedId}님 의견에 전적으로 동감합니다.`,
          postTitle: "반도체 공급망 현안과 SK하이닉스 추매 시점 분석",
          date: "2026.06.12",
          boardName: "자유게시판",
          likes: 1,
          replies: 0,
        },
      ],
    };
  };

  const user = getResolvedProfile();

  // States
  const [chartPeriod, setChartPeriod] = useState<"1M" | "3M" | "ALL">("1M");
  const [communityTab, setCommunityTab] = useState<"posts" | "comments">(
    "posts",
  );
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // Sticky bottom bar trigger standard
  const [showStickyBar, setShowStickyBar] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Setup Intersection Observer on the Profile Header Card
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If header layout is NOT intersecting (scrolled past), show sticky bottom bar
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: "-80px 0px 0px 0px" },
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    };
  }, [profileId]);

  // Is this profile owned by ME?
  const isOwnProfile = user.id === MY_MOCK_PROFILE.id;

  // Custom multi-line asset growth coordinates
  // Generates different graphs depending on standard and user returns
  const generateChartData = () => {
    const dates = [
      "05-15",
      "05-20",
      "05-25",
      "05-30",
      "06-04",
      "06-09",
      "06-14",
      "현재",
    ];

    // Base indices to match user profile totals
    return dates
      .map((date, idx) => {
        const progress = idx / (dates.length - 1);

        let userVal = 0;
        let myVal = 0;
        let kospiVal = 0;

        if (profileId === "2") {
          // 투자왕김철수
          userVal =
            Math.sin(progress * Math.PI) * 15 + progress * 40 + (idx % 2) * 3;
          myVal = progress * 20 + (idx % 3) * 2;
          kospiVal = Math.cos(progress * Math.PI) * 5 + progress * 10 - 2;
        } else if (profileId === "3") {
          // 단타머신
          userVal =
            Math.sin(progress * Math.PI * 2) * 10 -
            progress * 15 +
            (idx % 2) * 4;
          myVal = progress * 20 + (idx % 3) * 2;
          kospiVal = Math.cos(progress * Math.PI) * 3 + progress * 8 - 1;
        } else {
          // 영희의영익률
          userVal = progress * 85 + (idx % 2) * 8;
          myVal = progress * 20 + (idx % 3) * 2;
          kospiVal = Math.cos(progress * Math.PI) * 6 + progress * 9 - 3;
        }

        // Limit point counts for shorter periods
        if (chartPeriod === "1M" && idx < 3) return null;
        if (chartPeriod === "3M" && idx < 1) return null;

        return {
          date,
          userRate: parseFloat(userVal.toFixed(1)),
          myRate: parseFloat(myVal.toFixed(1)),
          kospiRate: parseFloat(kospiVal.toFixed(1)),
        };
      })
      .filter(Boolean);
  };

  const chartData = generateChartData() as any[];

  // Share profile link action
  const handleShareProfile = () => {
    const profileLink = window.location.href;
    navigator.clipboard.writeText(profileLink);
    alert(`공유 링크가 클립보드에 복사되었습니다!\n${profileLink}`);
  };

  return (
    <div className="flex flex-col gap-4 px-2 lg:px-6 py-4 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      {/* TOP LEVEL NAVIGATION ACCENT */}
      <div className="flex items-center" id="profile-navigation-breadcrumb">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> 돌아가기
        </button>
      </div>

      {/* =========================================================================
          SECTION A: PROFILE HEADER CARD
          ========================================================================= */}
      <Card
        ref={headerRef}
        id="profile-header-card"
        className="relative overflow-hidden w-full"
      >
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6 relative">
            <div className="w-20 h-20 rounded-full border-2 border-surface bg-bg-main shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={user.avatar}
                alt="avatar"
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="text-xl font-bold text-text-primary">
                  {user.nickname}
                </h2>
                <Badge className="bg-text-secondary/10 text-text-secondary py-0 text-[10px] h-4 px-1 border-transparent font-bold">
                  {user.level.split(" ")[0]}
                </Badge>
                {isOwnProfile && (
                  <Badge className="bg-text-secondary/10 text-text-secondary border-transparent py-0 h-[18px] px-1.5 text-[10px] font-bold">
                    본인
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
                <span className="text-sm text-text-secondary font-medium">
                  가입일 {user.joinedAt.replace(" 가입", "")}
                </span>
              </div>
            </div>

            {!isOwnProfile ? (
              <Button
                variant="primary"
                onClick={() => setIsCompareModalOpen(true)}
                className="md:absolute md:top-0 md:right-0 font-bold cursor-pointer transition-colors"
              >
                나와 수익률 비교
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleShareProfile}
                className="md:absolute md:top-0 md:right-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                프로필 공유
              </Button>
            )}
          </div>

          {/* Statistics Row horizontally aligned exactly like Mypage */}
          <div className="border-t border-border-color mt-4 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Total Return */}
            <div className="border border-border-color bg-surface rounded-[12px] p-4 flex flex-col justify-between hover:border-brand/30 transition-all min-h-[110px]">
              <div
                className="flex items-center gap-1 text-text-secondary cursor-help hover:text-text-primary transition-colors w-fit"
                title="참여 대회 수익률 종합"
              >
                <span className="text-[14px] font-extrabold text-text-primary">
                  총 누적 수익률
                </span>
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="mt-3 text-right">
                <span
                  className={cn(
                    "text-xl font-bold tracking-tight tabular-nums inline-block",
                    user.totalReturn >= 0 ? "text-up" : "text-down",
                  )}
                >
                  {user.totalReturn >= 0
                    ? `+${user.totalReturn}%`
                    : `${user.totalReturn}%`}
                </span>
              </div>
            </div>

            {/* Box 2: Total Assets */}
            <div className="border border-border-color bg-surface rounded-[12px] p-4 flex flex-col justify-between hover:border-brand/30 transition-all min-h-[110px]">
              <div
                className="flex items-center gap-1 text-text-secondary cursor-help hover:text-text-primary transition-colors w-fit"
                title="예수금 및 보유 주식 합산"
              >
                <span className="text-[14px] font-extrabold text-text-primary">
                  현재 총 평가자산
                </span>
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="mt-3 text-right">
                <span className="text-xl font-bold text-text-primary tracking-tight tabular-nums inline-block">
                  {formatPrice(user.totalAssets)}원
                </span>
              </div>
            </div>

            {/* Box 3: Total Orders */}
            <div className="border border-border-color bg-surface rounded-[12px] p-4 flex flex-col justify-between hover:border-brand/30 transition-all min-h-[110px]">
              <div
                className="flex items-center gap-1 text-text-secondary cursor-help hover:text-text-primary transition-colors w-fit"
                title="누적 매수 및 매도 체결량"
              >
                <span className="text-[14px] font-extrabold text-text-primary">
                  총 체결 주문수
                </span>
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="mt-3 text-right">
                <span className="text-xl font-bold text-text-primary tracking-tight tabular-nums inline-block">
                  {user.totalOrders}건
                </span>
              </div>
            </div>

            {/* Box 4: Win rate */}
            <div className="border border-border-color bg-surface rounded-[12px] p-4 flex flex-col justify-between hover:border-brand/30 transition-all min-h-[110px]">
              <div
                className="flex items-center gap-1 text-text-secondary cursor-help hover:text-text-primary transition-colors w-fit"
                title="수익 매각 대 손실 비율"
              >
                <span className="text-[14px] font-extrabold text-text-primary">
                  주식 거래 승률
                </span>
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="mt-3 text-right">
                <span className="text-xl font-bold text-brand tracking-tight tabular-nums inline-block">
                  {user.winRate}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TWO-COLUMN GRID (Left=Main chart & Stats, Right=Portfolio snapshot & Certifications) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT 2/3 COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* =========================================================================
              SECTION B: INVESTMENT PERFORMANCE CHART
              ========================================================================= */}
          <Card id="profile-growth-curve-card" className="w-full">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
              <div>
                <CardTitle className="text-lg font-bold">
                  자산 성장 곡선
                </CardTitle>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 mt-2 sm:mt-0">
                {/* 1M / 3M / ALL Period tabs selector */}
                <div className="flex bg-bg-main p-1 rounded-[10px] border border-border-color shrink-0">
                  {[
                    { key: "1M", label: "1달" },
                    { key: "3M", label: "3달" },
                    { key: "ALL", label: "전체" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setChartPeriod(p.key as any)}
                      className={cn(
                        "px-3 py-1 text-xs font-semibold rounded-[8px] transition cursor-pointer",
                        chartPeriod === p.key
                          ? "bg-brand text-white shadow-xs"
                          : "text-text-secondary hover:text-text-primary",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* SVG Live Area / Line Chart comparison */}
              <div className="relative bg-bg-main/50 border border-border-color rounded-[14px] p-4 h-[250px] flex flex-col justify-end overflow-hidden">
                {/* Floating state tooltip showing hover value */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] sm:text-xs font-bold text-text-secondary">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-up" />
                    <span>
                      {user.nickname}:{" "}
                      <strong className="text-up font-bold tabular-nums">
                        {user.totalReturn}%
                      </strong>
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-text-secondary" />
                    <span>
                      KOSPI 지수:{" "}
                      <strong className="text-text-primary font-bold tabular-nums">
                        +8.4%
                      </strong>
                    </span>
                  </span>
                </div>

                {/* HTML Hover Tracker Tooltip Layer */}
                {hoveredPoint && (
                  <div
                    style={{ left: `${hoveredPoint.left}%` }}
                    className="absolute top-0 bottom-0 w-[1px] bg-border-color z-10 pointer-events-none"
                  >
                    <div className="absolute top-12 -translate-x-1/2 bg-text-primary text-white rounded-[10px] p-2.5 shadow-lg text-xs font-medium min-w-[130px] z-20 space-y-1">
                      <p className="text-[10px] text-text-secondary font-bold text-center border-b border-white/10 pb-1">
                        {hoveredPoint.data.date}
                      </p>
                      <p className="flex justify-between font-bold gap-3">
                        <span>{user.nickname}:</span>{" "}
                        <span className="text-up">
                          {hoveredPoint.data.userRate}%
                        </span>
                      </p>
                      <p className="flex justify-between font-medium text-text-secondary gap-3">
                        <span>KOSPI:</span>{" "}
                        <span>{hoveredPoint.data.kospiRate}%</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Dynamic SVG Render */}
                <svg
                  className="w-full h-[140px]"
                  viewBox="0 0 600 140"
                  name="performance-svg"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="curveGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#FF3B30"
                        stopOpacity="0.12"
                      />
                      <stop
                        offset="100%"
                        stopColor="#FF3B30"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* horizontal assistance grid line */}
                  <line
                    x1="0"
                    y1="100"
                    x2="600"
                    y2="100"
                    stroke="#F2F2F7"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="50"
                    x2="600"
                    y2="50"
                    stroke="#F2F2F7"
                    strokeWidth="1"
                  />

                  {/* 1. KOSPI Line (Dotted Gray) */}
                  <path
                    d={chartData.reduce((acc, pt, idx) => {
                      const x = (idx / (chartData.length - 1)) * 600;
                      const y = 100 - (pt.kospiRate / 110) * 100;
                      return acc + `${idx === 0 ? "M" : "L"} ${x},${y}`;
                    }, "")}
                    fill="none"
                    stroke="#8E8E93"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />

                  {/* 3. User's Return Line Area (Solid Red Gradient) */}
                  <path
                    d={
                      chartData.reduce((acc, pt, idx) => {
                        const x = (idx / (chartData.length - 1)) * 600;
                        const y = 100 - (pt.userRate / 110) * 100;
                        return acc + `${idx === 0 ? "M" : "L"} ${x},${y}`;
                      }, "") + ` L 600,140 L 0,140 Z`
                    }
                    fill="url(#curveGradient)"
                  />

                  <path
                    d={chartData.reduce((acc, pt, idx) => {
                      const x = (idx / (chartData.length - 1)) * 600;
                      const y = 100 - (pt.userRate / 110) * 100;
                      return acc + `${idx === 0 ? "M" : "L"} ${x},${y}`;
                    }, "")}
                    fill="none"
                    stroke="#FF3B30"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Interactive nodes sensor points overlay */}
                  {chartData.map((pt, idx) => {
                    const x = (idx / (chartData.length - 1)) * 600;
                    const y = 100 - (pt.userRate / 110) * 100;

                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r="5"
                        className="fill-up stroke-white stroke-2 hover:r-7 cursor-pointer transition-all duration-150"
                        onMouseEnter={(e) => {
                          const xPercent = (x / 600) * 100;
                          setHoveredPoint({ data: pt, left: xPercent });
                        }}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}
                </svg>

                {/* Horizontal indicator tags */}
                <div className="flex justify-between text-[11px] font-bold text-text-secondary mt-2 font-mono">
                  {chartData.map((pt, idx) => (
                    <span key={idx}>{pt.date}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* =========================================================================
              SECTION C: COMPETITION RECORD
              ========================================================================= */}
          <Card id="profile-competitions-log-card">
            <CardHeader className="pb-3 border-b border-border-color flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">
                대회 참가 기록
              </CardTitle>

              {/* 3-Column trophy summary bar integrated into title row */}
              <div className="flex gap-4 border border-border-color rounded-[10px] bg-bg-main px-4 py-2 text-center items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">🥇</span>
                  <div className="flex flex-col items-start translate-y-[0.5px]">
                    <strong className="text-xs font-extrabold text-up tabular-nums leading-none">
                      1회
                    </strong>
                    <span className="text-[9px] text-text-secondary mt-0.5">
                      우승 은상
                    </span>
                  </div>
                </div>
                <div className="w-[1px] h-6 bg-border-color"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">🥈</span>
                  <div className="flex flex-col items-start translate-y-[0.5px]">
                    <strong className="text-xs font-extrabold text-down tabular-nums leading-none">
                      1회
                    </strong>
                    <span className="text-[9px] text-text-secondary mt-0.5">
                      준우승 수성
                    </span>
                  </div>
                </div>
                <div className="w-[1px] h-6 bg-border-color"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">🥉</span>
                  <div className="flex flex-col items-start translate-y-[0.5px]">
                    <strong className="text-xs font-extrabold text-amber-600 tabular-nums leading-none">
                      0-2회
                    </strong>
                    <span className="text-[9px] text-text-secondary mt-0.5">
                      포디움 안착
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-bg-main border-b border-border-color text-xs font-bold text-text-secondary">
                      <th className="py-3.5 px-6 text-center">대회 기간</th>
                      <th className="py-3.5 px-4 text-center">상태</th>
                      <th className="py-3.5 px-6">참가 대회명</th>
                      <th className="py-3.5 px-4 text-right">시드머니</th>
                      <th className="py-3.5 px-4 text-right">수익률</th>
                      <th className="py-3.5 px-6 text-center">순위</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color">
                    {user.competitions.map((item, idx) => {
                      const status = getCompetitionStatus(item.period, item.status);
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-bg-main/50 transition-colors text-xs font-medium"
                        >
                          <td className="py-4 px-6 text-center text-text-secondary tabular-nums">
                            {formatCompetitionPeriod(item.period)}
                          </td>
                          <td className="py-4 px-4 text-center select-none font-bold">
                            {status === "진행중" ? (
                              <span className="text-brand">진행중</span>
                            ) : status === "예정" ? (
                              <span className="text-text-primary">예정</span>
                            ) : (
                              <span className="text-text-secondary font-medium">종료</span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-bold text-text-primary max-w-[200px] truncate">
                            {item.title}
                          </td>
                          <td className="py-4 px-4 text-right font-medium text-text-secondary tabular-nums">
                            {formatPrice(item.seedMoney)}원
                          </td>
                          <td className="py-4 px-4 text-right font-bold tabular-nums">
                            {status === "예정" ? (
                              <span className="text-text-secondary font-semibold">-</span>
                            ) : (
                              <span
                                className={
                                  item.returnRate >= 0 ? "text-up" : "text-down"
                                }
                              >
                                {item.returnRate >= 0
                                  ? `+${item.returnRate}%`
                                  : `${item.returnRate}%`}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {status === "예정" ? (
                              <span className="text-text-secondary font-semibold">-</span>
                            ) : item.rank === "1위" ? (
                              <Badge className="bg-amber-100 text-amber-800 border-transparent py-0 px-2 font-bold select-none whitespace-nowrap">
                                🥇 1위
                              </Badge>
                            ) : item.rank === "2위" ? (
                              <Badge className="bg-slate-100 text-slate-800 border-transparent py-0 px-2 font-bold select-none whitespace-nowrap">
                                🥈 2위
                              </Badge>
                            ) : item.rank === "3위" ? (
                              <Badge className="bg-amber-50 text-amber-700 border-transparent py-0 px-2 font-bold select-none whitespace-nowrap">
                                🥉 3위
                              </Badge>
                            ) : (
                              <span className="text-text-secondary font-semibold tabular-nums">
                                {item.rank}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* =========================================================================
              SECTION D: STOCK TRADING RECORD
              ========================================================================= */}
          <Card id="profile-trading-records-card">
            <CardHeader className="pb-3 border-b border-border-color">
              <CardTitle className="text-lg font-bold">
                주식 거래 기록
              </CardTitle>

              {/* Grid stats (3 columns) with values placed on bottom-right */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div className="bg-bg-main border border-border-color rounded-[12px] p-3.5 flex flex-col justify-between min-h-[76px] text-left">
                  <span className="text-[13px] text-text-secondary font-extrabold uppercase">
                    누적 총 매수금액
                  </span>
                  <strong className="text-[15.5px] font-extrabold text-text-primary tabular-nums self-end mt-1.5">
                    ₩52,400,000
                  </strong>
                </div>
                <div className="bg-bg-main border border-border-color rounded-[12px] p-3.5 flex flex-col justify-between min-h-[76px] text-left">
                  <span className="text-[13px] text-text-secondary font-extrabold uppercase">
                    누적 총 매도금액
                  </span>
                  <strong className="text-[15.5px] font-extrabold text-text-primary tabular-nums self-end mt-1.5">
                    ₩61,200,000
                  </strong>
                </div>
                <div className="bg-bg-main border border-border-color rounded-[12px] p-3.5 flex flex-col justify-between min-h-[76px] text-left">
                  <span className="text-[13px] text-text-secondary font-extrabold uppercase">
                    확정 실현 손익
                  </span>
                  <strong className="text-[15.5px] font-extrabold text-up tabular-nums self-end mt-1.5">
                    +₩8,800,000
                  </strong>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Horizontal Most Traded Stocks representation bar charts */}
              <div className="space-y-3 pb-4 border-b border-border-color">
                <h4 className="text-sm font-bold text-text-primary">
                  자주 거래한 주식품목 (TOP 5)
                </h4>
                <div className="space-y-2.5 max-w-xl">
                  {user.frequentStocks.map((stock, sIdx) => {
                    const maxCount = user.frequentStocks[0].count;
                    const percentage = (stock.count / maxCount) * 100;
                    return (
                      <div key={sIdx} className="flex items-center gap-3">
                        <span className="w-20 text-xs font-bold text-text-primary truncate">
                          {stock.name}
                        </span>
                        <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${percentage}%` }}
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              sIdx === 0 ? "bg-brand" : "bg-brand/60",
                            )}
                          />
                        </div>
                        <span className="w-12 text-right text-xs font-bold font-mono text-text-secondary tabular-nums">
                          {stock.count}회
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent trades list */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-text-primary px-1">
                  최근 체결 거래 내역
                </h4>
                <div className="border border-border-color rounded-[12px] overflow-hidden bg-surface">
                  <div className="overflow-x-auto">
                    <div className="min-w-[500px]">
                      {/* Header row */}
                      <div className="grid grid-cols-[100px_1fr_60px_90px_60px_110px] sm:grid-cols-[120px_1fr_60px_100px_70px_120px] items-center py-2 px-6 border-b border-border-color text-xs sm:text-sm text-text-secondary font-medium bg-bg-main/30">
                        <div>일시</div>
                        <div className="px-2">종목명</div>
                        <div>구분</div>
                        <div className="text-right pr-2">단가</div>
                        <div className="text-right pr-2">수량</div>
                        <div className="text-right">실현 손익</div>
                      </div>

                      {/* Data rows */}
                      {user.trades.slice(0, 7).map((trade, tIdx) => (
                        <div
                          key={tIdx}
                          className="grid grid-cols-[100px_1fr_60px_90px_60px_110px] sm:grid-cols-[120px_1fr_60px_100px_70px_120px] items-center h-[52px] border-b border-border-color last:border-0 hover:bg-bg-main/50 px-6 transition-colors text-xs sm:text-sm"
                        >
                          <div className="text-text-secondary whitespace-nowrap pr-2">
                            {trade.date}
                          </div>
                          <div className="font-bold px-2 truncate text-text-primary text-left">
                            {trade.stockName}
                          </div>
                          <div>
                            <span
                              className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded-[6px] inline-block text-center",
                                trade.type === "매수"
                                  ? "bg-up/10 text-up"
                                  : "bg-down/10 text-down",
                              )}
                            >
                              {trade.type}
                            </span>
                          </div>
                          <div className="text-right text-text-secondary tabular-nums pr-2">
                            {trade.price.toLocaleString()}원
                          </div>
                          <div className="text-right text-text-secondary tabular-nums pr-2">
                            {trade.amount}주
                          </div>
                          <div className="text-right font-bold tabular-nums">
                            {trade.gainLoss ? (
                              <span
                                className={
                                  trade.gainLoss >= 0 ? "text-up" : "text-down"
                                }
                              >
                                {trade.gainLoss >= 0 ? `+` : ``}
                                {trade.gainLoss.toLocaleString()}원
                              </span>
                            ) : (
                              <span className="text-text-secondary font-medium">
                                -
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert("거래 목록을 가져왔습니다.")}
                    className="font-bold rounded-[10px] px-5 py-2 whitespace-nowrap cursor-pointer"
                  >
                    거래 기록 전체 조회
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT 1/3 SIDEBAR COLUMN */}
        <div className="space-y-6">
          {/* =========================================================================
              SECTION E: PORTFOLIO SNAPSHOT
              ========================================================================= */}
          <Card id="profile-realtime-holdings-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">
                현재 보유 비중
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[240px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={user.portfolio}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="ratio"
                      stroke="none"
                    >
                      {user.portfolio.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-text-secondary font-medium mb-1 flex items-center gap-1">
                    총 평가자산
                  </span>
                  <span className="font-bold text-sm">
                    ₩{user.totalAssets.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {user.portfolio.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      ></span>
                      <span className="font-medium text-text-primary">
                        {item.stockName}
                      </span>
                    </div>
                    <div className="font-mono">
                      <span className="font-bold text-text-primary text-sm">
                        {item.ratio}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* =========================================================================
              SECTION F: COMMUNITY ACTIVITY
              ========================================================================= */}
          <Card id="profile-community-activity-card">
            <CardHeader className="pb-3 border-b border-border-color flex flex-row items-center justify-between gap-4 py-4 px-6 animate-fade-in">
              <CardTitle className="text-base font-bold shrink-0">
                커뮤니티 활동
              </CardTitle>

              {/* Beautiful interactive tab filters aligned perfectly to the right end, styled 1:1 like Mypage */}
              <div className="flex bg-bg-main p-1 rounded-[10px] border border-border-color shrink-0 w-fit ml-auto">
                <button
                  onClick={() => setCommunityTab("posts")}
                  className={cn(
                    "px-3.5 py-1 text-xs font-bold rounded-[8px] transition cursor-pointer text-center whitespace-nowrap",
                    communityTab === "posts"
                      ? "bg-text-primary text-bg-main shadow-xs"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  작성 게시글
                </button>
                <button
                  onClick={() => setCommunityTab("comments")}
                  className={cn(
                    "px-3.5 py-1 text-xs font-bold rounded-[8px] transition cursor-pointer text-center whitespace-nowrap",
                    communityTab === "comments"
                      ? "bg-text-primary text-bg-main shadow-xs"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  작성 댓글
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {/* 1. Posts tab lists */}
              {communityTab === "posts" && (
                <div className="space-y-3">
                  {user.posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/community/${post.id}`)}
                      className="border border-border-color rounded-[12px] p-3.5 hover:border-brand/35 hover:bg-bg-main/20 transition-all cursor-pointer bg-surface flex flex-col gap-2.5 text-left animate-in fade-in duration-200"
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-text-secondary/10 text-text-secondary py-0 px-1.5 text-[9px] font-extrabold h-4 border-transparent pointer-events-none select-none">
                            일반 게시글
                          </Badge>
                          <span className="text-[10.5px] text-text-secondary font-mono font-semibold">
                            {post.date}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-text-secondary flex items-center gap-1.5 shrink-0">
                          <span>조회 {post.views}</span>
                          <span className="text-border-color/60">|</span>
                          <span>추천 {post.likes}</span>
                          <span className="text-border-color/60">|</span>
                          <span>댓글 {post.comments || 0}</span>
                        </div>
                      </div>
                      <h4 className="font-extrabold text-[13px] text-text-primary hover:underline hover:text-brand transition-colors leading-snug line-clamp-1">
                        {post.title}
                      </h4>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. 작성 댓글 tab lists layout */}
              {communityTab === "comments" && (
                <div className="space-y-3">
                  {user.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border border-border-color rounded-[12px] p-3.5 hover:border-brand/35 hover:bg-bg-main/20 transition-all cursor-pointer bg-surface flex flex-col gap-2.5 text-left animate-in fade-in duration-200"
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-brand/10 text-brand py-0 px-1.5 text-[9px] font-extrabold h-4 border-transparent pointer-events-none select-none">
                            {comment.boardName || "자유게시판"}
                          </Badge>
                          <span className="text-[10.5px] text-text-secondary font-mono font-semibold">
                            {comment.date}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-text-secondary flex items-center gap-1.5 shrink-0">
                          <span>추천 {comment.likes || 0}</span>
                          <span className="text-border-color/60">|</span>
                          <span>댓글 {comment.replies || 0}</span>
                        </div>
                      </div>
                      <p className="font-extrabold text-[13px] text-text-primary leading-snug">
                        {comment.content}
                      </p>
                      <p className="text-[11px] text-text-secondary truncate mt-0.5">
                        원문:{" "}
                        <span className="underline hover:text-brand transition-colors font-medium">
                          {comment.postTitle}
                        </span>
                      </p>
                    </div>
                  ))}

                  {user.comments.length === 0 && (
                    <div className="text-center py-8 text-text-secondary text-xs font-medium">
                      작성한 댓글이 없습니다.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* =========================================================================
          SECTION G: COMPARISON BOTTOM BAR
          ========================================================================= */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-surface/85 backdrop-blur-md border-t border-border-color h-20 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40 transition-all duration-300 ease-out flex items-center justify-center transform",
          showStickyBar
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          {/* Left mini profile display details */}
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt="mini"
              className="w-10 h-10 rounded-full object-cover border border-border-color"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              <p className="text-sm font-bold text-text-primary leading-tight">
                {user.nickname}
              </p>
              <p className="text-xs text-text-secondary font-semibold leading-tight mt-0.5">
                {user.level}
              </p>
            </div>
          </div>

          {/* Right action comparison buttons (visible conditionally if not own profile) */}
          <div className="flex items-center gap-3">
            {!isOwnProfile ? (
              <Button
                variant="primary"
                onClick={() => setIsCompareModalOpen(true)}
                className="font-bold text-xs sm:text-sm"
              >
                나와 수익률 비교
              </Button>
            ) : (
              <Badge className="bg-neutral-100 text-text-secondary py-1.5 px-3 border border-border-color font-bold text-xs select-none">
                마이 프로필 미리보기 화면
              </Badge>
            )}

            <Button
              variant="outline"
              onClick={() => navigate("/stocks/compare")}
              className="font-bold text-xs sm:text-sm whitespace-nowrap"
            >
              종목 비교 차트 이동
            </Button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          COMPARISON MODAL
          ========================================================================= */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-[20px] border border-border-color w-full max-w-[680px] p-6 lg:p-8 shadow-2xl flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="absolute top-5 right-5 text-text-secondary hover:text-text-primary transition cursor-pointer p-1.5 hover:bg-neutral-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 text-center">
              <h2 className="text-lg lg:text-xl font-bold text-text-primary">
                실시간 모의투자 성적 비교
              </h2>
              <p className="text-text-secondary text-xs font-semibold">
                나와 <strong>{user.nickname}</strong> 님의 입체 수익 분석 대조표
              </p>
            </div>

            {/* Side-by-side highlighting score boxes */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              {/* Left Column: ME */}
              <div
                className={cn(
                  "rounded-[14px] p-4 border text-center transition-all duration-300 relative",
                  MY_MOCK_PROFILE.totalReturn >= user.totalReturn
                    ? "bg-brand/5 border-brand shadow-xs"
                    : "bg-neutral-50/50 border-border-color",
                )}
              >
                {MY_MOCK_PROFILE.totalReturn >= user.totalReturn && (
                  <Badge className="absolute top-3 right-3 bg-brand text-white border-transparent py-0 px-2 font-bold select-none text-[9px]">
                    우세
                  </Badge>
                )}
                <img
                  src={MY_MOCK_PROFILE.avatar}
                  alt="me"
                  className="w-12 h-12 rounded-full object-cover mx-auto border border-border-color shadow-xs mb-3"
                />
                <span className="text-xs font-bold text-text-secondary block">
                  나
                </span>
                <strong className="text-2xl font-bold block text-brand tabular-nums mt-1">
                  {MY_MOCK_PROFILE.totalReturn >= 0 ? `+` : ``}
                  {MY_MOCK_PROFILE.totalReturn}%
                </strong>
              </div>

              {/* Right Column: Other dynamic profile user */}
              <div
                className={cn(
                  "rounded-[14px] p-4 border text-center transition-all duration-300 relative",
                  user.totalReturn > MY_MOCK_PROFILE.totalReturn
                    ? "bg-up/5 border-up shadow-xs"
                    : "bg-neutral-50/50 border-border-color",
                )}
              >
                {user.totalReturn > MY_MOCK_PROFILE.totalReturn && (
                  <Badge className="absolute top-3 right-3 bg-up text-white border-transparent py-0 px-2 font-bold select-none text-[9px]">
                    우세
                  </Badge>
                )}
                <img
                  src={user.avatar}
                  alt="user"
                  className="w-12 h-12 rounded-full object-cover mx-auto border border-border-color shadow-xs mb-3"
                />
                <span className="text-xs font-bold text-text-secondary block">
                  {user.nickname}
                </span>
                <strong className="text-2xl font-bold block text-up tabular-nums mt-1">
                  {user.totalReturn >= 0 ? `+` : ``}
                  {user.totalReturn}%
                </strong>
              </div>
            </div>

            {/* Comparators matrix details table */}
            <div className="border border-border-color rounded-[12px] overflow-hidden bg-bg-main mt-1">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="bg-bg-main border-b border-border-color text-text-secondary font-bold text-[11px]">
                    <th className="py-3 px-5">분석 지표</th>
                    <th className="py-3 px-4 text-center">나</th>
                    <th className="py-3 px-4 text-center">{user.nickname}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {[
                    {
                      label: "총 누적 수익률",
                      my: `+${MY_MOCK_PROFILE.totalReturn}%`,
                      target: `${user.totalReturn >= 0 ? `+` : ``}${user.totalReturn}%`,
                      win:
                        user.totalReturn > MY_MOCK_PROFILE.totalReturn
                          ? "target"
                          : "my",
                    },
                    {
                      label: "총 평가 자산",
                      my: `${MY_MOCK_PROFILE.totalAssets.toLocaleString()}원`,
                      target: `${user.totalAssets.toLocaleString()}원`,
                      win:
                        user.totalAssets > MY_MOCK_PROFILE.totalAssets
                          ? "target"
                          : "my",
                    },
                    {
                      label: "매매 평균 승률",
                      my: `${MY_MOCK_PROFILE.winRate}%`,
                      target: `${user.winRate}%`,
                      win:
                        user.winRate > MY_MOCK_PROFILE.winRate
                          ? "target"
                          : "my",
                    },
                    {
                      label: "누적 체결수",
                      my: `${MY_MOCK_PROFILE.totalOrders}건`,
                      target: `${user.totalOrders}건`,
                      win:
                        user.totalOrders > MY_MOCK_PROFILE.totalOrders
                          ? "target"
                          : "my",
                    },
                    {
                      label: "주력 지분 종목",
                      my: MY_MOCK_PROFILE.topStock,
                      target: user.portfolio[0]?.stockName || "-",
                      win: "none",
                    },
                  ].map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-bg-main/50 transition-colors"
                    >
                      <td className="py-3 px-5 text-text-secondary">
                        {row.label}
                      </td>
                      <td
                        className={cn(
                          "py-3 px-4 text-center tabular-nums transition-colors",
                          row.win === "my"
                            ? "bg-brand/5 text-brand font-bold"
                            : "text-text-primary",
                        )}
                      >
                        {row.my} {row.win === "my" && "▲"}
                      </td>
                      <td
                        className={cn(
                          "py-3 px-4 text-center tabular-nums transition-colors",
                          row.win === "target"
                            ? "bg-up/5 text-up font-bold"
                            : "text-text-primary",
                        )}
                      >
                        {row.target} {row.win === "target" && "▲"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => setIsCompareModalOpen(false)}
                className="font-bold text-xs select-none"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
