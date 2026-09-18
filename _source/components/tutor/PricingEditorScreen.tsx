import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';

interface PricingEditorScreenProps {
  courses: string[];
  initialGroupPrice: number;
  initialIndividualPrice: number;
  initialPerCoursePricing?: Record<string, { group: number; individual: number }>;
  onBack: () => void;
  onSave: (data: {
    applyToAll: boolean;
    globalGroupPrice: number;
    globalIndividualPrice: number;
    perCoursePricing: Record<string, { group: number; individual: number }>;
  }) => void;
}

export function PricingEditorScreen({
  courses,
  initialGroupPrice,
  initialIndividualPrice,
  initialPerCoursePricing = {},
  onBack,
  onSave,
}: PricingEditorScreenProps) {
  // Check if there are any per-course pricing customizations
  const hasPerCoursePricing = Object.keys(initialPerCoursePricing).length > 0;
  
  const [applyToAll, setApplyToAll] = useState(!hasPerCoursePricing);
  const [globalGroupPrice, setGlobalGroupPrice] = useState(initialGroupPrice);
  const [globalIndividualPrice, setGlobalIndividualPrice] = useState(initialIndividualPrice);
  const [selectedCourse, setSelectedCourse] = useState(courses[0] || '');
  const [perCoursePricing, setPerCoursePricing] = useState<Record<string, { group: number; individual: number }>>(
    initialPerCoursePricing
  );

  const currentGroupPrice = applyToAll
    ? globalGroupPrice
    : perCoursePricing[selectedCourse]?.group ?? globalGroupPrice;
  const currentIndividualPrice = applyToAll
    ? globalIndividualPrice
    : perCoursePricing[selectedCourse]?.individual ?? globalIndividualPrice;

  const handleGroupPriceChange = (value: number) => {
    if (applyToAll) {
      setGlobalGroupPrice(value);
    } else {
      setPerCoursePricing({
        ...perCoursePricing,
        [selectedCourse]: {
          group: value,
          individual: perCoursePricing[selectedCourse]?.individual ?? globalIndividualPrice,
        },
      });
    }
  };

  const handleIndividualPriceChange = (value: number) => {
    if (applyToAll) {
      setGlobalIndividualPrice(value);
    } else {
      setPerCoursePricing({
        ...perCoursePricing,
        [selectedCourse]: {
          group: perCoursePricing[selectedCourse]?.group ?? globalGroupPrice,
          individual: value,
        },
      });
    }
  };

  const handleSave = () => {
    onSave({
      applyToAll,
      globalGroupPrice,
      globalIndividualPrice,
      perCoursePricing,
    });
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
          Edit Pricing
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Apply to All Checkbox */}
        <div className="mb-6">
          <button
            onClick={() => setApplyToAll(!applyToAll)}
            className="flex items-center gap-3 w-full p-4 bg-card border border-border rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                applyToAll ? 'bg-primary border-primary' : 'border-border'
              }`}
            >
              {applyToAll && <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1 text-left">
              <span
                className="block text-foreground"
                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Apply to all courses
              </span>
              <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Use same pricing for all courses
              </span>
            </div>
          </button>
        </div>

        {/* Course Selector (if not applying to all) */}
        {!applyToAll && courses.length > 0 && (
          <div className="mb-6">
            <label
              className="block mb-2 text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              style={{ fontSize: 'var(--text-base)' }}
            >
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Group Session Pricing */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label
              className="text-foreground"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              Group Session Pricing
            </label>
            <div className="px-3 py-1 bg-[rgba(13,15,84,0.2)] dark:bg-[rgba(30,58,138,0.3)] rounded-full">
              <span
                className="text-[#2563eb] dark:text-[#60a5fa]"
                style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
              >
                ${currentGroupPrice}
              </span>
            </div>
          </div>

          <input
            type="range"
            min="2"
            max="10"
            step="1"
            value={currentGroupPrice}
            onChange={(e) => handleGroupPriceChange(Number(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />

          <div className="flex justify-between mt-2">
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              $2
            </span>
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              $10
            </span>
          </div>
        </div>

        {/* Individual Session Pricing */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label
              className="text-foreground"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              1-on-1 Session Pricing
            </label>
            <div className="px-3 py-1 bg-[rgba(13,15,84,0.3)] dark:bg-green-900/30 rounded-full">
              <span
                className="text-green-700 dark:text-green-400"
                style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
              >
                ${currentIndividualPrice}
              </span>
            </div>
          </div>

          <input
            type="range"
            min="2"
            max="30"
            step="1"
            value={currentIndividualPrice}
            onChange={(e) => handleIndividualPriceChange(Number(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />

          <div className="flex justify-between mt-2">
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              $2
            </span>
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              $30
            </span>
          </div>
        </div>

        {/* Preview */}
        {!applyToAll && (
          <div className="mt-8 p-4 bg-secondary/30 border border-border rounded-xl">
            <h4
              className="mb-3 text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              Course-Specific Pricing
            </h4>
            <div className="space-y-2">
              {courses.map((course) => {
                const pricing = perCoursePricing[course] || {
                  group: globalGroupPrice,
                  individual: globalIndividualPrice,
                };
                return (
                  <div key={course} className="flex items-center justify-between">
                    <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      {course}
                    </span>
                    <div className="flex gap-2">
                      <span className="text-primary" style={{ fontSize: 'var(--text-sm)' }}>
                        Group: ${pricing.group}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-green-700 dark:text-green-400" style={{ fontSize: 'var(--text-sm)' }}>
                        1-on-1: ${pricing.individual}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="px-4 py-4 bg-background border-t border-border flex-shrink-0">
        <button
          onClick={handleSave}
          className="w-full py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
        >
          Save Pricing
        </button>
      </div>
    </div>
  );
}