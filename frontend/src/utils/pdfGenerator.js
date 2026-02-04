export class PDFGenerator {
  constructor() {
    this.content = []
    this.pageNumber = 1
    this.totalPages = 1
  }

  addHeader(title, subtitle = '') {
    const now = new Date()
    this.content.push({
      type: 'header',
      title,
      subtitle,
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR')
    })
    return this
  }

  addSection(title, content) {
    this.content.push({
      type: 'section',
      title,
      content
    })
    return this
  }

  addTable(headers, data) {
    this.content.push({
      type: 'table',
      headers,
      data
    })
    return this
  }

  generatePDF(filename) {
    // Criar um novo documento
    const printWindow = window.open('', '_blank')
    
    // Estilos para o PDF
    const styles = `
      <style>
        @page {
          margin: 20mm;
          size: A4;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.4;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        
        .header {
          background: linear-gradient(to right, #42b883, #35495e);
          color: white;
          padding: 20px;
          margin: -20px -20px 20px -20px;
          border-radius: 0 0 10px 10px;
        }
        
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        
        .header p {
          margin: 5px 0 0 0;
          opacity: 0.9;
          font-size: 14px;
        }
        
        .header .info {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          font-size: 12px;
          opacity: 0.8;
        }
        
        .section {
          margin: 20px 0;
        }
        
        .section-title {
          color: #42b883;
          border-bottom: 2px solid #42b883;
          padding-bottom: 5px;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: bold;
        }
        
        .table-container {
          margin: 20px 0;
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        
        th {
          background-color: #42b883;
          color: white;
          padding: 10px;
          text-align: left;
          font-weight: bold;
        }
        
        td {
          padding: 8px 10px;
          border-bottom: 1px solid #ddd;
        }
        
        tr:hover {
          background-color: #f5f5f5;
        }
        
        .status-ativo {
          color: #28a745;
          font-weight: bold;
        }
        
        .status-atrasado {
          color: #dc3545;
          font-weight: bold;
        }
        
        .status-devolvido {
          color: #6c757d;
          font-weight: bold;
        }
        
        .summary {
          background-color: #f8f9fa;
          border-left: 4px solid #42b883;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .summary-item:last-child {
          margin-bottom: 0;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 11px;
          color: #666;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .no-print {
            display: none;
          }
          
          .header {
            margin: 0 0 20px 0;
          }
        }
      </style>
    `

    // Construir o HTML do PDF
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${filename}</title>
        <meta charset="UTF-8">
        ${styles}
      </head>
      <body>
    `

    // Processar conteúdo
    this.content.forEach(item => {
      switch(item.type) {
        case 'header':
          html += `
            <div class="header">
              <h1>${item.title}</h1>
              <p>${item.subtitle}</p>
              <div class="info">
                <span>Sistema Bibliotecário - SingletonBib</span>
                <span>${item.date} ${item.time}</span>
              </div>
            </div>
          `
          break

        case 'section':
          html += `
            <div class="section">
              <div class="section-title">${item.title}</div>
              <div>${item.content}</div>
            </div>
          `
          break

        case 'table':
          html += `
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    ${item.headers.map(header => `<th>${header}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${item.data.map(row => `
                    <tr>
                      ${row.map(cell => `<td>${cell}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `
          break
      }
    })

    // Adicionar rodapé
    html += `
        <div class="footer">
          <p>Página ${this.pageNumber} de ${this.totalPages}</p>
          <p>Relatório gerado automaticamente pelo Sistema Bibliotecário</p>
          <p>© ${new Date().getFullYear()} SingletonBib - Todos os direitos reservados</p>
          <button class="no-print" onclick="window.print()" style="
            background: linear-gradient(to right, #42b883, #35495e);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 10px;
          ">
            🖨️ Imprimir / Salvar como PDF
          </button>
        </div>
        
        <script>
          // Auto-focus para impressão
          window.onload = function() {
            window.focus();
          }
        </script>
      </body>
      </html>
    `

    // Escrever no novo documento
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Auto-print após carregar
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }

    return printWindow
  }

  saveAsPDF(filename) {
    return this.generatePDF(filename)
  }

  print() {
    this.generatePDF('Relatório')
  }
}

// Funções específicas para cada relatório
export const generateMultasReport = (multas, usuarios, livros) => {
  const pdf = new PDFGenerator()
  
  // Header
  pdf.addHeader(
    'Relatório de Multas',
    'Sistema de Gerenciamento de Biblioteca'
  )
  
  // Calcular estatísticas
  const totalMultas = multas.length
  const multasAbertas = multas.filter(m => !m.pago).length
  const multasPagas = multas.filter(m => m.pago).length
  const totalValorAberto = multas
    .filter(m => !m.pago)
    .reduce((sum, multa) => sum + (parseFloat(multa.valor) || 0), 0)
  const totalValorPago = multas
    .filter(m => m.pago)
    .reduce((sum, multa) => sum + (parseFloat(multa.valor) || 0), 0)

  // Resumo
  pdf.addSection('Resumo Estatístico', `
    <div class="summary">
      <div class="summary-item">
        <span>Total de Multas:</span>
        <strong>${totalMultas}</strong>
      </div>
      <div class="summary-item">
        <span>Multas em Aberto:</span>
        <strong class="status-atrasado">${multasAbertas}</strong>
      </div>
      <div class="summary-item">
        <span>Multas Pagas:</span>
        <strong class="status-ativo">${multasPagas}</strong>
      </div>
      <div class="summary-item">
        <span>Valor Total em Aberto:</span>
        <strong class="status-atrasado">R$ ${totalValorAberto.toFixed(2)}</strong>
      </div>
      <div class="summary-item">
        <span>Valor Total Recebido:</span>
        <strong class="status-ativo">R$ ${totalValorPago.toFixed(2)}</strong>
      </div>
      <div class="summary-item">
        <span>Valor Total Geral:</span>
        <strong>R$ ${(totalValorAberto + totalValorPago).toFixed(2)}</strong>
      </div>
    </div>
  `)

  // Tabela de Multas
  if (multas.length > 0) {
    const headers = ['ID', 'Usuário', 'Livro', 'Valor (R$)', 'Status', 'Data Criação']
    
    const data = multas.map(multa => {
      const usuario = usuarios.find(u => u.id === multa.usuario_id)
      const livro = livros.find(l => l.id === multa.livro_id)
      const statusClass = multa.pago ? 'status-ativo' : 'status-atrasado'
      
      return [
        `#${multa.id}`,
        usuario?.nome || `Usuário #${multa.usuario_id}`,
        livro?.titulo || `Livro #${multa.livro_id}`,
        `<span class="${statusClass}">${parseFloat(multa.valor || 0).toFixed(2)}</span>`,
        `<span class="${statusClass}">${multa.pago ? '✅ Paga' : '❌ Em Aberto'}</span>`,
        new Date(multa.created_at).toLocaleDateString('pt-BR')
      ]
    })
    
    pdf.addTable(headers, data)
  }

  return pdf
}

export const generateEmprestimosReport = (emprestimos, usuarios, livros) => {
  const pdf = new PDFGenerator()
  
  pdf.addHeader(
    'Relatório de Empréstimos',
    'Histórico de empréstimos da biblioteca'
  )
  
  const totalEmprestimos = emprestimos.length
  const emprestimosAtivos = emprestimos.filter(e => e.status === 'ativo').length
  const emprestimosAtrasados = emprestimos.filter(e => e.status === 'atrasado').length
  const emprestimosDevolvidos = emprestimos.filter(e => e.status === 'devolvido').length

  pdf.addSection('Resumo Estatístico', `
    <div class="summary">
      <div class="summary-item">
        <span>Total de Empréstimos:</span>
        <strong>${totalEmprestimos}</strong>
      </div>
      <div class="summary-item">
        <span>Empréstimos Ativos:</span>
        <strong class="status-ativo">${emprestimosAtivos}</strong>
      </div>
      <div class="summary-item">
        <span>Empréstimos Atrasados:</span>
        <strong class="status-atrasado">${emprestimosAtrasados}</strong>
      </div>
      <div class="summary-item">
        <span>Empréstimos Devolvidos:</span>
        <strong class="status-devolvido">${emprestimosDevolvidos}</strong>
      </div>
      <div class="summary-item">
        <span>Taxa de Devolução:</span>
        <strong>${totalEmprestimos > 0 ? Math.round((emprestimosDevolvidos / totalEmprestimos) * 100) : 0}%</strong>
      </div>
      <div class="summary-item">
        <span>Taxa de Atraso:</span>
        <strong>${totalEmprestimos > 0 ? Math.round((emprestimosAtrasados / totalEmprestimos) * 100) : 0}%</strong>
      </div>
    </div>
  `)

  if (emprestimos.length > 0) {
    const headers = ['ID', 'Usuário', 'Livro', 'Status', 'Data Empréstimo', 'Previsão Devolução']
    
    const data = emprestimos.map(emprestimo => {
      const usuario = usuarios.find(u => u.id === emprestimo.usuario_id)
      const livro = livros.find(l => l.id === emprestimo.livro_id)
      const statusClass = emprestimo.status === 'ativo' ? 'status-ativo' :
                         emprestimo.status === 'atrasado' ? 'status-atrasado' :
                         'status-devolvido'
      
      return [
        `#${emprestimo.id}`,
        usuario?.nome || `Usuário #${emprestimo.usuario_id}`,
        livro?.titulo || `Livro #${emprestimo.livro_id}`,
        `<span class="${statusClass}">${emprestimo.status === 'ativo' ? '🟢 Ativo' :
                                     emprestimo.status === 'atrasado' ? '🔴 Atrasado' :
                                     '⚫ Devolvido'}</span>`,
        new Date(emprestimo.data_emprestimo || emprestimo.created_at).toLocaleDateString('pt-BR'),
        emprestimo.data_prevista_devolucao
          ? new Date(emprestimo.data_prevista_devolucao).toLocaleDateString('pt-BR')
          : '-'
      ]
    })
    
    pdf.addTable(headers, data)
  }

  return pdf
}

export const generateDashboardReport = (stats, allData) => {
  const pdf = new PDFGenerator()
  
  pdf.addHeader(
    'Relatório Geral do Sistema',
    'Dashboard - Visão geral do sistema bibliotecário'
  )
  
  pdf.addSection('Resumo Estatístico', `
    <div class="summary">
      <div class="summary-item">
        <span>Total de Usuários:</span>
        <strong>${stats.usuarios}</strong>
      </div>
      <div class="summary-item">
        <span>Total de Livros:</span>
        <strong>${stats.livros}</strong>
      </div>
      <div class="summary-item">
        <span>Empréstimos Ativos:</span>
        <strong class="status-ativo">${stats.emprestimosAtivos}</strong>
      </div>
      <div class="summary-item">
        <span>Multas em Aberto:</span>
        <strong class="status-atrasado">${stats.multasAbertas}</strong>
      </div>
      <div class="summary-item">
        <span>Reservas Ativas:</span>
        <strong>${stats.reservasAtivas}</strong>
      </div>
      <div class="summary-item">
        <span>Taxa de Ocupação:</span>
        <strong>${stats.taxaOcupacao}%</strong>
      </div>
      <div class="summary-item">
        <span>Livros Disponíveis:</span>
        <strong>${stats.livros - stats.emprestimosAtivos}</strong>
      </div>
    </div>
  `)

  return pdf
}

export const generateLivrosReport = (livros, categorias, stats) => {
  const pdf = new PDFGenerator()
  
  // Header
  pdf.addHeader(
    'Relatório de Livros - Catálogo da Biblioteca',
    'Sistema de Gerenciamento de Biblioteca'
  )
  
  // Estatísticas do catálogo
  pdf.addSection('Resumo Estatístico do Catálogo', `
    <div class="summary">
      <div class="summary-item">
        <span>Total de Livros:</span>
        <strong>${stats.total}</strong>
      </div>
      <div class="summary-item">
        <span>Livros Disponíveis:</span>
        <strong class="status-ativo">${stats.disponiveis}</strong>
      </div>
      <div class="summary-item">
        <span>Livros Emprestados:</span>
        <strong class="status-atrasado">${stats.emprestados}</strong>
      </div>
      <div class="summary-item">
        <span>Novos Livros (30 dias):</span>
        <strong>${stats.novos}</strong>
      </div>
      <div class="summary-item">
        <span>Taxa de Disponibilidade:</span>
        <strong>${stats.total > 0 ? Math.round((stats.disponiveis / stats.total) * 100) : 0}%</strong>
      </div>
    </div>
  `)

  // Distribuição por categorias
  if (categorias && categorias.length > 0) {
    const categoriaStats = categorias.map(categoria => {
      const count = livros.filter(l => l.categoria === categoria).length
      const porcentagem = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
      return { categoria, count, porcentagem }
    })

    pdf.addSection('Distribuição por Categoria', `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Quantidade</th>
              <th>Porcentagem</th>
            </tr>
          </thead>
          <tbody>
            ${categoriaStats.map(stat => `
              <tr>
                <td>${stat.categoria}</td>
                <td>${stat.count}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 100px; height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden;">
                      <div style="width: ${stat.porcentagem}%; height: 100%; background: linear-gradient(to right, #42b883, #35495e);"></div>
                    </div>
                    <span>${stat.porcentagem}%</span>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `)
  }

  // Tabela de Livros
  if (livros.length > 0) {
    const headers = ['ID', 'Título', 'Autor', 'Categoria', 'Cópias', 'Status', 'ISBN', 'Publicado']
    
    const data = livros.map(livro => {
      const statusClass = livro.copias_disponiveis > 0 ? 'status-ativo' : 'status-atrasado'
      const statusText = livro.copias_disponiveis > 0 ? '✅ Disponível' : '❌ Indisponível'
      
      return [
        `#${livro.id}`,
        livro.titulo,
        livro.autor,
        livro.categoria || 'Sem categoria',
        livro.copias_disponiveis.toString(),
        `<span class="${statusClass}">${statusText}</span>`,
        livro.isbn || 'N/A',
        livro.publicado_em ? new Date(livro.publicado_em).toLocaleDateString('pt-BR') : 'N/A'
      ]
    })
    
    pdf.addTable(headers, data)
  } else {
    pdf.addSection('Lista de Livros', `
      <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #666; margin-bottom: 10px;">Nenhum livro encontrado</h3>
        <p style="color: #888;">O catálogo de livros está vazio.</p>
      </div>
    `)
  }

  // Resumo adicional
  pdf.addSection('Resumo do Catálogo', `
    <div class="summary">
      <div class="summary-item">
        <span>Data de Geração do Relatório:</span>
        <strong>${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</strong>
      </div>
      <div class="summary-item">
        <span>Categorias Únicas:</span>
        <strong>${categorias?.length || 0}</strong>
      </div>
      <div class="summary-item">
        <span>Livros Sem Categoria:</span>
        <strong>${livros.filter(l => !l.categoria).length}</strong>
      </div>
      <div class="summary-item">
        <span>Livros Sem ISBN:</span>
        <strong>${livros.filter(l => !l.isbn).length}</strong>
      </div>
    </div>
  `)

  return pdf
}

export const generateUsuariosReport = (usuarios, stats) => {
  const pdf = new PDFGenerator()
  
  // Header
  pdf.addHeader(
    'Relatório de Usuários - Sistema Bibliotecário',
    'Cadastro de Usuários do Sistema'
  )
  
  // Estatísticas do cadastro
  pdf.addSection('Resumo Estatístico do Cadastro', `
    <div class="summary">
      <div class="summary-item">
        <span>Total de Usuários:</span>
        <strong>${stats.total}</strong>
      </div>
      <div class="summary-item">
        <span>Bibliotecários:</span>
        <strong class="status-ativo">${stats.bibliotecarios}</strong>
      </div>
      <div class="summary-item">
        <span>Membros:</span>
        <strong>${stats.membros}</strong>
      </div>
      <div class="summary-item">
        <span>Novos Usuários (30 dias):</span>
        <strong class="status-ativo">${stats.novos}</strong>
      </div>
      <div class="summary-item">
        <span>Porcentagem de Bibliotecários:</span>
        <strong>${stats.total > 0 ? Math.round((stats.bibliotecarios / stats.total) * 100) : 0}%</strong>
      </div>
      <div class="summary-item">
        <span>Taxa de Crescimento Mensal:</span>
        <strong>${stats.total > 10 ? Math.round((stats.novos / stats.total) * 100) : stats.novos > 0 ? '100%' : '0%'}</strong>
      </div>
    </div>
  `)

  // Distribuição por período
  const usuariosPorPeriodo = {
    'Últimos 7 dias': usuarios.filter(u => {
      if (!u.created_at) return false
      const usuarioDate = new Date(u.created_at)
      const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return usuarioDate > seteDiasAtras
    }).length,
    'Últimos 30 dias': stats.novos,
    'Últimos 90 dias': usuarios.filter(u => {
      if (!u.created_at) return false
      const usuarioDate = new Date(u.created_at)
      const noventaDiasAtras = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      return usuarioDate > noventaDiasAtras
    }).length,
    'Mais de 90 dias': usuarios.filter(u => {
      if (!u.created_at) return false
      const usuarioDate = new Date(u.created_at)
      const noventaDiasAtras = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      return usuarioDate <= noventaDiasAtras
    }).length
  }

  pdf.addSection('Distribuição por Período de Cadastro', `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Período</th>
            <th>Quantidade</th>
            <th>Porcentagem</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(usuariosPorPeriodo).map(([periodo, quantidade]) => {
            const porcentagem = stats.total > 0 ? Math.round((quantidade / stats.total) * 100) : 0
            return `
              <tr>
                <td>${periodo}</td>
                <td>${quantidade}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 100px; height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden;">
                      <div style="width: ${porcentagem}%; height: 100%; background: linear-gradient(to right, #42b883, #35495e);"></div>
                    </div>
                    <span>${porcentagem}%</span>
                  </div>
                </td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    </div>
  `)

  // Tabela de Usuários
  if (usuarios.length > 0) {
    const headers = ['ID', 'Nome', 'E-mail', 'Cargo', 'Data Cadastro', 'Status']
    
    const data = usuarios.map(usuario => {
      const cargoClass = usuario.cargo === 'bibliotecario' ? 'status-ativo' : 'status-devolvido'
      const cargoText = usuario.cargo === 'bibliotecario' ? '📚 Bibliotecário' : '👤 Membro'
      
      return [
        `#${usuario.id}`,
        usuario.nome,
        usuario.email,
        `<span class="${cargoClass}">${cargoText}</span>`,
        usuario.created_at ? new Date(usuario.created_at).toLocaleDateString('pt-BR') : 'N/A',
        '✅ Ativo'
      ]
    })
    
    pdf.addTable(headers, data)
  } else {
    pdf.addSection('Lista de Usuários', `
      <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #666; margin-bottom: 10px;">Nenhum usuário encontrado</h3>
        <p style="color: #888;">O cadastro de usuários está vazio.</p>
      </div>
    `)
  }

  // Resumo adicional
  pdf.addSection('Informações Adicionais', `
    <div class="summary">
      <div class="summary-item">
        <span>Data de Geração do Relatório:</span>
        <strong>${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</strong>
      </div>
      <div class="summary-item">
        <span>Total de Domínios de E-mail Únicos:</span>
        <strong>${[...new Set(usuarios.map(u => u.email?.split('@')[1]).filter(Boolean))].length}</strong>
      </div>
      <div class="summary-item">
        <span>Usuários Sem Cargo Definido:</span>
        <strong>${usuarios.filter(u => !u.cargo).length}</strong>
      </div>
      <div class="summary-item">
        <span>Média de Usuários por Dia (30 dias):</span>
        <strong>${(stats.novos / 30).toFixed(1)}</strong>
      </div>
    </div>
  `)

  return pdf
}