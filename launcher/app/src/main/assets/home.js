(function () {
    'use strict';
    var snapshot = null;
    var offline = true;
    var loading = false;
    var lastAttempt = 0;
    var lastSuccess = 0;
    var requestedDay = '';
    var signature = '';
    var cacheKey = 'simplehome.mcws.v1';
    var selected = LauncherSettings.selected();
    var schedule = [];
    var generation = 0;
    var library = document.getElementById('library');
    var preferred = ['com.amazon.firetv.youtube', 'com.amazon.firebat', 'net.mbc.shahidTV',
        'com.apple.atve.amazon.appletv', 'com.netflix.ninja', 'com.hulu.plus'];

    function put(id, text) {
        var element = document.getElementById(id);
        if (id === 'masjid-badge') element.textContent = text;
        else I18n.set(element, text);
    }
    function tidy(text) { return text ? text.replace(/^0/, '') : '—'; }
    function notice(text) {
        var element = document.getElementById('notice');
        I18n.set(element, text);
        element.hidden = false;
        setTimeout(function () { element.hidden = true; }, 4000);
    }

    function render() {
        var now = new Date();
        if (selected.source === 'royyaa') snapshot = schedule.find(function (day) { return day.date === PrayerData.dateKey(now); }) || null;
        var valid = PrayerData.validSnapshot(snapshot, now);
        var next = selected.source === 'royyaa' ? PrayerData.nextScheduled(schedule, now, 'iqamah') : PrayerData.next(snapshot, now, 'iqamah');
        var adhan = selected.source === 'royyaa' ? PrayerData.nextScheduled(schedule, now, 'begins') : PrayerData.next(snapshot, now, 'begins');
        var clock = new Intl.DateTimeFormat('en-US', {timeZone: PrayerData.zone, hour: 'numeric', minute: '2-digit'}).format(now);
        var clockParts = clock.split(' ');
        var clockElement = document.getElementById('clock');
        clockElement.textContent = clockParts[0];
        var period = document.createElement('small');
        period.textContent = I18n.time(clockParts.slice(1).join(' '));
        clockElement.appendChild(period);
        put('date', new Intl.DateTimeFormat(I18n.locale(), {timeZone: PrayerData.zone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}).format(now));
        var maghrib = valid && snapshot.prayers[4];
        var local = PrayerData.parts(now);
        var afterMaghrib = !!(maghrib && local.hour * 60 + local.minute >= PrayerData.minutes(maghrib.begins));
        put('hijri', window.TV && TV.getHijriDateForZone ? TV.getHijriDateForZone(afterMaghrib, selected.timezone) + ' · Hijri estimate' : selected.timezone);
        put('masjid-badge', selected.name);
        document.querySelector('.location').textContent = selected.source === 'mcws' ? selected.address : selected.timezone.replace(/_/g, ' ');
        document.querySelector('.location').title = selected.address;
        put('footer-source', selected.name + ' · ' + selected.timezone + ' · Hijri estimate');
        put('provider-note', selected.source === 'royyaa' ? 'Prayer times provided by Royyaa' : 'Prayer times from MCWS · Masjid search powered by Royyaa');
        if (next) {
            var seconds = Math.max(0, Math.ceil((next.timestamp - now.getTime()) / 1000));
            var hours = Math.floor(seconds / 3600);
            put('iqamah-name', next.name);
            put('iqamah-time', I18n.time(tidy(next.time)));
            put('iqamah-countdown', (next.day && next.day !== PrayerData.dateKey(now) ? 'Tomorrow · in ' : 'In ') + (hours ? hours + 'h ' : '') + Math.floor(seconds % 3600 / 60) + 'm ' + String(seconds % 60).padStart(2, '0') + 's');
        } else {
            put('iqamah-name', 'Prayer times');
            put('iqamah-time', '—');
            put('iqamah-countdown', valid ? 'No upcoming published Iqamah · check the masjid timetable.' : (loading ? 'Getting your masjid’s timetable…' : 'Timetable unavailable · check your connection'));
        }
        var friday = new Date(PrayerData.dateKey(now) + 'T12:00:00Z').getUTCDay() === 5;
        put('next-adhan', valid && friday && snapshot.friday && snapshot.friday.length
            ? 'Jumuah · ' + snapshot.friday.map(tidy).join(' & ')
            : (adhan ? 'Next prayer begins · ' + adhan.name + (adhan.day && adhan.day !== PrayerData.dateKey(now) ? ' tomorrow' : '') + ' at ' + tidy(adhan.time) : selected.name));
        put('source-status', valid ? (offline ? 'Saved timetable · ' + snapshot.date + ' · offline' : selected.name + ' · ' + snapshot.date)
            : (loading ? 'Loading ' + selected.name + '…' : 'No current timetable · ' + selected.name));
        var nextSignature = JSON.stringify([I18n.language(), valid && snapshot.prayers, valid && snapshot.friday, friday, next && next.key, next && next.day]);
        if (signature === nextSignature) return;
        signature = nextSignature;
        var container = document.getElementById('prayer-cells');
        container.textContent = '';
        PrayerData.keys.forEach(function (key, index) {
            var prayer = valid && snapshot.prayers[index];
            var cell = document.createElement('div');
            cell.className = 'prayer-cell' + (next && next.key === key ? ' upcoming' : '');
            var isJumuah = valid && friday && key === 'dhuhr' && snapshot.friday && snapshot.friday.length;
            if (isJumuah) cell.className += ' jumuah';
            var todayNext = next && (!next.day || next.day === PrayerData.dateKey(now));
            if (!todayNext) cell.className = cell.className.replace(' upcoming', '');
            [['prayer-marker', todayNext && next.key === key ? 'NEXT IQAMAH' : ''], ['prayer-name', isJumuah ? 'Jumuah' : PrayerData.names[index]], ['prayer-time-label', key === 'sunrise' ? 'SUN RISES' : (isJumuah ? 'DHUHR BEGINS' : 'PRAYER BEGINS')], ['prayer-begins', tidy(prayer && prayer.begins)], ['iqamah-label', key === 'sunrise' ? 'NO IQAMAH' : (isJumuah ? 'JUMUAH SESSIONS' : 'IQAMAH')], ['prayer-iqamah', key === 'sunrise' ? '' : (isJumuah ? snapshot.friday.map(tidy).join(' / ') : tidy(prayer && prayer.iqamah))]].forEach(function (field) {
                var element = document.createElement('div');
                element.className = field[0];
                I18n.set(element, I18n.time(field[1]));
                if (field[0] === 'prayer-iqamah' && isJumuah) {
                    element.textContent = '';
                    snapshot.friday.forEach(function (session) {
                        var item = document.createElement('span');
                        item.textContent = I18n.time(tidy(session));
                        element.appendChild(item);
                    });
                }
                cell.appendChild(element);
            });
            container.appendChild(cell);
        });
    }

    function refresh() {
        if (loading) return;
        loading = true;
        requestedDay = PrayerData.dateKey(new Date());
        lastAttempt = Date.now();
        if (selected.source === 'royyaa') {
            var version = generation;
            var mosque = selected;
            LauncherSettings.fetchPrayers(mosque.id, requestedDay).then(function (response) {
                if (version !== generation) return;
                var parsed = PrayerData.parseRoyyaa(response, mosque.id);
                if (parsed.masjid.timezone !== mosque.timezone) throw new Error('Masjid timezone changed. Select it again in Settings.');
                var today = PrayerData.dateKey(new Date());
                if (!parsed.days.some(function (day) { return day.date === today; })) throw new Error('No timetable published for today.');
                schedule = parsed.days;
                lastSuccess = Date.now();
                offline = false;
                loading = false;
                LauncherSettings.timetableStatus(mosque.id, 'Timetable ready · ' + mosque.name + ' · ' + mosque.timezone);
                try { localStorage.setItem(cacheKey, JSON.stringify(parsed)); } catch (error) {}
                render();
            }).catch(function (error) {
                if (version !== generation) return;
                loading = false;
                offline = true;
                LauncherSettings.timetableStatus(mosque.id, error.message);
                notice(error.message);
                render();
            });
        }
        else if (window.TV) TV.refreshPrayers();
        else window.onPrayerResponse({error: 'Native TV connection unavailable'});
        render();
    }

    window.onPrayerResponse = function (response) {
        if (selected.source !== 'mcws') return;
        loading = false;
        try {
            if (response.error || !response.date || isNaN(Date.parse(response.date))) throw new Error('Unavailable source');
            var day = PrayerData.dateKey(new Date(response.date));
            if (day !== requestedDay || day !== PrayerData.dateKey(new Date())) throw new Error('Outdated source');
            var parsed = PrayerData.parseMCWS(response.html);
            parsed.date = day;
            parsed.fetchedAt = new Date().toISOString();
            if (!PrayerData.validSnapshot(parsed, new Date())) throw new Error('Invalid timetable');
            snapshot = parsed;
            offline = false;
            lastSuccess = Date.now();
            try { localStorage.setItem(cacheKey, JSON.stringify(snapshot)); } catch (error) {}
            LauncherSettings.timetableStatus('mcws', 'MCWS timetable ready · America/Detroit');
        } catch (error) {
            offline = true;
            LauncherSettings.timetableStatus('mcws', PrayerData.validSnapshot(snapshot, new Date()) ? 'Using today’s saved MCWS timetable · offline' : 'MCWS timetable unavailable. Check your connection.');
        }
        render();
    };

    function appButton(app) {
        var button = document.createElement('button');
        button.className = 'app-tile nav';
        var picture = document.createElement('img');
        picture.src = app.icon;
        picture.alt = '';
        var label = document.createElement('span');
        label.textContent = app.label;
        button.appendChild(picture);
        button.appendChild(label);
        button.onclick = function () { if (window.TV) TV.launchApp(app.packageName); else notice('App launch is available on the TV'); };
        return button;
    }

    function apps() {
        var installed = window.TV ? JSON.parse(TV.getApps()) : [];
        var dock = document.getElementById('dock');
        var grid = document.getElementById('library-grid');
        dock.textContent = '';
        grid.textContent = '';
        var selected = preferred.map(function (name) {
            return installed.find(function (app) { return app.packageName === name; });
        }).filter(Boolean);
        installed.forEach(function (app) {
            grid.appendChild(appButton(app));
            if (selected.length < 6 && selected.indexOf(app) < 0) selected.push(app);
        });
        selected.forEach(function (app) { dock.appendChild(appButton(app)); });
    }

    function closeLibrary() {
        if (library.hidden) return false;
        library.hidden = true;
        document.getElementById('apps-button').focus();
        return true;
    }
    document.getElementById('apps-button').onclick = function () {
        library.hidden = false;
        (document.querySelector('#library-grid button') || document.getElementById('close-library')).focus();
    };
    document.getElementById('close-library').onclick = closeLibrary;
    document.getElementById('settings-button').onclick = LauncherSettings.open;
    document.getElementById('helper-button').onclick = function () { if (window.TV) TV.homeHelperSettings(); };
    document.getElementById('amazon-button').onclick = function () { if (window.TV) TV.openAmazonHome(); };
    window.SimpleHomeBack = function () {
        if (!LauncherSettings.close() && !closeLibrary()) {
            (document.querySelector('#dock button') || document.getElementById('apps-button')).focus();
        }
        return true;
    };
    document.addEventListener('keydown', function (event) {
        if ([37, 38, 39, 40].indexOf(event.keyCode) < 0) return;
        if (document.activeElement.tagName === 'INPUT' && (event.keyCode === 37 || event.keyCode === 39)) return;
        event.preventDefault();
        var scope = !LauncherSettings.panel.hidden ? LauncherSettings.panel : (library.hidden ? document.getElementById('dashboard') : library);
        var candidates = Array.prototype.slice.call(scope.querySelectorAll('.nav')).filter(function (element) { return !element.disabled && element.getClientRects().length; });
        var current = document.activeElement;
        if (candidates.indexOf(current) < 0) { if (candidates[0]) candidates[0].focus(); return; }
        var rect = current.getBoundingClientRect();
        var center = {x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2};
        var horizontal = event.keyCode === 37 || event.keyCode === 39;
        var sign = event.keyCode === 37 || event.keyCode === 38 ? -1 : 1;
        var best = null;
        var bestScore = Infinity;
        candidates.forEach(function (candidate) {
            if (candidate === current) return;
            var target = candidate.getBoundingClientRect();
            var deltaX = (target.left + target.right) / 2 - center.x;
            var deltaY = (target.top + target.bottom) / 2 - center.y;
            var primary = horizontal ? deltaX : deltaY;
            var perpendicular = horizontal ? deltaY : deltaX;
            if (primary * sign < 2) return;
            var score = Math.abs(primary) + Math.abs(perpendicular) * 3;
            if (score < bestScore) { bestScore = score; best = candidate; }
        });
        if (best) { best.focus(); best.scrollIntoView({block: 'nearest', inline: 'nearest'}); }
    });
    window.onTVResume = function () { render(); if (!loading && Date.now() - lastAttempt > 60000) refresh(); };
    function loadSelection() {
        selected = LauncherSettings.selected();
        generation++;
        snapshot = null;
        schedule = [];
        loading = false;
        offline = true;
        lastSuccess = 0;
        signature = '';
        cacheKey = selected.source === 'mcws' ? 'simplehome.mcws.v1' : 'simplehome.royyaa.v1.' + selected.id;
        try {
            var saved = JSON.parse(localStorage.getItem(cacheKey));
            if (selected.source === 'mcws') snapshot = saved;
            else if (saved && saved.masjid && saved.masjid.id === selected.id && saved.masjid.timezone === selected.timezone && Array.isArray(saved.days)) {
                schedule = saved.days.filter(function (day) { return day.masjidId === selected.id && day.timezone === selected.timezone; });
            }
        } catch (error) {}
    }
    window.onMasjidChanged = function () { loadSelection(); render(); refresh(); };
    window.addEventListener('languagechange', render);
    loadSelection();
    apps();
    render();
    refresh();
    setInterval(function () {
        if (document.hidden) return;
        render();
        if (Date.now() - lastAttempt > 60000 && (!PrayerData.validSnapshot(snapshot, new Date()) || Date.now() - lastSuccess > 900000)) refresh();
    }, 1000);
    (document.querySelector('#dock button') || document.getElementById('apps-button')).focus();
})();
