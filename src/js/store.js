// ŠVP PV Store & State Management
import { RVP_COMPETENCIES, RVP_LITERACIES, RVP_AREAS, RVP_OUTCOMES } from '../data/rvp_data.js';
import { SAMPLE_TEMPLATES } from '../data/sample_templates.js';

const STORAGE_KEY = 'svp_pv_current_project_v1';
const HISTORY_KEY = 'svp_pv_projects_list_v1';

export class SVPStore {
  constructor() {
    this.subscribers = new Set();
    this.history = [];
    this.currentDoc = this.loadInitial();
  }

  loadInitial() {
    let doc = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.schoolData && Array.isArray(parsed.blocks)) {
          if (parsed.schoolData.mottoName === 'Každý den s úsměvem a objevováním světa') {
            parsed.schoolData.mottoName = 'Každý den s úsměvem objevujeme svět';
          }
          doc = parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load from localStorage, loading default template:', e);
    }
    if (!doc) {
      // Default to the first rich template
      doc = JSON.parse(JSON.stringify(SAMPLE_TEMPLATES[0]));
    }
    if (doc.blocks && Array.isArray(doc.blocks)) {
      doc.blocks.forEach(b => this.syncBlockRelationships(b));
    }
    return doc;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(actionType = 'update') {
    this.saveToStorage();
    this.subscribers.forEach(cb => cb(this.currentDoc, actionType));
  }

  saveToStorage() {
    try {
      this.currentDoc.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentDoc));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  getDoc() {
    return this.currentDoc;
  }

  resetToTemplate(templateId) {
    const tmpl = SAMPLE_TEMPLATES.find(t => t.id === templateId) || SAMPLE_TEMPLATES[0];
    this.currentDoc = JSON.parse(JSON.stringify(tmpl));
    this.currentDoc.updatedAt = new Date().toISOString();
    this.notify('template_loaded');
  }

  createNewBlank() {
    this.currentDoc = {
      id: 'custom-' + Date.now(),
      name: 'Nový Školní vzdělávací program PV',
      subtitle: 'Vlastní program mateřské školy',
      tag: 'Vlastní',
      color: '#3b82f6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schoolData: {
        docTitle: 'Školní vzdělávací program pro předškolní vzdělávání',
        mottoName: 'Každý den s úsměvem objevujeme svět',
        schoolName: 'Mateřská škola ',
        schoolAddress: '',
        ico: '',
        redizo: '',
        headmaster: '',
        author: '',
        founder: '',
        refNumber: 'MS/' + new Date().getFullYear() + '/01',
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 3*365*24*3600*1000).toISOString().split('T')[0],
        location: '',
        buildingSpec: '',
        maxCapacity: '',
        classes: [
          { name: '1. třída', ageRange: '3–4 roky', count: 20, type: 'Homogenní' }
        ],
        teamDesc: '',
        pdPlan: '',
        psychosocial: '',
        dietNutrition: '',
        organization: '',
        materialConditions: '',
        familyCooperation: '',
        logoUrl: '',
        vision: '',
        strategies: '',
        diagnostics: '',
        individualization: ''
      },
      blocks: [],
      autoevaluation: {
        areas: [
          'Podmínky ke vzdělávání',
          'Průběh a výsledky vzdělávání',
          'Klima školy a spolupráce s partnery'
        ],
        goals: '',
        criteria: '',
        methods: [],
        schedule: '',
        responsibilities: ''
      }
    };
    this.notify('doc_reset');
  }

  updateLogo(logoUrl) {
    if (!this.currentDoc.schoolData) this.currentDoc.schoolData = {};
    this.currentDoc.schoolData.logoUrl = logoUrl;
    this.notify('logo_updated');
  }

  updateSchoolData(field, value) {
    if (!this.currentDoc.schoolData) this.currentDoc.schoolData = {};
    this.currentDoc.schoolData[field] = value;
    this.notify('school_data_updated');
  }

  updateAutoevaluation(field, value) {
    if (!this.currentDoc.autoevaluation) this.currentDoc.autoevaluation = {};
    this.currentDoc.autoevaluation[field] = value;
    this.notify('autoevaluation_updated');
  }

  // Classes Management
  addClass(cls) {
    if (!this.currentDoc.schoolData.classes) this.currentDoc.schoolData.classes = [];
    this.currentDoc.schoolData.classes.push(cls);
    this.notify('classes_updated');
  }

  updateClass(index, field, value) {
    if (this.currentDoc.schoolData.classes && this.currentDoc.schoolData.classes[index]) {
      this.currentDoc.schoolData.classes[index][field] = value;
      this.notify('classes_updated');
    }
  }

  removeClass(index) {
    if (this.currentDoc.schoolData.classes) {
      this.currentDoc.schoolData.classes.splice(index, 1);
      this.notify('classes_updated');
    }
  }

  // Integrated Blocks
  addBlock(blockData = {}) {
    const id = 'block-' + Date.now();
    const newBlock = {
      id,
      title: blockData.title || 'Nový integrovaný blok',
      timeFrame: blockData.timeFrame || 'Září – Říjen',
      purpose: blockData.purpose || '',
      subTopics: blockData.subTopics || [],
      competencies: blockData.competencies || [],
      literacies: blockData.literacies || [],
      areas: blockData.areas || [],
      outcomes: blockData.outcomes || [],
      outcomeMappings: blockData.outcomeMappings || {},
      activities: blockData.activities || []
    };
    this.currentDoc.blocks.push(newBlock);
    this.notify('block_added');
    return newBlock;
  }

  ensureCurriculum(block) {
    return [];
  }

  updateBlock(blockId, updates) {
    const idx = this.currentDoc.blocks.findIndex(b => b.id === blockId);
    if (idx !== -1) {
      this.currentDoc.blocks[idx] = { ...this.currentDoc.blocks[idx], ...updates };
      this.notify('block_updated');
    }
  }

  deleteBlock(blockId) {
    this.currentDoc.blocks = this.currentDoc.blocks.filter(b => b.id !== blockId);
    this.notify('block_deleted');
  }

  reorderBlocks(sourceIdx, destIdx) {
    const [moved] = this.currentDoc.blocks.splice(sourceIdx, 1);
    this.currentDoc.blocks.splice(destIdx, 0, moved);
    this.notify('blocks_reordered');
  }

  // --- ORTOGONÁLNÍ ARCHITEKTURA: ROVNOCENNÉ DIMENZE KOMPETENCÍ A OBLASTÍ ---
  getCompetencyOutcomes(block, compCode) {
    if (!block || !block.outcomes) return [];
    return block.outcomes.filter(code => {
      const out = RVP_OUTCOMES.find(o => o.code === code);
      return out && out.category === compCode;
    });
  }

  getAreaOutcomes(block, areaCode) {
    if (!block || !block.outcomes) return [];
    return block.outcomes.filter(code => {
      const out = RVP_OUTCOMES.find(o => o.code === code);
      return out && out.category === areaCode;
    });
  }

  // Outcomes & Competency connection to Blocks
  toggleBlockOutcome(blockId, outcomeCode, initialMapping = {}) {
    const block = this.currentDoc.blocks.find(b => b.id === blockId);
    if (!block) return;
    if (!block.outcomes) block.outcomes = [];
    if (!block.outcomeMappings) block.outcomeMappings = {};
    
    const idx = block.outcomes.indexOf(outcomeCode);
    if (idx !== -1) {
      block.outcomes.splice(idx, 1);
      delete block.outcomeMappings[outcomeCode];
    } else {
      block.outcomes.push(outcomeCode);
      
      // Auto-tag area or competency to enforce logical hierarchy
      const outcomeObj = RVP_OUTCOMES.find(o => o.code === outcomeCode);
      if (outcomeObj) {
        if (RVP_COMPETENCIES[outcomeObj.category]) {
          if (!block.competencies) block.competencies = [];
          if (!block.competencies.includes(outcomeObj.category)) {
            block.competencies.push(outcomeObj.category);
          }
          block.outcomeMappings[outcomeCode] = {
            competency: outcomeObj.category,
            literacy: initialMapping.literacy || null
          };
        }
        if (RVP_AREAS[outcomeObj.category]) {
          if (!block.areas) block.areas = [];
          if (!block.areas.includes(outcomeObj.category)) {
            block.areas.push(outcomeObj.category);
          }
          const defaultComp = initialMapping.competency || (block.competencies && block.competencies.length > 0 ? block.competencies[0] : 'KKU');
          block.outcomeMappings[outcomeCode] = {
            competency: defaultComp,
            literacy: initialMapping.literacy || null
          };
          if (defaultComp && block.competencies && !block.competencies.includes(defaultComp)) {
            block.competencies.push(defaultComp);
          }
        }
      }
    }
    this.notify('block_outcomes_updated');
  }

  addBlockOutcome(blockId, outcomeCode, initialMapping = {}) {
    const block = this.currentDoc.blocks.find(b => b.id === blockId);
    if (!block) return;
    if (!block.outcomes) block.outcomes = [];
    if (!block.outcomeMappings) block.outcomeMappings = {};
    
    if (!block.outcomes.includes(outcomeCode)) {
      block.outcomes.push(outcomeCode);
      const outcomeObj = RVP_OUTCOMES.find(o => o.code === outcomeCode);
      if (outcomeObj) {
        if (RVP_COMPETENCIES[outcomeObj.category]) {
          if (!block.competencies) block.competencies = [];
          if (!block.competencies.includes(outcomeObj.category)) {
            block.competencies.push(outcomeObj.category);
          }
          block.outcomeMappings[outcomeCode] = {
            competency: outcomeObj.category,
            literacy: initialMapping.literacy || null
          };
        }
        if (RVP_AREAS[outcomeObj.category]) {
          if (!block.areas) block.areas = [];
          if (!block.areas.includes(outcomeObj.category)) {
            block.areas.push(outcomeObj.category);
          }
          const defaultComp = initialMapping.competency || (block.competencies && block.competencies.length > 0 ? block.competencies[0] : 'KKU');
          block.outcomeMappings[outcomeCode] = {
            competency: defaultComp,
            literacy: initialMapping.literacy || null
          };
          if (defaultComp && block.competencies && !block.competencies.includes(defaultComp)) {
            block.competencies.push(defaultComp);
          }
        }
      }
      this.notify('block_outcomes_updated');
    }
  }

  removeBlockOutcome(blockId, outcomeCode) {
    const block = this.currentDoc.blocks.find(b => b.id === blockId);
    if (!block || !block.outcomes) return;
    const idx = block.outcomes.indexOf(outcomeCode);
    if (idx !== -1) {
      block.outcomes.splice(idx, 1);
      if (block.outcomeMappings) {
        delete block.outcomeMappings[outcomeCode];
      }
      this.notify('block_outcomes_updated');
    }
  }

  setOutcomeMapping(blockId, outcomeCode, competencyCode, literacyCode = undefined) {
    const block = this.currentDoc.blocks.find(b => b.id === blockId);
    if (!block) return;
    if (!block.outcomeMappings) block.outcomeMappings = {};
    if (!block.outcomeMappings[outcomeCode]) {
      block.outcomeMappings[outcomeCode] = {};
    }
    if (competencyCode !== undefined) {
      block.outcomeMappings[outcomeCode].competency = competencyCode;
      if (competencyCode && block.competencies && !block.competencies.includes(competencyCode)) {
        block.competencies.push(competencyCode);
      }
    }
    if (literacyCode !== undefined) {
      block.outcomeMappings[outcomeCode].literacy = literacyCode;
      if (literacyCode && block.literacies && !block.literacies.includes(literacyCode)) {
        block.literacies.push(literacyCode);
      }
    }
    this.notify('block_outcomes_updated');
  }

  getOutcomeMapping(block, outcomeCode) {
    if (!block) return null;
    const outcomeObj = RVP_OUTCOMES.find(o => o.code === outcomeCode);
    if (!outcomeObj) return null;

    if (block.outcomeMappings && block.outcomeMappings[outcomeCode]) {
      return block.outcomeMappings[outcomeCode];
    }

    if (RVP_COMPETENCIES[outcomeObj.category]) {
      return { competency: outcomeObj.category, literacy: null };
    }
    const defaultComp = (block.competencies && block.competencies.length > 0) ? block.competencies[0] : null;
    return { competency: defaultComp, literacy: null };
  }

  toggleBlockCompetency(blockId, compCode) {
    const block = this.currentDoc.blocks.find(b => b.id === blockId);
    if (!block) return;
    if (!block.competencies) block.competencies = [];
    const idx = block.competencies.indexOf(compCode);
    if (idx !== -1) {
      this.removeCompetencyWithOutcomes(blockId, compCode);
    } else {
      block.competencies.push(compCode);
      this.notify('block_competencies_updated');
    }
  }

  removeCompetencyWithOutcomes(blockId, compCode) {
    const block = this.currentDoc.blocks.find(b => b.id === blockId);
    if (!block) return;
    if (block.competencies) {
      block.competencies = block.competencies.filter(c => c !== compCode);
    }
    // Also remove associated outcomes belonging to this competency
    if (block.outcomes) {
      block.outcomes = block.outcomes.filter(code => {
        const out = RVP_OUTCOMES.find(o => o.code === code);
        return !out || out.category !== compCode;
      });
    }
    this.notify('block_competencies_updated');
  }

  toggleBlockLiteracy(blockId, litCode) {
    const block = this.currentDoc.blocks.find(b => b.id === blockId);
    if (!block) return;
    if (!block.literacies) block.literacies = [];
    const idx = block.literacies.indexOf(litCode);
    if (idx !== -1) {
      block.literacies.splice(idx, 1);
    } else {
      block.literacies.push(litCode);
    }
    this.notify('block_literacies_updated');
  }

  toggleBlockArea(blockId, areaCode) {
    const block = this.currentDoc.blocks.find(b => b.id === blockId);
    if (!block) return;
    if (!block.areas) block.areas = [];
    const idx = block.areas.indexOf(areaCode);
    if (idx !== -1) {
      this.removeAreaWithOutcomes(blockId, areaCode);
    } else {
      block.areas.push(areaCode);
      this.notify('block_areas_updated');
    }
  }

  removeAreaWithOutcomes(blockId, areaCode) {
    const block = this.currentDoc.blocks.find(b => b.id === blockId);
    if (!block) return;
    if (block.areas) {
      block.areas = block.areas.filter(a => a !== areaCode);
    }
    // Remove associated outcomes belonging to this area
    if (block.outcomes) {
      block.outcomes = block.outcomes.filter(code => {
        const out = RVP_OUTCOMES.find(o => o.code === code);
        return !out || out.category !== areaCode;
      });
    }
    this.notify('block_areas_updated');
  }

  syncBlockRelationships(block) {
    if (!block) return;
    if (!block.competencies) block.competencies = [];
    if (!block.areas) block.areas = [];
    if (!block.literacies) block.literacies = [];
    if (!block.outcomes) block.outcomes = [];

    block.outcomes.forEach(code => {
      const out = RVP_OUTCOMES.find(o => o.code === code);
      if (out) {
        if (RVP_COMPETENCIES[out.category] && !block.competencies.includes(out.category)) {
          block.competencies.push(out.category);
        }
        if (RVP_AREAS[out.category] && !block.areas.includes(out.category)) {
          block.areas.push(out.category);
        }
      }
    });
  }

  // Activities
  addActivityToBlock(blockId, activity) {
    const block = this.currentDoc.blocks.find(b => b.id === blockId);
    if (!block) return;
    if (!block.activities) block.activities = [];
    const newAct = {
      id: 'act-' + Date.now(),
      title: activity.title || 'Nová činnost',
      type: activity.type || 'Řízená činnost',
      desc: activity.desc || '',
      linkedOutcomes: activity.linkedOutcomes || []
    };
    block.activities.push(newAct);
    this.notify('activity_added');
    return newAct;
  }

  updateActivity(blockId, activityId, updates) {
    const block = this.currentDoc.blocks.find(b => b.id === blockId);
    if (!block || !block.activities) return;
    const act = block.activities.find(a => a.id === activityId);
    if (act) {
      Object.assign(act, updates);
      this.notify('activity_updated');
    }
  }

  deleteActivity(blockId, activityId) {
    const block = this.currentDoc.blocks.find(b => b.id === blockId);
    if (!block || !block.activities) return;
    block.activities = block.activities.filter(a => a.id !== activityId);
    this.notify('activity_deleted');
  }

  // Coverage calculation
  calculateCoverage() {
    const stats = {
      totalOutcomes: RVP_OUTCOMES.length,
      coveredOutcomes: new Set(),
      competencyCoverage: {},
      areaCoverage: {},
      literacyCoverage: {}
    };

    // Initialize counters
    Object.keys(RVP_COMPETENCIES).forEach(c => {
      stats.competencyCoverage[c] = { count: 0, blocks: new Set(), totalInRVP: 0 };
    });
    Object.keys(RVP_AREAS).forEach(a => {
      stats.areaCoverage[a] = { count: 0, blocks: new Set(), totalInRVP: 0 };
    });
    Object.keys(RVP_LITERACIES).forEach(l => {
      stats.literacyCoverage[l] = { count: 0, blocks: new Set() };
    });

    // Count outcomes per RVP domain
    RVP_OUTCOMES.forEach(out => {
      if (stats.competencyCoverage[out.category]) {
        stats.competencyCoverage[out.category].totalInRVP++;
      }
      if (stats.areaCoverage[out.category]) {
        stats.areaCoverage[out.category].totalInRVP++;
      }
    });

    // Tally from blocks
    this.currentDoc.blocks.forEach(block => {
      if (block.competencies) {
        block.competencies.forEach(c => {
          if (stats.competencyCoverage[c]) stats.competencyCoverage[c].blocks.add(block.title);
        });
      }
      if (block.areas) {
        block.areas.forEach(a => {
          if (stats.areaCoverage[a]) stats.areaCoverage[a].blocks.add(block.title);
        });
      }
      if (block.literacies) {
        block.literacies.forEach(l => {
          if (stats.literacyCoverage[l]) stats.literacyCoverage[l].blocks.add(block.title);
        });
      }
      if (block.outcomes) {
        block.outcomes.forEach(code => {
          stats.coveredOutcomes.add(code);
          const outObj = RVP_OUTCOMES.find(o => o.code === code);
          if (outObj) {
            if (stats.competencyCoverage[outObj.category]) {
              stats.competencyCoverage[outObj.category].count++;
            }
            if (stats.areaCoverage[outObj.category]) {
              stats.areaCoverage[outObj.category].count++;
            }
          }
        });
      }
    });

    return stats;
  }

  // Import / Export
  exportJSON() {
    const jsonStr = JSON.stringify(this.currentDoc, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `SVP_PV_${(this.currentDoc.schoolData.mottoName || 'program').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.svppv`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.schoolData || !Array.isArray(parsed.blocks)) {
        throw new Error('Neplatný formát souboru ŠVP PV.');
      }
      this.currentDoc = parsed;
      this.notify('file_imported');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export const store = new SVPStore();
