import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

console.log('Admin module loading...');
console.log('Supabase URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const loginPanel = document.getElementById('login-panel');
const dashboardPanel = document.getElementById('dashboard-panel');
const loginForm = document.getElementById('login-form');
const addProjectForm = document.getElementById('add-project-form');
const projectsList = document.getElementById('projects-list');

console.log('DOM elements found:', {
  loginPanel: !!loginPanel,
  dashboardPanel: !!dashboardPanel,
  loginForm: !!loginForm,
  addProjectForm: !!addProjectForm,
  projectsList: !!projectsList
});

// 1. Check Session on Load
async function checkSession() {
    console.log('Checking existing session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
        console.error('Session check error:', error);
        return;
    }
    
    console.log('Session found:', !!session);
    if (session) {
        showDashboard();
    }
}

function showDashboard() {
    console.log('Showing dashboard...');
    loginPanel.classList.add('hidden');
    dashboardPanel.classList.remove('hidden');
    fetchProjects();
}

// 2. Login Logic
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = e.target.querySelector('button');
    const errorMsg = document.getElementById('login-error');

    console.log('Attempting login with:', { email, password: '***' });

    btn.textContent = "Verifying...";
    btn.disabled = true;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ 
            email: email.trim(), 
            password: password 
        });

        console.log('Login response:', { data, error });

        if (error) {
            console.error('Login error:', error);
            errorMsg.textContent = "Access Denied: " + error.message;
            errorMsg.classList.remove('hidden');
            btn.textContent = "Authenticate";
        } else {
            console.log('Login successful, user:', data.user);
            showDashboard();
        }
    } catch (err) {
        console.error('Unexpected error during login:', err);
        errorMsg.textContent = "System error: " + err.message;
        errorMsg.classList.remove('hidden');
        btn.textContent = "Authenticate";
    } finally {
        btn.disabled = false;
    }
});

// 3. Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    console.log('Logging out...');
    await supabase.auth.signOut();
    window.location.reload();
});

// 4. Fetch and Display Projects
async function fetchProjects() {
    console.log('Fetching projects...');
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        projectsList.innerHTML = `<div class="text-red-500">Error loading projects: ${error.message}</div>`;
        return;
    }

    console.log('Projects loaded:', projects?.length);
    projectsList.innerHTML = projects.map(p => `
        <div class="p-4 bg-black/40 border border-white/5 rounded-lg flex justify-between items-center group hover:border-brand-500/30 transition-colors">
            <div class="flex items-center gap-3">
                <img src="${p.image_url}" class="w-10 h-10 rounded object-cover opacity-70" onerror="this.src='https://via.placeholder.com/40'" />
                <div>
                    <h4 class="text-white font-medium text-sm">${p.title}</h4>
                    <div class="text-zinc-500 text-xs">${p.tags.join(', ')}</div>
                </div>
            </div>
            <button data-id="${p.id}" class="delete-btn text-zinc-600 hover:text-red-500 transition-colors p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
    `).join('');

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteProject(id);
        });
    });
}

// 5. Add Project
addProjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = "Uploading...";
    btn.disabled = true;

    const newProject = {
        title: document.getElementById('p-title').value,
        description: document.getElementById('p-desc').value,
        image_url: document.getElementById('p-img').value,
        link: document.getElementById('p-link').value,
        tags: document.getElementById('p-tags').value.split(',').map(t => t.trim())
    };

    const { error } = await supabase.from('projects').insert([newProject]);

    if (error) {
        alert("Upload Failed: " + error.message);
    } else {
        addProjectForm.reset();
        fetchProjects();
    }
    
    btn.textContent = "Upload to Database";
    btn.disabled = false;
});

// 6. Delete Project 
async function deleteProject(id) {
    if(!confirm("Are you sure you want to scrub this project from the database?")) return;
    
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) {
        fetchProjects();
    } else {
        alert("Delete failed: " + error.message);
    }
}

// Initialize
checkSession();