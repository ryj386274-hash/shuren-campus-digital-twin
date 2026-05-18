// =============================================
// 浙江树人学院 - 校园数字孪生
// 核心场景变量
// =============================================
var scene, camera, renderer, controls;
var perspectiveCamera, birdCamera;
var buildingsGroup, treesGroup, roadsGroup, labelsGroup, aiModelsGroup;
var currentView = 'perspective';
var labelsVisible = true;

// Three.js 射线检测（用于鼠标交互：悬停、点击选中）
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var hoveredObject = null;
var isAnimating = false;
var HIGHLIGHT_COLOR = 0xFFFF00;

// =============================================
// 人物对话气泡系统
// =============================================
var speechBubble = null;
var currentHoveredCharacter = null;

// 人物对话内容配置
var CHARACTER_DIALOGS = {
    runner: '跑步使我快乐！',
    girl: '我正在逛学校...',
    boy: '学校附近哪有好吃的？'
};

// =============================================
// 键盘视角控制（OrbitControls 备选）
// =============================================
var moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false
};
var moveSpeed = 0.5;
var rotateSpeed = 0.03;

// 模型缩放比例
var SCALE = 0.3;

// =============================================
// 车辆模型与运动控制
// =============================================
var carModel = null;
var busModel = null;
var carDirection = 1;    // 1=向东, -1=向西
var busDirection = -1;
var carSpeed = 3;
var busSpeed = 2;

// 道路边界（车辆掉头位置）
var roadStartX = -55;
var roadEndX = 55;
var carLaneZ = 2;        // 车辆车道Z坐标
var busLaneZ = -2;       // 公交车道Z坐标

// 车辆转向状态
var carTurning = false;
var busTurning = false;
var carTargetRotY = 0;
var busTargetRotY = 0;

// 车辆基础朝向角度
var carBaseRotY = Math.PI / 2 + Math.PI / 4+Math.PI/4;
var busBaseRotY = -Math.PI / 2;

// =============================================
// 行人模型（女生、男生）
// =============================================
var girlModel = null;
var boyModel = null;
var pedestrianObstacles = [];
var buildingBounds = [];
var PEDESTRIAN_SPEED = 1.5;
var OBSTACLE_RADIUS = 3;
var RAY_COUNT = 8;

// =============================================
// 人物键盘控制（玩家可控制女生/男生移动）
// =============================================
var selectedCharacter = null; // 'girl', 'boy', 或 null
var girlMoveState = { forward: false, backward: false, left: false, right: false };
var boyMoveState = { forward: false, backward: false, left: false, right: false };
var CHARACTER_MOVE_SPEED = 3;  // 人物移动速度
var CHARACTER_ROTATE_SPEED = 3; // 人物旋转速度

// 校区边界（限制人物移动范围）
var CAMPUS_BOUNDS = {
    north: { minX: -52, maxX: 2, minZ: 14, maxZ: 32 },
    south: { minX: -18, maxX: 48, minZ: -65, maxZ: 2 }
};

// =============================================
// 操场跑步者（自动绕跑道运行）
// =============================================
var trackRunner = null;
var trackRunnerTimer = 0;
var TRACK_RUNNER_SPEED = 1;
var TRACK_CENTER_X = -160 * 0.3;
var TRACK_CENTER_Z = 120 * 0.3;
var TRACK_WIDTH = 15 * 0.3;
var TRACK_DEPTH = 25 * 0.3;
var TRACK_MARGIN = 0.3;  // 跑步者在跑道外围边缘跑

// =============================================
// 道路网络（行人寻路用）
// =============================================
var roadNodes = [];           // 道路节点列表
var roadEdges = [];           // 道路边列表
var nodeConnections = {};     // 节点连接关系
var northCampusNodes = [];    // 北校区节点ID列表
var southCampusNodes = [];    // 南校区节点ID列表

function buildRoadNetwork() {
    roadNodes = [
        { id: 'n0', x: -62, z: 22, campus: 'north' },
        { id: 'n1', x: -62, z: 36, campus: 'north' },
        { id: 'n2', x: -68, z: 36, campus: 'north' },
        { id: 'n3', x: -68, z: 24, campus: 'north' },
        { id: 'n4', x: -68, z: 16, campus: 'north' },
        { id: 'n5', x: -10, z: 22, campus: 'north' },
        { id: 'n6', x: -10, z: 36, campus: 'north' },
        { id: 'n7', x: -10, z: 55, campus: 'north' },
        { id: 'n8', x: -10, z: 75, campus: 'north' },
        { id: 'n9', x: -30, z: 36, campus: 'north' },
        { id: 'n10', x: -50, z: 36, campus: 'north' },
        { id: 'n11', x: -50, z: 22, campus: 'north' },
        { id: 'n12', x: -30, z: 22, campus: 'north' },
        { id: 'n13', x: -68, z: 55, campus: 'north' },
        { id: 'n14', x: -68, z: 75, campus: 'north' },
        { id: 'n15', x: -124, z: 22, campus: 'north' },
        { id: 'n16', x: -124, z: 40, campus: 'north' },
        { id: 'n17', x: -124, z: 55, campus: 'north' },
        { id: 'n18', x: -100, z: 22, campus: 'north' },
        { id: 'n19', x: -100, z: 40, campus: 'north' },
        { id: 'n20', x: -82, z: 22, campus: 'north' },
        { id: 'n21', x: -82, z: 40, campus: 'north' },
        { id: 'n22', x: -97, z: 22, campus: 'north' },
        { id: 'n23', x: -97, z: 40, campus: 'north' },
        { id: 'n24', x: -112, z: 22, campus: 'north' },
        { id: 'n25', x: -112, z: 40, campus: 'north' },
        { id: 'n26', x: -160, z: 55, campus: 'north' },
        { id: 'n27', x: -160, z: 75, campus: 'north' },
        { id: 'n28', x: -160, z: 100, campus: 'north' },
        { id: 'n29', x: -140, z: 55, campus: 'north' },
        { id: 'n30', x: -170, z: 22, campus: 'north' },
        { id: 'n31', x: -170, z: 40, campus: 'north' },
        { id: 'n32', x: 0, z: 22, campus: 'north' },
        { id: 'n33', x: 0, z: 40, campus: 'north' },
        { id: 'n34', x: -10, z: 100, campus: 'north' },
        { id: 'n35', x: -30, z: 100, campus: 'north' },

        { id: 's0', x: 0, z: -25, campus: 'south' },
        { id: 's1', x: 0, z: -38, campus: 'south' },
        { id: 's2', x: 0, z: -55, campus: 'south' },
        { id: 's3', x: 8, z: -82, campus: 'south' },
        { id: 's4', x: 0, z: -98, campus: 'south' },
        { id: 's5', x: 0, z: -125, campus: 'south' },
        { id: 's6', x: 0, z: -168, campus: 'south' },
        { id: 's7', x: 0, z: -175, campus: 'south' },
        { id: 's8', x: 0, z: -190, campus: 'south' },
        { id: 's9', x: -25, z: -38, campus: 'south' },
        { id: 's10', x: -40, z: -38, campus: 'south' },
        { id: 's11', x: -55, z: -38, campus: 'south' },
        { id: 's12', x: -55, z: -55, campus: 'south' },
        { id: 's13', x: -80, z: -38, campus: 'south' },
        { id: 's14', x: -80, z: -48, campus: 'south' },
        { id: 's15', x: 25, z: -38, campus: 'south' },
        { id: 's16', x: 40, z: -38, campus: 'south' },
        { id: 's17', x: 55, z: -38, campus: 'south' },
        { id: 's18', x: 72, z: -38, campus: 'south' },
        { id: 's19', x: 72, z: -48, campus: 'south' },
        { id: 's20', x: -30, z: -95, campus: 'south' },
        { id: 's21', x: -30, z: -115, campus: 'south' },
        { id: 's22', x: -40, z: -115, campus: 'south' },
        { id: 's23', x: -40, z: -142, campus: 'south' },
        { id: 's24', x: 30, z: -95, campus: 'south' },
        { id: 's25', x: 30, z: -115, campus: 'south' },
        { id: 's26', x: 40, z: -115, campus: 'south' },
        { id: 's27', x: 40, z: -142, campus: 'south' },
        { id: 's28', x: -40, z: -95, campus: 'south' },
        { id: 's29', x: 40, z: -95, campus: 'south' },
        { id: 's30', x: 150, z: -38, campus: 'south' },
        { id: 's31', x: 150, z: -55, campus: 'south' },
        { id: 's32', x: 170, z: -38, campus: 'south' },
        { id: 's34', x: 162, z: -150, campus: 'south' },
        { id: 's35', x: 162, z: -175, campus: 'south' },
        { id: 's36', x: 162, z: -210, campus: 'south' },
        { id: 's37', x: -60, z: -25, campus: 'south' },
        { id: 's38', x: 55, z: -25, campus: 'south' },
        { id: 's39', x: -40, z: -168, campus: 'south' },
        { id: 's40', x: 40, z: -168, campus: 'south' },
        { id: 's41', x: 0, z: -175, campus: 'south' }
    ];

    roadEdges = [
        ['n0', 'n1'], ['n1', 'n2'], ['n2', 'n3'], ['n3', 'n4'], ['n4', 'n0'],
        ['n0', 'n5'], ['n5', 'n6'], ['n6', 'n1'],
        ['n5', 'n12'], ['n12', 'n11'], ['n11', 'n10'], ['n10', 'n9'], ['n9', 'n6'],
        ['n9', 'n12'],
        ['n6', 'n7'], ['n7', 'n8'],
        ['n2', 'n13'], ['n13', 'n14'], ['n14', 'n8'],
        ['n4', 'n15'], ['n15', 'n16'], ['n16', 'n17'],
        ['n15', 'n18'], ['n18', 'n19'], ['n19', 'n16'],
        ['n18', 'n20'], ['n20', 'n21'], ['n21', 'n19'],
        ['n20', 'n22'], ['n22', 'n23'], ['n23', 'n21'],
        ['n22', 'n24'], ['n24', 'n25'], ['n25', 'n23'],
        ['n24', 'n15'],
        ['n13', 'n29'], ['n29', 'n26'], ['n26', 'n27'], ['n27', 'n28'],
        ['n30', 'n31'], ['n31', 'n29'],
        ['n5', 'n32'], ['n32', 'n33'], ['n33', 'n10'],
        ['n8', 'n34'], ['n34', 'n35'], ['n35', 'n14'],

        ['s0', 's1'], ['s1', 's2'], ['s2', 's3'],
        ['s3', 's4'], ['s4', 's5'], ['s5', 's6'], ['s6', 's7'], ['s7', 's8'],
        ['s1', 's9'], ['s9', 's10'], ['s10', 's11'], ['s11', 's12'],
        ['s11', 's13'], ['s13', 's14'],
        ['s1', 's15'], ['s15', 's16'], ['s16', 's17'], ['s17', 's18'], ['s18', 's19'],
        ['s4', 's20'], ['s20', 's21'], ['s21', 's22'], ['s22', 's23'],
        ['s4', 's24'], ['s24', 's25'], ['s25', 's26'], ['s26', 's27'],
        ['s20', 's28'], ['s28', 's22'],
        ['s24', 's29'], ['s29', 's26'],
        ['s23', 's6'], ['s27', 's6'],
        ['s6', 's39'], ['s6', 's40'], ['s39', 's40'],
        ['s0', 's37'], ['s0', 's38'],
        ['s37', 's13'],
        ['s38', 's17'],
        ['s38', 's30'], ['s30', 's31'], ['s30', 's32'],
        ['s31', 's34'], ['s34', 's35'], ['s35', 's36'],
        ['s41', 's39'], ['s41', 's40'], ['s6', 's41']
    ];

    nodeConnections = {};
    northCampusNodes = [];
    southCampusNodes = [];

    for (var i = 0; i < roadNodes.length; i++) {
        nodeConnections[roadNodes[i].id] = [];
        if (roadNodes[i].campus === 'north') {
            northCampusNodes.push(roadNodes[i].id);
        } else {
            southCampusNodes.push(roadNodes[i].id);
        }
    }
    for (var j = 0; j < roadEdges.length; j++) {
        var a = roadEdges[j][0];
        var b = roadEdges[j][1];
        nodeConnections[a].push(b);
        nodeConnections[b].push(a);
    }
}

var gltfLoader = null;
var dracoLoader = null;

// =============================================
// 天气系统
// =============================================
var currentWeather = 'day';   // 当前天气类型
var weatherTransition = { progress: 1, from: null, to: null }; // 天气过渡动画状态

// 雨滴粒子系统
var rainParticles = null;
var rainGeo = null;
var rainCount = 1200;

// 雪花粒子系统
var snowParticles = null;
var snowGeo = null;
var snowCount = 2000;

// 光照引用
var ambientLight = null;
var dirLight = null;
var fillLight = null;

// =============================================
// 天气预设配置（天空颜色、光照强度、粒子开关）
// =============================================
var WEATHER_PRESETS = {
    day: {
        sky: new THREE.Color(0x87CEEB),
        fog: new THREE.Color(0x87CEEB),
        fogNear: 80, fogFar: 250,
        ambient: 0.5, ambientColor: 0xffffff,
        dir: 0.8, dirColor: 0xffffff,
        fill: 0.3, fillColor: 0xffffff,
        ground: 0x4CAF50,
        rain: false, snow: false
    },
    night: {
        sky: new THREE.Color(0x0a0a2e),
        fog: new THREE.Color(0x0a0a2e),
        fogNear: 30, fogFar: 120,
        ambient: 0.15, ambientColor: 0x334466,
        dir: 0.2, dirColor: 0x8899bb,
        fill: 0.05, fillColor: 0x223344,
        ground: 0x1a3a1a,
        rain: false, snow: false
    },
    cloudy: {
        sky: new THREE.Color(0x8899aa),
        fog: new THREE.Color(0x8899aa),
        fogNear: 50, fogFar: 180,
        ambient: 0.4, ambientColor: 0xaabbcc,
        dir: 0.4, dirColor: 0xccccdd,
        fill: 0.2, fillColor: 0x99aabb,
        ground: 0x3a7a3a,
        rain: false, snow: false
    },
    rain: {
        sky: new THREE.Color(0x7799aa),
        fog: new THREE.Color(0x7799aa),
        fogNear: 40, fogFar: 150,
        ambient: 0.45, ambientColor: 0xaabbcc,
        dir: 0.5, dirColor: 0xccccdd,
        fill: 0.25, fillColor: 0x99aabb,
        ground: 0x3a6a3a,
        rain: true, snow: false
    },
    snow: {
        sky: new THREE.Color(0xc8d8e8),
        fog: new THREE.Color(0xc8d8e8),
        fogNear: 40, fogFar: 160,
        ambient: 0.55, ambientColor: 0xccddee,
        dir: 0.5, dirColor: 0xddeeff,
        fill: 0.3, fillColor: 0xbbccdd,
        ground: 0xddeedd,
        rain: false, snow: true
    }
};
// AI模型生成相关
var aiGeneratedModelUrl = null;
var aiGeneratedPreviewUrl = null;
var aiPollingTimer = null;

// =============================================
// 音频系统（背景音乐、雨声、夜声）
// =============================================
var audioBGM = null;
var audioRain = null;
var audioNight = null;
var bgmEnabled = false;
var rainAudioEnabled = false;
var nightAudioEnabled = false;
var bgmVolume = 0.5;
var rainVolume = 0.5;
var nightVolume = 0.5;

// =============================================
// AI模型拖拽交互
// =============================================
var selectedAIModel = null;
var isDraggingModel = false;
var dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
var dragOffset = new THREE.Vector3();
var dragIntersection = new THREE.Vector3();
var selectionBoxHelper = null;
var MODEL_SCALE_STEP = 0.1;
var selectionBoxDirty = false;
var MODEL_ROTATE_STEP = Math.PI / 12;

// =============================================
// 本地存储配置
// =============================================
var STORAGE_KEY = 'campus_digital_twin_models';
var modelIdCounter = 0;

window.onerror = function(msg, url, line, col, error) {
    console.error('全局错误:', msg, '行:', line);
    showErrorToast('错误: ' + msg + ' (行' + line + ')');
    return false;
};

window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的Promise错误:', event.reason);
    showErrorToast('异步错误: ' + (event.reason && event.reason.message || event.reason));
});

function showErrorToast(message) {
    var existing = document.getElementById('error-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'error-toast';
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);' +
        'background:rgba(244,67,54,0.95);color:#fff;padding:12px 24px;border-radius:8px;' +
        'font-size:14px;z-index:9999;max-width:80%;word-break:break-word;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function() {
        if (toast.parentNode) toast.remove();
    }, 8000);
}

// =============================================
// 建筑类型配置（几何尺寸、颜色）
// =============================================
var TYPE_CONFIG = {
    tennis:        { w: 12, h: 0.2, d: 8,  floors: 0, cols: 0, color: 0x4B90D9 },
    track:         { w: 15, h: 0.1, d: 25, floors: 0, cols: 0, color: 0xC04040 },
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

// =============================================
// 建筑数据（位置、名称、类型）
// =============================================
var BUILDING_DATA = [
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
    { id: "N012", name: "南校区北门口",   x: -60,  z: -20,   type: "gate" },
    { id: "S001", name: "清乐园",               x: 170, z: 40,    type: "canteen" },
    { id: "S002", name: "树人之家",             x: 150,  z: -55,   type: "academic" },
    { id: "S003", name: "第三实验大楼",         x: 72,  z: -30,  type: "laboratory" },
    { id: "S016", name: "第一实验大楼",         x: 72,  z: -55,  type: "laboratory" },
    { id: "S004", name: "学术报告厅",           x: 25,  z: -30,  type: "academic" },
    { id: "S005", name: "第二实验大楼",         x: -25,    z: -30,  type: "laboratory" },
    { id: "S006", name: "查济民大厦（行政中心）", x: -80, z: -55,  type: "administration" },
    { id: "S007", name: "图书馆",               x: 0,    z: -82,  type: "library" },
    { id: "S008", name: "教学楼B2",               x: 30,  z: -112,  type: "teaching" },
    { id: "S009", name: "教学楼B1",               x: -30,    z: -112,  type: "teaching" },
    { id: "S010", name: "教学主楼A4",           x: 40,  z: -142,  type: "teaching" },
    { id: "S011", name: "教学主楼A3",           x: -40,   z: -142,  type: "teaching" },
    { id: "S012", name: "教学主楼A2",           x: 40,  z: -168, type: "teaching" },
    { id: "S013", name: "教学主楼A1",           x: -40,   z: -168, type: "teaching" },
    { id: "S014", name: "南校区南门",           x: 0,    z: -185, type: "gate" },
    { id: "S015A", name: "致和园1号楼",         x: 162, z: -188, type: "dormitory" },
    { id: "S015B", name: "致和园2号楼",         x: 162, z: -222, type: "dormitory" }
];

// =============================================
// 建筑详细介绍（描述、面积、楼层、建成年份）
// =============================================
var BUILDING_INTRO = {
    "N001": { desc: "致勤园1幢是北校区学生宿舍楼之一，提供舒适的住宿环境，配备独立卫浴、空调和热水器，可容纳数百名学生入住。", area: "约3200㎡", floors: "6层", built: "2015年" },
    "N002": { desc: "致勤园2幢位于北校区宿舍区，紧邻1幢，生活便利，周边设有超市和洗衣房等配套设施。", area: "约3200㎡", floors: "6层", built: "2015年" },
    "N003": { desc: "致勤园3幢是北校区最新的宿舍楼，内部装修现代，设有公共活动室和自习空间。", area: "约3200㎡", floors: "6层", built: "2018年" },
    "N004": { desc: "北校区北门是校园北侧的主要出入口，连接城市主干道，设有门岗和访客登记处。", area: "-", floors: "-", built: "-" },
    "N005": { desc: "网球场为标准硬地场地，共2片，配有夜间照明设施，供师生课余锻炼使用。", area: "约1200㎡", floors: "-", built: "2012年" },
    "N006": { desc: "创业产业园是学校产教融合的重要平台，入驻多家科技企业，为学生提供实习实训和创新创业空间。", area: "约5000㎡", floors: "4层", built: "2020年" },
    "N007": { desc: "体育馆内设篮球场、羽毛球场、乒乓球室和健身房，可承办校内体育赛事和大型活动。", area: "约8000㎡", floors: "2层", built: "2010年" },
    "N008": { desc: "田径场为标准400米跑道，中间为天然草坪足球场，是校运会和日常体育教学的主要场地。", area: "约15000㎡", floors: "-", built: "2008年" },
    "N009": { desc: "26号楼是北校区教学楼，主要承担基础课程教学任务，配备多媒体教室和语音实验室。", area: "约4500㎡", floors: "5层", built: "2005年" },
    "N010": { desc: "美术馆定期举办师生艺术作品展和对外交流展览，是校园文化艺术的重要展示窗口。", area: "约2000㎡", floors: "3层", built: "2016年" },
    "N011": { desc: "北校区南门口连接南北校区的通道，设有门禁系统，方便师生在两个校区间通行。", area: "-", floors: "-", built: "-" },
    "N012": { desc: "南校区北门口是南校区北侧入口，与北校区南门遥相呼应，是两校区间的便捷通道。", area: "-", floors: "-", built: "-" },
    "S001": { desc: "清乐园是南校区食堂，提供多种风味的餐饮服务，包括自选餐、特色窗口和清真餐厅，可同时容纳1500人就餐。", area: "约6000㎡", floors: "3层", built: "2013年" },
    "S002": { desc: "树人之家是学校的学术交流中心，设有报告厅、会议室和接待室，承办各类学术会议和校际交流活动。", area: "约3500㎡", floors: "3层", built: "2014年" },
    "S003": { desc: "第三实验大楼主要承担理工科实验教学任务，配备先进的实验仪器和科研设备，设有多个省级重点实验室。", area: "约7000㎡", floors: "6层", built: "2017年" },
    "S016": { desc: "第一实验大楼是学校最早的实验楼之一，经过翻新改造后，现为化学与材料科学学院的实验基地。", area: "约5500㎡", floors: "5层", built: "2003年" },
    "S004": { desc: "学术报告厅可容纳500人，配备同声传译系统和高清投影设备，是举办高水平学术讲座的重要场所。", area: "约2000㎡", floors: "2层", built: "2016年" },
    "S005": { desc: "第二实验大楼为信息工程学院实验基地，设有计算机实验室、网络工程实验室和人工智能实验室。", area: "约6000㎡", floors: "5层", built: "2011年" },
    "S006": { desc: "查济民大厦是学校的行政中心，以著名爱国实业家查济民先生命名，内设校长办公室、教务处等主要行政部门。", area: "约8000㎡", floors: "8层", built: "2009年" },
    "S007": { desc: "图书馆藏书80余万册，设有电子阅览室、自习区和研讨室，是师生学习和研究的重要场所。馆内配备智能检索系统和自助借还设备。", area: "约12000㎡", floors: "5层", built: "2007年" },
    "S008": { desc: "教学楼B2为教学辅助用房，主要承担小班教学和研讨课程，教室配备交互式电子白板。", area: "约2500㎡", floors: "3层", built: "2015年" },
    "S009": { desc: "教学楼B1与教学楼B2相连，主要用于外语教学和国际化课程，设有语言实验室和同传教室。", area: "约2500㎡", floors: "3层", built: "2015年" },
    "S010": { desc: "教学主楼A4是南校区主要教学楼之一，承担经管类和人文类课程教学，教室宽敞明亮，设施齐全。", area: "约5000㎡", floors: "5层", built: "2012年" },
    "S011": { desc: "教学主楼A3与A4对称布局，主要承担法学和外语类课程教学，设有模拟法庭和同声传译教室。", area: "约5000㎡", floors: "5层", built: "2012年" },
    "S012": { desc: "教学主楼A2位于教学楼群南侧，主要承担艺术设计和传媒类课程，设有专业画室和摄影棚。", area: "约5000㎡", floors: "5层", built: "2012年" },
    "S013": { desc: "教学主楼A1是南校区最早建成的教学楼，承担基础教学任务，设有大型阶梯教室。", area: "约5000㎡", floors: "5层", built: "2006年" },
    "S014": { desc: "南校区南门是校园南侧主入口，气势恢宏，是学校的标志性门户，门前设有校名石碑和绿化景观。", area: "-", floors: "-", built: "-" },
    "S015A": { desc: "致和园1号楼是南校区学生宿舍，环境优美，紧邻食堂和运动场，生活便利。", area: "约3500㎡", floors: "6层", built: "2019年" },
    "S015B": { desc: "致和园2号楼与1号楼相邻，是南校区最新的宿舍楼群，配备电梯和智能门禁系统。", area: "约3500㎡", floors: "6层", built: "2019年" }
};

// =============================================
// 建筑类型中文名称映射
// =============================================
var TYPE_NAME_MAP = {
    tennis: '运动场地', track: '运动场地', dormitory: '学生宿舍',
    teaching: '教学楼', laboratory: '实验楼', administration: '行政办公',
    library: '图书馆', sports: '体育场馆', gate: '校门',
    canteen: '食堂', academic: '学术交流', industry: '产业园', art: '美术馆'
};

// =============================================
// 初始化入口
// =============================================
function init() {
    initScene();
    initCamera();
    initRenderer();
    initControls();
    initLights();
    initGLTFLoader();
    initAudioSystem();
    initRainSystem();
    createGround();
    createRoads();
    createBuildings();
    createTrees();
    createLabels();
    initVehicles();
    initTrackRunner();
    bindEvents();
    bindIntroAndLayerEvents();
    loadPersistedModels();
    loadLocalModelFolder();
    initSpeechBubble();
    animate();
}

// =============================================
// 对话气泡初始化
// =============================================
function initSpeechBubble() {
    speechBubble = document.getElementById('speech-bubble');
    if (!speechBubble) {
        speechBubble = document.createElement('div');
        speechBubble.id = 'speech-bubble';
        speechBubble.className = 'speech-bubble';
        document.body.appendChild(speechBubble);
    }
}

// =============================================
// 显示对话气泡
// =============================================
function showSpeechBubble(characterType, screenX, screenY) {
    if (!speechBubble) return;

    var text = CHARACTER_DIALOGS[characterType];
    if (!text) return;

    speechBubble.className = 'speech-bubble ' + characterType;
    speechBubble.textContent = text;

    // 计算气泡位置（在人物上方）
    var bubbleX = screenX - 80;
    var bubbleY = screenY - 90;

    // 确保气泡在屏幕内
    var bubbleWidth = 180;
    bubbleX = Math.max(10, Math.min(window.innerWidth - bubbleWidth - 10, bubbleX));
    bubbleY = Math.max(10, bubbleY);

    speechBubble.style.left = bubbleX + 'px';
    speechBubble.style.top = bubbleY + 'px';
    speechBubble.classList.add('visible');

    currentHoveredCharacter = characterType;
}

// =============================================
// 隐藏对话气泡
// =============================================
function hideSpeechBubble() {
    if (!speechBubble) return;
    speechBubble.classList.remove('visible');
    currentHoveredCharacter = null;
}

// =============================================
// 检测是否悬停在人物模型上
// =============================================
function checkPedestrianHover(event) {
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    // 获取所有需要检测的对象（跑步者、女生、男生）
    var targets = [];

    if (trackRunner) {
        trackRunner.traverse(function(child) {
            if (child.isMesh) {
                child.userData.characterType = 'runner';
                child.userData.characterModel = trackRunner;
                targets.push(child);
            }
        });
    }

    if (girlModel) {
        girlModel.traverse(function(child) {
            if (child.isMesh) {
                child.userData.characterType = 'girl';
                child.userData.characterModel = girlModel;
                targets.push(child);
            }
        });
    }

    if (boyModel) {
        boyModel.traverse(function(child) {
            if (child.isMesh) {
                child.userData.characterType = 'boy';
                child.userData.characterModel = boyModel;
                targets.push(child);
            }
        });
    }

    var intersects = raycaster.intersectObjects(targets, true);

    if (intersects.length > 0) {
        var hit = intersects[0];
        var characterType = null;

        // 向上查找 characterType
        var obj = hit.object;
        while (obj) {
            if (obj.userData.characterType) {
                characterType = obj.userData.characterType;
                break;
            }
            obj = obj.parent;
        }

        if (characterType && characterType !== currentHoveredCharacter) {
            showSpeechBubble(characterType, event.clientX, event.clientY);
            document.body.style.cursor = 'pointer';
            return true;
        } else if (characterType && characterType === currentHoveredCharacter) {
            // 更新气泡位置
            showSpeechBubble(characterType, event.clientX, event.clientY);
            return true;
        }
    }

    return false;
}

// =============================================
// 点击选中人物（女生/男生）
// =============================================
function onCharacterClick(event) {
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    // 检测点击的人物
    var targets = [];

    if (girlModel) {
        girlModel.traverse(function(child) {
            if (child.isMesh) {
                child.userData.characterType = 'girl';
                child.userData.characterModel = girlModel;
                targets.push(child);
            }
        });
    }

    if (boyModel) {
        boyModel.traverse(function(child) {
            if (child.isMesh) {
                child.userData.characterType = 'boy';
                child.userData.characterModel = boyModel;
                targets.push(child);
            }
        });
    }

    var intersects = raycaster.intersectObjects(targets, true);

    if (intersects.length > 0) {
        var hit = intersects[0];
        var characterType = null;

        // 向上查找 characterType
        var obj = hit.object;
        while (obj) {
            if (obj.userData.characterType) {
                characterType = obj.userData.characterType;
                break;
            }
            obj = obj.parent;
        }

        if (characterType === 'girl' || characterType === 'boy') {
            selectCharacter(characterType);
            return true;
        }
    }

    // 点击空白区域，取消选中
    if (selectedCharacter !== null) {
        deselectCharacter();
    }

    return false;
}

// =============================================
// 场景初始化
// =============================================
function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 80, 250);

    // 创建场景分组（便于批量控制显示/隐藏）
    buildingsGroup = new THREE.Group();
    treesGroup = new THREE.Group();
    roadsGroup = new THREE.Group();
    labelsGroup = new THREE.Group();
    aiModelsGroup = new THREE.Group();
    scene.add(buildingsGroup);
    scene.add(treesGroup);
    scene.add(roadsGroup);
    scene.add(labelsGroup);
    scene.add(aiModelsGroup);
}

// =============================================
// 相机初始化（透视相机 + 鸟瞰相机）
// =============================================
function initCamera() {
    // 透视相机（模拟人在校园中行走）
    perspectiveCamera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    perspectiveCamera.position.set(0, 2.5, -60);
    perspectiveCamera.lookAt(0, 2.5, -30);

    // 鸟瞰相机（俯视整个校园）
    birdCamera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    birdCamera.position.set(0, 80, -100);
    birdCamera.lookAt(0, 0, -30);

    camera = perspectiveCamera;
}

// =============================================
// 渲染器初始化（WebGL、抗锯齿、阴影）
// =============================================
function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
}

// =============================================
// 轨道控制器初始化（用于鸟瞰视角旋转/平移/缩放）
// =============================================
function initControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, -30);
    controls.minDistance = 5;
    controls.maxDistance = 200;
    controls.maxPolarAngle = Math.PI / 2.1;

    // 透视视角下禁用轨道控制
    if (currentView === 'perspective') {
        controls.enabled = false;
    }
}

// =============================================
// 光照初始化（环境光 + 主光源 + 补光）
// =============================================
function initLights() {
    // 环境光
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 主方向光源（产生阴影）
    dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 80, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.camera.left = -80;
    dirLight.shadow.camera.right = 80;
    dirLight.shadow.camera.top = 80;
    dirLight.shadow.camera.bottom = -80;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // 补光（减少阴影死区）
    fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);
}

// =============================================
// GLTF/GLB模型加载器初始化
// =============================================
function initGLTFLoader() {
    gltfLoader = new THREE.GLTFLoader();
    dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://unpkg.com/three@0.137.0/examples/js/libs/draco/');
    gltfLoader.setDRACOLoader(dracoLoader);
}

// =============================================
// 音频系统初始化
// =============================================
function initAudioSystem() {
    audioBGM = new Audio('audio/music.mp3');
    audioBGM.loop = true;
    audioBGM.volume = 0;

    audioRain = new Audio('audio/rain.mp3');
    audioRain.loop = true;
    audioRain.volume = 0;

    audioNight = new Audio('audio/night.mp3');
    audioNight.loop = true;
    audioNight.volume = 0;
}

function updateWeatherAudio(weatherType) {
    var bgmTarget = 0;
    var rainTarget = 0;
    var nightTarget = 0;

    switch (weatherType) {
        case 'day':
            bgmTarget = 0.3;
            break;
        case 'night':
            bgmTarget = 0.1;
            nightTarget = 0.5;
            break;
        case 'cloudy':
            bgmTarget = 0.25;
            break;
        case 'rain':
            bgmTarget = 0.15;
            rainTarget = 0.6;
            break;
        case 'snow':
            bgmTarget = 0.2;
            break;
    }

    if (bgmEnabled) {
        fadeAudio(audioBGM, bgmTarget * bgmVolume, 2000);
        playAudioIfStopped(audioBGM);
    }
    if (rainAudioEnabled && rainTarget > 0) {
        fadeAudio(audioRain, rainTarget * rainVolume, 2000);
        playAudioIfStopped(audioRain);
    } else {
        fadeAudio(audioRain, 0, 1000);
    }
    if (nightAudioEnabled && nightTarget > 0) {
        fadeAudio(audioNight, nightTarget * nightVolume, 2000);
        playAudioIfStopped(audioNight);
    } else {
        fadeAudio(audioNight, 0, 1000);
    }
}

function fadeAudio(audio, targetVolume, duration) {
    if (!audio) return;
    var startVolume = audio.volume;
    var volumeDiff = targetVolume - startVolume;
    if (Math.abs(volumeDiff) < 0.001) return;
    var startTime = Date.now();

    function step() {
        var elapsed = Date.now() - startTime;
        var progress = Math.min(elapsed / duration, 1);
        audio.volume = Math.max(0, Math.min(1, startVolume + volumeDiff * progress));

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            if (targetVolume < 0.001 && audio !== audioBGM) {
                audio.pause();
            }
        }
    }
    step();
}

function playAudioIfStopped(audio) {
    if (!audio) return;
    if (audio.paused) {
        audio.play().catch(function() {});
    }
}

function toggleBGM() {
    bgmEnabled = !bgmEnabled;
    var btn = document.getElementById('btn-bgm-toggle');
    if (bgmEnabled) {
        btn.textContent = '🔊';
        updateWeatherAudio(currentWeather);
    } else {
        btn.textContent = '🔇';
        fadeAudio(audioBGM, 0, 500);
        setTimeout(function() { if (audioBGM) audioBGM.pause(); }, 600);
    }
}

function toggleRainAudio() {
    rainAudioEnabled = !rainAudioEnabled;
    var btn = document.getElementById('btn-rain-toggle');
    if (rainAudioEnabled) {
        btn.textContent = '🔊';
        updateWeatherAudio(currentWeather);
    } else {
        btn.textContent = '🔇';
        fadeAudio(audioRain, 0, 500);
        setTimeout(function() { if (audioRain) audioRain.pause(); }, 600);
    }
}

function toggleNightAudio() {
    nightAudioEnabled = !nightAudioEnabled;
    var btn = document.getElementById('btn-night-toggle');
    if (nightAudioEnabled) {
        btn.textContent = '🔊';
        updateWeatherAudio(currentWeather);
    } else {
        btn.textContent = '🔇';
        fadeAudio(audioNight, 0, 500);
        setTimeout(function() { if (audioNight) audioNight.pause(); }, 600);
    }
}

function initVehicles() {
    if (!gltfLoader) return;

    gltfLoader.load('3Dmoxing/car.glb',
        function(gltf) {
            carModel = gltf.scene;
            var box = new THREE.Box3().setFromObject(carModel);
            var size = box.getSize(new THREE.Vector3());
            var maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
                var s = 2.5 / maxDim;
                carModel.scale.set(s, s, s);
            }
            carModel.position.set(roadStartX, 0.05, carLaneZ);
            carModel.rotation.y = carBaseRotY;
            carTargetRotY = carBaseRotY;
            carModel.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            carModel.userData.isVehicle = true;
            scene.add(carModel);
            console.log('汽车模型加载成功');
        },
        undefined,
        function() {
            carModel = createFallbackCar();
            scene.add(carModel);
            console.log('汽车模型使用替代几何体');
        }
    );

    gltfLoader.load('3Dmoxing/bus.glb',
        function(gltf) {
            busModel = gltf.scene;
            var box = new THREE.Box3().setFromObject(busModel);
            var size = box.getSize(new THREE.Vector3());
            var maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
                var s = 4 / maxDim;
                busModel.scale.set(s, s, s);
            }
            busModel.position.set(roadEndX, 0.05, busLaneZ);
            busModel.rotation.y = busBaseRotY;
            busTargetRotY = busBaseRotY;
            busModel.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            busModel.userData.isVehicle = true;
            scene.add(busModel);
            console.log('大巴模型加载成功');
        },
        undefined,
        function() {
            busModel = createFallbackBus();
            scene.add(busModel);
            console.log('大巴模型使用替代几何体');
        }
    );

    initPedestrians();
}

function createFallbackCar() {
    var group = new THREE.Group();
    var bodyGeo = new THREE.BoxGeometry(1.6, 0.6, 3.5);
    var bodyMat = new THREE.MeshStandardMaterial({ color: 0x2266cc, metalness: 0.6, roughness: 0.3 });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);

    var topGeo = new THREE.BoxGeometry(1.4, 0.5, 1.8);
    var topMat = new THREE.MeshStandardMaterial({ color: 0x88bbee, metalness: 0.3, roughness: 0.2 });
    var top = new THREE.Mesh(topGeo, topMat);
    top.position.set(0, 1.0, -0.3);
    top.castShadow = true;
    group.add(top);

    var wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 12);
    var wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    var positions = [[-0.85, 0.25, 1.0], [0.85, 0.25, 1.0], [-0.85, 0.25, -1.0], [0.85, 0.25, -1.0]];
    for (var i = 0; i < 4; i++) {
        var wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(positions[i][0], positions[i][1], positions[i][2]);
        group.add(wheel);
    }

    group.position.set(roadStartX, 0.05, carLaneZ);
    group.rotation.y = carBaseRotY;
    group.userData.isVehicle = true;
    return group;
}

function createFallbackBus() {
    var group = new THREE.Group();
    var bodyGeo = new THREE.BoxGeometry(2.0, 1.4, 7.0);
    var bodyMat = new THREE.MeshStandardMaterial({ color: 0xdd8800, metalness: 0.3, roughness: 0.5 });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);

    var winGeo = new THREE.BoxGeometry(1.8, 0.5, 6.5);
    var winMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, metalness: 0.5, roughness: 0.1, transparent: true, opacity: 0.7 });
    var win = new THREE.Mesh(winGeo, winMat);
    win.position.set(0, 1.7, 0);
    group.add(win);

    var wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12);
    var wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    var wps = [[-1.1, 0.3, 2.2], [1.1, 0.3, 2.2], [-1.1, 0.3, -2.2], [1.1, 0.3, -2.2]];
    for (var i = 0; i < 4; i++) {
        var wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wps[i][0], wps[i][1], wps[i][2]);
        group.add(wheel);
    }

    group.position.set(roadEndX, 0.05, busLaneZ);
    group.rotation.y = busBaseRotY;
    group.userData.isVehicle = true;
    return group;
}

// =============================================
// 车辆更新（沿道路行驶 + 到达端点掉头）
// =============================================
function updateVehicles(delta) {
    if (carModel) {
        if (carTurning) {
            // 平滑转向
            var rotDiff = carTargetRotY - carModel.rotation.y;
            carModel.rotation.y += rotDiff * Math.min(1, delta * 3);
            if (Math.abs(rotDiff) < 0.02) {
                carModel.rotation.y = carTargetRotY;
                carTurning = false;
            }
        } else {
            // 沿X轴移动
            carModel.position.x += carDirection * carSpeed * delta;
            if (carModel.position.x >= roadEndX) {
                carDirection = -1;
                carTargetRotY = carBaseRotY + Math.PI;
                carTurning = true;
            } else if (carModel.position.x <= roadStartX) {
                carDirection = 1;
                carTargetRotY = carBaseRotY;
                carTurning = true;
            }
        }
    }

    if (busModel) {
        if (busTurning) {
            var rotDiff2 = busTargetRotY - busModel.rotation.y;
            busModel.rotation.y += rotDiff2 * Math.min(1, delta * 3);
            if (Math.abs(rotDiff2) < 0.02) {
                busModel.rotation.y = busTargetRotY;
                busTurning = false;
            }
        } else {
            busModel.position.x += busDirection * busSpeed * delta;
            if (busModel.position.x <= roadStartX) {
                busDirection = 1;
                busTargetRotY = busBaseRotY + Math.PI;
                busTurning = true;
            } else if (busModel.position.x >= roadEndX) {
                busDirection = -1;
                busTargetRotY = busBaseRotY;
                busTurning = true;
            }
        }
    }
}

// =============================================
// 初始化行人（女生、男生）
// =============================================
function initPedestrians() {
    buildRoadNetwork();
    buildObstacleMap();

    var girlStartNode = 's8';
    var girlNextNode = 's7';
    var boyStartNode = 'n0';
    var boyNextNode = 'n5';

    var girlStart = getNodePosition(girlStartNode);
    var boyStart = getNodePosition(boyStartNode);

    if (!gltfLoader) {
        girlModel = createFallbackPerson(0xff6699, girlStart, 'girl');
        boyModel = createFallbackPerson(0x3366ff, boyStart, 'boy');
        initPedestrianData(girlModel, girlStartNode, girlNextNode, false, 'south');
        initPedestrianData(boyModel, boyStartNode, boyNextNode, false, 'north');
        girlModel.userData.ready = true;
        boyModel.userData.ready = true;
        girlModel.userData.controlled = false;
        boyModel.userData.controlled = false;
        scene.add(girlModel);
        scene.add(boyModel);
        return;
    }

    gltfLoader.load('3Dmoxing/girl.glb',
        function(gltf) {
            girlModel = gltf.scene;
            var box = new THREE.Box3().setFromObject(girlModel);
            var size = box.getSize(new THREE.Vector3());
            var maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
                var s = 1.8 / maxDim;
                girlModel.scale.set(s, s, s);
            }
            girlModel.position.copy(girlStart);
            girlModel.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            initPedestrianData(girlModel, girlStartNode, girlNextNode, true, 'south');
            girlModel.userData.ready = true;
            girlModel.userData.controlled = false;
            scene.add(girlModel);
            console.log('女生模型加载成功');
        },
        undefined,
        function() {
            girlModel = createFallbackPerson(0xff6699, girlStart, 'girl');
            initPedestrianData(girlModel, girlStartNode, girlNextNode, false, 'south');
            girlModel.userData.ready = true;
            girlModel.userData.controlled = false;
            scene.add(girlModel);
            console.log('女生模型使用替代几何体');
        }
    );

    gltfLoader.load('3Dmoxing/boy.glb',
        function(gltf) {
            boyModel = gltf.scene;
            var box = new THREE.Box3().setFromObject(boyModel);
            var size = box.getSize(new THREE.Vector3());
            var maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
                var s = 1.8 / maxDim;
                boyModel.scale.set(s, s, s);
            }
            boyModel.position.copy(boyStart);
            boyModel.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            initPedestrianData(boyModel, boyStartNode, boyNextNode, true, 'north');
            boyModel.userData.ready = true;
            boyModel.userData.controlled = false;
            scene.add(boyModel);
            console.log('男生模型加载成功');
        },
        undefined,
        function() {
            boyModel = createFallbackPerson(0x3366ff, boyStart, 'boy');
            initPedestrianData(boyModel, boyStartNode, boyNextNode, false, 'north');
            boyModel.userData.ready = true;
            boyModel.userData.controlled = false;
            scene.add(boyModel);
            console.log('男生模型使用替代几何体');
        }
    );
}

// =============================================
// 获取节点位置（根据节点ID返回三维坐标）
// =============================================
function getNodePosition(nodeId) {
    for (var i = 0; i < roadNodes.length; i++) {
        if (roadNodes[i].id === nodeId) {
            return new THREE.Vector3(roadNodes[i].x * SCALE, 0.05, roadNodes[i].z * SCALE);
        }
    }
    return new THREE.Vector3(0, 0.05, 0);
}

// =============================================
// 创建跑步者模型（几何体组合：头、身体、四肢、鞋子）
// =============================================
function createTrackRunner() {
    var group = new THREE.Group();

    // 头部（肤色球体）
    var headGeo = new THREE.SphereGeometry(0.25, 12, 8);
    var headMat = new THREE.MeshStandardMaterial({ color: 0xeebb99 });
    var head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.55;
    head.castShadow = true;
    group.add(head);

    // 身体（橙色圆柱）
    var bodyGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.7, 8);
    var bodyMat = new THREE.MeshStandardMaterial({ color: 0xFF6633 });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.05;
    body.castShadow = true;
    group.add(body);

    // 短裤（黑色圆柱）
    var shortGeo = new THREE.CylinderGeometry(0.22, 0.2, 0.3, 8);
    var shortMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    var short = new THREE.Mesh(shortGeo, shortMat);
    short.position.y = 0.65;
    group.add(short);

    // 腿（肤色圆柱）
    var legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 6);
    var legMat = new THREE.MeshStandardMaterial({ color: 0xeebb99 });
    var leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.1, 0.35, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    var rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.1, 0.35, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // 手臂（肤色圆柱）
    var armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);
    var armMat = new THREE.MeshStandardMaterial({ color: 0xeebb99 });
    var leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.3, 1.1, 0);
    leftArm.rotation.z = 0.3;
    group.add(leftArm);

    var rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.3, 1.1, 0);
    rightArm.rotation.z = -0.3;
    group.add(rightArm);

    // 运动鞋（白色盒子）
    var shoeGeo = new THREE.BoxGeometry(0.12, 0.08, 0.2);
    var shoeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    var leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.1, 0.04, 0.05);
    group.add(leftShoe);
    var rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.1, 0.04, 0.05);
    group.add(rightShoe);

    // 存储四肢引用用于跑步动画
    group.userData.leftLeg = leftLeg;
    group.userData.rightLeg = rightLeg;
    group.userData.leftArm = leftArm;
    group.userData.rightArm = rightArm;
    group.userData.runTimer = 0;

    return group;
}

// =============================================
// 初始化跑步者（在跑道外围边缘）
// =============================================
function initTrackRunner() {
    trackRunner = createTrackRunner();
    // 初始位置：跑道东侧外围边缘起点
    trackRunner.position.set(
        TRACK_CENTER_X + TRACK_WIDTH / 2 + TRACK_MARGIN,
        0.05,
        TRACK_CENTER_Z - TRACK_DEPTH / 2 - TRACK_MARGIN
    );
    trackRunner.rotation.y = 0; // 面向北方
    scene.add(trackRunner);
}

// =============================================
// 跑步者更新（矩形路径 + 跑步动画）
// =============================================
function updateTrackRunner(delta) {
    if (!trackRunner) return;

    trackRunner.userData.runTimer += delta * TRACK_RUNNER_SPEED * 2;
    var t = trackRunner.userData.runTimer;

    // 矩形跑道路径：顺时针绕操场跑一圈
    var halfW = TRACK_WIDTH / 2 + TRACK_MARGIN;
    var halfD = TRACK_DEPTH / 2 + TRACK_MARGIN;
    var totalLength = (halfW + halfD) * 2;

    // 计算当前在一圈中的位置
    var dist = (t * TRACK_RUNNER_SPEED) % totalLength;

    var x, z, angle;
    if (dist < halfW) {
        // 北侧：从西向东
        x = TRACK_CENTER_X - halfW + dist;
        z = TRACK_CENTER_Z - halfD;
        angle = 0;
    } else if (dist < halfW + halfD) {
        // 东侧：从北向南
        x = TRACK_CENTER_X + halfW;
        z = TRACK_CENTER_Z - halfD + (dist - halfW);
        angle = Math.PI / 2;
    } else if (dist < halfW * 2 + halfD) {
        // 南侧：从东向西
        x = TRACK_CENTER_X + halfW - (dist - halfW - halfD);
        z = TRACK_CENTER_Z + halfD;
        angle = Math.PI;
    } else {
        // 西侧：从南向北
        x = TRACK_CENTER_X - halfW;
        z = TRACK_CENTER_Z + halfD - (dist - halfW * 2 - halfD);
        angle = -Math.PI / 2;
    }

    trackRunner.position.x = x;
    trackRunner.position.z = z;
    trackRunner.rotation.y = angle;

    // 跑步动作：四肢摆动
    var swing = Math.sin(t * 8) * 0.8;
    if (trackRunner.userData.leftLeg) {
        trackRunner.userData.leftLeg.rotation.x = swing;
    }
    if (trackRunner.userData.rightLeg) {
        trackRunner.userData.rightLeg.rotation.x = -swing;
    }
    if (trackRunner.userData.leftArm) {
        trackRunner.userData.leftArm.rotation.x = -swing * 0.7;
    }
    if (trackRunner.userData.rightArm) {
        trackRunner.userData.rightArm.rotation.x = swing * 0.7;
    }
}

// =============================================
// 初始化行人数据（寻路信息、校区归属）
// =============================================
function initPedestrianData(model, fromNode, toNode, hasGLBAnimation, campus) {
    model.userData.isPedestrian = true;
    model.userData.fromNode = fromNode;
    model.userData.toNode = toNode;
    model.userData.walkTimer = 0;
    model.userData.hasGLBAnimation = hasGLBAnimation || false;
    model.userData.isGLB = hasGLBAnimation || false;
    model.userData.campus = campus || 'south';

    // 为 GLB 模型查找腿部对象用于行走动画
    if (hasGLBAnimation) {
        var foundLegs = false;
        model.traverse(function(child) {
            if (foundLegs) return;
            if (child.isBone || child.isSkinnedMesh) {
                var name = child.name.toLowerCase();
                if (name.indexOf('leg') >= 0 || name.indexOf('thigh') >= 0 || name.indexOf('shin') >= 0 || name.indexOf('foot') >= 0) {
                    if (!model.userData.leftLeg && (name.indexOf('left') >= 0 || name.indexOf('l_') >= 0 || name.indexOf('_l') >= 0)) {
                        model.userData.leftLeg = child;
                    } else if (!model.userData.rightLeg && (name.indexOf('right') >= 0 || name.indexOf('r_') >= 0 || name.indexOf('_r') >= 0)) {
                        model.userData.rightLeg = child;
                    }
                }
            }
        });

        if (!model.userData.leftLeg || !model.userData.rightLeg) {
            var legs = [];
            model.traverse(function(child) {
                if (child.isBone) {
                    var name = child.name.toLowerCase();
                    if (name.indexOf('leg') >= 0 || name.indexOf('thigh') >= 0 || name.indexOf('shin') >= 0) {
                        legs.push(child);
                    }
                }
            });
            if (legs.length >= 2) {
                model.userData.leftLeg = legs[0];
                model.userData.rightLeg = legs[1];
            } else if (legs.length === 1) {
                model.userData.leftLeg = legs[0];
                model.userData.rightLeg = legs[0];
            }
        }
    }

    var fromPos = getNodePosition(fromNode);
    var toPos = getNodePosition(toNode);
    var dir = new THREE.Vector3().subVectors(toPos, fromPos);
    if (dir.length() > 0) {
        model.rotation.y = Math.atan2(dir.x, dir.z);
    }
}

// =============================================
// 构建建筑物障碍物地图（用于行人避障）
// =============================================
function buildObstacleMap() {
    buildingBounds = [];
    for (var i = 0; i < BUILDING_DATA.length; i++) {
        var b = BUILDING_DATA[i];
        var cfg = TYPE_CONFIG[b.type] || TYPE_CONFIG.teaching;
        var cx = b.x * SCALE;
        var cz = b.z * SCALE;
        var hw = (cfg.w / 2) + 1.0;  // 加上缓冲距离
        var hd = (cfg.d / 2) + 1.0;
        buildingBounds.push({ minX: cx - hw, maxX: cx + hw, minZ: cz - hd, maxZ: cz + hd });
    }
}

// =============================================
// 检测点是否在建筑物内
// =============================================
function isInsideBuilding(x, z) {
    for (var i = 0; i < buildingBounds.length; i++) {
        var b = buildingBounds[i];
        if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) {
            return true;
        }
    }
    return false;
}

// =============================================
// 检测线段是否与建筑物相交
// =============================================
function segmentIntersectsBuilding(x1, z1, x2, z2) {
    for (var i = 0; i < buildingBounds.length; i++) {
        var b = buildingBounds[i];
        if (segmentAABBIntersect(x1, z1, x2, z2, b.minX, b.minZ, b.maxX, b.maxZ)) {
            return true;
        }
    }
    return false;
}

// =============================================
// 线段与轴对齐包围盒(AABB)相交检测算法
// =============================================
function segmentAABBIntersect(x1, z1, x2, z2, minX, minZ, maxX, maxZ) {
    var dX = x2 - x1;
    var dZ = z2 - z1;
    var tMin = 0;
    var tMax = 1;
    var p, q;
    var arr = [
        [dX !== 0 ? (minX - x1) / dX : 1e10, dX !== 0 ? (maxX - x1) / dX : -1e10],
        [dZ !== 0 ? (minZ - z1) / dZ : 1e10, dZ !== 0 ? (maxZ - z1) / dZ : -1e10]
    ];
    for (var i = 0; i < 2; i++) {
        p = Math.min(arr[i][0], arr[i][1]);
        q = Math.max(arr[i][0], arr[i][1]);
        tMin = Math.max(tMin, p);
        tMax = Math.min(tMax, q);
        if (tMin > tMax) return false;
    }
    return tMax >= 0;
}

// =============================================
// 创建备用人物模型（当GLB模型加载失败时使用几何体组合）
// =============================================
function createFallbackPerson(color, position, type) {
    var group = new THREE.Group();

    // 头部
    var headGeo = new THREE.SphereGeometry(0.25, 12, 8);
    var skinColor = type === 'girl' ? 0xffccaa : 0xeebb99;
    var headMat = new THREE.MeshStandardMaterial({ color: skinColor });
    var head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.55;
    head.castShadow = true;
    group.add(head);

    // 头发
    var hairGeo = new THREE.SphereGeometry(0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6);
    var hairMat = new THREE.MeshStandardMaterial({ color: type === 'girl' ? 0x332211 : 0x222222 });
    var hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.6;
    group.add(hair);

    // 身体
    var bodyGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.7, 8);
    var bodyMat = new THREE.MeshStandardMaterial({ color: color });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.05;
    body.castShadow = true;
    group.add(body);

    // 腿
    var legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 6);
    var legMat = new THREE.MeshStandardMaterial({ color: 0x333355 });
    var leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.1, 0.35, 0);
    group.add(leftLeg);
    var rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.1, 0.35, 0);
    group.add(rightLeg);

    group.position.copy(position);
    group.userData.leftLeg = leftLeg;
    group.userData.rightLeg = rightLeg;
    return group;
}

// =============================================
// 更新单个行人（移动 + 行走动画）
// =============================================
function updatePedestrian(model, delta) {
    if (!model || !model.userData.isPedestrian) return;
    if (!model.userData.ready) return;
    // 如果人物正在被键盘控制，不使用自动行走
    if (model.userData.controlled) return;

    // 原有的自动行走逻辑已禁用，人物保持静止
    // 如果需要恢复自动行走，移除上面这行
}

// 键盘控制人物移动
function updateCharacterMovement(delta) {
    // 更新女生移动
    if (girlModel && girlModel.userData.controlled) {
        updateSingleCharacterMovement(girlModel, girlMoveState, 'south', delta);
    }

    // 更新男生移动
    if (boyModel && boyModel.userData.controlled) {
        updateSingleCharacterMovement(boyModel, boyMoveState, 'north', delta);
    }
}

function updateSingleCharacterMovement(model, moveState, campus, delta) {
    var isMoving = false;
    var moveX = 0;
    var moveZ = 0;
    var rotate = 0;

    // 根据方向键计算移动
    if (moveState.left) {
        rotate = CHARACTER_ROTATE_SPEED * delta;
    }
    if (moveState.right) {
        rotate = -CHARACTER_ROTATE_SPEED * delta;
    }
    if (moveState.forward) {
        moveZ = 1;
        isMoving = true;
    }
    if (moveState.backward) {
        moveZ = -1;
        isMoving = true;
    }

    // 应用旋转
    if (rotate !== 0) {
        model.rotation.y += rotate;
    }

    // 计算移动方向（相对于人物朝向）
    if (isMoving) {
        var forward = new THREE.Vector3(0, 0, 1);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), model.rotation.y);

        var moveDir = new THREE.Vector3();
        if (moveState.forward) {
            moveDir.add(forward);
        }
        if (moveState.backward) {
            moveDir.sub(forward);
        }
        if (moveState.left) {
            moveDir.add(new THREE.Vector3(-forward.z, 0, forward.x));
        }
        if (moveState.right) {
            moveDir.sub(new THREE.Vector3(-forward.z, 0, forward.x));
        }

        moveDir.normalize();

        var newX = model.position.x + moveDir.x * CHARACTER_MOVE_SPEED * delta;
        var newZ = model.position.z + moveDir.z * CHARACTER_MOVE_SPEED * delta;

        // 检查是否在允许的校区内
        var bounds = CAMPUS_BOUNDS[campus];
        if (bounds) {
            newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
            newZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, newZ));
        }

        // 检查是否撞到建筑物
        if (!isInsideBuilding(newX, newZ)) {
            model.position.x = newX;
            model.position.z = newZ;
        }

        // 行走动画
        model.userData.walkTimer = (model.userData.walkTimer || 0) + delta * CHARACTER_MOVE_SPEED * 3;
        var swing = Math.sin(model.userData.walkTimer) * 0.4;
        if (model.userData.leftLeg) {
            model.userData.leftLeg.rotation.x = swing;
        }
        if (model.userData.rightLeg) {
            model.userData.rightLeg.rotation.x = -swing;
        }
    } else {
        // 停止时归位腿部
        if (model.userData.leftLeg) {
            model.userData.leftLeg.rotation.x *= 0.9;
        }
        if (model.userData.rightLeg) {
            model.userData.rightLeg.rotation.x *= 0.9;
        }
    }
}

// =============================================
// 选中人物（玩家可控制该人物移动）
// =============================================
function selectCharacter(characterType) {
    if (selectedCharacter === characterType) {
        deselectCharacter();
        return;
    }

    deselectCharacter();
    selectedCharacter = characterType;

    if (characterType === 'girl' && girlModel) {
        girlModel.userData.controlled = true;
    } else if (characterType === 'boy' && boyModel) {
        boyModel.userData.controlled = true;
    }

    updateCharacterHint(characterType);
}

// =============================================
// 取消选中人物
// =============================================
function deselectCharacter() {
    if (selectedCharacter === 'girl' && girlModel) {
        girlModel.userData.controlled = false;
        girlMoveState = { forward: false, backward: false, left: false, right: false };
    } else if (selectedCharacter === 'boy' && boyModel) {
        boyModel.userData.controlled = false;
        boyMoveState = { forward: false, backward: false, left: false, right: false };
    }
    selectedCharacter = null;
    hideCharacterHint();
}

// =============================================
// 更新人物选中提示（显示在屏幕底部）
// =============================================
function updateCharacterHint(characterType) {
    var hint = document.getElementById('character-hint');
    if (!hint) return;

    if (characterType === 'girl') {
        hint.innerHTML = '<span class="hint-icon">👧</span><span class="hint-text">已选中女生</span>，使用 <b>方向键</b> 控制移动（仅限南校区）';
        hint.style.borderColor = 'rgba(255, 102, 153, 0.5)';
    } else if (characterType === 'boy') {
        hint.innerHTML = '<span class="hint-icon">👦</span><span class="hint-text">已选中男生</span>，使用 <b>WASD</b> 控制移动（仅限北校区）';
        hint.style.borderColor = 'rgba(51, 102, 255, 0.5)';
    }

    hint.style.display = 'block';
}

// =============================================
// 隐藏人物选中提示
// =============================================
function hideCharacterHint() {
    var hint = document.getElementById('character-hint');
    if (hint) {
        hint.style.display = 'none';
    }
}

// =============================================
// 选择下一个节点（行人寻路算法）
// 优先选择不经过建筑物的路径，多级fallback保证人物总能移动
// =============================================
function chooseNextNode(model, currentNode, previousNode) {
    var connections = nodeConnections[currentNode];
    if (!connections || connections.length === 0) return;

    var currentPos = getNodePosition(currentNode);
    var currentCampus = model.userData.campus || 'south';
    var candidates = [];

    // 第一轮：选择不经过建筑物的相邻节点
    for (var i = 0; i < connections.length; i++) {
        if (connections[i] === previousNode) continue;

        var targetNodeId = connections[i];
        var targetNode = null;
        for (var n = 0; n < roadNodes.length; n++) {
            if (roadNodes[n].id === targetNodeId) {
                targetNode = roadNodes[n];
                break;
            }
        }
        if (!targetNode || targetNode.campus !== currentCampus) continue;

        var targetPos = getNodePosition(targetNodeId);
        if (isInsideBuilding(targetPos.x, targetPos.z)) continue;
        if (segmentIntersectsBuilding(currentPos.x, currentPos.z, targetPos.x, targetPos.z)) continue;

        candidates.push(targetNodeId);
    }

    // 第二轮 fallback：跳过 previousNode 但允许经过建筑物
    if (candidates.length === 0) {
        for (var j = 0; j < connections.length; j++) {
            var fallbackNodeId = connections[j];
            if (fallbackNodeId === previousNode) continue;
            var fallbackNode = null;
            for (var m = 0; m < roadNodes.length; m++) {
                if (roadNodes[m].id === fallbackNodeId) {
                    fallbackNode = roadNodes[m];
                    break;
                }
            }
            if (!fallbackNode || fallbackNode.campus !== currentCampus) continue;
            var fallbackPos = getNodePosition(fallbackNodeId);
            if (!isInsideBuilding(fallbackPos.x, fallbackPos.z)) {
                candidates.push(fallbackNodeId);
                break;
            }
        }
    }

    // 第三轮 fallback：允许 previousNode
    if (candidates.length === 0) {
        for (var k = 0; k < connections.length; k++) {
            var fallback2Id = connections[k];
            var fallback2Node = null;
            for (var p = 0; p < roadNodes.length; p++) {
                if (roadNodes[p].id === fallback2Id) {
                    fallback2Node = roadNodes[p];
                    break;
                }
            }
            if (!fallback2Node || fallback2Node.campus !== currentCampus) continue;
            var fallback2Pos = getNodePosition(fallback2Id);
            if (!isInsideBuilding(fallback2Pos.x, fallback2Pos.z)) {
                candidates.push(fallback2Id);
                break;
            }
        }
    }

    // 第四轮 fallback：同校区随机节点
    if (candidates.length === 0) {
        var campusNodes = currentCampus === 'south' ? southCampusNodes : northCampusNodes;
        var shuffled = campusNodes.slice().sort(function() { return Math.random() - 0.5; });
        for (var q = 0; q < shuffled.length; q++) {
            var randomNodeId = shuffled[q];
            if (randomNodeId === currentNode) continue;
            var randomPos = getNodePosition(randomNodeId);
            if (!isInsideBuilding(randomPos.x, randomPos.z)) {
                candidates.push(randomNodeId);
                break;
            }
        }
    }

    // 最终 fallback：待在原地
    if (candidates.length === 0) {
        model.userData.fromNode = currentNode;
        model.userData.toNode = previousNode;
    } else {
        var choice = candidates[Math.floor(Math.random() * candidates.length)];
        model.userData.fromNode = currentNode;
        model.userData.toNode = choice;
    }
}

// =============================================
// 更新所有行人（女生、男生）
// =============================================
function updatePedestrians(delta) {
    updatePedestrian(girlModel, delta);
    updatePedestrian(boyModel, delta);
}

// =============================================
// 雨滴粒子系统初始化（细长条状，深蓝灰色）
// =============================================
function initRainSystem() {
    // 创建雨滴纹理（6x48像素细长条）
    var rainCanvas = document.createElement('canvas');
    rainCanvas.width = 6;
    rainCanvas.height = 48;
    var rctx = rainCanvas.getContext('2d');
    var gradient = rctx.createLinearGradient(3, 0, 3, 48);
    gradient.addColorStop(0, 'rgba(10,20,60,0)');
    gradient.addColorStop(0.15, 'rgba(15,30,80,0.8)');
    gradient.addColorStop(0.85, 'rgba(25,50,120,0.9)');
    gradient.addColorStop(1, 'rgba(10,20,60,0)');
    rctx.fillStyle = gradient;
    rctx.fillRect(0, 0, 6, 48);

    var rainTexture = new THREE.CanvasTexture(rainCanvas);
    rainTexture.needsUpdate = true;

    // 粒子几何体
    rainGeo = new THREE.BufferGeometry();
    var positions = new Float32Array(rainCount * 3);
    var velocities = new Float32Array(rainCount);

    // 随机初始化粒子位置和速度
    for (var i = 0; i < rainCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 140;
        positions[i * 3 + 1] = Math.random() * 60;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 140;
        velocities[i] = 0.5 + Math.random() * 0.4;  // 速度 0.5~0.9
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    rainGeo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

    // 雨滴材质（深蓝灰色，加性混合）
    var rainMat = new THREE.PointsMaterial({
        map: rainTexture,
        size: 0.8,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: 0x152555
    });

    rainParticles = new THREE.Points(rainGeo, rainMat);
    rainParticles.visible = false;
    scene.add(rainParticles);

    // =============================================
    // 雪花粒子系统（圆形，白色）
    // =============================================
    snowGeo = new THREE.BufferGeometry();
    var snowPositions = new Float32Array(snowCount * 3);
    var snowVelocities = new Float32Array(snowCount * 3);

    for (var j = 0; j < snowCount; j++) {
        snowPositions[j * 3] = (Math.random() - 0.5) * 140;
        snowPositions[j * 3 + 1] = Math.random() * 60;
        snowPositions[j * 3 + 2] = (Math.random() - 0.5) * 140;
        snowVelocities[j * 3] = (Math.random() - 0.5) * 0.3;
        snowVelocities[j * 3 + 1] = 0.1 + Math.random() * 0.2;
        snowVelocities[j * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }

    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
    snowGeo.setAttribute('velocity', new THREE.BufferAttribute(snowVelocities, 3));

    // 创建雪花纹理（圆形渐变）
    var snowCanvas = document.createElement('canvas');
    snowCanvas.width = 32;
    snowCanvas.height = 32;
    var sctx = snowCanvas.getContext('2d');
    var snowGrad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    snowGrad.addColorStop(0, 'rgba(255,255,255,1)');
    snowGrad.addColorStop(0.4, 'rgba(255,255,255,0.8)');
    snowGrad.addColorStop(1, 'rgba(255,255,255,0)');
    sctx.fillStyle = snowGrad;
    sctx.fillRect(0, 0, 32, 32);

    var snowTexture = new THREE.CanvasTexture(snowCanvas);
    snowTexture.needsUpdate = true;

    var snowMat = new THREE.PointsMaterial({
        map: snowTexture,
        size: 0.8,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        color: 0xffffff
    });

    snowParticles = new THREE.Points(snowGeo, snowMat);
    snowParticles.visible = false;
    scene.add(snowParticles);
}

// =============================================
// 雨滴粒子更新（下落 + 斜向）
// =============================================
function updateRain() {
    if (!rainParticles || !rainParticles.visible) return;

    var positions = rainGeo.attributes.position.array;
    var velocities = rainGeo.attributes.velocity.array;

    for (var i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= velocities[i] * 1.0;  // 下落
        positions[i * 3] -= 0.04;  // 斜向（风效果）

        // 重置落到底部的雨滴
        if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 50 + Math.random() * 10;
            positions[i * 3] = (Math.random() - 0.5) * 140;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 140;
        }
    }

    rainGeo.attributes.position.needsUpdate = true;
}

// =============================================
// 雪花粒子更新（飘落 + 随机摆动）
// =============================================
function updateSnow() {
    if (!snowParticles || !snowParticles.visible) return;

    var positions = snowGeo.attributes.position.array;
    var velocities = snowGeo.attributes.velocity.array;
    var time = Date.now() * 0.001;

    for (var i = 0; i < snowCount; i++) {
        // 雪花飘落 + 随机摆动效果
        positions[i * 3] += velocities[i * 3] + Math.sin(time + i) * 0.01;
        positions[i * 3 + 1] -= velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2] + Math.cos(time + i * 0.7) * 0.01;

        // 重置落到底部的雪花
        if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 50 + Math.random() * 10;
            positions[i * 3] = (Math.random() - 0.5) * 140;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 140;
        }
    }

    snowGeo.attributes.position.needsUpdate = true;
}

// =============================================
// 天气切换（切换到指定天气类型）
// =============================================
function setWeather(weatherType) {
    if (weatherType === currentWeather) return;

    weatherTransition.from = WEATHER_PRESETS[currentWeather];
    weatherTransition.to = WEATHER_PRESETS[weatherType];
    weatherTransition.progress = 0;
    currentWeather = weatherType;

    // 显示对应的粒子效果
    if (weatherType === 'rain') {
        rainParticles.visible = true;
    }
    if (weatherType === 'snow') {
        snowParticles.visible = true;
    }

    updateWeatherAudio(weatherType);

    // 更新UI按钮状态
    var btns = document.querySelectorAll('.weather-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }
    var activeBtn = document.getElementById('btn-weather-' + weatherType);
    if (activeBtn) activeBtn.classList.add('active');
}

// =============================================
// 天气过渡动画（平滑插值切换）
// =============================================
function updateWeatherTransition(delta) {
    if (weatherTransition.progress >= 1) return;

    weatherTransition.progress = Math.min(1, weatherTransition.progress + delta * 0.8);
    var t = weatherTransition.progress;
    var easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    var from = weatherTransition.from;
    var to = weatherTransition.to;

    // 插值天空颜色和雾效
    scene.background.copy(from.sky).lerp(to.sky, easeT);
    if (scene.fog) {
        scene.fog.color.copy(from.fog).lerp(to.fog, easeT);
        scene.fog.near = from.fogNear + (to.fogNear - from.fogNear) * easeT;
        scene.fog.far = from.fogFar + (to.fogFar - from.fogFar) * easeT;
    }

    // 插值光照强度和颜色
    ambientLight.intensity = from.ambient + (to.ambient - from.ambient) * easeT;
    ambientLight.color.copy(new THREE.Color(from.ambientColor)).lerp(new THREE.Color(to.ambientColor), easeT);
    dirLight.intensity = from.dir + (to.dir - from.dir) * easeT;
    dirLight.color.copy(new THREE.Color(from.dirColor)).lerp(new THREE.Color(to.dirColor), easeT);
    fillLight.intensity = from.fill + (to.fill - from.fill) * easeT;
    fillLight.color.copy(new THREE.Color(from.fillColor)).lerp(new THREE.Color(to.fillColor), easeT);

    // 插值地面颜色
    if (groundMesh) {
        groundMesh.material.color.copy(new THREE.Color(from.ground)).lerp(new THREE.Color(to.ground), easeT);
    }

    // 过渡完成后隐藏不再需要的粒子
    if (weatherTransition.progress >= 1) {
        if (!to.rain && rainParticles) {
            rainParticles.visible = false;
        }
        if (!to.snow && snowParticles) {
            snowParticles.visible = false;
        }
    }
}

function getPersistedModels() {
    try {
        var data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch (e) {
        console.error('读取持久化数据失败:', e);
        return [];
    }
}

function savePersistedModels(models) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
    } catch (e) {
        console.error('保存持久化数据失败 (可能存储空间不足):', e);
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            alert('浏览器存储空间不足！本地文件模型较大，建议使用 URL 模型或清理旧数据。');
        }
    }
}

function addPersistedModel(modelData) {
    var models = getPersistedModels();
    models.push(modelData);
    savePersistedModels(models);
    console.log('模型数据已持久化, id:', modelData.id);
}

function updatePersistedModel(id, updates) {
    var models = getPersistedModels();
    for (var i = 0; i < models.length; i++) {
        if (models[i].id === id) {
            for (var key in updates) {
                models[i][key] = updates[key];
            }
            break;
        }
    }
    savePersistedModels(models);
}

function removePersistedModel(id) {
    var models = getPersistedModels();
    var filtered = [];
    for (var i = 0; i < models.length; i++) {
        if (models[i].id !== id) {
            filtered.push(models[i]);
        }
    }
    savePersistedModels(filtered);
    console.log('模型数据已从持久化存储中移除, id:', id);
}

function generateModelId() {
    modelIdCounter++;
    return 'model_' + Date.now() + '_' + modelIdCounter;
}

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var chunkSize = 8192;
    for (var i = 0; i < bytes.length; i += chunkSize) {
        var chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function loadLocalModelFolder() {
    var persistedModels = getPersistedModels();
    var persistedFiles = {};
    for (var i = 0; i < persistedModels.length; i++) {
        if (persistedModels[i].localFile) {
            persistedFiles[persistedModels[i].localFile] = true;
        }
    }

    fetch('/api/3Dmoxing/list')
        .then(function(res) {
            if (!res.ok) throw new Error('server not running');
            return res.json();
        })
        .then(function(data) {
            var files = data.files || [];
            if (files.length === 0) {
                console.log('3Dmoxing 文件夹中没有 GLB 文件');
                return;
            }

            var loadedCount = 0;
            for (var j = 0; j < files.length; j++) {
                (function(fileName) {
                    if (persistedFiles[fileName]) {
                        console.log('模型已通过持久化恢复，跳过:', fileName);
                        return;
                    }

                    var lowerName = fileName.toLowerCase();
                    if (lowerName === 'girl.glb' || lowerName === 'boy.glb') {
                        return;
                    }

                    var modelUrl = '3Dmoxing/' + fileName;
                    var pos = new THREE.Vector3(
                        (Math.random() - 0.5) * 40,
                        0,
                        (Math.random() - 0.5) * 40 - 20
                    );
                    loadLocalFolderModel(modelUrl, pos, 1, { x: 0, y: 0, z: 0 }, fileName, fileName);
                    loadedCount++;
                })(files[j]);
            }

            if (loadedCount > 0) {
                console.log('从 3Dmoxing 文件夹自动发现并加载 ' + loadedCount + ' 个新模型');
            }
        })
        .catch(function() {
            loadLocalModelFolderFromConfig(persistedFiles);
        });
}

function loadLocalModelFolderFromConfig(persistedFiles) {
    var configUrl = '3Dmoxing/models.json';
    fetch(configUrl)
        .then(function(res) {
            if (!res.ok) throw new Error('配置文件不存在');
            return res.json();
        })
        .then(function(modelList) {
            if (!Array.isArray(modelList) || modelList.length === 0) {
                console.log('3Dmoxing/models.json 中没有模型配置');
                return;
            }

            var loadedCount = 0;
            for (var j = 0; j < modelList.length; j++) {
                (function(cfg) {
                    var fileName = cfg.file;
                    if (!fileName) return;

                    if (persistedFiles && persistedFiles[fileName]) {
                        console.log('模型已通过持久化恢复，跳过:', fileName);
                        return;
                    }

                    var lowerName = fileName.toLowerCase();
                    if (lowerName === 'girl.glb' || lowerName === 'boy.glb') {
                        return;
                    }

                    var modelUrl = '3Dmoxing/' + fileName;
                    var pos = new THREE.Vector3(
                        cfg.position ? cfg.position[0] : 0,
                        cfg.position ? cfg.position[1] : 0,
                        cfg.position ? cfg.position[2] : 0
                    );
                    var scale = cfg.scale || 1;
                    var rot = {
                        x: cfg.rotation ? cfg.rotation[0] : 0,
                        y: cfg.rotation ? cfg.rotation[1] : 0,
                        z: cfg.rotation ? cfg.rotation[2] : 0
                    };
                    var name = cfg.name || fileName;

                    loadLocalFolderModel(modelUrl, pos, scale, rot, fileName, name);
                    loadedCount++;
                })(modelList[j]);
            }

            if (loadedCount > 0) {
                console.log('从 3Dmoxing/models.json 加载 ' + loadedCount + ' 个模型');
            }
        })
        .catch(function() {
            console.log('未找到 3Dmoxing/models.json，跳过文件夹模型加载');
        });
}

function loadLocalFolderModel(url, position, scale, rotation, fileName, modelName) {
    if (!gltfLoader) return;

    gltfLoader.load(url,
        function(gltf) {
            var model = gltf.scene;

            var box = new THREE.Box3().setFromObject(model);
            var size = box.getSize(new THREE.Vector3());
            var maxDim = Math.max(size.x, size.y, size.z);
            var rawScale = 1;
            if (maxDim > 0) {
                var normalizeScale = 10 / maxDim;
                rawScale = normalizeScale * scale;
                model.scale.set(rawScale, rawScale, rawScale);
            }

            model.position.set(position.x, position.y, position.z);
            model.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);

            model.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            var modelId = generateModelId();
            model.userData.isAIModel = true;
            model.userData.modelId = modelId;
            model.userData.sourceType = 'url';
            model.userData.sourceUrl = url;
            model.userData.localFile = fileName;
            model.name = modelName;

            aiModelsGroup.add(model);
            console.log('文件夹模型加载成功:', fileName);

            addPersistedModel({
                id: modelId,
                sourceType: 'url',
                source: url,
                localFile: fileName,
                position: { x: model.position.x, y: model.position.y, z: model.position.z },
                scale: scale,
                rawScale: rawScale,
                rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
                name: modelName
            });
        },
        undefined,
        function(error) {
            console.warn('文件夹模型加载失败 (文件可能不存在):', fileName, error.message || error);
        }
    );
}

function loadPersistedModels() {
    var models = getPersistedModels();
    if (models.length === 0) {
        console.log('没有已保存的模型需要恢复');
        return;
    }

    var pedestrianFiles = ['girl.glb', 'boy.glb'];
    var filtered = [];
    var removedCount = 0;
    for (var i = 0; i < models.length; i++) {
        var src = (models[i].source || '').toLowerCase();
        var name = (models[i].name || '').toLowerCase();
        var isPedestrian = false;
        for (var j = 0; j < pedestrianFiles.length; j++) {
            if (src.indexOf(pedestrianFiles[j].toLowerCase()) >= 0 || name.indexOf(pedestrianFiles[j].toLowerCase()) >= 0) {
                isPedestrian = true;
                break;
            }
        }
        if (isPedestrian) {
            removedCount++;
        } else {
            filtered.push(models[i]);
        }
    }
    if (removedCount > 0) {
        savePersistedModels(filtered);
        console.log('已移除 ' + removedCount + ' 个静态人物模型（girl.glb/boy.glb），仅保留动态行走版本');
    }
    models = filtered;

    if (models.length === 0) {
        console.log('没有已保存的模型需要恢复');
        return;
    }

    console.log('开始恢复 ' + models.length + ' 个已保存的模型...');

    var restoredCount = 0;
    for (var i = 0; i < models.length; i++) {
        (function(modelData) {
            var pos = new THREE.Vector3(
                modelData.position.x,
                modelData.position.y,
                modelData.position.z
            );
            var rot = modelData.rotation || { x: 0, y: 0, z: 0 };
            var rawScale = modelData.rawScale || null;

            if (modelData.sourceType === 'url') {
                loadPersistedGLBFromUrl(modelData.source, pos, modelData.scale, rot, modelData.id, modelData.name, rawScale);
                restoredCount++;
            } else if (modelData.sourceType === 'base64') {
                try {
                    var arrayBuffer = base64ToArrayBuffer(modelData.source);
                    loadPersistedGLBFromBuffer(arrayBuffer, pos, modelData.scale, rot, modelData.id, modelData.name, rawScale);
                    restoredCount++;
                } catch (e) {
                    console.error('恢复 base64 模型失败, id:', modelData.id, e);
                }
            }
        })(models[i]);
    }

    console.log('已恢复 ' + restoredCount + ' 个模型');
}

function loadPersistedGLBFromUrl(url, position, scale, rotation, modelId, modelName, rawScale) {
    if (!gltfLoader) return;

    gltfLoader.load(url,
        function(gltf) {
            var model = gltf.scene;
            applyModelTransform(model, position, scale, rotation, rawScale);
            model.userData.isAIModel = true;
            model.userData.modelId = modelId;
            model.userData.sourceType = 'url';
            model.userData.sourceUrl = url;
            model.name = modelName || 'AI模型';
            aiModelsGroup.add(model);
            console.log('持久化 URL 模型恢复成功:', modelId);
        },
        undefined,
        function(error) {
            console.error('持久化 URL 模型恢复失败:', modelId, error);
        }
    );
}

function loadPersistedGLBFromBuffer(arrayBuffer, position, scale, rotation, modelId, modelName, rawScale) {
    if (!gltfLoader) return;

    gltfLoader.parse(arrayBuffer, '',
        function(gltf) {
            var model = gltf.scene;
            applyModelTransform(model, position, scale, rotation, rawScale);
            model.userData.isAIModel = true;
            model.userData.modelId = modelId;
            model.userData.sourceType = 'base64';
            model.name = modelName || 'AI模型';
            aiModelsGroup.add(model);
            console.log('持久化 base64 模型恢复成功:', modelId);
        },
        function(error) {
            console.error('持久化 base64 模型恢复失败:', modelId, error);
        }
    );
}

function applyModelTransform(model, position, scale, rotation, rawScale) {
    if (rawScale) {
        model.scale.set(rawScale, rawScale, rawScale);
    } else {
        var box = new THREE.Box3().setFromObject(model);
        var size = box.getSize(new THREE.Vector3());
        var maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
            var normalizeScale = 10 / maxDim;
            var finalScale = normalizeScale * (scale || 1);
            model.scale.set(finalScale, finalScale, finalScale);
        }
    }

    model.position.set(position.x, position.y, position.z);

    if (rotation) {
        model.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);
    }

    model.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}

function saveModelState(model) {
    if (!model.userData.modelId) return;
    updatePersistedModel(model.userData.modelId, {
        position: { x: model.position.x, y: model.position.y, z: model.position.z },
        scale: model.scale.x / (function() {
            var box = new THREE.Box3().setFromObject(model);
            var size = box.getSize(new THREE.Vector3());
            var maxDim = Math.max(size.x, size.y, size.z);
            return maxDim > 0 ? (10 / maxDim) : 1;
        })() || 1,
        rotation: { x: model.rotation.x, y: model.rotation.y, z: model.rotation.z }
    });
}

function getModelNormalizedScale(model) {
    var tempBox = new THREE.Box3();
    model.traverse(function(child) {
        if (child.isMesh) {
            var worldPos = new THREE.Vector3();
            child.getWorldPosition(worldPos);
            tempBox.expandByPoint(worldPos);
        }
    });
    return model.scale.x;
}

var groundMesh = null;

function createGround() {
    var groundGeometry = new THREE.PlaneGeometry(140, 140);
    var groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x4CAF50,
        side: THREE.DoubleSide
    });
    groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
}

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

function createBuildingTexture(bodyColor, floors, cols, w, h) {
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    var ctx = canvas.getContext('2d');

    var r = (bodyColor >> 16) & 0xFF;
    var g = (bodyColor >> 8) & 0xFF;
    var b = bodyColor & 0xFF;
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.fillRect(0, 0, 512, 512);

    for (var i = 0; i < 200; i++) {
        var nx = Math.random() * 512;
        var ny = Math.random() * 512;
        ctx.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.03) + ')';
        ctx.fillRect(nx, ny, Math.random() * 8 + 2, Math.random() * 8 + 2);
    }

    if (floors > 0 && cols > 0) {
        var floorH = 512 / floors;
        var winW = 512 / (cols * 2 + 1);
        var winH = floorH * 0.55;
        var winGap = winW;

        for (var row = 0; row < floors; row++) {
            var baseY = row * floorH + floorH * 0.2;
            for (var col = 0; col < cols; col++) {
                var baseX = winGap + col * (winW + winGap);

                ctx.fillStyle = 'rgba(0,0,0,0.12)';
                ctx.fillRect(baseX + 2, baseY + 2, winW, winH);

                var gradient = ctx.createLinearGradient(baseX, baseY, baseX + winW, baseY + winH);
                gradient.addColorStop(0, 'rgba(100,160,220,0.85)');
                gradient.addColorStop(0.5, 'rgba(140,200,255,0.9)');
                gradient.addColorStop(1, 'rgba(80,140,200,0.85)');
                ctx.fillStyle = gradient;
                ctx.fillRect(baseX, baseY, winW, winH);

                ctx.strokeStyle = 'rgba(60,60,80,0.4)';
                ctx.lineWidth = 1;
                ctx.strokeRect(baseX, baseY, winW, winH);

                ctx.beginPath();
                ctx.moveTo(baseX + winW / 2, baseY);
                ctx.lineTo(baseX + winW / 2, baseY + winH);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(baseX, baseY + winH / 2);
                ctx.lineTo(baseX + winW, baseY + winH / 2);
                ctx.stroke();

                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fillRect(baseX + 2, baseY + 2, winW / 2 - 2, winH / 2 - 2);
            }
        }
    }

    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    if (floors > 0) {
        var fh = 512 / floors;
        for (var fi = 1; fi < floors; fi++) {
            ctx.beginPath();
            ctx.moveTo(0, fi * fh);
            ctx.lineTo(512, fi * fh);
            ctx.stroke();
        }
    }

    var texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
}

function createRoofTexture() {
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#555555';
    ctx.fillRect(0, 0, 256, 256);

    for (var i = 0; i < 80; i++) {
        ctx.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.08) + ')';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 12 + 2, Math.random() * 12 + 2);
    }

    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    for (var yi = 0; yi < 256; yi += 16) {
        ctx.beginPath();
        ctx.moveTo(0, yi);
        ctx.lineTo(256, yi);
        ctx.stroke();
    }

    var texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
}

function createBuilding(w, h, d, floors, cols, bodyColor, position, name) {
    var group = new THREE.Group();
    group.name = name;

    var bodyTexture = createBuildingTexture(bodyColor, floors, cols, w, h);
    var bodyMaterials = [
        new THREE.MeshStandardMaterial({ map: bodyTexture, roughness: 0.7 }),
        new THREE.MeshStandardMaterial({ map: bodyTexture, roughness: 0.7 }),
        new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.6 }),
        new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.6 }),
        new THREE.MeshStandardMaterial({ map: bodyTexture, roughness: 0.7 }),
        new THREE.MeshStandardMaterial({ map: bodyTexture, roughness: 0.7 })
    ];

    var bodyGeometry = new THREE.BoxGeometry(w, h, d);
    var body = new THREE.Mesh(bodyGeometry, bodyMaterials);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;

    body.userData.originalColor = new THREE.Color(bodyColor);
    body.userData.originalMaterials = bodyMaterials;
    body.userData.isBuildingBody = true;
    body.userData.parentGroup = group;

    group.add(body);

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

    var roofTexture = createRoofTexture();
    var roofGeometry = new THREE.BoxGeometry(w + 0.3, 0.25, d + 0.3);
    var roofMaterial = new THREE.MeshStandardMaterial({
        map: roofTexture,
        roughness: 0.7
    });
    var roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = h + 0.125;
    roof.castShadow = true;
    group.add(roof);

    group.position.copy(position);
    return group;
}

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

    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = '#D93025';
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
    } else {
        ctx.rect(boxX, boxY, boxWidth, boxHeight);
    }
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.font = 'bold ' + nameFontSize + 'px Microsoft YaHei, PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(name, canvas.width / 2, canvas.height / 2 - 10);

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

function createBuildings() {
    for (var i = 0; i < BUILDING_DATA.length; i++) {
        var b = BUILDING_DATA[i];
        var cfg = TYPE_CONFIG[b.type] || TYPE_CONFIG.teaching;
        var pos = new THREE.Vector3(b.x * SCALE, 0, b.z * SCALE);

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
        labelsGroup.add(label);
    }
}

function createTrackField(w, d, position, name) {
    var group = new THREE.Group();
    group.name = name;

    var trackGeo = new THREE.PlaneGeometry(w, d);
    var trackMat = new THREE.MeshStandardMaterial({ color: 0xC04040, side: THREE.DoubleSide });
    var track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.05;
    track.receiveShadow = true;
    group.add(track);

    var grassGeo = new THREE.PlaneGeometry(w * 0.7, d * 0.7);
    var grassMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50, side: THREE.DoubleSide });
    var grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 0.06;
    group.add(grass);

    var lineGeo = new THREE.PlaneGeometry(w * 0.95, d * 0.95);
    var lineMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide, wireframe: true });
    var line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.07;
    group.add(line);

    group.position.copy(position);
    return group;
}

function createTennisCourt(w, d, position, name) {
    var group = new THREE.Group();
    group.name = name;

    var courtGeo = new THREE.PlaneGeometry(w, d);
    var courtMat = new THREE.MeshStandardMaterial({ color: 0x4B90D9, side: THREE.DoubleSide });
    var court = new THREE.Mesh(courtGeo, courtMat);
    court.rotation.x = -Math.PI / 2;
    court.position.y = 0.05;
    court.receiveShadow = true;
    group.add(court);

    var netGeo = new THREE.PlaneGeometry(w, 0.8);
    var netMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    var net = new THREE.Mesh(netGeo, netMat);
    net.position.y = 0.4;
    group.add(net);

    var borderGeo = new THREE.PlaneGeometry(w * 0.9, d * 0.9);
    var borderMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide, wireframe: true });
    var border = new THREE.Mesh(borderGeo, borderMat);
    border.rotation.x = -Math.PI / 2;
    border.position.y = 0.06;
    group.add(border);

    group.position.copy(position);
    return group;
}

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

function createTrees() {
    for (var x = -55; x <= 55; x += 8) {
        treesGroup.add(createTree(new THREE.Vector3(x, 0, -4.5)));
    }
    for (var x2 = -55; x2 <= 55; x2 += 8) {
        treesGroup.add(createTree(new THREE.Vector3(x2, 0, 4.5)));
    }
}

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

    var dirOffset = 60;
    scene.add(createTextLabel('北', new THREE.Vector3(0, 12, dirOffset), 64, '#FFD700'));
    scene.add(createTextLabel('南', new THREE.Vector3(0, 12, -dirOffset), 64, '#FFD700'));
    scene.add(createTextLabel('东', new THREE.Vector3(dirOffset, 12, 0), 64, '#FFD700'));
    scene.add(createTextLabel('西', new THREE.Vector3(-dirOffset, 12, 0), 64, '#FFD700'));
}

function loadGLBModel(url, position, scale, rotation) {
    if (!gltfLoader) {
        console.error('GLTFLoader 未初始化');
        return;
    }

    var targetPos = position || new THREE.Vector3(0, 0, 0);
    var targetScale = scale || 1;
    var targetRotation = rotation || { x: 0, y: 0, z: 0 };

    console.log('开始加载 GLB 模型:', url);

    gltfLoader.load(
        url,
        function(gltf) {
            var model = gltf.scene;

            var box = new THREE.Box3().setFromObject(model);
            var size = box.getSize(new THREE.Vector3());
            var maxDim = Math.max(size.x, size.y, size.z);
            var rawScale = 1;
            if (maxDim > 0) {
                var normalizeScale = 10 / maxDim;
                rawScale = normalizeScale * targetScale;
                model.scale.set(rawScale, rawScale, rawScale);
            }

            model.position.set(targetPos.x, targetPos.y, targetPos.z);
            model.rotation.set(targetRotation.x, targetRotation.y, targetRotation.z);

            model.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            var modelId = generateModelId();
            model.userData.isAIModel = true;
            model.userData.modelId = modelId;
            model.userData.sourceType = 'url';
            model.userData.sourceUrl = url;
            model.name = 'AI模型';

            aiModelsGroup.add(model);
            console.log('GLB 模型加载成功:', url);

            addPersistedModel({
                id: modelId,
                sourceType: 'url',
                source: url,
                position: { x: model.position.x, y: model.position.y, z: model.position.z },
                scale: targetScale,
                rawScale: rawScale,
                rotation: { x: targetRotation.x, y: targetRotation.y, z: targetRotation.z },
                name: model.name
            });

            if (currentView === 'perspective') {
                toggleView('bird');
            }
            var modelWorldPos = new THREE.Vector3();
            model.getWorldPosition(modelWorldPos);
            focusOnPosition(modelWorldPos);
        },
        function(progress) {
            if (progress.total > 0) {
                var pct = Math.round((progress.loaded / progress.total) * 100);
                console.log('模型加载进度:', pct + '%');
            }
        },
        function(error) {
            console.error('GLB 模型加载失败:', error);
            alert('模型加载失败，请检查文件格式是否为有效的 GLB/GLTF。');
        }
    );
}

function loadGLBModelFromFile(file, position, scale) {
    var targetPos = position || new THREE.Vector3(0, 0, 0);
    var targetScale = scale || 1;

    var reader = new FileReader();
    reader.onload = function(e) {
        var arrayBuffer = e.target.result;
        var base64Data = arrayBufferToBase64(arrayBuffer);

        loadGLBModelFromBuffer(arrayBuffer, targetPos, targetScale, null, base64Data, file.name);
    };
    reader.readAsArrayBuffer(file);
}

function loadGLBModelFromBuffer(arrayBuffer, position, scale, rotation, base64Data, fileName) {
    if (!gltfLoader) {
        console.error('GLTFLoader 未初始化');
        return;
    }

    var targetPos = position || new THREE.Vector3(0, 0, 0);
    var targetScale = scale || 1;
    var targetRotation = rotation || { x: 0, y: 0, z: 0 };

    gltfLoader.parse(arrayBuffer, '',
        function(gltf) {
            var model = gltf.scene;

            var box = new THREE.Box3().setFromObject(model);
            var size = box.getSize(new THREE.Vector3());
            var maxDim = Math.max(size.x, size.y, size.z);
            var rawScale = 1;
            if (maxDim > 0) {
                var normalizeScale = 10 / maxDim;
                rawScale = normalizeScale * targetScale;
                model.scale.set(rawScale, rawScale, rawScale);
            }

            model.position.set(targetPos.x, targetPos.y, targetPos.z);

            if (targetRotation) {
                model.rotation.set(targetRotation.x || 0, targetRotation.y || 0, targetRotation.z || 0);
            }

            model.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            var modelId = generateModelId();
            model.userData.isAIModel = true;
            model.userData.modelId = modelId;
            model.userData.sourceType = 'base64';
            model.name = fileName || 'AI模型';

            aiModelsGroup.add(model);
            console.log('本地 GLB 模型加载成功');

            if (base64Data) {
                addPersistedModel({
                    id: modelId,
                    sourceType: 'base64',
                    source: base64Data,
                    position: { x: model.position.x, y: model.position.y, z: model.position.z },
                    scale: targetScale,
                    rawScale: rawScale,
                    rotation: { x: targetRotation.x, y: targetRotation.y, z: targetRotation.z },
                    name: model.name
                });
            }

            if (currentView === 'perspective') {
                toggleView('bird');
            }
            var modelWorldPos = new THREE.Vector3();
            model.getWorldPosition(modelWorldPos);
            focusOnPosition(modelWorldPos);
        },
        function(error) {
            console.error('本地 GLB 模型解析失败:', error);
            alert('模型解析失败，请检查文件格式。');
        }
    );
}

function selectAIModel(model) {
    deselectAIModel();
    selectedAIModel = model;
    selectionBoxDirty = true;
    console.log('模型已选中，可拖拽移动 / 滚轮缩放 / R旋转 / Delete删除 / Esc取消');
}

function deselectAIModel() {
    if (selectionBoxHelper) {
        scene.remove(selectionBoxHelper);
        selectionBoxHelper = null;
    }
    selectedAIModel = null;
    isDraggingModel = false;
}

function updateSelectionBox() {
    if (selectionBoxHelper) {
        scene.remove(selectionBoxHelper);
        selectionBoxHelper = null;
    }
    if (!selectedAIModel) return;

    try {
        var box = new THREE.Box3().setFromObject(selectedAIModel);
        if (box.isEmpty()) return;
        selectionBoxHelper = new THREE.Box3Helper(box, 0x00FF00);
        scene.add(selectionBoxHelper);
    } catch (e) {
        console.warn('更新选择框失败:', e);
    }
    selectionBoxDirty = false;
}

function findAIModelParent(object) {
    var current = object;
    while (current) {
        if (current.userData && current.userData.isAIModel) return current;
        current = current.parent;
    }
    return null;
}

function onModelMouseDown(event) {
    if (isAnimating) return;

    var clickMouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(clickMouse, camera);

    var intersects = raycaster.intersectObjects(aiModelsGroup.children, true);
    if (intersects.length > 0) {
        var model = findAIModelParent(intersects[0].object);
        if (model) {
            event.preventDefault();
            selectAIModel(model);

            isDraggingModel = true;
            controls.enabled = false;

            var hitPoint = raycaster.ray.intersectPlane(dragPlane, dragIntersection);
            if (hitPoint) {
                dragOffset.copy(hitPoint).sub(model.position);
                dragOffset.y = 0;
            } else {
                dragOffset.set(0, 0, 0);
            }

            document.body.style.cursor = 'grabbing';
            return;
        }
    }

    if (selectedAIModel && event.button === 0) {
        var selIntersects = raycaster.intersectObjects(aiModelsGroup.children, true);
        var clickedOnOther = false;
        for (var i = 0; i < selIntersects.length; i++) {
            var m = findAIModelParent(selIntersects[i].object);
            if (m && m !== selectedAIModel) {
                clickedOnOther = true;
                selectAIModel(m);
                isDraggingModel = true;
                controls.enabled = false;
                var hitPt = raycaster.ray.intersectPlane(dragPlane, dragIntersection);
                if (hitPt) {
                    dragOffset.copy(hitPt).sub(m.position);
                    dragOffset.y = 0;
                } else {
                    dragOffset.set(0, 0, 0);
                }
                document.body.style.cursor = 'grabbing';
                return;
            }
        }
        if (!clickedOnOther) {
            deselectAIModel();
        }
    }
}

function onModelMouseMove(event) {
    if (!isDraggingModel || !selectedAIModel) return;

    var moveMouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(moveMouse, camera);

    if (raycaster.ray.intersectPlane(dragPlane, dragIntersection)) {
        selectedAIModel.position.x = dragIntersection.x - dragOffset.x;
        selectedAIModel.position.z = dragIntersection.z - dragOffset.z;
        selectionBoxDirty = true;
    }
}

function onModelMouseUp(event) {
    if (isDraggingModel) {
        isDraggingModel = false;
        if (selectedAIModel && selectedAIModel.userData.modelId) {
            updatePersistedModel(selectedAIModel.userData.modelId, {
                position: {
                    x: selectedAIModel.position.x,
                    y: selectedAIModel.position.y,
                    z: selectedAIModel.position.z
                }
            });
            console.log('模型位置已保存');
        }
        if (currentView === 'bird') {
            controls.enabled = true;
        }
        document.body.style.cursor = selectedAIModel ? 'grab' : 'default';
    }
}

function onModelWheel(event) {
    if (!selectedAIModel) return;

    event.preventDefault();

    var scaleFactor = event.deltaY < 0 ? (1 + MODEL_SCALE_STEP) : (1 - MODEL_SCALE_STEP);
    var currentScale = selectedAIModel.scale.x;
    var newScale = Math.max(0.1, currentScale * scaleFactor);

    selectedAIModel.scale.set(newScale, newScale, newScale);
    selectionBoxDirty = true;

    if (selectedAIModel.userData.modelId) {
        updatePersistedModel(selectedAIModel.userData.modelId, {
            rawScale: newScale
        });
        console.log('模型缩放已保存');
    }
}

function onModelKeyDown(event) {
    if (!selectedAIModel) return;

    switch (event.code) {
        case 'Delete':
        case 'Backspace':
            var deletedId = selectedAIModel.userData.modelId;
            aiModelsGroup.remove(selectedAIModel);
            deselectAIModel();
            if (deletedId) {
                removePersistedModel(deletedId);
            }
            console.log('模型已删除');
            break;
        case 'KeyR':
            selectedAIModel.rotation.y += MODEL_ROTATE_STEP;
            selectionBoxDirty = true;
            if (selectedAIModel.userData.modelId) {
                updatePersistedModel(selectedAIModel.userData.modelId, {
                    rotation: {
                        x: selectedAIModel.rotation.x,
                        y: selectedAIModel.rotation.y,
                        z: selectedAIModel.rotation.z
                    }
                });
                console.log('模型旋转已保存');
            }
            break;
        case 'Escape':
            deselectAIModel();
            break;
    }
}

function focusOnPosition(position) {
    if (isAnimating) return;
    var offset = new THREE.Vector3(0, 15, -30);
    var newCameraPos = position.clone().add(offset);
    animateCamera(newCameraPos, position);
}

function submitHunyuan3DJob(prompt, imageBase64, generateType, enablePBR, faceCount, resultFormat) {
    var params = {
        Action: 'SubmitHunyuanTo3DProJob',
        Version: '2025-05-13',
        Region: 'ap-guangzhou',
        GenerateType: generateType || 'Normal',
        EnablePBR: enablePBR || false,
        FaceCount: faceCount || 100000
    };

    if (resultFormat) {
        params.ResultFormat = resultFormat;
    }

    if (imageBase64) {
        params.ImageBase64 = imageBase64;
    } else if (prompt) {
        params.Prompt = prompt;
    } else {
        return Promise.reject(new Error('请输入文本描述或上传参考图片'));
    }

    return fetch('/api/ai3d/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    }).then(function(res) {
        if (!res.ok) throw new Error('API 请求失败: ' + res.status);
        return res.json();
    });
}

function queryHunyuan3DJob(jobId) {
    return fetch('/api/ai3d/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            Action: 'QueryHunyuanTo3DProJob',
            Version: '2025-05-13',
            Region: 'ap-guangzhou',
            JobId: jobId
        })
    }).then(function(res) {
        if (!res.ok) throw new Error('API 查询失败: ' + res.status);
        return res.json();
    });
}

function startJobPolling(jobId) {
    var statusEl = document.getElementById('ai-status');
    var statusText = document.getElementById('ai-status-text');
    var resultEl = document.getElementById('ai-result');
    var resultPreview = document.getElementById('ai-result-preview');

    statusEl.style.display = 'flex';
    resultEl.style.display = 'none';
    statusText.textContent = '任务已提交，等待处理... (JobId: ' + jobId + ')';

    if (aiPollingTimer) clearInterval(aiPollingTimer);

    var pollCount = 0;
    var maxPolls = 120;

    aiPollingTimer = setInterval(function() {
        pollCount++;
        if (pollCount > maxPolls) {
            clearInterval(aiPollingTimer);
            statusText.textContent = '查询超时，请稍后手动查询。JobId: ' + jobId;
            return;
        }

        queryHunyuan3DJob(jobId).then(function(data) {
            var resp = data.Response || data;
            var status = resp.Status;

            if (status === 'DONE') {
                clearInterval(aiPollingTimer);
                statusEl.style.display = 'none';
                resultEl.style.display = 'block';

                var files = resp.ResultFile3Ds || [];
                if (files.length > 0) {
                    var glbFile = null;
                    for (var i = 0; i < files.length; i++) {
                        if (files[i].Type === 'OBJ' || files[i].Type === 'GLB') {
                            glbFile = files[i];
                        }
                    }
                    if (!glbFile) glbFile = files[0];

                    aiGeneratedModelUrl = glbFile.Url;
                    aiGeneratedPreviewUrl = glbFile.PreviewImageUrl || null;

                    resultPreview.innerHTML = '';
                    if (aiGeneratedPreviewUrl) {
                        var img = document.createElement('img');
                        img.src = aiGeneratedPreviewUrl;
                        resultPreview.appendChild(img);
                    }
                    var info = document.createElement('p');
                    info.style.color = '#b0b8c8';
                    info.style.fontSize = '12px';
                    info.style.marginTop = '8px';
                    info.textContent = '格式: ' + glbFile.Type + ' | 点击"加载到场景"将模型添加到校园场景中';
                    resultPreview.appendChild(info);
                }

                document.getElementById('btn-ai-generate').disabled = false;
            } else if (status === 'FAIL') {
                clearInterval(aiPollingTimer);
                statusText.textContent = '生成失败: ' + (resp.ErrorMessage || '未知错误');
                document.getElementById('btn-ai-generate').disabled = false;
            } else {
                var statusMap = { WAIT: '排队等待中...', RUN: 'AI 正在生成3D模型...' };
                statusText.textContent = (statusMap[status] || '处理中...') + ' (' + pollCount + '/' + maxPolls + ')';
            }
        }).catch(function(err) {
            console.error('查询任务失败:', err);
            statusText.textContent = '查询出错，正在重试... (' + pollCount + '/' + maxPolls + ')';
        });
    }, 5000);
}

function imageFileToBase64(file) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var base64 = e.target.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function bindIntroAndLayerEvents() {
    var introPanel = document.getElementById('intro-panel');
    var layerPanel = document.getElementById('layer-panel');

    document.getElementById('btn-toggle-intro').addEventListener('click', function() {
        var isVisible = introPanel.style.display !== 'none';
        introPanel.style.display = isVisible ? 'none' : 'flex';
        layerPanel.style.display = 'none';
        document.getElementById('manual-panel').style.display = 'none';
        if (!isVisible) {
            showBuildingList();
        }
    });

    document.getElementById('btn-close-intro').addEventListener('click', function() {
        introPanel.style.display = 'none';
    });

    document.getElementById('btn-toggle-layers').addEventListener('click', function() {
        var isVisible = layerPanel.style.display !== 'none';
        layerPanel.style.display = isVisible ? 'none' : 'block';
        introPanel.style.display = 'none';
        document.getElementById('manual-panel').style.display = 'none';
    });

    var manualPanel = document.getElementById('manual-panel');
    document.getElementById('btn-toggle-manual').addEventListener('click', function() {
        var isVisible = manualPanel.style.display !== 'none';
        manualPanel.style.display = isVisible ? 'none' : 'flex';
        introPanel.style.display = 'none';
        layerPanel.style.display = 'none';
    });

    document.getElementById('btn-close-manual').addEventListener('click', function() {
        manualPanel.style.display = 'none';
    });

    document.getElementById('btn-close-layers').addEventListener('click', function() {
        layerPanel.style.display = 'none';
    });

    document.getElementById('layer-buildings').addEventListener('change', function() {
        buildingsGroup.visible = this.checked;
    });
    document.getElementById('layer-trees').addEventListener('change', function() {
        treesGroup.visible = this.checked;
    });
    document.getElementById('layer-roads').addEventListener('change', function() {
        roadsGroup.visible = this.checked;
    });
    document.getElementById('layer-labels').addEventListener('change', function() {
        labelsGroup.visible = this.checked;
        labelsVisible = this.checked;
        var btn = document.getElementById('btn-toggle-labels');
        if (this.checked) {
            btn.textContent = '隐藏标签';
            btn.classList.add('active');
        } else {
            btn.textContent = '显示标签';
            btn.classList.remove('active');
        }
    });
    document.getElementById('layer-ai-models').addEventListener('change', function() {
        aiModelsGroup.visible = this.checked;
    });
    document.getElementById('layer-shadows').addEventListener('change', function() {
        renderer.shadowMap.enabled = this.checked;
        scene.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = renderer.shadowMap.enabled;
                child.receiveShadow = renderer.shadowMap.enabled;
            }
        });
    });
    document.getElementById('layer-fog').addEventListener('change', function() {
        if (this.checked) {
            var preset = WEATHER_PRESETS[currentWeather];
            scene.fog = new THREE.Fog(preset.fog, preset.fogNear, preset.fogFar);
        } else {
            scene.fog = null;
        }
    });

    document.getElementById('btn-weather-day').addEventListener('click', function() { setWeather('day'); });
    document.getElementById('btn-weather-night').addEventListener('click', function() { setWeather('night'); });
    document.getElementById('btn-weather-cloudy').addEventListener('click', function() { setWeather('cloudy'); });
    document.getElementById('btn-weather-rain').addEventListener('click', function() { setWeather('rain'); });
    document.getElementById('btn-weather-snow').addEventListener('click', function() { setWeather('snow'); });

    document.getElementById('btn-bgm-toggle').addEventListener('click', function() { toggleBGM(); });
    document.getElementById('btn-rain-toggle').addEventListener('click', function() { toggleRainAudio(); });
    document.getElementById('btn-night-toggle').addEventListener('click', function() { toggleNightAudio(); });

    document.getElementById('bgm-volume').addEventListener('input', function() {
        bgmVolume = this.value / 100;
        if (bgmEnabled && audioBGM) {
            var preset = WEATHER_PRESETS[currentWeather];
            audioBGM.volume = 0.3 * bgmVolume;
        }
    });
    document.getElementById('rain-volume').addEventListener('input', function() {
        rainVolume = this.value / 100;
        if (rainAudioEnabled && audioRain) {
            audioRain.volume = 0.6 * rainVolume;
        }
    });
    document.getElementById('night-volume').addEventListener('input', function() {
        nightVolume = this.value / 100;
        if (nightAudioEnabled && audioNight) {
            audioNight.volume = 0.5 * nightVolume;
        }
    });
}

function showBuildingList() {
    var introBody = document.getElementById('intro-body');
    var introTitle = document.getElementById('intro-title');
    introTitle.textContent = '校园建筑介绍';

    var html = '<ul class="intro-list">';
    for (var i = 0; i < BUILDING_DATA.length; i++) {
        var b = BUILDING_DATA[i];
        var typeName = TYPE_NAME_MAP[b.type] || '其他';
        html += '<li class="intro-list-item" data-building-id="' + b.id + '">'
            + '<span class="intro-list-dot"></span>'
            + '<span class="intro-list-name">' + b.name + '</span>'
            + '<span class="intro-list-type">' + typeName + '</span>'
            + '</li>';
    }
    html += '</ul>';
    introBody.innerHTML = html;

    var items = introBody.querySelectorAll('.intro-list-item');
    for (var j = 0; j < items.length; j++) {
        items[j].addEventListener('click', function() {
            var bid = this.getAttribute('data-building-id');
            showBuildingDetail(bid);
            focusToBuildingById(bid);
        });
    }
}

function showBuildingDetail(buildingId) {
    var introBody = document.getElementById('intro-body');
    var introTitle = document.getElementById('intro-title');
    var bData = null;
    for (var i = 0; i < BUILDING_DATA.length; i++) {
        if (BUILDING_DATA[i].id === buildingId) {
            bData = BUILDING_DATA[i];
            break;
        }
    }
    if (!bData) return;

    introTitle.textContent = bData.name;
    var intro = BUILDING_INTRO[buildingId] || {};
    var typeName = TYPE_NAME_MAP[bData.type] || '其他';
    var cfg = TYPE_CONFIG[bData.type] || TYPE_CONFIG.teaching;

    var previewCanvas = generateBuildingPreview(bData, cfg);
    var previewDataUrl = previewCanvas.toDataURL('image/png');

    var html = '<button class="intro-back-btn" id="intro-back-btn">← 返回列表</button>'
        + '<div class="intro-card">'
        + '  <div class="intro-card-image">'
        + '    <img src="' + previewDataUrl + '" alt="' + bData.name + '">'
        + '  </div>'
        + '  <div class="intro-card-content">'
        + '    <div class="intro-card-name">' + bData.name + '</div>'
        + '    <div class="intro-card-id">' + bData.id + '</div>'
        + '    <div class="intro-card-desc">' + (intro.desc || '暂无介绍信息') + '</div>'
        + '    <div class="intro-card-meta">';

    if (intro.area && intro.area !== '-') {
        html += '<span class="intro-meta-tag">面积: ' + intro.area + '</span>';
    }
    if (intro.floors && intro.floors !== '-') {
        html += '<span class="intro-meta-tag">楼层: ' + intro.floors + '</span>';
    }
    if (intro.built && intro.built !== '-') {
        html += '<span class="intro-meta-tag">建成: ' + intro.built + '</span>';
    }
    html += '<span class="intro-meta-tag">' + typeName + '</span>';
    html += '    </div>'
        + '  </div>'
        + '</div>';

    introBody.innerHTML = html;

    document.getElementById('intro-back-btn').addEventListener('click', function() {
        showBuildingList();
    });
}

function generateBuildingPreview(bData, cfg) {
    var canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    var ctx = canvas.getContext('2d');

    var skyGrad = ctx.createLinearGradient(0, 0, 0, 200);
    skyGrad.addColorStop(0, '#5BA3E6');
    skyGrad.addColorStop(1, '#B8D9F2');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 640, 240);

    var groundGrad = ctx.createLinearGradient(0, 240, 0, 360);
    groundGrad.addColorStop(0, '#5DAE5D');
    groundGrad.addColorStop(1, '#3D8E3D');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 240, 640, 120);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (var ci = 0; ci < 4; ci++) {
        var cx = 80 + ci * 160;
        var cy = 40 + ci * 15;
        drawCloud(ctx, cx, cy, 40 + ci * 5);
    }

    var bx = 180;
    var by = 240;
    var bw = 280;
    var bh = Math.min(cfg.h * 18, 200);
    var bd = cfg.d * 8;

    if (bData.type === 'track' || bData.type === 'tennis') {
        drawFieldPreview(ctx, bData, cfg);
    } else {
        drawBuildingPreviewShape(ctx, bx, by, bw, bh, bd, cfg, bData);
    }

    ctx.font = 'bold 28px Microsoft YaHei, PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(bData.name, 322, 340);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(bData.name, 320, 338);

    return canvas;
}

function drawCloud(ctx, x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.35, y - size * 0.15, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.7, y, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
}

function drawBuildingPreviewShape(ctx, bx, by, bw, bh, bd, cfg, bData) {
    var r = (cfg.color >> 16) & 0xFF;
    var g = (cfg.color >> 8) & 0xFF;
    var b = cfg.color & 0xFF;

    ctx.fillStyle = 'rgba(' + Math.max(0,r-40) + ',' + Math.max(0,g-40) + ',' + Math.max(0,b-40) + ',0.3)';
    ctx.beginPath();
    ctx.moveTo(bx + bw, by - bh);
    ctx.lineTo(bx + bw + bd * 0.5, by - bh - bd * 0.3);
    ctx.lineTo(bx + bw + bd * 0.5, by - bd * 0.3);
    ctx.lineTo(bx + bw, by);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(' + Math.max(0,r-30) + ',' + Math.max(0,g-30) + ',' + Math.max(0,b-30) + ',0.5)';
    ctx.beginPath();
    ctx.moveTo(bx, by - bh);
    ctx.lineTo(bx + bd * 0.5, by - bh - bd * 0.3);
    ctx.lineTo(bx + bw + bd * 0.5, by - bh - bd * 0.3);
    ctx.lineTo(bx + bw, by - bh);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.fillRect(bx, by - bh, bw, bh);

    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by - bh, bw, bh);

    if (cfg.floors > 0 && cfg.cols > 0) {
        var floorH = bh / cfg.floors;
        var winW = bw / (cfg.cols * 2 + 1);
        var winH = floorH * 0.5;

        for (var row = 0; row < cfg.floors; row++) {
            var wy = by - bh + row * floorH + floorH * 0.25;
            for (var col = 0; col < cfg.cols; col++) {
                var wx = bx + winW + col * (winW + winW);

                var winGrad = ctx.createLinearGradient(wx, wy, wx + winW, wy + winH);
                winGrad.addColorStop(0, 'rgba(80,140,200,0.85)');
                winGrad.addColorStop(1, 'rgba(120,180,240,0.85)');
                ctx.fillStyle = winGrad;
                ctx.fillRect(wx, wy, winW, winH);

                ctx.strokeStyle = 'rgba(60,60,80,0.3)';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(wx, wy, winW, winH);
            }

            ctx.strokeStyle = 'rgba(0,0,0,0.06)';
            ctx.beginPath();
            ctx.moveTo(bx, by - bh + (row + 1) * floorH);
            ctx.lineTo(bx + bw, by - bh + (row + 1) * floorH);
            ctx.stroke();
        }
    }

    ctx.fillStyle = 'rgba(80,80,80,0.8)';
    ctx.fillRect(bx - 2, by - bh - 6, bw + 4, 8);
}

function drawFieldPreview(ctx, bData, cfg) {
    var fx = 170, fy = 180, fw = 300, fh = 100;

    if (bData.type === 'track') {
        ctx.fillStyle = '#C04040';
        ctx.fillRect(fx, fy, fw, fh);

        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(fx + 30, fy + 15, fw - 60, fh - 30);

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(fx + 5, fy + 5, fw - 10, fh - 10);
    } else {
        ctx.fillStyle = '#4B90D9';
        ctx.fillRect(fx, fy, fw, fh);

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(fx + 10, fy + 10, fw - 20, fh - 20);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(fx + fw / 2 - 1, fy, 2, fh);
    }
}

function focusToBuildingById(buildingId) {
    for (var i = 0; i < BUILDING_DATA.length; i++) {
        if (BUILDING_DATA[i].id === buildingId) {
            var b = BUILDING_DATA[i];
            var pos = new THREE.Vector3(b.x * SCALE, 0, b.z * SCALE);
            focusOnPosition(pos);
            break;
        }
    }
}

function bindEvents() {
    window.addEventListener('resize', onWindowResize, false);

    document.getElementById('btn-perspective').addEventListener('click', function() {
        toggleView('perspective');
    });
    document.getElementById('btn-birdview').addEventListener('click', function() {
        toggleView('bird');
    });

    document.getElementById('btn-toggle-labels').addEventListener('click', function() {
        toggleLabels();
    });

    document.getElementById('btn-reset').addEventListener('click', function() {
        resetView();
    });

    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mouseleave', onMouseLeave, false);
    window.addEventListener('dblclick', onMouseDoubleClick, false);

    var canvas = renderer.domElement;
    canvas.addEventListener('mousedown', function(event) {
        // 先检查是否点击了人物
        if (onCharacterClick(event)) {
            return;
        }
        // 如果没有点击人物，继续处理AI模型拖拽
        onModelMouseDown(event);
    }, false);
    canvas.addEventListener('mousemove', onModelMouseMove, false);
    canvas.addEventListener('mouseup', onModelMouseUp, false);
    canvas.addEventListener('wheel', onModelWheel, { passive: false });

    window.addEventListener('keydown', function(e) {
        onModelKeyDown(e);

        // 人物键盘控制
        if (selectedCharacter === 'girl') {
            // 女生用方向键控制
            switch(e.code) {
                case 'ArrowUp': girlMoveState.forward = true; e.preventDefault(); break;
                case 'ArrowDown': girlMoveState.backward = true; e.preventDefault(); break;
                case 'ArrowLeft': girlMoveState.left = true; e.preventDefault(); break;
                case 'ArrowRight': girlMoveState.right = true; e.preventDefault(); break;
            }
        } else if (selectedCharacter === 'boy') {
            // 男生用WASD控制
            switch(e.code) {
                case 'KeyW': boyMoveState.forward = true; break;
                case 'KeyS': boyMoveState.backward = true; break;
                case 'KeyA': boyMoveState.left = true; break;
                case 'KeyD': boyMoveState.right = true; break;
            }
        } else if (selectedCharacter === null) {
            // 未选中人物时，方向键/WASD控制相机视角（仅在perspective模式）
            if (currentView !== 'perspective') return;
            switch(e.code) {
                case 'ArrowUp':
                case 'KeyW': moveState.forward = true; break;
                case 'ArrowDown':
                case 'KeyS': moveState.backward = true; break;
                case 'ArrowLeft':
                case 'KeyA': moveState.left = true; break;
                case 'ArrowRight':
                case 'KeyD': moveState.right = true; break;
            }
        }
    });

    window.addEventListener('keyup', function(e) {
        // 人物键盘控制释放
        if (selectedCharacter === 'girl') {
            switch(e.code) {
                case 'ArrowUp': girlMoveState.forward = false; break;
                case 'ArrowDown': girlMoveState.backward = false; break;
                case 'ArrowLeft': girlMoveState.left = false; break;
                case 'ArrowRight': girlMoveState.right = false; break;
            }
        } else if (selectedCharacter === 'boy') {
            switch(e.code) {
                case 'KeyW': boyMoveState.forward = false; break;
                case 'KeyS': boyMoveState.backward = false; break;
                case 'KeyA': boyMoveState.left = false; break;
                case 'KeyD': boyMoveState.right = false; break;
            }
        } else if (selectedCharacter === null) {
            // 相机视角控制释放
            switch(e.code) {
                case 'ArrowUp':
                case 'KeyW': moveState.forward = false; break;
                case 'ArrowDown':
                case 'KeyS': moveState.backward = false; break;
                case 'ArrowLeft':
                case 'KeyA': moveState.left = false; break;
                case 'ArrowRight':
                case 'KeyD': moveState.right = false; break;
            }
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

var lastFrameTime = Date.now();

function animate() {
    requestAnimationFrame(animate);

    var now = Date.now();
    var delta = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    if (currentView === 'perspective') {
        updateHumanMovement();
    } else {
        controls.update();
    }

    updateWeatherTransition(delta);
    updateRain();
    updateSnow();
    updateVehicles(delta);
    updatePedestrians(delta);
    updateCharacterMovement(delta); // 键盘控制人物移动
    updateTrackRunner(delta);

    if (selectionBoxDirty && selectedAIModel) {
        updateSelectionBox();
    }

    renderer.render(scene, camera);
}

function updateHumanMovement() {
    if (moveState.left) {
        camera.rotation.y -= rotateSpeed;
    }
    if (moveState.right) {
        camera.rotation.y += rotateSpeed;
    }

    if (moveState.forward || moveState.backward) {
        var direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        direction.y = 0;
        direction.normalize();

        var step = moveState.forward ? moveSpeed : -moveSpeed;
        camera.position.addScaledVector(direction, step);
    }
}

function toggleView(mode) {
    if (currentView === mode) return;
    currentView = mode;

    document.getElementById('btn-perspective').classList.toggle('active', mode === 'perspective');
    document.getElementById('btn-birdview').classList.toggle('active', mode === 'bird');

    if (mode === 'perspective') {
        camera = perspectiveCamera;
        controls.enabled = false;

        camera.position.set(0, 2.5, -60);
        camera.rotation.set(0, Math.PI, 0);
        camera.lookAt(0, 2.5, -30);
    } else {
        camera = birdCamera;
        controls.object = camera;
        controls.enabled = true;

        controls.enableRotate = true;
        controls.maxPolarAngle = Math.PI / 2.1;

        camera.position.set(0, 80, -100);
        controls.target.set(0, 0, -30);
    }

    if (controls.enabled) controls.update();
    console.log('视角已切换至:', mode === 'perspective' ? '人眼透视 (键盘控制)' : '自由鸟瞰 (鼠标控制)');
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (!isAnimating) {
        updateHover();
    }
}

function onMouseLeave(event) {
    // 鼠标离开窗口时隐藏对话气泡
    hideSpeechBubble();
}

function updateHover() {
    raycaster.setFromCamera(mouse, camera);

    if (isDraggingModel) return;

    // 首先检查人物模型悬停（优先处理）
    if (checkPedestrianHover({ clientX: (mouse.x + 1) / 2 * window.innerWidth, clientY: (-mouse.y + 1) / 2 * window.innerHeight })) {
        return;
    }

    // 如果没有悬停在人物上，隐藏气泡
    if (currentHoveredCharacter) {
        hideSpeechBubble();
    }

    var aiIntersects = raycaster.intersectObjects(aiModelsGroup.children, true);
    if (aiIntersects.length > 0) {
        var aiModel = findAIModelParent(aiIntersects[0].object);
        if (aiModel) {
            restoreHoveredColor();
            if (aiModel === selectedAIModel) {
                document.body.style.cursor = 'grab';
            } else {
                document.body.style.cursor = 'pointer';
            }
            return;
        }
    }

    var intersects = raycaster.intersectObjects(buildingsGroup.children, true);

    if (intersects.length > 0) {
        var object = intersects[0].object;

        if (object.userData.isBuildingBody) {
            if (hoveredObject !== object) {
                restoreHoveredColor();

                hoveredObject = object;
                var mats = Array.isArray(object.material) ? object.material : [object.material];
                for (var mi = 0; mi < mats.length; mi++) {
                    if (mats[mi].color) {
                        mats[mi].color.set(HIGHLIGHT_COLOR);
                    }
                }
                document.body.style.cursor = 'pointer';
            }
        } else {
            restoreHoveredColor();
        }
    } else {
        restoreHoveredColor();
    }
}

function restoreHoveredColor() {
    if (hoveredObject) {
        var mats = Array.isArray(hoveredObject.material) ? hoveredObject.material : [hoveredObject.material];
        for (var i = 0; i < mats.length; i++) {
            if (mats[i].color) {
                mats[i].color.copy(hoveredObject.userData.originalColor);
            }
        }
        hoveredObject = null;
        document.body.style.cursor = 'default';
    }
}

function onMouseDoubleClick(event) {
    if (isAnimating) return;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(buildingsGroup.children, true);

    if (intersects.length > 0) {
        var object = intersects[0].object;
        if (object.userData.isBuildingBody) {
            var targetGroup = object.userData.parentGroup;
            focusOnBuilding(targetGroup);

            var buildingId = findBuildingIdByName(targetGroup.name);
            if (buildingId) {
                var introPanel = document.getElementById('intro-panel');
                introPanel.style.display = 'flex';
                showBuildingDetail(buildingId);
            }
        }
    }
}

function findBuildingIdByName(name) {
    for (var i = 0; i < BUILDING_DATA.length; i++) {
        if (BUILDING_DATA[i].name === name) {
            return BUILDING_DATA[i].id;
        }
    }
    return null;
}

function focusOnBuilding(buildingGroup) {
    if (isAnimating) return;

    var targetPos = new THREE.Vector3();
    buildingGroup.getWorldPosition(targetPos);

    var offset = new THREE.Vector3(0, 15, -30);
    var newCameraPos = targetPos.clone().add(offset);

    animateCamera(newCameraPos, targetPos);
}

function animateCamera(targetPosition, targetLookAt) {
    isAnimating = true;

    if (currentView === 'perspective') {
        toggleView('bird');
    }

    var startPosition = camera.position.clone();
    var startTarget = controls.target.clone();

    var duration = 1000;
    var startTime = Date.now();

    function update() {
        var elapsed = Date.now() - startTime;
        var progress = Math.min(elapsed / duration, 1);

        var easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
        controls.target.lerpVectors(startTarget, targetLookAt, easeProgress);

        controls.update();

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            isAnimating = false;
        }
    }

    update();
}

function resetView() {
    if (isAnimating) return;

    buildingsGroup.traverse(function(child) {
        if (child.isMesh && child.userData.isBuildingBody) {
            var mats = Array.isArray(child.material) ? child.material : [child.material];
            for (var i = 0; i < mats.length; i++) {
                if (mats[i].color && child.userData.originalColor) {
                    mats[i].color.copy(child.userData.originalColor);
                }
            }
        }
    });

    if (currentView === 'perspective') {
        controls.enabled = true;
    }

    var initialPos = new THREE.Vector3(0, 2.5, -60);
    var initialTarget = new THREE.Vector3(0, 2.5, -30);
    animateCamera(initialPos, initialTarget);

    setTimeout(function() {
        if (currentView !== 'perspective') {
            toggleView('perspective');
        }
    }, 1100);

    console.log('视角已重置');
}

function toggleLabels() {
    labelsVisible = !labelsVisible;
    labelsGroup.visible = labelsVisible;

    var btn = document.getElementById('btn-toggle-labels');
    if (labelsVisible) {
        btn.textContent = '隐藏标签';
        btn.classList.add('active');
    } else {
        btn.textContent = '显示标签';
        btn.classList.remove('active');
    }
    console.log('标签状态:', labelsVisible ? '显示' : '隐藏');
}

function toggleLayer(groupName, visible) {
    var groupMap = {
        buildings: buildingsGroup,
        trees: treesGroup,
        roads: roadsGroup,
        aiModels: aiModelsGroup
    };
    if (groupMap[groupName]) {
        groupMap[groupName].visible = visible;
    }
}

init();
