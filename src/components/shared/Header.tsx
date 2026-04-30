import {Bell, ChevronDown, Moon, Search, Sun} from 'lucide-react';
import {useTheme} from 'next-themes';
import {useEffect, useState} from 'react';
import {OrganizationSwitcher} from "@/features/organization/ui/OrganizationSwitcher.tsx";

export function Header() {
    const {theme, setTheme} = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header
            className="h-16 bg-card border-b border-border flex items-center justify-between px-8 text-card-foreground transition-colors duration-200 z-20 relative">
            <div className="flex-1 max-w-2xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                    <input
                        type="text"
                        placeholder="Поиск объектов, культур, инвентаря..."
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 ml-6">
                <div className="px-3 py-4 border-gray-200 dark:border-gray-800 w-[300px]">
                    <OrganizationSwitcher/>
                </div>
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
                        title="Переключить тему"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                    </button>
                )}


                <button
                    className="relative p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors">
                    <Bell className="w-5 h-5"/>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                </button>



                <div
                    className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-lg cursor-pointer transition-colors">
                    <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-foreground">ИП</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-foreground">Иван Петров</p>
                        {/*<p className="text-xs text-muted-foreground">{user?.role}</p>*/}
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground"/>
                </div>
            </div>
        </header>
    );
}