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
        }
        .social-links a:hover {
          color: #38bdf8;
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
            <a href="#" aria-label="Facebook"><i data-feather="facebook"></i></a>
            <a href="#" aria-label="Instagram"><i data-feather="instagram"></i></a>
            <a href="#" aria-label="Twitter"><i data-feather="twitter"></i></a>
            <a href="#" aria-label="LinkedIn"><i data-feather="linkedin"></i></a>
          </div>
        </div>
        <div class="footer-links">
          <h3>Navigáció</h3>
          <ul>
            <li><a href="/">Kezdőlap</a></li>
            <li><a href="/about.html">Rólunk</a></li>
            <li><a href="/financial-education.html">Pénzügyi oktatás</a></li>
            <li><a href="/contact.html">Kapcsolat</a></li>
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
            <li><a href="tel:+3612345678">+36 1 234 5678</a></li>
            <li>1061 Budapest, Andrássy út 1.</li>
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