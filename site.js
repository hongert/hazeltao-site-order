// ===== 整站的排版和交互：页头 + 菜单、首页、Projects 列表、项目页、About、页脚、光标和滚动动画 =====
// 一般不需要改这个文件：项目内容在 data.js，About 内容在 about.js，logo 在 logo.svg

(() => {
	const S = window.SITE;
	const P = window.PROJECTS;
	const A = window.ABOUT || { headline: '', statement: [], practice: [], sections: [] };
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
	const plain = (html) => html.replace(/<[^>]+>/g, '');
	const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
	const pills = (list) => `<ul class="pills">${list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
	// 标题逐字浮现：每个词包一层
	const words = (text) => esc(text).split(/(\s+)/).map((w) => (w.trim() ? `<span class="w"><span>${w}</span></span>` : w)).join('');

	// ---------- 图片和视频 ----------
	const videoWatcher = new IntersectionObserver((entries) => {
		entries.forEach(({ target: v, isIntersecting }) => {
			if (isIntersecting) {
				if (!v.getAttribute('src')) { v.muted = true; v.src = v.dataset.src; }
				v.play().catch(() => {});
			} else {
				v.pause();
			}
		});
	}, { rootMargin: '300px' });

	function media(name, { small = false } = {}) {
		if (isVideo(name)) return `<video data-src="${src(name)}" muted loop playsinline preload="none"></video>`;
		const size = SIZES[name] || [1600, 900];
		return `<img src="${small ? thumb(name) : src(name)}" width="${size[0]}" height="${size[1]}" loading="lazy" decoding="async" alt="">`;
	}

	// ---------- logo（logo.svg 里的内容直接放进页面，页脚可以变白） ----------
	const LOGO = `<svg class="logo-svg" viewBox="48 20 114 34" role="img" aria-label="${esc(S.name)}"><text x="50" y="51.06" font-size="35.94" letter-spacing="-1.08">Hazel.</text><text x="142.7" y="32.5" font-size="10.41">tao</text><ellipse cx="150.4" cy="29.63" rx="10.4" ry="6.8" fill="none" stroke="currentColor" stroke-width=".6"/></svg>`;

	// ---------- 页头 + 黄色全屏菜单 ----------
	const menuLinks = [
		['projects', 'list.html'],
		['about', 'about.html'],
		['contact', 'mailto:' + S.email],
	];
	$('.site-header').innerHTML = `
		<a class="logo" href="index.html">${LOGO}</a>
		<p class="tagline">curiosity.<br>organic.<br>expressive.</p>
		<button class="menu-btn" aria-expanded="false" aria-controls="menu">Menu.</button>
	`;
	const menu = document.createElement('div');
	menu.className = 'menu';
	menu.id = 'menu';
	menu.hidden = true;
	menu.innerHTML = `
		<div class="menu-top">
			<a class="logo" href="index.html">${LOGO}</a>
			<button class="menu-close" aria-label="Close menu">×</button>
		</div>
		<nav class="menu-links">
			${menuLinks.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}
		</nav>
	`;
	document.body.appendChild(menu);
	const btn = $('.menu-btn');
	const setMenu = (open) => {
		menu.hidden = !open;
		btn.setAttribute('aria-expanded', open);
		document.documentElement.classList.toggle('menu-open', open);
		requestAnimationFrame(() => menu.classList.toggle('open', open));
	};
	btn.addEventListener('click', () => setMenu(true));
	$('.menu-close').addEventListener('click', () => setMenu(false));
	document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

	// ---------- 页脚（黑色） ----------
	$('.site-footer').innerHTML = `
		<div class="footer-top">
			<p class="footer-tag">curiosity.<br>organic.<br>expressive.</p>
			<div class="footer-info">
				<p><a href="mailto:${S.email}">${esc(S.email)}</a><br><a href="https://www.instagram.com/${S.instagram}/" target="_blank" rel="noopener">Instagram.</a></p>
				<p class="grey">${S.now.map(esc).join('<br>')}</p>
				<p class="grey">${esc(S.city)}, <span class="clock"></span></p>
			</div>
		</div>
		<a class="footer-badge" href="mailto:${S.email}" data-cursor="Say hi.">Contact.</a>
		<div class="footer-logo">${LOGO}</div>
		<div class="footer-base">
			<span>© ${new Date().getFullYear()} ${esc(S.fullName)}</span>
			<a href="#" class="to-top">Back to top.</a>
		</div>
	`;
	const clock = $('.clock');
	const tick = () => {
		try { clock.textContent = new Intl.DateTimeFormat('en-US', { timeZone: S.timezone, hour: 'numeric', minute: '2-digit' }).format(new Date()); } catch (e) {}
	};
	tick();
	setInterval(tick, 15000);
	$('.to-top').addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

	const main = $('.main');

	// ---------- 首页 ----------
	function renderHome() {
		const featured = (window.FEATURED || P.slice(0, 4).map((p) => ({ slug: p.slug })))
			.map((f) => { const p = P.find((x) => x.slug === f.slug); return p && { ...p, cover: f.image || p.cover }; })
			.filter(Boolean);
		main.innerHTML = `
			<section class="hero">
				<h1 class="t-xl words">${words(A.headline.replace(' | ', ' ').replace('Student', 'student'))}</h1>
				<a class="scroll-badge" href="#featured">Scroll.</a>
			</section>
			<section class="dark" id="featured">
				<h2 class="t-xxl reveal">Selected projects.</h2>
				<div class="featured">
					${featured.map((p) => `
						<article class="feat">
							<div class="feat-text reveal">
								<h3 class="t-l"><a href="${link(p)}">${esc(p.title)}</a></h3>
								<p class="feat-sub">${esc(p.subtitle)}</p>
								${pills(p.tags)}
							</div>
							<a class="feat-img" href="${link(p)}" data-cursor="View.">
								<span class="arch">${media(p.cover)}</span>
							</a>
						</article>`).join('')}
				</div>
				<a class="all-link t-xxl reveal" href="list.html" data-cursor="View.">All projects.</a>
			</section>
		`;

		// 滚动时图片慢慢收成一个完整的圆，四周露出黄色
		const arches = $$('.feat-img');
		const onScroll = () => {
			const vh = innerHeight;
			arches.forEach((el) => {
				const r = el.getBoundingClientRect();
				const t = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height * 0.4)));
				const full = Math.hypot(r.width, r.height) / 2; // 盖满整张图
				const round = Math.min(r.width, r.height) / 2;  // 完整的圆
				el.firstElementChild.style.clipPath = `circle(${(full - (full - round) * t).toFixed(1)}px at 50% 50%)`;
			});
		};
		addEventListener('scroll', onScroll, { passive: true });
		addEventListener('resize', onScroll);
		onScroll();
	}

	// ---------- Projects：可筛选的错落网格 ----------
	function renderList() {
		const counts = {};
		P.forEach((p) => p.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
		const allTags = Object.keys(counts).sort();
		let active = params.get('tag') || '';
		main.innerHTML = `
			<section class="list-head">
				<h1 class="t-xl"><span class="words">${words('Twelve projects,')}</span><span class="right words">${words('one practice.')}</span></h1>
			</section>
			<section class="filters reveal">
				<button class="filter" data-tag="">All<sup>${P.length}</sup></button>
				${allTags.map((t) => `<button class="filter" data-tag="${esc(t)}">${esc(t)}<sup>${counts[t]}</sup></button>`).join('')}
			</section>
			<section class="grid">
				${P.map((p) => `
					<a class="card reveal" href="${link(p)}" data-tags="${esc(p.tags.join('|'))}" data-cursor="View.">
						<span class="card-img">${media(p.cover, { small: true })}</span>
						<span class="card-title">${esc(p.title)}</span>
						${pills([p.subtitle, String(p.year)])}
					</a>`).join('')}
			</section>
		`;
		const apply = () => {
			$$('.filter').forEach((f) => f.classList.toggle('on', f.dataset.tag === active));
			$$('.card').forEach((c) => { c.hidden = !!active && !c.dataset.tags.split('|').includes(active); });
			$('.grid').classList.toggle('filtered', !!active);
		};
		$('.filters').addEventListener('click', (e) => {
			const f = e.target.closest('.filter');
			if (!f) return;
			active = f.dataset.tag;
			history.replaceState(null, '', active ? '?tag=' + encodeURIComponent(active) : location.pathname);
			apply();
		});
		apply();
	}

	// ---------- 项目页 ----------
	function renderProject() {
		const i = Math.max(0, P.findIndex((p) => p.slug === params.get('p')));
		const p = P[i];
		const next = P[(i + 1) % P.length];
		document.title = plain(p.title) + ' — ' + S.name;

		// 横图和视频占满一行；竖图、方图两张并排
		const rest = p.media.filter((m) => m !== p.cover);
		const rows = [];
		let pair = [];
		rest.forEach((m) => {
			if (isVideo(m) || ratio(m) >= 1.15) rows.push([m]);
			else {
				pair.push(m);
				if (pair.length === 2) { rows.push(pair); pair = []; }
			}
		});
		if (pair.length) rows.push(pair);

		const [lead, ...body] = p.text;
		main.innerHTML = `
			<section class="p-head">
				<h1 class="t-xxl words">${words(plain(p.title))}</h1>
				<div class="p-head-row">
					<p class="p-sub">${esc(p.subtitle)}.</p>
					${pills(p.tags)}
				</div>
			</section>
			<section class="p-intro">
				<figure class="p-cover reveal">${media(p.cover)}</figure>
				<div class="p-text reveal">
					<p class="p-lead">${lead}</p>
					${body.map((t) => `<p>${t}</p>`).join('')}
					<dl class="p-meta">
						<div><dt>Year</dt><dd>${p.year}</dd></div>
						<div><dt>Deliverables</dt><dd>${p.services.map(esc).join('<br>')}</dd></div>
						${p.format ? `<div><dt>Format</dt><dd>${esc(p.format)}</dd></div>` : ''}
					</dl>
					${p.credits ? `<p class="credits">${esc(p.credits)}</p>` : ''}
				</div>
			</section>
			<section class="p-media">
				${rows.map((r) => `<div class="m-row m-${r.length}">${r.map((m) => `<figure class="reveal">${media(m)}</figure>`).join('')}</div>`).join('')}
			</section>
			<section class="dark p-next">
				<p class="label">Next project.</p>
				<a class="next" href="${link(next)}" data-cursor="View.">
					<span class="next-text">
						<span class="t-xl">${esc(next.title)}</span>
						${pills(next.tags)}
					</span>
					<span class="next-img">${media(next.cover, { small: true })}</span>
				</a>
				<a class="all-link t-xxl" href="list.html" data-cursor="View.">All projects.</a>
			</section>
		`;
	}

	// ---------- About ----------
	function renderAbout() {
		main.innerHTML = `
			<section class="about-head">
				<p class="about-kicker">About.</p>
				<h1 class="t-xl statement">${A.statement.map((l, n) => `<span class="${n % 2 ? 'right' : ''} words">${words(l)}</span>`).join('')}</h1>
			</section>
			<section class="yellow">
				<div class="cards">
					${A.sections.map((s) => `
						<div class="info-card reveal">
							<h2 class="t-m">${esc(s.label)}.</h2>
							<p>${s.lines.map((l) => l || '<span class="gap"></span>').join('<br>')}</p>
						</div>`).join('')}
					<div class="info-card reveal">
						<h2 class="t-m">Last updated.</h2>
						<p>${esc(S.updated)}</p>
					</div>
				</div>
			</section>
			<section class="dark practice">
				<p class="label">What I do.</p>
				<p class="t-l reveal">${esc(A.practice[0] || '')} <span class="grey">${esc(A.practice[1] || '')}</span></p>
			</section>
		`;
	}

	({ home: renderHome, list: renderList, project: renderProject, about: renderAbout }[page] || renderHome)();

	// ---------- 视频开始观察 ----------
	$$('video[data-src]').forEach((v) => videoWatcher.observe(v));

	// ---------- 滚动浮现 ----------
	const revealer = new IntersectionObserver((entries) => {
		entries.forEach((e) => {
			if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); }
		});
	}, { rootMargin: '0px 0px -8% 0px' });
	$$('.reveal, .words').forEach((el) => revealer.observe(el));

	// ---------- 黄色光标（只在有鼠标的设备上） ----------
	if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
		const cur = document.createElement('div');
		cur.className = 'cursor';
		cur.innerHTML = '<span></span>';
		document.body.appendChild(cur);
		const label = cur.firstChild;
		let x = -100, y = -100, cx = x, cy = y;
		addEventListener('mousemove', (e) => {
			x = e.clientX; y = e.clientY;
			const t = e.target.closest('[data-cursor]');
			cur.classList.toggle('big', !!t);
			if (t) label.textContent = t.dataset.cursor;
		});
		document.addEventListener('mouseleave', () => cur.classList.add('gone'));
		document.addEventListener('mouseenter', () => cur.classList.remove('gone'));
		const loop = () => {
			cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
			cur.style.transform = `translate(${cx}px, ${cy}px)`;
			requestAnimationFrame(loop);
		};
		loop();
	}
})();
