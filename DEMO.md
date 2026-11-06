# The bedside conversation, reimagined

## 60-second pitch

During bedside rounds, a family may hear a lot of information and still be unsure what happens next. Clinicians face the other side of that problem: important questions and follow-ups can be scattered across conversations and records.

FlightPlan gives everyone a shared journey, in language that fits their role. For a child, it’s a gentle path home: today’s plan, small personal wins, encouraging notes, and a safe place to write a question. For clinicians, the same information becomes a clear timeline, recent changes, and assigned next steps.

Watch a child’s question travel into rounds, receive a response, and come back to the family. Then turn an event into an assigned follow-up with one short form. Family-present mode makes the shared story visible while hiding internal discussion.

We’re not replacing the EHR or making medical decisions. We’re making the conversation around care easier to follow. The prototype proves that connected workflow with fictional data. The next step is co-design and usability testing with families and bedside teams.

## 2–3 minute demonstration

1. **0:00–0:25 — Start with Oliver.** Reset the demo. Point to the journey and tentative home date. Tap the completed heart procedure. Explain the distinction between personal wins and clinician-confirmed care.
2. **0:25–0:50 — Give the family a voice.** Tap “Ask my care team.” Enter “Can we talk about my plan before the ultrasound?” Save it. Show Submitted, and the not-monitored label.
3. **0:50–1:20 — Bring it into rounds.** Open Care team view and explicitly enter the clinical demonstration. Show the patient snapshot, current-day timeline, concern, and recent updates. Find the new family question, mark it reviewed, then respond: “Yes. We’ll go through the plan together before your heart pictures.”
4. **1:20–1:50 — Make the next step accountable.** Open the postoperative echocardiogram. Expand Results; point out that the scheduled test has no result yet. Create a follow-up: “Discuss echo questions at next rounds,” assign Jamie Chen, due Nov 7. Show its grouped timeline marker and action table entry.
5. **1:50–2:10 — Check in and close the loop.** Open the new action’s questionnaire, save the three discussion checks, and then complete the action. Show that the active follow-up count decreases while the table retains the record and questionnaire.
6. **2:10–2:35 — Share the right view.** Turn on family-present mode. Internal notes, technical results, internal drafts, and follow-up titles disappear. Return to Patient view and show the Answered question with the clinician’s response. Reload to demonstrate persistence.
7. **2:35–2:50 — End on the child.** Open the care-crew quest or matching game. Discovery is rewarded; treatment adherence is not. Finish with “A little closer to home.”

Optional deeper dive: edit a shared priority and demonstrate that it updates in the family view and clears the prior “opened” state. Save a draft without approval and show that it stays out of both family presentations. Record a rounds decision and approved family update. Try the simulated help acknowledgment, always explaining that it cannot call staff.

## Five likely judge questions

**How is this different from a patient portal?**
It is built around the bedside conversation and the current hospital journey. The demonstration’s distinctive workflow is the closed loop between a family question, rounds discussion, and an owned follow-up, with deliberate family-facing presentation.

**Does it connect to the EHR?**
Not in this prototype. All records are fictional and browser-local. A real product needs approved integration interfaces, patient-context validation, source provenance, freshness guarantees, and reconciliation with clinical systems of record.

**How do you prevent patients from seeing internal notes?**
The demo filters presentation explicitly and requires approval for shared priorities and updates. This is not an access control system. Production requires server-enforced role and field authorization, authenticated identities, and audited access.

**How do you prevent extra clinical work?**
The interface keeps event-to-follow-up capture short and makes ownership and unresolved work visible. Whether it reduces workload is unproven; we would test task time, duplicate documentation, and staff burden before rollout.

**What evidence supports improved outcomes?**
No clinical outcome claim has been established. This is a usability and workflow hypothesis. Early evaluation would measure whether families can explain today’s plan, whether questions are addressed, and whether follow-ups are traceable, with appropriate research oversight.

## Before real clinical deployment

Co-design with families across ages, languages, abilities, and health-literacy needs; clinical review of every education item and workflow; hospital identity and consent policy; server-enforced role authorization; approved EHR and call-system integration; secure storage and encryption; durable audit history; message delivery and escalation policies; stale-data handling; formal accessibility testing; device and infection-control considerations; privacy/security and regulatory review; operational ownership; downtime procedures; staff training; and a prospective usability evaluation before clinical use. Family-present mode remains a presentation aid, not a substitute for authorization or clinician judgment.
