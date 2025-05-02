// app/dashboard/components/Filtros.tsx
'use client'
import { useState, useEffect } from 'react'; // Importe os hooks aqui
import { Form } from 'react-bootstrap';

export default function Filtros({
  onFilterChange
}: {
  onFilterChange: (filtros: Record<string, any>) => void
}) {
  const [filtros, setFiltros] = useState({
    status: '',
    dataInicio: '',
    dataFim: ''
  });

  useEffect(() => {
    onFilterChange(filtros);
  }, [filtros, onFilterChange]); // Adicione onFilterChange nas dependências

  return (
    <div className="mb-3 p-3 border rounded">
      <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>
        <Form.Select
          value={filtros.status}
          onChange={(e) => setFiltros({...filtros, status: e.target.value})}
        >
          <option value="">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </Form.Select>
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Período</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="date"
            value={filtros.dataInicio}
            onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
          />
          <Form.Control
            type="date"
            value={filtros.dataFim}
            onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
          />
        </div>
      </Form.Group>
    </div>
  );
}