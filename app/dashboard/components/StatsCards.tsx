// app/dashboard/components/StatsCards.tsx
interface Stats {
    total_caminhoes: number
    caminhoes_ativos: number
    viagens_mes: number
  }
  
  export default function StatsCards({ stats }: { stats: Stats }) {
    return (
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5>Total Caminhões</h5>
              <p>{stats.total_caminhoes}</p>
            </div>
          </div>
        </div>
        {/* Outros cards */}
      </div>
    )
  }