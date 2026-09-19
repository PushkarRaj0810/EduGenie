import {
  ArrowRight,
  Brain,
  User,
  Mail,
  LockKeyhole,
  Check,
  X,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==============================
  // PASSWORD VALIDATION
  // ==============================

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>\_\-+=/\\[\];'`~]/.test(password),
  };

  const isStrongPassword =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.special;

  const getPasswordMessage = () => {
    if (!password) {
      return "Password is required.";
    }

    if (!passwordRules.length) {
      return "Password is too weak. It must contain at least 8 characters.";
    }

    if (!passwordRules.uppercase) {
      return "Password is too weak. Add at least one uppercase letter (A-Z).";
    }

    if (!passwordRules.lowercase) {
      return "Password is too weak. Add at least one lowercase letter (a-z).";
    }

    if (!passwordRules.number) {
      return "Password is too weak. Add at least one number (0-9).";
    }

    if (!passwordRules.special) {
      return "Password is too weak. Add at least one special character (!@#$%^&*).";
    }

    return "";
  };

  // ==============================
  // SIGNUP
  // ==============================

  const handleSignup = async (event) => {
    event.preventDefault();

    setMessage("");

    // Basic validation
    if (!name.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    // Password validation before backend request
    const passwordError = getPasswordMessage();

    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://edugenie-73vn.onrender.com/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Save logged-in user
        localStorage.setItem("user", JSON.stringify(data.user));

        // Move to Dashboard
        navigate("/dashboard");
      } else {
        // Show the actual backend reason
        setMessage(
          data.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to backend. Please make sure the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400">
          <Brain size={22} />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Start your personalized learning journey.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={handleSignup}
      >
        <Input
          icon={<User size={16} />}
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setMessage("");
          }}
        />

        <Input
          icon={<Mail size={16} />}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setMessage("");
          }}
        />

        <div>
          <Input
            icon={<LockKeyhole size={16} />}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setMessage("");
            }}
          />

          {/* Password requirements */}

          {password.length > 0 && (
            <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="mb-2 text-[11px] font-medium text-slate-500">
                Password requirements
              </p>

              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                <PasswordRule
                  valid={passwordRules.length}
                  text="At least 8 characters"
                />

                <PasswordRule
                  valid={passwordRules.uppercase}
                  text="One uppercase letter"
                />

                <PasswordRule
                  valid={passwordRules.lowercase}
                  text="One lowercase letter"
                />

                <PasswordRule
                  valid={passwordRules.number}
                  text="One number"
                />

                <PasswordRule
                  valid={passwordRules.special}
                  text="One special character"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !isStrongPassword}
          className="button-shine flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? "Creating account..." : "Create account"}

          {!loading && <ArrowRight size={16} />}
        </button>

        {message && (
          <p
            className={`text-center text-sm ${
              message.includes("successfully")
                ? "text-emerald-400"
                : "text-red-300"
            }`}
          >
            {message}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-xs text-slate-600">
        Already have an account?{" "}

        <Link
          to="/login"
          className="font-semibold text-violet-400 hover:text-violet-300"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

// ==============================
// PASSWORD RULE COMPONENT
// ==============================

function PasswordRule({ valid, text }) {
  return (
    <div
      className={`flex items-center gap-2 text-[11px] ${
        valid ? "text-emerald-400" : "text-slate-600"
      }`}
    >
      {valid ? (
        <Check size={13} />
      ) : (
        <X size={13} />
      )}

      {text}
    </div>
  );
}

// ==============================
// INPUT
// ==============================

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

// ==============================
// AUTH LAYOUT
// ==============================

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