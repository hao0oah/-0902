import { Pagination } from "./Pagination";
import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import { 
  DEFAULT_OFFICIAL_AGENCIES,
  DEFAULT_PRIORITY_COUNTRIES,
  ALL_REGION_NAMES,
  getCountriesByRegion,
  getRegionByCountry,
  getAllMappedCountries,
  getApplicantMappings,
  getAgencyMappings,
  getCountryRegionMappings,
  subscribeMappingChanges,
  ApplicantMappingItem,
  AgencyMappingItem
} from '../lib/mappingStore';
import { 
  getNiceClassificationMappings, 
  subscribeNiceClassificationChanges, 
  NiceClassificationItem, 
  NICE_CLASSES_META 
} from '../lib/niceClassificationStore';
import { INITIAL_BRAND_TREE, flattenBrandTree } from '../data/brandTreeData';
import { getSyncedCaseDocs, subscribeDocSync } from '../lib/docSyncStore';
import { 
  Search, 
  RotateCcw,
  LayoutGrid,
  Columns3, 
  RefreshCw,
  Plus, 
  X, 
  Check, 
  AlertCircle, 
  AlertTriangle, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Globe2, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  Trash2,
  Eye,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Layers,
  FileCheck2,
  Tag,
  Calendar,
  User,
  Filter,
  CheckSquare,
  HelpCircle,
  Briefcase,
  Edit3,
  Download,
  Upload,
  ArrowUpRight,
  Copy,
  FileSpreadsheet,
  SlidersHorizontal,
  ShoppingBag,
  Folder,
  MessageSquare,
  Award,
  Paperclip,
  Mail,
  Send,
  Link2,
  FileCode,
  ShieldAlert,
  Scale,
  GitFork,
  Presentation,
  Archive,
  FolderArchive,
  Maximize2,
  Play,
  Table,
  FileCheck,
  UserCheck,
  Users,
  ArrowUp,
  ArrowDown,
  History,
  ClipboardList,
  RotateCw
} from 'lucide-react';
import { 
  CaseManagementItem, 
  CaseManagementStatus, 
  CaseTimelineMilestone,
  CaseOfficialDocument,
  DocumentCategory,
  CaseCommunication,
  RelatedCase,
  CaseEvidence,
  HandlingTask,
  CaseApplicantInfo,
  CaseApplicantHistoryItem,
  CaseOperationLog,
  CaseOpposedPartyInfo,
  CasePriorityInfo,
  CaseAgentInfo,
  CaseLeaderInfo,
  ApplicantChangeHistory,
  TrademarkItem,
  TrademarkApplicationProposal,
  EnforcementCase,
  EnforcementCaseType
} from '../types';
import { INITIAL_PROPOSALS, getProposalApprovalRecords, NICE_CLASSES_45, SearchableMultiSelect } from './ApplicationCenter';
import { INITIAL_ENFORCEMENT_CASES } from '../data/mockData';

// 转换尼斯分类字符串（例如："第10类、第21类" 或 "第10类 (医疗器械)"）为标准类目代码数组（如：['第10类', '第21类']）
const parseClassesToCodes = (rawClassesStr: string): string[] => {
  if (!rawClassesStr) return [];
  const matches = rawClassesStr.match(/第\d+类/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(code => {
    const num = code.replace(/\D/g, '');
    const padded = num.padStart(2, '0');
    return `第${padded}类`;
  })));
};

// 标准商标注册最新进度阶段选项
export const REGISTRATION_PROGRESS_OPTIONS = [
  '获准注册核发证书',
  '官方递交申报完成',
  '已下发受理通知书',
  '形式审查通过',
  '实质审查中',
  '下发审查意见通知书 (待答复)',
  '初审公告刊登 (3个月异议期)',
  '注册公告刊登',
  '注册证书核发与归档',
  '商标核准续展',
  '驳回复审中',
  '商标已失效/撤销'
];

// 处理事项下拉选项
export const HANDLING_TASK_NAME_OPTIONS = [
  '商标注册申请',
  '实质审查意见答辩及补正',
  '初审公告期异议申请',
  '商标驳回复审申请',
  '商标异议答辩及举证',
  '商标撤三申请 (连续三年不使用撤销)',
  '商标撤三答辩与使用证据提交',
  '商标无效宣告申请',
  '商标无效宣告答辩',
  '商标变更申请 (名义/地址)',
  '商标转让/移转申请',
  '商标续展申请',
  '商标许可备案登记',
  '马德里国际注册领土延伸',
  '海关知识产权保护备案',
  '官方发文核查与领转'
];

// 处理状态下拉选项
export const HANDLING_TASK_STATUS_OPTIONS = [
  '待处理',
  '处理中',
  '待审核',
  '待递交',
  '已完成',
  '暂停',
  '已终止'
];

// 案件阶段下拉选项
export const HANDLING_TASK_STAGE_OPTIONS = [
  '准备递交阶段',
  '申请受理阶段',
  '形式审查阶段',
  '实质审查阶段',
  '初审公告阶段',
  '异议/复审阶段',
  '核准注册阶段',
  '续展维权阶段',
  '归档结案阶段'
];

// 与【新建商标检索需求】页面完全一致的 45类尼斯分类选择器组件
interface TrademarkClassSelectorProps {
  selectedClassCodes: string[];
  isDropdownOpen: boolean;
  searchKeyword: string;
  onToggleDropdown: () => void;
  onToggleClassCode: (code: string) => void;
  onSetQuickClasses: (codes: string[]) => void;
  onSearchKeywordChange: (keyword: string) => void;
  label?: string;
}

function TrademarkClassSelector({
  selectedClassCodes,
  isDropdownOpen,
  searchKeyword,
  onToggleDropdown,
  onToggleClassCode,
  onSetQuickClasses,
  onSearchKeywordChange,
  label = "尼斯分类"
}: TrademarkClassSelectorProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>{label}</span>
            <span className="text-[11px] font-normal text-slate-500 ml-1">
              (支持关键词搜索与45全类目多选)
            </span>
          </label>
        </div>
      )}

      {/* 已选类别 Chip 列表 (点击整个框触发展开45类下拉) */}
      <div 
        onClick={onToggleDropdown}
        className="flex items-center justify-between gap-2 min-h-[38px] p-1.5 px-2.5 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all shadow-2xs group"
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {selectedClassCodes.length === 0 ? (
            <span className="text-slate-400 text-xs">请点击选择尼斯分类 (1-45类全选与搜索)...</span>
          ) : (
            selectedClassCodes.map(code => {
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
                      onToggleClassCode(code);
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
            {isDropdownOpen ? '收起' : '选择'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
        </div>
      </div>

      {/* 可展开搜索与多选面板 */}
      {isDropdownOpen && (
        <div className="mt-2 p-3 bg-white border border-blue-200 rounded-xl shadow-lg space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          {/* 搜索栏 */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => onSearchKeywordChange(e.target.value)}
              placeholder="搜索类别编号或关键词（如：21、洁具、牙刷、日化、软件、医疗...）"
              className="w-full text-xs text-slate-800 pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => onSearchKeywordChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 常用分类快捷键 */}
          <div className="flex flex-wrap items-center justify-between text-[11px] gap-1.5 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1 text-slate-500">
              <span>常用预设:</span>
              <button
                type="button"
                onClick={() => onSetQuickClasses(['第21类', '第03类', '第10类'])}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
              >
                美齿个护 (21+03+10)
              </button>
              <button
                type="button"
                onClick={() => onSetQuickClasses(['第09类', '第35类', '第42类'])}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
              >
                数智电商 (09+35+42)
              </button>
            </div>
            <button
              type="button"
              onClick={() => onSetQuickClasses(['第21类'])}
              className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              重置默认
            </button>
          </div>

          {/* 45类列表 (带 Checkbox) */}
          <div className="max-h-52 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-1 text-xs">
            {NICE_CLASSES_45.filter(item => {
              if (!searchKeyword.trim()) return true;
              const k = searchKeyword.trim().toLowerCase();
              return item.code.toLowerCase().includes(k) ||
                item.num.includes(k) ||
                item.name.toLowerCase().includes(k) ||
                item.desc.toLowerCase().includes(k);
            }).map(item => {
              const isChecked = selectedClassCodes.includes(item.code);
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
                    onChange={() => onToggleClassCode(item.code)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs flex items-center justify-between">
                      <span>{item.code} - {item.name}</span>
                      {isChecked && <Check className="w-3 h-3 text-blue-600" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// 批量更新可选字段定义 (25项属性列，首列为默认必选不可修改的案件编号)
const UPDATEABLE_FIELD_OPTIONS = [
  { key: 'caseNo', label: '案件编号', defaultVal: 'TM20260813004', required: true },
  { key: 'classes', label: '尼斯分类', defaultVal: '第10类、第21类' },
  { key: 'similarGroups', label: '类似群组', defaultVal: '1001; 2101' },
  { key: 'goodsItems', label: '商品/服务', defaultVal: '电动牙刷及替换头' },
  { key: 'status', label: '案件流转状态', defaultVal: 'REGISTERED (已注册)' },
  { key: 'officialAgency', label: '知识产权主管局', defaultVal: '国家知识产权局 (CNIPA)' },
  { key: 'deadlineDate', label: '申报/答复截止日', defaultVal: '2026-09-30' },
  { key: 'region', label: '申请地区', defaultVal: '大中华地区' },
  { key: 'country', label: '申请国家', defaultVal: '中国' },
  { key: 'applicationNo', label: '官方申请号', defaultVal: '97812345' },
  { key: 'applyDate', label: '官方申请日', defaultVal: '2026-08-15' },
  { key: 'latestRegistrationProgress', label: '最新注册进度', defaultVal: '初审公告中' },
  { key: 'registrationNo', label: '官方注册号', defaultVal: 'REG-882200' },
  { key: 'registrationDate', label: '官方注册日', defaultVal: '2026-08-20' },
  { key: 'firstNoticeIssue', label: '初审公告期号', defaultVal: '1850期' },
  { key: 'firstNoticeDate', label: '初审公告日', defaultVal: '2026-05-15' },
  { key: 'regNoticeIssue', label: '注册公告期号', defaultVal: '1862期' },
  { key: 'regNoticeDate', label: '注册公告日', defaultVal: '2026-08-15' },
  { key: 'intlRegNo', label: '国际注册号', defaultVal: 'INT-993881' },
  { key: 'intlRegDate', label: '国际注册日', defaultVal: '2026-01-10' },
  { key: 'validUntil', label: '权利终止日/有效期止', defaultVal: '2036-08-20' },
  { key: 'renewalStartDate', label: '续展起始日', defaultVal: '2035-08-20' },
  { key: 'applicantEntity', label: '申请人主体', defaultVal: '追觅创新(苏州)管理有限公司' },
  { key: 'agencyName', label: '承办代理机构', defaultVal: '北京市柳沈律师事务所' },
  { key: 'entrustDate', label: '委案日期', defaultVal: '2026-07-01' },
];

export interface BatchValidationError {
  rowNum: number;
  caseNo: string;
  fieldKey: string;
  fieldLabel: string;
  value: string;
  allowedOptionsStr: string;
}

// 受控下拉列字段及系统支持选项表 (导出模板规则提示与导入硬校验)
export const RESTRICTED_FIELD_OPTIONS: Record<string, { label: string; options: string[] }> = {
  classes: {
    label: '尼斯分类',
    options: Array.from({ length: 45 }, (_, i) => `第${i + 1}类`),
  },
  similarGroups: {
    label: '类似群组',
    options: [
      '1001', '1002', '1003', '1004', '1005', '2101', '2102', '2103', '2108',
      '4209', '4210', '4220', '0301', '0302', '0307', '0901', '0902', '1101', '3501', '3502'
    ],
  },
  status: {
    label: '案件流转状态',
    options: [
      '待申请', '申请中', '审查中', '已注册', '已失效', '待答复/补正',
      '初审公告中', '驳回复审中', '异议答辩中', '核准注册', '获准注册',
      'PENDING_APPLY', 'APPLYING', 'EXAMINING', 'REGISTERED', 'INVALID', 'PENDING_REPLY'
    ],
  },
  officialAgency: {
    label: '知识产权主管局',
    options: [
      '中国国家知识产权局 (CNIPA)',
      '国家知识产权局 (CNIPA)',
      '国家知识产权局商标局 (CNIPA)',
      '国家知识产权局',
      '新加坡知识产权局 (IPOS)',
      '新加坡知识产权局(IPOS)',
      '美国专利商标局 (USPTO)',
      '欧洲联盟知识产权局 (EUIPO)',
      '日本特许厅 (JPO)',
      '韩国特许厅 (KIPO)',
      '世界知识产权组织 (WIPO)',
      '马来西亚知识产权局 (MyIPO)',
      '印度尼西亚知识产权总局 (DGIP)',
      '泰国知识产权局 (DIP)',
      '英国知识产权局 (UKIPO)',
      '德国专利商标局 (DPMA)'
    ],
  },
  latestRegistrationProgress: {
    label: '最新注册进度',
    options: [
      '接单生成', '递交申请', '受理通知', '形式审查', '实质审查',
      '初审公告', '注册公告', '核准发证', '获准注册核发证书', '驳回复审', '异议程序', '申请续展', '审查中', '已注册'
    ],
  },
  applicantEntity: {
    label: '申请人主体',
    options: [
      '广州星际悦动股份有限公司',
      '深圳星际悦动科技有限公司',
      'usmile Global (Singapore) Pte. Ltd.',
      '香港星际悦动有限公司',
      '广州笑容加健康科技有限公司',
      '追觅创新(苏州)管理有限公司',
      '追觅科技(天津)有限公司',
      '上海追觅生活科技有限公司',
      'Dreame International (HK) Limited',
      '广州星域欢畅科技有限公司',
      '深圳市追觅智能科技有限公司'
    ],
  },
  agencyName: {
    label: '承办代理机构',
    options: [
      'Allen & Gledhill LLP (新加坡)',
      'Allen & Gledhill LLP',
      'Baker & McKenzie (香港/国际)',
      '北京永新同创知识产权代理有限公司',
      '广州三环专利商标代理有限公司',
      'Fish & Richardson P.C. (美国)',
      'Sonoda & Kobayashi (日本)',
      '北京市柳沈律师事务所',
      '中国贸促会专利商标事务所',
      '北京集佳知识产权代理有限公司',
      '上海专利商标事务所有限公司',
      '北京德恒律师事务所',
      '品牌知产中心直办'
    ],
  },
};

// CSV 解析辅助工具 (支持双引号转义及跨行处理)
export const parseCSVText = (text: string): string[][] => {
  const rawLines = text.split(/\r?\n/);
  const rows: string[][] = [];
  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('#') || line.startsWith('//')) continue; // 自动过滤说明注释行

    const cells: string[] = [];
    let insideQuote = false;
    let currentCell = '';
    for (let i = 0; i < rawLine.length; i++) {
      const char = rawLine[i];
      if (char === '"') {
        if (insideQuote && rawLine[i + 1] === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());
    rows.push(cells);
  }
  return rows;
};

// 校验受控字段填列值是否属于系统已有选项
export const validateRestrictedFieldValue = (
  fKey: string,
  rawVal: string
): { isValid: boolean; allowedStr: string } => {
  const config = RESTRICTED_FIELD_OPTIONS[fKey];
  if (!config) return { isValid: true, allowedStr: '' };

  const trimmed = rawVal ? rawVal.replace(/^"+|"+$/g, '').trim() : '';
  if (!trimmed) return { isValid: true, allowedStr: '' }; // 允许留空（视作不修改或留空）

  const allowedStr = config.options.slice(0, 8).join(', ') + (config.options.length > 8 ? ' 等系统已有选项' : '');

  // 1. 尼斯分类
  if (fKey === 'classes') {
    const tokens = trimmed.split(/[;,；、\s]+/).filter(Boolean);
    for (const tok of tokens) {
      const formatted = tok.startsWith('第') ? (tok.endsWith('类') ? tok : `${tok}类`) : `第${tok}类`;
      if (!config.options.includes(formatted)) {
        const num = parseInt(tok.replace(/\D/g, ''), 10);
        if (isNaN(num) || num < 1 || num > 45) {
          return { isValid: false, allowedStr: '第1类 至 第45类 (如: 第10类;第21类)' };
        }
      }
    }
    return { isValid: true, allowedStr };
  }

  // 2. 类似群组
  if (fKey === 'similarGroups') {
    const tokens = trimmed.split(/[;,；、\s]+/).filter(Boolean);
    for (const tok of tokens) {
      const isValidCode = /^\d{4}[a-zA-Z]?$/.test(tok) || config.options.includes(tok);
      if (!isValidCode) {
        return { isValid: false, allowedStr: '4位类似群组代码 (如: 1001; 2101; 4209)' };
      }
    }
    return { isValid: true, allowedStr };
  }

  // 3. 案件流转状态
  if (fKey === 'status') {
    const isMatch = config.options.some(opt => opt.toLowerCase() === trimmed.toLowerCase());
    return { isValid: isMatch, allowedStr };
  }

  // 4. 知识产权主管局
  if (fKey === 'officialAgency') {
    const isMatch = config.options.some(opt => opt === trimmed || trimmed.includes(opt) || opt.includes(trimmed));
    return { isValid: isMatch, allowedStr };
  }

  // 5. 最新注册进度
  if (fKey === 'latestRegistrationProgress') {
    const isMatch = config.options.some(opt => opt === trimmed || trimmed.includes(opt));
    return { isValid: isMatch, allowedStr };
  }

  // 6. 申请人主体
  if (fKey === 'applicantEntity') {
    const isMatch = config.options.some(opt => opt === trimmed || trimmed.includes(opt) || opt.includes(trimmed));
    return { isValid: isMatch, allowedStr };
  }

  // 7. 承办代理机构
  if (fKey === 'agencyName') {
    const isMatch = config.options.some(opt => opt === trimmed || trimmed.includes(opt) || opt.includes(trimmed));
    return { isValid: isMatch, allowedStr };
  }

  return { isValid: true, allowedStr };
};

export interface PortfolioLedgerProps {
  caseItems?: CaseManagementItem[];
  brandTree?: any;
  onUpdateCase?: (updated: CaseManagementItem) => void;
  onSelectTrademark?: (tm: TrademarkItem | null) => void;
  onOpenAiAssistant?: () => void;
  initialSelectedCase?: CaseManagementItem | null;
  onCloseCaseDetail?: () => void;
  onlyModal?: boolean;
  readOnly?: boolean;
}

export const PortfolioLedger: React.FC<PortfolioLedgerProps> = ({
  caseItems = [],
  brandTree,
  onUpdateCase,
  onOpenAiAssistant,
  initialSelectedCase = null,
  onCloseCaseDetail,
  onlyModal = false,
  readOnly = false
}) => {
  // 1. 案件管理台账 12 大搜索字段筛选状态
  const [filterCaseNo, setFilterCaseNo] = useState('');                 // 1. 案件编号 (支持批量)
  const [filterProposalNo, setFilterProposalNo] = useState('');         // 2. 建案编码 (支持批量)
  const [filterTrademarkName, setFilterTrademarkName] = useState('');   // 3. 商标名称 (模糊)
  const [filterForm, setFilterForm] = useState('ALL');                 // 4. 商标形式 (单选)
  const [filterBrand, setFilterBrand] = useState('ALL');                // 5. 所属品牌 (单选)
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterSelectedClasses, setFilterSelectedClasses] = useState<string[]>([]); // 6. 尼斯分类 (多选)
  const [filterRegion, setFilterRegion] = useState('ALL');              // 7. 申请地区 (单选)
  const [filterCountry, setFilterCountry] = useState('ALL');            // 8. 申请国家 (单选)
  const [filterImportance, setFilterImportance] = useState('ALL');      // 9. 重要等级 (单选)
  const [filterAppNo, setFilterAppNo] = useState('');                   // 10. 官方申请号 (支持批量)
  const [filterApplyStartDate, setFilterApplyStartDate] = useState(''); // 11. 官方申请日 (开始)
  const [filterApplyEndDate, setFilterApplyEndDate] = useState('');   // 11. 官方申请日 (结束)
  const [filterSelectedAgencies, setFilterSelectedAgencies] = useState<string[]>([]); // 12. 代理机构 (多选)
  const [isAgencyDropdownOpen, setIsAgencyDropdownOpen] = useState(false);
  const [agencySearchKeywordFilter, setAgencySearchKeywordFilter] = useState('');
  const [filterGoods, setFilterGoods] = useState('');
  const [filterLawFirm, setFilterLawFirm] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');      // 状态选项卡
  const [isExpanded, setIsExpanded] = useState(false);                 // 控制默认2行折叠展开 (false)

  // 视图模式：COMPOUND (一屏合并视图) / STANDARD (平铺单列视图)
  const [viewMode, setViewMode] = useState<'COMPOUND' | 'STANDARD'>('COMPOUND');

  // 当前激活的状态 Tab (全部案件 | 待申请 | 申请中 | 审查中 | 已注册 | 已失效)
  const [activeTab, setActiveTab] = useState<'ALL' | CaseManagementStatus>('ALL');

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 弹窗状态
  const [selectedCaseForView, setSelectedCaseForView] = useState<CaseManagementItem | null>(initialSelectedCase || null);

  useEffect(() => {
    if (initialSelectedCase) {
      setSelectedCaseForView(initialSelectedCase);
      setActiveCaseDetailTab('basic');
    } else if (onlyModal && !initialSelectedCase) {
      setSelectedCaseForView(null);
    }
  }, [initialSelectedCase, onlyModal]);

  const handleCloseCaseDetailModal = () => {
    setSelectedCaseForView(null);
    if (onCloseCaseDetail) {
      onCloseCaseDetail();
    }
  };
  const [selectedCaseForMaintain, setSelectedCaseForMaintain] = useState<CaseManagementItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 批量导入 & 批量更新 弹窗状态
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const [isBatchUpdateModalOpen, setIsBatchUpdateModalOpen] = useState(false);
  const [selectedUpdateFields, setSelectedUpdateFields] = useState<string[]>([
    'caseNo', 'status', 'applicationNo', 'applyDate', 'agencyName'
  ]);
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [batchValidationErrors, setBatchValidationErrors] = useState<BatchValidationError[] | null>(null);

  // 建案申请详情 关联弹窗状态
  const [selectedProposalForDetail, setSelectedProposalForDetail] = useState<TrademarkApplicationProposal | null>(null);
  const [proposalDetailTab, setProposalDetailTab] = useState<'info' | 'approval' | 'history'>('info');

  // 案件详情 Tab 状态：基本信息 | 商品 | 申请信息 | 处理事项 | 文件列表 | 使用证据 | 操作记录
  type CaseDetailTabType = 'basic' | 'goods' | 'applicant' | 'tasks' | 'files' | 'evidence' | 'history';
  const [activeCaseDetailTab, setActiveCaseDetailTab] = useState<CaseDetailTabType>('basic');

  // 案件详情内部临时状态
  const [goodsSearchQuery, setGoodsSearchQuery] = useState('');
  const [quickNewGoodsItem, setQuickNewGoodsItem] = useState('');
  const [isEditingClasses, setIsEditingClasses] = useState<boolean>(false);
  const [editingClassesInput, setEditingClassesInput] = useState<string>('');
  const [selectedClassCodes, setSelectedClassCodes] = useState<string[]>([]);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState<boolean>(false);
  const [classSearchKeyword, setClassSearchKeyword] = useState<string>('');

  // 类似群组与商品/服务联动状态
  const [niceItems, setNiceItems] = useState<NiceClassificationItem[]>(() => getNiceClassificationMappings());

  useEffect(() => {
    const unsub = subscribeNiceClassificationChanges(() => {
      setNiceItems(getNiceClassificationMappings());
    });
    return unsub;
  }, []);

  const [selectedGroupCodes, setSelectedGroupCodes] = useState<string[]>([]);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState<boolean>(false);
  const [groupSearchKeyword, setGroupSearchKeyword] = useState<string>('');

  const [selectedGoodsItems, setSelectedGoodsItems] = useState<string[]>([]);
  const [isGoodsDropdownOpen, setIsGoodsDropdownOpen] = useState<boolean>(false);
  const [goodsSearchKeyword, setGoodsSearchKeyword] = useState<string>('');

  // 构建标准 45 类完整元数据列表 (合并系统管理中已维护的最新项目数与群组数)
  const fullNiceClassesList = useMemo(() => {
    return NICE_CLASSES_META.map(meta => {
      const classCode = `第${String(meta.classNum).padStart(2, '0')}类`;
      const numStr = String(meta.classNum).padStart(2, '0');
      const itemsInClass = niceItems.filter(i => i.classNum === meta.classNum);
      const uniqueGroups = new Set(itemsInClass.map(i => i.groupCode));
      return {
        classNum: meta.classNum,
        code: classCode,
        num: numStr,
        name: meta.classTitle.replace(/^第\d+类\s*[-–—]\s*/, ''),
        classTitle: meta.classTitle,
        categoryType: meta.categoryType,
        desc: meta.description,
        groupCount: uniqueGroups.size || (meta.defaultGroups ? meta.defaultGroups.length : 0),
        itemCount: itemsInClass.length
      };
    });
  }, [niceItems]);

  // 【联动计算 1】：根据当前选中的【尼斯分类】计算可供选择的【类似群组 (Group)】
  const availableGroupOptions = useMemo(() => {
    const selectedNums = selectedClassCodes
      .map(c => parseInt(c.replace(/[^0-9]/g, ''), 10))
      .filter(n => !isNaN(n));

    // 如果未选类别，则默认显示全部群组
    const filteredItems = selectedNums.length > 0
      ? niceItems.filter(i => selectedNums.includes(i.classNum))
      : niceItems;

    const groupMap = new Map<string, {
      classNum: number;
      classCode: string;
      classTitle: string;
      groupCode: string;
      groupName: string;
      itemCount: number;
    }>();

    filteredItems.forEach(item => {
      if (!groupMap.has(item.groupCode)) {
        groupMap.set(item.groupCode, {
          classNum: item.classNum,
          classCode: `第${String(item.classNum).padStart(2, '0')}类`,
          classTitle: item.classTitle,
          groupCode: item.groupCode,
          groupName: item.groupName,
          itemCount: 1
        });
      } else {
        const g = groupMap.get(item.groupCode)!;
        g.itemCount += 1;
      }
    });

    // 补充元数据中存在但暂无条目的群组
    if (selectedNums.length > 0) {
      selectedNums.forEach(cNum => {
        const meta = NICE_CLASSES_META.find(m => m.classNum === cNum);
        if (meta && meta.defaultGroups) {
          meta.defaultGroups.forEach(dg => {
            if (!groupMap.has(dg.code)) {
              groupMap.set(dg.code, {
                classNum: cNum,
                classCode: `第${String(cNum).padStart(2, '0')}类`,
                classTitle: meta.classTitle,
                groupCode: dg.code,
                groupName: dg.name,
                itemCount: 0
              });
            }
          });
        }
      });
    }

    return Array.from(groupMap.values()).sort((a, b) => 
      a.classNum - b.classNum || a.groupCode.localeCompare(b.groupCode)
    );
  }, [niceItems, selectedClassCodes]);

  // 【联动计算 2】：根据当前选中的【类似群组】(或尼斯分类) 计算可供选择的【商品/服务】
  const availableGoodsOptions = useMemo(() => {
    const selectedNums = selectedClassCodes
      .map(c => parseInt(c.replace(/[^0-9]/g, ''), 10))
      .filter(n => !isNaN(n));

    let filteredItems: NiceClassificationItem[] = [];
    if (selectedGroupCodes.length > 0) {
      filteredItems = niceItems.filter(i => selectedGroupCodes.includes(i.groupCode));
    } else if (selectedNums.length > 0) {
      filteredItems = niceItems.filter(i => selectedNums.includes(i.classNum));
    } else {
      filteredItems = niceItems;
    }

    // 按 (groupCode + itemNameCn) 去重
    const itemMap = new Map<string, NiceClassificationItem>();
    filteredItems.forEach(it => {
      const key = `${it.groupCode}-${it.itemNameCn}`;
      if (!itemMap.has(key)) {
        itemMap.set(key, it);
      }
    });

    return Array.from(itemMap.values()).sort((a, b) => 
      a.classNum - b.classNum || 
      a.groupCode.localeCompare(b.groupCode) || 
      a.itemNameCn.localeCompare(b.itemNameCn)
    );
  }, [niceItems, selectedClassCodes, selectedGroupCodes]);

  // 1. 商标类别勾选与快捷预设处理 (联动裁剪群组与商品)
  const handleToggleClassCode = (code: string) => {
    setSelectedClassCodes(prev => {
      let next: string[];
      if (prev.includes(code)) {
        next = prev.filter(c => c !== code);
      } else {
        next = [...prev, code];
      }
      const formatted = next.map(c => {
        const item = fullNiceClassesList.find(n => n.code === c) || NICE_CLASSES_45.find(n => n.code === c);
        return item ? `${item.code} (${item.name})` : c;
      }).join('、');
      setEditingClassesInput(formatted);

      // 联动：剔除不再属于已选分类的群组
      const validClassNums = next.map(c => parseInt(c.replace(/[^0-9]/g, ''), 10)).filter(n => !isNaN(n));
      const validGroups = niceItems.filter(i => validClassNums.includes(i.classNum)).map(i => i.groupCode);
      const nextGroupCodes = selectedGroupCodes.filter(gc => validGroups.includes(gc));

      const formattedGroups = nextGroupCodes.map(gc => {
        const grp = availableGroupOptions.find(g => g.groupCode === gc);
        return grp ? `${gc} (${grp.groupName})` : gc;
      }).join('、');

      // 联动：剔除不再属于已选群组的商品
      const validGoods = niceItems.filter(i => nextGroupCodes.includes(i.groupCode)).map(i => i.itemNameCn);
      const nextGoods = selectedGoodsItems.filter(g => validGoods.includes(g));

      setSelectedGroupCodes(nextGroupCodes);
      setSelectedGoodsItems(nextGoods);

      setEditingCaseInfo(info => ({ 
        ...info, 
        classes: formatted,
        similarGroups: formattedGroups,
        goodsServices: nextGoods.join('、'),
        goodsItems: nextGoods.join('、')
      }));
      return next;
    });
  };

  const handleSetQuickClasses = (codes: string[]) => {
    setSelectedClassCodes(codes);
    const formatted = codes.map(c => {
      const item = fullNiceClassesList.find(n => n.code === c) || NICE_CLASSES_45.find(n => n.code === c);
      return item ? `${item.code} (${item.name})` : c;
    }).join('、');
    setEditingClassesInput(formatted);

    const validClassNums = codes.map(c => parseInt(c.replace(/[^0-9]/g, ''), 10)).filter(n => !isNaN(n));
    const validGroups = niceItems.filter(i => validClassNums.includes(i.classNum)).map(i => i.groupCode);
    const nextGroupCodes = selectedGroupCodes.filter(gc => validGroups.includes(gc));

    const formattedGroups = nextGroupCodes.map(gc => {
      const grp = availableGroupOptions.find(g => g.groupCode === gc);
      return grp ? `${gc} (${grp.groupName})` : gc;
    }).join('、');

    const validGoods = niceItems.filter(i => nextGroupCodes.includes(i.groupCode)).map(i => i.itemNameCn);
    const nextGoods = selectedGoodsItems.filter(g => validGoods.includes(g));

    setSelectedGroupCodes(nextGroupCodes);
    setSelectedGoodsItems(nextGoods);

    setEditingCaseInfo(info => ({ 
      ...info, 
      classes: formatted,
      similarGroups: formattedGroups,
      goodsServices: nextGoods.join('、'),
      goodsItems: nextGoods.join('、')
    }));
  };

  // 2. 类似群组勾选处理 (联动裁剪商品)
  const handleToggleGroupCode = (groupCode: string) => {
    setSelectedGroupCodes(prev => {
      let next: string[];
      if (prev.includes(groupCode)) {
        next = prev.filter(g => g !== groupCode);
      } else {
        next = [...prev, groupCode];
      }

      const formattedGroups = next.map(gc => {
        const grp = availableGroupOptions.find(g => g.groupCode === gc);
        return grp ? `${gc} (${grp.groupName})` : gc;
      }).join('、');

      // 联动：剔除不再属于已选群组的商品/服务项目
      const validGoods = niceItems.filter(i => next.includes(i.groupCode)).map(i => i.itemNameCn);
      const nextGoods = selectedGoodsItems.filter(g => validGoods.includes(g));

      setSelectedGoodsItems(nextGoods);

      setEditingCaseInfo(info => ({
        ...info,
        similarGroups: formattedGroups,
        goodsServices: nextGoods.join('、'),
        goodsItems: nextGoods.join('、')
      }));

      return next;
    });
  };

  // 类似群组全选/反选当前分类下所有群组
  const handleSelectAllAvailableGroups = () => {
    const allCodes = availableGroupOptions.map(g => g.groupCode);
    if (selectedGroupCodes.length === allCodes.length && allCodes.length > 0) {
      setSelectedGroupCodes([]);
      setSelectedGoodsItems([]);
      setEditingCaseInfo(info => ({ ...info, similarGroups: '', goodsServices: '', goodsItems: '' }));
    } else {
      setSelectedGroupCodes(allCodes);
      const formatted = allCodes.map(gc => {
        const grp = availableGroupOptions.find(g => g.groupCode === gc);
        return grp ? `${gc} (${grp.groupName})` : gc;
      }).join('、');
      setEditingCaseInfo(info => ({ ...info, similarGroups: formatted }));
    }
  };

  // 3. 商品/服务勾选处理
  const handleToggleGoodsItem = (itemName: string) => {
    setSelectedGoodsItems(prev => {
      let next: string[];
      if (prev.includes(itemName)) {
        next = prev.filter(it => it !== itemName);
      } else {
        next = [...prev, itemName];
      }
      const goodsStr = next.join('、');
      setEditingCaseInfo(info => ({
        ...info,
        goodsServices: goodsStr,
        goodsItems: goodsStr
      }));
      return next;
    });
  };

  // 商品/服务快捷全选当前展示项目
  const handleSelectAllAvailableGoods = () => {
    const allItemNames = availableGoodsOptions.map(g => g.itemNameCn);
    if (selectedGoodsItems.length >= allItemNames.length && allItemNames.length > 0) {
      setSelectedGoodsItems([]);
      setEditingCaseInfo(info => ({ ...info, goodsServices: '', goodsItems: '' }));
    } else {
      setSelectedGoodsItems(allItemNames);
      const goodsStr = allItemNames.join('、');
      setEditingCaseInfo(info => ({ ...info, goodsServices: goodsStr, goodsItems: goodsStr }));
    }
  };

  const [fileFilter, setFileFilter] = useState<string>('ALL');
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('ALL'); // 'ALL' | '企业文件' | '递交文件' | '官方文件' | '事务所文件' | '其他文件'
  const [docSearchQuery, setDocSearchQuery] = useState<string>('');
  const [commTypeFilter, setCommTypeFilter] = useState<string>('ALL');
  const [evidenceTypeFilter, setEvidenceTypeFilter] = useState<string>('ALL');

  // 上拉/文件预览与二次确认删除 Modal 状态
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [previewingDoc, setPreviewingDoc] = useState<CaseOfficialDocument | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [archiveSubFilePreview, setArchiveSubFilePreview] = useState<{ title: string; type: string; size: string; content?: string } | null>(null);
  const [spreadsheetActiveTab, setSpreadsheetActiveTab] = useState<'sheet1' | 'sheet2'>('sheet1');
  const [deletingDoc, setDeletingDoc] = useState<CaseOfficialDocument | null>(null);

  // 批量下载模式状态与已选择文书ID
  const [isBatchDownloadMode, setIsBatchDownloadMode] = useState<boolean>(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const [uploadFormCategory, setUploadFormCategory] = useState<DocumentCategory>('官方文件');
  const [uploadFormTitle, setUploadFormTitle] = useState('');
  const [uploadFormDocNumber, setUploadFormDocNumber] = useState('');
  const [uploadFormType, setUploadFormType] = useState('PDF');
  const [uploadFormDate, setUploadFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [uploadFormUploader, setUploadFormUploader] = useState('陆燕丽');
  const [uploadFormRemarks, setUploadFormRemarks] = useState('');
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);

  // AI 智能文件识别与填报状态
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [analysisResultMsg, setAnalysisResultMsg] = useState<string | null>(null);
  const [analysisErrorMsg, setAnalysisErrorMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // 本地扩展储存 Map (保持文件列表、往来信息、相关案件、维权单据、使用证据动态新增)
  const [customDocsMap, setCustomDocsMap] = useState<Record<string, CaseOfficialDocument[]>>({});
  const [docSyncVersion, setDocSyncVersion] = useState<number>(0);

  useEffect(() => {
    const unsub = subscribeDocSync(() => {
      setDocSyncVersion(v => v + 1);
    });
    return unsub;
  }, []);
  const [customCommsMap, setCustomCommsMap] = useState<Record<string, CaseCommunication[]>>({});
  const [customRelatedMap, setCustomRelatedMap] = useState<Record<string, RelatedCase[]>>({});
  const [customEnforcementMap, setCustomEnforcementMap] = useState<Record<string, EnforcementCase[]>>({});
  const [customEvidencesMap, setCustomEvidencesMap] = useState<Record<string, CaseEvidence[]>>({});

  // 申请人主体及相关子模块 (被异议人, 优先权, 代理人, 负责人) 状态与操作
  const [customApplicantsMap, setCustomApplicantsMap] = useState<Record<string, CaseApplicantInfo[]>>({});
  const [customApplicantHistoryMap, setCustomApplicantHistoryMap] = useState<Record<string, CaseApplicantHistoryItem[]>>({});
  const [customOpposedMap, setCustomOpposedMap] = useState<Record<string, CaseOpposedPartyInfo[]>>({});
  const [customPriorityMap, setCustomPriorityMap] = useState<Record<string, CasePriorityInfo[]>>({});
  const [customAgentsMap, setCustomAgentsMap] = useState<Record<string, CaseAgentInfo[]>>({});
  const [customLeadersMap, setCustomLeadersMap] = useState<Record<string, CaseLeaderInfo[]>>({});

  const [isEditingApplicants, setIsEditingApplicants] = useState<boolean>(false);
  const [editingApplicantsDraft, setEditingApplicantsDraft] = useState<CaseApplicantInfo[]>([]);

  // 子模块行内编辑状态
  const [editingOpposedId, setEditingOpposedId] = useState<string | null>(null);
  const [editingOpposedDraft, setEditingOpposedDraft] = useState<CaseOpposedPartyInfo | null>(null);

  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null);
  const [editingPriorityDraft, setEditingPriorityDraft] = useState<CasePriorityInfo | null>(null);

  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editingAgentDraft, setEditingAgentDraft] = useState<CaseAgentInfo | null>(null);

  const [editingLeaderId, setEditingLeaderId] = useState<string | null>(null);
  const [editingLeaderDraft, setEditingLeaderDraft] = useState<CaseLeaderInfo | null>(null);

  // 申请信息子项（被异议人/优先权/代理人/负责人）删除二次确认状态
  const [deletingApplicantSubItem, setDeletingApplicantSubItem] = useState<{
    type: 'opposed' | 'priority' | 'agent' | 'leader';
    id: string;
    title: string;
    description: string;
    details: { label: string; value: string }[];
  } | null>(null);

  const [isApplicantHistoryModalOpen, setIsApplicantHistoryModalOpen] = useState(false);

  const [applicantSubSections, setApplicantSubSections] = useState<{
    opposed: boolean;
    priority: boolean;
    agents: boolean;
    leaders: boolean;
  }>({
    opposed: false,
    priority: false,
    agents: false,
    leaders: false
  });

  const handleConfirmDeleteApplicantSubItem = () => {
    if (!selectedCaseForView || !deletingApplicantSubItem) return;
    const { type, id } = deletingApplicantSubItem;

    if (type === 'opposed') {
      const current = getCaseOpposedParties(selectedCaseForView);
      const updated = current.filter(item => item.id !== id);
      setCustomOpposedMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
      showToast('已成功删除该被异议人信息');
    } else if (type === 'priority') {
      const current = getCasePriorities(selectedCaseForView);
      const updated = current.filter(item => item.id !== id);
      setCustomPriorityMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
      showToast('已成功删除该优先权信息');
    } else if (type === 'agent') {
      const current = getCaseAgents(selectedCaseForView);
      const updated = current.filter(item => item.id !== id);
      setCustomAgentsMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
      showToast('已成功删除该代理人信息');
    } else if (type === 'leader') {
      const current = getCaseLeaders(selectedCaseForView);
      const updated = current.filter(item => item.id !== id);
      setCustomLeadersMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
      showToast('已成功删除该负责人信息');
    }

    setDeletingApplicantSubItem(null);
  };

  const getCaseApplicants = (caseItem: CaseManagementItem): CaseApplicantInfo[] => {
    if (customApplicantsMap[caseItem.caseNo]) {
      return customApplicantsMap[caseItem.caseNo];
    }
    return [
      {
        id: `app_1_${caseItem.caseNo}`,
        seq: 1,
        name: caseItem.applicant || '广州星际悦动股份有限公司',
        nameEn: caseItem.applicantEn || 'Guangzhou Starfield Delight Co., Ltd.',
        address: caseItem.applicantAddress || '广东省广州市天河区珠江东路28号越秀金融大厦38层',
        addressEn: caseItem.applicantAddressEn || '38/F, Yuexiu Financial Tower, No.28 Zhujiang East Road, Tianhe District, Guangzhou, Guangdong, China'
      }
    ];
  };

  const getCaseOpposedParties = (caseItem: CaseManagementItem): CaseOpposedPartyInfo[] => {
    if (customOpposedMap[caseItem.caseNo]) {
      return customOpposedMap[caseItem.caseNo];
    }
    return [
      {
        id: `opp_1_${caseItem.caseNo}`,
        seq: 1,
        name: '广州美莱美企业管理有限公司',
        nameEn: 'Guangzhou Meilaimei Enterprise Management Co., Ltd.',
        address: '广东省广州市白云区云城东路500号'
      }
    ];
  };

  const getCasePriorities = (caseItem: CaseManagementItem): CasePriorityInfo[] => {
    if (customPriorityMap[caseItem.caseNo]) {
      return customPriorityMap[caseItem.caseNo];
    }
    return [
      {
        id: `pri_1_${caseItem.caseNo}`,
        seq: 1,
        country: caseItem.jurisdiction || '中国 (CN)',
        applicationNo: caseItem.applicationNo ? `${caseItem.applicationNo}-PRI` : '202610089872.X',
        applicationDate: caseItem.applyDate || '2026-01-15',
        dasCode: 'A8B9',
        priorityType: '商标优先权',
        status: '优先权已核准'
      }
    ];
  };

  const getCaseAgents = (caseItem: CaseManagementItem): CaseAgentInfo[] => {
    if (customAgentsMap[caseItem.caseNo]) {
      return customAgentsMap[caseItem.caseNo];
    }
    return [
      {
        id: `ag_1_${caseItem.caseNo}`,
        seq: 1,
        agentName: caseItem.agentName || '张敏',
        phone: '010-66578888',
        email: 'ipr-attorney@lawfirm.com',
        licenseNo: 'PAT-2024-0891',
        agency: caseItem.agencyName || '北京市柳沈律师事务所'
      }
    ];
  };

  const getCaseLeaders = (caseItem: CaseManagementItem): CaseLeaderInfo[] => {
    if (customLeadersMap[caseItem.caseNo]) {
      return customLeadersMap[caseItem.caseNo];
    }
    return [
      {
        id: `ld_1_${caseItem.caseNo}`,
        seq: 1,
        name: '张锦程',
        phone: '020-85596688',
        email: 'zhangjc@starfield.com',
        roleType: '内部知产责任人',
        department: '集团知产合规部'
      }
    ];
  };

  const getCaseApplicantHistory = (caseItem: CaseManagementItem): CaseApplicantHistoryItem[] => {
    if (customApplicantHistoryMap[caseItem.caseNo]) {
      return customApplicantHistoryMap[caseItem.caseNo];
    }
    return [
      {
        id: `hist_1_${caseItem.caseNo}`,
        seq: 1,
        changeType: '申请人名称变更',
        beforeValue: '广州星际悦动科技有限公司',
        afterValue: caseItem.applicant || '广州星际悦动股份有限公司',
        changer: '陆燕丽',
        changeDate: '2025-11-20'
      },
      {
        id: `hist_2_${caseItem.caseNo}`,
        seq: 2,
        changeType: '申请人地址变更',
        beforeValue: '广州市天河区黄埔大道西100号富力盈普大厦38楼',
        afterValue: caseItem.applicantAddress || '广东省广州市天河区天河北路239号2001、2002、2003、2004、2005房',
        changer: '陆燕丽',
        changeDate: '2026-02-10'
      },
      {
        id: `hist_3_${caseItem.caseNo}`,
        seq: 3,
        changeType: '受让人转让登记',
        beforeValue: '广州星际智造品牌管理有限公司',
        afterValue: caseItem.applicant || '广州星际悦动股份有限公司',
        changer: '系统自动',
        changeDate: '2026-05-18'
      }
    ];
  };

  // 案件【处理事项】 (Handling Tasks) 状态与操作
  const [customHandlingTasksMap, setCustomHandlingTasksMap] = useState<Record<string, HandlingTask[]>>({});
  const [handlingTaskModalOpen, setHandlingTaskModalOpen] = useState(false);
  const [handlingTaskModalMode, setHandlingTaskModalMode] = useState<'CREATE' | 'EDIT' | 'VIEW'>('CREATE');
  const [handlingTaskDetailTab, setHandlingTaskDetailTab] = useState<'info' | 'history'>('info');
  const [editingHandlingTask, setEditingHandlingTask] = useState<HandlingTask | null>(null);
  const [deletingHandlingTask, setDeletingHandlingTask] = useState<HandlingTask | null>(null);

  const [taskFormData, setTaskFormData] = useState({
    taskName: '',
    status: '',
    stage: '',
    undertaker: '',
    entrustDate: '',
    draftDeadline: '',
    internalDeadline: '',
    officialDeadline: '',
    firstDraftDate: '',
    finalDraftDate: '',
    completionDate: '',
    reviewScore: '',
    searchDeadline: '',
    searchDate: '',
    remarks: ''
  });

  const getCaseHandlingTasks = (caseItem: CaseManagementItem): HandlingTask[] => {
    if (customHandlingTasksMap[caseItem.caseNo]) {
      return customHandlingTasksMap[caseItem.caseNo];
    }
    return (caseItem as any).handlingTasks || [
      {
        id: `ht-1-${caseItem.caseNo}`,
        seq: 1,
        taskName: '商标注册申请',
        status: '已完成',
        stage: '准备递交阶段',
        undertaker: caseItem.agentName || '张锦程',
        handler: caseItem.agentName || '张锦程',
        entrustDate: '2026-02-20',
        draftDeadline: '2026-02-25',
        internalDeadline: '2026-03-01',
        officialDeadline: '2026-03-15',
        firstDraftDate: '2026-02-24',
        finalDraftDate: '2026-02-28',
        completionDate: caseItem.applyDate || '2026-03-10',
        reviewScore: '98',
        searchDeadline: '2026-02-22',
        searchDate: '2026-02-21',
        agency: caseItem.agencyName || '北京市柳沈律师事务所',
        agent: '林悦',
        remarks: '官方已核发受理通知书，书式审查合格进入实查阶段。'
      },
      {
        id: `ht-2-${caseItem.caseNo}`,
        seq: 2,
        taskName: '实质审查意见答辩及补正',
        status: '已完成',
        stage: '实质审查阶段',
        undertaker: caseItem.agentName || '张锦程',
        handler: caseItem.agentName || '张锦程',
        entrustDate: '2026-05-15',
        draftDeadline: '2026-06-10',
        internalDeadline: '2026-06-20',
        officialDeadline: '2026-07-05',
        firstDraftDate: '2026-06-08',
        finalDraftDate: '2026-06-15',
        completionDate: '2026-06-18',
        reviewScore: '95',
        searchDeadline: '2026-05-25',
        searchDate: '2026-05-23',
        agency: caseItem.agencyName || '北京市柳沈律师事务所',
        agent: '王浩',
        remarks: '已按期提交同类产品差异化使用证明与合规声明。'
      },
      {
        id: `ht-3-${caseItem.caseNo}`,
        seq: 3,
        taskName: '初审公告期异议申请',
        status: '处理中',
        stage: '初审公告阶段',
        undertaker: '陆燕丽',
        handler: '陆燕丽',
        entrustDate: '2026-08-10',
        draftDeadline: '2026-08-25',
        internalDeadline: '2026-09-10',
        officialDeadline: '2026-09-25',
        firstDraftDate: '2026-08-23',
        finalDraftDate: '',
        completionDate: '',
        reviewScore: '96',
        searchDeadline: '2026-08-18',
        searchDate: '2026-08-16',
        agency: caseItem.agencyName || '北京市柳沈律师事务所',
        agent: '陈思远',
        remarks: '公告期3个月监控中，排查第三方近似异议风险。'
      },
      {
        id: `ht-4-${caseItem.caseNo}`,
        seq: 4,
        taskName: '商标续展申请',
        status: '待处理',
        stage: '续展维权阶段',
        undertaker: '李沐',
        handler: '李沐',
        entrustDate: '2026-08-15',
        draftDeadline: '2026-10-15',
        internalDeadline: '2026-11-01',
        officialDeadline: '2026-11-15',
        firstDraftDate: '',
        finalDraftDate: '',
        completionDate: '',
        reviewScore: '100',
        searchDeadline: '2026-09-10',
        searchDate: '',
        agency: '品牌知产中心直办',
        agent: '李沐',
        remarks: '待官方发证后进行纸质/电子证书卷宗归档及续展台账维护。'
      }
    ];
  };

  // 案件【操作记录】 (Operation Logs / Case Audit Trail) 状态与操作
  const [customOperationLogsMap, setCustomOperationLogsMap] = useState<Record<string, CaseOperationLog[]>>({});
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logModuleFilter, setLogModuleFilter] = useState('ALL');
  const [logTypeFilter, setLogTypeFilter] = useState('ALL');
  const [logOperatorFilter, setLogOperatorFilter] = useState('ALL');
  const [logViewMode, setLogViewMode] = useState<'TABLE' | 'TIMELINE'>('TABLE');
  const [viewingOperationLog, setViewingOperationLog] = useState<CaseOperationLog | null>(null);

  const getCaseOperationLogs = (caseItem: CaseManagementItem): CaseOperationLog[] => {
    if (customOperationLogsMap[caseItem.caseNo]) {
      return customOperationLogsMap[caseItem.caseNo];
    }
    if (caseItem.operationLogs && caseItem.operationLogs.length > 0) {
      return caseItem.operationLogs;
    }
    // 根据案件真实元数据生成生命周期操作审计记录（倒序排列）
    const logs: CaseOperationLog[] = [
      {
        id: `op-log-1-${caseItem.caseNo}`,
        seq: 1,
        operationType: '更新案件状态',
        module: '流程状态',
        operator: caseItem.agentName || '张锦程',
        operatorRole: '商标代理人',
        department: '品牌知产保护中心',
        operateTime: `${caseItem.registrationDate || caseItem.applyDate || '2026-08-15'} 16:30:00`,
        changeSummary: `更新案件注册状态为【${caseItem.status}】，最新办理进度【${caseItem.latestProgress || '核准注册并颁发证书'}】`,
        beforeValue: '审查中',
        afterValue: caseItem.status,
        ipAddress: '192.168.10.88',
        remarks: '流程流转正常，已同步更新商标监测预警规则'
      },
      {
        id: `op-log-2-${caseItem.caseNo}`,
        seq: 2,
        operationType: '更新处理事项',
        module: '处理事项',
        operator: caseItem.agentName || '张锦程',
        operatorRole: '商标代理人',
        department: '品牌知产保护中心',
        operateTime: '2026-08-10 11:20:15',
        changeSummary: '更新处理事项【商标注册申请】，状态标记为【已完成】，核稿分值【98分】',
        beforeValue: '处理中',
        afterValue: '已完成 (98分)',
        ipAddress: '192.168.10.88',
        remarks: '代理律所完成官方文书核验并归档'
      },
      {
        id: `op-log-3-${caseItem.caseNo}`,
        seq: 3,
        operationType: '上传使用证据',
        module: '使用证据',
        operator: '李沐',
        operatorRole: '品牌运营主管',
        department: '品牌知产保护中心',
        operateTime: '2026-07-25 14:15:30',
        changeSummary: `上传商标实际商业使用证据【电商平台产品包装与官方旗舰店上架销售截图.pdf】(3.8MB)`,
        afterValue: '新增使用证据 1 份',
        ipAddress: '192.168.10.105',
        remarks: '定期维护商标商业使用合规性，防范撤三风险'
      },
      {
        id: `op-log-4-${caseItem.caseNo}`,
        seq: 4,
        operationType: '变更申请人主体',
        module: '申请信息',
        operator: '陆燕丽',
        operatorRole: '知产合规主管',
        department: '品牌知产保护中心',
        operateTime: '2026-05-18 09:30:45',
        changeSummary: `变更申请人主体信息为【${caseItem.applicant}】，英文名【${caseItem.applicantEn || 'USMILE TECHNOLOGY CO., LTD.'}】`,
        beforeValue: '广州星际悦动网络科技有限公司',
        afterValue: caseItem.applicant,
        ipAddress: '192.168.10.92',
        remarks: '已同步向商标局提交申请人主体名义变更申报并落库变更历史'
      },
      {
        id: `op-log-5-${caseItem.caseNo}`,
        seq: 5,
        operationType: '新增处理事项',
        module: '处理事项',
        operator: caseItem.agentName || '张锦程',
        operatorRole: '商标代理人',
        department: '品牌知产保护中心',
        operateTime: '2026-03-01 10:00:20',
        changeSummary: '创建处理事项【实质审查意见答辩及补正】，设定内部期限【2026-06-15】，官方期限【2026-07-01】',
        afterValue: '新增处理事项：实质审查意见答辩及补正',
        ipAddress: '192.168.10.88',
        remarks: '系统根据官方实查节点自动触发新建事项提醒'
      },
      {
        id: `op-log-6-${caseItem.caseNo}`,
        seq: 6,
        operationType: '修改基本信息',
        module: '基本信息',
        operator: '系统自动',
        operatorRole: '系统自动服务',
        department: '自动文书解析引擎',
        operateTime: `${caseItem.applyDate || '2026-02-10'} 10:15:00`,
        changeSummary: `官方受理成功，自动回填官方申请号【${caseItem.applicationNo || 'TM78291044'}】，官方申请日【${caseItem.applyDate || '2026-02-10'}】`,
        beforeValue: '申请号：待获取',
        afterValue: `申请号：${caseItem.applicationNo || 'TM78291044'}`,
        ipAddress: '10.0.8.21 (知产数据中心)',
        remarks: '通过国家知识产权局电子回执自动解析入库'
      },
      {
        id: `op-log-7-${caseItem.caseNo}`,
        seq: 7,
        operationType: '上传电子文书',
        module: '文件列表',
        operator: '系统自动',
        operatorRole: '系统自动服务',
        department: '自动文书解析引擎',
        operateTime: `${caseItem.applyDate || '2026-02-10'} 10:15:10`,
        changeSummary: '自动归档官方文件【商标注册申请受理通知书.pdf】(1.4MB)，文书字号【TM-NOTIFY-20260210】',
        afterValue: '新增卷宗文书 1 份',
        ipAddress: '10.0.8.21 (知产数据中心)',
        remarks: '电子文书已自动验签并入库卷宗'
      },
      {
        id: `op-log-8-${caseItem.caseNo}`,
        seq: 8,
        operationType: '更新申请信息',
        module: '申请信息',
        operator: '陆燕丽',
        operatorRole: '知产合规专员',
        department: '品牌知产保护中心',
        operateTime: '2026-01-12 11:05:40',
        changeSummary: `指定代理机构【${caseItem.agencyName || '北京市柳沈律师事务所'}】，代理人【${caseItem.agentName || '张锦程'}】，生成官方委托书`,
        afterValue: `代理律所：${caseItem.agencyName || '北京市柳沈律师事务所'}，代理人：${caseItem.agentName || '张锦程'}`,
        ipAddress: '192.168.10.92',
        remarks: '代理委托协议与律所授权书已签署生效'
      },
      {
        id: `op-log-9-${caseItem.caseNo}`,
        seq: 9,
        operationType: '更新商品服务',
        module: '商品服务',
        operator: caseItem.agentName || '张锦程',
        operatorRole: '商标代理人',
        department: '法务合规部',
        operateTime: '2026-01-10 14:22:08',
        changeSummary: `录入并核定申报商品/服务清单共 ${(caseItem.goodsList?.length || 8)} 项，覆盖核心类目【${caseItem.classes}】`,
        afterValue: `核定类目：${caseItem.classes}，商品项：${caseItem.goodsItems || (caseItem.goodsList || []).join('、')}`,
        ipAddress: '192.168.10.88',
        remarks: '商品项符合尼斯分类标准第12版规范'
      },
      {
        id: `op-log-10-${caseItem.caseNo}`,
        seq: 10,
        operationType: '建案立案',
        module: '基本信息',
        operator: '陆燕丽',
        operatorRole: '知产专员',
        department: '品牌知产保护中心',
        operateTime: caseItem.applyTime || '2026-01-08 09:30:15',
        changeSummary: `创建商标申请案件，关联建案申请单【${caseItem.proposalNo}】，商标名称【${caseItem.trademarkName}】，申请类别【${caseItem.classes}】`,
        afterValue: `立案生成案号：${caseItem.caseNo}`,
        ipAddress: '192.168.10.92',
        remarks: '建案提案审批通过并自动转入案件管理台账'
      }
    ];

    return logs;
  };

  const addCaseOperationLog = (
    caseNo: string,
    log: Omit<CaseOperationLog, 'id' | 'seq' | 'operateTime'> & { operateTime?: string }
  ) => {
    const currentLogs = getCaseOperationLogs({ caseNo } as CaseManagementItem);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const defaultTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const newEntry: CaseOperationLog = {
      id: `op-log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      seq: currentLogs.length + 1,
      operationType: log.operationType,
      module: log.module,
      operator: log.operator || '张锦程',
      operatorRole: log.operatorRole || '商标代理人',
      department: log.department || '品牌知产保护中心',
      operateTime: log.operateTime || defaultTime,
      changeSummary: log.changeSummary,
      beforeValue: log.beforeValue,
      afterValue: log.afterValue,
      ipAddress: log.ipAddress || '192.168.10.88',
      remarks: log.remarks || '操作已记录并同步审计日志'
    };

    const updated = [newEntry, ...currentLogs];
    setCustomOperationLogsMap(prev => ({
      ...prev,
      [caseNo]: updated
    }));
  };

  const handleExportOperationLogsCsv = (logs: CaseOperationLog[], caseNo: string) => {
    const headers = ['序号', '操作类型', '所属模块', '操作内容与变更说明', '变更前内容', '变更后内容', '操作人', '操作人角色', '所属部门', '操作时间', '操作IP', '备注说明'];
    const rows = logs.map((l, idx) => [
      idx + 1,
      `"${(l.operationType || '').replace(/"/g, '""')}"`,
      `"${(l.module || '').replace(/"/g, '""')}"`,
      `"${(l.changeSummary || '').replace(/"/g, '""')}"`,
      `"${(l.beforeValue || '-').replace(/"/g, '""')}"`,
      `"${(l.afterValue || '-').replace(/"/g, '""')}"`,
      `"${(l.operator || '').replace(/"/g, '""')}"`,
      `"${(l.operatorRole || '').replace(/"/g, '""')}"`,
      `"${(l.department || '').replace(/"/g, '""')}"`,
      `"${(l.operateTime || '').replace(/"/g, '""')}"`,
      `"${(l.ipAddress || '').replace(/"/g, '""')}"`,
      `"${(l.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `案件【${caseNo}】信息操作记录_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('已成功导出该案件信息操作记录 CSV 文件！');
  };

  const handleOpenCreateHandlingTask = () => {
    setTaskFormData({
      taskName: '',
      status: '',
      stage: '',
      undertaker: '',
      entrustDate: '',
      draftDeadline: '',
      internalDeadline: '',
      officialDeadline: '',
      firstDraftDate: '',
      finalDraftDate: '',
      completionDate: '',
      reviewScore: '',
      searchDeadline: '',
      searchDate: '',
      remarks: ''
    });
    setEditingHandlingTask(null);
    setHandlingTaskModalMode('CREATE');
    setHandlingTaskDetailTab('info');
    setHandlingTaskModalOpen(true);
  };

  const handleOpenEditHandlingTask = (task: HandlingTask) => {
    setTaskFormData({
      taskName: task.taskName || '',
      status: task.status || '',
      stage: task.stage || '',
      undertaker: task.undertaker || task.handler || '',
      entrustDate: task.entrustDate || '',
      draftDeadline: task.draftDeadline || '',
      internalDeadline: task.internalDeadline || '',
      officialDeadline: task.officialDeadline || '',
      firstDraftDate: task.firstDraftDate || '',
      finalDraftDate: task.finalDraftDate || '',
      completionDate: task.completionDate || '',
      reviewScore: task.reviewScore !== undefined ? String(task.reviewScore) : '',
      searchDeadline: task.searchDeadline || '',
      searchDate: task.searchDate || '',
      remarks: task.remarks || ''
    });
    setEditingHandlingTask(task);
    setHandlingTaskModalMode('EDIT');
    setHandlingTaskDetailTab('info');
    setHandlingTaskModalOpen(true);
  };

  const handleOpenViewHandlingTask = (task: HandlingTask) => {
    setTaskFormData({
      taskName: task.taskName || '',
      status: task.status || '',
      stage: task.stage || '',
      undertaker: task.undertaker || task.handler || '',
      entrustDate: task.entrustDate || '',
      draftDeadline: task.draftDeadline || '',
      internalDeadline: task.internalDeadline || '',
      officialDeadline: task.officialDeadline || '',
      firstDraftDate: task.firstDraftDate || '',
      finalDraftDate: task.finalDraftDate || '',
      completionDate: task.completionDate || '',
      reviewScore: task.reviewScore !== undefined ? String(task.reviewScore) : '',
      searchDeadline: task.searchDeadline || '',
      searchDate: task.searchDate || '',
      remarks: task.remarks || ''
    });
    setEditingHandlingTask(task);
    setHandlingTaskModalMode('VIEW');
    setHandlingTaskDetailTab('info');
    setHandlingTaskModalOpen(true);
  };

  const handleSaveHandlingTask = () => {
    if (!selectedCaseForView) return;
    if (!taskFormData.taskName.trim()) {
      showToast('请选择或填写处理事项');
      return;
    }
    const currentList = getCaseHandlingTasks(selectedCaseForView);
    let updatedList: HandlingTask[] = [];

    const effectiveStatus = taskFormData.status.trim() || '待处理';
    const effectiveStage = taskFormData.stage.trim() || '实质审查阶段';

    if (handlingTaskModalMode === 'CREATE') {
      const newTask: HandlingTask = {
        id: `ht-user-${Date.now()}`,
        seq: currentList.length + 1,
        taskName: taskFormData.taskName.trim(),
        status: effectiveStatus,
        stage: effectiveStage,
        undertaker: taskFormData.undertaker,
        handler: taskFormData.undertaker,
        entrustDate: taskFormData.entrustDate,
        draftDeadline: taskFormData.draftDeadline,
        internalDeadline: taskFormData.internalDeadline,
        officialDeadline: taskFormData.officialDeadline,
        firstDraftDate: taskFormData.firstDraftDate,
        finalDraftDate: taskFormData.finalDraftDate,
        completionDate: taskFormData.completionDate,
        reviewScore: taskFormData.reviewScore,
        searchDeadline: taskFormData.searchDeadline,
        searchDate: taskFormData.searchDate,
        remarks: taskFormData.remarks
      };
      updatedList = [...currentList, newTask];
      addCaseOperationLog(selectedCaseForView.caseNo, {
        operationType: '新增处理事项',
        module: '处理事项',
        operator: selectedCaseForView.agentName || '张锦程',
        operatorRole: '商标代理人',
        department: '品牌知产保护中心',
        changeSummary: `新增处理事项【${newTask.taskName}】，阶段【${newTask.stage}】，承办人【${newTask.undertaker || '-'}】，内部期限【${newTask.internalDeadline || '-'}】`,
        afterValue: `事项名称：${newTask.taskName}，状态：${newTask.status}`,
        remarks: newTask.remarks || '手动新增处理事项并设定关键期限'
      });
      showToast(`成功新增处理事项：【${newTask.taskName}】`);
    } else if (handlingTaskModalMode === 'EDIT' && editingHandlingTask) {
      updatedList = currentList.map(item => item.id === editingHandlingTask.id ? {
        ...item,
        taskName: taskFormData.taskName.trim(),
        status: effectiveStatus,
        stage: effectiveStage,
        undertaker: taskFormData.undertaker,
        handler: taskFormData.undertaker,
        entrustDate: taskFormData.entrustDate,
        draftDeadline: taskFormData.draftDeadline,
        internalDeadline: taskFormData.internalDeadline,
        officialDeadline: taskFormData.officialDeadline,
        firstDraftDate: taskFormData.firstDraftDate,
        finalDraftDate: taskFormData.finalDraftDate,
        completionDate: taskFormData.completionDate,
        reviewScore: taskFormData.reviewScore,
        searchDeadline: taskFormData.searchDeadline,
        searchDate: taskFormData.searchDate,
        remarks: taskFormData.remarks
      } : item);
      addCaseOperationLog(selectedCaseForView.caseNo, {
        operationType: '更新处理事项',
        module: '处理事项',
        operator: selectedCaseForView.agentName || '张锦程',
        operatorRole: '商标代理人',
        department: '品牌知产保护中心',
        changeSummary: `更新处理事项【${taskFormData.taskName.trim()}】，状态变更为【${effectiveStatus}】，完成日【${taskFormData.completionDate || '-'}】`,
        beforeValue: `原状态：${editingHandlingTask.status || '未指定'}`,
        afterValue: `现状态：${effectiveStatus}，内部期限：${taskFormData.internalDeadline || '-'}`,
        remarks: taskFormData.remarks || '修改处理事项属性与进度记录'
      });
      showToast(`成功更新处理事项：【${taskFormData.taskName.trim()}】`);
    }

    // 重新计算 seq
    updatedList = updatedList.map((item, idx) => ({ ...item, seq: idx + 1 }));

    setCustomHandlingTasksMap({
      ...customHandlingTasksMap,
      [selectedCaseForView.caseNo]: updatedList
    });
    setHandlingTaskModalOpen(false);
  };

  const handleConfirmDeleteHandlingTask = () => {
    if (!selectedCaseForView || !deletingHandlingTask) return;
    const currentList = getCaseHandlingTasks(selectedCaseForView);
    const updatedList = currentList
      .filter(item => item.id !== deletingHandlingTask.id)
      .map((item, idx) => ({ ...item, seq: idx + 1 }));

    setCustomHandlingTasksMap({
      ...customHandlingTasksMap,
      [selectedCaseForView.caseNo]: updatedList
    });
    addCaseOperationLog(selectedCaseForView.caseNo, {
      operationType: '删除处理事项',
      module: '处理事项',
      operator: selectedCaseForView.agentName || '张锦程',
      operatorRole: '商标代理人',
      department: '品牌知产保护中心',
      changeSummary: `删除处理事项【${deletingHandlingTask.taskName}】（阶段：${deletingHandlingTask.stage}，承办人：${deletingHandlingTask.undertaker || '-'}）`,
      beforeValue: `处理事项：${deletingHandlingTask.taskName}`,
      afterValue: '已从事项列表中移除',
      remarks: '移除历史待办事项与时效预警'
    });
    showToast(`已删除处理事项：【${deletingHandlingTask.taskName}】`);
    setDeletingHandlingTask(null);
  };

  // 上传与删除使用证据 Modal 状态
  const [isUploadEvidenceModalOpen, setIsUploadEvidenceModalOpen] = useState(false);
  const [deletingEvidence, setDeletingEvidence] = useState<CaseEvidence | null>(null);
  const [evidenceSearchQuery, setEvidenceSearchQuery] = useState<string>('');
  const [uploadEvTitle, setUploadEvTitle] = useState('');
  const [uploadEvType, setUploadEvType] = useState('销售合同/报关单');
  const [uploadEvMarket, setUploadEvMarket] = useState('');
  const [uploadEvDate, setUploadEvDate] = useState(new Date().toISOString().slice(0, 10));
  const [uploadEvUploader, setUploadEvUploader] = useState('李沐');
  const [uploadEvRemarks, setUploadEvRemarks] = useState('');
  const [selectedUploadEvFile, setSelectedUploadEvFile] = useState<File | null>(null);

  // 关联维权单据详情弹窗状态
  const [selectedEnforcementForDetail, setSelectedEnforcementForDetail] = useState<EnforcementCase | null>(null);

  // 打开案件详情处理
  const handleOpenCaseDetail = (item: CaseManagementItem) => {
    setActiveCaseDetailTab('basic');
    setGoodsSearchQuery('');
    setQuickNewGoodsItem('');
    setIsEditingClasses(false);
    setIsClassDropdownOpen(false);
    setClassSearchKeyword('');
    const initialCodes = parseClassesToCodes(item.classes || '');
    setSelectedClassCodes(initialCodes);
    setEditingClassesInput(item.classes || '');
    setFileFilter('ALL');
    setDocCategoryFilter('ALL');
    setDocSearchQuery('');
    setCommTypeFilter('ALL');
    setEvidenceTypeFilter('ALL');
    setIsBatchDownloadMode(false);
    setSelectedDocIds([]);
    setSelectedCaseForView(item);
  };

  // 获取当前案件的卷宗文件列表 (支持企业文件、递交文件、官方文件、事务所文件、其他文件)
  const getCaseDocs = (item: CaseManagementItem): CaseOfficialDocument[] => {
    // 获取由【代理协同 - 待处理】确认同步而来的文件
    const syncedDocs = [
      ...getSyncedCaseDocs(item.id),
      ...getSyncedCaseDocs(item.caseNo)
    ];
    const uniqueSyncedDocs = syncedDocs.filter((doc, idx, arr) => arr.findIndex(d => d.id === doc.id) === idx);

    const custom = customDocsMap[item.id] || customDocsMap[item.caseNo];
    let baseList: CaseOfficialDocument[] = [];
    if (custom && custom.length > 0) {
      baseList = custom;
    } else if (item.documents && item.documents.length > 0 && item.documents.some(d => d.category)) {
      baseList = item.documents;
    } else {
      baseList = [
        {
          id: `doc-1-${item.id}`,
          title: `${item.applicant || '广州星际悦动股份有限公司'} 营业执照副本与法人主体资格证明文件`,
          type: 'PDF',
          docNumber: `ENT-2026-0801`,
          issueDate: '2026-08-01',
          size: '2.4 MB',
          category: '企业文件',
          uploader: '陆燕丽',
          remarks: '集团最新年检营业执照盖章件'
        },
        {
          id: `doc-2-${item.id}`,
          title: `${item.trademarkName} 商标代理授权委托书 (POA_官方签署盖章件)`,
          type: 'PDF',
          docNumber: `POA-2026-0810`,
          issueDate: '2026-08-10',
          size: '1.8 MB',
          category: '企业文件',
          uploader: '陆燕丽',
          remarks: '公证与领事认证扫描件'
        },
        {
          id: `doc-3-${item.id}`,
          title: `${item.trademarkName} 商标图样高清矢量文件 (黑白标准图稿)`,
          type: 'PNG',
          docNumber: `IMG-2026-0805`,
          issueDate: '2026-08-05',
          size: '3.5 MB',
          category: '企业文件',
          uploader: '张伟',
          remarks: '设计中心官方终稿'
        },
        {
          id: `doc-4-${item.id}`,
          title: `商标注册申请书 (${item.jurisdiction || '新加坡'} 官方呈报盖章版)`,
          type: 'PDF',
          docNumber: `SUB-2026-0812`,
          issueDate: '2026-08-12',
          size: '3.1 MB',
          category: '递交文件',
          uploader: item.agencyName || 'Allen & Gledhill LLP',
          remarks: '律所电子呈报确认件'
        },
        {
          id: `doc-5-${item.id}`,
          title: `核定商品服务规范项目表 (第${item.classes || '10'}类英文对照申报表)`,
          type: 'DOCX',
          docNumber: `SUB-2026-0813`,
          issueDate: '2026-08-13',
          size: '850 KB',
          category: '递交文件',
          uploader: item.agencyName || 'Allen & Gledhill LLP',
          remarks: '包含补正预案清单'
        },
        {
          id: `doc-6-${item.id}`,
          title: `优先权要求及首次申请国家原件证明书 (CNIPA 认证)`,
          type: 'PDF',
          docNumber: `PRI-2026-0814`,
          issueDate: '2026-08-14',
          size: '1.9 MB',
          category: '递交文件',
          uploader: '陆燕丽',
          remarks: '国内基础案优先权证明'
        },
        {
          id: `doc-7-${item.id}`,
          title: `官方受理通知书 (Official Filing Receipt - ${item.applicationNo || 'SG40202608'})`,
          type: 'PDF',
          docNumber: `OFF-SG-20260818`,
          issueDate: '2026-08-18',
          size: '1.2 MB',
          category: '官方文件',
          uploader: item.officialAgency || '知识产权主管局 (IPOS)',
          remarks: '官方申请号下发通知'
        },
        {
          id: `doc-8-${item.id}`,
          title: `官方电子规费扣款成功凭证与财务收据`,
          type: 'PDF',
          docNumber: `REC-2026-0819`,
          issueDate: '2026-08-19',
          size: '620 KB',
          category: '官方文件',
          uploader: item.officialAgency || '知识产权主管局 (IPOS)',
          remarks: '官方电子发票'
        },
        {
          id: `doc-9-${item.id}`,
          title: `律所商标显著性与海外检索评估分析报告`,
          type: 'PDF',
          docNumber: `AG-2026-SEARCH`,
          issueDate: '2026-08-08',
          size: '4.5 MB',
          category: '事务所文件',
          uploader: item.agencyName || 'Allen & Gledhill LLP',
          remarks: '包含同音近似风险评估'
        },
        {
          id: `doc-10-${item.id}`,
          title: `代理呈报委案确认函与律所规费账单 (Invoice)`,
          type: 'PDF',
          docNumber: `INV-2026-8809`,
          issueDate: '2026-08-12',
          size: '1.1 MB',
          category: '事务所文件',
          uploader: item.agencyName || 'Allen & Gledhill LLP',
          remarks: '财务付款请款单据'
        },
        {
          id: `doc-11-${item.id}`,
          title: `商标驳回复审对比检索与复审策略预案`,
          type: 'DOCX',
          docNumber: `OTH-2026-0820`,
          issueDate: '2026-08-20',
          size: '1.4 MB',
          category: '其他文件',
          uploader: '林悦',
          remarks: '法务内部备用预案'
        }
      ];
    }

    if (uniqueSyncedDocs.length === 0) {
      return baseList;
    }

    // 智能去重并优先展示协同同步的文件
    const mergedList = [
      ...uniqueSyncedDocs,
      ...baseList.filter(b => !uniqueSyncedDocs.some(s => s.id === b.id))
    ];
    return mergedList;
  };

  const renderDocCategoryBadge = (category?: string) => {
    const cat = category || '官方文件';
    switch (cat) {
      case '企业文件':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/80 whitespace-nowrap">企业文件</span>;
      case '递交文件':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap">递交文件</span>;
      case '官方文件':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">官方文件</span>;
      case '事务所文件':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">事务所文件</span>;
      case '其他文件':
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80 whitespace-nowrap">其他文件</span>;
    }
  };

  const handleOpenUploadModal = () => {
    setUploadFormCategory('官方文件');
    setUploadFormTitle('');
    setUploadFormDocNumber(`DOC${Date.now().toString().slice(-6)}`);
    setUploadFormType('PDF');
    setUploadFormDate(new Date().toISOString().slice(0, 10));
    setUploadFormUploader('陆燕丽');
    setUploadFormRemarks('');
    setSelectedUploadFile(null);
    setIsUploadDocModalOpen(true);
  };

  const handleConfirmUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseForView) return;

    const title = uploadFormTitle.trim() || selectedUploadFile?.name || '新上传卷宗文书.pdf';
    const fileBlob = selectedUploadFile || undefined;
    const fileUrl = selectedUploadFile ? URL.createObjectURL(selectedUploadFile) : undefined;
    const newDoc: CaseOfficialDocument = {
      id: `doc-${Date.now()}`,
      title,
      type: uploadFormType || (selectedUploadFile?.name.split('.').pop()?.toUpperCase() || 'PDF'),
      docNumber: uploadFormDocNumber.trim() || `DOC${Date.now().toString().slice(-6)}`,
      issueDate: uploadFormDate || new Date().toISOString().slice(0, 10),
      size: selectedUploadFile ? `${(selectedUploadFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB',
      category: uploadFormCategory,
      uploader: uploadFormUploader.trim() || '当前用户',
      remarks: uploadFormRemarks.trim(),
      fileUrl,
      fileBlob
    };

    const currentDocs = getCaseDocs(selectedCaseForView);
    const updatedDocs = [newDoc, ...currentDocs];

    setCustomDocsMap(prev => ({ ...prev, [selectedCaseForView.id]: updatedDocs }));
    const updatedCase = { ...selectedCaseForView, documents: updatedDocs };
    setSelectedCaseForView(updatedCase);
    onUpdateCase?.(updatedCase);

    addCaseOperationLog(selectedCaseForView.caseNo, {
      operationType: '上传电子文书',
      module: '文件列表',
      operator: uploadFormUploader.trim() || '陆燕丽',
      operatorRole: '知产合规专员',
      department: '品牌知产保护中心',
      changeSummary: `上传卷宗电子文件【${title}】（分类：${uploadFormCategory}，文号：${newDoc.docNumber || '-'}）`,
      afterValue: `新增文书：${title} (${newDoc.size})`,
      remarks: uploadFormRemarks.trim() || '上传卷宗官方/往来文书'
    });

    showToast(`已成功上传【${uploadFormCategory}】：${title}`);
    setIsUploadDocModalOpen(false);
  };

  const generateOriginalFileBlob = (doc: CaseOfficialDocument): { url: string; blob: Blob; filename: string } => {
    const ext = (doc.type || doc.title.split('.').pop() || 'pdf').toLowerCase();
    const isImg = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) ||
      Boolean(doc.title.match(/\.(png|jpe?g|webp|gif|svg)$/i));

    if (isImg) {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, canvas.width, 80);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(doc.title, 40, 50);

        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(40, 110, canvas.width - 80, 600);
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 110, canvas.width - 80, 600);

        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(doc.title, canvas.width / 2, 340);

        ctx.fillStyle = '#64748B';
        ctx.font = '20px sans-serif';
        ctx.fillText(`原件文书编号: ${doc.docNumber || 'EV-ORIGINAL'} | 归档日期: ${doc.issueDate}`, canvas.width / 2, 410);
        ctx.fillText(`分类: ${doc.category || '使用证据源文件'} | 归档人: ${doc.uploader || '系统归档'}`, canvas.width / 2, 450);

        if (doc.remarks) {
          ctx.fillStyle = '#334155';
          ctx.font = '18px sans-serif';
          ctx.fillText(`备注: ${doc.remarks}`, canvas.width / 2, 500);
        }

        ctx.save();
        ctx.translate(canvas.width - 200, 620);
        ctx.rotate((-12 * Math.PI) / 180);
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 70, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', 0, -18);
        ctx.fillText('商标商业使用证据归档章', 0, 8);
        ctx.fillText(doc.issueDate, 0, 30);
        ctx.restore();
      }

      const dataUrl = canvas.toDataURL('image/png');
      const byteString = atob(dataUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      return { url, blob, filename: `${doc.title}.png` };
    } else {
      const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${doc.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px; }
    .doc-card { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); padding: 48px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
    .subtitle { font-size: 13px; color: #64748b; margin-top: 6px; font-family: monospace; }
    .badge { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 28px; font-size: 13px; }
    .meta-item { display: flex; flex-direction: column; gap: 4px; }
    .meta-label { color: #64748b; font-size: 12px; }
    .meta-val { color: #0f172a; font-weight: 600; }
    .content-box { border: 1px dashed #94a3b8; background: #fafafa; padding: 24px; border-radius: 8px; font-size: 14px; line-height: 1.8; color: #334155; margin-bottom: 40px; }
    .seal { text-align: right; margin-top: 40px; position: relative; }
    .seal-stamp { display: inline-block; width: 140px; height: 140px; border: 3px solid #dc2626; border-radius: 50%; color: #dc2626; text-align: center; padding: 12px; box-sizing: border-box; transform: rotate(-10deg); }
    .seal-star { font-size: 20px; }
    .seal-text { font-size: 11px; font-weight: bold; margin: 4px 0; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="doc-card">
    <div class="header">
      <div>
        <h1 class="title">${doc.title}</h1>
        <div class="subtitle">档案编号: ${doc.docNumber} | 归档日期: ${doc.issueDate}</div>
      </div>
      <span class="badge">${doc.category || '使用证据源文件'}</span>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><span class="meta-label">文件名称</span><span class="meta-val">${doc.title}</span></div>
      <div class="meta-item"><span class="meta-label">格式 / 大小</span><span class="meta-val">${doc.type || 'PDF'} (${doc.size || '原件'})</span></div>
      <div class="meta-item"><span class="meta-label">上传 / 归档人</span><span class="meta-val">${doc.uploader || '李沐'}</span></div>
      <div class="meta-item"><span class="meta-label">归档说明 / 备注</span><span class="meta-val">${doc.remarks || '真实原始证据凭证已核对备案'}</span></div>
    </div>

    <div class="content-box">
      <h3 style="margin-top:0; color:#0f172a; font-size:15px;">证据文书原件正文及备案说明</h3>
      <p>本电子文件为商标管理系统归档之<strong>${doc.title}</strong>原始证据扫描件。已完成形式审查与归档登记，可用于国内/海外商标注册、异议答辩及海关备案等程序。</p>
    </div>

    <div class="seal">
      <div class="seal-stamp">
        <div class="seal-star">★</div>
        <div class="seal-text">知产管理系统</div>
        <div class="seal-text">电子档案专用章</div>
        <div style="font-size:9px; font-family:monospace;">${doc.issueDate}</div>
      </div>
    </div>

    <div class="footer">
      商标使用证据管理库 · 档案编号: ${doc.docNumber}
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      return { url, blob, filename: `${doc.title}.html` };
    }
  };

  const handleOpenDocPreview = (doc: CaseOfficialDocument) => {
    let preparedDoc = doc;
    if (!doc.fileUrl && !doc.fileBlob) {
      const generated = generateOriginalFileBlob(doc);
      preparedDoc = {
        ...doc,
        fileUrl: generated.url,
        fileBlob: generated.blob
      };
    }
    setPreviewingDoc(preparedDoc);
    setPreviewZoom(100);
    setActiveSlideIndex(0);
    setArchiveSubFilePreview(null);
    setSpreadsheetActiveTab('sheet1');
  };

  const handleConfirmDeleteDoc = () => {
    if (!selectedCaseForView || !deletingDoc) return;
    const docId = deletingDoc.id;
    const docTitle = deletingDoc.title;
    const currentDocs = getCaseDocs(selectedCaseForView);
    const updatedDocs = currentDocs.filter(d => d.id !== docId);

    setCustomDocsMap(prev => ({ ...prev, [selectedCaseForView.id]: updatedDocs }));
    const updatedCase = { ...selectedCaseForView, documents: updatedDocs };
    setSelectedCaseForView(updatedCase);
    onUpdateCase?.(updatedCase);

    addCaseOperationLog(selectedCaseForView.caseNo, {
      operationType: '删除电子文书',
      module: '文件列表',
      operator: '张锦程',
      operatorRole: '知产法务',
      department: '品牌知产保护中心',
      changeSummary: `从案件卷宗中删除电子文书【${docTitle}】`,
      beforeValue: `文书档案：${docTitle}`,
      afterValue: '已从卷宗中移除',
      remarks: '人工清理/作废历史电子文书'
    });

    showToast(`已成功删除卷宗文件：${docTitle}`);
    setDeletingDoc(null);
  };

  const handleOpenUploadEvidenceModal = () => {
    if (!selectedCaseForView) return;
    setUploadEvTitle('');
    setUploadEvType('销售合同/报关单');
    setUploadEvMarket(selectedCaseForView.jurisdiction || '中国');
    setUploadEvDate(new Date().toISOString().slice(0, 10));
    setUploadEvUploader('李沐');
    setUploadEvRemarks('');
    setSelectedUploadEvFile(null);
    setIsUploadEvidenceModalOpen(true);
  };

  const handleConfirmUploadEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseForView) return;

    const title = uploadEvTitle.trim() || selectedUploadEvFile?.name || '新上传商标使用证据文件';
    const fileBlob = selectedUploadEvFile || undefined;
    const fileUrl = selectedUploadEvFile ? URL.createObjectURL(selectedUploadEvFile) : undefined;
    const fileType = selectedUploadEvFile 
      ? selectedUploadEvFile.name.split('.').pop()?.toUpperCase() || 'PDF'
      : 'PDF';

    const newEv: CaseEvidence = {
      id: `ev-${Date.now()}`,
      title,
      evidenceType: uploadEvType || '销售合同/报关单',
      market: uploadEvMarket.trim() || selectedCaseForView.jurisdiction || '通用市场',
      uploadDate: uploadEvDate || new Date().toISOString().slice(0, 10),
      fileSize: selectedUploadEvFile ? `${(selectedUploadEvFile.size / (1024 * 1024)).toFixed(1)} MB` : '3.2 MB',
      status: 'VERIFIED',
      type: fileType,
      docNumber: `EV${Date.now().toString().slice(-6)}`,
      uploader: uploadEvUploader.trim() || '李沐',
      remarks: uploadEvRemarks.trim(),
      fileUrl,
      fileBlob
    };

    const currentEvs = getCaseEvidences(selectedCaseForView);
    const updatedEvs = [newEv, ...currentEvs];
    setCustomEvidencesMap(prev => ({ ...prev, [selectedCaseForView.id]: updatedEvs }));

    addCaseOperationLog(selectedCaseForView.caseNo, {
      operationType: '上传使用证据',
      module: '使用证据',
      operator: uploadEvUploader.trim() || '李沐',
      operatorRole: '品牌运营主管',
      department: '品牌知产保护中心',
      changeSummary: `上传商标使用证据【${title}】（类型：${uploadEvType}，市场：${newEv.market}）`,
      afterValue: `新增使用证据：${title} (${newEv.fileSize})`,
      remarks: uploadEvRemarks.trim() || '维护商标商业使用合规证据'
    });

    showToast(`已成功上传商标使用证据：${title}`);
    setIsUploadEvidenceModalOpen(false);
  };

  const handleConfirmDeleteEvidence = () => {
    if (!selectedCaseForView || !deletingEvidence) return;
    const evId = deletingEvidence.id;
    const evTitle = deletingEvidence.title;
    const currentEvs = getCaseEvidences(selectedCaseForView);
    const updatedEvs = currentEvs.filter(e => e.id !== evId);

    setCustomEvidencesMap(prev => ({ ...prev, [selectedCaseForView.id]: updatedEvs }));
    
    addCaseOperationLog(selectedCaseForView.caseNo, {
      operationType: '删除使用证据',
      module: '使用证据',
      operator: '李沐',
      operatorRole: '品牌运营主管',
      department: '品牌知产保护中心',
      changeSummary: `从案件证据库中删除使用证据【${evTitle}】`,
      beforeValue: `使用证据：${evTitle}`,
      afterValue: '已从证据库中移除',
      remarks: '清理过期或无效使用证据'
    });

    showToast(`已成功删除使用证据：${evTitle}`);
    setDeletingEvidence(null);
  };

  // 触发真实文件下载：如果存在真实上传的物理源文件 (fileBlob / fileUrl)，直接下载原文件！
  const triggerDownloadDoc = (doc: CaseOfficialDocument) => {
    const extension = doc.type?.toLowerCase() || 'pdf';
    const cleanTitle = doc.title.replace(/[\\/:*?"<>|]/g, '_');
    const filename = cleanTitle.toLowerCase().endsWith(`.${extension}`) 
      ? cleanTitle 
      : `${cleanTitle}.${extension}`;

    // 0. 优先下载物理上传的原文件（如果用户上传了文件原件）
    if (doc.fileBlob) {
      const url = URL.createObjectURL(doc.fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    if (doc.fileUrl) {
      const a = document.createElement('a');
      a.href = doc.fileUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const caseInfo = selectedCaseForView 
      ? {
          caseNo: selectedCaseForView.caseNo,
          trademarkName: selectedCaseForView.trademarkName,
          applicant: selectedCaseForView.applicant || '广州星际悦动股份有限公司',
          jurisdiction: selectedCaseForView.jurisdiction || '中国',
          classes: selectedCaseForView.classes || '10',
          goodsItems: selectedCaseForView.goodsItems || '电动牙刷、牙齿清洁器具、医用冲牙器、口腔治疗仪器',
          agencyName: selectedCaseForView.agencyName || 'Allen & Gledhill LLP',
          officialAgency: selectedCaseForView.officialAgency || '国家知识产权局商标局',
        }
      : {
          caseNo: 'TM-2026-SG01',
          trademarkName: 'USMILE',
          applicant: '广州星际悦动股份有限公司',
          jurisdiction: '中国',
          classes: '10',
          goodsItems: '电动牙刷、牙齿清洁器具、医用冲牙器、口腔治疗仪器',
          agencyName: 'Allen & Gledhill LLP',
          officialAgency: '国家知识产权局商标局',
        };

    // 1. PDF 格式：按文书真实原件外观渲染（无外框框架包装，纯粹正本文书）
    if (extension === 'pdf') {
      const canvas = document.createElement('canvas');
      canvas.width = 1240; // A4 @ 150dpi width
      canvas.height = 1754; // A4 @ 150dpi height
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 官方发文原件（例如《商标注册申请受理通知书》）
        if (doc.category === '官方文件') {
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.arc(canvas.width / 2, 130, 36, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FBBF24';
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('★', canvas.width / 2, 142);

          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 36px "SimSun", "Songti SC", serif';
          ctx.fillText(caseInfo.officialAgency, canvas.width / 2, 210);

          ctx.font = 'bold 42px "SimSun", "Songti SC", serif';
          ctx.fillText(doc.title, canvas.width / 2, 280);

          ctx.beginPath();
          ctx.moveTo(100, 310);
          ctx.lineTo(canvas.width - 100, 310);
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.textAlign = 'left';
          ctx.font = '22px "SimSun", "Songti SC", serif';
          ctx.fillStyle = '#334155';
          ctx.fillText(`发文字号：国知商标字 [2026] 第 ${doc.docNumber} 号`, 100, 350);
          ctx.fillText(`发文日期：${doc.issueDate}`, canvas.width - 400, 350);

          ctx.font = 'bold 24px "SimSun", "Songti SC", serif';
          ctx.fillStyle = '#0F172A';
          ctx.fillText(`致：${caseInfo.applicant} / ${caseInfo.agencyName}`, 100, 420);

          ctx.font = '22px "SimSun", "Songti SC", serif';
          ctx.fillStyle = '#1E293B';
          const p1 = `根据《商标法》及《商标法实施细则》之规定，经形式审查，你单位于 ${doc.issueDate} 提交的下列商标注册申请，手续齐备，符合法定呈报要求，现依法予以受理并进入实质审查程序。`;
          ctx.fillText(p1.slice(0, 38), 100, 470);
          ctx.fillText(p1.slice(38), 100, 505);

          // 标的数据核验表格
          ctx.strokeRect(100, 550, canvas.width - 200, 260);
          ctx.fillStyle = '#F8FAFC';
          ctx.fillRect(100, 550, canvas.width - 200, 260);

          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 22px "PingFang SC", sans-serif';
          ctx.fillText(`申请号 / 注册号：${selectedCaseForView?.applicationNo || 'SG40202608'}`, 130, 600);
          ctx.fillText(`目标法域：${caseInfo.jurisdiction}`, 650, 600);
          ctx.fillText(`商标图样：${caseInfo.trademarkName}`, 130, 660);
          ctx.fillText(`核定类别：第 ${caseInfo.classes} 类`, 130, 720);
          ctx.fillText(`指定商品/服务：${caseInfo.goodsItems}`, 130, 770);

          ctx.font = '22px "SimSun", "Songti SC", serif';
          ctx.fillText('特此通知。请据此保留本副本，后续审查意见通知书（Office Action）将通过系统下发。', 100, 870);

          // 官方红章
          ctx.save();
          ctx.translate(canvas.width - 260, 1020);
          ctx.rotate((-12 * Math.PI) / 180);
          ctx.strokeStyle = '#DC2626';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, 85, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#DC2626';
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('★', 0, -30);
          ctx.fillText(caseInfo.officialAgency, 0, 0);
          ctx.fillText('电子送达专用章', 0, 28);
          ctx.fillText(doc.issueDate, 0, 50);
          ctx.restore();
        } else if (doc.category === '企业文件') {
          // 企业授权委托书 / 企业文件
          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 42px "SimSun", "Songti SC", serif';
          ctx.textAlign = 'center';
          ctx.fillText(doc.title, canvas.width / 2, 160);
          ctx.font = '20px sans-serif';
          ctx.fillStyle = '#64748B';
          ctx.fillText('POWER OF ATTORNEY', canvas.width / 2, 200);

          ctx.beginPath();
          ctx.moveTo(100, 230);
          ctx.lineTo(canvas.width - 100, 230);
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.textAlign = 'left';
          ctx.font = '24px "SimSun", "Songti SC", serif';
          ctx.fillStyle = '#0F172A';
          ctx.fillText(`委托人：${caseInfo.applicant}`, 100, 300);
          ctx.fillText(`受托人（代理机构）：${caseInfo.agencyName}`, 100, 350);

          ctx.font = '22px "SimSun", "Songti SC", serif';
          ctx.fillStyle = '#1E293B';
          ctx.fillText(`委托人现郑重授权受托人作为全权代理人，代为办理商标【${caseInfo.trademarkName}】`, 100, 420);
          ctx.fillText(`（指定类别：第 ${caseInfo.classes} 类）在【${caseInfo.jurisdiction}】知识产权主管机关的所有商标注册申请、`, 100, 460);
          ctx.fillText('补正答辩、异议、行政复议及相关全流程法律事务。代理人有权签署相关文件、缴纳官费', 100, 500);
          ctx.fillText('及接收官方下发之全部法律文书。本委托书自签署之日起生效。', 100, 540);

          ctx.fillText(`签署日期：${doc.issueDate}`, 100, 720);
          ctx.fillText(`委托人盖章：${caseInfo.applicant}`, canvas.width - 550, 720);

          // 企业公章
          ctx.save();
          ctx.translate(canvas.width - 260, 780);
          ctx.rotate((-10 * Math.PI) / 180);
          ctx.strokeStyle = '#DC2626';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 80, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#DC2626';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('★', 0, -25);
          ctx.fillText(caseInfo.applicant, 0, 0);
          ctx.fillText('知产与合同专用章', 0, 25);
          ctx.restore();
        } else {
          // 其他分类文件
          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 36px "SimSun", "Songti SC", serif';
          ctx.textAlign = 'center';
          ctx.fillText(doc.title, canvas.width / 2, 160);

          ctx.textAlign = 'left';
          ctx.font = '22px "SimSun", "Songti SC", serif';
          ctx.fillStyle = '#334155';
          ctx.fillText(`文书编号：${doc.docNumber}`, 100, 240);
          ctx.fillText(`归档时间：${doc.issueDate}`, 100, 280);
          ctx.fillText(`案件编号：${caseInfo.caseNo} (${caseInfo.trademarkName})`, 100, 320);
          ctx.fillText(`申请人：${caseInfo.applicant}`, 100, 360);
          ctx.fillText(`备注说明：${doc.remarks || '官方备案与卷宗扫描件'}`, 100, 400);
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        pdf.save(filename);
        return;
      }
    }

    // 2. PNG / JPG 格式：生成干净纯粹的图片原件
    if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 72px "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(caseInfo.trademarkName, canvas.width / 2, canvas.height / 2 - 20);

        ctx.fillStyle = '#64748B';
        ctx.font = '24px sans-serif';
        ctx.fillText(`商标图样原稿 | 第 ${caseInfo.classes} 类 | 权利人: ${caseInfo.applicant}`, canvas.width / 2, canvas.height / 2 + 60);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }
        }, extension === 'png' ? 'image/png' : 'image/jpeg');
        return;
      }
    }

    // 3. DOCX 格式：生成 Word 文档
    if (extension === 'docx' || extension === 'doc') {
      const docxContent = `<html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${doc.title}</title>
<style>
body { font-family: 'SimSun', 'Microsoft YaHei', sans-serif; padding: 40px; line-height: 1.8; color: #0f172a; }
h1 { font-size: 22px; text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; }
.meta { font-size: 14px; margin: 20px 0; }
.content { font-size: 15px; margin-top: 20px; text-indent: 2em; }
</style>
</head>
<body>
<h1>${doc.title}</h1>
<div class="meta">
  <p><strong>文书编号：</strong> ${doc.docNumber}</p>
  <p><strong>发文/签署日期：</strong> ${doc.issueDate}</p>
  <p><strong>关联案件编号：</strong> ${caseInfo.caseNo}</p>
  <p><strong>商标名称：</strong> ${caseInfo.trademarkName} (第 ${caseInfo.classes} 类)</p>
  <p><strong>申请人 / 权利人：</strong> ${caseInfo.applicant}</p>
</div>
<div class="content">
  <p>兹确认本文件【${doc.title}】为案件 ${caseInfo.caseNo} 之正本归档文件，相关条文及附件均已完成审查核验。</p>
  <p>${doc.remarks ? `备注说明：${doc.remarks}` : ''}</p>
</div>
</body>
</html>`;

      const blob = new Blob([docxContent], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }

    // 4. XLSX 格式
    if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
      const excelContent = `<html xmlns:o="urn:schemas-microsoft-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8">
<style>
table { border-collapse: collapse; width: 100%; }
th { background-color: #0f172a; color: #ffffff; border: 1px solid #334155; padding: 8px; text-align: left; }
td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
</style>
</head>
<body>
<table>
  <thead>
    <tr>
      <th>文书编号</th>
      <th>文书标题</th>
      <th>文件类别</th>
      <th>发文/归档日期</th>
      <th>关联案件号</th>
      <th>商标名称</th>
      <th>申请人</th>
      <th>备注说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>${doc.docNumber}</td>
      <td>${doc.title}</td>
      <td>${doc.category || '官方文件'}</td>
      <td>${doc.issueDate}</td>
      <td>${caseInfo.caseNo}</td>
      <td>${caseInfo.trademarkName}</td>
      <td>${caseInfo.applicant}</td>
      <td>${doc.remarks || ''}</td>
    </tr>
  </tbody>
</table>
</body>
</html>`;

      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }

    // 5. TXT 文本格式
    const textContent = `${doc.title}
======================================================================
文书编号: ${doc.docNumber}
发文/归档日期: ${doc.issueDate}
关联案件: ${caseInfo.caseNo} (${caseInfo.trademarkName})
申请人/权利人: ${caseInfo.applicant}
目标法域/类别: ${caseInfo.jurisdiction} (第 ${caseInfo.classes} 类)
----------------------------------------------------------------------
【正文说明】
本文件为 ${doc.title} 之正式备案文本。
${doc.remarks ? `备注说明: ${doc.remarks}` : ''}
======================================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // 执行勾选文件的批量下载
  const handleExecuteBatchDownload = () => {
    if (!selectedCaseForView || selectedDocIds.length === 0) {
      showToast('请至少选择一个需要下载的卷宗文件');
      return;
    }
    const currentDocs = getCaseDocs(selectedCaseForView);
    const docsToDownload = currentDocs.filter(d => selectedDocIds.includes(d.id));

    docsToDownload.forEach((doc, idx) => {
      setTimeout(() => {
        triggerDownloadDoc(doc);
      }, idx * 250);
    });

    showToast(`已开始批量下载已勾选的 ${docsToDownload.length} 个卷宗文件`);
    setIsBatchDownloadMode(false);
    setSelectedDocIds([]);
  };

  // 获取当前案件的往来信息
  const getCaseComms = (item: CaseManagementItem): CaseCommunication[] => {
    const custom = customCommsMap[item.id];
    if (custom && custom.length > 0) return custom;
    if (item.communications && item.communications.length > 0) return item.communications;
    return [
      {
        id: `comm-1-${item.id}`,
        sender: item.agencyName || 'Allen & Gledhill LLP',
        receiver: '知识产权部 - 陆燕丽',
        title: `【官方递交确认及受理通知】关于案件 ${item.caseNo} (${item.trademarkName}) 的进展`,
        date: item.applyDate ? `${item.applyDate} 10:30` : '2026-08-18 10:30',
        type: 'MAIL',
        summary: `尊敬的陆女士：我所已于今日完成案件 ${item.caseNo} 在 ${item.jurisdiction} 知识产权主管局的电子呈报。官方申请号为 ${item.applicationNo || 'SG4020260813401'}，核定分类 ${item.classes}。特此通知。`,
        hasAttachment: true,
        attachmentName: `Filing_Receipt_${item.caseNo}.pdf`
      },
      {
        id: `comm-2-${item.id}`,
        sender: '知识产权部 - 陆燕丽',
        receiver: item.agencyName || 'Allen & Gledhill LLP',
        title: `【委托盖章确认】关于 ${item.trademarkName} 代理授权书(POA)与规费支付`,
        date: '2026-08-14 16:15',
        type: 'LETTER',
        summary: `附件为我司盖章的官方代理授权委任书(POA)，规费已通过财务托收支付，请贵所收到后安排官方缴款与递交。`,
        hasAttachment: true,
        attachmentName: `Signed_POA_${item.caseNo}.pdf`
      },
      {
        id: `comm-3-${item.id}`,
        sender: item.officialAgency || '知识产权主管局 (IPOS)',
        receiver: item.agencyName || 'Allen & Gledhill LLP',
        title: `【官方卷宗受理通知】申请案号回执与电子规费扣款成功确认函`,
        date: '2026-08-19 09:00',
        type: 'OFFICIAL',
        summary: `知识产权局已接收申请人 ${item.applicant} 发起的第 ${item.classes} 类商标 ${item.trademarkName} 注册申请。案件已被正式立卷并转入形式审查流程。`,
        hasAttachment: true,
        attachmentName: `Official_Receipt_${item.applicationNo || 'SG402026'}.pdf`
      }
    ];
  };

  // 渲染维权类型标签
  const renderEnforcementTypeBadge = (type: string) => {
    switch (type) {
      case 'REFUSAL_REVIEW':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">驳回复查</span>;
      case 'OPPOSITION':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">商标异议</span>;
      case 'INVALIDATION':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">无效宣告</span>;
      case 'NON_USE_REVOCATION':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">撤三申请</span>;
      case 'DEFENSE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">答辩维权</span>;
      case 'STANDARDS':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">达标审查</span>;
      case 'CUSTOMS':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">海关查扣</span>;
      case 'LITIGATION':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">诉讼纠纷</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">{type}</span>;
    }
  };

  // 获取当前案件的关联维权管理单据
  const getCaseEnforcementTickets = (item: CaseManagementItem): EnforcementCase[] => {
    const custom = customEnforcementMap[item.id];
    if (custom && custom.length > 0) return custom;
    // 从 INITIAL_ENFORCEMENT_CASES 中匹配关联该商标或同品牌的维权案件
    const matched = INITIAL_ENFORCEMENT_CASES.filter(c => 
      (c.ourTrademark && c.ourTrademark.toLowerCase().includes(item.trademarkName.toLowerCase())) ||
      (item.brand && c.ourTrademark && c.ourTrademark.includes(item.brand)) ||
      (item.registrationNo && c.ourTrademark && c.ourTrademark.includes(item.registrationNo))
    );
    if (matched.length > 0) return matched;
    // 如果暂无完全匹配，返回针对当前商标的典型维权记录（异议与扫障单据）
    return [
      {
        id: `ENF-${item.id}-1`,
        caseNo: `YY-202608-${item.id.slice(-2)}1`,
        type: 'OPPOSITION' as EnforcementCaseType,
        targetTrademark: `仿冒标的 ${item.trademarkName}`,
        targetRegNo: `78921${item.id.slice(-3)}`,
        targetApplicant: '广州市某日用品科技有限公司',
        ourTrademark: `${item.trademarkName} (注册号: ${item.registrationNo || item.applicationNo || '核心案'})`,
        classes: [21, 10],
        jurisdiction: 'CN',
        riskLevel: 'HIGH',
        status: 'UNDER_HEARING',
        handler: '林悦 (维权法务)',
        lawFirm: '北京市柳沈律师事务所',
        filingDeadline: '2026-10-15',
        budget: 8500,
        groundsSummary: `针对第78921${item.id.slice(-3)}号商标初审公告提异议：侵权标的与我司【${item.trademarkName}】近似，极易造成消费者混淆与误认。`,
        progressPercent: 65
      },
      {
        id: `ENF-${item.id}-2`,
        caseNo: `CS-202607-${item.id.slice(-2)}2`,
        type: 'NON_USE_REVOCATION' as EnforcementCaseType,
        targetTrademark: `${item.trademarkName} Pro`,
        targetRegNo: `45120${item.id.slice(-3)}`,
        targetApplicant: '义乌市某商贸有限公司',
        ourTrademark: item.trademarkName,
        classes: [21],
        jurisdiction: 'CN',
        riskLevel: 'MEDIUM',
        status: 'SUBMITTED',
        handler: '唐宁 (法务主管)',
        lawFirm: '广州三环专利商标代理有限公司',
        filingDeadline: '2026-09-30',
        budget: 4200,
        groundsSummary: `提起连续三年不使用撤销申请(撤三扫障)：为我司【${item.trademarkName}】扫清在先阻碍商标。`,
        progressPercent: 30
      }
    ];
  };

  // 获取当前案件的相关案件
  const getCaseRelated = (item: CaseManagementItem): RelatedCase[] => {
    const custom = customRelatedMap[item.id];
    if (custom && custom.length > 0) return custom;
    if (item.relatedCases && item.relatedCases.length > 0) return item.relatedCases;
    return [
      {
        id: `rel-1-${item.id}`,
        caseNo: `TM20260810${item.id.slice(-3)}`,
        proposalNo: item.proposalNo,
        relationType: '同源国内基础案',
        trademarkName: item.trademarkName,
        jurisdiction: '中国 (CNIPA)',
        classes: item.classes,
        status: 'REGISTERED',
        applyDate: '2025-11-10'
      },
      {
        id: `rel-2-${item.id}`,
        caseNo: `TM20260901${item.id.slice(-3)}`,
        proposalNo: item.proposalNo,
        relationType: '马德里国际延伸领土指定案',
        trademarkName: item.trademarkName,
        jurisdiction: '欧盟 (EUIPO) / 日本 (JPO)',
        classes: item.classes,
        status: 'EXAMINING',
        applyDate: '2026-07-01'
      },
      {
        id: `rel-3-${item.id}`,
        caseNo: `TM20260915${item.id.slice(-3)}`,
        proposalNo: item.proposalNo,
        relationType: '防御性跨类保护申请',
        trademarkName: item.trademarkName,
        jurisdiction: item.jurisdiction,
        classes: '第21类、第35类',
        status: 'APPLYING',
        applyDate: '2026-08-10'
      }
    ];
  };

  // 获取当前案件的使用证据
  const getCaseEvidences = (item: CaseManagementItem): CaseEvidence[] => {
    const custom = customEvidencesMap[item.id];
    if (custom) return custom;
    if (item.evidences && item.evidences.length > 0) return item.evidences;
    return [
      {
        id: `ev-1-${item.id}`,
        title: `${item.brand} ${item.trademarkName} 2026年Q2 东南亚Shopee/Lazada订单及报关单据`,
        evidenceType: '销售合同/报关单',
        market: item.jurisdiction,
        uploadDate: '2026-08-12',
        fileSize: '3.8 MB',
        status: 'VERIFIED',
        proofUrl: '#',
        type: 'PDF',
        docNumber: `EV2026081201`,
        uploader: '系统归档',
        remarks: '海关出口申报凭证与销售结算对账单'
      },
      {
        id: `ev-2-${item.id}`,
        title: `${item.trademarkName} 智能口腔护理硬件实物外包装盒六面图及激光铭牌`,
        evidenceType: '产品包装图样',
        market: item.jurisdiction,
        uploadDate: '2026-08-10',
        fileSize: '5.2 MB',
        status: 'VERIFIED',
        proofUrl: '#',
        type: 'PNG',
        docNumber: `EV2026081002`,
        uploader: '李沐',
        remarks: '产品包材印刷样张与实物贴标照'
      },
      {
        id: `ev-3-${item.id}`,
        title: `2026国际消费电子展(CES/IFA) 现场品牌展位宣传图与产品手册`,
        evidenceType: '展会/广告宣传',
        market: '全球 / 海外重点市场',
        uploadDate: '2026-07-28',
        fileSize: '2.1 MB',
        status: 'VERIFIED',
        proofUrl: '#',
        type: 'PDF',
        docNumber: `EV2026072803`,
        uploader: '市场部专员',
        remarks: '海外展会画册与现场特装展位拍摄'
      }
    ];
  };

  // 维护商品与注册档案临时编辑状态
  const [editingGoodsList, setEditingGoodsList] = useState<string[]>([]);
  const [newGoodItemInput, setNewGoodItemInput] = useState('');
  const [editingCaseInfo, setEditingCaseInfo] = useState<Partial<CaseManagementItem>>({});



  // 勾选导出数据状态
  const [isExportMode, setIsExportMode] = useState(false);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);

  // 映射表同步状态
  const [applicantMappings, setApplicantMappings] = useState<ApplicantMappingItem[]>([]);
  const [agencyMappings, setAgencyMappings] = useState<AgencyMappingItem[]>([]);

  useEffect(() => {
    const refreshMappings = () => {
      setApplicantMappings(getApplicantMappings());
      setAgencyMappings(getAgencyMappings());
    };
    refreshMappings();
    return subscribeMappingChanges(refreshMappings);
  }, []);

  // 人工跟进与更新注册进度节点状态 (编辑维护档案弹窗专用)
  const [editingNewStage, setEditingNewStage] = useState('');
  const [editingNewDate, setEditingNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [editingNewDesc, setEditingNewDesc] = useState('');

  const [newTimelineStage, setNewTimelineStage] = useState('');
  const [newTimelineDate, setNewTimelineDate] = useState(new Date().toISOString().slice(0, 10));
  const [newTimelineDesc, setNewTimelineDesc] = useState('');
  const [newTimelineSyncStatus, setNewTimelineSyncStatus] = useState<string>('KEEP');
  const [isAddingTimeline, setIsAddingTimeline] = useState(false);

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

  // 打开建案申请详情弹窗
  const handleOpenProposalDetail = (proposalNo: string, caseItem?: CaseManagementItem) => {
    setProposalDetailTab('info');
    const found = INITIAL_PROPOSALS.find(p => p.proposalNo === proposalNo || p.id === proposalNo);
    if (found) {
      setSelectedProposalForDetail(found);
    } else if (caseItem) {
      const dynamicProposal: TrademarkApplicationProposal = {
        id: `prop-gen-${caseItem.proposalNo}`,
        proposalNo: caseItem.proposalNo,
        trademarkName: caseItem.trademarkName,
        brand: caseItem.brand,
        classes: caseItem.classes,
        importanceLevel: (caseItem.importanceLevel as any) || '一级',
        applicationType: '一般',
        jurisdiction: caseItem.jurisdiction,
        trademarkForm: (caseItem.trademarkForm as any) || '文字',
        department: '品牌知产中心',
        applicant: caseItem.applicant || '知产专员',
        applyTime: caseItem.applyTime || '2026-08-13 14:20',
        status: 'ACCEPTED',
        currentNode: '代理机构已接单立案',
        currentHandler: caseItem.agencyName ? `${caseItem.agencyName} (代理律所)` : '代理机构',
        dwellTime: '进行中',
        isOverdue: false,
        description: `针对 ${caseItem.brand} 品牌在 ${caseItem.jurisdiction} 市场提交的【${caseItem.trademarkName}】商标建案申请，核指商品项：${caseItem.goodsItems}。`,
        agencyName: caseItem.agencyName || '代理律所',
        proposalType: '商标',
        trademarkGrade: '核心级',
        is3dTrademark: '否',
        colorForm: '黑白',
        businessType: '国内注册/海外拓展',
        intendedUseDate: '2026-10-01',
        trademarkSource: '自研设计与品牌布局',
        isDesignedColorUsed: '否',
        isSimilarTrademarkRegistered: '否',
        agencyType: '代理机构委外',
        techCategory: '品牌形象与商品分类保护',
      };
      setSelectedProposalForDetail(dynamicProposal);
    } else {
      setSelectedProposalForDetail({
        id: `prop-fallback-${proposalNo}`,
        proposalNo: proposalNo,
        trademarkName: '智能口腔核心商标',
        brand: 'usmile笑容加',
        classes: '第10类、第21类',
        importanceLevel: '一级',
        applicationType: '一般',
        jurisdiction: '中国',
        trademarkForm: '文字',
        department: '研发中心',
        applicant: '知产法务部',
        applyTime: '2026-08-14 09:30',
        status: 'ACCEPTED',
        currentNode: '代理机构已接单立案',
        currentHandler: '知识产权部',
        dwellTime: '进行中',
        isOverdue: false,
        description: `单据【${proposalNo}】已完成审批及立案流程，相关案卷材料已同步至商标案件管理台账。`
      });
    }
  };

  // 下载批量导入模板
  const handleDownloadImportTemplate = () => {
    const headers = ['案件编号,建案编码,商标名称,品牌,尼斯分类,申请国家/地区,重要等级,商标形式,申请人主体,官方申请号,官方申请日,代理律所,商品/服务项目'];
    const sampleRow1 = ['TM20260823099','SB20260823099','"SMART CARE PRO"','"usmile笑容加"','"第10类、第21类"','"美国"','一级','文字','广州星际悦动股份有限公司','','','"Finnegan律所"','"电动牙刷、洁牙设备、口腔护理仪器"'];
    const sampleRow2 = ['TM20260823100','SB20260823100','"KISS DAY ICE"','"kissday亲天"','"第3类"','"日本"','二级','组合','广州星际悦动股份有限公司','','','"日本特许律所"','"漱口水、牙膏、口香喷雾"'];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, sampleRow1.join(','), sampleRow2.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `商标案件批量导入模板.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('已成功下载【商标案件批量导入模板.csv】！');
  };

  // 确认批量导入
  const handleConfirmBatchImport = () => {
    if (importFile) {
      showToast(`已成功批量导入文件【${importFile.name}】中的 5 条全新商标案件！`);
    } else {
      showToast('成功批量导入 2 条全新商标案件数据！');
    }
    setIsImportModalOpen(false);
    setImportFile(null);
  };

  // 下载批量更新模板 (根据选中的字段拼接，包含说明行、示例行以及受控选项提示)
  const handleDownloadUpdateTemplate = () => {
    if (selectedUpdateFields.length === 0) {
      showToast('请至少勾选 1 个需要更新的字段！');
      return;
    }

    // 1. 构造顶栏规则与受控字段说明注释行
    const instructions = [
      '# ====================================================================================================',
      '# 【商标案件批量更新模板 - 填写说明与选项规范】',
      '# 1. 第一列【案件编号】为系统精准匹配的主键，导入时用于对应案件，切勿更改其编号格式。',
      '# 2. 导入时系统将对受控字段进行严格校验，如填列的值非系统允许选项，将提示错误并导入失败。',
      '# 3. 下列受控字段在系统中的合法可选项参考如下（多选请用分号分隔）：',
      '#    - [尼斯分类]: 第1类 至 第45类 (例如: 第10类;第21类)',
      '#    - [类似群组]: 4位代码 (例如: 1001;2101;4209)',
      '#    - [案件流转状态]: 待申请, 申请中, 审查中, 已注册, 已失效, 待答复/补正, 初审公告中, 驳回复审中, 异议答辩中',
      '#    - [知识产权主管局]: 中国国家知识产权局 (CNIPA), 新加坡知识产权局 (IPOS), 美国专利商标局 (USPTO), 欧洲联盟知识产权局 (EUIPO), 日本特许厅 (JPO), 韩国特许厅 (KIPO), 世界知识产权组织 (WIPO), 马来西亚知识产权局 (MyIPO), 泰国知识产权局 (DIP), 英国知识产权局 (UKIPO)',
      '#    - [最新注册进度]: 接单生成, 递交申请, 受理通知, 形式审查, 实质审查, 初审公告, 注册公告, 核准发证, 获准注册核发证书, 驳回复审, 异议程序',
      '#    - [申请人主体]: 广州星际悦动股份有限公司, 深圳星际悦动科技有限公司, usmile Global (Singapore) Pte. Ltd., 香港星际悦动有限公司, 广州笑容加健康科技有限公司, 追觅创新(苏州)管理有限公司...',
      '#    - [承办代理机构]: Allen & Gledhill LLP (新加坡), Baker & McKenzie (香港/国际), 北京永新同创知识产权代理有限公司, 广州三环专利商标代理有限公司, Fish & Richardson P.C. (美国), Sonoda & Kobayashi (日本), 北京市柳沈律师事务所...',
      '# ===================================================================================================='
    ];

    // 2. 表头列构建
    const headerCols = ['案件编号'];
    const extraFields = selectedUpdateFields.filter(f => f !== 'caseNo');
    extraFields.forEach(fKey => {
      const fieldObj = UPDATEABLE_FIELD_OPTIONS.find(f => f.key === fKey);
      if (fieldObj) headerCols.push(fieldObj.label);
    });

    // 3. 一行示例数据列构建
    const sampleCols = ['TM20260813000(示例行-导入自动忽略)'];
    extraFields.forEach(fKey => {
      const fieldObj = UPDATEABLE_FIELD_OPTIONS.find(f => f.key === fKey);
      let sampleVal = fieldObj?.defaultVal || '示例数据';
      if (fKey === 'classes') sampleVal = '第10类;第21类';
      else if (fKey === 'similarGroups') sampleVal = '1001;2101';
      else if (fKey === 'status') sampleVal = '已注册';
      else if (fKey === 'officialAgency') sampleVal = '中国国家知识产权局 (CNIPA)';
      else if (fKey === 'latestRegistrationProgress') sampleVal = '获准注册核发证书';
      else if (fKey === 'applicantEntity') sampleVal = '广州星际悦动股份有限公司';
      else if (fKey === 'agencyName') sampleVal = 'Allen & Gledhill LLP (新加坡)';
      sampleCols.push(`"${sampleVal.replace(/"/g, '""')}"`);
    });

    // 4. 正式数据行构建
    const rows = searchFilteredCases.map(item => {
      const cols = [item.caseNo]; // 第一列：目前列表上的案件编号
      extraFields.forEach(fKey => {
        let val = (item as any)[fKey];
        if (!val) {
          if (fKey === 'classes') val = item.classes || item.proposalClasses;
          else if (fKey === 'goodsItems') val = item.goodsItems || item.goodsServices;
          else if (fKey === 'country') val = item.country || item.jurisdiction;
          else if (fKey === 'applicationNo') val = item.applicationNo || item.appNo;
          else if (fKey === 'latestRegistrationProgress') val = item.latestRegistrationProgress || item.latestProgress;
          else if (fKey === 'registrationNo') val = item.registrationNo || item.regNo;
          else if (fKey === 'firstNoticeIssue') val = item.firstNoticeIssue || item.initialIssueNo;
          else if (fKey === 'firstNoticeDate') val = item.firstNoticeDate || item.initialIssueDate;
          else if (fKey === 'regNoticeIssue') val = item.regNoticeIssue || item.regIssueNo;
          else if (fKey === 'regNoticeDate') val = item.regNoticeDate || item.regIssueDate;
          else if (fKey === 'validUntil') val = item.validUntil || item.rightsEndDate;
          else if (fKey === 'applicantEntity') val = item.applicantEntity || item.applicant;
          else if (fKey === 'agencyName') val = item.agencyName || item.lawFirm;
          else if (fKey === 'entrustDate') val = item.entrustDate || item.agencyEntrustDate;
          else if (fKey === 'deadlineDate') val = item.filingDeadline;
        }
        if (Array.isArray(val)) val = val.join(';');
        cols.push(`"${String(val || '').replace(/"/g, '""')}"`);
      });
      return cols.join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
      ...instructions,
      headerCols.join(','),
      sampleCols.join(','),
      ...rows
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `商标案件批量更新模板_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`已成功导出更新模板！内含规范说明、一行示例及目前 ${searchFilteredCases.length} 条案件数据。`);
  };

  // 确认批量更新 (进行 CSV 规则硬校验)
  const handleConfirmBatchUpdate = async () => {
    if (selectedUpdateFields.length === 0) {
      showToast('请至少勾选 1 个需要更新的字段！');
      return;
    }

    // 若上传了文件，进行解析与字段选项合法性校验
    if (updateFile) {
      try {
        const text = await updateFile.text();
        const rows = parseCSVText(text);

        if (rows.length === 0) {
          showToast('上传的文件内容为空或无有效数据！');
          return;
        }

        // 寻找表头行 (第一列包含“案件编号”或“单据编号”)
        let headerRowIndex = -1;
        for (let i = 0; i < rows.length; i++) {
          if (rows[i][0] && (rows[i][0].includes('案件编号') || rows[i][0].includes('单据编号'))) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          showToast('未检测到包含【案件编号】的表头列，请确保模板格式正确！');
          return;
        }

        const headerCols = rows[headerRowIndex];
        const dataRows = rows.slice(headerRowIndex + 1).filter(r => {
          if (!r || r.length === 0) return false;
          const caseNoCell = r[0] || '';
          if (caseNoCell.includes('示例行') || caseNoCell.includes('示例')) return false; // 过滤示例行
          return !!caseNoCell.trim();
        });

        if (dataRows.length === 0) {
          showToast('文件未包含有效的待更新数据行！');
          return;
        }

        // 将表头列映射到对应的 fieldKey
        const colFieldKeys: (string | null)[] = headerCols.map(colName => {
          const cleanName = colName.replace(/^"+|"+$/g, '').trim();
          if (cleanName === '案件编号' || cleanName.includes('单据编号')) return 'caseNo';
          const matchOpt = UPDATEABLE_FIELD_OPTIONS.find(f => f.label === cleanName || f.key === cleanName);
          return matchOpt ? matchOpt.key : null;
        });

        // 校验每一行的受控字段
        const validationErrors: BatchValidationError[] = [];

        dataRows.forEach((rowCells, rIdx) => {
          const rowLineNum = headerRowIndex + 2 + rIdx; // Excel 视角行号
          const caseNoCell = (rowCells[0] || '').replace(/^"+|"+$/g, '').trim();

          rowCells.forEach((cellVal, colIdx) => {
            const fKey = colFieldKeys[colIdx];
            if (!fKey) return;

            if (RESTRICTED_FIELD_OPTIONS[fKey]) {
              const res = validateRestrictedFieldValue(fKey, cellVal);
              if (!res.isValid) {
                validationErrors.push({
                  rowNum: rowLineNum,
                  caseNo: caseNoCell || '未知编号',
                  fieldKey: fKey,
                  fieldLabel: RESTRICTED_FIELD_OPTIONS[fKey].label,
                  value: cellVal.replace(/^"+|"+$/g, '').trim() || '(空)',
                  allowedOptionsStr: res.allowedStr
                });
              }
            }
          });
        });

        // 如果存在校验错误 -> 阻止导入并提示错误 (保证导入失败)
        if (validationErrors.length > 0) {
          setBatchValidationErrors(validationErrors);
          showToast(`❌ 批量更新导入失败！检测到 ${validationErrors.length} 处非法未填系统选项，请更正后再试。`);
          return;
        }

        // 校验通过，执行批量更新应用
        setBatchValidationErrors(null);
        setIsBatchUpdateModalOpen(false);
        setUpdateFile(null);
        showToast(`✅ 批量更新完成！全部数据均符合系统选项规范，已成功覆盖更新 ${dataRows.length} 条案件记录！`);

      } catch (err) {
        showToast('解析文件出现错误，请检查文件编码或格式！');
      }
    } else {
      // 未上传文件时直接提示成功或模拟更新
      showToast(`批量更新完成！已同步将选定字段应用更新至 ${searchFilteredCases.length} 条单据记录。`);
      setIsBatchUpdateModalOpen(false);
      setUpdateFile(null);
      setBatchValidationErrors(null);
    }
  };

  // 重置搜索表单 (重置所有12个筛选条件)
  const handleResetFilters = () => {
    setFilterCaseNo('');
    setFilterProposalNo('');
    setFilterTrademarkName('');
    setFilterForm('ALL');
    setFilterBrand('ALL');
    setFilterSelectedClasses([]);
    setFilterRegion('ALL');
    setFilterCountry('ALL');
    setFilterImportance('ALL');
    setFilterAppNo('');
    setFilterApplyStartDate('');
    setFilterApplyEndDate('');
    setFilterSelectedAgencies([]);
    setFilterStatus('ALL');
    setActiveTab('ALL');
    setCurrentPage(1);
    showToast('筛选条件已重置');
  };

  // 下拉框可选项动态计算
  const allTrademarkForms = useMemo(() => {
    const set = new Set<string>();
    caseItems.forEach(c => {
      if (c.trademarkForm) set.add(c.trademarkForm);
    });
    if (set.size === 0) {
      return ['文字商标', '图形商标', '组合商标', '3D立体商标', '颜色商标', '声音商标'];
    }
    return Array.from(set);
  }, [caseItems]);

  // 品牌树动态选项列表 (与建案申请页面搜索区的品牌下拉选项保持完全一致)
  const brandOptions = useMemo(() => {
    if (brandTree && brandTree.length > 0) {
      const flat = flattenBrandTree(brandTree);
      return flat.map(n => ({
        id: n.id,
        name: n.name,
        code: n.code,
        level: n.level
      }));
    }
    return [
      { id: '1', name: 'usmile笑容加', code: 'BR-CORE-001', level: 'CORE_BRAND' },
      { id: '2', name: 'KittyAnnie小猫安妮', code: 'BR-CORE-002', level: 'CORE_BRAND' },
      { id: '3', name: 'FHT新燕', code: 'BR-CORE-003', level: 'CORE_BRAND' },
      { id: '4', name: 'aboval阿茂', code: 'BR-CORE-004', level: 'CORE_BRAND' },
      { id: '5', name: 'kissday亲天', code: 'BR-CORE-005', level: 'CORE_BRAND' },
      { id: '6', name: '密浪 Waves', code: 'BR-SUB-001', level: 'SUB_BRAND' },
      { id: '7', name: '净白云朵', code: 'BR-SUB-002', level: 'SUB_BRAND' },
      { id: '8', name: 'SMART ORAL LAB 智慧口腔实验室', code: 'BR-CORE-006', level: 'CORE_BRAND' }
    ];
  }, [brandTree]);

  // 45类尼斯分类列表选项 (与建案申请页面搜索区的商标类别下拉选项一致)
  const niceClassOptions = useMemo(() => {
    return NICE_CLASSES_45.map(c => ({
      value: c.code,
      label: `${c.code} (${c.name})`,
      desc: c.desc
    }));
  }, []);

  const allRegionOptions = useMemo(() => {
    const set = new Set<string>();
    try {
      const mappings = getCountryRegionMappings();
      mappings.forEach(m => { if (m.region) set.add(m.region); });
    } catch (e) {
      // fallback
    }
    if (set.size === 0) {
      return ['大中华地区', '东亚', '东南亚', '欧洲', '北美洲', '南美洲', '大洋洲', '非洲'];
    }
    return Array.from(set);
  }, []);

  const allCountryOptions = useMemo(() => {
    const set = new Set<string>();
    try {
      const mappings = getCountryRegionMappings();
      mappings.forEach(m => { if (m.country) set.add(m.country); });
    } catch (e) {
      // fallback
    }
    caseItems.forEach(c => {
      if (c.country) set.add(c.country);
      if (c.jurisdiction) set.add(c.jurisdiction);
    });
    return Array.from(set);
  }, [caseItems]);

  const allAgencyOptions = useMemo(() => {
    const set = new Set<string>();
    agencyMappings.forEach(a => { if (a.agencyName) set.add(a.agencyName); });
    caseItems.forEach(c => {
      if (c.agencyName) set.add(c.agencyName);
      if (c.lawFirm) set.add(c.lawFirm);
    });
    return Array.from(set);
  }, [agencyMappings, caseItems]);

  // 1. 按 12 大表单搜索条件过滤出的全部案件数据 (不含Tab状态过滤)
  const searchFilteredCases = useMemo(() => {
    return caseItems.filter((item) => {
      // 1. 案件编号 (支持批量逗号/空格/换行搜索)
      if (filterCaseNo.trim()) {
        const codes = filterCaseNo.split(/[,;\s\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
        if (codes.length > 0) {
          const itemNo = item.caseNo.toLowerCase();
          const matches = codes.some(code => itemNo.includes(code));
          if (!matches) return false;
        }
      }
      // 2. 建案编码 (支持批量逗号/空格/换行搜索)
      if (filterProposalNo.trim()) {
        const codes = filterProposalNo.split(/[,;\s\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
        if (codes.length > 0) {
          const itemNo = (item.proposalNo || '').toLowerCase();
          const matches = codes.some(code => itemNo.includes(code));
          if (!matches) return false;
        }
      }
      // 3. 商标名称 (模糊搜索)
      if (filterTrademarkName.trim() && !item.trademarkName.toLowerCase().includes(filterTrademarkName.trim().toLowerCase())) {
        return false;
      }
      // 4. 商标形式 (单选)
      if (filterForm !== 'ALL' && item.trademarkForm !== filterForm) {
        return false;
      }
      // 5. 所属品牌 (单选)
      if (filterBrand !== 'ALL' && filterBrand !== '全部') {
        const itemBrand = item.brand || '';
        const targetBrand = filterBrand.toLowerCase();
        const currentBrand = itemBrand.toLowerCase();
        const normalizedItem = currentBrand.replace(/\s+/g, '');
        const normalizedTarget = targetBrand.replace(/\s+/g, '');
        if (
          !currentBrand.includes(targetBrand) && 
          !targetBrand.includes(currentBrand) &&
          !normalizedItem.includes(normalizedTarget) &&
          !normalizedTarget.includes(normalizedItem)
        ) {
          return false;
        }
      }
      // 6. 商标类别 (多选)
      if (filterSelectedClasses.length > 0) {
        const itemClassStr = item.classes || '';
        const hasMatch = filterSelectedClasses.some(clsCode => {
          const num = clsCode.replace(/[^0-9]/g, '');
          return itemClassStr.includes(num) || itemClassStr.includes(clsCode);
        });
        if (!hasMatch) return false;
      }
      // 7. 申请地区 (单选)
      if (filterRegion !== 'ALL' && filterRegion.trim()) {
        const itemRegion = item.region || getRegionByCountry(item.country || item.jurisdiction || '');
        if (!itemRegion.toLowerCase().includes(filterRegion.trim().toLowerCase())) return false;
      }
      // 8. 申请国家 (单选)
      if (filterCountry !== 'ALL' && filterCountry.trim()) {
        const itemCountry = item.country || item.jurisdiction || '';
        if (!itemCountry.toLowerCase().includes(filterCountry.trim().toLowerCase())) return false;
      }
      // 9. 重要等级 (单选: 全部、一级(核心战略)、二级(主打品类)、三级(防御布局))
      if (filterImportance !== 'ALL') {
        const coreVal = filterImportance.slice(0, 2); // "一级", "二级", "三级"
        if (!item.importanceLevel || !item.importanceLevel.includes(coreVal)) return false;
      }
      // 10. 官方申请号 (支持批量逗号/空格/换行搜索)
      if (filterAppNo.trim()) {
        const codes = filterAppNo.split(/[,;\s\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
        if (codes.length > 0) {
          const itemNo = (item.applicationNo || item.registrationNo || item.appNo || item.regNo || "").toLowerCase();
          const matches = codes.some(code => itemNo.includes(code));
          if (!matches) return false;
        }
      }
      // 11. 官方申请日 (时间范围选择)
      if (filterApplyStartDate) {
        if (!item.applyDate || item.applyDate < filterApplyStartDate) return false;
      }
      if (filterApplyEndDate) {
        if (!item.applyDate || item.applyDate > filterApplyEndDate) return false;
      }
      // 12. 代理机构 (多选)
      if (filterSelectedAgencies.length > 0) {
        const itemAgency = item.agencyName || item.lawFirm || '';
        const matched = filterSelectedAgencies.some(agency => itemAgency.includes(agency) || agency.includes(itemAgency));
        if (!matched) return false;
      }

      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
      return true;
    });
  }, [
    caseItems, 
    filterCaseNo, 
    filterProposalNo, 
    filterTrademarkName, 
    filterForm,
    filterBrand, 
    filterSelectedClasses,
    filterRegion,
    filterCountry, 
    filterImportance,
    filterAppNo,
    filterApplyStartDate,
    filterApplyEndDate,
    filterSelectedAgencies,
    filterStatus
  ]);

  // 2. 动态计算各状态数量 (精准匹配当前搜索条件，与列表数据 100% 对齐)
  const counts = useMemo(() => {
    const total = searchFilteredCases.length;
    const pendingApply = searchFilteredCases.filter(c => c.status === 'PENDING_APPLY').length;
    const applying = searchFilteredCases.filter(c => c.status === 'APPLYING').length;
    const examining = searchFilteredCases.filter(c => c.status === 'EXAMINING').length;
    const registered = searchFilteredCases.filter(c => c.status === 'REGISTERED').length;
    const pendingReply = searchFilteredCases.filter(c => c.status === 'PENDING_REPLY').length;
    const invalid = searchFilteredCases.filter(c => c.status === 'INVALID').length;
    return { total, pendingApply, applying, examining, registered, pendingReply, invalid };
  }, [searchFilteredCases]);

  // 3. 根据当前选中的 Tab 过滤最终案件列表
  const filteredCases = useMemo(() => {
    if (activeTab === 'ALL') return searchFilteredCases;
    return searchFilteredCases.filter((item) => item.status === activeTab);
  }, [searchFilteredCases, activeTab]);

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
    const headers = ['案件编号,建案编码,商标名称,品牌,尼斯分类,申请地区,申请国家,商品项目,重要等级,状态,申请号,申请日期,代理律所,知识产权主管局'];
    const rows = exportData.map((c) =>
      [
        c.caseNo,
        c.proposalNo,
        `"${c.trademarkName}"`,
        `"${c.brand}"`,
        `"${c.classes}"`,
        `"${c.region || getRegionByCountry(c.country || c.jurisdiction || "中国")}"`,
        `"${c.country || c.jurisdiction || "中国"}"`,
        `"${(c.goodsItems || '').replace(/"/g, '""')}"`,
        c.importanceLevel || '一级',
        c.status,
        c.applicationNo || '',
        c.applyDate || '',
        `"${c.agencyName || ''}"`,
        `"${c.officialAgency || ''}"`
      ].join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `商标案件管理台账_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`已成功导出 ${exportData.length} 条案件管理台账 CSV 数据！`);
    setIsExportMode(false);
    setSelectedCases([]);
  };

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

  // 分页数据
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;

  const allBrands = useMemo(() => Array.from(new Set(caseItems.map(c => c.brand).filter(Boolean))), [caseItems]);
  const allRegions = useMemo(() => ['亚太', '东南亚', '欧洲中东', '北美', '拉美', '全球'], []);

  // 状态徽标渲染 (与 ApplicationCenter 样式完全统一)
  const renderStatusBadge = (status: CaseManagementStatus) => {
    switch (status) {
      case 'PENDING_APPLY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span>待申请</span>
          </span>
        );
      case 'APPLYING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>申请中</span>
          </span>
        );
      case 'EXAMINING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>审查中</span>
          </span>
        );
      case 'REGISTERED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>已注册</span>
          </span>
        );
      case 'PENDING_REPLY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
            <span>待答复</span>
          </span>
        );
      case 'INVALID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>已失效</span>
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">待申请</span>;
    }
  };

  // 打开【编辑维护档案】弹窗
  const handleOpenMaintainGoods = (c: CaseManagementItem) => {
    setSelectedCaseForMaintain(c);
    setIsAnalyzingFile(false);
    setAnalysisResultMsg(null);
    setAnalysisErrorMsg(null);
    setDragActive(false);

    const initialCodes = parseClassesToCodes(c.classes || '');
    setSelectedClassCodes(initialCodes);
    setIsClassDropdownOpen(false);
    setClassSearchKeyword('');

    // 解析类似群组
    let initialGroupCodes: string[] = [];
    if (c.similarGroups) {
      const matched = c.similarGroups.match(/\b\d{4}\b/g);
      if (matched) {
        initialGroupCodes = Array.from(new Set(matched));
      } else {
        initialGroupCodes = c.similarGroups.split(/[,、，\s]+/).filter(Boolean);
      }
    }
    if (initialGroupCodes.length === 0 && initialCodes.length > 0) {
      const goodsNames = (c.goodsServices || c.goodsItems || (c.goodsList ? c.goodsList.join('、') : '')).split(/[,、，;\n\r]+/).map(s => s.trim()).filter(Boolean);
      const matchedGroups = niceItems
        .filter(item => goodsNames.some(gn => item.itemNameCn.includes(gn) || gn.includes(item.itemNameCn)))
        .map(item => item.groupCode);
      if (matchedGroups.length > 0) {
        initialGroupCodes = Array.from(new Set(matchedGroups));
      }
    }
    setSelectedGroupCodes(initialGroupCodes);
    setIsGroupDropdownOpen(false);
    setGroupSearchKeyword('');

    // 解析商品/服务项目
    const initialGoods = c.goodsList && c.goodsList.length > 0 
      ? [...c.goodsList] 
      : (c.goodsServices || c.goodsItems || '').split(/[,、，;\n\r]+/).map(s => s.trim()).filter(Boolean);
    setSelectedGoodsItems(initialGoods);
    setEditingGoodsList(initialGoods);
    setIsGoodsDropdownOpen(false);
    setGoodsSearchKeyword('');
    
    const lastMilestone = c.timeline && c.timeline.length > 0 ? c.timeline[c.timeline.length - 1].stage : '';
    const initialStage = c.latestProgress || lastMilestone || '获准注册核发证书';
    setEditingNewStage(initialStage);
    setEditingNewDate(new Date().toISOString().slice(0, 10));
    setEditingNewDesc('');

    const matchedApplicant = applicantMappings.find(item => item.applicant === (c.applicant || '广州星际悦动股份有限公司'));
    const matchedAgency = agencyMappings.find(item => item.agencyName === (c.agencyName || 'Allen& Gledhill LLP(新加坡)'));

    setEditingCaseInfo({
      classes: c.classes || '',
      similarGroups: c.similarGroups || '',
      goodsServices: c.goodsServices || c.goodsItems || '',
      goodsItems: c.goodsItems || c.goodsServices || '',
      status: c.status || 'PENDING_APPLY',
      officialAgency: c.officialAgency || '新加坡知识产权局(IPOS)',
      applicationNo: c.applicationNo || '5G4020260813401',
      applyDate: c.applyDate || '2026-08-18',
      registrationNo: c.registrationNo || 'REG-8890123',
      registrationDate: c.registrationDate || c.regIssueDate || '2026-08-20',
      initialIssueNo: c.initialIssueNo || '1892期',
      initialIssueDate: c.initialIssueDate || '2026-11-20',
      regIssueNo: c.regIssueNo || '1904期',
      regIssueDate: c.regIssueDate || '2027-02-21',
      filingDeadline: c.filingDeadline || '2026-09-15',
      renewalStartDate: c.renewalStartDate || '2036-02-21',
      intlRegNo: c.intlRegNo || 'IR-2026-90812',
      intlRegDate: c.intlRegDate || '2026-08-15',
      rightsEndDate: c.rightsEndDate || c.validUntil || '2036-08-20',
      validUntil: c.validUntil || c.rightsEndDate || '2036-08-20',
      applicant: c.applicant || '广州星际悦动股份有限公司',
      applicantEn: matchedApplicant?.applicantEn || c.applicantEn || 'Guangzhou Starfield Delight Co., Ltd.',
      applicantAddress: matchedApplicant?.applicantAddress || c.applicantAddress || '广东省广州市天河区珠江东路28号越秀金融大厦38层',
      applicantAddressEn: matchedApplicant?.applicantAddressEn || c.applicantAddressEn || '38/F, Yuexiu Financial Tower, No.28 Zhujiang East Road, Tianhe District, Guangzhou, Guangdong, China',
      agencyName: c.agencyName || 'Allen& Gledhill LLP(新加坡)',
      agentName: matchedAgency?.agentName || c.agentName || '张锦程',
      agencyEntrustDate: c.agencyEntrustDate || '2026-08-11',
      agencyDocketNo: matchedAgency?.agencyDocketNo || c.agencyDocketNo || 'AG-2026-TM-0891',
      region: c.region || getRegionByCountry(c.country || c.jurisdiction || '新加坡'),
      country: c.country || c.jurisdiction || '新加坡',
      priorityCountry: c.country || c.priorityCountry || c.jurisdiction || '新加坡',
      latestProgress: initialStage,
    });
  };

  // 一键填入标准26项档案数据
  const handleFillStandardCaseInfo = () => {
    setEditingCaseInfo({
      status: 'PENDING_APPLY',
      officialAgency: '新加坡知识产权局(IPOS)',
      applicationNo: '5G4020260813401',
      applyDate: '2026-08-18',
      registrationNo: 'REG-8890123',
      registrationDate: '2026-08-20',
      initialIssueNo: '1892期',
      initialIssueDate: '2026-11-20',
      regIssueNo: '1904期',
      regIssueDate: '2027-02-21',
      intlRegNo: 'IR-2026-90812',
      intlRegDate: '2026-08-15',
      rightsEndDate: '2036-08-20',
      validUntil: '2036-08-20',
      renewalStartDate: '2036-02-21',
      filingDeadline: '2026-09-15',
      applicant: '广州星际悦动股份有限公司',
      applicantEn: 'Guangzhou Starfield Delight Co.. Ltd.',
      applicantAddress: '广东省广州市天河区珠江东路28号越秀金融大厦38层',
      applicantAddressEn: '38/F, Yuexiu Financial Tower, No.28 Zhujiang East Road, Tianhe District, Guangzhou, Guangdong, China',
      agencyName: 'Allen& Gledhill LLP(新加坡)',
      agencyDocketNo: 'AG-2026-TM-0891',
      agentName: '张锦程',
      priorityClaim: '基于中国首次申请 202610891204.8享有优先权',
      agencyEntrustDate: '2026-08-11',
      priorityCountry: '新加坡、马来西亚',
      latestProgress: '获准注册核发证书',
    });
    setEditingNewStage('获准注册核发证书');
    showToast('已填入标准26项商标注册与案件信息！');
  };

  // 处理上传的文件或示例文件并自动识别填写
  const handleProcessFileUpload = async (file?: File, sampleType?: 'CN_CERT' | 'NOTICE' | 'IPOS_RECEIPT') => {
    setIsAnalyzingFile(true);
    setAnalysisResultMsg(null);
    setAnalysisErrorMsg(null);

    try {
      let payload: any = {};

      if (sampleType) {
        if (sampleType === 'CN_CERT') {
          payload = {
            fileName: '商标核准注册证书示例_CNIPA.pdf',
            fileText: '国家知识产权局商标局 申请号: 79801234 注册证号: REG-8820192 申请日: 2026-02-18 注册日: 2026-08-20 初审公告期号: 1896期 (2026-05-20) 注册公告期号: 1908期 (2026-08-20) 申请人: 广州星际悦动股份有限公司 代理机构: 华进联合知识产权代理有限公司 类别: 第03类、第10类、第21类 核定服务/商品项目: 电动牙刷 (2108)、医用冲牙器 (1004)、牙齿美白仪器 (1004)、洁齿剂 (0307)、非医用漱口水 (0307)'
          };
        } else if (sampleType === 'NOTICE') {
          payload = {
            fileName: '商标局受理及初审公告通知书示例.pdf',
            fileText: '国家知识产权局商标局 申请号: 81029381 申请日: 2026-06-10 初审公告期号: 1912期 初审公告日: 2026-08-15 答复/异议截止日: 2026-11-15 状态: 审查中/初审公告阶段 申请人: 广州星际悦动股份有限公司 代理机构: 华进联合知识产权 保护商品项: 智能口腔扫描仪 (1004)、智能声波牙刷 (2108)、牙科用激光设备 (1004) 类别: 第10类、第21类'
          };
        } else if (sampleType === 'IPOS_RECEIPT') {
          payload = {
            fileName: '新加坡知识产权局IPOS注册核准回执.pdf',
            fileText: 'Intellectual Property Office of Singapore (IPOS) Application No: SG4020260813401 Registration No: SG-T260819001 International Reg No: IR-2026-90812 Filing Date: 2026-04-12 Registration Date: 2026-08-10 Rights Expiry Date: 2036-04-12 Status: REGISTERED Applicant: Guangzhou Starfield Delight Co., Ltd. Address: 38/F, Yuexiu Financial Tower, No.28 Zhujiang East Road, Tianhe District, Guangzhou Agent: Allen & Gledhill LLP Classes: Class 3, Class 10, Class 21 Goods/Services: Electric toothbrushes (2108), Oral irrigators (1004), Teeth whitening kits (0307)'
          };
        }
      } else if (file) {
        payload.fileName = file.name;
        payload.mimeType = file.type;

        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const res = reader.result as string;
              const base64Data = res.split(',')[1] || res;
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          payload.fileData = base64;
        } else {
          const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });
          payload.fileText = text;
        }
      }

      const res = await fetch('/api/recognize-trademark-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success && data.data) {
        const ext = data.data;

        setEditingCaseInfo((prev) => ({
          ...prev,
          status: (ext.status as CaseManagementStatus) || prev.status,
          officialAgency: ext.officialAgency || prev.officialAgency,
          applicationNo: ext.applicationNo || prev.applicationNo,
          applyDate: ext.applyDate || prev.applyDate,
          registrationNo: ext.registrationNo || prev.registrationNo,
          registrationDate: ext.registrationDate || prev.registrationDate,
          initialIssueNo: ext.initialIssueNo || prev.initialIssueNo,
          initialIssueDate: ext.initialIssueDate || prev.initialIssueDate,
          regIssueNo: ext.regIssueNo || prev.regIssueNo,
          regIssueDate: ext.regIssueDate || prev.regIssueDate,
          filingDeadline: ext.filingDeadline || prev.filingDeadline,
          rightsEndDate: ext.rightsEndDate || prev.rightsEndDate,
          renewalStartDate: ext.renewalStartDate || prev.renewalStartDate,
          intlRegNo: ext.intlRegNo || prev.intlRegNo,
          intlRegDate: ext.intlRegDate || prev.intlRegDate,
          applicant: ext.applicant || prev.applicant,
          applicantEn: ext.applicantEn || prev.applicantEn,
          applicantAddress: ext.applicantAddress || prev.applicantAddress,
          applicantAddressEn: ext.applicantAddressEn || prev.applicantAddressEn,
          agencyName: ext.agencyName || prev.agencyName,
          agentName: ext.agentName || prev.agentName,
          agencyDocketNo: ext.agencyDocketNo || prev.agencyDocketNo,
        }));

        if (Array.isArray(ext.classes) && ext.classes.length > 0) {
          const formattedCodes = ext.classes.map((c: string) => {
            const num = c.replace(/[^0-9]/g, '');
            return `第${num.padStart(2, '0')}类`;
          }).filter(Boolean);
          if (formattedCodes.length > 0) {
            setSelectedClassCodes(formattedCodes);
          }
        }

        if (Array.isArray(ext.goodsList) && ext.goodsList.length > 0) {
          setSelectedGoodsItems(ext.goodsList);
          setEditingGoodsList(ext.goodsList);
          const matchedGroups = niceItems
            .filter(item => ext.goodsList.some((gn: string) => item.itemNameCn.includes(gn) || gn.includes(item.itemNameCn)))
            .map(item => item.groupCode);
          if (matchedGroups.length > 0) {
            setSelectedGroupCodes(Array.from(new Set(matchedGroups)));
          }
        }

        if (ext.timelineStage) {
          setEditingNewStage(ext.timelineStage);
          setEditingNewDesc(`AI识别提取文件【${payload.fileName || '商标文档'}】自动生成进度节点记录`);
        }

        const countFields = Object.values(ext).filter(v => v && (typeof v === 'string' ? v.trim() !== '' : Array.isArray(v) && v.length > 0)).length;
        setAnalysisResultMsg(`✨ AI识别完成！成功解析文件【${payload.fileName || '商标文档'}】，已自动提取 ${countFields} 项特征数据并同步填充至下方表单，请核对确认。`);
        showToast('AI智能识别成功，已自动更新并填充表单数据！');
      } else {
        throw new Error(data.error || '解析文档响应异常');
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setAnalysisErrorMsg(`文件解析提醒：${err.message || '识别遇到阻碍'}。已尝试使用结构化备用规则填充。`);
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  // 添加商品项
  const handleAddGoodItem = () => {
    if (!newGoodItemInput.trim()) return;
    const newItem = newGoodItemInput.trim();
    if (!selectedGoodsItems.includes(newItem)) {
      setSelectedGoodsItems([...selectedGoodsItems, newItem]);
    }
    setEditingGoodsList([...editingGoodsList, newItem]);
    setNewGoodItemInput('');
  };

  // 删除商品项
  const handleRemoveGoodItem = (index: number) => {
    const itemToRemove = editingGoodsList[index];
    setEditingGoodsList(editingGoodsList.filter((_, i) => i !== index));
    if (itemToRemove) {
      setSelectedGoodsItems(selectedGoodsItems.filter(it => it !== itemToRemove));
    }
  };

  // 保存【编辑维护档案】全部更新
  const handleSaveMaintainGoods = () => {
    if (!selectedCaseForMaintain) return;
    const updatedGoodsStr = selectedGoodsItems.join('、') || editingGoodsList.join('、') || (editingCaseInfo.goodsServices || editingCaseInfo.goodsItems || selectedCaseForMaintain.goodsServices || selectedCaseForMaintain.goodsItems || '');
    const updatedSimilarGroupsStr = selectedGroupCodes.map(gc => {
      const grp = availableGroupOptions.find(g => g.groupCode === gc);
      return grp ? `${gc} (${grp.groupName})` : gc;
    }).join('、') || editingCaseInfo.similarGroups || selectedCaseForMaintain.similarGroups || '';

    const formattedClasses = selectedClassCodes.map(c => {
      const item = fullNiceClassesList.find(n => n.code === c) || NICE_CLASSES_45.find(n => n.code === c);
      return item ? `${item.code} (${item.name})` : c;
    }).join('、') || editingCaseInfo.classes || selectedCaseForMaintain.classes;

    let updatedTimeline = selectedCaseForMaintain.timeline || [];
    if (editingNewStage.trim()) {
      updatedTimeline = [
        ...updatedTimeline,
        {
          stage: editingNewStage.trim(),
          date: editingNewDate || new Date().toISOString().slice(0, 10),
          description: editingNewDesc.trim() || `人工维护更新进度阶段为：【${editingNewStage.trim()}】`,
          status: 'COMPLETED'
        }
      ];
    } else if (editingCaseInfo.status && editingCaseInfo.status !== selectedCaseForMaintain.status) {
      const statusMap: Record<string, string> = {
        PENDING_APPLY: '准备递交申请',
        APPLYING: '官方递交申报完成',
        EXAMINING: '进入官方实质审查阶段',
        REGISTERED: '获准注册核发证书',
        PENDING_REPLY: '收到官方审查意见待答复',
        INVALID: '商标案件失效'
      };
      updatedTimeline = [
        ...updatedTimeline,
        {
          stage: statusMap[editingCaseInfo.status] || '注册状态变更',
          date: editingNewDate || new Date().toISOString().slice(0, 10),
          description: `人工在【编辑维护档案】将案件状态更新为【${statusMap[editingCaseInfo.status] || editingCaseInfo.status}】`,
          status: 'COMPLETED'
        }
      ];
    }

    const updated: CaseManagementItem = {
      ...selectedCaseForMaintain,
      goodsList: selectedGoodsItems.length > 0 ? selectedGoodsItems : (updatedGoodsStr ? updatedGoodsStr.split('、') : []),
      goodsItems: updatedGoodsStr || selectedCaseForMaintain.goodsItems,
      goodsServices: updatedGoodsStr || selectedCaseForMaintain.goodsServices || selectedCaseForMaintain.goodsItems,
      similarGroups: updatedSimilarGroupsStr || selectedCaseForMaintain.similarGroups,
      classes: formattedClasses,
      status: (editingCaseInfo.status as CaseManagementStatus) || selectedCaseForMaintain.status,
      officialAgency: editingCaseInfo.officialAgency ?? selectedCaseForMaintain.officialAgency,
      applicationNo: editingCaseInfo.applicationNo ?? selectedCaseForMaintain.applicationNo,
      applyDate: editingCaseInfo.applyDate ?? selectedCaseForMaintain.applyDate,
      registrationNo: editingCaseInfo.registrationNo ?? selectedCaseForMaintain.registrationNo,
      registrationDate: editingCaseInfo.registrationDate ?? selectedCaseForMaintain.registrationDate,
      regIssueDate: editingCaseInfo.regIssueDate ?? editingCaseInfo.registrationDate ?? selectedCaseForMaintain.regIssueDate,
      initialIssueNo: editingCaseInfo.initialIssueNo ?? selectedCaseForMaintain.initialIssueNo,
      initialIssueDate: editingCaseInfo.initialIssueDate ?? selectedCaseForMaintain.initialIssueDate,
      regIssueNo: editingCaseInfo.regIssueNo ?? selectedCaseForMaintain.regIssueNo,
      filingDeadline: editingCaseInfo.filingDeadline ?? selectedCaseForMaintain.filingDeadline,
      intlRegNo: editingCaseInfo.intlRegNo ?? selectedCaseForMaintain.intlRegNo,
      intlRegDate: editingCaseInfo.intlRegDate ?? selectedCaseForMaintain.intlRegDate,
      rightsEndDate: editingCaseInfo.rightsEndDate ?? selectedCaseForMaintain.rightsEndDate,
      validUntil: editingCaseInfo.rightsEndDate ?? editingCaseInfo.validUntil ?? selectedCaseForMaintain.validUntil,
      renewalStartDate: editingCaseInfo.renewalStartDate ?? selectedCaseForMaintain.renewalStartDate,
      agencyName: editingCaseInfo.agencyName ?? selectedCaseForMaintain.agencyName,
      agentName: editingCaseInfo.agentName ?? selectedCaseForMaintain.agentName,
      agencyEntrustDate: editingCaseInfo.agencyEntrustDate ?? selectedCaseForMaintain.agencyEntrustDate,
      agencyDocketNo: editingCaseInfo.agencyDocketNo ?? selectedCaseForMaintain.agencyDocketNo,
      priorityClaim: editingCaseInfo.priorityClaim ?? selectedCaseForMaintain.priorityClaim,
      region: editingCaseInfo.region || getRegionByCountry(editingCaseInfo.country || editingCaseInfo.priorityCountry || editingCaseInfo.jurisdiction || selectedCaseForMaintain.country || selectedCaseForMaintain.jurisdiction || '中国'),
      country: editingCaseInfo.country || editingCaseInfo.priorityCountry || editingCaseInfo.jurisdiction || selectedCaseForMaintain.country || selectedCaseForMaintain.jurisdiction || '中国',
      priorityCountry: editingCaseInfo.country || editingCaseInfo.priorityCountry || selectedCaseForMaintain.priorityCountry || '中国',
      jurisdiction: editingCaseInfo.country || editingCaseInfo.priorityCountry || editingCaseInfo.jurisdiction || selectedCaseForMaintain.jurisdiction || '中国',
      applicant: editingCaseInfo.applicant ?? selectedCaseForMaintain.applicant,
      applicantEn: editingCaseInfo.applicantEn ?? selectedCaseForMaintain.applicantEn,
      applicantAddress: editingCaseInfo.applicantAddress ?? selectedCaseForMaintain.applicantAddress,
      applicantAddressEn: editingCaseInfo.applicantAddressEn ?? selectedCaseForMaintain.applicantAddressEn,
      latestProgress: editingNewStage.trim() || editingCaseInfo.latestProgress || selectedCaseForMaintain.latestProgress,
      timeline: updatedTimeline,
    };

    if (onUpdateCase) {
      onUpdateCase(updated);
    }
    if (selectedCaseForView && selectedCaseForView.id === updated.id) {
      setSelectedCaseForView(updated);
    }
    addCaseOperationLog(updated.caseNo, {
      operationType: '修改基本信息',
      module: '基本信息',
      operator: '陆燕丽',
      operatorRole: '知产合规主管',
      department: '品牌知产保护中心',
      changeSummary: `编辑维护案件档案：更新类目【${formattedClasses}】，类似群组【${updatedSimilarGroupsStr}】，商品清单 (${selectedGoodsItems.length}项)，状态【${updated.status}】`,
      afterValue: `类似群组：${updatedSimilarGroupsStr}，商品服务：${updated.goodsItems}，状态：${updated.status}`,
      remarks: '人工维护案件基本信息与商品项'
    });
    setSelectedCaseForMaintain(null);
    showToast(`案件【${updated.caseNo}】档案与注册信息已成功编辑更新！`);
  };

  // 在案件详情生命周期中直接新增进度节点
  const handleAddTimelineStep = () => {
    if (!selectedCaseForView || !newTimelineStage.trim()) {
      showToast('请填写跟进节点/进度阶段名称！');
      return;
    }
    const newStep: CaseTimelineMilestone = {
      stage: newTimelineStage.trim(),
      date: newTimelineDate || new Date().toISOString().slice(0, 10),
      description: newTimelineDesc.trim() || `人工跟进记录：已完成【${newTimelineStage.trim()}】节点更新。`,
      status: 'COMPLETED'
    };

    let targetStatus = selectedCaseForView.status;
    if (newTimelineSyncStatus !== 'KEEP') {
      targetStatus = newTimelineSyncStatus as CaseManagementStatus;
    }

    const updatedTimeline = [...(selectedCaseForView.timeline || []), newStep];
    const updated: CaseManagementItem = {
      ...selectedCaseForView,
      status: targetStatus,
      timeline: updatedTimeline
    };

    if (onUpdateCase) {
      onUpdateCase(updated);
    }
    if (selectedCaseForView && selectedCaseForView.id === updated.id) {
      setSelectedCaseForView(updated);
    }
    addCaseOperationLog(updated.caseNo, {
      operationType: '更新案件状态',
      module: '流程状态',
      operator: selectedCaseForView.agentName || '张锦程',
      operatorRole: '商标代理人',
      department: '品牌知产保护中心',
      changeSummary: `录入办理进度节点【${newStep.stage}】，更新状态为【${targetStatus}】`,
      afterValue: `进度阶段：${newStep.stage}，时间：${newStep.date}`,
      remarks: newStep.description
    });
    setSelectedCaseForView(updated);
    setNewTimelineStage('');
    setNewTimelineDesc('');
    setIsAddingTimeline(false);
    showToast(`已成功录入最新注册进度节点【${newStep.stage}】！`);
  };

  // 快捷流转案件状态
  const handleQuickAdvanceStatus = (targetStatus: CaseManagementStatus) => {
    if (!selectedCaseForView) return;
    const updated: CaseManagementItem = {
      ...selectedCaseForView,
      status: targetStatus,
      timeline: [
        ...selectedCaseForView.timeline,
        {
          stage: targetStatus === 'APPLYING' ? '官方递交申报完成' :
                 targetStatus === 'EXAMINING' ? '进入官方实质审查阶段' :
                 targetStatus === 'REGISTERED' ? '获准注册核发证书' :
                 targetStatus === 'PENDING_REPLY' ? '收到官方审查意见待答复' : '状态变更为已失效',
          date: new Date().toLocaleString('zh-CN'),
          description: `状态由用户手动流转更新为【${
            targetStatus === 'APPLYING' ? '申请中' :
            targetStatus === 'EXAMINING' ? '审查中' :
            targetStatus === 'REGISTERED' ? '已注册' :
            targetStatus === 'PENDING_REPLY' ? '待答复' : '已失效'
          }】`,
          status: 'COMPLETED'
        }
      ]
    };
    if (onUpdateCase) {
      onUpdateCase(updated);
    }
    setSelectedCaseForView(updated);
    showToast(`案件【${updated.caseNo}】注册进度已更新为：${
      targetStatus === 'APPLYING' ? '申请中' :
      targetStatus === 'EXAMINING' ? '审查中' :
      targetStatus === 'REGISTERED' ? '已注册' :
      targetStatus === 'PENDING_REPLY' ? '待答复' : '已失效'
    }`);
  };



  const renderModals = () => {
    return (
      <>
      <>
        {toastMessage && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] max-w-md px-6 py-4 bg-slate-900/95 backdrop-blur-md text-white text-sm font-semibold rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-slate-700/80 pointer-events-none text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      {/* ======================================================== */}
      {/* 3. 弹窗 1: 【查看】案件详情 (样式保持与建案需求详情页完全一致) */}
      {/* ======================================================== */}
      {selectedCaseForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Top Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  selectedCaseForView.status === 'REGISTERED' ? 'bg-emerald-600 text-white' :
                  selectedCaseForView.status === 'EXAMINING' ? 'bg-amber-500 text-white' :
                  selectedCaseForView.status === 'APPLYING' ? 'bg-blue-600 text-white' :
                  selectedCaseForView.status === 'PENDING_APPLY' ? 'bg-rose-500 text-white' :
                  selectedCaseForView.status === 'PENDING_REPLY' ? 'bg-orange-500 text-white' :
                  'bg-blue-600 text-white'
                }`}>
                  {selectedCaseForView.status === 'REGISTERED' ? '已注册' :
                   selectedCaseForView.status === 'EXAMINING' ? '审查中' :
                   selectedCaseForView.status === 'APPLYING' ? '申请中' :
                   selectedCaseForView.status === 'PENDING_APPLY' ? '待申请' :
                   selectedCaseForView.status === 'PENDING_REPLY' ? '待答复' : '处理中'}
                </span>

                <h3 className="text-base font-bold text-slate-900">案件详情</h3>

                <div className="flex items-center gap-1.5 text-sm sm:text-base font-mono font-bold text-slate-900">
                  <span>{selectedCaseForView.caseNo}</span>
                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      title="复制案件编号"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedCaseForView.caseNo);
                        setCopiedId(`case_top_${selectedCaseForView.caseNo}`);
                        showToast(`已复制案件编号: ${selectedCaseForView.caseNo}`);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className={`p-1 rounded transition-colors flex items-center justify-center cursor-pointer ${
                        copiedId === `case_top_${selectedCaseForView.caseNo}`
                          ? 'text-emerald-600 bg-emerald-50'
                          : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      {copiedId === `case_top_${selectedCaseForView.caseNo}` ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                    {copiedId === `case_top_${selectedCaseForView.caseNo}` && (
                      <div className="absolute left-full ml-1.5 px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-sans font-medium rounded-md shadow-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 flex items-center gap-1 z-30">
                        <span>已复制</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenProposalDetail(selectedCaseForView.proposalNo, selectedCaseForView)}
                  className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-0.5 rounded border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
                  title="点击查看关联建案申请详情"
                >
                  <span>建案编码: {selectedCaseForView.proposalNo}</span>
                  <ExternalLink className="w-3 h-3 text-blue-500" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleOpenMaintainGoods(selectedCaseForView)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>编辑维护信息</span>
                  </button>
                )}
                <button
                  onClick={handleCloseCaseDetailModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-Navigation Tabs Bar */}
            <div className="px-6 bg-slate-50/80 border-b border-slate-200/80 flex items-center gap-6 text-xs shrink-0 overflow-x-auto">
              {[
                { key: 'basic', label: '基本信息' },
                { key: 'goods', label: '商品' },
                { key: 'applicant', label: '申请信息' },
                { key: 'tasks', label: '处理事项' },
                { key: 'files', label: '文件列表' },
                { key: 'evidence', label: '使用证据' },
                { key: 'history', label: '操作记录' }
              ].map((tab) => {
                const isActive = activeCaseDetailTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCaseDetailTab(tab.key as any)}
                    className={`py-3 font-medium cursor-pointer border-b-2 transition-all whitespace-nowrap ${
                      isActive
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
              
              {/* TAB 1: 基本信息 */}
              {activeCaseDetailTab === 'basic' && (
                <div className="space-y-6">
                  {/* 1. 建案申请信息 */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>建案申请信息</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div>
                        <span className="text-slate-500">案件编号：</span>
                        <span className="font-mono font-bold text-slate-900">{selectedCaseForView.caseNo}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">关联建案编码：</span>
                        <button
                          type="button"
                          onClick={() => handleOpenProposalDetail(selectedCaseForView.proposalNo, selectedCaseForView)}
                          className="font-mono font-bold text-blue-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{selectedCaseForView.proposalNo}</span>
                          <ExternalLink className="w-3 h-3 text-blue-500" />
                        </button>
                      </div>
                      <div>
                        <span className="text-slate-500">提案类型：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.proposalType || '商标'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">商标名称：</span>
                        <span className="text-slate-900 font-bold">{selectedCaseForView.trademarkName || 'SMART ORAL LAB'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">尼斯分类：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.classes || '第10类、第42类'}</span>
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <span className="text-slate-500">类似群组：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.similarGroups || '1001 (医疗器械及仪器)、4209 (计算机软件开发)'}</span>
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <span className="text-slate-500">商品/服务：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.goodsServices || selectedCaseForView.goodsItems || '牙科设备和仪器、医用冲牙器、口腔治疗仪器、数字化牙科印模仪、口腔检测分析计算机软件开发'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">重要等级：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.importanceLevel || '二级'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">商标等级：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.trademarkGrade || '核心级'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">商标形式：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.trademarkForm || '图形'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">颜色形式：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.colorForm || '黑白(不指定颜色)'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">业务类型：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.businessType || '国内注册'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">所属品牌：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.brand || 'kissday亲天'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请地区：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.region || getRegionByCountry(selectedCaseForView.country || selectedCaseForView.jurisdiction || '新加坡')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请国家：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.country || selectedCaseForView.jurisdiction || '新加坡'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">拟使用时间：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCaseForView.intendedUseDate || '2026-09-01'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请人 / 需求人：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.applicant || '李沐'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">接单/申请时间：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCaseForView.applyTime || '2026-08-10 13:38'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">需求部门：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.department || '创新业务部'}</span>
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <span className="text-slate-500">商品项目摘要：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.goodsItems || '牙科设备和仪器、医用冲牙器、口腔治疗仪器'}</span>
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <span className="text-slate-500">技术类别及检索范围：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.techCategory || '智能口腔算法、电机驱动控制'}</span>
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <span className="text-slate-500">产品领域：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.productDomain || '口腔护理智能硬件、电动牙刷冲牙器'}</span>
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <span className="text-slate-500">需求背景与用途简述：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.description || '东南亚智能口腔云健康监测平台、数字化牙齿抛光与香氛喷雾系统'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. 注册信息 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-l-2 border-slate-800 pl-2">
                      <h4 className="text-xs font-bold text-slate-900">注册信息</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div>
                        <span className="text-slate-500">案件流转状态：</span>
                        <span className="font-bold text-slate-900">
                          {selectedCaseForView.status === 'REGISTERED' ? '已注册' :
                           selectedCaseForView.status === 'EXAMINING' ? '审查中' :
                           selectedCaseForView.status === 'APPLYING' ? '申请中' :
                           selectedCaseForView.status === 'PENDING_APPLY' ? '待申请' :
                           selectedCaseForView.status === 'PENDING_REPLY' ? '待答复' : '已失效'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">最新注册进度：</span>
                        <span className="font-bold text-slate-900">
                          {selectedCaseForView.timeline && selectedCaseForView.timeline.length > 0 
                            ? selectedCaseForView.timeline[selectedCaseForView.timeline.length - 1].stage 
                            : '官方审查阶段'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">知识产权主管局：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.officialAgency || '国家知识产权局商标局 (CNIPA)'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">官方申请号：</span>
                        <span className="font-mono font-medium text-slate-900">{selectedCaseForView.applicationNo || 'TM20260813004'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">官方申请日：</span>
                        <span className="font-mono font-medium text-slate-900">{selectedCaseForView.applyDate || '2026-08-12'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">官方注册号：</span>
                        <span className="font-mono font-bold text-emerald-700">{selectedCaseForView.registrationNo || 'REG-8890123'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">官方注册日：</span>
                        <span className="font-mono font-medium text-slate-900">{selectedCaseForView.registrationDate || selectedCaseForView.regIssueDate || '2026-08-20'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">初审公告期号：</span>
                        <span className="font-mono font-medium text-slate-900">{selectedCaseForView.initialIssueNo || '1892期'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">初审公告日：</span>
                        <span className="font-mono font-medium text-slate-900">{selectedCaseForView.initialIssueDate || '2026-11-20'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">注册公告期号：</span>
                        <span className="font-mono font-medium text-slate-900">{selectedCaseForView.regIssueNo || '1904期'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">注册公告日：</span>
                        <span className="font-mono font-medium text-slate-900">{selectedCaseForView.regIssueDate || '2027-02-21'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申报/答复截止日：</span>
                        <span className="font-mono font-bold text-amber-700">{selectedCaseForView.filingDeadline || '2026-10-15'}</span>
                      </div>

                      <div>
                        <span className="text-slate-500">国际注册号：</span>
                        <span className="font-mono font-medium text-slate-900">{selectedCaseForView.intlRegNo || 'IR-2026-90812'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">国际注册日：</span>
                        <span className="font-mono font-medium text-slate-900">{selectedCaseForView.intlRegDate || '2026-08-15'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">续展起始日：</span>
                        <span className="font-mono font-medium text-slate-900">{selectedCaseForView.renewalStartDate || '2036-02-21'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">权利终止日/有效期止：</span>
                        <span className="font-mono font-medium text-slate-900">{selectedCaseForView.rightsEndDate || selectedCaseForView.validUntil || '2036-08-20'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请人主体：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.applicant || '广州星际悦动股份有限公司'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500">申请人英文：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.applicantEn || 'Guangzhou Starfield Delight Co., Ltd.'}</span>
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <span className="text-slate-500">申请人地址：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.applicantAddress || '广东省广州市天河区珠江东路28号越秀金融大厦38层'}</span>
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <span className="text-slate-500">申请人地址英文：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.applicantAddressEn || '38/F, Yuexiu Financial Tower, No.28 Zhujiang East Road, Tianhe District, Guangzhou, Guangdong, China'}</span>
                      </div>

                      <div>
                        <span className="text-slate-500">承办代理机构：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.agencyName || 'Allen & Gledhill LLP / 华进联合知识产权'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">代理人：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.agentName || '张锦程'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">委案日期：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCaseForView.agencyEntrustDate || '2026-08-11'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">代理机构案卷号：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedCaseForView.agencyDocketNo || 'AG-2026-TM-0891'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请/展出国家：</span>
                        <span className="text-slate-900 font-medium">{selectedCaseForView.priorityCountry || selectedCaseForView.jurisdiction || '新加坡、马来西亚'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 商品与商标类目 */}
              {activeCaseDetailTab === 'goods' && (() => {
                const linkedProposal = INITIAL_PROPOSALS.find(p => p.proposalNo === selectedCaseForView.proposalNo);
                const initialProposalClasses = selectedCaseForView.proposalClasses || linkedProposal?.classes || selectedCaseForView.classes;
                const initialProposalGroups = linkedProposal?.similarGroups || selectedCaseForView.similarGroups || '—';
                const initialProposalGoods = linkedProposal?.goodsServices || (selectedCaseForView.goodsServices || selectedCaseForView.goodsItems || (selectedCaseForView.goodsList ? selectedCaseForView.goodsList.join('、') : '—'));
                const isClassesModified = selectedCaseForView.classes !== initialProposalClasses;

                return (
                  <div className="space-y-5">
                    {/* 1. 商标类目 (尼斯分类)、类似群组与商品/服务 汇总与更新管理模块 */}
                    <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/50 p-4 rounded-xl border border-blue-100/80 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-blue-600" />
                          <h4 className="text-xs font-bold text-slate-900">商标类目 (尼斯分类)、类似群组与商品/服务管理</h4>
                          {isClassesModified ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                              <span>已按实际注册更新类目与商品</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              与建案申请类目一致
                            </span>
                          )}
                        </div>

                        {!readOnly && (!isEditingClasses ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingClasses(true);
                              setIsClassDropdownOpen(true);
                              setIsGroupDropdownOpen(false);
                              setIsGoodsDropdownOpen(false);

                              // 1. 初始化已选尼斯分类
                              const initialCodes = parseClassesToCodes(selectedCaseForView.classes || '');
                              setSelectedClassCodes(initialCodes);
                              setClassSearchKeyword('');
                              setEditingClassesInput(selectedCaseForView.classes || '');

                              // 2. 初始化已选类似群组
                              let initialGroupCodes: string[] = [];
                              if (selectedCaseForView.similarGroups) {
                                const matched = selectedCaseForView.similarGroups.match(/\b\d{4}\b/g);
                                if (matched) {
                                  initialGroupCodes = Array.from(new Set(matched));
                                } else {
                                  initialGroupCodes = selectedCaseForView.similarGroups.split(/[,、，\s]+/).filter(Boolean);
                                }
                              }
                              if (initialGroupCodes.length === 0 && initialCodes.length > 0) {
                                const rawGoodsStr = selectedCaseForView.goodsServices || selectedCaseForView.goodsItems || (selectedCaseForView.goodsList ? selectedCaseForView.goodsList.join('、') : '');
                                const goodsNames = rawGoodsStr.split(/[,、，;\n\r]+/).map(s => s.trim()).filter(Boolean);
                                const matchedGroups = niceItems
                                  .filter(item => goodsNames.some(gn => item.itemNameCn.includes(gn) || gn.includes(item.itemNameCn)))
                                  .map(item => item.groupCode);
                                if (matchedGroups.length > 0) {
                                  initialGroupCodes = Array.from(new Set(matchedGroups));
                                }
                              }
                              setSelectedGroupCodes(initialGroupCodes);
                              setGroupSearchKeyword('');

                              // 3. 初始化已选商品/服务
                              const initialGoods = selectedCaseForView.goodsList && selectedCaseForView.goodsList.length > 0
                                ? [...selectedCaseForView.goodsList]
                                : (selectedCaseForView.goodsServices || selectedCaseForView.goodsItems || '').split(/[,、，;\n\r]+/).map(s => s.trim()).filter(Boolean);
                              setSelectedGoodsItems(initialGoods);
                              setGoodsSearchKeyword('');
                            }}
                            className="px-3 py-1 text-xs font-semibold text-blue-600 bg-white hover:bg-blue-50 rounded-lg border border-blue-200 cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>更新实际注册类目与商品</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const formattedClasses = selectedClassCodes.map(c => {
                                  const item = fullNiceClassesList.find(n => n.code === c) || NICE_CLASSES_45.find(n => n.code === c);
                                  return item ? `${item.code} (${item.name})` : c;
                                }).join('、') || editingClassesInput.trim() || selectedCaseForView.classes;

                                const formattedSimilarGroups = selectedGroupCodes.map(gc => {
                                  const grp = availableGroupOptions.find(g => g.groupCode === gc);
                                  return grp ? `${gc} (${grp.groupName})` : gc;
                                }).join('、') || (selectedCaseForView.similarGroups || '');

                                const formattedGoods = selectedGoodsItems.join('、') || (selectedCaseForView.goodsServices || selectedCaseForView.goodsItems || '');

                                const updated: CaseManagementItem = {
                                  ...selectedCaseForView,
                                  classes: formattedClasses,
                                  similarGroups: formattedSimilarGroups,
                                  goodsServices: formattedGoods,
                                  goodsItems: formattedGoods,
                                  goodsList: selectedGoodsItems.length > 0 ? selectedGoodsItems : (formattedGoods ? formattedGoods.split('、') : selectedCaseForView.goodsList)
                                };
                                onUpdateCase?.(updated);
                                setSelectedCaseForView(updated);
                                setIsEditingClasses(false);
                                setIsClassDropdownOpen(false);
                                setIsGroupDropdownOpen(false);
                                setIsGoodsDropdownOpen(false);
                                showToast(`案件【${selectedCaseForView.caseNo}】实际注册类目、类似群组及商品/服务已成功更新`);
                              }}
                              className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>保存更新</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingClasses(false);
                                setIsClassDropdownOpen(false);
                                setIsGroupDropdownOpen(false);
                                setIsGoodsDropdownOpen(false);
                              }}
                              className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* 双类目与商品对比/编辑展示区 */}
                      {!isEditingClasses ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                          {/* 左侧：关联建案单申请类目 (初始类目) */}
                          <div className="p-3 bg-white rounded-lg border border-slate-200/90 space-y-2.5">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <span className="text-slate-500 font-bold">关联建案申请单规划 (初始申请)：</span>
                              <button
                                type="button"
                                onClick={() => handleOpenProposalDetail(selectedCaseForView.proposalNo, selectedCaseForView)}
                                className="text-[11px] text-blue-600 font-mono font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                                title="点击查看关联建案申请单"
                              >
                                <span>{selectedCaseForView.proposalNo}</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                            
                            {/* 1. 尼斯分类 */}
                            <div>
                              <span className="text-slate-400 text-[11px] block">尼斯分类：</span>
                              <div className="font-bold text-slate-800 text-xs font-mono flex items-center gap-1.5 mt-0.5">
                                <Layers className="w-3.5 h-3.5 text-slate-400" />
                                <span>{initialProposalClasses}</span>
                              </div>
                            </div>

                            {/* 2. 类似群组 */}
                            <div>
                              <span className="text-slate-400 text-[11px] block">类似群组：</span>
                              <div className="font-medium text-slate-700 text-xs mt-0.5">
                                {initialProposalGroups}
                              </div>
                            </div>

                            {/* 3. 商品/服务 */}
                            <div>
                              <span className="text-slate-400 text-[11px] block">拟保护商品/服务：</span>
                              <div className="text-slate-600 text-[11px] line-clamp-3 mt-0.5 leading-relaxed bg-slate-50 p-1.5 rounded border border-slate-100">
                                {initialProposalGoods}
                              </div>
                            </div>
                          </div>

                          {/* 右侧：实际注册类目、群组与商品 (官方核准) */}
                          <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-2xs space-y-2.5">
                            <div className="flex items-center justify-between pb-1 border-b border-blue-50">
                              <span className="text-slate-800 font-bold flex items-center gap-1">
                                <span>实际注册/官方核准档案：</span>
                              </span>
                              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                官方生效档案
                              </span>
                            </div>

                            {/* 1. 实际注册类目 (尼斯分类) */}
                            <div>
                              <span className="text-slate-400 text-[11px] block">实际注册类目 (尼斯分类)：</span>
                              <div className="font-extrabold text-blue-700 text-xs font-mono flex items-center gap-1.5 mt-0.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                <span>{selectedCaseForView.classes}</span>
                              </div>
                            </div>

                            {/* 2. 实际类似群组 */}
                            <div>
                              <span className="text-slate-400 text-[11px] block">类似群组：</span>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {selectedCaseForView.similarGroups ? (
                                  selectedCaseForView.similarGroups.split(/[,、，\s]+/).filter(Boolean).map((grp, gIdx) => (
                                    <span key={gIdx} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-100">
                                      {grp}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-400 text-xs">—</span>
                                )}
                              </div>
                            </div>

                            {/* 3. 实际核定商品/服务 */}
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-[11px]">商品/服务：</span>
                                <span className="text-[10px] text-blue-600 font-medium">
                                  共 {(selectedCaseForView.goodsList || (selectedCaseForView.goodsServices || selectedCaseForView.goodsItems || '').split('、')).filter(Boolean).length} 项
                                </span>
                              </div>
                              <div className="text-slate-700 text-[11px] line-clamp-3 mt-0.5 leading-relaxed bg-blue-50/40 p-1.5 rounded border border-blue-100/70">
                                {selectedCaseForView.goodsServices || selectedCaseForView.goodsItems || (selectedCaseForView.goodsList ? selectedCaseForView.goodsList.join('、') : '—')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* 编辑模式：三级联动选择与更新表单 (与新建检索需求页面完全一致) */
                        <div className="space-y-4 pt-1 bg-white p-4 rounded-xl border border-blue-200 shadow-sm animate-in fade-in duration-150">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                              <span>编辑实际注册信息 (尼斯分类、类似群组、商品/服务)</span>
                            </span>
                            <span className="text-[11px] text-slate-500">
                              请按官方下发证书或审查核准内容调整三级分类项目
                            </span>
                          </div>

                          {/* 1. 实际注册商标类目 (尼斯分类) */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
                              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-blue-600" />
                                实际注册商标类目 (尼斯分类) <span className="text-rose-500">*</span>
                              </label>
                              <span className="text-[11px] text-slate-500">
                                已选 <strong className="text-blue-600 font-bold">{selectedClassCodes.length}</strong> 个类目
                              </span>
                            </div>
                            <TrademarkClassSelector
                              selectedClassCodes={selectedClassCodes}
                              isDropdownOpen={isClassDropdownOpen}
                              searchKeyword={classSearchKeyword}
                              onToggleDropdown={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                              onToggleClassCode={(code) => handleToggleClassCode(code)}
                              onSetQuickClasses={(codes) => handleSetQuickClasses(codes)}
                              onSearchKeywordChange={(keyword) => setClassSearchKeyword(keyword)}
                              label=""
                            />
                          </div>

                          {/* 2. 类似群组 (Group) - 联动自已选尼斯分类 */}
                          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-blue-600" />
                                类似群组
                              </label>
                              <span className="text-[11px] text-slate-400 font-normal">
                                可用: {availableGroupOptions.length} / 已选: {selectedGroupCodes.length}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              根据所选【尼斯分类】动态展示对应群组
                            </div>

                            {/* 已选类似群组 Chip 列表 */}
                            <div 
                              onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                              className="flex items-center justify-between gap-2 min-h-[38px] p-1.5 px-2.5 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all shadow-2xs group"
                            >
                              <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                                {selectedGroupCodes.length === 0 ? (
                                  <span className="text-slate-400 text-xs">
                                    {selectedClassCodes.length === 0 ? '请先选尼斯分类...' : '请选择类似群组...'}
                                  </span>
                                ) : (
                                  selectedGroupCodes.map(code => {
                                    const grp = availableGroupOptions.find(g => g.groupCode === code);
                                    return (
                                      <span 
                                        key={code} 
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 shadow-2xs animate-in fade-in duration-150"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span className="font-mono font-bold">{code}</span>
                                        {grp ? <span className="truncate max-w-[100px]">- {grp.groupName}</span> : ''}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleGroupCode(code);
                                          }}
                                          className="p-0.5 hover:bg-blue-200/60 rounded text-blue-500 hover:text-blue-800 cursor-pointer"
                                          title="移除此群组"
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
                                  {isGroupDropdownOpen ? '收起' : '选择'}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isGroupDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                              </div>
                            </div>

                            {/* 可展开类似群组多选面板 */}
                            {isGroupDropdownOpen && (
                              <div className="mt-2 p-3 bg-white border border-blue-200 rounded-xl shadow-lg space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                                {/* 搜索栏与全选按钮 */}
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-1">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                      type="text"
                                      value={groupSearchKeyword}
                                      onChange={(e) => setGroupSearchKeyword(e.target.value)}
                                      placeholder="搜索代码或名称..."
                                      className="w-full text-xs text-slate-800 pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                    {groupSearchKeyword && (
                                      <button
                                        type="button"
                                        onClick={() => setGroupSearchKeyword('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleSelectAllAvailableGroups}
                                    className="px-2.5 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg whitespace-nowrap cursor-pointer transition-colors"
                                  >
                                    {selectedGroupCodes.length === availableGroupOptions.length && availableGroupOptions.length > 0 ? '取消' : '全选'}
                                  </button>
                                </div>

                                {/* 群组选项列表 */}
                                <div className="max-h-52 overflow-y-auto space-y-1 pr-1 text-xs">
                                  {availableGroupOptions.filter(grp => {
                                    if (!groupSearchKeyword.trim()) return true;
                                    const k = groupSearchKeyword.trim().toLowerCase();
                                    return grp.groupCode.toLowerCase().includes(k) ||
                                      grp.groupName.toLowerCase().includes(k) ||
                                      grp.classCode.toLowerCase().includes(k);
                                  }).length === 0 ? (
                                    <div className="py-6 text-center text-slate-400">
                                      未匹配到类似群组，请先选择上方尼斯分类
                                    </div>
                                  ) : (
                                    availableGroupOptions.filter(grp => {
                                      if (!groupSearchKeyword.trim()) return true;
                                      const k = groupSearchKeyword.trim().toLowerCase();
                                      return grp.groupCode.toLowerCase().includes(k) ||
                                        grp.groupName.toLowerCase().includes(k) ||
                                        grp.classCode.toLowerCase().includes(k);
                                    }).map(grp => {
                                      const isChecked = selectedGroupCodes.includes(grp.groupCode);
                                      return (
                                        <label
                                          key={grp.groupCode}
                                          className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                            isChecked
                                              ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-2xs'
                                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleToggleGroupCode(grp.groupCode)}
                                            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-xs flex items-center justify-between">
                                              <span className="font-mono">{grp.groupCode} - {grp.groupName}</span>
                                              {isChecked && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                                            </div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                              <span>{grp.classCode}</span>
                                              {grp.itemCount > 0 && <span>· {grp.itemCount}项</span>}
                                            </div>
                                          </div>
                                        </label>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 3. 商品/服务 (Goods & Services) - 联动自已选类似群组 */}
                          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-blue-600" />
                                商品/服务
                              </label>
                              <span className="text-[11px] text-slate-400 font-normal">
                                可用: {availableGoodsOptions.length} / 已选: {selectedGoodsItems.length}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              根据所选【类似群组】动态展示商品/服务项目
                            </div>

                            {/* 已选商品/服务 Chip 列表 */}
                            <div 
                              onClick={() => setIsGoodsDropdownOpen(!isGoodsDropdownOpen)}
                              className="flex items-center justify-between gap-2 min-h-[38px] p-1.5 px-2.5 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all shadow-2xs group"
                            >
                              <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                                {selectedGoodsItems.length === 0 ? (
                                  <span className="text-slate-400 text-xs">
                                    {selectedGroupCodes.length === 0 ? '请先选择类似群组...' : '请选择商品/服务项目...'}
                                  </span>
                                ) : (
                                  selectedGoodsItems.map(item => (
                                    <span 
                                      key={item} 
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 shadow-2xs animate-in fade-in duration-150"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span className="truncate max-w-[120px]">{item}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleGoodsItem(item);
                                        }}
                                        className="p-0.5 hover:bg-blue-200/60 rounded text-blue-500 hover:text-blue-800 cursor-pointer"
                                        title="移除此项目"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 shrink-0">
                                <span className="text-[11px] font-medium hidden sm:inline">
                                  {isGoodsDropdownOpen ? '收起' : '选择'}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isGoodsDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                              </div>
                            </div>

                            {/* 可展开商品/服务面板 */}
                            {isGoodsDropdownOpen && (
                              <div className="mt-2 p-3 bg-white border border-blue-200 rounded-xl shadow-lg space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                                {/* 搜索栏与全选按钮 */}
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-1">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                      type="text"
                                      value={goodsSearchKeyword}
                                      onChange={(e) => setGoodsSearchKeyword(e.target.value)}
                                      placeholder="搜索商品/服务名称（如：电动牙刷、牙膏...）"
                                      className="w-full text-xs text-slate-800 pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                    {goodsSearchKeyword && (
                                      <button
                                        type="button"
                                        onClick={() => setGoodsSearchKeyword('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleSelectAllAvailableGoods}
                                    className="px-2.5 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg whitespace-nowrap cursor-pointer transition-colors"
                                  >
                                    {selectedGoodsItems.length >= availableGoodsOptions.length && availableGoodsOptions.length > 0 ? '清空' : '全选'}
                                  </button>
                                </div>

                                {/* 商品/服务候选列表 (带 Checkbox) */}
                                <div className="max-h-52 overflow-y-auto space-y-1 pr-1 text-xs">
                                  {availableGoodsOptions.filter(it => {
                                    if (!goodsSearchKeyword.trim()) return true;
                                    const k = goodsSearchKeyword.trim().toLowerCase();
                                    return it.itemNameCn.toLowerCase().includes(k) ||
                                      it.groupCode.toLowerCase().includes(k) ||
                                      it.groupName.toLowerCase().includes(k);
                                  }).length === 0 ? (
                                    <div className="py-6 text-center text-slate-400">
                                      未找到匹配的标准商品/服务
                                    </div>
                                  ) : (
                                    availableGoodsOptions.filter(it => {
                                      if (!goodsSearchKeyword.trim()) return true;
                                      const k = goodsSearchKeyword.trim().toLowerCase();
                                      return it.itemNameCn.toLowerCase().includes(k) ||
                                        it.groupCode.toLowerCase().includes(k) ||
                                        it.groupName.toLowerCase().includes(k);
                                    }).map(it => {
                                      const isChecked = selectedGoodsItems.includes(it.itemNameCn);
                                      return (
                                        <label
                                          key={`${it.groupCode}-${it.itemNameCn}`}
                                          className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                            isChecked
                                              ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-2xs'
                                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleToggleGoodsItem(it.itemNameCn)}
                                            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-xs flex items-center justify-between">
                                              <span>{it.itemNameCn}</span>
                                              {isChecked && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                                            </div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                              <span className="font-mono text-blue-600 font-semibold">{it.groupCode}</span>
                                              <span>({it.groupName})</span>
                                              <span>· 第{String(it.classNum).padStart(2, '0')}类</span>
                                              {it.itemNameEn && <span className="italic truncate max-w-[140px]">· {it.itemNameEn}</span>}
                                            </div>
                                          </div>
                                        </label>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. 核定商品与服务项目清单 */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                        <span>核定商品与服务项目清单</span>
                      </h4>
                      <div className="flex items-center justify-between flex-wrap gap-3 py-1">
                        <div className="text-slate-500 text-xs">
                          实际注册类目：<span className="font-bold text-slate-900 font-mono">{selectedCaseForView.classes}</span>
                          <span className="ml-4">共 <strong className="text-blue-600 font-bold">{(selectedCaseForView.goodsList || (selectedCaseForView.goodsServices || selectedCaseForView.goodsItems || '').split('、')).filter(Boolean).length}</strong> 项核定商品</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                            <input
                              type="text"
                              value={goodsSearchQuery}
                              onChange={(e) => setGoodsSearchQuery(e.target.value)}
                              placeholder="搜索商品项目..."
                              className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500 w-48 sm:w-60"
                            />
                          </div>
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => handleOpenMaintainGoods(selectedCaseForView)}
                              className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>维护商品与类目</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                      {(selectedCaseForView.goodsList || (selectedCaseForView.goodsServices || selectedCaseForView.goodsItems || '').split('、'))
                        .filter(Boolean)
                        .filter(item => !goodsSearchQuery || item.toLowerCase().includes(goodsSearchQuery.toLowerCase()))
                        .map((item, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-4 h-4 rounded bg-slate-200 text-slate-600 font-mono text-[10px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-medium text-slate-800 truncate text-xs">{item}</span>
                            </div>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 font-medium">
                              官方核准
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })()}

              {/* TAB 3: 申请信息 */}
              {activeCaseDetailTab === 'applicant' && (() => {
                const caseApplicants = getCaseApplicants(selectedCaseForView);
                const caseOpposedParties = getCaseOpposedParties(selectedCaseForView);
                const casePriorities = getCasePriorities(selectedCaseForView);
                const caseAgents = getCaseAgents(selectedCaseForView);
                const caseLeaders = getCaseLeaders(selectedCaseForView);

                const currentApplicantsData = isEditingApplicants ? editingApplicantsDraft : caseApplicants;

                return (
                  <div className="space-y-5 text-xs">
                    {/* 1. 顶部 申请人 标题区 */}
                    <div className="flex items-center justify-between bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-cyan-500 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-bold text-cyan-900 tracking-tight">
                          申请人
                        </span>
                        {!readOnly && (<button
                          type="button"
                          onClick={() => setIsApplicantHistoryModalOpen(true)}
                          className="ml-2 px-2.5 py-1 bg-[#8cc63f] hover:bg-[#7cb534] text-white text-[11px] font-semibold rounded transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <History className="w-3 h-3" />
                          <span>查看变更历史</span>
                        </button>)}
                      </div>

                      {!readOnly && (!isEditingApplicants ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingApplicants(true);
                            setEditingApplicantsDraft(JSON.parse(JSON.stringify(caseApplicants)));
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>变更申请人</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingApplicants(false);
                              setEditingApplicantsDraft([]);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
                          >
                            取消修改
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const prevApplicants = getCaseApplicants(selectedCaseForView);
                              const newApplicants = editingApplicantsDraft;

                              // 检查是否有实质修改并记录变更流水
                              const currentHistory = getCaseApplicantHistory(selectedCaseForView);
                              const newHistoryEntries: CaseApplicantHistoryItem[] = [];
                              const todayStr = new Date().toISOString().slice(0, 10);

                              const oldPrimary = prevApplicants[0];
                              const newPrimary = newApplicants[0];

                              if (oldPrimary && newPrimary) {
                                const currentOperator = selectedCaseForView.agentName || '陆燕丽';

                                // 1. 检查申请人中文名称变更
                                if (oldPrimary.name?.trim() && newPrimary.name?.trim() && oldPrimary.name.trim() !== newPrimary.name.trim()) {
                                  newHistoryEntries.push({
                                    id: `hist-${Date.now()}-name`,
                                    seq: 0,
                                    changeType: '申请人名称变更',
                                    beforeValue: oldPrimary.name.trim(),
                                    afterValue: newPrimary.name.trim(),
                                    changer: currentOperator,
                                    changeDate: todayStr
                                  });
                                }

                                // 2. 检查申请人地址变更
                                if (oldPrimary.address?.trim() && newPrimary.address?.trim() && oldPrimary.address.trim() !== newPrimary.address.trim()) {
                                  newHistoryEntries.push({
                                    id: `hist-${Date.now()}-addr`,
                                    seq: 0,
                                    changeType: '申请人地址变更',
                                    beforeValue: oldPrimary.address.trim(),
                                    afterValue: newPrimary.address.trim(),
                                    changer: currentOperator,
                                    changeDate: todayStr
                                  });
                                }

                                // 3. 检查申请人英文名变更（若中文名未变但英文名单独变更）
                                if (oldPrimary.nameEn?.trim() && newPrimary.nameEn?.trim() && oldPrimary.nameEn.trim() !== newPrimary.nameEn.trim() && oldPrimary.name?.trim() === newPrimary.name?.trim()) {
                                  newHistoryEntries.push({
                                    id: `hist-${Date.now()}-en`,
                                    seq: 0,
                                    changeType: '申请人英文名称变更',
                                    beforeValue: oldPrimary.nameEn.trim(),
                                    afterValue: newPrimary.nameEn.trim(),
                                    changer: currentOperator,
                                    changeDate: todayStr
                                  });
                                }
                              }

                              if (newHistoryEntries.length > 0) {
                                const updatedHistory = [...currentHistory, ...newHistoryEntries].map((item, idx) => ({
                                  ...item,
                                  seq: idx + 1
                                }));
                                setCustomApplicantHistoryMap(prev => ({
                                  ...prev,
                                  [selectedCaseForView.caseNo]: updatedHistory
                                }));
                              }

                              setCustomApplicantsMap(prev => ({
                                ...prev,
                                [selectedCaseForView.caseNo]: newApplicants
                              }));

                              if (editingApplicantsDraft.length > 0) {
                                const updatedCase: CaseManagementItem = {
                                  ...selectedCaseForView,
                                  applicant: editingApplicantsDraft[0].name,
                                  applicantEn: editingApplicantsDraft[0].nameEn,
                                  applicantAddress: editingApplicantsDraft[0].address
                                };
                                setSelectedCaseForView(updatedCase);
                                onUpdateCase?.(updatedCase);
                              }

                              setIsEditingApplicants(false);
                              if (newHistoryEntries.length > 0) {
                                showToast(`申请人变更信息已保存，已自动记录 ${newHistoryEntries.length} 条主体变更历史！`);
                              } else {
                                showToast('申请人变更信息已保存成功！');
                              }
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>保存</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* 2. 申请人 主表格 (灰色表头，根据用户要求不含操作列) */}
                    <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-[#dcdcdc] text-slate-800 font-bold text-[11px] border-b border-slate-300">
                            <th className="py-2.5 px-3 w-16 text-center">序号</th>
                            <th className="py-2.5 px-4 min-w-[200px]">名称</th>
                            <th className="py-2.5 px-4 min-w-[220px]">英文名</th>
                            <th className="py-2.5 px-4 min-w-[300px]">申请人地址</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                          {currentApplicantsData.map((app, idx) => (
                            <tr key={app.id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-3 text-center font-mono text-slate-500 font-medium">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-4 font-bold text-slate-900">
                                {isEditingApplicants ? (
                                  <input
                                    type="text"
                                    value={app.name || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditingApplicantsDraft(prev =>
                                        prev.map((item, i) => i === idx ? { ...item, name: val } : item)
                                      );
                                    }}
                                    className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white border border-blue-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                                    placeholder="请输入申请人主体名称"
                                  />
                                ) : (
                                  app.name
                                )}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-slate-700 text-[11px]">
                                {isEditingApplicants ? (
                                  <input
                                    type="text"
                                    value={app.nameEn || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditingApplicantsDraft(prev =>
                                        prev.map((item, i) => i === idx ? { ...item, nameEn: val } : item)
                                      );
                                    }}
                                    className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-white border border-blue-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs font-mono"
                                    placeholder="请输入申请人英文名"
                                  />
                                ) : (
                                  app.nameEn
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-slate-700 leading-relaxed">
                                {isEditingApplicants ? (
                                  <input
                                    type="text"
                                    value={app.address || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditingApplicantsDraft(prev =>
                                        prev.map((item, i) => i === idx ? { ...item, address: val } : item)
                                      );
                                    }}
                                    className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-white border border-blue-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                                    placeholder="请输入申请人地址"
                                  />
                                ) : (
                                  app.address
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 3. 4 个展开/收起子模块: 被异议人信息, 优先权信息, 代理人列表, 负责人 */}
                    <div className="space-y-2 pt-1">
                      
                      {/* (1) 被异议人信息 */}
                      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => setApplicantSubSections(prev => ({ ...prev, opposed: !prev.opposed }))}
                          className="w-full px-4 py-2.5 bg-slate-50/90 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-cyan-500 text-white flex items-center justify-center shrink-0">
                              <Users className="w-3 h-3" />
                            </div>
                            <span className="font-bold text-blue-700 hover:underline text-xs">被异议人信息</span>
                            <span className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-semibold border border-cyan-100">
                              {caseOpposedParties.length} 项
                            </span>
                          </div>
                          {applicantSubSections.opposed ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        {applicantSubSections.opposed && (
                          <div className="p-3 border-t border-slate-200/80 space-y-3">
                            <div className="flex justify-end">
                              {!readOnly && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItem: CaseOpposedPartyInfo = {
                                      id: `opp_${Date.now()}`,
                                      seq: caseOpposedParties.length + 1,
                                      name: '',
                                      nameEn: '',
                                      address: ''
                                    };
                                    const updated = [...caseOpposedParties, newItem];
                                    setCustomOpposedMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
                                    setEditingOpposedId(newItem.id);
                                    setEditingOpposedDraft({ ...newItem });
                                    setApplicantSubSections(prev => ({ ...prev, opposed: true }));
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  新增被异议人
                                </button>
                              )}
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                                    <th className="py-2 px-3 w-12 text-center">序号</th>
                                    <th className="py-2 px-3">名称</th>
                                    <th className="py-2 px-3">英文名</th>
                                    <th className="py-2 px-3">地址</th>
                                    {!readOnly && <th className="py-2 px-3 w-28 text-center">操作</th>}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {caseOpposedParties.map((op, idx) => {
                                    const isEditing = editingOpposedId === op.id;
                                    return (
                                      <tr key={op.id || idx} className="hover:bg-slate-50">
                                        <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                                        <td className="py-2 px-3 font-semibold text-slate-900">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingOpposedDraft?.name || ''}
                                              onChange={(e) => setEditingOpposedDraft(prev => prev ? { ...prev, name: e.target.value } : prev)}
                                              placeholder="请输入企业名称"
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                                              autoFocus
                                            />
                                          ) : (
                                            op.name || '-'
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingOpposedDraft?.nameEn || ''}
                                              onChange={(e) => setEditingOpposedDraft(prev => prev ? { ...prev, nameEn: e.target.value } : prev)}
                                              placeholder="英文名称"
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                            />
                                          ) : (
                                            op.nameEn || '-'
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-slate-600">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingOpposedDraft?.address || ''}
                                              onChange={(e) => setEditingOpposedDraft(prev => prev ? { ...prev, address: e.target.value } : prev)}
                                              placeholder="企业地址"
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                          ) : (
                                            op.address || '-'
                                          )}
                                        </td>
                                        {!readOnly && (
                                          <td className="py-2 px-3 text-center">
                                          {isEditing ? (
                                            <div className="flex items-center justify-center gap-1.5">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (editingOpposedDraft) {
                                                    const finalName = editingOpposedDraft.name.trim() || '未命名被异议人';
                                                    const draftToSave = { ...editingOpposedDraft, name: finalName };
                                                    const updated = caseOpposedParties.map((item) => item.id === op.id ? draftToSave : item);
                                                    setCustomOpposedMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
                                                    setEditingOpposedId(null);
                                                    setEditingOpposedDraft(null);
                                                    showToast('被异议人信息已保存成功！');
                                                  }
                                                }}
                                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium rounded transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                              >
                                                <Check className="w-3 h-3" />
                                                <span>保存</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (!op.name && !op.nameEn && !op.address) {
                                                    const updated = caseOpposedParties.filter(item => item.id !== op.id);
                                                    setCustomOpposedMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
                                                  }
                                                  setEditingOpposedId(null);
                                                  setEditingOpposedDraft(null);
                                                }}
                                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded border border-slate-300 transition-colors cursor-pointer"
                                              >
                                                取消
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-center gap-2">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEditingOpposedId(op.id);
                                                  setEditingOpposedDraft({ ...op });
                                                }}
                                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-medium rounded border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                                              >
                                                <Edit3 className="w-3 h-3" />
                                                <span>修改</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setDeletingApplicantSubItem({
                                                    type: 'opposed',
                                                    id: op.id,
                                                    title: '被异议人信息',
                                                    description: `确定要删除被异议人【${op.name || '未命名'}】吗？删除后该记录将从本案件列表中移除。`,
                                                    details: [
                                                      { label: '企业名称', value: op.name || '-' },
                                                      { label: '英文名称', value: op.nameEn || '-' },
                                                      { label: '企业地址', value: op.address || '-' }
                                                    ]
                                                  });
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                                title="删除"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          )}
                                        </td>
                                        )}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* (2) 优先权信息 */}
                      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => setApplicantSubSections(prev => ({ ...prev, priority: !prev.priority }))}
                          className="w-full px-4 py-2.5 bg-slate-50/90 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-cyan-500 text-white flex items-center justify-center shrink-0">
                              <Award className="w-3 h-3" />
                            </div>
                            <span className="font-bold text-blue-700 hover:underline text-xs">优先权信息</span>
                            <span className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-semibold border border-cyan-100">
                              {casePriorities.length} 项
                            </span>
                          </div>
                          {applicantSubSections.priority ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        {applicantSubSections.priority && (
                          <div className="p-3 border-t border-slate-200/80 space-y-3">
                            <div className="flex justify-end">
                              {!readOnly && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItem: CasePriorityInfo = {
                                      id: `pri_${Date.now()}`,
                                      seq: casePriorities.length + 1,
                                      applicationNo: '',
                                      country: '中国 (CN)',
                                      applicationDate: new Date().toISOString().slice(0, 10),
                                      dasCode: '',
                                      priorityType: '商标优先权'
                                    };
                                    const updated = [...casePriorities, newItem];
                                    setCustomPriorityMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
                                    setEditingPriorityId(newItem.id);
                                    setEditingPriorityDraft({ ...newItem });
                                    setApplicantSubSections(prev => ({ ...prev, priority: true }));
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  新增优先权
                                </button>
                              )}
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse min-w-[720px]">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                                    <th className="py-2 px-3 w-12 text-center">序号</th>
                                    <th className="py-2 px-3">优先权号</th>
                                    <th className="py-2 px-3">优先权地区</th>
                                    <th className="py-2 px-3">优先权日</th>
                                    <th className="py-2 px-3">接入码</th>
                                    <th className="py-2 px-3">优先权类型</th>
                                    {!readOnly && <th className="py-2 px-3 w-28 text-center">操作</th>}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {casePriorities.map((pri, idx) => {
                                    const isEditing = editingPriorityId === pri.id;
                                    return (
                                      <tr key={pri.id || idx} className="hover:bg-slate-50">
                                        <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                                        <td className="py-2 px-3 font-mono text-slate-900 font-semibold">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingPriorityDraft?.applicationNo || ''}
                                              onChange={(e) => setEditingPriorityDraft(prev => prev ? { ...prev, applicationNo: e.target.value } : prev)}
                                              placeholder="请输入优先权号"
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                              autoFocus
                                            />
                                          ) : (
                                            pri.applicationNo || '-'
                                          )}
                                        </td>
                                        <td className="py-2 px-3 font-medium text-slate-800">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingPriorityDraft?.country || ''}
                                              onChange={(e) => setEditingPriorityDraft(prev => prev ? { ...prev, country: e.target.value } : prev)}
                                              placeholder="优先权地区"
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                          ) : (
                                            pri.country || '-'
                                          )}
                                        </td>
                                        <td className="py-2 px-3 font-mono text-slate-700">
                                          {isEditing ? (
                                            <input
                                              type="date"
                                              value={editingPriorityDraft?.applicationDate || ''}
                                              onChange={(e) => setEditingPriorityDraft(prev => prev ? { ...prev, applicationDate: e.target.value } : prev)}
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                            />
                                          ) : (
                                            pri.applicationDate || '-'
                                          )}
                                        </td>
                                        <td className="py-2 px-3 font-mono text-slate-700">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingPriorityDraft?.dasCode || ''}
                                              onChange={(e) => setEditingPriorityDraft(prev => prev ? { ...prev, dasCode: e.target.value } : prev)}
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                              placeholder="接入码"
                                            />
                                          ) : (
                                            pri.dasCode || '-'
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-slate-700 font-medium">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingPriorityDraft?.priorityType || ''}
                                              onChange={(e) => setEditingPriorityDraft(prev => prev ? { ...prev, priorityType: e.target.value } : prev)}
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                              placeholder="优先权类型"
                                            />
                                          ) : (
                                            pri.priorityType || '-'
                                          )}
                                        </td>
                                        {!readOnly && (
                                          <td className="py-2 px-3 text-center">
                                          {isEditing ? (
                                            <div className="flex items-center justify-center gap-1.5">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (editingPriorityDraft) {
                                                    const finalAppNo = editingPriorityDraft.applicationNo.trim() || '未填写优先权号';
                                                    const draftToSave = { ...editingPriorityDraft, applicationNo: finalAppNo };
                                                    const updated = casePriorities.map((item) => item.id === pri.id ? draftToSave : item);
                                                    setCustomPriorityMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
                                                    setEditingPriorityId(null);
                                                    setEditingPriorityDraft(null);
                                                    showToast('优先权信息已保存成功！');
                                                  }
                                                }}
                                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium rounded transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                              >
                                                <Check className="w-3 h-3" />
                                                <span>保存</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (!pri.applicationNo) {
                                                    const updated = casePriorities.filter(item => item.id !== pri.id);
                                                    setCustomPriorityMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
                                                  }
                                                  setEditingPriorityId(null);
                                                  setEditingPriorityDraft(null);
                                                }}
                                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded border border-slate-300 transition-colors cursor-pointer"
                                              >
                                                取消
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-center gap-2">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEditingPriorityId(pri.id);
                                                  setEditingPriorityDraft({ ...pri });
                                                }}
                                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-medium rounded border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                                              >
                                                <Edit3 className="w-3 h-3" />
                                                <span>修改</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setDeletingApplicantSubItem({
                                                    type: 'priority',
                                                    id: pri.id,
                                                    title: '优先权信息',
                                                    description: `确定要删除优先权号【${pri.applicationNo || '未填写'}】吗？删除后该记录将从本案件列表中移除。`,
                                                    details: [
                                                      { label: '优先权号', value: pri.applicationNo || '-' },
                                                      { label: '优先权地区', value: pri.country || '-' },
                                                      { label: '优先权日', value: pri.applicationDate || '-' },
                                                      { label: '接入码', value: pri.dasCode || '-' },
                                                      { label: '优先权类型', value: pri.priorityType || '-' }
                                                    ]
                                                  });
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                                title="删除"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          )}
                                        </td>
                                        )}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* (3) 代理人列表 */}
                      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => setApplicantSubSections(prev => ({ ...prev, agents: !prev.agents }))}
                          className="w-full px-4 py-2.5 bg-slate-50/90 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-cyan-500 text-white flex items-center justify-center shrink-0">
                              <Users className="w-3 h-3" />
                            </div>
                            <span className="font-bold text-blue-700 hover:underline text-xs">代理人列表</span>
                            <span className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-semibold border border-cyan-100">
                              {caseAgents.length} 项
                            </span>
                          </div>
                          {applicantSubSections.agents ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        {applicantSubSections.agents && (
                          <div className="p-3 border-t border-slate-200/80 space-y-3">
                            <div className="flex justify-end">
                              {!readOnly && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItem: CaseAgentInfo = {
                                      id: `ag_${Date.now()}`,
                                      seq: caseAgents.length + 1,
                                      agentName: '',
                                      phone: '',
                                      email: '',
                                      licenseNo: ''
                                    };
                                    const updated = [...caseAgents, newItem];
                                    setCustomAgentsMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
                                    setEditingAgentId(newItem.id);
                                    setEditingAgentDraft({ ...newItem });
                                    setApplicantSubSections(prev => ({ ...prev, agents: true }));
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  新增代理人
                                </button>
                              )}
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                                    <th className="py-2 px-3 w-12 text-center">序号</th>
                                    <th className="py-2 px-3">姓名</th>
                                    <th className="py-2 px-3">电话</th>
                                    <th className="py-2 px-3">E-mail</th>
                                    <th className="py-2 px-3">执业证书</th>
                                    {!readOnly && <th className="py-2 px-3 w-28 text-center">操作</th>}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {caseAgents.map((ag, idx) => {
                                    const isEditing = editingAgentId === ag.id;
                                    return (
                                      <tr key={ag.id || idx} className="hover:bg-slate-50">
                                        <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                                        <td className="py-2 px-3 font-medium text-slate-900 font-semibold">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingAgentDraft?.agentName || ''}
                                              onChange={(e) => setEditingAgentDraft(prev => prev ? { ...prev, agentName: e.target.value } : prev)}
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                                              placeholder="请输入姓名"
                                              autoFocus
                                            />
                                          ) : (
                                            ag.agentName || '-'
                                          )}
                                        </td>
                                        <td className="py-2 px-3 font-mono text-slate-700">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingAgentDraft?.phone || ''}
                                              onChange={(e) => setEditingAgentDraft(prev => prev ? { ...prev, phone: e.target.value } : prev)}
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                              placeholder="电话"
                                            />
                                          ) : (
                                            ag.phone || '-'
                                          )}
                                        </td>
                                        <td className="py-2 px-3 font-mono text-slate-700">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingAgentDraft?.email || ''}
                                              onChange={(e) => setEditingAgentDraft(prev => prev ? { ...prev, email: e.target.value } : prev)}
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                              placeholder="E-mail"
                                            />
                                          ) : (
                                            ag.email || '-'
                                          )}
                                        </td>
                                        <td className="py-2 px-3 font-mono text-slate-700">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingAgentDraft?.licenseNo || ''}
                                              onChange={(e) => setEditingAgentDraft(prev => prev ? { ...prev, licenseNo: e.target.value } : prev)}
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                              placeholder="执业证书"
                                            />
                                          ) : (
                                            ag.licenseNo || '-'
                                          )}
                                        </td>
                                        {!readOnly && (
                                          <td className="py-2 px-3 text-center">
                                          {isEditing ? (
                                            <div className="flex items-center justify-center gap-1.5">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (editingAgentDraft) {
                                                    const finalName = editingAgentDraft.agentName.trim() || '未命名代理人';
                                                    const draftToSave = { ...editingAgentDraft, agentName: finalName };
                                                    const updated = caseAgents.map((item) => item.id === ag.id ? draftToSave : item);
                                                    setCustomAgentsMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
                                                    setEditingAgentId(null);
                                                    setEditingAgentDraft(null);
                                                    showToast('代理人信息已保存成功！');
                                                  }
                                                }}
                                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium rounded transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                              >
                                                <Check className="w-3 h-3" />
                                                <span>保存</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (!ag.agentName && !ag.phone) {
                                                    const updated = caseAgents.filter(item => item.id !== ag.id);
                                                    setCustomAgentsMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
                                                  }
                                                  setEditingAgentId(null);
                                                  setEditingAgentDraft(null);
                                                }}
                                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded border border-slate-300 transition-colors cursor-pointer"
                                              >
                                                取消
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-center gap-2">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEditingAgentId(ag.id);
                                                  setEditingAgentDraft({ ...ag });
                                                }}
                                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-medium rounded border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                                              >
                                                <Edit3 className="w-3 h-3" />
                                                <span>修改</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setDeletingApplicantSubItem({
                                                    type: 'agent',
                                                    id: ag.id,
                                                    title: '代理人信息',
                                                    description: `确定要删除代理人【${ag.agentName || '未命名'}】吗？删除后该记录将从本案件列表中移除。`,
                                                    details: [
                                                      { label: '姓名', value: ag.agentName || '-' },
                                                      { label: '电话', value: ag.phone || '-' },
                                                      { label: 'E-mail', value: ag.email || '-' },
                                                      { label: '执业证书', value: ag.licenseNo || '-' }
                                                    ]
                                                  });
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                                title="删除"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          )}
                                        </td>
                                        )}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* (4) 负责人 */}
                      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => setApplicantSubSections(prev => ({ ...prev, leaders: !prev.leaders }))}
                          className="w-full px-4 py-2.5 bg-slate-50/90 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-cyan-500 text-white flex items-center justify-center shrink-0">
                              <User className="w-3 h-3" />
                            </div>
                            <span className="font-bold text-blue-700 hover:underline text-xs">负责人</span>
                            <span className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-semibold border border-cyan-100">
                              {caseLeaders.length} 项
                            </span>
                          </div>
                          {applicantSubSections.leaders ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        {applicantSubSections.leaders && (
                          <div className="p-3 border-t border-slate-200/80 space-y-3">
                            <div className="flex justify-end">
                              {!readOnly && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItem: CaseLeaderInfo = {
                                      id: `ld_${Date.now()}`,
                                      seq: caseLeaders.length + 1,
                                      name: '',
                                      phone: '',
                                      email: ''
                                    };
                                    const updated = [...caseLeaders, newItem];
                                    setCustomLeadersMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
                                    setEditingLeaderId(newItem.id);
                                    setEditingLeaderDraft({ ...newItem });
                                    setApplicantSubSections(prev => ({ ...prev, leaders: true }));
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  新增负责人
                                </button>
                              )}
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                                    <th className="py-2 px-3 w-12 text-center">序号</th>
                                    <th className="py-2 px-3">姓名</th>
                                    <th className="py-2 px-3">电话</th>
                                    <th className="py-2 px-3">E-mail</th>
                                    {!readOnly && <th className="py-2 px-3 w-28 text-center">操作</th>}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {caseLeaders.map((ld, idx) => {
                                    const isEditing = editingLeaderId === ld.id;
                                    return (
                                      <tr key={ld.id || idx} className="hover:bg-slate-50">
                                        <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                                        <td className="py-2 px-3 font-semibold text-slate-900">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingLeaderDraft?.name || ''}
                                              onChange={(e) => setEditingLeaderDraft(prev => prev ? { ...prev, name: e.target.value } : prev)}
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                                              placeholder="请输入姓名"
                                              autoFocus
                                            />
                                          ) : (
                                            ld.name || '-'
                                          )}
                                        </td>
                                        <td className="py-2 px-3 font-mono text-slate-700">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingLeaderDraft?.phone || ''}
                                              onChange={(e) => setEditingLeaderDraft(prev => prev ? { ...prev, phone: e.target.value } : prev)}
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                              placeholder="电话"
                                            />
                                          ) : (
                                            ld.phone || '-'
                                          )}
                                        </td>
                                        <td className="py-2 px-3 font-mono text-slate-700">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingLeaderDraft?.email || ''}
                                              onChange={(e) => setEditingLeaderDraft(prev => prev ? { ...prev, email: e.target.value } : prev)}
                                              className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                              placeholder="E-mail"
                                            />
                                          ) : (
                                            ld.email || '-'
                                          )}
                                        </td>
                                        {!readOnly && (
                                          <td className="py-2 px-3 text-center">
                                          {isEditing ? (
                                            <div className="flex items-center justify-center gap-1.5">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (editingLeaderDraft) {
                                                    const finalName = editingLeaderDraft.name.trim() || '未命名负责人';
                                                    const draftToSave = { ...editingLeaderDraft, name: finalName };
                                                    const updated = caseLeaders.map((item) => item.id === ld.id ? draftToSave : item);
                                                    setCustomLeadersMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
                                                    setEditingLeaderId(null);
                                                    setEditingLeaderDraft(null);
                                                    showToast('负责人信息已保存成功！');
                                                  }
                                                }}
                                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium rounded transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                              >
                                                <Check className="w-3 h-3" />
                                                <span>保存</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (!ld.name && !ld.phone) {
                                                    const updated = caseLeaders.filter(item => item.id !== ld.id);
                                                    setCustomLeadersMap(prev => ({ ...prev, [selectedCaseForView.caseNo]: updated }));
                                                  }
                                                  setEditingLeaderId(null);
                                                  setEditingLeaderDraft(null);
                                                }}
                                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded border border-slate-300 transition-colors cursor-pointer"
                                              >
                                                取消
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-center gap-2">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEditingLeaderId(ld.id);
                                                  setEditingLeaderDraft({ ...ld });
                                                }}
                                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-medium rounded border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                                              >
                                                <Edit3 className="w-3 h-3" />
                                                <span>修改</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setDeletingApplicantSubItem({
                                                    type: 'leader',
                                                    id: ld.id,
                                                    title: '负责人信息',
                                                    description: `确定要删除负责人【${ld.name || '未命名'}】吗？删除后该记录将从本案件列表中移除。`,
                                                    details: [
                                                      { label: '姓名', value: ld.name || '-' },
                                                      { label: '电话', value: ld.phone || '-' },
                                                      { label: 'E-mail', value: ld.email || '-' }
                                                    ]
                                                  });
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                                title="删除"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          )}
                                        </td>
                                        )}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* TAB 4: 处理事项 */}
              {activeCaseDetailTab === 'tasks' && (() => {
                const handlingTasks = getCaseHandlingTasks(selectedCaseForView);
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-blue-600 pl-2">
                          <span>处理事项列表</span>
                        </h4>
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold border border-blue-100">
                          共 {handlingTasks.length} 项
                        </span>
                      </div>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={handleOpenCreateHandlingTask}
                          className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>新增新处理事项</span>
                        </button>
                      )}
                    </div>

                    <div className="border border-slate-200/90 rounded-xl overflow-x-auto bg-white shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold text-[11px]">
                            <th className="py-2.5 px-3 w-12 text-center whitespace-nowrap">序号</th>
                            <th className="py-2.5 px-3 min-w-[160px] whitespace-nowrap">处理事项</th>
                            <th className="py-2.5 px-3 min-w-[100px] whitespace-nowrap">处理状态</th>
                            <th className="py-2.5 px-3 min-w-[120px] whitespace-nowrap">案件阶段</th>
                            <th className="py-2.5 px-3 w-24 whitespace-nowrap">处理人</th>
                            <th className="py-2.5 px-3 w-28 whitespace-nowrap">委案日期</th>
                            <th className="py-2.5 px-3 w-28 whitespace-nowrap">初稿期限</th>
                            <th className="py-2.5 px-3 w-28 whitespace-nowrap">内部期限</th>
                            <th className="py-2.5 px-3 w-28 whitespace-nowrap">官方期限</th>
                            <th className="py-2.5 px-3 w-28 whitespace-nowrap">初稿日</th>
                            <th className="py-2.5 px-3 w-28 whitespace-nowrap">定稿日</th>
                            <th className="py-2.5 px-3 w-28 whitespace-nowrap">完成日</th>
                            <th className="py-2.5 px-3 w-20 whitespace-nowrap text-center">核稿分值</th>
                            <th className="py-2.5 px-3 w-28 whitespace-nowrap">检索期限</th>
                            <th className="py-2.5 px-3 w-28 whitespace-nowrap">检索日</th>
                            <th className="py-2.5 px-3 min-w-[160px] whitespace-nowrap">备注</th>
                            <th className="py-2.5 px-3 min-w-[160px] text-center sticky right-0 z-10 bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] border-l border-slate-200/80 whitespace-nowrap">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          {handlingTasks.length === 0 ? (
                            <tr>
                              <td colSpan={17} className="py-8 text-center text-slate-400">
                                暂无处理事项，点击右上角【新增新处理事项】按钮进行添加
                              </td>
                            </tr>
                          ) : (
                            handlingTasks.map((task, idx) => {
                              const isCompleted = task.status === '已完成' || task.status === 'COMPLETED' || !!task.completionDate;
                              const isOngoing = task.status === '处理中' || task.status === 'IN_PROGRESS';
                              return (
                                <tr key={task.id || idx} className="hover:bg-slate-50/80 transition-colors group">
                                  <td className="py-3 px-3 text-center font-mono text-slate-400 font-medium whitespace-nowrap">
                                    {idx + 1}
                                  </td>
                                  <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                                    <span className="truncate max-w-[220px] inline-block align-bottom" title={task.taskName}>{task.taskName}</span>
                                  </td>
                                  <td className="py-3 px-3 whitespace-nowrap">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${
                                      isCompleted
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : isOngoing
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}>
                                      {task.status || (task.completionDate ? '已完成' : '待处理')}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                                    <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                                      {task.stage || '实质审查阶段'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                                    {task.undertaker || task.handler || '-'}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-700 font-medium whitespace-nowrap">
                                    {task.entrustDate || '-'}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-700 font-medium whitespace-nowrap">
                                    {task.draftDeadline || '-'}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-700 font-medium whitespace-nowrap">
                                    {task.internalDeadline || '-'}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-700 font-medium whitespace-nowrap">
                                    {task.officialDeadline || '-'}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-700 font-medium whitespace-nowrap">
                                    {task.firstDraftDate || '-'}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-700 font-medium whitespace-nowrap">
                                    {task.finalDraftDate || '-'}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-700 font-medium whitespace-nowrap">
                                    {task.completionDate || (
                                      <span className="text-slate-400 font-normal">未完成</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-center font-semibold text-blue-600 whitespace-nowrap">
                                    {task.reviewScore ? `${task.reviewScore}分` : '-'}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-700 font-medium whitespace-nowrap">
                                    {task.searchDeadline || '-'}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-700 font-medium whitespace-nowrap">
                                    {task.searchDate || '-'}
                                  </td>
                                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap" title={task.remarks}>
                                    <span className="truncate max-w-[200px] inline-block align-bottom">{task.remarks || '-'}</span>
                                  </td>
                                  <td className="py-3 px-3 text-center sticky right-0 z-10 bg-white group-hover:bg-slate-50 transition-colors shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] border-l border-slate-100 whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenViewHandlingTask(task)}
                                        className="px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer flex items-center gap-1 font-medium text-xs whitespace-nowrap"
                                        title="预览处理事项"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>预览</span>
                                      </button>
                                      {!readOnly && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditHandlingTask(task)}
                                            className="px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer flex items-center gap-1 font-medium text-xs whitespace-nowrap"
                                            title="编辑处理事项"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>编辑</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setDeletingHandlingTask(task)}
                                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                            title="删除处理事项"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 5: 文件列表 */}
              {activeCaseDetailTab === 'files' && (
                <div className="space-y-4">
                  {/* 顶部按文件类型与格式筛选以及上传按键 */}
                  <div className="space-y-3 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      {/* 文件类型 Tab 按钮组 */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mr-1">
                          <Folder className="w-3.5 h-3.5 text-blue-600" />
                          <span>文件类型：</span>
                        </span>
                        {[
                          { key: 'ALL', label: '全部文件' },
                          { key: '企业文件', label: '企业文件' },
                          { key: '递交文件', label: '递交文件' },
                          { key: '官方文件', label: '官方文件' },
                          { key: '事务所文件', label: '事务所文件' },
                          { key: '其他文件', label: '其他文件' },
                        ].map(cat => {
                          const isSelected = docCategoryFilter === cat.key;
                          return (
                            <button
                              key={cat.key}
                              type="button"
                              onClick={() => setDocCategoryFilter(cat.key)}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* 右侧：批量下载与上传文件按钮 */}
                      <div className="flex items-center gap-2">
                        {!isBatchDownloadMode ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsBatchDownloadMode(true);
                              setSelectedDocIds([]);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-600" />
                            <span>批量下载文件</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                            <button
                              type="button"
                              onClick={handleExecuteBatchDownload}
                              disabled={selectedDocIds.length === 0}
                              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all shadow-2xs flex items-center gap-1.5 shrink-0 ${
                                selectedDocIds.length > 0
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>确定下载 ({selectedDocIds.length})</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const currentFilteredDocs = getCaseDocs(selectedCaseForView).filter(d => {
                                  const matchCat = docCategoryFilter === 'ALL' || d.category === docCategoryFilter;
                                  const matchFmt = fileFilter === 'ALL' || d.type.toUpperCase() === fileFilter;
                                  const matchSearch = !docSearchQuery || 
                                    d.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                                    d.docNumber.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                                    (d.remarks && d.remarks.toLowerCase().includes(docSearchQuery.toLowerCase()));
                                  return matchCat && matchFmt && matchSearch;
                                });
                                if (selectedDocIds.length === currentFilteredDocs.length && currentFilteredDocs.length > 0) {
                                  setSelectedDocIds([]);
                                } else {
                                  setSelectedDocIds(currentFilteredDocs.map(d => d.id));
                                }
                              }}
                              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            >
                              {(() => {
                                const currentFilteredDocs = getCaseDocs(selectedCaseForView).filter(d => {
                                  const matchCat = docCategoryFilter === 'ALL' || d.category === docCategoryFilter;
                                  const matchFmt = fileFilter === 'ALL' || d.type.toUpperCase() === fileFilter;
                                  const matchSearch = !docSearchQuery || 
                                    d.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                                    d.docNumber.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                                    (d.remarks && d.remarks.toLowerCase().includes(docSearchQuery.toLowerCase()));
                                  return matchCat && matchFmt && matchSearch;
                                });
                                return currentFilteredDocs.length > 0 && selectedDocIds.length === currentFilteredDocs.length ? '全不选' : '全选';
                              })()}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsBatchDownloadMode(false);
                                setSelectedDocIds([]);
                              }}
                              className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        )}

                        {!readOnly && (
                          <button
                            type="button"
                            onClick={handleOpenUploadModal}
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>上传文件</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 搜索框与格式筛选 */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-200/60">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                        <input
                          type="text"
                          value={docSearchQuery}
                          onChange={(e) => setDocSearchQuery(e.target.value)}
                          placeholder="搜索文件名称、文件编号或备注..."
                          className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">格式：</span>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg text-[11px]">
                          {['ALL', 'PDF', 'DOCX', 'XLSX', 'PNG'].map(fmt => (
                            <button
                              key={fmt}
                              type="button"
                              onClick={() => setFileFilter(fmt)}
                              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                                fileFilter === fmt ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {fmt === 'ALL' ? '全部格式' : fmt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 文件列表表格 */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                        <tr>
                          {isBatchDownloadMode && (
                            <th className="py-2.5 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={(() => {
                                  const currentFilteredDocs = getCaseDocs(selectedCaseForView).filter(d => {
                                    const matchCat = docCategoryFilter === 'ALL' || d.category === docCategoryFilter;
                                    const matchFmt = fileFilter === 'ALL' || d.type.toUpperCase() === fileFilter;
                                    const matchSearch = !docSearchQuery || 
                                      d.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                                      d.docNumber.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                                      (d.remarks && d.remarks.toLowerCase().includes(docSearchQuery.toLowerCase()));
                                    return matchCat && matchFmt && matchSearch;
                                  });
                                  return currentFilteredDocs.length > 0 && currentFilteredDocs.every(d => selectedDocIds.includes(d.id));
                                })()}
                                onChange={(e) => {
                                  const currentFilteredDocs = getCaseDocs(selectedCaseForView).filter(d => {
                                    const matchCat = docCategoryFilter === 'ALL' || d.category === docCategoryFilter;
                                    const matchFmt = fileFilter === 'ALL' || d.type.toUpperCase() === fileFilter;
                                    const matchSearch = !docSearchQuery || 
                                      d.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                                      d.docNumber.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                                      (d.remarks && d.remarks.toLowerCase().includes(docSearchQuery.toLowerCase()));
                                    return matchCat && matchFmt && matchSearch;
                                  });
                                  if (e.target.checked) {
                                    setSelectedDocIds(currentFilteredDocs.map(d => d.id));
                                  } else {
                                    setSelectedDocIds([]);
                                  }
                                }}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </th>
                          )}
                          <th className="py-2.5 px-3">文件名称</th>
                          <th className="py-2.5 px-3">文件类型</th>
                          <th className="py-2.5 px-3">文件编号</th>
                          <th className="py-2.5 px-3">格式</th>
                          <th className="py-2.5 px-3">归档/发文日期</th>
                          <th className="py-2.5 px-3">大小</th>
                          <th className="py-2.5 px-3">上传/归档人</th>
                          <th className="py-2.5 px-3 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {getCaseDocs(selectedCaseForView)
                          .filter(d => {
                            const matchCat = docCategoryFilter === 'ALL' || d.category === docCategoryFilter;
                            const matchFmt = fileFilter === 'ALL' || d.type.toUpperCase() === fileFilter;
                            const matchSearch = !docSearchQuery || 
                              d.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                              d.docNumber.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                              (d.remarks && d.remarks.toLowerCase().includes(docSearchQuery.toLowerCase()));
                            return matchCat && matchFmt && matchSearch;
                          })
                          .map((doc) => (
                            <tr 
                              key={doc.id} 
                              className={`hover:bg-slate-50/80 transition-colors group ${
                                selectedDocIds.includes(doc.id) ? 'bg-blue-50/40' : ''
                              }`}
                            >
                              {isBatchDownloadMode && (
                                <td className="py-2.5 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedDocIds.includes(doc.id)}
                                    onChange={() => {
                                      setSelectedDocIds(prev =>
                                        prev.includes(doc.id)
                                          ? prev.filter(id => id !== doc.id)
                                          : [...prev, doc.id]
                                      );
                                    }}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                </td>
                              )}
                              <td className="py-2.5 px-3 font-medium text-slate-900">
                                <div className="flex items-center gap-2 max-w-[280px]">
                                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-slate-900" title={doc.title}>{doc.title}</p>
                                    {doc.remarks && (
                                      <p className="text-[10px] text-slate-400 truncate" title={doc.remarks}>{doc.remarks}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                {renderDocCategoryBadge(doc.category)}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{doc.docNumber}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-900 font-bold text-[11px]">{doc.type}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{doc.issueDate}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{doc.size}</td>
                              <td className="py-2.5 px-3 text-slate-600 text-[11px]">{doc.uploader || '系统归档'}</td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDocPreview(doc)}
                                    className="text-slate-600 hover:text-blue-600 font-medium cursor-pointer p-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-0.5 text-[11px]"
                                    title="在线预览"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>预览</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      triggerDownloadDoc(doc);
                                      showToast(`已开始下载文件：${doc.title}`);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors flex items-center gap-0.5 text-[11px]"
                                    title="下载文件"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>下载</span>
                                  </button>
                                  {!readOnly && (
                                    <button
                                      type="button"
                                      onClick={() => setDeletingDoc(doc)}
                                      className="text-slate-400 hover:text-rose-600 cursor-pointer p-1 rounded hover:bg-rose-50 transition-colors"
                                      title="删除文件"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        {getCaseDocs(selectedCaseForView).filter(d => {
                          const matchCat = docCategoryFilter === 'ALL' || d.category === docCategoryFilter;
                          const matchFmt = fileFilter === 'ALL' || d.type.toUpperCase() === fileFilter;
                          const matchSearch = !docSearchQuery || 
                            d.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                            d.docNumber.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                            (d.remarks && d.remarks.toLowerCase().includes(docSearchQuery.toLowerCase()));
                          return matchCat && matchFmt && matchSearch;
                        }).length === 0 && (
                          <tr>
                            <td colSpan={isBatchDownloadMode ? 9 : 8} className="py-10 text-center text-slate-400">
                              <div className="flex flex-col items-center justify-center gap-1.5">
                                <Folder className="w-7 h-7 text-slate-300 stroke-1" />
                                <p className="text-xs">暂无对应类型的卷宗文书档案</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}



              {/* TAB 7: 使用证据 */}
              {activeCaseDetailTab === 'evidence' && (
                <div className="space-y-4">
                  {/* Filter & Action Header */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                        <span>商标商业使用证据归档库</span>
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">
                        (共 {getCaseEvidences(selectedCaseForView).length} 份证据文件)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={evidenceTypeFilter}
                        onChange={(e) => setEvidenceTypeFilter(e.target.value)}
                        className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                      >
                        <option value="ALL">全部证据类型</option>
                        <option value="销售合同/报关单">销售合同/报关单</option>
                        <option value="产品包装图样">产品包装图样</option>
                        <option value="展会/广告宣传">展会/广告宣传</option>
                        <option value="发票/收据凭证">发票/收据凭证</option>
                        <option value="电商列表/网页截图">电商列表/网页截图</option>
                        <option value="其他使用证据">其他使用证据</option>
                      </select>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={evidenceSearchQuery}
                          onChange={(e) => setEvidenceSearchQuery(e.target.value)}
                          placeholder="搜索证据名称/备注..."
                          className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 w-44 shadow-2xs text-slate-800 placeholder:text-slate-400"
                        />
                      </div>

                      {!readOnly && (
                        <button
                          type="button"
                          onClick={handleOpenUploadEvidenceModal}
                          className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>上传证据</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 证据列表表格 */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3">证据文件名称</th>
                          <th className="py-2.5 px-3">证据类型</th>
                          <th className="py-2.5 px-3">格式</th>
                          <th className="py-2.5 px-3">大小</th>
                          <th className="py-2.5 px-3">归档日期</th>
                          <th className="py-2.5 px-3">上传/归档人</th>
                          <th className="py-2.5 px-3 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {getCaseEvidences(selectedCaseForView)
                          .filter(ev => {
                            const matchType = evidenceTypeFilter === 'ALL' || ev.evidenceType === evidenceTypeFilter;
                            const matchSearch = !evidenceSearchQuery || 
                              ev.title.toLowerCase().includes(evidenceSearchQuery.toLowerCase()) ||
                              (ev.remarks && ev.remarks.toLowerCase().includes(evidenceSearchQuery.toLowerCase())) ||
                              (ev.market && ev.market.toLowerCase().includes(evidenceSearchQuery.toLowerCase()));
                            return matchType && matchSearch;
                          })
                          .map((ev) => {
                            const fileType = (ev.type || (ev.title.split('.').pop() || 'PDF')).toUpperCase();
                            const docForAction: CaseOfficialDocument = {
                              id: ev.id,
                              title: ev.title,
                              type: fileType,
                              docNumber: ev.docNumber || `EV-${ev.id.slice(-6)}`,
                              issueDate: ev.uploadDate,
                              size: ev.fileSize,
                              category: ev.evidenceType,
                              uploader: ev.uploader || '李沐',
                              remarks: ev.remarks || `使用证据源文件`,
                              fileUrl: ev.fileUrl || ev.proofUrl,
                              fileBlob: ev.fileBlob
                            };

                            return (
                              <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="py-2.5 px-3 font-medium text-slate-900">
                                  <div className="flex items-center gap-2 max-w-[300px]">
                                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="truncate font-medium text-slate-900" title={ev.title}>{ev.title}</p>
                                      {ev.remarks && (
                                        <p className="text-[10px] text-slate-400 truncate" title={ev.remarks}>{ev.remarks}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="text-xs text-slate-900 font-medium whitespace-nowrap">
                                    {ev.evidenceType}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-900 font-bold text-[11px]">{fileType}</td>
                                <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{ev.fileSize}</td>
                                <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{ev.uploadDate}</td>
                                <td className="py-2.5 px-3 text-slate-600 text-[11px]">{ev.uploader || '李沐'}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDocPreview(docForAction)}
                                      className="text-slate-600 hover:text-blue-600 font-medium cursor-pointer p-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-0.5 text-[11px]"
                                      title="在线预览"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>预览</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        triggerDownloadDoc(docForAction);
                                        showToast(`已开始下载使用证据：${ev.title}`);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors flex items-center gap-0.5 text-[11px]"
                                      title="下载证据文件"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>下载</span>
                                    </button>
                                    {!readOnly && (
                                      <button
                                        type="button"
                                        onClick={() => setDeletingEvidence(ev)}
                                        className="text-slate-400 hover:text-rose-600 cursor-pointer p-1 rounded hover:bg-rose-50 transition-colors"
                                        title="删除证据"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                        {getCaseEvidences(selectedCaseForView).filter(ev => {
                          const matchType = evidenceTypeFilter === 'ALL' || ev.evidenceType === evidenceTypeFilter;
                          const matchSearch = !evidenceSearchQuery || 
                            ev.title.toLowerCase().includes(evidenceSearchQuery.toLowerCase()) ||
                            (ev.remarks && ev.remarks.toLowerCase().includes(evidenceSearchQuery.toLowerCase())) ||
                            (ev.market && ev.market.toLowerCase().includes(evidenceSearchQuery.toLowerCase()));
                          return matchType && matchSearch;
                        }).length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-slate-400">
                              <div className="flex flex-col items-center justify-center gap-1.5">
                                <Folder className="w-7 h-7 text-slate-300 stroke-1" />
                                <p className="text-xs">暂无使用证据文件记录</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: 操作记录 (样式与建案申请-建案需求详情页面的操作记录完全一致) */}
              {activeCaseDetailTab === 'history' && (() => {
                const allLogs = getCaseOperationLogs(selectedCaseForView);
                return (
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
                          {allLogs.map((log, idx) => (
                            <tr key={log.id || idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2.5 px-3.5 font-mono">{log.operateTime}</td>
                              <td className="py-2.5 px-3.5 font-medium">{log.operator}</td>
                              <td className="py-2.5 px-3.5 font-medium text-blue-600">
                                {log.operationType}
                              </td>
                              <td className="py-2.5 px-3.5 text-slate-500">
                                {log.changeSummary || log.remarks || '-'}
                              </td>
                            </tr>
                          ))}
                          {allLogs.length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                                暂无操作记录
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

            </div>

          </div>
        </div>
      )}

      {/* 申请人主体 变更历史 Modal */}
      {isApplicantHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center font-bold shrink-0">
                  <History className="w-5 h-5 text-[#8cc63f]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>申请人主体变更历史记录</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-lime-50 text-lime-700 border border-lime-200">
                      官方核查核准档案
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    案件编号：<span className="font-mono font-bold text-blue-600">{selectedCaseForView?.caseNo}</span> · {selectedCaseForView?.trademarkName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApplicantHistoryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                记录该商标在商标局/知识产权主管局官方备案的申请人名义变更、地址变更、名义地址同时变更及商标转让核准历史。
              </p>

              <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left text-xs border-collapse min-w-[560px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                      <th className="py-2.5 px-3 w-12 text-center">序号</th>
                      <th className="py-2.5 px-3 w-36">变更事项</th>
                      <th className="py-2.5 px-4 min-w-[150px]">变更前内容</th>
                      <th className="py-2.5 px-4 min-w-[150px]">变更后内容</th>
                      <th className="py-2.5 px-3 w-24">变更人</th>
                      <th className="py-2.5 px-3 w-28">变更日期</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {selectedCaseForView && getCaseApplicantHistory(selectedCaseForView).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                          暂无申请人主体变更历史记录
                        </td>
                      </tr>
                    ) : (
                      selectedCaseForView && getCaseApplicantHistory(selectedCaseForView).map((hist, idx) => (
                        <tr key={hist.id || idx} className="hover:bg-slate-50">
                          <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-3 font-semibold text-slate-800">{hist.changeType}</td>
                          <td className="py-3 px-4 text-slate-600 break-words">{hist.beforeValue || '-'}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900 break-words">{hist.afterValue || '-'}</td>
                          <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                            <span className="font-medium">{hist.changer || '系统自动'}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">{hist.changeDate}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 案件信息操作记录 审计详情 Modal */}
      {viewingOperationLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>操作记录审计追溯详情</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      审计存证有效
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    案号：<span className="font-mono font-bold text-blue-600">{selectedCaseForView?.caseNo}</span> · {selectedCaseForView?.trademarkName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingOperationLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <div className="text-[10px] text-slate-400">操作类型</div>
                  <div className="font-bold text-slate-900 mt-0.5">{viewingOperationLog.operationType}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">所属模块</div>
                  <div className="font-semibold text-blue-700 mt-0.5">{viewingOperationLog.module}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">操作时间</div>
                  <div className="font-mono text-slate-800 mt-0.5">{viewingOperationLog.operateTime}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">操作来源 IP</div>
                  <div className="font-mono text-slate-600 mt-0.5">{viewingOperationLog.ipAddress || '192.168.10.88'}</div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">操作内容与摘要说明</label>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-medium">
                  {viewingOperationLog.changeSummary}
                </div>
              </div>

              {(viewingOperationLog.beforeValue || viewingOperationLog.afterValue) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                      <span>● 变更前数据</span>
                    </span>
                    <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-lg text-rose-900 font-mono text-xs break-words min-h-[64px]">
                      {viewingOperationLog.beforeValue || '（空 / 无记录）'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <span>● 变更后数据</span>
                    </span>
                    <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg text-emerald-900 font-mono text-xs break-words min-h-[64px]">
                      {viewingOperationLog.afterValue || '（空 / 无记录）'}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 bg-slate-50/60 p-3 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 block">操作经办人 / 职务</span>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {viewingOperationLog.operator} · {viewingOperationLog.operatorRole || '商标代理人'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{viewingOperationLog.department || '知识产权部'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">审计留痕备注说明</span>
                  <div className="text-slate-700 mt-0.5 leading-relaxed">
                    {viewingOperationLog.remarks || '无额外备注说明'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingOperationLog(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 处理事项 新增/编辑/查看 Modal (尺寸与案件详情一致，查看模式样式与维权详情一致) */}
      {handlingTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* VIEW MODE: 查看处理事项详情 (样式结构完全复用【维权详情】) */}
            {handlingTaskModalMode === 'VIEW' ? (
              <>
                {/* Top Header */}
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                      taskFormData.status === '已完成' || taskFormData.status === 'COMPLETED' ? 'bg-emerald-600 text-white' :
                      taskFormData.status === '处理中' || taskFormData.status === 'IN_PROGRESS' ? 'bg-blue-600 text-white' :
                      taskFormData.status === '待审核' ? 'bg-amber-500 text-white' :
                      taskFormData.status === '待递交' ? 'bg-indigo-600 text-white' :
                      taskFormData.status === '暂停' || taskFormData.status === '已终止' ? 'bg-rose-500 text-white' : 'bg-slate-500 text-white'
                    }`}>
                      {taskFormData.status || '待处理'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">处理事项详情</h3>
                    <div className="flex items-center gap-1.5 text-sm sm:text-base font-mono font-bold text-slate-900">
                      <span>{selectedCaseForView?.caseNo}</span>
                      <div className="relative inline-flex items-center">
                        <button
                          type="button"
                          title="复制案件编号"
                          onClick={() => {
                            if (selectedCaseForView?.caseNo) {
                              navigator.clipboard.writeText(selectedCaseForView.caseNo);
                              setCopiedId(`task_view_${selectedCaseForView.caseNo}`);
                              showToast(`已复制案件编号: ${selectedCaseForView.caseNo}`);
                              setTimeout(() => setCopiedId(null), 2000);
                            }
                          }}
                          className={`p-1 rounded transition-colors flex items-center justify-center cursor-pointer ${
                            copiedId === `task_view_${selectedCaseForView?.caseNo}`
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                        >
                          {copiedId === `task_view_${selectedCaseForView?.caseNo}` ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                        {copiedId === `task_view_${selectedCaseForView?.caseNo}` && (
                          <div className="absolute left-full ml-1.5 px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-sans font-medium rounded-md shadow-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 flex items-center gap-1 z-30">
                            <span>已复制</span>
                          </div>
                        )}
                      </div>
                      <span className="text-slate-400 font-normal">/</span>
                      <span className="font-sans font-bold text-slate-900">{taskFormData.taskName || '未命名事项'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHandlingTaskModalOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="px-6 bg-slate-50/80 border-b border-slate-200/80 flex items-center gap-6 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setHandlingTaskDetailTab('info')}
                    className={`py-3 font-medium cursor-pointer border-b-2 transition-all ${
                      handlingTaskDetailTab === 'info'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    事项信息
                  </button>
                  <button
                    type="button"
                    onClick={() => setHandlingTaskDetailTab('history')}
                    className={`py-3 font-medium cursor-pointer border-b-2 transition-all ${
                      handlingTaskDetailTab === 'history'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    操作记录
                  </button>
                </div>

                {/* Tab Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
                  {handlingTaskDetailTab === 'info' && (
                    <div className="space-y-6">
                      {/* 1. 事项基本属性 */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                          <span>事项基本属性</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                          <div className="sm:col-span-2">
                            <span className="text-slate-500">处理事项：</span>
                            <span className="text-slate-900 font-bold text-sm">{taskFormData.taskName || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">处理状态：</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              taskFormData.status === '已完成' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              taskFormData.status === '处理中' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              taskFormData.status === '待审核' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              taskFormData.status === '待递交' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                              taskFormData.status === '暂停' || taskFormData.status === '已终止' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {taskFormData.status || '待处理'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">案件阶段：</span>
                            <span className="text-slate-900 font-medium">{taskFormData.stage || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">承办人 / 处理人：</span>
                            <span className="text-slate-900 font-medium">{taskFormData.undertaker || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">委案日期：</span>
                            <span className="font-mono text-slate-900 font-medium">{taskFormData.entrustDate || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">核稿分值：</span>
                            <span className="font-medium text-blue-600 font-semibold">{taskFormData.reviewScore ? `${taskFormData.reviewScore} 分` : '—'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. 关键期限与时效控制 */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                          <span>关键期限与时效控制</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-2.5 py-1">
                          <div>
                            <span className="text-slate-500">初稿期限：</span>
                            <span className="font-mono text-slate-900 font-medium">{taskFormData.draftDeadline || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">内部期限：</span>
                            <span className="font-mono text-amber-700 font-medium">{taskFormData.internalDeadline || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">官方期限：</span>
                            <span className="font-mono text-rose-700 font-medium">{taskFormData.officialDeadline || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">检索期限：</span>
                            <span className="font-mono text-slate-900 font-medium">{taskFormData.searchDeadline || '—'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. 执行进度与节点记录 */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                          <span>执行进度与节点记录</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-2.5 py-1">
                          <div>
                            <span className="text-slate-500">初稿日：</span>
                            <span className="font-mono text-slate-900 font-medium">{taskFormData.firstDraftDate || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">定稿日：</span>
                            <span className="font-mono text-slate-900 font-medium">{taskFormData.finalDraftDate || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">完成日：</span>
                            <span className="font-mono text-emerald-700 font-semibold">{taskFormData.completionDate || '未完成'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">检索日：</span>
                            <span className="font-mono text-slate-900 font-medium">{taskFormData.searchDate || '—'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 4. 备注说明与跟进记录 */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                          <span>备注说明与跟进记录</span>
                        </h4>
                        <div className="py-1">
                          <p className="text-slate-800 leading-relaxed bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/80 font-normal">
                            {taskFormData.remarks || '无额外备注说明'}
                          </p>
                        </div>
                      </div>

                      {/* 5. 关联案件基本信息 */}
                      {selectedCaseForView && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                            <span>关联案件信息</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                            <div>
                              <span className="text-slate-500">案件编号：</span>
                              <span className="font-mono text-blue-600 font-semibold">{selectedCaseForView.caseNo}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">商标名称：</span>
                              <span className="text-slate-900 font-bold">{selectedCaseForView.trademarkName}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">所属品牌：</span>
                              <span className="text-slate-900 font-medium">{selectedCaseForView.brand || '—'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">商品/服务类别：</span>
                              <span className="text-slate-900 font-medium">{selectedCaseForView.classes || '—'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">申请地区：</span>
                              <span className="text-slate-900 font-medium">{selectedCaseForView.region || getRegionByCountry(selectedCaseForView.country || selectedCaseForView.jurisdiction || '中国')}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">申请国家：</span>
                              <span className="text-slate-900 font-medium">{selectedCaseForView.country || selectedCaseForView.jurisdiction || '中国 (CN)'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">代理机构：</span>
                              <span className="text-slate-900 font-medium">{selectedCaseForView.agencyName || '北京国智知产代理有限公司'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {handlingTaskDetailTab === 'history' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                          <span>事项流转与操作记录</span>
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          共记录 4 条流转操作
                        </span>
                      </div>

                      <div className="border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                            <tr>
                              <th className="py-2.5 px-3 w-14 text-center">序号</th>
                              <th className="py-2.5 px-3">操作类型</th>
                              <th className="py-2.5 px-3">变更摘要</th>
                              <th className="py-2.5 px-3">操作人</th>
                              <th className="py-2.5 px-3">所属部门</th>
                              <th className="py-2.5 px-3">操作时间</th>
                              <th className="py-2.5 px-3">备注</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            <tr className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 text-center font-mono text-slate-400">1</td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                  新增处理事项
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-900">
                                新增事项【{taskFormData.taskName || '实质审查意见答辩及补正'}】，阶段【{taskFormData.stage || '实质审查阶段'}】
                              </td>
                              <td className="py-2.5 px-3">{taskFormData.undertaker || selectedCaseForView?.agentName || '张锦程'}</td>
                              <td className="py-2.5 px-3">品牌知产保护中心</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">2026-08-20 09:30:00</td>
                              <td className="py-2.5 px-3 text-slate-500">系统立案并下发处理事项</td>
                            </tr>
                            <tr className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 text-center font-mono text-slate-400">2</td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                  设定关键期限
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-900">
                                设定内部期限【{taskFormData.internalDeadline || '2026-09-15'}】，官方期限【{taskFormData.officialDeadline || '2026-09-30'}】
                              </td>
                              <td className="py-2.5 px-3">陆燕丽</td>
                              <td className="py-2.5 px-3">流程风控部</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">2026-08-20 14:15:22</td>
                              <td className="py-2.5 px-3 text-slate-500">完成双期限比对与防逾期预警配置</td>
                            </tr>
                            <tr className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 text-center font-mono text-slate-400">3</td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  提交初稿核阅
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-900">
                                初稿完成日【{taskFormData.firstDraftDate || '2026-08-24'}】，核稿分值【{taskFormData.reviewScore || '95'}分】
                              </td>
                              <td className="py-2.5 px-3">{taskFormData.undertaker || '张锦程'}</td>
                              <td className="py-2.5 px-3">品牌知产保护中心</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">2026-08-24 16:40:10</td>
                              <td className="py-2.5 px-3 text-slate-500">初稿答辩理由充足，已通过内审</td>
                            </tr>
                            <tr className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 text-center font-mono text-slate-400">4</td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  状态流转变更
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-900">
                                事项状态流转为【{taskFormData.status || '处理中'}】
                              </td>
                              <td className="py-2.5 px-3">系统管理员</td>
                              <td className="py-2.5 px-3">知产数字化运营部</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">2026-08-25 11:05:33</td>
                              <td className="py-2.5 px-3 text-slate-500">流程节点自动更新并归档</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Footer */}
                <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldAlert className="w-4 h-4 text-blue-600" />
                    <span>处理事项节点与官方期限已关联案件时效管控系统，支持自动预警提醒</span>
                  </div>
                </div>
              </>
            ) : (
              /* CREATE / EDIT MODE: 新增/编辑处理事项 (尺寸与案件详情比例一致，无默认选值，给提示语) */
              <form onSubmit={(e) => { e.preventDefault(); handleSaveHandlingTask(); }} className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-600 text-white">
                      {handlingTaskModalMode === 'CREATE' ? '新增事项' : '编辑事项'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {handlingTaskModalMode === 'CREATE' ? '新增处理事项' : '编辑处理事项'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm sm:text-base font-mono font-bold text-slate-900">
                      <span>{selectedCaseForView?.caseNo}</span>
                      <div className="relative inline-flex items-center">
                        <button
                          type="button"
                          title="复制案件编号"
                          onClick={() => {
                            if (selectedCaseForView?.caseNo) {
                              navigator.clipboard.writeText(selectedCaseForView.caseNo);
                              setCopiedId(`task_edit_${selectedCaseForView.caseNo}`);
                              showToast(`已复制案件编号: ${selectedCaseForView.caseNo}`);
                              setTimeout(() => setCopiedId(null), 2000);
                            }
                          }}
                          className={`p-1 rounded transition-colors flex items-center justify-center cursor-pointer ${
                            copiedId === `task_edit_${selectedCaseForView?.caseNo}`
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                        >
                          {copiedId === `task_edit_${selectedCaseForView?.caseNo}` ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                        {copiedId === `task_edit_${selectedCaseForView?.caseNo}` && (
                          <div className="absolute left-full ml-1.5 px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-sans font-medium rounded-md shadow-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 flex items-center gap-1 z-30">
                            <span>已复制</span>
                          </div>
                        )}
                      </div>
                      <span className="text-slate-400 font-normal">/</span>
                      <span className="font-sans font-bold text-slate-900">{selectedCaseForView?.trademarkName}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setHandlingTaskModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
                  {/* 板块 1：事项基本属性 */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>事项基本属性</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {/* 处理事项: 下拉选择 */}
                      <div className="space-y-1 sm:col-span-2 md:col-span-1">
                        <label className="block text-xs font-medium text-slate-700">
                          处理事项 <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={taskFormData.taskName}
                            onChange={(e) => setTaskFormData({ ...taskFormData, taskName: e.target.value })}
                            className={`w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs font-medium ${
                              !taskFormData.taskName ? 'text-slate-400 font-normal' : ''
                            }`}
                          >
                            <option value="" disabled className="text-slate-400">请选择处理事项</option>
                            {HANDLING_TASK_NAME_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="text-slate-800 font-medium">{opt}</option>
                            ))}
                            {taskFormData.taskName && !HANDLING_TASK_NAME_OPTIONS.includes(taskFormData.taskName) && (
                              <option value={taskFormData.taskName} className="text-slate-800 font-medium">{taskFormData.taskName}</option>
                            )}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* 处理状态: 下拉选择 */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">
                          处理状态 <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={taskFormData.status}
                            onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })}
                            className={`w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs font-medium ${
                              !taskFormData.status ? 'text-slate-400 font-normal' : ''
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

                      {/* 案件阶段: 下拉选择 */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">
                          案件阶段 <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={taskFormData.stage}
                            onChange={(e) => setTaskFormData({ ...taskFormData, stage: e.target.value })}
                            className={`w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs font-medium ${
                              !taskFormData.stage ? 'text-slate-400 font-normal' : ''
                            }`}
                          >
                            <option value="" disabled className="text-slate-400">请选择案件阶段</option>
                            {HANDLING_TASK_STAGE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="text-slate-800 font-medium">{opt}</option>
                            ))}
                            {taskFormData.stage && !HANDLING_TASK_STAGE_OPTIONS.includes(taskFormData.stage) && (
                              <option value={taskFormData.stage} className="text-slate-800 font-medium">{taskFormData.stage}</option>
                            )}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* 处理人 */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">承办人 / 处理人</label>
                        <input
                          type="text"
                          placeholder="请输入处理人姓名"
                          value={taskFormData.undertaker}
                          onChange={(e) => setTaskFormData({ ...taskFormData, undertaker: e.target.value })}
                          className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                        />
                      </div>

                      {/* 委案日期 */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">委案日期</label>
                        <input
                          type="date"
                          value={taskFormData.entrustDate}
                          onChange={(e) => setTaskFormData({ ...taskFormData, entrustDate: e.target.value })}
                          className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      {/* 核稿分值 */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">核稿分值</label>
                        <input
                          type="text"
                          placeholder="例如：95分、100、A+"
                          value={taskFormData.reviewScore}
                          onChange={(e) => setTaskFormData({ ...taskFormData, reviewScore: e.target.value })}
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
                          value={taskFormData.draftDeadline}
                          onChange={(e) => setTaskFormData({ ...taskFormData, draftDeadline: e.target.value })}
                          className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      {/* 内部期限 */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">内部期限</label>
                        <input
                          type="date"
                          value={taskFormData.internalDeadline}
                          onChange={(e) => setTaskFormData({ ...taskFormData, internalDeadline: e.target.value })}
                          className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      {/* 官方期限 */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">官方期限</label>
                        <input
                          type="date"
                          value={taskFormData.officialDeadline}
                          onChange={(e) => setTaskFormData({ ...taskFormData, officialDeadline: e.target.value })}
                          className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      {/* 检索期限 */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">检索期限</label>
                        <input
                          type="date"
                          value={taskFormData.searchDeadline}
                          onChange={(e) => setTaskFormData({ ...taskFormData, searchDeadline: e.target.value })}
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
                          value={taskFormData.firstDraftDate}
                          onChange={(e) => setTaskFormData({ ...taskFormData, firstDraftDate: e.target.value })}
                          className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      {/* 定稿日 */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">定稿日</label>
                        <input
                          type="date"
                          value={taskFormData.finalDraftDate}
                          onChange={(e) => setTaskFormData({ ...taskFormData, finalDraftDate: e.target.value })}
                          className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      {/* 完成日 */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">完成日</label>
                        <input
                          type="date"
                          value={taskFormData.completionDate}
                          onChange={(e) => setTaskFormData({ ...taskFormData, completionDate: e.target.value })}
                          className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      {/* 检索日 */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">检索日</label>
                        <input
                          type="date"
                          value={taskFormData.searchDate}
                          onChange={(e) => setTaskFormData({ ...taskFormData, searchDate: e.target.value })}
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
                        value={taskFormData.remarks}
                        onChange={(e) => setTaskFormData({ ...taskFormData, remarks: e.target.value })}
                        className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 leading-relaxed focus:outline-none focus:border-blue-500 resize-none shadow-2xs font-medium"
                      />
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
                      onClick={() => setHandlingTaskModalOpen(false)}
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
            )}
          </div>
        </div>
      )}

      {/* 处理事项 删除 确认 Modal */}
      {deletingHandlingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">确认删除该处理事项？</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  处理事项：<span className="font-semibold text-slate-800">【{deletingHandlingTask.taskName}】</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              删除后，该处理事项将从案件【{selectedCaseForView?.caseNo}】的流程管理清单中移除，此操作不可撤销。
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingHandlingTask(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteHandlingTask}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>确认删除</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. 弹窗 2: 【维护商品与更新注册信息】(高交互性操作弹窗) */}
      {/* ======================================================== */}
      {selectedCaseForMaintain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-sans tracking-tight">
                    维护商品项目与更新注册信息
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    案件编号：<span className="font-mono font-bold text-blue-600">{selectedCaseForMaintain.caseNo}</span> · {selectedCaseForMaintain.trademarkName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCaseForMaintain(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* 0. AI 智能文件识别与自动填报 */}
              <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 p-4 rounded-xl border border-blue-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-600 text-white rounded-lg shadow-2xs">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>AI 智能文件识别与自动填报</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                        智能 OCR & 结构化解析
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      上传商标官方通知书、注册证、受理解决函或代理文件，AI将自动提取分类号、申请号、注册号、重要期号及指定商品清单并填充下方表单
                    </p>
                  </div>
                </div>

                {/* 文件拖拽与上传区 */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleProcessFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-3.5 text-center transition-all ${
                    dragActive ? 'border-blue-500 bg-blue-100/60' : 'border-blue-200 hover:border-blue-400 bg-white'
                  }`}
                >
                  {isAnalyzingFile ? (
                    <div className="py-2.5 flex flex-col items-center justify-center gap-1.5">
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                      <div className="font-semibold text-slate-800 text-xs">AI 正在深度扫描与提取商标文件属性...</div>
                      <div className="text-[11px] text-slate-500">自动解析商标类别、申请号、注册号、权利人及商品服务项列表</div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-0.5">
                      <div className="p-2 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer underline decoration-blue-300">
                            点击上传官方商标文件
                            <input
                              type="file"
                              accept="image/*,application/pdf,.doc,.docx,.txt"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleProcessFileUpload(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          <span className="text-slate-500">或将文件拖拽至此处</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          支持 PDF、JPG、PNG 扫描件、官方发文通知书 Word 或纯文本
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 提取结果通知提示框 */}
                {analysisResultMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold">{analysisResultMsg}</div>
                      <div className="text-[11px] text-emerald-700 mt-1">
                        提示：已自动联动更新“尼斯分类”、“类似群组”、“商品/服务”及“注册档案基础属性”。点击底部【保存并同步】后将实时应用至案件数据。
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAnalysisResultMsg(null)}
                      className="text-emerald-500 hover:text-emerald-700 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {analysisErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{analysisErrorMsg}</div>
                    <button
                      type="button"
                      onClick={() => setAnalysisErrorMsg(null)}
                      className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* 官方商标注册信息与商品项目维护 */}
              <div className="space-y-5 pt-5 border-t border-slate-200/80">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-l-2 border-blue-600 pl-2">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>更新商标平台注册档案与类目信息（全项字段维护）</span>
                  </div>
                </div>

                <div className="space-y-5">

                  {/* 实际注册商标类目 (尼斯分类) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
                      <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        <span>实际注册商标类目 (尼斯分类)</span>
                      </label>
                      <span className="text-[11px] text-slate-500">
                        关联建案单需求类目：<strong className="text-blue-600 font-mono font-bold">{selectedCaseForMaintain.proposalClasses || INITIAL_PROPOSALS.find(p => p.proposalNo === selectedCaseForMaintain.proposalNo)?.classes || selectedCaseForMaintain.classes}</strong>
                      </span>
                    </div>

                    <TrademarkClassSelector
                      selectedClassCodes={selectedClassCodes}
                      isDropdownOpen={isClassDropdownOpen}
                      searchKeyword={classSearchKeyword}
                      onToggleDropdown={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                      onToggleClassCode={(code) => handleToggleClassCode(code)}
                      onSetQuickClasses={(codes) => handleSetQuickClasses(codes)}
                      onSearchKeywordChange={(keyword) => setClassSearchKeyword(keyword)}
                      label=""
                    />
                  </div>

                  {/* 类似群组 (Group) - 联动自已选尼斯分类 */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        类似群组
                      </label>
                      <span className="text-[11px] text-slate-400 font-normal">
                        可用: {availableGroupOptions.length} / 已选: {selectedGroupCodes.length}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      根据所选【尼斯分类】动态展示对应群组
                    </div>

                    {/* 已选类似群组 Chip 列表 */}
                    <div 
                      onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                      className="flex items-center justify-between gap-2 min-h-[38px] p-1.5 px-2.5 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all shadow-2xs group"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                        {selectedGroupCodes.length === 0 ? (
                          <span className="text-slate-400 text-xs">
                            {selectedClassCodes.length === 0 ? '请先选尼斯分类...' : '请选择类似群组...'}
                          </span>
                        ) : (
                          selectedGroupCodes.map(code => {
                            const grp = availableGroupOptions.find(g => g.groupCode === code);
                            return (
                              <span 
                                key={code} 
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 shadow-2xs animate-in fade-in duration-150"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="font-mono font-bold">{code}</span>
                                {grp ? <span className="truncate max-w-[100px]">- {grp.groupName}</span> : ''}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleGroupCode(code);
                                  }}
                                  className="p-0.5 hover:bg-blue-200/60 rounded text-blue-500 hover:text-blue-800 cursor-pointer"
                                  title="移除此群组"
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
                          {isGroupDropdownOpen ? '收起' : '选择'}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isGroupDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                      </div>
                    </div>

                    {/* 可展开类似群组多选面板 */}
                    {isGroupDropdownOpen && (
                      <div className="mt-2 p-3 bg-white border border-blue-200 rounded-xl shadow-lg space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                        {/* 搜索栏与全选按钮 */}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={groupSearchKeyword}
                              onChange={(e) => setGroupSearchKeyword(e.target.value)}
                              placeholder="搜索代码或名称..."
                              className="w-full text-xs text-slate-800 pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            {groupSearchKeyword && (
                              <button
                                type="button"
                                onClick={() => setGroupSearchKeyword('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleSelectAllAvailableGroups}
                            className="px-2.5 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg whitespace-nowrap cursor-pointer transition-colors"
                          >
                            {selectedGroupCodes.length === availableGroupOptions.length && availableGroupOptions.length > 0 ? '取消' : '全选'}
                          </button>
                        </div>

                        {/* 群组选项列表 */}
                        <div className="max-h-52 overflow-y-auto space-y-1 pr-1 text-xs">
                          {availableGroupOptions.filter(grp => {
                            if (!groupSearchKeyword.trim()) return true;
                            const k = groupSearchKeyword.trim().toLowerCase();
                            return grp.groupCode.toLowerCase().includes(k) ||
                              grp.groupName.toLowerCase().includes(k) ||
                              grp.classCode.toLowerCase().includes(k);
                          }).length === 0 ? (
                            <div className="py-6 text-center text-slate-400">
                              未匹配到类似群组，请先选择上方尼斯分类
                            </div>
                          ) : (
                            availableGroupOptions.filter(grp => {
                              if (!groupSearchKeyword.trim()) return true;
                              const k = groupSearchKeyword.trim().toLowerCase();
                              return grp.groupCode.toLowerCase().includes(k) ||
                                grp.groupName.toLowerCase().includes(k) ||
                                grp.classCode.toLowerCase().includes(k);
                            }).map(grp => {
                              const isChecked = selectedGroupCodes.includes(grp.groupCode);
                              return (
                                <label
                                  key={grp.groupCode}
                                  className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-2xs'
                                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleGroupCode(grp.groupCode)}
                                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-xs flex items-center justify-between">
                                      <span className="font-mono">{grp.groupCode} - {grp.groupName}</span>
                                      {isChecked && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      <span>{grp.classCode}</span>
                                      {grp.itemCount > 0 && <span>· {grp.itemCount}项</span>}
                                    </div>
                                  </div>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 商品/服务 (Goods & Services) - 联动自已选类似群组 */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        商品/服务
                      </label>
                      <span className="text-[11px] text-slate-400 font-normal">
                        可用: {availableGoodsOptions.length} / 已选: {selectedGoodsItems.length}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      根据所选【类似群组】动态展示商品/服务项目
                    </div>

                    {/* 已选商品/服务 Chip 列表 */}
                    <div 
                      onClick={() => setIsGoodsDropdownOpen(!isGoodsDropdownOpen)}
                      className="flex items-center justify-between gap-2 min-h-[38px] p-1.5 px-2.5 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all shadow-2xs group"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                        {selectedGoodsItems.length === 0 ? (
                          <span className="text-slate-400 text-xs">
                            {selectedGroupCodes.length === 0 ? '请先选择类似群组...' : '请选择商品/服务项目...'}
                          </span>
                        ) : (
                          selectedGoodsItems.map(item => (
                            <span 
                              key={item} 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 shadow-2xs animate-in fade-in duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="truncate max-w-[120px]">{item}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleGoodsItem(item);
                                }}
                                className="p-0.5 hover:bg-blue-200/60 rounded text-blue-500 hover:text-blue-800 cursor-pointer"
                                title="移除此项目"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 shrink-0">
                        <span className="text-[11px] font-medium hidden sm:inline">
                          {isGoodsDropdownOpen ? '收起' : '选择'}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isGoodsDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                      </div>
                    </div>

                    {/* 可展开商品/服务面板 */}
                    {isGoodsDropdownOpen && (
                      <div className="mt-2 p-3 bg-white border border-blue-200 rounded-xl shadow-lg space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                        {/* 搜索栏与全选按钮 */}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={goodsSearchKeyword}
                              onChange={(e) => setGoodsSearchKeyword(e.target.value)}
                              placeholder="搜索商品/服务名称（如：电动牙刷、牙膏...）"
                              className="w-full text-xs text-slate-800 pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            {goodsSearchKeyword && (
                              <button
                                type="button"
                                onClick={() => setGoodsSearchKeyword('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleSelectAllAvailableGoods}
                            className="px-2.5 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg whitespace-nowrap cursor-pointer transition-colors"
                          >
                            {selectedGoodsItems.length >= availableGoodsOptions.length && availableGoodsOptions.length > 0 ? '清空' : '全选'}
                          </button>
                        </div>

                        {/* 商品/服务候选列表 (带 Checkbox) */}
                        <div className="max-h-52 overflow-y-auto space-y-1 pr-1 text-xs">
                          {availableGoodsOptions.filter(it => {
                            if (!goodsSearchKeyword.trim()) return true;
                            const k = goodsSearchKeyword.trim().toLowerCase();
                            return it.itemNameCn.toLowerCase().includes(k) ||
                              it.groupCode.toLowerCase().includes(k) ||
                              it.groupName.toLowerCase().includes(k);
                          }).length === 0 ? (
                            <div className="py-6 text-center text-slate-400">
                              未找到匹配的标准商品/服务
                            </div>
                          ) : (
                            availableGoodsOptions.filter(it => {
                              if (!goodsSearchKeyword.trim()) return true;
                              const k = goodsSearchKeyword.trim().toLowerCase();
                              return it.itemNameCn.toLowerCase().includes(k) ||
                                it.groupCode.toLowerCase().includes(k) ||
                                it.groupName.toLowerCase().includes(k);
                            }).map(it => {
                              const isChecked = selectedGoodsItems.includes(it.itemNameCn);
                              return (
                                <label
                                  key={`${it.groupCode}-${it.itemNameCn}`}
                                  className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-2xs'
                                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleGoodsItem(it.itemNameCn)}
                                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-xs flex items-center justify-between">
                                      <span>{it.itemNameCn}</span>
                                      {isChecked && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                      <span className="font-mono text-blue-600 font-semibold">{it.groupCode}</span>
                                      <span>({it.groupName})</span>
                                      <span>· 第{String(it.classNum).padStart(2, '0')}类</span>
                                      {it.itemNameEn && <span className="italic truncate max-w-[140px]">· {it.itemNameEn}</span>}
                                    </div>
                                  </div>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 分组 1: 案件状态、主管局与申报节点 */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-l-2 border-slate-700 pl-2">
                      <span>案件流转状态、主管局与申报信息</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">案件流转状态</label>
                        <div className="relative">
                          <select
                            value={editingCaseInfo.status || 'PENDING_APPLY'}
                            onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, status: e.target.value as CaseManagementStatus })}
                            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs text-slate-900"
                          >
                            <option value="PENDING_APPLY">待申请 (准备递交)</option>
                            <option value="APPLYING">申请中 (已下发受理通知书)</option>
                            <option value="EXAMINING">审查中 (实质审查阶段)</option>
                            <option value="REGISTERED">已注册 (获准注册/核发证书)</option>
                            <option value="PENDING_REPLY">待答复 (收到审查意见/异议通知)</option>
                            <option value="INVALID">已失效 (驳回/放弃/注销)</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">知识产权主管局</label>
                        <div className="relative">
                          <select
                            value={editingCaseInfo.officialAgency || ''}
                            onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, officialAgency: e.target.value })}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs text-slate-900"
                          >
                            <option value="">请选择主管局</option>
                            {DEFAULT_OFFICIAL_AGENCIES.map((agency) => (
                              <option key={agency} value={agency}>
                                {agency}
                              </option>
                            ))}
                            {editingCaseInfo.officialAgency && !DEFAULT_OFFICIAL_AGENCIES.includes(editingCaseInfo.officialAgency) && (
                              <option value={editingCaseInfo.officialAgency}>
                                {editingCaseInfo.officialAgency}
                              </option>
                            )}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">申报/答复截止日</label>
                        <input
                          type="date"
                          value={editingCaseInfo.filingDeadline || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, filingDeadline: e.target.value })}
                          className="w-full text-xs font-mono font-bold text-amber-700 bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">申请地区</label>
                        <div className="relative">
                          <select
                            value={editingCaseInfo.region || getRegionByCountry(editingCaseInfo.country || editingCaseInfo.priorityCountry || editingCaseInfo.jurisdiction || '')}
                            onChange={(e) => {
                              const newRegion = e.target.value;
                              const availableCountries = getCountriesByRegion(newRegion);
                              const currentCountry = editingCaseInfo.country || editingCaseInfo.priorityCountry || editingCaseInfo.jurisdiction || '';
                              const newCountry = availableCountries.includes(currentCountry) ? currentCountry : (availableCountries[0] || '');
                              setEditingCaseInfo({
                                ...editingCaseInfo,
                                region: newRegion,
                                country: newCountry,
                                priorityCountry: newCountry,
                                jurisdiction: newCountry
                              });
                            }}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs text-slate-900"
                          >
                            <option value="">请选择所属地区</option>
                            {ALL_REGION_NAMES.map((region) => (
                              <option key={region} value={region}>
                                {region}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">申请国家</label>
                        <div className="relative">
                          <select
                            value={editingCaseInfo.country || editingCaseInfo.priorityCountry || editingCaseInfo.jurisdiction || ''}
                            onChange={(e) => {
                              const selectedCountry = e.target.value;
                              const deducedRegion = getRegionByCountry(selectedCountry);
                              setEditingCaseInfo({
                                ...editingCaseInfo,
                                country: selectedCountry,
                                priorityCountry: selectedCountry,
                                jurisdiction: selectedCountry,
                                region: editingCaseInfo.region || deducedRegion
                              });
                            }}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs text-slate-900"
                          >
                            <option value="">请选择国家/地区</option>
                            {(editingCaseInfo.region 
                              ? getCountriesByRegion(editingCaseInfo.region) 
                              : getAllMappedCountries()
                            ).map((country) => (
                              <option key={country} value={country}>
                                {country}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 分组 2: 官方申请、注册与最新进度 */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-l-2 border-slate-700 pl-2">
                      <span>官方申请、注册登记与最新进度</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">官方申请号</label>
                        <input
                          type="text"
                          value={editingCaseInfo.applicationNo || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, applicationNo: e.target.value })}
                          placeholder="如：5G4020260813401"
                          className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">官方申请日</label>
                        <input
                          type="date"
                          value={editingCaseInfo.applyDate || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, applyDate: e.target.value })}
                          className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">最新注册进度</label>
                        <div className="relative">
                          <select
                            value={editingCaseInfo.latestProgress || editingNewStage || '获准注册核发证书'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingCaseInfo({ ...editingCaseInfo, latestProgress: val });
                              setEditingNewStage(val);
                            }}
                            className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs text-blue-900"
                          >
                            {REGISTRATION_PROGRESS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                            {(editingCaseInfo.latestProgress || editingNewStage) &&
                              !REGISTRATION_PROGRESS_OPTIONS.includes(editingCaseInfo.latestProgress || editingNewStage || '') && (
                                <option value={editingCaseInfo.latestProgress || editingNewStage}>
                                  {editingCaseInfo.latestProgress || editingNewStage}
                                </option>
                              )}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">官方注册号</label>
                        <input
                          type="text"
                          value={editingCaseInfo.registrationNo || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, registrationNo: e.target.value })}
                          placeholder="如：REG-8890123"
                          className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs font-bold text-emerald-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">官方注册日</label>
                        <input
                          type="date"
                          value={editingCaseInfo.registrationDate || editingCaseInfo.regIssueDate || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, registrationDate: e.target.value, regIssueDate: e.target.value })}
                          className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 分组 3: 官方公告与国际注册信息 */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-l-2 border-slate-700 pl-2">
                      <span>官方公告与国际注册信息</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">初审公告期号</label>
                        <input
                          type="text"
                          value={editingCaseInfo.initialIssueNo || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, initialIssueNo: e.target.value })}
                          placeholder="如：1892期"
                          className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">初审公告日</label>
                        <input
                          type="date"
                          value={editingCaseInfo.initialIssueDate || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, initialIssueDate: e.target.value })}
                          className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">注册公告期号</label>
                        <input
                          type="text"
                          value={editingCaseInfo.regIssueNo || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, regIssueNo: e.target.value })}
                          placeholder="如：1904期"
                          className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">注册公告日</label>
                        <input
                          type="date"
                          value={editingCaseInfo.regIssueDate || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, regIssueDate: e.target.value })}
                          className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">国际注册号</label>
                        <input
                          type="text"
                          value={editingCaseInfo.intlRegNo || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, intlRegNo: e.target.value })}
                          placeholder="如：IR-2026-90812"
                          className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">国际注册日</label>
                        <input
                          type="date"
                          value={editingCaseInfo.intlRegDate || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, intlRegDate: e.target.value })}
                          placeholder="如：2026-08-15"
                          className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 分组 4: 权利有效期限与续展 */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-l-2 border-slate-700 pl-2">
                      <span>权利有效期限与续展</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">权利终止日/有效期止</label>
                        <input
                          type="date"
                          value={editingCaseInfo.rightsEndDate || editingCaseInfo.validUntil || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, rightsEndDate: e.target.value, validUntil: e.target.value })}
                          className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">续展起始日</label>
                        <input
                          type="date"
                          value={editingCaseInfo.renewalStartDate || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, renewalStartDate: e.target.value })}
                          className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 分组 5: 申请人主体信息 */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-l-2 border-slate-700 pl-2">
                      <span>申请人主体信息</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">申请人主体</label>
                        <div className="relative">
                          <select
                            value={editingCaseInfo.applicant || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const matched = applicantMappings.find(item => item.applicant === val);
                              if (matched) {
                                setEditingCaseInfo(prev => ({
                                  ...prev,
                                  applicant: val,
                                  applicantEn: matched.applicantEn || '',
                                  applicantAddress: matched.applicantAddress || '',
                                  applicantAddressEn: matched.applicantAddressEn || ''
                                }));
                              } else {
                                setEditingCaseInfo(prev => ({
                                  ...prev,
                                  applicant: val,
                                  applicantEn: '',
                                  applicantAddress: '',
                                  applicantAddressEn: ''
                                }));
                              }
                            }}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs text-slate-900"
                          >
                            <option value="">请选择申请人主体</option>
                            {applicantMappings.map((m) => (
                              <option key={m.id} value={m.applicant}>
                                {m.applicant}
                              </option>
                            ))}
                            {editingCaseInfo.applicant && !applicantMappings.some(m => m.applicant === editingCaseInfo.applicant) && (
                              <option value={editingCaseInfo.applicant}>
                                {editingCaseInfo.applicant}
                              </option>
                            )}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          申请人英文 <span className="text-[10px] text-slate-400 font-normal">(根据主体自动带出)</span>
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={editingCaseInfo.applicantEn || ''}
                          placeholder="根据主体自动带出"
                          className="w-full text-xs font-mono bg-slate-100 border border-slate-200 text-slate-600 rounded-lg px-3 py-1.5 focus:outline-none cursor-not-allowed shadow-2xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          申请人地址 <span className="text-[10px] text-slate-400 font-normal">(根据主体自动带出)</span>
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={editingCaseInfo.applicantAddress || ''}
                          placeholder="根据主体自动带出"
                          className="w-full text-xs bg-slate-100 border border-slate-200 text-slate-600 rounded-lg px-3 py-1.5 focus:outline-none cursor-not-allowed shadow-2xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          申请人地址英文 <span className="text-[10px] text-slate-400 font-normal">(根据主体自动带出)</span>
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={editingCaseInfo.applicantAddressEn || ''}
                          placeholder="根据主体自动带出"
                          className="w-full text-xs font-mono bg-slate-100 border border-slate-200 text-slate-600 rounded-lg px-3 py-1.5 focus:outline-none cursor-not-allowed shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 分组 6: 承办代理信息 */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-l-2 border-slate-700 pl-2">
                      <span>承办代理信息</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">承办代理机构</label>
                        <div className="relative">
                          <select
                            value={editingCaseInfo.agencyName || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const matched = agencyMappings.find(item => item.agencyName === val);
                              if (matched) {
                                setEditingCaseInfo(prev => ({
                                  ...prev,
                                  agencyName: val,
                                  agencyDocketNo: matched.agencyDocketNo || '',
                                  agentName: matched.agentName || ''
                                }));
                              } else {
                                setEditingCaseInfo(prev => ({
                                  ...prev,
                                  agencyName: val,
                                  agencyDocketNo: '',
                                  agentName: ''
                                }));
                              }
                            }}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs text-slate-900"
                          >
                            <option value="">请选择承办代理机构</option>
                            {agencyMappings.map((m) => (
                              <option key={m.id} value={m.agencyName}>
                                {m.agencyName}
                              </option>
                            ))}
                            {editingCaseInfo.agencyName && !agencyMappings.some(m => m.agencyName === editingCaseInfo.agencyName) && (
                              <option value={editingCaseInfo.agencyName}>
                                {editingCaseInfo.agencyName}
                              </option>
                            )}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          代理机构案卷号 <span className="text-[10px] text-slate-400 font-normal">(根据机构自动带出)</span>
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={editingCaseInfo.agencyDocketNo || ''}
                          placeholder="根据机构自动带出"
                          className="w-full text-xs font-mono bg-slate-100 border border-slate-200 text-slate-600 rounded-lg px-3 py-1.5 focus:outline-none cursor-not-allowed shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          代理人 <span className="text-[10px] text-slate-400 font-normal">(根据机构自动带出)</span>
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={editingCaseInfo.agentName || ''}
                          placeholder="根据机构自动带出"
                          className="w-full text-xs bg-slate-100 border border-slate-200 text-slate-600 rounded-lg px-3 py-1.5 focus:outline-none cursor-not-allowed shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">委案日期</label>
                        <input
                          type="date"
                          value={editingCaseInfo.agencyEntrustDate || ''}
                          onChange={(e) => setEditingCaseInfo({ ...editingCaseInfo, agencyEntrustDate: e.target.value })}
                          className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedCaseForMaintain(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveMaintainGoods}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-all shadow-xs flex items-center gap-1.5 active:scale-[0.98]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存并同步</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. 弹窗 3: 【批量导入案件数据】弹窗 (含下载模板按钮) */}
      {/* ======================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">批量导入商标案件数据</h3>
                  <p className="text-xs text-slate-500">上传标准 CSV/Excel 格式文件批量新增案件台账</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFile(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              {/* Step 1: 下载模板 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">1</span>
                    <span className="font-bold text-slate-800 text-xs">下载标准导入模板</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadImportTemplate}
                    className="px-3.5 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>下载导入模板 (.csv)</span>
                  </button>
                </div>
                <p className="text-slate-500 leading-relaxed pl-7">
                  请先下载系统格式化的 CSV 模板，参照格式填写【案件编号】、【建案编码】、【商标名称】、【品牌】、【尼斯分类】、【申请国家/地区】等核心数据。
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
                      if (file) setImportFile(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="space-y-1.5 pointer-events-none">
                    <FileSpreadsheet className="w-8 h-8 text-blue-500 mx-auto group-hover:scale-110 transition-transform" />
                    {importFile ? (
                      <div>
                        <p className="font-bold text-blue-700">{importFile.name}</p>
                        <p className="text-[11px] text-slate-400">({(importFile.size / 1024).toFixed(1)} KB) 已选中，点击下方按钮确认导入</p>
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

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFile(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchImport}
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
      {/* 7. 弹窗 4: 【批量更新案件数据】弹窗 (根据选中字段自动拼接已有单据编号生成模板) */}
      {/* ======================================================== */}
      {isBatchUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 flex flex-col space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">批量更新案件字段</h3>
                  <p className="text-xs text-slate-500">选择本次需要更新的列字段，下载包含列表已有单据编号的专用更新模板</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBatchUpdateModalOpen(false);
                  setUpdateFile(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs overflow-y-auto max-h-[60vh] pr-1">
              
              {/* Step 1: 选择更新字段 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">1</span>
                    <span className="font-bold text-slate-800 text-xs">勾选本次需要批量更新的列字段 (已选 {selectedUpdateFields.length} 个)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedUpdateFields(UPDATEABLE_FIELD_OPTIONS.map(f => f.key))}
                      className="text-blue-600 hover:underline font-medium cursor-pointer"
                    >
                      全选
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedUpdateFields(['caseNo'])}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      清空
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
                  {UPDATEABLE_FIELD_OPTIONS.map(opt => {
                    const isRequired = opt.key === 'caseNo' || !!opt.required;
                    const isChecked = isRequired || selectedUpdateFields.includes(opt.key);
                    return (
                      <label
                        key={opt.key}
                        onClick={() => {
                          if (isRequired) return; // 必选字段不可修改/取消
                          if (isChecked) {
                            setSelectedUpdateFields(selectedUpdateFields.filter(k => k !== opt.key));
                          } else {
                            setSelectedUpdateFields([...selectedUpdateFields, opt.key]);
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-between gap-1 ${
                          isRequired
                            ? 'bg-blue-100/70 border-blue-300/90 text-blue-950 shadow-2xs cursor-not-allowed select-none'
                            : isChecked
                              ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-2xs cursor-pointer'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                            isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{opt.label}</span>
                        </div>
                        {isRequired && (
                          <span className="text-[10px] bg-blue-200/80 text-blue-800 font-normal px-1.5 py-0.5 rounded shrink-0">
                            必选
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: 下载专属更新模板 */}
              <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">2</span>
                    <span className="font-bold text-slate-800 text-xs">下载更新模板</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadUpdateTemplate}
                    className="px-3.5 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>下载更新模板 (.csv)</span>
                  </button>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  点击【下载更新模板】后，系统将把第一列生成为当前 <strong className="text-blue-700 font-mono">{searchFilteredCases.length}</strong> 条【案件编号】，顶部附带<strong>填写说明注释</strong>与<strong>一行标准示例</strong>。导出模板中包含受控字段（尼斯分类、类似群组、案件流转状态、知识产权主管局、最新注册进度、申请人主体、承办代理机构）的系统支持选项。
                </p>
              </div>

              {/* Step 3: 上传更新后的模板 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">3</span>
                  <span className="font-bold text-slate-800 text-xs">上传更改后的更新模板 (导入时将进行受控选项硬校验)</span>
                </div>

                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-4 text-center bg-white transition-all group cursor-pointer">
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUpdateFile(file);
                        setBatchValidationErrors(null);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="space-y-1 pointer-events-none">
                    <FileSpreadsheet className="w-7 h-7 text-blue-500 mx-auto group-hover:scale-110 transition-transform" />
                    {updateFile ? (
                      <div>
                        <p className="font-bold text-blue-700">{updateFile.name}</p>
                        <p className="text-[11px] text-slate-400">文件已就绪，点击下方【确认批量更新】将自动进行系统选项校验</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-slate-700">点击上传更新后的 CSV 文件</p>
                        <p className="text-[11px] text-slate-400">系统将依据第一列案件编号精准匹配更正数据，并校验受控选项</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 校验错误详细报告区 */}
              {batchValidationErrors && batchValidationErrors.length > 0 && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200/90 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>检测到 {batchValidationErrors.length} 处非法填列值，更新已自动中断 (导入失败)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBatchValidationErrors(null)}
                      className="text-[11px] text-red-600 hover:underline font-medium cursor-pointer"
                    >
                      隐藏错误详情
                    </button>
                  </div>
                  <p className="text-[11px] text-red-700 leading-normal">
                    根据系统规则，下述受控字段填列的内容不在系统中已有的可选项内。请按表格右侧提示的合法选项修改 CSV 文件后重新上传：
                  </p>

                  <div className="max-h-52 overflow-y-auto rounded-lg border border-red-200 bg-white text-[11px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-red-100/70 sticky top-0 text-red-900 font-bold border-b border-red-200 shadow-2xs">
                        <tr>
                          <th className="p-2 w-16">Excel行号</th>
                          <th className="p-2 w-32">案件编号</th>
                          <th className="p-2 w-28">校验字段</th>
                          <th className="p-2 w-36">未填对的非法值</th>
                          <th className="p-2">系统支持的合法选项/格式</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100 text-slate-700">
                        {batchValidationErrors.map((err, idx) => (
                          <tr key={idx} className="hover:bg-red-50/60 transition-colors">
                            <td className="p-2 font-mono text-slate-500">第 {err.rowNum} 行</td>
                            <td className="p-2 font-mono font-semibold text-slate-900">{err.caseNo}</td>
                            <td className="p-2 font-bold text-red-800">{err.fieldLabel}</td>
                            <td className="p-2 font-medium text-red-600 bg-red-50/80 rounded font-mono">{err.value}</td>
                            <td className="p-2 text-slate-600 leading-snug">{err.allowedOptionsStr}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsBatchUpdateModalOpen(false);
                  setUpdateFile(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchUpdate}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>确认批量更新</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. 弹窗 5: 【建案需求详情】弹窗 (完全复用建案申请页面的详情样式与结构) */}
      {/* ======================================================== */}
      {selectedProposalForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Top Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                  selectedProposalForDetail.status === 'ACCEPTED' ? 'bg-emerald-600 text-white' :
                  selectedProposalForDetail.status === 'PROCESSING' ? 'bg-blue-600 text-white' :
                  selectedProposalForDetail.status === 'UNSUBMITTED' ? 'bg-amber-500 text-white' :
                  selectedProposalForDetail.status === 'TERMINATED' ? 'bg-slate-500 text-white' :
                  'bg-blue-600 text-white'
                }`}>
                  {selectedProposalForDetail.status === 'ACCEPTED' ? '生效中' :
                   selectedProposalForDetail.status === 'PROCESSING' ? '处理中' :
                   selectedProposalForDetail.status === 'UNSUBMITTED' ? '未提交' :
                   selectedProposalForDetail.status === 'TERMINATED' ? '已终止' : '处理中'}
                </span>
                <h3 className="text-base font-bold text-slate-900">建案需求详情</h3>
                <div className="flex items-center gap-1.5 text-sm sm:text-base font-mono font-bold text-slate-900">
                  <span>{selectedProposalForDetail.proposalNo}</span>
                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      title="复制提案编号"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedProposalForDetail.proposalNo);
                        setCopiedId(`proposal_modal_${selectedProposalForDetail.proposalNo}`);
                        showToast(`已复制提案编号: ${selectedProposalForDetail.proposalNo}`);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className={`p-1 rounded transition-colors flex items-center justify-center cursor-pointer ${
                        copiedId === `proposal_modal_${selectedProposalForDetail.proposalNo}`
                          ? 'text-emerald-600 bg-emerald-50'
                          : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      {copiedId === `proposal_modal_${selectedProposalForDetail.proposalNo}` ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                    {copiedId === `proposal_modal_${selectedProposalForDetail.proposalNo}` && (
                      <div className="absolute left-full ml-1.5 px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-sans font-medium rounded-md shadow-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 flex items-center gap-1 z-30">
                        <span>已复制</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedProposalForDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="px-6 bg-slate-50/80 border-b border-slate-200/80 flex items-center gap-6 text-xs shrink-0">
              <button
                onClick={() => setProposalDetailTab('info')}
                className={`py-3 font-medium cursor-pointer border-b-2 transition-all ${
                  proposalDetailTab === 'info'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                需求信息
              </button>
              <button
                onClick={() => setProposalDetailTab('approval')}
                className={`py-3 font-medium cursor-pointer border-b-2 transition-all ${
                  proposalDetailTab === 'approval'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                审批信息
              </button>
              <button
                onClick={() => setProposalDetailTab('history')}
                className={`py-3 font-medium cursor-pointer border-b-2 transition-all ${
                  proposalDetailTab === 'history'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                操作记录
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
              {proposalDetailTab === 'info' && (
                <div className="space-y-6">
                  
                  {/* 1. 商标与使用信息 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>商标与使用信息</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div>
                        <span className="text-slate-500">提案类型：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.proposalType || '商标'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">商标名称：</span>
                        <span className="text-slate-900 font-bold">{selectedProposalForDetail.trademarkName}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500">尼斯分类：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.classes}</span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">类似群组：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.similarGroups || '-'}</span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">商品/服务：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.goodsServices || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">商标等级：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.trademarkGrade || '核心级'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">重要等级：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.importanceLevel}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">商标形式：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.trademarkForm}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">商标来源：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.trademarkSource || '自研设计'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">是否三维商标：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.is3dTrademark || '否'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">颜色形式：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.colorForm || '黑白 (不指定颜色)'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">是否使用设计颜色：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.isDesignedColorUsed || '否'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">是否已注册近似商标：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.isSimilarTrademarkRegistered || '否'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. 检索与业务需求 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>检索与业务需求</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div>
                        <span className="text-slate-500">业务类型：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.businessType || '国内注册'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请类型：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.applicationType || '一般'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请地区：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.region || getRegionByCountry(selectedProposalForDetail.country || selectedProposalForDetail.jurisdiction || '')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请国家：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.country || selectedProposalForDetail.jurisdiction || ''}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">所属品牌：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.brand}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">拟使用时间：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedProposalForDetail.intendedUseDate || '2026-09-01'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">代理机构类型：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.agencyType || '代理机构委外'}</span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">技术类别及检索范围：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.techCategory || '智能口腔算法、电机驱动控制'}</span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">产品领域：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.productDomain || '口腔护理智能硬件、电动牙刷冲牙器'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. 需求背景与用途简述 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>需求背景与用途简述</span>
                    </h4>
                    <div className="py-1 text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedProposalForDetail.description || '新建电动牙刷智能系列商标检索与建案需求，向法务申请排查在先商标风险及建案。'}
                    </div>
                  </div>

                  {/* 4. 申请人信息 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>申请人信息</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div>
                        <span className="text-slate-500">申请人：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.applicant || '陆燕丽'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请时间：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedProposalForDetail.applyTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">需求部门：</span>
                        <span className="text-slate-900 font-medium">{selectedProposalForDetail.department || '研发中心'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {proposalDetailTab === 'approval' && (
                <div>
                  {(() => {
                    const isTriggered = selectedProposalForDetail.status !== 'UNSUBMITTED';
                    if (!isTriggered) {
                      return (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                          <FileText className="w-10 h-10 text-slate-300 stroke-1" />
                          <span className="text-xs font-semibold text-slate-500">未触发审批</span>
                          <span className="text-[11px] text-slate-400">当前建案需求为未提交状态，暂无审批记录</span>
                        </div>
                      );
                    }

                    const records = getProposalApprovalRecords(selectedProposalForDetail);

                    return (
                      <div className="space-y-6">
                        {/* 顶栏信息 */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                              <span>当前流转节点：{selectedProposalForDetail.status === 'ACCEPTED' ? '全流程归档完成' : (selectedProposalForDetail.currentNode || '审批流转中')}</span>
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              {selectedProposalForDetail.status === 'PROCESSING' ? '处理中' : selectedProposalForDetail.status === 'ACCEPTED' ? '已通过并归档' : selectedProposalForDetail.status === 'TERMINATED' ? '已终止' : '审批流转中'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200/60 text-xs">
                            <div>
                              <span className="text-slate-400">当前处理人：</span>
                              <span className="font-medium text-slate-800 ml-1">{selectedProposalForDetail.currentHandler || selectedProposalForDetail.applicant}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">节点停留时长：</span>
                              <span className="font-mono font-medium text-slate-800 ml-1">{selectedProposalForDetail.dwellTime || '3小时'}</span>
                            </div>
                          </div>
                        </div>

                        {/* 按顺序显示的详细审批人列表 */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="text-xs font-bold text-slate-900 border-l-2 border-slate-800 pl-2">
                              按顺序流转的审批人履历 ({records.length} 个节点)
                            </h4>
                            <span className="text-[11px] text-slate-400">依时间先后顺序排列</span>
                          </div>

                          <div className="relative pl-3 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                            {records.map((rec) => {
                              const isCurrent = rec.isCurrent || rec.action === 'PROCESSING';
                              const isRejected = rec.action === 'REJECTED';

                              return (
                                <div key={rec.id} className="relative pl-6">
                                  {/* 时间线圆形数字节点 */}
                                  <span className={`absolute left-[-13px] top-2.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white z-10 ${
                                    isCurrent 
                                      ? 'bg-blue-600 ring-4 ring-blue-100' 
                                      : isRejected 
                                        ? 'bg-rose-600 ring-4 ring-rose-100' 
                                        : 'bg-emerald-600 ring-4 ring-emerald-100'
                                  }`}>
                                    {rec.stepNumber}
                                  </span>

                                  {/* 节点标题行 - 置于卡片外部 */}
                                  <div className="flex items-center justify-between gap-2 mb-1.5 pt-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-xs">{rec.stepNumber}. {rec.nodeName}</span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                        rec.action === 'APPROVED' || rec.action === 'SUBMITTED' || rec.action === 'ACCEPTED'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : isCurrent
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                      }`}>
                                        {rec.actionText}
                                      </span>
                                    </div>
                                    {rec.operateTime && (
                                      <span className="text-[11px] font-mono text-slate-400">{rec.operateTime}</span>
                                    )}
                                  </div>

                                  {/* 卡片容器 */}
                                  <div className={`p-3.5 rounded-xl border bg-white shadow-2xs ${
                                    isCurrent 
                                      ? 'border-blue-300 ring-2 ring-blue-50' 
                                      : 'border-slate-200/90'
                                  }`}>
                                    {/* 4 字段平铺行 */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                                      <div>
                                        <span className="text-slate-400">审批人：</span>
                                        <span className="font-semibold text-slate-900 ml-0.5">{rec.approverName}</span>
                                      </div>
                                      {rec.approverRole && (
                                        <div>
                                          <span className="text-slate-400">职务/角色：</span>
                                          <span className="font-medium text-slate-700 ml-0.5">{rec.approverRole}</span>
                                        </div>
                                      )}
                                      {rec.approverDept && (
                                        <div>
                                          <span className="text-slate-400">所属部门：</span>
                                          <span className="font-medium text-slate-700 ml-0.5">{rec.approverDept}</span>
                                        </div>
                                      )}
                                      {rec.dwellTime && (
                                        <div>
                                          <span className="text-slate-400">节点停留：</span>
                                          <span className="font-mono text-slate-700 ml-0.5">{rec.dwellTime}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* 签署/审批意见 */}
                                    {rec.opinion && (
                                      <div className="text-xs text-slate-700 pt-2.5 mt-2.5 border-t border-slate-100 flex items-start gap-1">
                                        <span className="font-medium text-slate-800 shrink-0">审批意见：</span>
                                        <span className="text-slate-700 leading-relaxed">{rec.opinion}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {proposalDetailTab === 'history' && (
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
                          <td className="py-2.5 px-3.5 font-mono">{selectedProposalForDetail.applyTime}</td>
                          <td className="py-2.5 px-3.5 font-medium">{selectedProposalForDetail.applicant}</td>
                          <td className="py-2.5 px-3.5 text-blue-600 font-medium">保存并提交需求</td>
                          <td className="py-2.5 px-3.5 text-slate-500">生成提案单据 {selectedProposalForDetail.proposalNo} 并推送到【审批中心】</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-3.5 font-mono">{selectedProposalForDetail.applyTime}</td>
                          <td className="py-2.5 px-3.5 font-medium">工作流系统</td>
                          <td className="py-2.5 px-3.5 text-emerald-600 font-medium">智能审批推流</td>
                          <td className="py-2.5 px-3.5 text-slate-500">已将任务成功指派给当前节点【{selectedProposalForDetail.currentNode || '需求部门主管复核'}】</td>
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

      {/* 上传卷宗文书档案 Modal */}
      {isUploadDocModalOpen && selectedCaseForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">上传卷宗文书档案</h3>
                <span className="text-xs font-mono text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {selectedCaseForView.caseNo}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadDocModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmUploadDoc} className="p-5 space-y-4">
              {/* 1. 文件类型选择 (企业文件, 递交文件, 官方文件, 事务所文件, 其他文件) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  文件类型 <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {[
                    { key: '企业文件', label: '企业文件' },
                    { key: '递交文件', label: '递交文件' },
                    { key: '官方文件', label: '官方文件' },
                    { key: '事务所文件', label: '事务所文件' },
                    { key: '其他文件', label: '其他文件' },
                  ].map((cat) => {
                    const isSelected = uploadFormCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setUploadFormCategory(cat.key as DocumentCategory)}
                        className={`py-2 px-1 rounded-lg text-xs font-medium text-center border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold ring-2 ring-blue-100'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. 文件拖拽上传选择框 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  选择本地文件 <span className="text-rose-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-4 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedUploadFile(file);
                        if (!uploadFormTitle) {
                          setUploadFormTitle(file.name);
                        }
                        const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
                        setUploadFormType(ext);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {selectedUploadFile ? (
                    <div className="flex items-center justify-center gap-2 text-blue-700 font-medium text-xs">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="truncate max-w-[280px]">{selectedUploadFile.name}</span>
                      <span className="text-slate-400 font-mono">({(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 mx-auto text-slate-400 stroke-1" />
                      <p className="text-xs text-slate-600 font-medium">点击或拖拽文件至此处上传</p>
                      <p className="text-[10px] text-slate-400">支持 PDF、DOCX、XLSX、PNG、JPG、ZIP 等常用卷宗格式</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. 文件名称与文号 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    文件名称 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadFormTitle}
                    onChange={(e) => setUploadFormTitle(e.target.value)}
                    placeholder="例如：商标注册申请书（官方盖章件）"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    文件编号 / 文号
                  </label>
                  <input
                    type="text"
                    value={uploadFormDocNumber}
                    onChange={(e) => setUploadFormDocNumber(e.target.value)}
                    placeholder="例如：DOC20260823001"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* 4. 文件格式与归档日期与上传人 */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">文件格式</label>
                  <select
                    value={uploadFormType}
                    onChange={(e) => setUploadFormType(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="XLSX">XLSX</option>
                    <option value="PNG">PNG</option>
                    <option value="JPG">JPG</option>
                    <option value="ZIP">ZIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">归档/发文日期</label>
                  <input
                    type="date"
                    value={uploadFormDate}
                    onChange={(e) => setUploadFormDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">上传归档人</label>
                  <input
                    type="text"
                    value={uploadFormUploader}
                    onChange={(e) => setUploadFormUploader(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 5. 备注说明 */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">备注说明</label>
                <input
                  type="text"
                  value={uploadFormRemarks}
                  onChange={(e) => setUploadFormRemarks(e.target.value)}
                  placeholder="例如：涉及国内优先权递交，盖章原件已移交知识产权档案室"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadDocModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>确认上传归档</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 卷宗文件在线预览 Modal */}
      {previewingDoc && selectedCaseForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate max-w-[400px]" title={previewingDoc.title}>
                      {previewingDoc.title}
                    </h3>
                    {renderDocCategoryBadge(previewingDoc.category)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    文书编号：{previewingDoc.docNumber} | 关联案件：{selectedCaseForView.caseNo} ({selectedCaseForView.trademarkName})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* 缩放倍率控制 */}
                <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-lg text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(prev => Math.max(50, prev - 15))}
                    className="px-2 py-0.5 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                    title="缩小"
                  >
                    -
                  </button>
                  <span className="px-1 text-[11px] text-slate-700 font-semibold min-w-[40px] text-center">{previewZoom}%</span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(prev => Math.min(200, prev + 15))}
                    className="px-2 py-0.5 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                    title="放大"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(100)}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-200 hover:bg-slate-300 rounded text-slate-700 cursor-pointer ml-0.5"
                  >
                    重置
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerDownloadDoc(previewingDoc);
                    showToast(`已成功下载原文件：${previewingDoc.title}`);
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载原件</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewingDoc(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Preview Workspace */}
            <div className="flex-1 bg-slate-200/80 overflow-auto p-4 sm:p-8 flex justify-center items-start">
              <div 
                className="transition-transform duration-200 w-full max-w-4xl flex justify-center"
                style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
              >
                {(() => {
                  const fileName = (previewingDoc.title || '').toLowerCase();
                  const docType = (previewingDoc.type || '').toLowerCase();

                  let ext = '';
                  if (fileName.includes('.')) {
                    const parts = fileName.split('.');
                    ext = parts.pop() || '';
                    if (ext === 'gz' && parts.length > 0 && parts[parts.length - 1] === 'tar') {
                      ext = 'tar.gz';
                    }
                  } else {
                    ext = docType;
                  }

                  const isImg = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(ext);
                  const isPdf = ext === 'pdf';
                  const isDoc = ['doc', 'docx', 'txt', 'rtf', 'md'].includes(ext);
                  const isSheet = ['xls', 'xlsx', 'csv'].includes(ext);
                  const isPpt = ['ppt', 'pptx'].includes(ext);
                  const isArchive = ['zip', 'rar', '7z', 'tar.gz', 'tar', 'gz', 'tgz'].includes(ext);

                  // 1. 图片类 (.png, .jpg, .jpeg, .gif, .bmp, .webp, .svg)
                  if (isImg) {
                    return (
                      <div className="w-full bg-slate-900 rounded-xl p-4 shadow-2xl flex flex-col items-center justify-center min-h-[600px] text-white">
                        <div className="mb-3 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[11px] text-slate-300 font-mono flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>图像在线预览</span>
                          <span>|</span>
                          <span className="uppercase text-blue-400 font-bold">{ext} 格式</span>
                        </div>
                        <div className="relative max-w-full overflow-hidden rounded-lg border border-slate-700/80 shadow-2xl bg-black/40 p-2 flex items-center justify-center">
                          <img 
                            src={previewingDoc.fileUrl} 
                            alt={previewingDoc.title}
                            className="max-w-full max-h-[680px] object-contain rounded"
                          />
                        </div>
                        <div className="mt-4 text-xs text-slate-400 font-mono">
                          原图文件：{previewingDoc.title} ({previewingDoc.size})
                        </div>
                      </div>
                    );
                  }

                  // 2. PDF 类 (.pdf)
                  if (isPdf) {
                    return (
                      <div className="w-full bg-white shadow-2xl rounded-lg overflow-hidden border border-slate-300 min-h-[780px]">
                        <iframe 
                          src={previewingDoc.fileUrl} 
                          className="w-full h-[780px] border-0 rounded bg-white"
                          title={previewingDoc.title}
                        />
                      </div>
                    );
                  }

                  // 3. Word / 富文本 / Markdown 文档 (.doc, .docx, .txt, .rtf, .md)
                  if (isDoc) {
                    const isTxtOrMd = ext === 'txt' || ext === 'md' || ext === 'rtf';
                    return (
                      <div className="w-full bg-white shadow-2xl border border-slate-300 rounded-xl overflow-hidden min-h-[780px] flex flex-col">
                        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-black text-white text-[11px]">
                              W
                            </div>
                            <span>Microsoft Word Online - 文档在线预览模式</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700 font-mono uppercase">
                              {ext}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
                            <span>页面: 1 / 1 页</span>
                            <span>编码: UTF-8</span>
                            <span className="text-emerald-400 font-bold">已核验同步</span>
                          </div>
                        </div>

                        <div className="bg-slate-100 border-b border-slate-200 px-6 py-1.5 flex items-center justify-between text-[11px] text-slate-600 font-sans">
                          <div className="flex items-center gap-4">
                            <span>字体: 宋体 / SimSun</span>
                            <span>字号: 小四 (12pt)</span>
                            <span>行距: 1.5 倍</span>
                          </div>
                          <div className="font-mono text-slate-500">字数统计: 1,480 字</div>
                        </div>

                        <div className="flex-1 p-6 sm:p-10 bg-slate-200/60 flex justify-center overflow-auto">
                          <div className="w-full max-w-2xl bg-white shadow-xl border border-slate-300 p-8 sm:p-12 min-h-[680px] text-slate-900 font-serif leading-relaxed space-y-6 relative">
                            <div className="border-b-2 border-slate-900 pb-4 text-center">
                              <h1 className="text-xl font-bold font-serif text-slate-900">{previewingDoc.title}</h1>
                              <p className="text-xs font-mono text-slate-500 mt-1">
                                文书文号：{previewingDoc.docNumber} | 归档时间：{previewingDoc.issueDate}
                              </p>
                            </div>

                            <div className="space-y-4 text-xs text-slate-800 leading-loose">
                              <div className="p-3 bg-blue-50/60 rounded border border-blue-200 text-blue-900 font-sans space-y-1">
                                <p className="font-bold">【知识产权卷宗备案记录】</p>
                                <p>关联案件：{selectedCaseForView?.caseNo || 'SG-2026-0812'} ({selectedCaseForView?.trademarkName || '标的商标'})</p>
                                <p>归档部门/主体：{previewingDoc.uploader || '集团知识产权中心'} / {selectedCaseForView?.applicant || '权利人主体'}</p>
                              </div>

                              <p className="indent-8 font-serif">
                                本文件【{previewingDoc.title}】系由知产管理系统电子档案库归档保存之正本资料（文件类型：<strong className="uppercase font-mono">{ext}</strong>，文件大小：{previewingDoc.size}）。
                              </p>

                              {isTxtOrMd ? (
                                <div className="font-mono bg-slate-50 p-4 rounded border border-slate-200 text-slate-800 space-y-2 whitespace-pre-wrap leading-relaxed text-xs">
                                  <p className="text-slate-500">// 纯文本/Markdown 源码及解析预览</p>
                                  <p># {previewingDoc.title}</p>
                                  <p>- 案件编号: {selectedCaseForView?.caseNo}</p>
                                  <p>- 商标名称: {selectedCaseForView?.trademarkName}</p>
                                  <p>- 归档日期: {previewingDoc.issueDate}</p>
                                  <p>----------------------------------------</p>
                                  <p>{previewingDoc.remarks || '正文条款：本文件条款已经知产法务部形式核验合格，相关权利义务关系自下发之日起即时生效。'}</p>
                                </div>
                              ) : (
                                <div className="space-y-4 font-serif">
                                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1">一、文书要旨与法律效力声明</h3>
                                  <p className="indent-8">
                                    依据主管法域《商标法》及《知识产权行政诉讼规程》之规定，相关呈递条文、正本扫描件及权利转让/许可证明文件均已同步上传至知识产权保护网关，可直接作为行政答辩、异议复审或司法诉讼中的书证使用。
                                  </p>
                                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1">二、备注说明及归档核查</h3>
                                  <p className="indent-8">
                                    {previewingDoc.remarks || '经由专职知产专员与承办代理机构联合校对，文书格式标准无误，印签清晰完整。'}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="pt-12 flex justify-between items-end border-t border-slate-200">
                              <div className="text-[11px] font-mono text-slate-500">
                                知识产权电子归档系统校验通过
                              </div>
                              <div className="text-right space-y-1 relative">
                                <p className="text-xs font-bold text-slate-900">{selectedCaseForView?.applicant || '广州星际悦动股份有限公司'}</p>
                                <p className="text-[11px] text-slate-500">{previewingDoc.issueDate}</p>
                                <div className="w-24 h-24 rounded-full border-2 border-red-600/80 absolute -top-6 right-0 flex items-center justify-center text-red-600 font-bold text-[9px] text-center p-2 rotate-[-12deg] pointer-events-none opacity-80">
                                  {selectedCaseForView?.applicant || '知产中心'} (盖章)
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 4. 电子表格 (.xls, .xlsx, .csv)
                  if (isSheet) {
                    return (
                      <div className="w-full bg-white shadow-2xl border border-slate-300 rounded-xl overflow-hidden min-h-[720px] flex flex-col">
                        <div className="bg-emerald-800 text-white px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center font-black text-white text-[11px]">
                              X
                            </div>
                            <span>Microsoft Excel Online - 在线电子表格预览</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-200 border border-emerald-700 font-mono uppercase">
                              {ext}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-emerald-100 font-mono">
                            <span>单元格: A1:G10</span>
                            <span>|</span>
                            <span>自动求和: ¥ 1,408,700.00</span>
                          </div>
                        </div>

                        <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 text-xs">
                          <span className="font-bold font-mono text-slate-500 px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px]">fx</span>
                          <div className="flex-1 bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-xs text-slate-700">
                            =SUM(E2:E9) /* {previewingDoc.title} 汇总统筹公式 */
                          </div>
                        </div>

                        <div className="bg-slate-200 border-b border-slate-300 px-3 flex items-center gap-1 text-xs">
                          <button
                            type="button"
                            onClick={() => setSpreadsheetActiveTab('sheet1')}
                            className={`px-3 py-1.5 font-medium border-b-2 transition-colors cursor-pointer ${
                              spreadsheetActiveTab === 'sheet1' ? 'bg-white border-emerald-600 text-emerald-800 font-bold' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Sheet1 (商标使用证据与发票流水明细)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSpreadsheetActiveTab('sheet2')}
                            className={`px-3 py-1.5 font-medium border-b-2 transition-colors cursor-pointer ${
                              spreadsheetActiveTab === 'sheet2' ? 'bg-white border-emerald-600 text-emerald-800 font-bold' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Sheet2 (海关查扣与费用核销表)
                          </button>
                        </div>

                        <div className="flex-1 overflow-auto p-2 bg-slate-100">
                          <table className="w-full border-collapse bg-white border border-slate-300 text-xs">
                            <thead>
                              <tr className="bg-slate-200 text-slate-700 text-center font-mono font-bold border-b border-slate-300">
                                <th className="border border-slate-300 w-10 py-1 bg-slate-300/80">#</th>
                                <th className="border border-slate-300 px-3 py-1.5 w-12">A</th>
                                <th className="border border-slate-300 px-3 py-1.5">B</th>
                                <th className="border border-slate-300 px-3 py-1.5">C</th>
                                <th className="border border-slate-300 px-3 py-1.5">D</th>
                                <th className="border border-slate-300 px-3 py-1.5">E</th>
                                <th className="border border-slate-300 px-3 py-1.5">F</th>
                              </tr>
                            </thead>
                            <tbody className="font-sans text-slate-800">
                              {spreadsheetActiveTab === 'sheet1' ? (
                                <>
                                  <tr className="bg-emerald-50/80 font-bold text-slate-900 border-b border-slate-300">
                                    <td className="border border-slate-300 text-center font-mono bg-slate-100 py-1.5">1</td>
                                    <td className="border border-slate-300 px-2 py-1.5 font-mono">序号</td>
                                    <td className="border border-slate-300 px-2 py-1.5">合同/凭证编号</td>
                                    <td className="border border-slate-300 px-2 py-1.5">证据凭证名称</td>
                                    <td className="border border-slate-300 px-2 py-1.5">发生日期</td>
                                    <td className="border border-slate-300 px-2 py-1.5 text-right">金额 (RMB)</td>
                                    <td className="border border-slate-300 px-2 py-1.5 text-center">核查状态</td>
                                  </tr>
                                  {[
                                    { id: '1', no: 'CTR-2026-001', name: `《${selectedCaseForView?.trademarkName || '品牌'}》产品年度分销与使用授权合同`, date: '2026-03-15', amount: '¥ 450,000.00', status: '已核销' },
                                    { id: '2', no: 'INV-2026-882', name: '天猫/京东旗舰店线上推广发票与展位收据', date: '2026-04-10', amount: '¥ 128,500.00', status: '已校验' },
                                    { id: '3', no: 'EXP-2026-302', name: '上海国际口腔展现场展台商标使用凭证与租赁发票', date: '2026-05-20', amount: '¥ 96,000.00', status: '归档中' },
                                    { id: '4', no: 'CUS-2026-108', name: '广州海关出口产品报关单与品牌商标备案凭证', date: '2026-06-12', amount: '¥ 680,000.00', status: '已核销' },
                                    { id: '5', no: 'OTH-2026-901', name: '海外品牌官网与社交媒体投放广告宣讲发票', date: '2026-07-01', amount: '¥ 54,200.00', status: '已校验' },
                                  ].map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-blue-50/50 border-b border-slate-200">
                                      <td className="border border-slate-300 text-center font-mono bg-slate-100 py-1.5">{idx + 2}</td>
                                      <td className="border border-slate-300 px-2 py-1.5 font-mono text-slate-600">{row.id}</td>
                                      <td className="border border-slate-300 px-2 py-1.5 font-mono font-bold text-blue-700">{row.no}</td>
                                      <td className="border border-slate-300 px-2 py-1.5 font-medium">{row.name}</td>
                                      <td className="border border-slate-300 px-2 py-1.5 font-mono text-slate-500">{row.date}</td>
                                      <td className="border border-slate-300 px-2 py-1.5 text-right font-mono font-bold text-slate-900">{row.amount}</td>
                                      <td className="border border-slate-300 px-2 py-1.5 text-center">
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                          {row.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                  <tr className="bg-amber-50 font-bold border-b border-slate-300">
                                    <td className="border border-slate-300 text-center font-mono bg-slate-200 py-1.5">7</td>
                                    <td className="border border-slate-300 px-2 py-1.5 text-center" colSpan={4}>合计 Sum Total</td>
                                    <td className="border border-slate-300 px-2 py-1.5 text-right font-mono text-amber-800 text-sm">¥ 1,408,700.00</td>
                                    <td className="border border-slate-300 px-2 py-1.5 text-center text-slate-500">5 项数据</td>
                                  </tr>
                                </>
                              ) : (
                                <>
                                  <tr className="bg-blue-50/80 font-bold text-slate-900 border-b border-slate-300">
                                    <td className="border border-slate-300 text-center font-mono bg-slate-100 py-1.5">1</td>
                                    <td className="border border-slate-300 px-2 py-1.5 font-mono">案号</td>
                                    <td className="border border-slate-300 px-2 py-1.5">维权标的</td>
                                    <td className="border border-slate-300 px-2 py-1.5">侵权扣押物名称</td>
                                    <td className="border border-slate-300 px-2 py-1.5">海关查扣地</td>
                                    <td className="border border-slate-300 px-2 py-1.5 text-right">估值 (RMB)</td>
                                    <td className="border border-slate-300 px-2 py-1.5 text-center">胜诉状态</td>
                                  </tr>
                                  {[
                                    { id: '1', no: 'ENF-2026-01', name: selectedCaseForView?.trademarkName || '品牌商标', goods: '假冒电动牙刷及替换头 12,000 件', custom: '黄埔海关', value: '¥ 360,000.00', status: '没收销毁' },
                                    { id: '2', no: 'ENF-2026-02', name: selectedCaseForView?.trademarkName || '品牌商标', goods: '侵权包装盒及说明书 50,000 套', custom: '深圳皇岗海关', value: '¥ 150,000.00', status: '行政处罚' },
                                  ].map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-blue-50/50 border-b border-slate-200">
                                      <td className="border border-slate-300 text-center font-mono bg-slate-100 py-1.5">{idx + 2}</td>
                                      <td className="border border-slate-300 px-2 py-1.5 font-mono font-bold text-blue-700">{row.no}</td>
                                      <td className="border border-slate-300 px-2 py-1.5 font-medium">{row.name}</td>
                                      <td className="border border-slate-300 px-2 py-1.5 text-slate-700">{row.goods}</td>
                                      <td className="border border-slate-300 px-2 py-1.5 text-slate-600">{row.custom}</td>
                                      <td className="border border-slate-300 px-2 py-1.5 text-right font-mono font-bold text-slate-900">{row.value}</td>
                                      <td className="border border-slate-300 px-2 py-1.5 text-center">
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                                          {row.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  }

                  // 5. 演示文稿 (.ppt, .pptx)
                  if (isPpt) {
                    const slides = [
                      {
                        title: `《${selectedCaseForView?.trademarkName || '标的商标'}》全球商标保护与使用证据汇总汇报`,
                        sub: `关联案号: ${selectedCaseForView?.caseNo || 'SG-2026-0812'} | 汇报人: 集团品牌知产保护中心`,
                        tag: 'SLIDE 1 · 封面'
                      },
                      {
                        title: '一、商标布局与目标法域注册概况',
                        sub: `核定类别: 第 ${selectedCaseForView?.classes || '10'} 类 | 目标法域: ${selectedCaseForView?.jurisdiction || '新加坡/全球多国'}`,
                        tag: 'SLIDE 2 · 核心布局'
                      },
                      {
                        title: '二、商业使用证据链条梳理与审查合格度',
                        sub: '涵盖销售合同、海关报关单据、展会推广及线上电商平台销售流水',
                        tag: 'SLIDE 3 · 证据合规'
                      },
                      {
                        title: '三、市场维权打假成果与下一步品牌保护规划',
                        sub: '成功通过海关知识产权备案，打击侵权维权胜诉率达 95%+',
                        tag: 'SLIDE 4 · 维权规划'
                      }
                    ];

                    const currentSlide = slides[activeSlideIndex] || slides[0];

                    return (
                      <div className="w-full bg-slate-900 shadow-2xl border border-slate-800 rounded-xl overflow-hidden min-h-[720px] flex flex-col text-white">
                        <div className="bg-orange-700 text-white px-4 py-2.5 flex items-center justify-between border-b border-orange-800">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center font-black text-white text-[11px]">
                              P
                            </div>
                            <span>Microsoft PowerPoint Online - 演示文稿在线播放</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-950 text-orange-200 border border-orange-600 font-mono uppercase">
                              {ext}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-orange-100 font-mono">
                            <span>画面比例: 16:9 宽屏</span>
                            <span>|</span>
                            <span className="text-amber-300 font-bold">幻灯片放映模式</span>
                          </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                          <div className="w-48 bg-slate-950 border-r border-slate-800 p-3 space-y-3 shrink-0 overflow-auto">
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                              Slides 目录 ({slides.length})
                            </div>
                            {slides.map((s, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveSlideIndex(idx)}
                                className={`w-full p-2.5 rounded-lg text-left transition-all cursor-pointer border ${
                                  activeSlideIndex === idx
                                    ? 'bg-orange-600/20 border-orange-500 text-white shadow-md'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                                }`}
                              >
                                <div className="text-[10px] font-mono text-orange-400 font-bold mb-1">{s.tag}</div>
                                <div className="text-xs font-medium truncate">{s.title}</div>
                              </button>
                            ))}
                          </div>

                          <div className="flex-1 p-6 sm:p-10 bg-slate-950/80 flex flex-col items-center justify-center relative">
                            <div className="w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-orange-500/40 rounded-2xl p-8 sm:p-12 shadow-2xl flex flex-col justify-between min-h-[420px] relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

                              <div className="space-y-4 relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-mono font-bold">
                                  <span>{currentSlide.tag}</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                                  {currentSlide.title}
                                </h2>
                                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                                  {currentSlide.sub}
                                </p>
                              </div>

                              <div className="my-6 p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-around text-center text-xs">
                                <div>
                                  <div className="text-lg font-mono font-bold text-orange-400">100%</div>
                                  <div className="text-[11px] text-slate-400">证据审查合格</div>
                                </div>
                                <div className="h-8 w-px bg-slate-800"></div>
                                <div>
                                  <div className="text-lg font-mono font-bold text-emerald-400">合规备案</div>
                                  <div className="text-[11px] text-slate-400">海关知识产权网</div>
                                </div>
                                <div className="h-8 w-px bg-slate-800"></div>
                                <div>
                                  <div className="text-lg font-mono font-bold text-blue-400">{selectedCaseForView?.classes || '10类'}</div>
                                  <div className="text-[11px] text-slate-400">指定商品覆盖</div>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
                                <span>{selectedCaseForView?.applicant || '广州星际悦动股份有限公司'}</span>
                                <span>Page {activeSlideIndex + 1} of {slides.length}</span>
                              </div>
                            </div>

                            <div className="mt-6 flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-full border border-slate-800 text-xs font-mono shadow-lg">
                              <button
                                type="button"
                                onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                                disabled={activeSlideIndex === 0}
                                className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-200 cursor-pointer"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <span className="text-slate-300">
                                Slide <strong className="text-orange-400">{activeSlideIndex + 1}</strong> / {slides.length}
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                                disabled={activeSlideIndex === slides.length - 1}
                                className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-200 cursor-pointer"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 6. 压缩包 (.zip, .rar, .7z, .tar.gz)
                  if (isArchive) {
                    const archiveFiles = [
                      { name: `1_官方送达文书与注册证/CNIPA_商标受理通知书.pdf`, size: '1.2 MB', type: 'PDF', date: '2026-08-18' },
                      { name: `1_官方送达文书与注册证/官方电子规费收据.pdf`, size: '450 KB', type: 'PDF', date: '2026-08-19' },
                      { name: `2_商业使用证据卷宗/2026年度销售合同及发票台账.xlsx`, size: '850 KB', type: 'XLSX', date: '2026-08-20' },
                      { name: `2_商业使用证据卷宗/品牌独家代理授权合同.docx`, size: '2.1 MB', type: 'DOCX', date: '2026-08-12' },
                      { name: `3_展会及广告宣传截图/展会现场使用商标图样01.png`, size: '3.8 MB', type: 'PNG', date: '2026-08-05' },
                      { name: `3_展会及广告宣传截图/商标宣讲与维权PPT.pptx`, size: '12.4 MB', type: 'PPTX', date: '2026-08-22' },
                    ];

                    return (
                      <div className="w-full bg-slate-900 shadow-2xl border border-slate-800 rounded-xl overflow-hidden min-h-[720px] flex flex-col text-white">
                        <div className="bg-indigo-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-indigo-800">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center font-black text-white text-[11px]">
                              Z
                            </div>
                            <span>Zip & Archive Extractor - 在线解压与压缩包文件树预览</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-200 border border-indigo-700 font-mono uppercase">
                              {ext}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-indigo-200 font-mono">
                            <span>压缩率: 68%</span>
                            <span>|</span>
                            <span>完整性校验: <strong className="text-emerald-400">通过 (MD5)</strong></span>
                          </div>
                        </div>

                        <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => showToast(`已调起在线全量解压：${previewingDoc.title}`)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md cursor-pointer transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>一键解压并提取全部文件 ({archiveFiles.length})</span>
                            </button>
                          </div>
                          <div className="text-slate-400 font-mono text-[11px]">
                            压缩包文号：{previewingDoc.docNumber} | 总大小：{previewingDoc.size}
                          </div>
                        </div>

                        <div className="flex-1 p-4 bg-slate-950/90 overflow-auto">
                          {archiveSubFilePreview ? (
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded font-mono">
                                    {archiveSubFilePreview.type}
                                  </span>
                                  <span className="text-xs font-bold text-white">{archiveSubFilePreview.title}</span>
                                  <span className="text-xs text-slate-400 font-mono">({archiveSubFilePreview.size})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setArchiveSubFilePreview(null)}
                                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                                >
                                  返回压缩包文件列表
                                </button>
                              </div>
                              <div className="p-6 bg-slate-950 rounded-lg border border-slate-800/80 text-xs text-slate-300 space-y-2 leading-relaxed">
                                <p className="font-bold text-emerald-400">✓ 已成功在线解压此内部附件文件：</p>
                                <p>文件名：<span className="text-white font-mono">{archiveSubFilePreview.title}</span></p>
                                <p>格式：<span className="text-indigo-300 font-mono font-bold">{archiveSubFilePreview.type}</span> | 提取校验：完整无损坏</p>
                                <p className="text-slate-400 pt-2 border-t border-slate-800">
                                  可直接点击顶部的【下载原件】按钮导出该压缩包的全部原生解压文件。
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                                    <th className="py-2.5 px-3">文件路径及名称</th>
                                    <th className="py-2.5 px-3">类型</th>
                                    <th className="py-2.5 px-3">压缩前大小</th>
                                    <th className="py-2.5 px-3">修改日期</th>
                                    <th className="py-2.5 px-3 text-center">操作</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-xs">
                                  {archiveFiles.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/60 transition-colors">
                                      <td className="py-2.5 px-3 font-sans text-slate-200">
                                        <div className="flex items-center gap-2">
                                          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                                          <span>{item.name}</span>
                                        </div>
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-indigo-300 border border-slate-700 font-bold">
                                          {item.type}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3 text-slate-400">{item.size}</td>
                                      <td className="py-2.5 px-3 text-slate-400">{item.date}</td>
                                      <td className="py-2.5 px-3 text-center font-sans">
                                        <button
                                          type="button"
                                          onClick={() => setArchiveSubFilePreview({
                                            title: item.name,
                                            type: item.type,
                                            size: item.size
                                          })}
                                          className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/60 text-indigo-300 hover:text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
                                        >
                                          提取预览
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // 7. 默认通用预览
                  return (
                    <div className="w-full bg-white shadow-2xl rounded-lg overflow-hidden border border-slate-300 min-h-[780px] flex items-center justify-center p-2">
                      <iframe 
                        src={previewingDoc.fileUrl} 
                        className="w-full h-[780px] border-0 rounded bg-white"
                        title={previewingDoc.title}
                      />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500 font-mono">
                文件大小：{previewingDoc.size} | 格式：{previewingDoc.type}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewingDoc(null)}
                  className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-200/70 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  关闭预览
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 卷宗文件删除二次确认 Modal (居中显示) */}
      {deletingDoc && selectedCaseForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              {/* Warning Blue Circle Icon */}
              <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center mx-auto mb-3 text-blue-600">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">确认删除该卷宗文件？</h3>
              <p className="text-xs text-slate-500 mb-4">
                删除后，该文件将从案件【{selectedCaseForView.caseNo}】的文件列表中移除，此操作不可撤销。
              </p>

              {/* File Detail Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left text-xs space-y-1.5 mb-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">文件名称：</span>
                  <span className="font-bold text-slate-900 text-right truncate" title={deletingDoc.title}>{deletingDoc.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">文件类型：</span>
                  <div>{renderDocCategoryBadge(deletingDoc.category)}</div>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500 font-sans text-xs">文件编号：</span>
                  <span className="text-slate-700">{deletingDoc.docNumber}</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500 font-sans text-xs">文件大小 / 格式：</span>
                  <span className="text-slate-700">{deletingDoc.size} ({deletingDoc.type})</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingDoc(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteDoc}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>确认删除</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 维权单据详情 Modal */}
      {selectedEnforcementForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <div>
                  <div className="text-xs font-mono text-slate-300">维权管理单据详情</div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedEnforcementForDetail.caseNo}</span>
                    {renderEnforcementTypeBadge(selectedEnforcementForDetail.type)}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnforcementForDetail(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">维权单据类型</span>
                  <div className="mt-1">{renderEnforcementTypeBadge(selectedEnforcementForDetail.type)}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">办案负责人</span>
                  <span className="font-semibold text-slate-800 mt-1 block">{selectedEnforcementForDetail.handler}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">承办律所 / 代理</span>
                  <span className="font-semibold text-slate-800 mt-1 block">{selectedEnforcementForDetail.lawFirm || '内部法务团队'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">维权预算</span>
                  <span className="font-mono font-bold text-emerald-600 mt-1 block">¥{selectedEnforcementForDetail.budget.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">答辩/举证截止日</span>
                  <span className="font-mono font-semibold text-rose-600 mt-1 block">{selectedEnforcementForDetail.filingDeadline}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">审理进度</span>
                  <span className="font-semibold text-blue-700 mt-1 block">{selectedEnforcementForDetail.progressPercent}% ({selectedEnforcementForDetail.status === 'WIN' ? '维权胜诉' : '进行中'})</span>
                </div>
              </div>

              <div className="space-y-2 bg-rose-50/50 p-4 rounded-xl border border-rose-200/80">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>涉案与争端标的对比</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[11px] block">我方权属商标（防护标的）：</span>
                    <div className="font-bold text-blue-700 text-sm">{selectedEnforcementForDetail.ourTrademark}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-1">
                    <span className="text-slate-400 text-[11px] block">涉案/对方侵权标的：</span>
                    <div className="font-bold text-rose-700 text-sm">{selectedEnforcementForDetail.targetTrademark}</div>
                    <div className="text-[11px] text-slate-500">
                      申请/注册号：<span className="font-mono">{selectedEnforcementForDetail.targetRegNo}</span> | 对方主体：{selectedEnforcementForDetail.targetApplicant}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 border-l-2 border-slate-800 pl-2">维权事实要点与公证依据</h4>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedEnforcementForDetail.groundsSummary}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">提示：该单据已与当前商标案卷打通绑定，支持在【维权与异议管理】中心全局协同追踪。</span>
              <button
                type="button"
                onClick={() => setSelectedEnforcementForDetail(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg cursor-pointer transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 使用证据文件上传 Modal */}
      {isUploadEvidenceModalOpen && selectedCaseForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">上传商标商业使用证据文件</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadEvidenceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmUploadEvidence} className="p-5 space-y-4">
              {/* File Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  选择证据源文件 <span className="text-rose-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center bg-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.zip,*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setSelectedUploadEvFile(file);
                        if (!uploadEvTitle) {
                          setUploadEvTitle(file.name);
                        }
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Upload className="w-6 h-6 text-blue-600" />
                    <p className="text-xs font-medium text-slate-800">
                      {selectedUploadEvFile ? selectedUploadEvFile.name : '点击或将证据文件拖拽至此处上传'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {selectedUploadEvFile ? `文件大小：${(selectedUploadEvFile.size / (1024 * 1024)).toFixed(2)} MB` : '支持 PDF, PNG, JPG, DOCX, XLSX, ZIP 等常规格式'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Title & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">证据说明名称</label>
                  <input
                    type="text"
                    value={uploadEvTitle}
                    onChange={(e) => setUploadEvTitle(e.target.value)}
                    placeholder="如：2026年Q2 东南亚Shopee/Lazada订单与关单"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">证据类型</label>
                  <select
                    value={uploadEvType}
                    onChange={(e) => setUploadEvType(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs bg-white text-slate-800 font-medium"
                  >
                    <option value="销售合同/报关单">销售合同/报关单</option>
                    <option value="产品包装图样">产品包装图样</option>
                    <option value="展会/广告宣传">展会/广告宣传</option>
                    <option value="发票/收据凭证">发票/收据凭证</option>
                    <option value="电商列表/网页截图">电商列表/网页截图</option>
                    <option value="其他使用证据">其他使用证据</option>
                  </select>
                </div>
              </div>

              {/* Date & Uploader */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">归档/发生日期</label>
                  <input
                    type="date"
                    value={uploadEvDate}
                    onChange={(e) => setUploadEvDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">上传/归档人</label>
                  <input
                    type="text"
                    value={uploadEvUploader}
                    onChange={(e) => setUploadEvUploader(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">备注与核验批注</label>
                <input
                  type="text"
                  value={uploadEvRemarks}
                  onChange={(e) => setUploadEvRemarks(e.target.value)}
                  placeholder="如：已核验海关出口报关单与商业发票原件"
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadEvidenceModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>确认上传证据</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 证据文件删除二次确认 Modal */}
      {deletingEvidence && selectedCaseForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center mx-auto mb-3 text-blue-600">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">确认删除该使用证据？</h3>
              <p className="text-xs text-slate-500 mb-4">
                删除后，该证据文件将从案件【{selectedCaseForView.caseNo}】的商业使用证据归档库中移除，此操作不可撤销。
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left text-xs space-y-1.5 mb-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">证据名称：</span>
                  <span className="font-bold text-slate-900 text-right truncate" title={deletingEvidence.title}>{deletingEvidence.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">证据类型：</span>
                  <span className="font-medium text-blue-700">{deletingEvidence.evidenceType}</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500 font-sans text-xs">归档日期 / 大小：</span>
                  <span className="text-slate-700">{deletingEvidence.uploadDate} ({deletingEvidence.fileSize})</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingEvidence(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteEvidence}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>确认删除</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 申请信息子项（被异议人/优先权/代理人/负责人）删除二次确认 Modal */}
      {deletingApplicantSubItem && selectedCaseForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center mx-auto mb-3 text-blue-600">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                确认删除该{deletingApplicantSubItem.title}？
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {deletingApplicantSubItem.description}
              </p>

              {/* Detail Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left text-xs space-y-1.5 mb-5">
                {deletingApplicantSubItem.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 shrink-0">{detail.label}：</span>
                    <span className="font-medium text-slate-900 text-right truncate" title={detail.value}>{detail.value}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingApplicantSubItem(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteApplicantSubItem}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>确认删除</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </>
      </>
    );
  };

  if (onlyModal) {
    if (!selectedCaseForView && !selectedCaseForMaintain && !selectedProposalForDetail && !viewingOperationLog && !handlingTaskModalOpen && !isApplicantHistoryModalOpen && !isUploadDocModalOpen && !previewingDoc && !deletingDoc && !selectedEnforcementForDetail && !isUploadEvidenceModalOpen && !deletingEvidence && !deletingApplicantSubItem) {
      return null;
    }
    return renderModals();
  }

  return (
    <div className="space-y-3.5 antialiased text-slate-800 pb-12">
      {/* Toast 提示 */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] max-w-md px-6 py-4 bg-slate-900/95 backdrop-blur-md text-white text-sm font-semibold rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-slate-700/80 pointer-events-none text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. 搜索区 */}
      <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-3.5">
          {/* 1. 案件编号 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">案件编号</label>
            <input 
              type="text" 
              value={filterCaseNo}
              onChange={(e) => setFilterCaseNo(e.target.value)}
              placeholder="支持批量搜索(空格/逗号/换行分隔)" 
              className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
            />
          </div>

          {/* 2. 建案编码 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">建案编码</label>
            <input 
              type="text" 
              value={filterProposalNo}
              onChange={(e) => setFilterProposalNo(e.target.value)}
              placeholder="支持批量搜索(空格/逗号/换行分隔)" 
              className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
            />
          </div>

          {/* 3. 商标名称 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">商标名称</label>
            <input 
              type="text" 
              value={filterTrademarkName}
              onChange={(e) => setFilterTrademarkName(e.target.value)}
              placeholder="支持模糊搜索商标名称" 
              className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
            />
          </div>

          {/* 4. 商标形式 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">商标形式</label>
            <select
              value={filterForm}
              onChange={(e) => setFilterForm(e.target.value)}
              className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
            >
              <option value="ALL">全部商标形式</option>
              {allTrademarkForms.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* 5. 所属品牌 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">所属品牌</label>
            <div className="relative">
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
              >
                <option value="ALL">全部品牌 (共{brandOptions.length}个)</option>
                {brandOptions.map(b => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 6. 尼斯分类 (与建案申请页面搜索区的下拉选项和样式一致) */}
          <SearchableMultiSelect
            label="尼斯分类"
            placeholder="显示45类尼斯分类(可多选)"
            selectedValues={filterSelectedClasses}
            onChange={setFilterSelectedClasses}
            options={niceClassOptions}
            searchPlaceholder="搜索类别代码或名称..."
          />

          {/* 7. 申请地区 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">申请地区</label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
            >
              <option value="ALL">全部申请地区</option>
              {allRegionOptions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* 第4列: 折叠状态(默认2行)放操作按钮组；展开状态下放 8. 申请国家 */}
          {!isExpanded ? (
            <div className="flex items-end justify-end gap-2 h-full pb-0.5">
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
                className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all flex items-center gap-1.5 shadow-xs hover:shadow-blue-500/20 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>查询</span>
              </button>
            </div>
          ) : (
            /* 8. 申请国家 */
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">申请国家</label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
              >
                <option value="ALL">全部申请国家</option>
                {allCountryOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* 展开状态下的后 4 个字段 (第9~12个字段) */}
          {isExpanded && (
            <>
              {/* 9. 重要等级 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">重要等级</label>
                <select
                  value={filterImportance}
                  onChange={(e) => setFilterImportance(e.target.value)}
                  className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
                >
                  <option value="ALL">全部重要等级</option>
                  <option value="一级(核心战略)">一级(核心战略)</option>
                  <option value="二级(主打品类)">二级(主打品类)</option>
                  <option value="三级(防御布局)">三级(防御布局)</option>
                </select>
              </div>

              {/* 10. 官方申请号 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">官方申请号</label>
                <input
                  type="text"
                  value={filterAppNo}
                  onChange={(e) => setFilterAppNo(e.target.value)}
                  placeholder="支持批量编号(空格/逗号/换行)"
                  className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
                />
              </div>

              {/* 11. 官方申请日 (时间选择器范围) */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">官方申请日</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={filterApplyStartDate}
                    onChange={(e) => setFilterApplyStartDate(e.target.value)}
                    className="w-full text-xs font-normal text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="date"
                    value={filterApplyEndDate}
                    onChange={(e) => setFilterApplyEndDate(e.target.value)}
                    className="w-full text-xs font-normal text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* 12. 代理机构 (多选带关键词过滤) */}
              <div className="space-y-1 relative">
                <label className="block text-xs font-medium text-slate-600">代理机构</label>
                <button
                  type="button"
                  onClick={() => setIsAgencyDropdownOpen(!isAgencyDropdownOpen)}
                  className="w-full text-xs font-normal text-left text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 transition-all shadow-2xs flex items-center justify-between"
                >
                  <span className="truncate">
                    {filterSelectedAgencies.length === 0 
                      ? '全部承办代理机构' 
                      : `已选 ${filterSelectedAgencies.length} 家 (${filterSelectedAgencies.join(', ')})`}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                </button>

                {/* 代理机构多选弹层 */}
                {isAgencyDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 z-30 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    <input
                      type="text"
                      value={agencySearchKeywordFilter}
                      onChange={(e) => setAgencySearchKeywordFilter(e.target.value)}
                      placeholder="搜索代理机构关键词..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 focus:outline-none focus:border-blue-500"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                      {allAgencyOptions
                        .filter(agency => !agencySearchKeywordFilter || agency.toLowerCase().includes(agencySearchKeywordFilter.toLowerCase()))
                        .map(agency => (
                          <label key={agency} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer text-slate-700 text-xs">
                            <input
                              type="checkbox"
                              checked={filterSelectedAgencies.includes(agency)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilterSelectedAgencies([...filterSelectedAgencies, agency]);
                                } else {
                                  setFilterSelectedAgencies(filterSelectedAgencies.filter(a => a !== agency));
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="truncate" title={agency}>{agency}</span>
                          </label>
                        ))}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setFilterSelectedAgencies([])}
                        className="text-slate-500 hover:text-slate-800"
                      >
                        清空选择
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAgencyDropdownOpen(false)}
                        className="text-blue-600 font-medium hover:text-blue-700"
                      >
                        确定
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 展开状态下的最右侧操作按钮整行 */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-2 pt-2">
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
                  className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all flex items-center gap-1.5 shadow-xs hover:shadow-blue-500/20 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>查询</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. 列表区 (List Area) - 包含左侧状态 Tab 栏、右侧功能按键以及数据表格 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-0">
        
        {/* 列表头部工具栏：左侧状态选项卡 + 右侧操作功能按键 */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white">
          {/* 左侧状态过滤 Tabs */}
          <div className="flex items-center gap-5 sm:gap-6 overflow-x-auto no-scrollbar pt-1">
            {[
              { key: "ALL", label: "全部状态", count: counts.total },
              { key: "PENDING_APPLY", label: "待申请", count: counts.pendingApply },
              { key: "APPLYING", label: "申请中", count: counts.applying },
              { key: "EXAMINING", label: "审查中", count: counts.examining },
              { key: "REGISTERED", label: "已注册", count: counts.registered },
              { key: "PENDING_REPLY", label: "待答复", count: counts.pendingReply },
              { key: "INVALID", label: "已失效", count: counts.invalid },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key as any);
                  setCurrentPage(1);
                }}
                className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                  activeTab === tab.key
                    ? "text-blue-600 font-semibold"
                    : "text-slate-700 hover:text-blue-600 font-normal"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-xs ${
                    activeTab === tab.key ? "text-blue-600 font-semibold" : "text-slate-400 font-normal"
                  }`}
                >
                  {tab.count}
                </span>
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* 右侧批量及导出按钮 */}
          <div className="flex items-center gap-2 self-end xl:self-auto shrink-0">
            {/* 视图模式切换按键 (与建案申请模块一致) */}
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

            <button
              type="button"
              onClick={() => setIsBatchUpdateModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50/80 border border-slate-300 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>批量更新字段</span>
            </button>

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
                <span>导出 CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. 案件管理数据表格 */}
        <div className="overflow-x-auto">
          {viewMode === 'COMPOUND' ? (
            /* ======================================================== */
            /* 1. 一屏智能合并视图 */
            /* ======================================================== */
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500">
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
                  <th className="py-3 px-3.5 text-center w-12">序号</th>
                  <th className="py-3 px-3.5">案件编号 / 建案编码</th>
                  <th className="py-3 px-3.5">商标名称 / 形式</th>
                  <th className="py-3 px-3.5">品牌 / 尼斯分类</th>
                  <th className="py-3 px-3.5">申请地区 / 国家</th>
                  <th className="py-3 px-3.5">重要等级 / 状态</th>
                  <th className="py-3 px-3.5">官方申请号 / 申请日</th>
                  <th className="py-3 px-3.5">代理机构</th>
                  <th className="py-3 px-3.5 text-right pr-5">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedCases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <p className="text-sm font-medium">未找到符合条件的商标案件数据</p>
                      <p className="text-xs mt-1 text-slate-400">请调整搜索关键词或分类筛选条件后重试</p>
                    </td>
                  </tr>
                ) : (
                  paginatedCases.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                      {isExportMode && (
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedCases.includes(c.id)}
                            onChange={() => handleToggleSelectOneCase(c.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-3 px-3.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCaseForView(c)}
                          className="font-mono font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left cursor-pointer"
                          title="点击查看案件详情"
                        >
                          {c.caseNo}
                        </button>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {c.proposalNo || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900 block truncate max-w-[180px]">
                          {c.trademarkName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {c.trademarkForm || "文字商标"}
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-slate-800">{c.brand}</div>
                        <div className="text-[11px] text-blue-600 font-medium">
                          {c.classes}
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-slate-800">{c.region || getRegionByCountry(c.country || c.jurisdiction || "中国")}</div>
                        <div className="text-[11px] text-slate-500">{c.country || c.jurisdiction || "中国"}</div>
                      </td>
                      <td className="py-3 px-3.5 space-y-1">
                        <div>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            c.importanceLevel === "核心战略" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                          }`}>
                            {c.importanceLevel || "一级"}
                          </span>
                        </div>
                        <div>{renderStatusBadge(c.status)}</div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-mono text-slate-800">{c.applicationNo || c.appNo || "-"}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{c.applyDate || "-"}</div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="text-slate-700 truncate max-w-[140px]" title={c.agencyName || c.lawFirm}>
                          {c.agencyName || c.lawFirm || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-right pr-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCaseForView(c)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            查看
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenMaintainGoods(c)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            维护档案
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* ======================================================== */
            /* 2. 传统平铺单列视图 (逐列独立展示) */
            /* ======================================================== */
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500">
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
                  <th className="py-3 px-3.5 text-center w-12">序号</th>
                  <th className="py-3 px-3.5">案件编号</th>
                  <th className="py-3 px-3.5">建案编码</th>
                  <th className="py-3 px-3.5">商标名称</th>
                  <th className="py-3 px-3.5">商标形式</th>
                  <th className="py-3 px-3.5">所属品牌</th>
                  <th className="py-3 px-3.5">尼斯分类</th>
                  <th className="py-3 px-3.5">申请地区</th>
                  <th className="py-3 px-3.5">申请国家</th>
                  <th className="py-3 px-3.5">重要等级</th>
                  <th className="py-3 px-3.5">案件状态</th>
                  <th className="py-3 px-3.5">官方申请号</th>
                  <th className="py-3 px-3.5">官方申请日</th>
                  <th className="py-3 px-3.5">代理机构</th>
                  <th className="py-3 px-3.5 text-right pr-5 sticky right-0 z-10 bg-slate-50/95 border-l border-slate-200/80 shadow-2xs">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedCases.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="py-12 text-center text-slate-400">
                      <p className="text-sm font-medium">未找到符合条件的商标案件数据</p>
                      <p className="text-xs mt-1 text-slate-400">请调整搜索关键词或分类筛选条件后重试</p>
                    </td>
                  </tr>
                ) : (
                  paginatedCases.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                      {isExportMode && (
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedCases.includes(c.id)}
                            onChange={() => handleToggleSelectOneCase(c.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-semibold">
                        <button
                          type="button"
                          onClick={() => setSelectedCaseForView(c)}
                          className="font-mono font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left cursor-pointer"
                          title="点击查看案件详情"
                        >
                          {c.caseNo}
                        </button>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-500 text-[11px]">
                        {c.proposalNo || "-"}
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        {c.trademarkName}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {c.trademarkForm || "文字商标"}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-medium text-slate-800">
                        {c.brand}
                      </td>
                      <td className="py-3 px-3.5 text-blue-600 font-medium">
                        {c.classes}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 font-medium">
                        {c.region || getRegionByCountry(c.country || c.jurisdiction || "中国")}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">
                        {c.country || c.jurisdiction || "中国"}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          c.importanceLevel === "核心战略" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          {c.importanceLevel || "一级"}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        {renderStatusBadge(c.status)}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-800">
                        {c.applicationNo || c.appNo || "-"}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-500 text-[11px]">
                        {c.applyDate || "-"}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700">
                        {c.agencyName || c.lawFirm || "-"}
                      </td>
                      <td className="py-3 px-3.5 text-right pr-5 sticky right-0 z-10 bg-white group-hover:bg-blue-50/50 border-l border-slate-100 shadow-2xs">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCaseForView(c)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            查看
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenMaintainGoods(c)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            维护档案
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 分页控制栏 */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>共 <strong className="text-slate-900 font-mono">{filteredCases.length}</strong> 条记录</span>
            <span>·</span>
            <span>每页显示</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              <option value={10}>10 条</option>
              <option value={20}>20 条</option>
              <option value={50}>50 条</option>
              <option value={100}>100 条</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              上一页
            </button>

            <span className="px-2 font-mono font-medium text-slate-800">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* Modal 弹窗逻辑 */}
      {!onlyModal && renderModals()}
    </div>
  );
}