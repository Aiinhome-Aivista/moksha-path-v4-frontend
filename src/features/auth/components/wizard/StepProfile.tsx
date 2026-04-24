import type { Persona, RegisterPayload } from '@/types';

export const PERSONA_COPY: Record<
  Persona,
  { sa: string; en: string; title: string; lede: string }
> = {
  student: {
    sa: 'अभ्यासी',
    en: 'Student',
    title: 'Tell us a little about your studies.',
    lede: 'So we can shape a path that actually fits.',
  },
  parent: {
    sa: 'अभिभावक',
    en: 'Parent',
    title: 'Tell us a little about your child.',
    lede: "We'll tailor early alerts and conversation-starters.",
  },
  teacher: {
    sa: 'शिक्षक',
    en: 'Teacher',
    title: 'Tell us about your classroom.',
    lede: "We'll map the right tools to your subjects and grades.",
  },
  institution: {
    sa: 'संस्था',
    en: 'Institution',
    title: 'Tell us about your school.',
    lede: 'Our academic team will get in touch within a working day.',
  },
};

const SUBJECTS = ['Math', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Studies', 'Hindi'];
const GRADES = ['6', '7', '8', '9', '10', '11', '12'];
const CLASS_OPTIONS = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const BOARD_OPTIONS = [
  'CBSE',
  'ICSE',
  'CAIE',
  'IB',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'West Bengal (WBBSE)',
  'Other state board',
];
const SHORT_BOARD_OPTIONS = ['CBSE', 'ICSE', 'CAIE', 'IB', 'State board'];
const ENROLLMENT_OPTIONS = ['< 250', '250–500', '500–1,000', '1,000–2,500', '2,500–5,000', '5,000+'];
const ROLE_OPTIONS = [
  'Principal',
  'Vice-Principal',
  'Academic Head / Coordinator',
  'Trustee / Owner',
  'Administrator',
  'Other',
];
const INSTITUTION_BOARD_OPTIONS = ['CBSE', 'ICSE', 'CAIE', 'IB', 'State board (mixed)', 'Multi-board'];

interface StepProfileProps {
  active: boolean;
  persona: Persona;
  formData: Partial<RegisterPayload>;
  onChange: (patch: Partial<RegisterPayload>) => void;
  onBack: () => void;
  onContinue: () => void;
}

const toggleInArray = (arr: string[] | undefined, value: string): string[] => {
  const list = arr ?? [];
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
};

const StepProfile = ({
  active,
  persona,
  formData,
  onChange,
  onBack,
  onContinue,
}: StepProfileProps) => {
  const copy = PERSONA_COPY[persona];

  return (
    <section className={`w-step${active ? ' is-active' : ''}`} data-step="2">
      <div className="w-step__eyebrow">
        <span className="accent-sanskrit">{copy.sa}</span>
        <span className="wse-en">{copy.en}</span>
      </div>
      <h1 className="w-step__title">{copy.title}</h1>
      <p className="w-step__lede">{copy.lede}</p>

      {persona === 'student' && (
        <div className="profile-fields" data-role="student">
          <label className="auth-field">
            <span className="auth-field__label">Your name</span>
            <input
              type="text"
              className="auth-field__input"
              placeholder="e.g. Aarav Mehta"
              value={formData.name ?? ''}
              onChange={(e) => onChange({ name: e.target.value })}
              required
            />
          </label>
          <div className="auth-row">
            <label className="auth-field">
              <span className="auth-field__label">Class</span>
              <select
                className="auth-field__input"
                value={formData.grade ?? ''}
                onChange={(e) => onChange({ grade: e.target.value })}
              >
                <option value="">Select your class…</option>
                {CLASS_OPTIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="auth-field">
              <span className="auth-field__label">Board</span>
              <select
                className="auth-field__input"
                value={formData.board ?? ''}
                onChange={(e) => onChange({ board: e.target.value })}
              >
                <option value="">Select your board…</option>
                {BOARD_OPTIONS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      {persona === 'parent' && (
        <div className="profile-fields" data-role="parent">
          <label className="auth-field">
            <span className="auth-field__label">Your name</span>
            <input
              type="text"
              className="auth-field__input"
              placeholder="e.g. Priya Mehta"
              value={formData.name ?? ''}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </label>
          <label className="auth-field">
            <span className="auth-field__label">
              Your child's name <span className="muted">(optional)</span>
            </span>
            <input
              type="text"
              className="auth-field__input"
              placeholder="e.g. Aarav"
              value={formData.childName ?? ''}
              onChange={(e) => onChange({ childName: e.target.value })}
            />
          </label>
          <div className="auth-row">
            <label className="auth-field">
              <span className="auth-field__label">Child's class</span>
              <select
                className="auth-field__input"
                value={formData.childGrade ?? ''}
                onChange={(e) => onChange({ childGrade: e.target.value })}
              >
                <option value="">Select…</option>
                {CLASS_OPTIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="auth-field">
              <span className="auth-field__label">Child's board</span>
              <select
                className="auth-field__input"
                value={formData.childBoard ?? ''}
                onChange={(e) => onChange({ childBoard: e.target.value })}
              >
                <option value="">Select…</option>
                {SHORT_BOARD_OPTIONS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      {persona === 'teacher' && (
        <div className="profile-fields" data-role="teacher">
          <label className="auth-field">
            <span className="auth-field__label">Your name</span>
            <input
              type="text"
              className="auth-field__input"
              placeholder="e.g. Anjali Sharma"
              value={formData.name ?? ''}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </label>
          <label className="auth-field">
            <span className="auth-field__label">School name</span>
            <input
              type="text"
              className="auth-field__input"
              placeholder="e.g. DAV Public School, Pune"
              value={formData.school ?? ''}
              onChange={(e) => onChange({ school: e.target.value })}
            />
          </label>
          <div className="auth-row">
            <div className="auth-field">
              <span className="auth-field__label">Subjects you teach</span>
              <div className="chip-select" role="group">
                {SUBJECTS.map((s) => (
                  <label key={s} className="chip">
                    <input
                      type="checkbox"
                      checked={formData.subjects?.includes(s) ?? false}
                      onChange={() =>
                        onChange({ subjects: toggleInArray(formData.subjects, s) })
                      }
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="auth-field">
            <span className="auth-field__label">Grades you teach</span>
            <div className="chip-select" role="group">
              {GRADES.map((g) => (
                <label key={g} className="chip">
                  <input
                    type="checkbox"
                    checked={formData.grades?.includes(g) ?? false}
                    onChange={() =>
                      onChange({ grades: toggleInArray(formData.grades, g) })
                    }
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {persona === 'institution' && (
        <div className="profile-fields" data-role="institution">
          <label className="auth-field">
            <span className="auth-field__label">School or organisation name</span>
            <input
              type="text"
              className="auth-field__input"
              placeholder="e.g. DAV Public School, Pune"
              value={formData.school ?? ''}
              onChange={(e) => onChange({ school: e.target.value })}
            />
          </label>
          <div className="auth-row">
            <label className="auth-field">
              <span className="auth-field__label">Primary board</span>
              <select
                className="auth-field__input"
                value={formData.primaryBoard ?? ''}
                onChange={(e) => onChange({ primaryBoard: e.target.value })}
              >
                <option value="">Select…</option>
                {INSTITUTION_BOARD_OPTIONS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>
            <label className="auth-field">
              <span className="auth-field__label">Your role</span>
              <select
                className="auth-field__input"
                value={formData.role ?? ''}
                onChange={(e) => onChange({ role: e.target.value })}
              >
                <option value="">Select…</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="auth-row">
            <label className="auth-field">
              <span className="auth-field__label">Approximate students enrolled</span>
              <select
                className="auth-field__input"
                value={formData.enrollmentSize ?? ''}
                onChange={(e) => onChange({ enrollmentSize: e.target.value })}
              >
                <option value="">Select…</option>
                {ENROLLMENT_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="auth-field">
              <span className="auth-field__label">Your name</span>
              <input
                type="text"
                className="auth-field__input"
                placeholder="e.g. Dr. Meera Ranganathan"
                value={formData.name ?? ''}
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </label>
          </div>
        </div>
      )}

      <div className="w-step__actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="btn btn-primary" onClick={onContinue}>
          Continue →
        </button>
      </div>
    </section>
  );
};

export default StepProfile;
