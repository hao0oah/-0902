import React, { useState, useRef } from 'react';
import { Upload, Download, X, FileSpreadsheet, Check, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface BatchImportMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (importedItems: any[], fileName: string) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const BatchImportMappingModal: React.FC<BatchImportMappingModalProps> = ({
  isOpen,
  onClose,
  onConfirmImport,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 下载 CSV 导入模板
  const handleDownloadTemplate = () => {
    const headers = [
      '类别编号',
      '类别名称',
      '分类属性',
      '类似群组编码',
      '类似群组名称',
      '商品服务中文名称',
    ];

    const sampleRows = [
      ['21', '第21类-厨房器具与洁具', '商品', '2108', '刷子及制刷材料', '电动牙刷'],
    ];

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...sampleRows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '商标商品服务关系标准导入模板.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast('标准 CSV 导入模板已成功下载');
  };

  // 解析并处理选中的文件
  const processFile = (file: File) => {
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      onShowToast('只支持导入 .csv, .xlsx, .xls 格式的文件', 'error');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          onShowToast('无法读取文件内容或文件为空', 'error');
          return;
        }

        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length < 2) {
          onShowToast('CSV/Excel 模板内容为空或缺少数据行', 'error');
          setParsedData([]);
          return;
        }

        // 跳过表头
        const startIndex =
          lines[0].includes('类别') || lines[0].includes('Class') || lines[0].includes('群组')
            ? 1
            : 0;

        const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
        const importedItems: any[] = [];

        for (let i = startIndex; i < lines.length; i++) {
          const rawLine = lines[i];
          const parts = rawLine.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
          if (parts.length >= 4 && parts[5]) {
            const classNum = parseInt(parts[0], 10) || 21;
            const categoryType =
              parts[2] === '服务' || classNum >= 35 ? 'SERVICE' : 'GOODS';
            const groupCode = parts[3] || '2108';
            const groupName = parts[4] || '默认分类群组';
            const itemNameCn = parts[5];
            const itemNameEn = parts[6] || '';
            const importanceRaw = parts[7] || 'STANDARD';
            const importance = ['CORE', 'KEY', 'STANDARD', 'DEFENSE'].includes(
              importanceRaw.toUpperCase()
            )
              ? importanceRaw.toUpperCase()
              : 'STANDARD';

            importedItems.push({
              id: 'nice-imp-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substring(2, 6),
              classNum,
              classTitle: parts[1] || `第${classNum.toString().padStart(2, '0')}类`,
              categoryType,
              groupCode,
              groupName,
              itemNameCn,
              itemNameEn,
              itemCode: '',
              importance,
              isCore: importance === 'CORE',
              status: 'ACTIVE',
              notes: parts[8] || '',
              updatedAt: nowStr,
            });
          }
        }

        if (importedItems.length === 0) {
          onShowToast('未解析出有效的商品/服务数据行，请检查模板数据格式', 'error');
        } else {
          onShowToast(`已成功解析文件，共检测到 ${importedItems.length} 条关系数据`, 'info');
        }

        setParsedData(importedItems);
      } catch (err) {
        console.error('解析文件失败', err);
        onShowToast('解析文件失败，请确保文件编码格式正确', 'error');
      }
    };

    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleConfirm = () => {
    if (!selectedFile || parsedData.length === 0) {
      onShowToast('请先选择或拖拽符合标准的 CSV/Excel 模板文件', 'error');
      return;
    }
    onConfirmImport(parsedData, selectedFile.name);
    onClose();
  };

  const handleClearSelected = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setParsedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                批量导入商品/服务关系数据
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                上传标准 CSV/Excel 格式文件批量新增商品/服务关系记录
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 overflow-y-auto bg-white flex-1">
          {/* Step 1 Card */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="text-sm font-bold text-slate-900">下载标准导入模板</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 bg-white hover:bg-blue-50/60 text-blue-600 border border-blue-200 hover:border-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>下载导入模板 (.csv)</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pl-7">
              请先下载系统格式化的 CSV 模板，参照格式填写【尼斯分类】、【类似群组编码】、【类似群组名称】、【商品/服务中文名称】等核心关系数据。
            </p>
          </div>

          {/* Step 2 Card */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <span className="text-sm font-bold text-slate-900">上传填写完成的模板文件</span>
            </div>

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv, .xlsx, .xls"
              className="hidden"
            />

            {/* Drag and Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                  : selectedFile
                  ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-400'
                  : 'border-blue-200/80 hover:border-blue-400 bg-white hover:bg-blue-50/20'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-2 py-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1.5">
                      <span>{selectedFile.name}</span>
                      <span className="text-xs text-slate-400 font-normal">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      已就绪，解析出 {parsedData.length} 条商品/服务关系记录
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="text-xs text-slate-400 hover:text-rose-600 underline mt-2 inline-block cursor-pointer"
                  >
                    重新选择文件
                  </button>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    点击选择或将 CSV/Excel 文件拖拽至此处
                  </div>
                  <p className="text-xs text-slate-400">支持 .csv, .xlsx, .xls 格式</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {selectedFile ? (
              <span className="text-slate-700">
                已选中文件: <strong className="text-blue-700 font-semibold">{selectedFile.name}</strong>
              </span>
            ) : (
              <span>请选择 CSV/Excel 模板文件</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/90 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              取消
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedFile || parsedData.length === 0}
              className={`px-5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs ${
                selectedFile && parsedData.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
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
