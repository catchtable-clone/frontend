# 캐치테이블 클론 Frontend

캐치테이블 클론코딩 기반 레스토랑 예약/빈자리 알림 플랫폼 프론트엔드

## 기술 스택

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query (서버 상태 관리)
- Zustand (클라이언트 상태 관리)
- Axios (HTTP 클라이언트)

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 폴더 구조

```
src/
├── app/              # 페이지 (라우팅)
├── components/       # 재사용 UI 컴포넌트
│   └── common/       # 공통 컴포넌트 (버튼, 모달 등)
├── hooks/            # 커스텀 훅
├── lib/              # 외부 라이브러리 설정 (Axios, QueryProvider)
├── types/            # TypeScript 타입 정의
└── stores/           # Zustand 전역 상태
```
