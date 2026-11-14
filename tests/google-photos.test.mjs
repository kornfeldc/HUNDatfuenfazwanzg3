import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAlbumLink, parseAlbumPage, sizeCoverUrl } from '../src/lib/googlePhotos.ts';

const page = (title, image = 'https://lh3.googleusercontent.com/pw/AP1Gcz=w600-h315-p-k') =>
	`<head><meta property="og:title" content="${title}"><meta property="og:image" content="${image}"></head>`;
const today = new Date(2026, 10, 14);

test('only Google Photos share links may be fetched', () => {
	assert.ok(isAlbumLink('https://photos.app.goo.gl/maLxHZ1qUfJWnT129'));
	assert.ok(isAlbumLink('https://photos.google.com/share/AF1Qip?key=abc'));
	assert.ok(isAlbumLink('https://goo.gl/photos/sQu7MyYaWCjq5UP58'));
	assert.ok(!isAlbumLink('https://goo.gl/abc'));
	assert.ok(!isAlbumLink('http://photos.app.goo.gl/x'));
	assert.ok(!isAlbumLink('https://photos.app.goo.gl.evil.com/x'));
	assert.ok(!isAlbumLink('http://localhost:5432/'));
	assert.ok(!isAlbumLink('kein link'));
});

test('the date in the album name wins over the photo dates', () => {
	assert.deepEqual(parseAlbumPage(page('20. Juni 2026 - Funturnier · Saturday, Jun 20 📸'), today), {
		title: 'Funturnier',
		date: '2026-06-20',
		coverUrl: 'https://lh3.googleusercontent.com/pw/AP1Gcz=w800-h600-p'
	});
	assert.equal(parseAlbumPage(page('30. Nov. 2019 - Funturnier · Sep 28 – 29, 2019 📸'), today).date, '2019-11-30');
	assert.equal(parseAlbumPage(page('12.November 2022 - Funturnier · Saturday, Nov 12, 2022 📸'), today).title, 'Funturnier');

	const range = parseAlbumPage(page('27.-28. Oktober 2019 - Bgld. LM · Oct 26 – 28, 2018 📸'), today);
	assert.deepEqual([range.title, range.date], ['Bgld. LM', '2019-10-27']);

	const trailing = parseAlbumPage(page('Start Frühjahreskurs St. Margarethen 1.3.2025 · Saturday, Mar 1, 2025 📸'), today);
	assert.deepEqual([trailing.title, trailing.date], ['Start Frühjahreskurs St. Margarethen', '2025-03-01']);

	assert.equal(parseAlbumPage(page('17. Mai 2008 - 20 Jahre SVÖ Oggau · Saturday, May 17, 2008 📸'), today).title, '20 Jahre SVÖ Oggau');
	assert.equal(parseAlbumPage(page('13. Jänner 2026 - Eiswanderung · Jan 13 📸'), today).date, '2026-01-13');
});

test('without a date in the name, the first photo date is used', () => {
	assert.deepEqual(
		[parseAlbumPage(page('Herbstkurs · Sep 28 – Oct 2, 2019 📸'), today)].map((p) => [p.title, p.date])[0],
		['Herbstkurs', '2019-09-28']
	);
	// Google leaves out the current year, so a later day must be from last year
	assert.equal(parseAlbumPage(page('Silvester · Wednesday, Dec 31 📸'), today).date, '2025-12-31');
	assert.equal(parseAlbumPage(page('Funturnier · Saturday, Jun 20 📸'), today).date, '2026-06-20');
	assert.equal(parseAlbumPage(page('Ohne Datum'), today).date, null);
	assert.equal(parseAlbumPage(page('Tom &amp; Jerry &#39;26 · Jun 20'), today).title, "Tom & Jerry '26");
});

test('pages without Open Graph tags are rejected', () => {
	assert.equal(parseAlbumPage('<html>Sign in</html>'), null);
});

test('cover URLs are sized for the gallery, old Picasa URLs stay as they are', () => {
	assert.equal(
		sizeCoverUrl(' https://lh3.googleusercontent.com/pw/AP1Gcz=w1200-h1600-s-no-gm?authuser=0 '),
		'https://lh3.googleusercontent.com/pw/AP1Gcz=w800-h600-p'
	);
	assert.equal(sizeCoverUrl('https://lh3.googleusercontent.com/G9Wf_dfz=w530-h278-no'), 'https://lh3.googleusercontent.com/G9Wf_dfz=w800-h600-p');
	const picasa = 'https://lh3.googleusercontent.com/-pvBrn3czaG4/UJvh59ZNaKE/AAAAAAAAFnU/EsyRG5wNElg/s379-c-Ic42/a.jpg';
	assert.equal(sizeCoverUrl(picasa), picasa);
	assert.equal(sizeCoverUrl(''), '');
});
