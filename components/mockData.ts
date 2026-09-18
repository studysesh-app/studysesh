
export interface StudentProfileData {
    id: string;
    name: string;
    pronouns?: string;
    year?: string;
    major?: string;
    sharedCourses: string[]; // List of course codes
    photoUrl?: string; // Optional profile photo URL
    role?: 'student' | 'tutor'; // To potentially show different badges
    prompts: Array<{ prompt: string; answer: string }>;
    isConnected?: boolean;
    privacy?: 'public' | 'hidden';
}


// Mock Classmates (from ClassmatesScreen/Index)
export const MOCK_CLASSMATES: StudentProfileData[] = [
    {
        id: 'c1',
        name: 'Jamie Wilson',
        pronouns: 'they/them',
        year: '2nd Year',
        major: 'Computer Science',
        role: 'student',
        photoUrl: 'https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=2787&auto=format&fit=crop',
        sharedCourses: ['COMP 2402', 'SYSC 2006'],
        prompts: [
            { prompt: "I study best at...", answer: "Late night in MacOdrum Library with lo-fi beats" },
            { prompt: "I'm always down to...", answer: "Grab coffee and debug together" },
            { prompt: "My toxic study trait is...", answer: "Starting assignments 2 hours before deadline" },
        ],
    },
    {
        id: 'c2',
        name: 'Michael Chen',
        pronouns: 'he/him',
        year: '3rd Year',
        major: 'Software Engineering',
        role: 'student',
        photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2662&auto=format&fit=crop',
        sharedCourses: ['SYSC 2006'],
        prompts: [
            { prompt: "Need someone to help me out with...", answer: "SYSC 2006 - C programming is killing me" },
            { prompt: "Best study spot on campus is...", answer: "The quiet floor in Richcraft Hall" },
            { prompt: "After exams, you'll find me...", answer: "At Mike's Place celebrating" },
        ],
    },
    {
        id: 'c3',
        name: 'Aisha Patel',
        pronouns: 'she/her',
        year: '2nd Year',
        major: 'Computer Science',
        role: 'student',
        photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2459&auto=format&fit=crop',
        sharedCourses: ['COMP 2402', 'MATH 1004'],
        prompts: [
            { prompt: "I'll buy you coffee if...", answer: "You explain recursion to me one more time" },
            { prompt: "My go-to study snack is...", answer: "Tim's iced coffee and a farmer's wrap" },
            { prompt: "I'm passionate about...", answer: "Making tech more accessible and inclusive" },
        ],
    },
    {
        id: 'c4',
        name: 'David Kim',
        pronouns: 'he/him',
        year: '4th Year',
        major: 'Electrical Engineering',
        role: 'student',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2787&auto=format&fit=crop',
        sharedCourses: ['ELEC 2507'],
        prompts: [
            { prompt: "My secret talent is...", answer: "I can fix literally any hardware issue" },
            { prompt: "I'm looking for...", answer: "Study partners who actually show up" },
            { prompt: "Fun fact about me...", answer: "I built my own drone from scratch" },
        ],
    },
    {
        id: 'c5',
        name: 'Sarah Miller',
        pronouns: 'she/her',
        year: '1st Year',
        major: 'Psychology',
        role: 'student',
        photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2670&auto=format&fit=crop',
        sharedCourses: [],
        prompts: [
            { prompt: "I chose this major because...", answer: "I want to understand how people think" },
            { prompt: "My ideal weekend is...", answer: "Hiking in Gatineau Park" },
            { prompt: "Currently obsessing over...", answer: "The latest season of Stranger Things" },
        ],
    },
];

// Mock Tutors (matching IDs from app/index.tsx)
export const MOCK_TUTORS: StudentProfileData[] = [
    {
        id: '1',
        name: 'Sarah Chen',
        pronouns: 'she/her',
        year: '4th Year',
        major: 'Computer Systems',
        role: 'tutor',
        sharedCourses: ['SYSC 2006', 'COMP 2402', 'ELEC 2507'],
        prompts: [
            { prompt: "I can help you with...", answer: "Understanding pointers in C and low-level memory management." },
            { prompt: "My teaching style is...", answer: "Hands-on coding and visualization." },
            { prompt: "When I'm not tutoring...", answer: "I'm probably hacking on open source projects." }
        ]
    },
    {
        id: '2',
        name: 'Marcus Johnson',
        pronouns: 'he/him',
        year: '3rd Year',
        major: 'Physics',
        role: 'tutor',
        sharedCourses: ['MATH 1004', 'PHYS 1004'],
        prompts: [
            { prompt: "Physics is easy when...", answer: "You visualize the forces at play." },
            { prompt: "Best way to learn is...", answer: "Solving practice problems until it clicks." },
            { prompt: "Ask me about...", answer: "Quantum mechanics theories." }
        ]
    },
    {
        id: '3',
        name: 'Emily Rodriguez',
        pronouns: 'she/her',
        year: '2nd Year',
        major: 'Computer Science',
        role: 'tutor',
        sharedCourses: ['SYSC 2006'],
        prompts: [
            { prompt: "I love teaching because...", answer: "That 'aha!' moment is everything." },
            { prompt: "My favorite theorem is...", answer: "The Fundamental Theorem of Calculus." },
            { prompt: "Fun fact:", answer: "I competitively solve Rubik's cubes." }
        ]
    },
    {
        id: '4',
        name: 'Alex Thompson',
        pronouns: 'they/them',
        year: '3rd Year',
        major: 'Computer Science',
        role: 'tutor',
        sharedCourses: ['COMP 2402', 'MATH 1004'],
        prompts: [
            { prompt: "Discrete Math is...", answer: "The foundation of all computer science!" },
            { prompt: "Stuck on logic proofs?", answer: "Let's break it down step by step." },
            { prompt: "Fun fact:", answer: "I build my own drones." }
        ]
    },
    {
        id: '5',
        name: 'Priya Sharma',
        pronouns: 'she/her',
        year: '3rd Year',
        major: 'Electrical Engineering',
        role: 'tutor',
        sharedCourses: ['ELEC 2507', 'PHYS 1004'],
        prompts: [
            { prompt: "Circuits are...", answer: "Like puzzles waiting to be solved." },
            { prompt: "My advice:", answer: "Don't memorize, understand the principles." },
            { prompt: "Favorite topic:", answer: "Digital signal processing." }
        ]
    },
    {
        id: '6',
        name: 'Jordan Lee',
        pronouns: 'he/him',
        year: '2nd Year',
        major: 'Systems Engineering',
        role: 'tutor',
        sharedCourses: ['SYSC 2006', 'COMP 2402', 'MATH 1004'],
        privacy: 'hidden', // TEST CASE: Hidden profile
        prompts: [
            { prompt: "Why Systems?", answer: "I love seeing how hardware and software connect." },
            { prompt: "Grinding for...", answer: "That 4.0 GPA." },
            { prompt: "Coffee order:", answer: "Triple shot espresso." }
        ]
    },
    // Keep some original mocked ones with t-prefix if needed for other tests, but main ones above
    { id: 't7', name: 'Riya Jain', pronouns: 'he/him', year: '4th Year', major: 'Commerce', role: 'tutor', sharedCourses: ['BUSI 1005'], prompts: [{ prompt: "Business is...", answer: "More than just graphs." }, { prompt: "I can help with...", answer: "Financial accounting and stats." }, { prompt: "Weekend vibes:", answer: "Case competitions." }] },
    { id: 't8', name: 'Mahad Qureshi', pronouns: 'she/her', year: '3rd Year', major: 'Economics', role: 'tutor', sharedCourses: ['ECON 1001'], prompts: [{ prompt: "Economics explains...", answer: "Everything around us." }, { prompt: "Study tip:", answer: "Draw usage graphs for everything." }, { prompt: "Favorite book:", answer: "Freakonomics." }] },
];

export const ALL_USERS = [...MOCK_CLASSMATES, ...MOCK_TUTORS];

export function getUserById(id: string): StudentProfileData | undefined {
    return ALL_USERS.find(u => u.id === id);
}

export function getUserByName(name: string): StudentProfileData | undefined {
    return ALL_USERS.find(u => u.name === name);
}
