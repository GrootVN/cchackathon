import { useEffect, useReducer, useRef, useState } from "react";
import type { ReactNode, FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Cloud,
  Compass,
  Heart,
  Home,
  Info,
  LockKeyhole,
  MessageCircle,
  MoreHorizontal,
  Navigation,
  Plane,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Trophy,
  Users,
  Wind,
  X,
} from "lucide-react";
import {
  initialState,
  reducer,
  events,
  team,
  TODAY,
  actionStatus,
  visibleFollowups,
  recentEvents,
  dateLabel,
} from "./model";
import type { State, Status, Mutation } from "./model";

const KEY = "flightplan-demo-v1";
type Modal = { kind: string; id?: string } | null;
const get = (f: FormData, k: string) => String(f.get(k) || "").trim();
function readState(): State {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    return s?.version === 1 &&
      Array.isArray(s.actions) &&
      Array.isArray(s.questions) &&
      Array.isArray(s.priorities)
      ? s
      : structuredClone(initialState);
  } catch {
    return structuredClone(initialState);
  }
}
function Badge({
  children,
  tone = "purple",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function SectionTitle({
  icon,
  title,
  subtitle,
  children,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <h2>
          {icon}
          {title}
        </h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
function Avatar({
  name,
  tone = "purple",
  small = false,
}: {
  name: string;
  tone?: string;
  small?: boolean;
}) {
  return (
    <span className={`avatar ${tone} ${small ? "small" : ""}`}>{name}</span>
  );
}

function SkyArt({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={compact ? "sky-art compact" : "sky-art"}
      viewBox="0 0 500 290"
      role="img"
      aria-label="A little airplane flying over a peaceful mountain landscape toward home"
    >
      <defs>
        <linearGradient id="sky" x2="0" y2="1">
          <stop stopColor="#dbeafc" />
          <stop offset="1" stopColor="#efeaff" />
        </linearGradient>
        <linearGradient id="hill" x2="0" y2="1">
          <stop stopColor="#b9c7ea" />
          <stop offset="1" stopColor="#d0d9f4" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="7"
            floodColor="#7055b8"
            floodOpacity=".17"
          />
        </filter>
      </defs>
      <circle cx="295" cy="142" r="129" fill="url(#sky)" />
      <circle cx="393" cy="64" r="28" fill="#ffe6a1" />
      <g fill="white" opacity=".9" className="cloud-drift">
        <path d="M97 83c-15 0-15-21-1-24 3-18 31-18 35 0 24-5 28 24 7 24z" />
        <path d="M347 127c-21 0-22-25-4-29 5-25 39-24 43-4 25-6 33 33 7 33z" />
        <path d="M220 39c-9 0-11-14-1-17 3-13 22-12 25 0 15-3 19 17 3 17z" />
      </g>
      <path d="M151 239 233 142 302 224 354 176 436 251Z" fill="#c8d3ef" />
      <path d="m233 142-24 29 23-6 21 7z" fill="#f8faff" />
      <path
        d="M112 259c48-49 91-43 137-16s90-21 116-16 42 14 61 32"
        fill="url(#hill)"
      />
      <path d="M157 267c42-23 70-10 100 0 41 10 89-20 136-5" fill="#a9c2c4" />
      <path
        d="M68 200c17-1 37-8 43-21 15-32-34-52-7-75 24-19 61 9 100-15"
        fill="none"
        stroke="#9b90c8"
        strokeWidth="2"
        strokeDasharray="5 6"
      />
      <g transform="translate(192 62) rotate(-13)" filter="url(#shadow)">
        <path d="M0 29 139 0 57 84 49 46Z" fill="#fff" />
        <path d="m49 46 90-46-82 84z" fill="#c3b7ef" />
        <path d="m49 46 90-46-64 56z" fill="#e2dbf8" />
      </g>
      <g transform="translate(351 221)">
        <path d="m-15 15 25-23 26 23" fill="#e8b49d" />
        <path d="M-7 14h34v28H-7z" fill="#fff7ed" />
        <path d="M6 25h10v17H6z" fill="#aa9bc6" />
        <rect x="-2" y="21" width="6" height="7" rx="1" fill="#c3d5e7" />
      </g>
      <g fill="#fff" stroke="#b5a5e2" strokeWidth="1.5">
        <path d="m139 129 3 7 8 3-8 3-3 8-3-8-7-3 7-3z" />
        <path d="m426 180 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
      </g>
    </svg>
  );
}

function Dialog({
  title,
  children,
  close,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    const previous = document.activeElement as HTMLElement;
    d.showModal();
    return () => {
      d.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`dialog ${wide ? "wide" : ""}`}
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="dialog-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={close}
        >
          <X size={21} />
        </button>
      </div>
      <div className="dialog-body">{children}</div>
    </dialog>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, readState);
  const [clinical, setClinical] = useState(false);
  const [family, setFamily] = useState(false);
  const [nav, setNav] = useState("Today");
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState("");
  const [help, setHelp] = useState(false);
  const [filter, setFilter] = useState("All actions");
  const [sort, setSort] = useState("Newest first");
  const [newsFilter, setNewsFilter] = useState("All updates");
  const [zoom, setZoom] = useState(false);
  const [quiz, setQuiz] = useState<number | null>(null);
  const [flips, setFlips] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [quiet, setQuiet] = useState(false);
  const notify = (text: string) => setToast(text);
  const mutate = (m: Mutation, message = "Saved to this demo") => {
    dispatch(m);
    notify(message);
  };
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      setToast(
        "Storage is unavailable. Changes will last for this session only.",
      );
    }
  }, [state]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    if (flips.length === 2) {
      const t = setTimeout(() => {
        if (flips[0] % 4 === flips[1] % 4) setMatched((m) => [...m, ...flips]);
        setFlips([]);
      }, 650);
      return () => clearTimeout(t);
    }
  }, [flips]);
  const close = () => {
    setModal(null);
    setHelp(false);
    setQuiz(null);
  };
  const navigate = (name: string) => {
    setNav(name);
    document
      .getElementById(
        name === "My journey"
          ? "journey"
          : name === "Notes & questions"
            ? "messages"
            : name === "Learn & play"
              ? "learn"
              : name === "My care team"
                ? "team"
                : "top",
      )
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const submit = (e: FormEvent<HTMLFormElement>, fn: (f: FormData) => void) => {
    e.preventDefault();
    fn(new FormData(e.currentTarget));
  };
  const timelineDays = Math.max(
    7,
    Math.round(
      (new Date(state.discharge + "T12:00:00").getTime() -
        new Date("2026-11-02T12:00:00").getTime()) /
        86400000,
    ) + 1,
  );
  const incompleteQuestions = state.questions.filter(
    (q) => q.status !== "Answered",
  ).length;
  const actionList = state.actions
    .filter((a) =>
      filter === "Archived"
        ? a.status === "Archived"
        : a.status !== "Archived" &&
          (filter === "All actions" ||
            (filter === "My actions" && a.owner === team[1]) ||
            (filter === "Overdue" && actionStatus(a) === "Overdue") ||
            (filter === "Open" && a.status !== "Completed")),
    )
    .sort((a, b) =>
      sort === "Due date"
        ? a.due.localeCompare(b.due)
        : b.created.localeCompare(a.created),
    );
  const primary = (label: string) => (
    <button type="submit" className="button primary">
      {label}
      <ArrowRight size={16} />
    </button>
  );
  const questions = (clinician = false) => (
    <div className="question-list">
      {state.questions.map((q) => (
        <div className="question" key={q.id}>
          <div className="row between">
            <span className="micro">
              Oliver & family · {dateLabel(q.created)} ·{" "}
              {new Date(q.created).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            <Badge tone={q.status === "Answered" ? "green" : "amber"}>
              {q.status}
            </Badge>
          </div>
          <p>{q.text}</p>
          {q.answer && (
            <div className="answer">
              <Avatar name="MP" small />
              <div>
                <strong>
                  Dr. Patel <span>· Cardiologist</span>
                </strong>
                <p>{q.answer}</p>
              </div>
            </div>
          )}
          {clinician && q.status !== "Answered" && (
            <div className="row">
              <button
                className="text-button"
                onClick={() => setModal({ kind: "answer", id: q.id })}
              >
                Respond <ArrowRight size={14} />
              </button>
              {q.status === "Submitted" && (
                <button
                  className="text-button muted"
                  onClick={() =>
                    mutate(
                      { type: "review", id: q.id },
                      "Question marked reviewed",
                    )
                  }
                >
                  Mark reviewed
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`app ${clinical ? "clinical" : ""} ${quiet ? "quiet" : ""}`}
      id="top"
    >
      <aside className="sidebar">
        <a
          className="brand"
          aria-label="FlightPlan home"
          href="#top"
          onClick={() => navigate("Today")}
        >
          <span className="brand-icon">
            <Navigation size={25} fill="currentColor" />
          </span>
          <span>
            flightplan<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="workspace-label">
          {clinical ? "BEDSIDE WORKSPACE" : "YOUR ADVENTURE, TOGETHER"}
        </div>
        <nav aria-label="Main navigation">
          {(clinical
            ? [
                { name: "Rounds overview", icon: <Stethoscope /> },
                { name: "Hospital timeline", icon: <Compass /> },
                { name: "Action history", icon: <ClipboardCheck /> },
                { name: "Family questions", icon: <MessageCircle /> },
              ]
            : [
                { name: "Today", icon: <Sun /> },
                { name: "My journey", icon: <Compass /> },
                { name: "Notes & questions", icon: <MessageCircle /> },
                { name: "Learn & play", icon: <Sparkles /> },
                { name: "My care team", icon: <Users /> },
              ]
          ).map((item) => (
            <button
              key={item.name}
              aria-label={item.name}
              className={`nav-item ${nav === item.name || (clinical && nav === "Today" && item.name === "Rounds overview") ? "active" : ""}`}
              onClick={() => {
                if (clinical) {
                  setNav(item.name);
                  document
                    .getElementById(
                      item.name === "Hospital timeline"
                        ? "timeline"
                        : item.name === "Action history"
                          ? "actions"
                          : item.name === "Family questions"
                            ? "clinical-questions"
                            : "top",
                    )
                    ?.scrollIntoView({ behavior: "smooth" });
                } else navigate(item.name);
              }}
            >
              {item.icon}
              <span>{item.name}</span>
              {item.name.includes("questions") && incompleteQuestions > 0 && (
                <span className="nav-count">{incompleteQuestions}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="together-card">
            <div className="heart-orbit">
              <Heart size={23} />
              <Sparkles size={12} />
            </div>
            <strong>A team by your side.</strong>
            <p>
              Little questions. Big feelings.
              <br />
              We’re in this together.
            </p>
            <button
              className="text-button"
              onClick={() => setModal({ kind: "team" })}
            >
              Meet your team <ArrowRight size={14} />
            </button>
          </div>
          <button
            className="sidebar-option"
            onClick={() => setModal({ kind: "about" })}
          >
            <CircleHelp size={18} />
            About this demo <ChevronRight size={15} />
          </button>
          <div className="hospital-mark">
            <span className="hospital-cross">✚</span>
            <div>
              Cincinnati Children’s<small>Inspired by better outcomes.</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span>{clinical ? "Care team" : "Patient & family"}</span>
            <ChevronRight size={14} />
            <strong>
              {clinical ? "Rounds overview" : "Your day at a glance"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="demo-label">
              <span />
              Fictional patient · Demo
            </span>
            <button
              className="icon-button"
              aria-label="View updates"
              onClick={() => setModal({ kind: "updates" })}
            >
              <Bell size={19} />
              <i />
            </button>
            <Avatar name={clinical ? "MP" : "OJ"} small />
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                FRIDAY, NOVEMBER 6 <span>✦</span> HOSPITAL DAY 5
              </div>
              <h1>
                {clinical
                  ? "A clear picture. A shared plan."
                  : "Good morning, Oliver"}
                {!clinical && <span className="wave">☀️</span>}
              </h1>
              <p>
                {clinical
                  ? "Oliver J. · Fictional patient, age 8 · Acute Cardiac Care · Room 412"
                  : "A new day, a few small steps, and a whole team cheering you on."}
              </p>
            </div>
            <div className="heading-actions">
              {clinical ? (
                <>
                  <button
                    className={`button ${family ? "family-on" : "secondary"}`}
                    aria-pressed={family}
                    onClick={() => setFamily(!family)}
                  >
                    <Users size={17} />
                    Family-present {family ? "on" : "off"}
                    <span className={`toggle ${family ? "on" : ""}`} />
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => {
                      setClinical(false);
                      setNav("Today");
                      setFamily(false);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <ArrowLeft size={16} />
                    Patient view
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="button help-button"
                    onClick={() => setModal({ kind: "help" })}
                  >
                    <Bell size={17} />
                    Need a hand?
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => setModal({ kind: "access" })}
                  >
                    <Stethoscope size={18} />
                    Care team view
                    <ArrowRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
          {clinical ? (
            <>
              <div className="clinical-status">
                <div className="row">
                  <span className="status-dot" />
                  <strong>
                    {family
                      ? "Recovering with support"
                      : "Stable postoperative recovery"}
                  </strong>
                  <Badge tone="green">Team verified</Badge>
                </div>
                <span className="micro">
                  Dr. Patel · Updated Nov 6, 09:20 · Fixed demo date
                </span>
              </div>
              {family && (
                <div className="notice">
                  <ShieldCheck size={18} />
                  Family-present mode is on. Showing shared plans and verified
                  milestones. Internal concerns and technical results are
                  hidden.
                </div>
              )}
              <div className="snapshot-grid">
                <div className="snapshot">
                  <span>ADMITTED</span>
                  <strong>Nov 2, 2026</strong>
                  <small>Hospital day 5</small>
                </div>
                <div className="snapshot">
                  <span>{family ? "OUR FOCUS" : "PRIMARY DIAGNOSIS"}</span>
                  <strong>
                    {family
                      ? "Recovering after heart repair"
                      : "Ventricular septal defect"}
                  </strong>
                  <small>
                    {family
                      ? "One step at a time"
                      : "S/p surgical closure · Nov 3"}
                  </small>
                </div>
                <div className="snapshot">
                  <span>CURRENT LOCATION</span>
                  <strong>
                    <span className="location-dot" />
                    Acute Cardiac Care
                  </strong>
                  <small>Transferred Nov 5 · Verified handoff</small>
                </div>
                <button
                  className="snapshot snapshot-button"
                  onClick={() => setModal({ kind: "discharge" })}
                >
                  <span>
                    ESTIMATED DISCHARGE <MoreHorizontal size={16} />
                  </span>
                  <strong>{dateLabel(state.discharge)}</strong>
                  <small>Clinician-entered estimate · May change</small>
                </button>
              </div>
              <section className="card timeline-card" id="timeline">
                <SectionTitle
                  title="The hospital journey"
                  subtitle="A shared picture of where we’ve been, and what comes next."
                >
                  <div className="row">
                    <button
                      className="button tiny secondary"
                      onClick={() => setZoom(!zoom)}
                    >
                      {zoom ? "Fit journey" : "Expand timeline"}
                    </button>
                    <button
                      className="button tiny secondary"
                      onClick={() =>
                        document
                          .getElementById("day-today")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest",
                            inline: "center",
                          })
                      }
                    >
                      <Navigation size={14} />
                      Today
                    </button>
                  </div>
                </SectionTitle>
                <div className="timeline-scroll">
                  <div
                    className={`timeline ${zoom ? "expanded" : ""}`}
                    style={{
                      gridTemplateColumns: `repeat(${timelineDays}, minmax(135px,1fr))`,
                    }}
                  >
                    {Array.from({ length: timelineDays }, (_, i) => {
                      const date = new Date(Date.UTC(2026, 10, 2 + i))
                        .toISOString()
                        .slice(0, 10);
                      const dayEvents = events
                        .filter((e) =>
                          e.id === "home"
                            ? state.discharge === date
                            : e.date === date,
                        )
                        .filter((e) => !family || e.verified);
                      const follows = family
                        ? []
                        : visibleFollowups(state.actions).filter(
                            (a) => a.due === date,
                          );
                      return (
                        <div
                          key={date}
                          className={`timeline-day ${date === TODAY ? "current" : ""}`}
                          id={date === TODAY ? "day-today" : undefined}
                        >
                          <div className="timeline-date">
                            {dateLabel(date)}
                            {date === TODAY && <Badge>Today</Badge>}
                          </div>
                          <div className="timeline-events">
                            {dayEvents.map((e) => (
                              <button
                                key={e.id}
                                className={`event-marker ${e.type === "Estimate" ? "tentative" : ""}`}
                                onClick={() =>
                                  setModal({ kind: "event", id: e.id })
                                }
                              >
                                <span className="event-icon">
                                  {e.type === "Procedure" ? (
                                    <Heart size={13} />
                                  ) : e.type === "Transfer" ? (
                                    <ArrowRight size={13} />
                                  ) : (
                                    <Compass size={13} />
                                  )}
                                </span>
                                <span>
                                  {family ? e.friendly : e.title}
                                  <small>
                                    {e.time} ·{" "}
                                    {e.verified
                                      ? "Verified"
                                      : e.type === "Estimate"
                                        ? "Tentative"
                                        : "Scheduled"}
                                  </small>
                                </span>
                              </button>
                            ))}
                            {follows.length > 0 && (
                              <button
                                className="follow-marker"
                                onClick={() =>
                                  setModal({ kind: "followups", id: date })
                                }
                              >
                                <span className="hollow-dot" />
                                {follows.length} follow-up
                                {follows.length > 1 ? "s" : ""}
                                <small>{follows[0].title}</small>
                              </button>
                            )}
                          </div>
                          <div
                            className={`location-bar ${i === 0 ? "inpatient" : i === 1 ? "operating" : i === 2 ? "cicu" : date <= TODAY ? "accu" : "planned"}`}
                          >
                            {i === 0
                              ? "Inpatient"
                              : i === 1
                                ? "OR → CICU"
                                : i === 2
                                  ? "CICU"
                                  : date <= TODAY
                                    ? "ACCU"
                                    : date === state.discharge
                                      ? "Home · estimated"
                                      : "Plan pending"}
                          </div>
                          <small className="timeline-day-number">
                            Day {i + 1}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="timeline-legend">
                  <span>
                    <i className="inpatient" />
                    Inpatient
                  </span>
                  <span>
                    <i className="operating" />
                    Operating room
                  </span>
                  <span>
                    <i className="cicu" />
                    Cardiac ICU
                  </span>
                  <span>
                    <i className="accu" />
                    Acute cardiac care
                  </span>
                  <span>
                    <i className="planned" />
                    Tentative / unknown
                  </span>
                </div>
              </section>
              <div className="two-col clinical-middle">
                {!family && (
                  <section className="card">
                    <SectionTitle
                      icon={<ShieldCheck size={19} />}
                      title="Important notes"
                      subtitle="Documented concerns, with clear ownership."
                    />
                    <div className="concern">
                      <div className="row between">
                        <Badge tone="amber">Team-assigned priority</Badge>
                        <Badge
                          tone={
                            state.concerns.nausea === "Resolved"
                              ? "green"
                              : "amber"
                          }
                        >
                          {state.concerns.nausea}
                        </Badge>
                      </div>
                      <h3>Overnight nausea requires review</h3>
                      <p>
                        One episode documented. Bedside nurse requested
                        discussion during rounds; no urgency inferred by this
                        app.
                      </p>
                      <div className="micro">
                        Jamie Chen · Nursing handoff · Nov 6, 06:45
                      </div>
                      <div className="row">
                        <button
                          className="text-button"
                          onClick={() =>
                            mutate(
                              {
                                type: "concern",
                                id: "nausea",
                                status: "Acknowledged",
                              },
                              "Acknowledgment saved with history",
                            )
                          }
                        >
                          Acknowledge
                        </button>
                        <button
                          className="text-button"
                          onClick={() =>
                            mutate(
                              {
                                type: "concern",
                                id: "nausea",
                                status:
                                  state.concerns.nausea === "Resolved"
                                    ? "Open"
                                    : "Resolved",
                              },
                              "Concern status updated with history",
                            )
                          }
                        >
                          {state.concerns.nausea === "Resolved"
                            ? "Reopen"
                            : "Resolve"}
                        </button>
                      </div>
                    </div>
                    <div className="resolved-note">
                      <Check size={16} />
                      <div>
                        <strong>Transfer handoff confirmed</strong>
                        <small>Resolved · Jamie Chen · Nov 5, 14:20</small>
                      </div>
                    </div>
                    <details className="history">
                      <summary>
                        Change history ({state.concernHistory.length})
                      </summary>
                      {state.concernHistory.length ? (
                        state.concernHistory.map((h, i) => <p key={i}>{h}</p>)
                      ) : (
                        <p>No changes this session.</p>
                      )}
                    </details>
                  </section>
                )}
                <section className="card">
                  <SectionTitle
                    title="What’s new"
                    subtitle="Last three calendar days · Nov 4–6"
                  >
                    <select
                      aria-label="Filter recent updates"
                      value={newsFilter}
                      onChange={(e) => setNewsFilter(e.target.value)}
                    >
                      <option>All updates</option>
                      <option>Verified only</option>
                      <option>Needs follow-up</option>
                    </select>
                  </SectionTitle>
                  <div className="news-list">
                    {recentEvents()
                      .filter(
                        (e) =>
                          (!family || e.verified) &&
                          (newsFilter !== "Verified only" || e.verified) &&
                          (newsFilter !== "Needs follow-up" ||
                            state.actions.some(
                              (a) =>
                                a.eventId === e.id &&
                                a.status !== "Completed" &&
                                a.status !== "Archived",
                            )),
                      )
                      .map((e) => (
                        <button
                          className="news-item"
                          key={e.id}
                          onClick={() => setModal({ kind: "event", id: e.id })}
                        >
                          <span
                            className={`news-dot ${e.type === "Transfer" ? "mint" : ""}`}
                          />
                          <div>
                            <small>
                              {dateLabel(e.date)} · {e.time}
                            </small>
                            <strong>{family ? e.friendly : e.title}</strong>
                            <p>
                              {e.verified
                                ? e.summary.split(". ")[0]
                                : "Scheduled; results not yet available."}
                            </p>
                          </div>
                          <ChevronRight size={15} />
                        </button>
                      ))}
                  </div>
                </section>
              </div>
              <section className="card" id="clinical-questions">
                <SectionTitle
                  icon={<MessageCircle size={19} />}
                  title="A voice in the room"
                  subtitle="Family questions belong in the rounding conversation."
                >
                  <Badge tone="amber">{incompleteQuestions} to discuss</Badge>
                </SectionTitle>
                {questions(true)}
              </section>
              <section className="card shared-plan">
                <SectionTitle
                  title="Today’s shared plan"
                  subtitle="Only explicitly approved items appear in the family view."
                >
                  {!family && (
                    <button
                      className="button tiny secondary"
                      onClick={() => setModal({ kind: "priority" })}
                    >
                      <Plus size={15} />
                      Add priority
                    </button>
                  )}
                </SectionTitle>
                {state.priorities
                  .filter((p) => !family || p.approved)
                  .map((p) => (
                    <div key={p.id} className="plan-line">
                      <span>{p.time}</span>
                      <div>
                        <strong>{p.title}</strong>
                        <p>{p.detail}</p>
                      </div>
                      <Badge tone={p.approved ? "green" : "gray"}>
                        {p.approved ? "Approved for family" : "Internal draft"}
                      </Badge>
                      {p.approved && (
                        <small>
                          {p.viewed ? "Opened by family" : "Not yet opened"}
                        </small>
                      )}
                      {!family && (
                        <button
                          className="text-button"
                          onClick={() =>
                            setModal({ kind: "priority", id: p.id })
                          }
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  ))}
              </section>
              {!family && (
                <section className="card action-card" id="actions">
                  <SectionTitle
                    title="Actions & follow-ups"
                    subtitle="Every next step has an owner."
                  >
                    <button
                      className="button primary tiny"
                      onClick={() => setModal({ kind: "new-action" })}
                    >
                      <Plus size={16} />
                      Add action
                    </button>
                  </SectionTitle>
                  <div className="table-tools">
                    <div className="filter-tabs">
                      {[
                        "All actions",
                        "My actions",
                        "Open",
                        "Overdue",
                        "Archived",
                      ].map((f) => (
                        <button
                          key={f}
                          className={filter === f ? "selected" : ""}
                          onClick={() => setFilter(f)}
                        >
                          {f}
                          {f === "Overdue" && (
                            <span>
                              {
                                state.actions.filter(
                                  (a) => actionStatus(a) === "Overdue",
                                ).length
                              }
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <select
                      aria-label="Sort actions"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option>Newest first</option>
                      <option>Due date</option>
                    </select>
                  </div>
                  <p className="micro">
                    My actions = Jamie Chen, bedside nurse · {actionList.length}{" "}
                    records
                  </p>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          {[
                            "Date",
                            "Time",
                            "Questionnaire",
                            "Action",
                            "Owner",
                            "Follow-Up / Status",
                          ].map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {actionList.map((a) => (
                          <tr key={a.id}>
                            <td>{dateLabel(a.created)}</td>
                            <td>{a.created.slice(11, 16)}</td>
                            <td>
                              <button
                                className={`questionnaire-button ${a.questionnaire.length === 3 ? "done" : ""}`}
                                aria-label={`Questionnaire for ${a.title}`}
                                onClick={() =>
                                  setModal({ kind: "questionnaire", id: a.id })
                                }
                              >
                                <ClipboardCheck size={19} />
                                <small>
                                  {a.questionnaire.length === 3
                                    ? "Completed"
                                    : a.questionnaire.length
                                      ? "In progress"
                                      : "Not started"}
                                </small>
                              </button>
                            </td>
                            <td>
                              <button
                                className="table-action"
                                onClick={() =>
                                  setModal({ kind: "action", id: a.id })
                                }
                              >
                                {a.title}
                                <small>
                                  {a.category} · {a.priority} priority
                                </small>
                              </button>
                            </td>
                            <td>
                              <span className="owner-cell">
                                <Avatar
                                  name={a.owner
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((s) => s[0])
                                    .join("")}
                                  small
                                />
                                {a.owner.split(" · ")[0]}
                              </span>
                            </td>
                            <td>
                              <Badge
                                tone={
                                  actionStatus(a) === "Completed"
                                    ? "green"
                                    : actionStatus(a) === "Overdue"
                                      ? "rose"
                                      : "amber"
                                }
                              >
                                {actionStatus(a)}
                              </Badge>
                              <small className="due">
                                Due {dateLabel(a.due)}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!actionList.length && (
                      <div className="empty">
                        <Check size={25} />
                        <p>No actions in this view.</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
              {!family && (
                <button
                  className="capture-rounds"
                  onClick={() => setModal({ kind: "rounds" })}
                >
                  <span>
                    <ClipboardCheck size={21} />
                    <strong>Capture a decision while it’s fresh.</strong>
                    <small>One quick note. A clear next step.</small>
                  </span>
                  <span>
                    Record rounds <Plus size={18} />
                  </span>
                </button>
              )}
            </>
          ) : (
            <>
              <section className="hero">
                <div className="hero-content">
                  <div className="hero-pill">
                    <span className="status-dot" />
                    YOUR JOURNEY HOME
                  </div>
                  <h2>
                    Every little step,
                    <br />a little closer to home.
                  </h2>
                  <p>
                    You’ve come a long way, Oliver.
                    <br />
                    Let’s see what today has in store.
                  </p>
                  <button
                    className="hero-link"
                    onClick={() => setModal({ kind: "plan" })}
                  >
                    Explore today’s plan <ArrowRight size={17} />
                  </button>
                </div>
                <SkyArt />
                <div className="hero-caption">
                  <span>✦</span> Small steps count. Every single one.
                </div>
              </section>
              <section className="card journey-card" id="journey">
                <SectionTitle
                  title="Look how far you’ve come"
                  subtitle="Your care journey, one milestone at a time."
                >
                  <Badge tone="green">
                    <span className="status-dot" />
                    Making progress
                  </Badge>
                </SectionTitle>
                <div className="journey-track">
                  {[
                    {
                      id: "admit",
                      title: "Welcome aboard",
                      sub: "Nov 2 · Admitted",
                      done: true,
                      icon: <Home size={18} />,
                    },
                    {
                      id: "repair",
                      title: "Heart procedure",
                      sub: "Nov 3 · Completed",
                      done: true,
                      icon: <Heart size={18} />,
                    },
                    {
                      id: "transfer",
                      title: "Growing stronger",
                      sub: "You are here",
                      done: false,
                      icon: <Wind size={20} />,
                    },
                    {
                      id: "home",
                      title: "Homeward bound",
                      sub: `Est. ${dateLabel(state.discharge)}`,
                      done: false,
                      icon: <Home size={18} />,
                    },
                  ].map((m, i) => (
                    <button
                      className={`journey-stop ${m.done ? "complete" : ""} ${i === 2 ? "current" : ""}`}
                      key={m.id}
                      onClick={() => setModal({ kind: "milestone", id: m.id })}
                    >
                      <span className="journey-node">
                        {m.done ? <Check size={19} /> : m.icon}
                      </span>
                      <strong>{m.title}</strong>
                      <small>
                        {m.sub}
                        {i === 2 && <span className="tiny-dot" />}
                      </small>
                    </button>
                  ))}
                </div>
                <div className="journey-foot">
                  <Sparkles size={15} />
                  <span>Next up: pictures of your heart this afternoon.</span>
                  <span className="estimate-note">
                    <Info size={13} />
                    Home date is your care team’s estimate. Plans can change.
                  </span>
                </div>
              </section>
              <div className="patient-grid">
                <div className="patient-left">
                  <section className="card priorities-card">
                    <SectionTitle
                      icon={<Sun size={20} />}
                      title="A little plan for today"
                    >
                      <span className="micro">
                        {state.priorities.filter((p) => p.approved).length}{" "}
                        small steps, together
                      </span>
                    </SectionTitle>
                    <div className="priorities">
                      {state.priorities
                        .filter((p) => p.approved)
                        .map((p, i) => (
                          <button
                            key={p.id}
                            className="priority-item"
                            onClick={() =>
                              setModal({ kind: "priority-detail", id: p.id })
                            }
                          >
                            <span
                              className={`priority-icon ${["lilac", "peach", "mint"][i % 3]}`}
                            >
                              {i % 3 === 0 ? (
                                <Users size={21} />
                              ) : i % 3 === 1 ? (
                                <Wind size={21} />
                              ) : (
                                <Heart size={21} />
                              )}
                            </span>
                            <span className="priority-copy">
                              <strong>{p.title}</strong>
                              <small>{p.detail}</small>
                            </span>
                            <span
                              className={`priority-time ${p.id === "rounds" ? "past" : ""}`}
                            >
                              {p.id === "rounds" ? (
                                <>
                                  <Check size={13} />
                                  Visited
                                </>
                              ) : (
                                <>
                                  <Clock3 size={13} />
                                  {new Date(
                                    `${TODAY}T${p.time}`,
                                  ).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </>
                              )}
                            </span>
                            <ChevronRight size={15} />
                          </button>
                        ))}
                    </div>
                    <button
                      className="card-bottom-link"
                      onClick={() => setModal({ kind: "plan" })}
                    >
                      See our whole plan <ArrowRight size={15} />
                    </button>
                  </section>
                  <section className="card checklist-card">
                    <SectionTitle
                      icon={<ClipboardCheck size={20} />}
                      title="My little wins"
                    >
                      <Badge>{state.tasks.length}/4 little wins</Badge>
                    </SectionTitle>
                    <p className="section-description">
                      Your day, at your pace. Every little win counts.
                    </p>
                    <div className="checklist">
                      {[
                        {
                          id: "teeth",
                          title: "A fresh start",
                          sub: "Brush my teeth",
                          icon: "🪥",
                        },
                        {
                          id: "question",
                          title: "Let my curiosity fly",
                          sub: "Think of a question for my team",
                          icon: "💭",
                        },
                        {
                          id: "learn",
                          title: "Learn something new",
                          sub: "Explore a heart adventure",
                          icon: "📚",
                        },
                        {
                          id: "calm",
                          title: "Make a little space for me",
                          sub: "Draw, read, or take a quiet moment",
                          icon: "🌱",
                        },
                      ].map((t) => (
                        <button
                          key={t.id}
                          className={`check-item ${state.tasks.includes(t.id) ? "checked" : ""}`}
                          role="checkbox"
                          aria-checked={state.tasks.includes(t.id)}
                          onClick={() =>
                            mutate(
                              { type: "task", id: t.id },
                              state.tasks.includes(t.id)
                                ? "Little win unchecked"
                                : "One little win. You did that! ✨",
                            )
                          }
                        >
                          <span className="checkbox">
                            {state.tasks.includes(t.id) && <Check size={14} />}
                          </span>
                          <span>
                            <strong>{t.title}</strong>
                            <small>{t.sub}</small>
                          </span>
                          <span className="task-emoji">{t.icon}</span>
                        </button>
                      ))}
                    </div>
                    <div className="clinical-check">
                      <LockKeyhole size={14} />
                      <span>
                        Medicines and treatments are confirmed by your nurse.
                      </span>
                    </div>
                  </section>
                </div>
                <section className="card messages-card" id="messages">
                  <SectionTitle
                    icon={<MessageCircle size={20} />}
                    title="A note of encouragement"
                  >
                    <Heart size={17} className="heart-accent" />
                  </SectionTitle>
                  <div className="note-board">
                    {state.notes.map((n) => (
                      <div
                        className={`note ${n.personal ? "personal" : ""}`}
                        key={n.id}
                      >
                        <div className="row">
                          <Avatar
                            name={
                              n.personal
                                ? "OJ"
                                : n.author === "Jamie"
                                  ? "JC"
                                  : "MP"
                            }
                            tone={n.personal ? "peach" : "mint"}
                            small
                          />
                          <div>
                            <strong>{n.author}</strong>
                            <small>
                              {n.role} · {dateLabel(n.time)} ·{" "}
                              {new Date(n.time).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </small>
                          </div>
                          {n.personal && (
                            <button
                              className="text-button edit-note"
                              onClick={() =>
                                setModal({ kind: "note", id: n.id })
                              }
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        <p>{n.text}</p>
                        {n.history.length > 0 && (
                          <small className="micro">
                            Edited · {n.history.length} prior version(s)
                            retained
                          </small>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    className="text-button add-note"
                    onClick={() => setModal({ kind: "note" })}
                  >
                    <Plus size={15} />
                    Add a note of your own
                  </button>
                  <div className="ask-card">
                    <span className="ask-bubble">
                      <MessageCircle size={22} />
                    </span>
                    <h3>Little question? Big question?</h3>
                    <p>
                      Your voice is part of your care.
                      <br />
                      Write it down, and talk it through together.
                    </p>
                    <button
                      className="button primary"
                      onClick={() => setModal({ kind: "ask" })}
                    >
                      Ask my care team <ArrowRight size={16} />
                    </button>
                    <small>Demo inbox · Not monitored for care</small>
                  </div>
                  {questions()}
                </section>
              </div>
              <section className="learn-section" id="learn">
                <SectionTitle
                  icon={<Sparkles size={20} />}
                  title="A little discovery, a little fun"
                  subtitle="There’s more to your day than the hospital."
                >
                  <div className="stars-count">
                    <Star size={16} fill="currentColor" />
                    {state.stars} discovery stars
                  </div>
                </SectionTitle>
                <div className="discovery-grid">
                  <button
                    className="discovery-card heart-discovery"
                    onClick={() => setModal({ kind: "lesson", id: "heart" })}
                  >
                    <div className="discovery-art">
                      <Heart size={52} strokeWidth={1.5} />
                      <span className="orbit one">✦</span>
                      <span className="orbit two">+</span>
                      <span className="duration">
                        <BookOpen size={12} />2 min read
                      </span>
                    </div>
                    <div>
                      <Badge>LEARN SOMETHING</Badge>
                      <h3>Your amazing heart</h3>
                      <p>Meet the little engine inside you.</p>
                      <span className="discovery-arrow">
                        <ArrowRight size={17} />
                      </span>
                    </div>
                  </button>
                  <button
                    className="discovery-card sky-discovery"
                    onClick={() => setModal({ kind: "game" })}
                  >
                    <div className="discovery-art">
                      <Plane size={57} strokeWidth={1.4} />
                      <span className="orbit one">☁</span>
                      <span className="orbit two">✦</span>
                      <span className="duration">A little brain break</span>
                    </div>
                    <div>
                      <Badge tone="blue">TAKE A PLAY BREAK</Badge>
                      <h3>Sky explorers</h3>
                      <p>Find a match. Take a little flight.</p>
                      <span className="discovery-arrow">
                        <ArrowRight size={17} />
                      </span>
                    </div>
                  </button>
                  <button
                    className="discovery-card quest-discovery"
                    onClick={() => setModal({ kind: "quest" })}
                  >
                    <div className="discovery-art">
                      <Trophy size={52} strokeWidth={1.5} />
                      <Star className="orbit one" size={20} />
                      <span className="orbit two">✧</span>
                      <span className="duration">Earn 3 discovery stars</span>
                    </div>
                    <div>
                      <Badge tone="amber">YOUR DAILY QUEST</Badge>
                      <h3>Meet your care crew</h3>
                      <p>A small challenge. A new discovery.</p>
                      <span className="discovery-arrow">
                        <ArrowRight size={17} />
                      </span>
                    </div>
                  </button>
                </div>
                <div className="entertainment-row">
                  <span>
                    <Cloud size={18} />
                    In the mood for a quiet story?
                  </span>
                  <button
                    className="text-button"
                    onClick={() => setModal({ kind: "movies" })}
                  >
                    Browse the cloud cinema <ArrowRight size={14} />
                  </button>
                  <button
                    className="text-button muted"
                    aria-pressed={quiet}
                    onClick={() => setQuiet(!quiet)}
                  >
                    {quiet ? "Turn on sky animations" : "Quiet mode"}
                  </button>
                </div>
              </section>
              <section className="care-team-strip" id="team">
                <div className="avatar-stack">
                  <Avatar name="MP" />
                  <Avatar name="JC" tone="mint" />
                  <Avatar name="AR" tone="peach" />
                </div>
                <div>
                  <strong>Your crew, always in your corner.</strong>
                  <p>Get to know the people helping you along the way.</p>
                </div>
                <button
                  className="button secondary tiny"
                  onClick={() => setModal({ kind: "team" })}
                >
                  Meet my care team <ArrowRight size={15} />
                </button>
              </section>
            </>
          )}
          <footer>
            <span>
              <Navigation size={14} />
              Made for small steps and brighter days.
            </span>
            <span>
              FlightPlan prototype · All patient information is fictional ·
              Local demo only
              <button onClick={() => setModal({ kind: "reset" })}>
                Reset demo
              </button>
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {modal && (
        <Dialog
          title={
            modal.kind === "access"
              ? "A workspace for your care team"
              : modal.kind === "help"
                ? "A little help, right here"
                : modal.kind === "ask"
                  ? "What’s on your mind?"
                  : modal.kind === "answer"
                    ? "Make room for a question"
                    : modal.kind === "action" || modal.kind === "new-action"
                      ? "A clear next step"
                      : modal.kind === "questionnaire"
                        ? "A moment to check in"
                        : modal.kind === "rounds"
                          ? "Capture the conversation"
                          : modal.kind === "priority"
                            ? "Add to the shared plan"
                            : modal.kind === "game"
                              ? "Sky explorers"
                              : modal.kind === "quest"
                                ? "Meet your care crew"
                                : modal.kind === "team"
                                  ? "Your care crew"
                                  : modal.kind === "discharge"
                                    ? "Update the estimated home date"
                                    : modal.kind === "note"
                                      ? "Your space to write"
                                      : modal.kind === "reset"
                                        ? "Start a fresh adventure?"
                                        : modal.kind === "movies"
                                          ? "Cloud cinema"
                                          : modal.kind === "lesson"
                                            ? "A little discovery"
                                            : modal.kind === "about"
                                              ? "A better bedside conversation"
                                              : modal.kind === "updates"
                                                ? "Your latest updates"
                                                : "One step at a time"
          }
          close={close}
          wide={["action", "event", "rounds"].includes(modal.kind)}
        >
          {modal.kind === "access" && (
            <>
              <div className="modal-illustration lilac">
                <Stethoscope size={42} />
              </div>
              <p>
                The clinical workspace contains a more detailed care timeline,
                internal notes, and rounding actions.
              </p>
              <div className="notice">
                <LockKeyhole size={18} />
                Demonstration access only. This role selector is not
                authentication or a security boundary.
              </div>
              <label className="field">
                Continue as
                <select id="demo-role">
                  <option>Dr. Maya Patel · Physician</option>
                </select>
              </label>
              <button
                className="button primary full"
                onClick={() => {
                  setClinical(true);
                  setNav("Rounds overview");
                  close();
                  window.scrollTo(0, 0);
                }}
              >
                Enter clinical demo <ArrowRight size={16} />
              </button>
            </>
          )}
          {modal.kind === "help" && (
            <>
              <p>
                Need support? In the hospital, use your{" "}
                <strong>bedside nurse call button</strong> to contact your care
                team.
              </p>
              <div className="urgent-help">
                <Bell size={23} />
                <div>
                  <strong>Need urgent help?</strong>
                  <p>
                    Use the hospital’s actual call system or alert a staff
                    member now. This dashboard cannot summon help.
                  </p>
                </div>
              </div>
              <div className="demo-help">
                <Badge tone="amber">SIMULATION ONLY</Badge>
                <h3>
                  {help
                    ? "Demo request received"
                    : "Try the demo assistance flow"}
                </h3>
                <p>
                  {help
                    ? "This is a simulated acknowledgment. No nurse or emergency team has been contacted. Please use your actual bedside call button for care."
                    : "Preview what a nonurgent assistance request could look like."}
                </p>
                {!help && (
                  <button
                    className="button primary"
                    onClick={() => setHelp(true)}
                  >
                    Simulate a comfort request <ArrowRight size={16} />
                  </button>
                )}
                {help && (
                  <Badge tone="green">
                    <Check size={14} />
                    Simulated acknowledgment
                  </Badge>
                )}
              </div>
            </>
          )}
          {(modal.kind === "ask" || modal.kind === "note") && (
            <form
              onSubmit={(e) =>
                submit(e, (f) => {
                  mutate(
                    modal.kind === "ask"
                      ? { type: "ask", text: get(f, "text") }
                      : { type: "note", text: get(f, "text"), id: modal.id },
                    modal.kind === "ask"
                      ? "Your question is ready for the next care conversation"
                      : "Your note is saved",
                  );
                  close();
                })
              }
            >
              <p>
                {modal.kind === "ask"
                  ? "For Oliver or family: what would you like to talk about at the next visit?"
                  : "A thought, a feeling, or a little something you want to remember."}
              </p>
              <label className="field">
                {modal.kind === "ask" ? "My question" : "My note"}
                <textarea
                  name="text"
                  required
                  maxLength={1000}
                  autoFocus
                  rows={4}
                  defaultValue={
                    modal.id
                      ? state.notes.find((n) => n.id === modal.id)?.text
                      : ""
                  }
                  placeholder={
                    modal.kind === "ask"
                      ? "Can I go to the playroom today?"
                      : "Today I’m feeling…"
                  }
                />
              </label>
              <div className="notice">
                <Info size={17} />
                Saved locally in this demo. Messages are not monitored. For care
                needs, use the actual nurse call system.
              </div>
              {primary(
                modal.kind === "ask" ? "Save my question" : "Save my note",
              )}
            </form>
          )}
          {modal.kind === "answer" && (
            <form
              onSubmit={(e) =>
                submit(e, (f) => {
                  mutate(
                    { type: "answer", id: modal.id!, text: get(f, "text") },
                    "Response shared with Oliver & family",
                  );
                  close();
                })
              }
            >
              <blockquote>
                {state.questions.find((q) => q.id === modal.id)?.text}
              </blockquote>
              <label className="field">
                Your family-facing response
                <textarea
                  name="text"
                  required
                  rows={4}
                  placeholder="Write a supportive, plain-language response…"
                  maxLength={1000}
                />
              </label>
              <p className="micro">
                Shared as Dr. Patel · Cardiologist · Explicitly patient-facing
              </p>
              {primary("Share response")}
            </form>
          )}
          {["milestone", "event"].includes(modal.kind) &&
            (() => {
              const ev = events.find((e) => e.id === modal.id)!;
              return (
                <>
                  <Badge tone={ev.verified ? "green" : "amber"}>
                    {ev.verified
                      ? "Team verified"
                      : ev.type === "Estimate"
                        ? "Tentative estimate"
                        : "Scheduled · Not completed"}
                  </Badge>
                  <h3 className="modal-event-title">
                    {clinical && !family ? ev.title : ev.friendly}
                  </h3>
                  <div className="event-meta">
                    <span>
                      <CalendarDays size={16} />
                      {dateLabel(
                        ev.id === "home" ? state.discharge : ev.date,
                      )}, {ev.time}
                    </span>
                    <span>
                      <Users size={16} />
                      {ev.team}
                    </span>
                  </div>
                  <p>
                    {clinical && !family
                      ? ev.summary
                      : ev.id === "repair"
                        ? "Your heart procedure is complete. You’ve already taken a big step on your journey."
                        : ev.id === "transfer"
                          ? "You’ve moved to a new room where your team will help you keep growing stronger."
                          : ev.id === "admit"
                            ? "Your care crew welcomed you and your family. You don’t have to do this alone."
                            : ev.id === "home"
                              ? "Your team has entered an estimated home date. It can change as your team reviews how you’re doing. It is not a promise or a prediction."
                              : ev.id === "echo"
                                ? "An ultrasound uses a small camera called a probe to make moving pictures of your heart. Your team will explain what to expect."
                                : "A little milestone worth celebrating, together."}
                  </p>
                  {ev.verified && !clinical && (
                    <div className="milestone-celebration">
                      <Sparkles size={23} />
                      Look how far you’ve come!
                    </div>
                  )}
                  {clinical && !family && (
                    <>
                      <details className="results">
                        <summary>
                          Results & technical detail <ChevronDown size={17} />
                        </summary>
                        <p>{ev.results}</p>
                      </details>
                      <div className="notice">
                        <ClipboardCheck size={18} />
                        {ev.followup}
                      </div>
                      {state.eventNotes[ev.id]?.map((n, i) => (
                        <p className="event-note" key={i}>
                          {n}
                        </p>
                      ))}
                      <form
                        onSubmit={(e) =>
                          submit(e, (f) => {
                            mutate(
                              {
                                type: "event-note",
                                id: ev.id,
                                text: get(f, "text"),
                              },
                              "Event note appended to history",
                            );
                            e.currentTarget.reset();
                          })
                        }
                      >
                        <label className="field">
                          Append a clinician-only note
                          <textarea
                            name="text"
                            required
                            rows={2}
                            maxLength={1000}
                          />
                        </label>
                        <button className="button secondary tiny" type="submit">
                          <Plus size={15} />
                          Append note
                        </button>
                      </form>
                      <button
                        className="button primary full"
                        onClick={() =>
                          setModal({ kind: "new-action", id: ev.id })
                        }
                      >
                        Create linked follow-up <ArrowRight size={16} />
                      </button>
                    </>
                  )}
                </>
              );
            })()}
          {(modal.kind === "plan" || modal.kind === "priority-detail") && (
            <>
              <p>
                Your team’s approved plan. It’s okay to ask questions along the
                way.
              </p>
              {state.priorities
                .filter(
                  (p) =>
                    p.approved &&
                    (modal.kind !== "priority-detail" || p.id === modal.id),
                )
                .map((p) => (
                  <div className="plan-preview" key={p.id}>
                    <Badge>{p.time}</Badge>
                    <h3>{p.title}</h3>
                    <p>{p.detail}</p>
                  </div>
                ))}
              <div className="notice">
                <Info size={17} />
                Times can change. Your bedside team will confirm the schedule.
              </div>
              <div className="dialog-actions">
                <button
                  className="button secondary"
                  onClick={() => {
                    mutate(
                      { type: "view-plan" },
                      "Plan marked as opened, without implying understanding or consent",
                    );
                    close();
                  }}
                >
                  I’ve opened the plan <Check size={16} />
                </button>
                <button
                  className="button primary"
                  onClick={() => setModal({ kind: "ask" })}
                >
                  I have a question <MessageCircle size={16} />
                </button>
              </div>
            </>
          )}
          {modal.kind === "priority" && (
            <form
              onSubmit={(e) =>
                submit(e, (f) => {
                  mutate(
                    {
                      type: "priority",
                      id: modal.id,
                      title: get(f, "title"),
                      detail: get(f, "detail"),
                      time: get(f, "time"),
                      approved: f.get("approved") === "on",
                    },
                    "Priority saved to the shared data model",
                  );
                  close();
                })
              }
            >
              <label className="field">
                Plain-language title
                <input
                  name="title"
                  required
                  maxLength={100}
                  defaultValue={
                    state.priorities.find((p) => p.id === modal.id)?.title
                  }
                />
              </label>
              <label className="field">
                What should the family know?
                <textarea
                  name="detail"
                  required
                  rows={3}
                  maxLength={500}
                  defaultValue={
                    state.priorities.find((p) => p.id === modal.id)?.detail
                  }
                />
              </label>
              <label className="field">
                Time
                <input
                  name="time"
                  type="time"
                  required
                  defaultValue={
                    state.priorities.find((p) => p.id === modal.id)?.time ||
                    "15:00"
                  }
                />
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  name="approved"
                  defaultChecked={
                    state.priorities.find((p) => p.id === modal.id)?.approved ||
                    false
                  }
                />
                I approve this information for the patient & family view
              </label>
              {primary("Save priority")}
            </form>
          )}
          {(modal.kind === "action" ||
            modal.kind === "new-action" ||
            modal.kind === "rounds") &&
            (() => {
              const a =
                modal.kind === "action"
                  ? state.actions.find((a) => a.id === modal.id)
                  : undefined;
              return (
                <form
                  onSubmit={(e) =>
                    submit(e, (f) => {
                      const isRound = modal.kind === "rounds";
                      if (
                        a &&
                        get(f, "status") === "Archived" &&
                        a.status !== "Archived"
                      ) {
                        setModal({ kind: "archive", id: a.id });
                        return;
                      }
                      mutate(
                        {
                          type: "action",
                          action: {
                            id: a?.id || crypto.randomUUID(),
                            title: get(f, "title"),
                            owner: get(f, "owner"),
                            due: get(f, "due"),
                            status: get(f, "status") as Status,
                            priority: get(f, "priority"),
                            category: get(f, "category"),
                            eventId: get(f, "eventId"),
                            notes: get(f, "notes"),
                            created: a?.created || `${TODAY}T10:30`,
                            questionnaire: a?.questionnaire || [],
                            history: a?.history || [],
                          },
                        },
                        isRound
                          ? "Rounds decision captured and assigned"
                          : "Action saved across the clinical workspace",
                      );
                      if (isRound && f.get("share") === "on")
                        dispatch({
                          type: "note",
                          clinical: true,
                          text: get(f, "shared"),
                        });
                      close();
                    })
                  }
                >
                  <label className="field">
                    {modal.kind === "rounds"
                      ? "Decision / next step"
                      : "Action"}
                    <input
                      name="title"
                      required
                      maxLength={180}
                      defaultValue={a?.title}
                      placeholder="What needs to happen next?"
                    />
                  </label>
                  <div className="form-grid">
                    <label className="field">
                      Owner
                      <select name="owner" defaultValue={a?.owner}>
                        {team.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Follow-up date
                      <input
                        name="due"
                        type="date"
                        required
                        defaultValue={a?.due || TODAY}
                      />
                    </label>
                    <label className="field">
                      Status
                      <select name="status" defaultValue={a?.status || "Open"}>
                        {[
                          "Open",
                          "In Progress",
                          "Awaiting Follow-Up",
                          "Completed",
                          "Archived",
                        ].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Priority
                      <select
                        name="priority"
                        defaultValue={a?.priority || "Routine"}
                      >
                        <option>Routine</option>
                        <option>High</option>
                      </select>
                    </label>
                    <label className="field">
                      Category
                      <select
                        name="category"
                        defaultValue={a?.category || "Follow-up"}
                      >
                        {[
                          "Follow-up",
                          "Decision",
                          "Pending question",
                          "Consultation",
                          "Family update",
                          "Contingency plan",
                        ].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Linked timeline event
                      <select
                        name="eventId"
                        defaultValue={a?.eventId || modal.id || ""}
                      >
                        <option value="">None</option>
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="field">
                    Internal notes
                    <textarea
                      name="notes"
                      rows={2}
                      defaultValue={a?.notes}
                      maxLength={2000}
                    />
                  </label>
                  {modal.kind === "rounds" && (
                    <>
                      <label className="field">
                        Optional plain-language family update
                        <textarea name="shared" rows={2} maxLength={1000} />
                      </label>
                      <label className="check-label">
                        <input type="checkbox" name="share" />
                        Explicitly approve and share this update with family
                      </label>
                    </>
                  )}
                  {a && (
                    <details className="history">
                      <summary>Change history ({a.history.length})</summary>
                      {a.history.map((h, i) => (
                        <p key={i}>{h}</p>
                      ))}
                    </details>
                  )}
                  <div className="dialog-actions">
                    {primary(a ? "Save changes" : "Save & assign")}
                    {a && a.status !== "Completed" && (
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => {
                          mutate(
                            {
                              type: "action",
                              action: { ...a, status: "Completed" },
                            },
                            "Action completed; active timeline follow-up removed",
                          );
                          close();
                        }}
                      >
                        <Check size={16} />
                        Complete
                      </button>
                    )}
                    {a && a.status !== "Archived" && (
                      <button
                        type="button"
                        className="text-button muted"
                        onClick={() => setModal({ kind: "archive", id: a.id })}
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </form>
              );
            })()}
          {modal.kind === "followups" && (
            <>
              <p>
                Current and upcoming follow-ups for {dateLabel(modal.id!)}. Open
                an item to see its source event, owner, and history.
              </p>
              {visibleFollowups(state.actions)
                .filter((a) => a.due === modal.id)
                .map((a) => (
                  <button
                    className="story-card"
                    key={a.id}
                    onClick={() => setModal({ kind: "action", id: a.id })}
                  >
                    <ClipboardCheck size={21} />
                    <span>
                      <strong>{a.title}</strong>
                      <small>
                        {a.owner} · {a.status}
                      </small>
                    </span>
                    <ChevronRight size={16} />
                  </button>
                ))}
            </>
          )}
          {modal.kind === "archive" && (
            <>
              <p>
                Archive this action? Its notes, ownership, and history will
                remain available in the Archived filter.
              </p>
              <button
                className="button primary"
                onClick={() => {
                  const a = state.actions.find((a) => a.id === modal.id)!;
                  mutate(
                    { type: "action", action: { ...a, status: "Archived" } },
                    "Action archived; history preserved",
                  );
                  close();
                }}
              >
                Confirm archive
              </button>
            </>
          )}
          {modal.kind === "questionnaire" &&
            (() => {
              const a = state.actions.find((a) => a.id === modal.id)!;
              return (
                <form
                  onSubmit={(e) =>
                    submit(e, (f) => {
                      mutate(
                        {
                          type: "action",
                          action: {
                            ...a,
                            questionnaire: f.getAll("answers").map(String),
                          },
                        },
                        "Questionnaire saved",
                      );
                      close();
                    })
                  }
                >
                  <p>
                    <strong>{a.title}</strong>
                  </p>
                  <p>
                    Record the discussion. These checks are not proof of
                    clinical comprehension or informed consent.
                  </p>
                  {[
                    "Family invited to share questions",
                    "Plan explained in plain language",
                    "Outstanding questions and follow-up recorded",
                  ].map((q, i) => (
                    <label className="questionnaire-check" key={q}>
                      <input
                        type="checkbox"
                        name="answers"
                        value={String(i)}
                        defaultChecked={a.questionnaire.includes(String(i))}
                      />
                      <span>{q}</span>
                    </label>
                  ))}
                  <p className="micro">
                    Save partial progress at any time. 3 checks = completed
                    questionnaire.
                  </p>
                  {primary("Save check-in")}
                </form>
              );
            })()}
          {modal.kind === "team" && (
            <>
              <p>Different superpowers. One team, here for you.</p>
              {team.map((t, i) => (
                <div className="team-person" key={t}>
                  <Avatar
                    name={["MP", "JC", "AR", "SW"][i]}
                    tone={["purple", "mint", "peach", "blue"][i]}
                  />
                  <div>
                    <h3>{t.split(" · ")[0]}</h3>
                    <small>{t.split(" · ")[1]}</small>
                    <p>
                      {
                        [
                          "Helps your family understand your heart care.",
                          "Your go-to person for everyday care and comfort.",
                          "Helps make movement part of your recovery plan.",
                          "Helps your family prepare for the next chapter.",
                        ][i]
                      }
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
          {modal.kind === "lesson" && (
            <>
              <div className="modal-illustration peach">
                <Heart size={54} />
              </div>
              <Badge tone="amber">
                GENERAL EDUCATION · NOT PERSONAL MEDICAL ADVICE
              </Badge>
              <h3>
                {modal.id === "ultrasound"
                  ? "Making pictures with sound"
                  : "Your heart: a little engine with a big job"}
              </h3>
              <p>
                {modal.id === "ultrasound"
                  ? "An ultrasound uses sound waves to make pictures. A team member moves a small probe over gel on your skin. Your own care team can explain what your test involves."
                  : "Your heart is a muscle that pumps blood around your body. Blood carries oxygen and nutrients to help your body do its everyday work."}
              </p>
              <p>
                Your heart has four chambers. They work together, a little like
                rooms connected by special doors. Your care team is here to help
                you understand your own heart story.
              </p>
              <div className="lesson-links">
                <button
                  className="text-button"
                  onClick={() =>
                    setModal({
                      kind: "lesson",
                      id: modal.id === "ultrasound" ? "heart" : "ultrasound",
                    })
                  }
                >
                  {modal.id === "ultrasound"
                    ? "Read about your amazing heart"
                    : "What happens during an ultrasound?"}
                  <ArrowRight size={15} />
                </button>
              </div>
              <h3>A tiny discovery check</h3>
              <p>What is your heart’s main job?</p>
              <div className="quiz-options">
                {[
                  "Pump blood around your body",
                  "Help you hear sounds",
                  "Make your bones longer",
                ].map((a, i) => (
                  <button
                    key={a}
                    className={`quiz-option ${quiz === i ? "chosen" : ""}`}
                    onClick={() => {
                      setQuiz(i);
                      if (i === 0)
                        mutate(
                          { type: "reward", badge: "Heart explorer" },
                          "Heart explorer badge earned! +3 stars",
                        );
                    }}
                  >
                    {a}
                    {quiz === i &&
                      (i === 0 ? (
                        <Check size={17} />
                      ) : (
                        <CircleHelp size={17} />
                      ))}
                  </button>
                ))}
              </div>
              {quiz !== null && (
                <p className="quiz-feedback">
                  {quiz === 0
                    ? "That’s it! You’re a heart explorer. ✨"
                    : "Good exploring! Read the first paragraph and try again."}
                </p>
              )}
            </>
          )}
          {modal.kind === "quest" && (
            <>
              <div className="modal-illustration amber">
                <Trophy size={50} />
              </div>
              <Badge tone="amber">VOLUNTARY LEARNING · +3 STARS</Badge>
              <p>
                Who is your go-to person for everyday care and comfort in your
                hospital room?
              </p>
              <div className="quiz-options">
                {[
                  "Your bedside nurse",
                  "The airplane pilot",
                  "The cloud captain",
                ].map((q, i) => (
                  <button
                    key={q}
                    className={`quiz-option ${quiz === i ? "chosen" : ""}`}
                    onClick={() => {
                      setQuiz(i);
                      if (i === 0)
                        mutate(
                          { type: "reward", badge: "Care crew explorer" },
                          "Care crew explorer badge earned! +3 stars",
                        );
                    }}
                  >
                    {q}
                    {quiz === i && i === 0 && <Check size={17} />}
                  </button>
                ))}
              </div>
              {quiz !== null && (
                <p className="quiz-feedback">
                  {quiz === 0
                    ? "You found your everyday care hero! Your nurse is part of your crew."
                    : "A creative guess! Think about the person who checks in with you in your room."}
                </p>
              )}
              {state.badges.includes("Care crew explorer") && (
                <div className="milestone-celebration">
                  <Star size={21} />
                  Care crew explorer badge collected
                </div>
              )}
            </>
          )}
          {modal.kind === "game" && (
            <>
              <p>Turn over two sky cards. Can you find all four pairs?</p>
              <div className="memory-grid">
                {Array.from({ length: 8 }, (_, i) => (
                  <button
                    key={i}
                    className={`memory-card ${matched.includes(i) ? "matched" : ""} ${flips.includes(i) ? "flipped" : ""}`}
                    aria-label={
                      matched.includes(i) || flips.includes(i)
                        ? ["Sun", "Plane", "Star", "Cloud"][i % 4]
                        : `Reveal card ${i + 1}`
                    }
                    disabled={
                      matched.includes(i) ||
                      flips.includes(i) ||
                      flips.length === 2
                    }
                    onClick={() => setFlips([...flips, i])}
                  >
                    {matched.includes(i) || flips.includes(i) ? (
                      ["☀️", "✈️", "⭐", "☁️"][i % 4]
                    ) : (
                      <Cloud size={28} />
                    )}
                  </button>
                ))}
              </div>
              <p className="micro">
                {matched.length / 2} of 4 pairs found · No timer, no rush.
              </p>
              {matched.length === 8 && (
                <div className="milestone-celebration">
                  <Sparkles />
                  You explored the whole sky!
                </div>
              )}
              <button
                className="button secondary"
                onClick={() => {
                  setFlips([]);
                  setMatched([]);
                }}
              >
                Play again
              </button>
            </>
          )}
          {modal.kind === "movies" && (
            <>
              <Badge tone="amber">
                DEMO STORY LIBRARY · NO LICENSED MOVIES
              </Badge>
              <p>Choose a short, illustrated reading break.</p>
              {[
                "The cloud that found its way",
                "A very small, very brave airplane",
              ].map((t, i) => (
                <button
                  className="story-card"
                  key={t}
                  onClick={() => setModal({ kind: "story", id: String(i) })}
                >
                  {i === 0 ? <Cloud size={30} /> : <Plane size={30} />}
                  <span>
                    <strong>{t}</strong>
                    <small>Original demo story · 1 minute read</small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              ))}
            </>
          )}
          {modal.kind === "story" && (
            <>
              <SkyArt compact />
              <h3>
                {modal.id === "0"
                  ? "The cloud that found its way"
                  : "A very small, very brave airplane"}
              </h3>
              <p>
                {modal.id === "0"
                  ? "A little cloud woke up far from the other clouds. “I have to find my way all at once,” it thought. But the wind whispered, “Just one little drift.” So it drifted over a hill, then a house, then a quiet garden. With every small drift, the sky felt a little more familiar. And just around the next hill, its friends were waiting."
                  : "Pip was the smallest airplane at the airfield. One morning, the runway looked very long. “What if I can’t?” Pip asked. “Then we’ll try together,” said the tower. Pip rolled a little. Then a little more. The wind lifted its wings, and the whole sky opened up. Pip learned that brave doesn’t mean doing it alone."}
              </p>
              <button
                className="button secondary"
                onClick={() => setModal({ kind: "movies" })}
              >
                <ArrowLeft size={16} />
                Back to stories
              </button>
            </>
          )}
          {modal.kind === "discharge" && (
            <form
              onSubmit={(e) =>
                submit(e, (f) => {
                  mutate(
                    { type: "discharge", date: get(f, "date") },
                    "Clinician-entered estimate updated in both views",
                  );
                  close();
                })
              }
            >
              <p>
                A team-entered estimate, not a medical prediction or guarantee.
                Review with the family when plans change.
              </p>
              <label className="field">
                Estimated discharge date
                <input
                  type="date"
                  name="date"
                  required
                  min={TODAY}
                  max="2026-12-02"
                  defaultValue={state.discharge}
                />
              </label>
              {primary("Update estimate")}
            </form>
          )}
          {modal.kind === "updates" && (
            <>
              {state.questions
                .filter((q) => q.status === "Answered")
                .map((q) => (
                  <div className="question" key={q.id}>
                    <Badge tone="green">Answered</Badge>
                    <p>{q.text}</p>
                    <p>{q.answer}</p>
                  </div>
                ))}
              <div className="notice">
                <Sun size={18} />
                Today’s plan is ready. Your care team visit is at 9:00, a
                supported walk at 11:00, and heart pictures at 2:00.
              </div>
              <p className="micro">
                All updates are fictional demo data, not live hospital
                notifications.
              </p>
            </>
          )}
          {modal.kind === "about" && (
            <>
              <div className="modal-illustration lilac">
                <Navigation size={45} />
              </div>
              <p>
                FlightPlan helps children, families, and clinicians share the
                same journey—with a view that makes sense for each of them.
              </p>
              <p>
                This independent hackathon prototype uses entirely fictional
                patient data. It is inspired by pediatric bedside care and is
                not an official Cincinnati Children’s service.
              </p>
              <div className="notice">
                <Info size={18} />
                Fixed demo date: November 6, 2026. Changes are stored in this
                browser only. There is no EHR integration, real messaging,
                clinical decision support, or production authentication.
              </div>
              <p>
                Stars celebrate curiosity and voluntary discovery. Treatment
                completion is always a clinical responsibility.
              </p>
            </>
          )}
          {modal.kind === "reset" && (
            <>
              <p>
                This clears your locally saved questions, notes, actions, and
                discoveries and restores the fictional starting data.
              </p>
              <div className="dialog-actions">
                <button className="button secondary" onClick={close}>
                  Keep my progress
                </button>
                <button
                  className="button primary"
                  onClick={() => {
                    mutate({ type: "reset" }, "A fresh adventure is ready");
                    close();
                  }}
                >
                  Reset demo
                </button>
              </div>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}
