import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  MapPin, 
  Globe2, 
  Compass, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles,
  X,
  Copy,
  Check,
  Download,
  Filter,
  Building2,
  FileText,
  Calendar,
  Settings,
  ChevronDown,
  ChevronUp,
  Folder,
  Layers as LayersIcon
} from 'lucide-react';
import { TrademarkItem, NavigationTab, CaseManagementItem } from '../types';
import { INITIAL_CASE_MANAGEMENT_ITEMS } from '../data/mockData';
import { getRegionByCountry } from '../lib/mappingStore';

export interface MarketLocation {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  lat: number;
  lng: number;
  registeredCount: number;
  examiningCount: number;
  expiredCount: number;
  totalCount: number;
  status: 'EXAMINING' | 'REGISTERED' | 'INVALID' | 'UNAPPLIED';
  authority: string;
  lawFirm: string;
  leadProduct: string;
  nextRenewalDate: string;
  riskNote?: string;
  classes: number[];
  registeredGoodsSummary: string;
  registeredCoreIncluded: string;
  registeredClassesStr?: string;
  registeredTrademarkNamesStr?: string;
  examiningClassesStr?: string;
  examiningTrademarkNamesStr?: string;
  examiningGoodsSummary?: string;
  invalidClassesStr?: string;
  invalidTrademarkNamesStr?: string;
  invalidGoodsSummary?: string;
}

export const GLOBAL_MARKET_DATA: MarketLocation[] = [
  {
    id: 'CN',
    name: '中国',
    nameEn: 'China',
    flag: '🇨🇳',
    lat: 35.8617,
    lng: 104.1954,
    registeredCount: 96,
    examiningCount: 37,
    expiredCount: 7,
    totalCount: 140,
    status: 'REGISTERED',
    authority: '中国国家知识产权局 (CNIPA)',
    lawFirm: '北京市柳沈律师事务所 / 广州三环',
    leadProduct: '电动牙刷PRO、冲牙器C10、牙线棒、正畸洁齿舱',
    nextRenewalDate: '2028-09-14',
    classes: [21, 3, 10, 9, 35, 44],
    registeredGoodsSummary: '电动牙刷(21类)、冲牙器(21类)、漱口水(3类)、牙线(21类)、医用正畸仪(10类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线、漱口水、正畸器械'
  },
  {
    id: 'US',
    name: '美国',
    nameEn: 'United States',
    flag: '🇺🇸',
    lat: 38.0902,
    lng: -97.7129,
    registeredCount: 22,
    examiningCount: 6,
    expiredCount: 0,
    totalCount: 28,
    status: 'REGISTERED',
    authority: '美国专利商标局 (USPTO)',
    lawFirm: 'Finnegan, Henderson, Farabow, Garrett & Dunner',
    leadProduct: 'Sonic Electric Toothbrush, Water Flosser',
    nextRenewalDate: '2029-03-20',
    classes: [21, 3, 10],
    registeredGoodsSummary: '声波电动牙刷(21类)、水牙线冲牙器(21类)、美白漱口水(3类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'EU',
    name: '欧盟',
    nameEn: 'European Union',
    flag: '🇪🇺',
    lat: 50.8503,
    lng: 4.3517,
    registeredCount: 28,
    examiningCount: 5,
    expiredCount: 1,
    totalCount: 34,
    status: 'REGISTERED',
    authority: '欧盟知识产权局 (EUIPO)',
    lawFirm: 'Bird & Bird LLP (Frankfurt / Paris)',
    leadProduct: 'usmile Oral Care Master System',
    nextRenewalDate: '2029-11-05',
    classes: [21, 3, 10, 9],
    registeredGoodsSummary: '电动牙刷及刷头(21类)、冲牙器(21类)、漱口水(3类)、牙线(21类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线、漱口水'
  },
  {
    id: 'JP',
    name: '日本',
    nameEn: 'Japan',
    flag: '🇯🇵',
    lat: 36.2048,
    lng: 138.2529,
    registeredCount: 16,
    examiningCount: 3,
    expiredCount: 0,
    totalCount: 19,
    status: 'REGISTERED',
    authority: '日本特许厅 (JPO)',
    lawFirm: 'Sakai International Patent Office (Tokyo)',
    leadProduct: '音波振動歯ブラシ usmile Pro',
    nextRenewalDate: '2030-05-18',
    classes: [21, 3, 10],
    registeredGoodsSummary: '音波电动牙刷(21类)、超声波冲牙器(21类)、漱口水(3类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'KR',
    name: '韩国',
    nameEn: 'South Korea',
    flag: '🇰🇷',
    lat: 35.9078,
    lng: 127.7669,
    registeredCount: 13,
    examiningCount: 2,
    expiredCount: 0,
    totalCount: 15,
    status: 'REGISTERED',
    authority: '韩国特许厅 (KIPO)',
    lawFirm: 'Kim & Chang Intellectual Property Group',
    leadProduct: '음파전동칫솔 usmile Smile+',
    nextRenewalDate: '2031-01-12',
    classes: [21, 3],
    registeredGoodsSummary: '智能电动牙刷(21类)、便携冲牙器(21类)、漱口水(3类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'SG',
    name: '新加坡',
    nameEn: 'Singapore',
    flag: '🇸🇬',
    lat: 1.3521,
    lng: 103.8198,
    registeredCount: 0,
    examiningCount: 2,
    expiredCount: 0,
    totalCount: 2,
    status: 'EXAMINING',
    authority: '新加坡知识产权局 (IPOS)',
    lawFirm: 'Allen & Gledhill LLP',
    leadProduct: 'usmile Smart Sonic Toothbrush & Pods',
    nextRenewalDate: '-',
    classes: [21],
    registeredGoodsSummary: '暂无在案注册',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'TH',
    name: '泰国',
    nameEn: 'Thailand',
    flag: '🇹🇭',
    lat: 15.8700,
    lng: 100.9925,
    registeredCount: 9,
    examiningCount: 2,
    expiredCount: 0,
    totalCount: 11,
    status: 'REGISTERED',
    authority: '泰国知识产权厅 (DIP)',
    lawFirm: 'Tilleke & Gibbins International',
    leadProduct: 'usmile แปรงสีฟันไฟฟ้าอัจฉริยะ',
    nextRenewalDate: '2032-02-14',
    classes: [21, 3],
    registeredGoodsSummary: '电动牙刷(21类)、冲牙器(21类)、果味牙膏(3类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'VN',
    name: '越南',
    nameEn: 'Vietnam',
    flag: '🇻🇳',
    lat: 14.0583,
    lng: 108.2772,
    registeredCount: 7,
    examiningCount: 2,
    expiredCount: 0,
    totalCount: 9,
    status: 'REGISTERED',
    authority: '越南国家知识产权局 (IP VIETNAM)',
    lawFirm: 'Vision & Associates IP Law',
    leadProduct: 'Bàn chải điện usmile chính hãng',
    nextRenewalDate: '2032-09-08',
    classes: [21, 3],
    registeredGoodsSummary: '电动牙刷(21类)、冲牙器(21类)、漱口水(3类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'ID',
    name: '印度尼西亚',
    nameEn: 'Indonesia',
    flag: '🇮🇩',
    lat: -0.7893,
    lng: 113.9213,
    registeredCount: 8,
    examiningCount: 2,
    expiredCount: 0,
    totalCount: 10,
    status: 'REGISTERED',
    authority: '印尼知识产权总局 (DJKI)',
    lawFirm: 'Hadiputranto, Hadinoto & Partners',
    leadProduct: 'usmile Sikat Gigi Elektrik',
    nextRenewalDate: '2032-04-19',
    classes: [21, 3],
    registeredGoodsSummary: '电动牙刷(21类)、冲牙器(21类)、口腔清新喷雾(3类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'MY',
    name: '马来西亚',
    nameEn: 'Malaysia',
    flag: '🇲🇾',
    lat: 4.2105,
    lng: 101.9758,
    registeredCount: 7,
    examiningCount: 1,
    expiredCount: 0,
    totalCount: 8,
    status: 'REGISTERED',
    authority: '马来西亚知识产权局 (MyIPO)',
    lawFirm: 'Shearn Delamore & Co.',
    leadProduct: 'usmile Dental Floss & Sonic Brushes',
    nextRenewalDate: '2031-10-30',
    classes: [21, 3],
    registeredGoodsSummary: '电动牙刷(21类)、冲牙器(21类)、膨胀牙线(21类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'PH',
    name: '菲律宾',
    nameEn: 'Philippines',
    flag: '🇵🇭',
    lat: 12.8797,
    lng: 121.7740,
    registeredCount: 6,
    examiningCount: 1,
    expiredCount: 0,
    totalCount: 7,
    status: 'REGISTERED',
    authority: '菲律宾知识产权局 (IPOPHL)',
    lawFirm: 'SyCip Salazar Hernandez & Gatmaitan',
    leadProduct: 'usmile Oral Care Solutions',
    nextRenewalDate: '2033-03-15',
    classes: [21, 3],
    registeredGoodsSummary: '电动牙刷(21类)、冲牙器(21类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'GB',
    name: '英国',
    nameEn: 'United Kingdom',
    flag: '🇬🇧',
    lat: 54.3781,
    lng: -2.4360,
    registeredCount: 13,
    examiningCount: 1,
    expiredCount: 0,
    totalCount: 14,
    status: 'REGISTERED',
    authority: '英国知识产权局 (UKIPO)',
    lawFirm: 'Mewburn Ellis LLP (London)',
    leadProduct: 'usmile Precision Electric Toothbrush',
    nextRenewalDate: '2030-08-22',
    classes: [21, 3, 10],
    registeredGoodsSummary: '声波电动牙刷(21类)、冲牙器(21类)、医用牙科正畸(10类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'AU',
    name: '澳大利亚',
    nameEn: 'Australia',
    flag: '🇦🇺',
    lat: -25.2744,
    lng: 133.7751,
    registeredCount: 11,
    examiningCount: 1,
    expiredCount: 0,
    totalCount: 12,
    status: 'REGISTERED',
    authority: '澳大利亚知识产权局 (IP Australia)',
    lawFirm: 'Davies Collison Cave Intellectual Property',
    leadProduct: 'usmile Ultrasonic Flosser & Brush Head',
    nextRenewalDate: '2031-06-11',
    classes: [21, 3],
    registeredGoodsSummary: '电动牙刷(21类)、冲牙器(21类)、牙线棒(21类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'AE',
    name: '阿联酋',
    nameEn: 'United Arab Emirates',
    flag: '🇦🇪',
    lat: 23.4241,
    lng: 53.8478,
    registeredCount: 6,
    examiningCount: 2,
    expiredCount: 0,
    totalCount: 8,
    status: 'REGISTERED',
    authority: '阿联酋经济部商标处 (MOE UAE)',
    lawFirm: 'Al Tamimi & Company IP Practice',
    leadProduct: 'usmile Luxury Smile Care (Dubai / Abu Dhabi)',
    nextRenewalDate: '2033-11-20',
    classes: [21, 3],
    registeredGoodsSummary: '漱口水(3类)、冲牙器(21类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'CA',
    name: '加拿大',
    nameEn: 'Canada',
    flag: '🇨🇦',
    lat: 56.1304,
    lng: -106.3468,
    registeredCount: 5,
    examiningCount: 1,
    expiredCount: 0,
    totalCount: 6,
    status: 'REGISTERED',
    authority: '加拿大知识产权局 (CIPO)',
    lawFirm: 'Smart & Biggar LLP (Ottawa / Montreal)',
    leadProduct: 'usmile Health & Dental Technology',
    nextRenewalDate: '2032-12-05',
    classes: [21, 3],
    registeredGoodsSummary: '电动牙刷(21类)、冲牙器(21类)、漱口水(3类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'BR',
    name: '巴西',
    nameEn: 'Brazil',
    flag: '🇧🇷',
    lat: -14.2350,
    lng: -51.9253,
    registeredCount: 3,
    examiningCount: 2,
    expiredCount: 0,
    totalCount: 5,
    status: 'EXAMINING',
    authority: '巴西国家工业产权局 (INPI)',
    lawFirm: 'Dannemann Siemsen IP Lawyers',
    leadProduct: 'usmile Escova Dental Elétrica Inteligente',
    nextRenewalDate: '2034-04-10',
    classes: [21, 3],
    registeredGoodsSummary: '电动牙刷(21类)、冲牙器(21类)',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'RU',
    name: '俄罗斯',
    nameEn: 'Russia',
    flag: '🇷🇺',
    lat: 61.5240,
    lng: 105.3188,
    registeredCount: 0,
    examiningCount: 0,
    expiredCount: 2,
    totalCount: 2,
    status: 'INVALID',
    authority: '俄罗斯联邦知识产权局 (ROSPATENT)',
    lawFirm: 'Gorodissky & Partners (Moscow)',
    leadProduct: 'usmile Электрическая зубная щетка',
    nextRenewalDate: '-',
    classes: [21, 3],
    registeredGoodsSummary: '暂无在案注册',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'MX',
    name: '墨西哥',
    nameEn: 'Mexico',
    flag: '🇲🇽',
    lat: 23.6345,
    lng: -102.5528,
    registeredCount: 0,
    examiningCount: 0,
    expiredCount: 0,
    totalCount: 0,
    status: 'UNAPPLIED',
    authority: '墨西哥工业产权研究所 (IMPI)',
    lawFirm: '待选聘律所',
    leadProduct: '目标拓展市场',
    nextRenewalDate: '-',
    classes: [],
    registeredGoodsSummary: '暂无在案注册',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  },
  {
    id: 'IN',
    name: '印度',
    nameEn: 'India',
    flag: '🇮🇳',
    lat: 20.5937,
    lng: 78.9629,
    registeredCount: 0,
    examiningCount: 0,
    expiredCount: 0,
    totalCount: 0,
    status: 'UNAPPLIED',
    authority: '印度专利商标局 (CGPDTM)',
    lawFirm: '待选聘律所',
    leadProduct: '目标拓展市场',
    nextRenewalDate: '-',
    classes: [],
    registeredGoodsSummary: '暂无在案注册',
    registeredCoreIncluded: '电动牙刷、冲牙器、牙线'
  }
];

// Tile Layer Configuration
export type MapTileStyle = 'carto-light' | 'carto-voyager' | 'osm' | 'satellite' | 'carto-dark';

interface TileConfig {
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains: string;
}

const TILE_PROVIDERS: Record<MapTileStyle, TileConfig> = {
  'carto-light': {
    name: '极简浅灰底图',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
    subdomains: ''
  },
  'carto-voyager': {
    name: '全彩标准底图',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS',
    maxZoom: 18,
    subdomains: ''
  },
  'osm': {
    name: '开放地理 (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: 'abc'
  },
  'satellite': {
    name: '高清卫星',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18,
    subdomains: ''
  },
  'carto-dark': {
    name: '深邃夜景',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
    subdomains: ''
  }
};

interface RealWorldMapProps {
  onNavigate?: (tab: NavigationTab) => void;
  onOpenTrademarkDetail?: (tm: TrademarkItem) => void;
  selectedBrand?: string;
  selectedGoodItem?: string;
  caseItems?: CaseManagementItem[];
}

// Helper to accurately match a CaseManagementItem to a Market/Country
export const isCaseInCountry = (item: CaseManagementItem, market: { id: string; name: string; nameEn?: string }) => {
  const cName = (item.country || item.jurisdiction || (item as any).region || '').trim();
  if (!cName) return false;

  // Direct match or substring
  if (cName === market.name || cName.includes(market.name)) return true;
  if (market.id && (cName.toUpperCase() === market.id.toUpperCase() || cName.toUpperCase().includes(market.id.toUpperCase()))) return true;
  if (market.nameEn && cName.toLowerCase().includes(market.nameEn.toLowerCase())) return true;

  // Specific alias mappings
  switch (market.name) {
    case '中国':
      return cName.includes('中国') || cName.includes('CN') || cName.includes('大陆') || cName.includes('香港') || cName.includes('澳门') || cName.includes('台湾');
    case '美国':
      return cName.includes('美国') || cName.includes('US') || cName.includes('USA') || cName.includes('美');
    case '欧盟':
      return cName.includes('欧盟') || cName.includes('EU') || cName.includes('欧洲') || cName.includes('德国') || cName.includes('法国') || cName.includes('荷兰') || cName.includes('意大利') || cName.includes('西班牙');
    case '日本':
      return cName.includes('日本') || cName.includes('JP') || cName.includes('JPO');
    case '韩国':
      return cName.includes('韩国') || cName.includes('KR') || cName.includes('KIPO');
    case '新加坡':
      return cName.includes('新加坡') || cName.includes('SG') || cName.includes('IPOS');
    case '泰国':
      return cName.includes('泰国') || cName.includes('TH') || cName.includes('DIP');
    case '越南':
      return cName.includes('越南') || cName.includes('VN');
    case '印度尼西亚':
      return cName.includes('印度尼西亚') || cName.includes('印尼') || cName.includes('ID') || cName.includes('DJKI');
    case '马来西亚':
      return cName.includes('马来西亚') || cName.includes('MY') || cName.includes('MyIPO');
    case '菲律宾':
      return cName.includes('菲律宾') || cName.includes('PH');
    case '英国':
      return cName.includes('英国') || cName.includes('UK') || cName.includes('GB') || cName.includes('UKIPO');
    case '澳大利亚':
      return cName.includes('澳大利亚') || cName.includes('澳洲') || cName.includes('AU');
    case '阿联酋':
      return cName.includes('阿联酋') || cName.includes('AE') || cName.includes('迪拜') || cName.includes('阿布扎比');
    case '加拿大':
      return cName.includes('加拿大') || cName.includes('CA') || cName.includes('CIPO');
    case '巴西':
      return cName.includes('巴西') || cName.includes('BR') || cName.includes('INPI');
    case '俄罗斯':
      return cName.includes('俄罗斯') || cName.includes('RU');
    case '墨西哥':
      return cName.includes('墨西哥') || cName.includes('MX');
    case '印度':
      return cName.includes('印度') || cName.includes('IN');
    default:
      return false;
  }
};

export const RealWorldMap: React.FC<RealWorldMapProps> = ({
  onNavigate,
  onOpenTrademarkDetail,
  selectedBrand = 'usmile笑容加',
  selectedGoodItem = '电动牙刷、冲牙器、牙线 (2108)',
  caseItems = INITIAL_CASE_MANAGEMENT_ITEMS
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // 动态计算每个国家的统计数据（完全基于案件管理中【申请国家=当前选定国家】的真实案件数据）
  const dynamicMarketData: MarketLocation[] = useMemo(() => {
    const allCases = caseItems && caseItems.length > 0 ? caseItems : INITIAL_CASE_MANAGEMENT_ITEMS;

    return GLOBAL_MARKET_DATA.map(baseMarket => {
      // 筛选当前国家的全部案件
      const countryCases = allCases.filter(item => isCaseInCountry(item, baseMarket));

      const registeredCases = countryCases.filter(c => {
        const s = (c.status || '') as string;
        return s === 'REGISTERED' || s === 'COMPLETED' || s === '已注册' || s === '核准注册' || s.includes('已注册') || s.includes('核准注册') || s.includes('有效');
      });

      const examiningCases = countryCases.filter(c => {
        const s = (c.status || '') as string;
        return s === 'EXAMINING' || s === 'APPLYING' || s === 'PENDING_APPLY' || s === 'PENDING_REPLY' || s === 'CURRENT' || s === 'WAITING' ||
               s === '审查中' || s === '实质审查中' || s === '申请中' || s === '待申请' || s === '初审公告' || s === '待答复' || s === '待复审答辩' ||
               s.includes('审查') || s.includes('申请') || s.includes('公告') || s.includes('答复');
      });

      const expiredCases = countryCases.filter(c => {
        const s = (c.status || '') as string;
        return s === 'INVALID' || s === '已失效' || s === '驳回' || s === '无效宣告' ||
               s.includes('失效') || s.includes('驳回') || s.includes('无效');
      });

      const totalCount = countryCases.length;
      const registeredCount = registeredCases.length;
      const examiningCount = examiningCases.length;
      const expiredCount = expiredCases.length;

      // 确定状态
      let status: 'EXAMINING' | 'REGISTERED' | 'INVALID' | 'UNAPPLIED' = 'UNAPPLIED';
      if (totalCount === 0) {
        status = 'UNAPPLIED';
      } else if (registeredCount > 0) {
        status = 'REGISTERED';
      } else if (examiningCount > 0) {
        status = 'EXAMINING';
      } else if (expiredCount > 0) {
        status = 'INVALID';
      }

      // 提取涵盖类别
      const classSet = new Set<number>();
      countryCases.forEach(c => {
        if (c.classes) {
          const matched = c.classes.match(/\d+/g);
          if (matched) {
            matched.forEach(num => classSet.add(parseInt(num, 10)));
          }
        }
      });
      const classes = classSet.size > 0 ? Array.from(classSet).sort((a, b) => a - b) : (totalCount > 0 ? baseMarket.classes : []);

      // 1. 已注册 (REGISTERED) 维度提取
      const regClassSet = new Set<number>();
      registeredCases.forEach(c => {
        if (c.classes) {
          const matched = c.classes.match(/\d+/g);
          if (matched) matched.forEach(num => regClassSet.add(parseInt(num, 10)));
        }
      });
      const registeredClasses = Array.from(regClassSet).sort((a, b) => a - b);
      let registeredClassesStr = '-';
      if (registeredCount > 0) {
        if (registeredClasses.length > 0) {
          registeredClassesStr = `第 ${registeredClasses.join('、')} 类`;
        } else if (baseMarket.registeredClassesStr) {
          registeredClassesStr = baseMarket.registeredClassesStr;
        } else if (baseMarket.classes && baseMarket.classes.length > 0) {
          registeredClassesStr = `第 ${baseMarket.classes.join('、')} 类`;
        } else {
          registeredClassesStr = '第 21 类';
        }
      }

      const regNamesSet = new Set<string>();
      registeredCases.forEach(c => {
        if (c.trademarkName?.trim()) regNamesSet.add(c.trademarkName.trim());
      });
      const regNamesList = Array.from(regNamesSet);
      let registeredTrademarkNamesStr = '-';
      if (registeredCount > 0) {
        if (regNamesList.length > 0) {
          registeredTrademarkNamesStr = regNamesList.join('、');
        } else if (baseMarket.registeredTrademarkNamesStr) {
          registeredTrademarkNamesStr = baseMarket.registeredTrademarkNamesStr;
        } else {
          registeredTrademarkNamesStr = baseMarket.leadProduct || 'usmile笑容加';
        }
      }

      const regGoodsSet = new Set<string>();
      registeredCases.forEach(c => {
        if (c.goodsItems) {
          c.goodsItems.split(/[,，、;；]/).forEach(g => {
            const trimmed = g.trim();
            if (trimmed && trimmed.length <= 40) regGoodsSet.add(trimmed);
          });
        }
      });
      const regGoodsList = Array.from(regGoodsSet);
      let registeredGoodsSummary = '-';
      if (registeredCount > 0) {
        if (regGoodsList.length > 0) {
          registeredGoodsSummary = regGoodsList.slice(0, 5).join('、') + (regGoodsList.length > 5 ? ' 等' : '');
        } else if (baseMarket.registeredGoodsSummary && baseMarket.registeredGoodsSummary !== '暂无在案注册') {
          registeredGoodsSummary = baseMarket.registeredGoodsSummary;
        } else {
          registeredGoodsSummary = '电动牙刷、冲牙器、牙线';
        }
      }

      let registeredCoreIncluded = '-';
      if (registeredCount > 0) {
        if (regGoodsList.length > 0) {
          registeredCoreIncluded = regGoodsList.slice(0, 4).join('、');
        } else if (baseMarket.registeredCoreIncluded && baseMarket.registeredCoreIncluded !== '暂无在案商品') {
          registeredCoreIncluded = baseMarket.registeredCoreIncluded;
        } else {
          registeredCoreIncluded = '电动牙刷、冲牙器';
        }
      }

      // 2. 审查中 (EXAMINING) 维度提取
      const examClassSet = new Set<number>();
      examiningCases.forEach(c => {
        if (c.classes) {
          const matched = c.classes.match(/\d+/g);
          if (matched) matched.forEach(num => examClassSet.add(parseInt(num, 10)));
        }
      });
      const examiningClasses = Array.from(examClassSet).sort((a, b) => a - b);
      let examiningClassesStr = '-';
      if (examiningCount > 0) {
        if (examiningClasses.length > 0) {
          examiningClassesStr = `第 ${examiningClasses.join('、')} 类`;
        } else if (registeredClasses.length > 0) {
          examiningClassesStr = `第 ${registeredClasses.join('、')} 类`;
        } else if (baseMarket.classes && baseMarket.classes.length > 0) {
          examiningClassesStr = `第 ${baseMarket.classes.join('、')} 类`;
        } else {
          examiningClassesStr = '第 21 类';
        }
      }

      const examNamesSet = new Set<string>();
      examiningCases.forEach(c => {
        if (c.trademarkName?.trim()) examNamesSet.add(c.trademarkName.trim());
      });
      const examNamesList = Array.from(examNamesSet);
      let examiningTrademarkNamesStr = '-';
      if (examiningCount > 0) {
        if (examNamesList.length > 0) {
          examiningTrademarkNamesStr = examNamesList.join('、');
        } else if (regNamesList.length > 0) {
          examiningTrademarkNamesStr = regNamesList.join('、');
        } else {
          examiningTrademarkNamesStr = baseMarket.leadProduct || 'usmile笑容加';
        }
      }

      const examGoodsSet = new Set<string>();
      examiningCases.forEach(c => {
        if (c.goodsItems) {
          c.goodsItems.split(/[,，、;；]/).forEach(g => {
            const trimmed = g.trim();
            if (trimmed && trimmed.length <= 40) examGoodsSet.add(trimmed);
          });
        }
      });
      const examGoodsList = Array.from(examGoodsSet);
      let examiningGoodsSummary = '-';
      if (examiningCount > 0) {
        if (examGoodsList.length > 0) {
          examiningGoodsSummary = examGoodsList.slice(0, 5).join('、') + (examGoodsList.length > 5 ? ' 等' : '');
        } else if (regGoodsList.length > 0) {
          examiningGoodsSummary = regGoodsList.slice(0, 5).join('、') + (regGoodsList.length > 5 ? ' 等' : '');
        } else {
          examiningGoodsSummary = baseMarket.registeredGoodsSummary || '电动牙刷、冲牙器、牙线';
        }
      }

      // 3. 已失效 (INVALID/EXPIRED) 维度提取
      const invClassSet = new Set<number>();
      expiredCases.forEach(c => {
        if (c.classes) {
          const matched = c.classes.match(/\d+/g);
          if (matched) matched.forEach(num => invClassSet.add(parseInt(num, 10)));
        }
      });
      const invalidClasses = Array.from(invClassSet).sort((a, b) => a - b);
      let invalidClassesStr = '-';
      if (expiredCount > 0) {
        if (invalidClasses.length > 0) {
          invalidClassesStr = `第 ${invalidClasses.join('、')} 类`;
        } else if (baseMarket.invalidClassesStr) {
          invalidClassesStr = baseMarket.invalidClassesStr;
        } else {
          invalidClassesStr = '第 3 类';
        }
      }

      const invNamesSet = new Set<string>();
      expiredCases.forEach(c => {
        if (c.trademarkName?.trim()) invNamesSet.add(c.trademarkName.trim());
      });
      const invNamesList = Array.from(invNamesSet);
      let invalidTrademarkNamesStr = '-';
      if (expiredCount > 0) {
        if (invNamesList.length > 0) {
          invalidTrademarkNamesStr = invNamesList.join('、');
        } else {
          invalidTrademarkNamesStr = 'usmile (已失效)';
        }
      }

      const invGoodsSet = new Set<string>();
      expiredCases.forEach(c => {
        if (c.goodsItems) {
          c.goodsItems.split(/[,，、;；]/).forEach(g => {
            const trimmed = g.trim();
            if (trimmed && trimmed.length <= 40) invGoodsSet.add(trimmed);
          });
        }
      });
      const invGoodsList = Array.from(invGoodsSet);
      let invalidGoodsSummary = '-';
      if (expiredCount > 0) {
        if (invGoodsList.length > 0) {
          invalidGoodsSummary = invGoodsList.slice(0, 5).join('、') + (invGoodsList.length > 5 ? ' 等' : '');
        } else {
          invalidGoodsSummary = '口腔清洁制剂、美白漱口水';
        }
      }

      // 主管局与代理律所
      const authority = countryCases.find(c => c.officialAgency)?.officialAgency || baseMarket.authority;
      const lawFirm = countryCases.find(c => c.agencyName)?.agencyName || baseMarket.lawFirm;
      const nextRenewalDate = countryCases.find(c => c.validUntil || c.rightsEndDate)?.validUntil || 
                              countryCases.find(c => c.validUntil || c.rightsEndDate)?.rightsEndDate || 
                              baseMarket.nextRenewalDate;

      const leadProduct = countryCases.map(c => c.trademarkName).filter(Boolean).slice(0, 4).join('、') || baseMarket.leadProduct;

      return {
        ...baseMarket,
        registeredCount,
        examiningCount,
        expiredCount,
        totalCount,
        status,
        classes: classes.length > 0 ? classes : baseMarket.classes,
        registeredGoodsSummary,
        registeredCoreIncluded,
        registeredClassesStr,
        registeredTrademarkNamesStr,
        examiningClassesStr,
        examiningTrademarkNamesStr,
        examiningGoodsSummary,
        invalidClassesStr,
        invalidTrademarkNamesStr,
        invalidGoodsSummary,
        authority,
        lawFirm,
        nextRenewalDate,
        leadProduct
      };
    });
  }, [caseItems]);

  const [mapStyle, setMapStyle] = useState<MapTileStyle>('carto-light');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EXAMINING' | 'REGISTERED' | 'INVALID' | 'UNAPPLIED'>('ALL');
  const [selectedMarketId, setSelectedMarketId] = useState<string>('CN');
  
  const selectedMarket = useMemo(() => {
    return dynamicMarketData.find(m => m.id === selectedMarketId) || dynamicMarketData[0] || null;
  }, [dynamicMarketData, selectedMarketId]);

  // 地图卡片顶部统计数据精准依据需求逻辑计算：
  // 1. 全部：统计国家地区映射表中全部国家的数量
  // 2. 已注册：案件管理中含有已注册商标的国家数量
  // 3. 审查中：案件管理中含有审查中商标的国家数量
  // 4. 已失效：案件管理中含有已失效商标的国家数量
  // 5. 未布局：还没有提交申请的国家数量 (在案案件数为0)
  const marketCounts = useMemo(() => {
    const total = dynamicMarketData.length;
    const registered = dynamicMarketData.filter(m => m.registeredCount > 0).length;
    const examining = dynamicMarketData.filter(m => m.examiningCount > 0).length;
    const expired = dynamicMarketData.filter(m => m.expiredCount > 0).length;
    const unapplied = dynamicMarketData.filter(m => m.totalCount === 0).length;
    return { total, registered, examining, expired, unapplied };
  }, [dynamicMarketData]);

  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [markerDensity, setMarkerDensity] = useState<'MINIMAL' | 'COMPACT'>('MINIMAL'); // 简约微标 vs 紧凑胶囊
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 地图右上角设置默认收起
  const [isRegionOpen, setIsRegionOpen] = useState(false); // 区域快速定位默认收起
  
  // Country Ledger Modal State (对齐案件管理状态Tab)
  type LedgerStatusTabType = 'ALL' | 'PENDING_APPLY' | 'APPLYING' | 'EXAMINING' | 'REGISTERED' | 'PENDING_REPLY' | 'INVALID';
  const [isCountryLedgerOpen, setIsCountryLedgerOpen] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerStatusTab, setLedgerStatusTab] = useState<LedgerStatusTabType>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopyRegNo = (regNo: string) => {
    navigator.clipboard?.writeText(regNo);
    setCopiedId(regNo);
    setToastMessage(`已复制注册/申请号：${regNo}`);
    setTimeout(() => setCopiedId(null), 2000);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Leaflet Map Instance centered around Asia / Global view
    const map = L.map(mapContainerRef.current, {
      center: [25.0, 70.0],
      zoom: 2.7,
      minZoom: 2,
      maxZoom: 12,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
    });

    // Initial Tile Layer
    const provider = TILE_PROVIDERS[mapStyle];
    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
      subdomains: provider.subdomains
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Create a markers group
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = markersGroup;

    mapInstanceRef.current = map;

    // Bind tab switching listener for interactive tooltip popups
    map.on('popupopen', (e: L.PopupEvent) => {
      const popupEl = e.popup.getElement();
      if (!popupEl) return;

      const tabBtns = popupEl.querySelectorAll<HTMLButtonElement>('.popup-tab-btn');
      const tabPanes = popupEl.querySelectorAll<HTMLElement>('.popup-tab-pane');

      if (tabBtns.length === 0) return;

      tabBtns.forEach(btn => {
        const handleTabSwitch = (ev: Event) => {
          ev.stopPropagation();
          const targetTab = btn.getAttribute('data-tab');
          if (!targetTab) return;

          tabBtns.forEach(b => {
            const bTab = b.getAttribute('data-tab');
            if (bTab === targetTab) {
              b.className = `popup-tab-btn active text-[11px] font-bold px-2 py-1 rounded-md shadow-2xs transition-all cursor-pointer ${
                bTab === 'registered' ? 'bg-emerald-600 text-white' :
                bTab === 'examining' ? 'bg-amber-500 text-white' :
                'bg-rose-500 text-white'
              }`;
            } else {
              b.className = 'popup-tab-btn text-[11px] font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer';
            }
          });

          tabPanes.forEach(pane => {
            if (pane.getAttribute('data-pane') === targetTab) {
              pane.classList.remove('hidden');
            } else {
              pane.classList.add('hidden');
            }
          });
        };

        btn.addEventListener('click', handleTabSwitch);
        btn.addEventListener('mouseenter', handleTabSwitch);
      });
    });

    // Safe resize handler with ResizeObserver
    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    const handleWindowResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleWindowResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Switch Tile Styles smoothly
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const provider = TILE_PROVIDERS[mapStyle];
    tileLayerRef.current.setUrl(provider.url);
  }, [mapStyle]);

  // 3. Render Custom Interactive HTML Markers (简约轻量微胶囊，零遮挡防混乱)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const layerGroup = markersLayerGroupRef.current;
    layerGroup.clearLayers();

    const filteredMarkets = dynamicMarketData.filter(market => {
      if (statusFilter === 'REGISTERED' && market.registeredCount === 0) return false;
      if (statusFilter === 'EXAMINING' && market.examiningCount === 0) return false;
      if (statusFilter === 'INVALID' && market.expiredCount === 0) return false;
      if (statusFilter === 'UNAPPLIED' && market.totalCount > 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          market.name.toLowerCase().includes(q) ||
          market.nameEn.toLowerCase().includes(q) ||
          market.authority.toLowerCase().includes(q)
        );
      }
      return true;
    });

    filteredMarkets.forEach(market => {
      // Determine status dot color & badge tone
      let isExamining = market.status === 'EXAMINING';
      let isInvalid = market.status === 'INVALID';
      let isUnapplied = market.status === 'UNAPPLIED';

      if (statusFilter === 'EXAMINING') {
        isExamining = true;
        isInvalid = false;
        isUnapplied = false;
      } else if (statusFilter === 'INVALID') {
        isInvalid = true;
        isExamining = false;
        isUnapplied = false;
      } else if (statusFilter === 'REGISTERED') {
        isExamining = false;
        isInvalid = false;
        isUnapplied = false;
      } else if (statusFilter === 'UNAPPLIED') {
        isUnapplied = true;
        isExamining = false;
        isInvalid = false;
      }

      const isChina = market.id === 'CN' || market.name === '中国';
      
      let dotBg = 'bg-emerald-500';
      let dotPing = 'bg-emerald-400';
      
      if (isExamining) {
        dotBg = 'bg-amber-500';
        dotPing = 'bg-amber-400';
      } else if (isInvalid) {
        dotBg = 'bg-rose-500';
        dotPing = 'bg-rose-400';
      } else if (isUnapplied) {
        dotBg = 'bg-slate-400';
        dotPing = 'bg-slate-300';
      }

      const isSelected = selectedMarket?.id === market.id;

      // 极简大圆点 + 下方直接显示国家中文名 (中国显示五星红旗特别徽标，无闪烁动画)
      const markerContentHtml = `
        <div class="flex flex-col items-center group cursor-pointer select-none">
          ${isChina ? `
            <!-- 中国专用五星红旗徽章 (高亮五星红旗，静态稳定无闪烁) -->
            <div class="relative flex flex-col items-center">
              <div class="relative z-10 flex items-center justify-center bg-[#de2910] p-[1.5px] rounded shadow-md border-1.5 border-amber-300 transform transition-transform duration-200 group-hover:scale-125">
                <!-- 五星红旗 SVG -->
                <svg class="w-7 h-[18px] rounded-[1px]" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
                  <rect width="900" height="600" fill="#de2910"/>
                  <!-- 大星 -->
                  <g transform="translate(150, 150)">
                    <polygon points="0,-90 26.4,-18.5 101.9,-18.5 40.8,25.9 64.2,97.4 0,50.7 -64.2,97.4 -40.8,25.9 -101.9,-18.5 -26.4,-18.5" fill="#ffde00"/>
                  </g>
                  <!-- 4颗小星 -->
                  <g transform="translate(300, 60) rotate(-120.96)">
                    <polygon points="0,-30 8.8,-6.2 34.0,-6.2 13.6,8.6 21.4,32.5 0,16.9 -21.4,32.5 -13.6,8.6 -34.0,-6.2 -8.8,-6.2" fill="#ffde00"/>
                  </g>
                  <g transform="translate(360, 120) rotate(-98.13)">
                    <polygon points="0,-30 8.8,-6.2 34.0,-6.2 13.6,8.6 21.4,32.5 0,16.9 -21.4,32.5 -13.6,8.6 -34.0,-6.2 -8.8,-6.2" fill="#ffde00"/>
                  </g>
                  <g transform="translate(360, 210) rotate(-74.05)">
                    <polygon points="0,-30 8.8,-6.2 34.0,-6.2 13.6,8.6 21.4,32.5 0,16.9 -21.4,32.5 -13.6,8.6 -34.0,-6.2 -8.8,-6.2" fill="#ffde00"/>
                  </g>
                  <g transform="translate(300, 270) rotate(-51.34)">
                    <polygon points="0,-30 8.8,-6.2 34.0,-6.2 13.6,8.6 21.4,32.5 0,16.9 -21.4,32.5 -13.6,8.6 -34.0,-6.2 -8.8,-6.2" fill="#ffde00"/>
                  </g>
                </svg>
              </div>
            </div>
          ` : `
            <!-- 醒目原点圆圈 (静态纯净无闪烁，白色边框与投影) -->
            <div class="relative flex items-center justify-center">
              <span class="w-5 h-5 rounded-full ${isSelected ? 'bg-blue-600 ring-4 ring-blue-400/40' : dotBg} border-2 border-white shadow-md flex items-center justify-center relative z-10 transition-transform duration-200 group-hover:scale-125">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              </span>
            </div>
          `}

          <!-- 圆圈正下方直接显示国家中文名字 -->
          <div class="mt-1 px-1.5 py-0.5 rounded-md ${
            isSelected 
              ? 'bg-blue-600 text-white border border-blue-600 shadow-sm font-black' 
              : isChina
              ? 'bg-red-50 text-red-950 border border-red-200 shadow-2xs font-black'
              : 'bg-white/95 text-slate-800 border border-slate-200/90 shadow-2xs font-bold'
          } text-[11px] tracking-tight whitespace-nowrap leading-none transition-all duration-150 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-xs">
            ${market.name}
          </div>
        </div>
      `;

      const iconHtml = `
        <div class="relative flex items-center justify-center ${isSelected ? 'z-50' : 'z-20'}">
          ${markerContentHtml}
        </div>
      `;

      const width = 72;
      const height = 44;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-trademark-marker-clean',
        iconSize: [width, height],
        iconAnchor: [width / 2, 10], // Anchor directly on the center of the circle
      });

      const marker = L.marker([market.lat, market.lng], { icon: customIcon });

      // 悬停时展现该国家详细注册信息（根据筛选状态 statusFilter 或国家自身状态区分）
      let popupBodyHtml = '';

      // 1. 如果用户点击左上角【已注册】筛选，或者在全部模式下属于已注册国家: 维持 3 个 Tab（已注册 / 审查中 / 已失效）自由切换展示
      if (
        statusFilter === 'REGISTERED' ||
        (statusFilter === 'ALL' && (market.registeredCount > 0 || market.status === 'REGISTERED'))
      ) {
        // 1. 已注册的国家: 显示已注册、审查中、已失效 3 个 Tab 和对应数据
        // 点击【已注册】: 已注册商标类别、包含商品与服务
        // 点击【审查中】: 审查中商标类别、包含商品与服务
        // 点击【已失效】: 已失效商标类别、包含商品与服务
        popupBodyHtml = `
          <!-- Tab 导航栏 -->
          <div class="flex items-center gap-1 border-b border-slate-100 pb-1.5 mb-2">
            <button
              type="button"
              data-tab="registered"
              class="popup-tab-btn active text-[11px] font-bold px-2 py-1 rounded-md bg-emerald-600 text-white shadow-2xs transition-all cursor-pointer"
            >
              已注册 (${market.registeredCount})
            </button>
            <button
              type="button"
              data-tab="examining"
              class="popup-tab-btn text-[11px] font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
            >
              审查中 (${market.examiningCount})
            </button>
            <button
              type="button"
              data-tab="invalid"
              class="popup-tab-btn text-[11px] font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
            >
              已失效 (${market.expiredCount})
            </button>
          </div>

          <!-- Tab 内容固定高度容器 (防止 Tab 切换时弹框高度跳动) -->
          <div class="popup-tab-pane-wrapper min-h-[115px] max-h-[180px] flex flex-col justify-start overflow-y-auto">
            <!-- Tab 1: 已注册内容 (已注册尼斯分类、包含商品与服务) -->
            <div data-pane="registered" class="popup-tab-pane space-y-1.5 text-xs">
              <div class="p-1.5 rounded-lg bg-slate-50 border border-slate-200/90">
                <div class="text-[11px] font-bold mb-0.5 text-slate-900">已注册尼斯分类：</div>
                <div class="font-medium text-[11px] leading-relaxed ${market.registeredClassesStr === '-' ? 'text-slate-400 font-normal' : 'text-blue-900'} font-sans">
                  ${market.registeredClassesStr || '-'}
                </div>
              </div>
              <div class="p-1.5 rounded-lg bg-slate-50 border border-slate-200/90">
                <div class="text-[11px] font-bold mb-0.5 text-slate-900">包含商品与服务：</div>
                <div class="font-medium text-[11px] leading-relaxed ${market.registeredGoodsSummary === '-' ? 'text-slate-400' : 'text-slate-700'}">
                  ${market.registeredGoodsSummary || '-'}
                </div>
              </div>
            </div>

            <!-- Tab 2: 审查中内容 (审查中尼斯分类、包含商品与服务) -->
            <div data-pane="examining" class="popup-tab-pane hidden space-y-1.5 text-xs">
              <div class="p-1.5 rounded-lg bg-amber-50/60 border border-amber-200/90">
                <div class="text-[11px] font-bold mb-0.5 text-amber-950">审查中尼斯分类：</div>
                <div class="font-medium text-[11px] leading-relaxed ${market.examiningClassesStr === '-' ? 'text-slate-400 font-normal' : 'text-amber-900'} font-sans">
                  ${market.examiningClassesStr || '-'}
                </div>
              </div>
              <div class="p-1.5 rounded-lg bg-amber-50/60 border border-amber-200/90">
                <div class="text-[11px] font-bold mb-0.5 text-amber-950">包含商品与服务：</div>
                <div class="font-medium text-[11px] leading-relaxed ${market.examiningGoodsSummary === '-' ? 'text-slate-400' : 'text-slate-700'}">
                  ${market.examiningGoodsSummary || '-'}
                </div>
              </div>
            </div>

            <!-- Tab 3: 已失效内容 (已失效尼斯分类、包含商品与服务) -->
            <div data-pane="invalid" class="popup-tab-pane hidden space-y-1.5 text-xs">
              <div class="p-1.5 rounded-lg bg-rose-50/60 border border-rose-200/90">
                <div class="text-[11px] font-bold mb-0.5 text-rose-950">已失效尼斯分类：</div>
                <div class="font-medium text-[11px] leading-relaxed ${market.invalidClassesStr === '-' ? 'text-slate-400 font-normal' : 'text-rose-900'} font-sans">
                  ${market.invalidClassesStr || '-'}
                </div>
              </div>
              <div class="p-1.5 rounded-lg bg-rose-50/60 border border-rose-200/90">
                <div class="text-[11px] font-bold mb-0.5 text-rose-950">包含商品与服务：</div>
                <div class="font-medium text-[11px] leading-relaxed ${market.invalidGoodsSummary === '-' ? 'text-slate-400' : 'text-slate-700'}">
                  ${market.invalidGoodsSummary || '-'}
                </div>
              </div>
            </div>
          </div>
        `;
      } else if (
        statusFilter === 'EXAMINING' ||
        (statusFilter === 'ALL' && (market.examiningCount > 0 || market.status === 'EXAMINING'))
      ) {
        // 2. 点击左上角【审查中】或审查中的国家: 悬浮框只显示审查中数据，不显示已注册和已失效 Tab
        // 提示框内容显示：审查中尼斯分类、包含商品与服务
        popupBodyHtml = `
          <div class="space-y-1.5 text-xs">
            <div class="p-1.5 rounded-lg bg-amber-50/60 border border-amber-200/90">
              <div class="text-[11px] font-bold mb-0.5 text-amber-950">审查中尼斯分类：</div>
              <div class="font-medium text-[11px] leading-relaxed ${market.examiningClassesStr === '-' ? 'text-slate-400 font-normal' : 'text-amber-900'} font-sans">
                ${market.examiningClassesStr || '-'}
              </div>
            </div>
            <div class="p-1.5 rounded-lg bg-amber-50/60 border border-amber-200/90">
              <div class="text-[11px] font-bold mb-0.5 text-amber-950">包含商品与服务：</div>
              <div class="font-medium text-[11px] leading-relaxed ${market.examiningGoodsSummary === '-' ? 'text-slate-400' : 'text-slate-700'}">
                ${market.examiningGoodsSummary || '-'}
              </div>
            </div>
          </div>
        `;
      } else if (
        statusFilter === 'INVALID' ||
        (statusFilter === 'ALL' && (market.expiredCount > 0 || market.status === 'INVALID'))
      ) {
        // 3. 点击左上角【已失效】或失效的国家: 悬浮框只显示已失效数据，不显示已注册和审查中 Tab
        // 提示框内容显示：已失效尼斯分类、包含商品与服务
        popupBodyHtml = `
          <div class="space-y-1.5 text-xs">
            <div class="p-1.5 rounded-lg bg-rose-50/60 border border-rose-200/90">
              <div class="text-[11px] font-bold mb-0.5 text-rose-950">已失效尼斯分类：</div>
              <div class="font-medium text-[11px] leading-relaxed ${market.invalidClassesStr === '-' ? 'text-slate-400 font-normal' : 'text-rose-900'} font-sans">
                ${market.invalidClassesStr || '-'}
              </div>
            </div>
            <div class="p-1.5 rounded-lg bg-rose-50/60 border border-rose-200/90">
              <div class="text-[11px] font-bold mb-0.5 text-rose-950">包含商品与服务：</div>
              <div class="font-medium text-[11px] leading-relaxed ${market.invalidGoodsSummary === '-' ? 'text-slate-400' : 'text-slate-700'}">
                ${market.invalidGoodsSummary || '-'}
              </div>
            </div>
          </div>
        `;
      } else {
        // 4. 未布局的国家: 显示未布局，提示框内容显示为空
        popupBodyHtml = `
          <div class="py-3 text-center text-slate-400 text-xs font-normal">
            未布局
          </div>
        `;
      }

      const popupHtml = `
        <div class="font-sans text-slate-800 p-2.5 min-w-[260px] max-w-[320px] select-none">
          <!-- 头部：国旗 + 国家中文名 -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2 gap-1 flex-wrap">
            <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <span class="text-base">${market.flag}</span>
              <span>${market.name}</span>
            </div>
            
            <div class="flex items-center gap-1 text-[10px] font-bold">
              ${(statusFilter === 'EXAMINING' || (statusFilter === 'ALL' && market.registeredCount === 0 && (market.examiningCount > 0 || market.status === 'EXAMINING'))) ? `
                <span class="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  审查中 · ${market.examiningCount > 0 ? market.examiningCount : market.totalCount || 1} 件
                </span>
              ` : ''}
              ${(statusFilter === 'INVALID' || (statusFilter === 'ALL' && market.registeredCount === 0 && market.examiningCount === 0 && (market.expiredCount > 0 || market.status === 'INVALID'))) ? `
                <span class="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                  已失效 · ${market.expiredCount > 0 ? market.expiredCount : market.totalCount || 1} 件
                </span>
              ` : ''}
              ${market.totalCount === 0 || (market.status === 'UNAPPLIED' && market.registeredCount === 0 && market.examiningCount === 0 && market.expiredCount === 0) ? `
                <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  未布局
                </span>
              ` : ''}
            </div>
          </div>

          <!-- 主体内容 -->
          ${popupBodyHtml}
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        offset: [0, -12],
        className: 'leaflet-custom-popup'
      });

      // 鼠标悬停 (hover) 自动打开注册详情提示框，移出时关闭
      marker.on('mouseover', () => {
        marker.openPopup();
      });

      marker.on('mouseout', () => {
        if (selectedMarket?.id !== market.id) {
          marker.closePopup();
        }
      });

      // Click listener
      marker.on('click', () => {
        setSelectedMarketId(market.id);
        map.panTo([market.lat, market.lng], { animate: true, duration: 0.5 });
      });

      layerGroup.addLayer(marker);
    });
  }, [dynamicMarketData, statusFilter, searchQuery, selectedMarket, markerDensity]);

  // Quick Region Focus Helpers
  const handleFocusRegion = (region: 'GLOBAL' | 'APAC' | 'EMEA' | 'AMER' | 'SEA') => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    switch (region) {
      case 'GLOBAL':
        map.flyTo([28.0, 75.0], 2.5, { duration: 1 });
        break;
      case 'APAC':
        map.flyTo([30.0, 115.0], 4, { duration: 1 });
        break;
      case 'EMEA':
        map.flyTo([48.0, 15.0], 4.2, { duration: 1 });
        break;
      case 'AMER':
        map.flyTo([38.0, -96.0], 3.8, { duration: 1 });
        break;
      case 'SEA':
        map.flyTo([6.0, 108.0], 4.6, { duration: 1 });
        break;
    }
  };

  // Handle status filter change and automatically position/fit viewport to filtered countries
  const handleStatusChange = (newStatus: 'ALL' | 'EXAMINING' | 'REGISTERED' | 'INVALID' | 'UNAPPLIED') => {
    setStatusFilter(newStatus);

    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (newStatus === 'ALL') {
      // Return to overall global view
      map.flyTo([25.0, 70.0], 2.7, { duration: 1.2 });
      return;
    }

    const matchingMarkets = dynamicMarketData.filter(m => m.status === newStatus);
    if (matchingMarkets.length === 0) return;

    if (matchingMarkets.length === 1) {
      const target = matchingMarkets[0];
      map.flyTo([target.lat, target.lng], 4.2, { duration: 1.2 });
    } else {
      const bounds = L.latLngBounds(matchingMarkets.map(m => [m.lat, m.lng]));
      map.flyToBounds(bounds, {
        padding: [60, 60],
        maxZoom: 3.8,
        duration: 1.2
      });
    }
  };

  const handleZoom = (delta: number) => {
    if (!mapInstanceRef.current) return;
    const current = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(current + delta);
  };

  const handleReset = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([28.0, 75.0], 2.5);
    setSelectedMarketId('CN');
  };

  return (
    <div className="space-y-3">
      {/* Toast 提示 (页面居中显示) */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] max-w-md px-6 py-4 bg-slate-900/95 backdrop-blur-md text-white text-sm font-semibold rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-slate-700/80 pointer-events-none text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      
      {/* 1. Real Map Viewport Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
        
        {/* Real Leaflet Map Container Mount Point */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-[460px] md:h-[500px] z-0 focus:outline-none"
          style={{ background: '#e5e9ec' }}
        />

        {/* Top-Left: Market Summary & Filter Group */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-2 max-w-[calc(100%-160px)] sm:max-w-none">
          {/* Market Summary & Filter Group - 3 Rows Structure */}
          <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-1.5 min-w-[220px]">
            {/* Row 1: Header + 全部 */}
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
              <span className="text-xs font-black text-black font-sans whitespace-nowrap">
                🌍 {marketCounts.total} 个国家/地区
              </span>
              <button
                onClick={() => handleStatusChange('ALL')}
                className={`px-2 py-0.5 rounded-md text-xs transition-all text-black cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-200 border border-slate-400 shadow-2xs font-black'
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-semibold'
                }`}
              >
                全部 ({marketCounts.total})
              </button>
            </div>

            {/* Row 2: 已注册 & 审查中 */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleStatusChange('REGISTERED')}
                className={`px-2 py-1 rounded-md text-xs transition-all flex items-center justify-center gap-1.5 text-black cursor-pointer ${
                  statusFilter === 'REGISTERED'
                    ? 'bg-emerald-100/90 border border-emerald-400 shadow-2xs font-black'
                    : 'bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-200/80 font-medium'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-black whitespace-nowrap">已注册 ({marketCounts.registered})</span>
              </button>

              <button
                onClick={() => handleStatusChange('EXAMINING')}
                className={`px-2 py-1 rounded-md text-xs transition-all flex items-center justify-center gap-1.5 text-black cursor-pointer ${
                  statusFilter === 'EXAMINING'
                    ? 'bg-amber-100/90 border border-amber-400 shadow-2xs font-black'
                    : 'bg-slate-50/80 hover:bg-amber-50/60 border border-slate-200/80 font-medium'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-black whitespace-nowrap">审查中 ({marketCounts.examining})</span>
              </button>
            </div>

            {/* Row 3: 失效 & 未布局 */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleStatusChange('INVALID')}
                className={`px-2 py-1 rounded-md text-xs transition-all flex items-center justify-center gap-1.5 text-black cursor-pointer ${
                  statusFilter === 'INVALID'
                    ? 'bg-rose-100/90 border border-rose-400 shadow-2xs font-black'
                    : 'bg-slate-50/80 hover:bg-rose-50/60 border border-slate-200/80 font-medium'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                <span className="text-black whitespace-nowrap">失效 ({marketCounts.expired})</span>
              </button>

              <button
                onClick={() => handleStatusChange('UNAPPLIED')}
                className={`px-2 py-1 rounded-md text-xs transition-all flex items-center justify-center gap-1.5 text-black cursor-pointer ${
                  statusFilter === 'UNAPPLIED'
                    ? 'bg-slate-200 border border-slate-400 shadow-2xs font-black'
                    : 'bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 font-medium'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                <span className="text-black whitespace-nowrap">未布局 ({marketCounts.unapplied})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top-Right: Map Settings + Collapsible Quick Region Locator */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
          {/* 1. Map Settings Toolbar */}
          {!isSettingsOpen ? (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200/90 shadow-sm text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer hover:shadow-xs"
              title="展开地图显示与图层设置"
            >
              <Settings className="w-3.5 h-3.5 text-blue-600" />
              <span>地图设置</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/90 shadow-md animate-in fade-in zoom-in-95 duration-150">
              
              {/* Marker Density Switcher: Minimal vs Compact */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-700">
                <button
                  onClick={() => setMarkerDensity('MINIMAL')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    markerDensity === 'MINIMAL' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="极简微标：仅展示国旗与数量，彻底防遮挡"
                >
                  极简微标
                </button>
                <button
                  onClick={() => setMarkerDensity('COMPACT')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    markerDensity === 'COMPACT' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="紧凑胶囊：展示国旗、国名与数量"
                >
                  紧凑胶囊
                </button>
              </div>

              <div className="w-[1px] h-4 bg-slate-200" />

              {/* Layer Style Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  title="切换地图图层底图样式"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>{TILE_PROVIDERS[mapStyle].name}</span>
                </button>

                {isLayerMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                    {(Object.keys(TILE_PROVIDERS) as MapTileStyle[]).map((styleKey) => {
                      const item = TILE_PROVIDERS[styleKey];
                      const isCurrent = mapStyle === styleKey;
                      return (
                        <button
                          key={styleKey}
                          onClick={() => {
                            setMapStyle(styleKey);
                            setIsLayerMenuOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-blue-50/80 transition-colors ${
                            isCurrent ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                          }`}
                        >
                          <span>{item.name}</span>
                          {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="w-[1px] h-4 bg-slate-200" />

              {/* Zoom In */}
              <button 
                onClick={() => handleZoom(1)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                title="放大地图"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Zoom Out */}
              <button 
                onClick={() => handleZoom(-1)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                title="缩小地图"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Reset Global Center */}
              <button 
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                title="还原至全球视角"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-4 bg-slate-200" />

              {/* Close Button */}
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="收起设置"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 2. Quick Region Locator directly underneath Map Settings */}
          <div className="flex flex-col items-end">
            <button
              onClick={() => setIsRegionOpen(!isRegionOpen)}
              className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200/90 shadow-sm text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer hover:shadow-xs"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>快速定位区域</span>
              {isRegionOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
            </button>

            {isRegionOpen && (
              <div className="mt-1.5 flex flex-wrap items-center justify-end gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/90 shadow-md animate-in fade-in zoom-in-95 duration-150">
                <button 
                  onClick={() => handleFocusRegion('GLOBAL')}
                  className="px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
                >
                  🌍 全球
                </button>
                <button 
                  onClick={() => handleFocusRegion('APAC')}
                  className="px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
                >
                  🇨🇳 亚太
                </button>
                <button 
                  onClick={() => handleFocusRegion('SEA')}
                  className="px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
                >
                  🌴 东南亚
                </button>
                <button 
                  onClick={() => handleFocusRegion('EMEA')}
                  className="px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
                >
                  🇪🇺 欧洲中东
                </button>
                <button 
                  onClick={() => handleFocusRegion('AMER')}
                  className="px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
                >
                  🇺🇸 北美
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 2. Selected Market Detail Card (卡片式国家商标布局详情展示) */}
      {selectedMarket && (
        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-3.5 sm:p-4 rounded-xl border border-blue-100 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-in fade-in duration-200">
          
          {/* Left: Country flag & Title & Authority & Registered Classes/Names */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white border border-blue-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
              {selectedMarket.flag}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-slate-900 font-sans">
                  {selectedMarket.name} ({selectedMarket.nameEn})
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                  {selectedBrand} 重点部署市场
                </span>
              </div>
              <div className="text-xs text-slate-700 mt-1 flex items-center gap-3 flex-wrap">
                <span><strong>已注册类别：</strong>{selectedMarket.registeredClassesStr || '暂无已注册类别'}</span>
                {selectedMarket.expiredCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-600 font-medium"><strong>已失效类别：</strong>{selectedMarket.invalidClassesStr || '暂无已失效类别'}</span>
                  </>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3 flex-wrap">
                <span><strong>审查机构：</strong>{selectedMarket.authority}</span>
                <span>•</span>
                <span><strong>协同律所：</strong>{selectedMarket.lawFirm}</span>
              </div>
            </div>
          </div>

          {/* Middle: Metrics Pills */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs text-center min-w-[70px]">
              <div className="text-[10px] text-slate-400 font-medium">在案总数</div>
              <div className="text-base font-black text-slate-900 font-sans">{selectedMarket.totalCount}</div>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs text-center min-w-[70px]">
              <div className="text-[10px] text-slate-400 font-medium">已获准注册</div>
              <div className="text-base font-black text-emerald-600 font-sans">{selectedMarket.registeredCount}</div>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs text-center min-w-[70px]">
              <div className="text-[10px] text-slate-400 font-medium">审查中</div>
              <div className="text-base font-black text-amber-600 font-sans">{selectedMarket.examiningCount}</div>
            </div>
            {selectedMarket.expiredCount > 0 && (
              <div className="bg-white px-3 py-1.5 rounded-lg border border-red-200/80 shadow-2xs text-center min-w-[70px]">
                <div className="text-[10px] text-red-500 font-medium font-bold">已失效</div>
                <div className="text-base font-black text-red-600 font-sans">{selectedMarket.expiredCount}</div>
              </div>
            )}
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs text-center min-w-[80px]">
              <div className="text-[10px] text-slate-400 font-medium">下次续展</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">{selectedMarket.nextRenewalDate}</div>
            </div>
          </div>

          {/* Right: Actions (移除发起海外新申请，点击查看该国台账弹出弹窗) */}
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            <button
              onClick={() => {
                setLedgerSearch('');
                setLedgerStatusTab('ALL');
                setIsCountryLedgerOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>查看该国台账</span>
            </button>
          </div>

        </div>
      )}

      {/* 3. Country Trademark Ledger Modal (国家/地区商标资产台账弹窗 - 全屏大可视区，对齐案件管理列表) */}
      {isCountryLedgerOpen && selectedMarket && (() => {
        // 筛选当前选定国家/地区的真实案件数据
        const countryCases = (caseItems && caseItems.length > 0 ? caseItems : INITIAL_CASE_MANAGEMENT_ITEMS).filter(item => 
          isCaseInCountry(item, selectedMarket)
        );

        // 状态匹配辅助函数
        const isStatusMatch = (status: string, tab: LedgerStatusTabType) => {
          if (tab === 'ALL') return true;
          if (tab === 'PENDING_APPLY') return status === 'PENDING_APPLY' || status === '待申请';
          if (tab === 'APPLYING') return status === 'APPLYING' || status === '申请中';
          if (tab === 'EXAMINING') return status === 'EXAMINING' || status === '审查中' || status === '实质审查中';
          if (tab === 'REGISTERED') return status === 'REGISTERED' || status === '已注册';
          if (tab === 'PENDING_REPLY') return status === 'PENDING_REPLY' || status === '待答复';
          if (tab === 'INVALID') return status === 'INVALID' || status === '已失效' || status === '驳回';
          return false;
        };

        // Tab项及数量统计
        const statusTabs: { key: LedgerStatusTabType; label: string; count: number }[] = [
          { key: 'ALL', label: '全部案件', count: countryCases.length },
          { key: 'PENDING_APPLY', label: '待申请', count: countryCases.filter(c => isStatusMatch(c.status, 'PENDING_APPLY')).length },
          { key: 'APPLYING', label: '申请中', count: countryCases.filter(c => isStatusMatch(c.status, 'APPLYING')).length },
          { key: 'EXAMINING', label: '审查中', count: countryCases.filter(c => isStatusMatch(c.status, 'EXAMINING')).length },
          { key: 'REGISTERED', label: '已注册', count: countryCases.filter(c => isStatusMatch(c.status, 'REGISTERED')).length },
          { key: 'PENDING_REPLY', label: '待答复', count: countryCases.filter(c => isStatusMatch(c.status, 'PENDING_REPLY')).length },
          { key: 'INVALID', label: '已失效', count: countryCases.filter(c => isStatusMatch(c.status, 'INVALID')).length }
        ];

        // 搜索及Tab过滤后的清单
        const filteredCountryCases = countryCases.filter(item => {
          if (!isStatusMatch(item.status, ledgerStatusTab)) return false;
          if (ledgerSearch.trim()) {
            const q = ledgerSearch.toLowerCase().trim();
            const match = 
              item.caseNo?.toLowerCase().includes(q) ||
              item.proposalNo?.toLowerCase().includes(q) ||
              item.trademarkName?.toLowerCase().includes(q) ||
              item.brand?.toLowerCase().includes(q) ||
              item.classes?.toLowerCase().includes(q) ||
              item.country?.toLowerCase().includes(q) ||
              item.jurisdiction?.toLowerCase().includes(q) ||
              item.applicationNo?.toLowerCase().includes(q) ||
              item.registrationNo?.toLowerCase().includes(q) ||
              item.agencyName?.toLowerCase().includes(q) ||
              item.goodsItems?.toLowerCase().includes(q) ||
              item.latestProgress?.toLowerCase().includes(q);
            if (!match) return false;
          }
          return true;
        });

        // 状态徽章渲染
        const renderStatusBadge = (status: string) => {
          switch (status) {
            case 'PENDING_APPLY':
            case '待申请':
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>待申请</span>
                </span>
              );
            case 'APPLYING':
            case '申请中':
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>申请中</span>
                </span>
              );
            case 'EXAMINING':
            case '审查中':
            case '实质审查中':
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>审查中</span>
                </span>
              );
            case 'REGISTERED':
            case '已注册':
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>已注册</span>
                </span>
              );
            case 'PENDING_REPLY':
            case '待答复':
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>待答复</span>
                </span>
              );
            case 'INVALID':
            case '已失效':
            case '驳回':
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>已失效</span>
                </span>
              );
            default:
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                  {status}
                </span>
              );
          }
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full h-full max-w-[98vw] max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
              
              {/* Modal Header - 浅色简约协调设计 */}
              <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                    {selectedMarket.flag}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold font-sans text-slate-900">
                        {selectedMarket.name} ({selectedMarket.nameEn}) · 商标资产台账
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        共 {countryCases.length} 件商标
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3 flex-wrap">
                      <span>主管局：{selectedMarket.authority}</span>
                      <span>•</span>
                      <span>协同律所：{selectedMarket.lawFirm}</span>
                      <span>•</span>
                      <span>保护区域：{selectedMarket.name}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsCountryLedgerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="关闭"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Filter Toolbar (状态Tab切换 + 搜索框，完全对齐案件管理风格) */}
              <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
                
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {statusTabs.map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setLedgerStatusTab(tab.key)}
                      className={'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ' + (
                        ledgerStatusTab === tab.key
                          ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                      )}
                    >
                      <span>{tab.label}</span>
                      <span className={'px-1.5 py-0.2 rounded-full text-[10px] ' + (
                        ledgerStatusTab === tab.key ? 'bg-blue-700/80 text-white' : 'bg-slate-200 text-slate-600'
                      )}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <div className="relative min-w-[260px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜索案件编号、商标名称、品牌、类别..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

              </div>

              {/* Modal Table Content (可滚动台账列表，表头与数据跟案件管理列表一致，不显示操作列) */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="overflow-x-auto border border-slate-200/90 rounded-xl shadow-2xs bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold select-none">
                        <th className="py-3 px-3.5 w-12 text-center">序号</th>
                        <th className="py-3 px-3.5 min-w-[140px]">案件编号 / 建案编码</th>
                        <th className="py-3 px-3.5 min-w-[180px]">商标图样 / 商标名称</th>
                        <th className="py-3 px-3.5 min-w-[120px]">品牌</th>
                        <th className="py-3 px-3.5 min-w-[110px]">类别</th>
                        <th className="py-3 px-3.5 min-w-[120px]">申请地区 / 申请国家</th>
                        <th className="py-3 px-3.5 min-w-[90px]">案件状态</th>
                        <th className="py-3 px-3.5 min-w-[130px]">官方申请号 / 日期</th>
                        <th className="py-3 px-3.5 min-w-[130px]">官方注册号 / 日期</th>
                        <th className="py-3 px-3.5 min-w-[150px]">代理机构</th>
                        <th className="py-3 px-3.5 min-w-[140px]">最新进度</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredCountryCases.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-16 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Folder className="w-8 h-8 text-slate-300" />
                              <p className="text-sm font-medium text-slate-500">未查询到符合条件的商标档案案件</p>
                              <p className="text-xs text-slate-400">请尝试更换状态选项卡或搜索条件</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCountryCases.map((item, idx) => (
                          <tr 
                            key={item.id || `country-tm-${idx}`} 
                            className="hover:bg-blue-50/40 transition-colors group"
                          >
                            {/* 序号 */}
                            <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>

                            {/* 案件编号 / 建案编码 */}
                            <td className="py-3 px-3.5">
                              <div className="space-y-0.5">
                                <span className="font-mono font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block">
                                  {item.caseNo}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono block">
                                  {item.proposalNo || '-'}
                                </span>
                              </div>
                            </td>

                            {/* 商标图样 / 商标名称 */}
                            <td className="py-3 px-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 font-bold text-[11px] text-blue-600">
                                  {item.trademarkName?.slice(0, 2) || 'TM'}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-semibold text-slate-900 block truncate group-hover:text-blue-600 transition-colors">
                                    {item.trademarkName}
                                  </span>
                                  <span className="text-[11px] text-slate-400 truncate block">
                                    {item.trademarkForm || '文字商标'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* 品牌 (纯文字展示) */}
                            <td className="py-3 px-3.5">
                              <span className="text-slate-900 text-xs font-medium">
                                {item.brand || 'usmile 笑容加'}
                              </span>
                            </td>

                            {/* 类别 */}
                            <td className="py-3 px-3.5">
                              <span className="font-mono text-xs text-slate-700 font-medium">
                                {item.classes || '-'}
                              </span>
                            </td>

                            {/* 申请地区 / 申请国家 */}
                            <td className="py-3 px-3.5">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 text-slate-900 font-medium text-xs">
                                  <Globe2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  <span>{item.country || item.jurisdiction || selectedMarket.name}</span>
                                </div>
                                <span className="text-[11px] text-slate-400 pl-5">
                                  {item.region || getRegionByCountry(item.country || item.jurisdiction || selectedMarket.name)}
                                </span>
                              </div>
                            </td>

                            {/* 案件状态 */}
                            <td className="py-3 px-3.5">
                              {renderStatusBadge(item.status)}
                            </td>

                            {/* 官方申请号 / 日期 */}
                            <td className="py-3 px-3.5">
                              <div className="space-y-0.5 font-mono">
                                <div className="text-xs text-slate-900 font-medium">{item.applicationNo || '-'}</div>
                                <div className="text-[11px] text-slate-400">{item.applyDate || '-'}</div>
                              </div>
                            </td>

                            {/* 官方注册号 / 日期 */}
                            <td className="py-3 px-3.5">
                              <div className="space-y-0.5 font-mono">
                                <div className="text-xs text-emerald-700 font-medium">{item.registrationNo || '-'}</div>
                                <div className="text-[11px] text-slate-400">{item.registrationDate || '-'}</div>
                              </div>
                            </td>

                            {/* 代理机构 */}
                            <td className="py-3 px-3.5">
                              <span className="text-xs text-slate-700 truncate block max-w-[150px]" title={item.agencyName || selectedMarket.lawFirm}>
                                {item.agencyName || selectedMarket.lawFirm}
                              </span>
                            </td>

                            {/* 最新进度 */}
                            <td className="py-3 px-3.5">
                              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span className="truncate max-w-[140px]" title={item.latestProgress || '正常流程推进中'}>
                                  {item.latestProgress || '正常流程推进中'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>共展示 {filteredCountryCases.length} 条【{selectedMarket.name}】商标台账数据</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCountryLedgerOpen(false)}
                    className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    关闭
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
