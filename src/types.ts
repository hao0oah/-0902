export type NavigationTab = 
  | 'dashboard' 
  | 'brand-tree'
  | 'applications' 
  | 'portfolio' 
  | 'enforcement' 
  | 'monitoring' 
  | 'agencies' 
  | 'approvals' 
  | 'nice-tool' 
  | 'settings';

export type SystemSettingsSubTab = 
  | 'COUNTRY_REGION_MAPPING'
  | 'APPLICANT_MAPPING'
  | 'AGENCY_MAPPING'
  | 'TRADEMARK_STAKEHOLDERS'
  | 'NICE_CLASSIFICATION_MAPPING';

export type TrademarkStatus = 
  | 'REGISTERED'       // 已注册 / 有效
  | 'EXAMINING'        // 审查中 / 初审
  | 'GAZETTE_PENDING'  // 初审公告期 (异议期)
  | 'OPPOSED'          // 被异议
  | 'RENEWAL_DUE'      // 待续展 / 临期
  | 'DRAFT'            // 草稿
  | 'INVALIDATED'      // 已失效 / 驳回
  | 'REJECT_REVIEW';   // 驳回复审中

export type Jurisdiction = 'CN' | 'US' | 'EU' | 'JP' | 'KR' | 'SG' | 'TH' | 'VN' | 'ID' | 'MY' | 'GLOBAL';

export interface TrademarkItem {
  id: string;
  regNumber: string;         // 申请号/注册号
  name: string;              // 商标名称
  englishName?: string;
  logoUrl?: string;          // 商标图样
  classes: number[];         // 尼斯分类 1-45
  goodsItems: string[];      // 商品/服务项目
  applicant: string;         // 申请人主体
  jurisdiction: Jurisdiction;
  status: TrademarkStatus;
  applyDate: string;         // 申请日期
  regDate?: string;          // 注册日期
  validUntil?: string;       // 专用权期限止
  agency: string;            // 代理机构
  isCore: boolean;           // 是否核心保护商标
  similarityRisk?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  oppositionDeadline?: string; // 异议截止期
  renewalDeadline?: string;    // 续展截止期
  milestones: {
    stage: string;
    date: string;
    description: string;
    done: boolean;
  }[];
}

export interface ApprovalRecordItem {
  id: string;
  stepNumber: number;          // 序号 (1, 2, 3...)
  nodeName: string;            // 节点名称，如 '提交建案需求', '需求部门主管复核', '知产法务查重评估', '知产总监终审'
  approverName: string;        // 审批人姓名，如 '陆燕丽', '唐宁', '林悦', '张伟'
  approverRole?: string;       // 审批人角色/职务，如 '申请人', '部门主管', '知产法务主管', '知产总监'
  approverDept?: string;       // 审批人部门，如 '研发中心', '品牌中心', '集团法务中心'
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'ACCEPTED';
  actionText: string;          // 操作，如 '提交建案', '审核通过', '审核驳回', '处理中', '已接单'
  opinion?: string;            // 审批意见/签署意见
  operateTime?: string;        // 办理时间，如 '2026-08-21 09:15:22'
  dwellTime?: string;          // 节点停留时长
  isCurrent?: boolean;         // 是否当前处于该节点
}

export interface TrademarkApplicationProposal {
  id: string;
  proposalNo: string;        // 提案编号，如 SB20260814001
  trademarkName: string;     // 商标名称，如 hh, P3 PRO
  brand: string;             // 品牌，如 usmile笑容加, KittyAnnie小猫安妮, FHT新燕, aboval阿茂, kissday亲天
  classes: string;           // 尼斯分类，如 第03类、第21类
  similarGroups?: string;    // 类似群组，如 0307、2114
  goodsServices?: string;    // 商品/服务项目，如 电动牙刷、冲牙器、牙膏
  importanceLevel: '一级' | '二级' | '三级'; // 重要等级
  applicationType: '一般' | '集体' | '证明' | '特殊'; // 申请类型
  region?: string;           // 申请地区（大区），如 大中华地区, 东亚, 欧洲, 北美洲
  country?: string;          // 申请国家，如 中国香港, 日本, 德国-欧盟, 美国
  jurisdiction: string;      // 兼容字段 (国家/地区)，如 中国, 欧盟、英国, 新加坡、马来西亚
  trademarkForm: '文字' | '图形' | '组合' | '声音' | '3D立体'; // 商标形式
  department: string;        // 需求部门，如 品牌中心, 产品事业部, 欧洲业务部, 创新业务部
  applicant: string;         // 申请人，如 陆燕丽, 唐宁, 袁飞, 陈旻, 李沐
  applyTime: string;         // 申请时间，如 2026-08-14 12:54
  status: 'UNSUBMITTED' | 'PROCESSING' | 'PENDING_CONFIRM' | 'PENDING_PROPOSAL' | 'PENDING_AGENCY' | 'ACCEPTED' | 'TERMINATED';
  currentNode?: string;      // 当前节点，如 '未提交（草稿）', '法务查重评估', '业务方确认'
  currentHandler?: string;   // 当前处理人，如 '陆燕丽 (法务)', '唐宁 (业务)'
  dwellTime?: string;        // 停留时长，如 '2天4小时', '5小时'
  isOverdue?: boolean;       // 是否超时预警
  description?: string;
  agencyName?: string;
  logoUrl?: string;

  // 图片表单拓展字段
  proposalType?: string;          // 提案类型 (商标, 专利, 版权)
  trademarkGrade?: string;        // 商标等级
  is3dTrademark?: string;         // 是否三维商标 (是, 否)
  colorForm?: string;             // 颜色形式 (黑白, 彩色, 带有颜色声明)
  businessType?: string;          // 业务类型 (国内注册, 海外注册, 变更/续展)
  intendedUseDate?: string;       // 拟使用时间
  trademarkSource?: string;       // 商标来源
  isDesignedColorUsed?: string;   // 是否使用被设计的颜色
  isSimilarTrademarkRegistered?: string; // 是否同一注册近似商标
  agencyType?: string;            // 委外类型
  techCategory?: string;          // 技术分类及检索范围
  productDomain?: string;         // 产品领域
  approvalRecords?: ApprovalRecordItem[]; // 完整顺序审批履历/记录
}

export interface ApplicationDraft {
  id: string;
  draftNo: string;
  trademarkName: string;
  trademarkType: 'TEXT' | 'IMAGE' | 'COMBINED' | 'SOUND';
  classes: number[];
  goodsItems: string[];
  jurisdictions: Jurisdiction[];
  applicant: string;
  estimatedFee: number;
  agencyId: string;
  status: 'DRAFT' | 'SUBMITTED_APPROVAL' | 'APPROVED' | 'FILING' | 'REJECTED';
  createTime: string;
  creator: string;
  designBrief?: string;
  priorityClaim?: boolean;
}

export type EnforcementCaseType = 'REFUSAL_REVIEW' | 'OPPOSITION' | 'INVALIDATION' | 'NON_USE_REVOCATION' | 'DEFENSE' | 'STANDARDS' | 'LITIGATION' | 'CUSTOMS';

export interface EnforcementCase {
  id: string;
  caseNo: string;
  type: EnforcementCaseType;
  targetTrademark: string;
  targetRegNo: string;
  targetApplicant: string;
  ourTrademark: string;
  classes: number[];
  jurisdiction: Jurisdiction;
  riskLevel: 'HIGH' | 'MEDIUM' | 'CRITICAL' | 'LOW';
  status: 'PENDING_START' | 'EVIDENCE_PREP' | 'SUBMITTED' | 'UNDER_HEARING' | 'WIN' | 'LOST' | 'SETTLED' | string;
  handler: string;
  lawFirm: string;
  filingDeadline: string;
  budget: number;
  groundsSummary: string;
  progressPercent: number;

  // 维权详情拓展字段 (发起商标维权与异议立案完整表单)
  department?: string;
  name?: string;
  businessType?: string;
  proposalDepartment?: string;
  undertakingDepartment?: string;  // 承办部门
  undertaker?: string;             // 承办人
  outsourcingType?: string;        // 委外类型
  agencyCaseNo?: string;           // 代理机构案号
  entrustmentDate?: string;        // 委案日期
  agencyRemarks?: string;          // 对代理机构备注
  fileOpeningDate?: string;        // 开卷日期
  submissionMethod?: string;       // 递交方式
  caseStatusText?: string;         // 案件状态说明/文本
  deadline?: string;               // 截止日期/处理期限
  processingDeadline?: string;     // 处理期限
  submissionDate?: string;         // 递交日期
  rulingDate?: string;             // 裁文日期
  proposalAdvice?: string;
  remarks?: string;
  goodsAndServices?: string;
  applicationDate?: string;
  applicantAddress?: string;
  registrationDate?: string;
  preliminaryNoticePeriod?: string;
  country?: string;
  expiryDate?: string;
  citedTrademarkClass?: string[];
  trademarkImages?: string[];
  agencyName?: string;
  agencyContact?: string;
  agencyPhone?: string;
  requesterName?: string;
  requesterAddress?: string;
  requesterPostcode?: string;
  requesterPhone?: string;
  requesterContact?: string;
  brand?: string;
  attachments?: { name: string; size: string }[];
  currentNode?: string;
  currentHandler?: string;
  dwellTime?: string;
}

export interface MonitoringAlert {
  id: string;
  suspectName: string;
  suspectRegNo: string;
  suspectApplicant: string;
  suspectClass: number;
  gazetteNumber: string;
  gazetteDate: string;
  oppositionDeadline: string;
  daysRemaining: number;
  matchedOurTrademark: string;
  similarityScore: number; // 0 - 100
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'OPPOSITION_PROPOSED' | 'IGNORED' | 'OPPOSED';
  similarityReason: string;

  // 拓展新增监测表单字段
  suspectImage?: string;           // 涉嫌侵权商标图片
  logoUrl?: string;                // 商标图样
  logoUrls?: string[];             // 多张商标图样
  applyDate?: string;              // 申请日
  similarGroupAndGoods?: string;   // 类似群及商品
  registrationDate?: string;       // 注册公告日
  priorRights?: string;            // 在先权利
  proposalAdvice?: string;         // 处理建议及决策
  supportProbability?: string;     // 获支持概率
  considerationFactors?: string;   // 建议考虑因素
  submissionDate?: string;         // 递交日
  completionDate?: string;         // 完成/预计完成日
  processingDecision?: string;     // 处理决定
  remarks?: string;                // 备注
}

export interface AgencyPartner {
  id: string;
  name: string;
  country: string;
  tier: 'STRATEGIC' | 'PREFERRED' | 'STANDARD';
  score: number;        // 4.8 / 5.0
  activeCasesCount: number;
  completedCasesCount: number;
  avgResponseHours: number;
  passRate: number;      // 97.5%
  contactPerson: string;
  contactEmail: string;
  specialties: string[];
  billingGrade: '¥¥' | '¥¥¥' | '¥¥¥¥';
}

export interface ApprovalWorkflow {
  id: string;
  title: string;
  type: 'NEW_APPLICATION' | 'OPPOSITION_FILING' | 'ABANDON_RENEWAL' | 'BUDGET_APPLY' | 'NEW_BRAND_CREATION';
  initiator: {
    name: string;
    dept: string;
    avatar: string;
  };
  createTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CC';
  amount?: number;
  currentStep: number;
  brandProposalId?: string;
  steps: {
    role: string;
    userName: string;
    status: 'APPROVED' | 'CURRENT' | 'WAITING' | 'REJECTED';
    comment?: string;
    timestamp?: string;
  }[];
  details: Record<string, string | number | string[]>;
}

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
  phone: string;
  role: 'IP_ADMIN' | 'LEGAL_DIRECTOR' | 'BRAND_MANAGER' | 'GUEST';
  feishuLinked: boolean;
}

export type CaseManagementStatus = 'PENDING_APPLY' | 'APPLYING' | 'EXAMINING' | 'REGISTERED' | 'PENDING_REPLY' | 'INVALID';

export interface CaseTimelineMilestone {
  stage: string;
  date: string;
  description: string;
  status: 'COMPLETED' | 'CURRENT' | 'WAITING';
}

export type DocumentCategory = '企业文件' | '递交文件' | '官方文件' | '事务所文件' | '其他文件';

export interface CaseOfficialDocument {
  id: string;
  title: string;
  type: string;
  docNumber: string;
  issueDate: string;
  size: string;
  category?: DocumentCategory | string;
  uploader?: string;
  remarks?: string;
  fileUrl?: string;
  fileBlob?: Blob;
}

export interface CaseCommunication {
  id: string;
  sender: string;
  receiver: string;
  title: string;
  date: string;
  type: 'MAIL' | 'LETTER' | 'OFFICIAL' | 'INVOICE';
  summary: string;
  hasAttachment?: boolean;
  attachmentName?: string;
}

export interface RelatedCase {
  id: string;
  caseNo: string;
  proposalNo?: string;
  relationType: string;
  trademarkName: string;
  jurisdiction: string;
  classes: string;
  status: CaseManagementStatus;
  applyDate?: string;
}

export interface CaseEvidence {
  id: string;
  title: string;
  evidenceType: string;
  market: string;
  uploadDate: string;
  fileSize: string;
  status: 'VERIFIED' | 'PENDING' | 'EXPIRED';
  proofUrl?: string;
  type?: string;
  docNumber?: string;
  uploader?: string;
  remarks?: string;
  fileUrl?: string;
  fileBlob?: Blob;
}

export interface HandlingTask {
  id: string;
  seq?: number;
  taskName: string;          // 处理事项
  status?: string;           // 处理状态 (如：待处理、处理中、待审核、已完成)
  stage: string;             // 案件阶段 (如：实质审查阶段)
  handler?: string;          // 处理人
  undertaker: string;        // 承办人/处理人
  entrustDate?: string;      // 委案日期
  draftDeadline?: string;    // 初稿期限
  internalDeadline: string;  // 内部期限
  officialDeadline: string;  // 官方期限
  firstDraftDate?: string;   // 初稿日
  finalDraftDate?: string;   // 定稿日
  completionDate: string;    // 完成日
  reviewScore?: string | number; // 核稿分值
  searchDeadline?: string;   // 检索期限
  searchDate?: string;       // 检索日
  agency?: string;           // 代理机构
  agent?: string;            // 代理人
  remarks: string;           // 备注
}

export interface CaseApplicantInfo {
  id: string;
  seq: number;
  name: string;           // 名称
  nameEn: string;         // 英文名
  address: string;        // 申请人地址
  addressEn?: string;     // 申请人英文地址
}

export interface CaseApplicantHistoryItem {
  id: string;
  seq: number;
  changeType: string;      // 变更事项（如：申请人名称变更、申请人地址变更、申请人名称及地址变更等）
  beforeValue: string;     // 变更前内容
  afterValue: string;      // 变更后内容
  changer?: string;        // 变更人（如：陆燕丽、系统自动、管理员等）
  changeDate: string;      // 变更日期
}

export interface CaseOperationLog {
  id: string;
  seq?: number;
  operationType: string;      // 操作类型（如：建案立案、修改基本信息、变更申请人主体、新增处理事项、更新处理事项、删除处理事项、上传电子文书、删除电子文书、上传使用证据、删除使用证据、修改商品项目、变更代理人、更新案件状态等）
  module: string;             // 所属模块（如：基本信息、申请信息、商品服务、处理事项、文件列表、使用证据、流程状态等）
  operator: string;           // 操作人（如：张锦程、陆燕丽、李沐、系统自动）
  operatorRole?: string;      // 操作人角色（如：知产合规主管、商标代理人、知产法务专员、系统自动）
  department?: string;        // 所属部门（如：品牌知产保护中心、法务合规部、代理事务所）
  operateTime: string;        // 操作时间（如：2026-08-25 14:32:10）
  changeSummary: string;      // 操作内容与变更说明
  beforeValue?: string;       // 修改前内容
  afterValue?: string;        // 修改后内容
  ipAddress?: string;         // 操作来源IP
  remarks?: string;           // 备注信息
}

export interface CaseOpposedPartyInfo {
  id: string;
  seq: number;
  name: string;           // 名称
  nameEn: string;         // 英文名
  address: string;        // 地址
  agency?: string;        // 代理机构
}

export interface CasePriorityInfo {
  id: string;
  seq: number;
  country: string;        // 优先权国家/地区
  applicationNo: string;  // 优先权号
  applicationDate: string;// 优先权日
  dasCode?: string;       // 接入码
  priorityType?: string;  // 优先权类型
  status?: string;        // 状态
}

export interface CaseAgentInfo {
  id: string;
  seq: number;
  agency?: string;        // 代理机构
  agentName: string;      // 代理人姓名
  phone: string;          // 联系电话
  email?: string;         // 邮箱
  licenseNo?: string;     // 执业证书
  documentStatus?: string;// 委托书状态
}

export interface CaseLeaderInfo {
  id: string;
  seq: number;
  roleType?: string;       // 负责人类型
  name: string;           // 姓名
  department?: string;     // 部门
  phone: string;          // 联系电话
  email?: string;         // E-mail
  remarks?: string;       // 备注
}

export interface ApplicantChangeHistory {
  id: string;
  changeType: string;     // 变更事项
  beforeValue: string;    // 变更前内容
  afterValue: string;     // 变更后内容
  changeDate: string;     // 变更日期
  documentName?: string;  // 官方核查文书
}

export interface CaseManagementItem {
  id: string;
  caseNo: string;            // 案件编号，如 TM20260813004
  proposalNo: string;        // 建案编码，如 SB20260813004
  trademarkName: string;     // 商标名称，如 SMART ORAL LAB
  brand: string;             // 品牌，如 kissday亲天, usmile笑容加, etc.
  classes: string;           // 尼斯分类，如 第10类、第42类
  similarGroups?: string;    // 类似群组，如 1001、4209
  goodsServices?: string;    // 商品/服务，如 牙科设备和仪器、医用冲牙器
  region?: string;           // 申请地区（大区），如 大中华地区, 东南亚, 欧洲
  country?: string;          // 申请国家，如 新加坡, 日本, 德国-欧盟
  jurisdiction: string;      // 国家/地区兼容字段，如 新加坡、马来西亚
  goodsItems: string;        // 商品项目，如 牙科设备和仪器、医用冲牙器、口腔治疗仪器、...
  status: CaseManagementStatus; // 状态：'待申请' | '申请中' | '审查中' | '已注册' | '已失效'
  applyTime: string;         // 接单生成时间
  applicant: string;         // 申请人主体
  applicationNo?: string;    // 官方申请号
  applyDate?: string;        // 官方申请日
  registrationNo?: string;   // 官方注册号
  registrationDate?: string; // 官方注册日
  validUntil?: string;       // 专用权有效期止
  agencyName?: string;       // 代理律所
  officialAgency?: string;   // 知识产权主管局
  lawFirm?: string;          // 代理律所别名/兼容
  appNo?: string;            // 申请号别名/兼容
  regNo?: string;            // 注册号别名/兼容
  proposalClasses?: string;  // 提案类别别名/兼容
  filingDeadline?: string;   // 申报截止日
  importanceLevel?: string;  // 重要等级
  trademarkForm?: string;    // 商标形式
  proposalType?: string;     // 提案类型
  trademarkGrade?: string;   // 商标等级
  colorForm?: string;        // 颜色形式
  businessType?: string;     // 业务类型
  intendedUseDate?: string;  // 拟使用时间
  techCategory?: string;     // 技术类别及检索范围
  productDomain?: string;    // 产品领域
  department?: string;       // 需求部门
  description?: string;      // 需求背景与用途简述
  initialIssueNo?: string;        // 初审公告期号
  initialIssueDate?: string;      // 初审公告日
  firstNoticeIssue?: string;      // 初审公告期号别名
  firstNoticeDate?: string;       // 初审公告日别名
  regIssueDate?: string;          // 注册公告日
  regIssueNo?: string;            // 注册公告期号
  regNoticeIssue?: string;        // 注册公告期号别名
  regNoticeDate?: string;         // 注册公告日别名
  intlRegNo?: string;             // 国际注册号
  intlRegDate?: string;           // 国际注册日
  renewalStartDate?: string;      // 续展起始日
  rightsEndDate?: string;         // 权利终止日
  applicantEntity?: string;       // 申请人主体别名
  applicantEn?: string;           // 申请人英文
  applicantAddress?: string;     // 申请人地址
  applicantAddressEn?: string;   // 申请人地址英文
  agentName?: string;             // 代理人
  entrustDate?: string;           // 委案日期别名
  agencyEntrustDate?: string;     // 委案日期
  agencyDocketNo?: string;        // 代理机构案卷号
  priorityClaim?: string;         // 优先权
  priorityCountry?: string;       // 申请/展出国家
  latestProgress?: string;        // 最新注册进度
  latestRegistrationProgress?: string; // 最新注册进度别名
  deadlineDate?: string;          // 申报/答复截止日别名
  goodsList?: string[];      // 结构化商品清单列表
  timeline: CaseTimelineMilestone[]; // 注册进度历程
  documents: CaseOfficialDocument[];  // 电子文书与发文
  handlingTasks?: HandlingTask[];       // 处理事项
  applicants?: CaseApplicantInfo[];     // 申请人信息
  changeRecords?: ApplicantChangeHistory[]; // 变更记录
  communications?: CaseCommunication[]; // 往来信息
  relatedCases?: RelatedCase[];         // 相关案件
  evidences?: CaseEvidence[];           // 使用证据
  operationLogs?: CaseOperationLog[];   // 案件信息操作记录
}

export type BrandLevel = 
  | 'GROUP'          // 集团母品牌
  | 'CORE_BRAND'    // 核心主品牌
  | 'SUB_BRAND'     // 业务子品牌
  | 'PRODUCT_LINE'  // 产品线品牌
  | 'TECH_SERIES';  // 技术与系列标

export interface BrandTreeNode {
  id: string;
  name: string;               // 品牌中文名称，如 "usmile 笑容加", "密浪", "净白云朵"
  englishName?: string;       // 英文名，如 "usmile", "Waves"
  code: string;               // 品牌唯一编码，如 "BR-USMILE-001"
  level: BrandLevel;          // 品牌层级
  parentId?: string | null;   // 父级品牌节点 ID (根节点为 null)
  description?: string;       // 品牌商业定位与描述
  ownerDept: string;          // 归属事业部/需求部门
  ownerName: string;          // 品牌负责人/主理人
  status: 'ACTIVE' | 'PLANNING' | 'RETIRED'; // 状态：在营 / 规划中 / 已退市
  launchDate: string;         // 面市/创立时间
  logoUrl?: string;           // 品牌标识
  targetCategories: number[]; // 目标/核心尼斯分类，如 [3, 10, 21, 35]
  targetMarkets: string[];    // 规划/在营市场，如 ["中国", "东南亚", "欧盟", "北美"]
  trademarkCount?: number;    // 关联注册商标数
  pendingCount?: number;      // 在途申请数
  disputeCount?: number;      // 异议维权数
  children?: BrandTreeNode[]; // 递归子节点
}

export type BrandProposalStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED';

export interface BrandCreationProposal {
  id: string;
  proposalNo: string;         // 申请单号，如 "BP20260820001"
  brandName: string;          // 拟建品牌名称
  englishName?: string;       // 拟建英文名
  level: BrandLevel;          // 拟建层级
  parentBrandId?: string;     // 拟挂载的父级品牌 ID
  parentBrandName?: string;   // 拟挂载的父级品牌名称
  ownerDept: string;          // 需求发起部门
  initiatorName: string;      // 需求人
  initiatorAvatar?: string;
  createTime: string;         // 发起时间
  brandPositioning: string;   // 品牌商业定位与规划
  plannedLaunchDate: string;  // 计划上市时间
  targetClasses: number[];    // 规划商标类别 (如 [21, 3, 10, 35])
  targetMarkets: string[];    // 规划进军法域 (如 ["中国", "东南亚", "欧洲"])
  commercialJustification: string; // 商业必要性与立项依据
  preliminaryRiskNotes?: string;   // 法务前期检索查重意见
  status: BrandProposalStatus;
  currentStep: number;        // 当前审批环节 (1, 2, 3)
  withdrawReason?: string;    // 撤回原因
  withdrawTime?: string;      // 撤回时间
  cancelReason?: string;      // 取消原因
  cancelTime?: string;        // 取消时间
  rejectReason?: string;      // 驳回原因
  rejectionReason?: string;   // 驳回原因别名
  steps: {
    role: string;
    userName: string;
    status: 'APPROVED' | 'CURRENT' | 'WAITING' | 'REJECTED';
    comment?: string;
    timestamp?: string;
  }[];
  approvedNodeId?: string;    // 审批通过后自动创建的品牌树节点 ID
}

