import "./App.css";
import logo from "./assets/room8_logo_transparent.png";
import { useEffect, useState } from "react";

function App() {
    const [fadeIn, setFadeIn] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setFadeIn(true);
    }, []);

    return (
        <div className="hero-container">
            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="logo">
                    <img src={logo} alt="Room8 Logo" />
                </div>

                {/* Brand Name in Center */}
                <div className="brand-name">Room8</div>

                {/* Hamburger Menu Icon (Visible on Mobile) */}
                <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                    ☰
                </div>

                {/* Navigation Links */}
                <ul className={`nav-links ${menuOpen ? "nav-active" : ""}`}>
                    <li><a href="#home">Home</a></li>
                    <li><a href="#purpose">Purpose</a></li>
                    <li><a href="#how-it-works">How It Works</a></li>
                    <li className="about-link"><a href="#about">About</a></li>
                </ul>
            </nav>

            {/* Hero Section */}
            <div className={`hero-content ${fadeIn ? "fade-in" : ""}`}>
                <h1 className="hero-title">Match. Connect. Thrive.</h1>
                <p className="hero-subtitle">
                    Find the perfect roommate with modern match-making technology.
                </p>
                <a href="#purpose" className="cta-button">Start Matching</a>
            </div>
        </div>
    );
}

export default App;
