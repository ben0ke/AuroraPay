class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          position: fixed;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .header {
          background: linear-gradient(to right, #0f172a, #1e293b);
          padding: 1rem 2rem;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          color: #e2e8f0;
        }
        nav {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }
        .logo img {
          height: 2rem;
        }
        .logo-text {
          font-weight: 700;
          font-size: 1.25rem;
          background: linear-gradient(to right, #38bdf8, #8b5cf6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        .nav-links a {
          color: #e2e8f0;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
          position: relative;
        }
        .nav-links a:hover {
          color: #38bdf8;
        }
        .nav-links a.active {
          color: #8b5cf6;
        }
        .nav-links a.active:after {
          content: '';
          position: absolute;
          bottom: -0.5rem;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, #38bdf8, #8b5cf6);
        }
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background: rgba(15, 23, 42, 0.95);
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .mobile-menu.active {
          display: block;
        }
        .mobile-menu a {
          display: block;
          padding: 0.75rem 0;
          color: #e2e8f0;
          text-decoration: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .mobile-menu a:last-child {
          border-bottom: none;
        }
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .mobile-menu-btn {
            display: block;
          }
        }
      </style>
      <div class="header">
        <h1>AuroraPay - Modern Fintech Fiataloknak</h1>
      </div>
      <nav>
        <a href="index.html" class="logo">
          <img src="https://huggingface.co/spaces/ben0ke/aurorapay-p-nzvar-zsl-k-fiataloknak/resolve/main/images/auroralogo.png" alt="AuroraPay Logo">
          <span class="logo-text">AuroraPay</span>
        </a>
        <button class="mobile-menu-btn" id="menuToggle">
          <i data-feather="menu"></i>
        </button>
        <div class="mobile-menu" id="mobileMenu">
          <a href="index.html" class="active">Kezdőlap</a>
          <a href="about.html">Rólunk</a>
          <a href="financial-education.html">Oktatás</a>
          <a href="contact.html">Kapcsolat</a>
          <a href="index.html#signup" class="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-full transition duration-300 block text-center">Regisztráció</a>
        </div>
        <div class="nav-links">
          <a href="index.html" class="active">Kezdőlap</a>
          <a href="about.html">Rólunk</a>
          <a href="financial-education.html">Oktatás</a>
          <a href="contact.html">Kapcsolat</a>
          <a href="index.html#signup" class="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-full transition duration-300">Regisztráció</a>
        </div>
      </nav>
    `;

    // Wait for feather icons to be present, then replace them
    if (window.feather) {
      window.feather.replace();
    }

    // Mobile menu toggle
    const menuToggle = this.shadowRoot.getElementById('menuToggle');
    const mobileMenu = this.shadowRoot.getElementById('mobileMenu');

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', (e) => {
        mobileMenu.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
          icon.setAttribute('data-feather', 'x');
        } else {
          icon.setAttribute('data-feather', 'menu');
        }
        if (window.feather) {
          window.feather.replace();
        }
        e.stopPropagation();
      });

      // Close menu when clicking outside the navbar
      document.addEventListener('click', (e) => {
        // Only act if menu is open and click is outside the custom element
        if (!this.contains(e.target) && !this.shadowRoot.contains(e.target) && mobileMenu.classList.contains('active')) {
          mobileMenu.classList.remove('active');
          const icon = menuToggle.querySelector('i');
          icon.setAttribute('data-feather', 'menu');
          if (window.feather) {
            window.feather.replace();
          }
        }
      });
    }
  }
}

customElements.define('custom-navbar', CustomNavbar);
