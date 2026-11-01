/**
 * Formal Legal Hindi Glossary & Transliteration Engine
 * Adheres strictly to standard Indian judicial and conveyancing nomenclature.
 */

export const LEGAL_GLOSSARY: Record<string, { hi: string; definitionEn: string; definitionHi: string }> = {
  'agreement': {
    hi: 'करार / इकरारनामा',
    definitionEn: 'A legally binding arrangement between parties',
    definitionHi: 'पक्षकारों के बीच कानूनी रूप से बाध्यकारी संविदा'
  },
  'rent agreement': {
    hi: 'किरायानामा / किराया इकरारनामा',
    definitionEn: 'Lease deed or tenancy contract',
    definitionHi: 'मकान मालिक और किरायेदार के बीच किराया अनुबंध'
  },
  'landlord': {
    hi: 'मकान मालिक / पट्टादाता',
    definitionEn: 'The lessor or owner of the premises',
    definitionHi: 'परिसर का स्वामी अथवा पट्टेदार'
  },
  'tenant': {
    hi: 'किरायेदार / पट्टेदार',
    definitionEn: 'The lessee residing or operating in the premises',
    definitionHi: 'परिसर में निवास या व्यवसाय करने वाला पक्षकार'
  },
  'premises': {
    hi: 'परिसर / संपत्ति',
    definitionEn: 'The physical property being leased or transferred',
    definitionHi: 'पट्टे या हस्तांतरण के अधीन भौतिक अचल संपत्ति'
  },
  'security deposit': {
    hi: 'प्रतिभूति राशि / जमानत राशि',
    definitionEn: 'Refundable interest-free deposit held by owner',
    definitionHi: 'मकान मालिक के पास रखी ब्याज मुक्त वापसी योग्य अमानत'
  },
  'monthly rent': {
    hi: 'मासिक किराया',
    definitionEn: 'Periodic monthly consideration for tenancy',
    definitionHi: 'किरायेदारी हेतु देय नियत मासिक प्रतिफल'
  },
  'lock-in period': {
    hi: 'अनिवार्य अवधि / लॉक-इन अवधि',
    definitionEn: 'Minimum duration where neither party can terminate',
    definitionHi: 'वह न्यूनतम अवधि जिसके दौरान अनुबंध समाप्त नहीं किया जा सकता'
  },
  'arbitration': {
    hi: 'मध्यस्थता',
    definitionEn: 'Dispute resolution outside of court',
    definitionHi: 'न्यायालय के बाहर निष्पक्ष पंच द्वारा विवाद निपटारा'
  },
  'jurisdiction': {
    hi: 'न्यायाधिकार क्षेत्र',
    definitionEn: 'Geographical court authority',
    definitionHi: 'विवाद की स्थिति में सक्षम न्यायालय का अधिकार क्षेत्र'
  },
  'indemnity': {
    hi: 'क्षतिपूर्ति',
    definitionEn: 'Obligation to compensate for loss or harm',
    definitionHi: 'नुकसान अथवा हानि की भरपाई करने का दायित्व'
  },
  'severability': {
    hi: 'पृथक्करणीयता',
    definitionEn: 'Invalidity of one clause does not void the contract',
    definitionHi: 'एक शर्त के अमान्य होने पर भी शेष अनुबंध प्रभावी रहना'
  },
  'witness': {
    hi: 'गवाह / साक्षी',
    definitionEn: 'Person attesting execution of the document',
    definitionHi: 'दस्तावेज निष्पादन की पुष्टि करने वाला व्यक्ति'
  },
  'power of attorney': {
    hi: 'मुख्तारनामा / अधिकार पत्र',
    definitionEn: 'Legal authority granted to act on behalf of another',
    definitionHi: 'किसी अन्य की ओर से कार्य करने का कानूनी प्राधिकार'
  },
  'affidavit': {
    hi: 'शपथ पत्र / हलफनामा',
    definitionEn: 'A sworn written statement on oath',
    definitionHi: 'शपथपूर्वक दिया गया लिखित बयान'
  }
}

// Common Name & Place Transliteration Map
export const TRANSLITERATION_MAP: Record<string, string> = {
  // Common Names
  'rahul': 'राहुल', 'sharma': 'शर्मा', 'vikram': 'विक्रम', 'mehta': 'मेहता',
  'priya': 'प्रिया', 'arjun': 'अर्जुन', 'amit': 'अमित', 'patel': 'पटेल',
  'neha': 'नेहा', 'gupta': 'गुप्ता', 'suresh': 'सुरेश', 'kumar': 'कुमार',
  'anita': 'अनीता', 'singh': 'सिंह', 'rohit': 'रोहित', 'verma': 'वर्मा',
  'rajesh': 'राजेश', 'joshi': 'जोशी', 'pooja': 'पूजा', 'mishra': 'मिश्रा',
  'manoj': 'मनोज', 'yadav': 'यादव', 'deepak': 'दीपक', 'tiwari': 'तिवारी',
  'sanjay': 'संजय', 'pandey': 'पांडेय', 'anil': 'अनिल', 'reddy': 'रेड्डी',

  // Common Cities / States
  'delhi': 'दिल्ली', 'new delhi': 'नई दिल्ली', 'noida': 'नोएडा', 'gurugram': 'गुरुग्राम',
  'gurgaon': 'गुड़गांव', 'mumbai': 'मुंबई', 'bengaluru': 'बेंगलुरु', 'bangalore': 'बैंगलोर',
  'hyderabad': 'हैदराबाद', 'chennai': 'चेन्नई', 'kolkata': 'कोलकाता', 'pune': 'पुणे',
  'jaipur': 'जयपुर', 'lucknow': 'लखनऊ', 'chandigarh': 'चंडीगढ़', 'ahmedabad': 'अहमदाबाद',
  'india': 'भारत', 'uttar pradesh': 'उत्तर प्रदेश', 'haryana': 'हरियाणा', 'maharashtra': 'महाराष्ट्र',
  'karnataka': 'कर्नाटक', 'rajasthan': 'राजस्थान', 'gujarat': 'गुजरात',

  // Common words
  'flat': 'फ्लैट', 'apartment': 'अपार्टमेंट', 'tower': 'टावर', 'sector': 'सेक्टर',
  'road': 'रोड', 'colony': 'कॉलोनी', 'nagar': 'नगर', 'vihar': 'विहार',
  'enclave': 'एन्क्लेव', 'plot': 'प्लॉट', 'block': 'ब्लॉक', 'phase': 'फेज'
}

/**
 * Transliterates an English string of names/addresses into Devanagari.
 * If a word is known in TRANSLITERATION_MAP, it translates precisely.
 * Otherwise, it uses phoneme substitution so names retain natural Hindi pronunciation.
 */
export function transliterateToDevanagari(text: string): string {
  if (!text) return ''

  return text
    .split(' ')
    .map(word => {
      const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (TRANSLITERATION_MAP[clean]) {
        // preserve trailing punctuation if any
        const punct = word.replace(/[a-zA-Z0-9]/g, '')
        return TRANSLITERATION_MAP[clean] + punct
      }

      // Basic phonetic mapper for unknown words
      return phoneticFallback(word)
    })
    .join(' ')
}

function phoneticFallback(str: string): string {
  let s = str.toLowerCase()
  const map: Array<[RegExp, string]> = [
    [/sh/g, 'श'], [/ch/g, 'च'], [/th/g, 'थ'], [/kh/g, 'ख'], [/gh/g, 'घ'],
    [/bh/g, 'भ'], [/dh/g, 'ध'], [/ph/g, 'फ'], [/jh/g, 'झ'], [/ee/g, 'ी'],
    [/oo/g, 'ू'], [/aa/g, 'ा'], [/ai/g, 'ै'], [/au/g, 'ौ'],
    [/a/g, 'ा'], [/b/g, 'ब'], [/c/g, 'क'], [/d/g, 'द'], [/e/g, 'े'],
    [/f/g, 'फ'], [/g/g, 'ग'], [/h/g, 'ह'], [/i/g, 'ि'], [/j/g, 'ज'],
    [/k/g, 'क'], [/l/g, 'ल'], [/m/g, 'म'], [/n/g, 'न'], [/o/g, 'ो'],
    [/p/g, 'प'], [/q/g, 'क'], [/r/g, 'र'], [/s/g, 'स'], [/t/g, 'त'],
    [/u/g, 'ु'], [/v/g, 'व'], [/w/g, 'व'], [/x/g, 'क्स'], [/y/g, 'य'], [/z/g, 'ज़']
  ]

  let out = s
  for (const [re, repl] of map) {
    out = out.replace(re, repl)
  }
  return out
}
