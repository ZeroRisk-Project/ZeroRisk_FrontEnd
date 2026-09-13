# ZeroRisk 프로젝트 점검 백로그

FE(`ZeroRisk_FrontEnd`)/BE(`ZeroRisk_BackEnd`) 전체를 감사해서 나온 항목. 하나씩 골라서 진행. [완료]는 이번 세션에서 이미 처리됨.

## 완료됨

- [x] 목표가 알림 등록 500 에러 — `PRICE_ALERTS.STOCK_CODE` NOT NULL 잔재 컬럼. 원격 DB에 `ALTER TABLE PRICE_ALERTS MODIFY (STOCK_CODE NULL)` 실행함.
- [x] BE `HoldingService`/`StockQueryService` — KIS 조회 실패 시 전체 요청이 500으로 죽던 문제, try/catch 추가.
- [x] FE `Stocks.tsx` "전체보기"/검색 결과 현재가 "-" 표시 — 거래량 외 거래대금/급상승/급하락 랭킹도 합쳐서 매칭되는 종목은 가격 표시되도록 보강.

## Tier 0 — 보안 (BE)

- [x] **카카오 연동해제 웹훅 서명/앱ID 검증 없음** — `handleKakaoUnlink`가 `kakao.app-id` 설정값과 요청의 `app_id`를 비교하도록 수정, 불일치/미설정 시 400(`AUTH_011`)으로 거부(fail-closed). **운영 조치 필요**: `.env`의 `KAKAO_APP_ID`가 비어있음 — 카카오 디벨로퍼스 콘솔 앱 키 요약정보의 숫자 App ID를 채워야 실제 웹훅이 다시 동작함.
- [x] **이메일 인증코드 무제한 시도 가능** — `EmailVerificationService.verifyCode`에 5분 창에 5회 시도 제한 추가(`FixedWindowCounter` 재사용), 새 코드 발송 시 시도 카운터 초기화.
- [x] **로그인 타이밍 사이드채널로 이메일 존재 여부 유추 가능** — 이메일이 없을 때도 더미 BCrypt 해시로 항상 비교를 수행하도록 `AuthService.login` 수정.

## Tier 1 — 금전 관련 (BE) — 전체 완료

- [x] **대회 상금 지급 시 재계산 실패한 자산값을 그대로 사용** — 재평가 실패(예상 밖 예외 포함) 시 해당 참가자는 DLQ(FAILED_RECALCULATIONS)로 격리하고, 미해결 DLQ 건이 있는 참가자는 상금 지급을 보류(로그로 남김)하도록 수정.
- [x] **동순위 전원에게 1위 상금 중복 지급** — 정책 확정(동순위는 해당 등수 상금을 인원수대로 분배)에 따라 tie 인원수로 나눠 지급하도록 수정(원 단위 내림).
- [x] **대회 종료 처리가 특정 조회 실패 시 영원히 멈춤** — 재평가 루프를 try/catch로 감싸 참가자 한 명의 예상 밖 예외가 전체 트랜잭션을 롤백하지 않도록 수정, DLQ로 격리.
- [x] **대회 시작(SCHEDULED→ONGOING) idempotency 가드 없음** — `distributePrizes`와 동일한 패턴으로 `startCompetition`에도 상태 체크 추가(중복 시드머니 지급 방지).
- [x] **계좌 잔액 동시성 — 락 불일치로 잔액 유실 가능** — `resetSeedMoney`/`claimPracticeCredit`도 `findBasicAccountByUserIdForUpdate`(락)로 통일.
- [x] **오픈뱅킹 인증 중복 행 가능** / **BASIC 계좌 중복 생성 가능** — `OPENBANKING_AUTHS.USER_ID`, `ACCOUNTS`(BASIC 타입 한정 함수 기반 인덱스)에 유니크 제약 추가(원격 DB 반영 완료 + 스키마 파일 동기화) + 위반 시 재조회로 복구하는 코드 추가.
- [x] **주문 취소 vs 예약주문 체결 스케줄러 레이스** — `OrderRepository.findById`를 `@Lock(PESSIMISTIC_WRITE)`로 오버라이드, 체결 배치도 실제 체결 직전 락 걸고 PENDING 상태 재확인하도록 수정.
- [x] **PENDING 주문에 자금/보유량 예약 없음** — 주문 생성 시 같은 계좌의 다른 PENDING 지정가 주문들이 이미 약속한 금액/수량을 뺀 "가용" 잔고·보유량으로 검증하도록 수정.

OrderServiceTest 등 기존 단위테스트는 새로 추가된 mock 스텁을 반영해 갱신, 전체 테스트 스위트(`gradlew test`) 통과 확인.

## Tier 2 — 배치/스케줄러 (BE)

- [x] **목표가 알림 배치가 트랜잭션 하나로 전부 묶여 무제한 길어짐** — `dispatchAlerts()`에서 `@Transactional` 제거, KIS 시세 조회(트랜잭션 불필요)와 알림별 처리(`dispatchSingleAlert`)를 분리.
- [x] **목표가 알림 스케줄러 중복 실행 방지 없음** — `CooldownChecker`(Redis SETNX, TTL 4분30초)로 락 추가, 겹치면 이번 회차 스킵.
- [x] **목표가 알림 배치, 알림 1건 실패가 배치 전체를 롤백** — 알림별 처리를 try/catch로 감싸 한 건 실패해도 나머지 계속 처리.
- [ ] **목표가 알림 스케줄러가 "시세 수신 시"가 아니라 단순 5분 폴링** — 의도적으로 보류: 실제 시세 틱 기반으로 바꾸려면 KIS WebSocket 릴레이와 엮는 별도의 큰 작업이 필요해서 이번엔 손대지 않음.
- [x] **일별 자산 스냅샷 배치, KIS 실패 시 조용히 가격 0 처리** — 보유 종목 중 시세 조회 실패가 있으면 그 계좌는 이번 회차 스냅샷 생성을 건너뛰도록 수정(0원 대체로 랭킹이 왜곡되는 것 방지). 테스트 추가.
- [x] **PORTFOLIO_SNAPSHOTS(계좌,날짜) unique 제약 없음** — 기존 중복행 1건(계좌2, 2026-08-24, 값 동일) 정리 후 원격 DB에 유니크 제약 추가 + 스키마 파일 동기화.
- [x] **대회 상태 전환(SCHEDULED→ONGOING) idempotency 가드 없음** — Tier 1에서 이미 처리됨(중복 항목).
- [x] **랭킹 캐시 갱신 배치, 한 기간(period) 실패가 전체 루프를 중단** — 기간별로 try/catch 추가, 한 기간 실패해도 나머지는 갱신.
- [ ] **시장지수/종목 일별 종가 저장 배치도 unique 제약 없이 check-then-insert** — 보류: 아직 커밋 안 된 다른 팀원의 진행 중인 작업(`MarketIndexDailyPriceScheduler`/`StockDailyPriceScheduler` 등)이라 손대지 않기로 함. 팀원이 커밋하면 같은 패턴으로 재검토 필요.
- [ ] **거래량/거래대금 랭킹, 급상승/급하락이 실제 상승률/하락률 API가 아님** — 보류: KIS 등락률 순위(TR `FHPST01700000`) 신규 연동이 필요한 별도 작업이라 이번엔 미룸. 실제 KIS 응답으로 검증 가능할 때 별도로 진행할 것.

## Tier 3 — 데이터 정합성 (BE) — 전체 완료

- [x] **게시글 투표/댓글 좋아요 동시 클릭 중복 카운트** — 확인해보니 COMMENT_LIKES는 이미 원격 DB에 유니크 제약이 있었음(스키마 파일에만 없었음, 실사용 버그 아니었음). POST_VOTES는 실제로 없어서 유니크 제약 추가. 양쪽 서비스 모두 `saveAndFlush`+`DataIntegrityViolationException` catch로 동시 생성을 조용히 무시하도록 방어 추가.
- [x] **CHAT_MESSAGES.MESSAGE 스키마 드리프트 의심** — 실제 DB 확인 결과 이미 nullable(Y)이라 살아있는 버그는 아니었음. 체크인된 SQL 파일이 잘못돼 있던 것만 고침(문서 동기화).
- [x] **댓글 답글이 다른 게시글의 부모 댓글에 달려도 검증 없음** — `createComment`에서 부모 댓글의 게시글이 요청 postId와 다르면 거부하도록 수정.
- [x] **신고 처리(process)가 실제 제재/숨김 없이 상태만 변경** — 정책 확정(처리완료 시 대상 게시글/댓글 자동 숨김)에 따라 `processReport`가 PROCESSED 처리 시 대상을 soft-delete하도록 수정(CHAT/USER는 별도 관리 화면 영역이라 그대로 둠).
- [x] **FAILED_RECALCULATIONS 자동 재시도 없음** — 매시간 미해결 건(재시도 5회 미만)을 자동으로 재시도하는 `FailedRecalculationRetryScheduler` 신규 추가.
- [x] **완료된 SSE emitter에서 발생하는 IllegalStateException 미처리** — `SseEmitterService.sendToEmitter`가 IOException과 함께 IllegalStateException도 잡아서 죽은 emitter를 즉시 제거하도록 수정.
- [x] **관리자 알림 DLQ 재시도, 오프라인 유저에도 "성공"으로 표시** — `SseEmitterService.send`/`NotificationSseSender.send`가 실제 전송 여부(boolean)를 정확히 반환하도록 수정(오프라인은 예외 없이 false) — 이 수정만으로 `AdminNotificationDlqService.retry()`의 오탐이 같이 해결됨.
- [x] **오픈뱅킹 계정 연동, 응답 리스트 빈 배열 시 미처리 500** — 빈 리스트면 명확한 예외(`OPENBANKING_005`)로 처리. 첫 계정만 연동하는 것은 유저당 계좌 1개로 제한하는 기존 설계와 일치하는 의도된 동작으로 확인, 그대로 둠.
- [x] **게시글 이미지 저장 실패가 게시글 생성 전체를 롤백** — 원인은 URL 길이 미검증이었음. `PostCreateRequest.imageUrls`에 `@Size(max=500)` 추가해서 DB까지 안 가고 깨끗한 400으로 막음(원자적 생성 자체는 의도된 설계라 그대로 둠).
- [x] **회원 탈퇴 시 닉네임 "탈퇴"+id가 7자리 이상 되면 컬럼 길이 초과** — id를 36진수로 인코딩해서 같은 6바이트 예산으로 훨씬 큰 id까지 안전하게 담도록 수정.
- [x] **팔로우 중복 시 처리되지 않은 예외로 raw 500** — `GlobalExceptionHandler`에 `DataIntegrityViolationException` 공통 핸들러(409) 추가.
- [x] **관리자 강제퇴장(expelParticipant) 감사로그 없음** — `adminActionLogger.log` 호출 추가(컨트롤러에 `adminUserId` 파라미터 추가).
- [x] **NOTIFICATION_DLQ/COMMENT_LIKES/POST_IMAGES 테이블이 체크인된 SQL 파일에 없음** — 세 테이블 정의 + PK/FK/시퀀스 + 유니크 제약을 스키마 파일에 추가해 실제 DB와 동기화.

전체 테스트 스위트 통과 확인.

## Tier 4 — 프론트엔드 — 전체 완료

- [x] **`api.ts` 토큰 재발급 실패 시 대기 중인 요청들이 영구 멈춤** — 대기 큐에 resolve와 함께 reject도 저장해서, 재발급 실패 시 대기 중이던 요청들을 정리(reject)하도록 수정.
- [x] **Mypage 주문 취소, 실패를 `catch {}`로 무시 + 성공해도 잔고/체결내역 미갱신** — 실패 시 백엔드 메시지를 토스트로 표시, 성공/실패 무관하게 미체결/체결내역/계좌/보유종목/구성 쿼리를 모두 무효화하도록 수정.
- [x] **Portfolio.tsx, 조회 실패가 "보유 종목 없음"/₩0으로 표시됨** — 로딩/에러/진짜 빈 상태를 구분하는 메시지로 교체, 상단에 에러 배너 추가.
- [x] **관심그룹 생성/이름변경 실패 시 에디터가 그냥 닫히고 입력값 소실** — 실패 시 토스트로 알리고 에디터를 닫지 않도록 수정(입력값 유지).
- [x] **관심종목 즐겨찾기 토글 실패 시 아무 피드백 없음** — 반환값을 확인해서 실패 시 토스트 표시.
- [x] **Portfolio.tsx KOSPI 비교선이 항상 0%로 하드코딩** — 실제 데이터가 준비되기 전까지 조용히 제거(가짜 데이터를 실제처럼 보여주는 것보다 안 보여주는 게 안전).
- [x] **Portfolio.tsx 리스크(베타/변동성) 조회 실패 시 에러 처리 없이 그냥 안 보임** — 실패 시 안내 문구 추가.
- [x] **useWatchlist 기본 그룹 자동생성, 극단적 타이밍에 중복 생성 가능성** — 진행 중인 resolve를 공유하도록 수정해 동시 호출이 각자 그룹을 만드는 것을 방지.

Mypage.tsx에 액션 토스트(`actionToast`) 공통 UI 추가. `tsc --noEmit` 전체 통과 확인. `/mypage`, `/portfolio`는 로그인 필요 라우트라 브라우저로 직접 로그인해서 실제 화면 확인은 못 했음 — 로그인해서 확인 부탁드립니다.

## Tier 5 — mock 데이터 재점검 (FE 전체 + BE 일부)

전체 프론트엔드(그리고 백엔드 클라이언트 계층)를 훑어서 실제 API 대신 가짜/하드코딩 데이터를 쓰던 곳을 찾아 교체.

- [x] **`OrderBook.tsx`(호가창)가 완전히 가짜 데이터** — `Math.random()`으로 매도/매수 잔량을 매번 새로 지어내고, 가격도 27만원대로 고정되어 있어 어떤 종목을 봐도 항상 같은 가짜 호가가 표시됨. KIS 실전 호가 API(TR `FHKST01010200`)를 실제로 붙여 확인(모의투자 서버로 실제 호출해서 응답 필드명 검증) 후, 새 `KisOrderBookClient`/`GET /api/v1/stocks/{code}/orderbook` 백엔드 엔드포인트를 만들고 프론트를 여기에 연결. 종목 코드/현재가/등락률을 props로 받아 실제 선택 종목의 실시간 호가를 보여줌.
- [x] **`MypageSettings.tsx` 닉네임 중복 확인이 mock** — `val === "이미사용중" || val === "test"`로만 판단하던 것을 실제 존재하던 백엔드 API(`GET /auth/nickname-check`)로 교체, 400ms 디바운스 적용.
- [x] **`MypageSettings.tsx` 계정 타입(일반/소셜) 전환 버튼이 데모용 가짜 토글** — 실제로는 서버가 내려주는 값(`oauthProvider` 존재 여부)인데 사용자가 클릭해서 바꿀 수 있게 되어 있었음. 읽기 전용 배지로 교체.
- [x] 그 외 전체 프론트엔드(Home, Ranking, Compare, Community, Admin, Portfolio, Mypage 등)와 백엔드 KIS 클라이언트 계층을 grep + 직접 확인 — 나머지는 전부 실제 API 데이터였음. 유일하게 남은 의도된 mock은 `MockOpenBankingClient`(백엔드) — 실제 금융결제원 오픈뱅킹 API는 승인 절차(6~12개월, 심사비용)가 있어 포트폴리오 프로젝트 범위에서 원천적으로 불가능하다는 주석이 이미 있고, 실제 스펙에 맞춘 의도된 대체 구현이라 그대로 둠.

백엔드 전체 테스트 스위트(`gradlew test`) + 프론트 `tsc --noEmit` 통과 확인.

## Tier 6 — 대회 계좌 거래 UX + 마이페이지 대회별 거래내역/보유종목 팝업 (FE)

스펙 문서의 "대회 계좌 거래가 안 됨" 증상은 백엔드 확인 결과 버그가 아니라 의도된 설계(대회 시작 전까지 계좌 비활성)로 확인됨. 실제 필요한 작업만 진행. 상세 계획: `C:\Users\dog49\.claude\plans\agile-tinkering-noodle.md`.

- [x] **Part A** `MainLayout.tsx` — `AccountOption`에 `competitionStatus`/`startAt` 추가(기존 `getCompetitionDetail` 응답 재사용, 새 API 호출 없음), `activeAccount`+`refreshAccounts`를 `<Outlet context={...}>`로 노출.
- [x] **Part B** `Stocks.tsx` — 독자적 BASIC 계좌 조회 제거하고 헤더의 `activeAccount`를 실제 주문(`createOrder`)에 연결(현재는 헤더에서 대회 계좌를 선택해도 항상 BASIC 계좌로 주문 나가던 버그). `competitionStatus === "SCHEDULED"`면 주문 버튼 비활성화 + 안내 문구 노출.
- [x] **Part C-1** `Mypage.tsx`에서 거래내역/미체결 렌더링 블록을 `TransactionHistoryGrid.tsx`(신규 공용 컴포넌트)로 추출 — 추출 후 기존 화면이 동일하게 렌더되는지 먼저 확인.
- [x] **Part C-2** `CompetitionAccountPopup.tsx` 신규 작성 — "참여한 대회" 우클릭 시 열리는 팝업, "거래내역·미체결"/"보유 종목" 2탭(pill 스타일, Mypage.tsx 기존 클래스 재사용).
- [x] **Part C-3** `Mypage.tsx` "참여한 대회" 테이블 행에 컨텍스트 메뉴 연결(`AdminLogsTab.tsx` 패턴 재사용), 대회 계좌가 아직 없는(SCHEDULED) 경우 토스트로 안내.
- [x] **검증** `tsc --noEmit`(=`npm run lint`) 및 `npm run build` 통과 확인. 로그인 필요 라우트라 브라우저 직접 확인(실제 클릭 동작)은 못 했음 — 아래 review 참고.

### Review

- **Part A/B**: `MainLayout.tsx`의 `toAccountOption`이 이미 대회 계좌마다 `getCompetitionDetail`을 호출하고 있어서, `competitionStatus`/`startAt`을 추가로 얻는 데 새 API 호출이 필요 없었음. `Stocks.tsx`의 독자적 `accountsQuery`(`["stocks","accounts"]`)를 제거하고 `useOutletContext`로 헤더의 `activeAccount`를 직접 사용하도록 교체 — 이 과정에서 더는 쓰이지 않게 된 `queryClient`/`useQueryClient` import도 함께 제거(내 변경으로 unused가 된 것만 정리, 그 외 로직은 그대로 둠).
- **Part C**: `Mypage.tsx`의 거래내역/미체결 그리드(약 90줄)를 `TransactionHistoryGrid.tsx`로 추출하면서, 날짜 포맷 유틸(`formatTransactionDate`)과 페이지 크기 상수(`TRADES_PAGE_SIZE`)도 그 공용 컴포넌트로 옮겨서 `Mypage.tsx`와 `CompetitionAccountPopup.tsx` 양쪽이 순환 참조 없이 재사용하도록 함(처음엔 Mypage.tsx에서 export하려 했으나 팝업이 Mypage.tsx를 다시 import하는 순환 구조가 될 뻔해서 방향을 바꿈).
- **GET /accounts는 비활성 계좌를 제외**한다는 걸 백엔드(`AccountService.java:23-24`, `.filter(Account::isActive)`)에서 직접 확인 — 그래서 `SCHEDULED` 대회는 우클릭해도 `competitionAccounts`에서 매칭되는 계좌가 없고, 이 경우 팝업 대신 토스트("대회가 아직 시작되지 않아 계좌 내역이 없습니다.")만 띄우도록 처리. 백엔드 변경은 전혀 없음.
- **미확인**: `/mypage`, `/stocks`는 로그인 필요 라우트라 브라우저로 직접 로그인해서 실제 동작(헤더에서 대회 계좌 전환 후 주문, 우클릭 팝업 오픈, 탭 전환) 확인은 못 했음 — 로그인해서 확인 부탁.

---
_생성: 2026-09-10. 각 항목 착수 전에 실제 최신 코드로 재확인할 것 — 특히 Tier 3의 스키마 드리프트 항목은 라이브 DB 확인이 선행되어야 함._
