# 따스한 봄날의 사진첩

하객들이 자유롭게 사진을 올리고, 촬영 시간순으로 아름답게 감상할 수 있는 웨딩 포토 갤러리입니다.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Storage%20%2B%20DB-3ECF8E?logo=supabase)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)

## 주요 기능

- **Pinterest 스타일 갤러리** — Masonry 레이아웃, 호버 시 하트 반응
- **다중 사진 업로드** — 드래그 & 드롭, 장당 최대 10MB
- **EXIF 메타데이터 추출** — 촬영 일시 자동 인식 및 시간순 정렬
- **봄 감성 디자인** — Olive Drab / Amber / Sienna / Soft Pink 팔레트
- **관리자 대시보드** — 사진 승인 · 거부 · 삭제
- **Google Drive 백업** — Zapier 웹훅 연동 (선택)

## 빠른 시작

### 1. 설치

```bash
git clone https://github.com/<your-username>/wedding-photo-shoot.git
cd wedding-photo-shoot
npm install
```

### 2. 환경 변수

`.env.example`을 복사하여 `.env.local`을 만들고 값을 채웁니다:

```bash
cp .env.example .env.local
```

| 변수 | 설명 | 필수 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | O |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Publishable Key | O |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | 관리자 비밀번호 (기본: `admin`) | 선택 |

### 3. Supabase 설정

Supabase SQL Editor에서 아래 순서로 실행합니다:

```
scripts/001_create_photos_table.sql  → 테이블 + RLS
scripts/002_storage_bucket.sql       → Storage 버킷 + 메타데이터 컬럼
```

### 4. 실행

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
```

## 프로젝트 구조

```
├── app/
│   ├── page.tsx              # 메인 갤러리 (SSR)
│   ├── admin/page.tsx        # 관리자 대시보드
│   └── actions.ts            # Server Actions
├── components/
│   ├── gallery-page.tsx      # 히어로 섹션 + 레이아웃
│   ├── photo-card.tsx        # Masonry 카드 + 하트 반응
│   ├── upload-modal.tsx      # 다중 업로드 + EXIF 추출
│   └── header.tsx            # 네비게이션
├── lib/
│   ├── data.ts               # Photo 타입 + 더미 데이터
│   ├── photos.ts             # Supabase CRUD + 메타데이터
│   └── supabase/             # Supabase 클라이언트
├── scripts/
│   ├── 001_create_photos_table.sql
│   └── 002_storage_bucket.sql
└── .env.example
```

## 디자인 시스템

| 역할 | 색상 | 의미 |
|------|------|------|
| 타이틀 | `#6B8E23` Olive Drab | 싱그러운 잎사귀 |
| 버튼 | `#FFC107` Amber | 활짝 핀 개나리 |
| 강조 | `#F48FB1` Soft Pink | 흩날리는 벚꽃 |
| 본문 | `#333333` Charcoal | 깊은 안정감 |

서체: Nanum Myeongjo (Serif)

## Google Drive 백업 (선택)

Zapier를 사용하여 사진이 올라올 때마다 구글 드라이브에 자동 백업할 수 있습니다:

1. Zapier — Webhooks (Catch Hook) 트리거 생성
2. Supabase — Database Webhooks — `photos` 테이블 INSERT 이벤트에 Zapier URL 연결
3. Zapier — Google Drive (Upload File) 액션 추가

## 라이선스

MIT License
