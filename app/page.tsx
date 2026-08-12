"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);
  useEffect(() => {
    const section = document.querySelector('.cinema-scroll') as HTMLElement | null;
    const root = document.documentElement;
    const track = document.querySelector('.sights-track') as HTMLElement | null;
    const sightsControls = document.querySelector('.sights-controls') as HTMLElement | null;
    const btnPrev = document.querySelector('.sight-prev') as HTMLElement | null;
    const btnNext = document.querySelector('.sight-next') as HTMLElement | null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!section || !track || !sightsControls || !btnPrev || !btnNext || projects.length === 0) {
      return;
    }

    const SIGHT_DATA = projects.map(project => ({
      label: `Open ${project.name} card`,
      kicker: project.name,
      h3: project.heroTitle || project.name,
      p: project.heroDescription || "A premium housing project.",
      pin: project.heroImageUrl || "/mul.jpeg",
      slug: project.slug
    }));

    let targetMouseX = 0, targetMouseY = 0, mouseX = 0, mouseY = 0;
    let targetScroll = 0, smoothScroll = 0, initialized = false, rafPending = false;
    let activeSight = 0;
    let sightCards = document.querySelectorAll('.sight-card') as unknown as NodeListOf<HTMLElement>;

    const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
    const smoothstep = (e0: number, e1: number, v: number) => {
      const x = clamp((v - e0) / (e1 - e0));
      return x * x * (3 - 2 * x);
    };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const segmentInOut = (s: number, a: number, b: number, c: number, d: number) => {
      const enter = smoothstep(a, b, s);
      const exit = smoothstep(c, d, s);
      return { enter, exit, active: enter * (1 - exit) };
    };

    const getScrollDistance = () => clamp(-section.getBoundingClientRect().top, 0, section.offsetHeight - window.innerHeight);

    function setupSightSlider() {
      track!.replaceChildren();
      SIGHT_DATA.forEach((data, i) => {
        const card = document.createElement('article');
        card.className = 'sight-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', data.label);
        card.dataset.sightIndex = String(i);
        card.innerHTML = `
          <span class="sight-kicker">${data.kicker}</span>
          <img class="sight-pin" src="${data.pin}" alt="" />
          <h3>${data.h3}</h3>
          <p>${data.p}</p>
        `;
        card.onclick = () => selectSightCard(card);
        card.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectSightCard(card);
          }
        };
        track!.appendChild(card);
      });
      sightCards = document.querySelectorAll('.sight-card') as unknown as NodeListOf<HTMLElement>;
      updateSightSlider();
    }

    function updateSightSlider() {
      if (!sightCards.length) return;
      const isMobile = window.innerWidth <= 1100;
      if (isMobile) {
        const cardWidth = sightCards[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(track!).columnGap || "0");
        const shift = window.innerWidth / 2 - (activeSight * (cardWidth + gap)) - (cardWidth / 2);
        root.style.setProperty('--sights-shift', `${shift}px`);
      } else {
        root.style.setProperty('--sights-shift', `0px`);
      }
      sightCards.forEach((c, i) => c.classList.toggle('is-active', i === activeSight));
    }

    function moveSightSlider(dir: number) {
      const count = SIGHT_DATA.length;
      activeSight = (activeSight + dir + count) % count;
      updateSightSlider();
    }
    function selectSightCard(card: HTMLElement) { 
      const index = Number(card.dataset.sightIndex);
      if (activeSight === index) {
        if (SIGHT_DATA[index]) {
          window.location.href = `/${SIGHT_DATA[index].slug}`;
        }
      } else {
        activeSight = index; 
        updateSightSlider(); 
      }
    }
    function update() {
      targetScroll = getScrollDistance();
      if (!initialized || reduceMotion.matches) { smoothScroll = targetScroll; initialized = true; }
      else { smoothScroll = lerp(smoothScroll, targetScroll, 0.14); }
      if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

      mouseX = lerp(mouseX, targetMouseX, 0.12);
      mouseY = lerp(mouseY, targetMouseY, 0.12);

      const frame2 = segmentInOut(smoothScroll, 400, 600, 900, 1100);
      const frame3 = segmentInOut(smoothScroll, 1200, 1400, 1700, 1900);
      const frame4 = segmentInOut(smoothScroll, 2000, 2200, 2500, 2700);
      const frame5 = segmentInOut(smoothScroll, 2800, 3000, 3300, 3500);
      const progress = clamp(smoothScroll / 3600);
      const introExit = smoothstep(90, 500, smoothScroll);
      const sightsEnterRaw = smoothstep(3350, 3560, smoothScroll);
      const sightsEnter = Math.pow(sightsEnterRaw, 1.55);
      const sightsControlsEnter = smoothstep(3450, 3600, smoothScroll);

      const blurActive = clamp(frame2.active + frame3.active + frame4.active + frame5.active);
      const frame2Opacity = frame2.active * (1 - frame3.enter);
      const splitDrift = Math.pow(frame2.enter, 1.5);
      const backScale = 0.84 + progress * 0.16 + frame2.enter * 0.08 + frame3.enter * 0.08 + frame4.enter * 0.02 + frame5.enter * 0.02;

      const sharedHeroY = progress * -74;
      const sharedHeroScale = progress * 0.23;

      const vh = window.innerHeight;
      const sightsScreenTop = Math.min(220, Math.max(112, vh * 0.19)) - 50;
      const sightsParentTop = vh - (vh - sightsScreenTop) / backScale;

      const mxVal = (reduceMotion.matches ? 0 : mouseX).toFixed(4);
      const myVal = (reduceMotion.matches ? 0 : mouseY).toFixed(4);

      root.style.setProperty('--mx', mxVal);
      root.style.setProperty('--my', myVal);
      root.style.setProperty('--back-opacity', (1 - frame2.active * 0.06).toFixed(4));
      root.style.setProperty('--back-x', `${(mouseX * -12).toFixed(2)}px`);
      root.style.setProperty('--back-y', `${(mouseY * -4).toFixed(2)}px`);
      root.style.setProperty('--back-scale', backScale.toFixed(4));
      root.style.setProperty('--four-y', `${(10 + progress * 10).toFixed(2)}vh`);
      root.style.setProperty('--four-scale', (0.78 + progress * 0.16).toFixed(4));
      root.style.setProperty('--bazaar-y', `${(20 - progress * 8).toFixed(2)}vh`);
      root.style.setProperty('--blur-px', `${(blurActive * 14).toFixed(2)}px`);
      root.style.setProperty('--back-brightness', (1 - blurActive * 0.255).toFixed(4));
      root.style.setProperty('--bazaar-blur-px', `${(frame2.active * 14).toFixed(2)}px`);
      root.style.setProperty('--bazaar-brightness', (1 - frame2.active * 0.255 - frame3.active * 0.06).toFixed(4));
      root.style.setProperty('--bazaar-saturation', (1 + frame3.active * 0.18).toFixed(4));
      root.style.setProperty('--shade-z', frame2.active > 0.02 ? "2" : "0");
      root.style.setProperty('--shade-top-alpha', (blurActive * 0.465).toFixed(4));
      root.style.setProperty('--shade-mid-alpha', (blurActive * 0.42).toFixed(4));
      root.style.setProperty('--shade-bottom-alpha', (blurActive * 0.51).toFixed(4));

      root.style.setProperty('--title-y', `${(introExit * -210).toFixed(2)}px`);
      root.style.setProperty('--title-scale', (1 - introExit * 0.08).toFixed(4));
      root.style.setProperty('--title-opacity', (1 - introExit).toFixed(4));

      root.style.setProperty('--bridge-x', `calc(-50% + ${(mouseX * 18).toFixed(2)}px)`);
      root.style.setProperty('--bridge-y', `${(mouseY * 8 + sharedHeroY - frame2.exit * 760).toFixed(2)}px`);
      root.style.setProperty('--bridge-bottom', `${(5 - frame2.enter * 13).toFixed(2)}vh`);
      root.style.setProperty('--bridge-width', `${(67.2 + frame2.enter * 37.8).toFixed(2)}vw`);
      root.style.setProperty('--bridge-scale', (1.02 + sharedHeroScale + frame2.exit * 0.46).toFixed(4));

      root.style.setProperty('--split-left-x', `calc(-50% + ${(-splitDrift * 46).toFixed(2)}vw + ${(mouseX * 22).toFixed(2)}px)`);
      root.style.setProperty('--split-left-y', `${(mouseY * 10 + sharedHeroY - splitDrift * 180).toFixed(2)}px`);
      root.style.setProperty('--split-left-scale', (1 + sharedHeroScale + frame2.enter * 0.74).toFixed(4));
      root.style.setProperty('--split-right-x', `calc(-50% + ${(splitDrift * 46).toFixed(2)}vw + ${(mouseX * 22).toFixed(2)}px)`);
      root.style.setProperty('--split-right-y', `${(mouseY * 10 + sharedHeroY - splitDrift * 180).toFixed(2)}px`);
      root.style.setProperty('--split-right-scale', (1 + sharedHeroScale + frame2.enter * 0.74).toFixed(4));

      root.style.setProperty('--frame2-opacity', frame2Opacity.toFixed(4));
      root.style.setProperty('--frame2-x', `calc(-50% + ${(mouseX * 10).toFixed(2)}px)`);
      root.style.setProperty('--frame2-y', `calc(-50% + ${(mouseY * 8 - frame2.exit * 150).toFixed(2)}px)`);
      root.style.setProperty('--frame2-scale', (1.16 + frame2.enter * 0.08 + frame2.exit * 0.08).toFixed(4));

      root.style.setProperty('--intro-copy-y', `${(introExit * 90).toFixed(2)}px`);
      root.style.setProperty('--intro-copy-opacity', (1 - introExit).toFixed(4));
      root.style.setProperty('--panel2-opacity', (frame2.active * (1 - frame2.exit)).toFixed(4));
      root.style.setProperty('--panel2-y', `calc(-50% + ${(-frame2.exit * 86 + (1 - frame2.enter) * 58).toFixed(2)}px)`);
      root.style.setProperty('--panel-obj-opacity', (frame3.active * (1 - frame3.exit)).toFixed(4));
      root.style.setProperty('--panel-obj-y', `calc(-50% + ${(-frame3.exit * 86 + (1 - frame3.enter) * 58).toFixed(2)}px)`);
      root.style.setProperty('--panel3-opacity', (frame4.active * (1 - frame4.exit)).toFixed(4));
      root.style.setProperty('--panel3-y', `calc(-50% + ${(-frame4.exit * 86 + (1 - frame4.enter) * 58).toFixed(2)}px)`);
      root.style.setProperty('--panel-features-opacity', (frame5.active * (1 - frame5.exit)).toFixed(4));
      root.style.setProperty('--panel-features-y', `calc(-50% + ${(-frame5.exit * 86 + (1 - frame5.enter) * 58).toFixed(2)}px)`);

      root.style.setProperty('--sights-opacity', sightsEnter.toFixed(4));
      root.style.setProperty('--sights-controls-opacity', sightsControlsEnter.toFixed(4));
      sightsControls!.classList.toggle("is-ready", sightsControlsEnter > 0.98);
      root.style.setProperty('--sights-visibility', sightsEnter > 0.01 ? "visible" : "hidden");
      root.style.setProperty('--sights-enter-x', `${((1 - sightsEnter) * 420).toFixed(2)}vw`);
      root.style.setProperty('--sights-scale', (1 / backScale).toFixed(4));
      root.style.setProperty('--sights-top', `${sightsParentTop.toFixed(2)}px`);
      root.style.setProperty('--sights-screen-top', `${sightsScreenTop.toFixed(2)}px`);

      rafPending = false;
      if (Math.abs(smoothScroll - targetScroll) > 0.08 || Math.abs(mouseX - targetMouseX) > 0.001 || Math.abs(mouseY - targetMouseY) > 0.001) {
        requestTick();
      }
    }

    function requestTick() {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(update);
      }
    }

    const onScroll = () => requestTick();
    const onResize = () => { updateSightSlider(); requestTick(); };
    const onPointerMove = (e: PointerEvent) => {
      targetMouseX = e.clientX / window.innerWidth - 0.5;
      targetMouseY = e.clientY / window.innerHeight - 0.5;
      requestTick();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    btnPrev.onclick = () => moveSightSlider(-1);
    btnNext.onclick = () => moveSightSlider(1);

    setupSightSlider();
    requestTick();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [projects]);
  const handleProjectClick = (index: number) => {
    if (projects[index]) {
      window.location.href = `/${projects[index].slug}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b1110]">
        <Loader2 className="w-12 h-12 animate-spin text-[#c4864b]" />
      </div>
    );
  }

  return (
    <>
      <div className="top-bar">
        <img src="/log.png" alt="Royal Orchard" className="top-logo" />
        <nav className="top-nav">
          <button className="top-btn" onClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })}>Who</button>
          <button className="top-btn" onClick={() => window.scrollTo({ top: 1400, behavior: 'smooth' })}>Objective</button>
          <button className="top-btn" onClick={() => window.scrollTo({ top: 2200, behavior: 'smooth' })}>V&M</button>
          <button className="top-btn" onClick={() => window.scrollTo({ top: 3000, behavior: 'smooth' })}>Features</button>
          <div className="nav-dropdown">
            <button className="top-btn">Projects ▾</button>
            <div className="dropdown-menu">
              {projects.map((project) => (
                <Link key={project.slug} href={`/${project.slug}`}>{project.name}</Link>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @font-face {
            font-family: "Ogg Medium";
            src: url("https://dcym8fthxf5uu.cloudfront.net/fonts/247a073c-29f5-4a89-aa3a-741020f346fc/OggText-Medium.woff2") format("woff2");
            font-weight: 500;
            font-style: normal;
        }

        :root {
            --mx: 0;
            --my: 0;
            --back-opacity: 1;
            --back-x: 0px;
            --back-y: 0px;
            --back-scale: 0.76;
            --four-y: 10vh;
            --four-scale: 0.78;
            --bazaar-y: 20vh;
            --blur-px: 0px;
            --back-brightness: 1;
            --bazaar-blur-px: 0px;
            --bazaar-brightness: 1;
            --bazaar-saturation: 1;
            --shade-opacity: 1;
            --shade-z: 2;
            --shade-top-alpha: 0;
            --shade-mid-alpha: 0;
            --shade-bottom-alpha: 0;
            --blur-tint: 74, 181, 224;
            --title-y: 0px;
            --title-scale: 1;
            --title-opacity: 1;
            --bridge-x: -50%;
            --bridge-y: 0px;
            --bridge-bottom: 5vh;
            --bridge-width: 67.2vw;
            --bridge-scale: 1.02;
            --split-left-x: -50%;
            --split-left-y: 0px;
            --split-left-scale: 1;
            --split-right-x: -50%;
            --split-right-y: 0px;
            --split-right-scale: 1;
            --frame2-opacity: 0;
            --frame2-x: -50%;
            --frame2-y: -50%;
            --frame2-scale: 1.06;
            --intro-copy-y: 0px;
            --intro-copy-opacity: 1;
            --panel2-opacity: 0;
            --panel2-y: calc(-50% + 58px);
            --panel-obj-opacity: 0;
            --panel-obj-y: calc(-50% + 58px);
            --panel3-opacity: 0;
            --panel3-y: calc(-50% + 58px);
            --panel-features-opacity: 0;
            --panel-features-y: calc(-50% + 58px);
            --sights-opacity: 0;
            --sights-controls-opacity: 0;
            --sights-y: 0px;
            --sights-enter-x: 420vw;
            --sights-visibility: hidden;
            --sights-shift: 0px;
            --sights-scale: 1;
            --sights-top: clamp(112px, 19vh, 220px);
            --sights-screen-top: clamp(112px, 19vh, 220px);
            --ink: #111411;
            --paper: #fdf1e1;
            --shadow: rgba(0, 0, 0, 0.32);
            font-family: Inter, Satoshi, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: var(--paper);
            background: #0b1110;
            letter-spacing: 0;
        }

        * {
            box-sizing: border-box;
        }

        html {
            min-height: 100%;
            scroll-behavior: smooth;
            background: #0b1110;
        }

        body {
            min-height: 100%;
            margin: 0;
            overflow-x: clip;
            background: #0b1110;
        }

        button {
            border: 0;
            font: inherit;
            background: none;
            color: inherit;
            cursor: pointer;
        }

        a {
            text-decoration: none;
            color: inherit;
        }

        .site-shell {
            min-height: 100vh;
        }

        .cinema-scroll {
            position: relative;
            height: calc(100vh + 3600px);
        }

        .stage {
            position: sticky;
            top: 0;
            height: 100vh;
            min-height: 620px;
            overflow: hidden;
            isolation: isolate;
            background: #7fb4d4;
        }

        .world,
        .back-stack,
        .sky-img,
        .shade,
        .scene-img,
        .site-header,
        .sights-slider,
        .sights-controls,
        .hero-title,
        .intro-copy,
        .story-panel {
            position: absolute;
        }

        .world {
            inset: 0;
            overflow: hidden;
            background: #79b7dd;
        }

        /* Header */
        .site-header {
            z-index: 10;
            top: 0;
            left: 0;
            right: 0;
            display: grid;
            grid-template-columns: minmax(260px, 1fr) auto minmax(260px, 1fr);
            align-items: center;
            gap: 32px;
            padding: 32px;
            color: rgba(253, 241, 225, 0.86);
            pointer-events: auto;
        }

        .site-logo {
            justify-self: start;
            font-family: "Ogg Medium";
            font-size: 24px;
            font-weight: 500;
            color: rgba(253, 241, 225, 0.92);
            white-space: nowrap;
            line-height: 1;
        }

        .site-nav {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: clamp(24px, 2.2vw, 44px);
        }

        .site-nav a,
        .language-switcher {
            font-weight: 700;
            line-height: 1;
            text-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
        }

        .site-nav a {
            font-size: 20px;
            font-weight: 400;
        }

        .language-switcher {
            justify-self: end;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 0;
            font-size: 16px;
        }

        .language-switcher span {
            display: inline-flex;
            line-height: 1;
        }

        /* Scene Images */
        .scene-img {
            display: block;
            user-select: none;
            -webkit-user-drag: none;
            will-change: transform, opacity, filter;
            pointer-events: none;
            max-width: none !important;
        }

        .sky-img {
            z-index: 0;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: blur(var(--blur-px)) brightness(var(--back-brightness));
        }

        .back-stack {
            z-index: 1;
            top: 0;
            bottom: 0;
            left: -3vw;
            right: -3vw;
            opacity: var(--back-opacity);
            transform: translate3d(var(--back-x), var(--back-y), 0) scale(var(--back-scale));
            transform-origin: 50% 100%;
            will-change: transform, filter, opacity;
        }

        .back-img {
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: blur(var(--blur-px)) brightness(var(--back-brightness));
        }

        .back-bazaar,
        .back-four {
            top: auto;
            bottom: 0;
            left: 48%;
            right: auto;
            width: 112%;
            height: auto;
            object-fit: contain;
        }

        .back-bazaar {
            z-index: 3;
            opacity: 1;
            filter: blur(var(--bazaar-blur-px)) brightness(var(--bazaar-brightness)) saturate(var(--bazaar-saturation));
            transform: translate3d(-50%, var(--bazaar-y), 0) scale(0.86);
        }

        .back-four {
            z-index: 1;
            opacity: 0.72;
            mix-blend-mode: screen;
            transform: translate3d(-50%, calc(var(--four-y) - 110px), 0) scale(var(--four-scale));
        }

        /* Slider */
        .sights-slider {
            z-index: 2;
            left: 0;
            right: 0;
            top: var(--sights-top);
            padding: 0;
            visibility: var(--sights-visibility);
            transform: translate3d(var(--sights-enter-x), var(--sights-y), 0) scale(var(--sights-scale));
            transform-origin: 0 0;
            pointer-events: auto;
            will-change: transform;
        }

        .sights-track {
            display: flex;
            gap: clamp(16px, 1.15vw, 24px);
            align-items: stretch;
            transform: translate3d(var(--sights-shift), 0, 0);
            transition: transform 640ms cubic-bezier(0.22, 1, 0.36, 1);
            will-change: transform;
            width: 100%;
            justify-content: center;
        }

        .sights-track.is-jumping {
            transition: none;
        }

        .sight-card {
            position: relative;
            flex: 0 0 clamp(360px, 19.4vw, 430px);
            height: 220px;
            padding: 24px;
            overflow: hidden;
            border: 1px solid rgba(253, 241, 225, 0.42);
            border-radius: 24px;
            color: #000;
            background: #fdf1e1;
            box-shadow: 0 18px 52px rgba(2, 47, 64, 0.12);
            cursor: pointer;
            user-select: none;
            text-align: left;
        }

        .sight-card.is-active {
            outline: none;
        }

        .sight-card * {
            text-shadow: none;
            position: relative;
            z-index: 1;
        }

        .sight-kicker {
            display: block;
            margin-bottom: 56px;
            color: #000;
            font-size: 12px;
            font-weight: 500;
            line-height: 1.05;
            text-transform: uppercase;
        }

        .sight-pin {
            position: absolute;
            top: 24px;
            right: 24px;
            width: 67.2px;
            height: 67.2px;
            pointer-events: none;
            z-index: 1;
        }

        .sight-card h3 {
            position: absolute;
            left: 24px;
            right: 24px;
            bottom: calc(24px + (16px * 1.16 * 2) + 12px);
            max-width: calc(100% - 76px);
            margin: 0;
            font-size: 20px;
            font-weight: 800;
            line-height: 1.1;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            white-space: normal;
        }

        .sight-card p {
            position: absolute;
            left: 24px;
            right: 24px;
            bottom: 24px;
            max-width: 100%;
            margin: 12px 0 0;
            font-size: 16px;
            font-weight: 400;
            line-height: 1.16;
            display: -webkit-box;
            max-height: calc(2em * 1.16);
            overflow: hidden;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
        }

        .sights-controls {
            z-index: 5;
            left: 48px;
            top: calc(var(--sights-screen-top) + 220px + 16px);
            display: flex;
            gap: 14px;
            opacity: var(--sights-controls-opacity);
            transform: translate3d(0, var(--sights-y), 0);
            pointer-events: none;
        }

        .sights-controls.is-ready {
            pointer-events: auto;
        }

        .sight-nav {
            width: 54px;
            height: 54px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            color: #111411;
            background: rgba(253, 241, 225, 0.94);
            box-shadow: 0 18px 36px rgba(0, 0, 0, 0.2);
        }

        /* Hero elements */
        .hero-title {
            z-index: 3;
            left: 50%;
            top: clamp(122px, 19vh, 205px);
            width: min(94vw, 1780px);
            margin: 0;
            font-family: "Ogg Medium";
            font-size: 14rem;
            font-weight: 500;
            line-height: 0.78;
            text-align: center;
            transform: translate3d(-50%, var(--title-y), 0) scale(var(--title-scale));
            opacity: var(--title-opacity);
            will-change: transform, opacity;
        }

        .bridge-img {
            z-index: 4;
            left: 50%;
            bottom: var(--bridge-bottom);
            width: min(var(--bridge-width), 3200px);
            transform: translate3d(var(--bridge-x), var(--bridge-y), 0) scale(var(--bridge-scale));
            transform-origin: 50% 48%;
        }

        .splitframe-img {
            z-index: 6;
            left: 50%;
            bottom: -2vh;
            width: min(124vw, 3200px);
        }

        .splitframe-left {
            transform: translate3d(var(--split-left-x), var(--split-left-y), 0) scale(var(--split-left-scale));
            transform-origin: 21% 52%;
        }

        .splitframe-right {
            transform: translate3d(var(--split-right-x), var(--split-right-y), 0) scale(var(--split-right-scale));
            transform-origin: 79% 52%;
        }

        .frame-two-img {
            z-index: 5;
            left: 50%;
            top: 50%;
            width: min(128vw, 3200px);
            opacity: var(--frame2-opacity);
            transform: translate3d(var(--frame2-x), var(--frame2-y), 0) scale(var(--frame2-scale));
            transform-origin: 50% 50%;
            filter: none !important;
        }

        .shade {
            inset: 0;
            z-index: var(--shade-z);
            pointer-events: none;
            opacity: var(--shade-opacity);
            background: linear-gradient(180deg,
                    rgba(var(--blur-tint), var(--shade-top-alpha)) 0%,
                    rgba(var(--blur-tint), var(--shade-mid-alpha)) 48%,
                    rgba(var(--blur-tint), var(--shade-bottom-alpha)) 100%);
        }

        /* Content panels */
        .intro-copy {
            z-index: 9;
            left: 50%;
            bottom: clamp(56px, 28vh, 400px);
            width: min(560px, calc(100vw - 40px));
            text-align: center;
            transform: translate3d(-50%, var(--intro-copy-y), 0);
            opacity: var(--intro-copy-opacity);
        }

        .intro-copy p {
            margin: 0 auto;
            font-size: 1.18rem;
            font-weight: 500;
            line-height: 1.18;
            text-shadow: 0 2px 18px rgba(0, 0, 0, 0.42);
        }

        .hero-tags {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            margin-top: 26px;
        }

        .hero-tags span {
            min-height: 42px;
            display: inline-flex;
            align-items: center;
            padding: 0 25px;
            color: var(--ink);
            border-radius: 999px;
            background: #fdf1e1;
            font-size: 0.98rem;
            font-weight: 500;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
        }

        .story-panel {
            z-index: 10;
            left: 50%;
            top: 45%;
            width: min(760px, calc(100vw - 42px));
            text-align: center;
            pointer-events: none;
            transform: translate3d(-50%, -50%, 0);
        }

        .story-panel h2 {
            font-family: "Ogg Medium";
            font-size: 4.75rem;
            font-weight: 500;
            line-height: 0.95;
            text-shadow: 0 16px 38px var(--shadow);
            margin: 0;
        }

        .story-panel p {
            width: min(520px, 100%);
            margin: 26px auto 0;
            font-size: 1.14rem;
            font-weight: 500;
            line-height: 1.18;
            text-shadow: 0 2px 18px rgba(0, 0, 0, 0.42);
        }

        .story-panel-bridge {
            top: 60%;
            opacity: var(--panel2-opacity);
            transform: translate3d(-50%, var(--panel2-y), 0);
        }

        .story-panel-bazaar {
            top: 29%;
            opacity: var(--panel3-opacity);
            transform: translate3d(-50%, var(--panel3-y), 0);
            width: min(860px, calc(100vw - 42px));
        }

        .story-panel-features {
            top: 36%;
            opacity: var(--panel-features-opacity);
            transform: translate3d(-50%, var(--panel-features-y), 0);
            width: min(1000px, calc(100vw - 42px));
        }

        .story-panel-features h2 {
            font-size: 2.6rem !important;
            margin-bottom: 36px;
            color: #fdf1e1;
            font-family: "Ogg Medium", serif;
            letter-spacing: 1px;
            text-align: center;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 24px;
            width: 100%;
        }

        .feature-card {
            background: rgba(253, 241, 225, 0.04);
            border: 1px solid rgba(253, 241, 225, 0.12);
            border-radius: 20px;
            padding: 16px;
            text-align: center;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.3s ease, border-color 0.3s ease;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .feature-card:hover {
            transform: translateY(-8px);
            background: rgba(253, 241, 225, 0.08);
            border-color: rgba(253, 241, 225, 0.25);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
        }

        .feature-img-wrapper {
            width: 100%;
            aspect-ratio: 4 / 3;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 16px;
            border: 1px solid rgba(253, 241, 225, 0.08);
            position: relative;
        }

        .feature-img-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }



        .feature-card h3 {
            font-size: 1.15rem;
            font-weight: 600;
            color: #fdf1e1;
            margin: 0;
            line-height: 1.3;
            text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        }

        .mission-vision-container {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 48px;
            text-align: left;
            width: 100%;
        }

        .mv-block h2 {
            font-size: 2.3rem !important;
            margin-bottom: 12px;
            color: #fdf1e1;
            font-family: "Ogg Medium", serif;
        }

        .mv-block p {
            font-size: 0.95rem;
            line-height: 1.45;
            color: rgba(253, 241, 225, 0.82);
            margin: 0;
            text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3) !important;
        }

        @media (max-width: 640px) {
            .mission-vision-container {
                grid-template-columns: 1fr;
                gap: 24px;
            }
            .mv-block h2 {
                font-size: 1.8rem !important;
                margin-bottom: 8px;
            }
            .mv-block p {
                font-size: 0.88rem;
            }
        }

        @media (max-width: 900px) {
            .features-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 20px;
            }
            .story-panel-features {
                width: min(600px, calc(100vw - 42px));
                top: 42%;
            }
        }

        @media (max-width: 500px) {
            .features-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }
            .story-panel-features {
                width: min(340px, calc(100vw - 42px));
                top: 42%;
            }
            .feature-card {
                padding: 12px;
            }
            .feature-card h3 {
                font-size: 1.05rem;
            }
        }

        .rolling-badge {
            position: absolute;
            top: calc(71vh - 160px);
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
        }

        .rolling-badge svg {
            animation: spin-clockwise 20s linear infinite;
            font-family: inherit;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .rolling-badge text {
            fill: rgba(253, 241, 225, 0.85);
            text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }

        .badge-center-icon {
            position: absolute;
            font-size: 20px;
            color: #fdf1e1;
            text-shadow: 0 0 12px rgba(253, 241, 225, 0.4);
            animation: pulse-badge 3s ease-in-out infinite;
        }

        @keyframes spin-clockwise {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @keyframes pulse-badge {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.15); opacity: 1; }
        }

        .story-panel-objectives {
            top: 40%;
            opacity: var(--panel-obj-opacity);
            transform: translate3d(-50%, var(--panel-obj-y), 0);
            width: min(800px, calc(100vw - 42px));
        }

        .objectives-cards {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
            margin-top: 32px;
            width: 100%;
        }

        .obj-card {
            padding: 20px;
            border-radius: 16px;
            background: rgba(253, 241, 225, 0.05);
            border: 1px solid rgba(253, 241, 225, 0.12);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            text-align: left;
            transition: transform 0.3s ease, background 0.3s ease;
        }

        .obj-card:hover {
            background: rgba(253, 241, 225, 0.1);
            transform: translateY(-2px);
        }

        .obj-card h4 {
            margin: 0 0 8px 0;
            font-size: 1.15rem;
            font-weight: 700;
            color: #fdf1e1;
        }

        .obj-card p {
            margin: 0;
            font-size: 0.9rem;
            font-weight: 400;
            line-height: 1.35;
            color: rgba(253, 241, 225, 0.76);
            text-shadow: none !important;
            width: 100% !important;
        }

        .objectives-desc {
            font-size: 1.05rem;
            font-weight: 400;
            line-height: 1.4;
            color: rgba(253, 241, 225, 0.9);
            margin: 12px auto 0 !important;
            text-shadow: 0 2px 14px rgba(0, 0, 0, 0.4) !important;
        }

        .facts {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 86px;
            width: min(470px, 100%);
            margin: 72px auto 0;
        }

        .facts dt {
            font-family: "Ogg Medium";
            font-size: 4.2rem;
            font-weight: 500;
            line-height: 0.9;
            text-shadow: 0 14px 34px var(--shadow);
        }

        .facts dd {
            margin: 18px 0 0;
            font-size: 1rem;
            font-weight: 500;
            line-height: 1.14;
            text-shadow: 0 2px 18px rgba(0, 0, 0, 0.42);
        }

        .note-button {
            min-height: 50px;
            margin-top: 28px;
            display: inline-flex;
            align-items: center;
            gap: 12px;
            padding: 0 28px;
            border-radius: 999px;
            color: var(--ink);
            background: #fdf1e1;
            box-shadow: 0 16px 34px rgba(0, 0, 0, 0.18);
            pointer-events: auto;
        }

        /* Media Queries */
        @media (max-width: 1500px) {
            .hero-title {
                font-size: 11rem;
            }

            .story-panel h2 {
                font-size: 4.1rem;
            }
        }

        @media (max-width: 1100px) {
            .sights-track {
                width: max-content;
                justify-content: flex-start;
            }
            .hero-title {
                top: 15vh;
                font-size: 7.5rem;
            }

            .bridge-img {
                width: 138vw;
            }

            .frame-two-img {
                width: 132vw;
            }

            .story-panel h2 {
                font-size: 3.2rem;
            }

            .facts {
                gap: 34px;
                margin-top: 44px;
            }

            .facts dt {
                font-size: 3.2rem;
            }

            .sight-card {
                flex-basis: clamp(320px, 40vw, 390px);
            }
        }

        @media (max-width: 640px) {
            .stage {
                min-height: 640px;
            }

            .site-header {
                grid-template-columns: 1fr auto;
                gap: 18px;
                padding: 24px;
            }

            .site-nav {
                grid-column: 1 / -1;
                grid-row: 2;
                justify-content: flex-start;
                gap: 18px;
                overflow-x: auto;
                scrollbar-width: none;
            }

            .site-nav::-webkit-scrollbar {
                display: none;
            }

            .hero-title {
                top: 16vh;
                font-size: 4.5rem;
            }

            .bridge-img {
                bottom: 2vh;
                width: 190vw;
            }

            .frame-two-img {
                width: 176vw;
            }

            .intro-copy {
                bottom: 42px;
            }

            .intro-copy p,
            .story-panel p {
                font-size: 1rem;
            }

            .story-panel h2 {
                font-size: 2.45rem;
            }

            .facts dt {
                font-size: 2.5rem;
            }

            .sight-card {
                flex-basis: min(82vw, 330px);
            }

            .sights-controls {
                top: calc(var(--sights-screen-top) + 236px);
            }

            .objectives-cards {
                grid-template-columns: 1fr;
                gap: 12px;
                margin-top: 20px;
            }
            .obj-card {
                padding: 12px;
            }
            .obj-card h4 {
                font-size: 1.05rem;
                margin-bottom: 4px;
            }
            .obj-card p {
                font-size: 0.85rem;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            html {
                scroll-behavior: auto;
            }

            .scene-img,
            .back-stack,
            .hero-title,
            .intro-copy,
            .story-panel,
            .sights-track,
            .sights-slider {
                transition: none;
            }
        }

        .top-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 10000;
            height: 76px;
            display: flex;
            align-items: center;
            padding: 0 40px;
            background: transparent;
        }

        .top-logo {
            height: 60px;
            width: auto;
            object-fit: contain;
            position: absolute;
            left: 40px;
        }

        .top-nav {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            gap: clamp(24px, 2.2vw, 44px);
        }

        .top-btn {
            font-family: inherit;
            font-size: 20px;
            font-weight: 400;
            line-height: 1;
            color: rgba(255, 255, 255, 0.85);
            text-shadow: 0 2px 16px rgba(0, 0, 0, 0.40);
            transition: color 0.25s ease, opacity 0.25s ease;
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
        }

        .top-btn:hover {
            color: rgba(255, 255, 255, 1);
        }

        .nav-dropdown {
            position: relative;
            display: inline-block;
        }

        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(10px);
            background: rgba(11, 34, 65, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(191, 165, 123, 0.3);
            border-radius: 8px;
            padding: 12px 0;
            min-width: 180px;
            display: flex;
            flex-direction: column;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 1000;
        }

        .nav-dropdown:hover .dropdown-menu {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(0);
        }

        .dropdown-menu a {
            color: rgba(255, 255, 255, 0.85);
            text-decoration: none;
            padding: 10px 24px;
            font-size: 16px;
            transition: all 0.2s ease;
            text-align: center;
        }

        .dropdown-menu a:hover {
            color: #bfa57b;
            background: rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 768px) {
            .top-bar {
                height: 64px;
                padding: 0 16px;
            }
            .top-logo {
                height: 44px;
                left: 16px;
            }
            .top-nav {
                margin-left: auto;
                margin-right: 0;
                gap: 14px;
            }
            .top-btn {
                font-size: 14px;
            }
        }
      ` }} />

      <main className="site-shell">
        <section className="cinema-scroll" id="cinema" aria-label="Royal Orchard cinematic scroll story">
          <div className="stage">
            <div className="world">
              <img
                className="scene-img sky-img"
                src="https://raft-blast-61784561.figma.site/_assets/v11/16b5007d9c93971e26ffe4e0e3e37946f6bd538c.png"
                alt=""
              />

              <div className="back-stack">
                <img
                  className="scene-img back-img back-four"
                  src="https://raft-blast-61784561.figma.site/_assets/v11/8a7f8af50e0ce92ec2e228e7b0b4112178c51cf1.png"
                  alt=""
                />
                <section className="sights-slider" aria-label="Royal Orchard projects slider">
                  <div className="sights-track">
                    {/* JS Injected */}
                  </div>
                </section>
                <img
                  className="scene-img back-img back-bazaar"
                  src="https://raft-blast-61784561.figma.site/_assets/v11/864afe00e41e2fa20a5aa546e15cb807e0f81384.png"
                  alt=""
                />
              </div>

              <div className="sights-controls" aria-label="Slider controls">
                <button className="sight-nav sight-prev" aria-label="Previous sight">←</button>
                <button className="sight-nav sight-next" aria-label="Next sight">→</button>
              </div>

              <h1 className="hero-title">WELCOME</h1>

              <img
                className="scene-img bridge-img"
                src="https://raft-blast-61784561.figma.site/_assets/v11/c6a6d8ef49bca43f708aa852692942c45ec950d4.png"
                alt=""
              />
              <img
                className="scene-img frame-two-img"
                src="https://raft-blast-61784561.figma.site/_assets/v11/ba75252bab2b1c510987b74837770f7bc8a6b2d4.png"
                alt=""
              />

              <img
                className="scene-img splitframe-img splitframe-left"
                src="https://raft-blast-61784561.figma.site/_assets/v11/7536d7b60a1fce482cf6edf3f0bffd3bad5d0f8a.png"
                alt=""
              />
              <img
                className="scene-img splitframe-img splitframe-right"
                src="https://raft-blast-61784561.figma.site/_assets/v11/392db6a6a6b98e868bd7f8d3f55bb719d51e5028.png"
                alt=""
              />

              <div className="shade"></div>
            </div>

            <section className="intro-copy" aria-label="Royal Orchard overview">
              <p>Royal orchard housing schemes are a well-recognized name the league of high–end housing projects across Pakistan. Unmatched in structural planning, design and civic facilities, the projects are a master piece of modern construction and unique features of international standards</p>
            </section>

            <section className="story-panel story-panel-bridge" aria-label="Who We Are details">
              <h2>Who We Are</h2>
              <p>Royal Developers & Builders (Pvt) Limited is specialized in constructing world-class housing facilities.</p>
              <dl className="facts">
                <div>
                  <dt>3+</dt>
                  <dd>Projects</dd>
                </div>
                <div>
                  <dt>10,000+</dt>
                  <dd>Members</dd>
                </div>
              </dl>
            </section>

            <section className="story-panel story-panel-objectives" aria-label="Objectives details">
              <h2>Objectives</h2>
              <p className="objectives-desc">Believing is gradual but sustained success Royal Developers & Builders is focusing on off-mainstream development markets. It also speaks for our commitment to the development of the less and underserved regions of Pakistan.</p>
              <p className="objectives-desc">With more & more landmark projects delivery is to be recognized as a hallmark of constructing world-class housing facilities & gated communities.</p>
              <div className="objectives-cards">
                <div className="obj-card">
                  <h4>No Compromise</h4>
                  <p>To be known for uncompromising excellence delivered in unbelievable time.</p>
                </div>
                <div className="obj-card">
                  <h4>Quality Team</h4>
                  <p>Experienced & expert team of town planners, architects, engineers and marketers.</p>
                </div>
                <div className="obj-card">
                  <h4>Lucrative & Secure</h4>
                  <p>Offering most lucrative return on investment with most secure & affordable financial feasibilities.</p>
                </div>
                <div className="obj-card">
                  <h4>Creativity</h4>
                  <p>Specialists in concept, design, development, building, sales & delivery.</p>
                </div>
              </div>
            </section>

            <section className="story-panel story-panel-bazaar" aria-label="Mission and Vision details">
              <div className="mission-vision-container">
                <div className="mv-block">
                  <h2>Mission</h2>
                  <p>To develop quality projects meeting the modern housing trends and highest living standards of town planning, engineering, aesthetically landscape and homes designing and constructions is our mission. Team of Top Professionals of Real Estate Developers is combined to achieve this goal.</p>
                </div>
                <div className="mv-block">
                  <h2>Vision</h2>
                  <p>To develop quality projects meeting the modern housing trends and highest living standards of town planning, engineering, aesthetically landscape and homes designing and constructions is our mission. Team of Top Professionals of Real Estate Developers is combined to achieve this goal.</p>
                </div>
              </div>
              <div className="rolling-badge">
                <svg viewBox="0 0 100 100" width="120" height="120">
                  <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                  <text>
                    <textPath href="#circlePath" startOffset="0%">
                      Over 10 years+ of experience • Over 10 years+ of experience • 
                    </textPath>
                  </text>
                </svg>
                <div className="badge-center-icon">★</div>
              </div>
            </section>

            <section className="story-panel story-panel-features" aria-label="Key Features details">
              <h2>OUR KEY FEATURES</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-img-wrapper">
                    <img src="/KeyFeatures/1k.jpeg" alt="Magestic Entrance" />
                  </div>
                  <h3>Magestic Entrance</h3>
                </div>
                <div className="feature-card">
                  <div className="feature-img-wrapper">
                    <img src="/KeyFeatures/2k.jpg" alt="Main boulevard" />
                  </div>
                  <h3>Main boulevard</h3>
                </div>
                <div className="feature-card">
                  <div className="feature-img-wrapper">
                    <img src="/KeyFeatures/3k.jpg" alt="CCTV Monitoring" />
                  </div>
                  <h3>CCTV Monitoring</h3>
                </div>
                <div className="feature-card">
                  <div className="feature-img-wrapper">
                    <img src="/KeyFeatures/4k.jpeg" alt="Sports" />
                  </div>
                  <h3>Sports</h3>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
