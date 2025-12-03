import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';

// Load swagger.yaml file
const swaggerYamlPath = path.join(__dirname, '../../swagger.yaml');
const swaggerYaml = fs.readFileSync(swaggerYamlPath, 'utf8');
export const swaggerSpec = yaml.load(swaggerYaml) as any;

