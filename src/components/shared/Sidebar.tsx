import {Calendar1Icon, HomeIcon, MapPin, Sprout, Wheat} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';
import {ElementType, useEffect, useRef, useState} from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import {Inventory} from "@mui/icons-material";

interface MenuItem {
    id: string;
    label: string;
    icon: ElementType;
    path: string;
    subItems?: SubMenuItem[];
}

interface SubMenuItem {
    id: string;
    label: string;
    path: string;
}

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [submenuPosition, setSubmenuPosition] = useState({top: 0});
    const itemRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

    const menuItems: MenuItem[] = [
        {id: 'dashboard', label: 'Главная', icon: HomeIcon, path: '/dashboard'},
        {id: 'crops-list', label: 'Все культуры', icon: Wheat, path: '/crops'},
        {id: 'seasons', label: 'Сезоны', icon: Calendar1Icon, path: '/seasons'},
        {id: 'seasons1', label: 'Сезоны', icon: Calendar1Icon, path: '/seasons1'},
        {id: 'farm', label: 'Ферма', icon: MapPin, path: '/farm'},
        {id: 'inventory', label: 'Инвентарь', icon: Inventory, path: '/inventory'},
        {id: 'growing', label: 'Посевы', icon: Sprout, path: '/growing'},
    ];


    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname === '/dashboard';
        }
        return location.pathname == path;
    };

    const handleMenuClick = (item: MenuItem) => {
        if (!item.subItems) {
            navigate(item.path);
        }
    };

    const handleSubItemClick = (path: string) => {
        navigate(path);
        setHoveredItem(null);
    };

    const handleMouseEnter = (itemId: string) => {
        const itemElement = itemRefs.current[itemId];
        if (itemElement) {
            const rect = itemElement.getBoundingClientRect();
            // Позиционируем подменю напротив кнопки, выравнивая по верхнему краю кнопки
            setSubmenuPosition({top: rect.top});
        }
        setHoveredItem(itemId);
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    // Закрыть подменю при клике вне
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (hoveredItem) {
                const target = event.target as HTMLElement;
                if (!target.closest('.submenu-container') && !target.closest('.menu-item')) {
                    setHoveredItem(null);
                }
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [hoveredItem]);

    return (
        <Tooltip.Provider delayDuration={300}>
            <aside className="group w-16 bg-card border-r border-border flex flex-col z-30">
                {/* Logo */}
                <div className="p-4 h-16 border-b border-border flex items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 shrink-0 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                            <Wheat className="w-5 h-5 text-primary-foreground"/>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
                    <ul className="space-y-2 px-2">
                        {menuItems.map((item) => (
                            <li
                                key={item.id}
                                className="relative group/item"
                                ref={(el) => (itemRefs.current[item.id] = el)}
                                onMouseEnter={() => item.subItems && handleMouseEnter(item.id)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <button
                                            onClick={() => handleMenuClick(item)}
                                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200
                        ${isActive(item.path)
                                                ? 'bg-secondary text-primary font-semibold shadow-sm'
                                                : 'text-muted-foreground hover:bg-accent hover:text-foreground font-medium'
                                            }`}
                                        >
                                            <item.icon
                                                className={`w-6 h-6 ${isActive(item.path) ? 'text-primary' : 'text-muted-foreground group-hover/item:text-foreground'}`}/>
                                            {item.subItems && (
                                                <div
                                                    className={`absolute right-2 top-2/3 -translate-y-1/2 transition-transform duration-200 text-xs ${hoveredItem === item.id ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </div>
                                            )}
                                        </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        {
                                            !item.subItems && (
                                                <Tooltip.Content
                                                    side="right"
                                                    className="bg-gray-900 text-white px-2 py-1 rounded text-sm z-[100] "
                                                    sideOffset={5}
                                                >
                                                    {item.label}
                                                    <Tooltip.Arrow className="fill-gray-900"/>
                                                </Tooltip.Content>
                                            )
                                        }

                                    </Tooltip.Portal>
                                </Tooltip.Root>

                                {/* Submenu - появляется при наведении */}
                                {item.subItems && hoveredItem === item.id && (
                                    <div
                                        className="submenu-container fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[200px] z-[200]"
                                        style={{
                                            left: '3.5rem',
                                            top: `${submenuPosition.top}px`,
                                        }}
                                    >
                                        <div className="py-2">
                                            {item.subItems.map((subItem) => (
                                                <button
                                                    key={subItem.id}
                                                    onClick={() => handleSubItemClick(subItem.path)}
                                                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700
                            ${location.pathname === subItem.path
                                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {subItem.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </Tooltip.Provider>
    );
}