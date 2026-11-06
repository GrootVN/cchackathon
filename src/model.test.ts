import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  visibleFollowups,
  actionStatus,
  recentEvents,
  activeHighPriorityActions,
} from "./model";
describe("connected bedside workflows", () => {
  it("includes new and edited High priority actions in active concerns", () => {
    const action = {
      ...initialState.actions[0],
      id: "new-high-priority",
      priority: "High",
    };
    const next = reducer(initialState, { type: "action", action });
    expect(activeHighPriorityActions(next.actions).map((a) => a.id)).toContain(
      action.id,
    );
    const routine = reducer(next, {
      type: "action",
      action: { ...action, priority: "Routine" },
    });
    expect(
      activeHighPriorityActions(routine.actions).map((a) => a.id),
    ).not.toContain(action.id);
  });
  it("keeps overdue High priority concerns and removes completed or archived ones", () => {
    const actions = [
      "Open",
      "In Progress",
      "Awaiting Follow-Up",
      "Completed",
      "Archived",
    ].map((status, i) => ({
      ...initialState.actions[0],
      id: String(i),
      priority: "High",
      due: "2026-11-01",
      status: status as (typeof initialState.actions)[number]["status"],
    }));
    expect(activeHighPriorityActions(actions).map((a) => a.id)).toEqual([
      "0",
      "1",
      "2",
    ]);
  });
  it("tracks allergy and medication-reaction concern changes independently", () => {
    const next = reducer(initialState, {
      type: "concern",
      id: "medication-reaction",
      status: "Acknowledged",
    });
    expect(next.concerns["medication-reaction"]).toBe("Acknowledged");
    expect(next.concerns.allergy).toBe("Open");
    expect(next.concernHistory.at(-1)).toContain(
      "medication-reaction: Acknowledged",
    );
  });
  it("exchanges stars immediately and prevents overspending", () => {
    const exchanged = reducer(initialState, {
      type: "redeem",
      rewardId: "stickers",
    });
    expect(exchanged.stars).toBe(0);
    expect(exchanged.redemptions).toHaveLength(1);
    expect(reducer(exchanged, { type: "redeem", rewardId: "stickers" })).toBe(
      exchanged,
    );
  });
  it("never lets family checkoffs complete medical priorities", () => {
    const next = reducer(initialState, {
      type: "complete-personal",
      target: "priority",
      id: "echo",
    });
    expect(next.priorities.find((p) => p.id === "echo")?.completed).not.toBe(
      true,
    );
  });
  it("allows only explicitly nonmedical family-owned actions to be checked off", () => {
    const fixture = {
      ...initialState,
      actions: [
        {
          ...initialState.actions[0],
          owner: "Parent / guardian",
          medical: false,
        },
      ],
    };
    const next = reducer(fixture, {
      type: "complete-personal",
      target: "action",
      id: fixture.actions[0].id,
    });
    expect(next.actions[0].status).toBe("Completed");
    expect(next.actions[0].history.at(-1)).toContain("Family updated");
    const medical = {
      ...fixture,
      actions: [{ ...fixture.actions[0], medical: true }],
    };
    expect(
      reducer(medical, {
        type: "complete-personal",
        target: "action",
        id: fixture.actions[0].id,
      }).actions[0].status,
    ).toBe(medical.actions[0].status);
  });
  it("keeps standalone actions in upcoming timeline follow-ups", () => {
    expect(
      visibleFollowups([{ ...initialState.actions[0], eventId: "" }]),
    ).toHaveLength(1);
  });
  it("preserves the selected receiver on family questions", () => {
    const next = reducer(initialState, {
      type: "ask",
      text: "A question for my nurse",
      receiver: "Jamie Chen · Bedside nurse",
    });
    expect(next.questions.at(-1)?.receiver).toBe("Jamie Chen · Bedside nurse");
  });
  it("keeps a submitted question and clinical answer in one shared record", () => {
    const asked = reducer(initialState, {
      type: "ask",
      text: "Can I go to the playroom today?",
    });
    const q = asked.questions.at(-1)!;
    const answered = reducer(asked, {
      type: "answer",
      id: q.id,
      text: "Let’s ask your bedside nurse together.",
    });
    expect(answered.questions.at(-1)).toMatchObject({
      status: "Answered",
      answer: "Let’s ask your bedside nurse together.",
    });
  });
  it("preserves history and updates assigned follow-ups", () => {
    const action = {
      ...initialState.actions[0],
      id: "test",
      title: "Review echo",
      eventId: "echo",
      due: "2026-11-07",
      status: "Open" as const,
    };
    const added = reducer(initialState, { type: "action", action });
    expect(visibleFollowups(added.actions).some((a) => a.id === "test")).toBe(
      true,
    );
    const done = reducer(added, {
      type: "action",
      action: { ...action, status: "Completed" },
    });
    expect(visibleFollowups(done.actions).some((a) => a.id === "test")).toBe(
      false,
    );
    expect(done.actions.find((a) => a.id === "test")!.history.length).toBe(2);
  });
  it("keeps overdue follow-ups in history but hides old timeline markers", () => {
    const old = {
      ...initialState.actions[0],
      due: "2026-11-05",
      status: "Open" as const,
    };
    expect(actionStatus(old)).toBe("Overdue");
    expect(visibleFollowups([old])).toEqual([]);
  });
  it("protects clinician notes from patient edits", () => {
    const next = reducer(initialState, {
      type: "note",
      id: "welcome",
      text: "changed",
    });
    expect(next.notes.find((n) => n.id === "welcome")!.text).toBe(
      initialState.notes[0].text,
    );
  });
  it("shares only explicitly approved priorities", () => {
    const next = reducer(initialState, {
      type: "priority",
      title: "A shared walk",
      detail: "With your nurse",
      time: "15:00",
      approved: true,
    });
    expect(next.priorities.at(-1)?.approved).toBe(true);
  });
  it("includes exactly the last three calendar days", () => {
    expect(
      recentEvents().every(
        (e) => e.date >= "2026-11-04" && e.date <= "2026-11-06",
      ),
    ).toBe(true);
    expect(recentEvents()[0].date >= recentEvents().at(-1)!.date).toBe(true);
  });
  it("does not use a future due date as the creation date", () => {
    expect(
      initialState.actions.every((a) => a.created.slice(0, 10) <= "2026-11-06"),
    ).toBe(true);
  });
  it("updates shared priorities without duplicating them and clears viewed state", () => {
    const viewed = reducer(initialState, { type: "view-plan" });
    const updated = reducer(viewed, {
      type: "priority",
      id: "echo",
      title: "Heart pictures at a new time",
      detail: "The team will confirm.",
      time: "15:00",
      approved: true,
    });
    expect(updated.priorities.length).toBe(initialState.priorities.length);
    expect(updated.priorities.find((p) => p.id === "echo")).toMatchObject({
      time: "15:00",
      viewed: false,
    });
  });
  it("awards each discovery badge only once", () => {
    const first = reducer(initialState, {
      type: "reward",
      badge: "Heart explorer",
    });
    const repeat = reducer(first, { type: "reward", badge: "Heart explorer" });
    expect(repeat.stars).toBe(initialState.stars + 3);
  });
  it("retains archived actions and removes their active markers", () => {
    const next = reducer(initialState, {
      type: "action",
      action: { ...initialState.actions[0], status: "Archived" },
    });
    expect(next.actions.length).toBe(initialState.actions.length);
    expect(
      visibleFollowups(next.actions).some(
        (a) => a.id === initialState.actions[0].id,
      ),
    ).toBe(false);
  });
});
