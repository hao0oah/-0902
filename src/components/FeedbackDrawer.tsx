import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  Upload, 
  FileText, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  Paperclip,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

export interface FeedbackRecord {
  id: string;
  type: string;
  issueType?: string;
  module: string;
  desc: string;
  priority: string;
  submitTime: string;
  status: string;
  statusColor: string;
  estimatedDate: string;
  actualDate: string;
  attachmentCount: number;
}

interface FeedbackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModule?: string;
}

const MODULE_OPTIONS = [
  '建案申请',
  '案件管理',
  '维权管理',
  '商标监测',
  '代理协同',
  '品牌树管理',
  '审批中心'
];

const PRIORITY_OPTIONS = [
  { value: 'S', label: 'S.直接影响公司核心业务运转或战略目标落地的需求' },
  { value: 'A', label: 'A.支撑核心业务流程、影响大量用户或高频操作的需求' },
  { value: 'B', label: 'B.支撑常规业务流程、影响部分用户或低频操作的需求' },
  { value: 'C', label: 'C.提升体验、优化细节或非紧急的需求' }
];

export const FeedbackDrawer: React.FC<FeedbackDrawerProps> = ({
  isOpen,
  onClose,
  defaultModule = '建案申请'
}) => {
  // Form State
  const [feedbackType, setFeedbackType] = useState<'BUG' | 'OPTIMIZATION' | 'NEW_FEATURE'>('BUG');
  const [issueType, setIssueType] = useState<'ACCURACY' | 'DISPLAY' | 'PERMISSION' | 'OTHER'>('ACCURACY');
  const [module, setModule] = useState(defaultModule);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; size: string }>>([]);
  
  // Feedback History State
  const [feedbackList, setFeedbackList] = useState<FeedbackRecord[]>(() => {
    try {
      const saved = localStorage.getItem('usmile_feedback_records');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('usmile_feedback_records', JSON.stringify(feedbackList));
    } catch (e) {
      console.error(e);
    }
  }, [feedbackList]);

  // Handle file upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: Array<{ id: string; name: string; size: string }> = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`文件 "${file.name}" 超过 10MB 限制`);
        continue;
      }
      const sizeStr = file.size < 1024 * 1024 
        ? `${(file.size / 1024).toFixed(1)} KB` 
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      newFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: sizeStr
      });
    }

    setAttachments(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('请填写具体的问题描述');
      return;
    }
    if (!priority) {
      setErrorMessage('请选择需求优先级');
      return;
    }

    setErrorMessage('');
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRecord: FeedbackRecord = {
      id: `FB-${Date.now().toString().slice(-6)}`,
      type: feedbackType === 'BUG' ? '系统故障报错' : feedbackType === 'OPTIMIZATION' ? '现有功能优化' : '功能新增',
      issueType: feedbackType === 'BUG' ? (
        issueType === 'ACCURACY' ? '数据准确性' : 
        issueType === 'DISPLAY' ? '页面显示问题' : 
        issueType === 'PERMISSION' ? '权限问题' : '其他'
      ) : undefined,
      module,
      desc: description.trim(),
      priority: priority || 'P2',
      submitTime: timeStr,
      status: '处理中',
      statusColor: 'text-amber-600 bg-amber-50 border-amber-200',
      estimatedDate: '待排期',
      actualDate: '-',
      attachmentCount: attachments.length
    };

    setFeedbackList(prev => [newRecord, ...prev]);
    setDescription('');
    setAttachments([]);
    setPriority('');
    setShowSuccessToast(true);

    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10050] overflow-hidden">
      {/* 背景遮罩 */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/35 backdrop-blur-[1px] transition-opacity animate-in fade-in duration-200"
      />

      {/* 右侧滑出面板 */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-[10051]">
        <div className="w-screen max-w-[700px] bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 ease-out border-l border-slate-200">
          
          {/* 1. 顶部 Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              需求反馈
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 成功 Toast 提示 */}
          {showSuccessToast && (
            <div className="mx-6 mt-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>反馈提交成功！产品经理与研发团队将尽快评估处理。</span>
            </div>
          )}

          {/* 错误提示 */}
          {errorMessage && (
            <div className="mx-6 mt-3 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 2. 主体表单内容 (可滚动) */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs sm:text-[13px] text-slate-800">
            
            {/* 1) 反馈类型 */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 font-medium text-slate-800 text-xs">
                <span className="text-rose-500 font-bold">*</span>
                <span>反馈类型</span>
              </label>
              
              <div className="flex items-center gap-6 flex-wrap">
                {/* 系统故障报错 */}
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="feedbackType"
                    checked={feedbackType === 'BUG'}
                    onChange={() => setFeedbackType('BUG')}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`${feedbackType === 'BUG' ? 'text-blue-600 font-medium' : 'text-slate-700'}`}>
                    系统故障报错
                  </span>
                  <div 
                    className="relative inline-block"
                    onMouseEnter={() => setActiveTooltip('type_bug')}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
                    {activeTooltip === 'type_bug' && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-48 p-2 bg-slate-800 text-slate-100 rounded-md text-[11px] shadow-lg z-50 pointer-events-none">
                        系统功能不可用、数据统计错误、显示错乱或异常报错等问题
                      </div>
                    )}
                  </div>
                </label>

                {/* 现有功能优化 */}
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="feedbackType"
                    checked={feedbackType === 'OPTIMIZATION'}
                    onChange={() => setFeedbackType('OPTIMIZATION')}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`${feedbackType === 'OPTIMIZATION' ? 'text-blue-600 font-medium' : 'text-slate-700'}`}>
                    现有功能优化
                  </span>
                  <div 
                    className="relative inline-block"
                    onMouseEnter={() => setActiveTooltip('type_opt')}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
                    {activeTooltip === 'type_opt' && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-48 p-2 bg-slate-800 text-slate-100 rounded-md text-[11px] shadow-lg z-50 pointer-events-none">
                        在现有功能基础上的操作便捷性、展示维度或流程效率提升建议
                      </div>
                    )}
                  </div>
                </label>

                {/* 功能新增 */}
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="feedbackType"
                    checked={feedbackType === 'NEW_FEATURE'}
                    onChange={() => setFeedbackType('NEW_FEATURE')}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`${feedbackType === 'NEW_FEATURE' ? 'text-blue-600 font-medium' : 'text-slate-700'}`}>
                    功能新增
                  </span>
                  <div 
                    className="relative inline-block"
                    onMouseEnter={() => setActiveTooltip('type_new')}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
                    {activeTooltip === 'type_new' && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-48 p-2 bg-slate-800 text-slate-100 rounded-md text-[11px] shadow-lg z-50 pointer-events-none">
                        需要全新开发的功能模块或外部数据对接需求
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* 2) 问题类型 (当为故障报错时展示或对应具体类别) */}
            {feedbackType === 'BUG' && (
              <div className="space-y-2 pt-1">
                <label className="block font-medium text-slate-800 text-xs">
                  问题类型
                </label>
                <div className="flex items-center gap-6 flex-wrap">
                  {[
                    { key: 'ACCURACY', label: '数据准确性' },
                    { key: 'DISPLAY', label: '页面显示问题' },
                    { key: 'PERMISSION', label: '权限问题' },
                    { key: 'OTHER', label: '其他' },
                  ].map((item) => (
                    <label key={item.key} className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="issueType"
                        checked={issueType === item.key}
                        onChange={() => setIssueType(item.key as any)}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`${issueType === item.key ? 'text-blue-600 font-medium' : 'text-slate-700'}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 3) 模块 */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 font-medium text-slate-800 text-xs">
                <span className="text-rose-500 font-bold">*</span>
                <span>模块</span>
              </label>
              <div className="relative">
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none"
                >
                  {MODULE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 4) 问题描述 */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 font-medium text-slate-800 text-xs">
                <span className="text-rose-500 font-bold">*</span>
                <span>问题描述</span>
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setDescription(e.target.value);
                    }
                  }}
                  rows={4}
                  placeholder='500 字符内说清“故障现象 + 需修复”，可备注关键操作步骤，可直接粘贴上传图片'
                  className="w-full p-3 pb-6 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 text-xs sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none leading-relaxed"
                />
                <div className="absolute right-3 bottom-2 text-[11px] text-slate-400 font-mono select-none">
                  {description.length} / 500
                </div>
              </div>
            </div>

            {/* 5) 优先级 */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 font-medium text-slate-800 text-xs">
                <span className="text-rose-500 font-bold">*</span>
                <span>优先级</span>
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={`w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none ${
                    priority ? 'text-slate-800 font-medium' : 'text-slate-400'
                  }`}
                >
                  <option value="" disabled>请选择</option>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="text-slate-800">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 6) 附件/截图 (选填) */}
            <div className="space-y-2">
              <label className="block font-medium text-slate-800 text-xs">
                附件/截图 (选填)
              </label>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg,.doc,.docx"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <span className="text-sm font-bold leading-none">+</span>
                  <span>点击上传</span>
                </button>
              </div>

              {/* 格式提示 */}
              <p className="text-[11px] text-slate-400 leading-normal">
                支持上传多个文件,单个文件大小不超过10MB,支持<span className="text-rose-500 font-mono">pdf/xlsx/xls/png/jpg/jpeg/doc/docx</span>格式
              </p>

              {/* 已选文件展示 */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachments.map((file) => (
                    <div 
                      key={file.id} 
                      className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] text-slate-700 max-w-full"
                    >
                      <Paperclip className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate max-w-[180px] font-medium">{file.name}</span>
                      <span className="text-slate-400 text-[10px]">({file.size})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(file.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 ml-1 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 分割线 */}
            <div className="border-t border-slate-100 pt-4" />

            {/* 7) 反馈进度 列表 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs sm:text-[13px]">反馈进度</span>
                  <span className="text-slate-500 font-medium font-mono text-xs">{feedbackList.length}</span>
                </div>
                <span className="text-[11px] text-slate-400">仅展示与你相关的需求</span>
              </div>

              {/* 反馈进度表格 */}
              <div className="border border-slate-200/90 rounded-lg overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">需求描述</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">提交时间</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap">进度</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">预计上线日期</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">实际上线日期</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {feedbackList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            暂无数据
                          </td>
                        </tr>
                      ) : (
                        feedbackList.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 max-w-[180px]">
                              <div className="truncate font-medium text-slate-900" title={item.desc}>
                                {item.desc}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span>{item.type}</span>
                                {item.priority && <span className="text-blue-600">[{item.priority}]</span>}
                                {item.attachmentCount > 0 && <span>📎 {item.attachmentCount}</span>}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                              {item.submitTime}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${item.statusColor}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                              {item.estimatedDate}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                              {item.actualDate}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 表格底部信息与分页 */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <div>产品经理：林泽鹏</div>
                <div className="flex items-center gap-2">
                  <button className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer" disabled>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-slate-600 font-medium">1</span>
                  <button className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer" disabled>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span>共 {feedbackList.length} 条</span>
                </div>
              </div>
            </div>

          </div>

          {/* 3. 底部操作栏 */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors cursor-pointer shadow-2xs"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              提交
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
