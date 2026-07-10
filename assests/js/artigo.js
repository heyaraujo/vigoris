(() => {
    const client = window.vigorisSupabase;

    const loading = document.getElementById('articleLoading');
    const page = document.getElementById('articlePage');
    const relatedSection =
        document.getElementById('relatedSection');
    const relatedGrid =
        document.getElementById('relatedGrid');

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

    function calculateReadTime(html) {
        const temporaryElement =
            document.createElement('div');

        temporaryElement.innerHTML =
            DOMPurify.sanitize(html || '');

        const words = (
            temporaryElement.textContent || ''
        )
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .length;

        return Math.max(1, Math.ceil(words / 220));
    }

    function getSlug() {
        const params =
            new URLSearchParams(window.location.search);

        if (params.get('slug')) {
            return params.get('slug');
        }

        const pathParts = window.location.pathname
            .split('/')
            .filter(Boolean);

        const lastPart =
            pathParts[pathParts.length - 1];

        return lastPart !== 'artigo.html'
            ? lastPart
            : '';
    }

    function updateMeta(article) {
        const title =
            article.seo_title || article.title;

        const description =
            article.seo_description ||
            article.excerpt ||
            '';

        document.title =
            `${title} | Vigoris Contábil`;

        const metaDescription =
            document.getElementById('metaDescription');

        const ogTitle =
            document.getElementById('ogTitle');

        const ogDescription =
            document.getElementById('ogDescription');

        const ogImage =
            document.getElementById('ogImage');

        if (metaDescription) {
            metaDescription.content = description;
        }

        if (ogTitle) {
            ogTitle.content = title;
        }

        if (ogDescription) {
            ogDescription.content = description;
        }

        if (ogImage && safeUrl(article.cover_url)) {
            ogImage.content = article.cover_url;
        }
    }

    function showError(message) {
    page.hidden = true;

    loading.hidden = false;
    loading.innerHTML = `
        <div class="article-error">
            <i class="fa-regular fa-circle-xmark"></i>

            <p>${escapeHtml(message)}</p>

            <a href="blog.html" class="btn btn-dark">
                Voltar aos conteúdos
            </a>
        </div>
    `;
}

    function createRelatedCard(article) {
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
            <a
                class="article-card"
                href="artigo.html?slug=${encodeURIComponent(article.slug)}"
            >
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

    async function loadRelated(article) {
        const { data, error } = await client
            .from('articles')
            .select(`
                id,
                title,
                slug,
                excerpt,
                cover_url,
                category,
                published_at
            `)
            .eq('status', 'published')
            .neq('id', article.id)
            .lte('published_at', new Date().toISOString())
            .order('published_at', { ascending: false })
            .limit(3);

        if (!error && data?.length) {
            relatedGrid.innerHTML =
                data.map(createRelatedCard).join('');

            relatedSection.hidden = false;
        }
    }

    async function loadArticle() {
        if (!client) {
            showError(
                'Configure a URL e a Publishable Key em assests/js/supabase-config.js.'
            );

            return;
        }

        const slug = getSlug();

        if (!slug) {
            showError('Artigo não informado.');
            return;
        }

        const { data: article, error } = await client
            .from('articles')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .lte('published_at', new Date().toISOString())
            .maybeSingle();

        if (error || !article) {
            console.error(
                'Erro ao carregar artigo:',
                error
            );

            showError(
                'Este artigo não foi encontrado ou ainda não foi publicado.'
            );

            return;
        }

        updateMeta(article);

        document.getElementById(
            'articleCategory'
        ).textContent =
            article.category || 'Conteúdo';

        document.getElementById(
            'articleDate'
        ).textContent =
            formatDate(article.published_at);

        document.getElementById(
            'articleReadTime'
        ).textContent =
            `${calculateReadTime(article.content)} min de leitura`;

        document.getElementById(
            'articleTitle'
        ).textContent =
            article.title;

        document.getElementById(
            'articleExcerpt'
        ).textContent =
            article.excerpt || '';

        document.getElementById(
            'articleContent'
        ).innerHTML =
            DOMPurify.sanitize(
                article.content || '',
                {
                    USE_PROFILES: {
                        html: true
                    },
                    ADD_ATTR: [
                        'target',
                        'rel'
                    ]
                }
            );

        const cover =
            document.getElementById('articleCover');

        const coverUrl =
            safeUrl(article.cover_url);

        if (coverUrl) {
            cover.src = coverUrl;
            cover.alt = article.title;
            cover.hidden = false;
        }

        loading.hidden = true;
        page.hidden = false;

        loadRelated(article);
    }

    loadArticle();
})();