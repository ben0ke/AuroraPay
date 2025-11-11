class CustomHeader extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: fixed;
          top: 0;
          width: 100%;
          background: linear-gradient(to right, #0f172a, #1e293b);
          color: white;
          padding: 1rem;
          text-align: center;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          background: linear-gradient(to right, #38bdf8, #8b5cf6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        h1::-webkit-background-clip {
          color: transparent;
        }
        h1.fallback {
          background: none;
          color: #38bdf8;
        }
      </style>
      <h1 role="banner">AuroraPay - Modern Fintech Fiataloknak</h1>
    `;
  }
}

customElements.define('custom-header', CustomHeader);
