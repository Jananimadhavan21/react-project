import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Sparkles, MessageCircle, Send, CheckCircle2, XCircle,
  Globe, FileText, ChevronRight, X, Filter, Loader2, ShieldCheck,
  Wallet, GraduationCap, Tractor, HeartPulse, Home as HomeIcon, Users
} from "lucide-react";

/**
 * AI-Powered Government Scheme Navigator
 * Single-file React component (Tailwind core utilities only).
 *
 * Features:
 *  - Searchable / filterable scheme catalogue
 *  - Rule-based "AI" eligibility checker (deterministic, explainable)
 *  - Recommendation engine (scores schemes against user profile)
 *  - AI chatbot (rule + retrieval based, no external API needed)
 *  - Multi-language UI (English / Tamil / Hindi)
 *  - Document checklist / verification simulator
 */

// ---------------------------------------------------------------------------
// 1. DATA: Scheme catalogue
// ---------------------------------------------------------------------------

const SCHEMES = [
  {
    id: "pmkisan",
    name: { en: "PM-KISAN", ta: "பிஎம்-கிசான்", hi: "पीएम-किसान" },
    category: "agriculture",
    icon: Tractor,
    desc: {
      en: "Income support of ₹6,000/year for landholding farmer families.",
      ta: "நிலம் வைத்திருக்கும் விவசாயக் குடும்பங்களுக்கு ஆண்டுக்கு ₹6,000 ஆதரவு.",
      hi: "भूमिधारक किसान परिवारों के लिए ₹6,000/वर्ष की सहायता।",
    },
    benefit: { en: "₹2,000 every 4 months (3 installments/year)", ta: "4 மாதங்களுக்கு ஒருமுறை ₹2,000", hi: "हर 4 माह में ₹2,000" },
    eligibility: { minAge: 18, maxIncome: null, occupation: ["farmer"], landholding: true, state: "any" },
    documents: ["Aadhaar Card", "Land Records", "Bank Passbook"],
  },
  {
    id: "ayushman",
    name: { en: "Ayushman Bharat (PM-JAY)", ta: "ஆயுஷ்மான் பாரத்", hi: "आयुष्मान भारत" },
    category: "health",
    icon: HeartPulse,
    desc: {
      en: "Health cover of ₹5 lakh/family/year for secondary & tertiary care.",
      ta: "குடும்பத்திற்கு ஆண்டுக்கு ₹5 லட்சம் சிகிச்சைச் செலவு காப்பீடு.",
      hi: "परिवार को प्रति वर्ष ₹5 लाख तक का स्वास्थ्य कवर।",
    },
    benefit: { en: "₹5,00,000 cashless hospitalisation cover", ta: "₹5,00,000 பணமில்லா மருத்துவ காப்பீடு", hi: "₹5,00,000 कैशलेस अस्पताल कवर" },
    eligibility: { minAge: 0, maxIncome: 250000, occupation: ["any"], landholding: null, state: "any" },
    documents: ["Aadhaar Card", "Ration Card", "Income Certificate"],
  },
  {
    id: "scholarship",
    name: { en: "National Means-cum-Merit Scholarship", ta: "தேசிய திறமை மற்றும் தகுதி உதவித்தொகை", hi: "राष्ट्रीय मेधावी छात्रवृत्ति" },
    category: "education",
    icon: GraduationCap,
    desc: {
      en: "₹12,000/year scholarship for economically weaker meritorious students (class 9–12).",
      ta: "9–12ஆம் வகுப்பு திறமையான மாணவர்களுக்கு ஆண்டுக்கு ₹12,000 உதவித்தொகை.",
      hi: "कक्षा 9–12 के मेधावी छात्रों हेतु ₹12,000/वर्ष की छात्रवृत्ति।",
    },
    benefit: { en: "₹12,000 per year", ta: "ஆண்டுக்கு ₹12,000", hi: "₹12,000 प्रति वर्ष" },
    eligibility: { minAge: 13, maxAge: 20, maxIncome: 150000, occupation: ["student"], landholding: null, state: "any" },
    documents: ["Aadhaar Card", "Income Certificate", "Mark Sheet"],
  },
  {
    id: "ujjwala",
    name: { en: "Pradhan Mantri Ujjwala Yojana", ta: "பிரதமர் உஜ்வலா திட்டம்", hi: "प्रधानमंत्री उज्ज्वला योजना" },
    category: "housing",
    icon: HomeIcon,
    desc: {
      en: "Free LPG gas connection for women from BPL households.",
      ta: "வறுமைக் கோட்டிற்குக் கீழ் உள்ள பெண்களுக்கு இலவச எல்.பி.ஜி இணைப்பு.",
      hi: "बीपीएल परिवारों की महिलाओं हेतु मुफ्त एलपीजी कनेक्शन।",
    },
    benefit: { en: "Free LPG connection + first refill", ta: "இலவச எல்.பி.ஜி இணைப்பு + முதல் ரீஃபில்", hi: "मुफ्त एलपीजी कनेक्शन + पहली रिफिल" },
    eligibility: { minAge: 18, gender: "female", maxIncome: 100000, occupation: ["any"], landholding: null, state: "any" },
    documents: ["Aadhaar Card", "BPL Card", "Bank Passbook"],
  },
  {
    id: "mudra",
    name: { en: "PM MUDRA Yojana", ta: "பிஎம் முத்ரா திட்டம்", hi: "पीएम मुद्रा योजना" },
    category: "business",
    icon: Wallet,
    desc: {
      en: "Collateral-free loans up to ₹10 lakh for micro/small business owners.",
      ta: "சிறு தொழில் முனைவோருக்கு ₹10 லட்சம் வரை அடமானமில்லா கடன்.",
      hi: "सूक्ष्म/छोटे व्यवसायियों हेतु ₹10 लाख तक का बिना गारंटी ऋण।",
    },
    benefit: { en: "Loan up to ₹10,00,000, no collateral", ta: "₹10,00,000 வரை அடமானமில்லா கடன்", hi: "₹10,00,000 तक बिना गारंटी ऋण" },
    eligibility: { minAge: 18, maxIncome: null, occupation: ["business", "self-employed"], landholding: null, state: "any" },
    documents: ["Aadhaar Card", "PAN Card", "Business Plan"],
  },
  {
    id: "vridha",
    name: { en: "National Old Age Pension Scheme", ta: "தேசிய முதியோர் ஓய்வூதியத் திட்டம்", hi: "राष्ट्रीय वृद्धावस्था पेंशन योजना" },
    category: "pension",
    icon: Users,
    desc: {
      en: "Monthly pension for senior citizens (60+) living below poverty line.",
      ta: "வறுமைக் கோட்டிற்குக் கீழ் வாழும் 60+ வயது மூத்த குடிமக்களுக்கு மாத ஓய்வூதியம்.",
      hi: "गरीबी रेखा से नीचे रहने वाले 60+ वृद्धों हेतु मासिक पेंशन।",
    },
    benefit: { en: "₹200–500 per month", ta: "மாதம் ₹200–500", hi: "₹200–500 प्रति माह" },
    eligibility: { minAge: 60, maxIncome: 100000, occupation: ["any"], landholding: null, state: "any" },
    documents: ["Aadhaar Card", "Age Proof", "BPL Card"],
  },
];

const CATEGORIES = [
  { id: "all", label: { en: "All", ta: "அனைத்தும்", hi: "सभी" } },
  { id: "agriculture", label: { en: "Agriculture", ta: "விவசாயம்", hi: "कृषि" } },
  { id: "health", label: { en: "Health", ta: "சுகாதாரம்", hi: "स्वास्थ्य" } },
  { id: "education", label: { en: "Education", ta: "கல்வி", hi: "शिक्षा" } },
  { id: "housing", label: { en: "Housing", ta: "வீட்டுவசதி", hi: "आवास" } },
  { id: "business", label: { en: "Business", ta: "தொழில்", hi: "व्यवसाय" } },
  { id: "pension", label: { en: "Pension", ta: "ஓய்வூதியம்", hi: "पेंशन" } },
];

const STRINGS = {
  title: { en: "Scheme Navigator", ta: "திட்ட வழிகாட்டி", hi: "योजना नेविगेटर" },
  subtitle: {
    en: "Find, check eligibility, and apply for government welfare schemes — in your language.",
    ta: "உங்கள் மொழியில் அரசு திட்டங்களைக் கண்டறிந்து, தகுதியை சரிபார்த்து, விண்ணப்பிக்கவும்.",
    hi: "अपनी भाषा में सरकारी योजनाएं खोजें, पात्रता जांचें और आवेदन करें।",
  },
  searchPlaceholder: { en: "Search schemes (e.g. farmer, health, scholarship)...", ta: "திட்டங்களைத் தேடுங்கள் (எ.கா. விவசாயி, சுகாதாரம்)...", hi: "योजनाएं खोजें (जैसे किसान, स्वास्थ्य)..." },
  checkEligibility: { en: "Check Eligibility", ta: "தகுதியை சரிபார்க்க", hi: "पात्रता जांचें" },
  viewDocuments: { en: "Documents Needed", ta: "தேவையான ஆவணங்கள்", hi: "आवश्यक दस्तावेज़" },
  recommended: { en: "Recommended For You", ta: "உங்களுக்காக பரிந்துரைக்கப்பட்டவை", hi: "आपके लिए सुझाई गई" },
  fillProfile: { en: "Fill your profile for personalised recommendations", ta: "தனிப்பயன் பரிந்துரைகளுக்கு உங்கள் விவரத்தை நிரப்பவும்", hi: "व्यक्तिगत सुझावों हेतु अपनी प्रोफ़ाइल भरें" },
  chatTitle: { en: "Ask the Scheme Assistant", ta: "திட்ட உதவியாளரிடம் கேளுங்கள்", hi: "योजना सहायक से पूछें" },
  chatPlaceholder: { en: "e.g. I am a 22 year old farmer, what can I get?", ta: "எ.கா. நான் 22 வயது விவசாயி, எனக்கு என்ன கிடைக்கும்?", hi: "जैसे मैं 22 साल का किसान हूं, मुझे क्या मिल सकता है?" },
  eligible: { en: "Eligible", ta: "தகுதியுடையவர்", hi: "पात्र" },
  notEligible: { en: "Not Eligible", ta: "தகுதியற்றவர்", hi: "अपात्र" },
  age: { en: "Age", ta: "வயது", hi: "उम्र" },
  income: { en: "Annual Family Income (₹)", ta: "ஆண்டு குடும்ப வருமானம் (₹)", hi: "वार्षिक परिवार आय (₹)" },
  gender: { en: "Gender", ta: "பாலினம்", hi: "लिंग" },
  occupation: { en: "Occupation", ta: "தொழில்", hi: "व्यवसाय" },
  male: { en: "Male", ta: "ஆண்", hi: "पुरुष" },
  female: { en: "Female", ta: "பெண்", hi: "महिला" },
  other: { en: "Other", ta: "மற்றவை", hi: "अन्य" },
  landholding: { en: "Do you own agricultural land?", ta: "உங்களுக்கு விவசாய நிலம் உள்ளதா?", hi: "क्या आपके पास कृषि भूमि है?" },
  yes: { en: "Yes", ta: "ஆம்", hi: "हाँ" },
  no: { en: "No", ta: "இல்லை", hi: "नहीं" },
  runCheck: { en: "Check My Eligibility", ta: "எனது தகுதியை சரிபார்", hi: "मेरी पात्रता जांचें" },
  close: { en: "Close", ta: "மூடு", hi: "बंद करें" },
  docUpload: { en: "Simulate Document Verification", ta: "ஆவண சரிபார்ப்பை சிமுலேட் செய்க", hi: "दस्तावेज़ सत्यापन का अनुकरण करें" },
  verify: { en: "Verify", ta: "சரிபார்", hi: "सत्यापित करें" },
  noResults: { en: "No schemes match your search.", ta: "உங்கள் தேடலுக்கு பொருந்தும் திட்டங்கள் இல்லை.", hi: "कोई योजना मेल नहीं खाती।" },
};

// ---------------------------------------------------------------------------
// 2. "AI" ENGINE: deterministic eligibility + recommendation + chatbot
//    (No external API key needed — transparent rule engine that explains itself,
//     which is what a real scheme-navigator needs for trust/auditability.)
// ---------------------------------------------------------------------------

function checkEligibility(scheme, profile) {
  const reasons = [];
  let ok = true;

  if (scheme.eligibility.minAge != null && profile.age < scheme.eligibility.minAge) {
    ok = false;
    reasons.push(`Minimum age required: ${scheme.eligibility.minAge}`);
  }
  if (scheme.eligibility.maxAge != null && profile.age > scheme.eligibility.maxAge) {
    ok = false;
    reasons.push(`Maximum age allowed: ${scheme.eligibility.maxAge}`);
  }
  if (scheme.eligibility.maxIncome != null && profile.income > scheme.eligibility.maxIncome) {
    ok = false;
    reasons.push(`Family income must be below ₹${scheme.eligibility.maxIncome.toLocaleString("en-IN")}`);
  }
  if (scheme.eligibility.gender && scheme.eligibility.gender !== profile.gender) {
    ok = false;
    reasons.push(`Scheme is for ${scheme.eligibility.gender} applicants`);
  }
  if (
    scheme.eligibility.occupation &&
    !scheme.eligibility.occupation.includes("any") &&
    !scheme.eligibility.occupation.includes(profile.occupation)
  ) {
    ok = false;
    reasons.push(`Occupation must be: ${scheme.eligibility.occupation.join(" / ")}`);
  }
  if (scheme.eligibility.landholding === true && !profile.landholding) {
    ok = false;
    reasons.push(`Requires ownership of agricultural land`);
  }

  if (ok) reasons.push("All criteria matched.");
  return { ok, reasons };
}

function scoreScheme(scheme, profile) {
  const { ok } = checkEligibility(scheme, profile);
  let score = ok ? 100 : 0;
  // soft-boost: closeness on income / age even when ineligible, for ranking "near matches"
  if (!ok) {
    if (scheme.eligibility.maxIncome != null) {
      const diff = Math.abs(profile.income - scheme.eligibility.maxIncome);
      score += Math.max(0, 20 - diff / 10000);
    }
  }
  return score;
}

function getRecommendations(profile, lang, topN = 3) {
  return [...SCHEMES]
    .map((s) => ({ scheme: s, score: scoreScheme(s, profile), eligible: checkEligibility(s, profile).ok }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

// Lightweight intent + slot extraction for the chatbot (keyword/regex based).
function parseUserMessage(text) {
  const lower = text.toLowerCase();
  const profile = {};

  const ageMatch = lower.match(/(\d{1,3})\s*(years|year|yrs|வயது|साल|वर्ष)/);
  if (ageMatch) profile.age = parseInt(ageMatch[1], 10);
  else {
    const bareAge = lower.match(/\b(\d{1,3})\b/);
    if (bareAge && lower.includes("age")) profile.age = parseInt(bareAge[1], 10);
  }

  if (/farmer|agricult|விவசாய|किसान/.test(lower)) profile.occupation = "farmer";
  else if (/student|படிக்கும்|छात्र/.test(lower)) profile.occupation = "student";
  else if (/business|shop|தொழில்|व्यवसाय/.test(lower)) profile.occupation = "business";
  else if (/self.?employ/.test(lower)) profile.occupation = "self-employed";

  if (/\bwoman|female|பெண்|महिला/.test(lower)) profile.gender = "female";
  if (/\bman\b|male|ஆண்|पुरुष/.test(lower)) profile.gender = "male";

  const incomeMatch = lower.match(/(\d+(?:,\d{3})*)\s*(rs|rupees|₹|income)/);
  if (incomeMatch) profile.income = parseInt(incomeMatch[1].replace(/,/g, ""), 10);

  if (/land|நிலம்|भूमि/.test(lower)) profile.landholding = true;

  return profile;
}

function botReply(userText, lang, conversationProfile) {
  const extracted = parseUserMessage(userText);
  const profile = { ...conversationProfile, ...extracted };

  const lower = userText.toLowerCase();

  // Greeting
  if (/^(hi|hello|hey|வணக்கம்|नमस्ते)\b/.test(lower.trim())) {
    return {
      profile,
      text: {
        en: "Hello! Tell me your age, occupation, and approximate family income, and I'll find schemes you may qualify for. For example: \"I am a 22 year old farmer with income 80000\".",
        ta: "வணக்கம்! உங்கள் வயது, தொழில், குடும்ப வருமானத்தைச் சொல்லுங்கள் — பொருந்தும் திட்டங்களைக் கண்டறிகிறேன்.",
        hi: "नमस्ते! अपनी उम्र, व्यवसाय और आय बताएं — मैं उपयुक्त योजनाएं खोजूंगा।",
      }[lang],
    };
  }

  // Document question
  if (/document|आवश्यक|ஆவணம்/.test(lower)) {
    const allDocs = [...new Set(SCHEMES.flatMap((s) => s.documents))];
    return {
      profile,
      text: {
        en: `Most schemes commonly require: ${allDocs.join(", ")}. Tell me a specific scheme name for its exact list.`,
        ta: `பெரும்பாலான திட்டங்களுக்கு தேவை: ${allDocs.join(", ")}. குறிப்பிட்ட திட்டத்தின் பெயரைச் சொன்னால் சரியான பட்டியலைத் தருகிறேன்.`,
        hi: `अधिकांश योजनाओं हेतु आवश्यक: ${allDocs.join(", ")}। सटीक सूची हेतु योजना का नाम बताएं।`,
      }[lang],
    };
  }

  const hasEnoughProfile = profile.age != null && profile.occupation;

  if (!hasEnoughProfile) {
    const missing = [];
    if (profile.age == null) missing.push(lang === "ta" ? "வயது" : lang === "hi" ? "उम्र" : "age");
    if (!profile.occupation) missing.push(lang === "ta" ? "தொழில்" : lang === "hi" ? "व्यवसाय" : "occupation");
    return {
      profile,
      text: {
        en: `I still need your ${missing.join(" and ")} to check eligibility. Could you share that?`,
        ta: `தகுதியை சரிபார்க்க உங்கள் ${missing.join(" மற்றும் ")} தேவை. சொல்ல முடியுமா?`,
        hi: `पात्रता जांचने हेतु आपका ${missing.join(" और ")} चाहिए। कृपया बताएं?`,
      }[lang],
    };
  }

  const fullProfile = {
    age: profile.age ?? 30,
    income: profile.income ?? 200000,
    gender: profile.gender ?? "other",
    occupation: profile.occupation ?? "any",
    landholding: profile.landholding ?? false,
  };

  const recs = getRecommendations(fullProfile, lang, 3).filter((r) => r.eligible);

  if (recs.length === 0) {
    return {
      profile,
      text: {
        en: "Based on what you've shared, I couldn't find a confident match yet. Try adjusting income/age details, or browse all schemes below.",
        ta: "கொடுக்கப்பட்ட தகவலின் அடிப்படையில் பொருத்தமான திட்டம் இல்லை. வருமானம்/வயதை சரிசெய்து முயற்சிக்கவும்.",
        hi: "दी गई जानकारी से कोई पुख्ता मिलान नहीं मिला। आय/उम्र समायोजित कर पुनः प्रयास करें।",
      }[lang],
    };
  }

  const list = recs
    .map((r) => `• ${r.scheme.name[lang]} — ${r.scheme.benefit[lang]}`)
    .join("\n");

  return {
    profile,
    text: {
      en: `Based on your profile, you may be eligible for:\n${list}\n\nClick "Check Eligibility" on any scheme card for the full breakdown.`,
      ta: `உங்கள் விவரத்தின் அடிப்படையில் இவை பொருந்தும்:\n${list}\n\nமுழு விவரத்திற்கு திட்ட அட்டையில் உள்ள "தகுதியை சரிபார்க்க" பொத்தானை அழுத்தவும்.`,
      hi: `आपकी जानकारी के आधार पर ये योजनाएं उपयुक्त हो सकती हैं:\n${list}\n\nपूर्ण विवरण हेतु "पात्रता जांचें" बटन दबाएं।`,
    }[lang],
  };
}

// ---------------------------------------------------------------------------
// 3. UI COMPONENTS
// ---------------------------------------------------------------------------

function LanguageSwitch({ lang, setLang }) {
  const langs = [
    { id: "en", label: "EN" },
    { id: "ta", label: "தமிழ்" },
    { id: "hi", label: "हिं" },
  ];
  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-full p-1 backdrop-blur-sm border border-white/15">
      <Globe className="w-4 h-4 text-emerald-100 ml-2" />
      {langs.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            lang === l.id ? "bg-white text-emerald-800" : "text-emerald-50 hover:bg-white/10"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function SchemeCard({ scheme, lang, onCheck, onDocs }) {
  const Icon = scheme.icon;
  return (
    <div className="group bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-emerald-700" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
          {scheme.category}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-stone-900 leading-snug">{scheme.name[lang]}</h3>
      <p className="text-sm text-stone-600 leading-relaxed flex-1">{scheme.desc[lang]}</p>
      <p className="text-sm font-medium text-emerald-700">{scheme.benefit[lang]}</p>
      <div className="flex gap-2 pt-2 border-t border-stone-100">
        <button
          onClick={() => onCheck(scheme)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium bg-emerald-700 text-white rounded-lg py-2 hover:bg-emerald-800 transition-colors"
        >
          <ShieldCheck className="w-4 h-4" /> {STRINGS.checkEligibility[lang]}
        </button>
        <button
          onClick={() => onDocs(scheme)}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium border border-stone-300 text-stone-700 rounded-lg px-3 hover:bg-stone-50 transition-colors"
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function EligibilityModal({ scheme, lang, onClose }) {
  const [profile, setProfile] = useState({
    age: 25,
    income: 100000,
    gender: "male",
    occupation: "farmer",
    landholding: false,
  });
  const [result, setResult] = useState(null);

  if (!scheme) return null;

  const run = () => setResult(checkEligibility(scheme, profile));

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-stone-900">{scheme.name[lang]}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700">{STRINGS.age[lang]}: {profile.age}</label>
            <input
              type="range" min="0" max="100" value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value, 10) })}
              className="w-full accent-emerald-700"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">{STRINGS.income[lang]}</label>
            <input
              type="number" value={profile.income}
              onChange={(e) => setProfile({ ...profile, income: parseInt(e.target.value || "0", 10) })}
              className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">{STRINGS.gender[lang]}</label>
            <div className="flex gap-2 mt-1">
              {["male", "female", "other"].map((g) => (
                <button
                  key={g}
                  onClick={() => setProfile({ ...profile, gender: g })}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    profile.gender === g ? "bg-emerald-700 text-white border-emerald-700" : "border-stone-300 text-stone-600"
                  }`}
                >
                  {STRINGS[g][lang]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">{STRINGS.occupation[lang]}</label>
            <select
              value={profile.occupation}
              onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
              className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
            >
              {["farmer", "student", "business", "self-employed", "any"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-stone-700">{STRINGS.landholding[lang]}</label>
            <button
              onClick={() => setProfile({ ...profile, landholding: !profile.landholding })}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                profile.landholding ? "bg-emerald-700 text-white border-emerald-700" : "border-stone-300 text-stone-600"
              }`}
            >
              {profile.landholding ? STRINGS.yes[lang] : STRINGS.no[lang]}
            </button>
          </div>

          <button
            onClick={run}
            className="w-full bg-emerald-700 text-white rounded-lg py-2.5 font-medium hover:bg-emerald-800 transition-colors"
          >
            {STRINGS.runCheck[lang]}
          </button>

          {result && (
            <div className={`rounded-xl p-4 border ${result.ok ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-2 font-semibold mb-2">
                {result.ok ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={result.ok ? "text-emerald-800" : "text-red-700"}>
                  {result.ok ? STRINGS.eligible[lang] : STRINGS.notEligible[lang]}
                </span>
              </div>
              <ul className="text-sm text-stone-700 space-y-1 list-disc list-inside">
                {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentsModal({ scheme, lang, onClose }) {
  const [status, setStatus] = useState({});
  const [verifying, setVerifying] = useState(null);

  if (!scheme) return null;

  const verify = (doc) => {
    setVerifying(doc);
    setTimeout(() => {
      setStatus((s) => ({ ...s, [doc]: Math.random() > 0.15 ? "verified" : "needs_review" }));
      setVerifying(null);
    }, 900);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-stone-900">{STRINGS.viewDocuments[lang]}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-stone-500 mb-4">{scheme.name[lang]}</p>
        <div className="space-y-2.5">
          {scheme.documents.map((doc) => (
            <div key={doc} className="flex items-center justify-between border border-stone-200 rounded-lg px-3 py-2.5">
              <span className="text-sm text-stone-800">{doc}</span>
              {status[doc] === "verified" && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
              )}
              {status[doc] === "needs_review" && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600"><XCircle className="w-3.5 h-3.5" /> Needs review</span>
              )}
              {!status[doc] && (
                <button
                  onClick={() => verify(doc)}
                  disabled={verifying === doc}
                  className="text-xs font-medium bg-stone-800 text-white rounded-md px-2.5 py-1 hover:bg-stone-900 disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {verifying === doc ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  {STRINGS.verify[lang]}
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-stone-400 mt-4">{STRINGS.docUpload[lang]} — simulated check for demo purposes.</p>
      </div>
    </div>
  );
}

function ChatBot({ lang }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState({});
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    const { profile: newProfile, text } = botReply(input, lang, profile);
    setProfile(newProfile);
    setMessages((m) => [...m, userMsg, { role: "bot", text }]);
    setInput("");
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-700 text-white shadow-xl flex items-center justify-center hover:bg-emerald-800 transition-colors"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[22rem] max-w-[90vw] h-[32rem] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
          <div className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium text-sm">{STRINGS.chatTitle[lang]}</span>
            </div>
            <button onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-stone-50">
            {messages.length === 0 && (
              <p className="text-xs text-stone-400 text-center mt-6">{STRINGS.chatPlaceholder[lang]}</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-line ${
                    m.role === "user" ? "bg-emerald-700 text-white" : "bg-white border border-stone-200 text-stone-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-stone-200 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={STRINGS.chatPlaceholder[lang]}
              className="flex-1 text-sm border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button onClick={send} className="bg-emerald-700 text-white rounded-lg px-3 hover:bg-emerald-800">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// 4. MAIN APP
// ---------------------------------------------------------------------------

export default function App() {
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [eligModal, setEligModal] = useState(null);
  const [docModal, setDocModal] = useState(null);

  const filtered = useMemo(() => {
    return SCHEMES.filter((s) => {
      const matchCat = category === "all" || s.category === category;
      const text = `${s.name.en} ${s.desc.en} ${s.category}`.toLowerCase();
      const matchQuery = query.trim() === "" || text.includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [query, category]);

  const sampleRecs = useMemo(
    () => getRecommendations({ age: 24, income: 90000, gender: "female", occupation: "farmer", landholding: true }, lang, 3),
    [lang]
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* HERO */}
      <header className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600 text-white">
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-14">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-semibold tracking-tight">{STRINGS.title[lang]}</span>
            </div>
            <LanguageSwitch lang={lang} setLang={setLang} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight max-w-2xl leading-tight">
            {STRINGS.title[lang]}
          </h1>
          <p className="mt-3 text-emerald-50 max-w-xl">{STRINGS.subtitle[lang]}</p>

          <div className="mt-7 relative max-w-xl">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={STRINGS.searchPlaceholder[lang]}
              className="w-full rounded-full pl-11 pr-4 py-3 text-sm text-stone-800 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>
      </header>

      {/* RECOMMENDATIONS STRIP */}
      <section className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-stone-800">{STRINGS.recommended[lang]}</h2>
            <span className="text-xs text-stone-400">({STRINGS.fillProfile[lang]})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleRecs.map(({ scheme }) => {
              const Icon = scheme.icon;
              return (
                <button
                  key={scheme.id}
                  onClick={() => setEligModal(scheme)}
                  className="flex items-center gap-3 text-left border border-stone-200 rounded-xl p-3 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800 leading-tight">{scheme.name[lang]}</p>
                    <p className="text-xs text-stone-500">{scheme.benefit[lang]}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 ml-auto shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="max-w-6xl mx-auto px-6 mt-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                category === c.id
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-white text-stone-600 border-stone-200 hover:border-emerald-300"
              }`}
            >
              {c.label[lang]}
            </button>
          ))}
        </div>
      </section>

      {/* SCHEME GRID */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <p className="text-center text-stone-400 py-16">{STRINGS.noResults[lang]}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => (
              <SchemeCard key={s.id} scheme={s} lang={lang} onCheck={setEligModal} onDocs={setDocModal} />
            ))}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-stone-400 py-8 border-t border-stone-200">
        Demo project — scheme data is illustrative, not official. Built with React.
      </footer>

      <EligibilityModal scheme={eligModal} lang={lang} onClose={() => setEligModal(null)} />
      <DocumentsModal scheme={docModal} lang={lang} onClose={() => setDocModal(null)} />
      <ChatBot lang={lang} />
    </div>
  );
}
