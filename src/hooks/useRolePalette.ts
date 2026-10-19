import { useAuth } from '@/context/AuthContext';
import { getRolePalette } from '@/theme/rolePalettes';

export function useRolePalette() {
  const { session } = useAuth();
  return getRolePalette(session?.user.role);
}
