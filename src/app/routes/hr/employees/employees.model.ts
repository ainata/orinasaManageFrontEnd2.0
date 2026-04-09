export interface RoleDTO {
  id: number;
  name: string;
  description?: string;
  code?: string;
}

export interface CompanyDTO {
  id: number;
  code: string;
  domain: string;
  enabled: boolean;
}

export interface DepartmentDTO {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface ActivityDTO {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface PositionDTO {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  gender?: string;
  email: string;
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  photo?: string | null;
  cin?: string;
  maritalStatus?: string;
  childrenCount?: number;
  company?: CompanyDTO;
  department?: DepartmentDTO;
  activity?: ActivityDTO;
  position?: PositionDTO;
  status?: string;
  enabled: boolean;
  username?: string;
  userRoles?: any[];
  documents?: any[];
  createdAt?: string;
}

// Request Models
export interface CreateUserRequest {
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  companyIds?: number[];
  roleIds?: number[];
}

export interface UpdateUserRequest {
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  companyIds?: number[];
  roleIds?: number[];
}

export interface UpdateUserStatusRequest {
  status: boolean;
}

// Pagination & Search Payload models
export interface SearchRequest {
  keyword?: string;
  fields?: string[];
}

export interface FilterRequest {
  operator?: string;
  filters?: { field: string; value: any }[];
}

export interface SortRequest {
  property: string;
  direction: 'ASC' | 'DESC';
}

export interface SliceRequest {
  page: number;
  size: number;
}

export interface SearchPayload {
  search?: SearchRequest;
  filter?: FilterRequest;
  sort?: SortRequest;
  slice?: SliceRequest;
}

export interface PageSummary {
  filteredCount: number;
  page: number;
  size: number;
}

export interface PageResponse<T> {
  data: T[];
  summary: PageSummary;
}
