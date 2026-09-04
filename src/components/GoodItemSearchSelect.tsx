import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X, Check, Package, CheckSquare, Square, RotateCcw } from 'lucide-react';
import { NiceClassificationItem } from '../lib/niceClassificationStore';

interface GoodItemSearchSelectProps {
  niceItems: NiceClassificationItem[];
  selectedItems: NiceClassificationItem[]; // [] means '全部商品/服务 (全量统计)'
  onSelectItems: (items: NiceClassificationItem[]) => void;
}

export const GoodItemSearchSelect: React.FC<GoodItemSearchSelectProps> = ({
  niceItems,
  selectedItems,
  onSelectItems,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Filter items by search keyword (itemNameCn, groupCode, groupName, classNum)
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return niceItems;
    }
    const q = searchTerm.trim().toLowerCase();
    return niceItems.filter((item) => {
      const nameMatch = item.itemNameCn?.toLowerCase().includes(q);
      const codeMatch = item.groupCode?.toLowerCase().includes(q);
      const groupMatch = item.groupName?.toLowerCase().includes(q);
      const classMatch =
        item.classNum.toString() === q ||
        `第${item.classNum}类`.includes(q) ||
        `第0${item.classNum}类`.includes(q);
      return nameMatch || codeMatch || groupMatch || classMatch;
    });
  }, [niceItems, searchTerm]);

  // Check if an item is selected
  const isItemSelected = (item: NiceClassificationItem) => {
    return selectedItems.some(
      (s) =>
        s.id === item.id ||
        (s.itemNameCn === item.itemNameCn && s.groupCode === item.groupCode)
    );
  };

  // Toggle single item selection
  const handleToggleItem = (item: NiceClassificationItem) => {
    if (isItemSelected(item)) {
      onSelectItems(
        selectedItems.filter(
          (s) =>
            s.id !== item.id &&
            !(s.itemNameCn === item.itemNameCn && s.groupCode === item.groupCode)
        )
      );
    } else {
      onSelectItems([...selectedItems, item]);
    }
  };

  // Select all currently filtered items
  const handleSelectAllFiltered = () => {
    const newItems = [...selectedItems];
    filteredItems.forEach((item) => {
      if (
        !newItems.some(
          (s) =>
            s.id === item.id ||
            (s.itemNameCn === item.itemNameCn && s.groupCode === item.groupCode)
        )
      ) {
        newItems.push(item);
      }
    });
    onSelectItems(newItems);
  };

  // Clear all selections (reset to '全部商品/服务')
  const handleClearAll = () => {
    onSelectItems([]);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-normal text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer flex items-center justify-between min-w-[230px] max-w-[360px] shadow-2xs group"
      >
        <span className="truncate flex items-center gap-1.5">
          {selectedItems.length === 0 ? (
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              全部商品/服务 (全量统计)
            </span>
          ) : selectedItems.length === 1 ? (
            <>
              <span className="font-bold text-slate-900 truncate max-w-[170px]">
                {selectedItems[0].itemNameCn}
              </span>
              <span className="text-[11px] font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/80 shrink-0">
                {selectedItems[0].groupCode}
              </span>
            </>
          ) : (
            <span
              className="font-bold text-slate-900 truncate max-w-[280px]"
              title={selectedItems.map((i) => i.itemNameCn).join('、')}
            >
              {selectedItems.map((i) => i.itemNameCn).join('、')}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-[360px] sm:w-[420px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Header */}
          <div className="p-3 bg-slate-50/90 border-b border-slate-200/80 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索商品/服务中文名、类似群组(如 2108)或分类..."
                className="w-full text-xs bg-white text-slate-800 pl-8 pr-7 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5 px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">
                  已选 <strong className="text-blue-600 font-bold font-mono">{selectedItems.length}</strong> 项
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">
                  匹配 <strong className="text-slate-800 font-mono">{filteredItems.length}</strong> 项
                </span>
              </div>

              <div className="flex items-center gap-2">
                {filteredItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-[11px]"
                  >
                    全选匹配项
                  </button>
                )}
                {selectedItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-rose-600 hover:text-rose-800 font-medium hover:underline text-[11px] flex items-center gap-0.5"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    重置全选
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 py-1 scrollbar-thin">
            {/* 'ALL' option */}
            {!searchTerm && (
              <div
                onClick={handleClearAll}
                className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  selectedItems.length === 0
                    ? 'bg-blue-50/90 text-blue-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>全部商品/服务 (全量统计)</span>
                </div>
                {selectedItems.length === 0 && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    当前生效
                  </span>
                )}
              </div>
            )}

            {/* Item options */}
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const checked = isItemSelected(item);
                return (
                  <div
                    key={item.id || `${item.classNum}-${item.groupCode}-${item.itemNameCn}`}
                    onClick={() => handleToggleItem(item)}
                    className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors group ${
                      checked
                        ? 'bg-blue-50/80 text-blue-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-2">
                      <div className="mt-0.5 shrink-0">
                        {checked ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="truncate text-slate-900 group-hover:text-blue-600 transition-colors font-medium">
                            {item.itemNameCn}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-100/60 px-1.5 py-0.2 rounded shrink-0">
                            {item.groupCode}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-2">
                          <span className="font-medium text-slate-500">
                            第 {item.classNum.toString().padStart(2, '0')} 类
                          </span>
                          {item.groupName && <span>· {item.groupName}</span>}
                          {item.categoryType && (
                            <span
                              className={`px-1 py-0.2 rounded text-[9px] ${
                                item.categoryType === 'GOODS'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                  : 'bg-purple-50 text-purple-600 border border-purple-200'
                              }`}
                            >
                              {item.categoryType === 'GOODS' ? '商品' : '服务'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                <p>未找到与 “{searchTerm}” 匹配的商品/服务关系项目</p>
                <p className="text-[11px] text-slate-400">可尝试输入分类号(如 21)或类似群组编码(如 2108)</p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">
              {selectedItems.length === 0
                ? '提示：未选具体项目时默认按全量统计'
                : `已选择 ${selectedItems.length} 项进行组合过滤`}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium shadow-2xs transition-colors"
            >
              完成选择
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
