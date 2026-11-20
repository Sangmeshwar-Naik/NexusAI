"use client";
import Link from "next/link";
import { Command } from "lucide-react";
export default function AuthFrame({children,title,subtitle}:{children:React.ReactNode,title:string,subtitle:string}){return <main className="auth-page"><div className="auth-decoration auth-decoration-one"/><div className="auth-decoration auth-decoration-two"/><Link href="/" className="brand auth-brand"><span className="brand-mark"><Command size={19}/></span>Nexus<span className="brand-light">AI</span></Link><section className="auth-card"><div className="auth-symbol"><Command size={22}/></div><span className="section-kicker">YOUR KNOWLEDGE, CONNECTED</span><h1>{title}</h1><p>{subtitle}</p>{children}</section><div className="auth-foot">Protected workspace · Secure access</div></main>}
