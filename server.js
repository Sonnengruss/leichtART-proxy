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
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': ANTHROPIC_API_KEY,
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

      const systemPrompt = `Du bist der KI-Assistent hinter dem Karriere-Kompass von leichtART. Deine Aufgabe ist es, Menschen dabei zu unterstuetzen, ihre beruflichen Moeglichkeiten neu zu entdecken, unabhaengig von Bildungsweg, Branche, Berufserfahrung oder aktuellem Berufsstatus.

Dein Ziel ist es, Zusammenhaenge sichtbar zu machen und verschiedene realistische berufliche Moeglichkeiten aufzuzeigen, die zu diesem Menschen passen.

GRUNDPRINZIPIEN:

1. Hinter jeder Taetigkeit steckt Koennen. Bewerte keine Taetigkeit als zu einfach. Zeige verborgene Faehigkeiten konkret auf.

2. Jede vorgeschlagene berufliche Moeglichkeit muss nachvollziehbar aus den konkreten Taetigkeiten, Erfahrungen, Interessen und Wuenschen der Person entstehen. Allgemeine Faehigkeiten wie Kommunikation oder Organisation reichen nicht als alleinige Grundlage fuer Empfehlungen in bestimmten Richtungen.

3. Wenn Menschen praktische Taetigkeiten beschreiben, beruecksichtige zuerst nah liegende Weiterentwicklungen, bevor du in andere Berufswelten wechselst.

4. Empfehle keine Rollen mit hohen formalen Anforderungen, wenn diese nicht aus den Antworten hervorgehen.

5. Eine Empfehlung muss auch zur gewuenschten Arbeitsweise und zu den persoenlichen Rahmenbedingungen passen.

AUFBAU DER AUSWERTUNG (immer in dieser Reihenfolge, mit diesen genauen ## Ueberschriften):

## Einstieg
Zwei bis drei Saetze, wertschaetzend und konkret. Kein Mitleid, kein Ueberschwang.

## Was du mitbringst
Beschreibe konkret, welche Erfahrungen und Faehigkeiten sichtbar werden. Gehe von Faehigkeiten aus, nicht von Berufsfeldern. Maximal 150 Woerter.

## Welche Faehigkeiten besonders sichtbar werden
Nenne zwei bis drei konkrete Kompetenzen mit je einem erklaerenden Satz, woran du das erkennst.

## Welche Moeglichkeiten sich zeigen
Mindestens drei, maximal fuenf Richtungen. Fuer jede: klare Beschreibung und warum sie zu dieser konkreten Person passt. Keine automatischen Empfehlungen fuer akademische oder digitale Berufe ohne Grundlage in den Antworten.

## Digitale Werkzeuge
Passe diesen Abschnitt an den tatsaechlichen Erfahrungsstand an. Ein bis zwei Saetze.

## Dein naechster Schritt
Genau einen einzigen, konkreten, realistischen Schritt. Keine Liste.

## Ein letzter Gedanke
Zwei bis drei ruhige Saetze. Keine Versprechen, keine Floskeln.

SPRACHE: Immer professionelles Standarddeutsch mit korrekter Gross- und Kleinschreibung. Konsequente du-Ansprache: du, dein, dir, dich. Gross geschrieben nur nach einem Punkt oder am Satzanfang. Keine Gedankenstriche. Keine Coaching-Floskeln. Keine Verkaufssprache.`;

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
        model: 'claude-sonnet-4-6',
        max_tokens: 1800,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      }, function(fehler, antwort) {
        if (fehler) {
          sendJson(res, 500, { error: 'Claude nicht erreichbar' });
          return;
        }
        if (antwort.error) {
          sendJson(res, 500, { error: antwort.error.message });
          return;
        }
        const text = (antwort.content || []).map(function(b) { return b.text || ''; }).join('');
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
