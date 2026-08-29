import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Particles } from '@/components/ui/particles';

export function ParticlesBackground() {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState('#ffffff');

  useEffect(() => {
    setColor(resolvedTheme === 'dark' ? '#ffffff' : '#000000');
  }, [resolvedTheme]);

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <Particles
        className="absolute inset-0 h-full w-full"
        quantity={80}
        ease={80}
        color={color}
        refresh
      />
    </div>
  );
}
