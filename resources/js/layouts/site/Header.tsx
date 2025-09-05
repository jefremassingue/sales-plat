import { useCart } from '@/contexts/CartContext';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUp,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Mail,
    Map,
    Menu,
    MessageCircle,
    Phone,
    Search,
    ShoppingCart,
    User,
    X,
    Home,
    PackageSearch,
    LayoutGrid,
    BookOpen,
    Newspaper,
    Info,
    LogIn,
    UserPlus,
    LogOut,
    ShoppingBag,
    FileText,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

interface Category {
    id: number;
    name: string;
    href: string;
    subcategories?: Category[];
}

type AppPageProps = InertiaPageProps & {
    categories: Category[] | null;
    auth: {
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
    };
    [key: string]: unknown;
};

// --- Shared Data (Navigation Links) ---
type NavLink = {
    name: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
};

const navLinks: NavLink[] = [
    { name: 'Início', href: '/', icon: Home },
    { name: 'Produtos', href: '/products', icon: PackageSearch },
    { name: 'Catálogos', href: '/catalogs', icon: BookOpen },
    { name: 'Categorias', href: '/products', icon: LayoutGrid }, // Note: href points to /products, not a categories page
    { name: 'Blog', href: '/blog', icon: Newspaper },
    { name: 'Contato', href: '/contact', icon: Phone },
    { name: 'Sobre', href: '/about', icon: Info },
];

// --- Sub-Component: TopBar ---
const TopBar = () => {
    return (
        <div className="bg-orange-600 py-2 text-xs text-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0">
                    {/* ── CONTACTO & EMAIL (sempre visível) */}
                    <div className="order-1 flex flex-col items-center gap-2 sm:flex-row sm:gap-6 md:order-2">
                        <a href="tel:+258871154336" className="flex items-center transition-colors hover:text-orange-100">
                            <Phone size={16} className="mr-1.5" strokeWidth={1.5} />
                            <span className="hidden sm:inline">+258 87 115 4336</span>
                            <span className="sm:hidden">87 115 4336</span>
                        </a>
                        <a href="mailto:geral@matonyservicos.com" className="flex items-center transition-colors hover:text-orange-100">
                            <Mail size={16} className="mr-1.5" strokeWidth={1.5} />
                            <span className="">geral@matonyservicos.com</span>
                        </a>
                    </div>

                    {/* ── ENDEREÇO & MENSAGEM (oculto no mobile) */}
                    <div className="order-2 hidden flex-col items-center gap-2 text-center sm:flex-row sm:text-left md:order-1 md:flex">
                        <div className="flex items-center gap-2">
                            <Map className="h-4" />
                            <span className="hidden sm:inline">Av. Ahmed sekou toure n° 3007</span>
                            <span className="sm:hidden">Av. A. S. toure n° 3007</span>
                        </div>
                        <div className="hidden sm:block">|</div>
                        <Link href="/products" className="text-center font-semibold hover:underline sm:text-left" prefetch>
                            Garanta a sua segurança e da sua equipa!
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Component: SearchBar ---
const SearchBar = () => {
    // get search term from URL
    const { search } = usePage<AppPageProps>().props as { search?: string };

    const [searchTerm, setSearchTerm] = useState(search || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.get(
                '/products',
                { search: searchTerm },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-lg lg:max-w-md xl:max-w-lg">
            <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produtos, marcas e categorias..."
                className="w-full rounded-full border border-gray-200 py-2.5 pr-12 pl-4 text-sm font-medium text-zinc-700 transition-colors duration-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
            />
            <button
                type="submit"
                className="absolute top-0 right-0 flex h-full items-center justify-center px-4 text-gray-500 transition-colors duration-200 hover:text-orange-600"
                aria-label="Buscar"
            >
                <Search size={20} strokeWidth={2} />
            </button>
        </form>
    );
};

// --- Sub-Component: MainHeader ---
interface MainHeaderProps {
    onMobileMenuToggle: () => void;
    isMobileMenuOpen: boolean;
    cartItemCount: number;
}

const MainHeader = ({ onMobileMenuToggle, isMobileMenuOpen, cartItemCount = 0 }: MainHeaderProps) => {
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const { auth } = usePage<AppPageProps>().props;

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="border-b border-gray-100 bg-white">
            <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-orange-600 sm:text-3xl" prefetch>
                        <img src="/logo.svg" className="h-12" alt="Matony Serviços" />
                    </Link>

                    <div className="mx-4 hidden max-w-xl flex-grow lg:block">
                        <SearchBar />
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                                onBlur={() => setTimeout(() => setIsAccountDropdownOpen(false), 150)}
                                className="p-2 text-gray-600 transition-colors hover:text-orange-600 focus:text-orange-600 focus:outline-none"
                                aria-label="Menu da conta"
                            >
                                <User size={24} strokeWidth={1.5} />
                            </button>
                            {isAccountDropdownOpen && (
                                <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-gray-100 bg-white py-1 shadow-lg">
                                    {auth.user ? (
                                        <>
                                            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                                <p className="font-medium">{auth.user.name}</p>
                                                <p className="text-gray-500 text-xs">{auth.user.email}</p>
                                            </div>
                                            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600" prefetch>
                                                Meu Perfil
                                            </Link>
                                            <Link href="/profile#sales" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600" prefetch>
                                                Minhas Compras
                                            </Link>
                                            <Link href="/profile#quotations" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600" prefetch>
                                                Minhas Cotações
                                            </Link>
                                            <div className="border-t border-gray-100 mt-1 pt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600"
                                                >
                                                    Sair
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600" prefetch>
                                                Entrar
                                            </Link>
                                            <Link href="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600" prefetch>
                                                Registrar
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* <Link href="/wishlist" className="p-2 text-gray-600 hover:text-orange-600 transition-colors" aria-label="Lista de desejos">
                            <Heart size={24} strokeWidth={1.5} />
                        </Link> */}
                        <button
                            onClick={() => setShowSearchBar((value) => !value)}
                            className="p-2 text-gray-600 transition-colors hover:text-orange-600 lg:hidden"
                            aria-label="Search"
                        >
                            <Search size={24} strokeWidth={1.5} />
                        </button>

                        <Link
                            href="/cart"
                            className="relative p-2 text-gray-600 transition-colors hover:text-orange-600"
                            aria-label="Carrinho de compras"
                            prefetch
                        >
                            <ShoppingCart size={24} strokeWidth={1.5} />
                            {cartItemCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-orange-600 px-1.5 py-0.5 text-xs leading-none font-bold text-white">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={onMobileMenuToggle}
                            className="p-2 text-gray-600 transition-colors hover:text-orange-600 focus:text-orange-600 focus:outline-none lg:hidden"
                            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                        >
                            {isMobileMenuOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
                        </button>
                    </div>
                </div>

                {showSearchBar && (
                    <div className="mt-4 w-full flex justify-center lg:hidden">
                        <SearchBar />
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-Component: NavigationBar (Desktop) ---
const NavigationBar = () => {
    const { categories } = usePage<AppPageProps>().props;
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const navRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = (index: number) => {
        if (categories?.[index]) {
            setOpenDropdown(index);
        }
    };

    const handleMouseLeave = () => {
        setOpenDropdown(null);
    };

    return (
        <nav ref={navRef} className="hidden border-b border-gray-100 bg-gray-50 lg:block">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ul className="flex h-12 items-center justify-center space-x-6">
                    {navLinks.map((link, index) =>
                        link.name === 'Categorias' && categories && categories.length > 0 ? (
                            <li
                                key={`nav-categories-${index}`}
                                className="group relative"
                                onMouseEnter={() => handleMouseEnter(0)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="flex items-center gap-2 py-3 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-orange-600">
                                    <LayoutGrid size={16} className="text-gray-500 group-hover:text-orange-600" strokeWidth={2} />
                                    <span>Categorias</span>
                                    <ChevronDown
                                        size={16}
                                        className="ml-1 text-gray-500 transition-transform duration-200 group-hover:rotate-180 group-hover:text-orange-600"
                                        strokeWidth={2}
                                    />
                                </button>
                                {openDropdown === 0 && (
                                    <div
                                        className="ring-opacity-5 absolute left-1/2 z-10 mt-0 w-[1000px] origin-top -translate-x-1/2 transform rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none"
                                        onMouseEnter={() => handleMouseEnter(0)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div className="px-6 py-6">
                                            <table className="w-full table-fixed border-collapse">
                                                <tbody>
                                                    {Array.from({ length: Math.ceil(categories.slice(0, 8).length / 4) }).map((_, rowIndex) => (
                                                        <tr key={`row-${rowIndex}`} className="align-top">
                                                            {Array.from({ length: 4 }).map((_, colIndex) => {
                                                                const categoryIndex = rowIndex * 4 + colIndex;
                                                                const category = categories[categoryIndex];

                                                                if (!category) return <td key={`empty-${colIndex}`} className="w-1/4 p-3"></td>;

                                                                return (
                                                                    <td key={`cat-${category.id}`} className="w-1/4 p-3">
                                                                        <div className="mb-3">
                                                                            <Link
                                                                                href={category.href}
                                                                                className="block pb-2 text-base font-medium text-gray-900 hover:text-orange-600"
                                                                                prefetch
                                                                            >
                                                                                {category.name}
                                                                            </Link>
                                                                        </div>
                                                                        <ul className="space-y-2">
                                                                            {category.subcategories?.map((subItem: Category) => (
                                                                                <li key={`${category.id}-${subItem.id}`}>
                                                                                    <Link
                                                                                        href={subItem.href}
                                                                                        className="block text-sm text-gray-600 hover:text-orange-600"
                                                                                        prefetch
                                                                                    >
                                                                                        {subItem.name}
                                                                                    </Link>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="rounded-b-md border-t border-gray-100 bg-gray-50 px-4 py-3 text-center">
                                            <Link
                                                href="/products"
                                                className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
                                                prefetch
                                            >
                                                Ver todas as categorias
                                                <ChevronDown size={16} className="ml-1 rotate-90" strokeWidth={2} />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ) : (
                <li key={`nav-link-${index}`}>
                                <Link
                    href={link.href}
                    className="flex items-center gap-2 py-3 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-orange-600"
                                    prefetch
                                >
                    <link.icon size={16} className="text-gray-500" strokeWidth={2} />
                    <span>{link.name}</span>
                                </Link>
                            </li>
                        ),
                    )}
                </ul>
            </div>
        </nav>
    );
};

// --- Sub-Component: MobileMenu ---
interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
    const { categories, auth } = usePage<AppPageProps>().props;
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

    const toggleDropdown = (index: number) => {
        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
    };

    const handleLogout = () => {
        // Logout e fecha o menu
        router.post(route('logout'));
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            setOpenDropdownIndex(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden" onClick={onClose}>
            <div
                className={`fixed top-0 left-0 z-50 h-full w-4/5 max-w-sm transform bg-white shadow-xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-gray-100 p-5">
                    <Link href="/" className="text-2xl font-bold text-orange-600" onClick={onClose} prefetch>
                        <img src="/logo.svg" className="h-12" alt="Matony Serviços" />
                    </Link>
                    <button onClick={onClose} className="p-1 text-gray-600 hover:text-orange-600" aria-label="Fechar menu">
                        <X size={28} strokeWidth={1.5} />
                    </button>
                </div>
                <nav className="h-[calc(100vh-65px)] overflow-y-auto py-4">
                    <ul>
                        {navLinks.map((link, index) =>
                            link.name === 'Categorias' && categories && categories.length > 0 ? (
                                <li key={`mobile-categories-${index}`} className="border-b border-gray-100">
                                    <button
                                        onClick={() => toggleDropdown(0)}
                                        className="flex w-full items-center justify-between px-5 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600"
                                    >
                                        <span className="flex items-center gap-2">
                                            <LayoutGrid size={18} />
                                            Categorias
                                        </span>
                                        {openDropdownIndex === 0 ? (
                                            <ChevronUp size={20} strokeWidth={2} />
                                        ) : (
                                            <ChevronDown size={20} strokeWidth={2} />
                                        )}
                                    </button>
                                    {openDropdownIndex === 0 && (
                                        <ul className="bg-gray-50 pl-8">
                                            {categories.map((category: Category) => (
                                                <li key={`mobile-cat-${category.id}`} className="border-t border-gray-100 first:border-t-0">
                                                    <Link
                                                        href={category.href}
                                                        className="flex items-center justify-between px-5 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-orange-600"
                                                        onClick={onClose}
                                                        prefetch
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <LayoutGrid size={16} />
                                                            {category.name}
                                                        </span>
                                                        <ChevronRight size={16} className="text-gray-400" />
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ) : (
                                <li key={`mobile-link-${index}`} className="border-b border-gray-100">
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-3 px-5 py-3 text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600"
                                        onClick={onClose}
                                        prefetch
                                    >
                                        <link.icon size={18} />
                                        <span>{link.name}</span>
                                    </Link>
                                </li>
                            ),
                        )}
                    </ul>

                    {/* Conta / Autenticação */}
                    <div className="mt-2 border-t border-gray-100 pt-2">
                        {auth?.user ? (
                            <>
                                <div className="flex items-center gap-2 px-5 py-2 text-xs text-gray-500">
                                    <User size={14} />
                                    <span>
                                        Conectado como <span className="font-medium">{auth.user.name}</span>
                                    </span>
                                </div>
                                <ul>
                                    <li className="border-b border-gray-100">
                                        <Link href="/profile" className="flex items-center gap-3 px-5 py-3 text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600" onClick={onClose} prefetch>
                                            <User size={18} />
                                            <span>Meu Perfil</span>
                                        </Link>
                                    </li>
                                    <li className="border-b border-gray-100">
                                        <Link href="/profile#sales" className="flex items-center gap-3 px-5 py-3 text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600" onClick={onClose} prefetch>
                                            <ShoppingBag size={18} />
                                            <span>Minhas Compras</span>
                                        </Link>
                                    </li>
                                    <li className="border-b border-gray-100">
                                        <Link href="/profile#quotations" className="flex items-center gap-3 px-5 py-3 text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600" onClick={onClose} prefetch>
                                            <FileText size={18} />
                                            <span>Minhas Cotações</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-5 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600">
                                            <LogOut size={18} />
                                            <span>Sair</span>
                                        </button>
                                    </li>
                                </ul>
                            </>
                        ) : (
                            <ul>
                                <li className="border-b border-gray-100">
                                    <Link href="/login" className="flex items-center gap-3 px-5 py-3 text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600" onClick={onClose} prefetch>
                                        <LogIn size={18} />
                                        <span>Entrar</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/register" className="flex items-center gap-3 px-5 py-3 text-gray-700 transition-colors hover:bg-gray-50 hover:text-orange-600" onClick={onClose} prefetch>
                                        <UserPlus size={18} />
                                        <span>Registrar</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>
            </div>
        </div>
    );
};

// --- Main Header Component ---
const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { itemCount } = useCart();
    const [showTopBar, setShowTopBar] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const lastScrollY = useRef(0);
    const scrollDirection = useRef<'up' | 'down' | 'none'>('none');
    const scrollThreshold = 20;
    const scrollLock = useRef(false);

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024 && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileMenuOpen]);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollLock.current) return;

            const currentScrollY = window.scrollY;
            setShowScrollTop(currentScrollY > 300);

            if (Math.abs(currentScrollY - lastScrollY.current) > scrollThreshold || currentScrollY === 0) {
                scrollLock.current = true;

                if (currentScrollY === 0) {
                    setShowTopBar(true);
                    scrollDirection.current = 'none';
                } else {
                    const newDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';

                    if (newDirection !== scrollDirection.current) {
                        scrollDirection.current = newDirection;
                        if (newDirection === 'down') {
                            setShowTopBar(false);
                            setTimeout(() => {
                                scrollLock.current = false;
                            }, 50);
                            return;
                        } else {
                            if (currentScrollY <= 50) {
                                setTimeout(() => {
                                    setShowTopBar(true);
                                    scrollLock.current = false;
                                }, 50);
                                return;
                            }
                        }
                    }
                }

                lastScrollY.current = currentScrollY;
                scrollLock.current = false;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-30 bg-white shadow-sm">
                <div
                    className="overflow-hidden transition-all duration-300 ease-out"
                    style={{
                        maxHeight: showTopBar ? '50px' : '0',
                        opacity: showTopBar ? 1 : 0,
                    }}
                >
                    <TopBar />
                </div>

                <MainHeader onMobileMenuToggle={handleMobileMenuToggle} isMobileMenuOpen={isMobileMenuOpen} cartItemCount={itemCount} />

                <div className="transition-all duration-300 ease-out">
                    <NavigationBar />
                </div>

                <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            </header>

            <a
                href="https://wa.me/258871154336"
                target="_blank"
                rel="noopener noreferrer"
                className={`fixed ${showScrollTop ? 'bottom-20' : 'bottom-4'} right-4 z-50 flex items-center justify-center rounded-full bg-green-500 p-3 text-white shadow-lg transition-all duration-300 hover:bg-green-600`}
                aria-label="Contato via WhatsApp"
            >
                <MessageCircle size={28} strokeWidth={2} />
            </a>

            <button
                onClick={scrollToTop}
                className={`fixed right-4 bottom-4 z-50 flex items-center justify-center rounded-full bg-orange-600 p-3 text-white shadow-lg transition-all duration-300 hover:bg-orange-700 ${showScrollTop ? 'visible opacity-100' : 'invisible opacity-0'}`}
                aria-label="Voltar ao topo"
            >
                <ArrowUp size={28} strokeWidth={2} />
            </button>
        </>
    );
};

export default Header;
