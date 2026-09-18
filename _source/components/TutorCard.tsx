import { CourseChip } from './CourseChip';
import { PricingBubble } from './PricingBubble';
import { TimeIndicator } from './TimeIndicator';
import { LocationBadge } from './LocationBadge';

interface TutorCardProps {
  name: string;
  avatar?: string;
  courses: string[];
  pronouns: string;
  groupPrice: string | null;
  individualPrice: string | null;
  location: string[];
  nextAvailable: string;
  onClick?: () => void;
}

export function TutorCard({
  name,
  avatar,
  courses,
  pronouns,
  groupPrice,
  individualPrice,
  location,
  nextAvailable,
  onClick
}: TutorCardProps) {
  return (
    <div
      onClick={onClick}
      className={`w-full rounded-2xl p-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:brightness-105 active:scale-[0.98]' : ''}`}
      style={{
        background: 'light-dark(linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(248, 248, 248, 1) 100%), linear-gradient(145deg, rgba(30, 30, 30, 1) 0%, rgba(20, 20, 20, 1) 100%))',
        boxShadow: 'light-dark(0 4px 12px rgba(0, 0, 0, 0.08), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5), inset 1px 1px 2px rgba(50, 50, 50, 0.5), inset -1px -1px 2px rgba(0, 0, 0, 0.3))',
        border: '1px solid light-dark(rgba(230, 230, 230, 0.8), rgba(50, 50, 50, 0.8))',
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #db2321 0%, #a01a18 100%)',
            boxShadow: '0 2px 8px rgba(219, 35, 33, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-white" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
              {name.charAt(0)}
            </span>
          )}
        </div>
        
        {/* Name and Pronouns */}
        <div className="flex-1 text-left">
          <h3 className="mb-1 text-foreground">{name}</h3>
          <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            {pronouns}
          </span>
        </div>
      </div>

      {/* Courses */}
      <div className="flex gap-2 flex-wrap mb-3">
        {courses.slice(0, 3).map((course) => (
          <CourseChip key={course} code={course} />
        ))}
        {courses.length > 3 && (
          <span className="text-muted-foreground inline-flex items-center" style={{ fontSize: 'var(--text-sm)' }}>
            +{courses.length - 3} more
          </span>
        )}
      </div>

      {/* Pricing */}
      <div className="flex gap-2 mb-2 flex-wrap">
        {groupPrice && <PricingBubble type="group" price={groupPrice} />}
        {individualPrice && <PricingBubble type="individual" price={individualPrice} />}
      </div>

      {/* Location and Time */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {location.map((loc) => (
            <LocationBadge key={loc} location={loc} />
          ))}
        </div>
        <TimeIndicator time={nextAvailable} variant="compact" />
      </div>
    </div>
  );
}