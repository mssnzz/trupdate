import express from 'express';
import { compare } from 'compare-versions';
import { github } from '../lib/github.js';
import { getReleases } from '../lib/getReleases.js';
import type { Request, Response } from 'express';

const app = express();

interface Parameters {
  current_version: string;
  target: string;
  arch: string;
}

app.get('/update', async (req: Request<{}, {}, {}, Parameters>, res: Response) => {
  if (req.query.current_version && req.query.target && req.query.arch) {
    try {
      const latest = await github();

      if (compare(latest.tag_name, req.query.current_version, '>')) {
        const version = process.env.TAG_STRUCTURE ? latest.tag_name.split(process.env.TAG_STRUCTURE)[1] : latest.tag_name;
        const release = getReleases(latest.assets, req.query.target, req.query.arch);

        if (Object.keys(release).length !== 0) {
          // Construir el objeto JSON de respuesta con el formato deseado
          const responseJson = {
            version: latest.tag_name, // Usar la última versión
            notes: latest.body || "Actualización disponible", // Notas de la actualización
            pub_date: latest.published_at, // Fecha de publicación
            platforms: {
              [`${req.query.target}-${req.query.arch}`]: {
                url: release.url, // URL del archivo de actualización
                signature: release.signature // Firma del archivo
              }
            }
          };

          res.status(200).json(responseJson);
        } else {
          res.status(204).send();
        }
      } else {
        res.status(204).send();
      }
    } catch (error) {
      console.error('Error fetching update information:', error);
      res.status(500).send({
        message: 'Internal server error'
      });
    }
  } else {
    res.status(400).send({
      message: 'Invalid request',
    });
  }
});

app.listen(8080, '0.0.0.0', () => console.log(`Server started at http://0.0.0.0:8080/`));
