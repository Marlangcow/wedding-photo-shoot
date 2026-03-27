"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`relative z-40 transition-all duration-500 ${isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm"
          : "bg-white border-transparent"
          }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center group">
            <span className="font-serif text-[12px] sm:text-base tracking-wide text-foreground">
              2026. 4. 4. 경지와 나은이의 결혼식 갤러리
            </span>
          </Link>
        </div>
      </header>
      <Link
        href="/admin"
        className="fixed bottom-4 left-4 z-50 text-[11px] font-sans font-medium text-neutral-300 hover:text-neutral-500 transition-colors"
      >
        Admin
      </Link>
    </>
  );
}
