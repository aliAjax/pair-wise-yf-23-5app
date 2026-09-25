# 舞台灯光编排模拟器

纯前端舞台灯光编排工具，支持灯具通道、场景 Cue、时间轴预览和演出方案导出，所有数据存在 IndexedDB。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

启动后访问：<http://localhost:20113>

## 舞台预览：按播放时刻合成灯具结果

进入「舞台预览」页（默认页），播放头扫过多条轨道时，每盏灯的最终颜色按下面的规则合成，解决"一盏灯被多条轨道同时控制、颜色对不上现场叠加顺序"的问题：

1. **生效过滤**：场景状态为 `DISABLED` 的场景不参与；灯具状态为 `DISABLED`（停用灯具）不参与，始终黑场。
2. **窗口判定**：轨道只在 `[start_ms, start_ms + duration_ms)` 区间内生效。
3. **覆盖顺序**（按顺序依次覆盖，越靠后越先生效）：
   - 锁定轨道始终压住普通轨道（即使锁定轨道 `layer` 更小）；
   - 同为普通（或同为锁定）轨道时，按 `layer` 从低到高覆盖；
   - 同 `layer` 按 `start_ms` 先开始的先铺；
   - **多个场景同一时刻开始时，`priority` 高的排在后面后覆盖**；
   - 仍相同则以轨道 id 作为稳定兜底。
4. **淡入**：从轨道起点开始按场景 `fade_in_ms` 把颜色从黑场插值到目标色。
5. **增量重算**：调整场景只重算该场景控制的灯；调整轨道只重算其绑定场景控制的灯；停用/启用灯具只重算该灯；仅拖动播放头才对所有灯重算。页面底部会显示"本次重算 N 盏灯"。
6. **持久化到浏览器**：灯具/场景/轨道、当前播放头、最近一次合成结果以及命名的"检查快照"都写入 IndexedDB；重新进入页面会恢复播放头与结果，可载入历史快照继续核对覆盖链路。

种子数据内置了一组可直接验证规则的样例：蓝、绿两场景在 3000ms 同时开始（绿优先级高，后覆盖）；6000–8000ms 的白闪在**锁定轨道**上且图层为 0，仍压住普通轨道；另有一个停用场景与一盏停用灯具用于验证剔除。

## 本地开发方式

```bash
cd frontend && npm install && npm run dev
```

- 前端开发服务器：<http://localhost:20113>
- 合成规则的可执行校验脚本：`cd frontend && npx esbuild scripts/verify-composite.mts --bundle --platform=node --format=esm --outfile=/tmp/verify.mjs && node /tmp/verify.mjs`

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + Zustand + IndexedDB |
| 后端 | - |
| 数据库 | 浏览器本地 IndexedDB（首次进入灌入 `src/mocks` 种子） |
| 部署 | Docker Compose（Nginx 托管静态产物） |

## 项目目录结构

```text
frontend/src/
├── api/                  # 按模型分文件的 async API（走 IndexedDB 仓库）
├── stores/               # Zustand 独立 store（Fixture/CueScene/TimelineTrack/ShowProject/Preview）
├── types/                # 数据模型与合成结果类型
├── constants/            # 枚举、日志模板、错误码/错误消息、播放常量、状态文案
├── constructors/         # 实体默认对象与合成快照构造器
├── lighting/             # 合成核心：顺序比较、淡入、单灯合成、增量引擎
├── db/                   # IndexedDB 连接、实体仓库、播放头/快照仓库
├── components/common/    # FixtureIcon/CueCard/TimelineRuler/StageCanvas/ColorChannelSlider 等
├── components/preview/   # 播放控制、轨道条带、覆盖链路、调整面板
├── hooks/                # useTimelinePlayback/useIndexedDbStore/useDmxAddressCheck
├── pages/                # 灯具布置/场景编辑/时间轴编排/舞台预览
├── router/ utils/ mocks/
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `stage-light`
- `FRONTEND_PORT`: 前端端口，默认 `20113`

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: stage-light`。
- 容器名为 `${COMPOSE_PROJECT_NAME:-stage-light}-frontend`。
- 前端端口映射 `${FRONTEND_PORT:-20113}:80`，多阶段构建，最终用 Nginx 托管并配置 SPA `try_files`。
- 常见问题：端口占用时修改 `.env` 中端口后重启；纯前端无服务端数据库，数据在浏览器 IndexedDB 中，清浏览器站点数据即恢复种子。

## 枚举/常量出现位置清单

- FixtureType: `constants/FixtureType`、`types/FixtureType`、`constructors/FixtureConstructor`、`logTemplates`、`errorMessages`、灯具类型筛选、`FixtureIcon` 展示。
- CueStatus: `constants/CueStatus`、`types/CueStatus`、`constructors/CueSceneConstructor`、`logTemplates`、`errorMessages`、场景筛选、`CueCard`/`StatusBadge` 展示、`lighting/applyFixtureState` 停用判定、预览调整面板状态下拉。
- ChannelMode: `constants/ChannelMode`、`types/ChannelMode`、`constructors/FixtureConstructor`、`logTemplates`、`errorMessages`、通道筛选、`ColorChannelSlider` 展示。
- FixtureStatus（新增）: `constants/FixtureStatus`、`types/FixtureStatus`、`constants/statusText`、`constructors/FixtureConstructor`、`mocks/seedData`、`lighting/composeFixture` 停用灯具剔除、`hooks/useDmxAddressCheck`、`FixtureIcon`/`StageCanvas` 灰显、预览调整面板开关。
- 合成/播放常量: `constants/playback`（库名、节拍、持久化节流、锁定分组），被 `db/stageLightDb`、`db/playbackRepositories`、`stores/PreviewStore`、`hooks/useTimelinePlayback`、`components/preview/*` 共同引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录。以本次合成能力为例，新增一盏灯的"是否参与"状态需要同步 `types`、`constants`、`constructors`、`mocks`、`db`、`lighting`、`hooks`、组件与 README；改一次覆盖顺序只需动 `lighting/compositeOrder.ts` 的比较器，但所有页面的结果都经由 `CompositeEngine` → `PreviewStore` → `StageCanvas` 联动刷新。

## License

MIT
