import axios from "axios";
import axiosRetry from "axios-retry";

// Configuração do Axios com Retry para lidar com a hibernação do Render
const client = axios.create();

axiosRetry(client, {
  retries: 5,
  retryDelay: () => {
    console.log("[Retry] Aguardando 5 segundos para a próxima tentativa...");
    return 5000;
  },
  retryCondition: (error) => {
    const isNetworkError = !error.response;
    const isServerError =
      error.response && [502, 503, 504].includes(error.response.status);
    return isNetworkError || isServerError;
  },
  shouldResetTimeout: true,
});

/**
 * Middleware de Proxy customizado usando Axios com Retry logic
 * @param {string} target - URL de destino do microserviço
 */
export const customProxy = (target) => async (req, res) => {
    const url = `${target}${req.originalUrl}`;

    try {
      const isGetOrHead = ["GET", "HEAD"].includes(req.method.toUpperCase());

      const response = await client({
        method: req.method,
        url: url,
        data: isGetOrHead ? undefined : req,
        headers: {
          ...req.headers,
          host: new URL(target).host,
        },
        responseType: "stream",
        validateStatus: (status) => status < 500,
        maxRedirects: 0,
      });

      res.status(response.status);

      Object.entries(response.headers).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (
          [
            "content-encoding",
            "content-length",
            "transfer-encoding",
            "connection",
            "keep-alive",
          ].includes(lowerKey)
        ) {
          return;
        }
        res.setHeader(key, value);
      });

      // Pipe do stream de resposta direto para o Express
      response.data.pipe(res);

      response.data.on("error", (err) => {
        console.error(`Erro no stream ao acessar ${url}:`, err.message);
        if (!res.headersSent) {
          res.status(500).json({ error: "Stream Error", message: err.message });
        }
        res.end();
      });
    } catch (err) {
      console.error(`❌ Erro final no Gateway ao acessar ${url}:`, err.message);

      let errorDetails = err.message;
      let statusCode = err.response?.status || 504;

      // Se o erro veio do serviço de destino, tentamos ler o corpo do erro
      // Nota: como responseType é 'stream', err.response.data também é um stream
      if (err.response?.data) {
        try {
          const stream = err.response.data;
          const chunks = [];
          for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
          }
          const body = Buffer.concat(chunks).toString("utf8");
          console.error(`📝 Detalhes do erro do serviço (${url}):`, body);
          try {
            // Tenta parsear se for JSON para facilitar a leitura
            errorDetails = JSON.parse(body);
          } catch {
            errorDetails = body;
          }
        } catch (e) {
          console.error("Falha ao ler corpo do erro do stream:", e.message);
        }
      }

      if (!res.headers_sent && !res.headersSent) {
        res.status(statusCode).json({
          error: "Gateway Error",
          serviceUrl: url,
          message:
            "O serviço de destino retornou um erro ou não pôde ser alcançado.",
          details: errorDetails,
        });
      } else {
        res.end();
      }
    }
};
