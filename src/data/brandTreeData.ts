import { BrandTreeNode, BrandCreationProposal } from '../types';

/**
 * 品牌体系数据结构：
 * 一级主品牌为主（当前星际悦动旗下的主力品牌矩阵），
 * 支持未来随时添加二级子品牌/产品线系列。
 */
export const INITIAL_BRAND_TREE: BrandTreeNode[] = [
  {
    id: 'BR-USMILE',
    name: 'usmile 笑容加',
    englishName: 'usmile',
    code: 'BR-001',
    level: 'CORE_BRAND', // 一级主品牌
    parentId: null,
    description: '全周期口腔健康主品牌，涵盖智能声波电动牙刷、专业冲牙器、口腔数字医疗与精细化洗护全品类。',
    ownerDept: '口腔科技第一事业部',
    ownerName: '陈旻 (VP)',
    status: 'ACTIVE',
    launchDate: '2015-12-01',
    targetCategories: [21, 3, 10, 9, 35, 44],
    targetMarkets: ['中国', '东南亚', '欧盟', '北美', '日本'],
    trademarkCount: 124,
    pendingCount: 8,
    disputeCount: 3,
    children: [
      {
        id: 'BR-WAVES',
        name: '密浪 Waves',
        englishName: 'Waves',
        code: 'BR-SUB-001',
        level: 'SUB_BRAND', // 二级子品牌
        parentId: 'BR-USMILE',
        description: '专注于便携式冲牙器与水动力洁齿科技的年轻化子品牌，主打多频洁齿水流技术。',
        ownerDept: '水动力产品线',
        ownerName: '周浩 (总监)',
        status: 'ACTIVE',
        launchDate: '2021-06-15',
        targetCategories: [21, 10, 3],
        targetMarkets: ['中国', '东南亚', '日本'],
        trademarkCount: 18,
        pendingCount: 3,
        disputeCount: 2,
        children: []
      },
      {
        id: 'BR-WHITE-CLOUD',
        name: '净白云朵',
        englishName: 'WhiteCloud',
        code: 'BR-SUB-002',
        level: 'SUB_BRAND', // 二级子品牌
        parentId: 'BR-USMILE',
        description: '专注于温和亮白牙膏、声波美白牙贴、口腔精华露的高端日化洗护子品牌。',
        ownerDept: '口腔个护洗护部',
        ownerName: '何敏 (主理人)',
        status: 'ACTIVE',
        launchDate: '2022-08-20',
        targetCategories: [3, 21, 5],
        targetMarkets: ['中国', '东南亚', '韩国'],
        trademarkCount: 14,
        pendingCount: 2,
        disputeCount: 1,
        children: []
      }
    ]
  },
  {
    id: 'BR-KITTYANNIE',
    name: 'KittyAnnie 小猫安妮',
    englishName: 'KittyAnnie',
    code: 'BR-002',
    level: 'CORE_BRAND', // 一级主品牌
    parentId: null,
    description: '多光谱微电流美肤仪、光子嫩肤面罩及医美级家用科技个护主品牌。',
    ownerDept: '光电美妆个护事业部',
    ownerName: '唐宁 (总裁/兼)',
    status: 'ACTIVE',
    launchDate: '2021-09-08',
    targetCategories: [10, 3, 9, 21, 35],
    targetMarkets: ['中国', '东南亚', '日本', '欧盟'],
    trademarkCount: 28,
    pendingCount: 2,
    disputeCount: 1,
    children: []
  },
  {
    id: 'BR-FHT',
    name: 'FHT 新燕',
    englishName: 'FHT New Nest',
    code: 'BR-003',
    level: 'CORE_BRAND', // 一级主品牌
    parentId: null,
    description: '高纯度冻干即食燕窝滋补、胶原肽口服营养液及大健康滋补消费品牌。',
    ownerDept: '健康营养创新事业部',
    ownerName: '袁飞 (总监)',
    status: 'ACTIVE',
    launchDate: '2022-11-10',
    targetCategories: [29, 30, 32, 5, 35],
    targetMarkets: ['中国', '东南亚', '欧盟'],
    trademarkCount: 16,
    pendingCount: 1,
    disputeCount: 0,
    children: []
  },
  {
    id: 'BR-ABOVAL',
    name: 'aboval 阿茂',
    englishName: 'aboval',
    code: 'BR-004',
    level: 'CORE_BRAND', // 一级主品牌
    parentId: null,
    description: '原创高级车载香氛、家居香氛喷雾及情绪生活美学主品牌。',
    ownerDept: '生活美学事业部',
    ownerName: '李沐 (主理人)',
    status: 'ACTIVE',
    launchDate: '2021-03-25',
    targetCategories: [3, 5, 11, 21, 35],
    targetMarkets: ['中国', '东南亚', '欧洲'],
    trademarkCount: 14,
    pendingCount: 1,
    disputeCount: 0,
    children: []
  },
  {
    id: 'BR-KISSDAY',
    name: 'kissday 亲天',
    englishName: 'kissday',
    code: 'BR-005',
    level: 'CORE_BRAND', // 一级主品牌
    parentId: null,
    description: '便携口腔爆珠糖、便携果味漱口水及Z世代社交清新快消品牌。',
    ownerDept: '快消创新孵化部',
    ownerName: '陈敏',
    status: 'ACTIVE',
    launchDate: '2023-02-14',
    targetCategories: [3, 5, 30, 35],
    targetMarkets: ['中国', '东南亚'],
    trademarkCount: 8,
    pendingCount: 0,
    disputeCount: 0,
    children: []
  },
  {
    id: 'BR-SMART-LAB',
    name: 'SMART ORAL LAB 智慧口腔实验室',
    englishName: 'Smart Oral Lab',
    code: 'BR-006',
    level: 'CORE_BRAND', // 一级主品牌
    parentId: null,
    description: '数字化口腔临床医疗器械、智能印模仪与口腔AI分析诊断SaaS平台。',
    ownerDept: '医疗级研发与数字健康部',
    ownerName: '陆燕丽',
    status: 'PLANNING',
    launchDate: '2024-09-01',
    targetCategories: [10, 42, 44, 9, 35],
    targetMarkets: ['中国', '新加坡', '马来西亚', '欧盟'],
    trademarkCount: 4,
    pendingCount: 2,
    disputeCount: 0,
    children: []
  }
];

export const INITIAL_BRAND_PROPOSALS: BrandCreationProposal[] = [
  {
    id: 'BP-2026-004',
    proposalNo: 'BP20260820004',
    brandName: 'usmile PRO-CARE 专业护龈',
    englishName: 'usmile Pro-Care',
    level: 'SUB_BRAND',
    parentBrandId: 'BR-USMILE',
    parentBrandName: 'usmile 笑容加',
    ownerDept: '口腔临床个护实验室',
    initiatorName: '林悦 (知产主管)',
    initiatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    createTime: '2026-08-20 16:45',
    brandPositioning: '针对牙龈敏感与种植牙术后人群的医研级声波牙刷与专用低泡牙膏系列。',
    plannedLaunchDate: '2026-12-15',
    targetClasses: [21, 3, 10],
    targetMarkets: ['中国', '东南亚'],
    commercialJustification: '精准切入种植牙及牙周病高端修复人群，形成专业医疗级产品矩阵。',
    preliminaryRiskNotes: '已完成初步分类比对，拟在第10类及21类建立跨类防御防御壁垒。',
    status: 'DRAFT',
    currentStep: 0,
    steps: [
      { role: '品牌规划部总监审批', userName: '陈旻 (VP)', status: 'WAITING' },
      { role: '知产法务部查重审核', userName: '林悦 (知产主管)', status: 'WAITING' },
      { role: '集团总裁终审', userName: '唐宁 (总裁)', status: 'WAITING' }
    ]
  },
  {
    id: 'BP-2026-001',
    proposalNo: 'BP20260820001',
    brandName: '笑容微生态 SmileBiome',
    englishName: 'SmileBiome',
    level: 'SUB_BRAND',
    parentBrandId: 'BR-USMILE',
    parentBrandName: 'usmile 笑容加',
    ownerDept: '口腔个护研发实验室',
    initiatorName: '何敏 (主理人)',
    initiatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    createTime: '2026-08-18 14:30',
    brandPositioning: '专注口腔微生态平衡的益生菌牙膏、抑菌含漱液及高活性生物防护口腔喷雾。',
    plannedLaunchDate: '2026-11-15',
    targetClasses: [3, 5, 21, 35],
    targetMarkets: ['中国', '东南亚', '日本'],
    commercialJustification: '目前市场益生菌口腔护理品类年增长超45%，设立专门微生态子品牌利于抢占心智，与硬件电动牙刷形成生态闭环。',
    preliminaryRiskNotes: '法务前期检索：第3类、第5类「SmileBiome」初查无直接冲突在先商标，建议优先进行马德里国际注册。',
    status: 'PENDING_APPROVAL',
    currentStep: 2,
    steps: [
      { role: '品牌规划部总监审批', userName: '陈旻 (VP)', status: 'APPROVED', comment: '符合集团口腔大健康微生态战略布局，同意立项。', timestamp: '2026-08-18 16:20' },
      { role: '知产法务部查重审核', userName: '林悦 (知产主管)', status: 'CURRENT', comment: '正在结合CNIPA及WIPO数据库执行全类目交叉近似度排查与跨类防御规划。' },
      { role: '集团总裁终审', userName: '唐宁 (总裁)', status: 'WAITING' }
    ]
  },
  {
    id: 'BP-2026-002',
    proposalNo: 'BP20260819002',
    brandName: '极光闪耀 AURORA',
    englishName: 'Aurora Glow',
    level: 'SUB_BRAND',
    parentBrandId: 'BR-KITTYANNIE',
    parentBrandName: 'KittyAnnie 小猫安妮',
    ownerDept: '光电美妆个护事业部',
    initiatorName: '唐宁 (总裁/兼美妆BU)',
    initiatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    createTime: '2026-08-19 09:15',
    brandPositioning: '下一代便携射频微电流美肤仪与面罩光子嫩肤旗舰系列。',
    plannedLaunchDate: '2026-12-01',
    targetClasses: [10, 9, 3],
    targetMarkets: ['中国', '欧盟', '北美'],
    commercialJustification: '配合第四季度电商大促与新品发布会，打造高端光子嫩肤代表作。',
    preliminaryRiskNotes: '第10类已有初步权利基础，需补足第9类App控制软件与第3类配套导光啫喱。',
    status: 'PENDING_APPROVAL',
    currentStep: 1,
    steps: [
      { role: '品牌规划部总监审批', userName: '陈旻 (VP)', status: 'CURRENT', comment: '等待品牌规划部审核新品类商业定位。' },
      { role: '知产法务部查重审核', userName: '林悦 (知产主管)', status: 'WAITING' },
      { role: '集团总裁终审', userName: '唐宁 (总裁)', status: 'WAITING' }
    ]
  },
  {
    id: 'BP-2026-003',
    proposalNo: 'BP20260810003',
    brandName: 'SMART ORAL LAB 智慧口腔实验室',
    englishName: 'Smart Oral Lab',
    level: 'CORE_BRAND',
    parentBrandId: undefined,
    parentBrandName: '主品牌',
    ownerDept: '医疗级研发与数字健康部',
    initiatorName: '陆燕丽 (法务/创新支持)',
    initiatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    createTime: '2026-08-10 11:00',
    brandPositioning: '数字化口腔医疗器械与专业AI印模分析诊断SaaS平台，赋能B端牙科门诊与专业医生。',
    plannedLaunchDate: '2026-09-01',
    targetClasses: [10, 42, 44, 9, 35],
    targetMarkets: ['中国', '新加坡', '马来西亚', '欧盟'],
    commercialJustification: '实现由 C 端消费电子向 B/C 结合的专业数字口腔医疗机构转型。',
    preliminaryRiskNotes: '第10类及第42类已完成检索无阻碍，已顺利通过全流程审批并加入企业品牌库。',
    status: 'APPROVED',
    currentStep: 3,
    steps: [
      { role: '品牌规划部总监审批', userName: '陈旻 (VP)', status: 'APPROVED', comment: '战略转型重大标的，完全同意。', timestamp: '2026-08-10 14:20' },
      { role: '知产法务部查重审核', userName: '林悦 (知产主管)', status: 'APPROVED', comment: '全类目查重完成，风险可控，建议在新加坡和欧洲同步申请。', timestamp: '2026-08-11 10:15' },
      { role: '集团总裁终审', userName: '唐宁 (总裁)', status: 'APPROVED', comment: '核准设立新主品牌，纳入集团正式品牌库。', timestamp: '2026-08-11 16:40' }
    ],
    approvedNodeId: 'BR-SMART-LAB'
  },
  {
    id: 'BP-2026-005',
    proposalNo: 'BP20260805005',
    brandName: '超声净白 HYPERWHITE',
    englishName: 'HyperWhite',
    level: 'SUB_BRAND',
    parentBrandId: 'BR-USMILE',
    parentBrandName: 'usmile 笑容加',
    ownerDept: '海外跨境电商事业部',
    initiatorName: '何敏 (主理人)',
    initiatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    createTime: '2026-08-05 15:10',
    brandPositioning: '针对北美及欧洲跨境市场的医用冷光美白仪与炫白凝胶系列。',
    plannedLaunchDate: '2026-10-01',
    targetClasses: [3, 10, 21],
    targetMarkets: ['美国', '欧盟'],
    commercialJustification: '北美美白个护需求旺盛，拟设立独立海外子品牌。',
    preliminaryRiskNotes: '法务初审检索发现：USPTO已有在先高度近似商标「HyperWhite Dental」，存在较高驳回风险。',
    status: 'REJECTED',
    rejectReason: '在先商标冲突风险较高，建议调整英文字根组合或增加前缀标后重新发起。',
    currentStep: 2,
    steps: [
      { role: '品牌规划部总监审批', userName: '陈旻 (VP)', status: 'APPROVED', comment: '商业方向可行，需法务把关查重。', timestamp: '2026-08-05 16:00' },
      { role: '知产法务部查重审核', userName: '林悦 (知产主管)', status: 'REJECTED', comment: '在先商标冲突风险较高，USPTO及EUIPO已有在先近似，建议调整名称。', timestamp: '2026-08-06 11:20' },
      { role: '集团总裁终审', userName: '唐宁 (总裁)', status: 'WAITING' }
    ]
  },
  {
    id: 'BP-2026-006',
    proposalNo: 'BP20260802006',
    brandName: '小猫舒敏 KITTYCARE',
    englishName: 'KittyCare',
    level: 'SUB_BRAND',
    parentBrandId: 'BR-KITTYANNIE',
    parentBrandName: 'KittyAnnie 小猫安妮',
    ownerDept: '光电美妆个护事业部',
    initiatorName: '唐宁 (总裁/兼美妆BU)',
    initiatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    createTime: '2026-08-02 09:30',
    brandPositioning: '敏感肌专研舒缓红蓝光修护仪与舒敏冻干精华。',
    plannedLaunchDate: '2026-11-01',
    targetClasses: [10, 3],
    targetMarkets: ['中国'],
    commercialJustification: '配合小猫安妮打造双品牌敏感肌修护心智。',
    preliminaryRiskNotes: '初步检索无直接同名阻碍。',
    status: 'WITHDRAWN',
    withdrawReason: '因事业部产品线整合，业务负责人主动撤回立项申请，拟合并至主品牌发布。',
    currentStep: 1,
    steps: [
      { role: '品牌规划部总监审批', userName: '陈旻 (VP)', status: 'CURRENT', comment: '申请人已主动撤回申请。', timestamp: '2026-08-03 10:15' },
      { role: '知产法务部查重审核', userName: '林悦 (知产主管)', status: 'WAITING' },
      { role: '集团总裁终审', userName: '唐宁 (总裁)', status: 'WAITING' }
    ]
  },
  {
    id: 'BP-2026-007',
    proposalNo: 'BP20260728007',
    brandName: '极速声波 SONICFAST',
    englishName: 'SonicFast',
    level: 'SUB_BRAND',
    parentBrandId: 'BR-USMILE',
    parentBrandName: 'usmile 笑容加',
    ownerDept: '口腔科技事业部',
    initiatorName: '苏晓 (业务主管)',
    initiatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    createTime: '2026-07-28 14:00',
    brandPositioning: '主打高性价比青年极速声波电动牙刷系列。',
    plannedLaunchDate: '2026-09-15',
    targetClasses: [21],
    targetMarkets: ['中国'],
    commercialJustification: '下沉渠道学生群体开拓。',
    preliminaryRiskNotes: '通用性词汇较强，显著性较弱。',
    status: 'CANCELLED',
    cancelReason: '产品线规划调整，已由业务部门在未提交/撤回后正式取消立项。',
    currentStep: 0,
    steps: [
      { role: '品牌规划部总监审批', userName: '陈旻 (VP)', status: 'WAITING' },
      { role: '知产法务部查重审核', userName: '林悦 (知产主管)', status: 'WAITING' },
      { role: '集团总裁终审', userName: '唐宁 (总裁)', status: 'WAITING' }
    ]
  }
];

// Helper to flatten the brand tree (一级品牌 + 二级子品牌)
export function flattenBrandTree(nodes: BrandTreeNode[]): BrandTreeNode[] {
  const result: BrandTreeNode[] = [];
  function recurse(list: BrandTreeNode[]) {
    for (const node of list) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        recurse(node.children);
      }
    }
  }
  recurse(nodes);
  return result;
}

// Get all brand names for dropdown selection in case filing
export function getAllBrandOptions(nodes: BrandTreeNode[]): { id: string; name: string; level: string; code: string; parentId?: string | null }[] {
  const flat = flattenBrandTree(nodes);
  return flat.map(n => ({
    id: n.id,
    name: n.name,
    level: n.level,
    code: n.code,
    parentId: n.parentId
  }));
}

// Helper to get total counts across brand tree
export function getBrandTreeMetrics(nodes: BrandTreeNode[]) {
  const flat = flattenBrandTree(nodes);
  const primaryBrands = nodes.length; // 一级主品牌总数
  const subBrands = flat.filter(n => n.level === 'SUB_BRAND').length; // 二级子品牌总数
  const totalBrands = flat.length;
  const activeBrands = flat.filter(n => n.status === 'ACTIVE').length;
  const planningBrands = flat.filter(n => n.status === 'PLANNING').length;
  const totalTrademarks = flat.reduce((sum, n) => sum + (n.trademarkCount || 0), 0);
  const totalPending = flat.reduce((sum, n) => sum + (n.pendingCount || 0), 0);

  return {
    primaryBrands,
    subBrands,
    totalBrands,
    activeBrands,
    planningBrands,
    totalTrademarks,
    totalPending
  };
}
