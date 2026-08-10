/**
 * Formatting helpers used across the dashboard.
 */

/**
 * Format a CO₂e value with smart unit scaling.
 * < 1 kg → grams, ≥ 1000 kg → tonnes
 *
 * @param {number} kg - emission value in kilograms
 * @param {number} [decimals=2] - decimal places
 * @param {Function} [t] - optional i18next translation function for localised unit labels
 */
export function formatEmission(kg, decimals = 2, t = null) {
  if (kg === null || kg === undefined) return '—';
  const gLabel  = t ? t('activitiesPage.units.g',  { defaultValue: 'g'  }) : 'g';
  const kgLabel = t ? t('activitiesPage.units.kg', { defaultValue: 'kg' }) : 'kg';
  const tLabel  = t ? t('activitiesPage.units.t',  { defaultValue: 't'  }) : 't';
  if (kg < 1)    return `${(kg * 1000).toFixed(decimals)} ${gLabel} CO₂e`;
  if (kg >= 1000) return `${(kg / 1000).toFixed(decimals)} ${tLabel} CO₂e`;
  return `${kg.toFixed(decimals)} ${kgLabel} CO₂e`;
}

/**
 * Format a date string or Date object to a readable locale date.
 */
export function formatDate(value, options = {}) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(value));
}

/**
 * Format a number with thousand separators.
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Compute a percentage with safe division.
 */
export function toPercent(part, total, decimals = 1) {
  if (!total) return '0%';
  return `${((part / total) * 100).toFixed(decimals)}%`;
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const NAME_TRANSLATIONS = {
  ta: {
    swathi: 'சுவாதி',
    'swathi r': 'சுவாதி ஆர்',
    swati: 'சுவாதி',
    jeyanthi: 'ஜெயந்தி',
    jayanthi: 'ஜெயந்தி',
    jeyan: 'ஜெயன்',
    jayan: 'ஜெயன்',
    karthik: 'கார்த்திக்',
    karthick: 'கார்த்திக்',
    divya: 'திவ்யா',
    priya: 'பிரியா',
    priyanka: 'பிரியங்கா',
    sai: 'சாய்',
    deepthi: 'தீப்தி',
    deepti: 'தீப்தி',
    admin: 'நிர்வாகி',
    user: 'பயனர்',
    eco_warrior: 'சுற்றுச்சூழல் வீரன்',
    'eco warrior': 'சுற்றுச்சூழல் வீரன்',
    ramesh: 'ரமேஷ்',
    suresh: 'சுரேஷ்',
    vijay: 'விஜய்',
    arun: 'அருண்',
    kumar: 'குமார்',
    latha: 'லதா',
    anita: 'அனிதா',
    anitha: 'அனிதா',
    deepak: 'தீபக்',
    lakshmi: 'லட்சுமி',
    ganesh: 'கணேஷ்',
    murugan: 'முருகன்',
    venkat: 'வெங்கட்',
    radha: 'ராதா',
    geetha: 'கீதா',
    gita: 'கீதா',
    meena: 'மீனா',
    sangeetha: 'சங்கீதா',
    kavitha: 'கவிதா',
    saravanan: 'சரவணன்',
    subramanian: 'சுப்ரமணியன்',
    bala: 'பாலா',
    senthil: 'செந்தில்',
    raghu: 'ரகு',
    rajesh: 'ராஜேஷ்',
    dinesh: 'தினேஷ்',
    nathan: 'நாதன்',
    manoj: 'மனோஜ்',
    sanjay: 'சஞ்சய்',
    anand: 'ஆனந்த்',
    prakash: 'பிரகாஷ்',
    sathish: 'சதீஷ்',
    ashok: 'அசோக்',
    charu: 'சாரு',
    karpaga: 'கற்பகா',
    angel: 'ஏஞ்சல்',
    rahul: 'ராகுல்',
    'rahul k': 'ராகுல் கே',
    rahuk_k: 'ராகுல் கே',
    swathi29rd: 'சுவாதி29rd',
    angel_rani: 'ஏஞ்சல் ராணி',
    greenfield_user_1: 'கிரீன்ஃபீல்ட் பயனர் 1',
    sharma: 'சர்மா',
    bhuvana: 'புவனா',
    maha: 'மகா',
    manisha: 'மனிஷா',
    'maha manisha': 'மகா மனிஷா',
    menaga: 'மேனகா',
    r: 'ஆர்',
    s: 'எஸ்',
    k: 'கே',
    m: 'எம்',
    v: 'வி',
    a: 'ஏ',
    p: 'பி',
  },
  hi: {
    swathi: 'स्वाति',
    'swathi r': 'स्वाति आर',
    swati: 'स्वाति',
    swathi29rd: 'स्वाति29rd',
    jeyanthi: 'जयंती',
    jayanthi: 'जयंती',
    jeyan: 'जयन',
    charu: 'चारू',
    karpaga: 'कर्पगा',
    angel: 'एंजेल',
    angel_rani: 'एंजेल रानी',
    greenfield_user_1: 'ग्रीनफील्ड यूजर 1',
    rahul: 'राहुल',
    'rahul k': 'राहुल के',
    rahuk_k: 'राहुल के',
    sharma: 'शर्मा',
    bhuvana: 'भुवना',
    maha: 'महा',
    manisha: 'मनीषा',
    'maha manisha': 'महा मनीषा',
    menaga: 'मेनका',
    jayan: 'जयन',
    karthik: 'कार्तिक',
    karthick: 'कार्तिक',
    divya: 'दिव्या',
    priya: 'प्रिया',
    priyanka: 'प्रियंका',
    sai: 'साई',
    deepthi: 'दीप्ति',
    deepti: 'दीप्ति',
    admin: 'व्यवस्थापक',
    user: 'उपयोगकर्ता',
    eco_warrior: 'इको वारियर',
    'eco warrior': 'इको वारियर',
    ramesh: 'रमेश',
    suresh: 'सुरेश',
    vijay: 'विजय',
    arun: 'अरुण',
    kumar: 'कुमार',
    latha: 'लता',
    anita: 'अनीता',
    anitha: 'अनीता',
    deepak: 'दीपक',
    lakshmi: 'लक्ष्मी',
    ganesh: 'गणेश',
    murugan: 'मुरुगन',
    venkat: 'वेनकट',
    radha: 'राधा',
    geetha: 'गीता',
    gita: 'गीता',
    meena: 'मीना',
    sangeetha: 'संगीता',
    kavitha: 'कविता',
    saravanan: 'सरवनन',
    subramanian: 'सुब्रमण्यम',
    bala: 'बाला',
    senthil: 'सेंथिल',
    raghu: 'रघु',
    rajesh: 'राजेश',
    dinesh: 'दिनेश',
    nathan: 'नाथन',
    manoj: 'मनोज',
    sanjay: 'संजय',
    anand: 'आनंद',
    prakash: 'प्रकाश',
    sathish: 'सतीश',
    ashok: 'अशोक',
    r: 'आर',
    s: 'एस',
    k: 'के',
    m: 'एम',
    v: 'वी',
    a: 'ए',
    p: 'पी',
  },
};

function dynamicTaPhonetic(str) {
  let s = str.toLowerCase();
  s = s.replace(/jeyan/g, 'ஜெயன்').replace(/jayan/g, 'ஜெயன்')
       .replace(/anthi/g, 'அந்தி').replace(/anth/g, 'அந்த')
       .replace(/nth/g, 'ந்த').replace(/thi/g, 'தி')
       .replace(/tha/g, 'தா').replace(/shi/g, 'ஷி')
       .replace(/sh/g, 'ஷ்').replace(/ch/g, 'ச்')
       .replace(/th/g, 'த்').replace(/dh/g, 'த்')
       .replace(/ck/g, 'க்').replace(/ng/g, 'ங்')
       .replace(/j/g, 'ஜ').replace(/y/g, 'ய')
       .replace(/r/g, 'ர்').replace(/v/g, 'வ்')
       .replace(/k/g, 'க்').replace(/m/g, 'ம்')
       .replace(/n/g, 'ன்').replace(/s/g, 'ஸ்')
       .replace(/p/g, 'ப்').replace(/b/g, 'ப்')
       .replace(/d/g, 'த்').replace(/t/g, 'ட்')
       .replace(/g/g, 'க்').replace(/l/g, 'ல்');
  return s;
}

function dynamicHiPhonetic(str) {
  let s = str.toLowerCase();
  s = s.replace(/jeyan/g, 'जयन').replace(/jayan/g, 'जयन')
       .replace(/anthi/g, 'अंती').replace(/anth/g, 'अंत')
       .replace(/nth/g, 'ंथ').replace(/thi/g, 'ति')
       .replace(/tha/g, 'था').replace(/shi/g, 'शि')
       .replace(/sh/g, 'श').replace(/ch/g, 'च')
       .replace(/th/g, 'थ').replace(/dh/g, 'ध')
       .replace(/ck/g, 'क').replace(/ng/g, 'ंग')
       .replace(/j/g, 'ज').replace(/y/g, 'य')
       .replace(/r/g, 'र').replace(/v/g, 'व')
       .replace(/k/g, 'क').replace(/m/g, 'म')
       .replace(/n/g, 'न').replace(/s/g, 'स')
       .replace(/p/g, 'प').replace(/b/g, 'ब')
       .replace(/d/g, 'द').replace(/t/g, 'ट')
       .replace(/g/g, 'ग').replace(/l/g, 'ल');
  return s;
}

export function formatUserName(name, lang = 'en') {
  if (!name) return '';
  const currentLang = (lang || 'en').split('-')[0].toLowerCase();
  if (currentLang === 'en') return name;

  const fullKey = String(name).trim().toLowerCase();
  if (NAME_TRANSLATIONS[currentLang]?.[fullKey]) {
    return NAME_TRANSLATIONS[currentLang][fullKey];
  }

  const words = String(name).trim().split(/\s+/);
  const translatedWords = words.map((w) => {
    const key = w.toLowerCase();
    if (NAME_TRANSLATIONS[currentLang]?.[key]) {
      return NAME_TRANSLATIONS[currentLang][key];
    }
    if (currentLang === 'ta') return dynamicTaPhonetic(w);
    if (currentLang === 'hi') return dynamicHiPhonetic(w);
    return w;
  });

  return translatedWords.join(' ');
}

const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  january: 0, february: 1, march: 2, april: 3, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

/**
 * Localises month labels (e.g. 'Aug' -> 'ஆக.' in Tamil, 'अग०' in Hindi)
 */
export function formatMonthLabel(monthStr, lang = 'en') {
  if (!monthStr || typeof monthStr !== 'string') return monthStr;
  const currentLang = (lang || 'en').split('-')[0].toLowerCase();
  const loc = currentLang === 'ta' ? 'ta-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-US';
  const trimmed = monthStr.trim();
  const lower = trimmed.toLowerCase();

  if (MONTH_MAP[lower] !== undefined) {
    const d = new Date(2026, MONTH_MAP[lower], 1);
    return d.toLocaleString(loc, { month: 'short' });
  }

  // Handle formats like "Aug 26" or "Mar 2026"
  const parts = trimmed.split(/\s+/);
  if (parts.length === 2 && MONTH_MAP[parts[0].toLowerCase()] !== undefined) {
    const d = new Date(2026, MONTH_MAP[parts[0].toLowerCase()], 1);
    const localizedMonth = d.toLocaleString(loc, { month: 'short' });
    return `${localizedMonth} ${parts[1]}`;
  }

  // Handle YYYY-MM
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    const [y, m] = trimmed.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleString(loc, { month: 'short', year: '2-digit' });
  }

  return monthStr;
}

/**
 * Formats goal title into the target language if a matching translation exists.
 */
export function formatGoalTitle(title, lang = 'en') {
  if (!title || typeof title !== 'string') return title;
  const currentLang = (lang || 'en').split('-')[0].toLowerCase();
  if (currentLang === 'en') return title;

  const GOAL_TRANSLATIONS = {
    ta: {
      'cut electricity use': 'மின் பயன்பாட்டைக் குறைத்தல்',
      'optimize corporate transport': 'நிறுவனப் போக்குவரத்தை மேம்படுத்துதல்',
      'reduce paper waste': 'காகிதக் கழிவுகளைக் குறைத்தல்',
      'increase renewable energy': 'புதுப்பிக்கத்தக்க ஆற்றலை அதிகரித்தல்',
      'zero single-use plastic': 'ஒற்றைப் பயன்பாட்டு நெகிழி இல்லாத சூழல்',
    },
    hi: {
      'cut electricity use': 'बिजली की खपत कम करें',
      'optimize corporate transport': 'कॉर्पोरेट परिवहन का अनुकूलन करें',
      'reduce paper waste': 'कागज की बर्बादी कम करें',
      'increase renewable energy': 'अक्षय ऊर्जा बढ़ाएं',
      'zero single-use plastic': 'सिंगल यूज प्लास्टिक बंद करें',
    },
  };

  const key = title.trim().toLowerCase();
  return GOAL_TRANSLATIONS[currentLang]?.[key] || title;
}

/**
 * Formats challenge title or description into target language if matching translation exists.
 */
export function formatChallengeText(text, lang = 'en') {
  if (!text || typeof text !== 'string') return text;
  const currentLang = (lang || 'en').split('-')[0].toLowerCase();
  if (currentLang === 'en') return text;

  const CHALLENGE_TRANSLATIONS = {
    ta: {
      'low carbon week': 'குறைந்த கார்பன் வாரம்',
      'eco commuter sprint': 'பசுமைப் பயணத் தொடர்',
      'electricity saver': 'மின்சாரச் சேமிப்பாளர்',
      'plant-based streak': 'தாவர அடிப்படையிலான உணவுத் தொடர்',
      'zero-waste retailer': 'பூஜ்ஜியக் கழிவு சில்லறை வணிகம்',
      'clean energy pioneer': 'தூய்மை ஆற்றல் முன்னோடி',
      'eco transit champion': 'பசுமைப் போக்குவரத்து சாம்பியன்',
      'green hero monthly sprint': 'பசுமை கதாநாயகன் மாதாந்திர தொடர்',
      'reduce transport': 'போக்குவரத்தைக் குறைத்தல்',
      'log sustainable choices throughout the week.': 'வாரம் முழுவதும் நிலையான தேர்வுகளைப் பதிவுசெய்க.',
      'log 3 eco-friendly travel choices like carpooling, cycling, or ev transit.': 'கார்பூலிங், சைக்கிள் ஓட்டுதல் அல்லது EV போக்குவரத்து போன்ற 3 சூழல் நட்பு பயணத் தேர்வுகளைப் பதிவுசெய்க.',
      'keep weekly power emissions below 15 kg co₂e through smart energy habits.': 'ஸ்மார்ட் ஆற்றல் பழக்கவழக்கங்கள் மூலம் வாராந்திர மின்சார உமிழ்வை 15 கிலோ CO₂eக்கு குறைவாக வைத்திருங்கள்.',
      'log vegetarian or low-impact plant-based meals on 4 separate days.': '4 தனித்தனி நாட்களில் காய்கறி அல்லது குறைந்த தாக்கத்தை ஏற்படுத்தும் தாவர அடிப்படையிலான உணவுகளைப் பதிவுசெய்க.',
      'log 2 eco-conscious, minimal packaging or sustainable retail choices.': '2 சூழல் விழிப்புணர்வு, குறைந்தபட்ச பேக்கேஜிங் அல்லது நிலையான சில்லறைத் தேர்வுகளைப் பதிவுசெய்க.',
      'log renewable energy usage or efficient power habits 5 times this month.': 'இந்த மாதத்தில் 5 முறை புதுப்பிக்கத்தக்க ஆற்றல் பயன்பாடு அல்லது திறமையான மின் பழக்கங்களை பதிவுசெய்க.',
      'choose low-emission transit on 5 distinct days of the month.': 'மாதத்தின் 5 தனித்துவமான நாட்களில் குறைந்த உமிழ்வு போக்குவரத்தைத் தேர்ந்தெடுக்கவும்.',
      'achieve 10 total logged sustainability activities across all categories.': 'அனைத்து பிரிவுகளிலும் மொத்தம் 10 பதிவுசெய்யப்பட்ட நிலைத்தன்மை செயல்பாடுகளை சாதிக்கவும்.',
      'transportation reduction': 'போக்குவரத்து குறைப்பு',
    },
    hi: {
      'low carbon week': 'कम कार्बन सप्ताह',
      'eco commuter sprint': 'इको कम्यूटर स्प्रिंट',
      'electricity saver': 'बिजली बचतकर्ता',
      'plant-based streak': 'प्लांट-बेस्ड स्ट्रिक',
      'zero-waste retailer': 'ज़ीरो-वेस्ट रिटेलर',
      'clean energy pioneer': 'स्वच्छ ऊर्जा अग्रणी',
      'eco transit champion': 'इको ट्रांजिट चैंपियन',
      'green hero monthly sprint': 'ग्रीन हीरो मंथली स्प्रिंट',
      'reduce transport': 'परिवहन घटाएं',
      'log sustainable choices throughout the week.': 'पूरे सप्ताह टिकाऊ विकल्पों को लॉग करें।',
      'log 3 eco-friendly travel choices like carpooling, cycling, or ev transit.': 'कारपूलिंग, साइकिल चलाने या ईवी पारगमन जैसे 3 पर्यावरण-अनुकूल यात्रा विकल्पों को लॉग करें।',
      'keep weekly power emissions below 15 kg co₂e through smart energy habits.': 'स्मार्ट ऊर्जा आदतों के माध्यम से साप्ताहिक बिजली उत्सर्जन को 15 किलोग्राम CO₂e से नीचे रखें।',
      'log vegetarian or low-impact plant-based meals on 4 separate days.': '4 अलग-अलग दिनों में शाकाहारी या कम प्रभाव वाले पौधे-आधारित भोजन लॉग करें।',
      'log 2 eco-conscious, minimal packaging or sustainable retail choices.': '2 पर्यावरण-सचेत, न्यूनतम पैकेजिंग या टिकाऊ खुदरा विकल्प लॉग करें।',
      'log renewable energy usage or efficient power habits 5 times this month.': 'इस महीने 5 बार नवीकरणीय ऊर्जा उपयोग या कुशल बिजली आदतों को लॉग करें।',
      'choose low-emission transit on 5 distinct days of the month.': 'महीने के 5 अलग-अलग दिनों में कम उत्सर्जन वाले पारगमन को चुनें।',
      'achieve 10 total logged sustainability activities across all categories.': 'सभी श्रेणियों में कुल 10 लॉग की गई सततता गतिविधियों को प्राप्त करें।',
      'transportation reduction': 'परिवहन में कमी',
    },
  };

  const key = text.trim().toLowerCase();
  return CHALLENGE_TRANSLATIONS[currentLang]?.[key] || text;
}

/**
 * Formats raw activity key (e.g. car_petrol, electricity_grid, chicken) into localized name.
 */
export function formatActivityName(key, lang = 'en') {
  if (!key || typeof key !== 'string') return key;
  const currentLang = (lang || 'en').split('-')[0].toLowerCase();
  if (currentLang === 'en') {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const ACTIVITY_MAP = {
    ta: {
      car_petrol: 'பெட்ரோல் கார்',
      car_diesel: 'டீசல் கார்',
      car_electric: 'மின்சார கார்',
      electricity_grid: 'மின்சார விநியோகம்',
      bus_transit: 'பேருந்து பயணம்',
      train_transit: 'ரயில் பயணம்',
      chicken: 'கோழிக்கறி',
      beef: 'மாட்டுக்கறி',
      pork: 'பன்றிக்கறி',
      fish: 'மீன்',
      vegetables: 'காய்கறிகள்',
      fruits: 'பழங்கள்',
      clothing: 'ஆடைகள்',
      electronics: 'மின்சாதனங்கள்',
    },
    hi: {
      car_petrol: 'पेट्रोल कार',
      car_diesel: 'डीजल कार',
      car_electric: 'इलेक्ट्रिक कार',
      electricity_grid: 'बिजली ग्रिड',
      bus_transit: 'बस यात्रा',
      train_transit: 'ट्रेन यात्रा',
      chicken: 'चिकन',
      beef: 'बीफ',
      pork: 'पॉर्क',
      fish: 'मछली',
      vegetables: 'सब्जियां',
      fruits: 'फल',
      clothing: 'कपड़े',
      electronics: 'इलेक्ट्रॉनिक्स',
    },
  };

  const normKey = key.trim().toLowerCase();
  return ACTIVITY_MAP[currentLang]?.[normKey] || key.replace(/_/g, ' ');
}

/**
 * Formats CSR Audit Report Type names into localized text.
 */
export function formatReportTypeName(type, lang = 'en') {
  if (!type || typeof type !== 'string') return type;
  const currentLang = (lang || 'en').split('-')[0].toLowerCase();
  if (currentLang === 'en') return type;

  const REPORT_TYPES = {
    ta: {
      'Comprehensive CSR & Environmental Audit': 'முழுமையான CSR & சுற்றுச்சூழல் தணிக்கை',
      'Itemised Activity Log Audit Trail': 'உருப்படி செய்யப்பட்ட செயல்பாட்டு பதிவு தணிக்கை தடம்',
      'Employee Participation & Roster Report': 'ஊழியர் பங்கேற்பு & பட்டியலறிக்கை',
      'Category Scope Breakdown': 'வகை நோக்கம் பகுப்பாய்வு',
      'Department Performance Report': 'துறை செயல்திறன் அறிக்கை',
      'Corporate Goals & ESG Targets': 'கார்ப்பரேட் இலக்குகள் & ESG இலக்குகள்',
    },
    hi: {
      'Comprehensive CSR & Environmental Audit': 'व्यापक CSR एवं पर्यावरण ऑडिट',
      'Itemised Activity Log Audit Trail': 'मदवार गतिविधि लॉग ऑडिट ट्रेल',
      'Employee Participation & Roster Report': 'कर्मचारी भागीदारी और रोस्टर रिपोर्ट',
      'Category Scope Breakdown': 'श्रेणी दायरा विवरण',
      'Department Performance Report': 'विभाग प्रदर्शन रिपोर्ट',
      'Corporate Goals & ESG Targets': 'कॉर्पोरेट लक्ष्य और ESG उद्देश्य',
    },
  };

  return REPORT_TYPES[currentLang]?.[type] || type;
}





