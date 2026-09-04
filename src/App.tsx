import React, { useState } from 'react';
import { 
  NavigationTab, 
  TrademarkItem, 
  ApplicationDraft, 
  EnforcementCase, 
  MonitoringAlert, 
  AgencyPartner, 
  ApprovalWorkflow, 
  UserProfile,
  CaseManagementItem,
  TrademarkApplicationProposal,
  BrandTreeNode,
  BrandCreationProposal,
  BrandProposalStatus,
  SystemSettingsSubTab
} from './types';
import { 
  CURRENT_USER, 
  INITIAL_TRADEMARKS, 
  INITIAL_DRAFTS, 
  INITIAL_MONITORING_ALERTS, 
  INITIAL_ENFORCEMENT_CASES, 
  INITIAL_AGENCIES, 
  INITIAL_APPROVALS,
  INITIAL_CASE_MANAGEMENT_ITEMS
} from './data/mockData';
import { 
  INITIAL_BRAND_TREE, 
  INITIAL_BRAND_PROPOSALS 
} from './data/brandTreeData';
import { TopNavbar } from './components/TopNavbar';
import { Dashboard } from './components/Dashboard';
import { ApplicationCenter } from './components/ApplicationCenter';
import { PortfolioLedger } from './components/PortfolioLedger';
import { EnforcementCenter } from './components/EnforcementCenter';
import { MonitoringRadar } from './components/MonitoringRadar';
import { AgencyCollaboration } from './components/AgencyCollaboration';
import { ApprovalCenter } from './components/ApprovalCenter';
import { NiceClassificationTool } from './components/NiceClassificationTool';
import { SystemSettings } from './components/SystemSettings';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { AuthModal } from './components/AuthModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { BrandTreeManagement } from './components/BrandTreeManagement';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);

  // Core Data state
  const [trademarks, setTrademarks] = useState<TrademarkItem[]>(INITIAL_TRADEMARKS);
  const [caseManagementItems, setCaseManagementItems] = useState<CaseManagementItem[]>(INITIAL_CASE_MANAGEMENT_ITEMS);
  const [drafts, setDrafts] = useState<ApplicationDraft[]>(INITIAL_DRAFTS);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>(INITIAL_MONITORING_ALERTS);
  const [enforcementCases, setEnforcementCases] = useState<EnforcementCase[]>(INITIAL_ENFORCEMENT_CASES);
  const [agencies, setAgencies] = useState<AgencyPartner[]>(INITIAL_AGENCIES);
  const [approvals, setApprovals] = useState<ApprovalWorkflow[]>(INITIAL_APPROVALS);

  // 品牌树与新建品牌审批数据状态
  const [brandTree, setBrandTree] = useState<BrandTreeNode[]>(INITIAL_BRAND_TREE);
  const [brandProposals, setBrandProposals] = useState<BrandCreationProposal[]>(INITIAL_BRAND_PROPOSALS);

  // 系统管理二级菜单状态 (国家地区映射表、申请人主体映射表、承办代理机构映射表、组织与权限、飞书与外部集成、安全审计日志)
  const [settingsSubTab, setSettingsSubTab] = useState<SystemSettingsSubTab>('COUNTRY_REGION_MAPPING');

  // Selected entities for modals
  const [selectedTrademark, setSelectedTrademark] = useState<TrademarkItem | null>(null);

  // Modals visibility
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ==========================================
  // 品牌管理与审批业务逻辑 (一级品牌 + 二级子品牌)
  // ==========================================
  // 向品牌树插入新节点（根节点一级品牌或某一级品牌下的二级子品牌）
  const insertNodeIntoTree = (nodes: BrandTreeNode[], newNode: BrandTreeNode, targetParentId?: string | null): BrandTreeNode[] => {
    if (!targetParentId) {
      return [...nodes, newNode];
    }
    return nodes.map(node => {
      if (node.id === targetParentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode]
        };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: insertNodeIntoTree(node.children, newNode, targetParentId)
        };
      }
      return node;
    });
  };

  // 递归更新树中节点
  const updateNodeInTree = (nodes: BrandTreeNode[], updatedNode: BrandTreeNode): BrandTreeNode[] => {
    return nodes.map(node => {
      if (node.id === updatedNode.id) {
        return { ...node, ...updatedNode };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: updateNodeInTree(node.children, updatedNode)
        };
      }
      return node;
    });
  };

  // 递归删除树中节点
  const deleteNodeInTree = (nodes: BrandTreeNode[], targetId: string): BrandTreeNode[] => {
    return nodes
      .filter(node => node.id !== targetId)
      .map(node => {
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: deleteNodeInTree(node.children, targetId)
          };
        }
        return node;
      });
  };

  // 1. 直接新增品牌节点
  const handleAddBrandNode = (partialNode: Partial<BrandTreeNode>, parentId?: string | null) => {
    const isPrimary = !parentId;
    const newNode: BrandTreeNode = {
      id: partialNode.id || `BR-${Date.now().toString().slice(-6)}`,
      name: partialNode.name || '新品牌',
      englishName: partialNode.englishName,
      code: partialNode.code || (isPrimary ? `BR-00${brandTree.length + 1}` : `BR-SUB-${Math.floor(Math.random() * 900 + 100)}`),
      level: isPrimary ? 'CORE_BRAND' : 'SUB_BRAND',
      parentId: parentId || null,
      description: partialNode.description,
      ownerDept: partialNode.ownerDept || currentUser.department || '品牌中心',
      ownerName: partialNode.ownerName || currentUser.name,
      status: partialNode.status || 'ACTIVE',
      launchDate: partialNode.launchDate || new Date().toISOString().slice(0, 10),
      targetCategories: partialNode.targetCategories || [21, 3, 10, 35],
      targetMarkets: partialNode.targetMarkets || ['中国'],
      trademarkCount: 0,
      pendingCount: 0,
      disputeCount: 0,
      children: []
    };

    setBrandTree(prev => insertNodeIntoTree(prev, newNode, parentId));
    showToast(`${isPrimary ? '一级品牌' : '二级子品牌'}【${newNode.name}】已成功添加！`);
  };

  // 2. 更新品牌节点
  const handleUpdateBrandNode = (node: BrandTreeNode) => {
    setBrandTree(prev => updateNodeInTree(prev, node));
    showToast(`品牌【${node.name}】信息已更新`);
  };

  // 3. 删除品牌节点
  const handleDeleteBrandNode = (id: string) => {
    setBrandTree(prev => deleteNodeInTree(prev, id));
    showToast('品牌节点已删除');
  };

  // 4. 需求人发起新建品牌立项审批 / 保存为未提交草稿
  const handleCreateBrandProposal = (partialProposal: Partial<BrandCreationProposal>, isDraft = false) => {
    const status: BrandProposalStatus = isDraft ? 'DRAFT' : 'PENDING_APPROVAL';
    const newProposal: BrandCreationProposal = {
      id: partialProposal.id || `BP-${Date.now()}`,
      proposalNo: partialProposal.proposalNo || `BP${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 900 + 100)}`,
      brandName: partialProposal.brandName || '新建品牌',
      englishName: partialProposal.englishName,
      level: partialProposal.level || 'SUB_BRAND',
      parentBrandId: partialProposal.parentBrandId || 'BR-USMILE',
      parentBrandName: partialProposal.parentBrandName || 'usmile 笑容加',
      ownerDept: partialProposal.ownerDept || currentUser.department,
      initiatorName: currentUser.name,
      initiatorAvatar: currentUser.avatar,
      createTime: new Date().toLocaleString('zh-CN'),
      brandPositioning: partialProposal.brandPositioning || '品牌商业定位',
      plannedLaunchDate: partialProposal.plannedLaunchDate || new Date().toISOString().slice(0, 10),
      targetClasses: partialProposal.targetClasses || [21, 3, 10],
      targetMarkets: partialProposal.targetMarkets || ['中国'],
      commercialJustification: partialProposal.commercialJustification || '商业必要性',
      preliminaryRiskNotes: isDraft ? '草稿状态，尚未提交法务查重。' : '法务系统自动建立初步检索台账，等待查重团队多维交叉比对。',
      status,
      currentStep: isDraft ? 0 : 1,
      steps: [
        { role: '品牌规划部总监审批', userName: '陈旻 (VP)', status: isDraft ? 'WAITING' : 'CURRENT', comment: isDraft ? undefined : '等待业务与定位评审。' },
        { role: '知产法务部查重审核', userName: '林悦 (知产主管)', status: 'WAITING' },
        { role: '集团副总裁/总经理终审', userName: '唐宁 (总裁)', status: 'WAITING' }
      ]
    };

    setBrandProposals([newProposal, ...brandProposals]);
    
    // 如果直接提交审批，同步在审批中心生成审批单
    if (!isDraft) {
      const newApprovalWorkflow: ApprovalWorkflow = {
        id: `APV-BP-${newProposal.id}`,
        title: `新建品牌审批 - ${newProposal.brandName}`,
        type: 'NEW_BRAND_CREATION',
        initiator: {
          name: currentUser.name,
          dept: newProposal.ownerDept,
          avatar: currentUser.avatar
        },
        createTime: new Date().toLocaleDateString('zh-CN'),
        status: 'PENDING',
        currentStep: 1,
        brandProposalId: newProposal.id,
        steps: [
          { role: '品牌规划部总监审批', userName: '陈旻 (VP)', status: 'CURRENT', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { role: '知产法务部查重审核', userName: '林悦 (知产主管)', status: 'WAITING' },
          { role: '集团副总裁终审', userName: '唐宁 (总裁)', status: 'WAITING' }
        ],
        details: {
          '拟建品牌': newProposal.brandName,
          '所属层级': newProposal.level === 'CORE_BRAND' ? '主品牌' : '业务子品牌',
          '需求部门': newProposal.ownerDept,
          '商业定位': newProposal.brandPositioning
        }
      };
      setApprovals([newApprovalWorkflow, ...approvals]);
      showToast(`新建品牌申请【${newProposal.brandName}】已提交，已生成审批单并进入多级审批流！`);
    } else {
      showToast(`新建品牌【${newProposal.brandName}】已保存为未提交草稿，可在列表随时编辑或发起审批。`);
    }
  };

  // 更新现有品牌申请（草稿/被驳回/已撤回修改）
  const handleUpdateBrandProposal = (updatedProposal: BrandCreationProposal) => {
    setBrandProposals(prev => prev.map(p => p.id === updatedProposal.id ? updatedProposal : p));
    showToast(`品牌申请【${updatedProposal.brandName}】信息已更新！`);
  };

  // 提交未提交/被驳回/已撤回的品牌申请进入审批流
  const handleSubmitBrandProposal = (proposalId: string) => {
    const target = brandProposals.find(p => p.id === proposalId);
    if (!target) return;

    setBrandProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          status: 'PENDING_APPROVAL',
          currentStep: 1,
          createTime: new Date().toLocaleString('zh-CN'),
          steps: [
            { role: '品牌规划部总监审批', userName: '陈旻 (VP)', status: 'CURRENT', comment: '重新发起审批，等待业务评审。' },
            { role: '知产法务部查重审核', userName: '林悦 (知产主管)', status: 'WAITING' },
            { role: '集团副总裁/总经理终审', userName: '唐宁 (总裁)', status: 'WAITING' }
          ]
        };
      }
      return p;
    }));

    // 同步更新或新增审批中心的审批单
    const existingApv = approvals.find(a => a.brandProposalId === proposalId || a.id === `APV-BP-${proposalId}`);
    if (existingApv) {
      setApprovals(prev => prev.map(a => {
        if (a.id === existingApv.id) {
          return {
            ...a,
            status: 'PENDING',
            currentStep: 1,
            steps: a.steps.map((s, idx) => ({
              ...s,
              status: idx === 0 ? 'CURRENT' : 'WAITING',
              timestamp: idx === 0 ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
            }))
          };
        }
        return a;
      }));
    } else {
      const newApv: ApprovalWorkflow = {
        id: `APV-BP-${target.id}`,
        title: `新建品牌审批 - ${target.brandName}`,
        type: 'NEW_BRAND_CREATION',
        initiator: {
          name: target.initiatorName || currentUser.name,
          dept: target.ownerDept,
          avatar: target.initiatorAvatar || currentUser.avatar
        },
        createTime: new Date().toLocaleDateString('zh-CN'),
        status: 'PENDING',
        currentStep: 1,
        brandProposalId: target.id,
        steps: [
          { role: '品牌规划部总监审批', userName: '陈旻 (VP)', status: 'CURRENT', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { role: '知产法务部查重审核', userName: '林悦 (知产主管)', status: 'WAITING' },
          { role: '集团副总裁终审', userName: '唐宁 (总裁)', status: 'WAITING' }
        ],
        details: {
          '拟建品牌': target.brandName,
          '所属层级': target.level === 'CORE_BRAND' ? '主品牌' : '业务子品牌',
          '需求部门': target.ownerDept,
          '商业定位': target.brandPositioning
        }
      };
      setApprovals([newApv, ...approvals]);
    }

    showToast(`品牌【${target.brandName}】已正式提交审批，触发多级审批流！`);
  };

  // 提交人撤回审批
  const handleWithdrawBrandProposal = (proposalId: string, reason?: string) => {
    const target = brandProposals.find(p => p.id === proposalId);
    if (!target) return;

    setBrandProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          status: 'WITHDRAWN',
          withdrawReason: reason || '提交人主动撤回申请，计划重新完善定位与商标类目规划。',
          steps: p.steps.map(s => s.status === 'CURRENT' ? { ...s, status: 'WAITING', comment: '申请人已主动撤回。' } : s)
        };
      }
      return p;
    }));

    // 审批中心置为已撤回/取消
    setApprovals(prev => prev.map(a => {
      if (a.brandProposalId === proposalId || a.id === `APV-BP-${proposalId}`) {
        return {
          ...a,
          status: 'REJECTED',
          steps: a.steps.map(s => s.status === 'CURRENT' ? { ...s, status: 'REJECTED', comment: '申请人撤回' } : s)
        };
      }
      return a;
    }));

    showToast(`已撤回品牌【${target.brandName}】的立项审批申请。`);
  };

  // 取消品牌立项（在未提交、被驳回、已撤回状态下可取消，状态变更为已取消）
  const handleCancelBrandProposal = (proposalId: string, reason?: string) => {
    const target = brandProposals.find(p => p.id === proposalId);
    if (!target) return;

    setBrandProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          status: 'CANCELLED',
          cancelReason: reason || '业务需求变更，已终止该品牌立项。'
        };
      }
      return p;
    }));

    // 审批中心同步清理
    setApprovals(prev => prev.filter(a => a.brandProposalId !== proposalId && a.id !== `APV-BP-${proposalId}`));
    showToast(`品牌【${target.brandName}】立项申请已取消，状态变更为【已取消】。`);
  };

  // 删除草稿或已取消的申请
  const handleDeleteBrandProposal = (proposalId: string) => {
    setBrandProposals(prev => prev.filter(p => p.id !== proposalId));
    setApprovals(prev => prev.filter(a => a.brandProposalId !== proposalId && a.id !== `APV-BP-${proposalId}`));
    showToast('已删除该品牌申请记录。');
  };

  // 5. 审批通过新建品牌 (终审通过后自动生成品牌树节点挂载入库)
  const handleApproveBrandProposal = (proposalId: string, comment?: string) => {
    const target = brandProposals.find(p => p.id === proposalId);
    if (!target) return;

    // 审批通过后自动在品牌树中生成新品牌节点
    const newNodeId = `BR-${Date.now().toString().slice(-6)}`;
    const newBrandNode: BrandTreeNode = {
      id: newNodeId,
      name: target.brandName,
      englishName: target.englishName,
      code: `BR-${target.brandName.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      level: target.level,
      parentId: target.parentBrandId || 'BR-USMILE',
      description: target.brandPositioning,
      ownerDept: target.ownerDept,
      ownerName: target.initiatorName,
      status: 'ACTIVE',
      launchDate: target.plannedLaunchDate || new Date().toISOString().slice(0, 10),
      targetCategories: target.targetClasses || [21, 3, 10],
      targetMarkets: target.targetMarkets || ['中国'],
      trademarkCount: 0,
      pendingCount: 0,
      disputeCount: 0,
      children: []
    };

    // 1. 自动挂载至品牌树
    setBrandTree(prev => insertNodeIntoTree(prev, newBrandNode, target.parentBrandId));

    // 2. 更新审批提案状态
    setBrandProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          status: 'APPROVED',
          approvedNodeId: newNodeId,
          steps: p.steps.map(s => ({
            ...s,
            status: 'APPROVED',
            comment: s.comment || comment || '符合品牌布局规划，予以核准创建入库。',
            timestamp: s.timestamp || new Date().toLocaleString('zh-CN')
          }))
        };
      }
      return p;
    }));

    // 3. 更新审批中心对应单据
    setApprovals(prev => prev.map(a => {
      if (a.brandProposalId === proposalId || a.id === `APV-BP-${proposalId}`) {
        return {
          ...a,
          status: 'APPROVED',
          steps: a.steps.map(s => ({ ...s, status: 'APPROVED', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }))
        };
      }
      return a;
    }));

    showToast(`品牌【${target.brandName}】审批通过！已自动创建品牌树节点并加入企业统一品牌库！`);
  };

  // 6. 驳回新建品牌审批
  const handleRejectBrandProposal = (proposalId: string, comment?: string) => {
    setBrandProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          status: 'REJECTED',
          rejectReason: comment || '在先商标冲突风险较高或商业规划不完善，建议调整后重新发起。',
          steps: p.steps.map(s => s.status === 'CURRENT' ? { ...s, status: 'REJECTED', comment: comment || '在先商标冲突风险较高，建议调整名称后重新发起。' } : s)
        };
      }
      return p;
    }));

    // 审批中心同步置为驳回
    setApprovals(prev => prev.map(a => {
      if (a.brandProposalId === proposalId || a.id === `APV-BP-${proposalId}`) {
        return {
          ...a,
          status: 'REJECTED',
          steps: a.steps.map(s => s.status === 'CURRENT' ? { ...s, status: 'REJECTED', comment: comment || '在先商标冲突风险较高' } : s)
        };
      }
      return a;
    }));

    showToast('审批已驳回，附言已反馈给需求发起人。');
  };

  // 案件申请【已接单】后，自动生成案件管理单据并同步至台账
  const handleAcceptProposalToCase = (proposal: TrademarkApplicationProposal) => {
    const existing = caseManagementItems.find(c => c.proposalNo === proposal.proposalNo);
    if (existing) {
      showToast(`建案【${proposal.proposalNo}】已关联案件【${existing.caseNo}】`);
      return existing;
    }
    const newCaseNo = proposal.proposalNo.replace(/^SB/, 'TM') || `TM${Date.now().toString().slice(-8)}`;
    const newCase: CaseManagementItem = {
      id: `case-${Date.now()}`,
      caseNo: newCaseNo,
      proposalNo: proposal.proposalNo,
      trademarkName: proposal.trademarkName,
      brand: proposal.brand,
      classes: proposal.classes,
      similarGroups: proposal.similarGroups,
      goodsServices: proposal.goodsServices || '牙科设备和仪器、医用冲牙器、口腔治疗仪器、数字化牙科印模仪、口腔疾病检测软件开发',
      jurisdiction: proposal.jurisdiction,
      goodsItems: proposal.goodsServices || '牙科设备和仪器、医用冲牙器、口腔治疗仪器、数字化牙科印模仪、口腔疾病检测软件开发',
      status: 'PENDING_APPLY',
      applyTime: new Date().toLocaleString('zh-CN'),
      applicant: proposal.applicant || '广州星际悦动股份有限公司',
      applicationNo: `SG40${Date.now().toString().slice(-7)}`,
      agencyName: proposal.agencyName || 'Allen & Gledhill LLP',
      officialAgency: proposal.jurisdiction.includes('中国') ? '国家知识产权局商标局 (CNIPA)' : '新加坡知识产权局 (IPOS)',
      importanceLevel: proposal.importanceLevel || '一级',
      trademarkForm: proposal.trademarkForm || '文字',
      goodsList: [
        '牙科设备和仪器 (1004)',
        '医用冲牙器 (1004)',
        '口腔治疗仪器 (1004)',
        '数字化牙科印模仪 (1004)',
        '口腔医疗软件 (4220)'
      ],
      timeline: [
        { stage: '建案接单完成', date: new Date().toLocaleString('zh-CN'), description: '代理机构已接单，系统已自动生成案件管理单据', status: 'COMPLETED' },
        { stage: '申请文件准备与核验', date: '进行中', description: '整理商标图样、代理委托书POA与指定商品规范清单', status: 'CURRENT' },
        { stage: '官方递交申报', date: '预计7个工作日内', description: '向目标国家/地区官方知识产权主管局递交申报', status: 'WAITING' },
        { stage: '形式审查与受理下发', date: '待递交后1个月', description: '主管局进行形式审查，核发电子受理通知书', status: 'WAITING' },
        { stage: '实质审查阶段', date: '待受理后3-6个月', description: '审查员针对在先权利与绝对理由进行实质审查', status: 'WAITING' },
        { stage: '初审公告期', date: '待审定后', description: '进入法定异议初审公告期', status: 'WAITING' },
        { stage: '核准注册发证', date: '公告期满', description: '官方核发商标注册电子证书并归档台账', status: 'WAITING' }
      ],
      documents: [
        { id: `doc-${Date.now()}`, title: `【委托单据】${proposal.trademarkName} 代理委托书与建案申报函`, type: 'PDF', docNumber: `POA-${newCaseNo}`, issueDate: new Date().toISOString().slice(0, 10), size: '720 KB' }
      ]
    };
    setCaseManagementItems([newCase, ...caseManagementItems]);
    showToast(`建案【${proposal.proposalNo}】已接单！已自动生成案件管理单据【${newCaseNo}】`);
    return newCase;
  };

  // 更新案件单据
  const handleUpdateCase = (updated: CaseManagementItem) => {
    setCaseManagementItems(caseManagementItems.map(c => c.id === updated.id ? updated : c));
  };

  // 建案申请提交时自动推送审批中心
  const handleSubmitSearchProposalApproval = (proposal: TrademarkApplicationProposal) => {
    const existingApvIndex = approvals.findIndex(a => a.id === `APV-PROP-${proposal.id}`);
    const newApprovalWorkflow: ApprovalWorkflow = {
      id: `APV-PROP-${proposal.id}`,
      title: `商标检索与建案申请审批`,
      type: 'NEW_APPLICATION',
      initiator: {
        name: proposal.applicant || currentUser.name,
        dept: proposal.department || currentUser.department || '品牌中心',
        avatar: currentUser.avatar
      },
      createTime: new Date().toLocaleDateString('zh-CN'),
      status: 'PENDING',
      currentStep: 1,
      steps: [
        { role: '需求部门主管复核', userName: '唐宁 (部门主管)', status: 'CURRENT', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { role: '知产法务查重评估', userName: '陆燕丽 (法务主管)', status: 'WAITING' },
        { role: '品牌法务总监审核', userName: '林悦 (知产总监)', status: 'WAITING' }
      ],
      details: {
        '提案编号': proposal.proposalNo,
        '商标名称': proposal.trademarkName,
        '所属品牌': proposal.brand,
        '尼斯类别': proposal.classes,
        '申请国家/地区': proposal.jurisdiction,
        '重要等级': proposal.importanceLevel,
        '商标形式': proposal.trademarkForm,
        '需求部门': proposal.department,
        '申请人': proposal.applicant,
        '业务类型': proposal.businessType || '国内注册',
        '委外类型': proposal.agencyType || '代理机构委外',
        '技术分类及检索范围': proposal.techCategory || '无',
        '产品领域': proposal.productDomain || '无',
        '备注说明': proposal.description || '新建商标检索与建案需求'
      }
    };

    if (existingApvIndex >= 0) {
      const updated = [...approvals];
      updated[existingApvIndex] = newApprovalWorkflow;
      setApprovals(updated);
    } else {
      setApprovals(prev => [newApprovalWorkflow, ...prev]);
    }
  };

  // Handlers for App Actions
  const handleCreateDraft = (newDraft: Partial<ApplicationDraft>) => {
    const created: ApplicationDraft = {
      id: `DFT-${Date.now()}`,
      draftNo: newDraft.draftNo || `DFT-${Date.now().toString().slice(-6)}`,
      trademarkName: newDraft.trademarkName || '新商标申请',
      trademarkType: newDraft.trademarkType || 'COMBINED',
      classes: newDraft.classes || [21],
      goodsItems: newDraft.goodsItems || ['电动牙刷'],
      jurisdictions: newDraft.jurisdictions || ['CN'],
      applicant: newDraft.applicant || '广州星际悦动股份有限公司',
      estimatedFee: newDraft.estimatedFee || 1800,
      agencyId: newDraft.agencyId || 'ag_01',
      status: newDraft.status || 'DRAFT',
      createTime: newDraft.createTime || new Date().toLocaleString('zh-CN'),
      creator: currentUser.name,
      designBrief: newDraft.designBrief,
      priorityClaim: newDraft.priorityClaim,
    };

    setDrafts([created, ...drafts]);
    
    if (created.status === 'SUBMITTED_APPROVAL') {
      // Also add an approval workflow
      const newApv: ApprovalWorkflow = {
        id: `APV-${Date.now().toString().slice(-4)}`,
        title: `【立项】${created.trademarkName} 商标多国注册立项预算审批`,
        type: 'NEW_APPLICATION',
        initiator: {
          name: currentUser.name,
          dept: currentUser.department,
          avatar: currentUser.avatar,
        },
        createTime: new Date().toLocaleString('zh-CN'),
        status: 'PENDING',
        amount: created.estimatedFee,
        currentStep: 1,
        steps: [
          { role: '申请人发起', userName: currentUser.name, status: 'APPROVED', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { role: '知识产权总监', userName: '徐明哲 (Legal Director)', status: 'CURRENT' },
          { role: '财务风控审批', userName: '黄洁 (Finance VP)', status: 'WAITING' },
        ],
        details: {
          '商标名称': created.trademarkName,
          '指定国家': created.jurisdictions,
          '商标类别': created.classes.map(c => `第${c}类`),
          '预估规费与代理费': `¥ ${created.estimatedFee.toLocaleString()}`,
        }
      };
      setApprovals([newApv, ...approvals]);
      showToast(`已成功创建申请并推送审批流：${created.trademarkName}`);
    } else {
      showToast(`草稿已成功保存至草稿箱：${created.trademarkName}`);
    }
  };

  const handleDeleteDraft = (id: string) => {
    setDrafts(drafts.filter(d => d.id !== id));
    showToast('草稿已删除');
  };

  const handleDuplicateDraft = (draft: ApplicationDraft) => {
    const duplicated: ApplicationDraft = {
      ...draft,
      id: `DFT-${Date.now()}`,
      draftNo: `${draft.draftNo}-COPY`,
      trademarkName: `${draft.trademarkName} (副本)`,
      status: 'DRAFT',
      createTime: new Date().toLocaleString('zh-CN'),
    };
    setDrafts([duplicated, ...drafts]);
    showToast(`已成功复制申请：${duplicated.trademarkName}`);
  };

  const handleCreateEnforcementCase = (newCase: Partial<EnforcementCase>) => {
    const item: EnforcementCase = {
      id: `ENF-${Date.now()}`,
      caseNo: newCase.caseNo || `YY-${Date.now().toString().slice(-4)}`,
      type: newCase.type || 'OPPOSITION',
      targetTrademark: newCase.targetTrademark || '侵权标的',
      targetRegNo: newCase.targetRegNo || '00000000',
      targetApplicant: newCase.targetApplicant || '侵权方',
      ourTrademark: newCase.ourTrademark || 'usmile',
      classes: newCase.classes || [21],
      jurisdiction: newCase.jurisdiction || 'CN',
      riskLevel: newCase.riskLevel || 'CRITICAL',
      status: newCase.status || 'SUBMITTED',
      handler: currentUser.name,
      lawFirm: newCase.lawFirm || '北京市柳沈律师事务所',
      filingDeadline: newCase.filingDeadline || '2024-04-30',
      budget: newCase.budget || 8500,
      groundsSummary: newCase.groundsSummary || '依据商标法提出异议',
      progressPercent: 25,
      ...newCase,
    };
    setEnforcementCases([item, ...enforcementCases]);
    showToast(`已成功立案维权：针对【${item.targetTrademark}】`);
  };

  const handleUpdateEnforcementCase = (updatedCase: EnforcementCase) => {
    setEnforcementCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    showToast(`维权单据【${updatedCase.caseNo}】已更新！`);
  };

  const handleInitiateOppositionFromRadar = (alert: MonitoringAlert, customData?: Partial<EnforcementCase>) => {
    // 1. Update alert status
    setAlerts(alerts.map(a => a.id === alert.id ? { ...a, status: 'OPPOSITION_PROPOSED' } : a));

    // 2. Add Enforcement case
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const seq = String(enforcementCases.length + 1).padStart(3, '0');
    const generatedCaseNo = `WQ${yyyy}${mm}${dd}${seq}`;

    const targetName = customData?.targetTrademark || alert.suspectName;

    const newEnforcementCase: EnforcementCase = {
      id: `ENF-${Date.now()}`,
      caseNo: generatedCaseNo,
      type: 'OPPOSITION',
      targetTrademark: targetName,
      targetRegNo: customData?.targetRegNo || alert.suspectRegNo,
      targetApplicant: customData?.targetApplicant || alert.suspectApplicant,
      ourTrademark: customData?.ourTrademark || alert.matchedOurTrademark || 'usmile',
      classes: customData?.classes || [alert.suspectClass],
      jurisdiction: 'CN',
      riskLevel: customData?.riskLevel || alert.riskLevel || 'CRITICAL',
      status: 'SUBMITTED',
      handler: customData?.handler || currentUser.name || '林悦',
      lawFirm: customData?.lawFirm || '北京市柳沈律师事务所',
      filingDeadline: customData?.filingDeadline || '2026-09-30',
      budget: customData?.budget || 8500,
      groundsSummary: customData?.groundsSummary || alert.similarityReason || '依据商标法提出商标异议',
      progressPercent: 20,
      name: customData?.name || `针对【${targetName}】维权异议立案`,
      remarks: customData?.remarks || alert.remarks,
      ...customData,
    };

    setEnforcementCases(prev => [newEnforcementCase, ...prev]);

    // 3. Navigate to Enforcement tab
    setActiveTab('enforcement');
    showToast(`已将【${targetName}】转入商标异议立案流程!`);
  };

  const handleApproveWorkflow = (id: string, comment: string) => {
    setApprovals(approvals.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'APPROVED',
          steps: a.steps.map(s => s.status === 'CURRENT' ? { ...s, status: 'APPROVED', comment, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : s)
        };
      }
      return a;
    }));
    showToast('审批通过，已同步推送至承接代理律所与飞书工作台！');
  };

  const handleRejectWorkflow = (id: string, comment: string) => {
    setApprovals(approvals.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'REJECTED',
          steps: a.steps.map(s => s.status === 'CURRENT' ? { ...s, status: 'REJECTED', comment, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : s)
        };
      }
      return a;
    }));
    showToast('已退回修改，附言已通知申请人。');
  };

  const pendingApprovalsCount = approvals.filter(a => a.status === 'PENDING').length;
  const criticalAlertsCount = alerts.filter(a => a.status === 'NEW' || a.status === 'OPPOSITION_PROPOSED').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] flex items-center gap-3 px-6 py-4 bg-slate-900/95 text-white text-sm font-semibold rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar & Header (上下结构：顶部导航菜单，支持系统管理二级菜单展开与快速跳转) */}
      <TopNavbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeSettingsSubTab={settingsSubTab}
        onSettingsSubTabChange={(sub) => {
          setSettingsSubTab(sub);
          setActiveTab('settings');
        }}
        pendingApprovalsCount={pendingApprovalsCount}
        criticalAlertsCount={criticalAlertsCount}
        currentUser={currentUser}
        onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
        onOpenNewApplication={() => setActiveTab('applications')}
      />

      {/* Main Content View Container */}
      <main className="flex-1 p-3.5 sm:p-4 md:p-5 max-w-[1600px] w-full mx-auto">
        {activeTab === 'dashboard' && (
          <Dashboard
            trademarks={trademarks}
            alerts={alerts}
            enforcementCases={enforcementCases}
            caseItems={caseManagementItems}
            onNavigate={setActiveTab}
            onOpenTrademarkDetail={setSelectedTrademark}
            onOpenNewApplication={() => setActiveTab('applications')}
            onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
          />
        )}

        {activeTab === 'brand-tree' && (
          <BrandTreeManagement
            brandTree={brandTree}
            brandProposals={brandProposals}
            trademarks={trademarks}
            currentUser={currentUser}
            onAddBrandNode={handleAddBrandNode}
            onUpdateBrandNode={handleUpdateBrandNode}
            onDeleteBrandNode={handleDeleteBrandNode}
            onCreateBrandProposal={handleCreateBrandProposal}
            onUpdateBrandProposal={handleUpdateBrandProposal}
            onSubmitBrandProposal={handleSubmitBrandProposal}
            onWithdrawBrandProposal={handleWithdrawBrandProposal}
            onCancelBrandProposal={handleCancelBrandProposal}
            onDeleteBrandProposal={handleDeleteBrandProposal}
            onApproveBrandProposal={handleApproveBrandProposal}
            onRejectBrandProposal={handleRejectBrandProposal}
            onNavigateToFiling={(_brandName) => {
              setActiveTab('applications');
            }}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationCenter
            drafts={drafts}
            brandTree={brandTree}
            onCreateDraft={handleCreateDraft}
            onDeleteDraft={handleDeleteDraft}
            onDuplicateDraft={handleDuplicateDraft}
            onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
            onAcceptProposal={handleAcceptProposalToCase}
            onSubmitSearchProposalApproval={handleSubmitSearchProposalApproval}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioLedger
            caseItems={caseManagementItems}
            brandTree={brandTree}
            onUpdateCase={handleUpdateCase}
            onSelectTrademark={setSelectedTrademark}
            onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
          />
        )}

        {activeTab === 'enforcement' && (
          <EnforcementCenter
            cases={enforcementCases}
            onCreateCase={handleCreateEnforcementCase}
            onUpdateCase={handleUpdateEnforcementCase}
            onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
          />
        )}

        {activeTab === 'monitoring' && (
          <MonitoringRadar
            alerts={alerts}
            onInitiateOpposition={handleInitiateOppositionFromRadar}
            onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
          />
        )}

        {activeTab === 'agencies' && (
          <AgencyCollaboration 
            agencies={agencies}
            caseItems={caseManagementItems}
            currentUser={currentUser}
            onUpdateCase={handleUpdateCase}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalCenter
            approvals={approvals}
            onApprove={handleApproveWorkflow}
            onReject={handleRejectWorkflow}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'nice-tool' && (
          <NiceClassificationTool />
        )}

        {activeTab === 'settings' && (
          <SystemSettings 
            currentUser={currentUser} 
            activeSubTab={settingsSubTab}
            onSubTabChange={setSettingsSubTab}
          />
        )}
      </main>

      {/* AI Assistant Chat Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />

      {/* Auth & SSO Demo Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`欢迎回来，${user.name}（${user.title}）`);
        }}
        currentUser={currentUser}
      />

      {/* Global Cmd+K Search Modal */}
      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        trademarks={trademarks}
        alerts={alerts}
        onSelectTrademark={setSelectedTrademark}
        onNavigate={setActiveTab}
      />
    </div>
  );
}
