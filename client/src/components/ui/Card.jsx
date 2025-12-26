import clsx from 'clsx';
export default function Card({ children, className = '', hover = false, ...props }) {
  return <div className={clsx('card bg-base-200 shadow-xl', className, { 'hover:shadow-2xl': hover })} {...props}>{children}</div>;
}
export function CardBody({ children }) { return <div className="card-body">{children}</div>; }
export function CardTitle({ children }) { return <h2 className="card-title">{children}</h2>; }
export function CardActions({ children }) { return <div className="card-actions justify-end">{children}</div>; }
