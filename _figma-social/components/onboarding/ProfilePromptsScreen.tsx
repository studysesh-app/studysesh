import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { SkeuomorphicButton } from '../SkeuomorphicButton';

interface ProfilePromptsScreenProps {
  onBack: () => void;
  onContinue: (prompts: Array<{ prompt: string; answer: string }>) => void;
}

const AVAILABLE_PROMPTS = [
  "I'll buy you coffee if...",
  "I study best at...",
  "Need someone to help me out with...",
  "My go-to study snack is...",
  "I'm always down to...",
  "Best study spot on campus is...",
  "I'm looking for someone who...",
  "My study playlist is...",
  "After exams, you'll find me...",
  "I'm passionate about...",
  "My biggest pet peeve is...",
  "I can teach you how to...",
];

export function ProfilePromptsScreen({ onBack, onContinue }: ProfilePromptsScreenProps) {
  const [selectedPrompts, setSelectedPrompts] = useState<Array<{ prompt: string; answer: string }>>([
    { prompt: "I study best at...", answer: "the library with my headphones in" },
    { prompt: "I'm always down to...", answer: "grab coffee and work on problem sets together" },
    { prompt: "My go-to study snack is...", answer: "trail mix and energy drinks lol" }
  ]);
  const [showPromptPicker, setShowPromptPicker] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSelectPrompt = (prompt: string) => {
    if (editingIndex !== null) {
      // Editing existing prompt
      const updated = [...selectedPrompts];
      updated[editingIndex] = { ...updated[editingIndex], prompt };
      setSelectedPrompts(updated);
      setEditingIndex(null);
    } else {
      // Adding new prompt
      setSelectedPrompts([...selectedPrompts, { prompt, answer: '' }]);
    }
    setShowPromptPicker(false);
  };

  const handleRemovePrompt = (index: number) => {
    setSelectedPrompts(selectedPrompts.filter((_, i) => i !== index));
  };

  const handleUpdateAnswer = (index: number, answer: string) => {
    const updated = [...selectedPrompts];
    updated[index].answer = answer;
    setSelectedPrompts(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue(selectedPrompts);
  };

  const canContinue = selectedPrompts.length === 3 && selectedPrompts.every(p => p.answer.trim().length > 0);
  const usedPrompts = selectedPrompts.map(p => p.prompt);
  const availablePrompts = AVAILABLE_PROMPTS.filter(p => !usedPrompts.includes(p));

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-12 pb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1>Show your personality</h1>
      </div>

      {/* Progress indicator */}
      <div className="px-6 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 h-1 rounded-full bg-primary" />
          <div className="flex-1 h-1 rounded-full bg-primary" />
          <div className="flex-1 h-1 rounded-full bg-muted" />
          <div className="flex-1 h-1 rounded-full bg-muted" />
        </div>
        <p className="text-muted-foreground mt-2" style={{ fontSize: 'var(--text-sm)' }}>
          Step 2 of 4 • {selectedPrompts.length}/3 prompts
        </p>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="flex-1 px-6 overflow-y-auto pb-6">
        <div className="max-w-md mx-auto w-full space-y-6">
          <p className="text-muted-foreground">
            Select 3 prompts and write your answers. This helps other students get to know you!
          </p>

          {/* Selected Prompts */}
          <div className="space-y-4">
            {selectedPrompts.map((item, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  item.answer.trim().length > 0
                    ? 'border-primary bg-card'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingIndex(index);
                      setShowPromptPicker(true);
                    }}
                    className="text-left flex-1 text-foreground hover:text-primary transition-colors"
                    style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}
                  >
                    {item.prompt}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemovePrompt(index)}
                    className="p-1 hover:bg-muted rounded-full transition-colors ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <textarea
                  value={item.answer}
                  onChange={(e) => handleUpdateAnswer(index, e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                  style={{ fontSize: 'var(--text-base)' }}
                  rows={3}
                  maxLength={150}
                />
                <p className="text-right text-muted-foreground mt-2" style={{ fontSize: 'var(--text-xs)' }}>
                  {item.answer.length}/150
                </p>
              </div>
            ))}
          </div>

          {/* Add Prompt Button */}
          {selectedPrompts.length < 3 && (
            <button
              type="button"
              onClick={() => {
                setEditingIndex(null);
                setShowPromptPicker(true);
              }}
              className="w-full py-4 rounded-xl border-2 border-dashed border-border hover:border-primary bg-muted/30 hover:bg-muted/50 transition-all"
            >
              + Add Prompt
            </button>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <SkeuomorphicButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={!canContinue}
            >
              Continue
            </SkeuomorphicButton>
          </div>
        </div>
      </form>

      {/* Prompt Picker Modal */}
      {showPromptPicker && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 pt-12 pb-6">
            <h2>Choose a prompt</h2>
            <button
              onClick={() => {
                setShowPromptPicker(false);
                setEditingIndex(null);
              }}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="max-w-md mx-auto w-full space-y-3">
              {availablePrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSelectPrompt(prompt)}
                  className="w-full p-4 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}