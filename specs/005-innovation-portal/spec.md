# Feature Specification: InnovatEPAM Portal Phase 1 Core Portal

**Feature Branch**: `005-innovation-portal`

**Created**: 2026-05-13

**Status**: Draft

**Input**: User description: "Build Phase 1 of InnovatEPAM Portal where employees submit ideas and admins evaluate them"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Employee Access and Identity (Priority: P1)

A new employee can register with name, email, and password, then log in and log out securely.

**Why this priority**: No one can submit or evaluate ideas without account access. This is the gateway to all other value.

**Independent Test**: A new user completes registration, logs in, reaches an authenticated area, and then logs out; session access is removed after logout.

**Acceptance Scenarios**:

1. **Given** a visitor without an account, **When** they provide valid name, email, and password, **Then** an account is created and they can authenticate.
2. **Given** a registered user, **When** they provide valid credentials, **Then** they are signed in and can access protected portal pages.
3. **Given** a signed-in user, **When** they log out, **Then** their session is ended and protected pages require login again.

---

### User Story 2 - Submit and Track Ideas (Priority: P1)

A submitter creates ideas with title, description, category, and an optional single attachment (up to 10 MB), then tracks their own ideas and statuses.

**Why this priority**: Idea capture and submitter visibility are the core business outcomes of the portal.

**Independent Test**: A signed-in submitter creates an idea, optionally uploads one supported file within size limit, sees it in their idea list with status, and opens its detail page.

**Acceptance Scenarios**:

1. **Given** an authenticated submitter, **When** they submit an idea with required fields, **Then** the idea is saved with initial status `submitted`.
2. **Given** an authenticated submitter, **When** they attach one allowed file at or below 10 MB, **Then** the file is stored and linked to that idea.
3. **Given** an authenticated submitter, **When** they open their ideas list, **Then** they see only their own ideas with current statuses.
4. **Given** an authenticated submitter, **When** they open one of their submitted ideas, **Then** they can view full details including status and evaluation comment when available.

---

### User Story 3 - Admin Evaluation Workflow (Priority: P1)

An admin views all submitted ideas, opens idea details including attachment, moves ideas through review statuses, and records accept/reject decisions with comments.

**Why this priority**: Without evaluation, submissions never progress and submitters receive no structured feedback.

**Independent Test**: An admin opens the full queue, reviews an idea detail, transitions status to `under_review`, then to `accepted` or `rejected` with comment; submitter later sees updated status/comment.

**Acceptance Scenarios**:

1. **Given** an authenticated admin, **When** they open the ideas queue, **Then** they can view all submitted ideas.
2. **Given** an authenticated admin, **When** they open an idea detail, **Then** they can view idea content and its attachment.
3. **Given** an authenticated admin, **When** they evaluate an idea, **Then** they can set `accepted` or `rejected` and save a written comment.
4. **Given** a non-admin submitter, **When** they attempt to access admin evaluation actions, **Then** access is denied.

---

### User Story 4 - Status Lifecycle Transparency (Priority: P2)

Submitters can always see the latest lifecycle status of their ideas, including evaluation comments when decisions are made.

**Why this priority**: Visibility and trust are critical to employee engagement but depend on stories 1-3 being active.

**Independent Test**: After admin transitions an idea across lifecycle states, the submitter can see the latest status and final comment on list and detail views.

**Acceptance Scenarios**:

1. **Given** a submitted idea, **When** admin moves it to `under_review`, **Then** the submitter sees `under_review` as current status.
2. **Given** an under-review idea, **When** admin marks it `accepted` or `rejected` with comment, **Then** the submitter sees the final status and comment.

---

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- Registration fails when email is already in use.
- Login fails for invalid credentials without revealing whether email exists.
- Idea submission fails when required fields (title, description, category) are missing.
- Attachment upload is rejected when file exceeds 10 MB.
- Attachment upload is rejected when file type is not allowed.
- Submitter attempts to open another submitter's idea detail.
- Submitter attempts to call admin-only evaluation actions.
- Admin attempts invalid status transition (for example, directly from `submitted` to `accepted` without `under_review` when strict sequence is enforced).
- Admin submits evaluation decision without comment.
- An idea has no attachment and detail view must remain complete and usable.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST allow users to register with name, email, and password.
- **FR-002**: System MUST enforce unique email per user account.
- **FR-003**: System MUST authenticate registered users with email and password.
- **FR-004**: System MUST provide secure logout that invalidates the active user session.
- **FR-005**: System MUST support two roles: submitter and admin.
- **FR-006**: System MUST allow authenticated submitters to create ideas with title, description, and category.
- **FR-007**: System MUST initialize each new idea with status `submitted`.
- **FR-008**: System MUST allow a submitter to attach at most one file to an idea.
- **FR-009**: System MUST reject attachment uploads larger than 10 MB.
- **FR-010**: System MUST validate attachment type against an allowed server-side whitelist.
- **FR-011**: System MUST allow submitters to view a list of only their own ideas with current statuses.
- **FR-012**: System MUST allow submitters to view full detail of their own ideas.
- **FR-013**: System MUST prevent submitters from accessing admin evaluation views and actions.
- **FR-014**: System MUST allow admins to view all submitted ideas.
- **FR-015**: System MUST allow admins to view full detail for any submitted idea, including attachment metadata and access.
- **FR-016**: System MUST allow admins to set idea status to `under_review`.
- **FR-017**: System MUST allow admins to set final decision status to either `accepted` or `rejected` with a written comment.
- **FR-018**: System MUST expose lifecycle state and evaluation comment to submitters on their own ideas.
- **FR-019**: System MUST enforce role-based authorization on all routes and actions that expose or modify idea data.
- **FR-020**: System MUST exclude the following from Phase 1 scope: semantic duplicate detection, draft saving, multi-stage review, blind review/anonymization, scoring, search/filtering, pagination, and email notifications.

### Key Entities *(include if feature involves data)*

- **User**: Registered employee identity with name, email, credential, and role.
- **Session**: Authenticated session state tying a logged-in user to protected actions.
- **Idea**: Innovation submission with title, description, category, owner, lifecycle status, and timestamps.
- **IdeaAttachment**: Optional single file linked to an idea, including filename, type, and size metadata.
- **Evaluation**: Admin decision record containing target idea, decision status (`accepted` or `rejected`), comment, evaluator identity, and decision timestamp.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: At least 90% of valid registration attempts complete successfully in a single attempt during manual UAT.
- **SC-002**: At least 95% of valid login attempts complete successfully in under 10 seconds under normal internal network conditions.
- **SC-003**: A submitter can create an idea (with or without attachment) and see it in their own list with status `submitted` within 15 seconds end-to-end.
- **SC-004**: 100% of tested unauthorized attempts by submitters to access admin evaluation workflows are denied.
- **SC-005**: 100% of ideas created in Phase 1 follow the status lifecycle (`submitted` -> `under_review` -> `accepted` or `rejected`) as exercised in manual critical-path testing.
- **SC-006**: 100% of completed admin decisions include a non-empty written comment visible to the idea owner.

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- The portal is for internal authenticated employees and designated admins only.
- Users access the MVP through modern desktop and mobile browsers, including narrow mobile widths defined by governance.
- The MVP volume remains below 100 ideas, so search/filtering/pagination are intentionally deferred.
- A single attachment per idea is sufficient for Phase 1 evidence-sharing needs.
- Admin evaluation comment is mandatory when recording accept/reject decisions.
- No external notification service is required in this phase; status visibility in-app is sufficient.
