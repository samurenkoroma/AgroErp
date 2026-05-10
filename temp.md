# 🌱 Модуль: Crop Planning (агропланирование)

## 🎯 Цель

Реализовать фронтенд-модуль для создания и ведения агропланов выращивания культур на основе:

- **Crop (культура)**
- **Variety (сорт)**
- **CultivationPlan (шаблон выращивания)**
- **CropPlan (конкретный цикл выращивания)**
- **Phenology (BBCH / GDD развитие)**

---

# 🧱 1. МОДЕЛИ ДАННЫХ (FRONTEND TYPES)

### 🌿 Crop (культура)

```ts
export interface Crop {
  key: string;          // "tomato"
  name: string;         // "Томат"
  family: string;       // "nightshade"
  category: string;     // "Овощные"
  imageUrl?: string;
  description?: string;
}
```
### 🌱 Variety (сорт)
```ts
export interface Variety {
  id: string;
  name: string;
  speciesKey: string;
  speciesName: string;

  baseTemperature: number;
  maxTemperature: number;

  daysToMaturity: number;

  phenophaseGDD: Phenophase[];

  waterRequirement: WaterRequirement;
  lightRequirement: LightRequirement;

  seedingRates: Record<string, SeedingRate>;

  yieldPotential: number;
  plantHeight: number;

  recommendedSeasons: string[];
  growingTypes: string[];

  description: string;
  image?: string;
}
```

### 🌾 Phenophase (BBCH стадия)

```ts
export interface Phenophase {
    code: string;          // "BBCH-51"
    name: string;          // "Начало цветения"
    gddRequired: number;
    description?: string;
    isCritical: boolean;
}
```

### 💧 WaterRequirement

```ts
export interface WaterRequirement {
    dailyNeedMin: number;
    dailyNeedOpt: number;
    criticalPhases: string[];
}
```
### 💡 LightRequirement
```ts
export interface LightRequirement {
    ppfdMin: number;
    ppfdOpt: number;
    dayLengthMin: number;
    dayLengthOpt: number;
    photoperiodType: "short_day" | "long_day" | "day_neutral";
    criticalPhases: string[];
}
```

### 🌱 SeedingRate
```ts
export interface SeedingRate {
    growingType: string; // "open_ground"
    rowSpacing: number;
    plantSpacing: number;
    sowingDepth: number;
    germinationRate: number;
    safetyFactor: number;
}
```
### 🏗 2. CROP PLAN (ОСНОВНАЯ СУЩНОСТЬ)
```ts
export interface CropPlan {
    id: string;

    cropId: string;
    varietyId: string;

    cultivationPlanId: string;

    startDate: string; // ISO

    locationId?: string;

    status: "draft" | "active" | "completed";

    createdAt: string;
    updatedAt: string;
}
```
### 📦 CropPlanSnapshot
```ts
export interface CropPlanSnapshot {
    cropPlanId: string;

    steps: CultivationStep[];
}
```
### 🌾 3. CULTIVATION PLAN (ШАБЛОН)
```ts
export interface CultivationPlan {
    id: string;
    name: string;
    cropId: string;

    description?: string;

    steps: CultivationStep[];
}
```
### 🌱 Step (самое важное)
```ts
export interface CultivationStep {
    id: string;

    type: "watering" | "fertilizing" | "spraying" | "harvesting";

    trigger: StepTrigger;

    params?: Record<string, any>;
}
```
### ⏱ Trigger (ключевая логика)
```ts
export type StepTrigger =
    | {
    type: "day_offset";
    dayOffset: number;
}
    | {
    type: "date";
    date: string;
}
    | {
    type: "bbch";
    stage: string; // "BBCH-51"
};
```
### 🌿 4. PHENOLOGY VIEW (СОСТОЯНИЕ ПОЛЯ)
```ts
export interface CurrentPhenology {
    planId: string;
    varietyId: string;

    varietyName: string;

    accumulatedGDD: number;
    requiredGDDForNext: number;

    currentPhaseCode: string;
    currentPhaseName: string;

    progressPercent: number;

    estimatedDaysToNextPhase: number;

    estimatedHarvestDate?: string;

    deviationDays: number;
    deviationReason?: string;

    isCritical: boolean;

    recommendedActions: RecommendedAction[];
}
```
### 🧠 RecommendedAction
```ts
export interface RecommendedAction {
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
    dueDays: number;
}
```
### 📡 5. API ENDPOINTS
    🌱 Catalog
GET /crops
GET /varieties?cropId=tomato
GET /varieties/:id

📦 Cultivation Plans
GET /cultivation-plans
GET /cultivation-plans/:id

🌾 Crop Plans
POST /crop-plans
GET /crop-plans
GET /crop-plans/:id

🌿 Phenology
GET /crop-plans/:id/phenology

🧭 6. ФЛОУ ЭКРАНОВ
🟢 1. Выбор культуры
    UI:
        * список Crop
        * поиск
🟢 2. Выбор сорта
    Crop → Variety list
🟢 3. Выбор cultivation plan
    basic_tomato | intensive | greenhouse
🟢 4. Создание crop plan
    POST /crop-plans
🟢 5. Дашборд плана

Отображает:
    текущую фазу BBCH
    GDD прогресс
    прогноз урожая
    список задач

🟢 6. Timeline (ключевой UI)
BBCH-10 → BBCH-51 → BBCH-61 → harvest


📊 7. UI КОМПОНЕНТЫ
🌱 CropSelector 
    - grid карточек культур
🌿 VarietySelector - 
    - фильтр по виду
    - карточки сортов
📦 CultivationPlanSelector
    - список шаблонов
📊 PhenologyDashboard
    - progress bar (GDD)
    - текущая стадия
    - прогноз урожая
⏱ Timeline
    - steps from snapshot
    - status per step

🔥 8. КЛЮЧЕВАЯ ЛОГИКА ФРОНТА
НЕ хранить бизнес-логику

❌ нельзя:
    calculateGDD()
    predictBBCH()

✔ только отображение
backend → truth source
frontend → visualization
⚡ 9. STATE MANAGEMENT

Рекомендация:

    React Query для server state
    minimal Zustand (если вообще нужен)
🧠 10. ПРИОРИТИЗАЦИЯ РЕАЛИЗАЦИИ
MVP
Crop list
Variety list
CultivationPlan list
Create CropPlan
Basic dashboard
V2
BBCH timeline
Phenology dashboard
recommendations
V3
weather integration
alerts
AI suggestions