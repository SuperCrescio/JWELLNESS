import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { supabase } from '@/lib/customSupabaseClient';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

async function extractTextFromPdf(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageTexts = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      pageTexts.push(pageText);
    }
    return pageTexts.join('\n');
  } catch (error) {
    console.warn("Could not extract text from PDF, will rely on Vision AI.", error);
    return ""; // Return empty string to trigger vision fallback
  }
}

const dayConfig = {
  plan_day_a: { key: 'plan_day_a', name: 'Giorno A' },
  plan_day_b: { key: 'plan_day_b', name: 'Giorno B' },
  plan_day_c: { key: 'plan_day_c', name: 'Giorno C' },
  plan_day_d: { key: 'plan_day_d', name: 'Giorno D' },
  plan_day_e: { key: 'plan_day_e', name: 'Giorno E' },
  plan_day_f: { key: 'plan_day_f', name: 'Giorno F' },
  plan_day_g: { key: 'plan_day_g', name: 'Giorno G' },
};

export async function processNutritionFile(file) {
  const fullText = await extractTextFromPdf(file);
  const updatePayload = {};

  const promises = Object.values(dayConfig).map(dayInfo => 
    supabase.functions.invoke('process-nutrition-plan', {
      body: { text: fullText, day: dayInfo.name },
    })
  );
  
  const results = await Promise.allSettled(promises);

  results.forEach((result, i) => {
    const dayInfo = Object.values(dayConfig)[i];
    if (result.status === 'fulfilled' && result.value.data && !result.value.data.error) {
      const { meals } = result.value.data;
      if (meals && Array.isArray(meals) && meals.length > 0) {
        updatePayload[dayInfo.key] = { day: dayInfo.name, meals };
      } else {
        updatePayload[dayInfo.key] = null;
      }
    } else {
      const reason = result.status === 'rejected' ? result.reason : (result.value.data ? result.value.data.details : 'Errore sconosciuto');
      console.warn(`Avviso per ${dayInfo.name}: Non è stato possibile elaborare il piano. Dettagli:`, reason);
      updatePayload[dayInfo.key] = null;
    }
  });

  return updatePayload;
}

export async function processWorkoutFile(file) {
  const fullText = await extractTextFromPdf(file);
  const fileBase64 = await toBase64(file);
  
  const { data, error } = await supabase.functions.invoke('process-workout-plan', {
    body: { 
      text: fullText,
      fileBase64: fileBase64
    },
  });

  if (error) {
    console.error(`Errore della funzione Supabase: ${error.message}`);
    return { planName: "Errore di Analisi", sessions: [] };
  }

  if (!data || data.error) {
    console.error(`Errore nell'analisi del piano di allenamento: ${data ? (data.details || data.error) : 'Nessun dato restituito'}`);
    return { planName: "Errore di Analisi AI", sessions: [] };
  }
  
  return data.plan;
}

async function processBiaFromPdf(file) {
  const text = await extractTextFromPdf(file);
  const { data, error } = await supabase.functions.invoke('process-bia-report', {
    body: { text },
  });
  if (error) {
    throw new Error(`Errore della funzione Supabase (PDF): ${error.message}`);
  }
  if (data.error) {
    throw new Error(`Errore nell'analisi del PDF BIA: ${data.details || data.error}`);
  }
  return data;
}

async function processBiaFromImage(file) {
    const base64Image = await toBase64(file);
    const { data, error } = await supabase.functions.invoke('process-bia-image', {
        body: { image: base64Image },
    });

    if (error) {
        throw new Error(`Errore della funzione Supabase per BIA: ${error.message}`);
    }
    if (data.error) {
        throw new Error(`Errore nell'analisi dell'immagine BIA: ${data.details || data.error}`);
    }

    return data;
}

export async function processBiaFile(file) {
  if (file.type.startsWith('image/')) {
    return await processBiaFromImage(file);
  } else if (file.type === 'application/pdf') {
    return await processBiaFromPdf(file);
  } else {
    throw new Error('Tipo di file non supportato per l\'analisi BIA.');
  }
}