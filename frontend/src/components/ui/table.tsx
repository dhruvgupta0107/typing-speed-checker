import React from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
    variant?: 'default' | 'striped' | 'bordered';
}

export const Table: React.FC<TableProps> = ({
    children,
    variant = 'default',
    className = '',
    ...props
}) => {
    const variants = {
        default: 'min-w-full divide-y divide-[#e5e7eb]',
        striped: 'min-w-full divide-y divide-[#e5e7eb] [&>tbody>tr:nth-child(odd)]:bg-[#f9fafb]',
        bordered: 'min-w-full divide-y divide-[#e5e7eb] border border-[#e5e7eb]',
    };

    return (
        <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
            <table
                className={`${variants[variant]} ${className}`}
                {...props}
            >
                {children}
            </table>
        </div>
    );
};

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> { }

export const TableHeader: React.FC<TableHeaderProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <thead
            className={`bg-[#f9fafb] ${className}`}
            {...props}
        >
            {children}
        </thead>
    );
};

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> { }

export const TableBody: React.FC<TableBodyProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <tbody
            className={`divide-y divide-[#e5e7eb] bg-white ${className}`}
            {...props}
        >
            {children}
        </tbody>
    );
};

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    isTop?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
    children,
    isTop = false,
    className = '',
    ...props
}) => {
    return (
        <tr
            className={`
        hover:bg-[#f9fafb] transition-colors duration-200
        ${isTop ? 'bg-[#ffa116]/5' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </tr>
    );
};

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> { }

export const TableHead: React.FC<TableHeadProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <th
            className={`
        px-6 py-4 text-left text-sm font-medium text-[#6b7280]
        ${className}
      `}
            {...props}
        >
            {children}
        </th>
    );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> { }

export const TableCell: React.FC<TableCellProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <td
            className={`
        px-6 py-4 text-sm text-[#1a1a1a]
        ${className}
      `}
            {...props}
        >
            {children}
        </td>
    );
}; 