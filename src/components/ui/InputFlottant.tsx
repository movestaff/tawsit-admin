import { useState } from 'react';
import clsx from 'clsx';

interface Option {
  value: string;
  label: string;
}

interface InputFlottantProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
  options?: Option[]; // pour les select
  error?: string;
  className?: string;
}

export default function InputFlottant({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  required,
  options,
  error,
  className = '',
}: InputFlottantProps) {
  const [focused, setFocused] = useState(false);

  const isFloating = focused || !!value;

  return (
    <div className={clsx('relative', className)}>
      {options ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          className="border rounded px-3 py-3 w-full appearance-none focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="" disabled hidden>— Sélectionner —</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          className="border rounded px-3 py-3 w-full focus:outline-none focus:ring focus:border-blue-300"
          placeholder=" "
        />
      )}

      <label
        htmlFor={id}
        className={clsx(
          'absolute left-3 px-1 bg-white text-gray-500 text-sm transition-all duration-200 pointer-events-none',
          isFloating
            ? '-top-2 text-xs text-primary'
            : 'top-1/2 -translate-y-1/2'
        )}
      >
        {label}{required && ' *'}
      </label>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
