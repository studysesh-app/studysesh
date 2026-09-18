import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';

interface LanguageSelectionScreenProps {
  currentLanguage: string;
  onBack: () => void;
  onSelect: (language: string) => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ar', name: 'العربية' },
];

export function LanguageSelectionScreen({
  currentLanguage,
  onBack,
  onSelect,
}: LanguageSelectionScreenProps) {
  const [selected, setSelected] = useState(currentLanguage);

  const handleSelect = (language: string) => {
    setSelected(language);
    onSelect(language);
    // Auto-save and go back
    setTimeout(() => onBack(), 300);
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 flex items-center flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1
          className="flex-1 text-center text-foreground pr-10"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          Language
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-2">
          {LANGUAGES.map((language) => {
            const isSelected = selected === language.name;
            return (
              <button
                key={language.code}
                onClick={() => handleSelect(language.name)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  isSelected
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card border-border hover:bg-secondary'
                }`}
              >
                <span
                  className={isSelected ? 'text-primary' : 'text-foreground'}
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  {language.name}
                </span>
                {isSelected && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}