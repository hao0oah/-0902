export interface NiceClassInfo {
  classNum: number;
  code: string; // e.g. "01", "21"
  title: string;
  category: 'goods' | 'services'; // 商品类 01-34, 服务类 35-45
  shortName: string;
  description: string;
  keywords: string[];
  isCore?: boolean;
}

export const ALL_45_NICE_CLASSES: NiceClassInfo[] = [
  {
    classNum: 1,
    code: '01',
    title: '第01类 化学原料',
    shortName: '化学原料',
    category: 'goods',
    description: '工业、科学、农业用化学品，未加工人造树脂，未加工塑料，肥料，灭火剂，工业粘合剂',
    keywords: ['化学原料', '树脂', '塑料原料', '肥料', '工业粘合剂', '化工', '01', '1']
  },
  {
    classNum: 2,
    code: '02',
    title: '第02类 颜料油漆',
    shortName: '颜料油漆',
    category: 'goods',
    description: '颜料，清漆，漆，防锈剂，木材防腐剂，染料，着色剂，印刷油墨',
    keywords: ['颜料', '油漆', '清漆', '防锈剂', '染料', '涂料', '油墨', '02', '2']
  },
  {
    classNum: 3,
    code: '03',
    title: '第03类 日化用品',
    shortName: '日化用品',
    category: 'goods',
    isCore: true,
    description: '牙膏、漱口水、洁齿剂、口腔喷雾、洗面奶、护肤品、洗发水、沐浴露、化妆品、香水、清洁制剂',
    keywords: ['牙膏', '漱口水', '洁齿剂', '口腔喷雾', '化妆品', '洗发水', '护肤品', '日化', '香水', '03', '3']
  },
  {
    classNum: 4,
    code: '04',
    title: '第04类 燃料油脂',
    shortName: '燃料油脂',
    category: 'goods',
    description: '工业用油和油脂，蜡，润滑剂，燃料，照明材料，蜡烛和灯芯',
    keywords: ['燃料', '油脂', '润滑油', '蜡烛', '汽油', '工业油', '04', '4']
  },
  {
    classNum: 5,
    code: '05',
    title: '第05类 医药卫生',
    shortName: '医药卫生',
    category: 'goods',
    isCore: true,
    description: '药品、医用漱口水、医用洁牙剂、医用和兽医用制剂、医用卫生品、消毒剂、医用营养品、婴儿食品',
    keywords: ['药品', '医药', '医用漱口水', '消毒剂', '卫生品', '营养品', '中药', '05', '5']
  },
  {
    classNum: 6,
    code: '06',
    title: '第06类 金属材料',
    shortName: '金属材料',
    category: 'goods',
    description: '普通金属及其合金，金属建筑材料，金属五金器具，金属管道，金属门窗配件',
    keywords: ['金属', '合金', '五金', '金属管', '锁具', '金属建材', '06', '6']
  },
  {
    classNum: 7,
    code: '07',
    title: '第07类 机械设备',
    shortName: '机械设备',
    category: 'goods',
    description: '机械，机床，马达和引擎，电动清洗机，泵，非手动农业器具，电动工具',
    keywords: ['机械', '设备', '机床', '马达', '电动清洗机', '泵', '电动工具', '07', '7']
  },
  {
    classNum: 8,
    code: '08',
    title: '第08类 手工器械',
    shortName: '手工器械',
    category: 'goods',
    description: '手动工具和器具，刀剪叉餐具，剃刀，修甲工具，随身工具',
    keywords: ['手工具', '剪刀', '剃须刀', '修甲', '刀叉', '手动器械', '08', '8']
  },
  {
    classNum: 9,
    code: '09',
    title: '第09类 科学仪器',
    shortName: '科学仪器',
    category: 'goods',
    isCore: true,
    description: '电子计算机、智能硬件、智能刷牙传感器、口腔健康APP、芯片、显示屏、测量仪器、充电底座',
    keywords: ['科学仪器', '智能硬件', 'APP软件', '芯片', '传感器', '充电座', '数码', '09', '9']
  },
  {
    classNum: 10,
    code: '10',
    title: '第10类 医疗器械',
    shortName: '医疗器械',
    category: 'goods',
    isCore: true,
    description: '医用超声洁牙仪、牙科设备及仪器、正畸矫正器具、医用牙齿美白仪、消毒器械、理疗设备',
    keywords: ['医疗器械', '牙科设备', '正畸器具', '医用洁牙机', '牙齿美白仪', '医疗', '10']
  },
  {
    classNum: 11,
    code: '11',
    title: '第11类 灯具空调',
    shortName: '灯具空调',
    category: 'goods',
    isCore: true,
    description: '照明设备、牙刷紫外线杀菌盒、浴室智能烘干消毒架、空气净化器、加热装置、水暖设备',
    keywords: ['照明', '杀菌盒', '消毒架', '烘干', '灯具', '空调', '空气净化', '11']
  },
  {
    classNum: 12,
    code: '12',
    title: '第12类 运输工具',
    shortName: '运输工具',
    category: 'goods',
    description: '运载工具，陆、空、海用运载装置，电动车，自行车，汽车及零部件',
    keywords: ['运输工具', '汽车', '电动车', '自行车', '运载工具', '12']
  },
  {
    classNum: 13,
    code: '13',
    title: '第13类 烟花爆竹',
    shortName: '烟花爆竹',
    category: 'goods',
    description: '火器，军火及弹药，爆炸物，烟火、烟花爆竹',
    keywords: ['烟花', '爆竹', '军火', '炸药', '13']
  },
  {
    classNum: 14,
    code: '14',
    title: '第14类 珠宝钟表',
    shortName: '珠宝钟表',
    category: 'goods',
    description: '贵金属及其合金，首饰、珠宝饰品、宝石，钟表和计时仪器',
    keywords: ['珠宝', '首饰', '钟表', '手表', '项链', '贵金属', '14']
  },
  {
    classNum: 15,
    code: '15',
    title: '第15类 乐器乐具',
    shortName: '乐器乐具',
    category: 'goods',
    description: '乐器，乐谱架和乐器支架，指挥棒，乐器配件及琴弦',
    keywords: ['乐器', '吉他', '钢琴', '小提琴', '乐谱架', '15']
  },
  {
    classNum: 16,
    code: '16',
    title: '第16类 办公文具',
    shortName: '办公文具',
    category: 'goods',
    description: '纸和纸板，印刷品，装订用品，照片，文具及办公用品，包装用纸及塑料袋',
    keywords: ['文具', '办公用品', '印刷品', '包装袋', '纸张', '笔记本', '16']
  },
  {
    classNum: 17,
    code: '17',
    title: '第17类 橡胶制品',
    shortName: '橡胶制品',
    category: 'goods',
    description: '未加工及半加工橡胶、树胶，绝缘材料，密封件，塑料软管',
    keywords: ['橡胶', '密封圈', '绝缘材料', '软管', '胶带', '17']
  },
  {
    classNum: 18,
    code: '18',
    title: '第18类 皮革皮具',
    shortName: '皮革皮具',
    category: 'goods',
    description: '皮革和人造皮革，旅行包、收纳包、背包、手提包、钱包、行李箱、雨伞',
    keywords: ['皮革', '背包', '收纳包', '行李箱', '钱包', '手提包', '雨伞', '18']
  },
  {
    classNum: 19,
    code: '19',
    title: '第19类 建筑材料',
    shortName: '建筑材料',
    category: 'goods',
    description: '非金属建筑材料，建筑用非金属刚性管，柏油、沥青，石材、水泥、瓷砖',
    keywords: ['建材', '非金属建材', '石材', '水泥', '瓷砖', '沥青', '19']
  },
  {
    classNum: 20,
    code: '20',
    title: '第20类 家具工艺',
    shortName: '家具工艺',
    category: 'goods',
    description: '家具，镜子，相框，收纳盒，未加工或半加工的骨、角、象牙，塑料五金配件',
    keywords: ['家具', '镜子', '相框', '收纳盒', '置物架', '桌椅', '20']
  },
  {
    classNum: 21,
    code: '21',
    title: '第21类 厨房洁具与牙刷器皿',
    shortName: '厨房洁具与牙刷器皿',
    category: 'goods',
    isCore: true,
    description: '电动牙刷、声波牙刷、手动牙刷、冲牙器、牙线棒、洁齿喷嘴、刷头、漱口杯、化妆用具、清洁器具',
    keywords: ['电动牙刷', '牙刷', '冲牙器', '牙线', '牙刷刷头', '漱口杯', '洁具', '洁齿器', '21']
  },
  {
    classNum: 22,
    code: '22',
    title: '第22类 绳网袋篷',
    shortName: '绳网袋篷',
    category: 'goods',
    description: '绳和绳索，网，帐篷和防水遮布，帆，运输和贮存散装物用袋，衬垫及填充料',
    keywords: ['绳索', '帐篷', '网', '防水布', '帆布袋', '22']
  },
  {
    classNum: 23,
    code: '23',
    title: '第23类 纺织用纱',
    shortName: '纺织用纱',
    category: 'goods',
    description: '纺织用纱和线，刺绣用线，编织用纱',
    keywords: ['纱线', '纺织用线', '丝线', '毛线', '23']
  },
  {
    classNum: 24,
    code: '24',
    title: '第24类 布料床品',
    shortName: '布料床品',
    category: 'goods',
    description: '织物及其替代品，家庭日用纺织品，床上用品、桌布、毛巾、浴巾、窗帘',
    keywords: ['布料', '毛巾', '浴巾', '床上用品', '床单', '纺织品', '24']
  },
  {
    classNum: 25,
    code: '25',
    title: '第25类 服装鞋帽',
    shortName: '服装鞋帽',
    category: 'goods',
    description: '服装，鞋，帽子，袜子，手套，内衣，运动服饰，配饰',
    keywords: ['服装', '鞋子', '帽子', '袜子', '内衣', '运动服', '25']
  },
  {
    classNum: 26,
    code: '26',
    title: '第26类 钮扣拉链',
    shortName: '钮扣拉链',
    category: 'goods',
    description: '花边，饰带和刺绣品，钮扣，拉链，饰针和缝针，假发，发饰、发夹',
    keywords: ['钮扣', '拉链', '发饰', '发夹', '假发', '刺绣配件', '26']
  },
  {
    classNum: 27,
    code: '27',
    title: '第27类 地毯席垫',
    shortName: '地毯席垫',
    category: 'goods',
    description: '地毯，地垫，席类，浴室防滑垫，地板覆盖物，非纺织品壁纸',
    keywords: ['地毯', '地垫', '防滑垫', '席子', '墙纸', '27']
  },
  {
    classNum: 28,
    code: '28',
    title: '第28类 健身玩具',
    shortName: '健身玩具',
    category: 'goods',
    description: '游戏器具和玩具，潮玩盲盒，手办公仔，体育和健身器材，节日装饰品',
    keywords: ['玩具', '潮玩', '盲盒', '手办', '健身器材', '运动用品', '28']
  },
  {
    classNum: 29,
    code: '29',
    title: '第29类 食品生鲜',
    shortName: '食品生鲜',
    category: 'goods',
    description: '肉，鱼，即食燕窝，加工坚果，果干，蛋，奶制品，食用油，熟食制品',
    keywords: ['食品', '即食燕窝', '滋补品', '奶制品', '肉类', '食用油', '坚果', '29']
  },
  {
    classNum: 30,
    code: '30',
    title: '第30类 方便食品',
    shortName: '方便食品',
    category: 'goods',
    description: '咖啡，茶，糕点，糖果，美齿糖，燕窝饮品，蜂蜜，调味品，谷物食品',
    keywords: ['咖啡', '茶', '美齿糖', '糖果', '燕窝饮', '蜂蜜', '糕点', '调味品', '30']
  },
  {
    classNum: 31,
    code: '31',
    title: '第31类 农林生鲜',
    shortName: '农林生鲜',
    category: 'goods',
    description: '农业、水产养殖、园艺产品，未加工谷物，新鲜水果和蔬菜，活动物，宠物食品',
    keywords: ['农产品', '水果', '蔬菜', '谷物', '生鲜', '宠物食品', '31']
  },
  {
    classNum: 32,
    code: '32',
    title: '第32类 啤酒饮料',
    shortName: '啤酒饮料',
    category: 'goods',
    description: '啤酒，无酒精饮料，矿泉水，果汁，苏打水，植物饮料，能量饮料',
    keywords: ['啤酒', '饮料', '矿泉水', '果汁', '苏打水', '气泡水', '32']
  },
  {
    classNum: 33,
    code: '33',
    title: '第33类 酒类饮品',
    shortName: '酒类饮品',
    category: 'goods',
    description: '含酒精饮料（啤酒除外），白酒，红酒，威士忌，白兰地，果酒，鸡尾酒',
    keywords: ['白酒', '红酒', '葡萄酒', '威士忌', '酒精饮料', '33']
  },
  {
    classNum: 34,
    code: '34',
    title: '第34类 烟草烟具',
    shortName: '烟草烟具',
    category: 'goods',
    description: '烟草和烟草替代品，电子烟，吸烟用具，烟斗，火柴',
    keywords: ['烟草', '电子烟', '打火机', '烟具', '香烟', '34']
  },
  {
    classNum: 35,
    code: '35',
    title: '第35类 广告销售',
    shortName: '广告销售',
    category: 'services',
    isCore: true,
    description: '广告宣传、在线电商市场、商业管理、日用品零售与批发、替他人推销、特许经营商业管理',
    keywords: ['广告', '电商', '线上商城', '零售', '批发', '营销', '商业管理', '35']
  },
  {
    classNum: 36,
    code: '36',
    title: '第36类 金融物管',
    shortName: '金融物管',
    category: 'services',
    description: '保险，金融事务，货币事务，不动产事务，基金投资，信托服务',
    keywords: ['金融', '保险', '理财', '投资', '房产', '信托', '36']
  },
  {
    classNum: 37,
    code: '37',
    title: '第37类 建筑修理',
    shortName: '建筑修理',
    category: 'services',
    description: '房屋建筑，电器设备安装与修理，电动牙刷售后维修，清洗保养服务',
    keywords: ['维修', '售后维修', '安装', '建筑', '保养', '清洁维护', '37']
  },
  {
    classNum: 38,
    code: '38',
    title: '第38类 电信通信',
    shortName: '电信通信',
    category: 'services',
    description: '电信服务，信息传送，电子公告牌服务，网络通信，数据传输',
    keywords: ['电信', '通信', '网络传输', '广播', '信息传送', '38']
  },
  {
    classNum: 39,
    code: '39',
    title: '第39类 运输旅行',
    shortName: '运输旅行',
    category: 'services',
    description: '运输，货物包装和贮存，物流仓储，快递配送，旅行安排',
    keywords: ['运输', '物流', '仓储', '快递', '货运', '旅行安排', '39']
  },
  {
    classNum: 40,
    code: '40',
    title: '第40类 材料加工',
    shortName: '材料加工',
    category: 'services',
    description: '材料处理，定制加工，注塑加工，印刷服务，废物回收',
    keywords: ['加工', '定制加工', '材料处理', '印刷', '模具加工', '40']
  },
  {
    classNum: 41,
    code: '41',
    title: '第41类 教育娱乐',
    shortName: '教育娱乐',
    category: 'services',
    description: '教育，培训，口腔健康科普，文体活动组织，数字内容出版，在线研讨会',
    keywords: ['教育', '培训', '科普', '文娱', '研讨会', '出版', '41']
  },
  {
    classNum: 42,
    code: '42',
    title: '第42类 科技研发',
    shortName: '科技研发',
    category: 'services',
    isCore: true,
    description: '电动牙刷工业设计、结构研发、云端算法平台、计算机软件设计与开发、技术研究',
    keywords: ['科技研发', '工业设计', '软件开发', '云服务', '算法', '技术服务', '42']
  },
  {
    classNum: 43,
    code: '43',
    title: '第43类 餐饮住宿',
    shortName: '餐饮住宿',
    category: 'services',
    description: '提供食物和饮料服务，餐厅，茶馆，咖啡馆，酒店住宿，临时住宿',
    keywords: ['餐饮', '餐厅', '酒店', '住宿', '咖啡馆', '茶饮', '43']
  },
  {
    classNum: 44,
    code: '44',
    title: '第44类 医疗园艺',
    shortName: '医疗园艺',
    category: 'services',
    isCore: true,
    description: '口腔健康咨询、数字化牙科诊疗、牙齿美白护理、医疗卫生与美容服务、健康管理',
    keywords: ['口腔门诊', '牙科诊所', '牙齿护理', '医疗服务', '美容健康', '44']
  },
  {
    classNum: 45,
    code: '45',
    title: '第45类 法律安全',
    shortName: '法律安全',
    category: 'services',
    description: '法律服务、商标版权知识产权维权、安全监控服务、社交交友服务',
    keywords: ['法律服务', '知识产权维权', '商标维权', '安全监控', '社交', '45']
  }
];

export function parseItemClasses(classesStr?: string): number[] {
  if (!classesStr) return [];
  const numbers = classesStr.match(/\d+/g);
  return numbers ? numbers.map(Number) : [];
}

export function isItemInSelectedClasses(classesStr: string | undefined, selectedClasses: number[]): boolean {
  if (!selectedClasses || selectedClasses.length === 0) return true;
  const itemClassNums = parseItemClasses(classesStr);
  return selectedClasses.some(cls => itemClassNums.includes(cls));
}
