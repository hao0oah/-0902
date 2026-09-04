import { NiceClassificationItem, NiceClassSummary } from './niceClassificationData';

// 类似商品和服务区分表 (基于尼斯分类第12版与中国商标局官方标准区分表)
// 包含全部 01 - 45 类的所有官方群组与代表性规范商品/服务项目

export const FULL_STANDARD_NICE_CLASSES_META: NiceClassSummary[] = [
  {
    classNum: 1,
    classTitle: '第01类 - 工业化工与科学原料',
    categoryType: 'GOODS',
    description: '用于工业、科学、摄影、农业、园艺和林业的化学品；未加工人造树脂；未加工塑料；灭火和防火用合成物；淬火和焊接用制剂；鞣制动物皮用物质；工业用粘合剂；油灰及其他膏状填料；堆肥、肥料；工业用生物制剂',
    defaultGroups: [
      { code: '0101', name: '工业气体，单质' },
      { code: '0102', name: '用于工业、科学、农业、园艺、林业的工业化工原料' },
      { code: '0103', name: '放射性元素及其化学品' },
      { code: '0104', name: '用于工业、科学的化学品、化学制剂，不属于其他类别的化学品' },
      { code: '0105', name: '用于农业、园艺、林业的化学品、化学制剂' },
      { code: '0106', name: '化学试剂' },
      { code: '0107', name: '摄影用化学用品及材料' },
      { code: '0108', name: '未加工的人造合成树脂，未加工塑料物质' },
      { code: '0109', name: '肥料' },
      { code: '0110', name: '灭火、防火用合成物' },
      { code: '0111', name: '淬火用化学制剂' },
      { code: '0112', name: '焊接用化学制剂' },
      { code: '0113', name: '食品工业用化学品' },
      { code: '0114', name: '鞣料及皮革用化学品' },
      { code: '0115', name: '工业用粘合剂和胶（不包括纸品用胶）' },
      { code: '0116', name: '纸浆' }
    ]
  },
  {
    classNum: 2,
    classTitle: '第02类 - 颜料油漆与防腐材料',
    categoryType: 'GOODS',
    description: '颜料，清漆，漆；防锈剂和木材防腐剂；着色剂，媒染剂；未加工的天然树脂；绘画、装潢、印刷和艺术用金属箔及金属粉',
    defaultGroups: [
      { code: '0201', name: '染料，媒染剂（不包括食用）' },
      { code: '0202', name: '颜料（不包括食用、绝缘用），颜色，涂料' },
      { code: '0203', name: '食品用着色剂' },
      { code: '0204', name: '油墨' },
      { code: '0205', name: '防锈剂，木材防腐剂' },
      { code: '0206', name: '未加工的天然树脂' },
      { code: '0207', name: '金属箔及金属粉' }
    ]
  },
  {
    classNum: 3,
    classTitle: '第03类 - 日化用品与洗护化妆洁齿',
    categoryType: 'GOODS',
    description: '不含药物的化妆品和梳洗用制剂；不含药物的洁齿剂；香水，精油；洗衣用漂白剂及其他物料；清洁、去光、去渍及研磨用制剂',
    defaultGroups: [
      { code: '0301', name: '肥皂，香皂及其他人用洗洁物品，洗衣用漂白剂及其他物料' },
      { code: '0302', name: '清洁、去渍用制剂' },
      { code: '0303', name: '抛光、擦亮制剂' },
      { code: '0304', name: '研磨用材料及其制剂' },
      { code: '0305', name: '香料，香精油' },
      { code: '0306', name: '化妆品（不包括动物用化妆品）' },
      { code: '0307', name: '牙膏，洗牙用制剂，洁齿剂及口腔清新剂' },
      { code: '0308', name: '熏料' },
      { code: '0309', name: '动物用洗涤剂、动物用化妆品' },
      { code: '0310', name: '室内芳香剂' }
    ]
  },
  {
    classNum: 4,
    classTitle: '第04类 - 工业用油与燃料润滑剂',
    categoryType: 'GOODS',
    description: '工业用油和油脂，蜡；润滑剂；吸收、润湿和结合灰尘用配料；燃料和照明物料；照明用蜡烛和灯芯',
    defaultGroups: [
      { code: '0401', name: '工业用油及油脂，润滑油，润滑剂（不包括燃料用油）' },
      { code: '0402', name: '液体、气体燃料和照明燃料' },
      { code: '0403', name: '固体燃料' },
      { code: '0404', name: '工业用蜡' },
      { code: '0405', name: '照明用蜡烛和灯芯' },
      { code: '0406', name: '吸收、润湿和结合灰尘用配料' }
    ]
  },
  {
    classNum: 5,
    classTitle: '第05类 - 医药卫生与医用制剂',
    categoryType: 'GOODS',
    description: '药品，医用和兽医用制剂；医用卫生制剂；医用或兽医用营养食物和物质，婴儿食品；人用和动物用膳食补充剂；贴膏，绷敷材料；填塞牙孔用料，牙模用料；消毒剂；消灭有害动物制剂；杀真菌剂，除莠剂',
    defaultGroups: [
      { code: '0501', name: '药品，消毒剂，中药药材，药酒' },
      { code: '0502', name: '医用营养品，人用膳食补充剂，婴儿食品' },
      { code: '0503', name: '净化制剂' },
      { code: '0504', name: '兽药，动物用膳食补充剂' },
      { code: '0505', name: '杀虫剂，灭鼠剂，农药' },
      { code: '0506', name: '卫生用品，绷敷材料，医用保健袋' },
      { code: '0507', name: '填塞牙孔用料，牙科用蜡，假牙用瓷料' },
      { code: '0508', name: '单一商品（医用培养基等）' }
    ]
  },
  {
    classNum: 6,
    classTitle: '第06类 - 普通金属与金属建材五金',
    categoryType: 'GOODS',
    description: '普通金属及其合金，金属矿石；金属建筑材料；可移动金属建筑物；非电气用金属缆线；金属小五金器具；金属存储和运输用集装箱；保险柜',
    defaultGroups: [
      { code: '0601', name: '不属别类的常用金属及合金，金属矿石' },
      { code: '0602', name: '金属建筑材料及构件' },
      { code: '0603', name: '金属建筑，金属建筑物' },
      { code: '0604', name: '铁路金属材料' },
      { code: '0605', name: '非电气用金属缆线及金属线' },
      { code: '0606', name: '管道用金属套管，金属阀门' },
      { code: '0607', name: '钉及标准紧固件' },
      { code: '0608', name: '家具及门窗的金属附件' },
      { code: '0609', name: '日用金属器具，金属小五金器具' },
      { code: '0610', name: '非电气用缆绳及带' },
      { code: '0611', name: '金属存储和运输用集装箱' },
      { code: '0612', name: '金属锁，钥匙' },
      { code: '0613', name: '保险柜，金属柜' },
      { code: '0614', name: '金属标牌' },
      { code: '0615', name: '动物用金属器具' },
      { code: '0616', name: '焊接用金属材料' }
    ]
  },
  {
    classNum: 7,
    classTitle: '第07类 - 机械设备与电机马达',
    categoryType: 'GOODS',
    description: '机器，机床，电动工具；马达和引擎；机器联结器和传动机件；非手动农业器具；孵化器；自动售货机',
    defaultGroups: [
      { code: '0701', name: '农业用机械及部件' },
      { code: '0702', name: '渔业用机械及仪器' },
      { code: '0703', name: '伐木、锯木机械' },
      { code: '0704', name: '造纸及加工纸机械' },
      { code: '0705', name: '印刷工业用机械' },
      { code: '0706', name: '纤维加工及纺织机械' },
      { code: '0707', name: '缝纫、制鞋机械' },
      { code: '0708', name: '食品及饮料加工机械' },
      { code: '0709', name: '烟草工业机械' },
      { code: '0710', name: '皮革加工机械' },
      { code: '0711', name: '建筑、铁道、土木工程机械' },
      { code: '0712', name: '采矿、选矿机械' },
      { code: '0713', name: '冶炼工业用机械设备' },
      { code: '0714', name: '化学工业用机械' },
      { code: '0715', name: '地质勘探、采油用机械' },
      { code: '0724', name: '机床，金属加工机械' },
      { code: '0747', name: '喷漆机，喷雾器，涂胶机' },
      { code: '0748', name: '发电机，马达，电机' },
      { code: '0749', name: '泵，阀门，气体压缩机' },
      { code: '0750', name: '机器传动用联轴节，传动轴' },
      { code: '0751', name: '焊接机械' },
      { code: '0752', name: '清洁、废物处理机械，超声波清洗机' },
      { code: '0753', name: '单一商品（电动挤牙膏机等）' },
      { code: '0754', name: '电镀设备' }
    ]
  },
  {
    classNum: 8,
    classTitle: '第08类 - 手工工具与刀剪餐具',
    categoryType: 'GOODS',
    description: '手工具和器具（手动的）；刀、叉和勺餐具；除火器外的随身武器；剃刀',
    defaultGroups: [
      { code: '0801', name: '手动研磨器具' },
      { code: '0802', name: '小农具（手动的）' },
      { code: '0803', name: '林业、园艺用手工具' },
      { code: '0804', name: '畜牧业用手工具' },
      { code: '0805', name: '渔业用手工具' },
      { code: '0806', name: '理发工具，修指甲刀，剃须刀' },
      { code: '0807', name: '非动力手工具（不包括刀、剪）' },
      { code: '0808', name: '手工操作的手工具' },
      { code: '0809', name: '专业用手工具' },
      { code: '0810', name: '刀剪（肉类加工、皮革加工用刀）' },
      { code: '0811', name: '文具刀、随身武器' },
      { code: '0812', name: '餐具刀、叉、匙' }
    ]
  },
  {
    classNum: 9,
    classTitle: '第09类 - 科学仪器与电子数码智能设备',
    categoryType: 'GOODS',
    description: '科学、研究、导航、测量、摄影、电影、视听、光学、衡具、量具、信号、探测、测试、检验、救生和教学用装置及仪器；处理、开关、转换、积累、调节或控制电的配送或使用的装置和仪器；录制、传送、重放或处理声音、影像或数据的装置和仪器；已录制和可下载的媒体，计算机软件；潜水服；灭火设备',
    defaultGroups: [
      { code: '0901', name: '电子计算机及其外部设备，智能手机，芯片' },
      { code: '0902', name: '记录、自动售票机及投币启动设备用机械机构' },
      { code: '0903', name: '其他办公用机械（不包括打字机、誊写机、油印机）' },
      { code: '0904', name: '衡器' },
      { code: '0905', name: '量具' },
      { code: '0906', name: '信号器具' },
      { code: '0907', name: '通讯导航设备，智能手环，蓝牙耳机' },
      { code: '0908', name: '音像设备' },
      { code: '0909', name: '摄影、电影用具及仪器' },
      { code: '0910', name: '测量仪器，精密天平' },
      { code: '0911', name: '光学仪器' },
      { code: '0912', name: '光电传输材料，电缆' },
      { code: '0913', name: '电器用晶体及碳素材料，电子元器件' },
      { code: '0914', name: '电器成套设备及控制装置' },
      { code: '0915', name: '电解装置' },
      { code: '0916', name: '灭火器具' },
      { code: '0918', name: '工业用X光机械设备' },
      { code: '0919', name: '安全救护器具' },
      { code: '0920', name: '警报装置，电铃' },
      { code: '0921', name: '眼镜及附件' },
      { code: '0922', name: '电池，充电器，无线充电底座' },
      { code: '0924', name: '其他未列明的电器设备' }
    ]
  },
  {
    classNum: 10,
    classTitle: '第10类 - 医疗器械与牙科口腔设备',
    categoryType: 'GOODS',
    description: '外科、医疗、牙科和兽医用仪器及器械；假肢，假眼和假牙；矫形用物品；缝合材料；残疾人专用治疗用辅助装置；按摩器械；婴儿护理用器械、器具及用品；性生活用器具、器械及用品',
    defaultGroups: [
      { code: '1001', name: '外科、医疗和兽医用仪器、器械、设备' },
      { code: '1002', name: '牙科设备及器具，医用洁牙机，电动牙科手机' },
      { code: '1003', name: '医疗用电、核、磁、X射线设备' },
      { code: '1004', name: '医疗用辅助器具、设备和用品' },
      { code: '1005', name: '奶瓶，奶嘴，吸奶器' },
      { code: '1006', name: '避孕器具，性爱用品' },
      { code: '1007', name: '假肢，假发和假器官' },
      { code: '1008', name: '矫形用物品' },
      { code: '1009', name: '缝合材料' }
    ]
  },
  {
    classNum: 11,
    classTitle: '第11类 - 照明灯具与消毒加热清洁小家电',
    categoryType: 'GOODS',
    description: '照明、加热、冷却、蒸汽发生、烹饪、干燥、通风、供水和卫生用设备及装置',
    defaultGroups: [
      { code: '1101', name: '照明用设备、器具' },
      { code: '1104', name: '烹调及民用电气加热设备' },
      { code: '1105', name: '制冷、冷藏设备' },
      { code: '1106', name: '干燥、通风、空气调节设备' },
      { code: '1107', name: '加温、蒸汽设备' },
      { code: '1108', name: '水暖管件，水龙头' },
      { code: '1109', name: '卫生设备，浴室装置，消毒柜，紫外线消毒器' },
      { code: '1110', name: '净化和过滤设备，净水器' },
      { code: '1111', name: '小型取暖器' }
    ]
  },
  {
    classNum: 12,
    classTitle: '第12类 - 运载工具与汽配交通',
    categoryType: 'GOODS',
    description: '运载工具；陆、空、海用运载装置',
    defaultGroups: [
      { code: '1201', name: '火车及其零部件' },
      { code: '1202', name: '汽车、电车、摩托车及其零部件' },
      { code: '1204', name: '自行车、三轮车及其零部件' },
      { code: '1205', name: '缆车，架空运输设备' },
      { code: '1206', name: '轮椅，手推车，儿童推车' },
      { code: '1207', name: '畜力车辆' },
      { code: '1208', name: '轮胎及轮胎修理补胎工具' },
      { code: '1209', name: '空用运载工具' },
      { code: '1210', name: '水用运载工具' },
      { code: '1211', name: '运载工具防盗设备及部件' }
    ]
  },
  {
    classNum: 13,
    classTitle: '第13类 - 烟火爆竹与军火枪械',
    categoryType: 'GOODS',
    description: '火器；军火及弹药；爆炸物；烟火',
    defaultGroups: [
      { code: '1301', name: '火器，军火及弹药' },
      { code: '1302', name: '爆炸物' },
      { code: '1303', name: '烟火，爆竹' },
      { code: '1304', name: '个人防护用喷雾罐' }
    ]
  },
  {
    classNum: 14,
    classTitle: '第14类 - 珠宝首饰与贵金属钟表计时',
    categoryType: 'GOODS',
    description: '贵金属及其合金；首饰，贵重宝石和半宝石；钟表和计时仪器',
    defaultGroups: [
      { code: '1401', name: '贵金属，贵金属合金，贵金属盒' },
      { code: '1402', name: '贵金属重制品，纪念币' },
      { code: '1403', name: '珠宝，首饰，贵重宝石' },
      { code: '1404', name: '钟，表，计时器，沙漏' }
    ]
  },
  {
    classNum: 15,
    classTitle: '第15类 - 乐器与音乐周边器材',
    categoryType: 'GOODS',
    description: '乐器；乐谱架和乐器架；指挥棒',
    defaultGroups: [
      { code: '1501', name: '键盘乐器（钢琴等）' },
      { code: '1502', name: '弦乐器（吉他、小提琴等）' },
      { code: '1503', name: '管乐器' },
      { code: '1504', name: '打击乐器' },
      { code: '1505', name: '乐器辅助用品及配件' }
    ]
  },
  {
    classNum: 16,
    classTitle: '第16类 - 办公用品与纸品包装印刷',
    categoryType: 'GOODS',
    description: '纸和纸板；印刷品；装订用品；照片；文具和办公用品（家具除外）；文具用或家庭用粘合剂；绘画材料和艺术家用材料；画笔；教学用品；包装和打包用塑料纸、塑料膜和塑料袋；印刷铅字，印版',
    defaultGroups: [
      { code: '1601', name: '工业用纸，纸巾，面巾纸' },
      { code: '1602', name: '技术用纸（包括电传纸）' },
      { code: '1603', name: '生活用纸' },
      { code: '1604', name: '纸板，纸盒，包装纸袋' },
      { code: '1605', name: '办公、日用纸制品' },
      { code: '1606', name: '印刷出版物，书籍，杂志，海报' },
      { code: '1607', name: '照片，图片' },
      { code: '1608', name: '装订用品' },
      { code: '1609', name: '纸夹，办公文具' },
      { code: '1610', name: '办公用印章，印油' },
      { code: '1611', name: '笔，圆珠笔，毛笔，墨水' },
      { code: '1612', name: '墨汁，修正液' },
      { code: '1613', name: '绘图仪器' },
      { code: '1614', name: '雕刻机用材料' },
      { code: '1615', name: '教学用具' },
      { code: '1616', name: '模型，标本' },
      { code: '1617', name: '书画装裱用物' },
      { code: '1618', name: '文具用或家庭用粘合剂' },
      { code: '1619', name: '绘图用具，艺术家用画笔' }
    ]
  },
  {
    classNum: 17,
    classTitle: '第17类 - 橡胶塑料制品与密封隔热绝缘',
    categoryType: 'GOODS',
    description: '未加工和半加工的橡胶、古塔胶、树胶、石棉、云母及这些材料的代用品；生产用成型塑料和树脂挤出制品；填塞、密封和绝缘用材料；非金属软管和非金属管接头',
    defaultGroups: [
      { code: '1701', name: '不属别类的橡胶，古塔胶，树胶' },
      { code: '1702', name: '非金属密封件，防水圈，硅胶密封条' },
      { code: '1703', name: '石棉，矿物棉' },
      { code: '1704', name: '绝缘材料及其制品' },
      { code: '1705', name: '防热、隔音材料' },
      { code: '1706', name: '软管，非金属管道' },
      { code: '1707', name: '半加工塑料薄膜' },
      { code: '1708', name: '单一商品（电绝缘胶带等）' }
    ]
  },
  {
    classNum: 18,
    classTitle: '第18类 - 皮革皮具与箱包雨伞旅行用品',
    categoryType: 'GOODS',
    description: '皮革和人造皮革；毛皮；行李箱和背包；雨伞和阳伞；手杖；鞭，马具和鞍具；动物用项圈、皮带和衣服',
    defaultGroups: [
      { code: '1801', name: '皮革和人造皮革' },
      { code: '1802', name: '旅行箱，手提包，背包，洗漱包，钱包' },
      { code: '1803', name: '裘皮，毛皮' },
      { code: '1804', name: '雨伞，阳伞及其零件' },
      { code: '1805', name: '手杖' },
      { code: '1806', name: '动物用皮具，马具' }
    ]
  },
  {
    classNum: 19,
    classTitle: '第19类 - 非金属建材与石材陶瓷地板',
    categoryType: 'GOODS',
    description: '非金属建筑材料；建筑用非金属刚性管；沥青，柏油；可移动非金属建筑物；非金属纪念碑',
    defaultGroups: [
      { code: '1901', name: '半成品木材' },
      { code: '1902', name: '土，沙，石，石料' },
      { code: '1903', name: '水泥，混凝土' },
      { code: '1904', name: '水泥预制构件' },
      { code: '1905', name: '耐火材料' },
      { code: '1906', name: '建筑用砖，瓦，瓷砖，卫生陶瓷' },
      { code: '1907', name: '非金属管' },
      { code: '1908', name: '柏油，沥青' },
      { code: '1909', name: '建筑用非金属建筑物及构件' },
      { code: '1910', name: '非金属门窗' },
      { code: '1911', name: '建筑用玻璃' }
    ]
  },
  {
    classNum: 20,
    classTitle: '第20类 - 家具与收纳镜子非金属五金制品',
    categoryType: 'GOODS',
    description: '家具，镜子，相框；未加工或半加工的骨、角、鲸骨或珍珠母；贝壳；海泡石；黄琥珀；存储或运输用非金属容器',
    defaultGroups: [
      { code: '2001', name: '家具，收纳架，浴室镜柜' },
      { code: '2002', name: '非金属容器及附件' },
      { code: '2003', name: '不属别类的工业、建筑用非金属配件' },
      { code: '2004', name: '镜子，相框及竹木工艺品' },
      { code: '2005', name: '藤、草、竹、芦苇及编织制品' },
      { code: '2006', name: '未加工或半加工的骨、角、牙' },
      { code: '2007', name: '非金属锁，非金属紧固件' },
      { code: '2008', name: '家具用非金属附件' },
      { code: '2009', name: '垫，枕，床垫' },
      { code: '2010', name: '非金属活动建筑物' },
      { code: '2011', name: '动物用制品' }
    ]
  },
  {
    classNum: 21,
    classTitle: '第21类 - 厨房洁具与牙刷口腔日用器皿',
    categoryType: 'GOODS',
    description: '家用或厨房用器具和容器；烹饪用具和餐具（刀、叉、匙除外）；梳子和海绵；刷子（画笔除外）；制刷材料；清洁用具；未加工或半加工玻璃（建筑用玻璃除外）；玻璃器皿、瓷器和陶器',
    defaultGroups: [
      { code: '2101', name: '厨房炊事用具及餐具（不包括刀、叉、匙）' },
      { code: '2102', name: '不属别类的玻璃器皿' },
      { code: '2103', name: '瓷器，陶器（日用、艺术、建筑除外）' },
      { code: '2104', name: '玻璃、瓷、陶等工艺品' },
      { code: '2105', name: '茶具、酒具、咖啡具及饮水用具' },
      { code: '2106', name: '家庭日用及卫生器具，漱口杯，皂盒' },
      { code: '2107', name: '梳子，刷子（不包括牙刷、毛笔），海绵' },
      { code: '2108', name: '刷子及制刷材料，牙刷，电动牙刷，刷头' },
      { code: '2109', name: '牙签，牙线，冲牙器，刮舌器' },
      { code: '2110', name: '擦洗用具，扫帚，拖把' },
      { code: '2111', name: '隔热用具，保温瓶' },
      { code: '2112', name: '非电气用家用研磨机' },
      { code: '2113', name: '未加工或半加工玻璃' },
      { code: '2114', name: '捕虫、灭虫器具' },
      { code: '2115', name: '宠物用器具' }
    ]
  },
  {
    classNum: 22,
    classTitle: '第22类 - 绳网袋篷与包装衬垫纤维材料',
    categoryType: 'GOODS',
    description: '绳和绳索；网；帐篷和防水遮布；纺织品或合成材料制遮篷；帆；运输和储存散装物用麻袋；衬垫和填充材料（纸或纸板、橡胶、塑料制除外）；纺织用纤维原料及其替代品',
    defaultGroups: [
      { code: '2201', name: '缆，绳，网' },
      { code: '2202', name: '网' },
      { code: '2203', name: '帐篷，遮阳篷，帆' },
      { code: '2204', name: '包装用麻袋，束口袋' },
      { code: '2205', name: '衬垫材料（橡胶、塑料除外）' },
      { code: '2206', name: '纺织用纤维原料' }
    ]
  },
  {
    classNum: 23,
    classTitle: '第23类 - 纺织用纱线与缝纫线',
    categoryType: 'GOODS',
    description: '纺织用纱和线',
    defaultGroups: [
      { code: '2301', name: '纺织用纱和线' },
      { code: '2302', name: '线' },
      { code: '2303', name: '毛线' }
    ]
  },
  {
    classNum: 24,
    classTitle: '第24类 - 布料纺织品与毛巾床品家居织物',
    categoryType: 'GOODS',
    description: '织物及其替代品；家庭日用纺织品；纺织品制或塑料制帘',
    defaultGroups: [
      { code: '2401', name: '纺织织物，棉布，丝绸' },
      { code: '2402', name: '特殊用织物' },
      { code: '2403', name: '纺织品毛巾，浴巾，柔巾，洗脸巾' },
      { code: '2404', name: '床上用品，床单，被套，枕套' },
      { code: '2405', name: '室内装饰用织品' },
      { code: '2406', name: '旗帜' },
      { code: '2407', name: '洗涤用手套' }
    ]
  },
  {
    classNum: 25,
    classTitle: '第25类 - 服装鞋帽与袜套饰品',
    categoryType: 'GOODS',
    description: '服装，鞋，帽',
    defaultGroups: [
      { code: '2501', name: '衣物，居家服，睡衣，内衣' },
      { code: '2502', name: '婴儿纺织用品' },
      { code: '2503', name: '特种运动服装' },
      { code: '2504', name: '防水服' },
      { code: '2507', name: '鞋，居家防滑拖鞋' },
      { code: '2508', name: '帽' },
      { code: '2509', name: '袜' },
      { code: '2510', name: '手套（服装用）' },
      { code: '2511', name: '领带，围巾，披巾' },
      { code: '2512', name: '腰带，皮带' }
    ]
  },
  {
    classNum: 26,
    classTitle: '第26类 - 纽扣拉链与饰品发卡花边假发',
    categoryType: 'GOODS',
    description: '花边，饰带和刺绣品，小饰带和发带；纽扣，钩扣，扣针和缝针；人造花；发饰；假发',
    defaultGroups: [
      { code: '2601', name: '花边，饰品' },
      { code: '2602', name: '缝纫用品，纽扣，拉链' },
      { code: '2603', name: '纽扣，拉链' },
      { code: '2604', name: '假发，假胡须' },
      { code: '2605', name: '卷发用具' },
      { code: '2606', name: '发卡，束发带，发箍' },
      { code: '2607', name: '扣针，针' },
      { code: '2608', name: '人造花' }
    ]
  },
  {
    classNum: 27,
    classTitle: '第27类 - 地毯地垫与席类墙纸铺地材料',
    categoryType: 'GOODS',
    description: '地毯，地席，垫席，亚麻地油及其他铺地材料；非纺织品制墙纸',
    defaultGroups: [
      { code: '2701', name: '地毯' },
      { code: '2702', name: '席类' },
      { code: '2703', name: '浴室吸水地垫，防滑垫' },
      { code: '2704', name: '非纺织品制壁挂，墙纸' }
    ]
  },
  {
    classNum: 28,
    classTitle: '第28类 - 玩具与体育健身器材游戏用品',
    categoryType: 'GOODS',
    description: '游戏器具和玩具；视频游戏机；体育和健身器材；节庆及派对用品；圣诞树装饰品',
    defaultGroups: [
      { code: '2801', name: '娱乐博弈器具' },
      { code: '2802', name: '玩具，儿童益智玩具，互动发光玩具' },
      { code: '2803', name: '棋类，牌类' },
      { code: '2804', name: '球类及器材' },
      { code: '2805', name: '健身器材' },
      { code: '2806', name: '射箭器材' },
      { code: '2807', name: '体操、田径器材' },
      { code: '2808', name: '游泳池及用品' },
      { code: '2809', name: '运动防护器具' },
      { code: '2810', name: '圣诞树装饰品' },
      { code: '2811', name: '钓具' }
    ]
  },
  {
    classNum: 29,
    classTitle: '第29类 - 肉禽蛋奶与食用油脂干果罐头',
    categoryType: 'GOODS',
    description: '肉，鱼，家禽和野味；肉汁；腌渍、冷冻、干制及煮熟的水果和蔬菜；果冻，果酱，蜜饯；蛋；奶，奶酪，黄油，酸奶和其他乳制品；食用油和油脂',
    defaultGroups: [
      { code: '2901', name: '肉，非活家禽，野味，肉汁' },
      { code: '2902', name: '非活水产品' },
      { code: '2903', name: '罐头食品（业务所属类别食品）' },
      { code: '2904', name: '腌渍、干制水果及坚果' },
      { code: '2905', name: '腌制、干制蔬菜' },
      { code: '2906', name: '蛋品' },
      { code: '2907', name: '奶，乳制品，益生菌酸奶' },
      { code: '2908', name: '食用油脂' },
      { code: '2910', name: '果冻，果酱' },
      { code: '2911', name: '加工过的坚果' },
      { code: '2913', name: '干制食用菌' }
    ]
  },
  {
    classNum: 30,
    classTitle: '第30类 - 方便食品与糖果茶咖啡调味品',
    categoryType: 'GOODS',
    description: '咖啡，茶，可可和咖啡代用品；米，面食和面条；木薯粉和西米；面粉和谷类制品；面包、糕点和甜食；巧克力；冰淇淋，果汁刨冰和其他食用冰；糖，蜂蜜，糖浆；酵母，发酵粉；盐，调味品，香辛料，腌制香草；醋，酱汁和其他调味品；冰（冻结的水）',
    defaultGroups: [
      { code: '3001', name: '咖啡，可可，代用咖啡' },
      { code: '3002', name: '茶，茶饮料' },
      { code: '3003', name: '糖' },
      { code: '3004', name: '糖果，无糖口香糖，薄荷润喉糖' },
      { code: '3005', name: '蜂蜜，蜂皇浆' },
      { code: '3006', name: '面包，糕点，饼干' },
      { code: '3007', name: '方便面，米粉' },
      { code: '3008', name: '谷物制品，燕麦' },
      { code: '3009', name: '面粉及谷类粉' },
      { code: '3013', name: '食用冰，冰淇淋' },
      { code: '3014', name: '食盐' },
      { code: '3015', name: '酱油，醋' },
      { code: '3016', name: '调味品，香辛料' }
    ]
  },
  {
    classNum: 31,
    classTitle: '第31类 - 生鲜农产与活动物花卉宠物饲料',
    categoryType: 'GOODS',
    description: '未加工的农业、水产养殖、园艺和林业产品；未加工的谷物和种子；新鲜水果和蔬菜，新鲜香草；自然花卉和植物；花卉球茎、籽苗和种子；活动物；动物的饲料和饮料；麦芽',
    defaultGroups: [
      { code: '3101', name: '未加工林业产品' },
      { code: '3102', name: '未加工谷物及农业原料' },
      { code: '3103', name: '花卉，自然花，植物' },
      { code: '3104', name: '活动物' },
      { code: '3105', name: '新鲜水果，坚果' },
      { code: '3106', name: '新鲜蔬菜' },
      { code: '3107', name: '种籽' },
      { code: '3108', name: '动物饲料，宠物洁齿骨，宠物食品' },
      { code: '3109', name: '麦芽' },
      { code: '3110', name: '动物垫料' }
    ]
  },
  {
    classNum: 32,
    classTitle: '第32类 - 啤酒与无酒精饮料矿泉水果汁',
    categoryType: 'GOODS',
    description: '啤酒；无酒精饮料；矿泉水和汽水；水果饮料及果汁；糖浆及其他制无酒精饮料用制剂',
    defaultGroups: [
      { code: '3201', name: '啤酒，麦芽啤酒' },
      { code: '3202', name: '无酒精饮料，苏打水，矿泉水，气泡水，果汁' },
      { code: '3203', name: '制作饮料用糖浆及配料' }
    ]
  },
  {
    classNum: 33,
    classTitle: '第33类 - 酒与含酒精饮料',
    categoryType: 'GOODS',
    description: '含酒精饮料（啤酒除外）；制饮料用含酒精配料',
    defaultGroups: [
      { code: '3301', name: '白酒，威士忌，果酒，含酒精鸡尾酒，朗姆酒' }
    ]
  },
  {
    classNum: 34,
    classTitle: '第34类 - 烟草与吸烟用具电子烟雾化器',
    categoryType: 'GOODS',
    description: '烟草和烟草替代品；香烟和雪茄；电子香烟和吸烟者用口腔雾化器；吸烟用具；火柴',
    defaultGroups: [
      { code: '3401', name: '烟草，雪茄，香烟' },
      { code: '3402', name: '烟具，烟灰缸' },
      { code: '3403', name: '火柴' },
      { code: '3404', name: '吸烟用打火机' },
      { code: '3405', name: '烟草用滤嘴' },
      { code: '3406', name: '香烟纸，卷烟管' },
      { code: '3407', name: '电子香烟及其雾化器，电子烟烟油' }
    ]
  },

  // ==================== 35-45类 服务分类 (SERVICE) ====================
  {
    classNum: 35,
    classTitle: '第35类 - 广告营销与商业管理电商零售',
    categoryType: 'SERVICE',
    description: '广告；商业经营、组织和管理；办公事务',
    defaultGroups: [
      { code: '3501', name: '广告，商业橱窗布置，网络广告传播' },
      { code: '3502', name: '工商管理辅助，商业中介，特许经营的商业管理' },
      { code: '3503', name: '为商品和服务的买卖双方提供在线市场，日用品零售或批发' },
      { code: '3504', name: '人事管理咨询' },
      { code: '3505', name: '商业企业迁移' },
      { code: '3506', name: '办公事务，文秘' },
      { code: '3507', name: '财务审计，会计' },
      { code: '3508', name: '单一服务（寻找赞助等）' },
      { code: '3509', name: '药品、医疗用品零售或批发服务' }
    ]
  },
  {
    classNum: 36,
    classTitle: '第36类 - 金融保险与不动产投资资产管理',
    categoryType: 'SERVICE',
    description: '金融，货币和银行服务；保险服务；不动产事务',
    defaultGroups: [
      { code: '3601', name: '保险' },
      { code: '3602', name: '金融事务，电子钱包支付服务，银行，信贷' },
      { code: '3603', name: '珍贵物品保管' },
      { code: '3604', name: '不动产事务，房屋中介，物业管理' },
      { code: '3605', name: '海关金融经纪' },
      { code: '3606', name: '担保' },
      { code: '3607', name: '慈善募捐' },
      { code: '3608', name: '受托管理' },
      { code: '3609', name: '典当' }
    ]
  },
  {
    classNum: 37,
    classTitle: '第37类 - 建筑施工与电器家电维修安装保养',
    categoryType: 'SERVICE',
    description: '建筑建设；维修和安装服务；采矿，石油和天然气钻探',
    defaultGroups: [
      { code: '3701', name: '建筑建设，房屋修建' },
      { code: '3702', name: '建筑设备安装' },
      { code: '3703', name: '开采服务' },
      { code: '3704', name: '加热设备安装和修理' },
      { code: '3705', name: '制冷设备安装和修理' },
      { code: '3706', name: '电器家电安装和修理，电动牙刷及智能硬件维修' },
      { code: '3707', name: '办公设备修理' },
      { code: '3708', name: '交通工具保养和修理' },
      { code: '3709', name: '摄影器材修理' },
      { code: '3710', name: '钟表修理' },
      { code: '3711', name: '保险柜修理' },
      { code: '3712', name: '家具修缮' },
      { code: '3713', name: '衣服、皮革的修整、清洗' },
      { code: '3714', name: '建筑物清洗，消毒清洁服务' },
      { code: '3715', name: '灭害，除害' },
      { code: '3716', name: '乐器修理' },
      { code: '3717', name: '医疗器械安装和修理' }
    ]
  },
  {
    classNum: 38,
    classTitle: '第38类 - 电信通信与网络数据传输',
    categoryType: 'SERVICE',
    description: '电信服务',
    defaultGroups: [
      { code: '3801', name: '进行电信连接，互联网接入服务' },
      { code: '3802', name: '通信服务，蓝牙数据同步传输，即时通讯，信息传送' }
    ]
  },
  {
    classNum: 39,
    classTitle: '第39类 - 物流运输与仓储包装旅游出行',
    categoryType: 'SERVICE',
    description: '运输；商品的包装和贮存；旅行安排',
    defaultGroups: [
      { code: '3901', name: '水上运输' },
      { code: '3902', name: '铁路运输' },
      { code: '3903', name: '陆地运输，货车运输' },
      { code: '3904', name: '空中运输' },
      { code: '3905', name: '其他运输服务' },
      { code: '3906', name: '商品包装，货物打包' },
      { code: '3907', name: '潜水打捞' },
      { code: '3908', name: '货物贮存，仓储' },
      { code: '3909', name: '水闸运营' },
      { code: '3910', name: '管道运输' },
      { code: '3911', name: '旅行安排，旅游导游' },
      { code: '3912', name: '快递配送服务' }
    ]
  },
  {
    classNum: 40,
    classTitle: '第40类 - 材料加工与定制生产印刷装配',
    categoryType: 'SERVICE',
    description: '材料处理；废物和垃圾的回收利用；空气净化和水处理；印刷服务；食物和饮料的保存',
    defaultGroups: [
      { code: '4001', name: '综合加工及代工，注塑定制加工' },
      { code: '4002', name: '金属加工，精密机械零件加工' },
      { code: '4003', name: '纺织品、织物整理，精密植毛加工' },
      { code: '4004', name: '木材加工' },
      { code: '4005', name: '纸张加工' },
      { code: '4006', name: '玻璃加工' },
      { code: '4007', name: '陶瓷加工' },
      { code: '4008', name: '食物、饮料加工' },
      { code: '4009', name: '皮革、裘皮加工' },
      { code: '4010', name: '影像冲印' },
      { code: '4011', name: '废物处理，废品回收' },
      { code: '4012', name: '水处理，空气净化' },
      { code: '4015', name: '书籍装订，印刷服务' }
    ]
  },
  {
    classNum: 41,
    classTitle: '第41类 - 教育培训与文化体育文娱活动',
    categoryType: 'SERVICE',
    description: '教育；提供培训；娱乐；文体活动',
    defaultGroups: [
      { code: '4101', name: '学校教育，技能培训，口腔健康科普讲座' },
      { code: '4102', name: '组织文娱体育活动，赛事组织' },
      { code: '4103', name: '图书出版，在线电子书籍出版' },
      { code: '4104', name: '电影、影视节目制作，视频剪辑' },
      { code: '4105', name: '文娱活动，演出，音乐会' },
      { code: '4106', name: '游乐园，健身俱乐部' },
      { code: '4107', name: '摄影，视频录制' }
    ]
  },
  {
    classNum: 42,
    classTitle: '第42类 - 科技研发与计算机软件设计SaaS',
    categoryType: 'SERVICE',
    description: '科学技术服务和与之相关的研究与设计服务；工业分析、工业研究和工业品外观设计服务；质量控制和身份认证服务；计算机硬件与软件的设计与开发',
    defaultGroups: [
      { code: '4209', name: '计算机软件设计、开发、编程与系统分析' },
      { code: '4214', name: '工业品外观设计，造型设计，包装设计' },
      { code: '4216', name: '工程制图，建筑设计' },
      { code: '4217', name: '室内装饰设计' },
      { code: '4218', name: '服装设计' },
      { code: '4220', name: '技术研究，质量检验，材料测试' },
      { code: '4227', name: '云计算，SaaS软件即服务，平台即服务' }
    ]
  },
  {
    classNum: 43,
    classTitle: '第43类 - 餐饮住宿与咖啡馆酒店服务',
    categoryType: 'SERVICE',
    description: '提供食物和饮料服务；临时住宿',
    defaultGroups: [
      { code: '4301', name: '提供餐饮服务，咖啡馆，茶馆，餐厅' },
      { code: '4302', name: '临时住宿服务，酒店，民宿' },
      { code: '4303', name: '日间托儿所，养老院' },
      { code: '4304', name: '动物寄养' },
      { code: '4305', name: '单一服务（会议室出租等）' },
      { code: '4306', name: '单一服务（酒吧服务等）' }
    ]
  },
  {
    classNum: 44,
    classTitle: '第44类 - 医疗卫生与口腔门诊美容护理',
    categoryType: 'SERVICE',
    description: '医疗服务；兽医服务；人或动物的卫生和美容服务；农业、水产养殖、园艺和林业服务',
    defaultGroups: [
      { code: '4401', name: '医疗服务，牙科门诊，口腔正畸，种植牙护理' },
      { code: '4402', name: '卫生、美容服务，皮肤护理，美甲' },
      { code: '4403', name: '兽医服务，宠物美容' },
      { code: '4404', name: '农业、园艺服务' },
      { code: '4405', name: '单一服务（眼镜行配镜等）' }
    ]
  },
  {
    classNum: 45,
    classTitle: '第45类 - 知识产权法律与安全安防社交服务',
    categoryType: 'SERVICE',
    description: '法律服务；由他人提供的为保护财产和人身安全的安全服务；为满足个人需求由他人提供的私人和社会服务',
    defaultGroups: [
      { code: '4501', name: '安全保卫服务，安保监控' },
      { code: '4502', name: '提供服装租赁' },
      { code: '4503', name: '殡仪服务' },
      { code: '4504', name: '单一服务（消防等）' },
      { code: '4505', name: '交友服务，婚介，个人背景调查' },
      { code: '4506', name: '知识产权代理，商标代理，专利版权咨询，法律维权诉讼' }
    ]
  }
];
