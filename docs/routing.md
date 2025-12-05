# Routing Standards

This document defines the routing architecture and protection standards for this Next.js application.

## Route Structure

### Base Route: `/dashboard`

**All application routes MUST be accessed via the `/dashboard` prefix.**

- ✅ `/dashboard` - Main dashboard page
- ✅ `/dashboard/workout/[workoutId]` - Workout detail page
- ✅ `/dashboard/settings` - User settings
- ❌ `/workouts` - DON'T create routes outside `/dashboard`
- ❌ `/profile` - DON'T create routes outside `/dashboard`

### Root Path Behavior

The root path `/` should serve as:
- A landing/marketing page for non-authenticated users
- A redirect to `/dashboard` for authenticated users

## Route Protection

### Middleware-Based Protection

**All `/dashboard` routes and sub-routes MUST be protected using Next.js middleware.**

#### Implementation Pattern

File: `middleware.ts` (root level)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // Protects /dashboard and all sub-routes
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all dashboard routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

### Key Requirements

1. **Use `createRouteMatcher`** to define protected routes
2. **Use `await auth.protect()`** to enforce authentication
3. **Protect the pattern `/dashboard(.*)`** to cover all sub-routes
4. **Use the recommended matcher config** to exclude static files and Next.js internals

### Server-Side Verification

Even with middleware protection, **ALWAYS verify authentication server-side** when accessing protected data:

```typescript
// In Server Components or Server Actions
import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch user-specific data scoped to userId
  const data = await getUserData(userId);
  // ...
}
```

### Route Organization

```
app/
  page.tsx                          # Public landing page (/)
  layout.tsx                        # Root layout with ClerkProvider
  dashboard/
    layout.tsx                      # Dashboard layout (optional)
    page.tsx                        # Dashboard home (/dashboard)
    workout/
      [workoutId]/
        page.tsx                    # Workout detail (/dashboard/workout/:id)
    settings/
      page.tsx                      # Settings (/dashboard/settings)
```

## Best Practices

### DO:
- ✅ Use middleware for route-level protection
- ✅ Verify auth server-side in components/actions
- ✅ Keep all app routes under `/dashboard`
- ✅ Use `createRouteMatcher` for pattern matching
- ✅ Include proper matcher config to exclude static files
- ✅ Redirect authenticated users from `/` to `/dashboard`

### DON'T:
- ❌ Rely solely on client-side auth checks
- ❌ Create protected routes outside `/dashboard`
- ❌ Forget to verify `userId` before database queries
- ❌ Use overly broad middleware matchers that include static files
- ❌ Mix protected and public routes in the same path segment

## Redirect Patterns

### Authenticated User on Root

```typescript
// app/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  // Show landing page for non-authenticated users
  return <LandingPage />;
}
```

### Unauthenticated User on Protected Route

The middleware automatically handles this via `auth.protect()`, which redirects to Clerk's sign-in page.

## Error Handling

If a user attempts to access a protected route without authentication:
1. Middleware intercepts the request
2. `auth.protect()` redirects to Clerk sign-in
3. After sign-in, user is redirected back to original destination

## References

- See `/docs/auth.md` for complete authentication patterns
- See [Clerk Middleware Docs](https://clerk.com/docs/references/nextjs/clerk-middleware) for advanced configurations
