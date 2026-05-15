// ========== 全局变量 ==========
var scene, camera, renderer, controls;
var perspectiveCamera, birdCamera; // 定义两个相机
var buildingsGroup, treesGroup, roadsGroup;
var infoPanel;
var currentView = 'perspective'; // 当前视角状态

// ========== 坐标缩放常量 ==========
// JSON 坐标范围约 x:[-162,170] z:[-178,150]，缩放 0.3 后约 x:[-49,51] z:[-53,45]
var SCALE = 0.3;

// ========== 建筑类型配置 ==========
// 每种类型对应：宽度、高度、深度、楼层数、窗户列数、墙体颜色
var TYPE_CONFIG = {
    tennis:        { w: 12, h: 0.2, d: 8,  floors: 0, cols: 0, color: 0x4B90D9 }, // 网球场地面蓝色
    track:         { w: 15, h: 0.1, d: 25, floors: 0, cols: 0, color: 0xC04040 }, // 操场塑胶红
    dormitory:     { w: 4,  h: 10, d: 4, floors: 3, cols: 2, color: 0xFFF8E7 },
    teaching:      { w: 6,  h: 10, d: 5, floors: 3, cols: 2, color: 0xF5F5F5 },
    laboratory:    { w: 6,  h: 14, d: 5, floors: 4, cols: 2, color: 0xE0E0E8 },
    administration:{ w: 8,  h: 16, d: 6, floors: 4, cols: 3, color: 0xE8EEF5 },
    library:       { w: 9,  h: 14, d: 6, floors: 4, cols: 3, color: 0xFFF0E0 },
    sports:        { w: 9,  h: 3,  d: 7, floors: 1, cols: 0, color: 0xD0D8E0 },
    gate:          { w: 2,  h: 2.5,d: 1, floors: 1, cols: 0, color: 0x888888 },
    canteen:       { w: 7,  h: 6,  d: 5, floors: 2, cols: 2, color: 0xFFF5E0 },
    academic:      { w: 6,  h: 8,  d: 5, floors: 2, cols: 2, color: 0xF0F0F0 },
    industry:      { w: 7,  h: 8,  d: 5, floors: 2, cols: 2, color: 0xDDDDDD },
    art:           { w: 4,  h: 8,  d: 4, floors: 2, cols: 2, color: 0xE8E0F0 },
    intersection:  { w: 1,  h: 0.5,d: 1, floors: 1, cols: 0, color: 0x666666 }
};

// ========== 建筑数据（来自 JSON） ==========
var BUILDING_DATA = [
    // 北校区（z > 0）
    { id: "N001", name: "致勤园1幢",   x: -82,   z: 140,  type: "dormitory" },
    { id: "N002", name: "致勤园2幢",   x: -97,   z: 160,  type: "dormitory" },
    { id: "N003", name: "致勤园3幢",   x: -112,  z: 140,  type: "dormitory" },
    { id: "N004", name: "北校区北门",   x: -120,  z: 180,  type: "gate" },
    { id: "N005", name: "网球场",       x: -10,   z: 120,   type: "tennis" },
    { id: "N006", name: "创业产业园",   x: 0,   z: 60,   type: "industry" },
    { id: "N007", name: "体育馆",       x: -68,   z: 82,   type: "sports" },
    { id: "N008", name: "田径场",       x: -160,  z: 120,   type: "track" },
    { id: "N009", name: "26号楼",       x: -124,  z: 60,   type: "teaching" },
    { id: "N010", name: "美术馆",       x: -170,  z: 50,   type: "art" },
    { id: "N011", name: "北校区南门口", x: -62,   z: 20,    type: "gate" },
    { id: "N012", name: "南校区北门口",   x: -60,   z: -20,   type: "gate" },
    // 南校区（z < 0）
    { id: "S001", name: "清乐园",               x: 170, z: 40,    type: "canteen" },
    { id: "S002", name: "树人之家",             x: 150,  z: -50,   type: "academic" },
    { id: "S003", name: "第三实验大楼",         x: 72,  z: -30,  type: "laboratory" },
    { id: "S016", name: "第一实验大楼",         x: 72,  z: -50,  type: "laboratory" },
    { id: "S004", name: "学术报告厅",           x: 25,  z: -30,  type: "academic" },
    { id: "S005", name: "第二实验大楼",         x: -25,    z: -30,  type: "laboratory" },
    { id: "S006", name: "查济民大厦（行政中心）", x: -80, z: -50,  type: "administration" },
    { id: "S007", name: "图书馆",               x: 0,    z: -72,  type: "library" },
    { id: "S008", name: "裙房B2",               x: 30,  z: -100,  type: "teaching" },
    { id: "S009", name: "裙房B1",               x: -30,    z: -100,  type: "teaching" },
    { id: "S010", name: "教学主楼A4",           x: 40,  z: -115,  type: "teaching" },
    { id: "S011", name: "教学主楼A3",           x: -40,   z: -115,  type: "teaching" },
    { id: "S012", name: "教学主楼A2",           x: 40,  z: -140, type: "teaching" },
    { id: "S013", name: "教学主楼A1",           x: -40,   z: -140, type: "teaching" },
    { id: "S014", name: "南校区南门",           x: 0,    z: -168, type: "gate" },
    { id: "S015A", name: "致和园1号楼",         x: 162, z: -170, type: "dormitory" },
    { id: "S015B", name: "致和园2号楼",         x: 162, z: -200, type: "dormitory" }
];

// ========== 主初始化函数 ==========
function init() {
    initScene();
    initCamera();
    initRenderer();
    initControls();
    initLights();
    createGround();
    createRoads();
    createBuildings();
    createTrees();
    createLabels();
    bindEvents();
    animate();
}

// ========== 场景初始化 ==========
function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 80, 250);

    buildingsGroup = new THREE.Group();
    treesGroup = new THREE.Group();
    roadsGroup = new THREE.Group();
    scene.add(buildingsGroup);
    scene.add(treesGroup);
    scene.add(roadsGroup);
}

// ========== 相机初始化 ==========
function initCamera() {
    // 1. 初始化透视相机 (Perspective View)
    perspectiveCamera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    perspectiveCamera.position.set(0, 45, -85);

    // 2. 初始化鸟瞰相机 (Bird View - 正上方俯视)
    birdCamera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    // 高度 y=30 (根据场景 SCALE=0.3 调整原需求 y=3 为 y=30 以获得合适范围)
    birdCamera.position.set(0, 30, -30); 
    birdCamera.lookAt(0, 0, -30);

    // 默认使用透视相机
    camera = perspectiveCamera;
}

// ========== 渲染器初始化 ==========
function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
}

// ========== 轨道控制器初始化 ==========
function initControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, -30);
    controls.minDistance = 5;
    controls.maxDistance = 200;
    controls.maxPolarAngle = Math.PI / 2.1;
}

// ========== 光照系统初始化 ==========
function initLights() {
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 80, 30);
    directionalLight.castShadow = true;

    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -80;
    directionalLight.shadow.camera.right = 80;
    directionalLight.shadow.camera.top = 80;
    directionalLight.shadow.camera.bottom = -80;
    directionalLight.shadow.bias = -0.0005;

    scene.add(directionalLight);

    var fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);
}

// ========== 地面创建 ==========
function createGround() {
    var groundGeometry = new THREE.PlaneGeometry(140, 140);
    var groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x4CAF50,
        side: THREE.DoubleSide
    });
    var ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

// ========== 道路创建 ==========
function createRoads() {
    var roadGeometry = new THREE.PlaneGeometry(120, 8);
    var roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.9
    });
    var road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.02;
    road.receiveShadow = true;
    roadsGroup.add(road);

    var dashLength = 2.0;
    var dashGap = 2.0;
    var dashWidth = 0.25;
    var dashGeometry = new THREE.PlaneGeometry(dashLength, dashWidth);
    var dashMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        roughness: 0.4
    });

    var totalLength = 118;
    var step = dashLength + dashGap;
    var count = Math.floor(totalLength / step);

    for (var i = 0; i < count; i++) {
        var dash = new THREE.Mesh(dashGeometry, dashMaterial);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(-totalLength / 2 + i * step + dashLength / 2, 0.03, 0);
        roadsGroup.add(dash);
    }
}

// ========== 建筑创建工具函数 ==========
/**
 * 创建一栋建筑
 * @param {number} w   - 建筑宽度 (X轴)
 * @param {number} h   - 建筑高度 (Y轴)
 * @param {number} d   - 建筑深度 (Z轴)
 * @param {number} floors - 楼层数
 * @param {number} cols   - 每层窗户列数（0=无窗户，如体育场馆/大门）
 * @param {number} bodyColor - 墙体颜色
 * @param {THREE.Vector3} position - 建筑位置
 * @param {string} name - 建筑名称
 * @returns {THREE.Group} 建筑组
 */
function createBuilding(w, h, d, floors, cols, bodyColor, position, name) {
    var group = new THREE.Group();
    group.name = name;

    var bodyGeometry = new THREE.BoxGeometry(w, h, d);
    var bodyMaterial = new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.6
    });
    var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // 仅当 cols > 0 时添加窗户
    if (cols > 0) {
        var winWidth = Math.min(1.2, (w - 1) / cols);
        var winHeight = 1.5;
        var winDepth = 0.15;
        var winGeometry = new THREE.BoxGeometry(winWidth, winHeight, winDepth);
        var winMaterial = new THREE.MeshStandardMaterial({
            color: 0x4A90D9,
            roughness: 0.3,
            metalness: 0.5
        });

        var floorHeight = h / floors;
        var spacingX = (w - cols * winWidth) / (cols + 1);

        for (var row = 0; row < floors; row++) {
            var winY = floorHeight * row + floorHeight * 0.5;
            for (var col = 0; col < cols; col++) {
                var winX = -w / 2 + spacingX + col * (winWidth + spacingX) + winWidth / 2;
                var win = new THREE.Mesh(winGeometry, winMaterial);
                win.position.set(winX, winY, d / 2 + winDepth / 2);
                group.add(win);
            }
        }
    }

    var roofGeometry = new THREE.BoxGeometry(w + 0.3, 0.25, d + 0.3);
    var roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.7
    });
    var roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = h + 0.125;
    roof.castShadow = true;
    group.add(roof);

    group.position.copy(position);
    return group;
}

// ========== 建筑名称标签工具函数 ==========
/**
 * 创建悬浮式楼宇标签（POI 风格）
 * - 红色圆角背景 + 白色粗体中文
 * - 带轻微阴影
 * - 显示建筑名称 + 编号
 * - 始终朝向摄像机
 * @param {string} name - 建筑名称
 * @param {string} id - 建筑编号
 * @param {THREE.Vector3} position - 标签位置（建筑正上方）
 * @returns {THREE.Sprite} 文字精灵
 */
function createBuildingLabel(name, id, position) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var nameFontSize = 26;
    var idFontSize = 16;

    ctx.font = 'bold ' + nameFontSize + 'px Microsoft YaHei, PingFang SC, sans-serif';
    var nameWidth = ctx.measureText(name).width;

    ctx.font = idFontSize + 'px Consolas, monospace';
    var idText = id;
    var idWidth = ctx.measureText(idText).width;

    var contentWidth = Math.max(nameWidth, idWidth);
    var boxWidth = contentWidth + 40;
    var boxHeight = 72;
    var boxX = (canvas.width - boxWidth) / 2;
    var boxY = (canvas.height - boxHeight) / 2;

    // 阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    // 红色圆角背景
    ctx.fillStyle = '#D93025';
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
    } else {
        ctx.rect(boxX, boxY, boxWidth, boxHeight);
    }
    ctx.fill();

    // 清除阴影，绘制文字
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 建筑名称（白色粗体）
    ctx.font = 'bold ' + nameFontSize + 'px Microsoft YaHei, PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(name, canvas.width / 2, canvas.height / 2 - 10);

    // 编号（浅白色小字）
    ctx.font = idFontSize + 'px Consolas, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(idText, canvas.width / 2, canvas.height / 2 + 18);

    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.scale.set(14, 3.5, 1);
    return sprite;
}

// ========== 建筑群创建 ==========
function createBuildings() {
    for (var i = 0; i < BUILDING_DATA.length; i++) {
        var b = BUILDING_DATA[i];
        var cfg = TYPE_CONFIG[b.type] || TYPE_CONFIG.teaching;
        var pos = new THREE.Vector3(b.x * SCALE, 0, b.z * SCALE);
        
        // 如果是操场或网球场，使用特殊形状
        if (b.type === 'track') {
            buildingsGroup.add(createTrackField(cfg.w, cfg.d, pos, b.name));
        } else if (b.type === 'tennis') {
            buildingsGroup.add(createTennisCourt(cfg.w, cfg.d, pos, b.name));
        } else {
            buildingsGroup.add(
                createBuilding(cfg.w, cfg.h, cfg.d, cfg.floors, cfg.cols, cfg.color, pos, b.name)
            );
        }

        var labelY = cfg.h + 2.5;
        var label = createBuildingLabel(b.name, b.id || '', new THREE.Vector3(pos.x, labelY, pos.z));
        buildingsGroup.add(label);
    }
}

/**
 * 创建操场模样
 */
function createTrackField(w, d, position, name) {
    var group = new THREE.Group();
    group.name = name;

    // 红色塑胶跑道区域
    var trackGeo = new THREE.PlaneGeometry(w, d);
    var trackMat = new THREE.MeshStandardMaterial({ color: 0xC04040, side: THREE.DoubleSide });
    var track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.05;
    track.receiveShadow = true;
    group.add(track);

    // 中间绿色草坪
    var grassGeo = new THREE.PlaneGeometry(w * 0.7, d * 0.7);
    var grassMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50, side: THREE.DoubleSide });
    var grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 0.06;
    group.add(grass);

    // 白色跑道线（简化版）
    var lineGeo = new THREE.PlaneGeometry(w * 0.95, d * 0.95);
    var lineMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide, wireframe: true });
    var line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.07;
    group.add(line);

    group.position.copy(position);
    return group;
}

/**
 * 创建网球场模样
 */
function createTennisCourt(w, d, position, name) {
    var group = new THREE.Group();
    group.name = name;

    // 蓝色球场地面
    var courtGeo = new THREE.PlaneGeometry(w, d);
    var courtMat = new THREE.MeshStandardMaterial({ color: 0x4B90D9, side: THREE.DoubleSide });
    var court = new THREE.Mesh(courtGeo, courtMat);
    court.rotation.x = -Math.PI / 2;
    court.position.y = 0.05;
    court.receiveShadow = true;
    group.add(court);

    // 球网
    var netGeo = new THREE.PlaneGeometry(w, 0.8);
    var netMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    var net = new THREE.Mesh(netGeo, netMat);
    net.position.y = 0.4;
    group.add(net);

    // 球场边线
    var borderGeo = new THREE.PlaneGeometry(w * 0.9, d * 0.9);
    var borderMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide, wireframe: true });
    var border = new THREE.Mesh(borderGeo, borderMat);
    border.rotation.x = -Math.PI / 2;
    border.position.y = 0.06;
    group.add(border);

    group.position.copy(position);
    return group;
}

// ========== 树木创建工具函数 ==========
function createTree(position) {
    var group = new THREE.Group();

    var trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
    var trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9
    });
    var trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    var crownMaterial = new THREE.MeshStandardMaterial({
        color: 0x2E7D32,
        roughness: 0.7
    });

    var crown1Geometry = new THREE.ConeGeometry(2, 2, 8);
    var crown1 = new THREE.Mesh(crown1Geometry, crownMaterial);
    crown1.position.y = 2.5;
    crown1.castShadow = true;
    group.add(crown1);

    var crown2Geometry = new THREE.ConeGeometry(1.5, 2, 8);
    var crown2 = new THREE.Mesh(crown2Geometry, crownMaterial);
    crown2.position.y = 3.5;
    crown2.castShadow = true;
    group.add(crown2);

    var crown3Geometry = new THREE.ConeGeometry(1, 2, 8);
    var crown3 = new THREE.Mesh(crown3Geometry, crownMaterial);
    crown3.position.y = 4.5;
    crown3.castShadow = true;
    group.add(crown3);

    group.position.copy(position);
    return group;
}

// ========== 树木群创建 ==========
function createTrees() {
    // 道路两侧植树：路北侧 z=-4.5，路南侧 z=4.5
    for (var x = -55; x <= 55; x += 8) {
        treesGroup.add(createTree(new THREE.Vector3(x, 0, -4.5)));
    }
    for (var x2 = -55; x2 <= 55; x2 += 8) {
        treesGroup.add(createTree(new THREE.Vector3(x2, 0, 4.5)));
    }
}

// ========== 校区标签创建 ==========
/**
 * 创建一个文字标签精灵
 * @param {string} text - 标签文字
 * @param {THREE.Vector3} position - 标签位置
 * @param {number} fontSize - 字体大小
 * @param {string} fontColor - 字体颜色
 * @returns {THREE.Sprite} 文字精灵
 */
function createTextLabel(text, position, fontSize, fontColor) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold ' + fontSize + 'px Microsoft YaHei, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    var textWidth = ctx.measureText(text).width;
    var paddingX = 30;
    var paddingY = 16;
    var rx = (canvas.width - textWidth) / 2 - paddingX;
    var ry = (canvas.height - fontSize) / 2 - paddingY;
    var rw = textWidth + paddingX * 2;
    var rh = fontSize + paddingY * 2;
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(rx, ry, rw, rh, 12);
    } else {
        ctx.rect(rx, ry, rw, rh);
    }
    ctx.fill();

    ctx.fillStyle = fontColor;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.scale.set(16, 4, 1);
    return sprite;
}

function createLabels() {
    var northLabel = createTextLabel(
        '北 校 区',
        new THREE.Vector3(0, 18, 22),
        52, '#FFFFFF'
    );
    scene.add(northLabel);

    var southLabel = createTextLabel(
        '南 校 区',
        new THREE.Vector3(0, 18, -22),
        52, '#FFFFFF'
    );
    scene.add(southLabel);

    // 东南西北方向标签（黄色）
    var dirOffset = 60;
    scene.add(createTextLabel('北', new THREE.Vector3(0, 12, dirOffset), 64, '#FFD700'));
    scene.add(createTextLabel('南', new THREE.Vector3(0, 12, -dirOffset), 64, '#FFD700'));
    scene.add(createTextLabel('东', new THREE.Vector3(dirOffset, 12, 0), 64, '#FFD700'));
    scene.add(createTextLabel('西', new THREE.Vector3(-dirOffset, 12, 0), 64, '#FFD700'));

    // 地面坐标标注（关键点）
    createGroundCoordLabel(0, 0, '(0, 0)');
    createGroundCoordLabel(50, 0, '(50, 0)');
    createGroundCoordLabel(-50, 0, '(-50, 0)');
    createGroundCoordLabel(0, 45, '(0, 45)');
    createGroundCoordLabel(0, -45, '(0, -45)');
    createGroundCoordLabel(50, 45, '(50, 45)');
    createGroundCoordLabel(-50, -45, '(-50, -45)');
}

/**
 * 创建地面坐标标注（小号文字，贴地放置）
 * @param {number} x - 场景 X 坐标
 * @param {number} z - 场景 Z 坐标
 * @param {string} text - 坐标文字
 */
function createGroundCoordLabel(x, z, text) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 28px Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    var tw = ctx.measureText(text).width;
    var px = 12;
    var py = 8;
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect((canvas.width - tw) / 2 - px, (canvas.height - 28) / 2 - py, tw + px * 2, 28 + py * 2, 6);
    } else {
        ctx.rect((canvas.width - tw) / 2 - px, (canvas.height - 28) / 2 - py, tw + px * 2, 28 + py * 2);
    }
    ctx.fill();

    ctx.fillStyle = '#E0E0E0';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: true
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x, 0.15, z);
    sprite.scale.set(8, 2, 1);
    scene.add(sprite);
}

// ========== 事件绑定 ==========
function bindEvents() {
    window.addEventListener('resize', onWindowResize, false);

    // 绑定视角切换按钮事件
    document.getElementById('btn-perspective').addEventListener('click', function() {
        toggleView('perspective');
    });
    document.getElementById('btn-birdview').addEventListener('click', function() {
        toggleView('bird');
    });
}

// ========== 窗口大小自适应 ==========
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ========== 渲染循环 ==========
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// ========== 扩展预留：GLB 模型加载 ==========
function loadGLBModel(url, position) {
    console.log('GLB 模型加载功能待实现:', url, position);
}

// ========== 视角切换功能实现 ==========
/**
 * 切换场景视角
 * @param {string} mode - 'perspective' 或 'bird'
 */
function toggleView(mode) {
    if (currentView === mode) return;
    currentView = mode;

    // 更新按钮状态
    document.getElementById('btn-perspective').classList.toggle('active', mode === 'perspective');
    document.getElementById('btn-birdview').classList.toggle('active', mode === 'bird');

    if (mode === 'perspective') {
        // 切换到透视视角
        camera = perspectiveCamera;
        controls.object = camera; // 重新绑定控制器相机
        
        // 恢复控制器限制
        controls.enableRotate = true;
        controls.maxPolarAngle = Math.PI / 2.1;
        controls.minPolarAngle = 0;
        
        // 设置一个较好的初始观察角度
        camera.position.set(0, 45, -85);
        controls.target.set(0, 0, -30);
    } else {
        // 切换到鸟瞰视角
        camera = birdCamera;
        controls.object = camera; // 重新绑定控制器相机
        
        // 锁定旋转：禁止水平旋转和垂直旋转
        controls.enableRotate = false;
        
        // 强制俯视：设置相机位置和目标
        camera.position.set(0, 30, -30);
        controls.target.set(0, 0, -30);
    }
    
    controls.update();
    console.log('视角已切换至:', mode === 'perspective' ? '透视视角' : '鸟瞰视角');
}

// ========== 扩展预留：图层显隐控制 ==========
function toggleLayer(groupName, visible) {
    var groupMap = {
        buildings: buildingsGroup,
        trees: treesGroup,
        roads: roadsGroup
    };
    if (groupMap[groupName]) {
        groupMap[groupName].visible = visible;
    }
}

// ========== 启动应用 ==========
init();