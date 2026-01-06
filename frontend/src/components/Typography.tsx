import * as Icons from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { ComponentProps } from 'react'
import { Link, LinkProps, NavLink, NavLinkProps } from 'react-router-dom'

type StyledNavLinkProps = NavLinkProps & {
  className?: string
}

export function StyledNavLink(props: StyledNavLinkProps) {
  return (
    <NavLink
      {...props}
      className={({ isActive }) => {
        const base =
          'px-6 py-2 border-b border-b-accent-1 text-main-fg min-w-[70px] text-center hover:text-main-fg hover:bg-accent-3 font-display'
        const active = isActive ? ' border-b-4' : ''
        return `${base}${active}`
      }}
    />
  )
}

export function StyledLink({ ...props }: LinkProps) {
  return <Link {...props} className="text-accent-2 font-display text-lg" />
}

type ButtonVariant = 'default' | 'alert'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  iconBefore?: React.ReactNode
  iconAfter?: React.ReactNode
}

export function Button({
  children,
  variant = 'default',
  className = '',
  iconBefore,
  iconAfter,
  ...props
}: ButtonProps) {
  const baseClasses =
    'px-3 py-1 cursor-pointer font-display inline-flex items-center gap-2'
  let variantClasses = ''

  if (variant === 'default') {
    variantClasses = 'text-main-fg bg-accent-1 hover:bg-accent-2'
  } else if (variant === 'alert') {
    variantClasses = 'bg-accent-2 text-white hover:bg-red-700'
  }

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {iconBefore && <>{iconBefore}</>}
      {children}
      {iconAfter && <>{iconAfter}</>}
    </button>
  )
}

type PVariant = 'default' | 'alert' | 'smaller' | 'larger'

type PProps = React.ParamHTMLAttributes<HTMLParagraphElement> & {
  variant?: PVariant
  className?: string
}

export function P({ variant = 'default', className = '', ...props }: PProps) {
  const baseClasses = 'font-display'
  let variantClasses = ''

  if (variant === 'default') {
    variantClasses = 'text-main-fg text-lg'
  } else if (variant === 'alert') {
    variantClasses = 'text-accent-1 text-lg'
  } else if (variant === 'smaller') {
    variantClasses = 'text-main-fg text-s'
  } else if (variant === 'larger') {
    variantClasses = 'text-main-fg text-2xl'
  }
  return (
    <p {...props} className={`${baseClasses} ${variantClasses} ${className}`} />
  )
}

export function H1({
  ...props
}: React.ParamHTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      {...props}
      className="my-3 text-4xl text-main-fg font-heading uppercase md:text-left text-center"
    />
  )
}

export function H2({
  ...props
}: React.ParamHTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className="text-3xl text-accent-2 my-2 font-heading uppercase md:text-left text-center"
    />
  )
}

export function H3({
  ...props
}: React.ParamHTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className="text-2xl text-main-fg my-2 font-bold md:text-left text-center"
    />
  )
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: 'full' | 'inline'
}

export function Input({ variant = 'full', ...props }: InputProps) {
  let variantClasses = ''
  if (variant === 'full') {
    variantClasses = 'w-full'
  } else if (variant === 'inline') {
    variantClasses = 'inline mr-2'
  }

  return (
    <input
      {...props}
      className={`text-main-fg bg-accent-1 px-4 py-1 my-1 ${variantClasses}`}
    />
  )
}

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  className?: string
}

export function Label({ className = '', ...props }: LabelProps) {
  return (
    <label {...props} className={`font-display text-main-fg ${className}`} />
  )
}

export function Select({
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="text-main-fg bg-accent-1 px-4 py-2" {...props} />
}

interface TableProps {
  headers?: string[] | React.ReactNode[]
  rows: (string | number | React.ReactNode)[][]
  className?: string
}

export const Table: React.FC<TableProps> = ({
  headers,
  rows,
  className = '',
}) => {
  return (
    <div className="overflow-x-scroll">
      <table
        className={`my-4 table-auto font-display text-main-fg ${className}`}
      >
        {headers && (
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="bg-accent-3 px-4 text-left py-1">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-4 py-1 ${
                    colIndex === 0 || colIndex === 1 ? 'md:min-w-[200px]' : ''
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type tagItemVariants = 'default' | 'alert'

export function TagItem({
  children,
  title = '',
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode
  title?: string
  variant?: tagItemVariants
  className?: string
}) {
  let bgCol
  if (variant === 'default') {
    bgCol = 'bg-accent-3'
  } else if (variant === 'alert') {
    bgCol = 'bg-accent-1'
  }

  return (
    <span
      title={title}
      className={`${bgCol} text-main-fg py-1 px-3 text-center rounded-lg content-center ${className}`}
    >
      {children}
    </span>
  )
}

interface LucideIconProps extends ComponentProps<'svg'> {
  name: keyof typeof Icons
  size?: number
  strokeWidth?: number
  className?: string
  colorClassName?: string
  title?: string
  prefix?: string | number | null
}

export function LucideIconWrapper({
  name,
  size = 24,
  strokeWidth = 2,
  className = '',
  colorClassName = 'text-accent-1',
  title = '',
  prefix = null,

  ...props
}: LucideIconProps) {
  const IconComponent = Icons[name] as LucideIcon

  if (!IconComponent) {
    console.warn(`Lucide Icon "${name}" does not exist.`)
    return null
  }

  return (
    <div className={`${colorClassName} flex ${className}`} title={title}>
      {prefix !== null && <span className="text-lg font-bold">{prefix}</span>}
      <IconComponent size={size} strokeWidth={strokeWidth} {...props} />
    </div>
  )
}

export function Spacer() {
  return <span className="text-3xl mx-3">|</span>
}
