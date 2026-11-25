/* ==========================================================================
   SHOWROOM DESIGN SYSTEM & BETHA SISTEMAS BRAND TOKENS
   ========================================================================== */
:root {
  color-scheme: light;

  /* Surfaces */
  --background: #f8fafc;
  --surface-container-low: #ffffff;
  --surface-container: #f1f5f9;
  --surface-container-high: #e2e8f0;
  --surface-container-highest: #cbd5e1;

  /* Inks */
  --on-surface: #0f172a;
  --on-surface-variant: #475569;
  --on-surface-muted: #64748b;

  /* Rules & Borders */
  --outline: #cbd5e1;
  --outline-variant: #e2e8f0;
  --outline-subtle: #f1f5f9;

  /* Betha Brand Colors & Accents */
  --primary: #0066cc;
  --primary-hover: #0052a3;
  --primary-active: #003d7a;
  --on-primary: #ffffff;
  --primary-container: #ebf5ff;
  --on-primary-container: #004d99;

  --secondary: #d97706;
  --secondary-container: #fef3c7;
  --on-secondary-container: #92400e;

  --tertiary: #0f172a;
  --on-tertiary: #ffffff;

  --positive: #16a34a;
  --positive-container: #dcfce7;
  --on-positive-container: #14532d;

  --warning: #ca8a04;
  --warning-container: #fef9c3;
  --on-warning-container: #713f12;

  --error: #dc2626;
  --error-container: #fee2e2;
  --on-error: #ffffff;

  --focus: #0066cc;

  /* Typography */
  --font-headline: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-label: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  --display-size: clamp(1.75rem, 1.4rem + 1.2vw, 2.25rem);
  --headline-size: clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem);
  --subhead-size: clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem);
  --body-size: clamp(0.9375rem, 0.9rem + 0.15vw, 1rem);
  --label-size: 0.75rem;

  --headline-tracking: -0.035em;
  --figure-tracking: -0.03em;

  /* Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;

  /* Radii */
  --rounded: 9999px;
  --rounded-sm: 0.5rem;
  --rounded-md: 0.875rem;
  --rounded-lg: 1.25rem;
  --rounded-xl: 1.75rem;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.05);
  --shadow-lg: 0 12px 32px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.06);
  --shadow-tooltip: 0 14px 34px -4px rgba(0, 102, 204, 0.18), 0 6px 16px -2px rgba(15, 23, 42, 0.08);

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --dur-long: 420ms;
}

/* ==========================================================================
   BASE RESET & LAYOUT
   ========================================================================== */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
  overflow-x: clip;
  background-color: var(--background);
  color: var(--on-surface);
  font-family: var(--font-body);
  font-size: var(--body-size);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

button, input, select, textarea {
  font-family: inherit;
  color: inherit;
}

button:focus-visible, input:focus-visible, select:focus-visible, [tabindex]:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
  position: relative;
}

/* ==========================================================================
   TOP MASTHEAD & CONTROLS
   ========================================================================== */
.app-header {
  background: var(--surface-container-low);
  border-bottom: 1px solid var(--outline-variant);
  padding: var(--space-sm) var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  z-index: 40;
  position: relative;
}

.header-main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.header-mode-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.brand-logo-badge {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  background: var(--primary);
  color: var(--on-primary);
  padding: 0.4rem 0.85rem;
  border-radius: var(--rounded-md);
  font-family: var(--font-headline);
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.25);
}

.brand-logo-badge i {
  width: 20px;
  height: 20px;
}

.brand-titles {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-family: var(--font-headline);
  font-weight: 700;
  font-size: 1.125rem;
  letter-spacing: var(--headline-tracking);
  color: var(--on-surface);
  line-height: 1.2;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.brand-subtitle {
  font-size: var(--label-size);
  color: var(--on-surface-variant);
  font-weight: 500;
}

.onboarding-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--primary-container);
  color: var(--on-primary-container);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: var(--rounded);
}

/* Status Badge de Sincronização (Nuvem / Local) */
.sync-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: var(--rounded);
  border: 1px solid transparent;
}

.sync-status-badge::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.sync-online {
  background: var(--positive-container);
  color: var(--on-positive-container);
  border-color: #bbf7d0;
}

.sync-loading {
  background: var(--primary-container);
  color: var(--on-primary-container);
  border-color: #bfdbfe;
}

.sync-local {
  background: var(--warning-container);
  color: var(--on-warning-container);
  border-color: #fde68a;
}

.header-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 420px;
  min-width: 240px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--on-surface-muted);
  pointer-events: none;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 0 2.25rem 0 2.4rem;
  background: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: var(--rounded);
  font-size: 0.875rem;
  color: var(--on-surface);
  transition: background var(--dur-micro) var(--ease-out), border-color var(--dur-micro) var(--ease-out), box-shadow var(--dur-micro) var(--ease-out);
}

.search-input:focus {
  background: var(--surface-container-low);
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
  outline: none;
}

.search-clear-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--on-surface-muted);
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--rounded);
}

.search-clear-btn:hover {
  color: var(--on-surface);
  background: var(--surface-container-high);
}

.toolbar-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  height: 38px;
  padding: 0 var(--space-md);
  border-radius: var(--rounded);
  font-family: var(--font-label);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background-color var(--dur-short) var(--ease-out), color var(--dur-short) var(--ease-out), box-shadow var(--dur-short) var(--ease-out);
  white-space: nowrap;
}

.btn i {
  width: 16px;
  height: 16px;
}

.btn-compact {
  height: 30px;
  padding: 0 10px;
  font-size: 0.75rem;
}

.btn-primary {
  background: var(--primary);
  color: var(--on-primary);
}

.btn-primary:hover { background: var(--primary-hover); }
.btn-primary:active { background: var(--primary-active); }

.btn-secondary {
  background: var(--surface-container);
  color: var(--on-surface);
  border-color: var(--outline-variant);
}

.btn-secondary:hover {
  background: var(--surface-container-high);
  color: var(--on-surface);
}

.btn-outline {
  background: var(--surface-container-low);
  color: var(--on-surface);
  border-color: var(--outline);
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-danger {
  background: var(--error);
  color: #ffffff;
  border-color: var(--error);
}

.btn-danger:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

.btn-danger-outline {
  background: #fef2f2;
  color: var(--error);
  border-color: #fecaca;
}

.btn-danger-outline:hover {
  background: var(--error);
  color: #ffffff;
  border-color: var(--error);
}

.view-toggle-group,
.mode-toggle-group {
  display: inline-flex;
  background: var(--surface-container);
  padding: 3px;
  border-radius: var(--rounded);
  border: 1px solid var(--outline-variant);
}

.view-toggle-btn,
.mode-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: var(--rounded);
  border: none;
  background: transparent;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all var(--dur-micro) var(--ease-out);
}

.view-toggle-btn.active,
.mode-toggle-btn.active {
  background: var(--surface-container-low);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.mode-toggle-btn.edit-active {
  background: var(--primary);
  color: var(--on-primary);
}

/* ==========================================================================
   MAIN WORKSPACE (CANVAS VS LIST)
   ========================================================================== */
.workspace-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: var(--background);
  background-image: radial-gradient(var(--outline) 1px, transparent 1px);
  background-size: 24px 24px;
}

.canvas-viewport {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  cursor: grab;
  user-select: none;
}

.canvas-viewport:active { cursor: grabbing; }

.canvas-world {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  transition: transform 60ms linear;
  will-change: transform;
  padding: 60px 100px 200px;
  width: 1600px;
  min-width: 1600px;
  max-width: 1600px;
}

.canvas-world.is-panning {
  transition: none !important;
}

/* SVG Connectors Overlay */
.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 1600px;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: visible;
}

.conn-path {
  fill: none;
  stroke: var(--primary);
  stroke-width: 2px;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke var(--dur-short) var(--ease-out), stroke-width var(--dur-short) var(--ease-out), stroke-dashoffset 0.6s linear;
}

.conn-path.highlighted {
  stroke: var(--primary);
  stroke-width: 3.5px;
  filter: drop-shadow(0 2px 8px rgba(0, 102, 204, 0.4));
  stroke-dasharray: 6 3;
  animation: dashFlow 1.2s infinite linear;
}

.conn-path.secondary-highlight {
  stroke: var(--primary);
  stroke-width: 2.5px;
}

@keyframes dashFlow {
  to { stroke-dashoffset: -18; }
}

/* Nodes Hierarchy */
.nodes-hierarchy-layer {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 50px;
}

.tier-row {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 28px;
  width: 100%;
  position: relative;
}

.advisory-cluster {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  row-gap: 38px;
  column-gap: 20px;
  max-width: 1540px;
  padding: 14px 20px;
}

.operational-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  row-gap: 44px;
  column-gap: 20px;
  max-width: 1540px;
}

/* Node Card Base */
.org-node {
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  height: 194px;
  background: var(--surface-container-low);
  border: 1.5px solid var(--outline-variant);
  border-top-width: 4px;
  border-radius: var(--rounded-lg);
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
  transition: transform var(--dur-short) var(--ease-out), box-shadow var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out), opacity var(--dur-short) var(--ease-out);
  background-clip: padding-box;
}

body.is-edit-mode .org-node {
  height: 194px;
  outline: 2px dashed rgba(0, 102, 204, 0.5);
  outline-offset: 3px;
  cursor: grab;
}

.org-node:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

body.is-edit-mode .org-node:hover {
  outline-color: var(--primary);
  outline-width: 2.5px;
  transform: translateY(-4px) scale(1.01);
}

body.is-edit-mode .org-node.is-dragging-node {
  cursor: grabbing;
  z-index: 60 !important;
  box-shadow: 0 20px 40px rgba(0, 102, 204, 0.28);
  outline-color: var(--primary);
  outline-style: solid;
  transition: none !important;
}

.org-node.is-active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.2), var(--shadow-lg);
}

.org-node.is-dimmed {
  opacity: 0.35;
  filter: grayscale(0.2);
}

.org-node.is-highlighted {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.25), var(--shadow-md);
}

/* Tier Accents */
.node-conselho { border-top-color: #4338ca; }
.node-conselho .node-badge { background: #eef2ff; color: #4338ca; }

.node-ceo {
  border-top-color: var(--primary);
  background: linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%);
}
.node-ceo .node-badge {
  background: var(--primary-container);
  color: var(--on-primary-container);
  font-weight: 700;
}

.node-advisory { border-top-color: #0284c7; }
.node-advisory .node-badge { background: #e0f2fe; color: #0369a1; }

.node-operational { border-top-color: var(--primary); }
.node-operational .node-badge {
  background: var(--surface-container);
  color: var(--on-surface-variant);
}

/* Card Anatomy */
.node-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  min-height: 28px;
  margin-bottom: 4px;
}

.node-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.18rem 0.45rem;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  max-width: calc(100% - 54px);
  white-space: normal;
  line-height: 1.2;
}

.node-id-tag {
  font-size: 0.6875rem;
  color: var(--on-surface-muted);
  font-family: monospace;
  flex-shrink: 0;
  padding-top: 2px;
}

body.is-edit-mode .org-node .node-id-tag { margin-right: 32px; }
body.is-edit-mode .org-node .node-badge { max-width: calc(100% - 86px); }

.node-body {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
  min-height: 0;
}

.node-avatar {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: var(--rounded-md);
  background: linear-gradient(135deg, #0066cc 0%, #38bdf8 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-headline);
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(0, 102, 204, 0.2);
}

.node-avatar.avatar-gold { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); }
.node-avatar.avatar-indigo { background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%); }
.node-avatar.avatar-teal { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); }

.node-meta {
  flex: 1;
  min-width: 0;
}

.node-role {
  font-family: var(--font-headline);
  font-weight: 700;
  font-size: 0.9rem;
  line-height: 1.22;
  color: var(--on-surface);
  margin-bottom: 3px;
  word-break: break-word;
}

.node-name {
  font-size: 0.8rem;
  color: var(--primary);
  font-weight: 600;
  line-height: 1.25;
  white-space: normal;
  word-break: break-word;
}

.node-status-tag {
  display: inline-block;
  font-size: 0.6875rem;
  color: var(--secondary);
  font-weight: 700;
  margin-left: 4px;
}

.node-footer {
  margin-top: auto;
  padding-top: 6px;
  border-top: 1px solid var(--outline-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 0.6875rem;
  line-height: 1.25;
  color: var(--on-surface-muted);
}

.node-action-prompt {
  color: var(--primary);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.node-action-prompt i { width: 12px; height: 12px; }

/* Edit Controls on Cards */
.node-edit-btn {
  display: none;
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--primary);
  color: #ffffff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.35);
  z-index: 15;
  transition: all var(--dur-micro) var(--ease-out);
}

.node-edit-btn:hover {
  background: var(--primary-hover);
  transform: scale(1.15);
}

body.is-edit-mode .node-edit-btn { display: inline-flex; }

.node-edit-controls {
  display: none;
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: -12px;
  height: 24px;
  padding: 0 6px;
  background: var(--surface-container-low);
  border: 1px solid var(--outline);
  border-radius: 10px;
  box-shadow: var(--shadow-sm);
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  z-index: 16;
}

body.is-edit-mode .node-edit-controls { display: flex; }

.node-move-group {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.node-quick-btn {
  width: 20px;
  height: 18px;
  border-radius: 5px;
  border: 1px solid var(--outline);
  background: var(--surface-container);
  color: var(--on-surface-variant);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 700;
  transition: all var(--dur-micro) var(--ease-out);
  padding: 0;
}

.node-quick-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
}

.node-quick-btn i { width: 12px; height: 12px; }

.node-delete-quick-btn {
  color: var(--error);
  border-color: #fecaca;
  background: #fef2f2;
}

.node-delete-quick-btn:hover {
  background: var(--error);
  border-color: var(--error);
  color: #ffffff;
}

.node-drag-hint {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--on-surface-muted);
}

.node-drag-hint i { width: 12px; height: 12px; }

/* Edit Mode Banner */
.edit-mode-banner {
  display: none;
  background: var(--primary-container);
  border-bottom: 1px solid var(--outline-variant);
  padding: 0.5rem 1.5rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.8125rem;
  color: var(--on-primary-container);
  z-index: 30;
  flex-wrap: wrap;
}

body.is-edit-mode .edit-mode-banner { display: flex; }

.edit-banner-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.edit-banner-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* ==========================================================================
   CANVAS FLOATING TOOLBAR & LEGEND
   ========================================================================== */
.canvas-controls-toolbar {
  position: absolute;
  bottom: 24px;
  left: 24px;
  background: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  border-radius: var(--rounded-lg);
  padding: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: var(--shadow-lg);
  z-index: 30;
}

.ctrl-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--rounded-md);
  background: transparent;
  border: none;
  color: var(--on-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--dur-micro) var(--ease-out), color var(--dur-micro) var(--ease-out);
}

.ctrl-btn:hover {
  background: var(--surface-container);
  color: var(--primary);
}

.ctrl-btn i { width: 18px; height: 18px; }

.zoom-level-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--on-surface);
  padding: 0 6px;
  min-width: 44px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.toolbar-divider {
  width: 1px;
  height: 22px;
  background: var(--outline-variant);
  margin: 0 2px;
}

.canvas-legend-panel {
  position: absolute;
  bottom: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid var(--outline-variant);
  border-radius: var(--rounded-lg);
  padding: var(--space-sm) var(--space-md);
  box-shadow: var(--shadow-md);
  z-index: 30;
  max-width: 290px;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.legend-title {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--on-surface-muted);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.legend-items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--on-surface-variant);
}

.legend-indicator {
  width: 10px;
  height: 10px;
  border-radius: var(--rounded-sm);
}

/* ==========================================================================
   HOVER TOOLTIP
   ========================================================================== */
.org-tooltip {
  position: fixed;
  background: var(--surface-container-low);
  border: 1.5px solid var(--primary-container);
  border-radius: var(--rounded-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-tooltip);
  max-width: 320px;
  pointer-events: none;
  z-index: 100;
  opacity: 0;
  transform: translate(-50%, -100%) scale(0.96);
  transition: opacity var(--dur-short) var(--ease-out), transform var(--dur-short) var(--ease-out);
  will-change: transform, opacity;
}

.org-tooltip.visible {
  opacity: 1;
  transform: translate(-50%, calc(-100% - 14px)) scale(1);
}

.org-tooltip.below { transform: translate(-50%, 0) scale(0.96); }
.org-tooltip.below.visible { transform: translate(-50%, 14px) scale(1); }

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.tooltip-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  background: var(--primary-container);
  color: var(--on-primary-container);
  padding: 0.15rem 0.4rem;
  border-radius: var(--rounded);
}

.tooltip-title {
  font-family: var(--font-headline);
  font-weight: 700;
  font-size: 0.9375rem;
  color: var(--on-surface);
  line-height: 1.2;
}

.tooltip-leader {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 0.4rem;
}

.tooltip-desc {
  font-size: 0.75rem;
  color: var(--on-surface-variant);
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.tooltip-onboarding-tip {
  background: #f8fafc;
  border-left: 3px solid var(--primary);
  padding: 0.35rem 0.5rem;
  border-radius: 0 var(--rounded-sm) var(--rounded-sm) 0;
  font-size: 0.7rem;
  color: var(--on-surface);
  line-height: 1.35;
}

.tooltip-tip-label {
  font-weight: 700;
  color: var(--primary);
  display: block;
  margin-bottom: 1px;
}

/* ==========================================================================
   SIDE DRAWER
   ========================================================================== */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 80;
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--dur-long) var(--ease-out), visibility var(--dur-long);
}

.drawer-overlay.open { opacity: 1; visibility: visible; }

.detail-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 480px;
  height: 100vh;
  background: var(--surface-container-low);
  box-shadow: -8px 0 32px rgba(15, 23, 42, 0.15);
  z-index: 90;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform var(--dur-long) var(--ease-out);
}

.detail-drawer.open { transform: translateX(0); }

.drawer-header {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--outline-variant);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  background: linear-gradient(180deg, #ffffff 0%, var(--surface-container-low) 100%);
}

.drawer-title-group { flex: 1; }

.drawer-close-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--rounded);
  border: 1px solid var(--outline-variant);
  background: var(--surface-container);
  color: var(--on-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--dur-micro) var(--ease-out);
}

.drawer-close-btn:hover {
  background: var(--surface-container-high);
  color: var(--on-surface);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.drawer-profile-card {
  background: var(--surface-container);
  border-radius: var(--rounded-lg);
  padding: var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.drawer-profile-avatar {
  width: 60px;
  height: 60px;
  min-width: 60px;
  border-radius: var(--rounded-md);
  background: var(--primary);
  color: var(--on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-headline);
  font-weight: 700;
  font-size: 1.35rem;
}

.drawer-section-title {
  font-family: var(--font-headline);
  font-weight: 700;
  font-size: 0.9375rem;
  color: var(--on-surface);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: var(--space-xs);
}

.drawer-section-title i {
  width: 18px;
  height: 18px;
  color: var(--primary);
}

.drawer-card {
  background: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  border-radius: var(--rounded-md);
  padding: var(--space-md);
}

.onboarding-action-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.onboarding-action-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--on-surface);
}

.onboarding-action-item i {
  width: 16px;
  height: 16px;
  color: var(--positive);
  min-width: 16px;
  margin-top: 2px;
}

.connections-pill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: var(--space-xs);
}

.conn-pill {
  background: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: var(--rounded);
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--on-surface);
  cursor: pointer;
  transition: all var(--dur-micro) var(--ease-out);
}

.conn-pill:hover {
  background: var(--primary-container);
  border-color: var(--primary);
  color: var(--primary);
}

/* ==========================================================================
   LIST / DIRECTORY VIEW
   ========================================================================== */
.list-view-container {
  display: none;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: var(--space-lg);
  max-width: 1100px;
  margin: 0 auto;
}

.list-view-container.active { display: block; }
.list-group { margin-bottom: var(--space-xl); }

.list-group-header {
  font-family: var(--font-headline);
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--on-surface);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-xs);
  border-bottom: 2px solid var(--outline-variant);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-group-header .count-badge {
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--surface-container-high);
  padding: 0.2rem 0.6rem;
  border-radius: var(--rounded);
  color: var(--on-surface-variant);
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-md);
}

.list-card {
  background: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  border-radius: var(--rounded-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--dur-short) var(--ease-out);
}

.list-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.list-card-actions {
  display: none;
  align-items: center;
  gap: 6px;
}

body.is-edit-mode .list-card-actions { display: inline-flex; }

/* ==========================================================================
   GUIDED ONBOARDING TOUR MODAL
   ========================================================================== */
.tour-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--dur-short) var(--ease-out), visibility var(--dur-short);
}

.tour-modal-overlay.open { opacity: 1; visibility: visible; }

.tour-modal {
  background: var(--surface-container-low);
  border-radius: var(--rounded-xl);
  max-width: 540px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalPop 0.3s var(--ease-out);
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.tour-modal-header {
  background: linear-gradient(135deg, #0066cc 0%, #004d99 100%);
  color: #ffffff;
  padding: var(--space-lg);
  position: relative;
}

.tour-step-badge {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: var(--rounded);
  display: inline-block;
  margin-bottom: var(--space-xs);
}

.tour-modal-title {
  font-family: var(--font-headline);
  font-weight: 800;
  font-size: 1.35rem;
  line-height: 1.2;
}

.tour-modal-body {
  padding: var(--space-lg);
  font-size: 0.9375rem;
  color: var(--on-surface-variant);
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.tour-highlight-box {
  background: var(--surface-container);
  border-radius: var(--rounded-md);
  padding: var(--space-md);
  border-left: 4px solid var(--primary);
}

.tour-modal-footer {
  padding: var(--space-md) var(--space-lg);
  background: var(--surface-container);
  border-top: 1px solid var(--outline-variant);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tour-progress-dots { display: flex; gap: 6px; }

.tour-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--rounded);
  background: var(--outline);
  transition: all var(--dur-micro) var(--ease-out);
}

.tour-dot.active { background: var(--primary); width: 20px; }

body.is-edit-mode #btn-tour-onboarding {
  outline: 2px dashed rgba(0, 102, 204, 0.65);
  outline-offset: 3px;
}

.tour-modal-edit-trigger {
  display: none;
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: var(--rounded);
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  align-items: center;
  gap: 4px;
  transition: background var(--dur-micro) var(--ease-out);
}

.tour-modal-edit-trigger:hover { background: rgba(255, 255, 255, 0.32); }
body.is-edit-mode .tour-modal-edit-trigger { display: inline-flex; }

.tour-steps-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  background: var(--surface-container);
  border-radius: var(--rounded-md);
  border: 1px solid var(--outline-variant);
}

.tour-step-tab {
  padding: 5px 11px;
  border-radius: var(--rounded);
  border: 1px solid var(--outline);
  background: var(--surface-container-low);
  color: var(--on-surface-variant);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--dur-micro) var(--ease-out);
}

.tour-step-tab:hover { border-color: var(--primary); color: var(--primary); }
.tour-step-tab.active { background: var(--primary); border-color: var(--primary); color: #ffffff; }

.tour-editor-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--primary);
  border-bottom: 1px solid var(--outline-variant);
  padding-bottom: 4px;
  margin-top: 4px;
}

/* ==========================================================================
   MODAIS DO MODO EDIÇÃO & FORMULÁRIOS
   ========================================================================== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  z-index: 1200;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--dur-short) var(--ease-out);
}

.modal-backdrop.open { opacity: 1; pointer-events: auto; }

.modal-dialog {
  background: var(--surface-container-low);
  border-radius: var(--rounded-lg);
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  transform: translateY(14px) scale(0.98);
  transition: transform var(--dur-short) var(--ease-out);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--outline-variant);
}

.modal-backdrop.open .modal-dialog { transform: translateY(0) scale(1); }

.modal-header {
  padding: 1.25rem 1.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--outline-variant);
}

.modal-title-group { display: flex; align-items: center; gap: 10px; }

.modal-title-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-container);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.modal-title {
  font-family: var(--font-headline);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

.modal-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: background var(--dur-micro) var(--ease-out);
}

.modal-close-btn:hover { background: var(--surface-container); color: var(--on-surface); }

.modal-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--outline-variant);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  background: var(--surface-container-low);
}

.backup-option-card {
  background: var(--surface-container);
  padding: 1rem;
  border-radius: var(--rounded-md);
  border: 1px solid var(--outline-variant);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.form-row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-row-3col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--on-surface);
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-hint {
  font-size: 0.7rem;
  color: var(--on-surface-muted);
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--rounded-md);
  border: 1px solid var(--outline);
  background: var(--background);
  color: var(--on-surface);
  font-size: 0.875rem;
  font-family: var(--font-body);
  outline: none;
  transition: border-color var(--dur-short) var(--ease-out), box-shadow var(--dur-short) var(--ease-out);
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-container);
  background: #ffffff;
}

.avatar-preview-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--surface-container);
  padding: 0.75rem 1rem;
  border-radius: var(--rounded-md);
  border: 1px solid var(--outline-variant);
}

.avatar-live-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary);
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.avatar-live-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ==========================================================================
   TOASTS & RESPONSIVO
   ========================================================================== */
.toast-container {
  position: fixed;
  bottom: var(--space-lg);
  right: var(--space-lg);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast-pill {
  background: var(--on-surface);
  color: #ffffff;
  padding: 10px 18px;
  border-radius: var(--rounded);
  font-size: 0.8125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  animation: slideUpToast var(--dur-short) var(--ease-out);
}

.toast-pill.success { background: #0f766e; }
.toast-pill.warning { background: #b45309; }

@keyframes slideUpToast {
  from { transform: translateY(14px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 768px) {
  .app-header { padding: var(--space-sm) var(--space-md); }
  .search-container { max-width: 100%; order: 2; }
  .toolbar-buttons { width: 100%; justify-content: space-between; order: 3; }
  .canvas-legend-panel { display: none; }
  .canvas-controls-toolbar { bottom: 16px; left: 16px; }
}

@media (max-width: 640px) {
  .form-row-3col,
  .form-row-2col { grid-template-columns: 1fr; }
  .search-container { min-width: 100%; }
  .backup-option-card { flex-direction: column; align-items: flex-start; }
}
