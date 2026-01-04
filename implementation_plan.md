# Implementation Plan – Holiday Query Explorer

This document outlines the plan to implement a clean, minimal, static frontend that interacts with the Holiday SQL API and renders query results dynamically.

## User Review Required

None.
This change is self-contained and frontend-only.

---

## Scope of Work

Build a modern, lightweight UI using **plain HTML, CSS, and vanilla JavaScript**.
The application will accept a natural-language query, call the backend API, display the generated SQL, and render the returned dataset as a table.

---

## Proposed Implementation

### Frontend Structure

All frontend files will be created in the project root:

```
d:/2026/workspaces/Git_dev_holidays/dev_holidays/
```

---

### `index.html` (New)

**Purpose**
Defines the structure and layout of the UI.

**Structure**

* `<header>`

  * Application title
  * Short descriptive subtitle
* `<main>`

  * Query input section (textarea + submit button)
  * Error message container (hidden by default)
  * Loading indicator (hidden by default)
  * Results container (hidden by default), containing:

    * Generated SQL display (code block)
    * Row count summary
    * Dynamically generated results table

**Notes**

* Links `style.css` and `script.js`
* Uses semantic HTML
* Uses a system font stack or optional Google Font

---

### `style.css` (New)

**Theme**

* Light theme
* Clean white and gray palette
* Minimal visual noise

**Layout**

* Centered content
* `max-width: 800px`
* Responsive design using flexbox or grid where appropriate

**Components**

* **Card container**

  * Soft shadow
  * Rounded corners
* **Textarea**

  * Clear borders
  * Visible focus state
* **Button**

  * Single accent color (blue or teal)
  * Hover and disabled states
* **SQL block**

  * Monospace font
  * Light gray background
  * Horizontal scrolling for long queries
* **Table**

  * Full width
  * Collapsed borders
  * Sticky header row
  * Alternating row background for readability

---

### `script.js` (New)

**Responsibilities**

* Handle user input and submission
* Manage UI state transitions (loading, error, results)
* Call backend API
* Render SQL and results dynamically

**Core Logic**

* Attach click handler to submit button
* Read user input
* Send POST request to:

  ```
  https://holidaybackend.netlify.app/.netlify/functions/query
  ```
* Parse JSON response safely
* Handle:

  * Network errors
  * API-level errors
* Clear previous results before rendering new ones

**Rendering Logic**

* Display generated SQL string
* Display row count
* Generate table headers dynamically using keys from response data
* Populate table rows dynamically from response array
* Show a fallback message if no data is returned

---

## Verification Plan

### Manual Verification

* Open `index.html` directly in a browser
* Validate:

  * Query submission works
  * Loading indicator appears and disappears correctly
  * SQL query renders correctly
  * Table renders correctly for varying schemas
  * Error messages display gracefully
  * UI remains usable on smaller screens

No backend changes are required for this implementation.
