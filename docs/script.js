var num = Math.floor(Math.random() * 5);

window.addEventListener('load', () => {
	// Backgorund action  	
	document.body.classList.add('bg-' + num);

	// Responsive youtubes.
	var iframes = document.querySelectorAll('iframe[src*="youtube.com"]');
	for (var i = 0; i < iframes.length; i++) {
		var el = iframes[i];
		var wrapper = document.createElement('div');
		wrapper.classList.add('iframe-container');
		el.parentNode.insertBefore(wrapper, el);
		wrapper.appendChild(el);
	}

	// Menu toggle.
	document.querySelector('.menu-toggle').addEventListener('click', (e) => {
		var responsive_menu = document.getElementById('responsive-menu');
		if (responsive_menu.className === 'responsive') {
	    	responsive_menu.className += ' active';
	    	document.querySelector('.menu-toggle').innerHTML = 'X';
	  	} else {
	    	responsive_menu.className = 'responsive';
	    	document.querySelector('.menu-toggle').innerHTML = '...';
	  	}
	});

	// NEW star badges (day-persistent, localStorage based)
	var newStar = function () {
		try {
			var now = new Date();
			var day = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
			var visitKey = 'botwLastVisit';
			var dayKey = 'botwDay';

			var lastVisit = localStorage.getItem(visitKey);
			var lastDay = localStorage.getItem(dayKey);

			if (lastVisit === null) {
				// First visit ever: record the baseline, show no stars.
				localStorage.setItem(visitKey, String(now.getTime()));
				localStorage.setItem(dayKey, day);
				return;
			}

			if (lastDay !== day) {
				// New day: rebase so yesterday's tags clear.
				lastVisit = String(now.getTime());
				localStorage.setItem(visitKey, lastVisit);
				localStorage.setItem(dayKey, day);
			}

			var teasers = document.querySelectorAll('.post-teaser');
			for (var i = 0; i < teasers.length; i++) {
				var date = parseInt(teasers[i].getAttribute('data-date'), 10);
				if (!isNaN(date) && date > parseInt(lastVisit, 10)) {
					var star = document.createElement('span');
					star.className = 'new-star';
					star.textContent = 'NEW';
					teasers[i].querySelector('.title').appendChild(star);
				}
			}
		} catch (e) {
			// localStorage unavailable (private mode etc.): no badges.
		}
	};

	newStar();

	// About page photo: one random photo on every load.
	var initAboutPhoto = function () {
		var listEl = document.getElementById('about-photos');
		if (!listEl) return; // Not the About page: no-op.

		var names;
		try {
			names = JSON.parse(listEl.textContent);
		} catch (e) {
			return; // Malformed JSON: no-op.
		}
		if (!names || !names.length) return; // Empty array: no-op.

		var img = document.getElementById('about-photo');
		if (!img) return; // No photo element: no-op.

		var base = img.getAttribute('data-base') || '';
		var index = Math.floor(Math.random() * names.length);
		img.src = base + names[index];
	};

	initAboutPhoto();

});


