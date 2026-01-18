# Feature Implementation Guidelines

## Development Priorities
1. **Quick Wins**: Budget visualizations, monthly views (extend existing patterns)
2. **Medium Effort**: Savings goals, enhanced filtering (new modules, follow existing architecture)
3. **Major Changes**: OAuth2.0, aesthetic overhaul (significant refactoring required)

## Architecture Consistency
- **Backend**: Maintain controller → service → repository pattern
- **Frontend**: Continue class-based modules with global instances (`window.featureManager`)
- **Authentication**: Preserve `Authentication` parameter pattern in all endpoints
- **Database**: Keep UUID primary keys, BigDecimal for money, OffsetDateTime for dates

## Implementation Patterns to Follow

### Adding New Features
1. **Backend**: Create entity → repository → service → controller → tests
2. **Frontend**: Create JS class → initialize in DOM ready → add to global scope
3. **Integration**: Update `ApiClient` with new endpoints, maintain cookie authentication

### UI/UX Consistency
- **Follow existing patterns**: Category sections, action buttons, modal dialogs
- **Maintain responsive grid**: Use existing CSS grid system
- **Error handling**: Consistent error messages and user feedback
- **Accessibility**: Maintain semantic HTML structure

### Database Changes
- **Migration strategy**: Use Hibernate `ddl-auto=update` for development
- **Environment variables**: Add new config to `start-app.bat`
- **Data integrity**: Maintain foreign key relationships with User entity

## Code Quality Standards
- **Error boundaries**: Wrap all async operations in try-catch
- **User feedback**: Provide clear success/error messages for all actions
- **Logging**: Maintain console.log pattern for debugging
- **Validation**: Server-side validation with client-side feedback

## Testing Strategy
- **Manual testing**: Use `/debug.html` for API testing
- **Browser testing**: Test across different browsers and screen sizes
- **Database testing**: Verify data integrity after schema changes
- **Authentication testing**: Ensure cookie handling works correctly
