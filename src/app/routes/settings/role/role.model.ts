export interface Role {
  id?: number;
  name: string;
  displayName: string;
  description?: string;
  defaultRoute?: string;
}

export interface BackendMenu {
  id: number;
  title: string;
  type: string;
  icon?: string;
  link?: string;
  subtitle?: string;
  enabled: boolean;
  parentId?: number;
  parent?: BackendMenu;
  children?: BackendMenu[];
}
