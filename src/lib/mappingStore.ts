export interface ApplicantMappingItem {
  id: string;
  applicant: string;         // 申请人主体
  applicantEn: string;       // 申请人英文
  applicantAddress: string;  // 申请人地址
  applicantAddressEn: string;// 申请人地址英文
}

export interface AgencyMappingItem {
  id: string;
  agencyName: string;      // 承办代理机构
  agencyDocketNo: string;  // 代理机构案卷号
  agentName: string;       // 代理人
}

export const DEFAULT_OFFICIAL_AGENCIES = [
  '中国国家知识产权局 (CNIPA)',
  '新加坡知识产权局 (IPOS)',
  '美国专利商标局 (USPTO)',
  '欧洲联盟知识产权局 (EUIPO)',
  '日本特许厅 (JPO)',
  '韩国特许厅 (KIPO)',
  '世界知识产权组织 (WIPO)',
  '马来西亚知识产权局 (MyIPO)',
  '印度尼西亚知识产权总局 (DGIP)',
  '泰国知识产权局 (DIP)',
  '英国知识产权局 (UKIPO)',
  '德国专利商标局 (DPMA)'
];

export const DEFAULT_PRIORITY_COUNTRIES = [
  '中国',
  '新加坡',
  '马来西亚',
  '美国',
  '欧盟',
  '日本',
  '韩国',
  '印度尼西亚',
  '泰国',
  '越南',
  '英国',
  '澳大利亚',
  '新加坡、马来西亚',
  '东南亚多国联报 (ASEAN)'
];

const INITIAL_APPLICANT_MAPPINGS: ApplicantMappingItem[] = [
  {
    id: 'app-1',
    applicant: '广州星际悦动股份有限公司',
    applicantEn: 'Guangzhou Starfield Delight Co., Ltd.',
    applicantAddress: '广东省广州市天河区珠江东路28号越秀金融大厦38层',
    applicantAddressEn: '38/F, Yuexiu Financial Tower, No.28 Zhujiang East Road, Tianhe District, Guangzhou, Guangdong, China'
  },
  {
    id: 'app-2',
    applicant: '深圳星际悦动科技有限公司',
    applicantEn: 'Shenzhen Starfield Delight Technology Co., Ltd.',
    applicantAddress: '广东省深圳市南山区粤海街道高新南四道18号',
    applicantAddressEn: '18 Gaoxin South 4th Road, Yuehai Street, Nanshan District, Shenzhen, Guangdong, China'
  },
  {
    id: 'app-3',
    applicant: 'usmile Global (Singapore) Pte. Ltd.',
    applicantEn: 'usmile Global (Singapore) Pte. Ltd.',
    applicantAddress: '10 Collyer Quay #10-01 Ocean Financial Centre, Singapore 049315',
    applicantAddressEn: '10 Collyer Quay #10-01 Ocean Financial Centre, Singapore 049315'
  },
  {
    id: 'app-4',
    applicant: '香港星际悦动有限公司',
    applicantEn: 'Hong Kong Starfield Delight Limited',
    applicantAddress: '香港湾仔告士打道108号光大中心15楼',
    applicantAddressEn: '15/F, Everbright Centre, 108 Gloucester Road, Wan Chai, Hong Kong'
  },
  {
    id: 'app-5',
    applicant: '广州笑容加健康科技有限公司',
    applicantEn: 'Guangzhou SmilePlus Health Technology Co., Ltd.',
    applicantAddress: '广东省广州市黄埔区科学城科翔路99号',
    applicantAddressEn: 'No. 99 Kexiang Road, Science City, Huangpu District, Guangzhou, Guangdong, China'
  }
];

const INITIAL_AGENCY_MAPPINGS: AgencyMappingItem[] = [
  {
    id: 'agency-1',
    agencyName: 'Allen & Gledhill LLP (新加坡)',
    agencyDocketNo: 'AG-2026-TM-0891',
    agentName: '张锦程'
  },
  {
    id: 'agency-2',
    agencyName: 'Baker & McKenzie (香港/国际)',
    agencyDocketNo: 'BM-HK-2026-0412',
    agentName: 'David Tan'
  },
  {
    id: 'agency-3',
    agencyName: '北京永新同创知识产权代理有限公司',
    agencyDocketNo: 'YS-CNIPA-2026-1102',
    agentName: '陈海霞'
  },
  {
    id: 'agency-4',
    agencyName: '广州三环专利商标代理有限公司',
    agencyDocketNo: 'SH-GZ-2026-0038',
    agentName: '王立勋'
  },
  {
    id: 'agency-5',
    agencyName: 'Fish & Richardson P.C. (美国)',
    agencyDocketNo: 'FR-US-2026-7819',
    agentName: 'Sarah Jenkins'
  },
  {
    id: 'agency-6',
    agencyName: 'Sonoda & Kobayashi (日本)',
    agencyDocketNo: 'SK-JP-2026-3021',
    agentName: '高桥健一'
  }
];

export interface CountryRegionMappingItem {
  id: string;
  region: string;   // 国家地区 / 区域大洲 (如: 大中华地区, 东亚, 欧洲...)
  country: string;  // 国家 / 地区名称 (如: 中国香港, 日本, 德国-欧盟...)
  code?: string;    // 国家/地区代码(选填)
}

export const INITIAL_COUNTRY_REGION_MAPPINGS: CountryRegionMappingItem[] = [
  // 1. 大中华地区 (3)
  { id: 'cr-1', region: '大中华地区', country: '中国台湾' },
  { id: 'cr-2', region: '大中华地区', country: '中国香港' },
  { id: 'cr-3', region: '大中华地区', country: '中国澳门' },

  // 2. 东亚 (4)
  { id: 'cr-4', region: '东亚', country: '日本' },
  { id: 'cr-5', region: '东亚', country: '韩国' },
  { id: 'cr-6', region: '东亚', country: '朝鲜' },
  { id: 'cr-7', region: '东亚', country: '蒙古' },

  // 3. 南亚 (9)
  { id: 'cr-8', region: '南亚', country: '印度' },
  { id: 'cr-9', region: '南亚', country: '不丹' },
  { id: 'cr-10', region: '南亚', country: '阿富汗' },
  { id: 'cr-11', region: '南亚', country: '尼泊尔' },
  { id: 'cr-12', region: '南亚', country: '巴基斯坦' },
  { id: 'cr-13', region: '南亚', country: '孟加拉国' },
  { id: 'cr-14', region: '南亚', country: '斯里兰卡' },
  { id: 'cr-15', region: '南亚', country: '马尔代夫' },
  { id: 'cr-16', region: '南亚', country: '克什米尔' },

  // 4. 东南亚 (10)
  { id: 'cr-17', region: '东南亚', country: '印度尼西亚' },
  { id: 'cr-18', region: '东南亚', country: '泰国' },
  { id: 'cr-19', region: '东南亚', country: '越南' },
  { id: 'cr-20', region: '东南亚', country: '马来西亚' },
  { id: 'cr-21', region: '东南亚', country: '新加坡' },
  { id: 'cr-22', region: '东南亚', country: '菲律宾' },
  { id: 'cr-23', region: '东南亚', country: '缅甸' },
  { id: 'cr-24', region: '东南亚', country: '柬埔寨' },
  { id: 'cr-25', region: '东南亚', country: '老挝' },
  { id: 'cr-26', region: '东南亚', country: '文莱' },

  // 5. 西亚 (19)
  { id: 'cr-27', region: '西亚', country: '阿联酋' },
  { id: 'cr-28', region: '西亚', country: '阿曼' },
  { id: 'cr-29', region: '西亚', country: '沙特阿拉伯' },
  { id: 'cr-30', region: '西亚', country: '卡塔尔' },
  { id: 'cr-31', region: '西亚', country: '土耳其' },
  { id: 'cr-32', region: '西亚', country: '以色列' },
  { id: 'cr-33', region: '西亚', country: '科威特' },
  { id: 'cr-34', region: '西亚', country: '乌拉圭' },
  { id: 'cr-35', region: '西亚', country: '约旦' },
  { id: 'cr-36', region: '西亚', country: '格鲁吉亚' },
  { id: 'cr-37', region: '西亚', country: '伊朗' },
  { id: 'cr-38', region: '西亚', country: '伊拉克' },
  { id: 'cr-39', region: '西亚', country: '阿塞拜疆' },
  { id: 'cr-40', region: '西亚', country: '亚美尼亚' },
  { id: 'cr-41', region: '西亚', country: '叙利亚' },
  { id: 'cr-42', region: '西亚', country: '巴勒斯坦' },
  { id: 'cr-43', region: '西亚', country: '巴林' },
  { id: 'cr-44', region: '西亚', country: '也门' },
  { id: 'cr-45', region: '西亚', country: '黎巴嫩' },

  // 6. 中亚 (5)
  { id: 'cr-46', region: '中亚', country: '哈萨克斯坦' },
  { id: 'cr-47', region: '中亚', country: '吉尔吉斯斯坦' },
  { id: 'cr-48', region: '中亚', country: '塔吉克斯坦' },
  { id: 'cr-49', region: '中亚', country: '土库曼斯坦' },
  { id: 'cr-50', region: '中亚', country: '乌兹别克斯坦' },

  // 7. 欧洲 (45)
  { id: 'cr-51', region: '欧洲', country: '欧盟' },
  { id: 'cr-52', region: '欧洲', country: '爱尔兰-欧盟' },
  { id: 'cr-53', region: '欧洲', country: '英国' },
  { id: 'cr-54', region: '欧洲', country: '俄罗斯' },
  { id: 'cr-55', region: '欧洲', country: '爱沙尼亚-欧盟' },
  { id: 'cr-56', region: '欧洲', country: '奥地利-欧盟' },
  { id: 'cr-57', region: '欧洲', country: '保加利亚-欧盟' },
  { id: 'cr-58', region: '欧洲', country: '比利时-欧盟' },
  { id: 'cr-59', region: '欧洲', country: '波兰-欧盟' },
  { id: 'cr-60', region: '欧洲', country: '丹麦-欧盟' },
  { id: 'cr-61', region: '欧洲', country: '德国-欧盟' },
  { id: 'cr-62', region: '欧洲', country: '法国-欧盟' },
  { id: 'cr-63', region: '欧洲', country: '芬兰-欧盟' },
  { id: 'cr-64', region: '欧洲', country: '荷兰-欧盟' },
  { id: 'cr-65', region: '欧洲', country: '捷克-欧盟' },
  { id: 'cr-66', region: '欧洲', country: '克罗地亚-欧盟' },
  { id: 'cr-67', region: '欧洲', country: '拉脱维亚-欧盟' },
  { id: 'cr-68', region: '欧洲', country: '立陶宛-欧盟' },
  { id: 'cr-69', region: '欧洲', country: '卢森堡-欧盟' },
  { id: 'cr-70', region: '欧洲', country: '罗马尼亚-欧盟' },
  { id: 'cr-71', region: '欧洲', country: '马耳他-欧盟' },
  { id: 'cr-72', region: '欧洲', country: '葡萄牙-欧盟' },
  { id: 'cr-73', region: '欧洲', country: '瑞典-欧盟' },
  { id: 'cr-74', region: '欧洲', country: '塞浦路斯-欧盟' },
  { id: 'cr-75', region: '欧洲', country: '斯洛伐克-欧盟' },
  { id: 'cr-76', region: '欧洲', country: '斯洛文尼亚-欧盟' },
  { id: 'cr-77', region: '欧洲', country: '西班牙-欧盟' },
  { id: 'cr-78', region: '欧洲', country: '希腊-欧盟' },
  { id: 'cr-79', region: '欧洲', country: '匈牙利-欧盟' },
  { id: 'cr-80', region: '欧洲', country: '意大利-欧盟' },
  { id: 'cr-81', region: '欧洲', country: '阿尔巴尼亚' },
  { id: 'cr-82', region: '欧洲', country: '北马其顿' },
  { id: 'cr-83', region: '欧洲', country: '冰岛' },
  { id: 'cr-84', region: '欧洲', country: '摩尔多瓦' },
  { id: 'cr-85', region: '欧洲', country: '挪威' },
  { id: 'cr-86', region: '欧洲', country: '瑞士' },
  { id: 'cr-87', region: '欧洲', country: '塞尔维亚' },
  { id: 'cr-88', region: '欧洲', country: '圣马力诺' },
  { id: 'cr-89', region: '欧洲', country: '乌克兰' },
  { id: 'cr-90', region: '欧洲', country: '安道尔' },
  { id: 'cr-91', region: '欧洲', country: '白俄罗斯' },
  { id: 'cr-92', region: '欧洲', country: '波黑' },
  { id: 'cr-93', region: '欧洲', country: '黑山' },
  { id: 'cr-94', region: '欧洲', country: '列支敦士登' },
  { id: 'cr-95', region: '欧洲', country: '摩纳哥' },

  // 8. 北美洲 (23)
  { id: 'cr-96', region: '北美洲', country: '美国' },
  { id: 'cr-97', region: '北美洲', country: '加拿大' },
  { id: 'cr-98', region: '北美洲', country: '墨西哥' },
  { id: 'cr-99', region: '北美洲', country: '哥斯达黎加' },
  { id: 'cr-100', region: '北美洲', country: '古巴' },
  { id: 'cr-101', region: '北美洲', country: '危地马拉' },
  { id: 'cr-102', region: '北美洲', country: '伯利兹' },
  { id: 'cr-103', region: '北美洲', country: '萨尔瓦多' },
  { id: 'cr-104', region: '北美洲', country: '洪都拉斯' },
  { id: 'cr-105', region: '北美洲', country: '尼加拉瓜' },
  { id: 'cr-106', region: '北美洲', country: '巴拿马' },
  { id: 'cr-107', region: '北美洲', country: '巴哈马' },
  { id: 'cr-108', region: '北美洲', country: '牙买加' },
  { id: 'cr-109', region: '北美洲', country: '海地' },
  { id: 'cr-110', region: '北美洲', country: '多米尼加' },
  { id: 'cr-111', region: '北美洲', country: '圣基茨和尼维斯' },
  { id: 'cr-112', region: '北美洲', country: '安提瓜和巴布达' },
  { id: 'cr-113', region: '北美洲', country: '多米尼克' },
  { id: 'cr-114', region: '北美洲', country: '圣卢西亚' },
  { id: 'cr-115', region: '北美洲', country: '圣文森特和格林纳丁斯' },
  { id: 'cr-116', region: '北美洲', country: '巴巴多斯' },
  { id: 'cr-117', region: '北美洲', country: '格林纳达' },
  { id: 'cr-118', region: '北美洲', country: '特立尼达和多巴哥' },

  // 9. 南美洲 (11)
  { id: 'cr-119', region: '南美洲', country: '阿根廷' },
  { id: 'cr-120', region: '南美洲', country: '巴西' },
  { id: 'cr-121', region: '南美洲', country: '智利' },
  { id: 'cr-122', region: '南美洲', country: '哥伦比亚' },
  { id: 'cr-123', region: '南美洲', country: '玻利维亚' },
  { id: 'cr-124', region: '南美洲', country: '厄瓜多尔' },
  { id: 'cr-125', region: '南美洲', country: '圭亚那' },
  { id: 'cr-126', region: '南美洲', country: '巴拉圭' },
  { id: 'cr-127', region: '南美洲', country: '秘鲁' },
  { id: 'cr-128', region: '南美洲', country: '苏里南' },
  { id: 'cr-129', region: '南美洲', country: '委内瑞拉' },

  // 10. 大洋洲 (16)
  { id: 'cr-130', region: '大洋洲', country: '澳大利亚' },
  { id: 'cr-131', region: '大洋洲', country: '新几内亚' },
  { id: 'cr-132', region: '大洋洲', country: '新西兰' },
  { id: 'cr-133', region: '大洋洲', country: '斐济' },
  { id: 'cr-134', region: '大洋洲', country: '基里巴斯' },
  { id: 'cr-135', region: '大洋洲', country: '库克群岛' },
  { id: 'cr-136', region: '大洋洲', country: '马绍尔群岛' },
  { id: 'cr-137', region: '大洋洲', country: '密克罗尼西亚联邦' },
  { id: 'cr-138', region: '大洋洲', country: '瑙鲁' },
  { id: 'cr-139', region: '大洋洲', country: '纽埃' },
  { id: 'cr-140', region: '大洋洲', country: '帕劳' },
  { id: 'cr-141', region: '大洋洲', country: '萨摩亚' },
  { id: 'cr-142', region: '大洋洲', country: '所罗门群岛' },
  { id: 'cr-143', region: '大洋洲', country: '汤加' },
  { id: 'cr-144', region: '大洋洲', country: '图瓦卢' },
  { id: 'cr-145', region: '大洋洲', country: '瓦努阿图' },

  // 11. 非洲 (54)
  { id: 'cr-146', region: '非洲', country: '摩洛哥' },
  { id: 'cr-147', region: '非洲', country: '南非' },
  { id: 'cr-148', region: '非洲', country: '阿尔及利亚' },
  { id: 'cr-149', region: '非洲', country: '埃及' },
  { id: 'cr-150', region: '非洲', country: '冈比亚' },
  { id: 'cr-151', region: '非洲', country: '肯尼亚' },
  { id: 'cr-152', region: '非洲', country: '马达加斯加' },
  { id: 'cr-153', region: '非洲', country: '纳米比亚' },
  { id: 'cr-154', region: '非洲', country: '苏丹' },
  { id: 'cr-155', region: '非洲', country: '埃塞俄比亚' },
  { id: 'cr-156', region: '非洲', country: '安哥拉' },
  { id: 'cr-157', region: '非洲', country: '贝宁' },
  { id: 'cr-158', region: '非洲', country: '博茨瓦纳' },
  { id: 'cr-159', region: '非洲', country: '布基纳法索' },
  { id: 'cr-160', region: '非洲', country: '布隆迪' },
  { id: 'cr-161', region: '非洲', country: '赤道几内亚' },
  { id: 'cr-162', region: '非洲', country: '多哥' },
  { id: 'cr-163', region: '非洲', country: '厄立特里亚' },
  { id: 'cr-164', region: '非洲', country: '佛得角' },
  { id: 'cr-165', region: '非洲', country: '刚果(布)' },
  { id: 'cr-166', region: '非洲', country: '刚果(金)' },
  { id: 'cr-167', region: '非洲', country: '吉布提' },
  { id: 'cr-168', region: '非洲', country: '几内亚' },
  { id: 'cr-169', region: '非洲', country: '几内亚比绍' },
  { id: 'cr-170', region: '非洲', country: '加纳' },
  { id: 'cr-171', region: '非洲', country: '加蓬' },
  { id: 'cr-172', region: '非洲', country: '津巴布韦' },
  { id: 'cr-173', region: '非洲', country: '喀麦隆' },
  { id: 'cr-174', region: '非洲', country: '科摩罗' },
  { id: 'cr-175', region: '非洲', country: '科特迪瓦' },
  { id: 'cr-176', region: '非洲', country: '莱索托' },
  { id: 'cr-177', region: '非洲', country: '利比里亚' },
  { id: 'cr-178', region: '非洲', country: '利比亚' },
  { id: 'cr-179', region: '非洲', country: '卢旺达' },
  { id: 'cr-180', region: '非洲', country: '马拉维' },
  { id: 'cr-181', region: '非洲', country: '马里' },
  { id: 'cr-182', region: '非洲', country: '毛里求斯' },
  { id: 'cr-183', region: '非洲', country: '毛里塔尼亚' },
  { id: 'cr-184', region: '非洲', country: '莫桑比克' },
  { id: 'cr-185', region: '非洲', country: '南苏丹' },
  { id: 'cr-186', region: '非洲', country: '尼日尔' },
  { id: 'cr-187', region: '非洲', country: '尼日利亚' },
  { id: 'cr-188', region: '非洲', country: '塞拉利昂' },
  { id: 'cr-189', region: '非洲', country: '塞内加尔' },
  { id: 'cr-190', region: '非洲', country: '塞舌尔' },
  { id: 'cr-191', region: '非洲', country: '圣多美和普林西比' },
  { id: 'cr-192', region: '非洲', country: '斯威士兰' },
  { id: 'cr-193', region: '非洲', country: '索马里' },
  { id: 'cr-194', region: '非洲', country: '坦桑尼亚' },
  { id: 'cr-195', region: '非洲', country: '突尼斯' },
  { id: 'cr-196', region: '非洲', country: '乌干达' },
  { id: 'cr-197', region: '非洲', country: '赞比亚' },
  { id: 'cr-198', region: '非洲', country: '乍得' },
  { id: 'cr-199', region: '非洲', country: '中非' }
];

export const ALL_REGION_NAMES = [
  '大中华地区',
  '东亚',
  '南亚',
  '东南亚',
  '西亚',
  '中亚',
  '欧洲',
  '北美洲',
  '南美洲',
  '大洋洲',
  '非洲'
];

const STORAGE_KEY_APPLICANTS = 'usmile_applicant_mappings_v1';
const STORAGE_KEY_AGENCIES = 'usmile_agency_mappings_v1';
const STORAGE_KEY_COUNTRY_REGIONS = 'usmile_country_region_mappings_v1';
const EVENT_NAME = 'usmile_mapping_data_changed';

export function getApplicantMappings(): ApplicantMappingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPLICANTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse applicant mappings', e);
  }
  return INITIAL_APPLICANT_MAPPINGS;
}

export function saveApplicantMappings(items: ApplicantMappingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_APPLICANTS, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (e) {
    console.error('Failed to save applicant mappings', e);
  }
}

export function getAgencyMappings(): AgencyMappingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AGENCIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse agency mappings', e);
  }
  return INITIAL_AGENCY_MAPPINGS;
}

export function saveAgencyMappings(items: AgencyMappingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_AGENCIES, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (e) {
    console.error('Failed to save agency mappings', e);
  }
}

export function getCountryRegionMappings(): CountryRegionMappingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COUNTRY_REGIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse country region mappings', e);
  }
  return INITIAL_COUNTRY_REGION_MAPPINGS;
}

export function saveCountryRegionMappings(items: CountryRegionMappingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_COUNTRY_REGIONS, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (e) {
    console.error('Failed to save country region mappings', e);
  }
}

export function resetCountryRegionMappings(): CountryRegionMappingItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY_COUNTRY_REGIONS);
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (e) {
    console.error('Failed to reset country region mappings', e);
  }
  return INITIAL_COUNTRY_REGION_MAPPINGS;
}

/**
 * 根据国家名称自动推导匹配的所属地区（大区）
 */
export function getRegionByCountry(countryName: string, customMappings?: CountryRegionMappingItem[]): string {
  if (!countryName) return '';
  const trimmed = countryName.trim();
  if (trimmed === '中国' || trimmed === 'CN' || trimmed === '中国大陆') return '大中华地区';
  
  const mappings = customMappings || getCountryRegionMappings();
  // 1. 精确匹配
  const exact = mappings.find(m => m.country === trimmed);
  if (exact) return exact.region;

  // 2. 包含匹配或别名匹配
  const matched = mappings.find(m => trimmed.includes(m.country) || m.country.includes(trimmed));
  if (matched) return matched.region;

  // 3. 常见法域关键词智能归类
  if (/香港|澳门|台湾|TW|HK|MO/i.test(trimmed)) return '大中华地区';
  if (/日本|韩国|朝鲜|蒙古|JP|KR/i.test(trimmed)) return '东亚';
  if (/新加坡|马来西亚|泰国|越南|印尼|菲律宾|缅甸|柬埔寨|老挝|文莱|ASEAN/i.test(trimmed)) return '东南亚';
  if (/欧盟|德国|法国|英国|意大利|西班牙|荷兰|瑞士|挪威|EU|UK|GB/i.test(trimmed)) return '欧洲';
  if (/美国|加拿大|墨西哥|US|CA|MX/i.test(trimmed)) return '北美洲';
  if (/阿联酋|沙特|土耳其|以色列|卡塔尔/i.test(trimmed)) return '西亚';
  if (/巴西|阿根廷|智利|哥伦比亚/i.test(trimmed)) return '南美洲';
  if (/澳大利亚|新西兰|AU|NZ/i.test(trimmed)) return '大洋洲';
  if (/南非|埃及|尼日利亚/i.test(trimmed)) return '非洲';

  return '大中华地区';
}

/**
 * 根据地区获取该地区下包含的所有国家/地区列表
 */
export function getCountriesByRegion(regionName: string, customMappings?: CountryRegionMappingItem[]): string[] {
  const mappings = customMappings || getCountryRegionMappings();
  if (!regionName || regionName === '全部' || regionName === 'ALL') {
    return Array.from(new Set(mappings.map(m => m.country)));
  }
  return mappings.filter(m => m.region === regionName).map(m => m.country);
}

/**
 * 获取映射表中所有的国家/地区列表（包含'中国'）
 */
export function getAllMappedCountries(customMappings?: CountryRegionMappingItem[]): string[] {
  const mappings = customMappings || getCountryRegionMappings();
  const list = ['中国', ...mappings.map(m => m.country)];
  return Array.from(new Set(list));
}

export function subscribeMappingChanges(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

