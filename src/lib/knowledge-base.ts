import { Article, Video, Document } from '@/types'

export const articles: Article[] = [
  {
    id: 'a1',
    slug: 'ai-in-the-workplace-2025',
    title: 'AI in the Workplace: A Report for 2025',
    subtitle: 'How superagency is reshaping the future of work and why leadership is the missing link',
    category: 'Artificial Intelligence',
    date: 'January 28, 2025',
    readTime: '14 min read',
    author: 'Nexus Research Institute',
    authorRole: 'Research Division',
    heroColor: '#1B40A0',
    excerpt: 'AI is already transforming how people work. Yet most companies have only scratched the surface of its potential. Our survey of 3,600+ employees reveals a striking gap between what leaders believe and what employees are actually doing.',
    tags: ['AI', 'Future of Work', 'Leadership', 'Productivity'],
    stats: [
      { number: '92%', label: 'of companies plan to increase AI investment' },
      { number: '1%', label: 'have reached true AI maturity' },
      { number: '13x', label: 'more employees use AI than leaders think' },
    ],
    content: `
      <h2>The Superagency Gap</h2>
      <p>Something remarkable is happening on the front lines of work. Employees are adopting AI tools faster than their organizations can track — let alone support. Our survey of 3,613 employees and 238 C-suite executives across six countries reveals a fundamental disconnect that, left unaddressed, will determine which companies lead the next decade.</p>
      <div class="stat-callout">
        <div class="stat-number">92%</div>
        <p>of companies plan to increase AI investment over the next three years. Yet only <strong>1%</strong> report reaching full AI maturity.</p>
      </div>
      <h2>Employees Are Already There</h2>
      <p>C-suite executives estimate that only 4% of employees use generative AI for at least 30% of their daily work. The actual figure is closer to 13%. This isn't a small miscalculation — it represents a systemic failure of organizational visibility.</p>
      <blockquote>"The biggest barrier to AI adoption isn't technology. It isn't budget. It isn't even employee reluctance. It's leadership."</blockquote>
      <h2>What Employees Actually Need</h2>
      <p>When asked what would most accelerate their AI adoption, employees ranked their priorities clearly:</p>
      <ul>
        <li><strong>Training and upskilling</strong> — cited by 48% of respondents as the single most important factor</li>
        <li><strong>Clear organizational strategy</strong> — employees want to understand how AI fits the company's direction</li>
        <li><strong>Manager encouragement</strong> — peer and manager behavior drives adoption more than any top-down mandate</li>
        <li><strong>Access to better tools</strong> — current toolsets often don't match employee needs</li>
      </ul>
      <h2>The Global Divide</h2>
      <p>AI adoption isn't happening uniformly. Employees in India, Singapore, and Australia report significantly stronger encouragement from managers and peers. US workers, by contrast, are the most likely to receive only "generic communications" about AI — or no guidance at all.</p>
      <h2>Building Toward Superagency</h2>
      <p>The companies pulling ahead share a common trait: they treat AI as a transformation of human capability, not a replacement for it. Reid Hoffman's concept of "superagency" — the amplification of human creativity and judgment through AI — is no longer theoretical. It's showing up in quarterly results.</p>
      <p>Leaders who want to close the gap must act on three fronts simultaneously: invest in targeted training, establish clear governance, and create psychological safety for experimentation.</p>
    `,
  },
  {
    id: 'a2',
    slug: 'digital-transformation-heavy-industry',
    title: 'A Guidebook for Heavy Industry\'s Digital Journey',
    subtitle: 'From incremental improvement to genuine reinvention — the operational and cultural shifts required',
    category: 'Digital Transformation',
    date: 'November 15, 2024',
    readTime: '11 min read',
    author: 'Rajat Dhawan & Asutosh Padhi',
    authorRole: 'Senior Partners, Nexus Insights',
    heroColor: '#0D2160',
    excerpt: 'Heavy industry faces a unique set of constraints in digital transformation. Physical assets, long investment cycles, and deeply entrenched processes make change harder — but the upside is proportionally greater.',
    tags: ['Digital Transformation', 'Manufacturing', 'Operations', 'Industry 4.0'],
    stats: [
      { number: '70%', label: 'of digital transformations fall short of their goals' },
      { number: '$1.25T', label: 'annual value at stake in industrial digitization' },
    ],
    content: `
      <h2>Why Heavy Industry Is Different</h2>
      <p>The principles of digital transformation are broadly understood. But heavy industry — oil and gas, mining, steel, chemicals — operates under constraints that make the standard playbook insufficient. Assets depreciate over decades, not months. Downtime can cost millions per hour. Safety and regulatory compliance aren't negotiable variables.</p>
      <h2>Three Transformation Horizons</h2>
      <p>Successful industrial transformations don't happen in a single leap. They unfold across three overlapping horizons:</p>
      <ul>
        <li><strong>Horizon 1 — Operational excellence:</strong> Using data and analytics to optimize existing processes. Predictive maintenance, yield improvement, energy optimization.</li>
        <li><strong>Horizon 2 — Business model adaptation:</strong> Shifting from product to service, building digital supply chain visibility, integrating customer data into operations.</li>
        <li><strong>Horizon 3 — Reinvention:</strong> Creating fundamentally new revenue streams enabled by digital capabilities.</li>
      </ul>
      <blockquote>"The companies that win won't be those who digitize their current business. They'll be those who use digital to build a business that couldn't have existed before."</blockquote>
      <h2>The Human Factor</h2>
      <p>In plants and refineries, the technician on the floor often has more practical knowledge than any algorithm. Successful transformations treat this knowledge as an asset to be captured and augmented — not bypassed.</p>
    `,
  },
  {
    id: 'a3',
    slug: 'agentic-ai-organizations',
    title: 'What Is an Agentic Organization?',
    subtitle: 'The emerging model where AI systems coordinate work autonomously — and what it demands of leaders',
    category: 'Artificial Intelligence',
    date: 'February 5, 2025',
    readTime: '9 min read',
    author: 'Lareina Yee & Michael Chui',
    authorRole: 'Senior Partners, Nexus Research Institute',
    heroColor: '#00B4D8',
    excerpt: 'Agentic AI doesn\'t just answer questions — it takes actions, coordinates with other agents, and completes complex multi-step tasks. The organizations learning to harness this are already operating differently.',
    tags: ['Agentic AI', 'Future of Work', 'Automation', 'Organization Design'],
    stats: [
      { number: '4x', label: 'productivity gains reported by early agentic AI adopters' },
      { number: '2026', label: 'when agentic workflows are expected to become mainstream' },
    ],
    content: `
      <h2>Beyond the Chatbot</h2>
      <p>For two years, generative AI's primary interface has been the chat window. Ask a question, get an answer. The model is reactive, limited to a single context, and dependent on human judgment at every step.</p>
      <p>Agentic AI breaks this mold. An agentic system can be given a goal and autonomously plan, research, execute, and iterate — calling tools, accessing databases, delegating to other agents, and surfacing results. It's the difference between a brilliant consultant who only speaks when spoken to, and one who proactively manages a project end-to-end.</p>
      <h2>How Agentic Organizations Are Structured</h2>
      <p>Early adopters are rethinking their organizational charts to reflect a new reality: some work is now done by networks of coordinating AI agents, supervised by humans. This creates new roles:</p>
      <ul>
        <li><strong>Agent Orchestrators</strong> — humans who define goals and constraints for multi-agent workflows</li>
        <li><strong>Quality Supervisors</strong> — responsible for auditing agent outputs and catching errors</li>
        <li><strong>Workflow Architects</strong> — designing the agent pipelines that power business processes</li>
      </ul>
      <h2>The Trust Imperative</h2>
      <p>The central challenge of agentic AI isn't technical — it's trust. Organizations must establish clear protocols for when agents act autonomously and when they escalate. The companies succeeding at this have invested heavily in governance infrastructure before deploying agents at scale.</p>
    `,
  },
  {
    id: 'a4',
    slug: 'leadership-qualities-2024',
    title: 'What Makes Someone a Good Leader in 2024?',
    subtitle: 'New research on the competencies that predict leadership effectiveness in complex, fast-moving environments',
    category: 'Leadership',
    date: 'October 3, 2024',
    readTime: '10 min read',
    author: 'Claudio Feser & Nicolai Chen Nielsen',
    authorRole: 'Senior Partners, Nexus Insights',
    heroColor: '#1B40A0',
    excerpt: 'Leadership models haven\'t kept pace with the reality of modern organizations. Our analysis of 180,000 leaders across 81 countries identifies the qualities that actually predict impact.',
    tags: ['Leadership', 'Talent', 'Organizational Health', 'Culture'],
    stats: [
      { number: '89%', label: 'of leadership failures are attributable to interpersonal factors' },
      { number: '4', label: 'core behaviors predict 89% of leadership effectiveness' },
    ],
    content: `
      <h2>The Old Model Is Broken</h2>
      <p>For decades, organizations selected and developed leaders based on intelligence, technical expertise, and strategic thinking. These qualities matter — but they explain only a fraction of why leaders succeed or fail.</p>
      <h2>The Four Behaviors That Predict Everything</h2>
      <p>After analyzing assessments from 180,000 leaders, the data converges on four behavioral clusters that predict 89% of leadership effectiveness outcomes:</p>
      <ul>
        <li><strong>Be supportive</strong> — Leaders who demonstrate genuine care for team members' wellbeing outperform peers across every metric we track</li>
        <li><strong>Champion desired change</strong> — Modeling the behaviors you want to see isn't leadership theater; it's the primary driver of culture change</li>
        <li><strong>Operate with strong results orientation</strong> — Prioritizing what matters, not just what's measurable</li>
        <li><strong>Seek different perspectives</strong> — The leaders who actively seek out views that challenge their own make consistently better decisions</li>
      </ul>
      <blockquote>"Intelligence opens doors. Character determines whether you walk through them the right way."</blockquote>
    `,
  },
]

export const videos: Video[] = [
  {
    id: 'v1',
    title: 'AI at Work: What the Data Actually Shows',
    duration: '8:24',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    url: 'https://www.example.com/capabilities/digital-insights/our-insights',
    topic: 'Artificial Intelligence',
  },
  {
    id: 'v2',
    title: 'Starting a Digital Transformation: The First 90 Days',
    duration: '12:10',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    url: 'https://www.example.com/capabilities/digital-insights/our-insights',
    topic: 'Digital Transformation',
  },
  {
    id: 'v3',
    title: 'Leadership in Uncertainty: A Conversation with McKinsey Senior Partners',
    duration: '22:45',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    url: 'https://www.example.com/capabilities/people-and-organizational-performance/our-insights',
    topic: 'Leadership',
  },
  {
    id: 'v4',
    title: 'What Is Agentic AI? A Plain-Language Explanation',
    duration: '6:55',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    url: 'https://www.example.com/capabilities/quantumblack/our-insights',
    topic: 'Agentic AI',
  },
]

export const documents: Document[] = [
  {
    id: 'd1',
    title: 'Superagency in the Workplace: Full Survey Report',
    type: 'Report',
    pages: 48,
    topic: 'Artificial Intelligence',
    url: 'https://www.example.com/capabilities/digital-insights/our-insights/superagency-in-the-workplace',
    date: 'January 2025',
  },
  {
    id: 'd2',
    title: 'Digital Transformation Diagnostic Tool',
    type: 'Guide',
    pages: 24,
    topic: 'Digital Transformation',
    url: 'https://www.example.com/capabilities/digital-insights/our-insights',
    date: 'September 2024',
  },
  {
    id: 'd3',
    title: 'The Leadership Imperative: Full Dataset',
    type: 'Report',
    pages: 62,
    topic: 'Leadership',
    url: 'https://www.example.com/capabilities/people-and-organizational-performance/our-insights',
    date: 'October 2024',
  },
  {
    id: 'd4',
    title: 'Agentic AI: A Framework for Enterprise Adoption',
    type: 'Brief',
    pages: 18,
    topic: 'Agentic AI',
    url: 'https://www.example.com/capabilities/quantumblack/our-insights',
    date: 'February 2025',
  },
  {
    id: 'd5',
    title: 'Heavy Industry Digital Playbook',
    type: 'Guide',
    pages: 36,
    topic: 'Digital Transformation',
    url: 'https://www.example.com/industries/advanced-electronics/our-insights',
    date: 'November 2024',
  },
]

// RAG: Simple keyword matching to find relevant references
export function findReferences(query: string): {
  blogs: Article[]
  videos: Video[]
  documents: Document[]
} {
  const q = query.toLowerCase()

  const keywords = {
    ai: ['ai', 'artificial intelligence', 'generative', 'chatgpt', 'machine learning', 'llm'],
    digital: ['digital', 'transform', 'technology', 'digitiz', 'industry 4', 'automation'],
    agentic: ['agentic', 'agent', 'autonomous', 'orchestrat'],
    leadership: ['leader', 'management', 'executive', 'culture', 'talent', 'ceo'],
    workplace: ['work', 'employee', 'productivity', 'workforce', 'team', 'organization'],
  }

  const topicMatch = (topics: string[]): boolean =>
    topics.some((t) => q.includes(t))

  const matchedBlogs = articles.filter((a) => {
    const text = `${a.title} ${a.tags.join(' ')} ${a.category}`.toLowerCase()
    return Object.values(keywords).some((kws) =>
      kws.some((k) => q.includes(k) && text.includes(k))
    ) || a.tags.some((t) => q.includes(t.toLowerCase()))
  })

  const matchedVideos = videos.filter((v) => {
    const text = v.title.toLowerCase()
    return Object.values(keywords).some((kws) =>
      kws.some((k) => q.includes(k) && (text.includes(k) || v.topic.toLowerCase().includes(k)))
    )
  })

  const matchedDocs = documents.filter((d) => {
    const text = `${d.title} ${d.topic}`.toLowerCase()
    return Object.values(keywords).some((kws) =>
      kws.some((k) => q.includes(k) && text.includes(k))
    )
  })

  // Fallback: return 2 of each if nothing matches specifically
  return {
    blogs: matchedBlogs.length ? matchedBlogs.slice(0, 3) : articles.slice(0, 2),
    videos: matchedVideos.length ? matchedVideos.slice(0, 2) : videos.slice(0, 2),
    documents: matchedDocs.length ? matchedDocs.slice(0, 2) : documents.slice(0, 2),
  }
}

export const trendingQuestions = [
  'How can my organization start its digital transformation journey?',
  'What qualities make someone a good leader?',
  'What is an agentic organization?',
  'How is AI changing productivity at work?',
  'What does the data say about AI adoption in 2025?',
  'How do heavy industries approach digital change?',
]
