// ATSBoost heuristic analysis engine. Pure functions, grounded only in the provided text.
// This is an estimated compatibility score — it does not reproduce any vendor's ATS algorithm.

export const TECH_SKILLS = [
  "python","java","javascript","typescript","c++","c#","go","rust","kotlin","swift","php","ruby","sql","mysql","postgresql","mongodb","redis",
  "react","angular","vue","next.js","node.js","express","django","flask","fastapi","spring","spring boot",".net","laravel",
  "html","css","tailwind","bootstrap","rest api","graphql","microservices",
  "aws","azure","gcp","docker","kubernetes","terraform","jenkins","ci/cd","git","github","linux",
  "machine learning","deep learning","nlp","tensorflow","pytorch","pandas","numpy","scikit-learn","data analysis","power bi","tableau","excel",
  "figma","jira","agile","scrum","selenium","testing","android","ios","flutter","react native",
  "seo","digital marketing","sales","accounting","tally","sap","salesforce","project management","communication",
];
export const SOFT_SKILLS = ["communication","teamwork","leadership","problem solving","collaboration","time management","adaptability","critical thinking","ownership","stakeholder management","mentoring","presentation"];
const ACTION_VERBS = ["developed","built","designed","led","implemented","created","improved","optimized","managed","launched","delivered","automated","reduced","increased","analyzed","engineered","architected","collaborated","mentored","streamlined","deployed","integrated","resolved","achieved","coordinated","organized","established","migrated","researched","trained"];
const WEAK_PHRASES = ["worked on","responsible for","helped with","involved in","duties included","assisted in","part of","tasked with"];
const GENERIC_SUMMARY = ["hardworking","looking for a job","seeking a challenging","team player","quick learner","self-motivated","passionate individual","to utilize my skills"];
const SECTIONS: Record<string, RegExp> = {
  Summary: /^\s*(professional\s+)?(summary|profile|objective|about me|career objective)\b/im,
  Experience: /^\s*(work\s+|professional\s+)?(experience|employment|work history|internships?)\b/im,
  Education: /^\s*(education|academic|qualifications?)\b/im,
  Skills: /^\s*(technical\s+|key\s+)?skills\b|^\s*technologies\b|^\s*tech stack\b/im,
  Projects: /^\s*(academic\s+|personal\s+|key\s+)?projects?\b/im,
  Certifications: /^\s*(certifications?|courses|licenses)\b/im,
};
const PAIRED: Record<string, string[]> = {
  python: ["git","sql","docker","rest api"], django: ["postgresql","rest api","docker"], react: ["typescript","git","rest api","testing"],
  javascript: ["typescript","git","node.js"], java: ["spring boot","sql","git"], "machine learning": ["python","pandas","scikit-learn"],
  "node.js": ["express","mongodb","docker"], aws: ["docker","ci/cd","linux"], "data analysis": ["sql","excel","power bi"],
};
export const RELATED: Record<string, string[]> = {
  postgresql: ["sql","mysql"], mysql: ["sql","postgresql"], sql: ["mysql","postgresql"], aws: ["azure","gcp"], azure: ["aws","gcp"], gcp: ["aws","azure"],
  react: ["next.js","react native"], "next.js": ["react"], javascript: ["typescript"], typescript: ["javascript"], "ci/cd": ["jenkins","github"],
  kubernetes: ["docker"], "rest api": ["graphql","fastapi","express"], tableau: ["power bi"], "power bi": ["tableau"], teamwork: ["collaboration"], collaboration: ["teamwork"],
};

export type Severity = "error" | "warning";
export type Issue = { severity: Severity; title: string; why: string };
export type Analysis = {
  overall: number;
  categories: { key: string; label: string; score: number }[];
  issues: Issue[];
  strengths: string[];
  detectedKeywords: string[];
  suggestedKeywords: string[];
  recommendations: string[];
  sections: Record<string, boolean>;
  stats: { words: number; bullets: number; actionVerbs: number; weakPhrases: string[]; metrics: number };
  contact: { email: boolean; phone: boolean; linkedin: boolean };
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function hasTerm(text: string, term: string) {
  return new RegExp(`(^|[^a-z0-9+#])${esc(term)}([^a-z0-9+#]|$)`, "i").test(text);
}

export function analyzeResume(raw: string): Analysis {
  const text = raw.replace(/\r/g, "");
  const lower = text.toLowerCase();
  const words = (text.match(/\b\w+\b/g) || []).length;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const bulletLines = lines.filter((l) => /^[•●▪◦\-*–·]\s?/.test(l));
  const sections = Object.fromEntries(Object.entries(SECTIONS).map(([k, r]) => [k, r.test(text)])) as Record<string, boolean>;
  const contact = {
    email: /[\w.+-]+@[\w-]+\.[\w.]+/.test(text),
    phone: /(\+?\d[\d\s-]{8,}\d)/.test(text),
    linkedin: /linkedin\.com\//i.test(text),
  };
  const detected = TECH_SKILLS.filter((s) => hasTerm(lower, s));
  const softFound = SOFT_SKILLS.filter((s) => hasTerm(lower, s));
  const verbsUsed = ACTION_VERBS.filter((v) => hasTerm(lower, v));
  const weak = WEAK_PHRASES.filter((p) => lower.includes(p));
  const metrics = (text.match(/\b\d+(\.\d+)?\s?(%|percent|x\b|\+|k\b|lakh|crore|users|customers|hours|days|ms\b)|₹\s?\d|\$\s?\d/gi) || []).length;
  const oddSymbols = (text.match(/[★☆✦✪❖➤►■□▶◆]/g) || []).length;
  const genericHits = GENERIC_SUMMARY.filter((g) => lower.includes(g));
  const wordFreq: Record<string, number> = {};
  for (const w of lower.match(/\b[a-z]{5,}\b/g) || []) wordFreq[w] = (wordFreq[w] || 0) + 1;
  const repeated = Object.entries(wordFreq).filter(([w, c]) => c > Math.max(6, words / 60) && !["experience","project","projects","skills","using","development"].includes(w));
  const longLines = lines.filter((l) => l.split(/\s+/).length > 45).length;

  const coreSections = ["Experience", "Education", "Skills"].filter((s) => sections[s]).length;
  const structure = clamp(25 + coreSections * 18 + (sections.Summary ? 8 : 0) + (sections.Projects ? 7 : 0) + (contact.email ? 3 : 0) + (contact.phone ? 3 : 0));
  const keyword = clamp(20 + Math.min(detected.length, 14) * 5 + Math.min(softFound.length, 3) * 3);
  const formatting = clamp(95 - oddSymbols * 3 - longLines * 4 - (bulletLines.length === 0 ? 20 : 0) - (words < 200 ? 15 : 0) - (words > 1200 ? 10 : 0));
  const skills = clamp((sections.Skills ? 45 : 15) + Math.min(detected.length, 12) * 4.5);
  const experience = clamp((sections.Experience || sections.Projects ? 35 : 10) + Math.min(verbsUsed.length, 10) * 3.5 + Math.min(metrics, 6) * 4 - weak.length * 4);
  const readability = clamp(92 - longLines * 5 - repeated.length * 4 - genericHits.length * 3 - (words > 1100 ? 8 : 0));

  const categories = [
    { key: "structure", label: "Resume Structure", score: structure },
    { key: "keywords", label: "Keywords", score: keyword },
    { key: "formatting", label: "Formatting", score: formatting },
    { key: "skills", label: "Skills", score: skills },
    { key: "experience", label: "Experience", score: experience },
    { key: "readability", label: "Readability", score: readability },
  ];
  const overall = clamp(structure * 0.2 + keyword * 0.2 + formatting * 0.15 + skills * 0.15 + experience * 0.2 + readability * 0.1);

  const issues: Issue[] = [];
  const add = (cond: boolean, severity: Severity, title: string, why: string) => cond && issues.push({ severity, title, why });
  add(!contact.email || !contact.phone, "error", "Contact details incomplete", "Recruiters and ATS profiles need a clear email and phone number.");
  for (const s of ["Experience", "Education", "Skills"]) add(!sections[s], "error", `No clear "${s}" section heading`, "ATS parsers look for standard headings to map your content into fields.");
  add(metrics < 2, "error", "Few measurable achievements", "Numbers (%, users, time saved) make impact clear. Only add metrics you can genuinely back up.");
  add(weak.length > 0, "warning", "Some bullet points use weak phrasing", `Phrases like "${weak.slice(0, 2).join('", "')}" describe duties, not results. Lead with an action verb.`);
  add(verbsUsed.length < 4, "warning", "Limited use of action verbs", "Starting bullets with verbs like Developed, Led or Improved reads stronger to both ATS and recruiters.");
  add(detected.length < 6, "warning", "Job keywords are limited", "Few recognisable skills/tools were found. List the tools you actually use.");
  add(genericHits.length > 0, "warning", "Summary sounds generic", "Terms like 'hardworking' or 'looking for a job' don't add searchable keywords.");
  add(bulletLines.length === 0, "warning", "No bullet points detected", "Bullets help ATS and humans scan your experience quickly.");
  add(oddSymbols > 3, "warning", "Unusual symbols found", "Decorative icons and symbols can be misread by some parsers.");
  add(longLines > 2, "warning", "Very long paragraphs", "Break long blocks into short bullet points.");
  add(repeated.length > 0, "warning", "Some words are repeated often", `e.g. "${repeated.slice(0, 3).map((r) => r[0]).join('", "')}". Vary your wording.`);
  add(!contact.linkedin, "warning", "No LinkedIn profile link", "Many recruiters check LinkedIn; adding the URL is a quick win.");
  add(words < 200, "warning", "Resume looks very short", "There may not be enough content for keyword matching.");

  const strengths: string[] = [];
  if (contact.email && contact.phone) strengths.push("Clear contact information");
  if (sections.Education) strengths.push("Education section detected");
  if (sections.Experience) strengths.push("Experience section detected");
  if (detected.length >= 5) strengths.push("Relevant technical skills found");
  if (coreSections === 3) strengths.push("Resume sections are easy to identify");
  if (verbsUsed.length >= 5) strengths.push("Good use of action verbs");
  if (metrics >= 3) strengths.push("Includes measurable results");
  if (oddSymbols === 0 && longLines === 0) strengths.push("Clean, parser-friendly formatting");
  if (sections.Projects) strengths.push("Projects section adds evidence of skills");

  const suggested = Array.from(new Set(detected.flatMap((d) => PAIRED[d] || []))).filter((k) => !detected.includes(k)).slice(0, 8);

  const recommendations: string[] = [];
  if (!sections.Summary) recommendations.push("Add a 2–3 line professional summary naming your target role and core skills.");
  if (metrics < 2) recommendations.push("Add a measurable result to key bullets where you have one (e.g. time saved, users served).");
  if (weak.length) recommendations.push("Rewrite duty-style bullets to start with an action verb and describe the outcome.");
  if (!sections.Skills) recommendations.push('Create a dedicated "Skills" section listing tools and technologies you actually use.');
  recommendations.push("Use standard headings: Summary, Experience, Projects, Education, Skills.");
  recommendations.push("Tailor keywords to each job description you apply for.");

  return {
    overall, categories, issues, strengths, detectedKeywords: detected, suggestedKeywords: suggested, recommendations, sections, contact,
    stats: { words, bullets: bulletLines.length, actionVerbs: verbsUsed.length, weakPhrases: weak, metrics },
  };
}

export type JobMatch = {
  score: number;
  matched: string[];
  related: { jd: string; resume: string }[];
  missing: string[];
  softMatched: string[];
  softMissing: string[];
  experience: string[];
};

export function matchJob(resume: string, jd: string): JobMatch {
  const r = resume.toLowerCase();
  const j = jd.toLowerCase();
  const jdTech = TECH_SKILLS.filter((s) => hasTerm(j, s) && !SOFT_SKILLS.includes(s));
  const matched: string[] = [];
  const related: { jd: string; resume: string }[] = [];
  const missing: string[] = [];
  for (const k of jdTech) {
    if (hasTerm(r, k)) matched.push(k);
    else {
      const rel = (RELATED[k] || []).find((x) => hasTerm(r, x));
      if (rel) related.push({ jd: k, resume: rel });
      else missing.push(k);
    }
  }
  const jdSoft = SOFT_SKILLS.filter((s) => hasTerm(j, s));
  const softMatched = jdSoft.filter((s) => hasTerm(r, s) || (RELATED[s] || []).some((x) => hasTerm(r, x)));
  const softMissing = jdSoft.filter((s) => !softMatched.includes(s));
  const experience = Array.from(new Set((jd.match(/[^.\n]*\b\d+\s*\+?\s*(?:-\s*\d+\s*)?years?[^.\n]*/gi) || []).map((s) => s.trim()))).slice(0, 4);
  const total = jdTech.length + jdSoft.length * 0.5;
  const got = matched.length + related.length * 0.5 + softMatched.length * 0.5;
  const score = total === 0 ? 0 : clamp((got / total) * 100);
  return { score, matched, related, missing, softMatched, softMissing, experience };
}

export function scoreLabel(score: number) {
  if (score >= 80) return { text: "Strong ATS compatibility", tone: "success" as const };
  if (score >= 60) return { text: "Needs improvement", tone: "warning" as const };
  return { text: "Several improvements recommended", tone: "danger" as const };
}
