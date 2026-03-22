# wedding-photo-shoot

웨딩 사진을 업로드·갤러리로 보여 주고, 관리자 화면에서 승인·거부·삭제할 수 있는 Next.js 앱입니다.

## 요구 사항

- Node.js 20+
- (선택) Supabase 프로젝트 — 환경 변수를 넣으면 DB·스토리지와 연동되고, 없으면 `lib/data.ts` 더미 데이터로 동작합니다.

## 설정

1. 의존성 설치:

   ```bash
   npm install
   ```

2. 환경 변수 (선택): 루트에 `.env.local`을 만들고 `.env.example`을 참고해 값을 채웁니다.

   - Supabase를 쓸 때: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 관리자 비밀번호: `NEXT_PUBLIC_ADMIN_PASSWORD` (미설정 시 기본값은 `admin`)

3. DB·스토리지 (Supabase 사용 시): Supabase SQL 에디터에서 순서대로 실행합니다.

   - `scripts/001_create_photos_table.sql` — `photos` 테이블 및 RLS
   - `scripts/002_storage_bucket.sql` — `storage_path` 컬럼, 공개 버킷 `wedding-photos`, Storage 정책

   빌드 전에 `NEXT_PUBLIC_SUPABASE_URL`이 설정되어 있어야 `next.config.mjs`가 스토리지 이미지 호스트를 허용합니다.

## 스크립트

| 명령        | 설명              |
| ----------- | ----------------- |
| `npm run dev`   | 개발 서버 (Turbopack) |
| `npm run build` | 프로덕션 빌드         |
| `npm run start` | 프로덕션 서버         |
| `npm run lint`  | ESLint              |

## 라우트

- `/` — 공개 갤러리 (승인된 사진만 표시)
- `/admin` — 관리자 대시보드 (비밀번호 후 목록·승인/거부/삭제)
