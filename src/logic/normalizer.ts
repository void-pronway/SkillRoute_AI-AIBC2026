/**
 * SkillRoute AI - Skill Normalizer
 * Standardizes free-text or alias inputs into catalog skill IDs without silent discards.
 */

const SKILL_ALIASES: Record<string, string[]> = {
  python: ["python", "python3", "python 3", "py", "python programming"],
  sql: ["sql", "mysql", "postgresql", "postgres", "sqlite", "relational sql"],
  excel: ["excel", "ms excel", "microsoft excel", "spreadsheets", "sheets"],
  statistics: ["statistics", "stats", "probability and statistics", "probability", "statistical analysis"],
  power_bi: ["power bi", "powerbi", "power_bi", "bi tools", "business intelligence"],
  rest_apis: ["rest apis", "rest api", "apis", "api", "restful", "restful apis", "web apis"],
  git: ["git", "github", "version control", "vcs", "gitlab"],
  html: ["html", "html5", "semantic html"],
  css: ["css", "css3", "styling"],
  javascript: ["javascript", "js", "ecmascript", "es6", "vanilla js"],
  networking: ["networking", "network", "tcp/ip", "computer networking", "dns"],
  linux: ["linux", "linux/os", "ubuntu", "bash", "shell scripting", "unix"],
  security_fundamentals: ["security fundamentals", "security", "cybersecurity", "infosec", "information security"],
  log_analysis: ["log analysis", "siem", "splunk", "system logs", "event logs"],
  figma: ["figma", "figma tool", "prototyping", "wireframing", "figma design"],
  user_research: ["user research", "ux research", "usability testing", "user testing"],
  visual_design: ["visual design", "ui design", "typography and layout", "color theory"],
  interaction_design: ["interaction design", "ixd", "micro-interactions", "ui animation"],
  design_systems: ["design systems", "design system", "component libraries", "atomic design"],
};

// Build inverted lookup map
const ALIAS_MAP = new Map<string, string>();
for (const [canonicalId, aliases] of Object.entries(SKILL_ALIASES)) {
  for (const alias of aliases) {
    ALIAS_MAP.set(alias.toLowerCase().trim(), canonicalId);
  }
}

export function normalizeSkill(rawInput = ""): {
  canonicalId: string | null;
  raw: string;
  recognized: boolean;
} {
  const cleaned = String(rawInput).toLowerCase().trim();
  if (!cleaned) {
    return { canonicalId: null, raw: rawInput, recognized: false };
  }

  const canonicalId = ALIAS_MAP.get(cleaned) || null;
  return {
    canonicalId,
    raw: rawInput,
    recognized: canonicalId !== null,
  };
}

export function normalizeSkillProfile(rawLevels: Record<string, any> = {}): {
  normalizedLevels: Record<string, number>;
  unrecognizedSkills: string[];
} {
  const normalizedLevels: Record<string, number> = {};
  const unrecognizedSkills: string[] = [];

  for (const [key, value] of Object.entries(rawLevels)) {
    const { canonicalId, raw, recognized } = normalizeSkill(key);
    const numericLevel = Math.max(0, Math.min(5, Number(value) || 0));

    if (recognized && canonicalId) {
      normalizedLevels[canonicalId] = Math.max(normalizedLevels[canonicalId] ?? 0, numericLevel);
    } else {
      unrecognizedSkills.push(raw);
    }
  }

  return { normalizedLevels, unrecognizedSkills };
}
