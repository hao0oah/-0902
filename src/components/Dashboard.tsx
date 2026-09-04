import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Search, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  Stamp, 
  Layers,
  ChevronDown,
  Activity,
  RotateCcw,
  ArrowUpRight,
  Sparkles,
  X,
  Copy,
  Check,
  Download,
  Filter,
  Building2,
  ExternalLink,
  ArrowRight,
  Folder,
  User,
  MessageSquare,
  Flame
} from 'lucide-react';
import { TrademarkItem, MonitoringAlert, EnforcementCase, NavigationTab, CaseManagementItem } from '../types';
import { INITIAL_CASE_MANAGEMENT_ITEMS } from '../data/mockData';
import { getRegionByCountry } from '../lib/mappingStore';
import { RealWorldMap } from './RealWorldMap';
import { TrademarkMonitoringSection } from './TrademarkMonitoringExact';
import { CaseOverviewAndBrandLayout } from './CaseOverviewAndBrandLayout';
import { NiceClassMultiSelect } from './NiceClassMultiSelect';
import { isItemInSelectedClasses, ALL_45_NICE_CLASSES } from '../data/niceClasses45';
import { FeedbackDrawer } from './FeedbackDrawer';
import { filterCaseItemsByBrandAndTime, filterRenewalRecords, DateRangeType } from '../lib/dashboardFilterUtils';
import { GoodItemSearchSelect } from './GoodItemSearchSelect';
import { 
  getNiceClassificationMappings, 
  subscribeNiceClassificationChanges, 
  NiceClassificationItem 
} from '../lib/niceClassificationStore';

interface DashboardProps {
  trademarks: TrademarkItem[];
  alerts: MonitoringAlert[];
  enforcementCases: EnforcementCase[];
  caseItems?: CaseManagementItem[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenTrademarkDetail: (tm: TrademarkItem) => void;
  onOpenNewApplication: () => void;
  onOpenAiAssistant: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  trademarks,
  alerts,
  enforcementCases,
  caseItems = INITIAL_CASE_MANAGEMENT_ITEMS,
  onNavigate,
  onOpenTrademarkDetail,
}) => {
  // Filter States
  const [selectedBrand, setSelectedBrand] = useState('usmile 笑容加');
  const [selectedDateRange, setSelectedDateRange] = useState<'近一年' | '近半年' | '近3个月' | '近1个月' | '自定义'>('近一年');
  const [customStartDate, setCustomStartDate] = useState('2025-08-18');
  const [customEndDate, setCustomEndDate] = useState('2026-08-18');

  // 订阅系统管理模块中【商标分类与类群组与商品/服务项目的关系表】实时数据
  const [niceItems, setNiceItems] = useState<NiceClassificationItem[]>(() => getNiceClassificationMappings());

  useEffect(() => {
    const unsub = subscribeNiceClassificationChanges(() => {
      setNiceItems(getNiceClassificationMappings());
    });
    return () => unsub();
  }, []);

  // 当前选中的【商品/服务】项目列表 (支持多选，为空数组 [] 代表 '全部商品/服务 (全量统计)')
  const [selectedGoodItems, setSelectedGoodItems] = useState<NiceClassificationItem[]>([]);

  // 悬浮人员面板状态 (自右向左弹出)
  const [isFloatingWidgetHovered, setIsFloatingWidgetHovered] = useState(false);
  // 点击/悬浮百分比圆圈弹出的 Toast 提示框状态
  const [showActiveUserToast, setShowActiveUserToast] = useState(false);
  // 鼠标悬浮问号图标弹出的活跃率计算公式 Toast 提示框状态
  const [showRateFormulaToast, setShowRateFormulaToast] = useState(false);
  // 需求反馈右侧抽屉弹窗状态
  const [isFeedbackDrawerOpen, setIsFeedbackDrawerOpen] = useState(false);

  // 全局根据【品牌】和【时间】筛选案件列表
  const globalFilteredCaseItems = useMemo(() => {
    return filterCaseItemsByBrandAndTime(caseItems, selectedBrand, selectedDateRange, customStartDate, customEndDate);
  }, [caseItems, selectedBrand, selectedDateRange, customStartDate, customEndDate]);

  // 判断案件是否符合选择的【商品/服务】项目列表 (支持多选，只要案件满足多选列表中任意一项即算匹配)
  const isCaseMatchingGoodItems = (c: CaseManagementItem, selectedItems: NiceClassificationItem[]) => {
    if (!selectedItems || selectedItems.length === 0) return true;

    const cGoodsServices = ((c.goodsServices || '') + ' ' + (c.goodsItems || '')).toLowerCase();
    const cGroups = (c.similarGroups || '').toLowerCase();
    const cClasses = (c.classes || '').toLowerCase();

    return selectedItems.some((selectedItem) => {
      const targetName = (selectedItem.itemNameCn || '').trim().toLowerCase();
      const targetGroup = (selectedItem.groupCode || '').trim().toLowerCase();
      const targetClassNum = selectedItem.classNum;

      // 1. 类似群组匹配
      if (targetGroup && (cGroups.includes(targetGroup) || cGoodsServices.includes(targetGroup))) {
        return true;
      }

      // 2. 商品中文名全称或包含匹配
      if (targetName && cGoodsServices.includes(targetName)) {
        return true;
      }

      // 3. 词组切分关键词匹配 (如 "电动牙刷" 匹配 "智能声波电动牙刷")
      if (targetName) {
        const parts = targetName.split(/[/,、\s]+/).filter(p => p.length >= 2);
        for (const p of parts) {
          if (cGoodsServices.includes(p)) return true;
        }
      }

      // 4. 尼斯类别号匹配
      if (targetClassNum) {
        const classNumStr = targetClassNum.toString();
        const classPattern = `第${classNumStr}类`;
        if (cClasses.includes(classPattern) || cClasses.includes(`第0${classNumStr}类`) || cClasses.includes(`${classNumStr}类`)) {
          if (selectedItem.groupName && cGoodsServices.includes(selectedItem.groupName.toLowerCase())) {
            return true;
          }
          if (!targetGroup) return true;
        }
      }

      return false;
    });
  };

  // 商标地图板块筛选后的真实案件数据 (联动【品牌】、【时间】和多选【商品/服务】)
  const mapFilteredCaseItems = useMemo(() => {
    if (selectedGoodItems.length === 0) return globalFilteredCaseItems;
    return globalFilteredCaseItems.filter(item => isCaseMatchingGoodItems(item, selectedGoodItems));
  }, [globalFilteredCaseItems, selectedGoodItems]);

  // 1. 商标地图板块指标统计（按筛选后的真实数据动态计算）
  const totalCasesCount = mapFilteredCaseItems.length;

  // 审查中统计 (包含审查中、实质审查中、申请中、待申请、待答复、初审公告等)
  const examiningCasesCount = mapFilteredCaseItems.filter(c => {
    const s = (c.status || '') as string;
    return s === 'EXAMINING' || s === 'APPLYING' || s === 'PENDING_APPLY' || s === 'PENDING_REPLY' || s === 'CURRENT' || s === 'WAITING' || 
           s === '审查中' || s === '实质审查中' || s === '申请中' || s === '待申请' || s === '初审公告' || s === '待答复' || s === '待复审答辩' ||
           s.includes('审查') || s.includes('申请') || s.includes('公告') || s.includes('答复');
  }).length;

  // 已注册统计 (包含已注册、核准注册、COMPLETED等)
  const registeredCasesCount = mapFilteredCaseItems.filter(c => {
    const s = (c.status || '') as string;
    return s === 'REGISTERED' || s === 'COMPLETED' || s === '已注册' || s === '核准注册' || 
           s.includes('已注册') || s.includes('REGISTERED') || s.includes('核准注册') || s.includes('有效');
  }).length;

  // 失效统计 (包含已失效、驳回、无效宣告等)
  const invalidCasesCount = mapFilteredCaseItems.filter(c => {
    const s = (c.status || '') as string;
    return s === 'INVALID' || s === '已失效' || s === '驳回' || s === '无效宣告' ||
           s.includes('驳回') || s.includes('失效') || s.includes('INVALID') || s.includes('无效');
  }).length;

  // 全局续展监控提醒数据 (基于品牌与时间范围)
  const filteredRenewals = useMemo(() => {
    return filterRenewalRecords(selectedBrand, selectedDateRange, customStartDate, customEndDate);
  }, [selectedBrand, selectedDateRange, customStartDate, customEndDate]);

  const nearestRenewal = filteredRenewals[0];
  const nearestRenewalDays = nearestRenewal ? nearestRenewal.days : 31;
  const nearestRenewalDateStr = nearestRenewal ? nearestRenewal.date.replace(/-/g, '年').replace(/年(\d{2})$/, '月$1日') : '2026年09月18日';

  // 案件超期提醒数量 (随品牌与时间联动)
  const overdueCasesCount = useMemo(() => {
    if (selectedDateRange === '近1个月') return Math.max(1, Math.round(filteredRenewals.length * 0.15));
    if (selectedDateRange === '近3个月') return Math.max(2, Math.round(filteredRenewals.length * 0.25));
    if (selectedDateRange === '近半年') return Math.max(2, Math.round(filteredRenewals.length * 0.3));
    return Math.max(1, Math.round(filteredRenewals.length * 0.25));
  }, [filteredRenewals, selectedDateRange]);
  
  // Drill-down Modal State (4 Metric Cards)
  const [drillDownCategory, setDrillDownCategory] = useState<'ALL' | 'EXAMINING' | 'REGISTERED' | 'INVALID' | null>(null);
  const [drillDownSearch, setDrillDownSearch] = useState('');
  const [drillDownSelectedClasses, setDrillDownSelectedClasses] = useState<number[]>([]);

  // Renewal Alert Modal State
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [renewalSearch, setRenewalSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setToastMessage(`已复制：${text}`);
    setTimeout(() => setCopiedId(null), 2000);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPLY':
      case '待申请':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span>待申请</span>
          </span>
        );
      case 'APPLYING':
      case '申请中':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>申请中</span>
          </span>
        );
      case 'EXAMINING':
      case '审查中':
      case '实质审查中':
      case '初审公告':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>{status === '初审公告' ? '初审公告' : '审查中'}</span>
          </span>
        );
      case 'REGISTERED':
      case '已注册':
      case '核准注册':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>已注册</span>
          </span>
        );
      case 'PENDING_REPLY':
      case '待答复':
      case '待复审答辩':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
            <span>{status === '待复审答辩' ? '待复审答辩' : '待答复'}</span>
          </span>
        );
      case 'INVALID':
      case '已失效':
      case '驳回':
      case '无效宣告':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>{status.includes('驳回') ? '驳回失效' : '已失效'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>{status}</span>
          </span>
        );
    }
  };

  const filteredDrillDownCases = mapFilteredCaseItems.filter(item => {
    // 1. Category / Status Filter
    if (drillDownCategory === 'EXAMINING') {
      const s = (item.status || '') as string;
      const isExamining = 
        s === 'EXAMINING' || s === 'APPLYING' || s === 'PENDING_APPLY' || s === 'PENDING_REPLY' || s === 'CURRENT' || s === 'WAITING' || 
        s === '审查中' || s === '实质审查中' || s === '申请中' || s === '待申请' || s === '初审公告' || s === '待答复' || s === '待复审答辩' ||
        s.includes('审查') || s.includes('申请') || s.includes('公告') || s.includes('答复');
      if (!isExamining) return false;
    } else if (drillDownCategory === 'REGISTERED') {
      const s = (item.status || '') as string;
      const isRegistered = 
        s === 'REGISTERED' || s === 'COMPLETED' || s === '已注册' || s === '核准注册' || 
        s.includes('已注册') || s.includes('REGISTERED') || s.includes('核准注册') || s.includes('有效');
      if (!isRegistered) return false;
    } else if (drillDownCategory === 'INVALID') {
      const s = (item.status || '') as string;
      const isInvalid = 
        s === 'INVALID' || s === '已失效' || s === '驳回' || s === '无效宣告' ||
        s.includes('驳回') || s.includes('失效') || s.includes('INVALID') || s.includes('无效');
      if (!isInvalid) return false;
    }

    // 2. Class Filter (支持45个尼斯分类多选)
    if (drillDownSelectedClasses.length > 0) {
      if (!isItemInSelectedClasses(item.classes, drillDownSelectedClasses)) {
        return false;
      }
    }

    // 3. Search Filter
    if (drillDownSearch.trim()) {
      const q = drillDownSearch.toLowerCase().trim();
      const match = 
        (item.caseNo || '').toLowerCase().includes(q) ||
        (item.proposalNo || '').toLowerCase().includes(q) ||
        (item.trademarkName || '').toLowerCase().includes(q) ||
        (item.brand || '').toLowerCase().includes(q) ||
        (item.country || item.jurisdiction || '').toLowerCase().includes(q) ||
        (item.region || '').toLowerCase().includes(q) ||
        (item.classes || '').toLowerCase().includes(q) ||
        (item.applicationNo || '').toLowerCase().includes(q) ||
        (item.registrationNo || '').toLowerCase().includes(q) ||
        (item.agencyName || '').toLowerCase().includes(q) ||
        (item.goodsItems || '').toLowerCase().includes(q) ||
        (item.latestProgress || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const handleResetFilters = () => {
    setSelectedBrand('usmile 笑容加');
    setSelectedDateRange('近一年');
    setCustomStartDate('2025-08-18');
    setCustomEndDate('2026-08-18');
  };

  return (
    <div className="space-y-3.5">
      {/* Toast 提示 (页面居中显示) */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] max-w-md px-6 py-4 bg-slate-900/95 backdrop-blur-md text-white text-sm font-semibold rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-slate-700/80 pointer-events-none text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      
      {/* 1. Global Filter Bar (包含品牌与时间筛选) */}
      <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-6">
        {/* 品牌 */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-700 font-normal whitespace-nowrap">品牌</span>
          <div className="relative">
            <select 
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
              }}
              className="text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/80 border border-slate-300 rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer min-w-[170px]"
            >
              <option value="usmile 笑容加">usmile 笑容加</option>
              <option value="密浪 Waves">密浪 Waves</option>
              <option value="净白云朵">净白云朵</option>
              <option value="KittyAnnie 小猫安妮">KittyAnnie 小猫安妮</option>
              <option value="FHT 新燕">FHT 新燕</option>
              <option value="aboval 阿茂">aboval 阿茂</option>
              <option value="kissday 亲天">kissday 亲天</option>
              <option value="SMART ORAL LAB 智慧口腔实验室">SMART ORAL LAB 智慧口腔实验室</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 时间筛选 */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-700 font-normal whitespace-nowrap">时间</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select 
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value as any)}
                className="text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/80 border border-slate-300 rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer min-w-[110px]"
              >
                <option value="近一年">近一年</option>
                <option value="近半年">近半年</option>
                <option value="近3个月">近3个月</option>
                <option value="近1个月">近1个月</option>
                <option value="自定义">自定义</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {selectedDateRange === '自定义' && (
              <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                <input 
                  type="date" 
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="text-xs text-slate-800 bg-white border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-400 text-xs">至</span>
                <input 
                  type="date" 
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="text-xs text-slate-800 bg-white border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Section 1: 商标地图 (Trademark Map & Real High-Precision Carto GIS Layout) */}
      <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
        
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-bold text-slate-900 font-sans">商标地图</h2>
            <span className="text-xs text-slate-400">按品牌与商品/服务查看全球商标布局状态</span>
          </div>

          {/* 商品/服务 (在商标地图卡片右侧) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-700 font-normal whitespace-nowrap">商品/服务</span>
            <GoodItemSearchSelect
              niceItems={niceItems}
              selectedItems={selectedGoodItems}
              onSelectItems={setSelectedGoodItems}
            />
          </div>
        </div>

        {/* 4 Stat Metric Cards (上一版精致小巧指标卡，支持点击下钻，问号悬浮显示统计说明) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Card 1: 全部数量 */}
          <div 
            onClick={() => {
              setDrillDownCategory('ALL');
              setDrillDownSearch('');
              setDrillDownSelectedClasses([]);
            }}
            className="bg-blue-50/40 hover:bg-blue-50/80 p-3 rounded-xl border border-blue-100/90 hover:border-blue-300 flex items-center justify-between transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
          >
            <div>
              <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                <span className="group-hover:text-blue-700 transition-colors">全部数量</span>
                
                {/* 统计说明 Tooltip */}
                <div 
                  className="relative group/tooltip inline-flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600 transition-colors cursor-help" />
                  <div className="opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-normal leading-relaxed rounded-xl shadow-xl border border-slate-700/80 z-50">
                    <div className="font-bold text-blue-300 mb-0.5 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      <span>【全部数量】统计说明</span>
                    </div>
                    <div>统计【案件管理】列表中的全部案件数据（共 {totalCasesCount} 件）。点击可下钻查看完整台账清单。</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight font-sans">{totalCasesCount}</span>
                <span className="text-xs text-slate-400">件</span>
                <span className="text-[10px] text-blue-600 ml-1.5 font-bold opacity-0 group-hover:opacity-100 transition-opacity">下钻 →</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: 审查中 */}
          <div 
            onClick={() => {
              setDrillDownCategory('EXAMINING');
              setDrillDownSearch('');
              setDrillDownSelectedClasses([]);
            }}
            className="bg-emerald-50/30 hover:bg-emerald-50/70 p-3 rounded-xl border border-emerald-100/90 hover:border-emerald-300 flex items-center justify-between transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
          >
            <div>
              <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                <span className="group-hover:text-emerald-700 transition-colors">审查中</span>

                {/* 统计说明 Tooltip */}
                <div 
                  className="relative group/tooltip inline-flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-help" />
                  <div className="opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-normal leading-relaxed rounded-xl shadow-xl border border-slate-700/80 z-50">
                    <div className="font-bold text-emerald-300 mb-0.5 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      <span>【审查中】统计说明</span>
                    </div>
                    <div>处于各国家/地区商标主管局【审查中】状态的在途案件（共 {examiningCasesCount} 件）。点击可下钻查看审核进度。</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight font-sans">{examiningCasesCount}</span>
                <span className="text-xs text-slate-400">件</span>
                <span className="text-[10px] text-emerald-600 ml-1.5 font-bold opacity-0 group-hover:opacity-100 transition-opacity">下钻 →</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: 已注册 */}
          <div 
            onClick={() => {
              setDrillDownCategory('REGISTERED');
              setDrillDownSearch('');
              setDrillDownSelectedClasses([]);
            }}
            className="bg-sky-50/40 hover:bg-sky-50/80 p-3 rounded-xl border border-sky-100/90 hover:border-sky-300 flex items-center justify-between transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
          >
            <div>
              <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                <span className="group-hover:text-sky-700 transition-colors">已注册</span>

                {/* 统计说明 Tooltip */}
                <div 
                  className="relative group/tooltip inline-flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-sky-600 transition-colors cursor-help" />
                  <div className="opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-normal leading-relaxed rounded-xl shadow-xl border border-slate-700/80 z-50">
                    <div className="font-bold text-sky-300 mb-0.5 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      <span>【已注册】统计说明</span>
                    </div>
                    <div>已获各国商标主管局核发商标注册证书、处于法定专用权有效保护期内的有效商标（共 {registeredCasesCount} 件）。点击可下钻查看证书档案。</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight font-sans">{registeredCasesCount}</span>
                <span className="text-xs text-slate-400">件</span>
                <span className="text-[10px] text-sky-600 ml-1.5 font-bold opacity-0 group-hover:opacity-100 transition-opacity">下钻 →</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: 失效 */}
          <div 
            onClick={() => {
              setDrillDownCategory('INVALID');
              setDrillDownSearch('');
              setDrillDownSelectedClasses([]);
            }}
            className="bg-purple-50/30 hover:bg-purple-50/70 p-3 rounded-xl border border-purple-100/90 hover:border-purple-300 flex items-center justify-between transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
          >
            <div>
              <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                <span className="group-hover:text-purple-700 transition-colors">失效</span>

                {/* 统计说明 Tooltip */}
                <div 
                  className="relative group/tooltip inline-flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-purple-600 transition-colors cursor-help" />
                  <div className="opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-normal leading-relaxed rounded-xl shadow-xl border border-slate-700/80 z-50">
                    <div className="font-bold text-purple-300 mb-0.5 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      <span>【失效】统计说明</span>
                    </div>
                    <div>因专用权期满未续展、被撤销连续三年不使用或无效宣告终局裁定失效的商标记录（共 {invalidCasesCount} 件）。点击可下钻查看历史归档。</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight font-sans">{invalidCasesCount}</span>
                <span className="text-xs text-slate-400">件</span>
                <span className="text-[10px] text-purple-600 ml-1.5 font-bold opacity-0 group-hover:opacity-100 transition-opacity">下钻 →</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* Real Cartographic GIS World Map Container */}
        <RealWorldMap 
          onNavigate={onNavigate} 
          onOpenTrademarkDetail={onOpenTrademarkDetail}
          selectedBrand={selectedBrand}
          selectedGoodItem={
            selectedGoodItems.length === 0
              ? '全部商品/服务'
              : selectedGoodItems.length === 1
              ? `${selectedGoodItems[0].itemNameCn} (${selectedGoodItems[0].groupCode})`
              : selectedGoodItems.map(i => i.itemNameCn).join('、')
          }
          caseItems={mapFilteredCaseItems}
        />
      </div>

      {/* 续展监控提醒与案件超期提醒卡片 (放在商标地图卡片后面) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        {/* Left: 续展监控提醒 (点击查看弹出弹窗) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">续展监控提醒</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                距离下次最早续展的商标有 <span className="text-blue-600 text-base font-black">{filteredRenewals.length}</span> 件
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                商标绝期：{nearestRenewalDateStr} · 按最早期限计算总量
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              setRenewalSearch('');
              setIsRenewalModalOpen(true);
            }}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>查看</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Right: 案件超期提醒 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">案件超期提醒</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                此次内部超期商标案件有 <span className="text-rose-600 text-base font-black">{overdueCasesCount}</span> 件
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                最早官方期限：2026年08月15日 · 请优先完成内部处理
              </div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('enforcement')}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>处理</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* 3. Section 2: 商标监测 (案件类型、案件状态、案件结果 · 严格对齐图表设计) */}
      <TrademarkMonitoringSection 
        enforcementCases={enforcementCases}
        selectedBrand={selectedBrand} 
        selectedDateRange={selectedDateRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
      />

      {/* 4. Section 3: 案件预览 (Case Overview) & 品牌布局 (Brand Nice Classification) */}
      <CaseOverviewAndBrandLayout 
        onNavigate={onNavigate} 
        selectedBrand={selectedBrand} 
        selectedDateRange={selectedDateRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        caseItems={caseItems}
      />

      {/* 6. Drill-down Modal for Metric Cards (商标地图4个指标卡下钻明细弹窗 - 全屏大可视区) */}
      {drillDownCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full h-full max-w-[98vw] max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header - 浅色简约协调设计 */}
            <div className="px-6 py-4 bg-white border-b border-slate-200/90 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  drillDownCategory === 'ALL'
                    ? 'bg-blue-50/80 border-blue-200 text-blue-600'
                    : drillDownCategory === 'EXAMINING'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-600'
                    : drillDownCategory === 'REGISTERED'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-600'
                    : 'bg-purple-50/80 border-purple-200 text-purple-600'
                }`}>
                  {drillDownCategory === 'ALL' && <MapPin className="w-5 h-5" />}
                  {drillDownCategory === 'EXAMINING' && <Clock className="w-5 h-5" />}
                  {drillDownCategory === 'REGISTERED' && <CheckCircle2 className="w-5 h-5" />}
                  {drillDownCategory === 'INVALID' && <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-slate-900 font-sans">
                      {drillDownCategory === 'ALL' && '全部商标资产下钻清单'}
                      {drillDownCategory === 'EXAMINING' && '实质审查在途商标清单'}
                      {drillDownCategory === 'REGISTERED' && '已核准注册有效商标清单'}
                      {drillDownCategory === 'INVALID' && '失效/争议商标历史档案'}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      drillDownCategory === 'ALL'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : drillDownCategory === 'EXAMINING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : drillDownCategory === 'REGISTERED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {drillDownCategory === 'ALL' && `共 ${totalCasesCount} 件`}
                      {drillDownCategory === 'EXAMINING' && `共 ${examiningCasesCount} 件`}
                      {drillDownCategory === 'REGISTERED' && `共 ${registeredCasesCount} 件`}
                      {drillDownCategory === 'INVALID' && `共 ${invalidCasesCount} 件`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {drillDownCategory === 'ALL' && '统计范围：全球布局涵盖 🇨🇳 中国、🇺🇸 美国、🇪🇺 欧盟、🇯🇵 日本等重点市场'}
                    {drillDownCategory === 'EXAMINING' && '数据范围：仅展示官方案件状态为【审查中】的在途商标案件'}
                    {drillDownCategory === 'REGISTERED' && '保护状态：均在法定专用权有效期内，享有独占使用及维权权利'}
                    {drillDownCategory === 'INVALID' && '记录状态：期满未续展已失效、被撤三或无效宣告终结'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDrillDownCategory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar (45个尼斯分类多选 + 关键词搜索 + 多维检索) */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200/90 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">分类筛选：</span>
                    <NiceClassMultiSelect
                      selectedClasses={drillDownSelectedClasses}
                      onChange={setDrillDownSelectedClasses}
                      placeholder="全部分类 (45类可选 · 支持搜索/多选)"
                    />
                  </div>

                  {drillDownSelectedClasses.length > 0 && (
                    <button
                      onClick={() => setDrillDownSelectedClasses([])}
                      className="text-xs text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>重置分类</span>
                    </button>
                  )}
                </div>

                {/* Search input */}
                <div className="relative min-w-[260px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜索案件号、商标名、注册号、国家、律所..."
                    value={drillDownSearch}
                    onChange={(e) => setDrillDownSearch(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                  {drillDownSearch && (
                    <button
                      onClick={() => setDrillDownSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Selected Class Badges Pills (if any selected) */}
              {drillDownSelectedClasses.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60">
                  <span className="text-[11px] font-medium text-slate-400">已选分类:</span>
                  {drillDownSelectedClasses.map(num => {
                    const clsInfo = ALL_45_NICE_CLASSES.find(c => c.classNum === num);
                    return (
                      <span 
                        key={`sel-cls-${num}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs"
                      >
                        <span>第{String(num).padStart(2, '0')}类 {clsInfo?.shortName}</span>
                        <button
                          type="button"
                          onClick={() => setDrillDownSelectedClasses(drillDownSelectedClasses.filter(c => c !== num))}
                          className="text-blue-400 hover:text-blue-700 p-0.2 rounded hover:bg-blue-100 transition-colors"
                          title="移除该类别"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                  <button
                    onClick={() => setDrillDownSelectedClasses([])}
                    className="text-[11px] text-slate-400 hover:text-rose-600 ml-1 underline cursor-pointer"
                  >
                    清空全部 ({drillDownSelectedClasses.length})
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/90 text-left text-xs font-semibold text-slate-600 sticky top-0 z-10 backdrop-blur-xs">
                    <tr>
                      <th className="py-3 px-3.5 w-12 text-center">序号</th>
                      <th className="py-3 px-3.5 min-w-[140px]">案件编号 / 建案编码</th>
                      <th className="py-3 px-3.5 min-w-[180px]">商标图样 / 商标名称</th>
                      <th className="py-3 px-3.5 min-w-[120px]">品牌</th>
                      <th className="py-3 px-3.5 min-w-[110px]">商品类别</th>
                      <th className="py-3 px-3.5 min-w-[120px]">申请地区 / 申请国家</th>
                      <th className="py-3 px-3.5 min-w-[90px]">案件状态</th>
                      <th className="py-3 px-3.5 min-w-[130px]">官方申请号 / 日期</th>
                      <th className="py-3 px-3.5 min-w-[130px]">官方注册号 / 日期</th>
                      <th className="py-3 px-3.5 min-w-[150px]">代理机构</th>
                      <th className="py-3 px-3.5 min-w-[140px]">最新进度</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredDrillDownCases.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-16 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Folder className="w-8 h-8 text-slate-300" />
                            <p className="text-sm font-medium text-slate-500">未查询到符合条件的商标档案案件</p>
                            <p className="text-xs text-slate-400">请尝试更换筛选项或重置搜索条件</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredDrillDownCases.map((item, idx) => (
                        <tr 
                          key={item.id || idx} 
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="space-y-0.5">
                              <span className="font-mono font-semibold text-slate-900 block">
                                {item.caseNo}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono block">
                                {item.proposalNo || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 font-bold text-[11px] text-blue-600">
                                {item.trademarkName?.slice(0, 2) || 'TM'}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 block truncate">
                                  {item.trademarkName}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate block">
                                  {item.trademarkForm || '文字商标'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="text-slate-900 text-xs font-medium">
                              {item.brand || 'usmile 笑容加'}
                            </span>
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="font-mono text-xs text-slate-700 font-medium">
                              {item.classes || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 text-slate-900 font-medium text-xs">
                                <Globe2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <span>{item.country || item.jurisdiction || '中国'}</span>
                              </div>
                              <span className="text-[11px] text-slate-400 pl-5">
                                {item.region || getRegionByCountry(item.country || item.jurisdiction || '中国')}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            {renderStatusBadge(item.status)}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="space-y-0.5">
                              <span className="font-mono text-xs text-slate-900 font-medium block">
                                {item.applicationNo || '-'}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono block">
                                {item.applyDate || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="space-y-0.5">
                              <span className="font-mono text-xs text-slate-900 font-medium block">
                                {item.registrationNo || '-'}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono block">
                                {item.registrationDate || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="text-xs text-slate-700 truncate max-w-[140px]" title={item.agencyName || '-'}>
                              {item.agencyName || '-'}
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span className="truncate max-w-[130px]" title={item.latestProgress || '正常流程推进中'}>
                                {item.latestProgress || '正常流程推进中'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>共展示 {filteredDrillDownCases.length} 件商标档案记录</span>
              <button
                onClick={() => setDrillDownCategory(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
              >
                关闭
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. Renewal Alert Modal (续展监控提醒弹窗 - 全屏大可视区) */}
      {isRenewalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full h-full max-w-[98vw] max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header - 浅色简约协调设计 */}
            <div className="px-6 py-4 bg-white border-b border-slate-200/90 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold font-sans text-slate-900">
                      续展监控提醒 · 临期商标资产清单
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      共 {filteredRenewals.length} 件需近期处理
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    商标绝期：{nearestRenewalDateStr} · 处于法定期内/宽展期，请在绝期日前完成官方委案
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsRenewalModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>续展合规提示：</strong>距离最早到期仅剩 <strong>{nearestRenewalDays} 天</strong>，建议提前 3~6 个月完成官方委案申报，避免产生额外宽展滞纳官费。
              </span>
            </div>

            {/* Search Bar */}
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-600">
                待续展清单明细 ({filteredRenewals.length}件)
              </div>
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索商标名、注册号、国家..."
                  value={renewalSearch}
                  onChange={(e) => setRenewalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Table of expiring trademarks (平铺单列视图，样式与表头对齐商标监测模块，无操作列) */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[12px] font-semibold text-slate-600 whitespace-nowrap">
                      <th className="py-3 px-3 w-16 text-center">商标图样</th>
                      <th className="py-3 px-4">商标名称</th>
                      <th className="py-3 px-4">申请号/注册号</th>
                      <th className="py-3 px-4 text-center">尼斯分类</th>
                      <th className="py-3 px-4">申请人名称</th>
                      <th className="py-3 px-4">注册/初审公告日</th>
                      <th className="py-3 px-4">在先权利/引证标的</th>
                      <th className="py-3 px-4 text-center">风险等级</th>
                      <th className="py-3 px-4 text-center">绝限期</th>
                      <th className="py-3 px-4 text-center">剩余天数</th>
                      <th className="py-3 px-4 text-center">处置状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 whitespace-nowrap">
                    {filteredRenewals
                      .filter((item) => {
                        if (!renewalSearch) return true;
                        const q = renewalSearch.toLowerCase();
                        return (
                          item.name.toLowerCase().includes(q) ||
                          item.reg.toLowerCase().includes(q) ||
                          item.country.toLowerCase().includes(q) ||
                          item.agency.toLowerCase().includes(q) ||
                          item.applicant.toLowerCase().includes(q)
                        );
                      })
                      .map((item, idx) => (
                        <tr key={`renewal-${idx}`} className="hover:bg-blue-50/20 transition-colors group">
                          {/* 1. 商标图样 */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs mx-auto relative group/img">
                              <div className="flex flex-col items-center justify-center text-center w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 rounded font-bold font-mono text-[10px] text-slate-600">
                                {item.name.slice(0, 3)}
                              </div>
                            </div>
                          </td>

                          {/* 2. 商标名称 */}
                          <td className="py-3 px-4 font-bold text-[#235fff]">
                            <span>{item.name}</span>
                          </td>

                          {/* 3. 申请号/注册号 */}
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                            #{item.reg}
                          </td>

                          {/* 4. 商标类别 */}
                          <td className="py-3 px-4 text-center text-slate-900 text-xs font-medium">
                            第 {item.cls.toString().padStart(2, '0')} 类
                          </td>

                          {/* 5. 申请人名称 */}
                          <td className="py-3 px-4 text-slate-800 font-medium max-w-[180px] truncate" title={item.applicant}>
                            {item.applicant}
                          </td>

                          {/* 6. 注册/初审公告日 */}
                          <td className="py-3 px-4 font-mono text-slate-700">
                            {item.regDate}
                          </td>

                          {/* 7. 在先权利/引证标的 */}
                          <td className="py-3 px-4 text-slate-800 font-medium">
                            {item.priorRights}
                          </td>

                          {/* 8. 风险等级 */}
                          <td className="py-3 px-4 text-center">
                            {item.riskLevel === 'CRITICAL' ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                                <Flame className="w-2.5 h-2.5 text-rose-600" />
                                极高风险
                              </span>
                            ) : item.riskLevel === 'HIGH' ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                                高风险
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
                                中度风险
                              </span>
                            )}
                          </td>

                          {/* 9. 绝限期 */}
                          <td className="py-3 px-4 text-center font-mono text-slate-600">
                            {item.date}
                          </td>

                          {/* 10. 剩余天数 */}
                          <td className="py-3 px-4 text-center font-mono font-medium">
                            <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                              item.days <= 31 ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold' : 'bg-slate-100 text-slate-700 border border-slate-200/80'
                            }`}>
                              剩 {item.days} 天
                            </span>
                          </td>

                          {/* 11. 处置状态 */}
                          <td className="py-3 px-4 text-center">
                            {item.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                已完成续展
                              </span>
                            ) : item.status === 'IN_PROGRESS' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                续展申报中
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                待处理续展
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>续展数据已实时与主管局同步</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRenewalModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 右下角悬浮业务负责人与活跃率按钮 (自右向左弹出，移开自左向右收起) */}
      <div 
        onMouseEnter={() => setIsFloatingWidgetHovered(true)}
        onMouseLeave={() => {
          setIsFloatingWidgetHovered(false);
          setShowActiveUserToast(false);
          setShowRateFormulaToast(false);
        }}
        className={`fixed bottom-12 right-0 z-[9999] transition-transform duration-300 ease-out flex items-center cursor-pointer select-none ${
          isFloatingWidgetHovered ? 'translate-x-0' : 'translate-x-[calc(100%-3.6rem)]'
        }`}
        title="悬浮百分比圆圈查看详细活跃数据"
      >
        <div className="flex items-center gap-3 bg-neutral-500/90 hover:bg-neutral-600/95 backdrop-blur-md text-white py-2 px-3 rounded-l-full border-l-2 border-t border-b border-neutral-300/40 shadow-2xl transition-colors duration-200">
          {/* 左侧 100% 亮蓝色圆环图标 */}
          <div 
            onMouseEnter={() => setShowActiveUserToast(true)}
            onMouseLeave={() => setShowActiveUserToast(false)}
            className="w-11 h-11 rounded-full border-[3.5px] border-sky-400 bg-neutral-600/80 flex items-center justify-center shrink-0 font-black text-[12px] text-white shadow-inner tracking-tighter"
          >
            100%
          </div>

          {/* 右侧业务负责人及活跃率文案 */}
          <div className="flex flex-col justify-center text-xs space-y-1 pr-2 whitespace-nowrap">
            <div className="font-bold text-white text-[12px] tracking-wide flex items-center gap-2">
              <span className="text-white/90">业务负责人</span>
              <span className="font-extrabold text-white">牟虹帅 (Aaron)</span>
            </div>
            <div className="text-white/90 text-[11px] font-medium flex items-center gap-1.5 leading-none">
              <span className="text-white/80">月活跃率</span>
              <span className="font-extrabold text-white flex items-center gap-1">
                100% <span className="font-normal text-white/80">(1天)</span>
                <span 
                  onMouseEnter={() => setShowRateFormulaToast(true)}
                  onMouseLeave={() => setShowRateFormulaToast(false)}
                  className="w-4 h-4 inline-flex items-center justify-center cursor-pointer text-white/70 hover:text-white transition-colors ml-0.5 shrink-0"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-white/80 hover:text-white transition-colors pointer-events-none" />
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 鼠标悬浮问号图标弹出的活跃率公式 Toast 提示语 */}
      {showRateFormulaToast && (
        <div 
          onMouseEnter={() => setShowRateFormulaToast(true)}
          onMouseLeave={() => setShowRateFormulaToast(false)}
          className="fixed bottom-28 right-6 z-[10001] bg-[#26262a] text-slate-100 rounded-lg py-2.5 px-3.5 shadow-2xl border border-slate-700/60 text-xs sm:text-[13px] leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-medium text-slate-200">
              活跃率:本月内，用户访问看板的自然日总天数:(月自然日总天数x用户数)
            </span>
          </div>
        </div>
      )}

      {/* 鼠标悬浮百分比圆圈弹出的 Toast 提示框 (完全还原图片中的暗色卡片样式) */}
      {showActiveUserToast && (
        <div 
          onMouseEnter={() => setShowActiveUserToast(true)}
          onMouseLeave={() => setShowActiveUserToast(false)}
          className="fixed bottom-28 right-6 z-[10000] max-w-2xl bg-[#26262a] text-slate-100 rounded-lg py-3.5 px-4 shadow-2xl border border-slate-700/60 text-xs sm:text-[13px] leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 font-normal text-slate-200">
              {/* Row 1: 业务负责人 */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <User className="w-4 h-4 text-slate-200 shrink-0" />
                <span className="font-bold text-white">业务负责人:</span>
                <span className="text-white">牟虹帅 (Aaron)</span>
                <span className="text-slate-300">
                  (月活跃率: <span className="text-[#22c55e] font-bold">100%</span>, 人均活跃天数: 1)
                </span>
              </div>

              {/* Row 2: 上级主管 */}
              <div className="pl-5 flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-white">上级主管:</span>
                <span className="text-white">陈建勇</span>
                <span className="text-slate-300">
                  (月活跃率: <span className="text-[#22c55e] font-bold">100%</span>, 人均活跃天数: 1)
                </span>
              </div>

              {/* Row 3: 关键用户 */}
              <div className="pl-5 flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-white">关键用户:</span>
                <span className="text-white">Cici,Connie Wang,卢欣,忘川,范杭,陈建群Gino,马阳 (罗喉)</span>
                <span className="text-slate-300">
                  (月活跃率: <span className="text-[#22c55e] font-bold">86%</span>, 人均活跃天数: 1)
                </span>
              </div>
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={() => setShowActiveUserToast(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors shrink-0 -mt-1 -mr-1"
              title="关闭提示"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 页面右侧悬浮【反馈】按钮 */}
      <div className="fixed right-0 top-[46%] -translate-y-1/2 z-[9990]">
        <button
          type="button"
          onClick={() => setIsFeedbackDrawerOpen(true)}
          className="bg-white hover:bg-blue-50/90 active:scale-95 text-blue-600 py-3.5 px-2 rounded-l-xl shadow-lg border-l border-t border-b border-blue-200/90 flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200 hover:-translate-x-1 group select-none"
          title="点击打开需求反馈面板"
        >
          <MessageSquare className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="text-[12px] font-bold [writing-mode:vertical-lr] tracking-widest leading-none text-blue-600">
            反馈
          </span>
        </button>
      </div>

      {/* 需求反馈右侧抽屉弹框 (完全对齐设计图样式) */}
      <FeedbackDrawer
        isOpen={isFeedbackDrawerOpen}
        onClose={() => setIsFeedbackDrawerOpen(false)}
        defaultModule="建案申请"
      />

    </div>
  );
};
