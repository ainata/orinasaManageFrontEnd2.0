export interface UserRole {
  id?: number | string;
  name?: string;
  displayName?: string;
  defaultRoute?: string;
  menus?: any[];
  permissions?: string[];
  [prop: string]: any;
}

export interface User {
  [prop: string]: any;

  id?: number | string | null;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  employeeCode?: string;
  photo?: string | null;
  status?: string;
  avatar?: string;
  roles?: UserRole[];
  permissions?: any[];
}

export interface Token {
  [prop: string]: any;

  access_token: string;
  token_type?: string;
  expires_in?: number;
  exp?: number;
  refresh_token?: string;
  token?: string;
  user?: User;
}
