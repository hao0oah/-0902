import { Pagination } from "./Pagination";
import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Filter, 
  Scale, 
  Gavel, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Building2, 
  DollarSign, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  PackageX,
  X,
  RotateCcw,
  RefreshCw,
  Download,
  Copy,
  Layers,
  Globe2,
  Tag,
  User,
  CheckSquare,
  Flame,
  FileSpreadsheet,
  Info,
  HelpCircle,
  Database,
  ArrowRight,
  Workflow,
  UploadCloud,
  Check
} from 'lucide-react';
import { EnforcementCase, EnforcementCaseType, Jurisdiction } from '../types';
import { NICE_CLASSES_45 } from './ApplicationCenter';

// 检索区常量选项
const DEPARTMENT_OPTIONS = [
  '品牌知产中心',
  '国际法务部',
  '全球品牌部',
  '研发管理部',
  '电商运营中心',
  '市场营销部',
  '战略发展部',
  '总裁办/董事会办公室',
  '供应链管理部',
  '合规风控部'
];

const BUSINESS_TYPE_OPTIONS = [
  { value: 'ALL', label: '全部业务类型' },
  { value: '商标异议申请', label: '商标异议申请' },
  { value: '商标无效宣告', label: '商标无效宣告' },
  { value: '商标驳回复审', label: '商标驳回复审' },
  { value: '撤销连续三年不使用(撤三)', label: '撤销连续三年不使用(撤三)' },
  { value: '商标答辩', label: '商标答辩' },
  { value: '达标审查', label: '达标审查' },
  { value: '海关边境保护备案与查扣', label: '海关边境保护备案与查扣' }
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: '全部案件状态' },
  { value: 'PENDING_START', label: '待启动' },
  { value: 'EVIDENCE_PREP', label: '证据准备中' },
  { value: 'SUBMITTED', label: '已正式递交' },
  { value: 'UNDER_HEARING', label: '商标局审理中' },
  { value: 'WIN', label: '维权成功 / 裁定无效' },
  { value: 'LOST', label: '维权不成立 / 被驳回' },
  { value: 'SETTLED', label: '和解结案' }
];

interface EnforcementCenterProps {
  cases: EnforcementCase[];
  onCreateCase: (newCase: Partial<EnforcementCase>) => void;
  onUpdateCase?: (updatedCase: EnforcementCase) => void;
  onOpenAiAssistant: () => void;
}

export const EnforcementCenter: React.FC<EnforcementCenterProps> = ({
  cases,
  onCreateCase,
  onUpdateCase,
  onOpenAiAssistant,
}) => {
  // 历史胜诉率动态计算
  // 公式：【案件状态=维权成功(裁定胜诉/宣告无效)】单据数量 / 【案件状态=维权成功、维权不成立、和解结案】单据数量
  const { winCasesCount, closedCasesCount, winRatePercent } = useMemo(() => {
    const win = cases.filter(c => c.status === 'WIN').length;
    const closed = cases.filter(c => ['WIN', 'LOST', 'SETTLED'].includes(c.status)).length;
    const rate = closed > 0 ? ((win / closed) * 100).toFixed(1) : '100.0';
    return {
      winCasesCount: win,
      closedCasesCount: closed,
      winRatePercent: rate,
    };
  }, [cases]);

  // 1. 检索筛选表单状态 (11个业务指定字段)
  // ① 维权单据号：输入框，支持批量搜索
  const [filterCaseNo, setFilterCaseNo] = useState('');
  // ② 维权名称：输入框，支持模糊搜索
  const [filterName, setFilterName] = useState('');
  // ③ 商标名：输入框，支持模糊搜索
  const [filterTrademark, setFilterTrademark] = useState('');
  // ④ 申请人名称(权利人)：输入框，支持模糊搜索
  const [filterApplicant, setFilterApplicant] = useState('');
  // ⑤ 尼斯分类：下拉选择，下拉选项是【商标分类与类群组与商品/服务项目的关系表】中的尼斯分类类别
  const [filterClass, setFilterClass] = useState('ALL');
  // ⑥ 处理期限：时间选择器，支持选择开始日期和结束日期
  const [filterDeadlineStart, setFilterDeadlineStart] = useState('');
  const [filterDeadlineEnd, setFilterDeadlineEnd] = useState('');
  // ⑦ 代理机构：输入框，支持模糊搜索
  const [filterAgency, setFilterAgency] = useState('');
  // ⑧ 请求人：输入框，支持模糊搜索
  const [filterRequester, setFilterRequester] = useState('');
  // ⑨ 业务类型：下拉框，单选
  const [filterBusinessType, setFilterBusinessType] = useState('ALL');
  // ⑩ 提案部门：下拉框，支持多选和关键词搜索
  const [filterDepartments, setFilterDepartments] = useState<string[]>([]);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [departmentSearchKeyword, setDepartmentSearchKeyword] = useState('');
  // ⑪ 案件状态：下拉框，单选
  const [filterStatus, setFilterStatus] = useState('ALL');

  // 展开/收起状态
  const [isExpanded, setIsExpanded] = useState(true);

  // 提案部门下拉面板点击外部自动收起 ref
  const departmentDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target as Node)) {
        setIsDepartmentDropdownOpen(false);
      }
    };
    if (isDepartmentDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDepartmentDropdownOpen]);

  // 提案部门操作辅助函数
  const handleToggleFilterDepartment = (dept: string) => {
    setFilterDepartments(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const handleSelectAllFilteredDepartments = (filteredList: string[]) => {
    setFilterDepartments(prev => {
      const set = new Set([...prev, ...filteredList]);
      return Array.from(set);
    });
  };

  const handleClearFilterDepartments = () => {
    setFilterDepartments([]);
  };

  // 视图模式：COMPOUND (一屏合并视图) / STANDARD (平铺单列视图)
  const [viewMode, setViewMode] = useState<'COMPOUND' | 'STANDARD'>('COMPOUND');

  // 当前激活的状态/类型 Tab (全部 | 驳回复查 | 商标异议 | 无效宣告 | 撤三申请 | 达标审查 | 海关查扣)
  const [activeTab, setActiveTab] = useState<'ALL' | EnforcementCaseType>('ALL');

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 弹窗与交互状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<EnforcementCase | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'history'>('info');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 发起维权立案表单数据 (包含 4 大模块全字段)
  const [formData, setFormData] = useState({
    // 1. 基本信息模块
    name: '针对【u-smile 优笑】抢注商标第21类商标异议立案申请',
    businessType: '商标异议申请',
    proposalDepartment: '品牌知产中心',
    undertakingDepartment: '品牌知产中心',
    undertaker: '林悦',
    outsourcingType: '全部委外',
    agencyCaseNo: 'LS-2026-TM-88219',
    entrustmentDate: '2026-08-20',
    agencyRemarks: '请律所加急撰写异议理由书，强化驰名商标跨类保护与在先知名度公证书证据',
    fileOpeningDate: '2026-08-15',
    submissionMethod: '电子递交 (网上申请系统)',
    status: 'SUBMITTED',
    deadline: '2026-09-30',
    processingDeadline: '2026-09-30',
    submissionDate: '2026-08-25',
    rulingDate: '',
    proposalAdvice: '依据《商标法》第13条（驰名商标）及第30条（在先近似）提出异议申请并阻断注册',
    remarks: '对方商标目前处于初审公告期，距异议截止日仅剩35天，需紧急组织证据链递交',

    // 2. 商标信息模块
    trademarkName: 'u-smile 优笑',
    classes: ['第21类'] as string[],
    goodsAndServices: '2101-电动牙刷; 2108-牙刷; 2110-牙线; 2112-漱口水; 2114-冲牙器',
    targetRegNo: '76891042',
    targetApplicant: '深圳市优笑科技有限公司',
    applicationDate: '2024-03-15',
    applicantAddress: '广东省深圳市南山区粤海街道科技园中区10栋501',
    registrationDate: '',
    preliminaryNoticePeriod: '第1889期 (2025-05-06 至 2025-08-06)',
    country: '中国 (CN)',
    expiryDate: '',
    ourTrademark: 'usmile (第42881903号)',
    citedTrademarkClass: ['第21类', '第03类', '第05类'] as string[],
    trademarkImages: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=300&q=80'
    ] as string[],

    // 3. 请求人信息模块
    agencyName: '北京市柳沈律师事务所',
    agencyContact: '林悦 律师',
    agencyPhone: '010-66578899',
    requesterName: '广州星际悦动股份有限公司',
    requesterAddress: '广东省广州市天河区黄埔大道西100号富力盈普大厦38楼',
    requesterPostcode: '510623',
    requesterPhone: '020-85596688',
    requesterContact: '知产合规组',
    brand: 'usmile',

    // 4. 附件信息模块
    attachments: [
      { name: '官方初审公告页扫描件.pdf', size: '2.4 MB' },
      { name: 'usmile驰名商标在先使用证明集.zip', size: '15.8 MB' }
    ] as { name: string; size: string }[],
  });

  // 商标类别与引证商标类别的多选下拉状态
  const [isTrademarkClassDropdownOpen, setIsTrademarkClassDropdownOpen] = useState(false);
  const [trademarkClassSearchKeyword, setTrademarkClassSearchKeyword] = useState('');

  const [isCitedClassDropdownOpen, setIsCitedClassDropdownOpen] = useState(false);
  const [citedClassSearchKeyword, setCitedClassSearchKeyword] = useState('');

  const handleToggleTrademarkClass = (code: string) => {
    setFormData(prev => {
      const current = Array.isArray(prev.classes) ? prev.classes : [];
      const updated = current.includes(code)
        ? current.filter(c => c !== code)
        : [...current, code];
      return { ...prev, classes: updated };
    });
  };

  const handleSetQuickTrademarkClasses = (codes: string[]) => {
    setFormData(prev => ({ ...prev, classes: codes }));
  };

  const handleToggleCitedClass = (code: string) => {
    setFormData(prev => {
      const current = Array.isArray(prev.citedTrademarkClass) ? prev.citedTrademarkClass : [];
      const updated = current.includes(code)
        ? current.filter(c => c !== code)
        : [...current, code];
      return { ...prev, citedTrademarkClass: updated };
    });
  };

  const handleSetQuickCitedClasses = (codes: string[]) => {
    setFormData(prev => ({ ...prev, citedTrademarkClass: codes }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    showToast(`已复制：${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 勾选导出数据状态
  const [isExportMode, setIsExportMode] = useState(false);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);

  // 重置筛选
  const handleResetFilters = () => {
    setFilterCaseNo('');
    setFilterName('');
    setFilterTrademark('');
    setFilterApplicant('');
    setFilterClass('ALL');
    setFilterDeadlineStart('');
    setFilterDeadlineEnd('');
    setFilterAgency('');
    setFilterRequester('');
    setFilterBusinessType('ALL');
    setFilterDepartments([]);
    setFilterStatus('ALL');
    setActiveTab('ALL');
    setCurrentPage(1);
    showToast('筛选条件已重置');
  };

  // 统计当前激活的检索条件数量
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCaseNo.trim()) count++;
    if (filterName.trim()) count++;
    if (filterTrademark.trim()) count++;
    if (filterApplicant.trim()) count++;
    if (filterClass !== 'ALL') count++;
    if (filterDeadlineStart.trim() || filterDeadlineEnd.trim()) count++;
    if (filterAgency.trim()) count++;
    if (filterRequester.trim()) count++;
    if (filterBusinessType !== 'ALL') count++;
    if (filterDepartments.length > 0) count++;
    if (filterStatus !== 'ALL') count++;
    return count;
  }, [
    filterCaseNo,
    filterName,
    filterTrademark,
    filterApplicant,
    filterClass,
    filterDeadlineStart,
    filterDeadlineEnd,
    filterAgency,
    filterRequester,
    filterBusinessType,
    filterDepartments,
    filterStatus
  ]);

  // 导出 CSV / 确认导出
  const handleExportCSV = () => {
    if (!isExportMode) {
      setIsExportMode(true);
      return;
    }

    if (selectedCases.length === 0) {
      showToast('请勾选要导出的数据');
      return;
    }

    const exportData = filteredCases.filter(c => selectedCases.includes(c.id));
    const headers = ['维权案号,维权类型,涉案侵权标的,对方注册号,对方当事人,我方引证商标,尼斯分类,法域,风险等级,案件状态,法定进度,承办律所,经办人,维权预算'];
    const rows = exportData.map((c) =>
      [
        c.caseNo,
        getTypeLabel(c.type).label,
        `"${c.targetTrademark}"`,
        c.targetRegNo,
        `"${c.targetApplicant}"`,
        `"${c.ourTrademark}"`,
        `"第${c.classes.join('、')}类"`,
        c.jurisdiction,
        c.riskLevel,
        c.status,
        `${c.progressPercent}%`,
        `"${c.lawFirm}"`,
        `"${c.handler}"`,
        `"¥${c.budget.toLocaleString()}"`
      ].join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `商标维权管理台账_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`已成功导出 ${exportData.length} 条商标维权管理台账 CSV 数据！`);
    setIsExportMode(false);
    setSelectedCases([]);
  };

  // 计算各 Tab 统计数量
  const counts = useMemo(() => {
    const total = cases.length;
    const refusalReview = cases.filter(c => c.type === 'REFUSAL_REVIEW').length;
    const opposition = cases.filter(c => c.type === 'OPPOSITION').length;
    const invalidation = cases.filter(c => c.type === 'INVALIDATION').length;
    const nonUseRevocation = cases.filter(c => c.type === 'NON_USE_REVOCATION').length;
    const defense = cases.filter(c => c.type === 'DEFENSE').length;
    return { total, refusalReview, opposition, invalidation, nonUseRevocation, defense };
  }, [cases]);

  // 过滤后的案件列表 (针对 11 个业务搜索字段的精准与模糊匹配)
  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      // 1. 状态/类型 Tab 快捷过滤
      if (activeTab !== 'ALL' && item.type !== activeTab) return false;

      // 2. 维权单据号 (输入框，支持批量搜索，支持英文/中文逗号、分号、空格、换行分隔)
      if (filterCaseNo.trim()) {
        const codes = filterCaseNo
          .split(/[,;\s\n，；]+/)
          .map(s => s.trim().toLowerCase())
          .filter(Boolean);
        if (codes.length > 0) {
          const itemNo = (item.caseNo || '').toLowerCase();
          const agencyNo = (item.agencyCaseNo || '').toLowerCase();
          const matches = codes.some(code => itemNo.includes(code) || agencyNo.includes(code));
          if (!matches) return false;
        }
      }

      // 3. 维权名称 (输入框，支持模糊搜索)
      if (filterName.trim()) {
        const q = filterName.trim().toLowerCase();
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const groundsMatch = (item.groundsSummary || '').toLowerCase().includes(q);
        const adviceMatch = (item.proposalAdvice || '').toLowerCase().includes(q);
        const remarksMatch = (item.remarks || '').toLowerCase().includes(q);
        if (!nameMatch && !groundsMatch && !adviceMatch && !remarksMatch) return false;
      }

      // 4. 商标名 (输入框，支持模糊搜索)
      if (filterTrademark.trim()) {
        const q = filterTrademark.trim().toLowerCase();
        const targetMatch = (item.targetTrademark || '').toLowerCase().includes(q);
        const ourMatch = (item.ourTrademark || '').toLowerCase().includes(q);
        const brandMatch = (item.brand || '').toLowerCase().includes(q);
        if (!targetMatch && !ourMatch && !brandMatch) return false;
      }

      // 5. 申请人名称(权利人) (输入框，支持模糊搜索)
      if (filterApplicant.trim()) {
        const q = filterApplicant.trim().toLowerCase();
        const applicantMatch = (item.targetApplicant || '').toLowerCase().includes(q);
        const requesterMatch = (item.requesterName || '').toLowerCase().includes(q);
        if (!applicantMatch && !requesterMatch) return false;
      }

      // 6. 尼斯分类 (下拉选择，下拉选项是尼斯分类类别)
      if (filterClass !== 'ALL' && filterClass.trim()) {
        const clsQuery = parseInt(filterClass.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(clsQuery) && !item.classes.some(c => Number(c) === clsQuery)) {
          return false;
        }
      }

      // 7. 处理期限 (时间选择器，支持选择开始日期和结束日期)
      const itemDeadline = item.processingDeadline || item.filingDeadline || '';
      if (filterDeadlineStart.trim()) {
        if (!itemDeadline || itemDeadline < filterDeadlineStart.trim()) return false;
      }
      if (filterDeadlineEnd.trim()) {
        if (!itemDeadline || itemDeadline > filterDeadlineEnd.trim()) return false;
      }

      // 8. 代理机构 (输入框，支持模糊搜索)
      if (filterAgency.trim()) {
        const q = filterAgency.trim().toLowerCase();
        const agencyMatch = (item.agencyName || '').toLowerCase().includes(q);
        const lawFirmMatch = (item.lawFirm || '').toLowerCase().includes(q);
        if (!agencyMatch && !lawFirmMatch) return false;
      }

      // 9. 请求人 (输入框，支持模糊搜索)
      if (filterRequester.trim()) {
        const q = filterRequester.trim().toLowerCase();
        const requesterMatch = (item.requesterName || '').toLowerCase().includes(q);
        const handlerMatch = (item.handler || '').toLowerCase().includes(q);
        const undertakerMatch = (item.undertaker || '').toLowerCase().includes(q);
        if (!requesterMatch && !handlerMatch && !undertakerMatch) return false;
      }

      // 10. 业务类型 (下拉框，单选)
      if (filterBusinessType !== 'ALL') {
        const itemBiz = item.businessType || '';
        const itemTypeLabel = getTypeLabel(item.type).label;
        if (!itemBiz.includes(filterBusinessType) && !itemTypeLabel.includes(filterBusinessType)) {
          return false;
        }
      }

      // 11. 提案部门 (下拉框，支持多选和关键词搜索)
      if (filterDepartments.length > 0) {
        const itemDept = item.proposalDepartment || item.department || item.undertakingDepartment || '';
        const matches = filterDepartments.some(d => itemDept.includes(d));
        if (!matches) return false;
      }

      // 12. 案件状态 (下拉框，单选)
      if (filterStatus !== 'ALL') {
        if (item.status !== filterStatus) return false;
      }

      return true;
    });
  }, [
    cases,
    activeTab,
    filterCaseNo,
    filterName,
    filterTrademark,
    filterApplicant,
    filterClass,
    filterDeadlineStart,
    filterDeadlineEnd,
    filterAgency,
    filterRequester,
    filterBusinessType,
    filterDepartments,
    filterStatus
  ]);

  // 全选案件状态
  const isAllCasesSelected = useMemo(() => {
    if (filteredCases.length === 0) return false;
    return filteredCases.every(c => selectedCases.includes(c.id));
  }, [filteredCases, selectedCases]);

  const handleToggleSelectAllCases = () => {
    if (isAllCasesSelected) {
      setSelectedCases([]);
    } else {
      setSelectedCases(filteredCases.map(c => c.id));
    }
  };

  const handleToggleSelectOneCase = (id: string) => {
    setSelectedCases(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 分页计算
  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'REFUSAL_REVIEW':
        return { label: '驳回复查', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'OPPOSITION':
        return { label: '异议', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'INVALIDATION':
        return { label: '无效', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'NON_USE_REVOCATION':
        return { label: '撤三', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'DEFENSE':
        return { label: '答辩', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'STANDARDS':
        return { label: '达标审查', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'CUSTOMS':
        return { label: '海关查扣', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { label: '维权案', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_START':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            待启动
          </span>
        );
      case 'WIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            已胜诉/裁定无效
          </span>
        );
      case 'UNDER_HEARING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            商标局审理中
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
            已正式递交
          </span>
        );
      case 'EVIDENCE_PREP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            证据链组织中
          </span>
        );
      case 'SETTLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            已和解结案
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            处理中
          </span>
        );
    }
  };

  const renderRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
            <Flame className="w-2.5 h-2.5 text-rose-600" />
            极高风险
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
            高风险
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
            中等风险
          </span>
        );
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCaseId(null);
    setFormData({
      name: '针对【u-smile 优笑】抢注商标第21类商标异议立案申请',
      businessType: '商标异议申请',
      proposalDepartment: '品牌知产中心',
      undertakingDepartment: '品牌知产中心',
      undertaker: '林悦',
      outsourcingType: '全部委外',
      agencyCaseNo: 'LS-2026-TM-88219',
      entrustmentDate: '2026-08-20',
      agencyRemarks: '请律所加急撰写异议理由书，强化驰名商标跨类保护与在先知名度公证书证据',
      fileOpeningDate: '2026-08-15',
      submissionMethod: '电子递交 (网上申请系统)',
      status: 'SUBMITTED',
      deadline: '2026-09-30',
      processingDeadline: '2026-09-30',
      submissionDate: '2026-08-25',
      rulingDate: '',
      proposalAdvice: '依据《商标法》第13条（驰名商标）及第30条（在先近似）提出异议申请并阻断注册',
      remarks: '对方商标目前处于初审公告期，距异议截止日仅剩35天，需紧急组织证据链递交',
      trademarkName: 'u-smile 优笑',
      classes: ['第21类'],
      goodsAndServices: '2101-电动牙刷; 2108-牙刷; 2110-牙线; 2112-漱口水; 2114-冲牙器',
      targetRegNo: '76891042',
      targetApplicant: '深圳市优笑科技有限公司',
      applicationDate: '2024-03-15',
      applicantAddress: '广东省深圳市南山区粤海街道科技园中区10栋501',
      registrationDate: '',
      preliminaryNoticePeriod: '第1889期 (2025-05-06 至 2025-08-06)',
      country: '中国 (CN)',
      expiryDate: '',
      ourTrademark: 'usmile (第42881903号)',
      citedTrademarkClass: ['第21类', '第03类', '第05类'],
      trademarkImages: [
        'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=300&q=80'
      ],
      agencyName: '北京市柳沈律师事务所',
      agencyContact: '林悦 律师',
      agencyPhone: '010-66578899',
      requesterName: '广州星际悦动股份有限公司',
      requesterAddress: '广东省广州市天河区黄埔大道西100号富力盈普大厦38楼',
      requesterPostcode: '510623',
      requesterPhone: '020-85596688',
      requesterContact: '知产合规组',
      brand: 'usmile',
      attachments: [
        { name: '官方初审公告页扫描件.pdf', size: '2.4 MB' },
        { name: 'usmile驰名商标在先使用证明集.zip', size: '15.8 MB' }
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: EnforcementCase) => {
    setEditingCaseId(item.id);
    setFormData({
      name: item.name || `针对【${item.targetTrademark}】维权异议立案`,
      businessType: item.businessType || (item.type === 'REFUSAL_REVIEW' ? '商标驳回复查' : item.type === 'INVALIDATION' ? '在先权利无效宣告' : item.type === 'NON_USE_REVOCATION' ? '撤销连续三年不使用' : item.type === 'DEFENSE' ? '被异议官方答辩' : item.type === 'CUSTOMS' ? '海关保护备案' : '商标异议申请'),
      proposalDepartment: item.proposalDepartment || '品牌知产中心',
      undertakingDepartment: item.undertakingDepartment || item.proposalDepartment || '品牌知产中心',
      undertaker: item.undertaker || item.handler || '林悦',
      outsourcingType: item.outsourcingType || '全部委外',
      agencyCaseNo: item.agencyCaseNo || '',
      entrustmentDate: item.entrustmentDate || '2026-08-20',
      agencyRemarks: item.agencyRemarks || '',
      fileOpeningDate: item.fileOpeningDate || '2026-08-15',
      submissionMethod: item.submissionMethod || '电子递交 (网上申请系统)',
      status: item.status || 'SUBMITTED',
      deadline: item.processingDeadline || item.filingDeadline || '2026-09-30',
      processingDeadline: item.processingDeadline || item.filingDeadline || '2026-09-30',
      submissionDate: item.submissionDate || '',
      rulingDate: item.rulingDate || '',
      proposalAdvice: item.proposalAdvice || item.groundsSummary || '',
      remarks: item.remarks || '',
      trademarkName: item.targetTrademark || '',
      classes: (item.classes && item.classes.length > 0)
        ? item.classes.map(c => typeof c === 'number' ? `第${c < 10 ? '0' + c : c}类` : String(c))
        : ['第21类'],
      goodsAndServices: item.goodsAndServices || '',
      targetRegNo: item.targetRegNo || '',
      targetApplicant: item.targetApplicant || '',
      applicationDate: item.applicationDate || '',
      applicantAddress: item.applicantAddress || '',
      registrationDate: item.registrationDate || '',
      preliminaryNoticePeriod: item.preliminaryNoticePeriod || '',
      country: item.country || (item.jurisdiction === 'US' ? '美国 (US)' : item.jurisdiction === 'EU' ? '欧盟 (EU)' : '中国 (CN)'),
      expiryDate: item.expiryDate || '',
      ourTrademark: item.ourTrademark || 'usmile (第42881903号)',
      citedTrademarkClass: item.citedTrademarkClass || ['第21类'],
      trademarkImages: item.trademarkImages || [],
      agencyName: item.agencyName || item.lawFirm || '北京市柳沈律师事务所',
      agencyContact: item.agencyContact || '',
      agencyPhone: item.agencyPhone || '',
      requesterName: item.requesterName || '广州星际悦动股份有限公司',
      requesterAddress: item.requesterAddress || '',
      requesterPostcode: item.requesterPostcode || '',
      requesterPhone: item.requesterPhone || '',
      requesterContact: item.requesterContact || item.handler || '知产合规组',
      brand: item.brand || 'usmile',
      attachments: item.attachments || [],
    });
    setIsModalOpen(true);
  };

  const handleCreateDispute = () => {
    if (!formData.trademarkName || !formData.targetRegNo) {
      showToast('请填写涉案商标名及申请号/注册号');
      return;
    }

    // 映射业务类型到案例类型枚举
    let caseType: EnforcementCaseType = 'OPPOSITION';
    if (formData.businessType.includes('驳回')) caseType = 'REFUSAL_REVIEW';
    else if (formData.businessType.includes('异议')) caseType = 'OPPOSITION';
    else if (formData.businessType.includes('无效')) caseType = 'INVALIDATION';
    else if (formData.businessType.includes('撤三')) caseType = 'NON_USE_REVOCATION';
    else if (formData.businessType.includes('答辩')) caseType = 'DEFENSE';
    else if (formData.businessType.includes('海关')) caseType = 'CUSTOMS';

    // 匹配类别
    let parsedClasses: number[] = [21];
    if (Array.isArray(formData.classes) && formData.classes.length > 0) {
      parsedClasses = formData.classes.map(c => {
        const match = String(c).match(/\d+/);
        return match ? parseInt(match[0]) : 21;
      });
    }

    // 计算进度百分比
    let calcProgress = 50;
    if (formData.status === 'PENDING_START' || formData.status === 'PENDING') calcProgress = 10;
    else if (formData.status === 'EVIDENCE_PREP') calcProgress = 25;
    else if (formData.status === 'SUBMITTED') calcProgress = 50;
    else if (formData.status === 'UNDER_HEARING') calcProgress = 70;
    else if (['WIN', 'LOST', 'SETTLED'].includes(formData.status)) calcProgress = 100;

    if (editingCaseId) {
      // 编辑已有单据
      const targetCase = cases.find(c => c.id === editingCaseId);
      if (!targetCase) return;

      const updatedCase: EnforcementCase = {
        ...targetCase,
        type: caseType,
        targetTrademark: formData.trademarkName,
        targetRegNo: formData.targetRegNo,
        targetApplicant: formData.targetApplicant || targetCase.targetApplicant,
        ourTrademark: formData.ourTrademark || targetCase.ourTrademark,
        classes: parsedClasses,
        jurisdiction: (formData.country.includes('US') ? 'US' : formData.country.includes('EU') ? 'EU' : 'CN') as Jurisdiction,
        groundsSummary: formData.proposalAdvice || formData.remarks || targetCase.groundsSummary,
        lawFirm: formData.agencyName || targetCase.lawFirm,
        handler: formData.undertaker || formData.requesterContact || targetCase.handler,
        filingDeadline: formData.processingDeadline || formData.deadline || targetCase.filingDeadline,
        status: (formData.status as any) || targetCase.status,
        progressPercent: calcProgress,

        // 存储表单录入的所有字段内容 (供查看维权详情展示)
        name: formData.name || targetCase.name,
        businessType: formData.businessType,
        proposalDepartment: formData.proposalDepartment,
        undertakingDepartment: formData.undertakingDepartment,
        undertaker: formData.undertaker,
        outsourcingType: formData.outsourcingType,
        agencyCaseNo: formData.agencyCaseNo,
        entrustmentDate: formData.entrustmentDate,
        agencyRemarks: formData.agencyRemarks,
        fileOpeningDate: formData.fileOpeningDate,
        submissionMethod: formData.submissionMethod,
        processingDeadline: formData.processingDeadline || formData.deadline,
        submissionDate: formData.submissionDate,
        rulingDate: formData.rulingDate,
        proposalAdvice: formData.proposalAdvice,
        remarks: formData.remarks,
        goodsAndServices: formData.goodsAndServices,
        applicationDate: formData.applicationDate,
        applicantAddress: formData.applicantAddress,
        registrationDate: formData.registrationDate,
        preliminaryNoticePeriod: formData.preliminaryNoticePeriod,
        country: formData.country,
        expiryDate: formData.expiryDate,
        citedTrademarkClass: formData.citedTrademarkClass,
        trademarkImages: formData.trademarkImages,
        agencyName: formData.agencyName,
        agencyContact: formData.agencyContact,
        agencyPhone: formData.agencyPhone,
        requesterName: formData.requesterName,
        requesterAddress: formData.requesterAddress,
        requesterPostcode: formData.requesterPostcode,
        requesterPhone: formData.requesterPhone,
        requesterContact: formData.requesterContact,
        brand: formData.brand,
        attachments: formData.attachments
      };

      if (onUpdateCase) {
        onUpdateCase(updatedCase);
      }
      setIsModalOpen(false);
      setEditingCaseId(null);
      showToast(`已成功保存维权单据【${targetCase.caseNo}】的修改信息！`);
    } else {
      // 新建维权单据：编号自动生成规则 WQ年月日XXX
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const seq = String(cases.length + 1).padStart(3, '0');
      const generatedCaseNo = `WQ${yyyy}${mm}${dd}${seq}`;

      const newCase: Partial<EnforcementCase> = {
        caseNo: generatedCaseNo,
        type: caseType,
        targetTrademark: formData.trademarkName,
        targetRegNo: formData.targetRegNo,
        targetApplicant: formData.targetApplicant || '深圳市优笑科技有限公司',
        ourTrademark: formData.ourTrademark || 'usmile (第42881903号)',
        classes: parsedClasses,
        jurisdiction: (formData.country.includes('US') ? 'US' : formData.country.includes('EU') ? 'EU' : 'CN') as Jurisdiction,
        riskLevel: 'CRITICAL',
        groundsSummary: formData.proposalAdvice || formData.remarks || `针对【${formData.trademarkName}】在先侵权事实提起立案与证据链存证`,
        budget: 8500,
        lawFirm: formData.agencyName || '北京市柳沈律师事务所',
        status: (formData.status as any) || 'SUBMITTED',
        handler: formData.undertaker || formData.requesterContact || '林悦',
        filingDeadline: formData.processingDeadline || formData.deadline || '2026-09-30',
        progressPercent: calcProgress,

        // 存储表单录入的所有字段内容
        name: formData.name || `针对【${formData.trademarkName}】维权异议立案`,
        businessType: formData.businessType,
        proposalDepartment: formData.proposalDepartment,
        undertakingDepartment: formData.undertakingDepartment,
        undertaker: formData.undertaker,
        outsourcingType: formData.outsourcingType,
        agencyCaseNo: formData.agencyCaseNo,
        entrustmentDate: formData.entrustmentDate,
        agencyRemarks: formData.agencyRemarks,
        fileOpeningDate: formData.fileOpeningDate,
        submissionMethod: formData.submissionMethod,
        processingDeadline: formData.processingDeadline || formData.deadline,
        submissionDate: formData.submissionDate,
        rulingDate: formData.rulingDate,
        proposalAdvice: formData.proposalAdvice,
        remarks: formData.remarks,
        goodsAndServices: formData.goodsAndServices,
        applicationDate: formData.applicationDate,
        applicantAddress: formData.applicantAddress,
        registrationDate: formData.registrationDate,
        preliminaryNoticePeriod: formData.preliminaryNoticePeriod,
        country: formData.country,
        expiryDate: formData.expiryDate,
        citedTrademarkClass: formData.citedTrademarkClass,
        trademarkImages: formData.trademarkImages,
        agencyName: formData.agencyName,
        agencyContact: formData.agencyContact,
        agencyPhone: formData.agencyPhone,
        requesterName: formData.requesterName,
        requesterAddress: formData.requesterAddress,
        requesterPostcode: formData.requesterPostcode,
        requesterPhone: formData.requesterPhone,
        requesterContact: formData.requesterContact,
        brand: formData.brand,
        attachments: formData.attachments
      };

      onCreateCase(newCase);
      setIsModalOpen(false);
      showToast(`已成功发起商标维权：编号 ${generatedCaseNo}！`);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast 提示 (页面居中显示) */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] max-w-md px-6 py-4 bg-slate-900/95 backdrop-blur-md text-white text-sm font-semibold rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-slate-700/80 pointer-events-none text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: 商标维权与异议清障中心 */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white px-5 py-3.5 border border-blue-100/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#235fff] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#235fff]/20">
            <Gavel className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm md:text-base font-black text-slate-900 font-display tracking-tight">
                商标维权与异议清障中心
              </h2>
              <div className="relative group/winrate inline-flex items-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs cursor-pointer hover:bg-emerald-100/60 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>历史胜诉率 {winRatePercent}%</span>
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600/70 group-hover/winrate:text-emerald-800 transition-colors shrink-0" />
                </span>

                {/* 鼠标悬停显示计算说明浮窗 */}
                <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 hidden group-hover/winrate:block z-50 w-72 sm:w-88 p-3 bg-slate-900/95 text-white rounded-xl shadow-2xl text-xs font-normal leading-relaxed whitespace-normal backdrop-blur-xs pointer-events-none transition-all">
                  <div className="font-bold text-slate-100 border-b border-slate-700/80 pb-1.5 mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>历史胜诉率计算说明</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px] font-sans">
                    <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700 font-mono text-[11px] text-emerald-300">
                      历史胜诉率 = 维权成功单据数量 ÷ 已结案单据总量 × 100%
                    </div>
                    <p className="leading-relaxed">
                      <span className="font-semibold text-emerald-400">分子：</span>
                      【案件状态 = 维权成功 (裁定胜诉/宣告无效)】的单据数量（当前共 <span className="font-mono font-bold text-white">{winCasesCount}</span> 件）
                    </p>
                    <p className="leading-relaxed">
                      <span className="font-semibold text-blue-400">分母：</span>
                      【案件状态 = 维权成功 (裁定胜诉/宣告无效)、维权不成立 (异议/复审被驳回)、和解结案 (已签署和解/撤回)】的单据总数量（当前共 <span className="font-mono font-bold text-white">{closedCasesCount}</span> 件）
                    </p>
                    <div className="pt-1.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>当前已结案统计：</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {winCasesCount} ÷ {closedCasesCount > 0 ? closedCasesCount : 1} = {winRatePercent}%
                      </span>
                    </div>
                  </div>
                  <div className="absolute -top-1 left-8 sm:left-1/2 sm:-translate-x-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45 border-t border-l border-slate-700/80"></div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              严厉打击“u-smile”、“USMLIE”、“笑容佳”等恶意抢注与傍名牌侵权行为，组织驰名商标公证证据链与全生命周期维权台账。
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. 维权大卡片：包含检索筛选区 + 状态 Tab + 案件列表表格 */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-0">
        
        {/* 检索筛选区 */}
        <div className="p-4 sm:p-5">
          {/* 字段栅格区 (4列网格，按钮与字段同一行) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            
            {/* 1. 维权单据号 (输入框，支持批量搜索) */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">维权单据号</label>
              <input 
                type="text" 
                value={filterCaseNo}
                onChange={(e) => setFilterCaseNo(e.target.value)}
                placeholder="支持批量搜索(空格/逗号/换行分隔)" 
                className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* 2. 维权名称 (输入框，支持模糊搜索) */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">维权名称</label>
              <input 
                type="text" 
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="输入维权名称，支持模糊搜索" 
                className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* 3. 商标名 (输入框，支持模糊搜索) */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">商标名</label>
              <input 
                type="text" 
                value={filterTrademark}
                onChange={(e) => setFilterTrademark(e.target.value)}
                placeholder="输入商标名称，如 u-smile、笑容加" 
                className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* 未展开状态下的第4列：操作按钮组 */}
            {!isExpanded && (
              <div className="flex items-center justify-end gap-2 pt-4 sm:pt-5">
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1.5 rounded-md hover:bg-blue-50/60 transition-colors cursor-pointer"
                >
                  <span>展开</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3.5 py-1.5 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50/80 border border-slate-300 rounded-md transition-all cursor-pointer shadow-2xs active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>重置</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all flex items-center gap-1.5 shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.98] whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>查询</span>
                </button>
              </div>
            )}

            {/* 展开状态下的字段与按钮 */}
            {isExpanded && (
              <>
                {/* 4. 申请人名称(权利人) (输入框，支持模糊搜索) */}
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="block text-xs font-medium text-slate-600">申请人名称(权利人)</label>
                  <input 
                    type="text" 
                    value={filterApplicant}
                    onChange={(e) => setFilterApplicant(e.target.value)}
                    placeholder="输入申请人/权利人公司全称或个体" 
                    className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
                  />
                </div>

                {/* 5. 尼斯分类 (下拉选择，下拉选项是【商标分类与类群组与商品/服务项目的关系表】中的尼斯分类类别) */}
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="block text-xs font-medium text-slate-600">尼斯分类</label>
                  <div className="relative">
                    <select 
                      value={filterClass}
                      onChange={(e) => setFilterClass(e.target.value)}
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

                {/* 6. 处理期限 (时间选择器，支持选择开始日期和结束日期) */}
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="block text-xs font-medium text-slate-600">处理期限</label>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="date" 
                      value={filterDeadlineStart}
                      onChange={(e) => setFilterDeadlineStart(e.target.value)}
                      className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      title="开始日期"
                    />
                    <span className="text-slate-400 text-xs shrink-0">至</span>
                    <input 
                      type="date" 
                      value={filterDeadlineEnd}
                      onChange={(e) => setFilterDeadlineEnd(e.target.value)}
                      className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      title="结束日期"
                    />
                  </div>
                </div>

                {/* 7. 代理机构 (输入框，支持模糊搜索) */}
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="block text-xs font-medium text-slate-600">代理机构</label>
                  <input 
                    type="text" 
                    value={filterAgency}
                    onChange={(e) => setFilterAgency(e.target.value)}
                    placeholder="输入代理机构/律所名称" 
                    className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
                  />
                </div>

                {/* 8. 请求人 (输入框，支持模糊搜索) */}
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="block text-xs font-medium text-slate-600">请求人</label>
                  <input 
                    type="text" 
                    value={filterRequester}
                    onChange={(e) => setFilterRequester(e.target.value)}
                    placeholder="输入请求人/经办人姓名或主体" 
                    className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
                  />
                </div>

                {/* 9. 业务类型 (下拉框，单选) */}
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="block text-xs font-medium text-slate-600">业务类型</label>
                  <div className="relative">
                    <select 
                      value={filterBusinessType}
                      onChange={(e) => setFilterBusinessType(e.target.value)}
                      className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
                    >
                      {BUSINESS_TYPE_OPTIONS.map(bt => (
                        <option key={bt.value} value={bt.value}>{bt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 10. 提案部门 (下拉框，支持多选和关键词搜索) */}
                <div className="space-y-1 relative animate-in fade-in duration-200" ref={departmentDropdownRef}>
                  <label className="block text-xs font-medium text-slate-600 flex items-center justify-between">
                    <span>提案部门</span>
                    {filterDepartments.length > 0 && (
                      <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        已选 {filterDepartments.length} 项
                      </span>
                    )}
                  </label>
                  <div 
                    onClick={() => setIsDepartmentDropdownOpen(prev => !prev)}
                    className={`w-full min-h-[34px] text-xs font-normal bg-white hover:bg-slate-50/60 border ${isDepartmentDropdownOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-300'} rounded-lg px-2.5 py-1.5 pr-7 flex items-center justify-between cursor-pointer transition-all shadow-2xs relative`}
                  >
                    <div className="truncate text-slate-800 flex items-center gap-1 flex-1">
                      {filterDepartments.length === 0 ? (
                        <span className="text-slate-400">请选择提案部门(多选/搜索)</span>
                      ) : (
                        <div className="flex items-center gap-1 truncate">
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[11px] font-medium border border-blue-200">
                            {filterDepartments[0]}
                          </span>
                          {filterDepartments.length > 1 && (
                            <span className="text-slate-500 text-[11px]">
                              +{filterDepartments.length - 1}个
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {filterDepartments.length > 0 && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilterDepartments([]);
                          }}
                          className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700"
                          title="清空已选部门"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDepartmentDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* 浮动下拉面板 */}
                  {isDepartmentDropdownOpen && (
                    <div 
                      className="absolute left-0 top-full mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 z-40 space-y-2 animate-in fade-in zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 搜索框 */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          value={departmentSearchKeyword}
                          onChange={(e) => setDepartmentSearchKeyword(e.target.value)}
                          placeholder="搜索部门名称..."
                          className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* 快捷操作：全选 / 清空 */}
                      <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 pt-0.5">
                        <span>可选部门 ({DEPARTMENT_OPTIONS.filter(d => !departmentSearchKeyword.trim() || d.includes(departmentSearchKeyword.trim())).length})</span>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button" 
                            onClick={() => handleSelectAllFilteredDepartments(DEPARTMENT_OPTIONS.filter(d => !departmentSearchKeyword.trim() || d.includes(departmentSearchKeyword.trim())))}
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            全选
                          </button>
                          <span className="text-slate-300">|</span>
                          <button 
                            type="button" 
                            onClick={handleClearFilterDepartments}
                            className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                          >
                            清空
                          </button>
                        </div>
                      </div>

                      {/* 部门多选列表 */}
                      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
                        {DEPARTMENT_OPTIONS.filter(d => !departmentSearchKeyword.trim() || d.includes(departmentSearchKeyword.trim())).length === 0 ? (
                          <div className="py-4 text-center text-slate-400 text-xs">无匹配部门</div>
                        ) : (
                          DEPARTMENT_OPTIONS
                            .filter(d => !departmentSearchKeyword.trim() || d.includes(departmentSearchKeyword.trim()))
                            .map(dept => {
                              const isChecked = filterDepartments.includes(dept);
                              return (
                                <div 
                                  key={dept}
                                  onClick={() => handleToggleFilterDepartment(dept)}
                                  className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer select-none transition-colors ${isChecked ? 'bg-blue-50/80 text-blue-800 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked}
                                      onChange={() => {}} // handled by parent onClick
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                                    />
                                    <span className="truncate">{dept}</span>
                                  </div>
                                  {isChecked && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                                </div>
                              );
                            })
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => setIsDepartmentDropdownOpen(false)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium cursor-pointer shadow-xs"
                        >
                          确定
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 11. 案件状态 (下拉框，单选) */}
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="block text-xs font-medium text-slate-600">案件状态</label>
                  <div className="relative">
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
                    >
                      {STATUS_OPTIONS.map(st => (
                        <option key={st.value} value={st.value}>{st.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 展开状态下的第12列：操作按钮组 */}
                <div className="flex items-center justify-end gap-2 pt-4 sm:pt-5 animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1.5 rounded-md hover:bg-blue-50/60 transition-colors cursor-pointer"
                  >
                    <span>收起</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-3.5 py-1.5 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50/80 border border-slate-300 rounded-md transition-all cursor-pointer shadow-2xs active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>重置</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
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

      {/* 搜索区和 Tab 之间的浅色分割线 */}
      <div className="border-b border-slate-200"></div>

        {/* 列表头部工具栏：左侧状态选项卡 + 右侧操作功能按键 */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white">
          
          {/* 左侧状态/类型过滤选项卡栏 */}
          <div className="flex items-center gap-5 sm:gap-6 overflow-x-auto no-scrollbar pt-1">
            
            {/* 全部 */}
            <button
              onClick={() => {
                setActiveTab('ALL');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeTab === 'ALL'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>全部</span>
              <span className={`text-xs ${activeTab === 'ALL' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {counts.total}
              </span>
              {activeTab === 'ALL' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

            {/* 驳回复查 */}
            <button
              onClick={() => {
                setActiveTab('REFUSAL_REVIEW');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeTab === 'REFUSAL_REVIEW'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>驳回复查</span>
              <span className={`text-xs ${activeTab === 'REFUSAL_REVIEW' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {counts.refusalReview}
              </span>
              {activeTab === 'REFUSAL_REVIEW' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

            {/* 异议 */}
            <button
              onClick={() => {
                setActiveTab('OPPOSITION');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeTab === 'OPPOSITION'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>异议</span>
              <span className={`text-xs ${activeTab === 'OPPOSITION' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {counts.opposition}
              </span>
              {activeTab === 'OPPOSITION' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

            {/* 无效 */}
            <button
              onClick={() => {
                setActiveTab('INVALIDATION');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeTab === 'INVALIDATION'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>无效</span>
              <span className={`text-xs ${activeTab === 'INVALIDATION' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {counts.invalidation}
              </span>
              {activeTab === 'INVALIDATION' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

            {/* 撤三 */}
            <button
              onClick={() => {
                setActiveTab('NON_USE_REVOCATION');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeTab === 'NON_USE_REVOCATION'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>撤三</span>
              <span className={`text-xs ${activeTab === 'NON_USE_REVOCATION' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {counts.nonUseRevocation}
              </span>
              {activeTab === 'NON_USE_REVOCATION' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

            {/* 答辩 */}
            <button
              onClick={() => {
                setActiveTab('DEFENSE');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeTab === 'DEFENSE'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>答辩</span>
              <span className={`text-xs ${activeTab === 'DEFENSE' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {counts.defense}
              </span>
              {activeTab === 'DEFENSE' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

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
                  onClick={handleExportCSV}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>确认导出{selectedCases.length > 0 ? ` (${selectedCases.length})` : ''}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportMode(false);
                    setSelectedCases([]);
                  }}
                  className="px-3.5 py-1.5 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-all cursor-pointer shadow-2xs"
                >
                  <span>取消导出</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50/80 border border-slate-300 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>导出</span>
              </button>
            )}

            {/* 发起商标维权 */}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all flex items-center gap-1.5 shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.98] whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>发起商标维权</span>
            </button>

          </div>

        </div>

        {/* 表格区 */}
        <div className="overflow-x-auto">
          {viewMode === 'COMPOUND' ? (
            /* ======================================================== */
            /* 1. 一屏智能合并视图 (按【维权详情】表单核心字段展示) */
            /* ======================================================== */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[12px] font-semibold text-slate-600">
                  {isExportMode && (
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllCasesSelected}
                        onChange={handleToggleSelectAllCases}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="py-3 px-4 min-w-[200px]">维权单据号 / 维权名称</th>
                  <th className="py-3 px-4 min-w-[180px]">商标名 / 申请人名称(权利人)</th>
                  <th className="py-3 px-4 min-w-[140px]">尼斯分类 / 处理期限</th>
                  <th className="py-3 px-4 min-w-[160px]">代理机构 / 请求人</th>
                  <th className="py-3 px-4 min-w-[140px]">业务类型 / 提案部门</th>
                  <th className="py-3 px-4 min-w-[130px]">
                    <div className="flex items-center gap-1.5">
                      <span>案件状态</span>
                      <div className="relative group/status-help inline-flex items-center">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600 transition-colors cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover/status-help:block z-50 w-72 sm:w-80 p-3 bg-slate-900/95 text-white rounded-lg shadow-xl text-xs font-normal leading-relaxed whitespace-normal backdrop-blur-xs pointer-events-none transition-all">
                          <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1.5 mb-2 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>案件状态说明</span>
                          </div>
                          <div className="space-y-1.5 text-slate-300 text-[11px] font-sans">
                            <p><span className="font-semibold text-slate-400">待启动：</span>维权立案待启动或等待法务审批委派</p>
                            <p><span className="font-semibold text-amber-400">证据准备中：</span>法务主管已委派，代理律所正在组织撰写申请书及证据材料</p>
                            <p><span className="font-semibold text-indigo-400">已递交：</span>已向国家商标局/知识产权局正式提交立案申请</p>
                            <p><span className="font-semibold text-blue-400">审理中：</span>商标局已受理，处于官方实质审查与答辩期</p>
                            <p><span className="font-semibold text-emerald-400">维权成功：</span>商标局下发裁定，异议成立/成功宣告被异议商标无效</p>
                            <p><span className="font-semibold text-rose-400">维权不成立：</span>异议或复审请求被驳回</p>
                            <p><span className="font-semibold text-slate-400">和解结案：</span>双方达成和解协议并完成撤回</p>
                          </div>
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45 border-t border-l border-slate-700/80"></div>
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="py-3 px-4 w-[120px] min-w-[120px] text-center sticky right-0 z-20 bg-slate-50 border-l border-slate-200/80 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)] whitespace-nowrap">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedCases.length > 0 ? (
                  paginatedCases.map((item) => {
                    const typeBadge = getTypeLabel(item.type);
                    return (
                      <tr 
                        key={item.id}
                        className="hover:bg-blue-50/20 transition-colors group"
                      >
                        {isExportMode && (
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedCases.includes(item.id)}
                              onChange={() => handleToggleSelectOneCase(item.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                        )}
                        {/* 1. 维权单据号 + 维权名称 */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedCase(item)}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-mono text-xs font-bold cursor-pointer"
                              >
                                {item.caseNo}
                              </button>
                            </div>
                            <div className="font-medium text-slate-900 text-xs truncate max-w-xs" title={item.name || `针对【${item.targetTrademark}】维权异议`}>
                              {item.name || `针对【${item.targetTrademark}】维权异议`}
                            </div>
                          </div>
                        </td>

                        {/* 2. 商标名 + 申请人名称(权利人) */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs">
                                {item.targetTrademark}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                (#{item.targetRegNo})
                              </span>
                            </div>
                            <div className="text-slate-600 text-[11px] truncate max-w-[160px]" title={item.targetApplicant}>
                              申请人: {item.targetApplicant}
                            </div>
                          </div>
                        </td>

                        {/* 3. 商标类别 + 处理期限 */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="text-slate-900 text-xs font-medium truncate">
                              第 {item.classes.join('、')} 类
                            </div>
                            <div className="text-slate-500 text-[11px] font-mono">
                              期限: {item.filingDeadline}
                            </div>
                          </div>
                        </td>

                        {/* 4. 代理机构 + 请求人 */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="text-slate-800 text-[11px] truncate font-medium max-w-[150px]" title={item.agencyName || item.lawFirm}>
                              {item.agencyName || item.lawFirm}
                            </div>
                            <div className="text-slate-500 text-[11px]">
                              请求人: {item.requesterContact || item.handler || '知产合规组'}
                            </div>
                          </div>
                        </td>

                        {/* 5. 业务类型与提案部门 (排在案件状态之前) */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeBadge.color}`}>
                                {item.businessType || typeBadge.label}
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] font-medium">
                              {item.proposalDepartment || '品牌知产中心'}
                            </div>
                          </div>
                        </td>

                        {/* 6. 案件状态 */}
                        <td className="py-3 px-4">
                          <div>
                            {renderStatusBadge(item.status)}
                          </div>
                        </td>

                        {/* 7. 操作 (固定在右侧) */}
                        <td className="py-3 px-4 text-center sticky right-0 z-10 bg-white group-hover:bg-[#f3f7fd] border-l border-slate-100 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)] whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedCase(item)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md font-medium cursor-pointer transition-colors"
                            >
                              查看
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md font-medium cursor-pointer transition-colors"
                              title="编辑修改维权单据信息"
                            >
                              编辑
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <span className="text-xs">暂无匹配的维权案件记录</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            /* ======================================================== */
            /* 2. 平铺单列视图 (按【维权详情】表单核心字段展开) */
            /* ======================================================== */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[12px] font-semibold text-slate-600 whitespace-nowrap">
                  {isExportMode && (
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllCasesSelected}
                        onChange={handleToggleSelectAllCases}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="py-3 px-4">维权单据号</th>
                  <th className="py-3 px-4">维权名称</th>
                  <th className="py-3 px-4">商标名</th>
                  <th className="py-3 px-4">尼斯分类</th>
                  <th className="py-3 px-4">申请人名称(权利人)</th>
                  <th className="py-3 px-4">代理机构</th>
                  <th className="py-3 px-4">处理期限</th>
                  <th className="py-3 px-4">业务类型</th>
                  <th className="py-3 px-4">提案部门</th>
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span>案件状态</span>
                      <div className="relative group/status-help-std inline-flex items-center">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600 transition-colors cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover/status-help-std:block z-50 w-72 sm:w-80 p-3 bg-slate-900/95 text-white rounded-lg shadow-xl text-xs font-normal leading-relaxed whitespace-normal backdrop-blur-xs pointer-events-none transition-all">
                          <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1.5 mb-2 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>案件状态说明</span>
                          </div>
                          <div className="space-y-1.5 text-slate-300 text-[11px] font-sans">
                            <p><span className="font-semibold text-slate-400">待启动：</span>维权立案待启动或等待法务审批委派</p>
                            <p><span className="font-semibold text-amber-400">证据准备中：</span>法务主管已委派，代理律所正在组织撰写申请书及证据材料</p>
                            <p><span className="font-semibold text-indigo-400">已递交：</span>已向国家商标局/知识产权局正式提交立案申请</p>
                            <p><span className="font-semibold text-blue-400">审理中：</span>商标局已受理，处于官方实质审查与答辩期</p>
                            <p><span className="font-semibold text-emerald-400">维权成功：</span>商标局下发裁定，异议成立/成功宣告被异议商标无效</p>
                            <p><span className="font-semibold text-rose-400">维权不成立：</span>异议或复审请求被驳回</p>
                            <p><span className="font-semibold text-slate-400">和解结案：</span>双方达成和解协议并完成撤回</p>
                          </div>
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45 border-t border-l border-slate-700/80"></div>
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center sticky right-0 z-20 bg-slate-50 border-l border-slate-200/80 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)]">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 whitespace-nowrap">
                {paginatedCases.length > 0 ? (
                  paginatedCases.map((item) => {
                    const typeBadge = getTypeLabel(item.type);
                    return (
                      <tr 
                        key={item.id}
                        className="hover:bg-blue-50/20 transition-colors group"
                      >
                        {isExportMode && (
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedCases.includes(item.id)}
                              onChange={() => handleToggleSelectOneCase(item.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          <button onClick={() => setSelectedCase(item)} className="hover:underline cursor-pointer">
                            {item.caseNo}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate" title={item.name || `针对【${item.targetTrademark}】维权异议`}>
                          {item.name || `针对【${item.targetTrademark}】维权异议`}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {item.targetTrademark} <span className="text-[11px] font-mono text-slate-400 font-normal">(#{item.targetRegNo})</span>
                        </td>
                        <td className="py-3 px-4 text-slate-900 text-xs font-medium">
                          第 {item.classes.join('、')} 类
                        </td>
                        <td className="py-3 px-4 text-slate-800">
                          {item.targetApplicant}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {item.agencyName || item.lawFirm}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {item.filingDeadline}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium border ${typeBadge.color}`}>
                            {item.businessType || typeBadge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {item.proposalDepartment || '品牌知产中心'}
                        </td>
                        <td className="py-3 px-4">
                          {renderStatusBadge(item.status)}
                        </td>
                        <td className="py-3 px-4 text-center sticky right-0 z-10 bg-white group-hover:bg-[#f3f7fd] border-l border-slate-100 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)]">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedCase(item)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md font-medium cursor-pointer transition-colors"
                            >
                              查看
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md font-medium cursor-pointer transition-colors"
                              title="编辑修改维权单据信息"
                            >
                              编辑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      暂无匹配的维权案件记录
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
            totalCount={filteredCases.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. 发起维权立案弹窗 (New Dispute Modal - 对齐新建商标检索需求弹窗比例) */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-6xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 space-y-4 animate-in zoom-in-95 duration-200 max-h-[95vh] h-[92vh] flex flex-col">
            
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingCaseId ? '编辑商标维权单据' : '发起商标维权'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingCaseId 
                      ? `修改单据【${cases.find(c => c.id === editingCaseId)?.caseNo || ''}】的基础信息、商标资料与维权参数`
                      : '向商标局提出异议申请或无效宣告，维护 usmile 品牌独占商誉'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 表单主体区 (可滚动, 4大板块全字段标准平铺布局) */}
            <div className="overflow-y-auto space-y-6 pr-1.5 flex-1 text-xs">
              
              {/* 板块 1：基本信息 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 font-bold text-slate-900 text-xs">
                  <div className="w-1 h-3.5 bg-blue-600 rounded-full" />
                  <span>基本信息</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* 名称 */}
                  <div className="space-y-1 sm:col-span-2 md:col-span-3">
                    <label className="block text-xs font-medium text-slate-700">
                      名称 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="例如：针对【u-smile】抢注商标的第21类异议立案申请"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                    />
                  </div>

                  {/* 业务类型 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">业务类型</label>
                    <div className="relative">
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                      >
                        <option value="商标异议申请">商标异议申请 (初审公告期)</option>
                        <option value="商标驳回复查">商标驳回复查 / 复审申请</option>
                        <option value="在先权利无效宣告">在先权利无效宣告请求 (注册5年内)</option>
                        <option value="撤销连续三年不使用">撤销连续三年不使用申请 (撤三)</option>
                        <option value="被异议官方答辩">被异议 / 被无效宣告官方答辩</option>
                        <option value="海关保护备案">海关维权防护备案</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 案件状态 (下拉选项) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700 flex items-center justify-between">
                      <span>案件状态</span>
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-medium border border-blue-200/60">下拉选择</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full text-xs text-blue-900 bg-blue-50/30 border border-blue-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-semibold"
                      >
                        <option value="PENDING_START">待启动</option>
                        <option value="EVIDENCE_PREP">证据准备中 / 理由撰写中</option>
                        <option value="SUBMITTED">已正式递交 (待审理)</option>
                        <option value="UNDER_HEARING">商标局审理中 / 答辩期</option>
                        <option value="WIN">维权成功 (裁定胜诉/宣告无效)</option>
                        <option value="LOST">维权不成立 (异议/复审被驳回)</option>
                        <option value="SETTLED">和解结案 (已签署和解/撤回)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-blue-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 提案部门 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">提案部门</label>
                    <div className="relative">
                      <select
                        value={formData.proposalDepartment}
                        onChange={(e) => setFormData({ ...formData, proposalDepartment: e.target.value })}
                        className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                      >
                        <option value="品牌知产中心">品牌知产中心</option>
                        <option value="法务合规部">法务合规部</option>
                        <option value="研发知产组">研发知产组</option>
                        <option value="市场营销部">市场营销部</option>
                        <option value="海外事业中心">海外事业中心</option>
                        <option value="供应链管理部">供应链管理部</option>
                        <option value="品牌管理部">品牌管理部</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 承办部门 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">承办部门</label>
                    <div className="relative">
                      <select
                        value={formData.undertakingDepartment}
                        onChange={(e) => setFormData({ ...formData, undertakingDepartment: e.target.value })}
                        className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                      >
                        <option value="品牌知产中心">品牌知产中心</option>
                        <option value="法务合规部">法务合规部</option>
                        <option value="研发知产组">研发知产组</option>
                        <option value="海外知产部">海外知产部</option>
                        <option value="知产维权运营部">知产维权运营部</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 承办人 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">承办人</label>
                    <input
                      type="text"
                      placeholder="例如：林悦"
                      value={formData.undertaker}
                      onChange={(e) => setFormData({ ...formData, undertaker: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 委外类型 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">委外类型</label>
                    <div className="relative">
                      <select
                        value={formData.outsourcingType}
                        onChange={(e) => setFormData({ ...formData, outsourcingType: e.target.value })}
                        className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                      >
                        <option value="全部委外">全部委外 (委托代理机构主办)</option>
                        <option value="部分委外">部分委外 (联合办案/顾问复核)</option>
                        <option value="自办/不委外">自办 / 不委外 (内部法务直办)</option>
                        <option value="专项咨询委外">专项咨询委外 (调查/尽调单项)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 代理机构 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">代理机构</label>
                    <input
                      type="text"
                      placeholder="例如：北京市柳沈律师事务所"
                      value={formData.agencyName}
                      onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 代理机构案号 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">代理机构案号</label>
                    <input
                      type="text"
                      placeholder="例如：LS-2026-TM-88219"
                      value={formData.agencyCaseNo}
                      onChange={(e) => setFormData({ ...formData, agencyCaseNo: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* 委案日期 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">委案日期</label>
                    <input
                      type="date"
                      value={formData.entrustmentDate}
                      onChange={(e) => setFormData({ ...formData, entrustmentDate: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* 开卷日期 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">开卷日期</label>
                    <input
                      type="date"
                      value={formData.fileOpeningDate}
                      onChange={(e) => setFormData({ ...formData, fileOpeningDate: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* 递交方式 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">递交方式</label>
                    <div className="relative">
                      <select
                        value={formData.submissionMethod}
                        onChange={(e) => setFormData({ ...formData, submissionMethod: e.target.value })}
                        className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                      >
                        <option value="电子递交 (网上申请系统)">电子递交 (网上申请系统)</option>
                        <option value="纸质递交 (窗口面交)">纸质递交 (窗口面交)</option>
                        <option value="邮寄递交">邮寄递交 (特快专递 EMS)</option>
                        <option value="国际局电子直报 (Madrid)">国际局电子直报 (Madrid)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 处理期限 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">处理期限</label>
                    <input
                      type="date"
                      value={formData.processingDeadline || formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value, processingDeadline: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* 递交日期 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">递交日期</label>
                    <input
                      type="date"
                      value={formData.submissionDate}
                      onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* 裁文日期 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">裁文日期</label>
                    <input
                      type="date"
                      value={formData.rulingDate}
                      onChange={(e) => setFormData({ ...formData, rulingDate: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* 对代理机构备注 */}
                  <div className="space-y-1 sm:col-span-2 md:col-span-3">
                    <label className="block text-xs font-medium text-slate-700">对代理机构备注</label>
                    <input
                      type="text"
                      placeholder="填写针对承办律所/代理机构的跟进要求、补充材料指引或答辩策略要点..."
                      value={formData.agencyRemarks}
                      onChange={(e) => setFormData({ ...formData, agencyRemarks: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 处理建议 */}
                  <div className="space-y-1 sm:col-span-2 md:col-span-3">
                    <label className="block text-xs font-medium text-slate-700">处理建议</label>
                    <textarea
                      rows={2}
                      placeholder="建议提出异议申请并同步进行撤三/无效宣告组合打击..."
                      value={formData.proposalAdvice}
                      onChange={(e) => setFormData({ ...formData, proposalAdvice: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs leading-relaxed resize-none"
                    />
                  </div>

                  {/* 备注 */}
                  <div className="space-y-1 sm:col-span-2 md:col-span-3">
                    <label className="block text-xs font-medium text-slate-700">备注</label>
                    <textarea
                      rows={2}
                      placeholder="填写相关案件背景、法条引用或紧急排查说明..."
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs leading-relaxed resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 板块 2：商标信息 */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 font-bold text-slate-900 text-xs">
                  <div className="w-1 h-3.5 bg-blue-600 rounded-full" />
                  <span>商标信息</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 商标名 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">商标名</label>
                    <input
                      type="text"
                      placeholder="例如：u-smile 优笑"
                      value={formData.trademarkName}
                      onChange={(e) => setFormData({ ...formData, trademarkName: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 尼斯分类 (多选与搜索下拉) */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700">尼斯分类</label>
                    <div className="relative">
                      <div 
                        onClick={() => setIsTrademarkClassDropdownOpen(!isTrademarkClassDropdownOpen)}
                        className="flex items-center justify-between gap-2 min-h-[38px] p-1.5 px-2.5 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all shadow-2xs group"
                      >
                        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                          {formData.classes.length === 0 ? (
                            <span className="text-slate-400 text-xs">请点击选择尼斯分类 (1-45类全选与搜索)...</span>
                          ) : (
                            formData.classes.map(code => {
                              const item = NICE_CLASSES_45.find(n => n.code === code);
                              return (
                                <span 
                                  key={code} 
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 shadow-2xs animate-in fade-in duration-150"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {code} {item ? `- ${item.name}` : ''}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleTrademarkClass(code);
                                    }}
                                    className="p-0.5 hover:bg-blue-200/60 rounded text-blue-500 hover:text-blue-800 cursor-pointer"
                                    title="移除此类别"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 shrink-0">
                          <span className="text-[11px] font-medium hidden sm:inline">
                            {isTrademarkClassDropdownOpen ? '收起' : '选择'}
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isTrademarkClassDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                        </div>
                      </div>

                      {/* 展开面板 */}
                      {isTrademarkClassDropdownOpen && (
                        <div className="mt-2 p-3 bg-white border border-blue-200 rounded-xl shadow-lg space-y-2.5 z-20 relative animate-in fade-in zoom-in-95 duration-150">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={trademarkClassSearchKeyword}
                              onChange={(e) => setTrademarkClassSearchKeyword(e.target.value)}
                              placeholder="搜索类别编号或关键词（如：21、洁具、牙刷、日化、软件...）"
                              className="w-full text-xs text-slate-800 pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            {trademarkClassSearchKeyword && (
                              <button
                                type="button"
                                onClick={() => setTrademarkClassSearchKeyword('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between text-[11px] gap-1.5 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-slate-500">
                              <span>常用预设:</span>
                              <button
                                type="button"
                                onClick={() => handleSetQuickTrademarkClasses(['第21类', '第03类', '第10类'])}
                                className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
                              >
                                美齿个护 (21+03+10)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetQuickTrademarkClasses(['第09类', '第35类', '第42类'])}
                                className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
                              >
                                数智电商 (09+35+42)
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSetQuickTrademarkClasses(['第21类'])}
                              className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
                            >
                              重置默认
                            </button>
                          </div>

                          <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-1 text-xs">
                            {NICE_CLASSES_45.filter(item => {
                              if (!trademarkClassSearchKeyword.trim()) return true;
                              const k = trademarkClassSearchKeyword.trim().toLowerCase();
                              return item.code.toLowerCase().includes(k) ||
                                item.num.includes(k) ||
                                item.name.toLowerCase().includes(k) ||
                                item.desc.toLowerCase().includes(k);
                            }).map(item => {
                              const isChecked = formData.classes.includes(item.code);
                              return (
                                <label
                                  key={item.code}
                                  className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-2xs'
                                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleTrademarkClass(item.code)}
                                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-xs flex items-center justify-between">
                                      <span>{item.code} - {item.name}</span>
                                      {isChecked && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.desc}</div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 商品/服务项目 */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700">商品/服务项目</label>
                    <textarea
                      rows={2}
                      placeholder="例如：2101-电动牙刷; 2108-牙刷; 2110-牙线; 2112-漱口水"
                      value={formData.goodsAndServices}
                      onChange={(e) => setFormData({ ...formData, goodsAndServices: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs leading-relaxed resize-none"
                    />
                  </div>

                  {/* 申请号/注册号 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">申请号/注册号</label>
                    <input
                      type="text"
                      placeholder="如：76891042"
                      value={formData.targetRegNo}
                      onChange={(e) => setFormData({ ...formData, targetRegNo: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* 申请人名称(权利人) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">申请人名称(权利人)</label>
                    <input
                      type="text"
                      placeholder="侵权方公司全称或个体工商户"
                      value={formData.targetApplicant}
                      onChange={(e) => setFormData({ ...formData, targetApplicant: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 申请日 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">申请日</label>
                    <input
                      type="date"
                      value={formData.applicationDate}
                      onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* 地址(权利人地址) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">地址(权利人地址)</label>
                    <input
                      type="text"
                      placeholder="权利人登记注册通信地址"
                      value={formData.applicantAddress}
                      onChange={(e) => setFormData({ ...formData, applicantAddress: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 注册日 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">注册日</label>
                    <input
                      type="date"
                      value={formData.registrationDate}
                      onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* 初步审定公告期 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">初步审定公告期</label>
                    <input
                      type="text"
                      placeholder="如：第1889期 (2025-05-06 至 2025-08-06)"
                      value={formData.preliminaryNoticePeriod}
                      onChange={(e) => setFormData({ ...formData, preliminaryNoticePeriod: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 国家(地区) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">国家(地区)</label>
                    <div className="relative">
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                      >
                        <option value="中国 (CN)">中国 (CN)</option>
                        <option value="美国 (US)">美国 (US)</option>
                        <option value="欧盟 (EU)">欧盟 (EU)</option>
                        <option value="日本 (JP)">日本 (JP)</option>
                        <option value="韩国 (KR)">韩国 (KR)</option>
                        <option value="英国 (UK)">英国 (UK)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 终止日 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">终止日</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* 引证商标 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">引证商标</label>
                    <input
                      type="text"
                      placeholder="我方引证维权商标，如：usmile (第42881903号)"
                      value={formData.ourTrademark}
                      onChange={(e) => setFormData({ ...formData, ourTrademark: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 引证尼斯分类 (多选与搜索下拉) */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700">引证尼斯分类</label>
                    <div className="relative">
                      <div 
                        onClick={() => setIsCitedClassDropdownOpen(!isCitedClassDropdownOpen)}
                        className="flex items-center justify-between gap-2 min-h-[38px] p-1.5 px-2.5 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all shadow-2xs group"
                      >
                        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                          {formData.citedTrademarkClass.length === 0 ? (
                            <span className="text-slate-400 text-xs">请点击选择引证尼斯分类 (1-45类全选与搜索)...</span>
                          ) : (
                            formData.citedTrademarkClass.map(code => {
                              const item = NICE_CLASSES_45.find(n => n.code === code);
                              return (
                                <span 
                                  key={code} 
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 shadow-2xs animate-in fade-in duration-150"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {code} {item ? `- ${item.name}` : ''}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleCitedClass(code);
                                    }}
                                    className="p-0.5 hover:bg-blue-200/60 rounded text-blue-500 hover:text-blue-800 cursor-pointer"
                                    title="移除此类别"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 shrink-0">
                          <span className="text-[11px] font-medium hidden sm:inline">
                            {isCitedClassDropdownOpen ? '收起' : '选择'}
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCitedClassDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                        </div>
                      </div>

                      {/* 展开面板 */}
                      {isCitedClassDropdownOpen && (
                        <div className="mt-2 p-3 bg-white border border-blue-200 rounded-xl shadow-lg space-y-2.5 z-20 relative animate-in fade-in zoom-in-95 duration-150">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={citedClassSearchKeyword}
                              onChange={(e) => setCitedClassSearchKeyword(e.target.value)}
                              placeholder="搜索类别编号或关键词..."
                              className="w-full text-xs text-slate-800 pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            {citedClassSearchKeyword && (
                              <button
                                type="button"
                                onClick={() => setCitedClassSearchKeyword('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between text-[11px] gap-1.5 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-slate-500">
                              <span>常用预设:</span>
                              <button
                                type="button"
                                onClick={() => handleSetQuickCitedClasses(['第21类', '第03类', '第05类'])}
                                className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
                              >
                                核心防线 (21+03+05)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetQuickCitedClasses(['第09类', '第35类', '第42类'])}
                                className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
                              >
                                数字渠道 (09+35+42)
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSetQuickCitedClasses(['第21类'])}
                              className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
                            >
                              重置默认
                            </button>
                          </div>

                          <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-1 text-xs">
                            {NICE_CLASSES_45.filter(item => {
                              if (!citedClassSearchKeyword.trim()) return true;
                              const k = citedClassSearchKeyword.trim().toLowerCase();
                              return item.code.toLowerCase().includes(k) ||
                                item.num.includes(k) ||
                                item.name.toLowerCase().includes(k) ||
                                item.desc.toLowerCase().includes(k);
                            }).map(item => {
                              const isChecked = formData.citedTrademarkClass.includes(item.code);
                              return (
                                <label
                                  key={item.code}
                                  className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-2xs'
                                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleCitedClass(item.code)}
                                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-xs flex items-center justify-between">
                                      <span>{item.code} - {item.name}</span>
                                      {isChecked && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.desc}</div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 上传图片 (商标图样) - 支持多图 */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700">上传图片 (商标图样)</label>
                    <div className="border border-slate-200 bg-white p-3.5 rounded-xl space-y-3">
                      {/* 图样缩略图平铺 */}
                      <div className="flex flex-wrap items-center gap-3">
                        {formData.trademarkImages.map((imgUrl, index) => (
                          <div 
                            key={index} 
                            className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden relative group shadow-2xs"
                          >
                            <img src={imgUrl} alt={`商标图样 ${index + 1}`} className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  trademarkImages: prev.trademarkImages.filter((_, i) => i !== index)
                                }));
                              }}
                              className="absolute top-1 right-1 bg-slate-900/70 hover:bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-xs"
                              title="移除此图样"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-1 left-1 bg-slate-900/60 text-white text-[9px] px-1 rounded backdrop-blur-2xs">
                              #{index + 1}
                            </span>
                          </div>
                        ))}

                        {/* 多选上传触发按钮 */}
                        <label className="px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium cursor-pointer transition-all border border-blue-200 flex flex-col items-center justify-center gap-1 shadow-2xs min-w-[100px] h-20 border-dashed hover:border-blue-400 group">
                          <UploadCloud className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span>选择商标图样</span>
                          <span className="text-[10px] text-blue-500/80">(支持多选)</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []) as File[];
                              if (files.length > 0) {
                                files.forEach((file: File) => {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setFormData(prev => ({
                                      ...prev,
                                      trademarkImages: [...prev.trademarkImages, reader.result as string]
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                });
                              }
                            }}
                          />
                        </label>
                      </div>

                      <p className="text-[11px] text-slate-400">支持上传单张或多张 PNG、JPG、WEBP 格式黑白或彩色商标矢量样图</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 板块 3：请求人信息 */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 font-bold text-slate-900 text-xs">
                  <div className="w-1 h-3.5 bg-blue-600 rounded-full" />
                  <span>请求人信息</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 代理机构(申请代理机构) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">代理机构(申请代理机构)</label>
                    <input
                      type="text"
                      placeholder="例如：北京市柳沈律师事务所"
                      value={formData.agencyName}
                      onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 代理机构联系人 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">代理机构联系人</label>
                    <input
                      type="text"
                      placeholder="例如：林悦 律师"
                      value={formData.agencyContact}
                      onChange={(e) => setFormData({ ...formData, agencyContact: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 代理机构联系电话(含区号) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">代理机构联系电话(含区号)</label>
                    <input
                      type="text"
                      placeholder="例如：010-66578899"
                      value={formData.agencyPhone}
                      onChange={(e) => setFormData({ ...formData, agencyPhone: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* 请求人名称 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">请求人名称</label>
                    <input
                      type="text"
                      placeholder="例如：广州星际悦动股份有限公司"
                      value={formData.requesterName}
                      onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 请求人通信地址 */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700">请求人通信地址</label>
                    <input
                      type="text"
                      placeholder="例如：广东省广州市天河区黄埔大道西100号富力盈普大厦38楼"
                      value={formData.requesterAddress}
                      onChange={(e) => setFormData({ ...formData, requesterAddress: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 请求人邮政编码 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">请求人邮政编码</label>
                    <input
                      type="text"
                      placeholder="例如：510623"
                      value={formData.requesterPostcode}
                      onChange={(e) => setFormData({ ...formData, requesterPostcode: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* 请求人联系电话(含区号) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">请求人联系电话(含区号)</label>
                    <input
                      type="text"
                      placeholder="例如：020-85596688"
                      value={formData.requesterPhone}
                      onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* 请求人联系人 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">请求人联系人</label>
                    <input
                      type="text"
                      placeholder="例如：知产合规组"
                      value={formData.requesterContact}
                      onChange={(e) => setFormData({ ...formData, requesterContact: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 品牌 */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">品牌</label>
                    <select
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-medium cursor-pointer"
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
                  </div>
                </div>
              </div>

              {/* 板块 4：附件信息 */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 font-bold text-slate-900 text-xs">
                  <div className="w-1 h-3.5 bg-blue-600 rounded-full" />
                  <span>附件信息</span>
                </div>

                <div className="space-y-3">
                  {/* 上传附件区域 */}
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-center group">
                    <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-blue-500 transition-colors mb-1.5" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600">点击上传附件或将文件拖拽至此处</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">支持 PDF、ZIP、DOCX、PNG 等格式，单个文件不超过 50MB</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []) as File[];
                        if (files.length > 0) {
                          const newAtts = files.map((f: File) => ({
                            name: f.name,
                            size: (f.size / (1024 * 1024)).toFixed(1) + ' MB'
                          }));
                          setFormData(prev => ({
                            ...prev,
                            attachments: [...prev.attachments, ...newAtts]
                          }));
                        }
                      }}
                    />
                  </label>

                  {/* 已上传附件列表 */}
                  {formData.attachments.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-500">已添加附件清单 ({formData.attachments.length})</span>
                      <div className="space-y-1">
                        {formData.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="font-medium text-slate-800 truncate">{file.name}</span>
                              <span className="text-[11px] text-slate-400 font-mono shrink-0">({file.size})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  attachments: prev.attachments.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* 弹窗底部操作按钮组 */}
            <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 shrink-0">
              <span className="text-[11px] text-slate-400">
                发起立案后将自动推送至官方全流程监控台账，并协同指定代理律所进行证据链组织
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors cursor-pointer shadow-2xs"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleCreateDispute}
                  className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.98]"
                >
                  {editingCaseId ? '保存修改' : '保存'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. 维权案件详情弹窗 (完全复用【建案需求详情】的样式与结构，显示维权立案表单内容) */}
      {/* ======================================================== */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Top Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                  selectedCase.status === 'WIN' ? 'bg-emerald-600 text-white' :
                  selectedCase.status === 'UNDER_HEARING' ? 'bg-blue-600 text-white' :
                  selectedCase.status === 'EVIDENCE_PREP' ? 'bg-amber-500 text-white' :
                  selectedCase.status === 'SUBMITTED' ? 'bg-indigo-600 text-white' :
                  selectedCase.status === 'PENDING_START' || selectedCase.status === 'PENDING' ? 'bg-slate-600 text-white' : 'bg-slate-500 text-white'
                }`}>
                  {selectedCase.status === 'WIN' ? '已胜诉' :
                   selectedCase.status === 'UNDER_HEARING' ? '审理中' :
                   selectedCase.status === 'EVIDENCE_PREP' ? '证据准备中' :
                   selectedCase.status === 'SUBMITTED' ? '已递交' :
                   selectedCase.status === 'PENDING_START' || selectedCase.status === 'PENDING' ? '待启动' : '处理中'}
                </span>
                <h3 className="text-base font-bold text-slate-900">维权详情</h3>
                <div className="flex items-center gap-1.5 text-sm sm:text-base font-mono font-bold text-slate-900">
                  <span>{selectedCase.caseNo}</span>
                  <button
                    type="button"
                    title="复制维权单据编号"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCase.caseNo);
                      showToast(`已复制维权单据编号: ${selectedCase.caseNo}`);
                    }}
                    className="text-blue-600 hover:text-blue-700 p-0.5 rounded cursor-pointer transition-colors flex items-center justify-center"
                  >
                    <Copy className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const current = selectedCase;
                    setSelectedCase(null);
                    handleOpenEditModal(current);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition-colors"
                >
                  编辑单据
                </button>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="px-6 bg-slate-50/80 border-b border-slate-200/80 flex items-center gap-6 text-xs shrink-0">
              <button
                onClick={() => setDetailTab('info')}
                className={`py-3 font-medium cursor-pointer border-b-2 transition-all ${
                  detailTab === 'info'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                需求信息
              </button>
              <button
                onClick={() => setDetailTab('history')}
                className={`py-3 font-medium cursor-pointer border-b-2 transition-all ${
                  detailTab === 'history'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                操作记录
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
              {detailTab === 'info' && (
                <div className="space-y-6">
                  
                  {/* 1. 基本信息 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>基本信息</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div className="sm:col-span-2">
                        <span className="text-slate-500">名称：</span>
                        <span className="text-slate-900 font-bold">{selectedCase.name || `针对【${selectedCase.targetTrademark}】维权异议立案`}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">业务类型：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.businessType || getTypeLabel(selectedCase.type).label}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">案件状态：</span>
                        <span className="inline-flex items-center gap-1 font-medium">
                          {renderStatusBadge(selectedCase.status)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">提案部门：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.proposalDepartment || '品牌知产中心'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">承办部门：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.undertakingDepartment || selectedCase.proposalDepartment || '品牌知产中心'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">承办人：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.undertaker || selectedCase.handler || '林悦'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">委外类型：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.outsourcingType || '全部委外'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">代理机构：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.agencyName || selectedCase.lawFirm || '北京市柳沈律师事务所'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">代理机构案号：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCase.agencyCaseNo || 'LS-2026-TM-88219'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">开卷日期：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCase.fileOpeningDate || '2026-08-15'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">委案日期：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCase.entrustmentDate || '2026-08-20'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">递交方式：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.submissionMethod || '电子递交 (网上申请系统)'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">处理期限：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCase.processingDeadline || selectedCase.filingDeadline}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">递交日期：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCase.submissionDate || '2026-08-25'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">裁文日期：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCase.rulingDate || (selectedCase.status === 'WIN' ? '2026-08-15' : '—')}</span>
                      </div>
                      {selectedCase.agencyRemarks && (
                        <div className="sm:col-span-3">
                          <span className="text-slate-500">对代理机构备注：</span>
                          <span className="text-slate-900 font-medium">{selectedCase.agencyRemarks}</span>
                        </div>
                      )}
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">处理建议：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.proposalAdvice || selectedCase.groundsSummary}</span>
                      </div>
                      {selectedCase.remarks && (
                        <div className="sm:col-span-3">
                          <span className="text-slate-500">备注：</span>
                          <span className="text-slate-900 font-medium">{selectedCase.remarks}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. 商标信息 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>商标信息</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div>
                        <span className="text-slate-500">商标名：</span>
                        <span className="text-slate-900 font-bold">{selectedCase.targetTrademark}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">尼斯分类：</span>
                        <span className="font-mono text-slate-900 font-medium">第 {selectedCase.classes.join('、')} 类</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请号/注册号：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCase.targetRegNo}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500">商品/服务项目：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.goodsAndServices || '2101-电动牙刷; 2108-牙刷刷头; 2110-牙线棒'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">国家(地区)：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.country || (selectedCase.jurisdiction === 'CN' ? '中国 (CN)' : selectedCase.jurisdiction)}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500">申请人名称(权利人)：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.targetApplicant}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请日：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCase.applicationDate || '2024-03-15'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">注册日：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCase.registrationDate || '2025-01-20'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">终止日：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCase.expiryDate || '2035-01-19'}</span>
                      </div>
                      {selectedCase.applicantAddress && (
                        <div className="sm:col-span-3">
                          <span className="text-slate-500">地址(权利人地址)：</span>
                          <span className="text-slate-900 font-medium">{selectedCase.applicantAddress}</span>
                        </div>
                      )}
                      {selectedCase.preliminaryNoticePeriod && (
                        <div className="sm:col-span-2">
                          <span className="text-slate-500">初步审定公告期：</span>
                          <span className="font-mono text-slate-900 font-medium">{selectedCase.preliminaryNoticePeriod}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-500">引证商标：</span>
                        <span className="font-bold text-blue-700">{selectedCase.ourTrademark}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">引证尼斯分类：</span>
                        <span className="font-mono text-slate-900 font-medium">
                          {Array.isArray(selectedCase.citedTrademarkClass) ? selectedCase.citedTrademarkClass.join('、') : (selectedCase.citedTrademarkClass || `第 ${selectedCase.classes.join('、')} 类`)}
                        </span>
                      </div>
                    </div>

                    {/* 上传图片 (商标图样) 展示 */}
                    {selectedCase.trademarkImages && selectedCase.trademarkImages.length > 0 && (
                      <div className="pt-2">
                        <span className="text-slate-500 block mb-1.5">上传图片 (商标图样) ({selectedCase.trademarkImages.length})：</span>
                        <div className="flex flex-wrap gap-2.5">
                          {selectedCase.trademarkImages.map((imgUrl, i) => (
                            <div key={i} className="w-20 h-20 rounded-lg border border-slate-200 bg-slate-50 p-1 flex items-center justify-center overflow-hidden shadow-2xs group relative">
                              <img src={imgUrl} alt="商标图样" className="max-w-full max-h-full object-contain" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. 请求人信息 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>请求人信息</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div className="sm:col-span-2">
                        <span className="text-slate-500">代理机构(申请代理机构)：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.agencyName || selectedCase.lawFirm}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">代理机构联系人：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.agencyContact || selectedCase.handler}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">代理机构联系电话(含区号)：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCase.agencyPhone || '010-66578899'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500">请求人名称：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.requesterName || '广州星际悦动股份有限公司'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500">请求人通信地址：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.requesterAddress || '广东省广州市天河区黄埔大道西100号富力盈普大厦38楼'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">请求人邮政编码：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCase.requesterPostcode || '510623'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">请求人联系电话(含区号)：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCase.requesterPhone || '020-85596688'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">请求人联系人：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.requesterContact || '知产合规组'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">品牌：</span>
                        <span className="text-slate-900 font-medium">{selectedCase.brand || 'usmile'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. 附件信息 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>附件信息</span>
                    </h4>
                    {selectedCase.attachments && selectedCase.attachments.length > 0 ? (
                      <div className="space-y-1.5 py-1">
                        {selectedCase.attachments.map((att, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="font-medium text-slate-800 truncate">{att.name}</span>
                              <span className="text-[11px] text-slate-400 font-mono shrink-0">({att.size})</span>
                            </div>
                            <span className="text-[11px] text-blue-600 font-medium hover:underline cursor-pointer">下载</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg text-slate-400 text-[11px]">
                        未上传补充附件
                      </div>
                    )}
                  </div>

                </div>
              )}

              {detailTab === 'history' && (
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
                          <td className="py-2.5 px-3.5 font-mono">2026-08-25 10:30:15</td>
                          <td className="py-2.5 px-3.5 font-medium">{selectedCase.requesterContact || '知产合规组'}</td>
                          <td className="py-2.5 px-3.5 font-medium text-emerald-600">建案/立案生成</td>
                          <td className="py-2.5 px-3.5 text-slate-500">系统生成维权案号【{selectedCase.caseNo}】</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-3.5 font-mono">2026-08-25 14:22:08</td>
                          <td className="py-2.5 px-3.5 font-medium">{selectedCase.lawFirm || '外部合作律所'}</td>
                          <td className="py-2.5 px-3.5 font-medium text-blue-600">提交文书材料</td>
                          <td className="py-2.5 px-3.5 text-slate-500">提交商标异议证据材料与公证书文书</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-3.5 font-mono">2026-08-25 16:45:00</td>
                          <td className="py-2.5 px-3.5 font-medium">系统自动监控流转</td>
                          <td className="py-2.5 px-3.5 font-medium text-blue-600">进度更新</td>
                          <td className="py-2.5 px-3.5 text-slate-500">更新审理进度至 {selectedCase.progressPercent}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};