import { Inject, Injectable } from '@nestjs/common';
import { CASSANDRA_CLIENT } from '../cassandra/cassandra.provider';
import { Client } from 'cassandra-driver';
import { UrlMapping } from './url-mapping.types';

@Injectable()
export class UrlMappingRepository {
  constructor(@Inject(CASSANDRA_CLIENT) private client: Client) {}

  async save(urlMapping: UrlMapping): Promise<void> {
    const query = `
      INSERT INTO url_shortener.url_mapping 
      (short_code, long_url, redirect_type, created_at)
      VALUES (?, ?, ?, ?)
    `;

    await this.client.execute(query, [
      urlMapping.shortCode,
      urlMapping.longUrl,
      urlMapping.redirectType,
      urlMapping.createdAt,
    ]);
  }

  async findByShortCode(shortCode: string): Promise<UrlMapping | null> {
    const query = `
      SELECT short_code, long_url, redirect_type, created_at
      FROM url_shortener.url_mapping
      WHERE short_code = ?
    `;

    const result = await this.client.execute(query, [shortCode]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      shortCode: row.short_code,
      longUrl: row.long_url,
      redirectType: row.redirect_type,
      createdAt: row.created_at,
    };
  }
}
