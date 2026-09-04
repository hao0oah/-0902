import React, { useState, useEffect } from 'react';
import { X, Plus, Search, ChevronDown, Check, UploadCloud, FileText, Radar } from 'lucide-react';
import { MonitoringAlert } from '../types';
import { NICE_CLASSES_45 } from './ApplicationCenter';

interface AddMonitoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newAlert: MonitoringAlert) => void;
  onEdit?: (updatedAlert: MonitoringAlert) => void;
  initialData?: MonitoringAlert | null;
}

export const AddMonitoringModal: React.FC<AddMonitoringModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  onEdit,
  initialData,
}) => {
  const [nameError, setNameError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [adviceError, setAdviceError] = useState(false);
  const [decisionError, setDecisionError] = useState(false);

  // 1. 基础商标信息
  const [targetName, setTargetName] = useState('');
  const [riskLevel, setRiskLevel] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  
  // 尼斯分类多选 (与维权中心一致)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [classSearchKeyword, setClassSearchKeyword] = useState('');

  // 多图图样
  const [logoUrls, setLogoUrls] = useState<string[]>([]);

  const [regNo, setRegNo] = useState('');
  const [applicant, setApplicant] = useState('');
  const [applyDate, setApplyDate] = useState('');
  const [similarGroupAndGoods, setSimilarGroupAndGoods] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [oppositionDeadline, setOppositionDeadline] = useState('');
  const [priorRights, setPriorRights] = useState('');

  // 2. 研判与处理建议
  const [proposalAdvice, setProposalAdvice] = useState('');
  const [supportProbability, setSupportProbability] = useState('');
  const [considerationFactors, setConsiderationFactors] = useState('');

  // 3. 办理履历与节点
  const [submissionDate, setSubmissionDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [processingDecision, setProcessingDecision] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTargetName(initialData.suspectName || '');
        setRiskLevel(initialData.riskLevel || 'HIGH');
        if (initialData.suspectClass) {
          setSelectedClasses([`第${initialData.suspectClass}类`]);
        } else {
          setSelectedClasses([]);
        }
        setLogoUrls(initialData.logoUrls || (initialData.logoUrl ? [initialData.logoUrl] : []));
        setRegNo(initialData.suspectRegNo || '');
        setApplicant(initialData.suspectApplicant || '');
        setApplyDate(initialData.applyDate || '');
        setSimilarGroupAndGoods(initialData.similarGroupAndGoods || '');
        setRegistrationDate(initialData.registrationDate || initialData.gazetteDate || '');
        setOppositionDeadline(initialData.oppositionDeadline || '');
        setPriorRights(initialData.priorRights || initialData.matchedOurTrademark || '');
        setProposalAdvice(initialData.proposalAdvice || '');
        setSupportProbability(initialData.supportProbability || '');
        setConsiderationFactors(initialData.considerationFactors || '');
        setSubmissionDate(initialData.submissionDate || '');
        setCompletionDate(initialData.completionDate || '');
        setProcessingDecision(initialData.processingDecision || '');
        setRemarks(initialData.remarks || '');
        setNameError(false);
        setLogoError(false);
        setAdviceError(false);
        setDecisionError(false);
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTargetName('');
    setRiskLevel('HIGH');
    setSelectedClasses([]);
    setLogoUrls([]);
    setRegNo('');
    setApplicant('');
    setApplyDate('');
    setSimilarGroupAndGoods('');
    setRegistrationDate('');
    setOppositionDeadline('');
    setPriorRights('');
    setProposalAdvice('');
    setSupportProbability('');
    setConsiderationFactors('');
    setSubmissionDate('');
    setCompletionDate('');
    setProcessingDecision('');
    setRemarks('');
    setNameError(false);
    setLogoError(false);
    setAdviceError(false);
    setDecisionError(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 类别切换处理
  const handleToggleClass = (code: string) => {
    setSelectedClasses(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSetQuickClasses = (codes: string[]) => {
    setSelectedClasses(codes);
  };

  // 多图上传处理
  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      setLogoError(false);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setLogoUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setLogoUrls(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setLogoError(true);
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (e) e.preventDefault();
    let hasError = false;

    if (!targetName.trim()) {
      setNameError(true);
      hasError = true;
    } else {
      setNameError(false);
    }

    if (logoUrls.length === 0) {
      setLogoError(true);
      hasError = true;
    } else {
      setLogoError(false);
    }

    if (!proposalAdvice.trim()) {
      setAdviceError(true);
      hasError = true;
    } else {
      setAdviceError(false);
    }

    if (!processingDecision.trim()) {
      setDecisionError(true);
      hasError = true;
    } else {
      setDecisionError(false);
    }

    if (hasError) return;

    // 解析出第一个主类别数字
    const firstClassCode = selectedClasses[0] || '21';
    const parsedClass = parseInt(firstClassCode.replace(/[^0-9]/g, ''), 10) || 21;

    const deadlineDate = oppositionDeadline || new Date(Date.now() + 85 * 86400000).toISOString().split('T')[0];
    const diffDays = Math.max(0, Math.ceil((new Date(deadlineDate).getTime() - Date.now()) / (1000 * 3600 * 24)));

    const alertData: MonitoringAlert = {
      id: initialData ? initialData.id : `RADAR-${Date.now().toString().slice(-4)}`,
      suspectName: targetName.trim(),
      suspectRegNo: regNo.trim() || (initialData ? initialData.suspectRegNo : `79${Math.floor(100000 + Math.random() * 900000)}`),
      suspectApplicant: applicant.trim() || (initialData ? initialData.suspectApplicant : ''),
      suspectClass: parsedClass,
      gazetteNumber: initialData ? initialData.gazetteNumber : '第 1878 期',
      gazetteDate: registrationDate || (initialData ? initialData.gazetteDate : new Date().toISOString().split('T')[0]),
      oppositionDeadline: deadlineDate,
      daysRemaining: diffDays,
      matchedOurTrademark: priorRights || 'usmile 笑容加',
      similarityScore: initialData ? initialData.similarityScore : 88,
      riskLevel: riskLevel,
      status: initialData ? initialData.status : 'NEW',
      similarityReason: considerationFactors || remarks || (initialData ? initialData.similarityReason : `商标监测标的，涉及类别: ${selectedClasses.join('、')}。`),

      // 拓展字段
      logoUrl: logoUrls[0] || '',
      logoUrls: logoUrls,
      applyDate: applyDate,
      similarGroupAndGoods: similarGroupAndGoods,
      registrationDate: registrationDate,
      priorRights: priorRights,
      proposalAdvice: proposalAdvice,
      supportProbability: supportProbability,
      considerationFactors: considerationFactors,
      submissionDate: submissionDate,
      completionDate: completionDate,
      processingDecision: processingDecision,
      remarks: remarks
    };

    if (initialData && onEdit) {
      onEdit(alertData);
    } else {
      onAdd(alertData);
    }
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - 与维权中心保持一致 */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? '编辑商标监测' : '新增商标监测'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {initialData ? '修改并更新该商标监测单据详情与预警研判信息' : '录入监测商标与预警需求，持续跟踪侵权与抢注风险'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - 与维权中心统一样式 */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs flex-1 bg-slate-50/30">
          
          {/* SECTION 1: 基础商标信息 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 font-bold text-slate-900 text-xs">
              <div className="w-1 h-3.5 bg-blue-600 rounded-full" />
              <span>基础商标信息</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 监测风险级别 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  监测风险级别 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as any)}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-semibold"
                  >
                    <option value="CRITICAL">极高风险 (CRITICAL - 建议立即处置)</option>
                    <option value="HIGH">高风险 (HIGH - 重点监控)</option>
                    <option value="MEDIUM">中度风险 (MEDIUM - 持续观察)</option>
                    <option value="LOW">低风险 (LOW - 基础跟踪)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 商标名称 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  商标名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={targetName}
                  onChange={(e) => {
                    setTargetName(e.target.value);
                    if (e.target.value.trim()) setNameError(false);
                  }}
                  placeholder="请输入监测的商标名称，如：USMILE PLUS"
                  className={`w-full text-xs text-slate-800 bg-white border rounded-lg px-3 py-2 focus:outline-none shadow-2xs font-medium ${
                    nameError ? 'border-rose-500 focus:border-rose-500 bg-rose-50/30' : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
                {nameError && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    * 请输入商标名称
                  </p>
                )}
              </div>

              {/* 尼斯分类 (多选与搜索下拉，完全对齐维权中心样式) */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700">
                  尼斯分类 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div 
                    onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                    className="flex items-center justify-between gap-2 min-h-[38px] p-1.5 px-2.5 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all shadow-2xs group"
                  >
                    <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                      {selectedClasses.length === 0 ? (
                        <span className="text-slate-400 text-xs">请点击选择尼斯分类 (1-45类全选与搜索)...</span>
                      ) : (
                        selectedClasses.map(code => {
                          const item = NICE_CLASSES_45.find(n => n.code === code);
                          return (
                            <span 
                              key={code} 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 shadow-2xs animate-in fade-in duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {code} {item ? `- ${item.name}` : ''}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleClass(code);
                                }}
                                className="p-0.5 hover:bg-blue-200/60 rounded text-blue-500 hover:text-blue-800 cursor-pointer"
                                title="移除此类别"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 shrink-0">
                      <span className="text-[11px] font-medium hidden sm:inline">
                        {isClassDropdownOpen ? '收起' : '选择'}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isClassDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                    </div>
                  </div>

                  {/* 下拉展开面板 */}
                  {isClassDropdownOpen && (
                    <div className="mt-2 p-3 bg-white border border-blue-200 rounded-xl shadow-lg space-y-2.5 z-20 relative animate-in fade-in zoom-in-95 duration-150">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={classSearchKeyword}
                          onChange={(e) => setClassSearchKeyword(e.target.value)}
                          placeholder="搜索类别编号或关键词（如：21、洁具、牙刷、日化、软件...）"
                          className="w-full text-xs text-slate-800 pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        {classSearchKeyword && (
                          <button
                            type="button"
                            onClick={() => setClassSearchKeyword('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] gap-1.5 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-slate-500">
                          <span>常用预设:</span>
                          <button
                            type="button"
                            onClick={() => handleSetQuickClasses(['第21类', '第03类', '第10类'])}
                            className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
                          >
                            美齿个护 (21+03+10)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetQuickClasses(['第09类', '第35类', '第42类'])}
                            className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
                          >
                            数智电商 (09+35+42)
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSetQuickClasses(['第21类'])}
                          className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
                        >
                          重置默认
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-1 text-xs">
                        {NICE_CLASSES_45.filter(item => {
                          if (!classSearchKeyword.trim()) return true;
                          const k = classSearchKeyword.trim().toLowerCase();
                          return item.code.toLowerCase().includes(k) ||
                            item.num.includes(k) ||
                            item.name.toLowerCase().includes(k) ||
                            item.desc.toLowerCase().includes(k);
                        }).map(item => {
                          const isChecked = selectedClasses.includes(item.code);
                          return (
                            <label
                              key={item.code}
                              className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleClass(item.code)}
                                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-xs flex items-center justify-between">
                                  <span>{item.code} - {item.name}</span>
                                  {isChecked && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.desc}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 商标图样：支持多图上传 (与维权中心一致) */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700">
                  商标图样 <span className="text-rose-500">* (必填)</span>
                </label>
                <div className={`border bg-white p-3.5 rounded-xl space-y-3 transition-colors ${
                  logoError ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200'
                }`}>
                  <div className="flex flex-wrap items-center gap-3">
                    {logoUrls.map((imgUrl, index) => (
                      <div 
                        key={index} 
                        className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden relative group shadow-2xs"
                      >
                        <img src={imgUrl} alt={`商标图样 ${index + 1}`} className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-slate-900/70 hover:bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-xs"
                          title="移除此图样"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-slate-900/60 text-white text-[9px] px-1 rounded backdrop-blur-2xs font-mono">
                          #{index + 1}
                        </span>
                      </div>
                    ))}

                    <label className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all flex flex-col items-center justify-center gap-1 shadow-2xs min-w-[110px] h-20 border-dashed group ${
                      logoError
                        ? 'bg-rose-50/80 text-rose-600 border-rose-300 hover:border-rose-400 hover:bg-rose-100/80'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-400'
                    }`}>
                      <UploadCloud className={`w-5 h-5 group-hover:scale-110 transition-transform ${logoError ? 'text-rose-600' : 'text-blue-600'}`} />
                      <span>上传商标图样</span>
                      <span className={`text-[10px] ${logoError ? 'text-rose-500/80' : 'text-blue-500/80'}`}>(必填)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleMultipleImageUpload}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400">支持上传单张或多张 PNG、JPG、WEBP 格式黑白或彩色商标矢量样图</p>
                </div>
                {logoError && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    * 请上传至少一张商标图样
                  </p>
                )}
              </div>

              {/* 申请号 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">申请号</label>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="例如：79281043"
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                />
              </div>

              {/* 申请人 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">申请人</label>
                <input
                  type="text"
                  value={applicant}
                  onChange={(e) => setApplicant(e.target.value)}
                  placeholder="例如：深圳市某某科技股份有限公司"
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              {/* 申请日 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">申请日</label>
                <input
                  type="date"
                  value={applyDate}
                  onChange={(e) => setApplyDate(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                />
              </div>

              {/* 注册公告日 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">注册公告日</label>
                <input
                  type="date"
                  value={registrationDate}
                  onChange={(e) => setRegistrationDate(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                />
              </div>

              {/* 绝限期 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">绝限期</label>
                <input
                  type="date"
                  value={oppositionDeadline}
                  onChange={(e) => setOppositionDeadline(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                />
              </div>

              {/* 在先权利 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">在先权利</label>
                <input
                  type="text"
                  value={priorRights}
                  onChange={(e) => setPriorRights(e.target.value)}
                  placeholder="例如：我司在先商标 usmile (第42881903号 驰名商标)"
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              {/* 类似群及商品 (大输入框 Textarea) */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700">类似群及商品</label>
                <textarea
                  rows={3}
                  value={similarGroupAndGoods}
                  onChange={(e) => setSimilarGroupAndGoods(e.target.value)}
                  placeholder="例如：2101-电动牙刷; 2106-洁齿牙签; 2108-牙刷; 2110-牙线; 2112-漱口水"
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs leading-relaxed resize-none"
                />
              </div>

            </div>
          </div>


          {/* SECTION 2: 处理建议及决策 */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 font-bold text-slate-900 text-xs">
              <div className="w-1 h-3.5 bg-blue-600 rounded-full" />
              <span>研判与建议决策</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 处理建议 (下拉/自定义) */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  处理建议 <span className="text-rose-500">* (必填)</span>
                </label>
                <div className="relative">
                  <select
                    value={proposalAdvice}
                    onChange={(e) => {
                      setProposalAdvice(e.target.value);
                      if (e.target.value.trim()) setAdviceError(false);
                    }}
                    className={`w-full text-xs text-slate-800 bg-white border rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none shadow-2xs font-semibold ${
                      adviceError ? 'border-rose-500 focus:border-rose-500 bg-rose-50/30' : 'border-slate-300 focus:border-blue-500'
                    }`}
                  >
                    <option value="">-- 请选择处理建议 --</option>
                    <option value="建议提起商标异议">建议提起商标异议</option>
                    <option value="建议无效宣告">建议无效宣告</option>
                    <option value="建议观察暂不处置">建议观察暂不处置</option>
                    <option value="建议异议+买标并行">建议异议+买标并行</option>
                    <option value="建议撤三宣告">建议撤三宣告</option>
                    <option value="已归档/忽略">已归档/忽略</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {adviceError && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    * 请选择处理建议
                  </p>
                )}
              </div>

              {/* 获支持概率 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">获支持概率</label>
                <input
                  type="text"
                  value={supportProbability}
                  onChange={(e) => setSupportProbability(e.target.value)}
                  placeholder="例如：85% (高概率支持)"
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                />
              </div>

              {/* 建议考虑因素 (大输入框 Textarea) */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700">建议考虑因素</label>
                <textarea
                  rows={3}
                  value={considerationFactors}
                  onChange={(e) => setConsiderationFactors(e.target.value)}
                  placeholder="例如：标识与我司核心品牌高度近似，核定商品完全覆盖，申请人具备恶意抢注背景，建议优先通过商标异议阻断其注册。"
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>


          {/* SECTION 3: 办理履历与节点 */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 font-bold text-slate-900 text-xs">
              <div className="w-1 h-3.5 bg-blue-600 rounded-full" />
              <span>办理履历与节点</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 递交日 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">递交日</label>
                <input
                  type="date"
                  value={submissionDate}
                  onChange={(e) => setSubmissionDate(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                />
              </div>

              {/* 完成/预计完成日 */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">完成/预计完成日</label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                />
              </div>

              {/* 处理决策 */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700">
                  处理决策 <span className="text-rose-500">* (必填)</span>
                </label>
                <input
                  type="text"
                  value={processingDecision}
                  onChange={(e) => {
                    setProcessingDecision(e.target.value);
                    if (e.target.value.trim()) setDecisionError(false);
                  }}
                  placeholder="例如：拟提起异议立案 / 已批准提起异议立案申请"
                  className={`w-full text-xs text-slate-800 bg-white border rounded-lg px-3 py-2 focus:outline-none shadow-2xs font-medium ${
                    decisionError ? 'border-rose-500 focus:border-rose-500 bg-rose-50/30' : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
                {decisionError && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    * 请输入处理决策
                  </p>
                )}
              </div>

              {/* 备注 (大输入框 Textarea) */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700">备注</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="请输入其他监测说明或案件备注..."
                  className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Modal Footer Buttons - 与维权中心保持一致 */}
        <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 shrink-0 bg-white px-6 py-3">
          <span className="text-[11px] text-slate-400">
            录入后将自动绑定至全流程监控台账，并协同后续预警跟踪
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-normal text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors cursor-pointer shadow-2xs"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.98]"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
