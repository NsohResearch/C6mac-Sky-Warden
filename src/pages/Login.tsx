import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import logoMark from "@/assets/logo-mark.png";
import heroAirspace from "@/assets/hero-airspace.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-reveal-up">
          <div className="flex items-center gap-3 mb-8">
            <img src={logoMark} alt="C6macEye" className="w-10 h-10" />
            <span className="text-xl font-semibold tracking-tight text-foreground">C6macEye</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground leading-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 mb-6">
            Sign in to access your flight operations
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pilot@c6maceye.com"
                className="w-full h-10 rounded-md bg-background border border-input px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 focus:border-accent transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 rounded-md bg-background border border-input px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 focus:border-accent transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-md bg-accent text-accent-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98] shadow-card"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            FAA-approved airspace management platform
          </p>
        </div>
      </div>

      {/* Right — hero image */}
      <div className="hidden lg:block lg:w-[55%] relative">
        <img src={heroAirspace} alt="Drone airspace" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        <div className="absolute bottom-8 right-8 max-w-xs">
          <p className="text-xs font-medium text-primary-foreground/90 bg-primary/60 backdrop-blur-sm rounded-lg px-4 py-3 leading-relaxed">
            Connecting local drone rules to national air traffic management. One platform for individual pilots, public safety, and the enterprise.
          </p>
        </div>
      </div>
    </div>
  );
}
