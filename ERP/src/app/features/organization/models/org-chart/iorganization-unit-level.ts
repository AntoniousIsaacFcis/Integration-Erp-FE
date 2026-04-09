export interface IOrganizationUnitLevel {
  id: string;
  levelOrder: number;
  name: string;
  description?: string;
  isActive?: boolean;

  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
}

export type ICreateOrganizationUnitLevel = Omit<
  IOrganizationUnitLevel,
  'id' | 'creationTime' | 'creatorId' | 'lastModificationTime'
>;

export interface IUpdateOrganizationUnitLevel extends ICreateOrganizationUnitLevel {}
