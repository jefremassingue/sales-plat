import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SiteLayout from '@/layouts/site-layout';
import { type Catalog } from '@/types';
import { Head } from '@inertiajs/react';
import { Download } from 'lucide-react';

interface Props {
    catalogs: {
        data: Catalog[];
        links: any[];
    };
}

export default function Index({ catalogs }: Props) {
    return (
        <SiteLayout>
            <Head title="Catálogos" />

            <div className="container px-4 py-12 md:py-20">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Nossos Catálogos</h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Explore nossa coleção de catálogos para encontrar os produtos que você precisa.
                    </p>
                </div>

                <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {catalogs.data.map((catalog) => (
                        <Card key={catalog.id}>
                            <CardHeader>
                                <div className="aspect-w-1 aspect-h-1">
                                    <img
                                        src={catalog.cover_url}
                                        alt={catalog.title}
                                        className="h-full w-full rounded-t-lg object-cover"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <CardTitle className="text-lg font-semibold">{catalog.title}</CardTitle>
                                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                                    <span>Versão: {catalog.version}</span>
                                    <span>{catalog.publish_year}</span>
                                </div>
                                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{catalog.description}</p>
                            </CardContent>
                            <CardFooter className="p-4">
                                <Button asChild className="w-full">
                                    <a href={catalog.file_url} target="_blank" rel="noreferrer">
                                        <Download className="mr-2 h-4 w-4" />
                                        <span>Baixar PDF</span>
                                    </a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </SiteLayout>
    );
}
