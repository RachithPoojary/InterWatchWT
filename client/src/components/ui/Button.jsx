import clsx from 'clsx';
export default function Button({ children, variant = 'primary', size = 'md', loading = false, disabled = false, className = '', ...props }) {
  return (
    <button className={clsx('btn', `btn-${variant}`, `btn-${size}`, className, { 'loading': loading })} disabled={disabled || loading} {...props}>
      {loading ? <span className="loading loading-spinner"></span> : children}
    </button>
  );
}
