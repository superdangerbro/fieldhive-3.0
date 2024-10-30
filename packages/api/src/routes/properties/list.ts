import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';

interface QueryParams {
  lat?: string;
  lng?: string;
  bounds?: string; // [west, south, east, north]
  search?: string;
}

export async function listProperties(req: Request<Record<string, never>, unknown, unknown, QueryParams>, res: Response) {
  try {
    const { lat, lng, bounds, search } = req.query;
    const latNum = lat ? parseFloat(lat) : undefined;
    const lngNum = lng ? parseFloat(lng) : undefined;
    let boundsArray: number[] | undefined;
    
    try {
      if (bounds) {
        const parsed = JSON.parse(bounds);
        if (Array.isArray(parsed) && parsed.length === 4 && parsed.every(n => typeof n === 'number')) {
          boundsArray = parsed;
        }
      }
    } catch (e) {
      console.error('Error parsing bounds:', e);
    }

    const query = `
      SELECT
        p.property_id AS id,
        p.name,
        p.type,
        p.status,
        CONCAT_WS(' ', p.address1, p.address2, p.city, p.province, p.postal_code, p.country) AS address,
        ST_AsGeoJSON(p.location)::jsonb AS location,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'accountId', a.account_id,
              'name', a.name
            )
          ) FILTER (WHERE a.account_id IS NOT NULL),
          '[]'::json
        ) AS accounts
      FROM properties p
      LEFT JOIN properties_accounts_join paj ON paj.property_id = p.property_id
      LEFT JOIN accounts a ON a.account_id = paj.account_id
      ${boundsArray ? `
        WHERE ST_Intersects(
          p.location,
          ST_MakeEnvelope($1, $2, $3, $4, 4326)
        )
      ` : ''}
      GROUP BY
        p.property_id,
        p.name,
        p.type,
        p.status,
        p.address1,
        p.address2,
        p.city,
        p.province,
        p.postal_code,
        p.country,
        p.location,
        p.created_at,
        p.updated_at
      ORDER BY p.name ASC
    `;

    const params = boundsArray || [];

    console.log('Executing query:', query.replace(/\s+/g, ' ').trim());
    console.log('With params:', params);

    const result = await AppDataSource.query(query, params);

    const properties = result.map((row: any) => ({
      ...row,
      location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
      accounts: Array.isArray(row.accounts) ? row.accounts : []
    }));

    return res.json({
      properties,
      total: properties.length,
      page: 1,
      pageSize: properties.length
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
