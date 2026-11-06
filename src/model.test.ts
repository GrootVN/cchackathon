import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  visibleFollowups,
  actionStatus,
  recentEvents,
} from "./model";
describe("connected bedside workflows", () => {
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
