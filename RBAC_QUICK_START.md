# Quick RBAC Integration Guide

## ✅ What's Already Done

1. **Backend RBAC** - Updated role system and dependencies in FastAPI
2. **Frontend Hooks** - Created `useRBAC()` hook
3. **Components** - Created `RoleGuard` and `ProtectedRoute`

---

## 🚀 How to Use NOW

### Example 1: Wrap AdminDashboard with RoleGuard

Add this to the TOP of `AdminDashboard.tsx`:

```tsx
import { RoleGuard } from '@/components/RoleGuard';
```

Then wrap the return content:

```tsx
export default function AdminDashboard() {
  // ... existing code ...

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout title="Admin / HQ Dashboard">
        {/* ... rest of your content ... */}
