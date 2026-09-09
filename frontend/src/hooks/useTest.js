import { useContext } from 'react';
import { TestContext } from '../context/TestContext';

export const useTest = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};

export const useFeedTest = useTest;

export default useTest;
