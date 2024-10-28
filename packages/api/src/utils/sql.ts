/**
 * SQL query builder utility to ensure consistent formatting and prevent syntax errors
 */

type SQLValue = string | number | boolean | null | undefined;

interface SQLField {
    name: string;
    alias?: string;
}

const INDENT = '    ';
const DOUBLE_INDENT = INDENT + INDENT;

const quote = (str: string) => `'${str}'`;

export const sql = {
    /**
     * Format a list of fields for SELECT statements
     */
    fields: (fields: SQLField[]): string => {
        return fields
            .map(f => f.alias ? `${f.name} as "${f.alias}"` : f.name)
            .join(',\n' + INDENT);
    },

    /**
     * Build a jsonb_build_object with proper formatting
     */
    jsonBuildObject: (pairs: Record<string, string>): string => {
        const entries = Object.entries(pairs)
            .map(([key, value]) => `${quote(key)}, ${value}`)
            .join(',\n' + DOUBLE_INDENT);
        
        return [
            'jsonb_build_object(',
            DOUBLE_INDENT + entries,
            INDENT + ')'
        ].join('\n');
    },

    /**
     * Build a json_build_object with proper formatting
     */
    jsonObject: (pairs: Record<string, string>): string => {
        const entries = Object.entries(pairs)
            .map(([key, value]) => `${quote(key)}, ${value}`)
            .join(',\n' + DOUBLE_INDENT);
        
        return [
            'json_build_object(',
            DOUBLE_INDENT + entries,
            INDENT + ')'
        ].join('\n');
    },

    /**
     * Build a json_agg with proper formatting
     */
    jsonAgg: (expr: string, filter?: string): string => {
        let result = `json_agg(${expr})`;
        if (filter) {
            result += ` FILTER (WHERE ${filter})`;
        }
        return result;
    },

    /**
     * Safely concatenate strings with CONCAT_WS
     */
    concatWs: (separator: string, ...values: string[]): string => {
        const safeValues = values.map(v => `NULLIF(${v}, ${quote('')})`);
        return `NULLIF(CONCAT_WS(${quote(separator)}, ${safeValues.join(', ')}), ${quote('')})`;
    },

    /**
     * Format parameters for parameterized queries
     */
    param: (index: number): string => `$${index}`,

    /**
     * Wrap a value in COALESCE with a default
     */
    coalesce: (value: string, defaultValue: string): string => {
        return `COALESCE(${value}, ${defaultValue})`;
    },

    /**
     * Build a CASE expression
     */
    case: (conditions: Array<{ when: string; then: string }>, elseValue?: string): string => {
        const whenClauses = conditions
            .map(c => INDENT + `WHEN ${c.when} THEN ${c.then}`)
            .join('\n');
        
        return [
            'CASE',
            whenClauses,
            elseValue ? INDENT + `ELSE ${elseValue}` : '',
            'END'
        ].filter(Boolean).join('\n');
    },

    /**
     * Build a GROUP BY clause
     */
    groupBy: (fields: string[]): string => {
        return fields.join(',\n' + INDENT);
    },

    /**
     * Build an ORDER BY clause
     */
    orderBy: (fields: Array<{ field: string; direction?: 'ASC' | 'DESC' }>): string => {
        return fields
            .map(f => `${f.field}${f.direction ? ` ${f.direction}` : ''}`)
            .join(', ');
    },

    /**
     * Build a LEFT JOIN clause
     */
    leftJoin: (table: string, alias: string, on: string): string => {
        return `LEFT JOIN ${table} ${alias} ON ${on}`;
    },

    /**
     * Build a WHERE clause
     */
    where: (conditions: string[]): string => {
        return conditions.join(' AND ');
    },

    /**
     * Build a LIMIT OFFSET clause
     */
    limitOffset: (limit: number | string, offset: number | string): string => {
        return `LIMIT ${limit} OFFSET ${offset}`;
    },

    /**
     * Format a complete SELECT query
     */
    select: (params: {
        fields: SQLField[];
        from: string;
        joins?: string[];
        where?: string;
        groupBy?: string[];
        orderBy?: Array<{ field: string; direction?: 'ASC' | 'DESC' }>;
        limit?: number | string;
        offset?: number | string;
    }): string => {
        const parts = [
            'SELECT',
            sql.fields(params.fields),
            `FROM ${params.from}`
        ];

        if (params.joins?.length) {
            parts.push(params.joins.join('\n'));
        }

        if (params.where) {
            parts.push(`WHERE ${params.where}`);
        }

        if (params.groupBy?.length) {
            parts.push(`GROUP BY ${sql.groupBy(params.groupBy)}`);
        }

        if (params.orderBy?.length) {
            parts.push(`ORDER BY ${sql.orderBy(params.orderBy)}`);
        }

        if (params.limit !== undefined) {
            parts.push(sql.limitOffset(params.limit, params.offset || 0));
        }

        return parts.join('\n');
    }
};
