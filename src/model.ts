export const TODAY = "2026-11-06";
export const DEMO_TIME = "2026-11-06T10:30:00";
export type Status =
  "Open" | "In Progress" | "Awaiting Follow-Up" | "Completed" | "Archived";
export interface CareAction {
  medical?: boolean;
  id: string;
  title: string;
  owner: string;
  due: string;
  status: Status;
  priority: string;
  category: string;
  eventId: string;
  notes: string;
  created: string;
  questionnaire: string[];
  history: string[];
}
export interface Question {
  receiver?: string;
  id: string;
  text: string;
  status: "Submitted" | "Reviewed" | "Answered";
  answer?: string;
  created: string;
}
export interface CareNote {
  id: string;
  author: string;
  role: string;
  text: string;
  time: string;
  personal: boolean;
  history: string[];
}
export interface Priority {
  medical?: boolean;
  completed?: boolean;
  id: string;
  title: string;
  detail: string;
  time: string;
  approved: boolean;
  viewed?: boolean;
}
export interface CareEvent {
  id: string;
  title: string;
  friendly: string;
  date: string;
  time: string;
  type: string;
  team: string;
  summary: string;
  results: string;
  followup: string;
  verified: boolean;
}
export interface State {
  redemptions?: { id: string; title: string; cost: number; time: string }[];
  theme?: string;
  version: number;
  tasks: string[];
  questions: Question[];
  notes: CareNote[];
  actions: CareAction[];
  priorities: Priority[];
  concerns: Record<string, string>;
  concernHistory: string[];
  stars: number;
  badges: string[];
  discharge: string;
  eventNotes: Record<string, string[]>;
}
export const team = [
  "Dr. Maya Patel · Cardiologist",
  "Jamie Chen · Bedside nurse",
  "Alex Rivera · Physical therapist",
  "Sam Wilson · Care coordinator",
];
export const events: CareEvent[] = [
  {
    id: "admit",
    title: "Admission & assessment",
    friendly: "Your journey begins",
    date: "2026-11-02",
    time: "08:00",
    type: "Milestone",
    team: team[0],
    summary:
      "Admitted for planned ventricular septal defect repair. Family orientation completed.",
    results: "Baseline assessment documented by admitting team.",
    followup: "Preoperative review completed.",
    verified: true,
  },
  {
    id: "repair",
    title: "VSD repair",
    friendly: "Heart procedure complete",
    date: "2026-11-03",
    time: "09:00",
    type: "Procedure",
    team: "Dr. Morgan Lee · Cardiac surgery",
    summary:
      "Planned VSD closure completed. Transferred to cardiac intensive care for postoperative monitoring.",
    results:
      "Operative note: patch closure completed. See simulated surgical record for full details.",
    followup: "Postoperative echocardiogram on November 6.",
    verified: true,
  },
  {
    id: "extubate",
    title: "Extubated in CICU",
    friendly: "Breathing on your own",
    date: "2026-11-04",
    time: "08:30",
    type: "Milestone",
    team: team[1],
    summary:
      "Breathing tube removed per documented CICU record. Continued observation in CICU.",
    results:
      "Respiratory assessment reviewed by the CICU team. No automated interpretation.",
    followup: "Respiratory assessment at step-down transfer.",
    verified: true,
  },
  {
    id: "transfer",
    title: "Transfer to ACCU",
    friendly: "A new room, a new chapter",
    date: "2026-11-05",
    time: "14:00",
    type: "Transfer",
    team: team[1],
    summary:
      "Transferred from CICU to acute cardiac care. Handoff and family update completed.",
    results: "Transfer checklist verified by receiving nurse.",
    followup: "Continue documented recovery plan.",
    verified: true,
  },
  {
    id: "rounds",
    title: "Morning rounds",
    friendly: "A visit from your care team",
    date: TODAY,
    time: "09:00",
    type: "Review",
    team: team[0],
    summary:
      "Team documented stable recovery. Echocardiogram planned this afternoon; family questions invited.",
    results: "Rounds note verified by Dr. Patel at 09:20.",
    followup: "Review echocardiogram once available.",
    verified: true,
  },
  {
    id: "echo",
    title: "Postoperative echocardiogram",
    friendly: "Pictures of your heart",
    date: TODAY,
    time: "14:00",
    type: "Diagnostic test",
    team: "Cardiac imaging team",
    summary:
      "Scheduled postoperative echocardiogram. Timing confirmed by imaging coordinator; results are pending.",
    results:
      "No result available. This scheduled study has not been completed in the demo.",
    followup: "Dr. Patel to review results and update the family.",
    verified: false,
  },
  {
    id: "home",
    title: "Estimated discharge",
    friendly: "Next stop: home",
    date: "2026-11-08",
    time: "12:00",
    type: "Estimate",
    team: team[0],
    summary:
      "Clinician-entered estimate, dependent on team review and discharge readiness. This is not a prediction or guaranteed date.",
    results: "Discharge readiness has not yet been confirmed.",
    followup: "Family education and team review before discharge.",
    verified: false,
  },
];
const action = (
  id: string,
  title: string,
  owner: string,
  due: string,
  status: Status,
  eventId: string,
  priority = "Routine",
): CareAction => ({
  id,
  title,
  owner,
  due,
  status,
  priority,
  category: "Follow-up",
  eventId,
  notes: "",
  created: `${due < TODAY ? due : TODAY}T09:00`,
  questionnaire: [],
  history: ["Created by Dr. Patel · Nov 6, 09:00 · demo record"],
});
export const initialState: State = {
  version: 1,
  tasks: ["teeth"],
  stars: 2,
  badges: [],
  discharge: "2026-11-08",
  eventNotes: {},
  concerns: { nausea: "Open", transfer: "Resolved" },
  concernHistory: [],
  questions: [
    {
      id: "playroom",
      text: "Can I go to the playroom today?",
      status: "Submitted",
      created: "2026-11-06T09:35",
    },
  ],
  notes: [
    {
      id: "welcome",
      author: "Jamie",
      role: "Your nurse",
      text: "You did a wonderful job on your walk yesterday, Oliver! We’ll take today one little step at a time. 🌱",
      time: "2026-11-06T08:15",
      personal: false,
      history: [],
    },
  ],
  priorities: [
    {
      id: "question-time",
      title: "Write down my questions",
      detail: "A quiet moment to prepare for our next conversation.",
      time: "10:30",
      approved: true,
      medical: false,
    },
    {
      id: "rounds",
      title: "Say hello to your team",
      detail: "Let’s talk about your day together.",
      time: "09:00",
      approved: true,
    },
    {
      id: "walk",
      title: "A little walk, a big step",
      detail: "A gentle adventure with Alex, your therapist.",
      time: "11:00",
      approved: true,
    },
    {
      id: "echo",
      title: "Pictures of your heart",
      detail: "An ultrasound helps your team see your heart.",
      time: "14:00",
      approved: true,
    },
  ],
  actions: [
    action(
      "review-echo",
      "Review postoperative echo with family",
      team[0],
      "2026-11-07",
      "Awaiting Follow-Up",
      "echo",
    ),
    action(
      "education",
      "Prepare family discharge education",
      team[3],
      "2026-11-07",
      "Open",
      "home",
    ),
    action(
      "nausea",
      "Review overnight nausea with team",
      team[1],
      TODAY,
      "In Progress",
      "rounds",
      "High",
    ),
    action(
      "handoff",
      "Confirm transfer handoff checklist",
      team[1],
      "2026-11-05",
      "Completed",
      "transfer",
    ),
    action(
      "old-followup",
      "Document family orientation check",
      team[3],
      "2026-11-05",
      "Open",
      "admit",
    ),
  ],
};
export type Mutation =
  | { type: "task"; id: string }
  | { type: "ask"; text: string; receiver?: string }
  | { type: "redeem"; rewardId: string }
  | { type: "theme"; theme: string }
  | { type: "complete-personal"; id: string; target: "priority" | "action" }
  | { type: "answer"; id: string; text: string }
  | { type: "review"; id: string }
  | { type: "note"; id?: string; text: string; clinical?: boolean }
  | { type: "action"; action: CareAction }
  | {
      type: "priority";
      id?: string;
      title: string;
      detail: string;
      time: string;
      approved: boolean;
      medical?: boolean;
    }
  | { type: "view-plan" }
  | { type: "concern"; id: string; status: string }
  | { type: "reward"; badge: string }
  | { type: "discharge"; date: string }
  | { type: "event-note"; id: string; text: string }
  | { type: "reset" };
const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
export function reducer(state: State, m: Mutation): State {
  switch (m.type) {
    case "theme":
      return { ...state, theme: m.theme };
    case "redeem": {
      const reward = rewards.find((r) => r.id === m.rewardId);
      if (!reward || state.stars < reward.cost) return state;
      return {
        ...state,
        stars: state.stars - reward.cost,
        redemptions: [
          ...(state.redemptions || []),
          { ...reward, id: uid(), time: now() },
        ],
      };
    }
    case "complete-personal": {
      if (m.target === "priority")
        return {
          ...state,
          priorities: state.priorities.map((p) =>
            p.id === m.id && p.medical === false
              ? { ...p, completed: !p.completed }
              : p,
          ),
        };
      return {
        ...state,
        actions: state.actions.map((a) =>
          a.id === m.id &&
          a.medical === false &&
          familyOwners.includes(a.owner) &&
          a.status !== "Archived"
            ? {
                ...a,
                status: a.status === "Completed" ? "Open" : "Completed",
                history: [
                  ...a.history,
                  `Family updated nonmedical task at ${now()}`,
                ],
              }
            : a,
        ),
      };
    }
    case "reset":
      return structuredClone(initialState);
    case "task":
      return {
        ...state,
        tasks: state.tasks.includes(m.id)
          ? state.tasks.filter((t) => t !== m.id)
          : [...state.tasks, m.id],
      };
    case "ask":
      return m.text.trim()
        ? {
            ...state,
            questions: [
              ...state.questions,
              {
                id: uid(),
                text: m.text.trim(),
                receiver: m.receiver || "My whole care team",
                status: "Submitted",
                created: now(),
              },
            ],
          }
        : state;
    case "review":
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === m.id && q.status === "Submitted"
            ? { ...q, status: "Reviewed" }
            : q,
        ),
      };
    case "answer":
      return m.text.trim()
        ? {
            ...state,
            questions: state.questions.map((q) =>
              q.id === m.id
                ? { ...q, status: "Answered", answer: m.text.trim() }
                : q,
            ),
          }
        : state;
    case "note": {
      if (!m.text.trim()) return state;
      if (m.id)
        return {
          ...state,
          notes: state.notes.map((n) =>
            n.id === m.id && n.personal
              ? { ...n, text: m.text.trim(), history: [...n.history, n.text] }
              : n,
          ),
        };
      return {
        ...state,
        notes: [
          ...state.notes,
          {
            id: uid(),
            author: m.clinical ? "Dr. Patel" : "Oliver & family",
            role: m.clinical ? "Cardiologist" : "Patient & family",
            text: m.text.trim(),
            time: now(),
            personal: !m.clinical,
            history: [],
          },
        ],
      };
    }
    case "action": {
      const old = state.actions.find((a) => a.id === m.action.id);
      const updated = {
        ...m.action,
        history: [
          ...(old?.history || []),
          `${old ? "Updated" : "Created"} by demo clinician · ${now()} · ${m.action.status}`,
        ],
      };
      return {
        ...state,
        actions: old
          ? state.actions.map((a) => (a.id === updated.id ? updated : a))
          : [...state.actions, updated],
      };
    }
    case "priority": {
      const p = {
        id: m.id || uid(),
        title: m.title.trim(),
        detail: m.detail.trim(),
        time: m.time,
        approved: m.approved,
        medical: m.medical !== false,
        viewed: false,
      };
      return {
        ...state,
        priorities: m.id
          ? state.priorities.map((old) => (old.id === m.id ? p : old))
          : [...state.priorities, p],
      };
    }
    case "view-plan":
      return {
        ...state,
        priorities: state.priorities.map((p) =>
          p.approved ? { ...p, viewed: true } : p,
        ),
      };
    case "concern":
      return {
        ...state,
        concerns: { ...state.concerns, [m.id]: m.status },
        concernHistory: [
          ...state.concernHistory,
          `${m.id}: ${m.status} · Dr. Patel · ${now()}`,
        ],
      };
    case "reward":
      return state.badges.includes(m.badge)
        ? state
        : {
            ...state,
            stars: state.stars + 3,
            badges: [...state.badges, m.badge],
          };
    case "discharge":
      return { ...state, discharge: m.date };
    case "event-note":
      return {
        ...state,
        eventNotes: {
          ...state.eventNotes,
          [m.id]: [
            ...(state.eventNotes[m.id] || []),
            `${m.text} — Dr. Patel · ${now()}`,
          ],
        },
      };
  }
}
export function actionStatus(a: CareAction) {
  return a.due < TODAY && a.status !== "Completed" && a.status !== "Archived"
    ? "Overdue"
    : a.status;
}
export function visibleFollowups(actions: CareAction[]) {
  return actions.filter(
    (a) =>
      a.due >= TODAY && a.status !== "Completed" && a.status !== "Archived",
  );
}
export function recentEvents() {
  return events
    .filter((e) => e.date >= "2026-11-04" && e.date <= TODAY)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
}
export function dateLabel(date: string) {
  return new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export const familyOwners = ["Oliver · Patient", "Parent / guardian"];
export const rewards = [
  { id: "stickers", title: "Adventure stickers", cost: 2, icon: "🌟" },
  { id: "soldiers", title: "Toy army figures", cost: 3, icon: "🪖" },
  { id: "candy", title: "A small candy treat", cost: 5, icon: "🍬" },
];
