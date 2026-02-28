import logger from '../config/logger.js';

const smsService = {
  enviarNotificacao: async (tipo, dados) => {
    logger.info(`[SMS] Simulando envio para ${dados.telefone}`, { tipo, ...dados });
    
    // Simulação de delay
    await new Date().setMilliseconds(new Date().getMilliseconds() + 300);
    
    return {
      success: true,
      provider: 'MockSMSProvider',
      messageId: `sms_${Date.now()}`
    };
  }
};

export default smsService;
