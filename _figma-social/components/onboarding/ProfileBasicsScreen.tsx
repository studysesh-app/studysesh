import { useState } from 'react';
import { ArrowLeft, User, ChevronDown } from 'lucide-react';
import { SkeuomorphicButton } from '../SkeuomorphicButton';

interface ProfileBasicsScreenProps {
  onBack: () => void;
  onContinue: (data: {
    fullName: string;
    pronouns: string[];
    gender: string;
    yearOfStudy: string;
    degreeLevel: string;
    major: string;
  }) => void;
}

export function ProfileBasicsScreen({ onBack, onContinue }: ProfileBasicsScreenProps) {
  const [fullName, setFullName] = useState('');
  const [pronouns, setPronouns] = useState<string[]>([]);
  const [gender, setGender] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('');
  const [major, setMajor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue({ fullName, pronouns, gender, yearOfStudy, degreeLevel, major });
  };

  const handlePronounToggle = (pronoun: string) => {
    if (pronouns.includes(pronoun)) {
      setPronouns(pronouns.filter(p => p !== pronoun));
    } else if (pronouns.length < 2) {
      setPronouns([...pronouns, pronoun]);
    }
  };

  const pronounOptions = ['he', 'him', 'she', 'her', 'they', 'them'];
  const genderOptions = ['Man', 'Woman', 'Non-Binary', 'Prefer not to say'];
  const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year+'];
  const degreeLevelOptions = ['Bachelor\'s', 'Master\'s'];
  const majorOptions = [
    'Computer Science',
    'Software Engineering',
    'Engineering',
    'Business',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Psychology',
    'Economics',
    'Political Science',
    'Other',
  ];

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 pt-8 pb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="flex-1 text-center text-xl font-semibold text-black pr-10">Complete Profile</h1>
      </div>

      {/* Subtitle */}
      <p className="text-center text-gray-500 px-6 pb-6" style={{ fontSize: '15px' }}>
        Help tutors get to know you better
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-6 overflow-y-auto pb-6">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* Profile Picture Placeholder */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#db2321] rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-white text-xl font-light leading-none">+</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block mb-2 text-black font-medium" style={{ fontSize: '15px' }}>
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-gray-300 focus:border-gray-400 focus:outline-none transition-all text-black placeholder:text-gray-400"
                style={{ fontSize: '15px' }}
                required
              />
            </div>
          </div>

          {/* Pronouns */}
          <div>
            <label className="block mb-3 text-black font-medium" style={{ fontSize: '15px' }}>
              Pronouns (select up to 2)
            </label>
            <div className="flex flex-wrap gap-2">
              {pronounOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handlePronounToggle(option)}
                  disabled={!pronouns.includes(option) && pronouns.length >= 2}
                  className={`px-6 py-3 rounded-full border transition-all ${
                    pronouns.includes(option)
                      ? 'border-[#db2321] bg-[#db2321] text-white'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                  style={{ fontSize: '15px' }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Identity */}
          <div>
            <label className="block mb-3 text-black font-medium" style={{ fontSize: '15px' }}>
              Gender Identity
            </label>
            <div className="flex flex-wrap gap-2">
              {genderOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGender(option)}
                  className={`px-6 py-3 rounded-full border transition-all ${
                    gender === option
                      ? 'border-[#db2321] bg-[#db2321] text-white'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                  style={{ fontSize: '15px' }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Year of Study */}
          <div>
            <label className="block mb-3 text-black font-medium" style={{ fontSize: '15px' }}>
              Year of Study
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const currentIndex = yearOptions.indexOf(yearOfStudy);
                  const nextIndex = (currentIndex + 1) % yearOptions.length;
                  setYearOfStudy(yearOptions[nextIndex]);
                }}
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 focus:border-gray-400 focus:outline-none transition-all text-black text-left"
                style={{ fontSize: '15px' }}
              >
                {yearOfStudy || 'Select year'}
              </button>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
            {/* Dropdown options */}
            <div className="mt-2 space-y-1">
              {yearOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setYearOfStudy(option)}
                  className={`w-full px-4 py-2.5 rounded-lg text-left transition-all ${
                    yearOfStudy === option
                      ? 'bg-gray-100 text-black font-medium'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{ fontSize: '15px' }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Degree Level */}
          <div>
            <label className="block mb-3 text-black font-medium" style={{ fontSize: '15px' }}>
              Degree Level
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const currentIndex = degreeLevelOptions.indexOf(degreeLevel);
                  const nextIndex = (currentIndex + 1) % degreeLevelOptions.length;
                  setDegreeLevel(degreeLevelOptions[nextIndex]);
                }}
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 focus:border-gray-400 focus:outline-none transition-all text-black text-left"
                style={{ fontSize: '15px' }}
              >
                {degreeLevel || 'Select degree level'}
              </button>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
            {/* Dropdown options */}
            <div className="mt-2 space-y-1">
              {degreeLevelOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDegreeLevel(option)}
                  className={`w-full px-4 py-2.5 rounded-lg text-left transition-all ${
                    degreeLevel === option
                      ? 'bg-gray-100 text-black font-medium'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{ fontSize: '15px' }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Major */}
          <div>
            <label className="block mb-3 text-black font-medium" style={{ fontSize: '15px' }}>
              Major
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const currentIndex = majorOptions.indexOf(major);
                  const nextIndex = (currentIndex + 1) % majorOptions.length;
                  setMajor(majorOptions[nextIndex]);
                }}
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 focus:border-gray-400 focus:outline-none transition-all text-black text-left"
                style={{ fontSize: '15px' }}
              >
                {major || 'Select your major'}
              </button>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
            {/* Dropdown options */}
            <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
              {majorOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMajor(option)}
                  className={`w-full px-4 py-2.5 rounded-lg text-left transition-all ${
                    major === option
                      ? 'bg-gray-100 text-black font-medium'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{ fontSize: '15px' }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Fixed Bottom Button */}
      <div className="px-6 pb-8 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!fullName || pronouns.length === 0 || !gender || !yearOfStudy || !degreeLevel || !major}
          className="w-full py-4 bg-[#db2321] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-[#c51f1d] active:scale-[0.98]"
          style={{ fontSize: '16px' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}