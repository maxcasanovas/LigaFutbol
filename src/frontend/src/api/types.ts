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

export interface CrearUsuarioDto {
  email: string;
  password: string;
  rol: Rol;
}

export interface CiudadResumenDto {
  id: number;
  nombre: string;
}

export interface EquipoResumenDto {
  id: number;
  nombre: string;
  urlEscudo: string;
}

export interface PaisDto {
  id: number;
  nombre: string;
  urlBandera: string;
  ciudades: CiudadResumenDto[];
}

export interface CiudadDto {
  id: number;
  nombre: string;
  paisId: number;
  pais: string;
  equipos: EquipoResumenDto[];
}

export interface LigaDto {
  id: number;
  nombre: string;
  paisId: number;
  pais: string;
  equipos: EquipoResumenDto[];
  fechaCreacion: string;
}

export interface EquipoDto {
  id: number;
  nombre: string;
  urlEscudo: string;
  ciudadId: number;
  ciudad: string;
  ligaId: number;
  liga: string;
  fechaCreacion: string;
}
