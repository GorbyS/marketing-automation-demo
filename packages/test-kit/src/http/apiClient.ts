import { fetch } from 'undici';
import { getBaseUrl } from '../config/config';

export type ApiResponse<T> = { status: number; json: T };

export class ApiClient {
  constructor(private readonly baseUrl = getBaseUrl()) {}

  async get<T>(path: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    });
    const json = (await res.json()) as T;
    return { status: res.status, json };
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as T;
    return { status: res.status, json };
  }

  async put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as T;
    return { status: res.status, json };
  }
}
