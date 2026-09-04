import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronDown, 
  Search, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  FileText, 
  MessageSquare, 
  UserPlus, 
  Send, 
  X, 
  Share2, 
  CheckSquare, 
  Square,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Eraser,
  List,
  Undo2,
  Redo2,
  Bell,
  RotateCcw
} from 'lucide-react';
import { ApprovalWorkflow, UserProfile } from '../types';

interface ApprovalCenterProps {
  approvals: ApprovalWorkflow[];
  onApprove: (id: string, comment: string) => void;
  onReject: (id: string, comment: string) => void;
  currentUser: UserProfile;
}

export interface DetailedApprovalItem {
  id: string;
  code: string;
  title: string;
  status: 'PENDING_RETURN' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'TRANSFER';
  statusText: string;
  type: string;
  category?: string;
  accountName?: string;
  platformAccount?: string;
  contractNo?: string;
  contractName?: string;
  contractBrand?: string;
  amount?: number;
  applicant: {
    name: string;
    avatar: string;
    dept: string;
  };
  applyTime: string;
  restartReason?: string;
  basicInfo: {
    accountType: string;
    accountCategory: string;
    channelStore: string;
    contractNo: string;
    brand: string;
    contractName: string;
    contractNature: string;
    companyEntity: string;
    companyCode: string;
    sapAccountNo: string;
    sapAccountName: string;
  };
  receiptInfo: {
    receiverName: string;
    receiverSapNo: string;
    bankName: string;
    bankBranch: string;
    bankAccount: string;
  };
  accountDetailInfo: {
    platformAccount: string;
    loginPasswordMasked: string;
    loginPasswordPlain: string;
    accountName: string;
    phone: string;
    accountAttribute: string;
  };
  financeAuditInfo: {
    isNewSupplier: string;
    channel: string;
    sapNo: string;
    sapName: string;
  };
  orderRecords: {
    orderNo: string;
    planName: string;
    amount: string;
    time: string;
    status: string;
  }[];
  paymentRecords: {
    paymentNo: string;
    bank: string;
    method: string;
    amount: string;
    status: string;
    payTime: string;
  }[];
  flowNodes: {
    role: string;
    userName: string;
    status: 'APPROVED' | 'CURRENT' | 'WAITING' | 'REJECTED';
    comment?: string;
    timestamp?: string;
  }[];
}

export const ApprovalCenter: React.FC<ApprovalCenterProps> = ({
  approvals,
  onApprove,
  onReject,
  currentUser,
}) => {
  // Top Sub-tabs
  const [topTab, setTopTab] = useState<'PENDING' | 'DONE' | 'MY_INITIATED' | 'CC_ME'>('PENDING');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'TIME_DESC' | 'TIME_ASC' | 'AMOUNT_DESC'>('TIME_DESC');

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<'TIME' | 'TYPE' | 'SORT' | null>(null);

  // Batch Approval Mode
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Right Canvas Detail Sub-Tabs
  const [detailTab, setDetailTab] = useState<'ACCOUNT_INFO' | 'ORDER_RECORDS' | 'PAYMENT_RECORDS' | 'FLOW_LOGS'>('ACCOUNT_INFO');

  // Toast / Copy notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Modals
  const [activeModal, setActiveModal] = useState<'APPROVE' | 'REJECT' | 'COMMENT' | 'TRANSFER' | 'CC' | 'URGE' | 'WITHDRAW' | 'PASSWORD' | 'CONTRACT' | 'VIEW_FULL' | null>(null);
  const [modalComment, setModalComment] = useState('');
  const [approveFiles, setApproveFiles] = useState<{ name: string; size: string }[]>([]);
  const [commentFiles, setCommentFiles] = useState<{ name: string; size: string }[]>([]);
  const [selectedTransferUser, setSelectedTransferUser] = useState('徐明哲 (法务总监)');
  const [selectedCcUser, setSelectedCcUser] = useState('陆燕丽');

  // Password visibility
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);

  // Mock comprehensive approval list reflecting the reference image
  const [approvalList, setApprovalList] = useState<DetailedApprovalItem[]>([
    {
      id: 'APV-20260821-002',
      code: 'APV-SB20260821001',
      title: '商标检索与建案申请审批',
      status: 'PENDING',
      statusText: '审批中',
      type: '商标检索与建案',
      category: '第21类 厨房洁具与护理设备',
      accountName: 'usmile S10 PRO',
      platformAccount: 'usmile S10 PRO',
      contractBrand: 'usmile笑容加',
      applicant: {
        name: '陆燕丽',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        dept: '品牌中心'
      },
      applyTime: '2026-08-21 09:30:00',
      restartReason: '新建电动牙刷智能系列商标检索与建案需求，向法务申请排查在先商标风险及建案。',
      basicInfo: {
        accountType: '商标建案/检索申请',
        accountCategory: '第21类 厨房洁具与护理设备',
        channelStore: '中国',
        contractNo: 'SB20260821001',
        brand: 'usmile笑容加',
        contractName: 'usmile S10 PRO',
        contractNature: '国内注册',
        companyEntity: '广州星际悦动股份有限公司',
        companyCode: '1000',
        sapAccountNo: '202999',
        sapAccountName: '234999',
      },
      receiptInfo: {
        receiverName: '代理机构委外',
        receiverSapNo: '202100',
        bankName: '知产律所/服务机构',
        bankBranch: '专户',
        bankAccount: '11000000-88889999',
      },
      accountDetailInfo: {
        platformAccount: 'usmile S10 PRO',
        loginPasswordMasked: '••••••••••••',
        loginPasswordPlain: 'N/A',
        accountName: 'usmile S10 PRO',
        phone: '18888888888',
        accountAttribute: '知识产权重点无形资产',
      },
      financeAuditInfo: {
        isNewSupplier: '否',
        channel: '需求部门与法务部联动',
        sapNo: '202999',
        sapName: '234999',
      },
      orderRecords: [],
      paymentRecords: [],
      flowNodes: [
        { role: '需求部门主管复核', userName: '唐宁 (部门主管)', status: 'CURRENT', timestamp: '2026-08-21 09:30:00' },
        { role: '知产法务查重评估', userName: '陆燕丽 (法务主管)', status: 'WAITING' },
        { role: '品牌法务总监审核', userName: '林悦 (知产总监)', status: 'WAITING' }
      ]
    },
    {
      id: 'APV-20251222-001',
      code: 'AC2512220001',
      title: '平台账号重启审批',
      status: 'PENDING_RETURN',
      statusText: '审批中(被退回)',
      type: '平台账号重启审批',
      category: '腾讯-微信豆',
      accountName: '测试',
      platformAccount: 'yanmingzhu23233',
      contractBrand: 'usmile笑容加',
      applicant: {
        name: '陆燕丽',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        dept: '星际数字营销部'
      },
      applyTime: '2025-12-22 17:30:12',
      restartReason: '测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试',
      basicInfo: {
        accountType: '广告充值账号-自有',
        accountCategory: '腾讯-微信豆',
        channelStore: '【不挂车专用——品牌营销】产品种草',
        contractNo: 'HT(MMS)2509170004',
        brand: 'usmile笑容加',
        contractName: '测试合同123',
        contractNature: '无',
        companyEntity: '广州星际悦动股份有限公司',
        companyCode: '1000',
        sapAccountNo: '202676',
        sapAccountName: '234123',
      },
      receiptInfo: {
        receiverName: '广州圆梯文化有限公司',
        receiverSapNo: '202433',
        bankName: '测试',
        bankBranch: '测试2',
        bankAccount: '34567890-98765432',
      },
      accountDetailInfo: {
        platformAccount: 'yanmingzhu23233',
        loginPasswordMasked: '••••••••••••',
        loginPasswordPlain: 'YmZ#2026!usmile_wx',
        accountName: '测试',
        phone: '18888888888',
        accountAttribute: '不属于账户余额专用',
      },
      financeAuditInfo: {
        isNewSupplier: '是',
        channel: '腾讯-微信豆',
        sapNo: '202676',
        sapName: '234123',
      },
      orderRecords: [
        { orderNo: 'ORD2025122001', planName: 'usmile Q4 微信视频号达人产品种草', amount: '¥ 120,000.00', time: '2025-12-20 14:00', status: '已完成' },
        { orderNo: 'ORD2025122104', planName: 'usmile P3 PRO 智能冲牙器品宣投放', amount: '¥ 85,000.00', time: '2025-12-21 16:30', status: '进行中' },
      ],
      paymentRecords: [
        { paymentNo: 'PAY251222001', bank: '招商银行广州分行', method: '银行电汇', amount: '¥ 205,000.00', status: '已支付', payTime: '2025-12-22 10:15' },
      ],
      flowNodes: [
        { role: '申请人提交', userName: '陆燕丽', status: 'APPROVED', comment: '因品牌种草活动重启充值账户，请审批', timestamp: '2025-12-22 17:30:12' },
        { role: '营销主管审核', userName: '唐宁', status: 'REJECTED', comment: '补充关联合同HT(MMS)2509170004及SAP账号核对凭证', timestamp: '2025-12-22 18:10:00' },
        { role: '申请人重新提交', userName: '陆燕丽', status: 'APPROVED', comment: '已补充完毕，重新发起审批', timestamp: '2025-12-22 18:30:00' },
        { role: '财务风控初审', userName: '黄洁', status: 'CURRENT' },
        { role: '财务总监终审', userName: '陈总', status: 'WAITING' },
      ]
    },
    {
      id: 'APV-20250828-001',
      code: 'CO2508280001',
      title: '转交审批',
      status: 'PENDING',
      statusText: '审批中',
      type: '转交审批',
      category: '广告意向',
      contractNo: 'HT(MMS)2508280010',
      contractBrand: 'usmile笑容加',
      applicant: {
        name: '陆燕丽',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        dept: '星际数字营销部'
      },
      applyTime: '2025-08-28 18:34:49',
      restartReason: '根据集团营销投放授权要求，转交商务合同意向书审批。',
      basicInfo: {
        accountType: '广告意向合作',
        accountCategory: '抖音巨量千川',
        channelStore: '【自播专享】智能口腔个护官方旗舰店',
        contractNo: 'HT(MMS)2508280010',
        brand: 'usmile笑容加',
        contractName: '秋季数字营销意向框架协议',
        contractNature: '服务采购',
        companyEntity: '广州星际悦动股份有限公司',
        companyCode: '1000',
        sapAccountNo: '202688',
        sapAccountName: '234200',
      },
      receiptInfo: {
        receiverName: '北京巨量引擎网络技术有限公司',
        receiverSapNo: '202500',
        bankName: '工商银行北京分行',
        bankBranch: '海淀支行',
        bankAccount: '11006098-99887766',
      },
      accountDetailInfo: {
        platformAccount: 'usmile_douyin_brand',
        loginPasswordMasked: '••••••••••••',
        loginPasswordPlain: 'Dy#2025!usmile_ad',
        accountName: '巨量千川主账户',
        phone: '18888888888',
        accountAttribute: '属于账户余额专用',
      },
      financeAuditInfo: {
        isNewSupplier: '否',
        channel: '抖音巨量千川',
        sapNo: '202688',
        sapName: '234200',
      },
      orderRecords: [],
      paymentRecords: [],
      flowNodes: [
        { role: '申请人提交', userName: '陆燕丽', status: 'APPROVED', timestamp: '2025-08-28 18:34:49' },
        { role: '营销总监审批', userName: '唐宁', status: 'CURRENT' },
      ]
    },
    {
      id: 'APV-20250828-002',
      code: 'CO2504160001',
      title: '转交审批',
      status: 'PENDING',
      statusText: '审批中',
      type: '转交审批',
      category: '广告意向',
      contractNo: 'HT(MMS)2504250002',
      contractBrand: 'usmile笑容加',
      applicant: {
        name: '陆燕丽',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        dept: '星际数字营销部'
      },
      applyTime: '2025-08-28 16:34:38',
      restartReason: '品牌营销推广意向单据流转审批。',
      basicInfo: {
        accountType: '品牌媒介意向',
        accountCategory: '快手磁力引擎',
        channelStore: '【快手官方】usmile品牌特卖店',
        contractNo: 'HT(MMS)2504250002',
        brand: 'usmile笑容加',
        contractName: '快手超品日媒介推广单',
        contractNature: '媒介直投',
        companyEntity: '广州星际悦动股份有限公司',
        companyCode: '1000',
        sapAccountNo: '202690',
        sapAccountName: '234215',
      },
      receiptInfo: {
        receiverName: '北京达佳互联信息技术有限公司',
        receiverSapNo: '202512',
        bankName: '建设银行北京海淀支行',
        bankBranch: '上地支行',
        bankAccount: '11005088-33445566',
      },
      accountDetailInfo: {
        platformAccount: 'kuaishou_usmile_official',
        loginPasswordMasked: '••••••••••••',
        loginPasswordPlain: 'Ks#2025!star_media',
        accountName: '快手营销账户',
        phone: '18888888888',
        accountAttribute: '不属于账户余额专用',
      },
      financeAuditInfo: {
        isNewSupplier: '否',
        channel: '快手磁力引擎',
        sapNo: '202690',
        sapName: '234215',
      },
      orderRecords: [],
      paymentRecords: [],
      flowNodes: [
        { role: '申请人提交', userName: '陆燕丽', status: 'APPROVED', timestamp: '2025-08-28 16:34:38' },
        { role: '媒介总监', userName: '苏晓', status: 'CURRENT' },
      ]
    },
    {
      id: 'APV-20251220-004',
      code: 'HT2512200001',
      title: '合同审批',
      status: 'PENDING_RETURN',
      statusText: '审批中(被退回)',
      type: '合同审批',
      contractName: '测试验收V6.7',
      contractBrand: 'usmile笑容加',
      amount: 100.0,
      applicant: {
        name: '陆燕丽',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        dept: '星际数字营销部'
      },
      applyTime: '2025-12-20 10:15:30',
      restartReason: '合同文本附件盖章条款需按法务标准化模板更正后重新发起。',
      basicInfo: {
        accountType: '营销服务合同',
        accountCategory: '商务合作',
        channelStore: '【全渠道】品牌合规测试',
        contractNo: 'HT(MMS)2512200001',
        brand: 'usmile笑容加',
        contractName: '测试验收V6.7',
        contractNature: '技术测试',
        companyEntity: '广州星际悦动股份有限公司',
        companyCode: '1000',
        sapAccountNo: '202676',
        sapAccountName: '234123',
      },
      receiptInfo: {
        receiverName: '广州圆梯文化有限公司',
        receiverSapNo: '202433',
        bankName: '测试',
        bankBranch: '测试2',
        bankAccount: '34567890-98765432',
      },
      accountDetailInfo: {
        platformAccount: 'test_contract_account',
        loginPasswordMasked: '••••••••••••',
        loginPasswordPlain: 'Test#2025!contract',
        accountName: '合同测试',
        phone: '18888888888',
        accountAttribute: '不属于账户余额专用',
      },
      financeAuditInfo: {
        isNewSupplier: '否',
        channel: '腾讯-微信豆',
        sapNo: '202676',
        sapName: '234123',
      },
      orderRecords: [],
      paymentRecords: [],
      flowNodes: [
        { role: '发起人提交', userName: '陆燕丽', status: 'APPROVED', timestamp: '2025-12-20 10:15:30' },
        { role: '法务主管初审', userName: '徐明哲', status: 'REJECTED', comment: '合同主体税率及违约责任补充', timestamp: '2025-12-20 11:30:00' },
        { role: '法务终审', userName: '林悦', status: 'CURRENT' },
      ]
    },
    {
      id: 'APV-20260814-001',
      code: 'SB20260814001',
      title: '商标申请立项与用印审批',
      status: 'PENDING',
      statusText: '审批中',
      type: '商标申请审批',
      contractBrand: 'usmile笑容加',
      amount: 16800.0,
      applicant: {
        name: '林悦',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        dept: '知识产权与法务部'
      },
      applyTime: '2026-08-14 12:54:00',
      restartReason: '2026 全球 AI 声波牙刷子品牌 usmile AI DENTAL 多国商标战略注册，需锁定中国、美国、欧盟、日本四地优先权。',
      basicInfo: {
        accountType: '商标申请立项',
        accountCategory: '知识产权规费',
        channelStore: '全球国际化注册保护',
        contractNo: 'HT(IP)20260814001',
        brand: 'usmile笑容加',
        contractName: 'usmile AI DENTAL 多国注册代理协议',
        contractNature: '涉外知识产权',
        companyEntity: '广州星际悦动股份有限公司',
        companyCode: '1000',
        sapAccountNo: '202999',
        sapAccountName: '234999',
      },
      receiptInfo: {
        receiverName: '北京市柳沈律师事务所',
        receiverSapNo: '202100',
        bankName: '中国银行北京朝阳支行',
        bankBranch: '国贸支行',
        bankAccount: '11009988-77665544',
      },
      accountDetailInfo: {
        platformAccount: 'usmile_ip_official',
        loginPasswordMasked: '••••••••••••',
        loginPasswordPlain: 'IP#2026!usmile_global',
        accountName: '知识产权官方端口',
        phone: '13900008888',
        accountAttribute: '属于账户余额专用',
      },
      financeAuditInfo: {
        isNewSupplier: '否',
        channel: '柳沈律所涉外代理',
        sapNo: '202999',
        sapName: '234999',
      },
      orderRecords: [
        { orderNo: 'ORD2026081401', planName: '中国 CN + 美国 US + 欧盟 EU + 日本 JP 四国申报', amount: '¥ 16,800.00', time: '2026-08-14 12:54', status: '待付款' },
      ],
      paymentRecords: [],
      flowNodes: [
        { role: '法务发起', userName: '林悦', status: 'APPROVED', comment: 'Q3 新品发售在即，急需优先权申请', timestamp: '2026-08-14 12:54:00' },
        { role: '知识产权总监', userName: '徐明哲', status: 'CURRENT' },
        { role: '财务副总裁', userName: '黄洁', status: 'WAITING' },
      ]
    },
    {
      id: 'APV-20260818-002',
      code: 'YY20260818001',
      title: '商标异议维权出资审批',
      status: 'PENDING',
      statusText: '审批中',
      type: '异议维权出资审批',
      contractBrand: 'usmile笑容加',
      amount: 8500.0,
      applicant: {
        name: '林悦',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        dept: '知识产权与法务部'
      },
      applyTime: '2026-08-18 09:30:22',
      restartReason: '针对恶意抢注标的【u·smile 优笑】提起第 21 类商标异议，初审公告期仅剩 18 天，需加急出资委托代理机构提起立案。',
      basicInfo: {
        accountType: '维权异议出资',
        accountCategory: '知识产权诉讼与维权',
        channelStore: '国家知识产权局商标局',
        contractNo: 'HT(IP)20260818002',
        brand: 'usmile笑容加',
        contractName: '商标异议代理委托协议',
        contractNature: '维权专项',
        companyEntity: '广州星际悦动股份有限公司',
        companyCode: '1000',
        sapAccountNo: '202999',
        sapAccountName: '234999',
      },
      receiptInfo: {
        receiverName: '北京市金杜律师事务所',
        receiverSapNo: '202105',
        bankName: '招商银行北京建国路支行',
        bankBranch: 'CBD支行',
        bankAccount: '11007766-55443322',
      },
      accountDetailInfo: {
        platformAccount: 'usmile_legal_defense',
        loginPasswordMasked: '••••••••••••',
        loginPasswordPlain: 'Defense#2026!usmile',
        accountName: '维权管理中心',
        phone: '13900008888',
        accountAttribute: '属于账户余额专用',
      },
      financeAuditInfo: {
        isNewSupplier: '否',
        channel: '金杜律所维权代理',
        sapNo: '202999',
        sapName: '234999',
      },
      orderRecords: [],
      paymentRecords: [],
      flowNodes: [
        { role: '法务发起', userName: '林悦', status: 'APPROVED', comment: '抢注人具有明显恶意，已完成公证取证', timestamp: '2026-08-18 09:30:22' },
        { role: '知识产权总监', userName: '徐明哲', status: 'CURRENT' },
        { role: '品牌中心负责人', userName: '苏晓', status: 'WAITING' },
      ]
    },
    {
      id: 'APV-20260816-003',
      code: 'XZ20260816003',
      title: '商标十年期满续展审批',
      status: 'APPROVED',
      statusText: '已通过',
      type: '续展预算审批',
      contractBrand: 'usmile笑容加',
      amount: 2000.0,
      applicant: {
        name: '陈志远',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        dept: '知识产权运营组'
      },
      applyTime: '2026-08-16 11:20:00',
      restartReason: '核心商标【声波气泡】第21类届满十年续展，维持基础技术防御护城河。',
      basicInfo: {
        accountType: '商标续展规费',
        accountCategory: '资产维护',
        channelStore: '国家知识产权局',
        contractNo: 'HT(IP)20260816003',
        brand: 'usmile笑容加',
        contractName: '商标续展代理服务',
        contractNature: '资产维护',
        companyEntity: '广州星际悦动股份有限公司',
        companyCode: '1000',
        sapAccountNo: '202999',
        sapAccountName: '234999',
      },
      receiptInfo: {
        receiverName: '广州华进联合专利商标代理有限公司',
        receiverSapNo: '202110',
        bankName: '中国建设银行广州天河支行',
        bankBranch: '体育西支行',
        bankAccount: '44001122-33445566',
      },
      accountDetailInfo: {
        platformAccount: 'usmile_renewal_ops',
        loginPasswordMasked: '••••••••••••',
        loginPasswordPlain: 'Renew#2026!usmile',
        accountName: '资产运营账户',
        phone: '13800138000',
        accountAttribute: '不属于账户余额专用',
      },
      financeAuditInfo: {
        isNewSupplier: '否',
        channel: '华进联合代理',
        sapNo: '202999',
        sapName: '234999',
      },
      orderRecords: [],
      paymentRecords: [
        { paymentNo: 'PAY260816001', bank: '建设银行广州天河支行', method: '企业网银转账', amount: '¥ 2,000.00', status: '已付款', payTime: '2026-08-16 15:00' }
      ],
      flowNodes: [
        { role: '经办人发起', userName: '陈志远', status: 'APPROVED', timestamp: '2026-08-16 11:20:00' },
        { role: '知识产权总监', userName: '徐明哲', status: 'APPROVED', comment: '同意续展，保留资产', timestamp: '2026-08-16 14:10:00' },
      ]
    }
  ]);

  // 同步 App 传来的全局 approvals 数据到 approvalList 列表中
  useEffect(() => {
    if (!approvals || approvals.length === 0) return;

    const convertWorkflowToDetailedItem = (wf: ApprovalWorkflow): DetailedApprovalItem => {
      const proposalNo = String(wf.details?.['提案编号'] || wf.details?.['拟建品牌'] || wf.id);
      const trademarkName = String(wf.details?.['商标名称'] || wf.details?.['拟建品牌'] || wf.title);
      const brand = String(wf.details?.['所属品牌'] || wf.details?.['所属层级'] || 'usmile笑容加');
      const classes = String(wf.details?.['尼斯类别'] || '商标与建案');
      const dept = wf.initiator.dept || '品牌中心';

      let status: DetailedApprovalItem['status'] = 'PENDING';
      let statusText = '审批中';
      if (wf.status === 'APPROVED') {
        status = 'APPROVED';
        statusText = '已通过';
      } else if (wf.status === 'REJECTED') {
        status = 'PENDING_RETURN';
        statusText = '审批中(被退回)';
      }

      const isTrademarkSearchApp = (wf.type as string) === 'NEW_APPLICATION' || wf.title.includes('商标检索') || (wf.type as string) === '商标检索与建案';

      return {
        id: wf.id,
        code: proposalNo.startsWith('APV') ? proposalNo : `APV-${proposalNo}`,
        title: isTrademarkSearchApp ? '商标检索与建案申请审批' : wf.title,
        status,
        statusText,
        type: isTrademarkSearchApp ? '商标检索与建案' : wf.type === 'NEW_BRAND_CREATION' ? '新建品牌审批' : '商标检索需求审批',
        contractBrand: brand,
        amount: wf.amount || 0,
        applicant: {
          name: wf.initiator.name,
          avatar: wf.initiator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          dept
        },
        applyTime: wf.createTime || new Date().toLocaleString('zh-CN'),
        restartReason: String(wf.details?.['备注说明'] || wf.details?.['商业定位'] || '建案申请/商标检索需求已保存并提交，正在触发多级审批。'),
        basicInfo: {
          accountType: '商标建案/检索申请',
          accountCategory: classes,
          channelStore: String(wf.details?.['申请国家/地区'] || '中国'),
          contractNo: proposalNo,
          brand,
          contractName: trademarkName,
          contractNature: String(wf.details?.['业务类型'] || '国内注册'),
          companyEntity: String(wf.details?.['申请人'] || '广州星际悦动股份有限公司'),
          companyCode: '1000',
          sapAccountNo: '202999',
          sapAccountName: '234999',
        },
        receiptInfo: {
          receiverName: String(wf.details?.['委外类型'] || '代理机构委外'),
          receiverSapNo: '202100',
          bankName: '知产律所/服务机构',
          bankBranch: '专户',
          bankAccount: '11000000-88889999',
        },
        accountDetailInfo: {
          platformAccount: trademarkName,
          loginPasswordMasked: '••••••••••••',
          loginPasswordPlain: 'N/A',
          accountName: trademarkName,
          phone: '18888888888',
          accountAttribute: '知识产权重点无形资产',
        },
        financeAuditInfo: {
          isNewSupplier: '否',
          channel: '需求部门与法务部联动',
          sapNo: '202999',
          sapName: '234999',
        },
        orderRecords: [],
        paymentRecords: [],
        flowNodes: (wf.steps || []).map(s => ({
          role: s.role,
          userName: s.userName,
          status: s.status,
          comment: s.comment,
          timestamp: s.timestamp
        }))
      };
    };

    setApprovalList(prevList => {
      const convertedItems = approvals.map(convertWorkflowToDetailedItem);
      const existingMap = new Map<string, DetailedApprovalItem>(prevList.map(item => [item.id, item]));

      const newItems: DetailedApprovalItem[] = [];
      convertedItems.forEach(cItem => {
        if (!existingMap.has(cItem.id)) {
          newItems.push(cItem);
        } else {
          const existing = existingMap.get(cItem.id)!;
          existingMap.set(cItem.id, {
            ...existing,
            status: cItem.status,
            statusText: cItem.statusText,
            flowNodes: cItem.flowNodes.length > 0 ? cItem.flowNodes : existing.flowNodes
          });
        }
      });

      if (newItems.length > 0) {
        setSelectedId(newItems[0].id);
      }

      return [...newItems, ...Array.from(existingMap.values())];
    });
  }, [approvals]);

  // Selected Approval item
  const [selectedId, setSelectedId] = useState<string>(approvalList[0]?.id || '');
  const selectedApproval = useMemo(() => {
    return approvalList.find(item => item.id === selectedId) || approvalList[0];
  }, [approvalList, selectedId]);

  // Filtered List based on topTab, search and filters
  const filteredList = useMemo(() => {
    return approvalList.filter(item => {
      // Top tab filter
      if (topTab === 'PENDING') {
        if (item.status === 'APPROVED') return false;
      } else if (topTab === 'DONE') {
        if (item.status !== 'APPROVED') return false;
      } else if (topTab === 'MY_INITIATED') {
        if (item.applicant.name !== '陆燕丽' && item.applicant.name !== currentUser.name) return false;
      } else if (topTab === 'CC_ME') {
        // CC tab items
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchApplicant = item.applicant.name.toLowerCase().includes(q);
        const matchBrand = (item.contractBrand || '').toLowerCase().includes(q);
        const matchAccount = (item.platformAccount || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchApplicant && !matchBrand && !matchAccount) {
          return false;
        }
      }

      // Type Filter
      if (typeFilter !== 'ALL' && item.type !== typeFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'TIME_DESC') {
        return new Date(b.applyTime).getTime() - new Date(a.applyTime).getTime();
      } else if (sortOrder === 'TIME_ASC') {
        return new Date(a.applyTime).getTime() - new Date(b.applyTime).getTime();
      } else if (sortOrder === 'AMOUNT_DESC') {
        return (b.amount || 0) - (a.amount || 0);
      }
      return 0;
    });
  }, [approvalList, topTab, searchQuery, typeFilter, sortOrder, currentUser]);

  // Batch toggle
  const toggleSelectAll = () => {
    if (selectedItemIds.length === filteredList.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredList.map(i => i.id));
    }
  };

  const toggleSelectItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(i => i !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  // Actions
  const handleConfirmApprove = () => {
    if (!selectedApproval) return;
    const comment = modalComment.trim() || '同意审批，请按流程推进。';
    setApprovalList(prev => prev.map(item => {
      if (item.id === selectedApproval.id) {
        return {
          ...item,
          status: 'APPROVED',
          statusText: '已通过',
          flowNodes: [
            ...item.flowNodes.map(n => n.status === 'CURRENT' ? { ...n, status: 'APPROVED' as const, comment, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : n)
          ]
        };
      }
      return item;
    }));
    onApprove(selectedApproval.id, comment);
    setActiveModal(null);
    setModalComment('');
    showToast(`已同意单据【${selectedApproval.code}】审批`);
  };

  const handleConfirmReject = () => {
    if (!selectedApproval) return;
    const comment = modalComment.trim() || '单据信息有误，退回修改。';
    setApprovalList(prev => prev.map(item => {
      if (item.id === selectedApproval.id) {
        return {
          ...item,
          status: 'PENDING_RETURN',
          statusText: '审批中(被退回)',
          flowNodes: [
            ...item.flowNodes.map(n => n.status === 'CURRENT' ? { ...n, status: 'REJECTED' as const, comment, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : n)
          ]
        };
      }
      return item;
    }));
    onReject(selectedApproval.id, comment);
    setActiveModal(null);
    setModalComment('');
    showToast(`已退回单据【${selectedApproval.code}】`);
  };

  const handleBatchApprove = () => {
    if (selectedItemIds.length === 0) return;
    setApprovalList(prev => prev.map(item => {
      if (selectedItemIds.includes(item.id)) {
        return {
          ...item,
          status: 'APPROVED',
          statusText: '已通过',
        };
      }
      return item;
    }));
    showToast(`已成功批量通过 ${selectedItemIds.length} 项审批！`);
    setSelectedItemIds([]);
    setIsBatchMode(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`已复制${label}: ${text}`);
  };

  // Pending count calculation
  const pendingCount = useMemo(() => {
    return approvalList.filter(i => i.status !== 'APPROVED').length;
  }, [approvalList]);

  return (
    <div className="flex flex-col lg:flex-row gap-3.5 items-start text-slate-800 font-sans w-full">
      
      {/* Toast Notification (页面居中显示) */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] max-w-md px-6 py-4 bg-slate-900/95 backdrop-blur-md text-white text-sm font-semibold rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-slate-700/80 pointer-events-none text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Column (Task List Sidebar - 360px wide) */}
      <div className="w-full lg:w-[360px] shrink-0 bg-white rounded-lg border border-[#e5e7eb] flex flex-col overflow-hidden">
        
        {/* Top Sub-tabs (待办 20 | 已办 | 我发起的 | 抄送我) */}
        <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between text-xs text-slate-600">
            
            {/* 待办 */}
            <button
              onClick={() => setTopTab('PENDING')}
              className={`relative py-1 flex items-center cursor-pointer ${
                topTab === 'PENDING'
                  ? 'text-[#235fff] font-medium'
                  : 'hover:text-slate-900'
              }`}
            >
              <span>待办</span>
              <span className="ml-0.5 -mt-2.5 bg-[#e53e3e] text-white text-[10px] font-bold px-1 py-0.2 rounded-full min-w-[18px] text-center leading-tight">
                {pendingCount || 20}
              </span>
              {topTab === 'PENDING' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#235fff]"></span>
              )}
            </button>

            <span className="text-slate-300 text-xs">|</span>

            {/* 已办 */}
            <button
              onClick={() => setTopTab('DONE')}
              className={`relative px-1 py-1 transition-all cursor-pointer ${
                topTab === 'DONE' ? 'text-[#235fff] font-medium' : 'hover:text-slate-900'
              }`}
            >
              <span>已办</span>
              {topTab === 'DONE' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#235fff]"></span>
              )}
            </button>

            <span className="text-slate-300 text-xs">|</span>

            {/* 我发起的 */}
            <button
              onClick={() => setTopTab('MY_INITIATED')}
              className={`relative px-1 py-1 transition-all cursor-pointer ${
                topTab === 'MY_INITIATED' ? 'text-[#235fff] font-medium' : 'hover:text-slate-900'
              }`}
            >
              <span>我发起的</span>
              {topTab === 'MY_INITIATED' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#235fff]"></span>
              )}
            </button>

            <span className="text-slate-300 text-xs">|</span>

            {/* 抄送我 */}
            <button
              onClick={() => setTopTab('CC_ME')}
              className={`relative px-1 py-1 transition-all cursor-pointer ${
                topTab === 'CC_ME' ? 'text-[#235fff] font-medium' : 'hover:text-slate-900'
              }`}
            >
              <span>抄送我</span>
              {topTab === 'CC_ME' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#235fff]"></span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Row: Search, 时间 v, 审批类型 v, 排序 v, 批量审批 */}
        <div className="px-3.5 py-2.5 border-b border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-3">
              
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-0.5 rounded transition-colors cursor-pointer ${
                  isSearchOpen || searchQuery ? 'text-[#235fff]' : 'text-slate-700 hover:text-[#235fff]'
                }`}
                title="搜索单据"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              {/* 时间 dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'TIME' ? null : 'TIME')}
                  className="flex items-center gap-0.5 text-slate-700 hover:text-[#235fff] transition-colors cursor-pointer"
                >
                  <span>时间</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {openDropdown === 'TIME' && (
                  <div className="absolute left-0 top-full mt-1 w-28 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30 text-xs">
                    {[
                      { id: 'ALL', label: '全部时间' },
                      { id: 'TODAY', label: '今日提交' },
                      { id: 'WEEK', label: '近 7 天' },
                      { id: 'MONTH', label: '本月内' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setTimeFilter(t.id as any); setOpenDropdown(null); }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer ${
                          timeFilter === t.id ? 'text-[#235fff] font-bold bg-[#e9efff]/50' : 'text-slate-600'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 审批类型 dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'TYPE' ? null : 'TYPE')}
                  className="flex items-center gap-0.5 text-slate-700 hover:text-[#235fff] transition-colors cursor-pointer"
                >
                  <span>审批类型</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {openDropdown === 'TYPE' && (
                  <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30 text-xs">
                    {[
                      { id: 'ALL', label: '全部类型' },
                      { id: '商标检索与建案', label: '商标检索与建案申请审批' },
                      { id: '平台账号重启审批', label: '平台账号重启审批' },
                      { id: '转交审批', label: '转交审批' },
                      { id: '合同审批', label: '合同审批' },
                      { id: '新建品牌审批', label: '新建品牌审批' },
                      { id: '商标申请审批', label: '商标申请审批' },
                      { id: '异议维权出资审批', label: '异议维权出资审批' },
                      { id: '续展预算审批', label: '续展预算审批' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setTypeFilter(t.id); setOpenDropdown(null); }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer truncate ${
                          typeFilter === t.id ? 'text-[#235fff] font-bold bg-[#e9efff]/50' : 'text-slate-600'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 排序 dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'SORT' ? null : 'SORT')}
                  className="flex items-center gap-0.5 text-slate-700 hover:text-[#235fff] transition-colors cursor-pointer"
                >
                  <span>排序</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {openDropdown === 'SORT' && (
                  <div className="absolute left-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30 text-xs">
                    {[
                      { id: 'TIME_DESC', label: '提交时间 (新到旧)' },
                      { id: 'TIME_ASC', label: '提交时间 (旧到新)' },
                      { id: 'AMOUNT_DESC', label: '单据金额 (高到低)' },
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSortOrder(s.id as any); setOpenDropdown(null); }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer ${
                          sortOrder === s.id ? 'text-[#235fff] font-bold bg-[#e9efff]/50' : 'text-slate-600'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 批量审批 Toggle */}
            <button
              onClick={() => {
                setIsBatchMode(!isBatchMode);
                if (isBatchMode) setSelectedItemIds([]);
              }}
              className={`hover:text-[#235fff] transition-colors cursor-pointer text-xs text-slate-700 ${
                isBatchMode ? 'text-[#235fff] font-bold' : ''
              }`}
            >
              {isBatchMode ? '退出批量' : '批量审批'}
            </button>
          </div>

          {/* Expandable Search Input */}
          {isSearchOpen && (
            <div className="mt-2 relative">
              <input
                type="text"
                placeholder="搜索单据标题、编号、申请人..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#235fff]"
                autoFocus
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Batch Select All Bar */}
          {isBatchMode && (
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-[#e9efff]/40 p-2 rounded-md">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-slate-700 font-medium cursor-pointer"
              >
                {selectedItemIds.length === filteredList.length && filteredList.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-[#235fff]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>全选 ({selectedItemIds.length}/{filteredList.length})</span>
              </button>

              {selectedItemIds.length > 0 && (
                <button
                  onClick={handleBatchApprove}
                  className="px-3 py-1 bg-[#235fff] hover:bg-[#1b4edb] text-white rounded font-medium text-xs shadow-xs cursor-pointer"
                >
                  一键批量同意
                </button>
              )}
            </div>
          )}
        </div>

        {/* Cards List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[calc(100vh-230px)] bg-white">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-80" />
              <span>暂无符合条件的审批单据</span>
            </div>
          ) : (
            filteredList.map((item) => {
              const isSelected = selectedApproval?.id === item.id;
              const isItemChecked = selectedItemIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`relative p-3.5 rounded-[6px] border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-[#235fff] shadow-2xs'
                      : 'border-[#e5e7eb] hover:border-slate-300'
                  }`}
                >
                  {/* Header Row: Title & Status badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      {isBatchMode && (
                        <button
                          onClick={(e) => toggleSelectItem(item.id, e)}
                          className="cursor-pointer text-[#235fff]"
                        >
                          {isItemChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#235fff]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      )}
                      <h3 className="text-[13px] font-bold text-slate-900 line-clamp-1">
                        {item.type === '商标检索与建案' || item.type === '商标检索需求审批' || item.type === 'NEW_APPLICATION' || item.basicInfo?.accountType === '商标建案/检索申请'
                          ? '商标检索与建案申请审批'
                          : item.title}
                      </h3>
                    </div>

                    <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-[3px] font-medium text-white bg-[#ff8a00]">
                      {item.statusText}
                    </span>
                  </div>

                  {/* Middle Detail Lines strictly matching screenshot */}
                  <div className="space-y-1.5 text-xs leading-normal">
                    {item.type === '商标检索与建案' || item.type === '商标检索需求审批' || item.type === 'NEW_APPLICATION' || item.basicInfo?.accountType === '商标建案/检索申请' ? (
                      <>
                        <div>
                          <span className="text-slate-500">商标名称: </span>
                          <span className="text-slate-900 font-medium">{item.basicInfo?.contractName || item.accountName || item.platformAccount || '未命名商标'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">尼斯分类: </span>
                          <span className="text-slate-900 font-medium">{item.basicInfo?.accountCategory || item.category || '第21类'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">所属品牌: </span>
                          <span className="text-slate-900 font-medium">{item.contractBrand || item.basicInfo?.brand || 'usmile笑容加'}</span>
                        </div>
                      </>
                    ) : item.type === '平台账号重启审批' ? (
                      <>
                        <div>
                          <span className="text-slate-500">平台账号编号: </span>
                          <span className="text-slate-900 font-medium">{item.code}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">账号类型: </span>
                          <span className="text-slate-900 font-medium">{item.basicInfo.accountType}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">账号分类: </span>
                          <span className="text-slate-900 font-medium">{item.category}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">账号名称: </span>
                          <span className="text-slate-900 font-medium">{item.accountName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">平台账号: </span>
                          <span className="text-slate-900 font-medium">{item.platformAccount}</span>
                        </div>
                      </>
                    ) : item.type === '转交审批' ? (
                      <>
                        <div>
                          <span className="text-slate-500">单据类型: </span>
                          <span className="text-slate-900 font-medium">{item.category}</span>
                        </div>
                        <div className="truncate">
                          <span className="text-slate-500">单据编号: </span>
                          <span className="text-slate-900 font-medium">{item.code},{item.contractNo}...</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-slate-500">合同名称: </span>
                          <span className="text-slate-900 font-medium">{item.contractName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">合同品牌: </span>
                          <span className="text-slate-900 font-medium">{item.contractBrand}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">合同金额: </span>
                          <span className="text-slate-900 font-medium">{item.amount !== undefined ? `${item.amount.toFixed(2)}元` : '100.00元'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer Row: Applicant Avatar + Name, Timestamp */}
                  <div className="flex items-center justify-between mt-3 pt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={item.applicant.avatar}
                        alt={item.applicant.name}
                        className="w-4 h-4 rounded-full object-cover border border-slate-200"
                      />
                      <span className="text-slate-700 text-xs">{item.applicant.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{item.applyTime}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column (Detail Canvas) */}
      <div className="flex-1 w-full bg-white rounded-lg border border-[#e5e7eb] flex flex-col relative overflow-hidden watermark-bg">
        
        {selectedApproval ? (
          <>
            {/* Header Title & Sub-tabs */}
            <div className="p-5 pb-0">
              {/* Header Title & Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-[3px] font-medium text-white bg-[#ff8a00]">
                  {selectedApproval.statusText}
                </span>

                <h2 className="text-[17px] font-bold text-slate-900 flex items-center gap-2">
                  <span>{selectedApproval.title}</span>
                  <span className="text-slate-900">{selectedApproval.code}</span>
                </h2>

                <button
                  onClick={() => copyToClipboard(selectedApproval.code, '单据编号')}
                  className="p-1 text-[#235fff] hover:opacity-80 transition-colors cursor-pointer"
                  title="复制单据编号"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sub-Tabs under title: 平台账号信息 / 下单申请记录 / 付款记录 */}
              <div className="flex items-center gap-6 text-xs text-slate-700 border-b border-[#e5e7eb]">
                <button
                  onClick={() => setDetailTab('ACCOUNT_INFO')}
                  className={`pb-2.5 transition-all cursor-pointer relative ${
                    detailTab === 'ACCOUNT_INFO'
                      ? 'text-[#235fff] font-medium'
                      : 'hover:text-[#235fff]'
                  }`}
                >
                  <span>平台账号信息</span>
                  {detailTab === 'ACCOUNT_INFO' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#235fff]"></span>
                  )}
                </button>

                <button
                  onClick={() => setDetailTab('ORDER_RECORDS')}
                  className={`pb-2.5 transition-all cursor-pointer relative ${
                    detailTab === 'ORDER_RECORDS'
                      ? 'text-[#235fff] font-medium'
                      : 'hover:text-[#235fff]'
                  }`}
                >
                  <span>下单申请记录</span>
                  {detailTab === 'ORDER_RECORDS' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#235fff]"></span>
                  )}
                </button>

                <button
                  onClick={() => setDetailTab('PAYMENT_RECORDS')}
                  className={`pb-2.5 transition-all cursor-pointer relative ${
                    detailTab === 'PAYMENT_RECORDS'
                      ? 'text-[#235fff] font-medium'
                      : 'hover:text-[#235fff]'
                  }`}
                >
                  <span>付款记录</span>
                  {detailTab === 'PAYMENT_RECORDS' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#235fff]"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Detail Content Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 max-h-[calc(100vh-280px)] text-xs">
              
              {detailTab === 'ACCOUNT_INFO' && (
                <div className="space-y-6">
                  
                  {/* Section 1: | 重新启用原因 */}
                  {selectedApproval.restartReason && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="text-slate-900 font-bold leading-none">|</span>
                        <span>重新启用原因</span>
                      </h4>
                      <p className="text-xs text-slate-900 leading-relaxed pl-1 break-all">
                        {selectedApproval.restartReason}
                      </p>
                    </div>
                  )}

                  {/* Section 2: | 基本信息 (2 columns grid) */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-slate-900 font-bold leading-none">|</span>
                      <span>基本信息</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2.5 text-xs pl-1">
                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">账号类型:</span>
                        <span className="text-slate-900">{selectedApproval.basicInfo.accountType}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">账号分类:</span>
                        <span className="text-slate-900">{selectedApproval.basicInfo.accountCategory}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">渠道店铺:</span>
                        <span className="text-slate-900">{selectedApproval.basicInfo.channelStore}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">关联合同:</span>
                        <button
                          onClick={() => setActiveModal('CONTRACT')}
                          className="text-[#235fff] hover:underline cursor-pointer"
                        >
                          {selectedApproval.basicInfo.contractNo}
                        </button>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">签约品牌:</span>
                        <span className="text-slate-900">{selectedApproval.basicInfo.brand}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">合同名称:</span>
                        <span className="text-slate-900">{selectedApproval.basicInfo.contractName}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">合同投放性质:</span>
                        <span className="text-slate-900">{selectedApproval.basicInfo.contractNature}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">公司主体:</span>
                        <span className="text-slate-900">{selectedApproval.basicInfo.companyEntity}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">公司代码:</span>
                        <span className="text-slate-900">{selectedApproval.basicInfo.companyCode}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">账号SAP编号:</span>
                        <span className="text-slate-900">{selectedApproval.basicInfo.sapAccountNo}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">账号SAP名称:</span>
                        <span className="text-slate-900">{selectedApproval.basicInfo.sapAccountName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: | 平台收款信息 */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-slate-900 font-bold leading-none">|</span>
                      <span>平台收款信息</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2.5 text-xs pl-1">
                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">收款方名称:</span>
                        <span className="text-slate-900">{selectedApproval.receiptInfo.receiverName}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">收款方SAP账号:</span>
                        <span className="text-slate-900">{selectedApproval.receiptInfo.receiverSapNo}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">收款方开户银行:</span>
                        <span className="text-slate-900">{selectedApproval.receiptInfo.bankName}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">收款方开户支行:</span>
                        <span className="text-slate-900">{selectedApproval.receiptInfo.bankBranch}</span>
                      </div>

                      <div className="flex items-center md:col-span-2">
                        <span className="w-28 text-slate-500 shrink-0">收款方银行账户:</span>
                        <span className="text-slate-900">{selectedApproval.receiptInfo.bankAccount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: | 平台账号信息 */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-slate-900 font-bold leading-none">|</span>
                      <span>平台账号信息</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2.5 text-xs pl-1">
                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">平台账号:</span>
                        <span className="text-slate-900">{selectedApproval.accountDetailInfo.platformAccount}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">登录密码:</span>
                        <button
                          onClick={() => setActiveModal('PASSWORD')}
                          className="text-[#235fff] hover:underline cursor-pointer"
                        >
                          查看密码
                        </button>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">账号名称:</span>
                        <span className="text-slate-900">{selectedApproval.accountDetailInfo.accountName}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">账号绑定的手机号:</span>
                        <span className="text-slate-900">{selectedApproval.accountDetailInfo.phone}</span>
                      </div>

                      <div className="flex items-center md:col-span-2">
                        <span className="w-28 text-slate-500 shrink-0">账号属性:</span>
                        <span className="text-slate-900">{selectedApproval.accountDetailInfo.accountAttribute}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 5: | 财务审核信息 */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-slate-900 font-bold leading-none">|</span>
                      <span>财务审核信息</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2.5 text-xs pl-1">
                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">是否新建供应商:</span>
                        <span className="text-slate-900">{selectedApproval.financeAuditInfo.isNewSupplier}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">所属渠道:</span>
                        <span className="text-slate-900">{selectedApproval.financeAuditInfo.channel}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">账号SAP编号:</span>
                        <span className="text-slate-900">{selectedApproval.financeAuditInfo.sapNo}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-28 text-slate-500 shrink-0">账号SAP名称:</span>
                        <span className="text-slate-900">{selectedApproval.financeAuditInfo.sapName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'ORDER_RECORDS' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-slate-900 font-bold leading-none">|</span>
                    <span>下单申请记录</span>
                  </h4>

                  {selectedApproval.orderRecords.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-md">
                      暂无下单申请记录
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-md overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                          <tr>
                            <th className="p-2.5">下单编号</th>
                            <th className="p-2.5">投放计划</th>
                            <th className="p-2.5">申请金额</th>
                            <th className="p-2.5">申请时间</th>
                            <th className="p-2.5">状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {selectedApproval.orderRecords.map((rec, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="p-2.5 font-mono">{rec.orderNo}</td>
                              <td className="p-2.5 font-medium">{rec.planName}</td>
                              <td className="p-2.5 font-mono font-bold text-slate-900">{rec.amount}</td>
                              <td className="p-2.5 font-mono text-slate-400">{rec.time}</td>
                              <td className="p-2.5 text-emerald-600 font-semibold">{rec.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'PAYMENT_RECORDS' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-slate-900 font-bold leading-none">|</span>
                    <span>付款记录</span>
                  </h4>

                  {selectedApproval.paymentRecords.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-md">
                      暂无付款记录
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-md overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                          <tr>
                            <th className="p-2.5">流水号</th>
                            <th className="p-2.5">开户银行</th>
                            <th className="p-2.5">支付方式</th>
                            <th className="p-2.5">实付金额</th>
                            <th className="p-2.5">付款时间</th>
                            <th className="p-2.5">状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {selectedApproval.paymentRecords.map((pay, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="p-2.5 font-mono">{pay.paymentNo}</td>
                              <td className="p-2.5">{pay.bank}</td>
                              <td className="p-2.5">{pay.method}</td>
                              <td className="p-2.5 font-mono font-bold text-slate-900">{pay.amount}</td>
                              <td className="p-2.5 font-mono text-slate-400">{pay.payTime}</td>
                              <td className="p-2.5 text-emerald-600 font-semibold">{pay.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Action Bar: Dynamic based on topTab */}
            <div className="p-4 border-t border-[#e5e7eb] bg-white flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                
                {/* 驳回 Button (Outline Blue) */}
                {topTab === 'PENDING' && (
                  <>
                    <button
                      onClick={() => { setModalComment(''); setApproveFiles([]); setActiveModal('APPROVE'); }}
                      className="px-3.5 py-1 bg-[#235fff] hover:bg-[#1b4edb] text-white rounded-[3px] text-xs font-normal transition-colors cursor-pointer"
                    >
                      同意
                    </button>

                    <button
                      onClick={() => { setModalComment(''); setActiveModal('REJECT'); }}
                      className="px-3.5 py-1 border border-[#235fff] text-[#235fff] hover:bg-[#e9efff] rounded-[3px] text-xs font-normal transition-colors cursor-pointer bg-white"
                    >
                      驳回
                    </button>

                    <button
                      onClick={() => { setModalComment(''); setCommentFiles([]); setActiveModal('COMMENT'); }}
                      className="px-3.5 py-1 border border-[#235fff] text-[#235fff] hover:bg-[#e9efff] rounded-[3px] text-xs font-normal transition-colors cursor-pointer bg-white"
                    >
                      评论
                    </button>

                    <button
                      onClick={() => { setModalComment(''); setSelectedTransferUser(''); setActiveModal('TRANSFER'); }}
                      className="px-3.5 py-1 border border-[#235fff] text-[#235fff] hover:bg-[#e9efff] rounded-[3px] text-xs font-normal transition-colors cursor-pointer bg-white"
                    >
                      转交
                    </button>

                    <button
                      onClick={() => { setModalComment(''); setSelectedCcUser(''); setActiveModal('CC'); }}
                      className="px-3.5 py-1 border border-[#235fff] text-[#235fff] hover:bg-[#e9efff] rounded-[3px] text-xs font-normal transition-colors cursor-pointer bg-white"
                    >
                      抄送
                    </button>
                  </>
                )}

                {/* 已办列表：显示 [评论] [抄送] */}
                {topTab === 'DONE' && (
                  <>
                    <button
                      onClick={() => { setModalComment(''); setCommentFiles([]); setActiveModal('COMMENT'); }}
                      className="px-3.5 py-1 border border-[#235fff] text-[#235fff] hover:bg-[#e9efff] rounded-[3px] text-xs font-normal transition-colors cursor-pointer bg-white"
                    >
                      评论
                    </button>

                    <button
                      onClick={() => { setModalComment(''); setSelectedCcUser(''); setActiveModal('CC'); }}
                      className="px-3.5 py-1 border border-[#235fff] text-[#235fff] hover:bg-[#e9efff] rounded-[3px] text-xs font-normal transition-colors cursor-pointer bg-white"
                    >
                      抄送
                    </button>
                  </>
                )}

                {/* 我发起的列表：显示 [评论] [抄送] [催办] [撤回] */}
                {topTab === 'MY_INITIATED' && (
                  <>
                    <button
                      onClick={() => { setModalComment(''); setCommentFiles([]); setActiveModal('COMMENT'); }}
                      className="px-3.5 py-1 border border-[#235fff] text-[#235fff] hover:bg-[#e9efff] rounded-[3px] text-xs font-normal transition-colors cursor-pointer bg-white"
                    >
                      评论
                    </button>

                    <button
                      onClick={() => { setModalComment(''); setSelectedCcUser(''); setActiveModal('CC'); }}
                      className="px-3.5 py-1 border border-[#235fff] text-[#235fff] hover:bg-[#e9efff] rounded-[3px] text-xs font-normal transition-colors cursor-pointer bg-white"
                    >
                      抄送
                    </button>

                    <button
                      onClick={() => setActiveModal('URGE')}
                      className="px-3.5 py-1 border border-[#235fff] text-[#235fff] hover:bg-[#e9efff] rounded-[3px] text-xs font-normal transition-colors cursor-pointer bg-white"
                    >
                      催办
                    </button>

                    <button
                      onClick={() => { setModalComment(''); setActiveModal('WITHDRAW'); }}
                      className="px-3.5 py-1 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-[3px] text-xs font-normal transition-colors cursor-pointer bg-white"
                    >
                      撤回
                    </button>
                  </>
                )}

                {/* 抄送我的列表：显示 [评论] */}
                {topTab === 'CC_ME' && (
                  <button
                    onClick={() => { setModalComment(''); setCommentFiles([]); setActiveModal('COMMENT'); }}
                    className="px-3.5 py-1 border border-[#235fff] text-[#235fff] hover:bg-[#e9efff] rounded-[3px] text-xs font-normal transition-colors cursor-pointer bg-white"
                  >
                    评论
                  </button>
                )}

              </div>

              {/* Circular Floating button on the bottom right: 查看 */}
              <button
                onClick={() => setActiveModal('VIEW_FULL')}
                className="w-10 h-10 rounded-full bg-[#235fff] hover:bg-[#1b4edb] text-white text-xs font-normal flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0"
                title="查看完整单据"
              >
                <span>查看</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 text-xs">
            <FileText className="w-12 h-12 text-slate-300 mb-3" />
            <span>请从左侧列表选择待审批单据</span>
          </div>
        )}
      </div>

      {/* Modal Dialog: 同意审批 (样式精准对齐参考图) */}
      {activeModal === 'APPROVE' && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[500px] w-full p-6 shadow-2xl relative border border-slate-100 space-y-4">
            
            {/* Header: Title Centered with Top Right Close */}
            <div className="relative flex items-center justify-center pb-1">
              <h3 className="text-base font-bold text-slate-900">同意</h3>
              <button 
                onClick={() => setActiveModal(null)} 
                className="absolute right-0 top-0 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rich Editor Box Container */}
            <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all bg-white">
              
              {/* Toolbar */}
              <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-100 bg-white text-slate-600 text-xs select-none">
                <button 
                  type="button" 
                  onClick={() => setModalComment(prev => prev + '**粗体**')}
                  className="font-bold text-slate-700 hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer" 
                  title="加粗"
                >
                  B
                </button>

                <button 
                  type="button" 
                  onClick={() => setModalComment(prev => prev + '<u>下划线</u>')}
                  className="underline text-slate-700 hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer" 
                  title="下划线"
                >
                  U
                </button>

                <button 
                  type="button" 
                  onClick={() => setModalComment(prev => prev + '*斜体*')}
                  className="italic font-serif text-slate-700 hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer" 
                  title="斜体"
                >
                  I
                </button>

                <button 
                  type="button" 
                  onClick={() => setModalComment('')}
                  className="p-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer" 
                  title="清除格式"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>

                <div className="h-3 w-[1px] bg-slate-200"></div>

                <button 
                  type="button" 
                  className="flex items-center gap-0.5 px-1 py-0.5 hover:bg-slate-100 rounded cursor-pointer text-slate-700" 
                  title="字体颜色"
                >
                  <span className="font-bold text-xs underline decoration-[#235fff] decoration-2">A</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                <button 
                  type="button" 
                  className="flex items-center gap-0.5 px-1 py-0.5 hover:bg-slate-100 rounded cursor-pointer text-slate-700" 
                  title="背景高亮"
                >
                  <span className="font-bold text-xs bg-slate-200 px-0.5 rounded">A</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                <div className="h-3 w-[1px] bg-slate-200"></div>

                <button 
                  type="button" 
                  onClick={() => setModalComment(prev => prev + '\n- ')}
                  className="p-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer" 
                  title="无序列表"
                >
                  <List className="w-3.5 h-3.5" />
                </button>

                <button 
                  type="button" 
                  className="p-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer" 
                  title="撤销"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>

                <button 
                  type="button" 
                  className="p-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer" 
                  title="重做"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Textarea Area */}
              <div className="relative p-3 bg-white min-h-[160px] flex flex-col justify-between">
                <textarea
                  rows={5}
                  value={modalComment}
                  onChange={(e) => setModalComment(e.target.value.slice(0, 1000))}
                  placeholder="请输入内容..."
                  className="w-full text-xs text-slate-800 placeholder:text-slate-300 placeholder:italic resize-none focus:outline-none bg-transparent"
                  autoFocus
                />
                
                {/* Word counter at bottom right */}
                <div className="text-right text-[11px] font-mono text-slate-400 select-none pt-1">
                  {modalComment.length} / 1000
                </div>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="relative">
              <input 
                type="file" 
                multiple 
                className="hidden" 
                id="approve-file-upload-input"
                onChange={(e) => {
                  if (e.target.files) {
                    const newFiles = Array.from(e.target.files).map(f => ({
                      name: f.name,
                      size: (f.size / (1024 * 1024)).toFixed(2) + 'MB'
                    }));
                    setApproveFiles(prev => [...prev, ...newFiles]);
                  }
                }}
              />
              <label 
                htmlFor="approve-file-upload-input"
                className="block p-3.5 border border-dashed border-slate-200 hover:border-blue-400 rounded-lg bg-white hover:bg-slate-50/50 text-center transition-all cursor-pointer group"
              >
                <div className="text-[#235fff] font-medium text-xs flex items-center justify-center gap-1 group-hover:underline">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>上传文件</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  支持上传多个文件,单个文件大小不超过1G,不限文件格式
                </p>
              </label>

              {/* Uploaded files list */}
              {approveFiles.length > 0 && (
                <div className="mt-2 space-y-1 max-h-24 overflow-y-auto text-xs">
                  {approveFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100 text-slate-700">
                      <span className="truncate max-w-[300px] text-[11px]">{f.name} ({f.size})</span>
                      <button 
                        onClick={() => setApproveFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions: Cancel (Gray) & Confirm (Blue) Centered */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-1.5 rounded-md bg-[#eef1f6] hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-6 py-1.5 rounded-md bg-[#235fff] hover:bg-[#1b4edb] text-white text-xs font-medium cursor-pointer shadow-2xs transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: 驳回审批 (样式精准对齐参考图) */}
      {activeModal === 'REJECT' && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[500px] w-full p-6 shadow-2xl relative border border-slate-100 space-y-5">
            
            {/* Header: Title Centered with Top Right Close */}
            <div className="relative flex items-center justify-center pt-1">
              <h3 className="text-base font-bold text-slate-900">驳回</h3>
              <button 
                onClick={() => setActiveModal(null)} 
                className="absolute right-0 top-0 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Container Box */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-white focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all relative">
              <textarea
                rows={4}
                value={modalComment}
                onChange={(e) => setModalComment(e.target.value.slice(0, 1000))}
                placeholder="请输入驳回原因(必填)"
                className="w-full text-xs text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none bg-transparent min-h-[110px]"
                autoFocus
              />
              
              {/* Word counter at bottom right */}
              <div className="flex items-center justify-end text-[12px] font-mono text-slate-400 select-none pt-1">
                <span>{modalComment.length} / 1000</span>
              </div>
            </div>

            {/* Bottom Actions: Cancel (Gray) & Confirm (Blue) Centered */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-1.5 rounded-md bg-[#eef1f6] hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-6 py-1.5 rounded-md bg-[#235fff] hover:bg-[#1b4edb] text-white text-xs font-medium cursor-pointer shadow-2xs transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: 评论 (样式精准对齐参考图) */}
      {activeModal === 'COMMENT' && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[500px] w-full p-6 shadow-2xl relative border border-slate-100 space-y-4">
            
            {/* Header: Title Centered with Top Right Close */}
            <div className="relative flex items-center justify-center pb-1">
              <h3 className="text-base font-bold text-slate-900">评论</h3>
              <button 
                onClick={() => setActiveModal(null)} 
                className="absolute right-0 top-0 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rich Editor Box Container */}
            <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all bg-white">
              
              {/* Toolbar */}
              <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-100 bg-white text-slate-600 text-xs select-none">
                <button 
                  type="button" 
                  onClick={() => setModalComment(prev => prev + '**粗体**')}
                  className="font-bold text-slate-700 hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer" 
                  title="加粗"
                >
                  B
                </button>

                <button 
                  type="button" 
                  onClick={() => setModalComment(prev => prev + '<u>下划线</u>')}
                  className="underline text-slate-700 hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer" 
                  title="下划线"
                >
                  U
                </button>

                <button 
                  type="button" 
                  onClick={() => setModalComment(prev => prev + '*斜体*')}
                  className="italic font-serif text-slate-700 hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer" 
                  title="斜体"
                >
                  I
                </button>

                <button 
                  type="button" 
                  onClick={() => setModalComment('')}
                  className="p-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer" 
                  title="清除格式"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>

                <div className="h-3 w-[1px] bg-slate-200"></div>

                <button 
                  type="button" 
                  className="flex items-center gap-0.5 px-1 py-0.5 hover:bg-slate-100 rounded cursor-pointer text-slate-700" 
                  title="字体颜色"
                >
                  <span className="font-bold text-xs underline decoration-[#235fff] decoration-2">A</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                <button 
                  type="button" 
                  className="flex items-center gap-0.5 px-1 py-0.5 hover:bg-slate-100 rounded cursor-pointer text-slate-700" 
                  title="背景高亮"
                >
                  <span className="font-bold text-xs bg-slate-200 px-0.5 rounded">A</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                <div className="h-3 w-[1px] bg-slate-200"></div>

                <button 
                  type="button" 
                  onClick={() => setModalComment(prev => prev + '\n- ')}
                  className="p-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer" 
                  title="无序列表"
                >
                  <List className="w-3.5 h-3.5" />
                </button>

                <button 
                  type="button" 
                  className="p-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer" 
                  title="撤销"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>

                <button 
                  type="button" 
                  className="p-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer" 
                  title="重做"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Textarea Area */}
              <div className="relative p-3 bg-white min-h-[160px] flex flex-col justify-between">
                <textarea
                  rows={5}
                  value={modalComment}
                  onChange={(e) => setModalComment(e.target.value.slice(0, 1000))}
                  placeholder="请输入内容..."
                  className="w-full text-xs text-slate-800 placeholder:text-slate-300 placeholder:italic resize-none focus:outline-none bg-transparent"
                  autoFocus
                />
                
                {/* Word counter at bottom right */}
                <div className="text-right text-[11px] font-mono text-slate-400 select-none pt-1">
                  {modalComment.length} / 1000
                </div>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="relative">
              <input 
                type="file" 
                multiple 
                className="hidden" 
                id="comment-file-upload-input"
                onChange={(e) => {
                  if (e.target.files) {
                    const newFiles = Array.from(e.target.files).map(f => ({
                      name: f.name,
                      size: (f.size / (1024 * 1024)).toFixed(2) + 'MB'
                    }));
                    setCommentFiles(prev => [...prev, ...newFiles]);
                  }
                }}
              />
              <label 
                htmlFor="comment-file-upload-input"
                className="block p-3.5 border border-dashed border-slate-200 hover:border-blue-400 rounded-lg bg-white hover:bg-slate-50/50 text-center transition-all cursor-pointer group"
              >
                <div className="text-[#235fff] font-medium text-xs flex items-center justify-center gap-1 group-hover:underline">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>上传文件</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  支持上传多个文件,单个文件大小不超过1G,不限文件格式
                </p>
              </label>

              {/* Uploaded files list */}
              {commentFiles.length > 0 && (
                <div className="mt-2 space-y-1 max-h-24 overflow-y-auto text-xs">
                  {commentFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100 text-slate-700">
                      <span className="truncate max-w-[300px] text-[11px]">{f.name} ({f.size})</span>
                      <button 
                        onClick={() => setCommentFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions: Cancel (Gray) & Confirm (Blue) Centered */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-1.5 rounded-md bg-[#eef1f6] hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  showToast('已成功发布评论');
                  setActiveModal(null);
                  setModalComment('');
                  setCommentFiles([]);
                }}
                className="px-6 py-1.5 rounded-md bg-[#235fff] hover:bg-[#1b4edb] text-white text-xs font-medium cursor-pointer shadow-2xs transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: 转交 (样式精准对齐参考图) */}
      {activeModal === 'TRANSFER' && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[500px] w-full p-6 shadow-2xl relative border border-slate-100 space-y-5">
            
            {/* Header: Title Centered with Top Right Close */}
            <div className="relative flex items-center justify-center pt-1">
              <h3 className="text-base font-bold text-slate-900">转交</h3>
              <button 
                onClick={() => setActiveModal(null)} 
                className="absolute right-0 top-0 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* 交接人 */}
              <div>
                <label className="block text-xs font-normal text-slate-900 mb-1.5">
                  <span className="text-rose-500 mr-0.5">*</span>交接人
                </label>
                <div className="relative">
                  <select
                    value={selectedTransferUser}
                    onChange={(e) => setSelectedTransferUser(e.target.value)}
                    className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer placeholder:text-slate-400"
                  >
                    <option value="" disabled hidden>请选择</option>
                    <option value="徐明哲 (法务总监)">徐明哲 (法务总监)</option>
                    <option value="唐宁 (数字营销部主管)">唐宁 (数字营销部主管)</option>
                    <option value="黄洁 (财务风控VP)">黄洁 (财务风控VP)</option>
                    <option value="陈志远 (知识产权运营)">陈志远 (知识产权运营)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 转交原因 */}
              <div>
                <label className="block text-xs font-normal text-slate-900 mb-1.5">
                  <span className="text-rose-500 mr-0.5">*</span>转交原因
                </label>
                <div className="border border-slate-200 rounded-lg p-3 bg-white focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all relative">
                  <textarea
                    rows={4}
                    value={modalComment}
                    onChange={(e) => setModalComment(e.target.value.slice(0, 1000))}
                    placeholder="请输入"
                    className="w-full text-xs text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none bg-transparent min-h-[110px]"
                    autoFocus
                  />
                  
                  {/* Word counter at bottom right */}
                  <div className="flex items-center justify-end text-[12px] font-mono text-slate-400 select-none pt-1">
                    <span>{modalComment.length} / 1000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Cancel (Gray) & Confirm (Blue) Centered */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-1.5 rounded-md bg-[#eef1f6] hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  showToast(`已成功转交单据${selectedTransferUser ? '至 ' + selectedTransferUser : ''}`);
                  setActiveModal(null);
                  setModalComment('');
                  setSelectedTransferUser('');
                }}
                className="px-6 py-1.5 rounded-md bg-[#235fff] hover:bg-[#1b4edb] text-white text-xs font-medium cursor-pointer shadow-2xs transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: 抄送 (样式精准对齐参考图) */}
      {activeModal === 'CC' && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[500px] w-full p-6 shadow-2xl relative border border-slate-100 space-y-5">
            
            {/* Header: Title Centered with Top Right Close */}
            <div className="relative flex items-center justify-center pt-1">
              <h3 className="text-base font-bold text-slate-900">抄送</h3>
              <button 
                onClick={() => setActiveModal(null)} 
                className="absolute right-0 top-0 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* 抄送人 */}
              <div>
                <label className="block text-xs font-normal text-slate-900 mb-1.5">
                  <span className="text-rose-500 mr-0.5">*</span>抄送人
                </label>
                <div className="relative">
                  <select
                    value={selectedCcUser}
                    onChange={(e) => setSelectedCcUser(e.target.value)}
                    className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer placeholder:text-slate-400"
                  >
                    <option value="" disabled hidden>请选择</option>
                    <option value="陆燕丽 (申请人)">陆燕丽 (申请人)</option>
                    <option value="林悦 (法务专员)">林悦 (法务专员)</option>
                    <option value="陈志远 (资产管理员)">陈志远 (资产管理员)</option>
                    <option value="苏晓 (品牌中心VP)">苏晓 (品牌中心VP)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 抄送原因 */}
              <div>
                <label className="block text-xs font-normal text-slate-900 mb-1.5">
                  <span className="text-rose-500 mr-0.5">*</span>抄送原因
                </label>
                <div className="border border-slate-200 rounded-lg p-3 bg-white focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all relative">
                  <textarea
                    rows={4}
                    value={modalComment}
                    onChange={(e) => setModalComment(e.target.value.slice(0, 1000))}
                    placeholder="请输入"
                    className="w-full text-xs text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none bg-transparent min-h-[110px]"
                    autoFocus
                  />
                  
                  {/* Word counter at bottom right */}
                  <div className="flex items-center justify-end text-[12px] font-mono text-slate-400 select-none pt-1">
                    <span>{modalComment.length} / 1000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Cancel (Gray) & Confirm (Blue) Centered */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-1.5 rounded-md bg-[#eef1f6] hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  showToast(`已成功抄送单据${selectedCcUser ? '至 ' + selectedCcUser : ''}`);
                  setActiveModal(null);
                  setModalComment('');
                  setSelectedCcUser('');
                }}
                className="px-6 py-1.5 rounded-md bg-[#235fff] hover:bg-[#1b4edb] text-white text-xs font-medium cursor-pointer shadow-2xs transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: 查看密码 */}
      {activeModal === 'PASSWORD' && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">平台账号安全密码</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">平台账号:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedApproval.accountDetailInfo.platformAccount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">登录密码:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#235fff] text-sm">
                      {showPasswordInModal ? selectedApproval.accountDetailInfo.loginPasswordPlain : '••••••••••••'}
                    </span>
                    <button
                      onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={showPasswordInModal ? '隐藏密码' : '显示明文'}
                    >
                      {showPasswordInModal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                🔒 安全提示：密码包含品牌关键投放权限，操作已同步记入飞书操作审计日志。
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  copyToClipboard(selectedApproval.accountDetailInfo.loginPasswordPlain, '登录密码');
                }}
                className="px-4 py-1.5 rounded-lg border border-[#235fff] text-[#235fff] hover:bg-[#e9efff] text-xs font-semibold cursor-pointer"
              >
                复制密码
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-1.5 rounded-lg bg-[#235fff] hover:bg-[#1b4edb] text-white text-xs font-semibold shadow-xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: 关联合同信息 */}
      {activeModal === 'CONTRACT' && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">关联合同详情</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">合同编号:</span>
                  <span className="font-mono font-bold text-[#235fff]">{selectedApproval.basicInfo.contractNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">合同名称:</span>
                  <span className="font-bold text-slate-900">{selectedApproval.basicInfo.contractName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">签约品牌:</span>
                  <span className="font-bold text-slate-900">{selectedApproval.basicInfo.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">签约主体:</span>
                  <span className="text-slate-900">{selectedApproval.basicInfo.companyEntity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">合同投放性质:</span>
                  <span className="text-slate-900">{selectedApproval.basicInfo.contractNature}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  copyToClipboard(selectedApproval.basicInfo.contractNo, '合同编号');
                }}
                className="px-4 py-1.5 rounded-lg border border-[#235fff] text-[#235fff] hover:bg-[#e9efff] text-xs font-semibold cursor-pointer"
              >
                复制合同号
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-1.5 rounded-lg bg-[#235fff] hover:bg-[#1b4edb] text-white text-xs font-semibold shadow-xs"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: 催办 */}
      {activeModal === 'URGE' && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#235fff]" />
                <span>发送审批催办通知</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3">
              <p className="leading-relaxed">
                将向单据 <strong className="text-slate-900">{selectedApproval.code}</strong> 的当前环节处理人发送站内信与企微催办提醒。
              </p>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">催办附言：</label>
                <textarea
                  rows={3}
                  value={modalComment}
                  onChange={(e) => setModalComment(e.target.value)}
                  placeholder="请输入催办提醒附言（例如：此建案项目紧急，烦请优先审阅，谢谢！）..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#235fff]"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  showToast('已成功发送催办提醒通知至审批节点处理人');
                  setActiveModal(null);
                  setModalComment('');
                }}
                className="px-5 py-1.5 rounded-lg bg-[#235fff] hover:bg-[#1b4edb] text-white text-xs font-semibold shadow-xs"
              >
                确认催办
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: 撤回 (样式精准对齐参考图) */}
      {activeModal === 'WITHDRAW' && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[500px] w-full p-6 shadow-2xl relative border border-slate-100 space-y-5">
            
            {/* Header: Title Centered with Top Right Close */}
            <div className="relative flex items-center justify-center pt-1">
              <h3 className="text-base font-bold text-slate-900">撤回审批</h3>
              <button 
                onClick={() => setActiveModal(null)} 
                className="absolute right-0 top-0 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Container Box */}
            <div className="border border-slate-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 rounded-lg p-3.5 bg-white relative">
              <textarea
                rows={4}
                value={modalComment}
                onChange={(e) => setModalComment(e.target.value.slice(0, 1000))}
                placeholder="请输入撤回原因(必填)"
                className="w-full text-xs text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none bg-transparent min-h-[110px]"
                autoFocus
              />
              
              {/* Word counter at bottom right */}
              <div className="flex items-center justify-end text-[12px] font-mono text-slate-400 select-none pt-1">
                <span>{modalComment.length} / 1000</span>
              </div>
            </div>

            {/* Bottom Actions: Cancel (Gray) & Confirm (Blue) Centered */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-1.5 rounded-md bg-[#eef1f6] hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setApprovalList(prev => prev.map(item => item.id === selectedApproval.id ? { ...item, status: 'REJECTED', statusText: '已撤回' } : item));
                  showToast('单据已成功撤回');
                  setActiveModal(null);
                  setModalComment('');
                }}
                className="px-6 py-1.5 rounded-md bg-[#235fff] hover:bg-[#1b4edb] text-white text-xs font-medium cursor-pointer shadow-2xs transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: 查看完整单据 */}
      {activeModal === 'VIEW_FULL' && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#235fff] bg-[#e9efff] px-2 py-0.5 rounded">
                  {selectedApproval.statusText}
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedApproval.title} · {selectedApproval.code}</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-1">重新启用原因：</span>
                <p className="text-slate-800 leading-relaxed">{selectedApproval.restartReason}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 border border-slate-200 rounded-lg">
                <div><span className="text-slate-400">申请人：</span><span className="font-semibold text-slate-900">{selectedApproval.applicant.name} ({selectedApproval.applicant.dept})</span></div>
                <div><span className="text-slate-400">申请时间：</span><span className="font-mono text-slate-700">{selectedApproval.applyTime}</span></div>
                <div><span className="text-slate-400">签约品牌：</span><span className="font-bold text-slate-900">{selectedApproval.basicInfo.brand}</span></div>
                <div><span className="text-slate-400">关联合同：</span><span className="font-mono text-[#235fff]">{selectedApproval.basicInfo.contractNo}</span></div>
                <div><span className="text-slate-400">公司主体：</span><span className="text-slate-900">{selectedApproval.basicInfo.companyEntity}</span></div>
                <div><span className="text-slate-400">SAP编号：</span><span className="font-mono text-slate-900">{selectedApproval.basicInfo.sapAccountNo}</span></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-1.5 rounded-lg bg-[#235fff] hover:bg-[#1b4edb] text-white text-xs font-semibold shadow-xs"
              >
                完成浏览
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
