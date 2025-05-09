
import Header from '@/layouts/site/Header';
import Footer from '@/layouts/site/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Bem-vindo à Matony
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Sua loja online de confiança para encontrar os melhores produtos com os melhores preços.
              </p>
              <Button size="lg" className="gap-2">
                Ver Produtos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Entrega Rápida</h3>
                <p className="text-gray-600">Entrega em todo o país com rapidez e segurança.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Compra Segura</h3>
                <p className="text-gray-600">Pagamento 100% seguro e garantido.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Várias Formas de Pagamento</h3>
                <p className="text-gray-600">Aceitamos diversos cartões e métodos de pagamento.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 