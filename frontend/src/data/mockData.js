export const mockTasks = [
    {
        id: 1,
        title: "Finalize investor pitch deck",
        duration: "2h 00min",
        priority: "URGENT",
        subtasks: 3,
        category: "Fundraising",
        date: "Tuesday, Oct 24",
        completed: false
    },
    {
        id: 2,
        title: "Review backend PR",
        duration: "45min",
        priority: "HIGH",
        subtasks: 2,
        category: "Development",
        date: "Tuesday, Oct 24",
        completed: false
    },
    {
        id: 3,
        title: "Weekly team sync notes",
        duration: "30min",
        priority: "MEDIUM",
        subtasks: 0,
        category: "Admin",
        date: "Tuesday, Oct 24",
        completed: false
    },
    {
        id: 4,
        title: "Update personal portfolio",
        duration: "1h 15min",
        priority: "LOW",
        subtasks: 0,
        category: "Personal",
        date: "Tuesday, Oct 24",
        completed: false,
        suggestedDeferral: true
    }
];

export const weeklyData = [
    {
        day: "Mon", date: "24", capacity: 60, tasks: [
            { title: "Email Catchup", time: "09:00 - 10:30", type: "work" },
            { title: "Team Standup", time: "11:00 - 11:30", type: "work" }
        ]
    },
    {
        day: "Tue", date: "25", capacity: 80, tasks: [
            { title: "Client Discovery", time: "2.5 hrs", type: "work" },
            { title: "Wireframing", time: "3 hrs", type: "work" },
            { title: "Doc Review", time: "1 hr", type: "work" }
        ]
    },
    {
        day: "Wed", date: "26", capacity: 112, tasks: [
            { title: "Q3 Report Gen", time: "3 hrs", type: "work" },
            { title: "Client Call: Zenith", time: "1 hr", type: "work" },
            { title: "Strategy Deck", time: "2 hrs", type: "work" },
            { title: "Team Sync", time: "1 hr", type: "work" },
            { title: "Write Report", time: "2 hrs", type: "overload", warning: true }
        ], overloaded: true
    },
    {
        day: "Thu", date: "27", capacity: 40, tasks: [
            { title: "Dev Handoff", time: "1.5 hrs", type: "work" },
            { title: "FREE SLOT", type: "empty" }
        ]
    },
    {
        day: "Fri", date: "28", capacity: 75, tasks: [
            { title: "Retrospective", time: "1 hr", type: "work" },
            { title: "Planning Next Week", time: "2 hrs", type: "work" },
            { title: "Inbox Zero", time: "1 hr", type: "work" }
        ]
    },
    {
        day: "Sat", date: "29", capacity: 10, tasks: [
            { title: "Personal Project", time: "2 hrs", type: "personal" }
        ], weekend: true
    },
    { day: "Sun", date: "30", capacity: 0, tasks: [], weekend: true }
];

export const userData = {
    name: "Jane Doe",
    plan: "Pro Plan",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAevSxtbesi5J2riVVjI_v6o-K1A84reEPAK8wELGsX0EUPHFF9EgAkyZYXdVAv1Fxv8vzm-dV8XmMgXy7q3g2DbR7pdRV_72cawFf7DP6W5V-xgEpxt9j5TtCGxH7SSQgAdvh8UvQj18Uh7ipiSMXiiaRZXEOubCaAOQyaNVc156fW3aiISOob0VRQKw049ZPd1YSVXnozJS3GsHtFOugtIavu4m-MB46CxMrdeOjiLnzOciw6PJCYr3c4EofMCFaHt1ARarjIHPw"
};
