/**
 * Multilingual Sub-Agent
 * Handles Kannada (ಕನ್ನಡ) and English Natural Language Understanding (NLU) & Translation
 */

const KANNADA_POLICE_LEXICON = {
  'ಗಸ್ತು': 'Patrol',
  'ಹೊಯ್ಸಳ': 'Hoysala Patrol Vehicle',
  'ಅಪರಾಧ': 'Crime / Incident',
  'ಬಿಟ್': 'Beat Area',
  'ಕಳ್ಳತನ': 'Theft',
  'ಸರಗಳ್ಳತನ': 'Chain Snatching',
  'ಪ್ರಕರಣ': 'Case / FIR',
  'ಸೂಕ್ಷ್ಮ ಪ್ರದೇಶ': 'Hotspot / Sensitive Area',
};

class MultilingualSubAgent {
  async parseInput(text, language = 'en') {
    if (!text) {
      return { text: 'General Police Status Request', language: 'en' };
    }

    let isKannada = language === 'kn' || /[\u0C80-\u0CFF]/.test(text);
    let parsedText = text;

    if (isKannada) {
      // Basic Kannada entity & lexicon normalization
      let translated = text;
      Object.entries(KANNADA_POLICE_LEXICON).forEach(([knWord, enWord]) => {
        translated = translated.replace(new RegExp(knWord, 'g'), enWord);
      });
      parsedText = translated;
    }

    return {
      originalText: text,
      text: parsedText,
      language: isKannada ? 'kn' : 'en',
    };
  }

  formatResponse(briefing, targetLanguage = 'en') {
    if (targetLanguage === 'kn') {
      return {
        ...briefing,
        language: 'kn',
        translatedHeader: 'ಕೇಂದ್ರೀಯ ಪೊಲೀಸ್ ವಿಶ್ಲೇಷಣೆ ವ್ಯವಸ್ಥೆ - ನಮ್ಮರಕ್ಷಾ',
        summaryKannada: `ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ: ${briefing.title}. ದತ್ತಾಂಶ ಬಿಎನ್‌ಎಸ್ ೨೦೨೩ ನಿಯಮಗಳಿಗೆ ಬದ್ಧವಾಗಿದೆ.`,
      };
    }
    return {
      ...briefing,
      language: 'en',
      translatedHeader: 'KSP Central Analytics Engine - NammaRaksha',
    };
  }
}

module.exports = new MultilingualSubAgent();
