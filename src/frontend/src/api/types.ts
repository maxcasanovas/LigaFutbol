export type Rol = 'Admin' | 'Editor' | 'Lector';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  expiraEn: string;
  email: string;
  rol: Rol;
}
