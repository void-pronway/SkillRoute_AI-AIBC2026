/**
 * SkillRoute AI 2.0 - Database Seeding Script
 * Populates persistent database with roles, benchmark personas, challenges, and jobs.
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SkillRoute AI 2.0 Database...");

  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // 1. Seed Student Persona (Benchmark A Initial Profile)
  const student = await prisma.user.upsert({
    where: { email: "student@skillroute.ai" },
    update: {
      name: "Pronway Prosoon Mitra",
      passwordHash: defaultPasswordHash,
    },
    create: {
      email: "student@skillroute.ai",
      passwordHash: defaultPasswordHash,
      name: "Pronway Prosoon Mitra",
      role: "STUDENT",
      bio: "Undergraduate Computer Science student at Daffodil International University aspiring to be an Analytics Engineer.",
      isVerified: true,
      studentProfile: {
        create: {
          university: "Daffodil International University",
          department: "Computer Science and Engineering",
          graduationYear: 2026,
          educationStatus: "Undergraduate",
          careerGoal: "junior_data_analyst",
          weeklyStudyHours: 8,
          skillsJson: JSON.stringify({
            python: 3,
            sql: 2,
            excel: 3,
            statistics: 0,
            power_bi: 0,
          }),
          assessedSkillsJson: JSON.stringify({
            sql: { levelAssessed: 2, answers: { sql_q1: 1, sql_q2: 2 }, evaluated: true },
            python: { levelAssessed: 3, answers: { py_q1: 2, py_q2: 1 }, evaluated: true },
          }),
        },
      },
    },
    include: { studentProfile: true },
  });
  console.log(`✓ Seeded Student: ${student.email}`);

  // 1b. Seed Second Student Persona (Mashfiqur Rahman)
  const student1PasswordHash = await bcrypt.hash("Test123", 10);
  const student1 = await prisma.user.upsert({
    where: { email: "student1@skillroute.ai" },
    update: {
      passwordHash: student1PasswordHash,
    },
    create: {
      email: "student1@skillroute.ai",
      passwordHash: student1PasswordHash,
      name: "Mashfiqur Rahman",
      role: "STUDENT",
      bio: "Undergraduate Computer Science & Engineering student at Daffodil International University focusing on Backend Engineering and Distributed Systems.",
      isVerified: true,
      studentProfile: {
        create: {
          university: "Daffodil International University",
          department: "Computer Science and Engineering",
          graduationYear: 2026,
          educationStatus: "Undergraduate",
          careerGoal: "junior_backend_developer",
          weeklyStudyHours: 12,
          skillsJson: JSON.stringify({
            python: 3,
            sql: 3,
            rest_apis: 2,
            html: 2,
            javascript: 2,
          }),
          assessedSkillsJson: JSON.stringify({
            sql: { levelAssessed: 3, evaluated: true },
            rest_apis: { levelAssessed: 2, evaluated: true },
          }),
        },
      },
    },
    include: { studentProfile: true },
  });
  console.log(`✓ Seeded Second Student: ${student1.email}`);

  // 2. Seed Employer Organization & Owner
  const employer = await prisma.user.upsert({
    where: { email: "employer@technext.bd" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "employer@technext.bd",
      passwordHash: defaultPasswordHash,
      name: "Nayeem Chowdhury",
      role: "EMPLOYER_OWNER",
      bio: "Engineering Director at TechNext Ltd.",
      isVerified: true,
    },
  });

  const org = await prisma.employerOrganization.upsert({
    where: { id: "org_technext" },
    update: {},
    create: {
      id: "org_technext",
      name: "TechNext Ltd.",
      industry: "Software & Financial Technology",
      size: "51-200",
      website: "https://technext.bd",
      description: "Leading enterprise technology consultancy delivering fintech and cloud data platforms across South Asia.",
      isVerified: true,
      members: {
        create: {
          userId: employer.id,
          role: "OWNER",
        },
      },
    },
  });
  console.log(`✓ Seeded Employer & Org: ${org.name}`);

  // 3. Seed Recruiter
  const recruiter = await prisma.user.upsert({
    where: { email: "recruiter@technext.bd" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "recruiter@technext.bd",
      passwordHash: defaultPasswordHash,
      name: "Sabrina Karim",
      role: "EMPLOYER_RECRUITER",
      bio: "Technical Talent Acquisition Partner",
      isVerified: true,
      orgMemberships: {
        create: {
          organizationId: org.id,
          role: "RECRUITER",
        },
      },
    },
  });
  console.log(`✓ Seeded Recruiter: ${recruiter.email}`);

  // 4. Seed Reviewer & Admin
  const reviewer = await prisma.user.upsert({
    where: { email: "reviewer@skillroute.ai" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "reviewer@skillroute.ai",
      passwordHash: defaultPasswordHash,
      name: "Dr. Anisur Rahman",
      role: "ASSESSMENT_REVIEWER",
      bio: "Senior Technical Evaluator & Adjunct Faculty",
      isVerified: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@skillroute.ai" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "admin@skillroute.ai",
      passwordHash: defaultPasswordHash,
      name: "Antigravity System Admin",
      role: "PLATFORM_ADMIN",
      bio: "SkillRoute AI Platform Administrator",
      isVerified: true,
    },
  });
  console.log(`✓ Seeded Reviewer & Admin: ${admin.email}`);

  // 5. Seed Challenges
  const challenges = [
    {
      id: "mission_sql_regional_sales",
      title: "Regional Sales Performance & High-Value Revenue Analysis",
      titleBn: "আঞ্চলিক বিক্রয় ও উচ্চ-মূল্যের রাজস্ব বিশ্লেষণ (SQL)",
      category: "data",
      careerTrackId: "junior_data_analyst",
      difficulty: "Intermediate",
      estimatedMinutes: 30,
      passingScore: 75,
      scenario: "Apex Retail operates across four regions in Bangladesh (Dhaka, Chittagong, Sylhet, Rajshahi). Executive leadership wants to identify the highest-performing regions based on completed customer orders and isolate customer segments generating above $5,000 in total sales.",
      scenarioBn: "অ্যাপেক্স রিটেইল বাংলাদেশের চারটি অঞ্চলে পরিচালিত হয়। ম্যানেজমেন্ট জানতে চায় কোন অঞ্চলের বিক্রয় সর্বাধিক এবং কোন অঞ্চলগুলো ৫,০০০ ডলারের বেশি রাজস্ব তৈরি করেছে।",
      instructions: "Join orders, customers, and regions. Filter for completed orders. Compute total revenue and order count by region. Use HAVING > 5000 and sort descending.",
      initialCode: "SELECT r.region_name, COUNT(o.order_id) AS order_count, SUM(o.order_amount) AS total_revenue\nFROM regions r\n-- Complete joins here\nORDER BY total_revenue DESC;",
      rubricJson: JSON.stringify([
        { id: "r1", criterion: "Relational JOIN logic", points: 30 },
        { id: "r2", criterion: "Order status filter", points: 20 },
        { id: "r3", criterion: "Aggregation and Grouping", points: 25 },
        { id: "r4", criterion: "HAVING threshold and sorting", points: 25 },
      ]),
    },
    {
      id: "mission_backend_api_repair",
      title: "Secure REST API Endpoint Repair & Payload Validation",
      titleBn: "নিরাপদ REST API এন্ডপয়েন্ট মেরামত ও পেলোড ভ্যালিডেশন",
      category: "backend",
      careerTrackId: "junior_backend_developer",
      difficulty: "Intermediate",
      estimatedMinutes: 35,
      passingScore: 75,
      scenario: "Repair user profile update API suffering from SQL injection vulnerability and absent input bounds validation.",
      instructions: "Validate name string length and weeklyAvailability (1-40). Replace string concat with parameterized bindings. Return HTTP 400 for errors and 200 for success.",
      initialCode: "export async function handleUpdateProfile(req, db) {\n  const { userId, name, weeklyAvailability } = req.body;\n  // Add validation & parameterized query\n}",
      rubricJson: JSON.stringify([
        { id: "r1", criterion: "Input validation", points: 30 },
        { id: "r2", criterion: "SQL injection mitigation", points: 35 },
        { id: "r3", criterion: "HTTP status codes", points: 20 },
        { id: "r4", criterion: "Structured JSON response", points: 15 },
      ]),
    },
    {
      id: "mission_frontend_component_a11y",
      title: "Responsive Accessible Skill Card & Interaction State",
      titleBn: "রেসপনসিভ অ্যাক্সেসিবল স্কিল কার্ড ও ইন্টারঅ্যাকশন স্টেট",
      category: "frontend",
      careerTrackId: "junior_frontend_developer",
      difficulty: "Intermediate",
      estimatedMinutes: 25,
      passingScore: 75,
      scenario: "Build a responsive accessible skill proficiency card meeting WCAG 2.2 AA standards with ARIA slider attributes.",
      instructions: "Use semantic HTML, include role=\"slider\" and aria values, support keyboard arrow keys, ensure visible focus indicator.",
      initialCode: "<div class=\"skill-card\" role=\"region\">\n  <h3>SQL</h3>\n  <!-- Add accessible slider -->\n</div>",
      rubricJson: JSON.stringify([
        { id: "r1", criterion: "Semantic HTML structure", points: 25 },
        { id: "r2", criterion: "WCAG 2.2 AA ARIA slider", points: 30 },
        { id: "r3", criterion: "Keyboard interaction", points: 25 },
        { id: "r4", criterion: "Responsive mobile styling", points: 20 },
      ]),
    },
    {
      id: "mission_soc_incident_response",
      title: "SOC Telemetry Investigation: Brute-Force & Compromise Detection",
      titleBn: "এসওসি টেলিম্যাট্রি তদন্ত: ব্রুট-ফোর্স ও অনুপ্রবেশ শনাক্তকরণ",
      category: "security",
      careerTrackId: "junior_cybersecurity_analyst",
      difficulty: "Intermediate",
      estimatedMinutes: 30,
      passingScore: 75,
      scenario: "Investigate authentication logs for SSH brute-force breach attempt on university server host.",
      instructions: "Identify malicious source IP, breached user account, suspicious curl download command, and list defensive remediations.",
      initialCode: "{\n  \"attacker_ip\": \"\",\n  \"compromised_account\": \"\",\n  \"suspicious_command\": \"\",\n  \"remediation_actions\": []\n}",
      rubricJson: JSON.stringify([
        { id: "r1", criterion: "Attacker IP identification", points: 25 },
        { id: "r2", criterion: "Compromised account detection", points: 25 },
        { id: "r3", criterion: "Suspicious command telemetry", points: 25 },
        { id: "r4", criterion: "Defensive remediation", points: 25 },
      ]),
    },
    {
      id: "mission_ux_checkout_audit",
      title: "E-Commerce Onboarding & Checkout Usability Audit",
      titleBn: "ইউআই/ইউএক্স অনবোর্ডিং ও চেকআউট ইউজেবিলিটি অডিট",
      category: "design",
      careerTrackId: "junior_ui_ux_designer",
      difficulty: "Intermediate",
      estimatedMinutes: 25,
      passingScore: 75,
      scenario: "Evaluate campus textbook portal suffering high cart abandonment rate using Nielsen Norman heuristics.",
      instructions: "Map 4 heuristic violations, analyze accessibility contrast shortcomings, and recommend wireframe restructuring.",
      initialCode: "{\n  \"heuristic_violations\": [],\n  \"accessibility_critique\": \"\",\n  \"proposed_wireframe_structure\": \"\"\n}",
      rubricJson: JSON.stringify([
        { id: "r1", criterion: "Heuristic evaluation mapping", points: 30 },
        { id: "r2", criterion: "WCAG color contrast critique", points: 25 },
        { id: "r3", criterion: "Wireframe recommendations", points: 25 },
        { id: "r4", criterion: "User empathy and rationale", points: 20 },
      ]),
    },
  ];

  for (const c of challenges) {
    await prisma.challenge.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log(`✓ Seeded ${challenges.length} Practical Missions in Mission Arena`);

  // 6. Seed Job Vacancies for TechNext Ltd.
  const jobDa = await prisma.job.upsert({
    where: { id: "job_technext_data_analyst" },
    update: {},
    create: {
      id: "job_technext_data_analyst",
      organizationId: org.id,
      title: "Associate Analytics Engineer / Junior Data Analyst",
      description: "Join TechNext's Data & Insights Practice. We are seeking early-career talent with demonstrable competency in SQL querying, statistical data modeling, and reporting dashboard assembly.",
      careerCategory: "data",
      careerTrackId: "junior_data_analyst",
      location: "Dhaka, Bangladesh (Hybrid)",
      employmentType: "Full-time",
      salaryRange: "BDT 45,000 - 65,000 / month",
      status: "OPEN",
      requirements: {
        create: [
          { skillId: "sql", targetLevel: 3, weight: 3, isRequired: true },
          { skillId: "python", targetLevel: 3, weight: 3, isRequired: true },
          { skillId: "excel", targetLevel: 2, weight: 2, isRequired: true },
          { skillId: "statistics", targetLevel: 3, weight: 2, isRequired: false },
        ],
      },
    },
  });

  const jobBe = await prisma.job.upsert({
    where: { id: "job_technext_backend" },
    update: {},
    create: {
      id: "job_technext_backend",
      organizationId: org.id,
      title: "Junior Backend Platform Engineer",
      description: "Build robust API endpoints, implement schema migrations, and write clean, tested Python application logic.",
      careerCategory: "software",
      careerTrackId: "junior_backend_developer",
      location: "Dhaka, Bangladesh (On-site)",
      employmentType: "Full-time",
      salaryRange: "BDT 50,000 - 75,000 / month",
      status: "OPEN",
      requirements: {
        create: [
          { skillId: "python", targetLevel: 4, weight: 3, isRequired: true },
          { skillId: "sql", targetLevel: 3, weight: 3, isRequired: true },
          { skillId: "rest_apis", targetLevel: 3, weight: 3, isRequired: true },
          { skillId: "git", targetLevel: 2, weight: 1, isRequired: true },
        ],
      },
    },
  });
  console.log(`✓ Seeded Jobs: ${jobDa.title}, ${jobBe.title}`);

  // 7. Seed Sample Verified Credential for Student
  await prisma.credential.upsert({
    where: { credentialId: "SKILL-2026-SQL-9831" },
    update: {},
    create: {
      credentialId: "SKILL-2026-SQL-9831",
      userId: student.id,
      skillId: "sql",
      competencyTitle: "Relational Querying & Aggregation Mastery",
      assessmentType: "PRACTICALLY_DEMONSTRATED",
      score: 95.0,
      verificationUrl: "/verify/SKILL-2026-SQL-9831",
      status: "ACTIVE",
    },
  });
  console.log(`✓ Seeded Verified Credential: SKILL-2026-SQL-9831`);

  // 8. Seed Public Portfolio Profile
  await prisma.publicSkillProofProfile.upsert({
    where: { publicId: "student-demo-2026" },
    update: {},
    create: {
      publicId: "student-demo-2026",
      userId: student.id,
      targetCareerId: "junior_data_analyst",
      consentedFields: JSON.stringify(["name", "university", "careerGoal", "verifiedSkills", "assessmentResults"]),
      isPublic: true,
    },
  });
  console.log(`✓ Seeded Public SkillProof Profile: /portfolio/student-demo-2026`);

  console.log("\n✅ Database Seeding Successfully Completed!");
}

main()
  .catch((e) => {
    console.error("Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
