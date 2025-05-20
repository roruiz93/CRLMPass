import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'


export function exportToExcel(data, filename = 'Exportacion') {
  // Crear hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')

  // Generar archivo Excel
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  // Descargar el archivo
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = `${filename}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportToPDF(data, filename = 'Exportacion') {
  const doc = new jsPDF()

  // Títulos de columnas
  const columns = ['Fecha', 'Nombre', 'Tipo', 'Monto']

  // Filas de datos
  const rows = data.map(row => [
    new Date(row.fecha).toLocaleDateString(),
    row.nombre,
    row.tipo,
    `$${row.monto.toFixed(2)}`
  ])

  // Título
  doc.setFontSize(14)
  doc.text(filename.replace(/_/g, ' '), 14, 20)

  // Tabla con AutoTable
  autoTable(doc, {
    startY: 30,
    head: [columns],
    body: rows
  })

  // Descargar el PDF
  doc.save(`${filename}.pdf`)
}
