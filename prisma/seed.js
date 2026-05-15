/**
 * Seed script — wipes and repopulates dev.db with representative dummy data.
 * Covers every status, every category (with categoryMetadata), blind review,
 * and a realistic evaluation trail.
 *
 * Run:  npm run db:seed
 * Password for every user: Password123!
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()
const HASH = bcrypt.hashSync('Password123!', 10)

// ─── helpers ────────────────────────────────────────────────────────────────
const meta = (obj) => JSON.stringify(obj)

async function main() {
  // 1. Wipe existing data (cascade order)
  await prisma.evaluation.deleteMany()
  await prisma.ideaAttachment.deleteMany()
  await prisma.idea.deleteMany()
  await prisma.user.deleteMany()

  console.log('✓ Cleared existing data')

  // ── 2. Users ────────────────────────────────────────────────────────────
  const [admin1, admin2, alice, bob, carol, dave] = await Promise.all([
    prisma.user.create({
      data: { name: 'Admin One', email: 'admin@epam.com', passwordHash: HASH, role: 'ADMIN' },
    }),
    prisma.user.create({
      data: { name: 'Admin Two', email: 'admin2@epam.com', passwordHash: HASH, role: 'ADMIN' },
    }),
    prisma.user.create({
      data: { name: 'Alice Johnson', email: 'alice@epam.com', passwordHash: HASH, role: 'SUBMITTER' },
    }),
    prisma.user.create({
      data: { name: 'Bob Smith', email: 'bob@epam.com', passwordHash: HASH, role: 'SUBMITTER' },
    }),
    prisma.user.create({
      data: { name: 'Carol White', email: 'carol@epam.com', passwordHash: HASH, role: 'SUBMITTER' },
    }),
    prisma.user.create({
      data: { name: 'Dave Brown', email: 'dave@epam.com', passwordHash: HASH, role: 'SUBMITTER' },
    }),
  ])

  console.log('✓ Created 2 admins + 4 submitters')

  // ── 3. Ideas (every status × every category) ────────────────────────────
  // DRAFT ideas (only visible to their authors)
  const draft1 = await prisma.idea.create({
    data: {
      title: 'AI-Powered Code Review Bot',
      description: 'Integrate an LLM into our CI pipeline to auto-review pull requests and suggest improvements before human reviewers look at them.',
      category: 'Technology',
      categoryMetadata: meta({ techStack: 'Python, OpenAI API, GitHub Actions' }),
      blindReview: false,
      status: 'DRAFT',
      submitterId: alice.id,
    },
  })

  const draft2 = await prisma.idea.create({
    data: {
      title: 'Streamline Onboarding Process',
      description: 'Redesign the employee onboarding checklist to reduce time-to-productivity from 4 weeks to 2 weeks by automating paperwork steps.',
      category: 'Process Improvement',
      categoryMetadata: meta({ affectedTeam: 'HR, Engineering' }),
      blindReview: false,
      status: 'DRAFT',
      submitterId: bob.id,
    },
  })

  // SUBMITTED ideas
  const sub1 = await prisma.idea.create({
    data: {
      title: 'Real-Time Dashboard for Client KPIs',
      description: 'Build a live dashboard that pulls metrics from client CRMs and visualises KPIs in near real-time, reducing manual reporting effort.',
      category: 'Client Solution',
      categoryMetadata: meta({ clientIndustry: 'Finance' }),
      blindReview: false,
      status: 'SUBMITTED',
      submitterId: carol.id,
    },
  })

  const sub2 = await prisma.idea.create({
    data: {
      title: 'Internal Hackathon Platform',
      description: 'A dedicated portal for running internal hackathons: team formation, project submission, voting, and prize tracking — all in one place.',
      category: 'Other',
      categoryMetadata: null,
      blindReview: true,
      status: 'SUBMITTED',
      submitterId: dave.id,
    },
  })

  const sub3 = await prisma.idea.create({
    data: {
      title: 'GraphQL Migration for Legacy REST APIs',
      description: 'Gradually migrate our internal REST micro-services to GraphQL to reduce over-fetching and improve mobile client performance by 40 %.',
      category: 'Technology',
      categoryMetadata: meta({ techStack: 'Node.js, Apollo Server, TypeScript' }),
      blindReview: true,
      status: 'SUBMITTED',
      submitterId: alice.id,
    },
  })

  // INITIAL_SCREENING
  const screening1 = await prisma.idea.create({
    data: {
      title: 'Automated Incident Post-Mortem Reports',
      description: 'After every P1/P2 incident, automatically generate a draft post-mortem using logs and alerts from our observability stack to save hours of manual write-up.',
      category: 'Technology',
      categoryMetadata: meta({ techStack: 'Datadog, OpenAI API, Confluence API' }),
      blindReview: false,
      status: 'INITIAL_SCREENING',
      submitterId: bob.id,
    },
  })

  const screening2 = await prisma.idea.create({
    data: {
      title: 'Quarterly Client Satisfaction Survey Automation',
      description: 'Replace ad-hoc NPS surveys with an automated quarterly pipeline that sends personalised surveys, collects responses, and generates trend reports.',
      category: 'Client Solution',
      categoryMetadata: meta({ clientIndustry: 'Healthcare' }),
      blindReview: false,
      status: 'INITIAL_SCREENING',
      submitterId: carol.id,
    },
  })

  // TECHNICAL_REVIEW
  const techReview1 = await prisma.idea.create({
    data: {
      title: 'Unified Logging Standard Across Teams',
      description: 'Define and enforce a company-wide structured logging standard (JSON, correlation IDs, severity levels) to cut mean-time-to-diagnose by 30 %.',
      category: 'Process Improvement',
      categoryMetadata: meta({ affectedTeam: 'All Engineering Teams' }),
      blindReview: false,
      status: 'TECHNICAL_REVIEW',
      submitterId: dave.id,
    },
  })

  const techReview2 = await prisma.idea.create({
    data: {
      title: 'Mobile-First Retail Analytics App',
      description: 'Develop a lightweight mobile app giving retail clients real-time shelf-performance metrics, reorder suggestions, and seasonal trend alerts.',
      category: 'Client Solution',
      categoryMetadata: meta({ clientIndustry: 'Retail' }),
      blindReview: true,
      status: 'TECHNICAL_REVIEW',
      submitterId: alice.id,
    },
  })

  // BUSINESS_REVIEW
  const bizReview1 = await prisma.idea.create({
    data: {
      title: 'Green Computing Initiative',
      description: 'Audit our cloud resource usage and implement auto-scaling policies and right-sizing recommendations to reduce infrastructure costs and carbon footprint by 20 %.',
      category: 'Process Improvement',
      categoryMetadata: meta({ affectedTeam: 'Cloud Platform, Finance' }),
      blindReview: false,
      status: 'BUSINESS_REVIEW',
      submitterId: bob.id,
    },
  })

  // ACCEPTED ideas
  const accepted1 = await prisma.idea.create({
    data: {
      title: 'Developer Inner-Source Marketplace',
      description: 'Create an internal marketplace where teams can publish reusable libraries, services, and templates. Reduces duplicate effort and accelerates project kick-offs.',
      category: 'Technology',
      categoryMetadata: meta({ techStack: 'Next.js, Postgres, S3' }),
      blindReview: false,
      status: 'ACCEPTED',
      submitterId: carol.id,
      reviewedAt: new Date(),
      currentComment: 'Excellent business case and clear technical plan. Approved for Q3 implementation budget.',
    },
  })

  const accepted2 = await prisma.idea.create({
    data: {
      title: 'Sales Enablement Knowledge Base',
      description: 'Build a searchable, AI-curated knowledge base for the sales team containing competitive intel, case studies, and objection-handling scripts, auto-updated weekly.',
      category: 'Client Solution',
      categoryMetadata: meta({ clientIndustry: 'SaaS / Cross-vertical' }),
      blindReview: false,
      status: 'ACCEPTED',
      submitterId: dave.id,
      reviewedAt: new Date(),
      currentComment: 'Strong ROI projection. Stakeholders aligned. Moving to implementation phase.',
    },
  })

  // REJECTED ideas
  const rejected1 = await prisma.idea.create({
    data: {
      title: 'Blockchain-Based Expense Tracker',
      description: 'Replace our current expense reporting tool with a blockchain ledger to ensure immutable audit trails for all employee expense claims.',
      category: 'Technology',
      categoryMetadata: meta({ techStack: 'Solidity, Ethereum, IPFS' }),
      blindReview: false,
      status: 'REJECTED',
      submitterId: alice.id,
      reviewedAt: new Date(),
      currentComment: 'Blockchain adds unnecessary complexity and cost for this use-case. Existing tooling is sufficient.',
    },
  })

  const rejected2 = await prisma.idea.create({
    data: {
      title: 'Office Ping-Pong Tournament Tracker',
      description: 'Build an app to schedule and track inter-office ping-pong tournaments with ELO rankings, bracket visualisation, and Slack notifications.',
      category: 'Other',
      categoryMetadata: null,
      blindReview: false,
      status: 'REJECTED',
      submitterId: bob.id,
      reviewedAt: new Date(),
      currentComment: 'Out of scope for the innovation portal. Please use the social committee channel.',
    },
  })

  console.log('✓ Created 14 ideas (all statuses, all categories)')

  // ── 4. Evaluations ───────────────────────────────────────────────────────
  // INITIAL_SCREENING ideas — one evaluation each (SUBMITTED → INITIAL_SCREENING)
  await prisma.evaluation.create({
    data: {
      ideaId: screening1.id,
      evaluatorId: admin1.id,
      fromStatus: 'SUBMITTED',
      toStatus: 'INITIAL_SCREENING',
      comment: 'Passes initial review. Technically feasible and aligns with DevOps strategy. Moving to deeper technical assessment.',
      score: 4,
      recommendation: 'APPROVE',
    },
  })

  await prisma.evaluation.create({
    data: {
      ideaId: screening2.id,
      evaluatorId: admin1.id,
      fromStatus: 'SUBMITTED',
      toStatus: 'INITIAL_SCREENING',
      comment: 'Good proposal. Needs more detail on data privacy for healthcare clients. Advancing for technical review of the implementation plan.',
      score: 3,
      recommendation: 'APPROVE',
    },
  })

  // TECHNICAL_REVIEW ideas — two evaluations each
  await prisma.evaluation.createMany({
    data: [
      {
        ideaId: techReview1.id,
        evaluatorId: admin1.id,
        fromStatus: 'SUBMITTED',
        toStatus: 'INITIAL_SCREENING',
        comment: 'Straightforward process improvement. Advancing.',
        score: 4,
        recommendation: 'APPROVE',
      },
      {
        ideaId: techReview1.id,
        evaluatorId: admin2.id,
        fromStatus: 'INITIAL_SCREENING',
        toStatus: 'TECHNICAL_REVIEW',
        comment: 'Detailed RFC reviewed. Implementation approach is sound. Cost estimate reasonable.',
        score: 4,
        recommendation: 'APPROVE',
      },
      {
        ideaId: techReview2.id,
        evaluatorId: admin1.id,
        fromStatus: 'SUBMITTED',
        toStatus: 'INITIAL_SCREENING',
        comment: 'High client impact potential. Needs technical scoping.',
        score: 5,
        recommendation: 'APPROVE',
      },
      {
        ideaId: techReview2.id,
        evaluatorId: admin2.id,
        fromStatus: 'INITIAL_SCREENING',
        toStatus: 'TECHNICAL_REVIEW',
        comment: 'Architecture review complete. React Native + REST backend is suitable. Moving to business review.',
        score: 5,
        recommendation: 'APPROVE',
      },
    ],
  })

  // BUSINESS_REVIEW — three evaluations
  await prisma.evaluation.createMany({
    data: [
      {
        ideaId: bizReview1.id,
        evaluatorId: admin1.id,
        fromStatus: 'SUBMITTED',
        toStatus: 'INITIAL_SCREENING',
        comment: 'Sustainability angle aligns with company goals.',
        score: 4,
        recommendation: 'APPROVE',
      },
      {
        ideaId: bizReview1.id,
        evaluatorId: admin2.id,
        fromStatus: 'INITIAL_SCREENING',
        toStatus: 'TECHNICAL_REVIEW',
        comment: 'Cloud audit methodology is solid.',
        score: 4,
        recommendation: 'APPROVE',
      },
      {
        ideaId: bizReview1.id,
        evaluatorId: admin1.id,
        fromStatus: 'TECHNICAL_REVIEW',
        toStatus: 'BUSINESS_REVIEW',
        comment: 'Passed technical phase. Sending to finance for cost-benefit sign-off.',
        score: 4,
        recommendation: 'APPROVE',
      },
    ],
  })

  // ACCEPTED — full trail
  await prisma.evaluation.createMany({
    data: [
      {
        ideaId: accepted1.id,
        evaluatorId: admin1.id,
        fromStatus: 'SUBMITTED',
        toStatus: 'INITIAL_SCREENING',
        comment: 'Strong concept with clear demand from multiple teams.',
        score: 5,
        recommendation: 'APPROVE',
      },
      {
        ideaId: accepted1.id,
        evaluatorId: admin2.id,
        fromStatus: 'INITIAL_SCREENING',
        toStatus: 'TECHNICAL_REVIEW',
        comment: 'Tech stack familiar, integration risks low.',
        score: 5,
        recommendation: 'APPROVE',
      },
      {
        ideaId: accepted1.id,
        evaluatorId: admin1.id,
        fromStatus: 'TECHNICAL_REVIEW',
        toStatus: 'BUSINESS_REVIEW',
        comment: 'Architecture approved. Ready for business sign-off.',
        score: 5,
        recommendation: 'APPROVE',
      },
      {
        ideaId: accepted1.id,
        evaluatorId: admin2.id,
        fromStatus: 'BUSINESS_REVIEW',
        toStatus: 'ACCEPTED',
        comment: 'Excellent business case and clear technical plan. Approved for Q3 implementation budget.',
        score: 5,
        recommendation: 'APPROVE',
      },
      {
        ideaId: accepted2.id,
        evaluatorId: admin1.id,
        fromStatus: 'SUBMITTED',
        toStatus: 'INITIAL_SCREENING',
        comment: 'High sales team demand. Well articulated.',
        score: 4,
        recommendation: 'APPROVE',
      },
      {
        ideaId: accepted2.id,
        evaluatorId: admin2.id,
        fromStatus: 'INITIAL_SCREENING',
        toStatus: 'TECHNICAL_REVIEW',
        comment: 'RAG architecture is proven. Feasible within 2 sprints.',
        score: 4,
        recommendation: 'APPROVE',
      },
      {
        ideaId: accepted2.id,
        evaluatorId: admin1.id,
        fromStatus: 'TECHNICAL_REVIEW',
        toStatus: 'BUSINESS_REVIEW',
        comment: 'Low risk, high reward. Approved technically.',
        score: 5,
        recommendation: 'APPROVE',
      },
      {
        ideaId: accepted2.id,
        evaluatorId: admin2.id,
        fromStatus: 'BUSINESS_REVIEW',
        toStatus: 'ACCEPTED',
        comment: 'Strong ROI projection. Stakeholders aligned. Moving to implementation phase.',
        score: 5,
        recommendation: 'APPROVE',
      },
    ],
  })

  // REJECTED — evaluations leading to rejection
  await prisma.evaluation.createMany({
    data: [
      {
        ideaId: rejected1.id,
        evaluatorId: admin1.id,
        fromStatus: 'SUBMITTED',
        toStatus: 'INITIAL_SCREENING',
        comment: 'Novel approach. Needs deeper technical review before deciding.',
        score: 2,
        recommendation: null,
      },
      {
        ideaId: rejected1.id,
        evaluatorId: admin2.id,
        fromStatus: 'INITIAL_SCREENING',
        toStatus: 'REJECTED',
        comment: 'Blockchain adds unnecessary complexity and cost for this use-case. Existing tooling is sufficient.',
        score: 1,
        recommendation: 'REJECT',
      },
      {
        ideaId: rejected2.id,
        evaluatorId: admin1.id,
        fromStatus: 'SUBMITTED',
        toStatus: 'REJECTED',
        comment: 'Out of scope for the innovation portal. Please use the social committee channel.',
        score: 1,
        recommendation: 'REJECT',
      },
    ],
  })

  console.log('✓ Created evaluations (full audit trail)')

  // ── 5. Summary ──────────────────────────────────────────────────────────
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.idea.count(),
    prisma.evaluation.count(),
  ])

  console.log(`\n📊 Seed complete:`)
  console.log(`   Users       : ${counts[0]}  (2 admin, 4 submitter)`)
  console.log(`   Ideas       : ${counts[1]}  (2 DRAFT, 3 SUBMITTED, 2 INITIAL_SCREENING, 2 TECHNICAL_REVIEW, 1 BUSINESS_REVIEW, 2 ACCEPTED, 2 REJECTED)`)
  console.log(`   Evaluations : ${counts[2]}`)
  console.log(`\n🔑 All passwords: Password123!`)
  console.log(`   admin@epam.com  / admin2@epam.com`)
  console.log(`   alice@epam.com  / bob@epam.com / carol@epam.com / dave@epam.com`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
