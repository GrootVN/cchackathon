import { useState } from "react";
import { events, TODAY, dateLabel, familyOwners } from "./model";
import type { State } from "./model";
export default function JourneyTimeline({
  state,
  family,
  open,
}: {
  state: State;
  family: boolean;
  open: (kind: string, id: string) => void;
}) {
  const [scale, setScale] = useState<"Day" | "Week" | "Month">("Day");
  const actions = state.actions.filter(
    (a) =>
      a.status !== "Archived" && (!family || familyOwners.includes(a.owner)),
  );
  const end = [state.discharge, TODAY, ...actions.map((a) => a.due)]
    .sort()
    .at(-1)!;
  const start = "2026-11-02";
  const count = Math.max(
    7,
    Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1,
  );
  const step = scale === "Day" ? 1 : scale === "Week" ? 7 : 30;
  const groups: { a: string; b: string }[] = [];
  let cursor = Date.parse(start);
  const last = Date.parse(start) + (count - 1) * 86400000;
  while (cursor <= last) {
    const d = new Date(cursor);
    const boundary =
      scale === "Month"
        ? Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1) - 86400000
        : cursor + (step - 1) * 86400000;
    const finish = Math.min(boundary, last);
    groups.push({
      a: new Date(cursor).toISOString().slice(0, 10),
      b: new Date(finish).toISOString().slice(0, 10),
    });
    cursor = finish + 86400000;
  }
  return (
    <section className="card timeline-card" id="timeline">
      <div className="section-title">
        <div>
          <h2>{family ? "Our hospital journey" : "The hospital journey"}</h2>
          <p>Completed milestones, planned care, and owned next steps.</p>
        </div>
        <div className="row">
          <div className="filter-tabs" aria-label="Timeline scale">
            {(["Day", "Week", "Month"] as const).map((v) => (
              <button
                key={v}
                aria-pressed={scale === v}
                className={scale === v ? "selected" : ""}
                onClick={() => setScale(v)}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            className="button secondary"
            onClick={() =>
              document.getElementById("journey-today")?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
              })
            }
          >
            Today
          </button>
        </div>
      </div>
      <div className="timeline-scroll">
        <div
          className="journey-periods"
          style={{
            gridTemplateColumns: `repeat(${groups.length},minmax(${scale === "Day" ? 170 : 260}px,1fr))`,
          }}
        >
          {groups.map(({ a, b }) => {
            const current = a <= TODAY && b >= TODAY;
            const es = events.filter((e) => {
              const d = e.id === "home" ? state.discharge : e.date;
              return (
                d >= a &&
                d <= b &&
                (!family || e.verified || e.type === "Estimate")
              );
            });
            const as = actions.filter(
              (x) =>
                x.due >= a &&
                x.due <= b &&
                x.due >= TODAY &&
                x.status !== "Completed",
            );
            const recorded = actions.filter(
              (x) => x.created.slice(0, 10) >= a && x.created.slice(0, 10) <= b,
            );
            return (
              <div
                className={`journey-period ${current ? "current" : ""}`}
                key={a}
                id={current ? "journey-today" : undefined}
              >
                <h3>
                  {dateLabel(a)}
                  {a !== b && ` – ${dateLabel(b)}`}
                  {current && <span className="badge purple">Today</span>}
                </h3>
                <div className="period-events">
                  {es.map((e) => (
                    <button
                      className="event-marker"
                      key={e.id}
                      onClick={() => open("event", e.id)}
                    >
                      <span>
                        {family ? e.friendly : e.title}
                        <small>
                          {dateLabel(
                            e.id === "home" ? state.discharge : e.date,
                          )}{" "}
                          ·{" "}
                          {e.verified
                            ? "Verified"
                            : e.type === "Estimate"
                              ? "Estimated"
                              : "Scheduled"}
                        </small>
                      </span>
                    </button>
                  ))}
                  {recorded.length > 0 && (
                    <details className="timeline-action-group">
                      <summary>
                        {recorded.length} action{recorded.length > 1 ? "s" : ""}{" "}
                        recorded
                      </summary>
                      {recorded.map((x) => (
                        <button
                          className="event-marker"
                          key={x.id}
                          onClick={() =>
                            open(family ? "family-action" : "action", x.id)
                          }
                        >
                          <span>
                            {x.title}
                            <small>
                              {x.owner} · {x.status}
                            </small>
                          </span>
                        </button>
                      ))}
                    </details>
                  )}
                  {as.length > 0 && (
                    <details className="timeline-action-group">
                      <summary>
                        ○ {as.length} upcoming follow-up
                        {as.length > 1 ? "s" : ""}
                      </summary>
                      {as.map((x) => (
                        <button
                          className="follow-marker"
                          key={x.id}
                          onClick={() =>
                            open(family ? "family-action" : "action", x.id)
                          }
                        >
                          {x.title}
                          <small>
                            Due {dateLabel(x.due)} ·{" "}
                            {x.eventId
                              ? `Linked to ${events.find((e) => e.id === x.eventId)?.title}`
                              : "Standalone action"}
                          </small>
                        </button>
                      ))}
                    </details>
                  )}
                </div>
                <div
                  className={`location-bar ${a > TODAY ? "planned" : step > 1 ? "accu" : a === "2026-11-02" ? "inpatient" : a === "2026-11-03" ? "operating" : a === "2026-11-04" ? "cicu" : "accu"}`}
                >
                  {a > TODAY
                    ? "Future location unconfirmed"
                    : step > 1
                      ? "Inpatient → OR → CICU → ACCU"
                      : a === "2026-11-02"
                        ? "Inpatient"
                        : a === "2026-11-03"
                          ? "OR → CICU"
                          : a === "2026-11-04"
                            ? "CICU"
                            : "Acute cardiac care"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="micro">
        Dashed periods are tentative. Past follow-ups remain in action history.
        Home date: clinician-entered estimate.
      </p>
    </section>
  );
}
