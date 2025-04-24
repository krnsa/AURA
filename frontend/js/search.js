import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let currentFilter = 'all';
    let searchTimeout;

    async function performSearch(query) {
        if (!query.trim()) {
            searchResults.innerHTML = '';
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/login.html';
                return;
            }

            searchResults.innerHTML = '<div class="loading">Searching...</div>';

            const { data: results, error } = await supabase
                .from('profiles')
                .select('*')
                .ilike('username', `%${query}%`)
                .limit(10);

            if (error) throw error;

            displayResults(results);
        } catch (error) {
            console.error('Search failed:', error);
            searchResults.innerHTML = `
                <div class="no-results">
                    <p>An error occurred while searching. Please try again.</p>
                </div>
            `;
        }
    }

    function displayResults(results) {
        if (!results || results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <p>No results found</p>
                    <p>Try different keywords or filters</p>
                </div>
            `;
            return;
        }

        searchResults.innerHTML = results.map(result => `
            <div class="result-card user-result" data-id="${result.id}">
                <div class="user-avatar">
                    ${result.avatar_url 
                        ? `<img src="${result.avatar_url}" alt="${result.username}">` 
                        : result.username[0].toUpperCase()}
                </div>
                <div class="user-info">
                    <h3>${result.username}</h3>
                    <p>@${result.username}</p>
                </div>
            </div>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.result-card').forEach(card => {
            card.addEventListener('click', () => {
                const userId = card.dataset.id;
                window.location.href = `/profile.html?id=${userId}`;
            });
        });
    }

    // Search input handler with debounce
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            if (searchInput.value) {
                performSearch(searchInput.value);
            }
        });
    });

    // Check authentication on page load
    checkAuth();
});

async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = '/login.html';
    }
}