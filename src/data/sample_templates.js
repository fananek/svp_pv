// Vzorové šablony Školního vzdělávacího programu pro předškolní vzdělávání (ŠVP PV)

export const SAMPLE_TEMPLATES = [
  {
    "id": "ms-branisovice",
    "name": "ŠVP: Každý den s úsměvem objevujeme svět",
    "subtitle": "MŠ Branišovice – Rodinná školka s moderním vzděláváním a digitálními technologiemi",
    "tag": "MŠ Branišovice (Digitální & Rodinná)",
    "color": "#6366f1",
    "schoolData": {
      "docTitle": "Školní vzdělávací program pro předškolní vzdělávání",
      "mottoName": "Každý den s úsměvem objevujeme svět",
      "schoolName": "Mateřská škola Branišovice, okres Brno-venkov, příspěvková organizace",
      "schoolAddress": "Branišovice 57, 671 77 Branišovice",
      "ico": "75009382",
      "redizo": "600115049",
      "headmaster": "Bc. Kateřina Mikšová",
      "author": "Bc. Kateřina Mikšová a pedagogický tým MŠ Branišovice",
      "founder": "Obec Branišovice, Branišovice 57, 671 77 Branišovice",
      "refNumber": "MS-BRA/2027/01",
      "validFrom": "2027-09-01",
      "validTo": "2030-08-31",
      "location": "Malebná obec Branišovice na Jižní Moravě (okres Brno-venkov), 10 km od Pohořelic s dobrou dopravní dostupností IDS JMK.",
      "buildingSpec": "Přízemní bezbariérová a klimatizovaná moderní budova v centru obce vedle kostela sv. Vavřince, s prostornou hernou, digitálním badatelským koutkem a rozsáhlou zahradou s herními prvky.",
      "maxCapacity": "25 dětí",
      "classes": [
        {
          "name": "Branišovická kapička",
          "ageRange": "2–7 let",
          "count": 25,
          "type": "Věkově smíšená (rodinná)"
        }
      ],
      "teamDesc": "Tým tvoří ředitelka školy Bc. Kateřina Mikšová, učitelky Vlasta Zimová, Bc. Petra Škůrková, DiS. a asistentka pedagoga Darina Havlišová. Využíváme moderní metody, digitální technologie a úzký rodinný kontakt s dětmi i rodiči.",
      "pdPlan": "DVPP v oblastech rozvoje digitální kompetence v předškolním věku, práce s robotickými didaktickými pomůckami (Bee-Bot), formativní hodnocení a individualizace pro dvouleté i předškolní děti.",
      "psychosocial": "Rodinné, bezpečné a podnětné klima, kde každé dítě má právo být respektováno jako jedinečná osobnost. Důraz na přátelství, empatii, zvídavost a pohodu.",
      "dietNutrition": "Zdravá, pestrá a vyvážená strava, podpora zdravých stravovacích návyků a celodenní pitný režim.",
      "organization": "Flexibilní uspořádání dne (provoz 06:30–16:30), vyvážený poměr pobytu venku, tvořivých her a hravého objevování s moderními technologiemi.",
      "materialConditions": "Bohaté didaktické zázemí, robotické včelky Bee-Bot a Blue-Bot, digitální mikroskopy, interaktivní dotykový panel, badatelské kufříky, pestré stavebnice a venkovní herní prvky.",
      "familyCooperation": "Velmi úzká partnerská spolupráce s rodiči, otevřené konzultační hodiny, společné komunitní akce v obci, tvořivé dílničky a pravidelná komunikace.",
      "logoUrl": "data:image/png;base64,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",
      "vision": "Vytvořit pro děti bezpečné a inspirativní rodinné prostředí, které spojuje přirozenou radost ze hry a pohybu, mezilidské vztahy a moderní digitální technologie pro rozvoj samostatného, tvořivého a zvídavého dítěte.",
      "strategies": "Zážitkové a prožitkové učení, badatelské objevování, rozvoj digitální pregramotnosti prostřednictvím hravé algoritmizace a robotických hraček, situační učení a vrstevnická kooperace ve věkově smíšené třídě.",
      "diagnostics": "Průběžná pedagogická diagnostika dětí, záznamové archy rozvoje, dětská portfolia (včetně digitálních fotodokumentací vlastních výtvorů) a včasná podpora školní zralosti.",
      "individualization": "Individuální přístup ke každému dítěti, podpora postupné adaptace (včetně dvouletých dětí s podporou chůvy/asistenta) i nadaných předškoláků."
    },
    "blocks": [
      {
        "id": "bra-block-1",
        "title": "V naší rodinné školičce – Kamarádi, bezpečí a první objevy",
        "timeFrame": "4–6 týdnů (září–říjen; flexibilní dle adaptačních potřeb dětí)",
        "situationalImpulse": "Nástup dětí po prázdninách a příchod nových kamarádů do rodinné věkově smíšené třídy. Děti zkoumají prostor třídy, svou značku, fotografují se u své skříňky a v zrcadle zkoumají své emoce a nálady.",
        "purpose": "Vytvořit bezpečné klima pro bezproblémovou adaptaci všech věkových skupin (včetně 2letých dětí), ukotvit pravidla přátelského soužití, posílit sebepoznání, emoční stabilitu a seznámit se s digitálním fotoaparátem a zvukovým panelem jako nástrojem pro zachycení společných chvil.",
        "subTopics": [
          "Vítejte u nás v Branišovicích – Kdo jsem já a moji kamarádi",
          "Moje tělo, smysly a zrcadlo emocí",
          "Pravidla naší party (Strom přátelství a bezpečí)",
          "Můj první digitální autoportrét a rodinné album"
        ],
        "competencies": [
          "KOS",
          "KKK",
          "KKU",
          "KDI",
          "KOB"
        ],
        "literacies": [
          "CGR",
          "MGR"
        ],
        "areas": [
          "DJP",
          "DDS",
          "DJT"
        ],
        "outcomes": [
          "DJP-SAE-000-PV1-001",
          "DDS-ANS-000-PV1-001",
          "DJT-TSB-000-PV1-001",
          "KKK-000-000-PV1-001",
          "KOS-000-000-PV1-001",
          "KDI-000-000-PV1-001"
        ],
        "centersOfActivity": [
          {
            "center": "Centrum Věda, pokusy a digitální svět",
            "younger": "Zkoumání vlastního odrazu v zrcadle a mačkání zvukových kolíčků s nahranými zvuky smíchu a zvířátek.",
            "middle": "Digitální autoportrét – fotografování kamaráda dětským fotoaparátem a tisk identifikační kartičky na skříňku.",
            "older": "Digitální fotokomiks „Jak pomoci smutnému kamarádovi“ – řazení pořízených fotografií do logického příběhu."
          },
          {
            "center": "Centrum Kostky, manipulace a prostorová orientace",
            "younger": "Stavění měkkých pelíšků a domečků z molitanových a dřevěných kostek pro oblíbeného plyšáka.",
            "middle": "Stavba branišovické školky a zahrady z dřevěných kostek s přiřazováním značek dětí ke skříňkám.",
            "older": "Konstrukce bezpečného bludiště třídy s překážkami a kresba jednoduchého půdorysu třídy s piktogramy pravidel."
          },
          {
            "center": "Centrum Ateliér, knihy, písmena a dramatizace",
            "younger": "Otiskování dlaní prstovými barvami na společný „Kmen přátelství a bezpečí“.",
            "middle": "Kresba své rodiny a vyprávění v komunitním kruhu za pomoci mluvícího kamínku.",
            "older": "Tvorba osobní knihy „Kdo jsem já“ s grafomotorickými listy a vlastnoruční kresbou piktogramů třídních pravidel."
          }
        ],
        "digitalSafety": "Uplatňování pravidla respektu k soukromí kamaráda: „Než tě vyfotím, zeptám se tě.“ Práce se zvukovým panelem s ohledem na klidové zóny třídy.",
        "diagnostics": {
          "observations": [
            "Míra a rychlost adaptace na nové prostředí, navazování očního kontaktu a komunikace.",
            "Schopnost pojmenovat základní emoce (radost, smutek, strach) u sebe i druhých.",
            "Respektování domluvených pravidel třídy a zapojení do společného úklidu hraček."
          ],
          "portfolioItems": [
            "Pracovní list: Autoportrét s kresbou oblíbené hračky a otiskem prstu.",
            "Fotografie dítěte u jeho značky s vlastním komentářem o tom, co má ve školce nejraději."
          ]
        },
        "activities": [
          {
            "id": "bra-act-1",
            "title": "Digitální autoportrét a zrcadlo emocí",
            "type": "Digitální a sebepoznávací",
            "desc": "Děti se fotografují dětským digitálním fotoaparátem s různými výrazy tváře (radost, překvapení, zamyšlení), tisknou fotky a vytvářejí vlastní kartu do třídního alba."
          },
          {
            "id": "bra-act-2",
            "title": "Strom přátelství s hlasovou stopou",
            "type": "Komunitní kruh",
            "desc": "Společné vytvoření stromu pravidel třídy a nahrání krátkého hlasového vzkazu každého dítěte na digitální zvukový panel."
          }
        ],
        "autoevaluationQuestions": [
          "Proběhla adaptace nejmenších dvouletých dětí plynule a bez zbytečného stresu?",
          "Zapojili se starší předškoláci aktivně do pomoci mladším spolužákům při sebeobsluze?"
        ]
      },
      {
        "id": "bra-block-2",
        "title": "Kouzla podzimní přírody a badatelská laboratoř",
        "timeFrame": "5–8 týdnů (říjen–prosinec; flexibilní dle vývoje počasí a úrody)",
        "situationalImpulse": "Změna barev na stromech v okolí kostela sv. Vavřince a sběr plodů (ořechy, šípky, dýně, kukuřice) na zahradě školky. Dětská otázka: „Proč listy žloutnou a co je ukryto uvnitř semínka?“",
        "purpose": "Probouzet v dětech badatelskou zvídavost, prozkoumávat proměny přírody všemi smysly i moderními nástroji (digitální mikroskop, světelný LED stůl), třídit a porovnávat přírodniny a prožívat podzimní tradice a adventní ztišení.",
        "subTopics": [
          "Podzim na branišovických polích, sadech a zahradách",
          "Tajemství listů a semen pod digitálním mikroskopem",
          "Barvy, tvary a hmotnost v přírodní matematice",
          "Světlo v temnotě – Martinská světýlka a adventní tradice"
        ],
        "competencies": [
          "KKU",
          "KRP",
          "KDI",
          "KKT",
          "KOB"
        ],
        "literacies": [
          "MGR",
          "CGR"
        ],
        "areas": [
          "DAS",
          "DJP",
          "DDS"
        ],
        "outcomes": [
          "DAS-PSP-000-PV1-001",
          "DAS-ZPO-000-PV1-001",
          "DJP-MOP-000-PV1-001",
          "DJP-PME-000-PV1-001",
          "KRP-000-000-PV1-001",
          "KKT-000-000-PV1-001"
        ],
        "centersOfActivity": [
          {
            "center": "Centrum Věda, pokusy a digitální svět",
            "younger": "Smyslové objevování – hmatové krabice s kaštany, šiškami a mechem; třídění podle barvy.",
            "middle": "Zkoumání žilnatiny listů a slupek plodů USB mikroskopem s projekcí na velkou obrazovku.",
            "older": "Laboratoř pigmentů – extrakce barviva z listů a badatelský záznam do tabulky proměn barev."
          },
          {
            "center": "Centrum Kostky, manipulace a matematika",
            "younger": "Vkládání ořechů a kaštanů do misek podle velikosti (malý – velký).",
            "middle": "Vážení přírodnin na rovnoramenných vahách a řazení listů od nejkratšího po nejdelší.",
            "older": "Tvorba přírodních mandal (Land Art) s měřením obvodu provázkem a geometrickou symetrií."
          },
          {
            "center": "Centrum Ateliér, knihy a tradice",
            "younger": "Frotáž listů voskovkami a tiskání jablíčky na dlouhý papírový pás.",
            "middle": "Výroba svatomartinských lucerniček s průsvitným papírem a míchání krmiva pro ptáčky.",
            "older": "Stínové a světelné divadlo na LED panelu s vlastním příběhem o zvířátkách chystajících se na zimu."
          }
        ],
        "digitalSafety": "Bezpečná práce s USB mikroskopem a světelným panelem s asistencí pedagoga; střídání práce u mikroskopu s pohybovým pobytem na zahradě a cvičením ostření zraku do dálky.",
        "diagnostics": {
          "observations": [
            "Schopnost třídit přírodniny podle jednoho či více kritérií (barva, velikost, druh).",
            "Jemná motorika a koordinace ruka-oko při práci s lupou, pinzetou a mikroskopem.",
            "Zájem o badatelské pokusy a formulování vlastních jednoduchých předpokladů (hypotéz)."
          ],
          "portfolioItems": [
            "Vylisovaný herbářový list s vlastnoruční kresbou detailu žilnatiny.",
            "Fotodokumentace postavené geometrické mandaly s komentářem dítěte."
          ]
        },
        "activities": [
          {
            "id": "bra-act-3",
            "title": "Makro-svět: Zkoumání listů digitálním USB mikroskopem",
            "type": "Badatelská a technologická",
            "desc": "Děti vkládají listy, kůru a semínka pod digitální mikroskop a na velké obrazovce pozorují žilnatinu a struktury neviditelné pouhým okem."
          },
          {
            "id": "bra-act-4",
            "title": "Adventní světelná animace a stínové divadlo",
            "type": "Esteticko-tvořivá",
            "desc": "Využití světelného LED stolu k vytváření pískových a stínových obrazů s vánoční tematikou."
          }
        ],
        "autoevaluationQuestions": [
          "Byla badatelská laboratoř přístupná a srozumitelná i pro nejmenší děti?",
          "Podařilo se propojit venkovní sběr přírodnin s navazujícími matematickými a tvořivými činnostmi?"
        ]
      },
      {
        "id": "bra-block-3",
        "title": "Cesty, mapy a zimní tajemství (Od stop ve sněhu po svět logiky)",
        "timeFrame": "4–7 týdnů (leden–únor; flexibilní dle zimních podmínek a zájmu dětí)",
        "situationalImpulse": "Pozorování zvířecích stop ve sněhu na školní zahradě a zkoumání cestiček k ptačímu krmítku. Otázka dětí: „Jak zvířátka vědí, kudy jít ke krmítku, když nemají mapu?“",
        "purpose": "Rozvíjet prostorovou orientaci, logické a algoritmické uvažování, objevovat vlastnosti sněhu a ledu a využívat robotickou včelku Bee-Bot jako smysluplný nástroj pro řešení úkolů v kooperaci vrstevníků.",
        "subTopics": [
          "Stopy ve sněhu a zvířata v zimě",
          "Laboratoř ledu, sněhu a vody",
          "Krokování, cesty a orientace v prostoru",
          "Včelka Bee-Bot na zimní mapě a bezpečný digitální svět"
        ],
        "competencies": [
          "KRP",
          "KDI",
          "KKU",
          "KPP",
          "KKK"
        ],
        "literacies": [
          "MGR",
          "CGR"
        ],
        "areas": [
          "DJP",
          "DAS",
          "DJT",
          "DDS"
        ],
        "outcomes": [
          "DJP-MOP-000-PV1-001",
          "DAS-PSP-000-PV1-002",
          "DJT-PHM-000-PV1-001",
          "DDS-KOP-000-PV1-001",
          "KDI-000-000-PV1-001",
          "KRP-000-000-PV1-001"
        ],
        "centersOfActivity": [
          {
            "center": "Centrum Věda, pokusy a digitální svět",
            "younger": "Smyslové zkoumání tání ledu v dlaních, otiskování zvířátek do modelíny a mačkání tlačítka GO na Bee-Botu.",
            "middle": "Jednoduché programování – sekvence 1–2 kroků k obrázku zvířátka; pokus s rychlostí tání ledu u okna vs. na topení.",
            "older": "Kódování složité trasy s překážkami pro Blue-Bot/Bee-Bot, hledání a oprava chyby v programu (debugging)."
          },
          {
            "center": "Centrum Kostky, manipulace a prostorová orientace",
            "younger": "Hmatový chodníček s pěnovými stopami, prolézání tunelu a stavění dlouhých dřevěných kolejí.",
            "middle": "Pohyb po nalepené čtvercové síti na koberci podle slovních pokynů kamaráda (1 krok vpřed, otočka).",
            "older": "Tvorba vlastního plánu a mapy třídy se zakresleným pokladem a navigace spolužáka pouze slovy."
          },
          {
            "center": "Centrum Ateliér, knihy a písmena",
            "younger": "Malování stop zvířat prstovými barvami po dlouhém balicím papíru.",
            "middle": "Čtení příběhu podle piktogramů (domeček -> les -> krmelec) a třídění zvířat na zimující a spící.",
            "older": "Záznamový kódovací list se šipkami (vpřed, vpravo, vlevo) a grafomotorika se symetrií sněhových vloček."
          }
        ],
        "digitalSafety": "Pravidlo 15 minut práce s robotickou pomůckou střídané s oční gymnastikou (hledání zvířátek za oknem). Bezpečné ukládání robotů do nabíjecí stanice.",
        "diagnostics": {
          "observations": [
            "Prostorová orientace a lateralita (vpřed/vzad, vpravo/vlevo) na vlastním těle a na ploše.",
            "Strategie řešení problému – plánování kroků předem vs. pokus/omyl; reakce na chybu.",
            "Vrstevnická kooperace při předávání robotické pomůcky a domluvě na společném postupu."
          ],
          "portfolioItems": [
            "Fotografie naprogramované trasy s autentickým komentářem dítěte o řešení cesty.",
            "Samostatně vyplněný záznamový arch se čtvercovou sítí a směrovými šipkami."
          ]
        },
        "activities": [
          {
            "id": "bra-act-5",
            "title": "Krokování s Bee-Bot: Pomoz zvířátkům do krmelce",
            "type": "Robotická a logická",
            "desc": "Děti plánují a zadávají sekvenci kroků (dopředu, otočka, krok) na tematické kobercové mapě, aby dovedly včelku ke krmítku."
          },
          {
            "id": "bra-act-6",
            "title": "Digitální detektivové: Poznej, co je bezpečné",
            "type": "Řízená diskuse a hra",
            "desc": "Hra s obrázkovými kartami o tom, jak správně zacházet s technologiemi, proč si chránit oči a kdy je čas jít si hrát ven."
          }
        ],
        "autoevaluationQuestions": [
          "Poskytla nabídka dostatečný prostor pro nejmenší děti bez tlaku na abstraktní programování?",
          "Byla robotická pomůcka použita jako smysluplný nástroj k řešení problému, nikoli jako samoúčelná hračka?"
        ]
      },
      {
        "id": "bra-block-4",
        "title": "Jarní probouzení života, zahrada a časosběrné objevování",
        "timeFrame": "5–8 týdnů (březen–duben; flexibilní dle vegetačního cyklu a sázení)",
        "situationalImpulse": "První teplé jarní dny a objevování klíčících semínek na okenním parapetu. Děti si všímají probouzejícího se hmyzu v zahradě a ptají se: „Jak z malého suchého semínka vyroste velká kytka?“",
        "purpose": "Vnímat cykličnost přírody a probouzení života, osvojovat si praktické pěstitelské dovednosti, zaznamenávat růst v čase pomocí časosběrné fotografie a rozvíjet ekologickou odpovědnost a úctu k živým organismům.",
        "subTopics": [
          "První poslové jara a probouzení hmyzí říše",
          "Časosběrný deník semínka a botanická laboratoř",
          "Knihy, pohádky a ozvučené divadélko",
          "Den Země a chytré třídění odpadu v obci"
        ],
        "competencies": [
          "KOB",
          "KKK",
          "KPP",
          "KKU",
          "KDI"
        ],
        "literacies": [
          "CGR",
          "MGR"
        ],
        "areas": [
          "DAS",
          "DJP",
          "DJT",
          "DDS"
        ],
        "outcomes": [
          "DAS-ZPO-000-PV1-001",
          "DJP-PDO-000-PV1-001",
          "DJT-PZI-000-PV1-001",
          "KOB-000-000-PV1-001",
          "KPP-000-000-PV1-001",
          "KKK-000-000-PV1-001"
        ],
        "centersOfActivity": [
          {
            "center": "Centrum Věda, zahrada a digitální technologie",
            "younger": "Sázení řeřichy do vaty, zalévání rozprašovačem a čichání k jarní hlíně.",
            "middle": "Časosběrná fotodokumentace – každodenní vyfotografování klíčící fazole ze stejného úhlu.",
            "older": "Tvorba stop-motion animovaného videa z fotek růstu a měření přírůstků pravítkem do grafu."
          },
          {
            "center": "Centrum Kostky, ekologie a praktický život",
            "younger": "Třídění barevných víček do zmenšených popelnic podle barev.",
            "middle": "Stavba hmyzího hotelu ze šišek, stébel a dřeva na školní zahradě.",
            "older": "Plánování vyvýšeného záhonu – měření rozměrů, výpočet sazenic a sestavení osevního kalendáře."
          },
          {
            "center": "Centrum Ateliér, knihy a dramatizace",
            "younger": "Pohybová dramatizace pohádky „O veliké řepě“ s zapojením celého těla.",
            "middle": "Malování botanických kartiček bylinek a výroba zápichů do záhonů.",
            "older": "Ozvučená dramatizace jarního probouzení lesa s vlastnoručně nahranými audio-efekty na tablet."
          }
        ],
        "digitalSafety": "Práce s tabletem při časosběrném focení maximálně 10 minut denně; důraz na přímý kontakt se zeminou, vodou a rostlinami v reálném prostředí.",
        "diagnostics": {
          "observations": [
            "Pravidelnost a pečlivost při péči o svěřenou rostlinku (zalévání, pozorování).",
            "Chápání časové posloupnosti a cyklů (semínko -> klíček -> stonek -> květ -> plod).",
            "Třídění odpadu a ekologické návyky při pobytu venku."
          ],
          "portfolioItems": [
            "Vlastní růstový záznamový arch se zakreslenou výškou rostliny v jednotlivých týdnech.",
            "Vytištěná časosběrná minifotokniha s komentářem dítěte."
          ]
        },
        "activities": [
          {
            "id": "bra-act-7",
            "title": "Časosběrný fotodeník: Jak roste naše fazole",
            "type": "Badatelsko-digitální",
            "desc": "Každodenní vyfotografování klíčící rostliny tabletem na pevném stojánku a vytvoření krátkého animovaného videa o růstu rostliny."
          },
          {
            "id": "bra-act-8",
            "title": "Interaktivní pohádka s ozvučením",
            "type": "Literárně-dramatická",
            "desc": "Dramatizace pohádky dětmi s využitím vlastnoručně nahraných zvukových efektů (déšť, vítr, kroky vlka)."
          }
        ],
        "autoevaluationQuestions": [
          "Mělo každé dítě možnost pečovat o vlastní rostlinku a zažít radost z pěstitelského úspěchu?",
          "Byly digitální záznamy smysluplným doplňkem reálného kontaktu s přírodou?"
        ]
      },
      {
        "id": "bra-block-5",
        "title": "Svět je plný možností – Cestujeme, bádáme a míříme do školy",
        "timeFrame": "5–8 týdnů (květen–červen; flexibilní dle termínů výletů a slavnostního loučení)",
        "situationalImpulse": "Příprava předškoláků na zápis a přechod do základní školy, plánování celoškolního výletu a velká zvědavost dětí ohledně vzdálených zemí, vesmíru a dopravy. Dětské otázky: „Kam všude se dá dojet a co všechno se naučím ve velké škole?“",
        "purpose": "Podpořit všestrannou školní a sociální zralost předškoláků, upevnit bezpečné návyky v dopravě, prozkoumávat planetu a techniku a slavnostně zhodnotit celoroční pokroky každého dítěte v rodinném kruhu školy.",
        "subTopics": [
          "Doprava, bezpečnost a cestování po Jižní Moravě",
          "Planeta Země, vesmír a technické vynálezy",
          "Předškolácká akademie zralosti a sportovní den",
          "Moje digitální portfolio a slavnostní pasování na školáka"
        ],
        "competencies": [
          "KKU",
          "KOS",
          "KPP",
          "KRP",
          "KDI",
          "KKK"
        ],
        "literacies": [
          "CGR",
          "MGR"
        ],
        "areas": [
          "DJT",
          "DJP",
          "DAS",
          "DDS"
        ],
        "outcomes": [
          "DAS-BCH-000-PV1-001",
          "DJT-PHM-000-PV1-001",
          "DDS-SLK-000-PV1-001",
          "KKU-000-000-PV1-004",
          "KOS-000-000-PV1-001",
          "KDI-000-000-PV1-001"
        ],
        "centersOfActivity": [
          {
            "center": "Centrum Věda, technika a vesmír",
            "younger": "Jízda autíčky a vláčky po silničním koberci, reakce na barvy semaforu.",
            "middle": "Konstrukce dopravních prostředků z magnetických stavebnic a zkoumání glóbu.",
            "older": "Programování simulace silničního provozu pro Bee-Bot (křižovatky s předností v jízdě) a zkoumání fází Měsíce."
          },
          {
            "center": "Centrum Předškolák a grafomotorická akademie",
            "younger": "Kreslení velkých kroužků a rovných čar křídou na zahradním chodníku, vkládání tvarů.",
            "middle": "Skládání tangramů, stříhání po linii a určování první hlásky ve slově.",
            "older": "Uvolňovací grafomotorické cviky, sluchová analýza a syntéza slov, předmatematické relace a počítání do 10."
          },
          {
            "center": "Centrum Ateliér, dramatizace a slavnostní loučení",
            "younger": "Výroba dárků a záložek do knihy pro odcházející předškoláky.",
            "middle": "Hra na školu s opravdovými aktovkami, penály a zvoněním.",
            "older": "Příprava prezentace vlastního celoročního portfolia pro rodiče a slavnostní pasování na školáka."
          }
        ],
        "digitalSafety": "Vyvážení mentální a grafomotorické práce intenzivním pobytem na čerstvém vzduchu (koloběžky, sportovní hry, překážková dráha); nácvik ergonomie správného sezení a úchopu tužky.",
        "diagnostics": {
          "observations": [
            "Komplexní školní zralost: sluchová a zraková percepce, grafomotorický úchop, koncentrace pozornosti.",
            "Sociální zralost: schopnost odložit své přání, spolupracovat ve skupině a přijmout novou roli školáka.",
            "Sebereflexe a schopnost popsat, v čem se dítě za uplynulý rok nejvíce posunulo."
          ],
          "portfolioItems": [
            "Kompletní diagnostický grafomotorický list předškoláka (postava, geometrické tvary, podpis).",
            "Osobní celoroční digitální i tištěné portfolio s výběrem nejzdařilejších výtvorů a fotek."
          ]
        },
        "activities": [
          {
            "id": "bra-act-9",
            "title": "Interaktivní dopravní hřiště a Bee-Bot navigátor",
            "type": "Dopravně-robotická",
            "desc": "Simulace silničního provozu v Branišovicích s dopravními značkami a semafory na interaktivní mapě."
          },
          {
            "id": "bra-act-10",
            "title": "Digitální portfolio a pasování předškoláků",
            "type": "Slavnostní událost",
            "desc": "Promítání celoročních digitálních vzpomínek pro rodiče, předání šerp, certifikátů mladého badatele a knih."
          }
        ],
        "autoevaluationQuestions": [
          "Odcházejí předškoláci do základní školy se zdravým sebevědomím, zvídavostí a radostí?",
          "Podařilo se během celého roku naplnit vizi přátelské a moderní rodinné mateřské školy?"
        ]
      }
    ],
    "autoevaluation": {
      "areas": [
        "Rozvoj digitální gramotnosti a bezpečnosti v předškolním věku",
        "Podmínky vzdělávání a klima rodinné školy",
        "Výsledky vzdělávání a individualizace (podpora 2letých dětí i předškoláků)",
        "Partnerství s rodinou a obcí Branišovice"
      ],
      "goals": "Zajišťovat vysokou kvalitu moderního a přátelského předškolního vzdělávání s efektivním a bezpečným zapojením digitálních technologií.",
      "criteria": "Míra radosti a samostatnosti dětí, rozvoj digitální a logické pregramotnosti, spokojenost rodičů a bezproblémový přechod dětí do ZŠ.",
      "methods": [
        "Hospitační činnost a pedagogická sebereflexe",
        "Dotazníková šetření spokojenosti rodičů",
        "Analýza digitálních i tištěných portfolií dětí",
        "Pedagogické rady a čtvrtletní evaluační rozbory"
      ],
      "schedule": "Průběžná evaluace po ukončení každého integrovaného bloku; celková evaluační zpráva 1x ročně v červnu; revize ŠVP 1x za 3 roky.",
      "responsibilities": "Bc. Kateřina Mikšová (ředitelka školy a koordinátorka ŠVP), pedagogický tým MŠ Branišovice."
    }
  },
  {
    "id": "vseobecna-ms",
    "name": "ŠVP: Objevujeme svět s úsměvem",
    "subtitle": "Všestranný program pro běžnou mateřskou školu s pestrou nabídkou činností",
    "tag": "Všestranná šablona",
    "color": "#3b82f6",
    "schoolData": {
      "docTitle": "Školní vzdělávací program pro předškolní vzdělávání",
      "mottoName": "Objevujeme svět s úsměvem",
      "schoolName": "Mateřská škola Sluníčko, Praha 4",
      "schoolAddress": "Slunečná 1420/5, 140 00 Praha 4",
      "ico": "70891234",
      "redizo": "600012345",
      "headmaster": "Mgr. Jana Nováková",
      "author": "Kolektiv pedagogů MŠ Sluníčko (vedoucí: Mgr. Jana Nováková)",
      "founder": "Městská část Praha 4, Antala Staška 2059/80b",
      "refNumber": "MS-SLU/2026/01",
      "validFrom": "2026-09-01",
      "validTo": "2029-08-31",
      "location": "Klidná vilová čtvrť v blízkosti lesoparku, dobrá dopravní dostupnost MHD.",
      "buildingSpec": "Dvoupodlažní modernizovaná budova s bezbariérovým přístupem, prostornou zahradou vybavenou přírodními prvky, pískovišti a krytým altánem pro venkovní výuku.",
      "maxCapacity": "75 dětí",
      "classes": [
        {
          "name": "Sluníčka",
          "ageRange": "3–4 roky",
          "count": 25,
          "type": "Homogenní"
        },
        {
          "name": "Hvězdičky",
          "ageRange": "4–5 let",
          "count": 25,
          "type": "Homogenní"
        },
        {
          "name": "Kometky",
          "ageRange": "5–7 let (předškoláci)",
          "count": 25,
          "type": "Homogenní"
        }
      ],
      "teamDesc": "Tým tvoří 6 kvalifikovaných učitelek předškolního vzdělávání, 2 asistentky pedagoga a 3 provozní zaměstnanci. Všichni pedagogové se průběžně vzdělávají v moderních metodách prožitkového učení a inkluze.",
      "pdPlan": "Pravidelná účast na DVPP v oblastech čtenářské a matematické pregramotnosti, polytechnického vzdělávání, rozvoje digitální kompetence a formativního hodnocení.",
      "psychosocial": "Vytváříme bezpečné, vstřícné a podnětné klima založené na vzájemné důvěře, toleranci a respektu k individualitě každého dítěte.",
      "dietNutrition": "Pestrá a vyvážená strava připravovaná ve vlastní školní jídelně s důrazem na čerstvou zeleninu, ovoce a dostatečný pitný režim po celý den.",
      "organization": "Flexibilní denní režim respektující biologické potřeby dětí s vyváženým poměrem řízených a spontánních činností a dostatkem pobytu venku.",
      "materialConditions": "Bohaté vybavení didaktickými pomůckami, knihami, tvořivými a badatelskými koutky, digitálními mikroskopy a sportovním nářadím.",
      "familyCooperation": "Otevřená komunikace s rodiči formou individuálních konzultačních hodin, společných tvořivých dílen, zahradních slavností a elektronické nástěnky.",
      "vision": "Vytvořit pro děti prostředí plné podnětů, radosti a bezpečí, kde každé dítě rozvine své individuální předpoklady, samostatnost a zdravé sebevědomí pro úspěšný vstup do základní školy i do života.",
      "strategies": "Uplatňujeme situační a prožitkové učení, konstruktivistický přístup, metodu pokus-omyl, kooperativní hry a badatelské aktivity.",
      "diagnostics": "Průběžné sledování a zaznamenávání individuálního pokroku dítěte do portfolia, evaluační rozhovory a diagnostika školní zralosti ve spolupráci s PPP.",
      "individualization": "Diferenciace úkolů dle schopností a zájmů dítěte, individuální vzdělávací plány (IVP) a plány pedagogické podpory (PLPP) pro děti se SVP a nadané děti."
    },
    "blocks": [
      {
        "id": "block-1",
        "title": "Kdo jsem já a moji noví kamarádi",
        "timeFrame": "Září – Říjen (8 týdnů)",
        "purpose": "Usnadnit dětem adaptaci v mateřské škole, seznámit se s pravidly soužití, posílit vzájemnou důvěru, poznat své tělo a emoce.",
        "subTopics": [
          "Vítejte v naší školce",
          "Moje tělo a zdraví",
          "Moje rodina a domov",
          "Jak se domluvíme (pravidla)"
        ],
        "competencies": [
          "KKU",
          "KKK",
          "KOS",
          "KOB"
        ],
        "literacies": [
          "CGR"
        ],
        "areas": [
          "DJT",
          "DJP",
          "DDS"
        ],
        "outcomes": [
          "DJT-TSB-000-PV1-001",
          "DJT-PZI-000-PV1-001",
          "DJP-SAE-000-PV1-001",
          "DDS-ANS-000-PV1-001",
          "KKK-000-000-PV1-001",
          "KOS-000-000-PV1-001"
        ],
        "activities": [
          {
            "id": "act-1",
            "title": "Hra se zrcadlem: Poznej sám sebe",
            "type": "Smyslová a sebepoznávací",
            "desc": "Děti pozorují své rysy v zrcadle, kreslí autoportrét a pojmenovávají části těla i různé emoce."
          },
          {
            "id": "act-2",
            "title": "Pravidla naší třídy: Strom přátelství",
            "type": "Kooperativní a sociální",
            "desc": "Společné vytváření a obtiskování rukou na strom pravidel slušného chování a vzájemné pomoci."
          }
        ]
      }
    ],
    "autoevaluation": {
      "areas": [
        "Naplňování cílů ŠVP",
        "Podmínky vzdělávání",
        "Klima školy"
      ],
      "goals": "Zajišťovat trvalé zvyšování kvality vzdělávání.",
      "criteria": "Míra spokojenosti dětí a rodičů.",
      "methods": [
        "Hospitace",
        "Dotazníky",
        "Pedagogické rady"
      ],
      "schedule": "Čtvrtletně a ročně v červnu.",
      "responsibilities": "Ředitelka a učitelky."
    }
  },
  {
    "id": "eko-ms",
    "name": "ŠVP: Zelený strom - Život v souladu s přírodou",
    "subtitle": "Environmentálně a badatelsky zaměřený program s důrazem na pobyt venku a ekologii",
    "tag": "Environmentální",
    "color": "#10b981",
    "schoolData": {
      "docTitle": "Školní vzdělávací program pro předškolní vzdělávání",
      "mottoName": "Zelený strom - Život v souladu s přírodou",
      "schoolName": "Mateřská škola Lesní kvítek, Brno",
      "schoolAddress": "Lesní 88, 621 00 Brno",
      "ico": "72098432",
      "redizo": "600098765",
      "headmaster": "Bc. Lenka Zelená",
      "author": "Tým Eko-pedagogů MŠ Lesní kvítek",
      "founder": "Statutární město Brno, Dominikánské náměstí 1",
      "refNumber": "MS-LK/2026/02",
      "validFrom": "2026-09-01",
      "validTo": "2029-08-31",
      "location": "Okraj města v bezprostředním sousedství lesa a chráněné krajinné oblasti.",
      "buildingSpec": "Přírodní dřevostavba s nízkoenergetickým provozem, obrovská přírodní zahrada s vyvýšenými záhony, ovocným sadem a lesním altánem.",
      "maxCapacity": "48 dětí",
      "classes": [
        {
          "name": "Veverky",
          "ageRange": "3–4,5 let",
          "count": 24,
          "type": "Věkově smíšená"
        },
        {
          "name": "Sovičky",
          "ageRange": "4,5–7 let",
          "count": 24,
          "type": "Věkově smíšená"
        }
      ],
      "teamDesc": "4 kvalifikované pedagožky se specializací na environmentální pedagogiku.",
      "pdPlan": "Kurzy badatelsky orientované výuky a první pomoc v terénu.",
      "psychosocial": "Klidná rodinná atmosféra, respekt k přirozenému rytmu přírody.",
      "dietNutrition": "Bio-kvalita z lokálních farem, vlastní bylinková zahrádka.",
      "organization": "Až 70 % denního programu probíhá venku za každého počasí.",
      "materialConditions": "Přírodní badatelské pomůcky, lupy, mikroskopy.",
      "familyCooperation": "Aktivní zapojení rodičů do eko-akcí.",
      "vision": "Vychovávat děti s hlubokou úctou k přírodě a radostí z pohybu venku.",
      "strategies": "Badatelské učení, zážitková pedagogika, komunitní kruh.",
      "diagnostics": "Portfolia badatelských deníků a výtvorů.",
      "individualization": "Přirozené vrstevnické učení ve věkově smíšené třídě."
    },
    "blocks": [
      {
        "id": "eko-block-1",
        "title": "Tajemství lesní půdy a semínek",
        "timeFrame": "Září – Říjen (8 týdnů)",
        "purpose": "Zkoumat život v půdě, poznávat stromy a semena.",
        "subTopics": [
          "Pod našima nohama",
          "Stromy – naši tiší obři"
        ],
        "competencies": [
          "KKU",
          "KOB",
          "KRP"
        ],
        "literacies": [
          "CGR",
          "MGR"
        ],
        "areas": [
          "DAS",
          "DJT"
        ],
        "outcomes": [
          "DAS-PSP-000-PV1-001",
          "DAS-ZPO-000-PV1-001",
          "KOB-000-000-PV1-001"
        ],
        "activities": [
          {
            "id": "eko-act-1",
            "title": "Půdní laboratoř s lupou",
            "type": "Badatelská",
            "desc": "Zkoumání vzorků půdy a žížal pod listím."
          }
        ]
      }
    ],
    "autoevaluation": {
      "areas": [
        "Environmentální klima",
        "Badatelské kompetence dětí"
      ],
      "goals": "Udržet vysoký standard lesního vzdělávání.",
      "criteria": "Míra samostatnosti dětí venku.",
      "methods": [
        "Portfolio deníků",
        "Zpětná vazba rodičů"
      ],
      "schedule": "Čtvrtletně.",
      "responsibilities": "Ředitelka a ekologický koordinátor."
    }
  }
];
