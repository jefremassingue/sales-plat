import React, { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    Phone,
    Mail,
    Search,
    User,
    Heart,
    ShoppingCart,
    Menu,
    X,
    ChevronDown,
    ChevronUp,
    ArrowUp,
    MessageCircle,
    Map,
    ShoppingBag
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useCart } from '@/contexts/CartContext';

interface Category {
    id: number;
    name: string;
    href: string;
    subcategories?: Category[];
}

interface PageProps {
    categories: Category[] | null;
    [key: string]: unknown;
}

// --- Shared Data (Navigation Links) ---
const navLinks = [
    { name: 'Início', href: '/' },
    { name: 'Produtos', href: '/products' },
    { name: 'Categorias', href: '/products' }, // Note: href points to /products, not a categories page
    { name: 'Blog', href: '/blog' },
    { name: 'Contato', href: '/contact' },
    { name: 'Sobre', href: '/about' },
];

// --- Sub-Component: TopBar ---
const TopBar = () => {
    return (
        <div className="bg-orange-600 text-white text-xs py-2">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">

                    {/* ── CONTACTO & EMAIL (sempre visível) */}
                    <div className="order-1 md:order-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
                        <a
                            href="tel:+258871154336"
                            className="flex items-center hover:text-orange-100 transition-colors"
                        >
                            <Phone size={16} className="mr-1.5" strokeWidth={1.5} />
                            <span className="hidden sm:inline">+258 87 115 4336</span>
                            <span className="sm:hidden">87 115 4336</span>
                        </a>
                        <a
                            href="mailto:geral@matonyservicos.com"
                            className="flex items-center hover:text-orange-100 transition-colors"
                        >
                            <Mail size={16} className="mr-1.5" strokeWidth={1.5} />
                            <span className="">geral@matonyservicos.com</span>
                        </a>
                    </div>

                    {/* ── ENDEREÇO & MENSAGEM (oculto no mobile) */}
                    <div className="order-2 md:order-1 hidden md:flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                        <div className="flex items-center gap-2">
                            <Map className="h-4" />
                            <span className="hidden sm:inline">Av. Ahmed sekou toure n° 3007</span>
                            <span className="sm:hidden">Av. A. S. toure n° 3007</span>
                        </div>
                        <div className="hidden sm:block">|</div>
                        <Link
                            href="/products"
                            className="font-semibold hover:underline text-center sm:text-left"
                        >
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
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.get('/search', { q: searchTerm }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-lg lg:max-w-md xl:max-w-lg">
            <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produtos, marcas e categorias..."
                className="w-full py-2.5 pl-4 text-zinc-700 font-medium pr-12 text-sm border border-gray-200 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors duration-200"
            />
            <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 text-gray-500 hover:text-orange-600 transition-colors duration-200 flex items-center justify-center"
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

    return (
        <div className="bg-white border-b border-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <Link href="/" className="text-2xl sm:text-3xl font-bold text-orange-600">
                        <img src="/logo.svg" className="h-12" alt="Matony Serviços" />
                    </Link>

                    <div className="hidden lg:block flex-grow max-w-xl mx-4">
                        <SearchBar />
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                                onBlur={() => setTimeout(() => setIsAccountDropdownOpen(false), 150)}
                                className="p-2 text-gray-600 hover:text-orange-600 focus:outline-none focus:text-orange-600 transition-colors"
                                aria-label="Menu da conta"
                            >
                                <User size={24} strokeWidth={1.5} />
                            </button>
                            {isAccountDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-100">
                                    <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600">
                                        Entrar
                                    </Link>
                                    <Link href="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600">
                                        Registrar
                                    </Link>
                                    <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600">
                                        Minha Conta
                                    </Link>
                                    <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600">
                                        Meus Pedidos
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Link href="/wishlist" className="p-2 text-gray-600 hover:text-orange-600 transition-colors" aria-label="Lista de desejos">
                            <Heart size={24} strokeWidth={1.5} />
                        </Link>

                        <Link href="/cart" className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors" aria-label="Carrinho de compras">
                            <ShoppingCart size={24} strokeWidth={1.5} />
                            {cartItemCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-orange-600 rounded-full">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={onMobileMenuToggle}
                            className="lg:hidden p-2 text-gray-600 hover:text-orange-600 focus:outline-none focus:text-orange-600 transition-colors"
                            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                        >
                            {isMobileMenuOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
                        </button>
                    </div>
                </div>

                <div className="mt-4 lg:hidden">
                    <SearchBar />
                </div>
            </div>
        </div>
    );
};

// --- Sub-Component: NavigationBar (Desktop) ---
const NavigationBar = () => {
    const { categories } = usePage<PageProps>().props;
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
        <nav
            ref={navRef}
            className="hidden lg:block bg-gray-50 border-b border-gray-100"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ul className="flex justify-center items-center space-x-6 h-12">
                    {navLinks.map((link, index) => (
                        link.name === 'Categorias' && categories && categories.length > 0 ? (
                            <li
                                key={`nav-categories-${index}`}
                                className="relative group"
                                onMouseEnter={() => handleMouseEnter(0)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200 py-3 flex items-center">
                                    Categorias
                                    <ChevronDown
                                        size={16}
                                        className="ml-1 text-gray-500 group-hover:text-orange-600 transition-transform duration-200 group-hover:rotate-180"
                                        strokeWidth={2}
                                    />
                                </button>
                                {openDropdown === 0 && (
                                    <div
                                        className="absolute left-1/2 transform -translate-x-1/2 mt-0 w-[1000px] origin-top bg-white rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        onMouseEnter={() => handleMouseEnter(0)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div className="py-6 px-6">
                                            <table className="w-full border-collapse table-fixed">
                                                <tbody>
                                                    {Array.from({ length: Math.ceil(categories.slice(0, 8).length / 4) }).map((_, rowIndex) => (
                                                        <tr key={`row-${rowIndex}`} className="align-top">
                                                            {Array.from({ length: 4 }).map((_, colIndex) => {
                                                                const categoryIndex = rowIndex * 4 + colIndex;
                                                                const category = categories[categoryIndex];

                                                                if (!category) return <td key={`empty-${colIndex}`} className="p-3 w-1/4"></td>;

                                                                return (
                                                                    <td key={`cat-${category.id}`} className="p-3 w-1/4">
                                                                        <div className="mb-3">
                                                                            <Link
                                                                                href={category.href}
                                                                                className="block text-base font-medium text-gray-900 hover:text-orange-600 pb-2"
                                                                            >
                                                                                {category.name}
                                                                            </Link>
                                                                        </div>
                                                                        <ul className="space-y-2">
                                                                            {category.subcategories?.map((subItem) => (
                                                                                <li key={`${category.id}-${subItem.id}`}>
                                                                                    <Link
                                                                                        href={subItem.href}
                                                                                        className="block text-sm text-gray-600 hover:text-orange-600"
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
                                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 rounded-b-md text-center">
                                            <Link
                                                href="/products"
                                                className="text-sm font-medium text-orange-600 hover:text-orange-700 inline-flex items-center"
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
                                    className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200 py-3"
                                >
                                    {link.name}
                                </Link>
                            </li>
                        )
                    ))}
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
    const { categories } = usePage<PageProps>().props;
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

    const toggleDropdown = (index: number) => {
        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
    };

    useEffect(() => {
        if (!isOpen) {
            setOpenDropdownIndex(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-orange-600" onClick={onClose}>
                        <img src="/logo.svg" className="h-12" alt="Matony Serviços" />
                    </Link>
                    <button onClick={onClose} className="p-1 text-gray-600 hover:text-orange-600" aria-label="Fechar menu">
                        <X size={28} strokeWidth={1.5} />
                    </button>
                </div>
                <nav className="py-4 overflow-y-auto h-[calc(100vh-65px)]">
                    <ul>
                        {navLinks.map((link, index) => (
                            link.name === 'Categorias' && categories && categories.length > 0 ? (
                                <li key={`mobile-categories-${index}`} className="border-b border-gray-100">
                                    <button
                                        onClick={() => toggleDropdown(0)}
                                        className="w-full flex justify-between items-center px-5 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors"
                                    >
                                        <span>Categorias</span>
                                        {openDropdownIndex === 0 ? (
                                            <ChevronUp size={20} strokeWidth={2} />
                                        ) : (
                                            <ChevronDown size={20} strokeWidth={2} />
                                        )}
                                    </button>
                                    {openDropdownIndex === 0 && (
                                        <ul className="pl-8 bg-gray-50">
                                            {categories.map((category) => (
                                                <li key={`mobile-cat-${category.id}`} className="border-t border-gray-100 first:border-t-0">
                                                    <Link
                                                        href={category.href}
                                                        className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-100 hover:text-orange-600 transition-colors"
                                                        onClick={onClose}
                                                    >
                                                        {category.name}
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
                                        className="block px-5 py-3 text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors"
                                        onClick={onClose}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            )
                        ))}
                    </ul>
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
    const [showNav, setShowNav] = useState(true);
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
            behavior: 'smooth'
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
                    setShowNav(true);
                    scrollDirection.current = 'none';
                } else {
                    const newDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';

                    if (newDirection !== scrollDirection.current) {
                        scrollDirection.current = newDirection;
                        if (newDirection === 'down') {
                            setShowTopBar(false);
                            setTimeout(() => {
                                setShowNav(false);
                                scrollLock.current = false;
                            }, 50);
                            return;
                        } else {
                            setShowNav(true);
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
                    className="transition-all duration-300 ease-out overflow-hidden"
                    style={{
                        maxHeight: showTopBar ? '50px' : '0',
                        opacity: showTopBar ? 1 : 0,
                    }}
                >
                    <TopBar />
                </div>

                <MainHeader
                    onMobileMenuToggle={handleMobileMenuToggle}
                    isMobileMenuOpen={isMobileMenuOpen}
                    cartItemCount={itemCount}
                />

                <div className="transition-all duration-300 ease-out ">
                    <NavigationBar />
                </div>

                <MobileMenu
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                />
            </header>

            <a
                href="https://wa.me/258841234567"
                target="_blank"
                rel="noopener noreferrer"
                className={`fixed ${showScrollTop ? 'bottom-20' : 'bottom-4'} right-4 z-50 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center`}
                aria-label="Contato via WhatsApp"
            >
                <MessageCircle size={28} strokeWidth={2} />
            </a>

            <button
                onClick={scrollToTop}
                className={`fixed bottom-4 right-4 z-50 bg-orange-600 text-white p-3 rounded-full shadow-lg hover:bg-orange-700 transition-all duration-300 flex items-center justify-center ${showScrollTop ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                aria-label="Voltar ao topo"
            >
                <ArrowUp size={28} strokeWidth={2} />
            </button>
        </>
    );
};

export default Header;
