export type NavItem = {
  title: string;
  href: string;
  icon: string;
  children?: NavItem[];
};

export type TableColumn<T> = {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

// Auth
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  permissions: string[];
};
