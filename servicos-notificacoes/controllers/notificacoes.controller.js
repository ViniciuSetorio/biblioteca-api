async function enviarNotificacao(req, res) {
  const { tipo, usuarioId, emprestimoId } = req.body;

  // Simular envio de notificação
  console.log(`[NOTIFICAÇÃO] Enviando ${tipo} para usuário ${usuarioId}`);
  
  // Aqui você implementaria o envio real (email, SMS, push, etc.)
  // Por enquanto, apenas log e retorno sucesso

  return res.status(202).json({ 
    message: "Notificação recebida para processamento",
    tipo,
    usuarioId,
    emprestimoId
  });
}

export default {
  enviarNotificacao,
};