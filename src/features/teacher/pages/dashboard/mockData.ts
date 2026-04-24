export const dashboardData = {
  // Stats for the very top of the Dashboard
 topStats: [
    // { label: 'Total Students', value: 147, sub: 'Across 6 sections', color: 'text-gray-600' },
    // { label: 'Subjects Taught', value: 3, sub: 'Maths • Science • EVS', color: 'text-cyan-600' },
    // { label: 'Syllabus On-track', value: '83%', sub: 'Avg across subjects', color: 'text-orange-400' },
    // { label: 'At-Risk Students', value: 24, sub: 'Needs action', color: 'text-red-400' },
    // { label: 'Mock Engagement', value: '88%', sub: 'Above school avg', color: 'text-green-600' },
  ],

  // Image 1: Overview
  overview: {
    mathematics: [
      // { section: 'Class 8-A', students: 28, avg: 78, benchmark: 85, status: 'On Track' },
      // { section: 'Class 8-B', students: 26, avg: 71, benchmark: 79, status: 'Watch' },
      // { section: 'Class 10-A', students: 32, avg: 74, benchmark: 81, status: 'On Track' },
      // { section: 'Class 10-B', students: 29, avg: 63, benchmark: 71, status: 'Action' },
    ],
    science: [
      // { section: 'Class 8-A', students: 28, avg: 78, benchmark: 85, status: 'On Track' },
      // { section: 'Class 8-B', students: 26, avg: 71, benchmark: 79, status: 'Watch' },
      // { section: 'Class 9-A', students: 32, avg: 74, benchmark: 81, status: 'On Track' },
      // { section: 'Class 9-B', students: 29, avg: 63, benchmark: 71, status: 'Action' },
    ],
    // ADD THIS NEW EVS DATA HERE:
    evs: [
      // { 
      //   section: 'Class 8-A', 
      //   students: 28, 
      //   avg: 80, 
      //   benchmark: 86, 
      //   status: 'Watch',
      //   syllabus: 95,
      //   mock: 88,
      //   recommendation: 'Strong coverage - extension mock recommended for Class 8-A'
      // }
    ]
  },

  // Image 2: Syllabus
  syllabus: [
    // { label: 'Commercial Mathematics', value: 82, color: 'bg-orange-400' },
    // { label: 'Algebra (Quadratic Eq.)', value: 76, color: 'bg-orange-400' },
    // { label: 'Geometry (Circle Theorems)', value: 58, color: 'bg-red-400' },
    // { label: 'Trigonometry (Ext.)', value: 44, color: 'bg-red-500' },
    // { label: 'Mensuration (3D Solids)', value: 70, color: 'bg-orange-400' },
    // { label: 'Statistics & Probability', value: 80, color: 'bg-green-500' },
    // { label: 'Co-ordinate Geometry', value: 65, color: 'bg-orange-400' },
    // { label: 'Matrices', value: 72, color: 'bg-orange-400' },
    
  ],

  // Image 3: Mock Exams
  mockExams: [
    // { class: 'Class 10-A', score: 82, trend: '+1%', bench: 81, color: 'text-green-600', points: [58, 66, 72, 78, 82] },
    // { class: 'Class 10-B', score: 72, trend: '-3%', bench: 71, color: 'text-orange-400', points: [50, 56, 60, 64, 68] },
    // { class: 'Class 8-A', score: 79, trend: '+3%', bench: 76, color: 'text-green-600', points: [58, 66, 72, 78, 79] },
    // { class: 'Class 8-B', score: 72, trend: '-4%', bench: 76, color: 'text-orange-400', points: [58, 64, 72, 78, 72] },
  ],
  chapterAccuracy: [
    // { name: 'Trigonometry', scores: [{ label: '10-A', val: 44 }, { label: '10-B', val: 38 }] },
    // { name: 'Circle Theorems', scores: [{ label: '10-A', val: 58 }, { label: '10-B', val: 50 }] },
    // { name: 'Mensuration', scores: [{ label: '10-A', val: 58 }, { label: '10-B', val: 50 }] },
  ],
  alerts: [
    // { text: 'Class 10-B Mock VI not yet scheduled', sub: 'Priority by 28 Mar', color: 'bg-red-400' },
    // { text: '3 students in Class 8-A missed Mock V', sub: 'Re-test window: 5 days', color: 'bg-yellow-400' },
    // { text: 'Class 10-A Mock VI ready to assign', sub: 'All previous mocks reviewed', color: 'bg-green-500' },
  ],

  // Image 4: Remediation
  remediationSummary: [
    // { label: 'Excelling', value: 89, sub: '≥ Benchmark', color: 'bg-green-600' },
    // { label: 'Watch Zone', value: 34, sub: '5-15% below', color: 'bg-yellow-500' },
    // { label: 'At-Risk', value: 16, sub: '15-25% below', color: 'bg-orange-500' },
    // { label: 'Critical', value: 8, sub: '> 25% below', color: 'bg-red-500' },
  ],
  remediationMatrix: [
    // { class: '10-A', subject: 'Maths', chapter: 'Trigonometry (Ext.)', accuracy: 44, bench: 73, gap: -31, risk: 12, action: 'Assign Now' },
    // { class: '10-A', subject: 'Maths', chapter: 'Circle Theorems', accuracy: 58, bench: 74, gap: -20, risk: 8, action: 'Schedule' },
    // { class: '10-B', subject: 'Maths', chapter: 'Trigonometry (Ext.)', accuracy: 38, bench: 80, gap: -37, risk: 7, action: 'Assign Now' },
    // { class: '9-A', subject: 'Science', chapter: 'Structure of Atom', accuracy: 68, bench: 72, gap: -8, risk: 6, action: 'Schedule' },
  ],
  recommendedPlans: [
    // { id: 1, title: 'Trigonometry — Class 10-A & 10-B', desc: 'Assign L1 drill: Sin/Cos/Tan basics. Target 70% before L2.', color: 'bg-lime-500' },
    // { id: 2, title: 'Atoms & Molecules — Class 9-B', desc: 'Conceptual clarity on atomic structure. 2 x 40-min sessions.', color: 'bg-lime-500' },
  ]


  
};