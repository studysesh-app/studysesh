import { ArrowLeft, Upload, FileText, Image, X, Check } from 'lucide-react';
import { useState } from 'react';
import { CourseChip } from '../CourseChip';

interface TutorProofUploadScreenProps {
  courses: string[];
  onBack: () => void;
  onContinue: () => void;
}

type UploadedFile = {
  course: string;
  fileName: string;
  fileType: string;
};

export function TutorProofUploadScreen({ courses, onBack, onContinue }: TutorProofUploadScreenProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedCourse, setSelectedCourse] = useState(courses[0] || '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles([
        ...uploadedFiles,
        {
          course: selectedCourse,
          fileName: file.name,
          fileType: file.type,
        },
      ]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const getCourseFileCount = (course: string) => {
    return uploadedFiles.filter((f) => f.course === course).length;
  };

  const allCoursesHaveProof = courses.every((course) => getCourseFileCount(course) > 0);

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
          Upload Proof of Success
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p
          className="text-muted-foreground mb-6 text-center"
          style={{ fontSize: 'var(--text-base)' }}
        >
          Upload proof of your success in each course
        </p>

        {/* Info Message */}
        <div className="mb-6 p-4 bg-secondary/30 border border-border rounded-xl">
          <p className="text-foreground mb-2" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
            Accepted documents:
          </p>
          <ul className="text-muted-foreground space-y-1" style={{ fontSize: 'var(--text-sm)' }}>
            <li>• Unofficial transcripts</li>
            <li>• Grade reports</li>
            <li>• Course completion certificates</li>
          </ul>
        </div>

        {/* Course Selector */}
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
                {course} {getCourseFileCount(course) > 0 && `✓ (${getCourseFileCount(course)} file${getCourseFileCount(course) > 1 ? 's' : ''})`}
              </option>
            ))}
          </select>
        </div>

        {/* Upload Area */}
        <label className="block mb-6">
          <div className="p-8 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p
                  className="text-foreground mb-1"
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  Upload file for {selectedCourse}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          </div>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Course Status Grid */}
        <div className="mb-6">
          <h3
            className="mb-3 text-foreground"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Course Verification Status
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {courses.map((course) => {
              const fileCount = getCourseFileCount(course);
              const hasProof = fileCount > 0;
              return (
                <div
                  key={course}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    hasProof
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                      : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={hasProof ? 'text-green-700 dark:text-green-400' : 'text-foreground'}
                      style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                    >
                      {course}
                    </span>
                    {hasProof && <Check className="w-4 h-4 text-green-600 dark:text-green-400" />}
                  </div>
                  <p className={hasProof ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'} style={{ fontSize: 'var(--text-xs)' }}>
                    {hasProof ? `${fileCount} file${fileCount > 1 ? 's' : ''} uploaded` : 'No proof uploaded'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mb-6">
            <h3
              className="mb-3 text-foreground"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {file.fileType.includes('image') ? (
                      <Image className="w-5 h-5 text-primary" />
                    ) : (
                      <FileText className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-foreground truncate"
                      style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                    >
                      {file.fileName}
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                      {file.course}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skip Note */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-muted-foreground text-center" style={{ fontSize: 'var(--text-sm)' }}>
            💡 You can skip this step and upload proof later, but your courses won't be active until verified
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="px-4 py-4 bg-background border-t border-border flex-shrink-0">
        <button
          onClick={onContinue}
          className="w-full py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-all"
          style={{ 
            fontSize: 'var(--text-base)', 
            fontWeight: 'var(--font-weight-semibold)',
            boxShadow: '0 6px 12px rgba(219, 35, 33, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
          }}
        >
          {allCoursesHaveProof ? 'Continue' : 'Skip for Now'}
        </button>
      </div>
    </div>
  );
}