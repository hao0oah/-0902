import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  ChevronDown, 
  Search, 
  Check, 
  UploadCloud, 
  FileText
} from 'lucide-react';
import { MonitoringAlert, EnforcementCase } from '../types';
import { NICE_CLASSES_45 } from './ApplicationCenter';

interface InitiateEnforcementModalProps {
  isOpen: boolean;
  alert: MonitoringAlert | null;
  onClose: () => void;
  onSubmit: (alert: MonitoringAlert, customData: Partial<EnforcementCase>) => void;
}

export const InitiateEnforcementModal: React.FC<InitiateEnforcementModalProps> = ({
  isOpen,
  alert,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    businessType: '商标异议申请',
    status: 'SUBMITTED',
    proposalDepartment: '品牌知产中心',
    undertakingDepartment: '品牌知产中心',
    undertaker: '林悦',
    outsourcingType: '全部委外',
    agencyName: '北京市柳沈律师事务所',
    agencyCaseNo: 'LS-2026-TM-88219',
    entrustmentDate: '2026-08-20',
    agencyRemarks: '',
    fileOpeningDate: '2026-08-15',
    submissionMethod: '电子递交 (网上申请系统)',
    deadline: '2026-09-30',
    processingDeadline: '2026-09-30',
    submissionDate: '2026-08-25',
    rulingDate: '',
    proposalAdvice: '',
    remarks: '',
    trademarkName: '',
    classes: ['第21类'],
    goodsAndServices: '2101-电动牙刷; 2108-牙刷; 2110-牙线; 2112-漱口水; 2114-冲牙器',
    targetRegNo: '',
    targetApplicant: '',
    applicationDate: '2024-03-15',
    applicantAddress: '广东省深圳市南山区粤海街道科技园中区10栋501',
    registrationDate: '',
    preliminaryNoticePeriod: '第1889期 (2025-05-06 至 2025-08-06)',
    country: '中国 (CN)',
    expiryDate: '',
    ourTrademark: 'usmile (第42881903号)',
    citedTrademarkClass: ['第21类', '第03类', '第05类'],
    trademarkImages: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=300&q=80'
    ] as string[],
    agencyContact: '林悦 律师',
    agencyPhone: '010-66578899',
    requesterName: '广州星际悦动股份有限公司',
    requesterAddress: '广东省广州市天河区黄埔大道西100号富力盈普大厦38楼',
    requesterPostcode: '510623',
    requesterPhone: '020-85596688',
    requesterContact: '知产合规组',
    brand: 'usmile',
    attachments: [
      { name: '官方初审公告页扫描件.pdf', size: '2.4 MB' },
      { name: 'usmile驰名商标在先使用证明集.zip', size: '15.8 MB' }
    ] as { name: string; size: string }[],
  });

  // 类别下拉组件状态
  const [isTrademarkClassDropdownOpen, setIsTrademarkClassDropdownOpen] = useState(false);
  const [trademarkClassSearchKeyword, setTrademarkClassSearchKeyword] = useState('');

  const [isCitedClassDropdownOpen, setIsCitedClassDropdownOpen] = useState(false);
  const [citedClassSearchKeyword, setCitedClassSearchKeyword] = useState('');

  useEffect(() => {
    if (alert) {
      const clsCode = alert.suspectClass ? `第${alert.suspectClass < 10 ? '0' + alert.suspectClass : alert.suspectClass}类` : '第21类';
      setFormData({
        name: `针对【${alert.suspectName}】商标异议立案`,
        businessType: '商标异议申请',
        status: 'SUBMITTED',
        proposalDepartment: '品牌知产中心',
        undertakingDepartment: '品牌知产中心',
        undertaker: '林悦',
        outsourcingType: '全部委外',
        agencyName: '北京市柳沈律师事务所',
        agencyCaseNo: `LS-2026-TM-${alert.suspectRegNo || '88219'}`,
        entrustmentDate: '2026-08-20',
        agencyRemarks: `请代理律所优先撰写针对【${alert.suspectName}】的异议申请书并组织我方驰名商标证据链。`,
        fileOpeningDate: '2026-08-15',
        submissionMethod: '电子递交 (网上申请系统)',
        deadline: alert.oppositionDeadline ? `2026-${alert.oppositionDeadline.slice(5)}` : '2026-09-30',
        processingDeadline: alert.oppositionDeadline ? `2026-${alert.oppositionDeadline.slice(5)}` : '2026-09-30',
        submissionDate: '2026-08-25',
        rulingDate: '',
        proposalAdvice: alert.similarityReason || `涉嫌侵权商标【${alert.suspectName}】与我方核准注册商标“usmile”高度近似，核定使用于相同及类似商品上，易造成消费者混淆误认，特申请提起商标异议立案，进行官方审查干预与维权存证。`,
        remarks: alert.remarks || '系系统监测扫描自动生成的商标异议预警单据，拟转入维权流程。',
        trademarkName: alert.suspectName,
        classes: [clsCode],
        goodsAndServices: '2101-电动牙刷; 2108-牙刷; 2110-牙线; 2112-漱口水; 2114-冲牙器',
        targetRegNo: alert.suspectRegNo,
        targetApplicant: alert.suspectApplicant,
        applicationDate: '2024-03-15',
        applicantAddress: '广东省深圳市南山区粤海街道科技园中区10栋501',
        registrationDate: '',
        preliminaryNoticePeriod: '第1889期 (2025-05-06 至 2025-08-06)',
        country: '中国 (CN)',
        expiryDate: '',
        ourTrademark: alert.matchedOurTrademark || 'usmile (第42881903号)',
        citedTrademarkClass: ['第21类', '第03类', '第05类'],
        trademarkImages: alert.suspectImage ? [alert.suspectImage] : [
          'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=300&q=80'
        ],
        agencyContact: '林悦 律师',
        agencyPhone: '010-66578899',
        requesterName: '广州星际悦动股份有限公司',
        requesterAddress: '广东省广州市天河区黄埔大道西100号富力盈普大厦38楼',
        requesterPostcode: '510623',
        requesterPhone: '020-85596688',
        requesterContact: '知产合规组',
        brand: 'usmile',
        attachments: [
          { name: '官方初审公告页扫描件.pdf', size: '2.4 MB' },
          { name: 'usmile驰名商标在先使用证明集.zip', size: '15.8 MB' }
        ],
      });
    }
  }, [alert]);

  if (!isOpen || !alert) return null;

  // 类别勾选切换
  const handleToggleTrademarkClass = (code: string) => {
    setFormData(prev => {
      const exists = prev.classes.includes(code);
      return {
        ...prev,
        classes: exists ? prev.classes.filter(c => c !== code) : [...prev.classes, code]
      };
    });
  };

  const handleSetQuickTrademarkClasses = (codes: string[]) => {
    setFormData(prev => ({ ...prev, classes: codes }));
  };

  const handleToggleCitedClass = (code: string) => {
    setFormData(prev => {
      const exists = prev.citedTrademarkClass.includes(code);
      return {
        ...prev,
        citedTrademarkClass: exists ? prev.citedTrademarkClass.filter(c => c !== code) : [...prev.citedTrademarkClass, code]
      };
    });
  };

  const handleSetQuickCitedClasses = (codes: string[]) => {
    setFormData(prev => ({ ...prev, citedTrademarkClass: codes }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.trademarkName || !formData.targetRegNo) {
      window.alert('请填写涉案商标名及申请号/注册号');
      return;
    }

    // 解析类别数组
    let parsedClasses: number[] = [21];
    if (Array.isArray(formData.classes) && formData.classes.length > 0) {
      parsedClasses = formData.classes.map(c => {
        const match = String(c).match(/\d+/);
        return match ? parseInt(match[0]) : 21;
      });
    }

    const customData: Partial<EnforcementCase> = {
      name: formData.name || `针对【${formData.trademarkName}】维权异议立案`,
      targetTrademark: formData.trademarkName,
      targetRegNo: formData.targetRegNo,
      targetApplicant: formData.targetApplicant || alert.suspectApplicant,
      ourTrademark: formData.ourTrademark || 'usmile (第42881903号)',
      classes: parsedClasses,
      riskLevel: alert.riskLevel || 'CRITICAL',
      groundsSummary: formData.proposalAdvice || formData.remarks || alert.similarityReason,
      budget: 8500,
      lawFirm: formData.agencyName || '北京市柳沈律师事务所',
      handler: formData.undertaker || formData.requesterContact || '林悦',
      filingDeadline: formData.processingDeadline || formData.deadline || '2026-09-30',
      status: (formData.status as any) || 'SUBMITTED',
      type: 'OPPOSITION',
      progressPercent: 25,

      // 表单全量属性透传
      businessType: formData.businessType,
      proposalDepartment: formData.proposalDepartment,
      undertakingDepartment: formData.undertakingDepartment,
      undertaker: formData.undertaker,
      outsourcingType: formData.outsourcingType,
      agencyCaseNo: formData.agencyCaseNo,
      entrustmentDate: formData.entrustmentDate,
      agencyRemarks: formData.agencyRemarks,
      fileOpeningDate: formData.fileOpeningDate,
      submissionMethod: formData.submissionMethod,
      processingDeadline: formData.processingDeadline || formData.deadline,
      submissionDate: formData.submissionDate,
      rulingDate: formData.rulingDate,
      proposalAdvice: formData.proposalAdvice,
      remarks: formData.remarks,
      goodsAndServices: formData.goodsAndServices,
      applicationDate: formData.applicationDate,
      applicantAddress: formData.applicantAddress,
      registrationDate: formData.registrationDate,
      preliminaryNoticePeriod: formData.preliminaryNoticePeriod,
      country: formData.country,
      expiryDate: formData.expiryDate,
      citedTrademarkClass: formData.citedTrademarkClass,
      trademarkImages: formData.trademarkImages,
      agencyName: formData.agencyName,
      agencyContact: formData.agencyContact,
      agencyPhone: formData.agencyPhone,
      requesterName: formData.requesterName,
      requesterAddress: formData.requesterAddress,
      requesterPostcode: formData.requesterPostcode,
      requesterPhone: formData.requesterPhone,
      requesterContact: formData.requesterContact,
      brand: formData.brand,
      attachments: formData.attachments
    };

    onSubmit(alert, customData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-6xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 space-y-4 animate-in zoom-in-95 duration-200 max-h-[95vh] h-[92vh] flex flex-col">
        
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                发起商标维权
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                向商标局提出异议申请或无效宣告，维护 usmile 品牌独占商誉
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单主体区 (可滚动, 4大板块全字段标准平铺布局) */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="overflow-y-auto space-y-6 pr-1.5 flex-1 text-xs">
            
            {/* 板块 1：基本信息 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 font-bold text-slate-900 text-xs">
                <div className="w-1 h-3.5 bg-blue-600 rounded-full" />
                <span>基本信息</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* 名称 */}
                <div className="space-y-1 sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-medium text-slate-700">
                    名称 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如：针对【u-smile】抢注商标的第21类异议立案申请"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                  />
                </div>

                {/* 业务类型 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">业务类型</label>
                  <div className="relative">
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                    >
                      <option value="商标异议申请">商标异议申请 (初审公告期)</option>
                      <option value="商标驳回复查">商标驳回复查 / 复审申请</option>
                      <option value="在先权利无效宣告">在先权利无效宣告请求 (注册5年内)</option>
                      <option value="撤销连续三年不使用">撤销连续三年不使用申请 (撤三)</option>
                      <option value="被异议官方答辩">被异议 / 被无效宣告官方答辩</option>
                      <option value="海关保护备案">海关维权防护备案</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 案件状态 (下拉选项) */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700 flex items-center justify-between">
                    <span>案件状态</span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-medium border border-blue-200/60">下拉选择</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full text-xs text-blue-900 bg-blue-50/30 border border-blue-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-semibold"
                    >
                      <option value="PENDING_START">待启动</option>
                      <option value="EVIDENCE_PREP">证据准备中 / 理由撰写中</option>
                      <option value="SUBMITTED">已正式递交 (待审理)</option>
                      <option value="UNDER_HEARING">商标局审理中 / 答辩期</option>
                      <option value="WIN">维权成功 (裁定胜诉/宣告无效)</option>
                      <option value="LOST">维权不成立 (异议/复审被驳回)</option>
                      <option value="SETTLED">和解结案 (已签署和解/撤回)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 提案部门 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">提案部门</label>
                  <div className="relative">
                    <select
                      value={formData.proposalDepartment}
                      onChange={(e) => setFormData({ ...formData, proposalDepartment: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                    >
                      <option value="品牌知产中心">品牌知产中心</option>
                      <option value="法务合规部">法务合规部</option>
                      <option value="研发知产组">研发知产组</option>
                      <option value="市场营销部">市场营销部</option>
                      <option value="海外事业中心">海外事业中心</option>
                      <option value="供应链管理部">供应链管理部</option>
                      <option value="品牌管理部">品牌管理部</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 承办部门 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">承办部门</label>
                  <div className="relative">
                    <select
                      value={formData.undertakingDepartment}
                      onChange={(e) => setFormData({ ...formData, undertakingDepartment: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                    >
                      <option value="品牌知产中心">品牌知产中心</option>
                      <option value="法务合规部">法务合规部</option>
                      <option value="研发知产组">研发知产组</option>
                      <option value="海外知产部">海外知产部</option>
                      <option value="知产维权运营部">知产维权运营部</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 承办人 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">承办人</label>
                  <input
                    type="text"
                    placeholder="例如：林悦"
                    value={formData.undertaker}
                    onChange={(e) => setFormData({ ...formData, undertaker: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* 委外类型 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">委外类型</label>
                  <div className="relative">
                    <select
                      value={formData.outsourcingType}
                      onChange={(e) => setFormData({ ...formData, outsourcingType: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                    >
                      <option value="全部委外">全部委外 (委托代理机构主办)</option>
                      <option value="部分委外">部分委外 (联合办案/顾问复核)</option>
                      <option value="自办/不委外">自办 / 不委外 (内部法务直办)</option>
                      <option value="专项咨询委外">专项咨询委外 (调查/尽调单项)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 代理机构 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">代理机构</label>
                  <input
                    type="text"
                    placeholder="例如：北京市柳沈律师事务所"
                    value={formData.agencyName}
                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* 代理机构案号 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">代理机构案号</label>
                  <input
                    type="text"
                    placeholder="例如：LS-2026-TM-88219"
                    value={formData.agencyCaseNo}
                    onChange={(e) => setFormData({ ...formData, agencyCaseNo: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>

                {/* 委案日期 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">委案日期</label>
                  <input
                    type="date"
                    value={formData.entrustmentDate}
                    onChange={(e) => setFormData({ ...formData, entrustmentDate: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>

                {/* 开卷日期 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">开卷日期</label>
                  <input
                    type="date"
                    value={formData.fileOpeningDate}
                    onChange={(e) => setFormData({ ...formData, fileOpeningDate: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>

                {/* 递交方式 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">递交方式</label>
                  <div className="relative">
                    <select
                      value={formData.submissionMethod}
                      onChange={(e) => setFormData({ ...formData, submissionMethod: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                    >
                      <option value="电子递交 (网上申请系统)">电子递交 (网上申请系统)</option>
                      <option value="纸质递交 (窗口面交)">纸质递交 (窗口面交)</option>
                      <option value="邮寄递交">邮寄递交 (特快专递 EMS)</option>
                      <option value="国际局电子直报 (Madrid)">国际局电子直报 (Madrid)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 处理期限 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">处理期限</label>
                  <input
                    type="date"
                    value={formData.processingDeadline || formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value, processingDeadline: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>

                {/* 递交日期 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">递交日期</label>
                  <input
                    type="date"
                    value={formData.submissionDate}
                    onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>

                {/* 裁文日期 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">裁文日期</label>
                  <input
                    type="date"
                    value={formData.rulingDate}
                    onChange={(e) => setFormData({ ...formData, rulingDate: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>

                {/* 对代理机构备注 */}
                <div className="space-y-1 sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-medium text-slate-700">对代理机构备注</label>
                  <input
                    type="text"
                    placeholder="填写针对承办律所/代理机构的跟进要求、补充材料指引或答辩策略要点..."
                    value={formData.agencyRemarks}
                    onChange={(e) => setFormData({ ...formData, agencyRemarks: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* 处理建议 */}
                <div className="space-y-1 sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-medium text-slate-700">处理建议</label>
                  <textarea
                    rows={2}
                    placeholder="建议提出异议申请并同步进行撤三/无效宣告组合打击..."
                    value={formData.proposalAdvice}
                    onChange={(e) => setFormData({ ...formData, proposalAdvice: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs leading-relaxed resize-none"
                  />
                </div>

                {/* 备注 */}
                <div className="space-y-1 sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-medium text-slate-700">备注</label>
                  <textarea
                    rows={2}
                    placeholder="填写相关案件背景、法条引用或紧急排查说明..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 板块 2：商标信息 */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 font-bold text-slate-900 text-xs">
                <div className="w-1 h-3.5 bg-blue-600 rounded-full" />
                <span>商标信息</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 商标名 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">商标名</label>
                  <input
                    type="text"
                    placeholder="例如：u-smile 优笑"
                    value={formData.trademarkName}
                    onChange={(e) => setFormData({ ...formData, trademarkName: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* 尼斯分类 (多选与搜索下拉) */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">尼斯分类</label>
                  <div className="relative">
                    <div 
                      onClick={() => setIsTrademarkClassDropdownOpen(!isTrademarkClassDropdownOpen)}
                      className="flex items-center justify-between gap-2 min-h-[38px] p-1.5 px-2.5 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all shadow-2xs group"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                        {formData.classes.length === 0 ? (
                          <span className="text-slate-400 text-xs">请点击选择尼斯分类 (1-45类全选与搜索)...</span>
                        ) : (
                          formData.classes.map(code => {
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
                                    handleToggleTrademarkClass(code);
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
                          {isTrademarkClassDropdownOpen ? '收起' : '选择'}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isTrademarkClassDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                      </div>
                    </div>

                    {/* 展开面板 */}
                    {isTrademarkClassDropdownOpen && (
                      <div className="mt-2 p-3 bg-white border border-blue-200 rounded-xl shadow-lg space-y-2.5 z-20 relative animate-in fade-in zoom-in-95 duration-150">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={trademarkClassSearchKeyword}
                            onChange={(e) => setTrademarkClassSearchKeyword(e.target.value)}
                            placeholder="搜索类别编号或关键词（如：21、洁具、牙刷、日化、软件...）"
                            className="w-full text-xs text-slate-800 pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          {trademarkClassSearchKeyword && (
                            <button
                              type="button"
                              onClick={() => setTrademarkClassSearchKeyword('')}
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
                              onClick={() => handleSetQuickTrademarkClasses(['第21类', '第03类', '第10类'])}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
                            >
                              美齿个护 (21+03+10)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetQuickTrademarkClasses(['第09类', '第35类', '第42类'])}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
                            >
                              数智电商 (09+35+42)
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSetQuickTrademarkClasses(['第21类'])}
                            className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
                          >
                            重置默认
                          </button>
                        </div>

                        <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-1 text-xs">
                          {NICE_CLASSES_45.filter(item => {
                            if (!trademarkClassSearchKeyword.trim()) return true;
                            const k = trademarkClassSearchKeyword.trim().toLowerCase();
                            return item.code.toLowerCase().includes(k) ||
                              item.num.includes(k) ||
                              item.name.toLowerCase().includes(k) ||
                              item.desc.toLowerCase().includes(k);
                          }).map(item => {
                            const isChecked = formData.classes.includes(item.code);
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
                                  onChange={() => handleToggleTrademarkClass(item.code)}
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

                {/* 商品/服务项目 */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">商品/服务项目</label>
                  <textarea
                    rows={2}
                    placeholder="例如：2101-电动牙刷; 2108-牙刷; 2110-牙线; 2112-漱口水"
                    value={formData.goodsAndServices}
                    onChange={(e) => setFormData({ ...formData, goodsAndServices: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs leading-relaxed resize-none"
                  />
                </div>

                {/* 申请号/注册号 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">申请号/注册号</label>
                  <input
                    type="text"
                    placeholder="如：76891042"
                    value={formData.targetRegNo}
                    onChange={(e) => setFormData({ ...formData, targetRegNo: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>

                {/* 申请人名称(权利人) */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">申请人名称(权利人)</label>
                  <input
                    type="text"
                    placeholder="侵权方公司全称或个体工商户"
                    value={formData.targetApplicant}
                    onChange={(e) => setFormData({ ...formData, targetApplicant: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* 申请日 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">申请日</label>
                  <input
                    type="date"
                    value={formData.applicationDate}
                    onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>

                {/* 地址(权利人地址) */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">地址(权利人地址)</label>
                  <input
                    type="text"
                    placeholder="权利人登记注册通信地址"
                    value={formData.applicantAddress}
                    onChange={(e) => setFormData({ ...formData, applicantAddress: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* 注册日 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">注册日</label>
                  <input
                    type="date"
                    value={formData.registrationDate}
                    onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>

                {/* 初步审定公告期 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">初步审定公告期</label>
                  <input
                    type="text"
                    placeholder="如：第1889期 (2025-05-06 至 2025-08-06)"
                    value={formData.preliminaryNoticePeriod}
                    onChange={(e) => setFormData({ ...formData, preliminaryNoticePeriod: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* 国家(地区) */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">国家(地区)</label>
                  <div className="relative">
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                    >
                      <option value="中国 (CN)">中国 (CN)</option>
                      <option value="美国 (US)">美国 (US)</option>
                      <option value="欧盟 (EU)">欧盟 (EU)</option>
                      <option value="日本 (JP)">日本 (JP)</option>
                      <option value="韩国 (KR)">韩国 (KR)</option>
                      <option value="英国 (UK)">英国 (UK)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 终止日 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">终止日</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>

                {/* 引证商标 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">引证商标</label>
                  <input
                    type="text"
                    placeholder="我方引证维权商标，如：usmile (第42881903号)"
                    value={formData.ourTrademark}
                    onChange={(e) => setFormData({ ...formData, ourTrademark: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* 引证尼斯分类 (多选与搜索下拉) */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">引证尼斯分类</label>
                  <div className="relative">
                    <div 
                      onClick={() => setIsCitedClassDropdownOpen(!isCitedClassDropdownOpen)}
                      className="flex items-center justify-between gap-2 min-h-[38px] p-1.5 px-2.5 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all shadow-2xs group"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                        {formData.citedTrademarkClass.length === 0 ? (
                          <span className="text-slate-400 text-xs">请点击选择引证尼斯分类 (1-45类全选与搜索)...</span>
                        ) : (
                          formData.citedTrademarkClass.map(code => {
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
                                    handleToggleCitedClass(code);
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
                          {isCitedClassDropdownOpen ? '收起' : '选择'}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCitedClassDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                      </div>
                    </div>

                    {/* 展开面板 */}
                    {isCitedClassDropdownOpen && (
                      <div className="mt-2 p-3 bg-white border border-blue-200 rounded-xl shadow-lg space-y-2.5 z-20 relative animate-in fade-in zoom-in-95 duration-150">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={citedClassSearchKeyword}
                            onChange={(e) => setCitedClassSearchKeyword(e.target.value)}
                            placeholder="搜索类别编号或关键词..."
                            className="w-full text-xs text-slate-800 pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          {citedClassSearchKeyword && (
                            <button
                              type="button"
                              onClick={() => setCitedClassSearchKeyword('')}
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
                              onClick={() => handleSetQuickCitedClasses(['第21类', '第03类', '第05类'])}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
                            >
                              核心防线 (21+03+05)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetQuickCitedClasses(['第09类', '第35类', '第42类'])}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded border border-slate-200 cursor-pointer"
                            >
                              数字渠道 (09+35+42)
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSetQuickCitedClasses(['第21类'])}
                            className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
                          >
                            重置默认
                          </button>
                        </div>

                        <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-1 text-xs">
                          {NICE_CLASSES_45.filter(item => {
                            if (!citedClassSearchKeyword.trim()) return true;
                            const k = citedClassSearchKeyword.trim().toLowerCase();
                            return item.code.toLowerCase().includes(k) ||
                              item.num.includes(k) ||
                              item.name.toLowerCase().includes(k) ||
                              item.desc.toLowerCase().includes(k);
                          }).map(item => {
                            const isChecked = formData.citedTrademarkClass.includes(item.code);
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
                                  onChange={() => handleToggleCitedClass(item.code)}
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

                {/* 上传图片 (商标图样) - 支持多图 */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">上传图片 (商标图样)</label>
                  <div className="border border-slate-200 bg-white p-3.5 rounded-xl space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {formData.trademarkImages.map((imgUrl, index) => (
                        <div 
                          key={index} 
                          className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden relative group shadow-2xs"
                        >
                          <img src={imgUrl} alt={`商标图样 ${index + 1}`} className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                trademarkImages: prev.trademarkImages.filter((_, i) => i !== index)
                              }));
                            }}
                            className="absolute top-1 right-1 bg-slate-900/70 hover:bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-xs"
                            title="移除此图样"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="absolute bottom-1 left-1 bg-slate-900/60 text-white text-[9px] px-1 rounded backdrop-blur-2xs">
                            #{index + 1}
                          </span>
                        </div>
                      ))}

                      <label className="px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium cursor-pointer transition-all border border-blue-200 flex flex-col items-center justify-center gap-1 shadow-2xs min-w-[100px] h-20 border-dashed hover:border-blue-400 group">
                        <UploadCloud className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span>选择商标图样</span>
                        <span className="text-[10px] text-blue-500/80">(支持多选)</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []) as File[];
                            if (files.length > 0) {
                              files.forEach((file: File) => {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setFormData(prev => ({
                                    ...prev,
                                    trademarkImages: [...prev.trademarkImages, reader.result as string]
                                  }));
                                };
                                reader.readAsDataURL(file);
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400">支持上传单张或多张 PNG、JPG、WEBP 格式黑白或彩色商标矢量样图</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 板块 3：请求人信息 */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 font-bold text-slate-900 text-xs">
                <div className="w-1 h-3.5 bg-blue-600 rounded-full" />
                <span>请求人信息</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 代理机构(申请代理机构) */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">代理机构(申请代理机构)</label>
                  <input
                    type="text"
                    placeholder="例如：北京市柳沈律师事务所"
                    value={formData.agencyName}
                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* 代理机构联系人 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">代理机构联系人</label>
                  <input
                    type="text"
                    placeholder="例如：林悦 律师"
                    value={formData.agencyContact}
                    onChange={(e) => setFormData({ ...formData, agencyContact: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* 代理机构联系电话(含区号) */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">代理机构联系电话(含区号)</label>
                  <input
                    type="text"
                    placeholder="例如：010-66578899"
                    value={formData.agencyPhone}
                    onChange={(e) => setFormData({ ...formData, agencyPhone: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>

                {/* 请求人名称 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">请求人名称</label>
                  <input
                    type="text"
                    placeholder="例如：广州星际悦动股份有限公司"
                    value={formData.requesterName}
                    onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* 请求人通信地址 */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">请求人通信地址</label>
                  <input
                    type="text"
                    placeholder="例如：广东省广州市天河区黄埔大道西100号富力盈普大厦38楼"
                    value={formData.requesterAddress}
                    onChange={(e) => setFormData({ ...formData, requesterAddress: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* 请求人邮政编码 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">请求人邮政编码</label>
                  <input
                    type="text"
                    placeholder="例如：510623"
                    value={formData.requesterPostcode}
                    onChange={(e) => setFormData({ ...formData, requesterPostcode: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>

                {/* 请求人联系电话(含区号) */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">请求人联系电话(含区号)</label>
                  <input
                    type="text"
                    placeholder="例如：020-85596688"
                    value={formData.requesterPhone}
                    onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>

                {/* 请求人联系人 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">请求人联系人</label>
                  <input
                    type="text"
                    placeholder="例如：知产合规组"
                    value={formData.requesterContact}
                    onChange={(e) => setFormData({ ...formData, requesterContact: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* 品牌 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">品牌</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-2xs font-medium cursor-pointer"
                  >
                    <option value="usmile 笑容加">usmile 笑容加</option>
                    <option value="密浪 Waves">密浪 Waves</option>
                    <option value="净白云朵">净白云朵</option>
                    <option value="KittyAnnie 小猫安妮">KittyAnnie 小猫安妮</option>
                    <option value="FHT 新燕">FHT 新燕</option>
                    <option value="aboval 阿茂">aboval 阿茂</option>
                    <option value="kissday 亲天">kissday 亲天</option>
                    <option value="SMART ORAL LAB 智慧口腔实验室">SMART ORAL LAB 智慧口腔实验室</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 板块 4：附件信息 */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 font-bold text-slate-900 text-xs">
                <div className="w-1 h-3.5 bg-blue-600 rounded-full" />
                <span>附件信息</span>
              </div>

              <div className="space-y-3">
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-center group">
                  <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-blue-500 transition-colors mb-1.5" />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600">点击上传附件或将文件拖拽至此处</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">支持 PDF、ZIP、DOCX、PNG 等格式，单个文件不超过 50MB</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []) as File[];
                      if (files.length > 0) {
                        const newAtts = files.map((f: File) => ({
                          name: f.name,
                          size: (f.size / (1024 * 1024)).toFixed(1) + ' MB'
                        }));
                        setFormData(prev => ({
                          ...prev,
                          attachments: [...prev.attachments, ...newAtts]
                        }));
                      }
                    }}
                  />
                </label>

                {formData.attachments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">已添加附件清单 ({formData.attachments.length})</span>
                    <div className="space-y-1">
                      {formData.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{file.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0">({file.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                attachments: prev.attachments.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 弹窗底部操作按钮组 */}
          <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-slate-100 shrink-0">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              发起立案后将自动推送至官方全流程监控台账，并协同指定代理律所进行证据链组织
            </span>
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>保存并转入异议立案</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
