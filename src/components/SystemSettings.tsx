import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Building2, 
  Briefcase,
  Globe,
  FileSpreadsheet,
  AlertCircle,
  Download,
  Upload,
  RotateCcw,
  Layers,
  Table as TableIcon,
  CheckCircle2,
  Filter,
  ChevronRight,
  Users,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { NiceClassificationMappingView } from './NiceClassificationMappingView';

export interface TrademarkStakeholderItem {
  id: string;
  businessOwner: string;
  businessOwnerDept: string;
  supervisor: string;
  keyUsers: string[];
  updatedAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const INITIAL_STAKEHOLDERS: TrademarkStakeholderItem[] = [
  {
    id: 'stk-1',
    businessOwner: '林泽鹏',
    businessOwnerDept: '知识产权部 / IP管理组',
    supervisor: '陈瑞 (法务合规VP)',
    keyUsers: ['张微', '刘亚南', '赵晨', '周婷婷'],
    updatedAt: '2026-08-28 14:30',
    status: 'ACTIVE'
  },
  {
    id: 'stk-2',
    businessOwner: '王艺婷',
    businessOwnerDept: '品牌策略部 / 资产全景组',
    supervisor: '林泽鹏 (IP高级经理)',
    keyUsers: ['孙立', '郭铭', '李思琦'],
    updatedAt: '2026-08-25 10:15',
    status: 'ACTIVE'
  },
  {
    id: 'stk-3',
    businessOwner: '许一鸣',
    businessOwnerDept: '知识产权部 / 专利商标申请组',
    supervisor: '林泽鹏 (IP高级经理)',
    keyUsers: ['郑凯', '黄静', '陈海波'],
    updatedAt: '2026-08-20 16:45',
    status: 'ACTIVE'
  },
  {
    id: 'stk-4',
    businessOwner: '赵龙',
    businessOwnerDept: '法务维权部 / 打假专班',
    supervisor: '陈瑞 (法务合规VP)',
    keyUsers: ['钱威', '孙强', '吴大伟'],
    updatedAt: '2026-08-18 11:20',
    status: 'ACTIVE'
  },
  {
    id: 'stk-5',
    businessOwner: '张微',
    businessOwnerDept: '知识产权部 / 监测风险防护组',
    supervisor: '林泽鹏 (IP高级经理)',
    keyUsers: ['许一鸣', '周婷婷', '郭铭'],
    updatedAt: '2026-08-15 09:30',
    status: 'ACTIVE'
  },
  {
    id: 'stk-6',
    businessOwner: '马丽',
    businessOwnerDept: '法务运营部 / 涉外律所管理组',
    supervisor: '许一鸣 (商标申请主管)',
    keyUsers: ['郑凯', '外部代理人代表'],
    updatedAt: '2026-08-10 15:00',
    status: 'ACTIVE'
  },
  {
    id: 'stk-7',
    businessOwner: '陈瑞',
    businessOwnerDept: '法务合规部',
    supervisor: '集团管理委员会',
    keyUsers: ['林泽鹏', '许一鸣', '马丽'],
    updatedAt: '2026-08-01 17:00',
    status: 'ACTIVE'
  }
];
import { SystemSettingsSubTab, UserProfile } from '../types';
import { 
  ApplicantMappingItem, 
  AgencyMappingItem,
  CountryRegionMappingItem,
  ALL_REGION_NAMES,
  getApplicantMappings,
  saveApplicantMappings,
  getAgencyMappings,
  saveAgencyMappings,
  getCountryRegionMappings,
  saveCountryRegionMappings,
  resetCountryRegionMappings,
  subscribeMappingChanges
} from '../lib/mappingStore';

interface SystemSettingsProps {
  currentUser: UserProfile;
  activeSubTab?: SystemSettingsSubTab;
  onSubTabChange?: (tab: SystemSettingsSubTab) => void;
}

const SECONDARY_MENU_TABS = [
  { 
    id: 'COUNTRY_REGION_MAPPING' as SystemSettingsSubTab, 
    label: '国家地区映射表', 
    desc: '全球各区域与国家代码联动', 
    icon: Globe,
    badge: '199+ 国家'
  },
  { 
    id: 'APPLICANT_MAPPING' as SystemSettingsSubTab, 
    label: '申请人主体映射表', 
    desc: '中英文主体及官方地址库', 
    icon: Building2,
    badge: '集团主体'
  },
  { 
    id: 'AGENCY_MAPPING' as SystemSettingsSubTab, 
    label: '承办代理机构映射表', 
    desc: '合作律所、案号前缀与代理人', 
    icon: Briefcase,
    badge: '律所协同'
  },
  { 
    id: 'TRADEMARK_STAKEHOLDERS' as SystemSettingsSubTab, 
    label: '商标看板人员维护表', 
    desc: '业务负责人、上级主管及关键用户配置', 
    icon: Users,
    badge: '责任矩阵'
  },
  { 
    id: 'NICE_CLASSIFICATION_MAPPING' as SystemSettingsSubTab, 
    label: '商标分类与类群组与商品/服务项目的关系表', 
    desc: '尼斯分类1-45类、类似群组及商品/服务规范项目关系维护', 
    icon: Layers,
    badge: '45类尼斯分类'
  },
];

export const SystemSettings: React.FC<SystemSettingsProps> = ({ 
  currentUser,
  activeSubTab,
  onSubTabChange
}) => {
  const [internalTab, setInternalTab] = useState<SystemSettingsSubTab>('COUNTRY_REGION_MAPPING');
  const activeTab = activeSubTab || internalTab;

  const handleTabSelect = (tabId: SystemSettingsSubTab) => {
    setInternalTab(tabId);
    onSubTabChange?.(tabId);
  };

  // Mapping states
  const [applicantItems, setApplicantItems] = useState<ApplicantMappingItem[]>([]);
  const [agencyItems, setAgencyItems] = useState<AgencyMappingItem[]>([]);
  const [countryRegionItems, setCountryRegionItems] = useState<CountryRegionMappingItem[]>([]);

  // Search states
  const [applicantSearch, setApplicantSearch] = useState('');
  const [agencySearch, setAgencySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('ALL');
  const [countryViewMode, setCountryViewMode] = useState<'TABLE' | 'GROUPED'>('TABLE');

  // Toast / feedback message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal / Editing states for Applicant Mapping
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<ApplicantMappingItem | null>(null);
  const [applicantForm, setApplicantForm] = useState<Omit<ApplicantMappingItem, 'id'>>({
    applicant: '',
    applicantEn: '',
    applicantAddress: '',
    applicantAddressEn: ''
  });

  // Modal / Editing states for Agency Mapping
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<AgencyMappingItem | null>(null);
  const [agencyForm, setAgencyForm] = useState<Omit<AgencyMappingItem, 'id'>>({
    agencyName: '',
    agencyDocketNo: '',
    agentName: ''
  });

  // Modal / Editing states for Country Region Mapping
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryRegionMappingItem | null>(null);
  const [countryForm, setCountryForm] = useState<{ region: string; country: string; code?: string }>({
    region: '大中华地区',
    country: '',
    code: ''
  });

  // Stakeholder Maintenance State & Effects
  const [stakeholders, setStakeholders] = useState<TrademarkStakeholderItem[]>(() => {
    try {
      const saved = localStorage.getItem('usmile_trademark_stakeholders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STAKEHOLDERS;
  });
  const [stakeholderSearch, setStakeholderSearch] = useState('');
  const [isStakeholderModalOpen, setIsStakeholderModalOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<TrademarkStakeholderItem | null>(null);
  const [stakeholderForm, setStakeholderForm] = useState({
    businessOwner: '',
    businessOwnerDept: '',
    supervisor: '',
    keyUsersInput: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  useEffect(() => {
    try {
      localStorage.setItem('usmile_trademark_stakeholders', JSON.stringify(stakeholders));
    } catch (e) {
      console.error(e);
    }
  }, [stakeholders]);

  const filteredStakeholders = useMemo(() => {
    if (!stakeholderSearch.trim()) return stakeholders;
    const q = stakeholderSearch.toLowerCase().trim();
    return stakeholders.filter(item => 
      item.businessOwner.toLowerCase().includes(q) ||
      item.businessOwnerDept.toLowerCase().includes(q) ||
      item.supervisor.toLowerCase().includes(q) ||
      item.keyUsers.some(u => u.toLowerCase().includes(q))
    );
  }, [stakeholders, stakeholderSearch]);

  const handleOpenAddStakeholder = () => {
    setEditingStakeholder(null);
    setStakeholderForm({
      businessOwner: '',
      businessOwnerDept: '',
      supervisor: '',
      keyUsersInput: '',
      status: 'ACTIVE'
    });
    setIsStakeholderModalOpen(true);
  };

  const handleOpenEditStakeholder = (item: TrademarkStakeholderItem) => {
    setEditingStakeholder(item);
    setStakeholderForm({
      businessOwner: item.businessOwner,
      businessOwnerDept: item.businessOwnerDept,
      supervisor: item.supervisor,
      keyUsersInput: item.keyUsers.join('、'),
      status: item.status
    });
    setIsStakeholderModalOpen(true);
  };

  const handleSaveStakeholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeholderForm.businessOwner.trim()) {
      showToast('请填写业务负责人', 'error');
      return;
    }

    const keyUsersArray = stakeholderForm.keyUsersInput
      .split(/[,，\n\s、]/)
      .map(s => s.trim())
      .filter(Boolean);

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    if (editingStakeholder) {
      const updated = stakeholders.map(s => s.id === editingStakeholder.id ? {
        ...s,
        businessOwner: stakeholderForm.businessOwner.trim(),
        businessOwnerDept: stakeholderForm.businessOwnerDept.trim(),
        supervisor: stakeholderForm.supervisor.trim(),
        keyUsers: keyUsersArray,
        status: stakeholderForm.status,
        updatedAt: nowStr
      } : s);
      setStakeholders(updated);
      showToast(`更新人员【${stakeholderForm.businessOwner}】配置成功`);
    } else {
      const newItem: TrademarkStakeholderItem = {
        id: 'stk-' + Date.now(),
        businessOwner: stakeholderForm.businessOwner.trim(),
        businessOwnerDept: stakeholderForm.businessOwnerDept.trim() || '知识产权部',
        supervisor: stakeholderForm.supervisor.trim() || '主管未指定',
        keyUsers: keyUsersArray,
        status: stakeholderForm.status,
        updatedAt: nowStr
      };
      setStakeholders([newItem, ...stakeholders]);
      showToast(`新增人员【${stakeholderForm.businessOwner}】配置成功`);
    }

    setIsStakeholderModalOpen(false);
  };

  const handleDeleteStakeholder = (id: string, businessOwner: string) => {
    if (confirm(`确定要删除人员【${businessOwner}】的人员配置关系吗？`)) {
      setStakeholders(prev => prev.filter(s => s.id !== id));
      showToast(`已删除【${businessOwner}】人员配置`);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Load mappings and subscribe to changes
  useEffect(() => {
    const refreshData = () => {
      setApplicantItems(getApplicantMappings());
      setAgencyItems(getAgencyMappings());
      setCountryRegionItems(getCountryRegionMappings());
    };
    refreshData();
    const unsubscribe = subscribeMappingChanges(refreshData);
    return () => unsubscribe();
  }, []);

  // Handler for saving Applicant Mapping
  const handleSaveApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantForm.applicant.trim()) {
      showToast('请填写申请人主体名称', 'error');
      return;
    }

    if (editingApplicant) {
      const updated = applicantItems.map(item => 
        item.id === editingApplicant.id ? { ...item, ...applicantForm } : item
      );
      saveApplicantMappings(updated);
      showToast(`成功更新申请人主体【${applicantForm.applicant}】`);
    } else {
      const newItem: ApplicantMappingItem = {
        id: 'app-' + Date.now(),
        ...applicantForm
      };
      saveApplicantMappings([newItem, ...applicantItems]);
      showToast(`成功新增申请人主体【${applicantForm.applicant}】`);
    }

    setIsApplicantModalOpen(false);
    setEditingApplicant(null);
    setApplicantForm({ applicant: '', applicantEn: '', applicantAddress: '', applicantAddressEn: '' });
  };

  // Handler for deleting Applicant Mapping
  const handleDeleteApplicant = (id: string, name: string) => {
    if (confirm(`确定要删除申请人主体【${name}】的映射配置吗？`)) {
      const updated = applicantItems.filter(item => item.id !== id);
      saveApplicantMappings(updated);
      showToast(`已删除申请人主体【${name}】`);
    }
  };

  // Handler for saving Agency Mapping
  const handleSaveAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyForm.agencyName.trim()) {
      showToast('请填写承办代理机构名称', 'error');
      return;
    }

    if (editingAgency) {
      const updated = agencyItems.map(item => 
        item.id === editingAgency.id ? { ...item, ...agencyForm } : item
      );
      saveAgencyMappings(updated);
      showToast(`成功更新代理机构【${agencyForm.agencyName}】`);
    } else {
      const newItem: AgencyMappingItem = {
        id: 'agency-' + Date.now(),
        ...agencyForm
      };
      saveAgencyMappings([newItem, ...agencyItems]);
      showToast(`成功新增代理机构【${agencyForm.agencyName}】`);
    }

    setIsAgencyModalOpen(false);
    setEditingAgency(null);
    setAgencyForm({ agencyName: '', agencyDocketNo: '', agentName: '' });
  };

  // Handler for deleting Agency Mapping
  const handleDeleteAgency = (id: string, name: string) => {
    if (confirm(`确定要删除承办代理机构【${name}】的映射配置吗？`)) {
      const updated = agencyItems.filter(item => item.id !== id);
      saveAgencyMappings(updated);
      showToast(`已删除代理机构【${name}】`);
    }
  };

  // Handler for saving Country Region Mapping
  const handleSaveCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryForm.region.trim() || !countryForm.country.trim()) {
      showToast('请完整填写国家地区（大区）与国家名称', 'error');
      return;
    }

    if (editingCountry) {
      const updated = countryRegionItems.map(item =>
        item.id === editingCountry.id ? { ...item, ...countryForm } : item
      );
      saveCountryRegionMappings(updated);
      showToast(`已更新国家映射：${countryForm.region} - ${countryForm.country}`);
    } else {
      // 检查重复
      const exists = countryRegionItems.some(
        c => c.region === countryForm.region && c.country.toLowerCase() === countryForm.country.trim().toLowerCase()
      );
      if (exists) {
        showToast(`【${countryForm.region}】下已存在【${countryForm.country}】`, 'error');
        return;
      }
      const newItem: CountryRegionMappingItem = {
        id: 'cr-' + Date.now(),
        region: countryForm.region.trim(),
        country: countryForm.country.trim(),
        code: countryForm.code?.trim() || undefined
      };
      saveCountryRegionMappings([...countryRegionItems, newItem]);
      showToast(`已新增国家地区映射：${countryForm.region} - ${countryForm.country}`);
    }

    setIsCountryModalOpen(false);
    setEditingCountry(null);
    setCountryForm({ region: '大中华地区', country: '', code: '' });
  };

  // Handler for deleting Country Region Mapping
  const handleDeleteCountry = (id: string, region: string, country: string) => {
    if (confirm(`确定要从【${region}】中删除国家【${country}】的映射吗？`)) {
      const updated = countryRegionItems.filter(item => item.id !== id);
      saveCountryRegionMappings(updated);
      showToast(`已删除：${region} - ${country}`);
    }
  };

  // Export CSV
  const handleExportCountryCSV = () => {
    const header = '国家地区,国家\n';
    const rows = countryRegionItems
      .map(item => `"${item.region.replace(/"/g, '""')}","${item.country.replace(/"/g, '""')}"`)
      .join('\n');
    const csvContent = '\uFEFF' + header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `国家地区映射表_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`成功导出 ${countryRegionItems.length} 条国家地区映射配置`);
  };

  // Import CSV
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        const lines = text.split(/\r\n|\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          showToast('CSV文件格式不正确或无有效数据', 'error');
          return;
        }

        const newItems: CountryRegionMappingItem[] = [];
        // Skip header if it contains '国家地区' or 'Region'
        const startIndex = lines[0].includes('国家地区') || lines[0].toLowerCase().includes('region') ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const rawLine = lines[i];
          const parts = rawLine.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
          if (parts.length >= 2 && parts[0] && parts[1]) {
            newItems.push({
              id: 'cr-import-' + i + '-' + Date.now(),
              region: parts[0],
              country: parts[1]
            });
          }
        }

        if (newItems.length === 0) {
          showToast('未能解析出有效的国家地区映射条目', 'error');
          return;
        }

        saveCountryRegionMappings(newItems);
        showToast(`成功导入 ${newItems.length} 条国家地区映射`);
      } catch (err) {
        console.error(err);
        showToast('导入失败，请检查CSV格式', 'error');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (confirm('确定要重置并恢复系统官方预置的国家地区映射表（11个大区/199个国家地区）吗？')) {
      const reset = resetCountryRegionMappings();
      setCountryRegionItems(reset);
      showToast('已成功恢复系统默认的 199 条国家地区映射配置');
    }
  };

  // Filtered lists
  const filteredApplicants = applicantItems.filter(item => 
    item.applicant.toLowerCase().includes(applicantSearch.toLowerCase()) ||
    item.applicantEn.toLowerCase().includes(applicantSearch.toLowerCase()) ||
    item.applicantAddress.toLowerCase().includes(applicantSearch.toLowerCase())
  );

  const filteredAgencies = agencyItems.filter(item => 
    item.agencyName.toLowerCase().includes(agencySearch.toLowerCase()) ||
    item.agencyDocketNo.toLowerCase().includes(agencySearch.toLowerCase()) ||
    item.agentName.toLowerCase().includes(agencySearch.toLowerCase())
  );

  // Filtered Country Regions
  const filteredCountryRegions = useMemo(() => {
    return countryRegionItems.filter(item => {
      const matchSearch = 
        item.region.toLowerCase().includes(countrySearch.toLowerCase()) ||
        item.country.toLowerCase().includes(countrySearch.toLowerCase());
      const matchRegion = selectedRegionFilter === 'ALL' || item.region === selectedRegionFilter;
      return matchSearch && matchRegion;
    });
  }, [countryRegionItems, countrySearch, selectedRegionFilter]);

  // Grouped by region
  const groupedByRegion = useMemo(() => {
    const map: Record<string, CountryRegionMappingItem[]> = {};
    ALL_REGION_NAMES.forEach(r => { map[r] = []; });
    
    countryRegionItems.forEach(item => {
      if (!map[item.region]) {
        map[item.region] = [];
      }
      map[item.region].push(item);
    });
    return map;
  }, [countryRegionItems]);

  // Region Badge Color Helper
  const getRegionBadgeStyle = (region: string) => {
    switch (region) {
      case '大中华地区':
        return 'bg-red-50 text-red-700 border-red-200';
      case '东亚':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '南亚':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '东南亚':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '西亚':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case '中亚':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case '欧洲':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case '北美洲':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case '南美洲':
        return 'bg-lime-50 text-lime-800 border-lime-200';
      case '大洋洲':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case '非洲':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback (Screen Centered) */}
      {feedback && (
        <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl border-2 flex items-center gap-3 text-sm font-bold backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50/95 text-emerald-900 border-emerald-300 shadow-emerald-900/15' 
            : 'bg-rose-50/95 text-rose-900 border-rose-300 shadow-rose-900/15'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Secondary Menu Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">系统管理</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              {SECONDARY_MENU_TABS.find(t => t.id === activeTab)?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Tab 1: 国家地区映射表 (仅保留列表模块) */}
      {activeTab === 'COUNTRY_REGION_MAPPING' && (
        <div className="bg-white rounded-2xl p-5 space-y-4 border border-slate-200/80 shadow-xs">
          {/* Header & Toolbars */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>国家地区映射表</span>
                <span className="text-xs font-normal text-slate-500">({filteredCountryRegions.length}条匹配 / 共{countryRegionItems.length}条)</span>
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索国家地区/大区/国家..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-52 focus:outline-none focus:border-blue-500"
                />
                {countrySearch && (
                  <button 
                    onClick={() => setCountrySearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Actions: Export / Import / Reset / Add */}
              <button
                type="button"
                onClick={handleExportCountryCSV}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                title="导出当前国家地区映射为CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>导出CSV</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportCSV}
                accept=".csv"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                title="批量导入CSV映射文件"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>导入</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                title="恢复官方预置199项国家映射"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>恢复预置</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingCountry(null);
                  setCountryForm({ region: '大中华地区', country: '', code: '' });
                  setIsCountryModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增国家映射</span>
              </button>
            </div>
          </div>

          {/* Region Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> 大区筛选:
            </span>
            <button
              type="button"
              onClick={() => setSelectedRegionFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedRegionFilter === 'ALL'
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部 ({countryRegionItems.length})
            </button>
            {ALL_REGION_NAMES.map((r) => {
              const count = groupedByRegion[r]?.length || 0;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRegionFilter(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 ${
                    selectedRegionFilter === r
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{r}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedRegionFilter === r ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 国家地区映射列表表格 */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white max-h-[680px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-4 w-16 text-center text-slate-400 font-mono">序号</th>
                  <th className="py-2.5 px-4 w-48 font-bold text-blue-900 bg-blue-50/50 border-r border-slate-200">国家地区</th>
                  <th className="py-2.5 px-4 font-bold text-slate-900">国家</th>
                  <th className="py-2.5 px-4 w-32 text-center">映射状态</th>
                  <th className="py-2.5 px-4 text-right w-24">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCountryRegions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      暂无匹配的国家地区映射记录
                    </td>
                  </tr>
                ) : (
                  filteredCountryRegions.map((item, index) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-4 border-r border-slate-100 bg-slate-50/30 font-medium">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getRegionBadgeStyle(item.region)}`}>
                          {item.region}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900 text-sm">
                        {item.country}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                          <Check className="w-3 h-3" />
                          已生效
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-1.5 opacity-90 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCountry(item);
                            setCountryForm({
                              region: item.region,
                              country: item.country,
                              code: item.code || ''
                            });
                            setIsCountryModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer rounded hover:bg-slate-100"
                          title="编辑映射"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCountry(item.id, item.region, item.country)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer rounded hover:bg-slate-100"
                          title="删除映射"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: 申请人主体映射表 (仅保留列表模块) */}
      {activeTab === 'APPLICANT_MAPPING' && (
        <div className="bg-white rounded-2xl p-5 space-y-4 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>申请人主体映射表</span>
                <span className="text-xs font-normal text-slate-500">({filteredApplicants.length}条配置)</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索主体名称/英文/地址..."
                  value={applicantSearch}
                  onChange={(e) => setApplicantSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-52 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingApplicant(null);
                  setApplicantForm({ applicant: '', applicantEn: '', applicantAddress: '', applicantAddressEn: '' });
                  setIsApplicantModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增申请人映射</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5 w-1/5">申请人主体</th>
                  <th className="py-2.5 px-3.5 w-1/5">申请人英文</th>
                  <th className="py-2.5 px-3.5 w-1/4">申请人地址</th>
                  <th className="py-2.5 px-3.5 w-1/4">申请人地址英文</th>
                  <th className="py-2.5 px-3.5 text-right w-24">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      暂无匹配的申请人主体映射数据
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 font-semibold text-slate-900">{item.applicant}</td>
                      <td className="py-3 px-3.5 text-slate-600 font-mono text-[11px]">{item.applicantEn || '-'}</td>
                      <td className="py-3 px-3.5 text-slate-600 leading-relaxed">{item.applicantAddress || '-'}</td>
                      <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px] leading-relaxed">{item.applicantAddressEn || '-'}</td>
                      <td className="py-3 px-3.5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingApplicant(item);
                            setApplicantForm({
                              applicant: item.applicant,
                              applicantEn: item.applicantEn,
                              applicantAddress: item.applicantAddress,
                              applicantAddressEn: item.applicantAddressEn
                            });
                            setIsApplicantModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer rounded hover:bg-slate-100"
                          title="编辑映射"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteApplicant(item.id, item.applicant)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer rounded hover:bg-slate-100"
                          title="删除映射"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: 承办代理机构映射表 (仅保留列表模块) */}
      {activeTab === 'AGENCY_MAPPING' && (
        <div className="bg-white rounded-2xl p-5 space-y-4 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>承办代理机构映射表</span>
                <span className="text-xs font-normal text-slate-500">({filteredAgencies.length}条配置)</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索代理机构/案卷号/代理人..."
                  value={agencySearch}
                  onChange={(e) => setAgencySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-52 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingAgency(null);
                  setAgencyForm({ agencyName: '', agencyDocketNo: '', agentName: '' });
                  setIsAgencyModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增代理机构映射</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5 w-2/5">承办代理机构</th>
                  <th className="py-2.5 px-3.5 w-1/4">默认代理机构案卷号</th>
                  <th className="py-2.5 px-3.5 w-1/4">指定代理人</th>
                  <th className="py-2.5 px-3.5 text-right w-24">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAgencies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      暂无匹配的代理机构映射数据
                    </td>
                  </tr>
                ) : (
                  filteredAgencies.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 font-semibold text-slate-900">{item.agencyName}</td>
                      <td className="py-3 px-3.5 text-slate-700 font-mono text-[11px] font-bold">{item.agencyDocketNo || '-'}</td>
                      <td className="py-3 px-3.5 text-slate-700 font-medium">{item.agentName || '-'}</td>
                      <td className="py-3 px-3.5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAgency(item);
                            setAgencyForm({
                              agencyName: item.agencyName,
                              agencyDocketNo: item.agencyDocketNo,
                              agentName: item.agentName
                            });
                            setIsAgencyModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer rounded hover:bg-slate-100"
                          title="编辑映射"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAgency(item.id, item.agencyName)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer rounded hover:bg-slate-100"
                          title="删除映射"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: 商标看板人员维护表 (仅保留列表模块) */}
      {activeTab === 'TRADEMARK_STAKEHOLDERS' && (
        <div className="bg-white rounded-2xl p-5 space-y-4 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>商标看板人员维护表</span>
                <span className="text-xs font-normal text-slate-500">
                  ({filteredStakeholders.length}条匹配 / 共{stakeholders.length}条)
                </span>
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索业务负责人/部门/主管/关键用户..."
                  value={stakeholderSearch}
                  onChange={(e) => setStakeholderSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-64 focus:outline-none focus:border-blue-500"
                />
                {stakeholderSearch && (
                  <button
                    onClick={() => setStakeholderSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleOpenAddStakeholder}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增人员对应关系</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-xl bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-4 min-w-[160px]">业务负责人</th>
                  <th className="py-3 px-4 min-w-[150px]">上级主管</th>
                  <th className="py-3 px-4 min-w-[200px]">关键用户 (Key Users)</th>
                  <th className="py-3 px-4 whitespace-nowrap">更新时间</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">状态</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredStakeholders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      未找到匹配的人员配置数据
                    </td>
                  </tr>
                ) : (
                  filteredStakeholders.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span>{item.businessOwner}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.businessOwnerDept}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{item.supervisor}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.keyUsers.map((user, uIdx) => (
                            <span
                              key={uIdx}
                              className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[11px] font-medium"
                            >
                              {user}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {item.updatedAt}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.status === 'ACTIVE' ? '正常' : '已停用'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditStakeholder(item)}
                            className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100 transition-colors"
                            title="编辑人员映射"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStakeholder(item.id, item.businessOwner)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                            title="删除配置"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: 商标分类与类群组与商品/服务项目的关系表 */}
      {activeTab === 'NICE_CLASSIFICATION_MAPPING' && (
        <NiceClassificationMappingView onShowToast={showToast} />
      )}



      {/* Modal: 商标看板人员维护编辑/新增 */}
      {isStakeholderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{editingStakeholder ? '编辑商标看板人员配置' : '新增商标看板人员配置'}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsStakeholderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStakeholder} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    业务负责人 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如：林泽鹏"
                    value={stakeholderForm.businessOwner}
                    onChange={(e) => setStakeholderForm({ ...stakeholderForm, businessOwner: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">所属部门</label>
                  <input
                    type="text"
                    placeholder="如：知识产权部 / IP管理组"
                    value={stakeholderForm.businessOwnerDept}
                    onChange={(e) => setStakeholderForm({ ...stakeholderForm, businessOwnerDept: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">上级主管</label>
                <input
                  type="text"
                  placeholder="如：陈瑞 (法务合规VP)"
                  value={stakeholderForm.supervisor}
                  onChange={(e) => setStakeholderForm({ ...stakeholderForm, supervisor: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  关键用户 (Key Users) <span className="text-slate-400 font-normal">多人在顿号/逗号隔开</span>
                </label>
                <input
                  type="text"
                  placeholder="如：张微、刘亚南、赵晨"
                  value={stakeholderForm.keyUsersInput}
                  onChange={(e) => setStakeholderForm({ ...stakeholderForm, keyUsersInput: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">状态</label>
                <select
                  value={stakeholderForm.status}
                  onChange={(e) => setStakeholderForm({ ...stakeholderForm, status: e.target.value as any })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="ACTIVE">正常启用</option>
                  <option value="INACTIVE">暂停停用</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStakeholderModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs"
                >
                  保存人员配置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: 国家地区映射编辑/新增 */}
      {isCountryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>{editingCountry ? '编辑国家地区映射' : '新增国家地区映射'}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsCountryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCountry} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  所属国家地区（大区 / 大洲） <span className="text-rose-500">*</span>
                </label>
                <select
                  value={countryForm.region}
                  onChange={(e) => setCountryForm({ ...countryForm, region: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-medium"
                >
                  {ALL_REGION_NAMES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">如：大中华地区、东亚、南亚、东南亚、西亚、欧洲、北美洲等</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  国家 / 地区名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="如：德国-欧盟、新加坡、加拿大..."
                  value={countryForm.country}
                  onChange={(e) => setCountryForm({ ...countryForm, country: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  国家代码 / 缩写 (可选)
                </label>
                <input
                  type="text"
                  placeholder="如：SG, US, DE, CN..."
                  value={countryForm.code || ''}
                  onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value })}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCountryModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs"
                >
                  保存配置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: 申请人主体映射编辑/新增 */}
      {isApplicantModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>{editingApplicant ? '编辑申请人主体映射' : '新增申请人主体映射'}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsApplicantModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApplicant} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  申请人主体名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="如：广州星际悦动股份有限公司"
                  value={applicantForm.applicant}
                  onChange={(e) => setApplicantForm({ ...applicantForm, applicant: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">申请人英文 (Applicant Name En)</label>
                <input
                  type="text"
                  placeholder="如：Guangzhou Starfield Delight Co., Ltd."
                  value={applicantForm.applicantEn}
                  onChange={(e) => setApplicantForm({ ...applicantForm, applicantEn: e.target.value })}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">申请人中文官方地址</label>
                <input
                  type="text"
                  placeholder="如：广东省广州市天河区珠江东路28号越秀金融大厦38层"
                  value={applicantForm.applicantAddress}
                  onChange={(e) => setApplicantForm({ ...applicantForm, applicantAddress: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">申请人英文官方地址 (Address En)</label>
                <textarea
                  rows={2}
                  placeholder="如：38/F, Yuexiu Financial Tower, No.28 Zhujiang East Road, Tianhe District, Guangzhou, Guangdong, China"
                  value={applicantForm.applicantAddressEn}
                  onChange={(e) => setApplicantForm({ ...applicantForm, applicantAddressEn: e.target.value })}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApplicantModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs"
                >
                  保存映射
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: 承办代理机构映射编辑/新增 */}
      {isAgencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>{editingAgency ? '编辑承办代理机构映射' : '新增承办代理机构映射'}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsAgencyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAgency} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  承办代理机构名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="如：Allen & Gledhill LLP (新加坡)"
                  value={agencyForm.agencyName}
                  onChange={(e) => setAgencyForm({ ...agencyForm, agencyName: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">默认代理机构案卷号</label>
                <input
                  type="text"
                  placeholder="如：AG-2026-TM-0891"
                  value={agencyForm.agencyDocketNo}
                  onChange={(e) => setAgencyForm({ ...agencyForm, agencyDocketNo: e.target.value })}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">指定代理人姓名</label>
                <input
                  type="text"
                  placeholder="如：张锦程"
                  value={agencyForm.agentName}
                  onChange={(e) => setAgencyForm({ ...agencyForm, agentName: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAgencyModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer shadow-xs"
                >
                  保存映射
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
