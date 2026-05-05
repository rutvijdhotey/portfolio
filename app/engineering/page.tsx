'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LaCuriosityPipeline from '@/components/LaCuriosityPipeline'
import './engineering.css'

gsap.registerPlugin(ScrollTrigger)

export default function EngineeringPage() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance: nav items
      gsap.from('.nav-back, .nav-name, .nav-section', {
        opacity: 0,
        y: -10,
        duration: 1,
        ease: 'power3.out',
        delay: 0.2,
        stagger: 0.08,
      })

      // Entrance: hero content
      gsap.from('.hero-eyebrow', {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: 'power3.out',
        delay: 0.3,
      })
      gsap.from('.hero-title', {
        opacity: 0,
        y: 40,
        duration: 1.3,
        ease: 'power3.out',
        delay: 0.5,
      })
      gsap.from('.hero-desc', {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: 'power3.out',
        delay: 0.75,
      })
      gsap.from('.hero-stats > *', {
        opacity: 0,
        y: 12,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.88,
        stagger: 0.08,
      })
      gsap.from('.hero-tags', {
        opacity: 0,
        y: 16,
        duration: 0.9,
        ease: 'power3.out',
        delay: 1.05,
      })
      gsap.from('.hero-cta', {
        opacity: 0,
        y: 12,
        duration: 0.9,
        ease: 'power3.out',
        delay: 1.2,
      })

      // Scroll: agent tech section
      gsap.from('.agent-section > *', {
        scrollTrigger: { trigger: '.agent-section', start: 'top 80%' },
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
      })

      // Scroll: about strip
      gsap.from('.about > *', {
        scrollTrigger: { trigger: '.about', start: 'top 80%' },
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.15,
      })

      // Scroll: credentials
      gsap.from('.cred-section', {
        scrollTrigger: { trigger: '.credentials', start: 'top 75%' },
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
      })

      // Scroll: footer
      gsap.from('footer > *', {
        scrollTrigger: { trigger: 'footer', start: 'top 90%' },
        opacity: 0,
        y: 16,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <>
      {/* NAV */}
      <nav className="engineering-nav">
        <Link href="/" className="nav-back">← Home</Link>
        <Link href="/" className="nav-name">Rutvij Dhotey</Link>
        <div className="nav-right">
          <a href="https://linkedin.com/in/rutvij-dhotey" className="nav-social" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://github.com/rutvijdhotey" className="nav-social" target="_blank" rel="noopener">GitHub</a>
          <span className="nav-section">Engineering</span>
        </div>
      </nav>

      {/* HERO: LACURIOSITY */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-grid"></div>

        <div className="hero-content">
          <p className="hero-eyebrow">Featured Project · 01</p>
          <h1 className="hero-title">LaCuriosity</h1>
          <p className="hero-desc">
            A fully automated editorial platform publishing daily long-form articles across five
            thematic streams — Science, Psychology, Technology, Mathematics, and Ecology — each
            driven by a specialized Claude instance with its own persona, research mandate,
            and visual identity.
          </p>
          <p className="hero-desc hero-desc--last">
            The pipeline handles everything without human intervention: demand-signal research via
            Tavily and Reddit, multi-agent drafting and fact-checking, Risograph-style image
            generation with Gemini, voiceover via ElevenLabs, video assembly via Creatomate, and
            distribution through Ghost CMS, email, and social. One daily trigger. Fifty-five nodes.
            Zero human touchpoints.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">5</div>
              <div className="hero-stat-label">Editorial Streams</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">55</div>
              <div className="hero-stat-label">Automation Nodes</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">0</div>
              <div className="hero-stat-label">Human Touchpoints</div>
            </div>
          </div>

          <div className="hero-tags">
            <span className="tag">Claude API</span>
            <span className="tag">Gemini API</span>
            <span className="tag">Make.com</span>
            <span className="tag">Ghost CMS</span>
            <span className="tag">Supabase</span>
            <span className="tag">ElevenLabs</span>
            <span className="tag">Prompt Engineering</span>
          </div>
          <a href="https://lacuriosity.com" className="hero-cta" target="_blank" rel="noopener">
            View Project <span>→</span>
          </a>
        </div>

        <span className="hero-scroll-hint">Scroll to explore</span>
      </section>

      {/* ARCHITECTURE */}
      <section className="arch-section">
        <div className="arch-header">
          <span className="arch-section-label">Pipeline Architecture</span>
          <span className="arch-section-meta">Make.com · 55 nodes · 1 daily trigger</span>
        </div>
        <LaCuriosityPipeline />
      </section>

      {/* AGENT TECH ENGINEER */}
      <section className="agent-section">
        <div className="agent-label">Featured Idea · 02</div>
        <div className="agent-body">
          <h2 className="agent-title">Agentic<br />Engineer</h2>
          <div className="agent-right">
            <p className="agent-desc">
              Beyond writing code — I design and ship systems where multiple AI tools
              talk to each other. A trigger fires, models research, draft, fact-check,
              generate, and publish. The outcome arrives. No hand-holding required.
            </p>
            <p className="agent-desc">
              The craft is knowing which tool to reach for, how to chain them across
              APIs, and how to wire them so the whole thing holds together under real
              conditions. LLMs, voice synthesis, image generation, automation platforms
              — composed into a single outcome-driven system.
            </p>
            <div className="agent-capabilities">
              <span className="agent-cap">Multi-Agent Orchestration</span>
              <span className="agent-cap">LLM Pipelines</span>
              <span className="agent-cap">Tool Chaining</span>
              <span className="agent-cap">Workflow Automation</span>
              <span className="agent-cap">API Integration</span>
              <span className="agent-cap">Outcome-Driven Systems</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT STRIP */}
      <div className="rule"></div>
      <section className="about">
        <div className="about-role">
          Software Engineer<br />
          YouTube · Google<br />
          Sunnyvale, CA
        </div>
        <p className="about-bio">
          Building systems that scale to billions at YouTube —
          and shipping AI products from scratch on the side.
        </p>
        <div className="about-location">
          rutvij.dhotey<br />
          @gmail.com<br />
          <a href="https://github.com/rutvijdhotey" style={{ color: 'inherit', textDecoration: 'none' }} rel="noopener">github ↗</a>
        </div>
      </section>

      {/* CREDENTIALS */}
      <section className="credentials">

        {/* LEFT: Experience + Education */}
        <div className="cred-col">

          <div className="cred-section">
            <p className="cred-label">Experience</p>

            <div className="exp-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="entry-logo"
                src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
                alt="YouTube"
                style={{ objectFit: 'contain', background: 'rgba(240,237,232,0.07)', borderRadius: '6px', padding: '10px' }}
              />
              <div className="entry-info">
                <div className="exp-company">YouTube</div>
                <div className="exp-role">Software Engineer</div>
                <div className="exp-date">Current · Sunnyvale, CA</div>
              </div>
            </div>

            <div className="exp-item">
              <svg className="entry-logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="6" fill="rgba(240,237,232,0.07)" />
                <circle cx="20" cy="19" r="9" stroke="rgba(240,237,232,0.55)" strokeWidth="1.2" />
                <circle cx="20" cy="19" r="4.5" stroke="rgba(240,237,232,0.35)" strokeWidth="1" />
                <line x1="20" y1="10" x2="20" y2="14" stroke="rgba(240,237,232,0.4)" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="20" y1="24" x2="20" y2="28" stroke="rgba(240,237,232,0.4)" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="11" y1="19" x2="15" y2="19" stroke="rgba(240,237,232,0.4)" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="25" y1="19" x2="29" y2="19" stroke="rgba(240,237,232,0.4)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <div className="entry-info">
                <div className="exp-company">LaCuriosity</div>
                <div className="exp-role">Founder {' & '} Engineer</div>
                <div className="exp-date">Side Project</div>
              </div>
            </div>
          </div>

          <div className="cred-section">
            <p className="cred-label">Education</p>

            <div className="edu-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="entry-logo"
                src="https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Penn_State_Nittany_Lions_logo.svg/250px-Penn_State_Nittany_Lions_logo.svg.png"
                alt="Penn State"
                style={{ objectFit: 'contain', background: 'rgba(240,237,232,0.07)', borderRadius: '6px', padding: '4px' }}
              />
              <div className="entry-info">
                <div className="edu-school">Penn State University</div>
                <div className="edu-degree">M.Eng. Computer Science {' & '} Engineering</div>
                <div className="edu-date">2015 – 2016 · GPA 3.45 · ML {' & '} Computer Vision</div>
              </div>
            </div>

            <div className="edu-item">
              <svg className="entry-logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="6" fill="rgba(240,237,232,0.07)" />
                <circle cx="20" cy="20" r="16" stroke="#8a9bb5" strokeWidth="0.9" />
                <circle cx="20" cy="20" r="13.8" stroke="#6b7e9a" strokeWidth="0.5" />
                <circle cx="20" cy="20" r="10" stroke="#7a9fc4" strokeWidth="0.9" />
                <ellipse cx="20" cy="20" rx="5.5" ry="10" stroke="#6b8fb5" strokeWidth="0.7" />
                <ellipse cx="20" cy="20" rx="10" ry="5.5" stroke="#6b8fb5" strokeWidth="0.7" />
                <text x="20" y="22.5" fontFamily="Helvetica Neue, Arial, sans-serif" fontSize="5.5" fontWeight="700" fill="#a8bdd4" textAnchor="middle" letterSpacing="1">PICT</text>
              </svg>
              <div className="entry-info">
                <div className="edu-school">Pune Institute of Computer Technology</div>
                <div className="edu-degree">B.E. Electrical, Electronics {' & '} Communications Engineering</div>
                <div className="edu-date">2011 – 2015 · Grade A+ · Embedded Systems {' & '} RTOS</div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT: Skills + Achievements */}
        <div className="cred-col">

          <div className="cred-section">
            <p className="cred-label">Skills</p>

            <div className="skills-group">
              <div className="skills-group-label">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="2.2" stroke="rgba(240,237,232,0.4)" strokeWidth="1.1" />
                  <circle cx="1.8" cy="3.5" r="1.3" stroke="rgba(240,237,232,0.25)" strokeWidth="1" />
                  <circle cx="12.2" cy="3.5" r="1.3" stroke="rgba(240,237,232,0.25)" strokeWidth="1" />
                  <circle cx="1.8" cy="10.5" r="1.3" stroke="rgba(240,237,232,0.25)" strokeWidth="1" />
                  <circle cx="12.2" cy="10.5" r="1.3" stroke="rgba(240,237,232,0.25)" strokeWidth="1" />
                  <line x1="4.8" y1="5.8" x2="3.1" y2="4.5" stroke="rgba(240,237,232,0.2)" strokeWidth="1" />
                  <line x1="9.2" y1="5.8" x2="10.9" y2="4.5" stroke="rgba(240,237,232,0.2)" strokeWidth="1" />
                  <line x1="4.8" y1="8.2" x2="3.1" y2="9.5" stroke="rgba(240,237,232,0.2)" strokeWidth="1" />
                  <line x1="9.2" y1="8.2" x2="10.9" y2="9.5" stroke="rgba(240,237,232,0.2)" strokeWidth="1" />
                </svg>
                AI / ML
              </div>
              <div className="skills-list">
                <span className="skill-chip">Claude API</span>
                <span className="skill-chip">Gemini API</span>
                <span className="skill-chip">Prompt Engineering</span>
                <span className="skill-chip">LLM Orchestration</span>
                <span className="skill-chip">Deep Learning</span>
                <span className="skill-chip">Computer Vision</span>
                <span className="skill-chip">Neural Networks</span>
              </div>
            </div>

            <div className="skills-group">
              <div className="skills-group-label">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4.5 3L1 7L4.5 11" stroke="rgba(240,237,232,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.5 3L13 7L9.5 11" stroke="rgba(240,237,232,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="8.5" y1="2" x2="5.5" y2="12" stroke="rgba(240,237,232,0.25)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Languages
              </div>
              <div className="skills-list">
                <span className="skill-chip">Python</span>
                <span className="skill-chip">JavaScript</span>
                <span className="skill-chip">C++</span>
              </div>
            </div>

            <div className="skills-group">
              <div className="skills-group-label">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <ellipse cx="7" cy="4" rx="5" ry="1.8" stroke="rgba(240,237,232,0.4)" strokeWidth="1.1" />
                  <path d="M2 4V7.5C2 8.6 4.2 9.5 7 9.5C9.8 9.5 12 8.6 12 7.5V4" stroke="rgba(240,237,232,0.4)" strokeWidth="1.1" />
                  <path d="M2 7.5V11C2 12.1 4.2 13 7 13C9.8 13 12 12.1 12 11V7.5" stroke="rgba(240,237,232,0.25)" strokeWidth="1.1" />
                </svg>
                Web {' & '} Data
              </div>
              <div className="skills-list">
                <span className="skill-chip">React.js</span>
                <span className="skill-chip">Django</span>
                <span className="skill-chip">Supabase</span>
                <span className="skill-chip">REST APIs</span>
                <span className="skill-chip">Tailwind CSS</span>
              </div>
            </div>
          </div>

          <div className="cred-section">
            <p className="cred-label">Recognition</p>

            <div className="achievement-item">
              <span className="achievement-mark">01</span>
              <span className="achievement-text">
                <strong>US Patent</strong> — &ldquo;Verified Video Reviews&rdquo; (US 20210158371), filed 2019
              </span>
            </div>

            <div className="achievement-item">
              <span className="achievement-mark">02</span>
              <span className="achievement-text">
                <strong>Google Developer Challenge Scholarship</strong> — selected from 100,000+ applicants, 2018
              </span>
            </div>

            <div className="achievement-item">
              <span className="achievement-mark">03</span>
              <span className="achievement-text">
                <strong>Robotics National Winner</strong> — IISC Bangalore, 2015
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* CONTACT */}
      <section className="contact">
        <div className="contact-label">Get in touch</div>
        <a href="mailto:rutvij.dhotey@gmail.com" className="contact-email">
          rutvij.dhotey@gmail.com
        </a>
      </section>

      {/* FOOTER */}
      <footer className="engineering-footer">
        <span className="footer-name">© 2026 Rutvij Dhotey</span>
        <nav className="footer-links">
          <a href="https://linkedin.com/in/rutvij-dhotey" className="footer-link" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://github.com/rutvijdhotey" className="footer-link" target="_blank" rel="noopener">GitHub</a>
          <Link href="/" className="footer-link">← Home</Link>
        </nav>
      </footer>
    </>
  )
}
