// script.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '/config.js';

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
    container.innerHTML = `
        <div class="col-span-full text-center py-20">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mb-4"></div>
            <p class="text-zinc-500">Establishing connection to database...</p>
        </div>
    `;

    console.log('Starting to fetch projects from Supabase...');

    try {
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        // **CRITICAL: Log the full response to the console**
        console.log('Supabase Response:', { projects, error });

        if (error) {
            console.error('Supabase Query Error:', error);
            container.innerHTML = `
                <div class="col-span-full text-center py-20 border border-red-500/30 rounded-2xl bg-red-500/5">
                    <div class="text-red-400 font-medium mb-2">Database Connection Error</div>
                    <p class="text-zinc-500 text-sm mb-4">${error.message || 'Check console for details'}</p>
                    <a href="/admin.html" class="text-xs text-brand-400 hover:text-brand-300">Go to Admin Panel</a>
                </div>
            `;
            return;
        }

        // Check if projects exist
        if (!projects || projects.length === 0) {
            console.log('No projects found in the database.');
            container.innerHTML = `
                <div class="col-span-full text-center py-20 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                    <svg class="w-12 h-12 text-zinc-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25" />
                    </svg>
                    <p class="text-zinc-500 mb-2">Your projects will appear here once uploaded to the database.</p>
                    <p class="text-zinc-600 text-sm">Use the <a href="/admin.html" class="text-brand-400 hover:text-brand-300 underline">admin panel</a> to add your first project.</p>
                </div>
            `;
            return;
        }

        console.log(`Successfully loaded ${projects.length} project(s). Rendering...`);

        // Render projects if they exist
        container.innerHTML = projects.map(project => `
            <div class="group relative rounded-xl overflow-hidden glass-card transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <div class="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div class="aspect-video overflow-hidden bg-zinc-900 relative">
                    <div class="absolute inset-0 bg-brand-500/10 opacity-0 group-hover:opacity-20 transition-opacity z-10"></div>
                    <img src="${project.image_url}" alt="${project.title}" 
                         class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                         onerror="this.src='https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'" />
                </div>
                
                <div class="p-5 relative z-10">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors duration-300">${project.title}</h3>
                        ${project.link && project.link !== '#' ? `
                            <a href="${project.link}" target="_blank" class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 text-zinc-400 hover:text-white p-1">
                                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                            </a>
                        ` : ''}
                    </div>
                    <p class="text-zinc-400 text-sm mb-4 line-clamp-2 group-hover:text-zinc-300 transition-colors">${project.description}</p>
                    <div class="flex flex-wrap gap-2">
                        ${Array.isArray(project.tags) ? project.tags.map(tag => `
                            <span class="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-zinc-300 group-hover:border-brand-500/20 transition-colors">${tag.trim()}</span>
                        `).join('') : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        console.log('Projects rendered successfully.');
        
    } catch (err) {
        console.error('Unexpected error in loadProjects:', err);
        container.innerHTML = `
            <div class="col-span-full text-center py-20">
                <div class="text-red-400 font-medium mb-2">Unexpected Error</div>
                <p class="text-zinc-500 text-sm">${err.message || 'Please check the browser console'}</p>
            </div>
        `;
    }
}

// Initialize
loadProjects();