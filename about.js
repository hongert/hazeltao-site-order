// ===== About 页的内容：改文字只需要改这个文件 =====
// 每一块是一个小标题 + 几行内容；行里可以写 <a href="...">链接</a>

window.ABOUT = {
	headline: 'MFA Graphic Design | Student at ArtCenter College of Design.',
	// About 页的大字，每行左右交替排
	statement: ['Honger (Hazel) Tao,', 'MFA Graphic Design', 'student at ArtCenter', 'College of Design.'],
	// 黑色区域的一段话：前半句黑底白字，后半句灰色
	practice: ['Identity, typography, editorial and print.', 'Packaging, risograph, illustration, motion and spatial work.'],
	sections: [
		{
			label: 'Contact',
			lines: [
				'<a href="mailto:heizedesign@gmail.com">heizedesign@gmail.com</a>',
				'<a href="https://www.instagram.com/sol.studioooo/" target="_blank" rel="noopener">Instagram @sol.studioooo</a>',
			],
		},
		{
			label: 'Education',
			lines: [
				'ArtCenter College of Design',
				'<span class="muted">MFA Graphic Design, May 2027</span>',
				'',
				'Washington University in St. Louis',
				'<span class="muted">BA Design, May 2025</span>',
			],
		},
		{
			label: 'Skills',
			lines: ['Adobe Creative Suites', 'Branding &amp; Identity', 'Editorial Design', 'Squarespace', 'Risograph', 'Cargo', 'Figma'],
		},
		{
			label: 'Fine Art Skills',
			lines: ['Painting (oil, acrylic)', 'Printmaking', 'Cyanotype', 'Ceramic'],
		},
		{
			label: 'Exhibition',
			lines: [
				'<a href="https://www.northarlington.org/News/View/5242/bergen-county-celebrates-asian-american-native-hawaiian-pacific-islander-heritage-month" target="_blank" rel="noopener">2023 Asian American, Native Hawaiian &amp; Pacific Islander (AANHPI) Heritage Month →</a>',
			],
		},
	],
};
