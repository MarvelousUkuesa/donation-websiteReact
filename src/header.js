import React, { useState } from "react";
// The Link component is not used in this version, but I'll leave the import
// in case you need it for routing in other parts of your app.
// import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // The header element now only has the top-most SVG pattern as its background image.
  // The solid color is handled by a separate div.
  const headerStyle = {
    backgroundImage: `url('/images/header/yaam_divider_006.svg')`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <>
      {/*
        The header is now fixed to the top of the viewport and will not scroll.
        Key classes: 'fixed', 'top-0', 'left-0'.
      */}
      <header
        style={headerStyle}
        className="text-white flex items-center justify-between fixed top-0 left-0 z-30 w-full overflow-hidden min-h-[10vh]"
      >
        {/* This div provides the solid background color fill, replacing the previous image. */}
        <div
          style={{ backgroundColor: "#9A7B69" }}
          className="absolute top-0 left-0 w-full h-5/6 -z-20"
        />
        {/* This is the middle image layer, positioned on top of the solid color div. */}
        <img
          src="/images/header/yaam_divider_004.svg"
          alt="" // Alt text is empty as this is a purely decorative image
          className="absolute top-2 left-0 w-full h-full object-cover -z-10"
        />

        {/* Desktop Layout Container */}
        <div className="hidden md:flex items-center justify-between w-full px-8">
          {/* Left: Social Icons */}
          <div className="flex items-center space-x-4">
            <a
              href="https://www.instagram.com/yaam_berlin/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/header/insta_icon_001.svg"
                alt="Instagram"
                className="h-6 w-6 hover:opacity-75 transition-opacity"
              />
            </a>
            <a
              href="https://www.facebook.com/YAAM.Berlin"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/header/facebook_icon_001.svg"
                alt="Facebook"
                className="h-6 w-6 hover:opacity-75 transition-opacity"
              />
            </a>
            <a
              href="https://www.youtube.com/@TheYaamBerlin"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/header/youtube_icon_001.svg"
                alt="YouTube"
                className="h-6 w-6 hover:opacity-75 transition-opacity"
              />
            </a>
          </div>

          {/* Center: Desktop Navigation with Inline Logo */}
          <nav className="flex items-center justify-center space-x-8 flex-grow">
            <a href="#" className="hover:text-yellow-400 transition-colors">
              HOME
            </a>
            <a href="#" className="hover:text-yellow-400 transition-colors">
              YAAM
            </a>
            {/* Logo in the middle of the navigation */}
            <a href="https://yaam.de" className="text-2xl font-bold mx-4">
              <img
                src="/images/header/yaam_logo_001.svg"
                alt="YAAM Logo"
                className="h-16 sm:h-20"
              />
            </a>
            <a href="#" className="hover:text-yellow-400 transition-colors">
              PROGRAM
            </a>
            <a href="#" className="hover:text-yellow-400 transition-colors">
              KONTAKT
            </a>
          </nav>

          {/* Right: Language Switcher */}
          <div className="flex items-center space-x-3 text-sm">
            <a href="#" className="hover:text-yellow-400 transition-colors">
              English
            </a>
            <span>/</span>
            <a href="#" className="text-yellow-400 font-bold">
              Deutsch
            </a>
          </div>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="w-full flex justify-between items-center p-4 md:hidden">
          <a href="#">
            <img
              src="/images/header/yaam_logo_001.svg"
              alt="YAAM Logo"
              className="h-12"
            />
          </a>
          <button className="text-white" onClick={() => setIsMenuOpen(true)}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="#FFFFFF"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed top-0 right-0 h-full w-full bg-black bg-opacity-90 z-40 transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-white text-4xl"
          >
            &times;
          </button>
        </div>
        <nav className="flex flex-col items-center justify-center h-full space-y-8 text-2xl">
          <a
            href="#"
            className="text-white hover:text-yellow-400"
            onClick={() => setIsMenuOpen(false)}
          >
            HOME
          </a>
          <a
            href="#"
            className="text-white hover:text-yellow-400"
            onClick={() => setIsMenuOpen(false)}
          >
            YAAM
          </a>
          <a
            href="#"
            className="text-white hover:text-yellow-400"
            onClick={() => setIsMenuOpen(false)}
          >
            PROGRAMM
          </a>
          <a
            href="#"
            className="text-white hover:text-yellow-400"
            onClick={() => setIsMenuOpen(false)}
          >
            KONTAKT
          </a>
        </nav>
      </div>

      {/* This div acts as a placeholder. Since the header is fixed, it's removed
        from the normal page flow. This placeholder takes up the same amount of
        vertical space as the header, pushing the rest of your main content down
        so it isn't hidden underneath the header.
      */}
      <div className="min-h-[10vh]" />
    </>
  );
};

export default Header;
