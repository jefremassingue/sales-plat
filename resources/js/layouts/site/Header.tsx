import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { usePage } from '@inertiajs/react';

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
  { name: 'Categorias', href: '/products' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contato', href: '/contact' },
  { name: 'Sobre', href: '/about' },
];

// --- Sub-Component: TopBar ---
const TopBar = () => {
  return (
    <div className="bg-orange-600 text-white text-xs py-2">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-1 sm:mb-0">
          <span>Ofertas de Verão: Até 50% de Desconto!</span>
          <Link href="/shop" className="ml-2 font-semibold hover:underline">
            Compre Agora
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <a href="tel:+258841234567" className="flex items-center hover:text-orange-100">
            <Phone size={16} className="mr-1" strokeWidth={1.5} />
            <span>+258 84 123 4567</span>
          </a>
          <a href="mailto:info@matony.com" className="flex items-center hover:text-orange-100">
            <Mail size={16} className="mr-1" strokeWidth={1.5} />
            <span>info@matony.com</span>
          </a>
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


  const handleMouseEnter = (index: number) => {
    if (categories?.[index]) {
      setOpenDropdown(index);
    }
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  return (
    <nav className="hidden lg:block bg-gray-50 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex justify-center items-center space-x-6 h-12">
          {navLinks.map((link, index) => (
            index == 2 ? (
              categories && categories.length > 0 && (
                <li
                  key={index}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(0)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200 py-3 flex items-center"
                  >
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
                            {/* Dividir categorias em linhas de 4 */}
                            {Array.from({ length: Math.ceil(categories.slice(1, 9).length / 4) }).map((_, rowIndex) => (
                              <tr key={`row-${rowIndex}`} className="align-top">
                                {Array.from({ length: 4 }).map((_, colIndex) => {
                                  const categoryIndex = rowIndex * 4 + colIndex;
                                  const category = categories[categoryIndex];

                                  if (!category) return <td key={`empty-${colIndex}`} className="p-3 w-1/4"></td>;

                                  return (
                                    <td key={`cat-${category.id}`} className="p-3  w-1/4">
                                      <div className="mb-3">
                                        <Link
                                          href={category.href}
                                          className="block text-base border-none font-medium text-gray-900 hover:text-orange-600 pb-2 relative "
                                        >
                                          {category.name}
                                        </Link>
                                      </div>
                                      <ul className="space-y-2 border-none">
                                        {/* Simulando subcategorias - em produção, use dados reais */}
                                        {category.subcategories?.map((subItem) => (
                                          <li key={`${category.id}-${subItem.id}`}>
                                            <Link
                                              href={`${category.href}/sub-${subItem}`}
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
                          <ChevronDown size={16} className="ml-1 rotate-270" strokeWidth={2} />
                        </Link>
                      </div>
                    </div>
                  )}
                </li>
              )
            ) : (
              <li key={index}>
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

  if (!isOpen) return null;

  return (
    <div
      className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
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
              index == 2 ? (
                categories && categories.length > 0 && (
                  <li className="border-b border-gray-100">
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
                          <li key={category.id} className="border-t border-gray-100 first:border-t-0">
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
                )
              ) : (
                <li key={index} className="border-b border-gray-100">
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

// --- Main Header Component (Orchestrator) ---
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemCount] = useState(3); // Example

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white">
      <TopBar />
      <MainHeader
        onMobileMenuToggle={handleMobileMenuToggle}
        isMobileMenuOpen={isMobileMenuOpen}
        cartItemCount={cartItemCount}
      />
      <NavigationBar />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

export default Header;