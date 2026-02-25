import emailService from './email.service.js';
import smsService from './sms.service.js';
import logger from '../config/logger.js';

class NotificacaoService {
  
  constructor() {
    this.filas = new Map(); // Para controle de notificações pendentes
  }
  
  async processarNotificacao({ tipo, usuarioId, emprestimoId, dados = {} }) {
    logger.info('Processando notificação', { tipo, usuarioId, emprestimoId });
    
    const resultado = {
      tipo,
      usuarioId,
      emprestimoId,
      timestamp: new Date().toISOString(),
      canais: [],
    };
    
    // Buscar dados completos do usuário (via API)
    let usuario = {};
    try {
      const usuariosServiceUrl = process.env.USUARIOS_SERVICE_URL || 'http://servico-usuarios:3001';
      const response = await fetch(`${usuariosServiceUrl}/usuarios/${usuarioId}`);
      if (response.ok) {
        usuario = await response.json();
      }
    } catch (error) {
      logger.error('Erro ao buscar dados do usuário', error);
    }
    
    // Buscar dados do livro se for empréstimo
    let livro = {};
    if (emprestimoId) {
      try {
        const emprestimosServiceUrl = process.env.EMPRESTIMOS_SERVICE_URL || 'http://servico-emprestimos:3003';
        const response = await fetch(`${emprestimosServiceUrl}/emprestimos/${emprestimoId}`);
        if (response.ok) {
          const emprestimo = await response.json();
          
          const livrosServiceUrl = process.env.LIVROS_SERVICE_URL || 'http://servico-livros:3002';
          const livroResponse = await fetch(`${livrosServiceUrl}/livros/${emprestimo.livro_id}`);
          if (livroResponse.ok) {
            livro = await livroResponse.json();
          }
        }
      } catch (error) {
        logger.error('Erro ao buscar dados do empréstimo', error);
      }
    }
    
    // Preparar dados completos para os templates
    const dadosCompletos = {
      ...dados,
      usuarioNome: usuario.nome,
      usuarioEmail: usuario.email,
      usuarioCargo: usuario.cargo,
      livroTitulo: livro.titulo,
      livroAutor: livro.autor,
    };
    
    // Enviar por email se tiver email
    if (usuario.email) {
      try {
        let resultadoEmail;
        
        switch(tipo) {
          case 'emprestimo':
            resultadoEmail = await emailService.enviarNotificacaoEmprestimo({
              email: usuario.email,
              ...dadosCompletos
            });
            break;
          case 'devolucao':
            resultadoEmail = await emailService.enviarNotificacaoDevolucao({
              email: usuario.email,
              ...dadosCompletos
            });
            break;
          case 'multa':
            resultadoEmail = await emailService.enviarNotificacaoMulta({
              email: usuario.email,
              ...dadosCompletos
            });
            break;
          case 'reserva':
            resultadoEmail = await emailService.enviarNotificacaoReserva({
              email: usuario.email,
              ...dadosCompletos
            });
            break;
          default:
            logger.warn('Tipo de notificação desconhecido', { tipo });
        }
        
        if (resultadoEmail) {
          resultado.canais.push({
            tipo: 'email',
            status: 'enviado',
            ...resultadoEmail
          });
        }
      } catch (error) {
        logger.error('Erro ao enviar email', error);
        resultado.canais.push({
          tipo: 'email',
          status: 'erro',
          erro: error.message
        });
      }
    }
    
    // Enviar por SMS se tiver telefone (simulado)
    if (dados.telefone) {
      try {
        const resultadoSms = await smsService.enviarNotificacao(tipo, {
          telefone: dados.telefone,
          ...dadosCompletos
        });
        
        resultado.canais.push({
          tipo: 'sms',
          status: 'enviado',
          ...resultadoSms
        });
      } catch (error) {
        logger.error('Erro ao enviar SMS', error);
        resultado.canais.push({
          tipo: 'sms',
          status: 'erro',
          erro: error.message
        });
      }
    }
    
    // Se não conseguiu enviar por nenhum canal, colocar em fila
    if (resultado.canais.length === 0) {
      this.adicionarNaFila({ tipo, usuarioId, emprestimoId, dados });
      resultado.status = 'na_fila';
    } else {
      resultado.status = 'processado';
    }
    
    return resultado;
  }
  
  adicionarNaFila(notificacao) {
    const id = `fila_${Date.now()}_${Math.random()}`;
    this.filas.set(id, {
      ...notificacao,
      criadoEm: new Date().toISOString(),
      tentativas: 0
    });
    
    logger.info('Notificação adicionada à fila', { id, ...notificacao });
    
    // Tentar processar novamente em 1 minuto
    setTimeout(() => this.processarFila(), 60000);
    
    return id;
  }
  
  async processarFila() {
    logger.info('Processando fila de notificações', { tamanho: this.filas.size });
    
    for (const [id, notificacao] of this.filas.entries()) {
      try {
        notificacao.tentativas++;
        
        // Tentar processar novamente
        await this.processarNotificacao(notificacao);
        
        // Se chegou aqui, remove da fila
        this.filas.delete(id);
        logger.info('Notificação processada da fila', { id });
      } catch (error) {
        logger.error('Erro ao processar notificação da fila', { id, error });
        
        // Se tentou mais de 3 vezes, remove da fila
        if (notificacao.tentativas >= 3) {
          this.filas.delete(id);
          logger.error('Notificação removida da fila após 3 tentativas', { id });
        }
      }
    }
  }
  
  getStatusFila() {
    return {
      tamanho: this.filas.size,
      notificacoes: Array.from(this.filas.entries()).map(([id, n]) => ({
        id,
        ...n
      }))
    };
  }
}

// Exportar instância única
const notificacaoService = new NotificacaoService();
export default notificacaoService;