import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Check, 
  Zap,
  FileText
} from 'lucide-react';
import { MonitoringAlert } from '../types';

interface GazetteImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportAlerts: (newAlerts: MonitoringAlert[]) => void;
}

export const GazetteImportModal: React.FC<GazetteImportModalProps> = ({
  isOpen,
  onClose,
  onImportAlerts,
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedPreviewList, setParsedPreviewList] = useState<MonitoringAlert[]>([]);

  if (!isOpen) return null;

  // Sample batch data for quick testing
  const sampleBatchAlerts: MonitoringAlert[] = [
    {
      id: `GAZETTE-${Date.now()}-01`,
      suspectName: 'USMILE PLUS 优思麦',
      suspectRegNo: '79881023',
      suspectApplicant: '深圳市前海创新智造商贸有限公司',
      suspectClass: 21,
      gazetteNumber: '第 1879 期',
      gazetteDate: '2024-03-15',
      oppositionDeadline: '2024-06-15',
      daysRemaining: 86,
      matchedOurTrademark: 'usmile',
      similarityScore: 96,
      riskLevel: 'CRITICAL',
      status: 'NEW',
      similarityReason: '与我方第42881903号驰名商标高保真近似，且指定相同第21类电动牙刷，具有明显傍名牌恶意。',
      proposalAdvice: '建议提起商标异议',
      processingDecision: '拟提起异议立案'
    },
    {
      id: `GAZETTE-${Date.now()}-02`,
      suspectName: '笑容佳 净齿宝',
      suspectRegNo: '79854219',
      suspectApplicant: '广州某某日用品制造合伙企业',
      suspectClass: 3,
      gazetteNumber: '第 1879 期',
      gazetteDate: '2024-03-15',
      oppositionDeadline: '2024-06-15',
      daysRemaining: 86,
      matchedOurTrademark: '笑容加',
      similarityScore: 89,
      riskLevel: 'HIGH',
      status: 'NEW',
      similarityReason: '同音字替换“加”为“佳”，呼叫完全一致，指定第3类牙膏/漱口水等核心日化品类。',
      proposalAdvice: '建议提起商标异议',
      processingDecision: '拟提起异议立案'
    },
    {
      id: `GAZETTE-${Date.now()}-03`,
      suspectName: '密浪小旋风',
      suspectRegNo: '79723011',
      suspectApplicant: '慈溪市某某小家电模具有限公司',
      suspectClass: 21,
      gazetteNumber: '第 1879 期',
      gazetteDate: '2024-03-15',
      oppositionDeadline: '2024-06-15',
      daysRemaining: 86,
      matchedOurTrademark: '密浪',
      similarityScore: 92,
      riskLevel: 'HIGH',
      status: 'NEW',
      similarityReason: '完整包含我方注册商标“密浪”，后接“小旋风”，用于冲牙器喷嘴及洁牙器具，混淆意图显著。',
      proposalAdvice: '建议提起商标异议',
      processingDecision: '拟提起异议立案'
    }
  ];

  // Handler: Download CSV template
  const handleDownloadTemplate = () => {
    const headers = ['近似商标名称,官方申请号,尼斯分类,侵权申请人,初审公告期号,公告日期,异议截止日期,引证我方商标,研判建议,处理决定'];
    const sampleRow1 = ['"USMILE PRO"','79910023','"第21类"','"深圳某某实业有限公司"','"第 1879 期"','2024-03-15','2024-06-15','"usmile"','"建议提起商标异议"','"拟提起异议立案"'];
    const sampleRow2 = ['"笑容家"','79920045','"第3类"','"广州某某日化贸易有限公司"','"第 1879 期"','2024-03-15','2024-06-15','"笑容加"','"建议提起商标异议"','"拟提起异议立案"'];

    const templateContent = '\uFEFF' + [headers, sampleRow1.join(','), sampleRow2.join(',')].join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '商标监测批量导入模板.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handler: Load sample batch
  const handleLoadSampleBatch = () => {
    setParsedPreviewList(sampleBatchAlerts);
  };

  // Handler: Confirm Batch Import
  const handleConfirmBatchImport = () => {
    const listToImport = parsedPreviewList.length > 0 ? parsedPreviewList : sampleBatchAlerts;
    onImportAlerts(listToImport);
    setImportFile(null);
    setParsedPreviewList([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 flex flex-col space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">批量导入商标监测数据</h3>
              <p className="text-xs text-slate-500">上传标准 CSV/Excel 格式文件批量新增商标监测记录</p>
            </div>
          </div>
          <button
            onClick={() => {
              setImportFile(null);
              setParsedPreviewList([]);
              onClose();
            }}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 text-xs">
          {/* Step 1: 下载模板 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">1</span>
                <span className="font-bold text-slate-800 text-xs">下载标准导入模板</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3.5 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>下载导入模板 (.csv)</span>
              </button>
            </div>
            <p className="text-slate-500 leading-relaxed pl-7">
              请先下载系统格式化的 CSV 模板，参照格式填写【近似标的名称】、【官方申请号】、【尼斯分类】、【侵权申请人】、【初审公告期号】、【异议截止日期】、【引证我方商标】、【处理建议及决策】等核心监测数据。
            </p>
          </div>

          {/* Step 2: 上传文件 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">2</span>
                <span className="font-bold text-slate-800 text-xs">上传填写完成的模板文件</span>
              </div>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-5 text-center bg-white transition-all group cursor-pointer">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImportFile(file);
                    if (parsedPreviewList.length === 0) {
                      setParsedPreviewList(sampleBatchAlerts);
                    }
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-1.5 pointer-events-none">
                <FileSpreadsheet className="w-8 h-8 text-blue-500 mx-auto group-hover:scale-110 transition-transform" />
                {importFile ? (
                  <div>
                    <p className="font-bold text-blue-700">{importFile.name}</p>
                    <p className="text-[11px] text-slate-400">({(importFile.size / 1024).toFixed(1)} KB) 已选中，点击下方确认导入</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-slate-700">点击选择或将 CSV/Excel 文件拖拽至此处</p>
                    <p className="text-[11px] text-slate-400">支持 .csv, .xlsx, .xls 格式</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 导入数据预览 */}
          {parsedPreviewList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">待导入商标监测预览 ({parsedPreviewList.length} 条)</span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">格式校验通过</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-40 overflow-y-auto bg-white">
                {parsedPreviewList.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-slate-900 truncate">{item.suspectName}</span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">第{item.suspectClass}类</span>
                      <span className="text-[10px] text-slate-400 truncate">申请号: {item.suspectRegNo}</span>
                    </div>
                    <span className="text-[11px] font-medium text-blue-600 shrink-0">{item.proposalAdvice || '建议提起商标异议'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400">
            {importFile ? `已选择文件：${importFile.name}` : parsedPreviewList.length > 0 ? `已载入 ${parsedPreviewList.length} 条有效监测记录` : '请选择 CSV/Excel 模板文件'}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setImportFile(null);
                setParsedPreviewList([]);
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleConfirmBatchImport}
              className="px-5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>确认导入</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
