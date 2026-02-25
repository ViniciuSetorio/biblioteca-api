// Configuração para envio de emails (simulada por enquanto)
// Em produção, você usaria um serviço como SendGrid, AWS SES, etc.

const emailConfig = {
  // Configurações SMTP (exemplo)
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'notificacoes@biblioteca.com',
    pass: process.env.SMTP_PASS || 'senha123',
  },
  from: process.env.EMAIL_FROM || 'sistema@biblioteca.com',
};

// Templates de email
const templates = {
  emprestimo: (dados) => ({
    subject: '📚 Confirmação de Empréstimo - Biblioteca',
    html: `
      <h2>Olá, ${dados.usuarioNome || 'usuário'}!</h2>
      <p>Seu empréstimo do livro <strong>"${dados.livroTitulo || 'desconhecido'}"</strong> foi realizado com sucesso.</p>
      <p>Data de devolução prevista: <strong>${dados.dataDevolucao || 'N/A'}</strong></p>
      <p>Boa leitura! 📖</p>
    `,
  }),
  
  devolucao: (dados) => ({
    subject: '✅ Devolução Registrada - Biblioteca',
    html: `
      <h2>Olá, ${dados.usuarioNome || 'usuário'}!</h2>
      <p>A devolução do livro <strong>"${dados.livroTitulo || 'desconhecido'}"</strong> foi registrada.</p>
      <p>Obrigado por utilizar nossa biblioteca!</p>
    `,
  }),
  
  multa: (dados) => ({
    subject: '⚠️ Multa Gerada - Biblioteca',
    html: `
      <h2>Olá, ${dados.usuarioNome || 'usuário'}!</h2>
      <p>Uma multa no valor de <strong>R$ ${dados.valorMulta || '0,00'}</strong> foi gerada devido ao atraso na devolução do livro <strong>"${dados.livroTitulo || 'desconhecido'}"</strong>.</p>
      <p>Por favor, regularize sua situação o quanto antes.</p>
    `,
  }),
  
  reserva: (dados) => ({
    subject: '📅 Reserva Confirmada - Biblioteca',
    html: `
      <h2>Olá, ${dados.usuarioNome || 'usuário'}!</h2>
      <p>Sua reserva do livro <strong>"${dados.livroTitulo || 'desconhecido'}"</strong> foi confirmada.</p>
      <p>A reserva expira em <strong>2 dias</strong>. Retire o livro na biblioteca até lá.</p>
    `,
  }),
};

export { emailConfig, templates };