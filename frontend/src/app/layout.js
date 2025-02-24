import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body>
                {children}
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#333',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            theme: {
                                primary: '#4CAF50',
                            },
                        },
                        error: {
                            duration: 3000,
                            theme: {
                                primary: '#E53E3E',
                            },
                        },
                    }}
                />
            </body>
        </html>
    );
} 