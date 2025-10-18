import { db } from '@/db/client';
import { useEffect, useState } from 'react';

export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        
        // Check if database is already initialized
        if (db.isInitialized()) {
          setIsInitialized(true);
          setIsInitializing(false);
          return;
        }

        // Initialize database
        await db.init();
        setIsInitialized(true);
      } catch (err) {
        console.error('Database initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
      } finally {
        setIsInitializing(false);
      }
    };

    initDatabase();
  }, []);

  return {
    isInitialized,
    isInitializing,
    error,
    retry: () => {
      setIsInitialized(false);
      setIsInitializing(true);
      setError(null);
    }
  };
}
