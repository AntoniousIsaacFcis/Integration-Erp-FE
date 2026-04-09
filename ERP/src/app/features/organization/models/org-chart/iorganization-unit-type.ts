export interface IOrganizationUnitType {
  id: string;
  name: string;

  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
}

export type ICreateOrganizationUnitType = Pick<IOrganizationUnitType, 'name'>;

export type IUpdateOrganizationUnitType = Pick<IOrganizationUnitType, 'name'>;
