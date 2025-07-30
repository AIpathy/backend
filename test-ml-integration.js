const mlService = require('./services/mlService');

// Node.js 18+ için fetch global olarak mevcut

async function testMLIntegration() {
  console.log('Testing ML Integration...\n');

  // 1. Health Check
  console.log('1. Testing ML API Health Check...');
  const healthResult = await mlService.healthCheck();
  if (healthResult.success) {
    console.log('ML API is healthy:', healthResult.data);
  } else {
    console.log('ML API health check failed:', healthResult.error);
    return;
  }

  // 2. Test Anxiety Prediction
  console.log('\n2. Testing Anxiety Prediction...');
  const anxietyTestData = {
    "Yas": 53,
    "Cinsiyet": "Kadın",
    "Medeni_Hal": "Bekar",
    "Is_Durumu": "Çalışıyor",
    "Egitim": "Lise",
    "Gelir_Duzeyi": "Düşük",
    "Yasam_Yeri": "Küçük Şehir",
    "Psikolojik_Destek": "Hayır",
    "Calisma_Suresi": 12,
    "sorular": [1,4,2,4,3,3,4,3,4,4,4,2,1,0,3,1,4,3,1,1]
  };

  const anxietyResult = await mlService.predictAnxiety(anxietyTestData);
  if (anxietyResult.success) {
    console.log('Anxiety prediction successful:');
    console.log('   Risk Group:', anxietyResult.data.risk_group);
    console.log('   AI Comment:', anxietyResult.data.ai_comment.substring(0, 100) + '...');
  } else {
    console.log('Anxiety prediction failed:', anxietyResult.error);
  }

  // 3. Test Audio Analysis
  console.log('\n3. Testing Audio Analysis...');
  const audioResult = await mlService.analyzeAudioEmotion('./test-audio.m4a');
  if (audioResult.success) {
    console.log('Audio analysis successful:');
    console.log('   Transcription:', audioResult.data.transcription.substring(0, 100) + '...');
  } else {
    console.log('Audio analysis failed:', audioResult.error);
  }

  // 4. Test Borderline Prediction
  console.log('\n4. Testing Borderline Prediction...');
  const borderlineTestData = {
    "Yas": 30,
    "Cinsiyet": "Kadın",
    "Medeni_Hal": "Evli",
    "Is_Durumu": "Öğrenci",
    "Egitim": "Lise",
    "Gelir_Duzeyi": "Düşük",
    "Yasam_Yeri": "Küçük Şehir",
    "Psikolojik_Destek": "Evet",
    "Calisma_Suresi": 6,
    "sorular": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]
  };

  const borderlineResult = await mlService.predictBorderline(borderlineTestData);
  if (borderlineResult.success) {
    console.log('Borderline prediction successful:');
    console.log('   Risk Group:', borderlineResult.data.risk_group);
    console.log('   AI Comment:', borderlineResult.data.ai_comment.substring(0, 100) + '...');
  } else {
    console.log('Borderline prediction failed:', borderlineResult.error);
  }

  console.log('\nML Integration testing completed!');
}

// Run test if this file is executed directly
if (require.main === module) {
  // Add environment variables for testing
  process.env.ML_API_URL = 'https://ml.aipathy.xyz';
  process.env.ML_API_TIMEOUT = '30000';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // SSL sertifikasını bypass et
  
  testMLIntegration().catch(console.error);
}

module.exports = { testMLIntegration }; 