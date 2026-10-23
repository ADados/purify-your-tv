(function (root) {
    'use strict';
    var zone = 'America/Detroit';
    var names = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    var keys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    var formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    });

    function setZone(timezone) {
        var nextFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
        });
        formatter = nextFormatter;
        zone = timezone;
        api.zone = timezone;
    }

    function masjid(record) {
        if (!record || !/^[A-Za-z0-9_-]{1,64}$/.test(record.masjidalId) ||
                typeof record.name !== 'string' || !record.name.trim() || record.name.length > 250 ||
                typeof record.timezone !== 'string') throw new Error('Invalid masjid');
        new Intl.DateTimeFormat('en-US', {timeZone: record.timezone}).format(new Date());
        return {source: 'royyaa', id: record.masjidalId, name: record.name,
            timezone: record.timezone, address: typeof record.address === 'string' ? record.address.slice(0, 500) : ''};
    }

    function localTime(text) {
        if (text === null || text === undefined || text === '') return null;
        if (typeof text !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(text)) throw new Error('Invalid prayer time');
        var hour = Number(text.slice(0, 2));
        return (hour % 12 || 12) + text.slice(2) + (hour < 12 ? ' AM' : ' PM');
    }

    function parseRoyyaa(payload, expectedId) {
        var mosque = masjid(payload && payload.masjid);
        if (mosque.id !== expectedId || !Array.isArray(payload.days) || !payload.days.length || payload.days.length > 31) {
            throw new Error('Unexpected masjid timetable');
        }
        var seen = {};
        var days = payload.days.map(function (day) {
            if (!day || typeof day.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
                    isNaN(Date.parse(day.date)) || new Date(day.date).toISOString().slice(0, 10) !== day.date ||
                    seen[day.date] || !day.athan || !day.iqamah) throw new Error('Invalid timetable date');
            seen[day.date] = true;
            var prayers = keys.map(function (key, index) {
                var field = key === 'dhuhr' ? 'zuhr' : key;
                var begins = localTime(day.athan[field]);
                if (!begins) throw new Error('Missing prayer time');
                return {key: key, name: names[index], begins: begins,
                    iqamah: key === 'sunrise' ? null : localTime(day.iqamah[field])};
            });
            var sessions = day.iqamah.jummah;
            if (sessions !== undefined && sessions !== null && !Array.isArray(sessions)) throw new Error('Invalid Jumuah sessions');
            var friday = (sessions || []).map(localTime).filter(Boolean);
            return {date: day.date, prayers: prayers, friday: friday, masjidId: mosque.id, timezone: mosque.timezone};
        });
        days.sort(function (first, second) { return first.date.localeCompare(second.date); });
        return {masjid: mosque, days: days};
    }

    function parts(date) {
        var result = {};
        formatter.formatToParts(date).forEach(function (part) {
            if (part.type !== 'literal') result[part.type] = Number(part.value);
        });
        result.hour = result.hour % 24;
        return result;
    }

    function dateKey(date) {
        var local = parts(date);
        return local.year + '-' + String(local.month).padStart(2, '0') + '-' + String(local.day).padStart(2, '0');
    }

    function minutes(text) {
        var match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(text).trim());
        if (!match || Number(match[1]) < 1 || Number(match[1]) > 12 || Number(match[2]) > 59) return null;
        return (Number(match[1]) % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0)) * 60 + Number(match[2]);
    }

    function epoch(day, clock) {
        var value = minutes(clock);
        if (value === null || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
        var fields = day.split('-').map(Number);
        var target = Date.UTC(fields[0], fields[1] - 1, fields[2], Math.floor(value / 60), value % 60);
        var guess = target;
        for (var iteration = 0; iteration < 3; iteration++) {
            var local = parts(new Date(guess));
            var represented = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second);
            guess += target - represented;
        }
        return guess;
    }

    function extractArray(text, start) {
        var depth = 0;
        var quoted = false;
        var escaped = false;
        for (var position = start; position < text.length; position++) {
            var character = text[position];
            if (quoted) {
                if (escaped) escaped = false;
                else if (character === '\\') escaped = true;
                else if (character === '"') quoted = false;
            } else if (character === '"') quoted = true;
            else if (character === '[') depth++;
            else if (character === ']' && --depth === 0) return JSON.parse(text.slice(start, position + 1));
        }
        throw new Error('Incomplete timetable');
    }

    function parseMCWS(html) {
        var pattern = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
        var match;
        while ((match = pattern.exec(html))) {
            var text = JSON.parse(match[1]);
            var marker = text.indexOf('"prayer":[');
            if (marker < 0) continue;
            var rows = extractArray(text, marker + 9);
            var prayers = keys.map(function (key, index) {
                var found = rows.find(function (row) { return row.key === key; });
                if (!found || minutes(found.begins) === null || (key !== 'sunrise' && minutes(found.jamaah) === null)) {
                    throw new Error('Incomplete MCWS prayer data');
                }
                return { key: key, name: names[index], begins: found.begins, iqamah: key === 'sunrise' ? null : found.jamaah };
            });
            var jummah = rows.find(function (row) { return row.key === 'jummah-mcws'; });
            var friday = jummah ? [jummah.begins, jummah.jamaah].filter(function (time) { return minutes(time) !== null; }) : [];
            return { prayers: prayers, friday: friday };
        }
        throw new Error('MCWS timetable was not found');
    }

    function validSnapshot(snapshot, now) {
        return !!(snapshot && snapshot.date === dateKey(now) && Array.isArray(snapshot.prayers) &&
            snapshot.prayers.length === keys.length && snapshot.prayers.every(function (prayer, index) {
                return prayer && prayer.key === keys[index] && minutes(prayer.begins) !== null &&
                    (prayer.key === 'sunrise' || prayer.iqamah === null || minutes(prayer.iqamah) !== null);
            }));
    }

    function next(snapshot, now, type, futureDay) {
        var reference = futureDay && snapshot ? new Date(epoch(snapshot.date, '12:00 PM')) : now;
        if (!validSnapshot(snapshot, reference)) return null;
        var friday = new Date(snapshot.date + 'T12:00:00Z').getUTCDay() === 5;
        var events = [];
        snapshot.prayers.forEach(function (prayer) {
            if (prayer.key === 'sunrise') return;
            if (type === 'iqamah' && friday && prayer.key === 'dhuhr' && snapshot.friday && snapshot.friday.length) return;
            var time = prayer[type];
            var timestamp = epoch(snapshot.date, time);
            if (timestamp !== null && timestamp > now.getTime()) events.push({ name: prayer.name, key: prayer.key, time: time, timestamp: timestamp });
        });
        if (type === 'iqamah' && friday) {
            (snapshot.friday || []).forEach(function (time) {
                var timestamp = epoch(snapshot.date, time);
                if (timestamp !== null && timestamp > now.getTime()) events.push({ name: 'Jumuah', key: 'dhuhr', time: time, timestamp: timestamp });
            });
        }
        events.sort(function (first, second) { return first.timestamp - second.timestamp; });
        return events[0] || null;
    }

    function nextScheduled(days, now, type) {
        var today = dateKey(now);
        var tomorrow = new Date(today + 'T12:00:00Z');
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        var tomorrowKey = tomorrow.toISOString().slice(0, 10);
        var events = [];
        (days || []).forEach(function (day) {
            if (day.date !== today && day.date !== tomorrowKey) return;
            var noon = epoch(day.date, '12:00 PM');
            if (noon === null || !validSnapshot(day, new Date(noon))) return;
            var candidate = next(day, now, type, day.date !== today);
            if (candidate && candidate.timestamp > now.getTime()) {
                candidate.day = day.date;
                events.push(candidate);
            }
        });
        events.sort(function (first, second) { return first.timestamp - second.timestamp; });
        return events[0] || null;
    }

    var api = { zone: zone, keys: keys, names: names, parts: parts, dateKey: dateKey, minutes: minutes,
        epoch: epoch, parseMCWS: parseMCWS, validSnapshot: validSnapshot, next: next,
        setZone: setZone, masjid: masjid, parseRoyyaa: parseRoyyaa, nextScheduled: nextScheduled };
    root.PrayerData = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
