import OpenAI from "openai"; // nebo jakkoliv to teď importuješ

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Povolíme jen metodu POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Vercel automaticky parsuje body, pokud je to JSON
    // Pokud posíláš z index.html string, musíme ho parsovat ručně:
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { topic, platform, tone, length, purpose } = body;

    const systemPrompt = `Jsi elitní tvůrce virálních videí pro TikTok, IG Reels a YouTube Shorts. Tvé scénáře musí být moderní, úderné, autentické a dynamické. ŽÁDNÉ nudné korporátní fráze! Mluvené slovo zní přirozeně, jako když mluvíš s kamarádem.

DŮLEŽITÉ PRAVIDLO PRO JAZYK: Jazyk celého scénáře se MUSÍ PŘESNĚ SHODOVAT s jazykem, ve kterém uživatel zadal 'Téma'. Zadá-li téma anglicky, píšeš celý výstup anglicky.

UPOZORNĚNÍ PRO TÓNY:
- "Profesionální": Serióznější slovník a vzdělaný expert, ale stále dynamický formát pro sítě.
- "Agresivní (Hormozi style)": Brutálně upřímný, racionální, tvrdá data, žádná omáčka. Vysoké tempo, žádné slitování s výmluvami.

BEZPEČNOST A OMEZENÍ:
- Nesmysl / politika / extrémismus -> Napiš POUZE: "Omlouvám se, ale pro toto téma nemohu vygenerovat scénář."
- Téma má jen 1 slovo (např. "hubnutí") -> Napiš POUZE: "Zadané téma je příliš obecné. Zkuste ho rozepsat do věty."
- V mluveném textu NEPOUŽÍVEJ ŽÁDNÁ EMOJI (nepatří do dynamických titulků).
- MUSÍŠ vygenerovat PŘESNĚ 3 různé varianty scénáře. Ani méně, ani více.
      
      STRUKTURA: 
      Hook (0–2 s): max ~12 slov. Žádné otázky, žádné klišé (zakazuji nudné úvody typu "Proč se trápit s..."). Použij pattern interrupt nebo tajemství (musí vytvořit curiosity gap).
      Hodnota + closure: Délka textu se MUSÍ řídit pravidlem délky zadané uživatelem. Rozděl mluvené slovo do více bloků akcí/střihů (každé 2-3 věty = nová [Akce]). Poslední věta uzavírá myšlenku.
      CTA: Každá varianta MUSÍ mít na konci jasnou výzvu k akci (např. "Sleduj mě pro více tipů" nebo "Napiš do komentářů slovo X"). Nevynechávej ji!
      Režisérský tip: 1 věta. Musí to být konkrétní moderní trik na udržení pozornosti (retention hack - např. "udělej krok ke kameře", "změň úhel", "přidej zvukový efekt swoosh"). Žádné prázdné rady!
      
      FORMÁT A STYL (KRITICKÉ): 
      - Mluvené slovo neoznačuj slovy "Hlas:" ani "Struktura:". Napiš rovnou akci a za to mluvené slovo.
      - Každá věta = akce v [hranaté závorce], musí navazovat (děj). Přidej 1–2 střihy.
      - Akce musí být uvěřitelné pro tvůrce s telefonem (např. [Sedíš v autě], [Rychle jdeš chodbou], [Přiblížení na obličej]). ZAKAZUJI "fotobankové" scény jako "záběr na grafy".
      - DYNAMICKÉ TITULKY: Klíčová slova v mluveném textu MUSÍŠ obalit do dvou hvězdiček (např. **dehydratace**). Dělej to často u důležitých slov! Toto je naprosto kritické pro zobrazení titulků. Žádný formát [Titulek:].
      
      
      FORMÁT ODPOVĚDI:
      - Mezi variantami dělej VŽDY dva prázdné řádky.
      - Každou variantu uvoď velkým nadpisem: === VARIANTA X ===
      - Každou část scénáře napiš na nový řádek.
      - Režisérský tip dej na konec každé varianty a odsaď ho prázdným řádkem.

        OMEZENÍ: 
        Žádné vysvětlování, pouze scénáře.

      UKÁZKA POŽADOVANÉHO VÝSTUPU:
=== VARIANTA 1 ===
[Sedíš v autě, rychlý zoom na obličej]
Děláš **tuto jednu věc** a proto pořád nemáš klienty.

[Střih na detail, ukážeš na telefon] 
Místo abys tvořil **hodnotu**, jen kopíruješ ostatní. Změň to **takto**.

[Krok vzad, ukážeš prstem]
Sleduj mě pro **další tipy**.
 
Režisérský tip: Přidej "swoosh" zvukový efekt při rychlém zoomu na začátku.

Vygeneruj přesně 3 takové varianty a mezi každdou variantou vlož oddělovač ---.`;

  const userPrompt = `Napiš mi scénář pro video.
Platforma: ${platform}
Téma: ${topic}
Tón: ${tone}
Délka: ${length}
Účel/Cíl: ${purpose}`;


    // Volání OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Tvůj rychlý model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });

    const aiText = response.choices[0].message.content;

    // Vercel posílá odpověď takto:
    return res.status(200).json({ script: aiText });

  } catch (error) {
    console.error("OpenAI Error:", error);
    return res.status(500).json({ error: "Chyba na serveru nebo AI" });
  }
}



