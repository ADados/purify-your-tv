(function () {
    'use strict';
    var themes = [
        ['classic', 'Teal & Gold', 'Classic Islamic geometry'],
        ['mint', 'Midnight & Mint', 'Architectural and modern'],
        ['sand', 'Sand & Olive', 'Warm, light and minimal'],
        ['obsidian', 'Obsidian & Gold', 'Dark with champagne accents'],
        ['dusk', 'Twilight', 'Soft sunset and layered hills']
    ];
    var baseline = {source: 'mcws', id: 'mcws', name: 'MCWS', timezone: 'America/Detroit', address: 'Canton, Michigan'};
    var chosen = baseline;
    var currentTheme = 'classic';
    var pending = {};
    var sequence = 0;
    var searchVersion = 0;
    var panel = document.getElementById('launcher-settings');
    function store(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {} }
    try {
        var saved = JSON.parse(localStorage.getItem('simplehome.masjid.v1'));
        if (saved && saved.source === 'royyaa') chosen = PrayerData.masjid({masjidalId: saved.id, name: saved.name, timezone: saved.timezone, address: saved.address});
        var theme = JSON.parse(localStorage.getItem('simplehome.theme.v1'));
        if (themes.some(function (item) { return item[0] === theme; })) currentTheme = theme;
    } catch (error) {}
    PrayerData.setZone(chosen.timezone);

    function applyTheme(name) {
        currentTheme = name;
        document.getElementById('modern-theme').disabled = name === 'classic';
        ['sand', 'obsidian', 'dusk'].forEach(function (variant) {
            document.getElementById('theme-' + variant).disabled = variant !== name;
        });
        document.documentElement.setAttribute('data-theme', name);
        Array.prototype.forEach.call(document.querySelectorAll('.theme-option'), function (button) {
            button.setAttribute('aria-pressed', button.getAttribute('data-theme') === name ? 'true' : 'false');
        });
        store('simplehome.theme.v1', name);
    }
    themes.forEach(function (theme) {
        var button = document.createElement('button');
        button.className = 'nav theme-option';
        button.setAttribute('data-theme', theme[0]);
        var swatch = document.createElement('span');
        swatch.className = 'theme-swatch swatch-' + theme[0];
        var name = document.createElement('strong');
        name.textContent = theme[1];
        var description = document.createElement('small');
        description.textContent = theme[2];
        button.appendChild(swatch);
        button.appendChild(name);
        button.appendChild(description);
        button.onclick = function () { applyTheme(theme[0]); };
        document.getElementById('theme-options').appendChild(button);
    });
    applyTheme(currentTheme);

    function updateSummary() {
        document.getElementById('selected-masjid').textContent = 'Selected: ' + chosen.name + ' · ' + chosen.timezone;
    }
    function select(mosque) {
        chosen = mosque;
        PrayerData.setZone(mosque.timezone);
        store('simplehome.masjid.v1', chosen);
        updateSummary();
        document.getElementById('masjid-search-status').textContent = 'Selected ' + mosque.name + '. Loading its timetable…';
        if (window.onMasjidChanged) window.onMasjidChanged();
    }
    function rpc(method, args) {
        return new Promise(function (resolve, reject) {
            var id = ++sequence;
            var timer = setTimeout(function () { delete pending[id]; reject(new Error('The masjid service timed out. Try again.')); }, 35000);
            pending[id] = {resolve: resolve, reject: reject, timer: timer};
            try {
                if (!window.TV || typeof TV[method] !== 'function') throw new Error('Masjid search is available in the updated TV app.');
                TV[method].apply(TV, [id].concat(args));
            } catch (error) { clearTimeout(timer); delete pending[id]; reject(error); }
        });
    }
    window.onRoyyaaResponse = function (response) {
        var request = pending[response.requestId];
        if (!request) return;
        delete pending[response.requestId];
        clearTimeout(request.timer);
        if (response.error) request.reject(new Error(response.error));
        else request.resolve(response.data);
    };
    function search(byId) {
        var value = document.getElementById(byId ? 'masjid-id' : 'masjid-query').value.trim();
        document.getElementById(byId ? 'lookup-masjid' : 'search-masjids').focus();
        if (window.TV && typeof TV.dismissKeyboard === 'function') TV.dismissKeyboard();
        var status = document.getElementById('masjid-search-status');
        var results = document.getElementById('masjid-results');
        var version = ++searchVersion;
        results.textContent = '';
        if (byId ? !/^[A-Za-z0-9_-]{1,64}$/.test(value) : value.length < 2) {
            status.textContent = byId ? 'Enter a valid Masjidal ID.' : 'Type at least two characters.';
            return;
        }
        status.textContent = 'Searching Royyaa…';
        rpc('searchMasjids', [value, byId]).then(function (response) {
            if (version !== searchVersion) return;
            var records = Array.isArray(response) ? response : response && response.results;
            if (!Array.isArray(records)) throw new Error('The service returned an unexpected search response.');
            var entries = records.slice(0, 20).map(PrayerData.masjid);
            status.textContent = entries.length ? 'Choose a masjid below to use its timetable.' : 'No matches for “' + value + '” in Royyaa’s directory. It only includes masjids already added. Use Find by ID to add your masjid.';
            entries.forEach(function (mosque) {
                var button = document.createElement('button');
                button.className = 'nav masjid-result';
                button.setAttribute('aria-pressed', chosen.id === mosque.id ? 'true' : 'false');
                var title = document.createElement('strong');
                title.textContent = 'Use ' + mosque.name;
                var detail = document.createElement('span');
                detail.textContent = mosque.address + ' · ' + mosque.timezone + ' · ID: ' + mosque.id;
                button.appendChild(title);
                button.appendChild(detail);
                button.onclick = function () {
                    select(mosque);
                    Array.prototype.forEach.call(results.children, function (item) { item.setAttribute('aria-pressed', item === button ? 'true' : 'false'); });
                };
                results.appendChild(button);
            });
            if (entries.length && !panel.hidden) results.firstChild.focus();
        }).catch(function (error) { if (version === searchVersion) status.textContent = error.message; });
    }
    document.getElementById('search-masjids').onclick = function () { search(false); };
    document.getElementById('lookup-masjid').onclick = function () { search(true); };
    ['masjid-query', 'masjid-id'].forEach(function (id) {
        var input = document.getElementById(id);
        input.setAttribute('enterkeyhint', 'search');
        input.addEventListener('keydown', function (event) {
            if (!event.isComposing && (event.key === 'Enter' || event.keyCode === 13)) {
                event.preventDefault();
                search(id === 'masjid-id');
            }
        });
    });
    document.getElementById('mcws-default').onclick = function () {
        searchVersion++;
        document.getElementById('masjid-results').textContent = '';
        select(baseline);
    };
    document.getElementById('device-settings').onclick = function () { if (window.TV) TV.openSettings(); };
    document.getElementById('close-settings').onclick = close;
    function close() {
        if (panel.hidden) return false;
        panel.hidden = true;
        document.getElementById('settings-button').focus();
        return true;
    }
    updateSummary();
    window.LauncherSettings = {
        selected: function () { return chosen; },
        open: function () { panel.hidden = false; updateSummary(); document.querySelector('.theme-option[aria-pressed="true"]').focus(); },
        close: close,
        panel: panel,
        submitFocusedSearch: function () {
            var input = document.activeElement;
            if (panel.hidden || !input || (input.id !== 'masjid-query' && input.id !== 'masjid-id')) return false;
            search(input.id === 'masjid-id');
            return true;
        },
        timetableStatus: function (id, message) {
            if (chosen.id === id) document.getElementById('masjid-search-status').textContent = message;
        },
        fetchPrayers: function (id, day) { return rpc('fetchMasjidPrayers', [id, day]); }
    };
})();
