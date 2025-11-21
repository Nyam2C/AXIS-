# AXIS: Realign Your Core

> **"당신의 중심축(Axis)을 다시 찾으세요."**

**AXIS**는 TensorFlow.js와 MoveNet을 활용하여, 현대인의 고질병인 '거북목(Forward Head Posture)'을 실시간으로 교정하는 **웹 기반 헬스케어 솔루션**입니다.

---

## 1. Research (기술 조사)

### TensorFlow.js + MoveNet

- **MoveNet**: Google의 초경량 포즈 감지 모델
- **17개 관절 포인트** 실시간 추출 (COCO 키포인트)
- 주요 사용 관절: `nose`, `leftEar`, `rightEar`, `leftShoulder`, `rightShoulder`
- **장점**: 브라우저에서 실행, 설치 불필요, 크로스 플랫폼

### MoveNet 모델 종류

| 모델 | 속도 | 정확도 | 용도 |
|------|------|--------|------|
| **Lightning** | 빠름 | 중간 | 실시간 감지 (권장) |
| **Thunder** | 느림 | 높음 | 정밀 분석 |

### 기하학적 각도 계산

```javascript
// 벡터 내적을 이용한 각도 계산
const dotProduct = (a, b) => a.x * b.x + a.y * b.y;
const magnitude = (v) => Math.sqrt(v.x * v.x + v.y * v.y);
const angle = Math.acos(dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB)));
```

- **2D 좌표 기반**: (x, y) 픽셀 좌표로 계산
- **arccos 함수**: 두 벡터 사잇각 계산 (라디안 → 도 변환)

### 성능 최적화 기법

- **requestAnimationFrame**: 프레임 단위 제어
- **throttle/debounce**: 불필요한 연산 방지
- **Web Worker**: 메인 스레드 블로킹 방지 (선택)

---

## 2. Planning (기획)

### 핵심 가설

> "웹캠과 TensorFlow.js만으로 거북목을 **정확하게** 감지하고, **부담 없이** 교정할 수 있다."

### 타겟 사용자

- 하루 6시간 이상 책상에서 작업하는 직장인/학생
- 별도 앱 설치 없이 브라우저로 바로 사용하고 싶은 사람
- 프라이버시를 중시하는 사용자 (서버 전송 없음)

### 핵심 기능 정의

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| Quick Check | 5초 만에 현재 자세 진단 | P0 |
| Smart Monitoring | 간헐적 샘플링으로 장시간 모니터링 | P0 |
| Calibration | 개인별 기준 자세 설정 | P1 |
| History | 자세 기록 및 통계 | P2 |

### 기술적 의사결정

**Q: 왜 ML 모델 대신 기하학적 알고리즘?**
- 데이터 수집/학습 불필요 → 개발 속도 향상
- 연산량 최소화 → 성능 최적화
- 수학적으로 검증 가능 → 신뢰성 확보

**Q: 왜 1분/10초 샘플링 주기?**
- 1분 이내 자세 변화는 일시적인 경우가 많음
- 10초면 안정적인 좌표 추출 가능
- CPU 부하 대폭 절감 기대 (상시 감지 대비)

---

## 3. Execution (실행)

### 개발 로드맵

```
Phase 1: Core (MVP)
├── TensorFlow.js + MoveNet 세팅
├── 웹캠 연동
├── 좌표 추출 로직
├── 각도 계산 알고리즘
└── Quick Check UI

Phase 2: Monitoring
├── 간헐적 샘플링 시스템
├── 3회 연속 감지 로직
└── 알림 (소리/시각)

Phase 3: Polish
├── 캘리브레이션 기능
├── 설정 화면
└── 온보딩 플로우
```

### 기술 스택

- **Platform:** Web (PWA 가능)
- **Language:** TypeScript
- **Architecture:** MVC
- **Libraries:**
  - **TensorFlow.js** - ML 런타임
  - **@tensorflow-models/pose-detection** - MoveNet 모델
  - **Tailwind CSS** - 스타일링

### 프로젝트 구조 (MVC)

```
AXIS/
├── src/
│   ├── models/              # Model - 데이터 및 비즈니스 로직
│   │   ├── PostureState.ts      # 자세 상태 (정상/주의/위험)
│   │   ├── PoseData.ts          # 관절 좌표 데이터
│   │   └── UserSettings.ts      # 사용자 설정
│   │
│   ├── views/               # View - UI 렌더링
│   │   ├── CameraView.ts        # 웹캠 화면
│   │   ├── OverlayView.ts       # 스켈레톤 오버레이
│   │   ├── StatusView.ts        # 상태 표시 UI
│   │   └── AlertView.ts         # 알림 UI
│   │
│   ├── controllers/         # Controller - 로직 제어
│   │   ├── PoseController.ts    # 포즈 감지 제어
│   │   ├── PostureController.ts # 자세 분석 제어
│   │   ├── MonitoringController.ts # 모니터링 제어
│   │   └── AlertController.ts   # 알림 제어
│   │
│   ├── services/            # 외부 서비스 연동
│   │   ├── PoseDetectionService.ts  # TensorFlow.js/MoveNet
│   │   └── AngleCalculator.ts       # 각도 계산 유틸
│   │
│   ├── app.ts               # 앱 진입점
│   └── main.ts
│
├── public/
├── index.html
└── package.json
```

### MVC 역할 분담

| 계층 | 역할 | 예시 |
|------|------|------|
| **Model** | 데이터 구조, 상태 관리 | `PostureState`, `PoseData` |
| **View** | UI 렌더링만 담당 | `CameraView`, `StatusView` |
| **Controller** | Model ↔ View 중재, 로직 | `PostureController` |
| **Service** | 외부 라이브러리 래핑 | `PoseDetectionService` |

---

## Key Features

### Quick Check (5초 자세 진단)

웹사이트 접속 후 **단 5초** 만에 현재의 자세 상태를 분석합니다. MoveNet이 사용자의 귀와 어깨 위치를 스캔하여, 거북목 진행 단계와 어깨 불균형 정도를 직관적인 수치(각도)와 컬러로 보여줍니다.

### Smart Monitoring (장시간 모니터링)

업무나 공부를 하는 동안, AXIS는 **'간헐적 샘플링(Intermittent Sampling)'** 기술을 통해 사용자의 자세를 모니터링합니다.

- **1분 대기 / 10초 측정** 사이클을 반복하여 CPU 부하 최소화
- 불량 자세가 **3회 연속** 감지될 경우에만 알림

### Privacy First (100% 클라이언트)

사용자의 카메라 영상은 오직 좌표 추출을 위해서만 순간적으로 사용되며, **그 어디에도 저장되거나 전송되지 않습니다.** 모든 연산은 브라우저 내에서 처리됩니다.

---

## Core Technology

### Geometric Vector Algorithm

MoveNet의 2D 스켈레톤 데이터에서 **귀(Ear)**와 **어깨(Shoulder)**의 좌표를 실시간으로 추출하고, 벡터 연산으로 거북목 각도를 산출합니다.

```
1. Vector Extraction: 귀와 어깨를 잇는 벡터 추출
2. Angle Calculation: 수직 벡터(Y축)와의 사잇각 θ 계산
3. Decision: θ > 15° → 거북목 상태로 판별
```

이 방식은 딥러닝 모델 대비 **연산 속도가 빠르고**, 데이터 편향(Bias) 문제로부터 자유롭습니다.

---

## Demo

### 배포 URL

> **https://axis-posture.vercel.app** (예정)

브라우저에서 바로 접속하여 동작을 확인할 수 있습니다.

### 로컬 실행

```bash
npm install
npm run dev
# http://localhost:5173 접속
```

### 결과물 확인 방법

| Phase | 확인 가능한 기능 | 상태 |
|-------|------------------|------|
| Phase 1 | 웹캠 → 포즈 감지 → 각도 표시 | 예정 |
| Phase 2 | + 1분/10초 샘플링, 알림 | 예정 |
| Phase 3 | + 캘리브레이션, 설정 | 예정 |

### 테스트 시나리오

1. **Quick Check 테스트**
   - 웹캠 권한 허용
   - 카메라에 상반신이 보이도록 위치
   - 목 각도와 상태(정상/주의/위험)가 표시되는지 확인

2. **Monitoring 테스트** (Phase 2)
   - 모니터링 모드 시작
   - 1분 대기 후 10초간 측정되는지 확인
   - 의도적으로 거북목 자세 → 3회 연속 시 알림 확인

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
