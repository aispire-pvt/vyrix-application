// Reusable CTA button.
// variant: 'primary' (white bg / black text) | 'outline' (grey border / white text)
export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  className = '',
}) {
  const base =
    'flex h-[60px] w-full items-center justify-center gap-3 rounded-11 font-sf text-[20px] font-[590] transition-colors disabled:cursor-not-allowed disabled:opacity-50'

  const variants = {
    primary: 'bg-white text-black hover:bg-white/90',
    outline: 'border border-vyrix-outline text-white hover:bg-white/5',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
