import { useNavigate } from "react-router-dom";

const HomeAdmin = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Panel de Administración</h1>

      <button onClick={() => navigate("/conductores")}>
        Gestionar Conductores
      </button>
    </div>
  );
};

export default HomeAdmin;