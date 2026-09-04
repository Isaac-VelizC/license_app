import * as React from 'react'
import { cn } from '@/lib/utils'

// --- Root ---
function Table({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto bg-card border-none rounded-lg shadow-none">
      <table
        className={cn('w-full text-left text-sm text-foreground rounded-lg border-collapse', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

// --- Header ---
function TableHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('border-b bg-muted/50 text-xs font-medium text-muted-foreground', className)} {...props}>
      {children}
    </thead>
  )
}

// --- Body ---
function TableBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-border text-sm', className)} {...props}>
      {children}
    </tbody>
  )
}

// --- Row ---
function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'cursor-default even:bg-muted/50 dark:even:bg-muted/20 group hover:bg-muted/25 dark:hover:bg-muted/20 data-[state=selected]:bg-muted dark:data-[state=selected]:bg-muted/60 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

// --- Head Cell ---
function TableHead({
  className,
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        'px-6 py-3 text-left tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

// --- Data Cell ---
function TableCell({
  className,
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn(' px-6 py-4 whitespace-nowrap ', className)} {...props}>
      {children}
    </td>
  )
}

// --- Footer ---
function TableFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn('bg-muted border-t border-border text-sm font-medium', className)}
      {...props}
    >
      {children}
    </tfoot>
  )
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter }
