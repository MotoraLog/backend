import openApiSpec from '../../public/openapi.json';

type OpenApiOperation = {
  summary?: string;
  description?: string;
  requestBody?: {
    required?: boolean;
    content?: Record<string, unknown>;
  };
  responses?: Record<string, unknown>;
  parameters?: Array<{
    name: string;
    in: string;
    required?: boolean;
    schema?: {
      type?: string;
      default?: unknown;
      maximum?: number;
      format?: string;
    };
  }>;
};

type OpenApiPathItem = {
  get?: OpenApiOperation;
  post?: OpenApiOperation;
  patch?: OpenApiOperation;
  delete?: OpenApiOperation;
};

type OpenApiDocument = {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, OpenApiPathItem>;
};

const baseSpec = openApiSpec as OpenApiDocument;

export function getOpenApiDocument(baseUrl?: string): OpenApiDocument {
  return {
    ...baseSpec,
    servers: baseUrl
      ? [
        {
          url: baseUrl,
          description: 'Current environment'
        },
        ...(baseSpec.servers ?? [])
      ]
      : (baseSpec.servers ?? []).slice(),
    paths: { ...baseSpec.paths }
  };
}

export function getOpenApiEndpoints() {
  return Object.entries(baseSpec.paths).flatMap(([path, pathItem]) => {
    return Object.entries(pathItem).map(([method, operation]) => ({
      path,
      method: method.toUpperCase(),
      summary: operation?.summary ?? '',
      parameters: operation?.parameters ?? []
    }));
  });
}
