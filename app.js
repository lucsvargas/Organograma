/* ==========================================================================
   ORGANOGRAMA CORPORATIVO BETHA — LÓGICA PRINCIPAL (CANVAS, SVG E CRUD)
   Depende de: js/data.js e js/storage.js
   ========================================================================== */

let mutableTourConfig = JSON.parse(JSON.stringify(DEFAULT_TOUR_CONFIG));
let draftTourConfig = null;
let editingTourStepIdx = 0;

/* Estado da Aplicação */
let currentViewMode = 'canvas';
let currentAppMode = 'nav'; // 'nav' ou 'edit'
let currentZoom = 1.0;
let panX = 0;
let panY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let selectedNodeId = 'ceo';
let branchesCollapsed = false;
let connectorsHighlighted = true;
let currentTourStep = 0;
let userHasAdjustedView = false;

/* Estado de Drag & Drop dos Cards (Modo Edição) */
let draggedNodeId = null;
let nodeDragStartMouseX = 0;
let nodeDragStartMouseY = 0;
let nodeDragInitOffsetX = 0;
let nodeDragInitOffsetY = 0;
let nodeHasMovedDuringDrag = false;
let suppressNextNodeClick = false;
let svgRafPending = false;

/* Estado de Touch no Canvas */
let canvasTouchMode = null;
let canvasTouchStartDist = 0;
let canvasTouchStartZoom = 1;
let canvasTouchMidX = 0;
let canvasTouchMidY = 0;

/* Store Mutável */
const INITIAL_ORG_DATA = JSON.parse(JSON.stringify(ORG_DATA));
let mutableOrgData = JSON.parse(JSON.stringify(ORG_DATA));
let deletedNodeIds = [];

const TIER_SEQUENCE = ['conselho', 'ceo', 'advisory', 'operational', 'subordinate'];

/* ==========================================================================
   NORMALIZAÇÃO E SINCRONIZAÇÃO DE DADOS
   ========================================================================== */
function normalizeTourConfig(cfg) {
  const base = JSON.parse(JSON.stringify(DEFAULT_TOUR_CONFIG));
  if (!cfg || typeof cfg !== 'object') return base;
  const normalized = {
    buttonLabel: (typeof cfg.buttonLabel === 'string' && cfg.buttonLabel.trim()) ? cfg.buttonLabel.trim() : base.buttonLabel,
    buttonIcon: (typeof cfg.buttonIcon === 'string' && cfg.buttonIcon.trim()) ? cfg.buttonIcon.trim() : base.buttonIcon,
    buttonTitle: (typeof cfg.buttonTitle === 'string') ? cfg.buttonTitle : base.buttonTitle,
    skipLabel: (typeof cfg.skipLabel === 'string' && cfg.skipLabel.trim()) ? cfg.skipLabel.trim() : base.skipLabel,
    nextLabel: (typeof cfg.nextLabel === 'string' && cfg.nextLabel.trim()) ? cfg.nextLabel.trim() : base.nextLabel,
    finishLabel: (typeof cfg.finishLabel === 'string' && cfg.finishLabel.trim()) ? cfg.finishLabel.trim() : base.finishLabel,
    steps: []
  };
  if (Array.isArray(cfg.steps) && cfg.steps.length > 0) {
    normalized.steps = cfg.steps.map(function(st) {
      return {
        stepLabel: (st && typeof st.stepLabel === 'string') ? st.stepLabel : '',
        title: (st && typeof st.title === 'string') ? st.title : '',
        highlight: (st && typeof st.highlight === 'string') ? st.highlight : '',
        text: (st && typeof st.text === 'string') ? st.text : '',
        targetNode: (st && typeof st.targetNode === 'string') ? st.targetNode : ''
      };
    });
  } else {
    normalized.steps = base.steps;
  }
  return normalized;
}

function normalizeNodeFields(node, id) {
  const fallback = INITIAL_ORG_DATA[id] || {};
  if (!node.tierGroup) node.tierGroup = fallback.tierGroup || 'operational';
  if (typeof node.sortOrder !== 'number') node.sortOrder = (typeof fallback.sortOrder === 'number') ? fallback.sortOrder : 99;
  if (typeof node.offsetX !== 'number') node.offsetX = 0;
  if (typeof node.offsetY !== 'number') node.offsetY = 0;
  if (!node.footerTag) node.footerTag = fallback.footerTag || node.category || 'Área Betha';
  if (!node.footerPrompt) node.footerPrompt = fallback.footerPrompt || 'Detalhes';
  if (typeof node.badgeIcon === 'undefined') node.badgeIcon = fallback.badgeIcon || '';
  if (!Array.isArray(node.childrenIds)) node.childrenIds = [];
  if (!Array.isArray(node.connections)) node.connections = [];
  if (!Array.isArray(node.onboardingActions)) node.onboardingActions = fallback.onboardingActions ? fallback.onboardingActions.slice() : [];
  return node;
}

function syncChildrenLists() {
  Object.keys(mutableOrgData).forEach(function(id) {
    mutableOrgData[id].childrenIds = [];
  });
  Object.keys(mutableOrgData).forEach(function(id) {
    const pid = mutableOrgData[id].parentId;
    if (pid && mutableOrgData[pid]) {
      mutableOrgData[pid].childrenIds.push(id);
    }
    ORG_DATA[id] = mutableOrgData[id];
  });
}

function applyPersistedState(state) {
  if (!state || typeof state !== 'object') return false;
  let changed = false;

  if (Array.isArray(state.deletedNodeIds)) {
    deletedNodeIds = state.deletedNodeIds.slice();
  }

  if (state.customOrgData && typeof state.customOrgData === 'object') {
    const merged = {};
    Object.keys(state.customOrgData).forEach(function(id) {
      if (deletedNodeIds.indexOf(id) !== -1) return;
      const base = INITIAL_ORG_DATA[id] ? JSON.parse(JSON.stringify(INITIAL_ORG_DATA[id])) : {};
      merged[id] = normalizeNodeFields(Object.assign(base, state.customOrgData[id]), id);
    });
    mutableOrgData = merged;
    Object.keys(ORG_DATA).forEach(function(id) {
      if (!mutableOrgData[id]) delete ORG_DATA[id];
    });
    Object.keys(mutableOrgData).forEach(function(id) {
      ORG_DATA[id] = mutableOrgData[id];
    });
    changed = true;
  }

  if (state.tourConfig && typeof state.tourConfig === 'object') {
    mutableTourConfig = normalizeTourConfig(state.tourConfig);
    changed = true;
  }

  return changed;
}

function persistAllChanges() {
  OrgStorage.saveAll({
    customOrgData: mutableOrgData,
    deletedNodeIds: deletedNodeIds,
    tourConfig: mutableTourConfig
  });
}

/* ==========================================================================
   ÍCONES (LUCIDE + FALLBACK OFFLINE)
   ========================================================================== */
function renderAllIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    try {
      window.lucide.createIcons();
      return;
    } catch (e) {}
  }
  if (typeof document === 'undefined') return;
  const nodes = document.querySelectorAll('i[data-lucide]');
  nodes.forEach(function(el) {
    const name = el.getAttribute('data-lucide');
    const inner = LUCIDE_FALLBACK_ICONS[name] || LUCIDE_FALLBACK_ICONS['info'];
    if (!inner) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('data-lucide', name);
    if (el.id) svg.id = el.id;
    if (el.getAttribute('style')) svg.setAttribute('style', el.getAttribute('style'));
    if (el.className) svg.setAttribute('class', 'lucide lucide-' + name + ' ' + el.className);
    else svg.setAttribute('class', 'lucide lucide-' + name);
    svg.innerHTML = inner;
    if (el.parentNode) el.parentNode.replaceChild(svg, el);
  });
}

function applyTourButtonUI() {
  const btn = document.getElementById('btn-tour-onboarding');
  const labelEl = document.getElementById('btn-tour-onboarding-label');
  if (labelEl) {
    labelEl.textContent = mutableTourConfig.buttonLabel || 'Tour de Onboarding';
  }
  if (btn) {
    const iconName = mutableTourConfig.buttonIcon || 'sparkles';
    const existingIcon = btn.querySelector('svg, i');
    const newIcon = document.createElement('i');
    newIcon.setAttribute('data-lucide', iconName);
    newIcon.id = 'btn-tour-onboarding-icon';
    if (existingIcon) {
      existingIcon.replaceWith(newIcon);
    } else {
      btn.prepend(newIcon);
    }
    if (currentAppMode === 'edit') {
      btn.title = 'Clique para editar o botão e as etapas do Tour de Onboarding';
    } else if (mutableTourConfig.buttonTitle && mutableTourConfig.buttonTitle.trim()) {
      btn.title = mutableTourConfig.buttonTitle.trim();
    } else {
      btn.removeAttribute('title');
    }
  }
  renderAllIcons();
}

/* ==========================================================================
   INICIALIZAÇÃO (LOCAL IMEDIATO + SINCRONIZAÇÃO GLOBAL DA NUVEM)
   ========================================================================== */
window.addEventListener('DOMContentLoaded', async function() {
  // 1. Renderização imediata com cache local (caso exista)
  const localState = OrgStorage.loadLocal();
  applyPersistedState(localState);

  syncChildrenLists();
  renderHierarchyCanvas();
  renderListView();
  applyTourButtonUI();
  renderAllIcons();
  centerCanvasInViewport();
  renderSvgConnections();

  // 2. Busca o estado global oficial salvo na Vercel para todos os usuários
  const cloudState = await OrgStorage.fetchCloudState();
  if (cloudState && applyPersistedState(cloudState)) {
    OrgStorage.saveLocal({
      customOrgData: mutableOrgData,
      deletedNodeIds: deletedNodeIds,
      tourConfig: mutableTourConfig
    });
    syncChildrenLists();
    renderHierarchyCanvas();
    renderListView();
    applyTourButtonUI();
    renderAllIcons();
    if (!userHasAdjustedView) centerCanvasInViewport();
    renderSvgConnections();
  }

  // 3. Re-alinhamento automático ao carregar fontes/janela
  window.addEventListener('load', function() {
    renderAllIcons();
    if (!userHasAdjustedView) centerCanvasInViewport();
    renderSvgConnections();
  });

  if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
    document.fonts.ready.then(function() {
      if (!userHasAdjustedView) centerCanvasInViewport();
      renderSvgConnections();
    }).catch(function() {});
  }

  if (typeof ResizeObserver === 'function') {
    let resizeRaf = null;
    const ro = new ResizeObserver(function() {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(function() {
        resizeRaf = null;
        if (!userHasAdjustedView) {
          centerCanvasInViewport();
        } else {
          renderSvgConnections();
        }
      });
    });
    const vpEl = document.getElementById('canvas-viewport');
    const worldEl = document.getElementById('canvas-world');
    if (vpEl) ro.observe(vpEl);
    if (worldEl) ro.observe(worldEl);
  }

  window.addEventListener('resize', function() {
    if (!userHasAdjustedView) {
      centerCanvasInViewport();
    } else {
      renderSvgConnections();
    }
  });

  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeDrawer();
      skipTour();
      clearSearch();
      closeEditModal();
      closeAddModal();
      closeExportModal();
      closeConfirmDeleteModal();
      closeTourEditModal();
    }
  });

  const viewport = document.getElementById('canvas-viewport');
  if (viewport) {
    viewport.addEventListener('wheel', handleCanvasWheel, { passive: false });
    viewport.addEventListener('touchstart', handleCanvasTouchStart, { passive: false });
  }
});

/* ==========================================================================
   RENDERIZADORES DINÂMICOS (ÁRVORE CANVAS E GRADE DE ÁREAS)
   ========================================================================== */
function getTierClass(tierGroup) {
  if (tierGroup === 'conselho') return 'node-conselho';
  if (tierGroup === 'ceo') return 'node-ceo';
  if (tierGroup === 'advisory') return 'node-advisory';
  return 'node-operational';
}

function getSortedNodesByTier(tierGroup) {
  return Object.values(mutableOrgData)
    .filter(function(n) { return n.tierGroup === tierGroup; })
    .sort(function(a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });
}

function getNodeDepth(id, visited) {
  const seen = visited || {};
  if (seen[id]) return 1;
  seen[id] = true;
  const node = mutableOrgData[id];
  if (!node || !node.parentId || !mutableOrgData[node.parentId]) return 1;
  const parent = mutableOrgData[node.parentId];
  if (parent.tierGroup === 'conselho' || parent.tierGroup === 'ceo' || parent.tierGroup === 'advisory' || parent.tierGroup === 'operational') {
    return 1;
  }
  return 1 + getNodeDepth(node.parentId, seen);
}

function buildCanvasCardHtml(node) {
  const id = node.id;
  const tierClass = getTierClass(node.tierGroup);
  const activeClass = (selectedNodeId === id) ? 'is-active' : '';
  const iconHtml = node.badgeIcon ? `<i data-lucide="${node.badgeIcon}" style="width:12px;height:12px;"></i> ` : '';
  const fallbackInit = escapeHtml(node.avatarInitials || 'BS');
  const avatarInner = node.avatar
    ? `<img src="${escapeHtml(node.avatar)}" alt="${escapeHtml(node.name)}" data-initials="${fallbackInit}" onerror="this.parentElement.textContent=this.dataset.initials||'BS';" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`
    : fallbackInit;
  const offsetX = Number(node.offsetX || 0);
  const offsetY = Number(node.offsetY || 0);
  const hasOffset = (offsetX !== 0 || offsetY !== 0);

  return `
    <div class="org-node ${tierClass} ${activeClass}" id="node-${escapeHtml(id)}" style="left:${offsetX}px;top:${offsetY}px;" onclick="handleNodeClick('${escapeHtml(id)}')" onmousedown="handleNodeMouseDown(event, '${escapeHtml(id)}')" ontouchstart="handleNodeTouchStart(event, '${escapeHtml(id)}')" onmouseenter="showTooltip(event, '${escapeHtml(id)}')" onmouseleave="hideTooltip()">
      <div class="node-header">
        <button class="node-edit-btn" onclick="event.stopPropagation(); openEditModal('${escapeHtml(id)}')" title="Editar informações desta posição"><i data-lucide="pencil" style="width:12px;height:12px;"></i></button>
        <span class="node-badge">${iconHtml}${escapeHtml(node.role)}</span>
        <span class="node-id-tag">${escapeHtml(node.code)}</span>
      </div>
      <div class="node-body">
        <div class="node-avatar ${escapeHtml(node.avatarClass || '')}">${avatarInner}</div>
        <div class="node-meta">
          <div class="node-role">${escapeHtml(node.category)}</div>
          <div class="node-name">${escapeHtml(node.name)}</div>
        </div>
      </div>
      <div class="node-footer">
        <span>${escapeHtml(node.footerTag || node.role)}</span>
        <span class="node-action-prompt">${escapeHtml(node.footerPrompt || 'Detalhes')} <i data-lucide="chevron-right"></i></span>
      </div>
      <div class="node-edit-controls" onclick="event.stopPropagation()">
        <div class="node-move-group">
          <button type="button" class="node-quick-btn" onclick="moveNodeOrder('${escapeHtml(id)}', -1)" title="Mover para a esquerda neste nível"><i data-lucide="chevron-left"></i></button>
          <button type="button" class="node-quick-btn" onclick="moveNodeOrder('${escapeHtml(id)}', 1)" title="Mover para a direita neste nível"><i data-lucide="chevron-right"></i></button>
          <button type="button" class="node-quick-btn" onclick="moveNodeTier('${escapeHtml(id)}', -1)" title="Subir um nível hierárquico"><i data-lucide="chevron-up"></i></button>
          <button type="button" class="node-quick-btn" onclick="moveNodeTier('${escapeHtml(id)}', 1)" title="Descer um nível hierárquico"><i data-lucide="chevron-down"></i></button>
          ${hasOffset ? `<button type="button" class="node-quick-btn" onclick="resetSingleNodeOffset('${escapeHtml(id)}')" title="Alinhar card de volta à grade"><i data-lucide="align-center"></i></button>` : ''}
        </div>
        <div class="node-move-group">
          <span class="node-drag-hint" title="Arraste o card para reposicionar livremente"><i data-lucide="move"></i> Mover</span>
          <button type="button" class="node-quick-btn node-delete-quick-btn" onclick="requestDeleteNode('${escapeHtml(id)}')" title="Excluir este card"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    </div>
  `;
}

function renderHierarchyCanvas() {
  const root = document.getElementById('nodes-tree-root');
  if (!root) return;

  const conselhoNodes = getSortedNodesByTier('conselho');
  const ceoNodes = getSortedNodesByTier('ceo');
  const advisoryNodes = getSortedNodesByTier('advisory');
  const operationalNodes = getSortedNodesByTier('operational');
  const subordinateNodes = getSortedNodesByTier('subordinate');

  let htmlOut = '';

  if (conselhoNodes.length > 0) {
    htmlOut += `<div class="tier-row" id="tier-conselho">${conselhoNodes.map(buildCanvasCardHtml).join('')}</div>`;
  }

  if (ceoNodes.length > 0) {
    htmlOut += `<div class="tier-row" id="tier-ceo">${ceoNodes.map(buildCanvasCardHtml).join('')}</div>`;
  }

  if (advisoryNodes.length > 0) {
    const displayAdv = branchesCollapsed ? 'none' : 'flex';
    htmlOut += `
      <div class="tier-row" id="tier-advisory">
        <div class="advisory-cluster" id="advisory-cluster-container" style="display:${displayAdv};">
          ${advisoryNodes.map(buildCanvasCardHtml).join('')}
        </div>
      </div>
    `;
  }

  if (operationalNodes.length > 0) {
    const displayOp = branchesCollapsed ? 'none' : 'flex';
    htmlOut += `
      <div class="tier-row" id="tier-operational">
        <div class="operational-grid" id="operational-grid-container" style="display:${displayOp};">
          ${operationalNodes.map(buildCanvasCardHtml).join('')}
        </div>
      </div>
    `;
  }

  if (subordinateNodes.length > 0) {
    const depthBuckets = {};
    subordinateNodes.forEach(function(n) {
      const d = getNodeDepth(n.id, {});
      if (!depthBuckets[d]) depthBuckets[d] = [];
      depthBuckets[d].push(n);
    });
    const displaySub = branchesCollapsed ? 'none' : 'flex';
    Object.keys(depthBuckets).sort(function(a, b) { return Number(a) - Number(b); }).forEach(function(d) {
      const bucket = depthBuckets[d].sort(function(a, b) {
        const pA = mutableOrgData[a.parentId];
        const pB = mutableOrgData[b.parentId];
        const orderA = pA ? (pA.sortOrder || 0) : 999;
        const orderB = pB ? (pB.sortOrder || 0) : 999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
      htmlOut += `
        <div class="tier-row subordinate-tier-row" id="tier-subordinate-${d}" style="display:${displaySub};">
          <div class="operational-grid">
            ${bucket.map(buildCanvasCardHtml).join('')}
          </div>
        </div>
      `;
    });
  }

  root.innerHTML = htmlOut;

  const searchInput = document.getElementById('node-search-input');
  if (searchInput && searchInput.value.trim()) {
    handleSearch(searchInput.value);
  }
}

function renderListView() {
  const container = document.getElementById('list-view-container');
  if (!container) return;

  const topGroup = getSortedNodesByTier('conselho').concat(getSortedNodesByTier('ceo'));
  const advisoryGroup = getSortedNodesByTier('advisory');
  const operationalGroup = getSortedNodesByTier('operational');
  const subordinateGroup = getSortedNodesByTier('subordinate');

  function buildListCard(node) {
    let badgeStyle = 'margin-bottom:6px;';
    if (node.tierGroup === 'conselho') badgeStyle = 'background:#eef2ff;color:#4338ca;margin-bottom:6px;';
    else if (node.tierGroup === 'ceo') badgeStyle = 'background:var(--primary-container);color:var(--primary);margin-bottom:6px;';
    else if (node.tierGroup === 'advisory') badgeStyle = 'background:#e0f2fe;color:#0369a1;margin-bottom:6px;';

    const shortDesc = node.mission ? (node.mission.length > 105 ? node.mission.substring(0, 102) + '...' : node.mission) : '';

    return `
      <div class="list-card" onclick="handleNodeClick('${escapeHtml(node.id)}')">
        <div class="node-header">
          <span class="node-badge" style="${badgeStyle}">${escapeHtml(node.role)}</span>
          <div class="list-card-actions" onclick="event.stopPropagation()">
            <button type="button" class="node-quick-btn" onclick="openEditModal('${escapeHtml(node.id)}')" title="Editar card"><i data-lucide="pencil"></i></button>
            <button type="button" class="node-quick-btn node-delete-quick-btn" onclick="requestDeleteNode('${escapeHtml(node.id)}')" title="Excluir este card"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
        <div class="node-role" style="font-size:1.05rem;">${escapeHtml(node.category)}</div>
        <div class="node-name" style="font-size:0.9rem;margin-bottom:6px;">${escapeHtml(node.name)}</div>
        <p style="font-size:0.8rem;color:var(--on-surface-variant);margin-top:4px;">${escapeHtml(shortDesc)}</p>
      </div>
    `;
  }

  let htmlOut = '';

  if (topGroup.length > 0) {
    htmlOut += `
      <div class="list-group">
        <div class="list-group-header">
          <span>1. Governança Superior e Presidência</span>
          <span class="count-badge">${topGroup.length} ${topGroup.length === 1 ? 'liderança' : 'lideranças'}</span>
        </div>
        <div class="list-grid">${topGroup.map(buildListCard).join('')}</div>
      </div>
    `;
  }

  if (advisoryGroup.length > 0) {
    htmlOut += `
      <div class="list-group">
        <div class="list-group-header">
          <span>2. Controle, Governança e Assessoria Estratégica</span>
          <span class="count-badge">${advisoryGroup.length} ${advisoryGroup.length === 1 ? 'área' : 'áreas'}</span>
        </div>
        <div class="list-grid">${advisoryGroup.map(buildListCard).join('')}</div>
      </div>
    `;
  }

  if (operationalGroup.length > 0) {
    htmlOut += `
      <div class="list-group">
        <div class="list-group-header">
          <span>3. Diretorias Executivas de Mercado, Produto e Gestão</span>
          <span class="count-badge">${operationalGroup.length} ${operationalGroup.length === 1 ? 'diretoria' : 'diretorias'}</span>
        </div>
        <div class="list-grid">${operationalGroup.map(buildListCard).join('')}</div>
      </div>
    `;
  }

  if (subordinateGroup.length > 0) {
    htmlOut += `
      <div class="list-group">
        <div class="list-group-header">
          <span>4. Áreas e Lideranças Subordinadas</span>
          <span class="count-badge">${subordinateGroup.length} ${subordinateGroup.length === 1 ? 'posição' : 'posições'}</span>
        </div>
        <div class="list-grid">${subordinateGroup.map(buildListCard).join('')}</div>
      </div>
    `;
  }

  container.innerHTML = htmlOut;
}

/* ==========================================================================
   NODE DRAG & DROP (REPOSICIONAMENTO LIVRE NO MODO EDIÇÃO)
   ========================================================================== */
function handleNodeMouseDown(e, nodeId) {
  if (currentAppMode !== 'edit') return;
  if (e.button !== 0) return;
  if (e.target.closest('button')) return;

  e.stopPropagation();
  const node = mutableOrgData[nodeId];
  if (!node) return;

  draggedNodeId = nodeId;
  nodeDragStartMouseX = e.clientX;
  nodeDragStartMouseY = e.clientY;
  nodeDragInitOffsetX = Number(node.offsetX || 0);
  nodeDragInitOffsetY = Number(node.offsetY || 0);
  nodeHasMovedDuringDrag = false;

  hideTooltip();

  window.addEventListener('mousemove', handleNodeMouseMove);
  window.addEventListener('mouseup', handleNodeMouseUp);
  window.addEventListener('blur', handleNodeMouseUp);
}

function handleNodeMouseMove(e) {
  if (!draggedNodeId) return;
  const dxScreen = e.clientX - nodeDragStartMouseX;
  const dyScreen = e.clientY - nodeDragStartMouseY;

  if (!nodeHasMovedDuringDrag && Math.hypot(dxScreen, dyScreen) < 5) {
    return;
  }

  nodeHasMovedDuringDrag = true;
  const el = document.getElementById(`node-${draggedNodeId}`);
  if (!el) return;

  el.classList.add('is-dragging-node');
  const newX = Math.round(nodeDragInitOffsetX + dxScreen / currentZoom);
  const newY = Math.round(nodeDragInitOffsetY + dyScreen / currentZoom);

  mutableOrgData[draggedNodeId].offsetX = newX;
  mutableOrgData[draggedNodeId].offsetY = newY;
  ORG_DATA[draggedNodeId] = mutableOrgData[draggedNodeId];

  el.style.left = `${newX}px`;
  el.style.top = `${newY}px`;

  scheduleSvgRedraw();
}

function handleNodeMouseUp() {
  window.removeEventListener('mousemove', handleNodeMouseMove);
  window.removeEventListener('mouseup', handleNodeMouseUp);
  window.removeEventListener('blur', handleNodeMouseUp);

  if (draggedNodeId) {
    const el = document.getElementById(`node-${draggedNodeId}`);
    if (el) el.classList.remove('is-dragging-node');

    if (nodeHasMovedDuringDrag) {
      suppressNextNodeClick = true;
      setTimeout(function() { suppressNextNodeClick = false; }, 120);
      renderHierarchyCanvas();
      renderAllIcons();
      renderSvgConnections();
      persistAllChanges();
      showToast('Posição do card atualizada para todos!', 'success');
    }
  }
  draggedNodeId = null;
}

function handleNodeTouchStart(e, nodeId) {
  if (currentAppMode !== 'edit') return;
  if (e.target.closest('button') || e.touches.length !== 1) return;

  const touch = e.touches[0];
  const node = mutableOrgData[nodeId];
  if (!node) return;

  draggedNodeId = nodeId;
  nodeDragStartMouseX = touch.clientX;
  nodeDragStartMouseY = touch.clientY;
  nodeDragInitOffsetX = Number(node.offsetX || 0);
  nodeDragInitOffsetY = Number(node.offsetY || 0);
  nodeHasMovedDuringDrag = false;

  window.addEventListener('touchmove', handleNodeTouchMove, { passive: false });
  window.addEventListener('touchend', handleNodeTouchEnd);
}

function handleNodeTouchMove(e) {
  if (!draggedNodeId || e.touches.length !== 1) return;
  const touch = e.touches[0];
  const dxScreen = touch.clientX - nodeDragStartMouseX;
  const dyScreen = touch.clientY - nodeDragStartMouseY;

  if (!nodeHasMovedDuringDrag && Math.hypot(dxScreen, dyScreen) < 6) {
    return;
  }

  e.preventDefault();
  nodeHasMovedDuringDrag = true;
  const el = document.getElementById(`node-${draggedNodeId}`);
  if (!el) return;

  el.classList.add('is-dragging-node');
  const newX = Math.round(nodeDragInitOffsetX + dxScreen / currentZoom);
  const newY = Math.round(nodeDragInitOffsetY + dyScreen / currentZoom);

  mutableOrgData[draggedNodeId].offsetX = newX;
  mutableOrgData[draggedNodeId].offsetY = newY;
  ORG_DATA[draggedNodeId] = mutableOrgData[draggedNodeId];

  el.style.left = `${newX}px`;
  el.style.top = `${newY}px`;
  scheduleSvgRedraw();
}

function handleNodeTouchEnd() {
  window.removeEventListener('touchmove', handleNodeTouchMove);
  window.removeEventListener('touchend', handleNodeTouchEnd);

  if (draggedNodeId) {
    const el = document.getElementById(`node-${draggedNodeId}`);
    if (el) el.classList.remove('is-dragging-node');

    if (nodeHasMovedDuringDrag) {
      suppressNextNodeClick = true;
      setTimeout(function() { suppressNextNodeClick = false; }, 120);
      renderHierarchyCanvas();
      renderAllIcons();
      renderSvgConnections();
      persistAllChanges();
      showToast('Posição do card atualizada para todos!', 'success');
    }
  }
  draggedNodeId = null;
}

function scheduleSvgRedraw() {
  if (svgRafPending) return;
  svgRafPending = true;
  requestAnimationFrame(function() {
    svgRafPending = false;
    renderSvgConnections();
  });
}

/* ==========================================================================
   REORDENAÇÃO E MUDANÇA DE NÍVEL HIERÁRQUICO
   ========================================================================== */
function reindexTierOrders(tierGroup) {
  const peers = getSortedNodesByTier(tierGroup);
  peers.forEach(function(n, idx) {
    n.sortOrder = idx;
  });
}

function moveNodeOrder(nodeId, direction) {
  const node = mutableOrgData[nodeId];
  if (!node) return;
  reindexTierOrders(node.tierGroup);
  const peers = getSortedNodesByTier(node.tierGroup);
  const idx = peers.findIndex(function(n) { return n.id === nodeId; });
  const targetIdx = idx + direction;
  if (idx === -1 || targetIdx < 0 || targetIdx >= peers.length) {
    showToast('O card já está na extremidade deste nível.', 'info');
    return;
  }

  const neighbor = peers[targetIdx];
  const tmp = node.sortOrder;
  node.sortOrder = neighbor.sortOrder;
  neighbor.sortOrder = tmp;

  syncChildrenLists();
  renderHierarchyCanvas();
  renderListView();
  renderAllIcons();
  renderSvgConnections();
  persistAllChanges();
  showToast('Ordem dos cards atualizada!', 'success');
}

function moveNodeTier(nodeId, direction) {
  const node = mutableOrgData[nodeId];
  if (!node) return;
  const curIdx = TIER_SEQUENCE.indexOf(node.tierGroup);
  const nextIdx = curIdx + direction;
  if (curIdx === -1 || nextIdx < 0 || nextIdx >= TIER_SEQUENCE.length) {
    showToast('Este card já está no nível limite da hierarquia.', 'info');
    return;
  }

  const newTier = TIER_SEQUENCE[nextIdx];
  node.tierGroup = newTier;
  node.offsetX = 0;
  node.offsetY = 0;

  if (newTier === 'conselho') {
    node.parentId = null;
  } else if (newTier === 'ceo') {
    const conselhoNode = getSortedNodesByTier('conselho')[0];
    if (conselhoNode && conselhoNode.id !== nodeId) node.parentId = conselhoNode.id;
  } else if (newTier === 'advisory' || newTier === 'operational') {
    if (!node.parentId || node.parentId === nodeId) {
      const ceoNode = getSortedNodesByTier('ceo')[0];
      if (ceoNode && ceoNode.id !== nodeId) node.parentId = ceoNode.id;
    }
  } else if (newTier === 'subordinate') {
    if (!node.parentId || node.parentId === 'ceo' || node.parentId === 'conselho') {
      const fallbackParent = getSortedNodesByTier('operational').find(function(n) { return n.id !== nodeId; })
        || getSortedNodesByTier('advisory').find(function(n) { return n.id !== nodeId; });
      if (fallbackParent) node.parentId = fallbackParent.id;
    }
  }

  const targetPeers = getSortedNodesByTier(newTier).filter(function(n) { return n.id !== nodeId; });
  node.sortOrder = targetPeers.length;
  reindexTierOrders(newTier);

  syncChildrenLists();
  renderHierarchyCanvas();
  renderListView();
  renderAllIcons();
  renderSvgConnections();
  persistAllChanges();
  showToast('Nível hierárquico atualizado!', 'success');
}

function resetSingleNodeOffset(nodeId) {
  const targetId = nodeId || document.getElementById('edit-node-id').value;
  const node = mutableOrgData[targetId];
  if (!node) return;
  node.offsetX = 0;
  node.offsetY = 0;
  ORG_DATA[targetId] = node;

  const offsetRow = document.getElementById('edit-reset-offset-row');
  if (offsetRow) offsetRow.style.display = 'none';

  renderHierarchyCanvas();
  renderAllIcons();
  renderSvgConnections();
  persistAllChanges();
  showToast('Card alinhado à grade!', 'success');
}

function resetAllNodeOffsets() {
  Object.keys(mutableOrgData).forEach(function(id) {
    mutableOrgData[id].offsetX = 0;
    mutableOrgData[id].offsetY = 0;
    ORG_DATA[id] = mutableOrgData[id];
  });
  renderHierarchyCanvas();
  renderAllIcons();
  renderSvgConnections();
  persistAllChanges();
  showToast('Todos os cards foram alinhados à grade hierárquica!', 'success');
}

/* ==========================================================================
   CANVAS PAN & ZOOM CONTROLS
   ========================================================================== */
function centerCanvasInViewport() {
  const viewport = document.getElementById('canvas-viewport');
  const world = document.getElementById('canvas-world');
  if (!viewport || !world) return;

  const vWidth = viewport.clientWidth || window.innerWidth || 1280;
  const wWidth = world.offsetWidth || 1600;

  if (vWidth < 768) {
    currentZoom = 0.65;
  } else {
    currentZoom = Math.min(0.92, Math.max(0.62, (vWidth - 40) / wWidth));
  }
  panX = Math.round((vWidth - (wWidth * currentZoom)) / 2);
  panY = 24;

  world.classList.add('is-panning');
  applyCanvasTransform();
  requestAnimationFrame(function() {
    if (!isDragging && !canvasTouchMode) {
      world.classList.remove('is-panning');
    }
  });
}

function applyCanvasTransform() {
  const world = document.getElementById('canvas-world');
  const display = document.getElementById('zoom-text-display');
  if (world) {
    world.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
  }
  if (display) {
    display.textContent = `${Math.round(currentZoom * 100)}%`;
  }
  requestAnimationFrame(renderSvgConnections);
}

function zoomAroundViewportCenter(newZoom) {
  userHasAdjustedView = true;
  const clamped = Math.max(0.45, Math.min(1.8, newZoom));
  const viewport = document.getElementById('canvas-viewport');
  if (viewport && clamped !== currentZoom) {
    const cx = viewport.clientWidth / 2;
    const cy = viewport.clientHeight / 2;
    panX = cx - (cx - panX) * (clamped / currentZoom);
    panY = cy - (cy - panY) * (clamped / currentZoom);
  }
  currentZoom = clamped;
  applyCanvasTransform();
}

function zoomIn() {
  if (currentZoom < 1.8) zoomAroundViewportCenter(currentZoom + 0.15);
}

function zoomOut() {
  if (currentZoom > 0.45) zoomAroundViewportCenter(currentZoom - 0.15);
}

function resetCanvasTransform() {
  userHasAdjustedView = false;
  centerCanvasInViewport();
}

function panToNodeInCanvas(nodeId) {
  const viewport = document.getElementById('canvas-viewport');
  const world = document.getElementById('canvas-world');
  const el = document.getElementById(`node-${nodeId}`);
  if (!viewport || !world || !el || el.offsetParent === null) return;

  let x = 0, y = 0, cur = el, guard = 0;
  while (cur && cur !== world && guard < 12) {
    x += cur.offsetLeft || 0;
    y += cur.offsetTop || 0;
    cur = cur.offsetParent;
    guard++;
  }
  if (cur !== world) return;
  const w = el.offsetWidth || 280;
  const h = el.offsetHeight || 194;
  const screenLeft = panX + x * currentZoom;
  const screenTop = panY + y * currentZoom;
  const screenRight = screenLeft + w * currentZoom;
  const screenBottom = screenTop + h * currentZoom;

  const pad = 40;
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  if (screenLeft >= pad && screenRight <= vw - pad && screenTop >= pad && screenBottom <= vh - pad) {
    return;
  }

  panX = Math.round(vw / 2 - (x + w / 2) * currentZoom);
  panY = Math.round(vh / 2 - (y + h / 2) * currentZoom);
  applyCanvasTransform();
}

function handleCanvasWheel(e) {
  e.preventDefault();
  userHasAdjustedView = true;
  const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
  const newZoom = Math.max(0.45, Math.min(1.8, currentZoom * zoomFactor));

  const viewport = document.getElementById('canvas-viewport');
  if (!viewport) return;
  const rect = viewport.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  panX = mouseX - (mouseX - panX) * (newZoom / currentZoom);
  panY = mouseY - (mouseY - panY) * (newZoom / currentZoom);
  currentZoom = newZoom;

  applyCanvasTransform();
}

function handleCanvasMouseDown(e) {
  if (e.target.closest('.org-node') || e.target.closest('.canvas-controls-toolbar') || e.target.closest('.canvas-legend-panel') || e.target.closest('.btn')) {
    return;
  }
  isDragging = true;
  dragStartX = e.clientX - panX;
  dragStartY = e.clientY - panY;
  const world = document.getElementById('canvas-world');
  if (world) world.classList.add('is-panning');

  window.addEventListener('mousemove', handleCanvasMouseMove);
  window.addEventListener('mouseup', handleCanvasMouseUp);
  window.addEventListener('blur', handleCanvasMouseUp);
}

function handleCanvasMouseMove(e) {
  if (!isDragging) return;
  userHasAdjustedView = true;
  panX = e.clientX - dragStartX;
  panY = e.clientY - dragStartY;
  applyCanvasTransform();
}

function handleCanvasMouseUp() {
  if (!isDragging) return;
  isDragging = false;
  const world = document.getElementById('canvas-world');
  if (world) world.classList.remove('is-panning');
  window.removeEventListener('mousemove', handleCanvasMouseMove);
  window.removeEventListener('mouseup', handleCanvasMouseUp);
  window.removeEventListener('blur', handleCanvasMouseUp);
}

function handleCanvasTouchStart(e) {
  if (e.target.closest('.org-node') || e.target.closest('.canvas-controls-toolbar') || e.target.closest('.canvas-legend-panel') || e.target.closest('.btn')) {
    return;
  }
  const world = document.getElementById('canvas-world');
  if (e.touches.length === 1) {
    canvasTouchMode = 'pan';
    isDragging = true;
    dragStartX = e.touches[0].clientX - panX;
    dragStartY = e.touches[0].clientY - panY;
    if (world) world.classList.add('is-panning');
  } else if (e.touches.length === 2) {
    canvasTouchMode = 'pinch';
    isDragging = false;
    const dx = e.touches[1].clientX - e.touches[0].clientX;
    const dy = e.touches[1].clientY - e.touches[0].clientY;
    canvasTouchStartDist = Math.hypot(dx, dy) || 1;
    canvasTouchStartZoom = currentZoom;
    const viewport = document.getElementById('canvas-viewport');
    const rect = viewport ? viewport.getBoundingClientRect() : { left: 0, top: 0 };
    canvasTouchMidX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
    canvasTouchMidY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
    if (world) world.classList.add('is-panning');
  }
  window.addEventListener('touchmove', handleCanvasTouchMove, { passive: false });
  window.addEventListener('touchend', handleCanvasTouchEnd);
  window.addEventListener('touchcancel', handleCanvasTouchEnd);
}

function handleCanvasTouchMove(e) {
  if (!canvasTouchMode) return;
  e.preventDefault();
  userHasAdjustedView = true;
  if (canvasTouchMode === 'pan' && e.touches.length === 1) {
    panX = e.touches[0].clientX - dragStartX;
    panY = e.touches[0].clientY - dragStartY;
    applyCanvasTransform();
  } else if (e.touches.length === 2) {
    const dx = e.touches[1].clientX - e.touches[0].clientX;
    const dy = e.touches[1].clientY - e.touches[0].clientY;
    const dist = Math.hypot(dx, dy) || 1;
    const newZoom = Math.max(0.45, Math.min(1.8, canvasTouchStartZoom * (dist / canvasTouchStartDist)));
    panX = canvasTouchMidX - (canvasTouchMidX - panX) * (newZoom / currentZoom);
    panY = canvasTouchMidY - (canvasTouchMidY - panY) * (newZoom / currentZoom);
    currentZoom = newZoom;
    applyCanvasTransform();
  }
}

function handleCanvasTouchEnd() {
  canvasTouchMode = null;
  isDragging = false;
  const world = document.getElementById('canvas-world');
  if (world) world.classList.remove('is-panning');
  window.removeEventListener('touchmove', handleCanvasTouchMove);
  window.removeEventListener('touchend', handleCanvasTouchEnd);
  window.removeEventListener('touchcancel', handleCanvasTouchEnd);
}

/* ==========================================================================
   RENDERIZADOR DE CONEXÕES SVG (ROTEAMENTO ORTOGONAL SEM SOBREPOSIÇÃO)
   ========================================================================== */
function renderSvgConnections() {
  const svg = document.getElementById('connections-svg');
  const world = document.getElementById('canvas-world');
  if (!svg || !world) return;

  const worldRect = world.getBoundingClientRect();
  const wWidth = world.offsetWidth || 1600;
  const wHeight = world.offsetHeight || 1200;

  svg.style.width = wWidth + 'px';
  svg.style.height = wHeight + 'px';
  svg.setAttribute('width', wWidth);
  svg.setAttribute('height', wHeight);
  svg.setAttribute('viewBox', `0 0 ${wWidth} ${wHeight}`);
  svg.setAttribute('preserveAspectRatio', 'none');

  function getRelativeBoxToWorld(el) {
    if (typeof el.offsetWidth === 'number' && el.offsetWidth > 0 && el.offsetParent) {
      let x = 0;
      let y = 0;
      let cur = el;
      let guard = 0;
      while (cur && cur !== world && guard < 12) {
        x += cur.offsetLeft || 0;
        y += cur.offsetTop || 0;
        cur = cur.offsetParent;
        guard++;
      }
      if (cur === world) {
        return {
          left: x,
          top: y,
          right: x + el.offsetWidth,
          bottom: y + el.offsetHeight,
          cx: x + el.offsetWidth / 2,
          cy: y + el.offsetHeight / 2,
          width: el.offsetWidth,
          height: el.offsetHeight
        };
      }
    }
    const rect = el.getBoundingClientRect();
    const left = (rect.left - worldRect.left) / currentZoom;
    const top = (rect.top - worldRect.top) / currentZoom;
    const width = rect.width / currentZoom;
    const height = rect.height / currentZoom;
    return {
      left: left,
      top: top,
      right: left + width,
      bottom: top + height,
      cx: left + width / 2,
      cy: top + height / 2,
      width: width,
      height: height
    };
  }

  const cardBoxes = {};
  Object.keys(mutableOrgData).forEach(function(id) {
    const el = document.getElementById(`node-${id}`);
    if (!el || el.offsetParent === null) return;
    const box = getRelativeBoxToWorld(el);
    box.id = id;
    const node = mutableOrgData[id];
    box.isMoved = (Math.abs(Number(node.offsetX || 0)) > 1 || Math.abs(Number(node.offsetY || 0)) > 1);
    cardBoxes[id] = box;
  });

  const usedH = [];
  const usedV = [];

  function registerSegmentsFromPoints(pts, ownerKey) {
    if (!pts || pts.length < 2) return;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (Math.abs(a.y - b.y) < 0.8 && Math.abs(a.x - b.x) > 1) {
        usedH.push({ y: (a.y + b.y) / 2, x1: Math.min(a.x, b.x), x2: Math.max(a.x, b.x), ownerKey: ownerKey });
      } else if (Math.abs(a.x - b.x) < 0.8 && Math.abs(a.y - b.y) > 1) {
        usedV.push({ x: (a.x + b.x) / 2, y1: Math.min(a.y, b.y), y2: Math.max(a.y, b.y), ownerKey: ownerKey });
      }
    }
  }

  function hasSegmentOverlapH(y, x1, x2, ownerKey, minSep) {
    const sep = minSep || 9;
    const lo = Math.min(x1, x2) + 1;
    const hi = Math.max(x1, x2) - 1;
    if (hi <= lo) return false;
    return usedH.some(function(s) {
      if (s.ownerKey === ownerKey) return false;
      if (Math.abs(s.y - y) >= sep) return false;
      return s.x2 > lo - 3 && s.x1 < hi + 3;
    });
  }

  function hasSegmentOverlapV(x, y1, y2, ownerKey, minSep) {
    const sep = minSep || 9;
    const lo = Math.min(y1, y2) + 1;
    const hi = Math.max(y1, y2) - 1;
    if (hi <= lo) return false;
    return usedV.some(function(s) {
      if (s.ownerKey === ownerKey) return false;
      if (Math.abs(s.x - x) >= sep) return false;
      return s.y2 > lo - 3 && s.y1 < hi + 3;
    });
  }

  function buildRoundedOrthogonalPath(pts, radius) {
    if (!pts || pts.length < 2) return '';
    const cleaned = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const prev = cleaned[cleaned.length - 1];
      if (Math.hypot(pts[i].x - prev.x, pts[i].y - prev.y) > 0.5) {
        cleaned.push(pts[i]);
      }
    }
    if (cleaned.length < 2) return '';
    let d = `M ${cleaned[0].x.toFixed(1)} ${cleaned[0].y.toFixed(1)}`;
    const rMax = radius || 6;
    for (let i = 1; i < cleaned.length - 1; i++) {
      const pPrev = cleaned[i - 1];
      const pCurr = cleaned[i];
      const pNext = cleaned[i + 1];
      const v1x = pCurr.x - pPrev.x;
      const v1y = pCurr.y - pPrev.y;
      const v2x = pNext.x - pCurr.x;
      const v2y = pNext.y - pCurr.y;
      const len1 = Math.hypot(v1x, v1y);
      const len2 = Math.hypot(v2x, v2y);
      const r = Math.min(rMax, len1 / 2, len2 / 2);
      if (r < 1) {
        d += ` L ${pCurr.x.toFixed(1)} ${pCurr.y.toFixed(1)}`;
      } else {
        const sx = pCurr.x - (v1x / len1) * r;
        const sy = pCurr.y - (v1y / len1) * r;
        const ex = pCurr.x + (v2x / len2) * r;
        const ey = pCurr.y + (v2y / len2) * r;
        d += ` L ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${pCurr.x.toFixed(1)} ${pCurr.y.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      }
    }
    const last = cleaned[cleaned.length - 1];
    d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
    return d;
  }

  function hasHorizontalBlocker(y, x1, x2, excludeIds) {
    const xMin = Math.min(x1, x2) + 2;
    const xMax = Math.max(x1, x2) - 2;
    if (xMax <= xMin) return false;
    const pad = 4;
    return Object.values(cardBoxes).some(function(b) {
      if (excludeIds && excludeIds.indexOf(b.id) !== -1) return false;
      return b.right > xMin && b.left < xMax && y >= (b.top - pad) && y <= (b.bottom + pad);
    });
  }

  function hasVerticalBlocker(x, y1, y2, excludeIds) {
    const yMin = Math.min(y1, y2) + 2;
    const yMax = Math.max(y1, y2) - 2;
    if (yMax <= yMin) return false;
    const pad = 4;
    return Object.values(cardBoxes).some(function(b) {
      if (excludeIds && excludeIds.indexOf(b.id) !== -1) return false;
      return b.bottom > yMin && b.top < yMax && x >= (b.left - pad) && x <= (b.right + pad);
    });
  }

  function isPointInsideOtherCard(x, y, excludeIds) {
    const pad = 4;
    return Object.values(cardBoxes).some(function(b) {
      if (excludeIds && excludeIds.indexOf(b.id) !== -1) return false;
      return x >= (b.left - pad) && x <= (b.right + pad) && y >= (b.top - pad) && y <= (b.bottom + pad);
    });
  }

  function getFirstBlockerBelow(x, yStart, yLimit, excludeIds) {
    let bestTop = yLimit;
    Object.values(cardBoxes).forEach(function(b) {
      if (excludeIds && excludeIds.indexOf(b.id) !== -1) return;
      if (x >= b.left - 4 && x <= b.right + 4 && b.bottom > yStart + 2 && b.top < bestTop) {
        bestTop = b.top;
      }
    });
    return bestTop;
  }

  function getLastBlockerAbove(x, yEnd, yLimit, excludeIds) {
    let bestBottom = yLimit;
    Object.values(cardBoxes).forEach(function(b) {
      if (excludeIds && excludeIds.indexOf(b.id) !== -1) return;
      if (x >= b.left - 4 && x <= b.right + 4 && b.top < yEnd - 2 && b.bottom > bestBottom) {
        bestBottom = b.bottom;
      }
    });
    return bestBottom;
  }

  function allocVerticalX(preferredX, yStart, yEnd, excludeIds, ownerKey) {
    const yMin = Math.min(yStart, yEnd) + 4;
    const yMax = Math.max(yStart, yEnd) - 4;
    const pad = 6;
    const blockers = (yMax > yMin)
      ? Object.values(cardBoxes).filter(function(b) {
          if (excludeIds && excludeIds.indexOf(b.id) !== -1) return false;
          return b.bottom > yMin && b.top < yMax;
        }).sort(function(a, b) { return a.left - b.left; })
      : [];

    const merged = [];
    blockers.forEach(function(b) {
      const bL = b.left - pad;
      const bR = b.right + pad;
      if (merged.length === 0 || bL > merged[merged.length - 1].right) {
        merged.push({ left: bL, right: bR });
      } else {
        merged[merged.length - 1].right = Math.max(merged[merged.length - 1].right, bR);
      }
    });

    const isClear = function(x) {
      if (hasVerticalBlocker(x, yStart, yEnd, excludeIds)) return false;
      if (ownerKey && hasSegmentOverlapV(x, yStart, yEnd, ownerKey, 9)) return false;
      return true;
    };

    if (isClear(preferredX)) return preferredX;

    const candidates = [];
    const addLaneOffsets = function(baseX, minX, maxX) {
      const clamped = Math.max(minX, Math.min(maxX, baseX));
      candidates.push(clamped);
      for (let step = 10; step <= 120; step += 10) {
        if (clamped - step >= minX) candidates.push(clamped - step);
        if (clamped + step <= maxX) candidates.push(clamped + step);
      }
    };

    if (merged.length === 0) {
      addLaneOffsets(preferredX, -400, wWidth + 400);
    } else {
      for (let k = 0; k < 10; k++) candidates.push(merged[0].left - 14 - k * 10);
      for (let i = 0; i < merged.length - 1; i++) {
        const gL = merged[i].right + 4;
        const gR = merged[i + 1].left - 4;
        if (gR >= gL) {
          addLaneOffsets(preferredX, gL, gR);
          candidates.push((gL + gR) / 2);
        }
      }
      for (let k = 0; k < 10; k++) candidates.push(merged[merged.length - 1].right + 14 + k * 10);
    }

    let bestX = null;
    let bestDist = Infinity;
    for (let i = 0; i < candidates.length; i++) {
      const cx = candidates[i];
      if (!isClear(cx)) continue;
      const dist = Math.abs(cx - preferredX);
      if (dist < bestDist) {
        bestDist = dist;
        bestX = cx;
      }
    }
    if (bestX !== null) return bestX;

    for (let i = 0; i < candidates.length; i++) {
      if (!hasVerticalBlocker(candidates[i], yStart, yEnd, excludeIds)) return candidates[i];
    }
    return preferredX;
  }

  function allocHorizontalY(preferredY, xStart, xEnd, excludeIds, ownerKey, minAllowedY, maxAllowedY) {
    const xMin = Math.min(xStart, xEnd) + 4;
    const xMax = Math.max(xStart, xEnd) - 4;
    const pad = 6;
    const blockers = (xMax > xMin)
      ? Object.values(cardBoxes).filter(function(b) {
          if (excludeIds && excludeIds.indexOf(b.id) !== -1) return false;
          return b.right > xMin && b.left < xMax;
        }).sort(function(a, b) { return a.top - b.top; })
      : [];

    const inBounds = function(y) {
      if (typeof minAllowedY === 'number' && y < minAllowedY) return false;
      if (typeof maxAllowedY === 'number' && y > maxAllowedY) return false;
      return true;
    };

    const isClear = function(y, sep) {
      if (!inBounds(y)) return false;
      if (hasHorizontalBlocker(y, xStart, xEnd, excludeIds)) return false;
      if (ownerKey && hasSegmentOverlapH(y, xStart, xEnd, ownerKey, sep || 9)) return false;
      return true;
    };

    if (isClear(preferredY, 9)) return preferredY;

    const merged = [];
    blockers.forEach(function(b) {
      const bT = b.top - pad;
      const bB = b.bottom + pad;
      if (merged.length === 0 || bT > merged[merged.length - 1].bottom) {
        merged.push({ top: bT, bottom: bB });
      } else {
        merged[merged.length - 1].bottom = Math.max(merged[merged.length - 1].bottom, bB);
      }
    });

    const candidates = [];
    const addOffsets = function(baseY, lo, hi) {
      if (hi < lo) return;
      const clamped = Math.max(lo, Math.min(hi, baseY));
      candidates.push(clamped);
      for (let step = 10; step <= 140; step += 10) {
        if (clamped - step >= lo) candidates.push(clamped - step);
        if (clamped + step <= hi) candidates.push(clamped + step);
      }
    };

    const boundLo = (typeof minAllowedY === 'number') ? minAllowedY : -400;
    const boundHi = (typeof maxAllowedY === 'number') ? maxAllowedY : wHeight + 600;

    if (merged.length === 0) {
      addOffsets(preferredY, boundLo, boundHi);
    } else {
      addOffsets(preferredY, boundLo, Math.min(boundHi, merged[0].top - 6));
      for (let i = 0; i < merged.length - 1; i++) {
        const gT = merged[i].bottom + 6;
        const gB = merged[i + 1].top - 6;
        if (gB >= gT) {
          addOffsets(preferredY, Math.max(boundLo, gT), Math.min(boundHi, gB));
          const mid = (gT + gB) / 2;
          if (inBounds(mid)) candidates.push(mid);
        }
      }
      addOffsets(preferredY, Math.max(boundLo, merged[merged.length - 1].bottom + 6), boundHi);
    }

    const passes = [9, 6];
    for (let p = 0; p < passes.length; p++) {
      let bestY = null;
      let bestDist = Infinity;
      for (let i = 0; i < candidates.length; i++) {
        const cy = candidates[i];
        if (!isClear(cy, passes[p])) continue;
        const dist = Math.abs(cy - preferredY);
        if (dist < bestDist) {
          bestDist = dist;
          bestY = cy;
        }
      }
      if (bestY !== null) return bestY;
    }

    for (let i = 0; i < candidates.length; i++) {
      if (inBounds(candidates[i]) && !hasHorizontalBlocker(candidates[i], xStart, xEnd, excludeIds)) {
        return candidates[i];
      }
    }
    return preferredY;
  }

  function emitPath(pts, cls, ownerKey, fromId, toId) {
    registerSegmentsFromPoints(pts, ownerKey);
    const d = buildRoundedOrthogonalPath(pts, 6);
    if (!d) return '';
    const attrs = (fromId && toId) ? ` data-from="${escapeHtml(fromId)}" data-to="${escapeHtml(toId)}"` : '';
    return `<path d="${d}" class="${cls}"${attrs}></path>`;
  }

  function pathHitsAnyCard(pts, excludeIds) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (Math.abs(a.y - b.y) < 0.8) {
        if (hasHorizontalBlocker((a.y + b.y) / 2, a.x, b.x, excludeIds)) return true;
      } else if (Math.abs(a.x - b.x) < 0.8) {
        if (hasVerticalBlocker((a.x + b.x) / 2, a.y, b.y, excludeIds)) return true;
      }
    }
    return false;
  }

  function drawSmartConnector(fromId, toId, customExitX) {
    const pBox = cardBoxes[fromId];
    const cBox = cardBoxes[toId];
    if (!pBox || !cBox) return '';

    const isHighlighted = (selectedNodeId === fromId || selectedNodeId === toId);
    const cls = `conn-path ${isHighlighted ? 'highlighted' : ''}`;
    const ownerKey = `edge:${fromId}->${toId}`;
    const excl = [fromId, toId];
    const startX = (typeof customExitX === 'number') ? customExitX : pBox.cx;

    const topBlocked = isPointInsideOtherCard(cBox.cx, cBox.top - 6, excl);
    const entryTargets = [];
    if (!topBlocked) entryTargets.push({ side: 'top', x: cBox.cx, y: cBox.top, approachY: cBox.top - 14 });
    if (!isPointInsideOtherCard(cBox.cx, cBox.bottom + 6, excl)) entryTargets.push({ side: 'bottom', x: cBox.cx, y: cBox.bottom, approachY: cBox.bottom + 14 });
    if (!isPointInsideOtherCard(cBox.right + 6, cBox.cy, excl)) entryTargets.push({ side: 'right', x: cBox.right, y: cBox.cy, approachX: cBox.right + 16 });
    if (!isPointInsideOtherCard(cBox.left - 6, cBox.cy, excl)) entryTargets.push({ side: 'left', x: cBox.left, y: cBox.cy, approachX: cBox.left - 16 });
    if (entryTargets.length === 0) entryTargets.push({ side: 'top', x: cBox.cx, y: cBox.top, approachY: cBox.top - 14 });
    const primaryEntry = entryTargets[0];

    if (!topBlocked && cBox.top >= pBox.bottom + 14) {
      const channelX = allocVerticalX(startX, pBox.bottom, cBox.top, excl, ownerKey);
      const childClearX = !hasVerticalBlocker(cBox.cx, pBox.bottom, cBox.top, excl) &&
                          !hasSegmentOverlapV(cBox.cx, pBox.bottom + 8, cBox.top, ownerKey, 8);

      if (Math.abs(startX - cBox.cx) < 2 && Math.abs(channelX - startX) < 2 &&
          !hasVerticalBlocker(startX, pBox.bottom, cBox.top, excl)) {
        return emitPath([{ x: startX, y: pBox.bottom }, { x: cBox.cx, y: cBox.top }], cls, ownerKey, fromId, toId);
      }

      if (Math.abs(channelX - startX) < 2 && childClearX) {
        const rawMidY = pBox.bottom + (cBox.top - pBox.bottom) / 2;
        const clearMidY = allocHorizontalY(rawMidY, startX, cBox.cx, excl, ownerKey, pBox.bottom + 8, cBox.top - 8);
        const pts = [
          { x: startX, y: pBox.bottom },
          { x: startX, y: clearMidY },
          { x: cBox.cx, y: clearMidY },
          { x: cBox.cx, y: cBox.top }
        ];
        if (!pathHitsAnyCard(pts, excl)) return emitPath(pts, cls, ownerKey, fromId, toId);
      }

      const firstStartBlockTop = getFirstBlockerBelow(startX, pBox.bottom, cBox.top, excl);
      const maxYOut = Math.min(cBox.top - 16, firstStartBlockTop - 8);
      if (maxYOut >= pBox.bottom + 8) {
        const yOutRaw = Math.min(maxYOut, pBox.bottom + 16);
        const yOut = allocHorizontalY(yOutRaw, startX, channelX, excl, ownerKey, pBox.bottom + 8, maxYOut);
        const lastChildBlockBottom = getLastBlockerAbove(cBox.cx, cBox.top, yOut + 8, excl);
        const minYIn = Math.max(yOut + 8, pBox.bottom + 12, lastChildBlockBottom + 8);
        if (minYIn <= cBox.top - 8) {
          const yInRaw = Math.max(minYIn, cBox.top - 16);
          const yIn = allocHorizontalY(yInRaw, channelX, cBox.cx, excl, ownerKey, minYIn, cBox.top - 8);
          const finalChannelX = (yIn > yOut) ? allocVerticalX(channelX, yOut, yIn, excl, ownerKey) : channelX;
          const pts = [
            { x: startX, y: pBox.bottom },
            { x: startX, y: yOut },
            { x: finalChannelX, y: yOut },
            { x: finalChannelX, y: yIn },
            { x: cBox.cx, y: yIn },
            { x: cBox.cx, y: cBox.top }
          ];
          if (!pathHitsAnyCard(pts, excl)) return emitPath(pts, cls, ownerKey, fromId, toId);
        }
      }
    }

    if (cBox.bottom <= pBox.top - 14 && !isPointInsideOtherCard(cBox.cx, cBox.bottom + 6, excl)) {
      const midY = cBox.bottom + (pBox.top - cBox.bottom) / 2;
      const channelX = allocVerticalX(startX, cBox.bottom, pBox.top, excl, ownerKey);
      if (Math.abs(startX - cBox.cx) < 2 && Math.abs(channelX - startX) < 2 &&
          !hasVerticalBlocker(startX, cBox.bottom, pBox.top, excl)) {
        return emitPath([{ x: startX, y: pBox.top }, { x: cBox.cx, y: cBox.bottom }], cls, ownerKey, fromId, toId);
      }
      const yExit = allocHorizontalY(midY, startX, cBox.cx, excl, ownerKey, cBox.bottom + 8, pBox.top - 8);
      const pts = [
        { x: startX, y: pBox.top },
        { x: startX, y: yExit },
        { x: cBox.cx, y: yExit },
        { x: cBox.cx, y: cBox.bottom }
      ];
      if (!pathHitsAnyCard(pts, excl)) return emitPath(pts, cls, ownerKey, fromId, toId);
    }

    if (cBox.left >= pBox.right + 18) {
      const midX = allocVerticalX(pBox.right + (cBox.left - pBox.right) / 2, pBox.cy, cBox.cy, excl, ownerKey);
      const pts = [
        { x: pBox.right, y: pBox.cy },
        { x: midX, y: pBox.cy },
        { x: midX, y: cBox.cy },
        { x: cBox.left, y: cBox.cy }
      ];
      if (!pathHitsAnyCard(pts, excl)) return emitPath(pts, cls, ownerKey, fromId, toId);
    }
    if (cBox.right <= pBox.left - 18) {
      const midX = allocVerticalX(cBox.right + (pBox.left - cBox.right) / 2, pBox.cy, cBox.cy, excl, ownerKey);
      const pts = [
        { x: pBox.left, y: pBox.cy },
        { x: midX, y: pBox.cy },
        { x: midX, y: cBox.cy },
        { x: cBox.right, y: cBox.cy }
      ];
      if (!pathHitsAnyCard(pts, excl)) return emitPath(pts, cls, ownerKey, fromId, toId);
    }

    const goRight = (cBox.cx >= pBox.cx);
    const sideAnchorList = goRight
      ? [
          { x: pBox.right, y: pBox.cy, type: 'right', dir: 1 },
          { x: pBox.left, y: pBox.cy, type: 'left', dir: -1 },
          { x: startX, y: pBox.bottom, type: 'bottom', dir: 1 }
        ]
      : [
          { x: pBox.left, y: pBox.cy, type: 'left', dir: -1 },
          { x: pBox.right, y: pBox.cy, type: 'right', dir: 1 },
          { x: startX, y: pBox.bottom, type: 'bottom', dir: -1 }
        ];

    for (let ai = 0; ai < sideAnchorList.length; ai++) {
      const anc = sideAnchorList[ai];
      if (isPointInsideOtherCard(anc.x + (anc.type === 'right' ? 6 : (anc.type === 'left' ? -6 : 0)),
                                 anc.y + (anc.type === 'bottom' ? 6 : 0), excl)) {
        continue;
      }
      for (let ei = 0; ei < entryTargets.length; ei++) {
        const tgt = entryTargets[ei];
        const prefSideX = (anc.dir > 0)
          ? Math.max(pBox.right, cBox.right) + 22
          : Math.min(pBox.left, cBox.left) - 22;

        if (tgt.side === 'top' || tgt.side === 'bottom') {
          const approachY = (tgt.side === 'top')
            ? allocHorizontalY(tgt.y - 14, prefSideX, tgt.x, excl, ownerKey, null, tgt.y - 6)
            : allocHorizontalY(tgt.y + 14, prefSideX, tgt.x, excl, ownerKey, tgt.y + 6, null);

          let yStart = anc.y;
          if (anc.type === 'bottom') {
            const firstBlk = getFirstBlockerBelow(anc.x, pBox.bottom, pBox.bottom + 120, excl);
            const maxB = Math.max(pBox.bottom + 8, firstBlk - 8);
            yStart = allocHorizontalY(pBox.bottom + 14, anc.x, prefSideX, excl, ownerKey, pBox.bottom + 8, maxB);
          }
          const sideX = allocVerticalX(prefSideX, Math.min(yStart, approachY), Math.max(yStart, approachY), excl, ownerKey);
          const pts = (anc.type === 'bottom')
            ? [
                { x: anc.x, y: anc.y },
                { x: anc.x, y: yStart },
                { x: sideX, y: yStart },
                { x: sideX, y: approachY },
                { x: tgt.x, y: approachY },
                { x: tgt.x, y: tgt.y }
              ]
            : [
                { x: anc.x, y: anc.y },
                { x: sideX, y: anc.y },
                { x: sideX, y: approachY },
                { x: tgt.x, y: approachY },
                { x: tgt.x, y: tgt.y }
              ];
          if (!pathHitsAnyCard(pts, excl)) return emitPath(pts, cls, ownerKey, fromId, toId);
        } else {
          const approachX = tgt.approachX;
          let yStart = anc.y;
          if (anc.type === 'bottom') {
            const firstBlk = getFirstBlockerBelow(anc.x, pBox.bottom, pBox.bottom + 120, excl);
            yStart = allocHorizontalY(pBox.bottom + 14, anc.x, approachX, excl, ownerKey, pBox.bottom + 8, Math.max(pBox.bottom + 8, firstBlk - 8));
          }
          const sideX = allocVerticalX(prefSideX, Math.min(yStart, tgt.y), Math.max(yStart, tgt.y), excl, ownerKey);
          const bridgeY = allocHorizontalY(tgt.y, sideX, approachX, excl, ownerKey);
          const pts = (anc.type === 'bottom')
            ? [
                { x: anc.x, y: anc.y },
                { x: anc.x, y: yStart },
                { x: sideX, y: yStart },
                { x: sideX, y: bridgeY },
                { x: approachX, y: bridgeY },
                { x: approachX, y: tgt.y },
                { x: tgt.x, y: tgt.y }
              ]
            : [
                { x: anc.x, y: anc.y },
                { x: sideX, y: anc.y },
                { x: sideX, y: bridgeY },
                { x: approachX, y: bridgeY },
                { x: approachX, y: tgt.y },
                { x: tgt.x, y: tgt.y }
              ];
          if (!pathHitsAnyCard(pts, excl)) return emitPath(pts, cls, ownerKey, fromId, toId);
        }
      }
    }

    const allLefts = Object.values(cardBoxes).map(function(b) { return b.left; });
    const allRights = Object.values(cardBoxes).map(function(b) { return b.right; });
    const allBottoms = Object.values(cardBoxes).map(function(b) { return b.bottom; });
    const globalOutX = goRight
      ? (Math.max.apply(null, allRights) + 26)
      : (Math.min.apply(null, allLefts) - 26);
    const safeOutX = allocVerticalX(globalOutX, Math.min(pBox.cy, cBox.cy), Math.max.apply(null, allBottoms) + 30, excl, ownerKey);
    const safeBotY = allocHorizontalY(Math.max.apply(null, allBottoms) + 22, safeOutX, primaryEntry.x, excl, ownerKey);
    const fallbackPts = (primaryEntry.side === 'bottom')
      ? [
          { x: goRight ? pBox.right : pBox.left, y: pBox.cy },
          { x: safeOutX, y: pBox.cy },
          { x: safeOutX, y: safeBotY },
          { x: primaryEntry.x, y: safeBotY },
          { x: primaryEntry.x, y: primaryEntry.y }
        ]
      : [
          { x: goRight ? pBox.right : pBox.left, y: pBox.cy },
          { x: safeOutX, y: pBox.cy },
          { x: safeOutX, y: primaryEntry.y },
          { x: primaryEntry.x, y: primaryEntry.y }
        ];
    return emitPath(fallbackPts, cls, ownerKey, fromId, toId);
  }

  function drawIndependentEdges(parentId, childIds, reserveCenter) {
    if (!childIds || childIds.length === 0) return '';
    const pBox = cardBoxes[parentId];
    if (!pBox) return '';

    const sorted = childIds.slice().filter(function(cid) {
      return !!cardBoxes[cid];
    }).sort(function(a, b) {
      return cardBoxes[a].cx - cardBoxes[b].cx;
    });

    let out = '';
    const n = sorted.length;
    sorted.forEach(function(cid, idx) {
      let exitX = pBox.cx;
      if (n > 1 || reserveCenter) {
        const span = Math.min(108, Math.max(28, (n + (reserveCenter ? 1 : 0)) * 18));
        const step = (n === 1) ? 0 : (span / (n - 1));
        let offset = (n === 1) ? (cardBoxes[cid].cx >= pBox.cx ? 18 : -18) : (-span / 2 + idx * step);
        if (reserveCenter && Math.abs(offset) < 10) {
          offset = (offset >= 0) ? 14 : -14;
        }
        exitX = Math.max(pBox.left + 20, Math.min(pBox.right - 20, pBox.cx + offset));
      }
      out += drawSmartConnector(parentId, cid, exitX);
    });
    return out;
  }

  function drawGroupedBusRows(parentId, childIds, options) {
    if (!childIds || childIds.length === 0) return '';
    const opts = options || {};
    const pBox = cardBoxes[parentId];
    if (!pBox) return '';

    const aligned = [];
    const free = [];
    childIds.forEach(function(cid) {
      const cBox = cardBoxes[cid];
      if (!cBox) return;
      if (!cBox.isMoved && cBox.top >= pBox.bottom + 16) {
        aligned.push(cBox);
      } else {
        free.push(cid);
      }
    });

    let out = '';

    aligned.sort(function(a, b) { return a.top - b.top || a.cx - b.cx; });
    const rows = [];
    aligned.forEach(function(box) {
      const lastRow = rows[rows.length - 1];
      if (!lastRow || Math.abs(box.top - lastRow.refTop) > 28) {
        rows.push({ refTop: box.top, maxBottom: box.bottom, boxes: [box] });
      } else {
        lastRow.boxes.push(box);
        lastRow.maxBottom = Math.max(lastRow.maxBottom, box.bottom);
      }
    });

    const ownerKey = opts.ownerKey || (`bus:${parentId}`);
    let currentFeedX = (typeof opts.startFeedX === 'number') ? opts.startFeedX : pBox.cx;
    let currentFeedY = (typeof opts.startFeedY === 'number') ? opts.startFeedY : pBox.bottom;
    let prevRowMinX = currentFeedX;
    let prevRowMaxX = currentFeedX;
    let hasValidFeed = true;

    if (opts.useLeftSpine && rows.length > 0) {
      const spineX = allocVerticalX(opts.spineX, pBox.cy, rows[0].refTop - 16, [parentId], ownerKey);
      const spineHighlight = aligned.some(function(b) { return b.id === selectedNodeId; }) || selectedNodeId === parentId;
      const spineCls = `conn-path ${spineHighlight ? 'highlighted' : ''}`;

      if (pBox.left >= spineX + 20 && !hasHorizontalBlocker(pBox.cy, spineX, pBox.left, [parentId])) {
        out += emitPath([{ x: pBox.left, y: pBox.cy }, { x: spineX, y: pBox.cy }], spineCls, ownerKey);
        currentFeedX = spineX;
        currentFeedY = pBox.cy;
        prevRowMinX = spineX;
        prevRowMaxX = spineX;
      } else {
        const topCorridorY = allocHorizontalY(pBox.bottom + 14, spineX, pBox.cx, [parentId], ownerKey);
        out += emitPath([
          { x: pBox.cx, y: pBox.bottom },
          { x: pBox.cx, y: topCorridorY },
          { x: spineX, y: topCorridorY }
        ], spineCls, ownerKey);
        currentFeedX = spineX;
        currentFeedY = topCorridorY;
        prevRowMinX = spineX;
        prevRowMaxX = spineX;
      }
    }

    rows.forEach(function(row, rowIdx) {
      row.boxes.sort(function(a, b) { return a.cx - b.cx; });
      const rowTop = Math.min.apply(null, row.boxes.map(function(b) { return b.top; }));
      const rowIds = row.boxes.map(function(b) { return b.id; });
      const excl = [parentId].concat(rowIds);

      let desiredBusY;
      if (rowIdx === 0) {
        const defaultBusY = (typeof opts.preferredStartBusY === 'number')
          ? opts.preferredStartBusY
          : (pBox.bottom + Math.min(26, (rowTop - pBox.bottom) / 2));
        desiredBusY = Math.min(defaultBusY, rowTop - 16);
      } else {
        const prevBottom = rows[rowIdx - 1].maxBottom;
        desiredBusY = prevBottom + (rowTop - prevBottom) / 2;
        if (desiredBusY > rowTop - 14) desiredBusY = rowTop - 14;
      }

      const minBusBound = (rowIdx === 0)
        ? (opts.useLeftSpine ? (rowTop - 36) : Math.max(currentFeedY + 8, rowTop - 36))
        : (rows[rowIdx - 1].maxBottom + 6);
      const maxBusBound = rowTop - 8;

      const rowCenterSpanMin = row.boxes[0].cx;
      const rowCenterSpanMax = row.boxes[row.boxes.length - 1].cx;
      let busY = allocHorizontalY(desiredBusY, rowCenterSpanMin, rowCenterSpanMax, excl, ownerKey, minBusBound, maxBusBound);

      const clearBoxes = [];
      const blockedIds = [];
      row.boxes.forEach(function(b) {
        if (hasVerticalBlocker(b.cx, busY, b.top, excl)) {
          blockedIds.push(b.id);
        } else {
          clearBoxes.push(b);
        }
      });

      if (clearBoxes.length === 0) {
        row.boxes.forEach(function(b) { free.push(b.id); });
        return;
      }

      const clearMinCx = clearBoxes[0].cx;
      const clearMaxCx = clearBoxes[clearBoxes.length - 1].cx;
      if (hasHorizontalBlocker(busY, clearMinCx, clearMaxCx, excl)) {
        const altY = allocHorizontalY(busY, clearMinCx, clearMaxCx, excl, ownerKey, minBusBound, maxBusBound);
        if (!hasHorizontalBlocker(altY, clearMinCx, clearMaxCx, excl)) busY = altY;
      }

      const groups = [[clearBoxes[0]]];
      for (let i = 1; i < clearBoxes.length; i++) {
        const prevB = clearBoxes[i - 1];
        const curB = clearBoxes[i];
        if (hasHorizontalBlocker(busY, prevB.cx, curB.cx, excl)) {
          groups.push([curB]);
        } else {
          groups[groups.length - 1].push(curB);
        }
      }

      let bestGroupIdx = 0;
      for (let gi = 1; gi < groups.length; gi++) {
        if (groups[gi].length > groups[bestGroupIdx].length) {
          bestGroupIdx = gi;
        } else if (groups[gi].length === groups[bestGroupIdx].length) {
          const distGi = Math.min(Math.abs(groups[gi][0].cx - currentFeedX), Math.abs(groups[gi][groups[gi].length - 1].cx - currentFeedX));
          const distBest = Math.min(Math.abs(groups[bestGroupIdx][0].cx - currentFeedX), Math.abs(groups[bestGroupIdx][groups[bestGroupIdx].length - 1].cx - currentFeedX));
          if (distGi < distBest) bestGroupIdx = gi;
        }
      }
      const finalClear = groups[bestGroupIdx];
      for (let gi = 0; gi < groups.length; gi++) {
        if (gi !== bestGroupIdx) groups[gi].forEach(function(b) { blockedIds.push(b.id); });
      }

      const anyHighlighted = finalClear.some(function(b) { return b.id === selectedNodeId; }) || selectedNodeId === parentId;
      const clearIds = finalClear.map(function(b) { return b.id; });
      const railExcl = [parentId].concat(clearIds);

      const railBoxMinCx = finalClear[0].cx;
      const railBoxMaxCx = finalClear[finalClear.length - 1].cx;

      let targetJoinX = currentFeedX;
      if (hasHorizontalBlocker(busY, Math.min(currentFeedX, railBoxMinCx), Math.max(currentFeedX, railBoxMaxCx), railExcl)) {
        const prefJoin = (currentFeedX < railBoxMinCx) ? railBoxMinCx : (currentFeedX > railBoxMaxCx ? railBoxMaxCx : currentFeedX);
        targetJoinX = allocVerticalX(prefJoin, currentFeedY, busY, railExcl, ownerKey);
      }

      let channelX;
      if (opts.useLeftSpine && !hasVerticalBlocker(targetJoinX, currentFeedY, busY, railExcl) && !hasSegmentOverlapV(targetJoinX, currentFeedY, busY, ownerKey, 8)) {
        channelX = targetJoinX;
      } else {
        channelX = allocVerticalX(targetJoinX, currentFeedY, busY, railExcl, ownerKey);
      }

      const railXs = finalClear.map(function(b) { return b.cx; }).concat([channelX]);
      const minX = Math.min.apply(null, railXs);
      const maxX = Math.max.apply(null, railXs);

      let railStartX = minX;
      let railEndX = maxX;
      let entryJoinX = channelX;
      if (hasHorizontalBlocker(busY, minX, maxX, railExcl)) {
        const reBusY = allocHorizontalY(busY, minX, maxX, railExcl, ownerKey, minBusBound, maxBusBound);
        if (!hasHorizontalBlocker(reBusY, minX, maxX, railExcl)) {
          busY = reBusY;
        } else if (hasHorizontalBlocker(busY, Math.min(channelX, railBoxMinCx), Math.max(channelX, railBoxMaxCx), railExcl)) {
          const localMinY = (rowIdx === 0) ? Math.max(currentFeedY + 8, pBox.bottom + 8) : (rows[rowIdx - 1].maxBottom + 6);
          const bridgeY = allocHorizontalY(Math.min(busY - 12, rowTop - 20), Math.min(channelX, railBoxMinCx), Math.max(channelX, railBoxMaxCx), railExcl, ownerKey, localMinY, busY - 6);
          const localJoinPref = (channelX < railBoxMinCx) ? railBoxMinCx : railBoxMaxCx;
          const localJoinX = allocVerticalX(localJoinPref, bridgeY, busY, railExcl, ownerKey);
          if (!hasHorizontalBlocker(bridgeY, channelX, localJoinX, railExcl) &&
              !hasVerticalBlocker(localJoinX, bridgeY, busY, railExcl) &&
              !hasHorizontalBlocker(busY, Math.min(localJoinX, railBoxMinCx), Math.max(localJoinX, railBoxMaxCx), railExcl)) {
            entryJoinX = null;
            const jXs = finalClear.map(function(b) { return b.cx; }).concat([localJoinX]);
            railStartX = Math.min.apply(null, jXs);
            railEndX = Math.max.apply(null, jXs);
            const feederPts = [
              { x: currentFeedX, y: currentFeedY },
              { x: currentFeedX, y: bridgeY },
              { x: localJoinX, y: bridgeY },
              { x: localJoinX, y: busY }
            ];
            if (!pathHitsAnyCard(feederPts, railExcl)) {
              out += emitPath(feederPts, `conn-path ${anyHighlighted ? 'highlighted' : ''}`, ownerKey);
            } else {
              const firstBlk = getFirstBlockerBelow(currentFeedX, currentFeedY, bridgeY, railExcl);
              const stepY = allocHorizontalY(Math.min(bridgeY - 8, firstBlk - 8), currentFeedX, channelX, railExcl, ownerKey, currentFeedY + 6, Math.min(bridgeY - 6, firstBlk - 8));
              out += emitPath([
                { x: currentFeedX, y: currentFeedY },
                { x: currentFeedX, y: stepY },
                { x: channelX, y: stepY },
                { x: channelX, y: bridgeY },
                { x: localJoinX, y: bridgeY },
                { x: localJoinX, y: busY }
              ], `conn-path ${anyHighlighted ? 'highlighted' : ''}`, ownerKey);
            }
          }
        }
      }

      if (entryJoinX !== null) {
        if (Math.abs(channelX - currentFeedX) > 2) {
          if (rowIdx === 0 || !hasValidFeed || opts.useLeftSpine) {
            const firstBlockOnFeed = getFirstBlockerBelow(currentFeedX, currentFeedY, busY, railExcl);
            const maxStepY = Math.min(busY - 6, firstBlockOnFeed - 8);
            const prefStepY = Math.min(maxStepY, Math.max(currentFeedY + 10, busY - 14));
            const stepY = allocHorizontalY(prefStepY, currentFeedX, channelX, railExcl, ownerKey, currentFeedY + 6, maxStepY);
            out += emitPath([
              { x: currentFeedX, y: currentFeedY },
              { x: currentFeedX, y: stepY },
              { x: channelX, y: stepY },
              { x: channelX, y: busY }
            ], `conn-path ${anyHighlighted ? 'highlighted' : ''}`, ownerKey);
          } else {
            if (channelX < prevRowMinX || channelX > prevRowMaxX) {
              const extStartX = channelX < prevRowMinX ? prevRowMinX : prevRowMaxX;
              out += emitPath([{ x: extStartX, y: currentFeedY }, { x: channelX, y: currentFeedY }], `conn-path ${anyHighlighted ? 'secondary-highlight' : ''}`, ownerKey);
            }
            out += emitPath([{ x: channelX, y: currentFeedY }, { x: channelX, y: busY }], `conn-path ${anyHighlighted ? 'highlighted' : ''}`, ownerKey);
          }
        } else {
          out += emitPath([{ x: channelX, y: currentFeedY }, { x: channelX, y: busY }], `conn-path ${anyHighlighted ? 'highlighted' : ''}`, ownerKey);
        }
      }

      if (railEndX - railStartX > 1) {
        out += emitPath([{ x: railStartX, y: busY }, { x: railEndX, y: busY }], `conn-path ${anyHighlighted ? 'secondary-highlight' : ''}`, ownerKey);
      }

      finalClear.forEach(function(b) {
        const isNodeHi = (selectedNodeId === b.id || selectedNodeId === parentId);
        out += emitPath([{ x: b.cx, y: busY }, { x: b.cx, y: b.top }], `conn-path ${isNodeHi ? 'highlighted' : ''}`, ownerKey, parentId, b.id);
      });

      blockedIds.forEach(function(bid) { free.push(bid); });

      currentFeedX = opts.useLeftSpine ? currentFeedX : channelX;
      currentFeedY = busY;
      prevRowMinX = railStartX;
      prevRowMaxX = railEndX;
      hasValidFeed = true;
    });

    if (free.length > 0) {
      out += drawIndependentEdges(parentId, free, aligned.length > 0 && !opts.useLeftSpine);
    }

    return out;
  }

  let pathsHtml = '';

  const childrenByParent = {};
  Object.values(mutableOrgData).forEach(function(node) {
    if (!node.parentId || !mutableOrgData[node.parentId] || node.parentId === node.id) return;
    if (!cardBoxes[node.parentId] || !cardBoxes[node.id]) return;
    if (!childrenByParent[node.parentId]) childrenByParent[node.parentId] = [];
    childrenByParent[node.parentId].push(node);
  });

  Object.keys(childrenByParent).forEach(function(parentId) {
    const parentNode = mutableOrgData[parentId];
    const pBox = cardBoxes[parentId];
    if (!parentNode || !pBox) return;

    const children = childrenByParent[parentId];

    if (parentNode.tierGroup === 'ceo') {
      const advIds = children.filter(function(c) { return c.tierGroup === 'advisory'; }).map(function(c) { return c.id; });
      const opIds = children.filter(function(c) { return c.tierGroup === 'operational'; }).map(function(c) { return c.id; });
      const otherIds = children.filter(function(c) { return c.tierGroup !== 'advisory' && c.tierGroup !== 'operational'; }).map(function(c) { return c.id; });

      const hasUnmovedAdv = advIds.some(function(id) {
        return cardBoxes[id] && !cardBoxes[id].isMoved && cardBoxes[id].top >= pBox.bottom + 16;
      });

      if (advIds.length > 0) {
        pathsHtml += drawGroupedBusRows(parentId, advIds, {
          preferredStartBusY: pBox.bottom + 24,
          ownerKey: `bus:${parentId}:advisory`
        });
      }

      if (opIds.length > 0) {
        const unmovedOpBoxes = opIds.map(function(id) { return cardBoxes[id]; }).filter(function(b) {
          return b && !b.isMoved && b.top >= pBox.bottom + 16;
        });
        const unmovedAdvBoxes = advIds.map(function(id) { return cardBoxes[id]; }).filter(function(b) {
          return b && !b.isMoved && b.top >= pBox.bottom + 16;
        });

        if (hasUnmovedAdv && unmovedOpBoxes.length > 0) {
          const allUnmovedLeft = unmovedOpBoxes.concat(unmovedAdvBoxes).map(function(b) { return b.left; });
          const minUnmovedLeft = Math.min.apply(null, allUnmovedLeft);
          const spineX = minUnmovedLeft - 34;
          const advMaxBottom = Math.max.apply(null, unmovedAdvBoxes.map(function(b) { return b.bottom; }));

          pathsHtml += drawGroupedBusRows(parentId, opIds, {
            useLeftSpine: true,
            spineX: spineX,
            preferredStartBusY: advMaxBottom + 36,
            ownerKey: `bus:${parentId}:operational`
          });
        } else {
          pathsHtml += drawGroupedBusRows(parentId, opIds, {
            ownerKey: `bus:${parentId}:operational`
          });
        }
      }

      if (otherIds.length > 0) {
        pathsHtml += drawGroupedBusRows(parentId, otherIds, {
          ownerKey: `bus:${parentId}:other`
        });
      }
      return;
    }

    const allChildIds = children.map(function(c) { return c.id; });
    if (allChildIds.length === 1) {
      pathsHtml += drawSmartConnector(parentId, allChildIds[0]);
    } else {
      pathsHtml += drawGroupedBusRows(parentId, allChildIds, {
        ownerKey: `bus:${parentId}:children`
      });
    }
  });

  svg.innerHTML = pathsHtml;
}

function toggleConnectorsHighlight() {
  connectorsHighlighted = !connectorsHighlighted;
  const btn = document.getElementById('btn-toggle-glow');
  const svg = document.getElementById('connections-svg');
  if (btn) btn.style.color = connectorsHighlighted ? 'var(--primary)' : 'var(--on-surface-muted)';
  if (svg) svg.style.opacity = connectorsHighlighted ? '1' : '0.25';
}

/* ==========================================================================
   SELEÇÃO, FOCO E DRAWER LATERAL
   ========================================================================== */
function highlightSelectedNodeOnly(nodeId) {
  const targetData = ORG_DATA[nodeId];
  if (!targetData) return;

  const allCards = document.querySelectorAll('.org-node');
  allCards.forEach(function(card) {
    card.classList.remove('is-active', 'is-highlighted', 'is-dimmed');
    const id = card.id.replace('node-', '');
    const candidate = ORG_DATA[id];
    if (id === nodeId) {
      card.classList.add('is-active');
    } else if (
      (targetData.connections && targetData.connections.includes(id)) ||
      id === targetData.parentId ||
      (targetData.childrenIds && targetData.childrenIds.includes(id)) ||
      (candidate && candidate.parentId === nodeId)
    ) {
      card.classList.add('is-highlighted');
    } else {
      card.classList.add('is-dimmed');
    }
  });

  renderSvgConnections();
}

function selectNode(nodeId) {
  if (!ORG_DATA[nodeId]) return;
  selectedNodeId = nodeId;

  const nodeData = ORG_DATA[nodeId];
  if (branchesCollapsed && nodeData.tierGroup !== 'conselho' && nodeData.tierGroup !== 'ceo') {
    toggleExpandAll();
  }

  highlightSelectedNodeOnly(nodeId);

  if (currentViewMode === 'canvas') {
    panToNodeInCanvas(nodeId);
  }

  populateDrawer(nodeId);
  openDrawer();
}

function populateDrawer(nodeId) {
  const data = ORG_DATA[nodeId];
  if (!data) return;

  const title = document.getElementById('drawer-role-title');
  const badge = document.getElementById('drawer-badge');
  const code = document.getElementById('drawer-code');
  const leaderName = document.getElementById('drawer-leader-name');
  const leaderTitle = document.getElementById('drawer-leader-title');
  const avatar = document.getElementById('drawer-avatar');
  const mission = document.getElementById('drawer-mission');
  const onboardingOverview = document.getElementById('drawer-onboarding-overview');
  const onboardingList = document.getElementById('drawer-onboarding-actions');
  const connectionsList = document.getElementById('drawer-connections-list');
  const channels = document.getElementById('drawer-channels-info');

  if (title) title.textContent = data.category;
  if (badge) badge.textContent = data.role;
  if (code) code.textContent = data.code;
  if (leaderName) leaderName.textContent = data.name;
  if (leaderTitle) leaderTitle.textContent = `${data.role} — Betha Sistemas`;
  if (avatar) {
    if (data.avatar) {
      avatar.innerHTML = `<img src="${escapeHtml(data.avatar)}" alt="${escapeHtml(data.name)}" data-initials="${escapeHtml(data.avatarInitials || 'BS')}" onerror="this.parentElement.textContent=this.dataset.initials||'BS';" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
    } else {
      avatar.textContent = data.avatarInitials;
    }
    avatar.className = `drawer-profile-avatar ${data.avatarClass || ''}`;
  }
  if (mission) mission.textContent = data.mission;
  if (onboardingOverview) onboardingOverview.textContent = data.onboardingSummary;

  if (onboardingList) {
    onboardingList.innerHTML = (data.onboardingActions || []).map(action => `
      <li class="onboarding-action-item">
        <i data-lucide="check-circle-2"></i>
        <span>${escapeHtml(action)}</span>
      </li>
    `).join('');
  }

  if (connectionsList) {
    const dynamicConnIds = new Set(data.connections || []);
    if (data.parentId && ORG_DATA[data.parentId]) dynamicConnIds.add(data.parentId);
    (data.childrenIds || []).forEach(function(cid) { dynamicConnIds.add(cid); });

    connectionsList.innerHTML = Array.from(dynamicConnIds).map(targetId => {
      const target = ORG_DATA[targetId];
      if (!target || targetId === nodeId) return '';
      return `<button class="conn-pill" onclick="selectNode('${escapeHtml(targetId)}')">${escapeHtml(target.category)} (${escapeHtml(target.role)})</button>`;
    }).join('');
  }

  if (channels) channels.textContent = data.channels;
  renderAllIcons();
}

function openDrawer() {
  const drawer = document.getElementById('detail-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
}

function closeDrawer() {
  const drawer = document.getElementById('detail-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');

  document.querySelectorAll('.org-node').forEach(card => card.classList.remove('is-dimmed'));
}

/* ==========================================================================
   TOOLTIPS DE HOVER
   ========================================================================== */
function showTooltip(e, nodeId) {
  if (draggedNodeId) return;
  const data = ORG_DATA[nodeId];
  const tooltip = document.getElementById('org-tooltip');
  if (!data || !tooltip) return;

  const ttBadge = document.getElementById('tt-badge');
  const ttId = document.getElementById('tt-id');
  const ttTitle = document.getElementById('tt-title');
  const ttLeader = document.getElementById('tt-leader');
  const ttDesc = document.getElementById('tt-desc');
  const ttTipBox = document.getElementById('tt-tip-box');
  const ttTip = document.getElementById('tt-tip');

  if (ttBadge) ttBadge.textContent = data.role;
  if (ttId) ttId.textContent = data.code;
  if (ttTitle) ttTitle.textContent = data.category;
  if (ttLeader) ttLeader.textContent = data.name;
  if (ttDesc) {
    const missionText = data.mission || '';
    ttDesc.textContent = missionText.length > 110 ? missionText.substring(0, 110) + '...' : missionText;
  }
  if (ttTipBox && ttTip) {
    if (data.onboardingActions && data.onboardingActions.length > 0) {
      ttTip.textContent = data.onboardingActions[0];
      ttTipBox.style.display = 'block';
    } else {
      ttTip.textContent = '';
      ttTipBox.style.display = 'none';
    }
  }

  const rect = e.currentTarget.getBoundingClientRect();
  const rawX = rect.left + rect.width / 2;
  const halfWidth = 165;
  const vw = window.innerWidth || 1200;
  const x = Math.max(halfWidth, Math.min(vw - halfWidth, rawX));

  const estHeight = tooltip.offsetHeight || 190;
  const headerEl = document.querySelector('.app-header');
  const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 90;

  if (rect.top - estHeight - 18 < headerBottom) {
    tooltip.classList.add('below');
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${rect.bottom}px`;
  } else {
    tooltip.classList.remove('below');
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${rect.top}px`;
  }
  tooltip.classList.add('visible');
}

function hideTooltip() {
  const tooltip = document.getElementById('org-tooltip');
  if (tooltip) tooltip.classList.remove('visible');
}

/* ==========================================================================
   EXPANDIR/RECOLHER, TROCA DE VISUALIZAÇÃO E BUSCA
   ========================================================================== */
function toggleExpandAll() {
  branchesCollapsed = !branchesCollapsed;
  const advisoryCluster = document.getElementById('advisory-cluster-container');
  const operationalGrid = document.getElementById('operational-grid-container');
  const subRows = document.querySelectorAll('.subordinate-tier-row');
  const label = document.getElementById('lbl-toggle-branches');

  if (advisoryCluster) advisoryCluster.style.display = branchesCollapsed ? 'none' : 'flex';
  if (operationalGrid) operationalGrid.style.display = branchesCollapsed ? 'none' : 'flex';
  subRows.forEach(function(row) {
    row.style.display = branchesCollapsed ? 'none' : 'flex';
  });
  if (label) label.textContent = branchesCollapsed ? 'Expandir Áreas' : 'Recolher Áreas';
  setTimeout(renderSvgConnections, 80);
}

function setViewMode(mode) {
  currentViewMode = mode;
  const canvasView = document.getElementById('canvas-viewport');
  const listView = document.getElementById('list-view-container');
  const btnCanvas = document.getElementById('btn-view-canvas');
  const btnList = document.getElementById('btn-view-list');

  if (mode === 'canvas') {
    if (canvasView) canvasView.style.display = 'block';
    if (listView) listView.classList.remove('active');
    if (btnCanvas) { btnCanvas.classList.add('active'); btnCanvas.setAttribute('aria-selected', 'true'); }
    if (btnList) { btnList.classList.remove('active'); btnList.setAttribute('aria-selected', 'false'); }
    requestAnimationFrame(function() {
      if (!userHasAdjustedView) centerCanvasInViewport();
      renderSvgConnections();
    });
    setTimeout(renderSvgConnections, 60);
  } else {
    if (canvasView) canvasView.style.display = 'none';
    if (listView) listView.classList.add('active');
    if (btnCanvas) { btnCanvas.classList.remove('active'); btnCanvas.setAttribute('aria-selected', 'false'); }
    if (btnList) { btnList.classList.add('active'); btnList.setAttribute('aria-selected', 'true'); }
  }
}

function handleSearch(term) {
  const q = term.toLowerCase().trim();
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) clearBtn.style.display = q.length > 0 ? 'inline-flex' : 'none';

  const allCanvasCards = document.querySelectorAll('.org-node');
  const allListCards = document.querySelectorAll('.list-card');

  if (!q) {
    allCanvasCards.forEach(card => card.classList.remove('is-dimmed', 'is-highlighted'));
    allListCards.forEach(card => card.style.display = 'block');
    return;
  }

  let firstMatchedId = null;
  let matchedHiddenBranch = false;

  allCanvasCards.forEach(card => {
    const id = card.id.replace('node-', '');
    const data = ORG_DATA[id];
    if (!data) return;

    const match = (data.role || '').toLowerCase().includes(q) ||
                  (data.name || '').toLowerCase().includes(q) ||
                  (data.category || '').toLowerCase().includes(q) ||
                  (data.mission || '').toLowerCase().includes(q);

    if (match) {
      card.classList.remove('is-dimmed');
      card.classList.add('is-highlighted');
      if (!firstMatchedId) firstMatchedId = id;
      if (branchesCollapsed && data.tierGroup !== 'conselho' && data.tierGroup !== 'ceo') {
        matchedHiddenBranch = true;
      }
    } else {
      card.classList.add('is-dimmed');
      card.classList.remove('is-highlighted');
    }
  });

  if (matchedHiddenBranch && branchesCollapsed) toggleExpandAll();

  allListCards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(q) ? 'block' : 'none';
  });

  if (firstMatchedId && currentViewMode === 'canvas') {
    panToNodeInCanvas(firstMatchedId);
  }
}

function clearSearch() {
  const input = document.getElementById('node-search-input');
  if (input) {
    input.value = '';
    handleSearch('');
  }
}

/* ==========================================================================
   TOUR DE ONBOARDING & EDITOR DO TOUR
   ========================================================================== */
function handleTourButtonClick() {
  if (currentAppMode === 'edit') {
    openTourEditModal();
  } else {
    startOnboardingTour();
  }
}

function startOnboardingTour() {
  const steps = mutableTourConfig.steps || [];
  if (steps.length === 0) {
    showToast('Nenhuma etapa configurada no Tour de Onboarding.', 'warning');
    return;
  }
  currentTourStep = 0;
  updateTourModal();
  const modal = document.getElementById('tour-modal-overlay');
  if (modal) modal.classList.add('open');
  renderAllIcons();
}

function updateTourModal() {
  const steps = mutableTourConfig.steps || [];
  const stepData = steps[currentTourStep];
  if (!stepData) return;

  const badge = document.getElementById('tour-step-label');
  const title = document.getElementById('tour-step-title');
  const highlight = document.getElementById('tour-step-highlight');
  const text = document.getElementById('tour-step-text');
  const skipBtn = document.getElementById('btn-tour-skip');
  const nextBtn = document.getElementById('btn-next-tour');
  const dotsContainer = document.getElementById('tour-dots-container');

  const customStepLabel = (stepData.stepLabel || '').trim();
  if (badge) badge.textContent = customStepLabel || `Passo ${currentTourStep + 1} de ${steps.length}`;
  if (title) title.textContent = stepData.title || '';
  if (highlight) {
    highlight.textContent = stepData.highlight || '';
    highlight.style.display = (stepData.highlight && stepData.highlight.trim()) ? 'block' : 'none';
  }
  if (text) text.textContent = stepData.text || '';
  if (skipBtn) skipBtn.textContent = mutableTourConfig.skipLabel || 'Pular';
  if (nextBtn) {
    nextBtn.textContent = (currentTourStep === steps.length - 1)
      ? (mutableTourConfig.finishLabel || 'Concluir Tour')
      : (mutableTourConfig.nextLabel || 'Próximo');
  }
  if (dotsContainer) {
    dotsContainer.innerHTML = steps.map((_, idx) => `<span class="tour-dot ${idx === currentTourStep ? 'active' : ''}"></span>`).join('');
  }
  if (stepData.targetNode && ORG_DATA[stepData.targetNode]) {
    selectNode(stepData.targetNode);
  }
}

function nextTourStep() {
  const steps = mutableTourConfig.steps || [];
  if (currentTourStep < steps.length - 1) {
    currentTourStep++;
    updateTourModal();
  } else {
    skipTour();
  }
}

function skipTour() {
  const modal = document.getElementById('tour-modal-overlay');
  if (modal) modal.classList.remove('open');
}

function editCurrentTourStep() {
  skipTour();
  openTourEditModal(currentTourStep);
}

function openTourEditModal(initialStepIdx) {
  hideTooltip();
  skipTour();
  draftTourConfig = JSON.parse(JSON.stringify(mutableTourConfig));
  const total = draftTourConfig.steps.length;
  editingTourStepIdx = (typeof initialStepIdx === 'number' && initialStepIdx >= 0 && initialStepIdx < total) ? initialStepIdx : 0;

  document.getElementById('tour-edit-btn-label').value = draftTourConfig.buttonLabel || '';
  document.getElementById('tour-edit-btn-icon').value = draftTourConfig.buttonIcon || 'sparkles';
  document.getElementById('tour-edit-btn-title').value = draftTourConfig.buttonTitle || '';
  document.getElementById('tour-edit-skip-label').value = draftTourConfig.skipLabel || 'Pular';
  document.getElementById('tour-edit-next-label').value = draftTourConfig.nextLabel || 'Próximo';
  document.getElementById('tour-edit-finish-label').value = draftTourConfig.finishLabel || 'Concluir Tour';

  populateTourTargetSelect();
  renderTourStepTabs();
  loadActiveTourStepIntoForm();

  const modal = document.getElementById('modal-edit-tour');
  if (modal) modal.classList.add('open');
  renderAllIcons();
}

function closeTourEditModal() {
  const modal = document.getElementById('modal-edit-tour');
  if (modal) modal.classList.remove('open');
  draftTourConfig = null;
}

function populateTourTargetSelect() {
  const sel = document.getElementById('tour-step-edit-target');
  if (!sel) return;
  let opts = '<option value="">-- Nenhum card em destaque --</option>';
  Object.keys(mutableOrgData).forEach(function(id) {
    const node = mutableOrgData[id];
    opts += `<option value="${escapeHtml(id)}">${escapeHtml(node.category)} — ${escapeHtml(node.name)}</option>`;
  });
  sel.innerHTML = opts;
}

function renderTourStepTabs() {
  const tabsEl = document.getElementById('tour-steps-tabs');
  if (!tabsEl || !draftTourConfig) return;

  let tabsHtml = draftTourConfig.steps.map(function(st, idx) {
    const activeCls = (idx === editingTourStepIdx) ? 'active' : '';
    return `<button type="button" class="tour-step-tab ${activeCls}" onclick="selectEditingTourStep(${idx})">Etapa ${idx + 1}</button>`;
  }).join('');

  tabsHtml += `<button type="button" class="tour-step-tab" onclick="addTourStep()" style="border-style:dashed;color:var(--primary);">+ Nova Etapa</button>`;
  tabsEl.innerHTML = tabsHtml;
}

function syncActiveTourStepFromForm() {
  if (!draftTourConfig || !draftTourConfig.steps[editingTourStepIdx]) return;
  const st = draftTourConfig.steps[editingTourStepIdx];
  st.stepLabel = document.getElementById('tour-step-edit-label').value;
  st.targetNode = document.getElementById('tour-step-edit-target').value;
  st.title = document.getElementById('tour-step-edit-title').value;
  st.highlight = document.getElementById('tour-step-edit-highlight').value;
  st.text = document.getElementById('tour-step-edit-text').value;
}

function loadActiveTourStepIntoForm() {
  if (!draftTourConfig || !draftTourConfig.steps[editingTourStepIdx]) return;
  const st = draftTourConfig.steps[editingTourStepIdx];
  document.getElementById('tour-step-edit-label').value = st.stepLabel || '';
  document.getElementById('tour-step-edit-target').value = (st.targetNode && mutableOrgData[st.targetNode]) ? st.targetNode : '';
  document.getElementById('tour-step-edit-title').value = st.title || '';
  document.getElementById('tour-step-edit-highlight').value = st.highlight || '';
  document.getElementById('tour-step-edit-text').value = st.text || '';

  const stepBadge = document.getElementById('tour-editing-step-indicator');
  if (stepBadge) stepBadge.textContent = `Editando Etapa ${editingTourStepIdx + 1} de ${draftTourConfig.steps.length}`;
}

function selectEditingTourStep(idx) {
  if (!draftTourConfig || idx < 0 || idx >= draftTourConfig.steps.length) return;
  syncActiveTourStepFromForm();
  editingTourStepIdx = idx;
  renderTourStepTabs();
  loadActiveTourStepIntoForm();
}

function addTourStep() {
  if (!draftTourConfig) return;
  syncActiveTourStepFromForm();
  draftTourConfig.steps.push({
    stepLabel: '',
    title: `Nova Etapa ${draftTourConfig.steps.length + 1}`,
    highlight: 'Destaque ou resumo principal desta etapa do onboarding.',
    text: 'Escreva aqui as orientações e informações detalhadas apresentadas ao novo colaborador nesta etapa.',
    targetNode: ''
  });
  editingTourStepIdx = draftTourConfig.steps.length - 1;
  renderTourStepTabs();
  loadActiveTourStepIntoForm();
}

function moveTourStep(direction) {
  if (!draftTourConfig) return;
  syncActiveTourStepFromForm();
  const targetIdx = editingTourStepIdx + direction;
  if (targetIdx < 0 || targetIdx >= draftTourConfig.steps.length) return;
  const tmp = draftTourConfig.steps[editingTourStepIdx];
  draftTourConfig.steps[editingTourStepIdx] = draftTourConfig.steps[targetIdx];
  draftTourConfig.steps[targetIdx] = tmp;
  editingTourStepIdx = targetIdx;
  renderTourStepTabs();
  loadActiveTourStepIntoForm();
}

function deleteActiveTourStep() {
  if (!draftTourConfig) return;
  if (draftTourConfig.steps.length <= 1) {
    showToast('O tour precisa manter pelo menos 1 etapa.', 'warning');
    return;
  }
  if (!window.confirm(`Deseja excluir a Etapa ${editingTourStepIdx + 1} do Tour de Onboarding?`)) return;
  draftTourConfig.steps.splice(editingTourStepIdx, 1);
  if (editingTourStepIdx >= draftTourConfig.steps.length) {
    editingTourStepIdx = draftTourConfig.steps.length - 1;
  }
  renderTourStepTabs();
  loadActiveTourStepIntoForm();
}

function restoreDefaultTour() {
  if (!window.confirm('Deseja restaurar o texto do botão e todas as etapas originais do Tour de Onboarding?')) return;
  draftTourConfig = JSON.parse(JSON.stringify(DEFAULT_TOUR_CONFIG));
  editingTourStepIdx = 0;
  document.getElementById('tour-edit-btn-label').value = draftTourConfig.buttonLabel;
  document.getElementById('tour-edit-btn-icon').value = draftTourConfig.buttonIcon;
  document.getElementById('tour-edit-btn-title').value = draftTourConfig.buttonTitle;
  document.getElementById('tour-edit-skip-label').value = draftTourConfig.skipLabel;
  document.getElementById('tour-edit-next-label').value = draftTourConfig.nextLabel;
  document.getElementById('tour-edit-finish-label').value = draftTourConfig.finishLabel;
  renderTourStepTabs();
  loadActiveTourStepIntoForm();
  showToast('Valores padrão do Tour carregados. Clique em Salvar para confirmar.', 'info');
}

function saveTourConfig(andPreview) {
  if (!draftTourConfig) return;
  syncActiveTourStepFromForm();

  const btnLabel = document.getElementById('tour-edit-btn-label').value.trim();
  if (!btnLabel) {
    showToast('Informe um texto para o botão do Tour.', 'warning');
    return;
  }

  for (let i = 0; i < draftTourConfig.steps.length; i++) {
    if (!draftTourConfig.steps[i].title.trim() || !draftTourConfig.steps[i].text.trim()) {
      selectEditingTourStep(i);
      showToast(`Preencha o Título e o Conteúdo da Etapa ${i + 1}.`, 'warning');
      return;
    }
  }

  draftTourConfig.buttonLabel = btnLabel;
  draftTourConfig.buttonIcon = document.getElementById('tour-edit-btn-icon').value || 'sparkles';
  draftTourConfig.buttonTitle = document.getElementById('tour-edit-btn-title').value.trim();
  draftTourConfig.skipLabel = document.getElementById('tour-edit-skip-label').value.trim() || 'Pular';
  draftTourConfig.nextLabel = document.getElementById('tour-edit-next-label').value.trim() || 'Próximo';
  draftTourConfig.finishLabel = document.getElementById('tour-edit-finish-label').value.trim() || 'Concluir Tour';

  mutableTourConfig = normalizeTourConfig(draftTourConfig);
  applyTourButtonUI();
  persistAllChanges();
  closeTourEditModal();
  showToast('Tour de Onboarding atualizado para todos os usuários!', 'success');

  if (andPreview) startOnboardingTour();
}

/* ==========================================================================
   MODO EDIÇÃO E CRUD DE POSIÇÕES
   ========================================================================== */
function setAppMode(mode) {
  currentAppMode = mode;
  const isEdit = (mode === 'edit');
  const btnNav = document.getElementById('btn-mode-nav');
  const btnEdit = document.getElementById('btn-mode-edit');
  const btnAdd = document.getElementById('btn-toolbar-add');
  const btnExport = document.getElementById('btn-toolbar-export');

  if (isEdit) {
    document.body.classList.add('is-edit-mode');
    if (btnNav) btnNav.classList.remove('active');
    if (btnEdit) btnEdit.classList.add('active', 'edit-active');
    if (btnAdd) btnAdd.style.display = 'inline-flex';
    if (btnExport) btnExport.style.display = 'inline-flex';
    showToast('Modo Edição ativado. Toda alteração será publicada para todos os usuários.', 'warning');
  } else {
    document.body.classList.remove('is-edit-mode');
    if (btnNav) btnNav.classList.add('active');
    if (btnEdit) btnEdit.classList.remove('active', 'edit-active');
    if (btnAdd) btnAdd.style.display = 'none';
    if (btnExport) btnExport.style.display = 'none';
    showToast('Modo Navegação ativado.', 'success');
  }
  applyTourButtonUI();
  renderAllIcons();
  renderSvgConnections();
  requestAnimationFrame(renderSvgConnections);
}

function handleNodeClick(nodeId) {
  if (suppressNextNodeClick) return;
  if (currentAppMode === 'edit') {
    openEditModal(nodeId);
  } else {
    selectNode(nodeId);
  }
}

function isDescendantOf(candidateId, ancestorId, visited) {
  const seen = visited || {};
  if (seen[candidateId]) return false;
  seen[candidateId] = true;
  const candidate = mutableOrgData[candidateId];
  if (!candidate || !candidate.parentId) return false;
  if (candidate.parentId === ancestorId) return true;
  return isDescendantOf(candidate.parentId, ancestorId, seen);
}

function syncEditLevelOnParentChange() {
  const repSelect = document.getElementById('edit-reports-to');
  const levelField = document.getElementById('edit-level');
  if (!repSelect || !levelField) return;
  const pid = repSelect.value;
  if (!pid) return;
  const parent = mutableOrgData[pid];
  if (!parent) return;
  const tierRank = { conselho: 0, ceo: 1, advisory: 2, operational: 3, subordinate: 4 };
  const pRank = tierRank[parent.tierGroup] ?? 3;
  const cRank = tierRank[levelField.value] ?? 3;
  if (pRank === 1 && cRank <= 1) {
    levelField.value = 'operational';
    populateEditOrderSelect();
  } else if (pRank >= 2 && cRank <= pRank) {
    levelField.value = 'subordinate';
    populateEditOrderSelect();
  }
}

function populateEditOrderSelect(preselectedIndex) {
  const nodeId = document.getElementById('edit-node-id').value;
  const levelField = document.getElementById('edit-level');
  const orderSelect = document.getElementById('edit-order');
  if (!levelField || !orderSelect) return;

  const selectedTier = levelField.value;
  const peers = getSortedNodesByTier(selectedTier).filter(function(n) { return n.id !== nodeId; });
  const totalSlots = peers.length + 1;

  const currentNode = mutableOrgData[nodeId];
  let targetIdx = (typeof preselectedIndex === 'number') ? preselectedIndex : (totalSlots - 1);
  if (typeof preselectedIndex !== 'number' && currentNode && currentNode.tierGroup === selectedTier) {
    const allInTier = getSortedNodesByTier(selectedTier);
    const foundIdx = allInTier.findIndex(function(n) { return n.id === nodeId; });
    if (foundIdx >= 0) targetIdx = foundIdx;
  }

  let optionsHtml = '';
  for (let i = 0; i < totalSlots; i++) {
    const sel = (i === targetIdx) ? 'selected' : '';
    optionsHtml += `<option value="${i}" ${sel}>${i + 1}ª posição neste nível</option>`;
  }
  orderSelect.innerHTML = optionsHtml;
}

function openEditModal(nodeId) {
  hideTooltip();
  const node = mutableOrgData[nodeId];
  if (!node) return;

  document.getElementById('edit-node-id').value = nodeId;
  document.getElementById('edit-name').value = node.name || '';
  document.getElementById('edit-role').value = node.role || '';
  document.getElementById('edit-dept').value = node.category || '';
  document.getElementById('edit-code').value = node.code || '';
  document.getElementById('edit-avatar').value = node.avatar || '';
  document.getElementById('edit-mission').value = node.mission || '';
  document.getElementById('edit-onb-summary').value = node.onboardingSummary || '';
  document.getElementById('edit-channels').value = node.channels || '';
  document.getElementById('edit-onb-actions').value = (node.onboardingActions || []).join('\n');

  const levelField = document.getElementById('edit-level');
  if (levelField) levelField.value = node.tierGroup || 'operational';
  populateEditOrderSelect();

  const repSelect = document.getElementById('edit-reports-to');
  if (repSelect) {
    repSelect.innerHTML = '<option value="">-- Nenhum (Conselho / Raiz) --</option>';
    Object.keys(mutableOrgData).forEach(k => {
      if (k !== nodeId && !isDescendantOf(k, nodeId, {})) {
        const isSel = (node.parentId === k) ? 'selected' : '';
        repSelect.innerHTML += `<option value="${escapeHtml(k)}" ${isSel}>${escapeHtml(mutableOrgData[k].category)} — ${escapeHtml(mutableOrgData[k].name)} (${escapeHtml(mutableOrgData[k].role)})</option>`;
      }
    });
  }

  const offsetRow = document.getElementById('edit-reset-offset-row');
  if (offsetRow) {
    offsetRow.style.display = (Number(node.offsetX || 0) !== 0 || Number(node.offsetY || 0) !== 0) ? 'block' : 'none';
  }

  syncEditPreview();
  const modal = document.getElementById('modal-edit');
  if (modal) modal.classList.add('open');
  renderAllIcons();
}

function syncEditPreview() {
  const name = document.getElementById('edit-name').value.trim() || 'Nome do Colaborador';
  const role = document.getElementById('edit-role').value.trim() || 'Cargo';
  const dept = document.getElementById('edit-dept').value.trim() || 'Área / Diretoria';
  const avatarUrl = document.getElementById('edit-avatar').value.trim();
  const previewName = document.getElementById('edit-preview-name');
  const previewRole = document.getElementById('edit-preview-role');
  const previewAvatar = document.getElementById('edit-avatar-preview');

  if (previewName) previewName.textContent = dept;
  if (previewRole) previewRole.textContent = `${name} • ${role}`;
  if (previewAvatar) {
    const parts = name.split(' ').filter(Boolean);
    let init = 'BS';
    if (parts.length === 1) init = parts[0].substring(0, 2).toUpperCase();
    else if (parts.length >= 2) init = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();

    if (avatarUrl) {
      previewAvatar.innerHTML = `<img src="${escapeHtml(avatarUrl)}" alt="Foto" data-initials="${escapeHtml(init)}" onerror="this.parentElement.textContent=this.dataset.initials||'BS';" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
    } else {
      previewAvatar.textContent = init;
    }
  }
}

function closeEditModal() {
  const modal = document.getElementById('modal-edit');
  if (modal) modal.classList.remove('open');
}

function saveNodeEdit() {
  const id = document.getElementById('edit-node-id').value;
  const node = mutableOrgData[id];
  if (!node) return;

  const name = document.getElementById('edit-name').value.trim() || node.name;
  const role = document.getElementById('edit-role').value.trim() || node.role;
  const category = document.getElementById('edit-dept').value.trim() || node.category;
  const code = document.getElementById('edit-code').value.trim() || node.code;
  const avatar = document.getElementById('edit-avatar').value.trim();
  const parentId = document.getElementById('edit-reports-to').value || null;
  const newTierGroup = document.getElementById('edit-level').value || node.tierGroup;
  const newOrderPos = parseInt(document.getElementById('edit-order').value, 10);
  const mission = document.getElementById('edit-mission').value.trim() || node.mission;
  const onbSummary = document.getElementById('edit-onb-summary').value.trim() || node.onboardingSummary;
  const channels = document.getElementById('edit-channels').value.trim() || node.channels;
  const actionsRaw = document.getElementById('edit-onb-actions').value.trim();

  const parts = name.split(' ').filter(Boolean);
  let init = 'BS';
  if (parts.length === 1) init = parts[0].substring(0, 2).toUpperCase();
  else if (parts.length >= 2) init = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();

  const oldTier = node.tierGroup;
  node.name = name;
  node.role = role;
  node.category = category;
  node.code = code;
  node.avatar = avatar;
  node.avatarInitials = init;
  node.parentId = parentId;
  node.tierGroup = newTierGroup;
  node.mission = mission;
  node.onboardingSummary = onbSummary;
  node.channels = channels;
  node.onboardingActions = actionsRaw ? actionsRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

  if (oldTier !== newTierGroup) {
    node.offsetX = 0;
    node.offsetY = 0;
    reindexTierOrders(oldTier);
  }

  const peersWithoutSelf = getSortedNodesByTier(newTierGroup).filter(function(n) { return n.id !== id; });
  const insertAt = (!isNaN(newOrderPos) && newOrderPos >= 0 && newOrderPos <= peersWithoutSelf.length)
    ? newOrderPos
    : peersWithoutSelf.length;
  peersWithoutSelf.splice(insertAt, 0, node);
  peersWithoutSelf.forEach(function(n, idx) { n.sortOrder = idx; });

  syncChildrenLists();
  renderHierarchyCanvas();
  renderListView();
  if (selectedNodeId === id) populateDrawer(id);
  renderAllIcons();
  renderSvgConnections();
  closeEditModal();
  persistAllChanges();
  showToast(`Posição "${category}" salva para todos os usuários!`, 'success');
}

function syncAddLevelDefault() {
  const repSelect = document.getElementById('add-reports-to');
  const levelSelect = document.getElementById('add-level');
  if (!repSelect || !levelSelect) return;
  const pid = repSelect.value;
  if (!pid) {
    levelSelect.value = 'conselho';
  } else if (mutableOrgData[pid] && mutableOrgData[pid].tierGroup === 'conselho') {
    levelSelect.value = 'ceo';
  } else if (mutableOrgData[pid] && mutableOrgData[pid].tierGroup === 'ceo') {
    levelSelect.value = 'operational';
  } else {
    levelSelect.value = 'subordinate';
  }
}

function openAddNodeModal() {
  const repSelect = document.getElementById('add-reports-to');
  if (repSelect) {
    repSelect.innerHTML = '<option value="">-- Nenhum (Conselho / Raiz) --</option>';
    Object.keys(mutableOrgData).forEach(k => {
      const isCeo = (k === 'ceo') ? 'selected' : '';
      repSelect.innerHTML += `<option value="${escapeHtml(k)}" ${isCeo}>${escapeHtml(mutableOrgData[k].category)} — ${escapeHtml(mutableOrgData[k].name)} (${escapeHtml(mutableOrgData[k].role)})</option>`;
    });
  }
  document.getElementById('add-name').value = '';
  document.getElementById('add-role').value = '';
  document.getElementById('add-dept').value = '';
  document.getElementById('add-code').value = '';
  document.getElementById('add-avatar').value = '';
  document.getElementById('add-mission').value = '';
  syncAddLevelDefault();

  const modal = document.getElementById('modal-add');
  if (modal) modal.classList.add('open');
  renderAllIcons();
}

function closeAddModal() {
  const modal = document.getElementById('modal-add');
  if (modal) modal.classList.remove('open');
}

function createNode() {
  const name = document.getElementById('add-name').value.trim();
  const role = document.getElementById('add-role').value.trim();
  const category = document.getElementById('add-dept').value.trim() || 'Diretoria Executiva';
  const code = document.getElementById('add-code').value.trim() || 'NOVA-01';
  const parentId = document.getElementById('add-reports-to').value || null;
  const tierGroup = document.getElementById('add-level').value || 'operational';
  const avatar = document.getElementById('add-avatar').value.trim();
  const mission = document.getElementById('add-mission').value.trim() || 'Atuação na estrutura da Betha Sistemas.';

  if (!name || !role) {
    showToast('Preencha ao menos Nome e Cargo para adicionar.', 'warning');
    return;
  }

  const id = 'pos-' + Date.now();
  const parts = name.split(' ').filter(Boolean);
  let init = 'BS';
  if (parts.length === 1) init = parts[0].substring(0, 2).toUpperCase();
  else if (parts.length >= 2) init = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();

  const peers = getSortedNodesByTier(tierGroup);

  mutableOrgData[id] = {
    id: id,
    code: code,
    category: category,
    role: role,
    name: name,
    avatarInitials: init,
    avatarClass: '',
    avatar: avatar,
    parentId: parentId,
    childrenIds: [],
    tierGroup: tierGroup,
    sortOrder: peers.length,
    offsetX: 0,
    offsetY: 0,
    footerTag: role,
    footerPrompt: 'Detalhes',
    badgeIcon: '',
    mission: mission,
    onboardingSummary: 'Novo setor/liderança integrado ao ecossistema da Betha Sistemas.',
    onboardingActions: [
      'Alinhe os fluxos de trabalho e pontos focais com esta nova liderança.',
      'Consulte as atribuições da área na universidade corporativa.'
    ],
    connections: parentId ? [parentId] : [],
    channels: 'Canais corporativos oficiais Betha.'
  };

  syncChildrenLists();
  renderHierarchyCanvas();
  renderListView();
  renderAllIcons();
  renderSvgConnections();

  closeAddModal();
  persistAllChanges();
  showToast(`Nova posição "${category}" publicada para todos!`, 'success');
}

/* ==========================================================================
   BACKUP JSON, IMPORTAÇÃO, RESTAURAÇÃO E EXCLUSÃO
   ========================================================================== */
function openExportModal() {
  const modal = document.getElementById('modal-export');
  if (modal) modal.classList.add('open');
  renderAllIcons();
}

function closeExportModal() {
  const modal = document.getElementById('modal-export');
  if (modal) modal.classList.remove('open');
}

function exportDataJSON() {
  const exportPayload = {
    company: 'Betha Sistemas',
    version: '4.0-vercel-sync',
    exportDate: new Date().toISOString(),
    totalPositions: Object.keys(mutableOrgData).length,
    structure: mutableOrgData,
    tourConfig: mutableTourConfig
  };

  try {
    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'organograma-betha-sistemas.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Download do arquivo JSON concluído.', 'success');
    closeExportModal();
  } catch (err) {
    showToast('Não foi possível gerar o download direto.', 'warning');
  }
}

function importDataJSON(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      const data = parsed.structure || parsed.nodes || parsed;
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          data.forEach(item => {
            const k = item.id.replace('pos-', '').replace('node-', '');
            if (mutableOrgData[k]) {
              mutableOrgData[k].name = item.name || mutableOrgData[k].name;
              mutableOrgData[k].role = item.role || mutableOrgData[k].role;
              mutableOrgData[k].avatar = item.avatar || mutableOrgData[k].avatar;
            }
          });
        } else {
          const merged = {};
          Object.keys(data).forEach(function(k) {
            const base = INITIAL_ORG_DATA[k] ? JSON.parse(JSON.stringify(INITIAL_ORG_DATA[k])) : {};
            merged[k] = normalizeNodeFields(Object.assign(base, data[k]), k);
          });
          mutableOrgData = merged;
        }

        deletedNodeIds = Object.keys(INITIAL_ORG_DATA).filter(function(k) { return !mutableOrgData[k]; });
        Object.keys(ORG_DATA).forEach(function(k) {
          if (!mutableOrgData[k]) delete ORG_DATA[k];
        });
        if (parsed.tourConfig && typeof parsed.tourConfig === 'object') {
          mutableTourConfig = normalizeTourConfig(parsed.tourConfig);
          applyTourButtonUI();
        }
        syncChildrenLists();
        renderHierarchyCanvas();
        renderListView();
        renderAllIcons();
        renderSvgConnections();

        if (selectedNodeId && !mutableOrgData[selectedNodeId]) {
          selectedNodeId = mutableOrgData['ceo'] ? 'ceo' : (Object.keys(mutableOrgData)[0] || null);
          closeDrawer();
        }

        closeExportModal();
        persistAllChanges();
        showToast('Organograma importado e publicado para todos!', 'success');
      }
    } catch (err) {
      showToast('Erro ao ler arquivo JSON.', 'warning');
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

function restoreDefaultOrg() {
  if (!window.confirm('Deseja restaurar a estrutura original oficial da Betha Sistemas para todos os usuários?')) return;

  deletedNodeIds = [];
  mutableOrgData = JSON.parse(JSON.stringify(INITIAL_ORG_DATA));
  Object.keys(ORG_DATA).forEach(function(k) {
    if (!INITIAL_ORG_DATA[k]) delete ORG_DATA[k];
  });
  syncChildrenLists();
  renderHierarchyCanvas();
  renderListView();
  renderAllIcons();
  renderSvgConnections();

  if (!mutableOrgData[selectedNodeId]) {
    selectedNodeId = 'ceo';
    closeDrawer();
  } else {
    highlightSelectedNodeOnly(selectedNodeId);
    populateDrawer(selectedNodeId);
  }

  OrgStorage.clearLocalOrg();
  persistAllChanges();
  userHasAdjustedView = false;
  centerCanvasInViewport();
  closeExportModal();
  showToast('Estrutura original restaurada e publicada!', 'success');
}

function requestDeleteNode(nodeId) {
  hideTooltip();
  const node = mutableOrgData[nodeId];
  if (!node) return;
  const targetInput = document.getElementById('delete-target-id');
  const targetLabel = document.getElementById('delete-target-label');
  if (targetInput) targetInput.value = nodeId;
  if (targetLabel) targetLabel.textContent = `"${node.category} — ${node.name}"`;

  const modal = document.getElementById('modal-confirm-delete');
  if (modal) modal.classList.add('open');
  renderAllIcons();
}

function requestDeleteFromEditModal() {
  const id = document.getElementById('edit-node-id').value;
  if (!id || !mutableOrgData[id]) return;
  closeEditModal();
  requestDeleteNode(id);
}

function closeConfirmDeleteModal() {
  const modal = document.getElementById('modal-confirm-delete');
  if (modal) modal.classList.remove('open');
}

function confirmDeleteNode() {
  const id = document.getElementById('delete-target-id').value;
  if (!id || !mutableOrgData[id]) {
    closeConfirmDeleteModal();
    return;
  }
  const deletedTitle = mutableOrgData[id].category || mutableOrgData[id].name || 'Card';

  delete mutableOrgData[id];
  delete ORG_DATA[id];
  if (deletedNodeIds.indexOf(id) === -1) deletedNodeIds.push(id);

  if (selectedNodeId === id) {
    selectedNodeId = null;
    closeDrawer();
  }

  closeConfirmDeleteModal();
  hideTooltip();
  syncChildrenLists();
  renderHierarchyCanvas();
  renderListView();
  renderAllIcons();
  renderSvgConnections();
  persistAllChanges();
  showToast(`Card "${deletedTitle}" excluído para todos.`, 'success');
}

/* ==========================================================================
   UTILITÁRIOS
   ========================================================================== */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-pill ${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : (type === 'warning' ? 'alert-triangle' : 'info')}" style="width:14px;height:14px;"></i>
    <span>${escapeHtml(msg)}</span>
  `;

  container.appendChild(toast);
  renderAllIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 260);
  }, 3400);
}