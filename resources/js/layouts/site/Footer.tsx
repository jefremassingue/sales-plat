import { Link } from '@inertiajs/react';
import {
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    Twitter, // Ou X, se disponível e preferido
    MessageCircle, // Para WhatsApp
    Mail,
    Phone,
    MapPin,
    Send,
    Building,
    Heart,
} from 'lucide-react';
import React from 'react';

// --- INTERFACES E DADOS ---
interface SocialLink {
    name: string;
    href: string;
    icon: React.ReactNode;
}

const socialLinks: SocialLink[] = [
    { name: 'LinkedIn', href: 'https://matonyservicos.com/linkedin', icon: <Linkedin size={20} /> },
    { name: 'Instagram', href: 'https://matonyservicos.com/instagram', icon: <Instagram size={20} /> },
    { name: 'YouTube', href: 'https://matonyservicos.com/youtube', icon: <Youtube size={20} /> },
    { name: 'Facebook', href: 'https://matonyservicos.com/facebook', icon: <Facebook size={20} /> },
    { name: 'WhatsApp', href: 'https://matonyservicos.com/whatsapp', icon: <MessageCircle size={20} /> },
];

interface QuickLinkItem {
    href: string;
    label: string;
}

const companyLinks: QuickLinkItem[] = [
    { href: '/about', label: 'Sobre a Matony' },
    { href: '/careers', label: 'Trabalhe Conosco' }, // Exemplo
    { href: '/blog', label: 'Blog de Segurança' }, // Exemplo
];

const resourceLinks: QuickLinkItem[] = [
    { href: '/products', label: 'Nossos Produtos' },
    { href: '/services', label: 'Serviços Oferecidos' }, // Exemplo
    { href: '/faq', label: 'Perguntas Frequentes' },
    { href: '/contact', label: 'Fale Conosco' },
];

const contactDetails = [
    { icon: <Mail size={16} className="text-orange-600" />, text: 'info@matony.co.mz', href: 'mailto:info@matony.co.mz' },
    { icon: <Phone size={16} className="text-orange-600" />, text: '+258 84 123 4567', href: 'tel:+258841234567' },
    { icon: <MapPin size={16} className="text-orange-600" />, text: 'Av. Julius Nyerere, Maputo' },
];

// --- COMPONENTES PLACEHOLDER (se não usar shadcn/ui) ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }
const Input: React.FC<InputProps> = (props) => {
    return <input {...props} className={`px-4 py-2.5 text-sm border rounded-md focus:ring-1 outline-none w-full ${props.className}`} />;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}
const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
    return <button {...props} className={`px-5 py-2.5 text-sm font-medium rounded-md transition-colors ${props.className}`}>{children}</button>;
}

// --- COMPONENTE FOOTER ---
const Footer: React.FC = () => {
    const handleSubmitNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert('Inscrição na newsletter (simulação)');
        // Aqui você adicionaria a lógica real de submissão, e.g., usando Inertia.post
    };

    return (
        <footer className="bg-slate-50 border-t border-slate-200 text-slate-700"> {/* Fundo slate-50 */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Seção de Links, Contato e Newsletter */}
                <div className="py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Coluna 1: Logo e Redes Sociais */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="inline-block mb-5">
                            <div className="flex items-center space-x-2">
                                <Building size={30} className="text-orange-600" />
                                <span className="text-2xl font-bold text-slate-800 hover:text-orange-600 transition-colors">Matony</span>
                            </div>
                        </Link>
                        <p className="text-sm text-slate-600 mb-6 pr-4"> {/* Cor de texto ajustada */}
                            Sua parceira de confiança em segurança e equipamentos de proteção individual em Moçambique.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.name}
                                    title={social.name}
                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-orange-600 hover:text-white transition-all duration-200 transform hover:scale-110"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Coluna 2: Links da Empresa */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-800 tracking-wider uppercase mb-4">Empresa</h4>
                        <ul className="space-y-2.5">
                            {companyLinks.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-slate-600 hover:text-orange-600 hover:underline transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Coluna 3: Links de Recursos */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-800 tracking-wider uppercase mb-4">Recursos</h4>
                        <ul className="space-y-2.5">
                            {resourceLinks.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-slate-600 hover:text-orange-600 hover:underline transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Coluna 4: Newsletter e Contato Rápido */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-800 tracking-wider uppercase mb-4">Mantenha Contato</h4>
                        <form onSubmit={handleSubmitNewsletter} className="space-y-3 mb-6">
                            <Input
                                type="email"
                                placeholder="Seu e-mail para novidades"
                                className="bg-white border-slate-300 focus:bg-white focus:border-orange-500 focus:ring-orange-500 placeholder-slate-400 text-slate-800" // Cores ajustadas
                                required
                            />
                            <Button
                                type="submit"
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 text-xs"
                            >
                                <Send size={16} className="inline mr-1.5" />
                                Inscrever-se
                            </Button>
                        </form>

                        <ul className="space-y-2.5">
                            {contactDetails.slice(0, 2).map((detail, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <span className="shrink-0">{detail.icon}</span> {/* Ícone já tem cor laranja definida nos dados */}
                                    {detail.href ? (
                                        <a href={detail.href} className="text-sm text-slate-600 hover:text-orange-600 hover:underline">
                                            {detail.text}
                                        </a>
                                    ) : (
                                        <span className="text-sm text-slate-600">{detail.text}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Seção Inferior: Copyright */}
                <div className="py-6 md:py-8 border-t border-slate-200 text-center"> {/* Borda ajustada */}
                    <p className="text-xs text-slate-500"> {/* Cor de texto ajustada */}
                        © {new Date().getFullYear()} Matony Serviços, Lda. Todos os direitos reservados.
                    </p>
                    <p className="text-xs text-slate-400 mt-1"> {/* Cor de texto ajustada */}
                        NUIT: 123456789 {/* Exemplo, adicione o NUIT real */}
                        <span className="mx-1.5">|</span>
                        Design por <a href="https://seulink.com" className="hover:text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">Seu Nome/Agência</a> {/* Cor de hover ajustada */}
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
