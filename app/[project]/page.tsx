"use client";

import { useEffect, useRef, useState } from 'react';
import { 
  Home, Building2, Hospital, GraduationCap, 
  Film, UtensilsCrossed, Flag, Trees, 
  Fence, Cctv, ShieldCheck, FireExtinguisher,
  Phone, Mail, MapPin, Settings2
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

const IconMap: Record<string, any> = {
  Home, Building2, Hospital, GraduationCap, 
  Film, UtensilsCrossed, Flag, Trees, 
  Fence, Cctv, ShieldCheck, FireExtinguisher,
  Phone, Mail, MapPin, Settings2
};

gsap.registerPlugin(ScrollToPlugin);

export default function ProjectPage() {
  const params = useParams();
  const slug = params?.project as string || 'multan';
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'glossy'>('light');
  const [accentColor, setAccentColor] = useState<string>('var(--gold-light)'); // Default to Gold
  const [ambientGlow, setAmbientGlow] = useState(false);
  const [navFontSize, setNavFontSize] = useState('80%');

  // Dynamic Content State
  const [activePlanTab, setActivePlanTab] = useState<string>('All');
  const [activeGalleryTab, setActiveGalleryTab] = useState<string>('All');
  const [lightboxData, setLightboxData] = useState<{ images: string[], currentIndex: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const [dynamicContent, setDynamicContent] = useState<any>({
    heroTitle: 'A Vision of Luxury',
    heroDescription: 'Experience unparalleled living in the heart of Multan. Where modern architecture meets serene landscapes.',
    heroImageUrl: '/mul.jpeg'
  });

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllProjects(data);
      })
      .catch(err => console.error(err));

    if (slug) {
      fetch(`/api/projects/${slug}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.heroTitle) setDynamicContent(data);
        })
        .catch(err => console.error("Error loading dynamic content:", err));
    }
  }, [slug]);

  const accentColors = [
    { name: 'Gold', value: 'var(--gold-light)', text: '#4a3615' },
    { name: 'Green', value: '#bbf7d0', text: '#14532d' },
    { name: 'Blue', value: '#e0f2fe', text: '#0369a1' },
    { name: 'Purple', value: '#e9d5ff', text: '#581c87' },
    { name: 'Pink', value: '#ffd6df', text: '#831843' },
    { name: 'Orange', value: '#ffedd5', text: '#9a3412' }
  ];

  // Dynamic Theme Generation based on state
  const getThemeStyles = () => {
    let bg, border, text, textHover, pillText, btnBorder, btnText;
    
    const currentAccent = accentColors.find(c => c.value === accentColor) || accentColors[0];

    if (themeMode === 'dark') {
      bg = 'rgba(14, 25, 35, 0.85)';
      border = 'rgba(255, 255, 255, 0.1)';
      text = 'rgba(255, 255, 255, 0.7)';
      textHover = 'white';
      btnBorder = 'rgba(255, 255, 255, 0.2)';
      btnText = 'white';
    } else if (themeMode === 'light') {
      bg = 'rgba(255, 255, 255, 0.9)';
      border = 'rgba(0, 0, 0, 0.1)';
      text = 'rgba(0, 0, 0, 0.6)';
      textHover = 'black';
      btnBorder = currentAccent.text;
      btnText = currentAccent.text;
    } else { // glossy
      bg = 'rgba(255, 255, 255, 0.2)';
      border = 'rgba(255, 255, 255, 0.4)';
      text = 'rgba(0, 0, 0, 0.7)';
      textHover = 'black';
      btnBorder = 'rgba(0, 0, 0, 0.4)';
      btnText = 'rgba(0, 0, 0, 0.8)';
    }

    return {
      '--theme-nav-bg': bg,
      '--theme-nav-border': border,
      '--theme-nav-text': text,
      '--theme-nav-text-hover': textHover,
      '--theme-pill-bg': currentAccent.value,
      '--theme-pill-text': currentAccent.text,
      '--theme-btn-border': btnBorder,
      '--theme-btn-text': btnText,
      '--theme-btn-bg': 'transparent',
      '--theme-glow': ambientGlow ? `0 0 40px ${currentAccent.value}40` : '0 10px 30px rgba(0,0,0,0.3)',
      '--theme-nav-font': navFontSize
    };
  };

  useEffect(() => {
    // Basic entry animation for sections
    const sections = gsap.utils.toArray('.multan-page section, .multan-page footer');
    gsap.fromTo(
      sections,
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 1, 
        stagger: 0.2, 
        ease: 'power3.out',
        delay: 0.2
      }
    );

    // Track active section on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 });

    const targetSections = document.querySelectorAll('.multan-page section[id], .multan-page footer[id]');
    targetSections.forEach(sec => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setActiveSection(targetId.replace('#', ''));
    gsap.to(window, {
      duration: 1.5,
      scrollTo: { y: targetId, offsetY: 80 },
      ease: 'power3.inOut'
    });
  };

  const handlePrevImage = (e: any) => {
    e.stopPropagation();
    if (lightboxData) {
      setLightboxData({
        ...lightboxData,
        currentIndex: lightboxData.currentIndex === 0 ? lightboxData.images.length - 1 : lightboxData.currentIndex - 1
      });
      setZoomLevel(1);
    }
  };

  const handleNextImage = (e: any) => {
    e.stopPropagation();
    if (lightboxData) {
      setLightboxData({
        ...lightboxData,
        currentIndex: lightboxData.currentIndex === lightboxData.images.length - 1 ? 0 : lightboxData.currentIndex + 1
      });
      setZoomLevel(1);
    }
  };

  const masterPlans = dynamicContent.sectionsData?.masterPlans || [];
  const planCategories = ['All', ...masterPlans.map((p: any) => p.title)];
  let displayPlans: any[] = [];
  if (activePlanTab === 'All') {
    masterPlans.forEach((plan: any) => {
      const images = plan.images ? plan.images : (plan.image ? [{ image: plan.image }] : []);
      images.forEach((img: any) => {
        if (img.image) displayPlans.push({ ...img, planTitle: plan.title });
      });
    });
  } else {
    const selectedPlan = masterPlans.find((p: any) => p.title === activePlanTab);
    if (selectedPlan) {
      const images = selectedPlan.images ? selectedPlan.images : (selectedPlan.image ? [{ image: selectedPlan.image }] : []);
      images.forEach((img: any) => {
        if (img.image) displayPlans.push({ ...img, planTitle: selectedPlan.title });
      });
    }
  }

  const gallerySections = dynamicContent.sectionsData?.gallery || [];
  const galleryCategories = ['All', ...gallerySections.map((g: any) => g.title !== undefined ? g.title : 'General').filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)];
  let displayGallery: any[] = [];
  if (activeGalleryTab === 'All') {
    gallerySections.forEach((section: any) => {
      const sectionTitle = section.title !== undefined ? section.title : 'General';
      const images = section.images ? section.images : (section.image ? [{ image: section.image }] : []);
      images.forEach((img: any) => {
        if (img.image) displayGallery.push({ ...img, sectionTitle });
      });
    });
  } else {
    gallerySections.forEach((section: any) => {
      const sectionTitle = section.title !== undefined ? section.title : 'General';
      if (sectionTitle === activeGalleryTab) {
        const images = section.images ? section.images : (section.image ? [{ image: section.image }] : []);
        images.forEach((img: any) => {
          if (img.image) displayGallery.push({ ...img, sectionTitle });
        });
      }
    });
  }

  return (
    <div className="multan-page" ref={containerRef}>
      {lightboxData && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column' }}
        >
          {/* Top Bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px', display: 'flex', justifyContent: 'flex-end', zIndex: 20, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)', pointerEvents: 'none' }}>
            <button style={{ color: '#fff', background: 'transparent', border: 'none', fontSize: '2rem', cursor: 'pointer', lineHeight: 1, pointerEvents: 'auto', opacity: 0.8 }} onClick={() => setLightboxData(null)}>&times;</button>
          </div>
          
          {/* Main Area */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setLightboxData(null)}>
            
            {/* Left Arrow */}
            {lightboxData.images.length > 1 && (
              <button 
                onClick={handlePrevImage}
                style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none', fontSize: '2rem', cursor: 'pointer', zIndex: 20, padding: '15px 20px', borderRadius: '8px', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
              >
                &#10094;
              </button>
            )}

            {/* Image Container for Zoom/Pan */}
            <div style={{ width: '100%', height: '100%', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: zoomLevel === 1 ? 'center' : 'flex-start' }}>
              <img 
                src={lightboxData.images[lightboxData.currentIndex]} 
                alt="Expanded view"
                style={{ 
                  maxWidth: zoomLevel === 1 ? '90vw' : 'none', 
                  maxHeight: zoomLevel === 1 ? '90vh' : 'none', 
                  objectFit: 'contain', 
                  cursor: zoomLevel === 1 ? 'zoom-in' : 'zoom-out',
                  transition: 'max-width 0.3s ease, max-height 0.3s ease'
                }} 
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel(z => z === 1 ? 2.5 : 1);
                }}
              />
            </div>

            {/* Right Arrow */}
            {lightboxData.images.length > 1 && (
              <button 
                onClick={handleNextImage}
                style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none', fontSize: '2rem', cursor: 'pointer', zIndex: 20, padding: '15px 20px', borderRadius: '8px', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
              >
                &#10095;
              </button>
            )}
          </div>
          
          {/* Bottom Counter */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '15px', textAlign: 'center', color: '#ccc', fontSize: '0.9rem', zIndex: 20, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', pointerEvents: 'none' }}>
            {lightboxData.currentIndex + 1} of {lightboxData.images.length}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --gold: #bfa57b;
          --gold-light: #d1b993;
          --dark-blue: #0b2241;
          --bg-offwhite: #F8F6F0;
        }

        body {
          margin: 0;
          font-family: system-ui, -apple-system, sans-serif;
          background: var(--bg-offwhite);
          color: #333;
          overflow-x: hidden;
        }

        /* Nav */
        .multan-nav-container {
          position: fixed;
          top: 24px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          z-index: 1000;
          padding: 0 20px;
          pointer-events: none;
        }

        .multan-nav {
          pointer-events: auto;
          display: flex;
          align-items: center;
          background: var(--theme-nav-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--theme-nav-border);
          border-radius: 9999px;
          padding: 6px 12px 6px 24px;
          gap: 12px;
          box-shadow: var(--theme-glow);
          max-width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
          transition: all 0.5s ease;
          font-size: var(--theme-nav-font);
        }
        .multan-nav::-webkit-scrollbar { display: none; }

        .multan-nav-logo {
          display: flex;
          align-items: center;
          padding-right: 16px;
          border-right: 1px solid var(--theme-nav-border);
          transition: border-color 0.3s ease;
        }
        .multan-nav-logo img {
          height: 28px;
        }

        .multan-nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .multan-nav-links a {
          text-decoration: none;
          color: var(--theme-nav-text);
          font-weight: 800;
          font-size: var(--nav-font-size, 80%);
          letter-spacing: 0.15em;
          padding: 8px 12px;
          border-radius: 4px;
          transition: all 0.3s ease;
          position: relative;
          cursor: pointer;
        }
        
        .projects-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--theme-nav-bg);
          border: 1px solid var(--theme-nav-border);
          border-radius: 8px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 150px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          z-index: 50;
        }

        .projects-dropdown.open {
          opacity: 1;
          visibility: visible;
          top: calc(100% + 10px);
        }

        .projects-dropdown a {
          padding: 8px 16px !important;
          border-radius: 4px !important;
          text-align: center;
        }

        .projects-dropdown a:hover {
          background: rgba(196, 134, 75, 0.1) !important;
        }
        
        .multan-nav-links a:hover {
          color: var(--theme-nav-text-hover);
          background: rgba(128, 128, 128, 0.1);
        }

        .multan-nav-links a.active {
          background: var(--theme-pill-bg);
          color: var(--theme-pill-text);
          font-weight: 600;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .nav-get-touch {
          padding: 8px 20px;
          border-radius: 30px;
          border: 1px solid var(--theme-btn-border);
          color: var(--theme-btn-text);
          text-decoration: none;
          font-size: 1em;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          white-space: nowrap;
          background: var(--theme-btn-bg);
          margin-left: 8px;
        }
        .nav-get-touch:hover {
          background: var(--theme-btn-text);
          color: var(--theme-nav-bg);
          border-color: var(--theme-btn-text);
        }

        .floating-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-left: 20px;
          pointer-events: none;
        }

        .theme-toggle-btn, .project-toggle-btn {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .theme-toggle-btn {
          background: var(--theme-nav-bg);
          border: 1px solid var(--theme-nav-border);
          color: var(--theme-nav-text);
        }

        .project-toggle-btn {
          background: var(--theme-pill-bg);
          border: 1px solid var(--theme-btn-border);
          color: var(--theme-pill-text);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .theme-toggle-btn:hover {
          transform: scale(1.05);
          color: var(--theme-pill-bg);
        }

        .project-toggle-btn:hover {
          transform: scale(1.05);
          box-shadow: var(--theme-glow);
        }
        
        .settings-panel {
          position: absolute;
          top: calc(100% + 15px);
          right: 20px;
          background: var(--theme-nav-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--theme-nav-border);
          border-radius: 16px;
          padding: 24px;
          width: 300px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          z-index: 1000;
          pointer-events: none;
        }

        .settings-panel.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
        }

        .settings-group {
          margin-bottom: 24px;
        }
        .settings-group:last-child {
          margin-bottom: 0;
        }
        .settings-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: rgba(0, 0, 0, 0.5);
          text-transform: uppercase;
          margin-bottom: 12px;
          display: block;
        }

        /* Toggle Buttons */
        .toggle-row {
          display: flex;
          gap: 8px;
        }
        .toggle-btn {
          flex: 1;
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
          color: rgba(0, 0, 0, 0.7);
          padding: 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-btn:hover {
          background: rgba(0, 0, 0, 0.1);
        }
        .toggle-btn.active {
          background: var(--theme-pill-bg);
          color: var(--theme-pill-text);
          border-color: var(--theme-pill-bg);
        }

        /* Color Circles */
        .color-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .color-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }
        .color-circle.active {
          border-color: white;
          transform: scale(1.1);
          box-shadow: 0 0 10px rgba(255,255,255,0.2);
        }

        .nav-icons {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: 12px;
        }
        .nav-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .nav-icon-btn:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }

        /* Hero */
        .hero {
          height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
          animation: slowZoom 5s infinite alternate ease-in-out;
        }
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(11,34,65,0.3) 0%, rgba(11,34,65,0.8) 100%);
          z-index: 1;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          animation: fadeUp 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero h1 {
          font-family: "Ogg Medium", serif;
          font-size: clamp(3rem, 8vw, 8rem);
          color: white;
          margin: 0;
          font-weight: 400;
          line-height: 1;
          letter-spacing: 2px;
        }
        .hero h2 {
          font-size: clamp(1.5rem, 3vw, 3rem);
          color: var(--gold);
          margin-top: 10px;
          font-weight: 300;
          letter-spacing: 8px;
          text-transform: uppercase;
        }

        /* Overview Split */
        .overview-section {
          padding: 120px 5vw;
          background: #fff;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }
        .overview-text h3 {
          font-family: "Ogg Medium", serif;
          font-size: 3rem;
          color: var(--dark-blue);
          margin-bottom: 30px;
          font-weight: 400;
        }
        .overview-text p {
          font-size: 1.15rem;
          line-height: 1.9;
          color: #555;
          margin-bottom: 24px;
        }
        .overview-text p:first-of-type::first-letter {
          float: left;
          font-size: 5rem;
          line-height: 0.8;
          padding-right: 12px;
          padding-top: 4px;
          color: var(--gold);
          font-family: "Ogg Medium", serif;
        }
        .overview-img-wrapper {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .overview-img-wrapper img {
          width: 100%;
          display: block;
          transition: transform 0.7s ease;
        }
        .overview-img-wrapper:hover img {
          transform: scale(1.05);
        }
        
        @media(max-width: 900px) {
          .overview-section { grid-template-columns: 1fr; gap: 40px; }
        }

        /* Amenities */
        .amenities-section {
          padding: 120px 5vw;
          background: var(--bg-offwhite);
          position: relative;
        }
        .amenities-header {
          text-align: center;
          margin-bottom: 80px;
        }
        .amenities-header h3 {
          font-family: "Ogg Medium", serif;
          font-size: 3.5rem;
          color: var(--dark-blue);
          margin-bottom: 20px;
          font-weight: 400;
        }
        .amenities-header p {
          font-size: 1.2rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }
        .amenities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .amenity-card {
          background: white;
          border: 1px solid rgba(191, 165, 123, 0.2);
          border-radius: 16px;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          cursor: default;
        }
        .amenity-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(11, 34, 65, 0.08);
          border-color: var(--gold);
        }
        .amenity-icon {
          width: 70px;
          height: 70px;
          background: rgba(191, 165, 123, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold);
          margin-bottom: 24px;
          transition: transform 0.4s ease, background 0.4s ease;
        }
        .amenity-card:hover .amenity-icon {
          transform: scale(1.1);
          background: var(--gold);
          color: white;
        }
        .amenity-card h4 {
          color: var(--dark-blue);
          font-size: 1.15rem;
          font-weight: 500;
          margin: 0;
        }

        /* Footer */
        .multan-footer {
          background: var(--dark-blue);
          padding: 100px 5vw 40px;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 60px;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .footer-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .footer-card h4 {
          color: var(--gold);
          font-size: 1.8rem;
          font-family: "Ogg Medium", serif;
          margin-bottom: 30px;
          font-weight: 400;
        }
        .contact-item {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }
        .contact-item svg {
          color: var(--gold);
          flex-shrink: 0;
          margin-top: 4px;
        }
        .contact-item div strong {
          display: block;
          font-size: 1.1rem;
          margin-bottom: 6px;
          font-weight: 500;
        }
        .contact-item div span {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }
        .social-bar {
          display: flex;
          gap: 16px;
          margin-top: 40px;
        }
        .social-bar a {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }
        .social-bar a:hover {
          background: var(--gold);
          transform: translateY(-5px);
        }
        .footer-bottom {
          text-align: center;
          margin-top: 80px;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
        }
      `}} />

      <div className="multan-nav-container" style={getThemeStyles() as React.CSSProperties}>
        <nav className="multan-nav" style={{ transition: 'all 0.5s ease' }}>
          <div className="multan-nav-logo">
            <Link href="/">
              <img src="/log.png" alt="Royal Orchard" />
            </Link>
          </div>
          
          <div className="multan-nav-links">
            <a href="#overview" className={activeSection === 'overview' ? 'active' : ''} onClick={(e) => handleNavClick(e, '#overview')}>OVERVIEW</a>
            <a href="#amenities" className={activeSection === 'amenities' ? 'active' : ''} onClick={(e) => handleNavClick(e, '#amenities')}>AMENITIES</a>
            <a href="#plans" className={activeSection === 'plans' ? 'active' : ''} onClick={(e) => handleNavClick(e, '#plans')}>PLANS</a>
            <a href="#gallery" className={activeSection === 'gallery' ? 'active' : ''} onClick={(e) => handleNavClick(e, '#gallery')}>GALLERY & PROGRESS</a>
            <a href="#videos" className={activeSection === 'videos' ? 'active' : ''} onClick={(e) => handleNavClick(e, '#videos')}>VIDEOS</a>
            <a href="#partners" className={activeSection === 'partners' ? 'active' : ''} onClick={(e) => handleNavClick(e, '#partners')}>PARTNERS</a>
            <a href="#news" className={activeSection === 'news' ? 'active' : ''} onClick={(e) => handleNavClick(e, '#news')}>NEWS & EVENTS</a>
            <a href="#location" className={activeSection === 'location' ? 'active' : ''} onClick={(e) => handleNavClick(e, '#location')}>LOCATION</a>
          </div>

          <a href="#query" className="nav-get-touch">QUERY</a>
        </nav>

        <div className="floating-controls">
          <button className="theme-toggle-btn" onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsProjectsDropdownOpen(false); }} aria-label="Toggle Settings">
            <Settings2 size={20} />
          </button>

          <button className="project-toggle-btn" onClick={() => { setIsProjectsDropdownOpen(!isProjectsDropdownOpen); setIsSettingsOpen(false); }} aria-label="Switch Project">
            <Building2 size={20} />
          </button>
        </div>

        {/* Projects Panel */}
        <div className={`settings-panel ${isProjectsDropdownOpen ? 'open' : ''}`} style={{ right: '20px' }}>
          <div className="settings-group">
            <span className="settings-label">SWITCH PROJECT</span>
            <div className="flex flex-col gap-2 mt-2 max-h-64 overflow-y-auto custom-scrollbar">
              {allProjects.map(p => (
                <Link 
                  key={p.slug} 
                  href={`/${p.slug}`}
                  className={`toggle-btn flex justify-between items-center w-full px-4 py-3 ${slug === p.slug ? 'active' : ''}`}
                  style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}
                >
                  <span className="font-bold">{p.name}</span>
                  {slug === p.slug && <span className="text-[9px] bg-black/10 px-2 py-0.5 rounded-full">Active</span>}
                </Link>
              ))}
              {allProjects.length === 0 && <div className="text-xs opacity-50 p-2 text-center">No projects found</div>}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className={`settings-panel ${isSettingsOpen ? 'open' : ''}`}>
          
          <div className="settings-group">
            <span className="settings-label">HEADER MODE</span>
            <div className="toggle-row">
              <button className={`toggle-btn ${themeMode === 'dark' ? 'active' : ''}`} onClick={() => setThemeMode('dark')}>DARK</button>
              <button className={`toggle-btn ${themeMode === 'light' ? 'active' : ''}`} onClick={() => setThemeMode('light')}>LIGHT</button>
              <button className={`toggle-btn ${themeMode === 'glossy' ? 'active' : ''}`} onClick={() => setThemeMode('glossy')}>GLOSSY</button>
            </div>
          </div>

          <div className="settings-group">
            <span className="settings-label">FONT SIZE</span>
            <div className="toggle-row">
              <button className={`toggle-btn ${navFontSize === '80%' ? 'active' : ''}`} onClick={() => setNavFontSize('80%')}>80%</button>
              <button className={`toggle-btn ${navFontSize === '90%' ? 'active' : ''}`} onClick={() => setNavFontSize('90%')}>90%</button>
              <button className={`toggle-btn ${navFontSize === '100%' ? 'active' : ''}`} onClick={() => setNavFontSize('100%')}>100%</button>
            </div>
          </div>

          <div className="settings-group">
            <span className="settings-label">ACCENT COLOR</span>
            <div className="color-row">
              {accentColors.map((color) => (
                <div 
                  key={color.name}
                  className={`color-circle ${accentColor === color.value ? 'active' : ''}`}
                  style={{ background: color.value }}
                  onClick={() => setAccentColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="settings-group">
            <span className="settings-label">AMBIENT GLOW</span>
            <div className="toggle-row">
              <button className={`toggle-btn ${ambientGlow ? 'active' : ''}`} onClick={() => setAmbientGlow(true)}>ON</button>
              <button className={`toggle-btn ${!ambientGlow ? 'active' : ''}`} onClick={() => setAmbientGlow(false)}>OFF</button>
            </div>
          </div>

        </div>
      </div>

      <section className="hero">
        <img 
          src={dynamicContent.heroImageUrl} 
          alt={`${dynamicContent.name} Background`} 
          className="hero-bg" 
        />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>{dynamicContent.sectionsData?.innerHeroTitle || dynamicContent.heroTitle}</h1>
          <h2>{dynamicContent.sectionsData?.heroSubTitle}</h2>
        </div>
      </section>

      <section id="overview" className="overview-section">
        <div className="overview-text">
          <h3>{dynamicContent.sectionsData?.overviewTitle || 'A Vision of Luxury'}</h3>
          <p>{dynamicContent.heroDescription}</p>
          <p>{dynamicContent.sectionsData?.overviewParagraph2}</p>
        </div>
        <div className="overview-img-wrapper">
          <img src={dynamicContent.sectionsData?.overviewImage || '/plotsm.jpg'} alt="Multan Landscape" />
        </div>
      </section>

      <section id="amenities" className="amenities-section">
        <div className="amenities-header">
          <h3>Unmatched Amenities</h3>
          <p>{dynamicContent.sectionsData?.amenitiesSubtitle || 'Royal Orchard Multan brings to you the Building Revolution.'}</p>
        </div>
        
        <div className="amenities-grid">
          {(dynamicContent.sectionsData?.amenities || []).map((item: any, idx: number) => {
            const Icon = IconMap[item.icon] || Home;
            return (
              <div key={idx} className="amenity-card">
                <div className="amenity-icon">
                  <Icon size={32} strokeWidth={1.5} />
                </div>
                <h4>{item.name}</h4>
              </div>
            );
          })}
        </div>
      </section>

      <section id="plans" className="plans-section" style={{ padding: '100px 5vw', background: '#fff' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontFamily: '"Ogg Medium", serif', fontSize: '3.5rem', color: 'var(--dark-blue)', marginBottom: '20px' }}>Plans</h3>
          <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>{dynamicContent.sectionsData?.masterPlansSubtitle}</p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '40px', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto 40px auto' }}>
          {planCategories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => setActivePlanTab(cat)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: activePlanTab === cat ? 'bold' : 'normal',
                color: activePlanTab === cat ? 'var(--dark-blue)' : '#666',
                borderBottom: activePlanTab === cat ? '2px solid var(--gold)' : '2px solid transparent',
                paddingBottom: '5px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1400px', margin: '0 auto' }}>
          {displayPlans.length > 0 ? displayPlans.map((planImg: any, idx: number) => (
            <div 
              key={idx}
              onClick={() => { 
                if(planImg.image) { 
                  setLightboxData({ 
                    images: displayPlans.filter(p => p.image).map(p => p.image), 
                    currentIndex: displayPlans.filter(p => p.image).findIndex(p => p.image === planImg.image)
                  }); 
                  setZoomLevel(1); 
                } 
              }}
              style={{ background: '#f5f5f5', height: '400px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
            >
              <img src={planImg.image} alt={planImg.planTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} />
            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999', padding: '40px' }}>
              No images available for this plan.
            </div>
          )}
        </div>
      </section>

      <section id="gallery" className="gallery-section" style={{ padding: '100px 5vw', background: 'var(--bg-offwhite)' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontFamily: '"Ogg Medium", serif', fontSize: '3.5rem', color: 'var(--dark-blue)', marginBottom: '20px' }}>Gallery & Progress</h3>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '40px', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto 40px auto' }}>
          {galleryCategories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => setActiveGalleryTab(cat)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: activeGalleryTab === cat ? 'bold' : 'normal',
                color: activeGalleryTab === cat ? 'var(--dark-blue)' : '#666',
                borderBottom: activeGalleryTab === cat ? '2px solid var(--gold)' : '2px solid transparent',
                paddingBottom: '5px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>
          {displayGallery.length > 0 ? displayGallery.map((img: any, idx: number) => (
             <div 
               key={idx} 
               onClick={() => { 
                 if(img.image) { 
                   setLightboxData({ 
                     images: displayGallery.filter(g => g.image).map(g => g.image), 
                     currentIndex: displayGallery.filter(g => g.image).findIndex(g => g.image === img.image)
                   }); 
                   setZoomLevel(1); 
                 } 
               }}
               style={{ background: '#e0e0e0', height: '250px', borderRadius: '12px', overflow: 'hidden', cursor: img.image ? 'pointer' : 'default', position: 'relative' }}
             >
               {img.image && <img src={img.image} alt={img.sectionTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} />}
             </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999', padding: '40px' }}>
              No images available for this category.
            </div>
          )}
        </div>
      </section>

      <section id="videos" className="videos-section" style={{ padding: '100px 5vw', background: '#fff' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h3 style={{ fontFamily: '"Ogg Medium", serif', fontSize: '3.5rem', color: 'var(--dark-blue)', marginBottom: '20px' }}>Videos</h3>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', maxWidth: '1400px', margin: '0 auto' }}>
          {(dynamicContent.sectionsData?.videos || []).map((vid: any, idx: number) => (
             <div key={idx} style={{ width: '100%', maxWidth: '800px', aspectRatio: '16/9', background: '#000', borderRadius: '16px', overflow: 'hidden' }}>
               {vid.type === 'youtube' && <iframe width="100%" height="100%" src={vid.url} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>}
             </div>
          ))}
        </div>
      </section>

      <section id="partners" className="partners-section" style={{ padding: '100px 5vw', background: 'var(--bg-offwhite)' }}>
         <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h3 style={{ fontFamily: '"Ogg Medium", serif', fontSize: '3.5rem', color: 'var(--dark-blue)', marginBottom: '20px' }}>Our Partners</h3>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap', opacity: 0.6 }}>
           {(dynamicContent.sectionsData?.partners || []).map((partner: any, idx: number) => (
             partner.image ? (
               <img key={idx} src={partner.image} alt={partner.name} style={{ maxHeight: '80px', objectFit: 'contain' }} />
             ) : (
               <h2 key={idx} style={{ fontFamily: '"Ogg Medium", serif', fontSize: '2rem' }}>{partner.name}</h2>
             )
           ))}
        </div>
      </section>

      <section id="news" className="news-section" style={{ padding: '100px 5vw', background: '#fff' }}>
         <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h3 style={{ fontFamily: '"Ogg Medium", serif', fontSize: '3.5rem', color: 'var(--dark-blue)', marginBottom: '20px' }}>News & Events</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1400px', margin: '0 auto' }}>
           {(dynamicContent.sectionsData?.news || []).map((newsItem: any, idx: number) => (
             <div key={idx} style={{ padding: '30px', border: '1px solid #eee', borderRadius: '16px' }}>
               <span style={{ color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 600 }}>{newsItem.date}</span>
               <h4 style={{ marginTop: '10px', color: 'var(--dark-blue)', fontSize: '1.25rem' }}>{newsItem.title}</h4>
             </div>
           ))}
        </div>
      </section>

      <footer id="location" className="multan-footer">
        <div className="footer-grid">
          <div className="footer-card">
            <h4>Location</h4>
            <div className="contact-item">
              <MapPin size={24} />
              <div>
                <strong>Multan Office</strong>
                <span>{dynamicContent.sectionsData?.contact?.multanOffice}</span>
              </div>
            </div>
            <div className="contact-item" style={{ marginTop: '30px' }}>
              <MapPin size={24} />
              <div>
                <strong>Islamabad Office</strong>
                <span>{dynamicContent.sectionsData?.contact?.islamabadOffice}</span>
              </div>
            </div>
          </div>

          <div className="footer-card">
            <h4>Get in touch</h4>
            <div className="contact-item">
              <Phone size={24} />
              <div>
                <strong>Phone & UAN</strong>
                {(dynamicContent.sectionsData?.contact?.phones || []).map((phone: string, i: number) => (
                  <span key={i}>{phone}<br/></span>
                ))}
                <span style={{ color: 'var(--gold)' }}>UAN: {dynamicContent.sectionsData?.contact?.uan}</span>
              </div>
            </div>
            <div className="contact-item" style={{ marginTop: '20px' }}>
              <Mail size={24} />
              <div>
                <strong>Email</strong>
                <span>{dynamicContent.sectionsData?.contact?.email}</span>
              </div>
            </div>

            <div className="social-bar">
              <a href={dynamicContent.sectionsData?.contact?.socials?.facebook || '#'} aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href={dynamicContent.sectionsData?.contact?.socials?.twitter || '#'} aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href={dynamicContent.sectionsData?.contact?.socials?.googlePlus || '#'} aria-label="Google Plus"><i className="fab fa-google-plus-g"></i></a>
              <a href={dynamicContent.sectionsData?.contact?.socials?.instagram || '#'} aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href={dynamicContent.sectionsData?.contact?.socials?.linkedin || '#'} aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Royal Orchard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
