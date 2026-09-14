import {
  ArrowRight,
  Brain,
  Mail,
  LockKeyhole,
} from "lucide-react";

import { Link,useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        navigate("/dashboard");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to backend.");
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400">
          <Brain size={22} />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Continue your personalized learning journey.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={handleLogin}
      >
        <Input
          icon={<Mail size={16} />}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <Input
          icon={<LockKeyhole size={16} />}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button
          type="submit"
          className="button-shine flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5"
        >
          Sign in
          <ArrowRight size={16} />
        </button>

        {message && (
          <p className="text-center text-sm text-violet-300">
            {message}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-xs text-slate-600">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-violet-400 hover:text-violet-300"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}

function Input({
  icon,
  ...props
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
      <span className="text-slate-600">
        {icon}
      </span>

      <input
        {...props}
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
      />
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 py-10">
      <div className="absolute inset-0 grid-background opacity-40" />

      <div className="glow-orb glow-orb-one" />
      <div className="glow-orb glow-orb-two" />

      <div className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-2xl shadow-violet-950/30">
          {children}
        </div>

        <div className="mt-6 text-center text-[10px] text-slate-700">
          EduGenie · Intelligent personalized learning
        </div>
      </div>
    </main>
  );
}