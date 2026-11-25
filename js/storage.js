/* ==========================================================================
   CAMADA DE PERSISTÊNCIA GLOBAL (VERCEL API) + CONTROLE DE ACESSO POR PIN
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
  pinVerified: false,
  hasFetchedCloud: false,
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
      this.hasFetchedCloud = true;
      this.updateSyncBadge('online', 'Nuvem ativa');
      return data.state || null;
    } catch (err) {
      this.isCloudEnabled = false;
      this.hasFetchedCloud = true;
      this.updateSyncBadge('local', 'Modo local');
      return null;
    }
  },

  async verifyPinWithServer(pin) {
    try {
      const res = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({ action: 'verify-pin' })
      });
      return res.ok;
    } catch (err) {
      console.error('Erro ao validar PIN:', err);
      return false;
    }
  },

  async ensureEditAccess() {
    if (!this.hasFetchedCloud) {
      await this.fetchCloudState();
    }

    // Se estiver rodando localmente sem servidor ou sem ADMIN_PIN configurado, libera direto
    if (!this.isCloudEnabled || !this.requiresPin) {
      this.pinVerified = true;
      return true;
    }

    if (this.pinVerified && sessionStorage.getItem(STORAGE_KEYS.adminPin)) {
      return true;
    }

    // Se já houver um PIN salvo na sessão da aba, valida silenciosamente primeiro
    let cachedPin = sessionStorage.getItem(STORAGE_KEYS.adminPin);
    if (cachedPin) {
      const validCached = await this.verifyPinWithServer(cachedPin);
      if (validCached) {
        this.pinVerified = true;
        return true;
      }
      sessionStorage.removeItem(STORAGE_KEYS.adminPin);
    }

    // Pede a senha antes de entrar na tela de edição
    const enteredPin = window.prompt('Área restrita. Digite a senha de administrador para acessar o Modo Edição:');
    if (!enteredPin) {
      return false;
    }

    const isValid = await this.verifyPinWithServer(enteredPin.trim());
    if (!isValid) {
      if (typeof showToast === 'function') {
        showToast('Senha incorreta. Acesso ao Modo Edição negado.', 'warning');
      }
      return false;
    }

    sessionStorage.setItem(STORAGE_KEYS.adminPin, enteredPin.trim());
    this.pinVerified = true;
    return true;
  },

  async pushCloudState(payload) {
    if (!this.isCloudEnabled) return false;

    this.updateSyncBadge('loading', 'Salvando...');
    const headers = { 'Content-Type': 'application/json' };
    const pin = sessionStorage.getItem(STORAGE_KEYS.adminPin) || '';
    if (pin) headers['x-admin-pin'] = pin;

    try {
      const res = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        sessionStorage.removeItem(STORAGE_KEYS.adminPin);
        this.pinVerified = false;
        this.updateSyncBadge('local', 'Sem permissão');
        if (typeof showToast === 'function') {
          showToast('Sessão expirada ou senha inválida. Entre novamente no Modo Edição.', 'warning');
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
