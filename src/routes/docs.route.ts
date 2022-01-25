import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerDefinition from '../docs/swaggerDef';

const router = express.Router();

const specs = swaggerJSDoc({
  swaggerDefinition,
  apis: ['src/docs/*.yml', 'src/routes/*.ts'],
});

router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(specs, {
    explorer: true,
  })
);

export default router;
