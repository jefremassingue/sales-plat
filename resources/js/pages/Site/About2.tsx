import React from 'react';
import SiteLayout from '@/layouts/site-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Users,
    Target,
    Eye,
    Heart,
    Award,
    Sparkles,
    ArrowRight,
    Building2,
    TrendingUp,
} from 'lucide-react';

// --- TIPOS DE DADOS ---
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

// Novo tipo para os pilares da fundação
interface FoundingPillar {
    icon: React.ReactNode;
    title: string;
    description: string;
}

// --- DADOS ESTÁTICOS (Exemplo Ajustado) ---
const teamMembersData: TeamMember[] = [
    {
        id: "tm1",
        name: "Nome do Fundador(a)",
        role: "CEO & Fundador(a)",
        imageUrl: "https://via.placeholder.com/400x400.png?text=Foto+CEO",
        bio: "Com visão e paixão por segurança, [Nome] fundou a Matony para transformar o mercado de EPIs em Moçambique.",
        linkedin: "#"
    },
    // Adicione mais membros se desejar, ou deixe vazio para não mostrar a seção
];

const coreValuesData: ValueItem[] = [
    {
        icon: <Target size={28} className="text-orange-600" />,
        title: "Foco no Cliente",
        description: "Nossos clientes são a razão da nossa existência. Buscamos entender e superar suas expectativas desde o primeiro contato."
    },
    {
        icon: <Sparkles size={28} className="text-orange-600" />,
        title: "Inovação com Propósito",
        description: "Trazemos soluções modernas e eficazes, sempre pensando no impacto real para a segurança dos trabalhadores."
    },
    {
        icon: <Users size={28} className="text-orange-600" />,
        title: "Integridade Inabalável",
        description: "Transparência, ética e responsabilidade são a base de todas as nossas ações e relações."
    },
    {
        icon: <Award size={28} className="text-orange-600" />,
        title: "Qualidade desde o Início",
        description: "Nosso compromisso com a excelência em produtos e serviços é um pilar fundamental desde a nossa fundação."
    }
];

const foundingPillarsData: FoundingPillar[] = [
    {
        icon: <Sparkles size={28} className="text-orange-600" />,
        title: "Nascemos da Oportunidade",
        description: "Identificamos a necessidade urgente de elevar o padrão de segurança no trabalho em Moçambique, oferecendo EPIs de alta qualidade e um serviço diferenciado."
    },
    {
        icon: <Target size={28} className="text-orange-600" />,
        title: "Compromisso Inovador",
        description: "Desde o primeiro dia, nosso foco é ir além de fornecer produtos: buscamos ser parceiros estratégicos na construção de ambientes de trabalho mais seguros."
    },
    {
        icon: <TrendingUp size={28} className="text-orange-600" />,
        title: "Visão de Impacto",
        description: "Estamos empenhados em construir rapidamente uma reputação de excelência e confiança, tornando-nos a escolha preferida para soluções de segurança no país."
    },
];

// --- COMPONENTES INTERNOS ---

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
        <img src={member.imageUrl} alt={member.name} className="w-full h-72 object-cover" />
        <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-slate-800 mb-1">{member.name}</h3>
            <p className="text-orange-600 font-medium mb-3">{member.role}</p>
            {member.bio && <p className="text-slate-600 text-sm mb-4">{member.bio}</p>}
            {member.linkedin && (
                <Button variant="outline" size="sm" asChild>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-orange-600 border-orange-500 hover:bg-orange-50 hover:text-orange-700">
                        Ver Perfil
                    </a>
                </Button>
            )}
        </div>
    </div>
);

const ValueCard: React.FC<{ item: ValueItem }> = ({ item }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
        <div className="flex items-center mb-4">
            <div className="p-3 bg-orange-100 rounded-full mr-4 shrink-0">
                {item.icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-800">{item.title}</h3>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed flex-grow">{item.description}</p>
    </div>
);

const FoundingPillarCard: React.FC<{ pillar: FoundingPillar }> = ({ pillar }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center h-full ring-1 ring-slate-200/70">
        <div className="p-4 bg-orange-100 rounded-full mb-5 inline-block">
            {pillar.icon}
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">{pillar.title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed flex-grow">{pillar.description}</p>
    </div>
);


// --- COMPONENTE PRINCIPAL DA PÁGINA "SOBRE NÓS" ---
export default function About() {
    const showTeamSection = teamMembersData && teamMembersData.length > 0;
    const currentYear = new Date().getFullYear();

    return (
        <SiteLayout>
            <Head title="Sobre Nós" />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 text-white py-20 md:py-32">
                <div className="container mx-auto px-4 text-center">
                    <Building2 size={48} className="mx-auto mb-6 text-orange-400" />
                    <SectionHeader
                        title="Conheça a Matony"
                        subtitle={`Fundada em ${currentYear}, chegamos para redefinir a segurança no trabalho em Moçambique. Somos seus novos parceiros, dedicados a proteger o que mais importa: vidas.`}
                        className="mb-0"
                        titleClassName="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight"
                        subtitleClassName="text-xl text-slate-300 max-w-3xl"
                        as="h1"
                    />
                </div>
            </section>

            {/* Nossa Fundação e Propósito */}
            <section className="py-16 md:py-24 bg-slate-50"> {/* Mudado para bg-slate-50 para variar */}
                <div className="container mx-auto px-4">
                    <SectionHeader
                        title="Nossa Essência e Ambição"
                        subtitle={`Em ${currentYear}, a Matony nasceu de uma visão clara: ser a vanguarda na oferta de Equipamentos de Proteção Individual de excelência em Moçambique.`}
                        as="h2"
                        className="mb-12 md:mb-16"
                    />
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"> {/* Aumentado max-w */}
                        {foundingPillarsData.map((pillar) => (
                            <FoundingPillarCard key={pillar.title} pillar={pillar} />
                        ))}
                    </div>
                    <div className="mt-16 text-center max-w-3xl mx-auto">
                        <p className="text-xl text-slate-700 leading-relaxed font-medium">
                            "Acreditamos que cada trabalhador merece o mais alto nível de proteção. Nossa jornada está apenas começando, e estamos comprometidos em construir uma empresa ágil, focada no cliente e em constante busca por soluções inovadoras que atendam às necessidades específicas do mercado moçambicano."
                        </p>
                        {teamMembersData.length > 0 && (
                            <p className="mt-4 text-md text-slate-500">- {teamMembersData[0].name}, Fundador(a) da Matony</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Missão, Visão e Valores */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <SectionHeader
                        title="Nossos Pilares Fundamentais"
                        subtitle="Guiamos cada passo com princípios sólidos que refletem quem somos e o que aspiramos ser."
                        as="h2"
                    />
                    <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
                        <div className="bg-slate-50 p-8 rounded-lg shadow-lg text-center ring-1 ring-slate-200/50">
                            <Target size={36} className="mx-auto mb-4 text-orange-600" />
                            <h3 className="text-2xl font-semibold text-slate-800 mb-2">Nossa Missão</h3>
                            <p className="text-slate-600">
                                Fornecer soluções de segurança inovadoras e de alta qualidade, garantindo a proteção e o bem-estar dos trabalhadores em Moçambique, desde o nosso primeiro dia.
                            </p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-lg shadow-lg text-center ring-1 ring-slate-200/50">
                            <Eye size={36} className="mx-auto mb-4 text-orange-600" />
                            <h3 className="text-2xl font-semibold text-slate-800 mb-2">Nossa Visão</h3>
                            <p className="text-slate-600">
                                Ser a empresa de referência em EPIs no país em até 3 anos, reconhecida pela agilidade, confiança e pelo impacto positivo na cultura de segurança.
                            </p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-lg shadow-lg text-center ring-1 ring-slate-200/50">
                            <Heart size={36} className="mx-auto mb-4 text-orange-600" />
                            <h3 className="text-2xl font-semibold text-slate-800 mb-2">Nossos Valores</h3>
                            <p className="text-slate-600">
                                Cliente no centro, Integridade total, Inovação com propósito, Qualidade intransigente, Segurança em primeiro lugar e Responsabilidade socioambiental.
                            </p>
                        </div>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-semibold text-slate-800 text-center mb-10 mt-20">Princípios que nos Movem</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {coreValuesData.map(value => (
                            <ValueCard key={value.title} item={value} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Nossa Equipe (Opcional) */}
            {showTeamSection && (
                <section className="py-16 md:py-24 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <SectionHeader
                            title="A Força por Trás da Matony"
                            subtitle="Conheça quem está na linha de frente, impulsionando nossa missão."
                            as="h2"
                        />
                        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 max-w-md md:max-w-xl lg:max-w-sm mx-auto"> {/* Ajustado para 1 membro centralizado */}
                            {teamMembersData.map(member => (
                                <TeamMemberCard key={member.id} member={member} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Por Que Escolher a Matony? */}
            <section className="py-16 md:py-24 bg-orange-50">
                <div className="container mx-auto px-4">
                    <SectionHeader
                        title="Por Que Começar com a Matony?"
                        subtitle="Apesar de novos, chegamos com energia total e um compromisso firme com sua segurança e sucesso."
                        as="h2"
                    />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            { icon: <Sparkles size={24} className="text-orange-700" />, title: "Abordagem Inovadora", description: "Trazemos novas perspectivas e soluções modernas para os desafios de segurança atuais." },
                            { icon: <Users size={24} className="text-orange-700" />, title: "Foco Total no Cliente", description: "Cada cliente é vital. Oferecemos atendimento ágil, dedicado e personalizado." },
                            { icon: <Award size={24} className="text-orange-700" />, title: "Qualidade Desde o Dia Um", description: "Nosso compromisso com a excelência em produtos é um pilar inegociável desde a fundação." },
                            { icon: <TrendingUp size={24} className="text-orange-700" />, title: "Agilidade e Flexibilidade", description: "Nossa estrutura enxuta nos permite adaptar e responder rapidamente às suas necessidades." },
                            { icon: <Heart size={24} className="text-orange-700" />, title: "Parceria para o Futuro", description: "Queremos crescer ao seu lado, construindo relações de confiança e sucesso mútuo." },
                            { icon: <Building2 size={24} className="text-orange-700" />, title: "Catálogo Estratégico", description: "Iniciamos com uma seleção criteriosa de EPIs, com expansão contínua e focada no mercado." },
                        ].map(item => (
                            <div key={item.title} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex items-start space-x-4 ring-1 ring-slate-200/60 h-full">
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
                    <p className="text-lg text-slate-300 max-w-xl mx-auto mb-10">
                        Descubra nosso catálogo de produtos essenciais ou fale com um de nossos especialistas hoje mesmo. Estamos ansiosos para colaborar!
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3" asChild>
                            <Link href={route('products.index')}> {/* Ajuste a rota */}
                                Ver Produtos
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="text-white border-orange-400 hover:bg-orange-500 hover:border-orange-500 px-8 py-3" asChild>
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