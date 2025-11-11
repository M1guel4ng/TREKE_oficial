import { api } from './client';

export type Usuario = {
  id: number;
  email: string;
  rol_id: number;
  estado: string;
  created_at: string;
  full_name?: string | null;
};

export async function listarUsuarios(): Promise<Usuario[]> {
  const r = await api.get('/api/admin/usuarios');
  return r as Usuario[];
}

export async function crearUsuario(payload: {
  email: string; full_name: string; password: string;
  acepta_terminos: boolean; rol_id?: number;
}) {
  return api.post('/api/usuarios/register', payload);
}

export async function cambiarRol(id: number, nuevoRolId: number) {
  return api.patch(`/api/admin/usuarios/${id}/rol`, { nuevoRolId });
}

export async function suspender(id: number) {
  return api.patch(`/api/admin/usuarios/${id}/suspender`);
}
export async function eliminar(id: number) {
  return api.del(`/api/admin/usuarios/${id}`);
}

export async function updatePerfil(id: number, data: { full_name: string }) {
  return api.put(`/api/usuarios/${id}/perfil`, data);
}

export async function updateEmail(id: number, email: string) {
  return api.patch(`/api/usuarios/${id}/email`, { email });
}



// Helper
export const ROL_LABEL: Record<number, string> = {
  10001: 'Usuario',
  10002: 'Emprendedor',
  10003: 'Administrador',
};
