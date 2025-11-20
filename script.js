// script.js
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY } from '/config.js';

// --- INIT SUPABASE ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- SCROLL REVEAL ANIMATION ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal-section').forEach(s => observer.observe(s));

// --- NAVBAR ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('glass-card-strong');
    navbar.classList.remove('bg-transparent', 'pt-4');
  } else {
    navbar.classList.remove('glass-card-strong');
    navbar.classList.add('bg-transparent', 'pt-4');
  }
});

// --- LOAD PROJECTS FROM SUPABASE ---
async function loadProjects() {
    const container = document.getElementById('projects-grid');
    
    // Show loading skeleton
    container.innerHTML = `<div class="text-zinc-500 animate-pulse">Establishing connection to database...</div>`;

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !projects) {
        container.innerHTML = `<div class="text-red-500">Error loading portfolio protocol.</div>`;
        return;
    }

    container.innerHTML = projects.map(project => `
      <div class="group relative rounded-xl overflow-hidden glass-card transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div class="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          
          <div class="aspect-video overflow-hidden bg-zinc-900 relative">
              <div class="absolute inset-0 bg-brand-500/10 opacity-0 group-hover:opacity-20 transition-opacity z-10"></div>
              <img src="${project.image_url}" alt="${project.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
          </div>
          
          <div class="p-5 relative z-10">
              <div class="flex justify-between items-start mb-2">
                  <h3 class="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors duration-300">${project.title}</h3>
                  <a href="${project.link}" target="_blank" class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 text-zinc-400 hover:text-white p-1">
                      <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                  </a>
              </div>
              <p class="text-zinc-400 text-sm mb-4 line-clamp-2 group-hover:text-zinc-300 transition-colors">${project.description}</p>
              <div class="flex flex-wrap gap-2">
                  ${project.tags.map(tag => `<span class="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-zinc-300 group-hover:border-brand-500/20 transition-colors">${tag}</span>`).join('')}
              </div>
          </div>
      </div>
    `).join('');
}

// --- AI CHAT (FIXED & TRAINED) ---
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const messagesContainer = document.getElementById('chat-messages');
let chatSession = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // *** FIX 1: Use specific version "gemini-1.5-flash-001" to avoid 404 ***
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-001", 
        systemInstruction: `
You are ApexBot, the AI interface for Apex.dev. 
Your Persona: Concise, professional, futuristic, highly technical but accessible.
Your Goal: Convert visitors into clients for Apex.dev engineering services.

**KNOWLEDGE BASE (Use this to answer questions):**

[SERVICES & PRICING]
1. MVP Sprint - M2,499 (One-time)
   - For: Startups needing rapid prototyping.
   - Includes: Next.js Architecture, Supabase Auth & DB, Stripe Integration.
   - Delivery: 14 Days.

2. Production Scale - M3,499/project (Most Popular)
   - For: Complete SaaS solutions for scale.
   - Includes: Microservices, Advanced Caching, CI/CD Pipelines.

3. Architecture Retainer - M5,499/month
   - For: Ongoing fractional CTO services.
   - Includes: Code Reviews, System Design, Team Mentoring.

[CONTACT INFO]
- WhatsApp: +266 6251 0193
- Email: thaanemoletsane@gmail.com

[YOUR CAPABILITIES]
- You specialize in: React 19, Next.js, TypeScript, Supabase, PostgreSQL, Gemini AI.
- You deliver: High-performance, enterprise-grade engineering.

If asked about prices, quote them exactly in Maloti (M).
If asked to start a project, direct them to the WhatsApp or Email.
        `,
    });

    chatSession = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
        },
    });
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || !chatSession) return;

    // User Msg
    messagesContainer.innerHTML += `<div class="flex justify-end mb-4"><div class="max-w-[85%] rounded-lg px-4 py-2.5 text-sm bg-zinc-800 text-white border border-zinc-700">${text}</div></div>`;
    chatInput.value = '';
    scrollToBottom();

    // AI Msg Placeholder
    const aiMsgDiv = document.createElement('div');
    aiMsgDiv.className = "flex justify-start mb-4";
    aiMsgDiv.innerHTML = `<div class="max-w-[85%] rounded-lg px-4 py-2.5 text-sm bg-brand-900/20 text-brand-50 border border-brand-500/10">...</div>`;
    messagesContainer.appendChild(aiMsgDiv);
    scrollToBottom();

    try {
        const result = await chatSession.sendMessageStream(text);
        let fullText = "";
        const bubble = aiMsgDiv.querySelector('div');
        
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            bubble.textContent = fullText;
            scrollToBottom();
        }
    } catch (err) {
        console.error("AI Error details:", err);
        aiMsgDiv.querySelector('div').textContent = "Connection Error: " + err.message;
    }
});

// Initialize
loadProjects();