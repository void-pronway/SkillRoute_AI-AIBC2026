/**
 * SkillRoute AI - Curated Diagnostic Question Bank
 * Targeted, reproducible multiple-choice questions for benchmark skills.
 * Each question has an answer key and explanation for transparent grading.
 */

export interface DiagnosticQuestion {
  question_id: string;
  skill_id: string;
  skill_name: string;
  question: string;
  question_bn?: string;
  options: string[];
  options_bn?: string[];
  correct_option_index: number;
  explanation: string;
  explanation_bn?: string;
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // -------------------------------------------------------------
  // SQL
  // -------------------------------------------------------------
  {
    question_id: "sql_q1",
    skill_id: "sql",
    skill_name: "SQL",
    question: "Which SQL clause is used to filter records resulting from an aggregate function like SUM() or COUNT()?",
    question_bn: "SUM() বা COUNT() এর মতো অ্যাগ্রিগেট ফাংশন ব্যবহারের পর প্রাপ্ত রেকর্ড ফিল্টার করতে কোন এসকিউএল ক্লজ ব্যবহার করা হয়?",
    options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
    options_bn: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
    correct_option_index: 1,
    explanation: "HAVING is evaluated after aggregation to filter aggregated groups, whereas WHERE filters individual rows before grouping occurs.",
    explanation_bn: "HAVING ক্লজটি অ্যাগ্রিগেশনের পর প্রাপ্ত গ্রুপ ফিল্টার করতে ব্যবহৃত হয়, আর WHERE ক্লজ গ্রুপিংয়ের পূর্বেই একক সারি ফিল্টার করে।",
  },
  {
    question_id: "sql_q2",
    skill_id: "sql",
    skill_name: "SQL",
    question: "What is the expected result of a LEFT JOIN between Table A (left) and Table B (right)?",
    question_bn: "Table A (বাম) এবং Table B (ডান)-এর মধ্যে LEFT JOIN-এর ফলাফল কী হবে?",
    options: [
      "Only records that have matching keys in both Table A and Table B.",
      "All records from Table B, and only matching rows from Table A.",
      "All records from Table A, along with matched values from Table B (or NULL if no match).",
      "A cartesian product containing every possible pair of rows from both tables.",
    ],
    options_bn: [
      "শুধুমাত্র Table A ও Table B উভয়ের সাথে মিল থাকা রেকর্ডগুলো।",
      "Table B-এর সকল রেকর্ড এবং শুধুমাত্র Table A-এর সাথে মিল থাকা সারিগুলো।",
      "Table A-এর সমস্ত রেকর্ড এবং Table B থেকে সম্পর্কিত মান (মিল না থাকলে NULL)।",
      "উভয় টেবিলের প্রতিটি সম্ভাব্য সারির কার্তেসীয় গুণফল।",
    ],
    correct_option_index: 2,
    explanation: "A LEFT JOIN preserves every row from the left table and supplements them with corresponding columns from the right table, filling unmatched columns with NULL.",
    explanation_bn: "LEFT JOIN বাম টেবিলের প্রতিটি সারি সংরক্ষণ করে এবং ডান টেবিল থেকে সংশ্লিষ্ট কলাম যুক্ত করে, মিল না থাকলে NULL প্রদান করে।",
  },

  // -------------------------------------------------------------
  // Python
  // -------------------------------------------------------------
  {
    question_id: "py_q1",
    skill_id: "python",
    skill_name: "Python",
    question: "In Python, which of the following data structures is immutable?",
    question_bn: "পাইথনে নিচের কোন ডেটা স্ট্রাকচারটি অপরিবর্তনীয় (immutable)?",
    options: [
      "List (e.g., [1, 2, 3])",
      "Dictionary (e.g., {'a': 1})",
      "Tuple (e.g., (1, 2, 3))",
      "Set (e.g., {1, 2, 3})",
    ],
    options_bn: [
      "List (যেমন [1, 2, 3])",
      "Dictionary (যেমন {'a': 1})",
      "Tuple (যেমন (1, 2, 3))",
      "Set (যেমন {1, 2, 3})",
    ],
    correct_option_index: 2,
    explanation: "Tuples cannot be modified, resized, or assigned to after creation, making them immutable in Python.",
    explanation_bn: "টাপল তৈরির পর এতে কোনো পরিবর্তন, পরিবর্ধন বা পুনঃনির্ধারণ করা যায় না, তাই এটি অপরিবর্তনীয়।",
  },
  {
    question_id: "py_q2",
    skill_id: "python",
    skill_name: "Python",
    question: "What does the expression `[x * 2 for x in numbers if x % 2 == 0]` accomplish?",
    question_bn: "`[x * 2 for x in numbers if x % 2 == 0]` এক্সপ্রেশনটি কী সম্পাদন করে?",
    options: [
      "Creates a generator that squares all numbers in the list.",
      "Creates a list that doubles only the even numbers from `numbers`.",
      "Modifies the original `numbers` list in-place by doubling all items.",
      "Filters out all even numbers and returns odd numbers doubled.",
    ],
    options_bn: [
      "একটি জেনারেটর তৈরি করে যা তালিকার সব সংখ্যাকে বর্গ করে।",
      "`numbers` তালিকা থেকে শুধুমাত্র জোড় সংখ্যাগুলোকে দ্বিগুণ করে একটি নতুন তালিকা তৈরি করে।",
      "মূল তালিকাটি অপরিবর্তিত না রেখে সব সংখ্যা ইন-প্লেস দ্বিগুণ করে।",
      "জোড় সংখ্যাগুলো বাদ দিয়ে বিজোড় সংখ্যাগুলোকে দ্বিগুণ করে।",
    ],
    correct_option_index: 1,
    explanation: "This list comprehension applies the filter `if x % 2 == 0` (even numbers) and maps each match by multiplying it by 2.",
    explanation_bn: "এই লিস্ট কমপ্রিহেনশনটি `if x % 2 == 0` শর্ত প্রয়োগ করে জোড় সংখ্যা খুঁজে নেয় এবং সেগুলোকে ২ দ্বারা গুণ করে।",
  },

  // -------------------------------------------------------------
  // Excel / Spreadsheets
  // -------------------------------------------------------------
  {
    question_id: "excel_q1",
    skill_id: "excel",
    skill_name: "Microsoft Excel / Spreadsheets",
    question: "In an Excel formula, what does the dollar sign ($) in `$B$4` signify when copied across cells?",
    question_bn: "এক্সেলে ফর্মুলা কপি করার সময় `$B$4`-এ ডলার চিহ্ন ($) দ্বারা কী বোঝানো হয়?",
    options: [
      "It formats the cell value as currency in US Dollars.",
      "It creates an absolute reference that locks both column B and row 4.",
      "It locks column B while allowing row 4 to adjust relatively.",
      "It converts the cell reference into a dynamic array formula.",
    ],
    options_bn: [
      "এটি সেলের মানকে ইউএস ডলার কারেন্সিতে রূপান্তর করে।",
      "এটি একটি পরম রেফারেন্স তৈরি করে যা কলাম B এবং সারি ৪ উভয়কেই লক করে রাখে।",
      "এটি কলাম B লক রাখে তবে সারি ৪-কে আপেক্ষিকভাবে পরিবর্তিত হতে দেয়।",
      "এটি সেল রেফারেন্সটিকে ডায়নামিক অ্যারে ফর্মুলায় রূপান্তরিত করে।",
    ],
    correct_option_index: 1,
    explanation: "The dollar sign indicates an absolute reference; `$B$4` keeps both the column and row fixed when dragged or copied to other cells.",
    explanation_bn: "ডলার চিহ্ন পরম রেফারেন্স নির্দেশ করে; `$B$4` সেল অন্য ঘরে কপি করলেও কলাম ও রো স্থির রাখে।",
  },
  {
    question_id: "excel_q2",
    skill_id: "excel",
    skill_name: "Microsoft Excel / Spreadsheets",
    question: "What is a key architectural advantage of XLOOKUP over traditional VLOOKUP?",
    question_bn: "চিরাচরিত VLOOKUP-এর তুলনায় আধুনিক XLOOKUP-এর প্রধান সুবিধা কী?",
    options: [
      "XLOOKUP only works if the lookup column is sorted in ascending order.",
      "XLOOKUP can search to the left of the lookup column and defaults to exact match.",
      "XLOOKUP is restricted to returning single numeric values only.",
      "XLOOKUP requires a separate helper index column.",
    ],
    options_bn: [
      "XLOOKUP কেবল তখনই কাজ করে যদি কলামটি ঊর্ধ্বক্রমে সাজানো থাকে।",
      "XLOOKUP লুকআপ কলামের বাম দিকেও অনুসন্ধান করতে পারে এবং স্বয়ংক্রিয়ভাবে এক্সাক্ট ম্যাচ নিশ্চিত করে।",
      "XLOOKUP শুধুমাত্র একক সংখ্যাবাচক মান ফেরত দিতে সীমাবদ্ধ।",
      "XLOOKUP ব্যবহারের জন্য অতিরিক্ত সহায়ক ইনডেক্স কলামের প্রয়োজন হয়।",
    ],
    correct_option_index: 1,
    explanation: "XLOOKUP does not require the return column to be to the right of the lookup column, defaults safely to exact match, and handles errors cleanly.",
    explanation_bn: "XLOOKUP-এর ক্ষেত্রে রিটার্ন কলামকে ডানে থাকার বাধ্যবাধকতা নেই এবং এটি সরাসরি নিখুঁত মিল শনাক্ত করতে পারে।",
  },

  // -------------------------------------------------------------
  // JavaScript
  // -------------------------------------------------------------
  {
    question_id: "js_q1",
    skill_id: "javascript",
    skill_name: "JavaScript",
    question: "What is the output order of `console.log('A')`, `setTimeout(() => console.log('B'), 0)`, and `Promise.resolve().then(() => console.log('C'))`?",
    question_bn: "`console.log('A')`, `setTimeout(() => console.log('B'), 0)` এবং `Promise.resolve().then(() => console.log('C'))`-এর আউটপুট ক্রম কী?",
    options: ["A, B, C", "A, C, B", "B, C, A", "C, A, B"],
    options_bn: ["A, B, C", "A, C, B", "B, C, A", "C, A, B"],
    correct_option_index: 1,
    explanation: "Synchronous code ('A') executes first. Then the microtask queue ('C') executes before the macrotask / timer queue ('B'). Output order is A, C, B.",
    explanation_bn: "সিঙ্ক্রোনাস কোড ('A') প্রথমে চলে। এরপর ম্যাক্রোটাস্কের ('B') আগে মাইক্রোটাস্ক কিউ ('C') সম্পন্ন হয়। তাই আউটপুট A, C, B।",
  },
  {
    question_id: "js_q2",
    skill_id: "javascript",
    skill_name: "JavaScript",
    question: "What distinguishes `const` from `let` in modern ECMAScript?",
    question_bn: "আধুনিক জাভাস্ক্রিপ্টে `const` এবং `let`-এর মধ্যে প্রধান পার্থক্য কী?",
    options: [
      "Variables declared with `const` cannot have their internal object properties mutated.",
      "`const` creates a block-scoped variable whose identifier binding cannot be reassigned.",
      "`const` is hoisted to the global scope, while `let` is function-scoped.",
      "`let` cannot be used inside loops, whereas `const` can.",
    ],
    options_bn: [
      "`const` দিয়ে ঘোষিত ভেরিয়েবলের ভেতরের প্রপার্টি মিউটেট করা যায় না।",
      "`const` একটি ব্লক-স্কোপড ভেরিয়েবল তৈরি করে যার আইডেন্টিফায়ার বাঁধন পুনরায় অ্যাসাইন করা যায় না।",
      "`const` গ্লোবাল স্কোপে হোস্ট হয়, আর `let` শুধুমাত্র ফাংশন স্কোপে কাজ করে।",
      "`let` লুপের ভেতর ব্যবহার করা যায় না, কিন্তু `const` ব্যবহার করা যায়।",
    ],
    correct_option_index: 1,
    explanation: "`const` prevents reassignment of the variable binding, though properties of objects declared with `const` can still be modified.",
    explanation_bn: "`const` ভেরিয়েবলের রেফারেন্স রি-অ্যাসাইন হওয়া রোধ করে, যদিও অবজেক্টের অভ্যন্তরীণ প্রোপার্টি পরিবর্তন করা যায়।",
  },

  // -------------------------------------------------------------
  // Git
  // -------------------------------------------------------------
  {
    question_id: "git_q1",
    skill_id: "git",
    skill_name: "Git & Version Control",
    question: "What does the command `git checkout -b feature-route` perform?",
    question_bn: "`git checkout -b feature-route` কমান্ডটি কী কাজ করে?",
    options: [
      "Deletes the branch named `feature-route`.",
      "Creates a new branch named `feature-route` and switches your working directory to it.",
      "Reverts all uncommitted changes on the `feature-route` branch.",
      "Pushes local commits to the remote repository under branch `feature-route`.",
    ],
    options_bn: [
      "`feature-route` নামের ব্রাঞ্চটি মুছে ফেলে।",
      "`feature-route` নামে নতুন ব্রাঞ্চ তৈরি করে এবং সরাসরি সেই ব্রাঞ্চে সুইচ করে।",
      "`feature-route` ব্রাঞ্চের সকল অসংরক্ষিত পরিবর্তন পূর্বাবস্থায় ফিরিয়ে নেয়।",
      "রিমোট রিপোজিটরিতে `feature-route` ব্রাঞ্চটি পুশ করে।",
    ],
    correct_option_index: 1,
    explanation: "The `-b` flag instructs git to create the branch if it doesn't exist, and `checkout` immediately switches your active HEAD to that branch.",
    explanation_bn: "এখানে `-b` ফ্ল্যাগ নতুন ব্রাঞ্চ তৈরি করে এবং `checkout` সঙ্গে সঙ্গে নতুন ব্রাঞ্চে কাজের পরিবেশ নিয়ে যায়।",
  },
  {
    question_id: "git_q2",
    skill_id: "git",
    skill_name: "Git & Version Control",
    question: "What is the primary role of the Git 'staging area' (index)?",
    question_bn: "গিট-এর 'স্টেজিং এরিয়া' (ইনডেক্স)-এর মূল উদ্দেশ্য কী?",
    options: [
      "It permanently stores discarded commits for garbage collection.",
      "It acts as an intermediate holding zone where specific file changes are formatted for the next commit.",
      "It mirrors remote branches before network synchronization.",
      "It automatically runs production unit tests before allowing pushes.",
    ],
    options_bn: [
      "এটি স্থায়ীভাবে বাতিল করা কমিট জমা রাখে।",
      "এটি একটি মধ্যবর্তী জোন যেখানে পরবর্তী কমিটের জন্য সুনির্দিষ্ট ফাইলের পরিবর্তনগুলো বাছাই করে সাজানো হয়।",
      "এটি নেটওয়ার্ক সিঙ্কের আগে রিমোট ব্রাঞ্চের অনুলিপি ধারণ করে।",
      "এটি কোড পুশ করার আগে স্বয়ংক্রিয়ভাবে ইউনিট টেস্ট চালায়।",
    ],
    correct_option_index: 1,
    explanation: "The staging area allows developers to assemble precise, purposeful commits by choosing exactly which modified files or hunks to include.",
    explanation_bn: "স্টেজিং এরিয়া ডেভেলপারকে পছন্দসই ফাইলগুলো সুনির্দিষ্টভাবে সাজিয়ে পরিচ্ছন্ন কমিট তৈরিতে সাহায্য করে।",
  },

  // -------------------------------------------------------------
  // HTML / CSS
  // -------------------------------------------------------------
  {
    question_id: "html_q1",
    skill_id: "html",
    skill_name: "HTML",
    question: "Which HTML5 semantic element is most appropriate for independent, self-contained syndicatable content?",
    question_bn: "স্বতন্ত্র এবং পুনর্ব্যবহারযোগ্য কনটেন্টের জন্য কোন HTML5 সিম্যান্টিক এলিমেন্টটি সবচেয়ে উপযুক্ত?",
    options: ["<section>", "<article>", "<aside>", "<div>"],
    options_bn: ["<section>", "<article>", "<aside>", "<div>"],
    correct_option_index: 1,
    explanation: "<article> represents a self-contained composition in a document, page, application, or site that is independently distributable or reusable.",
    explanation_bn: "<article> এলিমেন্টটি সম্পূর্ণ স্বয়ংসম্পূর্ণ কনটেন্ট প্রকাশে ব্যবহৃত হয় যা আলাদাভাবে অন্যত্র বিতরণযোগ্য।",
  },
  {
    question_id: "css_q1",
    skill_id: "css",
    skill_name: "CSS",
    question: "In CSS Flexbox, which property aligns items along the cross axis?",
    question_bn: "CSS ফ্লেক্সবক্সে ক্রস অ্যাক্সিস (cross axis) বরাবর উপাদান বিন্যস্ত করতে কোন প্রোপার্টি ব্যবহৃত হয়?",
    options: ["justify-content", "align-items", "flex-direction", "flex-wrap"],
    options_bn: ["justify-content", "align-items", "flex-direction", "flex-wrap"],
    correct_option_index: 1,
    explanation: "justify-content aligns items along the main axis, while align-items controls alignment along the cross axis.",
    explanation_bn: "justify-content মেইন অ্যাক্সিস বরাবর সারিবদ্ধ করে, আর align-items ক্রস অ্যাক্সিস বরাবর উপাদান নিয়ন্ত্রণ করে।",
  },

  // -------------------------------------------------------------
  // Networking & Linux
  // -------------------------------------------------------------
  {
    question_id: "net_q1",
    skill_id: "networking",
    skill_name: "Computer Networking",
    question: "At which layer of the OSI model does the TCP protocol operate?",
    question_bn: "OSI মডেলের কোন স্তরে TCP প্রোটোকল পরিচালিত হয়?",
    options: ["Network Layer (Layer 3)", "Transport Layer (Layer 4)", "Data Link Layer (Layer 2)", "Application Layer (Layer 7)"],
    options_bn: ["নেটওয়ার্ক স্তর (Layer 3)", "ট্রান্সপোর্ট স্তর (Layer 4)", "ডেটা লিংক স্তর (Layer 2)", "অ্যাপ্লিকেশন স্তর (Layer 7)"],
    correct_option_index: 1,
    explanation: "TCP is a core Layer 4 (Transport Layer) connection-oriented protocol providing reliable, ordered delivery.",
    explanation_bn: "টিসিপি হলো লেয়ার ৪ (ট্রান্সপোর্ট লেয়ার)-এর কানেকশন-ওরিয়েন্টেড প্রোটোকল যা নির্ভরযোগ্য ডেটা ডেলিভারি নিশ্চিত করে।",
  },
  {
    question_id: "linux_q1",
    skill_id: "linux",
    skill_name: "Linux / OS",
    question: "What permission set does the numeric octal mode `755` represent in Linux?",
    question_bn: "লিনাক্সে `755` নিউমেরিক অক্টাল মোড কী নির্দেশ করে?",
    options: [
      "Owner: rwx, Group: r-x, Others: r-x",
      "Owner: rwx, Group: rwx, Others: rwx",
      "Owner: rw-, Group: r--, Others: r--",
      "Owner: r-x, Group: r-x, Others: ---",
    ],
    options_bn: [
      "মালিক: rwx, গ্রুপ: r-x, অন্যান্য: r-x",
      "মালিক: rwx, গ্রুপ: rwx, অন্যান্য: rwx",
      "মালিক: rw-, গ্রুপ: r--, অন্যান্য: r--",
      "মালিক: r-x, গ্রুপ: r-x, অন্যান্য: ---",
    ],
    correct_option_index: 0,
    explanation: "7 (rwx = 4+2+1), 5 (r-x = 4+0+1), 5 (r-x = 4+0+1). Owner has full access, group and others can read and execute.",
    explanation_bn: "৭ (rwx = ৪+২+১), ৫ (r-x = ৪+০+১), ৫ (r-x = ৪+০+১)। মালিকের পূর্ণ অধিকার থাকে এবং বাকিরা পড়তে ও চালাতে পারে।",
  },
];
