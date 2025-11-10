# Bug Report Feedback System - Test Coverage

## Overview

This document describes the comprehensive test suite for the Bug Report Feedback System (Issue #29).

## Test Files

### 1. E2E Tests: Bug Report UI (`e2e/bug-report.spec.ts`)

**Purpose:** Test the user interface and interactions for the bug report feedback system.

**Test Cases:**

- **Widget Rendering**: Verifies the CoffeeCopilot widget is displayed on page load
- **Report Issue Tab**: Confirms the "Report Issue" tab exists in the copilot interface
- **Bug Report Mode**: Tests switching to bug report mode and displaying the description textarea
- **Validation**: Ensures empty bug reports show validation errors
- **Text Input**: Validates that users can type bug descriptions into the textarea
- **Screenshot Handling**: Tests screenshot upload functionality and UI
- **UI Elements**: Verifies all required bug report UI elements are present
- **Tab Switching**: Tests switching between Chat and Report Issue tabs
- **Network Error Handling**: Ensures proper error handling when the API is unreachable
- **Cross-Page Availability**: Confirms the copilot widget is available across the site

**Run Tests:**
```bash
npm test:e2e
```

### 2. API Tests: Feedback Endpoint (`e2e/feedback-api.spec.ts`)

**Purpose:** Test the `/api/feedback` endpoint functionality.

**Test Cases:**

- **Endpoint Availability**: Verifies the POST `/api/feedback` endpoint accepts requests
- **Required Fields**: Tests that description is required
- **Empty Validation**: Confirms empty descriptions are rejected
- **FormData Support**: Tests multipart form data submission with fetch API
- **Response Format**: Validates successful response contains expected fields (success, issueNumber, url)
- **Error Handling**: Tests graceful error handling with malformed data
- **Multipart Upload**: Tests multipart form data with screenshot attachment
- **Description Length**: Validates handling of very long descriptions

**Run Tests:**
```bash
npm test:e2e
```

## Component Changes

### CoffeeCopilot Component (`src/components/CoffeeCopilot.tsx`)

**Added Test Attributes:**
- `data-testid="copilot-button"` - Floating action button for opening the chat
- `data-testid="copilot-widget"` - Main chat widget container

These attributes enable reliable test selectors without depending on CSS classes.

## Test Coverage Summary

| Feature | Test Type | Status |
|---------|-----------|--------|
| Widget Rendering | E2E | ✅ |
| Tab Navigation | E2E | ✅ |
| Bug Report UI | E2E | ✅ |
| Form Validation | E2E | ✅ |
| Screenshot Upload | E2E | ✅ |
| API Endpoint | API | ✅ |
| Error Handling | API | ✅ |
| Multipart Upload | API | ✅ |

## Test Setup

### Requirements
- Playwright 1.56.1+
- Node.js for running tests
- Local development server running on http://localhost:5173

### Configuration
- Playwright config: `playwright.config.ts`
- Test directory: `e2e/`
- Base URL: http://localhost:5173 (configurable via PLAYWRIGHT_TEST_BASE_URL)
- Reporter: HTML report at `playwright-report/`

### Running Tests

**All tests:**
```bash
npm test:e2e
```

**Specific test file:**
```bash
npx playwright test e2e/bug-report.spec.ts
```

**With UI mode:**
```bash
npx playwright test --ui
```

**Debug mode:**
```bash
npx playwright test --debug
```

**Generate report:**
```bash
npx playwright show-report
```

## Feedback Submission Flow

The tests validate the complete feedback submission flow:

1. **User opens copilot** - Widget renders and is interactive
2. **Switches to bug report mode** - UI changes to report issue mode
3. **Submits description** - Optional screenshot attachment
4. **Form validation** - Validates required fields
5. **API submission** - FormData sent to `/api/feedback` endpoint
6. **GitHub integration** - Backend creates issue, uploads screenshot
7. **Success response** - User sees confirmation with issue number

## API Endpoint Details

### POST `/api/feedback`

**Request:**
```
Content-Type: multipart/form-data

Fields:
- description (required): Bug report text
- screenshot (optional): Image file
```

**Success Response (200):**
```json
{
  "success": true,
  "issueNumber": 29,
  "url": "https://github.com/owner/repo/issues/29"
}
```

**Error Response (400/500):**
```json
{
  "error": "Description is required",
  "message": "Optional error details"
}
```

## Implementation Notes

### Testability Improvements
- Added `data-testid` attributes to key components
- Tests use semantic selectors (aria-labels, placeholders)
- Tests handle optional UI elements gracefully
- API tests account for server being unavailable in test environment

### Error Scenarios Tested
- Missing description field
- Empty/whitespace descriptions
- Network failures
- Malformed multipart data
- Very long descriptions
- Missing screenshots (optional)

### Known Limitations
- GitHub issue creation requires valid credentials and can't be tested without server running
- Screenshot upload testing validates UI only; actual GitHub storage requires integration tests
- Tests skip if development server is not running

## Future Enhancements

1. **Integration Tests**: Add tests with actual GitHub API (using test token)
2. **Visual Regression**: Add visual regression tests for UI consistency
3. **Performance Tests**: Test API response times and load handling
4. **Accessibility Tests**: Enhanced accessibility testing beyond ARIA labels
5. **Mobile Testing**: Additional mobile device testing in Playwright config
6. **Screenshot Testing**: Automated screenshot comparison tests

## Debugging Failed Tests

1. **Check server is running**: `npm run dev`
2. **Review Playwright report**: `npx playwright show-report`
3. **Run with UI mode**: `npx playwright test --ui`
4. **Check browser logs**: Playwright captures console errors
5. **Verify test selectors**: Use browser developer tools to find elements

## CI/CD Integration

Tests are configured to run in CI environments:
- Retries: 2 attempts on failure
- Workers: 1 worker (serial execution)
- Artifacts: HTML report and traces on failure
- Screenshots: Captured on failure only
