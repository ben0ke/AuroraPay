class CustomFooter extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: #0f172a;
          color: #e2e8f0;
          padding: 4rem 2rem;
          margin-top: 4rem;
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .footer-logo img {
          height: 2rem;
        }
        .footer-logo-text {
          font-weight: 700;
          font-size: 1.25rem;
          background: linear-gradient(to right, #38bdf8, #8b5cf6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .footer-about {
          max-width: 300px;
        }
        .footer-links h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #94a3b8;
        }
        .footer-links ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-links li {
          margin-bottom: 0.5rem;
        }
        .footer-links a {
          color: #cbd5e1;
          text-decoration: none;
          transition: color 0.3s;
        }
        .footer-links a:hover {
          color: #38bdf8;
        }
        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        .social-links a {
          color: #94a3b8;
          transition: color 0.3s;
          display: flex;
        }
        .social-links a:hover svg {
          stroke: #38bdf8;
        }
        .social-links svg {
          width: 24px;
          height: 24px;
          stroke: #94a3b8;
          fill: none;
          stroke-width: 2px;
        }
        .copyright {
          margin-top: 4rem;
          text-align: center;
          color: #64748b;
          font-size: 0.875rem;
        }
      </style>
      <div class="footer-container">
        <div class="footer-about">
          <div class="footer-logo">
            <img src="https://huggingface.co/spaces/ben0ke/aurorapay-p-nzvar-zsl-k-fiataloknak/resolve/main/images/auroralogo.png" alt="AuroraPay Logo">
            <span class="footer-logo-text">AuroraPay</span>
          </div>
          <p class="text-sm text-gray-400">Fiataloknak készült modern fintech megoldás, ami egyszerűvé és érthetővé teszi a pénzügyeket.</p>
          <div class="social-links">
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24"><path d="M18 2h-3a6 6 0 0 0-6 6v3H5v4h4v8h4v-8h3l1-4h-4V8a2 2 0 0 1 2-2h2z"/></svg>
            </a>
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4.36a9.86 9.86 0 0 1-3.13 1.2A4.48 4.48 0 0 0 16.88.28c-2.42 0-4.42 1.92-4.42 4.29s2 4.29 4.42 4.29a4.52 4.52 0 0 0 1.53-.27 10.86 10.86 0 0 1-7.87 2c-.32 0-.62-.02-.93-.07 2.44 1.56 5.35 2.49 8.47 2.49A13.79 13.79 0 0 0 23 3z"/></svg>
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><line x1="8" y1="11" x2="8" y2="16"/><line x1="8" y1="8" x2="8" y2="8"/><line x1="12" y1="16" x2="12" y2="11"/><path d="M12 14v-1a2 2 0 0 1 4 0v3"/></svg>
            </a>
          </div>
        </div>
        <div class="footer-links">
          <h3>Navigáció</h3>
          <ul>
            <li><a href="index.hmtl">Kezdőlap</a></li>
            <li><a href="about.html">Rólunk</a></li>
            <li><a href="financial-education.html">Pénzügyi oktatás</a></li>
            <li><a href="contact.html">Kapcsolat</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h3>Jogi információk</h3>
          <ul>
            <li><a href="#">Általános Szerződési Feltételek</a></li>
            <li><a href="#">Adatvédelmi irányelvek</a></li>
            <li><a href="#">Cookie szabályzat</a></li>
            <li><a href="#">Vásárlási feltételek</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h3>Kapcsolat</h3>
          <ul>
            <li><a href="mailto:info@aurorapay.hu">info@aurorapay.hu</a></li>
            <li><a href="tel:+36705256969">+36 70 525 6969</a></li>
            <li>2400 Dunaújváros, Táncsics Mihály u. 1/A</li>
          </ul>
        </div>
      </div>
      <div class="copyright">
        &copy; ${new Date().getFullYear()} AuroraPay. Minden jog fenntartva.
      </div>
    `;
  }
}
customElements.define('custom-footer', CustomFooter);
