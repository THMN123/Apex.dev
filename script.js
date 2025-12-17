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

// ==========================================
// 1. LOAD PROJECTS FROM SUPABASE (With Full Card Links)
// ==========================================
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

        // Render projects if they exist - Entire card is now clickable
        container.innerHTML = projects.map(project => {
            // Check if project has a valid link
            const hasLink = project.link && project.link !== '#' && project.link !== '';
            
            // Create the card content
            const cardContent = `
                <div class="group relative h-full flex flex-col rounded-2xl overflow-hidden glass-card transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:-translate-y-1">
                    <div class="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    
                    <div class="aspect-video overflow-hidden bg-zinc-900 relative">
                        <div class="absolute inset-0 bg-brand-500/10 opacity-0 group-hover:opacity-20 transition-opacity z-10"></div>
                        <img src="${project.image_url}" alt="${project.title}" 
                             class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                             onerror="this.src='https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'" />
                        
                        <!-- External Link Indicator (only shown on hover) -->
                        ${hasLink ? `
                            <div class="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                <svg class="w-4 h-4 text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="p-5 relative z-10 flex-1 flex flex-col">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors duration-300">${project.title}</h3>
                            ${hasLink ? `
                                <svg class="w-5 h-5 text-brand-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" 
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            ` : ''}
                        </div>
                        <p class="text-zinc-400 text-sm mb-4 line-clamp-2 group-hover:text-zinc-300 transition-colors flex-1">${project.description}</p>
                        <div class="flex flex-wrap gap-2">
                            ${Array.isArray(project.tags) ? project.tags.map(tag => `
                                <span class="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-zinc-300 group-hover:border-brand-500/20 transition-colors">${tag.trim()}</span>
                            `).join('') : ''}
                        </div>
                    </div>
                </div>
            `;

            // Wrap in anchor tag if there's a valid link, otherwise use div
            if (hasLink) {
                return `
                    <a href="${project.link}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       class="block h-full focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-dark-950 rounded-2xl"
                       aria-label="View ${project.title} project">
                        ${cardContent}
                    </a>
                `;
            } else {
                return `
                    <div class="h-full cursor-default">
                        ${cardContent}
                    </div>
                `;
            }
        }).join('');
        
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

// ==========================================
// 2. LOAD PRICING PLANS (Dynamic with Sales)
// ==========================================
async function loadPricing() {
    const container = document.getElementById('pricing-grid');
    
    // Show loading skeleton
    container.innerHTML = `
        <div class="col-span-3 text-center py-20">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mb-4"></div>
            <p class="text-zinc-500">Loading latest investment plans...</p>
        </div>
    `;

    try {
        const { data: plans, error } = await supabase
            .from('pricing_plans')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading pricing:', error);
            container.innerHTML = `
                <div class="col-span-3 text-center py-20 border border-red-500/30 rounded-2xl bg-red-500/5">
                    <div class="text-red-400 font-medium mb-2">Error Loading Pricing</div>
                    <p class="text-zinc-500 text-sm">${error.message}</p>
                </div>
            `;
            return;
        }

        if (!plans || plans.length === 0) {
            container.innerHTML = `
                <div class="col-span-3 text-center py-20 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                    <p class="text-zinc-500 mb-2">No pricing plans configured</p>
                    <p class="text-zinc-600 text-sm">Add plans in the <a href="/admin.html" class="text-brand-400 hover:text-brand-300 underline">admin panel</a></p>
                </div>
            `;
            return;
        }

        // Render pricing plans
        container.innerHTML = plans.map(plan => {
            // Check if sale is active (has previous price)
            const isSale = plan.prev_price && plan.prev_price.trim() !== '';
            
            // Determine styling based on popularity
            const wrapperClass = plan.is_popular 
                ? 'relative flex flex-col p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] h-full group bg-zinc-900/80 border-transparent transform md:-translate-y-4'
                : 'relative flex flex-col p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] h-full group overflow-hidden glass-card border-white/5 hover:border-white/10';
            
            // Popular badge
            const popularBadge = plan.is_popular
                ? `<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-brand-950 text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] z-20 border border-brand-400">MOST POPULAR</div>`
                : '';

            // Button styling
            const buttonClass = plan.is_popular
                ? 'bg-brand-500 text-brand-950 hover:bg-brand-400 shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)] border border-white/20 hover:scale-105'
                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20';

            // Sale badge
            const saleBadge = isSale
                ? `<div class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-20">SALE</div>`
                : '';

            return `
                <div class="${wrapperClass}">
                    ${saleBadge}
                    ${plan.is_popular ? `<div class="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-emerald-900/20 to-black bg-[length:400%_400%] animate-gradient-xy -z-10"></div>` : ''}
                    ${popularBadge}
                    
                    <div class="mb-5 relative z-10">
                        <h3 class="text-lg font-medium ${plan.is_popular ? 'text-brand-400' : 'text-white'}">${plan.title}</h3>
                        
                        <div class="mt-2 flex items-baseline gap-2">
                            ${isSale ? `<span class="text-lg text-red-400 line-through decoration-red-500/50 font-medium">${plan.prev_price}</span>` : ''}
                            <span class="text-3xl font-bold text-white">${plan.price}</span>
                        </div>
                        
                        ${plan.description ? `<p class="mt-4 text-sm text-zinc-400 leading-relaxed">${plan.description}</p>` : ''}
                    </div>
                    
                    <div class="flex-1 relative z-10">
                        <ul class="space-y-3">
                            ${plan.features.map(feat => `
                                <li class="flex items-start gap-3 text-sm text-zinc-300">
                                    <svg class="w-5 h-5 shrink-0 ${plan.is_popular ? 'text-brand-400' : 'text-zinc-500'}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12" /></svg> 
                                    <span>${feat}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <a href="https://wa.me/26662510193?text=Hi%20Apex.dev!%20I'm%20interested%20in%20the%20${encodeURIComponent(plan.title)}%20plan%20(${encodeURIComponent(plan.price)})%20-%20can%20we%20discuss%20my%20project?" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       class="mt-8 w-full py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 relative z-10 text-center ${buttonClass}">
                        ${plan.button_text || 'Get Started'}
                    </a>
                </div>
            `;
        }).join('');
        
    } catch (err) {
        console.error('Unexpected error in loadPricing:', err);
        container.innerHTML = `
            <div class="col-span-3 text-center py-20">
                <div class="text-red-400 font-medium mb-2">Unexpected Error</div>
                <p class="text-zinc-500 text-sm">${err.message || 'Please check the browser console'}</p>
            </div>
        `;
    }
}

// ==========================================
// 3. LOAD TESTIMONIALS (Dynamic)
// ==========================================
async function loadTestimonials() {
    const container = document.getElementById('testimonials-grid');
    
    // Show loading skeleton
    container.innerHTML = `
        <div class="col-span-3 text-center py-20">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mb-4"></div>
            <p class="text-zinc-500">Loading client testimonials...</p>
        </div>
    `;

    try {
        const { data: testimonials, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading testimonials:', error);
            container.innerHTML = `
                <div class="col-span-3 text-center py-20 border border-red-500/30 rounded-2xl bg-red-500/5">
                    <div class="text-red-400 font-medium mb-2">Error Loading Testimonials</div>
                    <p class="text-zinc-500 text-sm">${error.message}</p>
                </div>
            `;
            return;
        }

        if (!testimonials || testimonials.length === 0) {
            container.innerHTML = `
                <div class="col-span-3 text-center py-20 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                    <p class="text-zinc-500 mb-2">No testimonials yet</p>
                    <p class="text-zinc-600 text-sm">Add testimonials in the <a href="/admin.html" class="text-brand-400 hover:text-brand-300 underline">admin panel</a></p>
                </div>
            `;
            return;
        }

        // Render testimonials
        container.innerHTML = testimonials.map(t => `
            <div class="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-brand-500/20 transition-all hover:-translate-y-1 duration-300">
                <div class="mb-6 text-brand-500 flex gap-1">
                    ${'★'.repeat(t.rating || 5)}${'☆'.repeat(5 - (t.rating || 5))}
                </div>
                <p class="text-zinc-300 mb-6 leading-relaxed italic">"${t.content}"</p>
                <div>
                    <div class="text-white font-semibold">${t.name}</div>
                    <div class="text-zinc-500 text-sm">${t.role}</div>
                </div>
            </div>
        `).join('');
        
    } catch (err) {
        console.error('Unexpected error in loadTestimonials:', err);
        container.innerHTML = `
            <div class="col-span-3 text-center py-20">
                <div class="text-red-400 font-medium mb-2">Unexpected Error</div>
                <p class="text-zinc-500 text-sm">${err.message || 'Please check the browser console'}</p>
            </div>
        `;
    }
}

// ==========================================
// INITIALIZE ALL LOADERS
// ==========================================
loadProjects();
loadPricing();
loadTestimonials();

// Optional: Auto-refresh every 30 seconds for real-time updates
setInterval(() => {
    loadProjects();
    loadPricing();
    loadTestimonials();
}, 30000);