import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette } from 'lucide-react';

interface ChartTheme {
  id: string;
  name: string;
  category: 'kerykeion' | 'doodle' | 'vintage' | 'cosmic';
  description: string;
  xpRequired: number;
  kerykeionTheme?: string; // For native Kerykeion themes
  preview: React.ReactNode;
}

interface ChartThemeSelectorProps {
  onThemeSelect?: (themeId: string) => void;
  className?: string;
}

// Single native Kerykeion theme - the reliable classic professional style
const chartThemes: ChartTheme[] = [
  {
    id: 'kerykeion-default',
    name: 'Classic Professional',
    category: 'kerykeion',
    description: 'Clean, professional chart styling with Swiss Ephemeris accuracy',
    xpRequired: 0,
    kerykeionTheme: 'default',
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-300 rounded flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-slate-600 flex items-center justify-center">
          <span className="text-slate-700 text-xs font-semibold">NATAL</span>
        </div>
      </div>
    )
  }
];

export function ChartThemeSelector({ 
  onThemeSelect,
  className = '' 
}: ChartThemeSelectorProps) {

  // Notify parent of the default theme on mount
  useEffect(() => {
    if (onThemeSelect) {
      onThemeSelect('kerykeion-default');
    }
  }, [onThemeSelect]);

  // Since there's only one theme, just show a simple display
  const singleTheme = chartThemes[0];

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Chart Styling</h3>
              <p className="text-sm text-muted-foreground">Professional charts with Swiss Ephemeris accuracy</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 rounded-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-300 rounded flex items-center justify-center flex-shrink-0">
              <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center">
                <span className="text-slate-700 text-xs font-semibold">✓</span>
              </div>
            </div>
            <div className="flex-grow">
              <h4 className="font-semibold text-sm">{singleTheme.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {singleTheme.description}
              </p>
            </div>
            <Badge variant="default" className="text-xs bg-green-600">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}