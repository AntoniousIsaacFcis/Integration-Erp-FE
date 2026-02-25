export interface INationality {
  code: string;
  nameAr: string;
  nameEn: string;
}


export interface INationalityView extends INationality {
  displayName: string;
}
