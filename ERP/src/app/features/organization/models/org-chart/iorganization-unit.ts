export interface IOrganizationUnit {
  id: string;         // Guid in C#
  code: string;
  name: string;
  typeId: string;     // Guid linking to OrganizationUnitType: Company, Branch, Division, Department, Section, Team
  levelId: string;    // Guid linking to OrganizationUnitLevel: org-chart depth/rank
  isActive: boolean;

  //Audit Properties
  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
  lastModifierId?: string;
}

export type ICreateOrganizationUnit = Omit<
  IOrganizationUnit,
  'id' | 'isActive' | 'creationTime' | 'creatorId' | 'lastModificationTime' | 'lastModifierId'
>;

export type IUpdateOrganizationUnit = Omit<
  IOrganizationUnit,
  'id' | 'creationTime' | 'creatorId' | 'lastModificationTime' | 'lastModifierId'
>;
