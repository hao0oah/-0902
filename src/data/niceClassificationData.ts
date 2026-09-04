export interface NiceClassificationItem {
  id: string;
  classNum: number;             // 尼斯分类类别 (1 - 45)
  classTitle: string;           // 类别标题 (例如: 第21类 厨房洁具与日用器皿)
  categoryType: 'GOODS' | 'SERVICE'; // 商品 / 服务
  groupCode: string;            // 类似群组编码 (例如: 2108, 2106, 0306, 1004...)
  groupName: string;            // 类似群组名称 (例如: 刷子及制刷材料, 家庭日用及卫生器具...)
  itemNameCn: string;           // 商品/服务中文名称 (例如: 电动牙刷, 牙刷刷头...)
  itemNameEn?: string;          // 商品/服务英文名称 (可选)
  itemCode?: string;            // 官方商品规范编码 (可选)
  isCore?: boolean;             // 是否核心关注项目
  importance?: 'CORE' | 'KEY' | 'STANDARD' | 'DEFENSE'; // 保护等级
  notes?: string;               // 审查指南/说明
  status: 'ACTIVE' | 'INACTIVE';
  updatedAt?: string;
}

export interface NiceClassSummary {
  classNum: number;
  classTitle: string;
  categoryType: 'GOODS' | 'SERVICE';
  description: string;
  defaultGroups: { code: string; name: string }[];
}

export const NICE_CLASSES_META: NiceClassSummary[] = [
  // ==================== 1-34类 商品分类 (GOODS) ====================
  { 
    classNum: 1, 
    classTitle: '第01类 - 工业化工与科学原料', 
    categoryType: 'GOODS', 
    description: '用于工业、科学、摄影、农业、园艺和林业的化学品；未加工人造树脂；未加工塑料；灭火和防火用合成物；淬火和焊接用制剂；鞣制动物皮用物质；工业用粘合剂；油灰及其他膏状填料；堆肥、肥料；工业用生物制剂', 
    defaultGroups: [
      { code: '0101', name: '工业气体与基础化学品' },
      { code: '0102', name: '树脂与未加工塑料' },
      { code: '0104', name: '农业用肥料与土壤改良剂' },
      { code: '0109', name: '灭火用合成物与防火剂' },
      { code: '0115', name: '工业用粘合剂与胶水' }
    ] 
  },
  { 
    classNum: 2, 
    classTitle: '第02类 - 颜料油漆与防腐材料', 
    categoryType: 'GOODS', 
    description: '颜料，清漆，漆；防锈剂和木材防腐剂；着色剂，媒染剂；未加工的天然树脂；绘画、装潢、印刷和艺术用金属箔及金属粉', 
    defaultGroups: [
      { code: '0201', name: '染料与着色剂' },
      { code: '0202', name: '油漆与清漆涂料' },
      { code: '0205', name: '防锈剂与木材防腐剂' },
      { code: '0207', name: '印刷油墨与涂层' }
    ] 
  },
  { 
    classNum: 3, 
    classTitle: '第03类 - 日化洗护与牙膏洁齿剂', 
    categoryType: 'GOODS', 
    description: '不含药物的化妆品和梳洗用制剂；不含药物的洁齿剂；香水，精油；洗衣用漂白剂及其他物料；清洁、去光、去渍及研磨用制剂', 
    defaultGroups: [
      { code: '0306', name: '洁齿剂及口腔清新剂' },
      { code: '0301', name: '肥皂与洗涤用品' },
      { code: '0302', name: '清洁去渍制剂' },
      { code: '0305', name: '香水、香精油与化妆品' }
    ] 
  },
  { 
    classNum: 4, 
    classTitle: '第04类 - 工业用油与燃料润滑剂', 
    categoryType: 'GOODS', 
    description: '工业用油和油脂，蜡；润滑剂；吸收、润湿和结合灰尘用配料；燃料和照明物料；照明用蜡烛和灯芯', 
    defaultGroups: [
      { code: '0401', name: '工业用油及润滑油脂' },
      { code: '0402', name: '液体固体燃料与燃气' },
      { code: '0405', name: '照明用蜡烛与灯芯' }
    ] 
  },
  { 
    classNum: 5, 
    classTitle: '第05类 - 医药卫生与医用制剂', 
    categoryType: 'GOODS', 
    description: '药品，医用和兽医用制剂；医用卫生制剂；医用或兽医用营养食物和物质，婴儿食品；人用和动物用膳食补充剂；贴膏，绷敷材料；填塞牙孔用料，牙模用料；消毒剂；消灭有害动物制剂；杀真菌剂，除莠剂', 
    defaultGroups: [
      { code: '0501', name: '药品与医用制剂' },
      { code: '0502', name: '医用营养品与婴儿食品' },
      { code: '0503', name: '净化消毒与卫生杀菌剂' },
      { code: '0506', name: '贴膏、敷料与医用棉签' },
      { code: '0507', name: '牙科用材料与填塞料' }
    ] 
  },
  { 
    classNum: 6, 
    classTitle: '第06类 - 普通金属与五金制品', 
    categoryType: 'GOODS', 
    description: '普通金属及其合金，金属矿石；金属建筑材料；可移动金属建筑物；非电气用金属缆线；金属小五金器具；金属存储和运输用集装箱；保险柜', 
    defaultGroups: [
      { code: '0601', name: '金属合金与原材料' },
      { code: '0603', name: '金属建筑构件与门窗' },
      { code: '0608', name: '金属五金与小五金' },
      { code: '0611', name: '金属缆绳与金属丝' }
    ] 
  },
  { 
    classNum: 7, 
    classTitle: '第07类 - 机械设备与电动工具', 
    categoryType: 'GOODS', 
    description: '机械，机床，电动工具；马达和引擎（陆地车辆用的除外）；机器联结器和传动机件（陆地车辆用的除外）；非手动农业器具；孵卵器；自动售货机', 
    defaultGroups: [
      { code: '0709', name: '电动清洁与清洗机械' },
      { code: '0724', name: '包装机械与封口机' },
      { code: '0748', name: '工业机器人与加工机床' },
      { code: '0752', name: '电子工业制造设备' }
    ] 
  },
  { 
    classNum: 8, 
    classTitle: '第08类 - 手工用具与修护刀剪', 
    categoryType: 'GOODS', 
    description: '手工具和器具（手动的）；刀、叉和勺餐具；随身佩带的武器；剃刀', 
    defaultGroups: [
      { code: '0806', name: '理发与刮胡工具' },
      { code: '0810', name: '指甲修护手工具' },
      { code: '0812', name: '餐具刀叉勺' }
    ] 
  },
  { 
    classNum: 9, 
    classTitle: '第09类 - 智能硬件与软件芯片', 
    categoryType: 'GOODS', 
    description: '科学、研究、导航、测量、摄影、电影、视听、光学、衡具、量具、信号、侦测、测试、检验、救生和教学用装置及仪器；录制、传输、重放声音或影像的装置和仪器；计算机软件；数据处理设备；芯片与传感器', 
    defaultGroups: [
      { code: '0901', name: '计算机软件与电子产品' },
      { code: '0907', name: '智能通讯终端' },
      { code: '0913', name: '传感器与电路元件' },
      { code: '0922', name: '充电座与电池' }
    ] 
  },
  { 
    classNum: 10, 
    classTitle: '第10类 - 医疗器械与牙科设备', 
    categoryType: 'GOODS', 
    description: '外科、医疗、牙科和兽医用仪器及器械；假肢，假眼和假牙；矫形用物品；缝合材料；残疾人专用治疗和辅助设备；按摩器械；婴儿护理用器具；性生活用器具', 
    defaultGroups: [
      { code: '1004', name: '医疗用仪器及器械' },
      { code: '1001', name: '牙科设备及器具' },
      { code: '1002', name: '医用理疗与监护仪器' },
      { code: '1008', name: '医用防护与卫生用品' }
    ] 
  },
  { 
    classNum: 11, 
    classTitle: '第11类 - 消毒灭菌与照明家电', 
    categoryType: 'GOODS', 
    description: '照明、加热、冷却、蒸汽发生、烹饪、干燥、通风、供水以及卫生用装置', 
    defaultGroups: [
      { code: '1104', name: '消毒灭菌器具与紫外线盒' },
      { code: '1101', name: '照明用设备与装置' },
      { code: '1106', name: '饮水与水净化设备' },
      { code: '1109', name: '卫生设备与洁具' }
    ] 
  },
  { 
    classNum: 12, 
    classTitle: '第12类 - 运载工具与交通配件', 
    categoryType: 'GOODS', 
    description: '运载工具；陆、空、水上运载装置', 
    defaultGroups: [
      { code: '1201', name: '运载工具部件与轮胎' },
      { code: '1202', name: '汽车及其配件' },
      { code: '1204', name: '自行车与电动车' }
    ] 
  },
  { 
    classNum: 13, 
    classTitle: '第13类 - 火器烟火与爆炸品', 
    categoryType: 'GOODS', 
    description: '火器；军火及弹药；爆炸物；烟火', 
    defaultGroups: [
      { code: '1301', name: '火器与军火' },
      { code: '1302', name: '烟火与爆竹' }
    ] 
  },
  { 
    classNum: 14, 
    classTitle: '第14类 - 贵金属与钟表首饰', 
    categoryType: 'GOODS', 
    description: '贵金属及其合金；首饰，宝石和半宝石；钟表和计时仪器', 
    defaultGroups: [
      { code: '1401', name: '首饰与珠宝' },
      { code: '1403', name: '宝石与玉器' },
      { code: '1404', name: '钟表与计时器' }
    ] 
  },
  { 
    classNum: 15, 
    classTitle: '第15类 - 乐器与乐器配件', 
    categoryType: 'GOODS', 
    description: '乐器；乐架和乐谱架；指挥棒', 
    defaultGroups: [
      { code: '1501', name: '弦乐与电子乐器' },
      { code: '1502', name: '乐器配件与调音器' }
    ] 
  },
  { 
    classNum: 16, 
    classTitle: '第16类 - 纸品包装与文具办公', 
    categoryType: 'GOODS', 
    description: '纸和纸板；印刷品；装订用品；照片；文具和办公用品（家具除外）；文具用或家庭用粘合剂；绘图用具和艺术家用材料；画笔；教学用品；包装用塑料膜、塑料袋和塑料箔；印刷铅字，印版', 
    defaultGroups: [
      { code: '1601', name: '办公用品与文具' },
      { code: '1605', name: '纸品与卫生用纸' },
      { code: '1609', name: '包装用纸盒与袋' },
      { code: '1611', name: '印刷出版物与画册' }
    ] 
  },
  { 
    classNum: 17, 
    classTitle: '第17类 - 橡胶塑料与绝缘密封', 
    categoryType: 'GOODS', 
    description: '未加工和半加工的橡胶、聚酯、云母及其替代品；生产用成型塑料和树脂制品；包装、填充和绝缘用材料；非金属软管和非金属挠性管', 
    defaultGroups: [
      { code: '1701', name: '橡胶与硅橡胶制品' },
      { code: '1704', name: '绝缘与隔热材料' },
      { code: '1707', name: '非金属软管与管道' }
    ] 
  },
  { 
    classNum: 18, 
    classTitle: '第18类 - 皮革皮具与旅行箱包', 
    categoryType: 'GOODS', 
    description: '皮革和人造皮革；毛皮；行李箱和背包；雨伞和阳伞；手杖；鞭，马具；动物用项圈、皮带和衣服', 
    defaultGroups: [
      { code: '1801', name: '皮革与人造皮革制品' },
      { code: '1802', name: '旅行包与收纳袋' },
      { code: '1804', name: '雨伞与太阳伞' }
    ] 
  },
  { 
    classNum: 19, 
    classTitle: '第19类 - 非金属建材与石材陶瓷', 
    categoryType: 'GOODS', 
    description: '非金属建筑材料；建筑用非金属刚性管；柏油，沥青；可移动非金属建筑物；非金属纪念碑', 
    defaultGroups: [
      { code: '1901', name: '非金属建材与水泥' },
      { code: '1906', name: '建筑石材与瓷砖' },
      { code: '1909', name: '建筑用玻璃' }
    ] 
  },
  { 
    classNum: 20, 
    classTitle: '第20类 - 家具镜子与收纳制品', 
    categoryType: 'GOODS', 
    description: '家具，镜子，相框；未加工或半加工的骨、角、象牙、鲸骨或珍珠母；贝壳；海泡石；黄琥珀；存储或运输用非金属容器', 
    defaultGroups: [
      { code: '2001', name: '家具与镜子' },
      { code: '2005', name: '塑料收纳盒与容器' },
      { code: '2014', name: '枕头与垫类' }
    ] 
  },
  { 
    classNum: 21, 
    classTitle: '第21类 - 厨房洁具与牙刷器具', 
    categoryType: 'GOODS', 
    description: '家用或厨房用器具和容器；烹事用具和餐具（刀、叉、勺除外）；梳子和海绵；刷子（画笔除外）；制刷材料；清洁用具；未加工或半加工玻璃；玻璃器皿、瓷器和陶器', 
    defaultGroups: [
      { code: '2108', name: '刷子及制刷材料 (电动牙刷)' },
      { code: '2106', name: '家庭日用及卫生器具 (冲牙器/牙线)' },
      { code: '2101', name: '厨房及餐具 (漱口杯)' },
      { code: '2110', name: '化妆用具与美妆蛋' }
    ] 
  },
  { 
    classNum: 22, 
    classTitle: '第22类 - 绳网袋类与帐篷帆布', 
    categoryType: 'GOODS', 
    description: '绳索和细绳；网；帐篷和防水遮布；纺织品或合成材料制遮篷；帆；运输和贮存散装物用麻袋；填充和衬垫用材料；未加工纺织纤维及其替代品', 
    defaultGroups: [
      { code: '2201', name: '绳索与细绳' },
      { code: '2202', name: '网类与防护网' },
      { code: '2203', name: '帐篷与遮阳篷' },
      { code: '2204', name: '运输包装袋' }
    ] 
  },
  { 
    classNum: 23, 
    classTitle: '第23类 - 纺织用纱线与缝纫线', 
    categoryType: 'GOODS', 
    description: '纺织用纱和线', 
    defaultGroups: [
      { code: '2301', name: '纺织用纱线' },
      { code: '2302', name: '缝纫线与绣花线' }
    ] 
  },
  { 
    classNum: 24, 
    classTitle: '第24类 - 纺织织物与毛巾家纺', 
    categoryType: 'GOODS', 
    description: '织物及其替代品；家庭日用纺织品；纺织品制或塑料制帘', 
    defaultGroups: [
      { code: '2401', name: '纺织织物与面料' },
      { code: '2405', name: '毛巾、浴巾与擦拭布' },
      { code: '2406', name: '床上用品与被褥' }
    ] 
  },
  { 
    classNum: 25, 
    classTitle: '第25类 - 服装鞋帽与运动服饰', 
    categoryType: 'GOODS', 
    description: '服装，鞋，帽', 
    defaultGroups: [
      { code: '2501', name: '衣物与外衣' },
      { code: '2507', name: '鞋类' },
      { code: '2508', name: '帽子与头饰' },
      { code: '2511', name: '袜子' }
    ] 
  },
  { 
    classNum: 26, 
    classTitle: '第26类 - 饰品配件与纽扣拉链', 
    categoryType: 'GOODS', 
    description: '花边，饰带和刺绣品，服饰用带和弓形带；纽扣，钩扣，扣眼；别针和缝针；人造花；发饰；假发', 
    defaultGroups: [
      { code: '2601', name: '发饰与发卡' },
      { code: '2602', name: '纽扣与拉链' },
      { code: '2604', name: '假发与人造花' }
    ] 
  },
  { 
    classNum: 27, 
    classTitle: '第27类 - 地毯席垫与墙纸覆盖', 
    categoryType: 'GOODS', 
    description: '地毯，小地毯，席，亚麻油地毡及其他铺地材料；非纺织品制墙纸', 
    defaultGroups: [
      { code: '2701', name: '地垫与防滑垫' },
      { code: '2703', name: '席类制品' },
      { code: '2704', name: '墙纸与壁纸' }
    ] 
  },
  { 
    classNum: 28, 
    classTitle: '第28类 - 玩具游戏与健身器材', 
    categoryType: 'GOODS', 
    description: '游戏器具和玩具；视频游戏装置；体育和健身用品；圣诞树用装饰品', 
    defaultGroups: [
      { code: '2801', name: '玩具与益智玩具' },
      { code: '2802', name: '电子游戏装置' },
      { code: '2805', name: '健身器材与体育用品' }
    ] 
  },
  { 
    classNum: 29, 
    classTitle: '第29类 - 食品肉蛋与乳制品', 
    categoryType: 'GOODS', 
    description: '肉，鱼，家禽和野味；肉汁；腌渍、冷冻、干制及煮熟的水果和蔬菜；果冻，果酱，蜜饯；蛋；奶，奶酪，黄油，酸奶和其他乳制品；食用油和油脂', 
    defaultGroups: [
      { code: '2901', name: '肉与肉制品' },
      { code: '2907', name: '乳制品与酸奶' },
      { code: '2911', name: '坚果与坚果制品' },
      { code: '2913', name: '果冻与果酱' }
    ] 
  },
  { 
    classNum: 30, 
    classTitle: '第30类 - 糖果咖啡与调味面食', 
    categoryType: 'GOODS', 
    description: '咖啡，茶，可可和咖啡代用品；米，意式面食，面条；木薯粉和西米；面粉和谷类制品；面包、糕点和糖果；巧克力；冰淇淋；糖，蜂蜜；酵母，发酵粉；盐，调味佐料；醋，调味酱汁', 
    defaultGroups: [
      { code: '3004', name: '糖果、薄荷糖与口香糖' },
      { code: '3001', name: '咖啡与茶饮料代用品' },
      { code: '3006', name: '面包与糕点' },
      { code: '3016', name: '调味品与酱料' }
    ] 
  },
  { 
    classNum: 31, 
    classTitle: '第31类 - 农林生鲜与新鲜果蔬', 
    categoryType: 'GOODS', 
    description: '未加工的农业、水产养殖业、园艺和林业产品；未加工的谷物和种子；新鲜水果和蔬菜，新鲜芳香草本植物；草木和花卉；活动物；动物的饮食和饮料；麦芽', 
    defaultGroups: [
      { code: '3101', name: '新鲜水果与蔬菜' },
      { code: '3103', name: '花卉与植物' },
      { code: '3108', name: '宠物食品与饲料' }
    ] 
  },
  { 
    classNum: 32, 
    classTitle: '第32类 - 啤酒饮料与果汁水', 
    categoryType: 'GOODS', 
    description: '啤酒；无酒精饮料；矿泉水和汽水；水果饮料及果汁；糖浆及其他制无酒精饮料用配料', 
    defaultGroups: [
      { code: '3201', name: '啤酒与麦芽饮料' },
      { code: '3202', name: '不含酒精饮料与苏打水' },
      { code: '3203', name: '果汁与植物蛋白饮料' }
    ] 
  },
  { 
    classNum: 33, 
    classTitle: '第33类 - 含酒精的饮料', 
    categoryType: 'GOODS', 
    description: '含酒精的饮料（啤酒除外）；制酒精饮料用配料', 
    defaultGroups: [
      { code: '3301', name: '白酒与蒸馏酒' },
      { code: '3302', name: '葡萄酒与果酒' },
      { code: '3303', name: '预调鸡尾酒' }
    ] 
  },
  { 
    classNum: 34, 
    classTitle: '第34类 - 烟草与吸烟用具', 
    categoryType: 'GOODS', 
    description: '烟草和烟草代用品；香烟和雪茄；电子香烟和吸烟者用口腔雾化器；吸烟用具；火柴', 
    defaultGroups: [
      { code: '3401', name: '烟草与雪茄' },
      { code: '3407', name: '电子烟与雾化器' },
      { code: '3404', name: '打火机与吸烟器具' }
    ] 
  },

  // ==================== 35-45类 服务分类 (SERVICE) ====================
  { 
    classNum: 35, 
    classTitle: '第35类 - 广告销售与电商在线市场', 
    categoryType: 'SERVICE', 
    description: '广告；商业经营、组织和管理；办公事务；为商品和服务的买卖双方提供在线市场；零售批发', 
    defaultGroups: [
      { code: '3501', name: '广告宣传与策划' },
      { code: '3502', name: '商业经营与特许管理' },
      { code: '3503', name: '替他人推销与在线买卖' },
      { code: '3507', name: '办公事务与财会' }
    ] 
  },
  { 
    classNum: 36, 
    classTitle: '第36类 - 金融保险与不动产管理', 
    categoryType: 'SERVICE', 
    description: '金融，货币和银行服务；保险服务；不动产事务', 
    defaultGroups: [
      { code: '3601', name: '银行与金融服务' },
      { code: '3602', name: '保险与经纪服务' },
      { code: '3604', name: '不动产事务' }
    ] 
  },
  { 
    classNum: 37, 
    classTitle: '第37类 - 建筑维修与设备维护清洁', 
    categoryType: 'SERVICE', 
    description: '建筑服务；安装和修理服务；采矿，石油和天然气钻探', 
    defaultGroups: [
      { code: '3701', name: '房屋建筑与装修' },
      { code: '3706', name: '电器设备的安装与修理' },
      { code: '3717', name: '清洁与消毒服务' }
    ] 
  },
  { 
    classNum: 38, 
    classTitle: '第38类 - 电信通讯与数据网络传输', 
    categoryType: 'SERVICE', 
    description: '电信服务；数据传输；网络通讯', 
    defaultGroups: [
      { code: '3801', name: '电信服务' },
      { code: '3802', name: '互联网数据传输与通讯' }
    ] 
  },
  { 
    classNum: 39, 
    classTitle: '第39类 - 运输物流与仓储配送', 
    categoryType: 'SERVICE', 
    description: '运送；商品包装和贮藏；旅行安排', 
    defaultGroups: [
      { code: '3901', name: '货物运输与快递' },
      { code: '3906', name: '货物仓储与物流中心' },
      { code: '3911', name: '旅行安排与票务' }
    ] 
  },
  { 
    classNum: 40, 
    classTitle: '第40类 - 材料加工与定制生产', 
    categoryType: 'SERVICE', 
    description: '材料处理；废物和垃圾的回收利用；空气净化和水处理；印刷服务；食物和饮料的保存', 
    defaultGroups: [
      { code: '4001', name: '金属材料处理与注塑加工' },
      { code: '4008', name: '印刷与装订服务' },
      { code: '4011', name: '空气净化与水处理' }
    ] 
  },
  { 
    classNum: 41, 
    classTitle: '第41类 - 教育培训与文娱活动', 
    categoryType: 'SERVICE', 
    description: '教育；提供培训；娱乐；文体活动', 
    defaultGroups: [
      { code: '4101', name: '教育与专业培训' },
      { code: '4104', name: '摄影与视频制作' },
      { code: '4105', name: '文娱活动与展览' }
    ] 
  },
  { 
    classNum: 42, 
    classTitle: '第42类 - 科学技术研发与软件SaaS', 
    categoryType: 'SERVICE', 
    description: '科学技术服务和研究以及相关的设计服务；工业分析、工业研究和工业品外观设计；计算机硬件和软件的设计与开发', 
    defaultGroups: [
      { code: '4209', name: '计算机软件设计与开发' },
      { code: '4214', name: '工业品外观设计与包装设计' },
      { code: '4220', name: '技术研究与质量检验' }
    ] 
  },
  { 
    classNum: 43, 
    classTitle: '第43类 - 餐饮住宿与咖啡馆服务', 
    categoryType: 'SERVICE', 
    description: '提供食物和饮料服务；临时住宿', 
    defaultGroups: [
      { code: '4301', name: '提供餐饮服务' },
      { code: '4302', name: '临时住宿服务' }
    ] 
  },
  { 
    classNum: 44, 
    classTitle: '第44类 - 医疗卫生与口腔门诊护理', 
    categoryType: 'SERVICE', 
    description: '医疗服务；兽医服务；人或动物的卫生和美容服务；农业、水产养殖、园艺和林业服务', 
    defaultGroups: [
      { code: '4401', name: '医疗服务与口腔门诊' },
      { code: '4402', name: '卫生美容与健康护理' },
      { code: '4403', name: '兽医与宠物护理' }
    ] 
  },
  { 
    classNum: 45, 
    classTitle: '第45类 - 知识产权法律与安全服务', 
    categoryType: 'SERVICE', 
    description: '法律服务；由他人提供的为保护财产和人身安全的安全服务；为满足个人需求由他人提供的私人和社会服务', 
    defaultGroups: [
      { code: '4506', name: '知识产权代理与法律服务' },
      { code: '4501', name: '安全保卫服务' },
      { code: '4505', name: '个人社交与婚介' }
    ] 
  }
];

export const INITIAL_NICE_CLASSIFICATION_ITEMS: NiceClassificationItem[] = [
  // ==================== 第 01 类 ====================
  {
    id: 'nice-0101',
    classNum: 1,
    classTitle: '第01类 - 工业化工与科学原料',
    categoryType: 'GOODS',
    groupCode: '0102',
    groupName: '树脂与未加工塑料',
    itemNameCn: '未加工塑料',
    itemNameEn: 'Unprocessed plastics',
    itemCode: '010438',
    isCore: false,
    importance: 'STANDARD',
    notes: '机身与刷柄注塑级环保塑胶原料',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0102',
    classNum: 1,
    classTitle: '第01类 - 工业化工与科学原料',
    categoryType: 'GOODS',
    groupCode: '0102',
    groupName: '树脂与未加工塑料',
    itemNameCn: '未加工人造树脂',
    itemNameEn: 'Synthetic resins, unprocessed',
    itemCode: '010458',
    isCore: false,
    importance: 'STANDARD',
    notes: '高分子合成树脂材料',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0103',
    classNum: 1,
    classTitle: '第01类 - 工业化工与科学原料',
    categoryType: 'GOODS',
    groupCode: '0115',
    groupName: '工业用粘合剂与胶水',
    itemNameCn: '工业用粘合剂',
    itemNameEn: 'Adhesives for industrial purposes',
    itemCode: '010002',
    isCore: false,
    importance: 'STANDARD',
    notes: '精密电子元件组装防水结构胶',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 02 类 ====================
  {
    id: 'nice-0201',
    classNum: 2,
    classTitle: '第02类 - 颜料油漆与防腐材料',
    categoryType: 'GOODS',
    groupCode: '0202',
    groupName: '油漆与清漆涂料',
    itemNameCn: '手感漆与涂料',
    itemNameEn: 'Coatings [paints]',
    itemCode: '020054',
    isCore: false,
    importance: 'STANDARD',
    notes: '产品机身抗污肤感UV喷涂材料',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0202',
    classNum: 2,
    classTitle: '第02类 - 颜料油漆与防腐材料',
    categoryType: 'GOODS',
    groupCode: '0207',
    groupName: '印刷油墨与涂层',
    itemNameCn: '印刷油墨',
    itemNameEn: 'Printing ink',
    itemCode: '020067',
    isCore: false,
    importance: 'STANDARD',
    notes: '包装印刷与丝印LOGO环保油墨',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 03 类 ====================
  {
    id: 'nice-0301',
    classNum: 3,
    classTitle: '第03类 - 日化洗护与牙膏洁齿剂',
    categoryType: 'GOODS',
    groupCode: '0306',
    groupName: '洁齿剂及口腔清新剂',
    itemNameCn: '牙膏',
    itemNameEn: 'Toothpaste',
    itemCode: '030090',
    isCore: true,
    importance: 'CORE',
    notes: 'usmile 笑容加全系列牙膏主打保护项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0302',
    classNum: 3,
    classTitle: '第03类 - 日化洗护与牙膏洁齿剂',
    categoryType: 'GOODS',
    groupCode: '0306',
    groupName: '洁齿剂及口腔清新剂',
    itemNameCn: '非医用漱口水',
    itemNameEn: 'Non-medicated mouthwashes',
    itemCode: '030193',
    isCore: true,
    importance: 'CORE',
    notes: '便携条装漱口水、果味漱口水核心商品',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0303',
    classNum: 3,
    classTitle: '第03类 - 日化洗护与牙膏洁齿剂',
    categoryType: 'GOODS',
    groupCode: '0306',
    groupName: '洁齿剂及口腔清新剂',
    itemNameCn: '口香喷雾剂',
    itemNameEn: 'Breath freshening sprays',
    itemCode: '030204',
    isCore: true,
    importance: 'CORE',
    notes: '口腔清新喷雾主力商品',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0304',
    classNum: 3,
    classTitle: '第03类 - 日化洗护与牙膏洁齿剂',
    categoryType: 'GOODS',
    groupCode: '0306',
    groupName: '洁齿剂及口腔清新剂',
    itemNameCn: '牙齿美白条',
    itemNameEn: 'Teeth whitening strips',
    itemCode: '030218',
    isCore: true,
    importance: 'KEY',
    notes: '美白牙贴、牙齿美白凝胶',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0305',
    classNum: 3,
    classTitle: '第03类 - 日化洗护与牙膏洁齿剂',
    categoryType: 'GOODS',
    groupCode: '0301',
    groupName: '肥皂与洗涤用品',
    itemNameCn: '洗面奶',
    itemNameEn: 'Facial cleansers',
    itemCode: '030112',
    isCore: false,
    importance: 'KEY',
    notes: '小猫安妮 KittyAnnie 洁面护肤产品线',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 04 类 ====================
  {
    id: 'nice-0401',
    classNum: 4,
    classTitle: '第04类 - 工业用油与燃料润滑剂',
    categoryType: 'GOODS',
    groupCode: '0401',
    groupName: '工业用油及润滑油脂',
    itemNameCn: '工业用润滑油',
    itemNameEn: 'Industrial lubricants',
    itemCode: '040042',
    isCore: false,
    importance: 'STANDARD',
    notes: '声波马达轴承食品级润滑脂',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0402',
    classNum: 4,
    classTitle: '第04类 - 工业用油与燃料润滑剂',
    categoryType: 'GOODS',
    groupCode: '0405',
    groupName: '照明用蜡烛与灯芯',
    itemNameCn: '香氛蜡烛',
    itemNameEn: 'Scented candles',
    itemCode: '040105',
    isCore: false,
    importance: 'DEFENSE',
    notes: '家居香氛生活周边衍生品',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 05 类 ====================
  {
    id: 'nice-0501',
    classNum: 5,
    classTitle: '第05类 - 医药卫生与医用制剂',
    categoryType: 'GOODS',
    groupCode: '0501',
    groupName: '药品与医用制剂',
    itemNameCn: '医用牙膏',
    itemNameEn: 'Medicated toothpaste',
    itemCode: '050114',
    isCore: true,
    importance: 'CORE',
    notes: '抗敏脱敏及含氟医用防蛀牙膏',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0502',
    classNum: 5,
    classTitle: '第05类 - 医药卫生与医用制剂',
    categoryType: 'GOODS',
    groupCode: '0501',
    groupName: '药品与医用制剂',
    itemNameCn: '药用含漱剂（医用漱口水）',
    itemNameEn: 'Medicated mouthwash',
    itemCode: '050212',
    isCore: true,
    importance: 'KEY',
    notes: '抑菌及口腔溃疡医用漱口液',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0503',
    classNum: 5,
    classTitle: '第05类 - 医药卫生与医用制剂',
    categoryType: 'GOODS',
    groupCode: '0507',
    groupName: '牙科用材料与填塞料',
    itemNameCn: '填塞牙孔用料',
    itemNameEn: 'Dental fillings',
    itemCode: '050112',
    isCore: false,
    importance: 'STANDARD',
    notes: '牙科树脂与修补填料',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 06 类 ====================
  {
    id: 'nice-0601',
    classNum: 6,
    classTitle: '第06类 - 普通金属与五金制品',
    categoryType: 'GOODS',
    groupCode: '0608',
    groupName: '金属五金与小五金',
    itemNameCn: '金属弹簧与传动轴',
    itemNameEn: 'Springs [metal hardware]',
    itemCode: '060205',
    isCore: false,
    importance: 'STANDARD',
    notes: '刷头连接金属轴与五金卡扣',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0602',
    classNum: 6,
    classTitle: '第06类 - 普通金属与五金制品',
    categoryType: 'GOODS',
    groupCode: '0608',
    groupName: '金属五金与小五金',
    itemNameCn: '金属挂钩与置物架配件',
    itemNameEn: 'Hooks [metal hardware]',
    itemCode: '060086',
    isCore: false,
    importance: 'STANDARD',
    notes: '浴室金属牙刷壁挂支架',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 07 类 ====================
  {
    id: 'nice-0701',
    classNum: 7,
    classTitle: '第07类 - 机械设备与电动工具',
    categoryType: 'GOODS',
    groupCode: '0709',
    groupName: '电动清洁与清洗机械',
    itemNameCn: '超声波清洗机',
    itemNameEn: 'Ultrasonic cleaning machines',
    itemCode: '070512',
    isCore: false,
    importance: 'KEY',
    notes: '桌面超声波眼镜与假牙清洗盒',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0702',
    classNum: 7,
    classTitle: '第07类 - 机械设备与电动工具',
    categoryType: 'GOODS',
    groupCode: '0724',
    groupName: '包装机械与封口机',
    itemNameCn: '包装机与封口机',
    itemNameEn: 'Packaging machines',
    itemCode: '070177',
    isCore: false,
    importance: 'STANDARD',
    notes: '生产线自动化灌装与无尘包装设备',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 08 类 ====================
  {
    id: 'nice-0801',
    classNum: 8,
    classTitle: '第08类 - 手工用具与修护刀剪',
    categoryType: 'GOODS',
    groupCode: '0810',
    groupName: '指甲修护手工具',
    itemNameCn: '指甲刀与修甲用具',
    itemNameEn: 'Nail clippers, electric or non-electric',
    itemCode: '080219',
    isCore: false,
    importance: 'DEFENSE',
    notes: '小猫安妮个人护理随身工具',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0802',
    classNum: 8,
    classTitle: '第08类 - 手工用具与修护刀剪',
    categoryType: 'GOODS',
    groupCode: '0806',
    groupName: '理发与刮胡工具',
    itemNameCn: '剃须刀',
    itemNameEn: 'Razors, electric or non-electric',
    itemCode: '080179',
    isCore: false,
    importance: 'KEY',
    notes: '手动剃须刀及男士个护工具',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 09 类 ====================
  {
    id: 'nice-0901',
    classNum: 9,
    classTitle: '第09类 - 智能硬件与软件芯片',
    categoryType: 'GOODS',
    groupCode: '0901',
    groupName: '计算机软件与电子产品',
    itemNameCn: '可下载的智能手机应用软件',
    itemNameEn: 'Downloadable smart phone applications',
    itemCode: '090658',
    isCore: true,
    importance: 'CORE',
    notes: 'usmile 智能口腔健康 APP 核心保护项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0902',
    classNum: 9,
    classTitle: '第09类 - 智能硬件与软件芯片',
    categoryType: 'GOODS',
    groupCode: '0913',
    groupName: '传感器与电路元件',
    itemNameCn: '传感器',
    itemNameEn: 'Sensors',
    itemCode: '090670',
    isCore: true,
    importance: 'KEY',
    notes: '牙刷内置六轴陀螺仪与压力感应传感器',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-0903',
    classNum: 9,
    classTitle: '第09类 - 智能硬件与软件芯片',
    categoryType: 'GOODS',
    groupCode: '0922',
    groupName: '充电座与电池',
    itemNameCn: '无线充电器',
    itemNameEn: 'Wireless chargers',
    itemCode: '090724',
    isCore: false,
    importance: 'KEY',
    notes: '牙刷感应无线充电底座',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 10 类 ====================
  {
    id: 'nice-1001',
    classNum: 10,
    classTitle: '第10类 - 医疗器械与牙科设备',
    categoryType: 'GOODS',
    groupCode: '1004',
    groupName: '医疗用仪器及器械',
    itemNameCn: '牙科设备及仪器',
    itemNameEn: 'Dental apparatus and instruments',
    itemCode: '100062',
    isCore: true,
    importance: 'CORE',
    notes: '专业医疗器械背书及诊所级器械',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-1002',
    classNum: 10,
    classTitle: '第10类 - 医疗器械与牙科设备',
    categoryType: 'GOODS',
    groupCode: '1004',
    groupName: '医疗用仪器及器械',
    itemNameCn: '医用洁牙机',
    itemNameEn: 'Ultrasonic dental scalers',
    itemCode: '100128',
    isCore: true,
    importance: 'CORE',
    notes: '医用级超声洁牙仪',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-1003',
    classNum: 10,
    classTitle: '第10类 - 医疗器械与牙科设备',
    categoryType: 'GOODS',
    groupCode: '1004',
    groupName: '医疗用仪器及器械',
    itemNameCn: '正畸矫正器',
    itemNameEn: 'Orthodontic appliances',
    itemCode: '100179',
    isCore: true,
    importance: 'KEY',
    notes: '隐形牙套与牙齿正畸矫正装置',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-1004',
    classNum: 10,
    classTitle: '第10类 - 医疗器械与牙科设备',
    categoryType: 'GOODS',
    groupCode: '1004',
    groupName: '医疗用仪器及器械',
    itemNameCn: '医用冲牙器',
    itemNameEn: 'Medical oral irrigators',
    itemCode: '100204',
    isCore: true,
    importance: 'KEY',
    notes: '二类医疗器械冲牙器专用项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 11 类 ====================
  {
    id: 'nice-1101',
    classNum: 11,
    classTitle: '第11类 - 消毒灭菌与照明家电',
    categoryType: 'GOODS',
    groupCode: '1104',
    groupName: '消毒灭菌器具与紫外线盒',
    itemNameCn: '紫外线牙刷消毒器',
    itemNameEn: 'UV toothbrush sanitizers',
    itemCode: '110321',
    isCore: true,
    importance: 'KEY',
    notes: '壁挂牙刷消毒盒与便携杀菌舱',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-1102',
    classNum: 11,
    classTitle: '第11类 - 消毒灭菌与照明家电',
    categoryType: 'GOODS',
    groupCode: '1106',
    groupName: '饮水与水净化设备',
    itemNameCn: '净水器与水软化装置',
    itemNameEn: 'Water purifying apparatus',
    itemCode: '110135',
    isCore: false,
    importance: 'STANDARD',
    notes: '冲牙器水质净化过滤器',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 12 类 ====================
  {
    id: 'nice-1201',
    classNum: 12,
    classTitle: '第12类 - 运载工具与交通配件',
    categoryType: 'GOODS',
    groupCode: '1202',
    groupName: '汽车及其配件',
    itemNameCn: '车载收纳盒与车载手机支架',
    itemNameEn: 'Vehicle cup holders / car mounts',
    itemCode: '120023',
    isCore: false,
    importance: 'DEFENSE',
    notes: '车载便携洗漱包固定装置',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 13 类 ====================
  {
    id: 'nice-1301',
    classNum: 13,
    classTitle: '第13类 - 火器烟火与爆炸品',
    categoryType: 'GOODS',
    groupCode: '1302',
    groupName: '烟火与爆竹',
    itemNameCn: '烟花与礼花弹',
    itemNameEn: 'Fireworks',
    itemCode: '130005',
    isCore: false,
    importance: 'DEFENSE',
    notes: '全类防御性注册项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 14 类 ====================
  {
    id: 'nice-1401',
    classNum: 14,
    classTitle: '第14类 - 贵金属与钟表首饰',
    categoryType: 'GOODS',
    groupCode: '1404',
    groupName: '钟表与计时器',
    itemNameCn: '智能手表与计时器',
    itemNameEn: 'Smartwatches',
    itemCode: '140168',
    isCore: false,
    importance: 'DEFENSE',
    notes: '智能穿戴与刷牙计时器防御项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-1402',
    classNum: 14,
    classTitle: '第14类 - 贵金属与钟表首饰',
    categoryType: 'GOODS',
    groupCode: '1401',
    groupName: '首饰与珠宝',
    itemNameCn: '首饰盒与珠宝盒',
    itemNameEn: 'Jewelry boxes',
    itemCode: '140108',
    isCore: false,
    importance: 'DEFENSE',
    notes: '品牌联名礼盒与高级饰品盒',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 15 类 ====================
  {
    id: 'nice-1501',
    classNum: 15,
    classTitle: '第15类 - 乐器与乐器配件',
    categoryType: 'GOODS',
    groupCode: '1501',
    groupName: '弦乐与电子乐器',
    itemNameCn: '电子乐器与调音器',
    itemNameEn: 'Electronic musical instruments',
    itemCode: '150045',
    isCore: false,
    importance: 'DEFENSE',
    notes: '全类防御性注册项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 16 类 ====================
  {
    id: 'nice-1601',
    classNum: 16,
    classTitle: '第16类 - 纸品包装与文具办公',
    categoryType: 'GOODS',
    groupCode: '1609',
    groupName: '包装用纸盒与袋',
    itemNameCn: '纸制或纸板制包装盒',
    itemNameEn: 'Boxes of paper or cardboard',
    itemCode: '160080',
    isCore: false,
    importance: 'STANDARD',
    notes: '礼盒包装与产品说明书',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-1602',
    classNum: 16,
    classTitle: '第16类 - 纸品包装与文具办公',
    categoryType: 'GOODS',
    groupCode: '1605',
    groupName: '纸品与卫生用纸',
    itemNameCn: '纸巾与卸妆纸巾',
    itemNameEn: 'Tissues of paper for removing make-up',
    itemCode: '160288',
    isCore: false,
    importance: 'KEY',
    notes: '个人护理面巾纸与卫生纸品',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 17 类 ====================
  {
    id: 'nice-1701',
    classNum: 17,
    classTitle: '第17类 - 橡胶塑料与绝缘密封',
    categoryType: 'GOODS',
    groupCode: '1701',
    groupName: '橡胶与硅橡胶制品',
    itemNameCn: '硅橡胶密封圈与减震垫',
    itemNameEn: 'Rubber seals / silicone gaskets',
    itemCode: '170043',
    isCore: false,
    importance: 'STANDARD',
    notes: '电动牙刷防水密封胶圈IPX7级材料',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 18 类 ====================
  {
    id: 'nice-1801',
    classNum: 18,
    classTitle: '第18类 - 皮革皮具与旅行箱包',
    categoryType: 'GOODS',
    groupCode: '1802',
    groupName: '旅行包与收纳袋',
    itemNameCn: '旅行洗漱包',
    itemNameEn: 'Toiletry bags',
    itemCode: '180132',
    isCore: false,
    importance: 'KEY',
    notes: '电动牙刷便携旅行收纳盒与皮套',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-1802',
    classNum: 18,
    classTitle: '第18类 - 皮革皮具与旅行箱包',
    categoryType: 'GOODS',
    groupCode: '1802',
    groupName: '旅行包与收纳袋',
    itemNameCn: '背包与手提包',
    itemNameEn: 'Backpacks / Handbags',
    itemCode: '180075',
    isCore: false,
    importance: 'STANDARD',
    notes: '品牌周边潮流背包与出行包袋',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 19 类 ====================
  {
    id: 'nice-1901',
    classNum: 19,
    classTitle: '第19类 - 非金属建材与石材陶瓷',
    categoryType: 'GOODS',
    groupCode: '1906',
    groupName: '建筑石材与瓷砖',
    itemNameCn: '浴室非金属瓷砖与石材',
    itemNameEn: 'Ceramic tiles / building stone',
    itemCode: '190054',
    isCore: false,
    importance: 'DEFENSE',
    notes: '全类防御性注册项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 20 类 ====================
  {
    id: 'nice-2001',
    classNum: 20,
    classTitle: '第20类 - 家具镜子与收纳制品',
    categoryType: 'GOODS',
    groupCode: '2001',
    groupName: '家具与镜子',
    itemNameCn: '浴室镜与梳妆镜',
    itemNameEn: 'Bathroom mirrors',
    itemCode: '200153',
    isCore: false,
    importance: 'KEY',
    notes: 'LED智能美妆镜与浴室梳妆镜',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-2002',
    classNum: 20,
    classTitle: '第20类 - 家具镜子与收纳制品',
    categoryType: 'GOODS',
    groupCode: '2005',
    groupName: '塑料收纳盒与容器',
    itemNameCn: '塑料收纳盒与置物架',
    itemNameEn: 'Plastic storage containers',
    itemCode: '200215',
    isCore: false,
    importance: 'STANDARD',
    notes: '洗漱台桌面亚克力收纳盒',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 21 类 (usmile 核心基石类) ====================
  {
    id: 'nice-2101',
    classNum: 21,
    classTitle: '第21类 - 厨房洁具与牙刷器具',
    categoryType: 'GOODS',
    groupCode: '2108',
    groupName: '刷子及制刷材料',
    itemNameCn: '电动牙刷',
    itemNameEn: 'Electric toothbrushes',
    itemCode: '210148',
    isCore: true,
    importance: 'CORE',
    notes: 'usmile核心主营商品，必须严格申请且全类布局保护',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-2102',
    classNum: 21,
    classTitle: '第21类 - 厨房洁具与牙刷器具',
    categoryType: 'GOODS',
    groupCode: '2108',
    groupName: '刷子及制刷材料',
    itemNameCn: '牙刷刷头',
    itemNameEn: 'Toothbrush heads',
    itemCode: '210342',
    isCore: true,
    importance: 'CORE',
    notes: '核心高频耗材商品，重点防侵权与假冒',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-2103',
    classNum: 21,
    classTitle: '第21类 - 厨房洁具与牙刷器具',
    categoryType: 'GOODS',
    groupCode: '2108',
    groupName: '刷子及制刷材料',
    itemNameCn: '超声波牙刷',
    itemNameEn: 'Ultrasonic toothbrushes',
    itemCode: '210389',
    isCore: true,
    importance: 'CORE',
    notes: '声波震动牙刷品类规范词',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-2104',
    classNum: 21,
    classTitle: '第21类 - 厨房洁具与牙刷器具',
    categoryType: 'GOODS',
    groupCode: '2108',
    groupName: '刷子及制刷材料',
    itemNameCn: '牙刷',
    itemNameEn: 'Toothbrushes',
    itemCode: '210214',
    isCore: true,
    importance: 'KEY',
    notes: '手动牙刷及基础刷具通用保护项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-2105',
    classNum: 21,
    classTitle: '第21类 - 厨房洁具与牙刷器具',
    categoryType: 'GOODS',
    groupCode: '2106',
    groupName: '家庭日用及卫生器具',
    itemNameCn: '冲牙器（洁齿用水喷射器具）',
    itemNameEn: 'Water flossers (Water apparatus for cleaning teeth)',
    itemCode: '210325',
    isCore: true,
    importance: 'CORE',
    notes: '冲牙器标准国际分类商品项，防冲牙器跨类侵权',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-2106',
    classNum: 21,
    classTitle: '第21类 - 厨房洁具与牙刷器具',
    categoryType: 'GOODS',
    groupCode: '2106',
    groupName: '家庭日用及卫生器具',
    itemNameCn: '牙线',
    itemNameEn: 'Dental floss',
    itemCode: '210149',
    isCore: true,
    importance: 'CORE',
    notes: '牙线、牙线棒核心商品',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-2107',
    classNum: 21,
    classTitle: '第21类 - 厨房洁具与牙刷器具',
    categoryType: 'GOODS',
    groupCode: '2106',
    groupName: '家庭日用及卫生器具',
    itemNameCn: '刮舌器',
    itemNameEn: 'Tongue scrapers',
    itemCode: '210367',
    isCore: true,
    importance: 'KEY',
    notes: '口腔清洁护理拓展小工具',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-2108',
    classNum: 21,
    classTitle: '第21类 - 厨房洁具与牙刷器具',
    categoryType: 'GOODS',
    groupCode: '2101',
    groupName: '厨房及餐具',
    itemNameCn: '漱口杯',
    itemNameEn: 'Mouthwash cups',
    itemCode: '210087',
    isCore: false,
    importance: 'STANDARD',
    notes: '洗漱配套杯具',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-2109',
    classNum: 21,
    classTitle: '第21类 - 厨房洁具与牙刷器具',
    categoryType: 'GOODS',
    groupCode: '2110',
    groupName: '化妆用具与美妆蛋',
    itemNameCn: '化妆用具与美妆蛋',
    itemNameEn: 'Cosmetic utensils',
    itemCode: '210156',
    isCore: false,
    importance: 'DEFENSE',
    notes: '小猫安妮 KittyAnnie 美妆护肤工具防御项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 22 类 ====================
  {
    id: 'nice-2201',
    classNum: 22,
    classTitle: '第22类 - 绳网袋类与帐篷帆布',
    categoryType: 'GOODS',
    groupCode: '2204',
    groupName: '运输包装袋',
    itemNameCn: '包装用麻袋与束口袋',
    itemNameEn: 'Bags of textile for packaging',
    itemCode: '220021',
    isCore: false,
    importance: 'DEFENSE',
    notes: '洗护用品纯棉抽绳防尘袋',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 23 类 ====================
  {
    id: 'nice-2301',
    classNum: 23,
    classTitle: '第23类 - 纺织用纱线与缝纫线',
    categoryType: 'GOODS',
    groupCode: '2301',
    groupName: '纺织用纱线',
    itemNameCn: '纺织用纱和线',
    itemNameEn: 'Yarn and thread for textile use',
    itemCode: '230001',
    isCore: false,
    importance: 'DEFENSE',
    notes: '全类防御性注册项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 24 类 ====================
  {
    id: 'nice-2401',
    classNum: 24,
    classTitle: '第24类 - 纺织织物与毛巾家纺',
    categoryType: 'GOODS',
    groupCode: '2405',
    groupName: '毛巾、浴巾与擦拭布',
    itemNameCn: '毛巾与洁面柔巾',
    itemNameEn: 'Towels of textile',
    itemCode: '240072',
    isCore: false,
    importance: 'KEY',
    notes: '一次性纯棉柔巾与洗脸巾',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-2402',
    classNum: 24,
    classTitle: '第24类 - 纺织织物与毛巾家纺',
    categoryType: 'GOODS',
    groupCode: '2405',
    groupName: '毛巾、浴巾与擦拭布',
    itemNameCn: '超细纤维擦拭布',
    itemNameEn: 'Microfibre cleaning cloths',
    itemCode: '240120',
    isCore: false,
    importance: 'STANDARD',
    notes: '镜面及洁具擦拭布',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 25 类 ====================
  {
    id: 'nice-2501',
    classNum: 25,
    classTitle: '第25类 - 服装鞋帽与运动服饰',
    categoryType: 'GOODS',
    groupCode: '2501',
    groupName: '衣物与外衣',
    itemNameCn: 'T恤衫与睡衣',
    itemNameEn: 'T-shirts / Pajamas',
    itemCode: '250071',
    isCore: false,
    importance: 'STANDARD',
    notes: '居家服饰与品牌周边文化衫',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-2502',
    classNum: 25,
    classTitle: '第25类 - 服装鞋帽与运动服饰',
    categoryType: 'GOODS',
    groupCode: '2507',
    groupName: '鞋类',
    itemNameCn: '浴室防滑拖鞋',
    itemNameEn: 'Slippers / Bath slippers',
    itemCode: '250080',
    isCore: false,
    importance: 'STANDARD',
    notes: '浴室卫浴配套拖鞋',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 26 类 ====================
  {
    id: 'nice-2601',
    classNum: 26,
    classTitle: '第26类 - 饰品配件与纽扣拉链',
    categoryType: 'GOODS',
    groupCode: '2601',
    groupName: '发饰与发卡',
    itemNameCn: '发圈与束发带',
    itemNameEn: 'Hair bands / Hair scrunchies',
    itemCode: '260021',
    isCore: false,
    importance: 'KEY',
    notes: '洗漱洁面专用束发带',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 27 类 ====================
  {
    id: 'nice-2701',
    classNum: 27,
    classTitle: '第27类 - 地毯席垫与墙纸覆盖',
    categoryType: 'GOODS',
    groupCode: '2701',
    groupName: '地垫与防滑垫',
    itemNameCn: '浴室防滑地垫与硅藻泥脚垫',
    itemNameEn: 'Bath mats / non-slip mats',
    itemCode: '270008',
    isCore: false,
    importance: 'STANDARD',
    notes: '洗漱台干湿分离吸水脚垫',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 28 类 ====================
  {
    id: 'nice-2801',
    classNum: 28,
    classTitle: '第28类 - 玩具游戏与健身器材',
    categoryType: 'GOODS',
    groupCode: '2801',
    groupName: '玩具与益智玩具',
    itemNameCn: '智能儿童刷牙互动玩具',
    itemNameEn: 'Smart interactive toys for children',
    itemCode: '280024',
    isCore: false,
    importance: 'KEY',
    notes: '儿童智能刷牙早教互动伴侣',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 29 类 ====================
  {
    id: 'nice-2901',
    classNum: 29,
    classTitle: '第29类 - 食品肉蛋与乳制品',
    categoryType: 'GOODS',
    groupCode: '2907',
    groupName: '乳制品与酸奶',
    itemNameCn: '酸奶与益生菌乳饮品',
    itemNameEn: 'Yogurt',
    itemCode: '290074',
    isCore: false,
    importance: 'DEFENSE',
    notes: '口腔益生菌营养食品防御项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 30 类 ====================
  {
    id: 'nice-3001',
    classNum: 30,
    classTitle: '第30类 - 糖果咖啡与调味面食',
    categoryType: 'GOODS',
    groupCode: '3004',
    groupName: '糖果、薄荷糖与口香糖',
    itemNameCn: '无糖口香糖与薄荷糖',
    itemNameEn: 'Chewing gum, not for medical purposes',
    itemCode: '300035',
    isCore: true,
    importance: 'KEY',
    notes: '亲天 kissday 美齿糖与防蛀木糖醇含片',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-3002',
    classNum: 30,
    classTitle: '第30类 - 糖果咖啡与调味面食',
    categoryType: 'GOODS',
    groupCode: '3001',
    groupName: '咖啡与茶饮料代用品',
    itemNameCn: '咖啡与代用茶',
    itemNameEn: 'Coffee / Tea substitutes',
    itemCode: '300010',
    isCore: false,
    importance: 'STANDARD',
    notes: '提神饮品与草本润喉茶',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 31 类 ====================
  {
    id: 'nice-3101',
    classNum: 31,
    classTitle: '第31类 - 农林生鲜与新鲜果蔬',
    categoryType: 'GOODS',
    groupCode: '3108',
    groupName: '宠物食品与饲料',
    itemNameCn: '宠物洁齿骨与宠物食品',
    itemNameEn: 'Pet food / edible chews for animals',
    itemCode: '310138',
    isCore: false,
    importance: 'KEY',
    notes: '宠物口腔护理与宠物洁齿零食',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 32 类 ====================
  {
    id: 'nice-3201',
    classNum: 32,
    classTitle: '第32类 - 啤酒饮料与果汁水',
    categoryType: 'GOODS',
    groupCode: '3202',
    groupName: '不含酒精饮料与苏打水',
    itemNameCn: '气泡水与无糖苏打水',
    itemNameEn: 'Aerated water / Soda water',
    itemCode: '320015',
    isCore: false,
    importance: 'STANDARD',
    notes: '清爽口腔气泡饮品',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 33 类 ====================
  {
    id: 'nice-3301',
    classNum: 33,
    classTitle: '第33类 - 含酒精的饮料',
    categoryType: 'GOODS',
    groupCode: '3302',
    groupName: '葡萄酒与果酒',
    itemNameCn: '低度果酒与起泡酒',
    itemNameEn: 'Fruit wine / sparkling wines',
    itemCode: '330002',
    isCore: false,
    importance: 'DEFENSE',
    notes: '全类防御性注册项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 34 类 ====================
  {
    id: 'nice-3401',
    classNum: 34,
    classTitle: '第34类 - 烟草与吸烟用具',
    categoryType: 'GOODS',
    groupCode: '3407',
    groupName: '电子烟与雾化器',
    itemNameCn: '电子烟与雾化器具',
    itemNameEn: 'Electronic cigarettes / oral vaporizers',
    itemCode: '340039',
    isCore: false,
    importance: 'DEFENSE',
    notes: '雾化技术跨类排他性防御注册项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 35 类 ====================
  {
    id: 'nice-3501',
    classNum: 35,
    classTitle: '第35类 - 广告销售与电商在线市场',
    categoryType: 'SERVICE',
    groupCode: '3503',
    groupName: '替他人推销与在线买卖',
    itemNameCn: '为商品和服务的买卖双方提供在线市场',
    itemNameEn: 'Provision of an online marketplace for buyers and sellers of goods and services',
    itemCode: '350120',
    isCore: true,
    importance: 'CORE',
    notes: '电商平台在线直销与商城运营核心保护项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-3502',
    classNum: 35,
    classTitle: '第35类 - 广告销售与电商在线市场',
    categoryType: 'SERVICE',
    groupCode: '3503',
    groupName: '替他人推销与在线买卖',
    itemNameCn: '日用品零售或批发服务',
    itemNameEn: 'Retail and wholesale services for daily necessities',
    itemCode: '350088',
    isCore: true,
    importance: 'KEY',
    notes: '线下专营店与渠道批发分销',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-3503',
    classNum: 35,
    classTitle: '第35类 - 广告销售与电商在线市场',
    categoryType: 'SERVICE',
    groupCode: '3501',
    groupName: '广告宣传与策划',
    itemNameCn: '广告宣传与市场营销',
    itemNameEn: 'Advertising / Marketing',
    itemCode: '350039',
    isCore: false,
    importance: 'STANDARD',
    notes: '品牌营销推广与网络广告投放',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 36 类 ====================
  {
    id: 'nice-3601',
    classNum: 36,
    classTitle: '第36类 - 金融保险与不动产管理',
    categoryType: 'SERVICE',
    groupCode: '3601',
    groupName: '银行与金融服务',
    itemNameCn: '电子钱包支付服务',
    itemNameEn: 'Electronic wallet payment services',
    itemCode: '360113',
    isCore: false,
    importance: 'STANDARD',
    notes: '在线商城支付与积分兑换结算',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 37 类 ====================
  {
    id: 'nice-3701',
    classNum: 37,
    classTitle: '第37类 - 建筑维修与设备维护清洁',
    categoryType: 'SERVICE',
    groupCode: '3706',
    groupName: '电器设备的安装与修理',
    itemNameCn: '电器设备维修与保养',
    itemNameEn: 'Electric appliance installation and repair',
    itemCode: '370003',
    isCore: false,
    importance: 'KEY',
    notes: '智能电动牙刷与冲牙器售后检修服务',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 38 类 ====================
  {
    id: 'nice-3801',
    classNum: 38,
    classTitle: '第38类 - 电信通讯与数据网络传输',
    categoryType: 'SERVICE',
    groupCode: '3802',
    groupName: '互联网数据传输与通讯',
    itemNameCn: '互联网数据传输与在线即时通讯',
    itemNameEn: 'Data transmission / online messaging',
    itemCode: '380024',
    isCore: false,
    importance: 'STANDARD',
    notes: '蓝牙设备数据同步与APP云端通信',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 39 类 ====================
  {
    id: 'nice-3901',
    classNum: 39,
    classTitle: '第39类 - 运输物流与仓储配送',
    categoryType: 'SERVICE',
    groupCode: '3901',
    groupName: '货物运输与快递',
    itemNameCn: '快递服务与货物配送',
    itemNameEn: 'Courier services / Delivery of goods',
    itemCode: '390086',
    isCore: false,
    importance: 'STANDARD',
    notes: '电商订单快速配送与仓配一体化',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-3902',
    classNum: 39,
    classTitle: '第39类 - 运输物流与仓储配送',
    categoryType: 'SERVICE',
    groupCode: '3906',
    groupName: '货物仓储与物流中心',
    itemNameCn: '货物仓储',
    itemNameEn: 'Storage of goods',
    itemCode: '390028',
    isCore: false,
    importance: 'STANDARD',
    notes: '全国中心仓储与保税仓储管理',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 40 类 ====================
  {
    id: 'nice-4001',
    classNum: 40,
    classTitle: '第40类 - 材料加工与定制生产',
    categoryType: 'SERVICE',
    groupCode: '4001',
    groupName: '金属材料处理与注塑加工',
    itemNameCn: '塑料注塑加工与材料处理',
    itemNameEn: 'Custom manufacturing of plastic parts',
    itemCode: '400049',
    isCore: false,
    importance: 'STANDARD',
    notes: 'OEM/ODM精密注塑与刷毛植毛加工',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 41 类 ====================
  {
    id: 'nice-4101',
    classNum: 41,
    classTitle: '第41类 - 教育培训与文娱活动',
    categoryType: 'SERVICE',
    groupCode: '4101',
    groupName: '教育与专业培训',
    itemNameCn: '口腔健康科普讲座与培训',
    itemNameEn: 'Educational services / Oral health workshops',
    itemCode: '410017',
    isCore: false,
    importance: 'KEY',
    notes: '全民爱牙日公益科普与口腔保健培训',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 42 类 ====================
  {
    id: 'nice-4201',
    classNum: 42,
    classTitle: '第42类 - 科学技术研发与软件SaaS',
    categoryType: 'SERVICE',
    groupCode: '4209',
    groupName: '计算机软件设计与开发',
    itemNameCn: '计算机软件设计与开发',
    itemNameEn: 'Computer software design and development',
    itemCode: '420090',
    isCore: true,
    importance: 'KEY',
    notes: '智能算法与口腔健康云端平台研发',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-4202',
    classNum: 42,
    classTitle: '第42类 - 科学技术研发与软件SaaS',
    categoryType: 'SERVICE',
    groupCode: '4209',
    groupName: '计算机软件设计与开发',
    itemNameCn: '软件即服务 (SaaS)',
    itemNameEn: 'Software as a service (SaaS)',
    itemCode: '420220',
    isCore: false,
    importance: 'STANDARD',
    notes: '笑容云与数字化口腔管理SaaS',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-4203',
    classNum: 42,
    classTitle: '第42类 - 科学技术研发与软件SaaS',
    categoryType: 'SERVICE',
    groupCode: '4214',
    groupName: '工业品外观设计与包装设计',
    itemNameCn: '工业品外观设计',
    itemNameEn: 'Industrial design',
    itemCode: '420049',
    isCore: true,
    importance: 'KEY',
    notes: '牙刷外观与人体工学校验设计',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 43 类 ====================
  {
    id: 'nice-4301',
    classNum: 43,
    classTitle: '第43类 - 餐饮住宿与咖啡馆服务',
    categoryType: 'SERVICE',
    groupCode: '4301',
    groupName: '提供餐饮服务',
    itemNameCn: '咖啡馆与茶馆服务',
    itemNameEn: 'Cafés / Tea rooms',
    itemCode: '430024',
    isCore: false,
    importance: 'DEFENSE',
    notes: '线下体验店特饮服务防御项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 44 类 ====================
  {
    id: 'nice-4401',
    classNum: 44,
    classTitle: '第44类 - 医疗卫生与口腔门诊护理',
    categoryType: 'SERVICE',
    groupCode: '4401',
    groupName: '医疗服务与口腔门诊',
    itemNameCn: '牙科服务',
    itemNameEn: 'Dentistry services',
    itemCode: '440043',
    isCore: true,
    importance: 'KEY',
    notes: '线下口腔诊所与牙科专科门诊',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-4402',
    classNum: 44,
    classTitle: '第44类 - 医疗卫生与口腔门诊护理',
    categoryType: 'SERVICE',
    groupCode: '4401',
    groupName: '医疗服务与口腔门诊',
    itemNameCn: '口腔护理咨询',
    itemNameEn: 'Oral hygiene consultation',
    itemCode: '440165',
    isCore: true,
    importance: 'KEY',
    notes: '在线口腔健康评估与专家咨询',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-4403',
    classNum: 44,
    classTitle: '第44类 - 医疗卫生与口腔门诊护理',
    categoryType: 'SERVICE',
    groupCode: '4402',
    groupName: '卫生美容与健康护理',
    itemNameCn: '美容院与皮肤护理',
    itemNameEn: 'Beauty salon services',
    itemCode: '440032',
    isCore: false,
    importance: 'STANDARD',
    notes: '小猫安妮线下美肤体验服务',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },

  // ==================== 第 45 类 ====================
  {
    id: 'nice-4501',
    classNum: 45,
    classTitle: '第45类 - 知识产权法律与安全服务',
    categoryType: 'SERVICE',
    groupCode: '4506',
    groupName: '知识产权代理与法律服务',
    itemNameCn: '知识产权许可与咨询',
    itemNameEn: 'Intellectual property licensing and consultancy',
    itemCode: '450201',
    isCore: false,
    importance: 'DEFENSE',
    notes: '商标维权与品牌授权防御项',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  },
  {
    id: 'nice-4502',
    classNum: 45,
    classTitle: '第45类 - 知识产权法律与安全服务',
    categoryType: 'SERVICE',
    groupCode: '4506',
    groupName: '知识产权代理与法律服务',
    itemNameCn: '商标代理与版权咨询服务',
    itemNameEn: 'Trademark agency services',
    itemCode: '450215',
    isCore: false,
    importance: 'DEFENSE',
    notes: '品牌知识产权资产管理服务',
    status: 'ACTIVE',
    updatedAt: '2026-08-28 10:00'
  }
];
