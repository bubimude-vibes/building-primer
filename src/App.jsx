import { useState } from "react";

const SITE = {
  github: "https://github.com/youruser/primer",
  substack: "https://yoursubstack.substack.com",
};

const C = {
  bg: "#FAF9F7",
  surface: "#FFFFFF",
  surfaceWarm: "#F8F6F2",
  text: "#2D2A26",
  textSecondary: "#5E5850",
  textMuted: "#A09888",
  border: "#EBE7E0",
  green: "#2EBD8E",
  blue: "#4BA0E5",
};

const gradient = `linear-gradient(135deg, ${C.green}, ${C.blue})`;
const gradientText = { background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" };

// ─── Posts ────────────────────────────────────────────────────

const POSTS = [
  {
    id: 1,
    slug: "why-im-building-primer",
    title: "Why I'm Building Primer",
    date: "May 21, 2026",
    readTime: "5 min",
    tags: ["vision", "parenting"],
    excerpt: "We spend a lot of energy as parents worrying about our kids and their devices. Meanwhile we're glued to our own. The kids have noticed.",
    body: [
      { type: "text", content: "We spend a lot of energy as parents worrying about our kids and their devices. Screen time limits, app restrictions, lectures about attention spans. Meanwhile we're glued to our own. The kids have noticed." },
      { type: "text", content: "There's something off about the whole framing. We treat devices like a threat to be managed when we know they aren't going away. We know our kids will build their lives around them. We know AI is about to make all of this more intense, not less. And our best collective strategy is restriction?" },
      { type: "text", content: "I don't think the problem is that kids use devices. The problem is that nobody is building the right experience for them." },
      { type: "text", content: "The apps my kids have access to are designed to retain them. Engagement metrics, notification loops, infinite scroll, streaks that punish you for missing a day. Even the \"educational\" ones are mostly built around the same model — keep the kid on the app as long as possible, make the numbers go up, report usage stats to parents so everyone feels good about screen time that's supposedly productive." },
      { type: "text", content: "None of that is designed for my kids' benefit. It's designed for a business model. And I think most parents sense this even if they can't articulate it." },
      { type: "text", content: "So rather than fighting a losing war against devices, I decided to build something worth putting on one." },
      { type: "heading", content: "The Name" },
      { type: "text", content: "Primer comes from Neal Stephenson's 1995 novel The Diamond Age. In the book there's a device called the Young Lady's Illustrated Primer — an interactive book powered by AI that adapts to its reader. It guides a young girl's education through story, challenge, and conversation. It doesn't do her thinking for her. It makes her a better thinker. It meets her where she is and grows with her." },
      { type: "text", content: "Stephenson wrote this thirty years ago as science fiction. The technology to actually build it exists now. Not a perfect version — not yet — but something real, something functional, something that captures the core idea: a personalized AI thinking partner shaped around a specific kid, designed to educate and build curiosity and support them in becoming someone who trusts their own mind." },
      { type: "text", content: "That's what I'm trying to build." },
      { type: "heading", content: "What I Actually Want For My Kids" },
      { type: "text", content: "When I stopped reacting to the screen time problem and started thinking about what I actually wanted, the answer was surprisingly clear." },
      { type: "text", content: "I want my kids to practice making decisions. Real ones, not multiple choice. The kind where you take a position, defend it, and live with the outcome. The world is going to demand agency from them and right now almost nothing in their digital lives asks them to exercise it. Everything is built around consuming and reacting rather than choosing and thinking." },
      { type: "text", content: "I want them to stay curious. Not in the vague inspirational poster sense. In the practical sense of following a question further than the first answer, of noticing connections between things they're learning in different subjects, of developing the habit of going deeper instead of scrolling past." },
      { type: "text", content: "I want them to build a healthy relationship with AI before the rest of the world decides what that relationship should look like. They're going to work alongside these tools for their entire lives. The habits they form now — whether they use AI as a crutch that does their thinking or as a partner that sharpens it — will shape how capable they are in a world that's going to change faster than any generation before them has experienced." },
      { type: "text", content: "And I want them to have these things inside a product where every single design decision is made for their growth. Not for engagement. Not for retention. Not for a quarterly earnings call. For them." },
      { type: "text", content: "No company is going to build that. So I am." },
      { type: "heading", content: "What This Blog Is For" },
      { type: "text", content: "I'm documenting the entire process here. Not as a polished case study but as a real build log — the decisions I'm making, why I'm making them, what's working, what isn't, what I'd do differently if I started over." },
      { type: "text", content: "I'm a creative director working with AI to build something beyond my traditional skill set. That means the technical architecture won't always be elegant. It means I'm learning as I go and making mistakes in public. It also means I'm approaching this as a design problem first and an engineering problem second, which I think produces a different kind of product than what engineers building for kids typically create." },
      { type: "text", content: "The project is open source because I think every parent should be able to build something like this for their own kids if they want to. The code will be available. The reasoning behind the code will be here. And if you're a developer who can make it better, I want your help." },
      { type: "text", content: "Next post I'll get into the actual architecture — how the system is structured, what the agents look like under the hood, and the first round of design decisions that shaped everything that followed." },
    ],
  },
];

// ─── Components ───────────────────────────────────────────────

function Header({ onHome }) {
  return (
    <header style={{ padding: "28px 0 24px", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div onClick={onHome} style={{ cursor: "pointer" }}>
          <img src="/logo.png" style={{ width: 80, height: 80 }} alt="Primer" />
        </div>
      </div>
    </header>
  );
}

function HeroBanner() {
  return (
    <div style={{ padding: "48px 24px 44px", borderBottom: `1px solid ${C.border}`, background: C.surfaceWarm }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 30,
          fontWeight: 400,
          color: C.text,
          margin: "0 0 20px",
          lineHeight: 1.25,
          letterSpacing: "-0.5px",
        }}>
          Building <span style={gradientText}>Primer</span>
        </h2>
        <div style={{
          fontSize: 16, lineHeight: 1.8, color: C.textSecondary,
          fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 400,
          display: "flex", flexDirection: "column", gap: 16, maxWidth: 620,
        }}>
          <p style={{ margin: 0 }}>
            I'm a creative director, not a software engineer. Primer is a personalized AI platform I'm building for my kids. It's a thinking partner designed to educate, build curiosity, and support them in becoming people who trust their own thinking.
          </p>
          <p style={{ margin: 0 }}>
            Working with AI agents has given me something I didn't expect — the agency to build exactly what my kids need with no profit motive, no engagement metrics, no retention goals shaping the design. Every decision is made for one reason: their growth. That freedom changes everything about what the product becomes.
          </p>
          <p style={{ margin: 0 }}>
            This blog is the build log. Design decisions, technical hurdles, mistakes, breakthroughs. The project is open source because the question it's trying to answer — <em>what should an AI relationship with a kid actually look like</em> — deserves more people working on it. Follow along, fork it, tell me what I'm doing wrong.
          </p>
          <div style={{ display: "flex", gap: 20, paddingTop: 6 }}>
            <a href={SITE.github} style={{ fontSize: 13, color: C.green, textDecoration: "none", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>GitHub →</a>
            <a href={SITE.substack} style={{ fontSize: 13, color: C.blue, textDecoration: "none", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Substack →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onClick, featured }) {
  return (
    <article
      onClick={onClick}
      style={{ padding: featured ? "36px 0 32px" : "28px 0", borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "opacity 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >
      {featured && <div style={{ fontSize: 11, fontWeight: 600, fontFamily: "'Outfit', sans-serif", letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 12, ...gradientText }}>Latest</div>}
      <h2 style={{
        fontFamily: "'Source Serif 4', Georgia, serif",
        fontSize: featured ? 28 : 21,
        fontWeight: 400,
        color: C.text,
        margin: "0 0 8px",
        lineHeight: 1.3,
        letterSpacing: "-0.3px",
      }}>{post.title}</h2>
      <p style={{
        fontSize: 15, lineHeight: 1.7, color: C.textSecondary, margin: "0 0 12px",
        fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 400,
      }}>{post.excerpt}</p>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Outfit', sans-serif" }}>{post.date}</span>
        <span style={{ fontSize: 12, color: C.textMuted }}>·</span>
        <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Outfit', sans-serif" }}>{post.readTime}</span>
        {post.tags.map(t => (
          <span key={t} style={{
            padding: "2px 8px", borderRadius: 4,
            background: `${C.green}08`, color: C.textMuted,
            fontSize: 11, fontWeight: 500, fontFamily: "'Outfit', sans-serif",
          }}>{t}</span>
        ))}
      </div>
    </article>
  );
}

function PostView({ post, onBack }) {
  return (
    <div style={{ paddingTop: 12 }}>
      <button onClick={onBack} style={{
        fontSize: 13, color: C.textMuted, background: "none", border: "none",
        cursor: "pointer", fontFamily: "'Outfit', sans-serif", padding: "0 0 28px", fontWeight: 500,
      }}>← Back</button>
      <article>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Outfit', sans-serif" }}>{post.date}</span>
          <span style={{ color: C.border }}>·</span>
          <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Outfit', sans-serif" }}>{post.readTime}</span>
          {post.tags.map(t => (
            <span key={t} style={{ padding: "2px 8px", borderRadius: 4, background: `${C.green}08`, color: C.textMuted, fontSize: 11, fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>{t}</span>
          ))}
        </div>
        <h1 style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 36, fontWeight: 400, color: C.text,
          margin: "0 0 36px", lineHeight: 1.2, letterSpacing: "-0.5px",
        }}>{post.title}</h1>

        <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17.5, lineHeight: 1.85, color: C.text }}>
          {post.body.map((block, i) => {
            if (block.type === "text") return <p key={i} style={{ margin: "0 0 24px" }}>{block.content}</p>;
            if (block.type === "heading") return <h2 key={i} style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 24, fontWeight: 400, color: C.text, margin: "40px 0 16px", letterSpacing: "-0.3px" }}>{block.content}</h2>;
            if (block.type === "image") return (
              <div key={i} style={{ margin: "32px 0", width: "100%", aspectRatio: block.aspect || "16/9", borderRadius: 14, background: `linear-gradient(145deg, ${C.green}10, ${C.blue}08)`, border: `1px solid ${C.green}15` }} />
            );
            if (block.type === "code") return (
              <pre key={i} style={{
                background: C.surfaceWarm, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: "18px 22px", fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                fontSize: 13, lineHeight: 1.75, color: C.textSecondary, overflowX: "auto", margin: "28px 0",
              }}>{block.content}</pre>
            );
            return null;
          })}
        </div>
      </article>
    </div>
  );
}

function Footer({ onAdmin, isAdmin }) {
  return (
    <footer style={{ marginTop: 60, padding: "28px 0", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic" }}>projectprimer.blog</span>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <a href={SITE.github} style={{ fontSize: 12, color: C.textMuted, textDecoration: "none", fontFamily: "'Outfit', sans-serif" }}>GitHub</a>
        <a href={SITE.substack} style={{ fontSize: 12, color: C.textMuted, textDecoration: "none", fontFamily: "'Outfit', sans-serif" }}>Substack</a>
        <button onClick={onAdmin} style={{
          fontSize: 11, background: isAdmin ? `${C.green}10` : "transparent",
          border: `1px solid ${isAdmin ? `${C.green}25` : "transparent"}`,
          color: isAdmin ? C.green : C.textMuted,
          borderRadius: 6, padding: "4px 10px", cursor: "pointer",
          fontFamily: "'Outfit', sans-serif", fontWeight: 600,
        }}>{isAdmin ? "← Blog" : "Admin"}</button>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("list");
  const [selectedPost, setSelectedPost] = useState(null);
  const isAdmin = view === "admin";
  const goHome = () => { setView("list"); setSelectedPost(null); };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Outfit', sans-serif" }}>
      <Header onHome={goHome} />
      {view === "list" && <HeroBanner />}

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
        {view === "list" && (
          <div>
            {POSTS.map((p, i) => (
              <PostCard key={p.id} post={p} onClick={() => { setSelectedPost(p); setView("post"); }} featured={i === 0} />
            ))}
          </div>
        )}
        {view === "post" && selectedPost && <PostView post={selectedPost} onBack={goHome} />}
        <Footer onAdmin={() => setView(isAdmin ? "list" : "admin")} isAdmin={isAdmin} />
      </main>
    </div>
  );
}
