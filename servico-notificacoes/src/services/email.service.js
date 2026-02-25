import { emailConfig, templates } from '../config/email.js';
import logger from '../config/logger.js';

// Simulação de envio de email (em produção, usar biblioteca como nodemailer)
class EmailService {
  
  async enviarEmail({ para, assunto, html }) {
    logger.info('Enviando email', { para, assunto });
    
    // Simular envio de email (apenas log por enquanto)
    console.log('\n' + '='.repeat(50));
    console.log(`📧 PARA: ${para}`);
    console.log(`📧 ASSUNTO: ${assunto}`);
    console.log(`📧 CONTEÚDO: ${html.replace(/<[^>]*>/g, ' ')}`);
    console.log('='.repeat(50) + '\n');
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }
  
  async enviarNotificacaoEmprestimo(dados) {
    const template = templates.emprestimo(dados);
    return this.enviarEmail({
      para: dados.email,
      assunto: template.subject,
      html: template.html,
    });
  }
  
  async enviarNotificacaoDevolucao(dados) {
    const template = templates.devolucao(dados);
    return this.enviarEmail({
      para: dados.email,
      assunto: template.subject,
      html: template.html,
    });
  }
  
  async enviarNotificacaoMulta(dados) {
    const template = templates.multa(dados);
    return this.enviarEmail({
      para: dados.email,
      assunto: template.subject,
      html: template.html,
    });
  }
  
  async enviarNotificacaoReserva(dados) {
    const template = templates.reserva(dados);
    return this.enviarEmail({
      para: dados.email,
      assunto: template.subject,
      html: template.html,
    });
  }
}

// Exportar instância única
const emailService = new EmailService();
export default emailService;