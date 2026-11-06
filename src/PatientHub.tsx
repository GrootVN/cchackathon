import { useState } from "react";
import { Star, Check, BookOpen, LockKeyhole } from "lucide-react";
import { familyOwners, rewards, dateLabel } from "./model";
import type { State, Mutation } from "./model";

export function StarShop({
  state,
  mutate,
}: {
  state: State;
  mutate: (m: Mutation, message?: string) => void;
}) {
  return (
    <div className="star-shop">
      <div className="star-balance">
        <Star size={32} />
        <strong>{state.stars}</strong>
        <span>discovery stars to spend</span>
      </div>
      <p>
        Earn stars by exploring and learning. Exchange them for a little treat.
      </p>
      <p className="notice">
        Demo exchanges happen instantly. No real item is ordered or delivered.
        Real food treats require your care team’s dietary approval; toys must be
        age-appropriate.
      </p>
      <div className="reward-grid">
        {rewards.map((r) => (
          <article className="reward-card" key={r.id}>
            <span className="reward-art">{r.icon}</span>
            <h3>{r.title}</h3>
            <p>{r.cost} stars</p>
            <button
              className="button primary"
              disabled={state.stars < r.cost}
              onClick={() =>
                mutate(
                  { type: "redeem", rewardId: r.id },
                  `${r.title} exchanged! Demo only.`,
                )
              }
            >
              {state.stars < r.cost
                ? "Keep discovering"
                : `Exchange ${r.cost} stars`}
            </button>
          </article>
        ))}
      </div>
      <h3>My exchanges</h3>
      {!state.redemptions?.length ? (
        <p>No exchanges yet. Your next discovery could get you there.</p>
      ) : (
        state.redemptions.map((r) => (
          <div className="plan-line" key={r.id}>
            <Check size={18} />
            <strong>{r.title}</strong>
            <span>
              {r.cost} stars · {dateLabel(r.time)} · Exchanged in demo
            </span>
          </div>
        ))
      )}
    </div>
  );
}
export function FamilyAssignments({
  state,
  mutate,
}: {
  state: State;
  mutate: (m: Mutation, message?: string) => void;
}) {
  const items = state.actions.filter(
    (a) => familyOwners.includes(a.owner) && a.status !== "Archived",
  );
  return (
    <section className="card">
      <h2>Our shared next steps</h2>
      <p>Actions your care team has assigned to you or your guardian.</p>
      {!items.length ? (
        <p className="empty">
          Nothing assigned right now. Your team’s next steps will appear here.
        </p>
      ) : (
        items.map((a) => (
          <div className="family-assignment" key={a.id}>
            <div>
              <strong>{a.title}</strong>
              <p>
                {a.owner} · Due {dateLabel(a.due)}
              </p>
              <span className="badge purple">{a.status}</span>
            </div>
            {a.medical === false ? (
              <button
                className="button secondary"
                aria-pressed={a.status === "Completed"}
                onClick={() =>
                  mutate(
                    { type: "complete-personal", target: "action", id: a.id },
                    "Nonmedical task updated",
                  )
                }
              >
                {a.status === "Completed" ? "Undo completion" : "Mark done"}
                <Check size={16} />
              </button>
            ) : (
              <span className="medical-label">
                <LockKeyhole size={15} />
                Care-team confirmation
              </span>
            )}
          </div>
        ))
      )}
    </section>
  );
}
export function ConditionGuide({ ask }: { ask: () => void }) {
  const [topic, setTopic] = useState("Understanding VSD");
  const [question, setQuestion] = useState("");
  const [preview, setPreview] = useState(false);
  const copy: Record<string, string[]> = {
    "Understanding VSD": [
      "Your heart has four chambers. A ventricular septal defect (VSD) is an opening in the wall between the two lower chambers.",
      "Oliver’s fictional care journey includes a surgical repair. Your own care team can explain the details of your diagnosis and procedure.",
    ],
    "Tests & procedures": [
      "An echocardiogram uses sound waves to make moving pictures of the heart. The care team explains what the test involves and discusses its results.",
      "A scheduled test is different from a completed test. Ask your team about timing and what happens next.",
    ],
    "Recovery & going home": [
      "The shared timeline shows completed milestones and upcoming plans. The home date is an estimate entered by the care team and may change.",
      "Before going home, ask your team to explain your individual plan, follow-up appointments, and who to contact with questions.",
    ],
  };
  return (
    <section className="condition-guide">
      <div className="notice">
        <BookOpen size={20} />
        For patients and guardians · General education, not individualized
        medical advice.
      </div>
      <div className="filter-tabs" role="tablist" aria-label="Condition topics">
        {Object.keys(copy).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={topic === t}
            className={topic === t ? "selected" : ""}
            onClick={() => setTopic(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <article className="education-reading" role="tabpanel">
        <h2>{topic}</h2>
        {copy[topic].map((p) => (
          <p key={p}>{p}</p>
        ))}
        <button className="button secondary" onClick={ask}>
          Ask my care team about this
        </button>
      </article>
      <div className="ai-placeholder">
        <span className="badge purple">
          COMING LATER · AI INTEGRATION PLACEHOLDER
        </span>
        <h3>A guide for your questions</h3>
        <p>
          A future assistant could help explain approved educational material in
          language that fits your family. No AI service is connected, and no
          data is sent.
        </p>
        <label className="field">
          Try a question
          <input
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setPreview(false);
            }}
            placeholder="What does this diagnosis mean?"
          />
        </label>
        <button
          className="button secondary"
          disabled={!question.trim()}
          onClick={() => setPreview(true)}
        >
          Preview future assistant
        </button>
        {preview && (
          <p role="status" className="notice">
            Placeholder only. No AI answer was generated. Use “Ask my care team”
            to save this topic for your next discussion.
          </p>
        )}
      </div>
    </section>
  );
}
