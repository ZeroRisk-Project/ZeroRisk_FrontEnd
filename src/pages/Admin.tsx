import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  AlertTriangle, 
  MessageSquare, 
  Trophy, 
  Terminal, 
  Search, 
  CheckCircle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ArrowLeft,
  Calendar,
  DollarSign,
  Plus,
  Shield,
  Activity,
  Server,
  Database,
  ExternalLink,
  Lock,
  Globe
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";

const STOCKS_DATA = [
  { code: "005930", name: "삼성전자" },
  { code: "000660", name: "SK하이닉스" },
  { code: "373220", name: "LG에너지솔루션" },
  { code: "207940", name: "삼성바이오로직스" },
  { code: "005380", name: "현대차" },
  { code: "000270", name: "기아" },
  { code: "035420", name: "NAVER" },
  { code: "035720", name: "카카오" },
];

const formatDateStr = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatKoreanDate = (dateStr: string) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
};

const getDurationDays = (start: string, end: string) => {
  if (!start || !end) return 0;
  const sDate = new Date(start);
  const eDate = new Date(end);
  const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// Interfaces
interface UserItem {
  id: number;
  email: string;
  nickname: string;
  avatar: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "QUIT";
  accountNo: string;
  joinedAt: string;
}

interface ReportItem {
  id: number;
  reporter: string;
  targetType: "게시글" | "댓글" | "채팅";
  content: string;
  reason: "욕설비방" | "광고도배" | "불법촬영" | "기타";
  date: string;
  status: "미처리" | "처리완료" | "반려";
}

interface InquiryItem {
  id: number;
  author: string;
  title: string;
  content: string;
  date: string;
  status: "미답변" | "답변완료";
  answer?: string;
  answeredAt?: string;
}

interface CompetitionItem {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  seedMoney: number;
  participants: number;
  status: "WAITING" | "ONGOING" | "FINISHED";
  isOpen: boolean;
  isOfficial?: boolean;
  initialAmount?: number;
  maxParticipants?: number | string;
  target?: string;
  hasPassword?: boolean;
  password?: string;
  dday?: string;
}

interface ActivityLog {
  id: number;
  date: string;
  type: string;
  target: string;
  content: string;
  ip: string;
  userId?: number;
}

interface PostItem {
  id: number;
  author: string;
  title: string;
  content: string;
  date: string;
  views: number;
  likes: number;
  commentsCount: number;
  status: "ACTIVE" | "DELETED";
}

// Initial Mock Data
const INITIAL_USERS: UserItem[] = [
  { id: 1, email: "dog49226@gmail.com", nickname: "강원준", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", role: "ADMIN", status: "ACTIVE", accountNo: "1002-321-45678", joinedAt: "2026-01-10" },
  { id: 2, email: "kim_chulsoo@naver.com", nickname: "투자왕김철수", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", role: "USER", status: "ACTIVE", accountNo: "1002-452-98124", joinedAt: "2026-02-15" },
  { id: 3, email: "son_spark@gmail.com", nickname: "단타머신", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", role: "USER", status: "ACTIVE", accountNo: "1002-895-32111", joinedAt: "2026-03-01" },
  { id: 4, email: "lee_younghee@daum.net", nickname: "영희의영익률", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", role: "USER", status: "SUSPENDED", accountNo: "1002-112-78904", joinedAt: "2026-03-24" },
  { id: 5, email: "scripter90@gmail.com", nickname: "김코딩", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100", role: "USER", status: "ACTIVE", accountNo: "1002-541-12543", joinedAt: "2026-04-12" },
  { id: 6, email: "chart_master@google.com", nickname: "차트의마법사", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100", role: "USER", status: "QUIT", accountNo: "1002-901-77884", joinedAt: "2026-05-02" },
  { id: 7, email: "bull_market@naver.com", nickname: "불마켓코리아", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100", role: "USER", status: "ACTIVE", accountNo: "1002-612-44917", joinedAt: "2026-05-20" },
];

const INITIAL_REPORTS: ReportItem[] = [
  { id: 1, reporter: "단타머신", targetType: "게시글", content: "삼성전자 상폐된다고 선동하네요", reason: "광고도배", date: "2026-06-15 14:32", status: "미처리" },
  { id: 2, reporter: "투자왕김철수", targetType: "댓글", content: "부모님 안부 묻는 수준의 욕설을 내뱉습니다.", reason: "욕설비방", date: "2026-06-15 16:10", status: "미처리" },
  { id: 3, reporter: "김코딩", targetType: "채팅", content: "이상한 리딩방 링크 계속 올림", reason: "광고도배", date: "2026-06-16 09:12", status: "미처리" },
  { id: 4, reporter: "영희의영익률", targetType: "게시글", content: "불건전한 파일 업로드 의심", reason: "불법촬영", date: "2026-06-14 11:20", status: "처리완료" },
  { id: 5, reporter: "강원준", targetType: "댓글", content: "정치 게시글 유도 비난", reason: "기타", date: "2026-06-13 18:45", status: "반려" },
];

const INITIAL_INQUIRIES: InquiryItem[] = [
  { id: 1, author: "투자왕김철수", title: "모의투자 예수금 초기화는 어떻게 하나요?", content: "수익률이 너무 안좋아서 마이너스 오천만원인데 초기화하고 새로 시작할 수 있는 방법이 없는지 문의 오천만원 드립니다.", date: "2026-06-16 01:20", status: "미답변" },
  { id: 2, author: "단타머신", title: "주말 거래 기능 만들어주세요", content: "주말에는 주식 시장이 닫혀서 너무 심심합니다. 주말 모의투자나 가상 거래 기능을 구현해주실 순 없나요?", date: "2026-06-15 22:15", status: "미답변" },
  { id: 3, author: "차트의마법사", title: "차트 로딩이 간헐적으로 안됩니다", content: "크롬 최신버전을 쓰고있는데 가끔 종목상세에 차트 선들이 밀리고 로딩 인디케이터가 멈추는데 오류 검토 부탁합니다.", date: "2026-06-15 18:30", status: "미답변" },
  { id: 4, author: "김코딩", title: "닉네임 변경 횟수 제한 문의", content: "닉네임을 한 달에 한 번만 바꿀 수 있도록 구현하셨는지, 아예 수정 불가능하게 막으신 건지 궁금합니다.", date: "2026-06-15 15:40", status: "미답변" },
  { id: 5, author: "영희의영익률", title: "회원 탈퇴 처리 취소 요청", content: "어제 회원탈퇴 버튼을 잘못 눌렀는데 바로 처리되었더라구요. 복구가 가능한지 긴급 문의 드립니다.", date: "2026-06-15 11:10", status: "미답변" },
  { id: 6, author: "불마켓코리아", title: "해외주식 업데이트 일정 문의", content: "현재는 국내 주요 top 30여개 종목만 있는 것 같은데 나스닥이나 해외 우량주 거래는 언제 오픈되나요?", date: "2026-06-14 20:05", status: "미답변" },
  { id: 7, author: "강원준", title: "로그인 세션 만료 시간 연장 요청", content: "글을 쓰는 도중 간헐적으로 세션 만료로 로그아웃 되는 불편함이 있습니다. 자동 연장 세션 쿠키를 적용해 주세요.", date: "2026-06-14 09:30", status: "미답변" },
  { id: 8, author: "투자왕김철수", title: "비밀번호 분실 찾기 이메일이 안 와요", content: "메일함도 다 확인해보고 임시보관함까지 뒤져봐도 이메일 링크가 오질 않습니다. 수동 변경 부탁합니다.", date: "2026-06-13 14:20", status: "답변완료", answer: "안녕하세요 제로리스크입니다. 당시 메일 전송 연동 라이브러리의 일시적인 장애가 확인되어 조치 완료하였습니다. 다시 한 번 시도해 주시기 바라며 자세한 문의는 추가 연락 바랍니다.", answeredAt: "2026-06-13 16:10" },
];

const INITIAL_COMPETITIONS: CompetitionItem[] = [
  { id: 1, title: "제1회 제로리스크 대학생 실전 투자 대회", startDate: "2026-07-01", endDate: "2026-07-31", seedMoney: 50000000, participants: 342, status: "WAITING", isOpen: true },
  { id: 2, title: "여름맞이 강남 6월 빅딜 게릴라 투자전", startDate: "2026-06-01", endDate: "2026-06-30", seedMoney: 10000000, participants: 624, status: "ONGOING", isOpen: true },
  { id: 3, title: "봄바람 부는 리스크 프리 주말 상금 챌린지", startDate: "2026-05-10", endDate: "2026-05-24", seedMoney: 30000000, participants: 189, status: "FINISHED", isOpen: true },
  { id: 4, title: "VIP 비공개 스칼핑 스피드 페스티벌", startDate: "2026-08-15", endDate: "2026-08-30", seedMoney: 100000000, participants: 0, status: "WAITING", isOpen: false },
];

const INITIAL_LOGS: ActivityLog[] = [
  { id: 1, date: "2026-06-16 10:42:15", type: "접속" as any, target: "강원준", content: "관리자 대시보드 로그인 성공 및 웹 세션 연장", ip: "112.222.84.95" },
  { id: 2, date: "2026-06-16 09:30:15", type: "대회" as any, target: "전체", content: "새 투자대회 [제1회 제로리스크 대학생 실전 투자 대회] 개설 등록 완료", ip: "112.222.84.95" },
  { id: 3, date: "2026-06-15 16:11:02", type: "문의" as any, target: "투자왕김철수", content: "1:1 고객문의 #1 '모의투자 예수금 초기화' 답변 등록 처리 완료", ip: "112.222.84.95" },
  { id: 4, date: "2026-06-15 14:24:05", type: "회원수정" as any, target: "영희의영익률", content: "회원 상태 변경: ACTIVE -> SUSPENDED (기간제 정지 적용)", ip: "112.222.84.95" },
  { id: 5, date: "2026-06-15 10:19:33", type: "신고처리" as any, target: "김코딩", content: "접수된 유저 신고건 불량 파일 업로드 제재 적용", ip: "112.222.84.95" },
  { id: 6, date: "2026-06-14 11:02:44", type: "기타" as any, target: "강원준", content: "시스템 보안 필터 및 차단 IP 목록 정상 동기화", ip: "112.222.84.95" },
  { id: 7, date: "2026-06-13 10:02:44", type: "대회" as any, target: "전체", content: "비공개 챌린지 대회 노출 상태 변경 (비공개 -> 공개)", ip: "112.222.84.95" },
];

const INITIAL_USER_LOGS = [
  { id: 101, date: "2026-06-16 10:39:41", userId: 2, type: "매수", target: "투자왕김철수", content: "삼성전자 100주 매수 체결 (체결가 75,400원)", ip: "211.45.195.42" },
  { id: 102, date: "2026-06-16 10:35:10", userId: 3, type: "매도", target: "단타머신", content: "SK하이닉스 50주 대기 주문 체결 (체결가 188,400원)", ip: "175.210.12.98" },
  { id: 103, date: "2026-06-16 10:24:05", userId: 5, type: "게시글", target: "김코딩", content: "신규 게시글 작성: '오늘 장 흐름 보시나요? 코스피 떡상각..'", ip: "14.32.110.59" },
  { id: 104, date: "2026-06-16 10:19:33", userId: 7, type: "댓글", target: "불마켓코리아", content: "댓글 등록: '삼전은 역시 줍줍이 진리죠 ㅎㅎ'", ip: "180.66.45.101" },
  { id: 105, date: "2026-06-16 09:55:12", userId: 2, type: "매도", target: "투자왕김철수", content: "현대차 40주 시장가 매도 체결 (체결가 242,000원)", ip: "211.45.195.42" },
  { id: 106, date: "2026-06-15 15:30:10", userId: 2, type: "대화참가", target: "투자왕김철수", content: "제1회 제로리스크 대학생 실전 투자 대회 참가 등록", ip: "211.45.195.42" },
  { id: 107, date: "2026-06-15 20:45:11", userId: 3, type: "게시글", target: "단타머신", content: "게시글 작성: '오늘 단타 타점 공유합시다'", ip: "175.210.12.98" },
  { id: 108, date: "2026-06-16 11:05:00", userId: 5, type: "댓글", target: "김코딩", content: "댓글 등록: '크.. 드디어 떡상인가요!'", ip: "14.32.110.59" },
  { id: 109, date: "2026-06-10 09:00:15", userId: 5, type: "대회참가", target: "김코딩", content: "대학생 모의투자 챔피언십 참가 신청 완료", ip: "14.32.110.59" },
  { id: 110, date: "2026-06-15 14:10:25", userId: 7, type: "매수", target: "불마켓코리아", content: "삼성전자 250주 신규 진입 매수 완료", ip: "180.66.45.101" },
];

const INITIAL_POSTS: PostItem[] = [
  { id: 1, author: "투자왕김철수", title: "삼성전자 물타도 될까요? 의견좀 주세요", content: "현재 평단가 8만 3천원인데 물타서 평단가 낮추는 시점인지 궁금합니다.", date: "2026-06-16 10:24", views: 142, likes: 23, commentsCount: 15, status: "ACTIVE" },
  { id: 2, author: "단타머신", title: "오늘 SK하이닉스 단타 꿀통 공유한다", content: "체결 호가창 흐름 보면서 눌림목 매수하면 무조건 먹는 법입니다.", date: "2026-06-16 09:15", views: 254, likes: 45, commentsCount: 32, status: "ACTIVE" },
  { id: 3, author: "김코딩", title: "코스피 떡상각인가요? 분위기 좋네요", content: "외국계 매수세가 엄청 유입되는 느낌입니다. 다들 포트 준비하셨나요?", date: "2026-06-15 15:40", views: 112, likes: 12, commentsCount: 6, status: "ACTIVE" },
  { id: 4, author: "영희의영익률", title: "대회 랭킹 1위 비법 공개합니다 (스포주의)", content: "비밀은 철저한 분할매수와 분할매도, 그리고 기계식 절제에 있습니다.", date: "2026-06-14 18:22", views: 301, likes: 62, commentsCount: 19, status: "ACTIVE" },
  { id: 5, author: "불마켓코리아", title: "기아차 이번에 전고점 뚫을 수 있을까", content: "실적 대비 아직 저평가인 것 같은데 추가 상승 여력 충분해보이네요.", date: "2026-06-14 14:10", views: 98, likes: 8, commentsCount: 3, status: "ACTIVE" },
];

export function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"dashboard" | "members" | "posts" | "reports" | "inquiries" | "competitions" | "logs">("dashboard");
  
  // App States representing mockup database
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [inquiries, setInquiries] = useState<InquiryItem[]>(INITIAL_INQUIRIES);
  const [competitions, setCompetitions] = useState<CompetitionItem[]>(() => {
    const saved = localStorage.getItem("competitions_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const defaults: CompetitionItem[] = [
      { id: 1, title: "제1회 제로리스크 대학생 실전 투자 대회", startDate: "2026-07-01", endDate: "2026-07-31", seedMoney: 50000000, participants: 4, status: "ONGOING", isOpen: true, isOfficial: true },
      { id: 2, title: "대학생 모의투자 챔피언십", startDate: "2026-12-01", endDate: "2026-12-31", seedMoney: 5000000, participants: 2, status: "WAITING", isOpen: true, isOfficial: false },
      { id: 3, title: "제1회 우주항공 테마 단타대회", startDate: "2026-10-01", endDate: "2026-10-15", seedMoney: 10000000, participants: 2, status: "FINISHED", isOpen: true, isOfficial: true },
      { id: 4, title: "삼성전자 수익률 대결", startDate: "2026-11-10", endDate: "2026-11-20", seedMoney: 5000000, participants: 3, status: "ONGOING", isOpen: true, isOfficial: false }
    ];
    localStorage.setItem("competitions_list", JSON.stringify(defaults));
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem("competitions_list", JSON.stringify(competitions));
  }, [competitions]);
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem("admin_activity_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_LOGS;
  });

  // User Actions Logs State
  const [userLogs, setUserLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem("user_activity_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USER_LOGS;
  });

  useEffect(() => {
    localStorage.setItem("user_activity_logs", JSON.stringify(userLogs));
  }, [userLogs]);

  // Competition Participants State
  const [compParticipants, setCompParticipants] = useState<{ [compId: number]: UserItem[] }>(() => {
    const saved = localStorage.getItem("competition_participants_map");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const initialMap: { [compId: number]: UserItem[] } = {
      1: [
        INITIAL_USERS[1], // 투자왕김철수
        INITIAL_USERS[2], // 단타머신
        INITIAL_USERS[4], // 김코딩
        INITIAL_USERS[6], // 불마켓코리아
      ],
      2: [
        INITIAL_USERS[2], // 단타머신
        INITIAL_USERS[4], // 김코딩
      ],
      3: [
        INITIAL_USERS[1], // 투자왕김철수
        INITIAL_USERS[6], // 불마켓코리아
      ],
      4: [
        INITIAL_USERS[1], // 투자왕김철수
        INITIAL_USERS[2], // 단타머신
        INITIAL_USERS[4], // 김코딩
      ]
    };
    localStorage.setItem("competition_participants_map", JSON.stringify(initialMap));
    return initialMap;
  });

  // Competition Participant modal states
  const [selectedCompForParticipants, setSelectedCompForParticipants] = useState<CompetitionItem | null>(null);
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);

  // User Row Context Dropdown menu mapping values
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    user: UserItem | null;
  }>({ isOpen: false, x: 0, y: 0, user: null });

  useEffect(() => {
    localStorage.setItem("admin_activity_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.isOpen) {
        setContextMenu(prev => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [contextMenu.isOpen]);

  const logAdminAction = (type: string, target: string, content: string) => {
    const newLog: ActivityLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type,
      target,
      content,
      ip: "127.0.0.1" // 로컬 관리자 IP 세션
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);

  // General States
  const [loading, setLoading] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Posts State Actions
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [postFilterTab, setPostFilterTab] = useState<"ALL" | "ACTIVE" | "DELETED">("ALL");
  const [selectedPostDetail, setSelectedPostDetail] = useState<PostItem | null>(null);

  // Report Detail view Modal
  const [reportDetailModal, setReportDetailModal] = useState<{ isOpen: boolean; report: ReportItem | null }>({ isOpen: false, report: null });

  // 1. Members State Actions
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "SUSPENDED" | "QUIT">("ALL");
  const [filterRole, setFilterRole] = useState<"ALL" | "USER" | "ADMIN">("ALL");
  const [modifiedUsers, setModifiedUsers] = useState<{ [key: number]: { role: "USER" | "ADMIN", status: "ACTIVE" | "SUSPENDED" | "QUIT" } }>({});
  
  // Suspension Modal
  const [suspensionModal, setSuspensionModal] = useState<{ isOpen: boolean; userId: number | null }>({ isOpen: false, userId: null });
  const [suspensionTime, setSuspensionTime] = useState("-1");
  const [suspensionReason, setSuspensionReason] = useState("");

  // Activity Log Modal
  const [activityModal, setActivityModal] = useState<{ isOpen: boolean; user: UserItem | null }>({ isOpen: false, user: null });
  const [logFilter, setLogFilter] = useState<string>("전체");

  // 2. Reports State Actions
  const [reportFilterTab, setReportFilterTab] = useState<"전체" | "미처리" | "처리완료" | "반려">("전체");

  // 3. Inquiries State Actions
  const [inquiryFilterTab, setInquiryFilterTab] = useState<"전체" | "미답변" | "답변완료">("전체");
  const [answerModal, setAnswerModal] = useState<{ isOpen: boolean; inquiry: InquiryItem | null }>({ isOpen: false, inquiry: null });
  const [answerText, setAnswerText] = useState("");

  // 4. Competitions State Actions
  const [newCompModal, setNewCompModal] = useState(false);
  const [newCompTitle, setNewCompTitle] = useState("");
  const [newCompDescription, setNewCompDescription] = useState("");
  const [newCompStartDate, setNewCompStartDate] = useState("");
  const [newCompEndDate, setNewCompEndDate] = useState("");
  const [newCompInitialAmount, setNewCompInitialAmount] = useState("1000"); // 만원 단위 (1000 = 1000만원)
  const [newCompMaxParticipants, setNewCompMaxParticipants] = useState("1000");
  const [newCompIsSecret, setNewCompIsSecret] = useState(false);
  const [newCompPassword, setNewCompPassword] = useState("");
  const [newCompIsOfficial, setNewCompIsOfficial] = useState(false);

  // Calendar States for Admin Comp creation
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Stock Search / Restriction States for Admin Comp creation
  const [stockSearch, setStockSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [allowedStocks, setAllowedStocks] = useState<{ name: string; code: string }[]>([]);

  // 5. Log Monitoring Pagination Filter
  const [logMonitoringTab, setLogMonitoringTab] = useState<"전체" | "접속" | "대회" | "문의" | "회원수정" | "신고처리" | "기타">("전체");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logPage, setLogPage] = useState(1);

  // Simulate Load effect when moving tabs
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getCalendarDays = () => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    
    // Previous month padding days
    const prevMonthDays = [];
    const tempDate = new Date(currentYear, currentMonth, 0);
    const prevMonthLastDate = tempDate.getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevMonthDays.unshift({
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDate - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    const currentMonthDays = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding days
    const totalSlots = prevMonthDays.length + currentMonthDays.length;
    const remainingSlots = (7 - (totalSlots % 7)) % 7;
    const nextMonthDays = [];
    for (let i = 1; i <= remainingSlots; i++) {
      nextMonthDays.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
      });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const handleDayClick = (dateStr: string) => {
    const todayStr = formatDateStr(new Date());
    if (dateStr < todayStr) return;
    if (!newCompStartDate || (newCompStartDate && newCompEndDate)) {
      setNewCompStartDate(dateStr);
      setNewCompEndDate("");
    } else {
      if (dateStr >= newCompStartDate) {
        setNewCompEndDate(dateStr);
      } else {
        setNewCompStartDate(dateStr);
        setNewCompEndDate("");
      }
    }
  };

  const handleDayMouseEnter = (dateStr: string) => {
    const todayStr = formatDateStr(new Date());
    if (dateStr < todayStr) return;
    if (newCompStartDate && !newCompEndDate && dateStr >= newCompStartDate) {
      setHoveredDate(dateStr);
    }
  };

  const setPreset = (days: number) => {
    const today = new Date();
    const startStr = formatDateStr(today);
    const end = new Date();
    end.setDate(today.getDate() + days - 1);
    const endStr = formatDateStr(end);
    setNewCompStartDate(startStr);
    setNewCompEndDate(endStr);
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleStockSelect = (stock: { name: string; code: string }) => {
    setAllowedStocks([...allowedStocks, stock]);
    setStockSearch("");
    setIsSearchFocused(false);
  };

  const removeStock = (code: string) => {
    setAllowedStocks(allowedStocks.filter((s) => s.code !== code));
  };

  // Helper selectors
  const totalInquiriesCount = inquiries.filter(i => i.status === "미답변").length;
  const totalReportsCount = reports.filter(r => r.status === "미처리").length;

  return (
    <div className="flex bg-[#FDFDFD] min-h-screen text-[#1C1C1E] font-sans overflow-x-hidden antialiased">
      {/* LEFT SIDEBAR - 265px */}
      <aside className="w-[265px] bg-white border-r border-[#E5E5EA] flex flex-col justify-between py-6 px-4 shrink-0 h-screen sticky top-0">
        <div>
          {/* Logo / Header */}
          <div className="px-2 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-bold text-[#4A5DF9]">제로리스크</span>
              <span className="bg-[#4A5DF9]/10 text-[#4A5DF9] text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded">WEB</span>
            </div>
            <p className="text-[#8E8E93] text-[12px] font-medium mt-1">관리자 페이지</p>
          </div>

          <div className="h-[1px] bg-[#E5E5EA] mb-6" />

          {/* Admin Profile Card */}
          <div className="bg-[#F2F2F7] rounded-[12px] p-3 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" 
                alt="admin" 
                className="flex-shrink-0 w-9 h-9 rounded-full object-cover border border-[#E5E5EA]"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#1C1C1E] truncate">관리자</p>
                <p className="text-[11px] text-[#8E8E93] truncate">dog49226</p>
              </div>
            </div>
            <span className="bg-[#FF3B30] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-[16px]">ADMIN</span>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "대시보드", icon: "📊" },
              { id: "members", label: "회원 관리", icon: "👥" },
              { id: "posts", label: "게시글 관리", icon: "📝" },
              { id: "reports", label: "신고 관리", icon: "🚨", badge: totalReportsCount, badgeColor: "bg-[#FF3B30]" },
              { id: "inquiries", label: "문의 관리", icon: "💬", badge: totalInquiriesCount, badgeColor: "bg-[#FF9500]" },
              { id: "competitions", label: "대회 관리", icon: "🏆" },
              { id: "logs", label: "로그 모니터링", icon: "📋" },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={cn(
                    "w-full h-11 flex items-center justify-between px-3.5 transition-all text-[14px]",
                    isActive 
                      ? "bg-[#4A5DF9]/10 text-[#4A5DF9] !font-bold rounded-[12px]"
                      : "text-[#8E8E93] hover:text-[#1C1C1E] font-medium bg-transparent rounded-[12px]"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-[16px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge && item.badge > 0 ? (
                    <span className={cn("w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0", item.badgeColor)}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="px-2">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-[13px] font-semibold text-[#8E8E93] hover:text-[#4A5DF9] transition-colors py-1 px-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>메인으로 돌아가기</span>
          </Link>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA - Scrollable */}
      <main id="admin-content-viewport" className="flex-1 min-w-0 h-screen overflow-y-auto px-8 py-7 flex flex-col">
        {/* Floating Notification Toast */}
        {showToast && (
          <div className="fixed top-6 right-6 z-50 bg-[#1C1C1E] text-white rounded-[12px] px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center gap-2 border border-[#E5E5EA]/20 animate-in fade-in duration-200">
            <CheckCircle className="w-4.5 h-4.5 text-[#34C759]" />
            <span className="text-[13px] font-medium">{toastMsg}</span>
          </div>
        )}

        {/* View Content Renderer */}
        {loading ? (
          /* SKELETON SHIMMER LOADING PREVIEW */
          <div id="loading-shimmer-container" className="flex flex-col gap-6 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="w-40 h-7 rounded-[8px] animate-shimmer" />
                <div className="w-64 h-4 rounded-[6px] animate-shimmer" />
              </div>
              <div className="w-32 h-10 rounded-[12px] animate-shimmer" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[105px] bg-white rounded-[16px] border border-[#E5E5EA] p-5 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-16 h-3 rounded animate-shimmer" />
                    <div className="w-8 h-8 rounded-full animate-shimmer" />
                  </div>
                  <div className="w-24 h-6 rounded animate-shimmer" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[300px] bg-white rounded-[16px] border border-[#E5E5EA] p-6 flex flex-col justify-between">
                <div className="w-48 h-5 rounded animate-shimmer" />
                <div className="w-full h-44 rounded animate-shimmer" />
              </div>
              <div className="h-[300px] bg-white rounded-[16px] border border-[#E5E5EA] p-6 flex flex-col justify-between">
                <div className="w-32 h-5 rounded animate-shimmer" />
                <div className="w-full h-44 rounded animate-shimmer" />
              </div>
            </div>
          </div>
        ) : emptyState ? (
          /* EMPTY STATE PREVIEW */
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-[16.5px] border border-[#E5E5EA] text-center p-8 self-stretch my-auto">
            <div className="w-[72px] h-[72px] rounded-full bg-[#F2F2F7] flex items-center justify-center text-[#8E8E93] mb-4">
              <AlertTriangle className="w-9 h-9" />
            </div>
            <h3 className="text-[17px] font-bold text-[#1C1C1E] mb-1.5">내역이 존재하지 않습니다</h3>
            <p className="text-[13px] text-[#8E8E93] max-w-sm mb-6 leading-relaxed">
              조회 조건에 만족하는 정보나 등록된 이벤트 기록이 발견되지 않았습니다. 다른 필터 조건을 선택하거나 나중에 다시 확인해주십시오.
            </p>
            <Button
              onClick={() => setEmptyState(false)}
              className="bg-[#4A5DF9] hover:bg-[#4A5DF9]/90 text-white rounded-[12px] text-[13px] font-bold px-4"
            >
              기본 데이터 복구
            </Button>
          </div>
        ) : (
          /* NORMAL STATIC HIGHER FIDELITY STATE */
          <div className="space-y-6">
            
            {/* 1. DASHBOARD VIEW */}
            {activeTab === "dashboard" && (
              <div id="admin-dashboard-panel" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">대시보드</h1>
                    <p className="text-[#8E8E93] text-[14px]">제로리스크 서비스 현황</p>
                  </div>
                  <div className="bg-[#34C759]/10 text-[#34C759] font-bold text-[13px] px-3 py-1.5 rounded-[12px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#34C759] animate-ping" />
                    <span>서버 가동중 (Uptime 99.98%)</span>
                  </div>
                </div>

                {/* 4 STATS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1 */}
                  <Card className="rounded-[16px]">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-[#8E8E93]">전체 회원수</p>
                        <p className="text-[28px] font-bold text-[#1C1C1E] tabular-nums">1,284명</p>
                        <p className="text-[12px] font-bold text-[#34C759] flex items-center gap-1">
                          <span>+12명 오늘 신규</span>
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-[#4A5DF9]/12 text-[#4A5DF9] flex items-center justify-center text-[19px]">
                        👥
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2 */}
                  <Card className="rounded-[16px]">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-[#8E8E93]">오늘 접속자</p>
                        <p className="text-[28px] font-bold text-[#1C1C1E] tabular-nums">342명</p>
                        <p className="text-[12px] font-bold text-[#4A5DF9] flex items-center gap-1">
                          <span>현재 실시간: 47명</span>
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-[#34C759]/12 text-[#34C759] flex items-center justify-center text-[19px]">
                        🟢
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 3 */}
                  <Card className="rounded-[16px]">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-[#8E8E93]">미처리 신고</p>
                        <p className="text-[28px] font-bold text-[#FF3B30] tabular-nums">{totalReportsCount}건</p>
                        <p className="text-[12px] font-bold text-[#FF3B30] flex items-center gap-1">
                          <span>즉시 확인 필요</span>
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-[#FF3B30]/12 text-[#FF3B30] flex items-center justify-center text-[19px]">
                        🚨
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 4 */}
                  <Card className="rounded-[16px]">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-[#8E8E93]">미답변 문의</p>
                        <p className="text-[28px] font-bold text-[#FF9500] tabular-nums">{totalInquiriesCount}건</p>
                        <p className="text-[12px] font-semibold text-[#8E8E93] flex items-center gap-1">
                          <span>평균 대기 2.3시간</span>
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-[#FF1493]/12 text-[#FF9500] flex items-center justify-center text-[19px]">
                        💬
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* API LATENCY & ACTIVE TRAFFIC */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                  
                  {/* Left (60%): Live API latency SVG AREA CHART */}
                  <Card className="rounded-[16px] lg:col-span-3 flex flex-col justify-between">
                    <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <CardTitle className="text-[15px] font-bold text-[#1C1C1E]">API 응답시간 (ms)</CardTitle>
                        <p className="text-[11px] text-[#8E8E93]">실시간 트래픽 가중 응답 처리 지표</p>
                      </div>
                      <span className="bg-[#34C759]/11 text-[#34C759] text-[11px] font-bold px-2 py-0.5 rounded-[12px]">현재 87ms</span>
                    </CardHeader>
                    <CardContent className="p-5 flex flex-col justify-end">
                      <div className="relative w-full h-[180px] bg-[#F2F2F7]/40 rounded-[8px] overflow-hidden px-2 pt-4 border border-[#E5E5EA]">
                        {/* Warning Line at 200ms */}
                        <div className="absolute top-[40%] left-0 w-full border-t border-dashed border-[#FF9500]/70 z-10">
                          <span className="absolute right-2 -top-4 text-[9px] font-bold text-[#FF9500] bg-white px-1 rounded border border-[#FF9500]/30 shadow-none">Warning 200ms</span>
                        </div>

                        {/* Chart Render */}
                        <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="apiAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4A5DF9" stopOpacity="0.28"/>
                              <stop offset="100%" stopColor="#4A5DF9" stopOpacity="0.0"/>
                            </linearGradient>
                          </defs>
                          
                          {/* Y-axis Labels */}
                          <line x1="0" y1="120" x2="500" y2="120" stroke="#E5E5EA" strokeWidth="1" />
                          <line x1="0" y1="60" x2="500" y2="60" stroke="#E5E5EA" strokeWidth="1" />
                          
                          {/* Area under line */}
                          <path
                            d="M 0,150 
                               L 0,120
                               C 50,110 80,130 120,80
                               C 160,30 200,90 250,55
                               C 300,20 340,110 380,95
                               C 420,80 460,45 500,40
                               L 500,150 Z"
                            fill="url(#apiAreaGrad)"
                          />

                          {/* Line itself */}
                          <path
                            d="M 0,120
                               C 50,110 80,130 120,80
                               C 160,30 200,90 250,55
                               C 300,20 340,110 380,95
                               C 420,80 460,45 500,40"
                            fill="none"
                            stroke="#4A5DF9"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />

                          {/* Interactive data dots */}
                          <circle cx="120" cy="80" r="4.5" fill="#4A5DF9" stroke="#FFFFFF" strokeWidth="1.5" />
                          <circle cx="250" cy="55" r="4.5" fill="#4A5DF9" stroke="#FFFFFF" strokeWidth="1.5" />
                          <circle cx="380" cy="95" r="4.5" fill="#4A5DF9" stroke="#FFFFFF" strokeWidth="1.5" />
                          <circle cx="500" cy="40" r="4.5" fill="#4A5DF9" stroke="#FFFFFF" strokeWidth="1.5" />
                        </svg>

                        {/* X-axis custom tags */}
                        <div className="flex justify-between text-[9px] text-[#8E8E93] mt-1 pr-1 font-semibold">
                          <span>10:10</span>
                          <span>10:20</span>
                          <span>10:30</span>
                          <span>10:40</span>
                          <span>현재</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right (40%): Active traffic telemetry card */}
                  <Card className="rounded-[16px] lg:col-span-2 p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[14px] font-bold text-[#8E8E93]">실시간 접속자수</h4>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-[48px] font-extrabold text-[#1C1C1E] tracking-tight">47명</span>
                        <span className="text-[13px] text-[#8E8E93] font-medium">현재 사이트 운영중</span>
                      </div>
                    </div>

                    {/* Mini high-fidelity hours bar chart */}
                    <div className="flex gap-1 items-end h-[60px] my-2 bg-[#F2F2F7]/30 rounded p-1 border border-[#E5E5EA]">
                      {[15, 22, 10, 8, 30, 48, 55, 34, 40, 28, 47, 47].map((h, idx) => (
                        <div 
                          key={idx} 
                          style={{ height: `${(h / 60) * 100}%` }}
                          className={cn(
                            "flex-1 rounded-[2px] transition-all duration-300",
                            idx === 11 ? "bg-[#4A5DF9]" : "bg-[#4A5DF9]/45"
                          )}
                          title={`${h}명 접속`}
                        />
                      ))}
                    </div>

                    {/* Status signals with circular color tags */}
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between items-center text-[12px] bg-[#F2F2F7]/50 rounded-[8px] p-2 border border-[#E5E5EA]">
                        <span className="flex items-center gap-1.5 font-bold text-[#1C1C1E]">
                          <span className="w-2 h-2 rounded-full bg-[#34C759]" stroke="#FFFFFF" strokeWidth="1" />
                          <span>웹서버</span>
                        </span>
                        <span className="text-[#34C759] font-bold">정상운영</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px] bg-[#F2F2F7]/50 rounded-[8px] p-2 border border-[#E5E5EA]">
                        <span className="flex items-center gap-1.5 font-bold text-[#1C1C1E]">
                          <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                          <span>데이터베이스</span>
                        </span>
                        <span className="text-[#34C759] font-bold">정상운영</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px] bg-[#F2F2F7]/50 rounded-[8px] p-2 border border-[#E5E5EA]">
                        <span className="flex items-center gap-1.5 font-bold text-[#1C1C1E]">
                          <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                          <span>인증/로그인서버</span>
                        </span>
                        <span className="text-[#34C759] font-bold">정상운영</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* 2. MEMBERS VIEW */}
            {activeTab === "members" && (
              <div id="admin-members-panel" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">회원 관리</h1>
                    <p className="text-[#8E8E93] text-[14px]">웹 서비스에 가입된 회원들의 관리 및 정지 제어가 포함됩니다</p>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden">
                  {/* Integrated Filter and Search row at the top of the table */}
                  <div className="p-4 border-b border-[#E5E5EA] flex flex-wrap gap-4 items-center justify-between bg-white">
                    <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                      <div className="relative w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#636C7D] w-4.5 h-4.5" />
                        <input 
                          type="text" 
                          placeholder="이메일 또는 닉네임 검색"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-[#F2F2F7] border border-transparent rounded-[16px] pl-10 pr-4 py-2 text-[14px] outline-none focus:bg-white focus:border-[#4A5DF9] transition-all"
                        />
                      </div>
                      
                      <div className="relative">
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as any)}
                          className="appearance-none bg-[#F2F2F7] rounded-[12px] border border-transparent text-[#1C1C1E] text-[13px] font-bold pl-3.5 pr-9 py-2 outline-none hover:bg-[#E5E5EA] transition cursor-pointer"
                        >
                          <option value="ALL">전체 상태</option>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                          <option value="QUIT">QUIT</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93] pointer-events-none" />
                      </div>

                      <div className="relative">
                        <select
                          value={filterRole}
                          onChange={(e) => setFilterRole(e.target.value as any)}
                          className="appearance-none bg-[#F2F2F7] rounded-[12px] border border-transparent text-[#1C1C1E] text-[13px] font-bold pl-3.5 pr-9 py-2 outline-none hover:bg-[#E5E5EA] transition cursor-pointer"
                        >
                          <option value="ALL">전체 역할</option>
                          <option value="USER">일반 사용자 (USER)</option>
                          <option value="ADMIN">관리자 (ADMIN)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93] pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                      <div className="text-[13px] text-[#8E8E93] font-bold">
                        검색 결과: <span className="text-[#1C1C1E] font-black">{users.filter(u => {
                          const query = searchQuery.toLowerCase();
                          const matchSearch = u.email.toLowerCase().includes(query) || u.nickname.toLowerCase().includes(query);
                          const matchStat = filterStatus === "ALL" || u.status === filterStatus;
                          const matchRl = filterRole === "ALL" || u.role === filterRole;
                          return matchSearch && matchStat && matchRl;
                        }).length}</span>명
                      </div>
                      <div className="text-[11.5px] text-[#4A5DF9] font-bold animate-pulse">
                        💡 Tip: 회원 칸을 마우스 우클릭하면 개별 활동 로그(매수/매도/게시글/댓글/대회참가 등) 보기 드롭다운이 노출됩니다.
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                          <th className="py-3 px-4 w-12 text-center whitespace-nowrap">No.</th>
                          <th className="py-3 px-4 w-15 text-center whitespace-nowrap">프로필</th>
                          <th className="py-3 px-4 whitespace-nowrap">이메일</th>
                          <th className="py-3 px-4 whitespace-nowrap">닉네임</th>
                          <th className="py-3 px-4 w-32 whitespace-nowrap">역할 설정</th>
                          <th className="py-3 px-4 w-36 whitespace-nowrap">상태 관리</th>
                          <th className="py-3 px-4 text-center whitespace-nowrap">계좌번호</th>
                          <th className="py-3 px-4 text-center whitespace-nowrap">가입일</th>
                          <th className="py-3 px-4 w-16 text-center whitespace-nowrap">조치</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {users
                          .filter((u) => {
                            const query = searchQuery.toLowerCase();
                            const matchSearch = u.email.toLowerCase().includes(query) || u.nickname.toLowerCase().includes(query);
                            const matchStat = filterStatus === "ALL" || u.status === filterStatus;
                            const matchRl = filterRole === "ALL" || u.role === filterRole;
                            return matchSearch && matchStat && matchRl;
                          })
                          .map((user, idx) => {
                            // Find temporary updates
                            const tempChange = modifiedUsers[user.id] || { role: user.role, status: user.status };
                            const hasPendingChanges = tempChange.role !== user.role || tempChange.status !== user.status;

                            const handleRoleChangeLocally = (val: "USER" | "ADMIN") => {
                              setModifiedUsers(prev => ({
                                ...prev,
                                [user.id]: { ...(prev[user.id] || { role: user.role, status: user.status }), role: val }
                              }));
                            };

                            const handleStatusChangeLocally = (val: "ACTIVE" | "SUSPENDED" | "QUIT") => {
                              if (val === "SUSPENDED") {
                                // Open detailed modal
                                setSuspensionModal({ isOpen: true, userId: user.id });
                              } else {
                                setModifiedUsers(prev => ({
                                  ...prev,
                                  [user.id]: { ...(prev[user.id] || { role: user.role, status: user.status }), status: val }
                                }));
                              }
                            };

                            const applyModifications = () => {
                              setUsers(prevUsers => prevUsers.map(u => {
                                if (u.id === user.id) {
                                  return { ...u, role: tempChange.role, status: tempChange.status };
                                }
                                return u;
                              }));
                              // clear temp status
                              const nextMods = { ...modifiedUsers };
                              delete nextMods[user.id];
                              setModifiedUsers(nextMods);
                              triggerToast(`${user.nickname}님의 권한/상태가 수정되었습니다!`);
                              
                              const roleKor = tempChange.role === "ADMIN" ? "관리자" : "일반 사용자";
                              const statusKor = tempChange.status === "ACTIVE" ? "활성" : tempChange.status === "SUSPENDED" ? "정지" : "탈퇴";
                              logAdminAction("기타", user.nickname, `회원 권한을 [${roleKor}]으로, 상태를 [${statusKor}]으로 변경 업데이트 완료하였습니다.`);
                            };

                            return (
                              <tr 
                                key={user.id} 
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  setContextMenu({ isOpen: true, x: e.pageX, y: e.pageY, user });
                                }}
                                className="h-[60px] hover:bg-[#FAFAFA] transition-colors text-sm select-none"
                              >
                                <td className="py-2 px-4 text-center font-bold text-[#8E8E93] tabular-nums whitespace-nowrap">{idx + 1}</td>
                                <td className="py-2 px-4 text-center whitespace-nowrap">
                                  <img 
                                    src={user.avatar} 
                                    alt="avatar" 
                                    className="flex-shrink-0 w-10 h-10 min-w-[40px] min-h-[40px] rounded-full object-cover border border-[#E5E5EA] mx-auto shadow-inner aspect-square"
                                    referrerPolicy="no-referrer"
                                  />
                                </td>
                                <td className="py-2 px-4 font-semibold text-[#1C1C1E] whitespace-nowrap">{user.email}</td>
                                <td className="py-2 px-4 font-bold text-[#1C1C1E] whitespace-nowrap">{user.nickname}</td>
                                
                                <td className="py-2 px-4 whitespace-nowrap">
                                  <div className="relative inline-block w-full min-w-[110px]">
                                    <select
                                      value={tempChange.role}
                                      onChange={(e) => handleRoleChangeLocally(e.target.value as any)}
                                      className={cn(
                                        "appearance-none w-full bg-[#F2F2F7] rounded-[8px] text-xs font-bold pl-2.5 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#4A5DF9] border border-transparent cursor-pointer",
                                        tempChange.role === "ADMIN" ? "text-[#FF3B30] bg-[#FF3B30]/5 font-extrabold" : "text-[#1C1C1E]"
                                      )}
                                    >
                                      <option value="USER">일반 사용자</option>
                                      <option value="ADMIN">관리자</option>
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8E93] pointer-events-none" />
                                  </div>
                                </td>

                                <td className="py-2 px-4 whitespace-nowrap">
                                  <div className="relative inline-block w-full min-w-[110px]">
                                    <select
                                      value={tempChange.status}
                                      onChange={(e) => handleStatusChangeLocally(e.target.value as any)}
                                      className={cn(
                                        "appearance-none w-full rounded-[8px] text-xs font-extrabold pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#4A5DF9] border border-transparent cursor-pointer transition-all",
                                        tempChange.status === "ACTIVE" && "bg-[#34C759]/10 text-[#34C759]",
                                        tempChange.status === "SUSPENDED" && "bg-[#FF9500]/10 text-[#FF9500]",
                                        tempChange.status === "QUIT" && "bg-[#8E8E93]/10 text-[#8E8E93]"
                                      )}
                                    >
                                      <option value="ACTIVE block">활성</option>
                                      <option value="SUSPENDED">정지</option>
                                      <option value="QUIT">탈퇴</option>
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8E93] pointer-events-none" />
                                  </div>
                                </td>
                                
                                <td className="py-2 px-4 text-center tabular-nums text-[#8E8E93] font-medium whitespace-nowrap">{user.accountNo}</td>
                                <td className="py-2 px-4 text-center tabular-nums text-[#8E8E93] whitespace-nowrap">{user.joinedAt}</td>
                                <td className="py-2 px-4 text-center whitespace-nowrap">
                                  <button
                                    disabled={!hasPendingChanges}
                                    onClick={applyModifications}
                                    className={cn(
                                      "px-3 py-1.5 rounded-[8px] text-xs font-extrabold transition-all duration-200",
                                      hasPendingChanges 
                                        ? "bg-[#4A5DF9] text-white hover:bg-[#4A5DF9]/95 cursor-pointer shadow-sm"
                                        : "bg-[#F2F2F7] text-[#8E8E93] cursor-not-allowed"
                                    )}
                                  >
                                    적용
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2.5 POSTS VIEW */}
            {activeTab === "posts" && (
              <div id="admin-posts-panel" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">게시글 관리</h1>
                    <p className="text-[#8E8E93] text-[14px]">커뮤니티 광장에 업로드된 게시물의 상태 모니터링 및 노출 제한 관리를 수행합니다</p>
                  </div>
                </div>

                {/* Filter and Table Card */}
                <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden">
                  <div className="p-4 border-b border-[#E5E5EA] flex flex-wrap gap-4 items-center justify-between bg-white">
                    <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                      <div className="relative w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#636C7D] w-4.5 h-4.5" />
                        <input 
                          type="text" 
                          placeholder="작성자 닉네임 또는 게시글 제목 검색"
                          value={postSearchQuery}
                          onChange={(e) => setPostSearchQuery(e.target.value)}
                          className="w-full bg-[#F2F2F7] border border-transparent rounded-[16px] pl-10 pr-4 py-2 text-[14px] outline-none focus:bg-white focus:border-[#4A5DF9] transition-all"
                        />
                      </div>
                      
                      <div className="relative">
                        <select
                          value={postFilterTab}
                          onChange={(e) => setPostFilterTab(e.target.value as any)}
                          className="appearance-none bg-[#F2F2F7] rounded-[12px] border border-transparent text-[#1C1C1E] text-[13px] font-bold pl-3.5 pr-9 py-2 outline-none hover:bg-[#E5E5EA] transition cursor-pointer"
                        >
                          <option value="ALL">전체 게시글</option>
                          <option value="ACTIVE">활성 상태 (ACTIVE)</option>
                          <option value="DELETED">삭제됨 (DELETED)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93] pointer-events-none" />
                      </div>
                    </div>

                    <div className="text-[13px] text-[#8E8E93] font-bold">
                      검색 결과: {posts.filter(p => {
                        const query = postSearchQuery.toLowerCase();
                        const matchSearch = p.author.toLowerCase().includes(query) || p.title.toLowerCase().includes(query) || p.content.toLowerCase().includes(query);
                        const matchStat = postFilterTab === "ALL" || p.status === postFilterTab;
                        return matchSearch && matchStat;
                      }).length}개
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                          <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">No.</th>
                          <th className="py-3.5 px-4 whitespace-nowrap">제목</th>
                          <th className="py-3.5 px-4 whitespace-nowrap">작성자</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">작성 일자</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">조회수</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">추천수</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">댓글수</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">상태</th>
                          <th className="py-3.5 px-4 text-center w-[200px] whitespace-nowrap">관리 작업</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {posts
                          .filter((p) => {
                            const query = postSearchQuery.toLowerCase();
                            const matchSearch = p.author.toLowerCase().includes(query) || p.title.toLowerCase().includes(query) || p.content.toLowerCase().includes(query);
                            const matchStat = postFilterTab === "ALL" || p.status === postFilterTab;
                            return matchSearch && matchStat;
                          })
                          .map((post, idx) => {
                            const handlePostStatus = (nextStat: "ACTIVE" | "DELETED") => {
                              setPosts(prev => prev.map(item => item.id === post.id ? { ...item, status: nextStat } : item));
                              triggerToast(`게시글 [${post.title}]이(가) [${nextStat === "ACTIVE" ? "활성" : "삭제"}] 처리되었습니다.`);
                              logAdminAction("게시글", post.title, `게시글 상태를 [${nextStat === "ACTIVE" ? "활성" : "삭제됨"}]으로 설정 변경하였습니다.`);
                            };

                            return (
                              <tr key={post.id} className="h-[60px] hover:bg-[#FAFAFA] transition-colors text-sm">
                                <td className="py-2 px-4 text-center font-bold text-[#8E8E93] whitespace-nowrap">{idx + 1}</td>
                                <td className="py-2 px-4 font-bold text-[#1C1C1E] max-w-xs truncate whitespace-nowrap" title={post.title}>
                                  {post.title}
                                </td>
                                <td className="py-2 px-4 font-semibold text-[#1C1C1E] whitespace-nowrap">{post.author}</td>
                                <td className="py-2 px-4 text-center text-[#8E8E93] tabular-nums whitespace-nowrap">{post.date}</td>
                                <td className="py-2 px-4 text-center font-medium text-[#1C1C1E] tabular-nums whitespace-nowrap">{post.views}</td>
                                <td className="py-2 px-4 text-center font-medium text-brand tabular-nums whitespace-nowrap">{post.likes}</td>
                                <td className="py-2 px-4 text-center font-medium text-[#FF9500] tabular-nums whitespace-nowrap">{post.commentsCount}</td>
                                <td className="py-2 px-4 text-center whitespace-nowrap">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-[16px] text-xs font-black inline-block",
                                    post.status === "ACTIVE" ? "bg-[#34C759]/11 text-[#34C759]" : "bg-[#FF3B30]/11 text-[#FF3B30]"
                                  )}>
                                    {post.status === "ACTIVE" ? "활성" : "삭제됨"}
                                  </span>
                                </td>
                                <td className="py-2 px-4 text-center whitespace-nowrap">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => setSelectedPostDetail(post)}
                                      className="px-2.5 py-1.5 bg-[#4A5DF9]/10 text-[#4A5DF9] hover:bg-[#4A5DF9]/20 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                    >
                                      상세
                                    </button>
                                    {post.status === "ACTIVE" ? (
                                      <button
                                        onClick={() => handlePostStatus("DELETED")}
                                        className="px-2.5 py-1.5 border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/5 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                      >
                                        삭제
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handlePostStatus("ACTIVE")}
                                        className="px-2.5 py-1.5 bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                      >
                                        복구
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. REPORTS VIEW */}
            {activeTab === "reports" && (
              <div id="admin-reports-panel" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">신고 관리</h1>
                    <p className="text-[#8E8E93] text-[14px]">사용자들이 신고한 불건전한 게시글 및 채팅 차단 관리소입니다</p>
                  </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1 bg-[#F2F2F7] p-1 rounded-[12px] w-fit">
                  {[
                    { key: "전체", count: reports.length },
                    { key: "미처리", count: reports.filter(r => r.status === "미처리").length, badge: true },
                    { key: "처리완료", count: reports.filter(r => r.status === "처리완료").length },
                    { key: "반려", count: reports.filter(r => r.status === "반려").length },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setReportFilterTab(tab.key as any)}
                      className={cn(
                        "px-4 py-2 text-xs font-bold rounded-[10px] transition-all duration-200 flex items-center gap-1.5",
                        reportFilterTab === tab.key 
                          ? "bg-white text-[#1C1C1E] shadow-sm"
                          : "text-[#8E8E93] hover:text-[#1C1C1E]"
                      )}
                    >
                      <span>{tab.key}</span>
                      {tab.count > 0 && (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                          tab.key === "미처리" ? "bg-[#FF3B30] text-white" : "bg-[#8E8E93]/20 text-[#8E8E93]"
                        )}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                          <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">No.</th>
                          <th className="py-3.5 px-4 whitespace-nowrap">신고자</th>
                          <th className="py-3.5 px-4 w-28 whitespace-nowrap">대상 유형</th>
                          <th className="py-3.5 px-4 whitespace-nowrap">신고 대상 및 내용</th>
                          <th className="py-3.5 px-4 w-32 whitespace-nowrap">신고 사유</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">신고 일자</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">상태</th>
                          <th className="py-3.5 px-4 text-center w-[180px] whitespace-nowrap">처리 동작</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {reports
                          .filter((r) => {
                            if (reportFilterTab === "전체") return true;
                            return r.status === reportFilterTab;
                          })
                          .map((report, idx) => {
                            const handleReportStatus = (nextStat: "처리완료" | "반려") => {
                              setReports(prev => prev.map(item => item.id === report.id ? { ...item, status: nextStat } : item));
                              triggerToast(`신고 건번호 #${report.id}가 [${nextStat}]로 지정되었습니다.`);
                              logAdminAction("기타", `신고 #${report.id}`, `신고 대상을 [${nextStat === "처리완료" ? "삭제처리" : "반려"}] 지정하였습니다.`);
                            };

                            return (
                              <tr key={report.id} className="h-[60px] hover:bg-[#FAFAFA] transition-colors text-sm">
                                <td className="py-2 px-4 text-center font-bold text-[#8E8E93] whitespace-nowrap">{idx + 1}</td>
                                <td className="py-2 px-4 font-bold text-[#1C1C1E] whitespace-nowrap">{report.reporter}</td>
                                <td className="py-2 px-4 whitespace-nowrap">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block",
                                    report.targetType === "게시글" && "bg-[#BF5AF2]/11 text-[#BF5AF2]",
                                    report.targetType === "댓글" && "bg-[#FF9500]/11 text-[#FF9500]",
                                    report.targetType === "채팅" && "bg-[#4A5DF9]/11 text-[#4A5DF9]"
                                  )}>
                                    {report.targetType}
                                  </span>
                                </td>
                                <td className="py-2 px-4 font-semibold text-[#1C1C1E] max-w-sm truncate whitespace-nowrap" title={report.content}>
                                  {report.content}
                                </td>
                                <td className="py-2 px-4 whitespace-nowrap">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block",
                                    report.reason === "욕설비방" && "bg-[#FF3B30]/11 text-[#FF3B30]",
                                    report.reason === "광고도배" && "bg-[#FF9500]/11 text-[#FF9500]",
                                    report.reason === "불법촬영" && "bg-[#FF3B30]/11 text-[#FF3B30]",
                                    report.reason === "기타" && "bg-[#8E8E93]/11 text-[#8E8E93]"
                                  )}>
                                    {report.reason}
                                  </span>
                                </td>
                                <td className="py-2 px-4 text-center text-[#8E8E93] tabular-nums whitespace-nowrap">{report.date}</td>
                                <td className="py-2 px-4 text-center whitespace-nowrap">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block",
                                    report.status === "미처리" && "bg-[#FF3B30]/11 text-[#FF3B30]",
                                    report.status === "처리완료" && "bg-[#34C759]/11 text-[#34C759]",
                                    report.status === "반려" && "bg-[#8E8E93]/11 text-[#8E8E93]"
                                  )}>
                                    {report.status}
                                  </span>
                                </td>
                                <td className="py-2 px-4 text-center whitespace-nowrap">
                                  {report.status === "미처리" ? (
                                    <div className="flex gap-2 justify-center">
                                      <button
                                        onClick={() => handleReportStatus("처리완료")}
                                        className="px-2.5 py-1.5 border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/5 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                      >
                                        삭제 처리
                                      </button>
                                      <button
                                        onClick={() => handleReportStatus("반려")}
                                        className="px-2.5 py-1.5 bg-[#F2F2F7] text-[#8E8E93] hover:text-[#1C1C1E] text-xs font-bold rounded-[8px] transition cursor-pointer"
                                      >
                                        반려
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-2 justify-center">
                                      <span className="px-2.5 py-1.5 bg-[#F2F2F7] text-[#8E8E93] text-xs font-bold rounded-[8px] select-none text-center inline-block cursor-default">
                                        처리 종결
                                      </span>
                                      <button
                                        onClick={() => setReportDetailModal({ isOpen: true, report })}
                                        className="px-2.5 py-1.5 bg-[#4A5DF9] text-white hover:bg-[#4A5DF9]/90 text-xs font-bold rounded-[8px] transition cursor-pointer text-center inline-block"
                                      >
                                        확인
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 4. INQUIRIES VIEW */}
            {activeTab === "inquiries" && (
              <div id="admin-inquiries-panel" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">1:1 문의 관리</h1>
                    <p className="text-[#8E8E93] text-[14px]">사용자들이 접수한 건의사항 및 기술지원 건을 검토하고 답변합니다</p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 bg-[#F2F2F7] p-1 rounded-[12px] w-fit">
                  {[
                    { key: "전체", count: inquiries.length },
                    { key: "미답변", count: inquiries.filter(i => i.status === "미답변").length },
                    { key: "답변완료", count: inquiries.filter(i => i.status === "답변완료").length },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setInquiryFilterTab(tab.key as any)}
                      className={cn(
                        "px-4 py-2 text-xs font-bold rounded-[10px] transition-all duration-200 flex items-center gap-1.5",
                        inquiryFilterTab === tab.key 
                          ? "bg-white text-[#1C1C1E] shadow-sm"
                          : "text-[#8E8E93] hover:text-[#1C1C1E]"
                      )}
                    >
                      <span>{tab.key}</span>
                      {tab.key === "미답변" && tab.count > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9500] text-white">
                          {tab.count}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8E8E93]/20 text-[#8E8E93]">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Inquiries Table */}
                <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                          <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">No.</th>
                          <th className="py-3.5 px-4 w-32 whitespace-nowrap">작성자</th>
                          <th className="py-3.5 px-4 whitespace-nowrap">문의 제목</th>
                          <th className="py-3.5 px-4 text-center w-40 whitespace-nowrap">접수 날짜</th>
                          <th className="py-3.5 px-4 text-center w-28 whitespace-nowrap">상태</th>
                          <th className="py-3.5 px-4 text-center w-36 whitespace-nowrap">답변 제어</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {inquiries
                          .filter((i) => {
                            if (inquiryFilterTab === "전체") return true;
                            return i.status === inquiryFilterTab;
                          })
                          .map((inquiry, idx) => (
                            <tr key={inquiry.id} className="h-[60px] hover:bg-[#FAFAFA] transition-colors text-sm">
                              <td className="py-2 px-4 text-center font-bold text-[#8E8E93] whitespace-nowrap">{idx + 1}</td>
                              <td className="py-2 px-4 font-bold text-[#1C1C1E] whitespace-nowrap">{inquiry.author}</td>
                              <td className="py-2 px-4 font-semibold text-[#1C1C1E] max-w-sm truncate whitespace-nowrap">{inquiry.title}</td>
                              <td className="py-2 px-4 text-center text-[#8E8E93] tabular-nums whitespace-nowrap">{inquiry.date}</td>
                              <td className="py-2 px-4 text-center whitespace-nowrap">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block",
                                  inquiry.status === "미답변" ? "bg-[#FF9500]/11 text-[#FF9500]" : "bg-[#34C759]/11 text-[#34C759]"
                                )}>
                                  {inquiry.status}
                                </span>
                              </td>
                              <td className="py-2 px-4 text-center whitespace-nowrap">
                                {inquiry.status === "미답변" ? (
                                  <button
                                    onClick={() => {
                                      setAnswerText("");
                                      setAnswerModal({ isOpen: true, inquiry });
                                    }}
                                    className="px-3.5 py-1.5 bg-[#4A5DF9] text-white hover:bg-[#4A5DF9]/90 text-xs font-bold rounded-[8px] transition shadow-sm cursor-pointer"
                                  >
                                    답변하기
                                  </button>
                                ) : (
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => {
                                        setAnswerText(inquiry.answer || "");
                                        setAnswerModal({ isOpen: true, inquiry });
                                      }}
                                      className="px-3.5 py-1.5 bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                    >
                                      답변보기
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 5. COMPETITIONS VIEW */}
            {activeTab === "competitions" && (
              <div id="admin-competitions-panel" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">대회 및 상금 관리</h1>
                    <p className="text-[#8E8E93] text-[14px]">웹 서비스상에 열려있는 주식 실시간 및 게릴라 모의투자 대회를 기획하고 배포합니다</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewCompTitle("");
                      setNewCompDescription("");
                      setNewCompStartDate("");
                      setNewCompEndDate("");
                      setNewCompInitialAmount("1000");
                      setNewCompMaxParticipants("1000");
                      setNewCompIsSecret(false);
                      setNewCompPassword("");
                      setNewCompIsOfficial(false);
                      setAllowedStocks([]);
                      setStockSearch("");
                      setIsSearchFocused(false);
                      setNewCompModal(true);
                    }}
                    className="bg-[#4A5DF9] hover:bg-[#4A5DF9]/90 text-white font-bold text-[13px] px-4 py-2.5 rounded-[12px] flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>새 대회 등록</span>
                  </button>
                </div>

                {/* Competition History Table */}
                <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                          <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">No.</th>
                          <th className="py-3.5 px-4 whitespace-nowrap">대회명</th>
                          <th className="py-3.5 px-4 w-60 text-center whitespace-nowrap">대회 기간</th>
                          <th className="py-3.5 px-4 text-right whitespace-nowrap">시드머니</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">참가 인원</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">대회 상태</th>
                          <th className="py-3.5 px-4 text-center w-28 whitespace-nowrap">공개 처리</th>
                          <th className="py-3.5 px-4 text-center w-[160px] whitespace-nowrap">관리 제어</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {competitions.map((comp, idx) => {
                          const toggleOpenStatus = () => {
                            setCompetitions(prev => prev.map(c => c.id === comp.id ? { ...c, isOpen: !c.isOpen } : c));
                            triggerToast(`${comp.title}의 공개상태를 노출 ${!comp.isOpen ? "ON" : "OFF"} 하였습니다.`);
                            logAdminAction("기타", comp.title, `대회 공개여부를 [${!comp.isOpen ? "공개" : "비공개"}]로 설정 변경하였습니다.`);
                          };

                          const handleDeleteComp = () => {
                            setCompetitions(prev => prev.filter(c => c.id !== comp.id));
                            triggerToast(`${comp.title}이 성공적으로 파기/삭제 되었습니다.`);
                            logAdminAction("기타", comp.title, `대회 파기 및 강제 해산 처리를 수행하였습니다.`);
                          };

                          return (
                            <tr key={comp.id} className="h-[60px] hover:bg-[#FAFAFA] transition-colors text-sm">
                              <td className="py-2 px-4 text-center font-bold text-[#8E8E93] whitespace-nowrap">{idx + 1}</td>
                              <td className="py-2 px-4 font-bold text-[#1C1C1E] whitespace-nowrap">{comp.title}</td>
                              <td className="py-2 px-4 text-center font-medium text-[#8E8E93] tabular-nums whitespace-nowrap">
                                {comp.startDate} ~ {comp.endDate}
                              </td>
                              <td className="py-2 px-4 text-right font-bold text-[#1C1C1E] tabular-nums whitespace-nowrap">
                                ₩{comp.seedMoney.toLocaleString()}
                              </td>
                              <td className="py-2 px-4 text-center text-[#8E8E93] tabular-nums font-semibold whitespace-nowrap">{(compParticipants[comp.id]?.length ?? comp.participants)}명</td>
                              <td className="py-2 px-4 text-center whitespace-nowrap">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block",
                                  comp.status === "WAITING" && "bg-[#FF9500]/11 text-[#FF9500]",
                                  comp.status === "ONGOING" && "bg-[#34C759]/11 text-[#34C759]",
                                  comp.status === "FINISHED" && "bg-[#8E8E93]/11 text-[#8E8E93]"
                                )}>
                                  {comp.status === "WAITING" ? "대기 중" : comp.status === "ONGOING" ? "진행 중" : "종료됨"}
                                </span>
                              </td>
                              <td className="py-2 px-4 text-center whitespace-nowrap">
                                {/* Toggle switch style ON / OFF */}
                                <button
                                  onClick={toggleOpenStatus}
                                  className={cn(
                                    "w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative duration-200 inline-block",
                                    comp.isOpen ? "bg-[#4A5DF9]" : "bg-[#E5E5EA]"
                                  )}
                                >
                                  <div className={cn(
                                    "w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                                    comp.isOpen ? "translate-x-5" : "translate-x-0"
                                  )} />
                                </button>
                              </td>
                              <td className="py-2 px-4 text-center whitespace-nowrap">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => {
                                      setSelectedCompForParticipants(comp);
                                      setParticipantsModalOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 border border-[#10B981] text-[#10B981] hover:bg-[#10B981]/5 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                  >
                                    참가자
                                  </button>
                                  <button
                                    onClick={() => triggerToast("수정 기능은 현재 테스트 단계입니다.")}
                                    className="px-2.5 py-1.5 border border-[#4A5DF9] text-[#4A5DF9] hover:bg-[#4A5DF9]/5 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={handleDeleteComp}
                                    className="px-2.5 py-1.5 border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/5 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 6. LOG MONITORING VIEW */}
            {activeTab === "logs" && (
              <div id="admin-logs-panel" className="space-y-4">
                <div>
                  <h1 className="text-[24px] font-bold text-[#1C1C1E]">관리자 로그 모니터링</h1>
                  <p className="text-[#8E8E93] text-[14px]">관리자 페이지에서 이루어진 모든 활동 내역 및 상태 변경 로그를 실시간으로 기록 및 모니터링합니다</p>
                </div>

                {/* Main Table & Filter Card Combined */}
                <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden shadow-sm">
                  {/* Embedded Header for Filter and Search */}
                  <div className="p-4 border-b border-[#E5E5EA] flex flex-wrap gap-4 items-center justify-between bg-white animate-in fade-in duration-300">
                    {/* Left: Search Bar on Left Side */}
                    <div className="flex items-center gap-4 flex-1 min-w-[280px]">
                      <div className="w-72 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#636C7D] w-4.5 h-4.5" />
                        <input 
                          type="text" 
                          placeholder="수행 대상 IP 또는 활동 내용 검색"
                          value={logSearchQuery}
                          onChange={(e) => {
                            setLogSearchQuery(e.target.value);
                            setLogPage(1);
                          }}
                          className="w-full bg-[#F2F2F7] border border-transparent rounded-[16px] pl-10 pr-4 py-2 text-[13.5px] outline-none focus:bg-white focus:border-[#4A5DF9] transition-all"
                        />
                      </div>
                      <div className="text-[13px] text-[#8E8E93] font-bold hidden sm:inline-block">
                        총 <span className="text-[#1C1C1E] font-black">{
                          logs.filter((l) => {
                            const matchTab = logMonitoringTab === "전체" || l.type === logMonitoringTab;
                            const query = logSearchQuery.toLowerCase();
                            const matchQuery = l.ip.includes(query) || l.content.toLowerCase().includes(query) || l.target.toLowerCase().includes(query);
                            return matchTab && matchQuery;
                          }).length
                        }</span>건의 기록
                      </div>
                    </div>

                    {/* Right: Dropdown Select Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#8E8E93]">로그 필터:</span>
                      <div className="relative inline-block w-44">
                        <select
                          value={logMonitoringTab}
                          onChange={(e) => {
                            setLogMonitoringTab(e.target.value as any);
                            setLogPage(1);
                          }}
                          className="appearance-none w-full bg-[#F2F2F7] border border-[#E5E5EA] rounded-[12px] text-xs font-extrabold pl-3.5 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-[#4A5DF9] cursor-pointer"
                        >
                          <option value="전체">전체 활동</option>
                          <option value="접속">접속/세션 만료</option>
                          <option value="대회">대회 개설/해산</option>
                          <option value="문의">문의답변 처리</option>
                          <option value="회원수정">회원 권한/상태 설정</option>
                          <option value="신고처리">신고 제재 처리</option>
                          <option value="기타">기타 활동</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                          <th className="py-3 px-4 w-44 whitespace-nowrap">일시</th>
                          <th className="py-3 px-4 w-28 whitespace-nowrap">활동 유형</th>
                          <th className="py-3 px-4 w-36 whitespace-nowrap">수행 대상</th>
                          <th className="py-3 px-4 whitespace-nowrap">활동 기록 및 내용</th>
                          <th className="py-3 px-4 w-36 text-center whitespace-nowrap">접속 IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {logs
                          .filter((l) => {
                            const matchTab = logMonitoringTab === "전체" || l.type === logMonitoringTab;
                            const query = logSearchQuery.toLowerCase();
                            const matchQuery = l.ip.includes(query) || l.content.toLowerCase().includes(query) || l.target.toLowerCase().includes(query);
                            return matchTab && matchQuery;
                          })
                          .map((log) => (
                            <tr key={log.id} className="h-[52px] hover:bg-[#FAFAFA] transition-colors text-sm font-medium text-[#1C1C1E]">
                              <td className="py-2 px-4 text-[#8E8E93] tabular-nums whitespace-nowrap">{log.date}</td>
                              <td className="py-2 px-4 whitespace-nowrap">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block",
                                  log.type === "접속" && "bg-[#4A5DF9]/11 text-[#4A5DF9]",
                                  log.type === "대회" && "bg-[#007AFF]/11 text-[#007AFF]",
                                  log.type === "문의" && "bg-[#30D158]/11 text-[#30D158]",
                                  log.type === "회원수정" && "bg-[#FF9500]/11 text-[#FF9500]",
                                  log.type === "신고처리" && "bg-[#FF3B30]/11 text-[#FF3B30]",
                                  log.type === "기타" && "bg-[#8E8E93]/11 text-[#8E8E93]"
                                )}>
                                  {log.type}
                                </span>
                              </td>
                              <td className="py-2 px-4 font-bold text-[#1C1C1E] whitespace-nowrap">{log.target}</td>
                              <td className="py-2 px-4 text-[#3A3A3C] font-semibold whitespace-nowrap">{log.content}</td>
                              <td className="py-2 px-4 text-center text-[#8E8E93] tabular-nums font-semibold whitespace-nowrap">{log.ip}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination bar */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[12px] font-bold text-[#8E8E93]">Showing 1-{Math.min(9, logs.length)} of {logs.length} logs</span>
                  
                  <div className="flex items-center gap-1.5">
                    <button className="p-2 bg-white border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:border-[#8E8E93] rounded-[8px] transition cursor-pointer">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[1].map((page) => (
                      <button
                        key={page}
                        onClick={() => triggerToast(`페이지 ${page}로 이동했습니다.`)}
                        className={cn(
                          "w-8 h-8 text-[12px] font-bold rounded-[8px] flex items-center justify-center transition cursor-pointer",
                          page === 1 
                            ? "bg-[#4A5DF9] text-white shadow-sm"
                            : "bg-white border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:border-[#8E8E93]"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    <button className="p-2 bg-white border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:border-[#8E8E93] rounded-[8px] transition cursor-pointer">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODALS PORTAL SECTION
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      {/* 1. SUSPENSION MODAL (상태정지 상세모달) */}
      {suspensionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] w-full max-w-[440px] p-8 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSuspensionModal({ isOpen: false, userId: null })}
              className="absolute top-5 right-5 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-[19px] font-bold text-[#1C1C1E]">회원 제재 처리</h2>
              <p className="text-[#8E8E93] text-[13px]">지정된 사용자가 서비스를 악용하는 사례가 적발될 시 제한을 적용합니다</p>
            </div>

            {/* Target account panel */}
            {(() => {
              const targetUser = users.find(u => u.id === suspensionModal.userId);
              return targetUser ? (
                <div className="bg-[#F2F2F7] rounded-[12px] p-3 flex items-center gap-3">
                  <img src={targetUser.avatar} alt="avatar" className="flex-shrink-0 w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="text-[13px] font-bold text-[#1C1C1E]">{targetUser.nickname}</p>
                    <p className="text-[11px] text-[#8E8E93]">{targetUser.email}</p>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Expire settings */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#8E8E93] uppercase">상태정지 기간 설정 (일)</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={suspensionTime}
                  onChange={(e) => setSuspensionTime(e.target.value)}
                  className="flex-1 bg-[#F2F2F7] border border-transparent rounded-[12px] px-3.5 py-2.5 text-[14px] font-semibold outline-none focus:bg-white focus:border-[#FF3B30] transition"
                  placeholder="예: 7, 30, -1"
                />
              </div>
              <p className="text-[11px] font-bold text-[#FF3B30]">-1 입력 시 영구 정지</p>
            </div>

            {/* Cause specification */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#8E8E93] uppercase">이유 및 사유 기재</label>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={3}
                placeholder="사용자 제재 적용의 구체적인 약관 위배 사항을 기록하여 고지함에 대비해주십시오."
                className="w-full bg-[#F2F2F7] border border-transparent rounded-[12px] p-3.5 text-[13px] outline-none focus:bg-white focus:border-[#FF3B30] resize-none transition"
              />
            </div>

            {/* Predefined info box */}
            <div className="bg-[#FF9500]/8 border-l-3 border-[#FF9500] rounded-r-lg p-3.5 text-[11.5px] leading-relaxed text-[#FF9500] font-medium">
              신고 및 제재 처리를 확정하면 해당 즉시 해당 계정의 모의거래, 게시글 작성, 프로필 변경 등이 전체 차단되거나 탈퇴 준한 제한이 걸립니다.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSuspensionModal({ isOpen: false, userId: null })}
                className="flex-1 py-3 border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:border-[#8E8E93] transition text-[13px] font-bold rounded-[12px]"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (suspensionModal.userId) {
                    setModifiedUsers(prev => ({
                      ...prev,
                      [suspensionModal.userId!]: { ...(prev[suspensionModal.userId!] || { role: "USER", status: "ACTIVE" }), status: "SUSPENDED" }
                    }));
                    triggerToast("정지 상태가 대기열에 등록되었습니다. [ 적용 ] 버튼을 누르시면 효력이 적용됩니다.");
                  }
                  setSuspensionModal({ isOpen: false, userId: null });
                }}
                className="flex-1 py-3 bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90 transition text-[13px] font-bold rounded-[12px] shadow-sm cursor-pointer"
              >
                정지 적용
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. ACTIVITY LOG MODAL (활동 로그 상세모달) */}
      {activityModal.isOpen && activityModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] w-full max-w-[640px] p-8 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-5 relative">
            <button 
              onClick={() => setActivityModal({ isOpen: false, user: null })}
              className="absolute top-5 right-5 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-[19px] font-bold text-[#1C1C1E]">{activityModal.user.nickname}님의 실시간 활동 로그</h2>
              <p className="text-[#8E8E93] text-[13px]">선택된 회원이 수행한 시스템상 주요 변경 및 매매 전파 내역입니다</p>
            </div>

            {/* Profile banner */}
            <div className="bg-[#F2F2F7] rounded-[16px] p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={activityModal.user.avatar} alt="avatar" className="flex-shrink-0 w-11 h-11 rounded-full object-cover" />
                <div>
                  <p className="text-[14px] font-bold text-[#1C1C1E]">{activityModal.user.nickname}</p>
                  <p className="text-[12px] text-[#8E8E93]">{activityModal.user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[#8E8E93]">가입일</p>
                <p className="text-[13px] font-bold text-[#1C1C1E] tabular-nums">{activityModal.user.joinedAt}</p>
              </div>
            </div>

            {/* Filter Tabs in log modal */}
            <div className="flex gap-1.5 border-b border-[#E5E5EA] pb-1 overflow-x-auto">
              {["전체", "매수", "매도", "게시글", "댓글", "대회참가", "대회퇴장", "기타"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLogFilter(tab)}
                  className={cn(
                    "pb-1.5 px-2 text-[12.5px] font-bold transition-all relative border-b-2 whitespace-nowrap cursor-pointer",
                    logFilter === tab
                      ? "border-[#4A5DF9] text-[#4A5DF9]"
                      : "border-transparent text-[#8E8E93] hover:text-[#1C1C1E]"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Scrollable Log table */}
            <div className="max-h-[300px] overflow-y-auto border border-[#E5E5EA] rounded-[12px] bg-[#F2F2F7]/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA] sticky top-0">
                    <th className="py-2.5 px-4 w-40 whitespace-nowrap">일시</th>
                    <th className="py-2.5 px-4 w-24 whitespace-nowrap">활동유형</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">내용</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA]">
                  {userLogs
                    .filter((log) => {
                      const isOwner = log.userId === activityModal.user.id || log.target === activityModal.user.nickname;
                      if (!isOwner) return false;
                      if (logFilter === "전체") return true;
                      return log.type === logFilter;
                    })
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-[#FAFAFA] transition text-xs font-semibold">
                        <td className="py-3 px-4 text-[#8E8E93] tabular-nums whitespace-nowrap">{log.date}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={cn(
                            "px-2 py-0.5 rounded-[12px] text-[10.5px] font-black uppercase inline-block",
                            log.type === "매수" && "bg-[#FF3B30]/10 text-[#FF3B30]",
                            log.type === "매도" && "bg-[#007AFF]/10 text-[#007AFF]",
                            log.type === "게시글" && "bg-[#BF5AF2]/10 text-[#BF5AF2]",
                            log.type === "댓글" && "bg-[#FF9500]/10 text-[#FF9500]",
                            log.type === "대회참가" && "bg-[#34C759]/10 text-[#34C759]",
                            log.type === "대회퇴장" && "bg-[#FF2D55]/10 text-[#FF2D55]",
                            log.type === "기타" && "bg-[#8E8E93]/10 text-[#8E8E93]"
                          )}>
                            {log.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#121212] font-semibold leading-relaxed">{log.content}</td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {userLogs.filter((log) => {
                const isOwner = log.userId === activityModal.user.id || log.target === activityModal.user.nickname;
                if (!isOwner) return false;
                if (logFilter === "전체") return true;
                return log.type === logFilter;
              }).length === 0 && (
                <div className="py-12 text-center text-[#8E8E93] text-[13px] font-bold">
                  이 분류의 활동 로그 기록이 비어있습니다.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setActivityModal({ isOpen: false, user: null })}
                className="bg-[#1C1C1E] hover:bg-black text-white px-5 rounded-[12px]"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ANSWER INQUIRY MODAL (1:1 문의 답변 및 작성 창) */}
      {answerModal.isOpen && answerModal.inquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] w-full max-w-[680px] p-8 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-5 relative">
            <button 
              onClick={() => setAnswerModal({ isOpen: false, inquiry: null })}
              className="absolute top-5 right-5 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pb-2 border-b border-[#E5E5EA]">
              <h2 className="text-[19px] font-bold text-[#1C1C1E]">1:1 고객문의 처리</h2>
              <p className="text-[#8E8E93] text-[13px]">고객이 접수한 불편 애로사항을 청취해 성실히 전문성 있게 자문 처리해 주십시오</p>
            </div>

            {/* Left and Right Split Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Left Panel: Query content display view only */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#4A5DF9]/10 text-[#4A5DF9] text-[10px] font-bold px-1.5 py-0.5 rounded">유저접수본</span>
                    <span className="text-[12px] text-[#8E8E93] tabular-nums">{answerModal.inquiry.date}</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-[#1C1C1E] leading-snug">{answerModal.inquiry.title}</h4>
                  
                  <div className="h-[200px] overflow-y-auto bg-[#F2F2F7] rounded-[12px] p-4 text-[13px] text-[#333] font-medium leading-relaxed mt-2.5">
                    {answerModal.inquiry.content}
                  </div>
                </div>

                <div className="text-[12px] text-[#8E8E93] font-semibold">
                  작성자: <span className="text-[#1C1C1E] font-bold">{answerModal.inquiry.author}</span>
                </div>
              </div>

              {/* Right Panel: Admin Response editor area */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[12px] font-bold text-[#8E8E93] uppercase">처리 답변 기재 창</label>
                    {answerModal.inquiry.status === "답변완료" && (
                      <span className="bg-[#34C759]/11 text-[#34C759] text-[10px] font-bold px-1.5 py-0.5 rounded">답변 완료본 복수 수정</span>
                    )}
                  </div>
                  
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="인사말, 해당 이슈에 대한 팩트체크 및 조치 예정 사항 등을 상세히 기답해 주시기 바랍니다."
                    className="w-full h-[200px] bg-[#F2F2F7] border border-transparent rounded-[12px] p-3.5 text-[13px] outline-none focus:bg-white focus:border-[#4A5DF9] resize-none transition"
                  />
                </div>

                {/* Confirm Action Button */}
                <div className="flex gap-2">
                  {answerModal.inquiry.status === "답변완료" && (
                    <button
                      onClick={() => {
                        setInquiries(prev => prev.map(item => {
                          if (item.id === answerModal.inquiry!.id) {
                            return {
                              ...item,
                              status: "미답변",
                              answer: undefined,
                              answeredAt: undefined
                            };
                          }
                          return item;
                        }));
                        logAdminAction("기타", `문의 #${answerModal.inquiry!.id}`, `1:1 문의답변 처리를 취소/삭제했습니다.`);
                        triggerToast(`문의 #${answerModal.inquiry!.id}번 답변이 취소되었습니다.`);
                        setAnswerModal({ isOpen: false, inquiry: null });
                      }}
                      className="flex-1 py-3 border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/5 text-[13px] font-bold rounded-[12px] transition cursor-pointer text-center"
                    >
                      답변 취소
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (!answerText.trim()) return;
                      const isEdit = answerModal.inquiry!.status === "답변완료";
                      setInquiries(prev => prev.map(item => {
                        if (item.id === answerModal.inquiry!.id) {
                          return {
                            ...item,
                            status: "답변완료",
                            answer: answerText,
                            answeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
                          };
                        }
                        return item;
                      }));
                      
                      logAdminAction("기타", `문의 #${answerModal.inquiry!.id}`, `1:1 문의에 답변을 ${isEdit ? "수정하여 제출" : "등록"}했습니다.`);
                      triggerToast(`문의 #${answerModal.inquiry!.id}번에 대한 답변이 ${isEdit ? "수정" : "등록"}되었습니다.`);
                      setAnswerModal({ isOpen: false, inquiry: null });
                    }}
                    className="flex-1 py-3 bg-[#4A5DF9] text-white hover:bg-[#4A5DF9]/95 text-[13px] font-bold rounded-[12px] shadow-sm transition cursor-pointer text-center"
                  >
                    {answerModal.inquiry.status === "답변완료" ? "답변 수정" : "답변 등록"}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 5. USER ROW RIGHT-CLICK CONTEXT MENU DROPDOWN */}
      {contextMenu.isOpen && contextMenu.user && (
        <div 
          className="fixed z-[100] bg-white border border-[#E5E5EA] rounded-[12px] shadow-[0_10px_25px_rgba(0,0,0,0.12)] p-1.5 min-w-[150px] animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            top: contextMenu.y, 
            left: contextMenu.x 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setActivityModal({ isOpen: true, user: contextMenu.user });
              setContextMenu({ isOpen: false, x: 0, y: 0, user: null });
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13.5px] font-bold text-[#4A5DF9] hover:bg-[#4A5DF9]/10 rounded-[8px] transition cursor-pointer"
          >
            <Activity className="w-4 h-4 text-[#4A5DF9]" />
            <span>로그 보기</span>
          </button>
        </div>
      )}

      {/* 6. COMPETITION PARTICIPANTS LIST MANAGEMENT MODAL */}
      {participantsModalOpen && selectedCompForParticipants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] w-full max-w-[550px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-5 relative text-[#1C1C1E]">
            <button 
              onClick={() => {
                setParticipantsModalOpen(false);
                setSelectedCompForParticipants(null);
              }}
              className="absolute top-5 right-5 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pb-3 border-b border-[#E5E5EA]">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FFD700]" />
                <h2 className="text-[17px] font-black text-[#1C1C1E]">대회 참가 유저 관리</h2>
              </div>
              <p className="text-[#8E8E93] text-[12.5px] font-semibold">대회명: <span className="text-[#1C1C1E] font-extrabold">{selectedCompForParticipants.title}</span></p>
            </div>

            <div className="max-h-[320px] overflow-y-auto space-y-2.5 pr-1">
              {(!compParticipants[selectedCompForParticipants.id] || compParticipants[selectedCompForParticipants.id].length === 0) ? (
                <div className="py-12 text-center text-[#8E8E93] text-[13px] font-bold">
                  현재 본 대회에 등록된 참가 유저가 없습니다.
                </div>
              ) : (
                compParticipants[selectedCompForParticipants.id].map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-3 rounded-[12px] bg-[#F2F2F7]/50 border border-[#E5E5EA]/40 hover:bg-[#F2F2F7]/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar} 
                        alt="avatar" 
                        className="flex-shrink-0 w-9 h-9 rounded-full object-cover border border-[#E5E5EA] shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="text-[13px] font-extrabold text-[#1C1C1E]">{user.nickname}</div>
                        <div className="text-[11px] font-semibold text-[#8E8E93]">{user.email}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const hasConfirmed = window.confirm(`${user.nickname}님을 본 대회에서 강제 퇴장(실적 박탈) 시키겠습니까?`);
                        if (!hasConfirmed) return;

                        // 1. Remove from compParticipants map
                        setCompParticipants(prev => {
                          const currentList = prev[selectedCompForParticipants.id] || [];
                          const updatedList = currentList.filter(u => u.id !== user.id);
                          const nextMap = {
                            ...prev,
                            [selectedCompForParticipants.id]: updatedList
                          };
                          localStorage.setItem("competition_participants_map", JSON.stringify(nextMap));
                          return nextMap;
                        });

                        // 2. Decrement partition count in competitions list
                        setCompetitions(prev => prev.map(c => {
                          if (c.id === selectedCompForParticipants.id) {
                            return {
                              ...c,
                              participants: Math.max(0, c.participants - 1)
                            };
                          }
                          return c;
                        }));

                        // 3. Log user activity log
                        const expellingLog = {
                          id: Date.now() + Math.floor(Math.random() * 1000),
                          userId: user.id,
                          target: user.nickname,
                          type: "대회퇴장",
                          content: `[${selectedCompForParticipants.title}] 대회에서 운영원칙 위배 및 부종교류 사유로 인해 강제 퇴장(참가 자격 박탈) 조치되었습니다.`,
                          date: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        setUserLogs(prev => {
                          const nextUserLogs = [expellingLog, ...prev];
                          localStorage.setItem("user_activity_logs", JSON.stringify(nextUserLogs));
                          return nextUserLogs;
                        });

                        // 4. Log admin action log
                        logAdminAction("기타", user.nickname, `대회 [${selectedCompForParticipants.title}]에서 회원 [${user.nickname}]을(를) 강제 퇴장 조치 하였습니다.`);

                        // 5. Toast notification
                        triggerToast(`${user.nickname}님이 본 대회에서 성공적으로 퇴장 조치되었습니다.`);
                      }}
                      className="px-3 py-1.5 rounded-[8px] bg-[#FF3B30]/10 text-[#FF3B30] text-[11.5px] font-black hover:bg-[#FF3B30] hover:text-white transition cursor-pointer"
                    >
                      강제퇴장
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setParticipantsModalOpen(false);
                  setSelectedCompForParticipants(null);
                }}
                className="px-4 py-2 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] text-[12.5px] font-bold rounded-[10px] transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. NEW COMPETITION MODAL (새 대회 기획 등록 모달) */}
      {newCompModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-border-color rounded-[20px] w-full max-w-[500px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setNewCompModal(false)}
              className="absolute top-5 right-5 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer z-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 pb-1">
              <h2 className="text-[20px] font-bold text-text-primary">새로운 투자제 투어 대회 기획</h2>
              <p className="text-[13px] text-text-secondary leading-relaxed">상금이 활성화되는 특별 챌린지 또는 대학생 리그를 구성하여 퍼블리싱 합니다</p>
            </div>

            <div className="space-y-6">
              {/* 대회 명칭 */}
              <div className="flex flex-col gap-3">
                <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                  대회 이름
                </label>
                <input
                  className="w-full bg-bg-main border border-border-color rounded-[12px] font-bold text-[15px] h-11 px-4 placeholder:text-text-secondary focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand transition"
                  placeholder="대회 이름을 입력하세요."
                  value={newCompTitle}
                  onChange={(e) => setNewCompTitle(e.target.value)}
                />
              </div>

              {/* 대회 설명 */}
              <div className="flex flex-col gap-3">
                <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                  대회 설명
                </label>
                <textarea
                  className="w-full min-h-[95px] bg-bg-main border border-border-color rounded-[12px] p-3.5 focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand font-semibold placeholder:text-text-secondary text-[15px] resize-none leading-relaxed transition"
                  placeholder="대회에 대한 간략한 설명을 입력하세요."
                  value={newCompDescription}
                  onChange={(e) => setNewCompDescription(e.target.value)}
                />
              </div>

              {/* 거래 한정 주종 선택 */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                      거래 가능 종목 한정
                    </label>
                    <span className="text-xs font-semibold text-text-secondary">
                      특정 종목 지정 (선택)
                    </span>
                  </div>
                  <div className="relative w-full sm:w-[220px] shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636C7D]" />
                    <input
                      className="w-full bg-bg-main border border-border-color rounded-[12px] font-bold text-[14px] placeholder:text-text-secondary pl-9 pr-3 h-10 focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand transition"
                      placeholder="종목명 또는 코드 검색"
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() =>
                        setTimeout(() => setIsSearchFocused(false), 205)
                      }
                    />

                    {isSearchFocused && stockSearch.trim().length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-color rounded-[12px] shadow-lg max-h-[170px] overflow-y-auto z-50">
                        {STOCKS_DATA.filter(
                          (stock) =>
                            (stock.name.includes(stockSearch) || stock.code.includes(stockSearch)) &&
                            !allowedStocks.find((s) => s.code === stock.code)
                        ).length > 0 ? (
                          <ul className="py-2 animate-in fade-in duration-100">
                            {STOCKS_DATA.filter(
                              (stock) =>
                                (stock.name.includes(stockSearch) || stock.code.includes(stockSearch)) &&
                                !allowedStocks.find((s) => s.code === stock.code)
                            ).map((stock) => (
                              <li
                                key={stock.code}
                                className="px-4 py-2.5 hover:bg-bg-main cursor-pointer flex justify-between items-center transition-colors text-sm"
                                onClick={() => handleStockSelect(stock)}
                              >
                                <span className="font-bold text-text-primary">
                                  {stock.name}
                                </span>
                                <span className="text-xs font-semibold text-text-secondary">
                                  {stock.code}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="px-4 py-3 text-sm text-center text-text-secondary">
                            검색된 종목이 없습니다.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 칩 영역 */}
                <div className="flex flex-wrap gap-2 pt-1 min-h-[40px] items-center">
                  {allowedStocks.length === 0 ? (
                    <Badge
                      variant="secondary"
                      className="h-[34px] px-3.5 flex items-center gap-1.5 rounded-full border border-border-color/40 bg-[#F8F9FA] text-text-primary font-bold text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none"
                    >
                      <span className="leading-none">전체 (모든 종목)</span>
                    </Badge>
                  ) : (
                    allowedStocks.map((stock) => (
                      <Badge
                        key={stock.code}
                        variant="secondary"
                        className="h-[34px] px-3.5 flex items-center gap-1.5 rounded-full border border-border-color/40 bg-[#F8F9FA] hover:bg-[#E9ECEF] transition-colors text-[13px] text-text-primary font-bold shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      >
                        <span className="leading-none">{stock.name}</span>
                        <button
                          onClick={() => removeStock(stock.code)}
                          className="text-text-secondary hover:text-red-500 transition-colors flex items-center justify-center p-0.5 rounded-full hover:bg-border-color/20 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {/* 대회 기간 (시작일 ~ 종료일) 달력 */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                    대회 기간 (시작일 ~ 종료일)
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPreset(7)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-border-color bg-surface hover:bg-bg-main transition duration-155 text-text-secondary cursor-pointer"
                    >
                      1주일
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreset(14)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-border-color bg-surface hover:bg-bg-main transition duration-155 text-text-secondary cursor-pointer"
                    >
                      2주일
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreset(30)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-border-color bg-surface hover:bg-bg-main transition duration-155 text-text-secondary cursor-pointer"
                    >
                      1달 (30일)
                    </button>
                  </div>
                </div>

                {/* Premium Calendar Container */}
                <div className="border border-border-color rounded-[16px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  {newCompStartDate && newCompEndDate && (
                    <div className="mb-3.5 p-2 rounded-[12px] bg-brand/5 border border-brand/10 text-center animate-in fade-in duration-200">
                      <span className="text-[13px] font-bold text-brand flex items-center justify-center gap-1.5">
                        <Calendar className="w-4 h-4 text-brand shrink-0" />
                        <span>
                          <span className="font-extrabold underline underline-offset-2 decoration-brand/30">{formatKoreanDate(newCompStartDate)}</span> 부터{" "}
                          <span className="font-extrabold underline underline-offset-2 decoration-brand/30">{formatKoreanDate(newCompEndDate)}</span> 까지{" "}
                          <span className="px-1.5 py-0.5 rounded bg-brand text-white text-[11px] font-black">{getDurationDays(newCompStartDate, newCompEndDate)}일간</span>
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mb-3.5 px-1">
                    <span className="text-[14px] font-bold text-text-primary tracking-tight">
                      {currentYear}년 {currentMonth + 1}월
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={prevMonth}
                        className="p-1 rounded-lg border border-border-color hover:bg-bg-main text-text-secondary transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={nextMonth}
                        className="p-1 rounded-lg border border-border-color hover:bg-bg-main text-text-secondary transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Grid header */}
                  <div className="grid grid-cols-7 text-center text-[11.5px] font-extrabold text-text-secondary/60 mb-1.5">
                    <div className="text-red-500/70">일</div>
                    <div>월</div>
                    <div>화</div>
                    <div>수</div>
                    <div>목</div>
                    <div>금</div>
                    <div className="text-blue-500/70">토</div>
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-y-1 relative cursor-pointer" onMouseLeave={() => setHoveredDate(null)}>
                    {getCalendarDays().map(({ date, isCurrentMonth }, idx) => {
                      const dateStr = formatDateStr(date);
                      const todayStr = formatDateStr(new Date());
                      const isPast = dateStr < todayStr;
                      
                      const isStart = dateStr === newCompStartDate;
                      const isEnd = dateStr === newCompEndDate;
                      const hasEnd = !!newCompEndDate;
                      
                      let isRange = false;
                      let isHoverEnd = false;

                      if (hasEnd) {
                        isRange = dateStr > newCompStartDate && dateStr < newCompEndDate;
                      } else if (newCompStartDate && hoveredDate && hoveredDate > newCompStartDate) {
                        isRange = dateStr > newCompStartDate && dateStr < hoveredDate;
                        isHoverEnd = dateStr === hoveredDate;
                      }

                      const isAlone = !newCompEndDate && (!hoveredDate || hoveredDate <= newCompStartDate);

                      return (
                        <button
                          key={`${dateStr}-${idx}`}
                          type="button"
                          disabled={isPast}
                          onClick={() => handleDayClick(dateStr)}
                          onMouseEnter={() => handleDayMouseEnter(dateStr)}
                          className={cn(
                            "h-8 w-full flex items-center justify-center relative text-[12.5px] font-bold transition-all duration-155 rounded-md",
                            isPast ? "text-text-secondary/15 cursor-not-allowed" : "cursor-pointer",
                            !isPast && !isCurrentMonth ? "text-text-secondary/25" : "",
                            !isPast && isCurrentMonth ? "text-text-primary" : ""
                          )}
                        >
                          {isRange && (
                            <div className="absolute inset-y-1 left-0 right-0 bg-brand/10" />
                          )}
                          {isStart && (
                            <>
                              {!isAlone && (
                                <div className="absolute inset-y-1 left-1/2 right-0 bg-brand/10" />
                              )}
                              <div className="absolute w-7 h-7 rounded-full bg-brand shadow-sm animate-in zoom-in-75 duration-200" />
                            </>
                          )}
                          {isEnd && (
                            <>
                              <div className="absolute inset-y-1 left-0 right-1/2 bg-brand/10" />
                              <div className="absolute w-7 h-7 rounded-full bg-brand shadow-sm animate-in zoom-in-75 duration-200" />
                            </>
                          )}
                          {isHoverEnd && (
                            <>
                              <div className="absolute inset-y-1 left-0 right-1/2 bg-brand/10" />
                              <div className="absolute w-7 h-7 rounded-full bg-brand/70 shadow-sm" />
                            </>
                          )}

                          <span className={cn(
                            "relative z-10",
                            (isStart || isEnd || isHoverEnd) ? "text-white" : "",
                            isRange ? "text-brand font-extrabold" : ""
                          )}>
                            {date.getDate()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 초기 투자금 및 최대 참가자 수 제한 */}
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-3">
                  <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                    참가자 초기 투자금
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-bg-main border border-border-color rounded-[12px] px-3.5 h-[44px] focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand font-bold text-[14.5px] text-text-primary cursor-pointer appearance-none transition"
                      value={newCompInitialAmount}
                      onChange={(e) => setNewCompInitialAmount(e.target.value)}
                    >
                      <option value="100">100 만원</option>
                      <option value="500">500 만원</option>
                      <option value="1000">1,000 만원</option>
                      <option value="5000">5,000 만원</option>
                      <option value="10000">1 억원</option>
                      <option value="50000">5 억원</option>
                      <option value="100000">10 억원</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                    최대 참가자 수 제한
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-bg-main border border-border-color rounded-[12px] px-3.5 h-[44px] focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand font-bold text-[14.5px] text-text-primary cursor-pointer appearance-none transition"
                      value={newCompMaxParticipants}
                      onChange={(e) => setNewCompMaxParticipants(e.target.value)}
                    >
                      <option value="10">10 명</option>
                      <option value="30">30 명</option>
                      <option value="50">50 명</option>
                      <option value="100">100 명</option>
                      <option value="500">500 명</option>
                      <option value="1000">1,000 명</option>
                      <option value="">무제한</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 공개/비밀 설정 */}
              <div className="flex flex-col gap-3">
                <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                  공개 설정
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setNewCompIsSecret(false)}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-[12px] border-2 flex items-center justify-center gap-2 transition-colors cursor-pointer",
                      !newCompIsSecret
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-border-color bg-surface text-text-secondary"
                    )}
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-[14.5px] font-extrabold">공개 대회</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCompIsSecret(true)}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-[12px] border-2 flex items-center justify-center gap-2 transition-colors cursor-pointer",
                      newCompIsSecret
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-border-color bg-surface text-text-secondary"
                    )}
                  >
                    <Lock className="w-4 h-4" />
                    <span className="text-[14.5px] font-extrabold">비밀 대회</span>
                  </button>
                </div>
                {newCompIsSecret && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200 mt-1 relative">
                    <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="입장 비밀번호를 입력해주세요"
                      value={newCompPassword}
                      maxLength={6}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^[0-9]+$/.test(val)) {
                          setNewCompPassword(val.slice(0, 6));
                        }
                      }}
                      className="w-full bg-bg-main border border-border-color rounded-[12px] py-2.5 pl-10 pr-4 text-[14px] font-bold outline-none focus:bg-white focus:border-brand focus:ring-1.5 focus:ring-brand"
                    />
                  </div>
                )}
              </div>

              {/* 공식 대회 지정하기 */}
              <div className="flex items-center justify-between p-3.5 bg-bg-main border border-border-color rounded-[12px]">
                <div>
                  <h4 className="text-[13.5px] font-extrabold text-text-primary">공식 대회 지정하기</h4>
                  <p className="text-[11px] text-text-secondary font-medium">활성화 시 대회카드 옆에 브랜드 컬러의 공식 인증 마크가 표시됩니다.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewCompIsOfficial(!newCompIsOfficial)}
                  className={cn(
                    "w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative duration-200",
                    newCompIsOfficial ? "bg-[#4A5DF9]" : "bg-neutral-300"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                    newCompIsOfficial ? "translate-x-4" : "translate-x-0"
                  )} />
                </button>
              </div>
            </div>

            {/* Buttons control footer */}
            <div className="flex gap-2.5 pt-3.5 border-t border-[#E5E5EA]">
              <button
                type="button"
                onClick={() => setNewCompModal(false)}
                className="flex-1 py-3 border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] text-[14px] font-bold rounded-[12px] cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newCompTitle.trim() || !newCompStartDate || !newCompEndDate) {
                    triggerToast("모든 항목을 올바르게 기입해주십시오.");
                    return;
                  }
                  const startTimestamp = new Date(newCompStartDate).getTime();
                  const endTimestamp = new Date(newCompEndDate).getTime();
                  const currentTimestamp = new Date().getTime();
                  
                  let compStatus: "WAITING" | "ONGOING" | "FINISHED" = "WAITING";
                  if (currentTimestamp >= startTimestamp && currentTimestamp <= endTimestamp) {
                    compStatus = "ONGOING";
                  } else if (currentTimestamp > endTimestamp) {
                    compStatus = "FINISHED";
                  }

                  const createdComp: CompetitionItem = {
                    id: competitions.length + 1,
                    title: newCompTitle,
                    startDate: newCompStartDate,
                    endDate: newCompEndDate,
                    seedMoney: (parseInt(newCompInitialAmount) || 1000) * 10000,
                    initialAmount: (parseInt(newCompInitialAmount) || 1000) * 10000,
                    participants: 0,
                    maxParticipants: newCompMaxParticipants ? parseInt(newCompMaxParticipants) : "무제한",
                    status: compStatus,
                    isOpen: true,
                    isOfficial: newCompIsOfficial,
                    target: allowedStocks.length > 0 ? allowedStocks.map(s => s.name).join(", ") : "전체",
                    hasPassword: newCompIsSecret,
                    password: newCompPassword,
                    dday: compStatus === "WAITING" ? "D-Day" : compStatus === "ONGOING" ? "진행중" : "종료"
                  };

                  setCompetitions([createdComp, ...competitions]);
                  triggerToast(`새로운 대회 [ ${newCompTitle} ] 가 성공적으로 배포 등록되었습니다.`);
                  setNewCompModal(false);
                }}
                className="flex-1 py-3 bg-[#4A5DF9] text-white hover:bg-[#4A5DF9]/90 transition text-[14px] font-bold rounded-[12px] shadow-sm cursor-pointer"
              >
                대회 생성 배포
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail & Solution Log View Modal */}
      {reportDetailModal.isOpen && reportDetailModal.report && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-[#E5E5EA] flex flex-col gap-5 text-[#1C1C1E]">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-[#4A5DF9]/10 text-[#4A5DF9] text-[11px] font-extrabold px-2.5 py-1 rounded-[12px] uppercase">
                  신고사항 처리종결 확인
                </span>
                <h3 className="text-[18px] font-bold text-[#1C1C1E] mt-2">신고 건번호 #{reportDetailModal.report.id} 상세 처리내역</h3>
              </div>
              <button 
                onClick={() => setReportDetailModal({ isOpen: false, report: null })}
                className="w-8 h-8 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] flex items-center justify-center transition cursor-pointer text-[#8E8E93] hover:text-[#1C1C1E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content info wrapper */}
            <div className="space-y-3.5 text-sm">
              <div className="grid grid-cols-[100px_1fr] bg-[#F2F2F7]/40 p-3 rounded-[12px] border border-[#E5E5EA]/40">
                <span className="text-[#8E8E93] font-bold">신고자</span>
                <span className="font-extrabold text-[#1C1C1E]">{reportDetailModal.report.reporter}</span>
              </div>

              <div className="grid grid-cols-[100px_1fr] bg-[#F2F2F7]/40 p-3 rounded-[12px] border border-[#E5E5EA]/40">
                <span className="text-[#8E8E93] font-bold">대상 유형</span>
                <span className="font-extrabold text-[#1C1C1E]">{reportDetailModal.report.targetType}</span>
              </div>

              <div className="grid grid-cols-[100px_1fr] bg-[#F2F2F7]/40 p-3 rounded-[12px] border border-[#E5E5EA]/40">
                <span className="text-[#8E8E93] font-bold">신고 사유</span>
                <span className="font-extrabold px-2 py-0.5 rounded text-white text-[11px] bg-[#FF3B30] w-fit">
                  {reportDetailModal.report.reason}
                </span>
              </div>

              <div className="grid grid-cols-[100px_1fr] bg-[#F2F2F7]/40 p-3 rounded-[12px] border border-[#E5E5EA]/40">
                <span className="text-[#8E8E93] font-bold">신고 일자</span>
                <span className="font-semibold text-[#1C1C1E] tabular-nums">{reportDetailModal.report.date}</span>
              </div>

              <div className="flex flex-col gap-1.5 bg-[#F2F2F7]/40 p-3 rounded-[12px] border border-[#E5E5EA]/40">
                <span className="text-[#8E8E93] font-bold">신고 대상 전체 내용</span>
                <p className="bg-white border border-[#E5E5EA]/60 p-2.5 rounded-[8px] text-[13px] text-[#1C1C1E] font-medium leading-relaxed max-h-[80px] overflow-y-auto">
                  {reportDetailModal.report.content}
                </p>
              </div>

              {/* Resolved processing content details (처리내용) */}
              <div className="flex flex-col gap-1.5 bg-[#34C759]/5 p-3 rounded-[12px] border border-[#34C759]/20">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                  <span className="text-[#34C759] text-[12px] font-bold">최종 처리 결과 및 내용</span>
                </div>
                <div className="bg-white border border-[#34C759]/20 p-2.5 rounded-[8px] text-[13px] text-[#1C1C1E] font-medium leading-relaxed">
                  {reportDetailModal.report.status === "처리완료" ? (
                    <span>
                      본 신고 항목에 명시된 비규격 활동 및 규정 위반 사실에 대하여 운영원칙에 기반한 정밀 심사를 거쳐 <strong className="text-[#FF3B30]">삭제 처리 및 일시적 조치 제한권고</strong> 처리를 완료하였습니다. 커뮤니티의 쾌적한 질서 유지를 위해 제로리스크의 실시간 규정 가이드라인을 위배 조치하였습니다.
                    </span>
                  ) : (
                    <span>
                      통배포 또는 타겟 오용으로 전달된 단순 분쟁 건으로 파악되었습니다. 당사 운영원칙 상의 엄격한 제재 요건(욕설/비하/불건전성)에 미온하여 <strong className="text-[#8E8E93]">무혐의 반려</strong> 처리 종결되었습니다. 관리부서의 추가 모니터링 주기에 기록되었습니다.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setReportDetailModal({ isOpen: false, report: null })}
              className="w-full h-11 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] font-bold rounded-[12px] mt-1 text-[13px] transition cursor-pointer shrink-0"
            >
              닫기
            </Button>
          </div>
        </div>
      )}

      {/* Post Detail Viewer Modal */}
      {selectedPostDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-[#E5E5EA] flex flex-col gap-5 text-[#1C1C1E]">
            <div className="flex justify-between items-start">
              <div>
                <span className={cn(
                  "text-[11px] font-extrabold px-2.5 py-1 rounded-[12px] uppercase",
                  selectedPostDetail.status === "ACTIVE" ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#FF3B30]/10 text-[#FF3B30]"
                )}>
                  {selectedPostDetail.status === "ACTIVE" ? "활성 게시물" : "삭제 처리된 게시물"}
                </span>
                <h3 className="text-[18px] font-bold text-[#1C1C1E] mt-2 leading-snug">{selectedPostDetail.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedPostDetail(null)}
                className="w-8 h-8 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] flex items-center justify-center transition cursor-pointer text-[#8E8E93] hover:text-[#1C1C1E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#F2F2F7]/50 p-3.5 rounded-[12px] border border-[#E5E5EA]/40 text-[#555] font-semibold">
                <div>작성자: <span className="font-bold text-[#1C1C1E]">{selectedPostDetail.author}</span></div>
                <div>작성 시각: <span className="font-bold text-[#1C1C1E]">{selectedPostDetail.date}</span></div>
                <div>조회수: <span className="font-bold text-[#1C1C1E]">{selectedPostDetail.views}</span></div>
                <div>추천수: <span className="font-bold text-[#1C1C1E] text-[#4A5DF9]">{selectedPostDetail.likes}</span></div>
              </div>

              <div className="flex flex-col gap-2 min-h-[140px] bg-[#F2F2F7]/20 border border-[#E5E5EA]/60 p-4 rounded-[12px]">
                <span className="text-[12px] text-[#8E8E93] font-bold">본문 내용</span>
                <p className="text-[#1C1C1E] leading-relaxed text-[13.5px] font-medium whitespace-pre-wrap">
                  {selectedPostDetail.content}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 mt-1 shrink-0">
              {selectedPostDetail.status === "ACTIVE" ? (
                <button
                  onClick={() => {
                    setPosts(prev => prev.map(item => item.id === selectedPostDetail.id ? { ...item, status: "DELETED" } : item));
                    setSelectedPostDetail(prev => prev ? { ...prev, status: "DELETED" } : null);
                    triggerToast(`게시글이 비공개(삭제) 처리되었습니다.`);
                  }}
                  className="flex-1 py-3 bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90 transition text-[13px] font-bold rounded-[12px] shadow-sm cursor-pointer"
                >
                  게시글 블라인드 삭제
                </button>
              ) : (
                <button
                  onClick={() => {
                    setPosts(prev => prev.map(item => item.id === selectedPostDetail.id ? { ...item, status: "ACTIVE" } : item));
                    setSelectedPostDetail(prev => prev ? { ...prev, status: "ACTIVE" } : null);
                    triggerToast(`게시글이 성공적으로 복구되었습니다.`);
                  }}
                  className="flex-1 py-3 bg-[#34C759] text-white hover:bg-[#34C759]/90 transition text-[13px] font-bold rounded-[12px] shadow-sm cursor-pointer"
                >
                  게시글 복구 활성화
                </button>
              )}
              <button
                onClick={() => setSelectedPostDetail(null)}
                className="py-3 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] text-[13px] font-bold rounded-[12px] px-5 transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
