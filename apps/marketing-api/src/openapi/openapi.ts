import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

export function loadOpenApiSpec() {
  const specPath = path.resolve(__dirname, '../../../..', 'openapi', 'openapi.yaml');
  const raw = fs.readFileSync(specPath, 'utf-8');
  return yaml.parse(raw);
}
