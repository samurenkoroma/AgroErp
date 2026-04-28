import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from 'next-themes';
import {ErrorBoundary} from './components/shared/ErrorBoundary';
import App from './App';
import "./styles/index.css";


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >

                    <App/>
            </ThemeProvider>
        </ErrorBoundary>
    </React.StrictMode>
);