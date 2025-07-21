import { supabase } from '@/lib/customSupabaseClient';

const generateSampleData = (dataType) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const dataMap = {
    sleep: {
      dataType: 'sleep',
      value: {
        totalHours: (7 + Math.random() * 2).toFixed(1),
        deepHours: (2 + Math.random()).toFixed(1),
        lightHours: (4 + Math.random()).toFixed(1),
        remHours: (1 + Math.random()).toFixed(1),
        qualityScore: Math.floor(75 + Math.random() * 20),
      },
      source: 'Simulated Data',
      recordedAt: yesterday.toISOString(),
    },
    steps: {
      dataType: 'steps',
      value: {
        count: Math.floor(4000 + Math.random() * 8000),
      },
      source: 'Simulated Data',
      recordedAt: yesterday.toISOString(),
    },
    heart_rate: {
      dataType: 'heart_rate',
      value: {
        resting: Math.floor(55 + Math.random() * 15),
        average: Math.floor(70 + Math.random() * 20),
        max: Math.floor(120 + Math.random() * 40),
      },
      source: 'Simulated Data',
      recordedAt: yesterday.toISOString(),
    },
    oxygen_saturation: {
        dataType: 'oxygen_saturation',
        value: {
            level: (95 + Math.random() * 4).toFixed(1),
            unit: '%'
        },
        source: 'Simulated Data',
        recordedAt: now.toISOString(),
    },
    stress: {
      dataType: 'stress',
      value: {
        level: (10 + Math.random() * 40).toFixed(1),
        unit: 'percentage'
      },
      source: 'Simulated Data',
      recordedAt: now.toISOString(),
    }
  };
  
  if (dataType) {
    return dataMap[dataType] ? [dataMap[dataType]] : [];
  }

  return [dataMap.sleep, dataMap.steps, dataMap.heart_rate, dataMap.oxygen_saturation, dataMap.stress];
};

const saveBiometricData = async (healthData, user_id) => {
  if (!healthData || healthData.length === 0) {
    throw new Error("Nessun dato valido da salvare.");
  }
  
  const dataToInsert = healthData.map(item => ({
    user_id,
    data_type: item.dataType,
    value: item.value,
    source: item.source,
    recorded_at: item.recordedAt,
  }));

  const { data, error } = await supabase
    .from('biometric_data')
    .insert(dataToInsert)
    .select();

  if (error) {
    console.error('Error saving biometric data:', error);
    throw new Error('Errore durante il salvataggio dei dati biometrici.');
  }

  console.log('Biometric data saved successfully:', data);
  return { success: true, syncedCount: data.length };
}

export const syncHealthData = (user_id) => {
  return new Promise(async (resolve, reject) => {
    const isIOS = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.healthKit;
    const isAndroid = window.HealthBridge;

    const timeout = setTimeout(() => {
        console.log("Native bridge timeout. Using fallback simulation.");
        const sampleData = generateSampleData();
        saveBiometricData(sampleData, user_id).then(resolve).catch(reject);
        
        window.removeEventListener('healthDataReceived', listener);
        window.removeEventListener('healthDataError', errorListener);
    }, 3000);

    const listener = (event) => {
        clearTimeout(timeout);
        console.log("Received data from native bridge:", event.detail);
        saveBiometricData(event.detail, user_id).then(resolve).catch(reject);
        window.removeEventListener('healthDataReceived', listener);
        window.removeEventListener('healthDataError', errorListener);
    };

    const errorListener = (event) => {
        clearTimeout(timeout);
        console.error("Received error from native bridge:", event.detail);
        reject(new Error(event.detail.error || "Errore sconosciuto dal ponte nativo."));
        window.removeEventListener('healthDataReceived', listener);
        window.removeEventListener('healthDataError', errorListener);
    };
    
    window.addEventListener('healthDataReceived', listener);
    window.addEventListener('healthDataError', errorListener);

    const permissions = ['steps', 'sleep', 'heart_rate', 'oxygen_saturation'];

    if (isIOS) {
      console.log('Attempting to sync with iOS HealthKit...');
      try {
        window.webkit.messageHandlers.healthKit.postMessage({ command: 'requestAuthorization', permissions });
        // The native side should then call `fetchData` after authorization
      } catch (e) {
        console.error("Error posting message to iOS bridge:", e);
      }
    } else if (isAndroid) {
      console.log('Attempting to sync with Android Health Connect...');
      try {
        window.HealthBridge.requestPermissions(JSON.stringify(permissions));
        // The native side should then call `fetchData` after authorization
      } catch (e) {
        console.error("Error calling Android bridge:", e);
      }
    } else {
      console.log('Native bridge not found. The timeout will trigger fallback simulation.');
    }
  });
};