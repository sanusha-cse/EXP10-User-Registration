(function () {
    'use strict';

    var config = window.APP_CONFIG || {};
    var apiUrl = config.apiUrl || '';
    var STORAGE_KEY = 'userRegistration.users';

    var form = document.getElementById('registerForm');
    var formView = document.getElementById('formView');
    var resultsView = document.getElementById('resultsView');
    var formError = document.getElementById('formError');
    var submitBtn = document.getElementById('submitBtn');
    var usersBody = document.getElementById('usersBody');

    document.getElementById('modeNote').textContent = apiUrl
        ? ''
        : 'Demo mode: data is saved only in this browser (localStorage).';

    // Date of birth cannot be in the future
    document.getElementById('dob').max = new Date().toISOString().split('T')[0];

    /* ---------- storage: server or localStorage ---------- */

    function readLocal() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function writeLocal(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) { /* storage blocked: still show the result for this visit */ }
    }

    async function saveUser(user) {
        if (!apiUrl) {
            var list = readLocal();
            list.unshift(Object.assign({ registeredAt: new Date().toISOString() }, user));
            writeLocal(list);
            return list;
        }

        var res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        var data = await res.json().catch(function () { return {}; });
        if (!res.ok) throw new Error(data.error || 'Unable to save registration.');
        return data.users || [];
    }

    /* ---------- rendering (textContent only: no HTML injection) ---------- */

    function renderUsers(users) {
        usersBody.textContent = '';
        users.forEach(function (u, i) {
            var tr = document.createElement('tr');
            [i + 1, u.name, u.email, u.phone, u.gender, u.dob, u.course, u.address]
                .forEach(function (value) {
                    var td = document.createElement('td');
                    td.textContent = value == null ? '' : value;
                    tr.appendChild(td);
                });
            usersBody.appendChild(tr);
        });
    }

    function showResults(users, name) {
        document.getElementById('successMsg').textContent = apiUrl
            ? '✓ ' + name + ', your details have been saved to the database!'
            : '✓ ' + name + ', your details have been saved in this browser.';
        document.getElementById('resultsTitle').textContent =
            'Registered Users (' + users.length + ')';
        renderUsers(users);
        formView.classList.add('hidden');
        resultsView.classList.remove('hidden');
        document.body.classList.add('results-view');
        window.scrollTo(0, 0);
    }

    function showError(message) {
        formError.textContent = message;
        formError.classList.remove('hidden');
    }

    /* ---------- events ---------- */

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        formError.classList.add('hidden');

        var data = new FormData(form);
        var user = {};
        ['name', 'email', 'phone', 'gender', 'dob', 'course', 'address'].forEach(function (key) {
            user[key] = String(data.get(key) || '').trim();
        });

        submitBtn.disabled = true;
        try {
            var users = await saveUser(user);
            showResults(users, user.name);
            form.reset();
        } catch (err) {
            showError(err.message || 'Something went wrong. Please try again.');
        } finally {
            submitBtn.disabled = false;
        }
    });

    document.getElementById('backBtn').addEventListener('click', function () {
        resultsView.classList.add('hidden');
        formView.classList.remove('hidden');
        document.body.classList.remove('results-view');
    });
})();
