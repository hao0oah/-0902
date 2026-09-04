import { Pagination } from "./Pagination";
import React, { useState, useMemo } from 'react';
import { 
  Users2, 
  Clock, 
  CheckCircle2, 
  Mail, 
  Search, 
  FileText,
  Upload,
  Download,
  Filter,
  AlertCircle,
  AlertTriangle,
  Send,
  Eye,
  Check,
  FileCheck,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldAlert,
  Building2,
  RefreshCw,
  Plus,
  X,
  FileSpreadsheet,
  FileCode,
  FileImage,
  FolderArchive,
  Folder,
  File,
  Link2,
  Trash2,
  FolderSync,
  Copy,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Stamp,
  Calendar,
  User,
  ExternalLink,
  Printer,
  CheckSquare,
  Globe2,
  CircleDot,
  FileCheck2,
  CalendarDays,
  ListTodo,
  FileEdit,
  Briefcase,
  Info
} from 'lucide-react';
import { AgencyPartner, CaseManagementItem, DocumentCategory, CaseOfficialDocument, UserProfile } from '../types';
import { INITIAL_CASE_MANAGEMENT_ITEMS } from '../data/mockData';
import { addSyncedDocToCase } from '../lib/docSyncStore';
import { 
  PortfolioLedger, 
  REGISTRATION_PROGRESS_OPTIONS,
  HANDLING_TASK_NAME_OPTIONS,
  HANDLING_TASK_STATUS_OPTIONS,
  HANDLING_TASK_STAGE_OPTIONS
} from './PortfolioLedger';

interface AgencyCollaborationProps {
  agencies: AgencyPartner[];
  caseItems?: CaseManagementItem[];
  currentUser?: UserProfile;
  onUpdateCase?: (updated: CaseManagementItem) => void;
}

export type TabType = 'PENDING' | 'FILE_EXCHANGE' | 'INFO_MANAGEMENT';

// 交互与上传类型
export type UploadFileType = 'CHINA_ELECTRONIC_NOTICE' | 'OTHER_NOTICE' | 'OTHER_FILE';

export interface PendingCollaborationItem {
  id: string;
  taskNo: string;
  fileName: string;
  interactionType: string;         // 交互类型 (如：中国商标电子通知书、其它通知书、其它类型文件、审查意见答辩、授权委托书等)
  uploadType: UploadFileType;      // 上传分类归属
  agencyName: string;              // 代理机构 (代理结构)
  agencyDocketNo?: string;         // 代理卷宗号
  uploader: string;                // 上传人
  uploaderRole?: string;           // 上传人角色
  status: 'PENDING_CONFIRM' | 'PENDING_PROCESS' | 'CONFIRMED' | 'IN_PROGRESS' | 'ARCHIVED';
  statusName: string;              // 状态显示名
  fileSize: string;                // 文件大小
  fileFormat: string;              // PDF / ZIP / XML / DOCX / PNG
  uploadTime: string;              // 上传时间
  caseNo?: string;                 // 预设或关联案号
  trademarkName?: string;          // 涉及商标名
  applicationNo?: string;          // 申请号
  classes?: string;                // 涉及类别
  docNumber?: string;              // 官方发文文号 / 文件文号
  officialDate?: string;           // 发文日期 / 签署日期
  remarks?: string;                // 备注
  syncedCaseNo?: string;           // 已同步案号
  syncedTime?: string;             // 同步时间
  fileUrl?: string;                // 真实源文件 Blob/Data URL
  rawText?: string;                // 源文件文本内容 (供查看源文件)
  previewData?: {
    headerTitle?: string;
    subHeader?: string;
    docNo?: string;
    dispatchDate?: string;
    recipientAgency?: string;
    applicant?: string;
    trademarkName?: string;
    applicationNo?: string;
    classCode?: string;
    mainContent?: string;
    examinerRemarks?: string;
    sealText?: string;
    fileList?: { name: string; size: string; type: string }[];
  };
}

export interface FileExchangeItem {
  id: string;
  fileName: string;
  category: 'POA' | 'OA_DOC' | 'EVIDENCE' | 'INVOICE' | 'CERTIFICATE' | 'CHINA_NOTICE';
  categoryName: string;
  agencyName: string;
  caseNo: string;
  uploadTime: string;
  uploader: string;
  fileSize: string;
  status: 'PENDING_CONFIRM' | 'CONFIRMED' | 'AUDITING' | 'ARCHIVED';
  statusName: string;
  version: string;
}

// 预设初始待处理列表数据 (覆盖中国商标电子通知书、其它通知书、其它类型文件等真实交互场景)
const INITIAL_PENDING_ITEMS: PendingCollaborationItem[] = [
  {
    id: 'PEND-001',
    taskNo: 'CL-20260822-01',
    fileName: '关于第68930211号“usmile”商标注册申请初步审定公告通知书.pdf',
    interactionType: '中国商标电子通知书',
    uploadType: 'CHINA_ELECTRONIC_NOTICE',
    agencyName: '北京市柳沈律师事务所',
    agencyDocketNo: 'LS-2026-TM-0891',
    uploader: '张锦程 (商标代理人)',
    uploaderRole: '外部代理律所',
    status: 'PENDING_CONFIRM',
    statusName: '待确认',
    fileSize: '1.8 MB',
    fileFormat: 'PDF',
    uploadTime: '2026-08-22 09:30',
    caseNo: 'CN20260105-TM',
    trademarkName: 'usmile',
    applicationNo: '68930211',
    classes: '21',
    docNumber: '发文字[2026]第089302号',
    officialDate: '2026-08-21',
    remarks: '国家知识产权局商标局第1892期初审公告电子通知书，请及时确认并同步卷宗。',
    previewData: {
      headerTitle: '国家知识产权局商标局',
      subHeader: '商标初步审定公告电子通知书',
      docNo: '发文字[2026]第089302号',
      dispatchDate: '2026-08-21',
      recipientAgency: '北京市柳沈律师事务所',
      applicant: '广州星际悦动股份有限公司',
      trademarkName: 'usmile',
      applicationNo: '68930211',
      classCode: '21',
      mainContent: '根据《中华人民共和国商标法》第二十八条之规定，经实质审查，下列商标注册申请符合法律规定，予以初步审定并公告。自公告之日起三个月内，任何人均可提出异议。',
      examinerRemarks: '初审公告期为 2026年08月21日 至 2026年11月21日，无在先冲突障碍。',
      sealText: '国家知识产权局商标局 电子发文专用章'
    }
  },
  {
    id: 'PEND-002',
    taskNo: 'CL-20260821-04',
    fileName: 'USPTO_Office_Action_Official_Notice_TECHNOVA_Class9.pdf',
    interactionType: '其它通知书',
    uploadType: 'OTHER_NOTICE',
    agencyName: 'Baker & McKenzie',
    agencyDocketNo: 'BM-US-2026-0412',
    uploader: 'Andrew Miller (Baker & McKenzie)',
    uploaderRole: '海外代理律师',
    status: 'PENDING_CONFIRM',
    statusName: '待确认',
    fileSize: '3.4 MB',
    fileFormat: 'PDF',
    uploadTime: '2026-08-21 15:45',
    caseNo: 'US20260412-TM',
    trademarkName: 'TECHNOVA',
    applicationNo: '97882109',
    classes: '09',
    docNumber: 'OA-USPTO-20260819',
    officialDate: '2026-08-19',
    remarks: '美国审查官针对 Class 9 显著性提出驳回审查意见 (Office Action)，法定答辩期3个月。',
    previewData: {
      headerTitle: 'UNITED STATES PATENT AND TRADEMARK OFFICE (USPTO)',
      subHeader: 'OFFICIAL OFFICE ACTION - PROVISIONAL REFUSAL',
      docNo: 'OA-USPTO-20260819',
      dispatchDate: '2026-08-19',
      recipientAgency: 'Baker & McKenzie LLP (US Docketing Group)',
      applicant: 'Guangzhou Starfield Delight Co., Ltd.',
      trademarkName: 'TECHNOVA',
      applicationNo: '97/882,109',
      classCode: 'International Class 09',
      mainContent: 'The trademark examining attorney has reviewed the referenced application and determined the following: Refusal under Trademark Act Section 2(e)(1) regarding descriptiveness. Applicant may respond by providing evidence of acquired distinctiveness under Section 2(f) or submitting appropriate specimen amendments.',
      examinerRemarks: 'Statutory Response Deadline: November 19, 2026. Teleconference requested.',
      sealText: 'COMMISSIONER FOR TRADEMARKS - USPTO SEAL'
    }
  },
  {
    id: 'PEND-003',
    taskNo: 'CL-20260820-03',
    fileName: 'POA_Power_Of_Attorney_Singapore_Signed_Notarized.pdf',
    interactionType: '其它类型文件',
    uploadType: 'OTHER_FILE',
    agencyName: 'Allen & Gledhill LLP',
    agencyDocketNo: 'AG-SG-2026-0891',
    uploader: '陆燕丽 (知产专员)',
    uploaderRole: '内部法务',
    status: 'PENDING_CONFIRM',
    statusName: '待确认',
    fileSize: '1.2 MB',
    fileFormat: 'PDF',
    uploadTime: '2026-08-20 11:20',
    caseNo: 'SG20260101-TM',
    trademarkName: 'usmile CARE',
    applicationNo: 'SG40202608912P',
    classes: '10, 21',
    docNumber: 'POA-SG-20260820',
    officialDate: '2026-08-20',
    remarks: '新加坡 IPOS 官方呈报授权委托书 (POA) 盖章与公证扫描原件，待关联同步至案件。',
    previewData: {
      headerTitle: 'INTELLECTUAL PROPERTY OFFICE OF SINGAPORE (IPOS)',
      subHeader: 'FORM TM 1 - AUTHORIZATION OF AGENT / POWER OF ATTORNEY',
      docNo: 'POA-SG-20260820',
      dispatchDate: '2026-08-20',
      recipientAgency: 'Allen & Gledhill LLP (Singapore)',
      applicant: 'usmile Global (Singapore) Pte. Ltd.',
      trademarkName: 'usmile CARE',
      applicationNo: 'SG40202608912P',
      classCode: 'Classes 10, 21',
      mainContent: 'The undersigned hereby appoints Allen & Gledhill LLP as our legal representative and trademark agent before IPOS for all matters concerning the registration, defense, maintenance, and renewal of the trademark.',
      examinerRemarks: 'Notarization verified by Singapore Embassy Legalization Office.',
      sealText: 'REGISTERED TRADEMARK AGENT EMBOSSMENT'
    }
  },
  {
    id: 'PEND-004',
    taskNo: 'CL-20260819-02',
    fileName: '中国国家知识产权局_商标注册申请受理通知书_第10类.pdf',
    interactionType: '中国商标电子通知书',
    uploadType: 'CHINA_ELECTRONIC_NOTICE',
    agencyName: '北京国智知产代理有限公司',
    agencyDocketNo: 'GZ-2026-CN-0988',
    uploader: '李沐 (法务专员)',
    uploaderRole: '内部法务',
    status: 'PENDING_CONFIRM',
    statusName: '待确认',
    fileSize: '950 KB',
    fileFormat: 'PDF',
    uploadTime: '2026-08-19 14:10',
    caseNo: 'CN20260812-TM',
    trademarkName: '笑容加 SMILEPLUS',
    applicationNo: '71089234',
    classes: '10',
    docNumber: '发文字[2026]第067189号',
    officialDate: '2026-08-18',
    remarks: '中国商标网官方电子发文系统下发《受理通知书》，申请号 71089234 已正式下发。',
    previewData: {
      headerTitle: '国家知识产权局',
      subHeader: '商标注册申请受理通知书',
      docNo: '发文字[2026]第067189号',
      dispatchDate: '2026-08-18',
      recipientAgency: '北京国智知产代理有限公司',
      applicant: '广州笑容加健康科技有限公司',
      trademarkName: '笑容加 SMILEPLUS',
      applicationNo: '71089234',
      classCode: '10',
      mainContent: '经形式审查，申请人提交的商标注册申请文件符合《中华人民共和国商标法》及其实施条例的规定，决定予以受理。',
      examinerRemarks: '审查类别：第10类（医疗器械、电动冲牙器、牙科用仪器等），已进入形式审查与实质审查排期。',
      sealText: '国家知识产权局商标局 电子发文专用章'
    }
  },
  {
    id: 'PEND-005',
    taskNo: 'CL-20260818-05',
    fileName: 'CMS_Law_Firm_2026Q2_European_IP_Services_Invoice.pdf',
    interactionType: '其它类型文件',
    uploadType: 'OTHER_FILE',
    agencyName: 'CMS Law Firm',
    agencyDocketNo: 'CMS-EU-2026-INV-88',
    uploader: 'Elena Weber (CMS Law Firm)',
    uploaderRole: '代理财务',
    status: 'PENDING_CONFIRM',
    statusName: '待确认',
    fileSize: '820 KB',
    fileFormat: 'PDF',
    uploadTime: '2026-08-18 16:30',
    caseNo: 'EU20260105-TM',
    trademarkName: 'usmile WAVE',
    applicationNo: 'EM018992011',
    classes: '21',
    docNumber: 'INV-CMS-2026-0922',
    officialDate: '2026-08-18',
    remarks: '包含欧盟12件异议答辩及5件商标续展官方规费与律师费对账清单，共计 €24,800。',
    previewData: {
      headerTitle: 'CMS LAW FIRM (EUROPEAN IP PRACTICE GROUP)',
      subHeader: 'LEGAL SERVICES INVOICE & DISBURSEMENT STATEMENT',
      docNo: 'INV-CMS-2026-0922',
      dispatchDate: '2026-08-18',
      recipientAgency: 'CMS Hasche Sigle / CMS Europe',
      applicant: 'Guangzhou Starfield Delight Co., Ltd.',
      trademarkName: 'usmile WAVE',
      applicationNo: 'EM018992011',
      classCode: 'Class 21',
      mainContent: 'Statement of professional legal services and official disbursements for EUIPO trademark opposition and renewal filings for Q2 2026. Total Amount Payable: €24,800.00.',
      examinerRemarks: 'Bank Wire Details attached. Due date: 30 days upon receipt.',
      sealText: 'CMS FINANCIAL AUDIT STAMP'
    }
  },
  {
    id: 'PEND-006',
    taskNo: 'CL-20260817-08',
    fileName: 'Japan_Opposition_Evidence_Sales_Contract_Package.zip',
    interactionType: '其它类型文件',
    uploadType: 'OTHER_FILE',
    agencyName: 'Seiwa Patent & Law',
    agencyDocketNo: 'SEIWA-JP-2026-0211',
    uploader: '陈晨 (商标争议专员)',
    uploaderRole: '内部法务',
    status: 'CONFIRMED',
    statusName: '已确认',
    fileSize: '16.4 MB',
    fileFormat: 'ZIP',
    uploadTime: '2026-08-17 10:15',
    caseNo: 'JP20260211-TM',
    trademarkName: 'SOLARIS',
    applicationNo: '2026-018921',
    classes: '09, 21',
    docNumber: 'EVI-JP-20260817',
    officialDate: '2026-08-17',
    remarks: '日本特许厅 (JPO) 异议答辩跨国证据链材料包（含日文翻译公证书及销售单据）。',
    syncedCaseNo: 'JP20260211-TM',
    syncedTime: '2026-08-17 11:00'
  }
];

export const AgencyCollaboration: React.FC<AgencyCollaborationProps> = ({ 
  agencies,
  caseItems = INITIAL_CASE_MANAGEMENT_ITEMS,
  currentUser,
  onUpdateCase
}) => {
  const defaultUploaderName = currentUser 
    ? `${currentUser.name} (${currentUser.title || currentUser.department || '知产专员'})` 
    : '陆燕丽 (知产专员)';

  const [activeTab, setActiveTab] = useState<TabType>('PENDING');

  // 待处理协同文件列表状态
  const [pendingList, setPendingList] = useState<PendingCollaborationItem[]>(INITIAL_PENDING_ITEMS);

  // Search and filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'PENDING_CONFIRM' | 'CONFIRMED'>('PENDING_CONFIRM');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CHINA_NOTICE' | 'OVERSEAS_NOTICE' | 'OTHER_FILE'>('ALL');
  const [agencyFilter, setAgencyFilter] = useState<string>('ALL');

  // Pagination for main table
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 上传文件 Modal 状态
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadActiveTab, setUploadActiveTab] = useState<UploadFileType>('CHINA_ELECTRONIC_NOTICE');
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadDragActive, setUploadDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 上传表单字段 (不默认填写值，仅提供提示引导，上传人默认当前账号人)
  const [uploadFormDocTitle, setUploadFormDocTitle] = useState('');
  const [uploadFormDocNumber, setUploadFormDocNumber] = useState('');
  const [uploadFormAgency, setUploadFormAgency] = useState('');
  const [uploadFormDate, setUploadFormDate] = useState('');
  const [uploadFormUploader, setUploadFormUploader] = useState(defaultUploaderName);
  const [uploadFormCaseNo, setUploadFormCaseNo] = useState('');
  const [uploadFormTrademarkName, setUploadFormTrademarkName] = useState('');
  const [uploadFormAppNo, setUploadFormAppNo] = useState('');
  const [uploadFormClasses, setUploadFormClasses] = useState('');
  const [uploadFormRemarks, setUploadFormRemarks] = useState('');
  const [uploadFormOtherFileType, setUploadFormOtherFileType] = useState('授权委托书 (POA)');
  const [uploadFormOverseasAuthority, setUploadFormOverseasAuthority] = useState('');

  // 在线文件预览 Modal 状态
  const [sourceFilePreviewItem, setSourceFilePreviewItem] = useState<PendingCollaborationItem | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [selectedZipSubfile, setSelectedZipSubfile] = useState<number>(0);

  // 删除二次确认 Modal 状态
  const [itemToDelete, setItemToDelete] = useState<PendingCollaborationItem | null>(null);
  const [previewItem, setPreviewItem] = useState<PendingCollaborationItem | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'info' | 'attachment' | 'history'>('info');

  // 选择关联案件 Modal 状态 (确认操作触发)
  const [isSelectCaseModalOpen, setIsSelectCaseModalOpen] = useState(false);
  const [confirmingItem, setConfirmingItem] = useState<PendingCollaborationItem | null>(null);
  const [modalCaseTab, setModalCaseTab] = useState<'ALL' | 'PENDING_APPLY' | 'APPLYING' | 'EXAMINING' | 'REGISTERED' | 'PENDING_REPLY' | 'INVALID'>('ALL');
  const [caseSearchKeyword, setCaseSearchKeyword] = useState('');
  const [modalFilterBrand, setModalFilterBrand] = useState('ALL');
  const [modalFilterClass, setModalFilterClass] = useState('');
  const [modalFilterJurisdiction, setModalFilterJurisdiction] = useState('');
  const [modalViewMode, setModalViewMode] = useState<'COMPOUND' | 'STANDARD'>('STANDARD');
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(7);
  const [selectedCaseForSync, setSelectedCaseForSync] = useState<CaseManagementItem | null>(null);
  const [viewingCaseDetail, setViewingCaseDetail] = useState<CaseManagementItem | null>(null);
  const [syncCategory, setSyncCategory] = useState<DocumentCategory | ''>('');
  const [syncDocNumber, setSyncDocNumber] = useState('');
  const [syncRemarks, setSyncRemarks] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast 提示
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 信息协管 (Agencies Table) 状态与弹窗
  const [agencyList, setAgencyList] = useState<AgencyPartner[]>(agencies);
  const [selectedAgencyForDetail, setSelectedAgencyForDetail] = useState<AgencyPartner | null>(null);
  const [selectedAgencyForAction, setSelectedAgencyForAction] = useState<AgencyPartner | null>(null);

  // 1. 【更新案件信息】弹窗状态与【案件详情-基本信息】14项全量字段 (支持多选案件 + 按案件编号Tab切换)
  const [isUpdateCaseInfoModalOpen, setIsUpdateCaseInfoModalOpen] = useState(false);
  const [selectedUpdateCaseNos, setSelectedUpdateCaseNos] = useState<string[]>([]);
  const [activeUpdateCaseNo, setActiveUpdateCaseNo] = useState<string>('');
  const [updateCaseSearchText, setUpdateCaseSearchText] = useState<string>('');
  const [updateCaseFormDataMap, setUpdateCaseFormDataMap] = useState<Record<string, {
    caseNo: string;
    agencyName: string;
    status: string;
    applicationNo: string;
    applyDate: string;
    registrationNo: string;
    registrationDate: string;
    latestProgress: string;
    filingDeadline: string;
    initialIssueNo: string;
    initialIssueDate: string;
    regIssueNo: string;
    regIssueDate: string;
    intlRegNo: string;
    intlRegDate: string;
    renewalStartDate: string;
    rightsEndDate: string;
    updateType: string;
    remarks: string;
  }>>({});
  const [isSubmittingUpdateCase, setIsSubmittingUpdateCase] = useState(false);
  const [isUpdateCaseConfirmDialogOpen, setIsUpdateCaseConfirmDialogOpen] = useState(false);

  const getInitialFormDataForCase = (target: CaseManagementItem) => ({
    caseNo: target.caseNo || '',
    agencyName: target.agencyName || '',
    status: target.status || '',
    applicationNo: target.applicationNo || '',
    applyDate: target.applyDate || '',
    registrationNo: target.registrationNo || '',
    registrationDate: target.registrationDate || target.regIssueDate || '',
    latestProgress: (target.timeline && target.timeline.length > 0 ? target.timeline[target.timeline.length - 1].stage : target.latestProgress) || '',
    filingDeadline: target.filingDeadline || '',
    initialIssueNo: target.initialIssueNo || '',
    initialIssueDate: target.initialIssueDate || '',
    regIssueNo: target.regIssueNo || '',
    regIssueDate: target.regIssueDate || '',
    intlRegNo: target.intlRegNo || '',
    intlRegDate: target.intlRegDate || '',
    renewalStartDate: target.renewalStartDate || '',
    rightsEndDate: target.rightsEndDate || target.validUntil || '',
    updateType: 'OFFICIAL_NOTICE_SYNC',
    remarks: ''
  });

  const handleOpenUpdateCaseModal = (targetCase?: CaseManagementItem) => {
    setUpdateCaseSearchText('');
    if (targetCase && targetCase.caseNo) {
      setSelectedUpdateCaseNos([targetCase.caseNo]);
      setActiveUpdateCaseNo(targetCase.caseNo);
      setUpdateCaseFormDataMap({
        [targetCase.caseNo]: getInitialFormDataForCase(targetCase)
      });
    } else {
      setSelectedUpdateCaseNos([]);
      setActiveUpdateCaseNo('');
      setUpdateCaseFormDataMap({});
    }
    setIsUpdateCaseInfoModalOpen(true);
  };

  const handleToggleSelectCaseForUpdate = (targetCaseNo: string) => {
    if (selectedUpdateCaseNos.includes(targetCaseNo)) {
      const nextSelected = selectedUpdateCaseNos.filter(no => no !== targetCaseNo);
      setSelectedUpdateCaseNos(nextSelected);
      if (activeUpdateCaseNo === targetCaseNo) {
        setActiveUpdateCaseNo(nextSelected.length > 0 ? nextSelected[0] : '');
      }
    } else {
      const nextSelected = [...selectedUpdateCaseNos, targetCaseNo];
      setSelectedUpdateCaseNos(nextSelected);
      const targetCase = caseItems.find(c => c.caseNo === targetCaseNo);
      if (targetCase && !updateCaseFormDataMap[targetCaseNo]) {
        setUpdateCaseFormDataMap(prev => ({
          ...prev,
          [targetCaseNo]: getInitialFormDataForCase(targetCase)
        }));
      }
      if (!activeUpdateCaseNo || selectedUpdateCaseNos.length === 0) {
        setActiveUpdateCaseNo(targetCaseNo);
      }
    }
  };

  const handleToggleSelectAllUpdateCases = (filteredCases: CaseManagementItem[]) => {
    const allSelected = filteredCases.length > 0 && filteredCases.every(c => selectedUpdateCaseNos.includes(c.caseNo));
    if (allSelected) {
      const filteredNos = filteredCases.map(c => c.caseNo);
      const nextSelected = selectedUpdateCaseNos.filter(no => !filteredNos.includes(no));
      setSelectedUpdateCaseNos(nextSelected);
      if (!nextSelected.includes(activeUpdateCaseNo)) {
        setActiveUpdateCaseNo(nextSelected.length > 0 ? nextSelected[0] : '');
      }
    } else {
      const newMap = { ...updateCaseFormDataMap };
      const nextSelected = [...selectedUpdateCaseNos];
      filteredCases.forEach(c => {
        if (c.caseNo && !nextSelected.includes(c.caseNo)) {
          nextSelected.push(c.caseNo);
          if (!newMap[c.caseNo]) {
            newMap[c.caseNo] = getInitialFormDataForCase(c);
          }
        }
      });
      setSelectedUpdateCaseNos(nextSelected);
      setUpdateCaseFormDataMap(newMap);
      if (!activeUpdateCaseNo && nextSelected.length > 0) {
        setActiveUpdateCaseNo(nextSelected[0]);
      }
    }
  };

  // 2. 【新增处理事项】弹窗状态 (与案件详情-处理事项-新增处理事项完全一致)
  const [isCreateHandlingTaskModalOpen, setIsCreateHandlingTaskModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createTaskSearchText, setCreateTaskSearchText] = useState<string>('');
  const [targetAgencyForTask, setTargetAgencyForTask] = useState<any>(null);
  const [selectedTaskCaseNos, setSelectedTaskCaseNos] = useState<string[]>([]);
  const [activeTaskCaseNo, setActiveTaskCaseNo] = useState<string>('');
  const [taskFormDataMap, setTaskFormDataMap] = useState<Record<string, {
    taskName: string;
    status: string;
    stage: string;
    undertaker: string;
    entrustDate: string;
    reviewScore: string;
    draftDeadline: string;
    internalDeadline: string;
    officialDeadline: string;
    searchDeadline: string;
    firstDraftDate: string;
    finalDraftDate: string;
    completionDate: string;
    searchDate: string;
    remarks: string;
  }>>({});

  // 批量导入、更新弹框状态 (样式与批量导入商标案件数据完全一致)
  const [isBatchUpdateCasesModalOpen, setIsBatchUpdateCasesModalOpen] = useState(false);
  const [batchUpdateCasesFile, setBatchUpdateCasesFile] = useState<File | null>(null);
  const [isBatchAddTasksModalOpen, setIsBatchAddTasksModalOpen] = useState(false);
  const [batchAddTasksFile, setBatchAddTasksFile] = useState<File | null>(null);

  const getInitialTaskFormData = (c: any, agency: any = null) => {
    return {
      taskName: '',
      status: '',
      stage: '',
      undertaker: agency ? agency.contactPerson || '' : '',
      entrustDate: new Date().toISOString().slice(0, 10),
      reviewScore: '',
      draftDeadline: '',
      internalDeadline: '',
      officialDeadline: '',
      searchDeadline: '',
      firstDraftDate: '',
      finalDraftDate: '',
      completionDate: '',
      searchDate: '',
      remarks: agency ? `委派【${agency.name}】协同处理` : ''
    };
  };

  const handleToggleSelectCaseForTask = (targetCaseNo: string) => {
    if (selectedTaskCaseNos.includes(targetCaseNo)) {
      const nextSelected = selectedTaskCaseNos.filter(no => no !== targetCaseNo);
      setSelectedTaskCaseNos(nextSelected);
      if (activeTaskCaseNo === targetCaseNo) {
        setActiveTaskCaseNo(nextSelected.length > 0 ? nextSelected[0] : '');
      }
    } else {
      const nextSelected = [...selectedTaskCaseNos, targetCaseNo];
      setSelectedTaskCaseNos(nextSelected);
      if (!taskFormDataMap[targetCaseNo]) {
        const targetCase = caseItems.find(c => c.caseNo === targetCaseNo);
        setTaskFormDataMap(prev => ({
          ...prev,
          [targetCaseNo]: getInitialTaskFormData(targetCase, targetAgencyForTask)
        }));
      }
      if (!activeTaskCaseNo || selectedTaskCaseNos.length === 0) {
        setActiveTaskCaseNo(targetCaseNo);
      }
    }
  };

  const handleToggleSelectAllTaskCases = (filtered: any[]) => {
    const allSelected = filtered.length > 0 && filtered.every(c => selectedTaskCaseNos.includes(c.caseNo));
    if (allSelected) {
      const filteredNos = filtered.map(c => c.caseNo);
      const nextSelected = selectedTaskCaseNos.filter(no => !filteredNos.includes(no));
      setSelectedTaskCaseNos(nextSelected);
      if (!nextSelected.includes(activeTaskCaseNo)) {
        setActiveTaskCaseNo(nextSelected.length > 0 ? nextSelected[0] : '');
      }
    } else {
      const newMap = { ...taskFormDataMap };
      const nextSelected = [...selectedTaskCaseNos];
      filtered.forEach(c => {
        if (c.caseNo && !nextSelected.includes(c.caseNo)) {
          nextSelected.push(c.caseNo);
          if (!newMap[c.caseNo]) {
            newMap[c.caseNo] = getInitialTaskFormData(c, targetAgencyForTask);
          }
        }
      });
      setSelectedTaskCaseNos(nextSelected);
      setTaskFormDataMap(newMap);
      if (!activeTaskCaseNo && nextSelected.length > 0) {
        setActiveTaskCaseNo(nextSelected[0]);
      }
    }
  };

  const handleDownloadUpdateCasesTemplate = () => {
    const headers = '案件编号,官方申请号,官方申请日,官方注册号,官方注册日,最新注册进度,申报/答复截止日,初审公告期号,初审公告日,注册公告期号,注册公告日,国际注册号,国际注册日,续展起始日,权利终止日/有效期止,协同代理律所,更新后案件状态,更新说明与流转备注\n';
    
    // 导出系统上的下拉选项作为模板上的选项说明
    const progressOpts = REGISTRATION_PROGRESS_OPTIONS.join('/');
    const agencyNames = agencyList.map(a => a.name).join('/');
    const statusOpts = '待申请/申请中/审查中/待答复/已注册/已失效';
    
    // 指引说明行 (说明可选值)
    const guideRow = `【必填-系统唯一案号】,【选填-官方申请号】,【选填-格式:YYYY-MM-DD】,【选填-官方注册号】,【选填-格式:YYYY-MM-DD】,【下拉选项: ${progressOpts}】,【选填-格式:YYYY-MM-DD】,【选填-如:1892期】,【选填-格式:YYYY-MM-DD】,【选填-如:1910期】,【选填-格式:YYYY-MM-DD】,【选填-国际注册号】,【选填-格式:YYYY-MM-DD】,【选填-格式:YYYY-MM-DD】,【选填-格式:YYYY-MM-DD】,【下拉选项: ${agencyNames}】,【下拉选项: ${statusOpts}】,【选填-流转或答复意见备注】\n`;
    
    // 示例数据行
    const sampleRow = 'TM2026001,78912345,2026-01-15,67104523,2026-08-20,获准注册核发证书,2026-11-20,1892期,2026-05-20,1910期,2026-08-20,RU2026999,2026-04-10,2026-08-20,2036-08-20,北京市柳沈律师事务所,已注册,官方实质审查通过，核准公告并顺利颁发纸质注册证书\n';
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + guideRow + sampleRow);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', '商标案件批量更新模板.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('更新模板下载成功！');
  };

  const handleConfirmBatchUpdateCases = () => {
    if (!batchUpdateCasesFile) {
      showToast('请先选择或拖拽上传需要导入的更新模板文件！');
      return;
    }
    showToast(`已成功读取并批量覆盖更新 15 个商标案件的状态属性！`);
    setIsBatchUpdateCasesModalOpen(false);
    setBatchUpdateCasesFile(null);
  };

  const handleDownloadAddTasksTemplate = () => {
    const headers = '案件编号,处理事项,处理状态,案件阶段,承办人 / 处理人,委案日期,核稿分值,初稿期限,内部期限,官方期限,检索期限,初稿日,定稿日,完成日,检索日,备注\n';
    const instructions = '# 填写说明:,"必填 [系统可选值: 商标注册申请 / 实质审查意见答辩及补正 / 初审公告期异议申请 / 商标驳回复审申请 / 商标异议答辩及举证 / 商标撤三申请 (连续三年不使用撤销) / 商标撤三答辩与使用证据提交 / 商标无效宣告申请 / 商标无效宣告答辩 / 商标变更申请 (名义/地址) / 商标转让/移转申请 / 商标续展申请 / 商标许可备案登记 / 马德里国际注册领土延伸 / 海关知识产权保护备案 / 官方发文核查与领转]","必填 [系统可选值: 待处理 / 处理中 / 待审核 / 待递交 / 已完成 / 暂停 / 已终止]","必填 [系统可选值: 准备递交阶段 / 申请受理阶段 / 形式审查阶段 / 实质审查阶段 / 初审公告阶段 / 异议/复审阶段 / 核准注册阶段 / 续展维权阶段 / 归档结案阶段]","选填 (例: 张律师 / 李代理人)","选填 (日期格式: YYYY-MM-DD，例: 2026-08-01)","选填 (例: 95分 / 100 / A+)","选填 (日期格式: YYYY-MM-DD，例: 2026-08-15)","选填 (日期格式: YYYY-MM-DD，例: 2026-08-20)","选填 (日期格式: YYYY-MM-DD，例: 2026-08-25)","选填 (日期格式: YYYY-MM-DD，例: 2026-08-10)","选填 (日期格式: YYYY-MM-DD，例: 2026-08-14)","选填 (日期格式: YYYY-MM-DD，例: 2026-08-18)","选填 (日期格式: YYYY-MM-DD，例: 2026-08-22)","选填 (日期格式: YYYY-MM-DD，例: 2026-08-08)","选填 (处理进展、官方通知或核稿备注说明)"\n';
    const sampleRow = 'TM2026001,商标驳回复审申请,处理中,实质审查阶段,张律师,2026-08-01,95分,2026-08-15,2026-08-20,2026-08-25,2026-08-10,2026-08-14,2026-08-18,2026-08-22,2026-08-08,已收到官方实质审查驳回通知书，已组织证据材料答辩显著性\n';
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + instructions + sampleRow);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', '处理事项批量新增模板.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('处理事项模板下载成功（包含标准表头、系统选项说明与样例数据）！');
  };

  const handleConfirmBatchAddTasks = () => {
    if (!batchAddTasksFile) {
      showToast('请先选择或拖拽上传需要导入的处理事项模板文件！');
      return;
    }
    showToast(`已成功批量导入并新增 8 个商标案件的协同处理事项！`);
    setIsBatchAddTasksModalOpen(false);
    setBatchAddTasksFile(null);
  };

  const handleSaveHandlingTask = () => {
    if (selectedTaskCaseNos.length === 0) {
      showToast('请先在上方案件列表中选择目标案件');
      return;
    }

    // 校验每个选中案件的表单数据
    for (const cNo of selectedTaskCaseNos) {
      const data = taskFormDataMap[cNo];
      if (!data || !data.taskName) {
        showToast(`案件【${cNo}】的处理事项名称不能为空，请先在下方切换至该案件完成填写`);
        setActiveTaskCaseNo(cNo);
        return;
      }
      if (!data.status) {
        showToast(`案件【${cNo}】的处理状态不能为空，请先在下方切换至该案件完成填写`);
        setActiveTaskCaseNo(cNo);
        return;
      }
      if (!data.stage) {
        showToast(`案件【${cNo}】的案件阶段不能为空，请先在下方切换至该案件完成填写`);
        setActiveTaskCaseNo(cNo);
        return;
      }
    }

    // 逐个保存
    if (onUpdateCase) {
      selectedTaskCaseNos.forEach(cNo => {
        const targetCase = caseItems.find(c => c.caseNo === cNo);
        if (targetCase) {
          const data = taskFormDataMap[cNo];
          const newTaskItem = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            seq: (targetCase.handlingTasks?.length || 0) + 1,
            taskName: data.taskName,
            status: data.status,
            stage: data.stage,
            undertaker: data.undertaker || '陆燕丽',
            entrustDate: data.entrustDate || new Date().toISOString().slice(0, 10),
            reviewScore: data.reviewScore || '',
            draftDeadline: data.draftDeadline || '',
            internalDeadline: data.internalDeadline || '',
            officialDeadline: data.officialDeadline || '',
            searchDeadline: data.searchDeadline || '',
            firstDraftDate: data.firstDraftDate || '',
            finalDraftDate: data.finalDraftDate || '',
            completionDate: data.completionDate || '',
            searchDate: data.searchDate || '',
            remarks: data.remarks || ''
          };

          const updatedTasks = [...(targetCase.handlingTasks || []), newTaskItem];
          onUpdateCase({
            ...targetCase,
            handlingTasks: updatedTasks
          });
        }
      });
    }

    setIsCreateHandlingTaskModalOpen(false);
    showToast(`已成功为 ${selectedTaskCaseNos.length} 个商标案件新增处理事项！`);
  };

  // Mock file exchange items for File Exchange Tab
  const [exchangeFiles, setExchangeFiles] = useState<FileExchangeItem[]>([
    {
      id: 'FILE-101',
      fileName: 'TECHNOVA_US_OA_Response_Draft_v2.pdf',
      category: 'OA_DOC',
      categoryName: '审查意见答辩',
      agencyName: 'Baker & McKenzie',
      caseNo: 'US20260412-TM',
      uploadTime: '2026-08-20 14:30',
      uploader: 'Baker & McKenzie (Andrew Miller)',
      fileSize: '2.4 MB',
      status: 'PENDING_CONFIRM',
      statusName: '待我方签收确认',
      version: 'v2.0'
    },
    {
      id: 'FILE-102',
      fileName: 'POA_Power_Of_Attorney_India_Signed_Notarized.pdf',
      category: 'POA',
      categoryName: '授权委托书 (POA)',
      agencyName: 'Anand and Anand',
      caseNo: 'IN20260388-TM',
      uploadTime: '2026-08-19 11:15',
      uploader: '王强 (内部法务)',
      fileSize: '1.1 MB',
      status: 'CONFIRMED',
      statusName: '已双向确认',
      version: 'v1.0'
    },
    {
      id: 'FILE-103',
      fileName: 'CMS_Law_Services_Invoice_2026Q2_Signed.pdf',
      category: 'INVOICE',
      categoryName: '代理服务账单',
      agencyName: 'CMS Law Firm',
      caseNo: 'EU20260105-TM',
      uploadTime: '2026-08-18 16:45',
      uploader: 'CMS Law Firm (Elena Weber)',
      fileSize: '850 KB',
      status: 'AUDITING',
      statusName: '财务对账审核中',
      version: 'v1.0'
    },
    {
      id: 'FILE-104',
      fileName: 'Evidence_Package_Japan_Opposition_Transl.zip',
      category: 'EVIDENCE',
      categoryName: '异议证据材料包',
      agencyName: 'Seiwa Patent & Law',
      caseNo: 'JP20260211-TM',
      uploadTime: '2026-08-17 09:20',
      uploader: '陈晨 (内部法务)',
      fileSize: '18.5 MB',
      status: 'CONFIRMED',
      statusName: '代理已接收',
      version: 'v1.1'
    },
    {
      id: 'FILE-105',
      fileName: 'Trademark_Certificate_Official_Copy_Korea.pdf',
      category: 'CERTIFICATE',
      categoryName: '商标注册证书',
      agencyName: 'Kim & Chang',
      caseNo: 'KR20260190-TM',
      uploadTime: '2026-08-15 17:00',
      uploader: 'Kim & Chang (Min-soo Park)',
      fileSize: '3.2 MB',
      status: 'ARCHIVED',
      statusName: '已入库归档',
      version: 'v1.0'
    }
  ]);

  // Handle open upload modal (不默认填写值，仅提供提示引导，上传人默认当前账号人)
  const handleOpenUploadModal = (type: UploadFileType = 'CHINA_ELECTRONIC_NOTICE') => {
    setUploadActiveTab(type);
    setSelectedUploadFile(null);
    setUploadFormDocTitle('');
    setUploadFormDocNumber('');
    setUploadFormAgency('');
    setUploadFormDate('');
    setUploadFormUploader(defaultUploaderName);
    setUploadFormCaseNo('');
    setUploadFormTrademarkName('');
    setUploadFormAppNo('');
    setUploadFormClasses('');
    setUploadFormRemarks('');
    setUploadFormOtherFileType('授权委托书 (POA)');
    setUploadFormOverseasAuthority('');
    setIsUploadModalOpen(true);
  };

  // Handle File Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedUploadFile(file);
      if (!uploadFormDocTitle.trim()) {
        setUploadFormDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedUploadFile(file);
      if (!uploadFormDocTitle.trim()) {
        setUploadFormDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  // Submit Upload Form
  const handleConfirmUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFormDocTitle.trim()) {
      showToast('请输入文件或通知书名称');
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      let finalInteractionType = '其它类型文件';
      let fileExt = 'PDF';
      let fileSizeStr = '2.1 MB';

      if (selectedUploadFile) {
        const nameParts = selectedUploadFile.name.split('.');
        if (nameParts.length > 1) {
          fileExt = nameParts[nameParts.length - 1].toUpperCase();
        }
        const mb = (selectedUploadFile.size / (1024 * 1024)).toFixed(1);
        fileSizeStr = `${mb} MB`;
      }

      if (uploadActiveTab === 'CHINA_ELECTRONIC_NOTICE') {
        finalInteractionType = '中国商标电子通知书';
      } else if (uploadActiveTab === 'OTHER_NOTICE') {
        finalInteractionType = '其它通知书';
      } else {
        finalInteractionType = uploadFormOtherFileType || '其它类型文件';
      }

      const generatedFileName = selectedUploadFile 
        ? selectedUploadFile.name 
        : `${uploadFormDocTitle.trim()}.${fileExt.toLowerCase()}`;

      const currentDateStr = new Date().toISOString().slice(0, 10);
      const currentTimeStr = new Date().toTimeString().slice(0, 5);

      const uploadedFileUrl = selectedUploadFile ? URL.createObjectURL(selectedUploadFile) : undefined;

      const newItem: PendingCollaborationItem = {
        id: `PEND-${Date.now().toString().slice(-6)}`,
        taskNo: `CL-20260822-0${pendingList.length + 1}`,
        fileName: generatedFileName,
        interactionType: finalInteractionType,
        uploadType: uploadActiveTab,
        agencyName: uploadFormAgency || '未指定代理机构',
        uploader: uploadFormUploader || defaultUploaderName,
        uploaderRole: '内部经办人',
        status: 'PENDING_CONFIRM',
        statusName: '待确认',
        fileSize: fileSizeStr,
        fileFormat: fileExt,
        uploadTime: uploadFormDate ? `${uploadFormDate} ${currentTimeStr}` : `${currentDateStr} ${currentTimeStr}`,
        caseNo: uploadFormCaseNo || '',
        trademarkName: uploadFormTrademarkName || '-',
        applicationNo: uploadFormAppNo || '-',
        classes: uploadFormClasses || '-',
        docNumber: uploadFormDocNumber || `DOC-${Date.now().toString().slice(-6)}`,
        officialDate: uploadFormDate || currentDateStr,
        remarks: uploadFormRemarks || '上传至协同待处理列表',
        fileUrl: uploadedFileUrl,
        previewData: {
          headerTitle: uploadActiveTab === 'CHINA_ELECTRONIC_NOTICE' 
            ? '国家知识产权局商标局' 
            : uploadActiveTab === 'OTHER_NOTICE' 
            ? (uploadFormOverseasAuthority || '海外官方知识产权局') 
            : '知识产权协同交互文档',
          subHeader: uploadFormDocTitle.trim(),
          docNo: uploadFormDocNumber || `DOC-${Date.now().toString().slice(-6)}`,
          dispatchDate: uploadFormDate || currentDateStr,
          recipientAgency: uploadFormAgency || '内部协同归集',
          applicant: '广州星际悦动股份有限公司',
          trademarkName: uploadFormTrademarkName || '-',
          applicationNo: uploadFormAppNo || '-',
          classCode: uploadFormClasses || '-',
          mainContent: `该文件已成功由【${uploadFormAgency || '经办人'}】流转录入。涉及商标【${uploadFormTrademarkName || '-'}】，文号【${uploadFormDocNumber || '-'}】。`,
          examinerRemarks: uploadFormRemarks || '经审查无误，待关联同步至案件卷宗。',
          sealText: uploadActiveTab === 'CHINA_ELECTRONIC_NOTICE' ? '国家知识产权局商标局 电子发文专用章' : 'OFFICIAL CERTIFICATION SEAL'
        }
      };

      setPendingList([newItem, ...pendingList]);
      setIsUploading(false);
      setIsUploadModalOpen(false);
      showToast(`文件【${newItem.fileName}】已成功上传并加入【待处理】列表！`);
    }, 400);
  };

  // 打开“直接在线预览原文件” Modal (点击文件名触发)
  const handleOpenSourceFilePreview = (item: PendingCollaborationItem) => {
    setSourceFilePreviewItem(item);
    setPreviewZoom(100);
    setSelectedZipSubfile(0);
  };

  // Open Select Case Modal (Triggered by 确认 action)
  const handleOpenSelectCaseModal = (item: PendingCollaborationItem) => {
    setConfirmingItem(item);
    setCaseSearchKeyword('');
    setModalCaseTab('ALL');
    setModalFilterBrand('ALL');
    setModalFilterClass('');
    setModalFilterJurisdiction('');
    setModalCurrentPage(1);
    
    // Do not select any case by default; let the user select it manually
    setSelectedCaseForSync(null);

    // Reset category to empty string so user must explicitly choose
    setSyncCategory('');

    setSyncDocNumber(item.docNumber || `DOC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`);
    setSyncRemarks(item.remarks || `由代理协同中心【${item.agencyName}】流转并确认归档`);
    setIsSelectCaseModalOpen(true);
  };

  // Confirm Sync to Case Document List
  const handleConfirmSyncToCase = () => {
    if (!selectedCaseForSync) {
      showToast('请在上方列表中勾选需要关联归档的目标商标案件！');
      return;
    }

    if (!syncCategory) {
      showToast('请选择文件归档分类！');
      return;
    }

    if (!syncDocNumber.trim()) {
      showToast('请填写文件归档文号！');
      return;
    }

    if (!confirmingItem) {
      showToast('未选中需同步的文件记录');
      return;
    }

    setIsSyncing(true);

    setTimeout(() => {
      const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
      
      // Construct official case document
      const newCaseDoc: CaseOfficialDocument = {
        id: `synced-${confirmingItem.id}-${Date.now().toString().slice(-4)}`,
        title: confirmingItem.fileName,
        type: confirmingItem.fileFormat || 'PDF',
        docNumber: syncDocNumber.trim(),
        issueDate: confirmingItem.officialDate || new Date().toISOString().slice(0, 10),
        size: confirmingItem.fileSize || '2.1 MB',
        category: syncCategory as DocumentCategory,
        uploader: confirmingItem.uploader || '陆燕丽 (知产专员)',
        remarks: `${syncRemarks} (来自代理机构: ${confirmingItem.agencyName})`
      };

      // 1. 同步到全局 docSyncStore (同时支持 caseId 与 caseNo 索引)
      addSyncedDocToCase(selectedCaseForSync.id, newCaseDoc);
      addSyncedDocToCase(selectedCaseForSync.caseNo, newCaseDoc);

      // 2. 更新协同列表中该条目的状态为已确认并记录同步案号
      setPendingList(prev => prev.map(item => {
        if (item.id === confirmingItem.id) {
          return {
            ...item,
            status: 'CONFIRMED',
            statusName: '已确认',
            syncedCaseNo: selectedCaseForSync.caseNo,
            syncedTime: now,
            caseNo: selectedCaseForSync.caseNo,
            trademarkName: selectedCaseForSync.trademarkName
          };
        }
        return item;
      }));

      setIsSyncing(false);
      setIsSelectCaseModalOpen(false);
      showToast(`已成功将文件【${confirmingItem.fileName}】关联并同步至案件【${selectedCaseForSync.caseNo} - ${selectedCaseForSync.trademarkName}】的【文件列表】！`);
    }, 450);
  };

  // Handle Delete Pending Item
  const handleDeleteItem = (itemId: string) => {
    setPendingList(prev => prev.filter(i => i.id !== itemId));
    showToast('已从待处理列表中移除该文件记录');
  };

  // Counts for Top-Left Tabs
  const pendingConfirmCount = useMemo(() => {
    return pendingList.filter(item => item.status === 'PENDING_CONFIRM').length;
  }, [pendingList]);

  const confirmedCount = useMemo(() => {
    return pendingList.filter(item => item.status === 'CONFIRMED').length;
  }, [pendingList]);

  // Filtered Pending List
  const filteredPendingList = useMemo(() => {
    return pendingList.filter(item => {
      const kw = searchKeyword.toLowerCase().trim();
      const matchesKw = !kw || 
        item.fileName.toLowerCase().includes(kw) ||
        item.interactionType.toLowerCase().includes(kw) ||
        item.agencyName.toLowerCase().includes(kw) ||
        item.uploader.toLowerCase().includes(kw) ||
        (item.caseNo && item.caseNo.toLowerCase().includes(kw)) ||
        (item.trademarkName && item.trademarkName.toLowerCase().includes(kw));

      const matchesStatus = item.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || 
        (typeFilter === 'CHINA_NOTICE' && item.uploadType === 'CHINA_ELECTRONIC_NOTICE') ||
        (typeFilter === 'OVERSEAS_NOTICE' && item.uploadType === 'OTHER_NOTICE') ||
        (typeFilter === 'OTHER_FILE' && item.uploadType === 'OTHER_FILE');

      const matchesAgency = agencyFilter === 'ALL' || item.agencyName.includes(agencyFilter);

      return matchesKw && matchesStatus && matchesType && matchesAgency;
    });
  }, [pendingList, searchKeyword, statusFilter, typeFilter, agencyFilter]);

  // Main Table Pagination calculations
  const totalPages = Math.ceil(filteredPendingList.length / pageSize) || 1;
  const paginatedPendingList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPendingList.slice(start, start + pageSize);
  }, [filteredPendingList, currentPage, pageSize]);

  // Filtered Agency List for 信息协管 Tab
  const filteredAgencies = useMemo(() => {
    const kw = searchKeyword.toLowerCase().trim();
    if (!kw) return agencyList;
    return agencyList.filter(a => 
      a.name.toLowerCase().includes(kw) ||
      a.country.toLowerCase().includes(kw) ||
      a.contactPerson.toLowerCase().includes(kw) ||
      a.contactEmail.toLowerCase().includes(kw) ||
      (a.specialties && a.specialties.some(s => s.toLowerCase().includes(kw)))
    );
  }, [agencyList, searchKeyword]);

  // Counts for Case Status Tabs in Select Modal
  const caseTabCounts = useMemo(() => {
    const total = caseItems.length;
    const pendingApply = caseItems.filter(c => c.status.includes('待申请')).length;
    const applying = caseItems.filter(c => c.status.includes('申请中') || c.status.includes('受理')).length;
    const examining = caseItems.filter(c => c.status.includes('审查中') || c.status.includes('初审公告')).length;
    const registered = caseItems.filter(c => c.status.includes('已注册') || c.status.includes('核准注册') || c.status.includes('已核准')).length;
    const pendingReply = caseItems.filter(c => c.status.includes('待答复') || c.status.includes('审查意见') || c.status.includes('异议')).length;
    const invalid = caseItems.filter(c => c.status.includes('驳回') || c.status.includes('失效') || c.status.includes('无效')).length;
    return { total, pendingApply, applying, examining, registered, pendingReply, invalid };
  }, [caseItems]);

  // Filtered Cases for Select Modal (matching Case Management page)
  const filteredCasesForSelect = useMemo(() => {
    return caseItems.filter(c => {
      // Tab filter
      if (modalCaseTab === 'PENDING_APPLY' && !c.status.includes('待申请')) return false;
      if (modalCaseTab === 'APPLYING' && !(c.status.includes('申请中') || c.status.includes('受理'))) return false;
      if (modalCaseTab === 'EXAMINING' && !(c.status.includes('审查中') || c.status.includes('初审公告'))) return false;
      if (modalCaseTab === 'REGISTERED' && !(c.status.includes('已注册') || c.status.includes('核准注册') || c.status.includes('已核准'))) return false;
      if (modalCaseTab === 'PENDING_REPLY' && !(c.status.includes('待答复') || c.status.includes('审查意见') || c.status.includes('异议'))) return false;
      if (modalCaseTab === 'INVALID' && !(c.status.includes('驳回') || c.status.includes('失效') || c.status.includes('无效'))) return false;

      // Brand filter
      if (modalFilterBrand !== 'ALL') {
        const keywords = modalFilterBrand.split(' ');
        const match = keywords.some(kw => kw && c.brand.toLowerCase().includes(kw.toLowerCase())) || modalFilterBrand.includes(c.brand);
        if (!match) return false;
      }

      // Class filter
      if (modalFilterClass.trim() && !c.classes.toLowerCase().includes(modalFilterClass.trim().toLowerCase())) return false;

      // Jurisdiction filter
      if (modalFilterJurisdiction.trim() && !c.jurisdiction.toLowerCase().includes(modalFilterJurisdiction.trim().toLowerCase())) return false;

      // Keyword filter
      if (caseSearchKeyword.trim()) {
        const kw = caseSearchKeyword.toLowerCase().trim();
        const matchesCaseNo = c.caseNo.toLowerCase().includes(kw);
        const matchesTm = c.trademarkName.toLowerCase().includes(kw);
        const matchesApplicant = (c.applicant || '').toLowerCase().includes(kw);
        const matchesAppNo = (c.applicationNo || '').toLowerCase().includes(kw);
        const matchesAgency = (c.agencyName || '').toLowerCase().includes(kw);
        const matchesProp = (c.proposalNo || '').toLowerCase().includes(kw);
        const matchesGoods = typeof c.goodsItems === 'string' ? c.goodsItems.toLowerCase().includes(kw) : false;
        if (!matchesCaseNo && !matchesTm && !matchesApplicant && !matchesAppNo && !matchesAgency && !matchesProp && !matchesGoods) {
          return false;
        }
      }

      return true;
    });
  }, [caseItems, modalCaseTab, modalFilterBrand, modalFilterClass, modalFilterJurisdiction, caseSearchKeyword]);

  const modalTotalPages = Math.ceil(filteredCasesForSelect.length / modalPageSize) || 1;
  const paginatedModalCases = useMemo(() => {
    const start = (modalCurrentPage - 1) * modalPageSize;
    return filteredCasesForSelect.slice(start, start + modalPageSize);
  }, [filteredCasesForSelect, modalCurrentPage, modalPageSize]);

  // Status Badge for Case Table (matching Case Management)
  const renderCaseStatusBadge = (status: string) => {
    if (status === 'REGISTERED' || status.includes('已注册') || status.includes('已核准') || status.includes('核准注册')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>{status === 'REGISTERED' ? '已注册' : status}</span>
        </span>
      );
    }
    if (status === 'INVALID' || status.includes('驳回') || status.includes('失效') || status.includes('无效')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>{status === 'INVALID' ? '已失效' : status}</span>
        </span>
      );
    }
    if (status === 'PENDING_REPLY' || status.includes('待答复') || status.includes('异议') || status.includes('审查意见')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
          <span>{status === 'PENDING_REPLY' ? '待答复' : status}</span>
        </span>
      );
    }
    if (status === 'EXAMINING' || status.includes('审查中')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          <span>{status === 'EXAMINING' ? '审查中' : status}</span>
        </span>
      );
    }
    if (status === 'APPLYING' || status.includes('申请中') || status.includes('受理')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <span>{status === 'APPLYING' ? '申请中' : status}</span>
        </span>
      );
    }
    if (status === 'PENDING_APPLY' || status.includes('待申请')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          <span>{status === 'PENDING_APPLY' ? '待申请' : status}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span>{status}</span>
      </span>
    );
  };

  // Render format icon
  const renderFormatBadge = (format: string) => {
    const fmt = (format || 'PDF').toUpperCase();
    const label = fmt === 'RAR' ? 'ZIP' : fmt.slice(0, 3);
    return (
      <span className="w-8 h-8 rounded-lg bg-[#e9efff] border border-blue-200/80 text-blue-700 flex items-center justify-center font-black text-[10px] tracking-tight shrink-0 shadow-2xs">
        {label}
      </span>
    );
  };

  // Render interaction type badge (去掉颜色，展示无背影纯文本)
  const renderInteractionTypeBadge = (type: string, uploadType?: UploadFileType) => {
    let label = type || '其它类型文件';
    if (uploadType === 'CHINA_ELECTRONIC_NOTICE' || type.includes('中国商标') || type.includes('电子通知书')) {
      label = '中国商标电子通知书';
    } else if (uploadType === 'OTHER_NOTICE' || type.includes('其它通知书') || type.includes('审查意见') || type.includes('OA')) {
      label = type.includes('其它通知书') ? '其它通知书' : type;
    } else if (type.includes('委托书') || type.includes('POA')) {
      label = '授权委托书 (POA)';
    } else if (type.includes('账单') || type.includes('Invoice')) {
      label = '代理服务账单';
    } else if (type.includes('证据') || type.includes('Evidence')) {
      label = '异议证据协同';
    }
    return (
      <span className="text-xs text-slate-700 font-normal">
        {label}
      </span>
    );
  };

  // Render Status Badge
  const renderStatusBadge = (status: PendingCollaborationItem['status']) => {
    switch (status) {
      case 'PENDING_CONFIRM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>待确认</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>已确认同步</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>处理中</span>
          </span>
        );
      case 'PENDING_PROCESS':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>待处理</span>
          </span>
        );
    }
  };

  // 渲染各种官方文书 / 证据 / 图片 / PDF / ZIP 的原文件 Document Canvas 阶段
  const renderDocumentCanvas = (item: PendingCollaborationItem) => {
    return (
      <div 
        className="transition-transform duration-200 w-full max-w-4xl flex justify-center"
        style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
      >
        {item.fileUrl ? (
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden w-full min-h-[600px] flex items-center justify-center">
            {item.fileFormat === 'PDF' ? (
              <iframe 
                src={item.fileUrl} 
                className="w-full h-[650px] border-0" 
                title={item.fileName} 
              />
            ) : (
              <div className="p-8 flex flex-col items-center justify-center">
                <img 
                  src={item.fileUrl} 
                  alt={item.fileName} 
                  className="max-w-full max-h-[600px] object-contain rounded-lg shadow-md border border-slate-200"
                />
                <p className="mt-3 text-xs text-slate-500 font-mono">{item.fileName}</p>
              </div>
            )}
          </div>
        ) : item.fileFormat === 'ZIP' ? (
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden text-slate-900 flex flex-col min-h-[560px] w-full">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderArchive className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.fileName}</h4>
                  <p className="text-xs text-slate-500">压缩包证据链归档原件 • 包含 4 个源文件</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-mono font-bold">
                ZIP ARCHIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 flex-1">
              <div className="md:col-span-4 bg-slate-50/80 border-r border-slate-200 p-3 space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">包内文件列表</p>
                {[
                  { name: '01_日文翻译公证书扫描件.pdf', size: '1.2 MB', type: 'PDF' },
                  { name: '02_日本特许厅答辩书正本.pdf', size: '850 KB', type: 'PDF' },
                  { name: '03_出口报关单及合同明细.pdf', size: '5.4 MB', type: 'PDF' },
                  { name: '04_专柜实地陈列照片.png', size: '8.9 MB', type: 'PNG' }
                ].map((sub, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedZipSubfile(idx)}
                    className={`p-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors border ${
                      selectedZipSubfile === idx
                        ? 'bg-blue-50/90 text-blue-900 border-blue-300 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    <File className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs leading-snug">{sub.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sub.size} • {sub.type}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="md:col-span-8 p-6 bg-white flex flex-col justify-between min-h-[420px]">
                <div>
                  <div className="pb-3 mb-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">
                        {[
                          '01_日文翻译公证书扫描件.pdf',
                          '02_日本特许厅答辩书正本.pdf',
                          '03_出口报关单及合同明细.pdf',
                          '04_专柜实地陈列照片.png'
                        ][selectedZipSubfile]}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">文件内容预览</span>
                  </div>

                  {selectedZipSubfile === 0 && (
                    <div className="space-y-3 font-serif text-xs text-slate-800 leading-relaxed p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-center border-b border-slate-200 pb-2">
                        <h5 className="font-bold text-sm text-slate-900">公证书 (公证翻译正本)</h5>
                        <p className="text-[11px] text-slate-500 font-mono">(2026) 粤广南方第 08219 号</p>
                      </div>
                      <p className="indent-6">
                        兹证明，申请人【广州星际悦动股份有限公司】提交的销售合同及海关申报文书日文翻译件，与中文原本内容一致。
                      </p>
                    </div>
                  )}

                  {selectedZipSubfile === 1 && (
                    <div className="space-y-3 font-serif text-xs text-slate-800 leading-relaxed p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-center border-b border-slate-200 pb-2">
                        <h5 className="font-bold text-sm text-slate-900">异议申立答辩书</h5>
                        <p className="text-[11px] text-slate-500 font-mono">商标异议 2026-900122 号事件</p>
                      </div>
                      <p className="indent-6">
                        被申立人：广州星际悦动股份有限公司。本件商标“SOLARIS”与引用商标存在显著区别，不易引发市场混淆，请求予以维持注册。
                      </p>
                    </div>
                  )}

                  {selectedZipSubfile === 2 && (
                    <div className="space-y-3 text-xs text-slate-800 leading-relaxed p-4 bg-slate-50 border border-slate-200 rounded-lg font-sans">
                      <div className="text-center border-b border-slate-200 pb-2">
                        <h5 className="font-bold text-sm text-slate-900">海关出口货物报关单明细汇总</h5>
                      </div>
                      <p className="text-xs text-slate-700">
                        累计报关出口金额：61,400,000 日元，出口商品包含 SOLARIS 声波电动牙刷及替换刷头等。
                      </p>
                    </div>
                  )}

                  {selectedZipSubfile === 3 && (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-full max-w-sm h-36 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center text-slate-800 shadow-inner">
                        <div className="p-4 text-center">
                          <span className="text-base font-bold text-blue-700 block mb-1">usmile | SOLARIS</span>
                          <span className="text-xs text-slate-600 block">东京新宿专柜实拍照片</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>查看第 {selectedZipSubfile + 1} / 4 个文件</span>
                  <button
                    type="button"
                    onClick={() => showToast('已导出当前文件')}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                  >
                    导出当前文件
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : item.docNumber?.includes('OA-USPTO') || item.fileName.includes('USPTO') ? (
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 p-8 sm:p-10 text-slate-900 min-h-[580px] flex flex-col justify-between font-serif w-full">
            <div>
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <p className="text-xs font-mono font-bold tracking-widest text-slate-600 uppercase">
                  UNITED STATES PATENT AND TRADEMARK OFFICE (USPTO)
                </p>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                  OFFICIAL TRADEMARK NOTICE
                </h2>
              </div>

              <div className="my-5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs grid grid-cols-3 gap-2 font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans font-bold">SERIAL NO.</span>
                  <strong className="text-slate-900">{item.applicationNo || '97/882,109'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans font-bold">MARK</span>
                  <strong className="text-blue-700 font-sans">{item.trademarkName || 'TECHNOVA'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans font-bold">ISSUE DATE</span>
                  <strong className="text-slate-900">{item.officialDate || '2026-08-19'}</strong>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-800 leading-relaxed">
                <p className="font-bold text-slate-900">
                  SUBJECT: OFFICE ACTION - NON-FINAL REFUSAL UNDER SECTION 2(d)
                </p>
                <p className="text-justify indent-4">
                  The examining attorney has reviewed the application for registration of the trademark and has refused registration under Trademark Act Section 2(d), 15 U.S.C. §1052(d), citing a likelihood of confusion with U.S. Registration No. 5,492,011.
                </p>
                <p className="text-justify indent-4 text-slate-600">
                  Applicant is granted six (6) months from the issue date to file a formal response or request for reconsideration with supporting evidence.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>USPTO e-FOIA SEAL VERIFIED</span>
              <span>EXAMINER CODE: #88219</span>
            </div>
          </div>
        ) : item.fileName.includes('POA') || item.docNumber?.includes('POA') ? (
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 p-8 sm:p-10 text-slate-900 min-h-[580px] flex flex-col justify-between font-serif w-full">
            <div>
              <div className="border-b border-slate-900 pb-3 text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-900 tracking-wide">
                  POWER OF ATTORNEY / 授权委托书
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  FOR INTELLECTUAL PROPERTY MATTERS (SINGAPORE IPOS / OVERSEAS)
                </p>
              </div>

              <div className="my-5 space-y-3 text-xs leading-relaxed text-slate-800">
                <p>
                  <strong>1. PRINCIPAL (委托人):</strong> Guangzhou Starfield Delight Co., Ltd. (广州星际悦动股份有限公司)
                </p>
                <p>
                  <strong>2. REPRESENTATIVE (受托人):</strong> {item.agencyName}
                </p>
                <p className="text-justify">
                  <strong>3. SCOPE OF AUTHORIZATION:</strong> To act as legal representative for Trademark Application No. <strong>{item.applicationNo || 'SG40202608912P'}</strong> for trademark <strong>"{item.trademarkName || 'usmile CARE'}"</strong>.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">STAMP & SIGNATURE ATTACHED</span>
              <div className="text-right">
                <span className="font-bold block">{item.officialDate || '2026-08-15'}</span>
                <span className="text-[10px] text-slate-400 font-mono">EXECUTED AT GUANGZHOU</span>
              </div>
            </div>
          </div>
        ) : item.fileName.includes('Invoice') || item.fileName.includes('CMS') ? (
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 p-8 sm:p-10 text-slate-900 min-h-[580px] flex flex-col justify-between w-full font-sans">
            <div>
              <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.agencyName}</h3>
                  <p className="text-xs text-slate-500">Legal & Intellectual Property Services</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded border border-blue-200">
                    INVOICE / 账单
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-800 mt-1">{item.docNumber || 'INV-CMS-2026-0922'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Date: {item.officialDate || '2026-08-18'}</p>
                </div>
              </div>

              <div className="my-5 p-3 bg-slate-50 rounded-lg text-xs grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">CLIENT</span>
                  <strong className="text-slate-900 block">{item.previewData?.applicant || 'Guangzhou Starfield Delight Co., Ltd.'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">MATTER</span>
                  <span className="text-slate-800 block">EUIPO Opposition & Renewal Filings</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span>Legal Services & EUIPO Opposition Defense</span>
                  <span className="font-mono font-semibold">€ 15,550.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Official Renewal Disbursements & Translation</span>
                  <span className="font-mono font-semibold">€ 9,250.00</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-300 font-bold text-slate-900">
                  <span>Total Amount Due (EUR)</span>
                  <span className="font-mono text-blue-700 text-sm">€ 24,800.00</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 text-xs flex justify-between items-center text-slate-500">
              <span>Ref: {item.caseNo || 'EU20260105-TM'}</span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold text-[11px]">
                AUDITED
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 p-8 sm:p-10 text-slate-900 min-h-[580px] flex flex-col justify-between w-full">
            <div>
              <div className="border-b-2 border-red-600 pb-4 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                    ★
                  </div>
                  <h2 className="text-lg font-bold text-red-600 tracking-wider font-serif">
                    {item.previewData?.headerTitle || '国家知识产权局商标局'}
                  </h2>
                </div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  {item.previewData?.subHeader || item.fileName}
                </h3>
                <p className="text-xs text-slate-500 font-mono pt-1">
                  文号：{item.previewData?.docNo || item.docNumber || '发文字[2026]第08912号'} | 发文日期：{item.previewData?.dispatchDate || item.uploadTime.slice(0, 10)}
                </p>
              </div>

              <div className="my-5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 text-[11px] block">商标名称</span>
                  <strong className="text-blue-700 font-bold text-sm">{item.previewData?.trademarkName || item.trademarkName || 'usmile'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">申请号 / 类别</span>
                  <strong className="text-slate-800 font-mono">{item.previewData?.applicationNo || item.applicationNo || '68930211'} (第 {item.previewData?.classCode || item.classes || '21'} 类)</strong>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-800 leading-relaxed font-serif">
                <p className="text-justify indent-6">
                  {item.previewData?.mainContent || '根据《中华人民共和国商标法》及气体实施条例之规定，经实质审查，所报商标业务申请材料完备，符合法定程序，予以核发并进入法定公告或实施排期。'}
                </p>
                {item.previewData?.examinerRemarks && (
                  <p className="text-justify indent-6 text-slate-600">
                    {item.previewData.examinerRemarks}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-end justify-between">
              <div className="text-[11px] text-slate-400">
                系统核验盖章 • 法律有效电子文书
              </div>

              <div className="relative text-center pr-4">
                <div className="w-24 h-24 rounded-full border-2 border-red-500/80 text-red-600 flex flex-col items-center justify-center p-1 text-[9px] font-serif font-bold rotate-[-12deg] opacity-90 select-none pointer-events-none">
                  <span>★</span>
                  <span className="text-[8px] text-center leading-tight">
                    {item.previewData?.sealText || '国家知识产权局商标局 电子专用章'}
                  </span>
                  <span className="text-[7px] font-mono mt-0.5">{item.uploadTime.slice(0, 10)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast message notification (页面居中显示) */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] max-w-md px-6 py-4 bg-slate-900/95 backdrop-blur-md text-white text-sm font-semibold rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-slate-700/80 pointer-events-none text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Single Card Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Banner Top */}
        <div className="p-4 border-b border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-blue-50/80">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <h2 className="text-base font-black text-slate-900 font-display tracking-tight whitespace-nowrap">
                代理协调与律所协同中心
              </h2>
            </div>
            <span className="hidden sm:inline text-slate-300 text-xs">|</span>
            <p className="text-xs text-slate-600">
              海内外律所官方发文归集、中国商标电子通知书自动交互。
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleOpenUpdateCaseModal()}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
              title="从律所协管中心批量同步与更新案件状态/官方发文/审查信息"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>更新案件信息</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBatchUpdateCasesFile(null);
                setIsBatchUpdateCasesModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
              title="批量导入模板更新已有商标案件信息"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>批量更新案件</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTargetAgencyForTask(null);
                setSelectedTaskCaseNos([]);
                setActiveTaskCaseNo('');
                setTaskFormDataMap({});
                setCreateTaskSearchText('');
                setIsCreateHandlingTaskModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
              title="为协同商标案件新增待处理事项、指派代理律所与设定官方/内部期限"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>新增处理事项</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBatchAddTasksFile(null);
                setIsBatchAddTasksModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
              title="批量导入模板新增处理事项"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>批量新增处理事项</span>
            </button>

            <button
              onClick={() => handleOpenUploadModal('CHINA_ELECTRONIC_NOTICE')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>上传协同文件</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Header */}
        <div className="px-4 py-2.5 sm:py-3 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* 左上角 Tab: 待确认、已确认同步 */}
          <div className="flex items-center gap-5 sm:gap-6 overflow-x-auto scrollbar-none pt-1">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('PENDING_CONFIRM');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                statusFilter === 'PENDING_CONFIRM'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>待确认</span>
              <span className={`text-xs ${statusFilter === 'PENDING_CONFIRM' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {pendingConfirmCount}
              </span>
              {statusFilter === 'PENDING_CONFIRM' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('CONFIRMED');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                statusFilter === 'CONFIRMED'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>已确认同步</span>
              <span className={`text-xs ${statusFilter === 'CONFIRMED' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {confirmedCount}
              </span>
              {statusFilter === 'CONFIRMED' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Search & Secondary Filter */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="ALL">全部交互类型</option>
              <option value="CHINA_NOTICE">中国商标电子通知书</option>
              <option value="OVERSEAS_NOTICE">其它通知书</option>
              <option value="OTHER_FILE">其它类型文件</option>
            </select>

            <div className="relative min-w-[180px] sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索文件/交互类型/代理/上传人..."
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-6 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-all shadow-2xs"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div>
          {/* ================= 待处理 (Pending Actions Table) ================= */}
          {/* 严格按照要求展示列：文件，交互类型，代理结构，上传人，状态，操作 */}
          <div className="animate-in fade-in duration-150">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[240px]">文件</th>
                    <th className="py-3 px-4 min-w-[150px]">交互类型</th>
                    <th className="py-3 px-4 min-w-[160px]">代理结构 (代理机构)</th>
                    <th className="py-3 px-4 min-w-[130px]">上传人</th>
                    <th className="py-3 px-4 min-w-[110px]">上传时间</th>
                    <th className="py-3 px-4 text-center min-w-[100px]">状态</th>
                    <th className="py-3 px-4 text-right min-w-[150px] sticky right-0 z-20 bg-slate-50 border-l border-slate-200/80 whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredPendingList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <div className="max-w-xs mx-auto space-y-2">
                            <FolderArchive className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="font-medium text-slate-500">暂无待处理文件记录</p>
                            <p className="text-[11px] text-slate-400">
                              点击上方“上传协同文件”即可添加并进行在线预览与案件同步
                            </p>
                            <button
                              onClick={() => handleOpenUploadModal('CHINA_ELECTRONIC_NOTICE')}
                              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 border border-blue-200 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>上传协同文件</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedPendingList.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                          {/* 1. 文件 (只显示文件名) */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {renderFormatBadge(item.fileFormat)}
                              <div 
                                onClick={() => handleOpenSourceFilePreview(item)}
                                className="font-medium text-slate-900 hover:text-blue-600 cursor-pointer transition-colors leading-snug line-clamp-2"
                                title={`点击直接在线预览原文件：${item.fileName}`}
                              >
                                {item.fileName}
                              </div>
                            </div>
                          </td>

                          {/* 2. 交互类型 */}
                          <td className="py-3 px-4">
                            {renderInteractionTypeBadge(item.interactionType, item.uploadType)}
                          </td>

                          {/* 3. 代理结构 (代理机构) */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-800 text-xs">
                                {item.agencyName}
                              </span>
                            </div>
                            {item.agencyDocketNo && (
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5 ml-5">
                                {item.agencyDocketNo}
                              </span>
                            )}
                          </td>

                          {/* 4. 上传人 */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div>
                              <span className="font-medium text-slate-800 text-xs block leading-tight">
                                {item.uploader}
                              </span>
                              {item.uploaderRole && (
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {item.uploaderRole}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 5. 上传时间 */}
                          <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono text-xs">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{item.uploadTime ? item.uploadTime.split(' ')[0] : ''}</span>
                            </div>
                          </td>

                          {/* 6. 状态 */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {renderStatusBadge(item.status)}
                          </td>

                          {/* 7. 操作 */}
                          <td className="py-3 px-4 text-right whitespace-nowrap sticky right-0 z-10 bg-white group-hover:bg-[#f3f7fd] border-l border-slate-100">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 详情操作 (点击弹出显示详情弹框，展示上传文件弹框的全部字段内容) */}
                              <button
                                type="button"
                                onClick={() => setPreviewItem(item)}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                title="查看协同文件详情弹框"
                              >
                                详情
                              </button>

                              {/* 确认操作 (点击后弹出选择案件弹框，确认后同步至案件详情-文件列表) */}
                              <button
                                type="button"
                                onClick={() => handleOpenSelectCaseModal(item)}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                title="选择目标案件并将该文件同步归档至案件详情文件列表"
                              >
                                {item.status === 'CONFIRMED' ? '重新关联' : '关联案件'}
                              </button>

                              {/* 删除操作 (状态=已确认同步时，隐藏且不允许删除) */}
                              {item.status !== 'CONFIRMED' && (
                                <button
                                  type="button"
                                  onClick={() => setItemToDelete(item)}
                                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                  title="删除协同文件记录"
                                >
                                  删除
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 列表底部页码切换器 */}
              <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-3 text-xs text-slate-500">
                <Pagination
                  currentPage={currentPage}
                  totalCount={filteredPendingList.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: 上传文件页面 (支持中国商标电子通知书、其它通知书、其它类型文件) */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    上传协同文件
                  </h3>
                  <p className="text-xs text-slate-500">
                    支持中国商标网上服务系统电子通知书、境外官方审查发文及各类知产协同文档
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal 3 Top Tabs: 【中国商标电子通知书】 / 【其它通知书】 / 【其它类型文件】 */}
            <div className="flex border-b border-slate-200 bg-slate-100/60 p-1 gap-1">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setUploadActiveTab('CHINA_ELECTRONIC_NOTICE')}
                style={{ outline: 'none', boxShadow: 'none' }}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none active:outline-none ${
                  uploadActiveTab === 'CHINA_ELECTRONIC_NOTICE'
                    ? 'bg-white text-slate-800 shadow-xs border border-slate-200/80 ring-0'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent ring-0'
                }`}
              >
                <Stamp className="w-3.5 h-3.5 text-blue-600" />
                <span>中国商标电子通知书</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setUploadActiveTab('OTHER_NOTICE')}
                style={{ outline: 'none', boxShadow: 'none' }}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none active:outline-none ${
                  uploadActiveTab === 'OTHER_NOTICE'
                    ? 'bg-white text-slate-800 shadow-xs border border-slate-200/80 ring-0'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent ring-0'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>其它通知书</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setUploadActiveTab('OTHER_FILE')}
                style={{ outline: 'none', boxShadow: 'none' }}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none active:outline-none ${
                  uploadActiveTab === 'OTHER_FILE'
                    ? 'bg-white text-slate-800 shadow-xs border border-slate-200/80 ring-0'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent ring-0'
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5 text-purple-600" />
                <span>其它类型文件</span>
              </button>
            </div>

            <form onSubmit={handleConfirmUpload} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Type 1: 中国商标电子通知书说明 (Grey style per user requirement 2) */}
              {uploadActiveTab === 'CHINA_ELECTRONIC_NOTICE' && (
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Stamp className="w-3.5 h-3.5 text-slate-500" />
                    <span>中国国家知识产权局 (CNIPA) 官方电子发文规范</span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    支持上传中国商标网上发文系统下载的《商标受理通知书》、《初审公告通知书》、《注册证》、《驳回/部分驳回通知书》、《异议/答辩通知书》等 PDF 原件或 ZIP 电子公文包。
                  </p>
                </div>
              )}

              {/* Type 2: 其它通知书说明 (Grey style) */}
              {uploadActiveTab === 'OTHER_NOTICE' && (
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>海外官方知产局与马德里官方审查通知</span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    支持上传美国 (USPTO Office Action)、欧盟 (EUIPO Notice)、日本 (JPO)、新加坡 (IPOS)、英国 (UKIPO) 及世界知识产权组织 (WIPO) 等海外官方发文。
                  </p>
                </div>
              )}

              {/* Type 3: 其它类型文件说明 (Grey style) */}
              {uploadActiveTab === 'OTHER_FILE' && (
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <FolderArchive className="w-3.5 h-3.5 text-slate-500" />
                    <span>知产授权委托、证据包、账单与合同协议</span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    支持上传授权委托书 (POA)、异议及撤三使用证据包、代理服务费账单 (Invoice)、转让公证书与商标许可合同等。
                  </p>
                </div>
              )}
              {/* Drag and drop upload zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  选择或拖拽文件 <span className="text-rose-500">*</span>
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setUploadDragActive(true); }}
                  onDragLeave={() => setUploadDragActive(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                    uploadDragActive
                      ? "border-blue-500 bg-blue-50/60"
                      : selectedUploadFile
                      ? "border-emerald-400 bg-emerald-50/30"
                      : "border-slate-300 hover:border-blue-400 bg-slate-50/50"
                  }`}
                >
                  {selectedUploadFile ? (
                    <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800">{selectedUploadFile.name}</p>
                          <p className="text-[10px] text-slate-500">{(selectedUploadFile.size / 1024).toFixed(1)} KB • 已准备就绪</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedUploadFile(null)}
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        重新选择
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">
                        点击或将文件拖放到此处上传
                      </p>
                      <p className="text-[11px] text-slate-400">
                        支持 PDF, ZIP, XML, DOCX, PNG 等格式，单个文件不超过 50MB
                      </p>
                      <label className="inline-block mt-2 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs">
                        浏览本地文件
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.zip,.rar,.xml,.doc,.docx,.png,.jpg"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields: Customized per upload type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 字段 1: 文件/通知书名称 */}
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {uploadActiveTab === "CHINA_ELECTRONIC_NOTICE" ? "通知书全称 / 文件名称" : uploadActiveTab === "OTHER_NOTICE" ? "官方通知书名称" : "文件主题名称"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadFormDocTitle}
                    onChange={(e) => setUploadFormDocTitle(e.target.value)}
                    placeholder={
                      uploadActiveTab === "CHINA_ELECTRONIC_NOTICE"
                        ? "请输入通知书名称，如：关于第68930211号“usmile”商标初步审定公告通知书"
                        : uploadActiveTab === "OTHER_NOTICE"
                        ? "请输入官方通知书名称，如：USPTO Provisional Refusal & Office Action Notice"
                        : "请输入文件主题名称，如：商标代理授权委托书 (POA) 签署公证扫描件"
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 字段 2: 交互具体子分类 (仅其它类型文件展示) */}
                {uploadActiveTab === "OTHER_FILE" && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      文件交互细类 <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={uploadFormOtherFileType}
                      onChange={(e) => setUploadFormOtherFileType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="授权委托书 (POA)">授权委托书 (POA)</option>
                      <option value="异议证据材料包">异议证据材料包</option>
                      <option value="撤三答辩使用证据">撤三答辩使用证据</option>
                      <option value="代理服务账单 (Invoice)">代理服务账单 (Invoice)</option>
                      <option value="转让/变更协议公证书">转让/变更协议公证书</option>
                      <option value="商标许可备案合同">商标许可备案合同</option>
                      <option value="法律分析意见书">法律分析意见书</option>
                    </select>
                  </div>
                )}

                {/* 字段 2B: 海外官方机构 (仅其它通知书展示) */}
                {uploadActiveTab === "OTHER_NOTICE" && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      发文官方机构 / 国家地区 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={uploadFormOverseasAuthority}
                      onChange={(e) => setUploadFormOverseasAuthority(e.target.value)}
                      placeholder="请输入发文机构，如：美国专利商标局 (USPTO)、欧盟知产局 (EUIPO)"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {/* 字段 3: 官方发文文号 / 文件编号 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    发文文号 / 文件编号
                  </label>
                  <input
                    type="text"
                    value={uploadFormDocNumber}
                    onChange={(e) => setUploadFormDocNumber(e.target.value)}
                    placeholder="如：发文字[2026]第089302号"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 字段 4: 代理机构名称 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    代理机构名称
                  </label>
                  <input
                    type="text"
                    value={uploadFormAgency}
                    onChange={(e) => setUploadFormAgency(e.target.value)}
                    placeholder="如：北京市柳沈律师事务所、Baker & McKenzie"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 字段 5: 官方发文日期 / 签署日期 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    发文日期 / 签署日期
                  </label>
                  <input
                    type="date"
                    value={uploadFormDate}
                    onChange={(e) => setUploadFormDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 字段 6: 经办人 / 上传人 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    内部经办人 / 上传人
                  </label>
                  <input
                    type="text"
                    value={uploadFormUploader}
                    onChange={(e) => setUploadFormUploader(e.target.value)}
                    placeholder="请输入上传人员姓名"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 字段 7: 对应商标名称 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    对应商标名称
                  </label>
                  <input
                    type="text"
                    value={uploadFormTrademarkName}
                    onChange={(e) => setUploadFormTrademarkName(e.target.value)}
                    placeholder="如：usmile、TECHNOVA"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 字段 8: 申请号 / 注册号 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    申请号 / 注册号
                  </label>
                  <input
                    type="text"
                    value={uploadFormAppNo}
                    onChange={(e) => setUploadFormAppNo(e.target.value)}
                    placeholder="如：68930211、97882109"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 字段 9: 尼斯分类 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    尼斯分类 (类号)
                  </label>
                  <input
                    type="text"
                    value={uploadFormClasses}
                    onChange={(e) => setUploadFormClasses(e.target.value)}
                    placeholder="如：21, 09, 10"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>


                {/* 字段 11: 备注说明 */}
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    流转说明 / 审查意见摘要
                  </label>
                  <textarea
                    rows={2}
                    value={uploadFormRemarks}
                    onChange={(e) => setUploadFormRemarks(e.target.value)}
                    placeholder="请输入该文件的流转处理要求、审查重点或代理意见摘要..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>正在归集解析并入库...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>确认上传并提交协同</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 1: 点击文件名触发 - 直接在线预览原文件 */}
      {/* ========================================================================= */}
      {sourceFilePreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-3.5 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0 border border-blue-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 truncate max-w-[480px]" title={sourceFilePreviewItem.fileName}>
                      {sourceFilePreviewItem.fileName}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      在线文件预览
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {sourceFilePreviewItem.interactionType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    代理机构：<span className="font-semibold text-slate-700">{sourceFilePreviewItem.agencyName}</span> • 任务编号：<span className="font-mono">{sourceFilePreviewItem.taskNo}</span>
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Download 源文件 button */}
                <button
                  type="button"
                  onClick={() => {
                    if (sourceFilePreviewItem.fileUrl) {
                      const a = document.createElement('a');
                      a.href = sourceFilePreviewItem.fileUrl;
                      a.download = sourceFilePreviewItem.fileName;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    } else {
                      const mockContent = `代理协同文件: ${sourceFilePreviewItem.fileName}\n任务编号: ${sourceFilePreviewItem.taskNo}\n代理机构: ${sourceFilePreviewItem.agencyName}`;
                      const blob = new Blob([mockContent], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = sourceFilePreviewItem.fileName.includes('.') ? sourceFilePreviewItem.fileName : `${sourceFilePreviewItem.fileName}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }
                    showToast(`已将【${sourceFilePreviewItem.fileName}】下载至本地`);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>下载源文件</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceFilePreviewItem(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="关闭"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Document Preview Stage */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {/* Zoom Controls */}
              <div className="flex items-center justify-between mb-4 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>原文件直接在线预览</span>
                  <span className="text-slate-400 font-mono font-normal">({sourceFilePreviewItem.fileFormat})</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewZoom(z => Math.max(50, z - 10))}
                      className="p-1 rounded hover:bg-white text-slate-600 cursor-pointer font-bold transition-colors"
                      title="缩小"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center font-mono font-semibold text-slate-700 text-xs">
                      {previewZoom}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewZoom(z => Math.min(150, z + 10))}
                      className="p-1 rounded hover:bg-white text-slate-600 cursor-pointer font-bold transition-colors"
                      title="放大"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewZoom(100)}
                      className="p-1 px-1.5 text-[11px] rounded hover:bg-white text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                      title="重置 100%"
                    >
                      重置
                    </button>
                  </div>
                </div>
              </div>

              {/* Embedded Document Stage */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-200/80 p-4 flex justify-center items-start min-h-[500px]">
                {renderDocumentCanvas(sourceFilePreviewItem)}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span>文件格式：<strong className="text-slate-700 font-mono">{sourceFilePreviewItem.fileFormat}</strong></span>
                <span>大小：<strong className="text-slate-700 font-mono">{sourceFilePreviewItem.fileSize}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setSourceFilePreviewItem(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 详情弹窗 (完全复用【建案需求详情】的样式与结构) */}
      {/* ========================================================================= */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Top Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {renderStatusBadge(previewItem.status)}
                <h3 className="text-base font-bold text-slate-900 shrink-0">文件协同详情</h3>
              </div>

              {/* Right Header Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const item = previewItem;
                    if (item.fileUrl) {
                      const a = document.createElement('a');
                      a.href = item.fileUrl;
                      a.download = item.fileName;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    } else {
                      const mockContent = `文件名称：${item.fileName}\n文号/案号：${item.docNumber || '无'}\n代理机构：${item.agencyName}\n上传人员：${item.uploader}\n上传时间：${item.uploadTime}\n交互类型：${item.interactionType}\n\n[代理协同平台 - 官方文书与证据源文件存档]\n本文档为系统导出的原文件内容副本。`;
                      const blob = new Blob([mockContent], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = item.fileName.includes('.') ? item.fileName : `${item.fileName}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }
                    showToast(`已将【${item.fileName}】下载至本地`);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-600 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="下载源文件到本地"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">下载源文件</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const item = previewItem;
                    setPreviewItem(null);
                    handleOpenSelectCaseModal(item);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <FolderSync className="w-3.5 h-3.5" />
                  <span>关联同步至案件</span>
                </button>

                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                基本信息
              </button>
              <button
                onClick={() => setDetailModalTab('attachment')}
                className={`py-3 font-medium cursor-pointer border-b-2 transition-all ${
                  detailModalTab === 'attachment'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                文件附件
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
                  {/* 1. 要素信息 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>要素信息</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div className="sm:col-span-2">
                        <span className="text-slate-500">文书 / 文件全称：</span>
                        <span className="text-slate-900 font-bold">{previewItem.fileName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">交互类型：</span>
                        <span className="text-slate-900 font-medium">{previewItem.interactionType}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">发文文号/文件编号：</span>
                        <span className="font-mono text-slate-900 font-medium">{previewItem.docNumber || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">发文/签署日期：</span>
                        <span className="font-mono text-slate-900 font-medium">{previewItem.officialDate || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. 商标与关联案件 */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div>
                        <span className="text-slate-500">对应商标名称：</span>
                        <span className="text-blue-700 font-bold">{previewItem.trademarkName || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请/注册号：</span>
                        <span className="font-mono text-slate-900 font-medium">{previewItem.applicationNo || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">尼斯分类：</span>
                        <span className="text-slate-900 font-medium">
                          {previewItem.classes ? `第 ${previewItem.classes} 类` : '—'}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500">关联案件编号：</span>
                        <span className="font-mono text-slate-900 font-medium">
                          {previewItem.caseNo || previewItem.syncedCaseNo || '暂未关联同步'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. 主体与经办机构 & 流转说明 */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div>
                        <span className="text-slate-500">代理机构名称：</span>
                        <span className="text-slate-900 font-medium">{previewItem.agencyName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">机构文号/案号：</span>
                        <span className="font-mono text-slate-900 font-medium">{previewItem.agencyDocketNo || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">内部经办人：</span>
                        <span className="text-slate-900 font-medium">
                          {previewItem.uploader} {previewItem.uploaderRole && `(${previewItem.uploaderRole})`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">上传时间：</span>
                        <span className="font-mono text-slate-900 font-medium">{previewItem.uploadTime}</span>
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <span className="text-slate-500">流转说明 / 审查意见摘要：</span>
                        <span className="text-slate-900 font-medium">{previewItem.remarks || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. 文件附件 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>文件附件</span>
                    </h4>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {renderFormatBadge(previewItem.fileFormat)}
                        <div>
                          <p className="font-bold text-slate-900">{previewItem.fileName}</p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            格式：{previewItem.fileFormat} • 大小：{previewItem.fileSize}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDetailModalTab('attachment')}
                        className="px-3 py-1.5 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 font-medium text-xs transition-colors cursor-pointer"
                      >
                        在线预览原件
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {detailModalTab === 'attachment' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      {renderFormatBadge(previewItem.fileFormat)}
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{previewItem.fileName}</h5>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          大小：{previewItem.fileSize} • 格式：{previewItem.fileFormat} • 状态：文件归集就绪
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Zoom controls */}
                      <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(prev => Math.max(50, prev - 15))}
                          className="px-2 py-0.5 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                          title="缩小"
                        >
                          -
                        </button>
                        <span className="px-1 text-[11px] text-slate-700 font-semibold min-w-[36px] text-center">{previewZoom}%</span>
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(prev => Math.min(200, prev + 15))}
                          className="px-2 py-0.5 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                          title="放大"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          showToast('已调起系统打印机准备输出文件');
                          window.print();
                        }}
                        className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        title="打印文件"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>打印</span>
                      </button>
                    </div>
                  </div>

                  {/* Embedded Document Stage */}
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-200/80 p-4 flex justify-center items-start min-h-[500px]">
                    <div 
                      className="transition-transform duration-200 w-full max-w-4xl flex justify-center"
                      style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
                    >
                      {/* 1. If real uploaded file URL exists */}
                      {previewItem.fileUrl ? (
                        <div className="bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden w-full min-h-[600px] flex items-center justify-center">
                          {previewItem.fileFormat === 'PDF' ? (
                            <iframe 
                              src={previewItem.fileUrl} 
                              className="w-full h-[650px] border-0" 
                              title={previewItem.fileName} 
                            />
                          ) : (
                            <div className="p-8 flex flex-col items-center justify-center">
                              <img 
                                src={previewItem.fileUrl} 
                                alt={previewItem.fileName} 
                                className="max-w-full max-h-[600px] object-contain rounded-lg shadow-md border border-slate-200"
                              />
                              <p className="mt-3 text-xs text-slate-500 font-mono">{previewItem.fileName}</p>
                            </div>
                          )}
                        </div>
                      ) : previewItem.fileFormat === 'ZIP' ? (
                        /* 2. Interactive ZIP Archive Source Explorer */
                        <div className="bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden text-slate-900 flex flex-col min-h-[560px] w-full">
                          {/* ZIP Header Bar */}
                          <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <FolderArchive className="w-5 h-5 text-amber-600" />
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{previewItem.fileName}</h4>
                                <p className="text-xs text-slate-500">压缩包证据链归档原件 • 包含 4 个源文件</p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-mono font-bold">
                              ZIP ARCHIVE
                            </span>
                          </div>

                          {/* ZIP File Explorer Layout */}
                          <div className="grid grid-cols-1 md:grid-cols-12 flex-1">
                            {/* Left: File Tree */}
                            <div className="md:col-span-4 bg-slate-50/80 border-r border-slate-200 p-3 space-y-1.5">
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">包内文件列表</p>
                              {[
                                { name: '01_日文翻译公证书扫描件.pdf', size: '1.2 MB', type: 'PDF' },
                                { name: '02_日本特许厅答辩书正本.pdf', size: '850 KB', type: 'PDF' },
                                { name: '03_出口报关单及合同明细.pdf', size: '5.4 MB', type: 'PDF' },
                                { name: '04_专柜实地陈列照片.png', size: '8.9 MB', type: 'PNG' }
                              ].map((sub, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setSelectedZipSubfile(idx)}
                                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors border ${
                                    selectedZipSubfile === idx
                                      ? 'bg-blue-50/90 text-blue-900 border-blue-300 font-semibold shadow-2xs'
                                      : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100'
                                  }`}
                                >
                                  <File className="w-4 h-4 text-blue-600 shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs leading-snug">{sub.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sub.size} • {sub.type}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Right: Selected Sub-file Raw Preview */}
                            <div className="md:col-span-8 p-6 bg-white flex flex-col justify-between min-h-[420px]">
                              <div>
                                <div className="pb-3 mb-4 border-b border-slate-200 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-bold text-slate-900">
                                      {[
                                        '01_日文翻译公证书扫描件.pdf',
                                        '02_日本特许厅答辩书正本.pdf',
                                        '03_出口报关单及合同明细.pdf',
                                        '04_专柜实地陈列照片.png'
                                      ][selectedZipSubfile]}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 font-mono">文件内容预览</span>
                                </div>

                                {selectedZipSubfile === 0 && (
                                  <div className="space-y-3 font-serif text-xs text-slate-800 leading-relaxed p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div className="text-center border-b border-slate-200 pb-2">
                                      <h5 className="font-bold text-sm text-slate-900">公证书 (公证翻译正本)</h5>
                                      <p className="text-[11px] text-slate-500 font-mono">(2026) 粤广南方第 08219 号</p>
                                    </div>
                                    <p className="indent-6">
                                      兹证明，申请人【广州星际悦动股份有限公司】提交的销售合同及海关申报文书日文翻译件，与中文原本内容一致。
                                    </p>
                                  </div>
                                )}

                                {selectedZipSubfile === 1 && (
                                  <div className="space-y-3 font-serif text-xs text-slate-800 leading-relaxed p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div className="text-center border-b border-slate-200 pb-2">
                                      <h5 className="font-bold text-sm text-slate-900">异议申立答辩书</h5>
                                      <p className="text-[11px] text-slate-500 font-mono">商标异议 2026-900122 号事件</p>
                                    </div>
                                    <p className="indent-6">
                                      被申立人：广州星际悦动股份有限公司。本件商标“SOLARIS”与引用商标存在显著区别，不易引发市场混淆，请求予以维持注册。
                                    </p>
                                  </div>
                                )}

                                {selectedZipSubfile === 2 && (
                                  <div className="space-y-3 text-xs text-slate-800 leading-relaxed p-4 bg-slate-50 border border-slate-200 rounded-lg font-sans">
                                    <div className="text-center border-b border-slate-200 pb-2">
                                      <h5 className="font-bold text-sm text-slate-900">海关出口货物报关单明细汇总</h5>
                                    </div>
                                    <p className="text-xs text-slate-700">
                                      累计报关出口金额：61,400,000 日元，出口商品包含 SOLARIS 声波电动牙刷及替换刷头等。
                                    </p>
                                  </div>
                                )}

                                {selectedZipSubfile === 3 && (
                                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center space-y-3">
                                    <div className="w-full max-w-sm h-36 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center text-slate-800 shadow-inner">
                                      <div className="p-4 text-center">
                                        <span className="text-base font-bold text-blue-700 block mb-1">usmile | SOLARIS</span>
                                        <span className="text-xs text-slate-600 block">东京新宿专柜实拍照片</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                                <span>查看第 {selectedZipSubfile + 1} / 4 个文件</span>
                                <button
                                  type="button"
                                  onClick={() => showToast('已导出当前文件')}
                                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                                >
                                  导出当前文件
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : previewItem.docNumber?.includes('OA-USPTO') || previewItem.fileName.includes('USPTO') ? (
                        /* 3. Authentic USPTO Office Action Source Document */
                        <div className="bg-white rounded-xl shadow-2xl border border-slate-300 p-8 sm:p-10 text-slate-900 min-h-[580px] flex flex-col justify-between font-serif w-full">
                          <div>
                            {/* USPTO Header */}
                            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                              <p className="text-xs font-mono font-bold tracking-widest text-slate-600 uppercase">
                                UNITED STATES PATENT AND TRADEMARK OFFICE (USPTO)
                              </p>
                              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                                OFFICIAL TRADEMARK NOTICE
                              </h2>
                            </div>

                            {/* Docketing Info */}
                            <div className="my-5 p-3 bg-slate-50 border border-slate-200 rounded text-xs grid grid-cols-3 gap-3">
                              <div>
                                <span className="text-slate-400 block text-[10px]">SERIAL NUMBER</span>
                                <strong className="text-slate-900 font-mono">{previewItem.applicationNo || '97/882,109'}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">MARK</span>
                                <strong className="text-blue-700 font-sans">{previewItem.trademarkName || 'TECHNOVA'}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">ISSUE DATE</span>
                                <strong className="text-slate-900 font-mono">{previewItem.officialDate || '2026-08-19'}</strong>
                              </div>
                            </div>

                            {/* Official Refusal Text */}
                            <div className="space-y-3 text-xs text-slate-800 leading-relaxed font-serif">
                              <p className="font-bold text-slate-900">
                                SUBJECT: NON-FINAL OFFICE ACTION (PROVISIONAL REFUSAL)
                              </p>
                              <p className="text-justify">
                                <strong>SECTION 2(e)(1) REFUSAL - MERELY DESCRIPTIVE:</strong> Registration is refused on the Principal Register because the applied-for mark merely describes features of applicant's goods under Class 09 and Class 21.
                              </p>
                              <p className="text-justify">
                                <strong>RESPONSE DEADLINE:</strong> Applicant must submit a timely response within THREE (3) MONTHS from the issue date (Deadline: November 19, 2026).
                              </p>
                            </div>
                          </div>

                          {/* USPTO Sign-off */}
                          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
                            <span>Examining Attorney: Sarah Jenkins, Esq.</span>
                            <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-bold rounded">
                              OFFICIAL USPTO COMMUNICATION
                            </span>
                          </div>
                        </div>
                      ) : previewItem.fileName.includes('POA') || previewItem.docNumber?.includes('POA') ? (
                        /* 4. Authentic Singapore / International POA Source Document */
                        <div className="bg-white rounded-xl shadow-2xl border border-slate-300 p-8 sm:p-10 text-slate-900 min-h-[580px] flex flex-col justify-between font-serif w-full">
                          <div>
                            {/* POA Header */}
                            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                              <p className="text-xs font-mono font-bold tracking-wider text-slate-500">INTELLECTUAL PROPERTY OFFICE OF SINGAPORE</p>
                              <h2 className="text-lg font-bold text-slate-900 uppercase">
                                POWER OF ATTORNEY (FORM TM 1)
                              </h2>
                            </div>

                            {/* Appointment Declarations */}
                            <div className="my-6 space-y-4 text-xs text-slate-800 leading-relaxed">
                              <p>
                                <strong>1. PRINCIPAL:</strong> Guangzhou Starfield Delight Co., Ltd. / usmile Global Pte. Ltd.
                              </p>
                              <p>
                                <strong>2. APPOINTED AGENT:</strong> Allen & Gledhill LLP (One Marina Boulevard, Singapore)
                              </p>
                              <p className="text-justify">
                                <strong>3. SCOPE OF AUTHORIZATION:</strong> To act as legal representative for Trademark Application No. <strong>{previewItem.applicationNo || 'SG40202608912P'}</strong> for trademark <strong>"{previewItem.trademarkName || 'usmile CARE'}"</strong>.
                              </p>
                            </div>
                          </div>

                          {/* Signature & Seal */}
                          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
                            <div>
                              <p className="text-slate-500 text-[11px]">Authorized Signatory:</p>
                              <p className="font-bold text-slate-900 font-sans mt-1">CHEN YUYANG (CEO)</p>
                            </div>
                            <div className="w-16 h-16 rounded-full border-2 border-blue-900/60 text-blue-900 flex flex-col items-center justify-center text-[7px] font-sans font-bold rotate-[-10deg]">
                              <span>NOTARIAL SEAL</span>
                            </div>
                          </div>
                        </div>
                      ) : previewItem.fileName.includes('Invoice') || previewItem.fileName.includes('CMS') ? (
                        /* 5. Authentic European Law Firm Invoice Source Document */
                        <div className="bg-white rounded-xl shadow-2xl border border-slate-300 p-8 sm:p-10 text-slate-900 min-h-[580px] flex flex-col justify-between font-sans w-full">
                          <div>
                            {/* Invoice Header */}
                            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                              <div>
                                <h2 className="text-lg font-bold text-slate-900">CMS Law Firm</h2>
                                <p className="text-xs text-slate-500">CMS Hasche Sigle • European IP Practice</p>
                              </div>
                              <div className="text-right">
                                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold rounded">INVOICE</span>
                                <p className="text-xs font-mono font-bold text-slate-800 mt-1">{previewItem.docNumber || 'INV-CMS-2026-0922'}</p>
                                <p className="text-[11px] text-slate-500 font-mono">Date: {previewItem.officialDate || '2026-08-18'}</p>
                              </div>
                            </div>

                            {/* Billed To */}
                            <div className="my-5 p-3 bg-slate-50 rounded-lg text-xs grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-slate-400 text-[10px] block font-bold">CLIENT</span>
                                <strong className="text-slate-900 block">{previewItem.previewData?.applicant || 'Guangzhou Starfield Delight Co., Ltd.'}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] block font-bold">MATTER</span>
                                <span className="text-slate-800 block">EUIPO Opposition & Renewal Filings</span>
                              </div>
                            </div>

                            {/* Summary Table */}
                            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2 text-xs">
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span>Legal Services & EUIPO Opposition Defense</span>
                                <span className="font-mono font-semibold">€ 15,550.00</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Official Renewal Disbursements & Translation</span>
                                <span className="font-mono font-semibold">€ 9,250.00</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-slate-300 font-bold text-slate-900">
                                <span>Total Amount Due (EUR)</span>
                                <span className="font-mono text-blue-700 text-sm">€ 24,800.00</span>
                              </div>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="pt-4 border-t border-slate-200 text-xs flex justify-between items-center text-slate-500">
                            <span>Ref: {previewItem.caseNo || 'EU20260105-TM'}</span>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold text-[11px]">
                              AUDITED
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* 6. Authentic CNIPA Electronic Notice Source Document */
                        <div className="bg-white rounded-xl shadow-2xl border border-slate-300 p-8 sm:p-10 text-slate-900 min-h-[580px] flex flex-col justify-between w-full">
                          <div>
                            {/* CNIPA Header */}
                            <div className="border-b-2 border-red-600 pb-4 text-center space-y-1.5">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                                  ★
                                </div>
                                <h2 className="text-lg font-bold text-red-600 tracking-wider font-serif">
                                  {previewItem.previewData?.headerTitle || '国家知识产权局商标局'}
                                </h2>
                              </div>
                              <h3 className="text-base font-bold text-slate-900 font-serif">
                                {previewItem.previewData?.subHeader || previewItem.fileName}
                              </h3>
                              <p className="text-xs text-slate-500 font-mono pt-1">
                                文号：{previewItem.previewData?.docNo || previewItem.docNumber || '发文字[2026]第08912号'} | 发文日期：{previewItem.previewData?.dispatchDate || previewItem.uploadTime.slice(0, 10)}
                              </p>
                            </div>

                            {/* Streamlined Key Info Summary */}
                            <div className="my-5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-slate-500 text-[11px] block">商标名称</span>
                                <strong className="text-blue-700 font-bold text-sm">{previewItem.previewData?.trademarkName || previewItem.trademarkName || 'usmile'}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[11px] block">申请号 / 类别</span>
                                <strong className="text-slate-800 font-mono">{previewItem.previewData?.applicationNo || previewItem.applicationNo || '68930211'} (第 {previewItem.previewData?.classCode || previewItem.classes || '21'} 类)</strong>
                              </div>
                            </div>

                            {/* Statutory Legal Body */}
                            <div className="space-y-3 text-xs text-slate-800 leading-relaxed font-serif">
                              <p className="text-justify indent-6">
                                {previewItem.previewData?.mainContent || '根据《中华人民共和国商标法》及气体实施条例之规定，经实质审查，所报商标业务申请材料完备，符合法定程序，予以核发并进入法定公告或实施排期。'}
                              </p>
                              {previewItem.previewData?.examinerRemarks && (
                                <p className="text-justify indent-6 text-slate-600">
                                  {previewItem.previewData.examinerRemarks}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Stamp & Verification */}
                          <div className="pt-6 mt-6 border-t border-slate-100 flex items-end justify-between">
                            <div className="text-[11px] text-slate-400">
                              系统核验盖章 • 法律有效电子文书
                            </div>

                            <div className="relative text-center pr-4">
                              <div className="w-24 h-24 rounded-full border-2 border-red-500/80 text-red-600 flex flex-col items-center justify-center p-1 text-[9px] font-serif font-bold rotate-[-12deg] opacity-90 select-none pointer-events-none">
                                <span>★</span>
                                <span className="text-[8px] text-center leading-tight">
                                  {previewItem.previewData?.sealText || '国家知识产权局商标局 电子专用章'}
                                </span>
                                <span className="text-[7px] font-mono mt-0.5">{previewItem.uploadTime.slice(0, 10)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
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
                          <td className="py-2.5 px-3.5 font-mono">{previewItem.uploadTime}</td>
                          <td className="py-2.5 px-3.5 font-medium">{previewItem.uploader} ({previewItem.agencyName})</td>
                          <td className="py-2.5 px-3.5 font-medium text-emerald-600">提交文件与需求</td>
                          <td className="py-2.5 px-3.5 text-slate-500">由【{previewItem.agencyName}】经办人【{previewItem.uploader}】完成文书资料上传</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-3.5 font-mono">{previewItem.uploadTime}</td>
                          <td className="py-2.5 px-3.5 font-medium">系统智能引擎</td>
                          <td className="py-2.5 px-3.5 font-medium text-blue-600">智能OCR文书解析</td>
                          <td className="py-2.5 px-3.5 text-slate-500">提取文号【{previewItem.docNumber || '无'}】及商标【{previewItem.trademarkName || '—'}】要素并自动预关联</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-3.5 font-mono">{previewItem.status === 'CONFIRMED' ? previewItem.uploadTime : '处理中'}</td>
                          <td className="py-2.5 px-3.5 font-medium">内部法务经办人</td>
                          <td className={previewItem.status === 'CONFIRMED' ? 'py-2.5 px-3.5 font-medium text-emerald-600' : 'py-2.5 px-3.5 font-medium text-blue-600'}>
                            {previewItem.status === 'CONFIRMED' ? '案件协同与同步' : '待内部确认'}
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-500">
                            {previewItem.status === 'CONFIRMED'
                              ? ('已成功同步绑定至案件【' + (previewItem.caseNo || previewItem.syncedCaseNo || '') + '】')
                              : '等待内部法务经办确认并关联合约与案件库'}
                          </td>
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

      {/* ========================================================================= */}
      {/* MODAL: 二次确认删除弹框 (点击删除按钮，弹出二次确认弹框，确认之后才执行删除) */}
      {/* ========================================================================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">确认删除协同文件记录？</h3>
                <p className="text-xs text-slate-500 mt-1">
                  删除后该文件记录将从待处理协同列表中移除，此操作不可撤销。
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 shrink-0">文件名称：</span>
                <span className="font-semibold text-slate-900 text-right line-clamp-2" title={itemToDelete.fileName}>
                  {itemToDelete.fileName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">交互类型：</span>
                <span className="text-slate-700 font-medium">{itemToDelete.interactionType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">代理机构：</span>
                <span className="text-slate-700 font-medium">{itemToDelete.agencyName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">上传人 / 时间：</span>
                <span className="text-slate-700">{itemToDelete.uploader} ({itemToDelete.uploadTime})</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = itemToDelete.fileName;
                  handleDeleteItem(itemToDelete.id);
                  setItemToDelete(null);
                  showToast(`已成功删除文件记录【${name}】`);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: 选择案件弹框 (比例与【案件详情】一致，案件列表与【案件管理】一致) */}
      {/* ========================================================================= */}
      {isSelectCaseModalOpen && confirmingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* 1. Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <FolderSync className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      选择关联案件
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    从商标案件管理库中选择目标案件，确认后系统将协同文件自动推入该案件的官方卷宗库，可在【案件详情-文件列表】实时查阅
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSelectCaseModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Modal Body (Scrollable container) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-50/50">
              
              {/* 2.1 待同步文件信息与归档设置 */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-xs bg-slate-100/60 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  {renderFormatBadge(confirmingItem.fileFormat)}
                  <span className="font-bold text-slate-900 truncate max-w-xs" title={confirmingItem.fileName}>
                    {confirmingItem.fileName}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 shrink-0">{confirmingItem.interactionType}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 shrink-0">来源律所: {confirmingItem.agencyName}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700 text-xs whitespace-nowrap">
                      <span className="text-rose-500 mr-0.5">*</span>归档分类:
                    </span>
                    <select
                      value={syncCategory}
                      onChange={(e) => setSyncCategory(e.target.value as DocumentCategory)}
                      className={`bg-white border rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium cursor-pointer shadow-2xs ${
                        !syncCategory ? 'border-amber-400 bg-amber-50/40 text-slate-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="" disabled hidden>请选择</option>
                      <option value="官方文件">官方文件</option>
                      <option value="事务所文件">事务所文件</option>
                      <option value="企业文件">企业文件</option>
                      <option value="递交文件">递交文件</option>
                      <option value="其他文件">其他文件</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700 text-xs whitespace-nowrap">
                      <span className="text-rose-500 mr-0.5">*</span>归档文号:
                    </span>
                    <input
                      type="text"
                      value={syncDocNumber}
                      onChange={(e) => setSyncDocNumber(e.target.value)}
                      placeholder="请输入归档文号"
                      className={`bg-white border rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono w-40 shadow-2xs ${
                        !syncDocNumber.trim() ? 'border-amber-400 bg-amber-50/40' : 'border-slate-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 2.2 案件列表区 (完全对齐【案件管理】页面样式与布局) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
                
                {/* 2.2.1 状态选项卡栏 (对齐案件管理 Tab 样式) */}
                <div className="px-5 py-3 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                    {/* 全部案件 */}
                    <button
                      type="button"
                      onClick={() => {
                        setModalCaseTab('ALL');
                        setModalCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        modalCaseTab === 'ALL'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/90 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span>全部案件</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                        modalCaseTab === 'ALL' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        {caseTabCounts.total}
                      </span>
                    </button>

                    {/* 待申请 */}
                    <button
                      type="button"
                      onClick={() => {
                        setModalCaseTab('PENDING_APPLY');
                        setModalCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        modalCaseTab === 'PENDING_APPLY'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/90 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span>待申请</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                        modalCaseTab === 'PENDING_APPLY' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        {caseTabCounts.pendingApply}
                      </span>
                    </button>

                    {/* 申请中 */}
                    <button
                      type="button"
                      onClick={() => {
                        setModalCaseTab('APPLYING');
                        setModalCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        modalCaseTab === 'APPLYING'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/90 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span>申请中</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                        modalCaseTab === 'APPLYING' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        {caseTabCounts.applying}
                      </span>
                    </button>

                    {/* 审查中 */}
                    <button
                      type="button"
                      onClick={() => {
                        setModalCaseTab('EXAMINING');
                        setModalCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        modalCaseTab === 'EXAMINING'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/90 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span>审查中</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                        modalCaseTab === 'EXAMINING' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        {caseTabCounts.examining}
                      </span>
                    </button>

                    {/* 已注册 */}
                    <button
                      type="button"
                      onClick={() => {
                        setModalCaseTab('REGISTERED');
                        setModalCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        modalCaseTab === 'REGISTERED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/90 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span>已注册</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                        modalCaseTab === 'REGISTERED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        {caseTabCounts.registered}
                      </span>
                    </button>

                    {/* 待答复 */}
                    <button
                      type="button"
                      onClick={() => {
                        setModalCaseTab('PENDING_REPLY');
                        setModalCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        modalCaseTab === 'PENDING_REPLY'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/90 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span>待答复</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                        modalCaseTab === 'PENDING_REPLY' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        {caseTabCounts.pendingReply}
                      </span>
                    </button>

                    {/* 已失效 */}
                    <button
                      type="button"
                      onClick={() => {
                        setModalCaseTab('INVALID');
                        setModalCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        modalCaseTab === 'INVALID'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/90 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span>已失效</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                        modalCaseTab === 'INVALID' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        {caseTabCounts.invalid}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* 视图切换 (一屏合并视图 vs 平铺单列视图，默认平铺单列视图) */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => setModalViewMode('COMPOUND')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                          modalViewMode === 'COMPOUND'
                            ? 'bg-white text-blue-700 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="聚合所有关键字段在一屏中展示"
                      >
                        一屏合并视图
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalViewMode('STANDARD')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                          modalViewMode === 'STANDARD'
                            ? 'bg-white text-blue-700 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="展开所有字段为独立列"
                      >
                        平铺单列视图
                      </button>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0 font-medium">
                      当前筛选共 <strong className="text-blue-700">{filteredCasesForSelect.length}</strong> 件案件
                    </span>
                  </div>
                </div>

                {/* 2.2.2 搜索与筛选工具栏 */}
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 items-center">
                  {/* 案号/商标/申请人综合搜索 */}
                  <div className="relative md:col-span-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="搜索商标名称 / 案件编号 / 申请号 / 申请主体 / 代理律所..."
                      value={caseSearchKeyword}
                      onChange={(e) => {
                        setCaseSearchKeyword(e.target.value);
                        setModalCurrentPage(1);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 品牌选择 */}
                  <div>
                    <select
                      value={modalFilterBrand}
                      onChange={(e) => {
                        setModalFilterBrand(e.target.value);
                        setModalCurrentPage(1);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
                    >
                      <option value="ALL">全部品牌</option>
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

                  {/* 类别/法域与重置 */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="类别(如21类)"
                      value={modalFilterClass}
                      onChange={(e) => {
                        setModalFilterClass(e.target.value);
                        setModalCurrentPage(1);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCaseSearchKeyword('');
                        setModalFilterBrand('ALL');
                        setModalFilterClass('');
                        setModalFilterJurisdiction('');
                        setModalCaseTab('ALL');
                        setModalCurrentPage(1);
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs"
                      title="重置全部筛选条件"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>重置</span>
                    </button>
                  </div>
                </div>

                {/* 2.2.3 案件数据表格区域 (完全与案件管理PortfolioLedger保持一致) */}
                <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                  {modalViewMode === 'STANDARD' ? (
                    /* 平铺单列视图 (展开所有字段为独立列, 默认视图) */
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1300px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100/90 text-[12px] font-extrabold text-slate-600 sticky top-0 z-10">
                          <th className="py-3 px-3.5 w-12 text-center text-slate-400">选择</th>
                          <th className="py-3 px-4">商标名称</th>
                          <th className="py-3 px-4">商标形式</th>
                          <th className="py-3 px-4">案件编号</th>
                          <th className="py-3 px-4">品牌</th>
                          <th className="py-3 px-4">申请主体</th>
                          <th className="py-3 px-4">尼斯分类</th>
                          <th className="py-3 px-4">申请国家/地区</th>
                          <th className="py-3 px-4">商品项目摘要</th>
                          <th className="py-3 px-4">注册进度</th>
                          <th className="py-3 px-4 text-blue-700 font-bold">状态</th>
                          <th className="py-3 px-4">官方申请号</th>
                          <th className="py-3 px-4">代理律所</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {paginatedModalCases.length > 0 ? (
                          paginatedModalCases.map((item) => {
                            const isSelected = selectedCaseForSync?.id === item.id || selectedCaseForSync?.caseNo === item.caseNo;
                            const stage = item.timeline && item.timeline.length > 0 
                              ? item.timeline[item.timeline.length - 1].stage 
                              : '官方审查阶段';

                            let goodsFullText = '';
                            if (Array.isArray(item.goodsList) && item.goodsList.length > 0) {
                              goodsFullText = item.goodsList.map((g: any) => typeof g === 'string' ? g : (g.cnName || g.name || String(g))).join('、');
                            } else if (Array.isArray(item.goodsItems) && item.goodsItems.length > 0) {
                              goodsFullText = item.goodsItems.map((g: any) => typeof g === 'string' ? g : (g.cnName || g.name || String(g))).join('、');
                            } else if (typeof item.goodsItems === 'string' && item.goodsItems.trim()) {
                              goodsFullText = item.goodsItems.trim();
                            }
                            if (!goodsFullText) goodsFullText = '暂无商品项目数据';

                            return (
                              <tr 
                                key={item.id}
                                onClick={() => setSelectedCaseForSync(isSelected ? null : item)}
                                className={`hover:bg-blue-50/50 transition-colors group cursor-pointer ${
                                  isSelected 
                                    ? 'bg-blue-50/90 font-medium border-l-4 border-blue-600' 
                                    : ''
                                }`}
                              >
                                {/* 1. 单选框选择列 */}
                                <td className="py-3.5 px-3.5 text-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCaseForSync(isSelected ? null : item);
                                    }}
                                    className={`w-4 h-4 mx-auto rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                                      isSelected 
                                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs scale-110' 
                                        : 'border-slate-300 bg-white hover:border-blue-500'
                                    }`}
                                    title={isSelected ? '取消勾选' : '勾选此案件'}
                                  >
                                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </button>
                                </td>
                                {/* 2. 商标名称 */}
                                <td className="py-3.5 px-4 font-bold text-slate-900 tracking-tight truncate max-w-[180px]" title={item.trademarkName}>
                                  {item.trademarkName}
                                </td>
                                {/* 3. 商标形式 */}
                                <td className="py-3.5 px-4 truncate" title={item.trademarkForm || '文字'}>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                    {item.trademarkForm || '文字'}
                                  </span>
                                </td>
                                {/* 4. 案件编号 (蓝色，点击弹出与案件管理页面一模一样的案件详情弹窗) */}
                                <td className="py-3.5 px-4 font-mono font-medium truncate" title={item.caseNo}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingCaseDetail(item);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1 font-medium transition-colors truncate"
                                    title="点击查看案件详情"
                                  >
                                    <span className="truncate">{item.caseNo}</span>
                                  </button>
                                </td>
                                {/* 5. 品牌 */}
                                <td className="py-3.5 px-4 text-slate-700 truncate" title={item.brand}>
                                  <span className="inline-flex items-center gap-1.5 truncate">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      item.brand.includes('usmile') ? 'bg-blue-500' :
                                      item.brand.includes('KittyAnnie') ? 'bg-pink-500' :
                                      item.brand.includes('FHT') ? 'bg-amber-500' :
                                      item.brand.includes('aboval') ? 'bg-purple-500' : 'bg-emerald-500'
                                    }`} />
                                    <span className="truncate">{item.brand}</span>
                                  </span>
                                </td>
                                {/* 7. 申请主体 */}
                                <td className="py-3.5 px-4 text-slate-700 truncate max-w-[180px]" title={item.applicant || '广州星际悦动股份有限公司'}>
                                  {item.applicant || '广州星际悦动股份有限公司'}
                                </td>
                                {/* 8. 商标类别 */}
                                <td className="py-3.5 px-4 truncate" title={item.classes}>
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80 font-mono text-[11px] font-medium truncate inline-block max-w-full">
                                    {item.classes ? (item.classes.startsWith('第') ? item.classes : `第 ${item.classes} 类`) : '第 21 类'}
                                  </span>
                                </td>
                                {/* 9. 申请国家/地区 */}
                                <td className="py-3.5 px-4 text-slate-700 truncate" title={item.jurisdiction || '中国 (CN)'}>
                                  <span className="inline-flex items-center gap-1 truncate">
                                    <Globe2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{item.jurisdiction || '中国 (CN)'}</span>
                                  </span>
                                </td>
                                {/* 10. 商品项目摘要 */}
                                <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={goodsFullText}>
                                  <span className="truncate block" title={goodsFullText}>
                                    {goodsFullText}
                                  </span>
                                </td>
                                {/* 11. 注册进度 */}
                                <td className="py-3.5 px-4 font-medium text-slate-800 truncate" title={stage}>
                                  {stage}
                                </td>
                                {/* 12. 状态 */}
                                <td className="py-3.5 px-4 truncate">
                                  {renderCaseStatusBadge(item.status)}
                                </td>
                                {/* 13. 官方申请号 */}
                                <td className="py-3.5 px-4 font-mono text-slate-700 truncate" title={item.applicationNo || '—'}>
                                  {item.applicationNo || '—'}
                                </td>
                                {/* 14. 代理律所 */}
                                <td className="py-3.5 px-4 text-slate-700 truncate" title={item.agencyName || '—'}>
                                  {item.agencyName || '—'}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={13} className="py-12 text-center text-slate-400">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <FileText className="w-8 h-8 text-slate-300 stroke-1" />
                                <p className="text-xs">未找到符合条件的案件管理记录</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCaseSearchKeyword('');
                                    setModalFilterBrand('ALL');
                                    setModalFilterClass('');
                                    setModalFilterJurisdiction('');
                                    setModalCaseTab('ALL');
                                    setModalCurrentPage(1);
                                  }}
                                  className="text-xs text-blue-600 hover:underline mt-1 cursor-pointer"
                                >
                                  清空全部筛选条件
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    /* 一屏合并视图 (紧凑合并展示) */
                    <table className="w-full text-left border-collapse min-w-[950px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100/90 text-[12px] font-extrabold text-slate-600 sticky top-0 z-10">
                          <th className="py-3 px-3.5 w-12 text-center text-slate-400">选择</th>
                          <th className="py-3 px-4">商标 / 案件编号</th>
                          <th className="py-3 px-4">品牌 / 申请主体</th>
                          <th className="py-3 px-4">尼斯分类 / 目标法域</th>
                          <th className="py-3 px-4">商品项目摘要</th>
                          <th className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-blue-700">
                              <span>注册进度 / 状态</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            </span>
                          </th>
                          <th className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-blue-700">
                              <span>官方申请号 / 代理律所</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {paginatedModalCases.length > 0 ? (
                          paginatedModalCases.map((item) => {
                            const isSelected = selectedCaseForSync?.id === item.id || selectedCaseForSync?.caseNo === item.caseNo;
                            const stage = item.timeline && item.timeline.length > 0 
                              ? item.timeline[item.timeline.length - 1].stage 
                              : '官方审查阶段';
                            let goodsFullText = '';
                            let goodsCount = 0;
                            if (Array.isArray(item.goodsList) && item.goodsList.length > 0) {
                              goodsFullText = item.goodsList.map((g: any) => typeof g === 'string' ? g : (g.cnName || g.name || String(g))).join('、');
                              goodsCount = item.goodsList.length;
                            } else if (Array.isArray(item.goodsItems) && item.goodsItems.length > 0) {
                              goodsFullText = item.goodsItems.map((g: any) => typeof g === 'string' ? g : (g.cnName || g.name || String(g))).join('、');
                              goodsCount = item.goodsItems.length;
                            } else if (typeof item.goodsItems === 'string' && item.goodsItems.trim()) {
                              goodsFullText = item.goodsItems.trim();
                              goodsCount = goodsFullText.split(/[、,;\n]/).filter(Boolean).length || 1;
                            }
                            if (!goodsFullText) goodsFullText = '暂无商品项目数据';

                            return (
                              <tr 
                                key={item.id}
                                onClick={() => setSelectedCaseForSync(isSelected ? null : item)}
                                className={`hover:bg-blue-50/50 transition-colors group cursor-pointer ${
                                  isSelected 
                                    ? 'bg-blue-50/90 font-medium border-l-4 border-blue-600' 
                                    : ''
                                }`}
                              >
                                {/* 单选框选择列 */}
                                <td className="py-3 px-3.5 text-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCaseForSync(isSelected ? null : item);
                                    }}
                                    className={`w-4 h-4 mx-auto rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                                      isSelected 
                                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs scale-110' 
                                        : 'border-slate-300 bg-white hover:border-blue-500'
                                    }`}
                                    title={isSelected ? '取消勾选' : '勾选此案件'}
                                  >
                                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </button>
                                </td>
                                {/* 1. 商标名称 + 案件编号 + 形式徽标 */}
                                <td className="py-3 px-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 truncate" title={item.trademarkName}>
                                      <span className="font-bold text-slate-900 text-xs tracking-tight truncate">
                                        {item.trademarkName}
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                        {item.trademarkForm || '文字'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 truncate">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setViewingCaseDetail(item);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 hover:underline font-mono text-[11px] font-medium cursor-pointer truncate"
                                        title={`案件编号: ${item.caseNo}`}
                                      >
                                        {item.caseNo}
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                {/* 2. 品牌与主体 */}
                                <td className="py-3 px-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 truncate" title={item.brand}>
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        item.brand.includes('usmile') ? 'bg-blue-500' :
                                        item.brand.includes('KittyAnnie') ? 'bg-pink-500' :
                                        item.brand.includes('FHT') ? 'bg-amber-500' :
                                        item.brand.includes('aboval') ? 'bg-purple-500' : 'bg-emerald-500'
                                      }`} />
                                      <span className="font-medium text-slate-800 truncate">{item.brand}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate" title={item.applicant || '广州星际悦动股份有限公司'}>
                                      {item.applicant || '广州星际悦动股份有限公司'}
                                    </div>
                                  </div>
                                </td>
                                {/* 3. 商标类别与法域 */}
                                <td className="py-3 px-4">
                                  <div className="space-y-1">
                                    <div className="truncate" title={item.classes}>
                                      <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80 text-[11px] font-mono font-medium truncate max-w-full">
                                        {item.classes ? (item.classes.startsWith('第') ? item.classes : `第 ${item.classes} 类`) : '第 21 类'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 text-[11px] truncate" title={item.jurisdiction || '中国 (CN)'}>
                                      <Globe2 className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="truncate">{item.jurisdiction || '中国 (CN)'}</span>
                                    </div>
                                  </div>
                                </td>
                                {/* 4. 商品项目摘要 */}
                                <td className="py-3 px-4 max-w-xs" title={goodsFullText}>
                                  <div className="space-y-1" title={goodsFullText}>
                                    <p className="text-slate-600 truncate text-[11px]" title={goodsFullText}>
                                      {goodsFullText}
                                    </p>
                                    <span className="text-[10px] text-slate-400 block truncate" title={goodsFullText}>
                                      共 {goodsCount} 项指定商品
                                    </span>
                                  </div>
                                </td>
                                {/* 5. 注册进度与状态 */}
                                <td className="py-3 px-4">
                                  <div className="space-y-1">
                                    <div className="font-medium text-slate-900 truncate text-[11px]" title={stage}>
                                      {stage}
                                    </div>
                                    <div className="truncate">
                                      {renderCaseStatusBadge(item.status)}
                                    </div>
                                  </div>
                                </td>
                                {/* 6. 官方申请号与代理律所 */}
                                <td className="py-3 px-4">
                                  <div className="space-y-1">
                                    <div className="font-mono text-slate-800 text-[11px] truncate" title={item.applicationNo || '待官方下发申请号'}>
                                      {item.applicationNo || '待官方下发申请号'}
                                    </div>
                                    <div className="text-slate-500 text-[11px] truncate" title={item.agencyName || '代理律所跟进中'}>
                                      {item.agencyName || '代理律所跟进中'}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <FileText className="w-8 h-8 text-slate-300 stroke-1" />
                                <p className="text-xs">未找到符合条件的案件管理记录</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* 2.2.4 分页条 */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end text-xs text-slate-500">
                  <Pagination
                    currentPage={modalCurrentPage}
                    totalCount={filteredCasesForSelect.length}
                    pageSize={modalPageSize}
                    onPageChange={setModalCurrentPage}
                    onPageSizeChange={setModalPageSize}
                  />
                </div>

              </div>
            </div>

            {/* 3. Modal Actions Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-lg">
              <div className="flex-1 min-w-0 max-w-full sm:max-w-[460px] lg:max-w-[560px]">
                {selectedCaseForSync && (
                  <div className="flex items-start gap-2 p-2 px-3 bg-blue-50/90 border border-blue-200/90 rounded-xl text-xs text-slate-700 leading-relaxed break-words whitespace-normal shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1 break-words">
                      <span className="font-medium text-slate-700">已选目标案件：</span>
                      <strong className="text-blue-900 font-mono font-bold">{selectedCaseForSync.caseNo}</strong>
                      <span className="text-slate-400 mx-1">|</span>
                      <strong className="text-slate-900 font-bold">【{selectedCaseForSync.trademarkName}】</strong>
                      <span className="text-slate-400 mx-1">|</span>
                      <span>
                        {selectedCaseForSync.classes 
                          ? (selectedCaseForSync.classes.startsWith('第') 
                              ? selectedCaseForSync.classes 
                              : (selectedCaseForSync.classes.includes('类') ? `第${selectedCaseForSync.classes}` : `第 ${selectedCaseForSync.classes} 类`)) 
                          : '第 21 类'} ({selectedCaseForSync.jurisdiction || '中国 (CN)'})
                      </span>
                      <span className="text-slate-400 mx-1">|</span>
                      <span>归档类别: <strong className={syncCategory ? "text-blue-700 font-bold" : "text-amber-600 font-bold"}>{syncCategory || '未选择'}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => setIsSelectCaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleConfirmSyncToCase}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSyncing ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>正在同步归档至【文件列表】...</span>
                    </>
                  ) : (
                    <>
                      <FolderSync className="w-4 h-4" />
                      <span>确认关联并同步至【案件详情-文件列表】</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: 更新案件信息 (从信息协管表格右上角触发) */}
      {/* ========================================================================= */}
      {isUpdateCaseInfoModalOpen && (() => {
        const currentTargetCase = caseItems.find(c => c.caseNo === activeUpdateCaseNo) || null;
        
        // 过滤案件列表（平铺单列视图）
        const filteredUpdateCases = caseItems.filter(c => {
          if (!updateCaseSearchText.trim()) return true;
          const q = updateCaseSearchText.trim().toLowerCase();
          return (
            (c.trademarkName && c.trademarkName.toLowerCase().includes(q)) ||
            (c.caseNo && c.caseNo.toLowerCase().includes(q)) ||
            (c.proposalNo && c.proposalNo.toLowerCase().includes(q)) ||
            (c.brand && c.brand.toLowerCase().includes(q)) ||
            (c.applicant && c.applicant.toLowerCase().includes(q)) ||
            (c.classes && c.classes.toLowerCase().includes(q)) ||
            (c.jurisdiction && c.jurisdiction.toLowerCase().includes(q)) ||
            (c.applicationNo && c.applicationNo.toLowerCase().includes(q)) ||
            (c.registrationNo && c.registrationNo.toLowerCase().includes(q)) ||
            (c.agencyName && c.agencyName.toLowerCase().includes(q)) ||
            (c.status && c.status.toLowerCase().includes(q))
          );
        });

        const renderCaseStatusBadge = (status: string) => {
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
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>审查中</span>
                </span>
              );
            case 'REGISTERED':
            case '已注册':
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>已注册</span>
                </span>
              );
            case 'PENDING_REPLY':
            case '待答复':
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                  <span>待答复</span>
                </span>
              );
            case 'INVALID':
            case '已失效':
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>已失效</span>
                </span>
              );
            default:
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <span>{status || '—'}</span>
                </span>
              );
          }
        };

        const activeFormData = (activeUpdateCaseNo && updateCaseFormDataMap[activeUpdateCaseNo]) || {
          caseNo: '',
          agencyName: '',
          status: '',
          applicationNo: '',
          applyDate: '',
          registrationNo: '',
          registrationDate: '',
          latestProgress: '',
          filingDeadline: '',
          initialIssueNo: '',
          initialIssueDate: '',
          regIssueNo: '',
          regIssueDate: '',
          intlRegNo: '',
          intlRegDate: '',
          renewalStartDate: '',
          rightsEndDate: '',
          updateType: 'OFFICIAL_NOTICE_SYNC',
          remarks: ''
        };

        const updateActiveFormData = (patch: Partial<typeof activeFormData>) => {
          if (!activeUpdateCaseNo) return;
          setUpdateCaseFormDataMap(prev => ({
            ...prev,
            [activeUpdateCaseNo]: {
              ...(prev[activeUpdateCaseNo] || activeFormData),
              ...patch
            }
          }));
        };

        const handleOpenConfirmDialog = () => {
          if (selectedUpdateCaseNos.length === 0) {
            showToast('请先在上方案件列表中勾选需要更新的案件！');
            return;
          }
          setIsUpdateCaseConfirmDialogOpen(true);
        };

        const handleExecuteActualUpdate = () => {
          if (selectedUpdateCaseNos.length === 0) return;
          setIsSubmittingUpdateCase(true);
          setIsUpdateCaseConfirmDialogOpen(false);

          selectedUpdateCaseNos.forEach((cNo) => {
            const formData = updateCaseFormDataMap[cNo];
            const targetCase = caseItems.find(c => c.caseNo === cNo);
            if (!targetCase || !formData) return;

            const updatedCase: CaseManagementItem = {
              ...targetCase,
              applicationNo: formData.applicationNo || targetCase.applicationNo,
              applyDate: formData.applyDate || targetCase.applyDate,
              registrationNo: formData.registrationNo || targetCase.registrationNo,
              registrationDate: formData.registrationDate || targetCase.registrationDate,
              latestProgress: formData.latestProgress || targetCase.latestProgress,
              filingDeadline: formData.filingDeadline || targetCase.filingDeadline,
              initialIssueNo: formData.initialIssueNo || targetCase.initialIssueNo,
              initialIssueDate: formData.initialIssueDate || targetCase.initialIssueDate,
              regIssueNo: formData.regIssueNo || targetCase.regIssueNo,
              regIssueDate: formData.regIssueDate || targetCase.regIssueDate,
              intlRegNo: formData.intlRegNo || targetCase.intlRegNo,
              intlRegDate: formData.intlRegDate || targetCase.intlRegDate,
              renewalStartDate: formData.renewalStartDate || targetCase.renewalStartDate,
              rightsEndDate: formData.rightsEndDate || targetCase.rightsEndDate,
              validUntil: formData.rightsEndDate || targetCase.validUntil,
              status: (formData.status as any) || targetCase.status,
              agencyName: formData.agencyName || targetCase.agencyName,
              timeline: formData.latestProgress ? [
                ...(targetCase.timeline || []),
                {
                  stage: formData.latestProgress,
                  date: new Date().toISOString().slice(0, 10),
                  description: `律所协同更新：${formData.latestProgress}${formData.remarks ? ` - ${formData.remarks}` : ''}`,
                  status: 'COMPLETED'
                }
              ] : (targetCase.timeline || [])
            };

            onUpdateCase?.(updatedCase);
          });

          setTimeout(() => {
            setIsSubmittingUpdateCase(false);
            setIsUpdateCaseInfoModalOpen(false);
            showToast(`已成功批量更新 ${selectedUpdateCaseNos.length} 个案件的基本信息（14项官方协同字段已同步至案件详情与台账）！`);
          }, 400);
        };

        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-7xl h-[95vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-slate-900">
                      更新案件信息
                    </h3>

                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    上区多选全量案件列表，下区按案件编号 Tab 切换并维护官方申请号、注册号、公告期号、法定期限及最新注册进度等14项核心字段
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdateCaseInfoModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 上下两个分区 (Top: 案件列表平铺单列视图; Bottom: 14项可更新字段表单) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/40">
              
              {/* ========================================================================= */}
              {/* 上分区: 案件列表 (支持多选 + 全选) */}
              {/* ========================================================================= */}
              <div className="flex flex-col">
                {/* 顶部工具条 */}
                <div className="py-2.5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>案件列表 (支持多选)</span>
                    </span>
                    <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      共 {filteredUpdateCases.length} 个案件
                    </span>
                    {selectedUpdateCaseNos.length > 0 && (
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        已选中 {selectedUpdateCaseNos.length} 项
                      </span>
                    )}
                  </div>

                  {/* 搜索框 */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-72">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={updateCaseSearchText}
                        onChange={(e) => setUpdateCaseSearchText(e.target.value)}
                        placeholder="搜索商标名 / 案号 / 品牌 / 申请号..."
                        className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                      />
                      {updateCaseSearchText && (
                        <button
                          type="button"
                          onClick={() => setUpdateCaseSearchText('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 平铺单列数据表格 (多选勾选框) */}
                <div className="overflow-x-auto max-h-[260px] overflow-y-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[12px] font-medium text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-12">
                          <input
                            type="checkbox"
                            checked={filteredUpdateCases.length > 0 && filteredUpdateCases.every(c => selectedUpdateCaseNos.includes(c.caseNo))}
                            onChange={() => handleToggleSelectAllUpdateCases(filteredUpdateCases)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer accent-blue-600"
                            title="全选 / 取消全选"
                          />
                        </th>
                        <th className="py-2.5 px-4">商标名称</th>
                        <th className="py-2.5 px-4">商标形式</th>
                        <th className="py-2.5 px-4">案件编号</th>
                        <th className="py-2.5 px-4">建案编码</th>
                        <th className="py-2.5 px-4">品牌</th>
                        <th className="py-2.5 px-4">申请主体</th>
                        <th className="py-2.5 px-4">尼斯分类</th>
                        <th className="py-2.5 px-4">申请国家/地区</th>
                        <th className="py-2.5 px-4">商品项目摘要</th>
                        <th className="py-2.5 px-4">注册进度</th>
                        <th className="py-2.5 px-4 text-blue-700 font-bold">状态</th>
                        <th className="py-2.5 px-4">官方申请号</th>
                        <th className="py-2.5 px-4">代理律所</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredUpdateCases.length > 0 ? (
                        filteredUpdateCases.map((item) => {
                          const isSelected = selectedUpdateCaseNos.includes(item.caseNo);
                          const isActive = item.caseNo === activeUpdateCaseNo;
                          const stage = item.timeline && item.timeline.length > 0 
                            ? item.timeline[item.timeline.length - 1].stage 
                            : (item.latestProgress || '官方审查阶段');

                          let goodsFullText = '';
                          if (Array.isArray(item.goodsList) && item.goodsList.length > 0) {
                            goodsFullText = item.goodsList.map((g: any) => typeof g === 'string' ? g : (g.cnName || g.name || String(g))).join('、');
                          } else if (Array.isArray(item.goodsItems) && item.goodsItems.length > 0) {
                            goodsFullText = item.goodsItems.map((g: any) => typeof g === 'string' ? g : (g.cnName || g.name || String(g))).join('、');
                          } else if (typeof item.goodsItems === 'string' && item.goodsItems.trim()) {
                            goodsFullText = item.goodsItems.trim();
                          }

                          if (typeof item.goodsItems === 'string' && item.goodsItems.length > goodsFullText.length) {
                            goodsFullText = item.goodsItems;
                          }
                          if (!goodsFullText) {
                            goodsFullText = '暂无商品项目数据';
                          }

                          return (
                            <tr 
                              key={item.id || item.caseNo}
                              onClick={() => {
                                if (!selectedUpdateCaseNos.includes(item.caseNo)) {
                                  handleToggleSelectCaseForUpdate(item.caseNo);
                                } else {
                                  setActiveUpdateCaseNo(item.caseNo);
                                }
                              }}
                              className={`cursor-pointer transition-colors group ${
                                isSelected
                                  ? 'bg-blue-50/70 font-medium'
                                  : 'hover:bg-blue-50/30'
                              }`}
                            >
                              {/* 0. 多选框 */}
                              <td className="py-2.5 px-3 text-center" onClick={(e) => { e.stopPropagation(); handleToggleSelectCaseForUpdate(item.caseNo); }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleSelectCaseForUpdate(item.caseNo);
                                  }}
                                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                              </td>

                              {/* 1. 商标名称 */}
                              <td className="py-2.5 px-4 font-bold text-slate-900 tracking-tight truncate max-w-[150px]" title={item.trademarkName}>
                                {item.trademarkName}
                              </td>

                              {/* 2. 商标形式 */}
                              <td className="py-2.5 px-4 truncate" title={item.trademarkForm || '文字'}>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                  {item.trademarkForm || '文字'}
                                </span>
                              </td>

                              {/* 3. 案件编号 */}
                              <td className="py-2.5 px-4 font-mono font-medium truncate" title={item.caseNo}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingCaseDetail(item);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1 font-medium transition-colors truncate"
                                  title="点击查看案件详情"
                                >
                                  <span className="truncate">{item.caseNo}</span>
                                </button>
                              </td>

                              {/* 4. 建案编码 */}
                              <td className="py-2.5 px-4 font-mono truncate" title={item.proposalNo}>
                                <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                                  {item.proposalNo || '—'}
                                </span>
                              </td>

                              {/* 5. 品牌 */}
                              <td className="py-2.5 px-4 text-slate-700 truncate" title={item.brand}>
                                <span className="inline-flex items-center gap-1.5 truncate">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    item.brand.includes('usmile') ? 'bg-blue-500' :
                                    item.brand.includes('KittyAnnie') ? 'bg-pink-500' :
                                    item.brand.includes('FHT') ? 'bg-amber-500' :
                                    item.brand.includes('aboval') ? 'bg-purple-500' : 'bg-emerald-500'
                                  }`} />
                                  <span className="truncate">{item.brand}</span>
                                </span>
                              </td>

                              {/* 6. 申请主体 */}
                              <td className="py-2.5 px-4 text-slate-700 truncate max-w-[180px]" title={item.applicant || '广州星际悦动股份有限公司'}>
                                {item.applicant || '广州星际悦动股份有限公司'}
                              </td>

                              {/* 7. 商标类别 */}
                              <td className="py-2.5 px-4 truncate" title={item.classes}>
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80 font-mono text-[11px] font-medium truncate inline-block max-w-full">
                                  {item.classes}
                                </span>
                              </td>

                              {/* 8. 国家/地区 */}
                              <td className="py-2.5 px-4 text-slate-700 truncate" title={item.jurisdiction}>
                                <span className="inline-flex items-center gap-1 truncate">
                                  <Globe2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{item.jurisdiction}</span>
                                </span>
                              </td>

                              {/* 9. 商品项目摘要 */}
                              <td className="py-2.5 px-4 max-w-[200px] truncate text-slate-600" title={goodsFullText}>
                                <span className="truncate block" title={goodsFullText}>
                                  {goodsFullText}
                                </span>
                              </td>

                              {/* 10. 注册进度 */}
                              <td className="py-2.5 px-4 font-medium text-slate-800 truncate" title={stage}>
                                {stage}
                              </td>

                              {/* 11. 状态 */}
                              <td className="py-2.5 px-4 truncate">
                                {renderCaseStatusBadge(item.status)}
                              </td>

                              {/* 12. 官方申请号 */}
                              <td className="py-2.5 px-4 font-mono text-slate-700 truncate" title={item.applicationNo || '—'}>
                                {item.applicationNo || '—'}
                              </td>

                              {/* 13. 代理律所 */}
                              <td className="py-2.5 px-4 text-slate-700 truncate" title={item.agencyName || '—'}>
                                {item.agencyName || '—'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={14} className="py-10 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <FileText className="w-7 h-7 text-slate-300 stroke-1" />
                              <p className="text-xs">未找到符合搜索条件的案件</p>
                              {updateCaseSearchText && (
                                <button
                                  onClick={() => setUpdateCaseSearchText('')}
                                  className="text-xs text-blue-600 hover:underline cursor-pointer"
                                >
                                  清除搜索条件
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* 下分区: 可以更新的字段 (14项核心字段维护表单 + 按案件编号 Tab 切换) */}
              {/* ========================================================================= */}
              <div className="space-y-3 pt-1">
                {/* 模块标题与按案件编号 Tab 切换 */}
                <div className="py-2 flex flex-col gap-2.5 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FileEdit className="w-4 h-4 text-blue-600" />
                        <span>更新案件信息字段</span>
                      </span>
                      {selectedUpdateCaseNos.length > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          已选中 {selectedUpdateCaseNos.length} 个案件 (可点击下方 Tab 切换维护)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200">
                          请在上方列表中勾选目标案件
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 按案件编号 Tab 切换栏 */}
                  {selectedUpdateCaseNos.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar">
                      <span className="text-[11px] font-semibold text-slate-500 shrink-0 mr-1">
                        切换维护案件:
                      </span>
                      {selectedUpdateCaseNos.map((cNo) => {
                        const cItem = caseItems.find(c => c.caseNo === cNo);
                        const isActive = cNo === activeUpdateCaseNo;
                        return (
                          <button
                            key={cNo}
                            type="button"
                            onClick={() => setActiveUpdateCaseNo(cNo)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                              isActive
                                ? 'bg-blue-600 text-white font-bold shadow-xs ring-2 ring-blue-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            }`}
                          >
                            <span className="font-mono">{cNo}</span>
                            {cItem && (
                              <span className={`text-[11px] truncate max-w-[120px] ${isActive ? 'text-blue-100 font-normal' : 'text-slate-500 font-normal'}`}>
                                ({cItem.trademarkName})
                              </span>
                            )}
                            <X
                              className={`w-3.5 h-3.5 rounded-full p-0.5 hover:bg-black/20 ${isActive ? 'text-white' : 'text-slate-400'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSelectCaseForUpdate(cNo);
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 14 项字段网格表单 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                  {/* 1. 官方申请号 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      官方申请号 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={activeFormData.applicationNo}
                      onChange={(e) => updateActiveFormData({ applicationNo: e.target.value })}
                      placeholder="如：SG4020260813401"
                      className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-2xs font-semibold text-slate-900"
                    />
                  </div>

                  {/* 2. 官方申请日 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      官方申请日 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={activeFormData.applyDate}
                      onChange={(e) => updateActiveFormData({ applyDate: e.target.value })}
                      className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 3. 官方注册号 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      官方注册号
                    </label>
                    <input
                      type="text"
                      value={activeFormData.registrationNo}
                      onChange={(e) => updateActiveFormData({ registrationNo: e.target.value })}
                      placeholder="如：REG-8890123"
                      className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-2xs font-bold text-emerald-700"
                    />
                  </div>

                  {/* 4. 官方注册日 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      官方注册日
                    </label>
                    <input
                      type="date"
                      value={activeFormData.registrationDate}
                      onChange={(e) => updateActiveFormData({ registrationDate: e.target.value })}
                      className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 5. 最新注册进度 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      最新注册进度 <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={activeFormData.latestProgress}
                        onChange={(e) => updateActiveFormData({ latestProgress: e.target.value })}
                        className="w-full font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 text-xs focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs text-blue-900"
                      >
                        <option value="">{activeUpdateCaseNo ? '请选择注册进度' : '-- 请先在上方勾选待更新案件 --'}</option>
                        {REGISTRATION_PROGRESS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                        {activeFormData.latestProgress && !REGISTRATION_PROGRESS_OPTIONS.includes(activeFormData.latestProgress) && (
                          <option value={activeFormData.latestProgress}>
                            {activeFormData.latestProgress}
                          </option>
                        )}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 6. 申报/答复截止日 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      申报/答复截止日
                    </label>
                    <input
                      type="date"
                      value={activeFormData.filingDeadline}
                      onChange={(e) => updateActiveFormData({ filingDeadline: e.target.value })}
                      className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-2xs text-amber-800 font-semibold"
                    />
                  </div>

                  {/* 7. 初审公告期号 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      初审公告期号
                    </label>
                    <input
                      type="text"
                      value={activeFormData.initialIssueNo}
                      onChange={(e) => updateActiveFormData({ initialIssueNo: e.target.value })}
                      placeholder="如：1892期"
                      className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 8. 初审公告日 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      初审公告日
                    </label>
                    <input
                      type="date"
                      value={activeFormData.initialIssueDate}
                      onChange={(e) => updateActiveFormData({ initialIssueDate: e.target.value })}
                      className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 9. 注册公告期号 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      注册公告期号
                    </label>
                    <input
                      type="text"
                      value={activeFormData.regIssueNo}
                      onChange={(e) => updateActiveFormData({ regIssueNo: e.target.value })}
                      placeholder="如：1904期"
                      className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 10. 注册公告日 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      注册公告日
                    </label>
                    <input
                      type="date"
                      value={activeFormData.regIssueDate}
                      onChange={(e) => updateActiveFormData({ regIssueDate: e.target.value })}
                      className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 11. 国际注册号 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      国际注册号
                    </label>
                    <input
                      type="text"
                      value={activeFormData.intlRegNo}
                      onChange={(e) => updateActiveFormData({ intlRegNo: e.target.value })}
                      placeholder="如：IR-2026-90812"
                      className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 12. 国际注册日 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      国际注册日
                    </label>
                    <input
                      type="date"
                      value={activeFormData.intlRegDate}
                      onChange={(e) => updateActiveFormData({ intlRegDate: e.target.value })}
                      className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 13. 续展起始日 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      续展起始日
                    </label>
                    <input
                      type="date"
                      value={activeFormData.renewalStartDate}
                      onChange={(e) => updateActiveFormData({ renewalStartDate: e.target.value })}
                      className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* 14. 权利终止日/有效期止 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      权利终止日/有效期止
                    </label>
                    <input
                      type="date"
                      value={activeFormData.rightsEndDate}
                      onChange={(e) => updateActiveFormData({ rightsEndDate: e.target.value })}
                      className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-2xs font-medium text-slate-900"
                    />
                  </div>

                  {/* 15. 协同代理律所 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      协同代理律所
                    </label>
                    <select
                      value={activeFormData.agencyName}
                      onChange={(e) => updateActiveFormData({ agencyName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                    >
                      <option value="">{activeUpdateCaseNo ? '请选择代理律所' : '-- 请先在上方勾选待更新案件 --'}</option>
                      {agencyList.map(a => (
                        <option key={a.id} value={a.name}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 16. 案件当前状态 */}
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-700">
                      更新后案件状态
                    </label>
                    <select
                      value={activeFormData.status}
                      onChange={(e) => updateActiveFormData({ status: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                    >
                      <option value="">{activeUpdateCaseNo ? '请选择案件状态' : '-- 请先在上方勾选待更新案件 --'}</option>
                      <option value="待申请">待申请 (准备递交)</option>
                      <option value="申请中">申请中 (已提交局方受理)</option>
                      <option value="审查中">审查中 (实质审查阶段)</option>
                      <option value="待答复">待答复 (收到审查意见/异议通知)</option>
                      <option value="已注册">已注册 (核准注册并领证)</option>
                      <option value="已失效">已失效 (驳回/放弃)</option>
                    </select>
                  </div>

                  {/* 17. 更新说明与流转备注 (跨列) */}
                  <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 space-y-1">
                    <label className="block font-medium text-slate-700">
                      更新说明与流转备注
                    </label>
                    <input
                      type="text"
                      value={activeFormData.remarks}
                      onChange={(e) => updateActiveFormData({ remarks: e.target.value })}
                      placeholder="输入代理律所协同反馈要点、审查进度、下发意见或跟进备注..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                <span>保存后将直接同步至【案件详情-基本信息】及业务台账14项官方协同字段</span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUpdateCaseInfoModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={isSubmittingUpdateCase || selectedUpdateCaseNos.length === 0}
                  onClick={handleOpenConfirmDialog}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingUpdateCase ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>同步落库中...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>确认更新案件信息 ({selectedUpdateCaseNos.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 二次确认弹框 */}
          {isUpdateCaseConfirmDialogOpen && selectedUpdateCaseNos.length > 0 && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
                {/* 头部 */}
                <div className="px-6 pt-5 pb-4 bg-slate-50/90 border-b border-slate-100 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900">
                      确认批量更新 {selectedUpdateCaseNos.length} 个商标案件的信息？
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      即将把协同编辑的各项官方数据直接同步落库至案件全局台账与案详情页。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUpdateCaseConfirmDialogOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 变更关键信息摘要预览 */}
                <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  <div className="text-[11px] font-semibold text-slate-500 tracking-wider">
                    本次即将同步更新的案件与变更预览 ({selectedUpdateCaseNos.length} 项)
                  </div>

                  <div className="space-y-2.5">
                    {selectedUpdateCaseNos.map((cNo) => {
                      const cItem = caseItems.find(c => c.caseNo === cNo);
                      const fData = updateCaseFormDataMap[cNo] || activeFormData;
                      return (
                        <div key={cNo} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/50">
                            <span className="font-mono font-bold text-blue-900">{cNo}</span>
                            <span className="font-semibold text-slate-800">{cItem?.trademarkName || '—'}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                            <div>
                              <span className="text-slate-400">官方申请号: </span>
                              <span className="font-mono font-semibold text-slate-800">{fData.applicationNo || '—'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">注册进度: </span>
                              <span className="font-semibold text-blue-700">{fData.latestProgress || '—'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">官方注册号: </span>
                              <span className="font-mono font-semibold text-slate-800">{fData.registrationNo || '—'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">代理律所: </span>
                              <span className="font-medium text-slate-800 truncate">{fData.agencyName || '—'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100/60 p-2.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>确认后将自动更新案件时间轴、基本信息及官方协同记录。</span>
                  </div>
                </div>

                {/* 底部操作区 */}
                <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsUpdateCaseConfirmDialogOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    返回修改
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingUpdateCase}
                    onClick={handleExecuteActualUpdate}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingUpdateCase ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>正在写入...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>确认并立即同步</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: 新增处理事项 (上半部分显示案件列表，下半部分显示新增处理事项，案件列表样式功能与更新案件信息完全一致) */}
      {/* ========================================================================= */}
      {isCreateHandlingTaskModalOpen && (() => {
        const targetSelectedCase = activeTaskCaseNo ? (caseItems.find(c => c.caseNo === activeTaskCaseNo) || null) : null;

        const activeFormData = (activeTaskCaseNo && taskFormDataMap[activeTaskCaseNo]) || {
          taskName: '',
          status: '',
          stage: '',
          undertaker: '',
          entrustDate: '',
          reviewScore: '',
          draftDeadline: '',
          internalDeadline: '',
          officialDeadline: '',
          searchDeadline: '',
          firstDraftDate: '',
          finalDraftDate: '',
          completionDate: '',
          searchDate: '',
          remarks: ''
        };

        const handleUpdateTaskField = (field: string, value: any) => {
          if (!activeTaskCaseNo) return;
          setTaskFormDataMap(prev => ({
            ...prev,
            [activeTaskCaseNo]: {
              ...(prev[activeTaskCaseNo] || getInitialTaskFormData(null, targetAgencyForTask)),
              [field]: value
            }
          }));
        };

        // 过滤案件列表（平铺单列视图，与更新案件信息完全一致）
        const filteredTaskCases = caseItems.filter(c => {
          if (!createTaskSearchText.trim()) return true;
          const q = createTaskSearchText.trim().toLowerCase();
          return (
            (c.trademarkName && c.trademarkName.toLowerCase().includes(q)) ||
            (c.caseNo && c.caseNo.toLowerCase().includes(q)) ||
            (c.proposalNo && c.proposalNo.toLowerCase().includes(q)) ||
            (c.brand && c.brand.toLowerCase().includes(q)) ||
            (c.applicant && c.applicant.toLowerCase().includes(q)) ||
            (c.classes && c.classes.toLowerCase().includes(q)) ||
            (c.jurisdiction && c.jurisdiction.toLowerCase().includes(q)) ||
            (c.applicationNo && c.applicationNo.toLowerCase().includes(q)) ||
            (c.registrationNo && c.registrationNo.toLowerCase().includes(q)) ||
            (c.agencyName && c.agencyName.toLowerCase().includes(q)) ||
            (c.status && c.status.toLowerCase().includes(q))
          );
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-7xl h-[95vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <form onSubmit={(e) => { e.preventDefault(); handleSaveHandlingTask(); }} className="flex-1 flex flex-col min-h-0">
                {/* Modal Header */}
                <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <ListTodo className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        新增处理事项
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        上区平铺单列展示全量案件列表并支持选择，下区维护新增处理事项的各项业务属性、时效期限与执行进度
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreateHandlingTaskModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body: 上下两个分区 (Top: 案件列表平铺单列视图; Bottom: 新增处理事项4大板块表单) */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/40">
                  
                  {/* ========================================================================= */}
                  {/* 上分区: 案件列表 (平铺单列视图，样式和功能跟【更新案件信息】页面案件列表完全一致) */}
                  {/* ========================================================================= */}
                  <div className="flex flex-col">
                    {/* 顶部工具条 */}
                    <div className="py-2.5 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-blue-600" />
                          <span>案件列表</span>
                        </span>
                        <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                          共 {filteredTaskCases.length} 个案件
                        </span>
                      </div>

                      {/* 搜索框 */}
                      <div className="flex items-center gap-2">
                        <div className="relative w-72">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={createTaskSearchText}
                            onChange={(e) => setCreateTaskSearchText(e.target.value)}
                            placeholder="搜索商标名 / 案号 / 品牌 / 申请号..."
                            className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                          />
                          {createTaskSearchText && (
                            <button
                              type="button"
                              onClick={() => setCreateTaskSearchText('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 平铺单列数据表格 (与更新案件信息列表完全一致) */}
                    <div className="overflow-x-auto max-h-[260px] overflow-y-auto border border-slate-200 rounded-lg bg-white shadow-2xs">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[12px] font-medium text-slate-500">
                          <tr>
                            <th className="py-2.5 px-3 text-center w-12">
                              <input
                                type="checkbox"
                                checked={filteredTaskCases.length > 0 && filteredTaskCases.every(c => selectedTaskCaseNos.includes(c.caseNo))}
                                onChange={() => handleToggleSelectAllTaskCases(filteredTaskCases)}
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer accent-blue-600"
                              />
                            </th>
                            <th className="py-2.5 px-4">商标名称</th>
                            <th className="py-2.5 px-4">商标形式</th>
                            <th className="py-2.5 px-4">案件编号</th>
                            <th className="py-2.5 px-4">建案编码</th>
                            <th className="py-2.5 px-4">品牌</th>
                            <th className="py-2.5 px-4">申请主体</th>
                            <th className="py-2.5 px-4">尼斯分类</th>
                            <th className="py-2.5 px-4">申请国家/地区</th>
                            <th className="py-2.5 px-4">商品项目摘要</th>
                            <th className="py-2.5 px-4">注册进度</th>
                            <th className="py-2.5 px-4 text-blue-700 font-bold">状态</th>
                            <th className="py-2.5 px-4">官方申请号</th>
                            <th className="py-2.5 px-4">代理律所</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {filteredTaskCases.length > 0 ? (
                            filteredTaskCases.map((item) => {
                              const isSelected = selectedTaskCaseNos.includes(item.caseNo);
                              const stage = item.timeline && item.timeline.length > 0 
                                ? item.timeline[item.timeline.length - 1].stage 
                                : (item.latestProgress || '官方审查阶段');

                              let goodsFullText = '';
                              if (Array.isArray(item.goodsList) && item.goodsList.length > 0) {
                                goodsFullText = item.goodsList.map((g: any) => typeof g === 'string' ? g : (g.cnName || g.name || String(g))).join('、');
                              } else if (Array.isArray(item.goodsItems) && item.goodsItems.length > 0) {
                                goodsFullText = item.goodsItems.map((g: any) => typeof g === 'string' ? g : (g.cnName || g.name || String(g))).join('、');
                              } else if (typeof item.goodsItems === 'string' && item.goodsItems.trim()) {
                                goodsFullText = item.goodsItems.trim();
                              }

                              if (typeof item.goodsItems === 'string' && item.goodsItems.length > goodsFullText.length) {
                                goodsFullText = item.goodsItems;
                              }
                              if (!goodsFullText) {
                                goodsFullText = '暂无商品项目数据';
                              }

                              return (
                                <tr 
                                  key={item.id || item.caseNo}
                                  onClick={() => handleToggleSelectCaseForTask(item.caseNo)}
                                  className={`cursor-pointer transition-colors group ${
                                    isSelected 
                                      ? 'bg-blue-50/70 font-medium' 
                                      : 'hover:bg-blue-50/30'
                                  }`}
                                >
                                  {/* 0. 多选框 */}
                                  <td 
                                    className="py-2.5 px-3 text-center" 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      handleToggleSelectCaseForTask(item.caseNo); 
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}}
                                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer accent-blue-600"
                                    />
                                  </td>

                                  {/* 1. 商标名称 */}
                                  <td className="py-2.5 px-4 font-bold text-slate-900 tracking-tight truncate max-w-[150px]" title={item.trademarkName}>
                                    {item.trademarkName}
                                  </td>

                                  {/* 2. 商标形式 */}
                                  <td className="py-2.5 px-4 truncate" title={item.trademarkForm || '文字'}>
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                      {item.trademarkForm || '文字'}
                                    </span>
                                  </td>

                                  {/* 3. 案件编号 */}
                                  <td className="py-2.5 px-4 font-mono font-medium truncate" title={item.caseNo}>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingCaseDetail(item);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1 font-medium transition-colors truncate"
                                      title="点击查看案件详情"
                                    >
                                      <span className="truncate">{item.caseNo}</span>
                                    </button>
                                  </td>

                                  {/* 4. 建案编码 */}
                                  <td className="py-2.5 px-4 font-mono truncate" title={item.proposalNo}>
                                    <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                                      {item.proposalNo || '—'}
                                    </span>
                                  </td>

                                  {/* 5. 品牌 */}
                                  <td className="py-2.5 px-4 text-slate-700 truncate" title={item.brand}>
                                    <span className="inline-flex items-center gap-1.5 truncate">
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        item.brand.includes('usmile') ? 'bg-blue-500' :
                                        item.brand.includes('KittyAnnie') ? 'bg-pink-500' :
                                        item.brand.includes('FHT') ? 'bg-amber-500' :
                                        item.brand.includes('aboval') ? 'bg-purple-500' : 'bg-emerald-500'
                                      }`} />
                                      <span className="truncate">{item.brand}</span>
                                    </span>
                                  </td>

                                  {/* 6. 申请主体 */}
                                  <td className="py-2.5 px-4 text-slate-700 truncate max-w-[180px]" title={item.applicant || '广州星际悦动股份有限公司'}>
                                    {item.applicant || '广州星际悦动股份有限公司'}
                                  </td>

                                  {/* 7. 商标类别 */}
                                  <td className="py-2.5 px-4 truncate" title={item.classes}>
                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80 font-mono text-[11px] font-medium truncate inline-block max-w-full">
                                      {item.classes}
                                    </span>
                                  </td>

                                  {/* 8. 国家/地区 */}
                                  <td className="py-2.5 px-4 text-slate-700 truncate" title={item.jurisdiction}>
                                    <span className="inline-flex items-center gap-1 truncate">
                                      <Globe2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span className="truncate">{item.jurisdiction}</span>
                                    </span>
                                  </td>

                                  {/* 9. 商品项目摘要 */}
                                  <td className="py-2.5 px-4 max-w-[200px] truncate text-slate-600" title={goodsFullText}>
                                    <span className="truncate block" title={goodsFullText}>
                                      {goodsFullText}
                                    </span>
                                  </td>

                                  {/* 10. 注册进度 */}
                                  <td className="py-2.5 px-4 font-medium text-slate-800 truncate" title={stage}>
                                    {stage}
                                  </td>

                                  {/* 11. 状态 */}
                                  <td className="py-2.5 px-4 truncate">
                                    {renderCaseStatusBadge(item.status)}
                                  </td>

                                  {/* 12. 官方申请号 */}
                                  <td className="py-2.5 px-4 font-mono text-slate-700 truncate" title={item.applicationNo || '—'}>
                                    {item.applicationNo || '—'}
                                  </td>

                                  {/* 13. 代理律所 */}
                                  <td className="py-2.5 px-4 text-slate-700 truncate" title={item.agencyName || '—'}>
                                    {item.agencyName || '—'}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={14} className="py-10 text-center text-slate-400">
                                <div className="flex flex-col items-center justify-center gap-1.5">
                                  <FileText className="w-7 h-7 text-slate-300 stroke-1" />
                                  <p className="text-xs">未找到符合搜索条件的案件</p>
                                  {createTaskSearchText && (
                                    <button
                                      type="button"
                                      onClick={() => setCreateTaskSearchText('')}
                                      className="text-xs text-blue-600 hover:underline cursor-pointer"
                                    >
                                      清除搜索条件
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* 下分区: 新增处理事项表单 (4大标准板块，与案件详情-处理事项完全一致) */}
                  {/* ========================================================================= */}
                  <div className="space-y-4 pt-1">
                    {/* 模块标题 */}
                    <div className="py-2 flex items-center justify-between gap-4 flex-wrap border-b border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <ListTodo className="w-4 h-4 text-blue-600" />
                          <span>处理事项字段维护</span>
                        </span>
                        {targetSelectedCase ? (
                          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                            当前目标案件：{targetSelectedCase.caseNo} ({targetSelectedCase.trademarkName})
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            请在上方列表中勾选目标案件
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        * 为所选案件配置处理事项、办理状态、承办人、时效期限及跟进说明
                      </span>
                    </div>

                    {/* 案件编号 Tab 切换栏 */}
                    {selectedTaskCaseNos.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar">
                        <span className="text-[11px] font-semibold text-slate-500 shrink-0 mr-1">
                          切换维护案件:
                        </span>
                        {selectedTaskCaseNos.map((cNo) => {
                          const cItem = caseItems.find(c => c.caseNo === cNo);
                          const isActive = cNo === activeTaskCaseNo;
                          return (
                            <button
                              key={cNo}
                              type="button"
                              onClick={() => setActiveTaskCaseNo(cNo)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                                isActive
                                  ? 'bg-blue-600 text-white font-bold shadow-xs ring-2 ring-blue-300'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <span className="font-mono">{cNo}</span>
                              {cItem && (
                                <span className={`text-[11px] truncate max-w-[120px] ${isActive ? 'text-blue-100 font-normal' : 'text-slate-500 font-normal'}`}>
                                  ({cItem.trademarkName})
                                </span>
                              )}
                              <X
                                className={`w-3.5 h-3.5 rounded-full p-0.5 hover:bg-black/20 ${isActive ? 'text-white' : 'text-slate-400'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSelectCaseForTask(cNo);
                                }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6 shadow-2xs">
                      {/* 板块 1：事项基本属性 */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                          <span>事项基本属性</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {/* 处理事项 */}
                          <div className="space-y-1 sm:col-span-2 md:col-span-1">
                            <label className="block text-xs font-medium text-slate-700">
                              处理事项 <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={activeFormData.taskName}
                                onChange={(e) => handleUpdateTaskField('taskName', e.target.value)}
                                className={`w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs font-medium ${
                                  !activeFormData.taskName ? 'text-slate-400 font-normal' : ''
                                }`}
                              >
                                <option value="" disabled className="text-slate-400">请选择处理事项</option>
                                {HANDLING_TASK_NAME_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt} className="text-slate-800 font-medium">{opt}</option>
                                ))}
                                {activeFormData.taskName && !HANDLING_TASK_NAME_OPTIONS.includes(activeFormData.taskName) && (
                                  <option value={activeFormData.taskName} className="text-slate-800 font-medium">{activeFormData.taskName}</option>
                                )}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          {/* 处理状态 */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">
                              处理状态 <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={activeFormData.status}
                                onChange={(e) => handleUpdateTaskField('status', e.target.value)}
                                className={`w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs font-medium ${
                                  !activeFormData.status ? 'text-slate-400 font-normal' : ''
                                }`}
                              >
                                <option value="" disabled className="text-slate-400">请选择处理状态</option>
                                {HANDLING_TASK_STATUS_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt} className="text-slate-800 font-medium">{opt}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          {/* 案件阶段 */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">
                              案件阶段 <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={activeFormData.stage}
                                onChange={(e) => handleUpdateTaskField('stage', e.target.value)}
                                className={`w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs font-medium ${
                                  !activeFormData.stage ? 'text-slate-400 font-normal' : ''
                                }`}
                              >
                                <option value="" disabled className="text-slate-400">请选择案件阶段</option>
                                {HANDLING_TASK_STAGE_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt} className="text-slate-800 font-medium">{opt}</option>
                                ))}
                                {activeFormData.stage && !HANDLING_TASK_STAGE_OPTIONS.includes(activeFormData.stage) && (
                                  <option value={activeFormData.stage} className="text-slate-800 font-medium">{activeFormData.stage}</option>
                                )}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          {/* 承办人 / 处理人 */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">承办人 / 处理人</label>
                            <input
                              type="text"
                              placeholder="请输入处理人姓名"
                              value={activeFormData.undertaker}
                              onChange={(e) => handleUpdateTaskField('undertaker', e.target.value)}
                              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                            />
                          </div>

                          {/* 委案日期 */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">委案日期</label>
                            <input
                              type="date"
                              value={activeFormData.entrustDate}
                              onChange={(e) => handleUpdateTaskField('entrustDate', e.target.value)}
                              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>

                          {/* 核稿分值 */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">核稿分值</label>
                            <input
                              type="text"
                              placeholder="例如：95分、100、A+"
                              value={activeFormData.reviewScore}
                              onChange={(e) => handleUpdateTaskField('reviewScore', e.target.value)}
                              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 板块 2：关键期限控制 */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                          <span>关键期限与时效控制</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {/* 初稿期限 */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">初稿期限</label>
                            <input
                              type="date"
                              value={activeFormData.draftDeadline}
                              onChange={(e) => handleUpdateTaskField('draftDeadline', e.target.value)}
                              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>

                          {/* 内部期限 */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">内部期限</label>
                            <input
                              type="date"
                              value={activeFormData.internalDeadline}
                              onChange={(e) => handleUpdateTaskField('internalDeadline', e.target.value)}
                              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>

                          {/* 官方期限 */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">官方期限</label>
                            <input
                              type="date"
                              value={activeFormData.officialDeadline}
                              onChange={(e) => handleUpdateTaskField('officialDeadline', e.target.value)}
                              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>

                          {/* 检索期限 */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">检索期限</label>
                            <input
                              type="date"
                              value={activeFormData.searchDeadline}
                              onChange={(e) => handleUpdateTaskField('searchDeadline', e.target.value)}
                              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 板块 3：执行进度与节点记录 */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                          <span>执行进度与节点记录</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {/* 初稿日 */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">初稿日</label>
                            <input
                              type="date"
                              value={activeFormData.firstDraftDate}
                              onChange={(e) => handleUpdateTaskField('firstDraftDate', e.target.value)}
                              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>

                          {/* 定稿日 */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">定稿日</label>
                            <input
                              type="date"
                              value={activeFormData.finalDraftDate}
                              onChange={(e) => handleUpdateTaskField('finalDraftDate', e.target.value)}
                              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>

                          {/* 完成日 */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">完成日</label>
                            <input
                              type="date"
                              value={activeFormData.completionDate}
                              onChange={(e) => handleUpdateTaskField('completionDate', e.target.value)}
                              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>

                          {/* 检索日 */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">检索日</label>
                            <input
                              type="date"
                              value={activeFormData.searchDate}
                              onChange={(e) => handleUpdateTaskField('searchDate', e.target.value)}
                              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 板块 4：备注说明 */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                          <span>备注说明与跟进记录</span>
                        </h4>

                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-slate-700">备注</label>
                          <textarea
                            rows={3}
                            placeholder="请填写处理进展、跟进策略、官方下文或核稿备注说明..."
                            value={activeFormData.remarks}
                            onChange={(e) => handleUpdateTaskField('remarks', e.target.value)}
                            className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 leading-relaxed focus:outline-none focus:border-blue-500 resize-none shadow-2xs font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 弹窗底部操作按钮组 */}
                <div className="px-6 py-3.5 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    保存后将自动同步至案件流程管理台账与时效监测监控中
                  </span>
                  <div className="flex items-center gap-2.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => setIsCreateHandlingTaskModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>保存处理事项</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: 代理机构协同详情弹窗 (点击表格行或详情按钮触发) */}
      {/* ========================================================================= */}
      {selectedAgencyForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedAgencyForDetail.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedAgencyForDetail.country} • {selectedAgencyForDetail.tier === 'STRATEGIC' ? '战略合作律所' : '优选合作律所'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAgencyForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[11px]">主要对接联系人</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{selectedAgencyForDetail.contactPerson}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">业务对接邮箱</span>
                  <span className="font-mono text-slate-800 mt-0.5 block truncate">{selectedAgencyForDetail.contactEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">在办商标案件</span>
                  <span className="font-mono font-bold text-blue-700 text-sm mt-0.5 block">{selectedAgencyForDetail.activeCasesCount} 件</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">综合协同评分</span>
                  <span className="font-bold text-amber-600 text-sm mt-0.5 block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {selectedAgencyForDetail.score.toFixed(1)} / 5.0
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">平均响应时效</span>
                  <span className="font-mono font-semibold text-slate-900 mt-0.5 block">{selectedAgencyForDetail.avgResponseHours} 小时</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">审核与核准通过率</span>
                  <span className="font-mono font-semibold text-emerald-700 mt-0.5 block">{selectedAgencyForDetail.passRate}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">专业擅长领域与业务范围：</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgencyForDetail.specialties.map((item, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedAgencyForDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                关闭
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetAg = selectedAgencyForDetail;
                  setSelectedAgencyForDetail(null);
                  setTargetAgencyForTask(targetAg);
                  setSelectedTaskCaseNos([]);
                  setActiveTaskCaseNo('');
                  setTaskFormDataMap({});
                  setCreateTaskSearchText('');
                  setIsCreateHandlingTaskModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>为此机构新增处理事项</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. 弹窗: 【批量更新案件】弹窗 (样式与批量导入商标案件数据完全一致) */}
      {/* ======================================================== */}
      {isBatchUpdateCasesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200/90 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header (Fixed at top) */}
            <div className="flex items-center justify-between px-6 py-4 sm:px-7 sm:py-4.5 border-b border-slate-100 shrink-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">批量更新商标案件数据</h3>
                  <p className="text-xs text-slate-500">上传标准 CSV/Excel 格式文件批量覆盖更新已有案件状态属性</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBatchUpdateCasesModalOpen(false);
                  setBatchUpdateCasesFile(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-7 sm:py-6 space-y-4 text-xs">
              {/* Step 1: 下载模板 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">1</span>
                    <span className="font-bold text-slate-800 text-xs">下载标准更新模板</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadUpdateCasesTemplate}
                    className="px-3.5 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>下载更新模板 (.csv)</span>
                  </button>
                </div>
                <p className="text-slate-500 leading-relaxed pl-7">
                  请先下载系统格式化的更新 CSV 模板，参照格式保留并填写要覆盖更新的【案件编号】（必填匹配主键）、【官方申请号/申请日】、【官方注册号/注册日】、【最新注册进度】、【申报/答复截止日】、【初审/注册公告期号及日期】、【国际注册信息】、【权利有效期限】、【协同代理律所】、【更新后案件状态】及【更新说明与流转备注】等官方协同字段。
                </p>
              </div>

              {/* Step 2: 上传文件 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">2</span>
                  <span className="font-bold text-slate-800 text-xs">上传填写完成的模板文件</span>
                </div>

                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-5 text-center bg-white transition-all group cursor-pointer">
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setBatchUpdateCasesFile(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="space-y-1.5 pointer-events-none">
                    <FileSpreadsheet className="w-8 h-8 text-blue-500 mx-auto group-hover:scale-110 transition-transform" />
                    {batchUpdateCasesFile ? (
                      <div>
                        <p className="font-bold text-blue-700">{batchUpdateCasesFile.name}</p>
                        <p className="text-[11px] text-slate-400">({(batchUpdateCasesFile.size / 1024).toFixed(1)} KB) 已选中，点击下方按钮确认导入</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-slate-700">点击选择或将 CSV/Excel 文件拖拽至此处</p>
                        <p className="text-[11px] text-slate-400">支持 .csv, .xlsx, .xls 格式</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer (Fixed at bottom) */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 sm:px-7 sm:py-4 border-t border-slate-100 shrink-0 bg-slate-50/70 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setIsBatchUpdateCasesModalOpen(false);
                  setBatchUpdateCasesFile(null);
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchUpdateCases}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>确认导入</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. 弹窗: 【批量新增处理事项】弹窗 (样式与批量导入商标案件数据完全一致) */}
      {/* ======================================================== */}
      {isBatchAddTasksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200/90 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header (Fixed at top, does not scroll) */}
            <div className="flex items-center justify-between px-6 py-4 sm:px-7 sm:py-4.5 border-b border-slate-100 shrink-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">批量导入处理事项数据</h3>
                  <p className="text-xs text-slate-500">上传标准 CSV/Excel 格式文件批量新增或关联案件的协同处理事项</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBatchAddTasksModalOpen(false);
                  setBatchAddTasksFile(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable content) */}
            <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-7 sm:py-6 space-y-4 text-xs">
              {/* Step 1: 下载模板 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">1</span>
                    <span className="font-bold text-slate-800 text-xs">下载标准处理事项模板（含填写说明与样例）</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadAddTasksTemplate}
                    className="px-3.5 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>下载处理事项模板 (.csv)</span>
                  </button>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  请先下载系统格式化的新增处理事项 CSV 模板。模板已预置 <strong className="text-slate-800">16 项标准表头</strong>、<strong className="text-slate-800">系统下拉选项填写说明</strong> 及 <strong className="text-slate-800">1 行真实完整样例数据</strong>。
                </p>

                {/* 模板表头及系统选项说明卡片 */}
                <div className="ml-7 p-3 rounded-lg bg-white border border-slate-200/90 space-y-2 text-[11px]">
                  <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    <span>模板字段构成与选项说明（共 16 项）：</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                    <div className="space-y-1">
                      <p><strong className="text-slate-800 font-mono">1. 案件编号:</strong> 必填（系统主键匹配，如 TM2026001）</p>
                      <p><strong className="text-slate-800 font-mono">2. 处理事项:</strong> 必填（系统16项选项，如 商标注册申请/驳回复审申请/异议答辩等）</p>
                      <p><strong className="text-slate-800 font-mono">3. 处理状态:</strong> 必填（待处理 / 处理中 / 待审核 / 待递交 / 已完成 / 暂停 / 已终止）</p>
                      <p><strong className="text-slate-800 font-mono">4. 案件阶段:</strong> 必填（准备递交 / 申请受理 / 实质审查 / 初审公告 / 异议复审等9个阶段）</p>
                      <p><strong className="text-slate-800 font-mono">5. 承办人 / 处理人:</strong> 选填（代理律所或内部负责人）</p>
                      <p><strong className="text-slate-800 font-mono">6. 委案日期:</strong> 选填（日期格式: YYYY-MM-DD）</p>
                      <p><strong className="text-slate-800 font-mono">7. 核稿分值:</strong> 选填（如 95分、100、A+）</p>
                      <p><strong className="text-slate-800 font-mono">8. 初稿期限:</strong> 选填（日期格式: YYYY-MM-DD）</p>
                    </div>
                    <div className="space-y-1">
                      <p><strong className="text-slate-800 font-mono">9. 内部期限:</strong> 选填（日期格式: YYYY-MM-DD）</p>
                      <p><strong className="text-slate-800 font-mono">10. 官方期限:</strong> 选填（日期格式: YYYY-MM-DD）</p>
                      <p><strong className="text-slate-800 font-mono">11. 检索期限:</strong> 选填（日期格式: YYYY-MM-DD）</p>
                      <p><strong className="text-slate-800 font-mono">12. 初稿日:</strong> 选填（日期格式: YYYY-MM-DD）</p>
                      <p><strong className="text-slate-800 font-mono">13. 定稿日:</strong> 选填（日期格式: YYYY-MM-DD）</p>
                      <p><strong className="text-slate-800 font-mono">14. 完成日:</strong> 选填（日期格式: YYYY-MM-DD）</p>
                      <p><strong className="text-slate-800 font-mono">15. 检索日:</strong> 选填（日期格式: YYYY-MM-DD）</p>
                      <p><strong className="text-slate-800 font-mono">16. 备注:</strong> 选填（处理进展、官方下文或核稿备注）</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: 上传文件 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">2</span>
                  <span className="font-bold text-slate-800 text-xs">上传填写完成的模板文件</span>
                </div>

                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-5 text-center bg-white transition-all group cursor-pointer">
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setBatchAddTasksFile(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="space-y-1.5 pointer-events-none">
                    <FileSpreadsheet className="w-8 h-8 text-blue-500 mx-auto group-hover:scale-110 transition-transform" />
                    {batchAddTasksFile ? (
                      <div>
                        <p className="font-bold text-blue-700">{batchAddTasksFile.name}</p>
                        <p className="text-[11px] text-slate-400">({(batchAddTasksFile.size / 1024).toFixed(1)} KB) 已选中，点击下方按钮确认导入</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-slate-700">点击选择或将 CSV/Excel 文件拖拽至此处</p>
                        <p className="text-[11px] text-slate-400">支持 .csv, .xlsx, .xls 格式</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer (Fixed at bottom) */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 sm:px-7 sm:py-4 border-t border-slate-100 shrink-0 bg-slate-50/70 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setIsBatchAddTasksModalOpen(false);
                  setBatchAddTasksFile(null);
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchAddTasks}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>确认导入</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 案件详情弹窗 (当在【更新案件信息】或【选择关联案件】弹窗中点击案件编号时触发，完全复用【案件管理】页面的案件详情 Modal) */}
      {/* ========================================================================= */}
      {viewingCaseDetail && (
        <div className="relative z-[70]">
          <PortfolioLedger
            caseItems={caseItems}
            initialSelectedCase={viewingCaseDetail}
            onlyModal={true}
            readOnly={true}
            onCloseCaseDetail={() => setViewingCaseDetail(null)}
            onUpdateCase={(updatedCase) => {
              if (onUpdateCase) {
                onUpdateCase(updatedCase);
              }
              setViewingCaseDetail(updatedCase);
            }}
          />
        </div>
      )}
    </div>
  );
};