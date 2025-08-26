// Enhanced Construction Cost Tracker with GitHub Integration
class ConstructionCostTracker {
  constructor() {
    this.data = {
      Ground: [],
      First: [],
      Second: []
    };
    this.changeLog = [];
    this.currentFloor = 'Ground';
    this.categories = new Set();
    this.isAuthenticated = false;
    this.currentEditEntry = null;
    this.pendingAction = null;
    
    // Configuration
    this.config = {
      github: {
        owner: '',
        repo: '',
        token: '',
        dataFile: 'data/construction-data.json',
        logFile: 'data/change-log.json'
      },
      auth: {
        password: 'admin123',
        sessionTimeout: 3600000 // 1 hour
      },
      sync: {
        autoSync: true,
        syncInterval: 30000 // 30 seconds
      }
    };
    
    this.init();
  }

  async init() {
    // Load configuration
    this.loadConfig();
    
    // Check authentication status
    this.checkAuthStatus();
    
    // Load initial data
    await this.loadInitialData();
    
    // Set today's date as default
    this.setDefaultDate();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initial render
    this.renderOverview();
    this.renderFloorDetails();
    this.populateCategoryDropdowns();
    this.renderChangeLog();
    this.updateSyncStatus('offline');
    
    // Start auto-sync if enabled
    if (this.config.sync.autoSync && this.config.github.token) {
      this.startAutoSync();
    }
    
    console.log('Enhanced Construction Cost Tracker initialized');
  }

  loadConfig() {
    try {
      const savedConfig = localStorage.getItem('constructionTrackerConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        this.config = { ...this.config, ...parsed };
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  saveConfig() {
    try {
      localStorage.setItem('constructionTrackerConfig', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  checkAuthStatus() {
    const authData = sessionStorage.getItem('constructionTrackerAuth');
    if (authData) {
      try {
        const { timestamp } = JSON.parse(authData);
        if (Date.now() - timestamp < this.config.auth.sessionTimeout) {
          this.isAuthenticated = true;
        } else {
          sessionStorage.removeItem('constructionTrackerAuth');
        }
      } catch (error) {
        sessionStorage.removeItem('constructionTrackerAuth');
      }
    }
  }

  authenticate(password) {
    if (password === this.config.auth.password) {
      this.isAuthenticated = true;
      sessionStorage.setItem('constructionTrackerAuth', JSON.stringify({
        timestamp: Date.now()
      }));
      return true;
    }
    return false;
  }

  requireAuth(action) {
    if (this.isAuthenticated) {
      return Promise.resolve(true);
    }
    
    return new Promise((resolve, reject) => {
      this.pendingAction = () => resolve(true);
      this.pendingActionReject = () => reject(false);
      this.showPasswordModal();
    });
  }

  showPasswordModal() {
    const modal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('modalPassword');
    const errorElement = document.getElementById('passwordError');
    
    if (modal) {
      modal.classList.remove('hidden');
      if (errorElement) errorElement.classList.add('hidden');
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
      }
    }
  }

  hidePasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  async loadInitialData() {
    // Try to load from GitHub first
    if (this.config.github.token && this.config.github.owner && this.config.github.repo) {
      try {
        await this.syncFromGitHub();
        return;
      } catch (error) {
        console.warn('Failed to sync from GitHub:', error);
      }
    }

    // Fallback to initial data
    const initialData = {
      "Ground": [
        {"id": "house_1", "date": "2025-03-12", "product_service": "Labour", "amount": 1000, "note": "JCB"},
        {"id": "house_2", "date": "2025-03-12", "product_service": "Labour", "amount": 300, "note": ""},
        {"id": "house_3", "date": "2025-03-12", "product_service": "Loan", "amount": 5900, "note": "Processing fee"},
        {"id": "house_4", "date": "2025-03-12", "product_service": "Tools & Material", "amount": 165, "note": ""},
        {"id": "house_5", "date": "2025-03-13", "product_service": "Loan", "amount": 1000, "note": "Site inspection"},
        {"id": "house_6", "date": "2025-03-13", "product_service": "Bescom", "amount": 18000, "note": "Temp meter"},
        {"id": "house_7", "date": "2025-03-13", "product_service": "Loan", "amount": 20000, "note": "lancha"},
        {"id": "house_8", "date": "2025-03-13", "product_service": "Tools & Material", "amount": 1600, "note": "Motor"},
        {"id": "house_9", "date": "2025-03-13", "product_service": "Water Tank", "amount": 1200, "note": ""},
        {"id": "house_10", "date": "2025-03-13", "product_service": "Labour", "amount": 400, "note": ""}
      ],
      "First": [
        {"id": "first_1", "date": "2025-05-14", "product_service": "Doors and Windows", "amount": 20000, "note": "Door vascal advance"},
        {"id": "first_2", "date": "2025-05-19", "product_service": "Steel", "amount": 23500, "note": "385kg"},
        {"id": "first_3", "date": "2025-05-21", "product_service": "Mestri", "amount": 5000, "note": "Steel work"}
      ],
      "Second": [
        {"id": "second_1", "date": "2025-06-24", "product_service": "Cement", "amount": 16500, "note": "@415"},
        {"id": "second_2", "date": "2025-06-24", "product_service": "Water Tank", "amount": 1200, "note": ""},
        {"id": "second_3", "date": "2025-06-24", "product_service": "Labour", "amount": 1200, "note": ""}
      ]
    };

    this.data = initialData;
    this.extractCategories();

    // Initialize change log with sample entry
    this.changeLog = [
      {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        action: 'create',
        entryId: 'house_1',
        changes: {
          date: '2025-03-12',
          product_service: 'Labour',
          amount: 1000,
          note: 'JCB'
        },
        details: 'Initial data loaded'
      }
    ];
  }

  generateId() {
    return 'entry_' + Math.random().toString(36).substr(2, 9);
  }

  extractCategories() {
    this.categories.clear();
    Object.values(this.data).forEach(floorData => {
      floorData.forEach(entry => {
        this.categories.add(entry.product_service);
      });
    });
  }

  setupEventListeners() {
    // Main tab navigation and floor tabs
    document.addEventListener('click', (e) => {
      // Handle main tab navigation
      if (e.target.classList.contains('tab-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const tabName = e.target.getAttribute('data-tab');
        if (tabName) {
          this.switchTab(tabName);
        }
        return;
      }

      // Handle floor tab navigation
      if (e.target.classList.contains('floor-tab-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const floor = e.target.getAttribute('data-floor');
        if (floor) {
          this.switchFloor(floor);
        }
        return;
      }

      // Edit and delete buttons
      if (e.target.classList.contains('action-btn--edit')) {
        e.preventDefault();
        e.stopPropagation();
        const entryId = e.target.getAttribute('data-entry-id');
        this.handleEditEntry(entryId);
        return;
      }

      if (e.target.classList.contains('action-btn--delete')) {
        e.preventDefault();
        e.stopPropagation();
        const entryId = e.target.getAttribute('data-entry-id');
        this.handleDeleteEntry(entryId);
        return;
      }

      // Settings and sync buttons
      if (e.target.id === 'saveSettings') {
        e.preventDefault();
        e.stopPropagation();
        this.handleSaveSettings();
        return;
      }

      if (e.target.id === 'manualSync') {
        e.preventDefault();
        e.stopPropagation();
        this.handleManualSync();
        return;
      }

      if (e.target.id === 'exportData' || e.target.id === 'exportAllData') {
        e.preventDefault();
        e.stopPropagation();
        this.handleExportData();
        return;
      }

      if (e.target.id === 'importData') {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('importFile')?.click();
        return;
      }

      if (e.target.id === 'testConnection') {
        e.preventDefault();
        e.stopPropagation();
        this.handleTestConnection();
        return;
      }

      if (e.target.id === 'changePassword') {
        e.preventDefault();
        e.stopPropagation();
        this.handleChangePassword();
        return;
      }

      // Modal buttons
      if (e.target.id === 'confirmAuth') {
        e.preventDefault();
        e.stopPropagation();
        this.handlePasswordConfirm();
        return;
      }

      if (e.target.id === 'cancelAuth') {
        e.preventDefault();
        e.stopPropagation();
        this.hidePasswordModal();
        if (this.pendingActionReject) {
          this.pendingActionReject();
          this.pendingActionReject = null;
        }
        return;
      }

      if (e.target.id === 'saveEdit') {
        e.preventDefault();
        e.stopPropagation();
        this.handleSaveEdit();
        return;
      }

      if (e.target.id === 'cancelEdit') {
        e.preventDefault();
        e.stopPropagation();
        this.hideEditModal();
        return;
      }

      // Modal backdrop clicks
      if (e.target.classList.contains('modal-backdrop')) {
        e.preventDefault();
        e.stopPropagation();
        const modal = e.target.closest('.modal');
        if (modal) {
          modal.classList.add('hidden');
        }
        if (this.pendingActionReject) {
          this.pendingActionReject();
          this.pendingActionReject = null;
        }
        return;
      }
    });

    // Form submissions
    document.addEventListener('submit', (e) => {
      e.preventDefault();
      if (e.target.id === 'addEntryForm') {
        this.handleAddEntry(e);
      } else if (e.target.id === 'editEntryForm') {
        this.handleSaveEdit();
      }
    });

    // Dropdown changes - don't prevent default here to allow normal selection
    document.addEventListener('change', (e) => {
      if (e.target.id === 'entryCategory') {
        this.handleCategoryChange(e);
      } else if (e.target.id === 'analysisCategory') {
        this.handleAnalysisCategory(e);
      } else if (e.target.id === 'logFilter') {
        this.renderChangeLog();
      } else if (e.target.id === 'importFile') {
        this.handleImportFile(e);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
          modal.classList.add('hidden');
        });
        if (this.pendingActionReject) {
          this.pendingActionReject();
          this.pendingActionReject = null;
        }
      }

      if (e.key === 'Enter' && e.target.id === 'modalPassword') {
        this.handlePasswordConfirm();
      }
    });
  }

  async handleEditEntry(entryId) {
    try {
      const hasAuth = await this.requireAuth('edit');
      if (!hasAuth) return;

      const entry = this.findEntryById(entryId);
      if (!entry) return;

      this.currentEditEntry = { ...entry, entryId };
      this.showEditModal(entry);
    } catch (error) {
      console.log('Authentication cancelled');
    }
  }

  async handleDeleteEntry(entryId) {
    try {
      const hasAuth = await this.requireAuth('delete');
      if (!hasAuth) return;

      const entry = this.findEntryById(entryId);
      if (!entry) return;

      if (confirm('Are you sure you want to delete this entry?')) {
        this.deleteEntry(entryId);
      }
    } catch (error) {
      console.log('Authentication cancelled');
    }
  }

  findEntryById(entryId) {
    for (const floor of Object.keys(this.data)) {
      const entry = this.data[floor].find(e => e.id === entryId);
      if (entry) {
        return { ...entry, floor };
      }
    }
    return null;
  }

  showEditModal(entry) {
    const modal = document.getElementById('editModal');
    if (!modal) return;

    document.getElementById('editDate').value = entry.date;
    document.getElementById('editCategory').value = entry.product_service;
    document.getElementById('editAmount').value = entry.amount;
    document.getElementById('editNotes').value = entry.note || '';

    modal.classList.remove('hidden');
    document.getElementById('editDate').focus();
  }

  hideEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    this.currentEditEntry = null;
  }

  handleSaveEdit() {
    if (!this.currentEditEntry) return;

    const date = document.getElementById('editDate').value;
    const category = document.getElementById('editCategory').value;
    const amount = parseFloat(document.getElementById('editAmount').value);
    const notes = document.getElementById('editNotes').value;

    if (!date || !category || isNaN(amount) || amount <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }

    const oldEntry = this.findEntryById(this.currentEditEntry.entryId);
    if (!oldEntry) return;

    const updatedEntry = {
      ...oldEntry,
      date,
      product_service: category,
      amount,
      note: notes
    };

    // Update the entry
    const floorData = this.data[oldEntry.floor];
    const index = floorData.findIndex(e => e.id === this.currentEditEntry.entryId);
    if (index !== -1) {
      floorData[index] = updatedEntry;

      // Log the change
      this.logChange('update', this.currentEditEntry.entryId, {
        old: oldEntry,
        new: updatedEntry
      });

      // Refresh UI
      this.extractCategories();
      this.renderOverview();
      this.renderFloorDetails();
      this.renderChangeLog();
      this.populateCategoryDropdowns();

      // Sync if auto-sync is enabled
      if (this.config.sync.autoSync) {
        this.syncToGitHub();
      }

      this.hideEditModal();
      this.showSuccessMessage('Entry updated successfully!');
    }
  }

  deleteEntry(entryId) {
    const entry = this.findEntryById(entryId);
    if (!entry) return;

    const floorData = this.data[entry.floor];
    const index = floorData.findIndex(e => e.id === entryId);
    if (index !== -1) {
      floorData.splice(index, 1);

      // Log the change
      this.logChange('delete', entryId, entry);

      // Refresh UI
      this.extractCategories();
      this.renderOverview();
      this.renderFloorDetails();
      this.renderChangeLog();
      this.populateCategoryDropdowns();

      // Sync if auto-sync is enabled
      if (this.config.sync.autoSync) {
        this.syncToGitHub();
      }

      this.showSuccessMessage('Entry deleted successfully!');
    }
  }

  logChange(action, entryId, changes) {
    const logEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action,
      entryId,
      changes,
      details: this.getChangeDescription(action, changes)
    };

    this.changeLog.unshift(logEntry);

    // Keep only last 100 changes
    if (this.changeLog.length > 100) {
      this.changeLog = this.changeLog.slice(0, 100);
    }
  }

  getChangeDescription(action, changes) {
    switch (action) {
      case 'create':
        return `Added new ${changes.product_service} entry for ₹${changes.amount}`;
      case 'update':
        return `Updated ${changes.new.product_service} entry`;
      case 'delete':
        return `Deleted ${changes.product_service} entry for ₹${changes.amount}`;
      default:
        return `${action} operation performed`;
    }
  }

  handlePasswordConfirm() {
    const passwordInput = document.getElementById('modalPassword');
    const errorElement = document.getElementById('passwordError');
    const password = passwordInput?.value || '';

    if (this.authenticate(password)) {
      this.hidePasswordModal();
      if (this.pendingAction) {
        this.pendingAction();
        this.pendingAction = null;
        this.pendingActionReject = null;
      }
    } else {
      if (errorElement) errorElement.classList.remove('hidden');
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
      }
    }
  }

  async syncFromGitHub() {
    if (!this.config.github.token) return;

    try {
      this.updateSyncStatus('syncing');

      // Fetch data file
      const dataResponse = await this.fetchGitHubFile(this.config.github.dataFile);
      if (dataResponse) {
        this.data = JSON.parse(atob(dataResponse.content));
      }

      // Fetch log file
      const logResponse = await this.fetchGitHubFile(this.config.github.logFile);
      if (logResponse) {
        this.changeLog = JSON.parse(atob(logResponse.content));
      }

      this.extractCategories();
      this.updateSyncStatus('online');
      this.updateLastSync();

    } catch (error) {
      console.error('Sync from GitHub failed:', error);
      this.updateSyncStatus('offline');
      throw error;
    }
  }

  async syncToGitHub() {
    if (!this.config.github.token) return;

    try {
      this.updateSyncStatus('syncing');

      // Upload data file
      await this.uploadGitHubFile(
        this.config.github.dataFile,
        JSON.stringify(this.data, null, 2),
        'Update construction data'
      );

      // Upload log file
      await this.uploadGitHubFile(
        this.config.github.logFile,
        JSON.stringify(this.changeLog, null, 2),
        'Update change log'
      );

      this.updateSyncStatus('online');
      this.updateLastSync();

    } catch (error) {
      console.error('Sync to GitHub failed:', error);
      this.updateSyncStatus('offline');
      throw error;
    }
  }

  async fetchGitHubFile(path) {
    const url = `https://api.github.com/repos/${this.config.github.owner}/${this.config.github.repo}/contents/${path}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${this.config.github.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.status === 404) {
      return null; // File doesn't exist yet
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async uploadGitHubFile(path, content, message) {
    const url = `https://api.github.com/repos/${this.config.github.owner}/${this.config.github.repo}/contents/${path}`;
    
    // First, check if file exists to get SHA
    let sha = null;
    try {
      const existing = await this.fetchGitHubFile(path);
      if (existing) {
        sha = existing.sha;
      }
    } catch (error) {
      // File doesn't exist, that's okay
    }

    const payload = {
      message,
      content: btoa(content)
    };

    if (sha) {
      payload.sha = sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${this.config.github.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  updateSyncStatus(status) {
    const indicator = document.getElementById('syncIndicator');
    const textElement = indicator?.querySelector('.sync-text');
    
    if (!indicator || !textElement) return;

    indicator.className = 'sync-indicator';
    
    switch (status) {
      case 'online':
        indicator.classList.add('online');
        textElement.textContent = 'Synced';
        break;
      case 'syncing':
        indicator.classList.add('syncing');
        textElement.textContent = 'Syncing...';
        break;
      case 'offline':
      default:
        textElement.textContent = 'Offline';
        break;
    }
  }

  updateLastSync() {
    const lastSyncElement = document.getElementById('lastSync');
    if (lastSyncElement) {
      lastSyncElement.textContent = `Last sync: ${new Date().toLocaleString()}`;
    }
  }

  startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.config.sync.autoSync && this.config.github.token) {
        this.syncToGitHub().catch(console.error);
      }
    }, this.config.sync.syncInterval);
  }

  setDefaultDate() {
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const dateInput = document.getElementById('entryDate');
      if (dateInput) {
        dateInput.value = today;
      }
    }, 100);
  }

  switchTab(tabName) {
    if (!tabName) return;
    
    console.log('Switching to tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    const activeContent = document.getElementById(tabName);
    if (activeContent) {
      activeContent.classList.add('active');
    }

    // Refresh content if needed
    setTimeout(() => {
      if (tabName === 'overview') {
        this.renderOverview();
      } else if (tabName === 'floor-details') {
        this.renderFloorDetails();
      } else if (tabName === 'add-entry') {
        this.populateCategoryDropdowns();
        this.setDefaultDate();
      } else if (tabName === 'category-analysis') {
        this.populateCategoryDropdowns();
      } else if (tabName === 'change-log') {
        this.renderChangeLog();
      } else if (tabName === 'settings') {
        this.loadSettingsUI();
      }
    }, 50);
  }

  switchFloor(floor) {
    if (!floor) return;
    
    console.log('Switching to floor:', floor);
    
    this.currentFloor = floor;
    
    // Update floor tab buttons
    document.querySelectorAll('.floor-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-floor="${floor}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    this.renderFloorDetails();
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  calculateTotals() {
    const totals = {
      Ground: 0,
      First: 0,
      Second: 0,
      total: 0
    };

    Object.keys(this.data).forEach(floor => {
      totals[floor] = this.data[floor].reduce((sum, entry) => sum + entry.amount, 0);
      totals.total += totals[floor];
    });

    return totals;
  }

  renderOverview() {
    const totals = this.calculateTotals();

    const elements = {
      totalProjectCost: document.getElementById('totalProjectCost'),
      groundFloorTotal: document.getElementById('groundFloorTotal'),
      firstFloorTotal: document.getElementById('firstFloorTotal'),
      secondFloorTotal: document.getElementById('secondFloorTotal'),
      groundFloorEntries: document.getElementById('groundFloorEntries'),
      firstFloorEntries: document.getElementById('firstFloorEntries'),
      secondFloorEntries: document.getElementById('secondFloorEntries')
    };

    if (elements.totalProjectCost) elements.totalProjectCost.textContent = this.formatCurrency(totals.total);
    if (elements.groundFloorTotal) elements.groundFloorTotal.textContent = this.formatCurrency(totals.Ground);
    if (elements.firstFloorTotal) elements.firstFloorTotal.textContent = this.formatCurrency(totals.First);
    if (elements.secondFloorTotal) elements.secondFloorTotal.textContent = this.formatCurrency(totals.Second);
    if (elements.groundFloorEntries) elements.groundFloorEntries.textContent = `${this.data.Ground.length} entries`;
    if (elements.firstFloorEntries) elements.firstFloorEntries.textContent = `${this.data.First.length} entries`;
    if (elements.secondFloorEntries) elements.secondFloorEntries.textContent = `${this.data.Second.length} entries`;
  }

  renderFloorDetails() {
    const floorData = this.data[this.currentFloor];
    const total = floorData.reduce((sum, entry) => sum + entry.amount, 0);

    const currentFloorName = document.getElementById('currentFloorName');
    const currentFloorTotal = document.getElementById('currentFloorTotal');
    
    if (currentFloorName) currentFloorName.textContent = `${this.currentFloor} Floor`;
    if (currentFloorTotal) currentFloorTotal.textContent = this.formatCurrency(total);

    const tbody = document.getElementById('entriesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (floorData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No entries found for this floor</td></tr>';
      return;
    }

    // Sort entries by date (newest first)
    const sortedEntries = [...floorData].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedEntries.forEach(entry => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td class="date-cell">${this.formatDate(entry.date)}</td>
        <td>${entry.product_service}</td>
        <td class="amount-cell">${this.formatCurrency(entry.amount)}</td>
        <td class="notes-cell">${entry.note || '-'}</td>
        <td class="actions-cell">
          <button class="action-btn action-btn--edit" data-entry-id="${entry.id}">Edit</button>
          <button class="action-btn action-btn--delete" data-entry-id="${entry.id}">Delete</button>
        </td>
      `;
    });
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  populateCategoryDropdowns() {
    const categorySelect = document.getElementById('entryCategory');
    const analysisSelect = document.getElementById('analysisCategory');

    if (categorySelect) {
      const currentValue = categorySelect.value; // Preserve current selection
      categorySelect.innerHTML = '<option value="">Select Category</option>';
      [...this.categories].sort().forEach(category => {
        const selected = category === currentValue ? ' selected' : '';
        categorySelect.innerHTML += `<option value="${category}"${selected}>${category}</option>`;
      });
      categorySelect.innerHTML += `<option value="Other"${currentValue === 'Other' ? ' selected' : ''}>Other</option>`;
    }

    if (analysisSelect) {
      const currentValue = analysisSelect.value; // Preserve current selection
      analysisSelect.innerHTML = '<option value="">Choose a category to analyze</option>';
      [...this.categories].sort().forEach(category => {
        const selected = category === currentValue ? ' selected' : '';
        analysisSelect.innerHTML += `<option value="${category}"${selected}>${category}</option>`;
      });
    }
  }

  renderChangeLog() {
    const container = document.getElementById('changeLogList');
    const filter = document.getElementById('logFilter')?.value || '';

    if (!container) return;

    let filteredLog = this.changeLog;
    if (filter) {
      filteredLog = this.changeLog.filter(entry => entry.action === filter);
    }

    if (filteredLog.length === 0) {
      container.innerHTML = '<div class="empty-state">No changes recorded yet</div>';
      return;
    }

    container.innerHTML = filteredLog.map(entry => `
      <div class="change-log-item">
        <div class="change-log-meta">
          <div class="change-action">
            <span class="action-badge action-badge--${entry.action}">${entry.action}</span>
            ${entry.details}
          </div>
          <div class="change-timestamp">${this.formatTimestamp(entry.timestamp)}</div>
        </div>
      </div>
    `).join('');
  }

  formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  loadSettingsUI() {
    // Load GitHub settings
    const githubOwner = document.getElementById('githubOwner');
    const githubRepo = document.getElementById('githubRepo');
    const githubToken = document.getElementById('githubToken');
    const autoSync = document.getElementById('autoSync');

    if (githubOwner) githubOwner.value = this.config.github.owner;
    if (githubRepo) githubRepo.value = this.config.github.repo;
    if (githubToken) githubToken.value = this.config.github.token;
    if (autoSync) autoSync.checked = this.config.sync.autoSync;
  }

  handleSaveSettings() {
    // Get GitHub settings
    const githubOwner = document.getElementById('githubOwner');
    const githubRepo = document.getElementById('githubRepo');
    const githubToken = document.getElementById('githubToken');
    const autoSync = document.getElementById('autoSync');

    if (githubOwner) this.config.github.owner = githubOwner.value;
    if (githubRepo) this.config.github.repo = githubRepo.value;
    if (githubToken) this.config.github.token = githubToken.value;
    if (autoSync) this.config.sync.autoSync = autoSync.checked;

    // Save configuration
    this.saveConfig();

    // Restart auto-sync if enabled
    if (this.config.sync.autoSync && this.config.github.token) {
      this.startAutoSync();
    }

    this.showSuccessMessage('Settings saved successfully!');
  }

  async handleManualSync() {
    try {
      await this.syncToGitHub();
      this.showSuccessMessage('Sync completed successfully!');
    } catch (error) {
      alert('Sync failed: ' + error.message);
    }
  }

  handleExportData() {
    const data = {
      data: this.data,
      changeLog: this.changeLog,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `construction-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.data) {
          this.data = imported.data;
          if (imported.changeLog) {
            this.changeLog = imported.changeLog;
          }
          this.extractCategories();
          this.renderOverview();
          this.renderFloorDetails();
          this.renderChangeLog();
          this.populateCategoryDropdowns();
          this.showSuccessMessage('Data imported successfully!');
        }
      } catch (error) {
        alert('Invalid file format: ' + error.message);
      }
    };
    reader.readAsText(file);
  }

  async handleTestConnection() {
    if (!this.config.github.owner || !this.config.github.repo || !this.config.github.token) {
      alert('Please fill in all GitHub configuration fields first.');
      return;
    }

    try {
      const url = `https://api.github.com/repos/${this.config.github.owner}/${this.config.github.repo}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${this.config.github.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        this.showSuccessMessage('GitHub connection successful!');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      alert('Connection failed: ' + error.message);
    }
  }

  handleChangePassword() {
    const current = document.getElementById('currentPassword')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirm = document.getElementById('confirmPassword')?.value;

    if (!current || !newPassword || !confirm) {
      alert('Please fill in all password fields.');
      return;
    }

    if (current !== this.config.auth.password) {
      alert('Current password is incorrect.');
      return;
    }

    if (newPassword !== confirm) {
      alert('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    this.config.auth.password = newPassword;
    this.saveConfig();

    // Clear fields
    const currentField = document.getElementById('currentPassword');
    const newField = document.getElementById('newPassword');
    const confirmField = document.getElementById('confirmPassword');
    
    if (currentField) currentField.value = '';
    if (newField) newField.value = '';
    if (confirmField) confirmField.value = '';

    this.showSuccessMessage('Password changed successfully!');
  }

  handleCategoryChange(e) {
    const customCategoryGroup = document.getElementById('customCategoryGroup');
    const customCategoryInput = document.getElementById('customCategory');

    if (!customCategoryGroup || !customCategoryInput) return;

    if (e.target.value === 'Other') {
      customCategoryGroup.style.display = 'block';
      customCategoryInput.required = true;
    } else {
      customCategoryGroup.style.display = 'none';
      customCategoryInput.required = false;
      customCategoryInput.value = '';
    }
  }

  async handleAddEntry(e) {
    e.preventDefault();
    
    try {
      const hasAuth = await this.requireAuth('add');
      if (!hasAuth) return;
    } catch (error) {
      console.log('Authentication cancelled');
      return;
    }
    
    const date = document.getElementById('entryDate')?.value;
    const floor = document.getElementById('entryFloor')?.value;
    const category = document.getElementById('entryCategory')?.value;
    const customCategory = document.getElementById('customCategory')?.value;
    const amount = parseFloat(document.getElementById('entryAmount')?.value || '0');
    const notes = document.getElementById('entryNotes')?.value || '';

    // Validate inputs
    if (!date || !floor || !category || isNaN(amount) || amount <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }

    // Determine final category
    const finalCategory = category === 'Other' ? customCategory : category;

    if (category === 'Other' && !customCategory.trim()) {
      alert('Please enter a custom category name');
      return;
    }

    // Create new entry
    const newEntry = {
      id: this.generateId(),
      date: date,
      product_service: finalCategory,
      amount: amount,
      note: notes
    };

    // Add to data
    this.data[floor].push(newEntry);
    this.extractCategories();

    // Log the change
    this.logChange('create', newEntry.id, newEntry);

    // Show success message
    this.showSuccessMessage('Entry added successfully!');

    // Reset form
    e.target.reset();
    this.setDefaultDate();
    const customCategoryGroup = document.getElementById('customCategoryGroup');
    if (customCategoryGroup) {
      customCategoryGroup.style.display = 'none';
    }

    // Refresh displays
    this.renderOverview();
    if (this.currentFloor === floor) {
      this.renderFloorDetails();
    }
    this.renderChangeLog();
    this.populateCategoryDropdowns();

    // Sync if auto-sync is enabled
    if (this.config.sync.autoSync) {
      this.syncToGitHub();
    }
  }

  showSuccessMessage(message) {
    // Remove existing success message if any
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Find the right container
    let container = document.querySelector('.add-entry-form');
    if (!container) {
      container = document.querySelector('.settings-container');
    }
    if (!container) {
      container = document.querySelector('.tab-content.active');
    }

    if (container) {
      // Create and show new success message
      const successDiv = document.createElement('div');
      successDiv.className = 'success-message';
      successDiv.innerHTML = `
        <span>✓</span>
        <span>${message}</span>
      `;

      container.insertBefore(successDiv, container.firstChild);

      // Remove after 3 seconds
      setTimeout(() => {
        if (successDiv.parentNode) {
          successDiv.remove();
        }
      }, 3000);
    }
  }

  handleAnalysisCategory(e) {
    const category = e.target.value;
    const analysisResults = document.getElementById('analysisResults');

    if (!analysisResults) return;

    if (!category) {
      analysisResults.style.display = 'none';
      return;
    }

    this.renderCategoryAnalysis(category);
    analysisResults.style.display = 'block';
  }

  renderCategoryAnalysis(category) {
    const totals = this.calculateTotals();
    const categoryData = {
      Ground: { total: 0, entries: 0 },
      First: { total: 0, entries: 0 },
      Second: { total: 0, entries: 0 },
      grandTotal: 0
    };

    // Calculate category totals for each floor
    Object.keys(this.data).forEach(floor => {
      this.data[floor].forEach(entry => {
        if (entry.product_service === category) {
          categoryData[floor].total += entry.amount;
          categoryData[floor].entries++;
          categoryData.grandTotal += entry.amount;
        }
      });
    });

    // Calculate percentage
    const percentage = totals.total > 0 ? ((categoryData.grandTotal / totals.total) * 100).toFixed(1) : 0;

    // Update UI
    const elements = {
      analysisCategoryName: document.getElementById('analysisCategoryName'),
      analysisTotalAmount: document.getElementById('analysisTotalAmount'),
      analysisPercentage: document.getElementById('analysisPercentage'),
      analysisGroundAmount: document.getElementById('analysisGroundAmount'),
      analysisGroundEntries: document.getElementById('analysisGroundEntries'),
      analysisFirstAmount: document.getElementById('analysisFirstAmount'),
      analysisFirstEntries: document.getElementById('analysisFirstEntries'),
      analysisSecondAmount: document.getElementById('analysisSecondAmount'),
      analysisSecondEntries: document.getElementById('analysisSecondEntries')
    };
    
    if (elements.analysisCategoryName) elements.analysisCategoryName.textContent = category;
    if (elements.analysisTotalAmount) elements.analysisTotalAmount.textContent = this.formatCurrency(categoryData.grandTotal);
    if (elements.analysisPercentage) elements.analysisPercentage.textContent = `${percentage}% of total project cost`;
    if (elements.analysisGroundAmount) elements.analysisGroundAmount.textContent = this.formatCurrency(categoryData.Ground.total);
    if (elements.analysisGroundEntries) elements.analysisGroundEntries.textContent = `${categoryData.Ground.entries} entries`;
    if (elements.analysisFirstAmount) elements.analysisFirstAmount.textContent = this.formatCurrency(categoryData.First.total);
    if (elements.analysisFirstEntries) elements.analysisFirstEntries.textContent = `${categoryData.First.entries} entries`;
    if (elements.analysisSecondAmount) elements.analysisSecondAmount.textContent = this.formatCurrency(categoryData.Second.total);
    if (elements.analysisSecondEntries) elements.analysisSecondEntries.textContent = `${categoryData.Second.entries} entries`;
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.costTracker = new ConstructionCostTracker();
});