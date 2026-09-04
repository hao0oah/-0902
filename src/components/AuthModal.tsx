import React, { useState } from 'react';
import { 
  Smile, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Sparkles,
  ExternalLink,
  Lock,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  currentUser: UserProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  const [phone, setPhone] = useState('13800138000');
  const [code, setCode] = useState('888888');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length !== 11) {
      setErrorMsg('请输入正确的 11 位大陆手机号码');
      return;
    }
    if (code !== '888888') {
      setErrorMsg('演示环境默认验证码为 888888');
      return;
    }

    onLoginSuccess({
      id: 'usr_usmile_01',
      name: '林悦 (Joy Lin)',
      title: '全球知识产权高级法务专家',
      department: '集团法务与知识产权部',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: phone,
      role: 'IP_ADMIN',
      feishuLinked: true,
    });
    onClose();
  };

  const handleFeishuLogin = () => {
    onLoginSuccess({
      id: 'usr_usmile_feishu',
      name: '徐明哲 (Legal VP)',
      title: '集团法务总监 & IP 负责人',
      department: '集团法务与合规管理中心',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '13988886666',
      role: 'LEGAL_DIRECTOR',
      feishuLinked: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 relative overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
            <Smile className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h3 className="text-xl font-black text-slate-900 font-display tracking-tight">
            登录 usmile 商标协同管理系统
          </h3>
          <p className="text-xs text-slate-500">
            企业级统一身份鉴权与飞书组织架构联动
          </p>
        </div>

        {/* Feishu Fast SSO Button */}
        <button
          type="button"
          onClick={handleFeishuLogin}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all hover:scale-101 mb-4"
        >
          <UserCheck className="w-4 h-4" />
          <span>飞书快捷免密登录 (总监身份演示)</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-medium">或使用手机验证码</span>
          </div>
        </div>

        {/* Phone Form */}
        <form onSubmit={handlePhoneLogin} className="space-y-3.5 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-semibold text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">手机号码</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="任意 11 位大陆手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-bold text-slate-700 mb-1">
              <span>短信验证码</span>
              <span className="text-[11px] text-blue-600 font-normal">默认测试码: 888888</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="输入 888888"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 transition-all"
          >
            立即登录验证
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400 mt-4">
          受星际悦动知识产权保密协议保护 · 内部专用系统
        </p>
      </div>
    </div>
  );
};
