# ŠVP PV Application Specification

This directory contains the complete, unambiguous technical and functional specifications for the ŠVP PV Web Application. This documentation serves as the single source of truth (SSoT) for engineering, AI code generation, and database schema design.

## System Overview

**ŠVP PV** is a modern, web-based assistant application that helps kindergartens to create ŠVP PV based on RVP:

- It runs locally on user's computer without need of internet connection.

- ŠVP PV is a document for kindergartens that defines educational program of a kindergarten. It is based on the RVP (Rámcový vzdělávací program), which is the state framework for education in Czech Republic. The document is approved by the Czech Ministry of Education.

- The main source of truth for ŠVP PV is the document '/specs/Předškolní vzdělávání Závazná část RVP + metodická podpora.pdf' 

- RVP PV is a document that defines the framework for preschool education in Czech Republic. It is based on the RVP (Rámcový vzdělávací program), which is the state framework for education in Czech Republic. The document is approved by the Czech Ministry of Education.

- The ŠVP PV application:
    - has UI fully in Czech language.
    - supports creation of ŠVP PV based on RVP PV
    - UI allows visual connection (drag and drop) of key comptencies (klíčové kompetence) with expected learning outcomes (očekávané výsledky učení) and activities (činnosti).

## Entity relations
Zde je klíčový strukturální posun celé velké revize kurikula. V předchozím výkladu došlo ke zjednodušení – revidované kurikulum (jak pro PV, tak pro ZV) totiž opouští dřívější model, kde byly výstupy podřízeny pouze oborům/oblastem.

V novém RVP jsou **klíčové kompetence** a **vzdělávací oblasti** definovány jako **dvě rovnocenné, svébytné dimenze kurikula**, přičemž **každá z nich má svou vlastní soustavu očekávaných výsledků učení (OVU)**.

To je zásadní i pro samotné kódování, které je v novém RVP PV zavedeno:

---

### 1. Dva paralelní kmeny Očekávaných výsledků učení (OVU)

V revidovaném RVP existují dvě samostatné skupiny OVU:

* **Oborové OVU (vázané na Vzdělávací oblasti):**
* Popisují, co dítě poznává, objevuje a jaké specifické dovednosti v dané věcné doméně získává.
* Kódují se podle oblastí:
* `DJT-...` = Dítě a jeho tělo
* `DJP-...` = Dítě a jeho psychika
* `DDS-...` = Dítě, ten druhý a společnost
* `DAS-...` = Dítě a svět


* **Kompetenční OVU (vázané přímo na Klíčové kompetence):**
* Popisují obecné způsobilosti, postoje a jednání dítěte bez ohledu na konkrétní tematický obsah.
* Kódují se přímo podle kompetencí:
* `KKU-...` = Kompetence k učení
* `KRP-...` = Kompetence k řešení problémů
* `KDI-...` = Kompetence digitální
* `KKK-...` = Kompetence kulturní (atd.)


---

### 2. Matice nezávislých entit

Vztah mezi nimi není hierarchický strom, ale **ortogonální matice (dvourozměrný prostor)**:

| Dimenze | Entita | Co definuje | Jaké má OVU |
| --- | --- | --- | --- |
| **Horizontální osa** | **Vzdělávací oblast** | *Obsahový kontext a doménu světa* (biologie, psychika, společnost, příroda/technika) | Vlastní oborové OVU (např. *orientuje se na těle*, *rozlišuje živou a neživou přírodu*) |
| **Vertikální osa** | **Klíčová kompetence** | *Funkční způsobilost a proces učení* (jak myslí, jak řeší chybu, jak spolupracuje) | Vlastní kompetenční OVU (např. *vnímá chybu jako součást řešení*, *využívá technologie k bádání*) |
| **Průřezový nástroj** | **Základní gramotnost** | *Kognitivní kód a dorozumívací aparát* (matematický, čtenářský) | Promítá se napříč oborovými i kompetenčními OVU jako instrumentální báze |

---

### 3. Co to znamená pro tvorbu ŠVP a praxi učitele

Tato nezávislost zásadně mění plánování integrovaných bloků i pedagogickou diagnostiku:

1. **Při plánování integrovaného bloku** učitel nekouká na kompetence jako na „abstraktní deštník“, ale vybírá konkrétní cíle ze dvou nezávislých zásobníků:
* Vybere **oborové OVU** (např. z oblasti *Dítě a svět* prozkoumat koloběh vody).
* Vybere **kompetenční OVU** (např. z *Kompetence k řešení problémů* podporovat experimentování pokusem a omylem).


2. **Pedagogická diagnostika a portfolio nesledují jen obsahové znalosti**, ale odděleně mapují růst v kompetenčních OVU (jak dítě překonává překážky, jak pracuje s chybou, jak spolupracuje) paralelně s jeho rozvojem v jednotlivých oblastech.

Tento model konečně odstraňuje dlouholetý nešvar českého školství, kdy se kompetence v ŠVP jen formálně „odškrtávaly“ u témat, aniž by měly vlastní měřitelné projevy a výsledky učení.