export interface IOrganizationHierarchy {
  id: string;
  parentId: string;
  childId: string;
}

export type ICreateOrganizationHierarchy = Omit<IOrganizationHierarchy, 'id'>;

export type IUpdateOrganizationHierarchy = Omit<IOrganizationHierarchy, 'id'>;//send in url
