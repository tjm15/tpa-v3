import Dexie, { type Table } from 'dexie';

export interface Settings {
  id?: number;
  key: string;
  value: any;
  updatedAt: Date;
}

export interface PlanChunk {
  id: string;
  text: string;
  pageNumber: number;
  planId: string;
  vector?: Float32Array;
  metadata?: {
    section?: string;
    policy?: string;
    coordinates?: [number, number];
  };
  createdAt: Date;
}

export interface Plan {
  id: string;
  title: string;
  filename: string;
  fileSize: number;
  uploadedAt: Date;
  processedAt?: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  chunkCount?: number;
  metadata?: {
    council?: string;
    planType?: string;
    adoptionDate?: Date;
  };
}

export interface Site {
  id: string;
  name: string;
  reference?: string;
  uprn?: string;
  boundary: GeoJSON.Polygon;
  area: number; // hectares
  status: 'draft' | 'allocated' | 'rejected' | 'completed';
  constraints: string[];
  deliverability: {
    housing: number;
    netZero: number;
    jobs: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  relatedPolicies: string[];
  relatedSites: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  isBaseline: boolean;
  metrics: {
    homes: number;
    jobs: number;
    co2: number;
    [key: string]: number;
  };
  siteAllocations: {
    siteId: string;
    allocated: boolean;
    units?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export class PlannerDatabase extends Dexie {
  settings!: Table<Settings>;
  plans!: Table<Plan>;
  chunks!: Table<PlanChunk>;
  sites!: Table<Site>;
  goals!: Table<Goal>;
  scenarios!: Table<Scenario>;

  constructor() {
    super('PlannerDatabase');
    this.version(1).stores({
      settings: '++id, key, updatedAt',
      plans: 'id, title, filename, uploadedAt, status',
      chunks: 'id, planId, pageNumber, createdAt',
      sites: 'id, name, reference, uprn, status, createdAt, updatedAt',
      goals: 'id, title, status, deadline, createdAt, updatedAt',
      scenarios: 'id, name, isBaseline, createdAt, updatedAt'
    });
  }
}

export const db = new PlannerDatabase();
