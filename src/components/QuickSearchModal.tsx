import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Briefcase, 
  Radar, 
  ShieldAlert, 
  ArrowRight, 
  BookOpen, 
  Plus, 
  Sparkles,
  Command
} from 'lucide-react';
import { TrademarkItem, MonitoringAlert, NavigationTab } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  trademarks: TrademarkItem[];
  alerts: MonitoringAlert[];
  onSelectTrademark: (tm: TrademarkItem) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  trademarks,
  alerts,
  onSelectTrademark,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle is handled in parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedTrademarks = trademarks.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.regNumber.includes(query) ||
    t.goodsItems.some(g => g.includes(query))
  );

  const matchedAlerts = alerts.filter((a) =>
    a.suspectName.toLowerCase().includes(query.toLowerCase()) ||
    a.suspectApplicant.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="极速搜索商标资产、抢注预警、案件号、尼斯类别..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-800 focus:outline-none placeholder:text-slate-400 font-medium"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          
          {/* Quick Actions Shortcuts */}
          {!query.trim() && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                快捷功能直达
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onNavigate('applications'); onClose(); }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-600 transition-colors text-left font-semibold"
                >
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>发起新商标立项申请</span>
                </button>
                <button
                  onClick={() => { onNavigate('monitoring'); onClose(); }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-800 hover:text-rose-600 transition-colors text-left font-semibold"
                >
                  <Radar className="w-4 h-4 text-rose-600" />
                  <span>查看 AI 监测预警 (4条待办)</span>
                </button>
                <button
                  onClick={() => { onNavigate('nice-tool'); onClose(); }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-600 transition-colors text-left font-semibold"
                >
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>尼斯分类检索器</span>
                </button>
                <button
                  onClick={() => { onNavigate('approvals'); onClose(); }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-600 transition-colors text-left font-semibold"
                >
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>飞书流程审批中心</span>
                </button>
              </div>
            </div>
          )}

          {/* Trademarks Search Results */}
          {matchedTrademarks.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                商标资产匹配 ({matchedTrademarks.length})
              </span>
              {matchedTrademarks.slice(0, 5).map((tm) => (
                <div
                  key={tm.id}
                  onClick={() => { onSelectTrademark(tm); onClose(); }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-blue-600 font-display text-xs">
                      {tm.name.slice(0, 2)}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 group-hover:text-blue-600 text-xs">
                        {tm.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        #{tm.regNumber} · {tm.jurisdiction} · {tm.classes.map(c => `第${c}类`).join(',')}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              ))}
            </div>
          )}

          {/* Monitoring Alerts Match */}
          {matchedAlerts.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                AI 近似雷达预警匹配 ({matchedAlerts.length})
              </span>
              {matchedAlerts.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => { onNavigate('monitoring'); onClose(); }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-rose-50/70 transition-colors cursor-pointer group"
                >
                  <div>
                    <span className="font-bold text-slate-900 group-hover:text-rose-600 text-xs">
                      {alt.suspectName} (相似度 {alt.similarityScore}%)
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      申请人: {alt.suspectApplicant} · 剩余 {alt.daysRemaining} 天
                    </span>
                  </div>
                  <span className="text-xs font-bold text-rose-600">异议 →</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 flex items-center justify-between">
          <span>按 ESC 或点击空白处关闭</span>
          <span className="font-mono">usmile 全球智能检索</span>
        </div>
      </div>
    </div>
  );
};
