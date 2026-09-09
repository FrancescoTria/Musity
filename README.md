# Musity

Musity è una piattaforma web per cercare brani musicali, ascoltarne una preview e condividere valutazioni e recensioni. L'interfaccia è realizzata con React e permette di esplorare i brani più ascoltati, visualizzare le informazioni di un singolo brano e lasciare un giudizio personale.

## Funzionalità principali

- Ricerca di brani, artisti e album tramite iTunes Search API.
- Sezione di esplorazione con 9 brani casuali provenienti dalle classifiche Apple Music internazionali.
- Pagina con le Top 100 Apple Music complete per paese, con ricerca interna e selezione della nazione.
- Minigioco per indovinare i brani della Top scelta ascoltando preview progressive da 1, 3, 6, 10 e 30 secondi.
- Pagina di dettaglio con copertina, artista, album, genere, anno, durata e numero della traccia.
- Riproduzione della preview audio quando disponibile.
- Valutazione da 1 a 10 con classificazione in stile Steam.
- Pubblicazione di recensioni con nome, testo e frequenza di ascolto.
- Tre recensioni dimostrative predefinite per ogni brano, visibili su qualsiasi dispositivo.
- Ordinamento delle recensioni per piu recenti, voto piu alto o voto piu basso.
- Voti di utilita sulle recensioni.
- Tema chiaro e scuro, con salvataggio della preferenza.
- Logo Musity e favicon personalizzati.

## Tecnologie utilizzate

- **React 19** per la costruzione dell'interfaccia.
- **TypeScript** per tipizzazione e maggiore sicurezza del codice.
- **Vite** per sviluppo locale e build di produzione.
- **React Router** per la navigazione tra home, classifiche, gioco e pagine dei brani.
- **Tailwind CSS** per gli stili e il layout responsive.
- **iTunes Search API** per ricerca e metadati musicali.
- **Apple Music RSS API** per il recupero delle classifiche internazionali.
- **localStorage** per recensioni, voti e preferenza del tema sul dispositivo dell'utente.

## Struttura del progetto

```text
Musity/
├── index.html                 # Pagina HTML principale
├── package.json               # Dipendenze e script npm
├── vite.config.ts             # Configurazione Vite e proxy Apple Music
├── tsconfig.json              # Configurazione TypeScript
├── src/
│   ├── App.tsx                # Router principale dell'applicazione
│   ├── main.tsx               # Punto di ingresso React
│   ├── index.css              # Tema, variabili CSS e stili globali
│   ├── components/            # Componenti riutilizzabili dell'interfaccia
│   │   ├── AudioPlayer.tsx    # Player per la preview del brano
│   │   ├── RatingBadge.tsx    # Riepilogo del voto medio
│   │   ├── ReviewCard.tsx     # Visualizzazione di una recensione
│   │   ├── ReviewForm.tsx     # Form per creare una recensione
│   │   ├── SearchBar.tsx      # Ricerca con suggerimenti e debounce
│   │   ├── StarRating.tsx     # Selezione del voto da 1 a 10
│   │   ├── ThemeToggle.tsx    # Cambio del tema chiaro/scuro
│   │   └── BrandLogo.tsx      # Logo condiviso dell'applicazione
│   ├── context/
│   │   └── ThemeContext.tsx   # Stato globale e persistenza del tema
│   ├── pages/
│   │   ├── HomePage.tsx       # Home, ricerca ed esplorazione
│   │   ├── TrackPage.tsx      # Dettaglio, player e recensioni
│   │   ├── ChartsPage.tsx     # Top 100 nazionali complete
│   │   └── GamePage.tsx       # Minigioco musicale
│   └── utils/
│       ├── itunes.ts          # Chiamate API e formattazione dei dati
│       └── ratings.ts         # Gestione recensioni e statistiche dei voti
└── dist/                      # Output generato dalla build
```

## Funzionamento

### 1. Ricerca e scoperta

Nella home l'utente può cercare un brano, un artista o un album. `SearchBar` attende 350 millisecondi dopo l'ultima modifica del testo e interroga l'iTunes Search API. I risultati vengono mostrati in un menu a tendina; selezionando un risultato si apre la relativa pagina tramite l'URL `/track/:trackId`.

La sezione **Esplora** recupera le classifiche Apple Music di diversi storefront internazionali. I risultati vengono memorizzati per un'ora nel `localStorage`, mescolati e ridotti a 9 brani. Per completare i metadati viene usata anche la chiamata iTunes Lookup.

### 2. Pagina del brano

`TrackPage` recupera il brano dallo stato della navigazione oppure, se la pagina viene aperta direttamente, esegue una chiamata di lookup usando l'ID presente nell'URL. La pagina mostra copertina, informazioni del brano, link ad Apple Music e il player della preview, se fornita dall'API.

### 3. Recensioni e valutazioni

Il form richiede un nome, un voto da 1 a 10 e una recensione di almeno 20 caratteri. Ogni recensione viene salvata localmente con una chiave associata all'ID del brano (`reviews_<trackId>`). La pagina calcola il voto medio, visualizza la distribuzione dei voti e assegna un'etichetta descrittiva come `Very Positive` o `Mixed`.

Se non esistono recensioni locali, vengono mostrate tre recensioni dimostrative definite nel codice, uguali su ogni dispositivo. Le recensioni create dall'utente e i voti di utilita restano invece salvati nel `localStorage` del browser e non vengono sincronizzati con altri dispositivi.

### 4. Classifiche nazionali

La pagina `/charts` permette di scegliere una delle Top Apple Music disponibili per paese. La classifica completa mantiene l'ordine originale, può essere filtrata per titolo o artista e ogni brano apre la relativa pagina di dettaglio. Il paese selezionato viene salvato nell'URL, così resta invariato tornando indietro dal dettaglio.

### 5. Minigioco musicale

La pagina `/game` permette di selezionare una Top nazionale e giocare cinque round. Per ogni brano la preview viene sbloccata progressivamente: 1, 3, 6, 10 e infine 30 secondi. Il brano si indovina tramite una ricerca limitata esclusivamente ai brani della Top scelta. I tentativi e i salti vengono mostrati negli slot del round; al termine viene indicato il numero di canzoni indovinate nella Top selezionata.

### 6. Tema

`ThemeContext` gestisce il tema chiaro o scuro. All'avvio viene usata la preferenza salvata dall'utente; in assenza di una preferenza viene rilevata quella del sistema operativo. La scelta viene salvata in `localStorage`.

## Avvio del progetto

Prerequisiti: Node.js e npm oppure pnpm.

```bash
pnpm install
pnpm dev
```

In alternativa:

```bash
npm install
npm run dev
```

Il server di sviluppo sarà disponibile all'indirizzo indicato da Vite, normalmente `http://localhost:5173`.

## Script disponibili

```bash
pnpm dev       # Avvia il server di sviluppo
pnpm build     # Crea la build di produzione nella cartella dist
pnpm preview   # Avvia un server per provare la build di produzione
pnpm format    # Formatta i file del progetto con oxfmt
```

## Proxy API

Le richieste al feed Apple Music passano dal percorso locale `/api/apple-music`. La configurazione in `vite.config.ts` lo inoltra a `rss.marketingtools.apple.com`, sia in sviluppo sia durante l'anteprima della build. Le chiamate all'iTunes Search API e alla Lookup API vengono invece effettuate direttamente verso `itunes.apple.com`.

## Limiti attuali

- Non è presente un backend per autenticazione, utenti o sincronizzazione delle recensioni.
- Le recensioni sono locali al browser e possono essere cancellate eliminando i dati del sito.
- La disponibilità delle preview dipende dai dati restituiti da Apple.
- Il minigioco richiede almeno cinque brani della Top selezionata con una preview audio disponibile.
- La piattaforma richiede una connessione Internet per ricerca, classifiche, immagini e preview.