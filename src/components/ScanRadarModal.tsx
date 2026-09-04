import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  Globe, 
  Database, 
  Cpu, 
  Layers, 
  ArrowRight,
  Download,
  RotateCw,
  Search,
  ExternalLink,
  FileSpreadsheet,
  Workflow
} from 'lucide-react';
import { MonitoringAlert } from '../types';

interface ScanRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlert?: (alert: MonitoringAlert) => void;
  onInitiateOpposition?: (alert: MonitoringAlert) => void;
}

export const ScanRadarModal: React.FC<ScanRadarModalProps> = ({
  isOpen,
  onClose,
  onSelectAlert,
  onInitiateOpposition,
}) => {
  const [scanStep, setScanStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [scannedCount, setScannedCount] = useState<number>(0);

  const scanSteps = [
    { label: '载入企业已导入的官方初审公报库与律所监测台账 (第 1878、1879 期)', icon: FileSpreadsheet },
    { label: '提取我司「usmile / 笑容加 / 密浪」全类目私有注册资产特征标尺', icon: Layers },
    { label: 'Gemini 法律大模型自主运行：拼音音律同音、视觉形近与子商标包含比对', icon: Cpu },
    { label: '结合尼斯分类与类似商品区分表，自动化判定第 21 类、第 03 类重合度', icon: Database },
    { label: '完成聚合研判，输出高危近似与 90 天异议期预警雷达简报', icon: CheckCircle2 },
  ];

  const newlyFoundAlerts = [
    {
      id: 'SCAN-NEW-01',
      name: 'USMILE TECH 悠思麦',
      regNo: '79201844',
      applicant: '深圳市某某跨境创新科技有限公司',
      suspectClass: 21,
      similarity: 97,
      risk: '极高危 (抢注第21类电动牙刷/刷头)',
      gazette: '第 1878 期 (2024-03-01)',
      deadline: '2024-06-01 (剩余 89 天)',
      reason: '英文与核心商标仅差空格，中文音译完全重合，指定核心洁牙器具，恶意极高。'
    },
    {
      id: 'SCAN-NEW-02',
      name: '笑容家 SMILE HOME',
      regNo: '79110452',
      applicant: '广州某某家居生活用品有限公司',
      suspectClass: 3,
      similarity: 88,
      risk: '高危 (字形与呼叫双重近似)',
      gazette: '第 1878 期 (2024-03-01)',
      deadline: '2024-06-01 (剩余 89 天)',
      reason: '同音字替换“加”为“家”，英文含有 SMILE，指定第3类牙膏洗护，易导致消费者混淆。'
    },
    {
      id: 'SCAN-NEW-03',
      name: '密浪净齿',
      regNo: '79054119',
      applicant: '温州某某日化制造厂',
      suspectClass: 21,
      similarity: 93,
      risk: '高危 (完整包含核心防御字号)',
      gazette: '第 1878 期 (2024-03-01)',
      deadline: '2024-06-01 (剩余 89 天)',
      reason: '完整包含我司“密浪”注册商标，且后接行业通用描述词“净齿”，混淆意图显著。'
    }
  ];

  // Start scan sequence when opened
  useEffect(() => {
    if (!isOpen) {
      setScanStep(0);
      setProgress(0);
      setIsCompleted(false);
      setScannedCount(0);
      return;
    }

    let currentProgress = 0;
    let step = 0;
    let count = 0;

    const interval = setInterval(() => {
      currentProgress += 2;
      count += 2850;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        setScannedCount(142580);
        setScanStep(4);
        setIsCompleted(true);
        clearInterval(interval);
      } else {
        setProgress(currentProgress);
        setScannedCount(count);
        if (currentProgress > 20 && step === 0) setScanStep(1);
        if (currentProgress > 45 && step <= 1) setScanStep(2);
        if (currentProgress > 75 && step <= 2) setScanStep(3);
        if (currentProgress > 95 && step <= 3) setScanStep(4);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleRestart = () => {
    setScanStep(0);
    setProgress(0);
    setIsCompleted(false);
    setScannedCount(0);
    
    let currentProgress = 0;
    let count = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      count += 2850;
      if (currentProgress >= 100) {
        setProgress(100);
        setScannedCount(142580);
        setScanStep(4);
        setIsCompleted(true);
        clearInterval(interval);
      } else {
        setProgress(currentProgress);
        setScannedCount(count);
        if (currentProgress > 20) setScanStep(1);
        if (currentProgress > 45) setScanStep(2);
        if (currentProgress > 75) setScanStep(3);
        if (currentProgress > 95) setScanStep(4);
      }
    }, 35);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#235fff] flex items-center justify-center text-white shadow-md shadow-[#235fff]/20">
              <Radar className={`w-5 h-5 ${!isCompleted ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 font-display">
                  Gemini AI 商标初审公报与台账智能研判
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  自主可控 · 零商业API依赖
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isCompleted 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                }`}>
                  {isCompleted ? '研判已完成' : 'AI多模态比对中...'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                基于 Gemini 法律多模态大模型 · 本地化比对已导入公报库与律所台账
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top Progress & Live Counter Panel */}
          <div className="rounded-2xl bg-slate-900 text-white p-5 space-y-4 relative overflow-hidden shadow-lg">
            {/* Ambient radar glow in dark panel */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#235fff]/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                  AI Model Multi-Modal Analysis
                </span>
                <div className="text-xl font-bold font-mono flex items-center gap-3">
                  <span className="text-[#5b8cff]">{progress}%</span>
                  <span className="text-xs font-normal text-slate-300">
                    已分析公报与台账标的：<span className="text-white font-bold font-mono">{scannedCount.toLocaleString()}</span> 件
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                  <span className="text-slate-400">数据来源：</span>
                  <span className="font-semibold text-emerald-400">官方公报/律所清单/私有资产</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                  <span className="text-slate-400">重点高危：</span>
                  <span className="font-bold text-rose-400">{isCompleted ? '3 件' : '分析中...'}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative z-10">
              <div 
                className="h-full bg-gradient-to-r from-[#235fff] via-cyan-400 to-emerald-400 transition-all duration-150 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Stepper Status List */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4.5 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>扫描处置流水线状态</span>
              <span className="text-[11px] font-normal text-slate-400 font-mono">
                Pipeline v3.8 · 5-Stage Verification
              </span>
            </h4>

            <div className="space-y-2.5">
              {scanSteps.map((s, idx) => {
                const StepIcon = s.icon;
                const isCurrent = scanStep === idx && !isCompleted;
                const isDone = scanStep > idx || isCompleted;

                return (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                      isCurrent
                        ? 'bg-blue-50/80 border border-blue-200 text-[#235fff] font-bold shadow-2xs'
                        : isDone
                        ? 'bg-white border border-slate-200/70 text-slate-800'
                        : 'bg-transparent text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                        isDone 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : isCurrent 
                          ? 'bg-[#235fff] text-white animate-pulse' 
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                      </div>
                      <span>{s.label}</span>
                    </div>

                    <span className="font-mono text-[11px]">
                      {isDone ? '已完成' : isCurrent ? '处理中...' : '等待执行'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scan Findings / Results (Shown when completed) */}
          {isCompleted && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    最新发现
                  </span>
                  <h4 className="text-sm font-black text-slate-900 font-display">
                    最新第 1878 期公告库检出 3 件高危近似标的
                  </h4>
                </div>
                <span className="text-xs text-slate-400">法定 90 天异议起算：自 2024-03-01 起</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {newlyFoundAlerts.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#235fff] hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900 font-display truncate">
                          {item.name}
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#235fff] border border-blue-200">
                          {item.similarity}% 相似
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <div>申请号: <span className="font-mono text-slate-700">{item.regNo}</span> (第 {item.suspectClass} 类)</div>
                        <div className="truncate">申请人: {item.applicant}</div>
                        <div className="text-amber-600 font-semibold">{item.deadline}</div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                        {item.reason}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          if (onInitiateOpposition) {
                            onInitiateOpposition({
                              id: item.id,
                              suspectName: item.name,
                              suspectRegNo: item.regNo,
                              suspectApplicant: item.applicant,
                              suspectClass: item.suspectClass,
                              gazetteNumber: item.gazette,
                              gazetteDate: '2024-03-01',
                              oppositionDeadline: '2024-06-01',
                              daysRemaining: 89,
                              matchedOurTrademark: 'usmile / 笑容加',
                              similarityScore: item.similarity,
                              riskLevel: 'CRITICAL',
                              status: 'NEW',
                              similarityReason: item.reason
                            });
                          }
                        }}
                        className="flex-1 py-1.5 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium text-center shadow-xs hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                      >
                        一键立案处置
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI 比对引擎基于企业私有资产特征库本地化运行，零外部商业接口调用成本</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isCompleted && (
              <button
                onClick={handleRestart}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50/80 text-xs font-normal text-slate-700 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>重新扫描</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              {isCompleted ? '完成并返回监测看板' : '后台继续运行'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
