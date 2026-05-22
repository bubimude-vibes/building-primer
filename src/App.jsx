import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const SITE = {
  github: "https://github.com/bubimude-vibes/primer",
  substack: "https://substack.com/@benjithiem",
};

const C = {
  bg: "#111114",
  surface: "#18181B",
  surfaceWarm: "#1C1C20",
  surfaceHover: "#222228",
  text: "#E4E4E8",
  textSecondary: "#9898A0",
  textMuted: "#5C5C66",
  border: "#2A2A30",
  green: "#2EBD8E",
  blue: "#4BA0E5",
  red: "#D45555",
};

const gradient = `linear-gradient(135deg, ${C.green}, ${C.blue})`;
const gradientText = { background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" };

// ─── Seed Post (shown if Supabase isn't set up yet) ──────────

const SEED_POST = {
  id: 1,
  slug: "why-im-building-primer",
  title: "Why I'm Building Primer",
  date: "May 21, 2026",
  read_time: "5 min",
  tags: ["vision", "parenting"],
  excerpt: "We spend a lot of energy as parents worrying about our kids and their devices. Meanwhile we're glued to our own. The kids have noticed.",
  published: true,
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
};

// ─── Text to Blocks Parser ──────────────────────────────────

function textToBlocks(text) {
  const blocks = [];
  const fenceRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  while ((match = fenceRegex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index).trim();
    if (before) {
      before.split("\n\n").filter(Boolean).forEach(p => {
        const t = p.trim();
        if (t.startsWith("## ")) blocks.push({ type: "heading", content: t.slice(3) });
        else {
          const imgMatch = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
          if (imgMatch) blocks.push({ type: "image", content: imgMatch[1], url: imgMatch[2] });
          else blocks.push({ type: "text", content: t });
        }
      });
    }
    const lang = match[1].toLowerCase();
    if (lang === "svg") blocks.push({ type: "svg", content: match[2].trim() });
    else blocks.push({ type: "code", content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }
  const remaining = text.slice(lastIndex).trim();
  if (remaining) {
    remaining.split("\n\n").filter(Boolean).forEach(p => {
      const t = p.trim();
      if (t.startsWith("## ")) blocks.push({ type: "heading", content: t.slice(3) });
      else {
        const imgMatch = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) blocks.push({ type: "image", content: imgMatch[1], url: imgMatch[2] });
        else blocks.push({ type: "text", content: t });
      }
    });
  }
  return blocks;
}

function blocksToText(blocks) {
  return blocks.map(b => {
    if (b.type === "heading") return `## ${b.content}`;
    if (b.type === "code") return "```\n" + b.content + "\n```";
    if (b.type === "svg") return "```svg\n" + b.content + "\n```";
    if (b.type === "image") return `![${b.content || ""}](${b.url})`;
    return b.content;
  }).join("\n\n");
}

// ─── Data Layer ──────────────────────────────────────────────

function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts(includeUnpublished = false) {
    setLoading(true);
    if (supabase) {
      let query = supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (!includeUnpublished) query = query.eq("published", true);
      const { data } = await query;
      if (data) setPosts(data.map(p => ({ ...p, body: typeof p.body === "string" ? JSON.parse(p.body) : p.body })));
    } else {
      setPosts([SEED_POST]);
    }
    setLoading(false);
  }

  async function savePost(post) {
    if (!supabase) return;
    const payload = {
      title: post.title,
      slug: post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/,""),
      excerpt: post.excerpt,
      body: JSON.stringify(post.body),
      tags: post.tags,
      date: post.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      read_time: post.read_time || `${Math.max(1, Math.ceil(blocksToText(post.body).split(/\s+/).length / 200))} min`,
      published: post.published ?? true,
    };
    if (post.id) {
      await supabase.from("posts").update(payload).eq("id", post.id);
    } else {
      await supabase.from("posts").insert(payload);
    }
    await fetchPosts(true);
  }

  async function deletePost(id) {
    if (!supabase) return;
    await supabase.from("posts").delete().eq("id", id);
    await fetchPosts(true);
  }

  return { posts, loading, fetchPosts, savePost, deletePost };
}

// ─── Auth ────────────────────────────────────────────────────

function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data?.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
    return () => listener?.subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    if (!supabase) return { error: "Supabase not configured" };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }

  return { user, login, logout };
}

// ─── Components ──────────────────────────────────────────────

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
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
        <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 30, fontWeight: 400, color: C.text, margin: "0 0 20px", lineHeight: 1.25, letterSpacing: "-0.5px" }}>
          Building <span style={gradientText}>Primer</span>
        </h2>
        <div style={{ fontSize: 16, lineHeight: 1.8, color: C.textSecondary, fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 400, display: "flex", flexDirection: "column", gap: 16, maxWidth: 620 }}>
          <p style={{ margin: 0 }}>Primer is a personalized AI platform I'm building for my kids. It's a thinking partner designed to educate, build curiosity, and support them in becoming people who trust their own thinking.</p>
          <p style={{ margin: 0 }}>Working with AI agents has given me something I didn't expect — the agency to build exactly what my kids need with no profit motive, no engagement metrics, no retention goals shaping the design. Every decision is made for one reason: their growth. That freedom changes everything about what the product becomes.</p>
          <p style={{ margin: 0 }}>This blog is the build log. Design decisions, technical hurdles, mistakes, breakthroughs. The project is open source because the question it's trying to answer — <em style={{ fontStyle: "italic" }}>what should an AI relationship with a kid actually look like</em> — deserves more people working on it. Follow along, fork it, tell me what I'm doing wrong.</p>
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
    <article onClick={onClick} style={{ padding: featured ? "36px 0 32px" : "28px 0", borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "opacity 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
      {featured && <div style={{ fontSize: 11, fontWeight: 600, fontFamily: "'Outfit', sans-serif", letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 12, ...gradientText }}>Latest</div>}
      <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: featured ? 28 : 21, fontWeight: 400, color: C.text, margin: "0 0 8px", lineHeight: 1.3, letterSpacing: "-0.3px" }}>{post.title}</h2>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: C.textSecondary, margin: "0 0 12px", fontFamily: "'Source Serif 4', Georgia, serif" }}>{(post.excerpt || "").replace(/!\[[^\]]*\]\([^)]+\)/g, "").trim()}</p>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Outfit', sans-serif" }}>{post.date}</span>
        <span style={{ fontSize: 12, color: C.textMuted }}>·</span>
        <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Outfit', sans-serif" }}>{post.read_time}</span>
        {(post.tags || []).map(t => <span key={t} style={{ padding: "2px 8px", borderRadius: 4, background: `${C.green}12`, color: C.textMuted, fontSize: 11, fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>{t}</span>)}
      </div>
    </article>
  );
}

function Comments({ slug }) {
  useEffect(() => {
    const container = document.getElementById("giscus-container");
    if (!container) return;
    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "bubimude-vibes/building-primer");
    script.setAttribute("data-repo-id", "R_kgDOSkJB2Q");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDOSkJB2c4C9jqh");
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", slug || "");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "noborder_dark");
    script.setAttribute("data-lang", "en");
    script.crossOrigin = "anonymous";
    script.async = true;
    container.appendChild(script);
  }, [slug]);

  return <div id="giscus-container" style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${C.border}` }} />;
}

function PostView({ post, onBack }) {
  const body = Array.isArray(post.body) ? post.body : [];
  return (
    <div style={{ paddingTop: 12 }}>
      <button onClick={onBack} style={{ fontSize: 13, color: C.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", padding: "0 0 28px", fontWeight: 500 }}>← Back</button>
      <article>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Outfit', sans-serif" }}>{post.date}</span>
          <span style={{ color: C.border }}>·</span>
          <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Outfit', sans-serif" }}>{post.read_time}</span>
          {(post.tags || []).map(t => <span key={t} style={{ padding: "2px 8px", borderRadius: 4, background: `${C.green}12`, color: C.textMuted, fontSize: 11, fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>{t}</span>)}
        </div>
        <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 36, fontWeight: 400, color: C.text, margin: "0 0 36px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>{post.title}</h1>
        <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17.5, lineHeight: 1.85, color: C.textSecondary }}>
          {body.map((block, i) => {
            if (block.type === "text") return <p key={i} style={{ margin: "0 0 24px" }}>{block.content}</p>;
            if (block.type === "heading") return <h2 key={i} style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 24, fontWeight: 400, color: C.text, margin: "40px 0 16px", letterSpacing: "-0.3px" }}>{block.content}</h2>;
            if (block.type === "image") return <figure key={i} style={{ margin: "32px 0" }}><img src={block.url} alt={block.content || ""} style={{ width: "100%", borderRadius: 10, border: `1px solid ${C.border}` }} />{block.content && <figcaption style={{ fontSize: 13, color: C.textMuted, marginTop: 8, fontFamily: "'Outfit', sans-serif", fontStyle: "italic" }}>{block.content}</figcaption>}</figure>;
            if (block.type === "svg") return <div key={i} style={{ margin: "32px 0", width: "100%", overflow: "hidden", borderRadius: 10 }} dangerouslySetInnerHTML={{ __html: block.content }} />;
            if (block.type === "code") return <pre key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 22px", fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontSize: 13, lineHeight: 1.75, color: C.textSecondary, overflowX: "auto", margin: "28px 0" }}>{block.content}</pre>;
            return null;
          })}
        </div>
        <Comments slug={post.slug} />
      </article>
    </div>
  );
}

// ─── Admin ───────────────────────────────────────────────────

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await onLogin(email, password);
    if (result.error) setError(result.error);
    setLoading(false);
  }

  return (
    <div style={{ paddingTop: 60, maxWidth: 340, margin: "0 auto" }}>
      <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 24, fontWeight: 400, color: C.text, marginBottom: 24 }}>Admin</h2>
      {!supabase && <p style={{ color: C.red, fontSize: 13, marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
          style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: "none" }} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password"
          style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: "none" }} />
        {error && <p style={{ color: C.red, fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>{error}</p>}
        <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px 0", borderRadius: 8, border: "none", background: gradient, color: "#fff", fontSize: 14, fontFamily: "'Outfit', sans-serif", fontWeight: 600, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </div>
  );
}

function AdminPanel({ posts, onSave, onDelete, onLogout, fetchPosts }) {
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchPosts(true); }, []);

  function startNew() {
    setEditing("new"); setTitle(""); setExcerpt(""); setBodyText(""); setTags(""); setPublished(true);
  }

  function startEdit(post) {
    setEditing(post.id);
    setTitle(post.title);
    setExcerpt(post.excerpt || "");
    setBodyText(blocksToText(Array.isArray(post.body) ? post.body : []));
    setTags((post.tags || []).join(", "));
    setPublished(post.published ?? true);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { data, error } = await supabase.storage.from("images").upload(name, file, { contentType: file.type });
    if (error) {
      alert("Upload failed: " + error.message + "\n\nMake sure you created the 'images' storage bucket in Supabase (see SETUP.md step 3).");
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(name);
    const imageMarkdown = `![${file.name.replace(/\.[^.]+$/, "")}](${urlData.publicUrl})`;
    const textarea = document.getElementById("post-body-editor");
    const pos = textarea?.selectionStart ?? bodyText.length;
    const before = bodyText.slice(0, pos);
    const after = bodyText.slice(pos);
    const needsNewlineBefore = before.length > 0 && !before.endsWith("\n\n") ? "\n\n" : "";
    const needsNewlineAfter = after.length > 0 && !after.startsWith("\n\n") ? "\n\n" : "";
    setBodyText(before + needsNewlineBefore + imageMarkdown + needsNewlineAfter + after);
    setUploading(false);
    e.target.value = "";
  }

  function handleSvgUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const svgContent = ev.target.result.trim();
      if (!svgContent.includes("<svg")) {
        alert("This doesn't look like an SVG file.");
        return;
      }
      const svgBlock = "```svg\n" + svgContent + "\n```";
      const textarea = document.getElementById("post-body-editor");
      const pos = textarea?.selectionStart ?? bodyText.length;
      const before = bodyText.slice(0, pos);
      const after = bodyText.slice(pos);
      const needsNewlineBefore = before.length > 0 && !before.endsWith("\n\n") ? "\n\n" : "";
      const needsNewlineAfter = after.length > 0 && !after.startsWith("\n\n") ? "\n\n" : "";
      setBodyText(before + needsNewlineBefore + svgBlock + needsNewlineAfter + after);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleSave() {
    setSaving(true);
    await onSave({
      id: editing === "new" ? null : editing,
      title,
      excerpt: excerpt || bodyText.split("\n\n")[0]?.slice(0, 160) || "",
      body: textToBlocks(bodyText),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      published,
    });
    setSaving(false);
    setEditing(null);
  }

  if (editing !== null) {
    return (
      <div style={{ paddingTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 400, color: C.text }}>{editing === "new" ? "New Post" : "Editing"}</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditing(null)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textSecondary, fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "8px 22px", borderRadius: 8, border: "none", background: gradient, color: "#fff", fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving..." : published ? "Publish" : "Save Draft"}
            </button>
          </div>
        </div>

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"
          style={{ width: "100%", fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 30, fontWeight: 400, color: C.text, border: "none", outline: "none", padding: "0 0 16px", borderBottom: `1px solid ${C.border}`, background: "transparent", letterSpacing: "-0.3px" }} />

        <input value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Excerpt — the preview text shown on the blog list"
          style={{ width: "100%", fontFamily: "'Outfit', sans-serif", fontSize: 14, color: C.textSecondary, border: "none", outline: "none", padding: "14px 0", borderBottom: `1px solid ${C.border}`, background: "transparent" }} />

        <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags — vision, design, building, lessons learned"
          style={{ width: "100%", fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.textMuted, border: "none", outline: "none", padding: "14px 0", borderBottom: `1px solid ${C.border}`, background: "transparent" }} />

        <div style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Outfit', sans-serif" }}>
              <code style={{ background: C.surface, padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>## Heading</code> · blank lines between paragraphs · <code style={{ background: C.surface, padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>```code```</code>
            </span>
            <input type="file" id="img-upload" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
            <button onClick={() => document.getElementById("img-upload").click()} disabled={uploading} style={{ fontSize: 12, color: uploading ? C.textMuted : C.blue, background: `${C.blue}12`, border: `1px solid ${C.blue}25`, borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600, opacity: uploading ? 0.5 : 1 }}>
              {uploading ? "Uploading..." : "Add image"}
            </button>
            <input type="file" id="svg-upload" accept=".svg" onChange={handleSvgUpload} style={{ display: "none" }} />
            <button onClick={() => document.getElementById("svg-upload").click()} style={{ fontSize: 12, color: C.green, background: `${C.green}12`, border: `1px solid ${C.green}25`, borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              Add SVG
            </button>
          </div>
          <button onClick={() => setPublished(!published)} style={{ fontSize: 12, color: published ? C.green : C.textMuted, background: `${published ? C.green : C.textMuted}12`, border: `1px solid ${published ? C.green : C.textMuted}30`, borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
            {published ? "Published" : "Draft"}
          </button>
        </div>

        <textarea id="post-body-editor" value={bodyText} onChange={e => setBodyText(e.target.value)} placeholder="Start writing..."
          style={{ width: "100%", minHeight: 400, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17.5, lineHeight: 1.85, color: C.text, border: "none", outline: "none", padding: "20px 0", background: "transparent", resize: "vertical" }} />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 400, color: C.text }}>Posts</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onLogout} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 500, cursor: "pointer" }}>Log out</button>
          <button onClick={startNew} style={{ padding: "8px 22px", borderRadius: 8, border: "none", background: gradient, color: "#fff", fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 600, cursor: "pointer" }}>+ New Post</button>
        </div>
      </div>

      {posts.map(post => (
        <div key={post.id} style={{ padding: "16px 20px", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface, cursor: "pointer", transition: "border-color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = `${C.green}40`} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
          <div onClick={() => startEdit(post)} style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, color: C.text }}>{post.title}</span>
              {!post.published && <span style={{ fontSize: 10, color: C.textMuted, background: `${C.textMuted}15`, padding: "1px 6px", borderRadius: 4, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>DRAFT</span>}
            </div>
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Outfit', sans-serif" }}>{post.date}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span onClick={() => startEdit(post)} style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Outfit', sans-serif", fontWeight: 500, cursor: "pointer" }}>Edit</span>
            <span onClick={() => { if (confirm("Delete this post?")) onDelete(post.id); }} style={{ fontSize: 12, color: C.red, fontFamily: "'Outfit', sans-serif", fontWeight: 500, cursor: "pointer" }}>Delete</span>
          </div>
        </div>
      ))}
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
        <button onClick={onAdmin} style={{ fontSize: 11, background: isAdmin ? `${C.green}15` : "transparent", border: `1px solid ${isAdmin ? `${C.green}30` : "transparent"}`, color: isAdmin ? C.green : C.textMuted, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{isAdmin ? "← Blog" : "Admin"}</button>
      </div>
    </footer>
  );
}

// ─── App ─────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("list");
  const [selectedPost, setSelectedPost] = useState(null);
  const { posts, loading, fetchPosts, savePost, deletePost } = usePosts();
  const { user, login, logout } = useAuth();
  const isAdmin = view === "admin";
  const publishedPosts = posts.filter(p => p.published);

  const goHome = () => { window.history.pushState({ view: "list" }, ""); setView("list"); setSelectedPost(null); fetchPosts(); };
  const openPost = (p) => { window.history.pushState({ view: "post", slug: p.slug }, ""); setSelectedPost(p); setView("post"); };
  const openAdmin = () => { const next = isAdmin ? "list" : "admin"; window.history.pushState({ view: next }, ""); setView(next); };

  useEffect(() => {
    const onPop = () => { setView("list"); setSelectedPost(null); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Outfit', sans-serif" }}>
      <Header onHome={goHome} />
      {view === "list" && <HeroBanner />}

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
        {view === "list" && (
          <div>
            {loading ? <p style={{ padding: "40px 0", color: C.textMuted, fontFamily: "'Outfit', sans-serif" }}>Loading...</p> :
              publishedPosts.map((p, i) => <PostCard key={p.id} post={p} onClick={() => openPost(p)} featured={i === 0} />)
            }
          </div>
        )}
        {view === "post" && selectedPost && <PostView post={selectedPost} onBack={goHome} />}
        {view === "admin" && !user && <LoginForm onLogin={login} />}
        {view === "admin" && user && <AdminPanel posts={posts} onSave={savePost} onDelete={deletePost} onLogout={() => { logout(); goHome(); }} fetchPosts={fetchPosts} />}
        <Footer onAdmin={openAdmin} isAdmin={isAdmin} />
      </main>
    </div>
  );
}
