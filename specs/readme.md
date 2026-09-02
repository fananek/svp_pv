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
V revidované architektuře kurikula (RVP PV od září 2027) tyto čtyři entity netvoří izolované škatulky, ale vzájemně provázanou matici.

Jejich vztah lze nejlépe popsat jako **dvourozměrnou mřížku**: na jedné ose stojí *komplexní osobnostní profil dítěte* (kompetence a gramotnosti) a na druhé ose *obsahový kontext světa, který dítě objevuje* (vzdělávací oblasti). **Průsečíkem obou os jsou Očekávané výsledky učení (OVU).**

```
                 [ ZÁKLADNÍ GRAMOTNOST ]       [ KLÍČOVÁ KOMPETENCE ]
                 (Kognitivní aparát)           (Postoje, hodnoty, jednání)
                          │                              │
                          └──────────────┬───────────────┘
                                         ▼
                             [ VZDĚLÁVACÍ OBLAST ]
                             (Kontext a prostředí světa)
                                         │
                                         ▼
                        [ OČEKÁVANÝ VÝSLEDEK UČENÍ ]
                        (Pozorovatelný projev dítěte)

```

---

### Jednotlivé entity a jejich přesné vazby

**1. Klíčová kompetence (KK) $\leftrightarrow$ Vzdělávací oblast (VO)**

* **Vztah: N : M (více k více).**
* Kompetence je **nadoborová**. Žádná kompetence nepatří výhradně jedné oblasti. Například *kompetenci k řešení problémů* dítě rozvíjí jak v oblasti *Dítě a svět* (zkoumání přírodních jevů), tak v oblasti *Dítě, ten druhý a společnost* (řešení konfliktu o hračku).
* Vzdělávací oblast poskytuje **kontext a náměty**, v nichž se daná kompetence prakticky projevuje.

**2. Základní gramotnost (ZG) $\leftrightarrow$ Klíčová kompetence (KK)**

* **Vztah: Instrumentální základ.**
* Gramotnosti (čtenářská, matematická) nejsou samostatnými předměty ani cílovými postoji – jsou to **funkční nástroje myšlení a dorozumívání**.
* Gramotnost je nezbytnou podmínkou pro realizaci kompetencí: bez předmatematické orientace v prostoru a čase nelze plně rozvinout *kompetenci k řešení problémů* ani *kompetenci digitální*; bez porozumění symbolům a jazyku (čtenářská gramotnost) nelze naplnit *kompetenci komunikativní*.

**3. Očekávaný výsledek učení (OVU) jako finální uzel**

* **Vztah: OVU je operacionalizovaným průsečíkem VO + KK + ZG.**
* OVU je nejnižší a jedinečná měřitelná jednotka v RVP. Každý jednotlivý očekávaný výsledek učení:
1. Je **organizačně zařazen do konkrétní Vzdělávací oblasti** (určuje tematický rámec).
2. Přímo **sytí konkrétní Klíčovou kompetenci** (popisuje její dílčí složku v chování).
3. Velmi často **využívá nástroj Základní gramotnosti** (využívá symbol, číslo, porovnání, kód).



---

### Příklad vazby na jedné konkrétní situaci

| Entita | Konkrétní vyjádření | Role v systému |
| --- | --- | --- |
| **Klíčová kompetence** | *Kompetence digitální / k řešení problémů* | **Cíl:** Dítě dokáže naplánovat posloupnost kroků k dosažení cíle a opravit chybu. |
| **Základní gramotnost** | *Předmatematická gramotnost* | **Nástroj:** Orientace v prostoru (vpravo/vlevo, vpřed/vzad), práce se čtvercovou sítí a symbolickými šipkami. |
| **Vzdělávací oblast** | *Dítě a svět* | **Obsahové prostředí:** Zimní příroda, cesty zvířat ke krmelci. |
| **Očekávaný výsledek učení (OVU)** | *„Naplánuje a pomocí symbolů zaznamená jednoduchou cestu k cíli na ploše/síti.“* | **Pozorovatelný projev:** Učitel v praxi vidí a diagnostikuje tento konkrétní krok dítěte na vývojovém kontinuu. |