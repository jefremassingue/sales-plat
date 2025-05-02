import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageVersion {
  id: number;
  name: string;
  url: string;
  version: string;
  size?: number;
}

interface ImageViewerProps {
  image: {
    id: number;
    name: string;
    original_name?: string;
    size?: number;
    is_main?: boolean;
    url: string;
    versions?: ImageVersion[];
    version?: string;
    extension?: string;
  };
  altText?: string;
  className?: string;
  showZoomIndicator?: boolean;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  image,
  altText,
  className,
  showZoomIndicator = true
}) => {
  const [open, setOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | undefined>(undefined);

  // Organizar as versões em ordem (original e outras versões)
  const versions = [
    ...(image.versions || []),
    { ...image, version: 'original' }
  ].sort((a, b) => {
    const versionOrder = { original: 5, xl: 4, lg: 3, md: 2, sm: 1 };
    return (versionOrder[b.version as keyof typeof versionOrder] || 0) -
           (versionOrder[a.version as keyof typeof versionOrder] || 0);
  });

  // Selecionar a versão atual ou a primeira disponível
  const currentImage = currentVersion
    ? versions.find(v => v.version === currentVersion) || versions[0]
    : versions[0];

  const currentIndex = versions.findIndex(v => v.version === currentVersion) || 0;

  // Função para formatar tamanho de arquivo
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Tamanho desconhecido';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Funções para navegar entre versões
  const nextVersion = () => {
    const nextIndex = (currentIndex + 1) % versions.length;
    setCurrentVersion(versions[nextIndex].version);
  };

  const prevVersion = () => {
    const prevIndex = (currentIndex - 1 + versions.length) % versions.length;
    setCurrentVersion(versions[prevIndex].version);
  };

  return (
    <>
      <div
        className={cn("cursor-pointer relative w-full h-full", className)}
        onClick={() => setOpen(true)}
      >
        <img
          src={image.url}
          alt={altText || image.name}
          className="w-full h-full object-cover"
        />
        {showZoomIndicator && (
          <ZoomIn className="absolute bottom-2 right-2 h-4 w-4 text-white bg-black/50 p-1 box-content rounded-full" />
        )}
        {image.is_main && (
          <Badge variant="default" className="absolute top-2 right-2">
            Principal
          </Badge>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-screen  p-2 sm:p-4 flex flex-col">
          <DialogTitle className="flex justify-between items-center py-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-bold truncate">{image.original_name || image.name}</span>
              <Badge variant="outline">
                {currentImage.version}
              </Badge>
            </div>
            {/* Removido um dos botões de fechar, mantendo apenas este */}
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogTitle>

          <div className="relative flex items-center justify-center flex-1 overflow-hidden">
            <img
              src={currentImage.url}
              alt={altText || image.name}
              className="max-w-full max-h-full object-contain"
            />

            {versions.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 bg-black/20 hover:bg-black/40 text-white rounded-full z-10"
                  onClick={prevVersion}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 bg-black/20 hover:bg-black/40 text-white rounded-full z-10"
                  onClick={nextVersion}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {/* Lista de versões melhorada */}
          <div className="mt-3 overflow-y-auto">
            <h3 className="text-sm font-medium mb-2">Versões disponíveis</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {versions.map(version => (
                <Button
                  key={version.version}
                  variant={currentVersion === version.version ? "default" : "outline"}
                  size="sm"
                  className="flex flex-col py-2 h-auto"
                  onClick={() => setCurrentVersion(version.version)}
                >
                  <span className="font-medium">{version.version}</span>
                  {version.size && <span className="text-xs mt-1">({formatFileSize(version.size)})</span>}
                </Button>
              ))}
            </div>

            {/* Informações adicionais */}
            <div className="mt-3 text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <p className="font-medium">Nome:</p>
                <p className="truncate">{image.name}</p>
              </div>
              {image.size && (
                <div>
                  <p className="font-medium">Tamanho:</p>
                  <p>{formatFileSize(image.size)}</p>
                </div>
              )}
              <div>
                <p className="font-medium">ID:</p>
                <p>{image.id}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
