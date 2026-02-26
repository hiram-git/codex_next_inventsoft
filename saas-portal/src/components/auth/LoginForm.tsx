"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { gsap } from "gsap";
import { Eye, EyeOff, Loader2, LogIn, Zap } from "lucide-react";

const schema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Refs for GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // ── Entrance animation ───────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        containerRef.current,
        { opacity: 0, y: 60, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 }
      )
        .fromTo(
          logoRef.current,
          { opacity: 0, rotate: -180, scale: 0 },
          { opacity: 1, rotate: 0, scale: 1, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          [titleRef.current, subtitleRef.current],
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          "-=0.3"
        )
        .fromTo(
          formRef.current?.querySelectorAll(".form-field") ?? [],
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.1 },
          "-=0.2"
        )
        .fromTo(
          btnRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
          "-=0.1"
        );
    });

    return () => ctx.revert();
  }, []);

  // ── Button hover effect ──────────────────────────────────────────────────
  const handleBtnHover = () => {
    gsap.to(btnRef.current, {
      scale: 1.03,
      boxShadow: "0 0 24px rgba(99,102,241,0.6)",
      duration: 0.25,
      ease: "power2.out",
    });
  };
  const handleBtnLeave = () => {
    gsap.to(btnRef.current, {
      scale: 1,
      boxShadow: "0 0 0px rgba(99,102,241,0)",
      duration: 0.25,
      ease: "power2.inOut",
    });
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    setError("");

    // Click animation
    gsap.to(btnRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut",
    });

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Credenciales inválidas. Verifica tu correo y contraseña.");
      gsap.fromTo(
        containerRef.current,
        { x: -10 },
        { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" }
      );
    } else {
      // Success animation before redirect
      gsap.to(containerRef.current, {
        scale: 1.02,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => router.push("/dashboard"),
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/60 rounded-2xl p-8 shadow-2xl"
      style={{ opacity: 0 }}
    >
      {/* Logo */}
      <div ref={logoRef} className="flex justify-center mb-6" style={{ opacity: 0 }}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Zap className="w-8 h-8 text-white" />
        </div>
      </div>

      <h1
        ref={titleRef}
        className="text-2xl font-bold text-white text-center mb-1"
        style={{ opacity: 0 }}
      >
        Bienvenido de vuelta
      </h1>
      <p
        ref={subtitleRef}
        className="text-gray-400 text-sm text-center mb-8"
        style={{ opacity: 0 }}
      >
        Accede a tu portal empresarial
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="form-field space-y-1.5" style={{ opacity: 0 }}>
          <label className="text-sm font-medium text-gray-300">Correo electrónico</label>
          <input
            {...register("email")}
            type="email"
            placeholder="admin@empresa.com"
            className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
              transition-all duration-200 hover:border-gray-600"
          />
          {errors.email && (
            <p className="text-red-400 text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="form-field space-y-1.5" style={{ opacity: 0 }}>
          <label className="text-sm font-medium text-gray-300">Contraseña</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-500 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                transition-all duration-200 hover:border-gray-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          ref={btnRef}
          type="submit"
          disabled={isSubmitting}
          onMouseEnter={handleBtnHover}
          onMouseLeave={handleBtnLeave}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm
            bg-gradient-to-r from-indigo-600 to-violet-600
            hover:from-indigo-500 hover:to-violet-500
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
            transition-colors duration-200 mt-2"
          style={{ opacity: 0 }}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-600 mt-6">
        SaaS Portal © {new Date().getFullYear()}
      </p>
    </div>
  );
}
