/**
 * Application layouts
 */

export { ClientLayout } from './ClientLayout';
export { DashboardLayout } from './DashboardLayout';

/**
 * Example Usage:
 * ```typescript
 * // In app/(pages)/layout.tsx
 * import { DashboardLayout } from '../layouts';
 * 
 * export default function PagesLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <DashboardLayout>
 *       {children}
 *     </DashboardLayout>
 *   );
 * }
 * 
 * // In app/(auth)/layout.tsx
 * import { ClientLayout } from '../layouts';
 * 
 * export default function AuthLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <ClientLayout>
 *       {children}
 *     </ClientLayout>
 *   );
 * }
 * ```
 */
