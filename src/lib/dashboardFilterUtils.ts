import { CaseManagementItem, TrademarkItem, EnforcementCase } from '../types';
import { INITIAL_ENFORCEMENT_CASES } from '../data/mockData';

export interface BrandProfile {
  id: string;
  name: string;
  shortName: string;
  englishName: string;
  keywords: string[];
  appliedClasses: number[];
  coreGoods: string;
  goodOptions: string[];
  totalRatio: number; // Multiplier relative to base dataset
  domesticRatio: number;
  grantRate: number;
}

export const BRAND_PROFILES: Record<string, BrandProfile> = {
  'usmile 笑容加': {
    id: 'usmile',
    name: 'usmile 笑容加',
    shortName: 'usmile',
    englishName: 'usmile Smile+',
    keywords: ['usmile', '笑容加', 'smile', 'micro-bubble', '笑容', '星际悦动', '净爽白', '正畸洁齿舱', '笑容守护者', '笑容小云朵'],
    appliedClasses: [3, 5, 9, 10, 11, 21, 22, 29, 35, 36, 38, 39, 41, 42, 43, 45],
    coreGoods: '电动牙刷、冲牙器、牙线 (2108)',
    goodOptions: [
      '电动牙刷、冲牙器、牙线 (2108)',
      '牙膏、洁齿剂、漱口水 (0307)',
      '正畸器械、医用牙科仪器 (1004)',
      '口腔健康智能硬件与APP (0901)'
    ],
    totalRatio: 1.0,
    domesticRatio: 0.48,
    grantRate: 0.683
  },
  '密浪 Waves': {
    id: 'waves',
    name: '密浪 Waves',
    shortName: '密浪',
    englishName: 'Waves',
    keywords: ['密浪', 'waves', '冲牙器', '水牙线'],
    appliedClasses: [21, 3, 10, 35, 42, 11],
    coreGoods: '水牙线、便携冲牙器、喷嘴 (2108)',
    goodOptions: [
      '水牙线、便携冲牙器、喷嘴 (2108)',
      '浓缩漱口水、洁齿原液 (0307)',
      '便携充电盒、智能底座 (0901)'
    ],
    totalRatio: 0.38,
    domesticRatio: 0.52,
    grantRate: 0.725
  },
  '净白云朵': {
    id: 'cloud',
    name: '净白云朵',
    shortName: '净白云朵',
    englishName: 'Pure Cloud',
    keywords: ['净白云朵', '云朵', '净白', '美白'],
    appliedClasses: [3, 21, 5, 35, 44],
    coreGoods: '牙齿美白精华、洁白凝胶 (0307)',
    goodOptions: [
      '牙齿美白精华、洁白凝胶 (0307)',
      '云柔护龈牙刷、极细软毛刷 (2108)',
      '抑菌口腔清新喷雾 (0501)'
    ],
    totalRatio: 0.26,
    domesticRatio: 0.62,
    grantRate: 0.75
  },
  'KittyAnnie 小猫安妮': {
    id: 'kittyannie',
    name: 'KittyAnnie 小猫安妮',
    shortName: '小猫安妮',
    englishName: 'KittyAnnie',
    keywords: ['kittyannie', '小猫安妮', '小猫', '安妮', '美肤仪'],
    appliedClasses: [10, 21, 3, 35, 44, 11, 42, 9],
    coreGoods: '洁面仪、导入导出美肤仪 (1004)',
    goodOptions: [
      '洁面仪、导入导出美肤仪 (1004)',
      '美妆蛋、化妆刷具 (2110)',
      '氨基酸洁面泡泡、舒缓喷雾 (0306)'
    ],
    totalRatio: 0.42,
    domesticRatio: 0.55,
    grantRate: 0.71
  },
  'FHT 新燕': {
    id: 'fht',
    name: 'FHT 新燕',
    shortName: '新燕',
    englishName: 'FHT Bird Nest',
    keywords: ['fht', '新燕', '燕窝', '滋补'],
    appliedClasses: [29, 30, 5, 35, 43, 32],
    coreGoods: '即食燕窝、冻干滋补品 (2904)',
    goodOptions: [
      '即食燕窝、冻干滋补品 (2904)',
      '燕窝胶原蛋白饮、草本膏方 (3002)',
      '中药滋补饮片 (0501)'
    ],
    totalRatio: 0.32,
    domesticRatio: 0.68,
    grantRate: 0.76
  },
  'aboval 阿茂': {
    id: 'aboval',
    name: 'aboval 阿茂',
    shortName: '阿茂',
    englishName: 'aboval',
    keywords: ['aboval', '阿茂', '潮玩', '盲盒'],
    appliedClasses: [28, 18, 9, 35, 41, 14, 25],
    coreGoods: '潮玩盲盒手办、潮流公仔 (2802)',
    goodOptions: [
      '潮玩盲盒手办、潮流公仔 (2802)',
      '文创帆布包、日常收纳袋 (1802)',
      '手机壳、数码周边配件 (0901)'
    ],
    totalRatio: 0.28,
    domesticRatio: 0.45,
    grantRate: 0.65
  },
  'kissday 亲天': {
    id: 'kissday',
    name: 'kissday 亲天',
    shortName: '亲天',
    englishName: 'kissday',
    keywords: ['kissday', '亲天', '口喷', '口气清新'],
    appliedClasses: [3, 21, 5, 35],
    coreGoods: '便携式口气清新喷雾 (0307)',
    goodOptions: [
      '便携式口气清新喷雾 (0307)',
      '条装抑菌果味漱口水 (0307)',
      '舌苔清洁啫喱、牙齿抛光擦 (2108)'
    ],
    totalRatio: 0.22,
    domesticRatio: 0.58,
    grantRate: 0.80
  },
  'SMART ORAL LAB 智慧口腔实验室': {
    id: 'smartoral',
    name: 'SMART ORAL LAB 智慧口腔实验室',
    shortName: '智慧口腔实验室',
    englishName: 'SMART ORAL LAB',
    keywords: ['smart oral lab', '智慧口腔', '口腔实验室', 'oral lab', '算法'],
    appliedClasses: [9, 10, 42, 44, 35, 38],
    coreGoods: '口腔健康智能硬件与APP (0901)',
    goodOptions: [
      '口腔健康智能硬件与APP (0901)',
      '正畸器械、医用牙科仪器 (1004)',
      '云端口腔算法与临床分析软件 (4220)'
    ],
    totalRatio: 0.30,
    domesticRatio: 0.40,
    grantRate: 0.69
  }
};

export type DateRangeType = '近一年' | '近半年' | '近3个月' | '近1个月' | '自定义';

/**
 * 校验指定日期是否在时间范围内
 * 基准时间：2026-09-03
 */
export function isDateInRange(
  dateStr: string | undefined | null,
  dateRange: DateRangeType,
  customStart?: string,
  customEnd?: string
): boolean {
  if (!dateStr || dateStr === '-') return true;

  // 提取日期有效部分 (YYYY-MM-DD)
  const cleanDate = dateStr.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) return true;

  const itemDate = new Date(cleanDate).getTime();
  if (isNaN(itemDate)) return true;

  const now = new Date('2026-09-03').getTime();

  if (dateRange === '近1个月') {
    const start = new Date('2026-08-01').getTime();
    return itemDate >= start && itemDate <= now + 86400000;
  } else if (dateRange === '近3个月') {
    const start = new Date('2026-06-01').getTime();
    return itemDate >= start && itemDate <= now + 86400000;
  } else if (dateRange === '近半年') {
    const start = new Date('2026-03-01').getTime();
    return itemDate >= start && itemDate <= now + 86400000;
  } else if (dateRange === '近一年') {
    const start = new Date('2025-08-01').getTime();
    return itemDate >= start && itemDate <= now + 86400000;
  } else if (dateRange === '自定义') {
    const start = customStart ? new Date(customStart).getTime() : 0;
    const end = customEnd ? new Date(customEnd).getTime() + 86400000 : Infinity;
    return itemDate >= start && itemDate <= end;
  }

  return true;
}

/**
 * 校验案件或商标是否匹配当前选定品牌
 */
export function matchesBrand(
  item: {
    brand?: string;
    trademarkName?: string;
    name?: string;
    englishName?: string;
    applicant?: string;
    goodsItems?: string | string[];
    priorRights?: string;
  },
  selectedBrand: string
): boolean {
  if (!selectedBrand || selectedBrand === 'ALL' || selectedBrand === '全部品牌') {
    return true;
  }

  const profile = BRAND_PROFILES[selectedBrand];
  if (!profile) {
    const cleanBrand = selectedBrand.toLowerCase();
    const itemBrand = (item.brand || '').toLowerCase();
    const itemTm = (item.trademarkName || item.name || '').toLowerCase();
    return itemBrand.includes(cleanBrand) || itemTm.includes(cleanBrand);
  }

  // 1. 直接品牌字段匹配
  const itemBrand = (item.brand || '').toLowerCase();
  if (itemBrand && (itemBrand.includes(profile.shortName.toLowerCase()) || itemBrand.includes(profile.id))) {
    return true;
  }

  // 2. 检查关键字匹配
  const targetText = [
    item.brand || '',
    item.trademarkName || '',
    item.name || '',
    item.englishName || '',
    item.priorRights || '',
    Array.isArray(item.goodsItems) ? item.goodsItems.join(' ') : (item.goodsItems || '')
  ].join(' ').toLowerCase();

  return profile.keywords.some(kw => targetText.includes(kw.toLowerCase()));
}

/**
 * 统一过滤案件管理列表数据
 */
export function filterCaseItemsByBrandAndTime(
  cases: CaseManagementItem[],
  selectedBrand: string,
  dateRange: DateRangeType,
  customStart?: string,
  customEnd?: string
): CaseManagementItem[] {
  return cases.filter(item => {
    // 1. 品牌过滤
    const brandMatch = matchesBrand(item, selectedBrand);
    if (!brandMatch) return false;

    // 2. 时间过滤 (检查 applyDate 或 registrationDate 或 createDate)
    const dateToCheck = item.applyDate || item.registrationDate || (item as any).createDate || (item as any).updatedAt;
    const timeMatch = isDateInRange(dateToCheck, dateRange, customStart, customEnd);
    return timeMatch;
  });
}

/**
 * 获取续展监控提醒数据
 */
export interface RenewalItemData {
  name: string;
  country: string;
  code: string;
  reg: string;
  cls: number;
  date: string;
  days: number;
  urgent: boolean;
  agency: string;
  applicant: string;
  regDate: string;
  priorRights: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'NORMAL';
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED';
}

export const ALL_RENEWAL_RECORDS: (RenewalItemData & { brandKey: string })[] = [
  // usmile 品牌续展
  { brandKey: 'usmile', name: 'usmile', country: '🇨🇳 中国', code: 'CN', reg: 'CN38910245', cls: 21, date: '2026-09-18', days: 15, urgent: true, agency: '北京超凡知识产权', applicant: '广州星际悦动股份有限公司', regDate: '2016-09-18', priorRights: 'usmile (核心主品牌)', riskLevel: 'CRITICAL', status: 'NEW' },
  { brandKey: 'usmile', name: '笑容加', country: '🇨🇳 中国', code: 'CN', reg: 'CN38910246', cls: 21, date: '2026-09-18', days: 15, urgent: true, agency: '北京超凡知识产权', applicant: '广州星际悦动股份有限公司', regDate: '2016-09-18', priorRights: '笑容加 (核心中文商标)', riskLevel: 'CRITICAL', status: 'NEW' },
  { brandKey: 'usmile', name: 'usmile', country: '🇺🇸 美国', code: 'US', reg: 'US65421098', cls: 21, date: '2026-10-15', days: 42, urgent: true, agency: 'Finnegan Henderson', applicant: 'usmile Care International Inc.', regDate: '2016-10-15', priorRights: 'usmile (美国注册标的)', riskLevel: 'HIGH', status: 'NEW' },
  { brandKey: 'usmile', name: '笑容加', country: '🇺🇸 美国', code: 'US', reg: 'US65421099', cls: 3, date: '2026-10-20', days: 47, urgent: false, agency: 'Finnegan Henderson', applicant: 'usmile Care International Inc.', regDate: '2016-10-20', priorRights: '笑容加 (海外美规商标)', riskLevel: 'HIGH', status: 'IN_PROGRESS' },
  { brandKey: 'usmile', name: '小微笑', country: '🇨🇳 中国', code: 'CN', reg: 'CN40129841', cls: 21, date: '2026-11-05', days: 63, urgent: false, agency: '广州华进联合', applicant: '广州星际悦动股份有限公司', regDate: '2016-11-05', priorRights: '小微笑 (子品牌防护标)', riskLevel: 'NORMAL', status: 'IN_PROGRESS' },
  { brandKey: 'usmile', name: 'usmile PRO', country: '🇪🇺 欧盟', code: 'EU', reg: 'EU01874291', cls: 21, date: '2026-11-28', days: 86, urgent: false, agency: 'Hogan Lovells', applicant: 'usmile Europe GmbH', regDate: '2016-11-28', priorRights: 'usmile PRO (旗舰系列)', riskLevel: 'NORMAL', status: 'IN_PROGRESS' },
  { brandKey: 'usmile', name: '正畸洁齿舱', country: '🇨🇳 中国', code: 'CN', reg: 'CN41092837', cls: 10, date: '2026-12-14', days: 102, urgent: false, agency: '北京超凡知识产权', applicant: '广州星际悦动股份有限公司', regDate: '2016-12-14', priorRights: '正畸洁齿舱 (医疗器械)', riskLevel: 'NORMAL', status: 'COMPLETED' },
  { brandKey: 'usmile', name: 'usmile', country: '🇯🇵 日本', code: 'JP', reg: 'JP64928102', cls: 21, date: '2026-12-25', days: 113, urgent: false, agency: 'TMI Associates', applicant: 'usmile Japan Co., Ltd.', regDate: '2016-12-25', priorRights: 'usmile (日本注册标的)', riskLevel: 'NORMAL', status: 'COMPLETED' },
  { brandKey: 'usmile', name: 'Micro-Bubble', country: '🇨🇳 中国', code: 'CN', reg: 'CN42910384', cls: 21, date: '2027-01-10', days: 129, urgent: false, agency: '广州华进联合', applicant: '广州星际悦动股份有限公司', regDate: '2017-01-10', priorRights: 'Micro-Bubble (微泡专利关联标)', riskLevel: 'NORMAL', status: 'COMPLETED' },
  { brandKey: 'usmile', name: 'usmile Care', country: '🇸🇬 新加坡', code: 'SG', reg: 'SG40291823', cls: 3, date: '2027-01-22', days: 141, urgent: false, agency: 'Rajah & Tann', applicant: 'usmile Care SG Pte. Ltd.', regDate: '2017-01-22', priorRights: 'usmile Care (个人护理)', riskLevel: 'NORMAL', status: 'COMPLETED' },
  { brandKey: 'usmile', name: '笑容守护者', country: '🇨🇳 中国', code: 'CN', reg: 'CN43819203', cls: 35, date: '2027-02-08', days: 158, urgent: false, agency: '北京超凡知识产权', applicant: '广州星际悦动股份有限公司', regDate: '2017-02-08', priorRights: '笑容守护者 (商业防护)', riskLevel: 'NORMAL', status: 'COMPLETED' },
  { brandKey: 'usmile', name: '笑容小云朵', country: '🇨🇳 中国', code: 'CN', reg: 'CN44091823', cls: 21, date: '2027-02-28', days: 178, urgent: false, agency: '广州华进联合', applicant: '广州星际悦动股份有限公司', regDate: '2017-02-28', priorRights: '笑容小云朵 (儿童牙刷系列)', riskLevel: 'NORMAL', status: 'COMPLETED' },

  // 密浪 Waves 续展
  { brandKey: 'waves', name: '密浪', country: '🇨🇳 中国', code: 'CN', reg: 'CN48910245', cls: 21, date: '2026-10-18', days: 45, urgent: true, agency: '广州华进联合', applicant: '广州星际悦动股份有限公司', regDate: '2016-10-18', priorRights: '密浪 (冲牙器核心标)', riskLevel: 'HIGH', status: 'NEW' },
  { brandKey: 'waves', name: 'Waves Clean', country: '🇺🇸 美国', code: 'US', reg: 'US78910245', cls: 21, date: '2026-11-20', days: 78, urgent: false, agency: 'Baker & McKenzie', applicant: 'usmile Tech Inc.', regDate: '2016-11-20', priorRights: 'Waves Clean (海外水牙线)', riskLevel: 'NORMAL', status: 'IN_PROGRESS' },
  { brandKey: 'waves', name: '密浪护龈', country: '🇨🇳 中国', code: 'CN', reg: 'CN49910245', cls: 3, date: '2026-12-15', days: 103, urgent: false, agency: '广州三环', applicant: '广州星际悦动股份有限公司', regDate: '2016-12-15', priorRights: '密浪护龈 (漱口水配方标)', riskLevel: 'NORMAL', status: 'COMPLETED' },

  // KittyAnnie 小猫安妮 续展
  { brandKey: 'kittyannie', name: 'KittyAnnie', country: '🇨🇳 中国', code: 'CN', reg: 'CN51910245', cls: 10, date: '2026-10-05', days: 32, urgent: true, agency: '北京金杜律师事务所', applicant: '广州星际悦动股份有限公司', regDate: '2016-10-05', priorRights: 'KittyAnnie (美容仪旗舰标)', riskLevel: 'CRITICAL', status: 'NEW' },
  { brandKey: 'kittyannie', name: '小猫安妮', country: '🇨🇳 中国', code: 'CN', reg: 'CN51910246', cls: 21, date: '2026-11-12', days: 70, urgent: false, agency: '北京金杜律师事务所', applicant: '广州星际悦动股份有限公司', regDate: '2016-11-12', priorRights: '小猫安妮 (美妆刷具防护)', riskLevel: 'HIGH', status: 'IN_PROGRESS' },
  { brandKey: 'kittyannie', name: 'Annie Glow', country: '🇯🇵 日本', code: 'JP', reg: 'JP71910245', cls: 10, date: '2026-12-28', days: 116, urgent: false, agency: 'TMI Associates', applicant: 'usmile Japan Co., Ltd.', regDate: '2016-12-28', priorRights: 'Annie Glow (日本导入仪)', riskLevel: 'NORMAL', status: 'COMPLETED' },

  // FHT 新燕 续展
  { brandKey: 'fht', name: 'FHT 新燕', country: '🇨🇳 中国', code: 'CN', reg: 'CN53910245', cls: 29, date: '2026-10-25', days: 52, urgent: true, agency: '广州华进联合', applicant: '广州星际悦动股份有限公司', regDate: '2016-10-25', priorRights: 'FHT (即食燕窝核心标)', riskLevel: 'HIGH', status: 'NEW' },
  { brandKey: 'fht', name: '新燕清饮', country: '🇸🇬 新加坡', code: 'SG', reg: 'SG63910245', cls: 30, date: '2027-01-15', days: 134, urgent: false, agency: 'Rajah & Tann', applicant: 'usmile Care SG Pte. Ltd.', regDate: '2017-01-15', priorRights: '新燕清饮 (海外燕窝饮品)', riskLevel: 'NORMAL', status: 'COMPLETED' },

  // aboval 阿茂 续展
  { brandKey: 'aboval', name: 'aboval', country: '🇨🇳 中国', code: 'CN', reg: 'CN55910245', cls: 28, date: '2026-11-08', days: 66, urgent: false, agency: '北京中原信达', applicant: '广州星际悦动股份有限公司', regDate: '2016-11-08', priorRights: 'aboval (潮玩手办主标)', riskLevel: 'HIGH', status: 'NEW' },
  { brandKey: 'aboval', name: '阿茂创玩', country: '🇨🇳 中国', code: 'CN', reg: 'CN55910246', cls: 18, date: '2027-02-10', days: 160, urgent: false, agency: '北京中原信达', applicant: '广州星际悦动股份有限公司', regDate: '2017-02-10', priorRights: '阿茂创玩 (周边收纳标)', riskLevel: 'NORMAL', status: 'COMPLETED' },

  // kissday 亲天 续展
  { brandKey: 'kissday', name: 'kissday', country: '🇨🇳 中国', code: 'CN', reg: 'CN57910245', cls: 3, date: '2026-10-30', days: 57, urgent: false, agency: '广州三环', applicant: '广州星际悦动股份有限公司', regDate: '2016-10-30', priorRights: 'kissday (口气喷雾主标)', riskLevel: 'HIGH', status: 'NEW' },

  // SMART ORAL LAB 续展
  { brandKey: 'smartoral', name: 'SMART ORAL LAB', country: '🇺🇸 美国', code: 'US', reg: 'US89910245', cls: 9, date: '2026-11-18', days: 76, urgent: false, agency: 'Finnegan Henderson', applicant: 'usmile Tech Inc.', regDate: '2016-11-18', priorRights: 'SMART ORAL LAB (算法软件)', riskLevel: 'HIGH', status: 'IN_PROGRESS' },
  { brandKey: 'smartoral', name: '智慧口腔', country: '🇨🇳 中国', code: 'CN', reg: 'CN59910245', cls: 42, date: '2027-01-20', days: 139, urgent: false, agency: '北京柳沈律师事务所', applicant: '广州星际悦动股份有限公司', regDate: '2017-01-20', priorRights: '智慧口腔 (云端研发服务)', riskLevel: 'NORMAL', status: 'COMPLETED' },
];

/**
 * 筛选续展临期记录
 */
export function filterRenewalRecords(
  selectedBrand: string,
  dateRange: DateRangeType,
  customStart?: string,
  customEnd?: string
): RenewalItemData[] {
  const profile = BRAND_PROFILES[selectedBrand];
  const targetKey = profile?.id || 'usmile';

  return ALL_RENEWAL_RECORDS.filter(item => {
    // 品牌匹配
    if (selectedBrand && selectedBrand !== '全部品牌') {
      if (item.brandKey !== targetKey && !matchesBrand(item, selectedBrand)) {
        return false;
      }
    }

    // 时间范围匹配 (检查到期日或注册日)
    return isDateInRange(item.date, dateRange, customStart, customEnd) || isDateInRange(item.regDate, dateRange, customStart, customEnd);
  });
}

/**
 * 筛选维权管理案件数据
 */
export function filterEnforcementCasesByBrandAndTime(
  cases: EnforcementCase[],
  selectedBrand: string,
  dateRange: DateRangeType,
  customStart?: string,
  customEnd?: string
): EnforcementCase[] {
  return cases.filter((item) => {
    // 1. 品牌过滤
    if (selectedBrand && selectedBrand !== 'ALL' && selectedBrand !== '全部品牌') {
      const brandMatch = matchesBrand(
        {
          brand: item.brand,
          trademarkName: item.ourTrademark,
          name: item.name,
          applicant: item.targetApplicant,
        },
        selectedBrand
      );

      if (!brandMatch) {
        const bLower = selectedBrand.toLowerCase();
        const itemBrand = (item.brand || '').toLowerCase();
        const ourTm = (item.ourTrademark || '').toLowerCase();
        const targetTm = (item.targetTrademark || '').toLowerCase();
        if (!itemBrand.includes(bLower) && !ourTm.includes(bLower) && !targetTm.includes(bLower)) {
          return false;
        }
      }
    }

    // 2. 时间过滤 (优先按立案日期/提交日期/委派日期/截止日期)
    const dateToCheck =
      item.fileOpeningDate ||
      item.submissionDate ||
      item.entrustmentDate ||
      item.filingDeadline;

    if (dateToCheck && !isDateInRange(dateToCheck, dateRange, customStart, customEnd)) {
      return false;
    }

    return true;
  });
}

export const BUSINESS_TYPE_COLORS: Record<string, string> = {
  '商标异议申请': '#2563eb',
  '商标无效宣告': '#0d9488',
  '商标驳回复审': '#6366f1',
  '撤销连续三年不使用(撤三)': '#f59e0b',
  '商标答辩': '#8b5cf6',
  '达标审查': '#06b6d4',
  '海关边境保护备案与查扣': '#ec4899',
  '诉讼维权': '#10b981',
};

export const ACTIVE_STATUS_COLORS: Record<string, string> = {
  '待启动': '#64748b',
  '证据准备中': '#f59e0b',
  '已正式递交': '#6366f1',
  '商标局审理中': '#2563eb',
};

export const RESULT_STATUS_COLORS: Record<string, string> = {
  '维权成功/裁定无效': '#10b981',
  '维权不成立/被驳回': '#f43f5e',
  '和解结案': '#0284c7',
};

/**
 * 动态计算商标监测图表数据
 */
export interface MonitoringSectionData {
  totalCount: number;
  typeSlices: { name: string; count: number; color: string }[];
  typeLegend: { name: string; color: string }[];
  typeTotal: number;
  statusSlices: { name: string; count: number; color: string }[];
  statusLegend: { name: string; color: string }[];
  statusTotal: number;
  resultSlices: { name: string; count: number; color: string }[];
  resultLegend: { name: string; color: string }[];
  resultTotal: number;
}

export function getMonitoringSectionData(
  selectedBrand: string,
  dateRange: DateRangeType,
  customStart?: string,
  customEnd?: string,
  casesList?: EnforcementCase[]
): MonitoringSectionData {
  const allCases = casesList && casesList.length > 0 ? casesList : INITIAL_ENFORCEMENT_CASES;

  // 筛选符合当前品牌和时间范围的维权案件
  const filteredCases = filterEnforcementCasesByBrandAndTime(
    allCases,
    selectedBrand,
    dateRange,
    customStart,
    customEnd
  );

  // 1. 案件类型统计逻辑：统计维权管理列表中的数据，按业务类型划分饼圈图
  const typeCountMap: Record<string, number> = {};
  filteredCases.forEach((c) => {
    let bType = c.businessType?.trim() || '';
    if (!bType) {
      switch (c.type) {
        case 'OPPOSITION': bType = '商标异议申请'; break;
        case 'INVALIDATION': bType = '商标无效宣告'; break;
        case 'REFUSAL_REVIEW': bType = '商标驳回复审'; break;
        case 'NON_USE_REVOCATION': bType = '撤销连续三年不使用(撤三)'; break;
        case 'DEFENSE': bType = '商标答辩'; break;
        case 'STANDARDS': bType = '达标审查'; break;
        case 'CUSTOMS': bType = '海关边境保护备案与查扣'; break;
        case 'LITIGATION': bType = '诉讼维权'; break;
        default: bType = '商标异议申请'; break;
      }
    }
    typeCountMap[bType] = (typeCountMap[bType] || 0) + 1;
  });

  const fallbackPalette = ['#2563eb', '#0d9488', '#6366f1', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#64748b'];
  let paletteIdx = 0;
  const typeSlices = Object.entries(typeCountMap)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => {
      const color = BUSINESS_TYPE_COLORS[name] || fallbackPalette[paletteIdx++ % fallbackPalette.length];
      return { name, count, color };
    });

  const typeLegend = Object.keys(typeCountMap).map((name) => ({
    name,
    color: BUSINESS_TYPE_COLORS[name] || '#64748b',
  }));

  // 2. 案件状态统计逻辑：统计维权管理列表中【案件状态=待启动、证据准备中、已正式递交、商标局审理中】的数据
  const activeStatusCount: Record<'待启动' | '证据准备中' | '已正式递交' | '商标局审理中', number> = {
    '待启动': 0,
    '证据准备中': 0,
    '已正式递交': 0,
    '商标局审理中': 0,
  };

  filteredCases.forEach((c) => {
    const s = (c.status || '').toUpperCase();
    const stText = c.caseStatusText || '';
    if (s === 'PENDING_START' || s === 'PENDING' || s === '待启动' || stText.includes('待启动')) {
      activeStatusCount['待启动']++;
    } else if (s === 'EVIDENCE_PREP' || s.includes('证据准备') || stText.includes('证据') || stText.includes('撰写')) {
      activeStatusCount['证据准备中']++;
    } else if (s === 'SUBMITTED' || s.includes('已递交') || stText.includes('已递交') || stText.includes('已正式递交')) {
      activeStatusCount['已正式递交']++;
    } else if (s === 'UNDER_HEARING' || s.includes('审理中') || stText.includes('审理中') || stText.includes('答辩期')) {
      activeStatusCount['商标局审理中']++;
    }
  });

  const statusSlices = [
    { name: '待启动', count: activeStatusCount['待启动'], color: ACTIVE_STATUS_COLORS['待启动'] },
    { name: '证据准备中', count: activeStatusCount['证据准备中'], color: ACTIVE_STATUS_COLORS['证据准备中'] },
    { name: '已正式递交', count: activeStatusCount['已正式递交'], color: ACTIVE_STATUS_COLORS['已正式递交'] },
    { name: '商标局审理中', count: activeStatusCount['商标局审理中'], color: ACTIVE_STATUS_COLORS['商标局审理中'] },
  ].filter((s) => s.count > 0);

  const statusTotal =
    activeStatusCount['待启动'] +
    activeStatusCount['证据准备中'] +
    activeStatusCount['已正式递交'] +
    activeStatusCount['商标局审理中'];

  // 3. 案件结果统计逻辑：统计维权管理列表中【案件状态=维权成功/裁定无效、维权不成立/被驳回、和解结案】的数据
  const resultCount: Record<'维权成功/裁定无效' | '维权不成立/被驳回' | '和解结案', number> = {
    '维权成功/裁定无效': 0,
    '维权不成立/被驳回': 0,
    '和解结案': 0,
  };

  filteredCases.forEach((c) => {
    const s = (c.status || '').toUpperCase();
    const stText = c.caseStatusText || '';
    if (s === 'WIN' || s.includes('胜诉') || stText.includes('胜诉') || stText.includes('裁定无效') || stText.includes('成功')) {
      resultCount['维权成功/裁定无效']++;
    } else if (s === 'LOST' || s.includes('败诉') || s.includes('驳回') || stText.includes('驳回') || stText.includes('不成立') || stText.includes('败诉')) {
      resultCount['维权不成立/被驳回']++;
    } else if (s === 'SETTLED' || s.includes('和解') || stText.includes('和解') || stText.includes('撤回')) {
      resultCount['和解结案']++;
    }
  });

  const resultSlices = [
    { name: '维权成功/裁定无效', count: resultCount['维权成功/裁定无效'], color: RESULT_STATUS_COLORS['维权成功/裁定无效'] },
    { name: '维权不成立/被驳回', count: resultCount['维权不成立/被驳回'], color: RESULT_STATUS_COLORS['维权不成立/被驳回'] },
    { name: '和解结案', count: resultCount['和解结案'], color: RESULT_STATUS_COLORS['和解结案'] },
  ].filter((s) => s.count > 0);

  const resultTotal =
    resultCount['维权成功/裁定无效'] +
    resultCount['维权不成立/被驳回'] +
    resultCount['和解结案'];

  return {
    totalCount: filteredCases.length,
    typeSlices,
    typeLegend: typeLegend.length > 0 ? typeLegend : [
      { name: '商标异议申请', color: '#2563eb' },
      { name: '商标无效宣告', color: '#0d9488' },
      { name: '商标驳回复审', color: '#6366f1' },
      { name: '商标答辩', color: '#8b5cf6' },
    ],
    typeTotal: filteredCases.length,
    statusSlices,
    statusLegend: [
      { name: '待启动', color: ACTIVE_STATUS_COLORS['待启动'] },
      { name: '证据准备中', color: ACTIVE_STATUS_COLORS['证据准备中'] },
      { name: '已正式递交', color: ACTIVE_STATUS_COLORS['已正式递交'] },
      { name: '商标局审理中', color: ACTIVE_STATUS_COLORS['商标局审理中'] },
    ],
    statusTotal,
    resultSlices,
    resultLegend: [
      { name: '维权成功/裁定无效', color: RESULT_STATUS_COLORS['维权成功/裁定无效'] },
      { name: '维权不成立/被驳回', color: RESULT_STATUS_COLORS['维权不成立/被驳回'] },
      { name: '和解结案', color: RESULT_STATUS_COLORS['和解结案'] },
    ],
    resultTotal,
  };
}

/**
 * 结构化台账记录类型
 */
export const DOMESTIC_REGIONS = ['中国', '中国香港', '中国台湾', '中国澳门'];

export function isDomesticCountry(countryOrJurisdiction?: string): boolean {
  if (!countryOrJurisdiction) return false;
  const str = countryOrJurisdiction.trim();
  if (DOMESTIC_REGIONS.includes(str)) return true;
  if (['CN', 'HK', 'TW', 'MO'].includes(str.toUpperCase())) return true;
  if (DOMESTIC_REGIONS.some(d => str.includes(d))) return true;
  return false;
}

export interface BrandLedgerRecord {
  id: string;
  name: string;
  englishName?: string;
  regNo: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  isDomestic: boolean;
  classes: number[];
  goods: string;
  status: 'REGISTERED' | 'EXAMINING' | 'GAZETTE_PENDING' | 'OPPOSED' | 'INVALIDATED' | 'RENEWAL_DUE';
  statusLabel: string;
  applyDate: string;
  regDate?: string;
  validUntil?: string;
  agency: string;
  applicant: string;
}

/**
 * 根据品牌和时间区间动态生成台账记录与案件数据
 */
export function generateBrandLedgerData(
  selectedBrand: string,
  dateRange: DateRangeType = '近一年',
  customStart?: string,
  customEnd?: string
): BrandLedgerRecord[] {
  const profile = BRAND_PROFILES[selectedBrand] || BRAND_PROFILES['usmile 笑容加'];
  const brandKey = profile.id;

  const brandNamesMap: Record<string, string[]> = {
    usmile: ['usmile', '笑容加', 'usmile PRO', '小微笑', '正畸洁齿舱', '笑容小云朵', 'Micro-Bubble', 'usmile Care', '笑容守护者', '声波云柔', '智齿医生', 'SmileClean', '笑容之星', '星际悦动', '极光洁齿', '净爽白'],
    waves: ['密浪', 'Waves', '密浪 Waves', 'Waves Clean', '密浪护龈', '密浪动力', '极冲', 'WaveSonic', '水感密浪', '密浪轻音'],
    cloud: ['净白云朵', '云朵护龈', '净白 Cloud', '云感白', 'Pure Cloud', '云白舒敏', '云朵柔羽', '白羽洁齿'],
    kittyannie: ['KittyAnnie', '小猫安妮', 'Annie Glow', '小猫美肤', 'KittySkin', '安妮光透', '小猫舒缓', 'KittyCare', '安妮时光'],
    fht: ['FHT 新燕', '新燕', 'FHT 滋补', '新燕清饮', 'FHT燕窝', '晶莹新燕', '新燕贡萃', 'FHT BirdNest'],
    aboval: ['aboval', '阿茂', '阿茂创玩', 'aboval TOY', '茂潮物', 'aboval Lab', '潮茂次元', '阿茂盲盒'],
    kissday: ['kissday', '亲天', '亲天口喷', 'kissday Fresh', '亲天倍润', '亲亲果味', 'kissday 益生菌', '亲天柔香'],
    smartoral: ['SMART ORAL LAB', '智慧口腔实验室', '智慧口腔', 'SmartOral AI', '数智笑容', 'OralCloud', '智齿算法', 'AI Dent']
  };

  const goodsByClass: Record<number, string> = {
    21: '电动牙刷、声波洁齿器、高压脉冲冲牙器、膨胀牙线棒、牙缝刷、电动洁牙刷头、化妆刷具',
    3: '美白牙膏、抑菌漱口水、口腔清新喷雾、洁齿泡泡、牙齿亮白凝胶、洁齿粉、洁面泡泡',
    10: '牙科医用正畸器、医用洁牙仪、牙周冲洗设备、医用冷光美牙仪、洁面美肤仪、导入导出仪',
    9: '智能刷牙监测APP、蓝牙芯片固件、口腔AI识别算法、智能测肤仪传感器软件、手机壳',
    35: '天猫/京东/抖音官方旗舰店、电子商务零售平台、广告宣传推广、商业特许经营',
    11: '牙刷紫外线杀菌盒、浴室智能烘干消毒架、冷光牙齿护理仪光照灯、烘干杀菌器',
    5: '医用口腔抑菌喷剂、牙周凝胶、含漱液药剂、中药滋补饮片',
    22: '旅行便携收纳网袋、牙刷防尘束口袋',
    29: '即食燕窝、冻干滋补品、益生菌健齿乳制品、口腔乳粉',
    30: '燕窝胶原蛋白饮、草本膏方、护齿薄荷糖、口香糖',
    32: '无糖清新苏打水、护齿植物饮料、燕窝饮品',
    18: '便携收纳皮套、旅行化妆洗漱包、文创帆布包',
    28: '潮玩盲盒手办、潮流公仔、儿童刷牙玩具',
    14: '金属徽章、定制礼品饰品、潮玩钥匙扣',
    25: '品牌定制T恤、工作服、潮流服饰',
    36: '知识产权运营与资产管理、品牌投资',
    38: '智能硬件云端通讯服务、物联网数据传输',
    39: '仓储物流配送、冷链运输',
    41: '笑容加口腔健康公开课、医护学术研讨培训、健康生活科普传播、潮玩艺术展览',
    42: '电动牙刷外观工业设计、硬件结构研发、云端口腔健康算法研发、云端软件研发',
    43: '口腔健康线下体验空间服务、主题体验餐饮',
    44: '数字化正畸咨询、连锁口腔门诊合作网络、皮肤护理咨询',
    45: '商标维权保护与防伪确权、知识产权法律服务'
  };

  const domesticCountryOptions = [
    { code: 'CN', name: '中国', flag: '🇨🇳', isDomestic: true },
    { code: 'HK', name: '中国香港', flag: '🇭🇰', isDomestic: true },
    { code: 'TW', name: '中国台湾', flag: '🇹🇼', isDomestic: true },
    { code: 'MO', name: '中国澳门', flag: '🇲🇴', isDomestic: true }
  ];

  const overseasCountryOptions = [
    { code: 'US', name: '美国', flag: '🇺🇸', isDomestic: false },
    { code: 'EU', name: '欧盟', flag: '🇪🇺', isDomestic: false },
    { code: 'JP', name: '日本', flag: '🇯🇵', isDomestic: false },
    { code: 'KR', name: '韩国', flag: '🇰🇷', isDomestic: false },
    { code: 'SG', name: '新加坡', flag: '🇸🇬', isDomestic: false },
    { code: 'GB', name: '英国', flag: '🇬🇧', isDomestic: false },
    { code: 'TH', name: '泰国', flag: '🇹🇭', isDomestic: false },
    { code: 'VN', name: '越南', flag: '🇻🇳', isDomestic: false },
    { code: 'MY', name: '马来西亚', flag: '🇲🇾', isDomestic: false },
    { code: 'ID', name: '印度尼西亚', flag: '🇮🇩', isDomestic: false },
    { code: 'AU', name: '澳大利亚', flag: '🇦🇺', isDomestic: false }
  ];

  const agencies = [
    '北京金杜律师事务所',
    '广州华进联合专利商标代理有限公司',
    '永新知识产权股份有限公司',
    'Baker & McKenzie (贝克·麦坚时)',
    '中国专利代理(香港)有限公司',
    '北京中原信达知识产权代理有限责任公司',
    '柳沈律师事务所'
  ];

  const namesList = brandNamesMap[brandKey] || brandNamesMap['usmile'];
  const appliedClasses = profile.appliedClasses;
  
  // 基准数量计算
  const baseCount = Math.round(325 * profile.totalRatio);
  const domesticCount = Math.round(baseCount * profile.domesticRatio);
  const overseasCount = baseCount - domesticCount;

  const records: BrandLedgerRecord[] = [];

  for (let i = 0; i < baseCount; i++) {
    const isDomestic = i < domesticCount;
    const country = isDomestic 
      ? domesticCountryOptions[i % domesticCountryOptions.length] 
      : overseasCountryOptions[i % overseasCountryOptions.length];
    const tmName = namesList[i % namesList.length];
    const cls = appliedClasses[i % appliedClasses.length];
    const regNo = isDomestic 
      ? `${70000000 + i * 389 + 512}`
      : `${country.code}${88000000 + i * 419 + 703}`;

    // 状态判定
    let status: 'REGISTERED' | 'EXAMINING' | 'GAZETTE_PENDING' | 'OPPOSED' | 'INVALIDATED' | 'RENEWAL_DUE';
    let statusLabel: string;

    const ratio = i / baseCount;
    if (ratio < 0.68) {
      if (i < 12 && isDomestic) {
        status = 'RENEWAL_DUE';
        statusLabel = '临期待续展';
      } else {
        status = 'REGISTERED';
        statusLabel = '已核准注册';
      }
    } else if (ratio < 0.88) {
      status = 'EXAMINING';
      statusLabel = '实质审查中';
    } else if (ratio < 0.94) {
      status = 'GAZETTE_PENDING';
      statusLabel = '初审公告期';
    } else {
      status = 'INVALIDATED';
      statusLabel = '争议/失效';
    }

    // 日期生成：合理分布在 2021 ~ 2026 之间
    const yearOffsets = [2026, 2025, 2025, 2024, 2024, 2023, 2022, 2021];
    const applyYear = yearOffsets[i % yearOffsets.length];
    const applyMonth = ((i * 5) % 12 + 1).toString().padStart(2, '0');
    const applyDay = ((i * 11) % 28 + 1).toString().padStart(2, '0');
    const applyDate = `${applyYear}-${applyMonth}-${applyDay}`;

    // 检查是否在时间范围内
    if (!isDateInRange(applyDate, dateRange, customStart, customEnd)) {
      continue;
    }

    const regDate = status === 'REGISTERED' || status === 'RENEWAL_DUE'
      ? `${applyYear + 1}-${applyMonth}-${applyDay}`
      : undefined;

    const validUntil = regDate
      ? `${applyYear + 11}-${applyMonth}-${applyDay}`
      : undefined;

    records.push({
      id: `ledger-${brandKey}-${i + 1}`,
      name: tmName,
      englishName: tmName.toLowerCase().includes('usmile') || tmName.toLowerCase().includes('waves') || tmName.toLowerCase().includes('kittyannie') || tmName.toLowerCase().includes('aboval') || tmName.toLowerCase().includes('kissday') ? undefined : profile.englishName,
      regNo,
      countryCode: country.code,
      countryName: country.name,
      countryFlag: country.flag,
      isDomestic,
      classes: [cls],
      goods: goodsByClass[cls] || profile.coreGoods,
      status,
      statusLabel,
      applyDate,
      regDate,
      validUntil,
      agency: agencies[i % agencies.length],
      applicant: '广州星际悦动股份有限公司'
    });
  }

  // 保证至少有部分记录展示
  return records;
}

