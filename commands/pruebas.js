// ❆ 𝖸𝖳𝖬𝖯𝟥 
// Hecho por Ado :D
import axios from 'axios';

async function downloadYoutubeShort(videoUrl) {
  try {
    const cfApiUrl = 'https://api.nekolabs.web.id/tools/bypass/cf-turnstile';
    const cfPayload = {
      url: 'https://ezconv.cc',
      siteKey: '0x4AAAAAAAi2NuZzwS99-7op'
    };
    
    const { data: cfResponse } = await axios.post(cfApiUrl, cfPayload);
    
    if (!cfResponse.success || !cfResponse.result) {
      return {
        success: false,
        error: 'No se pudo obtener el token de captcha'
      };
    }
    
    const captchaToken = cfResponse.result;
    
    const convertApiUrl = 'https://ds1.ezsrv.net/api/convert';
    const convertPayload = {
      url: videoUrl,
      quality: '320',
      trim: false,
      startT: 0,
      endT: 0,
      captchaToken: captchaToken
    };
    
    const { data: convertResponse } = await axios.post(convertApiUrl, convertPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (convertResponse.status !== 'done') {
      return {
        success: false,
        error: `La conversión falló. Estado: ${convertResponse.status}`
      };
    }
    
    return {
      success: true,
      data: {
        title: convertResponse.title,
        downloadUrl: convertResponse.url,
        status: convertResponse.status
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.response?.data ? error.response.data : error.message
    };
  }
}

const youtubeShortUrl = ''; // Aquí la URL del vídeo a descargar!

downloadYoutubeShort(youtubeShortUrl)
  .then(response => {
    console.log(JSON.stringify(response, null, 2));
  })
  .catch(error => {
    console.log(JSON.stringify({ success: false, error: error.message }, null, 2));
  });
