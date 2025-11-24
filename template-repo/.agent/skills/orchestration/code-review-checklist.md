# Skill: Code Review Checklist

## Purpose
To ensure all code meets the project's high standards for quality, security, and maintainability.

## Checklist

### General
- [ ] **Logic**: Does the code actually solve the problem?
- [ ] **Readability**: Is the code easy to understand? Are variable names descriptive?
- [ ] **Complexity**: Can the code be simplified?
- [ ] **Comments**: Are complex logic blocks explained? (Avoid obvious comments).

### Frontend (React/Next.js)
- [ ] **Responsiveness**: Does it look good on Mobile, Tablet, and Desktop?
- [ ] **Accessibility**: Are `aria-labels` used? Is keyboard navigation supported?
- [ ] **Performance**: Are images optimized? Is `useMemo`/`useCallback` used appropriately?
- [ ] **State Management**: Is state handled efficiently?

### Backend (Node.js/Firebase)
- [ ] **Security**: Are input validations in place? Are Firebase Rules secure?
- [ ] **Error Handling**: Are errors caught and logged properly?
- [ ] **Performance**: Are database queries optimized?
- [ ] **Secrets**: Are no secrets hardcoded?

### Visual QA
- [ ] **Design Match**: Does the implementation match the design specs/screenshots?
- [ ] **Polish**: are margins, paddings, and fonts consistent?
