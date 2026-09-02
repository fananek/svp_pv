// Main Controller & UI Logic for ŠVP PV Web Application
import { store } from './store.js';
import { dnd } from './dnd_manager.js';
import { SVPExporter } from './exporter.js';
import { RVP_COMPETENCIES, RVP_LITERACIES, RVP_AREAS, RVP_OUTCOMES } from '../data/rvp_data.js';
import { SAMPLE_TEMPLATES } from '../data/sample_templates.js';

// Helper for Czech pluralization (1 blok, 2-4 bloky, 5+ bloků)
function formatPlural(count, one, few, many) {
  const n = Math.abs(count);
  if (n === 1) return `${count} ${one}`;
  if (n >= 2 && n <= 4) return `${count} ${few}`;
  return `${count} ${many}`;
}

function formatBlocks(count) {
  return formatPlural(count, 'blok', 'bloky', 'bloků');
}

class SVPApp {
  constructor() {
    this.currentView = 'dashboard';
    this.selectedBlockId = null;
    this.catalogCategoryFilter = 'ALL';
    this.catalogUsageFilter = 'ALL';
    this.catalogSearchQuery = '';
    this.collapsedBlocks = new Set();
    this.collapsedCatalogCategories = new Set();
    this.expandedCatalogCompetencies = new Set();
    this.expandedCatalogAreas = new Set();
    this.blockOfferTabs = new Map();
    this.init();
  }

  init() {
    this.bindNavigation();
    this.bindThemeToggle();
    this.bindGlobalActions();
    this.bindFormInputs();
    this.render();

    // Subscribe to store updates
    store.subscribe((doc, action) => {
      this.handleStoreUpdate(doc, action);
    });
  }

  showToast(message, icon = '✓') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  bindNavigation() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('sidebar-close-btn');
    const backdrop = document.getElementById('sidebar-backdrop');
    const sidebar = document.getElementById('app-sidebar');

    const toggleSidebar = (open) => {
      const isOpen = open !== undefined ? open : !sidebar.classList.contains('open');
      sidebar.classList.toggle('open', isOpen);
      backdrop.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => toggleSidebar(true));
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => toggleSidebar(false));
    }
    if (backdrop) {
      backdrop.addEventListener('click', () => toggleSidebar(false));
    }

    document.querySelectorAll('[data-view-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view-target');
        toggleSidebar(false);
        this.switchView(targetView);
      });
    });

    // Mobile catalog toggle in builder
    const catalogToggleBtn = document.getElementById('btn-toggle-mobile-catalog');
    if (catalogToggleBtn) {
      catalogToggleBtn.addEventListener('click', () => {
        const catalogSidebar = document.getElementById('builder-catalog-sidebar');
        const badge = document.getElementById('mobile-catalog-state-badge');
        if (catalogSidebar) {
          catalogSidebar.classList.toggle('is-mobile-open');
          const isOpen = catalogSidebar.classList.contains('is-mobile-open');
          if (badge) {
            badge.textContent = isOpen ? 'Skrýt katalog' : 'Zobrazit katalog';
            badge.style.background = isOpen ? 'rgba(239, 68, 68, 0.15)' : 'var(--primary-50)';
            badge.style.color = isOpen ? '#dc2626' : 'var(--primary-600)';
          }
        }
      });
    }
  }

  switchView(viewId) {
    this.currentView = viewId;
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${viewId}`);
    });
    document.querySelectorAll('[data-view-target]').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-view-target') === viewId);
    });

    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();
  }

  bindThemeToggle() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    
    // Check local storage or system preference, default to dark
    const savedTheme = localStorage.getItem('svp_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('svp_theme', next);
      btn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
    btn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  }

  bindGlobalActions() {
    // New blank doc
    const btnNew = document.getElementById('btn-new-doc');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        if (confirm('Chcete vytvořit nový prázdný ŠVP PV? Neuložené změny budou přepsány.')) {
          store.createNewBlank();
          this.showToast('Vytvořen nový prázdný ŠVP PV');
          this.switchView('identification');
        }
      });
    }

    // Load templates modal
    const btnTemplates = document.getElementById('btn-load-template');
    if (btnTemplates) {
      btnTemplates.addEventListener('click', () => {
        this.openTemplateModal();
      });
    }

    // Export JSON
    const btnExportJSON = document.getElementById('btn-export-json');
    if (btnExportJSON) {
      btnExportJSON.addEventListener('click', () => {
        store.exportJSON();
        this.showToast('Soubor projektu byl úspěšně stažen (.svppv)');
      });
    }

    // Import JSON
    const inputImportJSON = document.getElementById('input-import-json');
    if (inputImportJSON) {
      inputImportJSON.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const res = store.importJSON(evt.target.result);
          if (res.success) {
            this.showToast('Projekt ŠVP PV byl úspěšně načten');
            this.render();
          } else {
            alert('Chyba při importu: ' + res.error);
          }
        };
        reader.readAsText(file);
      });
    }

    // Print Preview
    const btnPrint = document.getElementById('btn-print-doc');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        SVPExporter.openPrintPreview(store.getDoc());
      });
    }

    // Export DOCX
    const btnExportWord = document.getElementById('btn-export-word');
    if (btnExportWord) {
      btnExportWord.addEventListener('click', () => {
        SVPExporter.exportWordDocx(store.getDoc());
        this.showToast('Dokument MS Word (.doc) byl vygenerován');
      });
    }

    // Logo Upload
    const inputLogo = document.getElementById('input-school-logo');
    if (inputLogo) {
      inputLogo.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
          alert('Soubor loga je příliš velký. Vyberte prosím obrázek do 2 MB.');
          return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          const logoData = evt.target.result;
          store.updateLogo(logoData);
          this.showToast('Logo mateřské školy bylo nahráno');
          this.render();
        };
        reader.readAsDataURL(file);
      });
    }

    // Logo Remove
    const btnRemoveLogo = document.getElementById('btn-remove-logo');
    if (btnRemoveLogo) {
      btnRemoveLogo.addEventListener('click', () => {
        if (confirm('Opravdu chcete odstranit logo mateřské školy?')) {
          store.updateLogo('');
          this.showToast('Logo bylo odstraněno');
          this.render();
        }
      });
    }

    // Add Block Button
    const btnAddBlock = document.getElementById('btn-add-block');
    if (btnAddBlock) {
      btnAddBlock.addEventListener('click', () => {
        this.addBlock();
      });
    }
  }

  addBlock(blockData) {
    const newBlock = store.addBlock(blockData || {
      title: 'Nový integrovaný blok ' + (store.getDoc().blocks.length + 1),
      timeFrame: 'Časový rámec',
      purpose: 'Zde popište hlavní cíl a smysl tohoto bloku...'
    });
    this.selectedBlockId = newBlock.id;
    this.showToast('Byl přidán nový integrovaný blok');
    this.render();
  }

  openPrintPreview(doc) {
    SVPExporter.openPrintPreview(doc || store.getDoc());
  }

  bindFormInputs() {
    // Dynamic binding for schoolData inputs with data-model attribute
    document.addEventListener('input', (e) => {
      const modelTarget = e.target.getAttribute('data-model');
      if (modelTarget) {
        if (modelTarget.startsWith('schoolData.')) {
          const field = modelTarget.replace('schoolData.', '');
          store.updateSchoolData(field, e.target.value);
        } else if (modelTarget.startsWith('autoevaluation.')) {
          const field = modelTarget.replace('autoevaluation.', '');
          store.updateAutoevaluation(field, e.target.value);
        }
      }

      if (e.target && e.target.tagName === 'TEXTAREA') {
        this.autoResizeTextarea(e.target);
      }
    });

    window.addEventListener('resize', () => {
      this.autoResizeAllTextareas();
    });
  }

  autoResizeTextarea(el) {
    if (!el) return;
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    if (scrollH > 0) {
      el.style.height = `${scrollH + 4}px`;
    }
  }

  autoResizeAllTextareas() {
    requestAnimationFrame(() => {
      document.querySelectorAll('textarea').forEach(tx => {
        if (tx.offsetParent !== null) {
          this.autoResizeTextarea(tx);
        }
      });
    });
  }

  handleStoreUpdate(doc, action) {
    // Animate saving status indicator
    const dot = document.getElementById('status-indicator-dot');
    const text = document.getElementById('status-indicator-text');
    if (dot && text) {
      dot.classList.add('saving');
      text.textContent = 'Ukládání změn...';
      setTimeout(() => {
        dot.classList.remove('saving');
        text.textContent = 'Uloženo lokálně v prohlížeči';
      }, 300);
    }

    // Re-render views if needed
    if (['template_loaded', 'doc_reset', 'file_imported', 'logo_updated', 'block_added', 'block_deleted', 'blocks_reordered'].includes(action)) {
      this.render();
    } else if (this.currentView === 'blocks-builder' || this.currentView === 'coverage-matrix' || this.currentView === 'preview-export') {
      this.render();
    }
  }

  updateLogoUI(doc) {
    const logoUrl = doc.schoolData && doc.schoolData.logoUrl;
    
    // Sidebar brand icon
    const sidebarBrandIcon = document.getElementById('sidebar-brand-icon');
    if (sidebarBrandIcon) {
      if (logoUrl) {
        sidebarBrandIcon.innerHTML = `<img src="${logoUrl}" alt="Logo" class="brand-custom-logo">`;
        sidebarBrandIcon.style.background = 'transparent';
      } else {
        sidebarBrandIcon.innerHTML = '🌟';
        sidebarBrandIcon.style.background = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)';
      }
    }

    // Identification view logo preview
    const logoImg = document.getElementById('school-logo-img');
    const logoPlaceholder = document.getElementById('school-logo-placeholder');
    const btnRemove = document.getElementById('btn-remove-logo');
    
    if (logoImg && logoPlaceholder && btnRemove) {
      if (logoUrl) {
        logoImg.src = logoUrl;
        logoImg.style.display = 'block';
        logoPlaceholder.style.display = 'none';
        btnRemove.style.display = 'inline-flex';
      } else {
        logoImg.src = '';
        logoImg.style.display = 'none';
        logoPlaceholder.style.display = 'block';
        btnRemove.style.display = 'none';
      }
    }
  }

  render() {
    const doc = store.getDoc();
    
    // Update logo in UI
    this.updateLogoUI(doc);

    // Header title update
    const headerTitle = document.getElementById('app-active-title');
    if (headerTitle) {
      headerTitle.textContent = doc.schoolData.mottoName ? `„${doc.schoolData.mottoName}“ - ${doc.schoolData.schoolName || 'ŠVP PV'}` : 'Školní vzdělávací program';
    }

    // Render forms based on current view
    this.populateFormFields(doc);

    // View specific renders
    if (this.currentView === 'dashboard') {
      this.renderDashboard(doc);
    } else if (this.currentView === 'school-char') {
      this.renderClassesList(doc);
    } else if (this.currentView === 'blocks-builder') {
      this.renderBlocksBuilder(doc);
    } else if (this.currentView === 'coverage-matrix') {
      this.renderCoverageMatrix(doc);
    } else if (this.currentView === 'rvp-catalog') {
      this.renderRvpCatalog();
    } else if (this.currentView === 'preview-export') {
      this.renderPreview(doc);
    }

    this.autoResizeAllTextareas();
  }

  populateFormFields(doc) {
    document.querySelectorAll('[data-model]').forEach(input => {
      const model = input.getAttribute('data-model');
      let val = '';
      if (model.startsWith('schoolData.')) {
        const field = model.replace('schoolData.', '');
        val = doc.schoolData[field] || '';
      } else if (model.startsWith('autoevaluation.')) {
        const field = model.replace('autoevaluation.', '');
        val = doc.autoevaluation[field] || '';
      }
      
      if (input.value !== val && document.activeElement !== input) {
        input.value = val;
      }
    });
  }

  renderDashboard(doc) {
    const container = document.getElementById('dashboard-metrics');
    if (!container) return;

    const stats = store.calculateCoverage();
    const blocksCount = doc.blocks.length;
    const activitiesCount = doc.blocks.reduce((acc, b) => acc + (b.activities ? b.activities.length : 0), 0);
    const outcomesAssigned = stats.coveredOutcomes.size;

    container.innerHTML = `
      <div class="card" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
          <div>
            <span class="header-tag">${doc.tag || 'Aktivní program'}</span>
            <h2 style="font-size: 1.4rem; margin-top: 10px; color: var(--text-main); line-height: 1.3;">„${doc.schoolData.mottoName || 'Školní vzdělávací program'}“</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">${doc.schoolData.schoolName || 'Mateřská škola'} | Zpracovatel: ${doc.schoolData.author || 'Pedagogický tým'}</p>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window.svpApp.switchView('preview-export')">📄 Náhled a Export</button>
            <button class="btn btn-primary btn-sm" onclick="window.svpApp.switchView('blocks-builder')">✏️ Upravit bloky</button>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 20px;">
        <div class="card" style="padding: 16px; margin-bottom: 0;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">INTEGROVANÉ BLOKY</span>
          <div style="font-size: 2rem; font-weight: 800; color: var(--primary-600); margin-top: 4px;">${blocksCount}</div>
          <span style="font-size: 0.75rem; color: var(--text-light);">Celkem témat v celém školním roce</span>
        </div>
        <div class="card" style="padding: 16px; margin-bottom: 0;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">VZDĚLÁVACÍ ČINNOSTI</span>
          <div style="font-size: 2rem; font-weight: 800; color: var(--success-600); margin-top: 4px;">${activitiesCount}</div>
          <span style="font-size: 0.75rem; color: var(--text-light);">Naplánovaných aktivit a her</span>
        </div>
        <div class="card" style="padding: 16px; margin-bottom: 0;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">ZAPOJENÉ VÝSTUPY RVP (OVU)</span>
          <div style="font-size: 2rem; font-weight: 800; color: #8b5cf6; margin-top: 4px;">${outcomesAssigned} / ${stats.totalOutcomes}</div>
          <span style="font-size: 0.75rem; color: var(--text-light);">Očekávané výsledky učení z RVP PV</span>
        </div>
        <div class="card" style="padding: 16px; margin-bottom: 0;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">PLATNOST DOKUMENTU</span>
          <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-top: 8px;">${doc.schoolData.validFrom || '-'} až ${doc.schoolData.validTo || '-'}</div>
          <span style="font-size: 0.75rem; color: var(--text-light);">Č.j.: ${doc.schoolData.refNumber || 'MS/2026/01'}</span>
        </div>
      </div>

      <!-- Quick Step Guide -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🗺 Průvodce kapitolami ŠVP PV (podle metodiky MŠMT)</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
          <div class="draggable-item" onclick="window.svpApp.switchView('identification')">
            <span style="font-size: 1.3rem;">🏛</span>
            <div>
              <strong>1. Identifikační údaje školy</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Název, adresa, IČO, ředitel, č.j., platnost</div>
            </div>
          </div>
          <div class="draggable-item" onclick="window.svpApp.switchView('school-char')">
            <span style="font-size: 1.3rem;">🏫</span>
            <div>
              <strong>2. Charakteristika školy a tříd</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Lokalita, prostory, zahrada, uspořádání tříd</div>
            </div>
          </div>
          <div class="draggable-item" onclick="window.svpApp.switchView('team-staff')">
            <span style="font-size: 1.3rem;">👩‍🏫</span>
            <div>
              <strong>3. Pedagogický tým</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Učitelé, asistenti pedagoga, DVPP rozvoj</div>
            </div>
          </div>
          <div class="draggable-item" onclick="window.svpApp.switchView('conditions')">
            <span style="font-size: 1.3rem;">🏡</span>
            <div>
              <strong>4. Podmínky vzdělávání</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Psychosociální, životospráva, věcné podmínky</div>
            </div>
          </div>
          <div class="draggable-item" onclick="window.svpApp.switchView('curriculum-char')">
            <span style="font-size: 1.3rem;">🌟</span>
            <div>
              <strong>5. Vzdělávací program a vize</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Vize, strategie rozvoje kompetencí, diagnostika</div>
            </div>
          </div>
          <div class="draggable-item" onclick="window.svpApp.switchView('blocks-builder')">
            <span style="font-size: 1.3rem;">🧩</span>
            <div>
              <strong>6. Integrované bloky & Činnosti</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Vizuální tvůrce s vazbami a Drag & Drop</div>
            </div>
          </div>
          <div class="draggable-item" onclick="window.svpApp.switchView('autoevaluation')">
            <span style="font-size: 1.3rem;">📊</span>
            <div>
              <strong>7. Autoevaluace a hodnocení</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Oblasti, kritéria, nástroje a harmonogram</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderClassesList(doc) {
    const listContainer = document.getElementById('classes-list-container');
    if (!listContainer) return;

    const classes = doc.schoolData.classes || [];
    listContainer.innerHTML = `
      <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <span style="font-size: 0.9rem; font-weight: 600;">Seznam tříd mateřské školy (${formatPlural(classes.length, 'třída', 'třídy', 'tříd')})</span>
        <button class="btn btn-sm btn-primary" id="btn-add-class">+ Přidat třídu</button>
      </div>
      <div class="table-responsive">
        <table class="meta-table" style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: var(--bg-subtle);">
              <th style="padding: 8px 12px; border: 1px solid var(--border-color); text-align: left; min-width: 170px;">Název třídy</th>
              <th style="padding: 8px 12px; border: 1px solid var(--border-color); text-align: left; width: 140px;">Věková skupina</th>
              <th style="padding: 8px 12px; border: 1px solid var(--border-color); text-align: left; width: 120px;">Kapacita</th>
              <th style="padding: 8px 12px; border: 1px solid var(--border-color); text-align: left; min-width: 190px;">Typ uspořádání</th>
              <th style="padding: 8px 12px; border: 1px solid var(--border-color); text-align: center; width: 60px;">Akce</th>
            </tr>
          </thead>
          <tbody>
            ${classes.map((cls, idx) => `
              <tr>
                <td style="padding: 6px 10px; border: 1px solid var(--border-color);">
                  <input type="text" class="form-input" style="font-size: 0.88rem; font-weight: 600; padding: 5px 8px; width: 100%;" value="${cls.name}" placeholder="Název třídy..." onchange="window.svpApp.updateClass(${idx}, 'name', this.value)">
                </td>
                <td style="padding: 6px 10px; border: 1px solid var(--border-color);">
                  <input type="text" class="form-input" style="font-size: 0.85rem; padding: 5px 8px; width: 100%;" value="${cls.ageRange || '2–7 let'}" placeholder="např. 2–7 let" onchange="window.svpApp.updateClass(${idx}, 'ageRange', this.value)">
                </td>
                <td style="padding: 6px 10px; border: 1px solid var(--border-color);">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <input type="number" min="1" max="50" class="form-input" style="font-size: 0.85rem; padding: 5px 6px; width: 65px;" value="${cls.count || 25}" onchange="window.svpApp.updateClass(${idx}, 'count', parseInt(this.value, 10) || 0)">
                    <span style="font-size: 0.78rem; color: var(--text-muted);">dětí</span>
                  </div>
                </td>
                <td style="padding: 6px 10px; border: 1px solid var(--border-color);">
                  <select class="form-select" style="font-size: 0.82rem; padding: 5px 8px; width: 100%;" onchange="window.svpApp.updateClass(${idx}, 'type', this.value)">
                    <option value="Věkově smíšená (rodinná)" ${cls.type === 'Věkově smíšená (rodinná)' || cls.type === 'Věkově smíšená' ? 'selected' : ''}>Věkově smíšená (rodinná)</option>
                    <option value="Věkově homogenní (stejnověká)" ${cls.type === 'Věkově homogenní (stejnověká)' || cls.type === 'Homogenní' ? 'selected' : ''}>Věkově homogenní (stejnověká)</option>
                    <option value="Lesní / přírodní skupina" ${cls.type === 'Lesní / přírodní skupina' ? 'selected' : ''}>Lesní / přírodní skupina</option>
                    <option value="Speciální / logopedická" ${cls.type === 'Speciální / logopedická' ? 'selected' : ''}>Speciální / logopedická</option>
                  </select>
                </td>
                <td style="padding: 6px 10px; border: 1px solid var(--border-color); text-align: center;">
                  <button class="btn-icon-only" style="color: var(--danger-500); padding: 4px 6px;" onclick="window.svpApp.removeClass(${idx})" title="Smazat třídu">🗑</button>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="5" style="text-align: center; padding: 14px; color: var(--text-muted);">Zatím nejsou přidány žádné třídy.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

    const addBtn = document.getElementById('btn-add-class');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.addNewClass();
      });
    }
  }

  updateClass(idx, field, value) {
    store.updateClass(idx, field, value);
  }

  addNewClass() {
    const defaultNames = [
      'Motýlci', 'Včeličky', 'Broučci', 'Sluníčka', 'Koťata', 
      'Žabičky', 'Sovičky', 'Berušky', 'Medvídci', 'Kapičky',
      'Rybičky', 'Zajíčci', 'Ježečci', 'Ptáčci', 'Mravenečci'
    ];
    const ageOptions = ['2–7 let', '3–6 let', '2–4 roky', '4–6 let', '5–7 let', '3–5 let'];
    const typeOptions = ['Věkově smíšená (rodinná)', 'Věkově homogenní (stejnověká)', 'Věkově smíšená', 'Lesní / přírodní skupina'];
    const capacityOptions = [18, 20, 22, 24, 25, 26, 28];

    const currentClasses = store.getDoc().schoolData.classes || [];
    const usedNames = new Set(currentClasses.map(c => c.name.toLowerCase()));
    const suggestedName = defaultNames.find(n => !usedNames.has(n.toLowerCase())) || `Třída ${currentClasses.length + 1}`;

    const enteredName = prompt('Zadejte název nové třídy (např. Motýlci, Včeličky):', suggestedName);
    if (!enteredName || !enteredName.trim()) return;

    // Random values for the rest of data
    const randomAge = ageOptions[Math.floor(Math.random() * ageOptions.length)];
    const randomCount = capacityOptions[Math.floor(Math.random() * capacityOptions.length)];
    const randomType = typeOptions[Math.floor(Math.random() * typeOptions.length)];

    store.addClass({
      name: enteredName.trim(),
      ageRange: randomAge,
      count: randomCount,
      type: randomType
    });
    this.render();
    this.showToast(`Třída „${enteredName.trim()}“ byla přidána`);
  }

  removeClass(idx) {
    if (confirm('Opravdu chcete odstranit tuto třídu?')) {
      store.removeClass(idx);
      this.render();
    }
  }

  // --- BLOCKS BUILDER (Drag & Drop Visual Mapper) ---
  renderBlocksBuilder(doc) {
    const catalogContainer = document.getElementById('builder-catalog-content');
    const blocksContainer = document.getElementById('builder-blocks-list');
    if (!catalogContainer || !blocksContainer) return;

    // Initialize Catalog UI structure if not already initialized
    let itemsContainer = document.getElementById('builder-catalog-items');
    if (!itemsContainer) {
      catalogContainer.innerHTML = `
        <div class="catalog-controls">
          <input type="text" class="form-input" id="builder-catalog-search" placeholder="🔍 Hledat v katalogu (kód, název)..." value="${this.catalogSearchQuery}" style="width: 100%; margin-bottom: 6px; font-size: 0.8rem; padding: 6px 10px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px;">
            <select class="form-select" id="builder-catalog-category" style="width: 100%; font-size: 0.76rem; padding: 4px 6px;">
              <option value="ALL">📚 Všechny oblasti</option>
              <option value="COMPETENCIES">🧠 Klíčové kompetence</option>
              <option value="LITERACIES">📖 Gramotnosti</option>
              <option value="DJT">🏃 Tělo (DJT)</option>
              <option value="DJP">🧠 Psychika (DJP)</option>
              <option value="DDS">👥 Společnost (DDS)</option>
              <option value="DAS">🌍 Svět (DAS)</option>
            </select>
            <select class="form-select" id="builder-catalog-usage-filter" style="width: 100%; font-size: 0.76rem; padding: 4px 6px;">
              <option value="ALL">📊 Všechna využití</option>
              <option value="UNUSED">🔴 Nepoužité (0×)</option>
              <option value="BALANCED">🟢 Optimální (1–3×)</option>
              <option value="FREQUENT">🟠 Časté (4+×)</option>
            </select>
          </div>
        </div>
        <div class="catalog-scroll" id="builder-catalog-items"></div>
      `;

      // Bind search input and filters once
      const searchInput = document.getElementById('builder-catalog-search');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.catalogSearchQuery = e.target.value;
          this.renderCatalogItems();
        });
      }
      const catSelect = document.getElementById('builder-catalog-category');
      if (catSelect) {
        catSelect.value = this.catalogCategoryFilter;
        catSelect.addEventListener('change', (e) => {
          this.catalogCategoryFilter = e.target.value;
          this.renderCatalogItems();
        });
      }
      const usageSelect = document.getElementById('builder-catalog-usage-filter');
      if (usageSelect) {
        usageSelect.value = this.catalogUsageFilter;
        usageSelect.addEventListener('change', (e) => {
          this.catalogUsageFilter = e.target.value;
          this.renderCatalogItems();
        });
      }
    }

    // Render items into the scroll container without touching inputs
    this.renderCatalogItems();

    // Render Blocks List
    const blocks = doc.blocks || [];
    if (blocks.length === 0) {
      blocksContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <h3>Zatím nemáte žádné integrované bloky</h3>
          <p style="color: var(--text-muted); margin: 10px 0 20px 0;">Vytvořte svůj první integrovaný vzdělávací blok nebo načtěte vzorovou šablonu.</p>
          <button class="btn btn-primary" onclick="window.svpApp.addBlock()">+ Vytvořit 1. integrovaný blok</button>
        </div>
      `;
      return;
    }

    blocksContainer.innerHTML = blocks.map((b, idx) => {
      const isCollapsed = this.collapsedBlocks.has(b.id);
      const compCount = (b.competencies || []).length;
      const litCount = (b.literacies || []).length;
      const areaCount = (b.areas || []).length;
      const outCount = (b.outcomes || []).length;
      const actCount = (b.activities || []).length;
      const centersCount = (b.centersOfActivity || []).length;

      const compOutcomesCount = (b.outcomes || []).filter(code => {
        const out = RVP_OUTCOMES.find(o => o.code === code);
        return out && RVP_COMPETENCIES[out.category];
      }).length;
      const areaOutcomesCount = (b.outcomes || []).filter(code => {
        const out = RVP_OUTCOMES.find(o => o.code === code);
        return out && RVP_AREAS[out.category];
      }).length;

      let currentOfferTab = this.blockOfferTabs.get(b.id);
      if (!currentOfferTab) {
        currentOfferTab = (centersCount > 0 && actCount === 0) ? 'centers' : 'activities';
      }

      return `
      <div class="block-editor-card ${isCollapsed ? 'is-collapsed' : ''}" id="block-card-${b.id}" data-block-id="${b.id}" data-dropzone="true" data-dropzone-accepts="competency,literacy,area,outcome,activity" data-dropzone-type="block-all">
        <div class="block-editor-header" onclick="window.svpApp.toggleBlockCollapse('${b.id}')">
          <button class="block-collapse-btn" onclick="event.stopPropagation(); window.svpApp.toggleBlockCollapse('${b.id}')" title="${isCollapsed ? 'Rozbalit blok' : 'Sbalit blok'}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <span style="font-size: 1.15rem; font-weight: 800; color: var(--primary-600); flex-shrink: 0; padding-top: 3px;">${idx + 1}.</span>
              <textarea class="block-title-input" rows="1" placeholder="Název bloku..." onclick="event.stopPropagation()" onchange="window.svpApp.updateBlockTitle('${b.id}', this.value)" oninput="window.svpApp.autoResizeTextarea(this)">${b.title}</textarea>
            </div>
            <div class="block-summary-badges">
              ${compCount > 0 ? `<span class="block-summary-tag" title="${compOutcomesCount} přiřazených výsledků učení v kompetencích">🧠 ${formatPlural(compCount, 'kompetence', 'kompetence', 'kompetencí')} (${formatPlural(compOutcomesCount, 'výsledek', 'výsledky', 'výsledků')})</span>` : ''}
              ${areaCount > 0 ? `<span class="block-summary-tag" title="${areaOutcomesCount} přiřazených výsledků učení v oblastech">🎨 ${formatPlural(areaCount, 'oblast', 'oblasti', 'oblastí')} (${areaOutcomesCount} výstupů)</span>` : ''}
              ${litCount > 0 ? `<span class="block-summary-tag">📖 ${formatPlural(litCount, 'gramotnost', 'gramotnosti', 'gramotností')}</span>` : ''}
              ${actCount > 0 ? `<span class="block-summary-tag">⚡ ${formatPlural(actCount, 'činnost', 'činnosti', 'činností')}</span>` : ''}
              ${centersCount > 0 ? `<span class="block-summary-tag">🏢 ${formatPlural(centersCount, 'centrum', 'centra', 'center')}</span>` : ''}
              ${b.timeFrame ? `<span class="block-summary-tag" style="background: var(--bg-subtle);">🗓 ${b.timeFrame}</span>` : ''}
            </div>
          </div>
          <div style="display: flex; gap: 4px; align-items: center;" onclick="event.stopPropagation()">
            <button class="btn-icon-only" style="padding: 4px 6px; font-size: 0.72rem; line-height: 1;" onclick="window.svpApp.moveBlock(${idx}, -1)" title="Posunout blok nahoru" ${idx === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>▲</button>
            <button class="btn-icon-only" style="padding: 4px 6px; font-size: 0.72rem; line-height: 1;" onclick="window.svpApp.moveBlock(${idx}, 1)" title="Posunout blok dolů" ${idx === blocks.length - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>▼</button>
            <input type="text" class="form-input" style="font-size: 0.8rem; padding: 4px 8px; width: 130px;" value="${b.timeFrame}" placeholder="Časový rámec..." onchange="window.svpApp.updateBlockTime('${b.id}', this.value)">
            <button class="btn-icon-only" style="color: var(--danger-500); padding: 4px 8px;" onclick="window.svpApp.deleteBlock('${b.id}')" title="Smazat blok">🗑</button>
          </div>
        </div>

        <div class="block-editor-body">
          <!-- 1. Smysl, účel a hlavní záměr bloku -->
          <div class="block-form-section">
            <div class="block-form-section-title">
              <span>🎯 Smysl, účel a hlavní záměr bloku:</span>
            </div>
            <textarea class="form-textarea" style="min-height: 55px; font-size: 0.85rem;" placeholder="Zde popište hlavní cíl, motivaci a očekávaný přínos pro děti..." onchange="window.svpApp.updateBlockPurpose('${b.id}', this.value)">${b.purpose || ''}</textarea>
          </div>

          <!-- 2. Motivační záměr / Situační impuls -->
          <div class="block-form-section">
            <div class="block-form-section-title">
              <span>🌟 Motivační záměr / Situační impuls:</span>
            </div>
            <textarea class="form-textarea" style="min-height: 50px; font-size: 0.85rem;" placeholder="Proč téma otevíráme, podnět z dětských otázek či reálných situací..." onchange="window.svpApp.updateBlockImpulse('${b.id}', this.value)">${b.situationalImpulse || ''}</textarea>
          </div>

          <!-- 3. Rozvíjené základní gramotnosti -->
          <div class="block-form-section" style="margin-bottom: 14px; padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;" data-dropzone="true" data-dropzone-accepts="literacy" data-block-id="${b.id}" data-dropzone-type="literacies">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.4px;">📖 Základní gramotnosti:</span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">(průřezový rozvoj)</span>
            </div>
            <div class="literacy-checkbox-group">
              ${Object.entries(RVP_LITERACIES).map(([lCode, lit]) => {
                const isAssigned = (b.literacies || []).includes(lCode);
                return `
                  <label class="literacy-checkbox-item ${isAssigned ? 'is-checked' : ''}" title="${lit.desc}">
                    <input type="checkbox" 
                      ${isAssigned ? 'checked' : ''} 
                      onchange="window.svpApp.toggleBlockLit('${b.id}', '${lCode}')">
                    <span class="literacy-item-icon">${lit.icon}</span>
                    <span>${lit.name}</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 4. Rozvíjené klíčové kompetence a jejich očekávané výsledky učení -->
          <div class="block-hierarchy-section" style="border-left: 3px solid var(--primary-500);">
            <div class="block-hierarchy-header">
              <div class="block-hierarchy-title">
                <span>🧠 Rozvíjené klíčové kompetence a očekávané výsledky učení:</span>
                <span class="catalog-category-count" style="font-size: 0.72rem;">${formatPlural(compCount, 'kompetence', 'kompetence', 'kompetencí')}</span>
              </div>
              <button type="button" class="btn btn-sm btn-secondary" style="font-size: 0.72rem; padding: 3px 8px;" onclick="window.svpApp.openAddCompetencyModal('${b.id}')">
                + Přidat kompetenci
              </button>
            </div>

            <div class="dropzone-container" data-dropzone="true" data-dropzone-accepts="competency,outcome" data-block-id="${b.id}" data-dropzone-type="competencies" style="min-height: 44px; display: flex; flex-direction: column; gap: 8px;">
              ${(b.competencies || []).map(compCode => {
                const comp = RVP_COMPETENCIES[compCode] || { name: compCode, icon: '🧠', desc: '' };
                const compOutcomes = (b.outcomes || []).filter(code => {
                  const outObj = RVP_OUTCOMES.find(o => o.code === code);
                  return outObj && outObj.category === compCode;
                });
                return `
                  <div class="block-competency-card">
                    <div class="block-competency-header">
                      <div class="block-competency-name">
                        <span>${comp.icon}</span>
                        <span>${comp.name}</span>
                        <span class="code-badge" style="font-size: 0.68rem;">${compCode}</span>
                        <span class="catalog-category-count" style="font-size: 0.68rem;">${formatPlural(compOutcomes.length, 'výsledek', 'výsledky', 'výsledků')}</span>
                      </div>
                      <div class="block-competency-actions">
                        <button type="button" class="btn btn-sm btn-secondary" style="padding: 2px 7px; font-size: 0.72rem;" onclick="window.svpApp.openCompetencyOutcomesModal('${b.id}', '${compCode}')" title="Vybrat očekávané výsledky této kompetence">+ Výsledek</button>
                        <button type="button" class="btn-icon-only" style="padding: 2px 6px; font-size: 0.72rem; color: var(--danger-500);" onclick="window.svpApp.removeCompetency('${b.id}', '${compCode}')" title="Odebrat kompetenci i s výstupy">🗑</button>
                      </div>
                    </div>
                    <div class="competency-outcomes-list">
                      ${compOutcomes.length > 0 ? compOutcomes.map(code => {
                        const outObj = RVP_OUTCOMES.find(o => o.code === code);
                        return `
                          <div class="competency-outcome-row">
                            <div style="flex: 1; min-width: 0;">
                              <span class="code-badge" style="margin-right: 6px; font-size: 0.68rem;">${code}</span>
                              <span style="font-weight: 500;">${outObj ? outObj.title : code}</span>
                            </div>
                            <div style="display: flex; gap: 4px; align-items: center;">
                              <button type="button" class="btn-icon-only" style="padding: 2px 6px; font-size: 0.68rem;" onclick="window.svpApp.showOutcomeDetail('${code}')" title="Metodický detail a inspirace">ℹ️ Info</button>
                              <button type="button" class="btn-icon-only" style="padding: 2px 6px; font-size: 0.68rem; color: var(--danger-500);" onclick="window.svpApp.removeBlockOutcome('${b.id}', '${code}')" title="Odebrat výsledek">✕</button>
                            </div>
                          </div>
                        `;
                      }).join('') : `
                        <div class="competency-empty-warning">
                          <span>⚠️ K této kompetenci zatím není vybrán žádný konkrétní výsledek učení.</span>
                          <button type="button" class="btn btn-sm btn-primary" style="font-size: 0.72rem; padding: 2px 8px;" onclick="window.svpApp.openCompetencyOutcomesModal('${b.id}', '${compCode}')">+ Vybrat výsledek</button>
                        </div>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}

              ${(!b.competencies || b.competencies.length === 0) ? `
                <div style="font-size: 0.78rem; color: var(--text-light); font-style: italic; padding: 12px; text-align: center; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); background: var(--bg-card);">
                  Přetáhněte sem klíčovou kompetenci nebo konkrétní výsledek učení z levého katalogu, případně klikněte na „+ Přidat kompetenci“.
                </div>
              ` : ''}
            </div>
          </div>

          <!-- 4. Vzdělávací oblasti a jejich očekávané výsledky učení -->
          <div class="block-hierarchy-section" style="border-left: 3px solid #10b981;">
            <div class="block-hierarchy-header">
              <div class="block-hierarchy-title">
                <span>🎨 Vzdělávací oblasti a očekávané výsledky učení (RVP PV):</span>
                <span class="catalog-category-count" style="font-size: 0.72rem;">${formatPlural(areaCount, 'oblast', 'oblasti', 'oblastí')}</span>
              </div>
              <button type="button" class="btn btn-sm btn-secondary" style="font-size: 0.72rem; padding: 3px 8px;" onclick="window.svpApp.openAddAreaModal('${b.id}')">
                + Přidat oblast
              </button>
            </div>

            <div class="dropzone-container" data-dropzone="true" data-dropzone-accepts="area,outcome" data-block-id="${b.id}" data-dropzone-type="areas" style="min-height: 44px; display: flex; flex-direction: column; gap: 8px;">
              ${(b.areas || []).map(areaCode => {
                const area = RVP_AREAS[areaCode] || { name: areaCode, icon: '🎨', desc: '' };
                const areaOutcomes = (b.outcomes || []).filter(code => {
                  const outObj = RVP_OUTCOMES.find(o => o.code === code);
                  return outObj && outObj.category === areaCode;
                });
                return `
                  <div class="block-competency-card">
                    <div class="block-competency-header" style="background: rgba(16, 185, 129, 0.08);">
                      <div class="block-competency-name">
                        <span>${area.icon}</span>
                        <span>${area.name}</span>
                        <span class="code-badge" style="font-size: 0.68rem;">${areaCode}</span>
                        <span class="catalog-category-count" style="font-size: 0.68rem;">${formatPlural(areaOutcomes.length, 'výsledek', 'výsledky', 'výsledků')}</span>
                      </div>
                      <div class="block-competency-actions">
                        <button type="button" class="btn btn-sm btn-secondary" style="padding: 2px 7px; font-size: 0.72rem;" onclick="window.svpApp.openAreaOutcomesModal('${b.id}', '${areaCode}')" title="Vybrat očekávané výsledky této oblasti">+ Výsledek</button>
                        <button type="button" class="btn-icon-only" style="padding: 2px 6px; font-size: 0.72rem; color: var(--danger-500);" onclick="window.svpApp.removeArea('${b.id}', '${areaCode}')" title="Odebrat oblast i s výstupy">🗑</button>
                      </div>
                    </div>
                    <div class="competency-outcomes-list">
                      ${areaOutcomes.length > 0 ? areaOutcomes.map(code => {
                        const outObj = RVP_OUTCOMES.find(o => o.code === code);
                        return `
                          <div class="competency-outcome-row">
                            <div style="flex: 1; min-width: 0;">
                              <span class="code-badge" style="margin-right: 6px; font-size: 0.68rem;">${code}</span>
                              <span style="font-weight: 500;">${outObj ? outObj.title : code}</span>
                            </div>
                            <div style="display: flex; gap: 4px; align-items: center;">
                              <button type="button" class="btn-icon-only" style="padding: 2px 6px; font-size: 0.68rem;" onclick="window.svpApp.showOutcomeDetail('${code}')" title="Metodický detail a inspirace">ℹ️ Info</button>
                              <button type="button" class="btn-icon-only" style="padding: 2px 6px; font-size: 0.68rem; color: var(--danger-500);" onclick="window.svpApp.removeBlockOutcome('${b.id}', '${code}')" title="Odebrat výsledek">✕</button>
                            </div>
                          </div>
                        `;
                      }).join('') : `
                        <div class="competency-empty-warning">
                          <span>⚠️ K této vzdělávací oblasti zatím není vybrán žádný konkrétní výsledek učení.</span>
                          <button type="button" class="btn btn-sm btn-primary" style="font-size: 0.72rem; padding: 2px 8px;" onclick="window.svpApp.openAreaOutcomesModal('${b.id}', '${areaCode}')">+ Vybrat výsledek</button>
                        </div>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}

              ${(!b.areas || b.areas.length === 0) ? `
                <div style="font-size: 0.78rem; color: var(--text-light); font-style: italic; padding: 12px; text-align: center; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); background: var(--bg-card);">
                  Přetáhněte sem vzdělávací oblast nebo její výsledek učení z katalogu, případně klikněte na „+ Přidat oblast“.
                </div>
              ` : ''}
            </div>
          </div>

          <!-- 6. VZDĚLÁVACÍ NABÍDKA (Sjednocené činnosti a Centra aktivit) -->
          <div class="block-form-section" style="border-left: 3px solid var(--primary-500);">
            <div class="block-form-section-title" style="flex-wrap: wrap; gap: 8px;">
              <span>🎲 Vzdělávací nabídka:</span>
              <div class="offer-toggle-group">
                <button type="button" class="offer-toggle-btn ${currentOfferTab !== 'centers' ? 'is-active' : ''}" onclick="window.svpApp.setBlockOfferTab('${b.id}', 'activities')">
                  📋 Činnosti a hry (${actCount})
                </button>
                <button type="button" class="offer-toggle-btn ${currentOfferTab === 'centers' ? 'is-active' : ''}" onclick="window.svpApp.setBlockOfferTab('${b.id}', 'centers')">
                  🏢 Centra aktivit (${centersCount})
                </button>
              </div>
            </div>

            ${currentOfferTab !== 'centers' ? `
              <!-- A. JEDNOTLIVÉ ČINNOSTI -->
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 0.76rem; color: var(--text-muted);">Plánované pedagogické činnosti, hry a situace v tomto bloku:</span>
                  <button class="btn btn-sm btn-primary" style="font-size: 0.72rem; padding: 3px 8px;" onclick="window.svpApp.openAddActivityModal('${b.id}')">+ Přidat činnost</button>
                </div>
                <div class="dropzone-container" data-dropzone="true" data-dropzone-accepts="activity" data-block-id="${b.id}" data-dropzone-type="activities" style="background: transparent; border-style: solid; padding: 8px;">
                  ${(b.activities || []).map(act => `
                    <div class="activity-card" draggable="true" data-draggable="true" data-item-type="activity" data-item-id="${act.id}" data-source-block-id="${b.id}">
                      <div class="activity-header">
                        <span class="activity-title">${act.title}</span>
                        <div style="display: flex; gap: 6px; align-items: center;">
                          <span class="activity-type-badge">${act.type}</span>
                          <button class="btn-icon-only" style="padding: 2px 5px; font-size: 0.7rem; color: var(--danger-500);" onclick="window.svpApp.deleteActivity('${b.id}', '${act.id}')">✕</button>
                        </div>
                      </div>
                      ${act.desc ? `<div style="font-size: 0.8rem; color: var(--text-muted);">${act.desc}</div>` : ''}
                    </div>
                  `).join('') || '<span style="font-size: 0.78rem; color: var(--text-light); font-style: italic;">Zatím žádné činnosti. Klikněte na „+ Přidat činnost“.</span>'}
                </div>
              </div>
            ` : `
              <!-- B. CENTRA AKTIVIT -->
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 0.76rem; color: var(--text-muted);">Vzdělávací koutky a centra aktivit s diferenciací pro věk 2–7 let:</span>
                  <button class="btn btn-sm btn-primary" style="font-size: 0.72rem; padding: 3px 10px;" onclick="window.svpApp.addBlockCenter('${b.id}')">+ Přidat centrum</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  ${(b.centersOfActivity || []).map((c, cIdx) => `
                    <div class="center-card-editor">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <input type="text" class="form-input" style="font-weight: 700; font-size: 0.85rem; color: var(--primary-600); flex: 1; margin-right: 8px; padding: 6px 10px;" value="${c.center}" placeholder="Název centra (např. Centrum Věda a badatelna)..." onchange="window.svpApp.updateCenterField('${b.id}', ${cIdx}, 'center', this.value)">
                        <button class="btn-icon-only" style="color: var(--danger-500); font-size: 0.8rem; padding: 4px 8px;" onclick="window.svpApp.deleteBlockCenter('${b.id}', ${cIdx})" title="Odstranit centrum">✕</button>
                      </div>
                      <div class="center-card-age-list">
                        <div class="center-card-age-row">
                          <span class="center-card-age-label">👶 2–3 roky:</span>
                          <textarea class="form-textarea" placeholder="Činnosti pro mladší děti (smysly, adaptace)..." onchange="window.svpApp.updateCenterField('${b.id}', ${cIdx}, 'younger', this.value)">${c.younger || ''}</textarea>
                        </div>
                        <div class="center-card-age-row">
                          <span class="center-card-age-label">👦 4–5 let:</span>
                          <textarea class="form-textarea" placeholder="Činnosti pro střední věk (struktura, hry)..." onchange="window.svpApp.updateCenterField('${b.id}', ${cIdx}, 'middle', this.value)">${c.middle || ''}</textarea>
                        </div>
                        <div class="center-card-age-row">
                          <span class="center-card-age-label">🎓 6–7 let:</span>
                          <textarea class="form-textarea" placeholder="Činnosti pro předškoláky (bádání, algoritmizace, projekty)..." onchange="window.svpApp.updateCenterField('${b.id}', ${cIdx}, 'older', this.value)">${c.older || ''}</textarea>
                        </div>
                      </div>
                    </div>
                  `).join('') || '<div style="font-size: 0.8rem; color: var(--text-light); font-style: italic; padding: 6px 0;">Zatím nejsou přidána žádná centra aktivit. Klikněte na „+ Přidat centrum“.</div>'}
                </div>
              </div>
            `}
          </div>

          <!-- 6. Pedagogická diagnostika a dokládání pokroku (Portfolio) -->
          <div class="block-form-section">
            <div class="block-form-section-title">
              <span>📋 Pedagogická diagnostika a dokládání pokroku (Portfolio):</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
              <div>
                <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Pozorované projevy (záznamový arch):</label>
                <textarea class="form-textarea" style="min-height: 50px; font-size: 0.82rem;" placeholder="Co přesně učitel sleduje (1 položka na řádek)..." onchange="window.svpApp.updateBlockDiagnosticsObs('${b.id}', this.value)">${(b.diagnostics && b.diagnostics.observations ? b.diagnostics.observations.join('\n') : '')}</textarea>
              </div>
              <div>
                <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Konkrétní výstupy do portfolia dítěte:</label>
                <textarea class="form-textarea" style="min-height: 50px; font-size: 0.82rem;" placeholder="Co zakládáme do portfolia (1 položka na řádek)..." onchange="window.svpApp.updateBlockDiagnosticsPort('${b.id}', this.value)">${(b.diagnostics && b.diagnostics.portfolioItems ? b.diagnostics.portfolioItems.join('\n') : '')}</textarea>
              </div>
            </div>
          </div>

          <!-- 7. Digitální bezpečnost a zdravé návyky -->
          <div class="block-form-section">
            <div class="block-form-section-title">
              <span>🛡 Digitální bezpečnost a zdravé návyky:</span>
            </div>
            <textarea class="form-textarea" style="min-height: 45px; font-size: 0.85rem;" placeholder="Pravidla práce s technologiemi, oční hygiena, střídání s pohybem venku..." onchange="window.svpApp.updateBlockSafety('${b.id}', this.value)">${b.digitalSafety || ''}</textarea>
          </div>

          <!-- 8. Autoevaluace bloku (pro pedagogický tým) -->
          <div class="block-form-section">
            <div class="block-form-section-title">
              <span>🔍 Autoevaluační otázky bloku (pro pedagogický tým):</span>
            </div>
            <textarea class="form-textarea" style="min-height: 45px; font-size: 0.85rem;" placeholder="Otázky pro sebereflexi pedagogů a vyhodnocení úspěšnosti bloku (1 otázka na řádek)..." onchange="window.svpApp.updateBlockAutoeval('${b.id}', this.value)">${(b.autoevaluationQuestions ? b.autoevaluationQuestions.join('\n') : '')}</textarea>
          </div>
        </div>
      </div>
    `;
    }).join('');

    this.autoResizeAllTextareas();
    if (typeof dnd !== 'undefined' && dnd.init) {
      dnd.init();
    }
  }

  toggleBlockCollapse(blockId) {
    if (this.collapsedBlocks.has(blockId)) {
      this.collapsedBlocks.delete(blockId);
    } else {
      this.collapsedBlocks.add(blockId);
    }
    this.renderBlocksBuilder(store.getDoc());
  }

  toggleAllBlocks(expandAll) {
    const doc = store.getDoc();
    const blocks = doc.blocks || [];
    if (expandAll) {
      this.collapsedBlocks.clear();
    } else {
      blocks.forEach(b => this.collapsedBlocks.add(b.id));
    }
    this.renderBlocksBuilder(doc);
  }

  renderCatalogItems() {
    const itemsContainer = document.getElementById('builder-catalog-items');
    if (!itemsContainer) return;

    let catalogHtml = '';
    const q = (this.catalogSearchQuery || '').toLowerCase().trim();
    const doc = store.getDoc();
    const blocks = doc.blocks || [];

    // Helper to count usage across blocks
    const getUsage = (type, code) => {
      if (type === 'competency') {
        return blocks.filter(b => (b.competencies || []).includes(code)).length;
      }
      if (type === 'literacy') {
        return blocks.filter(b => (b.literacies || []).includes(code)).length;
      }
      if (type === 'area') {
        return blocks.filter(b => (b.areas || []).includes(code)).length;
      }
      if (type === 'outcome') {
        return blocks.filter(b => (b.outcomes || []).includes(code)).length;
      }
      return 0;
    };

    // Helper to render usage badge with recommendations
    const renderUsageBadge = (usage) => {
      if (usage === 0) {
        return `<span class="usage-badge usage-none" title="Doposud nepoužito v žádném bloku. Doporučeno zařadit do ŠVP!">🔴 0× (Doporučeno přidat)</span>`;
      } else if (usage >= 4) {
        return `<span class="usage-badge usage-overused" title="Použito v ${usage} blocích. Zvažte, zda není použití nadměrné či duplicitní.">🟠 ${usage}× (Časté / Zvážit)</span>`;
      } else {
        return `<span class="usage-badge usage-good" title="Použito v ${usage} ${usage === 1 ? 'bloku' : 'blocích'} (vyvážené pokrytí).">🟢 ${usage}×</span>`;
      }
    };

    // Helper to render neutral usage count without color indicator or recommendations (for literacies and areas)
    const renderNeutralUsageCount = (usage) => {
      return `<span class="usage-badge usage-neutral" title="Přiřazeno v ${usage} ${usage === 1 ? 'bloku' : 'blocích'}">${formatBlocks(usage)}</span>`;
    };

    // Filter by usage
    const matchesUsageFilter = (usage, itemType) => {
      if (['literacy', 'area'].includes(itemType)) return true;
      if (this.catalogUsageFilter === 'UNUSED') return usage === 0;
      if (this.catalogUsageFilter === 'BALANCED') return usage >= 1 && usage <= 3;
      if (this.catalogUsageFilter === 'FREQUENT') return usage >= 4;
      return true;
    };

    // Helper to render an accordion category block
    const renderCategory = (catKey, icon, title, items, itemType, renderItemFn) => {
      const matchingItems = items.filter(item => {
        const usage = getUsage(itemType, item.code);
        if (!matchesUsageFilter(usage, itemType)) return false;
        if (!q) return true;
        return (item.name || item.title || '').toLowerCase().includes(q) || (item.code || '').toLowerCase().includes(q);
      });

      if (matchingItems.length === 0 && (q || this.catalogUsageFilter !== 'ALL')) return;

      const isCollapsed = this.collapsedCatalogCategories.has(catKey) && !q && this.catalogUsageFilter === 'ALL';
      let itemsHtml = '';
      matchingItems.forEach(item => {
        const usage = getUsage(itemType, item.code);
        itemsHtml += renderItemFn(item, usage);
      });

      catalogHtml += `
        <div class="catalog-category-section ${isCollapsed ? 'is-collapsed' : ''}" id="cat-section-${catKey}">
          <div class="catalog-category-header" onclick="window.svpApp.toggleCatalogCategory('${catKey}')">
            <div style="display: flex; align-items: center;">
              <span>${icon} ${title}</span>
              <span class="catalog-category-count">${matchingItems.length}</span>
            </div>
            <span class="catalog-category-toggle">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </span>
          </div>
          <div class="catalog-category-body">
            ${itemsHtml}
          </div>
        </div>
      `;
    };

    // 1. Klíčové kompetence (s rozpadem na oficiální očekávané výsledky učení KK)
    if (['ALL', 'COMPETENCIES'].includes(this.catalogCategoryFilter)) {
      const compEntries = Object.entries(RVP_COMPETENCIES);
      const filteredComps = compEntries.filter(([code, comp]) => {
        const compOutcomes = RVP_OUTCOMES.filter(o => o.category === code);
        const compUsage = getUsage('competency', code);
        const compMatchesFilter = matchesUsageFilter(compUsage, 'competency');
        const anyOutcomeMatchesFilter = compOutcomes.some(o => matchesUsageFilter(getUsage('outcome', o.code), 'outcome'));
        if (!compMatchesFilter && !anyOutcomeMatchesFilter) return false;

        if (!q) return true;
        const compMatchesQuery = (comp.name || '').toLowerCase().includes(q) || code.toLowerCase().includes(q) || (comp.desc || '').toLowerCase().includes(q);
        const outcomeMatchesQuery = compOutcomes.some(o => (o.title || '').toLowerCase().includes(q) || o.code.toLowerCase().includes(q));
        return compMatchesQuery || outcomeMatchesQuery;
      });

      if (filteredComps.length > 0 || (!q && this.catalogUsageFilter === 'ALL')) {
        const isCatCollapsed = this.collapsedCatalogCategories.has('comp') && !q && this.catalogUsageFilter === 'ALL';
        let compsHtml = '';

        filteredComps.forEach(([code, comp]) => {
          const compUsage = getUsage('competency', code);
          const allOutcomes = RVP_OUTCOMES.filter(o => o.category === code);
          const matchingOutcomes = allOutcomes.filter(out => {
            const outUsage = getUsage('outcome', out.code);
            if (!matchesUsageFilter(outUsage, 'outcome')) return false;
            if (!q) return true;
            return (out.title || '').toLowerCase().includes(q) || out.code.toLowerCase().includes(q) || (comp.name || '').toLowerCase().includes(q);
          });

          const isExpanded = this.expandedCatalogCompetencies.has(code) || (q && matchingOutcomes.length > 0);

          compsHtml += `
            <div style="margin-bottom: 6px;">
              <div class="catalog-competency-header draggable-item" draggable="true" data-draggable="true" data-item-type="competency" data-item-id="${code}" title="${comp.desc}" style="display: flex; align-items: center; gap: 6px; padding: 6px 8px;">
                <span class="draggable-handle">⋮⋮</span>
                <span style="font-size: 1rem;">${comp.icon}</span>
                <div style="flex: 1; min-width: 0;" onclick="event.stopPropagation(); window.svpApp.toggleCatalogCompetencyExpanded('${code}')">
                  <div style="font-weight: 600; font-size: 0.78rem; line-height: 1.3;">${comp.name}</div>
                  <div style="display: flex; gap: 4px; align-items: center; margin-top: 2px;">
                    <span class="code-badge" style="font-size: 0.65rem;">${code}</span>
                    ${renderUsageBadge(compUsage)}
                    <span style="font-size: 0.67rem; color: var(--primary-600); font-weight: 600;">
                      ${isExpanded ? '▲ Sbalit' : '▼ ' + allOutcomes.length + ' výstupů'}
                    </span>
                  </div>
                </div>
                <div style="display: flex; gap: 3px; align-items: center;" onclick="event.stopPropagation()">
                  <button class="btn-icon-only" style="padding: 2px 6px; font-size: 0.66rem; background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-sm);" title="Přiřadit kompetenci do bloku" onclick="window.svpApp.promptAssignItem('competency', '${code}')">+ Blok</button>
                  <button class="btn-icon-only" style="padding: 2px 5px; font-size: 0.66rem;" onclick="window.svpApp.toggleCatalogCompetencyExpanded('${code}')" title="${isExpanded ? 'Sbalit výsledky' : 'Rozbalit výsledky'}">${isExpanded ? '▲' : '▼'}</button>
                </div>
              </div>

              ${isExpanded ? `
                <div class="catalog-nested-outcomes">
                  ${matchingOutcomes.map(out => {
                    const outUsage = getUsage('outcome', out.code);
                    return `
                      <div class="catalog-outcome-item draggable-item" draggable="true" data-draggable="true" data-item-type="outcome" data-item-id="${out.code}" title="${out.title}">
                        <div style="display: flex; align-items: flex-start; gap: 6px;">
                          <span class="draggable-handle" style="padding-top: 2px;">⋮⋮</span>
                          <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 0.74rem; font-weight: 600; line-height: 1.35; color: var(--text-main);">${out.title}</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; align-items: center;">
                              <span class="code-badge" style="font-size: 0.64rem;">${out.code}</span>
                              ${renderUsageBadge(outUsage)}
                              <button class="btn-icon-only" style="padding: 1px 4px; font-size: 0.62rem;" onclick="event.stopPropagation(); window.svpApp.showOutcomeDetail('${out.code}')" title="Metodický komentář RVP PV">ℹ️</button>
                            </div>
                          </div>
                          <button class="btn-icon-only" style="padding: 2px 5px; font-size: 0.64rem; background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-sm); align-self: center;" title="Přiřadit výsledek do bloku" onclick="event.stopPropagation(); window.svpApp.promptAssignItem('outcome', '${out.code}')">+ Blok</button>
                        </div>
                      </div>
                    `;
                  }).join('')}
                  ${matchingOutcomes.length === 0 ? `<div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic; padding: 4px 6px;">Žádné odpovídající výstupy pro filtr.</div>` : ''}
                </div>
              ` : ''}
            </div>
          `;
        });

        catalogHtml += `
          <div class="catalog-category-section ${isCatCollapsed ? 'is-collapsed' : ''}" id="cat-section-comp">
            <div class="catalog-category-header" onclick="window.svpApp.toggleCatalogCategory('comp')">
              <div style="display: flex; align-items: center;">
                <span>🧠 Klíčové kompetence (s OVU)</span>
                <span class="catalog-category-count">${filteredComps.length}</span>
              </div>
              <span class="catalog-category-toggle">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </div>
            <div class="catalog-category-body">
              ${compsHtml}
            </div>
          </div>
        `;
      }
    }

    // 2. Vzdělávací oblasti (s rozpadem na konkrétní výsledky učení dle oblastí)
    if (['ALL', 'DJT', 'DJP', 'DDS', 'DAS'].includes(this.catalogCategoryFilter)) {
      const areaEntries = Object.entries(RVP_AREAS).filter(([code]) => this.catalogCategoryFilter === 'ALL' || this.catalogCategoryFilter === code);
      const filteredAreas = areaEntries.filter(([code, area]) => {
        const areaOutcomes = RVP_OUTCOMES.filter(o => o.category === code);
        const areaUsage = getUsage('area', code);
        const areaMatchesFilter = matchesUsageFilter(areaUsage, 'area');
        const anyOutcomeMatchesFilter = areaOutcomes.some(o => matchesUsageFilter(getUsage('outcome', o.code), 'outcome'));
        if (!areaMatchesFilter && !anyOutcomeMatchesFilter) return false;

        if (!q) return true;
        const areaMatchesQuery = (area.name || '').toLowerCase().includes(q) || code.toLowerCase().includes(q) || (area.desc || '').toLowerCase().includes(q);
        const outcomeMatchesQuery = areaOutcomes.some(o => (o.title || '').toLowerCase().includes(q) || o.code.toLowerCase().includes(q));
        return areaMatchesQuery || outcomeMatchesQuery;
      });

      if (filteredAreas.length > 0 || (!q && this.catalogUsageFilter === 'ALL')) {
        const isCatCollapsed = this.collapsedCatalogCategories.has('areas') && !q && this.catalogUsageFilter === 'ALL';
        let areasHtml = '';

        filteredAreas.forEach(([code, area]) => {
          const areaUsage = getUsage('area', code);
          const allOutcomes = RVP_OUTCOMES.filter(o => o.category === code);
          const matchingOutcomes = allOutcomes.filter(out => {
            const outUsage = getUsage('outcome', out.code);
            if (!matchesUsageFilter(outUsage, 'outcome')) return false;
            if (!q) return true;
            return (out.title || '').toLowerCase().includes(q) || out.code.toLowerCase().includes(q) || (area.name || '').toLowerCase().includes(q);
          });

          const isExpanded = this.expandedCatalogAreas.has(code) || (q && matchingOutcomes.length > 0);

          areasHtml += `
            <div style="margin-bottom: 6px;">
              <div class="catalog-competency-header draggable-item" draggable="true" data-draggable="true" data-item-type="area" data-item-id="${code}" title="${area.desc}" style="display: flex; align-items: center; gap: 6px; padding: 6px 8px;">
                <span class="draggable-handle">⋮⋮</span>
                <span style="font-size: 1rem;">${area.icon}</span>
                <div style="flex: 1; min-width: 0;" onclick="event.stopPropagation(); window.svpApp.toggleCatalogAreaExpanded('${code}')">
                  <div style="font-weight: 600; font-size: 0.78rem; line-height: 1.3;">${area.name}</div>
                  <div style="display: flex; gap: 4px; align-items: center; margin-top: 2px;">
                    <span class="code-badge" style="font-size: 0.65rem;">${code}</span>
                    ${renderNeutralUsageCount(areaUsage)}
                    <span style="font-size: 0.67rem; color: #10b981; font-weight: 600;">
                      ${isExpanded ? '▲ Sbalit' : '▼ ' + allOutcomes.length + ' výstupů'}
                    </span>
                  </div>
                </div>
                <div style="display: flex; gap: 3px; align-items: center;" onclick="event.stopPropagation()">
                  <button class="btn-icon-only" style="padding: 2px 6px; font-size: 0.66rem; background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-sm);" title="Přiřadit oblast do bloku" onclick="window.svpApp.promptAssignItem('area', '${code}')">+ Blok</button>
                  <button class="btn-icon-only" style="padding: 2px 5px; font-size: 0.66rem;" onclick="window.svpApp.toggleCatalogAreaExpanded('${code}')" title="${isExpanded ? 'Sbalit výsledky' : 'Rozbalit výsledky'}">${isExpanded ? '▲' : '▼'}</button>
                </div>
              </div>

              ${isExpanded ? `
                <div class="catalog-nested-outcomes">
                  ${matchingOutcomes.map(out => {
                    const outUsage = getUsage('outcome', out.code);
                    return `
                      <div class="catalog-outcome-item draggable-item" draggable="true" data-draggable="true" data-item-type="outcome" data-item-id="${out.code}" title="${out.title}">
                        <div style="display: flex; align-items: flex-start; gap: 6px;">
                          <span class="draggable-handle" style="padding-top: 2px;">⋮⋮</span>
                          <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 0.74rem; font-weight: 600; line-height: 1.35; color: var(--text-main);">${out.title}</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; align-items: center;">
                              <span class="code-badge" style="font-size: 0.64rem;">${out.code}</span>
                              ${renderUsageBadge(outUsage)}
                              <button class="btn-icon-only" style="padding: 1px 4px; font-size: 0.62rem;" onclick="event.stopPropagation(); window.svpApp.showOutcomeDetail('${out.code}')" title="Metodický komentář RVP PV">ℹ️</button>
                            </div>
                          </div>
                          <button class="btn-icon-only" style="padding: 2px 5px; font-size: 0.64rem; background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-sm); align-self: center;" title="Přiřadit výsledek do bloku" onclick="event.stopPropagation(); window.svpApp.promptAssignItem('outcome', '${out.code}')">+ Blok</button>
                        </div>
                      </div>
                    `;
                  }).join('')}
                  ${matchingOutcomes.length === 0 ? `<div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic; padding: 4px 6px;">Žádné odpovídající výstupy pro filtr.</div>` : ''}
                </div>
              ` : ''}
            </div>
          `;
        });

        catalogHtml += `
          <div class="catalog-category-section ${isCatCollapsed ? 'is-collapsed' : ''}" id="cat-section-areas">
            <div class="catalog-category-header" onclick="window.svpApp.toggleCatalogCategory('areas')">
              <div style="display: flex; align-items: center;">
                <span>🎨 Vzdělávací oblasti (s OVU)</span>
                <span class="catalog-category-count">${filteredAreas.length}</span>
              </div>
              <span class="catalog-category-toggle">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </div>
            <div class="catalog-category-body">
              ${areasHtml}
            </div>
          </div>
        `;
      }
    }

    // 3. Základní gramotnosti
    if (['ALL', 'LITERACIES'].includes(this.catalogCategoryFilter)) {
      const litList = Object.entries(RVP_LITERACIES).map(([code, lit]) => ({ code, ...lit }));
      const matchingLits = litList.filter(lit => {
        if (!q) return true;
        return (lit.name || '').toLowerCase().includes(q) || lit.code.toLowerCase().includes(q);
      });

      if (matchingLits.length > 0) {
        const isCatCollapsed = this.collapsedCatalogCategories.has('lit') && !q;
        let litsHtml = '';
        matchingLits.forEach(lit => {
          const usage = getUsage('literacy', lit.code);
          litsHtml += `
            <div class="draggable-item" draggable="true" data-draggable="true" data-item-type="literacy" data-item-id="${lit.code}" title="${lit.desc}">
              <span class="draggable-handle">⋮⋮</span>
              <span>${lit.icon}</span>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; font-size: 0.8rem; line-height: 1.35;">${lit.name}</div>
                <div style="display: flex; gap: 4px; align-items: center; margin-top: 2px;">
                  <span class="code-badge">${lit.code}</span>
                  ${renderNeutralUsageCount(usage)}
                </div>
              </div>
              <button class="btn-icon-only" style="padding: 2px 6px; font-size: 0.68rem; background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-sm);" title="Přiřadit do bloku" onclick="event.stopPropagation(); window.svpApp.promptAssignItem('literacy', '${lit.code}')">+ Blok</button>
            </div>
          `;
        });

        catalogHtml += `
          <div class="catalog-category-section ${isCatCollapsed ? 'is-collapsed' : ''}" id="cat-section-lit">
            <div class="catalog-category-header" onclick="window.svpApp.toggleCatalogCategory('lit')">
              <div style="display: flex; align-items: center;">
                <span>📖 Základní gramotnosti</span>
                <span class="catalog-category-count">${matchingLits.length}</span>
              </div>
              <span class="catalog-category-toggle">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </div>
            <div class="catalog-category-body">
              ${litsHtml}
            </div>
          </div>
        `;
      }
    }

    if (!catalogHtml) {
      catalogHtml = `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 12px 6px; font-style: italic;">Nenalezeny žádné položky odpovídající hledání či filtru.</div>`;
    }

    itemsContainer.innerHTML = catalogHtml;
  }

  toggleCatalogCategory(catKey) {
    if (this.collapsedCatalogCategories.has(catKey)) {
      this.collapsedCatalogCategories.delete(catKey);
    } else {
      this.collapsedCatalogCategories.add(catKey);
    }
    this.renderCatalogItems();
  }

  toggleAllCatalogCategories(expandAll) {
    if (expandAll) {
      this.collapsedCatalogCategories.clear();
      Object.keys(RVP_COMPETENCIES).forEach(c => this.expandedCatalogCompetencies.add(c));
      Object.keys(RVP_AREAS).forEach(a => this.expandedCatalogAreas.add(a));
    } else {
      ['comp', 'lit', 'areas'].forEach(k => {
        this.collapsedCatalogCategories.add(k);
      });
      this.expandedCatalogCompetencies.clear();
      this.expandedCatalogAreas.clear();
    }
    this.renderCatalogItems();
    dnd.init();
  }

  updateBlockTitle(blockId, title) {
    store.updateBlock(blockId, { title });
  }

  updateBlockTime(blockId, timeFrame) {
    store.updateBlock(blockId, { timeFrame });
  }

  updateBlockPurpose(blockId, purpose) {
    store.updateBlock(blockId, { purpose });
  }

  updateBlockImpulse(blockId, value) {
    store.updateBlock(blockId, { situationalImpulse: value });
  }

  updateBlockSafety(blockId, value) {
    store.updateBlock(blockId, { digitalSafety: value });
  }

  updateBlockDiagnosticsObs(blockId, text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const block = store.getDoc().blocks.find(b => b.id === blockId);
    const diagnostics = { ...(block && block.diagnostics ? block.diagnostics : {}), observations: lines };
    store.updateBlock(blockId, { diagnostics });
  }

  updateBlockDiagnosticsPort(blockId, text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const block = store.getDoc().blocks.find(b => b.id === blockId);
    const diagnostics = { ...(block && block.diagnostics ? block.diagnostics : {}), portfolioItems: lines };
    store.updateBlock(blockId, { diagnostics });
  }

  updateBlockAutoeval(blockId, text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    store.updateBlock(blockId, { autoevaluationQuestions: lines });
  }

  updateCenterField(blockId, centerIdx, field, value) {
    const block = store.getDoc().blocks.find(b => b.id === blockId);
    if (!block || !block.centersOfActivity) return;
    const centers = [...block.centersOfActivity];
    if (centers[centerIdx]) {
      centers[centerIdx] = { ...centers[centerIdx], [field]: value };
      store.updateBlock(blockId, { centersOfActivity: centers });
    }
  }

  setBlockOfferTab(blockId, tab) {
    this.blockOfferTabs.set(blockId, tab);
    const doc = store.getDoc();
    this.renderBlocksBuilder(doc);
    dnd.init();
  }

  addBlockCenter(blockId) {
    const block = store.getDoc().blocks.find(b => b.id === blockId);
    if (!block) return;
    const centers = [...(block.centersOfActivity || [])];
    centers.push({
      center: 'Nové centrum aktivit',
      younger: '',
      middle: '',
      older: ''
    });
    store.updateBlock(blockId, { centersOfActivity: centers });
    this.blockOfferTabs.set(blockId, 'centers');
    this.renderBlocksBuilder(store.getDoc());
    dnd.init();
  }

  deleteBlockCenter(blockId, centerIdx) {
    const block = store.getDoc().blocks.find(b => b.id === blockId);
    if (!block || !block.centersOfActivity) return;
    const centers = [...block.centersOfActivity];
    centers.splice(centerIdx, 1);
    store.updateBlock(blockId, { centersOfActivity: centers });
    this.renderBlocksBuilder(store.getDoc());
  }

  toggleBlockComp(blockId, code) {
    store.toggleBlockCompetency(blockId, code);
    this.render();
  }

  toggleBlockLit(blockId, code) {
    store.toggleBlockLiteracy(blockId, code);
    this.render();
  }

  toggleBlockArea(blockId, code) {
    store.toggleBlockArea(blockId, code);
    this.render();
  }

  toggleBlockOutcome(blockId, code) {
    store.toggleBlockOutcome(blockId, code);
    this.render();
  }

  removeCompetency(blockId, compCode) {
    const doc = store.getDoc();
    const block = doc.blocks?.find(b => b.id === blockId);
    if (!block) return;
    const compOutcomes = (block.outcomes || []).filter(code => {
      const outObj = RVP_OUTCOMES.find(o => o.code === code);
      return outObj && outObj.category === compCode;
    });

    if (compOutcomes.length > 0) {
      if (confirm(`Odebráním této kompetence bude z bloku odstraněno i ${compOutcomes.length} navázaných výsledků učení. Chcete pokračovat?`)) {
        store.removeCompetencyWithOutcomes(blockId, compCode);
        this.showToast('Kompetence i navázané výstupy byly odebrány');
        this.render();
      }
    } else {
      store.removeCompetencyWithOutcomes(blockId, compCode);
      this.showToast('Kompetence byla odebrána');
      this.render();
    }
  }

  removeArea(blockId, areaCode) {
    const doc = store.getDoc();
    const block = doc.blocks?.find(b => b.id === blockId);
    if (!block) return;
    const areaOutcomes = (block.outcomes || []).filter(code => {
      const outObj = RVP_OUTCOMES.find(o => o.code === code);
      return outObj && outObj.category === areaCode;
    });

    if (areaOutcomes.length > 0) {
      if (confirm(`Odebráním této oblasti bude z bloku odstraněno i ${areaOutcomes.length} navázaných výstupů. Chcete pokračovat?`)) {
        store.removeAreaWithOutcomes(blockId, areaCode);
        this.showToast('Oblast i navázané výstupy byly odebrány');
        this.render();
      }
    } else {
      store.removeAreaWithOutcomes(blockId, areaCode);
      this.showToast('Oblast byla odebrána');
      this.render();
    }
  }

  removeBlockOutcome(blockId, code) {
    store.removeBlockOutcome(blockId, code);
    this.render();
  }

  openAddCompetencyModal(blockId) {
    const doc = store.getDoc();
    const block = doc.blocks?.find(b => b.id === blockId);
    if (!block) return;

    const modal = document.getElementById('item-picker-modal');
    const titleEl = document.getElementById('item-picker-modal-title');
    const descEl = document.getElementById('item-picker-modal-desc');
    const listEl = document.getElementById('item-picker-modal-list');
    const badgeEl = document.getElementById('item-picker-count-badge');
    if (!modal || !listEl) return;

    titleEl.innerHTML = '🧠 Rozvíjené klíčové kompetence (RVP PV)';
    descEl.textContent = 'Zvolte klíčové kompetence, které budou v tomto integrovaném bloku rozvíjeny:';

    const currentComps = block.competencies || [];
    badgeEl.textContent = `Přiřazeno: ${currentComps.length} z 8`;

    const scrollPos = listEl.scrollTop;

    listEl.innerHTML = Object.entries(RVP_COMPETENCIES).map(([code, comp]) => {
      const isSelected = currentComps.includes(code);
      const compOutcomesCount = (block.outcomes || []).filter(c => {
        const o = RVP_OUTCOMES.find(x => x.code === c);
        return o && o.category === code;
      }).length;
      return `
        <div class="picker-item-row ${isSelected ? 'is-selected' : ''}" onclick="window.svpApp.toggleBlockCompAndRefreshPicker('${blockId}', '${code}')">
          <input type="checkbox" ${isSelected ? 'checked' : ''} style="margin-top: 3px; pointer-events: none;">
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
              <span>${comp.icon} ${comp.name}</span>
              <span class="code-badge">${code}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 3px;">${comp.desc}</div>
            ${isSelected ? `<div style="font-size: 0.74rem; color: var(--primary-600); font-weight: 600; margin-top: 4px;">✓ V bloku přiřazeno: ${formatPlural(compOutcomesCount, 'výsledek', 'výsledky', 'výsledků')} učení</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    listEl.scrollTop = scrollPos;
    modal.classList.add('active');
  }

  openAddAreaModal(blockId) {
    const doc = store.getDoc();
    const block = doc.blocks?.find(b => b.id === blockId);
    if (!block) return;

    const modal = document.getElementById('item-picker-modal');
    const titleEl = document.getElementById('item-picker-modal-title');
    const descEl = document.getElementById('item-picker-modal-desc');
    const listEl = document.getElementById('item-picker-modal-list');
    const badgeEl = document.getElementById('item-picker-count-badge');
    if (!modal || !listEl) return;

    titleEl.innerHTML = '🎨 Vzdělávací oblasti (RVP PV)';
    descEl.textContent = 'Zvolte vzdělávací oblasti, jejichž obsah a výstupy blok integruje:';

    const currentAreas = block.areas || [];
    badgeEl.textContent = `Přiřazeno: ${currentAreas.length} ze 4`;

    const scrollPos = listEl.scrollTop;

    listEl.innerHTML = Object.entries(RVP_AREAS).map(([code, area]) => {
      const isSelected = currentAreas.includes(code);
      const areaOutcomesCount = (block.outcomes || []).filter(c => {
        const o = RVP_OUTCOMES.find(x => x.code === c);
        return o && o.category === code;
      }).length;
      return `
        <div class="picker-item-row ${isSelected ? 'is-selected' : ''}" onclick="window.svpApp.toggleBlockAreaAndRefreshPicker('${blockId}', '${code}')">
          <input type="checkbox" ${isSelected ? 'checked' : ''} style="margin-top: 3px; pointer-events: none;">
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
              <span>${area.icon} ${area.name}</span>
              <span class="code-badge">${code}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 3px;">${area.desc}</div>
            ${isSelected ? `<div style="font-size: 0.74rem; color: #10b981; font-weight: 600; margin-top: 4px;">✓ V bloku přiřazeno: ${formatPlural(areaOutcomesCount, 'výsledek', 'výsledky', 'výsledků')}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    listEl.scrollTop = scrollPos;
    modal.classList.add('active');
  }

  openCompetencyOutcomesModal(blockId, compCode) {
    const doc = store.getDoc();
    const block = doc.blocks?.find(b => b.id === blockId);
    if (!block) return;
    const comp = RVP_COMPETENCIES[compCode];
    if (!comp) return;

    const modal = document.getElementById('item-picker-modal');
    const titleEl = document.getElementById('item-picker-modal-title');
    const descEl = document.getElementById('item-picker-modal-desc');
    const listEl = document.getElementById('item-picker-modal-list');
    const badgeEl = document.getElementById('item-picker-count-badge');
    if (!modal || !listEl) return;

    const allCompOutcomes = RVP_OUTCOMES.filter(o => o.category === compCode);
    const blockOutcomes = block.outcomes || [];
    const selectedCount = allCompOutcomes.filter(o => blockOutcomes.includes(o.code)).length;

    titleEl.innerHTML = `${comp.icon} Očekávané výsledky: ${comp.name} (${compCode})`;
    descEl.textContent = `Zvolte konkrétní očekávané výsledky učení z RVP PV náležející k této klíčové kompetenci:`;
    badgeEl.textContent = `Vybráno: ${selectedCount} z ${allCompOutcomes.length}`;

    const scrollPos = listEl.scrollTop;

    listEl.innerHTML = allCompOutcomes.map(out => {
      const isSelected = blockOutcomes.includes(out.code);
      return `
        <div class="picker-item-row ${isSelected ? 'is-selected' : ''}" onclick="window.svpApp.toggleBlockOutcomeAndRefreshPicker('${blockId}', '${out.code}', '${compCode}', 'competency')">
          <input type="checkbox" ${isSelected ? 'checked' : ''} style="margin-top: 3px; pointer-events: none;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
              <span class="code-badge">${out.code}</span>
              <span style="font-size: 0.72rem; color: var(--text-light);">Strana ${out.page}</span>
            </div>
            <div style="font-size: 0.84rem; font-weight: 600; color: var(--text-main);">${out.title}</div>
            ${out.comment ? `<div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">${out.comment.slice(0, 160)}...</div>` : ''}
          </div>
          <button class="btn-icon-only" style="padding: 2px 6px; font-size: 0.7rem;" onclick="event.stopPropagation(); window.svpApp.showOutcomeDetail('${out.code}')" title="Metodický detail a inspirace">ℹ️ Info</button>
        </div>
      `;
    }).join('');

    listEl.scrollTop = scrollPos;
    modal.classList.add('active');
  }

  openAreaOutcomesModal(blockId, areaCode) {
    const doc = store.getDoc();
    const block = doc.blocks?.find(b => b.id === blockId);
    if (!block) return;
    const area = RVP_AREAS[areaCode];
    if (!area) return;

    const modal = document.getElementById('item-picker-modal');
    const titleEl = document.getElementById('item-picker-modal-title');
    const descEl = document.getElementById('item-picker-modal-desc');
    const listEl = document.getElementById('item-picker-modal-list');
    const badgeEl = document.getElementById('item-picker-count-badge');
    if (!modal || !listEl) return;

    const allAreaOutcomes = RVP_OUTCOMES.filter(o => o.category === areaCode);
    const blockOutcomes = block.outcomes || [];
    const selectedCount = allAreaOutcomes.filter(o => blockOutcomes.includes(o.code)).length;

    titleEl.innerHTML = `${area.icon} Očekávané výsledky: ${area.name} (${areaCode})`;
    descEl.textContent = `Zvolte konkrétní očekávané výsledky učení z RVP PV náležející k této vzdělávací oblasti:`;
    badgeEl.textContent = `Vybráno: ${selectedCount} z ${allAreaOutcomes.length}`;

    const scrollPos = listEl.scrollTop;

    listEl.innerHTML = allAreaOutcomes.map(out => {
      const isSelected = blockOutcomes.includes(out.code);
      return `
        <div class="picker-item-row ${isSelected ? 'is-selected' : ''}" onclick="window.svpApp.toggleBlockOutcomeAndRefreshPicker('${blockId}', '${out.code}', '${areaCode}', 'area')">
          <input type="checkbox" ${isSelected ? 'checked' : ''} style="margin-top: 3px; pointer-events: none;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
              <span class="code-badge">${out.code}</span>
              <span style="font-size: 0.72rem; color: var(--text-light);">Strana ${out.page}</span>
            </div>
            <div style="font-size: 0.84rem; font-weight: 600; color: var(--text-main);">${out.title}</div>
            ${out.comment ? `<div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">${out.comment.slice(0, 160)}...</div>` : ''}
          </div>
          <button class="btn-icon-only" style="padding: 2px 6px; font-size: 0.7rem;" onclick="event.stopPropagation(); window.svpApp.showOutcomeDetail('${out.code}')" title="Metodický detail a inspirace">ℹ️ Info</button>
        </div>
      `;
    }).join('');

    listEl.scrollTop = scrollPos;
    modal.classList.add('active');
  }

  toggleBlockCompAndRefreshPicker(blockId, compCode) {
    const doc = store.getDoc();
    const block = doc.blocks?.find(b => b.id === blockId);
    if (!block) return;
    const isSelected = (block.competencies || []).includes(compCode);

    if (isSelected) {
      const compOutcomes = (block.outcomes || []).filter(c => {
        const o = RVP_OUTCOMES.find(x => x.code === c);
        return o && o.category === compCode;
      });
      if (compOutcomes.length > 0) {
        if (!confirm(`Odebráním kompetence ${compCode} budou z bloku odebrány i ${compOutcomes.length} navázané výsledky učení. Chcete pokračovat?`)) {
          return;
        }
      }
      store.removeCompetencyWithOutcomes(blockId, compCode);
    } else {
      store.toggleBlockCompetency(blockId, compCode);
    }
    this.openAddCompetencyModal(blockId);
  }

  toggleBlockAreaAndRefreshPicker(blockId, areaCode) {
    const doc = store.getDoc();
    const block = doc.blocks?.find(b => b.id === blockId);
    if (!block) return;
    const isSelected = (block.areas || []).includes(areaCode);

    if (isSelected) {
      const areaOutcomes = (block.outcomes || []).filter(c => {
        const o = RVP_OUTCOMES.find(x => x.code === c);
        return o && o.category === areaCode;
      });
      if (areaOutcomes.length > 0) {
        if (!confirm(`Odebráním oblasti ${areaCode} budou z bloku odebrány i ${areaOutcomes.length} navázané výstupy. Chcete pokračovat?`)) {
          return;
        }
      }
      store.removeAreaWithOutcomes(blockId, areaCode);
    } else {
      store.toggleBlockArea(blockId, areaCode);
    }
    this.openAddAreaModal(blockId);
  }

  toggleBlockOutcomeAndRefreshPicker(blockId, outcomeCode, parentCode, type) {
    store.toggleBlockOutcome(blockId, outcomeCode);
    if (type === 'competency') {
      this.openCompetencyOutcomesModal(blockId, parentCode);
    } else {
      this.openAreaOutcomesModal(blockId, parentCode);
    }
  }

  toggleCatalogCompetencyExpanded(compCode) {
    if (this.expandedCatalogCompetencies.has(compCode)) {
      this.expandedCatalogCompetencies.delete(compCode);
    } else {
      this.expandedCatalogCompetencies.add(compCode);
    }
    this.renderCatalogItems();
    dnd.init();
  }

  toggleCatalogAreaExpanded(areaCode) {
    if (this.expandedCatalogAreas.has(areaCode)) {
      this.expandedCatalogAreas.delete(areaCode);
    } else {
      this.expandedCatalogAreas.add(areaCode);
    }
    this.renderCatalogItems();
    dnd.init();
  }

  deleteBlock(blockId) {
    if (confirm('Opravdu chcete smazat tento integrovaný blok?')) {
      store.deleteBlock(blockId);
      this.showToast('Integrovaný blok byl smazán');
      this.render();
    }
  }

  deleteActivity(blockId, actId) {
    store.deleteActivity(blockId, actId);
    this.render();
  }

  openAddActivityModal(blockId) {
    this.selectedBlockId = blockId;
    this.blockOfferTabs.set(blockId, 'activities');
    const modal = document.getElementById('activity-modal');
    if (!modal) return;
    document.getElementById('activity-form-title').value = '';
    document.getElementById('activity-form-type').value = 'Řízená činnost';
    document.getElementById('activity-form-desc').value = '';
    modal.classList.add('active');
  }

  saveActivityFromModal() {
    const title = document.getElementById('activity-form-title').value.trim();
    const type = document.getElementById('activity-form-type').value;
    const desc = document.getElementById('activity-form-desc').value.trim();

    if (!title) {
      alert('Zadejte prosím název činnosti.');
      return;
    }

    if (this.selectedBlockId) {
      this.blockOfferTabs.set(this.selectedBlockId, 'activities');
      store.addActivityToBlock(this.selectedBlockId, { title, type, desc });
      this.showToast('Činnost byla přidána do bloku');
      this.closeModal('activity-modal');
      this.render();
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.classList.remove('is-open');
    }
    if (modalId === 'item-picker-modal') {
      const doc = store.getDoc();
      this.renderBlocksBuilder(doc);
      if (typeof dnd !== 'undefined' && dnd.init) dnd.init();
    }
  }

  showOutcomeDetail(code) {
    const out = RVP_OUTCOMES.find(o => o.code === code);
    if (!out) return;

    const modal = document.getElementById('outcome-modal');
    const titleEl = document.getElementById('outcome-modal-title');
    const bodyEl = document.getElementById('outcome-modal-body');
    if (!modal || !titleEl || !bodyEl) return;

    titleEl.textContent = `${out.code}`;
    bodyEl.innerHTML = `
      <h3 style="font-size: 1.15rem; color: var(--primary-700); margin-bottom: 12px;">${out.title}</h3>
      <div style="margin-bottom: 12px; font-size: 0.85rem; color: var(--text-muted);">
        <strong>Kategorie:</strong> ${out.category} | <strong>Podkategorie:</strong> ${out.subCategory} | <strong>Strana v RVP:</strong> ${out.page}
      </div>
      
      ${out.comment ? `
        <div style="background: var(--bg-subtle); padding: 12px; border-radius: 8px; margin-bottom: 14px; font-size: 0.9rem;">
          <strong>💡 Metodický komentář:</strong>
          <p style="margin-top: 6px; line-height: 1.5;">${out.comment}</p>
        </div>
      ` : ''}

      ${out.examples && out.examples.length > 0 ? `
        <div style="margin-bottom: 14px;">
          <strong>🎯 Příklady pedagogických strategií:</strong>
          <ul style="margin-top: 6px; padding-left: 20px; font-size: 0.88rem; line-height: 1.5;">
            ${out.examples.map(ex => `<li>${ex}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `;
    modal.classList.add('active');
  }

  moveBlock(idx, direction) {
    const destIdx = idx + direction;
    const doc = store.getDoc();
    if (destIdx >= 0 && destIdx < doc.blocks.length) {
      store.reorderBlocks(idx, destIdx);
      this.showToast(`Blok byl posunut ${direction < 0 ? 'nahoru' : 'dolů'}`);
      this.render();
    }
  }

  promptAssignItem(type, id) {
    const doc = store.getDoc();
    const blocks = doc.blocks || [];
    if (blocks.length === 0) {
      this.showToast('Nejprve vytvořte alespoň jeden integrovaný blok.', '⚠️');
      return;
    }

    const modal = document.getElementById('assign-block-modal');
    const select = document.getElementById('assign-modal-block-select');
    const titleEl = document.getElementById('assign-modal-item-title');
    const confirmBtn = document.getElementById('btn-confirm-assign-block');

    if (!modal || !select || !titleEl || !confirmBtn) return;

    let itemDesc = id;
    if (type === 'competency' && RVP_COMPETENCIES[id]) {
      itemDesc = `${RVP_COMPETENCIES[id].icon} ${RVP_COMPETENCIES[id].name} (${id})`;
    } else if (type === 'literacy' && RVP_LITERACIES[id]) {
      itemDesc = `${RVP_LITERACIES[id].icon} ${RVP_LITERACIES[id].name} (${id})`;
    } else if (type === 'area' && RVP_AREAS[id]) {
      itemDesc = `${RVP_AREAS[id].icon} ${RVP_AREAS[id].name} (${id})`;
    } else if (type === 'outcome') {
      const out = RVP_OUTCOMES.find(o => o.code === id);
      if (out) itemDesc = `🎯 ${out.title} (${out.code})`;
    }

    titleEl.textContent = itemDesc;
    select.innerHTML = blocks.map((b, i) => `
      <option value="${b.id}">${i + 1}. ${b.title || 'Blok ' + (i + 1)}</option>
    `).join('');

    confirmBtn.onclick = () => {
      const targetBlockId = select.value;
      const targetBlock = blocks.find(b => b.id === targetBlockId);
      if (!targetBlock) return;

      if (type === 'outcome') {
        store.addBlockOutcome(targetBlock.id, id);
        this.showToast(`Výsledek učení přiřazen k bloku: ${targetBlock.title}`);
      } else if (type === 'competency') {
        if (!targetBlock.competencies || !targetBlock.competencies.includes(id)) {
          store.toggleBlockCompetency(targetBlock.id, id);
        }
        this.showToast(`Klíčová kompetence přiřazena k bloku: ${targetBlock.title}`);
      } else if (type === 'literacy') {
        if (!targetBlock.literacies || !targetBlock.literacies.includes(id)) {
          store.toggleBlockLiteracy(targetBlock.id, id);
        }
        this.showToast(`Gramotnost přiřazena k bloku: ${targetBlock.title}`);
      } else if (type === 'area') {
        if (!targetBlock.areas || !targetBlock.areas.includes(id)) {
          store.toggleBlockArea(targetBlock.id, id);
        }
        this.showToast(`Vzdělávací oblast přiřazena k bloku: ${targetBlock.title}`);
      }

      this.closeModal('assign-block-modal');
      this.render();
    };

    modal.classList.add('active');
  }

  openTemplateModal() {
    const modal = document.getElementById('template-modal');
    const container = document.getElementById('template-modal-list');
    if (!modal || !container) return;

    container.innerHTML = SAMPLE_TEMPLATES.map(tmpl => `
      <div class="card" style="padding: 16px; margin-bottom: 14px; cursor: pointer; border: 2px solid var(--border-color); transition: all 0.2s;" onclick="window.svpApp.loadTemplate('${tmpl.id}')">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <span class="header-tag" style="background-color: ${tmpl.color}22; color: ${tmpl.color};">${tmpl.tag}</span>
            <h4 style="font-size: 1.05rem; margin-top: 6px;">${tmpl.name}</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">${tmpl.subtitle}</p>
            <div style="font-size: 0.75rem; color: var(--text-light); margin-top: 8px;">
              📦 Obsahuje ${formatPlural(tmpl.blocks.length, 'integrovaný blok', 'integrované bloky', 'integrovaných bloků')} s vazbami na RVP PV
            </div>
          </div>
          <button class="btn btn-sm btn-primary">Načíst šablonu</button>
        </div>
      </div>
    `).join('');

    modal.classList.add('active');
  }

  loadTemplate(templateId) {
    if (confirm('Načtením šablony přepíšete aktuální rozpracovaný ŠVP PV. Přejete si pokračovat?')) {
      store.resetToTemplate(templateId);
      this.closeModal('template-modal');
      this.showToast('Vzorová šablona byla úspěšně načtena!');
      this.render();
    }
  }

  // --- COVERAGE MATRIX & AUDIT ---
  renderCoverageMatrix(doc) {
    const container = document.getElementById('coverage-matrix-content');
    if (!container) return;

    const stats = store.calculateCoverage();

    let html = `
      <div class="card" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%); margin-bottom: 24px;">
        <div class="card-header">
          <div class="card-title">🔍 Analýza souladu s Rámcovým vzdělávacím programem (RVP PV)</div>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-muted);">
          Tento audit automaticky ověřuje, zda vaše integrované bloky rovnoměrně rozvíjejí všech 8 klíčových kompetencí a pokrývají 4 hlavní vzdělávací oblasti RVP PV.
        </p>
      </div>

      <h3 style="font-size: 1.15rem; margin-bottom: 14px;">1. Pokrytí klíčových kompetencí (8 kompetencí)</h3>
      <div class="coverage-grid" style="margin-bottom: 30px;">
    `;

    Object.entries(RVP_COMPETENCIES).forEach(([code, comp]) => {
      const cov = stats.competencyCoverage[code] || { count: 0, blocks: new Set(), totalInRVP: 1 };
      const blockCount = cov.blocks.size;
      const isGood = blockCount >= 2;
      const percent = Math.min(100, Math.round((blockCount / Math.max(1, doc.blocks.length)) * 100));

      html += `
        <div class="coverage-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div style="flex: 1; min-width: 0;">
              <span style="font-size: 1.5rem;">${comp.icon}</span>
              <h4 style="font-size: 0.95rem; margin-top: 4px; line-height: 1.3;">${comp.name}</h4>
              <span class="code-badge">${code}</span>
            </div>
            <span class="header-tag ${isGood ? 'header-tag-success' : 'header-tag-warning'}">
              ${formatBlocks(blockCount)}
            </span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percent}%; background-color: ${comp.color};"></div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            Zapojeno v blocích: ${Array.from(cov.blocks).join(', ') || '<span style="color: var(--danger-500);">Zatím v žádném bloku</span>'}
          </div>
        </div>
      `;
    });

    html += `
      </div>
      <h3 style="font-size: 1.15rem; margin-bottom: 14px;">2. Pokrytí vzdělávacích oblastí</h3>
      <div class="coverage-grid">
    `;

    Object.entries(RVP_AREAS).forEach(([code, area]) => {
      const cov = stats.areaCoverage[code] || { count: 0, blocks: new Set(), totalInRVP: 1 };
      const blockCount = cov.blocks.size;
      const isGood = blockCount >= 2;
      const percent = Math.min(100, Math.round((blockCount / Math.max(1, doc.blocks.length)) * 100));

      html += `
        <div class="coverage-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div style="flex: 1; min-width: 0;">
              <span style="font-size: 1.5rem;">${area.icon}</span>
              <h4 style="font-size: 0.95rem; margin-top: 4px; line-height: 1.3;">${area.name}</h4>
              <span class="code-badge">${code}</span>
            </div>
            <span class="header-tag ${isGood ? 'header-tag-success' : 'header-tag-warning'}">
              ${formatBlocks(blockCount)}
            </span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percent}%; background-color: ${area.color};"></div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            Přiřazené výstupy v blocích: ${Array.from(cov.blocks).join(', ') || '<span style="color: var(--danger-500);">Zatím v žádném bloku</span>'}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  // --- RVP CATALOG BROWSER ---
  renderRvpCatalog() {
    const container = document.getElementById('rvp-catalog-container');
    if (!container) return;

    let html = `
      <div class="card" style="margin-bottom: 24px;">
        <div class="card-header">
          <div class="card-title">📖 Oficiální katalog Rámcového vzdělávacího programu (RVP PV)</div>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 16px;">
          Kompletní databáze standardu a metodické podpory MŠMT s ${RVP_OUTCOMES.length} očekávanými výsledky učení (OVU), komentáři a pedagogickými strategiemi.
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <input type="text" class="form-input" id="full-catalog-search" placeholder="🔍 Fulltextové vyhledávání v RVP PV..." style="flex: 1; min-width: 250px;">
        </div>
      </div>

      <div id="full-catalog-results" style="display: flex; flex-direction: column; gap: 12px;">
    `;

    RVP_OUTCOMES.forEach(out => {
      html += `
        <div class="card" style="padding: 16px; margin-bottom: 0;" data-search-text="${out.code.toLowerCase()} ${out.title.toLowerCase()} ${(out.comment || '').toLowerCase()}">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <span class="code-badge" style="font-size: 0.85rem;">${out.code}</span>
              <span style="font-size: 0.75rem; color: var(--text-light);">Strana ${out.page}</span>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="window.svpApp.showOutcomeDetail('${out.code}')">🔍 Detail & Metodika</button>
          </div>
          <h4 style="font-size: 1rem; color: var(--text-main); margin-bottom: 8px;">${out.title}</h4>
          ${out.comment ? `<p style="font-size: 0.85rem; color: var(--text-muted);">${out.comment.slice(0, 180)}...</p>` : ''}
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    const fullSearch = document.getElementById('full-catalog-search');
    if (fullSearch) {
      fullSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        document.querySelectorAll('#full-catalog-results > .card').forEach(card => {
          const text = card.getAttribute('data-search-text') || '';
          card.style.display = (!query || text.includes(query)) ? 'block' : 'none';
        });
      });
    }
  }

  // --- DOCUMENT PREVIEW ---
  renderPreview(doc) {
    const previewContainer = document.getElementById('document-preview-frame');
    if (!previewContainer) return;
    const html = SVPExporter.generateDocumentHTML(doc);
    previewContainer.srcdoc = html;
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.svpApp = new SVPApp();
});
