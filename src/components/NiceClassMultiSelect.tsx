import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Check, 
  ChevronDown, 
  X, 
  Filter, 
  RotateCcw, 
  Layers, 
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';
import { ALL_45_NICE_CLASSES, NiceClassInfo } from '../data/niceClasses45';

interface NiceClassMultiSelectProps {
  selectedClasses: number[];
  onChange: (classes: number[]) => void;
  className?: string;
  placeholder?: string;
}

export const NiceClassMultiSelect: React.FC<NiceClassMultiSelectProps> = ({
  selectedClasses,
  onChange,
  className = '',
  placeholder = '全部分类 (45类全部)'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'GOODS' | 'SERVICES' | 'CORE'>('ALL');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filtered classes based on tab and search term
  const filteredClasses = useMemo(() => {
    let list = ALL_45_NICE_CLASSES;
    
    // Tab filter
    if (activeTab === 'GOODS') {
      list = list.filter(c => c.category === 'goods');
    } else if (activeTab === 'SERVICES') {
      list = list.filter(c => c.category === 'services');
    } else if (activeTab === 'CORE') {
      list = list.filter(c => c.isCore);
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(c => {
        return (
          c.code.includes(q) ||
          String(c.classNum).includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.shortName.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.keywords.some(k => k.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [activeTab, searchTerm]);

  // Toggle single class
  const handleToggleClass = (classNum: number) => {
    if (selectedClasses.includes(classNum)) {
      onChange(selectedClasses.filter(c => c !== classNum));
    } else {
      onChange([...selectedClasses, classNum].sort((a, b) => a - b));
    }
  };

  // Select all currently filtered classes
  const handleSelectAllFiltered = () => {
    const newSelected = Array.from(new Set<number>([...selectedClasses, ...filteredClasses.map(c => c.classNum)])).sort((a, b) => a - b);
    onChange(newSelected);
  };

  // Select all 45 classes (or select all)
  const handleSelectAll45 = () => {
    onChange(ALL_45_NICE_CLASSES.map(c => c.classNum));
  };

  // Clear all selection
  const handleClearAll = () => {
    onChange([]);
  };

  // Invert selection among filtered items
  const handleInvertFiltered = () => {
    const currentSet = new Set<number>(selectedClasses);
    filteredClasses.forEach(c => {
      if (currentSet.has(c.classNum)) {
        currentSet.delete(c.classNum);
      } else {
        currentSet.add(c.classNum);
      }
    });
    onChange(Array.from(currentSet).sort((a, b) => a - b));
  };

  // Trigger label formatting
  const triggerLabel = useMemo(() => {
    if (selectedClasses.length === 0) {
      return placeholder;
    }
    if (selectedClasses.length === 45) {
      return '已选全部 45 类';
    }
    if (selectedClasses.length === 1) {
      const cls = ALL_45_NICE_CLASSES.find(c => c.classNum === selectedClasses[0]);
      return cls ? `第${cls.code}类 ${cls.shortName}` : `第 ${selectedClasses[0]} 类`;
    }
    if (selectedClasses.length <= 3) {
      return `已选 ${selectedClasses.length} 个类别: ` + selectedClasses.map(n => `第${String(n).padStart(2, '0')}类`).join('、');
    }
    return `已选 ${selectedClasses.length} 个分类 (${selectedClasses.slice(0, 3).map(n => `第${String(n).padStart(2, '0')}类`).join('、')}等)`;
  }, [selectedClasses, placeholder]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer font-medium shadow-2xs ${
          isOpen
            ? 'border-blue-500 bg-blue-50/50 text-blue-800 ring-2 ring-blue-500/20'
            : selectedClasses.length > 0
            ? 'border-blue-300 bg-blue-50/70 text-blue-700 hover:bg-blue-50'
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Layers className={`w-3.5 h-3.5 shrink-0 ${selectedClasses.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
          <span className="truncate max-w-[280px]" title={triggerLabel}>
            {triggerLabel}
          </span>
          {selectedClasses.length > 0 && selectedClasses.length < 45 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white shrink-0">
              {selectedClasses.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {selectedClasses.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors"
              title="清空已选分类"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-[420px] max-w-[92vw] bg-white rounded-xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[460px]">
          
          {/* Header & Search Input */}
          <div className="p-3 bg-slate-50/80 border-b border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>45 尼斯分类多选筛选</span>
                <span className="text-[11px] font-normal text-slate-400 ml-1">
                  (已选 <strong className="text-blue-600">{selectedClasses.length}</strong> / 45)
                </span>
              </div>
              
              {selectedClasses.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>清空已选</span>
                </button>
              )}
            </div>

            {/* Keyword Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索类号/名称/商品项 (如: 21、牙刷、日化、医疗、35、软件...)"
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-800"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Group Filter Tabs */}
            <div className="flex items-center justify-between gap-1 pt-0.5">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('ALL')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'ALL'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  全部 (45)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('GOODS')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'GOODS'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  商品类 (01-34)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('SERVICES')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'SERVICES'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  服务类 (35-45)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('CORE')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    activeTab === 'CORE'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>核心类别</span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-1.5 text-[11px] text-blue-600 shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="hover:underline cursor-pointer"
                  title="全选当前筛选显示的类别"
                >
                  全选
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleInvertFiltered}
                  className="hover:underline cursor-pointer"
                  title="反选当前筛选类别"
                >
                  反选
                </button>
              </div>
            </div>
          </div>

          {/* List of Classes */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1 max-h-[280px]">
            {filteredClasses.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <Layers className="w-6 h-6 mx-auto text-slate-300" />
                <p className="text-xs font-medium text-slate-500">未找到匹配的尼斯分类</p>
                <p className="text-[11px] text-slate-400">请尝试更换关键词搜索（如：21、牙刷、日化、35）</p>
              </div>
            ) : (
              filteredClasses.map((item) => {
                const isSelected = selectedClasses.includes(item.classNum);
                return (
                  <div
                    key={item.classNum}
                    onClick={() => handleToggleClass(item.classNum)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer flex items-start gap-2.5 group ${
                      isSelected
                        ? 'bg-blue-50/70 hover:bg-blue-50 text-blue-950'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="mt-0.5 shrink-0">
                      {isSelected ? (
                        <div className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded border border-slate-300 group-hover:border-blue-400 bg-white" />
                      )}
                    </div>

                    {/* Class badge */}
                    <div className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : item.isCore
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      第{item.code}类
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                          {item.shortName}
                        </span>
                        {item.isCore && (
                          <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                            重点关注
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 ml-auto shrink-0">
                          {item.category === 'goods' ? '商品' : '服务'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Confirm */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="text-slate-500 text-[11px]">
              {selectedClasses.length === 0 ? (
                <span>未勾选任何类别 (默认显示全部)</span>
              ) : (
                <span>已选中 <strong className="text-blue-600 font-bold">{selectedClasses.length}</strong> 个类别</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedClasses.length === 0 ? (
                <button
                  type="button"
                  onClick={handleSelectAll45}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  全选45类
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                >
                  重置
                </button>
              )}
              
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
              >
                完成筛选
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
