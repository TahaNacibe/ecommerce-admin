import React from 'react';
import { Search } from 'lucide-react';

interface CustomInputProps {
  label: string;
  helperText?: string;
  importantNote?: string;
  icon?: React.ReactNode;
  error?: string;
  isActive?: boolean
  id: string;
  placeholder?: string;
  value: string;
  steps?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number';
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  helperText,
  icon = <Search className="w-4 h-4 text-gray-500" />,
  error,
  id,
  isActive = true,
  importantNote = "",
  placeholder,
  value,
  steps,
  onChange,
  type = 'text'
}) => {
  // Handle input validation based on steps
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (type === 'number' && steps !== undefined) {
      // For steps="0", only allow integers
      if (steps === "0") {
        if (/^\d*$/.test(newValue)) {
          onChange(e);
        }
        return;
      }

      // For steps like "0.01", allow decimal numbers with correct precision
      const decimals = steps.split('.')[1]?.length || 0;
      const regex = new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`);
      
      if (regex.test(newValue) || newValue === '') {
        onChange(e);
      }
    } else {
      onChange(e);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label
        htmlFor={id}
        className="text-sm font-semibold pr-1 text-gray-600"
      >
        {label}
      </label>

      {/* Input container */}
      <div className="relative text-black">
        {/* Icon container */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {icon}
        </div>

        {/* Input field */}
        <input
          type={type}
          min={0}
          disabled = {isActive? false : true}
          step={steps}
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`
            w-full
            pl-10
            pr-4
            py-3
            rounded-lg
            border
            bg-white
            placeholder-gray-400
            text-sm
            transition-colors
            duration-200
            ${error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            focus:outline-none
            focus:ring-2
            focus:ring-opacity-50
          `}
        />
      </div>

      {/* Helper or Error text */}
      {(helperText || error) && (
        <p className={`text-xs font-medium ml-2 ${error ? 'text-red-500' : 'text-gray-400'}`}>
          {error || <>
            <strong className='text-black'>
              {importantNote}
            </strong> {helperText}
          </>}
        </p>
      )}
    </div>
  );
};

export default CustomInput;