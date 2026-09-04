import { Pagination } from "./Pagination";
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft,
  FolderTree, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  X, 
  ArrowRight, 
  UserCheck, 
  FolderPlus, 
  BarChart3,
  Trash2,
  Tag,
  Building2,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Eye,
  Download,
  RotateCcw,
  RefreshCw,
  Check,
  Filter,
  FileSpreadsheet,
  FileEdit,
  Undo2,
  Ban,
  XCircle,
  Send,
  Save,
  FileText,
  Sparkles
} from 'lucide-react';
import { 
  BrandTreeNode, 
  BrandLevel, 
  BrandCreationProposal, 
  BrandProposalStatus,
  UserProfile,
  TrademarkItem 
} from '../types';
import { flattenBrandTree, getBrandTreeMetrics } from '../data/brandTreeData';

interface BrandTreeManagementProps {
  brandTree: BrandTreeNode[];
  brandProposals: BrandCreationProposal[];
  trademarks?: TrademarkItem[];
  currentUser: UserProfile;
  onAddBrandNode: (node: Partial<BrandTreeNode>, parentId?: string | null) => void;
  onUpdateBrandNode: (node: BrandTreeNode) => void;
  onDeleteBrandNode: (id: string) => void;
  onCreateBrandProposal: (proposal: Partial<BrandCreationProposal>, isDraft?: boolean) => void;
  onUpdateBrandProposal?: (proposal: BrandCreationProposal) => void;
  onSubmitBrandProposal?: (proposalId: string) => void;
  onWithdrawBrandProposal?: (proposalId: string, reason?: string) => void;
  onCancelBrandProposal?: (proposalId: string, reason?: string) => void;
  onDeleteBrandProposal?: (proposalId: string) => void;
  onApproveBrandProposal: (proposalId: string, comment?: string) => void;
  onRejectBrandProposal: (proposalId: string, comment?: string) => void;
  onNavigateToFiling?: (brandName: string) => void;
}

// 核心重点尼斯分类清单（企业核心类别）
const CORE_NICE_CLASSES = [
  { classNum: 3, name: '日化洗护 / 牙膏牙粉 / 美妆护肤' },
  { classNum: 5, name: '医用卫生 / 口腔抑菌 / 营养膳食' },
  { classNum: 9, name: '智能硬件 / 控制芯片 / 软件 App' },
  { classNum: 10, name: '医疗器械 / 冲牙器 / 光电美肤仪' },
  { classNum: 11, name: '车载香氛 / 家用电器 / 净化杀菌' },
  { classNum: 21, name: '电动牙刷 / 洁齿用具 / 个护用具' },
  { classNum: 29, name: '滋补食品 / 鲜炖燕窝 / 营养制品' },
  { classNum: 30, name: '口腔含片 / 爆珠糖果 / 食品香精' },
  { classNum: 35, name: '广告销售 / 电商运营 / 特许经营' },
  { classNum: 42, name: '科技研发 / 算法设计 / 检验检测' },
  { classNum: 44, name: '医疗卫生 / 口腔门诊 / 美容服务' },
];

export const BrandTreeManagement: React.FC<BrandTreeManagementProps> = ({
  brandTree,
  brandProposals,
  trademarks = [],
  currentUser,
  onAddBrandNode,
  onUpdateBrandNode,
  onDeleteBrandNode,
  onCreateBrandProposal,
  onUpdateBrandProposal,
  onSubmitBrandProposal,
  onWithdrawBrandProposal,
  onCancelBrandProposal,
  onDeleteBrandProposal,
  onApproveBrandProposal,
  onRejectBrandProposal,
  onNavigateToFiling
}) => {
  // 主视图选项卡：1. 企业品牌管理  2. 新建品牌审批

  // 搜索关键字（品牌树）
  const [searchQuery, setSearchQuery] = useState('');

  // 当前选中的品牌 (默认选中第一个品牌)
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brandTree[0]?.id || 'BR-USMILE');

  // 展开子品牌折叠状态 (记录哪些品牌展开了二级子品牌)
  const [expandedBrandIds, setExpandedBrandIds] = useState<Set<string>>(new Set(['BR-USMILE']));

  // 模态框状态
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<{ level: 'PRIMARY' | 'SUB'; parentBrand?: BrandTreeNode | null }>({
    level: 'PRIMARY',
    parentBrand: null
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<BrandTreeNode | null>(null);

  // 品牌申请模态框（新建/编辑）
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalModalMode, setProposalModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);

  // 申请详情弹窗
  const [selectedProposalDetail, setSelectedProposalDetail] = useState<BrandCreationProposal | null>(null);

  // 撤回与取消确认弹窗状态
  const [withdrawingProposal, setWithdrawingProposal] = useState<BrandCreationProposal | null>(null);
  const [withdrawReasonInput, setWithdrawReasonInput] = useState('');

  const [cancellingProposal, setCancellingProposal] = useState<BrandCreationProposal | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  // 品牌审批列表 Tab 状态：全部，未提交，审批中，已入库，被驳回，已撤回，已取消
  const [proposalTab, setProposalTab] = useState<BrandProposalStatus | 'ALL'>('ALL');
  const [proposalSearch, setProposalSearch] = useState('');
  const [proposalLevelFilter, setProposalLevelFilter] = useState<'ALL' | 'CORE_BRAND' | 'SUB_BRAND'>('ALL');
  const [proposalPage, setProposalPage] = useState(1);
  const [proposalPageSize, setProposalPageSize] = useState(10);

  // 提示信息
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 新增/添加表单
  const [brandForm, setBrandForm] = useState({
    name: '',
    englishName: '',
    code: '',
    description: '',
    ownerDept: '口腔科技事业部',
    ownerName: currentUser.name || '林悦',
    launchDate: new Date().toISOString().slice(0, 10),
    targetCategories: [21, 3, 10, 35],
    targetMarkets: ['中国', '东南亚'],
  });

  // 新建品牌审批申请表单
  const [proposalForm, setProposalForm] = useState({
    brandName: '',
    englishName: '',
    level: 'CORE_BRAND' as BrandLevel, // 默认主品牌
    parentBrandId: '',
    ownerDept: currentUser.department || '品牌中心',
    brandPositioning: '',
    plannedLaunchDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    targetClasses: [21, 3, 10, 35],
    targetMarkets: ['中国', '东南亚'],
    commercialJustification: '',
  });

  // 扁平化所有品牌列表
  const flatBrandList = useMemo(() => flattenBrandTree(brandTree), [brandTree]);

  // 全局指标
  const metrics = useMemo(() => getBrandTreeMetrics(brandTree), [brandTree]);

  // 待审批提案数及统计（含新增 tab 分类：全部，未提交，审批中，已入库，被驳回，已撤回，已取消）
  const proposalCounts = useMemo(() => {
    const total = brandProposals.length;
    const draft = brandProposals.filter(p => p.status === 'DRAFT').length;
    const pending = brandProposals.filter(p => p.status === 'PENDING_APPROVAL').length;
    const approved = brandProposals.filter(p => p.status === 'APPROVED').length;
    const rejected = brandProposals.filter(p => p.status === 'REJECTED').length;
    const withdrawn = brandProposals.filter(p => p.status === 'WITHDRAWN').length;
    const cancelled = brandProposals.filter(p => p.status === 'CANCELLED').length;
    return { total, draft, pending, approved, rejected, withdrawn, cancelled };
  }, [brandProposals]);

  const pendingCount = proposalCounts.pending;

  // 过滤后的品牌审批列表
  const filteredProposals = useMemo(() => {
    return brandProposals.filter(proposal => {
      if (proposalTab !== 'ALL' && proposal.status !== proposalTab) return false;
      if (proposalLevelFilter !== 'ALL' && proposal.level !== proposalLevelFilter) return false;
      if (proposalSearch.trim()) {
        const q = proposalSearch.trim().toLowerCase();
        const matchNo = proposal.proposalNo.toLowerCase().includes(q);
        const matchName = proposal.brandName.toLowerCase().includes(q);
        const matchInitiator = proposal.initiatorName.toLowerCase().includes(q);
        const matchDept = proposal.ownerDept.toLowerCase().includes(q);
        const matchPositioning = proposal.brandPositioning.toLowerCase().includes(q);
        if (!matchNo && !matchName && !matchInitiator && !matchDept && !matchPositioning) return false;
      }
      return true;
    });
  }, [brandProposals, proposalTab, proposalLevelFilter, proposalSearch]);

  // 分页计算
  const totalProposalPages = Math.max(1, Math.ceil(filteredProposals.length / proposalPageSize));
  const paginatedProposals = useMemo(() => {
    const start = (proposalPage - 1) * proposalPageSize;
    return filteredProposals.slice(start, start + proposalPageSize);
  }, [filteredProposals, proposalPage, proposalPageSize]);

  // 导出审批数据 CSV
  const handleExportProposalsCSV = () => {
    const statusTextMap: Record<BrandProposalStatus, string> = {
      DRAFT: '未提交',
      PENDING_APPROVAL: '审批中',
      APPROVED: '已入库',
      REJECTED: '被驳回',
      WITHDRAWN: '已撤回',
      CANCELLED: '已取消'
    };

    const headers = ['审批单号,拟建品牌名称,拟建层级,所属上级品牌,需求部门,需求人,规划类别,目标市场,当前状态,申请时间,商业定位'];
    const rows = filteredProposals.map(p => [
      p.proposalNo,
      `"${p.brandName}"`,
      p.level === 'CORE_BRAND' ? '主品牌' : '业务子品牌',
      `"${p.parentBrandName || '—'}"`,
      `"${p.ownerDept}"`,
      `"${p.initiatorName}"`,
      `"${(p.targetClasses || []).map(c => `第${c}类`).join(';')}"`,
      `"${(p.targetMarkets || []).join(';')}"`,
      statusTextMap[p.status] || p.status,
      `"${p.createTime}"`,
      `"${(p.brandPositioning || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `品牌创建审批清单_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('已成功导出品牌审批清单 CSV 表格！');
  };

  // 当前选中的品牌对象
  const selectedBrand = useMemo(() => {
    return flatBrandList.find(b => b.id === selectedBrandId) || brandTree[0] || null;
  }, [flatBrandList, selectedBrandId, brandTree]);

  // 获取选中品牌关联的在案商标
  const selectedBrandTrademarks = useMemo(() => {
    if (!selectedBrand) return [];
    const brandName = selectedBrand.name.trim();
    const englishName = selectedBrand.englishName?.trim();

    return trademarks.filter(t => {
      if (t.name.includes(brandName)) return true;
      if (englishName && t.name.toLowerCase().includes(englishName.toLowerCase())) return true;
      if (t.englishName && englishName && t.englishName.toLowerCase().includes(englishName.toLowerCase())) return true;
      return false;
    });
  }, [trademarks, selectedBrand]);

  // 计算选中品牌的类别覆盖度
  const categoryStats = useMemo(() => {
    if (!selectedBrand) return { coveredCount: 0, totalTarget: 0, coveredList: [], gapList: [] };
    const targetSet = new Set<number>(selectedBrand.targetCategories || [21, 3, 10, 35]);
    const coveredSet = new Set<number>();

    selectedBrandTrademarks.forEach(tm => {
      tm.classes.forEach(c => coveredSet.add(c));
    });

    const coveredList = CORE_NICE_CLASSES.filter(c => coveredSet.has(c.classNum));
    const gapList = CORE_NICE_CLASSES.filter(c => targetSet.has(c.classNum) && !coveredSet.has(c.classNum));

    return {
      coveredCount: coveredList.length,
      totalTarget: targetSet.size,
      coveredList,
      gapList
    };
  }, [selectedBrand, selectedBrandTrademarks]);

  // 切换折叠二级子品牌
  const toggleSubBrandExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedBrandIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 打开新增一级品牌弹窗
  const handleOpenAddPrimaryBrand = () => {
    setAddMode({ level: 'PRIMARY', parentBrand: null });
    setBrandForm({
      name: '',
      englishName: '',
      code: `BR-00${brandTree.length + 1}`,
      description: '',
      ownerDept: '品牌中心',
      ownerName: currentUser.name,
      launchDate: new Date().toISOString().slice(0, 10),
      targetCategories: [21, 3, 10, 35],
      targetMarkets: ['中国', '东南亚'],
    });
    setIsAddModalOpen(true);
  };

  // 打开为某个一级品牌添加二级子品牌弹窗
  const handleOpenAddSubBrand = (parent: BrandTreeNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAddMode({ level: 'SUB', parentBrand: parent });
    setBrandForm({
      name: '',
      englishName: '',
      code: `BR-SUB-00${(parent.children?.length || 0) + 1}`,
      description: '',
      ownerDept: parent.ownerDept,
      ownerName: currentUser.name,
      launchDate: new Date().toISOString().slice(0, 10),
      targetCategories: parent.targetCategories || [21, 3, 10],
      targetMarkets: parent.targetMarkets || ['中国'],
    });
    setIsAddModalOpen(true);
  };

  // 提交新增品牌
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name.trim()) {
      showToast('请输入品牌名称');
      return;
    }

    const isPrimary = addMode.level === 'PRIMARY';
    const newNode: Partial<BrandTreeNode> = {
      id: `BR-${Date.now().toString().slice(-6)}`,
      name: brandForm.name.trim(),
      englishName: brandForm.englishName.trim() || undefined,
      code: brandForm.code || (isPrimary ? `BR-00${brandTree.length + 1}` : `BR-SUB-${Date.now().toString().slice(-4)}`),
      level: isPrimary ? 'CORE_BRAND' : 'SUB_BRAND',
      parentId: isPrimary ? null : (addMode.parentBrand?.id || null),
      description: brandForm.description,
      ownerDept: brandForm.ownerDept,
      ownerName: brandForm.ownerName,
      status: 'ACTIVE',
      launchDate: brandForm.launchDate,
      targetCategories: brandForm.targetCategories,
      targetMarkets: brandForm.targetMarkets,
      trademarkCount: 0,
      pendingCount: 0,
      disputeCount: 0,
      children: []
    };

    onAddBrandNode(newNode, isPrimary ? null : addMode.parentBrand?.id);
    setSelectedBrandId(newNode.id!);
    if (!isPrimary && addMode.parentBrand) {
      setExpandedBrandIds(prev => new Set(prev).add(addMode.parentBrand!.id));
    }
    setIsAddModalOpen(false);
    showToast(`${isPrimary ? '一级品牌' : '二级子品牌'}【${newNode.name}】已成功创建！`);
  };

  // 提交编辑品牌
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;
    onUpdateBrandNode(editingNode);
    setIsEditModalOpen(false);
    showToast(`品牌【${editingNode.name}】已更新`);
  };

  // 打开新建品牌申请弹窗
  const handleOpenCreateProposal = () => {
    setProposalModalMode('CREATE');
    setEditingProposalId(null);
    setProposalForm({
      brandName: '',
      englishName: '',
      level: 'CORE_BRAND',
      parentBrandId: '',
      ownerDept: currentUser.department || '品牌中心',
      brandPositioning: '',
      plannedLaunchDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      targetClasses: [21, 3, 10, 35],
      targetMarkets: ['中国', '东南亚'],
      commercialJustification: '',
    });
    setIsProposalModalOpen(true);
  };

  // 打开编辑品牌审批弹窗（支持编辑未提交、被驳回、已撤回申请）
  const handleOpenEditProposal = (proposal: BrandCreationProposal) => {
    setProposalModalMode('EDIT');
    setEditingProposalId(proposal.id);
    setProposalForm({
      brandName: proposal.brandName,
      englishName: proposal.englishName || '',
      level: proposal.level,
      parentBrandId: proposal.parentBrandId || '',
      ownerDept: proposal.ownerDept,
      brandPositioning: proposal.brandPositioning,
      plannedLaunchDate: proposal.plannedLaunchDate || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      targetClasses: proposal.targetClasses || [21, 3, 10, 35],
      targetMarkets: proposal.targetMarkets || ['中国', '东南亚'],
      commercialJustification: proposal.commercialJustification || '',
    });
    setIsProposalModalOpen(true);
  };

  // 保存为【未提交】状态（草稿）
  const handleSaveDraftProposal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!proposalForm.brandName.trim()) {
      showToast('请输入拟建品牌名称');
      return;
    }

    const parentNode = proposalForm.parentBrandId 
      ? flatBrandList.find(b => b.id === proposalForm.parentBrandId) 
      : null;

    if (proposalModalMode === 'EDIT' && editingProposalId) {
      const existing = brandProposals.find(p => p.id === editingProposalId);
      if (existing) {
        const updated: BrandCreationProposal = {
          ...existing,
          brandName: proposalForm.brandName.trim(),
          englishName: proposalForm.englishName.trim() || undefined,
          level: proposalForm.level,
          parentBrandId: proposalForm.level === 'SUB_BRAND' ? (proposalForm.parentBrandId || 'BR-USMILE') : undefined,
          parentBrandName: proposalForm.level === 'SUB_BRAND' ? (parentNode?.name || 'usmile 笑容加') : undefined,
          ownerDept: proposalForm.ownerDept,
          brandPositioning: proposalForm.brandPositioning,
          plannedLaunchDate: proposalForm.plannedLaunchDate,
          targetClasses: proposalForm.targetClasses,
          targetMarkets: proposalForm.targetMarkets,
          commercialJustification: proposalForm.commercialJustification,
          status: 'DRAFT',
          currentStep: 0,
        };
        if (onUpdateBrandProposal) {
          onUpdateBrandProposal(updated);
        }
      }
    } else {
      onCreateBrandProposal({
        brandName: proposalForm.brandName.trim(),
        englishName: proposalForm.englishName.trim() || undefined,
        level: proposalForm.level,
        parentBrandId: proposalForm.level === 'SUB_BRAND' ? (proposalForm.parentBrandId || 'BR-USMILE') : undefined,
        parentBrandName: proposalForm.level === 'SUB_BRAND' ? (parentNode?.name || 'usmile 笑容加') : undefined,
        ownerDept: proposalForm.ownerDept,
        brandPositioning: proposalForm.brandPositioning,
        plannedLaunchDate: proposalForm.plannedLaunchDate,
        targetClasses: proposalForm.targetClasses,
        targetMarkets: proposalForm.targetMarkets,
        commercialJustification: proposalForm.commercialJustification,
      }, true);
    }

    setIsProposalModalOpen(false);
    showToast(`品牌申请【${proposalForm.brandName}】已保存至【未提交】草稿箱`);
  };

  // 直接提交审批（生成审批流进入审批中状态）
  const handleSubmitApprovalProposal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!proposalForm.brandName.trim()) {
      showToast('请输入拟建品牌名称');
      return;
    }
    if (!proposalForm.brandPositioning.trim()) {
      showToast('请输入品牌商业定位说明');
      return;
    }

    const parentNode = proposalForm.parentBrandId 
      ? flatBrandList.find(b => b.id === proposalForm.parentBrandId) 
      : null;

    if (proposalModalMode === 'EDIT' && editingProposalId) {
      const existing = brandProposals.find(p => p.id === editingProposalId);
      if (existing) {
        const updated: BrandCreationProposal = {
          ...existing,
          brandName: proposalForm.brandName.trim(),
          englishName: proposalForm.englishName.trim() || undefined,
          level: proposalForm.level,
          parentBrandId: proposalForm.level === 'SUB_BRAND' ? (proposalForm.parentBrandId || 'BR-USMILE') : undefined,
          parentBrandName: proposalForm.level === 'SUB_BRAND' ? (parentNode?.name || 'usmile 笑容加') : undefined,
          ownerDept: proposalForm.ownerDept,
          brandPositioning: proposalForm.brandPositioning,
          plannedLaunchDate: proposalForm.plannedLaunchDate,
          targetClasses: proposalForm.targetClasses,
          targetMarkets: proposalForm.targetMarkets,
          commercialJustification: proposalForm.commercialJustification,
          status: 'PENDING_APPROVAL',
          currentStep: 1,
          createTime: new Date().toLocaleString('zh-CN'),
          steps: [
            { role: '品牌规划部总监审批', userName: '陈旻 (VP)', status: 'CURRENT', comment: '已提交审批，等待业务评审。' },
            { role: '知产法务部查重审核', userName: '林悦 (知产主管)', status: 'WAITING' },
            { role: '集团副总裁/总经理终审', userName: '唐宁 (总裁)', status: 'WAITING' }
          ]
        };
        if (onUpdateBrandProposal) {
          onUpdateBrandProposal(updated);
        }
        if (onSubmitBrandProposal) {
          onSubmitBrandProposal(editingProposalId);
        }
      }
    } else {
      onCreateBrandProposal({
        brandName: proposalForm.brandName.trim(),
        englishName: proposalForm.englishName.trim() || undefined,
        level: proposalForm.level,
        parentBrandId: proposalForm.level === 'SUB_BRAND' ? (proposalForm.parentBrandId || 'BR-USMILE') : undefined,
        parentBrandName: proposalForm.level === 'SUB_BRAND' ? (parentNode?.name || 'usmile 笑容加') : undefined,
        ownerDept: proposalForm.ownerDept,
        brandPositioning: proposalForm.brandPositioning,
        plannedLaunchDate: proposalForm.plannedLaunchDate,
        targetClasses: proposalForm.targetClasses,
        targetMarkets: proposalForm.targetMarkets,
        commercialJustification: proposalForm.commercialJustification,
      }, false);
    }

    setIsProposalModalOpen(false);
    showToast(`品牌【${proposalForm.brandName}】审批申请已成功提交，已推送到审批中心！`);
  };

  // 确认撤回
  const handleConfirmWithdraw = () => {
    if (!withdrawingProposal) return;
    if (onWithdrawBrandProposal) {
      onWithdrawBrandProposal(withdrawingProposal.id, withdrawReasonInput.trim() || '提交人主动撤回申请，重新完善定位与商标类目规划。');
    }
    showToast(`已成功撤回品牌【${withdrawingProposal.brandName}】的审批申请`);
    setWithdrawingProposal(null);
    setWithdrawReasonInput('');
    if (selectedProposalDetail?.id === withdrawingProposal.id) {
      setSelectedProposalDetail(null);
    }
  };

  // 确认取消
  const handleConfirmCancel = () => {
    if (!cancellingProposal) return;
    if (onCancelBrandProposal) {
      onCancelBrandProposal(cancellingProposal.id, cancelReasonInput.trim() || '业务规划调整，已终止该品牌立项。');
    }
    showToast(`已取消品牌【${cancellingProposal.brandName}】的立项流程，状态已更新为【已取消】`);
    setCancellingProposal(null);
    setCancelReasonInput('');
    if (selectedProposalDetail?.id === cancellingProposal.id) {
      setSelectedProposalDetail(null);
    }
  };

  // 过滤搜索后的一级品牌列表
  const filteredBrandTree = useMemo(() => {
    if (!searchQuery.trim()) return brandTree;
    const q = searchQuery.toLowerCase();
    return brandTree.filter(b => {
      const matchSelf = b.name.toLowerCase().includes(q) || 
        (b.englishName && b.englishName.toLowerCase().includes(q)) ||
        b.code.toLowerCase().includes(q);
      const matchChild = b.children?.some(c => 
        c.name.toLowerCase().includes(q) || 
        (c.englishName && c.englishName.toLowerCase().includes(q))
      );
      return matchSelf || matchChild;
    });
  }, [brandTree, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Toast 提示 (页面居中显示) */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] max-w-md px-6 py-4 bg-slate-900/95 backdrop-blur-md text-white text-sm font-semibold rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-slate-700/80 pointer-events-none text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}



      {/* ========================================================= */}
      {/* 简明品牌管理 (品牌列表 + 支持二级子品牌) */}
      {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* 左侧 4 列：品牌清单与简易子品牌管理 */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 flex flex-col min-h-[560px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-slate-900">品牌清单</h3>
                <span className="text-[11px] text-slate-700 font-medium">({brandTree.length} 个品牌)</span>
              </div>
              <button
                type="button"
                onClick={handleOpenAddPrimaryBrand}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>添加</span>
              </button>
            </div>

            {/* 简易搜索 */}
            <div className="relative">
              <input
                type="text"
                placeholder="搜索品牌名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 品牌卡片列表 */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-[520px]">
              {filteredBrandTree.map(brand => {
                const isSelected = selectedBrandId === brand.id;
                const hasSubBrands = brand.children && brand.children.length > 0;
                const isExpanded = expandedBrandIds.has(brand.id);

                return (
                  <div key={brand.id} className="space-y-1">
                    {/* 品牌行 */}
                    <div
                      onClick={() => setSelectedBrandId(brand.id)}
                      className={`group flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 text-blue-900 font-semibold shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* 展开/折叠二级子品牌按钮 */}
                        {hasSubBrands ? (
                          <button
                            type="button"
                            onClick={(e) => toggleSubBrandExpand(brand.id, e)}
                            className="w-4 h-4 flex items-center justify-center text-slate-700 hover:text-slate-900 shrink-0"
                            title={isExpanded ? '折叠二级子品牌' : '展开二级子品牌'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
                            )}
                          </button>
                        ) : (
                          <span className="w-4 shrink-0 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          </span>
                        )}

                        <span className="truncate font-bold text-xs text-slate-900">
                          {brand.name}
                        </span>
                      </div>

                      {/* 右侧：商标件数与快捷加子品牌 */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-xs text-slate-800 font-mono font-semibold">
                          <strong className="text-slate-900">{brand.trademarkCount || 0}</strong> 件
                        </span>

                        {/* 快捷为该品牌添加二级子品牌 */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenAddSubBrand(brand, e)}
                          title="添加二级子品牌"
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* 二级子品牌列表（若有且已展开） */}
                    {hasSubBrands && isExpanded && (
                      <div className="ml-5 pl-2.5 border-l-2 border-slate-300 space-y-1">
                        {brand.children!.map(sub => {
                          const isSubSelected = selectedBrandId === sub.id;
                          return (
                            <div
                              key={sub.id}
                              onClick={() => setSelectedBrandId(sub.id)}
                              className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                isSubSelected
                                  ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="px-1 py-0.2 rounded text-[9px] bg-slate-200 text-slate-800 font-bold shrink-0">
                                  子品牌
                                </span>
                                <span className="truncate font-semibold text-slate-900">{sub.name}</span>
                              </div>
                              <span className="text-xs text-slate-800 font-mono font-semibold shrink-0 ml-1">
                                {sub.trademarkCount || 0} 件
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右侧 8 列：选中品牌详情、核心类别与挂载商标 */}
          <div className="lg:col-span-8 space-y-4">
            {selectedBrand ? (
              <>
                {/* 1. 品牌基本信息卡片 */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {selectedBrand.level === 'CORE_BRAND' ? '主品牌' : '二级子品牌'}
                        </span>
                        <h2 className="text-base font-bold text-slate-900">{selectedBrand.name}</h2>
                        <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold border border-slate-200">
                          {selectedBrand.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
                        {selectedBrand.description || '暂无品牌商业定位说明'}
                      </p>
                    </div>

                    {/* 操作：快速为此品牌建案申报 / 编辑 */}
                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigateToFiling && (
                        <button
                          type="button"
                          onClick={() => onNavigateToFiling(selectedBrand.name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>为此品牌发起商标申请</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNode(selectedBrand);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                        title="编辑品牌信息"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {brandTree.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`确定要删除品牌【${selectedBrand.name}】吗？`)) {
                              onDeleteBrandNode(selectedBrand.id);
                              setSelectedBrandId(brandTree[0].id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                          title="删除品牌"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 品牌属性指标 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-600 font-medium block mb-0.5">归属部门</span>
                      <span className="font-bold text-slate-900 truncate block">{selectedBrand.ownerDept}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-600 font-medium block mb-0.5">品牌负责人</span>
                      <span className="font-bold text-slate-900 truncate block">{selectedBrand.ownerName}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-600 font-medium block mb-0.5">规划市场法域</span>
                      <span className="font-bold text-slate-900 truncate block">{selectedBrand.targetMarkets?.join(' · ') || '中国'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-600 font-medium block mb-0.5">在案商标数量</span>
                      <span className="font-bold text-slate-900 font-mono block">{(selectedBrand.trademarkCount !== undefined && selectedBrand.trademarkCount > 0) ? selectedBrand.trademarkCount : (selectedBrandTrademarks.length || 0)} 件</span>
                    </div>
                  </div>
                </div>

                {/* 2. 下属二级子品牌管理卡片（如果当前选中的是一级品牌，清晰展示并支持未来随时扩展） */}
                {selectedBrand.level === 'CORE_BRAND' && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-slate-800" />
                        <h3 className="text-xs font-bold text-slate-900">
                          下属二级子品牌 / 系列 ({selectedBrand.children?.length || 0} 个)
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenAddSubBrand(selectedBrand)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>添加二级子品牌</span>
                      </button>
                    </div>

                    {selectedBrand.children && selectedBrand.children.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedBrand.children.map(sub => (
                          <div
                            key={sub.id}
                            onClick={() => setSelectedBrandId(sub.id)}
                            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-xs">{sub.name}</span>
                              </div>
                              <p className="text-xs text-slate-700 mt-0.5 line-clamp-1">
                                {sub.description || '二级业务子品牌'}
                              </p>
                            </div>
                            <span className="text-xs text-slate-900 font-mono font-bold shrink-0 ml-2">
                              {sub.trademarkCount || 0} 件
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-slate-600 bg-slate-50/50 rounded-lg border border-dashed border-slate-300 text-xs">
                        当前暂无二级子品牌。如需对产品线或细分品类进行独立管理，可随时点击右上角添加。
                      </div>
                    )}
                  </div>
                )}

                {/* 3. 核心商标类别现状 */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-900">核心类别保护现状</h3>
                    <span className="text-xs text-slate-700 font-medium">
                      已覆盖 <strong className="text-slate-900">{categoryStats.coveredCount}</strong> / {CORE_NICE_CLASSES.length} 个核心类别
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CORE_NICE_CLASSES.map(cls => {
                      const isCovered = categoryStats.coveredList.some(c => c.classNum === cls.classNum);
                      const isTarget = selectedBrand.targetCategories?.includes(cls.classNum);

                      return (
                        <div
                          key={cls.classNum}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            isCovered
                              ? 'bg-slate-50 border-slate-200 text-slate-900'
                              : isTarget
                                ? 'bg-blue-50/40 border-blue-200 text-slate-900'
                                : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${isCovered ? 'text-slate-900' : 'text-slate-700'}`}>
                              第 {cls.classNum} 类
                            </span>
                            <span className="truncate text-slate-800">{cls.name}</span>
                          </div>

                          <div className="shrink-0 ml-2">
                            {isCovered ? (
                              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">
                                已获保护
                              </span>
                            ) : isTarget ? (
                              <button
                                type="button"
                                onClick={() => onNavigateToFiling && onNavigateToFiling(`${selectedBrand.name} 第${cls.classNum}类`)}
                                className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-semibold hover:bg-blue-700 cursor-pointer"
                              >
                                申请
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-medium">未规划</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. 挂载在案商标明细 */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-900">
                      挂载在案商标明细 (已录入 {selectedBrandTrademarks.length} 件 / 在案总量 {selectedBrand.trademarkCount || selectedBrandTrademarks.length} 件)
                    </h3>
                    <span className="text-[11px] text-slate-600 font-medium">与台账实时联动</span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {selectedBrandTrademarks.length > 0 ? (
                      selectedBrandTrademarks.map(tm => (
                        <div key={tm.id} className="py-2 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-[11px]">
                              {tm.name.slice(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{tm.name}</span>
                                <span className="font-mono text-[11px] text-slate-700 font-semibold">#{tm.regNumber}</span>
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 font-mono text-[10px] font-medium border border-slate-200">
                                  第 {tm.classes.join(', ')} 类
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                              {tm.status === 'REGISTERED' ? '已注册' : '审查中'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-600 text-xs">
                        暂无挂载商标，可点击上方为此品牌发起商标建案
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                <FolderTree className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs">请在左侧选择一个品牌查看详情</p>
              </div>
            )}
          </div>

        </div>


      {/* ========================================================= */}
      {/* 模态框 1: 新增品牌（主品牌 / 二级子品牌） */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {addMode.level === 'PRIMARY' ? '新增主品牌' : `为【${addMode.parentBrand?.name}】添加二级子品牌`}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  品牌中文名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="如：usmile 笑容加、密浪"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">英文名称 (选填)</label>
                  <input
                    type="text"
                    placeholder="如：usmile、Waves"
                    value={brandForm.englishName}
                    onChange={(e) => setBrandForm({ ...brandForm, englishName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">品牌编码</label>
                  <input
                    type="text"
                    value={brandForm.code}
                    onChange={(e) => setBrandForm({ ...brandForm, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">归属事业部</label>
                  <input
                    type="text"
                    value={brandForm.ownerDept}
                    onChange={(e) => setBrandForm({ ...brandForm, ownerDept: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">品牌负责人</label>
                  <input
                    type="text"
                    value={brandForm.ownerName}
                    onChange={(e) => setBrandForm({ ...brandForm, ownerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">品牌商业定位与说明</label>
                <textarea
                  rows={2}
                  placeholder="简述品牌核心品类与定位..."
                  value={brandForm.description}
                  onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-2xs cursor-pointer"
                >
                  确认保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 模态框 2: 新建 / 编辑品牌审批申请（支持保存为未提交与直接提交审批） */}
      {/* ========================================================= */}
      {isProposalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {proposalModalMode === 'CREATE' ? '发起新建品牌申请' : '编辑品牌审批申请'}
                </h3>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                  {proposalModalMode === 'CREATE' ? '全新拟建' : '完善后重新提交'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsProposalModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitApprovalProposal} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    拟建品牌中文名称 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如：usmile 密浪"
                    value={proposalForm.brandName}
                    onChange={(e) => setProposalForm({ ...proposalForm, brandName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">英文名称 (选填)</label>
                  <input
                    type="text"
                    placeholder="如：Waves"
                    value={proposalForm.englishName}
                    onChange={(e) => setProposalForm({ ...proposalForm, englishName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">拟建层级</label>
                  <select
                    value={proposalForm.level}
                    onChange={(e) => setProposalForm({ ...proposalForm, level: e.target.value as BrandLevel })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="CORE_BRAND">主品牌（独立品牌体系）</option>
                    <option value="SUB_BRAND">业务子品牌（挂载于主品牌）</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {proposalForm.level === 'SUB_BRAND' ? '所属上级主品牌 *' : '所属上级品牌'}
                  </label>
                  <select
                    disabled={proposalForm.level === 'CORE_BRAND'}
                    value={proposalForm.parentBrandId}
                    onChange={(e) => setProposalForm({ ...proposalForm, parentBrandId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-100 cursor-pointer"
                  >
                    {proposalForm.level === 'CORE_BRAND' ? (
                      <option value="">（独立主品牌，无需上级）</option>
                    ) : (
                      <>
                        <option value="">请选择上级主品牌...</option>
                        {brandTree.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">需求发起部门</label>
                  <input
                    type="text"
                    value={proposalForm.ownerDept}
                    onChange={(e) => setProposalForm({ ...proposalForm, ownerDept: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">计划上市/发布时间</label>
                  <input
                    type="date"
                    value={proposalForm.plannedLaunchDate}
                    onChange={(e) => setProposalForm({ ...proposalForm, plannedLaunchDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">规划保护尼斯类别</label>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  {[21, 3, 5, 9, 10, 11, 29, 30, 35, 42, 44].map(c => {
                    const isSelected = proposalForm.targetClasses.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => {
                          setProposalForm(prev => ({
                            ...prev,
                            targetClasses: isSelected 
                              ? prev.targetClasses.filter(x => x !== c)
                              : [...prev.targetClasses, c].sort((a, b) => a - b)
                          }));
                        }}
                        className={`px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        第{c}类
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  品牌商业定位与说明 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="说明该品牌的市场定位、目标消费人群、核心产品线及商业规划..."
                  value={proposalForm.brandPositioning}
                  onChange={(e) => setProposalForm({ ...proposalForm, brandPositioning: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">商业必要性与立项依据</label>
                <textarea
                  rows={2}
                  placeholder="补充说明立项背景、竞争差异化优势或海外扩张计划..."
                  value={proposalForm.commercialJustification}
                  onChange={(e) => setProposalForm({ ...proposalForm, commercialJustification: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* 底部操作区：支持保存草稿（未提交）与直接提交审批 */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsProposalModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium cursor-pointer"
                >
                  取消
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraftProposal}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-500" />
                    <span>保存为未提交</span>
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>提交审批</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 模态框 3: 审批申请详情弹窗 */}
      {/* ========================================================= */}
      {selectedProposalDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* 顶栏 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  品牌审批详情 - {selectedProposalDetail.brandName}
                </h3>
                <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedProposalDetail.proposalNo}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProposalDetail(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 状态通知横幅 */}
            {selectedProposalDetail.status === 'DRAFT' && (
              <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-slate-600" />
                  <span>当前处于<strong>【未提交】</strong>草稿状态，尚未推送到审批中心，可随时修改或提交。</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditProposal(selectedProposalDetail);
                    setSelectedProposalDetail(null);
                  }}
                  className="px-2.5 py-1 rounded bg-blue-600 text-white font-medium text-xs hover:bg-blue-700"
                >
                  去编辑/提交
                </button>
              </div>
            )}

            {selectedProposalDetail.status === 'WITHDRAWN' && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <Undo2 className="w-4 h-4 text-amber-700" />
                  <span>该品牌申请已由提交人主动【已撤回】</span>
                </div>
                {selectedProposalDetail.withdrawReason && (
                  <p className="text-amber-800 text-[11px] pl-6">
                    撤回原因：{selectedProposalDetail.withdrawReason}（撤回时间：{selectedProposalDetail.withdrawTime}）
                  </p>
                )}
              </div>
            )}

            {selectedProposalDetail.status === 'CANCELLED' && (
              <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-800 space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <Ban className="w-4 h-4 text-slate-600" />
                  <span>该品牌立项流程已终止【已取消】</span>
                </div>
                {selectedProposalDetail.cancelReason && (
                  <p className="text-slate-600 text-[11px] pl-6">
                    取消原因：{selectedProposalDetail.cancelReason}（取消时间：{selectedProposalDetail.cancelTime}）
                  </p>
                )}
              </div>
            )}

            {selectedProposalDetail.status === 'REJECTED' && (
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900 space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-700" />
                  <span>该品牌审批申请已【被驳回】</span>
                </div>
                {selectedProposalDetail.rejectionReason && (
                  <p className="text-rose-800 text-[11px] pl-6">
                    驳回原因：{selectedProposalDetail.rejectionReason}
                  </p>
                )}
              </div>
            )}

            {selectedProposalDetail.status === 'APPROVED' && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>该品牌审批已全票通过并<strong>【已入库】</strong>，已自动生成品牌树节点并建立商标预警台账。</span>
              </div>
            )}

            {/* 审批进度历程 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>全链路审批流</span>
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(selectedProposalDetail.steps || []).map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2.5 rounded-lg border ${
                      step.status === 'APPROVED' 
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' 
                        : step.status === 'CURRENT'
                          ? 'bg-blue-50/80 border-blue-200 text-blue-800'
                          : step.status === 'REJECTED'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[11px]">
                      <span>{step.role}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                        step.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 font-bold' :
                        step.status === 'CURRENT' ? 'bg-blue-100 text-blue-700 font-bold' :
                        step.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {step.status === 'APPROVED' ? '已通过' : step.status === 'CURRENT' ? '审核中' : step.status === 'REJECTED' ? '已驳回' : '等待中'}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">审批人：{step.userName}</div>
                    {step.comment && (
                      <p className="mt-1 text-[10px] text-slate-500 bg-white/70 p-1.5 rounded border border-slate-100">
                        "{step.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 品牌申请详情元数据 */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[11px]">拟建层级</span>
                <span className="font-medium text-slate-900 mt-0.5 block">
                  {selectedProposalDetail.level === 'CORE_BRAND' ? '独立主品牌' : `二级业务子品牌（所属：${selectedProposalDetail.parentBrandName || 'usmile'}）`}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[11px]">需求部门 / 申请人</span>
                <span className="font-medium text-slate-900 mt-0.5 block">
                  {selectedProposalDetail.ownerDept} · {selectedProposalDetail.initiatorName}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[11px]">规划尼斯分类</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(selectedProposalDetail.targetClasses || [21, 3, 10]).map(c => (
                    <span key={c} className="px-1.5 py-0.2 rounded bg-white text-slate-800 border border-slate-200 font-mono text-[10px]">
                      第{c}类
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[11px]">目标法域市场</span>
                <span className="font-medium text-slate-900 mt-0.5 block">
                  {(selectedProposalDetail.targetMarkets || ['中国']).join('、')}
                </span>
              </div>
            </div>

            {/* 商业规划说明 */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-slate-800">品牌定位与规划说明</h4>
              <p className="p-3 bg-slate-50 rounded-lg text-slate-700 leading-relaxed border border-slate-100">
                {selectedProposalDetail.brandPositioning}
              </p>
            </div>

            {/* 商业必要性 */}
            {selectedProposalDetail.commercialJustification && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-800">商业必要性与申请依据</h4>
                <p className="p-3 bg-slate-50 rounded-lg text-slate-700 leading-relaxed border border-slate-100">
                  {selectedProposalDetail.commercialJustification}
                </p>
              </div>
            )}

            {/* 底部操作 */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                申请单号：{selectedProposalDetail.proposalNo} · 提交时间：{selectedProposalDetail.createTime}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProposalDetail(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium cursor-pointer"
                >
                  关闭
                </button>

                {/* 未提交状态详情底栏操作 */}
                {selectedProposalDetail.status === 'DRAFT' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setCancellingProposal(selectedProposalDetail);
                        setCancelReasonInput('');
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium cursor-pointer"
                    >
                      取消立项
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onSubmitBrandProposal) {
                          onSubmitBrandProposal(selectedProposalDetail.id);
                          showToast(`已提交品牌【${selectedProposalDetail.brandName}】审批`);
                          setSelectedProposalDetail(null);
                        }
                      }}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>立即提交审批</span>
                    </button>
                  </>
                )}

                {/* 审批中状态详情底栏操作 */}
                {selectedProposalDetail.status === 'PENDING_APPROVAL' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawingProposal(selectedProposalDetail);
                        setWithdrawReasonInput('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-medium cursor-pointer"
                    >
                      申请人撤回
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRejectBrandProposal(selectedProposalDetail.id);
                        showToast(`已驳回品牌【${selectedProposalDetail.brandName}】申请`);
                        setSelectedProposalDetail(null);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium cursor-pointer"
                    >
                      驳回申请
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onApproveBrandProposal(selectedProposalDetail.id);
                        showToast(`品牌【${selectedProposalDetail.brandName}】审批通过并已入库！`);
                        setSelectedProposalDetail(null);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs cursor-pointer"
                    >
                      通过审批并入库
                    </button>
                  </>
                )}

                {/* 被驳回 / 已撤回状态详情底栏操作 */}
                {(selectedProposalDetail.status === 'REJECTED' || selectedProposalDetail.status === 'WITHDRAWN') && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setCancellingProposal(selectedProposalDetail);
                        setCancelReasonInput('');
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium cursor-pointer"
                    >
                      取消立项
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenEditProposal(selectedProposalDetail);
                        setSelectedProposalDetail(null);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>重新编辑并提交</span>
                    </button>
                  </>
                )}

                {/* 已入库状态操作 */}
                {selectedProposalDetail.status === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedProposalDetail.approvedNodeId) {
                        setSelectedBrandId(selectedProposalDetail.approvedNodeId);
                      }
                      setSelectedProposalDetail(null);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    <span>前往查看品牌</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 模态框 4: 撤回确认弹窗 */}
      {/* ========================================================= */}
      {withdrawingProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Undo2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">撤回品牌审批申请</h3>
              </div>
              <button
                type="button"
                onClick={() => setWithdrawingProposal(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              您正在撤回品牌【<strong className="text-slate-900">{withdrawingProposal.brandName}</strong>】（单号：{withdrawingProposal.proposalNo}）的审批申请。撤回后该申请将变为【已撤回】状态，审批中心的工作流也将自动中止。
            </p>

            <div className="space-y-1 text-xs">
              <label className="block font-medium text-slate-700">撤回原因说明 (选填)</label>
              <textarea
                rows={2}
                value={withdrawReasonInput}
                onChange={(e) => setWithdrawReasonInput(e.target.value)}
                placeholder="如：需重新梳理商业定位，调整申报类目范围..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setWithdrawingProposal(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                className="px-4 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 text-xs shadow-2xs cursor-pointer"
              >
                确认撤回申请
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 模态框 5: 取消立项确认弹窗 */}
      {/* ========================================================= */}
      {cancellingProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Ban className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">取消品牌立项</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancellingProposal(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              您正在取消品牌【<strong className="text-slate-900">{cancellingProposal.brandName}</strong>】（单号：{cancellingProposal.proposalNo}）的立项流程。取消后状态将变为【已取消】，终止后续立项与建案。
            </p>

            <div className="space-y-1 text-xs">
              <label className="block font-medium text-slate-700">取消原因说明 (选填)</label>
              <textarea
                rows={2}
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                placeholder="如：业务战略规划调整，暂不立项..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingProposal(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium cursor-pointer"
              >
                返回
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-900 text-xs shadow-2xs cursor-pointer"
              >
                确认取消立项
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 模态框 6: 编辑品牌信息 */}
      {/* ========================================================= */}
      {isEditModalOpen && editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">编辑品牌信息 - {editingNode.name}</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">品牌中文名称</label>
                <input
                  type="text"
                  required
                  value={editingNode.name}
                  onChange={(e) => setEditingNode({ ...editingNode, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">英文名称</label>
                  <input
                    type="text"
                    value={editingNode.englishName || ''}
                    onChange={(e) => setEditingNode({ ...editingNode, englishName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">归属部门</label>
                  <input
                    type="text"
                    value={editingNode.ownerDept}
                    onChange={(e) => setEditingNode({ ...editingNode, ownerDept: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">品牌描述 / 商业定位</label>
                <textarea
                  rows={2}
                  value={editingNode.description || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-2xs cursor-pointer"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};