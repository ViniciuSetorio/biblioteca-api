import notificacaoService from '../services/notificacao.service.js';
import logger from '../config/logger.js';
import { z } from 'zod';

// Schema de validação
const NotificacaoSchema = z.object({
  tipo: z.enum(['emprestimo', 'devolucao', 'multa', 'reserva']),
  usuarioId: z.number().int().positive(),
  emprestimoId: z.number().int().positive().optional(),
  dados: z.record(z.any()).optional(),
  telefone: z.string().optional(),
});

async function enviarNotificacao(req, res) {
  try {
    // Validar dados de entrada
    const dados = NotificacaoSchema.parse(req.body);
    
    logger.info('Requisição de notificação recebida', dados);
    
    // Processar notificação
    const resultado = await notificacaoService.processarNotificacao(dados);
    
    // Retornar resultado
    return res.status(202).json({
      message: 'Notificação processada',
      timestamp: new Date().toISOString(),
      ...resultado
    });
    
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Dados inválidos',
        detalhes: error.errors
      });
    }
    
    logger.error('Erro ao processar notificação', error);
    return res.status(500).json({
      error: 'Erro interno ao processar notificação'
    });
  }
}

async function statusFila(req, res) {
  try {
    const status = notificacaoService.getStatusFila();
    return res.json(status);
  } catch (error) {
    logger.error('Erro ao obter status da fila', error);
    return res.status(500).json({ error: 'Erro ao obter status da fila' });
  }
}

export default {
  enviarNotificacao,
  statusFila,
};