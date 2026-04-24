import { Routes, Route } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';

const App = () => {
  return (
    <Routes>
      {AppRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};

export default App;
