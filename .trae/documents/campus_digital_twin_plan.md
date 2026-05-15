# 校园数字孪生系统基础项目 — 实施计划

## 一、项目概述

为浙江树人学院《计算机图形学》期中作业创建一个基于 HTML + JS + Three.js 的校园数字孪生系统基础项目。纯前端实现，浏览器直接打开即可运行。

**作者**：任亿嘉、郭昱含

---

## 二、当前状态分析

| 文件 | 现状 | 需要改动 |
|------|------|----------|
| `index.html` | 基本骨架存在，含 `#canvas-container` 和 `type="module"` 脚本引入 | 需添加信息面板占位 div，为后续扩展预留 |
| `js/main.js` | 仅含基础场景、地面、灯光、OrbitControls，无建筑/道路/树木 | **大幅重写**，模块化拆分函数，添加所有场景对象 |
| `css/style.css` | 仅含 reset + 全屏 canvas 样式 | 需添加信息面板样式、UI 控件样式占位 |
| `README.md` | 仅一行占位文字 | **完全重写**，包含项目简介、作者、技术栈、功能介绍 |

---

## 三、场景布局设计（基于用户确认）

```
俯视图（上北下南）：

        N (北校区 — 寝室楼)
    ┌──────────────────────────────┐
    │   🌳🌳 寝室楼C(高) 🌳🌳      │
    │                              │
    │   🌳🌳            🌳🌳      │    ┌──────────┐
    │                              │    │  操场    │
    │   🌳🌳 寝室楼A(中) 🌳🌳      │    │ (预留)   │
    │                              │    └──────────┘
    ═══════════ 东西向主路 ══════════════════════════
    │                              │
    │   🌳🌳 教学楼D(中) 🌳🌳      │
    │                              │
    │   🌳🌳 教学楼B(低) 🌳🌳      │
    │                              │
    S (南校区 — 教学区)
    └──────────────────────────────┘
```

- **东西向主路**：沿 Z 轴（场景中的深度方向），宽度 8 单位，贯穿整个场景
- **北校区（寝室区）**：路北 2 栋寝室楼（寝室楼A 中等 + 寝室楼C 最高），分散排列
- **南校区（教学区）**：路南 2 栋教学楼（教学楼B 较低 + 教学楼D 中等），分散排列
- **操场预留**：东北角（右上角），用浅色地面标记，不添加设施
- **树木**：道路南北两侧密集排列，每侧约 8 棵，间隔均匀

---

## 四、具体实施步骤

### 步骤 1：重写 `css/style.css`

**改动内容**：
- 保留现有 reset 和 `#canvas-container` 样式
- 新增 `.info-panel` 样式：固定在右上角的半透明面板，为后续"点击模型显示信息"功能预留
- 新增 `.view-controls` 样式：底部控制按钮区域，为后续"视角切换"和"图层显隐"预留

**具体样式**：
```css
.info-panel  — position: fixed; top: 20px; right: 20px; 半透明深色背景; 默认隐藏
.view-controls — position: fixed; bottom: 20px; left: 50%; 居中按钮组; 默认隐藏
```

---

### 步骤 2：重写 `js/main.js`

整体采用**函数式模块化**结构，每个功能独立为一个函数，顶层用 `// ========== 区块标题 ==========` 分隔。

#### 2.1 全局变量区

```javascript
let scene, camera, renderer, controls;
let buildingsGroup, treesGroup, roadsGroup; // 图层分组，方便后续显隐
let infoPanel; // 信息面板 DOM 引用
```

#### 2.2 `init()` — 主初始化函数

调用顺序：
1. `initScene()` — 场景 + 背景色（天空蓝 0x87CEEB）
2. `initCamera()` — 透视相机（FOV=60, near=0.1, far=1000），初始位置 (40, 30, 40)
3. `initRenderer()` — WebGL 渲染器，抗锯齿，阴影映射，挂载到 `#canvas-container`
4. `initControls()` — OrbitControls，阻尼，限制缩放范围
5. `initLights()` — 环境光 + 平行光（含阴影）
6. `createGround()` — 绿色地面 100×100
7. `createRoads()` — 东西向灰色柏油路
8. `createBuildings()` — 4栋建筑（北校区2栋寝室楼 + 南校区2栋教学楼）
9. `createTrees()` — 道路两侧树木
10. `createPlayground()` — 东北角操场预留区域
11. `bindEvents()` — resize 事件
12. `animate()` — 渲染循环

#### 2.3 `createBuildings()` 详细设计

每栋建筑由以下部分组成：
- **主体**：`BoxGeometry`，白色 `MeshStandardMaterial`（0xf5f5f5）
- **窗户**：在主体正面（+Z 方向）用多个小 `BoxGeometry` 排列，蓝色 `MeshStandardMaterial`（0x4A90D9）
  - 实现方式：用 `THREE.Group` 包裹主体 + 窗户组，窗户稍突出于墙面（offset 0.01）

| 建筑 | 位置 (x, y, z) | 尺寸 (宽×高×深) | 楼层 | 窗户排列 | 区域 |
|------|---------------|-----------------|------|----------|------|
| 寝室楼A（中） | (-12, 0, -12) | 8×12×6 | 3层 | 3列×3行 | 北校区 |
| 寝室楼C（高） | (12, 0, -18) | 7×16×6 | 4层 | 3列×4行 | 北校区 |
| 教学楼B（低） | (8, 0, 12) | 10×8×7 | 2层 | 4列×2行 | 南校区 |
| 教学楼D（中） | (-8, 0, 14) | 9×10×7 | 3层 | 3列×3行 | 南校区 |

> 窗户生成逻辑：根据楼层数和列数，在建筑正面循环放置蓝色小方块（1.2×1.5 每个），间距均匀。

#### 2.4 `createRoads()` 详细设计

- **主路**：`PlaneGeometry(80, 8)`，灰色 `MeshStandardMaterial`（0x555555），位置 `(0, 0.02, 0)`，绕 X 轴旋转 -90°
  - 路面略高于地面 0.02，避免 z-fighting
- **道路标线**：在主路中间加一条虚线
  - 用多个小 `PlaneGeometry` 黄色方块（0xFFD700），间隔排列

#### 2.5 `createTrees()` 详细设计

每棵树由 `THREE.Group` 组成：
- **树干**：`CylinderGeometry(0.3, 0.4, 3, 8)`，棕色 `MeshStandardMaterial`（0x8B4513）
- **树冠**：3 层 `ConeGeometry` 堆叠，绿色 `MeshStandardMaterial`
  - 下层：`ConeGeometry(2, 2, 8)`，位置 y=2.5
  - 中层：`ConeGeometry(1.5, 2, 8)`，位置 y=3.5
  - 上层：`ConeGeometry(1, 2, 8)`，位置 y=4.5

树木位置（沿道路两侧，Z 轴方向）：
- 路北侧（z=-4.5）：x 从 -35 到 35，间隔约 8 单位 → 约 9 棵树
- 路南侧（z=4.5）：x 从 -35 到 35，间隔约 8 单位 → 约 9 棵树
- 跳过建筑物占用的位置

所有树放入 `treesGroup`，所有建筑放入 `buildingsGroup`，所有道路元素放入 `roadsGroup`。

#### 2.6 `createPlayground()` 详细设计

- 位置：东北角 `(25, 0.01, -48)` 附近
- 一个 `PlaneGeometry(20, 15)` 的浅红色平面（0xCD853F 或 0xD2691E），代表跑道/操场地面
- 添加白色边框线（用 `EdgesGeometry` + `LineBasicMaterial`）

#### 2.7 平行光阴影配置

```javascript
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -60;
directionalLight.shadow.camera.right = 60;
directionalLight.shadow.camera.top = 60;
directionalLight.shadow.camera.bottom = -60;
```

建筑物和树木设置 `castShadow = true`，地面设置 `receiveShadow = true`。

#### 2.8 代码注释规范

- 每个函数前加 JSDoc 风格注释，说明功能
- 关键参数用行内注释解释
- 使用 `// ========== 区块名 ==========` 分隔大区块
- 所有注释使用中文

#### 2.9 扩展预留

- 建筑、树木、道路分别用 `THREE.Group` 分组，存储在全局变量中
- 信息面板 DOM 引用存储在 `infoPanel` 变量
- 预留 `loadGLBModel(url, position)` 空函数骨架
- 预留 `toggleView(mode)` 空函数骨架（mode: 'perspective' | 'bird-eye'）
- 预留 `toggleLayer(groupName, visible)` 空函数骨架

---

### 步骤 3：更新 `index.html`

在 `<body>` 中新增：
```html
<div class="info-panel" id="info-panel" style="display: none;">
    <h3 id="info-title"></h3>
    <p id="info-description"></p>
</div>
<div class="view-controls" id="view-controls" style="display: none;">
    <!-- 后续扩展：视角切换、图层控制按钮 -->
</div>
```

---

### 步骤 4：重写 `README.md`

内容结构：
```markdown
# 浙江树人学院 — 校园数字孪生系统

## 项目简介
本项目是浙江树人学院计算机图形学期中作业-校园数字孪生系统
作者：任亿嘉、郭昱含

## 技术栈
- HTML5
- CSS3
- JavaScript (ES Module)
- Three.js (v0.160.0)

## 功能介绍
- 3D 校园场景渲染
- 北校区2栋寝室楼 + 南校区2栋教学楼（白色墙体 + 蓝色窗户）
- 东西向贯穿主路（灰色柏油路 + 黄色标线）
- 道路两侧绿化树木
- 操场预留区域
- 鼠标旋转/平移/缩放交互
- 动态光影（环境光 + 平行光 + 阴影）

## 运行方式
直接用浏览器打开 index.html 即可运行

## 后续扩展
- GLB 模型加载
- 点击交互信息面板
- 透视/鸟瞰视角切换
- 图层显隐控制

本项目是浙江树人学院期中作业
```

---

## 五、验证步骤

1. 用浏览器直接打开 `index.html`
2. 确认场景正常渲染（天空蓝背景、绿色地面）
3. 确认 4 栋建筑可见：北校区 2 栋寝室楼 + 南校区 2 栋教学楼，各有蓝色窗户
4. 确认灰色道路东西贯穿，中间有黄色虚线
5. 确认道路两侧有绿色树木
6. 确认东北角有操场预留区域
7. 鼠标拖拽可旋转视角，滚轮可缩放，右键可平移
8. 确认阴影效果正常（建筑物和树木在地面投射阴影）
9. 调整浏览器窗口大小，确认场景自适应

---

## 六、不涉及的内容（Out of Scope）

- GLB 模型加载的实际实现（仅预留函数骨架）
- Raycaster 点击交互（仅预留信息面板 DOM）
- 视角切换逻辑（仅预留函数骨架）
- 图层显隐 UI 控件（仅预留容器 div）
- 任何后端或数据库
- npm / webpack / vite 等构建工具