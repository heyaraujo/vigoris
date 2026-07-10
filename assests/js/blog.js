(() => {
    const client = window.vigorisSupabase;
    const grid = document.getElementById('articlesGrid');
    const status = document.getElementById('blogStatus');
    const searchInput = document.getElementById('blogSearch');
    const filters = document.getElementById('categoryFilters');

    let articles = [];
    let activeCategory = 'Todos';

    function escapeHtml(value = '') {
        return String(value).replace(/[&<>'"]/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[char]));
    }

    function safeUrl(value) {
        try {
            const url = new URL(value);

            return ['http:', 'https:'].includes(url.protocol)
                ? url.href
                : '';
        } catch {
            return '';
        }
    }

    function formatDate(value) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(new Date(value));
    }

    function articleLink(article) {
        return `artigo.html?slug=${encodeURIComponent(article.slug)}`;
    }

    function createCard(article) {
        const image = safeUrl(article.cover_url);

        const imageMarkup = image
            ? `
                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(article.title)}"
                    loading="lazy"
                >
            `
            : `
                <div class="article-card-placeholder">
                    <i class="fa-regular fa-newspaper"></i>
                </div>
            `;

        return `
            <a class="article-card" href="${articleLink(article)}">
                <div class="article-card-image">
                    ${imageMarkup}
                </div>

                <div class="article-card-body">
                    <div class="article-card-meta">
                        <span class="article-card-category">
                            ${escapeHtml(article.category || 'Conteúdo')}
                        </span>

                        <span>•</span>

                        <span>
                            ${formatDate(article.published_at)}
                        </span>
                    </div>

                    <h3>${escapeHtml(article.title)}</h3>

                    <p>${escapeHtml(article.excerpt || '')}</p>

                    <div class="article-card-link">
                        <span>Ler artigo</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </div>
                </div>
            </a>
        `;
    }

    function renderFilters() {
        const categories = [
            'Todos',
            ...new Set(
                articles
                    .map(item => item.category)
                    .filter(Boolean)
            )
        ];

        filters.innerHTML = categories.map(category => `
            <button
                type="button"
                class="category-filter ${
                    category === activeCategory ? 'active' : ''
                }"
                data-category="${escapeHtml(category)}"
            >
                ${escapeHtml(category)}
            </button>
        `).join('');

        filters
            .querySelectorAll('.category-filter')
            .forEach(button => {
                button.addEventListener('click', () => {
                    activeCategory = button.dataset.category;

                    renderFilters();
                    renderArticles();
                });
            });
    }

    function renderArticles() {
    const term = searchInput.value
        .trim()
        .toLocaleLowerCase('pt-BR');

    const visible = articles.filter(article => {
        const matchesCategory =
            activeCategory === 'Todos' ||
            article.category === activeCategory;

        const haystack = `
            ${article.title || ''}
            ${article.excerpt || ''}
            ${article.category || ''}
        `.toLocaleLowerCase('pt-BR');

        return matchesCategory && (!term || haystack.includes(term));
    });

    if (!visible.length) {
        grid.hidden = true;
        status.hidden = false;

        status.innerHTML = `
            <i class="fa-regular fa-folder-open"></i>
            <p>Nenhum artigo encontrado.</p>
        `;

        return;
    }

    status.hidden = true;
    status.innerHTML = '';

    grid.hidden = false;
    grid.innerHTML = visible.map(createCard).join('');
}

    async function loadArticles() {
        if (
            !client ||
            String(window.VIGORIS_SUPABASE_URL || '')
                .includes('COLE_AQUI')
        ) {
            status.innerHTML = `
                <p>
                    Configure a URL e a Publishable Key em
                    <strong>assests/js/supabase-config.js</strong>.
                </p>
            `;

            return;
        }

        const { data, error } = await client
            .from('articles')
            .select(`
                id,
                title,
                slug,
                excerpt,
                cover_url,
                category,
                published_at,
                featured
            `)
            .eq('status', 'published')
            .lte('published_at', new Date().toISOString())
            .order('featured', { ascending: false })
            .order('published_at', { ascending: false });

        if (error) {
            console.error('Erro ao carregar artigos:', error);

            status.innerHTML = `
                <p>Não foi possível carregar os artigos agora.</p>
            `;

            return;
        }

        articles = data || [];

        renderFilters();
        renderArticles();
    }

    searchInput.addEventListener('input', renderArticles);

    loadArticles();
})();