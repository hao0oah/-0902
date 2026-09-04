import React, { useState, useMemo, useEffect } from 'react';
import { Pagination } from './Pagination';
import { 
  Search, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  SlidersHorizontal, 
  Plus, 
  X, 
  Check, 
  AlertCircle, 
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
  Layers,
  FileCheck2,
  Tag,
  Calendar,
  User,
  Filter,
  CheckSquare,
  HelpCircle,
  Briefcase,
  Lock,
  Palette,
  Copy
} from 'lucide-react';
import { ApplicationDraft, TrademarkApplicationProposal, BrandTreeNode, ApprovalRecordItem } from '../types';
import { flattenBrandTree } from '../data/brandTreeData';
import { 
  ALL_REGION_NAMES, 
  getRegionByCountry, 
  getCountriesByRegion, 
  getAllMappedCountries,
  subscribeMappingChanges 
} from '../lib/mappingStore';
import { 
  getNiceClassificationMappings, 
  subscribeNiceClassificationChanges, 
  NICE_CLASSES_META, 
  NiceClassificationItem, 
  NiceClassSummary 
} from '../lib/niceClassificationStore';

// 自动为单据构建按顺序排列的完整审批履历（保证每一个参与审批的人都被清晰展现）
export function getProposalApprovalRecords(proposal: TrademarkApplicationProposal): ApprovalRecordItem[] {
  if (proposal.approvalRecords && proposal.approvalRecords.length > 0) {
    return proposal.approvalRecords;
  }

  if (proposal.status === 'UNSUBMITTED') {
    return [];
  }

  const baseDate = proposal.applyTime.split(' ')[0] || '2026-08-14';
  const baseTime = proposal.applyTime.split(' ')[1] || '09:30';

  const records: ApprovalRecordItem[] = [
    {
      id: `${proposal.id}-rec-1`,
      stepNumber: 1,
      nodeName: '提交建案需求',
      approverName: proposal.applicant || '陆燕丽',
      approverRole: '需求申请人',
      approverDept: proposal.department || '研发中心',
      action: 'SUBMITTED',
      actionText: '已提交',
      opinion: '发起商标需求及建案立案排查申请。',
      operateTime: proposal.applyTime,
      isCurrent: false,
    }
  ];

  // 节点 2: 需求部门主管复核
  const deptApprover = proposal.applicant === '唐宁' ? '陈旻' : '唐宁';
  const isDeptCurrent = proposal.status === 'PROCESSING' && (
    !proposal.currentNode || 
    proposal.currentNode.includes('部门主管') || 
    proposal.currentNode.includes('需求')
  );

  records.push({
    id: `${proposal.id}-rec-2`,
    stepNumber: 2,
    nodeName: '需求部门主管复核',
    approverName: deptApprover,
    approverRole: '需求部门主管',
    approverDept: proposal.department || '创新业务部',
    action: isDeptCurrent ? 'PROCESSING' : 'APPROVED',
    actionText: isDeptCurrent ? '处理中' : '审核通过',
    opinion: isDeptCurrent 
      ? `需求部门主管（${deptApprover}）正在复核业务规划与商标拟用排期...`
      : '情况属实，符合下半年产品线上市路线图，同意建案并送知产法务排查障碍。',
    operateTime: isDeptCurrent ? undefined : `${baseDate} ${baseTime.startsWith('09') ? '10:15:20' : '13:30:00'}`,
    dwellTime: isDeptCurrent ? (proposal.dwellTime || '2小时') : '25分钟',
    isCurrent: isDeptCurrent,
  });

  if (isDeptCurrent) return records;

  // 节点 3: 知产法务查重评估
  const legalApprover = proposal.currentHandler?.includes('法务') 
    ? proposal.currentHandler.split(' ')[0] 
    : '林悦';
  const isLegalCurrent = proposal.status === 'PROCESSING' && (
    proposal.currentNode?.includes('法务') || 
    proposal.currentNode?.includes('评估') || 
    proposal.currentNode?.includes('查重')
  );

  records.push({
    id: `${proposal.id}-rec-3`,
    stepNumber: 3,
    nodeName: proposal.currentNode && isLegalCurrent ? proposal.currentNode : '知产法务查重评估',
    approverName: legalApprover,
    approverRole: '知产法务主管',
    approverDept: '品牌法务中心',
    action: isLegalCurrent ? 'PROCESSING' : 'APPROVED',
    actionText: isLegalCurrent ? '处理中' : '审核通过',
    opinion: isLegalCurrent
      ? `知产法务主管（${legalApprover}）正在开展全类目商标检索与在先冲突风险评估...`
      : '已完成官方与数据库多维度检索，未在指定核心类别发现在先相同或高度近似障碍商标，准予建案。',
    operateTime: isLegalCurrent ? undefined : `${baseDate} ${baseTime.startsWith('09') ? '14:20:10' : '15:45:00'}`,
    dwellTime: isLegalCurrent ? (proposal.dwellTime || '5小时') : '1小时20分',
    isCurrent: isLegalCurrent,
  });

  if (isLegalCurrent) return records;

  // 节点 4: 品牌知产总监终审
  const directorApprover = '张伟';
  const isDirectorCurrent = proposal.status === 'PROCESSING' || proposal.status === 'PENDING_CONFIRM' || proposal.status === 'PENDING_PROPOSAL' || proposal.status === 'PENDING_AGENCY';

  records.push({
    id: `${proposal.id}-rec-4`,
    stepNumber: 4,
    nodeName: '品牌知产总监终审',
    approverName: directorApprover,
    approverRole: '知产总监',
    approverDept: '集团法务中心',
    action: isDirectorCurrent ? 'PROCESSING' : (proposal.status === 'TERMINATED' ? 'REJECTED' : 'APPROVED'),
    actionText: isDirectorCurrent ? '处理中' : (proposal.status === 'TERMINATED' ? '审核驳回' : '审核通过'),
    opinion: isDirectorCurrent
      ? `等待品牌知产总监（${directorApprover}）签署最终批复...`
      : (proposal.status === 'TERMINATED'
          ? '因战略考量及在先近似风险阻碍，经总监批示终止该建案需求。'
          : '批准建案注册申请，同意委外至合作代理机构提交申报。'),
    operateTime: isDirectorCurrent ? undefined : `${baseDate} 16:50:30`,
    dwellTime: isDirectorCurrent ? (proposal.dwellTime || '1天2小时') : '35分钟',
    isCurrent: isDirectorCurrent,
  });

  if (isDirectorCurrent || proposal.status === 'TERMINATED') return records;

  // 节点 5: 代理机构委外接单 (for ACCEPTED)
  if (proposal.status === 'ACCEPTED') {
    const agency = proposal.agencyName || '北京市柳沈律师事务所';
    records.push({
      id: `${proposal.id}-rec-5`,
      stepNumber: 5,
      nodeName: '代理机构委外接单',
      approverName: agency,
      approverRole: '合作代理机构',
      approverDept: '知识产权代理部',
      action: 'ACCEPTED',
      actionText: '已接单归档',
      opinion: '代理机构已完成委托接收与材料预审核，并生成案件案号建立档案。',
      operateTime: `${baseDate} 17:40:15`,
      dwellTime: '15分钟',
      isCurrent: false,
    });
  }

  return records;
}

// 45类尼斯分类尼斯标准全库
export const NICE_CLASSES_45 = [
  { code: '第01类', num: '01', name: '化学原料', desc: '工业、科学、农林用化学品，未加工塑料，灭火剂等' },
  { code: '第02类', num: '02', name: '颜料油漆', desc: '颜料、油漆、清漆、防腐蚀剂、染料、印刷油墨等' },
  { code: '第03类', num: '03', name: '日化洗护', desc: '洗发水、牙膏、美白牙贴、洗面奶、清洁制剂等' },
  { code: '第04类', num: '04', name: '燃料油脂', desc: '工业用油、润滑油脂、蜡烛、燃料、照明用蜡等' },
  { code: '第05类', num: '05', name: '医药卫生', desc: '药品、医用漱口水、消毒剂、贴剂、卫生用品等' },
  { code: '第06类', num: '06', name: '金属材料', desc: '普通金属及其合金、金属建筑材料、金属锁具、管道等' },
  { code: '第07类', num: '07', name: '机械设备', desc: '马达、发电机、电动工具、包装机、马达传动装置等' },
  { code: '第08类', num: '08', name: '手工器械', desc: '手动作业工具、刀剪、餐具（刀叉匙）、剃须刀等' },
  { code: '第09类', num: '09', name: '电子软件', desc: '智能芯片、计算机软件、电子设备、传感器、智能App等' },
  { code: '第10类', num: '10', name: '医疗器械', desc: '脉冲冲牙器、牙科仪器、美肤仪、医疗诊断设备等' },
  { code: '第11类', num: '11', name: '灯具空调', desc: '照明设备、紫外线消毒灯、加热器、烘干设备等' },
  { code: '第12类', num: '12', name: '运输工具', desc: '运载工具、陆海空行走工具、汽车配件等' },
  { code: '第13类', num: '13', name: '军火烟火', desc: '火器、弹药及射弹、烟花爆竹等' },
  { code: '第14类', num: '14', name: '珠宝钟表', desc: '贵重金属及其合金、珠宝首饰、宝石、钟表等' },
  { code: '第15类', num: '15', name: '乐器', desc: '乐器、乐器架、指挥棒、音乐盒等' },
  { code: '第16类', num: '16', name: '办公纸具', desc: '纸和纸板、印刷品、办公用品、包装用纸盒、画笔等' },
  { code: '第17类', num: '17', name: '橡胶塑料', desc: '橡胶、树胶、绝缘材料、软管等' },
  { code: '第18类', num: '18', name: '皮革皮具', desc: '皮革及人造皮革、手提包、皮箱、收纳包、雨伞等' },
  { code: '第19类', num: '19', name: '建筑材料', desc: '非金属建筑材料、硬质管、沥青、石材等' },
  { code: '第20类', num: '20', name: '家具容器', desc: '家具、镜子、画框、非金属容器、塑料竹木制品等' },
  { code: '第21类', num: '21', name: '厨房刷具', desc: '电动牙刷、牙刷头、冲牙器、家用和厨房用器具等' },
  { code: '第22类', num: '22', name: '缆绳篷布', desc: '绳索、缆绳、网、帐篷、遮阳篷、填塞材料等' },
  { code: '第23类', num: '23', name: '纺织纱线', desc: '纺织用纱和线' },
  { code: '第24类', num: '24', name: '织物被褥', desc: '织物、床上用品、毛巾、桌布、窗帘等' },
  { code: '第25类', num: '25', name: '服装鞋帽', desc: '服装、鞋、帽、袜、手套、领带等' },
  { code: '第26类', num: '26', name: '花边纽扣', desc: '花边、饰带、纽扣、拉链、人造花等' },
  { code: '第27类', num: '27', name: '地毯席垫', desc: '地毯、垫席、防滑垫、墙纸等' },
  { code: '第28类', num: '28', name: '玩具体育', desc: '游戏器具、玩具、体育和运动用品、健身器材等' },
  { code: '第29类', num: '29', name: '食品肉蛋', desc: '肉、鱼、家禽、浓缩肉汁、食用油、罐头、干果等' },
  { code: '第30类', num: '30', name: '方便食品', desc: '咖啡、茶、口香糖、压片糖果、调味品等' },
  { code: '第31类', num: '31', name: '农林生鲜', desc: '未加工的农业产品、生鲜水果蔬菜、花卉、种子等' },
  { code: '第32类', num: '32', name: '啤酒饮料', desc: '啤酒、矿泉水、果汁、气泡水、无酒精饮料等' },
  { code: '第33类', num: '33', name: '含酒精饮', desc: '含酒精饮料（啤酒除外）、白酒、葡萄酒、洋酒等' },
  { code: '第34类', num: '34', name: '烟草烟具', desc: '烟草、打火机、烟盒、电子烟等' },
  { code: '第35类', num: '35', name: '广告销售', desc: '广告、商业经营、商业管理、电子商务、市场营销等' },
  { code: '第36类', num: '36', name: '金融保险', desc: '保险、金融事务、货币事务、不动产事务等' },
  { code: '第37类', num: '37', name: '建筑修理', desc: '房屋建筑、修理、安装服务、设备维修保养等' },
  { code: '第38类', num: '38', name: '电信通讯', desc: '电信服务、网络通讯、信息传输等' },
  { code: '第39类', num: '39', name: '运输贮藏', desc: '运输、商品包装和贮藏、物流配送等' },
  { code: '第40类', num: '40', name: '材料处理', desc: '材料处理、定制加工、印刷服务、废弃物处理等' },
  { code: '第41类', num: '41', name: '教育娱乐', desc: '教育、培训、娱乐、体育和文化活动等' },
  { code: '第42类', num: '42', name: '科技软件', desc: '科学技术服务、工业分析与研究、计算机软件设计等' },
  { code: '第43类', num: '43', name: '餐饮住宿', desc: '提供食物和饮料的服务、临时住宿等' },
  { code: '第44类', num: '44', name: '医疗美容', desc: '医疗服务、牙科诊疗、人或动物的卫生和美容护理等' },
  { code: '第45类', num: '45', name: '法律安保', desc: '法律服务、安全服务、知产维权与咨询等' },
];

// 品牌预置指定颜色卡列表
export const BRAND_COLOR_CARDS = [
  { id: 'black', name: '经典曜黑', hex: '#000000', label: '标准纯黑' },
  { id: 'blue', name: 'usmile蔚蓝', hex: '#2563EB', label: '品牌主色' },
  { id: 'red', name: '朱红赤色', hex: '#DC2626', label: '警示红' },
  { id: 'emerald', name: '翡翠碧绿', hex: '#059669', label: '健康绿' },
  { id: 'amber', name: '香槟暖金', hex: '#D97706', label: '尊享金' },
  { id: 'purple', name: '优雅紫罗兰', hex: '#7C3AED', label: '美妆紫' },
  { id: 'orange', name: '活力珊瑚橙', hex: '#EA580C', label: '年轻橙' },
  { id: 'rose', name: '玫瑰粉红', hex: '#E11D48', label: '护理粉' }
];

// 通用支持关键词搜索与多选的下拉组件
interface SearchableMultiSelectOption {
  value: string;
  label: string;
  desc?: string;
}

interface SearchableMultiSelectProps {
  label: string;
  placeholder: string;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  options: SearchableMultiSelectOption[];
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  label,
  placeholder,
  selectedValues,
  onChange,
  options,
  searchable = true,
  searchPlaceholder = '搜索关键词...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!keyword.trim()) return options;
    const q = keyword.toLowerCase().trim();
    return options.filter(
      opt =>
        opt.value.toLowerCase().includes(q) ||
        opt.label.toLowerCase().includes(q) ||
        (opt.desc && opt.desc.toLowerCase().includes(q))
    );
  }, [options, keyword]);

  const handleToggleValue = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(v => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(o => o.value));
    }
  };

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <label className="block text-xs font-medium text-slate-600">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-xs text-left bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 flex items-center justify-between cursor-pointer transition-all shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className="truncate pr-2">
          {selectedValues.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : selectedValues.length === 1 ? (
            <span className="text-slate-800 font-medium">
              {options.find(o => o.value === selectedValues[0])?.label || selectedValues[0]}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
              已选 {selectedValues.length} 项
            </span>
          )}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl p-2.5 text-xs animate-in fade-in zoom-in-95 duration-150 min-w-[220px]">
          {searchable && (
            <div className="mb-2 relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          )}

          <div className="flex items-center justify-between px-1 py-1 mb-1 border-b border-slate-100 text-[11px] text-slate-500">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              {selectedValues.length === options.length ? '取消全选' : '全选'}
            </button>
            <span>{selectedValues.length} / {options.length}</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-3 text-center text-slate-400 text-[11px]">未搜索到匹配项</div>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleToggleValue(opt.value)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      isChecked ? 'bg-blue-50/80 text-blue-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{opt.label}</div>
                      {opt.desc && <div className="text-[10px] text-slate-400 truncate">{opt.desc}</div>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface ApplicationCenterProps {
  drafts?: ApplicationDraft[];
  brandTree?: BrandTreeNode[];
  onCreateDraft?: (draft: Partial<ApplicationDraft>) => void;
  onDeleteDraft?: (id: string) => void;
  onDuplicateDraft?: (draft: ApplicationDraft) => void;
  onOpenAiAssistant?: () => void;
  onAcceptProposal?: (proposal: TrademarkApplicationProposal) => void;
  onSubmitSearchProposalApproval?: (proposal: TrademarkApplicationProposal) => void;
}

// 预置符合真实业务全貌的提案数据 (对应 57 条提案资产)
export const INITIAL_PROPOSALS: TrademarkApplicationProposal[] = [
  {
    id: 'prop-000',
    proposalNo: 'SB20260821001',
    trademarkName: 'usmile AI SENSE PRO',
    brand: 'usmile笑容加',
    classes: '第10类、第21类',
    similarGroups: '1001 (医疗器械及仪器)、2114 (牙刷，电动牙刷，口腔洁具)',
    goodsServices: '电动牙刷、脉冲冲牙器、智能牙刷刷头、口腔扫描仪',
    importanceLevel: '一级',
    applicationType: '一般',
    jurisdiction: '中国',
    trademarkForm: '文字',
    department: '研发中心',
    applicant: '陆燕丽',
    applyTime: '2026-08-21 09:15',
    status: 'UNSUBMITTED',
    currentNode: '未提交（草稿）',
    currentHandler: '陆燕丽 (申请人)',
    dwellTime: '-',
    isOverdue: false,
    description: 'AI 智能震频算法牙刷草稿案，待补充产品与设计细则后提交。',
    proposalType: '商标',
    trademarkGrade: '核心级',
    is3dTrademark: '否',
    colorForm: '黑白',
    businessType: '国内注册',
    intendedUseDate: '2026-10-01',
    trademarkSource: '自研设计',
    isDesignedColorUsed: '否',
    isSimilarTrademarkRegistered: '否',
    agencyType: '代理机构委外',
    techCategory: '智能口腔算法、电机驱动控制',
    productDomain: '口腔护理智能硬件'
  },
  {
    id: 'prop-001',
    proposalNo: 'SB20260814001',
    trademarkName: 'hh',
    brand: 'usmile笑容加',
    classes: '第10类、第21类',
    similarGroups: '1001 (医疗器械及仪器)、2114 (牙刷，电动牙刷，口腔洁具)',
    goodsServices: '超声波智能电动牙刷、洁齿喷嘴配件、冲牙器、口腔清洁水枪',
    importanceLevel: '一级',
    applicationType: '一般',
    jurisdiction: '中国',
    trademarkForm: '文字',
    department: '品牌中心',
    applicant: '陆燕丽',
    applyTime: '2026-08-14 12:54',
    status: 'PROCESSING',
    currentNode: '法务查重评估',
    currentHandler: '陆燕丽 (法务)',
    dwellTime: '5小时',
    isOverdue: false,
    description: '下一代高端超声波智能电动牙刷及洁齿喷嘴配件核心商标防御布局。',
    agencyName: '北京市柳沈律师事务所'
  },
  {
    id: 'prop-002',
    proposalNo: 'SB20260813001',
    trademarkName: 'P3 PRO',
    brand: 'KittyAnnie小猫安妮',
    classes: '第10类',
    similarGroups: '1001 (医疗器械及仪器)',
    goodsServices: '多光谱微电流美肤仪、离子导入导出仪、射频美容仪、光子嫩肤面罩',
    importanceLevel: '二级',
    applicationType: '集体',
    jurisdiction: '中国',
    trademarkForm: '图形',
    department: '产品事业部',
    applicant: '唐宁',
    applyTime: '2026-08-13 10:32',
    status: 'PENDING_CONFIRM',
    currentNode: '业务方评估确认',
    currentHandler: '唐宁 (业务)',
    dwellTime: '1天4小时',
    isOverdue: false,
    description: '多光谱微电流美肤仪及导入导出仪产品线专属图形标。',
    agencyName: '中国国际贸易促进委员会专利商标事务所'
  },
  {
    id: 'prop-003',
    proposalNo: 'SB20260813002',
    trademarkName: 'Y20',
    brand: 'FHT新燕',
    classes: '第3类、第10类',
    similarGroups: '0301 (肥皂，香皂及其他人造洗洁剂)、0306 (化妆品)、1001 (医疗器械及仪器)',
    goodsServices: '高纯度口服美容精华、冻干燕窝护肤凝胶、医用冷敷贴、抗衰导入仪',
    importanceLevel: '三级',
    applicationType: '证明',
    jurisdiction: '欧盟、英国',
    trademarkForm: '组合',
    department: '欧洲业务部',
    applicant: '袁飞',
    applyTime: '2026-08-12 11:30',
    status: 'PENDING_PROPOSAL',
    currentNode: '待法务发起立案',
    currentHandler: '林悦 (知产主管)',
    dwellTime: '2天2小时',
    isOverdue: true,
    description: '海外高纯度冻干燕窝滋补系列及口服健康精华国际出海商标。',
    agencyName: '北京金杜律师事务所'
  },
  {
    id: 'prop-004',
    proposalNo: 'SB20260813003',
    trademarkName: '笑容加',
    brand: 'aboval阿茂',
    classes: '第35类',
    similarGroups: '3501 (广告)、3502 (工商管理辅助业)、3503 (替他人推销)',
    goodsServices: '商业特许经营管理、为商品和服务的买卖双方提供在线市场、广告宣传策划、艺术品展览组织',
    importanceLevel: '一级',
    applicationType: '特殊',
    jurisdiction: '中国',
    trademarkForm: '文字',
    department: '品牌中心',
    applicant: '陈旻',
    applyTime: '2026-08-11 12:35',
    status: 'PENDING_AGENCY',
    currentNode: '代理机构外部检索',
    currentHandler: '君合律所 (代理)',
    dwellTime: '3天1小时',
    isOverdue: true,
    description: '潮玩IP联名文创周边线下快闪店、连锁专柜及网络广告推广注册。',
    agencyName: '北京市君合律师事务所'
  },
  {
    id: 'prop-005',
    proposalNo: 'SB20260813004',
    trademarkName: 'SMART ORAL LAB',
    brand: 'kissday亲天',
    classes: '第10类、第42类',
    similarGroups: '1001 (医疗器械及仪器)、4209 (计算机软件开发)',
    goodsServices: '牙科设备和仪器、医用冲牙器、口腔治疗仪器、智能口腔云健康监测平台软件、SaaS云端诊断分析系统',
    importanceLevel: '二级',
    applicationType: '一般',
    jurisdiction: '新加坡、马来西亚',
    trademarkForm: '图形',
    department: '创新业务部',
    applicant: '李沐',
    applyTime: '2026-08-10 13:38',
    status: 'ACCEPTED',
    currentNode: '代理机构已接单申报',
    currentHandler: 'Allen & Gledhill (代理)',
    dwellTime: '4天6小时',
    isOverdue: false,
    description: '东南亚智能口腔云健康监测平台、数字化牙齿抛光与香氛喷雾系统。',
    agencyName: '新加坡Allen & Gledhill律所'
  },
  {
    id: 'prop-006',
    proposalNo: 'SB20260809001',
    trademarkName: 'SONIC PRO',
    brand: 'usmile笑容加',
    classes: '第21类、第09类',
    similarGroups: '0901 (电子计算机及其外部设备)、2114 (牙刷，电动牙刷，口腔洁具)',
    goodsServices: '智能声波电动牙刷、智能感应牙刷手柄、手机应用程序(可下载软件)',
    importanceLevel: '一级',
    applicationType: '一般',
    jurisdiction: '美国、日本',
    trademarkForm: '组合',
    department: '海外业务部',
    applicant: '张思琪',
    applyTime: '2026-08-09 09:20',
    status: 'PROCESSING',
    currentNode: '海外前置风险排查',
    currentHandler: 'Finnegan (代理)',
    dwellTime: '1天18小时',
    isOverdue: false,
    description: '北美高端声波电动牙刷及智能芯片APP互联国际商标申请。',
    agencyName: '美国Finnegan律所'
  },
  {
    id: 'prop-007',
    proposalNo: 'SB20260808002',
    trademarkName: '小猫安妮',
    brand: 'KittyAnnie小猫安妮',
    classes: '第03类、第21类',
    similarGroups: '0301 (肥皂，香皂及其他人造洗洁剂)、0306 (化妆品)、2114 (牙刷，电动牙刷，口腔洁具)',
    goodsServices: '氨基酸洁面泡泡、舒缓喷雾、亲肤美妆蛋、洁面仪刷头',
    importanceLevel: '一级',
    applicationType: '一般',
    jurisdiction: '中国',
    trademarkForm: '文字',
    department: '品牌中心',
    applicant: '唐宁',
    applyTime: '2026-08-08 14:15',
    status: 'PENDING_CONFIRM',
    currentNode: '类别保护方案确认',
    currentHandler: '唐宁 (业务)',
    dwellTime: '18小时',
    isOverdue: false,
    description: '氨基酸洁面泡泡、舒缓喷雾及亲肤美妆蛋全品类护航。',
    agencyName: '北京市柳沈律师事务所'
  },
  {
    id: 'prop-008',
    proposalNo: 'SB20260807003',
    trademarkName: 'BIRD NEST PLUS',
    brand: 'FHT新燕',
    classes: '第29类、第30类',
    similarGroups: '2901 (肉，非活家禽，野味，肉汁)、3001 (咖啡，咖啡代用品，可可)',
    goodsServices: '即食燕窝饮、燕窝胶原蛋白口服液、滋补燕窝冻干粉',
    importanceLevel: '二级',
    applicationType: '一般',
    jurisdiction: '中国香港、中国澳门',
    trademarkForm: '文字',
    department: '产品事业部',
    applicant: '袁飞',
    applyTime: '2026-08-07 16:45',
    status: 'PENDING_PROPOSAL',
    currentNode: '待法务发起立案',
    currentHandler: '陆燕丽 (法务)',
    dwellTime: '6小时',
    isOverdue: false,
    description: '港澳免税通道燕窝胶原蛋白饮即食滋补礼盒商标。',
    agencyName: '中原信达知识产权'
  },
  {
    id: 'prop-009',
    proposalNo: 'SB20260806001',
    trademarkName: 'ABOVAL TOY',
    brand: 'aboval阿茂',
    classes: '第28类',
    similarGroups: '2801 (娱乐品，玩具)',
    goodsServices: '潮玩盲盒公仔、限量收藏款手办、智能互动玩具、积木拼装玩具',
    importanceLevel: '二级',
    applicationType: '一般',
    jurisdiction: '韩国、日本',
    trademarkForm: '组合',
    department: '创新业务部',
    applicant: '陈旻',
    applyTime: '2026-08-06 11:10',
    status: 'PENDING_AGENCY',
    currentNode: '日韩代理机构接单',
    currentHandler: 'Kim & Chang (代理)',
    dwellTime: '1天8小时',
    isOverdue: false,
    description: '日韩潮流盲盒公仔、限量收藏款手办防侵权注册。',
    agencyName: '韩国Kim & Chang律所'
  },
  {
    id: 'prop-010',
    proposalNo: 'SB20260805002',
    trademarkName: 'KISSDAY BREEZE',
    brand: 'kissday亲天',
    classes: '第03类',
    similarGroups: '0307 (牙膏，洗牙用制剂，洁齿剂及口腔清新剂)',
    goodsServices: '热带果味便携口腔清新喷雾、薄荷漱口水、便携洁牙慕斯',
    importanceLevel: '三级',
    applicationType: '一般',
    jurisdiction: '泰国、越南',
    trademarkForm: '文字',
    department: '品牌中心',
    applicant: '李沐',
    applyTime: '2026-08-05 15:30',
    status: 'ACCEPTED',
    currentNode: '东盟官方受理待审',
    currentHandler: 'Allen & Gledhill (代理)',
    dwellTime: '6天',
    isOverdue: false,
    description: '热带果味便携口腔清新喷雾东南亚本地化注册。',
    agencyName: '新加坡Allen & Gledhill律所'
  },
  {
    id: 'prop-011',
    proposalNo: 'SB20260804001',
    trademarkName: '笑容密码',
    brand: 'usmile笑容加',
    classes: '第21类',
    similarGroups: '2114 (牙刷，电动牙刷，口腔洁具)',
    goodsServices: '电动牙刷刷头、磁悬浮声波牙刷、牙间刷、舌苔清洁器',
    importanceLevel: '三级',
    applicationType: '一般',
    jurisdiction: '中国',
    trademarkForm: '文字',
    department: '营销中心',
    applicant: '陆燕丽',
    applyTime: '2026-08-04 10:00',
    status: 'TERMINATED',
    currentNode: '流程已终止撤回',
    currentHandler: '无 (已归档)',
    dwellTime: '-',
    isOverdue: false,
    description: '营销活动主题商标，经评估与第三方存近似，已主动撤回终止。',
    agencyName: '北京市柳沈律师事务所'
  },
  {
    id: 'prop-012',
    proposalNo: 'SB20260803002',
    trademarkName: 'CLEAN BOT',
    brand: 'usmile笑容加',
    classes: '第09类、第10类',
    importanceLevel: '二级',
    applicationType: '一般',
    jurisdiction: '中国、欧盟',
    trademarkForm: '图形',
    department: '研发中心',
    applicant: '陆燕丽',
    applyTime: '2026-08-03 17:20',
    status: 'TERMINATED',
    currentNode: '预研终止结案',
    currentHandler: '无 (已归档)',
    dwellTime: '-',
    isOverdue: false,
    description: '早期实验室结构预研案，产品线调整后已申请撤回终止。',
    agencyName: '北京金杜律师事务所'
  },
  {
    id: 'prop-013',
    proposalNo: 'SB20260802001',
    trademarkName: 'usmile AI SENSE',
    brand: 'usmile笑容加',
    classes: '第10类、第21类',
    importanceLevel: '一级',
    applicationType: '一般',
    jurisdiction: '中国、美国',
    trademarkForm: '文字',
    department: '智能硬件事业部',
    applicant: '林悦',
    applyTime: '2026-08-02 09:15',
    status: 'PROCESSING',
    currentNode: 'AI算法专利与商标联动排查',
    currentHandler: '林悦 (知产主管)',
    dwellTime: '3小时',
    isOverdue: false,
    description: 'AI算法智能牙压监测及自动降频算法防侵权核心布局。',
    agencyName: '北京市柳沈律师事务所'
  },
  {
    id: 'prop-014',
    proposalNo: 'SB20260801003',
    trademarkName: '密浪超柔',
    brand: '密浪 Waves',
    classes: '第21类',
    importanceLevel: '二级',
    applicationType: '一般',
    jurisdiction: '中国',
    trademarkForm: '组合',
    department: '产品事业部',
    applicant: '唐宁',
    applyTime: '2026-08-01 14:20',
    status: 'PENDING_CONFIRM',
    currentNode: '业务负责人核准',
    currentHandler: '唐宁 (业务)',
    dwellTime: '12小时',
    isOverdue: false,
    description: '子品牌密浪敏感牙龈专属超柔刷头系列商标。',
    agencyName: '广州华进联合专利商标代理有限公司'
  },
  {
    id: 'prop-015',
    proposalNo: 'SB20260731002',
    trademarkName: 'KITTIES CARE',
    brand: 'KittyAnnie小猫安妮',
    classes: '第03类、第05类',
    importanceLevel: '三级',
    applicationType: '一般',
    jurisdiction: '日本',
    trademarkForm: '文字',
    department: '海外业务部',
    applicant: '陈旻',
    applyTime: '2026-07-31 11:00',
    status: 'PENDING_PROPOSAL',
    currentNode: '海外律所前置风险审查',
    currentHandler: '陆燕丽 (法务)',
    dwellTime: '1天',
    isOverdue: false,
    description: '宠物护理及萌宠温和清洁周边日本出海预研。',
    agencyName: '日本 Seiwa Patent & Law 律所'
  },
  {
    id: 'prop-016',
    proposalNo: 'SB20260730005',
    trademarkName: 'FHT BIRD NEST',
    brand: 'FHT新燕',
    classes: '第29类、第32类',
    importanceLevel: '一级',
    applicationType: '一般',
    jurisdiction: '新加坡',
    trademarkForm: '组合',
    department: '跨境电商部',
    applicant: '袁飞',
    applyTime: '2026-07-30 16:10',
    status: 'PENDING_AGENCY',
    currentNode: '新加坡代理递交准备',
    currentHandler: 'Allen & Gledhill (代理)',
    dwellTime: '2天',
    isOverdue: false,
    description: '东南亚高质即食鲜炖燕窝礼盒及无糖饮料主标。',
    agencyName: '新加坡Allen & Gledhill律所'
  },
  {
    id: 'prop-017',
    proposalNo: 'SB20260729001',
    trademarkName: 'WAVE 3D',
    brand: 'usmile笑容加',
    classes: '第10类、第21类',
    importanceLevel: '二级',
    applicationType: '一般',
    jurisdiction: '欧盟',
    trademarkForm: '文字',
    department: '欧洲业务部',
    applicant: '张思琪',
    applyTime: '2026-07-29 10:45',
    status: 'ACCEPTED',
    currentNode: 'EUIPO 官方已正受理',
    currentHandler: 'Hogan Lovells (代理)',
    dwellTime: '5天',
    isOverdue: false,
    description: '欧盟三维声波扫刷电机技术系列商标申报。',
    agencyName: '英国/欧盟 Hogan Lovells 律所'
  },
  {
    id: 'prop-018',
    proposalNo: 'SB20260728004',
    trademarkName: '星际极光',
    brand: 'aboval阿茂',
    classes: '第09类',
    importanceLevel: '三级',
    applicationType: '一般',
    jurisdiction: '中国',
    trademarkForm: '文字',
    department: '创新业务部',
    applicant: '李沐',
    applyTime: '2026-07-28 15:00',
    status: 'TERMINATED',
    currentNode: '业务战略调整终止',
    currentHandler: '无 (已归档)',
    dwellTime: '-',
    isOverdue: false,
    description: '早期潮流发光音响产品线已暂停，申请主动撤回。',
    agencyName: '北京市柳沈律师事务所'
  }
];

export const ApplicationCenter: React.FC<ApplicationCenterProps> = ({
  brandTree,
  onDeleteDraft,
  onOpenAiAssistant,
  onAcceptProposal,
  onSubmitSearchProposalApproval
}) => {
  // 品牌树动态选项列表
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

  // 1. 提案列表数据状态
  const [proposals, setProposals] = useState<TrademarkApplicationProposal[]>(INITIAL_PROPOSALS);

  // 2. 顶部搜索区 15 个搜索字段状态
  const [searchProposalNo, setSearchProposalNo] = useState('');
  const [searchTrademarkName, setSearchTrademarkName] = useState('');
  const [searchBrand, setSearchBrand] = useState('全部');
  const [selectedSearchClasses, setSelectedSearchClasses] = useState<string[]>([]);
  const [searchImportance, setSearchImportance] = useState('全部');
  const [searchAppType, setSearchAppType] = useState('全部');
  const [searchRegion, setSearchRegion] = useState('全部');
  const [searchCountry, setSearchCountry] = useState('全部');
  const [searchForm, setSearchForm] = useState('全部');
  const [searchNode, setSearchNode] = useState('全部');
  const [selectedSearchHandlers, setSelectedSearchHandlers] = useState<string[]>([]);
  const [searchDwellRange, setSearchDwellRange] = useState('全部');
  const [selectedSearchDepartments, setSelectedSearchDepartments] = useState<string[]>([]);
  const [selectedSearchApplicants, setSelectedSearchApplicants] = useState<string[]>([]);
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');

  // 导出勾选模式
  const [isExportMode, setIsExportMode] = useState(false);
  const [selectedProposals, setSelectedProposals] = useState<string[]>([]);

  // 展开/收起搜索区，默认显示 2 行
  const [isExpanded, setIsExpanded] = useState(false);

  // 3. 列表区状态 Tab (新增 未提交 UNSUBMITTED)
  const [activeStatusTab, setActiveStatusTab] = useState<
    'ALL' | 'UNSUBMITTED' | 'PROCESSING' | 'PENDING_CONFIRM' | 'PENDING_PROPOSAL' | 'PENDING_AGENCY' | 'ACCEPTED' | 'TERMINATED'
  >('ALL');

  // 4. 模态框与弹窗状态
  const [selectedProposal, setSelectedProposal] = useState<TrademarkApplicationProposal | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'info' | 'approval' | 'history'>('info');

  // 每次进入/打开【建案需求详情页】抽屉弹窗时，默认选中【需求信息】Tab
  useEffect(() => {
    if (isDetailDrawerOpen) {
      setDetailTab('info');
    }
  }, [isDetailDrawerOpen]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [isCustomColumnModalOpen, setIsCustomColumnModalOpen] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<TrademarkApplicationProposal | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TrademarkApplicationProposal | null>(null);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);
  // 提交校验未填写字段弹窗状态
  const [missingFieldsModal, setMissingFieldsModal] = useState<{
    isOpen: boolean;
    missingFields: string[];
    title?: string;
  }>({
    isOpen: false,
    missingFields: []
  });

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 视图模式：'COMPOUND' (一屏智能合并 - 零滚动条) 或 'STANDARD' (传统单列平铺)
  const [viewMode, setViewMode] = useState<'COMPOUND' | 'STANDARD'>('COMPOUND');

  // 自定义列表字段勾选
  const [visibleColumns, setVisibleColumns] = useState({
    // 合并视图开关
    trademarkInfo: true,       // 商标名称 + 提案编号 + 商标形式
    brandAndLevel: true,       // 品牌 + 重要等级 + 申请类型
    classesAndRegion: true,    // 尼斯分类 + 申请地区 / 申请国家
    currentNodeAndStatus: true,// 当前节点 + 状态
    handlerAndDuration: true,  // 当前处理人 + 停留时长
    applicantAndTime: true,    // 需求部门 + 申请人 + 申请时间
    // 独立单列开关
    proposalNo: true,
    trademarkName: true,
    brand: true,
    classes: true,
    importanceLevel: true,
    applicationType: true,
    region: true,              // 申请地区
    country: true,             // 申请国家
    jurisdiction: true,
    trademarkForm: true,
    currentNode: true,
    currentHandler: true,
    dwellTime: true,
    status: true,
    department: true,
    applicant: true,
    applyTime: true,
    actions: true
  });

  // 订阅系统管理模块中【商标分类与类群组与商品/服务项目的关系表】实时数据
  const [niceItems, setNiceItems] = useState<NiceClassificationItem[]>(() => getNiceClassificationMappings());
  useEffect(() => {
    const unsub = subscribeNiceClassificationChanges(() => {
      setNiceItems(getNiceClassificationMappings());
    });
    return unsub;
  }, []);

  // 新建/编辑检索需求表单扩展组件交互状态 (1. 尼斯分类 -> 2. 类似群组 -> 3. 商品/服务 三级联动)
  const [selectedClassCodes, setSelectedClassCodes] = useState<string[]>([]);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [classSearchKeyword, setClassSearchKeyword] = useState('');

  const [selectedGroupCodes, setSelectedGroupCodes] = useState<string[]>([]);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [groupSearchKeyword, setGroupSearchKeyword] = useState('');

  const [selectedGoodsItems, setSelectedGoodsItems] = useState<string[]>([]);
  const [isGoodsDropdownOpen, setIsGoodsDropdownOpen] = useState(false);
  const [goodsSearchKeyword, setGoodsSearchKeyword] = useState('');

  const [customColorHex, setCustomColorHex] = useState('#2563EB');
  const [customColorName, setCustomColorName] = useState('usmile蔚蓝');

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

  // 1. 尼斯分类勾选处理 (联动裁剪群组与商品)
  const handleToggleClassCode = (code: string) => {
    setSelectedClassCodes(prev => {
      let next: string[];
      if (prev.includes(code)) {
        next = prev.filter(c => c !== code);
      } else {
        next = [...prev, code];
      }
      
      const formattedClasses = next.map(c => {
        const item = fullNiceClassesList.find(n => n.code === c);
        return item ? `${item.code} (${item.name})` : c;
      }).join('、');

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

      setNewForm(f => ({ 
        ...f, 
        classes: formattedClasses,
        similarGroups: formattedGroups,
        goodsServices: nextGoods.join('、')
      }));

      return next;
    });
  };

  // 快捷批量选择尼斯分类
  const handleSetQuickClasses = (codes: string[]) => {
    setSelectedClassCodes(codes);
    const formattedClasses = codes.map(c => {
      const item = fullNiceClassesList.find(n => n.code === c);
      return item ? `${item.code} (${item.name})` : c;
    }).join('、');

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

    setNewForm(f => ({ 
      ...f, 
      classes: formattedClasses,
      similarGroups: formattedGroups,
      goodsServices: nextGoods.join('、')
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

      setNewForm(f => ({
        ...f,
        similarGroups: formattedGroups,
        goodsServices: nextGoods.join('、')
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
      setNewForm(f => ({ ...f, similarGroups: '', goodsServices: '' }));
    } else {
      setSelectedGroupCodes(allCodes);
      const formatted = allCodes.map(gc => {
        const grp = availableGroupOptions.find(g => g.groupCode === gc);
        return grp ? `${gc} (${grp.groupName})` : gc;
      }).join('、');
      setNewForm(f => ({ ...f, similarGroups: formatted }));
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
      setNewForm(f => ({
        ...f,
        goodsServices: next.join('、')
      }));
      return next;
    });
  };

  // 商品/服务快捷全选当前展示项目
  const handleSelectAllAvailableGoods = () => {
    const allItemNames = availableGoodsOptions.map(g => g.itemNameCn);
    if (selectedGoodsItems.length >= allItemNames.length && allItemNames.length > 0) {
      setSelectedGoodsItems([]);
      setNewForm(f => ({ ...f, goodsServices: '' }));
    } else {
      setSelectedGoodsItems(allItemNames);
      setNewForm(f => ({ ...f, goodsServices: allItemNames.join('、') }));
    }
  };

  // 4. 自定义颜色处理 (支持用户选择任意颜色)
  const handleUpdateCustomColor = (hex: string, name: string) => {
    setCustomColorHex(hex);
    setCustomColorName(name);
    const colorDesc = name.trim() ? `${hex} - ${name.trim()}` : hex;
    const text = `指定颜色 (${colorDesc})`;
    setNewForm(f => ({
      ...f,
      colorForm: text,
      isDesignedColorUsed: '是'
    }));
  };

  // 新建/编辑检索需求表单状态 (含尼斯分类、类似群组、商品/服务三大核心联动字段)
  const initialFormState = {
    classes: '',
    similarGroups: '',
    goodsServices: '',
    proposalType: '',
    trademarkName: '',
    trademarkGrade: '',
    importanceLevel: '' as unknown as ('一级' | '二级' | '三级'),
    department: '',
    applicant: '陆燕丽 (IP法务)',
    is3dTrademark: '',
    colorForm: '',
    businessType: '',
    applicationType: '' as unknown as ('一般' | '集体' | '证明' | '特殊'),
    region: '',
    country: '',
    jurisdiction: '',
    brand: '',
    intendedUseDate: '',
    trademarkSource: '',
    trademarkForm: '' as unknown as ('文字' | '图形' | '组合' | '声音' | '3D立体'),
    isDesignedColorUsed: '',
    isSimilarTrademarkRegistered: '',
    agencyType: '',
    techCategory: '',
    productDomain: '',
    description: ''
  };

  const [newForm, setNewForm] = useState(initialFormState);

  // 提示 Toast
  const triggerToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => {
      setActionSuccessToast(null);
    }, 3500);
  };

  // 选项列表构建 (以 45 类尼斯分类标准为准)
  const niceClassOptions = useMemo(() => {
    return fullNiceClassesList.map(c => ({
      value: c.code,
      label: `${c.code} (${c.name})`,
      desc: c.desc
    }));
  }, [fullNiceClassesList]);

  const nodeOptions = useMemo(() => {
    const list = [
      '未提交（草稿）',
      '法务查重评估',
      '业务方评估确认',
      '待法务发起立案',
      '代理机构外部检索',
      '代理机构已接单申报',
      '海外前置风险排查',
      '类别保护方案确认',
      '流程已终止撤回'
    ];
    proposals.forEach(p => {
      if (p.currentNode && !list.includes(p.currentNode)) {
        list.push(p.currentNode);
      }
    });
    return list;
  }, [proposals]);

  const handlerOptions = useMemo(() => {
    return [
      { value: '陆燕丽', label: '陆燕丽 (需求申请人/法务)' },
      { value: '唐宁', label: '唐宁 (需求主管/业务)' },
      { value: '林悦', label: '林悦 (知产主管)' },
      { value: '袁飞', label: '袁飞 (业务经理)' },
      { value: '陈旻', label: '陈旻 (高级经理)' },
      { value: '李沐', label: '李沐 (项目负责人)' },
      { value: '张思琪', label: '张思琪 (海外知产)' },
      { value: '张伟', label: '张伟 (知产总监)' },
      { value: '柳沈律所', label: '北京市柳沈律师事务所' },
      { value: '君合律所', label: '北京市君合律师事务所' },
      { value: '金杜律所', label: '北京金杜律师事务所' },
      { value: 'Finnegan', label: 'Finnegan 律所' },
      { value: 'Allen & Gledhill', label: 'Allen & Gledhill 律所' }
    ];
  }, []);

  const departmentOptions = useMemo(() => {
    return [
      { value: '品牌中心', label: '品牌中心' },
      { value: '法务合规部', label: '法务合规部' },
      { value: '研发知产组', label: '研发知产组' },
      { value: '市场营销部', label: '市场营销部' },
      { value: '海外事业中心', label: '海外事业中心' },
      { value: '供应链管理部', label: '供应链管理部' },
      { value: '创新业务部', label: '创新业务部' },
      { value: '产品事业部', label: '产品事业部' },
      { value: '欧洲业务部', label: '欧洲业务部' },
      { value: '智能硬件事业部', label: '智能硬件事业部' },
      { value: '营销中心', label: '营销中心' },
      { value: '跨境电商部', label: '跨境电商部' }
    ];
  }, []);

  const applicantOptions = useMemo(() => {
    return [
      { value: '陆燕丽', label: '陆燕丽' },
      { value: '唐宁', label: '唐宁' },
      { value: '袁飞', label: '袁飞' },
      { value: '陈旻', label: '陈旻' },
      { value: '李沐', label: '李沐' },
      { value: '张思琪', label: '张思琪' },
      { value: '林悦', label: '林悦' },
      { value: '张伟', label: '张伟' }
    ];
  }, []);

  // 重置搜索
  const handleResetSearch = () => {
    setSearchProposalNo('');
    setSearchTrademarkName('');
    setSearchBrand('全部');
    setSelectedSearchClasses([]);
    setSearchImportance('全部');
    setSearchAppType('全部');
    setSearchRegion('全部');
    setSearchCountry('全部');
    setSearchForm('全部');
    setSearchNode('全部');
    setSelectedSearchHandlers([]);
    setSearchDwellRange('全部');
    setSelectedSearchDepartments([]);
    setSelectedSearchApplicants([]);
    setSearchStartDate('');
    setSearchEndDate('');
    setCurrentPage(1);
  };

  // 1. 按 15 个检索条件过滤出的全部提案列表 (不包含Tab状态过滤)
  const searchFilteredProposals = useMemo(() => {
    return proposals.filter((item) => {
      // 1. 提案编号 (支持批量搜索)
      if (searchProposalNo.trim()) {
        const codes = searchProposalNo.split(/[,;\s\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
        if (codes.length > 0) {
          const itemNo = item.proposalNo.toLowerCase();
          const matches = codes.some(code => itemNo.includes(code));
          if (!matches) return false;
        }
      }

      // 2. 商标名称 (模糊搜索)
      if (searchTrademarkName.trim() && !item.trademarkName.toLowerCase().includes(searchTrademarkName.trim().toLowerCase())) {
        return false;
      }

      // 3. 品牌
      if (searchBrand !== '全部' && item.brand !== searchBrand) {
        return false;
      }

      // 4. 商品类别 (支持关键词搜索与多选)
      if (selectedSearchClasses.length > 0) {
        const matchCls = selectedSearchClasses.some(cCode => {
          const num = cCode.replace(/[^0-9]/g, '');
          return item.classes.includes(cCode) || (num && item.classes.includes(num));
        });
        if (!matchCls) return false;
      }

      // 5. 重要等级
      if (searchImportance !== '全部' && item.importanceLevel !== searchImportance) {
        return false;
      }

      // 6. 申请类型
      if (searchAppType !== '全部' && item.applicationType !== searchAppType) {
        return false;
      }

      // 7. 申请地区
      if (searchRegion !== '全部') {
        const itemRegion = item.region || getRegionByCountry(item.country || item.jurisdiction);
        if (itemRegion !== searchRegion) return false;
      }

      // 8. 申请国家
      if (searchCountry !== '全部' && searchCountry.trim()) {
        const itemCountry = item.country || item.jurisdiction || '';
        if (!itemCountry.toLowerCase().includes(searchCountry.trim().toLowerCase())) return false;
      }

      // 9. 商标形式
      if (searchForm !== '全部' && item.trademarkForm !== searchForm) {
        return false;
      }

      // 10. 当前节点
      if (searchNode !== '全部' && item.currentNode !== searchNode) {
        return false;
      }

      // 11. 当前处理人 (多选)
      if (selectedSearchHandlers.length > 0) {
        const matchHandler = selectedSearchHandlers.some(h => item.currentHandler?.includes(h));
        if (!matchHandler) return false;
      }

      // 12. 停留时长 (范围选择)
      if (searchDwellRange !== '全部') {
        const d = item.dwellTime || '';
        if (searchDwellRange === '<1天') {
          if (!d.includes('小时') && !d.includes('分钟')) return false;
        } else if (searchDwellRange === '1-3天') {
          if (!d.includes('1天') && !d.includes('2天') && !d.includes('3天')) return false;
        } else if (searchDwellRange === '3-7天') {
          if (!d.includes('3天') && !d.includes('4天') && !d.includes('5天') && !d.includes('6天') && !d.includes('7天')) return false;
        } else if (searchDwellRange === '>7天') {
          if (d.includes('小时') || d.includes('分钟') || d.includes('1天') || d.includes('2天') || d.includes('3天') || d.includes('4天') || d.includes('5天') || d.includes('6天') || d.includes('7天') || d === '-') return false;
        }
      }

      // 13. 需求部门 (多选)
      if (selectedSearchDepartments.length > 0) {
        if (!selectedSearchDepartments.includes(item.department)) return false;
      }

      // 14. 申请人 (多选)
      if (selectedSearchApplicants.length > 0) {
        const matchApplicant = selectedSearchApplicants.some(a => item.applicant?.includes(a));
        if (!matchApplicant) return false;
      }

      // 15. 申请时间 (时间筛选器: 开始时间 ~ 结束时间)
      const applyDate = (item.applyTime || '').slice(0, 10);
      if (searchStartDate && applyDate < searchStartDate) {
        return false;
      }
      if (searchEndDate && applyDate > searchEndDate) {
        return false;
      }

      return true;
    });
  }, [
    proposals,
    searchProposalNo,
    searchTrademarkName,
    searchBrand,
    selectedSearchClasses,
    searchImportance,
    searchAppType,
    searchRegion,
    searchCountry,
    searchForm,
    searchNode,
    selectedSearchHandlers,
    searchDwellRange,
    selectedSearchDepartments,
    selectedSearchApplicants,
    searchStartDate,
    searchEndDate
  ]);

  // 2. 动态状态计数统计 (包含 UNSUBMITTED)
  const statusCounts = useMemo(() => {
    const counts = {
      ALL: searchFilteredProposals.length,
      UNSUBMITTED: 0,
      PROCESSING: 0,
      PENDING_CONFIRM: 0,
      PENDING_PROPOSAL: 0,
      PENDING_AGENCY: 0,
      ACCEPTED: 0,
      TERMINATED: 0
    };
    searchFilteredProposals.forEach((item) => {
      if (item.status in counts) {
        counts[item.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [searchFilteredProposals]);

  // 3. 根据当前选中的 Tab 状态过滤出最终的渲染列表数据
  const filteredProposals = useMemo(() => {
    if (activeStatusTab === 'ALL') {
      return searchFilteredProposals;
    }
    return searchFilteredProposals.filter((item) => item.status === activeStatusTab);
  }, [searchFilteredProposals, activeStatusTab]);

  // 当前页数据
  const paginatedProposals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProposals.slice(start, start + pageSize);
  }, [filteredProposals, currentPage]);

  // 打开新建弹窗
  const handleOpenCreateModal = () => {
    setEditingProposalId(null);
    setSelectedClassCodes([]);
    setIsClassDropdownOpen(false);
    setClassSearchKeyword('');
    setSelectedGroupCodes([]);
    setIsGroupDropdownOpen(false);
    setGroupSearchKeyword('');
    setSelectedGoodsItems([]);
    setIsGoodsDropdownOpen(false);
    setGoodsSearchKeyword('');
    setCustomColorHex('#2563EB');
    setCustomColorName('usmile蔚蓝');

    setNewForm({
      ...initialFormState,
      classes: '',
      similarGroups: '',
      goodsServices: '',
      proposalType: '',
      trademarkName: '',
      trademarkGrade: '',
      importanceLevel: '' as unknown as ('一级' | '二级' | '三级'),
      department: '',
      applicant: '陆燕丽 (IP法务)',
      is3dTrademark: '',
      colorForm: '',
      businessType: '',
      applicationType: '' as unknown as ('一般' | '集体' | '证明' | '特殊'),
      region: '',
      country: '',
      jurisdiction: '',
      brand: '',
      intendedUseDate: '',
      trademarkSource: '',
      trademarkForm: '' as unknown as ('文字' | '图形' | '组合' | '声音' | '3D立体'),
      isDesignedColorUsed: '',
      isSimilarTrademarkRegistered: '',
      agencyType: '',
      techCategory: '',
      productDomain: '',
      description: ''
    });
    setIsCreateModalOpen(true);
  };

  // 打开草稿编辑弹窗
  const handleEditProposalDraft = (proposal: TrademarkApplicationProposal) => {
    setEditingProposalId(proposal.id);

    // 1. 解析尼斯分类
    const matchedClasses = (proposal.classes || '').match(/第\d+类/g);
    const parsedCodes = matchedClasses && matchedClasses.length > 0 ? Array.from(new Set(matchedClasses)) : ['第21类'];
    setSelectedClassCodes(parsedCodes);
    setIsClassDropdownOpen(false);
    setClassSearchKeyword('');

    // 2. 解析类似群组
    if (proposal.similarGroups) {
      const matchedGroups = proposal.similarGroups.match(/\d{4}/g);
      setSelectedGroupCodes(matchedGroups && matchedGroups.length > 0 ? Array.from(new Set(matchedGroups)) : ['2114']);
    } else {
      setSelectedGroupCodes([]);
    }
    setIsGroupDropdownOpen(false);
    setGroupSearchKeyword('');

    // 3. 解析商品/服务
    if (proposal.goodsServices) {
      const items = proposal.goodsServices.split(/[、,，\s\n]+/).map(s => s.trim()).filter(Boolean);
      setSelectedGoodsItems(items);
    } else {
      setSelectedGoodsItems([]);
    }
    setIsGoodsDropdownOpen(false);
    setGoodsSearchKeyword('');

    // 4. 解析申请国家与申请地区
    const pCountry = proposal.country || proposal.jurisdiction || '中国';
    const pRegion = proposal.region || getRegionByCountry(pCountry);

    // 5. 解析颜色形式
    const pColor = proposal.colorForm || '黑白';
    if (pColor.includes('指定颜色') || proposal.isDesignedColorUsed === '是') {
      const hexMatch = pColor.match(/#[0-9A-Fa-f]{6}/);
      const hex = hexMatch ? hexMatch[0] : '#2563EB';
      const matchedCard = BRAND_COLOR_CARDS.find(c => pColor.includes(c.name));
      const cName = matchedCard ? matchedCard.name : '指定品牌色';
      setCustomColorHex(hex);
      setCustomColorName(cName);
    } else {
      setCustomColorHex('#2563EB');
      setCustomColorName('usmile蔚蓝');
    }

    setNewForm({
      classes: proposal.classes || '第21类',
      similarGroups: proposal.similarGroups || '',
      goodsServices: proposal.goodsServices || '',
      proposalType: proposal.proposalType || '商标',
      trademarkName: proposal.trademarkName || '',
      trademarkGrade: proposal.trademarkGrade || '核心级',
      importanceLevel: proposal.importanceLevel || '一级',
      department: proposal.department || '品牌中心',
      applicant: proposal.applicant || '陆燕丽 (IP法务)',
      is3dTrademark: proposal.is3dTrademark || '否',
      colorForm: proposal.colorForm || '黑白',
      businessType: proposal.businessType || '国内注册',
      applicationType: proposal.applicationType || '一般',
      region: pRegion,
      country: pCountry,
      jurisdiction: pCountry,
      brand: proposal.brand || 'usmile 笑容加',
      intendedUseDate: proposal.intendedUseDate || new Date().toISOString().split('T')[0],
      trademarkSource: proposal.trademarkSource || '自研设计',
      trademarkForm: proposal.trademarkForm || '文字',
      isDesignedColorUsed: proposal.isDesignedColorUsed || '否',
      isSimilarTrademarkRegistered: proposal.isSimilarTrademarkRegistered || '否',
      agencyType: proposal.agencyType || '代理机构委外',
      techCategory: proposal.techCategory || '',
      productDomain: proposal.productDomain || '',
      description: proposal.description || ''
    });
    setIsCreateModalOpen(true);
  };

  // 保存草稿
  const handleSaveDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 校验必填项是否已填写完，没填写完则提醒，填写完了才能保存草稿成功
    const missing = validateFormRequiredFields(newForm, selectedClassCodes, selectedGroupCodes, selectedGoodsItems);
    if (missing.length > 0) {
      setMissingFieldsModal({
        isOpen: true,
        missingFields: missing,
        title: '【保存草稿】失败：存在未填写的必填字段'
      });
      return;
    }

    const existing = editingProposalId ? proposals.find(p => p.id === editingProposalId) : null;
    const proposalId = editingProposalId || `prop-${Date.now()}`;
    const proposalNo = existing?.proposalNo || `SB${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 899 + 100))}`;

    const chosenCountry = newForm.country || newForm.jurisdiction || '中国';
    const chosenRegion = newForm.region || getRegionByCountry(chosenCountry);

    const savedRecord: TrademarkApplicationProposal = {
      id: proposalId,
      proposalNo: proposalNo,
      trademarkName: newForm.trademarkName || '未命名商标草稿',
      brand: newForm.brand || 'usmile笑容加',
      classes: newForm.classes || '第21类',
      similarGroups: newForm.similarGroups || '',
      goodsServices: newForm.goodsServices || '',
      importanceLevel: newForm.importanceLevel || '一级',
      applicationType: newForm.applicationType || '一般',
      region: chosenRegion,
      country: chosenCountry,
      jurisdiction: chosenCountry,
      trademarkForm: newForm.trademarkForm || '文字',
      department: newForm.department || '品牌中心',
      applicant: newForm.applicant || '陆燕丽',
      applyTime: existing?.applyTime || new Date().toLocaleString('zh-CN', { hour12: false }),
      status: 'UNSUBMITTED',
      currentNode: '未提交（草稿）',
      currentHandler: `${newForm.applicant || '陆燕丽'} (申请人)`,
      dwellTime: '-',
      isOverdue: false,
      description: newForm.description,
      proposalType: newForm.proposalType,
      trademarkGrade: newForm.trademarkGrade,
      is3dTrademark: newForm.is3dTrademark,
      colorForm: newForm.colorForm,
      businessType: newForm.businessType,
      intendedUseDate: newForm.intendedUseDate,
      trademarkSource: newForm.trademarkSource,
      isDesignedColorUsed: newForm.isDesignedColorUsed,
      isSimilarTrademarkRegistered: newForm.isSimilarTrademarkRegistered,
      agencyType: newForm.agencyType,
      techCategory: newForm.techCategory,
      productDomain: newForm.productDomain
    };

    if (editingProposalId) {
      setProposals(prev => prev.map(p => p.id === editingProposalId ? savedRecord : p));
    } else {
      setProposals(prev => [savedRecord, ...prev]);
    }

    setIsCreateModalOpen(false);
    setActiveStatusTab('UNSUBMITTED');
    triggerToast(`商标检索需求已成功保存为草稿【${savedRecord.proposalNo} - ${savedRecord.trademarkName}】，状态为【未提交】！`);
  };

  // 校验新建商标检索需求所有必填字段
  const validateFormRequiredFields = (formData: typeof newForm, classCodes: string[], groupCodes: string[], goodsItems: string[]) => {
    const missing: string[] = [];
    if (!classCodes || classCodes.length === 0) missing.push('尼斯分类');
    if (!groupCodes || groupCodes.length === 0) missing.push('类似群组');
    if (!goodsItems || goodsItems.length === 0) missing.push('商品/服务');
    if (!formData.proposalType?.trim()) missing.push('提案类型');
    if (!formData.trademarkName?.trim()) missing.push('商标名称');
    if (!formData.trademarkGrade?.trim()) missing.push('商标等级');
    if (!formData.importanceLevel) missing.push('重要等级');
    if (!formData.department?.trim()) missing.push('需求部门');
    if (!formData.applicant?.trim()) missing.push('申请人');
    if (!formData.is3dTrademark?.trim()) missing.push('是否三维商标');
    if (!formData.colorForm?.trim()) missing.push('颜色形式');
    if (!formData.businessType?.trim()) missing.push('业务类型');
    if (!formData.applicationType) missing.push('申请类型');
    if (!formData.region?.trim()) missing.push('申请地区');
    if (!formData.country?.trim()) missing.push('申请国家');
    if (!formData.brand?.trim()) missing.push('所属品牌');
    if (!formData.intendedUseDate?.trim()) missing.push('拟使用时间');
    if (!formData.trademarkSource?.trim()) missing.push('商标来源');
    if (!formData.trademarkForm) missing.push('商标形式');
    if (!formData.isDesignedColorUsed?.trim()) missing.push('是否使用设计颜色');
    if (!formData.isSimilarTrademarkRegistered?.trim()) missing.push('是否已注册近似商标');
    if (!formData.agencyType?.trim()) missing.push('代理机构类型');
    if (!formData.techCategory?.trim()) missing.push('技术类别及检索范围');
    if (!formData.productDomain?.trim()) missing.push('产品领域');
    if (!formData.description?.trim()) missing.push('需求背景与用途简述');
    return missing;
  };

  // 校验已有草稿对象的必填字段
  const validateProposalRequiredFields = (proposal: TrademarkApplicationProposal) => {
    const missing: string[] = [];
    if (!proposal.classes?.trim()) missing.push('尼斯分类');
    if (!proposal.similarGroups?.trim()) missing.push('类似群组');
    if (!proposal.goodsServices?.trim()) missing.push('商品/服务');
    if (!proposal.proposalType?.trim()) missing.push('提案类型');
    if (!proposal.trademarkName?.trim()) missing.push('商标名称');
    if (!proposal.trademarkGrade?.trim()) missing.push('商标等级');
    if (!proposal.importanceLevel) missing.push('重要等级');
    if (!proposal.department?.trim()) missing.push('需求部门');
    if (!proposal.applicant?.trim()) missing.push('申请人');
    if (!proposal.is3dTrademark?.trim()) missing.push('是否三维商标');
    if (!proposal.colorForm?.trim()) missing.push('颜色形式');
    if (!proposal.businessType?.trim()) missing.push('业务类型');
    if (!proposal.applicationType) missing.push('申请类型');
    if (!proposal.region?.trim()) missing.push('申请地区');
    if (!proposal.country?.trim() && !proposal.jurisdiction?.trim()) missing.push('申请国家');
    if (!proposal.brand?.trim()) missing.push('所属品牌');
    if (!proposal.intendedUseDate?.trim()) missing.push('拟使用时间');
    if (!proposal.trademarkSource?.trim()) missing.push('商标来源');
    if (!proposal.trademarkForm) missing.push('商标形式');
    if (!proposal.isDesignedColorUsed?.trim()) missing.push('是否使用设计颜色');
    if (!proposal.isSimilarTrademarkRegistered?.trim()) missing.push('是否已注册近似商标');
    if (!proposal.agencyType?.trim()) missing.push('代理机构类型');
    if (!proposal.techCategory?.trim()) missing.push('技术类别及检索范围');
    if (!proposal.productDomain?.trim()) missing.push('产品领域');
    if (!proposal.description?.trim()) missing.push('需求背景与用途简述');
    return missing;
  };

  // 保存并提交
  const handleSaveAndSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 校验所有必填项
    const missing = validateFormRequiredFields(newForm, selectedClassCodes, selectedGroupCodes, selectedGoodsItems);
    if (missing.length > 0) {
      setMissingFieldsModal({
        isOpen: true,
        missingFields: missing,
        title: '【保存并提交】失败：存在未填写的必填字段'
      });
      return;
    }

    const existing = editingProposalId ? proposals.find(p => p.id === editingProposalId) : null;
    const proposalId = editingProposalId || `prop-${Date.now()}`;
    const proposalNo = existing?.proposalNo || `SB${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 899 + 100))}`;

    const chosenCountry = newForm.country || newForm.jurisdiction || '中国';
    const chosenRegion = newForm.region || getRegionByCountry(chosenCountry);

    const submittedRecord: TrademarkApplicationProposal = {
      id: proposalId,
      proposalNo: proposalNo,
      trademarkName: newForm.trademarkName,
      brand: newForm.brand || 'usmile笑容加',
      classes: newForm.classes || '第21类',
      similarGroups: newForm.similarGroups || '',
      goodsServices: newForm.goodsServices || '',
      importanceLevel: newForm.importanceLevel || '一级',
      applicationType: newForm.applicationType || '一般',
      region: chosenRegion,
      country: chosenCountry,
      jurisdiction: chosenCountry,
      trademarkForm: newForm.trademarkForm || '文字',
      department: newForm.department || '品牌中心',
      applicant: newForm.applicant || '陆燕丽',
      applyTime: existing?.applyTime || new Date().toLocaleString('zh-CN', { hour12: false }),
      status: 'PROCESSING',
      currentNode: '需求部门主管复核',
      currentHandler: '唐宁 (部门主管)',
      dwellTime: '刚刚',
      isOverdue: false,
      description: newForm.description,
      proposalType: newForm.proposalType,
      trademarkGrade: newForm.trademarkGrade,
      is3dTrademark: newForm.is3dTrademark,
      colorForm: newForm.colorForm,
      businessType: newForm.businessType,
      intendedUseDate: newForm.intendedUseDate,
      trademarkSource: newForm.trademarkSource,
      isDesignedColorUsed: newForm.isDesignedColorUsed,
      isSimilarTrademarkRegistered: newForm.isSimilarTrademarkRegistered,
      agencyType: newForm.agencyType,
      techCategory: newForm.techCategory,
      productDomain: newForm.productDomain
    };

    if (editingProposalId) {
      setProposals(prev => prev.map(p => p.id === editingProposalId ? submittedRecord : p));
    } else {
      setProposals(prev => [submittedRecord, ...prev]);
    }

    if (onSubmitSearchProposalApproval) {
      onSubmitSearchProposalApproval(submittedRecord);
    }

    setIsCreateModalOpen(false);
    setActiveStatusTab('PROCESSING');
    triggerToast(`建案申请【${submittedRecord.proposalNo} - ${submittedRecord.trademarkName}】已保存并提交，状态变为【处理中】，已自动在【审批中心】推送审批单！`);
  };

  // 草稿列表行操作：直接提交
  const handleSubmitDraftDirectly = (proposal: TrademarkApplicationProposal) => {
    // 校验草稿数据所有必填项
    const missing = validateProposalRequiredFields(proposal);
    if (missing.length > 0) {
      setMissingFieldsModal({
        isOpen: true,
        missingFields: missing,
        title: `草稿【${proposal.proposalNo}】提交失败：存在未填写的必填字段`
      });
      return;
    }

    const updated: TrademarkApplicationProposal = {
      ...proposal,
      status: 'PROCESSING',
      currentNode: '需求部门主管复核',
      currentHandler: '唐宁 (部门主管)',
      dwellTime: '刚刚'
    };
    setProposals(prev => prev.map(p => p.id === proposal.id ? updated : p));
    if (onSubmitSearchProposalApproval) {
      onSubmitSearchProposalApproval(updated);
    }
    setActiveStatusTab('PROCESSING');
    triggerToast(`草稿【${proposal.proposalNo} - ${proposal.trademarkName}】已提交，进入【处理中】并推送到审批中心！`);
  };

  // 草稿列表行操作：触发删除确认弹窗
  const handleDeleteDraftProposal = (itemOrId: TrademarkApplicationProposal | string) => {
    if (typeof itemOrId === 'string') {
      const found = proposals.find(p => p.id === itemOrId);
      if (found) setDeleteTarget(found);
    } else {
      setDeleteTarget(itemOrId);
    }
  };

  // 确认彻底删除草稿
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setProposals((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    if (onDeleteDraft) {
      onDeleteDraft(deleteTarget.id);
    }
    triggerToast(`草稿【${deleteTarget.proposalNo} - ${deleteTarget.trademarkName}】已删除！`);
    setDeleteTarget(null);
  };

  // 撤回确认
  const handleConfirmWithdraw = () => {
    if (!withdrawTarget) return;
    setProposals((prev) =>
      prev.map((p) => (p.id === withdrawTarget.id ? { ...p, status: 'TERMINATED' } : p))
    );
    triggerToast(`提案【${withdrawTarget.proposalNo} - ${withdrawTarget.trademarkName}】已成功撤回并终止`);
    setWithdrawTarget(null);
  };

  // 代理机构接单并自动生成案件管理单据
  const handleAcceptAndFileCase = (item: TrademarkApplicationProposal) => {
    const updated = proposals.map((p) => {
      if (p.id === item.id) {
        return {
          ...p,
          status: 'ACCEPTED' as const,
          currentNode: '代理机构已接单',
          currentHandler: p.agencyName || '海外/国内代理律所',
          dwellTime: '刚刚'
        };
      }
      return p;
    });
    setProposals(updated);
    if (selectedProposal && selectedProposal.id === item.id) {
      setSelectedProposal({
        ...selectedProposal,
        status: 'ACCEPTED',
        currentNode: '代理机构已接单',
        currentHandler: selectedProposal.agencyName || '海外/国内代理律所',
        dwellTime: '刚刚'
      });
    }
    if (onAcceptProposal) {
      onAcceptProposal({
        ...item,
        status: 'ACCEPTED',
        currentNode: '代理机构已接单',
        currentHandler: item.agencyName || '海外/国内代理律所',
        dwellTime: '刚刚'
      });
    }
    triggerToast(`提案【${item.proposalNo}】已成功接单！已自动生成案件管理单据并同步至台账！`);
  };

  // 提交新建提案
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.trademarkName.trim()) {
      alert('请输入商标名称');
      return;
    }
    const newProposalNo = `SB${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: TrademarkApplicationProposal = {
      id: `prop-${Date.now()}`,
      proposalNo: newProposalNo,
      trademarkName: newForm.trademarkName,
      brand: newForm.brand,
      classes: newForm.classes,
      importanceLevel: newForm.importanceLevel,
      applicationType: newForm.applicationType,
      jurisdiction: newForm.jurisdiction,
      trademarkForm: newForm.trademarkForm,
      department: newForm.department,
      applicant: newForm.applicant,
      applyTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'PROCESSING',
      description: newForm.description || '新建商标检索与建案需求',
      agencyName: '北京市柳沈律师事务所'
    };
    setProposals([newRecord, ...proposals]);
    setIsCreateModalOpen(false);
    triggerToast(`新建商标检索需求【${newRecord.proposalNo}】创建成功！`);
    setNewForm(initialFormState);
  };

  // 选中的 proposal 全选状态
  const isAllProposalsSelected = useMemo(() => {
    if (filteredProposals.length === 0) return false;
    return filteredProposals.every(p => selectedProposals.includes(p.id));
  }, [filteredProposals, selectedProposals]);

  const handleToggleSelectAllProposals = () => {
    if (isAllProposalsSelected) {
      setSelectedProposals([]);
    } else {
      setSelectedProposals(filteredProposals.map(p => p.id));
    }
  };

  const handleToggleSelectOneProposal = (id: string) => {
    setSelectedProposals(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 导出 CSV / 确认导出
  const handleExportCSV = () => {
    if (!isExportMode) {
      setIsExportMode(true);
      return;
    }

    if (selectedProposals.length === 0) {
      triggerToast('请勾选要导出的数据');
      return;
    }

    const exportData = filteredProposals.filter(p => selectedProposals.includes(p.id));
    const headers = ['提案编号,商标名称,品牌,尼斯分类,类似群组,商品/服务,重要等级,申请类型,申请地区,申请国家,商标形式,需求部门,申请人,申请时间,状态'];
    const rows = exportData.map((p) =>
      [
        p.proposalNo,
        `"${p.trademarkName}"`,
        `"${p.brand}"`,
        `"${p.classes}"`,
        `"${p.similarGroups || ''}"`,
        `"${p.goodsServices || ''}"`,
        p.importanceLevel,
        p.applicationType,
        `"${p.region || getRegionByCountry(p.country || p.jurisdiction)}"`,
        `"${p.country || p.jurisdiction}"`,
        p.trademarkForm,
        `"${p.department}"`,
        p.applicant,
        p.applyTime,
        p.status
      ].join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `建案申请列表_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`已成功导出 ${exportData.length} 条建案申请表格 CSV 数据！`);
    setIsExportMode(false);
    setSelectedProposals([]);
  };

  return (
    <div className="space-y-3.5 antialiased text-slate-800">
      
      {/* 操作成功 Toast (页面居中显示) */}
      {actionSuccessToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] max-w-md px-6 py-4 bg-slate-900/95 backdrop-blur-md text-white text-sm font-medium rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-slate-700/80 text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. 搜索区 (Search Area) */}
      {/* ======================================================== */}
      <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        
        {/* 表单字段网格 (4列统一间距，按钮置于最后一行最右侧) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-3.5">
          
          {/* 1. 提案编号 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">提案编号</label>
            <input 
              type="text" 
              value={searchProposalNo}
              onChange={(e) => setSearchProposalNo(e.target.value)}
              placeholder="支持批量编号(空格/逗号/换行分隔)" 
              className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
            />
          </div>

          {/* 2. 商标名称 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">商标名称</label>
            <input 
              type="text" 
              value={searchTrademarkName}
              onChange={(e) => setSearchTrademarkName(e.target.value)}
              placeholder="支持商标名称模糊搜索" 
              className="w-full text-xs font-normal text-slate-800 placeholder-slate-400 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
            />
          </div>

          {/* 3. 品牌 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">品牌</label>
            <div className="relative">
              <select 
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
              >
                <option value="全部">全部品牌 (共{brandOptions.length}个)</option>
                {brandOptions.map(b => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4. 尼斯分类 */}
          <SearchableMultiSelect
            label="尼斯分类"
            placeholder="显示45类尼斯分类(可多选)"
            selectedValues={selectedSearchClasses}
            onChange={setSelectedSearchClasses}
            options={niceClassOptions}
            searchPlaceholder="搜索分类代码或名称..."
          />

          {/* 5. 重要等级 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">重要等级</label>
            <div className="relative">
              <select 
                value={searchImportance}
                onChange={(e) => setSearchImportance(e.target.value)}
                className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
              >
                <option value="全部">全部等级</option>
                <option value="一级">一级(核心战略)</option>
                <option value="二级">二级(主打品类)</option>
                <option value="三级">三级(防御布局)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 6. 申请类型 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">申请类型</label>
            <div className="relative">
              <select 
                value={searchAppType}
                onChange={(e) => setSearchAppType(e.target.value)}
                className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
              >
                <option value="全部">全部类型</option>
                <option value="一般">一般商标</option>
                <option value="集体">集体商标</option>
                <option value="证明">证明商标</option>
                <option value="特殊">特殊标志</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 7. 申请地区 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">申请地区</label>
            <div className="relative">
              <select 
                value={searchRegion}
                onChange={(e) => {
                  const newReg = e.target.value;
                  setSearchRegion(newReg);
                  setSearchCountry('全部');
                }}
                className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
              >
                <option value="全部">全部地区</option>
                {ALL_REGION_NAMES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 未展开状态 (默认前2行): 第2行第4列放置按钮组 */}
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
                onClick={handleResetSearch}
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

          {/* 展开状态 (所有行显示): 剩余 8 个字段 + 按钮组 */}
          {isExpanded && (
            <>
              {/* 8. 申请国家 */}
              <div className="space-y-1 animate-in fade-in duration-200">
                <label className="block text-xs font-medium text-slate-600">申请国家</label>
                <div className="relative">
                  <select 
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                    className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
                  >
                    <option value="全部">全部国家</option>
                    {getCountriesByRegion(searchRegion).map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 9. 商标形式 */}
              <div className="space-y-1 animate-in fade-in duration-200">
                <label className="block text-xs font-medium text-slate-600">商标形式</label>
                <div className="relative">
                  <select 
                    value={searchForm}
                    onChange={(e) => setSearchForm(e.target.value)}
                    className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
                  >
                    <option value="全部">全部形式</option>
                    <option value="文字">文字</option>
                    <option value="图形">图形</option>
                    <option value="组合">组合</option>
                    <option value="声音">声音</option>
                    <option value="3D立体">3D立体</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 10. 当前节点 */}
              <div className="space-y-1 animate-in fade-in duration-200">
                <label className="block text-xs font-medium text-slate-600">当前节点</label>
                <div className="relative">
                  <select 
                    value={searchNode}
                    onChange={(e) => setSearchNode(e.target.value)}
                    className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
                  >
                    <option value="全部">全部节点</option>
                    {nodeOptions.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 11. 当前处理人 */}
              <div className="animate-in fade-in duration-200">
                <SearchableMultiSelect
                  label="当前处理人"
                  placeholder="选择员工或代理机构(可多选)"
                  selectedValues={selectedSearchHandlers}
                  onChange={setSelectedSearchHandlers}
                  options={handlerOptions}
                  searchPlaceholder="搜索处理人姓名..."
                />
              </div>

              {/* 12. 停留时长 */}
              <div className="space-y-1 animate-in fade-in duration-200">
                <label className="block text-xs font-medium text-slate-600">停留时长</label>
                <div className="relative">
                  <select 
                    value={searchDwellRange}
                    onChange={(e) => setSearchDwellRange(e.target.value)}
                    className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-2xs"
                  >
                    <option value="全部">全部停留时长</option>
                    <option value="<1天">&lt; 1天 (分钟/小时级)</option>
                    <option value="1-3天">1 - 3 天</option>
                    <option value="3-7天">3 - 7 天</option>
                    <option value=">7天">&gt; 7 天 (超期跟进)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 13. 需求部门 */}
              <div className="animate-in fade-in duration-200">
                <SearchableMultiSelect
                  label="需求部门"
                  placeholder="选择需求部门(可多选)"
                  selectedValues={selectedSearchDepartments}
                  onChange={setSelectedSearchDepartments}
                  options={departmentOptions}
                  searchPlaceholder="搜索部门名称..."
                />
              </div>

              {/* 14. 申请人 */}
              <div className="animate-in fade-in duration-200">
                <SearchableMultiSelect
                  label="申请人"
                  placeholder="选择申请人姓名(可多选)"
                  selectedValues={selectedSearchApplicants}
                  onChange={setSelectedSearchApplicants}
                  options={applicantOptions}
                  searchPlaceholder="搜索申请人..."
                />
              </div>

              {/* 15. 申请时间 (时间筛选器: 开始时间 ~ 结束时间) */}
              <div className="space-y-1 animate-in fade-in duration-200">
                <label className="block text-xs font-medium text-slate-600">申请时间</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={searchStartDate}
                    onChange={(e) => setSearchStartDate(e.target.value)}
                    className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer font-mono"
                  />
                  <span className="text-slate-400 text-xs shrink-0">至</span>
                  <input
                    type="date"
                    value={searchEndDate}
                    onChange={(e) => setSearchEndDate(e.target.value)}
                    className="w-full text-xs font-normal text-slate-800 bg-white hover:bg-slate-50/60 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer font-mono"
                  />
                </div>
              </div>

              {/* 展开状态下第4行第4列：操作按钮组 */}
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
                  onClick={handleResetSearch}
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

      {/* ======================================================== */}
      {/* 2. 列表区 (List Area) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-0">
        
        {/* 列表头部工具栏：左侧状态选项卡 + 右侧操作功能按键 */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white">
          
          {/* 左侧状态过滤选项卡栏 */}
          <div className="flex items-center gap-5 sm:gap-6 overflow-x-auto no-scrollbar pt-1">
            
            {/* 全部状态 */}
            <button
              onClick={() => {
                setActiveStatusTab('ALL');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeStatusTab === 'ALL'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>全部状态</span>
              <span className={`text-xs ${activeStatusTab === 'ALL' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {statusCounts.ALL}
              </span>
              {activeStatusTab === 'ALL' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

            {/* 未提交 */}
            <button
              onClick={() => {
                setActiveStatusTab('UNSUBMITTED');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeStatusTab === 'UNSUBMITTED'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>未提交</span>
              <span className={`text-xs ${activeStatusTab === 'UNSUBMITTED' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {statusCounts.UNSUBMITTED}
              </span>
              {activeStatusTab === 'UNSUBMITTED' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

            {/* 处理中 */}
            <button
              onClick={() => {
                setActiveStatusTab('PROCESSING');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeStatusTab === 'PROCESSING'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>处理中</span>
              <span className={`text-xs ${activeStatusTab === 'PROCESSING' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {statusCounts.PROCESSING}
              </span>
              {activeStatusTab === 'PROCESSING' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

            {/* 待确认 */}
            <button
              onClick={() => {
                setActiveStatusTab('PENDING_CONFIRM');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeStatusTab === 'PENDING_CONFIRM'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>待确认</span>
              <span className={`text-xs ${activeStatusTab === 'PENDING_CONFIRM' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {statusCounts.PENDING_CONFIRM}
              </span>
              {activeStatusTab === 'PENDING_CONFIRM' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

            {/* 待提案 */}
            <button
              onClick={() => {
                setActiveStatusTab('PENDING_PROPOSAL');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeStatusTab === 'PENDING_PROPOSAL'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>待提案</span>
              <span className={`text-xs ${activeStatusTab === 'PENDING_PROPOSAL' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {statusCounts.PENDING_PROPOSAL}
              </span>
              {activeStatusTab === 'PENDING_PROPOSAL' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

            {/* 待机构处理 */}
            <button
              onClick={() => {
                setActiveStatusTab('PENDING_AGENCY');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeStatusTab === 'PENDING_AGENCY'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>待机构处理</span>
              <span className={`text-xs ${activeStatusTab === 'PENDING_AGENCY' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {statusCounts.PENDING_AGENCY}
              </span>
              {activeStatusTab === 'PENDING_AGENCY' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

            {/* 已接单 */}
            <button
              onClick={() => {
                setActiveStatusTab('ACCEPTED');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeStatusTab === 'ACCEPTED'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>已接单</span>
              <span className={`text-xs ${activeStatusTab === 'ACCEPTED' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {statusCounts.ACCEPTED}
              </span>
              {activeStatusTab === 'ACCEPTED' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

            {/* 已终止 */}
            <button
              onClick={() => {
                setActiveStatusTab('TERMINATED');
                setCurrentPage(1);
              }}
              className={`relative pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                activeStatusTab === 'TERMINATED'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-700 hover:text-blue-600 font-normal'
              }`}
            >
              <span>已终止</span>
              <span className={`text-xs ${activeStatusTab === 'TERMINATED' ? 'text-blue-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                {statusCounts.TERMINATED}
              </span>
              {activeStatusTab === 'TERMINATED' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

          </div>

          {/* 右侧操作按钮组 */}
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

            {/* 导出按钮 */}
            {isExportMode ? (
              <>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>确认导出{selectedProposals.length > 0 ? ` (${selectedProposals.length})` : ''}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportMode(false);
                    setSelectedProposals([]);
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

            {/* 自定义列表 */}
            <button
              type="button"
              onClick={() => setIsCustomColumnModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50/80 border border-slate-300 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>自定义列表</span>
            </button>

            {/* + 新建商标检索需求 */}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all flex items-center gap-1.5 shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建商标检索需求</span>
            </button>

          </div>

        </div>

        {/* 表格区 (一屏无横向滚动条优化) */}
        <div className="overflow-x-auto">
          {viewMode === 'COMPOUND' ? (
            /* ======================================================== */
            /* 1. 一屏智能合并视图 (7 列紧凑布局，零滚动条，层次鲜明) */
            /* ======================================================== */
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[12px] font-semibold text-slate-600">
                  {isExportMode && (
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllProposalsSelected}
                        onChange={handleToggleSelectAllProposals}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                  )}
                  {visibleColumns.trademarkInfo && (
                    <th className="py-3 px-4 w-[18%]">商标 / 提案编号</th>
                  )}
                  {visibleColumns.brandAndLevel && (
                    <th className="py-3 px-4 w-[14%]">品牌 / 等级属性</th>
                  )}
                  {visibleColumns.classesAndRegion && (
                    <th className="py-3 px-4 w-[16%]">尼斯分类 / 申请地区与国家</th>
                  )}
                  {visibleColumns.currentNodeAndStatus && (
                    <th className="py-3 px-4 w-[17%]">当前节点 / 状态</th>
                  )}
                  {visibleColumns.handlerAndDuration && (
                    <th className="py-3 px-4 w-[16%]">当前处理人 / 停留时长</th>
                  )}
                  {visibleColumns.applicantAndTime && (
                    <th className="py-3 px-4 w-[13%]">提报人 / 申请时间</th>
                  )}
                  {visibleColumns.actions && (
                    <th className="py-3 px-3 w-[180px] min-w-[180px] whitespace-nowrap text-center sticky right-0 z-10 bg-slate-50 border-l border-slate-100 shrink-0">操作</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedProposals.length > 0 ? (
                  paginatedProposals.map((item) => (
                    <tr 
                      key={item.id}
                      className="hover:bg-blue-50/20 transition-colors group"
                    >
                      {isExportMode && (
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedProposals.includes(item.id)}
                            onChange={() => handleToggleSelectOneProposal(item.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      )}
                      {/* 1. 商标信息 (商标名称 + 提案编号 + 形式微标) */}
                      {visibleColumns.trademarkInfo && (
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs tracking-tight">
                                {item.trademarkName}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {item.trademarkForm}
                              </span>
                            </div>
                            <div>
                              <button
                                onClick={() => {
                                  setSelectedProposal(item);
                                  setIsDetailDrawerOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-mono text-[11px] font-medium cursor-pointer"
                              >
                                {item.proposalNo}
                              </button>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* 2. 品牌与属性 (所属品牌 + 重要等级 + 申请类型) */}
                      {visibleColumns.brandAndLevel && (
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-slate-400" />
                              <span className="font-medium text-slate-800 truncate">{item.brand}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                                item.importanceLevel === '一级'
                                  ? 'bg-slate-100 text-slate-800 border border-slate-200/90 font-semibold'
                                  : item.importanceLevel === '二级'
                                  ? 'bg-slate-50 text-slate-600 border border-slate-200/70 font-medium'
                                  : 'bg-slate-50/60 text-slate-500 border border-slate-200/50'
                              }`}>
                                {item.importanceLevel}
                              </span>
                              <span className="text-[10px] text-slate-400">· {item.applicationType}</span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* 3. 商品类别与法域 (商品类别 + 申请地区 / 申请国家) */}
                      {visibleColumns.classesAndRegion && (
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="text-slate-900 text-xs font-medium truncate">
                              {item.classes}
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-[11px] truncate">
                              <Globe2 className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">
                                <span className="text-slate-700 font-medium">{item.region || getRegionByCountry(item.country || item.jurisdiction)}</span>
                                <span className="text-slate-300 mx-1">/</span>
                                <span className="text-slate-700 font-medium">{item.country || item.jurisdiction}</span>
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* 4. 当前节点与状态 (当前节点 + 状态徽标) */}
                      {visibleColumns.currentNodeAndStatus && (
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="font-medium text-slate-900 truncate">
                              {item.currentNode || '流程处理中'}
                            </div>
                            <div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                item.status === 'UNSUBMITTED' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                                item.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                item.status === 'PENDING_CONFIRM' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                item.status === 'PENDING_PROPOSAL' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                                item.status === 'PENDING_AGENCY' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                item.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${
                                  item.status === 'UNSUBMITTED' ? 'bg-amber-600' :
                                  item.status === 'PROCESSING' ? 'bg-blue-600' :
                                  item.status === 'PENDING_CONFIRM' ? 'bg-amber-600' :
                                  item.status === 'PENDING_PROPOSAL' ? 'bg-cyan-600' :
                                  item.status === 'PENDING_AGENCY' ? 'bg-purple-600' :
                                  item.status === 'ACCEPTED' ? 'bg-emerald-600' : 'bg-slate-400'
                                }`} />
                                {item.status === 'UNSUBMITTED' ? '未提交' :
                                 item.status === 'PROCESSING' ? '处理中' :
                                 item.status === 'PENDING_CONFIRM' ? '待确认' :
                                 item.status === 'PENDING_PROPOSAL' ? '待提案' :
                                 item.status === 'PENDING_AGENCY' ? '待机构处理' :
                                 item.status === 'ACCEPTED' ? '已接单' : '已终止'}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* 5. 当前处理人与停留时长 (处理人 + 停留时长/超时标) */}
                      {visibleColumns.handlerAndDuration && (
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-slate-800 font-medium truncate">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.currentHandler || item.applicant}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{item.dwellTime || '3小时'}</span>
                              </span>
                              {item.isOverdue && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                  超时预警
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      )}

                      {/* 6. 提报人员与时间 (申请人 + 部门 + 申请时间) */}
                      {visibleColumns.applicantAndTime && (
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div className="text-slate-700 font-medium truncate text-xs">
                              {item.applicant} <span className="text-slate-400 text-[11px]">· {item.department}</span>
                            </div>
                            <div className="text-slate-400 font-mono text-[10px] truncate">
                              {item.applyTime}
                            </div>
                          </div>
                        </td>
                      )}

                      {/* 7. 操作列 */}
                      {visibleColumns.actions && (
                        <td className="py-3 px-3 w-[180px] min-w-[180px] whitespace-nowrap text-center sticky right-0 z-10 bg-white group-hover:bg-slate-50 border-l border-slate-100 shrink-0">
                          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProposal(item);
                                setIsDetailDrawerOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                            >
                              详情
                            </button>
                            {item.status === 'UNSUBMITTED' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEditProposalDraft(item)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                                >
                                  编辑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSubmitDraftDirectly(item)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                                >
                                  提交
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDraftProposal(item.id)}
                                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-1.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                                >
                                  删除
                                </button>
                              </>
                            ) : item.status !== 'TERMINATED' ? (
                              <button
                                type="button"
                                onClick={() => setWithdrawTarget(item)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                              >
                                撤回
                              </button>
                            ) : null}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-8 h-8 text-slate-300 stroke-1" />
                        <p className="text-xs">暂无符合条件的建案申请记录</p>
                        <button
                          onClick={handleResetSearch}
                          className="text-xs text-blue-600 hover:underline mt-1 cursor-pointer"
                        >
                          清空筛选条件
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            /* ======================================================== */
            /* 2. 传统平铺单列视图 (逐列独立展示) */
            /* ======================================================== */
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[12px] font-semibold text-slate-600">
                  {isExportMode && (
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllProposalsSelected}
                        onChange={handleToggleSelectAllProposals}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                  )}
                  {visibleColumns.proposalNo && <th className="py-3 px-4">提案编号</th>}
                  {visibleColumns.trademarkName && <th className="py-3 px-4">商标名称</th>}
                  {visibleColumns.brand && <th className="py-3 px-4">品牌</th>}
                  {visibleColumns.classes && <th className="py-3 px-4">尼斯分类</th>}
                  {visibleColumns.importanceLevel && <th className="py-3 px-4">重要等级</th>}
                  {visibleColumns.applicationType && <th className="py-3 px-4">申请类型</th>}
                  {visibleColumns.region && <th className="py-3 px-4">申请地区</th>}
                  {visibleColumns.country && <th className="py-3 px-4">申请国家</th>}
                  {visibleColumns.trademarkForm && <th className="py-3 px-4">商标形式</th>}
                  {visibleColumns.currentNode && <th className="py-3 px-4">当前节点</th>}
                  {visibleColumns.currentHandler && <th className="py-3 px-4">当前处理人</th>}
                  {visibleColumns.dwellTime && <th className="py-3 px-4">停留时长</th>}
                  {visibleColumns.status && <th className="py-3 px-4">状态</th>}
                  {visibleColumns.department && <th className="py-3 px-4">需求部门</th>}
                  {visibleColumns.applicant && <th className="py-3 px-4">申请人</th>}
                  {visibleColumns.applyTime && <th className="py-3 px-4">申请时间</th>}
                  {visibleColumns.actions && <th className="py-3 px-3 w-[180px] min-w-[180px] whitespace-nowrap text-center sticky right-0 z-10 bg-slate-50 border-l border-slate-100 shrink-0">操作</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedProposals.length > 0 ? (
                  paginatedProposals.map((item) => (
                    <tr 
                      key={item.id}
                      className="hover:bg-blue-50/20 transition-colors group"
                    >
                      {isExportMode && (
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedProposals.includes(item.id)}
                            onChange={() => handleToggleSelectOneProposal(item.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      )}
                      {/* 提案编号 */}
                      {visibleColumns.proposalNo && (
                        <td className="py-3.5 px-4 font-mono font-medium">
                          <button
                            onClick={() => {
                              setSelectedProposal(item);
                              setIsDetailDrawerOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1 font-medium transition-colors"
                          >
                            <span>{item.proposalNo}</span>
                          </button>
                        </td>
                      )}

                      {/* 商标名称 */}
                      {visibleColumns.trademarkName && (
                        <td className="py-3.5 px-4 font-bold text-slate-900 tracking-tight">
                          {item.trademarkName}
                        </td>
                      )}

                      {/* 品牌 */}
                      {visibleColumns.brand && (
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                            <span>{item.brand}</span>
                          </span>
                        </td>
                      )}

                      {/* 商品类别 */}
                      {visibleColumns.classes && (
                        <td className="py-3.5 px-4 text-slate-900 text-xs font-medium">
                          {item.classes}
                        </td>
                      )}

                      {/* 重要等级 */}
                      {visibleColumns.importanceLevel && (
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] ${
                            item.importanceLevel === '一级'
                              ? 'bg-slate-100 text-slate-800 border border-slate-200/90 font-semibold'
                              : item.importanceLevel === '二级'
                              ? 'bg-slate-50 text-slate-600 border border-slate-200/70 font-medium'
                              : 'bg-slate-50/60 text-slate-500 border border-slate-200/50'
                          }`}>
                            {item.importanceLevel}
                          </span>
                        </td>
                      )}

                      {/* 申请类型 */}
                      {visibleColumns.applicationType && (
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.applicationType}
                        </td>
                      )}

                      {/* 申请地区 */}
                      {visibleColumns.region && (
                        <td className="py-3.5 px-4 text-slate-700 text-xs font-medium">
                          {item.region || getRegionByCountry(item.country || item.jurisdiction)}
                        </td>
                      )}

                      {/* 申请国家 */}
                      {visibleColumns.country && (
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {item.country || item.jurisdiction}
                        </td>
                      )}

                      {/* 商标形式 */}
                      {visibleColumns.trademarkForm && (
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.trademarkForm}
                        </td>
                      )}

                      {/* 【新增】当前节点 */}
                      {visibleColumns.currentNode && (
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {item.currentNode || '流程处理中'}
                        </td>
                      )}

                      {/* 【新增】当前处理人 */}
                      {visibleColumns.currentHandler && (
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.currentHandler || item.applicant}</span>
                          </span>
                        </td>
                      )}

                      {/* 【新增】停留时长 */}
                      {visibleColumns.dwellTime && (
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.dwellTime || '3小时'}</span>
                            {item.isOverdue && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                超时
                              </span>
                            )}
                          </span>
                        </td>
                      )}

                      {/* 【新增】状态 */}
                      {visibleColumns.status && (
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            item.status === 'UNSUBMITTED' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            item.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            item.status === 'PENDING_CONFIRM' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            item.status === 'PENDING_PROPOSAL' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                            item.status === 'PENDING_AGENCY' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            item.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'UNSUBMITTED' ? 'bg-amber-600' :
                              item.status === 'PROCESSING' ? 'bg-blue-600' :
                              item.status === 'PENDING_CONFIRM' ? 'bg-amber-600' :
                              item.status === 'PENDING_PROPOSAL' ? 'bg-cyan-600' :
                              item.status === 'PENDING_AGENCY' ? 'bg-purple-600' :
                              item.status === 'ACCEPTED' ? 'bg-emerald-600' : 'bg-slate-400'
                            }`} />
                            {item.status === 'UNSUBMITTED' ? '未提交' :
                             item.status === 'PROCESSING' ? '处理中' :
                             item.status === 'PENDING_CONFIRM' ? '待确认' :
                             item.status === 'PENDING_PROPOSAL' ? '待提案' :
                             item.status === 'PENDING_AGENCY' ? '待机构处理' :
                             item.status === 'ACCEPTED' ? '已接单' : '已终止'}
                          </span>
                        </td>
                      )}

                      {/* 需求部门 */}
                      {visibleColumns.department && (
                        <td className="py-3.5 px-4 text-slate-700">
                          {item.department}
                        </td>
                      )}

                      {/* 申请人 */}
                      {visibleColumns.applicant && (
                        <td className="py-3.5 px-4 text-slate-700">
                          {item.applicant}
                        </td>
                      )}

                      {/* 申请时间 */}
                      {visibleColumns.applyTime && (
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {item.applyTime}
                        </td>
                      )}

                      {/* 操作 */}
                      {visibleColumns.actions && (
                        <td className="py-3.5 px-3 w-[180px] min-w-[180px] whitespace-nowrap text-center sticky right-0 z-10 bg-white group-hover:bg-slate-50 border-l border-slate-100 shrink-0">
                          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProposal(item);
                                setIsDetailDrawerOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                            >
                              详情
                            </button>
                            {item.status === 'UNSUBMITTED' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEditProposalDraft(item)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                                >
                                  编辑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSubmitDraftDirectly(item)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                                >
                                  提交
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDraftProposal(item.id)}
                                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-1.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                                >
                                  删除
                                </button>
                              </>
                            ) : item.status !== 'TERMINATED' ? (
                              <button
                                type="button"
                                onClick={() => setWithdrawTarget(item)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                              >
                                撤回
                              </button>
                            ) : null}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={16} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-8 h-8 text-slate-300 stroke-1" />
                        <p className="text-xs">暂无符合条件的建案申请记录</p>
                        <button
                          onClick={handleResetSearch}
                          className="text-xs text-blue-600 hover:underline mt-1 cursor-pointer"
                        >
                          清空筛选条件
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 底部分页条 */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-3 text-xs text-slate-500 bg-slate-50/20">
          <Pagination
            currentPage={currentPage}
            totalCount={filteredProposals.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. 模态框 1: 新建/编辑商标检索需求弹窗 (每行2个字段) */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-6xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 space-y-4 animate-in zoom-in-95 duration-200 max-h-[95vh] h-[92vh] flex flex-col">
            
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingProposalId ? '编辑商标检索需求（草稿）' : '新建商标检索需求'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">填写商标前置风险评估、检索查重与立项建案申报全量字段信息</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 表单主体区 (可滚动, 双列标准布局) */}
            <div className="overflow-y-auto space-y-4 pr-1.5 flex-1 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. 尼斯分类 (45类尼斯多选+搜索下拉) */}
                <div className="sm:col-span-2 space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      尼斯分类 <span className="text-rose-500">*</span>
                      <span className="text-[11px] font-normal text-slate-500 ml-1">
                        (支持关键词搜索与45全类目多选，与系统管理标准关系表实时联动)
                      </span>
                    </label>
                  </div>

                  {/* 已选尼斯分类 Chip 列表 */}
                  <div 
                    onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                    className="flex items-center justify-between gap-2 min-h-[38px] p-1.5 px-2.5 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all shadow-2xs group"
                  >
                    <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                      {selectedClassCodes.length === 0 ? (
                        <span className="text-slate-400 text-xs">请点击选择尼斯分类 (1-45类全选与搜索)...</span>
                      ) : (
                        selectedClassCodes.map(code => {
                          const item = fullNiceClassesList.find(n => n.code === code) || NICE_CLASSES_45.find(n => n.code === code);
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
                                  handleToggleClassCode(code);
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
                        {isClassDropdownOpen ? '收起' : '选择'}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isClassDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                    </div>
                  </div>

                  {/* 可展开搜索与多选面板 */}
                  {isClassDropdownOpen && (
                    <div className="mt-2 p-3 bg-white border border-blue-200 rounded-xl shadow-lg space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                      {/* 搜索栏 */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={classSearchKeyword}
                          onChange={(e) => setClassSearchKeyword(e.target.value)}
                          placeholder="搜索类别编号或关键词（如：21、洁具、牙刷、日化、软件、医疗...）"
                          className="w-full text-xs text-slate-800 pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        {classSearchKeyword && (
                          <button
                            type="button"
                            onClick={() => setClassSearchKeyword('')}
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
                              onClick={() => handleSetQuickClasses(['第21类', '第03类', '第10类'])}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
                            >
                              美齿个护 (21+03+10)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetQuickClasses(['第09类', '第35类', '第42类'])}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
                            >
                              数智电商 (09+35+42)
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSetQuickClasses([])}
                            className="text-slate-400 hover:text-rose-600 underline cursor-pointer"
                          >
                            清空已选
                          </button>
                        </div>

                      {/* 45类列表 (带 Checkbox) */}
                      <div className="max-h-52 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-1 text-xs">
                        {fullNiceClassesList.filter(item => {
                          if (!classSearchKeyword.trim()) return true;
                          const k = classSearchKeyword.trim().toLowerCase();
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
                                onChange={() => handleToggleClassCode(item.code)}
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

                {/* 1.1 类似群组 (Group) 与 1.2 商品/服务 (Goods & Services) 一行并排 */}
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 类似群组 (Group) - 联动自已选尼斯分类 */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        类似群组 <span className="text-rose-500">*</span>
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
                        商品/服务 <span className="text-rose-500">*</span>
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
                                      <span className="truncate">{it.itemNameCn}</span>
                                      {isChecked && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                      [{it.groupCode}] {it.groupName}
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

                {/* 2. 提案类型 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    提案类型 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.proposalType}
                      onChange={(e) => setNewForm({ ...newForm, proposalType: e.target.value })}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs ${
                        !newForm.proposalType ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择提案类型</option>
                      <option value="商标">商标</option>
                      <option value="专利">专利</option>
                      <option value="版权">版权</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 3. 商标名称 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    商标名称 <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={newForm.trademarkName}
                    onChange={(e) => setNewForm({ ...newForm, trademarkName: e.target.value })}
                    placeholder="请输入拟申请的商标名称（如：usmile AI SENSE PRO）" 
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-medium placeholder:text-slate-400"
                  />
                </div>

                {/* 4. 商标等级 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    商标等级 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.trademarkGrade}
                      onChange={(e) => setNewForm({ ...newForm, trademarkGrade: e.target.value })}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs ${
                        !newForm.trademarkGrade ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择商标等级</option>
                      <option value="核心级">核心级</option>
                      <option value="重要级">重要级</option>
                      <option value="一般级">一般级</option>
                      <option value="防御级">防御级</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 5. 重要等级 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    重要等级 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.importanceLevel}
                      onChange={(e) => setNewForm({ ...newForm, importanceLevel: e.target.value as any })}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs ${
                        !newForm.importanceLevel ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择重要等级</option>
                      <option value="一级">一级（核心战略）</option>
                      <option value="二级">二级（主打品类）</option>
                      <option value="三级">三级（防御布局）</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 6. 需求部门 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    需求部门 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.department}
                      onChange={(e) => setNewForm({ ...newForm, department: e.target.value })}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs ${
                        !newForm.department ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择需求部门</option>
                      <option value="品牌中心">品牌中心</option>
                      <option value="研发中心">研发中心</option>
                      <option value="产品事业部">产品事业部</option>
                      <option value="欧洲业务部">欧洲业务部</option>
                      <option value="海外业务部">海外业务部</option>
                      <option value="创新业务部">创新业务部</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 7. 申请人 (默认当前账号，不可编辑) */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700 flex items-center gap-1">
                    申请人 <span className="text-rose-500">*</span>
                    <span className="text-[11px] font-normal text-slate-400 ml-1">(当前账号 / 只读)</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      readOnly
                      disabled
                      value={newForm.applicant || '陆燕丽 (IP法务)'}
                      className="w-full text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 cursor-not-allowed select-none font-medium pr-8 shadow-2xs"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 8. 是否三维商标 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    是否三维商标 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.is3dTrademark}
                      onChange={(e) => setNewForm({ ...newForm, is3dTrademark: e.target.value })}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs ${
                        !newForm.is3dTrademark ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择是否三维商标</option>
                      <option value="否">否</option>
                      <option value="是">是</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 9. 颜色形式 & 色卡 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    颜色形式 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.colorForm.includes('指定颜色') ? '指定颜色' : newForm.colorForm}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '黑白') {
                          setNewForm({ ...newForm, colorForm: '黑白', isDesignedColorUsed: '否' });
                        } else if (val === '指定颜色') {
                          handleUpdateCustomColor(customColorHex, customColorName);
                        } else {
                          setNewForm({ ...newForm, colorForm: '', isDesignedColorUsed: '' });
                        }
                      }}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs font-medium ${
                        !newForm.colorForm ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择颜色形式</option>
                      <option value="黑白">黑白 (不指定颜色)</option>
                      <option value="指定颜色">指定颜色 (自定义颜色/色卡)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 指定颜色时展示任意颜色选择器 */}
                  {(newForm.colorForm.includes('指定颜色') || newForm.isDesignedColorUsed === '是') && (
                    <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                        <span className="flex items-center gap-1 font-semibold">
                          <Palette className="w-3.5 h-3.5 text-purple-600" />
                          自定义指定颜色:
                        </span>
                        <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          <span className="w-3 h-3 rounded-full border border-slate-300 shadow-2xs inline-block" style={{ backgroundColor: customColorHex }} />
                          {customColorHex} {customColorName ? `(${customColorName})` : ''}
                        </span>
                      </div>

                      {/* 任意颜色选择器 & 名称输入 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-1.5 px-2.5 shadow-2xs">
                          <label className="text-[11px] text-slate-500 font-medium shrink-0">色盘选择:</label>
                          <input 
                            type="color" 
                            value={customColorHex}
                            onChange={(e) => handleUpdateCustomColor(e.target.value, customColorName)}
                            className="w-6 h-6 rounded border border-slate-200 cursor-pointer p-0 bg-transparent shrink-0"
                            title="点击打开系统调色盘选择任意颜色"
                          />
                          <input 
                            type="text" 
                            value={customColorHex}
                            onChange={(e) => handleUpdateCustomColor(e.target.value, customColorName)}
                            placeholder="#2563EB"
                            className="w-full text-xs text-slate-800 font-mono font-medium focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-1.5 px-2.5 shadow-2xs">
                          <label className="text-[11px] text-slate-500 font-medium shrink-0">颜色说明:</label>
                          <input 
                            type="text" 
                            value={customColorName}
                            onChange={(e) => handleUpdateCustomColor(customColorHex, e.target.value)}
                            placeholder="如：蒂芙尼蓝、Pantone 286C"
                            className="w-full text-xs text-slate-800 font-medium focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* 快捷参考预设色卡 */}
                      <div className="space-y-1 pt-1.5 border-t border-slate-200/80">
                        <div className="text-[10px] text-slate-500 font-medium">常用品牌参考色 (点击套用):</div>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                          {BRAND_COLOR_CARDS.map(card => {
                            const isSelected = customColorHex.toLowerCase() === card.hex.toLowerCase();
                            return (
                              <button
                                key={card.id}
                                type="button"
                                onClick={() => handleUpdateCustomColor(card.hex, card.name)}
                                className={`flex items-center justify-center gap-1 p-1 rounded-md border text-[10px] transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 font-bold text-blue-900 shadow-2xs' 
                                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                                }`}
                                title={`${card.name} (${card.hex})`}
                              >
                                <span 
                                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-slate-300/80 shadow-2xs" 
                                  style={{ backgroundColor: card.hex }}
                                />
                                <span className="truncate">{card.name.slice(0, 4)}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 10. 业务类型 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    业务类型 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.businessType}
                      onChange={(e) => setNewForm({ ...newForm, businessType: e.target.value })}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs ${
                        !newForm.businessType ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择业务类型</option>
                      <option value="国内注册">国内注册</option>
                      <option value="马德里国际注册">马德里国际注册</option>
                      <option value="海外单国注册">海外单国注册</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 11. 申请类型 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    申请类型 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.applicationType}
                      onChange={(e) => setNewForm({ ...newForm, applicationType: e.target.value as any })}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs ${
                        !newForm.applicationType ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择申请类型</option>
                      <option value="一般">一般商标</option>
                      <option value="集体">集体商标</option>
                      <option value="证明">证明商标</option>
                      <option value="特殊">特殊标志</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 12. 申请地区 与 申请国家 (联动国家地区映射表) */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700 flex items-center justify-between">
                    <span>申请地区 <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">映射表</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.region}
                      onChange={(e) => {
                        const newReg = e.target.value;
                        const availableCountries = newReg ? getCountriesByRegion(newReg) : [];
                        const currentCountry = newForm.country;
                        const newCountry = availableCountries.includes(currentCountry) ? currentCountry : (availableCountries[0] || '');
                        setNewForm({ 
                          ...newForm, 
                          region: newReg,
                          country: newCountry,
                          jurisdiction: newCountry
                        });
                      }}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs font-medium ${
                        !newForm.region ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择申请地区</option>
                      {ALL_REGION_NAMES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700 flex items-center justify-between">
                    <span>申请国家 <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">映射表</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.country}
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        const detectedRegion = newCountry ? getRegionByCountry(newCountry) : '';
                        setNewForm({ 
                          ...newForm, 
                          country: newCountry,
                          region: detectedRegion || newForm.region,
                          jurisdiction: newCountry
                        });
                      }}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs font-medium ${
                        !newForm.country ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择申请国家/地区</option>
                      {(newForm.region ? getCountriesByRegion(newForm.region) : getAllMappedCountries()).map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                      {newForm.country && !(newForm.region ? getCountriesByRegion(newForm.region) : getAllMappedCountries()).includes(newForm.country) && (
                        <option value={newForm.country}>{newForm.country}</option>
                      )}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 13. 所属品牌 (使用品牌树清单数据) */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <span>所属品牌 <span className="text-rose-500">*</span></span>
                    <span className="text-[11px] text-slate-400 font-normal">(动态同步品牌树 {brandOptions.length}个)</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.brand}
                      onChange={(e) => setNewForm({ ...newForm, brand: e.target.value })}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs font-medium ${
                        !newForm.brand ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择所属品牌</option>
                      {brandOptions.map(b => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 14. 拟使用时间 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    拟使用时间 <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    value={newForm.intendedUseDate}
                    onChange={(e) => setNewForm({ ...newForm, intendedUseDate: e.target.value })}
                    className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs ${
                      !newForm.intendedUseDate ? 'text-slate-400' : 'text-slate-800 font-medium'
                    }`}
                  />
                </div>

                {/* 15. 商标来源 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    商标来源 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.trademarkSource}
                      onChange={(e) => setNewForm({ ...newForm, trademarkSource: e.target.value })}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs ${
                        !newForm.trademarkSource ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择商标来源</option>
                      <option value="自研设计">自研设计</option>
                      <option value="第三方设计">第三方设计</option>
                      <option value="外部收购">外部收购</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 16. 商标形式 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    商标形式 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.trademarkForm}
                      onChange={(e) => setNewForm({ ...newForm, trademarkForm: e.target.value as any })}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs ${
                        !newForm.trademarkForm ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择商标形式</option>
                      <option value="文字">文字</option>
                      <option value="图形">图形</option>
                      <option value="组合">组合</option>
                      <option value="声音">声音</option>
                      <option value="3D立体">3D立体</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 17. 是否使用设计颜色 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    是否使用设计颜色 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.isDesignedColorUsed}
                      onChange={(e) => setNewForm({ ...newForm, isDesignedColorUsed: e.target.value })}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs ${
                        !newForm.isDesignedColorUsed ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择是否使用设计颜色</option>
                      <option value="否">否</option>
                      <option value="是">是</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 18. 是否已注册近似商标 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    是否已注册近似商标 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.isSimilarTrademarkRegistered}
                      onChange={(e) => setNewForm({ ...newForm, isSimilarTrademarkRegistered: e.target.value })}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs ${
                        !newForm.isSimilarTrademarkRegistered ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择是否已注册近似商标</option>
                      <option value="否">否</option>
                      <option value="是">是</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 19. 代理机构类型 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    代理机构类型 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={newForm.agencyType}
                      onChange={(e) => setNewForm({ ...newForm, agencyType: e.target.value })}
                      className={`w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs ${
                        !newForm.agencyType ? 'text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="">请选择代理机构类型</option>
                      <option value="代理机构委外">代理机构委外</option>
                      <option value="自主直接申报">自主直接申报</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 20. 技术类别 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    技术类别及检索范围 <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={newForm.techCategory}
                    onChange={(e) => setNewForm({ ...newForm, techCategory: e.target.value })}
                    placeholder="请输入技术类别及检索范围（如：智能口腔算法、电机驱动控制）" 
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs placeholder:text-slate-400"
                  />
                </div>

                {/* 21. 产品领域 (跨2列) */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">
                    产品领域 <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={newForm.productDomain}
                    onChange={(e) => setNewForm({ ...newForm, productDomain: e.target.value })}
                    placeholder="请输入产品领域（如：口腔护理智能硬件、电动牙刷冲牙器）" 
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs placeholder:text-slate-400"
                  />
                </div>

                {/* 22. 需求背景与用途简述 (跨2列) */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">
                    需求背景与用途简述 <span className="text-rose-500">*</span>
                  </label>
                  <textarea 
                    rows={3}
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    placeholder="请详细描述该商标对应的新品规划、预计上市时间及海外市场扩张规划等背景说明..." 
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs resize-none placeholder:text-slate-400"
                  />
                </div>

              </div>

            </div>

            {/* 弹窗底部操作按钮组 (保存草稿 vs 保存并提交) */}
            <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 shrink-0">
              <span className="text-[11px] text-slate-400">
                保存草稿生成【未提交】记录；保存并提交生成【处理中】记录并自动推送审批中心
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors cursor-pointer shadow-2xs"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4.5 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 rounded-md transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                >
                  保存草稿
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndSubmit}
                  className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.98]"
                >
                  保存并提交
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. 模态框 2: 撤回确认弹窗 (样式精准对齐参考图) */}
      {/* ======================================================== */}
      {withdrawTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-[500px] w-full p-6 shadow-2xl relative border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            
            {/* Header: Title Centered with Top Right Close */}
            <div className="relative flex items-center justify-center pt-1">
              <h3 className="text-base font-bold text-slate-900">撤回审批</h3>
              <button 
                type="button"
                onClick={() => { setWithdrawTarget(null); setWithdrawReason(''); }} 
                className="absolute right-0 top-0 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Container Box */}
            <div className="border border-slate-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 rounded-lg p-3.5 bg-white relative">
              <textarea
                rows={4}
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value.slice(0, 1000))}
                placeholder="请输入撤回原因(必填)"
                className="w-full text-xs text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none bg-transparent min-h-[110px]"
                autoFocus
              />
              
              {/* Word counter at bottom right */}
              <div className="flex items-center justify-end text-[12px] font-mono text-slate-400 select-none pt-1">
                <span>{withdrawReason.length} / 1000</span>
              </div>
            </div>

            {/* Bottom Actions: Cancel (Gray) & Confirm (Blue) Centered */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setWithdrawTarget(null); setWithdrawReason(''); }}
                className="px-6 py-1.5 rounded-md bg-[#eef1f6] hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  handleConfirmWithdraw();
                  setWithdrawReason('');
                }}
                className="px-6 py-1.5 rounded-md bg-[#235fff] hover:bg-[#1b4edb] text-white text-xs font-medium cursor-pointer shadow-2xs transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.5. 模态框: 删除草稿确认弹窗 */}
      {/* ======================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200/90 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">确认删除该建案草稿？</h4>
                <p className="text-xs text-slate-500 mt-0.5">删除后该未提交记录将被彻底清空且无法恢复。</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">提案编号：</span>
                <span className="font-mono font-medium text-slate-800">{deleteTarget.proposalNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">商标名称：</span>
                <span className="font-bold text-slate-900">{deleteTarget.trademarkName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">申请国家：</span>
                <span className="text-slate-800">{deleteTarget.jurisdiction}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md cursor-pointer transition-colors shadow-2xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer transition-all shadow-xs active:scale-[0.98]"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.1 模态框: 必填字段校验未填写提示弹窗 */}
      {/* ======================================================== */}
      {missingFieldsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200/90 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900">
                  {missingFieldsModal.title || '提交失败：存在未填写的必填字段'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  新建商标检索需求所有字段均为必填项。请补充填写以下 <span className="font-semibold text-rose-600">{missingFieldsModal.missingFields.length}</span> 个必填字段后再进行保存或提交：
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMissingFieldsModal({ isOpen: false, missingFields: [] })}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 未填写字段列表清单 */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 max-h-56 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {missingFieldsModal.missingFields.map((field, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-rose-200 rounded-lg text-rose-700 shadow-2xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="truncate">{field}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMissingFieldsModal({ isOpen: false, missingFields: [] })}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-all shadow-xs active:scale-[0.98]"
              >
                我知道了，去填写
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. 模态框 3: 自定义列表显示字段 */}
      {/* ======================================================== */}
      {isCustomColumnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200/90 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">自定义列表表头与布局</h4>
                <p className="text-xs text-slate-400 mt-0.5">支持一屏智能合并模式（零横向滚动）与传统平铺单列模式</p>
              </div>
              <button 
                onClick={() => setIsCustomColumnModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 视图模式选择 */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
              <div className="text-xs font-semibold text-blue-900 flex items-center justify-between">
                <span>当前视图布局模式</span>
                <span className="text-[11px] font-normal text-blue-600">推荐使用智能合并模式</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('COMPOUND')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    viewMode === 'COMPOUND'
                      ? 'bg-white border-blue-500 text-blue-700 ring-2 ring-blue-500/20 font-bold shadow-xs'
                      : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">一屏智能合并（推荐）</span>
                    {viewMode === 'COMPOUND' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal leading-tight">
                    将 16 项字段归纳为 7 个复合列，适配全尺寸屏幕，免左右拉动滚动条。
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('STANDARD')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    viewMode === 'STANDARD'
                      ? 'bg-white border-blue-500 text-blue-700 ring-2 ring-blue-500/20 font-bold shadow-xs'
                      : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">传统平铺单列</span>
                    {viewMode === 'STANDARD' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal leading-tight">
                    所有字段作为独立列展开，支持超宽屏幕横向拖动查阅。
                  </p>
                </button>
              </div>
            </div>

            {/* 字段勾选列表 */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div className="text-xs font-semibold text-slate-700">
                {viewMode === 'COMPOUND' ? '智能合并列配置：' : '独立字段列配置：'}
              </div>

              {viewMode === 'COMPOUND' ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'trademarkInfo', title: '商标信息', desc: '商标名称 + 提案编号 + 商标形式' },
                    { key: 'brandAndLevel', title: '品牌与属性', desc: '品牌 + 重要等级 + 申请类型' },
                    { key: 'classesAndRegion', title: '尼斯分类与地区国家', desc: '尼斯分类 + 申请地区 / 申请国家' },
                    { key: 'currentNodeAndStatus', title: '当前节点与状态', desc: '当前节点 + 状态徽标' },
                    { key: 'handlerAndDuration', title: '处理人与停留', desc: '当前处理人 + 停留时长' },
                    { key: 'applicantAndTime', title: '提报人与时间', desc: '申请人 + 需求部门 + 申请时间' },
                    { key: 'actions', title: '操作列', desc: '详情与撤回操作' }
                  ].map(({ key, title, desc }) => (
                    <label key={key} className="flex items-start gap-2 p-2 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/40 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={visibleColumns[key as keyof typeof visibleColumns]}
                        onChange={(e) =>
                          setVisibleColumns({
                            ...visibleColumns,
                            [key]: e.target.checked
                          })
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer mt-0.5"
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block">{title}</span>
                        <span className="text-[10px] text-slate-400 leading-tight block">{desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries({
                    proposalNo: '提案编号',
                    trademarkName: '商标名称',
                    brand: '品牌',
                    classes: '尼斯分类',
                    importanceLevel: '重要等级',
                    applicationType: '申请类型',
                    region: '申请地区',
                    country: '申请国家',
                    trademarkForm: '商标形式',
                    currentNode: '当前节点',
                    currentHandler: '当前处理人',
                    dwellTime: '停留时长',
                    status: '状态',
                    department: '需求部门',
                    applicant: '申请人',
                    applyTime: '申请时间',
                    actions: '操作列'
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={visibleColumns[key as keyof typeof visibleColumns]}
                        onChange={(e) =>
                          setVisibleColumns({
                            ...visibleColumns,
                            [key]: e.target.checked
                          })
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setVisibleColumns({
                    trademarkInfo: true,
                    brandAndLevel: true,
                    classesAndRegion: true,
                    currentNodeAndStatus: true,
                    handlerAndDuration: true,
                    applicantAndTime: true,
                    proposalNo: true,
                    trademarkName: true,
                    brand: true,
                    classes: true,
                    importanceLevel: true,
                    applicationType: true,
                    region: true,
                    country: true,
                    jurisdiction: true,
                    trademarkForm: true,
                    currentNode: true,
                    currentHandler: true,
                    dwellTime: true,
                    status: true,
                    department: true,
                    applicant: true,
                    applyTime: true,
                    actions: true
                  });
                }}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                恢复默认全部勾选
              </button>
              <button
                type="button"
                onClick={() => setIsCustomColumnModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer transition-all shadow-xs active:scale-[0.98]"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. 抽屉 4: 提案详情抽屉 */}
      {/* ======================================================== */}
      {isDetailDrawerOpen && selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Top Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                  selectedProposal.status === 'ACCEPTED' ? 'bg-emerald-600 text-white' :
                  selectedProposal.status === 'PROCESSING' ? 'bg-blue-600 text-white' :
                  selectedProposal.status === 'UNSUBMITTED' ? 'bg-amber-500 text-white' :
                  selectedProposal.status === 'TERMINATED' ? 'bg-slate-500 text-white' :
                  'bg-blue-600 text-white'
                }`}>
                  {selectedProposal.status === 'ACCEPTED' ? '生效中' :
                   selectedProposal.status === 'PROCESSING' ? '处理中' :
                   selectedProposal.status === 'UNSUBMITTED' ? '未提交' :
                   selectedProposal.status === 'TERMINATED' ? '已终止' : '处理中'}
                </span>
                <h3 className="text-base font-bold text-slate-900">建案需求详情</h3>
                <div className="flex items-center gap-1.5 text-sm sm:text-base font-mono font-bold text-slate-900">
                  <span>{selectedProposal.proposalNo}</span>
                  <button
                    type="button"
                    title="复制提案编号"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedProposal.proposalNo);
                      setActionSuccessToast(`已复制提案编号: ${selectedProposal.proposalNo}`);
                      setTimeout(() => setActionSuccessToast(null), 3000);
                    }}
                    className="text-blue-600 hover:text-blue-700 p-0.5 rounded cursor-pointer transition-colors flex items-center justify-center"
                  >
                    <Copy className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsDetailDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
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
                onClick={() => setDetailTab('approval')}
                className={`py-3 font-medium cursor-pointer border-b-2 transition-all ${
                  detailTab === 'approval'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                审批信息
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
                  
                  {/* 1. 商标与使用信息 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>商标与使用信息</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-2.5 py-1">
                      <div>
                        <span className="text-slate-500">提案类型：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.proposalType || '商标'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">商标名称：</span>
                        <span className="text-slate-900 font-bold">{selectedProposal.trademarkName}</span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">尼斯分类：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.classes || '-'}</span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">类似群组：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.similarGroups || '-'}</span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">商品/服务：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.goodsServices || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">商标等级：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.trademarkGrade || '核心级'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">重要等级：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.importanceLevel}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">商标形式：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.trademarkForm}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">商标来源：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.trademarkSource || '自研设计'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">是否三维商标：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.is3dTrademark || '否'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">颜色形式：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.colorForm || '黑白 (不指定颜色)'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">是否使用设计颜色：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.isDesignedColorUsed || '否'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">是否已注册近似商标：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.isSimilarTrademarkRegistered || '否'}</span>
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
                        <span className="text-slate-900 font-medium">{selectedProposal.businessType || '国内注册'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请类型：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.applicationType || '一般'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请地区：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.region || getRegionByCountry(selectedProposal.country || selectedProposal.jurisdiction)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请国家：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.country || selectedProposal.jurisdiction}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">所属品牌：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.brand}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">拟使用时间：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedProposal.intendedUseDate || '2026-09-01'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">代理机构类型：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.agencyType || '代理机构委外'}</span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">技术类别及检索范围：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.techCategory || '智能口腔算法、电机驱动控制'}</span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-slate-500">产品领域：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.productDomain || '口腔护理智能硬件、电动牙刷冲牙器'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. 需求背景与用途简述 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-2 border-slate-800 pl-2">
                      <span>需求背景与用途简述</span>
                    </h4>
                    <div className="py-1 text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedProposal.description || '新建电动牙刷智能系列商标检索与建案需求，向法务申请排查在先商标风险及建案。'}
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
                        <span className="text-slate-900 font-medium">{selectedProposal.applicant || '陆燕丽'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">申请时间：</span>
                        <span className="font-mono text-slate-900 font-medium">{selectedProposal.applyTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">需求部门：</span>
                        <span className="text-slate-900 font-medium">{selectedProposal.department || '研发中心'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {detailTab === 'approval' && (
                <div>
                  {(() => {
                    const isTriggered = selectedProposal.status !== 'UNSUBMITTED';
                    if (!isTriggered) {
                      return (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                          <FileText className="w-10 h-10 text-slate-300 stroke-1" />
                          <span className="text-xs font-semibold text-slate-500">未触发审批</span>
                          <span className="text-[11px] text-slate-400">当前建案需求为未提交状态，暂无审批记录</span>
                        </div>
                      );
                    }

                    const records = getProposalApprovalRecords(selectedProposal);

                    return (
                      <div className="space-y-6">
                        {/* 顶栏信息 */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                              <span>当前流转节点：{selectedProposal.status === 'ACCEPTED' ? '全流程归档完成' : (selectedProposal.currentNode || '审批流转中')}</span>
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              {selectedProposal.status === 'PROCESSING' ? '处理中' : selectedProposal.status === 'ACCEPTED' ? '已通过并归档' : selectedProposal.status === 'TERMINATED' ? '已终止' : '审批流转中'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200/60 text-xs">
                            <div>
                              <span className="text-slate-400">当前处理人：</span>
                              <span className="font-medium text-slate-800 ml-1">{selectedProposal.currentHandler || selectedProposal.applicant}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">节点停留时长：</span>
                              <span className="font-mono font-medium text-slate-800 ml-1">{selectedProposal.dwellTime || '3小时'}</span>
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

                                  {/* 卡片容器：框选 审批人、职务/角色、所属部门、节点停留 及 审批意见 */}
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

                                    {/* 签署/审批意见（包含在同一卡片内） */}
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
                          <td className="py-2.5 px-3.5 font-mono">{selectedProposal.applyTime}</td>
                          <td className="py-2.5 px-3.5 font-medium">{selectedProposal.applicant}</td>
                          <td className="py-2.5 px-3.5 text-blue-600 font-medium">保存并提交需求</td>
                          <td className="py-2.5 px-3.5 text-slate-500">生成提案单据 {selectedProposal.proposalNo} 并推送到【审批中心】</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-3.5 font-mono">{selectedProposal.applyTime}</td>
                          <td className="py-2.5 px-3.5 font-medium">工作流系统</td>
                          <td className="py-2.5 px-3.5 text-emerald-600 font-medium">智能审批推流</td>
                          <td className="py-2.5 px-3.5 text-slate-500">已将任务成功指派给当前节点【{selectedProposal.currentNode || '需求部门主管复核'}】</td>
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