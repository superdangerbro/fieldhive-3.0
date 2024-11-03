export interface User {
    id: string;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    preferences: {
        dashboardLayout?: string;
        theme?: 'light' | 'dark';
    };
}
