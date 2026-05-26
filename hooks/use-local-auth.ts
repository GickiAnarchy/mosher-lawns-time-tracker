import { useEffect, useState } from 'react';
import { getCurrentEmployee, setCurrentEmployee, getEmployeeByPin, Employee } from '@/lib/local-storage';

export function useLocalAuth() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const current = await getCurrentEmployee();
      setEmployee(current);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (pin: string): Promise<boolean> => {
    try {
      const emp = await getEmployeeByPin(pin);
      if (emp) {
        await setCurrentEmployee(emp);
        setEmployee(emp);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await setCurrentEmployee(null);
      setEmployee(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return {
    employee,
    loading,
    isAuthenticated: !!employee,
    login,
    logout,
  };
}
