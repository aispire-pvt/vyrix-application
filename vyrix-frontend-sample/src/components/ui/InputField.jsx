// Reusable dark input field with a label above (matches Figma #1e1e1e fields).
// Props: label, placeholder, type, value, onChange, rightIcon, className, inputClassName
export default function InputField({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  rightIcon,
  className = '',
  inputClassName = '',
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-2 font-sf text-[16px] font-[590] text-vyrix-label">
          {label}
        </label>
      )}
      <div className="relative flex h-[60px] w-full items-center rounded-11 bg-vyrix-input px-[22px]">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full bg-transparent font-sf text-[16px] text-white placeholder:text-vyrix-placeholder ${
            rightIcon ? 'pr-9' : ''
          } ${inputClassName}`}
        />
        {rightIcon && (
          <span className="absolute right-[22px] top-1/2 -translate-y-1/2">
            {rightIcon}
          </span>
        )}
      </div>
    </div>
  )
}
