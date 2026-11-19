import { useState } from 'react';
import { ValidationError } from '../services/api';
import { validateEmail, validateName, validatePhone } from '../utils/validation';

interface Props {
  onCancel: () => void;
  onSubmit: (input: { name: string; phone: string; email: string }) => Promise<void>;
}

type FieldErrors = { name?: string; phone?: string; email?: string };

export function AddStudentForm({ onCancel, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const next: FieldErrors = {};
    const nameErr = validateName(name);
    if (nameErr) next.name = nameErr;
    const phoneErr = validatePhone(phone);
    if (phoneErr) next.phone = phoneErr;
    const emailErr = validateEmail(email);
    if (emailErr) next.email = emailErr;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({ name, phone, email });
    } catch (e) {
      if (e instanceof ValidationError) {
        setErrors({ [e.field]: e.message } as FieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !submitting) onCancel();
      }}
    >
      <form className="dialog" onSubmit={handleSubmit} noValidate>
        <h2 id="add-title">Add student to waitlist</h2>

        <label className="field">
          <span>Full name *</span>
          <input
            type="text"
            value={name}
            autoFocus
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'err-name' : undefined}
            className={errors.name ? 'input-error' : ''}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <small id="err-name" className="error-text">
              {errors.name}
            </small>
          )}
        </label>

        <label className="field">
          <span>Phone (E.164 or 10-digit) *</span>
          <input
            type="tel"
            value={phone}
            placeholder="+919876543210"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'err-phone' : undefined}
            className={errors.phone ? 'input-error' : ''}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone && (
            <small id="err-phone" className="error-text">
              {errors.phone}
            </small>
          )}
        </label>

        <label className="field">
          <span>Email *</span>
          <input
            type="email"
            value={email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'err-email' : undefined}
            className={errors.email ? 'input-error' : ''}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <small id="err-email" className="error-text">
              {errors.email}
            </small>
          )}
        </label>

        <div className="dialog-actions">
          <button type="button" className="btn" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Adding…' : 'Add to Waitlist'}
          </button>
        </div>
      </form>
    </div>
  );
}