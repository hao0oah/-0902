import React from 'react';
import { 
  X, 
  Database, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Globe2, 
  Layers, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  UploadCloud,
  FileSpreadsheet,
  Building2,
  Workflow
} from 'lucide-react';

interface MonitoringDataSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonitoringDataSpecModal: React.FC<MonitoringDataSpecModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#235fff] flex items-center justify-center text-white shadow-md shadow-[#235fff]/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 font-display">
                  商标智能监测数据构成与自主运营说明
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  自主可控 · 零商业API依赖
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                官方公报批量解析、AI智能文书提取、律所台账互通与在先资产比对闭环
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700">
          
          {/* 数据闭环横幅 */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-950">
            <div className="font-semibold mb-1.5 flex items-center gap-1.5 text-blue-900 text-xs">
              <Workflow className="w-4 h-4 text-blue-600" />
              <span>无商业 API 采购条件下的企业知产运营闭环</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium flex-wrap">
              <span className="px-2 py-0.5 rounded bg-white border border-blue-200 shadow-2xs">官方公报/律所报表/线索</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold shadow-2xs">批量导入 / AI文书提取</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="px-2 py-0.5 rounded bg-white border border-blue-200 shadow-2xs">Gemini 音形义智能研判</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="px-2 py-0.5 rounded bg-white border border-blue-200 shadow-2xs">一键流转维权异议</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shadow-2xs">资产台账终身跟踪</span>
            </div>
          </div>

          {/* Section 1: 官方权威公告源数据 */}
          <div className="p-4.5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                官方公报与台账批量导入（零外部 API 成本）
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-9">
              支持法务团队直接使用国家知识产权局 (CNIPA) 每周公开发布的《商标初审公告》表格（Excel/CSV）或合作律所提供的月度监控清单：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9 text-xs">
              <div className="p-3 bg-white rounded-xl border border-blue-200/60 shadow-2xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  官方初审公告批量导入
                </div>
                <div className="text-[11px] text-slate-500">
                  一键上传官方《商标初审公告》（如第 1878、1879 期），自动提取初审标的名称、申请号、公告期日、申请人及 90 天异议截止期。
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-blue-200/60 shadow-2xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  合作律所月报互通
                </div>
                <div className="text-[11px] text-slate-500">
                  支持柳沈、金杜、中伦等代理律所的监测跟踪报表一键载入，直接复用律所专业排查成果。
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: AI 智能文书与截图 OCR 提取 */}
          <div className="p-4.5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Gemini 多模态 AI 文书解析与风险研判
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-9">
              无需调用外部收费接口，法务专员粘贴任何公报片段、律所邮件、官方受理通知书或侵权链接，内置 AI 即可自动执行：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-9 text-xs">
              <div className="p-3 bg-white rounded-xl border border-purple-200/60 shadow-2xs space-y-1">
                <div className="font-bold text-slate-900">结构化字段抽取</div>
                <div className="text-[11px] text-slate-500">
                  自动抽取标的名称、申请号、指定分类、当事人及公告截止倒计时。
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-purple-200/60 shadow-2xs space-y-1">
                <div className="font-bold text-slate-900">多模态音形义比对</div>
                <div className="text-[11px] text-slate-500">
                  自动与企业在先核心商标（usmile、笑容加、密浪）比对，计算相似度评分（0-100%）。
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-purple-200/60 shadow-2xs space-y-1">
                <div className="font-bold text-slate-900">生成法理异议草稿</div>
                <div className="text-[11px] text-slate-500">
                  依据类似商品区分表与抢注事实，自动生成专业《商标异议申请书》抗辩要点。
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 企业在先商标资产特征库 */}
          <div className="p-4.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                企业私有在先商标资产特征库（引证标尺）
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-9">
              以广州星际悦动股份有限公司（usmile 笑容加）已注册权利与核心防御矩阵为底本，所有数据存储于企业私有环境，安全合规。
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            我已知晓
          </button>
        </div>
      </div>
    </div>
  );
};

