# Feature Specification: InnovatEPAM Portal Phase 2 — Smart Submission Forms

**Feature Branch**: `006-smart-submission-forms`

**Created**: 2026-05-15

**Status**: Draft

**Input**: User description: "Phase 2: Smart Submission Forms — The idea submission form dynamically adapts based on the selected category. When a submitter chooses a category, a category-specific required field appears inline to capture structured metadata. Supported categories and their extra fields: Technology (Tech Stack), Process Improvement (Affected Team), Client Solution (Client Industry), Other (no extra field). The extra field value is stored as structured metadata attached to the idea and is visible in the idea detail view to both the submitter and admins."

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

### User Story 1 — Dynamic Category Metadata on Submission (Priority: P1)

A submitter filling out the idea submission form selects a category and sees a category-specific extra field appear inline. They fill in the extra field and submit. The idea is saved with the structured metadata attached.

**Why this priority**: Capturing structured metadata is the entire value of this feature. If the dynamic field does not appear and persist correctly, all downstream visibility is meaningless.

**Independent Test**: A submitter selects "Technology", sees a "Tech Stack" field appear, enters a value, submits, and the idea is saved. The same flow is repeated for "Process Improvement" (Affected Team), "Client Solution" (Client Industry), and "Other" (no extra field shown).

**Acceptance Scenarios**:

1. **Given** an authenticated submitter on the idea submission form, **When** they select the "Technology" category, **Then** a required "Tech Stack" text field appears inline below the category selector.
2. **Given** an authenticated submitter on the idea submission form, **When** they select the "Process Improvement" category, **Then** a required "Affected Team" text field appears inline below the category selector.
3. **Given** an authenticated submitter on the idea submission form, **When** they select the "Client Solution" category, **Then** a required "Client Industry" text field appears inline below the category selector.
4. **Given** an authenticated submitter on the idea submission form, **When** they select the "Other" category, **Then** no extra field appears and the form remains unchanged beyond the category selection.
5. **Given** an authenticated submitter who has filled in the extra field for "Technology", **When** they switch the category to "Process Improvement", **Then** the "Tech Stack" field disappears, its previously entered value is discarded, and the "Affected Team" field appears empty.
6. **Given** an authenticated submitter who has filled in the extra field, **When** they submit the idea with all required fields valid, **Then** the idea is saved with the category metadata (field name and value) stored as structured data and the idea appears in their list with status `submitted`.
7. **Given** an authenticated submitter with "Technology" selected, **When** they attempt to submit without filling in the "Tech Stack" field, **Then** submission is blocked and an inline validation error is shown on the extra field.

---

### User Story 2 — Category Metadata Visibility on Idea Detail (Priority: P1)

Both the submitter and an admin can open an idea detail page and see the category-specific metadata alongside the other idea fields.

**Why this priority**: Storing metadata has no value if it cannot be read back. Admins in particular need the structured context to make better evaluation decisions.

**Independent Test**: After a submitter creates an idea with category "Client Solution" and client industry "Healthcare", both the submitter (on their own detail view) and an admin (on the admin detail view) can open the idea and see "Client Industry: Healthcare" rendered clearly.

**Acceptance Scenarios**:

1. **Given** an idea submitted with a non-Other category, **When** the submitter opens that idea's detail page, **Then** the category-specific field label and its stored value are displayed.
2. **Given** an idea submitted with a non-Other category, **When** an admin opens that idea's detail page, **Then** the category-specific field label and its stored value are displayed alongside all other idea fields.
3. **Given** an idea submitted with the "Other" category, **When** either the submitter or an admin opens its detail page, **Then** no extra metadata field or empty placeholder is displayed; the detail layout remains clean.
4. **Given** an idea created before Phase 2 was deployed (no metadata), **When** either the submitter or an admin opens its detail page, **Then** the detail page renders without errors and does not display a metadata section.

---

### Edge Cases

- Switching the selected category clears the extra field value and replaces the field with the one mapped to the newly selected category.
- Selecting "Other" removes any previously visible extra field and discards its value.
- The extra field is required when it is visible (i.e., for Technology, Process Improvement, Client Solution); submitting with the field empty is rejected with an inline error.
- The extra field must accept free-form text; it has no predefined option list.
- An idea submitted with "Other" stores no extra metadata; consumers must handle a null/absent metadata value gracefully.
- Ideas created before Phase 2 (with no metadata column value) continue to load and display without errors.
- Draft ideas that have a category-specific field populated and are later submitted retain the metadata value.
- The extra field label and value must not overflow or break the layout on the minimum supported viewport width (375 px).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-021**: System MUST render a category-specific inline input field on the idea submission form when the submitter selects "Technology", "Process Improvement", or "Client Solution".
- **FR-022**: System MUST NOT render an extra input field when the submitter selects "Other".
- **FR-023**: System MUST clear and remove the extra input field when the submitter switches from one category to another, discarding any value previously entered in the old field.
- **FR-024**: System MUST enforce that the category-specific extra field is non-empty before the form can be submitted when the field is visible.
- **FR-025**: System MUST display an inline validation error on the extra field when it is left empty and the submitter attempts to submit.
- **FR-026**: System MUST persist the category metadata (field identifier and value) as structured data attached to the idea record when the idea is saved.
- **FR-027**: System MUST display the category-specific field label and stored value on the idea detail page to the authenticated submitter who owns the idea.
- **FR-028**: System MUST display the category-specific field label and stored value on the idea detail page to authenticated admins.
- **FR-029**: System MUST NOT display a metadata section on any idea detail page when the idea carries no metadata (either "Other" category or pre-Phase-2 ideas).
- **FR-030**: System MUST apply the same category-to-field mapping to the draft edit form so that submitters editing a saved draft see and can populate the extra field before final submission.

### Category-to-Field Mapping

| Category | Extra Field Label | Required |
|---|---|---|
| Technology | Tech Stack | Yes |
| Process Improvement | Affected Team | Yes |
| Client Solution | Client Industry | Yes |
| Other | *(none)* | N/A |

### Key Entities *(include if feature involves data)*

- **Idea** *(extended)*: Existing entity gains a `categoryMetadata` column storing a structured key-value record (field identifier and free-text value). The column is nullable to maintain backward compatibility with ideas created before this phase.
- **CategoryMetadata** *(value object)*: Inline structured record on the Idea, comprising a `fieldKey` (identifies which extra field, e.g. `techStack`, `affectedTeam`, `clientIndustry`) and a `fieldValue` (the submitter-provided free-text string). Not a separate table; stored as a single structured/JSON-typed column on Idea.
- **CategoryFieldMap** *(configuration)*: A static mapping from category values to their corresponding extra field label and storage key, defined in the application layer. Has no database representation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-007**: 100% of manual test scenarios covering all four category selections (Technology, Process Improvement, Client Solution, Other) result in the correct field presence or absence during form interaction.
- **SC-008**: 100% of ideas submitted with a non-Other category have the correct metadata field and value persisted and readable back from the database within the same user session.
- **SC-009**: 100% of manual test cases for category switching result in the previous extra field value being cleared before the new field appears.
- **SC-010**: 100% of attempts to submit an idea with a visible but empty extra field are blocked by client-side validation with an inline error message before the request is sent.
- **SC-011**: Both the submitter and an admin can view correctly labelled category metadata on the idea detail page for 100% of ideas that were submitted with a non-Other category.
- **SC-012**: Ideas created before Phase 2 load and display without errors on both the submitter's list view and the detail view, as verified in manual regression testing.
- **SC-013**: The idea submission form, including the dynamically shown extra field, remains fully usable and readable at the minimum supported viewport width of 375 px.

## Assumptions

- The set of supported categories (Technology, Process Improvement, Client Solution, Other) is fixed for this phase; adding new categories requires a future spec amendment.
- The extra field accepts free-form plain text only; structured sub-fields, dropdowns, or character limits beyond what the form's standard text input provides are out of scope for Phase 2.
- The `categoryMetadata` column is added to the existing `Idea` database table as a nullable column; no data migration is required for pre-existing ideas since a null value is treated as "no metadata".
- Draft ideas that already exist in the database at the time of deployment may carry a null metadata value; the draft edit form will display the appropriate extra field for editing if the submitter changes the category.
- No changes to the evaluation workflow, status pipeline, or file attachment logic are introduced in this phase.
- The feature is server-rendered where possible, consistent with the existing App Router architecture; dynamic field switching is handled client-side only within the form component.
- The category-to-field mapping is defined once in the application configuration layer and shared between the form, validation schema, and detail view; it is not stored in the database.
