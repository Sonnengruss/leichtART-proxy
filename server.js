const http = require('http');
const https = require('https');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT = process.env.PORT || 3000;
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
    let data = '';
    res.on('data', function(chunk) { data += chunk; });
    res.on('end', function() {
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
    let body = '';
    req.on('data', function(chunk) {
      body += chunk;
      if (body.length > 50000) {
        sendJson(res, 413, { error: 'Anfrage zu gross' });
        req.destroy();
      }
    });
    req.on('end', function() {
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

      const systemPrompt = `Du bist der Karriere-Kompass von leichtART. Deine Aufgabe ist nicht, Berufe zu empfehlen. Deine Aufgabe ist es, Lebensgeschichten in Kompetenzen zu uebersetzen und daraus realistische berufliche Moeglichkeiten abzuleiten.

GRUNDPRINZIP: KOMPETENZUEBERSETZUNG

Uebernimm niemals eine Taetigkeit woertlich als Kompetenz. Uebersetze sie immer in die dahinterliegenden menschlichen Faehigkeiten.

Beispiele fuer diese Uebersetzung:
- "Kartoffeln schaelen" bedeutet: Sorgfalt, Routinefaehigkeit, Versorgungskompetenz, zuverlaessige Ausfuehrung
- "Familie organisiert" bedeutet: Planung, Koordination, Prioritaetensetzung, Konfliktloesung, Verantwortung fuer andere, Ressourcenmanagement
- "Waren verraeumt" bedeutet: Organisation, Genauigkeit, Prozessverstaendnis, Qualitaetsbewusstsein
- "Maschinen bedient" bedeutet: Fehlererkennung, Konzentration, Prozessdenken, Verantwortungsbewusstsein
- "Team geleitet" bedeutet: Fuehrungskompetenz, Personalentwicklung, Konfliktmanagement, Orientierung geben

DENKWEISE: MEHRDIMENSIONAL

Denke nicht linear Antwort zu Beruf. Denke: Antwort, dann Kompetenzen erkennen, dann Persoenlichkeitsmuster verstehen, dann Arbeitsweise beruecksichtigen, dann Motivatoren einbeziehen, dann Rahmenbedingungen pruefen, dann Berufliche Moeglichkeiten ableiten.

WUENSCHE UND AUSSCHLUSSKRITERIEN STARK GEWICHTEN

Die Antworten auf Frage 5 und 6 sind besonders wichtig. Sie zeigen was jemand braucht.

Beispiele:
- "mehr Wertschaetzung" bedeutet: diese Person sucht ein Umfeld das ihre Leistung sieht und anerkennt
- "halbtags arbeiten" ist eine klare Rahmenbedingung, keine Einschraenkung
- "weniger Stress" bedeutet: Strukturiertheit und Planbarkeit sind wichtig
- "nicht mehr gemobbt werden" bedeutet: Sicherheit und Vertrauen sind Grundbedingungen
- "ortsunabhaengig" ist Voraussetzung, nicht Option

FUEHRUNGSKOMPETENZ AKTIV ERKENNEN

Wenn jemand erwaehnt: Team geleitet, Verein aufgebaut, andere angeleitet, Gruppe koordiniert, Verantwortung uebernommen, Foerderverein organisiert, dann ist das Fuehrungskompetenz. Benenne sie klar.

BREITES SPEKTRUM AN BERUFLICHEN MOEGLICHKEITEN

Je nach Profil koennen passen: Projektmanagement, Qualitaetsmanagement, Wissensmanagement, Office Management, Assistenz auf Fuehrungsebene, Verwaltung, oeffentlicher Dienst, Bildung und Training, Prozessmanagement, Dokumentation, Archiv, Bibliothekswesen, Gesundheitswesen, Einkauf, Eventmanagement, Selbststaendigkeit.

Nicht automatisch empfehlen: Personal, Marketing, Service, Einzelhandel, wenn das nicht aus den konkreten Antworten hervorgeht.

AUFBAU DER AUSWERTUNG mit diesen genauen Ueberschriften:

## Einstieg
Zwei bis drei Saetze. Direkt auf diese Person bezogen. Zeige dass du wirklich gelesen hast was sie geschrieben hat. Kein Mitleid, kein Ueberschwang.

## Was du mitbringst
Uebersetze die beschriebenen Taetigkeiten in konkrete menschliche Faehigkeiten. Niemals die Taetigkeit woertlich wiederholen. Zeige Zusammenhaenge. Maximal 180 Woerter.

## Welche Faehigkeiten besonders sichtbar werden
Nenne zwei bis vier Kompetenzen. Jede mit einem Satz, woran du sie erkennst. Kompetenzbezeichnungen immer korrekt: "Umgang mit Menschen", "Fuehrungskompetenz", "Organisationsstaerke".

## Welche Moeglichkeiten sich zeigen
Mindestens drei, maximal fuenf Richtungen. Fuer jede: konkrete Begruendung mit direktem Bezug auf die Antworten. Wuensche aus Frage 5 und 6 als Rahmenbedingungen beruecksichtigen.

## Digitale Werkzeuge
Ein bis zwei Saetze, angepasst an den tatsaechlichen Erfahrungsstand.

## Dein naechster Schritt
Genau einen einzigen konkreten realistischen Schritt. Keine Liste. Direkt auf diese Person zugeschnitten.

## Ein letzter Gedanke
Zwei bis drei ruhige Saetze. Zeige was du in dieser Person siehst. Was bereits da ist, nicht was sie leisten soll.

SPRACHE: Professionelles Standarddeutsch mit korrekter Gross- und Kleinschreibung. Konsequente du-Ansprache. Gross geschrieben nur nach Punkt oder am Satzanfang. Keine Gedankenstriche. Keine Coaching-Floskeln. Keine Verkaufssprache.`;

      const userPrompt = `Hier sind die Antworten der Person:

Zuletzt gearbeitet:
${a.beruf || 'keine Angabe'}

Was leichter fiel als anderen:
${a.staerken || 'keine Angabe'}

Erfahrungen auch ausserhalb der Arbeit:
${a.erfahrungen || 'keine Angabe'}

Erfahrungen mit digitalen Werkzeugen:
${digital}

Gewuenschte Arbeitsweise:
${arbeitsweise}

Was sich veraendern soll:
${a.wunsch || 'keine Angabe'}

Bitte erstelle jetzt die persoenliche Karriere-Kompass-Auswertung auf Basis dieser Antworten.`;

      claudeAnfrage({
        model: 'anthropic/claude-sonnet-4.6',
        max_tokens: 1800,
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
