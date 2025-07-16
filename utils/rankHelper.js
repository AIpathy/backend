// Sadece psikoloji ve psikiyatri için rank tanımı
const RANK_MAP = {
  // Psikoloji alanı
  'psikoloji':            'Psikolog',
  'klinik psikoloji':     'Klinik Psikolog',

  // Psikiyatri alanı
  'psikiyatri':           'Pratisyen Hekim',
  'uzman psikiyatri':     'Uzman Doktor',
  'doçent psikiyatri':    'Doçent Doktor',
  'profesör psikiyatri':  'Profesör Doktor'
};

function getDefaultRank(specialization = '') {
  const key = specialization.toLowerCase().trim();
  return RANK_MAP[key] || null;
}

module.exports = { getDefaultRank };
