// ===== 整站的排版和交互：页头、首页作品流、Index 列表、项目页、About、页脚 =====
// 一般不需要改这个文件：项目内容在 data.js，About 内容在 about.js

(() => {
	const S = window.SITE;
	const P = window.PROJECTS;
	const A = window.ABOUT || { headline: '', sections: [] };
	const SIZES = window.SIZES || {};
	const page = document.body.dataset.page; // home | list | project | about
	const params = new URLSearchParams(location.search);

	// ---------- 小工具 ----------
	const $ = (sel, root = document) => root.querySelector(sel);
	const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
	const isVideo = (name) => /\.mp4$/i.test(name);
	const src = (name) => (isVideo(name) ? 'videos/' : 'images/') + name;
	const thumb = (name) => (isVideo(name) ? src(name) : 'thumbs/' + name + '.jpg');
	const ratio = (name) => (SIZES[name] ? SIZES[name][0] / SIZES[name][1] : 16 / 9);
	const link = (p) => 'project.html?p=' + p.slug;
	const tagLink = (t) => 'list.html?tag=' + encodeURIComponent(t);
	const plain = (html) => html.replace(/<[^>]+>/g, '');
	const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

	// ---------- 视频：滚到眼前才加载、播放 ----------
	const videoWatcher = new IntersectionObserver((entries) => {
		entries.forEach(({ target: v, isIntersecting }) => {
			if (isIntersecting) {
				if (!v.getAttribute('src')) {
					v.muted = true;
					v.src = v.dataset.src;
				}
				v.play().catch(() => {});
			} else {
				v.pause();
			}
		});
	}, { rootMargin: '300px' });

	function media(name, { small = false } = {}) {
		if (isVideo(name)) {
			return `<video data-src="${src(name)}" muted loop playsinline preload="none"></video>`;
		}
		const size = SIZES[name] || [1600, 900];
		return `<img src="${small ? thumb(name) : src(name)}" width="${size[0]}" height="${size[1]}" loading="lazy" decoding="async" alt="">`;
	}
	function watchVideos(root = document) {
		$$('video[data-src]', root).forEach((v) => videoWatcher.observe(v));
	}

	// ---------- 页头 ----------
	const nav = [
		['Work', 'index.html', 'home'],
		['Index', 'list.html', 'list'],
		['About', 'about.html', 'about'],
	];
	$('.site-header').innerHTML = `
		<a class="logo" href="index.html">${esc(S.name)}</a>
		<nav class="nav">
			${nav.map(([label, href, key]) => `<a href="${href}"${(key === page || (key === 'home' && page === 'project')) ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
		</nav>
		<span class="header-note">Graphic Design</span>
	`;

	// ---------- 页脚 ----------
	$('.site-footer').innerHTML = `
		<a class="footer-big" href="list.html">Every project, in one index →</a>
		<div class="footer-cols">
			<div>
				<h4>Contact</h4>
				<p><a href="mailto:${S.email}">${esc(S.email)}</a></p>
			</div>
			<div>
				<h4>Links</h4>
				<p><a href="https://www.instagram.com/${S.instagram}/" target="_blank" rel="noopener">Instagram</a></p>
			</div>
			<div>
				<h4>Now</h4>
				<p>${S.now.map(esc).join('<br>')}</p>
			</div>
			<div>
				<h4>${esc(S.city)}</h4>
				<p class="clock">&nbsp;</p>
			</div>
		</div>
		<div class="footer-base">
			<span>© ${new Date().getFullYear()} ${esc(S.fullName)}</span>
			<a href="#top" class="to-top">Back to top ↑</a>
		</div>
	`;
	const clock = $('.clock');
	const tick = () => {
		try {
			clock.textContent = new Intl.DateTimeFormat('en-US', { timeZone: S.timezone, hour: 'numeric', minute: '2-digit' }).format(new Date());
		} catch (e) {}
	};
	tick();
	setInterval(tick, 15000);
	$('.to-top').addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

	const main = $('.main');

	// ---------- 首页：作品流（一张方图 + 一张横图，左右交替） ----------
	function renderHome() {
		main.innerHTML = P.map((p, i) => {
			const second = p.media.find((m) => m !== p.cover) || p.cover;
			const sq = `<a class="frame sq" href="${link(p)}" aria-hidden="true" tabindex="-1">${media(second)}</a>`;
			const rec = `<a class="frame rec" href="${link(p)}" aria-hidden="true" tabindex="-1">${media(p.cover)}</a>`;
			return `
				<article class="feed-item ${i % 2 ? 'flip' : ''}">
					<div class="feed-head">
						<h2><a href="${link(p)}">${esc(p.title)}</a></h2>
						<ul class="tags">${p.tags.map((t) => `<li><a href="${tagLink(t)}">${esc(t)}</a></li>`).join('')}</ul>
					</div>
					<div class="feed-media">${i % 2 ? rec + sq : sq + rec}</div>
				</article>`;
		}).join('');
		watchVideos(main);
	}

	// ---------- Index：可筛选的项目列表 ----------
	function renderList() {
		const allTags = [...new Set(P.flatMap((p) => p.tags))].sort();
		let active = params.get('tag') || '';
		let query = '';
		main.innerHTML = `
			<section class="list-head">
				<h1>Index</h1>
				<p class="muted">${P.length} projects, ${P[P.length - 1].year}–${P[0].year}</p>
			</section>
			<section class="filters">
				<div class="filter-label">Filter projects</div>
				<div class="chips">
					${allTags.map((t) => `<button class="chip" data-tag="${esc(t)}">${esc(t)} <span>×</span></button>`).join('')}
				</div>
				<input class="search" type="search" placeholder="Search" aria-label="Search projects">
			</section>
			<div class="rows">
				<div class="row row-labels"><span>Project</span><span>Discipline</span><span>Tags</span><span>Year</span></div>
				${P.map((p) => `
					<a class="row" href="${link(p)}" data-tags="${esc(p.tags.join('|'))}" data-text="${esc((p.title + ' ' + p.subtitle + ' ' + p.tags.join(' ') + ' ' + p.year).toLowerCase())}" data-cover="${esc(thumb(p.cover))}">
						<span class="r-title">${esc(p.title)}</span>
						<span>${esc(p.subtitle || '')}</span>
						<span class="muted">${esc(p.tags.join(', '))}</span>
						<span>${p.year}</span>
					</a>`).join('')}
				<p class="empty muted" hidden>No projects match.</p>
			</div>
			<img class="peek" alt="" hidden>
		`;
		const apply = () => {
			$$('.chip').forEach((c) => c.classList.toggle('on', c.dataset.tag === active));
			let shown = 0;
			$$('.row[data-tags]').forEach((r) => {
				const ok = (!active || r.dataset.tags.split('|').includes(active)) && (!query || r.dataset.text.includes(query));
				r.hidden = !ok;
				if (ok) shown++;
			});
			$('.empty').hidden = shown > 0;
		};
		$('.chips').addEventListener('click', (e) => {
			const c = e.target.closest('.chip');
			if (!c) return;
			active = active === c.dataset.tag ? '' : c.dataset.tag;
			history.replaceState(null, '', active ? '?tag=' + encodeURIComponent(active) : location.pathname);
			apply();
		});
		$('.search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); apply(); });
		apply();

		// 鼠标停在一行上，旁边浮出封面小图
		const peek = $('.peek');
		if (matchMedia('(hover: hover)').matches) {
			$$('.row[data-cover]').forEach((r) => {
				r.addEventListener('mouseenter', () => { peek.src = r.dataset.cover; peek.hidden = false; });
				r.addEventListener('mouseleave', () => { peek.hidden = true; });
			});
			main.addEventListener('mousemove', (e) => {
				peek.style.transform = `translate(${e.clientX + 24}px, ${e.clientY - 80}px)`;
			});
		}
	}

	// ---------- 项目页 ----------
	function renderProject() {
		const i = Math.max(0, P.findIndex((p) => p.slug === params.get('p')));
		const p = P[i];
		const next = P[(i + 1) % P.length];
		document.title = plain(p.title) + ' — ' + S.name;

		// 横图占满一行；竖图、方图两张并排
		const rows = [];
		let pair = [];
		p.media.forEach((m) => {
			if (isVideo(m) || ratio(m) >= 1.15) {
				rows.push([m]);
			} else {
				pair.push(m);
				if (pair.length === 2) { rows.push(pair); pair = []; }
			}
		});
		if (pair.length) rows.push(pair);

		const meta = [
			['Year', p.year],
			['Discipline', p.subtitle],
			['Services', p.services.join('<br>')],
			p.format ? ['Format', esc(p.format)] : null,
		].filter(Boolean);

		main.innerHTML = `
			<section class="p-head">
				<h1>${esc(p.title)}</h1>
				<ul class="tags">${p.tags.map((t) => `<li><a href="${tagLink(t)}">${esc(t)}</a></li>`).join('')}</ul>
			</section>
			<section class="p-intro">
				<dl class="p-meta">
					${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
				</dl>
				<div class="p-text">
					${p.text.map((t) => `<p>${t}</p>`).join('')}
					${p.credits ? `<p class="credits muted">${esc(p.credits)}</p>` : ''}
				</div>
			</section>
			<section class="p-media">
				${rows.map((r) => `<div class="m-row m-${r.length}${r.length === 1 && !isVideo(r[0]) && ratio(r[0]) < 1.15 ? ' m-single' : ''}">${r.map((m) => `<figure class="zoomable">${media(m)}</figure>`).join('')}</div>`).join('')}
			</section>
			<section class="p-next">
				<div class="filter-label">Next project</div>
				<a href="${link(next)}" class="next-link">
					<span class="next-title">${esc(next.title)} →</span>
					<span class="next-img">${media(next.cover, { small: true })}</span>
				</a>
			</section>
		`;
		watchVideos(main);

		// 点击图片放大
		const box = document.createElement('div');
		box.className = 'lightbox';
		box.hidden = true;
		document.body.appendChild(box);
		main.addEventListener('click', (e) => {
			const img = e.target.closest('.zoomable img');
			if (!img) return;
			box.innerHTML = `<img src="${img.getAttribute('src')}" alt="">`;
			box.hidden = false;
		});
		box.addEventListener('click', () => { box.hidden = true; });
		document.addEventListener('keydown', (e) => { if (e.key === 'Escape') box.hidden = true; });
	}

	// ---------- About ----------
	function renderAbout() {
		main.innerHTML = `
			<section class="about-head">
				<h1>${esc(S.fullName)}</h1>
				<p class="about-lede">${A.headline}</p>
			</section>
			<section class="about-grid">
				${A.sections.map((s) => `
					<div class="about-block">
						<h4>${esc(s.label)}</h4>
						<p>${s.lines.map((l) => l || '<span class="gap"></span>').join('<br>')}</p>
					</div>`).join('')}
				<div class="about-block">
					<h4>Last Updated</h4>
					<p class="muted">${esc(S.updated)}</p>
				</div>
			</section>
		`;
	}

	({ home: renderHome, list: renderList, project: renderProject, about: renderAbout }[page] || renderHome)();
})();
