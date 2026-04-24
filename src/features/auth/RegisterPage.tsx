import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import type { ContactMethod, Persona, RegisterPayload } from '@/types';
import StepWho from './components/wizard/StepWho';
import StepProfile from './components/wizard/StepProfile';
import StepContact from './components/wizard/StepContact';
import StepVerify from './components/wizard/StepVerify';

type StepNumber = 1 | 2 | 3 | 4;

const RegisterPage = () => {
  const [step, setStep] = useState<StepNumber>(1);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [formData, setFormData] = useState<Partial<RegisterPayload>>({});
  const [method, setMethod] = useState<ContactMethod>('email');
  const [submitting, setSubmitting] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const { loginWithAuthResponse } = useAuth();
  const navigate = useNavigate();

  const goTo = (n: StepNumber) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const patchForm = (patch: Partial<RegisterPayload>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const handleStep3Continue = async () => {
    if (!persona) return;
    setSubmitting(true);
    try {
      // Register the account, then request an OTP to verify the contact.
      await authService.register({
        persona,
        name: formData.name ?? '',
        email: method === 'email' ? formData.email : undefined,
        phone: method === 'phone' ? formData.phone : undefined,
        board: formData.board,
        grade: formData.grade,
        school: formData.school,
        subjects: formData.subjects,
        grades: formData.grades,
        role: formData.role,
        childName: formData.childName,
        childGrade: formData.childGrade,
        childBoard: formData.childBoard,
        enrollmentSize: formData.enrollmentSize,
        primaryBoard: formData.primaryBoard,
      });
      await authService.requestOtp({
        method,
        email: method === 'email' ? formData.email : undefined,
        phone: method === 'phone' ? formData.phone : undefined,
      });
      goTo(4);
    } catch {
      setVerifyError(
        'We could not start your account. Please check your details and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (code: string) => {
    setSubmitting(true);
    setVerifyError(null);
    try {
      const destination =
        method === 'email' ? formData.email ?? '' : formData.phone ?? '';
      const res = await authService.verifyOtp({ destination, method, code });
      loginWithAuthResponse(res);
      navigate('/dashboard', { replace: true });
    } catch {
      setVerifyError('That code did not match. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.requestOtp({
        method,
        email: method === 'email' ? formData.email : undefined,
        phone: method === 'phone' ? formData.phone : undefined,
      });
    } catch {
      /* no-op; the Verify step surfaces errors on submit */
    }
  };

  const destination =
    method === 'email' ? formData.email ?? 'your email' : formData.phone ?? 'your phone';

  return (
    <AuthLayout>
      <main className="wizard-main">
        <img
          className="auth-mandala"
          src="/assets/mandala.svg"
          alt=""
          aria-hidden="true"
        />

        <div className="wizard">
          <div className="wizard__progress" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={`wp-step${
                  n === step ? ' is-active' : n < step ? ' is-done' : ''
                }`}
                data-step={n}
              />
            ))}
          </div>
          <div className="wizard__counter">
            <span>{step}</span> <span className="wc-sep">of</span> 4
          </div>

          <form className="wizard__form" onSubmit={(e) => e.preventDefault()}>
            <StepWho
              active={step === 1}
              persona={persona}
              onPersonaChange={setPersona}
              onContinue={() => goTo(2)}
            />

            {persona && (
              <StepProfile
                active={step === 2}
                persona={persona}
                formData={formData}
                onChange={patchForm}
                onBack={() => goTo(1)}
                onContinue={() => goTo(3)}
              />
            )}

            <StepContact
              active={step === 3}
              method={method}
              onMethodChange={setMethod}
              formData={formData}
              onChange={patchForm}
              onBack={() => goTo(2)}
              onContinue={handleStep3Continue}
            />

            <StepVerify
              active={step === 4}
              destination={destination}
              onBack={() => goTo(3)}
              onSubmit={handleVerify}
              onResend={handleResend}
              submitting={submitting}
              error={verifyError}
            />
          </form>
        </div>
      </main>
    </AuthLayout>
  );
};

export default RegisterPage;
