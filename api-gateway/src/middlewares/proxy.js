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
    const response = await client({
      method: req.method,
      url: url,
      data: req,
      headers: { 
        ...req.headers,
        host: new URL(target).host
      },
      responseType: 'stream',
      validateStatus: () => true,
      maxRedirects: 0
    });

    res.status(response.status);
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    response.data.pipe(res);
  } catch (err) {
    console.error(`Erro no Gateway ao acessar ${url}:`, err.message);
    res.status(504).json({ 
      error: "Gateway Timeout", 
      message: "O serviço de destino demorou muito para responder ou está fora do ar.",
      details: err.message 
    });
  }
};
