import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink, 
  Layers, 
  Star,
  CheckCircle2
} from 'lucide-react';
import { NICE_CLASSES_DATA } from '../data/mockData';

export const NiceClassificationTool: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedClassNum, setSelectedClassNum] = useState<number>(21);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeClass = NICE_CLASSES_DATA.find(c => c.classNum === selectedClassNum) || NICE_CLASSES_DATA[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(text);
    setToastMessage(`已复制商品/服务项：${text}`);
    setTimeout(() => setCopiedItem(null), 2000);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast 提示 (页面居中显示) */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] max-w-md px-6 py-4 bg-slate-900/95 backdrop-blur-md text-white text-sm font-semibold rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-slate-700/80 pointer-events-none text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 font-display tracking-tight">
              尼斯分类法智能检索与选品工具
            </h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              第十二版 (2024版)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            覆盖第 1 至 45 类国际商品服务，针对口腔护理、智能消费电子精准匹配核心与防御群组。
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜商品项，如：电动牙刷、漱口水..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Grid: Left Class Tabs, Right Detail & Subclasses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left: Class selector */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-1">
            usmile 核心与防御关注类别
          </span>

          <div className="space-y-2">
            {NICE_CLASSES_DATA.map((c) => {
              const isSelected = selectedClassNum === c.classNum;
              return (
                <div
                  key={c.classNum}
                  onClick={() => setSelectedClassNum(c.classNum)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-102'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {/* Large Circular Class Number Badge */}
                  <div className={`w-11 h-11 rounded-full font-mono font-black text-base flex items-center justify-center shrink-0 shadow-xs border ${
                    isSelected 
                      ? 'bg-white text-blue-600 border-white/80' 
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {String(c.classNum).padStart(2, '0')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-black truncate">
                        第 {String(c.classNum).padStart(2, '0')} 类 · {c.title.split('-')[1]}
                      </span>
                      {c.isUsmileCore && (
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md shrink-0 ${
                          isSelected ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-700'
                        }`}>
                          核心基石
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {c.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Subclasses & Good Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 block">NICE CLASS {activeClass.classNum}</span>
                <h3 className="text-lg font-black text-slate-900 font-display">{activeClass.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{activeClass.description}</p>
              </div>
            </div>

            {/* Subclasses and Items */}
            <div className="space-y-6">
              {activeClass.subClasses.map((sub) => (
                <div key={sub.code} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      【群组 {sub.code}】{sub.name}
                    </span>
                    <button
                      onClick={() => handleCopy(sub.items.join('、'))}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedItem === sub.items.join('、') ? '已复制群组' : '复制全群项'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sub.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleCopy(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/80 text-xs font-medium text-slate-700 transition-all flex items-center gap-1.5 group"
                        title="点击复制该商品服务项"
                      >
                        <span>{item}</span>
                        {copiedItem === item ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
