'use client';

import Link from "next/link";
import s from "./Footer.module.css";
import { useAuth } from "@/contexts/AuthContext";

export default function Footer() {
  const { user, isAuthenticated, logout } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className={s.footer}>
      <div className={`container ${s.footerInner}`}>
        <Link href="/" className={s.footerLogo}>
          MyGiftList
        </Link>
        <p className={s.footerCopy}>© {year} MyGiftList. Made with care.</p>
        <div className={s.footerLinks}>
          {isAuthenticated ? (
            <></>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
