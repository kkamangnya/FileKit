# FileKit

FileKit은 Windows 데스크톱 환경에서 파일 압축/해제, 이미지 변환, PDF 도구, 파일 정리 자동화, 개발자 유틸리티, 워크플로우 구성을 한 곳에서 다루기 위한 올인원 파일 관리 유틸리티입니다.

Tauri v2, React, TypeScript, Vite, Rust backend를 기반으로 만들었으며, 무거운 파일 작업은 Rust side에서 처리하고 React frontend는 UI, 작업 큐, 진행률, 로그, 설정 화면을 담당합니다.

## 주요 기능

- 압축/해제: ZIP 압축 및 해제, 7Z/TAR/GZ 확장을 고려한 모듈 구조
- 이미지 도구: PNG, JPG, WEBP 변환, 리사이즈, 품질 설정, EXIF 제거 옵션
- PDF 도구: 이미지 to PDF, PDF 병합/분할 구조, 향후 PDF 압축 확장 준비
- 파일 정리 자동화: 확장자/날짜/크기 기준 정리, 다운로드 폴더 preset, hash 기반 중복 탐지 구조
- 개발자 유틸리티: JSON pretty print/minify, YAML to JSON, JSON to YAML, Base64 encode/decode, SHA256/MD5 hash
- 워크플로우: 여러 작업을 순서대로 조합하는 데이터 모델과 UI
- 작업 관리: 드래그앤드롭, 다중 파일 처리, 진행률, 성공/실패 로그, 취소 버튼
- 설정: 한국어/English 언어 선택, light/dark 테마 지원

## 스크린샷

현재 저장소에는 스크린샷 파일을 포함하지 않았습니다. 앱 화면 캡처 후 아래 경로에 추가하면 README에서 바로 노출할 수 있습니다.

| Dashboard | Image Tools | Settings |
| --- | --- | --- |
| `docs/screenshots/dashboard.png` | `docs/screenshots/image-tools.png` | `docs/screenshots/settings.png` |

## 설치 방법

### 릴리스 빌드 설치

GitHub Actions의 Windows Tauri Build 워크플로우가 성공하면 artifact에서 Windows 설치 파일을 받을 수 있습니다.

- NSIS installer: `FileKit_0.1.0_x64-setup.exe`
- MSI installer: `FileKit_0.1.0_x64_en-US.msi`
- Portable executable: `filekit.exe`

### 로컬에서 실행

```powershell
npm ci
npm run tauri:dev
```

### 로컬에서 설치 파일 빌드

```powershell
npm ci
npm run tauri:build
```

빌드 결과물은 기본적으로 `src-tauri/target/release/bundle/` 아래에 생성됩니다.

## 개발 환경

- Windows 10/11
- Microsoft Edge WebView2 Runtime
- Node.js 20 이상 권장
- npm 10 이상 권장
- Rust stable, Rust 1.77.2 이상
- Visual Studio Build Tools 또는 MSVC C++ build tools

주요 명령어:

```powershell
npm run dev          # Vite 개발 서버
npm run tauri:dev    # Tauri 데스크톱 앱 개발 실행
npm run build        # TypeScript + Vite frontend build
npm run tauri:build  # Windows desktop bundle build
```

Rust backend만 확인하려면 다음 명령을 사용합니다.

```powershell
cd src-tauri
cargo check
cargo test
```

## 프로젝트 구조

```text
src/
  components/     공통 UI와 레이아웃
  features/       기능별 UI 모듈
  hooks/          Tauri 이벤트와 drag/drop hooks
  lib/            Tauri invoke wrapper, i18n, utilities
  pages/          사이드바 페이지 단위 화면
  stores/         React Context 기반 앱 상태
  types/          frontend 공유 타입

src-tauri/
  src/commands/     Tauri command entrypoints
  src/services/     progress, filesystem 등 공통 서비스
  src/file_ops/     파일 정리와 경로 처리
  src/converters/   이미지/문서 변환 adapter
  src/compression/  ZIP 압축/해제
  src/pdf/          PDF 도구 서비스 구조
  src/hash/         SHA256/MD5 hash
  src/workflows/    workflow model 및 실행 구조
```

## 보안 및 파일 처리 원칙

- 원본 파일은 기본적으로 보존합니다.
- 결과물은 사용자가 선택한 output directory에 저장합니다.
- 삭제/덮어쓰기 작업은 확인 단계를 거치도록 UI 구조를 분리합니다.
- 파일 접근은 Tauri capability와 plugin permission을 통해 필요한 범위만 허용합니다.
- 무거운 파일 처리와 파일 시스템 접근은 Rust side에서 수행합니다.

## GitHub Actions

`.github/workflows/windows-tauri-build.yml` 워크플로우는 Windows runner에서 다음을 자동 수행합니다.

- npm dependency 설치
- frontend build
- Rust check 및 테스트
- Tauri Windows bundle build
- MSI/NSIS/EXE artifact 업로드

## 로드맵

- 7Z, TAR, GZ 압축/해제 실제 구현
- 암호 ZIP 및 분할 압축 구현
- PDF 병합/분할 엔진 고도화 및 PDF 압축 추가
- DOCX/PPTX/XLSX 변환 adapter와 외부 엔진 연동
- hash 기반 중복 파일 탐지 UI와 정리 workflow
- CSV viewer 고도화
- 워크플로우 실행 엔진 확장 및 preset 저장
- 릴리스 서명, 자동 업데이트, 실제 스크린샷 문서화

## 라이선스

TBD
