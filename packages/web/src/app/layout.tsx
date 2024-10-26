import React from 'react';
import { Providers } from './providers';
import DashboardLayout from '@/components/common/DashboardLayout';
import './globals.css';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <Providers>
                    <DashboardLayout>{children}</DashboardLayout>
                </Providers>
            </body>
        </html>
    );
}
