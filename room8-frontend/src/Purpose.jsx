import React from "react";
import { Link } from "react-router-dom";
import "./css/purpose.css";
import "./css/style.css";

export default function Purpose() {
  return (
    <div className="purpose-container">
      {/* Section 1: Problem Statement */}
      <section className="purpose-section section-dark" id="section1">
        <div className="section-content">
          <h2 className="section-title">Our Purpose</h2>
          <h3 className="section-subtitle">Roommate assignments are still stuck in the past</h3>

          <div className="animated-keywords">
            <div className="keyword" data-delay="1">
              <span className="keyword-text">random</span>
            </div>
            <div className="keyword" data-delay="1.7">
              <span className="keyword-text">rushed</span>
            </div>
            <div className="keyword" data-delay="2.4">
              <span className="keyword-text">completely mismatched</span>
            </div>
          </div>

          <div className="scroll-indicator">
            <span>Scroll Down</span>
            <div className="scroll-arrow">↓</div>
          </div>
        </div>
      </section>

      {/* Section 2: Mission Statement */}
      <section className="purpose-section section-light" id="section2">
        <div className="section-content">
          <h3 className="section-subtitle fade-in">We're changing that.</h3>
          <p className="section-text slide-in">
            Room8 uses modern matchmaking technology to pair roommates based on lifestyle,
            habits, and preferences — creating harmonious living situations from day one.
          </p>
          <div className="scroll-indicator">
            <span>Continue</span>
            <div className="scroll-arrow">↓</div>
          </div>
        </div>
      </section>

      {/* Section 3: Values */}
      <section className="purpose-section section-purple" id="section3">
        <div className="section-content">
          <h3 className="section-subtitle scale-in">Our Values</h3>

          <div className="values-container">
            <div className="value-item fade-in-up" data-delay="0.1">
              <div className="value-icon">🏠</div>
              <h4>Compatibility First</h4>
              <p>We prioritize meaningful compatibility over superficial connections.</p>
            </div>

            <div className="value-item fade-in-up" data-delay="0.3">
              <div className="value-icon">🤝</div>
              <h4>Transparent Matching</h4>
              <p>Our process is clear and honest, with no hidden algorithms.</p>
            </div>

            <div className="value-item fade-in-up" data-delay="0.5">
              <div className="value-icon">🛡️</div>
              <h4>Safety & Trust</h4>
              <p>Every profile is verified, creating a community of trust.</p>
            </div>
          </div>

          <div className="scroll-indicator">
            <span>Almost there</span>
            <div className="scroll-arrow">↓</div>
          </div>
        </div>
      </section>

      {/* Section 4: Call to Action */}
      <section className="purpose-section section-gradient" id="section4">
        <div className="section-content">
          <h3 className="section-subtitle bounce-in">Ready to find your perfect Room8?</h3>
          <div className="cta-container">
            <Link to="/find" className="cta-button pulse">Find My Match</Link>
          </div>
          <p className="section-footer fade-in-up">
            Join thousands who’ve found their ideal living situation through Room8.
          </p>
        </div>
      </section>

      {/* Simple page dots */}
      <div className="page-navigation">
        <div className="nav-dot" data-section="1"></div>
        <div className="nav-dot" data-section="2"></div>
        <div className="nav-dot" data-section="3"></div>
        <div className="nav-dot" data-section="4"></div>
      </div>
    </div>
  );
}