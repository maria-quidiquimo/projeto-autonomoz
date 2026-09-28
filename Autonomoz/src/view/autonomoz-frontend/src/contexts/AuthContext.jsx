import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken, getStoredUser, setStoredUser } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  // Clear session on 401
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('autonomoz:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('autonomoz:unauthorized', handleUnauthorized);
  }, []);

  const login = async (matricula, senha) => {
    setLoading(true);
    try {
      const data = await api.post('/usuarios/login', { matricula, senha });
      
      const jwtToken = data.token;
      const userData = data.usuario || {
        id_usuario: data.id_usuario,
        matricula: data.matricula || matricula,
        nome: data.nome || data.nome_completo || 'Usuário',
        tipo_acesso: data.tipo_acesso || 'FUNCIONARIO',
        nome_cargo: data.nome_cargo || 'Operador',
      };

      setToken(jwtToken);
      setStoredUser(userData);
      setTokenState(jwtToken);
      setUser(userData);

      return { success: true, user: userData, message: data.mensagem };
    } catch (error) {
      return { success: false, error: error.message || 'Erro ao realizar login.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setStoredUser(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const isGerente = user?.tipo_acesso === 'GERENTE';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isGerente,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
