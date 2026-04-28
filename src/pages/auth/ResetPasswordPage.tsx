// pages/auth/ResetPasswordPage.tsx
import {useState} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';
import {useAuthStore} from '@/stores/authStore';
import {Lock, Eye, EyeOff, CheckCircle, Sprout, ArrowLeft, AlertCircle} from 'lucide-react';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const {token} = useParams();
    const {resetPassword, isLoading, error} = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const validatePassword = () => {
        if (password !== confirmPassword) {
            setPasswordError('Пароли не совпадают');
            return false;
        }
        if (password.length < 6) {
            setPasswordError('Пароль должен содержать минимум 6 символов');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePassword() || !token) return;

        try {
            await resetPassword(token, password);
            setSubmitted(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            // Ошибка уже в store
        }
    };

    if (submitted) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                        <div
                            className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600"/>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Пароль успешно изменен!
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Перенаправляем на страницу входа...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl shadow-lg mb-4">
                        <Sprout className="w-8 h-8 text-white"/>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Создание нового пароля
                    </h1>
                </div>

                <div
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Новый пароль
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Подтверждение пароля
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                </button>
                            </div>
                            {passwordError && (
                                <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                            )}
                        </div>

                        {error && (
                            <div
                                className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0"/>
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !!passwordError}
                            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Сохранение...' : 'Сохранить пароль'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login"
                              className="text-sm text-green-600 hover:text-green-700 flex items-center justify-center gap-1">
                            <ArrowLeft className="w-4 h-4"/>
                            Вернуться к входу
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;