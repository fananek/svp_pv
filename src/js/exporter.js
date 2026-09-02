// Exporter module for ŠVP PV documents (DOCX, Print/PDF, HTML)
import { RVP_COMPETENCIES, RVP_LITERACIES, RVP_AREAS, RVP_OUTCOMES } from '../data/rvp_data.js';

export class SVPExporter {
  static generateDocumentHTML(doc) {
    const s = doc.schoolData || {};
    const auto = doc.autoevaluation || {};
    const blocks = doc.blocks || [];

    const getCompName = (code) => RVP_COMPETENCIES[code] ? `${RVP_COMPETENCIES[code].icon} ${RVP_COMPETENCIES[code].name}` : code;
    const getAreaName = (code) => RVP_AREAS[code] ? `${RVP_AREAS[code].icon} ${RVP_AREAS[code].name}` : code;
    const getLitName = (code) => RVP_LITERACIES[code] ? `${RVP_LITERACIES[code].icon} ${RVP_LITERACIES[code].name}` : code;
    const getOutcomeTitle = (code) => {
      const o = RVP_OUTCOMES.find(item => item.code === code);
      return o ? `${o.code}: ${o.title}` : code;
    };

    return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>${s.docTitle || 'ŠVP PV'} - ${s.schoolName || 'Mateřská škola'}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 20mm 25mm 20mm;
      @bottom-right {
        content: counter(page) " / " counter(pages);
      }
    }
    body {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #fff;
      max-width: 900px;
      margin: 0 auto;
      padding: 30px;
    }
    .cover-page {
      text-align: center;
      padding: 60px 20px 40px 20px;
      border-bottom: 2px solid #2563eb;
      margin-bottom: 40px;
      page-break-after: always;
    }
    .cover-title {
      font-size: 26pt;
      font-weight: 800;
      color: #1e3a8a;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cover-motto {
      font-size: 18pt;
      font-style: italic;
      color: #3b82f6;
      margin-bottom: 35px;
    }
    .cover-school {
      font-size: 16pt;
      font-weight: 600;
      margin-bottom: 25px;
      color: #111827;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
      font-size: 10.5pt;
    }
    .meta-table th, .meta-table td {
      border: 1px solid #d1d5db;
      padding: 9px 12px;
      text-align: left;
    }
    .meta-table th {
      background-color: #f3f4f6;
      width: 30%;
      font-weight: 600;
      color: #374151;
    }
    h1 {
      font-size: 18pt;
      color: #1e40af;
      border-bottom: 2px solid #bfdbfe;
      padding-bottom: 6px;
      margin-top: 35px;
      page-break-after: avoid;
    }
    h2 {
      font-size: 14pt;
      color: #1e3a8a;
      margin-top: 25px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 12pt;
      color: #2563eb;
      margin-top: 18px;
    }
    p {
      margin-bottom: 12px;
      text-align: justify;
    }
    .block-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 18px;
      margin-bottom: 25px;
      background: #fafafa;
      page-break-inside: avoid;
    }
    .block-title {
      font-size: 14pt;
      font-weight: 700;
      color: #1e3a8a;
      margin-bottom: 5px;
    }
    .block-time {
      font-size: 10pt;
      font-weight: 600;
      color: #d97706;
      margin-bottom: 12px;
    }
    .badge-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 8px 0 12px 0;
    }
    .badge {
      display: inline-block;
      font-size: 9pt;
      padding: 3px 8px;
      border-radius: 4px;
      background: #e0e7ff;
      color: #3730a3;
      border: 1px solid #c7d2fe;
    }
    .badge-area {
      background: #fef3c7;
      color: #92400e;
      border-color: #fde68a;
    }
    .activity-box {
      background: #ffffff;
      border-left: 3px solid #3b82f6;
      padding: 8px 12px;
      margin: 8px 0;
      border-radius: 0 4px 4px 0;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 50px;
      page-break-inside: avoid;
    }
    .sig-box {
      border-top: 1px dashed #6b7280;
      padding-top: 8px;
      text-align: center;
      font-size: 10pt;
    }
    @media print {
      body {
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover-page">
    ${s.logoUrl ? `
      <div style="margin-bottom: 20px;">
        <img src="${s.logoUrl}" alt="Logo mateřské školy" style="max-height: 90px; max-width: 220px; object-fit: contain;">
      </div>
    ` : ''}
    <div class="cover-title">${s.docTitle || 'Školní vzdělávací program pro předškolní vzdělávání'}</div>
    <div class="cover-motto">„${s.mottoName || 'Naše mateřská škola'}“</div>
    <div class="cover-school">${s.schoolName || 'Mateřská škola'}</div>
    <p style="font-size: 11pt; color: #4b5563;">Dokument zpracovaný v souladu s Rámcovým vzdělávacím programem pro předškolní vzdělávání (RVP PV)</p>
    
    <table class="meta-table">
      <tr><th>Název a sídlo školy:</th><td>${s.schoolName || '-'}, ${s.schoolAddress || '-'}</td></tr>
      <tr><th>IČO / REDIZO:</th><td>${s.ico || '-'} / ${s.redizo || '-'}</td></tr>
      <tr><th>Zřizovatel:</th><td>${s.founder || '-'}</td></tr>
      <tr><th>Ředitel(ka) školy:</th><td>${s.headmaster || '-'}</td></tr>
      <tr><th>Zpracovatel ŠVP:</th><td>${s.author || '-'}</td></tr>
      <tr><th>Číslo jednací:</th><td>${s.refNumber || '-'}</td></tr>
      <tr><th>Platnost a účinnost:</th><td>od ${s.validFrom || '-'} do ${s.validTo || '-'}</td></tr>
    </table>
  </div>

  <!-- 1. Charakteristika školy -->
  <h1>1. Charakteristika školy</h1>
  <h3>1.1 Lokalita a prostředí</h3>
  <p>${s.location || 'Není specifikováno.'}</p>
  <h3>1.2 Budova a materiální zázemí</h3>
  <p>${s.buildingSpec || 'Není specifikováno.'}</p>
  <h3>1.3 Kapacita a uspořádání tříd</h3>
  <p><strong>Nejvyšší povolená kapacita:</strong> ${s.maxCapacity || 'Neuvedeno'}</p>
  <table class="meta-table">
    <thead>
      <tr><th>Název třídy</th><th>Věková skupina</th><th>Počet dětí</th><th>Typ třídy</th></tr>
    </thead>
    <tbody>
      ${(s.classes || []).map(c => `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td>${c.ageRange}</td>
          <td>${c.count}</td>
          <td>${c.type}</td>
        </tr>
      `).join('') || '<tr><td colspan="4">Žádné třídy nejsou zapsány.</td></tr>'}
    </tbody>
  </table>

  <!-- 2. Pedagogický tým -->
  <h1>2. Pedagogický tým a personální podmínky</h1>
  <h3>2.1 Složení pedagogického sboru</h3>
  <p>${s.teamDesc || 'Není specifikováno.'}</p>
  <h3>2.2 Plán profesního rozvoje pedagogů</h3>
  <p>${s.pdPlan || 'Není specifikováno.'}</p>

  <!-- 3. Podmínky vzdělávání -->
  <h1>3. Podmínky pro realizaci předškolního vzdělávání</h1>
  <h3>3.1 Psychosociální podmínky</h3>
  <p>${s.psychosocial || 'Není specifikováno.'}</p>
  <h3>3.2 Životospráva a stravování</h3>
  <p>${s.dietNutrition || 'Není specifikováno.'}</p>
  <h3>3.3 Organizace provozu a denní řád</h3>
  <p>${s.organization || 'Není specifikováno.'}</p>
  <h3>3.4 Věcné a materiální podmínky</h3>
  <p>${s.materialConditions || 'Není specifikováno.'}</p>
  <h3>3.5 Spolupráce se zákonnými zástupci</h3>
  <p>${s.familyCooperation || 'Není specifikováno.'}</p>

  <!-- 4. Charakteristika vzdělávacího programu -->
  <h1>4. Charakteristika vzdělávacího programu</h1>
  <h3>4.1 Vize a cíle vzdělávacího programu</h3>
  <p>${s.vision || 'Není specifikováno.'}</p>
  <h3>4.2 Vzdělávací strategie pro rozvoj kompetencí a gramotností</h3>
  <p>${s.strategies || 'Není specifikováno.'}</p>
  <h3>4.3 Pedagogická diagnostika a sledování pokroku dětí</h3>
  <p>${s.diagnostics || 'Není specifikováno.'}</p>
  <h3>4.4 Zajištění individualizace vzdělávání</h3>
  <p>${s.individualization || 'Není specifikováno.'}</p>

  <!-- 5. Vzdělávací obsah - Integrované bloky -->
  <h1>5. Vzdělávací obsah (Integrované bloky)</h1>
  <p>Vzdělávací obsah je uspořádán do flexibilních integrovaných bloků, které propojují jednotlivé vzdělávací oblasti RVP PV a směřují k naplňování klíčových kompetencí dítěte.</p>
  
  ${blocks.map((b, idx) => `
    <div class="block-card">
      <div class="block-title">${idx + 1}. ${b.title}</div>
      <div class="block-time">⏱ <strong>Orientační časový rámec:</strong> ${b.timeFrame}</div>

      ${b.situationalImpulse ? `
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0; border-radius: 0 6px 6px 0; font-size: 10pt;">
          <strong style="color: #1e40af;">🌟 Motivační záměr / Situační impuls:</strong> ${b.situationalImpulse}
        </div>
      ` : ''}

      <p><strong>Smysl a účel bloku:</strong> ${b.purpose || 'Neuvedeno'}</p>
      
      ${b.subTopics && b.subTopics.length > 0 ? `
        <p><strong>Podtémata / Náměty:</strong> ${b.subTopics.join(', ')}</p>
      ` : ''}

      <!-- Základní gramotnosti -->
      ${b.literacies && b.literacies.length > 0 ? `
        <div style="margin-top: 12px; margin-bottom: 12px;">
          <p style="margin-bottom: 4px; font-weight: 700; color: #1e3a8a;">📖 Rozvíjené základní gramotnosti:</p>
          <div class="badge-list">
            ${b.literacies.map(l => `<span class="badge">${getLitName(l)}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Kurikulární vazby RVP PV: Klíčové kompetence -> Vzdělávací oblasti -> Výsledky učení -->
      <div style="margin-top: 14px; margin-bottom: 12px;">
        <p style="margin-bottom: 6px; font-weight: 700; color: #1e3a8a;">🧠 Rozvíjené klíčové kompetence a vzdělávací oblasti:</p>
        ${(() => {
          const curriculum = store.ensureCurriculum(b);
          if (!curriculum || curriculum.length === 0) {
            return '<div style="color: #9ca3af; font-size: 9pt; font-style: italic; margin-bottom: 8px;">Klíčové kompetence nebyly přiřazeny.</div>';
          }
          return curriculum.map(compNode => {
            const compCode = compNode.competency;
            const areas = compNode.areas || [];
            return `
              <div style="margin-bottom: 10px; padding: 6px 12px; background: #f8fafc; border-left: 3.5px solid #3b82f6; border-radius: 0 6px 6px 0;">
                <strong style="color: #1d4ed8; font-size: 10.5pt;">${getCompName(compCode)}</strong>
                ${areas.length > 0 ? areas.map(areaNode => {
                  const areaCode = areaNode.area;
                  const outcomes = areaNode.outcomes || [];
                  return `
                    <div style="margin-top: 6px; margin-left: 10px; padding-left: 8px; border-left: 2px solid #10b981;">
                      <div style="font-weight: 700; color: #047857; font-size: 9.5pt;">🎨 Oblast: ${getAreaName(areaCode)}</div>
                      ${outcomes.length > 0 ? `
                        <ul style="margin: 3px 0 2px 18px; padding: 0; font-size: 9pt; line-height: 1.45;">
                          ${outcomes.map(code => `<li><strong>[${code}]</strong> ${getOutcomeTitle(code)}</li>`).join('')}
                        </ul>
                      ` : `<div style="font-size: 8.5pt; color: #9ca3af; font-style: italic; margin-left: 6px;">Zatím bez konkrétních dílčích výsledků učení.</div>`}
                    </div>
                  `;
                }).join('') : `<div style="font-size: 8.5pt; color: #9ca3af; font-style: italic; margin-left: 10px; margin-top: 3px;">K této kompetenci zatím nebyla přiřazena vzdělávací oblast.</div>`}
              </div>
            `;
          }).join('');
        })()}
      </div>

      ${(b.centersOfActivity && b.centersOfActivity.length > 0) || (b.activities && b.activities.length > 0) ? `
        <h4 style="color: #1e3a8a; margin: 16px 0 8px 0; font-size: 11pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">🎲 Vzdělávací nabídka:</h4>
        
        ${b.activities && b.activities.length > 0 ? `
          <p style="margin: 8px 0 4px 0;"><strong>Pedagogické činnosti a hry:</strong></p>
          ${b.activities.map(act => `
            <div class="activity-box">
              <strong>${act.title}</strong> <em>(${act.type})</em>
              <div>${act.desc}</div>
            </div>
          `).join('')}
        ` : ''}

        ${b.centersOfActivity && b.centersOfActivity.length > 0 ? `
          <p style="margin: 8px 0 4px 0;"><strong>Centra aktivit s věkovou diferenciací (2–7 let):</strong></p>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px;">
            ${b.centersOfActivity.map(c => `
              <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px;">
                <strong style="color: #2563eb; font-size: 10.5pt;">${c.center}</strong>
                <ul style="margin: 6px 0 0 16px; padding: 0; font-size: 9.5pt; line-height: 1.5;">
                  <li><strong>Mladší děti (2–3 roky):</strong> ${c.younger}</li>
                  <li><strong>Střední věk (4–5 let):</strong> ${c.middle}</li>
                  <li><strong>Předškoláci (6–7 let):</strong> ${c.older}</li>
                </ul>
              </div>
            `).join('')}
          </div>
        ` : ''}
      ` : ''}

      ${b.digitalSafety ? `
        <div style="background: #fdf4ff; border-left: 4px solid #d946ef; padding: 9px 12px; margin-bottom: 12px; border-radius: 0 6px 6px 0; font-size: 9.5pt;">
          <strong style="color: #86198f;">🛡 Digitální bezpečnost a zdravé návyky:</strong> ${b.digitalSafety}
        </div>
      ` : ''}

      ${b.diagnostics ? `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px; font-size: 9.5pt;">
          <strong style="color: #166534; font-size: 10pt;">📋 Pedagogická diagnostika a dokládání pokroku (Portfolio):</strong>
          ${b.diagnostics.observations ? `
            <div style="margin-top: 6px;"><strong>Pozorované projevy (pro záznamový arch rozvoje):</strong></div>
            <ul style="margin: 2px 0 6px 16px; padding: 0;">
              ${b.diagnostics.observations.map(o => `<li>${o}</li>`).join('')}
            </ul>
          ` : ''}
          ${b.diagnostics.portfolioItems ? `
            <div><strong>Konkrétní výstupy do dětského diagnostického portfolia:</strong></div>
            <ul style="margin: 2px 0 0 16px; padding: 0;">
              ${b.diagnostics.portfolioItems.map(p => `<li>${p}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      ` : ''}

      ${b.autoevaluationQuestions && b.autoevaluationQuestions.length > 0 ? `
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 9px 12px; margin-bottom: 12px; font-size: 9.5pt;">
          <strong style="color: #92400e;">🔍 Autoevaluace bloku (pro pedagogický tým):</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            ${b.autoevaluationQuestions.map(q => `<li>${q}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `).join('')}

  <!-- 6. Plán autoevaluace -->
  <h1>6. Plán autoevaluace a hodnocení mateřské školy</h1>
  <h3>6.1 Oblasti autoevaluace</h3>
  <ul>
    ${(auto.areas || []).map(a => `<li>${a}</li>`).join('')}
  </ul>
  <h3>6.2 Cíle autoevaluace</h3>
  <p>${auto.goals || 'Není specifikováno.'}</p>
  <h3>6.3 Kritéria hodnocení</h3>
  <p>${auto.criteria || 'Není specifikováno.'}</p>
  <h3>6.4 Metody a nástroje pro autoevaluaci</h3>
  <ul>
    ${(auto.methods || []).map(m => `<li>${m}</li>`).join('')}
  </ul>
  <h3>6.5 Časový harmonogram autoevaluace</h3>
  <p>${auto.schedule || 'Není specifikováno.'}</p>
  <h3>6.6 Odpovědnost pracovníků</h3>
  <p>${auto.responsibilities || 'Není specifikováno.'}</p>

  <!-- Závěrečné podpisy -->
  <div class="signature-grid">
    <div class="sig-box">
      V .................................. dne .........................<br><br><br>
      ....................................................................<br>
      Podpis zpracovatele ŠVP PV
    </div>
    <div class="sig-box">
      Razítko mateřské školy<br><br><br>
      ....................................................................<br>
      <strong>${s.headmaster || 'Ředitel(ka) mateřské školy'}</strong><br>
      ředitel(ka) školy
    </div>
  </div>
</body>
</html>
    `;
  }

  static openPrintPreview(doc) {
    const html = this.generateDocumentHTML(doc);
    const win = window.open('', '_blank');
    if (!win) {
      alert('Povolte vyskakovací okna pro zobrazení tiskového náhledu.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 500);
  }

  static exportWordDocx(doc) {
    const html = this.generateDocumentHTML(doc);
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `SVP_PV_${(doc.schoolData.mottoName || 'program').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.doc`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
