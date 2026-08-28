import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import AppRoutes from './routes';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MotionConfig>
  );
}
