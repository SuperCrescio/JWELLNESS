export const getPromptForFileType = (type) => {
    const masterDirective = `Sei un esperto di dominio con il compito di analizzare un file (testo, immagine, PDF) e di estrarre le informazioni in un formato JSON specifico e rigoroso.
Il tuo unico obiettivo è produrre un oggetto JSON valido che rispetti la struttura richiesta. Fallire non è un'opzione.
Devi agire come un esperto umano: analizza, interpreta e, se necessario, deduci le informazioni mancanti per completare la struttura.
Se il layout è non convenzionale, disordinato o scarno, è tuo compito interpretarlo e ricostruire i dati in modo logico e coerente, rimanendo il più fedele possibile al contenuto originale.
L'output deve essere SEMPRE e SOLO l'oggetto JSON.`;

    if (type === 'nutrition') {
      return `${masterDirective}
      Sei un esperto nutrizionista e analista dati. La tua missione è analizzare e interpretare il file fornito (immagine o testo). L'output deve essere ESCLUSIVAMENTE un oggetto JSON valido.

      La struttura JSON deve essere:
      {
        "patientName": "Nome del Paziente (se presente, altrimenti null)",
        "caloriesTarget": "Obiettivo calorico totale (se presente, altrimenti null)",
        "macrosTarget": { "proteins": "grammi", "carbs": "grammi", "fats": "grammi" } (se presenti, altrimenti null),
        "meals": [
          {
            "day": "Giorno (es. 'Giorno A (Lunedì)', 'Giorno B (Martedì)', etc. Mappa A a Lunedì, B a Martedì, e così via per 7 giorni)",
            "mealType": "Tipo di pasto (es. 'Colazione', 'Spuntino', 'Pranzo', 'Spuntino 2', 'Cena', 'Pre nanna'. Usa il buon senso: se è indicato ‘Snack’, mappalo su ‘Spuntino’.)",
            "menus": [
              {
                "name": "Nome opzione (es. 'Opzione 1', 'Opzione A', o il primo alimento se non specificato)",
                "foods": [
                  { "name": "Nome alimento (includi dettagli come 'senza zuccheri', '0% grassi', marche, ecc.)", "quantity": "Quantità (es. '100g', '1 tazza', 'q.b.')" }
                ],
                "supplements": "Eventuali note su supplementi o integratori (stringa, se presente, altrimenti null)",
                "calories": "Calorie totali del menu (STIMA questo valore se non è esplicitamente indicato, basandoti su alimenti e quantità. Restituisci un numero intero)",
                "proteins": "Proteine totali del menu in grammi (STIMA questo valore se non è esplicitamente indicato. Restituisci un numero intero)",
                "carbs": "Carboidrati totali del menu in grammi (STIMA questo valore se non è esplicitamente indicato. Restituisci un numero intero)",
                "fats": "Grassi totali del menu in grammi (STIMA questo valore se non è esplicitamente indicato. Restituisci un numero intero)"
              }
            ]
          }
        ]
      }

      REGOLE CRITICHE E DETTAGLIATE:
      1.  **GESTIONE "OPPURE"**: Se trovi la parola "oppure" tra due o più alimenti, questi rappresentano SCELTE ALTERNATIVE. Ogni scelta deve diventare un OGGETTO "menu" SEPARATO all'interno dello stesso pasto. Ad esempio, "150g Bevanda vegetale oppure 150g Alpro" deve generare due oggetti "menu": uno con "Bevanda vegetale" e uno con "Alpro", entrambi con gli altri alimenti del pasto.
      2.  **ESTRAZIONE COMPLETA**: NON omettere NESSUN alimento, quantità, o supplemento. Sii meticoloso. Se un pasto contiene 5 alimenti, devi estrarli tutti e 5. Presta attenzione a dettagli come "Cioccolato fondente (Dal 70% in su)" e "Mix di semi oleosi". Nel dubbio, meglio sovraestrarre che sottoestrarre: includi anche ciò che potrebbe sembrare ripetitivo se fa parte del file originale.
      3.  **STIMA MACRONUTRIENTI**: Se i valori di calorie, proteine, carboidrati e grassi non sono presenti per un pasto, DEVI calcolare una stima realistica basata su TUTTI gli alimenti e le loro quantità in quel menu. Non lasciare questi campi null o 0 a meno che il pasto non sia vuoto.
      4.  **SUPPLEMENTI**: Estrai i supplementi e associali al pasto corretto. Se c'è scritto "3 cpcp Creatina", estrai "Creatina" e la quantità.
      5.  **MAPPATURA GIORNI**: Identifica correttamente i giorni A, B, C, D, E, F, G e mappali ai giorni della settimana (A=Lunedì, B=Martedì, ...).
      6.  **DETTAGLI ALIMENTI**: Includi nel nome dell'alimento tutti i dettagli importanti (es. "yogurt greco 0% senza lattosio", "bevanda vegetale senza zuccheri").
      7.  **OUTPUT SOLO JSON**: L'output DEVE essere solo e unicamente un oggetto JSON valido. NESSUN commento, testo o spiegazione prima o dopo.`;
    }
    if (type === 'workout') {
      return `Analizza anche se il file contiene solo immagini o righe di testo non strutturate. Interpreta visivamente blocchi, titoli, esercizi e dati con logica umana. Non richiede struttura tabellare.
Il testo che ricevi è una versione lineare di un documento che potrebbe contenere tabelle. Il tuo primo compito è segmentare e interpretare questo testo per ricostruire mentalmente la tabella o la struttura originale. Solo dopo aver ricostruito la struttura, procedi con l'estrazione dei dati.
Se non trovi dati strutturati, cerca di dedurli da layout visuale, testo sparso o immagini. Se anche questo non funziona, esegui un'analisi OCR totale per estrarre tutto il contenuto grezzo e ricostruisci il layout da solo.
Il tuo obiettivo non è la perfezione, ma la leggibilità e validità.
Mai restituire un oggetto vuoto. Mai saltare esercizi leggibili. Deve creare allenamenti completi, sempre e comunque. Con ogni tipo di struttura di file.

Sei un analista esperto di piani di allenamento e fisiologia sportiva applicata. Ogni esercizio, sessione e dettaglio deve essere preservato con la massima precisione.

      📌 OUTPUT UNICO:
      L’output deve essere solo ed esclusivamente un oggetto JSON valido. Niente testo libero. Niente spiegazioni. Solo JSON.
      
      📐 FORMATO JSON OBBLIGATORIO:
      
      {
        "plan": {
          "planName": "Nome completo del piano (es. 'Crescenzo Picardi - Stimolo metabolico')",
          "planNotes": "Note generali applicabili a tutto il piano (es. 'Allenarsi 5 volte a settimana a rotazione')",
          "sessions": [
            {
              "sessionName": "Allenamento 1",
              "focus": "Focus muscolare se presente o deducibile (es. 'Gambe e Core')",
              "estimatedDurationMinutes": 60,
              "exercises": [
                {
                  "name": "Nome dell'esercizio",
                  "sets": 3,
                  "reps": "8",
                  "rest": 60,
                  "notes": "Note aggiuntive, incluse notazioni complesse di serie/reps (es. '3x15 rest 10'' esaurimento x 2 volte')",
                  "unilateral": true,
                  "supersetId": "ID univoco per esercizi in superset (es. 'ss1'), altrimenti null",
                  "targetMuscles": {
                    "primary": ["Muscolo primario se dedotto"],
                    "secondary": ["Muscoli secondari se presenti"]
                  },
                  "biomechanicalCategory": "Spinta Orizzontale / Trazione Verticale / Core / Mobilità / Cardio / ecc.",
                  "estimatedTimeSeconds": 453.6
                }
              ]
            }
          ]
        }
      }
      
      ⚖️ REGOLE CHIAVE (SEMPRE ATTIVE)
      📍 SESSIONI:
      "GIORNO 1", "DAY A", "Workout B" → sempre convertiti in "Allenamento 1", "Allenamento 2", etc. in ordine di apparizione.
      
      📝 NOTE GENERALI DEL PIANO:
      Cerca frasi generali non legate a un singolo esercizio (es. "ALLENATI 5 VOLTE A SETTIMANA A ROTAZIONE", "100 AFFONDI nei giorni che preferisci") e inseriscile in "planNotes".

      🔥 SUPERSET (SS):
      Se trovi "SS", "in SS con", "in superset con", assegna lo stesso "supersetId" (es. "ss1", "ss2") a tutti gli esercizi consecutivi che fanno parte dello stesso superset. Incrementa l'ID per ogni nuovo gruppo di superset.

      🤯 NOTAZIONI COMPLESSE DI SERIE/REPS:
      Se una riga contiene una descrizione complessa (es. "3x20 pausa 1' 3x15 rest 10'' esaurimento x 2 volte"), estrai il nome dell'esercizio e inserisci l'INTERA stringa di istruzioni nel campo "notes". Per "sets" e "reps", estrai i valori più semplici che riesci a identificare (es. sets: 3, reps: "20") o impostali a null se troppo ambigui.

      🔁 REST:
      Converti minuti e secondi in secondi: "1’" → 60, "1’30”" → 90, "45”" → 45. Se il file è vago o dice ‘riposo come necessario’, deducilo coerentemente (es. 60-90s per esercizi di forza, 30s per circuiti). Se non specificato, null.
      
      🧠 UNILATERAL:
      Se compare “x lato”, “singole”, “per gamba”, “per braccio”, ecc. → "unilateral": true.

      💪 TARGETMUSCLES & BIOMECHANICALCATEGORY:
      Deduci questi valori dal nome dell'esercizio. Sii coerente. Esempio: se il nome è ‘Push Press’, assegna biomeccanica ‘Spinta Verticale’, primario ‘Deltoidi’, secondari ‘Tricipiti’.
      
      ⏱️ TEMPO STIMATO ESERCIZIO:
      Usa una stima basata su sets, reps e tipo di esercizio per calcolare "estimatedTimeSeconds". Esempio: un 3x10 di un esercizio di forza sono circa 45-60 secondi per set, a cui sommare il tempo di recupero.

      ✅ ESEMPIO ESTRATTO CORRETTAMENTE:
      {
        "plan": {
          "planName": "SUPER CRESCIO YO BABY YO",
          "planNotes": "ALLENATI 5 VOLTE A SETTIMANA A ROTAZIONE. NEI GIORNI CHE PREFERISCI MA ALMENO 3 VOLTE A SETTIMANA 100 AFFONDI",
          "sessions": [
            {
              "sessionName": "Allenamento 1",
              "focus": "Petto e Spalle",
              "estimatedDurationMinutes": null,
              "exercises": [
                {
                  "name": "SPINTE PANCA 30 MANUBRI",
                  "sets": null,
                  "reps": null,
                  "rest": 60,
                  "notes": "IN SS CON PULL OVER GOMITI STRETTI 4X12+15 PAUSA 1'",
                  "unilateral": false,
                  "supersetId": "ss1",
                  "targetMuscles": { "primary": ["Pettorali"], "secondary": ["Deltoidi", "Tricipiti"] },
                  "biomechanicalCategory": "Spinta Orizzontale",
                  "estimatedTimeSeconds": null
                },
                {
                  "name": "PULL OVER GOMITI STRETTI",
                  "sets": 4,
                  "reps": "12+15",
                  "rest": 60,
                  "notes": "IN SS CON SPINTE PANCA 30 MANUBRI",
                  "unilateral": false,
                  "supersetId": "ss1",
                  "targetMuscles": { "primary": ["Gran Dorsale"], "secondary": ["Pettorali", "Tricipiti"] },
                  "biomechanicalCategory": "Trazione",
                  "estimatedTimeSeconds": null
                }
              ]
            }
          ]
        }
      }`;
    }
    if (type === 'bia') {
      return `${masterDirective}
      Sei un esperto medico e analista dati con intelligenza visiva. Devi interpretare sia i dati numerici che gli elementi grafici (barre, spunte, posizioni) con precisione chirurgica. L'output deve essere ESCLUSIVAMENTE un oggetto JSON valido.

      **REGOLA CRITICA N.1: DATA E ORA INFALLIBILE**
      Cerca attentamente il campo "Data Test / Ora". DEVE essere estratto e formattato come "YYYY-MM-DDTHH:mm:ss". Esempio: "20.03.2025. 17:05" diventa "2025-03-20T17:05:00". Se non lo trovi, imposta il valore a null. Questo è il campo più importante.

      **REGOLA CRITICA N.2: INTERPRETAZIONE VISIVA DEI GRAFICI**
      Non limitarti a trascrivere i numeri. DEVI interpretare la posizione delle barre e le spunte.
      - **Barre di Analisi**: Per ogni barra (es. Peso, Massa Muscolare, IMC), determina se il valore è 'Sotto', 'Normale' o 'Sopra' basandoti sulla sua posizione rispetto alle aree ombreggiate e alle etichette.
      - **Spunte di Valutazione**: Per "Valutazione Obesità", identifica quale casella è spuntata (IMC e PGC) e riporta la label corrispondente ('Normale', 'Sotto', 'Sopra', 'Leggermente Sopra', etc.).

      **REGOLA CRITICA N.3: VALORI E RANGE**
      Per ogni parametro che ha un intervallo di normalità (es. "50.9 ( 39.6~48.4 )"), estrai sia il valore che il range in un oggetto separato. Esempio: { "value": 50.9, "range": "39.6~48.4" }. Se il range non è presente, il valore deve essere un numero semplice.

      **STRUTTURA JSON (COMPLETA E OBBLIGATORIA):**
      {
        "reportDateTime": "Data e ora del report (formato 'YYYY-MM-DDTHH:mm:ss')",
        "id": "ID utente dal report",
        "name": "Nome dal report",
        "age": "Età (numero)",
        "heightCm": "Altezza in cm (numero)",
        "gender": "Genere (es. 'Maschio')",
        
        "inbodyScore": "Punteggio InBody (numero)",

        "bodyCompositionAnalysis": {
          "totalBodyWaterL": { "value": "numero", "range": "stringa" },
          "proteinKg": { "value": "numero", "range": "stringa" },
          "mineralsKg": { "value": "numero", "range": "stringa" },
          "bodyFatMassKg": { "value": "numero", "range": "stringa" },
          "weightKg": { "value": "numero", "range": "stringa" }
        },

        "muscleFatAnalysis": {
          "bodyType": "Interpreta la forma della linea che connette i punti di Peso, SMM e BFM. Es: 'Tipo D (Atletico)', 'Tipo C (Obeso)', 'Tipo I (Normale)'.",
          "weightKg": { "value": "numero", "range": "stringa", "status": "Interpreta la posizione della barra (Sotto, Normale, Sopra)" },
          "skeletalMuscleMassKg": { "value": "numero", "range": "stringa", "status": "Interpreta la posizione della barra (Sotto, Normale, Sopra)" },
          "bodyFatMassKg": { "value": "numero", "range": "stringa", "status": "Interpreta la posizione della barra (Sotto, Normale, Sopra)" }
        },

        "obesityAnalysis": {
          "bmi": { "value": "numero", "range": "stringa", "status": "Interpreta la posizione della barra (Sotto, Normale, Sopra)" },
          "bodyFatPercentage": { "value": "numero", "range": "stringa", "status": "Interpreta la posizione della barra (Sotto, Normale, Sopra)" }
        },
        
        "waistHipRatio": { "value": "numero", "range": "stringa" },
        "visceralFatLevel": { "value": "numero", "range": "stringa" },

        "bodyCompositionHistory": [
          {
            "date": "Data dello storico (formato DD.MM.YY)",
            "weightKg": "Peso (kg) nello storico",
            "skeletalMuscleMassKg": "Massa Muscolo Scheletrico (kg) nello storico",
            "bodyFatPercentage": "Percentuale di Grasso (%) nello storico"
          }
        ]
      }
      
      REGOLE FINALI:
      1.  **COMPLETEZZA**: Estrai OGNI singolo parametro visibile nel report. Se un campo non è presente, impostalo a null.
      2.  **PRECISIONE NUMERICA**: Usa valori numerici dove appropriato, senza unità di misura.
      3.  **SOLO JSON**: L'output DEVE essere solo e unicamente un oggetto JSON valido. NESSUN testo o commento aggiuntivo.`;
    }
    return '';
};