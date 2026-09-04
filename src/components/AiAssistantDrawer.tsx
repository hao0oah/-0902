import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  CheckCircle2, 
  Flame, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: '您好！我是 usmile 知识产权专属 AI 法务助理。我可以为您提供【全球商标近似查重】、【尼斯分类选品推荐】、【异议抗辩理由起草】及【十年续展决策评估】。请问今天有什么可以协助您？',
      time: '刚刚',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    '帮我起草一份针对恶意抢注“u-smile”的商标异议理由书要点',
    '为新品“微气泡冲牙器”推荐第21类与第10类的最佳保护商品项',
    '分析商标届满十年续展与重新申请的利弊与风险对比',
    '如何主张 usmile 在第21类电动牙刷上的驰名商标跨类保护？',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg = {
      role: 'user' as const,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      if (text.includes('异议') || text.includes('u-smile')) {
        reply = `【AI 商标异议理由书要点建议】\n\n一、事实与法条依据：\n1. 依据《商标法》第三十条：被异议商标与我司在先注册的核心第42881903号“usmile”商标在发音、字母组合上高度近似，构成使用在相同或类似商品（电动牙刷、冲牙器）上的近似商标。\n2. 依据《商标法》第十三条第三款（驰名商标保护）：提供连续四年天猫/京东电动牙刷品类销量第一的审计销售额及上亿级品牌广告投入公证书，主张跨类与绝对排他权。\n3. 依据《商标法》第七条及第四十四条：被异议人具有明显搭便车与傍名牌恶意。\n\n二、行动建议：\n建议在剩余 18 天异议黄金期内，由北京市柳沈律师事务所加急递交初步异议申请，并在3个月补充证据期内提交经公证的知名度材料。`;
      } else if (text.includes('推荐') || text.includes('冲牙器') || text.includes('商品项')) {
        reply = `【AI 精选商品项与尼斯分类推荐】\n\n针对【微气泡冲牙器】新品，建议锁定以下群组：\n\n1. 第21类 (核心必备):\n- 2106群组: 冲牙器、洁齿用水喷射器具、洁牙器具、牙线\n- 2108群组: 电动牙刷、牙刷刷头、电动口腔清洁器\n\n2. 第10类 (专业医疗背书):\n- 1004群组: 医用洁牙机、牙科设备及仪器、牙齿正畸矫正清洗器\n\n3. 第09类 (智能防线):\n- 0901群组: 智能牙刷内置感应软件、口腔健康监测应用程序`;
      } else {
        reply = `【AI 法务综合建议】\n针对您提出的咨询：“${text}”：\n\n1. 法律风险层级：属于中高频关键确权/维权节点，建议在《商标法》及国际条约框架下提前6个月完成法域布局。\n2. 集团策略协同：建议同步通知品牌中心与海外跨境业务部，锁定中美欧日东南亚多国优先权。\n3. 代理机构协同：可直接在系统【审批中心】发起立项流程，自动流转至徐总与财务部门批复。`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold font-display">usmile AI 法务助手</h3>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-semibold">Gemini IP Pro</span>
              </div>
              <p className="text-[11px] text-blue-100">7×24h 智能商标风险与法务咨询</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                }`}
              >
                {msg.text}
                <span
                  className={`block text-[9px] mt-1.5 text-right font-mono ${
                    msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5 items-center text-slate-400 text-xs">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <span className="bg-slate-100 px-3 py-2 rounded-2xl animate-pulse">
                AI 正在检索全球商标法律库与证据链...
              </span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 block mb-1.5">智能快捷指令</span>
          <div className="space-y-1 overflow-x-auto max-h-24">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="w-full text-left text-[11px] text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 p-1.5 rounded-lg truncate block transition-colors"
              >
                💡 {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
          <input
            type="text"
            placeholder="向 AI 法务咨询商标法规/证据链/选品..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputVal.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all shadow-md shadow-blue-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
