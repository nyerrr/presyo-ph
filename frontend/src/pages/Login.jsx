import { useState } from "react";
import { supabase } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Check your email to confirm your account!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'linear-gradient(160deg, #1a56a0 0%, #0f3d7a 100%)'
    }}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌾</div>
          <div className="font-bold text-xl text-slate-900">PresyOn</div>
          <div className="text-xs text-slate-400 mt-1">Mga presyo ngayon sa Pilipinas</div>
        </div>

        {/* Toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer
              ${!isSignUp ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
          >
            Mag-login
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer
              ${isSignUp ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
          >
            Mag-sign up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            className="w-full border border-slate-200 rounded-xl p-3 mb-3 text-sm focus:outline-none focus:border-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-slate-200 rounded-xl p-3 mb-4 text-sm focus:outline-none focus:border-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold cursor-pointer disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1a56a0, #0f3d7a)' }}
          >
            {loading ? 'Loading...' : isSignUp ? 'Gumawa ng account' : 'Mag-login'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-xs text-slate-500">{message}</p>
        )}

        <p className="mt-4 text-center text-xs text-slate-400">
          {isSignUp ? 'May account na?' : 'Wala pang account?'}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
            className="text-blue-600 font-medium cursor-pointer"
          >
            {isSignUp ? 'Mag-login' : 'Mag-sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}