import { Outlet } from 'react-router-dom'
import { Users, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        {/* Animated decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-fuchsia-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="max-w-lg text-center relative z-10">
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="bg-white/20 backdrop-blur-xl p-5 rounded-3xl shadow-2xl shadow-purple-900/50 border border-white/20">
              <Users size={48} />
            </div>
            <h1 className="text-5xl font-bold">Chama Pamoja</h1>
            <Sparkles className="text-amber-300 animate-pulse" size={28} />
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Manage Your Group Finances <span className="text-amber-300">Effortlessly</span>
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            A complete solution for savings groups, investment clubs, and chamas. 
            Track contributions, manage loans, schedule meetings, and generate 
            reports all in one place.
          </p>
          
          {/* Feature highlights */}
          <div className="mt-10 flex justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <TrendingUp size={24} />
              </div>
              <span className="text-sm text-white/80">Track Growth</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Shield size={24} />
              </div>
              <span className="text-sm text-white/80">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Zap size={24} />
              </div>
              <span className="text-sm text-white/80">Fast</span>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-5 text-left">
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 hover:bg-white/15 transition-colors">
              <div className="text-4xl font-bold text-amber-300">10K+</div>
              <div className="text-white/70 text-sm mt-1">Active Groups</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 hover:bg-white/15 transition-colors">
              <div className="text-4xl font-bold text-emerald-300">KES 5B+</div>
              <div className="text-white/70 text-sm mt-1">Managed Funds</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 hover:bg-white/15 transition-colors">
              <div className="text-4xl font-bold text-cyan-300">100K+</div>
              <div className="text-white/70 text-sm mt-1">Members</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 hover:bg-white/15 transition-colors">
              <div className="text-4xl font-bold text-pink-300">99.9%</div>
              <div className="text-white/70 text-sm mt-1">Uptime</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8 text-white">
            <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-lg">
              <Users size={32} />
            </div>
            <h1 className="text-3xl font-bold">Chama Pamoja</h1>
            <Sparkles className="text-amber-300" size={20} />
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  )
}
