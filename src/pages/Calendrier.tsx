import React from 'react'
import PlanificationTable from '../components/PlanificationTable'

const Calendrier: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📆 Vue des planifications</h1>
      <PlanificationTable />
    </div>
  )
}

export default Calendrier
