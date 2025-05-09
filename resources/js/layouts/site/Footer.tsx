import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter */}
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Inscreva-se na nossa Newsletter</h3>
          <p className="text-gray-600 mb-6">Receba as últimas novidades e ofertas exclusivas</p>
          <form className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Seu e-mail"
              className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white text-sm font-medium rounded-full hover:bg-orange-700 transition-colors"
            >
              Inscrever
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Sobre a Matony</h3>
            <p className="text-sm text-gray-600">
              Sua loja online de confiança para encontrar os melhores produtos com os melhores preços.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-gray-600 hover:text-orange-600">
                  Produtos
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-gray-600 hover:text-orange-600">
                  Categorias
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-orange-600">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-orange-600">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contato</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-orange-600" />
                <span>info@matony.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-orange-600" />
                <span>+258 84 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-orange-600" />
                <span>Maputo, Moçambique</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Redes Sociais</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-orange-600 hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-orange-600 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-orange-600 hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-100 mt-12 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Matony. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
} 