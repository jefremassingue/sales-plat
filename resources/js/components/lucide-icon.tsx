import React from 'react';
import * as LucideIcons from 'lucide-react';

interface LucideIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
}

// Este componente recebe o nome do ícone Lucide e o renderiza dinamicamente
const LucideIcon: React.FC<LucideIconProps> = ({ name, size = 24, ...props }) => {
  const iconName = name.charAt(0).toUpperCase() + name.slice(1);
  const LucideIcon = (LucideIcons as any)[iconName];

  if (!LucideIcon) {
    // Fallback para um ícone padrão se o nome não for encontrado
    const CreditCard = LucideIcons.CreditCard;
    return <CreditCard size={size} {...props} />;
  }

  return <LucideIcon size={size} {...props} />;
};

export default LucideIcon;
