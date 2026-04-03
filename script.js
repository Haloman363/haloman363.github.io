// Fetch live repo data from GitHub API and update the page
const GITHUB_USER = 'Haloman363';
const FEATURED    = 'rune-claude';

const LANG_COLORS = {
  Python:     'py',
  JavaScript: 'js',
  PowerShell: 'ps',
  TypeScript: 'ts',
  Rust:       'rs',
};

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls)  e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function buildRepoCard(repo) {
  const featured = repo.name === FEATURED;
  const card = el('a', `repo-card${featured ? ' featured' : ''}`);
  card.href   = repo.html_url;
  card.target = '_blank';
  card.rel    = 'noopener';

  card.appendChild(makeCorner('tl'));
  if (featured) {
    card.appendChild(makeCorner('br'));
    card.appendChild(el('div', 'repo-tag', '// Featured'));
  }

  const nameRow = el('div', 'repo-name');
  const nameText = document.createTextNode(repo.name + ' ');
  nameRow.appendChild(nameText);
  if (repo.stargazers_count > 0) {
    const star = el('span', 'repo-star', `★ ${repo.stargazers_count}`);
    nameRow.appendChild(star);
  }
  card.appendChild(nameRow);
  card.appendChild(el('div', 'repo-desc', repo.description || 'No description'));

  const dotClass = LANG_COLORS[repo.language];
  if (dotClass) {
    const meta = el('div', 'repo-meta');
    meta.appendChild(el('span', `lang-dot ${dotClass}`));
    meta.appendChild(el('span', 'lang-text', repo.language));
    card.appendChild(meta);
  }

  return card;
}

function makeCorner(pos) {
  const c = el('div', `hud-corner ${pos}`);
  return c;
}

async function fetchRepos() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );
    if (!res.ok) return;
    const data = await res.json();
    if (!Array.isArray(data)) return;

    const repos = data.filter(
      r => !r.fork
        && r.name !== GITHUB_USER.toLowerCase()
        && r.name !== `${GITHUB_USER.toLowerCase()}.github.io`
    );

    const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);

    const statRepos = document.getElementById('stat-repos');
    const statStars = document.getElementById('stat-stars');
    const repoCount = document.getElementById('repo-count');
    if (statRepos) statRepos.textContent = String(repos.length).padStart(2, '0');
    if (statStars) statStars.textContent = String(totalStars).padStart(2, '0');
    if (repoCount) repoCount.textContent = String(repos.length).padStart(2, '0');

    const grid = document.getElementById('repo-grid');
    if (!grid) return;

    const sorted = [
      ...repos.filter(r => r.name === FEATURED),
      ...repos.filter(r => r.name !== FEATURED)
               .sort((a, b) => b.stargazers_count - a.stargazers_count),
    ].slice(0, 6);

    grid.replaceChildren(...sorted.map(buildRepoCard));
  } catch {
    // silently fail — static fallback is already in the HTML
  }
}

// Smooth scroll for in-page anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

fetchRepos();
