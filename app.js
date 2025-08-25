// House Construction Cost Manager
class HouseConstructionManager {
  constructor() {
    this.entries = [];
    this.filteredEntries = [];
    this.currentSort = { field: 'date', direction: 'desc' };
    this.currentPage = 1;
    this.entriesPerPage = 20;
    this.categories = new Set();
    this.nextId = 1;
    this.editingEntryId = null;
    this.deletingEntryId = null;
    
    this.init();
  }

  async init() {
    // Load initial data
    this.loadInitialData();
    
    // Set today's date as default
    setTimeout(() => this.setDefaultDate(), 100);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initial render
    this.updateHeaderStats();
    this.renderEntries();
    this.populateCategoryDropdowns();
    this.renderAnalytics();
    
    console.log('House Construction Cost Manager initialized with', this.entries.length, 'entries');
  }

  loadInitialData() {
    // Initial data from the provided JSON, merged from all floors
    const initialData = [
      {"id": "house_1", "date": "2025-03-12", "product_service": "Labour", "amount": 1000, "note": "JCB"},
      {"id": "house_2", "date": "2025-03-12", "product_service": "Labour", "amount": 300, "note": ""},
      {"id": "house_3", "date": "2025-03-12", "product_service": "Loan", "amount": 5900, "note": "Processing fee"},
      {"id": "house_4", "date": "2025-03-12", "product_service": "Tools & Material", "amount": 165, "note": ""},
      {"id": "house_5", "date": "2025-03-13", "product_service": "Loan", "amount": 1000, "note": "Site inspection"},
      {"id": "house_6", "date": "2025-03-13", "product_service": "Bescom", "amount": 18000, "note": "Temp meter"},
      {"id": "house_7", "date": "2025-03-13", "product_service": "Loan", "amount": 20000, "note": "lancha"},
      {"id": "house_8", "date": "2025-03-13", "product_service": "Tools & Material", "amount": 1600, "note": "Motor"},
      {"id": "house_9", "date": "2025-03-13", "product_service": "Water Tank", "amount": 1200, "note": ""},
      {"id": "house_10", "date": "2025-03-13", "product_service": "Labour", "amount": 400, "note": ""},
      {"id": "house_11", "date": "2025-03-15", "product_service": "Aggregate", "amount": 16000, "note": "40mm 2 truck"},
      {"id": "house_12", "date": "2025-03-15", "product_service": "Sand", "amount": 11000, "note": "1 truck"},
      {"id": "house_13", "date": "2025-03-15", "product_service": "Bricks", "amount": 20000, "note": "500"},
      {"id": "house_14", "date": "2025-03-15", "product_service": "Mestri", "amount": 50000, "note": ""},
      {"id": "house_15", "date": "2025-03-15", "product_service": "Labour", "amount": 1600, "note": "Mestri"},
      {"id": "house_16", "date": "2025-03-15", "product_service": "Water Tank", "amount": 1200, "note": ""},
      {"id": "house_17", "date": "2025-03-17", "product_service": "Loan", "amount": 7494, "note": "Fee"},
      {"id": "house_18", "date": "2025-03-18", "product_service": "Paya", "amount": 25000, "note": "JCB advance"},
      {"id": "house_19", "date": "2025-03-18", "product_service": "Loan", "amount": 11000, "note": "Stamp duty"},
      {"id": "house_20", "date": "2025-03-18", "product_service": "Labour", "amount": 700, "note": ""},
      {"id": "house_21", "date": "2025-03-19", "product_service": "Water Tank", "amount": 600, "note": ""},
      {"id": "house_22", "date": "2025-03-19", "product_service": "Labour", "amount": 700, "note": "Lunch"},
      {"id": "house_23", "date": "2025-03-19", "product_service": "Labour", "amount": 600, "note": ""},
      {"id": "house_24", "date": "2025-03-19", "product_service": "Labour", "amount": 500, "note": "Mestri"},
      {"id": "house_25", "date": "2025-03-19", "product_service": "Tools & Material", "amount": 150, "note": ""},
      {"id": "house_26", "date": "2025-03-21", "product_service": "Bescom", "amount": 4200, "note": "Temp Meter Labour"},
      {"id": "house_27", "date": "2025-03-21", "product_service": "Water Tank", "amount": 600, "note": ""},
      {"id": "house_28", "date": "2025-03-21", "product_service": "Bescom", "amount": 200, "note": "labour"},
      {"id": "house_29", "date": "2025-03-21", "product_service": "Tools & Material", "amount": 690, "note": ""},
      {"id": "house_30", "date": "2025-03-21", "product_service": "Tools & Material", "amount": 750, "note": ""},
      {"id": "house_31", "date": "2025-03-22", "product_service": "Aggregate", "amount": 24000, "note": "20mm 3 truck"},
      {"id": "house_32", "date": "2025-03-22", "product_service": "Sand", "amount": 29000, "note": "1 truck 1 6 wheel"},
      {"id": "house_33", "date": "2025-03-22", "product_service": "Mestri", "amount": 20000, "note": ""},
      {"id": "house_34", "date": "2025-03-22", "product_service": "Tools & Material", "amount": 1700, "note": "Material (Sump mesh)"},
      {"id": "house_35", "date": "2025-03-24", "product_service": "Water Tank", "amount": 1800, "note": ""},
      {"id": "house_36", "date": "2025-03-24", "product_service": "Labour", "amount": 340, "note": ""},
      {"id": "house_37", "date": "2025-03-25", "product_service": "Steel", "amount": 158760, "note": "2.6 ton + binding"},
      {"id": "house_38", "date": "2025-03-25", "product_service": "Cement", "amount": 11400, "note": "30 bags"},
      {"id": "house_39", "date": "2025-03-26", "product_service": "Loan", "amount": 27450, "note": "MODT"},
      {"id": "house_40", "date": "2025-03-27", "product_service": "Stone", "amount": 11000, "note": "Paya"},
      {"id": "house_41", "date": "2025-03-27", "product_service": "Loan", "amount": 6000, "note": "MODT fees"},
      {"id": "house_42", "date": "2025-03-27", "product_service": "Loan", "amount": 15000, "note": "Paper publication"},
      {"id": "house_43", "date": "2025-03-28", "product_service": "Cement", "amount": 49400, "note": "130"},
      {"id": "house_44", "date": "2025-03-29", "product_service": "Mestri", "amount": 10000, "note": ""},
      {"id": "house_45", "date": "2025-03-29", "product_service": "Paya", "amount": 8000, "note": "Paya digging"},
      {"id": "house_46", "date": "2025-03-29", "product_service": "Tools & Material", "amount": 3000, "note": "Stool"},
      {"id": "house_47", "date": "2025-03-29", "product_service": "Doors and Windows", "amount": 14000, "note": "Door Vascal"},
      {"id": "house_48", "date": "2025-04-05", "product_service": "Water Tank", "amount": 600, "note": ""},
      {"id": "house_49", "date": "2025-04-05", "product_service": "Labour", "amount": 1600, "note": "Plinth beam"},
      {"id": "house_50", "date": "2025-04-05", "product_service": "Labour", "amount": 1700, "note": "Lunch"},
      {"id": "house_51", "date": "2025-04-05", "product_service": "Tools & Material", "amount": 1400, "note": ""},
      {"id": "house_52", "date": "2025-04-07", "product_service": "Mestri", "amount": 50000, "note": ""},
      {"id": "house_53", "date": "2025-04-07", "product_service": "Labour", "amount": 150, "note": "Lunch"},
      {"id": "house_54", "date": "2025-04-07", "product_service": "Plumbing", "amount": 3600, "note": ""},
      {"id": "house_55", "date": "2025-04-07", "product_service": "Water Tank", "amount": 1200, "note": ""},
      {"id": "house_56", "date": "2025-04-10", "product_service": "Paya", "amount": 21000, "note": "JCB"},
      {"id": "house_57", "date": "2025-04-10", "product_service": "Misc", "amount": 1000, "note": "Dog resque"},
      {"id": "house_58", "date": "2025-04-10", "product_service": "Labour", "amount": 500, "note": "JCB"},
      {"id": "house_59", "date": "2025-04-12", "product_service": "Aggregate", "amount": 8000, "note": "20mm 1 truck"},
      {"id": "house_60", "date": "2025-04-12", "product_service": "Sand", "amount": 19000, "note": "6 wheel"},
      {"id": "house_61", "date": "2025-04-12", "product_service": "Water Tank", "amount": 1800, "note": ""},
      {"id": "house_62", "date": "2025-04-14", "product_service": "Elevation plan", "amount": 2500, "note": ""},
      {"id": "house_63", "date": "2025-04-15", "product_service": "Paya", "amount": 6000, "note": "Mud leveling"},
      {"id": "house_64", "date": "2025-04-16", "product_service": "Steel", "amount": 34593, "note": "550kg"},
      {"id": "house_65", "date": "2025-04-16", "product_service": "Cement", "amount": 19750, "note": "50 bags"},
      {"id": "house_66", "date": "2025-04-19", "product_service": "Bricks", "amount": 21250, "note": "400(6') + 150 (4')"},
      {"id": "house_67", "date": "2025-04-19", "product_service": "Aggregate", "amount": 16000, "note": "20mm & 40mm x 1 unit"},
      {"id": "house_68", "date": "2025-04-19", "product_service": "Mestri", "amount": 15000, "note": ""},
      {"id": "house_69", "date": "2025-04-19", "product_service": "Water Tank", "amount": 1200, "note": ""},
      {"id": "house_70", "date": "2025-04-22", "product_service": "Bricks", "amount": 21500, "note": "6\" 450 + 100 4\""},
      {"id": "house_71", "date": "2025-04-22", "product_service": "Doors and Windows", "amount": 8203, "note": "Grill Steel"},
      {"id": "house_72", "date": "2025-04-25", "product_service": "Doors and Windows", "amount": 2280, "note": "Grill Labor"},
      {"id": "house_73", "date": "2025-04-25", "product_service": "Tools & Material", "amount": 1400, "note": "Hose pipe"},
      {"id": "house_74", "date": "2025-04-26", "product_service": "Tools & Material", "amount": 10000, "note": "Water pump motor"},
      {"id": "house_75", "date": "2025-04-26", "product_service": "Mestri", "amount": 15000, "note": ""},
      {"id": "house_76", "date": "2025-05-05", "product_service": "Mestri", "amount": 15000, "note": ""},
      {"id": "house_77", "date": "2025-05-05", "product_service": "Cement", "amount": 24600, "note": "60 bags"},
      {"id": "house_78", "date": "2025-05-07", "product_service": "Mestri", "amount": 50000, "note": ""},
      {"id": "house_79", "date": "2025-05-09", "product_service": "Electrical", "amount": 5869, "note": "Material"},
      {"id": "house_80", "date": "2025-05-10", "product_service": "Water Tank", "amount": 1800, "note": ""},
      {"id": "house_81", "date": "2025-05-10", "product_service": "Tools & Material", "amount": 4300, "note": "Hasir bedding"},
      {"id": "house_82", "date": "2025-05-10", "product_service": "Steel", "amount": 110000, "note": "61.5 per kg"},
      {"id": "house_83", "date": "2025-05-10", "product_service": "Mestri", "amount": 20000, "note": "Centering"},
      {"id": "house_84", "date": "2025-05-10", "product_service": "Mestri", "amount": 15000, "note": "Steel worker"},
      {"id": "house_85", "date": "2025-05-10", "product_service": "Labour", "amount": 2500, "note": ""},
      {"id": "house_86", "date": "2025-05-10", "product_service": "Mestri", "amount": 35000, "note": ""},
      {"id": "house_87", "date": "2025-05-10", "product_service": "Labour", "amount": 6000, "note": ""},
      {"id": "house_88", "date": "2025-05-10", "product_service": "Electrical", "amount": 5000, "note": "Work"},
      {"id": "house_89", "date": "2025-05-10", "product_service": "Sand", "amount": 19000, "note": "6 wheeler"},
      {"id": "house_90", "date": "2025-05-10", "product_service": "Aggregate", "amount": 15000, "note": "20mm 6 wheeler"},
      {"id": "house_91", "date": "2025-05-10", "product_service": "Cement", "amount": 38700, "note": "90 bags"},
      {"id": "house_92", "date": "2025-05-10", "product_service": "Labour", "amount": 2500, "note": "Lunch"},
      {"id": "house_93", "date": "2025-05-10", "product_service": "Miscellaneous", "amount": 2000, "note": "Tools, transport, etc"},
      {"id": "house_94", "date": "2025-05-14", "product_service": "Doors and Windows", "amount": 20000, "note": "Door vascal advance"},
      {"id": "house_95", "date": "2025-05-19", "product_service": "Steel", "amount": 23500, "note": "385kg"},
      {"id": "house_96", "date": "2025-05-21", "product_service": "Mestri", "amount": 5000, "note": "Steel work"},
      {"id": "house_97", "date": "2025-05-24", "product_service": "Water Tank", "amount": 600, "note": ""},
      {"id": "house_98", "date": "2025-05-26", "product_service": "Doors and Windows", "amount": 6250, "note": "Grill Steel"},
      {"id": "house_99", "date": "2025-05-26", "product_service": "Doors and Windows", "amount": 3300, "note": "Grill Labor"},
      {"id": "house_100", "date": "2025-05-28", "product_service": "Bricks", "amount": 21500, "note": ""},
      {"id": "house_101", "date": "2025-05-28", "product_service": "Tools & Material", "amount": 2000, "note": ""},
      {"id": "house_102", "date": "2025-05-28", "product_service": "Cement", "amount": 12600, "note": "30 bag"},
      {"id": "house_103", "date": "2025-05-29", "product_service": "Plumbing", "amount": 1600, "note": ""},
      {"id": "house_104", "date": "2025-05-29", "product_service": "Water Tank", "amount": 1200, "note": ""},
      {"id": "house_105", "date": "2025-05-29", "product_service": "Bricks", "amount": 20000, "note": ""},
      {"id": "house_106", "date": "2025-05-29", "product_service": "Interior", "amount": 12000, "note": "Door and vascal"},
      {"id": "house_107", "date": "2025-05-31", "product_service": "Mestri", "amount": 30000, "note": ""},
      {"id": "house_108", "date": "2025-05-31", "product_service": "Sand", "amount": 19000, "note": "6 wheel"},
      {"id": "house_109", "date": "2025-06-02", "product_service": "Doors and Windows", "amount": 2900, "note": "Grill Steel"},
      {"id": "house_110", "date": "2025-06-02", "product_service": "Doors and Windows", "amount": 1500, "note": "Grill Labour"},
      {"id": "house_111", "date": "2025-06-02", "product_service": "Water Tank", "amount": 1200, "note": ""},
      {"id": "house_112", "date": "2025-06-07", "product_service": "Labour", "amount": 1200, "note": "Lunch"},
      {"id": "house_113", "date": "2025-06-07", "product_service": "Cement", "amount": 21000, "note": "50 bags"},
      {"id": "house_114", "date": "2025-06-07", "product_service": "Bricks", "amount": 20000, "note": "500 bricks"},
      {"id": "house_115", "date": "2025-06-07", "product_service": "Mestri", "amount": 20000, "note": ""},
      {"id": "house_116", "date": "2025-06-11", "product_service": "Steel", "amount": 23500, "note": ""},
      {"id": "house_117", "date": "2025-06-12", "product_service": "Tools & Material", "amount": 4300, "note": "Hasir"},
      {"id": "house_118", "date": "2025-06-12", "product_service": "Electrical", "amount": 6400, "note": ""},
      {"id": "house_119", "date": "2025-06-12", "product_service": "Tools & Material", "amount": 1400, "note": "Hooks"},
      {"id": "house_120", "date": "2025-06-12", "product_service": "Doors and Windows", "amount": 1100, "note": "Door frame covering"},
      {"id": "house_121", "date": "2025-06-13", "product_service": "Electrical", "amount": 4300, "note": "Rent house mateiral"},
      {"id": "house_122", "date": "2025-06-13", "product_service": "Electrical", "amount": 9000, "note": "work"},
      {"id": "house_123", "date": "2025-06-13", "product_service": "Doors and Windows", "amount": 1080, "note": "Plywood cover"},
      {"id": "house_124", "date": "2025-06-13", "product_service": "Water Tank", "amount": 1200, "note": ""},
      {"id": "house_125", "date": "2025-06-13", "product_service": "Labour", "amount": 4000, "note": "Work"},
      {"id": "house_126", "date": "2025-06-13", "product_service": "Labour", "amount": 2000, "note": "Lunch"},
      {"id": "house_127", "date": "2025-06-13", "product_service": "Mestri", "amount": 110000, "note": ""},
      {"id": "house_128", "date": "2025-06-13", "product_service": "Sand", "amount": 19000, "note": ""},
      {"id": "house_129", "date": "2025-06-13", "product_service": "Aggregate", "amount": 15000, "note": ""},
      {"id": "house_130", "date": "2025-06-24", "product_service": "Steel", "amount": 123000, "note": ""},
      {"id": "house_131", "date": "2025-06-24", "product_service": "Cement", "amount": 33500, "note": "@420"},
      {"id": "house_132", "date": "2025-06-24", "product_service": "Cement", "amount": 16500, "note": "@415"},
      {"id": "house_133", "date": "2025-06-24", "product_service": "Water Tank", "amount": 1200, "note": ""},
      {"id": "house_134", "date": "2025-06-24", "product_service": "Labour", "amount": 1200, "note": ""},
      {"id": "house_135", "date": "2025-06-24", "product_service": "Tools & Material", "amount": 2500, "note": ""},
      {"id": "house_136", "date": "2025-06-24", "product_service": "Bricks", "amount": 21500, "note": ""},
      {"id": "house_137", "date": "2025-06-25", "product_service": "Steel", "amount": 4515, "note": ""},
      {"id": "house_138", "date": "2025-06-25", "product_service": "Doors and Windows", "amount": 2000, "note": ""},
      {"id": "house_139", "date": "2025-06-25", "product_service": "Aggregate", "amount": 8000, "note": ""},
      {"id": "house_140", "date": "2025-07-01", "product_service": "Bricks", "amount": 20000, "note": ""},
      {"id": "house_141", "date": "2025-07-01", "product_service": "Mestri", "amount": 30000, "note": ""},
      {"id": "house_142", "date": "2025-07-01", "product_service": "Doors and Windows", "amount": 27000, "note": ""},
      {"id": "house_143", "date": "2025-07-01", "product_service": "Bricks", "amount": 20000, "note": ""},
      {"id": "house_144", "date": "2025-07-01", "product_service": "Mestri", "amount": 25000, "note": ""},
      {"id": "house_145", "date": "2025-07-08", "product_service": "Hasir", "amount": 4400, "note": ""},
      {"id": "house_146", "date": "2025-07-08", "product_service": "Water Tank", "amount": 1800, "note": ""},
      {"id": "house_147", "date": "2025-07-10", "product_service": "Electrical", "amount": 4500, "note": "material"},
      {"id": "house_148", "date": "2025-07-10", "product_service": "Electrical", "amount": 5000, "note": "labor"},
      {"id": "house_149", "date": "2025-07-12", "product_service": "Mestri", "amount": 110000, "note": ""},
      {"id": "house_150", "date": "2025-07-12", "product_service": "Sand", "amount": 19000, "note": ""},
      {"id": "house_151", "date": "2025-07-12", "product_service": "Aggregate", "amount": 15000, "note": ""},
      {"id": "house_152", "date": "2025-07-15", "product_service": "Plumbing", "amount": 6800, "note": "chamber"},
      {"id": "house_153", "date": "2025-07-15", "product_service": "Steel", "amount": 98500, "note": ""},
      {"id": "house_154", "date": "2025-07-15", "product_service": "Cement", "amount": 37000, "note": ""},
      {"id": "house_155", "date": "2025-07-16", "product_service": "Mestri", "amount": 5000, "note": ""},
      {"id": "house_156", "date": "2025-07-16", "product_service": "Plumbing", "amount": 2500, "note": "labor"},
      {"id": "house_157", "date": "2025-07-16", "product_service": "Plumbing", "amount": 1500, "note": ""},
      {"id": "house_158", "date": "2025-07-16", "product_service": "Doors and Windows", "amount": 5000, "note": "steel grill"},
      {"id": "house_159", "date": "2025-07-26", "product_service": "Bricks", "amount": 23000, "note": ""},
      {"id": "house_160", "date": "2025-07-26", "product_service": "Mestri", "amount": 27000, "note": ""},
      {"id": "house_161", "date": "2025-07-28", "product_service": "Bricks", "amount": 22750, "note": ""},
      {"id": "house_162", "date": "2025-07-28", "product_service": "Doors and Windows", "amount": 11000, "note": "Vascal terrace"},
      {"id": "house_163", "date": "2025-08-02", "product_service": "Sand", "amount": 9000, "note": ""},
      {"id": "house_164", "date": "2025-08-02", "product_service": "Aggregate", "amount": 8000, "note": ""},
      {"id": "house_165", "date": "2025-08-02", "product_service": "Mestri", "amount": 23000, "note": ""},
      {"id": "house_166", "date": "2025-08-02", "product_service": "Hasir", "amount": 2700, "note": ""},
      {"id": "house_167", "date": "2025-08-04", "product_service": "Cement", "amount": 60500, "note": ""},
      {"id": "house_168", "date": "2025-08-09", "product_service": "Water Tank", "amount": 2400, "note": ""},
      {"id": "house_169", "date": "2025-08-09", "product_service": "Mestri", "amount": 75000, "note": ""},
      {"id": "house_170", "date": "2025-08-11", "product_service": "Tools & Material", "amount": 1000, "note": "plastering"},
      {"id": "house_171", "date": "2025-08-11", "product_service": "Mestri", "amount": 4000, "note": "plastering"},
      {"id": "house_172", "date": "2025-08-11", "product_service": "Electrical", "amount": 800, "note": ""},
      {"id": "house_173", "date": "2025-08-11", "product_service": "Electrical", "amount": 5000, "note": "Work"},
      {"id": "house_174", "date": "2025-08-11", "product_service": "Mestri", "amount": 5000, "note": ""},
      {"id": "house_175", "date": "2025-08-11", "product_service": "Doors and Windows", "amount": 1600, "note": ""},
      {"id": "house_176", "date": "2025-08-13", "product_service": "Sand", "amount": 12000, "note": "tractor"},
      {"id": "house_177", "date": "2025-08-16", "product_service": "Mestri", "amount": 10000, "note": "Mestri"},
      {"id": "house_178", "date": "2025-08-16", "product_service": "Mestri", "amount": 10000, "note": "plasteri"},
      {"id": "house_179", "date": "2025-08-16", "product_service": "Bricks", "amount": 10200, "note": ""},
      {"id": "house_180", "date": "2025-08-20", "product_service": "Mestri", "amount": 5000, "note": "Plastering"},
      {"id": "house_181", "date": "2025-08-20", "product_service": "Mestri", "amount": 20000, "note": "survey"},
      {"id": "house_182", "date": "2025-08-20", "product_service": "Electrical", "amount": 15000, "note": "Material"},
      {"id": "house_183", "date": "2025-08-20", "product_service": "Steel", "amount": 45000, "note": ""},
      {"id": "house_184", "date": "2025-08-23", "product_service": "Plumbing", "amount": 5000, "note": ""},
      {"id": "house_185", "date": "2025-08-24", "product_service": "Plumbing", "amount": 14300, "note": "Material"},
      {"id": "house_186", "date": "2025-08-24", "product_service": "Plumbing", "amount": 25000, "note": "Material"},
      {"id": "house_187", "date": "2025-08-24", "product_service": "Mestri", "amount": 6000, "note": ""},
      {"id": "house_188", "date": "2025-08-24", "product_service": "Mestri", "amount": 30000, "note": "plastering"},
      {"id": "house_189", "date": "2025-08-24", "product_service": "Electrical", "amount": 11000, "note": ""},
      {"id": "house_190", "date": "2025-08-25", "product_service": "Mestri", "amount": 1000, "note": "Plastering"}
    ];

    // Convert to the expected format and assign IDs
    this.entries = initialData.map((entry, index) => ({
      id: entry.id || `house_${index + 1}`,
      date: entry.date,
      category: entry.product_service,
      amount: entry.amount,
      notes: entry.note || ''
    }));

    this.nextId = this.entries.length + 1;
    this.extractCategories();
    this.applyFilters();
  }

  extractCategories() {
    this.categories.clear();
    this.entries.forEach(entry => {
      this.categories.add(entry.category);
    });
  }

  setupEventListeners() {
    const self = this;
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = btn.getAttribute('data-tab');
        self.switchTab(tabName);
      });
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => self.applyFilters());
    }

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => self.applyFilters());
    }

    // Add entry form
    const addForm = document.getElementById('addEntryForm');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        self.handleAddEntry();
      });
    }

    // Clear form button
    const clearBtn = document.getElementById('clearForm');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => self.clearAddForm());
    }

    // Category change for custom category
    const entryCategory = document.getElementById('entryCategory');
    if (entryCategory) {
      entryCategory.addEventListener('change', () => self.handleCategoryChange());
    }

    // Modal close buttons
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
      closeModal.addEventListener('click', () => self.closeEditModal());
    }

    const cancelEdit = document.getElementById('cancelEdit');
    if (cancelEdit) {
      cancelEdit.addEventListener('click', () => self.closeEditModal());
    }

    const saveEdit = document.getElementById('saveEdit');
    if (saveEdit) {
      saveEdit.addEventListener('click', () => self.saveEdit());
    }

    const closeDeleteModal = document.getElementById('closeDeleteModal');
    if (closeDeleteModal) {
      closeDeleteModal.addEventListener('click', () => self.closeDeleteModal());
    }

    const cancelDelete = document.getElementById('cancelDelete');
    if (cancelDelete) {
      cancelDelete.addEventListener('click', () => self.closeDeleteModal());
    }

    const confirmDelete = document.getElementById('confirmDelete');
    if (confirmDelete) {
      confirmDelete.addEventListener('click', () => self.confirmDelete());
    }

    // Modal backdrop clicks
    const editModal = document.getElementById('editModal');
    if (editModal) {
      editModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
          self.closeEditModal();
        }
      });
    }

    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
      deleteModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
          self.closeDeleteModal();
        }
      });
    }

    // Table event delegation for dynamic content
    const tableBody = document.getElementById('entriesTableBody');
    if (tableBody) {
      tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit')) {
          const entryId = e.target.getAttribute('data-id');
          self.openEditModal(entryId);
        }
        if (e.target.classList.contains('btn-delete')) {
          const entryId = e.target.getAttribute('data-id');
          self.openDeleteModal(entryId);
        }
      });
    }

    // Table header sorting
    document.querySelectorAll('.sortable').forEach(header => {
      header.addEventListener('click', () => {
        const sortField = header.getAttribute('data-sort');
        self.sortEntries(sortField);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        self.closeEditModal();
        self.closeDeleteModal();
      }
    });
  }

  setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('entryDate');
    if (dateInput) {
      dateInput.value = today;
    }
  }

  switchTab(tabName) {
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

    // Refresh content based on active tab
    setTimeout(() => {
      if (tabName === 'all-entries') {
        this.renderEntries();
      } else if (tabName === 'add-entry') {
        this.populateCategoryDropdowns();
        this.setDefaultDate();
      } else if (tabName === 'analytics') {
        this.renderAnalytics();
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

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  updateHeaderStats() {
    const total = this.entries.reduce((sum, entry) => sum + entry.amount, 0);
    const count = this.entries.length;
    
    // Calculate date range
    let dateRange = '-';
    if (this.entries.length > 0) {
      const dates = this.entries.map(entry => new Date(entry.date)).sort((a, b) => a - b);
      const startDate = this.formatDate(dates[0].toISOString().split('T')[0]);
      const endDate = this.formatDate(dates[dates.length - 1].toISOString().split('T')[0]);
      dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
    }

    const totalElement = document.getElementById('totalProjectCost');
    const entriesElement = document.getElementById('totalEntries');
    const rangeElement = document.getElementById('dateRange');

    if (totalElement) totalElement.textContent = this.formatCurrency(total);
    if (entriesElement) entriesElement.textContent = count.toLocaleString();
    if (rangeElement) rangeElement.textContent = dateRange;
  }

  applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const categoryFilterValue = categoryFilter ? categoryFilter.value : '';

    this.filteredEntries = this.entries.filter(entry => {
      const matchesSearch = !searchTerm || 
        entry.category.toLowerCase().includes(searchTerm) ||
        entry.notes.toLowerCase().includes(searchTerm) ||
        this.formatDate(entry.date).toLowerCase().includes(searchTerm) ||
        this.formatCurrency(entry.amount).toLowerCase().includes(searchTerm);
      
      const matchesCategory = !categoryFilterValue || entry.category === categoryFilterValue;
      
      return matchesSearch && matchesCategory;
    });

    this.currentPage = 1;
    this.renderEntries();
  }

  sortEntries(field) {
    // Update sort direction
    if (this.currentSort.field === field) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.field = field;
      this.currentSort.direction = 'asc';
    }

    // Apply sort
    this.filteredEntries.sort((a, b) => {
      let aVal, bVal;
      
      if (field === 'date') {
        aVal = new Date(a.date);
        bVal = new Date(b.date);
      } else if (field === 'amount') {
        aVal = a.amount;
        bVal = b.amount;
      } else {
        aVal = a[field].toLowerCase();
        bVal = b[field].toLowerCase();
      }

      if (aVal < bVal) return this.currentSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.currentSort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.renderEntries();
    this.updateSortIcons();
  }

  updateSortIcons() {
    document.querySelectorAll('.sortable').forEach(th => {
      th.classList.remove('asc', 'desc');
      if (th.getAttribute('data-sort') === this.currentSort.field) {
        th.classList.add(this.currentSort.direction);
      }
    });
  }

  renderEntries() {
    const tbody = document.getElementById('entriesTableBody');
    if (!tbody) return;

    const startIndex = (this.currentPage - 1) * this.entriesPerPage;
    const endIndex = startIndex + this.entriesPerPage;
    const pageEntries = this.filteredEntries.slice(startIndex, endIndex);

    tbody.innerHTML = '';

    if (pageEntries.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            <div class="empty-state-icon">📋</div>
            <div>No entries found</div>
          </td>
        </tr>
      `;
    } else {
      pageEntries.forEach(entry => {
        const row = tbody.insertRow();
        row.innerHTML = `
          <td class="date-cell">${this.formatDate(entry.date)}</td>
          <td>${entry.category}</td>
          <td class="amount-cell">${this.formatCurrency(entry.amount)}</td>
          <td class="notes-cell" title="${entry.notes}">${entry.notes || '-'}</td>
          <td class="actions-col">
            <div class="action-buttons">
              <button class="btn-icon btn-edit" data-id="${entry.id}" title="Edit">✏️</button>
              <button class="btn-icon btn-delete" data-id="${entry.id}" title="Delete">🗑️</button>
            </div>
          </td>
        `;
      });
    }

    this.updateTableFooter();
    this.updatePagination();
  }

  updateTableFooter() {
    const total = this.filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const count = this.filteredEntries.length;

    const totalElement = document.getElementById('filteredTotal');
    const countElement = document.getElementById('filteredCount');

    if (totalElement) totalElement.textContent = this.formatCurrency(total);
    if (countElement) countElement.textContent = count.toLocaleString();
  }

  updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(this.filteredEntries.length / this.entriesPerPage);
    
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
      <button ${this.currentPage === 1 ? 'disabled' : ''} onclick="window.costManager.goToPage(${this.currentPage - 1})">
        ← Previous
      </button>
    `;

    // Page numbers
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);

    if (startPage > 1) {
      paginationHTML += `<button onclick="window.costManager.goToPage(1)">1</button>`;
      if (startPage > 2) paginationHTML += `<span>...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button ${i === this.currentPage ? 'class="active"' : ''} onclick="window.costManager.goToPage(${i})">
          ${i}
        </button>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) paginationHTML += `<span>...</span>`;
      paginationHTML += `<button onclick="window.costManager.goToPage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    paginationHTML += `
      <button ${this.currentPage === totalPages ? 'disabled' : ''} onclick="window.costManager.goToPage(${this.currentPage + 1})">
        Next →
      </button>
    `;

    pagination.innerHTML = paginationHTML;
  }

  goToPage(page) {
    this.currentPage = page;
    this.renderEntries();
  }

  populateCategoryDropdowns() {
    const categorySelect = document.getElementById('entryCategory');
    const filterSelect = document.getElementById('categoryFilter');

    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Select Category</option>';
      [...this.categories].sort().forEach(category => {
        categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
      });
      categorySelect.innerHTML += '<option value="Other">Other (Custom)</option>';
    }

    if (filterSelect) {
      filterSelect.innerHTML = '<option value="">All Categories</option>';
      [...this.categories].sort().forEach(category => {
        filterSelect.innerHTML += `<option value="${category}">${category}</option>`;
      });
    }
  }

  handleCategoryChange() {
    const categorySelect = document.getElementById('entryCategory');
    const customGroup = document.getElementById('customCategoryGroup');
    const customInput = document.getElementById('customCategory');

    if (!categorySelect || !customGroup || !customInput) return;

    if (categorySelect.value === 'Other') {
      customGroup.style.display = 'block';
      customInput.required = true;
    } else {
      customGroup.style.display = 'none';
      customInput.required = false;
      customInput.value = '';
    }
  }

  handleAddEntry() {
    const dateInput = document.getElementById('entryDate');
    const categoryInput = document.getElementById('entryCategory');
    const customCategoryInput = document.getElementById('customCategory');
    const amountInput = document.getElementById('entryAmount');
    const notesInput = document.getElementById('entryNotes');

    if (!dateInput || !categoryInput || !amountInput) {
      alert('Required form elements not found');
      return;
    }

    const date = dateInput.value;
    const category = categoryInput.value;
    const customCategory = customCategoryInput ? customCategoryInput.value : '';
    const amount = parseFloat(amountInput.value);
    const notes = notesInput ? notesInput.value : '';

    // Validation
    if (!date || !category || isNaN(amount) || amount <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }

    const finalCategory = category === 'Other' ? customCategory : category;
    if (category === 'Other' && !customCategory.trim()) {
      alert('Please enter a custom category name');
      return;
    }

    // Create new entry
    const newEntry = {
      id: `house_${this.nextId++}`,
      date: date,
      category: finalCategory,
      amount: amount,
      notes: notes
    };

    this.entries.unshift(newEntry); // Add to beginning
    this.extractCategories();
    this.applyFilters();
    this.updateHeaderStats();
    this.populateCategoryDropdowns();

    // Show success message
    this.showSuccessMessage();

    // Reset form
    this.clearAddForm();
  }

  clearAddForm() {
    const form = document.getElementById('addEntryForm');
    if (form) {
      form.reset();
    }
    
    const customGroup = document.getElementById('customCategoryGroup');
    if (customGroup) {
      customGroup.style.display = 'none';
    }
    
    this.setDefaultDate();
  }

  showSuccessMessage() {
    const message = document.getElementById('successMessage');
    if (message) {
      message.classList.remove('hidden');
      setTimeout(() => {
        message.classList.add('hidden');
      }, 3000);
    }
  }

  openEditModal(entryId) {
    const entry = this.entries.find(e => e.id === entryId);
    if (!entry) return;

    this.editingEntryId = entryId;

    const editIdInput = document.getElementById('editEntryId');
    const editDateInput = document.getElementById('editDate');
    const editCategoryInput = document.getElementById('editCategory');
    const editAmountInput = document.getElementById('editAmount');
    const editNotesInput = document.getElementById('editNotes');

    if (editIdInput) editIdInput.value = entry.id;
    if (editDateInput) editDateInput.value = entry.date;
    if (editCategoryInput) editCategoryInput.value = entry.category;
    if (editAmountInput) editAmountInput.value = entry.amount;
    if (editNotesInput) editNotesInput.value = entry.notes;

    const modal = document.getElementById('editModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    this.editingEntryId = null;
  }

  saveEdit() {
    if (!this.editingEntryId) return;

    const editDateInput = document.getElementById('editDate');
    const editCategoryInput = document.getElementById('editCategory');
    const editAmountInput = document.getElementById('editAmount');
    const editNotesInput = document.getElementById('editNotes');

    if (!editDateInput || !editCategoryInput || !editAmountInput) {
      alert('Required form elements not found');
      return;
    }

    const date = editDateInput.value;
    const category = editCategoryInput.value;
    const amount = parseFloat(editAmountInput.value);
    const notes = editNotesInput ? editNotesInput.value : '';

    // Validation
    if (!date || !category || isNaN(amount) || amount <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }

    // Update entry
    const entryIndex = this.entries.findIndex(e => e.id === this.editingEntryId);
    if (entryIndex !== -1) {
      this.entries[entryIndex] = {
        ...this.entries[entryIndex],
        date: date,
        category: category,
        amount: amount,
        notes: notes
      };

      this.extractCategories();
      this.applyFilters();
      this.updateHeaderStats();
      this.populateCategoryDropdowns();
      this.closeEditModal();

      // Highlight the edited row
      setTimeout(() => {
        const rows = document.querySelectorAll('#entriesTableBody tr');
        const entryRow = Array.from(rows).find(row => {
          const editBtn = row.querySelector('.btn-edit');
          return editBtn && editBtn.getAttribute('data-id') === this.editingEntryId;
        });
        if (entryRow) {
          entryRow.classList.add('row-edited');
          setTimeout(() => entryRow.classList.remove('row-edited'), 2000);
        }
      }, 100);
    }
  }

  openDeleteModal(entryId) {
    const entry = this.entries.find(e => e.id === entryId);
    if (!entry) return;

    this.deletingEntryId = entryId;

    const detailsElement = document.getElementById('deleteEntryDetails');
    if (detailsElement) {
      detailsElement.innerHTML = `
        <strong>Date:</strong> ${this.formatDate(entry.date)}<br>
        <strong>Category:</strong> ${entry.category}<br>
        <strong>Amount:</strong> ${this.formatCurrency(entry.amount)}<br>
        <strong>Notes:</strong> ${entry.notes || 'None'}
      `;
    }

    const modal = document.getElementById('deleteModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    this.deletingEntryId = null;
  }

  confirmDelete() {
    if (!this.deletingEntryId) return;

    const entryIndex = this.entries.findIndex(e => e.id === this.deletingEntryId);
    
    if (entryIndex !== -1) {
      this.entries.splice(entryIndex, 1);
      this.extractCategories();
      this.applyFilters();
      this.updateHeaderStats();
      this.populateCategoryDropdowns();
      this.closeDeleteModal();
    }
  }

  renderAnalytics() {
    this.renderAnalyticsSummary();
    this.renderCategoryChart();
    this.renderCategorySummary();
  }

  renderAnalyticsSummary() {
    // Calculate analytics
    const categoryTotals = {};
    let topCategory = '';
    let topAmount = 0;
    let recentEntry = null;
    let recentDate = new Date(0);

    this.entries.forEach(entry => {
      // Category totals
      categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + entry.amount;
      
      // Top category
      if (categoryTotals[entry.category] > topAmount) {
        topAmount = categoryTotals[entry.category];
        topCategory = entry.category;
      }
      
      // Most recent entry
      const entryDate = new Date(entry.date);
      if (entryDate > recentDate) {
        recentDate = entryDate;
        recentEntry = entry;
      }
    });

    const totalAmount = this.entries.reduce((sum, entry) => sum + entry.amount, 0);
    const averageAmount = this.entries.length > 0 ? totalAmount / this.entries.length : 0;

    // Update UI
    const elements = {
      topCategory: document.getElementById('topCategory'),
      topCategoryAmount: document.getElementById('topCategoryAmount'),
      averageAmount: document.getElementById('averageAmount'),
      recentDate: document.getElementById('recentDate'),
      recentAmount: document.getElementById('recentAmount')
    };

    if (elements.topCategory) elements.topCategory.textContent = topCategory || '-';
    if (elements.topCategoryAmount) elements.topCategoryAmount.textContent = this.formatCurrency(topAmount);
    if (elements.averageAmount) elements.averageAmount.textContent = this.formatCurrency(averageAmount);
    if (elements.recentDate) elements.recentDate.textContent = recentEntry ? this.formatDate(recentEntry.date) : '-';
    if (elements.recentAmount) elements.recentAmount.textContent = recentEntry ? this.formatCurrency(recentEntry.amount) : '₹0';
  }

  renderCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;

    // Calculate category totals
    const categoryTotals = {};
    this.entries.forEach(entry => {
      categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + entry.amount;
    });

    // Get top 10 categories
    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    // Chart.js configuration
    const data = {
      labels: sortedCategories.map(([category]) => category),
      datasets: [{
        data: sortedCategories.map(([, amount]) => amount),
        backgroundColor: [
          '#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F',
          '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    const config = {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0
                }).format(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    // Destroy existing chart if it exists
    if (window.categoryChartInstance) {
      window.categoryChartInstance.destroy();
    }

    // Create new chart
    window.categoryChartInstance = new Chart(canvas, config);
  }

  renderCategorySummary() {
    const tbody = document.getElementById('categorySummaryBody');
    if (!tbody) return;

    // Calculate category data
    const categoryData = {};
    const totalAmount = this.entries.reduce((sum, entry) => sum + entry.amount, 0);

    this.entries.forEach(entry => {
      if (!categoryData[entry.category]) {
        categoryData[entry.category] = { amount: 0, count: 0 };
      }
      categoryData[entry.category].amount += entry.amount;
      categoryData[entry.category].count++;
    });

    // Sort by amount descending
    const sortedData = Object.entries(categoryData)
      .sort(([,a], [,b]) => b.amount - a.amount);

    tbody.innerHTML = '';
    sortedData.forEach(([category, data]) => {
      const percentage = ((data.amount / totalAmount) * 100).toFixed(1);
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${category}</td>
        <td class="amount-cell">${this.formatCurrency(data.amount)}</td>
        <td>${data.count}</td>
        <td class="percentage-cell">${percentage}%</td>
      `;
    });
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.costManager = new HouseConstructionManager();
});