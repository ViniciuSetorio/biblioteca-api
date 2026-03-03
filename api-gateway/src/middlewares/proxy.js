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
      console.error(`Erro final no Gateway ao acessar ${url}:`, err.message);
      if (!res.headersSent) {
        res.status(err.response?.status || 504).json({
          error: "Gateway Error",
          message:
            "O serviço de destino não pôde ser alcançado ou retornou um erro persistente.",
          details: err.message,
        });
      } else {
        res.end();
      }
    }
};
