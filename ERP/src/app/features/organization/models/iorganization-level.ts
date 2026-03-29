export interface IOrganizationLevel {
  id: string; // Required for trackBy, editing, and deleting
  levelOrder: number;
  name: string;
  description?: string;
  // Audit properties (Read-only on Frontend)
  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
}

export type ICreateOrganizationLevel = Omit<
  IOrganizationLevel,
  'id' | 'creationTime' | 'creatorId' | 'lastModificationTime'
>;

export interface IUpdateOrganizationLevel extends ICreateOrganizationLevel {} // id passed via URL param
