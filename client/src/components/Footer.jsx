import React from 'react';
import { Heart, GraduationCap, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-badge-item">
            <GraduationCap size={16} />
            <span>B.Tech CSE Project &bull; Image to PDF Converter</span>
          </div>
          <div className="footer-badge-item">
            <ShieldCheck size={16} />
            <span>Client-Side Processing (Private & Secure)</span>
          </div>
          <div className="footer-badge-item">
            <Zap size={16} />
            <span>Powered by jsPDF & Supabase</span>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copy">
            Built with React, Vite, Node.js, Express & Supabase PostgreSQL
          </p>
          <div className="footer-tags">
            <span className="tag">React</span>
            <span className="tag">Vite</span>
            <span className="tag">Node.js</span>
            <span className="tag">Express</span>
            <span className="tag">Supabase</span>
            <span className="tag">jsPDF</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

