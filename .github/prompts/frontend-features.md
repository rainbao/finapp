# Frontend Feature Roadmap

## Budget Visualizations
- **Charts**: Add Chart.js integration for budget vs spending visualizations
  - Pie charts showing category spending distribution
  - Progress bars for individual category budgets
  - Monthly trend lines for spending patterns
- **Dashboard widgets**: Visual budget cards with color-coded status (green/yellow/red)
- **Files to modify**: `dashboard.html`, `dashboard.js`, add new `charts.js` module
- **Pattern**: Follow existing modular JS class structure, add charts to `DashboardController`

## Monthly Views/Budgets
- **Month selector**: Add date picker for viewing specific months
- **Monthly budget setting**: Set overall monthly spending limits
- **Month-over-month comparison**: Previous month vs current month stats
- **Files to modify**: `dashboard.js`, `TransactionController.java` (new endpoints)
- **Pattern**: Extend existing date filtering logic, add monthly aggregation methods

## Savings Goals
- **Goal tracking**: Set and track progress toward savings targets
- **Visual progress**: Progress bars and milestone celebrations
- **Goal categories**: Emergency fund, vacation, major purchases
- **Files to create**: New `Goal` entity, `GoalController`, `savings.js` frontend module
- **Pattern**: Follow Transaction model structure, separate service layer

## Landing Page
- **Marketing page**: Replace current login-first flow with landing page
- **Features showcase**: Highlight app capabilities with screenshots/demos
- **Call-to-action**: Clear sign-up flow from landing to registration
- **Files to create**: `index.html` (replace current), `landing.css`, `landing.js`
- **Pattern**: Static content with smooth transitions to app authentication

## Aesthetic Overhaul
- **Design system**: Create consistent color palette and typography
- **Component library**: Standardize button, card, and form styles
- **Dark mode**: Add theme toggle with CSS custom properties
- **Mobile optimization**: Improve responsive design for phone/tablet
- **Files to modify**: `style.css` (major refactor), all HTML files for semantic updates
- **Pattern**: CSS custom properties for theming, maintain grid-based layout
