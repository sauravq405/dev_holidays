// script.js – Holiday Query Explorer

// DOM element references
const textarea = document.querySelector('#question');
const askBtn = document.querySelector('#askBtn');
const errorDiv = document.querySelector('#errorMessage');
const loadingDiv = document.querySelector('#loading');
const sqlDiv = document.querySelector('#sqlBlock');
const rowCountSpan = document.querySelector('#rowCount');
const tableWrapper = document.querySelector('#tableWrapper');

// API endpoint
const API_URL = 'https://holidaybackend.netlify.app/.netlify/functions/query';

// Helper: show/hide elements
function toggleVisibility(el, show) {
  el.classList.toggle('hidden', !show);
}

// Reset UI before a new request
function resetUI() {
  errorDiv.textContent = '';
  toggleVisibility(errorDiv, false);
  sqlDiv.textContent = '';
  rowCountSpan.textContent = '';
  tableWrapper.innerHTML = '';
}

// Render SQL block
function renderSQL(sql) {
  sqlDiv.textContent = sql;
}

// Render row count badge
function renderRowCount(count) {
  rowCountSpan.textContent = `Rows returned: ${count}`;
}

// Render dynamic table from data array
function renderTable(data) {
  if (!Array.isArray(data) || data.length === 0) {
    tableWrapper.innerHTML = `<div class="no-results">No results found</div>`;
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Header row – keys from first object
  const headers = Object.keys(data[0]);
  const headerRow = document.createElement('tr');
  headers.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.replace(/_/g, ' ');
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Data rows
  data.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(col => {
      const td = document.createElement('td');
      const val = row[col];
      // Use monospace for dates/numbers
      if (typeof val === 'number' || /\d{4}-\d{2}-\d{2}/.test(val)) {
        td.style.fontFamily = 'var(--font-mono)';
      }
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableWrapper.appendChild(table);
}

// Main request handler
async function askQuestion() {
  const question = textarea.value.trim();
  if (!question) {
    errorDiv.textContent = 'Please enter a question.';
    toggleVisibility(errorDiv, true);
    return;
  }

  resetUI();
  toggleVisibility(loadingDiv, true);
  askBtn.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const result = await response.json();

    // Render results
    renderSQL(result.sql || '');
    renderRowCount(result.row_count ?? 0);
    renderTable(result.data ?? []);

  } catch (err) {
    errorDiv.textContent = `Error: ${err.message}`;
    toggleVisibility(errorDiv, true);
  } finally {
    toggleVisibility(loadingDiv, false);
    askBtn.disabled = false;
  }
}

// Event listeners
askBtn.addEventListener('click', askQuestion);
textarea.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    askQuestion();
  }
});
