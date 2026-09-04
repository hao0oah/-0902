import { Pagination } from "./Pagination";
import React, { useState, useMemo } from 'react';
import { 
  Radar, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Layers, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  Search, 
  Scan, 
  X, 
  EyeOff, 
  Eye,
  CheckCircle, 
  AlertCircle, 
  Download, 
  Plus, 
  RotateCcw,
  RefreshCw,
  Info,
  UploadCloud,
  FileText,
  CheckSquare,
  Square,
  Flame,
  MoreHorizontal,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { MonitoringAlert, EnforcementCase } from '../types';
import { NICE_CLASSES_45 } from './ApplicationCenter';
import { ScanRadarModal } from './ScanRadarModal';
import { AddMonitoringModal } from './AddMonitoringModal';
import { MonitoringDataSpecModal } from './MonitoringDataSpecModal';
import { GazetteImportModal } from './GazetteImportModal';
import { InitiateEnforcementModal } from './InitiateEnforcementModal';

interface MonitoringRadarProps {
  alerts: MonitoringAlert[];
  onInitiateOpposition: (alert: MonitoringAlert, customData?: Partial<EnforcementCase>) => void;
  onOpenAiAssistant?: () => void;
}

type MonitoringTabKey = 'ALL' | 'HIGH_RISK' | 'PENDING_ANALYSIS' | 'CONVERTED_CASE' | 'IGNORED';

export const MonitoringRadar: React.FC<MonitoringRadarProps> = ({
  alerts: initialAlerts,
  onInitiateOpposition,
}) => {
  const [alertsList, setAlertsList] = useState<MonitoringAlert[]>(initialAlerts);
  const [activeTab, setActiveTab] = useState<MonitoringTabKey>('ALL');

  // 视图模式：COMPOUND (一屏合并视图) / STANDARD (平铺单列视图)
  const [viewMode, setViewMode] = useState<'COMPOUND' | 'STANDARD'>('COMPOUND');

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Search Form State (9大搜索字段)
  const [searchName, setSearchName] = useState('');
  const [searchRegNo, setSearchRegNo] = useState('');
  const [searchClass, setSearchClass] = useState('ALL');
  const [searchApplicant, setSearchApplicant] = useState('');
  const [searchGazetteDateStart, setSearchGazetteDateStart] = useState('');
  const [searchGazetteDateEnd, setSearchGazetteDateEnd] = useState('');
  const [searchPriorMark, setSearchPriorMark] = useState('');
  const [searchRiskLevel, setSearchRiskLevel] = useState('ALL');
  const [searchDeadlineStart, setSearchDeadlineStart] = useState('');
  const [searchDeadlineEnd, setSearchDeadlineEnd] = useState('');
  const [searchDaysRemaining, setSearchDaysRemaining] = useState('ALL');
  
  // Applied search state
  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    regNo: '',
    suspectClass: 'ALL',
    applicant: '',
    gazetteDateStart: '',
    gazetteDateEnd: '',
    priorMark: '',
    riskLevel: 'ALL',
    deadlineStart: '',
    deadlineEnd: '',
    daysRemaining: 'ALL',
  });

  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailAlert, setDetailAlert] = useState<MonitoringAlert | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'info' | 'approval' | 'history'>('info');

  const [editingAlert, setEditingAlert] = useState<MonitoringAlert | null>(null);
  const [confirmIgnoreTarget, setConfirmIgnoreTarget] = useState<MonitoringAlert | null>(null);
  const [initiatingAlert, setInitiatingAlert] = useState<MonitoringAlert | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; regNo?: string } | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDataSpecModalOpen, setIsDataSpecModalOpen] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Handler for confirming opposition initiation from modal
  const handleConfirmInitiateEnforcement = (alert: MonitoringAlert, customData: Partial<EnforcementCase>) => {
    onInitiateOpposition(alert, customData);
    setAlertsList(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'OPPOSITION_PROPOSED' } : a));
    setInitiatingAlert(null);
    if (detailAlert?.id === alert.id) {
      setDetailAlert(null);
    }
  };

  // Handler for importing new alerts from Excel/CSV/Agencies
  const handleImportAlerts = (newAlerts: MonitoringAlert[]) => {
    if (newAlerts.length === 0) return;
    setAlertsList(prev => [...newAlerts, ...prev]);
    setExportToast(`已成功导入 ${newAlerts.length} 条官方公报/监测记录并加入实时监控池！`);
    setTimeout(() => setExportToast(null), 4000);
  };

  // Execute Search
  const handleApplySearch = () => {
    setAppliedFilters({
      name: searchName.trim(),
      regNo: searchRegNo.trim(),
      suspectClass: searchClass,
      applicant: searchApplicant.trim(),
      gazetteDateStart: searchGazetteDateStart,
      gazetteDateEnd: searchGazetteDateEnd,
      priorMark: searchPriorMark.trim(),
      riskLevel: searchRiskLevel,
      deadlineStart: searchDeadlineStart,
      deadlineEnd: searchDeadlineEnd,
      daysRemaining: searchDaysRemaining,
    });
    setCurrentPage(1);
  };

  // Reset Search
  const handleResetSearch = () => {
    setSearchName('');
    setSearchRegNo('');
    setSearchClass('ALL');
    setSearchApplicant('');
    setSearchGazetteDateStart('');
    setSearchGazetteDateEnd('');
    setSearchPriorMark('');
    setSearchRiskLevel('ALL');
    setSearchDeadlineStart('');
    setSearchDeadlineEnd('');
    setSearchDaysRemaining('ALL');
    setAppliedFilters({
      name: '',
      regNo: '',
      suspectClass: 'ALL',
      applicant: '',
      gazetteDateStart: '',
      gazetteDateEnd: '',
      priorMark: '',
      riskLevel: 'ALL',
      deadlineStart: '',
      deadlineEnd: '',
      daysRemaining: 'ALL',
    });
    setCurrentPage(1);
  };

  // Tab definitions
  const tabs = [
    { key: 'ALL' as MonitoringTabKey, label: '全部' },
    { key: 'HIGH_RISK' as MonitoringTabKey, label: '高风险' },
    { key: 'PENDING_ANALYSIS' as MonitoringTabKey, label: '待分析' },
    { key: 'CONVERTED_CASE' as MonitoringTabKey, label: '已转案件' },
    { key: 'IGNORED' as MonitoringTabKey, label: '已忽略' },
  ];

  // Helper filter logic
  const filteredAlerts = useMemo(() => {
    return alertsList.filter(item => {
      // 1. Tab filter
      if (activeTab === 'HIGH_RISK') {
        const isHigh = item.riskLevel === 'CRITICAL' || item.riskLevel === 'HIGH' || item.similarityScore >= 85;
        if (!isHigh) return false;
      } else if (activeTab === 'PENDING_ANALYSIS') {
        if (item.status !== 'NEW') return false;
      } else if (activeTab === 'CONVERTED_CASE') {
        if (item.status !== 'OPPOSITION_PROPOSED' && item.status !== 'OPPOSED') return false;
      } else if (activeTab === 'IGNORED') {
        if (item.status !== 'IGNORED') return false;
      }

      // 2. Applied Search Filters
      // 商标名称：输入框，支持模糊搜索
      if (appliedFilters.name && !(item.suspectName || '').toLowerCase().includes(appliedFilters.name.toLowerCase())) {
        return false;
      }
      // 申请号/注册号：输入框，支持批量搜索
      if (appliedFilters.regNo) {
        const codes = appliedFilters.regNo.split(/[,;\s\n，；]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
        if (codes.length > 0) {
          const itemNo = (item.suspectRegNo || '').toLowerCase();
          const matches = codes.some(code => itemNo.includes(code));
          if (!matches) return false;
        }
      }
      // 尼斯分类：下拉选择，尼斯分类类别
      if (appliedFilters.suspectClass !== 'ALL') {
        const targetClassNum = parseInt(appliedFilters.suspectClass.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(targetClassNum) && item.suspectClass !== targetClassNum) {
          return false;
        }
      }
      // 申请人名称：输入框，支持模糊搜索
      if (appliedFilters.applicant && !(item.suspectApplicant || '').toLowerCase().includes(appliedFilters.applicant.toLowerCase())) {
        return false;
      }
      // 注册/初审公告日：时间选择器，支持选择开始日期和结束日期
      const pubDate = item.gazetteDate || item.registrationDate || item.applyDate || '';
      if (appliedFilters.gazetteDateStart) {
        if (!pubDate || pubDate < appliedFilters.gazetteDateStart) return false;
      }
      if (appliedFilters.gazetteDateEnd) {
        if (!pubDate || pubDate > appliedFilters.gazetteDateEnd) return false;
      }
      // 在先权利/引证标的：输入框，支持模糊搜索
      if (appliedFilters.priorMark) {
        const q = appliedFilters.priorMark.toLowerCase();
        const matches = (item.matchedOurTrademark || '').toLowerCase().includes(q) || (item.priorRights || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      // 风险等级：下拉框，单选
      if (appliedFilters.riskLevel !== 'ALL' && item.riskLevel !== appliedFilters.riskLevel) {
        return false;
      }
      // 绝限期：时间选择器，支持选择开始日期和结束日期
      const deadline = item.oppositionDeadline || '';
      if (appliedFilters.deadlineStart) {
        if (!deadline || deadline < appliedFilters.deadlineStart) return false;
      }
      if (appliedFilters.deadlineEnd) {
        if (!deadline || deadline > appliedFilters.deadlineEnd) return false;
      }
      // 剩余天数：下拉选择
      if (appliedFilters.daysRemaining !== 'ALL') {
        if (appliedFilters.daysRemaining === '7' && (item.daysRemaining > 7 || item.daysRemaining <= 0)) return false;
        if (appliedFilters.daysRemaining === '15' && (item.daysRemaining > 15 || item.daysRemaining <= 0)) return false;
        if (appliedFilters.daysRemaining === '30' && (item.daysRemaining > 30 || item.daysRemaining <= 0)) return false;
        if (appliedFilters.daysRemaining === '60' && (item.daysRemaining > 60 || item.daysRemaining <= 0)) return false;
        if (appliedFilters.daysRemaining === '90' && (item.daysRemaining > 90 || item.daysRemaining <= 0)) return false;
        if (appliedFilters.daysRemaining === 'EXPIRED' && item.daysRemaining > 0) return false;
      }

      return true;
    });
  }, [alertsList, activeTab, appliedFilters]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      ALL: alertsList.length,
      HIGH_RISK: alertsList.filter(a => a.riskLevel === 'CRITICAL' || a.riskLevel === 'HIGH' || a.similarityScore >= 85).length,
      PENDING_ANALYSIS: alertsList.filter(a => a.status === 'NEW').length,
      CONVERTED_CASE: alertsList.filter(a => a.status === 'OPPOSITION_PROPOSED' || a.status === 'OPPOSED').length,
      IGNORED: alertsList.filter(a => a.status === 'IGNORED').length,
    };
  }, [alertsList]);

  // 分页计算
  const totalPages = Math.ceil(filteredAlerts.length / pageSize) || 1;
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAlerts.slice(start, start + pageSize);
  }, [filteredAlerts, currentPage]);

  const renderMonitoringStatusBadge = (status: string) => {
    switch (status) {
      case 'OPPOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            已异议递交
          </span>
        );
      case 'OPPOSITION_PROPOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            已转异议立案
          </span>
        );
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            待处理预警
          </span>
        );
      case 'IGNORED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            已归档/忽略
          </span>
        );
    }
  };

  const renderRiskBadge = (level: string, similarityScore: number) => {
    if (level === 'CRITICAL' || similarityScore >= 90) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
          <Flame className="w-2.5 h-2.5 text-rose-600" />
          极高风险
        </span>
      );
    }
    if (level === 'HIGH' || similarityScore >= 80) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
          高风险
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
        中度风险
      </span>
    );
  };

  // Toggle selection for all filtered alerts
  const isAllSelected = useMemo(() => {
    if (filteredAlerts.length === 0) return false;
    return filteredAlerts.every(item => selectedIds.includes(item.id));
  }, [filteredAlerts, selectedIds]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAlerts.map(item => item.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Status Actions
  const handleToggleIgnoreStatus = (item: MonitoringAlert) => {
    const newStatus = item.status === 'IGNORED' ? 'NEW' : 'IGNORED';
    setAlertsList(prev => prev.map(a => a.id === item.id ? { ...a, status: newStatus } : a));
    setExportToast(`已将【${item.suspectName}】状态调整为：${newStatus === 'IGNORED' ? '已忽略归档' : '待处理预警'}`);
    setTimeout(() => setExportToast(null), 3000);
  };

  // Batch Opposition
  const handleBatchInitiateOpposition = () => {
    if (selectedIds.length === 0) return;
    const targets = alertsList.filter(a => selectedIds.includes(a.id));
    targets.forEach(item => {
      onInitiateOpposition(item);
    });
    setAlertsList(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, status: 'OPPOSITION_PROPOSED' } : a));
    setSelectedIds([]);
    setExportToast(`已批量对 ${targets.length} 件近似标的发起商标异议立案！`);
    setTimeout(() => setExportToast(null), 3500);
  };

  // Batch Ignore
  const handleBatchIgnore = () => {
    if (selectedIds.length === 0) return;
    setAlertsList(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, status: 'IGNORED' } : a));
    setSelectedIds([]);
    setExportToast(`已批量忽略归档 ${selectedIds.length} 项监测记录`);
    setTimeout(() => setExportToast(null), 3000);
  };

  // Add new monitoring item
  const handleAddNewMonitoring = (newAlert: MonitoringAlert) => {
    setAlertsList(prev => [newAlert, ...prev]);
    // 自动切回“全部监测预警台账”并切至第 1 页，重置搜索条件，保证新录入记录最顶部高亮展示
    setActiveTab('ALL');
    setCurrentPage(1);
    setSearchName('');
    setSearchRegNo('');
    setSearchClass('ALL');
    setSearchApplicant('');
    setSearchGazetteDateStart('');
    setSearchGazetteDateEnd('');
    setSearchPriorMark('');
    setSearchRiskLevel('ALL');
    setSearchDeadlineStart('');
    setSearchDeadlineEnd('');
    setSearchDaysRemaining('ALL');
    setAppliedFilters({
      name: '',
      regNo: '',
      suspectClass: 'ALL',
      applicant: '',
      gazetteDateStart: '',
      gazetteDateEnd: '',
      priorMark: '',
      riskLevel: 'ALL',
      deadlineStart: '',
      deadlineEnd: '',
      daysRemaining: 'ALL',
    });
    setIsAddModalOpen(false);
    setEditingAlert(null);
    setExportToast(`已成功录入并生成 1 条商标监测单据：${newAlert.suspectName} (${newAlert.id})`);
    setTimeout(() => setExportToast(null), 3500);
  };

  // Edit existing monitoring item
  const handleEditMonitoring = (updatedAlert: MonitoringAlert) => {
    setAlertsList(prev => prev.map(a => a.id === updatedAlert.id ? updatedAlert : a));
    setIsAddModalOpen(false);
    setEditingAlert(null);
    setExportToast(`已成功修改商标监测单据：${updatedAlert.suspectName} (${updatedAlert.id})`);
    setTimeout(() => setExportToast(null), 3500);
  };

  // 勾选导出数据模式
  const [isExportMode, setIsExportMode] = useState(false);

  // Export handling
  const handleExport = () => {
    if (!isExportMode) {
      setIsExportMode(true);
      return;
    }

    if (selectedIds.length === 0) {
      setExportToast('请勾选要导出的数据');
      setTimeout(() => setExportToast(null), 3000);
      return;
    }

    const exportData = alertsList.filter(a => selectedIds.includes(a.id));

    const headers = ['近似标的名称', '申请号', '尼斯分类', '申请人', '初审公告期号', '公告日', '异议截止日', '剩余天数', '引证我司商标', '相似度', '风险等级', '处置状态'];
    const rows = exportData.map(a => [
      `"${a.suspectName}"`,
      `"${a.suspectRegNo}"`,
      `"第 ${a.suspectClass} 类"`,
      `"${a.suspectApplicant}"`,
      `"${a.gazetteNumber}"`,
      `"${a.gazetteDate}"`,
      `"${a.oppositionDeadline}"`,
      `"${a.daysRemaining} 天"`,
      `"${a.matchedOurTrademark}"`,
      `"${a.similarityScore}%"`,
      `"${a.riskLevel}"`,
      `"${a.status}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `商标监测预警清单_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportToast(`已成功导出 ${exportData.length} 条商标监测预警清单 (CSV/Excel格式)`);
    setTimeout(() => setExportToast(null), 3500);
    setIsExportMode(false);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification */}
      {exportToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] flex items-center gap-3 px-6 py-4 bg-slate-900/95 text-white text-sm font-semibold rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{exportToast}</span>
        </div>
      )}

      {/* 1. TOP COMPACT BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white px-5 py-3.5 border border-blue-100/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#235fff] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#235fff]/20">
              <Radar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm md:text-base font-black tracking-tight text-slate-900 font-display">
                  商标监测与公告研判中心
                </h2>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5 hidden sm:block">
                全面监控国家知识产权局及全球各法域官方初审公告，精准防范近似抢注与品牌侵权风险。
              </p>
            </div>
          </div>

          {/* Header Action Buttons Removed */}
        </div>
      </div>

      {/* 2. UNIFIED MONITORING WORKSPACE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Search & Filter Area */}
        <div className="p-4 md:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            
            {/* 1. 商标名称 (输入框，支持模糊搜索) */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">商标名称</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplySearch()}
                  placeholder="输入商标名称，支持模糊搜索"
                  className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* 2. 申请号/注册号 (输入框，支持批量搜索) */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">申请号/注册号</label>
              <input
                type="text"
                value={searchRegNo}
                onChange={(e) => setSearchRegNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplySearch()}
                placeholder="支持批量搜索(空格/逗号/换行分隔)"
                className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* 3. 尼斯分类 (下拉选择，尼斯分类 01-45) */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">尼斯分类</label>
              <div className="relative">
                <select
                  value={searchClass}
                  onChange={(e) => setSearchClass(e.target.value)}
                  className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
                >
                  <option value="ALL">全部尼斯类别 (01-45类)</option>
                  {NICE_CLASSES_45.map(cls => (
                    <option key={cls.code} value={cls.code}>
                      第{cls.code}类 - {cls.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 4. 申请人名称 (输入框，支持模糊搜索) - 第1行第4列 */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">申请人名称</label>
              <input
                type="text"
                value={searchApplicant}
                onChange={(e) => setSearchApplicant(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplySearch()}
                placeholder="输入申请人名称，支持模糊搜索"
                className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* 5. 注册/初审公告日 (时间选择器，支持选择开始日期和结束日期) - 第2行第1列 */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">注册/初审公告日</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={searchGazetteDateStart}
                  onChange={(e) => setSearchGazetteDateStart(e.target.value)}
                  className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  title="开始日期"
                />
                <span className="text-slate-400 text-xs shrink-0">至</span>
                <input
                  type="date"
                  value={searchGazetteDateEnd}
                  onChange={(e) => setSearchGazetteDateEnd(e.target.value)}
                  className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  title="结束日期"
                />
              </div>
            </div>

            {/* 6. 在先权利/引证标的 (输入框，支持模糊搜索) - 第2行第2列 */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">在先权利/引证标的</label>
              <input
                type="text"
                value={searchPriorMark}
                onChange={(e) => setSearchPriorMark(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplySearch()}
                placeholder="输入在先权利/引证标的，支持模糊搜索"
                className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* 7. 风险等级 (下拉框，单选) - 第2行第3列 */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">风险等级</label>
              <div className="relative">
                <select
                  value={searchRiskLevel}
                  onChange={(e) => setSearchRiskLevel(e.target.value)}
                  className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
                >
                  <option value="ALL">全部风险等级</option>
                  <option value="CRITICAL">极高风险 (CRITICAL)</option>
                  <option value="HIGH">高风险 (HIGH)</option>
                  <option value="MEDIUM">中度风险 (MEDIUM)</option>
                  <option value="LOW">低风险 (LOW)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 默认未展开状态下的第2行第4列：操作按钮组 (固定在最后一行的最右侧) */}
            {!isAdvancedSearchOpen && (
              <div className="flex items-end justify-end gap-2 pb-0.5">
                <button
                  type="button"
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1.5 rounded-md hover:bg-blue-50/60 transition-colors cursor-pointer"
                >
                  <span>展开</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="px-3.5 py-1.5 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50/80 border border-slate-300 rounded-md transition-all cursor-pointer shadow-2xs active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>重置</span>
                </button>
                <button
                  type="button"
                  onClick={handleApplySearch}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all flex items-center gap-1.5 shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.98] whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>查询</span>
                </button>
              </div>
            )}

            {/* 展开状态下的第2行第4列、第3行字段与操作按钮组 */}
            {isAdvancedSearchOpen && (
              <>
                {/* 8. 绝限期 (时间选择器，支持选择开始日期和结束日期) - 第2行第4列 */}
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="block text-xs font-medium text-slate-600">绝限期</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={searchDeadlineStart}
                      onChange={(e) => setSearchDeadlineStart(e.target.value)}
                      className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      title="开始日期"
                    />
                    <span className="text-slate-400 text-xs shrink-0">至</span>
                    <input
                      type="date"
                      value={searchDeadlineEnd}
                      onChange={(e) => setSearchDeadlineEnd(e.target.value)}
                      className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      title="结束日期"
                    />
                  </div>
                </div>

                {/* 9. 剩余天数 (下拉选择) - 第3行第1列 */}
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="block text-xs font-medium text-slate-600">剩余天数</label>
                  <div className="relative">
                    <select
                      value={searchDaysRemaining}
                      onChange={(e) => setSearchDaysRemaining(e.target.value)}
                      className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
                    >
                      <option value="ALL">全部剩余天数</option>
                      <option value="7">7天以内 (紧急关注)</option>
                      <option value="15">15天以内 (加急处置)</option>
                      <option value="30">30天以内 (异议黄金期)</option>
                      <option value="60">60天以内</option>
                      <option value="90">90天以内 (全监控周期)</option>
                      <option value="EXPIRED">已逾期/已过异议期</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 展开状态下的操作按钮组 (固定在第3行最后一列最右侧) */}
                <div className="lg:col-span-3 flex items-end justify-end gap-2 pb-0.5 animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={() => setIsAdvancedSearchOpen(false)}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1.5 rounded-md hover:bg-blue-50/60 transition-colors cursor-pointer"
                  >
                    <span>收起</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="px-3.5 py-1.5 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50/80 border border-slate-300 rounded-md transition-all cursor-pointer shadow-2xs active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>重置</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleApplySearch}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all flex items-center gap-1.5 shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.98] whitespace-nowrap"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>查询</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-slate-200"></div>

        {/* 列表头部工具栏：左侧状态选项卡 + 右侧操作功能按键 */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white">
          
          {/* 左侧状态/类型过滤选项卡栏 */}
          <div className="flex items-center gap-5 sm:gap-6 overflow-x-auto no-scrollbar pt-1">
            {tabs.map(tab => {
              const isActive = activeTab === tab.key;
              const count = tabCounts[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(1);
                    setSelectedIds([]);
                  }}
                  className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                    isActive
                      ? 'text-blue-600 font-semibold'
                      : 'text-slate-700 hover:text-blue-600 font-normal'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-xs ${isActive ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                    {count}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* 右侧操作功能按键组 */}
          <div className="flex items-center gap-2 self-end xl:self-auto shrink-0">
            
            {/* 视图模式切换按键 */}
            <div className="hidden sm:inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('COMPOUND')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  viewMode === 'COMPOUND'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="合并同类字段，一屏看完无需左右滚动"
              >
                一屏合并视图
              </button>
              <button
                type="button"
                onClick={() => setViewMode('STANDARD')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  viewMode === 'STANDARD'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="展开所有字段为独立列"
              >
                平铺单列视图
              </button>
            </div>

            {/* 导出 */}
            {isExportMode ? (
              <>
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>确认导出{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportMode(false);
                    setSelectedIds([]);
                  }}
                  className="px-3.5 py-1.5 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-all cursor-pointer shadow-2xs"
                >
                  <span>取消导出</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleExport}
                className="px-3.5 py-1.5 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50/80 border border-slate-300 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>导出</span>
              </button>
            )}

            {/* 导入 */}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50/80 border border-slate-300 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
              title="支持 Excel/CSV 批量导入监测数据"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
              <span>导入</span>
            </button>

            {/* 新增监测 */}
            <button
              type="button"
              onClick={() => {
                setEditingAlert(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all flex items-center gap-1.5 shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.98] whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>新增监测</span>
            </button>

          </div>

        </div>

        {/* 批量操作栏 */}
        {selectedIds.length > 0 && (
          <div className="px-5 py-2.5 bg-blue-50/90 border-b border-blue-200 flex items-center justify-between text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-blue-900 font-medium">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span>已选中 <strong className="font-bold text-blue-700">{selectedIds.length}</strong> 项监测记录</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchInitiateOpposition}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-all shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>批量异议立案</span>
              </button>
              <button
                onClick={handleBatchIgnore}
                className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded font-medium transition-all shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span>批量归档/忽略</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                取消选择
              </button>
            </div>
          </div>
        )}

        {/* 列表/表格展示区 */}
        <div className="overflow-x-auto">
          {viewMode === 'COMPOUND' ? (
            /* 1. 一屏智能合并视图 */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[12px] font-semibold text-slate-600">
                  {(isExportMode || selectedIds.length > 0) && (
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="py-3 px-3 w-16 text-center whitespace-nowrap">商标图样</th>
                  <th className="py-3 px-4 min-w-[180px]">商标名称 / 申请号</th>
                  <th className="py-3 px-4 min-w-[160px]">尼斯分类 / 在先权利引证</th>
                  <th className="py-3 px-4 min-w-[180px]">申请人名称 / 注册初审公告日</th>
                  <th className="py-3 px-4 min-w-[150px]">风险等级 / 处理建议</th>
                  <th className="py-3 px-4 min-w-[150px]">绝限期 / 剩余天数</th>
                  <th className="py-3 px-4 min-w-[130px]">处置状态</th>
                  <th className="py-3 px-4 w-[120px] min-w-[120px] text-center sticky right-0 z-20 bg-slate-50 border-l border-slate-200/80 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)] whitespace-nowrap">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedAlerts.length > 0 ? (
                  paginatedAlerts.map((item) => {
                    const activeLogo = item.logoUrl || (item.logoUrls && item.logoUrls.length > 0 ? item.logoUrls[0] : '');
                    return (
                      <tr 
                        key={item.id}
                        className="hover:bg-blue-50/20 transition-colors group"
                      >
                        {(isExportMode || selectedIds.length > 0) && (
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => handleToggleSelectOne(item.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-center">
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeLogo) {
                                setPreviewImage({
                                  url: activeLogo,
                                  title: item.suspectName,
                                  regNo: item.suspectRegNo
                                });
                                setPreviewZoom(100);
                              } else {
                                setDetailAlert(item);
                              }
                            }}
                            className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:border-blue-400 transition-all cursor-pointer mx-auto relative group/img hover:scale-105"
                            title="点击在线预览商标图样"
                          >
                            {activeLogo ? (
                              <>
                                <img
                                  src={activeLogo}
                                  alt={item.suspectName}
                                  className="w-full h-full object-contain rounded"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                    const parent = (e.target as HTMLElement).parentElement;
                                    if (parent) {
                                      const fallback = parent.querySelector('.img-fallback') as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded">
                                  <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow-xs" />
                                </div>
                              </>
                            ) : null}
                            <div 
                              className="img-fallback flex flex-col items-center justify-center text-center w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 rounded"
                              style={{ display: activeLogo ? 'none' : 'flex' }}
                            >
                              <span className="text-[10px] font-bold font-mono text-slate-600 tracking-tighter truncate max-w-[34px]">
                                {item.suspectName.slice(0, 3)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => setDetailAlert(item)}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-bold text-xs font-display cursor-pointer text-left block truncate max-w-xs"
                            >
                              {item.suspectName}
                            </button>
                            <div className="text-[11px] font-mono text-slate-500">
                              #{item.suspectRegNo}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="text-slate-900 text-xs font-medium truncate">
                              第 {item.suspectClass} 类
                            </div>
                            <div className="text-slate-700 font-medium text-[11px] truncate max-w-[150px]">
                              引证: {item.priorRights || item.matchedOurTrademark || '--'}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="text-slate-900 font-medium text-[11px] truncate max-w-[170px]" title={item.suspectApplicant}>
                              {item.suspectApplicant || '--'}
                            </div>
                            <div className="text-slate-500 text-[11px] font-mono">
                              公告日: {item.registrationDate || item.gazetteDate || '--'}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {renderRiskBadge(item.riskLevel, item.similarityScore)}
                            </div>
                            <div className="text-indigo-900 font-medium text-[11px] truncate max-w-[150px]" title={item.proposalAdvice}>
                              建议: {item.proposalAdvice || '--'}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="text-slate-700 font-mono text-[11px]">
                              {item.oppositionDeadline || '--'}
                            </div>
                            <div>
                              <span className="inline-block px-1.5 py-0.2 rounded font-mono font-medium text-[10px] bg-slate-100 text-slate-700 border border-slate-200/80">
                                剩 {item.daysRemaining} 天
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {renderMonitoringStatusBadge(item.status)}
                        </td>

                        <td className="py-3 px-4 text-center sticky right-0 z-10 bg-white group-hover:bg-[#f3f7fd] border-l border-slate-100 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)] whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDetailAlert(item)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md font-medium cursor-pointer transition-colors"
                            >
                              查看
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAlert(item);
                                setIsAddModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md font-medium cursor-pointer transition-colors"
                            >
                              编辑
                            </button>
                            {item.status !== 'OPPOSITION_PROPOSED' && item.status !== 'OPPOSED' && item.status !== 'IGNORED' && (
                              <button
                                type="button"
                                onClick={() => setInitiatingAlert(item)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md font-medium cursor-pointer transition-colors"
                              >
                                异议立案
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setConfirmIgnoreTarget(item)}
                              className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2 py-1 rounded-md font-medium cursor-pointer transition-colors"
                            >
                              {item.status === 'IGNORED' ? '恢复' : '忽略'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <span className="text-xs">暂无匹配的商标监测预警记录</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            /* 2. 平铺单列视图 */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[12px] font-semibold text-slate-600 whitespace-nowrap">
                  {(isExportMode || selectedIds.length > 0) && (
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                  )}
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
                  <th className="py-3 px-4 text-center sticky right-0 z-20 bg-slate-50 border-l border-slate-200/80 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)]">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 whitespace-nowrap">
                {paginatedAlerts.length > 0 ? (
                  paginatedAlerts.map((item) => {
                    const activeLogo = item.logoUrl || (item.logoUrls && item.logoUrls.length > 0 ? item.logoUrls[0] : '');
                    return (
                      <tr 
                        key={item.id}
                        className="hover:bg-blue-50/20 transition-colors group"
                      >
                        {(isExportMode || selectedIds.length > 0) && (
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => handleToggleSelectOne(item.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-center">
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeLogo) {
                                setPreviewImage({
                                  url: activeLogo,
                                  title: item.suspectName,
                                  regNo: item.suspectRegNo
                                });
                                setPreviewZoom(100);
                              } else {
                                setDetailAlert(item);
                              }
                            }}
                            className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:border-blue-400 transition-all cursor-pointer mx-auto relative group/img hover:scale-105"
                            title="点击在线预览商标图样"
                          >
                            {activeLogo ? (
                              <>
                                <img
                                  src={activeLogo}
                                  alt={item.suspectName}
                                  className="w-full h-full object-contain rounded"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                    const parent = (e.target as HTMLElement).parentElement;
                                    if (parent) {
                                      const fallback = parent.querySelector('.img-fallback') as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded">
                                  <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow-xs" />
                                </div>
                              </>
                            ) : null}
                            <div 
                              className="img-fallback flex flex-col items-center justify-center text-center w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 rounded"
                              style={{ display: activeLogo ? 'none' : 'flex' }}
                            >
                              <span className="text-[10px] font-bold font-mono text-slate-600 tracking-tighter truncate max-w-[34px]">
                                {item.suspectName.slice(0, 3)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-bold text-[#235fff]">
                          <button onClick={() => setDetailAlert(item)} className="hover:underline cursor-pointer text-left">
                            {item.suspectName}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                          #{item.suspectRegNo}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-900 text-xs font-medium">
                          第 {item.suspectClass} 类
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium max-w-[180px] truncate" title={item.suspectApplicant}>
                          {item.suspectApplicant || '--'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {item.registrationDate || item.gazetteDate || '--'}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {item.priorRights || item.matchedOurTrademark || '--'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {renderRiskBadge(item.riskLevel, item.similarityScore)}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600">
                          {item.oppositionDeadline || '--'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-medium">
                          <span className="px-1.5 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200/80">
                            {item.daysRemaining} 天
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {renderMonitoringStatusBadge(item.status)}
                        </td>
                        <td className="py-3 px-4 text-center sticky right-0 z-10 bg-white group-hover:bg-[#f3f7fd] border-l border-slate-100 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)]">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDetailAlert(item)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md font-medium cursor-pointer transition-colors"
                            >
                              查看
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAlert(item);
                                setIsAddModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md font-medium cursor-pointer transition-colors"
                            >
                              编辑
                            </button>
                            {item.status !== 'OPPOSITION_PROPOSED' && item.status !== 'OPPOSED' && item.status !== 'IGNORED' && (
                              <button
                                type="button"
                                onClick={() => setInitiatingAlert(item)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md font-medium cursor-pointer transition-colors"
                              >
                                异议立案
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setConfirmIgnoreTarget(item)}
                              className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2 py-1 rounded-md font-medium cursor-pointer transition-colors"
                            >
                              {item.status === 'IGNORED' ? '恢复' : '忽略'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      暂无匹配的商标监测预警记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 列表底部：分页控制器 */}
        <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-3 text-xs text-slate-500">
          <Pagination
            currentPage={currentPage}
            totalCount={filteredAlerts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
        </div>


      {/* RECORD DETAIL MODAL (样式保持与建案需求详情页完全一致) */}
      {detailAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                  detailAlert.status === 'OPPOSED' ? 'bg-emerald-600 text-white' :
                  detailAlert.status === 'OPPOSITION_PROPOSED' ? 'bg-blue-600 text-white' :
                  detailAlert.status === 'NEW' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'
                }`}>
                  {detailAlert.status === 'OPPOSED' ? '已异议递交' :
                   detailAlert.status === 'OPPOSITION_PROPOSED' ? '已转异议立案' :
                   detailAlert.status === 'NEW' ? '待处理预警' : '已归档/忽略'}
                </span>
                <h3 className="text-base font-bold text-slate-900">商标监测详情</h3>
                <div className="flex items-center gap-1.5 text-sm sm:text-base font-mono font-bold text-slate-900">
                  <span>{detailAlert.id}</span>
                  <button
                    type="button"
                    title="复制监测单据编号"
                    onClick={() => {
                      navigator.clipboard.writeText(detailAlert.id);
                      setExportToast(`已复制监测单据编号: ${detailAlert.id}`);
                      setTimeout(() => setExportToast(null), 2500);
                    }}
                    className="text-blue-600 hover:text-blue-700 p-0.5 rounded cursor-pointer transition-colors flex items-center justify-center"
                  >
                    <Copy className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setDetailAlert(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="px-6 bg-slate-50/80 border-b border-slate-200/80 flex items-center gap-6 text-xs shrink-0">
              <button
                onClick={() => setDetailModalTab('info')}
                className={`py-3 font-medium cursor-pointer border-b-2 transition-all ${
                  detailModalTab === 'info'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                需求信息
              </button>
              <button
                onClick={() => setDetailModalTab('history')}
                className={`py-3 font-medium cursor-pointer border-b-2 transition-all ${
                  detailModalTab === 'history'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                操作记录
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
              {detailModalTab === 'info' && (
                <div className="space-y-6">
                  
                  {/* 1. 基础商标信息 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>基础商标信息</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div>
                        <span className="text-slate-500">监测风险级别：</span>
                        <span className="inline-flex items-center gap-1">
                          {renderRiskBadge(detailAlert.riskLevel, detailAlert.similarityScore)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">商标名称：</span>
                        <span className="text-slate-900 font-bold">{detailAlert.suspectName || '--'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">尼斯分类：</span>
                        <span className="font-mono text-slate-900 font-medium">{detailAlert.suspectClass ? `第 ${detailAlert.suspectClass} 类` : '--'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请号/注册号：</span>
                        <span className="font-mono text-slate-900 font-medium">{detailAlert.suspectRegNo || '--'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500">申请人名称：</span>
                        <span className="text-slate-900 font-medium">{detailAlert.suspectApplicant || '--'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请日：</span>
                        <span className="font-mono text-slate-900 font-medium">{detailAlert.applyDate || '--'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">注册/初审公告日：</span>
                        <span className="font-mono text-slate-900 font-medium">{detailAlert.registrationDate || detailAlert.gazetteDate || '--'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">绝限期：</span>
                        <span className="font-mono text-slate-900 font-medium">
                          {detailAlert.oppositionDeadline ? `${detailAlert.oppositionDeadline} (剩余 ${detailAlert.daysRemaining} 天)` : '--'}
                        </span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">在先权利/引证标的：</span>
                        <span className="text-slate-900 font-bold">{detailAlert.priorRights || detailAlert.matchedOurTrademark || '--'}</span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">类似群及商品/服务：</span>
                        <span className="text-slate-900 font-medium">{detailAlert.similarGroupAndGoods || '--'}</span>
                      </div>
                      {((detailAlert.logoUrls && detailAlert.logoUrls.length > 0) || detailAlert.logoUrl) && (
                        <div className="sm:col-span-3 pt-1">
                          <span className="text-slate-500 block mb-1.5">商标图样 (点击放大预览)：</span>
                          <div className="flex flex-wrap items-center gap-2">
                            {(detailAlert.logoUrls && detailAlert.logoUrls.length > 0
                              ? detailAlert.logoUrls
                              : [detailAlert.logoUrl!]
                            ).map((url, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => {
                                  setPreviewImage({
                                    url: url,
                                    title: `${detailAlert.suspectName} (图样 ${idx + 1})`,
                                    regNo: detailAlert.suspectRegNo
                                  });
                                  setPreviewZoom(100);
                                }}
                                className="w-16 h-16 bg-slate-50 rounded-lg border border-slate-200 p-1 flex items-center justify-center shrink-0 cursor-pointer hover:border-blue-500 transition-all relative group/detailimg hover:shadow-xs"
                                title="点击在线预览高清大图"
                              >
                                <img src={url} alt={`${detailAlert.suspectName} 图样 ${idx + 1}`} className="max-w-full max-h-full object-contain" />
                                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/detailimg:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                  <Maximize2 className="w-4 h-4 text-white drop-shadow-xs" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. 研判与建议决策 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>研判与建议决策</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div>
                        <span className="text-slate-500">处理建议及决策：</span>
                        <span className="text-indigo-900 font-bold">{detailAlert.proposalAdvice || '--'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">获支持概率：</span>
                        <span className="text-emerald-700 font-bold">{detailAlert.supportProbability || '--'}</span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">建议考虑因素：</span>
                        <span className="text-slate-800 font-medium">{detailAlert.considerationFactors || '--'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. 办理履历与节点 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>办理履历与节点</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div>
                        <span className="text-slate-500">递交日：</span>
                        <span className="font-mono text-slate-900 font-medium">{detailAlert.submissionDate || '--'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">完成/预计完成日：</span>
                        <span className="font-mono text-slate-900 font-medium">{detailAlert.completionDate || '--'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">处理决定：</span>
                        <span className="text-slate-900 font-semibold">{detailAlert.processingDecision || '--'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">当前监测处置状态：</span>
                        <span className="font-semibold text-slate-900">
                          {detailAlert.status === 'OPPOSITION_PROPOSED' ? '已发起异议立案提议' : detailAlert.status === 'OPPOSED' ? '已递交异议申请' : detailAlert.status === 'IGNORED' ? '已归档/忽略' : '待处理预警'}
                        </span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">备注说明：</span>
                        <span className="text-slate-800 font-medium">{detailAlert.remarks || '--'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {detailModalTab === 'approval' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                        <span>当前流转节点：{detailAlert.status === 'OPPOSED' ? '全流程异议递交完成' : detailAlert.status === 'OPPOSITION_PROPOSED' ? '异议立案证据审核中' : '监测评估预警中'}</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {detailAlert.status === 'OPPOSED' ? '已完成递交' : detailAlert.status === 'OPPOSITION_PROPOSED' ? '处理中' : '待审核预警'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-slate-400">当前处理人：</span>
                        <span className="font-medium text-slate-800 ml-1">知产法务中心 (林悦)</span>
                      </div>
                      <div>
                        <span className="text-slate-400">节点停留时长：</span>
                        <span className="font-mono font-medium text-slate-800 ml-1">2小时</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold text-slate-900 border-l-2 border-slate-800 pl-2">
                        按顺序流转的审批人履历 (3 个节点)
                      </h4>
                      <span className="text-[11px] text-slate-400">依时间先后顺序排列</span>
                    </div>

                    <div className="space-y-3 relative pl-4 border-l border-slate-200 ml-2">
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span>1. 监测标的系统捕获/手动录入</span>
                            <span className="text-[11px] font-mono text-slate-500">2026-08-25 09:12</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">提报人: 知产监测引擎 / 经办人 · 状态: 已完成</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span>2. 侵权风险与近似度研判</span>
                            <span className="text-[11px] font-mono text-slate-500">2026-08-25 09:15</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">处理人: 知产法务评估员 · 意见: {detailAlert.proposalAdvice || '建议发起商标异议立案并提交流转'}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span>3. 知产总监立案终审</span>
                            <span className="text-[11px] font-mono text-slate-500">{detailAlert.status === 'OPPOSITION_PROPOSED' ? '进行中' : '等待发起'}</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">处理人: 知产总监 · 拟核准维权立案方案</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailModalTab === 'history' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 border-l-2 border-slate-800 pl-2">单据变更与系统日志</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3.5">操作时间</th>
                          <th className="py-2.5 px-3.5">操作人</th>
                          <th className="py-2.5 px-3.5">动作</th>
                          <th className="py-2.5 px-3.5">详细备注</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-3.5 font-mono">2026-08-25 09:12:04</td>
                          <td className="py-2.5 px-3.5 font-medium">知产法务中心</td>
                          <td className="py-2.5 px-3.5 font-medium text-emerald-600">建案/录入监测</td>
                          <td className="py-2.5 px-3.5 text-slate-500">建立【{detailAlert.suspectName}】商标监测预警单据，关联类别第 {detailAlert.suspectClass} 类</td>
                        </tr>
                        {detailAlert.status === 'OPPOSITION_PROPOSED' && (
                          <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2.5 px-3.5 font-mono">2026-08-25 10:05:22</td>
                            <td className="py-2.5 px-3.5 font-medium">系统法务员</td>
                            <td className="py-2.5 px-3.5 font-medium text-blue-600">转异议流程</td>
                            <td className="py-2.5 px-3.5 text-slate-500">已联动至商标维权中心，生成异议立案预研单据</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            {detailAlert.status !== 'OPPOSITION_PROPOSED' && detailAlert.status !== 'OPPOSED' && detailAlert.status !== 'IGNORED' && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setInitiatingAlert(detailAlert)}
                  className="px-5 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>一键提起商标异议立案</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global AI Scan Real-Time Execution Modal */}
      <ScanRadarModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onInitiateOpposition={(alert) => setInitiatingAlert(alert)}
      />

      {/* Gazette / Agency Batch Import Modal */}
      <GazetteImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportAlerts={handleImportAlerts}
      />

      {/* Add New / Edit Monitoring Modal */}
      <AddMonitoringModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAlert(null);
        }}
        onAdd={handleAddNewMonitoring}
        onEdit={handleEditMonitoring}
        initialData={editingAlert}
      />

      {/* Monitoring Data Architecture Spec Modal */}
      <MonitoringDataSpecModal
        isOpen={isDataSpecModalOpen}
        onClose={() => setIsDataSpecModalOpen(false)}
      />

      {/* Online Image Preview Lightbox Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-w-3xl w-full flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                  图样
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                    <span>{previewImage.title}</span>
                    {previewImage.regNo && (
                      <span className="text-xs font-mono font-normal text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        申请号: {previewImage.regNo}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">商标图样高清在线预览</p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewZoom(prev => Math.max(50, prev - 25))}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/70 rounded-lg transition-colors cursor-pointer"
                  title="缩小"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-300 w-12 text-center select-none font-medium">
                  {previewZoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(prev => Math.min(300, prev + 25))}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/70 rounded-lg transition-colors cursor-pointer"
                  title="放大"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(100)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/70 rounded-lg transition-colors cursor-pointer text-xs px-2"
                  title="重置缩放"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <a
                  href={previewImage.url}
                  download={`${previewImage.title}-商标图样.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/70 rounded-lg transition-colors cursor-pointer ml-1"
                  title="在新窗口打开 / 下载原图"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer ml-2"
                  title="关闭"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Canvas Body */}
            <div className="p-8 bg-slate-950 flex-1 flex items-center justify-center overflow-auto min-h-[360px] relative select-none">
              <div 
                className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
                style={{ transform: `scale(${previewZoom / 100})` }}
              >
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  className="max-h-[75vh] max-w-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span>可以通过上方按钮自由放大、缩小或重置图片视角</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Double Confirmation Modal for Ignore / Restore */}
      {confirmIgnoreTarget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setConfirmIgnoreTarget(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/90 flex flex-col space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                confirmIgnoreTarget.status === 'IGNORED'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200/80'
                  : 'bg-amber-50 text-amber-600 border border-amber-200/80'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  {confirmIgnoreTarget.status === 'IGNORED' ? '确认恢复该商标监测预警？' : '确认忽略/归档该商标监测预警？'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {confirmIgnoreTarget.status === 'IGNORED' ? (
                    <>
                      确定将近似商标 <span className="font-bold text-slate-800">“{confirmIgnoreTarget.suspectName}”</span> (申请号: <span className="font-mono text-slate-700">{confirmIgnoreTarget.suspectRegNo}</span>) 从归档列表中恢复吗？恢复后该记录将重新恢复至待处理预警台账。
                    </>
                  ) : (
                    <>
                      确定将近似商标 <span className="font-bold text-slate-800">“{confirmIgnoreTarget.suspectName}”</span> (申请号: <span className="font-mono text-slate-700">{confirmIgnoreTarget.suspectRegNo}</span>) 标记为已忽略归档吗？归档后该记录将移至已归档列表。
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmIgnoreTarget(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  handleToggleIgnoreStatus(confirmIgnoreTarget);
                  setConfirmIgnoreTarget(null);
                }}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-95 ${
                  confirmIgnoreTarget.status === 'IGNORED'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {confirmIgnoreTarget.status === 'IGNORED' ? '确认恢复' : '确认忽略'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initiate Enforcement Modal */}
      <InitiateEnforcementModal
        isOpen={!!initiatingAlert}
        alert={initiatingAlert}
        onClose={() => setInitiatingAlert(null)}
        onSubmit={handleConfirmInitiateEnforcement}
      />
    </div>
  );
};