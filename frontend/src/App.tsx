import React, { useState } from 'react';

export function App() {
  const [activeTab, setActiveTab] = useState<'docs' | 'users' | 'audit'>('docs');

  // Auth State
  const [email, setEmail] = useState('admin@securedocs.com');
  const [password, setPassword] = useState('admin2024!');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  // Response Console State
  const [apiResponse, setApiResponse] = useState<any>(null);

  // Forms State
  const [docId, setDocId] = useState('1');
  const [nuevoDoc, setNuevoDoc] = useState({ titulo: 'Informe Q3', contenido: 'Datos clasificados', departamento: 'FINANZAS', nivel_clasificacion: 'CONFIDENCIAL' });
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: 'Juan Perez', email: 'juan@securedocs.com', password: 'Password123!', rol_id: '2', departamento: 'FINANZAS', nivel_clearance: 'CONFIDENCIAL' });

  // Generic API Helper
  const callApi = async (url: string, method: string, body?: any) => {
    setError('');
    setApiResponse(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const options: RequestInit = { method, headers };
      if (body) options.body = JSON.stringify(body);

      const res = await fetch(`http://localhost:4000/api${url}`, options);
      const data = await res.json();
      setApiResponse({ status: res.status, url: `${method} ${url}`, data });
    } catch {
      setError(`Error al conectar con la ruta ${method} ${url}`);
    }
  };

  // Auth Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
      } else {
        setError(data.message || 'Credenciales inválidas');
      }
    } catch {
      setError('No se pudo conectar con el servidor backend');
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <header className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary border-opacity-25">
        <div>
          <h3 className="fw-bold m-0 text-white d-flex align-items-center gap-2">
            <i className="fa-solid fa-shield-halved text-primary"></i> SecureDocs DMS
          </h3>
          <small className="text-secondary font-mono">Control Panel (RBAC / ABAC Security Framework)</small>
        </div>
        <div>
          {token ? (
            <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-25 px-3 py-2 font-mono">
              <i className="fa-solid fa-circle-check me-1"></i> JWT AUTENTICADO
            </span>
          ) : (
            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-2 font-mono">
              <i className="fa-solid fa-lock me-1"></i> NO AUTENTICADO
            </span>
          )}
        </div>
      </header>

      <div className="row g-4">
        {/* Left Column: Login & Console */}
        <div className="col-lg-4">
          {/* Login Card */}
          <div className="card-dark mb-4">
            <div className="card-header-dark text-primary font-mono d-flex justify-content-between align-items-center">
              <span>POST /auth/login</span>
              <i className="fa-solid fa-key"></i>
            </div>
            <div className="p-3">
              <form onSubmit={handleLogin}>
                <div className="mb-2">
                  <label className="form-label text-secondary small mb-1">Email:</label>
                  <input type="email" className="form-control form-control-dark" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label text-secondary small mb-1">Contraseña:</label>
                  <input type="password" className="form-control form-control-dark" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary btn-sm w-100 font-mono">
                  Iniciar Sesión
                </button>
              </form>
              {token && (
                <div className="mt-3 p-2 rounded bg-black bg-opacity-50 border border-success border-opacity-25 font-mono text-break small text-success">
                  <small className="d-block text-secondary">Token Activo:</small>
                  {token.substring(0, 32)}...
                </div>
              )}
            </div>
          </div>

          {/* Console Card */}
          <div className="card-dark">
            <div className="card-header-dark text-white font-mono d-flex justify-content-between align-items-center">
              <span>RESPUESTA HTTP</span>
              {apiResponse && (
                <span className={`badge ${apiResponse.status < 300 ? 'bg-success' : 'bg-danger'}`}>
                  HTTP {apiResponse.status}
                </span>
              )}
            </div>
            <div className="p-3">
              {error && <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger p-2 small font-mono">{error}</div>}
              {apiResponse ? (
                <div>
                  <div className="text-info font-mono small mb-2">{apiResponse.url}</div>
                  <pre className="code-block p-3 mb-0" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {JSON.stringify(apiResponse.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-secondary font-mono small text-center py-4">
                  Ejecuta una acción para ver la respuesta JSON.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: API Services Tabs */}
        <div className="col-lg-8">
          <ul className="nav nav-tabs-dark mb-3">
            <li className="nav-item">
              <button className={`nav-link font-mono ${activeTab === 'docs' ? 'active' : ''}`} onClick={() => setActiveTab('docs')}>
                <i className="fa-regular fa-file-lines me-1"></i> Documentos
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link font-mono ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                <i className="fa-solid fa-users me-1"></i> Usuarios
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link font-mono ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
                <i className="fa-solid fa-list-check me-1"></i> Auditoría
              </button>
            </li>
          </ul>

          {/* DOCUMENTOS */}
          {activeTab === 'docs' && (
            <div className="d-flex flex-column gap-3">
              <div className="card-dark p-3 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="m-0 text-white">Listado General</h6>
                  <small className="text-secondary">GET /documentos (Filtra por permisos del usuario)</small>
                </div>
                <button className="btn btn-outline-primary btn-sm font-mono" onClick={() => callApi('/documentos', 'GET')}>
                  Consultar Lista
                </button>
              </div>

              <div className="card-dark p-3">
                <h6 className="text-white mb-2">Operaciones por ID</h6>
                <div className="input-group input-group-sm mb-3">
                  <span className="input-group-text bg-dark text-secondary border-secondary font-mono">ID Documento</span>
                  <input type="number" className="form-control form-control-dark" value={docId} onChange={e => setDocId(e.target.value)} />
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button className="btn btn-outline-info btn-sm font-mono" onClick={() => callApi(`/documentos/${docId}`, 'GET')}>
                    GET /:id
                  </button>
                  <button className="btn btn-outline-warning btn-sm font-mono" onClick={() => callApi(`/documentos/${docId}`, 'PUT', { titulo: 'Documento Modificado' })}>
                    PUT /:id
                  </button>
                  <button className="btn btn-outline-success btn-sm font-mono" onClick={() => callApi(`/documentos/${docId}/aprobar`, 'POST')}>
                    POST /:id/aprobar
                  </button>
                  <button className="btn btn-outline-danger btn-sm font-mono" onClick={() => callApi(`/documentos/${docId}`, 'DELETE')}>
                    DELETE /:id
                  </button>
                </div>
              </div>

              <div className="card-dark p-3">
                <h6 className="text-white mb-3">Crear Nuevo Expediente</h6>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label text-secondary small mb-1">Título:</label>
                    <input className="form-control form-control-dark" value={nuevoDoc.titulo} onChange={e => setNuevoDoc({...nuevoDoc, titulo: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-secondary small mb-1">Departamento:</label>
                    <input className="form-control form-control-dark" value={nuevoDoc.departamento} onChange={e => setNuevoDoc({...nuevoDoc, departamento: e.target.value})} />
                  </div>
                </div>
                <button className="btn btn-primary btn-sm font-mono" onClick={() => callApi('/documentos', 'POST', nuevoDoc)}>
                  POST /documentos
                </button>
              </div>
            </div>
          )}

          {/* USUARIOS */}
          {activeTab === 'users' && (
            <div className="d-flex flex-column gap-3">
              <div className="card-dark p-3 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="m-0 text-white">Directorio de Usuarios</h6>
                  <small className="text-secondary">GET /usuarios</small>
                </div>
                <button className="btn btn-outline-primary btn-sm font-mono" onClick={() => callApi('/usuarios', 'GET')}>
                  Consultar Usuarios
                </button>
              </div>

              <div className="card-dark p-3">
                <h6 className="text-white mb-3">Registrar Usuario</h6>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label text-secondary small mb-1">Nombre:</label>
                    <input className="form-control form-control-dark" value={nuevoUsuario.nombre} onChange={e => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-secondary small mb-1">Email:</label>
                    <input className="form-control form-control-dark" value={nuevoUsuario.email} onChange={e => setNuevoUsuario({...nuevoUsuario, email: e.target.value})} />
                  </div>
                </div>
                <button className="btn btn-primary btn-sm font-mono" onClick={() => callApi('/usuarios', 'POST', nuevoUsuario)}>
                  POST /usuarios
                </button>
              </div>

              <div className="card-dark p-3 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="m-0 text-white">Actualizar Usuario #2</h6>
                  <small className="text-secondary">PUT /usuarios/2</small>
                </div>
                <button className="btn btn-outline-warning btn-sm font-mono" onClick={() => callApi('/usuarios/2', 'PUT', { nombre: 'Nombre Actualizado' })}>
                  PUT /usuarios/2
                </button>
              </div>
            </div>
          )}

          {/* AUDITORÍA */}
          {activeTab === 'audit' && (
            <div className="card-dark p-4">
              <h6 className="text-white mb-1">Trazas de Auditoría</h6>
              <p className="text-secondary small mb-3">
                Obtiene los registros de eventos guardados por el middleware de auditoría en PostgreSQL.
              </p>
              <button className="btn btn-primary btn-sm font-mono" onClick={() => callApi('/auditoria', 'GET')}>
                GET /auditoria
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;