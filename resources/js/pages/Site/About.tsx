import React from 'react';
import SiteLayout from '@/layouts/site-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Users, // Para Equipe/Valores
    Target, // Para Missão
    Eye, // Para Visão
    Heart, // Para Valores
    Award, // Para Conquistas/Diferenciais
    Sparkles, // Para Inovação/Diferenciais
    ArrowRight,
    Building2, // Para Empresa
    TrendingUp, // Para Jornada/Crescimento
} from 'lucide-react';

// --- TIPOS DE DADOS (Se necessário para dados dinâmicos) ---
interface TeamMember {
    id: string;
    name: string;
    role: string;
    imageUrl: string;
    bio?: string;
    linkedin?: string;
}

interface ValueItem {
    icon: React.ReactNode;
    title: string;
    description: string;
}

interface Milestone {
    year: string;
    title: string;
    description: string;
}

// --- DADOS ESTÁTICOS (Exemplo) ---
const teamMembersData: TeamMember[] = [
    {
        id: "tm1",
        name: "António Matola",
        role: "CEO & Fundador(a)",
        imageUrl: "https://via.placeholder.com/400x400.png?text=Foto+CEO",
        bio: "Visionário(a) e determinado(a), António lidera a Matony Serviços com uma trajetória marcada por esforço, dedicação e foco em resultados concretos.",
        linkedin: "#"
    },
    {
        id: "tm2",
        name: "Pestânia Massingue",
        role: "COO & Cofundador(a)",
        imageUrl: "https://via.placeholder.com/400x400.png?text=Foto+Gerente",
        bio: "Com uma mente prática e orientada para soluções, Pestânia transforma desafios em oportunidades e garante a fluidez das operações da empresa.",
        linkedin: "#"
    },
    // Adicione mais membros se desejar
];


const coreValuesData: ValueItem[] = [
    {
        icon: <Target size={28} className="text-orange-600" />,
        title: "Compromisso com o Cliente",
        description: "Colocamos nossos clientes no centro de tudo o que fazemos, buscando superar suas expectativas."
    },
    {
        icon: <Sparkles size={28} className="text-orange-600" />,
        title: "Inovação Contínua",
        description: "Buscamos constantemente novas soluções e tecnologias para oferecer o que há de melhor em segurança."
    },
    {
        icon: <Users size={28} className="text-orange-600" />,
        title: "Integridade e Ética",
        description: "Agimos com transparência e responsabilidade em todas as nossas relações e operações."
    },
    {
        icon: <Award size={28} className="text-orange-600" />,
        title: "Qualidade Superior",
        description: "Garantimos a excelência em nossos produtos e serviços, seguindo os mais altos padrões."
    }
];




// --- COMPONENTES INTERNOS (Reutilizados ou Específicos) ---

// Reutilizar SectionHeader da página de Contato se estiver em um local comum
// Se não, pode redefinir aqui ou criar um componente compartilhado
interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
    titleClassName?: string;
    subtitleClassName?: string;
    centered?: boolean;
    as?: 'h1' | 'h2' | 'h3';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    className = "mb-10 md:mb-16",
    titleClassName = "text-3xl md:text-4xl font-bold text-slate-800 mb-3",
    subtitleClassName = "text-lg text-slate-600 max-w-2xl",
    centered = true,
    as: TitleTag = 'h2',
}) => {
    return (
        <div className={`${className} ${centered ? 'text-center mx-auto' : ''}`}>
            <TitleTag className={titleClassName}>{title}</TitleTag>
            {subtitle && <p className={`${subtitleClassName} ${centered ? 'mx-auto' : ''}`}>{subtitle}</p>}
        </div>
    );
};

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.03]">
        <img src={member.imageUrl} alt={member.name} className="w-full h-64 object-cover" />
        <div className="p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-1">{member.name}</h3>
            <p className="text-orange-600 font-medium mb-2">{member.role}</p>
            {member.bio && <p className="text-slate-600 text-sm mb-4">{member.bio}</p>}
            {member.linkedin && (
                <Button variant="outline" size="sm" asChild>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-orange-600 border-orange-500 hover:bg-orange-50">
                        LinkedIn
                    </a>
                </Button>
            )}
        </div>
    </div>
);

const ValueCard: React.FC<{ item: ValueItem }> = ({ item }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center mb-3">
            <div className="p-3 bg-orange-100 rounded-full mr-4">
                {item.icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-800">{item.title}</h3>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
    </div>
);

const MilestoneItem: React.FC<{ milestone: Milestone; isLast: boolean }> = ({ milestone, isLast }) => (
    <div className="relative pl-8 sm:pl-32 py-6 group">
        {/* Linha da Timeline (exceto para o último) */}
        {!isLast && (
            <div className="absolute left-0 sm:left-16 top-1 h-full w-0.5 bg-orange-200 group-hover:bg-orange-400 transition-colors duration-300" style={{ transform: 'translateX(-50%)' }}></div>
        )}
        {/* Ponto da Timeline */}
        <div className="absolute left-0 sm:left-16 top-1 w-4 h-4 mt-1.5 bg-white border-2 border-orange-500 rounded-full group-hover:scale-125 transition-transform duration-300" style={{ transform: 'translateX(-50%)' }}></div>

        <div className="relative">
            <p className="text-orange-600 font-semibold text-sm sm:absolute sm:right-full sm:mr-8 sm:top-1/2 sm:-translate-y-1/2 sm:whitespace-nowrap">{milestone.year}</p>
            <h3 className="text-xl font-semibold text-slate-800 mb-1 mt-1 sm:mt-0">{milestone.title}</h3>
            <p className="text-slate-600 text-sm">{milestone.description}</p>
        </div>
    </div>
);


// --- COMPONENTE PRINCIPAL DA PÁGINA "SOBRE NÓS" ---
export default function About() {
    const showTeamSection = teamMembersData && teamMembersData.length > 0;

    return (
        <SiteLayout>
            <Head title="Sobre Nós" />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 text-white py-20 md:py-32">
                <div className="container mx-auto px-4 text-center flex items-center flex-col">
                    {/* <Building2 size={48} className="mx-auto mb-6 text-orange-400" />
                     */}

                    <img src="/logo-dark.svg" alt="logo" className='w-[280px]' />
                    {/* Conheça a Matony Serviços */}
                    <SectionHeader
                        title=""
                        subtitle="Somos mais do que fornecedores de equipamentos de proteção. Somos seus parceiros em segurança, dedicados a proteger o que mais importa: vidas."
                        className="mb-0"
                        titleClassName="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight"
                        subtitleClassName="text-xl text-slate-300 max-w-3xl"
                        as="h1"
                    />
                </div>
            </section>

            {/* Nossa História / Jornada */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <SectionHeader
                        title="Matony Serviços"
                        subtitle="Onde a sua segurança está em primeiro lugar."
                        as="h2"
                    />
                    <div className="relative max-w-3xl mx-auto text-lg text-justify">
                        <p className="text-slate-600">
                            A Matony Serviços é uma empresa moçambicana especializada na comercialização de Equipamentos de Protecção Individual (EPI’s) e soluções de segurança para os mais diversos sectores de actividade.
                        </p>
                        <p className="text-slate-600">Fundada com o propósito de promover ambientes de trabalho mais seguros, a Matony Serviços posiciona-se como parceira estratégica para empresas que valorizam a integridade dos seus colaboradores, a conformidade com as normas de segurança vigentes e a excelência operacional.
                        </p>     <p className="text-slate-600">A nossa actuação pauta-se pela seriedade, transparência e compromisso com a qualidade, oferecendo produtos certificados, que obedecem às mais rigorosas normas internacionais de segurança e protecção.
                            Com uma equipa experiente e uma visão orientada para a satisfação do cliente, a Matony Serviços destaca-se pelo atendimento personalizado, pela rapidez nas entregas e pela capacidade de apresentar soluções adaptadas a cada necessidade.
                        </p>     <p className="text-slate-600"> Mais do que vender equipamentos, a Matony Serviços compromete-se a construir relações duradouras baseadas na confiança, responsabilidade e no respeito pela vida humana.
                        </p>
                    </div>
                </div>
            </section>

            {/* Missão, Visão e Valores */}
            <section className="py-16 md:py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <SectionHeader
                        title="Nossos Pilares Fundamentais"
                        subtitle="Guiamos nossas ações e decisões por um conjunto de princípios que refletem quem somos e no que acreditamos."
                        as="h2"
                    />
                    <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
                        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                            <Target size={36} className="mx-auto mb-4 text-orange-600" />
                            <h3 className="text-2xl font-semibold text-slate-800 mb-2">Missão</h3>
                            <p className="text-slate-600">
                                Fornecer soluções de segurança inovadoras e de alta qualidade, garantindo a proteção e o bem-estar dos trabalhadores em Moçambique.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                            <Eye size={36} className="mx-auto mb-4 text-orange-600" />
                            <h3 className="text-2xl font-semibold text-slate-800 mb-2">Visão</h3>
                            <p className="text-slate-600">
                                Ser a empresa líder e referência em equipamentos de proteção individual no país, reconhecida pela excelência, confiança e compromisso com a vida.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                            <Heart size={36} className="mx-auto mb-4 text-orange-600" />
                            <h3 className="text-2xl font-semibold text-slate-800 mb-2">Valores</h3>
                            <p className="text-slate-600">
                                Cliente em primeiro lugar, Integridade, Inovação, Qualidade, Segurança e Responsabilidade Social.
                            </p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-semibold text-slate-800 text-center mb-10 mt-16">Princípios que nos Movem</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {coreValuesData.map(value => (
                            <ValueCard key={value.title} item={value} />
                        ))}
                    </div>

                    <div className="mt-16 text-center max-w-3xl mx-auto">
                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            "Acreditamos que cada trabalhador merece o mais alto nível de proteção. Nossa jornada está apenas começando, e estamos comprometidos em construir uma empresa ágil, focada no cliente e em constante busca por soluções inovadoras que atendam às necessidades específicas do mercado moçambicano."
                        </p>
                        {teamMembersData.length > 0 && (
                            <p className="mt-4 text-md text-slate-500">- {teamMembersData[0].name}, Fundador(a) da Matony Serviços</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Nossa Equipe (Opcional) */}
            {showTeamSection && (
                <section className="py-16 md:py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <SectionHeader
                            title="Conheça Nossos Líderes"
                            subtitle="Uma equipe apaixonada e experiente, pronta para atender suas necessidades."
                            as="h2"
                        />
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {teamMembersData.map(member => (
                                <TeamMemberCard key={member.id} member={member} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Por Que Escolher a Matony Serviços? */}
            <section className="py-16 md:py-24 bg-orange-50">
                <div className="container mx-auto px-4">
                    <SectionHeader
                        title="Por Que Confiar na Matony Serviços?"
                        subtitle="Oferecemos mais do que produtos; entregamos tranquilidade e segurança para sua equipe."
                        as="h2"
                    />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            { icon: <Award size={24} className="text-orange-700" />, title: "Qualidade Certificada", description: "Produtos testados e aprovados, seguindo normas internacionais de segurança." },
                            { icon: <Users size={24} className="text-orange-700" />, title: "Atendimento Especializado", description: "Nossa equipe está pronta para oferecer consultoria e suporte técnico." },
                            { icon: <Sparkles size={24} className="text-orange-700" />, title: "Soluções Inovadoras", description: "Buscamos constantemente as últimas tecnologias para sua proteção." },
                            { icon: <TrendingUp size={24} className="text-orange-700" />, title: "Entrega Ágil", description: "Compromisso com prazos e logística eficiente em todo o país." },
                            { icon: <Heart size={24} className="text-orange-700" />, title: "Parceria de Confiança", description: "Construímos relações duradouras baseadas na transparência e respeito." },
                            { icon: <Building2 size={24} className="text-orange-700" />, title: "Amplo Catálogo", description: "Variedade de EPIs para atender a todas as necessidades e setores." },
                        ].map(item => (
                            <div key={item.title} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex items-start space-x-4">
                                <div className="flex-shrink-0 mt-1 p-3 bg-orange-100 rounded-full">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-1">{item.title}</h3>
                                    <p className="text-slate-600 text-sm">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 md:py-24 bg-slate-800 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-semibold mb-6">Pronto para Elevar o Nível de Segurança da Sua Empresa?</h2>
                    <p className="text-lg text-slate-300 max-w-xl mx-auto mb-8">
                        Descubra nosso catálogo completo de produtos ou fale com um de nossos especialistas hoje mesmo.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                            <Link href={route('products.index')}> {/* Ajuste a rota conforme necessário */}
                                Ver Produtos
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="text-white border-orange-400 hover:bg-orange-500 hover:border-orange-500" asChild>
                            <Link href={route('contact')}>
                                Entre em Contato
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

        </SiteLayout>
    );
}
