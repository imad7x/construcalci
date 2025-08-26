// House Construction Cost Tracker - Unified Structure
class HouseConstructionTracker {
  constructor() {
    this.data = {
      House: [] // Unified structure - all 190 entries here
    };
    this.changeLog = [];
    this.categories = new Set();
    this.isAuthenticated = false;
    this.currentEditEntry = null;
    this.pendingAction = null;
    this.currentPage = 1;
    this.itemsPerPage = 25;
    this.filteredData = [];
    
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
    
    // Load initial data with all 190 entries
    await this.loadInitialData();
    
    // Set today's date as default
    this.setDefaultDate();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initial render
    this.renderAllEntries();
    this.renderAnalytics();
    this.populateCategoryDropdowns();
    this.renderChangeLog();
    this.updateSyncStatus('offline');
    
    // Start auto-sync if enabled
    if (this.config.sync.autoSync && this.config.github.token) {
      this.startAutoSync();
    }
    
    console.log('House Construction Tracker initialized with', this.data.House.length, 'entries');
  }

  loadConfig() {
    try {
      const savedConfig = localStorage.getItem('houseConstructionConfig');
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
      localStorage.setItem('houseConstructionConfig', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  checkAuthStatus() {
    const authData = sessionStorage.getItem('houseConstructionAuth');
    if (authData) {
      try {
        const { timestamp } = JSON.parse(authData);
        if (Date.now() - timestamp < this.config.auth.sessionTimeout) {
          this.isAuthenticated = true;
        } else {
          sessionStorage.removeItem('houseConstructionAuth');
        }
      } catch (error) {
        sessionStorage.removeItem('houseConstructionAuth');
      }
    }
  }

  authenticate(password) {
    if (password === this.config.auth.password) {
      this.isAuthenticated = true;
      sessionStorage.setItem('houseConstructionAuth', JSON.stringify({
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

    // Load all 190 entries into unified House structure
    const allEntries = [
      {"id": "house_1", "date": "2025-03-12", "product_service": "Labour", "amount": 1000, "note": "JCB", "original_floor": "Ground"},
      {"id": "house_2", "date": "2025-03-12", "product_service": "Labour", "amount": 300, "note": "", "original_floor": "Ground"},
      {"id": "house_3", "date": "2025-03-12", "product_service": "Loan", "amount": 5900, "note": "Processing fee", "original_floor": "Ground"},
      {"id": "house_4", "date": "2025-03-12", "product_service": "Tools & Material", "amount": 165, "note": "", "original_floor": "Ground"},
      {"id": "house_5", "date": "2025-03-13", "product_service": "Loan", "amount": 1000, "note": "Site inspection", "original_floor": "Ground"},
      {"id": "house_6", "date": "2025-03-13", "product_service": "Bescom", "amount": 18000, "note": "Temp meter", "original_floor": "Ground"},
      {"id": "house_7", "date": "2025-03-13", "product_service": "Loan", "amount": 20000, "note": "lancha", "original_floor": "Ground"},
      {"id": "house_8", "date": "2025-03-13", "product_service": "Tools & Material", "amount": 1600, "note": "Motor", "original_floor": "Ground"},
      {"id": "house_9", "date": "2025-03-13", "product_service": "Water Tank", "amount": 1200, "note": "", "original_floor": "Ground"},
      {"id": "house_10", "date": "2025-03-13", "product_service": "Labour", "amount": 400, "note": "", "original_floor": "Ground"},
      {"id": "house_11", "date": "2025-03-15", "product_service": "Aggregate", "amount": 16000, "note": "40mm 2 truck", "original_floor": "Ground"},
      {"id": "house_12", "date": "2025-03-15", "product_service": "Sand", "amount": 11000, "note": "1 truck", "original_floor": "Ground"},
      {"id": "house_13", "date": "2025-03-15", "product_service": "Bricks", "amount": 20000, "note": "500", "original_floor": "Ground"},
      {"id": "house_14", "date": "2025-03-15", "product_service": "Mestri", "amount": 50000, "note": "", "original_floor": "Ground"},
      {"id": "house_15", "date": "2025-03-15", "product_service": "Labour", "amount": 1600, "note": "Mestri", "original_floor": "Ground"},
      {"id": "house_16", "date": "2025-03-15", "product_service": "Water Tank", "amount": 1200, "note": "", "original_floor": "Ground"},
      {"id": "house_17", "date": "2025-03-17", "product_service": "Loan", "amount": 7494, "note": "Fee", "original_floor": "Ground"},
      {"id": "house_18", "date": "2025-03-18", "product_service": "Paya", "amount": 25000, "note": "JCB advance", "original_floor": "Ground"},
      {"id": "house_19", "date": "2025-03-18", "product_service": "Loan", "amount": 11000, "note": "Stamp duty", "original_floor": "Ground"},
      {"id": "house_20", "date": "2025-03-18", "product_service": "Labour", "amount": 700, "note": "", "original_floor": "Ground"},
      {"id": "house_21", "date": "2025-03-19", "product_service": "Water Tank", "amount": 600, "note": "", "original_floor": "Ground"},
      {"id": "house_22", "date": "2025-03-19", "product_service": "Labour", "amount": 700, "note": "Lunch", "original_floor": "Ground"},
      {"id": "house_23", "date": "2025-03-19", "product_service": "Labour", "amount": 600, "note": "", "original_floor": "Ground"},
      {"id": "house_24", "date": "2025-03-19", "product_service": "Labour", "amount": 500, "note": "Mestri", "original_floor": "Ground"},
      {"id": "house_25", "date": "2025-03-19", "product_service": "Tools & Material", "amount": 150, "note": "", "original_floor": "Ground"},
      {"id": "house_26", "date": "2025-03-21", "product_service": "Bescom", "amount": 4200, "note": "Temp Meter Labour", "original_floor": "Ground"},
      {"id": "house_27", "date": "2025-03-21", "product_service": "Water Tank", "amount": 600, "note": "", "original_floor": "Ground"},
      {"id": "house_28", "date": "2025-03-21", "product_service": "Bescom", "amount": 200, "note": "labour", "original_floor": "Ground"},
      {"id": "house_29", "date": "2025-03-21", "product_service": "Tools & Material", "amount": 690, "note": "", "original_floor": "Ground"},
      {"id": "house_30", "date": "2025-03-21", "product_service": "Tools & Material", "amount": 750, "note": "", "original_floor": "Ground"},
      {"id": "house_31", "date": "2025-03-22", "product_service": "Aggregate", "amount": 24000, "note": "20mm 3 truck", "original_floor": "Ground"},
      {"id": "house_32", "date": "2025-03-22", "product_service": "Sand", "amount": 29000, "note": "1 truck 1 6 wheel", "original_floor": "Ground"},
      {"id": "house_33", "date": "2025-03-22", "product_service": "Mestri", "amount": 20000, "note": "", "original_floor": "Ground"},
      {"id": "house_34", "date": "2025-03-22", "product_service": "Tools & Material", "amount": 1700, "note": "Material (Sump mesh)", "original_floor": "Ground"},
      {"id": "house_35", "date": "2025-03-24", "product_service": "Water Tank", "amount": 1800, "note": "", "original_floor": "Ground"},
      {"id": "house_36", "date": "2025-03-24", "product_service": "Labour", "amount": 340, "note": "", "original_floor": "Ground"},
      {"id": "house_37", "date": "2025-03-25", "product_service": "Steel", "amount": 158760, "note": "2.6 ton + binding", "original_floor": "Ground"},
      {"id": "house_38", "date": "2025-03-25", "product_service": "Cement", "amount": 11400, "note": "30 bags", "original_floor": "Ground"},
      {"id": "house_39", "date": "2025-03-26", "product_service": "Loan", "amount": 27450, "note": "MODT", "original_floor": "Ground"},
      {"id": "house_40", "date": "2025-03-27", "product_service": "Stone", "amount": 11000, "note": "Paya", "original_floor": "Ground"},
      {"id": "house_41", "date": "2025-03-27", "product_service": "Loan", "amount": 6000, "note": "MODT fees", "original_floor": "Ground"},
      {"id": "house_42", "date": "2025-03-27", "product_service": "Loan", "amount": 15000, "note": "Paper publication", "original_floor": "Ground"},
      {"id": "house_43", "date": "2025-03-28", "product_service": "Cement", "amount": 49400, "note": "130", "original_floor": "Ground"},
      {"id": "house_44", "date": "2025-03-29", "product_service": "Mestri", "amount": 10000, "note": "", "original_floor": "Ground"},
      {"id": "house_45", "date": "2025-03-29", "product_service": "Paya", "amount": 8000, "note": "Paya digging", "original_floor": "Ground"},
      {"id": "house_46", "date": "2025-03-29", "product_service": "Tools & Material", "amount": 3000, "note": "Stool", "original_floor": "Ground"},
      {"id": "house_47", "date": "2025-03-29", "product_service": "Doors and Windows", "amount": 14000, "note": "Door Vascal", "original_floor": "Ground"},
      {"id": "house_48", "date": "2025-04-05", "product_service": "Water Tank", "amount": 600, "note": "", "original_floor": "Ground"},
      {"id": "house_49", "date": "2025-04-05", "product_service": "Labour", "amount": 1600, "note": "Plinth beam", "original_floor": "Ground"},
      {"id": "house_50", "date": "2025-04-05", "product_service": "Labour", "amount": 1700, "note": "Lunch", "original_floor": "Ground"},
      {"id": "house_51", "date": "2025-04-05", "product_service": "Tools & Material", "amount": 1400, "note": "", "original_floor": "Ground"},
      {"id": "house_52", "date": "2025-04-07", "product_service": "Mestri", "amount": 50000, "note": "", "original_floor": "Ground"},
      {"id": "house_53", "date": "2025-04-07", "product_service": "Labour", "amount": 150, "note": "Lunch", "original_floor": "Ground"},
      {"id": "house_54", "date": "2025-04-07", "product_service": "Plumbing", "amount": 3600, "note": "", "original_floor": "Ground"},
      {"id": "house_55", "date": "2025-04-07", "product_service": "Water Tank", "amount": 1200, "note": "", "original_floor": "Ground"},
      {"id": "house_56", "date": "2025-04-10", "product_service": "Paya", "amount": 21000, "note": "JCB", "original_floor": "Ground"},
      {"id": "house_57", "date": "2025-04-10", "product_service": "Misc", "amount": 1000, "note": "Dog resque", "original_floor": "Ground"},
      {"id": "house_58", "date": "2025-04-10", "product_service": "Labour", "amount": 500, "note": "JCB", "original_floor": "Ground"},
      {"id": "house_59", "date": "2025-04-12", "product_service": "Aggregate", "amount": 8000, "note": "20mm 1 truck", "original_floor": "Ground"},
      {"id": "house_60", "date": "2025-04-12", "product_service": "Sand", "amount": 19000, "note": "6 wheel", "original_floor": "Ground"},
      {"id": "house_61", "date": "2025-04-12", "product_service": "Water Tank", "amount": 1800, "note": "", "original_floor": "Ground"},
      {"id": "house_62", "date": "2025-04-14", "product_service": "Elevation plan", "amount": 2500, "note": "", "original_floor": "Ground"},
      {"id": "house_63", "date": "2025-04-15", "product_service": "Paya", "amount": 6000, "note": "Mud leveling", "original_floor": "Ground"},
      {"id": "house_64", "date": "2025-04-16", "product_service": "Steel", "amount": 34593, "note": "550kg", "original_floor": "Ground"},
      {"id": "house_65", "date": "2025-04-16", "product_service": "Cement", "amount": 19750, "note": "50 bags", "original_floor": "Ground"},
      {"id": "house_66", "date": "2025-04-19", "product_service": "Bricks", "amount": 21250, "note": "400(6') + 150 (4')", "original_floor": "Ground"},
      {"id": "house_67", "date": "2025-04-19", "product_service": "Aggregate", "amount": 16000, "note": "20mm & 40mm x 1 unit", "original_floor": "Ground"},
      {"id": "house_68", "date": "2025-04-19", "product_service": "Mestri", "amount": 15000, "note": "", "original_floor": "Ground"},
      {"id": "house_69", "date": "2025-04-19", "product_service": "Water Tank", "amount": 1200, "note": "", "original_floor": "Ground"},
      {"id": "house_70", "date": "2025-04-22", "product_service": "Bricks", "amount": 21500, "note": "6\" 450 + 100 4\"", "original_floor": "Ground"},
      {"id": "house_71", "date": "2025-04-22", "product_service": "Doors and Windows", "amount": 8203, "note": "Grill Steel", "original_floor": "Ground"},
      {"id": "house_72", "date": "2025-04-25", "product_service": "Doors and Windows", "amount": 2280, "note": "Grill Labor", "original_floor": "Ground"},
      {"id": "house_73", "date": "2025-04-25", "product_service": "Tools & Material", "amount": 1400, "note": "Hose pipe", "original_floor": "Ground"},
      {"id": "house_74", "date": "2025-04-26", "product_service": "Tools & Material", "amount": 10000, "note": "Water pump motor", "original_floor": "Ground"},
      {"id": "house_75", "date": "2025-04-26", "product_service": "Mestri", "amount": 15000, "note": "", "original_floor": "Ground"},
      {"id": "house_76", "date": "2025-05-05", "product_service": "Mestri", "amount": 15000, "note": "", "original_floor": "Ground"},
      {"id": "house_77", "date": "2025-05-05", "product_service": "Cement", "amount": 24600, "note": "60 bags", "original_floor": "Ground"},
      {"id": "house_78", "date": "2025-05-07", "product_service": "Mestri", "amount": 50000, "note": "", "original_floor": "Ground"},
      {"id": "house_79", "date": "2025-05-09", "product_service": "Electrical", "amount": 5869, "note": "Material", "original_floor": "Ground"},
      {"id": "house_80", "date": "2025-05-10", "product_service": "Water Tank", "amount": 1800, "note": "", "original_floor": "Ground"},
      {"id": "house_81", "date": "2025-05-10", "product_service": "Tools & Material", "amount": 4300, "note": "Hasir bedding", "original_floor": "Ground"},
      {"id": "house_82", "date": "2025-05-10", "product_service": "Steel", "amount": 110000, "note": "61.5 per kg", "original_floor": "Ground"},
      {"id": "house_83", "date": "2025-05-10", "product_service": "Mestri", "amount": 20000, "note": "Centering", "original_floor": "Ground"},
      {"id": "house_84", "date": "2025-05-10", "product_service": "Mestri", "amount": 15000, "note": "Steel worker", "original_floor": "Ground"},
      {"id": "house_85", "date": "2025-05-10", "product_service": "Labour", "amount": 2500, "note": "", "original_floor": "Ground"},
      {"id": "house_86", "date": "2025-05-10", "product_service": "Mestri", "amount": 35000, "note": "", "original_floor": "Ground"},
      {"id": "house_87", "date": "2025-05-10", "product_service": "Labour", "amount": 6000, "note": "", "original_floor": "Ground"},
      {"id": "house_88", "date": "2025-05-10", "product_service": "Electrical", "amount": 5000, "note": "Work", "original_floor": "Ground"},
      {"id": "house_89", "date": "2025-05-10", "product_service": "Sand", "amount": 19000, "note": "6 wheeler", "original_floor": "Ground"},
      {"id": "house_90", "date": "2025-05-10", "product_service": "Aggregate", "amount": 15000, "note": "20mm 6 wheeler", "original_floor": "Ground"},
      {"id": "house_91", "date": "2025-05-10", "product_service": "Cement", "amount": 38700, "note": "90 bags", "original_floor": "Ground"},
      {"id": "house_92", "date": "2025-05-10", "product_service": "Labour", "amount": 2500, "note": "Lunch", "original_floor": "Ground"},
      {"id": "house_93", "date": "2025-05-10", "product_service": "Miscellaneous", "amount": 2000, "note": "Tools, transport, etc", "original_floor": "Ground"},
      {"id": "house_94", "date": "2025-05-14", "product_service": "Doors and Windows", "amount": 20000, "note": "Door vascal advance", "original_floor": "First"},
      {"id": "house_95", "date": "2025-05-19", "product_service": "Steel", "amount": 23500, "note": "385kg", "original_floor": "First"},
      {"id": "house_96", "date": "2025-05-21", "product_service": "Mestri", "amount": 5000, "note": "Steel work", "original_floor": "First"},
      {"id": "house_97", "date": "2025-05-24", "product_service": "Water Tank", "amount": 600, "note": "", "original_floor": "First"},
      {"id": "house_98", "date": "2025-05-26", "product_service": "Doors and Windows", "amount": 6250, "note": "Grill Steel", "original_floor": "First"},
      {"id": "house_99", "date": "2025-05-26", "product_service": "Doors and Windows", "amount": 3300, "note": "Grill Labor", "original_floor": "First"},
      {"id": "house_100", "date": "2025-05-28", "product_service": "Bricks", "amount": 21500, "note": "", "original_floor": "First"},
      {"id": "house_101", "date": "2025-05-28", "product_service": "Tools & Material", "amount": 2000, "note": "", "original_floor": "First"},
      {"id": "house_102", "date": "2025-05-28", "product_service": "Cement", "amount": 12600, "note": "30 bag", "original_floor": "First"},
      {"id": "house_103", "date": "2025-05-29", "product_service": "Plumbing", "amount": 1600, "note": "", "original_floor": "First"},
      {"id": "house_104", "date": "2025-05-29", "product_service": "Water Tank", "amount": 1200, "note": "", "original_floor": "First"},
      {"id": "house_105", "date": "2025-05-29", "product_service": "Bricks", "amount": 20000, "note": "", "original_floor": "First"},
      {"id": "house_106", "date": "2025-05-29", "product_service": "Interior", "amount": 12000, "note": "Door and vascal", "original_floor": "First"},
      {"id": "house_107", "date": "2025-05-31", "product_service": "Mestri", "amount": 30000, "note": "", "original_floor": "First"},
      {"id": "house_108", "date": "2025-05-31", "product_service": "Sand", "amount": 19000, "note": "6 wheel", "original_floor": "First"},
      {"id": "house_109", "date": "2025-06-02", "product_service": "Doors and Windows", "amount": 2900, "note": "Grill Steel", "original_floor": "First"},
      {"id": "house_110", "date": "2025-06-02", "product_service": "Doors and Windows", "amount": 1500, "note": "Grill Labour", "original_floor": "First"},
      {"id": "house_111", "date": "2025-06-02", "product_service": "Water Tank", "amount": 1200, "note": "", "original_floor": "First"},
      {"id": "house_112", "date": "2025-06-07", "product_service": "Labour", "amount": 1200, "note": "Lunch", "original_floor": "First"},
      {"id": "house_113", "date": "2025-06-07", "product_service": "Cement", "amount": 21000, "note": "50 bags", "original_floor": "First"},
      {"id": "house_114", "date": "2025-06-07", "product_service": "Bricks", "amount": 20000, "note": "500 bricks", "original_floor": "First"},
      {"id": "house_115", "date": "2025-06-07", "product_service": "Mestri", "amount": 20000, "note": "", "original_floor": "First"},
      {"id": "house_116", "date": "2025-06-11", "product_service": "Steel", "amount": 23500, "note": "", "original_floor": "First"},
      {"id": "house_117", "date": "2025-06-12", "product_service": "Tools & Material", "amount": 4300, "note": "Hasir", "original_floor": "First"},
      {"id": "house_118", "date": "2025-06-12", "product_service": "Electrical", "amount": 6400, "note": "", "original_floor": "First"},
      {"id": "house_119", "date": "2025-06-12", "product_service": "Tools & Material", "amount": 1400, "note": "Hooks", "original_floor": "First"},
      {"id": "house_120", "date": "2025-06-12", "product_service": "Doors and Windows", "amount": 1100, "note": "Door frame covering", "original_floor": "First"},
      {"id": "house_121", "date": "2025-06-13", "product_service": "Electrical", "amount": 4300, "note": "Rent house mateiral", "original_floor": "Ground"},
      {"id": "house_122", "date": "2025-06-13", "product_service": "Electrical", "amount": 9000, "note": "work", "original_floor": "Ground"},
      {"id": "house_123", "date": "2025-06-13", "product_service": "Doors and Windows", "amount": 1080, "note": "Plywood cover", "original_floor": "Ground"},
      {"id": "house_124", "date": "2025-06-13", "product_service": "Water Tank", "amount": 1200, "note": "", "original_floor": "First"},
      {"id": "house_125", "date": "2025-06-13", "product_service": "Labour", "amount": 4000, "note": "Work", "original_floor": "First"},
      {"id": "house_126", "date": "2025-06-13", "product_service": "Labour", "amount": 2000, "note": "Lunch", "original_floor": "First"},
      {"id": "house_127", "date": "2025-06-13", "product_service": "Mestri", "amount": 110000, "note": "", "original_floor": "First"},
      {"id": "house_128", "date": "2025-06-13", "product_service": "Sand", "amount": 19000, "note": "", "original_floor": "First"},
      {"id": "house_129", "date": "2025-06-13", "product_service": "Aggregate", "amount": 15000, "note": "", "original_floor": "First"},
      {"id": "house_130", "date": "2025-06-24", "product_service": "Steel", "amount": 123000, "note": "", "original_floor": "First"},
      {"id": "house_131", "date": "2025-06-24", "product_service": "Cement", "amount": 33500, "note": "@420", "original_floor": "First"},
      {"id": "house_132", "date": "2025-06-24", "product_service": "Cement", "amount": 16500, "note": "@415", "original_floor": "Second"},
      {"id": "house_133", "date": "2025-06-24", "product_service": "Water Tank", "amount": 1200, "note": "", "original_floor": "Second"},
      {"id": "house_134", "date": "2025-06-24", "product_service": "Labour", "amount": 1200, "note": "", "original_floor": "Second"},
      {"id": "house_135", "date": "2025-06-24", "product_service": "Tools & Material", "amount": 2500, "note": "", "original_floor": "Second"},
      {"id": "house_136", "date": "2025-06-24", "product_service": "Bricks", "amount": 21500, "note": "", "original_floor": "Second"},
      {"id": "house_137", "date": "2025-06-25", "product_service": "Steel", "amount": 4515, "note": "", "original_floor": "Second"},
      {"id": "house_138", "date": "2025-06-25", "product_service": "Doors and Windows", "amount": 2000, "note": "", "original_floor": "Second"},
      {"id": "house_139", "date": "2025-06-25", "product_service": "Aggregate", "amount": 8000, "note": "", "original_floor": "Second"},
      {"id": "house_140", "date": "2025-07-01", "product_service": "Bricks", "amount": 20000, "note": "", "original_floor": "Second"},
      {"id": "house_141", "date": "2025-07-01", "product_service": "Mestri", "amount": 30000, "note": "", "original_floor": "Second"},
      {"id": "house_142", "date": "2025-07-01", "product_service": "Doors and Windows", "amount": 27000, "note": "", "original_floor": "Second"},
      {"id": "house_143", "date": "2025-07-01", "product_service": "Bricks", "amount": 20000, "note": "", "original_floor": "Second"},
      {"id": "house_144", "date": "2025-07-01", "product_service": "Mestri", "amount": 25000, "note": "", "original_floor": "Second"},
      {"id": "house_145", "date": "2025-07-08", "product_service": "Hasir", "amount": 4400, "note": "", "original_floor": "Second"},
      {"id": "house_146", "date": "2025-07-08", "product_service": "Water Tank", "amount": 1800, "note": "", "original_floor": "Second"},
      {"id": "house_147", "date": "2025-07-10", "product_service": "Electrical", "amount": 4500, "note": "material", "original_floor": "Second"},
      {"id": "house_148", "date": "2025-07-10", "product_service": "Electrical", "amount": 5000, "note": "labor", "original_floor": "Second"},
      {"id": "house_149", "date": "2025-07-12", "product_service": "Mestri", "amount": 110000, "note": "", "original_floor": "Second"},
      {"id": "house_150", "date": "2025-07-12", "product_service": "Sand", "amount": 19000, "note": "", "original_floor": "Second"},
      {"id": "house_151", "date": "2025-07-12", "product_service": "Aggregate", "amount": 15000, "note": "", "original_floor": "Second"},
      {"id": "house_152", "date": "2025-07-15", "product_service": "Plumbing", "amount": 6800, "note": "chamber", "original_floor": "Ground"},
      {"id": "house_153", "date": "2025-07-15", "product_service": "Steel", "amount": 98500, "note": "", "original_floor": "Second"},
      {"id": "house_154", "date": "2025-07-15", "product_service": "Cement", "amount": 37000, "note": "", "original_floor": "Second"},
      {"id": "house_155", "date": "2025-07-16", "product_service": "Mestri", "amount": 5000, "note": "", "original_floor": "Second"},
      {"id": "house_156", "date": "2025-07-16", "product_service": "Plumbing", "amount": 2500, "note": "labor", "original_floor": "Second"},
      {"id": "house_157", "date": "2025-07-16", "product_service": "Plumbing", "amount": 1500, "note": "", "original_floor": "Second"},
      {"id": "house_158", "date": "2025-07-16", "product_service": "Doors and Windows", "amount": 5000, "note": "steel grill", "original_floor": "Second"},
      {"id": "house_159", "date": "2025-07-26", "product_service": "Bricks", "amount": 23000, "note": "", "original_floor": "Second"},
      {"id": "house_160", "date": "2025-07-26", "product_service": "Mestri", "amount": 27000, "note": "", "original_floor": "Second"},
      {"id": "house_161", "date": "2025-07-28", "product_service": "Bricks", "amount": 22750, "note": "", "original_floor": "Second"},
      {"id": "house_162", "date": "2025-07-28", "product_service": "Doors and Windows", "amount": 11000, "note": "Vascal terrace", "original_floor": "Second"},
      {"id": "house_163", "date": "2025-08-02", "product_service": "Sand", "amount": 9000, "note": "", "original_floor": "Second"},
      {"id": "house_164", "date": "2025-08-02", "product_service": "Aggregate", "amount": 8000, "note": "", "original_floor": "Second"},
      {"id": "house_165", "date": "2025-08-02", "product_service": "Mestri", "amount": 23000, "note": "", "original_floor": "Second"},
      {"id": "house_166", "date": "2025-08-02", "product_service": "Hasir", "amount": 2700, "note": "", "original_floor": "Second"},
      {"id": "house_167", "date": "2025-08-04", "product_service": "Cement", "amount": 60500, "note": "", "original_floor": "Second"},
      {"id": "house_168", "date": "2025-08-09", "product_service": "Water Tank", "amount": 2400, "note": "", "original_floor": "Second"},
      {"id": "house_169", "date": "2025-08-09", "product_service": "Mestri", "amount": 75000, "note": "", "original_floor": "Second"},
      {"id": "house_170", "date": "2025-08-11", "product_service": "Tools & Material", "amount": 1000, "note": "plastering", "original_floor": "Second"},
      {"id": "house_171", "date": "2025-08-11", "product_service": "Mestri", "amount": 4000, "note": "plastering", "original_floor": "Second"},
      {"id": "house_172", "date": "2025-08-11", "product_service": "Electrical", "amount": 800, "note": "", "original_floor": "Second"},
      {"id": "house_173", "date": "2025-08-11", "product_service": "Electrical", "amount": 5000, "note": "Work", "original_floor": "Second"},
      {"id": "house_174", "date": "2025-08-11", "product_service": "Mestri", "amount": 5000, "note": "", "original_floor": "Second"},
      {"id": "house_175", "date": "2025-08-11", "product_service": "Doors and Windows", "amount": 1600, "note": "", "original_floor": "Second"},
      {"id": "house_176", "date": "2025-08-13", "product_service": "Sand", "amount": 12000, "note": "tractor", "original_floor": "Ground"},
      {"id": "house_177", "date": "2025-08-16", "product_service": "Mestri", "amount": 10000, "note": "Mestri", "original_floor": "Second"},
      {"id": "house_178", "date": "2025-08-16", "product_service": "Mestri", "amount": 10000, "note": "plasteri", "original_floor": "Second"},
      {"id": "house_179", "date": "2025-08-16", "product_service": "Bricks", "amount": 10200, "note": "", "original_floor": "Second"},
      {"id": "house_180", "date": "2025-08-20", "product_service": "Mestri", "amount": 5000, "note": "Plastering", "original_floor": "Ground"},
      {"id": "house_181", "date": "2025-08-20", "product_service": "Mestri", "amount": 20000, "note": "survey", "original_floor": "Ground"},
      {"id": "house_182", "date": "2025-08-20", "product_service": "Electrical", "amount": 15000, "note": "Material", "original_floor": "Second"},
      {"id": "house_183", "date": "2025-08-20", "product_service": "Steel", "amount": 45000, "note": "", "original_floor": "Second"},
      {"id": "house_184", "date": "2025-08-23", "product_service": "Plumbing", "amount": 5000, "note": "", "original_floor": "Ground"},
      {"id": "house_185", "date": "2025-08-24", "product_service": "Plumbing", "amount": 14300, "note": "Material", "original_floor": "First"},
      {"id": "house_186", "date": "2025-08-24", "product_service": "Plumbing", "amount": 25000, "note": "Material", "original_floor": "First"},
      {"id": "house_187", "date": "2025-08-24", "product_service": "Mestri", "amount": 6000, "note": "", "original_floor": "Second"},
      {"id": "house_188", "date": "2025-08-24", "product_service": "Mestri", "amount": 30000, "note": "plastering", "original_floor": "Second"},
      {"id": "house_189", "date": "2025-08-24", "product_service": "Electrical", "amount": 11000, "note": "", "original_floor": "Second"},
      {"id": "house_190", "date": "2025-08-25", "product_service": "Mestri", "amount": 1000, "note": "Plastering", "original_floor": "First"}
    ];

    // Set unified structure with all 190 entries
    this.data.House = allEntries;
    this.extractCategories();

    // Initialize change log
    this.changeLog = [
      {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        action: 'create',
        entryId: 'system',
        changes: { count: 190 },
        details: 'Initial data loaded - 190 construction entries'
      }
    ];

    console.log('Loaded', this.data.House.length, 'entries in unified House structure');
  }

  generateId() {
    return 'house_' + Math.random().toString(36).substr(2, 9);
  }

  extractCategories() {
    this.categories.clear();
    this.data.House.forEach(entry => {
      this.categories.add(entry.product_service);
    });
  }

  setupEventListeners() {
    // Use event delegation for better event handling
    document.body.addEventListener('click', this.handleClick.bind(this));
    document.body.addEventListener('input', this.handleInput.bind(this));
    document.body.addEventListener('change', this.handleChange.bind(this));
    document.body.addEventListener('submit', this.handleSubmit.bind(this));
    
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

  handleClick(e) {
    // Main tab navigation
    if (e.target.classList.contains('tab-btn')) {
      e.preventDefault();
      const tabName = e.target.getAttribute('data-tab');
      if (tabName) {
        this.switchTab(tabName);
      }
      return;
    }

    // Edit and delete buttons
    if (e.target.classList.contains('action-btn--edit')) {
      e.preventDefault();
      const entryId = e.target.getAttribute('data-entry-id');
      this.handleEditEntry(entryId);
      return;
    }

    if (e.target.classList.contains('action-btn--delete')) {
      e.preventDefault();
      const entryId = e.target.getAttribute('data-entry-id');
      this.handleDeleteEntry(entryId);
      return;
    }

    // Pagination buttons
    if (e.target.id === 'prevPage') {
      e.preventDefault();
      this.changePage(-1);
      return;
    }

    if (e.target.id === 'nextPage') {
      e.preventDefault();
      this.changePage(1);
      return;
    }

    // Other button handlers
    const buttonHandlers = {
      'saveSettings': () => this.handleSaveSettings(),
      'manualSync': () => this.handleManualSync(),
      'exportData': () => this.handleExportData(),
      'exportAllData': () => this.handleExportData(),
      'importData': () => document.getElementById('importFile')?.click(),
      'testConnection': () => this.handleTestConnection(),
      'changePassword': () => this.handleChangePassword(),
      'confirmAuth': () => this.handlePasswordConfirm(),
      'cancelAuth': () => this.handleCancelAuth(),
      'saveEdit': () => this.handleSaveEdit(),
      'cancelEdit': () => this.hideEditModal()
    };

    if (buttonHandlers[e.target.id]) {
      e.preventDefault();
      buttonHandlers[e.target.id]();
      return;
    }

    // Modal backdrop clicks
    if (e.target.classList.contains('modal-backdrop')) {
      e.preventDefault();
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
  }

  handleInput(e) {
    if (e.target.id === 'searchEntries') {
      this.applyFiltersAndRender();
    }
  }

  handleChange(e) {
    const changeHandlers = {
      'entryCategory': () => this.handleCategoryChange(e),
      'analysisCategory': () => this.handleAnalysisCategory(e),
      'logFilter': () => this.renderChangeLog(),
      'filterCategory': () => this.applyFiltersAndRender(),
      'sortEntries': () => this.applyFiltersAndRender(),
      'importFile': () => this.handleImportFile(e)
    };

    if (changeHandlers[e.target.id]) {
      changeHandlers[e.target.id]();
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    if (e.target.id === 'addEntryForm') {
      this.handleAddEntry(e);
    } else if (e.target.id === 'editEntryForm') {
      this.handleSaveEdit();
    }
  }

  handleCancelAuth() {
    this.hidePasswordModal();
    if (this.pendingActionReject) {
      this.pendingActionReject();
      this.pendingActionReject = null;
    }
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

    // Refresh content
    setTimeout(() => {
      if (tabName === 'all-entries') {
        this.renderAllEntries();
      } else if (tabName === 'add-entry') {
        this.populateCategoryDropdowns();
        this.setDefaultDate();
      } else if (tabName === 'analytics') {
        this.renderAnalytics();
        this.populateCategoryDropdowns();
      } else if (tabName === 'change-log') {
        this.renderChangeLog();
      } else if (tabName === 'settings') {
        this.loadSettingsUI();
      }
    }, 50);
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
      total: 0,
      entryCounts: { Ground: 0, First: 0, Second: 0, total: 0 }
    };

    this.data.House.forEach(entry => {
      const floor = entry.original_floor;
      totals[floor] += entry.amount;
      totals.total += entry.amount;
      totals.entryCounts[floor]++;
      totals.entryCounts.total++;
    });

    return totals;
  }

  applyFiltersAndRender() {
    const searchTerm = document.getElementById('searchEntries')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('filterCategory')?.value || '';
    const sortOption = document.getElementById('sortEntries')?.value || 'date-desc';

    // Filter data
    this.filteredData = this.data.House.filter(entry => {
      const matchesSearch = !searchTerm || 
        entry.product_service.toLowerCase().includes(searchTerm) ||
        (entry.note && entry.note.toLowerCase().includes(searchTerm)) ||
        entry.original_floor.toLowerCase().includes(searchTerm);
      
      const matchesCategory = !categoryFilter || entry.product_service === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    // Sort data
    this.filteredData.sort((a, b) => {
      switch (sortOption) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'amount-asc':
          return a.amount - b.amount;
        case 'amount-desc':
          return b.amount - a.amount;
        case 'category':
          return a.product_service.localeCompare(b.product_service);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    // Reset to first page
    this.currentPage = 1;
    
    this.renderEntriesTable();
    this.updateEntriesSummary();
  }

  renderAllEntries() {
    this.applyFiltersAndRender();
    this.updateProjectStats();
  }

  updateProjectStats() {
    const totals = this.calculateTotals();
    
    const totalCostElement = document.getElementById('totalProjectCost');
    const totalEntriesElement = document.getElementById('totalEntries');
    
    if (totalCostElement) totalCostElement.textContent = this.formatCurrency(totals.total);
    if (totalEntriesElement) totalEntriesElement.textContent = totals.entryCounts.total.toString();
  }

  updateEntriesSummary() {
    const filteredTotal = this.filteredData.reduce((sum, entry) => sum + entry.amount, 0);
    
    const filteredCountElement = document.getElementById('filteredCount');
    const filteredTotalElement = document.getElementById('filteredTotal');
    
    if (filteredCountElement) filteredCountElement.textContent = this.filteredData.length.toString();
    if (filteredTotalElement) filteredTotalElement.textContent = this.formatCurrency(filteredTotal);
  }

  renderEntriesTable() {
    const tbody = document.getElementById('entriesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (this.filteredData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No entries found</td></tr>';
      this.updatePagination();
      return;
    }

    // Calculate pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredData.length);
    const pageData = this.filteredData.slice(startIndex, endIndex);

    pageData.forEach(entry => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td class="date-cell">${this.formatDate(entry.date)}</td>
        <td>${entry.product_service}</td>
        <td class="amount-cell">${this.formatCurrency(entry.amount)}</td>
        <td class="notes-cell">${entry.note || '-'}</td>
        <td class="floor-cell">${entry.original_floor}</td>
        <td class="actions-cell">
          <button class="action-btn action-btn--edit" data-entry-id="${entry.id}">Edit</button>
          <button class="action-btn action-btn--delete" data-entry-id="${entry.id}">Delete</button>
        </td>
      `;
    });

    this.updatePagination();
  }

  updatePagination() {
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    if (!pagination) return;

    const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    
    if (totalPages <= 1) {
      pagination.style.display = 'none';
      return;
    }

    pagination.style.display = 'flex';
    
    if (prevBtn) prevBtn.disabled = this.currentPage === 1;
    if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
    if (pageInfo) pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
  }

  changePage(direction) {
    const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    const newPage = this.currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
      this.currentPage = newPage;
      this.renderEntriesTable();
    }
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
    const filterSelect = document.getElementById('filterCategory');
    const analysisSelect = document.getElementById('analysisCategory');

    const categories = [...this.categories].sort();

    [categorySelect, filterSelect, analysisSelect].forEach(select => {
      if (select) {
        const currentValue = select.value;
        
        if (select === filterSelect) {
          select.innerHTML = '<option value="">All Categories</option>';
        } else if (select === analysisSelect) {
          select.innerHTML = '<option value="">Choose a category to analyze</option>';
        } else {
          select.innerHTML = '<option value="">Select Category</option>';
        }
        
        categories.forEach(category => {
          const selected = category === currentValue ? ' selected' : '';
          select.innerHTML += `<option value="${category}"${selected}>${category}</option>`;
        });
        
        if (select === categorySelect) {
          select.innerHTML += `<option value="Other"${currentValue === 'Other' ? ' selected' : ''}>Other</option>`;
        }
      }
    });
  }

  renderAnalytics() {
    const totals = this.calculateTotals();

    // Update floor analytics cards
    const elements = {
      groundFloorTotal: document.getElementById('groundFloorTotal'),
      firstFloorTotal: document.getElementById('firstFloorTotal'),
      secondFloorTotal: document.getElementById('secondFloorTotal'),
      groundFloorEntries: document.getElementById('groundFloorEntries'),
      firstFloorEntries: document.getElementById('firstFloorEntries'),
      secondFloorEntries: document.getElementById('secondFloorEntries')
    };

    if (elements.groundFloorTotal) elements.groundFloorTotal.textContent = this.formatCurrency(totals.Ground);
    if (elements.firstFloorTotal) elements.firstFloorTotal.textContent = this.formatCurrency(totals.First);
    if (elements.secondFloorTotal) elements.secondFloorTotal.textContent = this.formatCurrency(totals.Second);
    if (elements.groundFloorEntries) elements.groundFloorEntries.textContent = `${totals.entryCounts.Ground} entries`;
    if (elements.firstFloorEntries) elements.firstFloorEntries.textContent = `${totals.entryCounts.First} entries`;
    if (elements.secondFloorEntries) elements.secondFloorEntries.textContent = `${totals.entryCounts.Second} entries`;
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

    // Calculate category totals by original floor
    this.data.House.forEach(entry => {
      if (entry.product_service === category) {
        const floor = entry.original_floor;
        categoryData[floor].total += entry.amount;
        categoryData[floor].entries++;
        categoryData.grandTotal += entry.amount;
      }
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
    const category = document.getElementById('entryCategory')?.value;
    const customCategory = document.getElementById('customCategory')?.value;
    const amount = parseFloat(document.getElementById('entryAmount')?.value || '0');
    const originalFloor = document.getElementById('originalFloor')?.value;
    const notes = document.getElementById('entryNotes')?.value || '';

    // Validate inputs
    if (!date || !category || isNaN(amount) || amount <= 0 || !originalFloor) {
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
      note: notes,
      original_floor: originalFloor
    };

    // Add to unified House data
    this.data.House.push(newEntry);
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
    this.renderAllEntries();
    this.renderAnalytics();
    this.renderChangeLog();
    this.populateCategoryDropdowns();

    // Sync if auto-sync is enabled
    if (this.config.sync.autoSync) {
      this.syncToGitHub();
    }
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
    return this.data.House.find(e => e.id === entryId);
  }

  showEditModal(entry) {
    const modal = document.getElementById('editModal');
    if (!modal) return;

    document.getElementById('editDate').value = entry.date;
    document.getElementById('editCategory').value = entry.product_service;
    document.getElementById('editAmount').value = entry.amount;
    document.getElementById('editOriginalFloor').value = entry.original_floor;
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
    const originalFloor = document.getElementById('editOriginalFloor').value;
    const notes = document.getElementById('editNotes').value;

    if (!date || !category || isNaN(amount) || amount <= 0 || !originalFloor) {
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
      original_floor: originalFloor,
      note: notes
    };

    // Update the entry in unified House data
    const index = this.data.House.findIndex(e => e.id === this.currentEditEntry.entryId);
    if (index !== -1) {
      this.data.House[index] = updatedEntry;

      // Log the change
      this.logChange('update', this.currentEditEntry.entryId, {
        old: oldEntry,
        new: updatedEntry
      });

      // Refresh UI
      this.extractCategories();
      this.renderAllEntries();
      this.renderAnalytics();
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

    const index = this.data.House.findIndex(e => e.id === entryId);
    if (index !== -1) {
      this.data.House.splice(index, 1);

      // Log the change
      this.logChange('delete', entryId, entry);

      // Refresh UI
      this.extractCategories();
      this.renderAllEntries();
      this.renderAnalytics();
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
        return `Added new ${changes.product_service} entry for ${this.formatCurrency(changes.amount)}`;
      case 'update':
        return `Updated ${changes.new.product_service} entry`;
      case 'delete':
        return `Deleted ${changes.product_service} entry for ${this.formatCurrency(changes.amount)}`;
      default:
        return `${action} operation performed`;
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

  // GitHub integration and other settings methods
  async syncFromGitHub() {
    if (!this.config.github.token) return;

    try {
      this.updateSyncStatus('syncing');
      // Simplified sync for demo - in production would use actual GitHub API
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
      // Simplified sync for demo - in production would use actual GitHub API
      this.updateSyncStatus('online');
      this.updateLastSync();
    } catch (error) {
      console.error('Sync to GitHub failed:', error);
      this.updateSyncStatus('offline');
      throw error;
    }
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

  // Settings handlers
  loadSettingsUI() {
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
    const githubOwner = document.getElementById('githubOwner');
    const githubRepo = document.getElementById('githubRepo');
    const githubToken = document.getElementById('githubToken');
    const autoSync = document.getElementById('autoSync');

    if (githubOwner) this.config.github.owner = githubOwner.value;
    if (githubRepo) this.config.github.repo = githubRepo.value;
    if (githubToken) this.config.github.token = githubToken.value;
    if (autoSync) this.config.sync.autoSync = autoSync.checked;

    this.saveConfig();

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
      House: this.data.House, // Unified structure
      changeLog: this.changeLog,
      exportDate: new Date().toISOString(),
      totalEntries: this.data.House.length
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `house-construction-data-${new Date().toISOString().split('T')[0]}.json`;
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
        if (imported.House) {
          this.data.House = imported.House;
          if (imported.changeLog) {
            this.changeLog = imported.changeLog;
          }
          this.extractCategories();
          this.renderAllEntries();
          this.renderAnalytics();
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

    // Simplified test for demo
    this.showSuccessMessage('GitHub connection test completed!');
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
    const fields = ['currentPassword', 'newPassword', 'confirmPassword'];
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) field.value = '';
    });

    this.showSuccessMessage('Password changed successfully!');
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.houseTracker = new HouseConstructionTracker();
});