import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Search, 
  X,
  ChevronDown,
  Globe,
  Building2, 
  Briefcase,
  Users,
  Layers
} from 'lucide-react';
import { NavigationTab, SystemSettingsSubTab, UserProfile } from '../types';

export interface SettingsSubMenuItem {
  id: SystemSettingsSubTab;
  label: string;
  subLabel?: string;
  icon?: React.ElementType;
  tag?: string;
  tagColor?: string;
}

export const SETTINGS_SUB_MENU_ITEMS: SettingsSubMenuItem[] = [
  {
    id: 'COUNTRY_REGION_MAPPING',
    label: '国家地区映射表',
    subLabel: '全球各大区与国家级字典联动维护',
    icon: Globe,
    tag: '基础字典',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'APPLICANT_MAPPING',
    label: '申请人主体映射表',
    subLabel: '中英文主体名称与官方地址标准化映射',
    icon: Building2,
    tag: '主体配置',
    tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    id: 'AGENCY_MAPPING',
    label: '承办代理机构映射表',
    subLabel: '合作代理律所、案卷号前缀及代理人配置',
    icon: Briefcase,
    tag: '律所协同',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    id: 'TRADEMARK_STAKEHOLDERS',
    label: '商标看板人员维护表',
    subLabel: '业务负责人、上级主管及关键用户配置',
    icon: Users,
    tag: '人员权责',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    id: 'NICE_CLASSIFICATION_MAPPING',
    label: '商标分类与群组及商品服务关系表',
    subLabel: '尼斯分类1-45类、类似群组及官方商品服务项目规范维护',
    icon: Layers,
    tag: '尼斯分类',
    tagColor: 'bg-teal-50 text-teal-700 border-teal-200'
  },
];

interface TopNavbarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  activeSettingsSubTab?: SystemSettingsSubTab;
  onSettingsSubTabChange?: (subTab: SystemSettingsSubTab) => void;
  pendingApprovalsCount?: number;
  criticalAlertsCount?: number;
  currentUser?: UserProfile;
  onOpenAiAssistant?: () => void;
  onOpenAuthModal?: () => void;
  onOpenQuickSearch?: () => void;
  onOpenNewApplication?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  onTabChange,
  activeSettingsSubTab = 'COUNTRY_REGION_MAPPING',
  onSettingsSubTabChange,
}) => {
  // Tabs opened list matching original usmile version
  const [openTabs, setOpenTabs] = useState<NavigationTab[]>([
    'dashboard',
    'applications',
    'portfolio',
    'enforcement',
    'monitoring',
    'agencies',
    'brand-tree',
    'approvals',
    'settings'
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsMenuTimerRef = useRef<NodeJS.Timeout | null>(null);

  const navMenuItems = [
    { id: 'dashboard' as NavigationTab, label: '商标看板' },
    { id: 'applications' as NavigationTab, label: '建案申请' },
    { id: 'portfolio' as NavigationTab, label: '案件管理' },
    { id: 'enforcement' as NavigationTab, label: '维权管理' },
    { id: 'monitoring' as NavigationTab, label: '商标监测' },
    { id: 'agencies' as NavigationTab, label: '代理协同' },
    { id: 'brand-tree' as NavigationTab, label: '品牌树管理' },
    { id: 'approvals' as NavigationTab, label: '审批中心' },
    { id: 'settings' as NavigationTab, label: '系统管理', hasSubMenu: true },
  ];

  const tabLabels: Record<NavigationTab, string> = {
    dashboard: '商标看板',
    'brand-tree': '品牌树管理',
    applications: '建案申请',
    portfolio: '案件管理',
    enforcement: '维权管理',
    monitoring: '商标监测',
    agencies: '代理协同',
    approvals: '审批中心',
    'nice-tool': '尼斯分类库',
    settings: '系统管理',
  };

  const handleSelectMenu = (tab: NavigationTab) => {
    onTabChange(tab);
    if (!openTabs.includes(tab)) {
      setOpenTabs([...openTabs, tab]);
    }
  };

  const handleSelectSettingsSubItem = (subId: SystemSettingsSubTab) => {
    onSettingsSubTabChange?.(subId);
    handleSelectMenu('settings');
    setIsSettingsMenuOpen(false);
  };

  const handleCloseTab = (e: React.MouseEvent, tabToClose: NavigationTab) => {
    e.stopPropagation();
    const updated = openTabs.filter(t => t !== tabToClose);
    if (updated.length === 0) {
      setOpenTabs(['dashboard']);
      onTabChange('dashboard');
      return;
    }
    setOpenTabs(updated);
    if (activeTab === tabToClose) {
      onTabChange(updated[updated.length - 1]);
    }
  };

  const handleMouseEnterSettings = () => {
    if (settingsMenuTimerRef.current) {
      clearTimeout(settingsMenuTimerRef.current);
    }
    setIsSettingsMenuOpen(true);
  };

  const handleMouseLeaveSettings = () => {
    settingsMenuTimerRef.current = setTimeout(() => {
      setIsSettingsMenuOpen(false);
    }, 200);
  };

  // Get active subtab item details
  const currentSubItem = SETTINGS_SUB_MENU_ITEMS.find(item => item.id === activeSettingsSubTab);

  // Quick search matching features
  const searchResults = searchQuery.trim()
    ? SETTINGS_SUB_MENU_ITEMS.filter(item => 
        item.label.includes(searchQuery.trim()) || 
        (item.subLabel && item.subLabel.includes(searchQuery.trim()))
      )
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white select-none">
      {/* 1. Main Header Bar */}
      <div className="w-full border-b border-slate-200">
        <div className="max-w-[1600px] w-full mx-auto px-3.5 sm:px-4 md:px-5 h-[54px] flex items-center justify-between gap-4">
          
          {/* Left Section: 9-Dot Matrix, Brand Title & Left-aligned Navigation Menu */}
          <div className="flex items-center gap-5 xl:gap-7 h-full">
            {/* 3x3 Dot Grid Icon */}
            <div className="grid grid-cols-3 gap-1 p-1 text-slate-500 hover:text-slate-900 cursor-pointer shrink-0">
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
            </div>

            {/* Logo + Clean Title */}
            <div 
              className="flex items-center gap-2 cursor-pointer shrink-0 pr-1"
              onClick={() => handleSelectMenu('dashboard')}
            >
              {/* Blue Gradient Rounded App Icon with 4-Point Sparkle */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4 text-white fill-white" />
              </div>

              <span className="font-extrabold text-base text-slate-900 tracking-tight font-sans whitespace-nowrap">
                usmile 商标管理系统
              </span>
            </div>

            {/* Left-Aligned Navigation Menu Items */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6 h-full">
              {navMenuItems.map((item) => {
                const isActive = activeTab === item.id;
                
                if (item.id === 'settings') {
                  return (
                    <div 
                      key={item.id}
                      className="relative h-[54px] flex items-center"
                      onMouseEnter={handleMouseEnterSettings}
                      onMouseLeave={handleMouseLeaveSettings}
                    >
                      <button
                        id={`top-menu-${item.id}`}
                        onClick={() => handleSelectMenu(item.id)}
                        className={`relative h-[54px] flex items-center gap-1.5 text-sm font-semibold transition-colors px-1 cursor-pointer whitespace-nowrap ${
                          isActive || isSettingsMenuOpen
                            ? 'text-blue-600 font-bold' 
                            : 'text-slate-800 hover:text-blue-600'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSettingsMenuOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-sm" />
                        )}
                      </button>

                      {/* 二级下拉菜单 (Secondary Dropdown Menu matching image.png style) */}
                      {isSettingsMenuOpen && (
                        <div 
                          className="absolute top-[50px] left-0 min-w-[220px] bg-white rounded-xl shadow-xl border border-slate-200/90 py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 select-none"
                          onMouseEnter={handleMouseEnterSettings}
                          onMouseLeave={handleMouseLeaveSettings}
                        >
                          <div className="flex flex-col">
                            {SETTINGS_SUB_MENU_ITEMS.map((subItem) => {
                              const isSubActive = isActive && activeSettingsSubTab === subItem.id;
                              return (
                                <button
                                  key={subItem.id}
                                  type="button"
                                  onClick={() => handleSelectSettingsSubItem(subItem.id)}
                                  className={`w-full text-left px-6 py-2.5 text-[15px] transition-colors cursor-pointer flex items-center justify-between ${
                                    isSubActive
                                      ? 'text-blue-600 font-bold bg-blue-50/70'
                                      : 'text-slate-900 font-medium hover:text-blue-600 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{subItem.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    id={`top-menu-${item.id}`}
                    onClick={() => handleSelectMenu(item.id)}
                    className={`relative h-[54px] flex items-center text-sm font-semibold transition-colors px-1 cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? 'text-blue-600' 
                        : 'text-slate-800 hover:text-blue-600'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-sm" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Search Input Box */}
          <div className="relative flex items-center gap-3 shrink-0">
            <div className="relative w-52 lg:w-64">
              <input
                type="text"
                placeholder="请输入功能名称（如：国家地区、主体映射）"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3.5 pr-8 py-1.5 text-xs bg-white rounded-md border border-slate-300 focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2]" />
            </div>

            {/* Quick Search Popover if typing matches */}
            {searchResults.length > 0 && (
              <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1">找到系统管理二级功能：</div>
                {searchResults.map(result => {
                  return (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => {
                        handleSelectSettingsSubItem(result.id);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-blue-50 flex items-center justify-between text-xs text-slate-800 hover:text-blue-700 font-medium"
                    >
                      <span className="truncate">{result.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Secondary Opened Tabs Bar */}
      <div className="bg-[#f0f2f5] border-b border-slate-200/90">
        <div className="max-w-[1600px] w-full mx-auto px-3.5 sm:px-4 md:px-5 py-1.5 flex items-center gap-1.5 overflow-x-auto">
          {openTabs.map((tab, index) => {
            const isActive = activeTab === tab;
            const showClose = index !== 0 || openTabs.length > 1;
            
            // Format label for settings tab if sub-menu is active
            let displayLabel = tabLabels[tab] || tab;
            if (tab === 'settings' && currentSubItem) {
              displayLabel = `系统管理 · ${currentSubItem.label}`;
            }

            return (
              <div
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer select-none group ${
                  isActive
                    ? 'bg-white text-slate-800 font-bold shadow-2xs'
                    : 'bg-[#e4e7eb] hover:bg-[#dbe0e6] text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{displayLabel}</span>
                {showClose && (
                  <button
                    onClick={(e) => handleCloseTab(e, tab)}
                    className="p-0.5 rounded hover:bg-slate-300/60 text-slate-400 hover:text-slate-700 transition-colors"
                    title="关闭页签"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
};


