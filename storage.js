/* ==========================================================================
   CAMADA DE PERSISTÊNCIA GLOBAL (VERCEL API) + FALLBACK LOCALSTORAGE
   ========================================================================== */
const STORAGE_KEYS = {
  orgData: 'betha_org_data_v7',
  deletedIds: 'betha_org_deleted_ids_v7',
  tourConfig: 'betha_org_tour_config_v7',
  adminPin: 'betha_org_admin_pin'
};

const OrgStorage = {
  apiEndpoint: '/api/organograma',
  isCloudEnabled: false,
  requiresPin: false,
  saveTimer: null,

  updateSyncBadge(status, label) {
    const badge = document.getElementById('sync-status-badge');
    if (!badge) return;
    badge.className = `sync-status-badge sync-${status}`;
    badge.textContent = label;
  },

  loadLocal() {
    try {
      const rawDeleted = localStorage.getItem(STORAGE_KEYS.deletedIds);
      const rawOrg = localStorage.getItem(STORAGE_KEYS.orgData);
      const rawTour = localStorage.getItem(STORAGE_KEYS.tourConfig);

      return {
        deletedNodeIds: rawDeleted ? JSON.parse(rawDeleted) : null,
        customOrgData: rawOrg ? JSON.parse(rawOrg) : null,
        tourConfig: rawTour ? JSON.parse(rawTour) : null
      };
    } catch (e) {
      console.warn('Falha ao ler localStorage:', e);
      return { deletedNodeIds: null, customOrgData: null, tourConfig: null };
    }
  },

  saveLocal({ customOrgData, deletedNodeIds, tourConfig }) {
    try {
      if (customOrgData) localStorage.setItem(STORAGE_KEYS.orgData, JSON.stringify(customOrgData));
      if (deletedNodeIds) localStorage.setItem(STORAGE_KEYS.deletedIds, JSON.stringify(deletedNodeIds));
      if (tourConfig) localStorage.setItem(STORAGE_KEYS.tourConfig, JSON.stringify(tourConfig));
    } catch (e) {
      console.warn('Falha ao gravar localStorage:', e);
    }
  },

  clearLocalOrg() {
    try {
      localStorage.removeItem(STORAGE_KEYS.orgData);
      localStorage.removeItem(STORAGE_KEYS.deletedIds);
    } catch (e) {
      console.warn('Falha ao limpar localStorage:', e);
    }
  },

  async fetchCloudState() {
    this.updateSyncBadge('loading', 'Sincronizando...');
    try {
      const res = await fetch(this.apiEndpoint, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.isCloudEnabled = Boolean(data.configured);
      this.requiresPin = Boolean(data.requiresPin);
      this.updateSyncBadge('online', 'Nuvem ativa');
      return data.state || null;
    } catch (err) {
      this.isCloudEnabled = false;
      this.updateSyncBadge('local', 'Modo local');
      return null;
    }
  },

  getAdminPin(forcePrompt = false) {
    let pin = sessionStorage.getItem(STORAGE_KEYS.adminPin) || '';
    if ((!pin && this.requiresPin) || forcePrompt) {
      pin = window.prompt('Digite o PIN de administrador para publicar alterações para todos os usuários:') || '';
      if (pin) sessionStorage.setItem(STORAGE_KEYS.adminPin, pin);
    }
    return pin;
  },

  async pushCloudState(payload, retryOnAuth = true) {
    if (!this.isCloudEnabled) return false;

    this.updateSyncBadge('loading', 'Salvando...');
    const headers = { 'Content-Type': 'application/json' };
    const pin = this.getAdminPin(false);
    if (pin) headers['x-admin-pin'] = pin;

    try {
      const res = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.status === 401 && retryOnAuth) {
        sessionStorage.removeItem(STORAGE_KEYS.adminPin);
        const newPin = this.getAdminPin(true);
        if (newPin) return this.pushCloudState(payload, false);
        this.updateSyncBadge('local', 'Sem permissão');
        if (typeof showToast === 'function') {
          showToast('Alteração salva apenas neste navegador (PIN inválido).', 'warning');
        }
        return false;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      this.updateSyncBadge('online', 'Salvo para todos');
      return true;
    } catch (err) {
      console.error('Erro ao salvar na nuvem:', err);
      this.updateSyncBadge('local', 'Falha na nuvem');
      if (typeof showToast === 'function') {
        showToast('Salvo localmente. Não foi possível sincronizar com o servidor.', 'warning');
      }
      return false;
    }
  },

  saveAll(payload) {
    this.saveLocal(payload);
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.pushCloudState(payload);
    }, 250);
  }
};