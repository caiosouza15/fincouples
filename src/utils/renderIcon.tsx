import { iconMap } from './iconMap';
import type { LucideProps } from 'lucide-react';

interface RenderIconProps {
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export function renderIcon(
  iconName: string | undefined,
  props?: RenderIconProps
): React.ReactElement | null {
  if (!iconName) return null;
  
  const IconComponent = iconMap[iconName];
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in iconMap`);
    return null;
  }
  
  return <IconComponent {...props} />;
}
