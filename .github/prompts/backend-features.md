# Backend & Security Roadmap

## OAuth2.0 Integration
- **Replace JWT cookies**: Implement OAuth2 with Google/GitHub providers
- **Spring Security OAuth2**: Use `spring-boot-starter-oauth2-client` dependency
- **User entity updates**: Add `oauthProvider` and `oauthId` fields to User model
- **Files to modify**: 
  - `SecurityConfig.java` - OAuth2 login configuration
  - `User.java` - Add OAuth fields
  - `AuthController.java` - OAuth callback handling
- **Pattern**: Maintain existing Authentication parameter pattern, replace JWT filter with OAuth2

## Refresh Tokens
- **Token rotation**: Implement secure refresh token mechanism
- **Database storage**: Store refresh tokens with expiration dates
- **Files to create**: `RefreshToken` entity, `RefreshTokenService`
- **Files to modify**: `AuthController.java`, `JwtFilter.java`
- **Pattern**: Follow existing service layer pattern, add scheduled cleanup jobs

## Enhanced Filtering
- **Month/year pickers**: Better date range selection for transactions
- **Advanced filters**: Combine multiple criteria (amount range, date, category)
- **Search functionality**: Text search within transaction descriptions
- **Files to modify**: 
  - `TransactionController.java` - Enhanced query parameters
  - `TransactionService.java` - Complex query building
  - `dashboard.js` - Advanced filter UI
- **Pattern**: Extend existing query parameter pattern, use Spring Data JPA Specifications

## Clear Transactions Feature
- **Bulk operations**: Delete all transactions in a category safely
- **Confirmation flows**: Multi-step confirmation for destructive actions
- **Audit logging**: Track bulk deletion operations
- **Files to modify**: 
  - `TransactionController.java` - Add bulk delete endpoint ✅ (Already implemented)
  - `TransactionService.java` - Bulk deletion logic ✅ (Already implemented)
  - `transactions.js` - Confirmation UI ✅ (Already implemented)
- **Status**: ✅ Complete - Feature already implemented with proper error handling

## Database Optimizations
- **Indexing strategy**: Add database indexes for common queries (user_id, category, date)
- **Query optimization**: Use JPA projections for statistics queries
- **Connection pooling**: Configure HikariCP for better performance
- **Files to modify**: `application.properties`, entity classes for indexes
- **Pattern**: Maintain existing JPA pattern, add performance annotations
