import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Download, 
  Upload, 
  Layers, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Tag,
  CheckSquare,
  Square
} from 'lucide-react';
import { BatchImportMappingModal } from './BatchImportMappingModal';
import { 
  NiceClassificationItem, 
  NICE_CLASSES_META,
  NiceClassSummary,
  getNiceClassificationMappings, 
  saveNiceClassificationMappings, 
  subscribeNiceClassificationChanges 
} from '../lib/niceClassificationStore';

interface NiceClassificationMappingViewProps {
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const NiceClassificationMappingView: React.FC<NiceClassificationMappingViewProps> = ({
  onShowToast
}) => {
  const [items, setItems] = useState<NiceClassificationItem[]>(getNiceClassificationMappings);
  
  // Search and filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<number | 'ALL'>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'GOODS' | 'SERVICE'>('ALL');
  const [selectedImportanceFilter, setSelectedImportanceFilter] = useState<string>('ALL');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NiceClassificationItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<NiceClassificationItem, 'id'>>({
    classNum: 21,
    classTitle: '第21类 - 厨房洁具与牙刷器具',
    categoryType: 'GOODS',
    groupCode: '2108',
    groupName: '刷子及制刷材料',
    itemNameCn: '',
    itemNameEn: '',
    itemCode: '',
    isCore: true,
    importance: 'CORE',
    notes: '',
    status: 'ACTIVE',
    updatedAt: ''
  });

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = subscribeNiceClassificationChanges(() => {
      setItems(getNiceClassificationMappings());
    });
    return () => unsubscribe();
  }, []);

  // Compute available groups for the currently selected class filter
  const availableGroups = useMemo(() => {
    const groupMap = new Map<string, { code: string; name: string }>();
    items.forEach(item => {
      if (selectedClassFilter === 'ALL' || item.classNum === selectedClassFilter) {
        if (!groupMap.has(item.groupCode)) {
          groupMap.set(item.groupCode, { code: item.groupCode, name: item.groupName });
        }
      }
    });
    return Array.from(groupMap.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [items, selectedClassFilter]);

  // Filtered items
  const filteredItems = useMemo(() => {
    const filtered = items.filter(item => {
      // Keyword search
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase().trim();
        const match = 
          item.itemNameCn.toLowerCase().includes(q) ||
          item.itemNameEn.toLowerCase().includes(q) ||
          (item.itemCode && item.itemCode.toLowerCase().includes(q)) ||
          item.groupCode.toLowerCase().includes(q) ||
          item.groupName.toLowerCase().includes(q) ||
          item.classTitle.toLowerCase().includes(q) ||
          `第${item.classNum}类`.includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Class filter
      if (selectedClassFilter !== 'ALL' && item.classNum !== selectedClassFilter) {
        return false;
      }

      // Type filter
      if (selectedTypeFilter !== 'ALL' && item.categoryType !== selectedTypeFilter) {
        return false;
      }

      // Importance filter
      if (selectedImportanceFilter !== 'ALL' && item.importance !== selectedImportanceFilter) {
        return false;
      }

      // Group filter
      if (selectedGroupFilter !== 'ALL' && item.groupCode !== selectedGroupFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'ALL' && item.status !== selectedStatusFilter) {
        return false;
      }

      return true;
    });

    // 严格按尼斯分类类别升序排序 (第1类 -> 第45类)，同类别按群组及商品编码排序
    return filtered.sort((a, b) => {
      if (a.classNum !== b.classNum) {
        return a.classNum - b.classNum;
      }
      if (a.groupCode !== b.groupCode) {
        return a.groupCode.localeCompare(b.groupCode);
      }
      if (a.itemCode && b.itemCode && a.itemCode !== b.itemCode) {
        return a.itemCode.localeCompare(b.itemCode);
      }
      return a.itemNameCn.localeCompare(b.itemNameCn, 'zh-CN');
    });
  }, [
    items, 
    searchKeyword, 
    selectedClassFilter, 
    selectedTypeFilter, 
    selectedImportanceFilter, 
    selectedGroupFilter, 
    selectedStatusFilter
  ]);

  // Paginated items
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedClassFilter, selectedTypeFilter, selectedImportanceFilter, selectedGroupFilter, selectedStatusFilter]);

  // Open modal for add
  const handleOpenAdd = (presetClassNum?: number, presetGroupCode?: string, presetGroupName?: string) => {
    const targetClassNum = presetClassNum || (selectedClassFilter !== 'ALL' ? selectedClassFilter : 21);
    const meta = NICE_CLASSES_META.find(m => m.classNum === targetClassNum);
    const defaultGroup = meta?.defaultGroups[0] || { code: '2108', name: '刷子及制刷材料' };

    setEditingItem(null);
    setFormData({
      classNum: targetClassNum,
      classTitle: meta?.classTitle || `第${targetClassNum}类`,
      categoryType: meta?.categoryType || (targetClassNum <= 34 ? 'GOODS' : 'SERVICE'),
      groupCode: presetGroupCode || defaultGroup.code,
      groupName: presetGroupName || defaultGroup.name,
      itemNameCn: '',
      itemNameEn: '',
      itemCode: '',
      isCore: false,
      importance: 'STANDARD',
      notes: '',
      status: 'ACTIVE',
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    });
    setIsEditModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (item: NiceClassificationItem) => {
    setEditingItem(item);
    setFormData({
      classNum: item.classNum,
      classTitle: item.classTitle,
      categoryType: item.categoryType,
      groupCode: item.groupCode,
      groupName: item.groupName,
      itemNameCn: item.itemNameCn,
      itemNameEn: item.itemNameEn || '',
      itemCode: item.itemCode || '',
      isCore: !!item.isCore,
      importance: item.importance || 'STANDARD',
      notes: item.notes || '',
      status: item.status,
      updatedAt: item.updatedAt
    });
    setIsEditModalOpen(true);
  };

  // Open modal for duplicate/copy
  const handleDuplicate = (item: NiceClassificationItem) => {
    setEditingItem(null);
    setFormData({
      classNum: item.classNum,
      classTitle: item.classTitle,
      categoryType: item.categoryType,
      groupCode: item.groupCode,
      groupName: item.groupName,
      itemNameCn: item.itemNameCn + ' (副本)',
      itemNameEn: item.itemNameEn ? item.itemNameEn + ' (Copy)' : '',
      itemCode: item.itemCode || '',
      isCore: item.isCore,
      importance: item.importance,
      notes: item.notes || '',
      status: 'ACTIVE',
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    });
    setIsEditModalOpen(true);
  };

  // Save Item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemNameCn.trim()) {
      onShowToast('请填写商品/服务中文名称', 'error');
      return;
    }
    if (!formData.groupCode.trim()) {
      onShowToast('请填写类似群组编码', 'error');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    if (editingItem) {
      const updated = items.map(item => 
        item.id === editingItem.id 
          ? { 
              ...item, 
              ...formData, 
              isCore: formData.importance === 'CORE' || formData.isCore,
              updatedAt: nowStr 
            } 
          : item
      );
      saveNiceClassificationMappings(updated);
      setItems(updated);
      onShowToast(`已更新商品/服务项目【${formData.itemNameCn}】`);
    } else {
      const newItem: NiceClassificationItem = {
        id: 'nice-' + Date.now(),
        ...formData,
        isCore: formData.importance === 'CORE' || formData.isCore,
        updatedAt: nowStr
      };
      const updated = [newItem, ...items];
      saveNiceClassificationMappings(updated);
      setItems(updated);
      onShowToast(`成功新增商品/服务项目【${formData.itemNameCn}】`);
    }

    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  // Delete single item
  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`确定要删除商品/服务关系项【${name}】吗？`)) {
      const updated = items.filter(i => i.id !== id);
      saveNiceClassificationMappings(updated);
      setItems(updated);
      setSelectedIds(prev => prev.filter(selId => selId !== id));
      onShowToast(`已删除【${name}】`);
    }
  };

  // Batch delete items
  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`确定要批量删除选中的 ${selectedIds.length} 条商品/服务关系吗？此操作不可逆。`)) {
      const updated = items.filter(i => !selectedIds.includes(i.id));
      saveNiceClassificationMappings(updated);
      setItems(updated);
      setSelectedIds([]);
      onShowToast(`已成功批量删除 ${selectedIds.length} 条数据`);
    }
  };

  // Batch set importance
  const handleBatchSetImportance = (importance: 'CORE' | 'KEY' | 'STANDARD' | 'DEFENSE') => {
    if (selectedIds.length === 0) return;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updated = items.map(item => {
      if (selectedIds.includes(item.id)) {
        return {
          ...item,
          importance,
          isCore: importance === 'CORE',
          updatedAt: nowStr
        };
      }
      return item;
    });
    saveNiceClassificationMappings(updated);
    setItems(updated);
    onShowToast(`已将 ${selectedIds.length} 条项目保护等级设为【${getImportanceLabel(importance)}】`);
  };

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedItems.length && paginatedItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedItems.map(i => i.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // 导出勾选的数据为 CSV
  const handleExportSelectedCSV = () => {
    if (selectedIds.length === 0) {
      onShowToast('请先在列表中勾选需要导出的数据记录', 'error');
      return;
    }

    const exportItems = items.filter(i => selectedIds.includes(i.id));
    if (exportItems.length === 0) {
      onShowToast('未能匹配到勾选的数据记录', 'error');
      return;
    }

    const headers = ['类别编号', '类别名称', '分类属性', '类似群组编码', '类似群组名称', '商品服务中文名称'];
    const rows = exportItems.map(i => [
      i.classNum,
      i.classTitle,
      i.categoryType === 'GOODS' ? '商品' : '服务',
      i.groupCode,
      i.groupName,
      i.itemNameCn
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(c => `"${c.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `商标商品服务关系勾选导出数据_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`成功导出 ${exportItems.length} 条勾选的商品/服务关系记录`);
  };

  // Batch import callback
  const handleConfirmBatchImport = (importedItems: NiceClassificationItem[], fileName: string) => {
    if (importedItems.length === 0) return;
    const merged = [...importedItems, ...items];
    saveNiceClassificationMappings(merged);
    setItems(merged);
    onShowToast(`成功从【${fileName}】批量导入 ${importedItems.length} 条商品/服务关系记录`);
  };

  // Helper when class is changed in form
  const handleFormClassChange = (classNum: number) => {
    const meta = NICE_CLASSES_META.find(m => m.classNum === classNum);
    const defaultGroup = meta?.defaultGroups[0];
    setFormData(prev => ({
      ...prev,
      classNum,
      classTitle: meta?.classTitle || `第${classNum}类`,
      categoryType: meta?.categoryType || (classNum <= 34 ? 'GOODS' : 'SERVICE'),
      groupCode: defaultGroup ? defaultGroup.code : prev.groupCode,
      groupName: defaultGroup ? defaultGroup.name : prev.groupName
    }));
  };

  // Importance label & styling
  const getImportanceBadge = (importance?: string) => {
    switch (importance) {
      case 'CORE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Sparkles className="w-3 h-3 text-rose-500" />
            <span>核心保护</span>
          </span>
        );
      case 'KEY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldCheck className="w-3 h-3 text-amber-600" />
            <span>重点项目</span>
          </span>
        );
      case 'DEFENSE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            防御注册
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            常规项目
          </span>
        );
    }
  };

  const getImportanceLabel = (imp: string) => {
    switch (imp) {
      case 'CORE': return '核心保护';
      case 'KEY': return '重点项目';
      case 'DEFENSE': return '防御注册';
      default: return '常规项目';
    }
  };

  // Core classes shortcut list
  const CORE_HOT_CLASSES = [
    { num: 21, label: '第21类 (牙刷/洁具)', isHot: true },
    { num: 3, label: '第03类 (牙膏/日化)', isHot: true },
    { num: 10, label: '第10类 (医疗/牙科)', isHot: true },
    { num: 9, label: '第09类 (智能/软件)', isHot: true },
    { num: 11, label: '第11类 (消毒/家电)', isHot: false },
    { num: 5, label: '第05类 (医药/消毒)', isHot: false },
    { num: 35, label: '第35类 (广告/电商)', isHot: true },
    { num: 42, label: '第42类 (研发/SaaS)', isHot: false },
    { num: 44, label: '第44类 (牙科门诊)', isHot: false },
    { num: 45, label: '第45类 (知识产权)', isHot: false }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 space-y-5 border border-slate-200/80 shadow-xs">
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-200/60">
              <Layers className="w-4 h-4" />
            </div>
            <span>商标分类与类群组与商品/服务项目的关系表</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              尼斯分类第12版(2024)标准规范库
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            维护管理1-45类国际尼斯分类体系、类似群组编码与包含的商品及服务规范项目关系，支撑商标建案、查重、监测与全景地图穿透分析。
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export Selected Data CSV */}
          <button
            type="button"
            onClick={handleExportSelectedCSV}
            className={`px-2.5 py-1.5 text-xs font-medium border rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs ${
              selectedIds.length > 0
                ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 font-semibold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
            title="请先在列表中勾选要导出的数据项目"
          >
            <Download className={`w-3.5 h-3.5 ${selectedIds.length > 0 ? 'text-blue-600' : 'text-slate-500'}`} />
            <span>导出{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}</span>
          </button>

          {/* Batch Import Trigger Modal */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
            title="批量导入商品服务关系CSV/Excel映射表"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>批量导入</span>
          </button>

          {/* Add Item (Blue Button) */}
          <button
            type="button"
            onClick={() => handleOpenAdd()}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增商品/服务关系</span>
          </button>
        </div>
      </div>

      {/* 3. Search & Comprehensive Filter Controls */}
      <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/60">
        {/* Row 1: Search, Class Dropdown, Type, Group, Importance, View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索类别/群组编码/商品名称/编码/说明..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
              {searchKeyword && (
                <button 
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Nice Class Select */}
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">全部45个分类 (All Classes)</option>
              {NICE_CLASSES_META.map(c => (
                <option key={c.classNum} value={c.classNum}>
                  第{c.classNum < 10 ? `0${c.classNum}` : c.classNum}类 - {c.classTitle.split(' - ')[1] || c.classTitle} ({c.categoryType === 'GOODS' ? '商品' : '服务'})
                </option>
              ))}
            </select>

            {/* Category Type Filter */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">全部属性 (商品+服务)</option>
              <option value="GOODS">仅商品 (第01~34类)</option>
              <option value="SERVICE">仅服务 (第35~45类)</option>
            </select>

            {/* Group Code Filter */}
            {availableGroups.length > 0 && (
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-teal-500 max-w-[200px]"
              >
                <option value="ALL">全部类似群组 ({availableGroups.length}个)</option>
                {availableGroups.map(g => (
                  <option key={g.code} value={g.code}>
                    {g.code} {g.name}
                  </option>
                ))}
              </select>
            )}

            {/* Importance Filter */}
            <select
              value={selectedImportanceFilter}
              onChange={(e) => setSelectedImportanceFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">全部保护等级</option>
              <option value="CORE">核心保护 (CORE)</option>
              <option value="KEY">重点项目 (KEY)</option>
              <option value="STANDARD">常规项目 (STANDARD)</option>
              <option value="DEFENSE">防御注册 (DEFENSE)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Core Class Shortcut Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> 核心类别直达:
          </span>
          <button
            type="button"
            onClick={() => setSelectedClassFilter('ALL')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              selectedClassFilter === 'ALL'
                ? 'bg-teal-600 text-white font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            全部 ({items.length})
          </button>
          {CORE_HOT_CLASSES.map(hc => {
            const count = items.filter(i => i.classNum === hc.num).length;
            const isSelected = selectedClassFilter === hc.num;
            return (
              <button
                key={hc.num}
                type="button"
                onClick={() => setSelectedClassFilter(hc.num)}
                className={`px-2 py-0.5 rounded-md text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-teal-600 text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {hc.isHot && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                <span>{hc.label}</span>
                <span className={`text-[10px] ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Batch Operations Floating Bar (When items selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-medium text-teal-900">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>已选中 <strong>{selectedIds.length}</strong> 条商品/服务关系项</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportSelectedCSV}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer font-semibold flex items-center gap-1 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>确定导出 ({selectedIds.length})</span>
            </button>
            <button
              type="button"
              onClick={handleBatchDelete}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer font-medium flex items-center gap-1 shadow-xs"
            >
              <Trash2 className="w-3 h-3" />
              <span>批量删除</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2 py-1 text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              取消勾选
            </button>
          </div>
        </div>
      )}

      {/* 5. Flat Table View */}
      <div className="space-y-3">
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-3 w-10 text-center">
                    <button 
                      type="button" 
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
                    >
                      {selectedIds.length > 0 && selectedIds.length === paginatedItems.length ? (
                        <CheckSquare className="w-4 h-4 text-teal-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap min-w-[140px]">
                    <div className="flex items-center gap-1.5 text-teal-800">
                      <span>尼斯分类类别</span>
                      <span className="text-[10px] bg-teal-100 text-teal-700 font-semibold px-1.5 py-0.5 rounded inline-flex items-center">
                        升序 ↑
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap min-w-[160px]">类似群组 (Group)</th>
                  <th className="py-3 px-3.5 min-w-[240px]">商品/服务中文名称</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Layers className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <span>未找到匹配的尼斯分类及商品服务关系数据</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchKeyword('');
                            setSelectedClassFilter('ALL');
                            setSelectedTypeFilter('ALL');
                            setSelectedImportanceFilter('ALL');
                            setSelectedGroupFilter('ALL');
                          }}
                          className="text-xs text-teal-600 hover:underline cursor-pointer font-medium mt-1"
                        >
                          清除所有筛选条件
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-teal-50/30 transition-colors ${isSelected ? 'bg-teal-50/40' : ''}`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectItem(item.id)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-teal-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Class */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1.5 font-medium text-slate-900">
                            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                            <span className="font-bold">第 {item.classNum < 10 ? `0${item.classNum}` : item.classNum} 类</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[140px] mt-0.5" title={item.classTitle}>
                            {item.classTitle.split(' - ')[1] || item.classTitle}
                          </div>
                        </td>

                        {/* Similar Group */}
                        <td className="py-3 px-3.5">
                          <div className="font-mono font-semibold text-indigo-700 bg-indigo-50/70 px-1.5 py-0.5 rounded border border-indigo-100 inline-block text-[11px]">
                            {item.groupCode}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{item.groupName}</div>
                        </td>

                        {/* Chinese Item Name */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <span>{item.itemNameCn}</span>
                            {item.isCore && (
                              <span title="核心保护项目">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleDuplicate(item)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 cursor-pointer"
                              title="复制新建"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1 text-slate-500 hover:text-teal-600 rounded hover:bg-slate-100 cursor-pointer"
                              title="编辑项目"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id, item.itemNameCn)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                              title="删除项目"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>共 <strong>{filteredItems.length}</strong> 条记录</span>
              <span>•</span>
              <span>每页显示:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="py-1 px-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
              >
                <option value={15}>15 条</option>
                <option value={30}>30 条</option>
                <option value={50}>50 条</option>
                <option value={100}>100 条</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                上一页
              </button>

              <span className="px-2 font-medium text-slate-700">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                下一页
              </button>
            </div>
          </div>
        </div>

      {/* 6. Modal: Add / Edit Item */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>{editingItem ? '编辑商品/服务项目关系' : '新增商品/服务项目关系'}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Class Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    尼斯分类类别 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.classNum}
                    onChange={(e) => handleFormClassChange(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                  >
                    {NICE_CLASSES_META.map(c => (
                      <option key={c.classNum} value={c.classNum}>
                        第{c.classNum < 10 ? `0${c.classNum}` : c.classNum}类 - {c.classTitle.split(' - ')[1] || c.classTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    分类属性 (商品/服务)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.categoryType === 'GOODS' ? '商品 (GOODS)' : '服务 (SERVICE)'}
                    className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500"
                  />
                </div>
              </div>

              {/* Similar Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    类似群组编码 (Group Code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如：2108, 0306, 1004"
                    value={formData.groupCode}
                    onChange={(e) => setFormData({ ...formData, groupCode: e.target.value })}
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    类似群组名称 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如：刷子及制刷材料, 洁齿剂及口腔清新剂"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Chinese Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  商品/服务中文名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="如：电动牙刷, 牙刷刷头, 冲牙器, 牙膏, 牙科服务..."
                  value={formData.itemNameCn}
                  onChange={(e) => setFormData({ ...formData, itemNameCn: e.target.value })}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg cursor-pointer shadow-xs"
                >
                  保存配置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Import Modal */}
      <BatchImportMappingModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirmImport={handleConfirmBatchImport}
        onShowToast={onShowToast}
      />
    </div>
  );
};
