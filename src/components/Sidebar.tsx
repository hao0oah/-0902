import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  Briefcase, 
  ShieldAlert, 
  Radar, 
  Users,
  Users2, 
  CheckSquare, 
  BookOpen, 
  Settings, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Smile,
  LogOut,
  Globe,
  Building2
} from 'lucide-react';
import { NavigationTab, SystemSettingsSubTab, UserProfile } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  activeSettingsSubTab?: SystemSettingsSubTab;
  onSettingsSubTabChange?: (subTab: SystemSettingsSubTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingApprovalsCount: number;
  criticalAlertsCount: number;
  currentUser: UserProfile;
  onOpenAiAssistant: () => void;
  onOpenAuthModal: () => void;
}

const SETTINGS_SUB_ITEMS: {
  id: SystemSettingsSubTab;
  label: string;
  icon?: React.ElementType;
}[] = [
  { id: 'COUNTRY_REGION_MAPPING', label: '国家地区映射表', icon: Globe },
  { id: 'APPLICANT_MAPPING', label: '申请人主体映射表', icon: Building2 },
  { id: 'AGENCY_MAPPING', label: '承办代理机构映射表', icon: Briefcase },
  { id: 'TRADEMARK_STAKEHOLDERS', label: '商标看板人员维护表', icon: Users },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  activeSettingsSubTab = 'COUNTRY_REGION_MAPPING',
  onSettingsSubTabChange,
  collapsed,
  onToggleCollapse,
  pendingApprovalsCount,
  criticalAlertsCount,
  currentUser,
  onOpenAiAssistant,
  onOpenAuthModal
}) => {
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: '商标看板',
      subtitle: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'applications' as NavigationTab,
      label: '建案申请',
      subtitle: 'Applications',
      icon: FilePlus2,
    },
    {
      id: 'portfolio' as NavigationTab,
      label: '案件管理',
      subtitle: 'Portfolio',
      icon: Briefcase,
    },
    {
      id: 'enforcement' as NavigationTab,
      label: '维权管理',
      subtitle: 'Enforcement',
      icon: ShieldAlert,
    },
    {
      id: 'monitoring' as NavigationTab,
      label: '商标监测',
      subtitle: 'Radar Alerts',
      icon: Radar,
      badge: criticalAlertsCount > 0 ? criticalAlertsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'agencies' as NavigationTab,
      label: '代理协同',
      subtitle: 'Agencies',
      icon: Users2,
    },
    {
      id: 'approvals' as NavigationTab,
      label: '审批中心',
      subtitle: 'Approvals',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'nice-tool' as NavigationTab,
      label: '尼斯分类库',
      subtitle: 'Nice Classification',
      icon: BookOpen,
    },
    {
      id: 'settings' as NavigationTab,
      label: '系统管理',
      subtitle: 'Settings',
      icon: Settings,
      hasSubMenu: true,
    },
  ];

  const handleSettingsClick = () => {
    if (collapsed) {
      onToggleCollapse();
    }
    onTabChange('settings');
    setIsSettingsExpanded(prev => !prev);
  };

  const handleSubItemClick = (subId: SystemSettingsSubTab, e: React.MouseEvent) => {
    e.stopPropagation();
    onSettingsSubTabChange?.(subId);
    onTabChange('settings');
  };

  return (
    <aside 
      id="sidebar-container"
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)] ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-18 flex items-center px-4 justify-between border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => onTabChange('dashboard')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0 transition-transform hover:scale-105">
            <Smile className="w-6 h-6 stroke-[2.2]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 font-display">usmile</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">IP Pro</span>
              </div>
              <span className="text-xs text-slate-400 font-medium truncate">商标资产协同平台</span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
          title={collapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-3 px-3 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.id === 'settings') {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  id={`nav-item-${item.id}`}
                  onClick={handleSettingsClick}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon 
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                    }`} 
                  />
                  
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                      <span className="truncate">{item.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                        isSettingsExpanded ? 'rotate-180' : ''
                      } ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
                    </div>
                  )}
                </button>

                {/* Second Level Sub-Menu (二级菜单) */}
                {!collapsed && isSettingsExpanded && (
                  <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 ml-5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {SETTINGS_SUB_ITEMS.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = isActive && activeSettingsSubTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={(e) => handleSubItemClick(sub.id, e)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                            isSubActive
                              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                          }`}
                        >
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="truncate flex-1">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon 
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                }`} 
              />
              
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-sm ${
                      isActive ? 'bg-white text-blue-600' : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {collapsed && item.badge !== undefined && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </button>
          );
        })}

        {/* AI Assistant Banner */}
        <div className="pt-3">
          <button
            id="btn-trigger-ai-copilot"
            onClick={onOpenAiAssistant}
            className={`w-full p-3 rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 border border-blue-100/80 text-left transition-all hover:shadow-md hover:border-blue-300 group cursor-pointer ${
              collapsed ? 'flex justify-center p-2.5' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30 group-hover:rotate-12 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">AI 法务助手</span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-white/90 px-1.5 py-0.5 rounded-md border border-blue-200/50">Beta</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">智能商标检索与异议分析</p>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2`}>
          <div 
            className="flex items-center gap-2.5 min-w-0 cursor-pointer p-1 rounded-xl hover:bg-slate-200/50 transition-colors"
            onClick={onOpenAuthModal}
            title="查看或切换账号"
          >
            <div className="relative">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-white shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</span>
                  {currentUser.feishuLinked && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-100 text-cyan-700 font-semibold">飞书已联</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block truncate">{currentUser.title}</span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              id="btn-switch-account"
              onClick={onOpenAuthModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="切换用户或退出"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

