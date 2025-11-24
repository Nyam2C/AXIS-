# AXIS: Realign Your Core

> **"당신의 중심축(Axis)을 다시 찾으세요."**

**AXIS**는 TensorFlow.js와 MoveNet을 활용하여, 현대인의 고질병인 '거북목(Forward Head Posture)'을 실시간으로 교정하는 **웹 기반 헬스케어 솔루션**입니다.

## 배포 사이트

**https://axis-one-zeta.vercel.app/**

---

## 주요 기능

### 실시간 자세 감지
- **MoveNet Lightning** 모델로 코와 어깨 좌표를 실시간 추출
- 어깨선과 코 간의 **거리 변화** 기반 측정
- 상태별 시각 피드백 (정상/주의/위험)

### 개인 맞춤 캘리브레이션
- 측정 시작 시 5회 샘플링으로 기준 자세 설정
- **변동이 큰 경우 자동 재측정** (최대 3회 시도)
- 개인별 자세 차이를 보정하여 정확한 측정

### 스마트 모니터링
- **10초 간격** 샘플링으로 CPU 부하 최소화
- 연속 감지 횟수 설정 가능 (1~10회)
- 나쁜 자세 연속 감지 시 알림

### 세션 통계 리포트
- 측정 종료 시 세션 결과 표시
- 점수, 평균 각도, 자세 분포 시각화
- 등급별 피드백 메시지

### Privacy First
- 모든 연산은 브라우저 내에서 처리
- 카메라 영상은 저장/전송되지 않음

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Language** | TypeScript |
| **Build** | Vite |
| **ML Runtime** | TensorFlow.js |
| **Pose Model** | MoveNet Lightning |
| **Styling** | Tailwind CSS |
| **Testing** | Vitest |
| **Architecture** | MVC |

---

## 프로젝트 구조

```
AXIS/
├── src/
│   ├── models/              # 데이터 모델
│   │   ├── PostureState.ts      # 자세 상태 타입
│   │   └── Point.ts             # 좌표 타입
│   │
│   ├── views/               # UI 렌더링
│   │   ├── CameraView.ts        # 웹캠 + 스켈레톤 오버레이
│   │   ├── StatusView.ts        # 상태 표시
│   │   ├── AlertView.ts         # 알림 모달
│   │   ├── SettingsView.ts      # 설정 화면
│   │   ├── OnboardingView.ts    # 온보딩
│   │   └── ResultView.ts        # 세션 결과 화면
│   │
│   ├── controllers/         # 로직 제어
│   │   ├── AppController.ts     # 앱 전체 흐름 관리
│   │   ├── PostureController.ts # 자세 분석
│   │   ├── MonitoringController.ts # 10초 샘플링
│   │   └── AlertController.ts   # 알림 제어
│   │
│   ├── services/            # 외부 서비스
│   │   ├── PoseDetectionService.ts  # MoveNet 래핑
│   │   ├── CalibrationService.ts    # 캘리브레이션 (변동 검사 포함)
│   │   └── AngleCalculator.ts       # 거리 계산
│   │
│   └── main.ts              # 앱 진입점
│
├── index.html
└── package.json
```

---

## 자세 측정 알고리즘

어깨선(Y좌표)과 코 간의 **거리 변화**를 기반으로 자세를 측정합니다:

```typescript
// 코-어깨 거리 계산
function calculateNoseToShoulderDistance(nose: Point, shoulderCenter: Point): number {
  // 어깨 중심점의 Y좌표와 코의 Y좌표 차이
  // 화면 좌표계에서 Y는 아래로 갈수록 증가
  return shoulderCenter.y - nose.y;
}

// 거리 변화량 계산 (양수 = 거북목)
distanceChange = baselineDistance - currentDistance;
```

### 캘리브레이션 검증
- 5회 측정 시 **변동이 15px 초과**하면 재측정 요청
- 최대 3회 재시도 후 진행

### 자세 판단 기준

| 거리 변화 | 상태 | 설명 |
|-----------|------|------|
| 0 ~ 20px | 정상 | 바른 자세 |
| 20 ~ 40px | 주의 | 자세 교정 필요 |
| 40px 이상 | 위험 | 즉시 교정 권장 |

---

## 실행 방법

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
# http://localhost:5173 접속

# 빌드
npm run build

# 테스트 실행
npm test
```

### 배포

```bash
# Vercel 배포 (자동 배포 설정됨)
git push origin main
```

---

## 사용 방법

1. **시작하기** 버튼 클릭
2. 카메라 권한 허용
3. 바른 자세로 캘리브레이션 진행 (5회 측정)
4. 실시간 자세 모니터링 시작
5. **측정 중지** 버튼으로 종료 시 세션 결과 확인

---

## 설정 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| 알림 소리 | 거북목 감지 시 소리 알림 | ON |
| 연속 감지 횟수 | 알림 발생 기준 | 3회 |
| 캘리브레이션 초기화 | 기준 자세 재설정 | - |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
