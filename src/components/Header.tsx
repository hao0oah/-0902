import React from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  Sparkles, 
  Globe2, 
  Building2, 
  CheckCircle2, 
  SlidersHorizontal,
  Flame,
  Radio
} from 'lucide-react';
import { NavigationTab, UserProfile } from '../types';

interface HeaderProps {
  activeTab: NavigationTab;
  onOpenNewApplication: () => void;
  onOpenQuickSearch: () => void;
  onOpenAiAssistant: () => void;
  currentUser: UserProfile;
  unreadAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenNewApplication,
  onOpenQuickSearch,
  onOpenAiAssistant,
  currentUser,
  unreadAlertsCount
}) => {
  const getTabInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: '商标全球看板', desc: 'usmile 全球 68 国知识产权资产全景与智能风控概览' };
      case 'applications':
        return { title: '建案申请中心', desc: '新商标立项、尼斯分类精选、多国协同与申请草稿箱' };
      case 'portfolio':
        return { title: '商标案件台账', desc: '已注册/审查中资产全生命周期、证书归档与十年续展倒计时' };
      case 'enforcement':
        return { title: '维权与异议管理', desc: '恶意抢注打击、异议无效、撤三扫障与海关跨境打假' };
      case 'monitoring':
        return { title: 'AI 商标监测雷达', desc: '全球初审公告近似监测、90天异议黄金期与智能风险预警' };
      case 'agencies':
        return { title: '代理协同网络', desc: '全球合作律所与代理机构 SLA 评分、案件流转与费率透明化' };
      case 'approvals':
        return { title: '流程审批中心', desc: '多级立项、异议维权提级、飞书快捷协同与预算批复' };
      case 'nice-tool':
        return { title: '尼斯分类智能助手', desc: '第1-45类商品服务项目检索、口腔消费品智能精准推荐' };
      case 'settings':
        return { title: '系统与权限配置', desc: '企业组织架构、飞书工作台集成与不可篡改操作审计日志' };
    }
  };

  const tabInfo = getTabInfo();

  return (
    <header 
      id="main-header"
      className="sticky top-0 z-20 h-18 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between transition-all"
    >
      {/* Title & Slogan */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
              {tabInfo.title}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              系统正常运行
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
            {tabInfo.desc}
          </p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-3">
        {/* Global Smart Search Bar Button */}
        <button
          id="btn-global-quick-search"
          onClick={onOpenQuickSearch}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all border border-slate-200/60 shadow-inner group w-44 md:w-64"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <span className="text-xs text-slate-400 group-hover:text-slate-600 font-medium truncate flex-1 text-left">
            搜索商标名/注册号/国别...
          </span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200 shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* AI Copilot shortcut */}
        <button
          id="btn-header-ai"
          onClick={onOpenAiAssistant}
          className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 text-blue-700 hover:bg-blue-100/80 text-xs font-bold transition-all shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>AI 法务助手</span>
        </button>

        {/* Notification Bell */}
        <button
          id="btn-header-notifications"
          onClick={onOpenQuickSearch}
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="系统消息与预警"
        >
          <Bell className="w-5 h-5" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Primary Action Button: New Application */}
        <button
          id="btn-header-new-application"
          onClick={onOpenNewApplication}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>新建申请</span>
        </button>
      </div>
    </header>
  );
};
