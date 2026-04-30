import {useEffect, useRef, useState} from 'react';
import {AlertCircle, Building2, ChevronDown, Loader2, Plus, Settings, Users} from 'lucide-react';
import {useCreateOrganization} from "@/features/organization/mutations/useCreateOrganization.ts";
import {useOrganizations} from "@/features/organization/queries/useOrganizations.ts";
import Loading from "@/components/shared/Loading.tsx";
import Error from "@/components/shared/Error.tsx";
import {useSwitchOrganization} from "@/features/organization/mutations/useSwitchOrganization.ts";
import {useCurrentOrganization} from "@/features/organization/queries/useCurrentOrganization.ts";
import {useNavigate} from "react-router-dom";


export const OrganizationSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');
    const [createError, setCreateError] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const {mutateAsync} = useCreateOrganization();
    const {mutate: switchOrg} = useSwitchOrganization();
    const {data: organizations, isLoading, error} = useOrganizations();
    const {organization: currentOrganization} = useCurrentOrganization();
    const navigate = useNavigate();
    // Закрываем dropdown при клике вне
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsCreating(false);
                setNewOrgName('');
                setCreateError('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitchOrganization = async (orgId: string) => {
        switchOrg(orgId);
        setIsOpen(false);
        navigate('/dashboard');
    };

    const handleCreateOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOrgName.trim()) {
            setCreateError('Введите название организации');
            return;
        }

        setCreateError('');
        await mutateAsync({name: newOrgName});
        setIsCreating(false);
        setNewOrgName('');
        setCreateError('');
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'owner':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'admin':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'agronomist':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'viewer':
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (isLoading) return (<Loading text="Загрузка теплицы..."/>);
    if (error) return (<Error text="Теплица не найдена"/>);


    return (
        <div className="relative" ref={dropdownRef}>
            {/* Кнопка-триггер */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
            >
                <div
                    className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white"/>
                </div>
                <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentOrganization?.name || 'Выберите ферму'}
                    </p>
                    {currentOrganization && (
                        <p className="text-xs text-gray-500">
                            {currentOrganization.role}
                        </p>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
            </button>

            {/* Выпадающее меню */}
            {isOpen && organizations && (
                <div
                    className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    {/* Список организаций */}
                    <div className="max-h-64 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400"/>
                            </div>
                        ) : organizations.length === 0 ? (
                            <div className="text-center py-6 px-4">
                                <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2"/>
                                <p className="text-sm text-gray-500">Нет организаций</p>
                                <p className="text-xs text-gray-400 mt-1">Создайте свою ферму</p>
                            </div>
                        ) : (
                            organizations.map((org) => (
                                <button
                                    key={org.id}
                                    onClick={() => handleSwitchOrganization(org.id)}
                                    className={`w-full px-4 py-3 flex items-center justify-between ${currentOrganization?.id === org.id ? 'bg-green-100 dark:bg-green-400  ' : ' hover:bg-gray-50 dark:hover:bg-gray-800'}  transition-colors text-left`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className="font-medium text-gray-900 dark:text-white">{org.name}</span>
                                            <span
                                                className={`text-xs px-1.5 py-0.5 rounded-full ${getRoleColor(org.role)}`}>{org.role}</span>
                                        </div>
                                        {org.name && (
                                            <p className="text-xs text-gray-500 mt-0.5">{org.name}</p>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Разделитель */}
                    {organizations.length > 0 && <div className="border-t border-gray-200 dark:border-gray-700"/>}

                    {/* Создание новой организации */}
                    {isCreating ? (
                        <div className="p-3">
                            <form onSubmit={handleCreateOrganization}>
                                <input
                                    type="text"
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    placeholder="Название фермы"
                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                                    autoFocus
                                />
                                {createError && (
                                    <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3"/>
                                        {createError}
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                                    >
                                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin"/> :
                                            <Plus className="w-3 h-3"/>}
                                        Создать
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCreating(false);
                                            setNewOrgName('');
                                            setCreateError('');
                                        }}
                                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                            <div
                                className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <Plus className="w-3 h-3 text-gray-500"/>
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Создать новую ферму</span>
                        </button>
                    )}

                    {/* Разделитель */}
                    <div className="border-t border-gray-200 dark:border-gray-700"/>

                    {/* Дополнительные пункты */}
                    <button
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                        <Settings className="w-4 h-4 text-gray-500"/>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Настройки фермы</span>
                    </button>

                    <button
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                        <Users className="w-4 h-4 text-gray-500"/>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Управление пользователями</span>
                    </button>

                    {/*{user?.role === 'admin' && (*/}
                    {/*    <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">*/}
                    {/*        <ExternalLink className="w-4 h-4 text-gray-500" />*/}
                    {/*        <span className="text-sm text-gray-700 dark:text-gray-300">Пригласить пользователя</span>*/}
                    {/*    </button>*/}
                    {/*)}*/}
                </div>
            )}
        </div>
    );
};