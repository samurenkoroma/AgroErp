import {Component, ErrorInfo, ReactNode} from 'react';
import {AlertTriangle} from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return {hasError: true, error};
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        // Здесь можно отправить ошибку в сервис мониторинга
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mb-4"/>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                        Что-то пошло не так
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {this.state.error?.message || 'Произошла непредвиденная ошибка'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Перезагрузить страницу
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}