import axios from "axios";
import axiosRetry from "axios-retry";

// Configuração do Axios com Retry para lidar com a hibernação do Render
const client = axios.create();

axiosRetry(client, {
  retries: 5,
  retryDelay: (retryCount) => {
    console.log(`[Retry] Tentativa ${retryCount} devido a serviço em hibernação...`);
    return axiosRetry.exponentialDelay(retryCount);
  },
  retryCondition: (error) => {
    const isNetworkError = !error.response;
    const isServerError = error.response && [502, 503, 504].includes(error.response.status);
    return isNetworkError || isServerError;
  },
  shouldResetTimeout: true,
});

/**
 * Middleware de Proxy customizado usando Axios com Retry logic
 * @param {string} target - URL de destino do microserviço
 */
export const customProxy = (target) => async (req, res) => {
  const url = `${target}${req.url}`;
  
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
      validateStatus: () => true,
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
    console.error(`Erro no Gateway ao acessar ${url}:`, err.message);
    if (!res.headersSent) {
      res.status(504).json({
        error: "Gateway Timeout",
        message:
          "O serviço de destino demorou muito para responder ou está fora do ar.",
        details: err.message,
      });
    } else {
      res.end();
    }
  }
};
