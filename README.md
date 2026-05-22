# Livith Admin Dashboard

MySQL 데이터베이스 관리를 위한 Next.js 14 기반 관리자 대시보드입니다.

## 🚀 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MySQL (via Prisma ORM)
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## 📋 주요 기능

- 21개 데이터베이스 테이블 관리
- 검색 가능한 ID 필드 (모달 검색)
- 자동 입력 관련 필드
- 날짜 선택 캘린더
- 임시저장 기능 (localStorage)
- 변경사항 확인 모달
- 셋리스트 곡 순서 관리

## 🛠️ 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd Livith-Admin
```

### 2. 의존성 설치

```bash
npm install
```

이 명령은 자동으로 `postinstall` 스크립트를 실행하여 Prisma Client를 생성합니다.

### 3. 환경 변수 설정

따로 전달된 `.env` 파일을 루트 경로에 위치시켜주세요.

### 4. Prisma 설정 확인

데이터베이스 스키마를 확인합니다:

```bash
npx prisma db pull
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## 📁 프로젝트 구조

```
Livith-Admin/
├── app/
│   ├── actions.ts          # Server Actions
│   ├── layout.tsx          # Root Layout
│   └── page.tsx            # Main Dashboard
├── components/
│   ├── layout/
│   │   ├── Header.tsx      # 헤더 컴포넌트
│   │   └── Sidebar.tsx     # 사이드바
│   ├── modals/
│   │   ├── ConfirmSaveModal.tsx  # 저장 확인 모달
│   │   └── SearchModal.tsx       # 검색 모달
│   └── tables/
│       ├── TableCard.tsx          # 기본 테이블 카드
│       ├── SetlistSongsCard.tsx  # 셋리스트 곡 관리
│       └── ConcertSetlistsCard.tsx  # 콘서트 셋리스트
├── prisma/
│   └── schema.prisma       # Prisma 스키마
├── lib/
│   └── prisma.ts          # Prisma Client 인스턴스
├── .env.example           # 환경 변수 템플릿
├── .env.local            # 로컬 환경 변수 (gitignore됨)
└── package.json          # 의존성 및 스크립트
```

## 📝 관리 가능한 테이블

### Core Tables
- Artists
- Concerts
- Songs
- Setlists

### Concert Related
- Concert Comments
- Concert Genres
- Concert Info
- Cultures
- Merchandise
- Schedule

### Setlist Related
- Concert Setlists
- Setlist Songs

### Home/Search Sections
- Home Sections
- Home Concert Sections
- Search Sections
- Search Concert Sections

### User Related
- Users
- Reports
- Resignations

### Others
- Banners

## 🔧 개발 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# Prisma Client 생성 (자동으로 postinstall에서 실행됨)
npm run postinstall
# 또는
npx prisma generate

# Prisma Studio 실행 (GUI 데이터베이스 브라우저)
npx prisma studio
```

## 🔄 CI/CD 파이프라인

GitHub Actions를 사용해 코드 변경 → 빌드 검증 → 자동 배포를 자동화합니다.
워크플로우 정의: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

### Trigger 규칙

| 이벤트 | CI (빌드 검증) | CD (자동 배포) |
| --- | :---: | :---: |
| `main` 브랜치로 **PR** | ✅ | ❌ |
| `main` 브랜치에 **push** (merge) | ✅ | ✅ |

### 파이프라인 흐름

```
push/PR → [CI] checkout → setup-node(18) → npm ci → npm run build
                                                          │
                                      (main push & CI 성공 시에만)
                                                          ▼
   [CD] checkout → rsync로 코드 전송 → (서버) npm ci → npm run build → pm2 restart
```

- **CI (`ci` job)**: Node 18에서 의존성 설치 후 `npm run build`로 프로덕션 빌드가 깨지지 않는지 검증합니다. PR·push 모두에서 실행됩니다.
- **CD (`deploy` job)**: `main` 브랜치 push이고 CI가 성공한 경우에만 실행됩니다. 조직 정책상 서버에서 private 레포를 `git pull` 할 수 없어, Actions가 checkout한 코드를 **rsync로 EC2에 직접 전송**한 뒤 서버에서 빌드하고 pm2 프로세스(`livith-admin`, 포트 3001)를 재시작합니다. `.env`·`node_modules`는 전송에서 제외해 서버 값을 보존합니다.

### 필요한 GitHub Secrets

저장소 **Settings → Secrets and variables → Actions** 에서 등록합니다.

| Secret | 설명 | 예시 |
| --- | --- | --- |
| `EC2_HOST` | 배포 서버 호스트/IP | `43.200.16.103` |
| `EC2_USERNAME` | SSH 접속 계정 | `ubuntu` |
| `EC2_SSH_PRIVATE_KEY` | SSH 개인키 전체 내용 (`livith-key-new.pem`) | `-----BEGIN ...-----` |

> 키 등록 예시: `gh secret set EC2_SSH_PRIVATE_KEY < ~/Documents/인증서/livith-key-new.pem`

## 🐛 문제 해결

### Prisma Client가 생성되지 않는 경우

```bash
npx prisma generate
```

### 데이터베이스 연결 오류

1. `.env.local` 파일의 `DATABASE_URL`이 올바른지 확인
2. MySQL 서버가 실행 중인지 확인
3. SSH 터널을 사용하는 경우 터널이 활성화되어 있는지 확인

### Vercel 배포 오류

1. Vercel Dashboard에서 `DATABASE_URL` 환경 변수가 설정되어 있는지 확인
2. Build Logs를 확인하여 에러 메시지 확인
3. `postinstall` 스크립트가 성공적으로 실행되었는지 확인
