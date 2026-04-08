# Next Steps

Purpose: Capture the next important implementation steps for the editor workbench in this repository.  
Context: The repo already contains minimal `CodeMirror` and `Pi` demos, but not yet a unified editing and rendering workflow.  
Responsibility: Keep the near-term roadmap focused on technical infrastructure first.  
Boundaries: Detailed tutorial content, didactic planning, and curriculum design stay outside this file for now.

## Stand vom 2026-04-07

Der aktuelle Repository-Stand ist bewusst klein:

- Es gibt bereits einen minimalen `CodeMirror`-Demo-Route unter `src/routes/demo/codemirror/+page.svelte`.
- Es gibt getrennte `Pi`-Demos mit serverseitiger Session-Logik unter `src/routes/demo/pi/*` und `src/lib/server/pi/*`.
- Es gibt noch keine zusammengeführte Editor-Workbench mit Code, Renderer, Agent und Dateiverwaltung.

## Leitidee fuer die naechsten Schritte

Die einfachste tragfaehige Variante ist:

1. Zuerst eine stabile Single-File-Workbench bauen.
2. Dann den Render-Loop fuer `three.js` live mit dem Editor verbinden.
3. Danach `Pi` als serverseitigen Editing-Agenten einhaengen.
4. Erst danach Multi-File-Editing, File-Tree und Tutorial-System erweitern.

So bleibt die technische Basis klein, testbar und nah an der bestehenden SvelteKit- plus Pi-Architektur.

## Prioritaet 1: UI-Workbench auf Basis des neuen UI-Templates

Ziel ist eine erste produktive Arbeitsoberflaeche statt einzelner Demos.

Die erste Ausbaustufe sollte sich an dem Mockup mit drei Bereichen orientieren:

- links oben: Code-Editor
- links unten: AI-Agent
- rechts: `three.js`-Renderer

Wichtige Arbeitsschritte:

1. Das neue UI-Template als Layout-Basis in dieses Projekt integrieren.
2. Eine zentrale Workbench-Route anlegen, statt weitere lose Demo-Seiten auszubauen.
3. Die Workbench in klar getrennte Bereiche zerlegen: `EditorPanel`, `AgentPanel`, `RendererPanel`.
4. Die Shell zuerst statisch und ohne komplexe Interaktionen aufbauen.

Einfachste Variante:
Eine feste Desktop-Workbench ohne Resizing, ohne Tabs und ohne Drag-and-Drop. Erst wenn der Grundfluss funktioniert, folgen flexible Panels.

Wichtig vor der Umsetzung:
Vor UI-Arbeit die Doku aus `/Users/weigend/Documents/GitHub/ui-system` erneut lesen, vor allem `README.md`, `AGENTS.md`, `docs/ui-architecture.md`, Layer-READMEs, Templates und Validator.

## Prioritaet 2: Dateimodell und serverseitige Editor-Architektur festlegen

Bevor `CodeMirror` mehr kann als nur ein lokales Textfeld, muss klar sein, wie Dateien geladen, gespeichert und fuer Agenten-Aktionen bereitgestellt werden.

Wichtige Arbeitsschritte:

1. Ein kleines serverseitiges File-Service-Modul definieren, das Dateizugriff kapselt.
2. Festlegen, auf welchen Workspace-Bereich der Editor zugreifen darf.
3. Einen einfachen API- oder Form-basierten Fluss fuer `load`, `save` und spaeter `list files` entwerfen.
4. Dokumentzustand im Client klar vom echten Dateisystemzustand auf dem Server trennen.
5. Festlegen, welche Aenderungen direkt gespeichert werden und welche zuerst als Vorschau oder Patch zurueckkommen.

Serverseitig sollte gebaut werden:

- Dateipfade aufloesen und validieren
- Dateien lesen und speichern
- spaeter Dateilisten fuer den File-Tree liefern
- Agenten-Aenderungen anwenden oder als strukturierte Vorschlaege zurueckgeben

Clientseitig sollte leicht bleiben:

- `CodeMirror` rendert nur den aktuellen Dokumentinhalt
- UI zeigt Dirty-State, Save-State und aktive Datei
- keine direkten `Pi`-SDK-Imports im Browser

Einfachste Variante:
Mit genau einer editierbaren Beispiel-Datei starten, die serverseitig geladen und gespeichert wird. Noch kein File-Tree, noch keine Ordnernavigation, noch keine Multi-File-Abhaengigkeiten.

## Prioritaet 3: `three.js`-Viewer installieren und isoliert verifizieren

Bevor die Live-Kopplung mit dem Editor kommt, sollte der Renderer allein sauber laufen.

Wichtige Arbeitsschritte:

1. `three` als Dependency installieren.
2. Einen separaten Viewer-Bereich oder eine eigene Preview-Komponente anlegen.
3. Eine minimale Szene als Smoke Test bauen, zum Beispiel Kamera, Licht und eine rotierende Box.
4. Den Renderer bewusst isoliert halten, damit Editor-Fehler nicht die ganze Workbench zerlegen.

Einfachste Variante:
Eine statische `three.js`-Demo innerhalb der neuen Workbench rendern, noch ohne Editor-Anbindung.

## Prioritaet 4: Single-File Live-Preview zwischen CodeMirror und `three.js`

Das Zielbild ist das Beispiel von `https://threejs.dev/examples/?edit=#games_fps`: Links Script, rechts Live-Rendering, bei Code-Aenderung sofort sichtbares Ergebnis.

Wichtige Arbeitsschritte:

1. Eine erste lauffaehige Preview-Pipeline fuer genau eine Datei bauen.
2. Entscheiden, wie der Code sicher in die Preview gelangt, zum Beispiel ueber `iframe`, Blob-URL oder einen klar begrenzten Preview-Mechanismus.
3. Einen verstaendlichen Aktualisierungsfluss definieren:
   Editor aendert Inhalt -> Preview baut neu -> Renderer aktualisiert sich
4. Fehlerdarstellung fuer kaputten Code einplanen, damit der Nutzer nicht im Blindflug arbeitet.

Einfachste Variante:
Nur eine JavaScript- oder TypeScript-Datei live in einer isolierten Preview ausfuehren und bei jeder Aenderung neu laden. Kein HMR-System, kein bundler-aehnlicher Mehrdatei-Resolver in der ersten Runde.

Komplexitaet vermeiden:
Nicht direkt ein allgemeines Online-IDE-System bauen. Erst den kleinsten funktionierenden Edit-zu-Render-Zyklus fertigstellen.

## Prioritaet 5: Pi- und KI-Funktionen in die Editor-Ansicht einhaengen

Sobald Single-File-Editing und Live-Preview stabil sind, kann die Agentenflaeche sinnvoll werden.

Zielbild:

- links oben: Code
- links unten: AI-Agent
- rechts: Renderer

Wichtige Arbeitsschritte:

1. Die vorhandene serverseitige `Pi`-Architektur aus `src/lib/server/pi/*` wiederverwenden.
2. Eine Workbench-spezifische Agenten-Action entwerfen, die den aktuellen Dateikontext an den Server schickt.
3. Agenten-Antworten strukturiert halten, zum Beispiel als Patch, Diff, Erklaerung oder Apply-Vorschlag.
4. Den ersten Flow auf genau eine Datei begrenzen: Agent liest aktuelle Datei, schlaegt Aenderung vor, Nutzer uebernimmt.

Einfachste Variante:
Keine unsichtbaren Auto-Edits. Der Agent liefert zuerst nur strukturierte Aenderungsvorschlaege oder einen klaren Replace-Payload fuer die aktive Datei.

## Prioritaet 6: Multi-File-Editing und File-Tree

Erst wenn Single-File-Editing, Preview und Agent stabil sind, lohnt sich der naechste Layout-Schritt mit linker Zusatzspalte.

Zielbild:

- ganz links: File-Tree oder Tutorial-Navigation
- Mitte: Code plus Agent
- rechts: Renderer

Wichtige Arbeitsschritte:

1. Einen einfachen File-Tree fuer erlaubte Dateien einfuehren.
2. Aktive Datei, geoeffnete Dateien und Dirty-States verwalten.
3. `Pi` mit einer expliziten Dateiauswahl koppeln.
4. Dem Agenten nur die Dateien freigeben, die im aktuellen Kontext erlaubt oder aktiv selektiert sind.
5. Multi-File-Aenderungen als bewussten Schritt designen, nicht als implizites Nebenprodukt.

Einfachste Variante:
Zunaechst nur Leseliste plus aktive Datei. Multi-Select, Tabs, Umbenennen, Verschieben und Erstellen neuer Dateien spaeter.

## Prioritaet 7: Tutorial-System als eigenes Teilprojekt auf der technischen Basis

Die Tutorials sind wichtig, aber sie sollten auf eine stabile Infrastruktur aufsetzen und nicht gleichzeitig die Architektur treiben.

Technischer Fokus in diesem Repository zuerst:

- Workbench
- Dateisystemfluss
- Renderer-Preview
- Pi-Integration
- Multi-File-Grundlage

Danach kann das Tutorial-System darauf aufbauen:

- sehr einfache Einstiege wie Box, Material, Licht
- dann Shader- und Transformationsschritte
- spaeter komplexere Szenarien bis zur einfachen Flugsimulation

Didaktischer Rahmen fuer spaeter:

1. Erst selbst programmieren mit klaren Vorgaben im Editor.
2. Dann ein Advanced Feature zusammen mit dem Agenten Datei fuer Datei bauen.
3. Danach Multi-File-Editing mit AI als naechste Lernstufe.

Wichtig:
Didaktische Dokumente, Lernziele und psychologische Struktur koennen separat gepflegt und spaeter in diese technische Plattform eingespeist werden.

## Empfohlene konkrete Reihenfolge ab dem naechsten Arbeitsblock

1. Neue Workbench-Route und UI-Shell auf Basis des Templates aufsetzen.
2. Serverseitigen Dateizugriff fuer genau eine Beispiel-Datei definieren.
3. `three.js` installieren und eine minimale Renderer-Komponente einbauen.
4. Single-File Live-Preview zwischen Editor und Renderer fertigstellen.
5. Den vorhandenen `Pi`-Serverpfad in ein Agenten-Panel fuer die aktive Datei ueberfuehren.
6. Erst danach File-Tree und Multi-File-Editing beginnen.
7. Tutorial-System auf dieser Basis als separates Projekt im Projekt entwickeln.

## Was bewusst noch nicht jetzt passieren sollte

- Kein frueher Wechsel auf `Monaco`, solange `CodeMirror` den Job sauber erledigt.
- Kein komplexes Multi-File-System vor dem ersten stabilen Single-File-Loop.
- Keine automatische, unsichtbare KI-Dateimutation im ersten Schritt.
- Kein Vermischen von Infrastrukturaufbau und kompletter Tutorial-Ausarbeitung.

## Merksatz fuer die Umsetzung

Erst eine kleine, robuste Workbench fuer genau eine Datei bauen.  
Dann Preview.  
Dann Agent.  
Dann mehrere Dateien.  
Dann Tutorials.
