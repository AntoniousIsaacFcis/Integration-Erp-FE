export interface IOrganizationType {
  id: string;
  name: string;

  //auditing
  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
}

export type ICreateOrganizationType = Pick<IOrganizationType, 'name'>;

export type IUpdateOrganizationType = Pick<IOrganizationType, 'name'>;
