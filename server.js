const http = require('http');
const https = require('https');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT = process.env.PORT || 3000;

// Zugang zu Alfima (nur bei Render unter Environment eintragen, nie hier im Code)
const ALFIMA_API_KEY = process.env.ALFIMA_API_KEY;
// Optional: Nummer der Alfima-Liste, in die Kompass-Nutzer eingetragen werden
const ALFIMA_LISTE_ID = process.env.ALFIMA_LISTE_ID;
// Optional: Nummer der Alfima-Liste "leichtART Newsletter" (nur wer das Häkchen setzt)
const ALFIMA_NEWSLETTER_ID = process.env.ALFIMA_NEWSLETTER_ID;

// Geheime Adresse der Kompass-Seite (nur fuer Kaeufer)
const KOMPASS_PFAD = '/karriere-kompass-a9y77eu1';

// Die Kompass-Seite selbst. Bei Aenderungen an der Seite wird dieser Block neu erzeugt.
const KOMPASS_HTML = "<!DOCTYPE html>\n<html lang=\"de\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Karriere-Kompass von leichtART</title>\n<link href=\"https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap\" rel=\"stylesheet\">\n<style>\n:root {\n  --bg: #f7f4ef;\n  --card: #ffffff;\n  --teal: #2d6a6a;\n  --teal-hell: #e8f2f2;\n  --gold: #b5892a;\n  --gold-hell: #faf3e0;\n  --gold-rand: #e8d499;\n  --blau-dunkel: #1a1a2e;\n  --blau-mittel: #3d5a6b;\n  --blau-hell: #f0f4f7;\n  --blau-rand: #c8d8e0;\n  --text: #1a1a2e;\n  --text-leise: #5a5a72;\n  --rand: #e2ddd6;\n  --rand-hell: #d4cec6;\n  --braun: #8b6f5e;\n  --braun-dunkel: #7a5e4e;\n  --grau-hell: #8a8a9a;\n  --fehler: #c04040;\n}\n* { box-sizing: border-box; margin: 0; padding: 0; }\nbody { font-family: DM Sans, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; padding: 32px 16px 52px; font-size: 19px; line-height: 1.65; }\n.wrap { max-width: 680px; margin: 0 auto; }\n.screen { display: none; }\n.screen.an { display: block; }\n.karte { background: var(--card); border-radius: 12px; box-shadow: 0 2px 24px rgba(26,26,46,0.07); padding: 44px 44px 38px; border: 1px solid var(--rand); }\n@media (max-width: 520px) { .karte { padding: 26px 20px; } }\n.etikett { font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--teal); margin-bottom: 10px; }\nh1 { font-family: DM Serif Display, serif; font-size: 1.5rem; line-height: 1.3; color: var(--text); margin-bottom: 14px; text-wrap: balance; }\nh2 { font-family: DM Serif Display, serif; font-size: 1.5rem; line-height: 1.3; color: var(--text); margin-bottom: 16px; }\n.abschnittstitel { font-size: 12px; font-weight: 600; color: var(--teal); text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid var(--rand); padding-bottom: 8px; margin-bottom: 14px; }\np { font-size: 19px; color: var(--text-leise); margin-bottom: 14px; }\np:last-child { margin-bottom: 0; }\n.badges { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 26px; }\n.badge { background: var(--teal-hell); color: var(--teal); font-size: 13px; font-weight: 600; padding: 5px 14px; border-radius: 20px; }\n.prog-wrap { margin-bottom: 28px; }\n.prog-meta { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-leise); margin-bottom: 8px; }\n.prog-balken { height: 4px; background: var(--rand); border-radius: 2px; overflow: hidden; }\n.prog-fill { height: 100%; background: var(--teal); border-radius: 2px; transition: width 0.4s; }\n@media (prefers-reduced-motion: reduce) { .prog-fill { transition: none; } }\n.fragetext { font-family: DM Serif Display, serif; font-size: 1.2rem; line-height: 1.5; color: var(--text); margin-bottom: 8px; }\n.fragenhinweis { font-size: 15px; color: var(--text-leise); font-style: italic; margin-bottom: 16px; }\ntextarea { width: 100%; border: 1.5px solid var(--rand); border-radius: 8px; padding: 14px 16px; font-family: DM Sans, sans-serif; font-size: 17px; color: var(--text); line-height: 1.6; resize: vertical; min-height: 110px; background: var(--bg); outline: none; }\ntextarea:focus { border-color: var(--teal); background: var(--card); }\n.cb-gruppe { display: flex; flex-direction: column; gap: 10px; }\n.cb-item { display: flex; align-items: flex-start; gap: 14px; padding: 13px 16px; border: 2px solid var(--rand); border-radius: 8px; background: var(--bg); cursor: pointer; }\n.cb-item.an { border-color: var(--teal); background: var(--teal-hell); }\n.cb-item:focus-within { outline: 2px solid var(--teal); outline-offset: 2px; }\n.cb-kasten { width: 22px; height: 22px; min-width: 22px; margin-top: 1px; border: 2px solid var(--rand-hell); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: transparent; background: var(--card); flex-shrink: 0; }\n.cb-item.an .cb-kasten { border-color: var(--teal); background: var(--teal); color: var(--card); }\n.cb-label { font-size: 17px; line-height: 1.45; color: var(--text); }\n.btn { display: block; width: 100%; padding: 16px 24px; border: none; border-radius: 8px; font-family: DM Sans, sans-serif; font-size: 19px; font-weight: 600; cursor: pointer; text-align: center; margin-top: 24px; }\n.btn:focus-visible { outline: 3px solid var(--teal); outline-offset: 3px; }\n.btn-dunkel { background: var(--blau-dunkel); color: var(--card); }\n.btn-dunkel:hover { background: #2d2d4a; }\n.btn-teal { background: var(--teal); color: var(--card); }\n.btn-teal:hover { background: #235555; }\n.btn-braun { background: var(--braun); color: var(--card); }\n.btn-braun:hover { background: var(--braun-dunkel); }\n.btn-ghost { background: transparent; color: var(--text-leise); border: 1px solid var(--rand); margin-top: 10px; font-size: 16px; padding: 12px 24px; }\n.btn-ghost:hover { background: var(--bg); }\n.lade-bereich { text-align: center; padding: 52px 0; }\n.punkte { display: inline-flex; gap: 8px; margin-bottom: 20px; }\n.punkt { width: 12px; height: 12px; background: var(--teal); border-radius: 50%; animation: huepfen 1.2s infinite ease-in-out; }\n.punkt:nth-child(2) { animation-delay: 0.2s; }\n.punkt:nth-child(3) { animation-delay: 0.4s; }\n@keyframes huepfen { 0%,80%,100%{transform:scale(0.7);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }\n@media (prefers-reduced-motion: reduce) { .punkt { animation: none; } }\n.lade-text { font-size: 17px; color: var(--text-leise); font-style: italic; }\n.rbox { margin-bottom: 26px; }\n.rtext p { font-size: 18px; color: var(--text); line-height: 1.8; margin-bottom: 12px; }\n.rtext p:last-child { margin-bottom: 0; }\n.rtext ul { padding-left: 20px; margin-bottom: 12px; }\n.rtext li { font-size: 18px; color: var(--text); line-height: 1.8; margin-bottom: 6px; }\n.einleitungsbox { background: var(--teal-hell); border-left: 4px solid var(--teal); border-radius: 0 8px 8px 0; padding: 16px 18px; margin-bottom: 26px; }\n.einleitungsbox p { color: var(--teal); font-weight: 500; font-size: 17px; margin: 0; line-height: 1.7; }\n.kompetenzkarte { background: var(--bg); border-radius: 8px; padding: 14px 18px; margin-bottom: 10px; }\n.kompetenztitel { font-weight: 600; font-size: 18px; color: var(--text); margin-bottom: 4px; }\n.kompetenztext { font-size: 16px; color: var(--text-leise); line-height: 1.6; }\n.schrittbox { background: var(--gold-hell); border: 1px solid var(--gold-rand); border-radius: 8px; padding: 20px 22px; margin-top: 8px; }\n.schrittbox p { color: var(--gold); font-weight: 500; font-size: 18px; margin-bottom: 0; line-height: 1.75; }\n.abschlussbox { background: var(--blau-hell); border-radius: 8px; padding: 20px 22px; margin-top: 8px; }\n.abschlussbox p { color: var(--blau-mittel); font-size: 18px; font-style: italic; margin-bottom: 0; line-height: 1.75; }\n.trennlinie { border: none; border-top: 1px solid var(--rand); margin: 28px 0; }\n.pdf-angebot { background: var(--bg); border: 1.5px solid var(--rand); border-radius: 12px; padding: 28px 28px 24px; }\n.pdf-angebot h2 { font-size: 1.2rem; margin-bottom: 8px; color: var(--text); }\n.pdf-angebot p { font-size: 17px; color: var(--text-leise); margin-bottom: 16px; }\n.email-feld { width: 100%; border: 1.5px solid var(--rand); border-radius: 8px; padding: 13px 16px; font-family: DM Sans, sans-serif; font-size: 17px; color: var(--text); background: var(--card); outline: none; margin-bottom: 8px; }\n.email-feld:focus { border-color: var(--teal); }\n.email-feld.fehler { border-color: var(--fehler); }\n.feld-label { display: block; font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 6px; }\n.pdf-angebot .feldhinweis { font-size: 15px; color: var(--fehler); margin: -2px 0 12px; }\n.datenschutztext { font-size: 13px; color: var(--grau-hell); line-height: 1.5; margin-bottom: 14px; }\n.checkbox-zeile { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 18px; cursor: pointer; }\n.checkbox-zeile input[type=checkbox] { margin-top: 3px; width: 18px; height: 18px; flex-shrink: 0; accent-color: var(--teal); cursor: pointer; }\n.checkbox-zeile span { font-size: 15px; color: var(--text-leise); line-height: 1.5; }\n.speichern-box { background: var(--teal-hell); border-radius: 10px; padding: 22px 24px; margin-bottom: 28px; }\n.speichern-box h2 { font-size: 1.2rem; margin-bottom: 8px; }\n.speichern-box p { font-size: 16px; color: var(--text-leise); margin-bottom: 0; }\n.speichern-box .btn { margin-top: 14px; margin-bottom: 12px; }\n.druck-kopf { display: none; }\n@media print {\n  @page { margin: 18mm 16mm; }\n  body { background: #fff; padding: 0; font-size: 12pt; }\n  .screen { display: none !important; }\n  #s-ergebnis { display: block !important; }\n  .karte { box-shadow: none; border: none; padding: 0; }\n  .speichern-box, #pdf-bereich, .hinweisbox, .trennlinie, .btn { display: none !important; }\n  .druck-kopf { display: block; font-size: 10pt; color: #555; border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 18px; }\n  .footer { margin-top: 18px; }\n  .footer .haupttext:first-child { display: none; }\n  .einleitungsbox, .schrittbox, .abschlussbox, .kompetenz { break-inside: avoid; -webkit-print-color-adjust: exact; print-color-adjust: exact; }\n  h2, h3, .abschnittstitel { break-after: avoid; }\n}\n.bestaetigung { background: var(--teal-hell); border-radius: 8px; padding: 18px 20px; text-align: center; }\n.bestaetigung p { color: var(--teal); font-weight: 500; font-size: 17px; margin: 0; }\n.hinweisbox { background: var(--blau-hell); border: 1px solid var(--blau-rand); border-radius: 12px; padding: 24px 24px 20px; margin-top: 26px; }\n.hinweisbox p { font-size: 17px; color: var(--blau-mittel); margin-bottom: 14px; }\n.hinweisbox p:last-child { margin-bottom: 0; }\n.hinweislink { color: var(--teal); text-decoration: none; font-weight: 600; }\n.hinweislink:hover { text-decoration: underline; }\n.footer { text-align: center; margin-top: 28px; font-size: 13px; color: var(--grau-hell); line-height: 1.6; }\n.footer a { color: var(--grau-hell); text-decoration: none; }\n.footer a:hover { text-decoration: underline; }\n.footer .hinweis { font-size: 10px; margin-top: 8px; display: block; color: var(--grau-hell); line-height: 1.5; }\n.footer .haupttext { font-size: 13px; display: block; margin-bottom: 8px; }\n</style>\n</head>\n<body>\n<div class=\"wrap\">\n\n<div id=\"s-intro\" class=\"screen an\">\n  <div class=\"karte\">\n    <div class=\"etikett\">Karriere-Kompass</div>\n    <p style=\"font-family:'DM Serif Display',serif;font-style:italic;font-size:1.15rem;color:var(--teal);margin-bottom:6px;\">Was steckt wirklich hinter deinem beruflichen Weg?</p>\n    <h1>Du kannst mehr, als dein Lebenslauf zeigt!</h1>\n    <p>Der leichtART Karriere-Kompass bringt deine <strong>Erfahrungen, Kenntnisse und Fertigkeiten</strong> zusammen, die du im Laufe deines Berufslebens und darüber hinaus erworben hast.</p>\n    <p>Er berücksichtigt auch deine persönlichen <strong>Talente und Fähigkeiten</strong>. Also das, worin du richtig gut bist und was du auf unterschiedliche Weise einsetzen kannst.</p>\n    <p>Denn aus all dem können sich berufliche Möglichkeiten ergeben, die du bislang vielleicht noch gar nicht auf dem Schirm hattest.</p>\n    <p>Der leichtART Karriere-Kompass zeigt dir, welche beruflichen Richtungen zu deinen Erfahrungen und Fähigkeiten passen könnten und wo du <strong>anknüpfen kannst, statt von vorn anzufangen</strong>.</p>\n    <p>Du erhältst eine persönliche Auswertung. Sie übersetzt deine Erfahrungen, Stärken und Talente in Fähigkeiten, die du auch in einer Bewerbung klar benennen kannst. Dazu zeigt dir der Karriere-Kompass <strong>drei bis fünf mögliche berufliche Richtungen</strong> und <strong>einen konkreten nächsten Schritt</strong>.</p>\n    <div class=\"badges\">\n      <span class=\"badge\">6 Fragen</span>\n      <span class=\"badge\">ca. 5 Minuten</span>\n      <span class=\"badge\">Persönliche Auswertung</span>\n    </div>\n    <button class=\"btn btn-dunkel\" id=\"btn-start\">Jetzt starten</button>\n  </div>\n  <div class=\"footer\"><span class=\"haupttext\">Ein Tool von Martina von leichtART | <a href=\"https://leichtART.com\" target=\"_blank\" rel=\"noopener\">leichtART.com</a></span><span class=\"haupttext\">Die Ergebnisse dienen der ersten Orientierung. Für eine persönliche Begleitung bei deiner beruflichen Neuorientierung kontaktiere mich gerne unter <a href=\"mailto:kontakt@leichtART.com\">kontakt@leichtART.com</a></span><span class=\"hinweis\">Hinweis: Der Karriere-Kompass wurde von leichtART entwickelt und nutzt Künstliche Intelligenz zur Unterstützung bei der Analyse und Erstellung deiner persönlichen Auswertung. Alle Inhalte werden kontinuierlich geprüft und weiterentwickelt.</span></div>\n</div>\n\n<div id=\"s-frage\" class=\"screen\">\n  <div class=\"karte\">\n    <div class=\"prog-wrap\">\n      <div class=\"prog-meta\">\n        <span id=\"prog-label\">Frage 1 von 6</span>\n        <span id=\"prog-pct\">0 %</span>\n      </div>\n      <div class=\"prog-balken\"><div class=\"prog-fill\" id=\"prog-fill\" style=\"width:0%\"></div></div>\n    </div>\n    <div id=\"frage-container\"></div>\n    <button class=\"btn btn-teal\" id=\"btn-weiter\">Weiter</button>\n  </div>\n  <div class=\"footer\"><span class=\"haupttext\">Ein Tool von Martina von leichtART | <a href=\"https://leichtART.com\" target=\"_blank\" rel=\"noopener\">leichtART.com</a></span><span class=\"haupttext\">Die Ergebnisse dienen der ersten Orientierung. Für eine persönliche Begleitung bei deiner beruflichen Neuorientierung kontaktiere mich gerne unter <a href=\"mailto:kontakt@leichtART.com\">kontakt@leichtART.com</a></span><span class=\"hinweis\">Hinweis: Der Karriere-Kompass wurde von leichtART entwickelt und nutzt Künstliche Intelligenz zur Unterstützung bei der Analyse und Erstellung deiner persönlichen Auswertung. Alle Inhalte werden kontinuierlich geprüft und weiterentwickelt.</span></div>\n</div>\n\n<div id=\"s-laden\" class=\"screen\">\n  <div class=\"karte\">\n    <div class=\"lade-bereich\">\n      <div class=\"punkte\">\n        <div class=\"punkt\"></div><div class=\"punkt\"></div><div class=\"punkt\"></div>\n      </div>\n      <p class=\"lade-text\" id=\"lade-text\">Deine Antworten werden ausgewertet ...</p>\n    </div>\n  </div>\n</div>\n\n<div id=\"s-ergebnis\" class=\"screen\">\n  <div class=\"karte\">\n    <div class=\"druck-kopf\">leichtART Karriere-Kompass · <span id=\"druck-datum\"></span></div>\n    <div class=\"etikett\">Deine persönliche Auswertung</div>\n    <h2>Das verbirgt sich hinter deinem beruflichen Weg</h2>\n    <div id=\"ergebnis-inhalt\"></div>\n    <div class=\"trennlinie\"></div>\n    <div class=\"speichern-box\">\n      <h2>Deine Auswertung speichern</h2>\n      <p>Speichere dir deine Auswertung als PDF, dann kannst du sie jederzeit in Ruhe nachlesen.</p>\n      <button class=\"btn btn-teal\" id=\"btn-speichern\">Auswertung als PDF speichern</button>\n      <p>Im nächsten Fenster wählst du als Drucker <strong>„Als PDF speichern“</strong>. Auf dem Handy findest du das über <strong>Teilen</strong> oder <strong>Drucken</strong>.</p>\n    </div>\n    <div id=\"pdf-bereich\">\n      <div class=\"pdf-angebot\">\n        <h2>Bleib in Kontakt</h2>\n        <p>Gib deinen Vornamen und deine E-Mail-Adresse ein. Dann schicke ich dir eine Mail mit dem Link zu einem kostenfreien Kennenlerngespräch.</p>\n        <label class=\"feld-label\" for=\"vorname-feld\">Dein Vorname</label>\n        <input type=\"text\" class=\"email-feld\" id=\"vorname-feld\" placeholder=\"Vorname\" autocomplete=\"given-name\" maxlength=\"60\">\n        <p class=\"feldhinweis\" id=\"vorname-hinweis\" style=\"display:none\">Bitte gib deinen Vornamen ein.</p>\n        <label class=\"feld-label\" for=\"email-feld\">Deine E-Mail-Adresse</label>\n        <input type=\"email\" class=\"email-feld\" id=\"email-feld\" placeholder=\"deine@email.de\" autocomplete=\"email\">\n        <p class=\"feldhinweis\" id=\"email-hinweis\" style=\"display:none\">Bitte prüf deine E-Mail-Adresse noch einmal.</p>\n        <label class=\"checkbox-zeile\">\n          <input type=\"checkbox\" id=\"newsletter-check\">\n          <span>Ja, ich möchte den leichtART-Newsletter mit Impulsen, Neuigkeiten und Angeboten erhalten. Abmelden geht jederzeit.</span>\n        </label>\n        <p class=\"datenschutztext\">Deine Adresse verwende ich für diese eine Mail. Den Newsletter bekommst du nur, wenn du das Häkchen setzt.</p>\n        <button class=\"btn btn-teal\" id=\"btn-pdf\">Eintragen</button>\n        <button class=\"btn btn-ghost\" id=\"btn-kein-pdf\">Nein danke</button>\n      </div>\n    </div>\n    <div class=\"hinweisbox\">\n      <p>Wenn du deinen nächsten beruflichen Schritt weiter vertiefen möchtest, findest du weitere Informationen auf leichtART.com.</p>\n      <p><a href=\"https://leichtART.com\" class=\"hinweislink\">Mehr erfahren auf leichtART.com</a></p>\n    </div>\n  </div>\n  <div class=\"footer\"><span class=\"haupttext\">Ein Tool von Martina von leichtART | <a href=\"https://leichtART.com\" target=\"_blank\" rel=\"noopener\">leichtART.com</a></span><span class=\"haupttext\">Die Ergebnisse dienen der ersten Orientierung. Für eine persönliche Begleitung bei deiner beruflichen Neuorientierung kontaktiere mich gerne unter <a href=\"mailto:kontakt@leichtART.com\">kontakt@leichtART.com</a></span><span class=\"hinweis\">Hinweis: Der Karriere-Kompass wurde von leichtART entwickelt und nutzt Künstliche Intelligenz zur Unterstützung bei der Analyse und Erstellung deiner persönlichen Auswertung. Alle Inhalte werden kontinuierlich geprüft und weiterentwickelt.</span></div>\n</div>\n\n</div>\n<script>\n(function() {\n\nvar fragen = [\n  {\n    id: `beruf`,\n    typ: `text`,\n    text: `Was hast du zuletzt gearbeitet? Beschreibe kurz deine Tätigkeit oder deinen Alltag bei der Arbeit.`,\n    hinweis: `Es geht nicht um einen offiziellen Jobtitel. Schreib einfach, was du tatsächlich getan hast. Zum Beispiel: Kunden beraten, Waren einräumen, Maschinen bedienen, Menschen betreuen, kochen, reinigen, fahren, organisieren, verkaufen, reparieren, planen, pflegen.`,\n    platzhalter: `Beschreib deinen Arbeitsalltag so, wie er wirklich war ...`\n  },\n  {\n    id: `staerken`,\n    typ: `text`,\n    text: `Was fiel dir bei deiner Arbeit leichter als anderen?`,\n    hinweis: `Viele unterschätzen ihre Stärken, weil sie sich so normal anfühlen. Schreib auf, was dir leicht fiel oder wofür dich andere gelobt haben. Zum Beispiel: Kunden beruhigen, Ordnung halten, Fehler entdecken, Dinge erklären, ruhig bleiben wenn es stressig wurde.`,\n    platzhalter: `Was hast du gut gekonnt, auch wenn es dir selbstverständlich vorkam? ...`\n  },\n  {\n    id: `erfahrungen`,\n    typ: `text`,\n    text: `Was hast du im Laufe deines Lebens gelernt, auch außerhalb der Arbeit?`,\n    hinweis: `Berücksichtige auch ehrenamtliche Tätigkeiten, Kurse, Hobbys, Aufgaben zu Hause, informelle Rollen in Vereinen oder Gruppen. Auch Fähigkeiten ohne Zertifikat zählen.`,\n    platzhalter: `Was kannst du noch, was nicht auf deinem Lebenslauf steht? ...`\n  },\n  {\n    id: `digital`,\n    typ: `check`,\n    text: `Welche Erfahrungen hast du bisher mit digitalen Werkzeugen gemacht?`,\n    hinweis: `Wähle alles, was zutrifft. Digitale Erfahrung ist keine Voraussetzung für berufliche Möglichkeiten.`,\n    optionen: [\n      `Ich nutze kaum digitale Werkzeuge und habe wenig Erfahrung damit.`,\n      `Ich nutze grundlegende digitale Werkzeuge wie E-Mail, Smartphone oder Textverarbeitung.`,\n      `Ich probiere gelegentlich neue digitale Möglichkeiten aus.`,\n      `Ich nutze digitale Werkzeuge regelmäßig für meine Arbeit oder meinen Alltag.`,\n      `Ich nutze KI-Tools wie ChatGPT bereits regelmäßig.`,\n      `Ich habe andere Menschen beim Einsatz digitaler Werkzeuge unterstützt oder angeleitet.`,\n      `Ich möchte digitale Werkzeuge gezielt besser kennenlernen.`\n    ]\n  },\n  {\n    id: `arbeitsweise`,\n    typ: `check`,\n    text: `Wie möchtest du in Zukunft arbeiten?`,\n    hinweis: `Mehreres kann zutreffen.`,\n    optionen: [\n      `Fest angestellt mit klaren Aufgaben und Sicherheit`,\n      `Mit viel Kontakt zu Menschen`,\n      `Körperlich aktiv, nicht den ganzen Tag sitzen`,\n      `Selbstständig oder mit eigenen Projekten`,\n      `Von zu Hause oder flexibel von verschiedenen Orten`,\n      `Kreativ und mit Gestaltungsspielraum`,\n      `In einem kleinen Team oder Betrieb`,\n      `Mit wechselnden Aufgaben und Abwechslung`,\n      `Ich bin offen und weiß es noch nicht genau`\n    ]\n  },\n  {\n    id: `wunsch`,\n    typ: `text`,\n    text: `Was soll in deinem nächsten Kapitel anders sein? Und was darf auf keinen Fall wieder so sein?`,\n    hinweis: `Kein vollständiger Plan nötig. Schreib nur das, was du bereits weißt oder fühlst.`,\n    platzhalter: `Zum Beispiel: Mehr Wertschätzung, weniger Stress, mehr Abwechslung, ein besseres Arbeitsklima ...`\n  }\n];\n\nvar ladeTexte = [\n  `Deine Antworten werden ausgewertet ...`,\n  `Fähigkeiten werden erkannt ...`,\n  `Muster werden sichtbar gemacht ...`,\n  `Deine persönliche Auswertung wird erstellt ...`\n];\n\nvar bereiche = {\n  marketing:   [`marketing`, `kommunikation`, `content`, `social`, `brand`, `pr`, `werbung`, `text`, `redaktion`, `kampagne`, `grafik`],\n  hr:          [`hr`, `personal`, `recruiting`, `talent`, `mitarbeiter`, `training`, `weiterbildung`, `learning`, `ausbildung`],\n  it:          [`software`, `entwicklung`, `code`, `programmier`, `datenbank`, `sap`, `crm`, `erp`, `server`, `netzwerk`, `it-`],\n  digital:     [`digital`, `online`, `daten`, `analyse`, `excel`, `computer`, `system`, `technologie`],\n  logistik:    [`logistik`, `supply`, `lager`, `versand`, `beschaffung`, `transport`, `warehouse`, `lieferkette`, `kommission`],\n  fahrdienst:  [`fahren`, `fahrer`, `liefern`, `kurier`, `taxi`, `bus`, `lkw`, `fuhrpark`],\n  handel:      [`verkauf`, `verkaufen`, `kasse`, `handel`, `supermarkt`, `markt`, `waren einräumen`, `waren`, `einzelhandel`, `filiale`],\n  gastronomie: [`küche`, `kochen`, `restaurant`, `hotel`, `gastronomie`, `kellner`, `service`, `gastro`, `catering`, `cafe`, `bäckerei`, `konditor`, `barista`],\n  pflege:      [`pflege`, `pflegerin`, `betreuung`, `krankenhaus`, `klinik`, `patienten`, `senioren`, `sozial`, `erzieher`, `kinder`, `behinderung`, `altenpflege`],\n  handwerk:    [`handwerk`, `montage`, `installation`, `elektriker`, `maler`, `tischler`, `maurer`, `mechaniker`, `reparatur`, `wartung`, `schlosser`, `sanitär`, `dachdecker`],\n  buero:       [`büro`, `verwaltung`, `sekretariat`, `sachbearbeitung`, `buchhaltung`, `empfang`, `assistenz`, `planung`, `koordination`],\n  reinigung:   [`reinigung`, `reinigen`, `putzen`, `hausmeister`, `facility`, `gebäude`, `sauberkeit`, `hygiene`],\n  bildung:     [`schule`, `unterricht`, `lehrer`, `bildung`, `kurs`, `seminar`, `erklären`, `vermitteln`, `nachhilfe`, `trainer`],\n  produktion:  [`produktion`, `fertigung`, `fließband`, `montage`, `qualitätskontrolle`, `maschinenführer`, `schichtarbeit`, `werk`]\n};\n\nvar staerkenMap = {\n  organisieren:    [`organis`, `struktur`, `plan`, `koordinier`, `ablauf`, `ordnung`, `überblick`, `verwalt`, `terminier`],\n  kommunizieren:   [`erklär`, `sprechen`, `präsent`, `vermittl`, `überzeu`, `formulier`, `beraten`, `moderier`],\n  schreiben:       [`schreib`, `text`, `formulier`, `protokoll`, `bericht`, `dokumentier`],\n  zuhoeren:        [`zuhör`, `einfühl`, `empathie`, `verständnis`, `geduld`, `beruhig`],\n  analysieren:     [`analyse`, `auswert`, `recherche`, `prüfen`, `bewerten`, `detail`, `genau`, `kontrolle`],\n  umgang_menschen: [`mensch`, `kunden`, `gäste`, `patienten`, `team`, `beziehung`, `helfen`, `begleit`, `betreuung`, `umgang`],\n  handwerklich:    [`bauen`, `reparier`, `montier`, `install`, `basteln`, `werkzeug`, `hand`, `technisch`],\n  kreativ:         [`kreativ`, `gestalten`, `ideen`, `design`, `kochen`, `backen`, `nähen`, `dekorier`],\n  fuehren:         [`führung`, `leitung`, `verantwort`, `entscheid`, `motivier`, `anleiten`, `anleitung`],\n  belastbar:       [`stress`, `druck`, `ruhig`, `belastbar`, `ausdauer`, `durchhalt`, `zuverlässig`, `pünktlich`],\n  sorgfalt:        [`sorgfalt`, `sorgfältig`, `gewissenhaft`, `präzis`, `genau`, `qualität`, `fehlerlos`]\n};\n\nvar staerkenTexte = {\n  organisieren:    `Du bringst Ordnung in Abläufe und behältst den Überblick, auch wenn vieles gleichzeitig passiert. Das ist seltener als es klingt.`,\n  kommunizieren:   `Du kannst Dinge so erklären und vermitteln, dass Menschen sie wirklich verstehen. Das gilt für einfache Sachverhalte genauso wie für schwierige Situationen.`,\n  schreiben:       `Du formulierst klar und verständlich. Ob Berichte, Nachrichten oder Dokumentationen: Was du schreibst, kommt an.`,\n  zuhoeren:        `Du hörst zu, bevor du sprichst. Diese Fähigkeit, Menschen wirklich wahrzunehmen, ist eine der wertvollsten im Umgang mit anderen.`,\n  analysieren:     `Du erkennst Zusammenhänge, entdeckst Fehler und bewertest Situationen sorgfältig. Diese Genauigkeit ist in vielen Bereichen wertvoll.`,\n  umgang_menschen: `Du weißt, wie man mit unterschiedlichen Menschen umgeht, sie ernst nimmt und in schwierigen Momenten ruhig bleibt. Das ist eine echte Stärke.`,\n  handwerklich:    `Du hast ein praktisches Verständnis dafür, wie Dinge funktionieren. Mit deinen Händen zu arbeiten und Probleme vor Ort zu lösen liegt dir.`,\n  kreativ:         `Du denkst in Bildern und Möglichkeiten, findest neue Lösungen und gestaltest Dinge mit einem eigenen Blick.`,\n  fuehren:         `Du übernimmst Verantwortung, gibst anderen Orientierung und leitest auch dann an, wenn es nicht einfach ist.`,\n  belastbar:       `Du bleibst auch unter Druck zuverlässig und ausdauernd. Dass du weißt, wie man mit Stress umgeht, ist kein kleiner Vorteil.`,\n  sorgfalt:        `Du arbeitest gewissenhaft und präzise. Qualität ist dir wichtig, auch wenn niemand hinschaut.`\n};\n\nvar staerkenNamen = {\n  organisieren:    `Organisationsstärke`,\n  kommunizieren:   `Kommunikationsstärke`,\n  schreiben:       `Schriftliche Ausdrucksfähigkeit`,\n  zuhoeren:        `Einfühlungsvermögen`,\n  analysieren:     `Analytisches Denken`,\n  umgang_menschen: `Umgang mit Menschen`,\n  handwerklich:    `Praktisch-technisches Können`,\n  kreativ:         `Kreativität`,\n  fuehren:         `Führungskompetenz`,\n  belastbar:       `Belastbarkeit`,\n  sorgfalt:        `Sorgfalt und Genauigkeit`\n};\n\nvar rollenDB = {\n  marketing: [\n    { titel: `Kommunikation und Textarbeit`, text: `Erfahrung mit Inhalten, Sprache und Zielgruppen ist eine gute Grundlage für Rollen in der internen oder externen Kommunikation von Unternehmen.`, schritt: `Schreib drei Beispiele auf, in denen du Inhalte erstellt oder Botschaften vermittelt hast. Das sind deine stärksten Belege.` },\n    { titel: `Marketing und Kampagnenarbeit`, text: `Wer Zielgruppen versteht und Inhalte gestalten kann, findet in Marketingabteilungen mittlerer Unternehmen oft einen passenden Einstieg.`, schritt: `Schau dir Stellenanzeigen im Bereich Marketing-Assistenz oder Content-Koordination an und vergleiche die Anforderungen mit deinen Erfahrungen.` }\n  ],\n  hr: [\n    { titel: `Personal und Personalbetreuung`, text: `Erfahrung im Umgang mit Menschen, in Gesprächen und in der Begleitung anderer ist in Personalabteilungen gefragt, besonders in der Personalbetreuung und im Recruiting-Support.`, schritt: `Informiere dich über Einstiegspositionen in der Personalverwaltung oder als Personalsachbearbeitung in deiner Region.` }\n  ],\n  it: [\n    { titel: `IT-Support und technischer Kundendienst`, text: `Technisches Verständnis kombiniert mit Kommunikationsstärke ist in IT-Support-Rollen sehr gefragt. Hier wird oft mehr Verständnis als tiefes Programmierwissen benötigt.`, schritt: `Schau dir Stellenanzeigen für IT-Support oder Helpdesk-Rollen an. Viele Einstiegspositionen setzen keine Programmierkenntnisse voraus.` }\n  ],\n  digital: [\n    { titel: `Digitale Sachbearbeitung und Datenpflege`, text: `Wer sicher mit digitalen Werkzeugen umgeht und sorgfältig arbeitet, findet in vielen Unternehmen Rollen in der Datenpflege, Sachbearbeitung oder Systemadministration.`, schritt: `Überlege, welche digitalen Werkzeuge du bereits nutzt, und schreib eine konkrete Liste davon. Diese gehört in deine Bewerbungsunterlagen.` }\n  ],\n  logistik: [\n    { titel: `Logistik und Lagerkoordination`, text: `Erfahrung in Lager, Versand oder Beschaffung ist nach wie vor sehr gefragt. Wer Abläufe kennt und zuverlässig arbeitet, hat gute Chancen auf Weiterentwicklung.`, schritt: `Schau dir Angebote für Teamleitung oder Schichtführung in deinem bisherigen Bereich an.` },\n    { titel: `Einkauf und Beschaffung`, text: `Wer logistische Abläufe von innen kennt und strukturiert denkt, kann diese Erfahrung in Einkaufs- oder Beschaffungsrollen einbringen.`, schritt: `Informiere dich über Weiterbildungen im Bereich Einkauf oder Supply Chain Management. Viele bauen direkt auf Berufserfahrung auf.` }\n  ],\n  fahrdienst: [\n    { titel: `Weiterentwicklung im Fahrdienst`, text: `Zuverlässigkeit, Ortskenntnis und der Umgang mit unterschiedlichsten Menschen sind echte Stärken. Wer mehr Verantwortung übernehmen möchte, kann sich in Richtung Disposition oder Fuhrparkkoordination weiterentwickeln.`, schritt: `Informiere dich bei deinem aktuellen oder einem anderen Arbeitgeber über interne Aufstiegsmöglichkeiten in der Disposition.` },\n    { titel: `Disposition und Tourenplanung`, text: `Wer weiß, wie Fahrdienste im Alltag funktionieren, bringt wertvolles Praxiswissen für koordinierende Rollen in der Tourenplanung oder Einsatzsteuerung mit.`, schritt: `Schau dir Stellenanzeigen für Disponenten in deiner Region an und vergleiche die Anforderungen mit deinen Erfahrungen.` }\n  ],\n  handel: [\n    { titel: `Weiterentwicklung im Einzelhandel`, text: `Erfahrung im Verkauf, an der Kasse oder in der Warenverräumung ist eine solide Grundlage. Wer zuverlässig ist und Abläufe kennt, kann sich in Richtung Abteilungsleitung oder Filialverantwortung weiterentwickeln.`, schritt: `Informiere dich bei deinem Arbeitgeber oder in deiner Branche über interne Weiterbildungsprogramme für Führungsnachwuchs.` },\n    { titel: `Kundenservice und Reklamationsbearbeitung`, text: `Wer im Handel gelernt hat, auf Menschen einzugehen, Konflikte zu lösen und Bedürfnisse zu erkennen, kann diese Fähigkeiten in Kundenservice-Rollen gezielt einsetzen.`, schritt: `Schreib drei Situationen auf, in denen du einem Kunden besonders gut geholfen oder eine schwierige Situation gelöst hast. Das sind deine stärksten Bewerbungsbeispiele.` }\n  ],\n  gastronomie: [\n    { titel: `Weiterentwicklung in der Gastronomie`, text: `Jahrelange Erfahrung in Küche oder Service zeigt Belastbarkeit, Teamfähigkeit und Qualitätsbewusstsein. Wer mehr Verantwortung übernehmen möchte, kann sich in Richtung Küchenleitung oder Serviceleitung entwickeln.`, schritt: `Sprich mit deinem aktuellen oder einem anderen Arbeitgeber über die Möglichkeit, mehr Verantwortung zu übernehmen, auch als ersten informellen Schritt.` },\n    { titel: `Catering und Veranstaltungsservice`, text: `Erfahrung aus Restaurant oder Küche lässt sich gut in Catering-Unternehmen oder den Eventbereich übertragen, oft mit flexibleren Arbeitszeiten.`, schritt: `Recherchiere Catering-Unternehmen in deiner Region und frage nach Möglichkeiten für erfahrene Servicekräfte.` }\n  ],\n  pflege: [\n    { titel: `Weiterentwicklung in Pflege und Betreuung`, text: `Pflege- und Betreuungserfahrung ist in Deutschland stark gefragt. Wer sich weiterentwickeln möchte, kann gezielte Fortbildungen machen, etwa zur Betreuungsassistenz, zur Teamleitung oder zur Praxisanleiterin.`, schritt: `Informiere dich bei deinem Arbeitgeber oder der zuständigen Pflegekammer über Fortbildungsangebote, die auf deiner bisherigen Erfahrung aufbauen.` },\n    { titel: `Koordination und Anleitung in sozialen Einrichtungen`, text: `Wer in der Pflege oder Betreuung Erfahrung hat und andere anleiten oder koordinieren kann, ist für Rollen als Teamleitung oder Bereichsverantwortliche gut aufgestellt.`, schritt: `Frage bei deinem Arbeitgeber nach internen Aufstiegsmöglichkeiten oder schau dir Stellenanzeigen für Teamleitungen in sozialen Einrichtungen an.` }\n  ],\n  handwerk: [\n    { titel: `Weiterentwicklung im Handwerk`, text: `Praktische Fertigkeiten und technisches Verständnis sind stark gefragt. Wer zuverlässig arbeitet und Fehler erkennt, hat eine solide Grundlage für eine Weiterentwicklung, etwa als Vorarbeiter oder Teamleitung.`, schritt: `Schau dir an, ob dein aktueller oder ein anderer Arbeitgeber Nachwuchskräfte für Leitungsaufgaben sucht.` },\n    { titel: `Selbstständigkeit im Handwerk`, text: `Wer handwerklich gut ist und einen Kundenstamm aufbauen kann, hat eine echte Basis für eine selbstständige Tätigkeit, ob im Haupt- oder Nebenerwerb.`, schritt: `Informiere dich bei der Handwerkskammer deiner Region über die Voraussetzungen für eine selbstständige Tätigkeit in deinem Bereich.` }\n  ],\n  buero: [\n    { titel: `Sachbearbeitung und Büroorganisation`, text: `Organisationsstärke, Sorgfalt und verlässliches Arbeiten sind in Verwaltung, Buchhaltung und Assistenzrollen gefragt, branchenübergreifend und in vielen Unternehmensgrößen.`, schritt: `Erstelle eine kurze Liste der Büro- und Verwaltungsaufgaben, die du in bisherigen Rollen übernommen hast. Das ist die Grundlage deiner nächsten Bewerbung.` },\n    { titel: `Projektassistenz und Koordination`, text: `Wer gut organisieren kann und den Überblick behält, ist in Assistenz- oder Koordinationsrollen wertvoll, auch ohne formale Zusatzausbildung.`, schritt: `Schau dir Stellenanzeigen für Assistenzrollen in Branchen an, die dich inhaltlich interessieren.` }\n  ],\n  reinigung: [\n    { titel: `Objektbetreuung und Facility-Koordination`, text: `Erfahrung in der Reinigung und Gebäudepflege zeigt Zuverlässigkeit, Qualitätsbewusstsein und Eigenverantwortung. Wer koordinieren oder anleiten kann, ist für Teamleitung oder Objektverantwortung gut aufgestellt.`, schritt: `Informiere dich bei Facility-Unternehmen oder Gebäudemanagern in deiner Region über Möglichkeiten zur Übernahme von Koordinationsaufgaben.` },\n    { titel: `Qualitätskontrolle und Objektverantwortung`, text: `Wer genau weiß, wie gute Reinigungsqualität aussieht und wie man sie sicherstellt, bringt echtes Fachwissen für Qualitätssicherungs- oder Objektleitungsrollen mit.`, schritt: `Frage bei deinem aktuellen Arbeitgeber nach, ob es interne Entwicklungsmöglichkeiten in Richtung Objektleitung oder Qualitätskontrolle gibt.` }\n  ],\n  bildung: [\n    { titel: `Training und Wissensweitergabe`, text: `Wer anderen gut erklären und beibringen kann, findet in Unternehmen, Bildungseinrichtungen oder auch selbstständig Möglichkeiten, dieses Talent einzusetzen.`, schritt: `Überlege, zu welchem Thema aus deiner Erfahrung du anderen etwas beibringen könntest, und schreib eine kurze Beschreibung davon auf.` }\n  ],\n  produktion: [\n    { titel: `Weiterentwicklung in Produktion und Fertigung`, text: `Erfahrung in der Produktion zeigt technisches Verständnis, Konzentrationsfähigkeit und Zuverlässigkeit. Wer Abläufe kennt und Verantwortung übernehmen möchte, kann sich in Richtung Schichtführung oder Qualitätskontrolle entwickeln.`, schritt: `Sprich mit deinem Vorgesetzten über die Möglichkeit, mehr Verantwortung in deiner aktuellen Abteilung zu übernehmen, zum Beispiel als Ansprechperson für neue Kolleginnen.` },\n    { titel: `Qualitätskontrolle und Prüfaufgaben`, text: `Wer in der Produktion ein gutes Auge für Fehler hat und sorgfältig arbeitet, bringt wertvolle Fähigkeiten für Qualitätssicherungsrollen mit.`, schritt: `Informiere dich bei deinem Arbeitgeber, ob es Möglichkeiten gibt, in der Qualitätskontrolle mitzuarbeiten oder eine entsprechende Weiterbildung zu machen.` }\n  ]\n};\n\nvar standardRollen = [\n  { titel: `Koordination und Teamunterstützung`, text: `Strukturierte, zuverlässige Menschen werden in fast allen Bereichen gesucht. Wer den Überblick behält, Abläufe in Ordnung hält und andere unterstützt, ist vielseitig einsetzbar.`, schritt: `Schreib auf, welche organisatorischen oder koordinierenden Aufgaben du in bisherigen Rollen übernommen hast, auch wenn sie nicht zu deiner offiziellen Stelle gehörten.` },\n  { titel: `Service und Betreuungsaufgaben`, text: `Wer gut mit Menschen umgehen, zuhören und in schwierigen Situationen ruhig bleiben kann, findet in Service-, Betreuungs- und Unterstützungsrollen eine gute Grundlage.`, schritt: `Überlege, in welchem Umfeld du am liebsten mit Menschen arbeiten würdest, und suche gezielt dort nach passenden Stellen.` },\n  { titel: `Weiterentwicklung im bisherigen Bereich`, text: `Der nächste Schritt muss kein kompletter Neustart sein. Spezialisierung, mehr Verantwortung oder bessere Rahmenbedingungen im bekannten Bereich können ebenso passend sein.`, schritt: `Schreib auf, was sich in deinem bisherigen Bereich ändern müsste, damit es wieder passt. Diese Liste hilft dir bei der Suche nach dem richtigen nächsten Arbeitgeber.` }\n];\n\nvar kiTexte = {\n  wenig:        `Digitale Werkzeuge müssen keine Hürde sein. Wer ein Smartphone bedient und E-Mails lesen kann, hat bereits eine gute Grundlage. Für den nächsten Schritt reichen oft einfache Werkzeuge wie eine Textverarbeitung oder ein Online-Jobportal.`,\n  grundlagen:   `Du nutzt bereits grundlegende digitale Werkzeuge. Das ist mehr, als viele denken. Für die Jobsuche und Bewerbung helfen dir Online-Jobportale wie Indeed oder Stepstone sowie eine einfache digitale Bewerbungsmappe.`,\n  gelegentlich: `Du probierst gelegentlich Neues aus. Das ist eine gute Haltung. Tools wie ChatGPT können dir beim Formulieren von Bewerbungsschreiben oder beim Recherchieren von Berufsmöglichkeiten helfen, kostenlos und ohne Vorkenntnisse.`,\n  regelmaessig: `Du nutzt digitale Werkzeuge regelmäßig. Das ist heute ein konkreter Vorteil. Beschreibe diese Kenntnisse in deinen Bewerbungsunterlagen konkret, also welche Werkzeuge du nutzt und wofür.`,\n  ki_aktiv:     `Du nutzt KI-Tools bereits aktiv. Das ist ein Vorteil, den du sichtbar machen kannst. Beschreibe in Bewerbungen konkret, wie du KI einsetzt, zum Beispiel für Recherche, Textentwürfe oder Vorbereitung.`,\n  angeleitet:   `Du hast andere beim Einsatz digitaler Werkzeuge begleitet. Das ist eine Vermittlungs- und Anleitungskompetenz, die in vielen Unternehmen gefragt ist, etwa für die Einführung neuer Systeme oder die Begleitung von Kolleginnen.`,\n  lernen:       `Der Wunsch, digitale Werkzeuge besser kennenzulernen, ist ein guter Ausgangspunkt. Starte mit einer konkreten Aufgabe: Öffne ChatGPT kostenlos im Browser und beschreibe deine berufliche Situation. Das ist ein echter erster Schritt ohne Vorkenntnisse.`\n};\n\nvar aktIndex = 0;\nvar antworten = {};\n\nfunction suche(text, liste) {\n  var t = (text || ``).toLowerCase();\n  for (var i = 0; i < liste.length; i++) { if (t.indexOf(liste[i]) !== -1) return true; }\n  return false;\n}\n\nfunction ermittleBerufsfelder(a) {\n  var gesamt = (a.beruf || ``) + ` ` + (a.erfahrungen || ``) + ` ` + (a.staerken || ``);\n  var gefunden = [];\n  var keys = Object.keys(bereiche);\n  for (var i = 0; i < keys.length; i++) {\n    if (suche(gesamt, bereiche[keys[i]]) && gefunden.indexOf(keys[i]) === -1) gefunden.push(keys[i]);\n  }\n  return gefunden;\n}\n\nfunction ermittleStaerken(a) {\n  var text = (a.staerken || ``) + ` ` + (a.beruf || ``) + ` ` + (a.erfahrungen || ``);\n  var gefunden = [];\n  var keys = Object.keys(staerkenMap);\n  for (var i = 0; i < keys.length; i++) {\n    if (suche(text, staerkenMap[keys[i]]) && gefunden.indexOf(keys[i]) === -1) gefunden.push(keys[i]);\n  }\n  return gefunden;\n}\n\nfunction ermittleKI(a) {\n  var ki = Array.isArray(a.digital) ? a.digital.join(` `).toLowerCase() : ``;\n  if (ki.indexOf(`angeleitet`) !== -1 || ki.indexOf(`unterstützt`) !== -1) return kiTexte.angeleitet;\n  if (ki.indexOf(`chatgpt`) !== -1 || ki.indexOf(`ki-tools`) !== -1) return kiTexte.ki_aktiv;\n  if (ki.indexOf(`regelmäßig`) !== -1) return kiTexte.regelmaessig;\n  if (ki.indexOf(`gelegentlich`) !== -1) return kiTexte.gelegentlich;\n  if (ki.indexOf(`kennenlernen`) !== -1 || ki.indexOf(`lernen`) !== -1) return kiTexte.lernen;\n  if (ki.indexOf(`grundlegende`) !== -1) return kiTexte.grundlagen;\n  return kiTexte.wenig;\n}\n\nfunction baueAnalyse(a) {\n  var felder = ermittleBerufsfelder(a);\n  var staerken = ermittleStaerken(a);\n  var ki = ermittleKI(a);\n  var aw = Array.isArray(a.arbeitsweise) ? a.arbeitsweise.join(` `) : ``;\n  var wunschText = (a.wunsch || ``).toLowerCase();\n  var wunschSelbst = wunschText.indexOf(`selbst`) !== -1 || aw.indexOf(`Selbstständig`) !== -1 || aw.indexOf(`eigenen Projekten`) !== -1;\n\n  var mitbringst = ``;\n  if (a.beruf && a.beruf.length > 5) {\n    mitbringst += `Du hast praktische Berufserfahrung gesammelt, die mehr zeigt als nur eine Tätigkeit: Sie zeigt, wie du tatsächlich arbeitest und was du in echten Situationen leisten kannst. `;\n  }\n  if (a.staerken && a.staerken.length > 5) {\n    var staerkenSatz = a.staerken.trim();\n    staerkenSatz = staerkenSatz.charAt(0).toUpperCase() + staerkenSatz.slice(1);\n    if (staerkenSatz.slice(-1) !== `.`) staerkenSatz += `.`;\n    mitbringst += `Was dir leicht fiel, sind oft genau die Fähigkeiten, die andere erst lernen müssen: ` + staerkenSatz + ` `;\n  }\n  if (a.erfahrungen && a.erfahrungen.length > 5) {\n    mitbringst += `Dazu kommen Kenntnisse und Erfahrungen aus anderen Lebensbereichen, die genauso zählen, auch wenn sie nicht auf einem Zertifikat stehen.`;\n  }\n  if (!mitbringst) {\n    mitbringst = `Auf Basis deiner Antworten lässt sich erkennen, dass du über Berufserfahrung und Fähigkeiten verfügst, die in verschiedenen Bereichen wertvoll sind. Mit etwas mehr Detail in den Antworten wäre eine noch präzisere Einschätzung möglich.`;\n  }\n\n  var kompetenzen = [];\n  for (var i = 0; i < Math.min(staerken.length, 3); i++) {\n    var name = staerkenNamen[staerken[i]] || (staerken[i].replace(`_`, ` `).charAt(0).toUpperCase() + staerken[i].replace(`_`, ` `).slice(1));\n    kompetenzen.push({ name: name, text: staerkenTexte[staerken[i]] });\n  }\n  if (kompetenzen.length === 0) {\n    kompetenzen.push({ name: `Berufliche Verlässlichkeit`, text: `Jahrelange Praxis in einem Berufsfeld ist eine Kompetenz, auch wenn sie sich schwer in einem Wort benennen lässt. Sie zeigt sich in Verlässlichkeit, Routine und dem Wissen, wie Dinge wirklich funktionieren.` });\n  }\n\n  var rollen = [];\n  for (var j = 0; j < felder.length && rollen.length < 4; j++) {\n    var db = rollenDB[felder[j]];\n    if (db) {\n      for (var k = 0; k < db.length && rollen.length < 4; k++) {\n        rollen.push(db[k]);\n      }\n    }\n  }\n  if (rollen.length < 2) {\n    for (var m = 0; m < standardRollen.length && rollen.length < 3; m++) rollen.push(standardRollen[m]);\n  }\n  if (wunschSelbst && rollen.length < 4) {\n    rollen.push({ titel: `Aufbau eines eigenen Angebots`, text: `Deine Berufserfahrung und Fähigkeiten lassen sich oft auch als eigenes Angebot einbringen, ob auf Projektbasis, freiberuflich oder als kleines eigenes Unternehmen. Der Einstieg muss nicht groß sein.`, schritt: `Formuliere in einem Satz, was du anderen anbieten würdest, wenn du morgen auf eigene Rechnung starten würdest. Nicht perfekt, nur ehrlich. Dieser Satz ist der Anfang.` });\n  }\n  rollen = rollen.slice(0, 4);\n\n  var schritt = ``;\n  if (wunschSelbst) {\n    schritt = `Formuliere in einem Satz, was du anderen anbieten würdest, wenn du morgen auf eigene Rechnung starten würdest. Nicht perfekt, nicht vollständig, nur ehrlich. Dieser Satz ist der Anfang von allem Weiteren.`;\n  } else if (wunschText.indexOf(`klarheit`) !== -1 || wunschText.indexOf(`orientierung`) !== -1) {\n    schritt = `Schreib auf, was du in deinem nächsten beruflichen Kapitel auf keinen Fall mehr haben möchtest. Nicht was du willst, erst was du sicher nicht mehr willst. Diese Liste ist oft klarer als jeder Plan.`;\n  } else if (rollen.length > 0) {\n    schritt = rollen[0].schritt;\n  } else {\n    schritt = `Schreib bis Ende der Woche drei Stellen heraus, die sich auf den ersten Blick interessant anfühlen. Nicht um dich zu bewerben, nur um zu sehen, was dich anzieht und was nicht.`;\n  }\n\n  var schluss = `Fähigkeiten verschwinden nicht durch eine Kündigung oder einen beruflichen Einschnitt. Sie werden manchmal nur vorübergehend unsichtbar, auch für einen selbst. Manchmal braucht es lediglich einen anderen Blick auf das eigene Können, um wieder zu erkennen, was wirklich da ist.`;\n  if (wunschSelbst) {\n    schluss = `Der Wunsch nach mehr Eigenverantwortung ist kein Zufall. Er zeigt, dass du weißt, was du kannst und wie du arbeiten möchtest. Das ist eine gute Grundlage für den nächsten Schritt, egal in welche Richtung er geht.`;\n  }\n\n  return { mitbringst: mitbringst, kompetenzen: kompetenzen, rollen: rollen, ki: ki, schritt: schritt, schluss: schluss };\n}\n\nfunction zeigeScreen(id) {\n  var alle = document.querySelectorAll(`.screen`);\n  for (var i = 0; i < alle.length; i++) alle[i].classList.remove(`an`);\n  document.getElementById(id).classList.add(`an`);\n  window.scrollTo({ top: 0, behavior: `smooth` });\n}\n\nfunction rendere() {\n  var f = fragen[aktIndex];\n  var total = fragen.length;\n  var pct = Math.round((aktIndex / total) * 100);\n  document.getElementById(`prog-label`).textContent = `Frage ` + (aktIndex + 1) + ` von ` + total;\n  document.getElementById(`prog-pct`).textContent = pct + ` %`;\n  document.getElementById(`prog-fill`).style.width = pct + `%`;\n\n  var html = `<p class=\"fragetext\">` + f.text + `</p>`;\n  if (f.hinweis) html += `<p class=\"fragenhinweis\">` + f.hinweis + `</p>`;\n\n  if (f.typ === `text`) {\n    html += `<textarea id=\"ta\" placeholder=\"` + (f.platzhalter || ``) + `\" rows=\"5\">` + (antworten[f.id] || ``) + `</textarea>`;\n  } else {\n    html += `<div class=\"cb-gruppe\">`;\n    var sel = antworten[f.id] || [];\n    for (var i = 0; i < f.optionen.length; i++) {\n      var opt = f.optionen[i];\n      var an = sel.indexOf(opt) !== -1;\n      html += `<div class=\"cb-item` + (an ? ` an` : ``) + `\" data-fid=\"` + f.id + `\" data-oi=\"` + i + `\" role=\"checkbox\" aria-checked=\"` + an + `\" tabindex=\"0\">`;\n      html += `<div class=\"cb-kasten\">` + (an ? `&#10003;` : ``) + `</div>`;\n      html += `<span class=\"cb-label\">` + opt + `</span></div>`;\n    }\n    html += `</div>`;\n  }\n\n  document.getElementById(`frage-container`).innerHTML = html;\n\n  document.getElementById(`frage-container`).onclick = function(e) {\n    var item = e.target;\n    while (item && !item.classList.contains(`cb-item`)) item = item.parentElement;\n    if (!item) return;\n    toggleCB(item);\n  };\n\n  document.getElementById(`frage-container`).onkeydown = function(e) {\n    if (e.key === ` ` || e.key === `Enter`) {\n      var item = e.target;\n      if (item && item.classList.contains(`cb-item`)) { e.preventDefault(); toggleCB(item); }\n    }\n  };\n}\n\nfunction toggleCB(item) {\n  var fid = item.getAttribute(`data-fid`);\n  var oi = parseInt(item.getAttribute(`data-oi`));\n  var opt = fragen[aktIndex].optionen[oi];\n  if (!antworten[fid]) antworten[fid] = [];\n  var idx = antworten[fid].indexOf(opt);\n  if (idx === -1) {\n    antworten[fid].push(opt);\n    item.classList.add(`an`);\n    item.setAttribute(`aria-checked`, `true`);\n    item.querySelector(`.cb-kasten`).textContent = `\\u2713`;\n  } else {\n    antworten[fid].splice(idx, 1);\n    item.classList.remove(`an`);\n    item.setAttribute(`aria-checked`, `false`);\n    item.querySelector(`.cb-kasten`).textContent = ``;\n  }\n}\n\nfunction weiter() {\n  var f = fragen[aktIndex];\n  if (f.typ === `text`) {\n    var ta = document.getElementById(`ta`);\n    antworten[f.id] = ta ? ta.value.trim() : ``;\n  }\n  if (aktIndex < fragen.length - 1) {\n    aktIndex++;\n    rendere();\n    window.scrollTo({ top: 0, behavior: `smooth` });\n  } else {\n    analyseStarten();\n  }\n}\n\nvar PROXY_URL = `https://leichtart-proxy.onrender.com/analyse`;\n\nfunction analyseStarten() {\n  zeigeScreen(`s-laden`);\n  var ladeIdx = 0;\n  var ladeEl = document.getElementById(`lade-text`);\n  var iv = setInterval(function() {\n    ladeIdx = (ladeIdx + 1) % ladeTexte.length;\n    ladeEl.textContent = ladeTexte[ladeIdx];\n  }, 1800);\n\n  // Bis zu 3 Versuche, falls der Server gerade aufwacht oder die KI hakt\n  var wartezeiten = [0, 4000, 10000];\n  var versuch = 0;\n  var datenZumSenden = JSON.stringify({ antworten: antworten });\n\n  function sendeAnfrage() {\n    fetch(PROXY_URL, {\n      method: `POST`,\n      headers: { \"Content-Type\": `application/json` },\n      body: datenZumSenden\n    })\n    .then(function(r) { return r.json(); })\n    .then(function(d) {\n      if (d && d.text) { clearInterval(iv); zeigeErgebnisKI(d.text); return; }\n      throw new Error((d && d.error) || `Leere Antwort`);\n    })\n    .catch(function(err) {\n      console.log(`Versuch ` + (versuch + 1) + ` fehlgeschlagen:`, err && err.message);\n      versuch++;\n      if (versuch < wartezeiten.length) {\n        setTimeout(sendeAnfrage, wartezeiten[versuch]);\n      } else {\n        clearInterval(iv);\n        zeigeFehlerFreundlich();\n      }\n    });\n  }\n  sendeAnfrage();\n}\n\nfunction zeigeErgebnisKI(text) {\n  zeigeScreen(`s-ergebnis`);\n\n  var keys = [`Einstieg`, `Was du mitbringst`, `Welche Fähigkeiten besonders sichtbar werden`, `Welche Möglichkeiten sich zeigen`, `Digitale Werkzeuge`, `Dein nächster Schritt`, `Ein letzter Gedanke`];\n\n  function escR(s) { return s.replace(/[.*+?^${}()|[\\]\\\\]/g, `\\\\$&`); }\n\n  function parseAbschnitt(txt, key, naechster) {\n    var rx = naechster\n      ? new RegExp(`##\\\\s*` + escR(key) + `\\\\s*\\\\n([\\\\s\\\\S]*?)(?=##\\\\s*` + escR(naechster) + `)`, `i`)\n      : new RegExp(`##\\\\s*` + escR(key) + `\\\\s*\\\\n([\\\\s\\\\S]*)`, `i`);\n    var m = txt.match(rx);\n    return m ? m[1].trim() : ``;\n  }\n\n  text = String(text).replace(/\\s*-{3,}\\s*$/gm, ``).replace(/^\\s*-{3,}\\s*/gm, ``);\n  var ab = {};\n  keys.forEach(function(key, i) { ab[key] = parseAbschnitt(text, key, keys[i+1] || null); });\n\n  function textZuHtml(txt) {\n    if (!txt) return ``;\n    return txt.split(`\\n`).filter(function(z){ return z.trim(); }).map(function(z) {\n      z = z.replace(/\\*\\*(.*?)\\*\\*/g, `<strong>$1</strong>`);\n      if (z.match(/^[\\*\\-]\\s+/)) return `<li>` + z.replace(/^[\\*\\-]\\s+/, ``) + `</li>`;\n      return `<p>` + z + `</p>`;\n    }).join(``);\n  }\n\n  var ergebnisAlsText = text.replace(/<[^>]+>/g, ``);\n  document.getElementById(`s-ergebnis`).setAttribute(`data-erg`, ergebnisAlsText);\n\n  var html = `<div class=\"einleitungsbox\"><p>` + (ab[`Einstieg`] || ``).replace(/\\n/g, ` `) + `</p></div>`;\n\n  [`Was du mitbringst`, `Welche Fähigkeiten besonders sichtbar werden`, `Welche Möglichkeiten sich zeigen`, `Digitale Werkzeuge`].forEach(function(key) {\n    if (!ab[key]) return;\n    var inhalt = textZuHtml(ab[key]);\n    if (inhalt.indexOf(`<li>`) !== -1) inhalt = `<ul>` + inhalt + `</ul>`;\n    html += `<div class=\"rbox\"><div class=\"abschnittstitel\">` + key + `</div><div class=\"rtext\">` + inhalt + `</div></div>`;\n  });\n\n  if (ab[`Dein nächster Schritt`]) {\n    html += `<div class=\"rbox\"><div class=\"abschnittstitel\">Dein nächster Schritt</div><div class=\"schrittbox\"><p>` + ab[`Dein nächster Schritt`].replace(/\\n/g, ` `) + `</p></div></div>`;\n  }\n  if (ab[`Ein letzter Gedanke`]) {\n    html += `<div class=\"rbox\"><div class=\"abschnittstitel\">Ein letzter Gedanke</div><div class=\"abschlussbox\"><p>` + ab[`Ein letzter Gedanke`].replace(/\\n/g, ` `) + `</p></div></div>`;\n  }\n\n  document.getElementById(`ergebnis-inhalt`).innerHTML = html;\n}\n\nfunction zeigeFehlerFreundlich() {\n  zeigeScreen(`s-ergebnis`);\n  var pb = document.getElementById(`pdf-bereich`);\n  if (pb) pb.style.display = `none`;\n  document.getElementById(`ergebnis-inhalt`).innerHTML = `<div class=\"einleitungsbox\"><p>Deine Auswertung konnte gerade nicht erstellt werden. Das liegt nicht an deinen Antworten, sondern an einem technischen Problem auf meiner Seite.</p><p>Bitte versuch es in ein paar Minuten noch einmal, indem du die Seite neu lädst. Oder schreib mir direkt: <a href=\"mailto:kontakt@leichtART.com\" class=\"hinweislink\">kontakt@leichtART.com</a></p></div>`;\n}\n\nfunction zeigeErgebnisLokal() {\n  zeigeErgebnis(baueAnalyse(antworten));\n}\n\nfunction baueErgebnisText(e) {\n  var zeilen = [];\n  zeilen.push(`KARRIERE-KOMPASS AUSWERTUNG von leichtART`);\n  zeilen.push(``);\n  zeilen.push(`Was du mitbringst:`);\n  zeilen.push(e.mitbringst);\n  zeilen.push(``);\n  zeilen.push(`Welche Fähigkeiten besonders sichtbar werden:`);\n  for (var i = 0; i < e.kompetenzen.length; i++) {\n    zeilen.push(e.kompetenzen[i].name + `: ` + e.kompetenzen[i].text);\n  }\n  zeilen.push(``);\n  zeilen.push(`Welche Möglichkeiten sich zeigen:`);\n  for (var j = 0; j < e.rollen.length; j++) {\n    zeilen.push(e.rollen[j].titel + `: ` + e.rollen[j].text);\n  }\n  zeilen.push(``);\n  zeilen.push(`Digitale Werkzeuge:`);\n  zeilen.push(e.ki);\n  zeilen.push(``);\n  zeilen.push(`Dein nächster Schritt:`);\n  zeilen.push(e.schritt);\n  zeilen.push(``);\n  zeilen.push(`Abschließender Gedanke:`);\n  zeilen.push(e.schluss);\n  zeilen.push(``);\n  zeilen.push(`---`);\n  zeilen.push(`Weitere Informationen: leichtART.com`);\n  return zeilen.join(`\\n`);\n}\n\nfunction zeigeErgebnis(e) {\n  zeigeScreen(`s-ergebnis`);\n\n  document.getElementById(`s-ergebnis`).setAttribute(`data-erg`, baueErgebnisText(e));\n\n  var html = ``;\n  html += `<div class=\"einleitungsbox\"><p>Diese Auswertung basiert auf dem, was du beschrieben hast. Sie zeigt, welche Fähigkeiten hinter deiner bisherigen Arbeit stecken und welche Möglichkeiten sich daraus ergeben.</p></div>`;\n\n  html += `<div class=\"rbox\"><div class=\"abschnittstitel\">&#10022; Was du mitbringst</div><div class=\"rtext\"><p>` + e.mitbringst + `</p></div></div>`;\n\n  html += `<div class=\"rbox\"><div class=\"abschnittstitel\">&#9672; Welche Fähigkeiten besonders sichtbar werden</div><div class=\"rtext\">`;\n  for (var i = 0; i < e.kompetenzen.length; i++) {\n    html += `<div class=\"kompetenzkarte\"><div class=\"kompetenztitel\">` + e.kompetenzen[i].name + `</div><div class=\"kompetenztext\">` + e.kompetenzen[i].text + `</div></div>`;\n  }\n  html += `</div></div>`;\n\n  html += `<div class=\"rbox\"><div class=\"abschnittstitel\">&rarr; Welche Möglichkeiten sich zeigen</div><div class=\"rtext\">`;\n  for (var j = 0; j < e.rollen.length; j++) {\n    html += `<div class=\"kompetenzkarte\"><div class=\"kompetenztitel\">` + e.rollen[j].titel + `</div><div class=\"kompetenztext\">` + e.rollen[j].text + `</div></div>`;\n  }\n  html += `</div></div>`;\n\n  html += `<div class=\"rbox\"><div class=\"abschnittstitel\">&#9702; Digitale Werkzeuge</div><div class=\"rtext\"><p>` + e.ki + `</p></div></div>`;\n\n  html += `<div class=\"rbox\"><div class=\"abschnittstitel\">&#9656; Dein nächster Schritt</div><div class=\"schrittbox\"><p>` + e.schritt + `</p></div></div>`;\n\n  html += `<div class=\"rbox\"><div class=\"abschnittstitel\">&#9673; Abschließender Gedanke</div><div class=\"abschlussbox\"><p>` + e.schluss + `</p></div></div>`;\n\n  document.getElementById(`ergebnis-inhalt`).innerHTML = html;\n}\n\nvar SENDE_URL = `https://leichtart-proxy.onrender.com/auswertung-senden`;\n\nfunction zeigeFeldfehler(id) {\n  var feld = document.getElementById(id + `-feld`);\n  var hinweis = document.getElementById(id + `-hinweis`);\n  if (feld) { feld.classList.add(`fehler`); feld.focus(); }\n  if (hinweis) hinweis.style.display = `block`;\n}\n\nfunction sendeAuswertung(email, vorname, newsletter) {\n  var ergebnis = document.getElementById(`s-ergebnis`).getAttribute(`data-erg`) || ``;\n  var btn = document.getElementById(`btn-pdf`);\n  if (btn) { btn.disabled = true; btn.textContent = `Wird gesendet ...`; }\n\n  fetch(SENDE_URL, {\n    method: `POST`,\n    headers: { \"Content-Type\": `application/json` },\n    body: JSON.stringify({ email: email, vorname: vorname, newsletter: newsletter, text: ergebnis })\n  })\n  .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, d: d }; }); })\n  .then(function(x) {\n    if (x.d && x.d.grund === `email`) {\n      if (btn) { btn.disabled = false; btn.textContent = `Eintragen`; }\n      zeigeFeldfehler(`email`);\n      return;\n    }\n    if (!x.ok || !x.d || !x.d.ok) throw new Error(`Versand fehlgeschlagen`);\n    document.getElementById(`pdf-bereich`).innerHTML = `<div class=\"bestaetigung\"><p>&#10003; Danke! Die Mail ist unterwegs. Sie kommt in den nächsten Minuten bei dir an. Schau zur Sicherheit auch im Spam-Ordner nach.</p></div>`;\n  })\n  .catch(function() {\n    document.getElementById(`pdf-bereich`).innerHTML = `<div class=\"einleitungsbox\"><p>Das Eintragen hat leider nicht geklappt. Speichere dir am besten deine Auswertung als PDF, dann geht nichts verloren. Oder schreib mir an <a href=\"mailto:kontakt@leichtART.com\" class=\"hinweislink\">kontakt@leichtART.com</a>, dann helfe ich dir weiter.</p></div>`;\n  });\n}\n\ndocument.getElementById(`btn-start`).onclick = function() {\n  zeigeScreen(`s-frage`);\n  rendere();\n};\n\ndocument.getElementById(`btn-weiter`).onclick = weiter;\n\ndocument.addEventListener(`click`, function(e) {\n  if (e.target && e.target.id === `btn-pdf`) {\n    var vornameEl = document.getElementById(`vorname-feld`);\n    var vorname = vornameEl ? vornameEl.value.trim() : ``;\n    var emailEl = document.getElementById(`email-feld`);\n    var email = emailEl ? emailEl.value.replace(/\\s+/g, ``) : ``;\n    if (emailEl) emailEl.value = email;\n    if (!vorname) { zeigeFeldfehler(`vorname`); return; }\n    if (!email || !email.match(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/)) { zeigeFeldfehler(`email`); return; }\n    var nlEl = document.getElementById(`newsletter-check`);\n    sendeAuswertung(email, vorname, nlEl ? nlEl.checked : false);\n  }\n  if (e.target && e.target.id === `btn-speichern`) {\n    var d = new Date();\n    var datum = (`0` + d.getDate()).slice(-2) + `.` + (`0` + (d.getMonth() + 1)).slice(-2) + `.` + d.getFullYear();\n    var dEl = document.getElementById(`druck-datum`);\n    if (dEl) dEl.textContent = datum;\n    var alterTitel = document.title;\n    document.title = `Karriere-Kompass Auswertung ` + datum;\n    window.print();\n    setTimeout(function() { document.title = alterTitel; }, 1000);\n  }\n  if (e.target && e.target.id === `btn-kein-pdf`) {\n    document.getElementById(`pdf-bereich`).style.display = `none`;\n  }\n});\n\ndocument.addEventListener(`input`, function(e) {\n  if (e.target && (e.target.id === `email-feld` || e.target.id === `vorname-feld`)) {\n    e.target.classList.remove(`fehler`);\n    var h = document.getElementById(e.target.id.replace(`-feld`, `-hinweis`));\n    if (h) h.style.display = `none`;\n  }\n});\n\n})();\n</script>\n</body>\n</html>\n";
const ERLAUBTE_ORIGINS = [
  'https://leichtART.com',
  'https://www.leichtART.com',
  'http://localhost'
];

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function claudeAnfrage(body, callback) {
  const payload = JSON.stringify(body);
  const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + ANTHROPIC_API_KEY,
      'HTTP-Referer': 'https://leichtART.com',
      'X-Title': 'Karriere-Kompass leichtART',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, function(res) {
    const teile = [];
    res.on('data', function(chunk) { teile.push(chunk); });
    res.on('end', function() {
      const data = Buffer.concat(teile).toString('utf8');
      try {
        callback(null, JSON.parse(data));
      } catch(e) {
        callback(new Error('Ungueltige Antwort von Claude'));
      }
    });
  });

  req.on('error', function(e) { callback(e); });
  req.write(payload);
  req.end();
}

// Auswertung fuer die Mail lesbar machen (ohne ##, ** und ---)
function bereiteTextAuf(text) {
  return String(text)
    .replace(/\r/g, '')
    .replace(/^##\s*(.+)$/gm, function(_, titel) { return '\n' + titel.trim().toUpperCase(); })
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^\s*[\*\-]\s+/gm, '• ')
    .replace(/\s*-{3,}\s*$/gm, '').replace(/^\s*-{3,}\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .substring(0, 15000);
}

// Eine Anfrage an die Alfima-API schicken. Antwort: Status und (wenn möglich) gelesenes JSON
function alfimaPost(inhalt, callback) {
  const payload = JSON.stringify(inhalt);
  const anfrage = https.request({
    hostname: 'app.alfima.com',
    path: '/api/v1/contacts',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + ALFIMA_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, function(antwort) {
    const teile = [];
    antwort.on('data', function(c) { teile.push(c); });
    antwort.on('end', function() {
      const koerper = Buffer.concat(teile).toString('utf8');
      let json = null;
      try { json = JSON.parse(koerper); } catch (e) {}
      callback(antwort.statusCode, json);
    });
  });
  anfrage.on('error', function(e) {
    console.log('Verbindungsfehler zu Alfima: ' + e.message);
    callback(0, null);
  });
  anfrage.write(payload);
  anfrage.end();
}

// (Hilfsfunktion zur Fehlersuche) Nur die Namen der Felder einer Antwort auflisten, nie die Inhalte (keine Kundendaten im Log)
function feldnamen(obj, praefix, tiefe) {
  if (!obj || typeof obj !== 'object' || tiefe > 3) return [];
  let liste = [];
  Object.keys(obj).forEach(function(k) {
    const name = praefix ? praefix + '.' + k : k;
    liste.push(name);
    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      liste = liste.concat(feldnamen(obj[k], name, tiefe + 1));
    }
  });
  return liste;
}

// Fehlermeldung von Alfima kurz und ohne Kundendaten ins Log schreiben
function protokolliereFehler(status, json) {
  let text = '';
  if (json && json.errors) {
    text = Object.keys(json.errors).map(function(k) {
      return k + ': ' + [].concat(json.errors[k]).join(' ');
    }).join(' | ');
  } else if (json && json.detail) {
    text = json.detail;
  }
  console.log('Alfima-Fehler Status ' + status + (text ? ' | ' + text : ''));
}

function istEmailFehler(json) {
  return !!(json && json.errors && json.errors.email);
}

// Kontakt bei Alfima anlegen bzw. aktualisieren (Vorname, Liste). Die Auswertung selbst geht nicht an Alfima,
// weil die Alfima-API keine eigenen Felder speichert.
// callback(ergebnis): 'ok', 'email' (Adresse abgelehnt) oder 'fehler'
function schickeAnAlfima(email, vorname, callback) {
  const inhalt = { email: email };
  if (vorname) inhalt.first_name = vorname;
  if (ALFIMA_LISTE_ID) inhalt.list_ids = [Number(ALFIMA_LISTE_ID)];

  alfimaPost(inhalt, function(status, json) {
    if (status === 200 || status === 201) {
      console.log('Alfima-Antwort Status ' + status);
      callback('ok');
      return;
    }
    protokolliereFehler(status, json);
    callback(istEmailFehler(json) ? 'email' : 'fehler');
  });
}

// Wer das Häkchen gesetzt hat, kommt zusätzlich auf die Newsletter-Liste (mit Double-Opt-in)
function trageInNewsletterEin(email, vorname) {
  if (!ALFIMA_NEWSLETTER_ID) {
    console.log('Hinweis: Newsletter-Häkchen gesetzt, aber ALFIMA_NEWSLETTER_ID ist bei Render nicht eingetragen.');
    return;
  }
  const inhalt = { email: email, list_ids: [Number(ALFIMA_NEWSLETTER_ID)], double_opt_in: true };
  if (vorname) inhalt.first_name = vorname;
  alfimaPost(inhalt, function(status, json) {
    if (status === 200 || status === 201) {
      console.log('Newsletter-Eintrag Status ' + status);
    } else {
      protokolliereFehler(status, json);
    }
  });
}

const server = http.createServer(function(req, res) {

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Kompass-Seite unter der geheimen Adresse ausliefern
  const pfad = req.url.split('?')[0].replace(/\/$/, '');
  if (req.method === 'GET' && pfad === KOMPASS_PFAD) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(KOMPASS_HTML);
    return;
  }

  // Auswertung an Alfima schicken (Feld kk_auswertung beim Kontakt)
  if (req.method === 'POST' && req.url === '/auswertung-senden') {
    const teile = [];
    let groesse = 0;
    req.on('data', function(chunk) {
      teile.push(chunk);
      groesse += chunk.length;
      if (groesse > 60000) {
        sendJson(res, 413, { ok: false, error: 'Anfrage zu gross' });
        req.destroy();
      }
    });
    req.on('end', function() {
      let daten;
      try {
        daten = JSON.parse(Buffer.concat(teile).toString('utf8'));
      } catch (e) {
        sendJson(res, 400, { ok: false, error: 'Ungueltige Anfrage' });
        return;
      }
      const email = String(daten.email || '').replace(/\s+/g, '');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 255) {
        sendJson(res, 400, { ok: false, grund: 'email', error: 'Ungueltige E-Mail-Adresse' });
        return;
      }
      const vorname = String(daten.vorname || '').trim().substring(0, 60);
      if (!ALFIMA_API_KEY) {
        console.log('FEHLER: ALFIMA_API_KEY ist bei Render nicht eingetragen.');
        sendJson(res, 500, { ok: false, error: 'Versand nicht eingerichtet' });
        return;
      }
      schickeAnAlfima(email, vorname, function(ergebnis) {
        if (ergebnis === 'ok') {
          sendJson(res, 200, { ok: true });
          if (daten.newsletter === true) {
            // etwas später, damit die Auswertungs-Mail zuerst ausgelöst wird
            setTimeout(function() { trageInNewsletterEin(email, vorname); }, 5000);
          }
        } else if (ergebnis === 'email') {
          sendJson(res, 400, { ok: false, grund: 'email' });
        } else {
          sendJson(res, 502, { ok: false });
        }
      });
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('leichtART Karriere-Kompass API – aktiv');
    return;
  }

  if (req.method === 'GET' && req.url === '/test') {
    const testPayload = JSON.stringify({
      model: 'anthropic/claude-sonnet-4.6',
      max_tokens: 100,
      messages: [
        { role: 'system', content: 'Antworte nur mit: OK' },
        { role: 'user', content: 'Test' }
      ]
    });

    const testOptions = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + ANTHROPIC_API_KEY,
        'HTTP-Referer': 'https://leichtART.com',
        'X-Title': 'Karriere-Kompass leichtART',
        'Content-Length': Buffer.byteLength(testPayload)
      }
    };

    const testReq = https.request(testOptions, function(testRes) {
      let data = '';
      testRes.on('data', function(chunk) { data += chunk; });
      testRes.on('end', function() {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('OpenRouter Antwort:\n' + data);
      });
    });
    testReq.on('error', function(e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Verbindungsfehler: ' + e.message);
    });
    testReq.write(testPayload);
    testReq.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/analyse') {
    const teile = [];
    let groesse = 0;
    req.on('data', function(chunk) {
      teile.push(chunk);
      groesse += chunk.length;
      if (groesse > 50000) {
        sendJson(res, 413, { error: 'Anfrage zu gross' });
        req.destroy();
      }
    });
    req.on('end', function() {
      const body = Buffer.concat(teile).toString('utf8');
      let daten;
      try {
        daten = JSON.parse(body);
      } catch(e) {
        sendJson(res, 400, { error: 'Ungueltige Anfrage' });
        return;
      }

      if (!daten.antworten) {
        sendJson(res, 400, { error: 'Keine Antworten gefunden' });
        return;
      }

      const a = daten.antworten;
      const digital = Array.isArray(a.digital) ? a.digital.join(', ') : (a.digital || 'keine Angabe');
      const arbeitsweise = Array.isArray(a.arbeitsweise) ? a.arbeitsweise.join(', ') : (a.arbeitsweise || 'keine Angabe');

      const systemPrompt = `Du bist der Karriere-Kompass von leichtART. Deine Aufgabe ist nicht, Berufe zu empfehlen. Deine Aufgabe ist es, Lebensgeschichten in Kompetenzen zu übersetzen und daraus realistische berufliche Möglichkeiten abzuleiten.

GRUNDPRINZIP: KOMPETENZÜBERSETZUNG

Übernimm niemals eine Tätigkeit wörtlich als Kompetenz. Übersetze sie immer in die dahinterliegenden menschlichen Fähigkeiten.

Beispiele für diese Übersetzung:
- "Kartoffeln schälen" bedeutet: Sorgfalt, Routinefähigkeit, Versorgungskompetenz, zuverlässige Ausführung
- "Familie organisiert" bedeutet: Planung, Koordination, Prioritätensetzung, Konfliktlösung, Verantwortung für andere, Ressourcenmanagement
- "Waren verräumt" bedeutet: Organisation, Genauigkeit, Prozessverständnis, Qualitätsbewusstsein
- "Maschinen bedient" bedeutet: Fehlererkennung, Konzentration, Prozessdenken, Verantwortungsbewusstsein
- "Team geleitet" bedeutet: Führungskompetenz, Personalentwicklung, Konfliktmanagement, Orientierung geben

DENKWEISE: MEHRDIMENSIONAL

Denke nicht linear Antwort zu Beruf. Denke: Antwort, dann Kompetenzen erkennen, dann Persönlichkeitsmuster verstehen, dann Arbeitsweise berücksichtigen, dann Motivatoren einbeziehen, dann Rahmenbedingungen prüfen, dann Berufliche Möglichkeiten ableiten.

WÜNSCHE UND AUSSCHLUSSKRITERIEN STARK GEWICHTEN

Die Antworten auf Frage 5 und 6 sind besonders wichtig. Sie zeigen was jemand braucht.

Beispiele:
- "mehr Wertschätzung" bedeutet: diese Person sucht ein Umfeld das ihre Leistung sieht und anerkennt
- "halbtags arbeiten" ist eine klare Rahmenbedingung, keine Einschränkung
- "weniger Stress" bedeutet: Strukturiertheit und Planbarkeit sind wichtig
- "nicht mehr gemobbt werden" bedeutet: Sicherheit und Vertrauen sind Grundbedingungen
- "ortsunabhängig" ist Voraussetzung, nicht Option
- "nicht dauernd am Computer sitzen" bedeutet: Mindestens ein Teil der Richtungen muss Bewegung, Begegnung mit Menschen oder Arbeit vor Ort enthalten. Schlage dann nicht nur Bildschirmarbeit vor.

Jede vorgeschlagene Richtung muss zu den Wünschen aus Frage 5 und 6 passen. Wenn eine Richtung einem Wunsch nur teilweise entspricht, zum Beispiel weil sie viel Arbeit am Computer bedeutet, obwohl die Person das weniger möchte, sprich das in einem freundlichen, sachlichen Satz an und zeige, wie es trotzdem passen könnte. Formuliere das so, dass es die Person nicht verunsichert, sondern ihr hilft, die Richtung einzuordnen.

FÜHRUNGSKOMPETENZ AKTIV ERKENNEN

Wenn jemand erwähnt: Team geleitet, Verein aufgebaut, andere angeleitet, Gruppe koordiniert, Verantwortung übernommen, Förderverein organisiert, dann ist das Führungskompetenz. Benenne sie klar.

BREITES SPEKTRUM AN BERUFLICHEN MÖGLICHKEITEN

Je nach Profil können passen: Projektmanagement, Qualitätsmanagement, Wissensmanagement, Office Management, Assistenz auf Führungsebene, Verwaltung, öffentlicher Dienst, Bildung und Training, Prozessmanagement, Dokumentation, Archiv, Bibliothekswesen, Gesundheitswesen, Einkauf, Eventmanagement, Selbstständigkeit.

Nicht automatisch empfehlen: Personal, Marketing, Service, Einzelhandel, wenn das nicht aus den konkreten Antworten hervorgeht.

AUFBAU DER AUSWERTUNG mit diesen genauen Überschriften:

## Einstieg
Zwei bis drei Sätze. Direkt auf diese Person bezogen. Zeige dass du wirklich gelesen hast was sie geschrieben hat. Kein Mitleid, kein Überschwang.

## Was du mitbringst
Übersetze die beschriebenen Tätigkeiten in konkrete menschliche Fähigkeiten. Niemals die Tätigkeit wörtlich wiederholen. Zeige Zusammenhänge. Maximal 180 Wörter.

## Welche Fähigkeiten besonders sichtbar werden
Nenne zwei bis vier Kompetenzen. Jede mit einem Satz, woran du sie erkennst. Kompetenzbezeichnungen immer korrekt: "Umgang mit Menschen", "Führungskompetenz", "Organisationsstärke".

## Welche Möglichkeiten sich zeigen
Mindestens drei, maximal fünf Richtungen. Für jede: konkrete Begründung mit direktem Bezug auf die Antworten. Wünsche aus Frage 5 und 6 als Rahmenbedingungen berücksichtigen.

## Digitale Werkzeuge
Ein bis zwei Sätze, angepasst an den tatsächlichen Erfahrungsstand. Wenn es zum Profil passt, nenne eine konkrete Möglichkeit zur Weiterbildung, zum Beispiel zu Digitalisierung, IT oder KI.

## Dein nächster Schritt
Genau einen einzigen konkreten realistischen Schritt. Keine Liste. Direkt auf diese Person zugeschnitten.

## Ein letzter Gedanke
Zwei bis drei ruhige Sätze. Zeige, was du in dieser Person siehst: was sie bereits mitbringt, zum Beispiel berufliche Erfahrung, Fertigkeiten, Kenntnisse und Lebenserfahrung, auch außerhalb des Berufs, und was schon in ihr steckt, zum Beispiel Talente und Fähigkeiten. Nicht, was sie noch leisten soll.

SPRACHE: Professionelles Standarddeutsch mit korrekter Groß- und Kleinschreibung. Konsequente du-Ansprache. Groß geschrieben nur nach Punkt oder am Satzanfang. Keine Gedankenstriche. Keine Coaching-Floskeln. Keine Verkaufssprache. Schreibe immer mit ä, ö, ü und ß, niemals ae, oe, ue oder ss als Ersatz. Nenne keine konkreten Websites, Plattformen oder Anbieter. Verweise höchstens allgemein auf Volkshochschulen, die Agentur für Arbeit, die IHK oder Bildungsträger. Verwende keine weiblichen oder männlichen Formen, wenn das Geschlecht nicht ausdrücklich aus den Antworten hervorgeht. Formuliere dann neutral, zum Beispiel ‚als Fachkraft‘ statt ‚als Fachfrau‘ oder ‚Kursleitung‘ statt ‚Kursleiterin‘, ohne Gendersternchen oder Doppelpunkt und ohne Doppelformen wie ‚Beraterinnen und Berater‘. Schreibe dann zum Beispiel ‚freiberufliche Fachleute‘ oder ‚andere in der Beratung‘.

ANGABEN GENAU ÜBERNEHMEN: Übernimm Abschlüsse, Berufsbezeichnungen und Ausbildungen inhaltlich genau so, wie sie in den Antworten stehen. Erfinde keine anderen Bezeichnungen. Mach zum Beispiel aus ‚Kommunikationswirtin‘ keine ‚Kommunikationswissenschaft‘. Tippfehler und Rechtschreibfehler in den Antworten korrigierst du dabei stillschweigend.

Prüfe am Ende Grammatik und Zeichensetzung deiner Auswertung, zum Beispiel Artikel und Kommas.`;

      const userPrompt = `Hier sind die Antworten der Person:

Zuletzt gearbeitet:
${a.beruf || 'keine Angabe'}

Was leichter fiel als anderen:
${a.staerken || 'keine Angabe'}

Erfahrungen auch außerhalb der Arbeit:
${a.erfahrungen || 'keine Angabe'}

Erfahrungen mit digitalen Werkzeugen:
${digital}

Gewünschte Arbeitsweise:
${arbeitsweise}

Was sich verändern soll:
${a.wunsch || 'keine Angabe'}

Bitte erstelle jetzt die persönliche Karriere-Kompass-Auswertung auf Basis dieser Antworten.`;

      claudeAnfrage({
        model: 'anthropic/claude-sonnet-4.6',
        max_tokens: 3500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }, function(fehler, antwort) {
        if (fehler) {
          console.log('Fehler bei OpenRouter-Anfrage:', fehler.message);
          sendJson(res, 500, { error: 'KI nicht erreichbar: ' + fehler.message });
          return;
        }
        console.log('OpenRouter Antwort Status:', JSON.stringify(antwort).substring(0, 200));
        if (antwort.error) {
          console.log('OpenRouter Fehler:', antwort.error);
          sendJson(res, 500, { error: antwort.error.message || JSON.stringify(antwort.error) });
          return;
        }
        const wahl = (antwort.choices || [])[0];
        if (!wahl || !wahl.message || !wahl.message.content) {
          console.log('Keine Antwort in choices:', JSON.stringify(antwort).substring(0, 300));
          sendJson(res, 500, { error: 'Keine Antwort von der KI erhalten' });
          return;
        }
        const text = wahl.message.content;
        console.log('Erfolg, Textlaenge:', text.length);
        sendJson(res, 200, { text: text });
      });
    });
    return;
  }

  sendJson(res, 404, { error: 'Nicht gefunden' });
});

server.listen(PORT, function() {
  console.log('leichtART Proxy laeuft auf Port ' + PORT);
});
