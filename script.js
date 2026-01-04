// script.js – Holiday Query Explorer

document.addEventListener('DOMContentLoaded', () => {
    // DOM element references
    const textarea = document.querySelector('#questionInput');
    const askBtn = document.querySelector('#askBtn');
    const errorDiv = document.querySelector('#errorMsg');
    const loadingDiv = document.querySelector('#loading');
    const sqlDiv = document.querySelector('#sqlDisplay');
    const rowCountSpan = document.querySelector('#rowCount');
    const tableWrapper = document.querySelector('#tableWrapper');
    const resultsArea = document.querySelector('#resultsArea');

    // API endpoint
    const API_URL = 'https://holidaybackend.netlify.app/.netlify/functions/query';

    /**
     * Helper to show or hide elements using the 'hidden' CSS class
     */
    function toggleVisibility(el, show) {
        if (!el) return;
        el.classList.toggle('hidden', !show);
    }

    /**
     * Resets UI components to their initial hidden or empty states
     */
    function resetUI() {
        errorDiv.textContent = '';
        toggleVisibility(errorDiv, false);
        sqlDiv.textContent = '';
        rowCountSpan.textContent = '0 rows';
        tableWrapper.querySelector('thead').innerHTML = '';
        tableWrapper.querySelector('tbody').innerHTML = '';
        toggleVisibility(tableWrapper.querySelector('#noResults'), true);
        toggleVisibility(resultsArea, false);
    }

    /**
     * Renders the generated SQL query into the code block
     */
    function renderSQL(sql) {
        sqlDiv.textContent = sql || '-- No SQL generated';
    }

    /**
     * Updates the row count badge
     */
    function renderRowCount(count) {
        rowCountSpan.textContent = `${count || 0} rows`;
    }

    /**
     * Dynamically builds the results table from the API data
     */
    function renderTable(data) {
        const thead = tableWrapper.querySelector('thead');
        const tbody = tableWrapper.querySelector('tbody');
        const noResults = tableWrapper.querySelector('#noResults');
        const table = tableWrapper.querySelector('table');

        // Clear previous entries
        thead.innerHTML = '';
        tbody.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            toggleVisibility(noResults, true);
            toggleVisibility(table, false);
            return;
        }

        toggleVisibility(noResults, false);
        toggleVisibility(table, true);

        // Header row construction from first data object keys
        const headers = Object.keys(data[0]);
        const headerRow = document.createElement('tr');
        headers.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.replace(/_/g, ' ');
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Body rows construction
        data.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(col => {
                const td = document.createElement('td');
                const val = row[col];

                // Format dates and numbers specifically
                if (typeof val === 'number' || (typeof val === 'string' && /\d{4}-\d{2}-\d{2}/.test(val))) {
                    td.style.fontFamily = 'var(--font-mono)';
                }

                td.textContent = val !== null && val !== undefined ? val : '-';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    /**
     * Main event handler for the search submission
     */
    async function askQuestion() {
        const question = textarea.value.trim();
        if (!question) {
            errorDiv.textContent = 'Please enter a question.';
            toggleVisibility(errorDiv, true);
            return;
        }

        // Preparation
        resetUI();
        toggleVisibility(loadingDiv, true);
        askBtn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ question })
            });

            if (!response.ok) {
                const errText = await response.text();
                // Check if response is JSON (common for API errors)
                let errMsg = `Server responded with ${response.status}`;
                try {
                    const errJson = JSON.parse(errText);
                    if (errJson.error) errMsg = errJson.error;
                } catch (e) { /* ignore parse error */ }

                throw new Error(errMsg);
            }

            const result = await response.json();

            // Success rendering
            renderSQL(result.sql);
            renderRowCount(result.row_count);
            renderTable(result.data);

            // Show the completed results
            toggleVisibility(resultsArea, true);

        } catch (err) {
            console.error('Holiday Query App Error:', err);
            errorDiv.textContent = `Error: ${err.message}. Please try a different question.`;
            toggleVisibility(errorDiv, true);
        } finally {
            toggleVisibility(loadingDiv, false);
            askBtn.disabled = false;
        }
    }

    // Event listeners registration
    if (askBtn) {
        askBtn.addEventListener('click', askQuestion);
    }

    if (textarea) {
        textarea.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                askQuestion();
            }
        });
    }
});
