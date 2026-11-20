/**
 * SkillRoute AI - Curated & Verified Public Learning Resources
 * Real, authoritative, free educational sources mapped to core skills.
 */

export interface LearningResource {
  skill_id: string;
  title: string;
  title_bn?: string;
  provider: string;
  url: string;
  type: string;
  description: string;
  description_bn?: string;
  lang: string;
  isFree: boolean;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export const VERIFIED_RESOURCES: Record<string, LearningResource[]> = {
  sql: [
    {
      skill_id: "sql",
      title: "PostgreSQL Tutorial & Interactive Exercises",
      provider: "PostgreSQL Tutorial",
      url: "https://www.postgresqltutorial.com/",
      type: "Tutorial",
      description: "Structured guides on SELECT, multi-table joins, GROUP BY, and window functions.",
      description_bn: "সিলেক্ট (SELECT), মাল্টি-টেবিল জয়েন, গ্রুপ বাই (GROUP BY) এবং উইন্ডো ফাংশন সংক্রান্ত ধাপে ধাপে গাইড।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
    {
      skill_id: "sql",
      title: "SQLBolt: Interactive SQL Lessons",
      provider: "SQLBolt",
      url: "https://sqlbolt.com/",
      type: "Interactive Exercises",
      description: "Hands-on browser-based query challenges from basics to advanced subqueries.",
      description_bn: "ব্রাউজারেই সরাসরি এসকিউএল কুয়েরি এবং সাবকুয়েরি অনুশীলনের সহজ ও কার্যকর ইন্টারঅ্যাক্টিভ লেসন।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  python: [
    {
      skill_id: "python",
      title: "The Python Tutorial (Official Documentation)",
      provider: "Python Software Foundation",
      url: "https://docs.python.org/3/tutorial/",
      type: "Official Documentation",
      description: "Comprehensive guide to Python syntax, data structures, and modular standard libraries.",
      description_bn: "পাইথনের অফিসিয়াল ডকুমেন্টেশন: সিনট্যাক্স, ডেটা স্ট্রাকচার এবং মডুলার লাইব্রেরির পূর্ণাঙ্গ গাইড।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
    {
      skill_id: "python",
      title: "Python for Everybody (PY4E)",
      provider: "Dr. Charles Severance (Univ. of Michigan)",
      url: "https://www.py4e.com/",
      type: "Open Course",
      description: "Open educational course covering programming logic, data structures, and APIs.",
      description_bn: "প্রোগ্রামিং লজিক, ডেটা স্ট্রাকচার ও এপিআই ব্যবহারের ওপর মিশিগান বিশ্ববিদ্যালয়ের উন্মুক্ত ও জনপ্রিয় কোর্স।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  excel: [
    {
      skill_id: "excel",
      title: "Microsoft Excel Video Training",
      provider: "Microsoft Support",
      url: "https://support.microsoft.com/en-us/excel",
      type: "Video Training",
      description: "Official tutorials covering formulas, pivot tables, data visualization, and XLOOKUP.",
      description_bn: "মাইক্রোসফটের অফিসিয়াল ভিডিও ট্রেনিং: ফর্মুলা, পিভট টেবিল এবং ডেটা ভিজ্যুয়ালাইজেশন।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
    {
      skill_id: "excel",
      title: "Excel Easy: Step-by-Step Excel Guides",
      provider: "Excel Easy",
      url: "https://www.excel-easy.com/",
      type: "Tutorial",
      description: "Clear practical examples of data analysis formulas and spreadsheet organization.",
      description_bn: "স্প্রেডশিট ডেটা বিশ্লেষণ এবং আধুনিক ফর্মুলা ব্যবহারের সহজবোধ্য টিউটোরিয়াল।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  statistics: [
    {
      skill_id: "statistics",
      title: "Khan Academy: Statistics and Probability",
      provider: "Khan Academy",
      url: "https://www.khanacademy.org/math/statistics-probability",
      type: "Interactive Course",
      description: "Rigorous free lessons on distributions, variance, hypothesis testing, and regression modeling.",
      description_bn: "খান একাডেমি: সম্ভাবনা বিন্যাস, ভ্যারিয়েন্স, হাইপোথিসিস টেস্টিং ও রিগ্রেশনের ওপর উন্মুক্ত কোর্স।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
    {
      skill_id: "statistics",
      title: "OpenIntro Statistics (Free Open Textbook)",
      provider: "OpenIntro",
      url: "https://www.openintro.org/book/os/",
      type: "Open Textbook",
      description: "Widely adopted open textbook on foundational and inferential statistics for analysts.",
      description_bn: "ডেটা অ্যানালিস্টদের জন্য উন্মুক্ত ও আন্তর্জাতিকভাবে সমাদৃত স্ট্যাটিস্টিকস টেক্সটবুক।",
      lang: "en",
      isFree: true,
      difficulty: "Intermediate",
    },
  ],
  power_bi: [
    {
      skill_id: "power_bi",
      title: "Microsoft Power BI Guided Learning",
      provider: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/power-bi/guidance/",
      type: "Official Documentation",
      description: "Microsoft's authoritative curriculum on data modeling, DAX measures, and dashboard design.",
      description_bn: "মাইক্রোসফট লার্ন: পাওয়ার বিআই ডেটা মডেলিং, DAX ক্যালকুলেশন এবং বিজনেস ড্যাশবোর্ড তৈরির গাইড।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  git: [
    {
      skill_id: "git",
      title: "Pro Git Book (Official Free Edition)",
      provider: "Scott Chacon & Ben Straub",
      url: "https://git-scm.com/book/en/v2",
      type: "Book",
      description: "The complete, authoritative guide to Git architecture, branching, and remote collaboration.",
      description_bn: "অফিসিয়াল প্রো গিট বুক: ব্রাঞ্চিং, মার্জিং এবং রিমোট কোলাবোরেশনের বিশদ বিবরণ।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  rest_apis: [
    {
      skill_id: "rest_apis",
      title: "Mozilla MDN Web Docs: HTTP & REST",
      provider: "Mozilla MDN",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
      type: "Official Documentation",
      description: "Definitive documentation on HTTP verbs, headers, status codes, and API architecture.",
      description_bn: "এমডিএন ওয়েব ডক্স: এইচটিটিপি মেথডস, রিকোয়েস্ট-রেসপন্স সাইকেল ও রেস্ট এপিআই গাইড।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  html: [
    {
      skill_id: "html",
      title: "MDN Web Docs: HTML Foundations",
      provider: "Mozilla MDN",
      url: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
      type: "Interactive Documentation",
      description: "Semantic markup, accessible page structure, and modern HTML5 forms.",
      description_bn: "এমডিএন ওয়েব ডক্স: সিম্যান্টিক মার্কআপ, অ্যাক্সেসিবিলিটি এবং আধুনিক এইচটিএমএল৫।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  css: [
    {
      skill_id: "css",
      title: "MDN Web Docs: CSS Layouts & Responsive Design",
      provider: "Mozilla MDN",
      url: "https://developer.mozilla.org/en-US/docs/Learn/CSS",
      type: "Interactive Documentation",
      description: "CSS Grid, Flexbox, media queries, and responsive box modeling.",
      description_bn: "এমডিএন ওয়েব ডক্স: সিএসএস গ্রিড, ফ্লেক্সবক্স এবং মোবাইল রেসপনসিভ লেআউট গাইড।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  javascript: [
    {
      skill_id: "javascript",
      title: "The Modern JavaScript Tutorial",
      provider: "javascript.info",
      url: "https://javascript.info/",
      type: "Comprehensive Tutorial",
      description: "Deep, modern exploration from fundamentals to event loop, promises, and async/await.",
      description_bn: "মডার্ন জাভাস্ক্রিপ্ট টিউটোরিয়াল: ফান্ডামেন্টালস থেকে শুরু করে প্রমিজেস এবং ইভেন্ট লুপ।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  networking: [
    {
      skill_id: "networking",
      title: "Computer Networking Course",
      provider: "freeCodeCamp / Professor Messer",
      url: "https://www.freecodecamp.org/news/tag/networking/",
      type: "Course & Guide",
      description: "TCP/IP, subnetting, DNS, routing, and network troubleshooting fundamentals.",
      description_bn: "কম্পিউটার নেটওয়ার্কিং: টিসিপি/আইপি, সাবনেটিং, রাউটিং ও প্যাকেট বিশ্লেষণ।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  linux: [
    {
      skill_id: "linux",
      title: "Linux Journey: Grassroots Linux Learning",
      provider: "Linux Journey",
      url: "https://linuxjourney.com/",
      type: "Interactive Guide",
      description: "Command line essentials, permissions, process management, and bash fundamentals.",
      description_bn: "লিনাক্স জার্নি: কমান্ড লাইন, ফাইল পারমিশন এবং প্রসেস ম্যানেজমেন্টের ব্যবহারিক লেসন।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  security_fundamentals: [
    {
      skill_id: "security_fundamentals",
      title: "OWASP Top Ten Web Application Security Risks",
      provider: "OWASP Foundation",
      url: "https://owasp.org/www-project-top-ten/",
      type: "Security Standard",
      description: "The global consensus on the most critical security vulnerabilities and mitigations.",
      description_bn: "ওওয়াস্প টপ ১০: ওয়েব অ্যাপ্লিকেশনের শীর্ষ ঝুঁকি এবং সুরক্ষামূলক প্রতিরোধ ব্যবস্থা।",
      lang: "en",
      isFree: true,
      difficulty: "Intermediate",
    },
  ],
  log_analysis: [
    {
      skill_id: "log_analysis",
      title: "Splunk Security Essentials & Log Hunting",
      provider: "Splunk Education",
      url: "https://www.splunk.com/en_us/training.html",
      type: "Interactive Training",
      description: "Hands-on guide to spotting authentication anomalies and breach indicators in logs.",
      description_bn: "লগ অ্যানালাইসিস: সার্ভার লগ থেকে অস্বাভাবিক অ্যাক্টিভিটি ও আক্রমণ শনাক্তকরণ।",
      lang: "en",
      isFree: true,
      difficulty: "Intermediate",
    },
  ],
  figma: [
    {
      skill_id: "figma",
      title: "Figma Community Tutorials & Best Practices",
      provider: "Figma",
      url: "https://help.figma.com/hc/en-us/categories/360002051613-Learn-design",
      type: "Official Guides",
      description: "Auto-layout, interactive prototyping, component variants, and design systems.",
      description_bn: "ফিগমা অফিসিয়াল গাইড: অটো-লেআউট, ইন্টারঅ্যাক্টিভ প্রোটোটাইপিং ও ভ্যারিয়েন্টস।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  user_research: [
    {
      skill_id: "user_research",
      title: "Nielsen Norman Group: UX Research Methods",
      provider: "Nielsen Norman Group",
      url: "https://www.nngroup.com/articles/which-ux-research-methods/",
      type: "Authoritative Articles",
      description: "Evidence-based heuristics, usability testing protocols, and user interviews.",
      description_bn: "নিলসেন নরম্যান গ্রুপ: ইউজার ইন্টারভিউ এবং ইউজেবিলিটি টেস্টিং পদ্ধতি।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  visual_design: [
    {
      skill_id: "visual_design",
      title: "Refactoring UI: Practical UI Principles",
      provider: "Adam Wathan & Steve Schoger",
      url: "https://www.refactoringui.com/",
      type: "Design Guide",
      description: "Visual hierarchy, spacing systems, typography scaling, and color choices for developers.",
      description_bn: "ভিজ্যুয়াল ডিজাইন: টাইপোগ্রাফি স্কেল, ৮-পয়েন্ট গ্রিড ও কালার প্যালেট তৈরি।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  interaction_design: [
    {
      skill_id: "interaction_design",
      title: "Google Material Design: Motion & States",
      provider: "Google Design",
      url: "https://m3.material.io/",
      type: "Design System Guidelines",
      description: "Guidelines on micro-interactions, responsive states, feedback, and intuitive transitions.",
      description_bn: "ম্যাটেরিয়াল ডিজাইন: মাইক্রো-ইন্টারঅ্যাকশন, বাটন স্টেট ও অ্যানিমেশন প্রিন্সিপল।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
  design_systems: [
    {
      skill_id: "design_systems",
      title: "Atomic Design by Brad Frost",
      provider: "Brad Frost",
      url: "https://atomicdesign.bradfrost.com/",
      type: "Book",
      description: "Methodology for crafting scalable UI design systems with atoms, molecules, and organisms.",
      description_bn: "অ্যাটমিক ডিজাইন: পুনর্ব্যবহারযোগ্য কম্পোনেন্ট লাইব্রেরি ও ডিজাইন টোকেন ব্যবস্থাপনা।",
      lang: "en",
      isFree: true,
      difficulty: "Beginner",
    },
  ],
};

export function getResourcesForSkill(skillId: string): LearningResource[] {
  return VERIFIED_RESOURCES[skillId] || [];
}
