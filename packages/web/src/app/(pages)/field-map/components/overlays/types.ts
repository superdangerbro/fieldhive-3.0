export interface Filters {
  statuses: string[];
  types: string[];
}

export interface LayersControlProps {
  showFieldEquipment: boolean;
  onToggleFieldEquipment: (event: React.ChangeEvent<HTMLInputElement>) => void;
  propertyFilters: Filters;
  onPropertyFiltersChange: (filters: Filters) => void;
  activePropertyId?: string;
}

export interface PropertyFiltersProps {
  isExpanded: boolean;
  onExpandToggle: () => void;
  propertyFilters: Filters;
  onPropertyFiltersChange: (filters: Filters) => void;
}

export interface PropertyOptions {
  statuses: string[];
  types: string[];
}
