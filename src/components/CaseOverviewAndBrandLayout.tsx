import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Shield, 
  X, 
  Search, 
  Download, 
  Copy, 
  Check, 
  Clock,
  Info
} from 'lucide-react';
import { NavigationTab, TrademarkItem, CaseManagementItem } from '../types';
import { 
  generateBrandLedgerData, 
  BrandLedgerRecord, 
  BRAND_PROFILES, 
  DateRangeType,
  filterCaseItemsByBrandAndTime,
  isDomesticCountry,
  DOMESTIC_REGIONS
} from '../lib/dashboardFilterUtils';
import { INITIAL_CASE_MANAGEMENT_ITEMS } from '../data/mockData';

interface CaseOverviewAndBrandLayoutProps {
  onNavigate?: (tab: NavigationTab) => void;
  selectedBrand?: string;
  selectedDateRange?: DateRangeType;
  customStartDate?: string;
  customEndDate?: string;
  trademarks?: TrademarkItem[];
  caseItems?: CaseManagementItem[];
  onOpenTrademarkDetail?: (tm: TrademarkItem) => void;
}

export const CaseOverviewAndBrandLayout: React.FC<CaseOverviewAndBrandLayoutProps> = ({
  onNavigate,
  selectedBrand = 'usmile 笑容加',
  selectedDateRange = '近一年',
  customStartDate = '2025-08-18',
  customEndDate = '2026-08-18',
  trademarks = [],
  caseItems = [],
  onOpenTrademarkDetail,
}) => {
  // 品牌配置与核心信息
  const brandProfile = BRAND_PROFILES[selectedBrand] || BRAND_PROFILES['usmile 笑容加'];
  const brandShortName = brandProfile.shortName;

  // 品牌布局选中的分类 (默认 null，显示品牌简称如 usmile / 密浪 / 安妮 等；点击分类如 03 展开内圈小类及 03 大字)
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [hoveredClass, setHoveredClass] = useState<number | null>(null);
  const [hoveredSubClass, setHoveredSubClass] = useState<{ code: string; isRegistered: boolean } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // 台账全屏弹窗状态
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerScope, setLedgerScope] = useState<'ALL' | 'DOMESTIC' | 'OVERSEAS'>('ALL');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<string>('ALL');
  const [ledgerClassFilter, setLedgerClassFilter] = useState<string>('ALL');
  const [ledgerCountryFilter, setLedgerCountryFilter] = useState<string>('ALL');
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 全量台账数据基于全局筛选 (品牌 + 时间) 动态生成
  const fullLedgerData: BrandLedgerRecord[] = useMemo(() => {
    return generateBrandLedgerData(selectedBrand, selectedDateRange, customStartDate, customEndDate);
  }, [selectedBrand, selectedDateRange, customStartDate, customEndDate]);

  // 1. 获取全局案件管理列表数据 (优先使用传入的 caseItems，若未传入则回退至初始 mock 案件集)
  const currentBrandCaseItems = useMemo(() => {
    const rawCases = caseItems && caseItems.length > 0 ? caseItems : INITIAL_CASE_MANAGEMENT_ITEMS;
    return filterCaseItemsByBrandAndTime(rawCases, selectedBrand, selectedDateRange, customStartDate, customEndDate);
  }, [caseItems, selectedBrand, selectedDateRange, customStartDate, customEndDate]);

  // 2. 核心统计逻辑：统计案件管理列表中的尼斯分类和类似群组，案件单据状态=已注册为亮色，否则是浅色
  const brandLayoutStats = useMemo(() => {
    // 已注册的尼斯分类集合 (亮色)
    const registeredClassesSet = new Set<number>();
    // 所有有记录的尼斯分类集合
    const totalRecordedClassesSet = new Set<number>();

    // 每个分类下的类似群组映射 (类似群编号为4位数字编码，如 0301, 2108, 1004 等)
    const registeredSubClassesMap: Record<number, Set<string>> = {};
    const allSubClassesMap: Record<number, Set<string>> = {};

    // 辅助解析案件中的尼斯分类
    const parseClasses = (classesVal: any): number[] => {
      const res: number[] = [];
      if (typeof classesVal === 'string') {
        const matches = classesVal.match(/\d+/g);
        if (matches) {
          matches.forEach(m => {
            const num = parseInt(m, 10);
            if (num >= 1 && num <= 45 && !res.includes(num)) res.push(num);
          });
        }
      } else if (Array.isArray(classesVal)) {
        classesVal.forEach(c => {
          const num = typeof c === 'number' ? c : parseInt(c, 10);
          if (num >= 1 && num <= 45 && !res.includes(num)) res.push(num);
        });
      }
      return res;
    };

    // 辅助解析类似群编码 (4位数字)
    const parseSimilarGroups = (item: CaseManagementItem): string[] => {
      const subSet = new Set<string>();
      if (item.similarGroups) {
        const matches = item.similarGroups.match(/\b\d{4}\b/g) || item.similarGroups.match(/\d{4}/g);
        if (matches) matches.forEach(m => subSet.add(m));
      }
      if (item.goodsList && Array.isArray(item.goodsList)) {
        item.goodsList.forEach(g => {
          const matches = g.match(/\((\d{4})\)/g) || g.match(/\b\d{4}\b/g) || g.match(/\d{4}/g);
          if (matches) {
            matches.forEach(m => {
              const clean = m.replace(/[()]/g, '');
              if (/^\d{4}$/.test(clean)) subSet.add(clean);
            });
          }
        });
      }
      const goodsStr = (item.goodsServices || '') + ' ' + (item.goodsItems || '');
      if (goodsStr) {
        const matches = goodsStr.match(/\((\d{4})\)/g);
        if (matches) {
          matches.forEach(m => {
            const clean = m.replace(/[()]/g, '');
            if (/^\d{4}$/.test(clean)) subSet.add(clean);
          });
        }
      }
      return Array.from(subSet);
    };

    // 辅助判断单据状态是否为已注册
    const isRegisteredStatus = (statusStr: string | undefined): boolean => {
      if (!statusStr) return false;
      const s = statusStr.trim();
      return (
        s === 'REGISTERED' ||
        s === 'COMPLETED' ||
        s === '已注册' ||
        s === '核准注册' ||
        s === '有效' ||
        s.includes('已注册') ||
        s.includes('REGISTERED') ||
        s.includes('核准注册') ||
        s.includes('有效') ||
        s.includes('已发证') ||
        s.includes('发证') ||
        s.includes('归档')
      );
    };

    // 遍历案件管理列表
    currentBrandCaseItems.forEach((cItem) => {
      const cClasses = parseClasses(cItem.classes);
      const cSubs = parseSimilarGroups(cItem);
      const isReg = isRegisteredStatus(cItem.status);

      cClasses.forEach((cls) => {
        totalRecordedClassesSet.add(cls);
        if (!allSubClassesMap[cls]) allSubClassesMap[cls] = new Set<string>();
        if (!registeredSubClassesMap[cls]) registeredSubClassesMap[cls] = new Set<string>();

        // 归集类似群组
        cSubs.forEach((sg) => {
          const prefix = cls.toString().padStart(2, '0');
          if (sg.startsWith(prefix) || cClasses.length === 1) {
            allSubClassesMap[cls].add(sg);
            if (isReg) {
              registeredSubClassesMap[cls].add(sg);
            }
          }
        });

        if (isReg) {
          registeredClassesSet.add(cls);
        }
      });
    });

    // 结合 fullLedgerData 台账数据补充状态
    fullLedgerData.forEach((ledger) => {
      const isReg = ledger.status === 'REGISTERED' || ledger.status === 'RENEWAL_DUE';
      ledger.classes.forEach((cls) => {
        totalRecordedClassesSet.add(cls);
        if (isReg) {
          registeredClassesSet.add(cls);
        }
      });
    });

    // 若当前筛选条件下无注册记录，以品牌基础画像作为保底
    if (registeredClassesSet.size === 0 && brandProfile.appliedClasses) {
      brandProfile.appliedClasses.forEach(cls => registeredClassesSet.add(cls));
    }

    return {
      registeredClasses: Array.from(registeredClassesSet).sort((a, b) => a - b),
      totalRecordedClasses: Array.from(totalRecordedClassesSet).sort((a, b) => a - b),
      registeredSubClassesMap,
      allSubClassesMap
    };
  }, [currentBrandCaseItems, fullLedgerData, brandProfile]);

  // 兼容已应用分类集合
  const appliedClasses = brandLayoutStats.registeredClasses;

  // 45个尼斯分类基础字典 (数量根据当前动态 fullLedgerData 实时统计)
  const niceClassData: Record<number, { 
    name: string; 
    shortName: string; 
    items: string; 
    count: number; 
    tag?: string; 
    subClasses: string[]; 
    registeredSubClasses: string[];
    isRegistered: boolean;
  }> = useMemo(() => {
    const baseDict: Record<number, { name: string; shortName: string; items: string; subClasses: string[]; tag?: string }> = {
      1: { name: '工业用化学品', shortName: '化工', items: '工业清洗剂、防腐制剂', subClasses: ['0101', '0102', '0104', '0108', '0113', '0114'] },
      2: { name: '颜料油漆', shortName: '颜料', items: '包装油墨、表面涂料', subClasses: ['0201', '0202', '0204', '0205', '0207'] },
      3: { name: '日化洗护与牙膏', shortName: '日化', items: '美白牙膏、漱口水、口腔清新喷雾、洁齿粉', subClasses: ['0301', '0302', '0303', '0304', '0306', '0307', '0308', '0309', '0310'], tag: '核心品类' },
      4: { name: '工业油脂', shortName: '油脂', items: '机械润滑油脂', subClasses: ['0401', '0402', '0403', '0404'] },
      5: { name: '医药制剂与抑菌剂', shortName: '医药', items: '抑菌漱口水、医用口腔凝胶、中药滋补饮片', subClasses: ['0501', '0502', '0503', '0504', '0505', '0506', '0507'], tag: '医疗防线' },
      6: { name: '金属制品', shortName: '金属', items: '金属标牌、五金搭扣', subClasses: ['0601', '0602', '0603', '0607', '0608'] },
      7: { name: '机械设备', shortName: '机械', items: '注塑机械、组装设备', subClasses: ['0701', '0702', '0705', '0709', '0711'] },
      8: { name: '手动器具', shortName: '手工', items: '手动洁牙工具、指甲刀、手动修容器', subClasses: ['0801', '0802', '0803', '0806', '0808'] },
      9: { name: '智能APP与智能硬件', shortName: '数码', items: '智能口腔健康管理软件、蓝牙牙刷固件、智能测肤仪', subClasses: ['0901', '0907', '0908', '0909', '0911', '0913', '0920', '0924'], tag: '数智生态' },
      10: { name: '医疗器械与正畸耗材', shortName: '医疗', items: '医用牙科正畸仪、牙周冲洗器、洁面美肤仪', subClasses: ['1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008'], tag: '专业医疗' },
      11: { name: '消毒杀菌与冷光仪', shortName: '家电', items: '牙刷紫外线消毒盒、口腔烘干杀菌架', subClasses: ['1101', '1104', '1105', '1106', '1107', '1109', '1110'] },
      12: { name: '运输工具', shortName: '运输', items: '物流配送车', subClasses: ['1201', '1202', '1204', '1205', '1211'] },
      13: { name: '军火烟火', shortName: '军火', items: '烟火制品', subClasses: ['1301', '1302', '1303'] },
      14: { name: '珠宝首饰', shortName: '珠宝', items: '金属徽章、定制礼品饰品、潮玩吊坠', subClasses: ['1401', '1402', '1403', '1404'] },
      15: { name: '乐器', shortName: '乐器', items: '音乐发声元件', subClasses: ['1501', '1502', '1503'] },
      16: { name: '办公用品与包装盒', shortName: '办公', items: '礼盒包装袋、产品说明书、宣传册', subClasses: ['1601', '1602', '1603', '1604', '1605', '1609'] },
      17: { name: '橡胶绝缘', shortName: '橡胶', items: '硅胶牙刷握把套、防水密封圈', subClasses: ['1701', '1702', '1703', '1704'] },
      18: { name: '皮革皮具', shortName: '皮革', items: '便携收纳皮套、旅行化妆洗漱包、文创帆布包', subClasses: ['1801', '1802', '1804', '1805', '1806'] },
      19: { name: '建筑材料', shortName: '建材', items: '非金属建材', subClasses: ['1901', '1902', '1904'] },
      20: { name: '家具用品', shortName: '家具', items: '浴室置物架、梳妆镜', subClasses: ['2001', '2002', '2003', '2005', '2006'] },
      21: { name: '电动牙刷与洁齿器具', shortName: '洁齿', items: '声波电动牙刷、高压脉冲冲牙器、膨胀牙线、牙缝刷、化妆刷具', subClasses: ['2101', '2105', '2106', '2107', '2108', '2109', '2110', '2111', '2112', '2113'], tag: '核心旗舰' },
      22: { name: '收纳绳网袋篷', shortName: '收纳', items: '便携收纳网袋、旅行束口袋', subClasses: ['2201', '2202', '2203', '2204', '2205'] },
      23: { name: '纺织用纱', shortName: '纱线', items: '牙线原丝、织物纱线', subClasses: ['2301', '2302', '2303'] },
      24: { name: '布料床单', shortName: '布料', items: '超细纤维洗脸巾、擦拭布', subClasses: ['2401', '2402', '2403', '2405'] },
      25: { name: '服装鞋帽', shortName: '服装', items: '品牌定制T恤、工作服、潮流周边', subClasses: ['2501', '2502', '2503', '2507', '2511'] },
      26: { name: '纽扣拉链', shortName: '拉链', items: '拉链配饰', subClasses: ['2601', '2602', '2603'] },
      27: { name: '地毯席垫', shortName: '地毯', items: '防滑地垫', subClasses: ['2701', '2702', '2703'] },
      28: { name: '玩具与健身器械', shortName: '玩具', items: '潮玩盲盒手办、潮流公仔、儿童刷牙玩具', subClasses: ['2801', '2802', '2804', '2805'] },
      29: { name: '食品乳制品与燕窝', shortName: '食品', items: '即食燕窝、冻干滋补品、益生菌护齿乳制品', subClasses: ['2901', '2902', '2903', '2904', '2907', '2911', '2913'] },
      30: { name: '口香糖与薄荷糖', shortName: '糖果', items: '木糖醇护齿薄荷糖、燕窝胶原蛋白饮、草本膏方', subClasses: ['3001', '3002', '3004', '3005', '3006', '3007'] },
      31: { name: '生鲜农产', shortName: '农产', items: '新鲜水果', subClasses: ['3101', '3102', '3103', '3105'] },
      32: { name: '口腔清新饮料', shortName: '饮料', items: '无糖清新苏打水、护齿植物饮料、燕窝饮品', subClasses: ['3201', '3202', '3203'] },
      33: { name: '酒类饮料', shortName: '酒类', items: '配制酒', subClasses: ['3301', '3302', '3303'] },
      34: { name: '烟草烟具', shortName: '烟草', items: '电子烟配件', subClasses: ['3401', '3402', '3407'] },
      35: { name: '电商零售与品牌运营', shortName: '商业', items: '官方旗舰店、电子商务零售平台、广告推广', subClasses: ['3501', '3502', '3503', '3504', '3505', '3506', '3507', '3508', '3509'], tag: '零售渠道' },
      36: { name: '金融物管', shortName: '金融', items: '知识产权运营投资、资产管理', subClasses: ['3601', '3602', '3604', '3605'] },
      37: { name: '建筑维修', shortName: '维修', items: '仪器设备售后维修', subClasses: ['3701', '3702', '3705', '3706'] },
      38: { name: '电信通讯', shortName: '通讯', items: '移动数据传输、云端物联网连接服务', subClasses: ['3801', '3802', '3805'] },
      39: { name: '物流运输', shortName: '运输', items: '仓储冷链配送', subClasses: ['3901', '3902', '3906', '3911'] },
      40: { name: '材料定制与精密加工', shortName: '加工', items: '微马达代工、声波震动总成精密注塑加工', subClasses: ['4001', '4002', '4005', '4010'] },
      41: { name: '口腔科普与用户培训', shortName: '教育', items: '科普讲堂、医护人员学术培训、潮玩艺术展览', subClasses: ['4101', '4102', '4104', '4105', '4107'] },
      42: { name: '软件研发与工业设计', shortName: '研发', items: '外观结构工业设计、智能APP云算法研发', subClasses: ['4209', '4211', '4216', '4220'], tag: '研发创新' },
      43: { name: '主题体验店服务', shortName: '餐饮', items: '品牌健康体验中心、用户交流驿站', subClasses: ['4301', '4302', '4306'] },
      44: { name: '口腔医疗与诊所服务', shortName: '医疗', items: '数字化正畸咨询、连锁口腔门诊合作网络、皮肤护理', subClasses: ['4401', '4402', '4403', '4405'] },
      45: { name: '法律维权与确权', shortName: '维权', items: '知识产权维权保护、品牌打假确权服务', subClasses: ['4501', '4502', '4503', '4505'] },
    };

    const result: Record<number, any> = {};
    for (let c = 1; c <= 45; c++) {
      const info = baseDict[c] || { name: `第${c}类`, shortName: `类${c}`, items: '商品服务项', subClasses: [] };
      const matchingCount = fullLedgerData.filter(d => d.classes.includes(c)).length;
      
      const isRegistered = brandLayoutStats.registeredClasses.includes(c);
      const regSubsSet = brandLayoutStats.registeredSubClassesMap[c] || new Set();
      const allSubsSet = brandLayoutStats.allSubClassesMap[c] || new Set();

      // 合并基础字典类似群组与单据提取的类似群组
      const combinedSubClasses = Array.from(new Set([...info.subClasses, ...Array.from(allSubsSet)])).sort();
      
      // 已注册类似群组 (单据状态=已注册)
      let registeredSubClasses: string[] = [];
      if (regSubsSet.size > 0) {
        registeredSubClasses = combinedSubClasses.filter(s => regSubsSet.has(s));
      } else if (isRegistered) {
        // 如果该类别为已注册，且无特定单据小类时，默认按主打类似群高亮
        registeredSubClasses = combinedSubClasses.slice(0, Math.min(combinedSubClasses.length, Math.max(2, Math.ceil(matchingCount / 3))));
      }

      result[c] = {
        ...info,
        count: matchingCount,
        subClasses: combinedSubClasses,
        registeredSubClasses,
        isRegistered,
      };
    }
    return result;
  }, [fullLedgerData, brandLayoutStats]);

  // =========================================================================
  // 案件预览统计核心逻辑：
  // 1、案件总数：统计案件管理模块中单据总数
  // 2、国内申请数量：统计案件管理模块中单据上申请国家=中国、中国香港、中国台湾、中国澳门的单据数量
  // 3、海外申请数量：统计案件管理模块中单据上申请国家不是中国、中国香港、中国台湾、中国澳门的单据数量
  // =========================================================================
  
  // 辅助判断单据是否为国内申请 (申请国家 = 中国、中国香港、中国台湾、中国澳门)
  const isCaseItemDomestic = (item: CaseManagementItem): boolean => {
    return isDomesticCountry(item.country) || isDomesticCountry(item.jurisdiction) || isDomesticCountry(item.region);
  };

  // 辅助判断单据状态是否为已注册
  const isCaseItemRegistered = (item: CaseManagementItem): boolean => {
    const s = (item.status || '') as string;
    return (
      s === 'REGISTERED' ||
      s === 'COMPLETED' ||
      s === '已注册' ||
      s === '核准注册' ||
      s === '有效' ||
      s.includes('已注册') ||
      s.includes('REGISTERED') ||
      s.includes('核准注册') ||
      s.includes('有效')
    );
  };

  // 统计案件管理模块中单据数据 (若当前品牌与时间区间筛选出的单据列表存在则基于筛选列表，否则基于全量单据)
  const caseSourceItems: CaseManagementItem[] = useMemo(() => {
    if (currentBrandCaseItems && currentBrandCaseItems.length > 0) {
      return currentBrandCaseItems;
    }
    const rawCases = caseItems && caseItems.length > 0 ? caseItems : INITIAL_CASE_MANAGEMENT_ITEMS;
    return rawCases;
  }, [currentBrandCaseItems, caseItems]);

  // 1、案件总数：统计案件管理模块中单据总数
  const totalCasesCount = caseSourceItems.length;

  // 2、国内申请数量：统计案件管理模块中单据上申请国家=中国、中国香港、中国台湾、中国澳门的单据数量
  const domesticCaseItems = useMemo(() => {
    return caseSourceItems.filter(item => isCaseItemDomestic(item));
  }, [caseSourceItems]);
  const domesticCasesCount = domesticCaseItems.length;

  // 3、海外申请数量：统计案件管理模块中单据上申请国家不是中国、中国香港、中国台湾、中国澳门的单据数量
  const overseasCaseItems = useMemo(() => {
    return caseSourceItems.filter(item => !isCaseItemDomestic(item));
  }, [caseSourceItems]);
  const overseasCasesCount = overseasCaseItems.length;

  // 4、国内授权数量 & 海外授权数量 (状态=已注册)
  const domesticRegisteredCount = domesticCaseItems.filter(item => isCaseItemRegistered(item)).length;
  const overseasRegisteredCount = overseasCaseItems.filter(item => isCaseItemRegistered(item)).length;
  const totalRegisteredCount = domesticRegisteredCount + overseasRegisteredCount;

  // 比例与授权率计算
  const domesticRatio = totalCasesCount > 0 ? ((domesticCasesCount / totalCasesCount) * 100).toFixed(1) : '0.0';
  const overseasRatio = totalCasesCount > 0 ? ((overseasCasesCount / totalCasesCount) * 100).toFixed(1) : '0.0';
  const totalGrantRate = totalCasesCount > 0 ? ((totalRegisteredCount / totalCasesCount) * 100).toFixed(1) : '0.0';
  const domesticGrantRate = domesticCasesCount > 0 ? ((domesticRegisteredCount / domesticCasesCount) * 100).toFixed(1) : '0.0';
  const overseasGrantRate = overseasCasesCount > 0 ? ((overseasRegisteredCount / overseasCasesCount) * 100).toFixed(1) : '0.0';

  // 台账状态分布统计
  const examiningCasesCount = fullLedgerData.filter(d => d.status === 'EXAMINING').length;
  const renewalDueCasesCount = fullLedgerData.filter(d => d.status === 'RENEWAL_DUE').length;
  const invalidCasesCount = fullLedgerData.filter(d => d.status === 'INVALIDATED' || d.status === 'OPPOSED').length;
  const ledgerRegisteredCount = fullLedgerData.filter(d => d.status === 'REGISTERED' || d.status === 'RENEWAL_DUE').length;

  // 过滤后的台账数据
  const filteredLedger = useMemo(() => {
    return fullLedgerData.filter((item) => {
      // 范围筛选 (国内 vs 海外)
      if (ledgerScope === 'DOMESTIC' && !item.isDomestic) return false;
      if (ledgerScope === 'OVERSEAS' && item.isDomestic) return false;

      // 状态筛选
      if (ledgerStatusFilter !== 'ALL') {
        if (ledgerStatusFilter === 'REGISTERED' && item.status !== 'REGISTERED' && item.status !== 'RENEWAL_DUE') return false;
        if (ledgerStatusFilter === 'EXAMINING' && item.status !== 'EXAMINING') return false;
        if (ledgerStatusFilter === 'GAZETTE_PENDING' && item.status !== 'GAZETTE_PENDING') return false;
        if (ledgerStatusFilter === 'INVALIDATED' && item.status !== 'INVALIDATED' && item.status !== 'OPPOSED') return false;
        if (ledgerStatusFilter === 'RENEWAL_DUE' && item.status !== 'RENEWAL_DUE') return false;
      }

      // 分类筛选
      if (ledgerClassFilter !== 'ALL' && !item.classes.includes(Number(ledgerClassFilter))) {
        return false;
      }

      // 国家筛选
      if (ledgerCountryFilter !== 'ALL' && item.countryCode !== ledgerCountryFilter) {
        return false;
      }

      // 关键词搜索
      if (ledgerSearch.trim()) {
        const q = ledgerSearch.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesRegNo = item.regNo.toLowerCase().includes(q);
        const matchesCountry = item.countryName.toLowerCase().includes(q);
        const matchesGoods = item.goods.toLowerCase().includes(q);
        const matchesAgency = item.agency.toLowerCase().includes(q);
        const matchesClass = item.classes.some(c => c.toString() === q);
        if (!matchesName && !matchesRegNo && !matchesCountry && !matchesGoods && !matchesAgency && !matchesClass) {
          return false;
        }
      }

      return true;
    });
  }, [fullLedgerData, ledgerScope, ledgerStatusFilter, ledgerClassFilter, ledgerCountryFilter, ledgerSearch]);

  // 分页计算
  const totalPages = Math.ceil(filteredLedger.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLedger.slice(start, start + pageSize);
  }, [filteredLedger, currentPage, pageSize]);

  // 复制单号反馈
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setToastMessage(`已复制注册/申请号：${text}`);
    setTimeout(() => setCopiedId(null), 2000);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 导出 CSV 表格
  const handleExportCSV = () => {
    const headers = [
      '商标名称',
      '注册国家/地区',
      '境内/境外',
      '申请号/注册号',
      '尼斯分类',
      '核定商品/服务项目',
      '当前状态',
      '申请日期',
      '注册生效日',
      '专用权截止日',
      '代理机构',
      '申请人主体'
    ];

    const rows = filteredLedger.map((item) => [
      item.name,
      `${item.countryFlag} ${item.countryName} (${item.countryCode})`,
      item.isDomestic ? '国内申请' : '海外布局',
      item.regNo,
      `第${item.classes.join(',')}类`,
      `"${item.goods.replace(/"/g, '""')}"`,
      item.statusLabel,
      item.applyDate,
      item.regDate || '-',
      item.validUntil || '-',
      item.agency,
      item.applicant
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedBrand}_商标资产台账全景表_${filteredLedger.length}件.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG 扇形计算辅助函数
  const describeArc = (
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const startRad = toRad(startAngle);
    const endRad = toRad(endAngle);

    const x1 = cx + outerRadius * Math.cos(startRad);
    const y1 = cy + outerRadius * Math.sin(startRad);
    const x2 = cx + outerRadius * Math.cos(endRad);
    const y2 = cy + outerRadius * Math.sin(endRad);

    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  // 45个类别数据与扇区定位 (已注册为亮色 #2b7bbb，否则是浅色 #e0f2fe)
  const wheelSectors = useMemo(() => {
    const cx = 260;
    const cy = 260;
    const stepAngle = 360 / 45; // 8° 每类
    const gap = 0.9; // 扇区间隔

    return Array.from({ length: 45 }, (_, i) => {
      const classNum = i + 1;
      const isRegistered = brandLayoutStats.registeredClasses.includes(classNum);
      const isApplied = brandLayoutStats.totalRecordedClasses.includes(classNum);
      
      // 01类从顶部正上方(12点钟)顺时针排列
      const startAngle = (i * stepAngle) - 90 + (gap / 2);
      const endAngle = ((i + 1) * stepAngle) - 90 - (gap / 2);
      const midAngle = (startAngle + endAngle) / 2;
      const midRad = (midAngle * Math.PI) / 180;

      // 尺寸定义
      const numberRingRadius = 180; // 数字徽章圆心半径
      const badgeX = cx + numberRingRadius * Math.cos(midRad);
      const badgeY = cy + numberRingRadius * Math.sin(midRad);

      const innerArcRadius = 196;
      const outerArcRadius = 236;

      const pathData = describeArc(cx, cy, innerArcRadius, outerArcRadius, startAngle, endAngle);

      return {
        classNum,
        isRegistered,
        isApplied,
        startAngle,
        endAngle,
        midAngle,
        badgeX,
        badgeY,
        pathData,
        info: niceClassData[classNum] || { name: '未定义品类', shortName: '商标', items: '暂无明细', count: 0, subClasses: [] },
      };
    });
  }, [brandLayoutStats, niceClassData]);

  const activeDisplayClass = hoveredClass || selectedClass;
  const activeClassData = activeDisplayClass ? niceClassData[activeDisplayClass] : null;
  const isCurrentActiveRegistered = activeDisplayClass ? brandLayoutStats.registeredClasses.includes(activeDisplayClass) : false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      {/* Toast 提示 (页面居中显示) */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] max-w-md px-6 py-4 bg-slate-900/95 backdrop-blur-md text-white text-sm font-semibold rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-slate-700/80 pointer-events-none text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      
      {/* Left Column: 案件预览 (只统计：案件总量、国内申请数量、海外申请数量、国内授权数量、海外授权数量) */}
      <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
        <div className="space-y-3">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-base font-extrabold text-slate-900 font-sans tracking-tight">案件预览</h2>
              <span className="text-xs text-slate-500 font-normal">
                {selectedBrand} · {selectedDateRange} · 国内外申请与授权核心统计
              </span>
            </div>

            {/* 查看台账按钮 */}
            <button
              onClick={() => {
                setLedgerSearch('');
                setLedgerScope('ALL');
                setLedgerStatusFilter('ALL');
                setLedgerClassFilter('ALL');
                setLedgerCountryFilter('ALL');
                setCurrentPage(1);
                setIsLedgerModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>查看台账</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {/* 1. 案件总量 (突出置顶大卡片) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>案件总量</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-sans mt-0.5">
                {totalCasesCount} <span className="text-xs font-normal text-slate-500">件</span>
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                涵盖【{selectedBrand}】在【{selectedDateRange}】内的全部在案申请与授权记录
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-slate-400">总授权数</div>
              <div className="text-base sm:text-lg font-black text-emerald-600 font-sans mt-0.5">{totalRegisteredCount} 件</div>
              <div className="text-[11px] font-bold text-emerald-700">总确权率 {totalGrantRate}%</div>
            </div>
          </div>

          {/* 2. 四大核心指标网格 (国内申请数量、海外申请数量、国内授权数量、海外授权数量) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 国内申请数量 */}
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/90 flex flex-col justify-between">
              <div className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                <span>🇨🇳</span>
                <span>国内申请数量</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-blue-900 font-sans mt-1.5">
                {domesticCasesCount} <span className="text-xs font-normal text-blue-600">件</span>
              </div>
              <div className="text-[11px] text-blue-600 mt-1 font-medium">
                占案件总量 {domesticRatio}%
              </div>
            </div>

            {/* 海外申请数量 */}
            <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/90 flex flex-col justify-between">
              <div className="text-xs font-semibold text-indigo-800 flex items-center gap-1.5">
                <span>🌐</span>
                <span>海外申请数量</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-indigo-900 font-sans mt-1.5">
                {overseasCasesCount} <span className="text-xs font-normal text-indigo-600">件</span>
              </div>
              <div className="text-[11px] text-indigo-600 mt-1 font-medium">
                占案件总量 {overseasRatio}%
              </div>
            </div>

            {/* 国内授权数量 */}
            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/90 flex flex-col justify-between">
              <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>国内授权数量</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 font-sans mt-1.5">
                {domesticRegisteredCount} <span className="text-xs font-normal text-emerald-600">件</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 font-bold">
                国内授权率 {domesticGrantRate}%
              </div>
            </div>

            {/* 海外授权数量 */}
            <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100/90 flex flex-col justify-between">
              <div className="text-xs font-semibold text-teal-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>海外授权数量</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-teal-900 font-sans mt-1.5">
                {overseasRegisteredCount} <span className="text-xs font-normal text-teal-600">件</span>
              </div>
              <div className="text-[11px] text-teal-700 mt-1 font-bold">
                海外授权率 {overseasGrantRate}%
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Right Column: 品牌布局 (Brand Layout - 45 尼斯分类与类似群组 · 案件单据状态=已注册为亮色，否是是浅色) */}
      <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between relative overflow-hidden">
        
        {/* 顶部标题与状态标签 (同一行：左侧主副标题，右侧状态统计) */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-base font-extrabold text-slate-900 font-sans tracking-tight">品牌布局</h2>
            <span className="text-xs text-slate-500 font-normal">{selectedBrand} 商标分类与类似群布局</span>
          </div>

          {/* 右侧分类状态统计 (已注册 亮色 · 未注册 浅色) */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-medium text-slate-700" title="案件单据状态【已注册】的分类（亮色）">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2b7bbb] inline-block shadow-2xs"></span>
                <span>已注册</span>
                <span className="font-extrabold text-slate-900 font-mono">{brandLayoutStats.registeredClasses.length}</span>
                <span className="text-slate-500">类</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-500" title="未注册或在办的分类（浅色）">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e0f2fe] border border-sky-300/80 inline-block"></span>
                <span>未注册</span>
                <span className="font-extrabold text-slate-700 font-mono">{45 - brandLayoutStats.registeredClasses.length}</span>
                <span className="text-slate-500">类</span>
              </div>
            </div>
          </div>
        </div>

        {/* 环形 45 类放射状布局主视区 */}
        <div 
          className="flex-1 flex flex-col items-center justify-center py-1 relative min-h-[320px]"
          onMouseLeave={() => {
            setHoveredClass(null);
            setHoveredSubClass(null);
            setMousePos(null);
          }}
        >

          {/* 鼠标移入类目时的 Toast 提示框 (显示类目中文名称及详情) */}
          {(hoveredClass !== null || hoveredSubClass !== null) && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/90 backdrop-blur-md flex items-center gap-3 pointer-events-none transition-all duration-150 animate-in fade-in slide-in-from-top-2 w-[94%] sm:w-auto max-w-[360px]">
              {hoveredSubClass ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
                    <span className="font-mono font-extrabold text-sky-300 text-[11px]">
                      {hoveredSubClass.code}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sky-200 text-xs">类似群 {hoveredSubClass.code}</span>
                    </div>
                    {selectedClass !== null && niceClassData[selectedClass] && (
                      <div className="text-[11px] text-slate-300 truncate mt-0.5">
                        所属品类：<span className="text-white font-bold">第 {selectedClass.toString().padStart(2, '0')} 类 · {niceClassData[selectedClass].name}</span>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      hoveredSubClass.isRegistered
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {hoveredSubClass.isRegistered ? '已注册' : '未注册'}
                    </span>
                  </div>
                </>
              ) : hoveredClass !== null && niceClassData[hoveredClass] ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0">
                    <span className="font-mono font-extrabold text-blue-300 text-xs">
                      {hoveredClass.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-white text-xs truncate">
                        第 {hoveredClass.toString().padStart(2, '0')} 类 · {niceClassData[hoveredClass].name}
                      </span>
                      {niceClassData[hoveredClass].tag && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 shrink-0">
                          {niceClassData[hoveredClass].tag}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-300 truncate mt-0.5">
                      {niceClassData[hoveredClass].items}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      niceClassData[hoveredClass].isRegistered
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {niceClassData[hoveredClass].isRegistered ? '已注册 · 亮色' : '未注册 · 浅色'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {niceClassData[hoveredClass].subClasses?.length || 0} 个群组
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* SVG 45类环状图 */}
          <div 
            className="relative w-full max-w-[370px] aspect-square flex items-center justify-center"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }}
          >
            <svg
              viewBox="0 0 520 520"
              className="w-full h-full select-none"
            >
              {/* 当选中某个分类时，渲染内圈 360° 类似群组 Sunburst 环状分布 */}
              {selectedClass !== null && (() => {
                const classObj = niceClassData[selectedClass];
                const subCodes = classObj?.subClasses || [];
                if (subCodes.length === 0) return null;
                const N = subCodes.length;
                const subStepAngle = 360 / N;
                const subGap = 1.0;

                const registeredSubs = classObj?.registeredSubClasses || [];

                return (
                  <g className="inner-subclasses-group transition-all duration-300">
                    {subCodes.map((subCode, k) => {
                      const subStartAngle = (k * subStepAngle) - 90 + (subGap / 2);
                      const subEndAngle = ((k + 1) * subStepAngle) - 90 - (subGap / 2);
                      const subMidAngle = (subStartAngle + subEndAngle) / 2;
                      const subMidRad = (subMidAngle * Math.PI) / 180;

                      // 内圈类似群环半径: 78 ~ 138
                      const subInnerRadius = 78;
                      const subOuterRadius = 138;
                      const subPath = describeArc(260, 260, subInnerRadius, subOuterRadius, subStartAngle, subEndAngle);

                      // 文字中心坐标与旋转角度
                      const midR = (subInnerRadius + subOuterRadius) / 2;
                      const tx = 260 + midR * Math.cos(subMidRad);
                      const ty = 260 + midR * Math.sin(subMidRad);

                      let rot = subMidAngle + 90;
                      if (subMidAngle > 90 && subMidAngle < 270) {
                        rot -= 180;
                      }

                      // 统计逻辑：单据状态=已注册为亮色(#2b7bbb)，否是是浅色(#e0f2fe)
                      const isSubRegistered = registeredSubs.includes(subCode);

                      const subFill = isSubRegistered ? '#2b7bbb' : '#e0f2fe';
                      const subTextColor = isSubRegistered ? '#ffffff' : '#0284c7';
                      const hoverClass = isSubRegistered ? 'hover:fill-[#1d68a7]' : 'hover:fill-[#bae6fd]';

                      return (
                        <g key={`sub-${subCode}`}>
                          <path
                            d={subPath}
                            fill={subFill}
                            stroke="#ffffff"
                            strokeWidth={1.5}
                            className={`transition-colors duration-150 cursor-pointer ${hoverClass}`}
                            onMouseEnter={() => setHoveredSubClass({ code: subCode, isRegistered: isSubRegistered })}
                            onMouseLeave={() => setHoveredSubClass(null)}
                          >
                            <title>{`类似群：${subCode} (${isSubRegistered ? '已注册 · 亮色' : '未注册 · 浅色'})`}</title>
                          </path>
                          <text
                            x={tx}
                            y={ty + 3.5}
                            textAnchor="middle"
                            fill={subTextColor}
                            fontSize="10"
                            fontWeight="800"
                            transform={`rotate(${rot}, ${tx}, ${ty})`}
                            style={{ pointerEvents: 'none' }}
                          >
                            {subCode}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })()}

              {/* 外圈 45 类扇区柱 (Outer Sector Wedges: 已注册为亮色 #2b7bbb，否则是浅色 #e0f2fe) */}
              <g className="sectors-group">
                {wheelSectors.map((sector) => {
                  const isSelected = selectedClass === sector.classNum;
                  const isHovered = hoveredClass === sector.classNum;
                  const hasSelection = selectedClass !== null;

                  // 统计逻辑：已注册为亮色，否则是浅色
                  const fillColor = sector.isRegistered ? '#2b7bbb' : '#e0f2fe';
                  
                  // 透明度控制：当选中某一类时，非选中类变淡 (透明度 0.35)
                  let opacity = 1;
                  if (hasSelection) {
                    opacity = isSelected ? 1 : 0.35;
                  } else if (hoveredClass !== null) {
                    opacity = isHovered ? 1 : 0.85;
                  }

                  return (
                    <path
                      key={`sector-${sector.classNum}`}
                      d={sector.pathData}
                      fill={fillColor}
                      className="transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedClass(prev => prev === sector.classNum ? null : sector.classNum)}
                      onMouseEnter={() => {
                        setHoveredClass(sector.classNum);
                        setHoveredSubClass(null);
                      }}
                      onMouseLeave={() => setHoveredClass(null)}
                      opacity={opacity}
                    >
                      <title>{`第 ${sector.classNum.toString().padStart(2, '0')} 类 · ${sector.info.name} (${sector.isRegistered ? `已注册 · 亮色` : sector.isApplied ? `申请中/未注册 · 浅色` : '未注册 · 浅色'})`}</title>
                    </path>
                  );
                })}
              </g>

              {/* 外圈分类选中的浮动 Badge 标签 (如 日化) */}
              {selectedClass !== null && (() => {
                const sector = wheelSectors.find(s => s.classNum === selectedClass);
                if (!sector) return null;

                const midRad = (sector.midAngle * Math.PI) / 180;
                const pillX = 260 + 246 * Math.cos(midRad);
                const pillY = 260 + 246 * Math.sin(midRad);
                const tagLabel = sector.info.shortName || sector.info.name.slice(0, 2);

                return (
                  <g transform={`translate(${pillX}, ${pillY})`} className="select-none pointer-events-none z-30 animate-in zoom-in-90 duration-150">
                    <rect
                      x="-22"
                      y="-13"
                      width="44"
                      height="26"
                      rx="6"
                      fill="#2b7bbb"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="drop-shadow-md"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="12"
                      fontWeight="900"
                    >
                      {tagLabel}
                    </text>
                  </g>
                );
              })()}

              {/* 编号徽章 (Inner Number Badges 01~45: 已注册亮色，否则浅色) */}
              <g className="badges-group">
                {wheelSectors.map((sector) => {
                  const isSelected = selectedClass === sector.classNum;
                  const isHovered = hoveredClass === sector.classNum;
                  const hasSelection = selectedClass !== null;

                  const badgeBg = sector.isRegistered ? '#2b7bbb' : '#e0f2fe';
                  const textColor = sector.isRegistered ? '#ffffff' : '#0369a1';

                  let opacity = 1;
                  if (hasSelection) {
                    opacity = isSelected ? 1 : 0.35;
                  }

                  return (
                    <g
                      key={`badge-${sector.classNum}`}
                      onClick={() => setSelectedClass(prev => prev === sector.classNum ? null : sector.classNum)}
                      onMouseEnter={() => setHoveredClass(sector.classNum)}
                      onMouseLeave={() => setHoveredClass(null)}
                      className="cursor-pointer transition-transform duration-150"
                      opacity={opacity}
                      style={{
                        transformOrigin: `${sector.badgeX}px ${sector.badgeY}px`,
                        transform: isSelected ? 'scale(1.25)' : isHovered ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      <circle
                        cx={sector.badgeX}
                        cy={sector.badgeY}
                        r={11.5}
                        fill={badgeBg}
                        stroke={isSelected ? '#ffffff' : 'none'}
                        strokeWidth={isSelected ? 2 : 0}
                      />
                      <text
                        x={sector.badgeX}
                        y={sector.badgeY + 4}
                        textAnchor="middle"
                        fill={textColor}
                        fontSize="9.5"
                        fontWeight="800"
                        fontFamily="ui-sans-serif, system-ui, sans-serif"
                        style={{ pointerEvents: 'none' }}
                      >
                        {sector.classNum.toString().padStart(2, '0')}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* 中心空白圆盘与大字提示 (支持点击还原成当前品牌名称) */}
              <circle
                cx={260}
                cy={260}
                r={70}
                fill="#ffffff"
                className="cursor-pointer transition-colors duration-150 hover:fill-slate-50"
                onClick={() => setSelectedClass(null)}
              />

              {/* 中心文字: 未选中或移入任何类目时显示当前品牌短名，选中或悬停时显示两位数大字如 03 */}
              {activeDisplayClass === null ? (
                <text
                  x={260}
                  y={269}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize={brandShortName.length > 4 ? "24" : "30"}
                  fontWeight="800"
                  fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  className="cursor-pointer select-none"
                  onClick={() => setSelectedClass(null)}
                >
                  {brandShortName}
                </text>
              ) : (
                <text
                  x={260}
                  y={274}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="44"
                  fontWeight="900"
                  fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  className="cursor-pointer select-none"
                  onClick={() => setSelectedClass(null)}
                >
                  {activeDisplayClass.toString().padStart(2, '0')}
                </text>
              )}
            </svg>
          </div>

        </div>

        {/* 底部交互状态与统计规则指引 */}
        {selectedClass !== null ? (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs px-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">
                第 {selectedClass.toString().padStart(2, '0')} 类 · {niceClassData[selectedClass]?.name}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                brandLayoutStats.registeredClasses.includes(selectedClass)
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {brandLayoutStats.registeredClasses.includes(selectedClass) ? '已注册 (亮色)' : '未注册 (浅色)'}
              </span>
            </div>
            <div className="text-slate-500 text-[11px] flex items-center gap-2.5">
              <span>
                类似群：已注册 <b className="text-blue-700 font-mono">{niceClassData[selectedClass]?.registeredSubClasses?.length || 0}</b> 个 / 未注册 <b className="text-slate-600 font-mono">{(niceClassData[selectedClass]?.subClasses?.length || 0) - (niceClassData[selectedClass]?.registeredSubClasses?.length || 0)}</b> 个
              </span>
              <button 
                onClick={() => setSelectedClass(null)}
                className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
              >
                还原视图
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 px-0.5">
            <span>💡 统计逻辑：单据状态【已注册】的分类与类似群为亮色，其余为浅色</span>
            <span className="hidden sm:inline">点击任意类号可展开查看内圈类似群分布</span>
          </div>
        )}

      </div>

      {/* ================= 全屏台账信息弹框 (超大可视区覆盖) ================= */}
      {isLedgerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full h-full max-w-[98vw] max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* 1. Modal Top Bar - 浅色简约协调设计 */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold font-sans tracking-tight text-slate-900">
                      {selectedBrand} · 商标资产台账全景清单
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                      全量 {totalCasesCount} 件
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      筛选周期: {selectedDateRange}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    涵盖中国国内 {domesticCasesCount} 件与海外全球 {overseasCasesCount} 件商标申请、审查、授权与全生命周期台账档案
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* 导出表格按钮 */}
                <button
                  onClick={handleExportCSV}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                  title="导出当前筛选结果为 CSV 表格"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>导出台账 ({filteredLedger.length})</span>
                </button>

                {/* 关闭按钮 */}
                <button
                  onClick={() => setIsLedgerModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="关闭"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. Filter & Search Toolbar (丰富多维筛选) */}
            <div className="px-6 py-3 bg-slate-50/95 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              
              {/* Left filters: Scope tabs & Status & Class */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* 境内/境外范围 Tab */}
                <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs text-xs font-bold">
                  <button
                    onClick={() => { setLedgerScope('ALL'); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-md transition-all ${
                      ledgerScope === 'ALL' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    全部 ({totalCasesCount})
                  </button>
                  <button
                    onClick={() => { setLedgerScope('DOMESTIC'); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-md transition-all ${
                      ledgerScope === 'DOMESTIC' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🇨🇳 国内申请 ({domesticCasesCount})
                  </button>
                  <button
                    onClick={() => { setLedgerScope('OVERSEAS'); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-md transition-all ${
                      ledgerScope === 'OVERSEAS' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🌐 海外布局 ({overseasCasesCount})
                  </button>
                </div>

                {/* 状态下拉 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">案件状态:</span>
                  <select
                    value={ledgerStatusFilter}
                    onChange={(e) => { setLedgerStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium cursor-pointer shadow-2xs"
                  >
                    <option value="ALL">全部状态</option>
                    <option value="REGISTERED">已核准注册 ({totalRegisteredCount})</option>
                    <option value="EXAMINING">实质审查中 ({examiningCasesCount})</option>
                    <option value="RENEWAL_DUE">临期待续展 ({renewalDueCasesCount})</option>
                    <option value="INVALIDATED">争议/失效 ({invalidCasesCount})</option>
                  </select>
                </div>

                {/* 尼斯分类下拉 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">类别:</span>
                  <select
                    value={ledgerClassFilter}
                    onChange={(e) => { setLedgerClassFilter(e.target.value); setCurrentPage(1); }}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium cursor-pointer shadow-2xs"
                  >
                    <option value="ALL">全部已申请类别 ({appliedClasses.length}类)</option>
                    {appliedClasses.map(clsNum => (
                      <option key={`opt-cls-${clsNum}`} value={clsNum.toString()}>
                        第 {clsNum.toString().padStart(2, '0')} 类 ({niceClassData[clsNum]?.shortName || niceClassData[clsNum]?.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 国家地区下拉 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">国家/地区:</span>
                  <select
                    value={ledgerCountryFilter}
                    onChange={(e) => { setLedgerCountryFilter(e.target.value); setCurrentPage(1); }}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium cursor-pointer shadow-2xs"
                  >
                    <option value="ALL">全部国家/地区</option>
                    <option value="CN">🇨🇳 中国</option>
                    <option value="US">🇺🇸 美国</option>
                    <option value="EU">🇪🇺 欧盟</option>
                    <option value="JP">🇯🇵 日本</option>
                    <option value="KR">🇰🇷 韩国</option>
                    <option value="SG">🇸🇬 新加坡</option>
                    <option value="GB">🇬🇧 英国</option>
                    <option value="TH">🇹🇭 泰国</option>
                    <option value="AU">🇦🇺 澳大利亚</option>
                    <option value="VN">🇻🇳 越南</option>
                    <option value="MY">🇲🇾 马来西亚</option>
                    <option value="ID">🇮🇩 印度尼西亚</option>
                  </select>
                </div>
              </div>

              {/* Right Search Input */}
              <div className="relative min-w-[260px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="搜索商标名、注册号、国家、商品项、代理机构..."
                  value={ledgerSearch}
                  onChange={(e) => { setLedgerSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-2xs"
                />
                {ledgerSearch && (
                  <button
                    onClick={() => { setLedgerSearch(''); setCurrentPage(1); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>

            {/* 3. Table View (铺满全屏超大可视区) */}
            <div className="flex-1 overflow-auto bg-slate-50/40 p-4 sm:p-6">
              <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                  <thead className="bg-slate-100/90 text-slate-600 font-extrabold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-3.5 w-12 text-center text-slate-400">#</th>
                      <th className="py-3 px-3.5 min-w-[150px]">商标标样与名称</th>
                      <th className="py-3 px-3.5 min-w-[120px]">申请号 / 注册号</th>
                      <th className="py-3 px-3.5 min-w-[120px]">注册国家 / 地区</th>
                      <th className="py-3 px-3.5 min-w-[100px]">尼斯类别</th>
                      <th className="py-3 px-3.5 min-w-[260px]">核定商品 / 服务项目</th>
                      <th className="py-3 px-3.5 min-w-[110px]">当前案件状态</th>
                      <th className="py-3 px-3.5 min-w-[100px]">申请日期</th>
                      <th className="py-3 px-3.5 min-w-[110px]">注册日 / 绝期日</th>
                      <th className="py-3 px-3.5 min-w-[160px]">代理律师事务所</th>
                      <th className="py-3 px-3.5 w-20 text-right pr-4">操作</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {paginatedList.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-16 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Search className="w-8 h-8 text-slate-300" />
                            <span className="font-bold text-slate-600">未找到符合筛选条件的商标记录</span>
                            <span className="text-xs text-slate-400">请尝试清空搜索词或切换筛选维度</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedList.map((item, idx) => {
                        const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                        return (
                          <tr 
                            key={item.id} 
                            className="hover:bg-blue-50/50 transition-colors group"
                          >
                            {/* Index */}
                            <td className="py-3 px-3.5 text-center font-mono text-slate-400 text-[11px]">
                              {globalIndex}
                            </td>

                            {/* Trademark Name & Logo */}
                            <td className="py-3 px-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-2xs shrink-0 font-sans group-hover:scale-105 transition-transform">
                                  {item.name.slice(0, 2)}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {item.applicant}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Reg No */}
                            <td className="py-3 px-3.5 font-mono font-bold text-blue-700">
                              <div className="flex items-center gap-1.5">
                                <span>{item.regNo}</span>
                                <button
                                  onClick={() => handleCopy(item.regNo)}
                                  className="text-slate-400 hover:text-blue-600 p-0.5 rounded cursor-pointer transition-colors"
                                  title="复制注册号"
                                >
                                  {copiedId === item.regNo ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* Country */}
                            <td className="py-3 px-3.5">
                              <span className="inline-flex items-center gap-1.5 font-medium">
                                <span className="text-base">{item.countryFlag}</span>
                                <span className="text-slate-800 font-bold">{item.countryName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({item.countryCode})</span>
                              </span>
                            </td>

                            {/* Nice Class */}
                            <td className="py-3 px-3.5">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-black text-slate-700 text-[11px] border border-slate-200">
                                第 {item.classes[0]?.toString().padStart(2, '0')} 类
                              </span>
                            </td>

                            {/* Goods items */}
                            <td className="py-3 px-3.5 text-slate-600 max-w-[280px]">
                              <div className="line-clamp-2 text-xs leading-relaxed" title={item.goods}>
                                {item.goods}
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3 px-3.5">
                              {item.status === 'RENEWAL_DUE' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                  <Clock className="w-3 h-3 text-amber-700" /> 临期待续展
                                </span>
                              ) : item.status === 'REGISTERED' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> 已核准注册
                                </span>
                              ) : item.status === 'EXAMINING' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 实质审查中
                                </span>
                              ) : item.status === 'GAZETTE_PENDING' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span> 初审公告期
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span> 异议/失效
                                </span>
                              )}
                            </td>

                            {/* Apply Date */}
                            <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500">
                              {item.applyDate}
                            </td>

                            {/* Reg / Valid Date */}
                            <td className="py-3 px-3.5 font-mono text-[11px]">
                              {item.validUntil ? (
                                <div>
                                  <span className="text-slate-800 font-bold">{item.validUntil}</span>
                                  <div className="text-[10px] text-slate-400">核准: {item.regDate}</div>
                                </div>
                              ) : (
                                <span className="text-slate-400">审查在途</span>
                              )}
                            </td>

                            {/* Agency */}
                            <td className="py-3 px-3.5 text-xs text-slate-600 truncate max-w-[160px]" title={item.agency}>
                              {item.agency}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3.5 text-right pr-4">
                              <button
                                onClick={() => handleCopy(item.regNo)}
                                className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100/60 rounded-md transition-colors cursor-pointer"
                              >
                                复制
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Modal Footer Bar (分页与数据统计) */}
            <div className="px-6 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
              
              {/* Statistics info */}
              <div className="flex items-center gap-4 text-slate-500">
                <span>
                  共检索到 <strong className="text-slate-900 font-mono font-bold">{filteredLedger.length}</strong> 件商标（品牌在案 {totalCasesCount} 件）
                </span>
                <span className="hidden md:inline-block text-slate-300">|</span>
                <div className="hidden md:flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    已注册: <strong>{totalRegisteredCount}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    审查中: <strong>{examiningCasesCount}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    待续展: <strong>{renewalDueCasesCount}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    争议/失效: <strong>{invalidCasesCount}</strong>
                  </span>
                </div>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span>每页展示:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-300 rounded-md text-xs font-medium cursor-pointer"
                  >
                    <option value={20}>20 条</option>
                    <option value={50}>50 条</option>
                    <option value={100}>100 条</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none rounded-md font-bold text-slate-700 cursor-pointer"
                  >
                    上一页
                  </button>
                  <span className="px-2 font-mono text-slate-600 font-bold">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none rounded-md font-bold text-slate-700 cursor-pointer"
                  >
                    下一页
                  </button>
                </div>

                <button
                  onClick={() => setIsLedgerModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-colors cursor-pointer ml-2 shadow-2xs"
                >
                  关闭
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
