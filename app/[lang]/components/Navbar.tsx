"use client";

import { Dictionary } from "@/dictionaries";
import { Locale } from "@/i18n-config";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/assets/logo.png";
import TranslateIcon from "@/public/icons/translate.svg";
import { useAuthStore } from "@/auth.store";
import { useRouter } from "next/navigation";

interface NavbarProps {
  dict: Dictionary;
  params: { lang: Locale };
}

export function Navbar({ dict, params }: NavbarProps) {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={`/${params.lang}`}>
              <Image
                src={Logo}
                alt="IMS Logo"
                width={58}
                height={38}
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-2 cursor-pointer"
                title={dict.navbar.logout}
              >
                {dict.navbar.logout}
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-4">
              <Link
                href={params.lang === "en" ? "/ar" : "/en"}
                className="flex items-center gap-2"
                style={{
                  fontFamily:
                    params.lang === "ar"
                      ? "Arial, sans-serif"
                      : "Almarai, sans-serif",
                }}
              >
                {params.lang === "en" ? (
                  <>
                    <Image
                      src={TranslateIcon}
                      alt="Translate"
                      width={24}
                      height={24}
                      className="size-5"
                    />{" "}
                    العربية
                  </>
                ) : (
                  <>
                    English{" "}
                    <Image
                      src={TranslateIcon}
                      alt="Translate"
                      width={24}
                      height={24}
                      className="size-5"
                    />
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
