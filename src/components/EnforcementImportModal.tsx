import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Building2, 
  FileText, 
  Check, 
  Zap, 
  Info,
  Layers,
  Scale
} from 'lucide-react';
import { EnforcementCase, EnforcementCaseType } from '../types';

interface EnforcementImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCases: (newCases: Partial<EnforcementCase>[]) => void;
}

export const EnforcementImportModal: React.FC<EnforcementImportModalProps> = ({
  isOpen,
  onClose,
  onImportCases,
}) => {
  const [activeTab, setActiveTab] = useState<'BATCH_FILE' | 'AI_RULING_TEXT' | 'AGENCY_REPORT'>('BATCH_FILE');
  
  // Tab 1: File Batch Import State
  const [isParsing, setIsParsing] = useState(false);
  const [parsedCases, setParsedCases] = useState<Partial<EnforcementCase>[]>([]);

  // Tab 2: AI Ruling / Document Text Parse State
  const [pastedDocText, setPastedDocText] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiParsedCase, setAiParsedCase] = useState<Partial<EnforcementCase>[] | null>(null);

  // Tab 3: Agency Progress Sync State
  const [selectedLawFirm, setSelectedLawFirm] = useState('北京市柳沈律师事务所');
  const [isAgencySyncing, setIsAgencySyncing] = useState(false);

  if (!isOpen) return null;

  // Sample batch cases
  const sampleBatchCases: Partial<EnforcementCase>[] = [
    {
      caseNo: `YY-202403-88`,
      type: 'OPPOSITION',
      targetTrademark: 'USMILE TECH 悠思麦',
      targetRegNo: '79201844',
      targetApplicant: '深圳市前海某某跨境科技有限公司',
      ourTrademark: 'usmile (第42881903号 驰名商标)',
      classes: [21],
      jurisdiction: 'CN',
      groundsSummary: '与我方第42881903号驰名商标高保真近似，且指定相同第21类电动牙刷，具有明显傍名牌恶意。',
      status: 'UNDER_HEARING',
      lawFirm: '北京市柳沈律师事务所',
      handler: '林悦',
      budget: 8500,
      riskLevel: 'CRITICAL',
      filingDeadline: '2024-06-01',
      progressPercent: 65
    },
    {
      caseNo: `WX-202403-12`,
      type: 'INVALIDATION',
      targetTrademark: '笑容家 SMILE HOME',
      targetRegNo: '79110452',
      targetApplicant: '广州某某日用品制造有限公司',
      ourTrademark: '笑容加 (核心字号)',
      classes: [3],
      jurisdiction: 'CN',
      groundsSummary: '同音字替换“加”为“家”，英文含有 SMILE，指定第3类牙膏洗护，易导致消费者混淆。',
      status: 'SUBMITTED',
      lawFirm: '北京金杜律师事务所',
      handler: '王哲',
      budget: 15000,
      riskLevel: 'HIGH',
      filingDeadline: '2024-05-20',
      progressPercent: 40
    }
  ];

  // Handler: Load sample batch
  const handleLoadSampleBatch = () => {
    setIsParsing(true);
    setTimeout(() => {
      setParsedCases(sampleBatchCases);
      setIsParsing(false);
    }, 400);
  };

  // Handler: Download CSV template
  const handleDownloadTemplate = () => {
    const templateContent = '\uFEFF' + [
      '维权案号,维权类型,涉案商标名,涉案注册号,对方当事人/申请人,我方引证商标,尼斯分类,目标法域,维权事实与理由,承办律所,经办人,维权预算,风险等级',
      'YY-202404-01,初审公告期商标异议,USMILE PLUS,79910023,深圳某某实业有限公司,usmile (第42881903号),21,CN 中国,英文高度近似且指定电动牙刷,北京市柳沈律师事务所,林悦,8500,极高风险',
      'WX-202404-02,在先权利无效宣告请求,笑容家,79920045,广州某某贸易有限公司,笑容加 (核心字号),3,CN 中国,同音字恶意抄袭字号,北京金杜律师事务所,王哲,15000,高风险'
    ].join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '商标维权案件台账批量导入模板.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handler: Confirm batch import
  const handleConfirmBatchImport = () => {
    if (parsedCases.length === 0) return;
    onImportCases(parsedCases);
    onClose();
  };

  // Handler: AI Document / Ruling Text parse
  const handleAiParseDoc = () => {
    if (!pastedDocText.trim()) return;
    setIsAiAnalyzing(true);

    setTimeout(() => {
      const isUsmile = pastedDocText.toLowerCase().includes('usmile') || pastedDocText.includes('优思');
      const isXiaorong = pastedDocText.includes('笑容') || pastedDocText.includes('笑');
      
      const newCase: Partial<EnforcementCase> = {
        caseNo: `YY-2024${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(10 + Math.random() * 90)}`,
        type: pastedDocText.includes('无效') ? 'INVALIDATION' : (pastedDocText.includes('驳回') ? 'REFUSAL_REVIEW' : 'OPPOSITION'),
        targetTrademark: pastedDocText.match(/涉案商标[：:]\s*([^\s,，;；]+)/)?.[1] || (isUsmile ? 'USMILE PLUS' : '笑容佳宝'),
        targetRegNo: pastedDocText.match(/\d{7,9}/)?.[0] || '79881023',
        targetApplicant: pastedDocText.match(/被申请人|申请人|对方当事人[：:]\s*([^\s,，;；]+)/)?.[1] || '深圳市某某创新发展合伙企业',
        ourTrademark: isXiaorong ? '笑容加 (核心字号)' : 'usmile (第42881903号 驰名商标)',
        classes: [Number(pastedDocText.match(/第?\s*(\d{1,2})\s*类/)?.[1] || 21)],
        jurisdiction: 'CN',
        groundsSummary: `经 AI 智能解析官方文书：${pastedDocText.slice(0, 120)}...`,
        status: 'SUBMITTED',
        lawFirm: '北京市柳沈律师事务所',
        handler: '林悦',
        budget: 8500,
        riskLevel: 'CRITICAL',
        filingDeadline: '2024-05-30',
        progressPercent: 50
      };

      setAiParsedCase([newCase]);
      setIsAiAnalyzing(false);
    }, 600);
  };

  // Handler: Confirm AI parse import
  const handleConfirmAiImport = () => {
    if (!aiParsedCase) return;
    onImportCases(aiParsedCase);
    onClose();
  };

  // Handler: Agency progress sync
  const handleAgencySync = () => {
    setIsAgencySyncing(true);
    setTimeout(() => {
      onImportCases(sampleBatchCases);
      setIsAgencySyncing(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 font-display">
                  导入维权案件台账 / 官方文书解析
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  零外部API依赖 · 律所台账互通
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                支持律师事务所 Excel 维权进度表批量导入、官方裁定文书/受理通知书 AI 智能提取与历史卷宗对齐
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-100 bg-slate-50/50 gap-2">
          <button
            onClick={() => setActiveTab('BATCH_FILE')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'BATCH_FILE'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>维权案件台账 Excel/CSV 批量导入</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_RULING_TEXT')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'AI_RULING_TEXT'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>官方裁定书 / 受理文书 AI 解析</span>
          </button>

          <button
            onClick={() => setActiveTab('AGENCY_REPORT')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'AGENCY_REPORT'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>合作律所维权月报自动对齐</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 flex-1">

          {/* TAB 1: 批量文件导入 */}
          {activeTab === 'BATCH_FILE' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  将律所交付的维权诉讼进度表或法务内部台账直接上传。系统将自动解析案号、涉案商标、当事人主体、法定期限与审理状态。
                </div>
              </div>

              {/* 上传拖拽区域 */}
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/60 hover:bg-blue-50/20 transition-all cursor-pointer space-y-2">
                <FileSpreadsheet className="w-9 h-9 text-blue-600 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    点击选择文件 或 将律所维权案件台账拖拽至此处
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    支持 .xlsx, .xls, .csv 格式（自动兼容主流律所报表表头）
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-[11px] font-medium text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>下载维权台账模板.csv</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSampleBatch}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>一键载入律所维权案卷样例 (2件)</span>
                  </button>
                </div>
              </div>

              {/* 导入预览列表 */}
              {parsedCases.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      待入库维权案件预览 ({parsedCases.length} 件)
                    </span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                      已自动匹配我方引证商标与代理律所
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {parsedCases.map((item, idx) => (
                      <div key={item.caseNo} className="p-3 bg-white hover:bg-slate-50/80 flex items-center justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-700">{item.caseNo}</span>
                            <span className="font-bold text-slate-900">{item.targetTrademark}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                              第 {item.classes?.[0] || 21} 类
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            对方主体：{item.targetApplicant} · 承办律所：{item.lawFirm} · 经办人：{item.handler}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
                            {item.status === 'UNDER_HEARING' ? '审理中' : '已递交'}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">预算: ¥{item.budget?.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: AI 裁定文书智能解析 */}
          {activeTab === 'AI_RULING_TEXT' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start gap-2.5 text-xs text-purple-950">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  直接粘贴商标局《异议申请受理通知书》、《无效宣告请求裁定书》或《驳回复审决定书》全文摘要，AI 自动提取案由、当事人、裁判要旨并更新台账。
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  粘贴官方裁判文书 / 受理通知 / 答辩书摘要
                </label>
                <textarea
                  rows={4}
                  value={pastedDocText}
                  onChange={(e) => setPastedDocText(e.target.value)}
                  placeholder="例如：国家知识产权局商标异议答辩通知书摘要：关于第79881023号第21类【USMILE PLUS】商标异议案，异议人广州星际悦动股份有限公司，被异议人深圳市某某创新发展合伙企业。现商标局已完成形式审查..."
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-purple-500 font-sans"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    支持 OCR 识别后的文本或电子公文通知
                  </span>
                  <button
                    type="button"
                    disabled={!pastedDocText.trim() || isAiAnalyzing}
                    onClick={handleAiParseDoc}
                    className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                  >
                    {isAiAnalyzing ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>AI 正在结构化提取中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>智能解析官方文书</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI 提取结果卡片 */}
              {aiParsedCase && aiParsedCase[0] && (
                <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      官方文书解析完成 · 已生成结构化案卷
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold">
                      {aiParsedCase[0].caseNo}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-purple-100">
                      <span className="text-[10px] text-slate-400 block">涉案商标名</span>
                      <span className="font-bold text-slate-900">{aiParsedCase[0].targetTrademark}</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-purple-100">
                      <span className="text-[10px] text-slate-400 block">注册申请号</span>
                      <span className="font-bold text-slate-900">{aiParsedCase[0].targetRegNo}</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-purple-100">
                      <span className="text-[10px] text-slate-400 block">尼斯分类</span>
                      <span className="font-bold text-slate-900">第 {aiParsedCase[0].classes?.[0] || 21} 类</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-purple-100">
                      <span className="text-[10px] text-slate-400 block">我方引证权利</span>
                      <span className="font-bold text-blue-700">{aiParsedCase[0].ourTrademark}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-purple-100 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800">文书事实与法理核心：</span>
                    {aiParsedCase[0].groundsSummary}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: 律所维权月报自动对齐 */}
          {activeTab === 'AGENCY_REPORT' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-950">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  选择合作承办律所与当期维权进度月报，系统将自动对齐审理节点、更新裁定状态与案件进展百分比。
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">承办知识产权律所</label>
                  <select
                    value={selectedLawFirm}
                    onChange={(e) => setSelectedLawFirm(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="北京市柳沈律师事务所">北京市柳沈律师事务所 (异议/驳复专案组)</option>
                    <option value="北京金杜律师事务所">北京金杜律师事务所 (无效宣告专案组)</option>
                    <option value="北京市中伦律师事务所">北京市中伦律师事务所 (维权诉讼专案组)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">月报统计周期</label>
                  <select
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option>2024年3月维权案件进展月报 (含新受理通知书)</option>
                    <option>2024年2月维权案件进展月报</option>
                    <option>2024年1月年度维权总结报告</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">待同步案卷清单</span>
                  <span className="text-[11px] text-slate-500">包含 2 件正在办理审理进展的案件</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  点击下方按钮可直接将【{selectedLawFirm}】最新跟进记录与已下发的官方受理文号同步至维权管理台账中。
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {activeTab === 'BATCH_FILE' && `已选择 ${parsedCases.length} 件维权案卷`}
            {activeTab === 'AI_RULING_TEXT' && (aiParsedCase ? '1 件已解析案卷' : '等待粘贴文书')}
            {activeTab === 'AGENCY_REPORT' && `承办律所：${selectedLawFirm}`}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              取消
            </button>

            {activeTab === 'BATCH_FILE' && (
              <button
                disabled={parsedCases.length === 0}
                onClick={handleConfirmBatchImport}
                className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>确认导入维权台账 ({parsedCases.length})</span>
              </button>
            )}

            {activeTab === 'AI_RULING_TEXT' && (
              <button
                disabled={!aiParsedCase}
                onClick={handleConfirmAiImport}
                className="px-5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>录入维权台账</span>
              </button>
            )}

            {activeTab === 'AGENCY_REPORT' && (
              <button
                disabled={isAgencySyncing}
                onClick={handleAgencySync}
                className="px-5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{isAgencySyncing ? '正在同步入库...' : '一键同步律所进度'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
