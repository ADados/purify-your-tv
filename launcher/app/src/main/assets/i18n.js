(function () {
    'use strict';
    var language = 'en';
    try { if (JSON.parse(localStorage.getItem('simplehome.language.v1')) === 'ar') language = 'ar'; } catch (error) {}
    var arabic = {
        'All apps': 'كل التطبيقات', 'Home helper': 'مساعد زر الرئيسية', 'Settings': 'الإعدادات',
        'Amazon Home': 'واجهة أمازون', 'NEXT IQAMAH': 'الإقامة القادمة', 'TODAY’S PRAYERS': 'صلوات اليوم',
        'YOUR APPS': 'تطبيقاتك', 'Use the arrows · OK to open · Back to dashboard': 'استخدم الأسهم · موافق للفتح · رجوع إلى الرئيسية',
        'A little more calm. A little less noise.': 'هدوء أكثر. ضوضاء أقل.', 'Your app library': 'مكتبة التطبيقات',
        'Done': 'تم', 'MAKE YOURSELF AT HOME': 'مساحتك كما تحب', 'Launcher settings': 'إعدادات الواجهة',
        'Language': 'اللغة', 'Appearance': 'المظهر', 'Your masjid': 'مسجدك', 'Use MCWS · Canton': 'اختيار MCWS · كانتون',
        'Find by name or city': 'ابحث بالاسم أو المدينة', 'At least 2 characters': 'حرفان على الأقل',
        'Or enter a Masjidal ID': 'أو أدخل معرّف Masjidal', 'For example, z0AWYBKj': 'مثال: z0AWYBKj',
        'Search': 'بحث', 'Find by ID': 'بحث بالمعرّف', 'Fire TV settings': 'إعدادات Fire TV',
        'Name search finds masjids already in Royyaa. Use a Masjidal ID to add one. Times follow your selected masjid’s timezone.': 'البحث بالاسم يعرض المساجد المضافة إلى Royyaa. استخدم معرّف Masjidal لإضافة مسجد. تُعرض الأوقات حسب المنطقة الزمنية للمسجد المختار.',
        'Masjid search and selectable timetables provided by Royyaa': 'البحث عن المساجد ومواقيت الصلاة مقدّمان من Royyaa',
        'Teal & Gold': 'فيروزي وذهبي', 'Classic Islamic geometry': 'زخارف هندسية إسلامية',
        'Midnight & Mint': 'ليلي ونعناعي', 'Architectural and modern': 'تصميم معماري عصري',
        'Sand & Olive': 'رملي وزيتوني', 'Warm, light and minimal': 'دافئ وفاتح وبسيط',
        'Obsidian & Gold': 'أسود وذهبي', 'Dark with champagne accents': 'داكن بلمسات ذهبية هادئة',
        'Twilight': 'الشفق', 'Soft sunset and layered hills': 'ألوان الغروب وتلال متدرجة',
        'Fajr': 'الفجر', 'Sunrise': 'الشروق', 'Dhuhr': 'الظهر', 'Asr': 'العصر', 'Maghrib': 'المغرب', 'Isha': 'العشاء', 'Jumuah': 'الجمعة',
        'SUN RISES': 'الشروق', 'DHUHR BEGINS': 'دخول وقت الظهر', 'PRAYER BEGINS': 'دخول الوقت',
        'NO IQAMAH': 'لا إقامة', 'JUMUAH SESSIONS': 'مواعيد الجمعة', 'IQAMAH': 'الإقامة',
        'Prayer times': 'مواقيت الصلاة', 'Hijri estimate': 'التاريخ الهجري تقديري',
        'Prayer times provided by Royyaa': 'مواقيت الصلاة مقدّمة من Royyaa',
        'Prayer times from MCWS · Masjid search powered by Royyaa': 'مواقيت الصلاة من MCWS · البحث عن المساجد بواسطة Royyaa',
        'No upcoming published Iqamah · check the masjid timetable.': 'لا توجد إقامة قادمة منشورة · راجع جدول المسجد.',
        'Getting your masjid’s timetable…': 'جارٍ تحميل مواقيت مسجدك…',
        'Timetable unavailable · check your connection': 'المواقيت غير متاحة · تحقق من الاتصال',
        'App launch is available on the TV': 'يمكن فتح التطبيقات على التلفاز',
        'Enter a valid Masjidal ID.': 'أدخل معرّف Masjidal صحيحًا.', 'Type at least two characters.': 'أدخل حرفين على الأقل.',
        'Searching Royyaa…': 'جارٍ البحث في Royyaa…', 'Choose a masjid below to use its timetable.': 'اختر مسجدًا أدناه لعرض مواقيته.',
        'The masjid service timed out. Try again.': 'انتهت مهلة الاتصال. حاول مجددًا.',
        'Masjid search is available in the updated TV app.': 'البحث متاح في الإصدار المحدّث من تطبيق التلفاز.',
        'The service returned an unexpected search response.': 'تعذر قراءة نتائج البحث.',
        'Masjid not found. Check the Masjidal ID.': 'لم يتم العثور على المسجد. تحقق من المعرّف.',
        'Masjid service unavailable. Try again.': 'خدمة المساجد غير متاحة. حاول مجددًا.',
        'Could not reach Royyaa. Check your connection.': 'تعذر الاتصال بـ Royyaa. تحقق من الاتصال.',
        'Please wait for the current masjid requests to finish.': 'انتظر حتى يكتمل البحث الحالي.',
        'Enter a valid Masjidal ID or at least two search characters.': 'أدخل معرّفًا صحيحًا أو حرفين على الأقل للبحث.',
        'Invalid search.': 'بحث غير صالح.', 'Invalid masjid or date.': 'المسجد أو التاريخ غير صالح.',
        'Masjid timezone changed. Select it again in Settings.': 'تغيرت المنطقة الزمنية للمسجد. اختره مجددًا من الإعدادات.',
        'No timetable published for today.': 'لم تُنشر مواقيت اليوم.',
        'MCWS timetable ready · America/Detroit': 'مواقيت MCWS جاهزة · America/Detroit',
        'Using today’s saved MCWS timetable · offline': 'عرض مواقيت MCWS المحفوظة لليوم · دون اتصال',
        'MCWS timetable unavailable. Check your connection.': 'مواقيت MCWS غير متاحة. تحقق من الاتصال.'
    };
    var patterns = [
        [/^Selected: (.+) · (.+)$/, 'المسجد المختار: {1} · {2}'],
        [/^Selected (.+)\. Loading its timetable…$/, 'تم اختيار {1}. جارٍ تحميل المواقيت…'],
        [/^Use (.+)$/, 'اختيار {1}'],
        [/^(.+) · ID: (.+)$/, '{1} · المعرّف: {2}'],
        [/^No matches for “(.+)” in Royyaa’s directory\. It only includes masjids already added\. Use Find by ID to add your masjid\.$/, 'لا توجد نتائج لـ «{1}» في دليل Royyaa. يشمل الدليل المساجد المضافة فقط. استخدم البحث بالمعرّف لإضافة مسجدك.'],
        [/^Timetable ready · (.+) · (.+)$/, 'المواقيت جاهزة · {1} · {2}'],
        [/^Saved timetable · (.+) · offline$/, 'مواقيت محفوظة · {1} · دون اتصال'],
        [/^Loading (.+)…$/, 'جارٍ تحميل {1}…'], [/^No current timetable · (.+)$/, 'لا تتوفر مواقيت حالية · {1}']
    ];
    function isolate(value) { return '\u2068' + value + '\u2069'; }
    function time(value) { return language === 'ar' ? String(value).replace(/\bAM\b/g, 'ص').replace(/\bPM\b/g, 'م') : String(value); }
    function translate(value) {
        var text = String(value);
        if (language !== 'ar') return text;
        if (Object.prototype.hasOwnProperty.call(arabic, text)) return arabic[text];
        var countdown = /^(In |Tomorrow · in )(?:(\d+)h )?(\d+)m (\d+)s$/.exec(text);
        if (countdown) return (countdown[1] === 'In ' ? 'بعد ' : 'غدًا · بعد ') + (countdown[2] ? countdown[2] + ' س ' : '') + countdown[3] + ' د ' + countdown[4] + ' ث';
        var adhan = /^Next prayer begins · (\w+)( tomorrow)? at (.+)$/.exec(text);
        if (adhan) return 'الصلاة القادمة · ' + translate(adhan[1]) + (adhan[2] ? ' غدًا' : '') + ' عند ' + isolate(time(adhan[3]));
        if (text.indexOf('Jumuah · ') === 0) return 'الجمعة · ' + isolate(time(text.slice(9)));
        if (text.endsWith(' · Hijri estimate')) return isolate(text.slice(0, -17)) + ' · ' + arabic['Hijri estimate'];
        for (var index = 0; index < patterns.length; index++) {
            var match = patterns[index][0].exec(text);
            if (match) return patterns[index][1].replace(/\{(\d+)\}/g, function (token, number) { return isolate(match[Number(number)]); });
        }
        return text;
    }
    function set(element, text) {
        element.setAttribute('data-i18n', String(text));
        element.textContent = translate(text);
    }
    function apply() {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (element) {
            element.textContent = translate(element.getAttribute('data-i18n'));
        });
        Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-placeholder]'), function (element) {
            element.placeholder = translate(element.getAttribute('data-i18n-placeholder'));
        });
        Array.prototype.forEach.call(document.querySelectorAll('[data-language]'), function (button) {
            button.setAttribute('aria-pressed', button.getAttribute('data-language') === language ? 'true' : 'false');
        });
        if (window.TV && typeof TV.setLanguage === 'function') TV.setLanguage(language);
    }
    window.I18n = {
        text: translate, time: time, set: set,
        language: function () { return language; },
        locale: function () { return language === 'ar' ? 'ar-u-ca-gregory-nu-latn' : 'en-US'; },
        choose: function (value) {
            if (value !== 'en' && value !== 'ar') return;
            language = value;
            try { localStorage.setItem('simplehome.language.v1', JSON.stringify(value)); } catch (error) {}
            apply();
            window.dispatchEvent(new Event('languagechange'));
        }
    };
    apply();
})();
