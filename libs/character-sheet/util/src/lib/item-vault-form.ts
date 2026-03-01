export interface ItemVaultEntry {
  id: string;
  name: string;
  description: string;
  imageBase64: string | null;
}

export interface ItemVaultApiModel {
  username: string;
  items: ItemVaultEntry[];
}
